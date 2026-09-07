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

      // === REQUISITION TYPE FIELDS ===
      'requisition_type' => $this->requisition_type,
      'requisition_type_label' => $this->requisition_type_label,
      'procurement_type' => $this->procurement_type,
      'procurement_type_label' => $this->procurement_type_label,

      // === SERVICE-SPECIFIC FIELDS ===
      'service_category' => $this->service_category,
      'service_category_label' => $this->service_category_label,
      'service_scope_of_work' => $this->service_scope_of_work,
      'service_deliverables_expected' => $this->service_deliverables_expected,
      'service_expected_start_date' => $this->service_expected_start_date?->format('Y-m-d'),
      'service_expected_end_date' => $this->service_expected_end_date?->format('Y-m-d'),
      'service_estimated_duration_days' => $this->service_estimated_duration_days,
      'service_requires_onsite_visit' => (bool) $this->service_requires_onsite_visit,
      'service_special_requirements' => $this->service_special_requirements,
      'service_qualifications_required' => $this->service_qualifications_required,

      // === GOODS-SPECIFIC FIELDS ===
      'goods_category' => $this->goods_category,
      'goods_warehouse_location' => $this->goods_warehouse_location,
      'goods_storage_requirements' => $this->goods_storage_requirements,
      'goods_expected_delivery_date' => $this->goods_expected_delivery_date?->format('Y-m-d'),

      // === FLAGS ===
      'is_service_requisition' => $this->is_service_requisition,
      'is_goods_requisition' => $this->is_goods_requisition,
      'will_generate_lpo' => $this->procurement_type === 'goods',
      'will_generate_lso' => $this->procurement_type === 'services',
      'order_type' => $this->procurement_type === 'goods' ? 'LPO' : ($this->procurement_type === 'services' ? 'LSO' : null),

      // === FINANCIAL FIELDS ===
      'total_amount' => (float) $this->total_amount,
      'formatted_total_amount' => number_format((float) $this->total_amount, 2),

      // === STATUS & PRIORITY ===
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

      // === JUSTIFICATION & DATES ===
      'justification' => $this->justification,
      'required_by_date' => $this->required_by_date?->format('Y-m-d'),
      'required_delivery_date' => $this->required_delivery_date?->format('Y-m-d H:i:s'),

      // === BUDGET FIELDS ===
      'budget_code' => $this->budget_code,
      'budget_source' => $this->budget_source,
      'funding_source' => $this->funding_source,
      'project_code' => $this->project_code,
      'budget_allocated' => (float) $this->budget_allocated,
      'budget_utilized' => (float) $this->budget_utilized,

      // === PROCUREMENT FIELDS ===
      'procurement_method' => $this->procurement_method,
      'is_framework_agreement' => (bool) $this->is_framework_agreement,
      'framework_agreement_id' => $this->framework_agreement_id,
      'is_procurement_created' => (bool) $this->is_procurement_created,
      'procurement_created_at' => $this->procurement_created_at?->format('Y-m-d H:i:s'),
      'procurement_plan_id' => $this->procurement_plan_id,

      // === RISK & COMPLIANCE ===
      'risk_level' => $this->risk_level,
      'risk_level_label' => $this->risk_level_label,
      'risk_mitigation' => $this->risk_mitigation,
      'is_compliant' => (bool) $this->is_compliant,
      'compliance_notes' => $this->compliance_notes,

      // === SLA & APPROVAL METRICS ===
      'sla_status' => $this->sla_status,
      'sla_status_label' => $this->sla_status_label,
      'sla_started_at' => $this->sla_started_at?->format('Y-m-d H:i:s'),
      'sla_target_at' => $this->sla_target_at?->format('Y-m-d H:i:s'),
      'approval_level_count' => $this->approval_level_count,
      'total_approval_levels' => $this->total_approval_levels,
      'last_approval_at' => $this->last_approval_at?->format('Y-m-d H:i:s'),
      'estimated_completion_date' => $this->estimated_completion_date?->format('Y-m-d H:i:s'),

      // === CURRENCY ===
      'currency' => $this->currency,
      'exchange_rate' => (float) $this->exchange_rate,
      'total_amount_usd' => $this->total_amount_usd ? (float) $this->total_amount_usd : null,

      // === DEPARTMENT BUDGET TRACKING ===
      'department_budget_balance' => $this->department_budget_balance ? (float) $this->department_budget_balance : null,
      'department_utilization_percentage' => $this->department_utilization_percentage ? (float) $this->department_utilization_percentage : null,

      // === REVISION TRACKING ===
      'revision_count' => $this->revision_count,
      'last_revised_at' => $this->last_revised_at?->format('Y-m-d H:i:s'),
      'revision_notes' => $this->revision_notes,
      'revision_status' => $this->revision_status,
      'last_revised_by' => $this->last_revised_by,

      // === TIMESTAMPS ===
      'submitted_at' => $this->submitted_at?->format('Y-m-d H:i:s'),
      'submitted_by' => $this->submitted_by,
      'hod_approved_at' => $this->hod_approved_at?->format('Y-m-d H:i:s'),
      'hod_approver_id' => $this->hod_approver_id,
      'hod_declined_at' => $this->hod_declined_at?->format('Y-m-d H:i:s'),
      'hod_decline_reason' => $this->hod_decline_reason,
      'accountant_approved_at' => $this->accountant_approved_at?->format('Y-m-d H:i:s'),
      'accountant_approver_id' => $this->accountant_approver_id,
      'accountant_declined_at' => $this->accountant_declined_at?->format('Y-m-d H:i:s'),
      'accountant_decline_reason' => $this->accountant_decline_reason,
      'principal_approved_at' => $this->principal_approved_at?->format('Y-m-d H:i:s'),
      'principal_approver_id' => $this->principal_approver_id,
      'principal_declined_at' => $this->principal_declined_at?->format('Y-m-d H:i:s'),
      'principal_decline_reason' => $this->principal_decline_reason,
      'final_approved_at' => $this->final_approved_at?->format('Y-m-d H:i:s'),
      'final_approver_id' => $this->final_approver_id,
      'final_declined_at' => $this->final_declined_at?->format('Y-m-d H:i:s'),
      'final_decline_reason' => $this->final_decline_reason,
      'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),
      'declined_at' => $this->declined_at?->format('Y-m-d H:i:s'),
      'returned_at' => $this->returned_at?->format('Y-m-d H:i:s'),
      'returned_by' => $this->returned_by,
      'return_reason' => $this->return_reason,
      'return_count' => $this->return_count,
      'last_returned_at' => $this->last_returned_at?->format('Y-m-d H:i:s'),
      'cancelled_at' => $this->cancelled_at?->format('Y-m-d H:i:s'),
      'cancelled_by' => $this->cancelled_by,
      'cancellation_reason' => $this->cancellation_reason,
      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
      'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),

      // === USER WITH ROLE ===
      'user' => $this->whenLoaded('user', function () {
        $user = $this->user;
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

      // === DEPARTMENT ===
      'department' => $this->whenLoaded('department', function () {
        return [
          'id' => $this->department->id,
          'name' => $this->department->name,
          'code' => $this->department->code,
        ];
      }),

      // === SUPPLIER ===
      'supplier' => $this->whenLoaded('supplier', function () {
        return [
          'id' => $this->supplier->id,
          'company_name' => $this->supplier->company_name,
          'company_email' => $this->supplier->company_email,
          'company_phone' => $this->supplier->company_phone,
        ];
      }),

      // === APPROVERS ===
      'hod_approver' => $this->whenLoaded('hodApprover', function () {
        return [
          'id' => $this->hodApprover->id,
          'full_name' => $this->hodApprover->full_name,
          'email' => $this->hodApprover->email,
        ];
      }),
      'accountant_approver' => $this->whenLoaded('accountantApprover', function () {
        return [
          'id' => $this->accountantApprover->id,
          'full_name' => $this->accountantApprover->full_name,
          'email' => $this->accountantApprover->email,
        ];
      }),
      'principal_approver' => $this->whenLoaded('principalApprover', function () {
        return [
          'id' => $this->principalApprover->id,
          'full_name' => $this->principalApprover->full_name,
          'email' => $this->principalApprover->email,
        ];
      }),
      'final_approver' => $this->whenLoaded('finalApprover', function () {
        return [
          'id' => $this->finalApprover->id,
          'full_name' => $this->finalApprover->full_name,
          'email' => $this->finalApprover->email,
        ];
      }),

      // === ITEMS ===
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

      // === APPROVALS ===
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

      // === FLAGS ===
      'is_editable' => $this->is_editable,
      'is_approvable' => $this->is_approvable,
      'is_returnable' => $this->is_returnable,
      'can_be_revised' => $this->can_be_revised,

      // === METADATA ===
      'metadata' => $this->metadata,
      'custom_fields' => $this->custom_fields,
      'ip_address' => $this->ip_address,
      'user_agent' => $this->user_agent,
    ];
  }
}
