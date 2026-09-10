<?php
// app/services/analytics/Contracts/Repositories/OperationAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;

interface OperationAnalyticsRepositoryInterface
{
  public function getDashboardSummary(array $filters = []): array;
  public function getTrends(string $metric, string $interval = 'day', array $filters = []): Collection;
  public function getSystemHealth(array $filters = []): array;
  public function getUserActivity(array $filters = []): array;
  public function getWorkflowBottlenecks(array $filters = []): Collection;
  public function getAuditSummary(array $filters = []): array;
  public function getNotificationEffectiveness(array $filters = []): array;
  public function getSignatureAdoption(array $filters = []): array;
  public function getUsagePatterns(array $filters = []): array;
  public function getUserPerformance(array $filters = []): Collection;
  public function getErrorAnalytics(array $filters = []): array;
  public function getBackupStatus(array $filters = []): array;
}
