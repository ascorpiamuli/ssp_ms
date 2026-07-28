<?php
// app/Http/Controllers/Api/RequisitionItemController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Requisition\StoreRequisitionItemRequest;
use App\Http\Requests\Requisition\UpdateRequisitionItemRequest;
use App\Http\Resources\Requisition\RequisitionItemResource;
use App\Http\Resources\Requisition\RequisitionItemCollection;
use App\Services\Requisitions\RequisitionItemService;
use App\Exceptions\Requisitions\RequisitionException;
use Illuminate\Http\JsonResponse;

class RequisitionItemController extends Controller
{
  public function __construct(
    protected RequisitionItemService $itemService
  ) {}

  /**
   * Display a listing of requisition items.
   */
  public function index(int $requisitionId): JsonResponse
  {
    try {
      $items = $this->itemService->getByRequisitionId($requisitionId);

      return response()->json([
        'success' => true,
        'data' => RequisitionItemResource::collection($items),
        'message' => 'Items retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve items: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Store a newly created requisition item.
   */
  public function store(StoreRequisitionItemRequest $request, int $requisitionId): JsonResponse
  {
    try {
      $data = $request->validated();
      $item = $this->itemService->create($requisitionId, $data);

      return response()->json([
        'success' => true,
        'data' => new RequisitionItemResource($item),
        'message' => 'Item created successfully'
      ], 201);
    } catch (RequisitionException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to create item: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Display the specified requisition item.
   */
  public function show(int $requisitionId, int $id): JsonResponse
  {
    try {
      $item = $this->itemService->getById($id);

      // Verify item belongs to requisition
      if ($item->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Item does not belong to this requisition'
        ], 400);
      }

      return response()->json([
        'success' => true,
        'data' => new RequisitionItemResource($item),
        'message' => 'Item retrieved successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Item not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve item: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Update the specified requisition item.
   */
  public function update(UpdateRequisitionItemRequest $request, int $requisitionId, int $id): JsonResponse
  {
    try {
      $data = $request->validated();
      $item = $this->itemService->update($id, $data);

      // Verify item belongs to requisition
      if ($item->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Item does not belong to this requisition'
        ], 400);
      }

      return response()->json([
        'success' => true,
        'data' => new RequisitionItemResource($item),
        'message' => 'Item updated successfully'
      ]);
    } catch (RequisitionException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Item not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to update item: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Remove the specified requisition item.
   */
  public function destroy(int $requisitionId, int $id): JsonResponse
  {
    try {
      $item = $this->itemService->getById($id);

      // Verify item belongs to requisition
      if ($item->requisition_id !== $requisitionId) {
        return response()->json([
          'success' => false,
          'message' => 'Item does not belong to this requisition'
        ], 400);
      }

      $this->itemService->delete($id);

      return response()->json([
        'success' => true,
        'message' => 'Item deleted successfully'
      ]);
    } catch (RequisitionException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Item not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to delete item: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Bulk create items for a requisition.
   */
  public function bulkStore(StoreRequisitionItemRequest $request, int $requisitionId): JsonResponse
  {
    try {
      $items = $request->input('items', []);

      if (empty($items)) {
        return response()->json([
          'success' => false,
          'message' => 'No items provided'
        ], 400);
      }

      $createdItems = $this->itemService->bulkCreate($requisitionId, $items);

      return response()->json([
        'success' => true,
        'data' => RequisitionItemResource::collection($createdItems),
        'message' => 'Items created successfully'
      ], 201);
    } catch (RequisitionException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to create items: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get items statistics for a requisition.
   */
  public function stats(int $requisitionId): JsonResponse
  {
    try {
      $stats = $this->itemService->getStats($requisitionId);

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
