<?php
// app/Services/Procurement/DTOs/SupplierQuotationDTO.php

declare(strict_types=1);

namespace App\Services\Procurement\DTOs;

use Carbon\Carbon;

class SupplierQuotationDTO extends BaseDTO
{
  public function __construct(
    public readonly int $quotationRequestId,
    public readonly int $supplierId,
    public readonly string $supplierReferenceNo,
    public readonly Carbon $submissionDate,
    public readonly Carbon $validityDate,
    public readonly ?string $deliveryTime,
    public readonly ?string $paymentTerms,
    public readonly ?string $deliveryTerms,
    public readonly ?string $warrantyTerms,
    public readonly string $currency,
    public readonly string $submissionMethod,
    public readonly ?string $uploadedFilePath,
    public readonly ?string $originalFilename,
    public readonly array $items,
    public readonly ?string $notes,
    public readonly array $metadata = []
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      quotationRequestId: $data['quotation_request_id'],
      supplierId: $data['supplier_id'],
      supplierReferenceNo: $data['supplier_reference_no'] ?? '',
      submissionDate: Carbon::parse($data['submission_date'] ?? now()),
      validityDate: Carbon::parse($data['validity_date'] ?? now()->addDays(30)),
      deliveryTime: $data['delivery_time'] ?? null,
      paymentTerms: $data['payment_terms'] ?? null,
      deliveryTerms: $data['delivery_terms'] ?? null,
      warrantyTerms: $data['warranty_terms'] ?? null,
      currency: $data['currency'] ?? 'KES',
      submissionMethod: $data['submission_method'] ?? 'system',
      uploadedFilePath: $data['uploaded_file_path'] ?? null,
      originalFilename: $data['original_filename'] ?? null,
      items: $data['items'] ?? [],
      notes: $data['notes'] ?? null,
      metadata: $data['metadata'] ?? []
    );
  }

  public function toArray(): array
  {
    return [
      'quotation_request_id' => $this->quotationRequestId,
      'supplier_id' => $this->supplierId,
      'supplier_reference_no' => $this->supplierReferenceNo,
      'submission_date' => $this->submissionDate->toDateString(),
      'validity_date' => $this->validityDate->toDateString(),
      'delivery_time' => $this->deliveryTime,
      'payment_terms' => $this->paymentTerms,
      'delivery_terms' => $this->deliveryTerms,
      'warranty_terms' => $this->warrantyTerms,
      'currency' => $this->currency,
      'submission_method' => $this->submissionMethod,
      'uploaded_file_path' => $this->uploadedFilePath,
      'original_filename' => $this->originalFilename,
      'items' => $this->items,
      'notes' => $this->notes,
      'metadata' => $this->metadata,
    ];
  }
}
