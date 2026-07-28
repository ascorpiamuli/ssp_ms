<?php
// app/Http/Resources/Approval/ApprovalResource.php

declare(strict_types=1);

namespace App\Http\Resources\Approval;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApprovalResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'approver_id' => $this->approver_id,
      'approver' => $this->whenLoaded('approver', function () {
        return [
          'id' => $this->approver->id,
          'full_name' => $this->approver->full_name,
          'email' => $this->approver->email,
        ];
      }),
      'delegate_id' => $this->delegate_id,
      'delegate' => $this->whenLoaded('delegate', function () {
        return [
          'id' => $this->delegate->id,
          'full_name' => $this->delegate->full_name,
          'email' => $this->delegate->email,
        ];
      }),
      'original_approver_id' => $this->original_approver_id,
      'level' => $this->level,
      'level_label' => $this->level_label,
      'level_color' => $this->level_color,
      'order' => $this->order,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      // ✅ Use the correct column names
      'comment' => $this->comment,
      'reason' => $this->decline_reason ?? $this->return_reason ?? null,
      'decline_reason' => $this->decline_reason,
      'return_reason' => $this->return_reason,
      'revision_notes' => $this->revision_notes,
      'revision_count' => $this->revision_count,
      'is_delegated' => (bool) $this->is_delegated,
      'is_required' => (bool) $this->is_required,
      'assigned_at' => $this->assigned_at?->format('Y-m-d H:i:s'),
      'received_at' => $this->received_at?->format('Y-m-d H:i:s'),
      'viewed_at' => $this->viewed_at?->format('Y-m-d H:i:s'),
      'reviewed_at' => $this->approved_at ?? $this->declined_at ?? $this->returned_at,
      'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),
      'declined_at' => $this->declined_at?->format('Y-m-d H:i:s'),
      'returned_at' => $this->returned_at?->format('Y-m-d H:i:s'),
      'delegated_at' => $this->delegated_at?->format('Y-m-d H:i:s'),
      'escalated_at' => $this->escalated_at?->format('Y-m-d H:i:s'),
      'reminded_at' => $this->reminded_at?->format('Y-m-d H:i:s'),
      'last_revised_at' => $this->last_revised_at?->format('Y-m-d H:i:s'),
      'due_date' => $this->due_date?->format('Y-m-d H:i:s'),
      'response_time_hours' => $this->response_time_hours,
      'response_time_label' => $this->response_time_label,
      'notification_sent' => (bool) $this->notification_sent,
      'notification_sent_at' => $this->notification_sent_at?->format('Y-m-d H:i:s'),
      'notification_count' => $this->notification_count,
      'reminder_count' => $this->reminder_count,
      'conditions' => $this->conditions,
      'condition_notes' => $this->condition_notes,
      'action_taken' => $this->action_taken,
      'device_info' => $this->device_info,
      'ip_address' => $this->ip_address,
      'digital_signature' => $this->digital_signature,
      'is_signed' => (bool) $this->is_signed,
      'signed_at' => $this->signed_at?->format('Y-m-d H:i:s'),
      'is_group_approval' => (bool) $this->is_group_approval,
      'approval_group' => $this->approval_group,
      'group_order' => $this->group_order,
      'metadata' => $this->metadata,
      'is_pending' => $this->is_pending,
      'is_approved' => $this->is_approved,
      'is_declined' => $this->is_declined,
      'is_delegated_flag' => $this->is_delegated,
      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
    ];
  }
}
