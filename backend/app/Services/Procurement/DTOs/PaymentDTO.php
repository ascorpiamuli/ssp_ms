<?php
// app/Services/Procurement/DTOs/PaymentDTO.php

declare(strict_types=1);

namespace App\Services\Procurement\DTOs;

use Carbon\Carbon;

class PaymentDTO extends BaseDTO
{
  public function __construct(
    // For Payment Voucher
    public readonly int $invoiceId,
    public readonly string $payeeName,
    public readonly ?string $payeeAddress,
    public readonly ?string $payeePhone,
    public readonly ?string $payeeEmail,
    public readonly ?string $amountWords,
    public readonly ?string $bankName,
    public readonly ?string $accountNumber,
    public readonly ?string $bankBranch,
    public readonly string $paymentMethod,
    public readonly ?string $paymentDescription,
    public readonly ?string $notes,
    public readonly array $metadata = [],
    // For Cheque (optional)
    public readonly ?string $chequeNumber = null,
    public readonly ?Carbon $issuedDate = null,
    public readonly ?string $payeeAddressForCheque = null,
    public readonly ?string $bankSortCode = null
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      invoiceId: $data['invoice_id'],
      payeeName: $data['payee_name'],
      payeeAddress: $data['payee_address'] ?? null,
      payeePhone: $data['payee_phone'] ?? null,
      payeeEmail: $data['payee_email'] ?? null,
      amountWords: $data['amount_words'] ?? null,
      bankName: $data['bank_name'] ?? null,
      accountNumber: $data['account_number'] ?? null,
      bankBranch: $data['bank_branch'] ?? null,
      paymentMethod: $data['payment_method'] ?? 'cheque',
      paymentDescription: $data['payment_description'] ?? null,
      notes: $data['notes'] ?? null,
      metadata: $data['metadata'] ?? [],
      chequeNumber: $data['cheque_number'] ?? null,
      issuedDate: isset($data['issued_date']) ? Carbon::parse($data['issued_date']) : null,
      payeeAddressForCheque: $data['payee_address_cheque'] ?? null,
      bankSortCode: $data['bank_sort_code'] ?? null
    );
  }

  public function toArray(): array
  {
    return [
      'invoice_id' => $this->invoiceId,
      'payee_name' => $this->payeeName,
      'payee_address' => $this->payeeAddress,
      'payee_phone' => $this->payeePhone,
      'payee_email' => $this->payeeEmail,
      'amount_words' => $this->amountWords,
      'bank_name' => $this->bankName,
      'account_number' => $this->accountNumber,
      'bank_branch' => $this->bankBranch,
      'payment_method' => $this->paymentMethod,
      'payment_description' => $this->paymentDescription,
      'notes' => $this->notes,
      'metadata' => $this->metadata,
      'cheque_number' => $this->chequeNumber,
      'issued_date' => $this->formatDate($this->issuedDate),
      'payee_address_cheque' => $this->payeeAddressForCheque,
      'bank_sort_code' => $this->bankSortCode,
    ];
  }
}
