<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SupplierRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $id = $this->route('id');

    return [
      // Company Information
      'company_name' => 'required|string|max:255',
      'company_email' => ['required', 'email', 'max:255', Rule::unique('suppliers')->ignore($id)],
      'company_phone' => 'nullable|string|max:20',
      'company_registration' => ['required', 'string', 'max:255', Rule::unique('suppliers')->ignore($id)],
      'company_address' => 'required|string|max:500',
      'company_website' => 'nullable|url|max:255',
      'tax_id' => 'nullable|string|max:50',
      'category' => ['required', 'string', Rule::in(['goods', 'services', 'both'])],

      // Contact Person (if creating new user)
      'contact_person_first_name' => 'nullable|string|max:255',
      'contact_person_last_name' => 'nullable|string|max:255',
      'password' => 'nullable|string|min:8|confirmed',
    ];
  }

  public function messages(): array
  {
    return [
      'company_name.required' => 'Company name is required',
      'company_email.required' => 'Company email is required',
      'company_email.email' => 'Please enter a valid company email',
      'company_email.unique' => 'This company email is already registered',
      'company_registration.required' => 'Company registration number is required',
      'company_registration.unique' => 'This registration number is already used',
      'company_address.required' => 'Company address is required',
      'category.required' => 'Supplier category is required',
      'category.in' => 'Invalid supplier category. Must be goods, services, or both',
    ];
  }
}
