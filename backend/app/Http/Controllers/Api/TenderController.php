<?php
// app/Http/Controllers/Api/TenderController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\TenderRequest;
use App\Http\Resources\Procurement\TenderResource;
use App\Services\Procurement\Services\TenderService;
use App\Services\Procurement\DTOs\TenderDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TenderController extends Controller
{
  public function __construct(
    protected TenderService $tenderService
  ) {}

  public function index(Request $request): JsonResponse
  {
    $status = $request->input('status');

    if ($status === 'open') {
      $tenders = $this->tenderService->getOpenTenders();
    } elseif ($status === 'closing_soon') {
      $tenders = $this->tenderService->getClosingSoonTenders();
    } elseif ($status) {
      $tenders = $this->tenderService->getTendersByStatus($status);
    } else {
      $tenders = $this->tenderService->getPublishedTenders();
    }

    return response()->json([
      'success' => true,
      'data' => $tenders,
      'message' => 'Tenders retrieved successfully.',
    ]);
  }

  public function store(TenderRequest $request): JsonResponse
  {
    $dto = TenderDTO::fromArray($request->validated());
    $tender = $this->tenderService->createTender($dto);

    return response()->json([
      'success' => true,
      'data' => new TenderResource($tender),
      'message' => 'Tender created successfully.',
    ], 201);
  }

  public function show(int $id): JsonResponse
  {
    $tender = $this->tenderService->getTender($id);

    return response()->json([
      'success' => true,
      'data' => new TenderResource($tender),
      'message' => 'Tender retrieved successfully.',
    ]);
  }

  public function statistics(int $id): JsonResponse
  {
    $stats = $this->tenderService->getTenderStatistics($id);

    return response()->json([
      'success' => true,
      'data' => $stats,
      'message' => 'Tender statistics retrieved successfully.',
    ]);
  }

  public function publish(int $id): JsonResponse
  {
    $tender = $this->tenderService->publishTender($id, auth()->id());

    return response()->json([
      'success' => true,
      'data' => new TenderResource($tender),
      'message' => 'Tender published successfully.',
    ]);
  }

  public function addBidder(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'supplier_id' => 'required|exists:users,id',
    ]);

    $tender = $this->tenderService->addBidder($id, $request->supplier_id);

    return response()->json([
      'success' => true,
      'data' => new TenderResource($tender),
      'message' => 'Bidder added successfully.',
    ]);
  }

  public function removeBidder(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'supplier_id' => 'required|exists:users,id',
    ]);

    $tender = $this->tenderService->removeBidder($id, $request->supplier_id);

    return response()->json([
      'success' => true,
      'data' => new TenderResource($tender),
      'message' => 'Bidder removed successfully.',
    ]);
  }

  public function bidders(int $id): JsonResponse
  {
    $bidders = $this->tenderService->getBidders($id);

    return response()->json([
      'success' => true,
      'data' => $bidders,
      'message' => 'Bidders retrieved successfully.',
    ]);
  }

  public function startEvaluation(int $id): JsonResponse
  {
    $tender = $this->tenderService->startEvaluation($id);

    return response()->json([
      'success' => true,
      'data' => new TenderResource($tender),
      'message' => 'Tender evaluation started successfully.',
    ]);
  }

  public function award(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'supplier_id' => 'required|exists:users,id',
      'amount' => 'required|numeric|min:0',
      'notes' => 'nullable|string',
    ]);

    $tender = $this->tenderService->awardTender(
      $id,
      $request->supplier_id,
      $request->amount,
      $request->notes
    );

    return response()->json([
      'success' => true,
      'data' => new TenderResource($tender),
      'message' => 'Tender awarded successfully.',
    ]);
  }

  public function cancel(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $tender = $this->tenderService->cancelTender($id, $request->reason, auth()->id());

    return response()->json([
      'success' => true,
      'data' => new TenderResource($tender),
      'message' => 'Tender cancelled successfully.',
    ]);
  }

  public function pdf(int $id): JsonResponse
  {
    $pdfContent = $this->tenderService->generateTenderPdf($id);

    return response()->json([
      'success' => true,
      'data' => [
        'pdf' => base64_encode($pdfContent),
      ],
      'message' => 'Tender PDF generated successfully.',
    ]);
  }
}
