<?php
// app/Services/Procurement/DTOs/InvoiceDTO.php

declare(strict_types=1);

namespace App\Services\Procurement\DTOs;

use Carbon\Carbon;

class InvoiceDTO extends BaseDTO
{
  public function __construct(
    public readonly int $purchaseOrderId,
    public readonly int $supplierId,
    public readonly string $customerInvoiceNo,
    public readonly Carbon $invoiceDate,
    public readonly Carbon $dueDate,
    public readonly ?string $description,
    public readonly string $currency,
    public readonly ?float $exchangeRate,
    public readonly ?string $paymentReference,
    public readonly ?string $bankName,
    public readonly ?string $bankAccount,
    public readonly ?string $paymentTerms,
    public readonly array $items,
    public readonly ?string $notes,
    public readonly array $metadata = []
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      purchaseOrderId: $data['purchase_order_id'],
      supplierId: $data['supplier_id'],
      customerInvoiceNo: $data['customer_invoice_no'],
      invoiceDate: Carbon::parse($data['invoice_date'] ?? now()),
      dueDate: Carbon::parse($data['due_date'] ?? now()->addDays(30)),
      description: $data['description'] ?? null,
      currency: $data['currency'] ?? 'KES',
      exchangeRate: $data['exchange_rate'] ?? 1,
      paymentReference: $data['payment_reference'] ?? null,
      bankName: $data['bank_name'] ?? null,
      bankAccount: $data['bank_account'] ?? null,
      paymentTerms: $data['payment_terms'] ?? null,
      items: $data['items'] ?? [],
      notes: $data['notes'] ?? null,
      metadata: $data['metadata'] ?? []
    );
  }

  public function toArray(): array
  {
    return [
      'purchase_order_id' => $this->purchaseOrderId,
      'supplier_id' => $this->supplierId,
      'customer_invoice_no' => $this->customerInvoiceNo,
      'invoice_date' => $this->invoiceDate->toDateString(),
      'due_date' => $this->dueDate->toDateString(),
      'description' => $this->description,
      'currency' => $this->currency,
      'exchange_rate' => $this->exchangeRate,
      'payment_reference' => $this->paymentReference,
      'bank_name' => $this->bankName,
      'bank_account' => $this->bankAccount,
      'payment_terms' => $this->paymentTerms,
      'items' => $this->items,
      'notes' => $this->notes,
      'metadata' => $this->metadata,
    ];
  }
}
