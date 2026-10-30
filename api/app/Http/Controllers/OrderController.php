<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRequest;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Throwable;

class OrderController extends Controller
{

  private function verifyTurnstile(string $token, ?string $ip = null): bool
  {
    $secret = config('services.turnstile.secret');

    if (!$secret || !$token) {
      return false;
    }

    try {
      $response = Http::asForm()
        ->timeout(10)
        ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
          'secret' => $secret,
          'response' => $token,
          'remoteip' => $ip,
        ]);

      if (!$response->successful()) {
        report(new \RuntimeException(
          'Turnstile Siteverify HTTP error: ' . $response->status()
        ));

        return false;
      }

      $result = $response->json();

      if (!($result['success'] ?? false)) {
        report(new \RuntimeException(
          'Turnstile verification failed: ' .
          json_encode($result['error-codes'] ?? [])
        ));

        return false;
      }

      return true;
    } catch (\Throwable $e) {
      report($e);

      return false;
    }
  }

  public function createOrder(StoreRequest $request): JsonResponse
  {
    $data = $request->validated();
    $storedPhotos = [];

    $turnstileToken = $request->input('cf-turnstile-response');

    /*      if (!$this->verifyTurnstile($turnstileToken, $request->ip())) {
            return response()->json([
              'message' => 'Проверка Cloudflare не пройдена. Обновите проверку и попробуйте снова.',
            ], 422);
          }*/

    try {
      foreach ($request->file('photos', []) as $photo) {
        $storedPhotos[] = $photo->store('orders', 'local');
      }

      $order = DB::transaction(function () use ($data, $storedPhotos) {
        return Order::create([
          'name' => $data['name'],
          'phone' => $data['phone'],
          'district' => $data['district'],
          'address' => $data['address'] ?? null,
          'description' => $data['description'],
          'preferred_date' => $data['preferred_date'],
          'preferred_time' => $data['preferred_time'],
          'estimated_hours' => $data['estimated_hours'],
          'consent' => true,
          'services' => $data['services'],
          'photos' => $storedPhotos,
        ]);
      });

      try {
        $text = "🔥 <b>Новый заказ #{$order->id}</b>\n"
          . "Имя: {$order->name}\n"
          . "Телефон: {$order->phone}\n"
          . "Район: {$order->district}\n"
          . "Адрес: " . ($order->address ?? '—') . "\n"
          . "Дата: {$order->preferred_date} {$order->preferred_time}\n"
          . "Часы: {$order->estimated_hours}\n"
          . "Услуги: " . implode(', ', $order->services ?? []) . "\n"
          . "Описание: {$order->description}";

        Http::timeout(5)->post(
          'https://api.telegram.org/bot' . config('services.telegram.token') . '/sendMessage',
          [
            'chat_id' => config('services.telegram.chat_id'),
            'text' => $text,
            'parse_mode' => 'HTML',
          ]
        );
      } catch (\Throwable $e) {
        report($e); // заказ уже создан, телега упала — не роняем ответ
      }


      return response()->json([
        'id' => $order->id,
        'message' => 'Заявка принята.',
      ], 201);
    } catch (Throwable $exception) {
      foreach ($storedPhotos as $path) {
        Storage::disk('local')->delete($path);
      }

      report($exception);

      return response()->json([
        'message' => 'Не удалось сохранить заявку. Попробуйте позже.',
      ], 500);
    }
  }
}
