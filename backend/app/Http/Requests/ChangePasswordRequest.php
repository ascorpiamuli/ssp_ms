<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return true; // Must be true for authenticated users
  }

  /**
   * Get the validation rules that apply to the request.
   */
  public function rules(): array
  {
    return [
      'current_password' => 'required|string|current_password',
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
      'current_password.required' => 'Current password is required',
      'current_password.current_password' => 'Current password is incorrect',
      'password.required' => 'New password is required',
      'password.min' => 'New password must be at least 8 characters',
      'password.confirmed' => 'Password confirmation does not match',
      'password_confirmation.required' => 'Please confirm your new password',
      'password_confirmation.min' => 'Password confirmation must be at least 8 characters',
    ];
  }
}
