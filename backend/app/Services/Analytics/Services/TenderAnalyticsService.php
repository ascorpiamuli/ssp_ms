<?php
// app/services/analytics/services/TenderAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\TenderAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Repositories\TenderAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class TenderAnalyticsService extends BaseAnalyticsService
{
  public function __construct(
    protected TenderAnalyticsRepositoryInterface $tenderRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->tenderRepo->getDashboardSummary($filters),
      'status_distribution' => $this->tenderRepo->getStatusDistribution($filters),
      'value_distribution' => $this->tenderRepo->getValueDistribution($filters),
      'closing_soon' => $this->tenderRepo->getClosingSoon(7, $filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    return [
      'volume' => $this->tenderRepo->getVolumeStats($filters),
      'success_rate' => $this->tenderRepo->getSuccessRate($filters),
      'award_rate' => $this->tenderRepo->getAwardRate($filters),
      'avg_bidders' => $this->tenderRepo->getAverageBidders($filters),
      'avg_award_variance' => $this->tenderRepo->getAverageAwardVariance($filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->tenderRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->tenderRepo->getDashboardSummary($filters);
  }

  public function getTenderVolume(array $filters = []): array
  {
    return $this->tenderRepo->getVolumeStats($filters);
  }

  public function getTenderStatusDistribution(array $filters = []): Collection
  {
    return $this->tenderRepo->getStatusDistribution($filters);
  }

  public function getTenderValueDistribution(array $filters = []): Collection
  {
    return $this->tenderRepo->getValueDistribution($filters);
  }

  public function getAverageBidders(array $filters = []): float
  {
    return $this->tenderRepo->getAverageBidders($filters);
  }

  public function getTenderSuccessRate(array $filters = []): float
  {
    return $this->tenderRepo->getSuccessRate($filters);
  }

  public function getTenderAwardRate(array $filters = []): float
  {
    return $this->tenderRepo->getAwardRate($filters);
  }

  public function getAverageAwardVariance(array $filters = []): array
  {
    return $this->tenderRepo->getAverageAwardVariance($filters);
  }

  public function getTenderTrends(string $interval = 'day', array $filters = []): Collection
  {
    return $this->tenderRepo->getTrends('volume', $interval, $filters);
  }

  public function getTendersClosingSoon(int $days = 7, array $filters = []): Collection
  {
    return $this->tenderRepo->getClosingSoon($days, $filters);
  }

  public function getBidderParticipationRate(array $filters = []): float
  {
    return $this->tenderRepo->getBidderParticipationRate($filters);
  }

  public function getTenderByDepartment(array $filters = []): Collection
  {
    return $this->tenderRepo->getByDepartment($filters);
  }

  public function getTenderEvaluationTimeline(array $filters = []): array
  {
    return $this->tenderRepo->getEvaluationTimeline($filters);
  }
}
