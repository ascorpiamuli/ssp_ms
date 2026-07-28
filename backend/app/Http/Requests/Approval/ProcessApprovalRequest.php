<?php
// app/Http/Requests/Approval/ProcessApprovalRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Approval;

use Illuminate\Foundation\Http\FormRequest;

class ProcessApprovalRequest extends FormRequest
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
    $action = $this->input('action');

    return [
      'action' => ['required', 'in:approved,declined,returned'],
      'reason' => [
        'nullable',
        'required_if:action,declined,returned',
        'string',
        'min:5',
        'max:1000'
      ],
      'comment' => ['nullable', 'string', 'max:1000'],
      'user_id' => ['nullable', 'exists:users,id'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'action.required' => 'Action is required.',
      'action.in' => 'Invalid action. Must be approved, declined, or returned.',
      'reason.required_if' => 'Reason is required when declining or returning.',
      'reason.min' => 'Reason must be at least 5 characters.',
      'reason.max' => 'Reason cannot exceed 1000 characters.',
    ];
  }
}
