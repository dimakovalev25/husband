<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuestionRequest;
use App\Models\Question;
use Illuminate\Support\Facades\Http;

class QuestionController extends Controller
{
    public function createQuestion(QuestionRequest $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:30',
            'question' => 'required|string|max:1000',
        ]);

        Question::create($data);

      try {
        $text = "🔥 <b>Новый ВОПРОС!! от посетителя </b>\n"
          . "Имя: {$data['name']}\n"
          . "Телефон: {$data['phone']}\n"
          . "Текст вопроса: {$data['question']}";

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
