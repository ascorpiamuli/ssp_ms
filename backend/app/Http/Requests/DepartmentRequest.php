<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DepartmentRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $id = $this->route('id');

    return [
      'name' => 'required|string|max:255',
      'code' => ['required', 'string', 'max:50', Rule::unique('departments')->ignore($id)],
      'description' => 'nullable|string|max:500',
      'hod_id' => 'nullable|exists:users,id',
    ];
  }

  public function messages(): array
  {
    return [
      'name.required' => 'Department name is required',
      'code.required' => 'Department code is required',
      'code.unique' => 'This department code is already taken',
      'hod_id.exists' => 'Selected user does not exist',
    ];
  }
}
