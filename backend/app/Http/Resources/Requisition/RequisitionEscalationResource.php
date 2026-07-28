<?php
// app/Http/Resources/Requisition/RequisitionEscalationResource.php

declare(strict_types=1);

namespace App\Http\Resources\Requisition;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionEscalationResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,

      // Escalation Details
      'reason' => $this->reason,
      'reason_label' => $this->reason_label,
      'remarks' => $this->remarks,
      'resolution_notes' => $this->resolution_notes,

      // Status
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,

      // Relationships
      'escalated_by' => $this->whenLoaded('escalatedBy', function () {
        return [
          'id' => $this->escalatedBy->id,
          'full_name' => $this->escalatedBy->full_name,
          'email' => $this->escalatedBy->email,
        ];
      }),

      'escalated_to' => $this->whenLoaded('escalatedTo', function () {
        return [
          'id' => $this->escalatedTo->id,
          'full_name' => $this->escalatedTo->full_name,
          'email' => $this->escalatedTo->email,
        ];
      }),

      'resolved_by' => $this->whenLoaded('resolvedBy', function () {
        return [
          'id' => $this->resolvedBy->id,
          'full_name' => $this->resolvedBy->full_name,
          'email' => $this->resolvedBy->email,
        ];
      }),

      'requisition' => $this->whenLoaded('requisition', function () {
        return [
          'id' => $this->requisition->id,
          'reference_number' => $this->requisition->reference_number,
          'title' => $this->requisition->title,
        ];
      }),

      // Dates
      'escalated_at' => $this->escalated_at?->format('Y-m-d H:i:s'),
      'resolved_at' => $this->resolved_at?->format('Y-m-d H:i:s'),
      'acknowledged_at' => $this->acknowledged_at?->format('Y-m-d H:i:s'),
      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

      // Formatted Dates
      'formatted_escalated_at' => $this->formatted_escalated_at,
      'escalated_by_name' => $this->escalated_by_name,
      'escalated_to_name' => $this->escalated_to_name,
      'resolved_by_name' => $this->resolved_by_name,

      // Status Flags
      'is_pending' => $this->isPending(),
      'is_resolved' => $this->isResolved(),

      // Metadata
      'metadata' => $this->metadata,
    ];
  }
}
