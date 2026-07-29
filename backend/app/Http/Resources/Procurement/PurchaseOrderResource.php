<?php
// app/Http/Resources/Procurement/PurchaseOrderResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'supplier_id' => $this->supplier_id,
      'po_number' => $this->po_number,
      'type' => $this->type,
      'type_label' => $this->type_label,
      'type_color' => $this->type_color,
      'is_lpo' => $this->is_lpo,
      'is_lso' => $this->is_lso,
      'title' => $this->title,
      'description' => $this->description,
      'total_amount' => $this->total_amount,
      'formatted_total_amount' => $this->formatted_total_amount,
      'tax_amount' => $this->tax_amount,
      'total_with_tax' => $this->total_with_tax,
      'currency' => $this->currency,
      'issue_date' => $this->issue_date?->toDateString(),
      'expected_delivery_date' => $this->expected_delivery_date?->toDateString(),
      'actual_delivery_date' => $this->actual_delivery_date?->toDateString(),
      'delivery_address' => $this->delivery_address,
      'delivery_contact' => $this->delivery_contact,
      'delivery_phone' => $this->delivery_phone,
      'delivery_email' => $this->delivery_email,
      'payment_terms' => $this->payment_terms,
      'delivery_terms' => $this->delivery_terms,
      'special_conditions' => $this->special_conditions,
      'terms_and_conditions' => $this->terms_and_conditions,
      'validity_period_days' => $this->validity_period_days,
      'contract_number' => $this->contract_number,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_overdue' => $this->is_overdue,
      'delivery_progress' => $this->delivery_progress,
      'is_fully_delivered' => $this->is_fully_delivered,
      'supplier' => [
        'id' => $this->supplier?->id,
        'name' => $this->supplier_name,
        'email' => $this->supplier?->email,
        'phone' => $this->supplier?->phone,
      ],
      'items' => $this->whenLoaded('items', function () {
        return $this->items->map(function ($item) {
          return [
            'id' => $item->id,
            'item_name' => $item->item_name,
            'description' => $item->description,
            'unit_of_measure' => $item->unit_of_measure,
            'quantity' => $item->quantity,
            'formatted_quantity' => $item->formatted_quantity,
            'unit_price' => $item->unit_price,
            'formatted_unit_price' => $item->formatted_unit_price,
            'total_price' => $item->total_price,
            'formatted_total_price' => $item->formatted_total_price,
            'tax_rate' => $item->tax_rate,
            'tax_amount' => $item->tax_amount,
            'discount_rate' => $item->discount_rate,
            'discount_amount' => $item->discount_amount,
            'net_price' => $item->net_price,
            'formatted_net_price' => $item->formatted_net_price,
            'received_quantity' => $item->received_quantity,
            'formatted_received_quantity' => $item->formatted_received_quantity,
            'remaining_quantity' => $item->remaining_quantity,
            'formatted_remaining_quantity' => $item->formatted_remaining_quantity,
            'fully_received' => $item->fully_received,
            'status' => $item->status,
            'status_label' => $item->status_label,
            'status_color' => $item->status_color,
            'delivery_days' => $item->delivery_days,
            'warranty_months' => $item->warranty_months,
            'brand' => $item->brand,
            'model' => $item->model,
          ];
        });
      }),
      'approvals' => [
        'generated_by' => $this->generatedBy?->full_name,
        'generated_at' => $this->created_at?->toDateTimeString(),
        'checked_by' => $this->checkedBy?->full_name,
        'checked_at' => $this->checked_at?->toDateTimeString(),
        'endorsed_by' => $this->endorsedBy?->full_name,
        'endorsed_at' => $this->endorsed_at?->toDateTimeString(),
        'approved_by' => $this->approvedBy?->full_name,
        'approved_at' => $this->approved_at?->toDateTimeString(),
      ],
      'timeline' => [
        'issued_at' => $this->issued_at?->toDateTimeString(),
        'sent_at' => $this->sent_at?->toDateTimeString(),
        'acknowledged_at' => $this->acknowledged_at?->toDateTimeString(),
        'completed_at' => $this->completed_at?->toDateTimeString(),
      ],
      'created_at' => $this->created_at?->toDateTimeString(),
      'updated_at' => $this->updated_at?->toDateTimeString(),
    ];
  }
}
