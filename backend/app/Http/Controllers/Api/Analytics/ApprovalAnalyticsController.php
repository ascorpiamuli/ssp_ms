<?php
// app/Http/Controllers/Api/Analytics/ApprovalAnalyticsController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Analytics\Services\ApprovalAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ApprovalAnalyticsController extends Controller
{
  public function __construct(
    protected ApprovalAnalyticsService $approvalService
  ) {}

  /**
   * Get approval summary
   */
  public function summary(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'level', 'status']);

    $data = $this->approvalService->getSummary($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get approval volume
   */
  public function volume(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'level']);

    $data = $this->approvalService->getApprovalVolume($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get approval status distribution
   */
  public function statusDistribution(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'level']);

    $data = $this->approvalService->getApprovalStatusDistribution($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get approval by level
   */
  public function byLevel(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'status']);

    $data = $this->approvalService->getApprovalByLevel($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get approval performance metrics
   */
  public function performance(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'level']);

    $data = $this->approvalService->getApprovalPerformance($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get pending approvals
   */
  public function pending(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'level']);

    $data = $this->approvalService->getPendingApprovals($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get approver workload
   */
  public function workload(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'level']);

    $data = $this->approvalService->getApproverWorkload($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get delegation analytics
   */
  public function delegation(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->approvalService->getDelegationAnalytics($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get escalation analytics
   */
  public function escalation(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->approvalService->getEscalationAnalytics($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get approval bottlenecks
   */
  public function bottlenecks(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->approvalService->getApprovalBottlenecks($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }
}
