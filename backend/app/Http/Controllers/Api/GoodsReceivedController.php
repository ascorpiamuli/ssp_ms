<?php
// app/Http/Controllers/Api/GoodsReceivedController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\GoodsReceivedRequest;
use App\Http\Resources\Procurement\GoodsReceivedResource;
use App\Http\Resources\Procurement\ServiceAcknowledgmentResource;
use App\Services\Procurement\Services\GoodsReceivedService;
use App\Services\Procurement\DTOs\GoodsReceivedDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GoodsReceivedController extends Controller
{
  public function __construct(
    protected GoodsReceivedService $goodsReceivedService
  ) {}

  public function index(Request $request): JsonResponse
  {
    $purchaseOrderId = $request->input('purchase_order_id');
    $type = $request->input('type');

    if ($type === 'san') {
      $sans = $purchaseOrderId
        ? $this->goodsReceivedService->getSansForPurchaseOrder($purchaseOrderId)
        : $this->goodsReceivedService->getPendingApprovalSans();

      return response()->json([
        'success' => true,
        'data' => $sans,
        'message' => 'Service Acknowledgment Notes retrieved successfully.',
      ]);
    }

    $grns = $purchaseOrderId
      ? $this->goodsReceivedService->getGrnsForPurchaseOrder($purchaseOrderId)
      : $this->goodsReceivedService->getPendingApprovalGrns();

    return response()->json([
      'success' => true,
      'data' => $grns,
      'message' => 'Goods Received Notes retrieved successfully.',
    ]);
  }

  public function store(GoodsReceivedRequest $request): JsonResponse
  {
    $dto = GoodsReceivedDTO::fromArray($request->validated());

    if ($dto->type === 'san') {
      $san = $this->goodsReceivedService->createSan($dto);
      return response()->json([
        'success' => true,
        'data' => new ServiceAcknowledgmentResource($san),
        'message' => 'Service Acknowledgment Note created successfully.',
      ], 201);
    }

    $grn = $this->goodsReceivedService->createGrn($dto);

    return response()->json([
      'success' => true,
      'data' => new GoodsReceivedResource($grn),
      'message' => 'Goods Received Note created successfully.',
    ], 201);
  }

  public function show(Request $request, int $id): JsonResponse
  {
    $type = $request->input('type', 'grn');

    if ($type === 'san') {
      $san = $this->goodsReceivedService->getSan($id);
      return response()->json([
        'success' => true,
        'data' => new ServiceAcknowledgmentResource($san),
        'message' => 'Service Acknowledgment Note retrieved successfully.',
      ]);
    }

    $grn = $this->goodsReceivedService->getGrn($id);

    return response()->json([
      'success' => true,
      'data' => new GoodsReceivedResource($grn),
      'message' => 'Goods Received Note retrieved successfully.',
    ]);
  }

  public function summary(int $id): JsonResponse
  {
    $summary = $this->goodsReceivedService->getGrnSummary($id);

    return response()->json([
      'success' => true,
      'data' => $summary,
      'message' => 'GRN summary retrieved successfully.',
    ]);
  }

  public function sanSummary(int $id): JsonResponse
  {
    $summary = $this->goodsReceivedService->getSanSummary($id);

    return response()->json([
      'success' => true,
      'data' => $summary,
      'message' => 'SAN summary retrieved successfully.',
    ]);
  }

  public function submit(int $id): JsonResponse
  {
    $grn = $this->goodsReceivedService->submitGrnForApproval($id);

    return response()->json([
      'success' => true,
      'data' => new GoodsReceivedResource($grn),
      'message' => 'GRN submitted for approval successfully.',
    ]);
  }

  public function submitSan(int $id): JsonResponse
  {
    $san = $this->goodsReceivedService->submitSanForApproval($id);

    return response()->json([
      'success' => true,
      'data' => new ServiceAcknowledgmentResource($san),
      'message' => 'SAN submitted for approval successfully.',
    ]);
  }

  public function approve(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'comment' => 'nullable|string',
    ]);

    $grn = $this->goodsReceivedService->approveGrn($id, auth()->id(), $request->comment);

    return response()->json([
      'success' => true,
      'data' => new GoodsReceivedResource($grn),
      'message' => 'GRN approved successfully.',
    ]);
  }

  public function approveSan(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'comment' => 'nullable|string',
    ]);

    $san = $this->goodsReceivedService->approveSan($id, auth()->id(), $request->comment);

    return response()->json([
      'success' => true,
      'data' => new ServiceAcknowledgmentResource($san),
      'message' => 'SAN approved successfully.',
    ]);
  }

  public function reject(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $grn = $this->goodsReceivedService->rejectGrn($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new GoodsReceivedResource($grn),
      'message' => 'GRN rejected successfully.',
    ]);
  }

  public function rejectSan(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $san = $this->goodsReceivedService->rejectSan($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new ServiceAcknowledgmentResource($san),
      'message' => 'SAN rejected successfully.',
    ]);
  }

  public function inspect(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'inspection_result' => 'required|in:passed,failed,partial',
      'inspection_notes' => 'nullable|string',
      'items' => 'array',
      'items.*.id' => 'required|exists:goods_received_items,id',
      'items.*.quality_status' => 'required|in:pending,passed,failed,conditional',
      'items.*.quality_notes' => 'nullable|string',
    ]);

    $grn = $this->goodsReceivedService->inspectGoods($id, $request->all());

    return response()->json([
      'success' => true,
      'data' => new GoodsReceivedResource($grn),
      'message' => 'Goods inspected successfully.',
    ]);
  }

  public function rateService(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'quality_rating' => 'required|in:excellent,good,average,poor',
      'quality_notes' => 'nullable|string',
      'performance_notes' => 'nullable|string',
    ]);

    $san = $this->goodsReceivedService->qualityRateService($id, $request->all());

    return response()->json([
      'success' => true,
      'data' => new ServiceAcknowledgmentResource($san),
      'message' => 'Service quality rated successfully.',
    ]);
  }

  public function pdf(int $id): JsonResponse
  {
    $pdfContent = $this->goodsReceivedService->generateGrnPdf($id);

    return response()->json([
      'success' => true,
      'data' => [
        'pdf' => base64_encode($pdfContent),
      ],
      'message' => 'GRN PDF generated successfully.',
    ]);
  }

  public function pdfSan(int $id): JsonResponse
  {
    $pdfContent = $this->goodsReceivedService->generateSanPdf($id);

    return response()->json([
      'success' => true,
      'data' => [
        'pdf' => base64_encode($pdfContent),
      ],
      'message' => 'SAN PDF generated successfully.',
    ]);
  }
}
