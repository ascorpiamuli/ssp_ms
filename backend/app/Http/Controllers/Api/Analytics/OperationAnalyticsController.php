<?php
// app/Http/Controllers/Api/Analytics/OperationAnalyticsController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Analytics\Services\OperationAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OperationAnalyticsController extends Controller
{
  public function __construct(
    protected OperationAnalyticsService $operationService
  ) {}

  /**
   * Get operation summary
   */
  public function summary(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->operationService->getSummary($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get system health
   */
  public function systemHealth(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->operationService->getSystemHealth($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get user activity
   */
  public function userActivity(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'user_id']);

    $data = $this->operationService->getUserActivity($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get workflow bottlenecks
   */
  public function bottlenecks(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->operationService->getWorkflowBottlenecks($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get audit summary
   */
  public function auditSummary(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date', 'user_id']);

    $data = $this->operationService->getAuditSummary($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get notification effectiveness
   */
  public function notificationEffectiveness(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->operationService->getNotificationEffectiveness($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get signature adoption
   */
  public function signatureAdoption(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->operationService->getSignatureAdoption($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get usage patterns
   */
  public function usagePatterns(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->operationService->getUsagePatterns($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get user performance
   */
  public function userPerformance(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->operationService->getUserPerformance($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }

  /**
   * Get backup status
   */
  public function backupStatus(Request $request): JsonResponse
  {
    $filters = $request->only(['start_date', 'end_date']);

    $data = $this->operationService->getBackupStatus($filters);

    return response()->json([
      'success' => true,
      'data' => $data
    ]);
  }
}
