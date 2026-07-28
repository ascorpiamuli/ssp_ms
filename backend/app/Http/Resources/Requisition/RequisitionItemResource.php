<?php
// app/Http/Resources/Requisition/RequisitionItemResource.php

declare(strict_types=1);

namespace App\Http\Resources\Requisition;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionItemResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'item_name' => $this->item_name,
      'description' => $this->description,
      'unit_of_measure' => $this->unit_of_measure,

      // ✅ Cast to float for consistency
      'quantity' => (float) $this->quantity,
      'formatted_quantity' => $this->formatted_quantity ?? number_format((float) $this->quantity, 2),

      'estimated_unit_cost' => (float) $this->estimated_unit_cost,
      'formatted_estimated_unit_cost' => $this->formatted_estimated_unit_cost ?? number_format((float) $this->estimated_unit_cost, 2),

      'total_cost' => (float) $this->total_cost,
      'formatted_total_cost' => $this->formatted_total_cost ?? number_format((float) $this->total_cost, 2),

      // Tax & Discount
      'tax_rate' => (float) ($this->tax_rate ?? 0),
      'tax_amount' => (float) ($this->tax_amount ?? 0),
      'discount_percentage' => (float) ($this->discount_percentage ?? 0),
      'discount_amount' => (float) ($this->discount_amount ?? 0),
      'net_amount' => (float) ($this->net_amount ?? 0),
      'total_with_tax' => (float) ($this->total_with_tax ?? 0),

      // Specifications
      'specifications' => $this->specifications,
      'catalog_number' => $this->catalog_number,
      'manufacturer' => $this->manufacturer,
      'model_number' => $this->model_number,

      // Inventory
      'is_inventory_item' => (bool) $this->is_inventory_item,
      'inventory_code' => $this->inventory_code,
      'current_stock' => (float) ($this->current_stock ?? 0),
      'reorder_level' => (float) ($this->reorder_level ?? 0),

      // Supplier
      'supplier_id' => $this->supplier_id,
      'supplier' => $this->whenLoaded('supplier', function () {
        return [
          'id' => $this->supplier->id,
          'company_name' => $this->supplier->company_name,
        ];
      }),

      // Procurement
      'is_procured' => (bool) ($this->is_procured ?? false),
      'procured_at' => $this->procured_at?->format('Y-m-d H:i:s'),
      'actual_unit_cost' => (float) ($this->actual_unit_cost ?? 0),
      'actual_total_cost' => (float) ($this->actual_total_cost ?? 0),

      // Delivery
      'expected_delivery_date' => $this->expected_delivery_date?->format('Y-m-d'),
      'actual_delivery_date' => $this->actual_delivery_date?->format('Y-m-d'),
      'is_delivered' => (bool) ($this->is_delivered ?? false),
      'delivery_receipt_number' => $this->delivery_receipt_number,

      // Quality
      'quality_status' => $this->quality_status,
      'quality_status_label' => $this->quality_status_label ?? $this->quality_status,
      'quality_notes' => $this->quality_notes,
      'quality_inspected_at' => $this->quality_inspected_at?->format('Y-m-d H:i:s'),

      // Warranty
      'warranty_period_months' => (int) ($this->warranty_period_months ?? 0),
      'warranty_start_date' => $this->warranty_start_date?->format('Y-m-d'),
      'warranty_end_date' => $this->warranty_end_date?->format('Y-m-d'),

      // Receiving
      'received_quantity' => (float) ($this->received_quantity ?? 0),
      'remaining_quantity' => (float) ($this->remaining_quantity ?? 0),
      'fully_received_at' => $this->fully_received_at?->format('Y-m-d H:i:s'),
      'is_fully_received' => (bool) ($this->is_fully_received ? $this->is_fully_received() : false),

      // Status
      'status' => $this->status,
      'status_label' => $this->status_label ?? $this->status,
      'status_color' => $this->status_color ?? 'gray',

      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
    ];
  }
}
