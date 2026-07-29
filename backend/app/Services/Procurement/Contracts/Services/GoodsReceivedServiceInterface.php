<?php
// app/Services/Procurement/Contracts/Services/GoodsReceivedServiceInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Services;

use App\Models\GoodsReceivedNote;
use App\Models\ServiceAcknowledgmentNote;
use App\Models\PurchaseOrder;
use App\Services\Procurement\DTOs\GoodsReceivedDTO;

interface GoodsReceivedServiceInterface
{
  /**
   * Create a Goods Received Note (GRN).
   */
  public function createGrn(GoodsReceivedDTO $dto): GoodsReceivedNote;

  /**
   * Create a Service Acknowledgment Note (SAN).
   */
  public function createSan(GoodsReceivedDTO $dto): ServiceAcknowledgmentNote;

  /**
   * Get a GRN by ID.
   */
  public function getGrn(int $grnId): GoodsReceivedNote;

  /**
   * Get a SAN by ID.
   */
  public function getSan(int $sanId): ServiceAcknowledgmentNote;

  /**
   * Get all GRNs for a purchase order.
   */
  public function getGrnsForPurchaseOrder(int $purchaseOrderId): array;

  /**
   * Get all SANs for a purchase order.
   */
  public function getSansForPurchaseOrder(int $purchaseOrderId): array;

  /**
   * Submit GRN for approval.
   */
  public function submitGrnForApproval(int $grnId): GoodsReceivedNote;

  /**
   * Submit SAN for approval.
   */
  public function submitSanForApproval(int $sanId): ServiceAcknowledgmentNote;

  /**
   * Approve a GRN.
   */
  public function approveGrn(int $grnId, int $userId, ?string $comment = null): GoodsReceivedNote;

  /**
   * Approve a SAN.
   */
  public function approveSan(int $sanId, int $userId, ?string $comment = null): ServiceAcknowledgmentNote;

  /**
   * Reject a GRN.
   */
  public function rejectGrn(int $grnId, string $reason): GoodsReceivedNote;

  /**
   * Reject a SAN.
   */
  public function rejectSan(int $sanId, string $reason): ServiceAcknowledgmentNote;

  /**
   * Inspect goods and update quality status.
   */
  public function inspectGoods(int $grnId, array $data): GoodsReceivedNote;

  /**
   * Rate service quality for SAN.
   */
  public function qualityRateService(int $sanId, array $data): ServiceAcknowledgmentNote;

  /**
   * Get GRN summary.
   */
  public function getGrnSummary(int $grnId): array;

  /**
   * Get SAN summary.
   */
  public function getSanSummary(int $sanId): array;

  /**
   * Generate GRN PDF.
   */
  public function generateGrnPdf(int $grnId): string;

  /**
   * Generate SAN PDF.
   */
  public function generateSanPdf(int $sanId): string;

  /**
   * Get pending approval GRNs.
   */
  public function getPendingApprovalGrns(): array;

  /**
   * Get pending approval SANs.
   */
  public function getPendingApprovalSans(): array;

  /**
   * Update GRN item quantities.
   */
  public function updateGrnItems(int $grnId, array $items): GoodsReceivedNote;
}
