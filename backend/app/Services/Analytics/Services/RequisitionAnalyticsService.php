<?php
// app/services/analytics/services/RequisitionAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\RequisitionAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Repositories\RequisitionAnalyticsRepositoryInterface;
use App\Services\Analytics\Contracts\Repositories\RequisitionItemAnalyticsRepositoryInterface;
use App\Services\Analytics\Contracts\Repositories\ApprovalAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class RequisitionAnalyticsService extends BaseAnalyticsService implements RequisitionAnalyticsServiceInterface
{
  public function __construct(
    protected RequisitionAnalyticsRepositoryInterface $requisitionRepo,
    protected RequisitionItemAnalyticsRepositoryInterface $itemRepo,
    protected ApprovalAnalyticsRepositoryInterface $approvalRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->requisitionRepo->getDashboardSummary($filters),
      'status_distribution' => $this->requisitionRepo->getStatusDistribution($filters),
      'by_department' => $this->requisitionRepo->getByDepartment($filters),
      'recent_trend' => $this->requisitionRepo->getTrends('volume', 'week', $filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    $volume = $this->requisitionRepo->getVolumeStats($filters);
    $cycleTime = $this->requisitionRepo->getApprovalCycleTime($filters);
    $returnRate = $this->requisitionRepo->getReturnRate($filters);
    $slaCompliance = $this->requisitionRepo->getSlaComplianceRate($filters);

    return [
      'volume' => $volume,
      'cycle_time' => $cycleTime,
      'return_rate' => $returnRate,
      'sla_compliance' => $slaCompliance,
      'emergency_rate' => $this->requisitionRepo->getEmergencyRate($filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->requisitionRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    // Implementation will be handled by the export service
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->requisitionRepo->getDashboardSummary($filters);
  }

  public function getRequisitionVolume(array $filters = []): array
  {
    return $this->requisitionRepo->getVolumeStats($filters);
  }

  public function getRequisitionStatusDistribution(array $filters = []): Collection
  {
    return $this->requisitionRepo->getStatusDistribution($filters);
  }

  public function getRequisitionByDepartment(array $filters = []): Collection
  {
    return $this->requisitionRepo->getByDepartment($filters);
  }

  public function getRequisitionByPriority(array $filters = []): Collection
  {
    return $this->requisitionRepo->getByPriority($filters);
  }

  public function getRequisitionByType(array $filters = []): Collection
  {
    return $this->requisitionRepo->getByType($filters);
  }

  public function getApprovalCycleAnalysis(array $filters = []): array
  {
    return [
      'cycle_time' => $this->requisitionRepo->getApprovalCycleTime($filters),
      'bottlenecks' => $this->approvalRepo->getBottleneckAnalysis($filters),
      'average_by_level' => $this->approvalRepo->getAverageTimeByLevel($filters),
      'approval_rate_by_level' => $this->approvalRepo->getApprovalRateByLevel($filters),
    ];
  }

  public function getRequisitionReturnAnalysis(array $filters = []): array
  {
    return [
      'return_rate' => $this->requisitionRepo->getReturnRate($filters),
      'return_by_department' => $this->requisitionRepo->getReturnRate($filters),
      'revision_stats' => $this->requisitionRepo->getRevisionStats($filters),
    ];
  }

  public function getConversionFunnel(array $filters = []): Collection
  {
    return $this->requisitionRepo->getConversionFunnel($filters);
  }

  public function getRequisitionTrends(string $interval = 'day', array $filters = []): Collection
  {
    return $this->requisitionRepo->getTrends('volume', $interval, $filters);
  }

  public function getSlaCompliance(array $filters = []): array
  {
    return [
      'compliance_rate' => $this->requisitionRepo->getSlaComplianceRate($filters),
      'by_department' => $this->requisitionRepo->getByDepartment($filters),
      'trend' => $this->requisitionRepo->getTrends('sla', 'week', $filters),
    ];
  }

  public function getValueDistribution(array $filters = []): Collection
  {
    return $this->requisitionRepo->getValueDistribution($filters);
  }

  public function getTopDepartments(int $limit = 10, array $filters = []): Collection
  {
    return $this->requisitionRepo->getTopDepartments($limit, $filters);
  }

  public function getEmergencyRequisitionMetrics(array $filters = []): array
  {
    return [
      'emergency_rate' => $this->requisitionRepo->getEmergencyRate($filters),
      'by_department' => $this->requisitionRepo->getByDepartment($filters),
      'trend' => $this->requisitionRepo->getTrends('emergency', 'week', $filters),
    ];
  }

  public function getRequisitionItemAnalytics(array $filters = []): array
  {
    return [
      'top_items' => $this->itemRepo->getTopItems(10, $filters),
      'quality_inspection' => $this->itemRepo->getQualityInspectionStats($filters),
      'procurement_completion' => $this->itemRepo->getProcurementCompletionRate($filters),
      'below_reorder' => $this->itemRepo->getBelowReorderLevel($filters),
    ];
  }

  public function getDepartmentScorecard(int $departmentId, array $filters = []): array
  {
    $filters['department_id'] = $departmentId;

    return [
      'volume' => $this->requisitionRepo->getVolumeStats($filters),
      'approval_cycle' => $this->requisitionRepo->getApprovalCycleTime($filters),
      'return_rate' => $this->requisitionRepo->getReturnRate($filters),
      'emergency_rate' => $this->requisitionRepo->getEmergencyRate($filters),
      'sla_compliance' => $this->requisitionRepo->getSlaComplianceRate($filters),
      'top_items' => $this->itemRepo->getTopItems(5, $filters),
    ];
  }
}
