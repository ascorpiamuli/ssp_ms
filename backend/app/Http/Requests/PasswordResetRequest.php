<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PasswordResetRequest extends FormRequest
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
      'token' => 'required|string',
      'email' => 'required|email|exists:users,email',
      'password' => 'required|string|min:8|confirmed',
      'password_confirmation' => 'required|string|min:8',
    ];
  }

  /**
   * Get the error messages for the defined validation rules.
   */
  public function messages(): array
  {
    return [
      'token.required' => 'Reset token is required',
      'email.required' => 'Email address is required',
      'email.email' => 'Please enter a valid email address',
      'email.exists' => 'We could not find a user with this email address',
      'password.required' => 'Password is required',
      'password.min' => 'Password must be at least 8 characters',
      'password.confirmed' => 'Password confirmation does not match',
      'password_confirmation.required' => 'Please confirm your new password',
      'password_confirmation.min' => 'Password confirmation must be at least 8 characters',
    ];
  }
}
