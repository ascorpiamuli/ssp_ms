<?php
// app/Http/Requests/Procurement/PurchaseOrderRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class PurchaseOrderRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'requisition_id' => 'required|exists:requisitions,id',
      'type' => 'required|in:lpo,lso',
      'title' => 'required|string|max:255',
      'description' => 'nullable|string',
      'issue_date' => 'required|date',
      'expected_delivery_date' => 'required|date|after_or_equal:issue_date',
      'delivery_address' => 'nullable|string',
      'delivery_contact' => 'nullable|string|max:255',
      'delivery_phone' => 'nullable|string|max:50',
      'delivery_email' => 'nullable|email|max:100',
      'payment_terms' => 'nullable|string',
      'delivery_terms' => 'nullable|string',
      'special_conditions' => 'nullable|string',
      'terms_and_conditions' => 'nullable|string',
      'validity_period_days' => 'integer|min:1|max:365',
      'contract_number' => 'nullable|string|max:50',
      'contract_start_date' => 'nullable|date',
      'contract_end_date' => 'nullable|date|after_or_equal:contract_start_date',
      'currency' => 'string|size:3',
      'generate_contract' => 'boolean',
      'items' => 'required|array|min:1',
      // ✅ FIXED: requisition_item_id is now nullable - supplier-added items won't have one
      'items.*.requisition_item_id' => 'nullable|exists:requisition_items,id',
      'items.*.item_name' => 'required|string|max:255',
      'items.*.description' => 'nullable|string',
      'items.*.unit_of_measure' => 'nullable|string|max:50',
      'items.*.quantity' => 'required|numeric|min:0.01',
      'items.*.unit_price' => 'required|numeric|min:0',
      'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
      'items.*.discount_rate' => 'nullable|numeric|min:0|max:100',
      'items.*.delivery_days' => 'nullable|integer|min:0',
      'items.*.warranty_months' => 'nullable|integer|min:0',
      'items.*.specifications' => 'nullable|string',
      'items.*.brand' => 'nullable|string|max:100',
      'items.*.model' => 'nullable|string|max:100',
      // ✅ ADDED: supplier_quotation_item_id to link to supplier's original item
      'items.*.supplier_quotation_item_id' => 'nullable|exists:supplier_quotation_items,id',
      'metadata' => 'nullable|array',
    ];
  }

  public function messages(): array
  {
    return [
      'requisition_id.required' => 'Requisition ID is required.',
      'requisition_id.exists' => 'Requisition does not exist.',
      'type.required' => 'PO type is required.',
      'type.in' => 'PO type must be either LPO or LSO.',
      'title.required' => 'Title is required.',
      'expected_delivery_date.required' => 'Expected delivery date is required.',
      'expected_delivery_date.after_or_equal' => 'Expected delivery date must be after or equal to issue date.',
      'items.required' => 'At least one item is required.',
      'items.min' => 'At least one item is required.',
      'items.*.item_name.required' => 'Item name is required.',
      'items.*.quantity.required' => 'Quantity is required.',
      'items.*.quantity.min' => 'Quantity must be greater than 0.',
      'items.*.unit_price.required' => 'Unit price is required.',
    ];
  }
}
