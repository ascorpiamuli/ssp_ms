<?php
// app/services/analytics/services/ApprovalAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\ApprovalAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Repositories\ApprovalAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class ApprovalAnalyticsService extends BaseAnalyticsService
{
  public function __construct(
    protected ApprovalAnalyticsRepositoryInterface $approvalRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->approvalRepo->getDashboardSummary($filters),
      'status_distribution' => $this->approvalRepo->getStatusDistribution($filters),
      'by_level' => $this->approvalRepo->getByLevel($filters),
      'pending_workload' => $this->approvalRepo->getWorkloadByApprover($filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    return [
      'volume' => $this->approvalRepo->getVolumeStats($filters),
      'avg_time_by_level' => $this->approvalRepo->getAverageTimeByLevel($filters),
      'approval_rate' => $this->approvalRepo->getApprovalRateByLevel($filters),
      'sla_compliance' => $this->approvalRepo->getSlaComplianceRate($filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->approvalRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->approvalRepo->getDashboardSummary($filters);
  }

  public function getApprovalVolume(array $filters = []): array
  {
    return $this->approvalRepo->getVolumeStats($filters);
  }

  public function getApprovalStatusDistribution(array $filters = []): Collection
  {
    return $this->approvalRepo->getStatusDistribution($filters);
  }

  public function getApprovalByLevel(array $filters = []): Collection
  {
    return $this->approvalRepo->getByLevel($filters);
  }

  public function getApprovalPerformance(array $filters = []): array
  {
    return [
      'avg_time_by_level' => $this->approvalRepo->getAverageTimeByLevel($filters),
      'approval_rate_by_level' => $this->approvalRepo->getApprovalRateByLevel($filters),
      'bottlenecks' => $this->approvalRepo->getBottleneckAnalysis($filters),
      'cycle_time_breakdown' => $this->approvalRepo->getCycleTimeBreakdown($filters),
    ];
  }

  public function getPendingApprovals(array $filters = []): Collection
  {
    return $this->approvalRepo->getPendingByApprover($filters);
  }

  public function getApproverWorkload(array $filters = []): Collection
  {
    return $this->approvalRepo->getWorkloadByApprover($filters);
  }

  public function getDelegationAnalytics(array $filters = []): array
  {
    return $this->approvalRepo->getDelegationStats($filters);
  }

  public function getEscalationAnalytics(array $filters = []): array
  {
    return $this->approvalRepo->getEscalationStats($filters);
  }

  public function getApprovalTrends(string $interval = 'day', array $filters = []): Collection
  {
    return $this->approvalRepo->getTrends('volume', $interval, $filters);
  }

  public function getReturnRateByApprover(array $filters = []): Collection
  {
    return $this->approvalRepo->getReturnRateByApprover($filters);
  }

  public function getSlaCompliance(array $filters = []): array
  {
    return [
      'compliance_rate' => $this->approvalRepo->getSlaComplianceRate($filters),
      'by_level' => $this->approvalRepo->getAverageTimeByLevel($filters),
      'bottlenecks' => $this->approvalRepo->getBottleneckAnalysis($filters),
    ];
  }

  public function getApprovalBottlenecks(array $filters = []): Collection
  {
    return $this->approvalRepo->getBottleneckAnalysis($filters);
  }
}
