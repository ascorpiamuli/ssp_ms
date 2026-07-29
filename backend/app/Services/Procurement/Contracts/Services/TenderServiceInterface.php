<?php
// app/Services/Procurement/Contracts/Services/TenderServiceInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Services;

use App\Models\Tender;
use App\Services\Procurement\DTOs\TenderDTO;

interface TenderServiceInterface
{
  /**
   * Create a tender.
   */
  public function createTender(TenderDTO $dto): Tender;

  /**
   * Get a tender by ID.
   */
  public function getTender(int $tenderId): Tender;

  /**
   * Get a tender for a requisition.
   */
  public function getTenderForRequisition(int $requisitionId): ?Tender;

  /**
   * Publish a tender.
   */
  public function publishTender(int $tenderId, int $userId): Tender;

  /**
   * Add a bidder to a tender.
   */
  public function addBidder(int $tenderId, int $supplierId): Tender;

  /**
   * Remove a bidder from a tender.
   */
  public function removeBidder(int $tenderId, int $supplierId): Tender;

  /**
   * Start evaluation of a tender.
   */
  public function startEvaluation(int $tenderId): Tender;

  /**
   * Award a tender.
   */
  public function awardTender(int $tenderId, int $supplierId, float $amount, ?string $notes = null): Tender;

  /**
   * Cancel a tender.
   */
  public function cancelTender(int $tenderId, string $reason, int $userId): Tender;

  /**
   * Get tender statistics.
   */
  public function getTenderStatistics(int $tenderId): array;

  /**
   * Get bidders for a tender.
   */
  public function getBidders(int $tenderId): array;

  /**
   * Get all open tenders.
   */
  public function getOpenTenders(): array;

  /**
   * Get tenders closing soon.
   */
  public function getClosingSoonTenders(int $days = 7): array;

  /**
   * Generate tender PDF.
   */
  public function generateTenderPdf(int $tenderId): string;

  /**
   * Get all published tenders.
   */
  public function getPublishedTenders(): array;

  /**
   * Get tenders by status.
   */
  public function getTendersByStatus(string $status): array;

  /**
   * Check if tender is open for bidding.
   */
  public function isTenderOpen(int $tenderId): bool;

  /**
   * Check if supplier is a bidder.
   */
  public function isSupplierBidder(int $tenderId, int $supplierId): bool;
}
