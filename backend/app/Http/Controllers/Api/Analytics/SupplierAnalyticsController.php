<?php
// app/Http/Controllers/Api/Analytics/SupplierAnalyticsController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Analytics\Services\SupplierAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupplierAnalyticsController extends Controller
{
  public function __construct(
    protected SupplierAnalyticsService $supplierService
  ) {}

  /**
   * Get supplier summary
   */
  public function summary(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'category', 'status']);

    $data = $this->supplierService->getSummary($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get supplier performance for a specific supplier
   */
  public function performance(Request $request, int $supplierId): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->supplierService->getSupplierPerformance($supplierId, $filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Compare multiple suppliers
   */
  public function compare(Request $request): JsonResponse
  {
    $supplierIds = $request->input('supplier_ids', []);
    $filters = $request->only(['start_date', 'end_date']);

    if (empty($supplierIds)) {
      return response()->json([
        'success' => false,
        'message' => 'Supplier IDs are required'
      ], 422);
    }

    $data = $this->supplierService->getSupplierComparison($supplierIds, $filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get top suppliers by spend
   */
  public function topSuppliers(Request $request): JsonResponse
  {
    $limit = $request->input('limit', 10);
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->supplierService->getTopSuppliersBySpend($limit, $filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get supplier quotation response rates
   */
  public function quotationResponseRates(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'category']);

    $data = $this->supplierService->getQuotationResponseRates($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get supplier delivery performance
   */
  public function deliveryPerformance(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'supplier_id']);

    $data = $this->supplierService->getSupplierDeliveryPerformance($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get supplier quality ratings
   */
  public function qualityRatings(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'supplier_id']);

    $data = $this->supplierService->getSupplierQualityRatings($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get supplier risk assessment
   */
  public function riskAssessment(Request $request, int $supplierId): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->supplierService->getSupplierRiskAssessment($supplierId, $filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get supplier spend analysis
   */
  public function spendAnalysis(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'supplier_id']);

    $data = $this->supplierService->getSupplierSpendAnalysis($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get supplier category distribution
   */
  public function categoryDistribution(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->supplierService->getSupplierCategoryDistribution($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }
}
