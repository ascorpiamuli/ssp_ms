<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return true; // Public endpoint - must return true
  }

  /**
   * Get the validation rules that apply to the request.
   */
  public function rules(): array
  {
    return [
      'email' => 'required|email|exists:users,email',
    ];
  }

  /**
   * Get the error messages for the defined validation rules.
   */
  public function messages(): array
  {
    return [
      'email.required' => 'Email address is required',
      'email.email' => 'Please enter a valid email address',
      'email.exists' => 'We could not find a user with this email address',
    ];
  }
}
