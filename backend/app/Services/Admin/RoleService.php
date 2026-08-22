<?php

namespace App\Services\Admin;

use App\Services\BaseService;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoleService extends BaseService
{
  protected $auditLogService;

  public function __construct(AuditLogService $auditLogService)
  {
    $this->auditLogService = $auditLogService;
  }

  /**
   * Get all roles with their permissions.
   */
  public function getAllRoles()
  {
    Log::info('🔍 RoleService::getAllRoles - Fetching all roles');

    try {
      $roles = Role::with('permissions')->get();

      Log::info('✅ RoleService::getAllRoles - Roles fetched successfully', [
        'count' => $roles->count()
      ]);

      return $roles;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getAllRoles - Error fetching roles', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Get all roles with their labels and descriptions formatted for display.
   */
  public function getAllRolesWithLabels()
  {
    Log::info('🔍 RoleService::getAllRolesWithLabels - Fetching all roles with labels');

    try {
      $roles = Role::with('permissions')->get()->map(function ($role) {
        return [
          'id' => $role->id,
          'name' => $role->name,
          'label' => $role->label ?? $this->formatRoleName($role->name),
          'description' => $role->description,
          'guard_name' => $role->guard_name,
          'permissions' => $role->permissions->pluck('name')->toArray(),
          'permissions_count' => $role->permissions->count(),
          'created_at' => $role->created_at,
          'updated_at' => $role->updated_at,
        ];
      });

      Log::info('✅ RoleService::getAllRolesWithLabels - Roles with labels fetched successfully', [
        'count' => $roles->count()
      ]);

      return $roles;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getAllRolesWithLabels - Error fetching roles', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Get a single role with its permissions.
   */
  public function getRoleById(int $id)
  {
    Log::info('🔍 RoleService::getRoleById - Fetching role', ['role_id' => $id]);

    try {
      $role = Role::with('permissions')->findOrFail($id);

      Log::info('✅ RoleService::getRoleById - Role fetched successfully', [
        'role_id' => $id,
        'role_name' => $role->name
      ]);

      return $role;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getRoleById - Error fetching role', [
        'role_id' => $id,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Get role with formatted label and description.
   */
  public function getRoleWithLabels(int $id)
  {
    Log::info('🔍 RoleService::getRoleWithLabels - Fetching role with labels', ['role_id' => $id]);

    try {
      $role = Role::with('permissions')->findOrFail($id);

      $formattedRole = [
        'id' => $role->id,
        'name' => $role->name,
        'label' => $role->label ?? $this->formatRoleName($role->name),
        'description' => $role->description,
        'guard_name' => $role->guard_name,
        'permissions' => $role->permissions->pluck('name')->toArray(),
        'permissions_count' => $role->permissions->count(),
        'created_at' => $role->created_at,
        'updated_at' => $role->updated_at,
      ];

      Log::info('✅ RoleService::getRoleWithLabels - Role with labels fetched successfully', [
        'role_id' => $id,
        'role_label' => $formattedRole['label']
      ]);

      return $formattedRole;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getRoleWithLabels - Error fetching role', [
        'role_id' => $id,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Format role name to a human-readable label.
   */
  protected function formatRoleName(string $name): string
  {
    return ucfirst(str_replace('_', ' ', $name));
  }

  /**
   * Get role statistics.
   */
  public function getRoleStats()
  {
    Log::info('🔍 RoleService::getRoleStats - Fetching role statistics');

    try {
      $stats = [
        'total_roles' => Role::count(),
        'total_permissions' => Permission::count(),
        'roles_with_users' => 0,
        'roles_without_users' => 0,
        'permissions_per_role' => [],
        'roles_with_labels' => 0,
        'roles_without_labels' => 0,
      ];

      $roles = Role::withCount('permissions')->get();
      $roleIds = $roles->pluck('id')->toArray();

      // Count roles with/without labels
      $stats['roles_with_labels'] = $roles->filter(function ($role) {
        return !empty($role->label);
      })->count();
      $stats['roles_without_labels'] = $roles->count() - $stats['roles_with_labels'];

      if (!empty($roleIds)) {
        $userCounts = DB::table('model_has_roles')
          ->whereIn('role_id', $roleIds)
          ->where('model_type', 'App\\Models\\User')
          ->select('role_id', DB::raw('count(*) as user_count'))
          ->groupBy('role_id')
          ->get()
          ->pluck('user_count', 'role_id')
          ->toArray();

        $rolesWithUsers = count($userCounts);
        $rolesWithoutUsers = $roles->count() - $rolesWithUsers;

        $stats['roles_with_users'] = $rolesWithUsers;
        $stats['roles_without_users'] = $rolesWithoutUsers;

        foreach ($roles as $role) {
          $stats['permissions_per_role'][$role->name] = [
            'label' => $role->label ?? $this->formatRoleName($role->name),
            'permission_count' => $role->permissions_count,
            'user_count' => $userCounts[$role->id] ?? 0,
          ];
        }
      } else {
        $stats['roles_without_users'] = $roles->count();
      }

      Log::info('✅ RoleService::getRoleStats - Statistics fetched successfully', $stats);

      return $stats;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getRoleStats - Error fetching statistics', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Create a new role.
   */
  public function createRole(array $data)
  {
    Log::info('🔍 RoleService::createRole - Creating new role', ['data' => $data]);

    try {
      DB::beginTransaction();

      $role = Role::create([
        'name' => $data['name'],
        'label' => $data['label'] ?? null,
        'description' => $data['description'] ?? null,
        'guard_name' => $data['guard_name'] ?? 'api',
      ]);

      if (isset($data['permissions']) && !empty($data['permissions'])) {
        $role->syncPermissions($data['permissions']);

        $this->auditLogService->log([
          'action' => 'role_created_with_permissions',
          'module' => 'roles',
          'description' => 'Role "' . ($role->label ?? $role->name) . '" created with ' . count($data['permissions']) . ' permissions',
          'entity_type' => get_class($role),
          'entity_id' => $role->id,
          'new_values' => [
            'name' => $role->name,
            'label' => $role->label,
            'description' => $role->description,
            'permissions' => $data['permissions']
          ],
          'metadata' => [
            'permission_count' => count($data['permissions'])
          ]
        ]);
      } else {
        $this->auditLogService->log([
          'action' => 'role_created',
          'module' => 'roles',
          'description' => 'Role "' . ($role->label ?? $role->name) . '" created',
          'entity_type' => get_class($role),
          'entity_id' => $role->id,
          'new_values' => [
            'name' => $role->name,
            'label' => $role->label,
            'description' => $role->description,
          ],
        ]);
      }

      DB::commit();

      Log::info('✅ RoleService::createRole - Role created successfully', [
        'role_id' => $role->id,
        'role_name' => $role->name,
        'role_label' => $role->label
      ]);

      return $role->load('permissions');
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('❌ RoleService::createRole - Error creating role', [
        'error' => $e->getMessage(),
        'data' => $data
      ]);
      throw $e;
    }
  }

  /**
   * Update a role.
   */
  public function updateRole(int $id, array $data)
  {
    Log::info('🔍 RoleService::updateRole - Updating role', [
      'role_id' => $id,
      'data' => $data
    ]);

    try {
      DB::beginTransaction();

      $role = Role::findOrFail($id);
      $oldName = $role->name;
      $oldLabel = $role->label;
      $oldDescription = $role->description;
      $oldPermissions = $role->permissions->pluck('name')->toArray();

      // Update role attributes
      $role->update([
        'name' => $data['name'] ?? $role->name,
        'label' => $data['label'] ?? $role->label,
        'description' => $data['description'] ?? $role->description,
        'guard_name' => $data['guard_name'] ?? $role->guard_name,
      ]);

      // Log role name change
      if ($oldName !== $role->name) {
        $this->auditLogService->log([
          'action' => 'role_renamed',
          'module' => 'roles',
          'description' => 'Role renamed from "' . $oldName . '" to "' . $role->name . '"',
          'entity_type' => get_class($role),
          'entity_id' => $role->id,
          'old_values' => ['name' => $oldName],
          'new_values' => ['name' => $role->name],
        ]);
      }

      // Log role label change
      if ($oldLabel !== $role->label) {
        $this->auditLogService->log([
          'action' => 'role_label_updated',
          'module' => 'roles',
          'description' => 'Role label updated from "' . ($oldLabel ?? 'N/A') . '" to "' . ($role->label ?? 'N/A') . '" for role "' . $role->name . '"',
          'entity_type' => get_class($role),
          'entity_id' => $role->id,
          'old_values' => ['label' => $oldLabel],
          'new_values' => ['label' => $role->label],
        ]);
      }

      // Log role description change
      if ($oldDescription !== $role->description) {
        $this->auditLogService->log([
          'action' => 'role_description_updated',
          'module' => 'roles',
          'description' => 'Role description updated for role "' . $role->name . '"',
          'entity_type' => get_class($role),
          'entity_id' => $role->id,
          'old_values' => ['description' => $oldDescription],
          'new_values' => ['description' => $role->description],
        ]);
      }

      // Update permissions if provided
      if (isset($data['permissions'])) {
        $role->syncPermissions($data['permissions']);
        $newPermissions = $role->permissions->pluck('name')->toArray();
        $this->logPermissionChanges($role, $oldPermissions, $newPermissions);
      }

      DB::commit();

      Log::info('✅ RoleService::updateRole - Role updated successfully', [
        'role_id' => $id,
        'role_name' => $role->name,
        'role_label' => $role->label
      ]);

      return $role->load('permissions');
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('❌ RoleService::updateRole - Error updating role', [
        'role_id' => $id,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Delete a role.
   */
  public function deleteRole(int $id)
  {
    Log::info('🔍 RoleService::deleteRole - Deleting role', ['role_id' => $id]);

    try {
      DB::beginTransaction();

      $role = Role::findOrFail($id);

      // Check if role has users
      $userCount = DB::table('model_has_roles')
        ->where('role_id', $id)
        ->where('model_type', 'App\\Models\\User')
        ->count();

      if ($userCount > 0) {
        throw new \Exception('Cannot delete role with assigned users. Please remove users from this role first.');
      }

      // Log before deletion
      $this->auditLogService->log([
        'action' => 'role_deleted',
        'module' => 'roles',
        'description' => 'Role "' . ($role->label ?? $role->name) . '" deleted',
        'entity_type' => get_class($role),
        'entity_id' => $role->id,
        'old_values' => [
          'name' => $role->name,
          'label' => $role->label,
          'description' => $role->description,
          'permissions' => $role->permissions->pluck('name')->toArray()
        ],
        'metadata' => [
          'permission_count' => $role->permissions->count()
        ]
      ]);

      $role->permissions()->detach();
      $role->users()->detach();

      $role->delete();

      DB::commit();

      Log::info('✅ RoleService::deleteRole - Role deleted successfully', [
        'role_id' => $id,
        'role_name' => $role->name
      ]);

      return true;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('❌ RoleService::deleteRole - Error deleting role', [
        'role_id' => $id,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Get all permissions.
   */
  public function getAllPermissions()
  {
    Log::info('🔍 RoleService::getAllPermissions - Fetching all permissions');

    try {
      $permissions = Permission::all();

      Log::info('✅ RoleService::getAllPermissions - Permissions fetched successfully', [
        'count' => $permissions->count()
      ]);

      return $permissions;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getAllPermissions - Error fetching permissions', [
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Get permissions grouped by module.
   */
  public function getPermissionsGrouped()
  {
    Log::info('🔍 RoleService::getPermissionsGrouped - Fetching grouped permissions');

    try {
      $permissions = Permission::all();
      $grouped = [];

      $moduleGroups = [
        'requisition' => 'requisitions',
        'approv' => 'approvals',
        'supplier' => 'suppliers',
        'quotation' => 'quotations',
        'tender' => 'procurement',
        'contract' => 'procurement',
        'purchase_order' => 'orders',
        'purchase_orders' => 'orders',
        'lpo' => 'orders',
        'lso' => 'orders',
        'grn' => 'orders',
        'san' => 'orders',
        'invoice' => 'invoices',
        'payment_voucher' => 'invoices',
        'cheque' => 'invoices',
        'budget' => 'budget',
        'expenditure' => 'budget',
        'report' => 'reports',
        'user' => 'users',
        'department' => 'departments',
        'audit' => 'audit',
        'setting' => 'settings',
        'backup' => 'backup',
        'profile' => 'profile',
        'support' => 'support',
        'hr' => 'hr',
        'asset' => 'assets',
        'facility' => 'facilities',
      ];

      foreach ($permissions as $permission) {
        $foundGroup = 'other';
        $nameLower = strtolower($permission->name);

        foreach ($moduleGroups as $key => $groupName) {
          if (strpos($nameLower, $key) !== false) {
            $foundGroup = $groupName;
            break;
          }
        }

        if (!isset($grouped[$foundGroup])) {
          $grouped[$foundGroup] = [];
        }
        $grouped[$foundGroup][] = $permission;
      }

      Log::info('✅ RoleService::getPermissionsGrouped - Grouped permissions fetched successfully', [
        'group_count' => count($grouped)
      ]);

      return $grouped;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getPermissionsGrouped - Error fetching grouped permissions', [
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Assign permissions to a role.
   */
  public function assignPermissions(int $roleId, array $permissions)
  {
    Log::info('🔍 RoleService::assignPermissions - Assigning permissions to role', [
      'role_id' => $roleId,
      'permissions' => $permissions
    ]);

    try {
      DB::beginTransaction();

      $role = Role::findOrFail($roleId);

      // Get current permissions before update
      $oldPermissions = $role->permissions->pluck('name')->toArray();

      // ✅ FIX: Use the 'web' guard explicitly
      // Convert permission names to permission IDs using the 'web' guard
      $permissionIds = [];
      $validPermissions = [];

      foreach ($permissions as $permissionName) {
        try {
          // ✅ Find permission with 'web' guard
          $permission = \Spatie\Permission\Models\Permission::findByName($permissionName, 'web');
          if ($permission) {
            $permissionIds[] = $permission->id;
            $validPermissions[] = $permissionName;
          }
        } catch (\Exception $e) {
          Log::warning('⚠️ RoleService::assignPermissions - Permission not found', [
            'permission' => $permissionName,
            'error' => $e->getMessage()
          ]);
        }
      }

      if (empty($permissionIds)) {
        Log::warning('⚠️ RoleService::assignPermissions - No valid permissions found', [
          'role_id' => $roleId,
          'permissions' => $permissions,
        ]);
        throw new \Exception('No valid permissions found. Please ensure permissions exist with the correct guard.');
      }

      // ✅ Sync permissions using IDs (this avoids guard issues)
      $role->permissions()->sync($permissionIds);

      // Get new permissions after update
      $newPermissions = $role->permissions->pluck('name')->toArray();

      // Log the permission changes
      $this->logPermissionChanges($role, $oldPermissions, $newPermissions);

      DB::commit();

      Log::info('✅ RoleService::assignPermissions - Permissions assigned successfully', [
        'role_id' => $roleId,
        'role_name' => $role->name,
        'permission_count' => count($validPermissions),
        'valid_permissions' => $validPermissions
      ]);

      return $role->load('permissions');
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('❌ RoleService::assignPermissions - Error assigning permissions', [
        'role_id' => $roleId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Log permission changes for a role.
   */
  protected function logPermissionChanges(Role $role, array $oldPermissions, array $newPermissions): void
  {
    try {
      $added = array_diff($newPermissions, $oldPermissions);
      $removed = array_diff($oldPermissions, $newPermissions);

      if (empty($added) && empty($removed)) {
        return; // No changes to log
      }

      $description = [];
      if (!empty($added)) {
        $description[] = 'Added permissions: ' . implode(', ', $added);
      }
      if (!empty($removed)) {
        $description[] = 'Removed permissions: ' . implode(', ', $removed);
      }

      $this->auditLogService->log([
        'action' => 'permissions_updated',
        'module' => 'roles',
        'description' => 'Permissions updated for role "' . ($role->label ?? $role->name) . '": ' . implode('; ', $description),
        'entity_type' => get_class($role),
        'entity_id' => $role->id,
        'old_values' => ['permissions' => $oldPermissions],
        'new_values' => ['permissions' => $newPermissions],
        'metadata' => [
          'role_name' => $role->name,
          'role_label' => $role->label,
          'added' => $added,
          'removed' => $removed,
          'total_added' => count($added),
          'total_removed' => count($removed),
        ]
      ]);
    } catch (\Exception $e) {
      // Don't let audit logging break the main operation
      Log::error('Failed to log permission changes: ' . $e->getMessage());
    }
  }

  /**
   * Grant a single permission to a role.
   */
  public function grantPermission(int $roleId, string $permissionName): Role
  {
    Log::info('🔍 RoleService::grantPermission - Granting permission to role', [
      'role_id' => $roleId,
      'permission' => $permissionName
    ]);

    try {
      DB::beginTransaction();

      $role = Role::findOrFail($roleId);
      $oldPermissions = $role->permissions->pluck('name')->toArray();

      $role->givePermissionTo($permissionName);

      $newPermissions = $role->permissions->pluck('name')->toArray();

      $this->auditLogService->log([
        'action' => 'permission_granted',
        'module' => 'roles',
        'description' => 'Permission "' . $permissionName . '" granted to role "' . ($role->label ?? $role->name) . '"',
        'entity_type' => get_class($role),
        'entity_id' => $role->id,
        'old_values' => ['permissions' => $oldPermissions],
        'new_values' => ['permissions' => $newPermissions],
        'metadata' => [
          'role_name' => $role->name,
          'role_label' => $role->label,
          'permission' => $permissionName,
          'action' => 'granted'
        ]
      ]);

      DB::commit();
      Log::info('✅ RoleService::grantPermission - Permission granted successfully');

      return $role->load('permissions');
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('❌ RoleService::grantPermission - Error granting permission', [
        'role_id' => $roleId,
        'permission' => $permissionName,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Revoke a single permission from a role.
   */
  public function revokePermission(int $roleId, string $permissionName): Role
  {
    Log::info('🔍 RoleService::revokePermission - Revoking permission from role', [
      'role_id' => $roleId,
      'permission' => $permissionName
    ]);

    try {
      DB::beginTransaction();

      $role = Role::findOrFail($roleId);
      $oldPermissions = $role->permissions->pluck('name')->toArray();

      $role->revokePermissionTo($permissionName);

      $newPermissions = $role->permissions->pluck('name')->toArray();

      $this->auditLogService->log([
        'action' => 'permission_revoked',
        'module' => 'roles',
        'description' => 'Permission "' . $permissionName . '" revoked from role "' . ($role->label ?? $role->name) . '"',
        'entity_type' => get_class($role),
        'entity_id' => $role->id,
        'old_values' => ['permissions' => $oldPermissions],
        'new_values' => ['permissions' => $newPermissions],
        'metadata' => [
          'role_name' => $role->name,
          'role_label' => $role->label,
          'permission' => $permissionName,
          'action' => 'revoked'
        ]
      ]);

      DB::commit();
      Log::info('✅ RoleService::revokePermission - Permission revoked successfully');

      return $role->load('permissions');
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('❌ RoleService::revokePermission - Error revoking permission', [
        'role_id' => $roleId,
        'permission' => $permissionName,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Get users assigned to a role.
   */
  public function getRoleUsers(int $roleId)
  {
    Log::info('🔍 RoleService::getRoleUsers - Fetching users for role', ['role_id' => $roleId]);

    try {
      $userIds = DB::table('model_has_roles')
        ->where('role_id', $roleId)
        ->where('model_type', 'App\\Models\\User')
        ->pluck('model_id')
        ->toArray();

      Log::info('✅ RoleService::getRoleUsers - Users fetched successfully', [
        'role_id' => $roleId,
        'user_count' => count($userIds)
      ]);

      return $userIds;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getRoleUsers - Error fetching users for role', [
        'role_id' => $roleId,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Get users with their role details.
   */
  public function getUsersWithRoles()
  {
    Log::info('🔍 RoleService::getUsersWithRoles - Fetching users with roles');

    try {
      $users = \App\Models\User::with('roles')->get()->map(function ($user) {
        $primaryRole = $user->roles()->first();
        return [
          'id' => $user->id,
          'name' => $user->full_name,
          'email' => $user->email,
          'role' => $primaryRole ? [
            'id' => $primaryRole->id,
            'name' => $primaryRole->name,
            'label' => $primaryRole->label ?? $this->formatRoleName($primaryRole->name),
            'description' => $primaryRole->description,
          ] : null,
          'roles_count' => $user->roles->count(),
          'is_active' => $user->is_active,
          'is_approved' => $user->is_approved,
        ];
      });

      Log::info('✅ RoleService::getUsersWithRoles - Users with roles fetched successfully', [
        'count' => $users->count()
      ]);

      return $users;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getUsersWithRoles - Error fetching users', [
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Assign role to a user.
   */
  public function assignRoleToUser(int $userId, string $roleName)
  {
    Log::info('🔍 RoleService::assignRoleToUser - Assigning role to user', [
      'user_id' => $userId,
      'role' => $roleName
    ]);

    try {
      DB::beginTransaction();

      $user = \App\Models\User::findOrFail($userId);
      $oldRoles = $user->getRoleNames()->toArray();

      $user->assignRole($roleName);

      $newRoles = $user->getRoleNames()->toArray();

      // Get role details for logging
      $role = Role::where('name', $roleName)->first();

      $this->auditLogService->log([
        'action' => 'role_assigned_to_user',
        'module' => 'users',
        'description' => 'Role "' . ($role->label ?? $roleName) . '" assigned to user "' . $user->full_name . '" (' . $user->email . ')',
        'entity_type' => get_class($user),
        'entity_id' => $user->id,
        'old_values' => ['roles' => $oldRoles],
        'new_values' => ['roles' => $newRoles],
        'metadata' => [
          'user_name' => $user->full_name,
          'user_email' => $user->email,
          'role_name' => $roleName,
          'role_label' => $role->label ?? null,
          'action' => 'assigned'
        ]
      ]);

      DB::commit();

      Log::info('✅ RoleService::assignRoleToUser - Role assigned to user successfully', [
        'user_id' => $userId,
        'role' => $roleName
      ]);

      return true;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('❌ RoleService::assignRoleToUser - Error assigning role to user', [
        'user_id' => $userId,
        'role' => $roleName,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Remove role from a user.
   */
  public function removeRoleFromUser(int $userId, string $roleName)
  {
    Log::info('🔍 RoleService::removeRoleFromUser - Removing role from user', [
      'user_id' => $userId,
      'role' => $roleName
    ]);

    try {
      DB::beginTransaction();

      $user = \App\Models\User::findOrFail($userId);
      $oldRoles = $user->getRoleNames()->toArray();

      $user->removeRole($roleName);

      $newRoles = $user->getRoleNames()->toArray();

      $role = Role::where('name', $roleName)->first();

      $this->auditLogService->log([
        'action' => 'role_removed_from_user',
        'module' => 'users',
        'description' => 'Role "' . ($role->label ?? $roleName) . '" removed from user "' . $user->full_name . '" (' . $user->email . ')',
        'entity_type' => get_class($user),
        'entity_id' => $user->id,
        'old_values' => ['roles' => $oldRoles],
        'new_values' => ['roles' => $newRoles],
        'metadata' => [
          'user_name' => $user->full_name,
          'user_email' => $user->email,
          'role_name' => $roleName,
          'role_label' => $role->label ?? null,
          'action' => 'removed'
        ]
      ]);

      DB::commit();

      Log::info('✅ RoleService::removeRoleFromUser - Role removed from user successfully', [
        'user_id' => $userId,
        'role' => $roleName
      ]);

      return true;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('❌ RoleService::removeRoleFromUser - Error removing role from user', [
        'user_id' => $userId,
        'role' => $roleName,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Get user's roles and permissions.
   */
  public function getUserRolesAndPermissions(int $userId)
  {
    Log::info('🔍 RoleService::getUserRolesAndPermissions - Fetching user roles', [
      'user_id' => $userId
    ]);

    try {
      $user = \App\Models\User::findOrFail($userId);

      $roles = $user->roles()->get()->map(function ($role) {
        return [
          'id' => $role->id,
          'name' => $role->name,
          'label' => $role->label ?? $this->formatRoleName($role->name),
          'description' => $role->description,
        ];
      });

      $data = [
        'roles' => $roles,
        'role_names' => $user->getRoleNames(),
        'permissions' => $user->getAllPermissions()->pluck('name'),
      ];

      Log::info('✅ RoleService::getUserRolesAndPermissions - User roles fetched successfully', [
        'user_id' => $userId,
        'roles_count' => count($data['roles']),
        'permissions_count' => count($data['permissions'])
      ]);

      return $data;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getUserRolesAndPermissions - Error fetching user roles', [
        'user_id' => $userId,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Search roles by name or label.
   */
  public function searchRoles(string $searchTerm)
  {
    Log::info('🔍 RoleService::searchRoles - Searching roles', ['search' => $searchTerm]);

    try {
      $roles = Role::with('permissions')
        ->where('name', 'LIKE', "%{$searchTerm}%")
        ->orWhere('label', 'LIKE', "%{$searchTerm}%")
        ->orWhere('description', 'LIKE', "%{$searchTerm}%")
        ->get();

      Log::info('✅ RoleService::searchRoles - Search completed', [
        'search' => $searchTerm,
        'results' => $roles->count()
      ]);

      return $roles;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::searchRoles - Error searching roles', [
        'search' => $searchTerm,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Get role options for dropdowns (id, name, label).
   */
  public function getRoleOptions()
  {
    Log::info('🔍 RoleService::getRoleOptions - Fetching role options');

    try {
      $options = Role::all()->map(function ($role) {
        return [
          'id' => $role->id,
          'name' => $role->name,
          'label' => $role->label ?? $this->formatRoleName($role->name),
          'description' => $role->description,
        ];
      });

      Log::info('✅ RoleService::getRoleOptions - Role options fetched successfully', [
        'count' => $options->count()
      ]);

      return $options;
    } catch (\Exception $e) {
      Log::error('❌ RoleService::getRoleOptions - Error fetching role options', [
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }
}
