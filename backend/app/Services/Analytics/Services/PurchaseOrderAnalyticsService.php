<?php
// app/services/analytics/services/PurchaseOrderAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\PurchaseOrderAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Repositories\PurchaseOrderAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class PurchaseOrderAnalyticsService extends BaseAnalyticsService
{
  public function __construct(
    protected PurchaseOrderAnalyticsRepositoryInterface $poRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->poRepo->getDashboardSummary($filters),
      'status_distribution' => $this->poRepo->getStatusDistribution($filters),
      'by_type' => $this->poRepo->getByType($filters),
      'delivery_performance' => $this->poRepo->getDeliveryPerformance($filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    return [
      'volume' => $this->poRepo->getVolumeStats($filters),
      'delivery' => $this->poRepo->getDeliveryPerformance($filters),
      'completion_rate' => $this->poRepo->getCompletionRate($filters),
      'overdue' => $this->poRepo->getOverdueStats($filters),
      'cycle_time' => $this->poRepo->getCycleTime($filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->poRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->poRepo->getDashboardSummary($filters);
  }

  public function getPurchaseOrderVolume(array $filters = []): array
  {
    return $this->poRepo->getVolumeStats($filters);
  }

  public function getPurchaseOrderStatusDistribution(array $filters = []): Collection
  {
    return $this->poRepo->getStatusDistribution($filters);
  }

  public function getPurchaseOrderByType(array $filters = []): Collection
  {
    return $this->poRepo->getByType($filters);
  }

  public function getPurchaseOrderValueDistribution(array $filters = []): Collection
  {
    return $this->poRepo->getValueDistribution($filters);
  }

  public function getDeliveryPerformance(array $filters = []): array
  {
    return $this->poRepo->getDeliveryPerformance($filters);
  }

  public function getPurchaseOrderCycleTime(array $filters = []): array
  {
    return $this->poRepo->getCycleTime($filters);
  }

  public function getOverduePurchaseOrders(array $filters = []): array
  {
    return $this->poRepo->getOverdueStats($filters);
  }

  public function getPurchaseOrderBySupplier(array $filters = []): Collection
  {
    return $this->poRepo->getBySupplier($filters);
  }

  public function getPurchaseOrderCompletionRate(array $filters = []): float
  {
    return $this->poRepo->getCompletionRate($filters);
  }

  public function getPurchaseOrderTrends(string $interval = 'day', array $filters = []): Collection
  {
    return $this->poRepo->getTrends('volume', $interval, $filters);
  }

  public function getPurchaseOrderByDepartment(array $filters = []): Collection
  {
    return $this->poRepo->getByDepartment($filters);
  }

  public function getSignatureWorkflowAnalytics(array $filters = []): array
  {
    return $this->poRepo->getSignatureWorkflowStats($filters);
  }

  public function getStageTransitionTimes(array $filters = []): Collection
  {
    return $this->poRepo->getStageTransitionTimes($filters);
  }

  public function getTopSuppliers(int $limit = 10, array $filters = []): Collection
  {
    return $this->poRepo->getTopSuppliers($limit, $filters);
  }
}
