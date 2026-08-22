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
use App\Services\PDF\PDFStorageService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class SupplierQuotationController extends Controller
{
  public function __construct(
    protected QuotationService $quotationService,
    protected PDFStorageService $pdfStorageService
  ) {}

  /**
   * Get quotations filtered by qtn_id or supplier_id
   */
  public function index(Request $request): JsonResponse
  {
    $qtnId = $request->input('qtn_id');
    $supplierId = $request->input('supplier_id');

    if ($qtnId) {
      $quotations = $this->quotationService->getQuotationsForQtn((int) $qtnId);
    } elseif ($supplierId) {
      $quotations = $this->quotationService->getQuotationsBySupplier((int) $supplierId);
    } else {
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

  /**
   * Get a specific supplier quotation
   */
  public function show($id): JsonResponse
  {
    try {
      $quotation = SupplierQuotation::with([
        'supplier',
        'items',
        'quotationRequest',
        'evaluatedBy',
      ])->findOrFail($id);

      // If supplier is not loaded but supplier_id exists, manually load it
      if (!$quotation->supplier && $quotation->supplier_id) {
        $quotation->load('supplier');
      }

      return response()->json([
        'success' => true,
        'data' => new SupplierQuotationResource($quotation),
        'message' => 'Supplier quotation retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to fetch supplier quotation', [
        'id' => $id,
        'error' => $e->getMessage(),
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

  // ============================================================
  // PDF GENERATION METHODS FOR SUPPLIER QUOTATIONS
  // ============================================================

  /**
   * Download supplier quotation as PDF with cache-busting headers
   */
  public function downloadPDF(int $id): Response|JsonResponse
  {
    Log::info('[SupplierQuotationController::downloadPDF] ========== START ==========');
    Log::info('[SupplierQuotationController::downloadPDF] Quotation ID:', ['id' => $id]);

    try {
      // Load the supplier relationship explicitly
      $quotation = SupplierQuotation::with([
        'supplier',
        'items',
        'quotationRequest',
        'quotationRequest.requisition',
        'quotationRequest.requisition.department',
      ])->findOrFail($id);

      Log::info('[SupplierQuotationController] Quotation loaded with relations', [
        'quotation_id' => $quotation->id,
        'supplier_loaded' => $quotation->relationLoaded('supplier'),
        'supplier_exists' => $quotation->supplier ? true : false,
        'supplier_name' => $quotation->supplier?->company_name ?? 'null',
        'rfq_loaded' => $quotation->relationLoaded('quotationRequest'),
        'rfq_exists' => $quotation->quotationRequest ? true : false,
        'download_count' => $quotation->download_count ?? 0,
      ]);

      // Use the service - it will increment count
      $response = $this->quotationService->downloadSupplierQuotationPDFWithData($quotation);

      // Refresh to get updated count for logging
      $quotation->refresh();

      Log::info('[SupplierQuotationController::downloadPDF] PDF downloaded successfully', [
        'quotation_id' => $id,
        'download_count' => $quotation->download_count,
        'last_downloaded_at' => $quotation->last_downloaded_at,
      ]);

      // Add cache-busting headers to prevent browser/CDN caching
      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Count' => $quotation->download_count,
        'X-Generated-At' => now()->toDateTimeString(),
        'X-Version' => $quotation->download_count . '-' . now()->timestamp,
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::downloadPDF] Error:', [
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
   * Download supplier quotation as PDF with verified suffix and cache-busting
   */
  public function downloadVerifiedPDF(int $id): Response|JsonResponse
  {
    Log::info('[SupplierQuotationController::downloadVerifiedPDF] ========== START ==========');
    Log::info('[SupplierQuotationController::downloadVerifiedPDF] Quotation ID:', ['id' => $id]);

    try {
      // Load the supplier relationship explicitly
      $quotation = SupplierQuotation::with([
        'supplier',
        'items',
        'quotationRequest',
        'quotationRequest.requisition',
        'quotationRequest.requisition.department',
      ])->findOrFail($id);

      Log::info('[SupplierQuotationController] Verified PDF - Quotation loaded', [
        'quotation_id' => $quotation->id,
        'download_count' => $quotation->download_count ?? 0,
      ]);

      $response = $this->quotationService->downloadVerifiedSupplierQuotationPDF($quotation->id);

      // Refresh to get updated count for logging
      $quotation->refresh();

      Log::info('[SupplierQuotationController::downloadVerifiedPDF] Verified PDF downloaded successfully', [
        'quotation_id' => $id,
        'download_count' => $quotation->download_count,
      ]);

      // Add cache-busting headers
      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Count' => $quotation->download_count,
        'X-Generated-At' => now()->toDateTimeString(),
        'X-Version' => $quotation->download_count . '-' . now()->timestamp,
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::downloadVerifiedPDF] Error:', [
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
   * Download supplier quotation as PDF with draft suffix and cache-busting
   */
  public function downloadDraftPDF(int $id): Response|JsonResponse
  {
    Log::info('[SupplierQuotationController::downloadDraftPDF] ========== START ==========');
    Log::info('[SupplierQuotationController::downloadDraftPDF] Quotation ID:', ['id' => $id]);

    try {
      // Load the supplier relationship explicitly
      $quotation = SupplierQuotation::with([
        'supplier',
        'items',
        'quotationRequest',
        'quotationRequest.requisition',
        'quotationRequest.requisition.department',
      ])->findOrFail($id);

      Log::info('[SupplierQuotationController] Draft PDF - Quotation loaded', [
        'quotation_id' => $quotation->id,
        'download_count' => $quotation->download_count ?? 0,
      ]);

      $response = $this->quotationService->downloadDraftSupplierQuotationPDF($quotation->id);

      // Refresh to get updated count for logging
      $quotation->refresh();

      Log::info('[SupplierQuotationController::downloadDraftPDF] Draft PDF downloaded successfully', [
        'quotation_id' => $id,
        'download_count' => $quotation->download_count,
      ]);

      // Add cache-busting headers
      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Count' => $quotation->download_count,
        'X-Generated-At' => now()->toDateTimeString(),
        'X-Version' => $quotation->download_count . '-' . now()->timestamp,
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::downloadDraftPDF] Error:', [
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
   * Preview supplier quotation as PDF (inline display) with cache-busting
   */
  public function previewPDF(int $id): Response|JsonResponse
  {
    Log::info('[SupplierQuotationController::previewPDF] ========== START ==========');
    Log::info('[SupplierQuotationController::previewPDF] Quotation ID:', ['id' => $id]);

    try {
      $response = $this->quotationService->streamSupplierQuotationPDF($id);

      Log::info('[SupplierQuotationController::previewPDF] PDF preview generated successfully');

      // Add cache-busting headers for preview too
      return $response->withHeaders([
        'Cache-Control' => 'no-cache, no-store, must-revalidate, private',
        'Pragma' => 'no-cache',
        'Expires' => '0',
        'X-Content-Type-Options' => 'nosniff',
        'X-Generated-At' => now()->toDateTimeString(),
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::previewPDF] Error:', [
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
   * Get supplier quotation as base64 encoded PDF (for embedding in emails).
   */
  public function getBase64PDF(int $id): JsonResponse
  {
    Log::info('[SupplierQuotationController::getBase64PDF] ========== START ==========');
    Log::info('[SupplierQuotationController::getBase64PDF] Quotation ID:', ['id' => $id]);

    try {
      $result = $this->quotationService->getSupplierQuotationBase64PDF($id);

      Log::info('[SupplierQuotationController::getBase64PDF] Base64 PDF generated successfully', [
        'filename' => $result['filename'],
        'size' => $result['size'],
      ]);

      return response()->json([
        'success' => true,
        'data' => $result,
        'message' => 'Base64 PDF generated successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::getBase64PDF] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to generate base64 PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Save supplier quotation PDF to storage.
   */
  public function savePDF(int $id, string $suffix = ''): JsonResponse
  {
    Log::info('[SupplierQuotationController::savePDF] ========== START ==========');
    Log::info('[SupplierQuotationController::savePDF] Quotation ID:', ['id' => $id]);

    try {
      $path = $this->quotationService->saveSupplierQuotationPDF($id, $suffix);

      Log::info('[SupplierQuotationController::savePDF] PDF saved successfully:', [
        'path' => $path,
      ]);

      return response()->json([
        'success' => true,
        'data' => [
          'path' => $path,
          'url' => asset('storage/' . $path),
        ],
        'message' => 'PDF saved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::savePDF] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to save PDF: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Track a download without returning the file (for counting)
   * Uses PDFStorageService to increment download count consistently
   */
  public function trackDownload(int $id): JsonResponse
  {
    Log::info('[SupplierQuotationController::trackDownload] ========== START ==========');
    Log::info('[SupplierQuotationController::trackDownload] Quotation ID:', ['id' => $id]);

    try {
      $quotation = SupplierQuotation::findOrFail($id);

      // Get old count for logging
      $oldCount = $quotation->download_count ?? 0;

      // Use PDFStorageService to increment download count
      $quotation = $this->pdfStorageService->incrementDownloadCount($quotation);

      Log::info('[SupplierQuotationController::trackDownload] Download count incremented via PDFStorageService', [
        'quotation_id' => $id,
        'old_count' => $oldCount,
        'new_count' => $quotation->download_count,
        'last_downloaded_at' => $quotation->last_downloaded_at,
      ]);

      return response()->json([
        'success' => true,
        'data' => [
          'download_count' => $quotation->download_count,
          'last_downloaded_at' => $quotation->last_downloaded_at,
        ],
        'message' => 'Download tracked successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::trackDownload] Error:', [
        'quotation_id' => $id,
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
   * Get download statistics for a supplier quotation
   */
  public function getDownloadStats(int $id): JsonResponse
  {
    Log::info('[SupplierQuotationController::getDownloadStats] ========== START ==========');
    Log::info('[SupplierQuotationController::getDownloadStats] Quotation ID:', ['id' => $id]);

    try {
      $quotation = SupplierQuotation::findOrFail($id);

      return response()->json([
        'success' => true,
        'data' => [
          'download_count' => $quotation->download_count ?? 0,
          'last_downloaded_at' => $quotation->last_downloaded_at,
          'view_count' => $quotation->view_count ?? 0,
          'last_viewed_at' => $quotation->last_viewed_at,
          'shared_count' => $quotation->shared_count ?? 0,
          'last_shared_at' => $quotation->last_shared_at,
        ],
        'message' => 'Download statistics retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::getDownloadStats] Error:', [
        'quotation_id' => $id,
        'message' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve download statistics: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Track a view without returning the file (for counting)
   */
  public function trackView(int $id): JsonResponse
  {
    Log::info('[SupplierQuotationController::trackView] ========== START ==========');
    Log::info('[SupplierQuotationController::trackView] Quotation ID:', ['id' => $id]);

    try {
      $quotation = SupplierQuotation::findOrFail($id);

      // Get old count for logging
      $oldCount = $quotation->view_count ?? 0;

      // Increment view count
      $quotation->increment('view_count');
      $quotation->update(['last_viewed_at' => now()]);
      $quotation->refresh();

      Log::info('[SupplierQuotationController::trackView] View count incremented', [
        'quotation_id' => $id,
        'old_count' => $oldCount,
        'new_count' => $quotation->view_count,
      ]);

      return response()->json([
        'success' => true,
        'data' => [
          'view_count' => $quotation->view_count,
          'last_viewed_at' => $quotation->last_viewed_at,
        ],
        'message' => 'View tracked successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::trackView] Error:', [
        'quotation_id' => $id,
        'message' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to track view: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Track a share (for counting)
   */
  public function trackShare(Request $request, int $id): JsonResponse
  {
    Log::info('[SupplierQuotationController::trackShare] ========== START ==========');
    Log::info('[SupplierQuotationController::trackShare] Quotation ID:', ['id' => $id]);

    try {
      $quotation = SupplierQuotation::findOrFail($id);

      // Get old count for logging
      $oldCount = $quotation->shared_count ?? 0;

      // Increment shared count
      $quotation->increment('shared_count');
      $quotation->update(['last_shared_at' => now()]);
      $quotation->refresh();

      // Optionally store share details in metadata
      if ($request->has('share_method')) {
        $metadata = $quotation->metadata ?? [];
        if (is_string($metadata)) {
          $metadata = json_decode($metadata, true) ?? [];
        }
        if (!is_array($metadata)) {
          $metadata = [];
        }

        $metadata['shares'][] = [
          'method' => $request->input('share_method'),
          'recipient' => $request->input('recipient'),
          'timestamp' => now()->toDateTimeString(),
          'ip' => $request->ip(),
        ];

        $quotation->update(['metadata' => $metadata]);
      }

      Log::info('[SupplierQuotationController::trackShare] Shared count incremented', [
        'quotation_id' => $id,
        'old_count' => $oldCount,
        'new_count' => $quotation->shared_count,
        'share_method' => $request->input('share_method'),
      ]);

      return response()->json([
        'success' => true,
        'data' => [
          'shared_count' => $quotation->shared_count,
          'last_shared_at' => $quotation->last_shared_at,
        ],
        'message' => 'Share tracked successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::trackShare] Error:', [
        'quotation_id' => $id,
        'message' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to track share: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Force clear cache for a specific quotation PDF
   * This can be called when the quotation is updated
   */
  public function clearCache(int $id): JsonResponse
  {
    Log::info('[SupplierQuotationController::clearCache] ========== START ==========');
    Log::info('[SupplierQuotationController::clearCache] Quotation ID:', ['id' => $id]);

    try {
      $quotation = SupplierQuotation::findOrFail($id);

      // Update the updated_at timestamp to force cache invalidation
      $quotation->touch();

      // If there's a PDF upload, update its timestamp too
      if ($quotation->pdf_upload_id) {
        $upload = \App\Models\Upload::find($quotation->pdf_upload_id);
        if ($upload) {
          $upload->touch();
        }
      }

      Log::info('[SupplierQuotationController::clearCache] Cache cleared successfully', [
        'quotation_id' => $id,
        'updated_at' => $quotation->updated_at,
      ]);

      return response()->json([
        'success' => true,
        'data' => [
          'quotation_id' => $id,
          'cache_cleared_at' => now()->toDateTimeString(),
        ],
        'message' => 'Cache cleared successfully. Next download will fetch fresh PDF.',
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierQuotationController::clearCache] Error:', [
        'quotation_id' => $id,
        'message' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to clear cache: ' . $e->getMessage(),
      ], 500);
    }
  }
}
