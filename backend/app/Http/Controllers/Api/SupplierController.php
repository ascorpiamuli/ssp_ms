<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Services\Supplier\SupplierService;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
  protected SupplierService $supplierService;

  public function __construct(SupplierService $supplierService)
  {
    $this->supplierService = $supplierService;
  }

  /**
   * List all suppliers.
   */
  public function index(Request $request)
  {
    $suppliers = $this->supplierService->getAll($request->all());

    return response()->json([
      'success' => true,
      'data' => SupplierResource::collection($suppliers),
    ]);
  }

  /**
   * Get active suppliers (for dropdown).
   */
  public function active()
  {
    $suppliers = $this->supplierService->getActive();

    return response()->json([
      'success' => true,
      'data' => SupplierResource::collection($suppliers),
    ]);
  }

  /**
   * Get single supplier.
   */
  public function show($id)
  {
    $supplier = $this->supplierService->getById($id);

    if (!$supplier) {
      return response()->json([
        'success' => false,
        'message' => 'Supplier not found',
      ], 404);
    }

    return response()->json([
      'success' => true,
      'data' => new SupplierResource($supplier),
    ]);
  }

  /**
   * Create supplier.
   */
  public function store(SupplierRequest $request)
  {
    try {
      $supplier = $this->supplierService->create($request->validated());

      return response()->json([
        'success' => true,
        'message' => 'Supplier created successfully',
        'data' => new SupplierResource($supplier),
      ], 201);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to create supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update supplier.
   */
  public function update(SupplierRequest $request, $id)
  {
    try {
      $supplier = $this->supplierService->update($id, $request->validated());

      return response()->json([
        'success' => true,
        'message' => 'Supplier updated successfully',
        'data' => new SupplierResource($supplier),
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to update supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Blacklist supplier.
   */
  public function blacklist(Request $request, $id)
  {
    $request->validate([
      'reason' => 'required|string|max:500',
    ]);

    try {
      $supplier = $this->supplierService->blacklist($id, $request->reason);

      return response()->json([
        'success' => true,
        'message' => 'Supplier blacklisted successfully',
        'data' => new SupplierResource($supplier),
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to blacklist supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Remove from blacklist.
   */
  public function unblacklist($id)
  {
    try {
      $supplier = $this->supplierService->unblacklist($id);

      return response()->json([
        'success' => true,
        'message' => 'Supplier removed from blacklist successfully',
        'data' => new SupplierResource($supplier),
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to remove from blacklist: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete supplier.
   */
  public function destroy($id)
  {
    try {
      $this->supplierService->delete($id);

      return response()->json([
        'success' => true,
        'message' => 'Supplier deactivated successfully',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to deactivate supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Activate supplier.
   */
  public function activate($id)
  {
    try {
      $this->supplierService->activate($id);

      return response()->json([
        'success' => true,
        'message' => 'Supplier activated successfully',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to activate supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get supplier statistics.
   */
  public function stats()
  {
    $stats = $this->supplierService->getStats();

    return response()->json([
      'success' => true,
      'data' => $stats,
    ]);
  }
}
