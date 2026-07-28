<?php
// app/Http/Requests/Approval/DelegateApprovalRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Approval;

use Illuminate\Foundation\Http\FormRequest;

class DelegateApprovalRequest extends FormRequest
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
      'delegate_id' => ['required', 'exists:users,id', 'different:user_id'],
      'comment' => ['nullable', 'string', 'max:1000'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'delegate_id.required' => 'Please select a delegate user.',
      'delegate_id.exists' => 'The selected delegate does not exist.',
      'delegate_id.different' => 'You cannot delegate to yourself.',
    ];
  }
}
