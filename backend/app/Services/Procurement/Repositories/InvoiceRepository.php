<?php
// app/Services/Procurement/Repositories/InvoiceRepository.php

declare(strict_types=1);

namespace App\Services\Procurement\Repositories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Services\Procurement\Contracts\Repositories\InvoiceRepositoryInterface;
use App\Services\Procurement\Repositories\BaseRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class InvoiceRepository extends BaseRepository implements InvoiceRepositoryInterface
{
  public function __construct()
  {
    parent::__construct(new Invoice());
  }

  public function findInvoice(int $id): ?Invoice
  {
    return Invoice::with([
      'requisition',
      'purchaseOrder',
      'goodsReceivedNote',
      'supplier',
      'items',
      'matchedBy',
      'verifiedBy',
      'approvedBy'
    ])->find($id);
  }

  public function findInvoiceOrFail(int $id): Invoice
  {
    return Invoice::with([
      'requisition',
      'purchaseOrder',
      'goodsReceivedNote',
      'supplier',
      'items',
      'matchedBy',
      'verifiedBy',
      'approvedBy'
    ])->findOrFail($id);
  }

  public function findInvoiceItem(int $id): ?InvoiceItem
  {
    return InvoiceItem::with(['invoice'])->find($id);
  }

  public function getInvoicesForPurchaseOrder(int $purchaseOrderId): array
  {
    return Invoice::where('purchase_order_id', $purchaseOrderId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getInvoicesForSupplier(int $supplierId): array
  {
    return Invoice::where('supplier_id', $supplierId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getInvoicesForRequisition(int $requisitionId): array
  {
    return Invoice::where('requisition_id', $requisitionId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getInvoiceByNumber(string $invoiceNumber): ?Invoice
  {
    return Invoice::where('invoice_number', $invoiceNumber)->first();
  }

  public function createInvoice(array $data): Invoice
  {
    return Invoice::create($data);
  }

  public function createInvoiceItem(array $data): InvoiceItem
  {
    return InvoiceItem::create($data);
  }

  public function updateInvoice(int $id, array $data): Invoice
  {
    $invoice = $this->findInvoiceOrFail($id);
    $invoice->update($data);
    return $invoice;
  }

  public function updateInvoiceItem(int $id, array $data): InvoiceItem
  {
    $item = $this->findInvoiceItem($id);
    if (!$item) {
      throw new \Exception("Invoice Item #{$id} not found.");
    }
    $item->update($data);
    return $item;
  }

  public function getPendingInvoices(): array
  {
    return Invoice::where('status', 'pending')
      ->with(['supplier', 'purchaseOrder'])
      ->orderBy('due_date')
      ->get()
      ->toArray();
  }

  public function getVerifiedInvoices(): array
  {
    return Invoice::where('status', 'verified')
      ->with(['supplier', 'purchaseOrder'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getApprovedInvoices(): array
  {
    return Invoice::where('status', 'approved')
      ->with(['supplier', 'purchaseOrder'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getPaidInvoices(): array
  {
    return Invoice::where('status', 'paid')
      ->with(['supplier', 'purchaseOrder'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getOverdueInvoices(): array
  {
    return Invoice::whereDate('due_date', '<', now())
      ->whereNotIn('status', ['paid', 'cancelled'])
      ->with(['supplier', 'purchaseOrder'])
      ->orderBy('due_date')
      ->get()
      ->toArray();
  }

  public function getInvoicesByMatchingStatus(string $matchingStatus): array
  {
    return Invoice::where('matching_status', $matchingStatus)
      ->with(['supplier', 'purchaseOrder'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function paginateInvoices(int $perPage = 15): LengthAwarePaginator
  {
    return Invoice::with(['supplier', 'purchaseOrder'])
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  public function getInvoiceItems(int $invoiceId): array
  {
    return InvoiceItem::where('invoice_id', $invoiceId)
      ->get()
      ->toArray();
  }

  public function getInvoicesForMatching(): array
  {
    return Invoice::where('matching_status', 'pending')
      ->where('status', 'pending')
      ->with(['purchaseOrder', 'goodsReceivedNote'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function deleteInvoiceItem(int $id): bool
  {
    $item = $this->findInvoiceItem($id);
    if (!$item) {
      return false;
    }
    return $item->delete();
  }

  public function getInvoiceStatistics(): array
  {
    return [
      'total' => Invoice::count(),
      'pending' => Invoice::where('status', 'pending')->count(),
      'verified' => Invoice::where('status', 'verified')->count(),
      'approved' => Invoice::where('status', 'approved')->count(),
      'paid' => Invoice::where('status', 'paid')->count(),
      'disputed' => Invoice::where('status', 'disputed')->count(),
      'overdue' => $this->getOverdueInvoicesCount(),
      'total_amount' => Invoice::sum('total_amount'),
      'paid_amount' => Invoice::where('status', 'paid')->sum('total_amount'),
    ];
  }

  protected function getOverdueInvoicesCount(): int
  {
    return Invoice::whereDate('due_date', '<', now())
      ->whereNotIn('status', ['paid', 'cancelled'])
      ->count();
  }
}
