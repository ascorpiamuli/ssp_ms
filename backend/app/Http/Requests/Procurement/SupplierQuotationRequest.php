<?php
// app/Http/Requests/Procurement/SupplierQuotationRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class SupplierQuotationRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'quotation_request_id' => 'required|exists:quotation_requests,id',
      'supplier_id' => 'required|exists:users,id',
      'supplier_reference_no' => 'nullable|string|max:100',
      'submission_date' => 'required|date',
      'validity_date' => 'required|date|after_or_equal:submission_date',
      'delivery_time' => 'nullable|string|max:100',
      'payment_terms' => 'nullable|string',
      'delivery_terms' => 'nullable|string',
      'warranty_terms' => 'nullable|string',
      'currency' => 'string|size:3',
      'submission_method' => 'in:system,upload,manual',
      'uploaded_file_path' => 'nullable|string|max:500',
      'original_filename' => 'nullable|string|max:255',
      'items' => 'required|array|min:1',
      'items.*.requisition_item_id' => 'required|exists:requisition_items,id',
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
      'items.*.is_alternative' => 'boolean',
      'items.*.alternative_notes' => 'nullable|string',
      'notes' => 'nullable|string',
      'metadata' => 'nullable|array',
    ];
  }

  public function messages(): array
  {
    return [
      'quotation_request_id.required' => 'Quotation request ID is required.',
      'quotation_request_id.exists' => 'Quotation request does not exist.',
      'supplier_id.required' => 'Supplier ID is required.',
      'supplier_id.exists' => 'Supplier does not exist.',
      'items.required' => 'At least one item is required.',
      'items.min' => 'At least one item is required.',
      'items.*.requisition_item_id.required' => 'Requisition item ID is required.',
      'items.*.item_name.required' => 'Item name is required.',
      'items.*.quantity.required' => 'Quantity is required.',
      'items.*.quantity.min' => 'Quantity must be greater than 0.',
      'items.*.unit_price.required' => 'Unit price is required.',
      'validity_date.after_or_equal' => 'Validity date must be after or equal to submission date.',
    ];
  }
}
