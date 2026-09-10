<?php
// app/Http/Controllers/Api/Analytics/FinancialAnalyticsController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Analytics\Services\FinancialAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FinancialAnalyticsController extends Controller
{
  public function __construct(
    protected FinancialAnalyticsService $financialService
  ) {}

  /**
   * Get financial summary
   */
  public function summary(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id']);

    $data = $this->financialService->getSummary($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get budget vs actual
   */
  public function budgetVsActual(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id']);

    $data = $this->financialService->getBudgetVsActual($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get spending analysis
   */
  public function spendingAnalysis(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id']);

    $data = $this->financialService->getSpendingAnalysis($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get invoice metrics
   */
  public function invoiceMetrics(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'supplier_id', 'status']);

    $data = $this->financialService->getInvoiceMetrics($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get payment cycle analysis
   */
  public function paymentCycle(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'supplier_id']);

    $data = $this->financialService->getPaymentCycleAnalysis($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get cost savings
   */
  public function costSavings(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id']);

    $data = $this->financialService->getCostSavings($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get spending trends
   */
  public function spendingTrends(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id']);
    $interval = $request->input('interval', 'day');

    $data = $this->financialService->getSpendingTrends($interval, $filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get overdue invoices
   */
  public function overdueInvoices(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'supplier_id']);

    $data = $this->financialService->getOverdueInvoices($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get spend forecast
   */
  public function forecast(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id']);
    $months = $request->input('months', 6);

    $data = $this->financialService->getForecast($months, $filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get budget utilization
   */
  public function budgetUtilization(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id']);

    $data = $this->financialService->getBudgetUtilization($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }
}
