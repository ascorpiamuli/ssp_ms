<?php
// app/Http/Requests/Budget/ApproveBudgetRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Budget;

use Illuminate\Foundation\Http\FormRequest;

class ApproveBudgetRequest extends FormRequest
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
   * @return array<string, mixed>
   */
  public function rules(): array
  {
    return [
      'notes' => ['nullable', 'string', 'max:1000'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'notes.max' => 'Notes cannot exceed 1000 characters.',
    ];
  }
}
