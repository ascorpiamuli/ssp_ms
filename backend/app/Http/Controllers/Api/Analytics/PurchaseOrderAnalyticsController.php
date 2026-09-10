<?php
// app/Http/Controllers/Api/Analytics/PurchaseOrderAnalyticsController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Analytics\Services\PurchaseOrderAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PurchaseOrderAnalyticsController extends Controller
{
  public function __construct(
    protected PurchaseOrderAnalyticsService $poService
  ) {}

  /**
   * Get purchase order summary
   */
  public function summary(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id', 'supplier_id', 'type']);

    $data = $this->poService->getSummary($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get purchase order volume
   */
  public function volume(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'type']);

    $data = $this->poService->getPurchaseOrderVolume($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get purchase order status distribution
   */
  public function statusDistribution(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'type']);

    $data = $this->poService->getPurchaseOrderStatusDistribution($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get purchase orders by type (LPO/LSO)
   */
  public function byType(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'status']);

    $data = $this->poService->getPurchaseOrderByType($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get delivery performance
   */
  public function deliveryPerformance(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'supplier_id']);

    $data = $this->poService->getDeliveryPerformance($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get purchase order cycle time
   */
  public function cycleTime(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'type']);

    $data = $this->poService->getPurchaseOrderCycleTime($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get overdue purchase orders
   */
  public function overdue(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'supplier_id']);

    $data = $this->poService->getOverduePurchaseOrders($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get purchase orders by supplier
   */
  public function bySupplier(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'supplier_id']);

    $data = $this->poService->getPurchaseOrderBySupplier($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get purchase order trends
   */
  public function trends(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'type']);
    $interval = $request->input('interval', 'day');

    $data = $this->poService->getPurchaseOrderTrends($interval, $filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get signature workflow analytics
   */
  public function signatureWorkflow(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'type']);

    $data = $this->poService->getSignatureWorkflowAnalytics($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }
}
