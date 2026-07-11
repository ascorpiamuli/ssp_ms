<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserActivityLog extends Model
{
  use HasFactory;

  protected $table = 'user_activity_logs';

  protected $fillable = [
    'user_id',
    'action',
    'module',
    'description',
    'data',
    'ip_address',
    'user_agent',
    'entity_type',
    'entity_id',
    'old_values',
    'new_values',
    'metadata',
  ];

  protected $casts = [
    'data' => 'array',
    'old_values' => 'array',
    'new_values' => 'array',
    'metadata' => 'array',
    'created_at' => 'datetime',
  ];

  /**
   * Get the user that owns the activity log.
   */
  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Scope a query to filter by module.
   */
  public function scopeModule($query, $module)
  {
    return $query->where('module', $module);
  }

  /**
   * Scope a query to filter by action.
   */
  public function scopeAction($query, $action)
  {
    return $query->where('action', $action);
  }

  /**
   * Scope a query to filter by date range.
   */
  public function scopeDateRange($query, $startDate, $endDate)
  {
    return $query->whereBetween('created_at', [$startDate, $endDate]);
  }

  /**
   * Scope a query to filter by entity.
   */
  public function scopeEntity($query, $entityType, $entityId = null)
  {
    $query->where('entity_type', $entityType);
    if ($entityId) {
      $query->where('entity_id', $entityId);
    }
    return $query;
  }

  /**
   * Scope a query to filter by user.
   */
  public function scopeUser($query, $userId)
  {
    return $query->where('user_id', $userId);
  }

  /**
   * Get the display name for the action.
   */
  public function getActionDisplayNameAttribute(): string
  {
    $actionMap = [
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
      'assigned_hod' => 'Assigned HOD',
      'removed_hod' => 'Removed HOD',
      'login' => 'Logged In',
      'logout' => 'Logged Out',
      'password_changed' => 'Password Changed',
      'password_reset' => 'Password Reset',
      'profile_updated' => 'Profile Updated',
      'role_assigned' => 'Role Assigned',
      'role_removed' => 'Role Removed',
      'permission_granted' => 'Permission Granted',
      'permission_revoked' => 'Permission Revoked',
    ];

    return $actionMap[$this->action] ?? ucfirst($this->action);
  }

  /**
   * Get the module display name.
   */
  public function getModuleDisplayNameAttribute(): string
  {
    $moduleMap = [
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

    return $moduleMap[$this->module] ?? ucfirst($this->module);
  }

  /**
   * Get color for action badge.
   */
  public function getActionColorAttribute(): string
  {
    $colors = [
      'created' => 'success',
      'updated' => 'info',
      'deleted' => 'danger',
      'restored' => 'success',
      'viewed' => 'secondary',
      'downloaded' => 'info',
      'exported' => 'info',
      'imported' => 'warning',
      'assigned' => 'warning',
      'unassigned' => 'danger',
      'approved' => 'success',
      'rejected' => 'danger',
      'submitted' => 'primary',
      'verified' => 'success',
      'published' => 'success',
      'unpublished' => 'warning',
      'activated' => 'success',
      'deactivated' => 'danger',
      'enabled' => 'success',
      'disabled' => 'danger',
      'assigned_hod' => 'primary',
      'removed_hod' => 'danger',
      'login' => 'success',
      'logout' => 'secondary',
      'password_changed' => 'warning',
      'password_reset' => 'warning',
      'profile_updated' => 'info',
    ];

    return $colors[$this->action] ?? 'secondary';
  }
}
