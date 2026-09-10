<?php
// app/services/analytics/contracts/services/AnalyticsServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Core Analytics Service Interface
 * Defines the primary analytics operations
 */
interface AnalyticsServiceInterface
{
  /**
   * Get comprehensive dashboard metrics
   */
  public function getDashboardMetrics(array $filters = []): array;

  /**
   * Get procurement KPIs
   */
  public function getProcurementKpis(array $filters = []): array;

  /**
   * Get trend data for a specific metric
   */
  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection;

  /**
   * Export analytics data
   */
  public function export(string $type, string $format = 'csv', array $filters = []): mixed;

  /**
   * Get summary statistics
   */
  public function getSummary(array $filters = []): array;
}
