<?php
// app/Http/Requests/Signature/VerifySignatureRequest.php

namespace App\Http\Requests\Signature;

use Illuminate\Foundation\Http\FormRequest;

class VerifySignatureRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'notes' => [
        'nullable',
        'string',
        'max:500',
      ],
    ];
  }
}
