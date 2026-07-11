<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
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
            // Personal Information
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'id_number' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date',
            'role' => ['required', 'string', Rule::in(['ADMIN', 'STAFF', 'HOD', 'ACCOUNTANT', 'PRINCIPAL', 'FINAL_APPROVER', 'PROCUREMENT', 'SUPPLIER', 'AUDITOR'])],
            'department' => 'nullable|string|max:255',
            'timezone' => 'nullable|string|timezone',

            // Password
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',

            // ⚠️ REMOVED supplier field requirements - they will be handled separately
            // Supplier profile will be completed after registration/approval

            // Terms
            'agree_terms' => 'accepted',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            // Personal Information
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'email.required' => 'Email address is required',
            'email.email' => 'Please enter a valid email address',
            'email.unique' => 'This email is already registered',
            'phone.required' => 'Phone number is required',
            'role.required' => 'Please select a role',
            'role.in' => 'Invalid role selected',

            // Password
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'password.confirmed' => 'Password confirmation does not match',
            'password_confirmation.required' => 'Please confirm your password',
            'password_confirmation.min' => 'Password confirmation must be at least 8 characters',

            // Terms
            'agree_terms.accepted' => 'You must agree to the terms and conditions',
        ];
    }
}
