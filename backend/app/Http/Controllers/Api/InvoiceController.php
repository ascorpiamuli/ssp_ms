<?php
// app/Http/Controllers/Api/InvoiceController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\InvoiceRequest;
use App\Http\Resources\Procurement\InvoiceResource;
use App\Services\Procurement\Services\InvoiceService;
use App\Services\Procurement\DTOs\InvoiceDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
  public function __construct(
    protected InvoiceService $invoiceService
  ) {}

  public function index(Request $request): JsonResponse
  {
    $purchaseOrderId = $request->input('purchase_order_id');
    $supplierId = $request->input('supplier_id');

    if ($purchaseOrderId) {
      $invoices = $this->invoiceService->getInvoicesForPurchaseOrder($purchaseOrderId);
    } elseif ($supplierId) {
      $invoices = $this->invoiceService->getInvoicesForSupplier($supplierId);
    } else {
      $invoices = $this->invoiceService->getPendingInvoices();
    }

    return response()->json([
      'success' => true,
      'data' => $invoices,
      'message' => 'Invoices retrieved successfully.',
    ]);
  }

  public function store(InvoiceRequest $request): JsonResponse
  {
    $dto = InvoiceDTO::fromArray($request->validated());
    $invoice = $this->invoiceService->submitInvoice($dto);

    return response()->json([
      'success' => true,
      'data' => new InvoiceResource($invoice),
      'message' => 'Invoice submitted successfully.',
    ], 201);
  }

  public function show(int $id): JsonResponse
  {
    $invoice = $this->invoiceService->getInvoice($id);

    return response()->json([
      'success' => true,
      'data' => new InvoiceResource($invoice),
      'message' => 'Invoice retrieved successfully.',
    ]);
  }

  public function summary(int $id): JsonResponse
  {
    $summary = $this->invoiceService->getInvoiceSummary($id);

    return response()->json([
      'success' => true,
      'data' => $summary,
      'message' => 'Invoice summary retrieved successfully.',
    ]);
  }

  public function match(int $id): JsonResponse
  {
    $invoice = $this->invoiceService->performThreeWayMatching($id);

    return response()->json([
      'success' => true,
      'data' => new InvoiceResource($invoice),
      'message' => 'Three-way matching performed successfully.',
    ]);
  }

  public function verify(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'notes' => 'nullable|string',
    ]);

    $invoice = $this->invoiceService->verifyInvoice($id, auth()->id(), $request->notes);

    return response()->json([
      'success' => true,
      'data' => new InvoiceResource($invoice),
      'message' => 'Invoice verified successfully.',
    ]);
  }

  public function approve(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'notes' => 'nullable|string',
    ]);

    $invoice = $this->invoiceService->approveInvoice($id, auth()->id(), $request->notes);

    return response()->json([
      'success' => true,
      'data' => new InvoiceResource($invoice),
      'message' => 'Invoice approved successfully.',
    ]);
  }

  public function markPaid(int $id): JsonResponse
  {
    $invoice = $this->invoiceService->markInvoicePaid($id);

    return response()->json([
      'success' => true,
      'data' => new InvoiceResource($invoice),
      'message' => 'Invoice marked as paid successfully.',
    ]);
  }

  public function dispute(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $invoice = $this->invoiceService->markInvoiceDisputed($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new InvoiceResource($invoice),
      'message' => 'Invoice disputed successfully.',
    ]);
  }

  public function cancel(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $invoice = $this->invoiceService->cancelInvoice($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new InvoiceResource($invoice),
      'message' => 'Invoice cancelled successfully.',
    ]);
  }

  public function sendBack(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $invoice = $this->invoiceService->sendInvoiceBack($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new InvoiceResource($invoice),
      'message' => 'Invoice sent back to supplier successfully.',
    ]);
  }

  public function matchingStatus(int $id): JsonResponse
  {
    $status = $this->invoiceService->getMatchingStatus($id);

    return response()->json([
      'success' => true,
      'data' => $status,
      'message' => 'Matching status retrieved successfully.',
    ]);
  }

  public function overdue(): JsonResponse
  {
    $invoices = $this->invoiceService->getOverdueInvoices();

    return response()->json([
      'success' => true,
      'data' => $invoices,
      'message' => 'Overdue invoices retrieved successfully.',
    ]);
  }

  public function pdf(int $id): JsonResponse
  {
    $pdfContent = $this->invoiceService->generateInvoicePdf($id);

    return response()->json([
      'success' => true,
      'data' => [
        'pdf' => base64_encode($pdfContent),
      ],
      'message' => 'Invoice PDF generated successfully.',
    ]);
  }
}
