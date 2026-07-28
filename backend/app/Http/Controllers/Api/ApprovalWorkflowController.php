<?php
// app/Http/Controllers/Api/ApprovalWorkflowController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Approval\StoreApprovalWorkflowRequest;
use App\Http\Requests\Approval\UpdateApprovalWorkflowRequest;
use App\Http\Resources\Approval\ApprovalWorkflowResource;
use App\Services\Requisitions\ApprovalWorkflowService;
use App\Exceptions\Requisitions\ApprovalException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalWorkflowController extends Controller
{
  public function __construct(
    protected ApprovalWorkflowService $workflowService
  ) {}

  /**
   * Display a listing of workflows.
   */
  public function index(Request $request): JsonResponse
  {
    try {
      $filters = $request->all();
      $workflows = $this->workflowService->getAll($filters);

      return response()->json([
        'success' => true,
        'data' => ApprovalWorkflowResource::collection($workflows),
        'message' => 'Workflows retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve workflows: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Store a newly created workflow.
   */
  public function store(StoreApprovalWorkflowRequest $request): JsonResponse
  {
    try {
      $data = $request->validated();
      $workflow = $this->workflowService->create($data);

      return response()->json([
        'success' => true,
        'data' => new ApprovalWorkflowResource($workflow),
        'message' => 'Workflow created successfully'
      ], 201);
    } catch (ApprovalException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to create workflow: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Display the specified workflow.
   */
  public function show(int $id): JsonResponse
  {
    try {
      $workflow = $this->workflowService->getById($id);

      return response()->json([
        'success' => true,
        'data' => new ApprovalWorkflowResource($workflow),
        'message' => 'Workflow retrieved successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Workflow not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve workflow: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Update the specified workflow.
   */
  public function update(UpdateApprovalWorkflowRequest $request, int $id): JsonResponse
  {
    try {
      $data = $request->validated();
      $workflow = $this->workflowService->update($id, $data);

      return response()->json([
        'success' => true,
        'data' => new ApprovalWorkflowResource($workflow),
        'message' => 'Workflow updated successfully'
      ]);
    } catch (ApprovalException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Workflow not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to update workflow: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Remove the specified workflow.
   */
  public function destroy(int $id): JsonResponse
  {
    try {
      $this->workflowService->delete($id);

      return response()->json([
        'success' => true,
        'message' => 'Workflow deleted successfully'
      ]);
    } catch (ApprovalException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Workflow not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to delete workflow: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get default workflow for a department.
   */
  public function default(int $departmentId): JsonResponse
  {
    try {
      $workflow = $this->workflowService->getDefaultForDepartment($departmentId);

      if (!$workflow) {
        return response()->json([
          'success' => false,
          'message' => 'No default workflow found for this department'
        ], 404);
      }

      return response()->json([
        'success' => true,
        'data' => new ApprovalWorkflowResource($workflow),
        'message' => 'Default workflow retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve default workflow: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Clone a workflow to another department.
   */
  public function clone(Request $request, int $id): JsonResponse
  {
    try {
      $request->validate([
        'department_id' => ['required', 'exists:departments,id'],
        'name' => ['required', 'string', 'max:255']
      ]);

      $workflow = $this->workflowService->clone(
        $id,
        $request->department_id,
        $request->name
      );

      return response()->json([
        'success' => true,
        'data' => new ApprovalWorkflowResource($workflow),
        'message' => 'Workflow cloned successfully'
      ]);
    } catch (ApprovalException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Workflow not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to clone workflow: ' . $e->getMessage()
      ], 500);
    }
  }
}
