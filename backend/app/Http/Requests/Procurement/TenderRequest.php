<?php
// app/Http/Requests/Procurement/TenderRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class TenderRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'requisition_id' => 'required|exists:requisitions,id',
      'tender_number' => 'nullable|string|max:50',
      'title' => 'required|string|max:255',
      'description' => 'nullable|string',
      'issue_date' => 'required|date',
      'closing_date' => 'required|date|after_or_equal:issue_date',
      'closing_time' => 'nullable|date_format:H:i',
      'tender_document_path' => 'nullable|string|max:500',
      'evaluation_criteria' => 'nullable|string',
      'estimated_value' => 'nullable|numeric|min:0',
      'bidders' => 'nullable|array',
      'bidders.*' => 'exists:users,id',
      'metadata' => 'nullable|array',
    ];
  }

  public function messages(): array
  {
    return [
      'requisition_id.required' => 'Requisition ID is required.',
      'requisition_id.exists' => 'Requisition does not exist.',
      'title.required' => 'Title is required.',
      'issue_date.required' => 'Issue date is required.',
      'closing_date.required' => 'Closing date is required.',
      'closing_date.after_or_equal' => 'Closing date must be after or equal to issue date.',
      'bidders.*.exists' => 'One or more bidders do not exist.',
    ];
  }
}
