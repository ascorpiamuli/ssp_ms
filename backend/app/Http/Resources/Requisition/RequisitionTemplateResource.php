<?php
// app/Http/Resources/Requisition/RequisitionTemplateResource.php

declare(strict_types=1);

namespace App\Http\Resources\Requisition;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionTemplateResource extends JsonResource
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
      'department_id' => $this->department_id,

      // Template Details
      'name' => $this->name,
      'description' => $this->description,
      'items' => $this->items,
      'items_count' => $this->items_count,

      // Status
      'is_active' => $this->is_active,
      'is_public' => $this->is_public,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'visibility_label' => $this->visibility_label,

      // Relationships
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
          'email' => $this->createdBy->email,
        ];
      }),

      // Metadata
      'metadata' => $this->metadata,

      // Dates
      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
    ];
  }
}
