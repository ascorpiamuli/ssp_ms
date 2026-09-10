<?php
// app/services/analytics/contracts/services/FinancialAnalyticsServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Financial Analytics Service Interface
 * Handles all financial analytics (budgets, spending, invoices, payments)
 */
interface FinancialAnalyticsServiceInterface extends AnalyticsServiceInterface
{
  /**
   * Get budget vs actual spending
   */
  public function getBudgetVsActual(array $filters = []): Collection;

  /**
   * Get spending by category/department
   */
  public function getSpendingAnalysis(array $filters = []): array;

  /**
   * Get invoice performance metrics
   */
  public function getInvoiceMetrics(array $filters = []): array;

  /**
   * Get payment cycle analysis
   */
  public function getPaymentCycleAnalysis(array $filters = []): array;

  /**
   * Get cost savings analysis
   */
  public function getCostSavings(array $filters = []): array;

  /**
   * Get spending trends
   */
  public function getSpendingTrends(string $interval = 'day', array $filters = []): Collection;

  /**
   * Get supplier spend analysis
   */
  public function getSupplierSpend(array $filters = []): Collection;

  /**
   * Get budget utilization by department
   */
  public function getBudgetUtilization(array $filters = []): Collection;

  /**
   * Get overdue invoice analysis
   */
  public function getOverdueInvoices(array $filters = []): Collection;

  /**
   * Get financial forecast
   */
  public function getForecast(int $months = 6, array $filters = []): Collection;

  /**
   * Get payment method efficiency
   */
  public function getPaymentMethodEfficiency(array $filters = []): array;
}
