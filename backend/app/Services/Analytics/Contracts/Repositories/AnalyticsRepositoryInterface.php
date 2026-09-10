<?php
// app/services/analytics/contracts/repositories/AnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Base Analytics Repository Interface
 * Defines core analytics data access methods
 */
interface AnalyticsRepositoryInterface
{
  /**
   * Get date range for analytics queries
   */
  public function getDateRange(?Carbon $startDate = null, ?Carbon $endDate = null): array;

  /**
   * Apply common filters to queries
   */
  public function applyFilters($query, array $filters = []): void;

  /**
   * Get analytics summary for dashboard
   */
  public function getDashboardSummary(array $filters = []): array;

  /**
   * Get trend data over time
   */
  public function getTrends(string $metric, string $interval = 'day', array $filters = []): Collection;
}
