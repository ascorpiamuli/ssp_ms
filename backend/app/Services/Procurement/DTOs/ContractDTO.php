<?php
// app/Services/Procurement/DTOs/ContractDTO.php

declare(strict_types=1);

namespace App\Services\Procurement\DTOs;

use Carbon\Carbon;

class ContractDTO extends BaseDTO
{
  public function __construct(
    public readonly int $requisitionId,
    public readonly int $supplierId,
    public readonly ?int $purchaseOrderId,
    public readonly string $title,
    public readonly ?string $description,
    public readonly Carbon $startDate,
    public readonly Carbon $endDate,
    public readonly float $contractValue,
    public readonly ?string $termsAndConditions,
    public readonly ?string $deliverables,
    public readonly ?string $scopeOfWork,
    public readonly ?string $paymentSchedule,
    public readonly ?string $penaltyClauses,
    public readonly ?string $terminationClauses,
    public readonly bool $isRenewable,
    public readonly ?int $renewalPeriodMonths,
    public readonly ?string $contractNumber,
    public readonly array $metadata = []
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      requisitionId: $data['requisition_id'],
      supplierId: $data['supplier_id'],
      purchaseOrderId: $data['purchase_order_id'] ?? null,
      title: $data['title'],
      description: $data['description'] ?? null,
      startDate: Carbon::parse($data['start_date'] ?? now()),
      endDate: Carbon::parse($data['end_date'] ?? now()->addYear()),
      contractValue: $data['contract_value'] ?? 0,
      termsAndConditions: $data['terms_and_conditions'] ?? null,
      deliverables: $data['deliverables'] ?? null,
      scopeOfWork: $data['scope_of_work'] ?? null,
      paymentSchedule: $data['payment_schedule'] ?? null,
      penaltyClauses: $data['penalty_clauses'] ?? null,
      terminationClauses: $data['termination_clauses'] ?? null,
      isRenewable: $data['is_renewable'] ?? false,
      renewalPeriodMonths: $data['renewal_period_months'] ?? null,
      contractNumber: $data['contract_number'] ?? null,
      metadata: $data['metadata'] ?? []
    );
  }

  public function toArray(): array
  {
    return [
      'requisition_id' => $this->requisitionId,
      'supplier_id' => $this->supplierId,
      'purchase_order_id' => $this->purchaseOrderId,
      'title' => $this->title,
      'description' => $this->description,
      'start_date' => $this->startDate->toDateString(),
      'end_date' => $this->endDate->toDateString(),
      'contract_value' => $this->contractValue,
      'terms_and_conditions' => $this->termsAndConditions,
      'deliverables' => $this->deliverables,
      'scope_of_work' => $this->scopeOfWork,
      'payment_schedule' => $this->paymentSchedule,
      'penalty_clauses' => $this->penaltyClauses,
      'termination_clauses' => $this->terminationClauses,
      'is_renewable' => $this->isRenewable,
      'renewal_period_months' => $this->renewalPeriodMonths,
      'contract_number' => $this->contractNumber,
      'metadata' => $this->metadata,
    ];
  }
}
