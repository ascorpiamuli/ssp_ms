<?php
// app/services/analytics/Contracts/Services/CombinedAnalyticsServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;

interface CombinedAnalyticsServiceInterface
{
  public function getExecutiveDashboard(array $filters = []): array;
  public function getProcurementDashboard(array $filters = []): array;
  public function getFinancialDashboard(array $filters = []): array;
  public function getOperationalDashboard(array $filters = []): array;
  public function getSupplierDashboard(array $filters = []): array;
  public function getDepartmentDashboard(int $departmentId, array $filters = []): array;
  public function getKpiReport(array $filters = []): array;
  public function getMultiMetricTrends(array $metrics, string $interval = 'day', array $filters = []): Collection;
  public function getComparativeAnalysis(string $dimension, array $metrics, array $filters = []): Collection;
}
