<?php
// app/Http/Resources/Procurement/GoodsReceivedResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoodsReceivedResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'purchase_order_id' => $this->purchase_order_id,
      'grn_number' => $this->grn_number,
      'reference_number' => $this->reference_number,
      'received_date' => $this->received_date?->toDateString(),
      'received_time' => $this->received_time,
      'delivery_note_number' => $this->delivery_note_number,
      'carrier' => $this->carrier,
      'waybill_number' => $this->waybill_number,
      'vehicle_number' => $this->vehicle_number,
      'delivery_condition' => $this->delivery_condition,
      'total_quantity' => $this->total_quantity,
      'total_value' => $this->total_value,
      'formatted_total_value' => $this->formatted_total_value,
      'total_tax' => $this->total_tax,
      'total_discount' => $this->total_discount,
      'net_total' => $this->net_total,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_approved' => $this->is_approved,
      'is_pending_approval' => $this->is_pending_approval,
      'approval_level' => $this->approval_level,
      'approval_level_label' => $this->approval_level_label,
      'inspection_result' => $this->inspection_result,
      'inspection_result_label' => $this->inspection_result_label,
      'inspection_result_color' => $this->inspection_result_color,
      'inspection_notes' => $this->inspection_notes,
      'received_by' => $this->receivedBy?->full_name,
      'inspected_by' => $this->inspectedBy?->full_name,
      'items' => $this->whenLoaded('items', function () {
        return $this->items->map(function ($item) {
          return [
            'id' => $item->id,
            'item_name' => $item->item_name,
            'description' => $item->description,
            'unit_of_measure' => $item->unit_of_measure,
            'ordered_quantity' => $item->ordered_quantity,
            'formatted_ordered_quantity' => $item->formatted_ordered_quantity,
            'received_quantity' => $item->received_quantity,
            'formatted_received_quantity' => $item->formatted_received_quantity,
            'accepted_quantity' => $item->accepted_quantity,
            'formatted_accepted_quantity' => $item->formatted_accepted_quantity,
            'rejected_quantity' => $item->rejected_quantity,
            'formatted_rejected_quantity' => $item->formatted_rejected_quantity,
            'unit_price' => $item->unit_price,
            'formatted_unit_price' => $item->formatted_unit_price,
            'total_value' => $item->total_value,
            'formatted_total_value' => $item->formatted_total_value,
            'rejection_reason' => $item->rejection_reason,
            'condition_notes' => $item->condition_notes,
            'quality_status' => $item->quality_status,
            'quality_status_label' => $item->quality_status_label,
            'quality_status_color' => $item->quality_status_color,
            'quality_notes' => $item->quality_notes,
            'batch_number' => $item->batch_number,
            'serial_numbers' => $item->serial_numbers,
            'expiry_date' => $item->expiry_date?->toDateString(),
            'manufacturing_date' => $item->manufacturing_date?->toDateString(),
            'warranty_start_date' => $item->warranty_start_date?->toDateString(),
            'warranty_end_date' => $item->warranty_end_date?->toDateString(),
            'storage_location' => $item->storage_location,
            'bin_number' => $item->bin_number,
            'rack_number' => $item->rack_number,
            'is_quarantined' => $item->is_quarantined,
            'is_quarantined_label' => $item->is_quarantined_label,
            'quarantine_reason' => $item->quarantine_reason,
            'acceptance_rate' => $item->acceptance_rate,
          ];
        });
      }),
      'approvals' => [
        'hod_approved_by' => $this->hodApprovedBy?->full_name,
        'hod_approved_at' => $this->hod_approved_at?->toDateTimeString(),
        'principal_approved_by' => $this->principalApprovedBy?->full_name,
        'principal_approved_at' => $this->principal_approved_at?->toDateTimeString(),
      ],
      'created_at' => $this->created_at?->toDateTimeString(),
      'updated_at' => $this->updated_at?->toDateTimeString(),
    ];
  }
}
