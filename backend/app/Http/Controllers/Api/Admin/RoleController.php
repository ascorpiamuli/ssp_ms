<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest;
use App\Http\Requests\RolePermissionRequest;
use App\Services\Admin\RoleService;
use Illuminate\Http\Request;

class RoleController extends Controller
{
  protected RoleService $roleService;

  public function __construct(RoleService $roleService)
  {
    $this->roleService = $roleService;
  }

  /**
   * List all roles.
   */
  public function index(Request $request)
  {
    try {
      $roles = $this->roleService->getAllRoles($request->all());

      return response()->json([
        'success' => true,
        'data' => $roles,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch roles: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * List all roles with labels and descriptions.
   */
  public function indexWithLabels(Request $request)
  {
    try {
      $roles = $this->roleService->getAllRolesWithLabels();

      return response()->json([
        'success' => true,
        'data' => $roles,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch roles: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get single role.
   */
  public function show($id)
  {
    try {
      $roleId = (int) $id;
      $role = $this->roleService->getRoleById($roleId);

      if (!$role) {
        return response()->json([
          'success' => false,
          'message' => 'Role not found',
        ], 404);
      }

      return response()->json([
        'success' => true,
        'data' => $role,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch role: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get single role with labels and descriptions.
   */
  public function showWithLabels($id)
  {
    try {
      $roleId = (int) $id;
      $role = $this->roleService->getRoleWithLabels($roleId);

      if (!$role) {
        return response()->json([
          'success' => false,
          'message' => 'Role not found',
        ], 404);
      }

      return response()->json([
        'success' => true,
        'data' => $role,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch role: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Create role.
   */
  public function store(RoleRequest $request)
  {
    try {
      $validated = $request->validated();
      $role = $this->roleService->createRole($validated);

      return response()->json([
        'success' => true,
        'message' => 'Role created successfully',
        'data' => $role,
      ], 201);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to create role: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update role.
   */
  public function update(RoleRequest $request, $id)
  {
    try {
      $roleId = (int) $id;
      $validated = $request->validated();

      // Remove 'name' from validated data to prevent it from being updated
      unset($validated['name']);

      $role = $this->roleService->updateRole($roleId, $validated);

      return response()->json([
        'success' => true,
        'message' => 'Role updated successfully',
        'data' => $role,
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to update role: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete role.
   */
  public function destroy($id)
  {
    try {
      $roleId = (int) $id;
      $this->roleService->deleteRole($roleId);

      return response()->json([
        'success' => true,
        'message' => 'Role deleted successfully',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Assign permissions to role.
   */
  public function assignPermissions(RolePermissionRequest $request, $id)
  {
    try {
      $roleId = (int) $id;
      $role = $this->roleService->assignPermissions($roleId, $request->permissions);

      return response()->json([
        'success' => true,
        'message' => 'Permissions assigned successfully',
        'data' => $role,
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to assign permissions: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Grant a single permission to a role.
   */
  public function grantPermission(Request $request, $id)
  {
    try {
      $request->validate([
        'permission' => 'required|string|exists:permissions,name',
      ]);

      $roleId = (int) $id;
      $role = $this->roleService->grantPermission($roleId, $request->permission);

      return response()->json([
        'success' => true,
        'message' => 'Permission granted successfully',
        'data' => $role,
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to grant permission: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Revoke a single permission from a role.
   */
  public function revokePermission(Request $request, $id)
  {
    try {
      $request->validate([
        'permission' => 'required|string|exists:permissions,name',
      ]);

      $roleId = (int) $id;
      $role = $this->roleService->revokePermission($roleId, $request->permission);

      return response()->json([
        'success' => true,
        'message' => 'Permission revoked successfully',
        'data' => $role,
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to revoke permission: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get all permissions.
   */
  public function permissions(Request $request)
  {
    try {
      $permissions = $this->roleService->getAllPermissions();

      return response()->json([
        'success' => true,
        'data' => $permissions,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch permissions: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get permissions grouped by module.
   */
  public function permissionsGrouped()
  {
    try {
      $permissions = $this->roleService->getPermissionsGrouped();

      return response()->json([
        'success' => true,
        'data' => $permissions,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch grouped permissions: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get users assigned to a role.
   */
  public function roleUsers($id)
  {
    try {
      $roleId = (int) $id;
      $users = $this->roleService->getRoleUsers($roleId);

      return response()->json([
        'success' => true,
        'data' => $users,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch role users: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get users with their roles.
   */
  public function usersWithRoles(Request $request)
  {
    try {
      $users = $this->roleService->getUsersWithRoles();

      return response()->json([
        'success' => true,
        'data' => $users,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch users with roles: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get role statistics.
   */
  public function stats()
  {
    try {
      $stats = $this->roleService->getRoleStats();

      return response()->json([
        'success' => true,
        'data' => $stats,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch role statistics: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Assign role to user.
   */
  public function assignRoleToUser(Request $request)
  {
    try {
      $request->validate([
        'user_id' => 'required|exists:users,id',
        'role' => 'required|string',
      ]);

      $this->roleService->assignRoleToUser($request->user_id, $request->role);

      return response()->json([
        'success' => true,
        'message' => 'Role assigned to user successfully',
        'data' => [
          'user_id' => $request->user_id,
          'role' => $request->role,
        ],
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to assign role: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Remove role from user.
   */
  public function removeRoleFromUser(Request $request)
  {
    try {
      $request->validate([
        'user_id' => 'required|exists:users,id',
        'role' => 'required|string',
      ]);

      $this->roleService->removeRoleFromUser($request->user_id, $request->role);

      return response()->json([
        'success' => true,
        'message' => 'Role removed from user successfully',
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to remove role: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get user's roles and permissions.
   */
  public function userRoles(Request $request)
  {
    try {
      $request->validate([
        'user_id' => 'required|exists:users,id',
      ]);

      $data = $this->roleService->getUserRolesAndPermissions($request->user_id);

      return response()->json([
        'success' => true,
        'data' => $data,
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch user roles: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get role options for dropdowns.
   */
  public function options()
  {
    try {
      $options = $this->roleService->getRoleOptions();

      return response()->json([
        'success' => true,
        'data' => $options,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch role options: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Search roles.
   */
  public function search(Request $request)
  {
    try {
      $request->validate([
        'search' => 'required|string|min:2',
      ]);

      $roles = $this->roleService->searchRoles($request->search);

      return response()->json([
        'success' => true,
        'data' => $roles,
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to search roles: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get all permissions with their descriptions.
   */
  public function allPermissionsWithInfo()
  {
    try {
      $permissions = $this->roleService->getAllPermissions();

      // Group by module for better organization
      $grouped = [];
      foreach ($permissions as $permission) {
        $parts = explode('.', $permission->name);
        $module = $parts[0] ?? 'general';
        $action = $parts[1] ?? $permission->name;

        if (!isset($grouped[$module])) {
          $grouped[$module] = [];
        }

        $grouped[$module][] = [
          'id' => $permission->id,
          'name' => $permission->name,
          'display_name' => ucfirst(str_replace('_', ' ', $action)),
          'module' => ucfirst($module),
          'guard_name' => $permission->guard_name,
          'created_at' => $permission->created_at,
        ];
      }

      return response()->json([
        'success' => true,
        'data' => $grouped,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch permissions: ' . $e->getMessage(),
      ], 500);
    }
  }
}
