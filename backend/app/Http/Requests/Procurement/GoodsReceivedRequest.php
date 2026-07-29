<?php
// app/Http/Requests/Procurement/GoodsReceivedRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class GoodsReceivedRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'purchase_order_id' => 'required|exists:purchase_orders,id',
      'type' => 'required|in:grn,san',
      'received_date' => 'required|date',
      'received_time' => 'nullable|date_format:H:i',
      'reference_number' => 'nullable|string|max:100',
      'delivery_note_number' => 'nullable|string|max:100',
      'carrier' => 'nullable|string|max:100',
      'waybill_number' => 'nullable|string|max:100',
      'vehicle_number' => 'nullable|string|max:50',
      'delivery_condition' => 'nullable|string',
      'service_description' => 'required_if:type,san|nullable|string',
      'service_start_date' => 'nullable|date',
      'service_end_date' => 'nullable|date|after_or_equal:service_start_date',
      'service_provider' => 'nullable|string|max:255',
      'service_deliverables' => 'nullable|string',
      'approval_level' => 'required|in:hod,principal',
      'items' => 'required_if:type,grn|array|min:1',
      'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
      'items.*.received_quantity' => 'required|numeric|min:0',
      'items.*.rejected_quantity' => 'nullable|numeric|min:0',
      'items.*.rejection_reason' => 'nullable|string',
      'items.*.condition_notes' => 'nullable|string',
      'items.*.batch_number' => 'nullable|string|max:100',
      'items.*.serial_numbers' => 'nullable|array',
      'items.*.expiry_date' => 'nullable|date',
      'items.*.manufacturing_date' => 'nullable|date',
      'items.*.warranty_start_date' => 'nullable|date',
      'items.*.warranty_end_date' => 'nullable|date|after_or_equal:warranty_start_date',
      'items.*.storage_location' => 'nullable|string|max:255',
      'items.*.bin_number' => 'nullable|string|max:100',
      'items.*.rack_number' => 'nullable|string|max:50',
      'items.*.is_quarantined' => 'boolean',
      'items.*.quarantine_reason' => 'nullable|string',
      'notes' => 'nullable|string',
      'metadata' => 'nullable|array',
    ];
  }

  public function messages(): array
  {
    return [
      'purchase_order_id.required' => 'Purchase order ID is required.',
      'purchase_order_id.exists' => 'Purchase order does not exist.',
      'type.required' => 'Type is required.',
      'type.in' => 'Type must be either GRN or SAN.',
      'received_date.required' => 'Received date is required.',
      'approval_level.required' => 'Approval level is required.',
      'approval_level.in' => 'Approval level must be HOD or Principal.',
      'items.required_if' => 'At least one item is required for GRN.',
      'items.min' => 'At least one item is required.',
      'items.*.purchase_order_item_id.required' => 'PO item ID is required.',
      'items.*.purchase_order_item_id.exists' => 'PO item does not exist.',
      'items.*.received_quantity.required' => 'Received quantity is required.',
      'items.*.received_quantity.min' => 'Received quantity must be greater than or equal to 0.',
    ];
  }
}
