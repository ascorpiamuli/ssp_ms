<?php
// app/Services/Procurement/Contracts/Repositories/TenderRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Repositories;

use App\Models\Tender;
use Illuminate\Pagination\LengthAwarePaginator;

interface TenderRepositoryInterface
{
  /**
   * Find a tender by ID.
   */
  public function findTender(int $id): ?Tender;

  /**
   * Find a tender by ID or fail.
   */
  public function findTenderOrFail(int $id): Tender;

  /**
   * Get a tender for a requisition.
   */
  public function getTenderForRequisition(int $requisitionId): ?Tender;

  /**
   * Get a tender by number.
   */
  public function getTenderByNumber(string $tenderNumber): ?Tender;

  /**
   * Create a tender.
   */
  public function createTender(array $data): Tender;

  /**
   * Update a tender.
   */
  public function updateTender(int $id, array $data): Tender;

  /**
   * Get draft tenders.
   */
  public function getDraftTenders(): array;

  /**
   * Get published tenders.
   */
  public function getPublishedTenders(): array;

  /**
   * Get evaluating tenders.
   */
  public function getEvaluatingTenders(): array;

  /**
   * Get awarded tenders.
   */
  public function getAwardedTenders(): array;

  /**
   * Get cancelled tenders.
   */
  public function getCancelledTenders(): array;

  /**
   * Get open tenders.
   */
  public function getOpenTenders(): array;

  /**
   * Get tenders closing soon.
   */
  public function getTendersClosingSoon(int $days = 7): array;

  /**
   * Get expired tenders.
   */
  public function getExpiredTenders(): array;

  /**
   * Paginate tenders.
   */
  public function paginateTenders(int $perPage = 15): LengthAwarePaginator;

  /**
   * Get tender statistics.
   */
  public function getTenderStatistics(): array;

  /**
   * Get tenders by bidder.
   */
  public function getTendersByBidder(int $supplierId): array;

  /**
   * Add a bidder to a tender.
   */
  public function addBidderToTender(int $tenderId, int $supplierId): Tender;

  /**
   * Remove a bidder from a tender.
   */
  public function removeBidderFromTender(int $tenderId, int $supplierId): Tender;

  /**
   * Get bidders for a tender.
   */
  public function getBiddersForTender(int $tenderId): array;

  /**
   * Delete a tender.
   */
  public function deleteTender(int $id): bool;

    /**
   * Get tenders by status.
   */
  public function getTendersByStatus(string $status): array;
}
