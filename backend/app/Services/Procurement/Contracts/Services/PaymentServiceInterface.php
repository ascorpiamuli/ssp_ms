<?php
// app/Services/Procurement/Contracts/Services/PaymentServiceInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Services;

use App\Models\PaymentVoucher;
use App\Models\Cheque;
use App\Services\Procurement\DTOs\PaymentDTO;

interface PaymentServiceInterface
{
  /**
   * Prepare a payment voucher.
   */
  public function preparePaymentVoucher(PaymentDTO $dto): PaymentVoucher;

  /**
   * Get a payment voucher by ID.
   */
  public function getPaymentVoucher(int $voucherId): PaymentVoucher;

  /**
   * Get all payment vouchers for an invoice.
   */
  public function getPaymentVouchersForInvoice(int $invoiceId): array;

  /**
   * Endorse a payment voucher.
   */
  public function endorsePaymentVoucher(int $voucherId, int $userId, ?string $signature = null): PaymentVoucher;

  /**
   * Approve a payment voucher.
   */
  public function approvePaymentVoucher(int $voucherId, int $userId, ?string $signature = null): PaymentVoucher;

  /**
   * Mark a payment voucher as paid.
   */
  public function markPaymentVoucherPaid(int $voucherId, ?string $reference = null): PaymentVoucher;

  /**
   * Cancel a payment voucher.
   */
  public function cancelPaymentVoucher(int $voucherId, string $reason): PaymentVoucher;

  /**
   * Record a cheque.
   */
  public function recordCheque(PaymentDTO $dto): Cheque;

  /**
   * Get a cheque by ID.
   */
  public function getCheque(int $chequeId): Cheque;

  /**
   * Mark a cheque as cashed.
   */
  public function markChequeCashed(int $chequeId): Cheque;

  /**
   * Mark a cheque as cancelled.
   */
  public function markChequeCancelled(int $chequeId, string $reason): Cheque;

  /**
   * Mark a cheque as stopped.
   */
  public function markChequeStopped(int $chequeId, string $reason): Cheque;

  /**
   * Get payment summary.
   */
  public function getPaymentSummary(int $voucherId): array;

  /**
   * Generate payment voucher PDF.
   */
  public function generatePaymentVoucherPdf(int $voucherId): string;

  /**
   * Generate cheque PDF.
   */
  public function generateChequePdf(int $chequeId): string;

  /**
   * Get draft payment vouchers.
   */
  public function getDraftVouchers(): array;

  /**
   * Get pending endorsement vouchers.
   */
  public function getPendingEndorsementVouchers(): array;

  /**
   * Get pending approval vouchers.
   */
  public function getPendingApprovalVouchers(): array;

  /**
   * Get all issued cheques.
   */
  public function getIssuedCheques(): array;

  /**
   * Check if cheque exists for voucher.
   */
  public function hasChequeForVoucher(int $voucherId): bool;
}
