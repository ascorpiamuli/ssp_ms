<?php
// app/Services/Procurement/Services/GoodsReceivedService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
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
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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

  /**
   * Create a Goods Received Note.
   */
  public function createGrn(GoodsReceivedDTO $dto): GoodsReceivedNote
  {
    $po = PurchaseOrder::with(['requisition.department'])->find($dto->purchaseOrderId);

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
      // Calculate totals from items if not provided
      $totalQuantity = $dto->totalQuantity ?? 0;
      $totalValue = $dto->totalValue ?? 0;
      $totalTax = $dto->totalTax ?? 0;
      $totalDiscount = $dto->totalDiscount ?? 0;
      $netTotal = $dto->netTotal ?? 0;

      // If totals not provided, calculate from items
      if ($totalQuantity === 0 && $totalValue === 0) {
        foreach ($dto->items as $itemData) {
          $poItem = $po->items()->find($itemData['purchase_order_item_id']);
          if ($poItem) {
            $receivedQty = $itemData['received_quantity'] ?? 0;
            $unitPrice = $poItem->unit_price ?? 0;
            $totalQuantity += $receivedQty;
            $totalValue += $receivedQty * $unitPrice;
          }
        }
        $netTotal = $totalValue + $totalTax - $totalDiscount;
      }

      $grn = $this->repository->createGrn([
        'requisition_id' => $po->requisition_id,
        'purchase_order_id' => $po->id,
        'grn_number' => $this->referenceGenerator->generateGrnNumber(),
        'reference_number' => $dto->referenceNumber,
        'received_date' => $dto->receivedDate->toDateString(),
        'received_time' => $dto->receivedTime,
        'received_by' => $dto->receivedBy ?? $this->getCurrentUserId(),
        'inspected_by' => null,
        'inspected_at' => null,
        'inspection_notes' => null,
        'inspection_result' => $dto->inspectionResult ?? 'pending',
        'total_quantity' => $totalQuantity,
        'total_value' => $totalValue,
        'total_tax' => $totalTax,
        'total_discount' => $totalDiscount,
        'net_total' => $netTotal,
        'delivery_note_number' => $dto->deliveryNoteNumber,
        'carrier' => $dto->carrier,
        'waybill_number' => $dto->waybillNumber,
        'vehicle_number' => $dto->vehicleNumber,
        'delivery_condition' => $dto->deliveryCondition,
        'status' => $dto->status ?? 'draft',
        'approval_level' => $dto->approvalLevel,
        'additional_notes' => $dto->notes ?? null,
        'metadata' => $dto->metadata,
      ]);

      // ✅ Load relationships including department for the response
      $grn->load(['requisition.department', 'purchaseOrder', 'items']);

      // Audit: Log GRN creation
      $this->auditLogService->logModelCreated(
        $grn,
        "GRN {$grn->grn_number} created for PO #{$po->id}"
      );

      // Create GRN items and update PO items
      foreach ($dto->items as $itemData) {
        $poItem = $po->items()->find($itemData['purchase_order_item_id']);

        if (!$poItem) {
          throw GoodsReceivedException::poItemNotFound($itemData['purchase_order_item_id']);
        }

        $receivedQuantity = $itemData['received_quantity'] ?? 0;
        $rejectedQuantity = $itemData['rejected_quantity'] ?? 0;
        $acceptedQuantity = $receivedQuantity - $rejectedQuantity;

        // ✅ Get requisition_item_id (can be null for custom items)
        $requisitionItemId = $poItem->requisition_item_id ?? null;

        // Create GRN item
        $this->repository->createGrnItem([
          'goods_received_note_id' => $grn->id,
          'purchase_order_item_id' => $poItem->id,
          'requisition_item_id' => $requisitionItemId,
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
          'quality_notes' => null,
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

        // Update PO item WITHOUT touching remaining_quantity (generated column)
        $this->updatePurchaseOrderItemQuantity($poItem, $receivedQuantity);
      }

      // ✅ Reload items with their relationships
      $grn->load(['items.purchaseOrderItem', 'items.requisitionItem']);

      // Update PO delivery status
      $po->checkDeliveryStatus();

      $this->logHistory(
        $po->requisition_id,
        'grn_generated',
        'goods_received_note',
        $grn->id,
        null,
        [
          'grn_number' => $grn->grn_number,
          'total_quantity' => $totalQuantity,
          'total_value' => $totalValue,
          'department_id' => $po->requisition?->department_id,
          'department_name' => $po->requisition?->department?->name,
        ],
        null,
        "GRN {$grn->grn_number} generated for department: " . ($po->requisition?->department?->name ?? 'N/A')
      );

      // ✅ Return the GRN with all relationships loaded
      return $grn->fresh(['requisition.department', 'purchaseOrder.supplier', 'items']);
    });
  }

  /**
   * Update Purchase Order Item quantity without touching generated columns.
   *
   * 🔥 CRITICAL: remaining_quantity is a GENERATED COLUMN in MySQL.
   * MySQL calculates it automatically as: quantity - received_quantity
   * We must NOT set it manually.
   */
  private function updatePurchaseOrderItemQuantity(PurchaseOrderItem $poItem, float $receivedQuantity): void
  {
    $newReceived = (float) $poItem->received_quantity + $receivedQuantity;
    $fullyReceived = $newReceived >= (float) $poItem->quantity;
    $status = $fullyReceived ? 'received' : ($newReceived > 0 ? 'partial' : 'pending');

    // 🔥 CRITICAL: DO NOT include 'remaining_quantity' in the update!
    $poItem->update([
      'received_quantity' => $newReceived,
      'fully_received' => $fullyReceived,
      'fully_received_at' => $fullyReceived ? now() : null,
      'status' => $status,
    ]);
  }

  /**
   * Create a Service Acknowledgment Note.
   */
  public function createSan(GoodsReceivedDTO $dto): ServiceAcknowledgmentNote
  {
    $po = PurchaseOrder::with(['requisition.department'])->find($dto->purchaseOrderId);

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
        'acknowledged_by' => $dto->receivedBy ?? $this->getCurrentUserId(),
        'service_start_date' => $dto->serviceStartDate?->toDateString(),
        'service_end_date' => $dto->serviceEndDate?->toDateString(),
        'service_provider' => $dto->serviceProvider,
        'service_description' => $dto->serviceDescription,
        'service_deliverables' => $dto->serviceDeliverables,
        'total_value' => $po->total_amount,
        'total_tax' => $po->tax_amount ?? 0,
        'total_discount' => 0,
        'net_total' => $po->total_with_tax ?? $po->total_amount,
        'quality_notes' => $dto->notes,
        'performance_notes' => null,
        'quality_rating' => null,
        'status' => 'draft',
        'approval_level' => $dto->approvalLevel,
        'metadata' => $dto->metadata,
      ]);

      // ✅ Load relationships including department for the response
      $san->load(['requisition.department', 'purchaseOrder']);

      // Audit: Log SAN creation
      $this->auditLogService->logModelCreated(
        $san,
        "SAN {$san->san_number} created for PO #{$po->id}"
      );

      $this->logHistory(
        $po->requisition_id,
        'san_generated',
        'service_acknowledgment_note',
        $san->id,
        null,
        [
          'san_number' => $san->san_number,
          'department_id' => $po->requisition?->department_id,
          'department_name' => $po->requisition?->department?->name,
        ],
        null,
        "SAN {$san->san_number} generated for department: " . ($po->requisition?->department?->name ?? 'N/A')
      );

      // ✅ Return the SAN with all relationships loaded
      return $san->fresh(['requisition.department', 'purchaseOrder.supplier']);
    });
  }

  /**
   * Get a single GRN by ID with all relationships including department.
   */
  public function getGrn(int $grnId): GoodsReceivedNote
  {
    $grn = $this->repository->findGrn($grnId);

    if (!$grn) {
      throw GoodsReceivedException::grnNotFound($grnId);
    }

    // ✅ Ensure department is loaded
    if (!$grn->relationLoaded('requisition') || !$grn->requisition->relationLoaded('department')) {
      $grn->load(['requisition.department', 'purchaseOrder.supplier', 'items.purchaseOrderItem', 'items.requisitionItem']);
    }

    return $grn;
  }

  /**
   * Get a single SAN by ID with all relationships including department.
   */
  public function getSan(int $sanId): ServiceAcknowledgmentNote
  {
    $san = $this->repository->findSan($sanId);

    if (!$san) {
      throw GoodsReceivedException::sanNotFound($sanId);
    }

    // ✅ Ensure department is loaded
    if (!$san->relationLoaded('requisition') || !$san->requisition->relationLoaded('department')) {
      $san->load(['requisition.department', 'purchaseOrder.supplier']);
    }

    return $san;
  }

  /**
   * Get all GRNs for a purchase order.
   */
  public function getGrnsForPurchaseOrder(int $purchaseOrderId): array
  {
    $grns = $this->repository->getGrnsForPurchaseOrder($purchaseOrderId);

    // ✅ Ensure department is loaded for each GRN
    foreach ($grns as &$grn) {
      if (is_array($grn) && isset($grn['id'])) {
        $grnModel = GoodsReceivedNote::with(['requisition.department'])->find($grn['id']);
        if ($grnModel) {
          $grn['department'] = $grnModel->requisition?->department ? [
            'id' => $grnModel->requisition->department->id,
            'name' => $grnModel->requisition->department->name,
            'code' => $grnModel->requisition->department->code,
          ] : null;
        }
      }
    }

    return $grns;
  }

  /**
   * Get all SANs for a purchase order.
   */
  public function getSansForPurchaseOrder(int $purchaseOrderId): array
  {
    $sans = $this->repository->getSansForPurchaseOrder($purchaseOrderId);

    // ✅ Ensure department is loaded for each SAN
    foreach ($sans as &$san) {
      if (is_array($san) && isset($san['id'])) {
        $sanModel = ServiceAcknowledgmentNote::with(['requisition.department'])->find($san['id']);
        if ($sanModel) {
          $san['department'] = $sanModel->requisition?->department ? [
            'id' => $sanModel->requisition->department->id,
            'name' => $sanModel->requisition->department->name,
            'code' => $sanModel->requisition->department->code,
          ] : null;
        }
      }
    }

    return $sans;
  }

  /**
   * Get all GRNs (no status filter) with department info.
   */
  public function getAllGrns(): array
  {
    $grns = $this->repository->getAllGrns();

    // ✅ Transform to include department info
    return $this->transformGrnsWithDepartment($grns);
  }

  /**
   * Get all SANs (no status filter) with department info.
   */
  public function getAllSans(): array
  {
    $sans = $this->repository->getAllSans();

    // ✅ Transform to include department info
    return $this->transformSansWithDepartment($sans);
  }

  /**
   * Get GRNs by status with department info.
   */
  public function getGrnsByStatus(string $status): array
  {
    $grns = $this->repository->getGrnsByStatus($status);

    // ✅ Transform to include department info
    return $this->transformGrnsWithDepartment($grns);
  }

  /**
   * Get SANs by status with department info.
   */
  public function getSansByStatus(string $status): array
  {
    $sans = $this->repository->getSansByStatus($status);

    // ✅ Transform to include department info
    return $this->transformSansWithDepartment($sans);
  }

  /**
   * Get GRNs pending approval with department info.
   */
  public function getPendingApprovalGrns(): array
  {
    $grns = $this->repository->getPendingApprovalGrns();

    // ✅ Transform to include department info
    return $this->transformGrnsWithDepartment($grns);
  }

  /**
   * Get SANs pending approval with department info.
   */
  public function getPendingApprovalSans(): array
  {
    $sans = $this->repository->getPendingApprovalSans();

    // ✅ Transform to include department info
    return $this->transformSansWithDepartment($sans);
  }

  /**
   * Get completed GRNs with department info.
   */
  public function getCompletedGrns(): array
  {
    $grns = $this->repository->getCompletedGrns();

    // ✅ Transform to include department info
    return $this->transformGrnsWithDepartment($grns);
  }

  /**
   * Get completed SANs with department info.
   */
  public function getCompletedSans(): array
  {
    $sans = $this->repository->getCompletedSans();

    // ✅ Transform to include department info
    return $this->transformSansWithDepartment($sans);
  }

  /**
   * ✅ Transform GRNs array to include department info.
   */
  private function transformGrnsWithDepartment(array $grns): array
  {
    $result = [];

    foreach ($grns as $grn) {
      // If it's already a model with relationships loaded
      if ($grn instanceof GoodsReceivedNote) {
        $department = $grn->requisition?->department;
        $grnArray = $grn->toArray();
        $grnArray['department'] = $department ? [
          'id' => $department->id,
          'name' => $department->name,
          'code' => $department->code,
          'description' => $department->description,
          'is_active' => $department->is_active,
          'hod_id' => $department->hod_id,
        ] : null;
        $result[] = $grnArray;
        continue;
      }

      // If it's an array with id
      if (is_array($grn) && isset($grn['id'])) {
        $grnModel = GoodsReceivedNote::with(['requisition.department'])->find($grn['id']);
        if ($grnModel) {
          $department = $grnModel->requisition?->department;
          $grn['department'] = $department ? [
            'id' => $department->id,
            'name' => $department->name,
            'code' => $department->code,
            'description' => $department->description,
            'is_active' => $department->is_active,
            'hod_id' => $department->hod_id,
          ] : null;

          // Also add department info to requisition
          if (isset($grn['requisition']) && is_array($grn['requisition'])) {
            $grn['requisition']['department'] = $grn['department'];
          }
        }
        $result[] = $grn;
      } else {
        $result[] = $grn;
      }
    }

    return $result;
  }

  /**
   * ✅ Transform SANs array to include department info.
   */
  private function transformSansWithDepartment(array $sans): array
  {
    $result = [];

    foreach ($sans as $san) {
      // If it's already a model with relationships loaded
      if ($san instanceof ServiceAcknowledgmentNote) {
        $department = $san->requisition?->department;
        $sanArray = $san->toArray();
        $sanArray['department'] = $department ? [
          'id' => $department->id,
          'name' => $department->name,
          'code' => $department->code,
          'description' => $department->description,
          'is_active' => $department->is_active,
          'hod_id' => $department->hod_id,
        ] : null;
        $result[] = $sanArray;
        continue;
      }

      // If it's an array with id
      if (is_array($san) && isset($san['id'])) {
        $sanModel = ServiceAcknowledgmentNote::with(['requisition.department'])->find($san['id']);
        if ($sanModel) {
          $department = $sanModel->requisition?->department;
          $san['department'] = $department ? [
            'id' => $department->id,
            'name' => $department->name,
            'code' => $department->code,
            'description' => $department->description,
            'is_active' => $department->is_active,
            'hod_id' => $department->hod_id,
          ] : null;

          // Also add department info to requisition
          if (isset($san['requisition']) && is_array($san['requisition'])) {
            $san['requisition']['department'] = $san['department'];
          }
        }
        $result[] = $san;
      } else {
        $result[] = $san;
      }
    }

    return $result;
  }

  /**
   * Submit a GRN for approval.
   */
  public function submitGrnForApproval(int $grnId): GoodsReceivedNote
  {
    $grn = $this->getGrn($grnId);

    if ($grn->status !== 'draft') {
      throw GoodsReceivedException::grnAlreadySubmitted();
    }

    return $this->transaction(function () use ($grn) {
      $oldValues = $grn->toArray();

      $grn->markAsSubmitted();

      // ✅ Reload with department for response
      $grn->load(['requisition.department', 'purchaseOrder']);

      $this->auditLogService->logModelUpdated(
        $grn,
        $oldValues,
        "GRN {$grn->grn_number} submitted for approval"
      );

      $departmentName = $grn->requisition?->department?->name ?? 'N/A';
      $this->notificationDispatcher->notify('grn_approval_required', [
        'grn_id' => $grn->id,
        'grn_number' => $grn->grn_number,
        'requisition_id' => $grn->requisition_id,
        'approval_level' => $grn->approval_level,
        'department_id' => $grn->requisition?->department_id,
        'department_name' => $departmentName,
      ]);

      $this->logHistory(
        $grn->requisition_id,
        'grn_submitted',
        'goods_received_note',
        $grn->id,
        null,
        [
          'status' => 'submitted',
          'department_id' => $grn->requisition?->department_id,
          'department_name' => $departmentName,
        ],
        null,
        "GRN {$grn->grn_number} submitted for approval for department: {$departmentName}"
      );

      return $grn;
    });
  }

  /**
   * Submit a SAN for approval.
   */
  public function submitSanForApproval(int $sanId): ServiceAcknowledgmentNote
  {
    $san = $this->getSan($sanId);

    if ($san->status !== 'draft') {
      throw GoodsReceivedException::sanAlreadySubmitted();
    }

    return $this->transaction(function () use ($san) {
      $oldValues = $san->toArray();

      $san->markAsSubmitted();

      // ✅ Reload with department for response
      $san->load(['requisition.department', 'purchaseOrder']);

      $this->auditLogService->logModelUpdated(
        $san,
        $oldValues,
        "SAN {$san->san_number} submitted for approval"
      );

      $departmentName = $san->requisition?->department?->name ?? 'N/A';
      $this->notificationDispatcher->notify('san_approval_required', [
        'san_id' => $san->id,
        'san_number' => $san->san_number,
        'requisition_id' => $san->requisition_id,
        'approval_level' => $san->approval_level,
        'department_id' => $san->requisition?->department_id,
        'department_name' => $departmentName,
      ]);

      $this->logHistory(
        $san->requisition_id,
        'san_submitted',
        'service_acknowledgment_note',
        $san->id,
        null,
        [
          'status' => 'submitted',
          'department_id' => $san->requisition?->department_id,
          'department_name' => $departmentName,
        ],
        null,
        "SAN {$san->san_number} submitted for approval for department: {$departmentName}"
      );

      return $san;
    });
  }

  /**
   * Approve a GRN.
   */
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

      // ✅ Reload with department for response
      $grn->load(['requisition.department', 'purchaseOrder']);

      $approvalMessage = "GRN {$grn->grn_number} approved by user #{$userId}";
      if ($comment) {
        $approvalMessage .= ": {$comment}";
      }
      $this->auditLogService->logModelUpdated(
        $grn,
        $oldValues,
        $approvalMessage
      );

      $departmentName = $grn->requisition?->department?->name ?? 'N/A';
      $this->notificationDispatcher->notify('grn_approved', [
        'grn_id' => $grn->id,
        'grn_number' => $grn->grn_number,
        'requisition_id' => $grn->requisition_id,
        'approved_by' => $userId,
        'department_id' => $grn->requisition?->department_id,
        'department_name' => $departmentName,
      ]);

      $this->logHistory(
        $grn->requisition_id,
        'grn_approved',
        'goods_received_note',
        $grn->id,
        null,
        [
          'status' => $grn->status,
          'department_id' => $grn->requisition?->department_id,
          'department_name' => $departmentName,
        ],
        null,
        "GRN {$grn->grn_number} approved for department: {$departmentName}" . ($comment ? ": {$comment}" : "")
      );

      // Update PO delivery status after GRN approval
      $po = $grn->purchaseOrder;
      if ($po) {
        $po->checkDeliveryStatus();
      }

      return $grn;
    });
  }

  /**
   * Approve a SAN.
   * ✅ FIXED: Mark PO as delivered only after SAN approval
   */
  public function approveSan(int $sanId, int $userId, ?string $comment = null): ServiceAcknowledgmentNote
  {
    $san = $this->getSan($sanId);

    if ($san->status !== 'submitted') {
      throw GoodsReceivedException::sanMustBeSubmitted();
    }

    return $this->transaction(function () use ($san, $userId, $comment) {
      $oldValues = $san->toArray();

      // Approve the SAN
      if ($san->approval_level === 'hod') {
        $san->markAsHodApproved($userId, $comment);
      } else {
        $san->markAsPrincipalApproved($userId, $comment);
      }

      // ✅ Reload with department for response
      $san->load(['requisition.department', 'purchaseOrder']);

      $approvalMessage = "SAN {$san->san_number} approved by user #{$userId}";
      if ($comment) {
        $approvalMessage .= ": {$comment}";
      }
      $this->auditLogService->logModelUpdated(
        $san,
        $oldValues,
        $approvalMessage
      );

      $departmentName = $san->requisition?->department?->name ?? 'N/A';
      $this->notificationDispatcher->notify('san_approved', [
        'san_id' => $san->id,
        'san_number' => $san->san_number,
        'requisition_id' => $san->requisition_id,
        'approved_by' => $userId,
        'department_id' => $san->requisition?->department_id,
        'department_name' => $departmentName,
      ]);

      $this->logHistory(
        $san->requisition_id,
        'san_approved',
        'service_acknowledgment_note',
        $san->id,
        null,
        [
          'status' => $san->status,
          'department_id' => $san->requisition?->department_id,
          'department_name' => $departmentName,
        ],
        null,
        "SAN {$san->san_number} approved for department: {$departmentName}" . ($comment ? ": {$comment}" : "")
      );

      // ✅ FIXED: Mark the PO as delivered AFTER SAN approval
      $po = $san->purchaseOrder;
      if ($po) {
        $po->status = 'delivered';
        $po->actual_delivery_date = now();
        $po->save();

        // Check if PO is now fully delivered and update to completed if needed
        $po->checkDeliveryStatus();

        $this->logHistory(
          $po->requisition_id,
          'po_delivered',
          'purchase_order',
          $po->id,
          null,
          ['status' => $po->status],
          null,
          "Purchase Order {$po->po_number} marked as delivered after SAN {$san->san_number} approval"
        );
      }

      return $san;
    });
  }

  /**
   * Reject a GRN.
   */
  public function rejectGrn(int $grnId, string $reason): GoodsReceivedNote
  {
    $grn = $this->getGrn($grnId);

    if ($grn->status !== 'submitted') {
      throw GoodsReceivedException::grnMustBeSubmitted();
    }

    return $this->transaction(function () use ($grn, $reason) {
      $oldValues = $grn->toArray();

      $grn->markAsRejected($reason);

      // ✅ Reload with department for response
      $grn->load(['requisition.department', 'purchaseOrder']);

      $this->auditLogService->logModelUpdated(
        $grn,
        $oldValues,
        "GRN {$grn->grn_number} rejected. Reason: {$reason}"
      );

      $departmentName = $grn->requisition?->department?->name ?? 'N/A';
      $this->notificationDispatcher->notify('grn_rejected', [
        'grn_id' => $grn->id,
        'grn_number' => $grn->grn_number,
        'requisition_id' => $grn->requisition_id,
        'reason' => $reason,
        'department_id' => $grn->requisition?->department_id,
        'department_name' => $departmentName,
      ]);

      $this->logHistory(
        $grn->requisition_id,
        'grn_rejected',
        'goods_received_note',
        $grn->id,
        null,
        [
          'rejection_reason' => $reason,
          'department_id' => $grn->requisition?->department_id,
          'department_name' => $departmentName,
        ],
        null,
        "GRN {$grn->grn_number} rejected for department: {$departmentName}: {$reason}"
      );

      return $grn;
    });
  }

  /**
   * Reject a SAN.
   */
  public function rejectSan(int $sanId, string $reason): ServiceAcknowledgmentNote
  {
    $san = $this->getSan($sanId);

    if ($san->status !== 'submitted') {
      throw GoodsReceivedException::sanMustBeSubmitted();
    }

    return $this->transaction(function () use ($san, $reason) {
      $oldValues = $san->toArray();

      $san->markAsRejected($reason);

      // ✅ Reload with department for response
      $san->load(['requisition.department', 'purchaseOrder']);

      $this->auditLogService->logModelUpdated(
        $san,
        $oldValues,
        "SAN {$san->san_number} rejected. Reason: {$reason}"
      );

      $departmentName = $san->requisition?->department?->name ?? 'N/A';
      $this->notificationDispatcher->notify('san_rejected', [
        'san_id' => $san->id,
        'san_number' => $san->san_number,
        'requisition_id' => $san->requisition_id,
        'reason' => $reason,
        'department_id' => $san->requisition?->department_id,
        'department_name' => $departmentName,
      ]);

      $this->logHistory(
        $san->requisition_id,
        'san_rejected',
        'service_acknowledgment_note',
        $san->id,
        null,
        [
          'rejection_reason' => $reason,
          'department_id' => $san->requisition?->department_id,
          'department_name' => $departmentName,
        ],
        null,  // ✅ $newValues as null (no new values, or you could pass an array)
        "SAN {$san->san_number} rejected for department: {$departmentName}: {$reason}"
      );

      return $san;
    });
  }

  /**
   * Inspect goods for a GRN.
   */
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

      // ✅ Reload with department for response
      $grn->load(['requisition.department', 'purchaseOrder', 'items']);

      $inspectionResult = $data['inspection_result'] ?? 'passed';
      $this->auditLogService->logModelUpdated(
        $grn,
        $oldValues,
        "GRN {$grn->grn_number} inspected. Result: {$inspectionResult}"
      );

      $departmentName = $grn->requisition?->department?->name ?? 'N/A';
      $this->logHistory(
        $grn->requisition_id,
        'grn_inspected',
        'goods_received_note',
        $grn->id,
        null,
        [
          'inspection_result' => $grn->inspection_result,
          'department_id' => $grn->requisition?->department_id,
          'department_name' => $departmentName,
        ],
        null,  // ✅ $newValues as null (no new values, or you could pass an array)
        "GRN {$grn->grn_number} inspected for department: {$departmentName}"  // ✅ $comment as 8th parameter
      );

      return $grn;
    });
  }

  /**
   * Rate service quality for a SAN.
   */
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

      // ✅ Reload with department for response
      $san->load(['requisition.department', 'purchaseOrder']);

      $qualityRating = $data['quality_rating'] ?? 'N/A';
      $this->auditLogService->logModelUpdated(
        $san,
        $oldValues,
        "SAN {$san->san_number} quality rated. Rating: {$qualityRating}"
      );

      $departmentName = $san->requisition?->department?->name ?? 'N/A';
      $this->logHistory(
        $san->requisition_id,
        'san_quality_rated',
        'service_acknowledgment_note',
        $san->id,
        null,
        null,
        [
          'quality_rating' => $san->quality_rating,
          'department_id' => $san->requisition?->department_id,
          'department_name' => $departmentName,
        ],
        "SAN {$san->san_number} quality rated for department: {$departmentName}"
      );

      return $san;
    });
  }

  /**
   * Get GRN summary with department info.
   */
  public function getGrnSummary(int $grnId): array
  {
    $grn = $this->getGrn($grnId);

    $department = $grn->requisition?->department;
    $departmentInfo = $department ? [
      'id' => $department->id,
      'name' => $department->name,
      'code' => $department->code,
      'hod_id' => $department->hod_id,
    ] : null;

    return [
      'grn' => [
        'id' => $grn->id,
        'grn_number' => $grn->grn_number,
        'status' => $grn->status_label,
        'received_date' => $grn->received_date->toDateString(),
        'total_quantity' => $grn->total_quantity,
        'total_value' => $grn->formatted_total_value,
        'net_total' => $grn->formatted_net_total ?? number_format($grn->net_total, 2),
        'approval_level' => $grn->approval_level_label,
      ],
      'department' => $departmentInfo,
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
          'condition_notes' => $item->condition_notes,
          'is_custom_item' => $item->is_custom_item,
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

  /**
   * Get SAN summary with department info.
   */
  public function getSanSummary(int $sanId): array
  {
    $san = $this->getSan($sanId);

    $department = $san->requisition?->department;
    $departmentInfo = $department ? [
      'id' => $department->id,
      'name' => $department->name,
      'code' => $department->code,
      'hod_id' => $department->hod_id,
    ] : null;

    return [
      'san' => [
        'id' => $san->id,
        'san_number' => $san->san_number,
        'status' => $san->status_label,
        'acknowledgment_date' => $san->acknowledgment_date->toDateString(),
        'total_value' => number_format($san->total_value, 2),
        'net_total' => number_format($san->net_total, 2),
        'quality_rating' => $san->quality_rating_label,
        'approval_level' => $san->approval_level_label,
      ],
      'department' => $departmentInfo,
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

  // ============================================================
  // PDF GENERATION METHODS FOR GOODS RECEIVED NOTES (GRN)
  // ============================================================

  /**
   * Generate GRN PDF and return as string
   */
  public function generateGrnPdf(int $grnId): string
  {
    Log::info('[GoodsReceivedService] generateGrnPdf - START', [
      'grn_id' => $grnId,
    ]);

    $grn = $this->getGrn($grnId);
    $grn->load(['requisition.department', 'purchaseOrder.supplier', 'items']);

    $pdfContent = $this->pdfGenerator->generateGrn($grn);

    Log::info('[GoodsReceivedService] generateGrnPdf - COMPLETED', [
      'grn_id' => $grnId,
      'grn_number' => $grn->grn_number,
    ]);

    return $pdfContent;
  }

  /**
   * Generate GRN PDF and return as download response
   */
  public function generateGrnPdfResponse(int $grnId): Response
  {
    Log::info('[GoodsReceivedService] generateGrnPdfResponse - START', [
      'grn_id' => $grnId,
    ]);

    $grn = $this->getGrn($grnId);
    $grn->load(['requisition.department', 'purchaseOrder.supplier', 'items']);

    $pdfContent = $this->pdfGenerator->generateGrn($grn);

    $filename = $this->getGrnPdfFilename($grn);

    Log::info('[GoodsReceivedService] generateGrnPdfResponse - COMPLETED', [
      'grn_id' => $grnId,
      'filename' => $filename,
    ]);

    return new Response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => "attachment; filename=\"{$filename}\"",
      'Content-Length' => strlen($pdfContent),
      'X-Generated-At' => now()->toDateTimeString(),
    ]);
  }

  /**
   * Stream GRN PDF for preview
   */
  public function streamGrnPDF(int $grnId): Response
  {
    Log::info('[GoodsReceivedService] streamGrnPDF - START', [
      'grn_id' => $grnId,
    ]);

    $grn = $this->getGrn($grnId);
    $grn->load(['requisition.department', 'purchaseOrder.supplier', 'items']);

    $pdfContent = $this->pdfGenerator->generateGrn($grn);

    $filename = $this->getGrnPdfFilename($grn);

    Log::info('[GoodsReceivedService] streamGrnPDF - COMPLETED', [
      'grn_id' => $grnId,
    ]);

    return new Response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => "inline; filename=\"{$filename}\"",
      'Content-Length' => strlen($pdfContent),
    ]);
  }

  /**
   * Generate verified GRN PDF and return as download response
   * Uses the same PDF generator but with a verified filename prefix
   */
  public function generateVerifiedGrnPdfResponse(int $grnId): Response
  {
    Log::info('[GoodsReceivedService] generateVerifiedGrnPdfResponse - START', [
      'grn_id' => $grnId,
    ]);

    $grn = $this->getGrn($grnId);
    $grn->load(['requisition.department', 'purchaseOrder.supplier', 'items']);

    // Use the same PDF generator - the content is the same, just the filename differs
    $pdfContent = $this->pdfGenerator->generateGrn($grn);

    $filename = 'VERIFIED_' . $this->getGrnPdfFilename($grn);

    Log::info('[GoodsReceivedService] generateVerifiedGrnPdfResponse - COMPLETED', [
      'grn_id' => $grnId,
      'filename' => $filename,
    ]);

    return new Response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => "attachment; filename=\"{$filename}\"",
      'Content-Length' => strlen($pdfContent),
      'X-Generated-At' => now()->toDateTimeString(),
    ]);
  }

  /**
   * Generate draft GRN PDF and return as download response
   * Uses the same PDF generator but with a draft filename prefix
   */
  public function generateDraftGrnPdfResponse(int $grnId): Response
  {
    Log::info('[GoodsReceivedService] generateDraftGrnPdfResponse - START', [
      'grn_id' => $grnId,
    ]);

    $grn = $this->getGrn($grnId);
    $grn->load(['requisition.department', 'purchaseOrder.supplier', 'items']);

    // Use the same PDF generator - the content is the same, just the filename differs
    $pdfContent = $this->pdfGenerator->generateGrn($grn);

    $filename = 'DRAFT_' . $this->getGrnPdfFilename($grn);

    Log::info('[GoodsReceivedService] generateDraftGrnPdfResponse - COMPLETED', [
      'grn_id' => $grnId,
      'filename' => $filename,
    ]);

    return new Response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => "attachment; filename=\"{$filename}\"",
      'Content-Length' => strlen($pdfContent),
      'X-Generated-At' => now()->toDateTimeString(),
    ]);
  }

  /**
   * Save GRN PDF to storage
   */
  public function saveGrnPdfToStorage(int $grnId): array
  {
    Log::info('[GoodsReceivedService] saveGrnPdfToStorage - START', [
      'grn_id' => $grnId,
    ]);

    $grn = $this->getGrn($grnId);
    $grn->load(['requisition.department', 'purchaseOrder.supplier', 'items']);

    $pdfContent = $this->pdfGenerator->generateGrn($grn);

    $filename = $this->getGrnPdfFilename($grn);
    $path = 'grns/' . date('Y/m/d') . '/' . $filename;

    // Store the PDF
    Storage::disk('pdfs')->put($path, $pdfContent);

    // Update GRN with PDF path
    $grn->update([
      'pdf_path' => $path,
      'pdf_generated_at' => now(),
    ]);

    Log::info('[GoodsReceivedService] saveGrnPdfToStorage - COMPLETED', [
      'grn_id' => $grnId,
      'path' => $path,
    ]);

    return [
      'path' => $path,
      'filename' => $filename,
      // Use Storage facade for URL (if configured with a disk that supports URLs)
      'url' => Storage::disk('pdfs')->exists($path) ? Storage::disk('pdfs')->url($path) : null,
    ];
  }

  /**
   * Get GRN PDF filename
   */
  protected function getGrnPdfFilename(GoodsReceivedNote $grn): string
  {
    return $grn->grn_number . '.pdf';
  }

  // ============================================================
  // PDF GENERATION METHODS FOR SERVICE ACKNOWLEDGMENT NOTES (SAN)
  // ============================================================

  /**
   * Generate SAN PDF and return as string
   */
  public function generateSanPdf(int $sanId): string
  {
    Log::info('[GoodsReceivedService] generateSanPdf - START', [
      'san_id' => $sanId,
    ]);

    $san = $this->getSan($sanId);
    $san->load(['requisition.department', 'purchaseOrder.supplier']);

    $pdfContent = $this->pdfGenerator->generateSan($san);

    Log::info('[GoodsReceivedService] generateSanPdf - COMPLETED', [
      'san_id' => $sanId,
      'san_number' => $san->san_number,
    ]);

    return $pdfContent;
  }

  /**
   * Generate SAN PDF and return as download response
   */
  public function generateSanPdfResponse(int $sanId): Response
  {
    Log::info('[GoodsReceivedService] generateSanPdfResponse - START', [
      'san_id' => $sanId,
    ]);

    $san = $this->getSan($sanId);
    $san->load(['requisition.department', 'purchaseOrder.supplier']);

    $pdfContent = $this->pdfGenerator->generateSan($san);

    $filename = $this->getSanPdfFilename($san);

    Log::info('[GoodsReceivedService] generateSanPdfResponse - COMPLETED', [
      'san_id' => $sanId,
      'filename' => $filename,
    ]);

    return new Response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => "attachment; filename=\"{$filename}\"",
      'Content-Length' => strlen($pdfContent),
      'X-Generated-At' => now()->toDateTimeString(),
    ]);
  }

  /**
   * Stream SAN PDF for preview
   */
  public function streamSanPDF(int $sanId): Response
  {
    Log::info('[GoodsReceivedService] streamSanPDF - START', [
      'san_id' => $sanId,
    ]);

    $san = $this->getSan($sanId);
    $san->load(['requisition.department', 'purchaseOrder.supplier']);

    $pdfContent = $this->pdfGenerator->generateSan($san);

    $filename = $this->getSanPdfFilename($san);

    Log::info('[GoodsReceivedService] streamSanPDF - COMPLETED', [
      'san_id' => $sanId,
    ]);

    return new Response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => "inline; filename=\"{$filename}\"",
      'Content-Length' => strlen($pdfContent),
    ]);
  }

  /**
   * Generate verified SAN PDF and return as download response
   * Uses the same PDF generator but with a verified filename prefix
   */
  public function generateVerifiedSanPdfResponse(int $sanId): Response
  {
    Log::info('[GoodsReceivedService] generateVerifiedSanPdfResponse - START', [
      'san_id' => $sanId,
    ]);

    $san = $this->getSan($sanId);
    $san->load(['requisition.department', 'purchaseOrder.supplier']);

    // Use the same PDF generator - the content is the same, just the filename differs
    $pdfContent = $this->pdfGenerator->generateSan($san);

    $filename = 'VERIFIED_' . $this->getSanPdfFilename($san);

    Log::info('[GoodsReceivedService] generateVerifiedSanPdfResponse - COMPLETED', [
      'san_id' => $sanId,
      'filename' => $filename,
    ]);

    return new Response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => "attachment; filename=\"{$filename}\"",
      'Content-Length' => strlen($pdfContent),
      'X-Generated-At' => now()->toDateTimeString(),
    ]);
  }

  /**
   * Generate draft SAN PDF and return as download response
   * Uses the same PDF generator but with a draft filename prefix
   */
  public function generateDraftSanPdfResponse(int $sanId): Response
  {
    Log::info('[GoodsReceivedService] generateDraftSanPdfResponse - START', [
      'san_id' => $sanId,
    ]);

    $san = $this->getSan($sanId);
    $san->load(['requisition.department', 'purchaseOrder.supplier']);

    // Use the same PDF generator - the content is the same, just the filename differs
    $pdfContent = $this->pdfGenerator->generateSan($san);

    $filename = 'DRAFT_' . $this->getSanPdfFilename($san);

    Log::info('[GoodsReceivedService] generateDraftSanPdfResponse - COMPLETED', [
      'san_id' => $sanId,
      'filename' => $filename,
    ]);

    return new Response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => "attachment; filename=\"{$filename}\"",
      'Content-Length' => strlen($pdfContent),
      'X-Generated-At' => now()->toDateTimeString(),
    ]);
  }

  /**
   * Save SAN PDF to storage
   */
  public function saveSanPdfToStorage(int $sanId): array
  {
    Log::info('[GoodsReceivedService] saveSanPdfToStorage - START', [
      'san_id' => $sanId,
    ]);

    $san = $this->getSan($sanId);
    $san->load(['requisition.department', 'purchaseOrder.supplier']);

    $pdfContent = $this->pdfGenerator->generateSan($san);

    $filename = $this->getSanPdfFilename($san);
    $path = 'sans/' . date('Y/m/d') . '/' . $filename;

    // Store the PDF
    Storage::disk('pdfs')->put($path, $pdfContent);

    // Update SAN with PDF path
    $san->update([
      'pdf_path' => $path,
      'pdf_generated_at' => now(),
    ]);

    Log::info('[GoodsReceivedService] saveSanPdfToStorage - COMPLETED', [
      'san_id' => $sanId,
      'path' => $path,
    ]);

    return [
      'path' => $path,
      'filename' => $filename,
      // Use Storage facade for URL (if configured with a disk that supports URLs)
      'url' => Storage::disk('pdfs')->exists($path) ? Storage::disk('pdfs')->url($path) : null,
    ];
  }

  /**
   * Get SAN PDF filename
   */
  protected function getSanPdfFilename(ServiceAcknowledgmentNote $san): string
  {
    return $san->san_number . '.pdf';
  }

  /**
   * Update GRN items.
   */
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

      // ✅ Reload with department for response
      $grn->load(['requisition.department', 'purchaseOrder', 'items']);

      $this->auditLogService->logModelUpdated(
        $grn,
        $oldValues,
        "GRN {$grn->grn_number} items updated"
      );

      $departmentName = $grn->requisition?->department?->name ?? 'N/A';
      $this->logHistory(
        $grn->requisition_id,
        'grn_items_updated',
        'goods_received_note',
        $grn->id,
        null,
        null,
        [
          'item_count' => count($items),
          'department_id' => $grn->requisition?->department_id,
          'department_name' => $departmentName,
        ],
        "GRN {$grn->grn_number} items updated for department: {$departmentName}"
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
    ?int $userId = null,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null
  ): void {
    try {
      \App\Models\ProcurementHistory::create([
        'requisition_id' => $requisitionId,
        'user_id' => $userId ?? $this->getCurrentUserId(),
        'action' => $action,
        'entity_type' => $entityType,
        'entity_id' => $entityId,
        'old_values' => $oldValues,
        'new_values' => $newValues,
        'comment' => $comment,
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedService] Failed to log history', [
        'error' => $e->getMessage(),
        'requisition_id' => $requisitionId,
        'action' => $action,
      ]);
    }
  }
}
