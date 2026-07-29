<?php
// app/Http/Resources/Procurement/InvoiceResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'purchase_order_id' => $this->purchase_order_id,
      'goods_received_note_id' => $this->goods_received_note_id,
      'supplier_id' => $this->supplier_id,
      'invoice_number' => $this->invoice_number,
      'customer_invoice_no' => $this->customer_invoice_no,
      'invoice_date' => $this->invoice_date?->toDateString(),
      'due_date' => $this->due_date?->toDateString(),
      'description' => $this->description,
      'subtotal' => $this->subtotal,
      'tax_amount' => $this->tax_amount,
      'discount_amount' => $this->discount_amount,
      'total_amount' => $this->total_amount,
      'formatted_total_amount' => $this->formatted_total_amount,
      'currency' => $this->currency,
      'exchange_rate' => $this->exchange_rate,
      'payment_reference' => $this->payment_reference,
      'bank_name' => $this->bank_name,
      'bank_account' => $this->bank_account,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'matching_status' => $this->matching_status,
      'matching_status_label' => $this->matching_status_label,
      'matching_status_color' => $this->matching_status_color,
      'matching_notes' => $this->matching_notes,
      'is_overdue' => $this->is_overdue,
      'days_overdue' => $this->days_overdue,
      'is_credit_note' => $this->is_credit_note,
      'credit_note_reference' => $this->credit_note_reference,
      'payment_terms' => $this->payment_terms,
      'notes' => $this->notes,
      'supplier' => [
        'id' => $this->supplier?->id,
        'name' => $this->supplier_name,
        'email' => $this->supplier?->email,
        'phone' => $this->supplier?->phone,
      ],
      'purchase_order' => [
        'id' => $this->purchaseOrder?->id,
        'po_number' => $this->purchaseOrder?->po_number,
        'type' => $this->purchaseOrder?->type,
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
          ];
        });
      }),
      'approvals' => [
        'matched_by' => $this->matchedBy?->full_name,
        'matched_at' => $this->matched_at?->toDateTimeString(),
        'verified_by' => $this->verifiedBy?->full_name,
        'verified_at' => $this->verified_at?->toDateTimeString(),
        'approved_by' => $this->approvedBy?->full_name,
        'approved_at' => $this->approved_at?->toDateTimeString(),
      ],
      'created_at' => $this->created_at?->toDateTimeString(),
      'updated_at' => $this->updated_at?->toDateTimeString(),
    ];
  }
}
