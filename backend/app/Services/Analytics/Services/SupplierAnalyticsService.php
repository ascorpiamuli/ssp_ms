<?php
// app/services/analytics/services/SupplierAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\SupplierAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Repositories\SupplierAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class SupplierAnalyticsService extends BaseAnalyticsService
{
  public function __construct(
    protected SupplierAnalyticsRepositoryInterface $supplierRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->supplierRepo->getDashboardSummary($filters),
      'category_distribution' => $this->supplierRepo->getByCategory($filters),
      'status_distribution' => $this->supplierRepo->getByStatus($filters),
      'top_suppliers' => $this->supplierRepo->getTopBySpend(10, $filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    return [
      'volume' => $this->supplierRepo->getVolumeStats($filters),
      'delivery_performance' => $this->supplierRepo->getDeliveryPerformance($filters),
      'quality_ratings' => $this->supplierRepo->getQualityRatings($filters),
      'quotation_response' => $this->supplierRepo->getQuotationResponseRate($filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->supplierRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->supplierRepo->getDashboardSummary($filters);
  }

  public function getSupplierVolume(array $filters = []): array
  {
    return $this->supplierRepo->getVolumeStats($filters);
  }

  public function getSupplierCategoryDistribution(array $filters = []): Collection
  {
    return $this->supplierRepo->getByCategory($filters);
  }

  public function getSupplierStatusDistribution(array $filters = []): Collection
  {
    return $this->supplierRepo->getByStatus($filters);
  }

  public function getSupplierPerformance(int $supplierId, array $filters = []): array
  {
    return $this->supplierRepo->getPerformanceScore($supplierId, $filters);
  }

  public function getSupplierComparison(array $supplierIds, array $filters = []): array
  {
    return $this->supplierRepo->getSupplierComparison($supplierIds, $filters);
  }

  public function getQuotationResponseRates(array $filters = []): Collection
  {
    return $this->supplierRepo->getQuotationResponseRate($filters);
  }

  public function getSupplierDeliveryPerformance(array $filters = []): Collection
  {
    return $this->supplierRepo->getDeliveryPerformance($filters);
  }

  public function getTopSuppliersBySpend(int $limit = 10, array $filters = []): Collection
  {
    return $this->supplierRepo->getTopBySpend($limit, $filters);
  }

  public function getSupplierQualityRatings(array $filters = []): Collection
  {
    return $this->supplierRepo->getQualityRatings($filters);
  }

  public function getSupplierRiskAssessment(int $supplierId, array $filters = []): array
  {
    return $this->supplierRepo->getRiskAnalysis($supplierId, $filters);
  }

  public function getSupplierPriceCompetitiveness(array $filters = []): Collection
  {
    return $this->supplierRepo->getPriceCompetitiveness($filters);
  }

  public function getSupplierTrends(int $supplierId, string $interval = 'day', array $filters = []): Collection
  {
    $filters['supplier_id'] = $supplierId;
    return $this->supplierRepo->getTrends('registration', $interval, $filters);
  }

  public function getSupplierSpendAnalysis(array $filters = []): Collection
  {
    return $this->supplierRepo->getSpendAnalysis($filters);
  }

  public function getSupplierQuotationAcceptance(array $filters = []): Collection
  {
    return $this->supplierRepo->getQuotationAcceptanceRate($filters);
  }
}
