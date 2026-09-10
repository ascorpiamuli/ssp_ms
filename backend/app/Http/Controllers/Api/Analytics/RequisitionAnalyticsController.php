<?php
// app/Http/Controllers/Api/Analytics/RequisitionAnalyticsController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Analytics\Services\RequisitionAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RequisitionAnalyticsController extends Controller
{
  public function __construct(
    protected RequisitionAnalyticsService $requisitionService
  ) {}

  /**
   * Get requisition summary
   */
  public function summary(Request $request): JsonResponse
  {
    $filters = $this->sanitizeFilters($request->only(['start_date', 'end_date', 'department_id', 'status']));

    $data = $this->requisitionService->getSummary($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get requisition volume statistics
   */
  public function volume(Request $request): JsonResponse
  {
    $filters = $this->sanitizeFilters($request->only(['start_date', 'end_date', 'department_id']));

    $data = $this->requisitionService->getRequisitionVolume($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get requisition status distribution
   */
  public function statusDistribution(Request $request): JsonResponse
  {
    $filters = $this->sanitizeFilters($request->only(['start_date', 'end_date', 'department_id']));

    $data = $this->requisitionService->getRequisitionStatusDistribution($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get requisitions by department
   */
  public function byDepartment(Request $request): JsonResponse
  {
    $filters = $this->sanitizeFilters($request->only(['start_date', 'end_date']));

    $data = $this->requisitionService->getRequisitionByDepartment($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get requisition trends
   */
  public function trends(Request $request): JsonResponse
  {
    $filters = $this->sanitizeFilters($request->only(['start_date', 'end_date', 'department_id']));
    $interval = $request->input('interval', 'day');

    // ✅ Validate interval
    $allowedIntervals = ['hour', 'day', 'week', 'month', 'quarter', 'year'];
    if (!in_array($interval, $allowedIntervals)) {
      $interval = 'day';
    }

    $data = $this->requisitionService->getRequisitionTrends($interval, $filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get approval funnel analysis
   */
  public function approvalFunnel(Request $request): JsonResponse
  {
    $filters = $this->sanitizeFilters($request->only(['start_date', 'end_date', 'department_id']));

    $data = $this->requisitionService->getConversionFunnel($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get approval cycle analysis
   */
  public function approvalCycle(Request $request): JsonResponse
  {
    $filters = $this->sanitizeFilters($request->only(['start_date', 'end_date', 'department_id']));

    $data = $this->requisitionService->getApprovalCycleAnalysis($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get SLA compliance
   */
  public function slaCompliance(Request $request): JsonResponse
  {
    $filters = $this->sanitizeFilters($request->only(['start_date', 'end_date', 'department_id']));

    $data = $this->requisitionService->getSlaCompliance($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * ✅ FIXED: Get top departments with proper type casting
   */
  public function topDepartments(Request $request): JsonResponse
  {
    // ✅ FIX: Cast limit to integer with proper validation
    $limit = $request->input('limit', 10);

    // ✅ Ensure limit is an integer
    if (is_numeric($limit)) {
      $limit = (int) $limit;
    } else {
      $limit = 10;
    }

    // ✅ Validate limit range
    if ($limit < 1) {
      $limit = 10;
    }

    if ($limit > 100) {
      $limit = 100;
    }

    $filters = $this->sanitizeFilters($request->only(['start_date', 'end_date']));

    $data = $this->requisitionService->getTopDepartments($limit, $filters);

    return response()->json([
      'success' => true,
      'data' => $data,
      'meta' => [
        'limit' => $limit
      ]
    ]);
  }

  /**
   * Get department scorecard
   */
  public function departmentScorecard(Request $request, int $departmentId): JsonResponse
  {
    $filters = $this->sanitizeFilters($request->only(['start_date', 'end_date']));

    $data = $this->requisitionService->getDepartmentScorecard($departmentId, $filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * ✅ NEW: Sanitize filters helper
   * Removes null values and empty strings from filters
   */
  protected function sanitizeFilters(array $filters): array
  {
    return array_filter($filters, function ($value) {
      return !is_null($value) && $value !== '';
    });
  }

  /**
   * ✅ NEW: Validate and cast date range
   */
  protected function validateDateRange(Request $request): array
  {
    $filters = $request->only(['start_date', 'end_date']);

    if (isset($filters['start_date']) && isset($filters['end_date'])) {
      try {
        $start = \Carbon\Carbon::parse($filters['start_date']);
        $end = \Carbon\Carbon::parse($filters['end_date']);

        // Ensure start is before end
        if ($start->gt($end)) {
          $filters['start_date'] = $end->toDateString();
          $filters['end_date'] = $start->toDateString();
        }
      } catch (\Exception $e) {
        // Invalid dates, remove them
        unset($filters['start_date']);
        unset($filters['end_date']);
      }
    }

    return $this->sanitizeFilters($filters);
  }

  /**
   * ✅ NEW: Get pagination params safely
   */
  protected function getPaginationParams(Request $request): array
  {
    $page = (int) $request->input('page', 1);
    $perPage = (int) $request->input('per_page', 20);

    if ($page < 1) {
      $page = 1;
    }

    if ($perPage < 1) {
      $perPage = 20;
    }

    if ($perPage > 100) {
      $perPage = 100;
    }

    return [
      'page' => $page,
      'per_page' => $perPage,
      'offset' => ($page - 1) * $perPage
    ];
  }

  /**
   * ✅ NEW: Get limit param safely
   */
  protected function getLimitParam(Request $request, int $default = 10, int $max = 100): int
  {
    $limit = $request->input('limit', $default);

    if (is_numeric($limit)) {
      $limit = (int) $limit;
    } else {
      $limit = $default;
    }

    if ($limit < 1) {
      $limit = $default;
    }

    if ($limit > $max) {
      $limit = $max;
    }

    return $limit;
  }
}
