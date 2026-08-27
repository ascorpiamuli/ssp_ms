<?php
// app/Services/Procurement/Services/PaymentService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\Invoice;
use App\Models\PaymentVoucher;
use App\Models\Cheque;
use App\Services\Procurement\Base\BaseService;
use App\Services\Procurement\Contracts\Services\PaymentServiceInterface;
use App\Services\Procurement\Contracts\Repositories\PaymentRepositoryInterface;
use App\Services\Procurement\Contracts\Utilities\ReferenceNumberGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\PdfGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\DTOs\PaymentDTO;
use App\Services\Procurement\Exceptions\PaymentException;
use App\Services\Admin\AuditLogService;

class PaymentService extends BaseService implements PaymentServiceInterface
{
  public function __construct(
    protected PaymentRepositoryInterface $repository,
    protected ReferenceNumberGeneratorInterface $referenceGenerator,
    protected PdfGeneratorInterface $pdfGenerator,
    protected NotificationDispatcherInterface $notificationDispatcher,
    protected AuditLogService $auditLogService
  ) {
    parent::__construct();
  }

  public function preparePaymentVoucher(PaymentDTO $dto): PaymentVoucher
  {
    $invoice = Invoice::with(['requisition', 'purchaseOrder', 'supplier'])->find($dto->invoiceId);

    if (!$invoice) {
      throw PaymentException::invoiceNotFound($dto->invoiceId);
    }

    if ($invoice->status !== 'approved') {
      throw PaymentException::invoiceNotApproved();
    }

    $existing = PaymentVoucher::where('invoice_id', $invoice->id)
      ->whereNotIn('status', ['cancelled'])
      ->first();

    if ($existing) {
      throw PaymentException::voucherAlreadyExists();
    }

    return $this->transaction(function () use ($invoice, $dto) {
      $voucher = $this->repository->createPaymentVoucher([
        'requisition_id' => $invoice->requisition_id,
        'invoice_id' => $invoice->id,
        'purchase_order_id' => $invoice->purchase_order_id,
        'supplier_id' => $invoice->supplier_id,
        'voucher_number' => $this->referenceGenerator->generateVoucherNumber(),
        'payee_name' => $dto->payeeName,
        'payee_address' => $dto->payeeAddress,
        'payee_phone' => $dto->payeePhone,
        'payee_email' => $dto->payeeEmail,
        'amount' => $invoice->total_amount,
        'amount_words' => $dto->amountWords ?? $this->numberToWords($invoice->total_amount),
        'bank_name' => $dto->bankName,
        'account_number' => $dto->accountNumber,
        'bank_branch' => $dto->bankBranch,
        'payment_method' => $dto->paymentMethod,
        'status' => 'draft',
        'prepared_by' => $this->getCurrentUserId(),
        'payment_description' => $dto->paymentDescription,
        'notes' => $dto->notes,
        'metadata' => $dto->metadata,
      ]);

      // Audit: Log voucher creation
      $this->auditLogService->logModelCreated(
        $voucher,
        "Payment Voucher {$voucher->voucher_number} prepared for invoice #{$invoice->id}"
      );

      if ($this->getCurrentUserId()) {
        $voucher->update([
          'digital_signature_preparer' => $voucher->generateDigitalSignature('preparer', $this->getCurrentUserId()),
        ]);
      }

      $this->notificationDispatcher->notify('voucher_prepared', [
        'voucher_id' => $voucher->id,
        'voucher_number' => $voucher->voucher_number,
        'invoice_id' => $invoice->id,
        'amount' => $voucher->amount,
      ]);

      $this->logHistory(
        $invoice->requisition_id,
        'voucher_prepared',
        'payment_voucher',
        $voucher->id,
        null,
        ['voucher_number' => $voucher->voucher_number],
        "Payment Voucher {$voucher->voucher_number} prepared"
      );

      return $voucher;
    });
  }

  public function getPaymentVoucher(int $voucherId): PaymentVoucher
  {
    $voucher = $this->repository->findPaymentVoucher($voucherId);

    if (!$voucher) {
      throw PaymentException::voucherNotFound($voucherId);
    }

    return $voucher;
  }

  public function getPaymentVouchersForInvoice(int $invoiceId): array
  {
    return $this->repository->getPaymentVouchersForInvoice($invoiceId);
  }

  public function endorsePaymentVoucher(int $voucherId, int $userId, ?string $signature = null): PaymentVoucher
  {
    $voucher = $this->getPaymentVoucher($voucherId);

    if ($voucher->status !== 'draft') {
      throw PaymentException::voucherMustBeDraft();
    }

    return $this->transaction(function () use ($voucher, $userId, $signature) {
      $oldValues = $voucher->toArray();

      $voucher->markAsEndorsed($userId, $signature ?? $voucher->generateDigitalSignature('endorsement', $userId));

      // Audit: Log voucher endorsement
      $this->auditLogService->logModelUpdated(
        $voucher,
        $oldValues,
        "Payment Voucher {$voucher->voucher_number} endorsed by user #{$userId}"
      );

      $this->notificationDispatcher->notify('voucher_endorsed', [
        'voucher_id' => $voucher->id,
        'voucher_number' => $voucher->voucher_number,
        'endorsed_by' => $userId,
      ]);

      $this->logHistory(
        $voucher->requisition_id,
        'voucher_endorsed',
        'payment_voucher',
        $voucher->id,
        null,
        ['status' => 'endorsed'],
        "Payment Voucher {$voucher->voucher_number} endorsed"
      );

      return $voucher;
    });
  }

  public function approvePaymentVoucher(int $voucherId, int $userId, ?string $signature = null): PaymentVoucher
  {
    $voucher = $this->getPaymentVoucher($voucherId);

    if ($voucher->status !== 'endorsed') {
      throw PaymentException::voucherMustBeEndorsed();
    }

    return $this->transaction(function () use ($voucher, $userId, $signature) {
      $oldValues = $voucher->toArray();

      $voucher->markAsApproved($userId, $signature ?? $voucher->generateDigitalSignature('approval', $userId));

      // Audit: Log voucher approval
      $this->auditLogService->logModelUpdated(
        $voucher,
        $oldValues,
        "Payment Voucher {$voucher->voucher_number} approved by user #{$userId}"
      );

      $this->notificationDispatcher->notify('voucher_approved', [
        'voucher_id' => $voucher->id,
        'voucher_number' => $voucher->voucher_number,
        'approved_by' => $userId,
      ]);

      $this->logHistory(
        $voucher->requisition_id,
        'voucher_approved',
        'payment_voucher',
        $voucher->id,
        null,
        ['status' => 'approved'],
        "Payment Voucher {$voucher->voucher_number} approved"
      );

      return $voucher;
    });
  }

  public function markPaymentVoucherPaid(int $voucherId, ?string $reference = null): PaymentVoucher
  {
    $voucher = $this->getPaymentVoucher($voucherId);

    if ($voucher->status !== 'approved') {
      throw PaymentException::voucherMustBeApproved();
    }

    return $this->transaction(function () use ($voucher, $reference) {
      $oldValues = $voucher->toArray();

      $voucher->markAsPaid($reference);
      $voucher->invoice->markAsPaid();

      // Audit: Log voucher paid
      $this->auditLogService->logModelUpdated(
        $voucher,
        $oldValues,
        "Payment Voucher {$voucher->voucher_number} marked as paid" . ($reference ? " - Reference: {$reference}" : "")
      );

      $this->notificationDispatcher->notify('voucher_paid', [
        'voucher_id' => $voucher->id,
        'voucher_number' => $voucher->voucher_number,
        'supplier_id' => $voucher->supplier_id,
        'reference' => $reference,
      ]);

      $this->logHistory(
        $voucher->requisition_id,
        'voucher_paid',
        'payment_voucher',
        $voucher->id,
        null,
        ['status' => 'paid'],
        "Payment Voucher {$voucher->voucher_number} marked as paid"
      );

      return $voucher;
    });
  }

  public function cancelPaymentVoucher(int $voucherId, string $reason): PaymentVoucher
  {
    $voucher = $this->getPaymentVoucher($voucherId);

    if ($voucher->status === 'paid') {
      throw PaymentException::cannotCancelPaid();
    }

    return $this->transaction(function () use ($voucher, $reason) {
      $oldValues = $voucher->toArray();

      $voucher->markAsCancelled($reason);

      // Audit: Log voucher cancellation
      $this->auditLogService->logModelUpdated(
        $voucher,
        $oldValues,
        "Payment Voucher {$voucher->voucher_number} cancelled. Reason: {$reason}"
      );

      $this->logHistory(
        $voucher->requisition_id,
        'voucher_cancelled',
        'payment_voucher',
        $voucher->id,
        null,
        ['status' => 'cancelled'],
        "Payment Voucher {$voucher->voucher_number} cancelled: {$reason}"
      );

      return $voucher;
    });
  }

  public function recordCheque(PaymentDTO $dto): Cheque
  {
    $voucher = $this->getPaymentVoucher($dto->invoiceId);

    if ($voucher->status !== 'approved' && $voucher->status !== 'paid') {
      throw PaymentException::voucherNotApproved();
    }

    if ($this->repository->getChequeForVoucher($voucher->id)) {
      throw PaymentException::chequeAlreadyExists();
    }

    return $this->transaction(function () use ($voucher, $dto) {
      $cheque = $this->repository->createCheque([
        'payment_voucher_id' => $voucher->id,
        'cheque_number' => $dto->chequeNumber ?? $this->referenceGenerator->generateChequeNumber(),
        'payee_name' => $dto->payeeName ?? $voucher->payee_name,
        'payee_address' => $dto->payeeAddressForCheque ?? $voucher->payee_address,
        'amount' => $voucher->amount,
        'amount_words' => $dto->amountWords ?? $this->numberToWords($voucher->amount),
        'issued_date' => $dto->issuedDate ?? now(),
        'status' => 'issued',
        'bank_name' => $dto->bankName ?? $voucher->bank_name,
        'account_number' => $dto->accountNumber ?? $voucher->account_number,
        'bank_branch' => $dto->bankBranch ?? $voucher->bank_branch,
        'bank_sort_code' => $dto->bankSortCode ?? null,
        'recorded_by' => $this->getCurrentUserId(),
        'notes' => $dto->notes,
        'metadata' => $dto->metadata,
      ]);

      // Audit: Log cheque creation
      $this->auditLogService->logModelCreated(
        $cheque,
        "Cheque {$cheque->cheque_number} recorded for voucher {$voucher->voucher_number}"
      );

      $voucher->update(['cheque_number' => $cheque->cheque_number]);

      $this->notificationDispatcher->notify('cheque_issued', [
        'cheque_id' => $cheque->id,
        'cheque_number' => $cheque->cheque_number,
        'voucher_id' => $voucher->id,
        'supplier_id' => $voucher->supplier_id,
        'amount' => $cheque->amount,
      ]);

      $this->logHistory(
        $voucher->requisition_id,
        'cheque_issued',
        'cheque',
        $cheque->id,
        null,
        ['cheque_number' => $cheque->cheque_number],
        "Cheque {$cheque->cheque_number} recorded for voucher {$voucher->voucher_number}"
      );

      return $cheque;
    });
  }

  public function getCheque(int $chequeId): Cheque
  {
    $cheque = $this->repository->findCheque($chequeId);

    if (!$cheque) {
      throw PaymentException::chequeNotFound($chequeId);
    }

    return $cheque;
  }

  public function markChequeCashed(int $chequeId): Cheque
  {
    $cheque = $this->getCheque($chequeId);

    if ($cheque->status !== 'issued') {
      throw PaymentException::chequeAlreadyCashed();
    }

    return $this->transaction(function () use ($cheque) {
      $oldValues = $cheque->toArray();

      $cheque->markAsCashed();

      if ($cheque->paymentVoucher->status !== 'paid') {
        $cheque->paymentVoucher->markAsPaid();
      }

      // Audit: Log cheque cashed
      $this->auditLogService->logModelUpdated(
        $cheque,
        $oldValues,
        "Cheque {$cheque->cheque_number} cashed"
      );

      $this->notificationDispatcher->notify('cheque_cashed', [
        'cheque_id' => $cheque->id,
        'cheque_number' => $cheque->cheque_number,
        'supplier_id' => $cheque->paymentVoucher->supplier_id,
      ]);

      $this->logHistory(
        $cheque->paymentVoucher->requisition_id,
        'cheque_cashed',
        'cheque',
        $cheque->id,
        null,
        ['status' => 'cashed'],
        "Cheque {$cheque->cheque_number} cashed"
      );

      return $cheque;
    });
  }

  public function markChequeCancelled(int $chequeId, string $reason): Cheque
  {
    $cheque = $this->getCheque($chequeId);

    if ($cheque->status === 'cashed') {
      throw PaymentException::cannotCashCancelled();
    }

    return $this->transaction(function () use ($cheque, $reason) {
      $oldValues = $cheque->toArray();

      $cheque->markAsCancelled($reason);

      // Audit: Log cheque cancellation
      $this->auditLogService->logModelUpdated(
        $cheque,
        $oldValues,
        "Cheque {$cheque->cheque_number} cancelled. Reason: {$reason}"
      );

      $this->logHistory(
        $cheque->paymentVoucher->requisition_id,
        'cheque_cancelled',
        'cheque',
        $cheque->id,
        null,
        ['status' => 'cancelled'],
        "Cheque {$cheque->cheque_number} cancelled: {$reason}"
      );

      return $cheque;
    });
  }

  public function markChequeStopped(int $chequeId, string $reason): Cheque
  {
    $cheque = $this->getCheque($chequeId);

    if ($cheque->status === 'cashed') {
      throw new \Exception('Cannot stop a cashed cheque.');
    }

    return $this->transaction(function () use ($cheque, $reason) {
      $oldValues = $cheque->toArray();

      $cheque->markAsStopped($reason);

      // Audit: Log cheque stopped
      $this->auditLogService->logModelUpdated(
        $cheque,
        $oldValues,
        "Cheque {$cheque->cheque_number} stopped. Reason: {$reason}"
      );

      $this->logHistory(
        $cheque->paymentVoucher->requisition_id,
        'cheque_stopped',
        'cheque',
        $cheque->id,
        null,
        ['status' => 'stopped'],
        "Cheque {$cheque->cheque_number} stopped: {$reason}"
      );

      return $cheque;
    });
  }

  public function getPaymentSummary(int $voucherId): array
  {
    $voucher = $this->getPaymentVoucher($voucherId);

    return [
      'voucher' => [
        'id' => $voucher->id,
        'voucher_number' => $voucher->voucher_number,
        'status' => $voucher->status_label,
        'amount' => $voucher->formatted_amount,
        'payment_method' => $voucher->payment_method_label,
        'cheque_number' => $voucher->cheque_number,
        'payment_date' => $voucher->payment_date?->toDateString(),
      ],
      'payee' => [
        'name' => $voucher->payee_name,
        'address' => $voucher->payee_address,
        'phone' => $voucher->payee_phone,
        'email' => $voucher->payee_email,
      ],
      'bank' => [
        'name' => $voucher->bank_name,
        'account' => $voucher->account_number,
        'branch' => $voucher->bank_branch,
      ],
      'invoice' => [
        'id' => $voucher->invoice->id,
        'invoice_number' => $voucher->invoice->invoice_number,
      ],
      'approvals' => [
        'prepared_by' => $voucher->preparedBy?->full_name,
        'prepared_at' => $voucher->created_at->toDateTimeString(),
        'endorsed_by' => $voucher->endorsedBy?->full_name,
        'endorsed_at' => $voucher->endorsed_at?->toDateTimeString(),
        'approved_by' => $voucher->approvedBy?->full_name,
        'approved_at' => $voucher->approved_at?->toDateTimeString(),
        'paid_at' => $voucher->paid_at?->toDateTimeString(),
      ],
      'cheque' => $voucher->cheque ? [
        'cheque_number' => $voucher->cheque->cheque_number,
        'status' => $voucher->cheque->status_label,
        'issued_date' => $voucher->cheque->issued_date->toDateString(),
        'cashed_at' => $voucher->cheque->cashed_at?->toDateTimeString(),
      ] : null,
    ];
  }

  public function generatePaymentVoucherPdf(int $voucherId): string
  {
    $voucher = $this->getPaymentVoucher($voucherId);
    return $this->pdfGenerator->generatePaymentVoucher($voucher);
  }

  public function generateChequePdf(int $chequeId): string
  {
    $cheque = $this->getCheque($chequeId);
    return $this->pdfGenerator->generateCheque($cheque);
  }

  public function getDraftVouchers(): array
  {
    return $this->repository->getDraftVouchers();
  }

  public function getPendingEndorsementVouchers(): array
  {
    return $this->repository->getDraftVouchers();
  }

  public function getPendingApprovalVouchers(): array
  {
    return $this->repository->getEndorsedVouchers();
  }

  public function getIssuedCheques(): array
  {
    return $this->repository->getIssuedCheques();
  }

  public function hasChequeForVoucher(int $voucherId): bool
  {
    return $this->repository->getChequeForVoucher($voucherId) !== null;
  }

  /**
   * Convert number to words.
   */
  protected function numberToWords(float $number): string
  {
    // This is a simplified version - you can use a library for this
    return number_format($number, 2) . ' only';
  }

  /**
   * Log history.
   */
  protected function logHistory(
    int $requisitionId,
    string $action,
    string $entityType,
    int $entityId,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null
  ): void {
    \App\Models\ProcurementHistory::create([
      'requisition_id' => $requisitionId,
      'user_id' => $this->getCurrentUserId(),
      'action' => $action,
      'entity_type' => $entityType,
      'entity_id' => $entityId,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
