<?php
// app/Services/Procurement/Services/InvoiceService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\PurchaseOrder;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\GoodsReceivedNote;
use App\Services\Procurement\Base\BaseService;
use App\Services\Procurement\Contracts\Services\InvoiceServiceInterface;
use App\Services\Procurement\Contracts\Repositories\InvoiceRepositoryInterface;
use App\Services\Procurement\Contracts\Utilities\ReferenceNumberGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\PdfGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\DTOs\InvoiceDTO;
use App\Services\Procurement\Exceptions\InvoiceException;

class InvoiceService extends BaseService implements InvoiceServiceInterface
{
  public function __construct(
    protected InvoiceRepositoryInterface $repository,
    protected ReferenceNumberGeneratorInterface $referenceGenerator,
    protected PdfGeneratorInterface $pdfGenerator,
    protected NotificationDispatcherInterface $notificationDispatcher
  ) {
    parent::__construct();
  }

  public function submitInvoice(InvoiceDTO $dto): Invoice
  {
    $po = PurchaseOrder::with(['requisition', 'items'])->find($dto->purchaseOrderId);

    if (!$po) {
      throw InvoiceException::invoiceNotFound($dto->purchaseOrderId);
    }

    if ($po->supplier_id !== $dto->supplierId) {
      throw InvoiceException::supplierMismatch();
    }

    if ($po->status === 'cancelled') {
      throw new \Exception('Cannot submit invoice for a cancelled PO.');
    }

    if (empty($dto->items)) {
      throw InvoiceException::noItems();
    }

    // Check if invoice already exists
    $existing = Invoice::where('purchase_order_id', $po->id)->first();
    if ($existing) {
      throw InvoiceException::invoiceAlreadyExists();
    }

    return $this->transaction(function () use ($po, $dto) {
      $grn = GoodsReceivedNote::where('purchase_order_id', $po->id)
        ->whereIn('status', ['hod_approved', 'principal_approved', 'completed'])
        ->first();

      $invoice = $this->repository->createInvoice([
        'requisition_id' => $po->requisition_id,
        'purchase_order_id' => $po->id,
        'goods_received_note_id' => $grn?->id,
        'supplier_id' => $po->supplier_id,
        'invoice_number' => $this->referenceGenerator->generateInvoiceNumber(),
        'customer_invoice_no' => $dto->customerInvoiceNo,
        'invoice_date' => $dto->invoiceDate->toDateString(),
        'due_date' => $dto->dueDate->toDateString(),
        'description' => $dto->description,
        'subtotal' => 0,
        'tax_amount' => 0,
        'discount_amount' => 0,
        'total_amount' => 0,
        'currency' => $dto->currency,
        'exchange_rate' => $dto->exchangeRate ?? 1,
        'payment_reference' => $dto->paymentReference,
        'bank_name' => $dto->bankName,
        'bank_account' => $dto->bankAccount,
        'status' => 'pending',
        'matching_status' => 'pending',
        'payment_terms' => $dto->paymentTerms,
        'notes' => $dto->notes,
        'metadata' => $dto->metadata,
      ]);

      foreach ($dto->items as $itemData) {
        $this->repository->createInvoiceItem([
          'invoice_id' => $invoice->id,
          'purchase_order_item_id' => $itemData['purchase_order_item_id'] ?? null,
          'goods_received_item_id' => $itemData['goods_received_item_id'] ?? null,
          'requisition_item_id' => $itemData['requisition_item_id'],
          'item_name' => $itemData['item_name'],
          'description' => $itemData['description'] ?? null,
          'unit_of_measure' => $itemData['unit_of_measure'] ?? null,
          'quantity' => $itemData['quantity'],
          'unit_price' => $itemData['unit_price'],
          'total_price' => $itemData['quantity'] * $itemData['unit_price'],
          'tax_rate' => $itemData['tax_rate'] ?? 0,
          'tax_amount' => 0,
          'discount_rate' => $itemData['discount_rate'] ?? 0,
          'discount_amount' => 0,
          'net_price' => 0,
          'notes' => $itemData['notes'] ?? null,
          'metadata' => $itemData['metadata'] ?? null,
        ]);
      }

      $invoice->updateTotals();
      $this->performThreeWayMatching($invoice->id);

      $this->notificationDispatcher->notify('invoice_submitted', [
        'invoice_id' => $invoice->id,
        'invoice_number' => $invoice->invoice_number,
        'purchase_order_id' => $po->id,
        'requisition_id' => $po->requisition_id,
        'supplier_id' => $po->supplier_id,
      ]);

      $this->logHistory(
        $po->requisition_id,
        'invoice_submitted',
        'invoice',
        $invoice->id,
        null,
        ['invoice_number' => $invoice->invoice_number],
        "Invoice {$invoice->invoice_number} submitted"
      );

      return $invoice;
    });
  }

  public function getInvoice(int $invoiceId): Invoice
  {
    $invoice = $this->repository->findInvoice($invoiceId);

    if (!$invoice) {
      throw InvoiceException::invoiceNotFound($invoiceId);
    }

    return $invoice;
  }

  public function getInvoicesForPurchaseOrder(int $purchaseOrderId): array
  {
    return $this->repository->getInvoicesForPurchaseOrder($purchaseOrderId);
  }

  public function getInvoicesForSupplier(int $supplierId): array
  {
    return $this->repository->getInvoicesForSupplier($supplierId);
  }

  public function performThreeWayMatching(int $invoiceId): Invoice
  {
    $invoice = $this->getInvoice($invoiceId);

    if ($invoice->matching_status !== 'pending') {
      throw new \Exception('This invoice has already been matched.');
    }

    return $this->transaction(function () use ($invoice) {
      $po = $invoice->purchaseOrder;
      $grn = $invoice->goodsReceivedNote;

      if (!$po) {
        $invoice->update([
          'matching_status' => 'not_applicable',
          'matching_notes' => 'No purchase order found for matching',
        ]);
        return $invoice;
      }

      if ($po->type === 'lpo' && !$grn) {
        $invoice->update([
          'matching_status' => 'pending',
          'matching_notes' => 'GRN not yet received for matching',
        ]);
        return $invoice;
      }

      $poTotal = (float) $po->total_with_tax;
      $grnTotal = $grn ? (float) $grn->net_total : 0;
      $invoiceTotal = (float) $invoice->total_amount;

      $tolerance = 0.01;

      if (
        abs($invoiceTotal - $poTotal) <= $tolerance &&
        ($po->type === 'lso' || abs($invoiceTotal - $grnTotal) <= $tolerance)
      ) {
        $invoice->update([
          'matching_status' => 'matched',
          'matching_notes' => 'Invoice matches PO and GRN/SAN',
          'matched_by' => $this->getCurrentUserId(),
          'matched_at' => now(),
        ]);
      } elseif ($invoiceTotal > $poTotal || ($grn && $invoiceTotal > $grnTotal)) {
        $invoice->update([
          'matching_status' => 'mismatch',
          'matching_notes' => 'Invoice amount exceeds PO or GRN amount',
          'matched_by' => $this->getCurrentUserId(),
          'matched_at' => now(),
        ]);
      } else {
        $invoice->update([
          'matching_status' => 'partial',
          'matching_notes' => 'Partial match - amounts differ within tolerance',
          'matched_by' => $this->getCurrentUserId(),
          'matched_at' => now(),
        ]);
      }

      $this->logHistory(
        $invoice->requisition_id,
        'invoice_matched',
        'invoice',
        $invoice->id,
        null,
        ['matching_status' => $invoice->matching_status],
        "Invoice {$invoice->invoice_number} matched: {$invoice->matching_status}"
      );

      return $invoice;
    });
  }

  public function verifyInvoice(int $invoiceId, int $userId, ?string $notes = null): Invoice
  {
    $invoice = $this->getInvoice($invoiceId);

    if ($invoice->status !== 'pending') {
      throw InvoiceException::invoiceMustBePending();
    }

    return $this->transaction(function () use ($invoice, $userId, $notes) {
      $invoice->markAsVerified($userId, $notes);

      $this->logHistory(
        $invoice->requisition_id,
        'invoice_verified',
        'invoice',
        $invoice->id,
        null,
        ['status' => 'verified'],
        "Invoice {$invoice->invoice_number} verified" . ($notes ? ": {$notes}" : "")
      );

      return $invoice;
    });
  }

  public function approveInvoice(int $invoiceId, int $userId, ?string $notes = null): Invoice
  {
    $invoice = $this->getInvoice($invoiceId);

    if ($invoice->status !== 'verified') {
      throw InvoiceException::invoiceMustBeVerified();
    }

    return $this->transaction(function () use ($invoice, $userId, $notes) {
      $invoice->markAsApproved($userId, $notes);

      $this->notificationDispatcher->notify('invoice_approved', [
        'invoice_id' => $invoice->id,
        'invoice_number' => $invoice->invoice_number,
        'supplier_id' => $invoice->supplier_id,
      ]);

      $this->logHistory(
        $invoice->requisition_id,
        'invoice_approved',
        'invoice',
        $invoice->id,
        null,
        ['status' => 'approved'],
        "Invoice {$invoice->invoice_number} approved" . ($notes ? ": {$notes}" : "")
      );

      return $invoice;
    });
  }

  public function markInvoicePaid(int $invoiceId): Invoice
  {
    $invoice = $this->getInvoice($invoiceId);

    if ($invoice->status !== 'approved') {
      throw InvoiceException::invoiceMustBeApproved();
    }

    return $this->transaction(function () use ($invoice) {
      $invoice->markAsPaid();

      $this->notificationDispatcher->notify('invoice_paid', [
        'invoice_id' => $invoice->id,
        'invoice_number' => $invoice->invoice_number,
        'supplier_id' => $invoice->supplier_id,
      ]);

      $this->logHistory(
        $invoice->requisition_id,
        'invoice_paid',
        'invoice',
        $invoice->id,
        null,
        ['status' => 'paid'],
        "Invoice {$invoice->invoice_number} marked as paid"
      );

      return $invoice;
    });
  }

  public function markInvoiceDisputed(int $invoiceId, string $reason): Invoice
  {
    $invoice = $this->getInvoice($invoiceId);

    if ($invoice->status === 'paid') {
      throw InvoiceException::cannotDisputePaid();
    }

    return $this->transaction(function () use ($invoice, $reason) {
      $invoice->markAsDisputed($reason);

      $this->notificationDispatcher->notify('invoice_disputed', [
        'invoice_id' => $invoice->id,
        'invoice_number' => $invoice->invoice_number,
        'supplier_id' => $invoice->supplier_id,
        'reason' => $reason,
      ]);

      $this->logHistory(
        $invoice->requisition_id,
        'invoice_disputed',
        'invoice',
        $invoice->id,
        null,
        ['status' => 'disputed'],
        "Invoice {$invoice->invoice_number} disputed: {$reason}"
      );

      return $invoice;
    });
  }

  public function cancelInvoice(int $invoiceId, string $reason): Invoice
  {
    $invoice = $this->getInvoice($invoiceId);

    if ($invoice->status === 'paid') {
      throw InvoiceException::cannotCancelPaid();
    }

    return $this->transaction(function () use ($invoice, $reason) {
      $invoice->markAsCancelled($reason);

      $this->logHistory(
        $invoice->requisition_id,
        'invoice_cancelled',
        'invoice',
        $invoice->id,
        null,
        ['status' => 'cancelled'],
        "Invoice {$invoice->invoice_number} cancelled: {$reason}"
      );

      return $invoice;
    });
  }

  public function sendInvoiceBack(int $invoiceId, string $reason): Invoice
  {
    $invoice = $this->getInvoice($invoiceId);

    if ($invoice->status !== 'pending' && $invoice->status !== 'verified') {
      throw new \Exception('Invoice must be pending or verified to send back.');
    }

    return $this->transaction(function () use ($invoice, $reason) {
      $invoice->update([
        'status' => 'pending',
        'notes' => $reason,
        'matching_status' => 'pending',
      ]);

      $this->notificationDispatcher->notify('invoice_sent_back', [
        'invoice_id' => $invoice->id,
        'invoice_number' => $invoice->invoice_number,
        'supplier_id' => $invoice->supplier_id,
        'reason' => $reason,
      ]);

      $this->logHistory(
        $invoice->requisition_id,
        'invoice_sent_back',
        'invoice',
        $invoice->id,
        null,
        ['reason' => $reason],
        "Invoice {$invoice->invoice_number} sent back: {$reason}"
      );

      return $invoice;
    });
  }

  public function getInvoiceSummary(int $invoiceId): array
  {
    $invoice = $this->getInvoice($invoiceId);

    return [
      'invoice' => [
        'id' => $invoice->id,
        'invoice_number' => $invoice->invoice_number,
        'customer_invoice_no' => $invoice->customer_invoice_no,
        'status' => $invoice->status_label,
        'total_amount' => $invoice->formatted_total_amount,
        'invoice_date' => $invoice->invoice_date->toDateString(),
        'due_date' => $invoice->due_date->toDateString(),
        'is_overdue' => $invoice->is_overdue,
        'days_overdue' => $invoice->days_overdue,
      ],
      'purchase_order' => [
        'id' => $invoice->purchaseOrder->id,
        'po_number' => $invoice->purchaseOrder->po_number,
        'type' => $invoice->purchaseOrder->type_label,
      ],
      'supplier' => [
        'id' => $invoice->supplier_id,
        'name' => $invoice->supplier_name,
        'email' => $invoice->supplier?->email,
      ],
      'matching' => [
        'status' => $invoice->matching_status_label,
        'notes' => $invoice->matching_notes,
        'matched_at' => $invoice->matched_at?->toDateTimeString(),
        'matched_by' => $invoice->matchedBy?->full_name,
      ],
      'approvals' => [
        'verified_at' => $invoice->verified_at?->toDateTimeString(),
        'verified_by' => $invoice->verifiedBy?->full_name,
        'approved_at' => $invoice->approved_at?->toDateTimeString(),
        'approved_by' => $invoice->approvedBy?->full_name,
      ],
      'items' => $invoice->items->map(function ($item) {
        return [
          'id' => $item->id,
          'item_name' => $item->item_name,
          'quantity' => $item->quantity,
          'unit_price' => $item->unit_price,
          'total_price' => $item->total_price,
          'tax_amount' => $item->tax_amount,
          'net_price' => $item->net_price,
        ];
      }),
    ];
  }

  public function generateInvoicePdf(int $invoiceId): string
  {
    $invoice = $this->getInvoice($invoiceId);
    return $this->pdfGenerator->generateInvoice($invoice);
  }

  public function getMatchingStatus(int $invoiceId): array
  {
    $invoice = $this->getInvoice($invoiceId);

    return [
      'status' => $invoice->matching_status,
      'status_label' => $invoice->matching_status_label,
      'notes' => $invoice->matching_notes,
      'po_total' => $invoice->purchaseOrder?->total_with_tax ?? 0,
      'grn_total' => $invoice->goodsReceivedNote?->net_total ?? 0,
      'invoice_total' => $invoice->total_amount,
      'is_matched' => $invoice->matching_status === 'matched',
      'matched_at' => $invoice->matched_at?->toDateTimeString(),
      'matched_by' => $invoice->matchedBy?->full_name,
    ];
  }

  public function getPendingInvoices(): array
  {
    return $this->repository->getPendingInvoices();
  }

  public function getOverdueInvoices(): array
  {
    return $this->repository->getOverdueInvoices();
  }

  public function getInvoicesForMatching(): array
  {
    return $this->repository->getInvoicesForMatching();
  }

  public function updateInvoiceItems(int $invoiceId, array $items): Invoice
  {
    $invoice = $this->getInvoice($invoiceId);

    if ($invoice->status !== 'pending') {
      throw new \Exception('Invoice items can only be updated in pending status.');
    }

    return $this->transaction(function () use ($invoice, $items) {
      foreach ($items as $itemData) {
        $item = $invoice->items()->find($itemData['id']);
        if ($item) {
          $item->update($itemData);
          $item->calculateTotals();
        }
      }

      $invoice->updateTotals();

      $this->logHistory(
        $invoice->requisition_id,
        'invoice_items_updated',
        'invoice',
        $invoice->id,
        null,
        ['item_count' => count($items)],
        "Invoice {$invoice->invoice_number} items updated"
      );

      return $invoice;
    });
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
