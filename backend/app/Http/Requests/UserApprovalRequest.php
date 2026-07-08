<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserApprovalRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'action' => 'required|string|in:approve,reject',
      'reason' => 'required_if:action,reject|string|max:500',
    ];
  }

  public function messages(): array
  {
    return [
      'action.required' => 'Action is required',
      'action.in' => 'Action must be either approve or reject',
      'reason.required_if' => 'Rejection reason is required when rejecting a user',
    ];
  }
}
