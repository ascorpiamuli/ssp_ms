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

    return [
      'name' => [
        'required',
        'string',
        'max:255',
        Rule::unique('roles')->ignore($id),
      ],
      'permissions' => 'nullable|array',
      'permissions.*' => 'exists:permissions,name',
    ];
  }

  public function messages(): array
  {
    return [
      'name.required' => 'Role name is required',
      'name.unique' => 'This role name already exists',
      'permissions.array' => 'Permissions must be an array',
      'permissions.*.exists' => 'One or more permissions do not exist',
    ];
  }
}
