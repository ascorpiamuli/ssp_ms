<?php
// app/Http/Controllers/Api/RequisitionHistoryController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Requisition\RequisitionHistoryResource;
use App\Services\Requisitions\RequisitionHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RequisitionHistoryController extends Controller
{
  public function __construct(
    protected RequisitionHistoryService $historyService
  ) {}

  /**
   * Display a listing of history for a requisition.
   */
  public function index(int $requisitionId, Request $request): JsonResponse
  {
    Log::info('RequisitionHistoryController::index called', [
      'requisition_id' => $requisitionId,
      'filters' => $request->all()
    ]);

    try {
      // ✅ Cast per_page to integer
      $perPage = (int) $request->input('per_page', 20);
      $page = (int) $request->input('page', 1);
      $action = $request->input('action');
      $userId = $request->input('user_id') ? (int) $request->input('user_id') : null;
      $dateFrom = $request->input('date_from');
      $dateTo = $request->input('date_to');

      $result = $this->historyService->getByRequisitionId(
        $requisitionId,
        $action,
        $perPage,
        $page,
        $userId,
        $dateFrom,
        $dateTo
      );

      Log::info('RequisitionHistoryController::index - Success', [
        'requisition_id' => $requisitionId,
        'total' => $result['total'] ?? 0,
        'data_count' => count($result['data'] ?? [])
      ]);

      return response()->json([
        'success' => true,
        'data' => $result['data'] ?? [],
        'total' => $result['total'] ?? 0,
        'per_page' => $result['per_page'] ?? $perPage,
        'current_page' => $result['current_page'] ?? $page,
        'last_page' => $result['last_page'] ?? 1,
        'message' => 'History retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryController::index - Failed', [
        'requisition_id' => $requisitionId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve history: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Display the specified history record.
   */
  public function show(int $requisitionId, int $id): JsonResponse
  {
    Log::info('RequisitionHistoryController::show called', [
      'requisition_id' => $requisitionId,
      'history_id' => $id
    ]);

    try {
      $history = \App\Models\RequisitionHistory::with(['user'])
        ->where('requisition_id', $requisitionId)
        ->findOrFail($id);

      Log::info('RequisitionHistoryController::show - Success', [
        'requisition_id' => $requisitionId,
        'history_id' => $id
      ]);

      return response()->json([
        'success' => true,
        'data' => new RequisitionHistoryResource($history),
        'message' => 'History record retrieved successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      Log::warning('RequisitionHistoryController::show - Not found', [
        'requisition_id' => $requisitionId,
        'history_id' => $id
      ]);

      return response()->json([
        'success' => false,
        'message' => 'History record not found'
      ], 404);
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryController::show - Failed', [
        'requisition_id' => $requisitionId,
        'history_id' => $id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve history record: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get history by action type.
   */
  public function byAction(string $action, Request $request): JsonResponse
  {
    Log::info('RequisitionHistoryController::byAction called', [
      'action' => $action,
      'filters' => $request->all()
    ]);

    try {
      // ✅ Cast per_page to integer
      $perPage = (int) $request->input('per_page', 20);
      $page = (int) $request->input('page', 1);
      $requisitionId = $request->input('requisition_id') ? (int) $request->input('requisition_id') : null;
      $dateFrom = $request->input('date_from');
      $dateTo = $request->input('date_to');

      $result = $this->historyService->getByAction(
        $action,
        $perPage,
        $page,
        $requisitionId,
        $dateFrom,
        $dateTo
      );

      Log::info('RequisitionHistoryController::byAction - Success', [
        'action' => $action,
        'total' => $result['total'] ?? 0,
        'data_count' => count($result['data'] ?? [])
      ]);

      return response()->json([
        'success' => true,
        'data' => $result['data'] ?? [],
        'total' => $result['total'] ?? 0,
        'per_page' => $result['per_page'] ?? $perPage,
        'current_page' => $result['current_page'] ?? $page,
        'last_page' => $result['last_page'] ?? 1,
        'message' => 'History retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryController::byAction - Failed', [
        'action' => $action,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve history: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get history statistics.
   */
  public function stats(Request $request): JsonResponse
  {
    Log::info('RequisitionHistoryController::stats called', [
      'filters' => $request->all()
    ]);

    try {
      $requisitionId = $request->input('requisition_id') ? (int) $request->input('requisition_id') : null;
      $dateFrom = $request->input('date_from');
      $dateTo = $request->input('date_to');

      $stats = $this->historyService->getStats(
        $requisitionId,
        $dateFrom,
        $dateTo
      );

      Log::info('RequisitionHistoryController::stats - Success', [
        'stats' => $stats
      ]);

      return response()->json([
        'success' => true,
        'data' => $stats,
        'message' => 'History statistics retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryController::stats - Failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve history statistics: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get recent history for a user.
   */
  public function recent(int $userId, Request $request): JsonResponse
  {
    Log::info('RequisitionHistoryController::recent called', [
      'user_id' => $userId,
      'filters' => $request->all()
    ]);

    try {
      // ✅ Cast limit to integer
      $limit = (int) $request->input('limit', 10);

      $history = $this->historyService->getRecentForUser($userId, $limit);

      Log::info('RequisitionHistoryController::recent - Success', [
        'user_id' => $userId,
        'count' => $history->count()
      ]);

      return response()->json([
        'success' => true,
        'data' => RequisitionHistoryResource::collection($history),
        'message' => 'Recent history retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryController::recent - Failed', [
        'user_id' => $userId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve recent history: ' . $e->getMessage()
      ], 500);
    }
  }
}
