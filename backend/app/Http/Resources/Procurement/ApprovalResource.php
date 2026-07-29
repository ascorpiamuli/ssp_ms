<?php
// app/Http/Resources/Procurement/ApprovalResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApprovalResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'approvable_id' => $this->approvable_id,
      'approvable_type' => $this->approvable_type,
      'level' => $this->level,
      'level_label' => $this->level_label,
      'level_color' => $this->level_color,
      'approver_id' => $this->approver_id,
      'approver_name' => $this->approver_name,
      'delegate_id' => $this->delegate_id,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_pending' => $this->is_pending,
      'is_approved' => $this->is_approved,
      'is_declined' => $this->is_declined,
      'is_returned' => $this->is_returned,
      'order' => $this->order,
      'comment' => $this->comment,
      'decline_reason' => $this->decline_reason,
      'return_reason' => $this->return_reason,
      'deadline' => $this->deadline?->toDateTimeString(),
      'is_overdue' => $this->isOverdue(),
      'is_reminder_sent' => $this->is_reminder_sent,
      'reminder_sent_at' => $this->reminder_sent_at?->toDateTimeString(),
      'approved_at' => $this->approved_at?->toDateTimeString(),
      'declined_at' => $this->declined_at?->toDateTimeString(),
      'returned_at' => $this->returned_at?->toDateTimeString(),
      'created_at' => $this->created_at?->toDateTimeString(),
      'updated_at' => $this->updated_at?->toDateTimeString(),
    ];
  }
}
