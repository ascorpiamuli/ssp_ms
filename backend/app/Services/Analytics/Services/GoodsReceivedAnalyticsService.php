<?php
// app/services/analytics/services/GoodsReceivedAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\GoodsReceivedAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Repositories\GoodsReceivedAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class GoodsReceivedAnalyticsService extends BaseAnalyticsService 
{
  public function __construct(
    protected GoodsReceivedAnalyticsRepositoryInterface $grnRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->grnRepo->getDashboardSummary($filters),
      'status_distribution' => $this->grnRepo->getStatusDistribution($filters),
      'inspection_results' => $this->grnRepo->getInspectionResultDistribution($filters),
      'quarantine_stats' => $this->grnRepo->getQuarantineStats($filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    return [
      'volume' => $this->grnRepo->getVolumeStats($filters),
      'inspection_pass_rate' => $this->grnRepo->getInspectionPassRate($filters),
      'acceptance_rate_by_department' => $this->grnRepo->getAcceptanceRateByDepartment($filters),
      'avg_inspection_time' => $this->grnRepo->getAverageInspectionTime($filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->grnRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->grnRepo->getDashboardSummary($filters);
  }

  public function getGRNVolume(array $filters = []): array
  {
    return $this->grnRepo->getVolumeStats($filters);
  }

  public function getGRNStatusDistribution(array $filters = []): Collection
  {
    return $this->grnRepo->getStatusDistribution($filters);
  }

  public function getInspectionPassRate(array $filters = []): float
  {
    return $this->grnRepo->getInspectionPassRate($filters);
  }

  public function getAcceptanceRateByDepartment(array $filters = []): Collection
  {
    return $this->grnRepo->getAcceptanceRateByDepartment($filters);
  }

  public function getQuarantineAnalytics(array $filters = []): array
  {
    return $this->grnRepo->getQuarantineStats($filters);
  }

  public function getConditionDistribution(array $filters = []): Collection
  {
    return $this->grnRepo->getConditionDistribution($filters);
  }

  public function getGRNTrends(string $interval = 'day', array $filters = []): Collection
  {
    return $this->grnRepo->getTrends('volume', $interval, $filters);
  }

  public function getInspectionResultDistribution(array $filters = []): Collection
  {
    return $this->grnRepo->getInspectionResultDistribution($filters);
  }

  public function getAverageInspectionTime(array $filters = []): array
  {
    return $this->grnRepo->getAverageInspectionTime($filters);
  }

  public function getRejectionReasonAnalysis(array $filters = []): Collection
  {
    return $this->grnRepo->getRejectionReasonAnalysis($filters);
  }

  public function getAcceptanceRateBySupplier(array $filters = []): Collection
  {
    return $this->grnRepo->getAcceptanceRateBySupplier($filters);
  }
}
