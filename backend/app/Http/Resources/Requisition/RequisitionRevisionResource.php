<?php
// app/Http/Resources/Requisition/RequisitionRevisionResource.php

declare(strict_types=1);

namespace App\Http\Resources\Requisition;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionRevisionResource extends JsonResource
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

      // Revision Details
      'revision_number' => $this->revision_number,
      'revision_reason' => $this->revision_reason,
      'revision_notes' => $this->revision_notes,
      'changes' => $this->changes,

      // Status
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,

      // Decision Details
      'approval_notes' => $this->approval_notes,
      'rejection_reason' => $this->rejection_reason,

      // Relationships - Requested By
      'requested_by' => $this->whenLoaded('requestedBy', function () {
        return [
          'id' => $this->requestedBy->id,
          'full_name' => $this->requestedBy->full_name,
          'email' => $this->requestedBy->email,
        ];
      }),

      // Relationships - Approved By
      'approved_by' => $this->whenLoaded('approvedBy', function () {
        return [
          'id' => $this->approvedBy->id,
          'full_name' => $this->approvedBy->full_name,
          'email' => $this->approvedBy->email,
        ];
      }),

      // Relationships - Rejected By
      'rejected_by' => $this->whenLoaded('rejectedBy', function () {
        return [
          'id' => $this->rejectedBy->id,
          'full_name' => $this->rejectedBy->full_name,
          'email' => $this->rejectedBy->email,
        ];
      }),

      // Relationships - Requisition
      'requisition' => $this->whenLoaded('requisition', function () {
        return [
          'id' => $this->requisition->id,
          'reference_number' => $this->requisition->reference_number,
          'title' => $this->requisition->title,
          'status' => $this->requisition->status,
          'status_label' => $this->requisition->status_label,
          'total_amount' => $this->requisition->total_amount,
        ];
      }),

      // Dates
      'requested_at' => $this->requested_at?->format('Y-m-d H:i:s'),
      'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),
      'rejected_at' => $this->rejected_at?->format('Y-m-d H:i:s'),
      'cancelled_at' => $this->cancelled_at?->format('Y-m-d H:i:s'),
      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

      // Formatted Dates
      'formatted_requested_at' => $this->requested_at?->format('M d, Y H:i'),

      // Status Flags
      'is_pending' => $this->isPending(),
      'is_approved' => $this->isApproved(),
      'is_rejected' => $this->isRejected(),

      // Metadata
      'metadata' => $this->metadata,

      // Additional Helper Data
      'can_approve' => $this->isPending(),
      'can_reject' => $this->isPending(),
      'can_cancel' => $this->isPending(),
      'can_revise' => $this->isRejected(),
    ];
  }
}
