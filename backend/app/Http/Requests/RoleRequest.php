<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $id = $this->route('id');
    $isEdit = $id !== null;

    return [
      'name' => [
        $isEdit ? 'sometimes' : 'required',
        'string',
        'max:255',
        Rule::unique('roles')->ignore($id),
      ],
      'label' => [
        'required',
        'string',
        'max:255',
        Rule::unique('roles')->ignore($id),
      ],
      'description' => 'nullable|string|max:1000',
      'guard_name' => 'nullable|string|in:web,api',
      'permissions' => 'nullable|array',
      'permissions.*' => 'exists:permissions,name',
    ];
  }

  public function messages(): array
  {
    return [
      'name.required' => 'Role name is required',
      'name.unique' => 'This role name already exists',
      'name.max' => 'Role name must not exceed 255 characters',

      'label.required' => 'Display label is required',
      'label.unique' => 'This display label already exists',
      'label.max' => 'Display label must not exceed 255 characters',

      'description.max' => 'Description must not exceed 1000 characters',

      'guard_name.in' => 'Guard name must be either web or api',

      'permissions.array' => 'Permissions must be an array',
      'permissions.*.exists' => 'One or more permissions do not exist',
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // Convert empty strings to null for optional fields
    if ($this->has('description') && empty($this->description)) {
      $this->merge(['description' => null]);
    }

    if ($this->has('guard_name') && empty($this->guard_name)) {
      $this->merge(['guard_name' => 'web']);
    }

    // Ensure label is trimmed and properly formatted
    if ($this->has('label')) {
      $this->merge(['label' => trim($this->label)]);
    }

    // Only uppercase name if present AND not empty
    if ($this->has('name') && !empty($this->name)) {
      $this->merge(['name' => strtoupper(trim($this->name))]);
    }

    // For update requests, completely remove name from data if not provided
    // This prevents null from being saved
    if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
      if (!$this->has('name') || empty($this->name)) {
        $this->request->remove('name');
      }
    }
  }

  /**
   * Get custom attributes for validator errors.
   */
  public function attributes(): array
  {
    return [
      'name' => 'role name',
      'label' => 'display label',
      'description' => 'description',
      'guard_name' => 'guard name',
      'permissions' => 'permissions',
    ];
  }

  /**
   * Determine if the current request is an update.
   */
  protected function isUpdate(): bool
  {
    return $this->route('id') !== null && ($this->isMethod('PUT') || $this->isMethod('PATCH'));
  }
}
