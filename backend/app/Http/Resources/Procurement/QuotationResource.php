<?php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotationResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'qtn_number' => $this->qtn_number,
      'title' => $this->title,
      'description' => $this->description,
      'issue_date' => $this->issue_date?->toDateString(),
      'closing_date' => $this->closing_date?->toDateString(),
      'closing_time' => $this->closing_time,
      'delivery_terms' => $this->delivery_terms,
      'payment_terms' => $this->payment_terms,
      'special_conditions' => $this->special_conditions,
      'instructions' => $this->instructions,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_automated' => $this->is_automated,
      'is_tender' => $this->is_tender,
      'tender_number' => $this->tender_number,
      'sent_to_suppliers' => $this->sent_to_suppliers,
      'responded_suppliers' => $this->responded_suppliers,
      'declined_suppliers' => $this->declined_suppliers,
      'response_count' => $this->response_count,
      'response_rate' => $this->response_rate,
      'is_expired' => $this->is_expired,
      'is_closing_soon' => $this->is_closing_soon,
      'reminder_days' => $this->reminder_days,
      'generated_by' => $this->generatedBy ? [
        'id' => $this->generatedBy->id,
        'full_name' => $this->generatedBy->full_name,
        'email' => $this->generatedBy->email,
        'first_name' => $this->generatedBy->first_name,
        'last_name' => $this->generatedBy->last_name,
        'role_label' => $this->generatedBy->role_label,
      ] : null,
      'generated_by_name' => $this->generatedBy?->full_name,
      'requisition' => $this->whenLoaded('requisition', function () {
        $requisition = $this->requisition;

        return [
          'id' => $requisition->id,
          'reference_number' => $requisition->reference_number,
          'title' => $requisition->title,
          'description' => $requisition->description,
          'total_amount' => $requisition->total_amount,
          'formatted_total_amount' => number_format((float) $requisition->total_amount, 2),
          'status' => $requisition->status,
          'status_label' => $requisition->status_label,
          'status_color' => $requisition->status_color,
          'priority' => $requisition->priority,
          'priority_label' => $requisition->priority_label,
          'priority_color' => $requisition->priority_color,
          'type' => $requisition->type,
          'type_label' => $requisition->type_label,
          'urgency' => $requisition->urgency,
          'urgency_label' => $requisition->urgency_label,
          'justification' => $requisition->justification,
          'budget_code' => $requisition->budget_code,
          'budget_source' => $requisition->budget_source,
          'funding_source' => $requisition->funding_source,
          'project_code' => $requisition->project_code,
          'procurement_method' => $requisition->procurement_method,
          'risk_level' => $requisition->risk_level,
          'risk_level_label' => $requisition->risk_level_label,
          'is_compliant' => $requisition->is_compliant,
          'is_procurement_created' => $requisition->is_procurement_created,
          'procurement_created_at' => $requisition->procurement_created_at,
          'submitted_at' => $requisition->submitted_at,
          'approved_at' => $requisition->approved_at,
          'returned_at' => $requisition->returned_at,
          'return_count' => $requisition->return_count,
          'return_reason' => $requisition->return_reason,
          'is_editable' => $requisition->is_editable,
          'is_approvable' => $requisition->is_approvable,
          'is_returnable' => $requisition->is_returnable,
          'can_be_revised' => $requisition->can_be_revised,
          'created_at' => $requisition->created_at?->toDateTimeString(),
          'updated_at' => $requisition->updated_at?->toDateTimeString(),

          // === NEW: Requisition Type Fields ===
          'requisition_type' => $requisition->requisition_type,
          'requisition_type_label' => $requisition->requisition_type_label,
          'procurement_type' => $requisition->procurement_type,
          'procurement_type_label' => $requisition->procurement_type_label,
          'is_service_requisition' => $requisition->is_service_requisition ?? false,
          'is_goods_requisition' => $requisition->is_goods_requisition ?? true,

          // === NEW: Service-Specific Fields ===
          'service_category' => $requisition->service_category,
          'service_category_label' => $requisition->service_category_label,
          'service_scope_of_work' => $requisition->service_scope_of_work,
          'service_deliverables_expected' => $requisition->service_deliverables_expected,
          'service_expected_start_date' => $requisition->service_expected_start_date?->toDateString(),
          'service_expected_end_date' => $requisition->service_expected_end_date?->toDateString(),
          'service_estimated_duration_days' => $requisition->service_estimated_duration_days,
          'service_requires_onsite_visit' => $requisition->service_requires_onsite_visit ?? false,
          'service_special_requirements' => $requisition->service_special_requirements,
          'service_qualifications_required' => $requisition->service_qualifications_required,

          // === NEW: Additional Service Fields ===
          'service_experience_required' => $requisition->service_experience_required ?? null,
          'service_certifications_required' => $requisition->service_certifications_required ?? null,
          'service_insurance_required' => $requisition->service_insurance_required ?? false,
          'service_insurance_details' => $requisition->service_insurance_details ?? null,
          'service_contract_type' => $requisition->service_contract_type ?? null,
          'service_contract_duration' => $requisition->service_contract_duration ?? null,
          'service_renewal_options' => $requisition->service_renewal_options ?? null,

          // === NEW: Goods-Specific Fields ===
          'goods_category' => $requisition->goods_category,
          'goods_warehouse_location' => $requisition->goods_warehouse_location,
          'goods_storage_requirements' => $requisition->goods_storage_requirements,
          'goods_expected_delivery_date' => $requisition->goods_expected_delivery_date?->toDateString(),

          // === NEW: Additional Goods Fields ===
          'goods_delivery_terms' => $requisition->goods_delivery_terms ?? null,
          'goods_warranty_required' => $requisition->goods_warranty_required ?? false,
          'goods_warranty_period' => $requisition->goods_warranty_period ?? null,
          'goods_specifications' => $requisition->goods_specifications ?? null,
          'goods_quality_requirements' => $requisition->goods_quality_requirements ?? null,
          'goods_installation_required' => $requisition->goods_installation_required ?? false,

          // === Relationships ===
          'user' => $requisition->user ? [
            'id' => $requisition->user->id,
            'full_name' => $requisition->user->full_name,
            'email' => $requisition->user->email,
            'first_name' => $requisition->user->first_name,
            'last_name' => $requisition->user->last_name,
            'role' => $requisition->user->role,
            'role_label' => $requisition->user->role_label,
          ] : null,
          'department' => $requisition->department ? [
            'id' => $requisition->department->id,
            'name' => $requisition->department->name,
            'code' => $requisition->department->code,
          ] : null,
          'supplier' => $requisition->supplier ? [
            'id' => $requisition->supplier->id,
            'company_name' => $requisition->supplier->company_name,
          ] : null,
          'items' => $requisition->items ? $requisition->items->map(function ($item) {
            return [
              'id' => $item->id,
              'item_name' => $item->item_name,
              'description' => $item->description,
              'unit_of_measure' => $item->unit_of_measure,
              'quantity' => $item->quantity,
              'estimated_unit_cost' => $item->estimated_unit_cost,
              'total_cost' => $item->total_cost,
              'specifications' => $item->specifications,
              'catalog_number' => $item->catalog_number,
              'manufacturer' => $item->manufacturer,
              'model_number' => $item->model_number,
              'tax_rate' => $item->tax_rate,
              'discount_percentage' => $item->discount_percentage,
              'is_inventory_item' => $item->is_inventory_item,
              'inventory_code' => $item->inventory_code,
              'status' => $item->status,
              'status_label' => $item->status_label,
              'supplier' => $item->supplier ? [
                'id' => $item->supplier->id,
                'company_name' => $item->supplier->company_name,
              ] : null,
            ];
          }) : [],
          'approvals' => $requisition->approvals ? $requisition->approvals->map(function ($approval) {
            return [
              'id' => $approval->id,
              'level' => $approval->level,
              'level_label' => $approval->level_label,
              'status' => $approval->status,
              'status_label' => $approval->status_label,
              'comment' => $approval->comment,
              'reason' => $approval->reason,
              'is_delegated' => $approval->is_delegated,
              'reviewed_at' => $approval->reviewed_at?->toDateTimeString(),
              'due_date' => $approval->due_date?->toDateTimeString(),
              'approver' => $approval->approver ? [
                'id' => $approval->approver->id,
                'full_name' => $approval->approver->full_name,
                'email' => $approval->approver->email,
                'role' => $approval->approver->role,
                'role_label' => $approval->approver->role_label,
              ] : null,
              'delegate' => $approval->delegate ? [
                'id' => $approval->delegate->id,
                'full_name' => $approval->delegate->full_name,
                'role' => $approval->delegate->role,
                'role_label' => $approval->delegate->role_label,
              ] : null,
              'created_at' => $approval->created_at?->toDateTimeString(),
              'updated_at' => $approval->updated_at?->toDateTimeString(),
            ];
          }) : [],
          'metadata' => $requisition->metadata,
          'required_by_date' => $requisition->required_by_date,
          'required_delivery_date' => $requisition->required_delivery_date,
          'sla_status' => $requisition->sla_status,
          'sla_status_label' => $requisition->sla_status_label,
          'sla_started_at' => $requisition->sla_started_at,
          'sla_target_at' => $requisition->sla_target_at,
          'total_approval_levels' => $requisition->total_approval_levels,
          'approval_level_count' => $requisition->approval_level_count,
          'last_approval_at' => $requisition->last_approval_at?->toDateTimeString(),
          'estimated_completion_date' => $requisition->estimated_completion_date?->toDateString(),
          'currency' => $requisition->currency,
          'exchange_rate' => $requisition->exchange_rate,
          'total_amount_usd' => $requisition->total_amount_usd,
          'department_budget_balance' => $requisition->department_budget_balance,
          'department_utilization_percentage' => $requisition->department_utilization_percentage,
        ];
      }),
      'supplier_quotations' => $this->whenLoaded('supplierQuotations', function () {
        return SupplierQuotationResource::collection($this->supplierQuotations);
      }),
      'created_at' => $this->created_at?->toDateTimeString(),
      'updated_at' => $this->updated_at?->toDateTimeString(),
    ];
  }
}
