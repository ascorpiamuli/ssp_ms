<?php

namespace App\Services\Admin;

use App\Services\BaseService;
use App\Models\User;
use App\Models\UserActivityLog;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class RoleService extends BaseService
{
  /**
   * Get all roles.
   */
  public function getAllRoles(array $filters = [])
  {
    $query = Role::with('permissions');

    if (isset($filters['search'])) {
      $query->where('name', 'LIKE', "%{$filters['search']}%");
    }

    return $query->orderBy('name')->get();
  }

  /**
   * Get role by ID.
   */
  public function getRoleById(int $id): ?Role
  {
    return Role::with('permissions')->find($id);
  }

  /**
   * Get role by name.
   */
  public function getRoleByName(string $name): ?Role
  {
    return Role::where('name', $name)->first();
  }

  /**
   * Create a new role.
   */
  public function createRole(array $data): Role
  {
    return DB::transaction(function () use ($data) {
      $role = Role::create([
        'name' => $data['name'],
        'guard_name' => 'api',
      ]);

      // Assign permissions if provided
      if (isset($data['permissions'])) {
        $role->syncPermissions($data['permissions']);
      }

      // Log activity
      $this->logActivity($role, 'CREATED', 'Role created');

      return $role;
    });
  }

  /**
   * Update a role.
   */
  public function updateRole(int $id, array $data): Role
  {
    $role = Role::findOrFail($id);

    $role->update([
      'name' => $data['name'] ?? $role->name,
    ]);

    // Sync permissions
    if (isset($data['permissions'])) {
      $role->syncPermissions($data['permissions']);
    }

    // Log activity
    $this->logActivity($role, 'UPDATED', 'Role updated');

    return $role->fresh();
  }

  /**
   * Delete a role.
   */
  public function deleteRole(int $id): void
  {
    $role = Role::findOrFail($id);

    // Check if role has users
    $usersCount = User::role($role->name)->count();
    if ($usersCount > 0) {
      throw new \Exception("Cannot delete role '{$role->name}' because it has {$usersCount} users assigned.");
    }

    // Log activity
    $this->logActivity($role, 'DELETED', 'Role deleted');

    $role->delete();
  }

  /**
   * Assign permissions to role.
   */
  public function assignPermissions(int $roleId, array $permissions): Role
  {
    $role = Role::findOrFail($roleId);
    $role->syncPermissions($permissions);

    $this->logActivity($role, 'PERMISSIONS_ASSIGNED', 'Permissions assigned to role');

    return $role->fresh();
  }

  /**
   * Get all permissions.
   */
  public function getAllPermissions()
  {
    return Permission::orderBy('name')->get();
  }

  /**
   * Get permissions grouped by module.
   */
  public function getPermissionsGrouped()
  {
    $permissions = Permission::orderBy('name')->get();

    $grouped = [];
    foreach ($permissions as $permission) {
      $module = explode('_', $permission->name)[0] ?? 'general';
      if (!isset($grouped[$module])) {
        $grouped[$module] = [];
      }
      $grouped[$module][] = $permission;
    }

    return $grouped;
  }

  /**
   * Create a permission.
   */
  public function createPermission(string $name): Permission
  {
    $permission = Permission::create([
      'name' => $name,
      'guard_name' => 'api',
    ]);

    $this->logActivity($permission, 'PERMISSION_CREATED', 'Permission created: ' . $name);

    return $permission;
  }

  /**
   * Get users assigned to a role.
   */
  public function getRoleUsers(int $roleId)
  {
    $role = Role::findOrFail($roleId);
    return User::role($role->name)->with(['department', 'profile'])->get();
  }

  /**
   * Get role statistics.
   */
  public function getRoleStats(): array
  {
    $roles = Role::withCount('users')->get();

    return [
      'total' => Role::count(),
      'roles' => $roles->map(function ($role) {
        return [
          'name' => $role->name,
          'users_count' => $role->users_count,
          'permissions_count' => $role->permissions->count(),
        ];
      }),
      'total_permissions' => Permission::count(),
    ];
  }

  /**
   * Get user's roles and permissions.
   */
  public function getUserRolesAndPermissions(int $userId): array
  {
    $user = User::with('roles.permissions')->findOrFail($userId);

    return [
      'user' => $user,
      'roles' => $user->getRoleNames(),
      'permissions' => $user->getAllPermissions()->pluck('name'),
      'direct_permissions' => $user->getDirectPermissions()->pluck('name'),
    ];
  }

  /**
   * Assign role to user.
   */
  public function assignRoleToUser(int $userId, string $roleName): void
  {
    $user = User::findOrFail($userId);
    $role = Role::where('name', $roleName)->firstOrFail();

    // Remove all existing roles and assign only this one
    $user->syncRoles([$role]);

    // Update user's role field
    $user->update(['role' => $roleName]);

    // Log activity
    UserActivityLog::create([
      'user_id' => auth()->id(),
      'action' => 'ROLE_ASSIGNED',
      'module' => 'ROLE',
      'description' => "Role '{$roleName}' assigned to user {$user->email}",
      'data' => ['user_id' => $userId, 'role' => $roleName],
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }

  /**
   * Assign multiple roles to user.
   */
  public function assignRolesToUser(int $userId, array $roleNames): void
  {
    $user = User::findOrFail($userId);
    $roles = Role::whereIn('name', $roleNames)->get();

    $user->syncRoles($roles);

    // Update user's role field (use first role as primary)
    if (!empty($roleNames)) {
      $user->update(['role' => $roleNames[0]]);
    }

    UserActivityLog::create([
      'user_id' => auth()->id(),
      'action' => 'ROLES_ASSIGNED',
      'module' => 'ROLE',
      'description' => "Roles assigned to user {$user->email}: " . implode(', ', $roleNames),
      'data' => ['user_id' => $userId, 'roles' => $roleNames],
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }

  /**
   * Remove role from user.
   */
  public function removeRoleFromUser(int $userId, string $roleName): void
  {
    $user = User::findOrFail($userId);
    $user->removeRole($roleName);

    // Update user's role field if it matches
    if ($user->role === $roleName) {
      $newRole = $user->roles->first();
      $user->update(['role' => $newRole->name ?? 'STAFF']);
    }

    UserActivityLog::create([
      'user_id' => auth()->id(),
      'action' => 'ROLE_REMOVED',
      'module' => 'ROLE',
      'description' => "Role '{$roleName}' removed from user {$user->email}",
      'data' => ['user_id' => $userId, 'role' => $roleName],
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }

  /**
   * Log activity.
   */
  protected function logActivity($model, string $action, string $description): void
  {
    UserActivityLog::create([
      'user_id' => auth()->id(),
      'action' => $action,
      'module' => 'ROLE',
      'description' => $description . ' - ' . ($model->name ?? $model->id),
      'data' => ['model' => get_class($model), 'id' => $model->id],
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
