<?php
// app/Http/Controllers/Api/PurchaseOrderController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\PurchaseOrderRequest;
use App\Http\Resources\Procurement\PurchaseOrderResource;
use App\Services\Procurement\Services\PurchaseOrderService;
use App\Services\Procurement\DTOs\PurchaseOrderDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PurchaseOrderController extends Controller
{
  public function __construct(
    protected PurchaseOrderService $purchaseOrderService
  ) {}

  public function index(Request $request): JsonResponse
  {
    $requisitionId = $request->input('requisition_id');

    if ($requisitionId) {
      $orders = $this->purchaseOrderService->getPurchaseOrdersForRequisition($requisitionId);
    } else {
      $orders = [];
    }

    return response()->json([
      'success' => true,
      'data' => $orders,
      'message' => 'Purchase orders retrieved successfully.',
    ]);
  }

  public function store(PurchaseOrderRequest $request): JsonResponse
  {
    $dto = PurchaseOrderDTO::fromArray($request->validated());
    $po = $this->purchaseOrderService->generatePurchaseOrder($dto);

    return response()->json([
      'success' => true,
      'data' => new PurchaseOrderResource($po),
      'message' => 'Purchase order generated successfully.',
    ], 201);
  }

  public function show(int $id): JsonResponse
  {
    $po = $this->purchaseOrderService->getPurchaseOrder($id);

    return response()->json([
      'success' => true,
      'data' => new PurchaseOrderResource($po),
      'message' => 'Purchase order retrieved successfully.',
    ]);
  }

  public function summary(int $id): JsonResponse
  {
    $summary = $this->purchaseOrderService->getPurchaseOrderSummary($id);

    return response()->json([
      'success' => true,
      'data' => $summary,
      'message' => 'Purchase order summary retrieved successfully.',
    ]);
  }

  public function approve(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'comment' => 'nullable|string',
    ]);

    $po = $this->purchaseOrderService->approvePurchaseOrder(
      $id,
      auth()->id(),
      $request->comment
    );

    return response()->json([
      'success' => true,
      'data' => new PurchaseOrderResource($po),
      'message' => 'Purchase order approved successfully.',
    ]);
  }

  public function issue(int $id): JsonResponse
  {
    $po = $this->purchaseOrderService->issuePurchaseOrder($id);

    return response()->json([
      'success' => true,
      'data' => new PurchaseOrderResource($po),
      'message' => 'Purchase order issued successfully.',
    ]);
  }

  public function sendToSupplier(int $id): JsonResponse
  {
    $po = $this->purchaseOrderService->sendPurchaseOrderToSupplier($id);

    return response()->json([
      'success' => true,
      'data' => new PurchaseOrderResource($po),
      'message' => 'Purchase order sent to supplier successfully.',
    ]);
  }

  public function acknowledge(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'supplier_id' => 'required|exists:users,id',
    ]);

    $po = $this->purchaseOrderService->acknowledgePurchaseOrder($id, $request->supplier_id);

    return response()->json([
      'success' => true,
      'data' => new PurchaseOrderResource($po),
      'message' => 'Purchase order acknowledged by supplier successfully.',
    ]);
  }

  public function markDelivered(int $id): JsonResponse
  {
    $po = $this->purchaseOrderService->markPurchaseOrderDelivered($id);

    return response()->json([
      'success' => true,
      'data' => new PurchaseOrderResource($po),
      'message' => 'Purchase order marked as delivered successfully.',
    ]);
  }

  public function complete(int $id): JsonResponse
  {
    $po = $this->purchaseOrderService->completePurchaseOrder($id);

    return response()->json([
      'success' => true,
      'data' => new PurchaseOrderResource($po),
      'message' => 'Purchase order completed successfully.',
    ]);
  }

  public function cancel(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $po = $this->purchaseOrderService->cancelPurchaseOrder($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new PurchaseOrderResource($po),
      'message' => 'Purchase order cancelled successfully.',
    ]);
  }

  public function pdf(int $id): JsonResponse
  {
    $pdfContent = $this->purchaseOrderService->generatePurchaseOrderPdf($id);

    return response()->json([
      'success' => true,
      'data' => [
        'pdf' => base64_encode($pdfContent),
      ],
      'message' => 'Purchase order PDF generated successfully.',
    ]);
  }

  public function deliveryProgress(int $id): JsonResponse
  {
    $progress = $this->purchaseOrderService->getDeliveryProgress($id);

    return response()->json([
      'success' => true,
      'data' => [
        'progress' => $progress,
      ],
      'message' => 'Delivery progress retrieved successfully.',
    ]);
  }

  public function overdue(): JsonResponse
  {
    $orders = $this->purchaseOrderService->getOverduePurchaseOrders();

    return response()->json([
      'success' => true,
      'data' => $orders,
      'message' => 'Overdue purchase orders retrieved successfully.',
    ]);
  }
}
