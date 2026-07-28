<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\User;

class SupplierRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $id = $this->route('id');
    $userId = $this->input('user_id');

    return [
      // Company Information
      'company_name' => 'required|string|max:255',
      'company_email' => [
        'required',
        'email',
        'max:255',
        Rule::unique('suppliers')->ignore($id),
        // Check if email already exists in users table
        function ($attribute, $value, $fail) use ($userId) {
          // If user_id is provided, check if it's their own email
          if ($userId) {
            $user = User::find($userId);
            if ($user && $user->email === $value) {
              return; // It's their own email, allow it
            }
          }

          // Check if email exists in users table
          $existingUser = User::where('email', $value)->first();
          if ($existingUser) {
            // If user_id is provided but doesn't match the existing user
            if ($userId && $existingUser->id != $userId) {
              $fail('This email is already registered to another user.');
            } elseif (!$userId) {
              $fail('This email is already registered. Please use a different email.');
            }
          }
        }
      ],
      'company_phone' => 'nullable|string|max:20',
      'company_registration' => [
        'required',
        'string',
        'max:255',
        Rule::unique('suppliers')->ignore($id)
      ],
      'company_address' => 'required|string|max:500',
      'company_website' => 'nullable|url|max:255',
      'tax_id' => 'nullable|string|max:50',
      'category' => ['required', 'string', Rule::in(['goods', 'services', 'both'])],

      // New Company Details
      'description' => 'nullable|string|max:1000',
      'established_year' => 'nullable|string|max:4',
      'employee_count' => 'nullable|string|max:50',
      'annual_revenue' => 'nullable|string|max:50',
      'certifications' => 'nullable|string|max:500',
      'registration_date' => 'nullable|date',
      'license_number' => 'nullable|string|max:100',

      // Banking Information
      'bank_name' => 'nullable|string|max:255',
      'bank_account' => 'nullable|string|max:50',
      'bank_branch' => 'nullable|string|max:255',
      'payment_terms' => 'nullable|string|max:100',
      'preferred_currency' => 'nullable|string|max:10',

      // Contact Person
      'contact_person_name' => 'nullable|string|max:255',
      'contact_person_email' => 'nullable|email|max:255',
      'contact_person_phone' => 'nullable|string|max:20',

      // Company Logo
      'company_logo' => 'nullable|image|max:5120|mimes:jpeg,png,jpg,gif,svg,webp',

      // User ID (for existing users)
      'user_id' => 'nullable|exists:users,id',

      // Contact Person (if creating new user)
      'contact_person_first_name' => 'nullable|string|max:255',
      'contact_person_last_name' => 'nullable|string|max:255',
      'password' => 'nullable|string|min:8|confirmed',
    ];
  }

  public function messages(): array
  {
    return [
      // Company Information
      'company_name.required' => 'Company name is required',
      'company_email.required' => 'Company email is required',
      'company_email.email' => 'Please enter a valid company email',
      'company_email.unique' => 'This company email is already registered',
      'company_registration.required' => 'Company registration number is required',
      'company_registration.unique' => 'This registration number is already used',
      'company_address.required' => 'Company address is required',
      'category.required' => 'Supplier category is required',
      'category.in' => 'Invalid supplier category. Must be goods, services, or both',

      // New Company Details
      'established_year.max' => 'The established year must be a valid year (e.g., 2020)',
      'annual_revenue.max' => 'The annual revenue must not exceed 50 characters',
      'certifications.max' => 'The certifications must not exceed 500 characters',
      'registration_date.date' => 'Please enter a valid registration date',

      // Banking Information
      'bank_name.max' => 'The bank name must not exceed 255 characters',
      'bank_account.max' => 'The bank account must not exceed 50 characters',
      'bank_branch.max' => 'The bank branch must not exceed 255 characters',
      'payment_terms.max' => 'The payment terms must not exceed 100 characters',
      'preferred_currency.max' => 'The preferred currency must not exceed 10 characters',

      // Contact Person
      'contact_person_email.email' => 'Please enter a valid contact person email',
      'contact_person_email.max' => 'The contact person email must not exceed 255 characters',
      'contact_person_phone.max' => 'The contact person phone must not exceed 20 characters',

      // Company Logo
      'company_logo.image' => 'The company logo must be an image file',
      'company_logo.max' => 'The company logo must not exceed 5MB',
      'company_logo.mimes' => 'The company logo must be a valid image format (JPEG, PNG, JPG, GIF, SVG, WEBP)',

      // User
      'user_id.exists' => 'The specified user does not exist',
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // Trim string fields
    $trimFields = [
      'company_name',
      'company_email',
      'company_phone',
      'company_registration',
      'company_address',
      'company_website',
      'tax_id',
      'description',
      'established_year',
      'employee_count',
      'annual_revenue',
      'certifications',
      'license_number',
      'bank_name',
      'bank_account',
      'bank_branch',
      'payment_terms',
      'preferred_currency',
      'contact_person_name',
      'contact_person_email',
      'contact_person_phone',
      'contact_person_first_name',
      'contact_person_last_name',
    ];

    foreach ($trimFields as $field) {
      if ($this->has($field)) {
        $this->merge([
          $field => trim($this->input($field))
        ]);
      }
    }

    // Convert empty strings to null for nullable fields
    $nullableFields = [
      'company_phone',
      'company_website',
      'tax_id',
      'description',
      'established_year',
      'employee_count',
      'annual_revenue',
      'certifications',
      'registration_date',
      'license_number',
      'bank_name',
      'bank_account',
      'bank_branch',
      'payment_terms',
      'preferred_currency',
      'contact_person_name',
      'contact_person_email',
      'contact_person_phone',
      'contact_person_first_name',
      'contact_person_last_name',
      'password',
      'company_logo',
    ];

    foreach ($nullableFields as $field) {
      if ($this->has($field) && $this->input($field) === '') {
        $this->merge([
          $field => null
        ]);
      }
    }
  }
}
