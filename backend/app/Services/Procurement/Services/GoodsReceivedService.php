<?php
// app/Services/Procurement/Services/GoodsReceivedService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\PurchaseOrder;
use App\Models\GoodsReceivedNote;
use App\Models\GoodsReceivedItem;
use App\Models\ServiceAcknowledgmentNote;
use App\Services\Procurement\Base\BaseService;
use App\Services\Procurement\Contracts\Services\GoodsReceivedServiceInterface;
use App\Services\Procurement\Contracts\Repositories\GoodsReceivedRepositoryInterface;
use App\Services\Procurement\Contracts\Repositories\PurchaseOrderRepositoryInterface;
use App\Services\Procurement\Contracts\Utilities\ReferenceNumberGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\PdfGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\DTOs\GoodsReceivedDTO;
use App\Services\Procurement\Exceptions\GoodsReceivedException;
use App\Services\Admin\AuditLogService;

class GoodsReceivedService extends BaseService implements GoodsReceivedServiceInterface
{
  public function __construct(
    protected GoodsReceivedRepositoryInterface $repository,
    protected PurchaseOrderRepositoryInterface $poRepository,
    protected ReferenceNumberGeneratorInterface $referenceGenerator,
    protected PdfGeneratorInterface $pdfGenerator,
    protected NotificationDispatcherInterface $notificationDispatcher,
    protected AuditLogService $auditLogService
  ) {
    parent::__construct();
  }

  public function createGrn(GoodsReceivedDTO $dto): GoodsReceivedNote
  {
    $po = PurchaseOrder::find($dto->purchaseOrderId);

    if (!$po) {
      throw GoodsReceivedException::poNotFound($dto->purchaseOrderId);
    }

    if ($po->type !== 'lpo') {
      throw GoodsReceivedException::poMustBeLpo();
    }

    if ($po->status === 'completed') {
      throw GoodsReceivedException::poAlreadyCompleted();
    }

    if (empty($dto->items)) {
      throw GoodsReceivedException::noItems();
    }

    return $this->transaction(function () use ($po, $dto) {
      $grn = $this->repository->createGrn([
        'requisition_id' => $po->requisition_id,
        'purchase_order_id' => $po->id,
        'grn_number' => $this->referenceGenerator->generateGrnNumber(),
        'reference_number' => $dto->referenceNumber,
        'received_date' => $dto->receivedDate->toDateString(),
        'received_time' => $dto->receivedTime,
        'received_by' => $this->getCurrentUserId(),
        'inspected_by' => null,
        'inspection_result' => 'pending',
        'delivery_note_number' => $dto->deliveryNoteNumber,
        'carrier' => $dto->carrier,
        'waybill_number' => $dto->waybillNumber,
        'vehicle_number' => $dto->vehicleNumber,
        'delivery_condition' => $dto->deliveryCondition,
        'status' => 'draft',
        'approval_level' => $dto->approvalLevel,
        'metadata' => $dto->metadata,
      ]);

      // Audit: Log GRN creation
      $this->auditLogService->logModelCreated(
        $grn,
        "GRN {$grn->grn_number} created for PO #{$po->id}"
      );

      foreach ($dto->items as $itemData) {
        $poItem = $po->items()->find($itemData['purchase_order_item_id']);

        if (!$poItem) {
          throw GoodsReceivedException::poItemNotFound($itemData['purchase_order_item_id']);
        }

        $receivedQuantity = $itemData['received_quantity'] ?? 0;
        $rejectedQuantity = $itemData['rejected_quantity'] ?? 0;
        $acceptedQuantity = $receivedQuantity - $rejectedQuantity;

        $this->repository->createGrnItem([
          'goods_received_note_id' => $grn->id,
          'purchase_order_item_id' => $poItem->id,
          'requisition_item_id' => $poItem->requisition_item_id,
          'item_name' => $poItem->item_name,
          'description' => $poItem->description,
          'unit_of_measure' => $poItem->unit_of_measure,
          'ordered_quantity' => $poItem->quantity,
          'received_quantity' => $receivedQuantity,
          'accepted_quantity' => $acceptedQuantity,
          'rejected_quantity' => $rejectedQuantity,
          'unit_price' => $poItem->unit_price,
          'total_value' => $receivedQuantity * $poItem->unit_price,
          'rejection_reason' => $itemData['rejection_reason'] ?? null,
          'condition_notes' => $itemData['condition_notes'] ?? null,
          'quality_status' => 'pending',
          'batch_number' => $itemData['batch_number'] ?? null,
          'serial_numbers' => $itemData['serial_numbers'] ?? null,
          'expiry_date' => $itemData['expiry_date'] ?? null,
          'manufacturing_date' => $itemData['manufacturing_date'] ?? null,
          'warranty_start_date' => $itemData['warranty_start_date'] ?? null,
          'warranty_end_date' => $itemData['warranty_end_date'] ?? null,
          'storage_location' => $itemData['storage_location'] ?? null,
          'bin_number' => $itemData['bin_number'] ?? null,
          'rack_number' => $itemData['rack_number'] ?? null,
          'is_quarantined' => $itemData['is_quarantined'] ?? false,
          'quarantine_reason' => $itemData['quarantine_reason'] ?? null,
          'metadata' => $itemData['metadata'] ?? null,
        ]);

        $poItem->updateReceivedQuantity($receivedQuantity);
      }

      $grn->updateTotals();
      $po->checkDeliveryStatus();

      $this->logHistory(
        $po->requisition_id,
        'grn_generated',
        'goods_received_note',
        $grn->id,
        null,
        ['grn_number' => $grn->grn_number],
        "GRN {$grn->grn_number} generated"
      );

      return $grn;
    });
  }

  public function createSan(GoodsReceivedDTO $dto): ServiceAcknowledgmentNote
  {
    $po = PurchaseOrder::find($dto->purchaseOrderId);

    if (!$po) {
      throw GoodsReceivedException::poNotFound($dto->purchaseOrderId);
    }

    if ($po->type !== 'lso') {
      throw GoodsReceivedException::poMustBeLso();
    }

    return $this->transaction(function () use ($po, $dto) {
      $san = $this->repository->createSan([
        'requisition_id' => $po->requisition_id,
        'purchase_order_id' => $po->id,
        'san_number' => $this->referenceGenerator->generateSanNumber(),
        'reference_number' => $dto->referenceNumber,
        'acknowledgment_date' => $dto->receivedDate->toDateString(),
        'acknowledgment_time' => $dto->receivedTime,
        'acknowledged_by' => $this->getCurrentUserId(),
        'service_start_date' => $dto->serviceStartDate?->toDateString(),
        'service_end_date' => $dto->serviceEndDate?->toDateString(),
        'service_provider' => $dto->serviceProvider,
        'service_description' => $dto->serviceDescription,
        'service_deliverables' => $dto->serviceDeliverables,
        'total_value' => $po->total_amount,
        'total_tax' => $po->tax_amount,
        'total_discount' => 0,
        'net_total' => $po->total_with_tax,
        'quality_notes' => $dto->notes,
        'performance_notes' => null,
        'quality_rating' => null,
        'status' => 'draft',
        'approval_level' => $dto->approvalLevel,
        'metadata' => $dto->metadata,
      ]);

      // Audit: Log SAN creation
      $this->auditLogService->logModelCreated(
        $san,
        "SAN {$san->san_number} created for PO #{$po->id}"
      );

      $po->markPurchaseOrderDelivered($po->id);

      $this->logHistory(
        $po->requisition_id,
        'san_generated',
        'service_acknowledgment_note',
        $san->id,
        null,
        ['san_number' => $san->san_number],
        "SAN {$san->san_number} generated"
      );

      return $san;
    });
  }

  public function getGrn(int $grnId): GoodsReceivedNote
  {
    $grn = $this->repository->findGrn($grnId);

    if (!$grn) {
      throw GoodsReceivedException::grnNotFound($grnId);
    }

    return $grn;
  }

  public function getSan(int $sanId): ServiceAcknowledgmentNote
  {
    $san = $this->repository->findSan($sanId);

    if (!$san) {
      throw GoodsReceivedException::sanNotFound($sanId);
    }

    return $san;
  }

  public function getGrnsForPurchaseOrder(int $purchaseOrderId): array
  {
    return $this->repository->getGrnsForPurchaseOrder($purchaseOrderId);
  }

  public function getSansForPurchaseOrder(int $purchaseOrderId): array
  {
    return $this->repository->getSansForPurchaseOrder($purchaseOrderId);
  }

  public function submitGrnForApproval(int $grnId): GoodsReceivedNote
  {
    $grn = $this->getGrn($grnId);

    if ($grn->status !== 'draft') {
      throw GoodsReceivedException::grnAlreadySubmitted();
    }

    return $this->transaction(function () use ($grn) {
      $oldValues = $grn->toArray();

      $grn->markAsSubmitted();

      // Audit: Log GRN submission
      $this->auditLogService->logModelUpdated(
        $grn,
        $oldValues,
        "GRN {$grn->grn_number} submitted for approval"
      );

      $this->notificationDispatcher->notify('grn_approval_required', [
        'grn_id' => $grn->id,
        'grn_number' => $grn->grn_number,
        'requisition_id' => $grn->requisition_id,
        'approval_level' => $grn->approval_level,
      ]);

      $this->logHistory(
        $grn->requisition_id,
        'grn_submitted',
        'goods_received_note',
        $grn->id,
        null,
        ['status' => 'submitted'],
        "GRN {$grn->grn_number} submitted for approval"
      );

      return $grn;
    });
  }

  public function submitSanForApproval(int $sanId): ServiceAcknowledgmentNote
  {
    $san = $this->getSan($sanId);

    if ($san->status !== 'draft') {
      throw GoodsReceivedException::sanAlreadySubmitted();
    }

    return $this->transaction(function () use ($san) {
      $oldValues = $san->toArray();

      $san->markAsSubmitted();

      // Audit: Log SAN submission
      $this->auditLogService->logModelUpdated(
        $san,
        $oldValues,
        "SAN {$san->san_number} submitted for approval"
      );

      $this->notificationDispatcher->notify('san_approval_required', [
        'san_id' => $san->id,
        'san_number' => $san->san_number,
        'requisition_id' => $san->requisition_id,
        'approval_level' => $san->approval_level,
      ]);

      $this->logHistory(
        $san->requisition_id,
        'san_submitted',
        'service_acknowledgment_note',
        $san->id,
        null,
        ['status' => 'submitted'],
        "SAN {$san->san_number} submitted for approval"
      );

      return $san;
    });
  }

  public function approveGrn(int $grnId, int $userId, ?string $comment = null): GoodsReceivedNote
  {
    $grn = $this->getGrn($grnId);

    if ($grn->status !== 'submitted') {
      throw GoodsReceivedException::grnMustBeSubmitted();
    }

    return $this->transaction(function () use ($grn, $userId, $comment) {
      $oldValues = $grn->toArray();

      if ($grn->approval_level === 'hod') {
        $grn->markAsHodApproved($userId, $comment);
      } else {
        $grn->markAsPrincipalApproved($userId, $comment);
      }

      // Audit: Log GRN approval
      $approvalMessage = "GRN {$grn->grn_number} approved by user #{$userId}";
      if ($comment) {
        $approvalMessage .= ": {$comment}";
      }
      $this->auditLogService->logModelUpdated(
        $grn,
        $oldValues,
        $approvalMessage
      );

      $this->notificationDispatcher->notify('grn_approved', [
        'grn_id' => $grn->id,
        'grn_number' => $grn->grn_number,
        'requisition_id' => $grn->requisition_id,
        'approved_by' => $userId,
      ]);

      $this->logHistory(
        $grn->requisition_id,
        'grn_approved',
        'goods_received_note',
        $grn->id,
        null,
        ['status' => $grn->status],
        "GRN {$grn->grn_number} approved" . ($comment ? ": {$comment}" : "")
      );

      return $grn;
    });
  }

  public function approveSan(int $sanId, int $userId, ?string $comment = null): ServiceAcknowledgmentNote
  {
    $san = $this->getSan($sanId);

    if ($san->status !== 'submitted') {
      throw GoodsReceivedException::sanMustBeSubmitted();
    }

    return $this->transaction(function () use ($san, $userId, $comment) {
      $oldValues = $san->toArray();

      if ($san->approval_level === 'hod') {
        $san->markAsHodApproved($userId, $comment);
      } else {
        $san->markAsPrincipalApproved($userId, $comment);
      }

      // Audit: Log SAN approval
      $approvalMessage = "SAN {$san->san_number} approved by user #{$userId}";
      if ($comment) {
        $approvalMessage .= ": {$comment}";
      }
      $this->auditLogService->logModelUpdated(
        $san,
        $oldValues,
        $approvalMessage
      );

      $this->notificationDispatcher->notify('san_approved', [
        'san_id' => $san->id,
        'san_number' => $san->san_number,
        'requisition_id' => $san->requisition_id,
        'approved_by' => $userId,
      ]);

      $this->logHistory(
        $san->requisition_id,
        'san_approved',
        'service_acknowledgment_note',
        $san->id,
        null,
        ['status' => $san->status],
        "SAN {$san->san_number} approved" . ($comment ? ": {$comment}" : "")
      );

      return $san;
    });
  }

  public function rejectGrn(int $grnId, string $reason): GoodsReceivedNote
  {
    $grn = $this->getGrn($grnId);

    if ($grn->status !== 'submitted') {
      throw GoodsReceivedException::grnMustBeSubmitted();
    }

    return $this->transaction(function () use ($grn, $reason) {
      $oldValues = $grn->toArray();

      $grn->markAsRejected($reason);

      // Audit: Log GRN rejection
      $this->auditLogService->logModelUpdated(
        $grn,
        $oldValues,
        "GRN {$grn->grn_number} rejected. Reason: {$reason}"
      );

      $this->notificationDispatcher->notify('grn_rejected', [
        'grn_id' => $grn->id,
        'grn_number' => $grn->grn_number,
        'requisition_id' => $grn->requisition_id,
        'reason' => $reason,
      ]);

      $this->logHistory(
        $grn->requisition_id,
        'grn_rejected',
        'goods_received_note',
        $grn->id,
        null,
        ['rejection_reason' => $reason],
        "GRN {$grn->grn_number} rejected: {$reason}"
      );

      return $grn;
    });
  }

  public function rejectSan(int $sanId, string $reason): ServiceAcknowledgmentNote
  {
    $san = $this->getSan($sanId);

    if ($san->status !== 'submitted') {
      throw GoodsReceivedException::sanMustBeSubmitted();
    }

    return $this->transaction(function () use ($san, $reason) {
      $oldValues = $san->toArray();

      $san->markAsRejected($reason);

      // Audit: Log SAN rejection
      $this->auditLogService->logModelUpdated(
        $san,
        $oldValues,
        "SAN {$san->san_number} rejected. Reason: {$reason}"
      );

      $this->notificationDispatcher->notify('san_rejected', [
        'san_id' => $san->id,
        'san_number' => $san->san_number,
        'requisition_id' => $san->requisition_id,
        'reason' => $reason,
      ]);

      $this->logHistory(
        $san->requisition_id,
        'san_rejected',
        'service_acknowledgment_note',
        $san->id,
        null,
        ['rejection_reason' => $reason],
        "SAN {$san->san_number} rejected: {$reason}"
      );

      return $san;
    });
  }

  public function inspectGoods(int $grnId, array $data): GoodsReceivedNote
  {
    $grn = $this->getGrn($grnId);

    if ($grn->status !== 'submitted' && $grn->status !== 'draft') {
      throw new \Exception('GRN must be in draft or submitted status for inspection.');
    }

    return $this->transaction(function () use ($grn, $data) {
      $oldValues = $grn->toArray();

      $grn->updateInspection(
        $data['inspection_result'] ?? 'passed',
        $data['inspection_notes'] ?? null
      );

      foreach ($data['items'] ?? [] as $itemData) {
        $item = $grn->items()->find($itemData['id']);
        if ($item) {
          $item->update([
            'quality_status' => $itemData['quality_status'] ?? 'passed',
            'quality_notes' => $itemData['quality_notes'] ?? null,
          ]);
        }
      }

      // Audit: Log GRN inspection
      $inspectionResult = $data['inspection_result'] ?? 'passed';
      $this->auditLogService->logModelUpdated(
        $grn,
        $oldValues,
        "GRN {$grn->grn_number} inspected. Result: {$inspectionResult}"
      );

      $this->logHistory(
        $grn->requisition_id,
        'grn_inspected',
        'goods_received_note',
        $grn->id,
        null,
        ['inspection_result' => $grn->inspection_result],
        "GRN {$grn->grn_number} inspected"
      );

      return $grn;
    });
  }

  public function qualityRateService(int $sanId, array $data): ServiceAcknowledgmentNote
  {
    $san = $this->getSan($sanId);

    return $this->transaction(function () use ($san, $data) {
      $oldValues = $san->toArray();

      $san->rateQuality(
        $data['quality_rating'] ?? null,
        $data['quality_notes'] ?? null
      );

      if (isset($data['performance_notes'])) {
        $san->update(['performance_notes' => $data['performance_notes']]);
      }

      // Audit: Log SAN quality rating
      $qualityRating = $data['quality_rating'] ?? 'N/A';
      $this->auditLogService->logModelUpdated(
        $san,
        $oldValues,
        "SAN {$san->san_number} quality rated. Rating: {$qualityRating}"
      );

      $this->logHistory(
        $san->requisition_id,
        'san_quality_rated',
        'service_acknowledgment_note',
        $san->id,
        null,
        ['quality_rating' => $san->quality_rating],
        "SAN {$san->san_number} quality rated"
      );

      return $san;
    });
  }

  public function getGrnSummary(int $grnId): array
  {
    $grn = $this->getGrn($grnId);

    return [
      'grn' => [
        'id' => $grn->id,
        'grn_number' => $grn->grn_number,
        'status' => $grn->status_label,
        'received_date' => $grn->received_date->toDateString(),
        'total_value' => $grn->formatted_total_value,
        'approval_level' => $grn->approval_level_label,
      ],
      'purchase_order' => [
        'id' => $grn->purchaseOrder->id,
        'po_number' => $grn->purchaseOrder->po_number,
      ],
      'items' => $grn->items->map(function ($item) {
        return [
          'id' => $item->id,
          'item_name' => $item->item_name,
          'ordered_quantity' => $item->ordered_quantity,
          'received_quantity' => $item->received_quantity,
          'accepted_quantity' => $item->accepted_quantity,
          'rejected_quantity' => $item->rejected_quantity,
          'quality_status' => $item->quality_status_label,
          'is_quarantined' => $item->is_quarantined,
        ];
      }),
      'inspection' => [
        'result' => $grn->inspection_result_label,
        'notes' => $grn->inspection_notes,
        'inspected_at' => $grn->inspected_at?->toDateTimeString(),
      ],
      'approvals' => [
        'hod_approved_at' => $grn->hod_approved_at?->toDateTimeString(),
        'principal_approved_at' => $grn->principal_approved_at?->toDateTimeString(),
      ],
    ];
  }

  public function getSanSummary(int $sanId): array
  {
    $san = $this->getSan($sanId);

    return [
      'san' => [
        'id' => $san->id,
        'san_number' => $san->san_number,
        'status' => $san->status_label,
        'acknowledgment_date' => $san->acknowledgment_date->toDateString(),
        'total_value' => number_format($san->total_value, 2),
        'quality_rating' => $san->quality_rating_label,
        'approval_level' => $san->approval_level_label,
      ],
      'purchase_order' => [
        'id' => $san->purchaseOrder->id,
        'po_number' => $san->purchaseOrder->po_number,
      ],
      'service' => [
        'description' => $san->service_description,
        'start_date' => $san->service_start_date?->toDateString(),
        'end_date' => $san->service_end_date?->toDateString(),
        'deliverables' => $san->service_deliverables,
      ],
      'approvals' => [
        'hod_approved_at' => $san->hod_approved_at?->toDateTimeString(),
        'principal_approved_at' => $san->principal_approved_at?->toDateTimeString(),
      ],
    ];
  }

  public function generateGrnPdf(int $grnId): string
  {
    $grn = $this->getGrn($grnId);
    return $this->pdfGenerator->generateGrn($grn);
  }

  public function generateSanPdf(int $sanId): string
  {
    $san = $this->getSan($sanId);
    return $this->pdfGenerator->generateSan($san);
  }

  public function getPendingApprovalGrns(): array
  {
    return $this->repository->getPendingApprovalGrns();
  }

  public function getPendingApprovalSans(): array
  {
    return $this->repository->getPendingApprovalSans();
  }

  public function updateGrnItems(int $grnId, array $items): GoodsReceivedNote
  {
    $grn = $this->getGrn($grnId);

    if ($grn->status !== 'draft') {
      throw new \Exception('GRN items can only be updated in draft status.');
    }

    return $this->transaction(function () use ($grn, $items) {
      $oldValues = $grn->toArray();

      foreach ($items as $itemData) {
        $item = $grn->items()->find($itemData['id']);
        if ($item) {
          $item->update($itemData);
          $item->calculateTotalValue();
        }
      }

      $grn->updateTotals();

      // Audit: Log GRN items update
      $this->auditLogService->logModelUpdated(
        $grn,
        $oldValues,
        "GRN {$grn->grn_number} items updated"
      );

      $this->logHistory(
        $grn->requisition_id,
        'grn_items_updated',
        'goods_received_note',
        $grn->id,
        null,
        ['item_count' => count($items)],
        "GRN {$grn->grn_number} items updated"
      );

      return $grn;
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
