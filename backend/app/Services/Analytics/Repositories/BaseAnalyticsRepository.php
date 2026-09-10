<?php
// app/services/analytics/repositories/BaseAnalyticsRepository.php

declare(strict_types=1);

namespace App\Services\Analytics\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * Base Analytics Repository
 * Provides common functionality for all analytics repositories
 */
abstract class BaseAnalyticsRepository
{
  /**
   * Get date range for queries
   */
  protected function getDateRange(?Carbon $startDate = null, ?Carbon $endDate = null): array
  {
    return [
      'start' => $startDate ?? Carbon::now()->subYear(),
      'end' => $endDate ?? Carbon::now(),
    ];
  }

  /**
   * Apply common filters to query
   */
  protected function applyFilters($query, array $filters = []): void
  {
    if (isset($filters['department_id'])) {
      $query->where('department_id', $filters['department_id']);
    }

    if (isset($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (isset($filters['type'])) {
      $query->where('type', $filters['type']);
    }

    if (isset($filters['priority'])) {
      $query->where('priority', $filters['priority']);
    }

    if (isset($filters['start_date']) && isset($filters['end_date'])) {
      $query->whereBetween('created_at', [
        Carbon::parse($filters['start_date'])->startOfDay(),
        Carbon::parse($filters['end_date'])->endOfDay()
      ]);
    }

    if (isset($filters['user_id'])) {
      $query->where('user_id', $filters['user_id']);
    }

    if (isset($filters['supplier_id'])) {
      $query->where('supplier_id', $filters['supplier_id']);
    }

    // ✅ FIX: Add support for category filters
    if (isset($filters['category'])) {
      $query->where('category', $filters['category']);
    }

    // ✅ FIX: Add support for limit filters
    if (isset($filters['limit'])) {
      $query->limit((int) $filters['limit']);
    }
  }

  /**
   * Group query results by interval
   */
  protected function groupByInterval($query, string $column = 'created_at', string $interval = 'day'): void
  {
    switch ($interval) {
      case 'hour':
        $query->selectRaw("DATE_FORMAT({$column}, '%Y-%m-%d %H:00:00') as period")
          ->groupBy('period');
        break;
      case 'day':
        $query->selectRaw("DATE({$column}) as period")
          ->groupBy('period');
        break;
      case 'week':
        $query->selectRaw("DATE_FORMAT({$column}, '%Y-W%v') as period")
          ->groupBy('period');
        break;
      case 'month':
        $query->selectRaw("DATE_FORMAT({$column}, '%Y-%m') as period")
          ->groupBy('period');
        break;
      case 'quarter':
        $query->selectRaw("CONCAT(YEAR({$column}), '-Q', QUARTER({$column})) as period")
          ->groupBy('period');
        break;
      case 'year':
        $query->selectRaw("YEAR({$column}) as period")
          ->groupBy('period');
        break;
      default:
        $query->selectRaw("DATE({$column}) as period")
          ->groupBy('period');
    }
  }

  /**
   * ✅ FIX: Calculate percentage safely - prevents division by zero
   *
   * @param float|int $part
   * @param float|int $total
   * @param int $decimals
   * @return float
   */
  protected function calculatePercentage(float $part, float $total, int $decimals = 2): float
  {
    // ✅ Guard against division by zero
    if ($total == 0) {
      return 0.0;
    }

    return round(($part / $total) * 100, $decimals);
  }

  /**
   * ✅ FIX: Calculate percentage or return null if total is zero
   * Use this when you need to differentiate between 0% and no data
   *
   * @param float|int $part
   * @param float|int $total
   * @param int $decimals
   * @return float|null
   */
  protected function calculatePercentageOrNull(float $part, float $total, int $decimals = 2): ?float
  {
    if ($total == 0) {
      return null;
    }

    return round(($part / $total) * 100, $decimals);
  }

  /**
   * Get average value safely
   */
  protected function safeAverage($value): float
  {
    return $value ? round((float) $value, 2) : 0;
  }

  /**
   * Get average value safely with null handling
   */
  protected function safeAverageOrNull($value): ?float
  {
    return $value ? round((float) $value, 2) : null;
  }

  /**
   * Format currency
   */
  protected function formatCurrency(float $amount): string
  {
    return number_format($amount, 2);
  }

  /**
   * ✅ FIX: Safe division for calculating rates
   *
   * @param float|int $numerator
   * @param float|int $denominator
   * @param int $decimals
   * @return float
   */
  protected function safeDivision(float $numerator, float $denominator, int $decimals = 2): float
  {
    if ($denominator == 0) {
      return 0.0;
    }

    return round($numerator / $denominator, $decimals);
  }

  /**
   * ✅ FIX: Safe division or null
   */
  protected function safeDivisionOrNull(float $numerator, float $denominator, int $decimals = 2): ?float
  {
    if ($denominator == 0) {
      return null;
    }

    return round($numerator / $denominator, $decimals);
  }

  /**
   * ✅ FIX: Get the count of a relationship safely
   *
   * @param mixed $model
   * @param string $relation
   * @return int
   */
  protected function safeRelationCount($model, string $relation): int
  {
    if (!$model || !method_exists($model, $relation)) {
      return 0;
    }

    try {
      return $model->$relation()->count();
    } catch (\Exception $e) {
      return 0;
    }
  }

  /**
   * ✅ FIX: Get the sum of a relationship field safely
   */
  protected function safeRelationSum($model, string $relation, string $field): float
  {
    if (!$model || !method_exists($model, $relation)) {
      return 0.0;
    }

    try {
      return (float) $model->$relation()->sum($field);
    } catch (\Exception $e) {
      return 0.0;
    }
  }

  /**
   * ✅ FIX: Format percentage for display
   */
  protected function formatPercentage(float $value, int $decimals = 2): string
  {
    return number_format($value, $decimals) . '%';
  }

  /**
   * ✅ FIX: Calculate growth rate between two values
   */
  protected function calculateGrowthRate(float $current, float $previous, int $decimals = 2): float
  {
    if ($previous == 0) {
      return $current > 0 ? 100.0 : 0.0;
    }

    return round((($current - $previous) / $previous) * 100, $decimals);
  }

  /**
   * ✅ FIX: Safe date parsing with fallback
   */
  protected function safeParseDate(?string $date, ?Carbon $fallback = null): ?Carbon
  {
    if (empty($date)) {
      return $fallback ?? Carbon::now();
    }

    try {
      return Carbon::parse($date);
    } catch (\Exception $e) {
      return $fallback ?? Carbon::now();
    }
  }

  /**
   * ✅ FIX: Get count safely from collection or array
   */
  protected function safeCount($items): int
  {
    if ($items instanceof Collection) {
      return $items->count();
    }

    if (is_array($items)) {
      return count($items);
    }

    if ($items instanceof \Countable) {
      return count($items);
    }

    return 0;
  }

  /**
   * ✅ FIX: Get sum safely from collection or array
   */
  protected function safeSum($items, ?string $field = null): float
  {
    if ($items instanceof Collection) {
      return $field ? (float) $items->sum($field) : (float) $items->sum();
    }

    if (is_array($items)) {
      return $field ? (float) array_sum(array_column($items, $field)) : (float) array_sum($items);
    }

    return 0.0;
  }

  /**
   * ✅ FIX: Check if a column exists in a table
   */
  protected function columnExists(string $table, string $column): bool
  {
    try {
      return Schema::hasColumn($table, $column);
    } catch (\Exception $e) {
      return false;
    }
  }

  /**
   * ✅ FIX: Safe query execution with fallback
   */
  protected function safeQuery(callable $query, $default = null)
  {
    try {
      return $query();
    } catch (\Exception $e) {
      // Log the error for debugging
      Log::warning('Safe query failed: ' . $e->getMessage(), [
        'trace' => $e->getTraceAsString()
      ]);
      return $default;
    }
  }

  /**
   * ✅ FIX: Get column safely if it exists
   */
  protected function getColumnIfExists($query, string $column, $default = null)
  {
    try {
      return $query->pluck($column);
    } catch (\Exception $e) {
      return $default ?? collect([]);
    }
  }

  /**
   * ✅ FIX: Safe average calculation with column existence check
   */
  protected function safeAvg($query, string $column, int $decimals = 2): float
  {
    try {
      $result = $query->avg($column);
      return $this->safeAverage($result);
    } catch (\Exception $e) {
      Log::warning("Column '{$column}' not found in query", [
        'error' => $e->getMessage()
      ]);
      return 0.0;
    }
  }

  /**
   * ✅ FIX: Safe sum calculation with column existence check
   */
  protected function safeSumValue($query, string $column): float
  {
    try {
      $result = $query->sum($column);
      return (float) ($result ?? 0);
    } catch (\Exception $e) {
      Log::warning("Column '{$column}' not found in query", [
        'error' => $e->getMessage()
      ]);
      return 0.0;
    }
  }
}
