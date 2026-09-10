<?php
// app/services/analytics/services/ContractAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\ContractAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Repositories\ContractAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class ContractAnalyticsService extends BaseAnalyticsService
{
  public function __construct(
    protected ContractAnalyticsRepositoryInterface $contractRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->contractRepo->getDashboardSummary($filters),
      'status_distribution' => $this->contractRepo->getStatusDistribution($filters),
      'value_distribution' => $this->contractRepo->getValueDistribution($filters),
      'expiring_soon' => $this->contractRepo->getExpiringSoon(30, $filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    return [
      'volume' => $this->contractRepo->getVolumeStats($filters),
      'average_value' => $this->contractRepo->getAverageValue($filters),
      'completion_rate' => $this->contractRepo->getCompletionRate($filters),
      'renewal_stats' => $this->contractRepo->getRenewalStats($filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->contractRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->contractRepo->getDashboardSummary($filters);
  }

  public function getContractVolume(array $filters = []): array
  {
    return $this->contractRepo->getVolumeStats($filters);
  }

  public function getContractStatusDistribution(array $filters = []): Collection
  {
    return $this->contractRepo->getStatusDistribution($filters);
  }

  public function getContractValueDistribution(array $filters = []): Collection
  {
    return $this->contractRepo->getValueDistribution($filters);
  }

  public function getContractRenewalAnalytics(array $filters = []): array
  {
    return $this->contractRepo->getRenewalStats($filters);
  }

  public function getExpiringContracts(int $days = 30, array $filters = []): Collection
  {
    return $this->contractRepo->getExpiringSoon($days, $filters);
  }

  public function getContractBySupplier(array $filters = []): Collection
  {
    return $this->contractRepo->getBySupplier($filters);
  }

  public function getAverageContractValue(array $filters = []): float
  {
    return $this->contractRepo->getAverageValue($filters);
  }

  public function getContractTrends(string $interval = 'day', array $filters = []): Collection
  {
    return $this->contractRepo->getTrends('volume', $interval, $filters);
  }

  public function getContractCompletionRate(array $filters = []): float
  {
    return $this->contractRepo->getCompletionRate($filters);
  }

  public function getContractValueByDepartment(array $filters = []): Collection
  {
    return $this->contractRepo->getValueByDepartment($filters);
  }

  public function getContractLifecycleAnalysis(array $filters = []): array
  {
    return $this->contractRepo->getLifecycleAnalysis($filters);
  }

  public function getContractComplianceRate(array $filters = []): float
  {
    return $this->contractRepo->getComplianceRate($filters);
  }
}
