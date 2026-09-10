<?php
// app/services/analytics/Contracts/Services/SupplierAnalyticsServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;

interface SupplierAnalyticsServiceInterface extends AnalyticsServiceInterface
{
  public function getSupplierVolume(array $filters = []): array;
  public function getSupplierCategoryDistribution(array $filters = []): Collection;
  public function getSupplierStatusDistribution(array $filters = []): Collection;
  public function getSupplierPerformance(int $supplierId, array $filters = []): array;
  public function getSupplierComparison(array $supplierIds, array $filters = []): array;
  public function getQuotationResponseRates(array $filters = []): Collection;
  public function getSupplierDeliveryPerformance(array $filters = []): Collection;
  public function getTopSuppliersBySpend(int $limit = 10, array $filters = []): Collection;
  public function getSupplierQualityRatings(array $filters = []): Collection;
  public function getSupplierRiskAssessment(int $supplierId, array $filters = []): array;
  public function getSupplierPriceCompetitiveness(array $filters = []): Collection;
  public function getSupplierTrends(int $supplierId, string $interval = 'day', array $filters = []): Collection;
  public function getSupplierSpendAnalysis(array $filters = []): Collection;
  public function getSupplierQuotationAcceptance(array $filters = []): Collection;
}
