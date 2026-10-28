<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
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
                'max:100',
            ],
            'phone' => [
                'required',
                'string',
                'max:30',
                'regex:/^\+375[\s(]*\d{2,3}[\s)]*[\d\s-]{6,15}$/',
            ],
            'district' => [
                Rule::in(config('handyman.districts', [])),
            ],
            'address' => [
                'nullable',
                'string',
                'max:200',
            ],
            'description' => [
                'required',
                'string',
                'min:10',
                'max:2000',
            ],
            'preferred_date' => [
                'date_format:Y-m-d',
                'after_or_equal:today',
            ],
            'preferred_time' => [
                'date_format:H:i',
            ],
            'estimated_hours' => [
                'integer',
                'between:1,8',
            ],
/*            'consent' => [
                'accepted',
            ],*/
            'services' => [
              'required',
                'array',
                'min:1',
                'max:10',
            ],
            'services.*' => [
                'string',
                'distinct',
                Rule::in(config('handyman.services', [])),
            ],
            'website' => [
                'nullable',
                'string',
                'max:0',
            ],
            'photos' => [
                'nullable',
                'array',
                'max:5',
            ],
            'photos.*' => [
                'file',
                'mimes:jpg,jpeg,png',
                'max:5120',
                'dimensions:max_width=6000,max_height=6000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'website.max' => 'Не удалось проверить заявку.',
            'photos.max' => 'Можно приложить не более 5 фотографий.',
            'photos.*.max' => 'Размер каждой фотографии не должен превышать 5 МБ.',
            'photos.*.mimes' => 'Допускаются только JPG и PNG.',
            'services.*.in' => 'Выбрана неизвестная услуга.',
            'district.in' => 'Выбран неизвестный район.',
        ];
    }
}
