<?php
// app/Http/Requests/Requisition/UpdateRequisitionRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Requisition;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequisitionRequest extends FormRequest
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
   *
   * @return array<string, mixed>
   */
  public function rules(): array
  {
    return [
      'title' => ['sometimes', 'string', 'max:255'],
      'description' => ['nullable', 'string', 'max:1000'],
      'department_id' => ['sometimes', 'exists:departments,id'],
      'supplier_id' => ['nullable', 'exists:suppliers,id'],
      'priority' => ['nullable', 'in:low,medium,high,emergency'],
      'type' => ['nullable', 'in:normal,emergency'],
      'urgency' => ['nullable', 'in:routine,urgent,critical'],
      'justification' => ['nullable', 'string', 'max:1000'],
      'required_by_date' => ['nullable', 'date', 'after:today'],
      'required_delivery_date' => ['nullable', 'date', 'after:today'],
      'budget_code' => ['nullable', 'string', 'max:100'],
      'budget_source' => ['nullable', 'string', 'max:100'],
      'funding_source' => ['nullable', 'string', 'max:100'],
      'project_code' => ['nullable', 'string', 'max:100'],
      'procurement_method' => ['nullable', 'in:direct_purchase,request_for_quotation,tender,fraud'],
      'is_framework_agreement' => ['nullable', 'boolean'],
      'framework_agreement_id' => ['nullable', 'string', 'max:100'],
      'risk_level' => ['nullable', 'in:low,medium,high,critical'],
      'risk_mitigation' => ['nullable', 'string', 'max:1000'],
      'is_compliant' => ['nullable', 'boolean'],
      'compliance_notes' => ['nullable', 'string', 'max:1000'],
      'currency' => ['nullable', 'string', 'size:3'],
      'exchange_rate' => ['nullable', 'numeric', 'min:0'],
      'metadata' => ['nullable', 'array'],
      'custom_fields' => ['nullable', 'array'],
      'items' => ['nullable', 'array'],
      'items.*.id' => ['nullable', 'exists:requisition_items,id'],
      'items.*.item_name' => ['required_with:items', 'string', 'max:255'],
      'items.*.description' => ['nullable', 'string', 'max:1000'],
      'items.*.unit_of_measure' => ['required_with:items', 'string', 'max:50'],
      'items.*.quantity' => ['required_with:items', 'numeric', 'min:0.01'],
      'items.*.estimated_unit_cost' => ['required_with:items', 'numeric', 'min:0'],
      'items.*.specifications' => ['nullable', 'string', 'max:1000'],
      'items.*.catalog_number' => ['nullable', 'string', 'max:100'],
      'items.*.manufacturer' => ['nullable', 'string', 'max:255'],
      'items.*.model_number' => ['nullable', 'string', 'max:100'],
      'items.*.supplier_id' => ['nullable', 'exists:suppliers,id'],
      'items.*.is_inventory_item' => ['nullable', 'boolean'],
      'items.*.inventory_code' => ['nullable', 'string', 'max:100'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'title.required' => 'The requisition title is required.',
      'department_id.exists' => 'The selected department does not exist.',
    ];
  }
}
