<?php
// app/Http/Controllers/Api/Analytics/DashboardController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Analytics\Services\CombinedAnalyticsService;
use App\Services\Analytics\Services\RequisitionAnalyticsService;
use App\Services\Analytics\Services\FinancialAnalyticsService;
use App\Services\Analytics\Services\SupplierAnalyticsService;
use App\Services\Analytics\Services\OperationAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
  public function __construct(
    protected CombinedAnalyticsService $combinedService,
    protected RequisitionAnalyticsService $requisitionService,
    protected FinancialAnalyticsService $financialService,
    protected SupplierAnalyticsService $supplierService,
    protected OperationAnalyticsService $operationService
  ) {}

  /**
   * Get executive dashboard metrics
   */
  public function executive(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id']);

    $data = $this->combinedService->getExecutiveDashboard($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get procurement dashboard metrics
   */
  public function procurement(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id', 'status']);

    $data = $this->combinedService->getProcurementDashboard($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get financial dashboard metrics
   */
  public function financial(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id', 'supplier_id']);

    $data = $this->combinedService->getFinancialDashboard($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get operational dashboard metrics
   */
  public function operational(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->combinedService->getOperationalDashboard($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get supplier dashboard metrics
   */
  public function supplier(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'supplier_id', 'category']);

    $data = $this->combinedService->getSupplierDashboard($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get department dashboard metrics
   */
  public function department(Request $request, int $departmentId): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->combinedService->getDepartmentDashboard($departmentId, $filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get KPI report
   */
  public function kpis(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'department_id']);

    $data = $this->combinedService->getKpiReport($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }
}
