<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class QuestionRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return true;
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      'name' => [
        'required',
        'string',
        'min:2',
        'max:50',
      ],
      'phone' => [
        'required',
        'string',
        'max:30',
        'regex:/^\+375[\s(]*\d{2,3}[\s)]*[\d\s-]{6,15}$/',
      ],
      'question' => [
        'required',
        'string',
        'max:160',
      ]
    ];
  }
}
