<?php
// app/Http/Controllers/Api/RequestForQuotationController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\QuotationRequest;
use App\Http\Resources\Procurement\QuotationResource;
use App\Models\QuotationRequest as QuotationRequestModel;
use App\Models\SupplierQuotation;
use App\Services\Procurement\Services\QuotationService;
use App\Services\Procurement\DTOs\QuotationDTO;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class RequestForQuotationController extends Controller
{
  public function __construct(
    protected QuotationService $quotationService
  ) {}

  /**
   * Display a listing of Request for Quotations.
   */
  public function index(Request $request): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::index] ========== START ==========');

    $status = $request->input('status');
    $perPage = $request->input('per_page', 15);
    $search = $request->input('search');

    Log::info('🔍 [RequestForQuotationController::index] Request parameters:', [
      'status' => $status,
      'per_page' => $perPage,
      'search' => $search,
    ]);

    try {
      $query = QuotationRequestModel::with(['requisition', 'generatedBy', 'supplierQuotations'])
        ->whereNotIn('status', ['cancelled', 'expired']);

      Log::info('🔍 [RequestForQuotationController::index] Base query built');

      if ($status === 'closing_soon') {
        Log::info('🔍 [RequestForQuotationController::index] Applying closing_soon filter');
        $query->whereDate('closing_date', '<=', now()->addDays(2))
          ->whereDate('closing_date', '>=', now())
          ->whereNotIn('status', ['closed', 'cancelled']);
      } elseif ($status === 'active') {
        Log::info('🔍 [RequestForQuotationController::index] Applying active filter');
        $query->whereIn('status', ['sent', 'responded', 'evaluating']);
      } elseif ($status && $status !== 'all' && $status !== 'undefined') {
        Log::info('🔍 [RequestForQuotationController::index] Applying status filter:', ['status' => $status]);
        $query->where('status', $status);
      } else {
        Log::info('🔍 [RequestForQuotationController::index] No specific status filter applied');
      }

      if ($search) {
        Log::info('🔍 [RequestForQuotationController::index] Applying search filter:', ['search' => $search]);
        $query->where(function ($q) use ($search) {
          $q->where('qtn_number', 'LIKE', "%{$search}%")
            ->orWhere('title', 'LIKE', "%{$search}%")
            ->orWhere('description', 'LIKE', "%{$search}%");
        });
      }

      $query->orderBy('created_at', 'desc');

      $sql = $query->toSql();
      $bindings = $query->getBindings();
      Log::info('🔍 [RequestForQuotationController::index] SQL Query:', [
        'sql' => $sql,
        'bindings' => $bindings,
      ]);

      $totalCount = $query->count();
      Log::info('🔍 [RequestForQuotationController::index] Total count before pagination:', [
        'count' => $totalCount,
      ]);

      $qtns = $query->paginate($perPage);

      Log::info('🔍 [RequestForQuotationController::index] Pagination result:', [
        'current_page' => $qtns->currentPage(),
        'per_page' => $qtns->perPage(),
        'total' => $qtns->total(),
        'count' => $qtns->count(),
        'has_more_pages' => $qtns->hasMorePages(),
      ]);

      if ($qtns->count() > 0) {
        Log::info('🔍 [RequestForQuotationController::index] Sample data:', [
          'first_item' => $qtns->first()->toArray(),
        ]);
      } else {
        Log::info('🔍 [RequestForQuotationController::index] No data found');
      }

      Log::info('🔍 [RequestForQuotationController::index] ========== END ==========');

      return response()->json([
        'success' => true,
        'data' => $qtns,
        'message' => 'Request for Quotations retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::index] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve Request for Quotations: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Store a newly created Request for Quotation.
   */
  public function store(QuotationRequest $request): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::store] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::store] Request data:', $request->validated());

    try {
      $dto = QuotationDTO::fromArray($request->validated());
      $qtn = $this->quotationService->createQuotationRequest($dto);

      Log::info('✅ [RequestForQuotationController::store] RFQ created:', [
        'rfq_id' => $qtn->id,
        'rfq_number' => $qtn->qtn_number,
      ]);

      Log::info('🔍 [RequestForQuotationController::store] ========== END ==========');

      return response()->json([
        'success' => true,
        'data' => new QuotationResource($qtn),
        'message' => 'Request for Quotation created successfully.',
      ], 201);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::store] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to create RFQ: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Display the specified Request for Quotation.
   */
  public function show(int $id): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::show] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::show] RFQ ID:', ['id' => $id]);

    try {
      $qtn = $this->quotationService->getQuotationRequest($id);

      Log::info('✅ [RequestForQuotationController::show] RFQ found:', [
        'rfq_id' => $qtn->id,
        'rfq_number' => $qtn->qtn_number,
        'status' => $qtn->status,
      ]);

      Log::info('🔍 [RequestForQuotationController::show] ========== END ==========');

      return response()->json([
        'success' => true,
        'data' => new QuotationResource($qtn),
        'message' => 'Request for Quotation retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::show] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve RFQ: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update the specified Request for Quotation.
   *
   * @param Request $request
   * @param int $id
   * @return JsonResponse
   */
  public function update(Request $request, int $id): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::update] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::update] RFQ ID:', ['id' => $id]);
    Log::info('🔍 [RequestForQuotationController::update] Request data:', $request->all());

    try {
      // 1. Validate the request
      $validated = $request->validate([
        'title' => 'sometimes|required|string|max:255',
        'description' => 'nullable|string',
        'closing_date' => 'sometimes|required|date|after_or_equal:today',
        'issue_date' => 'sometimes|required|date',
        'closing_time' => 'nullable|string',
        'delivery_terms' => 'nullable|string',
        'payment_terms' => 'nullable|string',
        'special_conditions' => 'nullable|string',
        'instructions' => 'nullable|string',
        'is_automated' => 'sometimes|boolean',
        'is_tender' => 'sometimes|boolean',
        'reminder_days' => 'nullable|integer|min:1|max:30',
        'metadata' => 'nullable|array',
      ]);

      // 2. Get the RFQ
      $qtn = $this->quotationService->getQuotationRequest($id);

      // 3. Check if RFQ can be updated (only draft status)
      if ($qtn->status !== 'draft') {
        Log::warning('⚠️ [RequestForQuotationController::update] RFQ cannot be updated', [
          'id' => $id,
          'status' => $qtn->status
        ]);

        return response()->json([
          'success' => false,
          'message' => 'RFQ cannot be updated because it is in "' . $qtn->status . '" status. Only draft RFQs can be edited.',
          'current_status' => $qtn->status,
          'allowed_statuses' => ['draft']
        ], 422);
      }

      // 4. Check if closing date is being changed and validate it
      if (isset($validated['closing_date'])) {
        $closingDate = \Carbon\Carbon::parse($validated['closing_date']);

        // Closing date must be at least 1 day from now
        if ($closingDate->isPast()) {
          return response()->json([
            'success' => false,
            'message' => 'Closing date must be in the future.'
          ], 422);
        }

        // Warn if closing date is less than 3 days from now (just for logging)
        if ($closingDate->diffInDays(now()) < 3) {
          Log::info('⚠️ [RequestForQuotationController::update] Closing date is soon', [
            'days_remaining' => $closingDate->diffInDays(now())
          ]);
        }
      }

      // 5. Update the RFQ using the service
      $updatedQtn = $this->quotationService->updateQuotationRequest($id, $validated);

      Log::info('✅ [RequestForQuotationController::update] RFQ updated successfully:', [
        'rfq_id' => $updatedQtn->id,
        'rfq_number' => $updatedQtn->qtn_number,
        'status' => $updatedQtn->status,
      ]);

      Log::info('🔍 [RequestForQuotationController::update] ========== END ==========');

      return response()->json([
        'success' => true,
        'data' => new QuotationResource($updatedQtn),
        'message' => 'Request for Quotation updated successfully.'
      ], 200);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::error('❌ [RequestForQuotationController::update] Validation error:', [
        'errors' => $e->errors()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $e->errors()
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::update] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      Log::info('🔍 [RequestForQuotationController::update] ========== END ==========');

      return response()->json([
        'success' => false,
        'message' => 'Failed to update RFQ: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Send Request for Quotation to suppliers.
   */
  public function send(Request $request, int $id): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::send] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::send] RFQ ID:', ['id' => $id]);
    Log::info('🔍 [RequestForQuotationController::send] Supplier IDs:', ['supplier_ids' => $request->supplier_ids]);

    try {
      $request->validate([
        'supplier_ids' => 'required|array|min:1',
        'supplier_ids.*' => 'exists:suppliers,id',
      ]);

      $qtn = $this->quotationService->sendQtnToSuppliers($id, $request->supplier_ids);

      Log::info('✅ [RequestForQuotationController::send] RFQ sent successfully:', [
        'rfq_id' => $qtn->id,
        'rfq_number' => $qtn->qtn_number,
        'supplier_count' => count($request->supplier_ids),
      ]);

      Log::info('🔍 [RequestForQuotationController::send] ========== END ==========');

      return response()->json([
        'success' => true,
        'data' => new QuotationResource($qtn),
        'message' => 'Request for Quotation sent to suppliers successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::send] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to send RFQ: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Close a Request for Quotation.
   */
  public function close(Request $request, int $id): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::close] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::close] RFQ ID:', ['id' => $id]);
    Log::info('🔍 [RequestForQuotationController::close] Reason:', ['reason' => $request->input('reason')]);

    try {
      $reason = $request->input('reason');
      $qtn = $this->quotationService->closeQtn($id, $reason);

      Log::info('✅ [RequestForQuotationController::close] RFQ closed successfully:', [
        'rfq_id' => $qtn->id,
        'rfq_number' => $qtn->qtn_number,
      ]);

      Log::info('🔍 [RequestForQuotationController::close] ========== END ==========');

      return response()->json([
        'success' => true,
        'data' => new QuotationResource($qtn),
        'message' => 'Request for Quotation closed successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::close] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to close RFQ: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Cancel a Request for Quotation.
   */
  public function cancel(Request $request, int $id): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::cancel] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::cancel] RFQ ID:', ['id' => $id]);
    Log::info('🔍 [RequestForQuotationController::cancel] Reason:', ['reason' => $request->input('reason')]);

    try {
      $request->validate([
        'reason' => 'required|string',
      ]);

      $qtn = $this->quotationService->cancelQtn($id, $request->reason);

      Log::info('✅ [RequestForQuotationController::cancel] RFQ cancelled successfully:', [
        'rfq_id' => $qtn->id,
        'rfq_number' => $qtn->qtn_number,
      ]);

      Log::info('🔍 [RequestForQuotationController::cancel] ========== END ==========');

      return response()->json([
        'success' => true,
        'data' => new QuotationResource($qtn),
        'message' => 'Request for Quotation cancelled successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::cancel] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to cancel RFQ: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Send reminder to suppliers.
   */
  public function sendReminder(int $id): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::sendReminder] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::sendReminder] RFQ ID:', ['id' => $id]);

    try {
      $this->quotationService->sendQtnReminder($id);

      Log::info('✅ [RequestForQuotationController::sendReminder] Reminder sent successfully');

      Log::info('🔍 [RequestForQuotationController::sendReminder] ========== END ==========');

      return response()->json([
        'success' => true,
        'message' => 'Reminder sent to suppliers successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::sendReminder] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to send reminder: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get RFQ statistics.
   */
  public function statistics(int $id): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::statistics] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::statistics] RFQ ID:', ['id' => $id]);

    try {
      $stats = $this->quotationService->getQtnStatistics($id);

      Log::info('✅ [RequestForQuotationController::statistics] Statistics retrieved');

      Log::info('🔍 [RequestForQuotationController::statistics] ========== END ==========');

      return response()->json([
        'success' => true,
        'data' => $stats,
        'message' => 'RFQ statistics retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::statistics] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve statistics: ' . $e->getMessage(),
      ], 500);
    }
  }
  public function selectSupplier(Request $request): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::selectSupplier] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::selectSupplier] Request data:', $request->all());

    try {
      // Validate the request
      $request->validate([
        'quotation_id' => 'required|integer',
        'supplier_id' => 'required|exists:suppliers,id',
        'notes' => 'nullable|string',
      ]);

      // ✅ FIX: Try to find by supplier_quotation_id first, then by quotation_request_id
      $supplierQuotation = SupplierQuotation::with(['quotationRequest.requisition', 'supplier'])
        ->where(function ($query) use ($request) {
          $query->where('id', $request->quotation_id)
            ->orWhere('quotation_request_id', $request->quotation_id);
        })
        ->where('supplier_id', $request->supplier_id)
        ->first();

      if (!$supplierQuotation) {
        // List available quotations for this supplier
        $available = SupplierQuotation::where('supplier_id', $request->supplier_id)
          ->whereIn('status', ['submitted', 'evaluated', 'pending'])
          ->get(['id', 'quotation_request_id', 'status', 'total_amount']);

        return response()->json([
          'success' => false,
          'message' => 'Quotation not found for supplier ID: ' . $request->supplier_id,
          'available_quotations' => $available->map(function ($q) {
            return [
              'supplier_quotation_id' => $q->id,
              'quotation_request_id' => $q->quotation_request_id,
              'status' => $q->status,
              'total_amount' => (float) $q->total_amount,
              'formatted_amount' => number_format((float) $q->total_amount, 2),
            ];
          })
        ], 404);
      }

      // Check if quotation is in a valid status
      $validStatuses = ['submitted', 'evaluated', 'pending'];
      if (!in_array($supplierQuotation->status, $validStatuses)) {
        // Get other available quotations for this RFQ
        $otherQuotations = SupplierQuotation::where('quotation_request_id', $supplierQuotation->quotation_request_id)
          ->whereIn('status', $validStatuses)
          ->get();

        return response()->json([
          'success' => false,
          'message' => 'Quotation ID ' . $supplierQuotation->id . ' is in "' . $supplierQuotation->status . '" status and cannot be selected.',
          'data' => [
            'selected_quotation' => [
              'id' => $supplierQuotation->id,
              'status' => $supplierQuotation->status,
              'supplier_id' => $supplierQuotation->supplier_id,
              'total_amount' => (float) $supplierQuotation->total_amount,
              'formatted_amount' => number_format((float) $supplierQuotation->total_amount, 2),
            ],
            'valid_statuses' => $validStatuses,
            'available_quotations_for_rfq' => $otherQuotations->map(function ($q) {
              return [
                'supplier_quotation_id' => $q->id,
                'supplier_id' => $q->supplier_id,
                'status' => $q->status,
                'total_amount' => (float) $q->total_amount,
                'formatted_amount' => number_format((float) $q->total_amount, 2),
              ];
            }),
            'suggestion' => 'Please use one of the available supplier_quotation_id values above'
          ]
        ], 422);
      }

      // Extract the IDs
      $requisitionId = $supplierQuotation->quotationRequest->requisition->id;
      $supplierId = $supplierQuotation->supplier_id;
      $quotationId = $supplierQuotation->id;

      Log::info('✅ [selectSupplier] Found valid quotation:', [
        'supplier_quotation_id' => $quotationId,
        'quotation_request_id' => $supplierQuotation->quotation_request_id,
        'supplier_id' => $supplierId,
        'requisition_id' => $requisitionId,
        'status' => $supplierQuotation->status,
        'total_amount' => (float) $supplierQuotation->total_amount
      ]);

      // ✅ USE THE SERVICE TO HANDLE ALL THE UPDATES
      $requisition = $this->quotationService->selectSupplier(
        $requisitionId,
        $supplierId,
        $quotationId
      );

      // ✅ Refresh the supplier quotation to get updated status
      $supplierQuotation->refresh();

      // ✅ Ensure total_amount is cast to float
      $totalAmount = (float) $supplierQuotation->total_amount;

      Log::info('✅ [RequestForQuotationController::selectSupplier] Supplier selected successfully:', [
        'requisition_id' => $requisitionId,
        'supplier_id' => $supplierId,
        'supplier_quotation_id' => $quotationId,
        'rfq_status' => $supplierQuotation->quotationRequest->status,
        'quotation_status' => $supplierQuotation->status,
        'total_amount' => $totalAmount,
      ]);

      return response()->json([
        'success' => true,
        'data' => [
          'requisition_id' => (int) $requisitionId,
          'supplier_id' => (int) $supplierId,
          'supplier_name' => $supplierQuotation->supplier->name ?? 'Unknown',
          'supplier_quotation_id' => (int) $quotationId,
          'quotation_request_id' => (int) $supplierQuotation->quotation_request_id,
          'total_amount' => $totalAmount,
          'formatted_total_amount' => number_format($totalAmount, 2),
          'rfq_status' => (string) $supplierQuotation->quotationRequest->status,
          'quotation_status' => (string) $supplierQuotation->status,
          'requisition_status' => (string) $requisition->status,
          'selected_at' => now()->toDateTimeString(),
        ],
        'message' => 'Supplier "' . ($supplierQuotation->supplier->name ?? 'Unknown') . '" selected successfully with quotation amount ' . number_format($totalAmount, 2),
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed: ' . implode(', ', array_map(function ($errors) {
          return implode(', ', $errors);
        }, $e->errors())),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::selectSupplier] Error:', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to select supplier: ' . $e->getMessage(),
      ], 500);
    }
  }
    // ============================================================
    // PDF GENERATION METHODS
    // ============================================================

  /**
   * Download RFQ as PDF.
   *
   * @param int $id The RFQ ID
   * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse PDF file download or error response
   */
  public function downloadPDF(int $id): Response|JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::downloadPDF] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::downloadPDF] RFQ ID:', ['id' => $id]);

    try {
      $response = $this->quotationService->downloadQTNPDF($id);

      Log::info('✅ [RequestForQuotationController::downloadPDF] PDF downloaded successfully');

      Log::info('🔍 [RequestForQuotationController::downloadPDF] ========== END ==========');

      return $response;
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::downloadPDF] Error:', [
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
   * Download RFQ as PDF with verified suffix.
   *
   * @param int $id The RFQ ID
   * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse PDF file download or error response
   */
  public function downloadVerifiedPDF(int $id): Response|JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::downloadVerifiedPDF] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::downloadVerifiedPDF] RFQ ID:', ['id' => $id]);

    try {
      $response = $this->quotationService->downloadQTNPDF($id, 'verified');

      Log::info('✅ [RequestForQuotationController::downloadVerifiedPDF] Verified PDF downloaded successfully');

      Log::info('🔍 [RequestForQuotationController::downloadVerifiedPDF] ========== END ==========');

      return $response;
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::downloadVerifiedPDF] Error:', [
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
   * Download RFQ as PDF with draft suffix.
   *
   * @param int $id The RFQ ID
   * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse PDF file download or error response
   */
  public function downloadDraftPDF(int $id): Response|JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::downloadDraftPDF] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::downloadDraftPDF] RFQ ID:', ['id' => $id]);

    try {
      $response = $this->quotationService->downloadQTNPDF($id, 'draft');

      Log::info('✅ [RequestForQuotationController::downloadDraftPDF] Draft PDF downloaded successfully');

      Log::info('🔍 [RequestForQuotationController::downloadDraftPDF] ========== END ==========');

      return $response;
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::downloadDraftPDF] Error:', [
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
   * Preview RFQ as PDF (inline display).
   *
   * @param int $id The RFQ ID
   * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse PDF preview or error response
   */
  public function previewPDF(int $id): Response|JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::previewPDF] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::previewPDF] RFQ ID:', ['id' => $id]);

    try {
      $response = $this->quotationService->streamQTNPDF($id);

      Log::info('✅ [RequestForQuotationController::previewPDF] PDF preview generated successfully');

      Log::info('🔍 [RequestForQuotationController::previewPDF] ========== END ==========');

      return $response;
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::previewPDF] Error:', [
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
   * Get RFQ as base64 encoded PDF (for embedding in emails).
   *
   * @param int $id The RFQ ID
   * @return JsonResponse Base64 encoded PDF
   */
  public function getBase64PDF(int $id): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::getBase64PDF] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::getBase64PDF] RFQ ID:', ['id' => $id]);

    try {
      $qtn = $this->quotationService->getQuotationRequest($id);

      $pdfContent = $this->quotationService->generateQTNPDFContent($id);
      $base64 = base64_encode($pdfContent);

      $rfqNumber = $qtn->qtn_number ?? 'RFQ-' . str_pad((string) $id, 5, '0', STR_PAD_LEFT);
      $filename = $rfqNumber . '.pdf';

      Log::info('✅ [RequestForQuotationController::getBase64PDF] Base64 PDF generated successfully', [
        'filename' => $filename,
        'size' => strlen($pdfContent),
      ]);

      Log::info('🔍 [RequestForQuotationController::getBase64PDF] ========== END ==========');

      return response()->json([
        'success' => true,
        'data' => [
          'base64' => $base64,
          'filename' => $filename,
          'size' => strlen($pdfContent),
        ],
        'message' => 'Base64 PDF generated successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::getBase64PDF] Error:', [
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
   * Save RFQ PDF to storage.
   *
   * @param int $id The RFQ ID
   * @param string $suffix Optional suffix for the filename
   * @return JsonResponse
   */
  public function savePDF(int $id, string $suffix = ''): JsonResponse
  {
    Log::info('🔍 [RequestForQuotationController::savePDF] ========== START ==========');
    Log::info('🔍 [RequestForQuotationController::savePDF] RFQ ID:', ['id' => $id]);

    try {
      $path = $this->quotationService->saveQTNPDF($id, $suffix);

      Log::info('✅ [RequestForQuotationController::savePDF] PDF saved successfully:', [
        'path' => $path,
      ]);

      Log::info('🔍 [RequestForQuotationController::savePDF] ========== END ==========');

      return response()->json([
        'success' => true,
        'data' => [
          'path' => $path,
          'url' => asset('storage/' . $path),
        ],
        'message' => 'PDF saved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [RequestForQuotationController::savePDF] Error:', [
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
