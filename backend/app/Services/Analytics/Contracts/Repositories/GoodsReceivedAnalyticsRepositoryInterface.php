<?php
// app/services/analytics/contracts/repositories/GoodsReceivedAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Goods Received Analytics Repository Interface
 * Handles GRN-specific analytics queries
 */
interface GoodsReceivedAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get GRN volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get GRN by status distribution
   */
  public function getStatusDistribution(array $filters = []): Collection;

  /**
   * Get GRN inspection pass rate
   */
  public function getInspectionPassRate(array $filters = []): float;

  /**
   * Get GRN acceptance rate by department
   */
  public function getAcceptanceRateByDepartment(array $filters = []): Collection;

  /**
   * Get GRN quarantine statistics
   */
  public function getQuarantineStats(array $filters = []): array;

  /**
   * Get item condition distribution
   */
  public function getConditionDistribution(array $filters = []): Collection;

  /**
   * Get inspection result distribution
   */
  public function getInspectionResultDistribution(array $filters = []): Collection;

  /**
   * Get average inspection time
   */
  public function getAverageInspectionTime(array $filters = []): array;

  /**
   * Get rejection reason analysis
   */
  public function getRejectionReasonAnalysis(array $filters = []): Collection;

  /**
   * Get item acceptance rate by supplier
   */
  public function getAcceptanceRateBySupplier(array $filters = []): Collection;
}
