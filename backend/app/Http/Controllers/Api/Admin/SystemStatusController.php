<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\SystemStatusService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class SystemStatusController extends Controller
{
  protected SystemStatusService $systemStatusService;

  public function __construct(SystemStatusService $systemStatusService)
  {
    $this->systemStatusService = $systemStatusService;
  }

  /**
   * Get current system status
   */
  public function current(): JsonResponse
  {
    Log::info('📊 SystemStatusController::current - Fetching current system status', [
      'user_id' => auth()->id()
    ]);

    try {
      $status = $this->systemStatusService->checkSystemStatus();

      return response()->json([
        'success' => true,
        'data' => $status,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ SystemStatusController::current - Error fetching system status', [
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch system status: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get system status history
   */
  public function history(Request $request): JsonResponse
  {
    Log::info('📊 SystemStatusController::history - Fetching system status history', [
      'filters' => $request->all(),
      'user_id' => auth()->id()
    ]);

    try {
      $filters = $request->only([
        'component',
        'status',
        'start_date',
        'end_date',
        'limit',
      ]);

      $history = $this->systemStatusService->getStatusHistory($filters);

      return response()->json([
        'success' => true,
        'data' => $history['data'],
        'meta' => $history['meta'],
      ]);
    } catch (\Exception $e) {
      Log::error('❌ SystemStatusController::history - Error fetching status history', [
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch status history: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get system status summary
   */
  public function summary(): JsonResponse
  {
    Log::info('📊 SystemStatusController::summary - Fetching system status summary', [
      'user_id' => auth()->id()
    ]);

    try {
      $summary = $this->systemStatusService->getSummary();

      return response()->json([
        'success' => true,
        'data' => $summary,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ SystemStatusController::summary - Error fetching system summary', [
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch system summary: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get component status
   */
  public function component(string $component): JsonResponse
  {
    Log::info('📊 SystemStatusController::component - Fetching component status', [
      'component' => $component,
      'user_id' => auth()->id()
    ]);

    try {
      $status = $this->systemStatusService->checkSystemStatus();

      if (!isset($status['components'][$component])) {
        return response()->json([
          'success' => false,
          'message' => 'Component not found',
        ], 404);
      }

      return response()->json([
        'success' => true,
        'data' => [
          'component' => $component,
          'status' => $status['components'][$component],
        ],
      ]);
    } catch (\Exception $e) {
      Log::error('❌ SystemStatusController::component - Error fetching component status', [
        'component' => $component,
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch component status: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Refresh system status (force check)
   */
  public function refresh(): JsonResponse
  {
    Log::info('🔄 SystemStatusController::refresh - Forcing system status refresh', [
      'user_id' => auth()->id()
    ]);

    try {
      $status = $this->systemStatusService->checkSystemStatus();

      return response()->json([
        'success' => true,
        'message' => 'System status refreshed successfully',
        'data' => $status,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ SystemStatusController::refresh - Error refreshing system status', [
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to refresh system status: ' . $e->getMessage(),
      ], 500);
    }
  }
}
