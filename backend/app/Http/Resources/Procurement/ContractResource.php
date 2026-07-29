<?php
// app/Http/Resources/Procurement/ContractResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'purchase_order_id' => $this->purchase_order_id,
      'supplier_id' => $this->supplier_id,
      'contract_number' => $this->contract_number,
      'title' => $this->title,
      'description' => $this->description,
      'start_date' => $this->start_date?->toDateString(),
      'end_date' => $this->end_date?->toDateString(),
      'contract_value' => $this->contract_value,
      'formatted_contract_value' => $this->formatted_contract_value,
      'terms_and_conditions' => $this->terms_and_conditions,
      'deliverables' => $this->deliverables,
      'scope_of_work' => $this->scope_of_work,
      'payment_schedule' => $this->payment_schedule,
      'penalty_clauses' => $this->penalty_clauses,
      'termination_clauses' => $this->termination_clauses,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_active' => $this->is_active,
      'is_expired' => $this->is_expired,
      'is_completed' => $this->is_completed,
      'is_terminated' => $this->is_terminated,
      'days_remaining' => $this->days_remaining,
      'is_renewable' => $this->is_renewable,
      'is_renewable_label' => $this->is_renewable_label,
      'renewal_period_months' => $this->renewal_period_months,
      'renewal_count' => $this->renewal_count,
      'last_renewal_date' => $this->last_renewal_date?->toDateString(),
      'next_renewal_date' => $this->next_renewal_date?->toDateString(),
      'supplier' => [
        'id' => $this->supplier?->id,
        'name' => $this->supplier_name,
        'email' => $this->supplier?->email,
        'phone' => $this->supplier?->phone,
      ],
      'approvals' => [
        'created_by' => $this->createdBy?->full_name,
        'created_at' => $this->created_at?->toDateTimeString(),
        'approved_by' => $this->approvedBy?->full_name,
        'approved_at' => $this->approved_at?->toDateTimeString(),
      ],
      'timeline' => [
        'activated_at' => $this->created_at?->toDateTimeString(),
        'completed_at' => $this->completed_at?->toDateTimeString(),
        'terminated_at' => $this->terminated_at?->toDateTimeString(),
      ],
      'created_at' => $this->created_at?->toDateTimeString(),
      'updated_at' => $this->updated_at?->toDateTimeString(),
    ];
  }
}
