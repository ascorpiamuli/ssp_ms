<?php
// app/Http/Requests/Procurement/ContractRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class ContractRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'requisition_id' => 'required|exists:requisitions,id',
      'supplier_id' => 'required|exists:users,id',
      'purchase_order_id' => 'nullable|exists:purchase_orders,id',
      'contract_number' => 'nullable|string|max:50',
      'title' => 'required|string|max:255',
      'description' => 'nullable|string',
      'start_date' => 'required|date',
      'end_date' => 'required|date|after:start_date',
      'contract_value' => 'required|numeric|min:0',
      'terms_and_conditions' => 'nullable|string',
      'deliverables' => 'nullable|string',
      'scope_of_work' => 'nullable|string',
      'payment_schedule' => 'nullable|string',
      'penalty_clauses' => 'nullable|string',
      'termination_clauses' => 'nullable|string',
      'is_renewable' => 'boolean',
      'renewal_period_months' => 'nullable|integer|min:1|max:60',
      'metadata' => 'nullable|array',
    ];
  }

  public function messages(): array
  {
    return [
      'requisition_id.required' => 'Requisition ID is required.',
      'requisition_id.exists' => 'Requisition does not exist.',
      'supplier_id.required' => 'Supplier ID is required.',
      'supplier_id.exists' => 'Supplier does not exist.',
      'title.required' => 'Title is required.',
      'start_date.required' => 'Start date is required.',
      'end_date.required' => 'End date is required.',
      'end_date.after' => 'End date must be after start date.',
      'contract_value.required' => 'Contract value is required.',
      'contract_value.min' => 'Contract value must be greater than or equal to 0.',
    ];
  }
}
