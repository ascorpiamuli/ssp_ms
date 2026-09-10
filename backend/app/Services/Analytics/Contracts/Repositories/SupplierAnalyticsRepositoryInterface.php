<?php
// app/services/analytics/contracts/repositories/SupplierAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Supplier Analytics Repository Interface
 * Handles all supplier-related analytics queries
 */
interface SupplierAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get supplier volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get supplier by category distribution
   */
  public function getByCategory(array $filters = []): Collection;

  /**
   * Get supplier by status distribution
   */
  public function getByStatus(array $filters = []): Collection;

  /**
   * Get supplier quotation response rate
   */
  public function getQuotationResponseRate(array $filters = []): Collection;

  /**
   * Get supplier performance score
   */
  public function getPerformanceScore(int $supplierId, array $filters = []): array;

  /**
   * Get top suppliers by spend
   */
  public function getTopBySpend(int $limit = 10, array $filters = []): Collection;

  /**
   * Get supplier delivery performance
   */
  public function getDeliveryPerformance(array $filters = []): Collection;

  /**
   * Get supplier quality rating
   */
  public function getQualityRatings(array $filters = []): Collection;

  /**
   * Get supplier quotation acceptance rate
   */
  public function getQuotationAcceptanceRate(array $filters = []): Collection;

  /**
   * Get supplier price competitiveness
   */
  public function getPriceCompetitiveness(array $filters = []): Collection;

  /**
   * Get supplier comparison analysis
   */
  public function getSupplierComparison(array $supplierIds, array $filters = []): array;

  /**
   * Get supplier risk analysis
   */
  public function getRiskAnalysis(int $supplierId, array $filters = []): array;

  /**
   * Get supplier spend analysis
   */
  public function getSpendAnalysis(array $filters = []): Collection;
}
