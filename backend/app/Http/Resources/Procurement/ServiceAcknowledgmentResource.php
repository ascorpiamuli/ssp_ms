<?php
// app/Http/Resources/Procurement/ServiceAcknowledgmentResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceAcknowledgmentResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'purchase_order_id' => $this->purchase_order_id,
      'san_number' => $this->san_number,
      'reference_number' => $this->reference_number,
      'acknowledgment_date' => $this->acknowledgment_date?->toDateString(),
      'acknowledgment_time' => $this->acknowledgment_time,
      'service_start_date' => $this->service_start_date?->toDateString(),
      'service_end_date' => $this->service_end_date?->toDateString(),
      'service_provider' => $this->service_provider,
      'service_description' => $this->service_description,
      'service_deliverables' => $this->service_deliverables,
      'total_value' => $this->total_value,
      'total_tax' => $this->total_tax,
      'total_discount' => $this->total_discount,
      'net_total' => $this->net_total,
      'quality_notes' => $this->quality_notes,
      'performance_notes' => $this->performance_notes,
      'quality_rating' => $this->quality_rating,
      'quality_rating_label' => $this->quality_rating_label,
      'quality_rating_color' => $this->quality_rating_color,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_approved' => $this->is_approved,
      'is_pending_approval' => $this->is_pending_approval,
      'approval_level' => $this->approval_level,
      'approval_level_label' => $this->approval_level_label,
      'acknowledged_by' => $this->acknowledgedBy?->full_name,
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
