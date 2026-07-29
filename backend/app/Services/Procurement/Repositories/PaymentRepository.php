<?php
// app/Services/Procurement/Repositories/PaymentRepository.php

declare(strict_types=1);

namespace App\Services\Procurement\Repositories;

use App\Models\PaymentVoucher;
use App\Models\Cheque;
use App\Services\Procurement\Contracts\Repositories\PaymentRepositoryInterface;
use App\Services\Procurement\Repositories\BaseRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class PaymentRepository extends BaseRepository implements PaymentRepositoryInterface
{
  public function __construct()
  {
    parent::__construct(new PaymentVoucher());
  }

  public function findPaymentVoucher(int $id): ?PaymentVoucher
  {
    return PaymentVoucher::with([
      'requisition',
      'invoice',
      'purchaseOrder',
      'supplier',
      'preparedBy',
      'endorsedBy',
      'approvedBy',
      'cheque'
    ])->find($id);
  }

  public function findPaymentVoucherOrFail(int $id): PaymentVoucher
  {
    return PaymentVoucher::with([
      'requisition',
      'invoice',
      'purchaseOrder',
      'supplier',
      'preparedBy',
      'endorsedBy',
      'approvedBy',
      'cheque'
    ])->findOrFail($id);
  }

  public function findCheque(int $id): ?Cheque
  {
    return Cheque::with(['paymentVoucher', 'recordedBy', 'receivedBy'])
      ->find($id);
  }

  public function findChequeOrFail(int $id): Cheque
  {
    return Cheque::with(['paymentVoucher', 'recordedBy', 'receivedBy'])
      ->findOrFail($id);
  }

  public function getPaymentVouchersForInvoice(int $invoiceId): array
  {
    return PaymentVoucher::where('invoice_id', $invoiceId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getPaymentVouchersForRequisition(int $requisitionId): array
  {
    return PaymentVoucher::where('requisition_id', $requisitionId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getPaymentVouchersForSupplier(int $supplierId): array
  {
    return PaymentVoucher::where('supplier_id', $supplierId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getPaymentVoucherByNumber(string $voucherNumber): ?PaymentVoucher
  {
    return PaymentVoucher::where('voucher_number', $voucherNumber)->first();
  }

  public function createPaymentVoucher(array $data): PaymentVoucher
  {
    return PaymentVoucher::create($data);
  }

  public function updatePaymentVoucher(int $id, array $data): PaymentVoucher
  {
    $voucher = $this->findPaymentVoucherOrFail($id);
    $voucher->update($data);
    return $voucher;
  }

  public function createCheque(array $data): Cheque
  {
    return Cheque::create($data);
  }

  public function updateCheque(int $id, array $data): Cheque
  {
    $cheque = $this->findChequeOrFail($id);
    $cheque->update($data);
    return $cheque;
  }

  public function getDraftVouchers(): array
  {
    return PaymentVoucher::where('status', 'draft')
      ->with(['supplier', 'invoice'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function getEndorsedVouchers(): array
  {
    return PaymentVoucher::where('status', 'endorsed')
      ->with(['supplier', 'invoice'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function getApprovedVouchers(): array
  {
    return PaymentVoucher::where('status', 'approved')
      ->with(['supplier', 'invoice'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function getPaidVouchers(): array
  {
    return PaymentVoucher::where('status', 'paid')
      ->with(['supplier', 'invoice'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getIssuedCheques(): array
  {
    return Cheque::where('status', 'issued')
      ->with(['paymentVoucher.supplier'])
      ->orderBy('issued_date')
      ->get()
      ->toArray();
  }

  public function getCashedCheques(): array
  {
    return Cheque::where('status', 'cashed')
      ->with(['paymentVoucher.supplier'])
      ->orderBy('cashed_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getCancelledCheques(): array
  {
    return Cheque::where('status', 'cancelled')
      ->with(['paymentVoucher.supplier'])
      ->orderBy('cancelled_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getChequeByNumber(string $chequeNumber): ?Cheque
  {
    return Cheque::where('cheque_number', $chequeNumber)->first();
  }

  public function paginatePaymentVouchers(int $perPage = 15): LengthAwarePaginator
  {
    return PaymentVoucher::with(['supplier', 'invoice'])
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  public function paginateCheques(int $perPage = 15): LengthAwarePaginator
  {
    return Cheque::with(['paymentVoucher.supplier'])
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  public function getChequeForVoucher(int $voucherId): ?Cheque
  {
    return Cheque::where('payment_voucher_id', $voucherId)->first();
  }

  public function getPaymentStatistics(): array
  {
    return [
      'total_vouchers' => PaymentVoucher::count(),
      'draft' => PaymentVoucher::where('status', 'draft')->count(),
      'endorsed' => PaymentVoucher::where('status', 'endorsed')->count(),
      'approved' => PaymentVoucher::where('status', 'approved')->count(),
      'paid' => PaymentVoucher::where('status', 'paid')->count(),
      'total_amount' => PaymentVoucher::sum('amount'),
      'paid_amount' => PaymentVoucher::where('status', 'paid')->sum('amount'),
      'total_cheques' => Cheque::count(),
      'issued_cheques' => Cheque::where('status', 'issued')->count(),
      'cashed_cheques' => Cheque::where('status', 'cashed')->count(),
    ];
  }

  public function deleteCheque(int $id): bool
  {
    $cheque = $this->findCheque($id);
    if (!$cheque) {
      return false;
    }
    return $cheque->delete();
  }
}
