<?php
// app/Services/Procurement/Contracts/Repositories/GoodsReceivedRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Repositories;

use App\Models\GoodsReceivedNote;
use App\Models\GoodsReceivedItem;
use App\Models\ServiceAcknowledgmentNote;
use Illuminate\Pagination\LengthAwarePaginator;

interface GoodsReceivedRepositoryInterface
{
  /**
   * Find a GRN by ID.
   */
  public function findGrn(int $id): ?GoodsReceivedNote;

  /**
   * Find a GRN by ID or fail.
   */
  public function findGrnOrFail(int $id): GoodsReceivedNote;

  /**
   * Find a SAN by ID.
   */
  public function findSan(int $id): ?ServiceAcknowledgmentNote;

  /**
   * Find a SAN by ID or fail.
   */
  public function findSanOrFail(int $id): ServiceAcknowledgmentNote;

  /**
   * Get all GRNs for a purchase order.
   */
  public function getGrnsForPurchaseOrder(int $purchaseOrderId): array;

  /**
   * Get all SANs for a purchase order.
   */
  public function getSansForPurchaseOrder(int $purchaseOrderId): array;

  /**
   * Create a GRN.
   */
  public function createGrn(array $data): GoodsReceivedNote;

  /**
   * Create a GRN item.
   */
  public function createGrnItem(array $data): GoodsReceivedItem;

  /**
   * Create a SAN.
   */
  public function createSan(array $data): ServiceAcknowledgmentNote;

  /**
   * Update a GRN.
   */
  public function updateGrn(int $id, array $data): GoodsReceivedNote;

  /**
   * Update a SAN.
   */
  public function updateSan(int $id, array $data): ServiceAcknowledgmentNote;

  /**
   * Get GRNs pending approval.
   */
  public function getPendingApprovalGrns(): array;

  /**
   * Get SANs pending approval.
   */
  public function getPendingApprovalSans(): array;

  /**
   * Get completed GRNs.
   */
  public function getCompletedGrns(): array;

  /**
   * Get completed SANs.
   */
  public function getCompletedSans(): array;

  /**
   * Paginate GRNs.
   */
  public function paginateGrns(int $perPage = 15): LengthAwarePaginator;

  /**
   * Paginate SANs.
   */
  public function paginateSans(int $perPage = 15): LengthAwarePaginator;

  /**
   * Get GRN by number.
   */
  public function getGrnByNumber(string $grnNumber): ?GoodsReceivedNote;

  /**
   * Get SAN by number.
   */
  public function getSanByNumber(string $sanNumber): ?ServiceAcknowledgmentNote;

  /**
   * Get GRN items by GRN ID.
   */
  public function getGrnItems(int $grnId): array;

  /**
   * Get GRNs by status.
   */
  public function getGrnsByStatus(string $status): array;

  /**
   * Get SANs by status.
   */
  public function getSansByStatus(string $status): array;

  /**
   * Update GRN item.
   */
  public function updateGrnItem(int $id, array $data): GoodsReceivedItem;

  /**
   * Delete a GRN item.
   */
  public function deleteGrnItem(int $id): bool;
}
