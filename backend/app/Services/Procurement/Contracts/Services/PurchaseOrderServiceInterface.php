<?php
// app/Services/Procurement/Contracts/Services/PurchaseOrderServiceInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Services;

use App\Models\PurchaseOrder;
use App\Models\Requisition;
use App\Services\Procurement\DTOs\PurchaseOrderDTO;

interface PurchaseOrderServiceInterface
{
  /**
   * Generate a purchase order (LPO/LSO).
   */
  public function generatePurchaseOrder(PurchaseOrderDTO $dto): PurchaseOrder;

  /**
   * Get a purchase order by ID.
   */
  public function getPurchaseOrder(int $poId): PurchaseOrder;

  /**
   * Get all purchase orders for a requisition.
   */
  public function getPurchaseOrdersForRequisition(int $requisitionId): array;

  /**
   * Approve a purchase order.
   */
  public function approvePurchaseOrder(int $poId, int $userId, ?string $comment = null): PurchaseOrder;

  /**
   * Issue a purchase order.
   */
  public function issuePurchaseOrder(int $poId): PurchaseOrder;

  /**
   * Send purchase order to supplier.
   */
  public function sendPurchaseOrderToSupplier(int $poId): PurchaseOrder;

  /**
   * Acknowledge purchase order by supplier.
   */
  public function acknowledgePurchaseOrder(int $poId, int $supplierId): PurchaseOrder;

  /**
   * Mark purchase order as delivered.
   */
  public function markPurchaseOrderDelivered(int $poId): PurchaseOrder;

  /**
   * Complete a purchase order.
   */
  public function completePurchaseOrder(int $poId): PurchaseOrder;

  /**
   * Cancel a purchase order.
   */
  public function cancelPurchaseOrder(int $poId, string $reason): PurchaseOrder;

  /**
   * Get LPO for a requisition.
   */
  public function getLpoForRequisition(int $requisitionId): ?PurchaseOrder;

  /**
   * Get LSO for a requisition.
   */
  public function getLsoForRequisition(int $requisitionId): ?PurchaseOrder;

  /**
   * Get purchase order summary.
   */
  public function getPurchaseOrderSummary(int $poId): array;

  /**
   * Generate purchase order PDF.
   */
  public function generatePurchaseOrderPdf(int $poId): string;

  /**
   * Check if purchase order can be modified.
   */
  public function canModifyPurchaseOrder(int $poId): bool;

  /**
   * Get delivery progress for a purchase order.
   */
  public function getDeliveryProgress(int $poId): float;

  /**
   * Get overdue purchase orders.
   */
  public function getOverduePurchaseOrders(): array;

  /**
   * Update purchase order items.
   */
  public function updatePurchaseOrderItems(int $poId, array $items): PurchaseOrder;
}
