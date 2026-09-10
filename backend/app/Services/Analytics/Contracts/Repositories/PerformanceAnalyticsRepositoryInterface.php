<?php
// app/services/analytics/contracts/repositories/PerformanceAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Performance Analytics Repository Interface
 * Handles all performance-related analytics queries
 */
interface PerformanceAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get overall system performance metrics
   */
  public function getSystemPerformance(array $filters = []): array;

  /**
   * Get department performance scorecard
   */
  public function getDepartmentScorecard(array $filters = []): Collection;

  /**
   * Get procurement cycle efficiency
   */
  public function getProcurementCycleEfficiency(array $filters = []): array;

  /**
   * Get SLA compliance metrics
   */
  public function getSlaComplianceMetrics(array $filters = []): array;

  /**
   * Get quality metrics (GRN/SAN inspection results)
   */
  public function getQualityMetrics(array $filters = []): array;

  /**
   * Get GRN inspection pass rate
   */
  public function getInspectionPassRate(array $filters = []): float;

  /**
   * Get service quality ratings
   */
  public function getServiceQualityRatings(array $filters = []): Collection;

  /**
   * Get top performing departments
   */
  public function getTopPerformingDepartments(int $limit = 10, array $filters = []): Collection;

  /**
   * Get performance bottlenecks
   */
  public function getBottlenecks(array $filters = []): Collection;

  /**
   * Get user performance metrics
   */
  public function getUserPerformance(array $filters = []): Collection;

  /**
   * Get efficiency ratio (output/input)
   */
  public function getEfficiencyRatio(array $filters = []): float;

  /**
   * Get process improvement opportunities
   */
  public function getImprovementOpportunities(array $filters = []): Collection;
}
