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
   * Get single role.
   */
  public function show($id)
  {
    try {
      $role = $this->roleService->getRoleById($id);

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
      $role = $this->roleService->createRole($request->validated());

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
      $role = $this->roleService->updateRole($id, $request->validated());

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
      $this->roleService->deleteRole($id);

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
      $role = $this->roleService->assignPermissions($id, $request->permissions);

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
      $users = $this->roleService->getRoleUsers($id);

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
        'role' => 'required|string|exists:roles,name',
      ]);

      $this->roleService->assignRoleToUser($request->user_id, $request->role);

      return response()->json([
        'success' => true,
        'message' => 'Role assigned to user successfully',
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
}
