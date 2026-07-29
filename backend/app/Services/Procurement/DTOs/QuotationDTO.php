<?php
// app/Services/Procurement/DTOs/QuotationDTO.php

declare(strict_types=1);

namespace App\Services\Procurement\DTOs;

use Carbon\Carbon;

class QuotationDTO extends BaseDTO
{
  public function __construct(
    public readonly int $requisitionId,
    public readonly string $title,
    public readonly ?string $description,
    public readonly Carbon $issueDate,
    public readonly Carbon $closingDate,
    public readonly ?string $closingTime,
    public readonly ?string $deliveryTerms,
    public readonly ?string $paymentTerms,
    public readonly ?string $specialConditions,
    public readonly ?string $instructions,
    public readonly bool $isAutomated,
    public readonly bool $isTender,
    public readonly ?string $tenderNumber,
    public readonly int $reminderDays,
    public readonly array $supplierIds,
    public readonly array $metadata = []
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      requisitionId: $data['requisition_id'],
      title: $data['title'],
      description: $data['description'] ?? null,
      issueDate: Carbon::parse($data['issue_date'] ?? now()),
      closingDate: Carbon::parse($data['closing_date'] ?? now()->addDays(7)),
      closingTime: $data['closing_time'] ?? null,
      deliveryTerms: $data['delivery_terms'] ?? null,
      paymentTerms: $data['payment_terms'] ?? null,
      specialConditions: $data['special_conditions'] ?? null,
      instructions: $data['instructions'] ?? null,
      isAutomated: $data['is_automated'] ?? false,
      isTender: $data['is_tender'] ?? false,
      tenderNumber: $data['tender_number'] ?? null,
      reminderDays: $data['reminder_days'] ?? 2,
      supplierIds: $data['supplier_ids'] ?? [],
      metadata: $data['metadata'] ?? []
    );
  }

  public function toArray(): array
  {
    return [
      'requisition_id' => $this->requisitionId,
      'title' => $this->title,
      'description' => $this->description,
      'issue_date' => $this->issueDate->toDateString(),
      'closing_date' => $this->closingDate->toDateString(),
      'closing_time' => $this->closingTime,
      'delivery_terms' => $this->deliveryTerms,
      'payment_terms' => $this->paymentTerms,
      'special_conditions' => $this->specialConditions,
      'instructions' => $this->instructions,
      'is_automated' => $this->isAutomated,
      'is_tender' => $this->isTender,
      'tender_number' => $this->tenderNumber,
      'reminder_days' => $this->reminderDays,
      'metadata' => $this->metadata,
    ];
  }
}
