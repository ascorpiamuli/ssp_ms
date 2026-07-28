<?php
// app/Http/Controllers/Api/RequisitionBudgetController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Budget\StoreBudgetRequest;
use App\Http\Requests\Budget\UpdateBudgetRequest;
use App\Http\Requests\Budget\VerifyBudgetRequest;
use App\Http\Requests\Budget\ApproveBudgetRequest;
use App\Http\Resources\Budget\RequisitionBudgetResource;
use App\Services\Requisitions\RequisitionBudgetService;
use App\Exceptions\Requisitions\BudgetException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequisitionBudgetController extends Controller
{
  public function __construct(
    protected RequisitionBudgetService $budgetService
  ) {}

  /**
   * Display a listing of budgets for a requisition.
   */
  public function index(int $requisitionId): JsonResponse
  {
    try {
      $budgets = $this->budgetService->getByRequisitionId($requisitionId);

      return response()->json([
        'success' => true,
        'data' => RequisitionBudgetResource::collection($budgets),
        'message' => 'Budgets retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve budgets: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Store a newly created budget.
   */
  public function store(StoreBudgetRequest $request, int $requisitionId): JsonResponse
  {
    try {
      $data = $request->validated();
      $budget = $this->budgetService->create($requisitionId, $data);

      return response()->json([
        'success' => true,
        'data' => new RequisitionBudgetResource($budget),
        'message' => 'Budget created successfully'
      ], 201);
    } catch (BudgetException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to create budget: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Display the specified budget.
   */
  public function show(int $requisitionId, int $id): JsonResponse
  {
    try {
      $budget = $this->budgetService->getById($id);

      if ($budget->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Budget does not belong to this requisition'
        ], 400);
      }

      return response()->json([
        'success' => true,
        'data' => new RequisitionBudgetResource($budget),
        'message' => 'Budget retrieved successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Budget not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve budget: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Update the specified budget.
   */
  public function update(UpdateBudgetRequest $request, int $requisitionId, int $id): JsonResponse
  {
    try {
      $budget = $this->budgetService->getById($id);

      if ($budget->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Budget does not belong to this requisition'
        ], 400);
      }

      $data = $request->validated();
      $budget = $this->budgetService->update($id, $data);

      return response()->json([
        'success' => true,
        'data' => new RequisitionBudgetResource($budget),
        'message' => 'Budget updated successfully'
      ]);
    } catch (BudgetException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Budget not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to update budget: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Verify budget.
   */
  public function verify(VerifyBudgetRequest $request, int $requisitionId, int $id): JsonResponse
  {
    try {
      $budget = $this->budgetService->getById($id);

      if ($budget->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Budget does not belong to this requisition'
        ], 400);
      }

      $data = $request->validated();
      $budget = $this->budgetService->verify($id, $data['notes'] ?? null);

      return response()->json([
        'success' => true,
        'data' => new RequisitionBudgetResource($budget),
        'message' => 'Budget verified successfully'
      ]);
    } catch (BudgetException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Budget not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to verify budget: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Approve budget.
   */
  public function approve(ApproveBudgetRequest $request, int $requisitionId, int $id): JsonResponse
  {
    try {
      $budget = $this->budgetService->getById($id);

      if ($budget->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Budget does not belong to this requisition'
        ], 400);
      }

      $data = $request->validated();
      $budget = $this->budgetService->approve($id, $data['notes'] ?? null);

      return response()->json([
        'success' => true,
        'data' => new RequisitionBudgetResource($budget),
        'message' => 'Budget approved successfully'
      ]);
    } catch (BudgetException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Budget not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to approve budget: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Reject budget.
   */
  public function reject(Request $request, int $requisitionId, int $id): JsonResponse
  {
    try {
      $request->validate([
        'reason' => ['required', 'string', 'min:5', 'max:1000']
      ]);

      $budget = $this->budgetService->getById($id);

      if ($budget->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Budget does not belong to this requisition'
        ], 400);
      }

      $budget = $this->budgetService->reject($id, $request->reason);

      return response()->json([
        'success' => true,
        'data' => new RequisitionBudgetResource($budget),
        'message' => 'Budget rejected successfully'
      ]);
    } catch (BudgetException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Budget not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to reject budget: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get budget statistics.
   */
  public function stats(Request $request): JsonResponse
  {
    try {
      $filters = $request->all();
      $stats = $this->budgetService->getStats($filters);

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
