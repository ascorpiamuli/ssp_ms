<?php
// app/services/analytics/services/OperationAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\OperationAnalyticsServiceInterface;
use App\Services\Analytics\Repositories\OperationAnalyticsRepository;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class OperationAnalyticsService extends BaseAnalyticsService
{
  public function __construct(
    protected OperationAnalyticsRepository $operationRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->operationRepo->getDashboardSummary($filters),
      'system_health' => $this->operationRepo->getSystemHealth($filters),
     // 'user_activity' => $this->operationRepo->getUserActivity($filters),
      'notification_stats' => $this->operationRepo->getNotificationEffectiveness($filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    return [
      'system_health' => $this->operationRepo->getSystemHealth($filters),
    //  'user_activity' => $this->operationRepo->getUserActivity($filters),
      'notifications' => $this->operationRepo->getNotificationEffectiveness($filters),
      'signature_adoption' => $this->operationRepo->getSignatureAdoption($filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->operationRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->operationRepo->getDashboardSummary($filters);
  }

  public function getEfficiencyMetrics(array $filters = []): array
  {
    return [
      'workflow_bottlenecks' => $this->operationRepo->getWorkflowBottlenecks($filters),
      'peak_usage' => $this->operationRepo->getPeakUsageTimes($filters),
      'user_performance' => $this->operationRepo->getUserPerformance($filters),
    ];
  }

  public function getUserActivity(array $filters = []): array
  {
    return $this->operationRepo->getVolumeStats($filters);
  }

  public function getSystemHealth(array $filters = []): array
  {
    return $this->operationRepo->getSystemHealth($filters);
  }

  public function getWorkflowBottlenecks(array $filters = []): Collection
  {
    return $this->operationRepo->getWorkflowBottlenecks($filters);
  }

  public function getAuditSummary(array $filters = []): array
  {
    return $this->operationRepo->getAuditSummary($filters);
  }

  public function getNotificationEffectiveness(array $filters = []): array
  {
    return $this->operationRepo->getNotificationEffectiveness($filters);
  }

  public function getSignatureAdoption(array $filters = []): array
  {
    return $this->operationRepo->getSignatureAdoption($filters);
  }

  public function getUsagePatterns(array $filters = []): array
  {
    return $this->operationRepo->getUsagePatterns($filters);
  }

  public function getUserPerformance(array $filters = []): Collection
  {
    return $this->operationRepo->getUserPerformance($filters);
  }

  public function getPeakUsageTimes(array $filters = []): array
  {
    return $this->operationRepo->getPeakUsageTimes($filters);
  }

  public function getErrorAnalytics(array $filters = []): array
  {
    return $this->operationRepo->getErrorAnalytics($filters);
  }

  public function getBackupStatus(array $filters = []): array
  {
    return $this->operationRepo->getBackupStatus($filters);
  }

  public function getSystemComponentStatus(array $filters = []): Collection
  {
    $health = $this->operationRepo->getSystemHealth($filters);
    return collect($health['components'] ?? []);
  }

  public function getUserSessionAnalytics(array $filters = []): array
  {
    $patterns = $this->operationRepo->getUsagePatterns($filters);
    return [
      'peak_hours' => $patterns['peak_hours'] ?? [],
      'peak_days' => $patterns['peak_days'] ?? [],
      'avg_actions_per_user' => $patterns['avg_actions_per_user'] ?? 0,
    ];
  }
}
