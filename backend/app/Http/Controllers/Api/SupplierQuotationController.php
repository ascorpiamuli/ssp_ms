<?php
// app/Http/Controllers/Api/SupplierQuotationController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\SupplierQuotationRequest;
use App\Http\Resources\Procurement\SupplierQuotationResource;
use App\Models\SupplierQuotation;
use App\Services\Procurement\Services\QuotationService;
use App\Services\Procurement\DTOs\SupplierQuotationDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupplierQuotationController extends Controller
{
  public function __construct(
    protected QuotationService $quotationService
  ) {}

  /**
   * Get quotations filtered by qtn_id or supplier_id
   */
  public function index(Request $request): JsonResponse
  {
    $qtnId = $request->input('qtn_id');
    $supplierId = $request->input('supplier_id');

    if ($qtnId) {
      // Fix: Cast to int to match method signature
      $quotations = $this->quotationService->getQuotationsForQtn((int) $qtnId);
    } elseif ($supplierId) {
      // Fix: Cast to int to match method signature (assuming it expects int)
      $quotations = $this->quotationService->getQuotationsBySupplier((int) $supplierId);
    } else {
      // Return empty collection or all quotations based on your requirements
      $quotations = $this->quotationService->getAllQuotations();
    }

    return response()->json([
      'success' => true,
      'data' => $quotations,
      'message' => 'Supplier quotations retrieved successfully.',
    ]);
  }

  /**
   * Store a new supplier quotation
   */
  public function store(SupplierQuotationRequest $request): JsonResponse
  {
    $dto = SupplierQuotationDTO::fromArray($request->validated());
    $quotation = $this->quotationService->submitSupplierQuotation($dto);

    return response()->json([
      'success' => true,
      'data' => new SupplierQuotationResource($quotation),
      'message' => 'Supplier quotation submitted successfully.',
    ], 201);
  }

  public function show($id)
  {
    try {
      // Make sure we're loading the supplier relationship correctly
      $quotation = SupplierQuotation::with([
        'supplier', // This should load the supplier
        'items',
        'quotationRequest',
        'evaluatedBy',
      ])->findOrFail($id);

      // Debug: Check if supplier is loaded
      \Log::info('SupplierQuotationController - Checking supplier load', [
        'quotation_id' => $quotation->id,
        'supplier_id' => $quotation->supplier_id,
        'relation_loaded' => $quotation->relationLoaded('supplier'),
        'supplier_exists' => $quotation->supplier ? true : false,
        'supplier_data' => $quotation->supplier ? [
          'id' => $quotation->supplier->id,
          'company_name' => $quotation->supplier->company_name,
        ] : null,
      ]);

      // If supplier is not loaded but supplier_id exists, manually load it
      if (!$quotation->supplier && $quotation->supplier_id) {
        \Log::warning('SupplierQuotationController - Supplier not loaded, attempting manual load', [
          'quotation_id' => $quotation->id,
          'supplier_id' => $quotation->supplier_id,
        ]);

        // Manually load the supplier
        $quotation->load('supplier');

        \Log::info('SupplierQuotationController - After manual load', [
          'quotation_id' => $quotation->id,
          'supplier_exists' => $quotation->supplier ? true : false,
        ]);
      }

      return new SupplierQuotationResource($quotation);
    } catch (\Exception $e) {
      \Log::error('Failed to fetch supplier quotation', [
        'id' => $id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch quotation: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Verify a supplier quotation
   */
  public function verify(Request $request, int $id): JsonResponse
  {
    $validated = $request->validate([
      'status' => 'required|in:verified,rejected',
      'notes' => 'nullable|string',
    ]);

    $quotation = $this->quotationService->verifySupplierQuotation(
      $id,
      auth()->id(),
      $validated['status'],
      $validated['notes'] ?? null
    );

    return response()->json([
      'success' => true,
      'data' => new SupplierQuotationResource($quotation),
      'message' => 'Supplier quotation verified successfully.',
    ]);
  }

  /**
   * Evaluate a supplier quotation with a score
   */
  public function evaluate(Request $request, int $id): JsonResponse
  {
    $validated = $request->validate([
      'score' => 'required|integer|min:0|max:100',
      'notes' => 'nullable|string',
    ]);

    $quotation = $this->quotationService->evaluateSupplierQuotation(
      $id,
      (int) $validated['score'],
      $validated['notes'] ?? null
    );

    return response()->json([
      'success' => true,
      'data' => new SupplierQuotationResource($quotation),
      'message' => 'Supplier quotation evaluated successfully.',
    ]);
  }

  /**
   * Get the lowest quotation for a specific QTN
   */
  public function lowest(int $qtnId): JsonResponse
  {
    $quotation = $this->quotationService->getLowestQuotation($qtnId);

    return response()->json([
      'success' => true,
      'data' => $quotation ? new SupplierQuotationResource($quotation) : null,
      'message' => $quotation ? 'Lowest quotation retrieved successfully.' : 'No quotations found.',
    ]);
  }

  /**
   * Alternative approach using route model binding
   * Uncomment if you want to use route model binding instead
   */
  /*
  public function lowestWithBinding(Qtn $qtn): JsonResponse
  {
    $quotation = $this->quotationService->getLowestQuotation($qtn->id);

    return response()->json([
      'success' => true,
      'data' => $quotation ? new SupplierQuotationResource($quotation) : null,
      'message' => $quotation ? 'Lowest quotation retrieved successfully.' : 'No quotations found.',
    ]);
  }
  */
}
