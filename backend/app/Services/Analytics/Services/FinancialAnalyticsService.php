<?php
// app/services/analytics/services/FinancialAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\FinancialAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Repositories\FinancialAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class FinancialAnalyticsService extends BaseAnalyticsService implements FinancialAnalyticsServiceInterface
{
  public function __construct(
    protected FinancialAnalyticsRepositoryInterface $financialRepo
  ) {}

  public function getDashboardMetrics(array $filters = []): array
  {
    return [
      'summary' => $this->financialRepo->getDashboardSummary($filters),
      'budget_utilization' => $this->financialRepo->getBudgetUtilization($filters),
      'invoice_status' => $this->financialRepo->getInvoiceStatusDistribution($filters),
      'payment_methods' => $this->financialRepo->getPaymentMethodDistribution($filters),
    ];
  }

  public function getProcurementKpis(array $filters = []): array
  {
    return [
      'financial' => $this->financialRepo->getFinancialKpis($filters),
      'budget' => $this->financialRepo->getBudgetUtilization($filters),
      'invoices' => $this->financialRepo->getInvoiceVolumeStats($filters),
      'payment_cycle' => $this->financialRepo->getPaymentCycleTime($filters),
    ];
  }

  public function getTrend(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    return $this->financialRepo->getTrends($metric, $interval, $filters);
  }

  public function export(string $type, string $format = 'csv', array $filters = []): mixed
  {
    return [];
  }

  public function getSummary(array $filters = []): array
  {
    return $this->financialRepo->getDashboardSummary($filters);
  }

  public function getBudgetVsActual(array $filters = []): Collection
  {
    return $this->financialRepo->getBudgetUtilization($filters);
  }

  public function getSpendingAnalysis(array $filters = []): array
  {
    return [
      'by_category' => $this->financialRepo->getSpendingByCategory($filters),
      'by_department' => $this->financialRepo->getSpendingByDepartment($filters),
      'trend' => $this->financialRepo->getSpendingTrend('day', $filters),
    ];
  }

  public function getInvoiceMetrics(array $filters = []): array
  {
    return [
      'volume' => $this->financialRepo->getInvoiceVolumeStats($filters),
      'status' => $this->financialRepo->getInvoiceStatusDistribution($filters),
      'matching' => $this->financialRepo->getInvoiceMatchingStats($filters),
      'overdue' => $this->financialRepo->getOverdueInvoiceAnalysis($filters),
    ];
  }

  public function getPaymentCycleAnalysis(array $filters = []): array
  {
    return [
      'cycle_time' => $this->financialRepo->getPaymentCycleTime($filters),
      'method_distribution' => $this->financialRepo->getPaymentMethodDistribution($filters),
      'cheque_status' => $this->financialRepo->getChequeStatusDistribution($filters),
    ];
  }

  public function getCostSavings(array $filters = []): array
  {
    return $this->financialRepo->getCostSavings($filters);
  }

  public function getSpendingTrends(string $interval = 'day', array $filters = []): Collection
  {
    return $this->financialRepo->getSpendingTrend($interval, $filters);
  }

  public function getSupplierSpend(array $filters = []): Collection
  {
    return $this->financialRepo->getContractValueAnalysis($filters);
  }

  public function getBudgetUtilization(array $filters = []): Collection
  {
    return $this->financialRepo->getBudgetUtilization($filters);
  }

  public function getOverdueInvoices(array $filters = []): Collection
  {
    return $this->financialRepo->getOverdueInvoiceAnalysis($filters);
  }

  public function getForecast(int $months = 6, array $filters = []): Collection
  {
    return $this->financialRepo->getSpendForecast($months, $filters);
  }

  public function getPaymentMethodEfficiency(array $filters = []): array
  {
    $methods = $this->financialRepo->getPaymentMethodDistribution($filters);
    $cycleTime = $this->financialRepo->getPaymentCycleTime($filters);

    return [
      'methods' => $methods,
      'average_cycle' => $cycleTime['total_cycle'] ?? 0,
      'by_method' => $methods->map(function ($method) use ($cycleTime) {
        return [
          'method' => $method['method'],
          'label' => $method['label'],
          'count' => $method['count'],
          'total_value' => $method['total_value'],
        ];
      }),
    ];
  }

  public function getBudgetVariance(array $filters = []): Collection
  {
    return $this->financialRepo->getBudgetVariance($filters);
  }
}
