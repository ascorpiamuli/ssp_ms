<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $id = $this->route('id');

    return [
      'first_name' => 'required|string|max:255',
      'last_name' => 'required|string|max:255',
      'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($id)],
      'phone' => ['nullable', 'string', 'max:20', Rule::unique('users')->ignore($id)],
      'id_number' => 'nullable|string|max:50',
      'date_of_birth' => 'nullable|date',
      'role' => ['required', 'string', Rule::in(['ADMIN', 'STAFF', 'HOD', 'ACCOUNTANT', 'PRINCIPAL', 'FINAL_APPROVER', 'PROCUREMENT', 'SUPPLIER', 'AUDITOR'])],
      'department_id' => 'nullable|exists:departments,id',
      'password' => 'required|string|min:8|confirmed',
      'is_approved' => 'sometimes|boolean',
      'timezone' => 'nullable|string|timezone',
    ];
  }

  public function messages(): array
  {
    return [
      'first_name.required' => 'First name is required',
      'last_name.required' => 'Last name is required',
      'email.required' => 'Email is required',
      'email.email' => 'Please enter a valid email address',
      'email.unique' => 'This email is already registered',
      'role.required' => 'Please select a role',
      'role.in' => 'Invalid role selected',
      'password.required' => 'Password is required',
      'password.min' => 'Password must be at least 8 characters',
      'password.confirmed' => 'Password confirmation does not match',
      'department_id.exists' => 'Selected department does not exist',
    ];
  }
}
