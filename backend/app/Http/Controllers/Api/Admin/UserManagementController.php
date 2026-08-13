<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Requests\UserApprovalRequest;
use App\Http\Requests\UserStatusRequest;
use App\Http\Requests\PasswordResetRequest;
use App\Http\Resources\UserResource;
use App\Services\Admin\UserManagementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserManagementController extends Controller
{
  protected UserManagementService $userService;

  public function __construct(UserManagementService $userService)
  {
    $this->userService = $userService;
  }

  /**
   * List all users.
   */
  public function index(Request $request)
  {
    try {
      Log::info('📋 UserManagementController::index - Fetching users', [
        'filters' => $request->all(),
        'user_id' => auth()->id(),
        'ip' => $request->ip(),
        'user_agent' => $request->userAgent()
      ]);

      $users = $this->userService->getAllUsers($request->all());

      Log::info('✅ UserManagementController::index - Users fetched successfully', [
        'total' => $users->total(),
        'count' => $users->count(),
        'per_page' => $users->perPage(),
        'current_page' => $users->currentPage(),
        'last_page' => $users->lastPage(),
        'has_more_pages' => $users->hasMorePages()
      ]);

      return response()->json([
        'success' => true,
        'data' => UserResource::collection($users),
        'meta' => [
          'total' => $users->total(),
          'per_page' => $users->perPage(),
          'current_page' => $users->currentPage(),
          'last_page' => $users->lastPage(),
        ],
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::index - Failed to fetch users', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'filters' => $request->all(),
        'user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch users: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * List all users with role labels.
   */
  public function indexWithRoleLabels(Request $request)
  {
    try {
      Log::info('📋 UserManagementController::indexWithRoleLabels - Fetching users with role labels', [
        'filters' => $request->all(),
        'user_id' => auth()->id()
      ]);

      $users = $this->userService->getAllUsersWithRoleLabels($request->all());

      Log::info('✅ UserManagementController::indexWithRoleLabels - Users with role labels fetched successfully', [
        'total' => $users->total(),
        'count' => $users->count()
      ]);

      return response()->json([
        'success' => true,
        'data' => $users->items(),
        'meta' => [
          'total' => $users->total(),
          'per_page' => $users->perPage(),
          'current_page' => $users->currentPage(),
          'last_page' => $users->lastPage(),
        ],
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::indexWithRoleLabels - Failed to fetch users', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'filters' => $request->all(),
        'user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch users: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get single user.
   */
  public function show($id)
  {
    try {
      Log::info('📋 UserManagementController::show - Fetching user', [
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      $user = $this->userService->getUserById($id);

      if (!$user) {
        Log::warning('⚠️ UserManagementController::show - User not found', [
          'user_id' => $id,
          'auth_user_id' => auth()->id()
        ]);

        return response()->json([
          'success' => false,
          'message' => 'User not found',
        ], 404);
      }

      Log::info('✅ UserManagementController::show - User fetched successfully', [
        'user_id' => $id,
        'email' => $user->email,
        'full_name' => $user->full_name
      ]);

      return response()->json([
        'success' => true,
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::show - Failed to fetch user', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get single user with role information.
   */
  public function showWithRoleInfo($id)
  {
    try {
      Log::info('📋 UserManagementController::showWithRoleInfo - Fetching user with role info', [
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      $userData = $this->userService->getUserWithRoleInfo($id);

      if (!$userData) {
        Log::warning('⚠️ UserManagementController::showWithRoleInfo - User not found', [
          'user_id' => $id,
          'auth_user_id' => auth()->id()
        ]);

        return response()->json([
          'success' => false,
          'message' => 'User not found',
        ], 404);
      }

      Log::info('✅ UserManagementController::showWithRoleInfo - User with role info fetched successfully', [
        'user_id' => $id,
        'has_role' => !is_null($userData['primary_role'])
      ]);

      return response()->json([
        'success' => true,
        'data' => $userData,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::showWithRoleInfo - Failed to fetch user with role info', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch user with role info: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Create user.
   */
  public function store(UserRequest $request)
  {
    try {
      Log::info('📋 UserManagementController::store - Creating user', [
        'data' => $request->validated(),
        'auth_user_id' => auth()->id(),
        'ip' => $request->ip()
      ]);

      $user = $this->userService->createUser($request->validated());

      Log::info('✅ UserManagementController::store - User created successfully', [
        'user_id' => $user->id,
        'email' => $user->email,
        'full_name' => $user->full_name,
        'role' => $user->roles->pluck('name')->first()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'User created successfully',
        'data' => new UserResource($user),
      ], 201);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::warning('⚠️ UserManagementController::store - Validation failed', [
        'errors' => $e->errors(),
        'data' => $request->all(),
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::store - Failed to create user', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'data' => $request->all(),
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to create user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update user.
   */
  public function update(UserRequest $request, $id)
  {
    try {
      Log::info('📋 UserManagementController::update - Updating user', [
        'user_id' => $id,
        'data' => $request->validated(),
        'auth_user_id' => auth()->id()
      ]);

      $user = $this->userService->updateUser($id, $request->validated());

      Log::info('✅ UserManagementController::update - User updated successfully', [
        'user_id' => $id,
        'email' => $user->email,
        'full_name' => $user->full_name,
        'updated_fields' => array_keys($request->validated())
      ]);

      return response()->json([
        'success' => true,
        'message' => 'User updated successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::warning('⚠️ UserManagementController::update - Validation failed', [
        'errors' => $e->errors(),
        'user_id' => $id,
        'data' => $request->all()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::update - Failed to update user', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'data' => $request->all(),
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to update user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Approve user.
   */
  public function approve($id)
  {
    try {
      Log::info('📋 UserManagementController::approve - Approving user', [
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      $user = $this->userService->approveUser($id);

      Log::info('✅ UserManagementController::approve - User approved successfully', [
        'user_id' => $id,
        'email' => $user->email,
        'full_name' => $user->full_name,
        'approved_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'User approved successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::approve - Failed to approve user', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to approve user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Reject user.
   */
  public function reject(Request $request, $id)
  {
    try {
      Log::info('📋 UserManagementController::reject - Rejecting user', [
        'user_id' => $id,
        'reason' => $request->reason,
        'auth_user_id' => auth()->id()
      ]);

      $request->validate([
        'reason' => 'required|string|max:500',
      ]);

      $user = $this->userService->rejectUser($id, $request->reason);

      Log::info('✅ UserManagementController::reject - User rejected successfully', [
        'user_id' => $id,
        'email' => $user->email,
        'full_name' => $user->full_name,
        'reason' => $request->reason,
        'rejected_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'User rejected successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::warning('⚠️ UserManagementController::reject - Validation failed', [
        'errors' => $e->errors(),
        'user_id' => $id,
        'data' => $request->all()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::reject - Failed to reject user', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'reason' => $request->reason,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to reject user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Activate user.
   */
  public function activate($id)
  {
    try {
      Log::info('📋 UserManagementController::activate - Activating user', [
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      $user = $this->userService->activateUser($id);

      Log::info('✅ UserManagementController::activate - User activated successfully', [
        'user_id' => $id,
        'email' => $user->email,
        'full_name' => $user->full_name,
        'activated_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'User activated successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::activate - Failed to activate user', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to activate user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Deactivate user.
   */
  public function deactivate($id)
  {
    try {
      Log::info('📋 UserManagementController::deactivate - Deactivating user', [
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      $user = $this->userService->deactivateUser($id);

      Log::info('✅ UserManagementController::deactivate - User deactivated successfully', [
        'user_id' => $id,
        'email' => $user->email,
        'full_name' => $user->full_name,
        'deactivated_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'User deactivated successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::deactivate - Failed to deactivate user', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to deactivate user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete user (soft delete).
   */
  public function destroy($id)
  {
    try {
      Log::info('📋 UserManagementController::destroy - Soft deleting user', [
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      $this->userService->deleteUser($id);

      Log::info('✅ UserManagementController::destroy - User soft deleted successfully', [
        'user_id' => $id,
        'deleted_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'User deleted successfully',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::destroy - Failed to soft delete user', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to delete user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Force delete user (permanent).
   */
  public function forceDelete($id)
  {
    try {
      Log::info('📋 UserManagementController::forceDelete - Permanently deleting user', [
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      $this->userService->forceDeleteUser($id);

      Log::info('✅ UserManagementController::forceDelete - User permanently deleted', [
        'user_id' => $id,
        'deleted_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'User permanently deleted',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::forceDelete - Failed to permanently delete user', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to permanently delete user: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Reset user password.
   */
  public function resetPassword(PasswordResetRequest $request, $id)
  {
    try {
      Log::info('📋 UserManagementController::resetPassword - Resetting user password', [
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      $user = $this->userService->resetPassword($id, $request->password);

      Log::info('✅ UserManagementController::resetPassword - Password reset successfully', [
        'user_id' => $id,
        'email' => $user->email,
        'full_name' => $user->full_name,
        'reset_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Password reset successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::warning('⚠️ UserManagementController::resetPassword - Validation failed', [
        'errors' => $e->errors(),
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::resetPassword - Failed to reset password', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to reset password: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get pending users.
   */
  public function pending()
  {
    try {
      Log::info('📋 UserManagementController::pending - Fetching pending users', [
        'auth_user_id' => auth()->id()
      ]);

      $users = $this->userService->getPendingUsers();

      Log::info('✅ UserManagementController::pending - Pending users fetched', [
        'count' => $users->count(),
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'data' => $users,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::pending - Failed to fetch pending users', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch pending users: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get recent users.
   */
  public function recent(Request $request)
  {
    try {
      $limit = $request->limit ?? 10;
      Log::info('📋 UserManagementController::recent - Fetching recent users', [
        'limit' => $limit,
        'auth_user_id' => auth()->id()
      ]);

      $users = $this->userService->getRecentUsers($limit);

      Log::info('✅ UserManagementController::recent - Recent users fetched', [
        'count' => $users->count(),
        'limit' => $limit,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'data' => $users,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::recent - Failed to fetch recent users', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'limit' => $request->limit ?? 10,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch recent users: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get user statistics.
   */
  public function stats()
  {
    try {
      Log::info('📋 UserManagementController::stats - Fetching user statistics', [
        'auth_user_id' => auth()->id()
      ]);

      $stats = $this->userService->getUserStats();

      Log::info('✅ UserManagementController::stats - Statistics fetched', [
        'total' => $stats['total'] ?? 0,
        'active' => $stats['active'] ?? 0,
        'inactive' => $stats['inactive'] ?? 0,
        'pending' => $stats['pending'] ?? 0,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'data' => $stats,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::stats - Failed to fetch user statistics', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch user statistics: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get users by role.
   */
  public function usersByRole(Request $request)
  {
    try {
      $request->validate([
        'role' => 'required|string',
      ]);

      Log::info('📋 UserManagementController::usersByRole - Fetching users by role', [
        'role' => $request->role,
        'auth_user_id' => auth()->id()
      ]);

      $users = $this->userService->getUsersByRole($request->role);

      Log::info('✅ UserManagementController::usersByRole - Users by role fetched', [
        'role' => $request->role,
        'count' => $users->count(),
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'data' => $users,
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::warning('⚠️ UserManagementController::usersByRole - Validation failed', [
        'errors' => $e->errors(),
        'data' => $request->all()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::usersByRole - Failed to fetch users by role', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'role' => $request->role,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch users by role: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get available roles for dropdown.
   */
  public function availableRoles()
  {
    try {
      Log::info('📋 UserManagementController::availableRoles - Fetching available roles', [
        'auth_user_id' => auth()->id()
      ]);

      $roles = $this->userService->getAvailableRoles();

      Log::info('✅ UserManagementController::availableRoles - Available roles fetched', [
        'count' => $roles->count(),
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'data' => $roles,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::availableRoles - Failed to fetch available roles', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch available roles: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get user's role information.
   */
  public function userRoleInfo(Request $request)
  {
    try {
      $request->validate([
        'user_id' => 'required|exists:users,id',
      ]);

      Log::info('📋 UserManagementController::userRoleInfo - Fetching user role info', [
        'user_id' => $request->user_id,
        'auth_user_id' => auth()->id()
      ]);

      $roleInfo = $this->userService->getUserRoleInfo($request->user_id);

      Log::info('✅ UserManagementController::userRoleInfo - User role info fetched', [
        'user_id' => $request->user_id,
        'has_role' => $roleInfo['has_role'] ?? false,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'data' => $roleInfo,
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::warning('⚠️ UserManagementController::userRoleInfo - Validation failed', [
        'errors' => $e->errors(),
        'data' => $request->all()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::userRoleInfo - Failed to fetch user role info', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $request->user_id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch user role info: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Bulk action on users.
   */
  public function bulkAction(Request $request)
  {
    try {
      Log::info('📋 UserManagementController::bulkAction - Performing bulk action', [
        'action' => $request->action,
        'user_ids' => $request->user_ids,
        'role' => $request->role,
        'auth_user_id' => auth()->id(),
        'ip' => $request->ip()
      ]);

      $request->validate([
        'user_ids' => 'required|array',
        'user_ids.*' => 'exists:users,id',
        'action' => 'required|string|in:activate,deactivate,approve,delete,restore,force_delete,assign_role,assign_roles',
        'role' => 'required_if:action,assign_role|string',
        'roles' => 'required_if:action,assign_roles|array',
        'roles.*' => 'string',
      ]);

      $results = $this->userService->bulkAction(
        $request->user_ids,
        $request->action,
        $request->only(['role', 'roles'])
      );

      Log::info('✅ UserManagementController::bulkAction - Bulk action completed', [
        'action' => $request->action,
        'affected_count' => count($request->user_ids),
        'user_ids' => $request->user_ids,
        'results' => $results,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Bulk action completed successfully',
        'data' => $results,
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::warning('⚠️ UserManagementController::bulkAction - Validation failed', [
        'errors' => $e->errors(),
        'data' => $request->all(),
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::bulkAction - Failed to perform bulk action', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'action' => $request->action,
        'user_ids' => $request->user_ids,
        'role' => $request->role,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to perform bulk action: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Restore soft-deleted user.
   */
  public function restore($id)
  {
    try {
      Log::info('📋 UserManagementController::restore - Restoring user', [
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      $user = $this->userService->restoreUser($id);

      Log::info('✅ UserManagementController::restore - User restored successfully', [
        'user_id' => $id,
        'email' => $user->email,
        'full_name' => $user->full_name,
        'restored_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'User restored successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
      Log::error('❌ UserManagementController::restore - Failed to restore user', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $id,
        'auth_user_id' => auth()->id()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to restore user: ' . $e->getMessage(),
      ], 500);
    }
  }
}
