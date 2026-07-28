<?php
// app/Http/Requests/Requisition/SubmitRequisitionRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Requisition;

use Illuminate\Foundation\Http\FormRequest;

class SubmitRequisitionRequest extends FormRequest
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
      'comment' => ['nullable', 'string', 'max:1000'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'comment.max' => 'Comment cannot exceed 1000 characters.',
    ];
  }
}
