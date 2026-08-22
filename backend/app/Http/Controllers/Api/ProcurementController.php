<?php
// app/Http/Controllers/Api/ProcurementController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\ProcurementRequest;
use App\Http\Resources\Procurement\ProcurementSummaryResource;
use App\Models\QuotationRequest;
use App\Models\Requisition;
use App\Services\Procurement\Services\ProcurementService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ProcurementController extends Controller
{
  public function __construct(
    protected ProcurementService $procurementService
  ) {}

  /**
   * Start procurement for a requisition
   */
  public function start(ProcurementRequest $request): JsonResponse
  {
    $requisition = $this->procurementService->startProcurement($request->requisition_id);

    return response()->json([
      'success' => true,
      'data' => [
        'requisition_id' => $requisition->id,
        'reference_number' => $requisition->reference_number,
        'is_procurement_created' => $requisition->is_procurement_created,
        'procurement_created_at' => $requisition->procurement_created_at,
      ],
      'message' => 'Procurement started successfully.',
    ]);
  }

  /**
   * Get procurement status for a requisition
   */
  public function status(int $requisitionId): JsonResponse
  {
    $status = $this->procurementService->getProcurementStatus($requisitionId);

    return response()->json([
      'success' => true,
      'data' => $status,
      'message' => 'Procurement status retrieved successfully.',
    ]);
  }

  /**
   * Get procurement summary for a requisition
   */
  public function summary(int $requisitionId): JsonResponse
  {
    $summary = $this->procurementService->getProcurementSummary($requisitionId);

    return response()->json([
      'success' => true,
      'data' => new ProcurementSummaryResource($summary),
      'message' => 'Procurement summary retrieved successfully.',
    ]);
  }

  /**
   * Get procurement timeline for a requisition
   */
  public function timeline(int $requisitionId): JsonResponse
  {
    $timeline = $this->procurementService->getProcurementTimeline($requisitionId);

    return response()->json([
      'success' => true,
      'data' => $timeline,
      'message' => 'Procurement timeline retrieved successfully.',
    ]);
  }

  /**
   * Get procurement metrics for a requisition
   */
  public function metrics(int $requisitionId): JsonResponse
  {
    $metrics = $this->procurementService->getProcurementMetrics($requisitionId);

    return response()->json([
      'success' => true,
      'data' => $metrics,
      'message' => 'Procurement metrics retrieved successfully.',
    ]);
  }

  /**
   * Get procurement steps for a requisition
   */
  public function steps(int $requisitionId): JsonResponse
  {
    $steps = $this->procurementService->getProcurementSteps($requisitionId);

    return response()->json([
      'success' => true,
      'data' => $steps,
      'message' => 'Procurement steps retrieved successfully.',
    ]);
  }

  /**
   * Complete procurement for a requisition
   */
  public function complete(ProcurementRequest $request): JsonResponse
  {
    $requisition = $this->procurementService->completeProcurement($request->requisition_id);

    return response()->json([
      'success' => true,
      'data' => [
        'requisition_id' => $requisition->id,
        'status' => $requisition->status,
      ],
      'message' => 'Procurement completed successfully.',
    ]);
  }

  /**
   * Cancel procurement for a requisition
   */
  public function cancel(Request $request): JsonResponse
  {
    $request->validate([
      'requisition_id' => 'required|exists:requisitions,id',
      'reason' => 'required|string',
    ]);

    $requisition = $this->procurementService->cancelProcurement(
      $request->requisition_id,
      $request->reason
    );

    return response()->json([
      'success' => true,
      'data' => [
        'requisition_id' => $requisition->id,
        'is_procurement_created' => $requisition->is_procurement_created,
      ],
      'message' => 'Procurement cancelled successfully.',
    ]);
  }

  /**
   * Get requisitions ready for procurement.
   * These are fully approved (final_approved) and don't have QTN yet.
   */
  public function readyRequisitions(Request $request): JsonResponse
  {
    Log::info('🔍 [readyRequisitions] ========== START ==========');

    // Get all requisition IDs that already have QTNs
    $requisitionIdsWithQtn = QuotationRequest::pluck('requisition_id')->toArray();
    Log::info('🔍 [readyRequisitions] Requisition IDs with QTNs:', [
      'count' => count($requisitionIdsWithQtn),
      'ids' => $requisitionIdsWithQtn
    ]);

    $query = Requisition::with(['user', 'department', 'items'])
      ->where('status', 'final_approved')
      ->where('status', '!=', 'cancelled')
      ->whereNotIn('id', $requisitionIdsWithQtn);

    Log::info('🔍 [readyRequisitions] SQL Query:', [
      'sql' => $query->toSql(),
      'bindings' => $query->getBindings()
    ]);

    $requisitions = $query->orderBy('created_at', 'desc')
      ->paginate($request->input('per_page', 15));

    Log::info('🔍 [readyRequisitions] Final result:', [
      'count' => $requisitions->count(),
      'total' => $requisitions->total()
    ]);

    Log::info('🔍 [readyRequisitions] ========== END ==========');

    return response()->json([
      'success' => true,
      'data' => $requisitions,
      'message' => 'Ready requisitions retrieved successfully.',
    ]);
  }

  /**
   * Get requisitions that already have QTNs.
   */
  public function requisitionsWithQtns(Request $request): JsonResponse
  {
    Log::info('🔍 [requisitionsWithQtns] ========== START ==========');

    $requisitionIdsWithQtn = QuotationRequest::pluck('requisition_id')->toArray();
    Log::info('🔍 [requisitionsWithQtns] Requisition IDs with QTNs:', [
      'count' => count($requisitionIdsWithQtn),
      'ids' => $requisitionIdsWithQtn
    ]);

    $requisitions = Requisition::with(['user', 'department', 'items'])
      ->whereIn('id', $requisitionIdsWithQtn)
      ->where('status', '!=', 'cancelled')
      ->orderBy('created_at', 'desc')
      ->paginate($request->input('per_page', 15));

    Log::info('🔍 [requisitionsWithQtns] Result:', [
      'count' => $requisitions->count(),
      'total' => $requisitions->total()
    ]);

    Log::info('🔍 [requisitionsWithQtns] ========== END ==========');

    // Also get the QTN data for each requisition
    $qtns = QuotationRequest::whereIn('requisition_id', $requisitionIdsWithQtn)
      ->get()
      ->keyBy('requisition_id');

    return response()->json([
      'success' => true,
      'data' => [
        'requisitions' => $requisitions,
        'qtns' => $qtns,
      ],
      'message' => 'Requisitions with QTNs retrieved successfully.',
    ]);
  }

  /**
   * Get requisitions currently in procurement process.
   * Has QTN but not yet completed (PO not issued or goods not received etc.)
   */
  public function inProgress(Request $request): JsonResponse
  {
    Log::info('🔍 [inProgress] ========== START ==========');

    $requisitionIdsWithQtn = QuotationRequest::pluck('requisition_id')->toArray();
    Log::info('🔍 [inProgress] Requisition IDs with QTNs:', [
      'count' => count($requisitionIdsWithQtn),
      'ids' => $requisitionIdsWithQtn
    ]);

    $requisitions = Requisition::with(['user', 'department', 'items'])
      ->whereIn('id', $requisitionIdsWithQtn)
      ->where('status', '!=', 'cancelled')
      ->where('status', '!=', 'procurement_completed')
      ->orderBy('created_at', 'desc')
      ->paginate($request->input('per_page', 15));

    Log::info('🔍 [inProgress] Result:', [
      'count' => $requisitions->count(),
      'total' => $requisitions->total()
    ]);

    Log::info('🔍 [inProgress] ========== END ==========');

    return response()->json([
      'success' => true,
      'data' => $requisitions,
      'message' => 'In-progress procurement requisitions retrieved successfully.',
    ]);
  }
  /**
   * Get procurement statistics for the authenticated user.
   * This endpoint provides aggregated statistics about procurement and approval status.
   */
  public function statistics(Request $request): JsonResponse
  {
    try {
      // Get the authenticated user
      $user = $request->user();

      // Get user roles
      $userRoles = $user->roles->pluck('name')->map(function ($role) {
        return strtoupper($role);
      })->toArray();

      // Check if user has admin, procurement, or accountant role
      $hasFullAccess = in_array('ADMIN', $userRoles) ||
        in_array('PROCUREMENT', $userRoles) ||
        in_array('ACCOUNTANT', $userRoles);

      // Get requisitions based on user role
      $query = Requisition::where('status', '!=', 'cancelled');

      if (!$hasFullAccess) {
        // Regular users only see their own requisitions
        $query->where('user_id', $user->id);
      }

      $allRequisitions = $query->get();
      $requisitionIds = $allRequisitions->pluck('id')->toArray();

      // Get requisition IDs that have QTNs
      $requisitionIdsWithQtn = QuotationRequest::whereIn('requisition_id', $requisitionIds)
        ->pluck('requisition_id')
        ->toArray();

      // ============================================
      // GET ALL SUPPLIER QUOTATIONS FOR THESE REQUISITIONS
      // ============================================

      // Get all quotation requests for these requisitions
      $quotationRequests = QuotationRequest::whereIn('requisition_id', $requisitionIds)
        ->with(['supplierQuotations'])
        ->get();

      // Track accepted quotations
      $acceptedQuotations = [];
      $totalAcceptedAmount = 0;
      $requisitionIdsWithAcceptedQuotations = [];

      foreach ($quotationRequests as $qtnRequest) {
        foreach ($qtnRequest->supplierQuotations as $supplierQuotation) {
          // Check if quotation is accepted (status = 'accepted')
          if ($supplierQuotation->status === 'accepted') {
            $acceptedQuotations[] = $supplierQuotation;
            $totalAcceptedAmount += floatval($supplierQuotation->total_amount ?? 0);
            $requisitionIdsWithAcceptedQuotations[] = $qtnRequest->requisition_id;

            // Also track which requisition has accepted quotations
            if (!in_array($qtnRequest->requisition_id, $requisitionIdsWithAcceptedQuotations)) {
              $requisitionIdsWithAcceptedQuotations[] = $qtnRequest->requisition_id;
            }
          }
        }
      }

      // Count accepted quotations by requisition
      $acceptedQuotationCount = count($acceptedQuotations);

      // Get requisition IDs that have been sent to suppliers (have QTNs sent)
      $requisitionIdsSentToSuppliers = QuotationRequest::whereIn('requisition_id', $requisitionIds)
        ->whereNotNull('sent_at')
        ->pluck('requisition_id')
        ->toArray();

      $stats = [
        // Total requisitions
        'total' => $allRequisitions->count(),

        // Approval stats
        'approved' => 0,           // final_approved
        'pending' => 0,            // submitted, hod_approved, accountant_approved, principal_approved
        'declined' => 0,           // hod_declined, accountant_declined, principal_declined, final_declined
        'draft' => 0,              // draft
        'returned' => 0,           // returned
        'revised' => 0,            // revised
        'cancelled' => 0,          // cancelled

        // Procurement stats
        'ready_for_procurement' => 0,      // final_approved but NOT sent to suppliers
        'sent_to_suppliers' => 0,          // final_approved and sent to suppliers (has QTN sent)
        'in_progress' => 0,                // final_approved and has accepted quotations
        'with_qtns' => 0,                  // final_approved and has QTN (sent or not)
        'completed' => 0,                  // final_approved and completed

        // Quotation stats
        'accepted_quotations' => $acceptedQuotationCount,
        'total_accepted_amount' => $totalAcceptedAmount,
        'formatted_total_accepted_amount' => number_format($totalAcceptedAmount, 2),

        // Requisition IDs for reference
        'requisition_ids_with_accepted_quotations' => array_unique($requisitionIdsWithAcceptedQuotations),

        // Detailed breakdown by status
        'by_status' => [],
      ];

      // Get count by status
      $statusCounts = $query->clone()
        ->selectRaw('status, count(*) as count')
        ->groupBy('status')
        ->pluck('count', 'status')
        ->toArray();

      $stats['by_status'] = $statusCounts;

      // Map status to categories and calculate procurement stats
      foreach ($allRequisitions as $requisition) {
        $status = $requisition->status;
        $hasQtn = in_array($requisition->id, $requisitionIdsWithQtn);
        $hasAcceptedQuotation = in_array($requisition->id, $requisitionIdsWithAcceptedQuotations);
        $isSentToSuppliers = in_array($requisition->id, $requisitionIdsSentToSuppliers);

        // Approval stats
        switch ($status) {
          case 'final_approved':
            $stats['approved']++;
            break;
          case 'submitted':
          case 'hod_approved':
          case 'accountant_approved':
          case 'principal_approved':
            $stats['pending']++;
            break;
          case 'hod_declined':
          case 'accountant_declined':
          case 'principal_declined':
          case 'final_declined':
            $stats['declined']++;
            break;
          case 'draft':
            $stats['draft']++;
            break;
          case 'returned':
            $stats['returned']++;
            break;
          case 'revised':
            $stats['revised']++;
            break;
          case 'cancelled':
            $stats['cancelled']++;
            break;
        }

        // Procurement stats (only for final_approved)
        if ($status === 'final_approved') {
          $metadata = $requisition->metadata ?? [];
          $isCompleted = false;

          // Check if procurement is marked as completed
          if ($requisition->status === 'procurement_completed') {
            $isCompleted = true;
          }

          // Check metadata for completion flags
          if (isset($metadata['payment_completed']) && $metadata['payment_completed'] === true) {
            $isCompleted = true;
          }
          if (isset($metadata['cheque_issued']) && $metadata['cheque_issued'] === true) {
            $isCompleted = true;
          }

          // Check if PO/LPO and GRN exist
          if (
            isset($metadata['lpo_generated']) && $metadata['lpo_generated'] === true &&
            isset($metadata['grn_generated']) && $metadata['grn_generated'] === true
          ) {
            $isCompleted = true;
          }

          if ($isCompleted) {
            $stats['completed']++;
          } elseif ($hasAcceptedQuotation) {
            // Has accepted quotation - IN PROGRESS
            $stats['in_progress']++;
            $stats['with_qtns']++;
          } elseif ($isSentToSuppliers) {
            // Sent to suppliers but no accepted quotation yet
            $stats['sent_to_suppliers']++;
            $stats['with_qtns']++;
          } elseif ($hasQtn) {
            // Has QTN but not sent (or no response yet)
            $stats['with_qtns']++;
            $stats['ready_for_procurement']++;
          } else {
            // No QTN at all - READY FOR PROCUREMENT
            $stats['ready_for_procurement']++;
          }
        }
      }

      // Calculate additional metrics
      $stats['acceptance_rate'] = $stats['with_qtns'] > 0
        ? round(($stats['accepted_quotations'] / $stats['with_qtns']) * 100, 2)
        : 0;

      return response()->json([
        'success' => true,
        'data' => $stats,
        'message' => 'Procurement statistics retrieved successfully.',
      ]);
    } catch (\Exception $e) {

      return response()->json([
        'success' => false,
        'data' => [
          'total' => 0,
          'approved' => 0,
          'pending' => 0,
          'declined' => 0,
          'draft' => 0,
          'returned' => 0,
          'revised' => 0,
          'cancelled' => 0,
          'ready_for_procurement' => 0,
          'sent_to_suppliers' => 0,
          'in_progress' => 0,
          'with_qtns' => 0,
          'completed' => 0,
          'accepted_quotations' => 0,
          'total_accepted_amount' => 0,
          'formatted_total_accepted_amount' => '0.00',
          'requisition_ids_with_accepted_quotations' => [],
          'by_status' => [],
          'acceptance_rate' => 0,
        ],
        'message' => 'Failed to retrieve procurement statistics.',
      ], 500);
    }
  }
}
