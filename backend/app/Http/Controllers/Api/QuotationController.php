<?php
// app/Http/Controllers/Api/QuotationController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\QuotationRequest;
use App\Http\Resources\Procurement\QuotationResource;
use App\Services\Procurement\Services\QuotationService;
use App\Services\Procurement\DTOs\QuotationDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class QuotationController extends Controller
{
  public function __construct(
    protected QuotationService $quotationService
  ) {}

  public function index(Request $request): JsonResponse
  {
    $status = $request->input('status');

    if ($status === 'closing_soon') {
      $qtns = $this->quotationService->getQtnsClosingSoon();
    } else {
      $qtns = $this->quotationService->getActiveQtns();
    }

    return response()->json([
      'success' => true,
      'data' => $qtns,
      'message' => 'Quotation requests retrieved successfully.',
    ]);
  }

  public function store(QuotationRequest $request): JsonResponse
  {
    $dto = QuotationDTO::fromArray($request->validated());
    $qtn = $this->quotationService->createQuotationRequest($dto);

    return response()->json([
      'success' => true,
      'data' => new QuotationResource($qtn),
      'message' => 'Quotation request created successfully.',
    ], 201);
  }

  public function show(int $id): JsonResponse
  {
    $qtn = $this->quotationService->getQuotationRequest($id);

    return response()->json([
      'success' => true,
      'data' => new QuotationResource($qtn),
      'message' => 'Quotation request retrieved successfully.',
    ]);
  }

  public function send(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'supplier_ids' => 'required|array|min:1',
      'supplier_ids.*' => 'exists:users,id',
    ]);

    $qtn = $this->quotationService->sendQtnToSuppliers($id, $request->supplier_ids);

    return response()->json([
      'success' => true,
      'data' => new QuotationResource($qtn),
      'message' => 'Quotation request sent to suppliers successfully.',
    ]);
  }

  public function close(Request $request, int $id): JsonResponse
  {
    $reason = $request->input('reason');
    $qtn = $this->quotationService->closeQtn($id, $reason);

    return response()->json([
      'success' => true,
      'data' => new QuotationResource($qtn),
      'message' => 'Quotation request closed successfully.',
    ]);
  }

  public function cancel(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $qtn = $this->quotationService->cancelQtn($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new QuotationResource($qtn),
      'message' => 'Quotation request cancelled successfully.',
    ]);
  }

  public function sendReminder(int $id): JsonResponse
  {
    $this->quotationService->sendQtnReminder($id);

    return response()->json([
      'success' => true,
      'message' => 'Reminder sent to suppliers successfully.',
    ]);
  }

  public function statistics(int $id): JsonResponse
  {
    $stats = $this->quotationService->getQtnStatistics($id);

    return response()->json([
      'success' => true,
      'data' => $stats,
      'message' => 'QTN statistics retrieved successfully.',
    ]);
  }

  public function selectSupplier(Request $request): JsonResponse
  {
    $request->validate([
      'requisition_id' => 'required|exists:requisitions,id',
      'supplier_id' => 'required|exists:users,id',
      'quotation_id' => 'required|exists:supplier_quotations,id',
    ]);

    $requisition = $this->quotationService->selectSupplier(
      $request->requisition_id,
      $request->supplier_id,
      $request->quotation_id
    );

    return response()->json([
      'success' => true,
      'data' => [
        'requisition_id' => $requisition->id,
        'supplier_id' => $request->supplier_id,
        'quotation_id' => $request->quotation_id,
      ],
      'message' => 'Supplier selected successfully.',
    ]);
  }
}
