<?php
// app/Http/Controllers/Api/SupplierQuotationController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\SupplierQuotationRequest;
use App\Http\Resources\Procurement\SupplierQuotationResource;
use App\Services\Procurement\Services\QuotationService;
use App\Services\Procurement\DTOs\SupplierQuotationDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupplierQuotationController extends Controller
{
  public function __construct(
    protected QuotationService $quotationService
  ) {}

  public function index(Request $request): JsonResponse
  {
    $qtnId = $request->input('qtn_id');
    $supplierId = $request->input('supplier_id');

    if ($qtnId) {
      $quotations = $this->quotationService->getQuotationsForQtn($qtnId);
    } elseif ($supplierId) {
      $quotations = $this->quotationService->getQuotationsBySupplier($supplierId);
    } else {
      $quotations = [];
    }

    return response()->json([
      'success' => true,
      'data' => $quotations,
      'message' => 'Supplier quotations retrieved successfully.',
    ]);
  }

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

  public function show(int $id): JsonResponse
  {
    $quotation = $this->quotationService->getSupplierQuotation($id);

    return response()->json([
      'success' => true,
      'data' => new SupplierQuotationResource($quotation),
      'message' => 'Supplier quotation retrieved successfully.',
    ]);
  }

  public function verify(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'status' => 'required|in:verified,rejected',
      'notes' => 'nullable|string',
    ]);

    $quotation = $this->quotationService->verifySupplierQuotation(
      $id,
      auth()->id(),
      $request->status,
      $request->notes
    );

    return response()->json([
      'success' => true,
      'data' => new SupplierQuotationResource($quotation),
      'message' => 'Supplier quotation verified successfully.',
    ]);
  }

  public function evaluate(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'score' => 'required|integer|min:0|max:100',
      'notes' => 'nullable|string',
    ]);

    $quotation = $this->quotationService->evaluateSupplierQuotation(
      $id,
      $request->score,
      $request->notes
    );

    return response()->json([
      'success' => true,
      'data' => new SupplierQuotationResource($quotation),
      'message' => 'Supplier quotation evaluated successfully.',
    ]);
  }

  public function lowest(int $qtnId): JsonResponse
  {
    $quotation = $this->quotationService->getLowestQuotation($qtnId);

    return response()->json([
      'success' => true,
      'data' => $quotation ? new SupplierQuotationResource($quotation) : null,
      'message' => $quotation ? 'Lowest quotation retrieved successfully.' : 'No quotations found.',
    ]);
  }
}
