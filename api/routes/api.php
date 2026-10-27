<?php

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/order', [OrderController::class, 'createOrder'])
  ->middleware('throttle:5,10');

Route::post('/order', [OrderController::class, 'createOrder'])
  ->withoutMiddleware([ValidateCsrfToken::class]);

