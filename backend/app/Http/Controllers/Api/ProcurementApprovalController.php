<?php
// app/Http/Controllers/Api/ProcurementApprovalController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\ApprovalRequest;
use App\Http\Resources\Procurement\ApprovalResource;
use App\Services\Procurement\Services\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProcurementApprovalController extends Controller
{
  public function __construct(
    protected ApprovalService $approvalService
  ) {}

  public function index(Request $request): JsonResponse
  {
    $userId = $request->input('user_id', auth()->id());

    if ($request->input('pending') === 'true') {
      $approvals = $this->approvalService->getPendingApprovalsForUser($userId);
    } elseif ($request->input('overdue') === 'true') {
      $approvals = $this->approvalService->getOverdueApprovals();
    } else {
      $approvals = $this->approvalService->getPendingApprovals();
    }

    return response()->json([
      'success' => true,
      'data' => $approvals,
      'message' => 'Approvals retrieved successfully.',
    ]);
  }

  public function store(ApprovalRequest $request): JsonResponse
  {
    $approval = $this->approvalService->createApproval($request->validated());

    return response()->json([
      'success' => true,
      'data' => new ApprovalResource($approval),
      'message' => 'Approval created successfully.',
    ], 201);
  }

  public function show(int $id): JsonResponse
  {
    $approval = $this->approvalService->getApproval($id);

    return response()->json([
      'success' => true,
      'data' => new ApprovalResource($approval),
      'message' => 'Approval retrieved successfully.',
    ]);
  }

  public function entity(Request $request): JsonResponse
  {
    $request->validate([
      'entity_id' => 'required|integer',
      'entity_type' => 'required|string',
    ]);

    $approvals = $this->approvalService->getApprovalsForEntity(
      $request->entity_id,
      $request->entity_type
    );

    return response()->json([
      'success' => true,
      'data' => $approvals,
      'message' => 'Entity approvals retrieved successfully.',
    ]);
  }

  public function approve(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'comment' => 'nullable|string',
    ]);

    $approval = $this->approvalService->approve($id, auth()->id(), $request->comment);

    return response()->json([
      'success' => true,
      'data' => new ApprovalResource($approval),
      'message' => 'Approval approved successfully.',
    ]);
  }

  public function decline(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $approval = $this->approvalService->decline($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new ApprovalResource($approval),
      'message' => 'Approval declined successfully.',
    ]);
  }

  public function return(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $approval = $this->approvalService->return($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new ApprovalResource($approval),
      'message' => 'Approval returned successfully.',
    ]);
  }

  public function delegate(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'delegate_id' => 'required|exists:users,id',
    ]);

    $approval = $this->approvalService->delegateApproval($id, $request->delegate_id);

    return response()->json([
      'success' => true,
      'data' => new ApprovalResource($approval),
      'message' => 'Approval delegated successfully.',
    ]);
  }

  public function reassign(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'approver_id' => 'required|exists:users,id',
    ]);

    $approval = $this->approvalService->reassignApproval($id, $request->approver_id);

    return response()->json([
      'success' => true,
      'data' => new ApprovalResource($approval),
      'message' => 'Approval reassigned successfully.',
    ]);
  }

  public function timeline(Request $request): JsonResponse
  {
    $request->validate([
      'entity_id' => 'required|integer',
      'entity_type' => 'required|string',
    ]);

    $timeline = $this->approvalService->getApprovalTimeline(
      $request->entity_id,
      $request->entity_type
    );

    return response()->json([
      'success' => true,
      'data' => $timeline,
      'message' => 'Approval timeline retrieved successfully.',
    ]);
  }

  public function isApproved(Request $request): JsonResponse
  {
    $request->validate([
      'entity_id' => 'required|integer',
      'entity_type' => 'required|string',
    ]);

    $isApproved = $this->approvalService->isApproved(
      $request->entity_id,
      $request->entity_type
    );

    return response()->json([
      'success' => true,
      'data' => [
        'is_approved' => $isApproved,
      ],
      'message' => 'Approval status retrieved successfully.',
    ]);
  }

  public function currentLevel(Request $request): JsonResponse
  {
    $request->validate([
      'entity_id' => 'required|integer',
      'entity_type' => 'required|string',
    ]);

    $approval = $this->approvalService->getCurrentApprovalLevel(
      $request->entity_id,
      $request->entity_type
    );

    return response()->json([
      'success' => true,
      'data' => $approval ? new ApprovalResource($approval) : null,
      'message' => 'Current approval level retrieved successfully.',
    ]);
  }

  public function statistics(): JsonResponse
  {
    $stats = $this->approvalService->getApprovalStatistics();

    return response()->json([
      'success' => true,
      'data' => $stats,
      'message' => 'Approval statistics retrieved successfully.',
    ]);
  }
}
