<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuestionRequest;
use App\Models\Question;
use App\Services\YandexCaptcha;
use Illuminate\Support\Facades\Http;

class QuestionController extends Controller
{
  public function createQuestion(QuestionRequest $r)
  {
    if (!YandexCaptcha::verify($r->input('smart_token'), $r->ip())) {
      return response()->json([
        'message' => 'Проверка капчи не пройдена. Попробуйте ещё раз.',
        'errors' => ['smart_token' => ['Проверка капчи не пройдена.']],
      ], 422);
    }

    $data = $r->validated();

    Question::create($data);

    try {
      $text = "🔥 <b>Новый ВОПРОС!! от посетителя </b>\n"
        . "Имя: " . e($data['name']) . "\n"
        . "Телефон: " . e($data['phone']) . "\n"
        . "Текст вопроса: " . e($data['question']);

      Http::timeout(5)->post(
        'https://api.telegram.org/bot' . config('services.telegram.token') . '/sendMessage',
        [
          'chat_id' => config('services.telegram.chat_id'),
          'text' => $text,
          'parse_mode' => 'HTML',
        ]
      );
    } catch (\Throwable $e) {
      report($e);
    }

    return response()->json(['ok' => true], 201);
  }
}