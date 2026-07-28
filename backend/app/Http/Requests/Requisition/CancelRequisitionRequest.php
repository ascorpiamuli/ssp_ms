<?php
// app/Http/Requests/Requisition/CancelRequisitionRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Requisition;

use Illuminate\Foundation\Http\FormRequest;

class CancelRequisitionRequest extends FormRequest
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
      'reason' => ['required', 'string', 'min:5', 'max:1000'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'reason.required' => 'Please provide a reason for cancelling the requisition.',
      'reason.min' => 'Reason must be at least 5 characters.',
      'reason.max' => 'Reason cannot exceed 1000 characters.',
    ];
  }
}
