<?php
// app/Http/Controllers/Api/ApprovalController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Approval\ProcessApprovalRequest;
use App\Http\Requests\Approval\DelegateApprovalRequest;
use App\Http\Resources\Approval\ApprovalResource;
use App\Http\Resources\Approval\ApprovalCollection;
use App\Services\Requisitions\ApprovalService;
use App\Exceptions\Requisitions\ApprovalException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApprovalController extends Controller
{
  public function __construct(
    protected ApprovalService $approvalService
  ) {}

  /**
   * Display a listing of approvals for a requisition.
   */
  public function index(int $requisitionId): JsonResponse
  {
    Log::info('ApprovalController::index called', ['requisition_id' => $requisitionId]);

    try {
      $approvals = $this->approvalService->getByRequisitionId($requisitionId);

      Log::info('ApprovalController::index - Approvals retrieved', [
        'requisition_id' => $requisitionId,
        'count' => $approvals->count()
      ]);

      return response()->json([
        'success' => true,
        'data' => ApprovalResource::collection($approvals),
        'message' => 'Approvals retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('ApprovalController::index - Failed', [
        'requisition_id' => $requisitionId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve approvals: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Process an approval (approve/decline/return).
   */
  public function process(ProcessApprovalRequest $request, int $requisitionId, string $level): JsonResponse
  {
    Log::info('ApprovalController::process called', [
      'requisition_id' => $requisitionId,
      'level' => $level,
      'data' => $request->validated()
    ]);

    try {
      $data = $request->validated();
      $action = $data['action'];
      $userId = auth()->id();

      // Add user_id to data for authorization
      $data['user_id'] = $userId;

      $approval = $this->approvalService->process($requisitionId, $level, $action, $data);

      Log::info('ApprovalController::process - Success', [
        'requisition_id' => $requisitionId,
        'level' => $level,
        'action' => $action,
        'approval_id' => $approval->id
      ]);

      return response()->json([
        'success' => true,
        'data' => new ApprovalResource($approval),
        'message' => 'Approval processed successfully'
      ]);
    } catch (ApprovalException $e) {
      Log::warning('ApprovalController::process - ApprovalException', [
        'requisition_id' => $requisitionId,
        'level' => $level,
        'message' => $e->getMessage(),
        'context' => $e->getContext()
      ]);

      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      Log::warning('ApprovalController::process - Model not found', [
        'requisition_id' => $requisitionId,
        'level' => $level
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Approval not found'
      ], 404);
    } catch (\Exception $e) {
      Log::error('ApprovalController::process - Failed', [
        'requisition_id' => $requisitionId,
        'level' => $level,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to process approval: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Delegate approval to another user.
   */
  public function delegate(DelegateApprovalRequest $request, int $approvalId): JsonResponse
  {
    Log::info('ApprovalController::delegate called', [
      'approval_id' => $approvalId,
      'data' => $request->validated()
    ]);

    try {
      $data = $request->validated();
      $approval = $this->approvalService->delegate(
        $approvalId,
        $data['delegate_id'],
        $data['comment'] ?? null
      );

      Log::info('ApprovalController::delegate - Success', [
        'approval_id' => $approvalId,
        'delegate_id' => $data['delegate_id']
      ]);

      return response()->json([
        'success' => true,
        'data' => new ApprovalResource($approval),
        'message' => 'Approval delegated successfully'
      ]);
    } catch (ApprovalException $e) {
      Log::warning('ApprovalController::delegate - ApprovalException', [
        'approval_id' => $approvalId,
        'message' => $e->getMessage()
      ]);

      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      Log::warning('ApprovalController::delegate - Model not found', [
        'approval_id' => $approvalId
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Approval not found'
      ], 404);
    } catch (\Exception $e) {
      Log::error('ApprovalController::delegate - Failed', [
        'approval_id' => $approvalId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to delegate approval: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get delegated approvals for the authenticated user.
   * GET /api/v1/approvals/delegated
   */
  public function delegated(Request $request): JsonResponse
  {
    Log::info('ApprovalController::delegated called', [
      'user_id' => $request->user()?->id,
      'filters' => $request->all()
    ]);

    try {
      $user = $request->user();

      if (!$user) {
        Log::warning('ApprovalController::delegated - User not authenticated');

        return response()->json([
          'success' => false,
          'message' => 'User not authenticated'
        ], 401);
      }

      Log::info('ApprovalController::delegated - User authenticated', [
        'user_id' => $user->id,
        'email' => $user->email,
        'role' => $user->role
      ]);

      // Get filters
      $status = $request->input('status', 'all');
      $perPage = (int) $request->input('per_page', 10);
      $page = (int) $request->input('page', 1);
      $level = $request->input('level');
      $dateFrom = $request->input('date_from');
      $dateTo = $request->input('date_to');
      $search = $request->input('search');

      Log::info('ApprovalController::delegated - Filters', [
        'user_id' => $user->id,
        'status' => $status,
        'perPage' => $perPage,
        'page' => $page,
        'level' => $level,
        'dateFrom' => $dateFrom,
        'dateTo' => $dateTo,
        'search' => $search
      ]);

      // Get delegated approvals for the user
      $result = $this->approvalService->getDelegatedForUser(
        $user->id,
        $status,
        $perPage,
        $page,
        $level,
        $dateFrom,
        $dateTo,
        $search
      );

      Log::info('ApprovalController::delegated - Result', [
        'user_id' => $user->id,
        'data_count' => count($result['data'] ?? []),
        'total' => $result['total'] ?? 0,
        'per_page' => $result['per_page'] ?? $perPage,
        'current_page' => $result['current_page'] ?? $page,
        'last_page' => $result['last_page'] ?? 1
      ]);

      return response()->json([
        'success' => true,
        'data' => $result['data'] ?? [],
        'total' => $result['total'] ?? 0,
        'per_page' => $result['per_page'] ?? $perPage,
        'current_page' => $result['current_page'] ?? $page,
        'last_page' => $result['last_page'] ?? 1,
        'message' => 'Delegated approvals retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('ApprovalController::delegated - Failed', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve delegated approvals: ' . $e->getMessage()
      ], 500);
    }
  }
  /**
   * Get pending approvals for the authenticated user.
   * ✅ Maps display names (e.g., "head of institution") to database level names (e.g., "principal")
   * ✅ Maps display names to actual role names (e.g., "head of institution" -> "HEAD OF INSTITUTION")
   */
  public function pending(Request $request): JsonResponse
  {
    Log::info('🔍 ApprovalController::pending called', [
      'user_id' => $request->user()?->id,
      'filters' => $request->all()
    ]);

    try {
      $user = $request->user();

      if (!$user) {
        Log::warning('⚠️ ApprovalController::pending - User not authenticated');

        return response()->json([
          'success' => false,
          'message' => 'User not authenticated'
        ], 401);
      }

      Log::info('✅ ApprovalController::pending - User authenticated', [
        'user_id' => $user->id,
        'email' => $user->email,
        'role' => $user->role,
        'user_roles' => $user->getRoleNames()->toArray()
      ]);

      $level = $request->input('level');
      $perPage = (int) $request->input('per_page', 10);
      $page = (int) $request->input('page', 1);
      $departmentId = $request->input('department_id') ? (int) $request->input('department_id') : null;
      $dateFrom = $request->input('date_from');
      $dateTo = $request->input('date_to');
      $search = $request->input('search');

      Log::info('📋 ApprovalController::pending - Raw filters from request', [
        'level' => $level,
        'perPage' => $perPage,
        'page' => $page,
        'departmentId' => $departmentId,
        'dateFrom' => $dateFrom,
        'dateTo' => $dateTo,
        'search' => $search
      ]);

      // ✅ Define level mapping: display name => database level
      $levelMap = [
        // HOD mappings
        'hod' => 'hod',
        'head of department' => 'hod',
        'head-of-department' => 'hod',
        'head_of_department' => 'hod',

        // Accountant mappings
        'accountant' => 'accountant',

        // Principal mappings (database level is 'principal')
        'principal' => 'principal',
        'head of institution' => 'principal',
        'head-of-institution' => 'principal',
        'head_of_institution' => 'principal',
        'principal\'s office' => 'principal',

        // Final approver mappings
        'final' => 'final',
        'final approver' => 'final',
        'final-approver' => 'final',
        'final_approver' => 'final',
        'director' => 'final',
        'education secretary' => 'final',
      ];

      // ✅ Define role mapping: display name => Actual Role Name in Database
      // ⚠️ IMPORTANT: These must match EXACTLY the role names in your database!
      $roleMap = [
        'hod' => 'HOD',
        'head of department' => 'HOD',
        'head-of-department' => 'HOD',
        'head_of_department' => 'HOD',

        'accountant' => 'ACCOUNTANT',

        'principal' => 'HEAD OF INSTITUTION', // ✅ Changed from 'PRINCIPAL' to 'HEAD OF INSTITUTION'
        'head of institution' => 'HEAD OF INSTITUTION', // ✅ Changed from 'PRINCIPAL' to 'HEAD OF INSTITUTION'
        'head-of-institution' => 'HEAD OF INSTITUTION',
        'head_of_institution' => 'HEAD OF INSTITUTION',

        'final' => 'FINAL_APPROVER',
        'final approver' => 'FINAL_APPROVER',
        'final-approver' => 'FINAL_APPROVER',
        'final_approver' => 'FINAL_APPROVER',
      ];

      // ✅ Map the level from display name to database level
      $mappedLevel = null;
      $roleName = null;

      if ($level) {
        $levelLower = strtolower(trim($level));
        $mappedLevel = $levelMap[$levelLower] ?? $levelLower;
        $roleName = $roleMap[$levelLower] ?? strtoupper($level);

        Log::info('🔄 ApprovalController::pending - Level mapping', [
          'original_level' => $level,
          'mapped_level' => $mappedLevel,
          'role_name_for_validation' => $roleName,
          'level_lower' => $levelLower,
        ]);
      }

      // ✅ If level is provided, verify user has the corresponding role
      if ($level && $roleName) {
        $hasRole = $user->hasRole($roleName) || $user->hasRole('ADMIN') || $user->hasRole('SUPER_ADMIN');

        Log::info('🔐 ApprovalController::pending - Role validation', [
          'user_id' => $user->id,
          'role_name' => $roleName,
          'has_role' => $hasRole,
          'user_roles' => $user->getRoleNames()->toArray()
        ]);

        if (!$hasRole) {
          Log::warning('⚠️ ApprovalController::pending - User does not have required role', [
            'user_id' => $user->id,
            'level' => $level,
            'role_name' => $roleName,
            'user_roles' => $user->getRoleNames()->toArray()
          ]);

          return response()->json([
            'success' => false,
            'message' => "You do not have the required role: {$level}"
          ], 403);
        }
      }

      Log::info('📋 ApprovalController::pending - Final filters sent to service', [
        'level' => $level,
        'mapped_level' => $mappedLevel,
        'perPage' => $perPage,
        'page' => $page,
        'departmentId' => $departmentId,
        'dateFrom' => $dateFrom,
        'dateTo' => $dateTo,
        'search' => $search
      ]);

      // ✅ Get pending approvals using the mapped level
      $result = $this->approvalService->getPendingForUser(
        $user->id,
        $mappedLevel, // ✅ This will be 'principal'
        $perPage,
        $page,
        $departmentId,
        $dateFrom,
        $dateTo,
        $search
      );

      Log::info('✅ ApprovalController::pending - Result', [
        'user_id' => $user->id,
        'data_count' => count($result['data'] ?? []),
        'total' => $result['total'] ?? 0,
        'per_page' => $result['per_page'] ?? $perPage,
        'current_page' => $result['current_page'] ?? $page,
        'last_page' => $result['last_page'] ?? 1,
        'mapped_level' => $mappedLevel,
        'original_level' => $level,
      ]);

      return response()->json([
        'success' => true,
        'data' => $result['data'] ?? [],
        'total' => $result['total'] ?? 0,
        'per_page' => $result['per_page'] ?? $perPage,
        'current_page' => $result['current_page'] ?? $page,
        'last_page' => $result['last_page'] ?? 1,
        'message' => 'Pending approvals retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('❌ ApprovalController::pending - Failed', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve pending approvals: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get approvals by role (all statuses including processed).
   * Validates that the authenticated user has the requested role.
   * ✅ Maps display names to database level names.
   */
  public function byRole(Request $request): JsonResponse
  {
    Log::info('🔍 ApprovalController::byRole called', [
      'user_id' => $request->user()?->id,
      'filters' => $request->all()
    ]);

    try {
      $user = $request->user();

      if (!$user) {
        Log::warning('⚠️ ApprovalController::byRole - User not authenticated');

        return response()->json([
          'success' => false,
          'message' => 'User not authenticated'
        ], 401);
      }

      $role = $request->input('role');

      if (!$role) {
        return response()->json([
          'success' => false,
          'message' => 'Role parameter is required'
        ], 400);
      }

      // ✅ Define level mapping: display name => database level
      $levelMap = [
        'hod' => 'hod',
        'head of department' => 'hod',
        'head-of-department' => 'hod',
        'head_of_department' => 'hod',

        'accountant' => 'accountant',

        'principal' => 'principal',
        'head of institution' => 'principal',
        'head-of-institution' => 'principal',
        'head_of_institution' => 'principal',

        'final' => 'final',
        'final approver' => 'final',
        'final-approver' => 'final',
        'final_approver' => 'final',
      ];

      // ✅ Define role mapping for validation
      // ⚠️ IMPORTANT: These must match EXACTLY the role names in your database!
      $roleMap = [
        'hod' => 'HOD',
        'head of department' => 'HOD',
        'head-of-department' => 'HOD',
        'head_of_department' => 'HOD',

        'accountant' => 'ACCOUNTANT',

        // ✅ FIX: Map to the actual role name in the database
        'principal' => 'HEAD OF INSTITUTION',
        'head of institution' => 'HEAD OF INSTITUTION',
        'head-of-institution' => 'HEAD OF INSTITUTION',
        'head_of_institution' => 'HEAD OF INSTITUTION',

        'final' => 'FINAL_APPROVER',
        'final approver' => 'FINAL_APPROVER',
        'final-approver' => 'FINAL_APPROVER',
        'final_approver' => 'FINAL_APPROVER',
      ];

      $roleLower = strtolower(trim($role));
      $mappedRole = $levelMap[$roleLower] ?? $roleLower;
      $roleName = $roleMap[$roleLower] ?? strtoupper($role);

      Log::info('🔄 ApprovalController::byRole - Role mapping', [
        'original_role' => $role,
        'mapped_role' => $mappedRole,
        'role_name_for_validation' => $roleName,
      ]);

      // ✅ STRICT ROLE VALIDATION - Prevent URL spoofing
      $userRoles = $user->getRoleNames()->toArray();
      $userRolesLower = array_map('strtolower', $userRoles);

      // Check if user has the specific role OR is admin
      $hasRole = in_array(strtolower($roleName), $userRolesLower) ||
        in_array('admin', $userRolesLower) ||
        in_array('super_admin', $userRolesLower);

      Log::info('🔐 ApprovalController::byRole - Role validation', [
        'user_id' => $user->id,
        'role_name' => $roleName,
        'has_role' => $hasRole,
        'user_roles' => $userRoles
      ]);

      if (!$hasRole) {
        Log::warning('⚠️ ApprovalController::byRole - User does not have required role', [
          'user_id' => $user->id,
          'requested_role' => $role,
          'role_name' => $roleName,
          'user_roles' => $userRoles
        ]);

        return response()->json([
          'success' => false,
          'message' => "You do not have the required role: {$role}"
        ], 403);
      }

      // ✅ Additional check: For HOD, verify they belong to the department
      if ($roleLower === 'hod') {
        $departmentId = $request->input('department_id');
        if ($departmentId) {
          $userDepartmentId = $user->department_id;
          if ($userDepartmentId && (int)$userDepartmentId !== (int)$departmentId) {
            Log::warning('⚠️ ApprovalController::byRole - HOD department mismatch', [
              'user_id' => $user->id,
              'user_department_id' => $userDepartmentId,
              'requested_department_id' => $departmentId
            ]);

            return response()->json([
              'success' => false,
              'message' => 'You can only view approvals for your department'
            ], 403);
          }
        }
      }

      // Get filters
      $status = $request->input('status', 'all');
      $perPage = (int) $request->input('per_page', 10);
      $page = (int) $request->input('page', 1);
      $departmentId = $request->input('department_id') ? (int) $request->input('department_id') : null;
      $dateFrom = $request->input('date_from');
      $dateTo = $request->input('date_to');
      $search = $request->input('search');

      Log::info('📋 ApprovalController::byRole - Filters validated', [
        'role' => $role,
        'mapped_role' => $mappedRole,
        'user_id' => $user->id,
        'status' => $status,
        'perPage' => $perPage,
        'page' => $page
      ]);

      // ✅ Get approvals by role - use the mapped role
      $result = $this->approvalService->getByRoleForUser(
        $user->id,
        $mappedRole, // ✅ Use the mapped role here!
        $status,
        $perPage,
        $page,
        $departmentId,
        $dateFrom,
        $dateTo,
        $search
      );

      Log::info('✅ ApprovalController::byRole - Result', [
        'user_id' => $user->id,
        'role' => $role,
        'mapped_role' => $mappedRole,
        'data_count' => count($result['data'] ?? []),
        'total' => $result['total'] ?? 0
      ]);

      return response()->json([
        'success' => true,
        'data' => $result['data'] ?? [],
        'total' => $result['total'] ?? 0,
        'per_page' => $result['per_page'] ?? $perPage,
        'current_page' => $result['current_page'] ?? $page,
        'last_page' => $result['last_page'] ?? 1,
        'message' => 'Approvals retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('❌ ApprovalController::byRole - Failed', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve approvals: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get approval statistics for the authenticated user.
   */
  public function stats(Request $request): JsonResponse
  {
    Log::info('📊 ApprovalController::stats called', [
      'user_id' => $request->user()?->id
    ]);

    try {
      $user = $request->user();

      if (!$user) {
        Log::warning('⚠️ ApprovalController::stats - User not authenticated');

        return response()->json([
          'success' => false,
          'message' => 'User not authenticated'
        ], 401);
      }

      $stats = $this->approvalService->getStatsForUser($user->id);

      Log::info('✅ ApprovalController::stats - Result', [
        'user_id' => $user->id,
        'stats' => $stats
      ]);

      return response()->json([
        'success' => true,
        'data' => $stats,
        'message' => 'Statistics retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('❌ ApprovalController::stats - Failed', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get approval statistics for a specific user (admin only).
   */
  public function statsByUser(int $userId): JsonResponse
  {
    Log::info('📊 ApprovalController::statsByUser called', ['user_id' => $userId]);

    try {
      $stats = $this->approvalService->getStatsForUser($userId);

      Log::info('✅ ApprovalController::statsByUser - Result', [
        'user_id' => $userId,
        'stats' => $stats
      ]);

      return response()->json([
        'success' => true,
        'data' => $stats,
        'message' => 'Statistics retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('❌ ApprovalController::statsByUser - Failed', [
        'user_id' => $userId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get pending approvals for a specific user (admin only).
   */
  public function pendingByUser(Request $request, int $userId): JsonResponse
  {
    Log::info('🔍 ApprovalController::pendingByUser called', [
      'user_id' => $userId,
      'filters' => $request->all()
    ]);

    try {
      $level = $request->input('level');
      $perPage = (int) $request->input('per_page', 10);
      $page = (int) $request->input('page', 1);

      // ✅ Map display name to database level
      $levelMap = [
        'hod' => 'hod',
        'head of department' => 'hod',
        'head-of-department' => 'hod',
        'head_of_department' => 'hod',

        'accountant' => 'accountant',

        'principal' => 'principal',
        'head of institution' => 'principal',
        'head-of-institution' => 'principal',
        'head_of_institution' => 'principal',

        'final' => 'final',
        'final approver' => 'final',
        'final-approver' => 'final',
        'final_approver' => 'final',
      ];

      $mappedLevel = null;
      if ($level) {
        $levelLower = strtolower(trim($level));
        $mappedLevel = $levelMap[$levelLower] ?? $levelLower;

        Log::info('🔄 ApprovalController::pendingByUser - Level mapping', [
          'original_level' => $level,
          'mapped_level' => $mappedLevel,
        ]);
      }

      $result = $this->approvalService->getPendingForUser($userId, $mappedLevel, $perPage, $page);

      Log::info('✅ ApprovalController::pendingByUser - Result', [
        'user_id' => $userId,
        'data_count' => count($result['data'] ?? []),
        'total' => $result['total'] ?? 0
      ]);

      return response()->json([
        'success' => true,
        'data' => $result['data'] ?? [],
        'total' => $result['total'] ?? 0,
        'per_page' => $result['per_page'] ?? $perPage,
        'current_page' => $result['current_page'] ?? $page,
        'last_page' => $result['last_page'] ?? 1,
        'message' => 'Pending approvals retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('❌ ApprovalController::pendingByUser - Failed', [
        'user_id' => $userId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve pending approvals: ' . $e->getMessage()
      ], 500);
    }
  }
}
