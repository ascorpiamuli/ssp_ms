<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RolePermissionRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'permissions' => 'required|array',
      'permissions.*' => 'required|exists:permissions,name',
    ];
  }

  public function messages(): array
  {
    return [
      'permissions.required' => 'Permissions are required',
      'permissions.array' => 'Permissions must be an array',
      'permissions.*.required' => 'Each permission is required',
      'permissions.*.exists' => 'One or more permissions do not exist',
    ];
  }
}
