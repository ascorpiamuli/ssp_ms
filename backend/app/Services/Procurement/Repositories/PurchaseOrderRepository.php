<?php
// app/Services/Procurement/Repositories/PurchaseOrderRepository.php

declare(strict_types=1);

namespace App\Services\Procurement\Repositories;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Services\Procurement\Contracts\Repositories\PurchaseOrderRepositoryInterface;
use App\Services\Procurement\Repositories\BaseRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class PurchaseOrderRepository extends BaseRepository implements PurchaseOrderRepositoryInterface
{
  public function __construct()
  {
    parent::__construct(new PurchaseOrder());
  }

  public function findPurchaseOrder(int $id): ?PurchaseOrder
  {
    return PurchaseOrder::with([
      'requisition',
      'supplier',
      'items',
      'generatedBy',
      'checkedBy',
      'endorsedBy',
      'approvedBy'
    ])->find($id);
  }

  public function findPurchaseOrderOrFail(int $id): PurchaseOrder
  {
    return PurchaseOrder::with([
      'requisition',
      'supplier',
      'items',
      'generatedBy',
      'checkedBy',
      'endorsedBy',
      'approvedBy'
    ])->findOrFail($id);
  }

  public function findPurchaseOrderItem(int $id): ?PurchaseOrderItem
  {
    return PurchaseOrderItem::with(['purchaseOrder', 'requisitionItem'])
      ->find($id);
  }

  public function findPurchaseOrderItemOrFail(int $id): PurchaseOrderItem
  {
    return PurchaseOrderItem::with(['purchaseOrder', 'requisitionItem'])
      ->findOrFail($id);
  }

  public function getPurchaseOrdersForRequisition(int $requisitionId): array
  {
    return PurchaseOrder::where('requisition_id', $requisitionId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getPurchaseOrdersForSupplier(int $supplierId): array
  {
    return PurchaseOrder::where('supplier_id', $supplierId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getPurchaseOrderByNumber(string $poNumber): ?PurchaseOrder
  {
    return PurchaseOrder::where('po_number', $poNumber)->first();
  }

  public function createPurchaseOrder(array $data): PurchaseOrder
  {
    return PurchaseOrder::create($data);
  }

  public function createPurchaseOrderItem(array $data): PurchaseOrderItem
  {
    return PurchaseOrderItem::create($data);
  }

  public function updatePurchaseOrder(int $id, array $data): PurchaseOrder
  {
    $po = $this->findPurchaseOrderOrFail($id);
    $po->update($data);
    return $po;
  }

  public function updatePurchaseOrderItem(int $id, array $data): PurchaseOrderItem
  {
    $item = $this->findPurchaseOrderItemOrFail($id);
    $item->update($data);
    return $item;
  }

  public function getLpoForRequisition(int $requisitionId): ?PurchaseOrder
  {
    return PurchaseOrder::where('requisition_id', $requisitionId)
      ->where('type', 'lpo')
      ->whereNotIn('status', ['cancelled', 'closed'])
      ->first();
  }

  public function getLsoForRequisition(int $requisitionId): ?PurchaseOrder
  {
    return PurchaseOrder::where('requisition_id', $requisitionId)
      ->where('type', 'lso')
      ->whereNotIn('status', ['cancelled', 'closed'])
      ->first();
  }

  public function getActivePurchaseOrders(): array
  {
    return PurchaseOrder::whereIn('status', ['issued', 'sent', 'acknowledged', 'delivered', 'partial'])
      ->with(['requisition', 'supplier'])
      ->orderBy('expected_delivery_date')
      ->get()
      ->toArray();
  }

  public function getOverduePurchaseOrders(): array
  {
    return PurchaseOrder::whereDate('expected_delivery_date', '<', now())
      ->whereNotIn('status', ['completed', 'cancelled', 'closed'])
      ->with(['requisition', 'supplier'])
      ->orderBy('expected_delivery_date')
      ->get()
      ->toArray();
  }

  public function paginatePurchaseOrders(int $perPage = 15): LengthAwarePaginator
  {
    return PurchaseOrder::with(['requisition', 'supplier'])
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  public function getPurchaseOrderItems(int $poId): array
  {
    return PurchaseOrderItem::where('purchase_order_id', $poId)
      ->get()
      ->toArray();
  }

  public function updateDeliveryProgress(int $poId): float
  {
    $po = $this->findPurchaseOrder($poId);
    if (!$po) {
      return 0;
    }

    $items = $po->items;
    $total = $items->count();
    if ($total === 0) {
      return 0;
    }

    $received = $items->where('fully_received', true)->count();
    $progress = round(($received / $total) * 100, 2);

    return $progress;
  }

  public function getPurchaseOrdersByStatus(string $status): array
  {
    return PurchaseOrder::where('status', $status)
      ->with(['requisition', 'supplier'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getPurchaseOrdersByType(string $type): array
  {
    return PurchaseOrder::where('type', $type)
      ->with(['requisition', 'supplier'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getIncompletePurchaseOrders(): array
  {
    return PurchaseOrder::whereNotIn('status', ['completed', 'cancelled', 'closed'])
      ->whereHas('items', function ($query) {
        $query->where('fully_received', false);
      })
      ->with(['requisition', 'supplier'])
      ->get()
      ->toArray();
  }

  public function getPurchaseOrdersReadyForCompletion(): array
  {
    return PurchaseOrder::where('status', 'delivered')
      ->whereHas('items', function ($query) {
        $query->where('fully_received', true);
      })
      ->with(['requisition', 'supplier'])
      ->get()
      ->toArray();
  }

  public function deletePurchaseOrderItem(int $id): bool
  {
    $item = $this->findPurchaseOrderItem($id);
    if (!$item) {
      return false;
    }
    return $item->delete();
  }

  /**
   * ✅ Check purchase order (HOD)
   */
  public function checkPurchaseOrder(int $id, int $userId, ?string $comment = null): PurchaseOrder
  {
    $po = $this->findPurchaseOrderOrFail($id);

    $po->update([
      'checked_by' => $userId,
      'checked_at' => now(),
    ]);

    return $po->fresh();
  }

  /**
   * ✅ Endorse purchase order (Accountant)
   */
  public function endorsePurchaseOrder(int $id, int $userId, ?string $comment = null): PurchaseOrder
  {
    $po = $this->findPurchaseOrderOrFail($id);

    $po->update([
      'endorsed_by' => $userId,
      'endorsed_at' => now(),
    ]);

    return $po->fresh();
  }

  /**
   * ✅ Approve purchase order (Director/Finance Admin)
   */
  public function approvePurchaseOrder(int $id, int $userId, ?string $comment = null): PurchaseOrder
  {
    $po = $this->findPurchaseOrderOrFail($id);

    $po->update([
      'approved_by' => $userId,
      'approved_at' => now(),
      'status' => 'issued',  // Ready to send to supplier
    ]);

    return $po->fresh();
  }

  /**
   * ✅ Get workflow status for a purchase order
   */
  public function getWorkflowStatus(int $id): array
  {
    $po = $this->findPurchaseOrderOrFail($id);

    return [
      'id' => $po->id,
      'po_number' => $po->po_number,
      'status' => $po->status,
      'checked_by' => $po->checked_by,
      'checked_at' => $po->checked_at,
      'endorsed_by' => $po->endorsed_by,
      'endorsed_at' => $po->endorsed_at,
      'approved_by' => $po->approved_by,
      'approved_at' => $po->approved_at,
      'checked_by_user' => $po->checkedBy?->full_name,
      'endorsed_by_user' => $po->endorsedBy?->full_name,
      'approved_by_user' => $po->approvedBy?->full_name,
    ];
  }
}
