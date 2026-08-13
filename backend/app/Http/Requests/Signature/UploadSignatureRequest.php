<?php
// app/Http/Requests/Signature/UploadSignatureRequest.php

namespace App\Http\Requests\Signature;

use Illuminate\Foundation\Http\FormRequest;

class UploadSignatureRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'signature' => [
        'required',
        'file',
        'image',
        'mimes:png,jpeg,jpg,svg',
        'max:2048', // 2MB
      ],
      'notes' => [
        'nullable',
        'string',
        'max:500',
      ],
    ];
  }

  public function messages(): array
  {
    return [
      'signature.required' => 'Please upload a signature image.',
      'signature.image' => 'The file must be an image.',
      'signature.mimes' => 'Allowed formats: PNG, JPEG, JPG, SVG.',
      'signature.max' => 'File size must not exceed 2MB.',
    ];
  }
}
