<?php
// app/Http/Controllers/Api/PaymentController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\PaymentRequest;
use App\Http\Resources\Procurement\PaymentVoucherResource;
use App\Services\Procurement\Services\PaymentService;
use App\Services\Procurement\DTOs\PaymentDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
  public function __construct(
    protected PaymentService $paymentService
  ) {}

  public function index(Request $request): JsonResponse
  {
    $invoiceId = $request->input('invoice_id');

    if ($invoiceId) {
      $vouchers = $this->paymentService->getPaymentVouchersForInvoice($invoiceId);
    } else {
      $vouchers = $this->paymentService->getDraftVouchers();
    }

    return response()->json([
      'success' => true,
      'data' => $vouchers,
      'message' => 'Payment vouchers retrieved successfully.',
    ]);
  }

  public function store(PaymentRequest $request): JsonResponse
  {
    $dto = PaymentDTO::fromArray($request->validated());
    $voucher = $this->paymentService->preparePaymentVoucher($dto);

    return response()->json([
      'success' => true,
      'data' => new PaymentVoucherResource($voucher),
      'message' => 'Payment voucher prepared successfully.',
    ], 201);
  }

  public function show(int $id): JsonResponse
  {
    $voucher = $this->paymentService->getPaymentVoucher($id);

    return response()->json([
      'success' => true,
      'data' => new PaymentVoucherResource($voucher),
      'message' => 'Payment voucher retrieved successfully.',
    ]);
  }

  public function summary(int $id): JsonResponse
  {
    $summary = $this->paymentService->getPaymentSummary($id);

    return response()->json([
      'success' => true,
      'data' => $summary,
      'message' => 'Payment summary retrieved successfully.',
    ]);
  }

  public function endorse(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'signature' => 'nullable|string',
    ]);

    $voucher = $this->paymentService->endorsePaymentVoucher(
      $id,
      auth()->id(),
      $request->signature
    );

    return response()->json([
      'success' => true,
      'data' => new PaymentVoucherResource($voucher),
      'message' => 'Payment voucher endorsed successfully.',
    ]);
  }

  public function approve(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'signature' => 'nullable|string',
    ]);

    $voucher = $this->paymentService->approvePaymentVoucher(
      $id,
      auth()->id(),
      $request->signature
    );

    return response()->json([
      'success' => true,
      'data' => new PaymentVoucherResource($voucher),
      'message' => 'Payment voucher approved successfully.',
    ]);
  }

  public function markPaid(Request $request, int $id): JsonResponse
  {
    $reference = $request->input('reference');
    $voucher = $this->paymentService->markPaymentVoucherPaid($id, $reference);

    return response()->json([
      'success' => true,
      'data' => new PaymentVoucherResource($voucher),
      'message' => 'Payment voucher marked as paid successfully.',
    ]);
  }

  public function cancel(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $voucher = $this->paymentService->cancelPaymentVoucher($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => new PaymentVoucherResource($voucher),
      'message' => 'Payment voucher cancelled successfully.',
    ]);
  }

  public function recordCheque(PaymentRequest $request): JsonResponse
  {
    $dto = PaymentDTO::fromArray($request->validated());
    $cheque = $this->paymentService->recordCheque($dto);

    return response()->json([
      'success' => true,
      'data' => [
        'cheque_id' => $cheque->id,
        'cheque_number' => $cheque->cheque_number,
        'voucher_id' => $cheque->payment_voucher_id,
      ],
      'message' => 'Cheque recorded successfully.',
    ], 201);
  }

  public function chequeShow(int $id): JsonResponse
  {
    $cheque = $this->paymentService->getCheque($id);

    return response()->json([
      'success' => true,
      'data' => $cheque,
      'message' => 'Cheque retrieved successfully.',
    ]);
  }

  public function chequeCashed(int $id): JsonResponse
  {
    $cheque = $this->paymentService->markChequeCashed($id);

    return response()->json([
      'success' => true,
      'data' => $cheque,
      'message' => 'Cheque marked as cashed successfully.',
    ]);
  }

  public function chequeCancelled(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $cheque = $this->paymentService->markChequeCancelled($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => $cheque,
      'message' => 'Cheque cancelled successfully.',
    ]);
  }

  public function chequeStopped(Request $request, int $id): JsonResponse
  {
    $request->validate([
      'reason' => 'required|string',
    ]);

    $cheque = $this->paymentService->markChequeStopped($id, $request->reason);

    return response()->json([
      'success' => true,
      'data' => $cheque,
      'message' => 'Cheque stopped successfully.',
    ]);
  }

  public function pdf(int $id): JsonResponse
  {
    $pdfContent = $this->paymentService->generatePaymentVoucherPdf($id);

    return response()->json([
      'success' => true,
      'data' => [
        'pdf' => base64_encode($pdfContent),
      ],
      'message' => 'Payment voucher PDF generated successfully.',
    ]);
  }

  public function chequePdf(int $id): JsonResponse
  {
    $pdfContent = $this->paymentService->generateChequePdf($id);

    return response()->json([
      'success' => true,
      'data' => [
        'pdf' => base64_encode($pdfContent),
      ],
      'message' => 'Cheque PDF generated successfully.',
    ]);
  }
}
