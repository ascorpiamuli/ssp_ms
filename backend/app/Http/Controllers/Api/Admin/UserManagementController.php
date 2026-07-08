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
    $users = $this->userService->getAllUsers($request->all());

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
  }

  /**
   * Get single user.
   */
  public function show($id)
  {
    $user = $this->userService->getUserById($id);

    if (!$user) {
      return response()->json([
        'success' => false,
        'message' => 'User not found',
      ], 404);
    }

    return response()->json([
      'success' => true,
      'data' => new UserResource($user),
    ]);
  }

  /**
   * Create user.
   */
  public function store(UserRequest $request)
  {
    try {
      $user = $this->userService->createUser($request->validated());

      return response()->json([
        'success' => true,
        'message' => 'User created successfully',
        'data' => new UserResource($user),
      ], 201);
    } catch (\Exception $e) {
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
      $user = $this->userService->updateUser($id, $request->validated());

      return response()->json([
        'success' => true,
        'message' => 'User updated successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
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
      $user = $this->userService->approveUser($id);

      return response()->json([
        'success' => true,
        'message' => 'User approved successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
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
    $request->validate([
      'reason' => 'required|string|max:500',
    ]);

    try {
      $user = $this->userService->rejectUser($id, $request->reason);

      return response()->json([
        'success' => true,
        'message' => 'User rejected successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
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
      $user = $this->userService->activateUser($id);

      return response()->json([
        'success' => true,
        'message' => 'User activated successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
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
      $user = $this->userService->deactivateUser($id);

      return response()->json([
        'success' => true,
        'message' => 'User deactivated successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
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
      $this->userService->deleteUser($id);

      return response()->json([
        'success' => true,
        'message' => 'User deleted successfully',
      ]);
    } catch (\Exception $e) {
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
      $this->userService->forceDeleteUser($id);

      return response()->json([
        'success' => true,
        'message' => 'User permanently deleted',
      ]);
    } catch (\Exception $e) {
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
      $user = $this->userService->resetPassword($id, $request->password);

      return response()->json([
        'success' => true,
        'message' => 'Password reset successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
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
    $users = $this->userService->getPendingUsers();

    return response()->json([
      'success' => true,
      'data' => UserResource::collection($users),
    ]);
  }

  /**
   * Get recent users.
   */
  public function recent(Request $request)
  {
    $limit = $request->limit ?? 10;
    $users = $this->userService->getRecentUsers($limit);

    return response()->json([
      'success' => true,
      'data' => UserResource::collection($users),
    ]);
  }

  /**
   * Get user statistics.
   */
  public function stats()
  {
    $stats = $this->userService->getUserStats();

    return response()->json([
      'success' => true,
      'data' => $stats,
    ]);
  }

  /**
   * Bulk action on users.
   */
  public function bulkAction(Request $request)
  {
    $request->validate([
      'user_ids' => 'required|array',
      'user_ids.*' => 'exists:users,id',
      'action' => 'required|string|in:activate,deactivate,approve,delete,assign_role',
      'role' => 'required_if:action,assign_role|string|exists:roles,name',
    ]);

    try {
      $results = $this->userService->bulkAction(
        $request->user_ids,
        $request->action,
        $request->only(['role'])
      );

      return response()->json([
        'success' => true,
        'message' => 'Bulk action completed',
        'data' => $results,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to perform bulk action: ' . $e->getMessage(),
      ], 500);
    }
  }
}
