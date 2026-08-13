<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Requisition\StoreRequisitionRequest;
use App\Http\Requests\Requisition\UpdateRequisitionRequest;
use App\Http\Requests\Requisition\SubmitRequisitionRequest;
use App\Http\Requests\Requisition\ReturnRequisitionRequest;
use App\Http\Requests\Requisition\CancelRequisitionRequest;
use App\Http\Requests\Requisition\IndexRequisitionRequest;
use App\Http\Resources\Requisition\RequisitionResource;
use App\Http\Resources\Requisition\RequisitionCollection;
use App\Services\Requisitions\RequisitionService;
use App\Services\Requisitions\ApprovalService;
use App\Exceptions\Requisitions\RequisitionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RequisitionController extends Controller
{
  public function __construct(
    protected RequisitionService $requisitionService,
    protected ApprovalService $approvalService
  ) {}

  /**
   * Display a listing of requisitions.
   */
  public function index(IndexRequisitionRequest $request): JsonResponse
  {
    try {
      $filters = $request->validated();
      $perPage = $request->input('per_page', 15);

      Log::info('📋 RequisitionController::index - Fetching requisitions', [
        'filters' => $filters,
        'per_page' => $perPage,
        'user_id' => Auth::id(),
        'user_roles' => Auth::user()?->roles->pluck('name') ?? [],
      ]);

      $requisitions = $this->requisitionService->getAll($filters, $perPage);

      Log::info('✅ RequisitionController::index - Requisitions fetched', [
        'total' => $requisitions->total(),
        'count' => $requisitions->count(),
      ]);

      return response()->json([
        'success' => true,
        'data' => new RequisitionCollection($requisitions),
        'message' => 'Requisitions retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::index - Error', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve requisitions: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Store a newly created requisition.
   */
  public function store(StoreRequisitionRequest $request): JsonResponse
  {
    try {
      $data = $request->validated();

      Log::info('📝 RequisitionController::store - Creating requisition', [
        'reference_number' => $data['reference_number'] ?? 'not provided',
        'title' => $data['title'] ?? 'not provided',
        'user_id' => Auth::id(),
      ]);

      $requisition = $this->requisitionService->create($data);

      Log::info('✅ RequisitionController::store - Requisition created', [
        'id' => $requisition->id,
        'reference_number' => $requisition->reference_number,
      ]);

      return response()->json([
        'success' => true,
        'data' => new RequisitionResource($requisition),
        'message' => 'Requisition created successfully'
      ], 201);
    } catch (RequisitionException $e) {
      Log::warning('⚠️ RequisitionController::store - Validation error', [
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ]);
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::store - Exception', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to create requisition: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Display the specified requisition.
   */
  public function show(int $id): JsonResponse
  {
    try {
      Log::info('👁️ RequisitionController::show - Fetching requisition', [
        'id' => $id,
        'user_id' => Auth::id(),
      ]);

      $requisition = $this->requisitionService->getById($id);

      Log::info('✅ RequisitionController::show - Requisition found', [
        'id' => $requisition->id,
        'reference_number' => $requisition->reference_number,
        'status' => $requisition->status,
      ]);

      return response()->json([
        'success' => true,
        'data' => new RequisitionResource($requisition),
        'message' => 'Requisition retrieved successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      Log::warning('⚠️ RequisitionController::show - Requisition not found', [
        'id' => $id,
        'user_id' => Auth::id(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Requisition not found'
      ], 404);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::show - Error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve requisition: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Update the specified requisition.
   */
  public function update(UpdateRequisitionRequest $request, int $id): JsonResponse
  {
    try {
      $data = $request->validated();

      Log::info('✏️ RequisitionController::update - Updating requisition', [
        'id' => $id,
        'user_id' => Auth::id(),
        'data' => $data,
      ]);

      $requisition = $this->requisitionService->update($id, $data);

      Log::info('✅ RequisitionController::update - Requisition updated', [
        'id' => $requisition->id,
        'reference_number' => $requisition->reference_number,
      ]);

      return response()->json([
        'success' => true,
        'data' => new RequisitionResource($requisition),
        'message' => 'Requisition updated successfully'
      ]);
    } catch (RequisitionException $e) {
      Log::warning('⚠️ RequisitionController::update - Validation error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ]);
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      Log::warning('⚠️ RequisitionController::update - Requisition not found', [
        'id' => $id,
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Requisition not found'
      ], 404);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::update - Error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to update requisition: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Remove the specified requisition.
   */
  public function destroy(int $id): JsonResponse
  {
    try {
      Log::info('🗑️ RequisitionController::destroy - Deleting requisition', [
        'id' => $id,
        'user_id' => Auth::id(),
      ]);

      $this->requisitionService->delete($id);

      Log::info('✅ RequisitionController::destroy - Requisition deleted', [
        'id' => $id,
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Requisition deleted successfully'
      ]);
    } catch (RequisitionException $e) {
      Log::warning('⚠️ RequisitionController::destroy - Error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ]);
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      Log::warning('⚠️ RequisitionController::destroy - Requisition not found', [
        'id' => $id,
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Requisition not found'
      ], 404);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::destroy - Error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to delete requisition: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Submit requisition for approval.
   */
  public function submit(SubmitRequisitionRequest $request, int $id): JsonResponse
  {
    try {
      $data = $request->validated();

      Log::info('📤 RequisitionController::submit - Submitting requisition', [
        'id' => $id,
        'user_id' => Auth::id(),
        'comment' => $data['comment'] ?? null,
      ]);

      $requisition = $this->requisitionService->submit($id, $data, $this->approvalService);

      Log::info('✅ RequisitionController::submit - Requisition submitted', [
        'id' => $requisition->id,
        'reference_number' => $requisition->reference_number,
        'status' => $requisition->status,
        'approvals_count' => $requisition->approvals->count() ?? 0,
      ]);

      return response()->json([
        'success' => true,
        'data' => new RequisitionResource($requisition),
        'message' => 'Requisition submitted successfully'
      ]);
    } catch (RequisitionException $e) {
      Log::warning('⚠️ RequisitionController::submit - Error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ]);
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      Log::warning('⚠️ RequisitionController::submit - Requisition not found', [
        'id' => $id,
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Requisition not found'
      ], 404);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::submit - Error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to submit requisition: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Return requisition for revision.
   */
  public function return(ReturnRequisitionRequest $request, int $id): JsonResponse
  {
    try {
      $data = $request->validated();

      Log::info('🔄 RequisitionController::return - Returning requisition', [
        'id' => $id,
        'user_id' => Auth::id(),
        'reason' => $data['reason'] ?? null,
      ]);

      $requisition = $this->requisitionService->returnForRevision($id, $data);

      Log::info('✅ RequisitionController::return - Requisition returned', [
        'id' => $requisition->id,
        'reference_number' => $requisition->reference_number,
        'status' => $requisition->status,
      ]);

      return response()->json([
        'success' => true,
        'data' => new RequisitionResource($requisition),
        'message' => 'Requisition returned successfully'
      ]);
    } catch (RequisitionException $e) {
      Log::warning('⚠️ RequisitionController::return - Error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ]);
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      Log::warning('⚠️ RequisitionController::return - Requisition not found', [
        'id' => $id,
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Requisition not found'
      ], 404);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::return - Error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to return requisition: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Cancel requisition.
   */
  public function cancel(CancelRequisitionRequest $request, int $id): JsonResponse
  {
    try {
      $data = $request->validated();

      Log::info('❌ RequisitionController::cancel - Cancelling requisition', [
        'id' => $id,
        'user_id' => Auth::id(),
        'reason' => $data['reason'] ?? null,
      ]);

      $requisition = $this->requisitionService->cancel($id, $data);

      Log::info('✅ RequisitionController::cancel - Requisition cancelled', [
        'id' => $requisition->id,
        'reference_number' => $requisition->reference_number,
        'status' => $requisition->status,
      ]);

      return response()->json([
        'success' => true,
        'data' => new RequisitionResource($requisition),
        'message' => 'Requisition cancelled successfully'
      ]);
    } catch (RequisitionException $e) {
      Log::warning('⚠️ RequisitionController::cancel - Error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ]);
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      Log::warning('⚠️ RequisitionController::cancel - Requisition not found', [
        'id' => $id,
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Requisition not found'
      ], 404);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::cancel - Error', [
        'id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to cancel requisition: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get requisition statistics.
   */
  public function stats(IndexRequisitionRequest $request): JsonResponse
  {
    try {
      $filters = $request->validated();

      // Get current authenticated user
      $user = Auth::user();

      // Define roles that can see ALL requisition stats (not just their own)
      $adminRoles = [
        'ADMIN',           // Administrator - full system access
        'ACCOUNTANT',      // Accountant/Finance - needs to see all financial data
        'PROCUREMENT',     // Procurement Officer - manages all procurement
        'HEAD OF INSTITUTION', // Principal - oversees all institutional activities
        'FINAL_APPROVER',  // Director/Finance Administrator - approves financial commitments
        'AUDITOR'          // Auditor - needs full visibility for compliance checks
      ];

      // Check if user has any admin role (case-insensitive)
      $hasAdminAccess = $user->roles()
        ->whereIn('name', $adminRoles)
        ->exists();

      // If user doesn't have admin access, filter by their user_id (personal stats only)
      if (!$hasAdminAccess) {
        $filters['user_id'] = Auth::id();
      }

      Log::info('📊 RequisitionController::stats - Fetching stats', [
        'filters' => $filters,
        'user_id' => Auth::id(),
        'user_roles' => $user->roles->pluck('name')->toArray(),
        'has_admin_access' => $hasAdminAccess,
      ]);

      $stats = $this->requisitionService->getStats($filters);

      Log::info('✅ RequisitionController::stats - Stats fetched', [
        'stats' => $stats,
      ]);

      return response()->json([
        'success' => true,
        'data' => $stats,
        'message' => 'Statistics retrieved successfully',
        'meta' => [
          'user_roles' => $user->roles->pluck('name')->toArray(),
          'has_admin_access' => $hasAdminAccess,
        ]
      ]);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::stats - Error', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
      ], 500);
    }
  }
  /**
   * Get current user's requisition statistics.
   */
  public function myStats(IndexRequisitionRequest $request): JsonResponse
  {
    try {
      $filters = $request->validated();
      $filters['user_id'] = Auth::id();

      Log::info('📊 RequisitionController::myStats - Fetching user stats', [
        'user_id' => Auth::id(),
        'filters' => $filters,
      ]);

      $stats = $this->requisitionService->getStats($filters);

      Log::info('✅ RequisitionController::myStats - User stats fetched', [
        'stats' => $stats,
      ]);

      return response()->json([
        'success' => true,
        'data' => $stats,
        'message' => 'User statistics retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::myStats - Error', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve user statistics: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get user's requisitions.
   */
  public function userRequisitions(IndexRequisitionRequest $request): JsonResponse
  {
    try {
      $userId = Auth::id();
      $filters = $request->validated();
      $perPage = $request->input('per_page', 15);

      Log::info('📋 RequisitionController::userRequisitions - Fetching user requisitions', [
        'user_id' => $userId,
        'filters' => $filters,
        'per_page' => $perPage,
      ]);

      $requisitions = $this->requisitionService->getUserRequisitions($userId, $filters, $perPage);

      Log::info('✅ RequisitionController::userRequisitions - User requisitions fetched', [
        'total' => $requisitions->total(),
        'count' => $requisitions->count(),
      ]);

      return response()->json([
        'success' => true,
        'data' => new RequisitionCollection($requisitions),
        'message' => 'User requisitions retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::userRequisitions - Error', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve user requisitions: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get pending approvals for the authenticated user.
   */
  public function pendingApprovals(IndexRequisitionRequest $request): JsonResponse
  {
    try {
      $userId = Auth::id();
      $filters = $request->validated();
      $perPage = $request->input('per_page', 15);

      // Get user roles for logging
      $user = Auth::user();
      $userRoles = $user->roles->pluck('name')->toArray();

      Log::info('🔍 RequisitionController::pendingApprovals - Fetching pending approvals', [
        'user_id' => $userId,
        'user_email' => $user->email,
        'user_roles' => $userRoles,
        'filters' => $filters,
        'per_page' => $perPage,
      ]);

      // Log what the service is going to query
      Log::info('🔍 RequisitionController::pendingApprovals - Calling service', [
        'user_id' => $userId,
      ]);

      $requisitions = $this->requisitionService->getPendingApprovals($userId, $filters, $perPage);

      Log::info('✅ RequisitionController::pendingApprovals - Pending approvals fetched', [
        'total' => $requisitions->total(),
        'count' => $requisitions->count(),
        'per_page' => $requisitions->perPage(),
        'current_page' => $requisitions->currentPage(),
        'last_page' => $requisitions->lastPage(),
        'has_more_pages' => $requisitions->hasMorePages(),
      ]);

      // Log the actual data for debugging (limit to first 5 items)
      $sampleData = $requisitions->items();
      if (count($sampleData) > 0) {
        Log::info('✅ RequisitionController::pendingApprovals - Sample data', [
          'sample_count' => min(5, count($sampleData)),
          'sample_ids' => array_slice(array_column($sampleData, 'id'), 0, 5),
          'sample_statuses' => array_slice(array_column($sampleData, 'status'), 0, 5),
          'sample_reference_numbers' => array_slice(array_column($sampleData, 'reference_number'), 0, 5),
        ]);
      } else {
        Log::warning('⚠️ RequisitionController::pendingApprovals - No data returned');

        // Check if there are any approvals for this user at all
        $allApprovals = \App\Models\Approval::where('approver_id', $userId)
          ->orWhere('delegate_id', $userId)
          ->count();

        Log::info('🔍 RequisitionController::pendingApprovals - All approvals for user', [
          'user_id' => $userId,
          'total_approvals_found' => $allApprovals,
          'pending_approvals' => \App\Models\Approval::where('approver_id', $userId)
            ->orWhere('delegate_id', $userId)
            ->where('status', 'pending')
            ->count(),
        ]);
      }

      return response()->json([
        'success' => true,
        'data' => $requisitions,
        'message' => 'Pending approvals retrieved successfully'
      ]);
    } catch (\Exception $e) {
      Log::error('❌ RequisitionController::pendingApprovals - Error', [
        'user_id' => Auth::id(),
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve pending approvals: ' . $e->getMessage()
      ], 500);
    }
  }
}
