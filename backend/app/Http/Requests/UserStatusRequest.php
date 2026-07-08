<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserStatusRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'status' => 'required|string|in:activate,deactivate',
    ];
  }

  public function messages(): array
  {
    return [
      'status.required' => 'Status action is required',
      'status.in' => 'Status must be either activate or deactivate',
    ];
  }
}
