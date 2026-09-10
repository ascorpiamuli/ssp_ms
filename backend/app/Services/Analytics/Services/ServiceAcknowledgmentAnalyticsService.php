<?php
// app/services/analytics/services/ServiceAcknowledgmentAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\ServiceAcknowledgmentAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Repositories\ServiceAcknowledgmentAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class ServiceAcknowledgmentAnalyticsService extends BaseAnalyticsService
{
  public function __construct(
    protected ServiceAcknowledgmentAnalyticsRepositoryInterface $sanRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->sanRepo->getDashboardSummary($filters),
      'status_distribution' => $this->sanRepo->getStatusDistribution($filters),
      'quality_ratings' => $this->sanRepo->getQualityRatingDistribution($filters),
      'top_providers' => $this->sanRepo->getTopProviders(10, $filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    return [
      'volume' => $this->sanRepo->getVolumeStats($filters),
      'avg_quality_rating' => $this->sanRepo->getAverageQualityRatingByDepartment($filters)->avg('avg_rating') ?? 0,
      'approval_completion_rate' => $this->sanRepo->getApprovalCompletionRate($filters),
      'top_providers' => $this->sanRepo->getTopProviders(10, $filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->sanRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->sanRepo->getDashboardSummary($filters);
  }

  public function getSANVolume(array $filters = []): array
  {
    return $this->sanRepo->getVolumeStats($filters);
  }

  public function getSANStatusDistribution(array $filters = []): Collection
  {
    return $this->sanRepo->getStatusDistribution($filters);
  }

  public function getQualityRatingDistribution(array $filters = []): Collection
  {
    return $this->sanRepo->getQualityRatingDistribution($filters);
  }

  public function getAverageQualityRatingByDepartment(array $filters = []): Collection
  {
    return $this->sanRepo->getAverageQualityRatingByDepartment($filters);
  }

  public function getServicePerformanceByProvider(array $filters = []): Collection
  {
    return $this->sanRepo->getServicePerformanceByProvider($filters);
  }

  public function getSANTrends(string $interval = 'day', array $filters = []): Collection
  {
    return $this->sanRepo->getTrends('volume', $interval, $filters);
  }

  public function getApprovalCompletionRate(array $filters = []): float
  {
    return $this->sanRepo->getApprovalCompletionRate($filters);
  }

  public function getQualityRatingByCategory(array $filters = []): Collection
  {
    return $this->sanRepo->getQualityRatingByCategory($filters);
  }

  public function getAcknowledgmentTimeline(array $filters = []): array
  {
    return $this->sanRepo->getAcknowledgmentTimeline($filters);
  }

  public function getTopProviders(int $limit = 10, array $filters = []): Collection
  {
    return $this->sanRepo->getTopProviders($limit, $filters);
  }
}
