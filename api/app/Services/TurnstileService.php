<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TurnstileService
{
    public function verify(?string $token, ?string $ip): bool
    {
        if (
            ! $token ||
            ! config('services.turnstile.secret_key') ||
            ! config('services.turnstile.hostname')
        ) {
            return false;
        }

        try {
            $response = Http::asForm()
                ->connectTimeout(3)
                ->timeout(5)
                ->post(
                    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                    [
                        'secret' => config('services.turnstile.secret_key'),
                        'response' => $token,
                        'remoteip' => $ip,
                    ]
                );

            if (! $response->successful()) {
                return false;
            }

            $result = $response->json();

            return ($result['success'] ?? false) === true
              && ($result['hostname'] ?? null) === config('services.turnstile.hostname')
              && ($result['action'] ?? null) === 'order_request';
        } catch (\Throwable $exception) {
            report($exception);

            return false;
        }
    }
}
