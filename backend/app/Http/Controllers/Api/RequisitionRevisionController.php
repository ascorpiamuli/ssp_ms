<?php
// app/Http/Controllers/Api/RequisitionRevisionController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Requisition\RequisitionRevisionResource;
use App\Services\Requisitions\RequisitionRevisionService;
use App\Exceptions\Requisitions\RevisionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequisitionRevisionController extends Controller
{
  public function __construct(
    protected RequisitionRevisionService $revisionService
  ) {}

  /**
   * Display a listing of revisions for a requisition.
   */
  public function index(int $requisitionId): JsonResponse
  {
    try {
      $revisions = $this->revisionService->getByRequisitionId($requisitionId);

      return response()->json([
        'success' => true,
        'data' => RequisitionRevisionResource::collection($revisions),
        'message' => 'Revisions retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve revisions: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Create a revision request.
   */
  public function store(Request $request, int $requisitionId): JsonResponse
  {
    try {
      $request->validate([
        'reason' => ['required', 'string', 'min:5', 'max:1000'],
        'notes' => ['nullable', 'string', 'max:1000'],
        'changes' => ['nullable', 'array']
      ]);

      $data = $request->only(['reason', 'notes', 'changes']);
      $revision = $this->revisionService->create($requisitionId, $data);

      return response()->json([
        'success' => true,
        'data' => new RequisitionRevisionResource($revision),
        'message' => 'Revision created successfully'
      ], 201);
    } catch (RevisionException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to create revision: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Display the specified revision.
   */
  public function show(int $requisitionId, int $id): JsonResponse
  {
    try {
      $revision = $this->revisionService->getById($id);

      if ($revision->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Revision does not belong to this requisition'
        ], 400);
      }

      return response()->json([
        'success' => true,
        'data' => new RequisitionRevisionResource($revision),
        'message' => 'Revision retrieved successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Revision not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve revision: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Approve revision.
   */
  public function approve(Request $request, int $requisitionId, int $id): JsonResponse
  {
    try {
      $request->validate([
        'notes' => ['nullable', 'string', 'max:1000']
      ]);

      $revision = $this->revisionService->getById($id);

      if ($revision->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Revision does not belong to this requisition'
        ], 400);
      }

      $revision = $this->revisionService->approve($id, $request->notes);

      return response()->json([
        'success' => true,
        'data' => new RequisitionRevisionResource($revision),
        'message' => 'Revision approved successfully'
      ]);
    } catch (RevisionException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Revision not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to approve revision: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Reject revision.
   */
  public function reject(Request $request, int $requisitionId, int $id): JsonResponse
  {
    try {
      $request->validate([
        'reason' => ['required', 'string', 'min:5', 'max:1000']
      ]);

      $revision = $this->revisionService->getById($id);

      if ($revision->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Revision does not belong to this requisition'
        ], 400);
      }

      $revision = $this->revisionService->reject($id, $request->reason);

      return response()->json([
        'success' => true,
        'data' => new RequisitionRevisionResource($revision),
        'message' => 'Revision rejected successfully'
      ]);
    } catch (RevisionException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Revision not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to reject revision: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get revision statistics.
   */
  public function stats(int $requisitionId): JsonResponse
  {
    try {
      $stats = $this->revisionService->getStats($requisitionId);

      return response()->json([
        'success' => true,
        'data' => $stats,
        'message' => 'Statistics retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
      ], 500);
    }
  }
}
