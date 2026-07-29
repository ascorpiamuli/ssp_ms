<?php
// app/Http/Requests/Procurement/InvoiceRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'purchase_order_id' => 'required|exists:purchase_orders,id',
      'supplier_id' => 'required|exists:users,id',
      'customer_invoice_no' => 'required|string|max:100',
      'invoice_date' => 'required|date',
      'due_date' => 'required|date|after_or_equal:invoice_date',
      'description' => 'nullable|string',
      'currency' => 'string|size:3',
      'exchange_rate' => 'nullable|numeric|min:0',
      'payment_reference' => 'nullable|string|max:100',
      'bank_name' => 'nullable|string|max:100',
      'bank_account' => 'nullable|string|max:50',
      'payment_terms' => 'nullable|string',
      'items' => 'required|array|min:1',
      'items.*.purchase_order_item_id' => 'nullable|exists:purchase_order_items,id',
      'items.*.goods_received_item_id' => 'nullable|exists:goods_received_items,id',
      'items.*.requisition_item_id' => 'required|exists:requisition_items,id',
      'items.*.item_name' => 'required|string|max:255',
      'items.*.description' => 'nullable|string',
      'items.*.unit_of_measure' => 'nullable|string|max:50',
      'items.*.quantity' => 'required|numeric|min:0.01',
      'items.*.unit_price' => 'required|numeric|min:0',
      'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
      'items.*.discount_rate' => 'nullable|numeric|min:0|max:100',
      'notes' => 'nullable|string',
      'metadata' => 'nullable|array',
    ];
  }

  public function messages(): array
  {
    return [
      'purchase_order_id.required' => 'Purchase order ID is required.',
      'purchase_order_id.exists' => 'Purchase order does not exist.',
      'supplier_id.required' => 'Supplier ID is required.',
      'supplier_id.exists' => 'Supplier does not exist.',
      'customer_invoice_no.required' => 'Customer invoice number is required.',
      'invoice_date.required' => 'Invoice date is required.',
      'due_date.required' => 'Due date is required.',
      'due_date.after_or_equal' => 'Due date must be after or equal to invoice date.',
      'items.required' => 'At least one item is required.',
      'items.min' => 'At least one item is required.',
      'items.*.requisition_item_id.required' => 'Requisition item ID is required.',
      'items.*.item_name.required' => 'Item name is required.',
      'items.*.quantity.required' => 'Quantity is required.',
      'items.*.quantity.min' => 'Quantity must be greater than 0.',
      'items.*.unit_price.required' => 'Unit price is required.',
    ];
  }
}
