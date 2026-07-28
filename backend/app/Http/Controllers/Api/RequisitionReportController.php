<?php
// app/Http/Controllers/Api/RequisitionReportController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Requisitions\RequisitionService;
use App\Services\Requisitions\ApprovalService;
use App\Services\Requisitions\RequisitionBudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequisitionReportController extends Controller
{
  public function __construct(
    protected RequisitionService $requisitionService,
    protected ApprovalService $approvalService,
    protected RequisitionBudgetService $budgetService
  ) {}

  /**
   * Get dashboard statistics.
   */
  public function dashboard(Request $request): JsonResponse
  {
    try {
      $filters = $request->all();

      // Get requisition stats
      $requisitionStats = $this->requisitionService->getStats($filters);

      // Get approval stats (if user ID provided)
      $approvalStats = [];
      if ($request->has('user_id')) {
        $approvalStats = $this->approvalService->getStatsForUser((int) $request->user_id);
      }

      // Get budget stats
      $budgetStats = $this->budgetService->getStats($filters);

      return response()->json([
        'success' => true,
        'data' => [
          'requisitions' => $requisitionStats,
          'approvals' => $approvalStats,
          'budgets' => $budgetStats,
          'timestamp' => now()->toISOString()
        ],
        'message' => 'Dashboard statistics retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve dashboard statistics: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get requisition summary report.
   */
  public function summary(Request $request): JsonResponse
  {
    try {
      $filters = $request->all();

      $stats = $this->requisitionService->getStats($filters);

      // Get additional metrics
      $totalAmount = $this->requisitionService->totalAmountByStatus('final_approved', $filters);
      $pendingAmount = $this->requisitionService->totalAmountByStatus('submitted', $filters);

      return response()->json([
        'success' => true,
        'data' => [
          'summary' => $stats,
          'total_approved_amount' => $totalAmount,
          'pending_amount' => $pendingAmount,
          'report_generated_at' => now()->toISOString()
        ],
        'message' => 'Summary report retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve summary report: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get approval performance report.
   */
  public function approvalPerformance(Request $request): JsonResponse
  {
    try {
      $userId = $request->input('user_id');

      if (!$userId) {
        return response()->json([
          'success' => false,
          'message' => 'User ID is required'
        ], 400);
      }

      $stats = $this->approvalService->getStatsForUser((int) $userId);

      return response()->json([
        'success' => true,
        'data' => $stats,
        'message' => 'Approval performance report retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve approval performance: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get budget utilization report.
   */
  public function budgetUtilization(Request $request): JsonResponse
  {
    try {
      $filters = $request->all();
      $stats = $this->budgetService->getStats($filters);

      return response()->json([
        'success' => true,
        'data' => $stats,
        'message' => 'Budget utilization report retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve budget utilization: ' . $e->getMessage()
      ], 500);
    }
  }
}
