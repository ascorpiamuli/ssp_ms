<?php
// app/services/analytics/contracts/repositories/AuditAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Audit Analytics Repository Interface
 * Handles all audit and history-related analytics queries
 */
interface AuditAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get user activity statistics
   */
  public function getUserActivityStats(array $filters = []): array;

  /**
   * Get entity activity breakdown
   */
  public function getEntityActivityBreakdown(array $filters = []): Collection;

  /**
   * Get action type distribution
   */
  public function getActionTypeDistribution(array $filters = []): Collection;

  /**
   * Get status change frequency
   */
  public function getStatusChangeFrequency(array $filters = []): Collection;

  /**
   * Get user activity trend
   */
  public function getActivityTrend(string $interval = 'day', array $filters = []): Collection;

  /**
   * Get top active users
   */
  public function getTopActiveUsers(int $limit = 10, array $filters = []): Collection;

  /**
   * Get system usage patterns
   */
  public function getSystemUsagePatterns(array $filters = []): array;

  /**
   * Get entity count over time
   */
  public function getEntityCountOverTime(string $entityType, string $interval = 'day', array $filters = []): Collection;

  /**
   * Get peak usage times
   */
  public function getPeakUsageTimes(array $filters = []): array;

  /**
   * Get user session statistics
   */
  public function getSessionStats(array $filters = []): array;

  /**
   * Get revision history analytics
   */
  public function getRevisionAnalytics(array $filters = []): array;

  /**
   * Get entity update frequency
   */
  public function getEntityUpdateFrequency(array $filters = []): Collection;
}
