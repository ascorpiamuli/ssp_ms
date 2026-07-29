<?php
// app/Services/Procurement/DTOs/PurchaseOrderDTO.php

declare(strict_types=1);

namespace App\Services\Procurement\DTOs;

use Carbon\Carbon;

class PurchaseOrderDTO extends BaseDTO
{
  public function __construct(
    public readonly int $requisitionId,
    public readonly string $type, // lpo or lso
    public readonly string $title,
    public readonly ?string $description,
    public readonly Carbon $issueDate,
    public readonly Carbon $expectedDeliveryDate,
    public readonly ?string $deliveryAddress,
    public readonly ?string $deliveryContact,
    public readonly ?string $deliveryPhone,
    public readonly ?string $deliveryEmail,
    public readonly ?string $paymentTerms,
    public readonly ?string $deliveryTerms,
    public readonly ?string $specialConditions,
    public readonly ?string $termsAndConditions,
    public readonly int $validityPeriodDays,
    public readonly ?string $contractNumber,
    public readonly ?Carbon $contractStartDate,
    public readonly ?Carbon $contractEndDate,
    public readonly string $currency,
    public readonly array $items,
    public readonly array $metadata = []
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      requisitionId: $data['requisition_id'],
      type: $data['type'],
      title: $data['title'],
      description: $data['description'] ?? null,
      issueDate: Carbon::parse($data['issue_date'] ?? now()),
      expectedDeliveryDate: Carbon::parse($data['expected_delivery_date'] ?? now()->addDays(14)),
      deliveryAddress: $data['delivery_address'] ?? null,
      deliveryContact: $data['delivery_contact'] ?? null,
      deliveryPhone: $data['delivery_phone'] ?? null,
      deliveryEmail: $data['delivery_email'] ?? null,
      paymentTerms: $data['payment_terms'] ?? null,
      deliveryTerms: $data['delivery_terms'] ?? null,
      specialConditions: $data['special_conditions'] ?? null,
      termsAndConditions: $data['terms_and_conditions'] ?? null,
      validityPeriodDays: $data['validity_period_days'] ?? 30,
      contractNumber: $data['contract_number'] ?? null,
      contractStartDate: isset($data['contract_start_date']) ? Carbon::parse($data['contract_start_date']) : null,
      contractEndDate: isset($data['contract_end_date']) ? Carbon::parse($data['contract_end_date']) : null,
      currency: $data['currency'] ?? 'KES',
      items: $data['items'] ?? [],
      metadata: $data['metadata'] ?? []
    );
  }

  public function toArray(): array
  {
    return [
      'requisition_id' => $this->requisitionId,
      'type' => $this->type,
      'title' => $this->title,
      'description' => $this->description,
      'issue_date' => $this->issueDate->toDateString(),
      'expected_delivery_date' => $this->expectedDeliveryDate->toDateString(),
      'delivery_address' => $this->deliveryAddress,
      'delivery_contact' => $this->deliveryContact,
      'delivery_phone' => $this->deliveryPhone,
      'delivery_email' => $this->deliveryEmail,
      'payment_terms' => $this->paymentTerms,
      'delivery_terms' => $this->deliveryTerms,
      'special_conditions' => $this->specialConditions,
      'terms_and_conditions' => $this->termsAndConditions,
      'validity_period_days' => $this->validityPeriodDays,
      'contract_number' => $this->contractNumber,
      'contract_start_date' => $this->formatDate($this->contractStartDate),
      'contract_end_date' => $this->formatDate($this->contractEndDate),
      'currency' => $this->currency,
      'items' => $this->items,
      'metadata' => $this->metadata,
    ];
  }
}
