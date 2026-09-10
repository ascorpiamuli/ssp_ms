<?php
// app/services/analytics/contracts/repositories/SystemAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * System Analytics Repository Interface
 * Handles all system-level analytics queries
 */
interface SystemAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get system health status
   */
  public function getSystemHealth(array $filters = []): array;

  /**
   * Get system component status
   */
  public function getComponentStatus(array $filters = []): Collection;

  /**
   * Get system uptime statistics
   */
  public function getUptimeStats(array $filters = []): array;

  /**
   * Get backup statistics
   */
  public function getBackupStats(array $filters = []): array;

  /**
   * Get system performance metrics
   */
  public function getPerformanceMetrics(array $filters = []): array;

  /**
   * Get database growth trends
   */
  public function getDatabaseGrowth(string $interval = 'day', array $filters = []): Collection;

  /**
   * Get storage usage statistics
   */
  public function getStorageUsage(array $filters = []): array;

  /**
   * Get system errors by component
   */
  public function getErrorsByComponent(array $filters = []): Collection;

  /**
   * Get system usage metrics
   */
  public function getUsageMetrics(array $filters = []): array;

  /**
   * Get system performance trend
   */
  public function getPerformanceTrend(string $interval = 'day', array $filters = []): Collection;

  /**
   * Get scheduled task status
   */
  public function getScheduledTaskStatus(array $filters = []): Collection;

  /**
   * Get system security metrics
   */
  public function getSecurityMetrics(array $filters = []): array;
}
