<?php
// app/services/analytics/services/BaseAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Base Analytics Service
 * Provides common functionality for all analytics services
 */
abstract class BaseAnalyticsService
{
  /**
   * Format date range for filters
   */
  protected function formatDateRange(?Carbon $startDate = null, ?Carbon $endDate = null): array
  {
    return [
      'start_date' => $startDate?->startOfDay()->toDateTimeString(),
      'end_date' => $endDate?->endOfDay()->toDateTimeString(),
    ];
  }

  /**
   * Calculate percentage change
   */
  protected function calculateChange(float $current, float $previous): float
  {
    if ($previous === 0) {
      return $current > 0 ? 100 : 0;
    }
    return round((($current - $previous) / $previous) * 100, 2);
  }

  /**
   * Format currency amount
   */
  protected function formatCurrency(float $amount): string
  {
    return number_format($amount, 2);
  }

  /**
   * Get date range from filters
   */
  protected function getDateRangeFromFilters(array $filters): array
  {
    $start = isset($filters['start_date'])
      ? Carbon::parse($filters['start_date'])
      : Carbon::now()->subYear();

    $end = isset($filters['end_date'])
      ? Carbon::parse($filters['end_date'])
      : Carbon::now();

    return [$start, $end];
  }

  /**
   * Merge filters with default date range
   */
  protected function mergeDateFilters(array $filters, ?Carbon $start = null, ?Carbon $end = null): array
  {
    if (!isset($filters['start_date']) && $start) {
      $filters['start_date'] = $start->startOfDay()->toDateTimeString();
    }

    if (!isset($filters['end_date']) && $end) {
      $filters['end_date'] = $end->endOfDay()->toDateTimeString();
    }

    return $filters;
  }
}
