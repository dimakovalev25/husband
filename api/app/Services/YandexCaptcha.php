<?php


namespace App\Services;

use Illuminate\Support\Facades\Http;

class YandexCaptcha
{
  public static function verify(?string $token, ?string $ip = null): bool
  {
    $secret = config('services.smartcaptcha.secret');

    if (!$secret || !$token) {
      return false;
    }

    try {
      $res = Http::asForm()
        ->timeout(5)
        ->post('https://smartcaptcha.yandexcloud.net/validate', [
          'secret' => $secret,
          'token' => $token,
          'ip' => $ip,
        ]);

      return $res->successful() && $res->json('status') === 'ok';
    } catch (\Throwable $e) {
      report($e);
      return false;
    }
  }
}