<?php
// app/services/analytics/contracts/services/OperationAnalyticsServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Operations Analytics Service Interface
 * Handles operational analytics (workflow, efficiency, user activity, system health)
 */
interface OperationAnalyticsServiceInterface extends AnalyticsServiceInterface
{
  /**
   * Get operational efficiency metrics
   */
  public function getEfficiencyMetrics(array $filters = []): array;

  /**
   * Get user activity analytics
   */
  public function getUserActivity(array $filters = []): array;

  /**
   * Get system health status
   */
  public function getSystemHealth(array $filters = []): array;

  /**
   * Get workflow bottlenecks
   */
  public function getWorkflowBottlenecks(array $filters = []): Collection;

  /**
   * Get audit trail summary
   */
  public function getAuditSummary(array $filters = []): array;

  /**
   * Get notification effectiveness
   */
  public function getNotificationEffectiveness(array $filters = []): array;

  /**
   * Get digital signature adoption
   */
  public function getSignatureAdoption(array $filters = []): array;

  /**
   * Get system usage patterns
   */
  public function getUsagePatterns(array $filters = []): array;

  /**
   * Get user performance metrics
   */
  public function getUserPerformance(array $filters = []): Collection;

  /**
   * Get peak usage times
   */
  public function getPeakUsageTimes(array $filters = []): array;

  /**
   * Get error and exception analytics
   */
  public function getErrorAnalytics(array $filters = []): array;

  /**
   * Get backup and recovery status
   */
  public function getBackupStatus(array $filters = []): array;
}
