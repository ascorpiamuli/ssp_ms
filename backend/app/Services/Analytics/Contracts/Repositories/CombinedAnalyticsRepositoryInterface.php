<?php
// app/services/analytics/contracts/repositories/CombinedAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Combined Analytics Repository Interface
 * Aggregates data from multiple repositories for comprehensive dashboards
 */
interface CombinedAnalyticsRepositoryInterface
{
  /**
   * Get executive dashboard metrics
   */
  public function getExecutiveDashboard(array $filters = []): array;

  /**
   * Get procurement dashboard metrics
   */
  public function getProcurementDashboard(array $filters = []): array;

  /**
   * Get financial dashboard metrics
   */
  public function getFinancialDashboard(array $filters = []): array;

  /**
   * Get operational dashboard metrics
   */
  public function getOperationalDashboard(array $filters = []): array;

  /**
   * Get supplier performance dashboard
   */
  public function getSupplierDashboard(array $filters = []): array;

  /**
   * Get department performance dashboard
   */
  public function getDepartmentDashboard(int $departmentId, array $filters = []): array;

  /**
   * Get comprehensive KPI report
   */
  public function getKpiReport(array $filters = []): array;

  /**
   * Get trend analysis across multiple metrics
   */
  public function getMultiMetricTrends(array $metrics, string $interval = 'day', array $filters = []): Collection;

  /**
   * Get comparative analysis
   */
  public function getComparativeAnalysis(string $dimension, array $metrics, array $filters = []): Collection;
}
