<?php
// app/Services/Requisitions/RequisitionHistoryService.php

declare(strict_types=1);

namespace App\Services\Requisitions;

use App\Models\RequisitionHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Requisition History Service
 *
 * Handles logging and retrieval of requisition history
 */
class RequisitionHistoryService
{
  /**
   * Log an activity for a requisition
   *
   * @param int $requisitionId
   * @param string $action
   * @param array|null $oldValues
   * @param array|null $newValues
   * @param string|null $comment
   * @param int|null $userId
   * @return RequisitionHistory
   */
  public function log(
    int $requisitionId,
    string $action,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null,
    ?int $userId = null
  ): RequisitionHistory {
    Log::info('RequisitionHistoryService::log called', [
      'requisition_id' => $requisitionId,
      'action' => $action,
      'user_id' => $userId ?? Auth::id()
    ]);

    try {
      $history = RequisitionHistory::create([
        'requisition_id' => $requisitionId,
        'user_id' => $userId ?? Auth::id(),
        'action' => $action,
        'old_values' => $oldValues,
        'new_values' => $newValues,
        'comment' => $comment,
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
        'is_status_change' => isset($oldValues['status']) && isset($newValues['status']),
        'old_status' => $oldValues['status'] ?? null,
        'new_status' => $newValues['status'] ?? null,
      ]);

      Log::info('RequisitionHistoryService::log - History entry created', [
        'requisition_id' => $requisitionId,
        'action' => $action,
        'history_id' => $history->id
      ]);

      return $history;
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryService::log - Failed', [
        'requisition_id' => $requisitionId,
        'action' => $action,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Get history for a requisition with pagination and filters
   *
   * @param int $requisitionId
   * @param string|null $action
   * @param int $perPage
   * @param int $page
   * @param int|null $userId
   * @param string|null $dateFrom
   * @param string|null $dateTo
   * @return array
   */
  public function getByRequisitionId(
    int $requisitionId,
    ?string $action = null,
    int $perPage = 20,
    int $page = 1,
    ?int $userId = null,
    ?string $dateFrom = null,
    ?string $dateTo = null
  ): array {
    Log::info('RequisitionHistoryService::getByRequisitionId called', [
      'requisition_id' => $requisitionId,
      'action' => $action,
      'perPage' => $perPage,
      'page' => $page,
      'userId' => $userId,
      'dateFrom' => $dateFrom,
      'dateTo' => $dateTo
    ]);

    try {
      $query = RequisitionHistory::where('requisition_id', $requisitionId)
        ->with(['user']);

      if ($action) {
        $query->where('action', $action);
      }

      if ($userId) {
        $query->where('user_id', $userId);
      }

      if ($dateFrom) {
        $query->whereDate('created_at', '>=', $dateFrom);
      }

      if ($dateTo) {
        $query->whereDate('created_at', '<=', $dateTo);
      }

      $total = $query->count();
      $data = $query->orderBy('created_at', 'desc')
        ->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get();

      Log::info('RequisitionHistoryService::getByRequisitionId - Result', [
        'requisition_id' => $requisitionId,
        'total' => $total,
        'data_count' => $data->count()
      ]);

      return [
        'data' => $data,
        'total' => $total,
        'per_page' => $perPage,
        'current_page' => $page,
        'last_page' => ceil($total / $perPage),
      ];
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryService::getByRequisitionId - Failed', [
        'requisition_id' => $requisitionId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Get history by action type with pagination
   *
   * @param string $action
   * @param int $perPage
   * @param int $page
   * @param int|null $requisitionId
   * @param string|null $dateFrom
   * @param string|null $dateTo
   * @return array
   */
  public function getByAction(
    string $action,
    int $perPage = 20,
    int $page = 1,
    ?int $requisitionId = null,
    ?string $dateFrom = null,
    ?string $dateTo = null
  ): array {
    Log::info('RequisitionHistoryService::getByAction called', [
      'action' => $action,
      'perPage' => $perPage,
      'page' => $page,
      'requisitionId' => $requisitionId
    ]);

    try {
      $query = RequisitionHistory::with(['user', 'requisition'])
        ->where('action', $action);

      if ($requisitionId) {
        $query->where('requisition_id', $requisitionId);
      }

      if ($dateFrom) {
        $query->whereDate('created_at', '>=', $dateFrom);
      }

      if ($dateTo) {
        $query->whereDate('created_at', '<=', $dateTo);
      }

      $total = $query->count();
      $data = $query->orderBy('created_at', 'desc')
        ->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get();

      Log::info('RequisitionHistoryService::getByAction - Result', [
        'action' => $action,
        'total' => $total,
        'data_count' => $data->count()
      ]);

      return [
        'data' => $data,
        'total' => $total,
        'per_page' => $perPage,
        'current_page' => $page,
        'last_page' => ceil($total / $perPage),
      ];
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryService::getByAction - Failed', [
        'action' => $action,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Get recent history for a user
   *
   * @param int $userId
   * @param int $limit
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getRecentForUser(int $userId, int $limit = 10)
  {
    Log::info('RequisitionHistoryService::getRecentForUser called', [
      'userId' => $userId,
      'limit' => $limit
    ]);

    try {
      $history = RequisitionHistory::with(['user', 'requisition'])
        ->where('user_id', $userId)
        ->orderBy('created_at', 'desc')
        ->limit($limit)
        ->get();

      Log::info('RequisitionHistoryService::getRecentForUser - Result', [
        'userId' => $userId,
        'count' => $history->count()
      ]);

      return $history;
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryService::getRecentForUser - Failed', [
        'userId' => $userId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Get history statistics
   *
   * @param int|null $requisitionId
   * @param string|null $dateFrom
   * @param string|null $dateTo
   * @return array
   */
  public function getStats(
    ?int $requisitionId = null,
    ?string $dateFrom = null,
    ?string $dateTo = null
  ): array {
    Log::info('RequisitionHistoryService::getStats called', [
      'requisitionId' => $requisitionId,
      'dateFrom' => $dateFrom,
      'dateTo' => $dateTo
    ]);

    try {
      $query = RequisitionHistory::query();

      if ($requisitionId) {
        $query->where('requisition_id', $requisitionId);
      }

      if ($dateFrom) {
        $query->whereDate('created_at', '>=', $dateFrom);
      }

      if ($dateTo) {
        $query->whereDate('created_at', '<=', $dateTo);
      }

      // Total count
      $total = $query->count();

      // Group by action
      $byAction = (clone $query)->select('action', DB::raw('count(*) as count'))
        ->groupBy('action')
        ->get()
        ->pluck('count', 'action')
        ->toArray();

      // Group by user
      $byUser = (clone $query)->select('user_id', DB::raw('count(*) as count'))
        ->groupBy('user_id')
        ->with('user')
        ->get()
        ->map(function ($item) {
          return [
            'user' => $item->user ? $item->user->full_name : 'Unknown',
            'user_id' => $item->user_id,
            'count' => $item->count,
          ];
        })
        ->toArray();

      $stats = [
        'total' => $total,
        'by_action' => $byAction,
        'by_user' => $byUser,
      ];

      Log::info('RequisitionHistoryService::getStats - Result', [
        'total' => $total,
        'action_count' => count($byAction),
        'user_count' => count($byUser)
      ]);

      return $stats;
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryService::getStats - Failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Delete history records for a requisition
   *
   * @param int $requisitionId
   * @return bool
   */
  public function deleteForRequisition(int $requisitionId): bool
  {
    Log::info('RequisitionHistoryService::deleteForRequisition called', [
      'requisition_id' => $requisitionId
    ]);

    try {
      $deleted = RequisitionHistory::where('requisition_id', $requisitionId)->delete();

      Log::info('RequisitionHistoryService::deleteForRequisition - Success', [
        'requisition_id' => $requisitionId,
        'deleted_count' => $deleted
      ]);

      return true;
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryService::deleteForRequisition - Failed', [
        'requisition_id' => $requisitionId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Get history for a specific user with pagination
   *
   * @param int $userId
   * @param int $perPage
   * @param int $page
   * @param string|null $dateFrom
   * @param string|null $dateTo
   * @return array
   */
  public function getForUser(
    int $userId,
    int $perPage = 20,
    int $page = 1,
    ?string $dateFrom = null,
    ?string $dateTo = null
  ): array {
    Log::info('RequisitionHistoryService::getForUser called', [
      'userId' => $userId,
      'perPage' => $perPage,
      'page' => $page
    ]);

    try {
      $query = RequisitionHistory::with(['user', 'requisition'])
        ->where('user_id', $userId);

      if ($dateFrom) {
        $query->whereDate('created_at', '>=', $dateFrom);
      }

      if ($dateTo) {
        $query->whereDate('created_at', '<=', $dateTo);
      }

      $total = $query->count();
      $data = $query->orderBy('created_at', 'desc')
        ->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get();

      return [
        'data' => $data,
        'total' => $total,
        'per_page' => $perPage,
        'current_page' => $page,
        'last_page' => ceil($total / $perPage),
      ];
    } catch (\Exception $e) {
      Log::error('RequisitionHistoryService::getForUser - Failed', [
        'userId' => $userId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }
}
