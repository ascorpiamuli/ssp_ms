<?php
// app/services/analytics/services/QuotationAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\QuotationAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Repositories\QuotationAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class QuotationAnalyticsService extends BaseAnalyticsService
{
  public function __construct(
    protected QuotationAnalyticsRepositoryInterface $quotationRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->quotationRepo->getDashboardSummary($filters),
      'status_distribution' => $this->quotationRepo->getStatusDistribution($filters),
      'response_rate' => $this->quotationRepo->getResponseRate($filters),
      'by_department' => $this->quotationRepo->getByDepartment($filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    return [
      'volume' => $this->quotationRepo->getVolumeStats($filters),
      'response_rate' => $this->quotationRepo->getResponseRate($filters),
      'acceptance_rate' => $this->quotationRepo->getAcceptanceRate($filters),
      'avg_quotations_per_rfq' => $this->quotationRepo->getAverageQuotationsPerRfq($filters),
      'verification_turnaround' => $this->quotationRepo->getVerificationTurnaroundTime($filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->quotationRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->quotationRepo->getDashboardSummary($filters);
  }

  public function getRFQVolume(array $filters = []): array
  {
    return $this->quotationRepo->getVolumeStats($filters);
  }

  public function getRFQStatusDistribution(array $filters = []): Collection
  {
    return $this->quotationRepo->getStatusDistribution($filters);
  }

  public function getRFQResponseRate(array $filters = []): float
  {
    return $this->quotationRepo->getResponseRate($filters);
  }

  public function getRFQByDepartment(array $filters = []): Collection
  {
    return $this->quotationRepo->getByDepartment($filters);
  }

  public function getQuotationVerificationAnalytics(array $filters = []): array
  {
    return $this->quotationRepo->getVerificationStats($filters);
  }

  public function getAverageQuotationsPerRFQ(array $filters = []): float
  {
    return $this->quotationRepo->getAverageQuotationsPerRfq($filters);
  }

  public function getQuotationEvaluationAnalytics(array $filters = []): array
  {
    return $this->quotationRepo->getEvaluationStats($filters);
  }

  public function getQuotationTrends(string $interval = 'day', array $filters = []): Collection
  {
    return $this->quotationRepo->getTrends('volume', $interval, $filters);
  }

  public function getQuotationAcceptanceRate(array $filters = []): float
  {
    return $this->quotationRepo->getAcceptanceRate($filters);
  }

  public function getVerificationTurnaroundTime(array $filters = []): array
  {
    return $this->quotationRepo->getVerificationTurnaroundTime($filters);
  }

  public function getRFQClosingSoon(array $filters = []): Collection
  {
    return $this->quotationRepo->getClosingSoonAnalysis($filters);
  }

  public function getTenderAnalytics(array $filters = []): array
  {
    return $this->quotationRepo->getTenderStats($filters);
  }

  public function getTenderSuccessRate(array $filters = []): float
  {
    return $this->quotationRepo->getTenderSuccessRate($filters);
  }
}
