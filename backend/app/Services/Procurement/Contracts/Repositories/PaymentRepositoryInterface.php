<?php
// app/Services/Procurement/Contracts/Repositories/PaymentRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Repositories;

use App\Models\PaymentVoucher;
use App\Models\Cheque;
use Illuminate\Pagination\LengthAwarePaginator;

interface PaymentRepositoryInterface
{
  /**
   * Find a payment voucher by ID.
   */
  public function findPaymentVoucher(int $id): ?PaymentVoucher;

  /**
   * Find a payment voucher by ID or fail.
   */
  public function findPaymentVoucherOrFail(int $id): PaymentVoucher;

  /**
   * Find a cheque by ID.
   */
  public function findCheque(int $id): ?Cheque;

  /**
   * Find a cheque by ID or fail.
   */
  public function findChequeOrFail(int $id): Cheque;

  /**
   * Get payment vouchers for an invoice.
   */
  public function getPaymentVouchersForInvoice(int $invoiceId): array;

  /**
   * Get payment vouchers for a requisition.
   */
  public function getPaymentVouchersForRequisition(int $requisitionId): array;

  /**
   * Get payment vouchers for a supplier.
   */
  public function getPaymentVouchersForSupplier(int $supplierId): array;

  /**
   * Get a payment voucher by number.
   */
  public function getPaymentVoucherByNumber(string $voucherNumber): ?PaymentVoucher;

  /**
   * Create a payment voucher.
   */
  public function createPaymentVoucher(array $data): PaymentVoucher;

  /**
   * Update a payment voucher.
   */
  public function updatePaymentVoucher(int $id, array $data): PaymentVoucher;

  /**
   * Create a cheque.
   */
  public function createCheque(array $data): Cheque;

  /**
   * Update a cheque.
   */
  public function updateCheque(int $id, array $data): Cheque;

  /**
   * Get draft payment vouchers.
   */
  public function getDraftVouchers(): array;

  /**
   * Get endorsed payment vouchers.
   */
  public function getEndorsedVouchers(): array;

  /**
   * Get approved payment vouchers.
   */
  public function getApprovedVouchers(): array;

  /**
   * Get paid payment vouchers.
   */
  public function getPaidVouchers(): array;

  /**
   * Get issued cheques.
   */
  public function getIssuedCheques(): array;

  /**
   * Get cashed cheques.
   */
  public function getCashedCheques(): array;

  /**
   * Get cancelled cheques.
   */
  public function getCancelledCheques(): array;

  /**
   * Get a cheque by number.
   */
  public function getChequeByNumber(string $chequeNumber): ?Cheque;

  /**
   * Paginate payment vouchers.
   */
  public function paginatePaymentVouchers(int $perPage = 15): LengthAwarePaginator;

  /**
   * Paginate cheques.
   */
  public function paginateCheques(int $perPage = 15): LengthAwarePaginator;

  /**
   * Get cheque for a payment voucher.
   */
  public function getChequeForVoucher(int $voucherId): ?Cheque;

  /**
   * Get payment statistics.
   */
  public function getPaymentStatistics(): array;

  /**
   * Delete a cheque.
   */
  public function deleteCheque(int $id): bool;
}
