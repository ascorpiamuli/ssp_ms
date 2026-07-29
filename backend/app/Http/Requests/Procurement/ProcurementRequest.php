<?php
// app/Http/Requests/Procurement/ProcurementRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class ProcurementRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'requisition_id' => 'required|exists:requisitions,id',
    ];
  }

  public function messages(): array
  {
    return [
      'requisition_id.required' => 'Requisition ID is required.',
      'requisition_id.exists' => 'Requisition does not exist.',
    ];
  }
}
