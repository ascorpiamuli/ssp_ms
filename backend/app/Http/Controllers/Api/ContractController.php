<?php
// app/Http/Controllers/Api/ContractController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\ContractRequest;
use App\Http\Resources\Procurement\ContractResource;
use App\Services\Procurement\Services\ContractService;
use App\Services\Procurement\DTOs\ContractDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContractController extends Controller
{
  public function __construct(
    protected ContractService $contractService
  ) {}

  public function index(Request $request): JsonResponse
  {
    $requisitionId = $request->input('requisition_id');
    $supplierId = $request->input('supplier_id');

    if ($requisitionId) {
      $contracts = $this->contractService->getContractsForRequisition($requisitionId);
    } elseif ($supplierId) {
      $contracts = $this->contractService->getContractsForSupplier($supplierId);
    } else {
      $contracts = $this->contractService->getActiveContracts();
    }

    return response()->json([
      'success' => true,
      'data' => $contracts,
      'message' => 'Contracts retrieved successfully.',
    ]);
  }

  public function store(ContractRequest $request): JsonResponse
  {
    $dto = ContractDTO::fromArray($request->validated());
    $contract = $this->contractService->createContract($dto);

    return response()->json([
      'success' => true,
      'data' => new ContractResource($contract),
      'message' => 'Contract created successfully.',
    ], 201);
  }

  public function show(int $id): JsonResponse
  {
    $contract = $this->contractService->getContract($id);

    return response()->json([
      'success' => true,
      'data' => new ContractResource($contract),
      'message' => 'Contract retrieved successfully.',
    ]);
  }

  public function summary(int $id): JsonResponse
  {
    $summary = $this->contractService->getContractSummary($id);

    return response()->json([
      'success' => true,
      'data' => $summary,
      'message' => 'Contract summary retrieved successfully.',
    ]);
  }

  public function approve(int $id): JsonResponse
  {
    $contract = $this->contractService->approveContract($id, auth()->id());

    return response()->json([
      'success' => true,
      'data' => new ContractResource($contract),
      'message' => 'Contract approved successfully.',
    ]);
  }

  public function activate(int $id): JsonResponse
  {
    $contract = $this->contractService->activateContract($id);

    return response()->json([
      'success' => true,
      'data' => new ContractResource($contract),
      'message' => 'Contract activated successfully.',
    ]);
  }

  public function complete(int $id): JsonResponse
  {
    $contract = $this->contractService->completeContract($id);

    return response()->json([
      'success' => true,
      'data' => new ContractResource($contract),
      'message' => 'Contract completed successfully.',
    ]);
  }

  public function terminate(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $contract = $this->contractService->terminateContract($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new ContractResource($contract),
      'message' => 'Contract terminated successfully.',
    ]);
  }

  public function suspend(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $contract = $this->contractService->suspendContract($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new ContractResource($contract),
      'message' => 'Contract suspended successfully.',
    ]);
  }

  public function renew(int $id): JsonResponse
  {
    $contract = $this->contractService->renewContract($id);

    return response()->json([
      'success' => true,
      'data' => new ContractResource($contract),
      'message' => 'Contract renewed successfully.',
    ]);
  }

  public function expiring(Request $request): JsonResponse
  {
    $days = $request->input('days', 30);
    $contracts = $this->contractService->getExpiringContracts($days);

    return response()->json([
      'success' => true,
      'data' => $contracts,
      'message' => 'Expiring contracts retrieved successfully.',
    ]);
  }

  public function renewable(): JsonResponse
  {
    $contracts = $this->contractService->getContractsReadyForRenewal();

    return response()->json([
      'success' => true,
      'data' => $contracts,
      'message' => 'Renewable contracts retrieved successfully.',
    ]);
  }

  public function pdf(int $id): JsonResponse
  {
    $pdfContent = $this->contractService->generateContractPdf($id);

    return response()->json([
      'success' => true,
      'data' => [
        'pdf' => base64_encode($pdfContent),
      ],
      'message' => 'Contract PDF generated successfully.',
    ]);
  }
}
