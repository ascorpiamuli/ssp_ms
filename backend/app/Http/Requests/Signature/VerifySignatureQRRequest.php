<?php
// app/Http/Requests/Signature/VerifySignatureQRRequest.php

namespace App\Http\Requests\Signature;

use Illuminate\Foundation\Http\FormRequest;

class VerifySignatureQRRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'qr_data' => [
        'required',
        'string',
      ],
    ];
  }

  public function messages(): array
  {
    return [
      'qr_data.required' => 'QR Code data is required.',
    ];
  }
}
