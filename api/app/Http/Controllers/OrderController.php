<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRequest;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class OrderController extends Controller
{
    public function show()
    {
        var_dump('show method here!!!!!');
    }

    public function store(StoreRequest $request)
    {
        dd($request->all());
    }

    public function store2(StoreRequest $request): JsonResponse
    {
        $data = $request->validated();
        $storedPhotos = [];

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
