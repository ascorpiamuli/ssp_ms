<?php
// app/Http/Controllers/Api/ProcurementController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\ProcurementRequest;
use App\Http\Resources\Procurement\ProcurementSummaryResource;
use App\Services\Procurement\Services\ProcurementService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProcurementController extends Controller
{
  public function __construct(
    protected ProcurementService $procurementService
  ) {}

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

  public function status(int $requisitionId): JsonResponse
  {
    $status = $this->procurementService->getProcurementStatus($requisitionId);

    return response()->json([
      'success' => true,
      'data' => $status,
      'message' => 'Procurement status retrieved successfully.',
    ]);
  }

  public function summary(int $requisitionId): JsonResponse
  {
    $summary = $this->procurementService->getProcurementSummary($requisitionId);

    return response()->json([
      'success' => true,
      'data' => new ProcurementSummaryResource($summary),
      'message' => 'Procurement summary retrieved successfully.',
    ]);
  }

  public function timeline(int $requisitionId): JsonResponse
  {
    $timeline = $this->procurementService->getProcurementTimeline($requisitionId);

    return response()->json([
      'success' => true,
      'data' => $timeline,
      'message' => 'Procurement timeline retrieved successfully.',
    ]);
  }

  public function metrics(int $requisitionId): JsonResponse
  {
    $metrics = $this->procurementService->getProcurementMetrics($requisitionId);

    return response()->json([
      'success' => true,
      'data' => $metrics,
      'message' => 'Procurement metrics retrieved successfully.',
    ]);
  }

  public function steps(int $requisitionId): JsonResponse
  {
    $steps = $this->procurementService->getProcurementSteps($requisitionId);

    return response()->json([
      'success' => true,
      'data' => $steps,
      'message' => 'Procurement steps retrieved successfully.',
    ]);
  }

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
}
