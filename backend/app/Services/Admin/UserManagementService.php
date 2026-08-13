<?php

namespace App\Services\Admin;

use App\Services\BaseService;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserManagementService extends BaseService
{
  /**
   * Get all users with filters.
   */
  public function getAllUsers(array $filters = [])
  {
    Log::emergency('🔍 UserManagementService::getAllUsers STARTED', ['filters' => $filters]);

    $query = User::with([
      'department',
      'roles',
      'roles.permissions',
      'permissions',
      'profile'
    ]);

    // Handle soft delete filter
    if (isset($filters['deleted']) && $filters['deleted'] === 'only') {
      $query->onlyTrashed();
      Log::emergency('✅ Showing only deleted (soft-deleted) users');
    } elseif (isset($filters['deleted']) && $filters['deleted'] === 'with') {
      $query->withTrashed();
      Log::emergency('✅ Showing all users including deleted');
    } else {
      $query->whereNull('deleted_at');
      Log::emergency('✅ Default: showing only active (non-deleted) users');
    }

    // Search filter
    if (!empty($filters['search'])) {
      $search = $filters['search'];
      $query->where(function ($q) use ($search) {
        $q->where('first_name', 'LIKE', "%{$search}%")
          ->orWhere('last_name', 'LIKE', "%{$search}%")
          ->orWhere('email', 'LIKE', "%{$search}%")
          ->orWhere('phone', 'LIKE', "%{$search}%")
          ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', "%{$search}%");
      });
      Log::emergency('✅ Applied search filter', ['search' => $search]);
    }

    // Role filter - Skip if 'all'
    if (!empty($filters['role']) && $filters['role'] !== 'all') {
      $query->whereHas('roles', function ($q) use ($filters) {
        $q->where('name', $filters['role']);
      });
      Log::emergency('✅ Applied role filter', ['role' => $filters['role']]);
    } else {
      Log::emergency('ℹ️ Role filter skipped (all)');
    }

    // Department filter
    $departmentId = $filters['department'] ?? $filters['department_id'] ?? null;
    if (!empty($departmentId) && $departmentId !== 'all') {
      $query->where('department_id', $departmentId);
      Log::emergency('✅ Applied department filter', ['department_id' => $departmentId]);
    } else {
      Log::emergency('ℹ️ Department filter skipped (all)');
    }

    // Status filter - Skip if 'all'
    if (!empty($filters['status']) && $filters['status'] !== 'all') {
      switch ($filters['status']) {
        case 'active':
          $query->where('is_active', true);
          break;
        case 'inactive':
          $query->where('is_active', false);
          break;
        case 'pending':
          $query->where('is_approved', false);
          break;
        case 'approved':
          $query->where('is_approved', true);
          break;
      }
      Log::emergency('✅ Applied status filter', ['status' => $filters['status']]);
    } else {
      Log::emergency('ℹ️ Status filter skipped (all)');
    }

    // Sort
    $sortField = $filters['sort_by'] ?? 'created_at';
    $sortDirection = $filters['sort_direction'] ?? $filters['sort_order'] ?? 'desc';
    $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'desc';
    $query->orderBy($sortField, $sortDirection);
    Log::emergency('✅ Applied sort', ['field' => $sortField, 'direction' => $sortDirection]);

    // Pagination
    $perPage = $filters['per_page'] ?? $filters['perPage'] ?? 20;
    $perPage = max(1, min(100, (int)$perPage));
    Log::emergency('📄 Pagination', ['per_page' => $perPage]);

    $sql = $query->toSql();
    $bindings = $query->getBindings();
    Log::emergency('📊 FINAL SQL', ['sql' => $sql, 'bindings' => $bindings]);

    $result = $query->paginate($perPage);

    Log::emergency('✅ QUERY RESULTS', [
      'total' => $result->total(),
      'count' => $result->count(),
      'per_page' => $result->perPage(),
      'current_page' => $result->currentPage(),
      'last_page' => $result->lastPage()
    ]);

    return $result;
  }

  /**
   * Get all users with formatted role labels.
   */
  public function getAllUsersWithRoleLabels(array $filters = [])
  {
    $users = $this->getAllUsers($filters);

    // Transform users to include role labels
    $users->getCollection()->transform(function ($user) {
      $primaryRole = $user->roles()->first();
      $user->role_label = $primaryRole ? ($primaryRole->label ?? $this->formatRoleName($primaryRole->name)) : null;
      $user->role_description = $primaryRole ? $primaryRole->description : null;
      return $user;
    });

    return $users;
  }

  /**
   * Format role name to human-readable label.
   */
  protected function formatRoleName(string $name): string
  {
    return ucfirst(str_replace('_', ' ', $name));
  }

  /**
   * Get user by ID with all relationships.
   */
  public function getUserById(int $id, bool $withTrashed = false): ?User
  {
    Log::emergency('🔍 getUserById', ['user_id' => $id, 'withTrashed' => $withTrashed]);

    $query = User::with([
      'department',
      'roles',
      'roles.permissions',
      'permissions',
      'profile'
    ]);

    if ($withTrashed) {
      $query->withTrashed();
    }

    $user = $query->find($id);
    Log::emergency('✅ getUserById result', ['found' => $user ? true : false]);
    return $user;
  }

  /**
   * Get user by ID with formatted role information.
   */
  public function getUserWithRoleInfo(int $id, bool $withTrashed = false): ?array
  {
    $user = $this->getUserById($id, $withTrashed);
    if (!$user) {
      return null;
    }

    $primaryRole = $user->roles()->first();
    $allRoles = $user->roles()->get()->map(function ($role) {
      return [
        'id' => $role->id,
        'name' => $role->name,
        'label' => $role->label ?? $this->formatRoleName($role->name),
        'description' => $role->description,
        'guard_name' => $role->guard_name,
      ];
    });

    return [
      'user' => $user,
      'primary_role' => $primaryRole ? [
        'id' => $primaryRole->id,
        'name' => $primaryRole->name,
        'label' => $primaryRole->label ?? $this->formatRoleName($primaryRole->name),
        'description' => $primaryRole->description,
      ] : null,
      'all_roles' => $allRoles,
      'role_names' => $user->getRoleNames(),
      'permissions' => $user->getAllPermissions()->pluck('name'),
    ];
  }

  /**
   * Get user by email.
   */
  public function getUserByEmail(string $email): ?User
  {
    return User::where('email', $email)->first();
  }

  /**
   * Create a new user.
   */
  public function createUser(array $data): User
  {
    return DB::transaction(function () use ($data) {
      $user = User::create([
        'first_name' => $data['first_name'],
        'last_name' => $data['last_name'],
        'email' => $data['email'],
        'phone' => $data['phone'] ?? null,
        'id_number' => $data['id_number'] ?? null,
        'date_of_birth' => $data['date_of_birth'] ?? null,
        'password' => Hash::make($data['password']),
        'department_id' => $data['department_id'] ?? null,
        'is_active' => true,
        'is_approved' => $data['is_approved'] ?? false,
        'timezone' => $data['timezone'] ?? 'Africa/Nairobi',
      ]);

      // Assign role by name or label
      if (isset($data['role'])) {
        $role = $this->findRole($data['role']);
        if ($role) {
          $user->assignRole($role);
        }
      }

      // Assign multiple roles if provided
      if (isset($data['roles']) && is_array($data['roles'])) {
        foreach ($data['roles'] as $roleName) {
          $role = $this->findRole($roleName);
          if ($role) {
            $user->assignRole($role);
          }
        }
      }

      UserProfile::create([
        'user_id' => $user->id,
        'country' => 'Kenya',
      ]);

      $this->logUserActivity($user, 'CREATED', 'User created by admin');

      return $user;
    });
  }

  /**
   * Find role by name or label.
   */
  protected function findRole(string $roleNameOrLabel): ?Role
  {
    return Role::where('name', $roleNameOrLabel)
      ->orWhere('label', $roleNameOrLabel)
      ->first();
  }

  /**
   * Update a user.
   */
  public function updateUser(int $id, array $data): User
  {
    $user = User::findOrFail($id);

    $user->update([
      'first_name' => $data['first_name'] ?? $user->first_name,
      'last_name' => $data['last_name'] ?? $user->last_name,
      'phone' => $data['phone'] ?? $user->phone,
      'id_number' => $data['id_number'] ?? $user->id_number,
      'date_of_birth' => $data['date_of_birth'] ?? $user->date_of_birth,
      'department_id' => $data['department_id'] ?? $user->department_id,
      'timezone' => $data['timezone'] ?? $user->timezone,
    ]);

    // Update role by name or label
    if (isset($data['role'])) {
      $role = $this->findRole($data['role']);
      if ($role) {
        $user->syncRoles([$role]);
      }
    }

    // Update multiple roles
    if (isset($data['roles']) && is_array($data['roles'])) {
      $roles = [];
      foreach ($data['roles'] as $roleName) {
        $role = $this->findRole($roleName);
        if ($role) {
          $roles[] = $role;
        }
      }
      if (!empty($roles)) {
        $user->syncRoles($roles);
      }
    }

    $this->logUserActivity($user, 'UPDATED', 'User updated by admin');

    return $user->fresh();
  }

  /**
   * Approve a user.
   */
  public function approveUser(int $id): User
  {
    Log::emergency('🔍 UserManagementService::approveUser', ['user_id' => $id]);

    $user = User::findOrFail($id);

    $user->update([
      'is_approved' => true,
      'approved_at' => now(),
      'approved_by' => auth()->id(),
      'rejection_reason' => null,
    ]);

    Log::emergency('✅ User approved', ['user_id' => $id, 'approved_by' => auth()->id()]);

    $this->logUserActivity($user, 'APPROVED', 'User approved by admin');

    return $user;
  }

  /**
   * Reject a user.
   */
  public function rejectUser(int $id, string $reason): User
  {
    Log::emergency('🔍 UserManagementService::rejectUser', ['user_id' => $id, 'reason' => $reason]);

    $user = User::findOrFail($id);

    $user->update([
      'is_approved' => false,
      'rejection_reason' => $reason,
      'approved_at' => null,
      'approved_by' => null,
    ]);

    Log::emergency('✅ User rejected', ['user_id' => $id]);

    $this->logUserActivity($user, 'REJECTED', 'User rejected by admin: ' . $reason);

    return $user;
  }

  /**
   * Activate a user.
   */
  public function activateUser(int $id): User
  {
    Log::emergency('🔍 UserManagementService::activateUser', ['user_id' => $id]);

    $user = User::findOrFail($id);
    $user->update(['is_active' => true]);

    Log::emergency('✅ User activated', ['user_id' => $id]);

    $this->logUserActivity($user, 'ACTIVATED', 'User activated by admin');

    return $user;
  }

  /**
   * Deactivate a user.
   */
  public function deactivateUser(int $id): User
  {
    Log::emergency('🔍 UserManagementService::deactivateUser', ['user_id' => $id]);

    $user = User::findOrFail($id);
    $user->update(['is_active' => false]);

    Log::emergency('✅ User deactivated', ['user_id' => $id]);

    $this->logUserActivity($user, 'DEACTIVATED', 'User deactivated by admin');

    return $user;
  }

  /**
   * Soft delete a user (sets deleted_at timestamp).
   */
  public function deleteUser(int $id): void
  {
    Log::emergency('🔍 UserManagementService::deleteUser (soft delete)', ['user_id' => $id]);

    $user = User::findOrFail($id);
    $user->delete();

    Log::emergency('✅ User soft deleted', [
      'user_id' => $id,
      'deleted_at' => $user->deleted_at
    ]);

    $this->logUserActivity($user, 'SOFT_DELETED', 'User soft deleted by admin');
  }

  /**
   * Restore a soft-deleted user.
   */
  public function restoreUser(int $id): User
  {
    Log::emergency('🔍 UserManagementService::restoreUser', ['user_id' => $id]);

    $user = User::withTrashed()->findOrFail($id);
    $user->restore();

    Log::emergency('✅ User restored', [
      'user_id' => $id,
      'restored_at' => now()
    ]);

    $this->logUserActivity($user, 'RESTORED', 'User restored by admin');

    return $user;
  }

  /**
   * Permanently delete a user (force delete).
   */
  public function forceDeleteUser(int $id): void
  {
    Log::emergency('🔍 UserManagementService::forceDeleteUser', ['user_id' => $id]);

    $user = User::withTrashed()->findOrFail($id);

    // Delete related records
    $user->profile()->delete();
    $user->sessions()->delete();
    $user->activityLogs()->delete();
    $user->roles()->detach();

    // Force delete
    $user->forceDelete();

    Log::emergency('✅ User permanently deleted', ['user_id' => $id]);

    UserActivityLog::create([
      'user_id' => auth()->id(),
      'action' => 'FORCE_DELETED',
      'module' => 'USER',
      'description' => 'User permanently deleted by admin',
      'data' => ['deleted_user_id' => $id],
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }

  /**
   * Reset user password.
   */
  public function resetPassword(int $id, string $newPassword): User
  {
    Log::emergency('🔍 UserManagementService::resetPassword', ['user_id' => $id]);

    $user = User::findOrFail($id);
    $user->update(['password' => Hash::make($newPassword)]);

    Log::emergency('✅ Password reset', ['user_id' => $id]);

    $this->logUserActivity($user, 'PASSWORD_RESET', 'Password reset by admin');

    return $user;
  }

  /**
   * Get pending users (awaiting approval).
   */
  public function getPendingUsers()
  {
    return User::where('is_approved', false)
      ->where('is_active', true)
      ->with(['department', 'profile', 'roles'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->map(function ($user) {
        $primaryRole = $user->roles()->first();
        $user->role_label = $primaryRole ? ($primaryRole->label ?? $this->formatRoleName($primaryRole->name)) : null;
        return $user;
      });
  }

  /**
   * Get recent users.
   */
  public function getRecentUsers(int $limit = 10)
  {
    return User::with(['department', 'roles'])
      ->orderBy('created_at', 'desc')
      ->limit($limit)
      ->get()
      ->map(function ($user) {
        $primaryRole = $user->roles()->first();
        $user->role_label = $primaryRole ? ($primaryRole->label ?? $this->formatRoleName($primaryRole->name)) : null;
        return $user;
      });
  }

  /**
   * Get user statistics.
   */
  public function getUserStats(): array
  {
    Log::emergency('📊 UserManagementService::getUserStats');

    $total = User::count();
    $active = User::where('is_active', true)->count();
    $inactive = User::where('is_active', false)->count();
    $pending = User::where('is_approved', false)->count();
    $approved = User::where('is_approved', true)->count();
    $deleted = User::onlyTrashed()->count();

    // Get counts by role with labels
    $roles = Role::withCount('users')->get()->mapWithKeys(function ($role) {
      return [
        $role->name => [
          'count' => $role->users_count,
          'label' => $role->label ?? $this->formatRoleName($role->name),
          'description' => $role->description,
        ]
      ];
    })->toArray();

    // Get counts by department
    $departments = User::whereNotNull('department_id')
      ->selectRaw('department_id, count(*) as count')
      ->groupBy('department_id')
      ->with('department')
      ->get()
      ->mapWithKeys(function ($item) {
        return [$item->department->name => $item->count];
      })
      ->toArray();

    $stats = [
      'total' => $total,
      'active' => $active,
      'inactive' => $inactive,
      'pending' => $pending,
      'approved' => $approved,
      'deleted' => $deleted,
      'by_role' => $roles,
      'by_department' => $departments,
    ];

    Log::emergency('✅ User stats', $stats);

    return $stats;
  }

  /**
   * Get users by role.
   */
  public function getUsersByRole(string $roleNameOrLabel)
  {
    $role = $this->findRole($roleNameOrLabel);
    if (!$role) {
      return collect();
    }

    return User::whereHas('roles', function ($query) use ($role) {
      $query->where('id', $role->id);
    })
      ->with(['department', 'profile'])
      ->get()
      ->map(function ($user) use ($role) {
        $user->role_label = $role->label ?? $this->formatRoleName($role->name);
        $user->role_description = $role->description;
        return $user;
      });
  }

  /**
   * Bulk action on users.
   */
  public function bulkAction(array $userIds, string $action, array $data = []): array
  {
    Log::emergency('🔍 UserManagementService::bulkAction', [
      'user_ids' => $userIds,
      'action' => $action,
      'data' => $data
    ]);

    $results = [
      'success' => [],
      'failed' => [],
    ];

    foreach ($userIds as $userId) {
      try {
        switch ($action) {
          case 'activate':
            $this->activateUser($userId);
            $results['success'][] = $userId;
            break;
          case 'deactivate':
            $this->deactivateUser($userId);
            $results['success'][] = $userId;
            break;
          case 'approve':
            $this->approveUser($userId);
            $results['success'][] = $userId;
            break;
          case 'delete':
            $this->deleteUser($userId);
            $results['success'][] = $userId;
            break;
          case 'restore':
            $this->restoreUser($userId);
            $results['success'][] = $userId;
            break;
          case 'force_delete':
            $this->forceDeleteUser($userId);
            $results['success'][] = $userId;
            break;
          case 'assign_role':
            if (isset($data['role'])) {
              $user = User::find($userId);
              if ($user) {
                $role = $this->findRole($data['role']);
                if ($role) {
                  $user->syncRoles([$role]);
                  $results['success'][] = $userId;
                }
              }
            }
            break;
          case 'assign_roles':
            if (isset($data['roles']) && is_array($data['roles'])) {
              $user = User::find($userId);
              if ($user) {
                $roles = [];
                foreach ($data['roles'] as $roleName) {
                  $role = $this->findRole($roleName);
                  if ($role) {
                    $roles[] = $role;
                  }
                }
                if (!empty($roles)) {
                  $user->syncRoles($roles);
                  $results['success'][] = $userId;
                }
              }
            }
            break;
          default:
            $results['failed'][] = $userId;
        }
      } catch (\Exception $e) {
        Log::error('❌ Bulk action failed for user', ['user_id' => $userId, 'error' => $e->getMessage()]);
        $results['failed'][] = $userId;
      }
    }

    Log::emergency('✅ Bulk action completed', [
      'success_count' => count($results['success']),
      'failed_count' => count($results['failed'])
    ]);

    return $results;
  }

  /**
   * Log user activity.
   */
  protected function logUserActivity(User $user, string $action, string $description): void
  {
    try {
      UserActivityLog::create([
        'user_id' => $user->id,
        'action' => $action,
        'module' => 'USER',
        'description' => $description,
        'data' => ['performed_by' => auth()->id()],
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);
    } catch (\Exception $e) {
      Log::warning('Failed to log user activity', ['error' => $e->getMessage()]);
    }
  }

  /**
   * Get available roles for dropdown.
   */
  public function getAvailableRoles()
  {
    return Role::all()->map(function ($role) {
      return [
        'id' => $role->id,
        'name' => $role->name,
        'label' => $role->label ?? $this->formatRoleName($role->name),
        'description' => $role->description,
      ];
    });
  }

  /**
   * Get user's role information.
   */
  public function getUserRoleInfo(int $userId): ?array
  {
    $user = User::find($userId);
    if (!$user) {
      return null;
    }

    $primaryRole = $user->roles()->first();
    if (!$primaryRole) {
      return [
        'has_role' => false,
        'role' => null,
      ];
    }

    return [
      'has_role' => true,
      'role' => [
        'id' => $primaryRole->id,
        'name' => $primaryRole->name,
        'label' => $primaryRole->label ?? $this->formatRoleName($primaryRole->name),
        'description' => $primaryRole->description,
        'permissions' => $primaryRole->permissions->pluck('name')->toArray(),
      ],
      'all_roles' => $user->getRoleNames()->toArray(),
      'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
    ];
  }
}
