<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

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

      // Transform the logs to include display names
      $transformedItems = collect($logs->items())->map(function ($log) {
        return $this->transformLog($log);
      });

      return response()->json([
        'success' => true,
        'data' => $transformedItems,
        'meta' => [
          'current_page' => $logs->currentPage(),
          'per_page' => $logs->perPage(),
          'total' => $logs->total(),
          'last_page' => $logs->lastPage(),
        ],
      ]);
    } catch (\Exception $e) {
      Log::error('❌ AuditLogController::index - Error fetching audit logs', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
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

      if (!$log) {
        return response()->json([
          'success' => false,
          'message' => 'Audit log not found',
        ], 404);
      }

      return response()->json([
        'success' => true,
        'data' => $this->transformLog($log),
      ]);
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
          'security' => 'Security',
          'admin' => 'Administration',
          'user_management' => 'User Management',
          'role_management' => 'Roles & Permissions',
          'system_settings' => 'System Settings',
          'backup' => 'Backup',
          'signature' => 'Digital Signatures',
          'approval' => 'Approvals',
          'requisition' => 'Requisitions',
          'purchase_order' => 'Purchase Orders',
          'payment' => 'Payments',
          'cheque' => 'Cheques',
          'contract' => 'Contracts',
          'tender' => 'Tenders',
          'supplier' => 'Suppliers',
          'invoice' => 'Invoices',
          'goods_received' => 'Goods Received',
          'service_acknowledgment' => 'Service Acknowledgment',
          'company' => 'Company Profile',
          'procurement' => 'Procurement',
          'quotation' => 'Quotations',
          'budget' => 'Budget',
          'department' => 'Departments',
          'user' => 'Users',
          'permission' => 'Permissions',
          'role' => 'Roles',
          'audit' => 'Audit Logs',
          'file_management' => 'File Management',
          'system' => 'System',
          'general' => 'General',
          'profile' => 'Profile',
          'reports' => 'Reports',
          'settings' => 'Settings',
        ];

        return [
          'value' => $module,
          'label' => $displayMap[$module] ?? ucfirst(str_replace('_', ' ', $module)),
        ];
      }, $modules);

      // Sort by label
      usort($formatted, function ($a, $b) {
        return strcmp($a['label'], $b['label']);
      });

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
          'force_deleted' => 'Force Deleted',
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
          'password_reset' => 'Password Reset',
          '2fa_enable' => '2FA Enabled',
          '2fa_disable' => '2FA Disabled',
          'password_changed' => 'Password Changed',
          'profile_updated' => 'Profile Updated',
          'role_assigned' => 'Role Assigned',
          'role_removed' => 'Role Removed',
          'permission_granted' => 'Permission Granted',
          'permission_revoked' => 'Permission Revoked',
          'upload' => 'Uploaded',
          'download' => 'Downloaded',
          'preview' => 'Previewed',
          'generate_qr' => 'QR Generated',
          'regenerate_qr' => 'QR Regenerated',
          'verify_qr' => 'QR Verified',
          'scan_qr' => 'QR Scanned',
          'reject_signature' => 'Signature Rejected',
          'verify_signature' => 'Signature Verified',
          'upload_signature' => 'Signature Uploaded',
          'delete_signature' => 'Signature Deleted',
          'regenerate_qr' => 'QR Regenerated',
          'check' => 'Checked',
          'endorse' => 'Endorsed',
          'issue' => 'Issued',
          'send' => 'Sent',
          'receive' => 'Received',
          'inspect' => 'Inspected',
          'quality_check' => 'Quality Checked',
          'dispute' => 'Disputed',
          'send_back' => 'Sent Back',
          'stop_cheque' => 'Cheque Stopped',
          'cancel_cheque' => 'Cheque Cancelled',
          'cash' => 'Cashed',
          'pay' => 'Paid',
          'match' => 'Matched',
          'complete' => 'Completed',
          'terminate' => 'Terminated',
          'suspend' => 'Suspended',
          'renew' => 'Renewed',
          'award' => 'Awarded',
          'escalate' => 'Escalated',
          'delegate' => 'Delegated',
          'reassign' => 'Reassigned',
          'force_approve' => 'Force Approved',
          'force_decline' => 'Force Declined',
          'force_return' => 'Force Returned',
          'blacklist' => 'Blacklisted',
          'unblacklist' => 'Unblacklisted',
          'select_supplier' => 'Supplier Selected',
          'evaluate_quotation' => 'Quotation Evaluated',
          'convert_to_lpo' => 'Converted to LPO',
          'convert_to_lso' => 'Converted to LSO',
        ];

        return [
          'value' => $action,
          'label' => $displayMap[$action] ?? ucfirst(str_replace('_', ' ', $action)),
        ];
      }, $actions);

      // Sort by label
      usort($formatted, function ($a, $b) {
        return strcmp($a['label'], $b['label']);
      });

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
          $oldValues = is_string($log->old_values) ? json_decode($log->old_values, true) : $log->old_values;
          $newValues = is_string($log->new_values) ? json_decode($log->new_values, true) : $log->new_values;

          if (is_array($oldValues) && is_array($newValues)) {
            $diff = [];
            foreach ($newValues as $key => $value) {
              if (isset($oldValues[$key]) && $oldValues[$key] != $value) {
                $old = is_array($oldValues[$key]) ? json_encode($oldValues[$key]) : $oldValues[$key];
                $new = is_array($value) ? json_encode($value) : $value;
                // Limit the length of the change description
                if (strlen($old) > 100) $old = substr($old, 0, 100) . '...';
                if (strlen($new) > 100) $new = substr($new, 0, 100) . '...';
                $diff[] = "{$key}: {$old} → {$new}";
              }
            }
            $changes = implode('; ', $diff);
            if (strlen($changes) > 500) $changes = substr($changes, 0, 500) . '...';
          }
        }

        fputcsv($handle, [
          $log->id,
          $log->user?->full_name ?? $log->user?->email ?? 'System',
          $this->getActionDisplayName($log->action),
          $this->getModuleDisplayName($log->module),
          $log->description,
          $log->entity_type ? class_basename($log->entity_type) : null,
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
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to export audit logs: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Transform a log entry for API response.
   */
  protected function transformLog($log): array
  {
    $changes = null;
    if ($log->old_values && $log->new_values) {
      $oldValues = is_string($log->old_values) ? json_decode($log->old_values, true) : $log->old_values;
      $newValues = is_string($log->new_values) ? json_decode($log->new_values, true) : $log->new_values;

      if (is_array($oldValues) && is_array($newValues)) {
        $diff = [];
        foreach ($newValues as $key => $value) {
          if (isset($oldValues[$key]) && $oldValues[$key] != $value) {
            $diff[] = [
              'field' => $key,
              'old' => $oldValues[$key],
              'new' => $value,
            ];
          }
        }
        if (!empty($diff)) {
          $changes = $diff;
        }
      }
    }

    return [
      'id' => $log->id,
      'user' => $log->user ? [
        'id' => $log->user->id,
        'full_name' => $log->user->full_name,
        'email' => $log->user->email,
      ] : null,
      'action' => $log->action,
      'action_display' => $this->getActionDisplayName($log->action),
      'module' => $log->module,
      'module_display' => $this->getModuleDisplayName($log->module),
      'description' => $log->description,
      'entity_type' => $log->entity_type ? class_basename($log->entity_type) : null,
      'entity_id' => $log->entity_id,
      'ip_address' => $log->ip_address,
      'user_agent' => $log->user_agent,
      'old_values' => $log->old_values,
      'new_values' => $log->new_values,
      'changes' => $changes,
      'metadata' => $log->metadata,
      'created_at' => $log->created_at?->toISOString(),
      'created_at_formatted' => $log->created_at?->format('Y-m-d H:i:s'),
    ];
  }

  /**
   * Get display name for action.
   */
  protected function getActionDisplayName(?string $action): string
  {
    $map = [
      'created' => 'Created',
      'updated' => 'Updated',
      'deleted' => 'Deleted',
      'restored' => 'Restored',
      'force_deleted' => 'Force Deleted',
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
      'password_reset' => 'Password Reset',
      '2fa_enable' => '2FA Enabled',
      '2fa_disable' => '2FA Disabled',
      'password_changed' => 'Password Changed',
      'profile_updated' => 'Profile Updated',
      'role_assigned' => 'Role Assigned',
      'role_removed' => 'Role Removed',
      'permission_granted' => 'Permission Granted',
      'permission_revoked' => 'Permission Revoked',
      'upload' => 'Uploaded',
      'preview' => 'Previewed',
      'generate_qr' => 'QR Generated',
      'regenerate_qr' => 'QR Regenerated',
      'verify_qr' => 'QR Verified',
      'scan_qr' => 'QR Scanned',
      'reject_signature' => 'Signature Rejected',
      'verify_signature' => 'Signature Verified',
      'upload_signature' => 'Signature Uploaded',
      'delete_signature' => 'Signature Deleted',
      'check' => 'Checked',
      'endorse' => 'Endorsed',
      'issue' => 'Issued',
      'send' => 'Sent',
      'receive' => 'Received',
      'inspect' => 'Inspected',
      'quality_check' => 'Quality Checked',
      'dispute' => 'Disputed',
      'send_back' => 'Sent Back',
      'stop_cheque' => 'Cheque Stopped',
      'cancel_cheque' => 'Cheque Cancelled',
      'cash' => 'Cashed',
      'pay' => 'Paid',
      'match' => 'Matched',
      'complete' => 'Completed',
      'terminate' => 'Terminated',
      'suspend' => 'Suspended',
      'renew' => 'Renewed',
      'award' => 'Awarded',
      'escalate' => 'Escalated',
      'delegate' => 'Delegated',
      'reassign' => 'Reassigned',
      'force_approve' => 'Force Approved',
      'force_decline' => 'Force Declined',
      'force_return' => 'Force Returned',
      'blacklist' => 'Blacklisted',
      'unblacklist' => 'Unblacklisted',
      'select_supplier' => 'Supplier Selected',
      'evaluate_quotation' => 'Quotation Evaluated',
      'convert_to_lpo' => 'Converted to LPO',
      'convert_to_lso' => 'Converted to LSO',
    ];

    return $map[$action] ?? ucfirst(str_replace('_', ' ', $action));
  }

  /**
   * Get display name for module.
   */
  protected function getModuleDisplayName(?string $module): string
  {
    $map = [
      'auth' => 'Authentication',
      'security' => 'Security',
      'admin' => 'Administration',
      'user_management' => 'User Management',
      'role_management' => 'Roles & Permissions',
      'system_settings' => 'System Settings',
      'backup' => 'Backup',
      'signature' => 'Digital Signatures',
      'approval' => 'Approvals',
      'requisition' => 'Requisitions',
      'purchase_order' => 'Purchase Orders',
      'payment' => 'Payments',
      'cheque' => 'Cheques',
      'contract' => 'Contracts',
      'tender' => 'Tenders',
      'supplier' => 'Suppliers',
      'invoice' => 'Invoices',
      'goods_received' => 'Goods Received',
      'service_acknowledgment' => 'Service Acknowledgment',
      'company' => 'Company Profile',
      'procurement' => 'Procurement',
      'quotation' => 'Quotations',
      'budget' => 'Budget',
      'department' => 'Departments',
      'user' => 'Users',
      'permission' => 'Permissions',
      'role' => 'Roles',
      'audit' => 'Audit Logs',
      'file_management' => 'File Management',
      'system' => 'System',
      'general' => 'General',
      'profile' => 'Profile',
      'reports' => 'Reports',
      'settings' => 'Settings',
    ];

    return $map[$module] ?? ucfirst(str_replace('_', ' ', $module));
  }
}
