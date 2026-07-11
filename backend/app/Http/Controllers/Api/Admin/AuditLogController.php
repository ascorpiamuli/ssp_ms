<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log; // <-- ADD THIS LINE

class AuditLogController extends Controller
{
  protected AuditLogService $auditLogService;

  public function __construct(AuditLogService $auditLogService)
  {
    $this->auditLogService = $auditLogService;
  }

  /**
   * Get all audit logs with filters.
   */
  public function index(Request $request): JsonResponse
  {
    Log::info('📋 AuditLogController::index - Fetching audit logs', [
      'filters' => $request->all(),
      'user_id' => auth()->id()
    ]);

    try {
      $filters = $request->only([
        'module',
        'action',
        'user_id',
        'entity_type',
        'entity_id',
        'start_date',
        'end_date',
        'search',
        'sort_by',
        'sort_order',
        'per_page',
        'page'
      ]);

      $logs = $this->auditLogService->getAll($filters);

      return response()->json([
        'success' => true,
        'data' => $logs->items(),
        'meta' => [
          'current_page' => $logs->currentPage(),
          'per_page' => $logs->perPage(),
          'total' => $logs->total(),
          'last_page' => $logs->lastPage(),
        ],
      ]);
    } catch (\Exception $e) {
      Log::error('❌ AuditLogController::index - Error fetching audit logs', [
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch audit logs: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get a single audit log entry.
   */
  public function show(int $id): JsonResponse
  {
    Log::info('🔍 AuditLogController::show - Fetching audit log', [
      'audit_id' => $id,
      'user_id' => auth()->id()
    ]);

    try {
      $log = $this->auditLogService->getById($id);

      return response()->json([
        'success' => true,
        'data' => $log,
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Audit log not found',
      ], 404);
    } catch (\Exception $e) {
      Log::error('❌ AuditLogController::show - Error fetching audit log', [
        'audit_id' => $id,
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch audit log: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get audit log statistics.
   */
  public function stats(): JsonResponse
  {
    Log::info('📊 AuditLogController::stats - Fetching audit statistics', [
      'user_id' => auth()->id()
    ]);

    try {
      $stats = $this->auditLogService->getStats();

      return response()->json([
        'success' => true,
        'data' => $stats,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ AuditLogController::stats - Error fetching statistics', [
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch audit statistics: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get available modules for filtering.
   */
  public function modules(): JsonResponse
  {
    Log::info('📋 AuditLogController::modules - Fetching available modules', [
      'user_id' => auth()->id()
    ]);

    try {
      $modules = $this->auditLogService->getModules();

      // Format for dropdown
      $formatted = array_map(function ($module) {
        $displayMap = [
          'auth' => 'Authentication',
          'users' => 'Users',
          'roles' => 'Roles & Permissions',
          'departments' => 'Departments',
          'suppliers' => 'Suppliers',
          'requisitions' => 'Requisitions',
          'approvals' => 'Approvals',
          'procurement' => 'Procurement',
          'orders' => 'Purchase Orders',
          'invoices' => 'Invoices',
          'budget' => 'Budget',
          'reports' => 'Reports',
          'settings' => 'Settings',
          'profile' => 'Profile',
          'audit' => 'Audit Logs',
        ];

        return [
          'value' => $module,
          'label' => $displayMap[$module] ?? ucfirst($module),
        ];
      }, $modules);

      return response()->json([
        'success' => true,
        'data' => $formatted,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ AuditLogController::modules - Error fetching modules', [
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch modules: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get available actions for filtering.
   */
  public function actions(): JsonResponse
  {
    Log::info('📋 AuditLogController::actions - Fetching available actions', [
      'user_id' => auth()->id()
    ]);

    try {
      $actions = $this->auditLogService->getActions();

      // Format for dropdown
      $formatted = array_map(function ($action) {
        $displayMap = [
          'created' => 'Created',
          'updated' => 'Updated',
          'deleted' => 'Deleted',
          'restored' => 'Restored',
          'viewed' => 'Viewed',
          'downloaded' => 'Downloaded',
          'exported' => 'Exported',
          'imported' => 'Imported',
          'assigned' => 'Assigned',
          'unassigned' => 'Unassigned',
          'approved' => 'Approved',
          'rejected' => 'Rejected',
          'submitted' => 'Submitted',
          'verified' => 'Verified',
          'published' => 'Published',
          'unpublished' => 'Unpublished',
          'activated' => 'Activated',
          'deactivated' => 'Deactivated',
          'enabled' => 'Enabled',
          'disabled' => 'Disabled',
          'login' => 'Logged In',
          'logout' => 'Logged Out',
          'password_changed' => 'Password Changed',
          'profile_updated' => 'Profile Updated',
          'role_assigned' => 'Role Assigned',
          'role_removed' => 'Role Removed',
        ];

        return [
          'value' => $action,
          'label' => $displayMap[$action] ?? ucfirst($action),
        ];
      }, $actions);

      return response()->json([
        'success' => true,
        'data' => $formatted,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ AuditLogController::actions - Error fetching actions', [
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch actions: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Export audit logs to CSV.
   */
  public function export(Request $request)
  {
    Log::info('📤 AuditLogController::export - Exporting audit logs', [
      'filters' => $request->all(),
      'user_id' => auth()->id()
    ]);

    try {
      $filters = $request->only([
        'module',
        'action',
        'user_id',
        'entity_type',
        'entity_id',
        'start_date',
        'end_date',
        'search',
      ]);

      $logs = $this->auditLogService->getAll(array_merge($filters, ['per_page' => 10000]));

      $headers = [
        'ID',
        'User',
        'Action',
        'Module',
        'Description',
        'Entity Type',
        'Entity ID',
        'IP Address',
        'Timestamp',
        'Changes',
      ];

      $filename = 'audit_logs_' . now()->format('Y-m-d_His') . '.csv';

      // Create CSV content
      $handle = fopen('php://temp', 'w+');
      fputcsv($handle, $headers);

      foreach ($logs->items() as $log) {
        $changes = '';
        if ($log->old_values && $log->new_values) {
          $diff = [];
          foreach ($log->new_values as $key => $value) {
            if (isset($log->old_values[$key]) && $log->old_values[$key] != $value) {
              $old = is_array($log->old_values[$key]) ? json_encode($log->old_values[$key]) : $log->old_values[$key];
              $new = is_array($value) ? json_encode($value) : $value;
              $diff[] = "{$key}: {$old} → {$new}";
            }
          }
          $changes = implode('; ', $diff);
        }

        fputcsv($handle, [
          $log->id,
          $log->user?->full_name ?? $log->user?->email ?? 'System',
          $log->action_display_name ?? $log->action,
          $log->module_display_name ?? $log->module,
          $log->description,
          $log->entity_type,
          $log->entity_id,
          $log->ip_address,
          $log->created_at?->format('Y-m-d H:i:s'),
          $changes,
        ]);
      }

      rewind($handle);
      $csvContent = stream_get_contents($handle);
      fclose($handle);

      return response($csvContent)
        ->header('Content-Type', 'text/csv')
        ->header('Content-Disposition', "attachment; filename={$filename}")
        ->header('Cache-Control', 'private, max-age=0, must-revalidate');
    } catch (\Exception $e) {
      Log::error('❌ AuditLogController::export - Error exporting audit logs', [
        'error' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to export audit logs: ' . $e->getMessage(),
      ], 500);
    }
  }
}
