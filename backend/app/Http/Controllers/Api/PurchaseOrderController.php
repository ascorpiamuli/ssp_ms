<?php
// app/Http/Controllers/Api/PurchaseOrderController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\PurchaseOrderRequest;
use App\Http\Resources\Procurement\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use App\Services\Procurement\Services\PurchaseOrderService;
use App\Services\Procurement\DTOs\PurchaseOrderDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class PurchaseOrderController extends Controller
{
  public function __construct(
    protected PurchaseOrderService $purchaseOrderService
  ) {}

  /**
   * Get all purchase orders with filters and pagination
   *
   * @param Request $request
   * @return JsonResponse
   */
  public function index(Request $request): JsonResponse
  {
    $requisitionId = $request->input('requisition_id');

    // ✅ If requisition_id is provided, get orders for that specific requisition
    if ($requisitionId) {
      $orders = $this->purchaseOrderService->getPurchaseOrdersForRequisition((int) $requisitionId);

      return response()->json([
        'success' => true,
        'data' => $orders,
        'message' => 'Purchase orders retrieved successfully.',
      ]);
    }

    // ✅ Get all purchase orders with filters and pagination
    $filters = $request->only(['status', 'type', 'date_from', 'date_to', 'search']);

    // ✅ Cast per_page to integer (fix for type error)
    $perPage = (int) $request->input('per_page', 15);

    $orders = $this->purchaseOrderService->getPurchaseOrders($filters, $perPage);

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

    // ✅ Load all necessary relationships for the resource
    $po->load([
        'supplier',
        'items',
        'requisition',
        'requisition.items',
        'requisition.user',
        'requisition.department',
        'generatedBy',
        'checkedBy',
        'endorsedBy',
        'approvedBy',
        'pdfUpload',  // Load the upload relationship
        'pdfUpload.uploadedBy',  // Load the uploader relationship
    ]);

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
      'supplier_id' => 'required|exists:suppliers,id',
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

      // ============================================================
    // ✅ NEW WORKFLOW METHODS
    // ============================================================

  /**
   * ✅ Check purchase order (HOD)
   *
   * @param Request $request
   * @param int $id
   * @return JsonResponse
   */
  public function check(Request $request, int $id): JsonResponse
  {
    Log::info('[PurchaseOrderController::check] ========== START ==========');
    Log::info('[PurchaseOrderController::check] PO ID:', ['id' => $id]);
    Log::info('[PurchaseOrderController::check] User ID:', ['user_id' => auth()->id()]);

    try {
      $request->validate([
        'comment' => 'nullable|string|max:500',
      ]);

      $po = $this->purchaseOrderService->checkPurchaseOrder(
        $id,
        auth()->id(),
        $request->comment
      );

      // ✅ Load relationships for response
      $po->load([
        'supplier',
        'items',
        'requisition',
        'generatedBy',
        'checkedBy',
        'endorsedBy',
        'approvedBy',
        'pdfUpload',
        'pdfUpload.uploadedBy',
      ]);

      Log::info('[PurchaseOrderController::check] COMPLETED', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
      ]);

      return response()->json([
        'success' => true,
        'data' => new PurchaseOrderResource($po),
        'message' => 'Purchase order checked successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[PurchaseOrderController::check] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
      ], 422);
    }
  }

  /**
   * ✅ Endorse purchase order (Accountant)
   *
   * @param Request $request
   * @param int $id
   * @return JsonResponse
   */
  public function endorse(Request $request, int $id): JsonResponse
  {
    Log::info('[PurchaseOrderController::endorse] ========== START ==========');
    Log::info('[PurchaseOrderController::endorse] PO ID:', ['id' => $id]);
    Log::info('[PurchaseOrderController::endorse] User ID:', ['user_id' => auth()->id()]);

    try {
      $request->validate([
        'comment' => 'nullable|string|max:500',
      ]);

      $po = $this->purchaseOrderService->endorsePurchaseOrder(
        $id,
        auth()->id(),
        $request->comment
      );

      $po->load([
        'supplier',
        'items',
        'requisition',
        'generatedBy',
        'checkedBy',
        'endorsedBy',
        'approvedBy',
        'pdfUpload',
        'pdfUpload.uploadedBy',
      ]);

      Log::info('[PurchaseOrderController::endorse] COMPLETED', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
      ]);

      return response()->json([
        'success' => true,
        'data' => new PurchaseOrderResource($po),
        'message' => 'Purchase order endorsed successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[PurchaseOrderController::endorse] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
      ], 422);
    }
  }


  /**
   * ✅ Get workflow status for a purchase order
   *
   * @param int $id
   * @return JsonResponse
   */
  public function workflow(int $id): JsonResponse
  {
    Log::info('[PurchaseOrderController::workflow] ========== START ==========');
    Log::info('[PurchaseOrderController::workflow] PO ID:', ['id' => $id]);

    try {
      $workflow = $this->purchaseOrderService->getWorkflowStatus(
        $id,
        auth()->id()
      );

      Log::info('[PurchaseOrderController::workflow] COMPLETED', [
        'po_id' => $id,
      ]);

      return response()->json([
        'success' => true,
        'data' => $workflow,
        'message' => 'Workflow status retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[PurchaseOrderController::workflow] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
      ], 422);
    }
  }

  // ============================================================
  // PDF GENERATION METHODS FOR PURCHASE ORDERS
  // ============================================================

  /**
   * Download purchase order as PDF with cache-busting headers
   */
  public function downloadPDF(int $id): Response|JsonResponse
  {
    Log::info('[PurchaseOrderController::downloadPDF] ========== START ==========');
    Log::info('[PurchaseOrderController::downloadPDF] PO ID:', ['id' => $id]);

    try {
      // ✅ Get the purchase order first to track download
      $po = $this->purchaseOrderService->getPurchaseOrder($id);

      // ✅ Increment download count
      $po->increment('download_count');
      $po->save();

      Log::info('[PurchaseOrderController::downloadPDF] Download count incremented', [
        'po_id' => $id,
        'download_count' => $po->download_count,
      ]);

      // ✅ Generate the PDF response
      $response = $this->purchaseOrderService->generatePurchaseOrderPdfResponse($id);

      // Add cache-busting headers to prevent browser/CDN caching
      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Count' => $po->download_count,
        'X-Generated-At' => now()->toDateTimeString(),
        'X-Version' => $po->download_count . '-' . now()->timestamp,
      ]);
    } catch (\Exception $e) {
      Log::error('[PurchaseOrderController::downloadPDF] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to download PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Preview purchase order as PDF (inline display) with cache-busting
   */
  public function previewPDF(int $id): Response|JsonResponse
  {
    Log::info('[PurchaseOrderController::previewPDF] ========== START ==========');
    Log::info('[PurchaseOrderController::previewPDF] PO ID:', ['id' => $id]);

    try {
      $response = $this->purchaseOrderService->streamPurchaseOrderPDF($id);

      Log::info('[PurchaseOrderController::previewPDF] PDF preview generated successfully');

      // Add cache-busting headers for preview too
      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Generated-At' => now()->toDateTimeString(),
      ]);
    } catch (\Exception $e) {
      Log::error('[PurchaseOrderController::previewPDF] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to preview PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Track a download without returning the file (for counting)
   */
  public function trackDownload(int $id): JsonResponse
  {
    Log::info('[PurchaseOrderController::trackDownload] ========== START ==========');
    Log::info('[PurchaseOrderController::trackDownload] PO ID:', ['id' => $id]);

    try {
      $po = $this->purchaseOrderService->getPurchaseOrder($id);

      // Increment download count
      $po->increment('download_count');
      $po->save();

      Log::info('[PurchaseOrderController::trackDownload] Download count incremented', [
        'po_id' => $id,
        'old_count' => $po->getOriginal('download_count'),
        'new_count' => $po->download_count,
      ]);

      return response()->json([
        'success' => true,
        'data' => [
          'download_count' => $po->download_count,
          'last_downloaded_at' => $po->last_downloaded_at ?? now(),
        ],
        'message' => 'Download tracked successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[PurchaseOrderController::trackDownload] Error:', [
        'po_id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to track download: ' . $e->getMessage(),
      ], 500);
    }
  }
}
