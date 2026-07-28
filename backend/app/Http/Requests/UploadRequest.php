<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return true;
  }

  /**
   * Get the validation rules that apply to the request.
   */
  public function rules(): array
  {
    $rules = [
      'file' => 'required|file|max:10240', // 10MB max
      'collection' => 'nullable|string|max:50',
      'title' => 'nullable|string|max:255',
      'description' => 'nullable|string|max:500',
      'uploadable_type' => 'nullable|string|max:255',
      'uploadable_id' => 'nullable|integer|exists:uploadable_type,id',
    ];

    // If uploadable_type is provided, uploadable_id is required
    if ($this->has('uploadable_type')) {
      $rules['uploadable_id'] = 'required|integer';
    }

    return $rules;
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'file.required' => 'Please select a file to upload.',
      'file.file' => 'The uploaded file is invalid.',
      'file.max' => 'The file size must not exceed 10MB.',
      'uploadable_id.required' => 'The uploadable ID is required when type is specified.',
      'uploadable_id.exists' => 'The specified uploadable ID does not exist.',
    ];
  }
}
