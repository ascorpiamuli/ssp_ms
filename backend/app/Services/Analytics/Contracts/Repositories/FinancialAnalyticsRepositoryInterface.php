<?php
// app/services/analytics/contracts/repositories/FinancialAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Financial Analytics Repository Interface
 * Handles all financial-related analytics queries
 */
interface FinancialAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get budget utilization statistics
   */
  public function getBudgetUtilization(array $filters = []): Collection;

  /**
   * Get department budget performance
   */
  public function getDepartmentBudgetPerformance(array $filters = []): Collection;

  /**
   * Get spending by category
   */
  public function getSpendingByCategory(array $filters = []): Collection;

  /**
   * Get spending by department
   */
  public function getSpendingByDepartment(array $filters = []): Collection;

  /**
   * Get spending trend over time
   */
  public function getSpendingTrend(string $interval = 'day', array $filters = []): Collection;

  /**
   * Get invoice volume statistics
   */
  public function getInvoiceVolumeStats(array $filters = []): array;

  /**
   * Get invoice status distribution
   */
  public function getInvoiceStatusDistribution(array $filters = []): Collection;

  /**
   * Get invoice matching stats (3-way match)
   */
  public function getInvoiceMatchingStats(array $filters = []): array;

  /**
   * Get overdue invoice analysis
   */
  public function getOverdueInvoiceAnalysis(array $filters = []): Collection;

  /**
   * Get payment cycle time
   */
  public function getPaymentCycleTime(array $filters = []): array;

  /**
   * Get payment method distribution
   */
  public function getPaymentMethodDistribution(array $filters = []): Collection;

  /**
   * Get cheque status distribution
   */
  public function getChequeStatusDistribution(array $filters = []): Collection;

  /**
   * Get cost savings analysis
   */
  public function getCostSavings(array $filters = []): array;

  /**
   * Get contract value analysis
   */
  public function getContractValueAnalysis(array $filters = []): Collection;

  /**
   * Get financial KPIs
   */
  public function getFinancialKpis(array $filters = []): array;

  /**
   * Get budget vs actual variance
   */
  public function getBudgetVariance(array $filters = []): Collection;

  /**
   * Get spend forecast
   */
  public function getSpendForecast(int $months = 6, array $filters = []): Collection;
}
