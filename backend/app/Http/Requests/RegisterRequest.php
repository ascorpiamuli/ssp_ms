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
            // ADDED 'ADMIN' to the allowed roles
            'role' => ['required', 'string', Rule::in(['ADMIN', 'STAFF', 'HOD', 'ACCOUNTANT', 'PRINCIPAL', 'FINAL_APPROVER', 'PROCUREMENT', 'SUPPLIER', 'AUDITOR'])],
            'department' => 'nullable|string|max:255',
            'timezone' => 'nullable|string|timezone',

            // Password
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',

            // Supplier specific fields
            'company_name' => 'required_if:role,SUPPLIER|string|max:255',
            'company_email' => 'required_if:role,SUPPLIER|email|max:255|unique:suppliers,company_email',
            'company_phone' => 'nullable|string|max:20',
            'company_registration' => 'required_if:role,SUPPLIER|string|max:255|unique:suppliers,company_registration',
            'company_address' => 'required_if:role,SUPPLIER|string|max:500',
            'company_website' => 'nullable|url|max:255',
            'tax_id' => 'nullable|string|max:50',
            'supplier_category' => 'required_if:role,SUPPLIER|string|in:goods,services,both',

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

            // Supplier specific
            'company_name.required_if' => 'Company name is required for suppliers',
            'company_email.required_if' => 'Company email is required for suppliers',
            'company_email.email' => 'Please enter a valid company email',
            'company_email.unique' => 'This company email is already registered',
            'company_registration.required_if' => 'Company registration number is required for suppliers',
            'company_registration.unique' => 'This registration number is already used',
            'company_address.required_if' => 'Company address is required for suppliers',
            'company_website.url' => 'Please enter a valid website URL',
            'supplier_category.required_if' => 'Supplier category is required',
            'supplier_category.in' => 'Invalid supplier category',

            // Terms
            'agree_terms.accepted' => 'You must agree to the terms and conditions',
        ];
    }
}
