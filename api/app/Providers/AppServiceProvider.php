<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /*    RateLimiter::for('order-requests', function (Request $request) {
              return [
                Limit::perMinutes(10, 3)
                  ->by('order:'.$request->ip()),

                Limit::perDay(10)
                  ->by('order-day:'.$request->ip()),
              ];
            });*/
    }
}
