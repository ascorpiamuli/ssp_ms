<?php
// app/Http/Resources/Procurement/QuotationResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotationResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'qtn_number' => $this->qtn_number,
      'title' => $this->title,
      'description' => $this->description,
      'issue_date' => $this->issue_date?->toDateString(),
      'closing_date' => $this->closing_date?->toDateString(),
      'closing_time' => $this->closing_time,
      'delivery_terms' => $this->delivery_terms,
      'payment_terms' => $this->payment_terms,
      'special_conditions' => $this->special_conditions,
      'instructions' => $this->instructions,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_automated' => $this->is_automated,
      'is_tender' => $this->is_tender,
      'tender_number' => $this->tender_number,
      'sent_to_suppliers' => $this->sent_to_suppliers,
      'responded_suppliers' => $this->responded_suppliers,
      'declined_suppliers' => $this->declined_suppliers,
      'response_count' => $this->response_count,
      'response_rate' => $this->response_rate,
      'is_expired' => $this->is_expired,
      'is_closing_soon' => $this->is_closing_soon,
      'reminder_days' => $this->reminder_days,
      'generated_by' => $this->generatedBy?->full_name,
      'requisition' => [
        'id' => $this->requisition?->id,
        'reference_number' => $this->requisition?->reference_number,
        'title' => $this->requisition?->title,
      ],
      'supplier_quotations' => SupplierQuotationResource::collection($this->whenLoaded('supplierQuotations')),
      'created_at' => $this->created_at?->toDateTimeString(),
      'updated_at' => $this->updated_at?->toDateTimeString(),
    ];
  }
}
