<?php
// app/Http/Requests/Requisition/StoreRequisitionRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Requisition;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequisitionRequest extends FormRequest
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
      // ✅ ADD REFERENCE NUMBER - Allow it to be passed from frontend
      'reference_number' => ['nullable', 'string', 'max:50', 'unique:requisitions,reference_number'],

      // Requisition Details
      'title' => ['required', 'string', 'max:255'],
      'description' => ['nullable', 'string', 'max:1000'],
      'department_id' => ['required', 'exists:departments,id'],
      'supplier_id' => ['nullable', 'exists:suppliers,id'],

      // Priority & Type
      'priority' => ['nullable', 'in:low,medium,high,emergency'],
      'type' => ['nullable', 'in:normal,emergency'],
      'urgency' => ['nullable', 'in:routine,urgent,critical'],

      // Justification
      'justification' => ['nullable', 'string', 'max:1000'],
      'required_by_date' => ['nullable', 'date', 'after:today'],
      'required_delivery_date' => ['nullable', 'date', 'after:today'],

      // Budget
      'budget_code' => ['nullable', 'string', 'max:100'],
      'budget_source' => ['nullable', 'string', 'max:100'],
      'funding_source' => ['nullable', 'string', 'max:100'],
      'project_code' => ['nullable', 'string', 'max:100'],

      // Procurement
      'procurement_method' => ['nullable', 'in:direct_purchase,request_for_quotation,tender,framework_agreement,emergency_procurement'],
      'is_framework_agreement' => ['nullable', 'boolean'],
      'framework_agreement_id' => ['nullable', 'string', 'max:100'],

      // Compliance
      'risk_level' => ['nullable', 'in:low,medium,high,critical'],
      'risk_mitigation' => ['nullable', 'string', 'max:1000'],
      'is_compliant' => ['nullable', 'boolean'],
      'compliance_notes' => ['nullable', 'string', 'max:1000'],

      // Currency
      'currency' => ['nullable', 'string', 'size:3'],
      'exchange_rate' => ['nullable', 'numeric', 'min:0'],

      // Metadata
      'metadata' => ['nullable', 'array'],
      'custom_fields' => ['nullable', 'array'],

      // Items
      'items' => ['required', 'array', 'min:1'],
      'items.*.item_name' => ['required', 'string', 'max:255'],
      'items.*.description' => ['nullable', 'string', 'max:1000'],
      'items.*.unit_of_measure' => ['required', 'string', 'max:50'],
      'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
      'items.*.estimated_unit_cost' => ['required', 'numeric', 'min:0'],
      'items.*.specifications' => ['nullable', 'string', 'max:1000'],
      'items.*.catalog_number' => ['nullable', 'string', 'max:100'],
      'items.*.manufacturer' => ['nullable', 'string', 'max:255'],
      'items.*.model_number' => ['nullable', 'string', 'max:100'],
      'items.*.supplier_id' => ['nullable', 'exists:suppliers,id'],
      'items.*.is_inventory_item' => ['nullable', 'boolean'],
      'items.*.inventory_code' => ['nullable', 'string', 'max:100'],
      'items.*.tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
      'items.*.discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   *
   * @return array<string, string>
   */
  public function messages(): array
  {
    return [
      'title.required' => 'The requisition title is required.',
      'department_id.required' => 'Please select a department.',
      'department_id.exists' => 'The selected department does not exist.',
      'items.required' => 'At least one item is required.',
      'items.*.item_name.required' => 'Item name is required for each item.',
      'items.*.unit_of_measure.required' => 'Unit of measure is required for each item.',
      'items.*.quantity.required' => 'Quantity is required for each item.',
      'items.*.estimated_unit_cost.required' => 'Estimated unit cost is required for each item.',
      'reference_number.unique' => 'This requisition number already exists.',
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // Set default values
    $this->merge([
      'priority' => $this->input('priority', 'medium'),
      'type' => $this->input('type', 'normal'),
      'urgency' => $this->input('urgency', 'routine'),
      'currency' => $this->input('currency', 'KES'),
      'exchange_rate' => $this->input('exchange_rate', 1),
      'is_framework_agreement' => $this->input('is_framework_agreement', false),
      'is_compliant' => $this->input('is_compliant', true),

      // Ensure items is an array
      'items' => $this->input('items', []),

      // ✅ Ensure reference_number is passed through
      'reference_number' => $this->input('reference_number'),
    ]);
  }
}
