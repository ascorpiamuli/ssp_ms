<?php
// app/Http/Resources/Requisition/RequisitionDelegationResource.php

declare(strict_types=1);

namespace App\Http\Resources\Requisition;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionDelegationResource extends JsonResource
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

      // Delegation Details
      'level' => $this->level,
      'level_label' => $this->level_label,
      'level_color' => $this->level_color,
      'start_date' => $this->start_date?->format('Y-m-d'),
      'end_date' => $this->end_date?->format('Y-m-d'),
      'reason' => $this->reason,

      // Status
      'is_active' => $this->is_active,
      'is_permanent' => $this->is_permanent,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_active_label' => $this->is_active_label,
      'is_permanent_label' => $this->is_permanent_label,

      // Relationships
      'approver' => $this->whenLoaded('approver', function () {
        return [
          'id' => $this->approver->id,
          'full_name' => $this->approver->full_name,
          'email' => $this->approver->email,
          'department' => $this->approver->department?->name,
        ];
      }),

      'delegate' => $this->whenLoaded('delegate', function () {
        return [
          'id' => $this->delegate->id,
          'full_name' => $this->delegate->full_name,
          'email' => $this->delegate->email,
          'department' => $this->delegate->department?->name,
        ];
      }),

      'department' => $this->whenLoaded('department', function () {
        return [
          'id' => $this->department->id,
          'name' => $this->department->name,
          'code' => $this->department->code,
        ];
      }),

      'created_by' => $this->whenLoaded('createdBy', function () {
        return [
          'id' => $this->createdBy->id,
          'full_name' => $this->createdBy->full_name,
        ];
      }),

      // Formatted Values
      'approver_name' => $this->approver_name,
      'delegate_name' => $this->delegate_name,
      'department_name' => $this->department_name,
      'formatted_start_date' => $this->formatted_start_date,
      'formatted_end_date' => $this->formatted_end_date,

      // Status Flags
      'is_expired' => $this->is_expired,
      'is_upcoming' => $this->is_upcoming,
      'is_currently_active' => $this->isCurrentlyActive(),

      // Metadata
      'metadata' => $this->metadata,

      // Dates
      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
    ];
  }
}
