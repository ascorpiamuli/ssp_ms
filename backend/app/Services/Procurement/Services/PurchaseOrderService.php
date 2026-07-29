<?php
// app/Services/Procurement/Services/PurchaseOrderService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\Requisition;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\SupplierQuotation;
use App\Services\Procurement\Base\BaseService;
use App\Services\Procurement\Contracts\Services\PurchaseOrderServiceInterface;
use App\Services\Procurement\Contracts\Repositories\PurchaseOrderRepositoryInterface;
use App\Services\Procurement\Contracts\Utilities\ReferenceNumberGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\PdfGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\DTOs\PurchaseOrderDTO;
use App\Services\Procurement\Exceptions\PurchaseOrderException;

class PurchaseOrderService extends BaseService implements PurchaseOrderServiceInterface
{
  public function __construct(
    protected PurchaseOrderRepositoryInterface $repository,
    protected ReferenceNumberGeneratorInterface $referenceGenerator,
    protected PdfGeneratorInterface $pdfGenerator,
    protected NotificationDispatcherInterface $notificationDispatcher
  ) {
    parent::__construct();
  }

  public function generatePurchaseOrder(PurchaseOrderDTO $dto): PurchaseOrder
  {
    $requisition = Requisition::find($dto->requisitionId);

    if (!$requisition) {
      throw PurchaseOrderException::requisitionNotFound($dto->requisitionId);
    }

    if (!$requisition->supplier_id) {
      throw PurchaseOrderException::noSupplierSelected();
    }

    $existing = PurchaseOrder::where('requisition_id', $requisition->id)
      ->whereNotIn('status', ['cancelled', 'closed'])
      ->first();

    if ($existing) {
      throw PurchaseOrderException::poAlreadyExists();
    }

    return $this->transaction(function () use ($requisition, $dto) {
      $metadata = $requisition->metadata ?? [];
      $selectedQuotationId = $metadata['procurement']['selected_quotation_id'] ?? null;

      $quotation = null;
      if ($selectedQuotationId) {
        $quotation = SupplierQuotation::find($selectedQuotationId);
      }

      $totalAmount = $requisition->total_amount ?? 0;
      $taxAmount = $totalAmount * 0.16;
      $totalWithTax = $totalAmount + $taxAmount;

      $po = $this->repository->createPurchaseOrder([
        'requisition_id' => $requisition->id,
        'supplier_id' => $requisition->supplier_id,
        'supplier_quotation_id' => $quotation?->id,
        'po_number' => $this->referenceGenerator->generatePoNumber($dto->type),
        'type' => $dto->type,
        'title' => $dto->title,
        'description' => $dto->description,
        'total_amount' => $totalAmount,
        'tax_amount' => $taxAmount,
        'total_with_tax' => $totalWithTax,
        'currency' => $dto->currency,
        'issue_date' => $dto->issueDate->toDateString(),
        'expected_delivery_date' => $dto->expectedDeliveryDate->toDateString(),
        'delivery_address' => $dto->deliveryAddress,
        'delivery_contact' => $dto->deliveryContact,
        'delivery_phone' => $dto->deliveryPhone,
        'delivery_email' => $dto->deliveryEmail,
        'payment_terms' => $dto->paymentTerms,
        'delivery_terms' => $dto->deliveryTerms,
        'special_conditions' => $dto->specialConditions,
        'terms_and_conditions' => $dto->termsAndConditions,
        'validity_period_days' => $dto->validityPeriodDays,
        'contract_number' => $dto->contractNumber,
        'contract_start_date' => $dto->contractStartDate?->toDateString(),
        'contract_end_date' => $dto->contractEndDate?->toDateString(),
        'status' => 'draft',
        'generated_by' => $this->getCurrentUserId(),
        'metadata' => $dto->metadata,
      ]);

      $requisitionItems = $requisition->items;

      foreach ($requisitionItems as $item) {
        $quotationItem = null;
        if ($quotation) {
          $quotationItem = $quotation->items()
            ->where('requisition_item_id', $item->id)
            ->first();
        }

        $this->repository->createPurchaseOrderItem([
          'purchase_order_id' => $po->id,
          'requisition_item_id' => $item->id,
          'supplier_quotation_item_id' => $quotationItem?->id,
          'item_name' => $item->item_name,
          'description' => $item->description,
          'unit_of_measure' => $item->unit_of_measure,
          'quantity' => $item->quantity,
          'unit_price' => $quotationItem?->unit_price ?? $item->estimated_unit_cost,
          'total_price' => $item->total_cost,
          'tax_rate' => $quotationItem?->tax_rate ?? 0,
          'tax_amount' => 0,
          'discount_rate' => 0,
          'discount_amount' => 0,
          'net_price' => $item->total_cost,
          'delivery_days' => $quotationItem?->delivery_days ?? null,
          'warranty_months' => $quotationItem?->warranty_months ?? null,
          'specifications' => $item->specifications,
          'brand' => $quotationItem?->brand ?? null,
          'model' => $quotationItem?->model ?? null,
          'catalog_number' => $quotationItem?->catalog_number ?? null,
          'status' => 'pending',
        ]);
      }

      $po->updateTotalAmount();

      $this->logHistory(
        $requisition->id,
        'po_generated',
        'purchase_order',
        $po->id,
        null,
        ['po_number' => $po->po_number, 'type' => $po->type],
        "Purchase Order {$po->po_number} generated"
      );

      return $po;
    });
  }

  public function getPurchaseOrder(int $poId): PurchaseOrder
  {
    $po = $this->repository->findPurchaseOrder($poId);

    if (!$po) {
      throw PurchaseOrderException::poNotFound($poId);
    }

    return $po;
  }

  public function getPurchaseOrdersForRequisition(int $requisitionId): array
  {
    return $this->repository->getPurchaseOrdersForRequisition($requisitionId);
  }

  public function approvePurchaseOrder(int $poId, int $userId, ?string $comment = null): PurchaseOrder
  {
    $po = $this->getPurchaseOrder($poId);

    if ($po->status !== 'draft' && $po->status !== 'issued') {
      throw new \Exception('PO can only be approved from draft or issued status.');
    }

    return $this->transaction(function () use ($po, $userId, $comment) {
      $po->update([
        'status' => 'issued',
        'approved_by' => $userId,
        'approved_at' => now(),
      ]);

      $this->logHistory(
        $po->requisition_id,
        'po_approved',
        'purchase_order',
        $po->id,
        null,
        ['status' => 'issued'],
        "Purchase Order {$po->po_number} approved" . ($comment ? ": {$comment}" : "")
      );

      return $po;
    });
  }

  public function issuePurchaseOrder(int $poId): PurchaseOrder
  {
    $po = $this->getPurchaseOrder($poId);

    if ($po->status !== 'draft') {
      throw new \Exception('PO can only be issued from draft status.');
    }

    return $this->transaction(function () use ($po) {
      $po->markAsIssued();

      $this->logHistory(
        $po->requisition_id,
        'po_issued',
        'purchase_order',
        $po->id,
        null,
        ['status' => 'issued'],
        "Purchase Order {$po->po_number} issued"
      );

      return $po;
    });
  }

  public function sendPurchaseOrderToSupplier(int $poId): PurchaseOrder
  {
    $po = $this->getPurchaseOrder($poId);

    if ($po->status !== 'issued') {
      throw PurchaseOrderException::poMustBeIssued();
    }

    return $this->transaction(function () use ($po) {
      $po->markAsSent();

      $pdfContent = $this->generatePurchaseOrderPdf($po->id);

      $this->notificationDispatcher->notify('po_sent', [
        'purchase_order_id' => $po->id,
        'po_number' => $po->po_number,
        'supplier_id' => $po->supplier_id,
        'requisition_id' => $po->requisition_id,
        'pdf_content' => base64_encode($pdfContent),
      ]);

      $this->logHistory(
        $po->requisition_id,
        'po_sent',
        'purchase_order',
        $po->id,
        null,
        ['sent_to' => $po->supplier_id],
        "Purchase Order {$po->po_number} sent to supplier"
      );

      return $po;
    });
  }

  public function acknowledgePurchaseOrder(int $poId, int $supplierId): PurchaseOrder
  {
    $po = $this->getPurchaseOrder($poId);

    if ($po->supplier_id !== $supplierId) {
      throw PurchaseOrderException::supplierMismatch();
    }

    if ($po->status !== 'sent') {
      throw PurchaseOrderException::poMustBeSent();
    }

    return $this->transaction(function () use ($po) {
      $po->markAsAcknowledged();

      $this->logHistory(
        $po->requisition_id,
        'po_acknowledged',
        'purchase_order',
        $po->id,
        null,
        ['status' => 'acknowledged'],
        "Purchase Order {$po->po_number} acknowledged by supplier"
      );

      return $po;
    });
  }

  public function markPurchaseOrderDelivered(int $poId): PurchaseOrder
  {
    $po = $this->getPurchaseOrder($poId);

    if ($po->status === 'completed') {
      throw PurchaseOrderException::poAlreadyCompleted();
    }

    return $this->transaction(function () use ($po) {
      $po->update([
        'status' => 'delivered',
        'actual_delivery_date' => now(),
      ]);

      $this->logHistory(
        $po->requisition_id,
        'po_delivered',
        'purchase_order',
        $po->id,
        null,
        ['status' => 'delivered'],
        "Purchase Order {$po->po_number} delivered"
      );

      return $po;
    });
  }

  public function completePurchaseOrder(int $poId): PurchaseOrder
  {
    $po = $this->getPurchaseOrder($poId);

    return $this->transaction(function () use ($po) {
      $po->markAsCompleted();
      $po->checkDeliveryStatus();

      $this->logHistory(
        $po->requisition_id,
        'po_completed',
        'purchase_order',
        $po->id,
        null,
        ['status' => 'completed'],
        "Purchase Order {$po->po_number} completed"
      );

      return $po;
    });
  }

  public function cancelPurchaseOrder(int $poId, string $reason): PurchaseOrder
  {
    $po = $this->getPurchaseOrder($poId);

    if ($po->status === 'completed') {
      throw PurchaseOrderException::cannotCancelCompleted();
    }

    return $this->transaction(function () use ($po, $reason) {
      $po->markAsCancelled($reason);

      $this->notificationDispatcher->notify('po_cancelled', [
        'purchase_order_id' => $po->id,
        'po_number' => $po->po_number,
        'supplier_id' => $po->supplier_id,
        'reason' => $reason,
      ]);

      $this->logHistory(
        $po->requisition_id,
        'po_cancelled',
        'purchase_order',
        $po->id,
        null,
        ['cancellation_reason' => $reason],
        "Purchase Order {$po->po_number} cancelled: {$reason}"
      );

      return $po;
    });
  }

  public function getLpoForRequisition(int $requisitionId): ?PurchaseOrder
  {
    return $this->repository->getLpoForRequisition($requisitionId);
  }

  public function getLsoForRequisition(int $requisitionId): ?PurchaseOrder
  {
    return $this->repository->getLsoForRequisition($requisitionId);
  }

  public function getPurchaseOrderSummary(int $poId): array
  {
    $po = $this->getPurchaseOrder($poId);

    return [
      'purchase_order' => [
        'id' => $po->id,
        'po_number' => $po->po_number,
        'type' => $po->type_label,
        'status' => $po->status_label,
        'total_amount' => $po->formatted_total_amount,
        'issue_date' => $po->issue_date->toDateString(),
        'expected_delivery' => $po->expected_delivery_date->toDateString(),
      ],
      'supplier' => [
        'id' => $po->supplier_id,
        'name' => $po->supplier_name,
        'email' => $po->supplier?->email,
        'phone' => $po->supplier?->phone,
      ],
      'items' => $po->items->map(function ($item) {
        return [
          'id' => $item->id,
          'item_name' => $item->item_name,
          'quantity' => $item->quantity,
          'unit_price' => $item->unit_price,
          'total_price' => $item->total_price,
          'received_quantity' => $item->received_quantity,
          'status' => $item->status_label,
          'is_fully_received' => $item->is_fully_received,
        ];
      }),
      'delivery_progress' => $po->delivery_progress,
      'is_overdue' => $po->is_overdue,
      'approvals' => [
        'generated_by' => $po->generatedBy?->full_name,
        'checked_by' => $po->checkedBy?->full_name,
        'endorsed_by' => $po->endorsedBy?->full_name,
        'approved_by' => $po->approvedBy?->full_name,
      ],
      'timeline' => [
        'generated_at' => $po->created_at->toDateTimeString(),
        'issued_at' => $po->issued_at?->toDateTimeString(),
        'sent_at' => $po->sent_at?->toDateTimeString(),
        'acknowledged_at' => $po->acknowledged_at?->toDateTimeString(),
        'completed_at' => $po->completed_at?->toDateTimeString(),
      ],
    ];
  }

  public function generatePurchaseOrderPdf(int $poId): string
  {
    $po = $this->getPurchaseOrder($poId);
    return $this->pdfGenerator->generatePurchaseOrder($po);
  }

  public function canModifyPurchaseOrder(int $poId): bool
  {
    $po = $this->getPurchaseOrder($poId);
    return in_array($po->status, ['draft', 'issued']);
  }

  public function getDeliveryProgress(int $poId): float
  {
    return $this->repository->updateDeliveryProgress($poId);
  }

  public function getOverduePurchaseOrders(): array
  {
    return $this->repository->getOverduePurchaseOrders();
  }

  public function updatePurchaseOrderItems(int $poId, array $items): PurchaseOrder
  {
    $po = $this->getPurchaseOrder($poId);

    if (!$this->canModifyPurchaseOrder($poId)) {
      throw PurchaseOrderException::poCannotBeModified();
    }

    return $this->transaction(function () use ($po, $items) {
      foreach ($items as $itemData) {
        $item = PurchaseOrderItem::find($itemData['id']);
        if ($item && $item->purchase_order_id === $po->id) {
          $item->update($itemData);
          $item->calculateTotals();
        }
      }

      $po->updateTotalAmount();

      $this->logHistory(
        $po->requisition_id,
        'po_items_updated',
        'purchase_order',
        $po->id,
        null,
        ['item_count' => count($items)],
        "Purchase Order {$po->po_number} items updated"
      );

      return $po;
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
