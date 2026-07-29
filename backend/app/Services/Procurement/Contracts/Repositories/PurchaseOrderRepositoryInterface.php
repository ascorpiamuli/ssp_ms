<?php
// app/Services/Procurement/Contracts/Repositories/PurchaseOrderRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Repositories;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Pagination\LengthAwarePaginator;

interface PurchaseOrderRepositoryInterface
{
  /**
   * Find a purchase order by ID.
   */
  public function findPurchaseOrder(int $id): ?PurchaseOrder;

  /**
   * Find a purchase order by ID or fail.
   */
  public function findPurchaseOrderOrFail(int $id): PurchaseOrder;

  /**
   * Find a purchase order item by ID.
   */
  public function findPurchaseOrderItem(int $id): ?PurchaseOrderItem;

  /**
   * Find a purchase order item by ID or fail.
   */
  public function findPurchaseOrderItemOrFail(int $id): PurchaseOrderItem;

  /**
   * Get all purchase orders for a requisition.
   */
  public function getPurchaseOrdersForRequisition(int $requisitionId): array;

  /**
   * Get all purchase orders for a supplier.
   */
  public function getPurchaseOrdersForSupplier(int $supplierId): array;

  /**
   * Get a purchase order by PO number.
   */
  public function getPurchaseOrderByNumber(string $poNumber): ?PurchaseOrder;

  /**
   * Create a purchase order.
   */
  public function createPurchaseOrder(array $data): PurchaseOrder;

  /**
   * Create a purchase order item.
   */
  public function createPurchaseOrderItem(array $data): PurchaseOrderItem;

  /**
   * Update a purchase order.
   */
  public function updatePurchaseOrder(int $id, array $data): PurchaseOrder;

  /**
   * Update a purchase order item.
   */
  public function updatePurchaseOrderItem(int $id, array $data): PurchaseOrderItem;

  /**
   * Get LPO for a requisition.
   */
  public function getLpoForRequisition(int $requisitionId): ?PurchaseOrder;

  /**
   * Get LSO for a requisition.
   */
  public function getLsoForRequisition(int $requisitionId): ?PurchaseOrder;

  /**
   * Get active purchase orders.
   */
  public function getActivePurchaseOrders(): array;

  /**
   * Get overdue purchase orders.
   */
  public function getOverduePurchaseOrders(): array;

  /**
   * Paginate purchase orders.
   */
  public function paginatePurchaseOrders(int $perPage = 15): LengthAwarePaginator;

  /**
   * Get items for a purchase order.
   */
  public function getPurchaseOrderItems(int $poId): array;

  /**
   * Update delivery progress for a purchase order.
   */
  public function updateDeliveryProgress(int $poId): float;

  /**
   * Get all purchase orders by status.
   */
  public function getPurchaseOrdersByStatus(string $status): array;

  /**
   * Get all purchase orders by type.
   */
  public function getPurchaseOrdersByType(string $type): array;

  /**
   * Get purchase orders with items not fully received.
   */
  public function getIncompletePurchaseOrders(): array;

  /**
   * Get purchase orders ready for completion.
   */
  public function getPurchaseOrdersReadyForCompletion(): array;

  /**
   * Delete a purchase order item.
   */
  public function deletePurchaseOrderItem(int $id): bool;
}
