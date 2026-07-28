<?php
// app/Http/Resources/Budget/RequisitionBudgetResource.php

declare(strict_types=1);

namespace App\Http\Resources\Budget;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionBudgetResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,

      'budget_code' => $this->budget_code,
      'budget_line_item' => $this->budget_line_item,
      'budget_category' => $this->budget_category,
      'budget_type' => $this->budget_type,
      'budget_type_label' => $this->budget_type_label,

      'project_id' => $this->project_id,
      'grant_code' => $this->grant_code,

      'amounts' => [
        'allocated_amount' => $this->allocated_amount,
        'formatted_allocated_amount' => $this->formatted_allocated_amount,
        'utilized_amount' => $this->utilized_amount,
        'formatted_utilized_amount' => $this->formatted_utilized_amount,
        'remaining_amount' => $this->remaining_amount,
        'formatted_remaining_amount' => $this->formatted_remaining_amount,
        'requested_amount' => $this->requested_amount,
        'formatted_requested_amount' => $this->formatted_requested_amount,
        'utilization_percentage' => $this->utilization_percentage,
      ],

      'fiscal' => [
        'fiscal_year' => $this->fiscal_year,
        'fiscal_quarter' => $this->fiscal_quarter,
        'budget_start_date' => $this->budget_start_date?->format('Y-m-d'),
        'budget_end_date' => $this->budget_end_date?->format('Y-m-d'),
      ],

      'movement' => [
        'is_transferred' => $this->is_transferred,
        'transferred_at' => $this->transferred_at?->format('Y-m-d H:i:s'),
        'transferred_from' => $this->transferred_from,
        'transferred_to' => $this->transferred_to,
        'is_carry_over' => $this->is_carry_over,
        'carry_over_amount' => $this->carry_over_amount,
      ],

      'variances' => [
        'variance_amount' => $this->variance_amount,
        'variance_percentage' => $this->variance_percentage,
        'variance_reason' => $this->variance_reason,
      ],

      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,

      'verification' => [
        'verified_by' => $this->whenLoaded('verifiedBy', function () {
          return [
            'id' => $this->verifiedBy->id,
            'full_name' => $this->verifiedBy->full_name,
          ];
        }),
        'verified_at' => $this->verified_at?->format('Y-m-d H:i:s'),
        'verification_notes' => $this->verification_notes,
      ],

      'authorization' => [
        'authorized_by' => $this->whenLoaded('authorizedBy', function () {
          return [
            'id' => $this->authorizedBy->id,
            'full_name' => $this->authorizedBy->full_name,
          ];
        }),
        'authorized_at' => $this->authorized_at?->format('Y-m-d H:i:s'),
        'authorization_notes' => $this->authorization_notes,
      ],

      'metadata' => $this->metadata,
      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
    ];
  }
}
