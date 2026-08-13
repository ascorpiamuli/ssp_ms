<?php
// app/Http/Resources/Requisition/RequisitionResource.php

declare(strict_types=1);

namespace App\Http\Resources\Requisition;

use App\Http\Resources\Approval\ApprovalResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'reference_number' => $this->reference_number,
      'title' => $this->title,
      'description' => $this->description,

      'total_amount' => (float) $this->total_amount,
      'formatted_total_amount' => number_format((float) $this->total_amount, 2),

      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'priority' => $this->priority,
      'priority_label' => $this->priority_label,
      'priority_color' => $this->priority_color,
      'type' => $this->type,
      'type_label' => $this->type_label,
      'urgency' => $this->urgency,
      'urgency_label' => $this->urgency_label,
      'justification' => $this->justification,
      'required_by_date' => $this->required_by_date?->format('Y-m-d'),
      'required_delivery_date' => $this->required_delivery_date?->format('Y-m-d H:i:s'),

      'budget_code' => $this->budget_code,
      'project_code' => $this->project_code,

      'risk_level' => $this->risk_level,
      'risk_level_label' => $this->risk_level_label,
      'risk_mitigation' => $this->risk_mitigation,
      'is_compliant' => $this->is_compliant,

      'submitted_at' => $this->submitted_at?->format('Y-m-d H:i:s'),
      'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),
      'returned_at' => $this->returned_at?->format('Y-m-d H:i:s'),
      'cancelled_at' => $this->cancelled_at?->format('Y-m-d H:i:s'),
      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

      // ✅ User with role label and description
      'user' => $this->whenLoaded('user', function () {
        $user = $this->user;

        // Get the user's primary role with label and description
        $primaryRole = $user->roles()->first();

        return [
          'id' => $user->id,
          'full_name' => $user->full_name,
          'email' => $user->email,
          'avatar_url' => $user->avatar_url ?? null,
          'avatar' => $user->avatar ?? null,
          'role' => $primaryRole ? $primaryRole->name : null,
          'role_label' => $primaryRole ? ($primaryRole->label ?? null) : null,
          'role_description' => $primaryRole ? ($primaryRole->description ?? null) : null,
          'roles' => $user->roles->map(function ($role) {
            return [
              'name' => $role->name,
              'label' => $role->label,
              'description' => $role->description,
            ];
          })->toArray(),
        ];
      }),

      // Department
      'department' => $this->whenLoaded('department', function () {
        return [
          'id' => $this->department->id,
          'name' => $this->department->name,
          'code' => $this->department->code,
        ];
      }),

      // Supplier
      'supplier' => $this->whenLoaded('supplier', function () {
        return [
          'id' => $this->supplier->id,
          'company_name' => $this->supplier->company_name,
        ];
      }),

      // ✅ ITEMS - Loaded from relationship
      'items' => $this->whenLoaded('items', function () {
        return $this->items->map(function ($item) {
          return [
            'id' => $item->id,
            'item_name' => $item->item_name,
            'description' => $item->description,
            'unit_of_measure' => $item->unit_of_measure,
            'quantity' => (float) $item->quantity,
            'estimated_unit_cost' => (float) $item->estimated_unit_cost,
            'total_cost' => (float) $item->total_cost,
            'specifications' => $item->specifications,
            'catalog_number' => $item->catalog_number,
            'manufacturer' => $item->manufacturer,
            'model_number' => $item->model_number,
            'tax_rate' => (float) $item->tax_rate,
            'discount_percentage' => (float) $item->discount_percentage,
            'is_inventory_item' => (bool) $item->is_inventory_item,
            'inventory_code' => $item->inventory_code,
            'status' => $item->status,
            'status_label' => $item->status_label ?? $item->status,
            'status_color' => $item->status_color ?? 'gray',
            'created_at' => $item->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $item->updated_at?->format('Y-m-d H:i:s'),
          ];
        });
      }, []),

      // ✅ APPROVALS - Loaded from relationship with role labels
      'approvals' => $this->whenLoaded('approvals', function () {
        return $this->approvals->map(function ($approval) {
          return [
            'id' => $approval->id,
            'requisition_id' => $approval->requisition_id,
            'approver_id' => $approval->approver_id,
            'approver' => $approval->approver ? [
              'id' => $approval->approver->id,
              'full_name' => $approval->approver->full_name,
              'email' => $approval->approver->email,
              'avatar_url' => $approval->approver->avatar_url ?? null,
              'avatar' => $approval->approver->avatar ?? null,
              'role' => $approval->approver->roles->first() ? $approval->approver->roles->first()->name : null,
              'role_label' => $approval->approver->roles->first() ? ($approval->approver->roles->first()->label ?? null) : null,
            ] : null,
            'delegate_id' => $approval->delegate_id,
            'delegate' => $approval->delegate ? [
              'id' => $approval->delegate->id,
              'full_name' => $approval->delegate->full_name,
              'email' => $approval->delegate->email,
              'avatar_url' => $approval->delegate->avatar_url ?? null,
              'avatar' => $approval->delegate->avatar ?? null,
              'role' => $approval->delegate->roles->first() ? $approval->delegate->roles->first()->name : null,
              'role_label' => $approval->delegate->roles->first() ? ($approval->delegate->roles->first()->label ?? null) : null,
            ] : null,
            'level' => $approval->level,
            'level_name' => $approval->level_name ?? $approval->level,
            'status' => $approval->status,
            'status_label' => $approval->status_label ?? $approval->status,
            'comment' => $approval->comment,
            'reason' => $approval->reason,
            'is_delegated' => (bool) $approval->is_delegated,
            'assigned_at' => $approval->assigned_at?->format('Y-m-d H:i:s'),
            'reviewed_at' => $approval->reviewed_at?->format('Y-m-d H:i:s'),
            'due_date' => $approval->due_date?->format('Y-m-d H:i:s'),
            'created_at' => $approval->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $approval->updated_at?->format('Y-m-d H:i:s'),
          ];
        });
      }, []),

      // Flags
      'is_editable' => $this->is_editable,
      'is_approvable' => $this->is_approvable,
      'is_returnable' => $this->is_returnable,
      'can_be_revised' => $this->can_be_revised,
    ];
  }
}
