<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRequest;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Throwable;
use App\Services\YandexCaptcha;

class OrderController extends Controller
{
  public function createOrder(StoreRequest $request): JsonResponse
  {
    $data = $request->validated();
    $storedPhotos = [];

      if (!YandexCaptcha::verify($r->input('smart_token'), $r->ip())) {
      return response()->json([
        'message' => 'Проверка капчи не пройдена. Попробуйте ещё раз.',
        'errors' => ['smart_token' => ['Проверка капчи не пройдена.']],
      ], 422);
    }


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
