<?php
// app/Http/Resources/Requisition/RequisitionHistoryResource.php

declare(strict_types=1);

namespace App\Http\Resources\Requisition;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionHistoryResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'action' => $this->action,
      'action_label' => $this->action_label,
      'action_color' => $this->action_color,
      'old_values' => $this->old_values,
      'new_values' => $this->new_values,
      'comment' => $this->comment,
      'revision_number' => $this->revision_number,
      'revision_reason' => $this->revision_reason,
      'ip_address' => $this->ip_address,

      'user' => $this->whenLoaded('user', function () {
        return [
          'id' => $this->user->id,
          'full_name' => $this->user->full_name,
          'email' => $this->user->email,
        ];
      }),

      'is_status_change' => $this->isStatusChange(),
      'old_status' => $this->getOldStatus(),
      'new_status' => $this->getNewStatus(),

      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'formatted_created_at' => $this->formatted_created_at,
    ];
  }
}
