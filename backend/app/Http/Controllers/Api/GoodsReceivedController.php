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
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class GoodsReceivedController extends Controller
{
  public function __construct(
    protected GoodsReceivedService $goodsReceivedService
  ) {}

  /**
   * Display a listing of the resource.
   */
  public function index(Request $request): JsonResponse
  {
    $purchaseOrderId = $request->input('purchase_order_id');
    $type = $request->input('type');
    $status = $request->input('status');
    $filter = $request->input('filter', 'all');

    if ($type === 'san') {
      if ($purchaseOrderId) {
        $sans = $this->goodsReceivedService->getSansForPurchaseOrder($purchaseOrderId);
      } elseif ($filter === 'pending') {
        $sans = $this->goodsReceivedService->getPendingApprovalSans();
      } elseif ($status) {
        $sans = $this->goodsReceivedService->getSansByStatus($status);
      } else {
        $sans = $this->goodsReceivedService->getAllSans();
      }

      return response()->json([
        'success' => true,
        'data' => $sans,
        'message' => 'Service Acknowledgment Notes retrieved successfully.',
      ]);
    }

    // Get GRNs based on filters
    if ($purchaseOrderId) {
      $grns = $this->goodsReceivedService->getGrnsForPurchaseOrder($purchaseOrderId);
    } elseif ($filter === 'pending') {
      $grns = $this->goodsReceivedService->getPendingApprovalGrns();
    } elseif ($status) {
      $grns = $this->goodsReceivedService->getGrnsByStatus($status);
    } else {
      $grns = $this->goodsReceivedService->getAllGrns();
    }

    return response()->json([
      'success' => true,
      'data' => $grns,
      'message' => 'Goods Received Notes retrieved successfully.',
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
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

  /**
   * Display the specified resource.
   */
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

  /**
   * Get GRN summary.
   */
  public function summary(int $id): JsonResponse
  {
    $summary = $this->goodsReceivedService->getGrnSummary($id);

    return response()->json([
      'success' => true,
      'data' => $summary,
      'message' => 'GRN summary retrieved successfully.',
    ]);
  }

  /**
   * Get SAN summary.
   */
  public function sanSummary(int $id): JsonResponse
  {
    $summary = $this->goodsReceivedService->getSanSummary($id);

    return response()->json([
      'success' => true,
      'data' => $summary,
      'message' => 'SAN summary retrieved successfully.',
    ]);
  }

  /**
   * Submit a GRN for approval.
   */
  public function submit(int $id): JsonResponse
  {
    $grn = $this->goodsReceivedService->submitGrnForApproval($id);

    return response()->json([
      'success' => true,
      'data' => new GoodsReceivedResource($grn),
      'message' => 'GRN submitted for approval successfully.',
    ]);
  }

  /**
   * Submit a SAN for approval.
   */
  public function submitSan(int $id): JsonResponse
  {
    $san = $this->goodsReceivedService->submitSanForApproval($id);

    return response()->json([
      'success' => true,
      'data' => new ServiceAcknowledgmentResource($san),
      'message' => 'SAN submitted for approval successfully.',
    ]);
  }

  /**
   * Approve a GRN.
   */
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

  /**
   * Approve a SAN.
   */
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

  /**
   * Reject a GRN.
   */
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

  /**
   * Reject a SAN.
   */
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

  /**
   * Inspect goods for a GRN.
   */
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

  /**
   * Rate service quality for a SAN.
   */
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

  // ============================================================
  // PDF GENERATION METHODS FOR GOODS RECEIVED NOTES (GRN)
  // ============================================================

  /**
   * Download GRN as PDF with cache-busting headers
   */
  public function pdf(int $id): Response|JsonResponse
  {
    Log::info('[GoodsReceivedController::pdf] ========== START ==========');
    Log::info('[GoodsReceivedController::pdf] GRN ID:', ['id' => $id]);

    try {
      // Get the GRN first to track download
      $grn = $this->goodsReceivedService->getGrn($id);

      // Increment download count
      $grn->increment('download_count');
      $grn->save();

      Log::info('[GoodsReceivedController::pdf] Download count incremented', [
        'grn_id' => $id,
        'download_count' => $grn->download_count,
      ]);

      // Generate the PDF response
      $response = $this->goodsReceivedService->generateGrnPdfResponse($id);

      // Add cache-busting headers to prevent browser/CDN caching
      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Count' => $grn->download_count,
        'X-Generated-At' => now()->toDateTimeString(),
        'X-Version' => $grn->download_count . '-' . now()->timestamp,
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::pdf] Error:', [
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
   * Preview GRN as PDF (inline display) with cache-busting
   */
  public function previewPDF(int $id): Response|JsonResponse
  {
    Log::info('[GoodsReceivedController::previewPDF] ========== START ==========');
    Log::info('[GoodsReceivedController::previewPDF] GRN ID:', ['id' => $id]);

    try {
      $response = $this->goodsReceivedService->streamGrnPDF($id);

      Log::info('[GoodsReceivedController::previewPDF] PDF preview generated successfully');

      // Add cache-busting headers for preview too
      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Generated-At' => now()->toDateTimeString(),
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::previewPDF] Error:', [
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
   * Get GRN as Base64 encoded PDF (for email attachments)
   */
  public function getBase64PDF(int $id): JsonResponse
  {
    Log::info('[GoodsReceivedController::getBase64PDF] ========== START ==========');
    Log::info('[GoodsReceivedController::getBase64PDF] GRN ID:', ['id' => $id]);

    try {
      $pdfContent = $this->goodsReceivedService->generateGrnPdf($id);

      return response()->json([
        'success' => true,
        'data' => [
          'pdf' => base64_encode($pdfContent),
          'filename' => 'GRN-' . $id . '.pdf',
        ],
        'message' => 'GRN PDF generated successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::getBase64PDF] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to generate PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Track a download without returning the file (for counting)
   */
  public function trackDownload(int $id): JsonResponse
  {
    Log::info('[GoodsReceivedController::trackDownload] ========== START ==========');
    Log::info('[GoodsReceivedController::trackDownload] GRN ID:', ['id' => $id]);

    try {
      $grn = $this->goodsReceivedService->getGrn($id);

      // Increment download count
      $grn->increment('download_count');
      $grn->save();

      Log::info('[GoodsReceivedController::trackDownload] Download count incremented', [
        'grn_id' => $id,
        'old_count' => $grn->getOriginal('download_count'),
        'new_count' => $grn->download_count,
      ]);

      return response()->json([
        'success' => true,
        'data' => [
          'download_count' => $grn->download_count,
          'last_downloaded_at' => $grn->last_downloaded_at ?? now(),
        ],
        'message' => 'Download tracked successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::trackDownload] Error:', [
        'grn_id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to track download: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Download verified GRN PDF
   */
  public function downloadVerifiedPDF(int $id): Response|JsonResponse
  {
    Log::info('[GoodsReceivedController::downloadVerifiedPDF] ========== START ==========');
    Log::info('[GoodsReceivedController::downloadVerifiedPDF] GRN ID:', ['id' => $id]);

    try {
      $grn = $this->goodsReceivedService->getGrn($id);

      // Increment download count
      $grn->increment('download_count');
      $grn->save();

      $response = $this->goodsReceivedService->generateVerifiedGrnPdfResponse($id);

      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Count' => $grn->download_count,
        'X-Generated-At' => now()->toDateTimeString(),
        'X-Version' => $grn->download_count . '-' . now()->timestamp,
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::downloadVerifiedPDF] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to download verified PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Download draft GRN PDF
   */
  public function downloadDraftPDF(int $id): Response|JsonResponse
  {
    Log::info('[GoodsReceivedController::downloadDraftPDF] ========== START ==========');
    Log::info('[GoodsReceivedController::downloadDraftPDF] GRN ID:', ['id' => $id]);

    try {
      $grn = $this->goodsReceivedService->getGrn($id);

      // Increment download count
      $grn->increment('download_count');
      $grn->save();

      $response = $this->goodsReceivedService->generateDraftGrnPdfResponse($id);

      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Count' => $grn->download_count,
        'X-Generated-At' => now()->toDateTimeString(),
        'X-Version' => $grn->download_count . '-' . now()->timestamp,
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::downloadDraftPDF] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to download draft PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Save GRN PDF to storage
   */
  public function savePDF(int $id): JsonResponse
  {
    Log::info('[GoodsReceivedController::savePDF] ========== START ==========');
    Log::info('[GoodsReceivedController::savePDF] GRN ID:', ['id' => $id]);

    try {
      $grn = $this->goodsReceivedService->getGrn($id);

      $result = $this->goodsReceivedService->saveGrnPdfToStorage($id);

      Log::info('[GoodsReceivedController::savePDF] PDF saved successfully', [
        'grn_id' => $id,
        'path' => $result['path'] ?? null,
      ]);

      return response()->json([
        'success' => true,
        'data' => $result,
        'message' => 'PDF saved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::savePDF] Error:', [
        'grn_id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to save PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  // ============================================================
  // PDF GENERATION METHODS FOR SERVICE ACKNOWLEDGMENT NOTES (SAN)
  // ============================================================

  /**
   * Download SAN as PDF with cache-busting headers
   */
  public function pdfSan(int $id): Response|JsonResponse
  {
    Log::info('[GoodsReceivedController::pdfSan] ========== START ==========');
    Log::info('[GoodsReceivedController::pdfSan] SAN ID:', ['id' => $id]);

    try {
      // Get the SAN first to track download
      $san = $this->goodsReceivedService->getSan($id);

      // Increment download count
      $san->increment('download_count');
      $san->save();

      Log::info('[GoodsReceivedController::pdfSan] Download count incremented', [
        'san_id' => $id,
        'download_count' => $san->download_count,
      ]);

      // Generate the PDF response
      $response = $this->goodsReceivedService->generateSanPdfResponse($id);

      // Add cache-busting headers to prevent browser/CDN caching
      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Count' => $san->download_count,
        'X-Generated-At' => now()->toDateTimeString(),
        'X-Version' => $san->download_count . '-' . now()->timestamp,
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::pdfSan] Error:', [
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
   * Preview SAN as PDF (inline display) with cache-busting
   */
  public function previewSanPDF(int $id): Response|JsonResponse
  {
    Log::info('[GoodsReceivedController::previewSanPDF] ========== START ==========');
    Log::info('[GoodsReceivedController::previewSanPDF] SAN ID:', ['id' => $id]);

    try {
      $response = $this->goodsReceivedService->streamSanPDF($id);

      Log::info('[GoodsReceivedController::previewSanPDF] PDF preview generated successfully');

      // Add cache-busting headers for preview too
      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Generated-At' => now()->toDateTimeString(),
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::previewSanPDF] Error:', [
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
   * Get SAN as Base64 encoded PDF (for email attachments)
   */
  public function getBase64SanPDF(int $id): JsonResponse
  {
    Log::info('[GoodsReceivedController::getBase64SanPDF] ========== START ==========');
    Log::info('[GoodsReceivedController::getBase64SanPDF] SAN ID:', ['id' => $id]);

    try {
      $pdfContent = $this->goodsReceivedService->generateSanPdf($id);

      return response()->json([
        'success' => true,
        'data' => [
          'pdf' => base64_encode($pdfContent),
          'filename' => 'SAN-' . $id . '.pdf',
        ],
        'message' => 'SAN PDF generated successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::getBase64SanPDF] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to generate PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Track a download for SAN without returning the file (for counting)
   */
  public function trackDownloadSan(int $id): JsonResponse
  {
    Log::info('[GoodsReceivedController::trackDownloadSan] ========== START ==========');
    Log::info('[GoodsReceivedController::trackDownloadSan] SAN ID:', ['id' => $id]);

    try {
      $san = $this->goodsReceivedService->getSan($id);

      // Increment download count
      $san->increment('download_count');
      $san->save();

      Log::info('[GoodsReceivedController::trackDownloadSan] Download count incremented', [
        'san_id' => $id,
        'old_count' => $san->getOriginal('download_count'),
        'new_count' => $san->download_count,
      ]);

      return response()->json([
        'success' => true,
        'data' => [
          'download_count' => $san->download_count,
          'last_downloaded_at' => $san->last_downloaded_at ?? now(),
        ],
        'message' => 'Download tracked successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::trackDownloadSan] Error:', [
        'san_id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to track download: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Download verified SAN PDF
   */
  public function downloadVerifiedSanPDF(int $id): Response|JsonResponse
  {
    Log::info('[GoodsReceivedController::downloadVerifiedSanPDF] ========== START ==========');
    Log::info('[GoodsReceivedController::downloadVerifiedSanPDF] SAN ID:', ['id' => $id]);

    try {
      $san = $this->goodsReceivedService->getSan($id);

      // Increment download count
      $san->increment('download_count');
      $san->save();

      $response = $this->goodsReceivedService->generateVerifiedSanPdfResponse($id);

      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Count' => $san->download_count,
        'X-Generated-At' => now()->toDateTimeString(),
        'X-Version' => $san->download_count . '-' . now()->timestamp,
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::downloadVerifiedSanPDF] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to download verified PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Download draft SAN PDF
   */
  public function downloadDraftSanPDF(int $id): Response|JsonResponse
  {
    Log::info('[GoodsReceivedController::downloadDraftSanPDF] ========== START ==========');
    Log::info('[GoodsReceivedController::downloadDraftSanPDF] SAN ID:', ['id' => $id]);

    try {
      $san = $this->goodsReceivedService->getSan($id);

      // Increment download count
      $san->increment('download_count');
      $san->save();

      $response = $this->goodsReceivedService->generateDraftSanPdfResponse($id);

      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Count' => $san->download_count,
        'X-Generated-At' => now()->toDateTimeString(),
        'X-Version' => $san->download_count . '-' . now()->timestamp,
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::downloadDraftSanPDF] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to download draft PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Save SAN PDF to storage
   */
  public function saveSanPDF(int $id): JsonResponse
  {
    Log::info('[GoodsReceivedController::saveSanPDF] ========== START ==========');
    Log::info('[GoodsReceivedController::saveSanPDF] SAN ID:', ['id' => $id]);

    try {
      $san = $this->goodsReceivedService->getSan($id);

      $result = $this->goodsReceivedService->saveSanPdfToStorage($id);

      Log::info('[GoodsReceivedController::saveSanPDF] PDF saved successfully', [
        'san_id' => $id,
        'path' => $result['path'] ?? null,
      ]);

      return response()->json([
        'success' => true,
        'data' => $result,
        'message' => 'PDF saved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[GoodsReceivedController::saveSanPDF] Error:', [
        'san_id' => $id,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to save PDF: ' . $e->getMessage(),
      ], 500);
    }
  }
}
