<?php

namespace App\Services\Admin;

use App\Services\BaseService;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class UserManagementService extends BaseService
{
  /**
   * Get all users with filters.
   */
  public function getAllUsers(array $filters = [])
  {
    $query = User::with(['department', 'roles', 'profile']);

    // Search filter
    if (isset($filters['search'])) {
      $query->where(function ($q) use ($filters) {
        $q->where('first_name', 'LIKE', "%{$filters['search']}%")
          ->orWhere('last_name', 'LIKE', "%{$filters['search']}%")
          ->orWhere('email', 'LIKE', "%{$filters['search']}%")
          ->orWhere('phone', 'LIKE', "%{$filters['search']}%");
      });
    }

    // Role filter
    if (isset($filters['role'])) {
      $query->whereHas('roles', function ($q) use ($filters) {
        $q->where('name', $filters['role']);
      });
    }

    // Department filter
    if (isset($filters['department_id'])) {
      $query->where('department_id', $filters['department_id']);
    }

    // Status filter
    if (isset($filters['status'])) {
      if ($filters['status'] === 'active') {
        $query->where('is_active', true);
      } elseif ($filters['status'] === 'inactive') {
        $query->where('is_active', false);
      } elseif ($filters['status'] === 'pending') {
        $query->where('is_approved', false);
      } elseif ($filters['status'] === 'approved') {
        $query->where('is_approved', true);
      }
    }

    // Sort
    $sortField = $filters['sort_by'] ?? 'created_at';
    $sortDirection = $filters['sort_direction'] ?? 'desc';
    $query->orderBy($sortField, $sortDirection);

    return $query->paginate($filters['per_page'] ?? 20);
  }

  /**
   * Get user by ID.
   */
  public function getUserById(int $id): ?User
  {
    return User::with(['department', 'roles', 'profile'])->find($id);
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
      // Create user
      $user = User::create([
        'first_name' => $data['first_name'],
        'last_name' => $data['last_name'],
        'email' => $data['email'],
        'phone' => $data['phone'] ?? null,
        'id_number' => $data['id_number'] ?? null,
        'date_of_birth' => $data['date_of_birth'] ?? null,
        'password' => Hash::make($data['password']),
        'department_id' => $data['department_id'] ?? null,
        'role' => $data['role'],
        'is_active' => true,
        'is_approved' => $data['is_approved'] ?? false,
        'timezone' => $data['timezone'] ?? 'Africa/Nairobi',
      ]);

      // Assign role
      if (isset($data['role'])) {
        $role = Role::where('name', $data['role'])->first();
        if ($role) {
          $user->assignRole($role);
        }
      }

      // Create profile
      UserProfile::create([
        'user_id' => $user->id,
        'country' => 'Kenya',
      ]);

      // Log activity
      $this->logUserActivity($user, 'CREATED', 'User created by admin');

      return $user;
    });
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

    // Update role if changed
    if (isset($data['role']) && $data['role'] !== $user->role) {
      $user->role = $data['role'];
      $user->save();

      // Sync roles
      $role = Role::where('name', $data['role'])->first();
      if ($role) {
        $user->syncRoles([$role]);
      }
    }

    // Log activity
    $this->logUserActivity($user, 'UPDATED', 'User updated by admin');

    return $user->fresh();
  }

  /**
   * Approve a user.
   */
  public function approveUser(int $id): User
  {
    $user = User::findOrFail($id);

    $user->update([
      'is_approved' => true,
      'approved_at' => now(),
      'approved_by' => auth()->id(),
      'rejection_reason' => null,
    ]);

    $this->logUserActivity($user, 'APPROVED', 'User approved by admin');

    return $user;
  }

  /**
   * Reject a user.
   */
  public function rejectUser(int $id, string $reason): User
  {
    $user = User::findOrFail($id);

    $user->update([
      'is_approved' => false,
      'rejection_reason' => $reason,
      'approved_at' => null,
      'approved_by' => null,
    ]);

    $this->logUserActivity($user, 'REJECTED', 'User rejected by admin: ' . $reason);

    return $user;
  }

  /**
   * Activate a user.
   */
  public function activateUser(int $id): User
  {
    $user = User::findOrFail($id);
    $user->update(['is_active' => true]);

    $this->logUserActivity($user, 'ACTIVATED', 'User activated by admin');

    return $user;
  }

  /**
   * Deactivate a user.
   */
  public function deactivateUser(int $id): User
  {
    $user = User::findOrFail($id);
    $user->update(['is_active' => false]);

    $this->logUserActivity($user, 'DEACTIVATED', 'User deactivated by admin');

    return $user;
  }

  /**
   * Delete a user (soft delete - deactivate).
   */
  public function deleteUser(int $id): void
  {
    $user = User::findOrFail($id);
    $user->update(['is_active' => false]);

    $this->logUserActivity($user, 'DELETED', 'User deleted by admin');
  }

  /**
   * Permanently delete a user.
   */
  public function forceDeleteUser(int $id): void
  {
    $user = User::findOrFail($id);

    // Delete related records
    $user->profile()->delete();
    $user->sessions()->delete();
    $user->activityLogs()->delete();

    // Delete the user
    $user->delete();

    // Log activity (by system)
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
    $user = User::findOrFail($id);
    $user->update(['password' => Hash::make($newPassword)]);

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
      ->with(['department', 'profile'])
      ->orderBy('created_at', 'desc')
      ->get();
  }

  /**
   * Get recent users.
   */
  public function getRecentUsers(int $limit = 10)
  {
    return User::with(['department', 'roles'])
      ->orderBy('created_at', 'desc')
      ->limit($limit)
      ->get();
  }

  /**
   * Get user statistics.
   */
  public function getUserStats(): array
  {
    $total = User::count();
    $active = User::where('is_active', true)->count();
    $inactive = User::where('is_active', false)->count();
    $pending = User::where('is_approved', false)->count();
    $approved = User::where('is_approved', true)->count();

    // Get counts by role
    $roles = Role::withCount('users')->get()->mapWithKeys(function ($role) {
      return [$role->name => $role->users_count];
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

    return [
      'total' => $total,
      'active' => $active,
      'inactive' => $inactive,
      'pending' => $pending,
      'approved' => $approved,
      'by_role' => $roles,
      'by_department' => $departments,
    ];
  }

  /**
   * Bulk action on users.
   */
  public function bulkAction(array $userIds, string $action, array $data = []): array
  {
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
          case 'assign_role':
            if (isset($data['role'])) {
              $user = User::find($userId);
              if ($user) {
                $role = Role::where('name', $data['role'])->first();
                if ($role) {
                  $user->syncRoles([$role]);
                  $user->update(['role' => $data['role']]);
                  $results['success'][] = $userId;
                }
              }
            }
            break;
          default:
            $results['failed'][] = $userId;
        }
      } catch (\Exception $e) {
        $results['failed'][] = $userId;
      }
    }

    return $results;
  }

  /**
   * Log user activity.
   */
  protected function logUserActivity(User $user, string $action, string $description): void
  {
    UserActivityLog::create([
      'user_id' => $user->id,
      'action' => $action,
      'module' => 'USER',
      'description' => $description,
      'data' => ['performed_by' => auth()->id()],
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
