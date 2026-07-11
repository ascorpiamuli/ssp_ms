<?php

namespace App\Services\Admin;

use App\Models\UserActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuditLogService
{
  /**
   * Log an action to the audit trail.
   */
  public function log(array $data): ?UserActivityLog
  {
    try {
      // Skip logging if no user_id and it's a public request
      $userId = $data['user_id'] ?? auth()->id();

      // If no user_id and it's an api_request, skip logging
      if (!$userId && isset($data['action']) && $data['action'] === 'api_request') {
        return null;
      }

      $auditLog = UserActivityLog::create([
        'user_id' => $userId,
        'action' => $data['action'],
        'module' => $data['module'],
        'description' => $data['description'] ?? null,
        'data' => $data['data'] ?? null,
        'ip_address' => $data['ip_address'] ?? request()->ip(),
        'user_agent' => $data['user_agent'] ?? request()->userAgent(),
        'entity_type' => $data['entity_type'] ?? null,
        'entity_id' => $data['entity_id'] ?? null,
        'old_values' => $data['old_values'] ?? null,
        'new_values' => $data['new_values'] ?? null,
        'metadata' => $data['metadata'] ?? null,
      ]);

      return $auditLog;
    } catch (\Exception $e) {
      // Silently fail - don't let audit logging break the application
      return null;
    }
  }

  /**
   * Get all audit logs with filters.
   */
  public function getAll(array $filters = [])
  {
    try {
      $query = UserActivityLog::with('user');

      // Apply filters
      if (isset($filters['module']) && !empty($filters['module'])) {
        $query->module($filters['module']);
      }

      if (isset($filters['action']) && !empty($filters['action'])) {
        $query->action($filters['action']);
      }

      if (isset($filters['user_id']) && !empty($filters['user_id'])) {
        $query->user($filters['user_id']);
      }

      if (isset($filters['entity_type']) && !empty($filters['entity_type'])) {
        $query->where('entity_type', $filters['entity_type']);
      }

      if (isset($filters['entity_id']) && !empty($filters['entity_id'])) {
        $query->where('entity_id', $filters['entity_id']);
      }

      if (isset($filters['start_date']) && isset($filters['end_date'])) {
        $query->dateRange($filters['start_date'], $filters['end_date']);
      }

      if (isset($filters['search']) && !empty($filters['search'])) {
        $search = $filters['search'];
        $query->where(function ($q) use ($search) {
          $q->where('description', 'like', "%{$search}%")
            ->orWhere('action', 'like', "%{$search}%")
            ->orWhere('module', 'like', "%{$search}%")
            ->orWhere('entity_type', 'like', "%{$search}%");
        });
      }

      // Sort
      $sortBy = $filters['sort_by'] ?? 'created_at';
      $sortOrder = $filters['sort_order'] ?? 'desc';
      $query->orderBy($sortBy, $sortOrder);

      // Paginate or get all
      $perPage = $filters['per_page'] ?? 50;
      $result = $query->paginate($perPage);

      return $result;
    } catch (\Exception $e) {
      // Return empty result on error
      return collect([]);
    }
  }

  /**
   * Get a single audit log entry.
   */
  public function getById(int $id): ?UserActivityLog
  {
    try {
      return UserActivityLog::with('user')->find($id);
    } catch (\Exception $e) {
      return null;
    }
  }

  /**
   * Get audit log statistics.
   */
  public function getStats(): array
  {
    try {
      $stats = [
        'total_logs' => UserActivityLog::count(),
        'unique_users' => UserActivityLog::distinct('user_id')->count('user_id'),
        'today_logs' => UserActivityLog::whereDate('created_at', today())->count(),
        'week_logs' => UserActivityLog::whereDate('created_at', '>=', now()->subDays(7))->count(),
        'month_logs' => UserActivityLog::whereDate('created_at', '>=', now()->subDays(30))->count(),
        'modules' => UserActivityLog::select('module', DB::raw('count(*) as count'))
          ->whereNotNull('module')
          ->groupBy('module')
          ->get()
          ->pluck('count', 'module')
          ->toArray(),
        'actions' => UserActivityLog::select('action', DB::raw('count(*) as count'))
          ->whereNotNull('action')
          ->groupBy('action')
          ->orderBy('count', 'desc')
          ->limit(10)
          ->get()
          ->pluck('count', 'action')
          ->toArray(),
        'recent_activities' => UserActivityLog::with('user')
          ->orderBy('created_at', 'desc')
          ->limit(10)
          ->get(),
      ];

      return $stats;
    } catch (\Exception $e) {
      return [
        'total_logs' => 0,
        'unique_users' => 0,
        'today_logs' => 0,
        'week_logs' => 0,
        'month_logs' => 0,
        'modules' => [],
        'actions' => [],
        'recent_activities' => [],
      ];
    }
  }

  /**
   * Get available modules for filtering.
   */
  public function getModules(): array
  {
    try {
      return UserActivityLog::distinct('module')
        ->whereNotNull('module')
        ->pluck('module')
        ->filter()
        ->values()
        ->toArray();
    } catch (\Exception $e) {
      return [];
    }
  }

  /**
   * Get available actions for filtering.
   */
  public function getActions(): array
  {
    try {
      return UserActivityLog::distinct('action')
        ->whereNotNull('action')
        ->pluck('action')
        ->filter()
        ->values()
        ->toArray();
    } catch (\Exception $e) {
      return [];
    }
  }

  /**
   * Log user login.
   */
  public function logLogin(int $userId): ?UserActivityLog
  {
    return $this->log([
      'user_id' => $userId,
      'action' => 'login',
      'module' => 'auth',
      'description' => 'User logged in',
    ]);
  }

  /**
   * Log user logout.
   */
  public function logLogout(int $userId): ?UserActivityLog
  {
    return $this->log([
      'user_id' => $userId,
      'action' => 'logout',
      'module' => 'auth',
      'description' => 'User logged out',
    ]);
  }

  /**
   * Log model creation.
   */
  public function logCreated(string $module, $model, ?string $description = null): ?UserActivityLog
  {
    return $this->log([
      'action' => 'created',
      'module' => $module,
      'description' => $description ?? "{$module} created",
      'entity_type' => get_class($model),
      'entity_id' => $model->id,
      'new_values' => $model->toArray(),
    ]);
  }

  /**
   * Log model update.
   */
  public function logUpdated(string $module, $model, array $oldValues, ?string $description = null): ?UserActivityLog
  {
    return $this->log([
      'action' => 'updated',
      'module' => $module,
      'description' => $description ?? "{$module} updated",
      'entity_type' => get_class($model),
      'entity_id' => $model->id,
      'old_values' => $oldValues,
      'new_values' => $model->toArray(),
    ]);
  }

  /**
   * Log model deletion.
   */
  public function logDeleted(string $module, $model, ?string $description = null): ?UserActivityLog
  {
    return $this->log([
      'action' => 'deleted',
      'module' => $module,
      'description' => $description ?? "{$module} deleted",
      'entity_type' => get_class($model),
      'entity_id' => $model->id,
      'old_values' => $model->toArray(),
    ]);
  }

  /**
   * Log custom action.
   */
  public function logCustom(string $action, string $module, string $description, array $data = [], $entity = null): ?UserActivityLog
  {
    $logData = [
      'action' => $action,
      'module' => $module,
      'description' => $description,
      'data' => $data,
    ];

    if ($entity) {
      $logData['entity_type'] = get_class($entity);
      $logData['entity_id'] = $entity->id;
    }

    return $this->log($logData);
  }
}
