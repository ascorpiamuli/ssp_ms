<?php
// app/Http/Resources/Approval/ApprovalWorkflowResource.php

declare(strict_types=1);

namespace App\Http\Resources\Approval;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApprovalWorkflowResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'department_id' => $this->department_id,
      'name' => $this->name,
      'description' => $this->description,
      'approval_levels' => $this->approval_levels,
      'approval_levels_count' => $this->approval_levels_count,
      'rules' => $this->rules,
      'conditions' => $this->conditions,

      'is_active' => $this->is_active,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_default' => $this->is_default,
      'is_default_label' => $this->is_default_label,

      'amounts' => [
        'min_amount' => $this->min_amount,
        'max_amount' => $this->max_amount,
        'threshold_level_1' => $this->threshold_level_1,
        'threshold_level_2' => $this->threshold_level_2,
        'threshold_level_3' => $this->threshold_level_3,
      ],

      'requirements' => [
        'required_approvals' => $this->required_approvals,
        'require_all_approvals' => $this->require_all_approvals,
        'allow_delegation' => $this->allow_delegation,
        'allow_parallel_approvals' => $this->allow_parallel_approvals,
        'require_sequential' => $this->require_sequential,
        'max_approvers' => $this->max_approvers,
      ],

      'sla' => [
        'sla_hours' => $this->sla_hours,
        'reminder_hours' => $this->reminder_hours,
        'escalation_hours' => $this->escalation_hours,
      ],

      'flexibility' => [
        'allow_override' => $this->allow_override,
        'allow_reassignment' => $this->allow_reassignment,
        'allow_skip' => $this->allow_skip,
        'allow_revision' => $this->allow_revision,
      ],

      'revisions' => [
        'max_revisions' => $this->max_revisions,
        'require_justification_for_revision' => $this->require_justification_for_revision,
        'auto_approve_after_revision' => $this->auto_approve_after_revision,
      ],

      'created_by' => $this->whenLoaded('createdBy', function () {
        return [
          'id' => $this->createdBy->id,
          'full_name' => $this->createdBy->full_name,
        ];
      }),

      'updated_by' => $this->whenLoaded('updatedBy', function () {
        return [
          'id' => $this->updatedBy->id,
          'full_name' => $this->updatedBy->full_name,
        ];
      }),

      'department' => $this->whenLoaded('department', function () {
        return [
          'id' => $this->department->id,
          'name' => $this->department->name,
          'code' => $this->department->code,
        ];
      }),

      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
    ];
  }
}
