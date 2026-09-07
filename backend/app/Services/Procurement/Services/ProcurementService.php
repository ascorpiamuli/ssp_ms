<?php
// app/Services/Procurement/Services/ProcurementService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\Requisition;
use App\Models\ProcurementHistory;
use App\Models\QuotationRequest;
use App\Models\SupplierQuotation;
use App\Models\PurchaseOrder;
use App\Models\GoodsReceivedNote;
use App\Models\ServiceAcknowledgmentNote;
use App\Models\Invoice;
use App\Models\PaymentVoucher;
use App\Services\Procurement\Base\BaseService;
use App\Services\Procurement\Contracts\Services\ProcurementServiceInterface;
use App\Services\Procurement\Contracts\Repositories\QuotationRepositoryInterface;
use App\Services\Procurement\Contracts\Repositories\PurchaseOrderRepositoryInterface;
use App\Services\Procurement\Contracts\Repositories\GoodsReceivedRepositoryInterface;
use App\Services\Procurement\Contracts\Repositories\InvoiceRepositoryInterface;
use App\Services\Procurement\Contracts\Repositories\PaymentRepositoryInterface;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\Exceptions\ProcurementException;
use App\Services\Admin\AuditLogService;
use Carbon\Carbon;

class ProcurementService extends BaseService implements ProcurementServiceInterface
{
  /**
   * Stage weights for completion rate calculation
   */
  protected const STAGE_WEIGHTS = [
    'initiated' => 10,
    'quotation_in_progress' => 20,
    'awaiting_quotations' => 30,
    'evaluating_quotations' => 45,
    'supplier_selected' => 60,
    'delivery_pending' => 75,
    'invoicing_pending' => 85,
    'payment_pending' => 95,
    'completed' => 100,
  ];

  /**
   * Stage order for dependency checking
   */
  protected const STAGE_ORDER = [
    'initiated',
    'quotation_in_progress',
    'awaiting_quotations',
    'evaluating_quotations',
    'supplier_selected',
    'delivery_pending',
    'invoicing_pending',
    'payment_pending',
    'completed',
  ];

  public function __construct(
    protected QuotationRepositoryInterface $quotationRepository,
    protected PurchaseOrderRepositoryInterface $purchaseOrderRepository,
    protected GoodsReceivedRepositoryInterface $goodsReceivedRepository,
    protected InvoiceRepositoryInterface $invoiceRepository,
    protected PaymentRepositoryInterface $paymentRepository,
    protected NotificationDispatcherInterface $notificationDispatcher,
    protected AuditLogService $auditLogService
  ) {
    parent::__construct();
  }

  public function startProcurement(int $requisitionId): Requisition
  {
    $requisition = Requisition::find($requisitionId);

    if (!$requisition) {
      throw ProcurementException::requisitionNotFound($requisitionId);
    }

    if (!$requisition->isApproved()) {
      throw ProcurementException::requisitionNotApproved();
    }

    if ($requisition->is_procurement_created) {
      throw ProcurementException::procurementAlreadyStarted();
    }

    if ($requisition->status === 'cancelled') {
      throw ProcurementException::requisitionCancelled();
    }

    return $this->transaction(function () use ($requisition) {
      $userId = $this->getCurrentUserId();

      if (!$userId) {
        $userId = $requisition->user_id;
      }

      if (!$userId) {
        $admin = \App\Models\User::where('is_admin', true)->first();
        if ($admin) {
          $userId = $admin->id;
        }
      }

      $oldValues = $requisition->toArray();

      $requisition->update([
        'is_procurement_created' => true,
        'procurement_created_at' => now(),
        'metadata' => array_merge($requisition->metadata ?? [], [
          'procurement' => [
            'started_at' => now(),
            'started_by' => $userId,
            'status' => 'initiated',
            'steps' => [],
            'selected_supplier_id' => null,
            'selected_at' => null,
            'supplier_selected' => false,
          ]
        ])
      ]);

      $this->auditLogService->logModelUpdated(
        $requisition,
        $oldValues,
        "Procurement started for requisition #{$requisition->id} ({$requisition->reference_number})"
      );

      ProcurementHistory::create([
        'requisition_id' => $requisition->id,
        'user_id' => $userId,
        'action' => 'procurement_started',
        'entity_type' => 'requisition',
        'entity_id' => $requisition->id,
        'old_values' => null,
        'new_values' => ['status' => 'procurement_initiated'],
        'comment' => 'Procurement initiated for requisition',
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);

      $this->notificationDispatcher->notify('procurement_started', [
        'requisition_id' => $requisition->id,
        'reference_number' => $requisition->reference_number,
        'title' => $requisition->title,
      ]);

      return $requisition;
    });
  }

  public function getProcurementStatus(int $requisitionId): array
  {
    $requisition = Requisition::find($requisitionId);

    if (!$requisition) {
      throw ProcurementException::requisitionNotFound($requisitionId);
    }

    $status = [
      'requisition_id' => $requisition->id,
      'reference_number' => $requisition->reference_number,
      'is_procurement_created' => $requisition->is_procurement_created ?? false,
      'procurement_created_at' => $requisition->procurement_created_at,
      'current_status' => 'not_started',
      'is_completed' => false,
      'is_active' => false,
      'started_at' => null,
      'steps' => [],
    ];

    if (!$requisition->is_procurement_created) {
      return $status;
    }

    $metadata = $requisition->metadata ?? [];
    $procurementMeta = $metadata['procurement'] ?? [];

    $status['started_at'] = $procurementMeta['started_at'] ?? $requisition->procurement_created_at;

    // Build steps with proper dependency tracking
    $steps = $this->buildProcurementSteps($requisition);
    $status['steps'] = $steps;

    // Determine overall status based on actual data
    $currentStatus = $this->determineProcurementStatus($requisition, $steps);
    $status['current_status'] = $currentStatus;
    $status['is_completed'] = $currentStatus === 'completed';
    $status['is_active'] = $currentStatus !== 'completed' && $currentStatus !== 'cancelled' && $currentStatus !== 'not_started';

    return $status;
  }

  /**
   * Build procurement steps with proper dependency-based statuses
   */
  protected function buildProcurementSteps(Requisition $requisition): array
  {
    $qtn = QuotationRequest::where('requisition_id', $requisition->id)->first();
    $metadata = $requisition->metadata ?? [];
    $procurementMeta = $metadata['procurement'] ?? [];

    // Get supplier quotations
    $supplierQuotes = $qtn ? SupplierQuotation::where('quotation_request_id', $qtn->id)->get() : collect();

    // Check if quotes are reviewed
    $quotesReviewed = $supplierQuotes->filter(function ($quote) {
      return $quote->verification_status === 'verified' || $quote->status === 'evaluated';
    })->isNotEmpty();

    // Check if supplier is selected
    $isSupplierSelected = $this->isSupplierSelected($requisition);

    // Check for PO/LPO/LSO
    $po = PurchaseOrder::where('requisition_id', $requisition->id)->first();

    // ✅ FIX: Check for BOTH GRN and SAN based on PO type
    $grn = null;
    $san = null;
    $deliveryExists = false;

    if ($po) {
      // Get GRN for LPO
      $grn = GoodsReceivedNote::where('purchase_order_id', $po->id)->first();

      // Get SAN for LSO
      $san = ServiceAcknowledgmentNote::where('purchase_order_id', $po->id)->first();

      // Delivery exists if either GRN or SAN exists
      $deliveryExists = $grn !== null || $san !== null;
    }

    // Check for Invoice
    $invoice = null;
    if ($grn) {
      $invoice = Invoice::where('goods_received_note_id', $grn->id)->first();
    } elseif ($san) {
      $invoice = Invoice::where('service_acknowledgment_note_id', $san->id)->first();
    }

    // Check for Payment
    $payment = $invoice ? PaymentVoucher::where('invoice_id', $invoice->id)->first() : null;

    // Determine PO type (LPO or LSO)
    $poType = $po ? $po->type : null;
    $isService = $poType === 'lso';

    return [
      'quotation' => [
        'status' => $this->getQuotationStepStatus($qtn),
        'qtn_number' => $qtn ? $qtn->qtn_number : null,
        'created_at' => $qtn ? $qtn->created_at->toDateTimeString() : null,
      ],
      'supplier_quotations' => [
        'status' => $this->getSupplierQuotationsStepStatus($qtn, $supplierQuotes),
        'quotes_received' => $supplierQuotes->count(),
        'quotes_reviewed' => $quotesReviewed ? $supplierQuotes->count() : 0,
      ],
      'supplier_selection' => [
        'status' => $this->getSupplierSelectionStepStatus($qtn, $supplierQuotes, $isSupplierSelected),
        'selected_supplier_id' => $isSupplierSelected ? ($procurementMeta['selected_supplier_id'] ?? null) : null,
        'selected_at' => $isSupplierSelected ? ($procurementMeta['selected_at'] ?? null) : null,
      ],
      'po_generation' => [
        'status' => $this->getPoStepStatus($po, $isSupplierSelected),
        'po_number' => $po ? $po->po_number : null,
        'po_type' => $po ? $po->type : null,
        'created_at' => $po ? $po->created_at->toDateTimeString() : null,
      ],
      'delivery' => [
        'status' => $this->getDeliveryStepStatus($po, $grn, $san, $deliveryExists),
        'grn_number' => $grn ? $grn->grn_number : null,
        'san_number' => $san ? $san->san_number : null,
        'delivery_type' => $isService ? 'san' : 'grn',
        'created_at' => $grn ? $grn->created_at->toDateTimeString() : ($san ? $san->created_at->toDateTimeString() : null),
      ],
      'invoicing' => [
        'status' => $this->getInvoicingStepStatus($grn, $san, $invoice),
        'invoice_number' => $invoice ? $invoice->invoice_number : null,
        'created_at' => $invoice ? $invoice->created_at->toDateTimeString() : null,
      ],
      'payment' => [
        'status' => $this->getPaymentStepStatus($invoice, $payment),
        'voucher_number' => $payment ? $payment->voucher_number : null,
        'created_at' => $payment ? $payment->created_at->toDateTimeString() : null,
      ],
    ];
  }

  /**
   * Get quotation step status
   */
  protected function getQuotationStepStatus($qtn): string
  {
    if (!$qtn) {
      return 'waiting';
    }

    if ($qtn->status === 'closed' || $qtn->status === 'cancelled') {
      return 'completed';
    }

    if ($qtn->status === 'sent' || $qtn->status === 'responded') {
      return 'in_progress';
    }

    return 'waiting';
  }

  /**
   * Get supplier quotations step status - DEPENDENT on QTN
   */
  protected function getSupplierQuotationsStepStatus($qtn, $supplierQuotes): string
  {
    if (!$qtn) {
      return 'waiting';
    }

    if (!in_array($qtn->status, ['sent', 'responded', 'closed'])) {
      return 'waiting';
    }

    if ($qtn->status === 'closed' && $supplierQuotes->isNotEmpty()) {
      return 'completed';
    }

    if ($supplierQuotes->isNotEmpty()) {
      return 'in_progress';
    }

    if ($qtn->status === 'sent') {
      return 'in_progress';
    }

    return 'waiting';
  }

  /**
   * Get supplier selection step status - DEPENDENT on supplier quotations
   */
  protected function getSupplierSelectionStepStatus($qtn, $supplierQuotes, bool $isSupplierSelected): string
  {
    if (!$qtn) {
      return 'waiting';
    }

    if ($qtn->status !== 'closed') {
      return 'waiting';
    }

    if ($supplierQuotes->isEmpty()) {
      return 'waiting';
    }

    $allReviewed = $supplierQuotes->every(function ($quote) {
      return $quote->verification_status === 'verified' || $quote->status === 'evaluated';
    });

    if (!$allReviewed) {
      return 'in_progress';
    }

    if ($isSupplierSelected) {
      return 'completed';
    }

    return 'in_progress';
  }

  /**
   * Get PO step status - DEPENDENT on supplier selection
   */
  protected function getPoStepStatus($po, bool $isSupplierSelected): string
  {
    if (!$isSupplierSelected) {
      return 'waiting';
    }

    if ($po) {
      return 'completed';
    }

    return 'in_progress';
  }

  /**
   * ✅ FIXED: Get delivery step status - supports BOTH GRN and SAN
   */
  protected function getDeliveryStepStatus($po, $grn, $san, bool $deliveryExists): string
  {
    // Cannot have delivery if no PO
    if (!$po) {
      return 'waiting';
    }

    // Check if delivery exists (either GRN or SAN)
    if ($deliveryExists) {
      return 'completed';
    }

    return 'in_progress';
  }

  /**
   * ✅ FIXED: Get invoicing step status - supports BOTH GRN and SAN
   */
  protected function getInvoicingStepStatus($grn, $san, $invoice): string
  {
    // Cannot have invoice if no delivery (GRN or SAN)
    if (!$grn && !$san) {
      return 'waiting';
    }

    if ($invoice) {
      return 'completed';
    }

    return 'in_progress';
  }

  /**
   * Get payment step status - DEPENDENT on invoice
   */
  protected function getPaymentStepStatus($invoice, $payment): string
  {
    // Cannot have payment if no invoice
    if (!$invoice) {
      return 'waiting';
    }

    if ($payment && $payment->status === 'paid') {
      return 'completed';
    }

    return 'in_progress';
  }

  /**
   * ✅ FIXED: Determine overall procurement status based on step statuses
   */
  protected function determineProcurementStatus(Requisition $requisition, array $steps): string
  {
    $statuses = [
      'quotation' => $steps['quotation']['status'] ?? 'waiting',
      'supplier_quotations' => $steps['supplier_quotations']['status'] ?? 'waiting',
      'supplier_selection' => $steps['supplier_selection']['status'] ?? 'waiting',
      'po_generation' => $steps['po_generation']['status'] ?? 'waiting',
      'delivery' => $steps['delivery']['status'] ?? 'waiting',
      'invoicing' => $steps['invoicing']['status'] ?? 'waiting',
      'payment' => $steps['payment']['status'] ?? 'waiting',
    ];

    // If payment is completed, procurement is complete
    if ($statuses['payment'] === 'completed') {
      return 'completed';
    }

    // 🔥 FIX: Check stages in order, but don't stop prematurely

    // Check if delivery is completed
    if ($statuses['delivery'] === 'completed') {
      // Check invoicing
      if ($statuses['invoicing'] === 'completed') {
        // Check payment
        if ($statuses['payment'] === 'in_progress') {
          return 'payment_pending';
        }
        return 'invoicing_pending';
      }
      return 'delivery_pending';
    }

    // If PO is generated but delivery not started
    if ($statuses['po_generation'] === 'completed') {
      return 'delivery_pending';
    }

    // Supplier selected but PO not generated yet
    if ($statuses['supplier_selection'] === 'completed') {
      return 'supplier_selected';
    }

    // Supplier quotations in progress
    if ($statuses['supplier_quotations'] === 'in_progress') {
      $quotesReceived = $steps['supplier_quotations']['quotes_received'] ?? 0;
      return $quotesReceived > 0 ? 'evaluating_quotations' : 'awaiting_quotations';
    }

    // Quotation in progress
    if ($statuses['quotation'] === 'in_progress') {
      return 'quotation_in_progress';
    }

    // Check if supplier is selected but no PO yet
    if ($this->isSupplierSelected($requisition)) {
      return 'supplier_selected';
    }

    // Check if quotes exist
    $qtn = QuotationRequest::where('requisition_id', $requisition->id)->first();
    if ($qtn) {
      if ($qtn->status === 'sent') {
        return 'awaiting_quotations';
      }
      if ($qtn->status === 'responded') {
        return 'evaluating_quotations';
      }
      if ($qtn->status === 'closed') {
        return 'supplier_selected';
      }
      return 'quotation_in_progress';
    }

    return 'initiated';
  }
  /**
   * Check if supplier is selected
   */
  protected function isSupplierSelected(Requisition $requisition): bool
  {
    $metadata = $requisition->metadata ?? [];
    $procurementMeta = $metadata['procurement'] ?? [];

    if (isset($procurementMeta['supplier_selected']) && $procurementMeta['supplier_selected'] === true) {
      return true;
    }

    if (isset($procurementMeta['selected_supplier_id'])) {
      return true;
    }

    $po = PurchaseOrder::where('requisition_id', $requisition->id)->first();
    if ($po) {
      return true;
    }

    return false;
  }

  public function getProcurementSummary(int $requisitionId): array
  {
    $requisition = Requisition::find($requisitionId);

    if (!$requisition) {
      throw ProcurementException::requisitionNotFound($requisitionId);
    }

    return [
      'requisition' => [
        'id' => $requisition->id,
        'reference_number' => $requisition->reference_number,
        'title' => $requisition->title,
        'total_amount' => $requisition->total_amount,
        'status' => $requisition->status,
      ],
      'procurement' => $this->getProcurementStatus($requisitionId),
      'timeline' => $this->getProcurementTimeline($requisitionId),
      'metrics' => $this->getProcurementMetrics($requisitionId),
    ];
  }

  public function hasActiveProcurement(int $requisitionId): bool
  {
    $requisition = Requisition::find($requisitionId);
    return $requisition ? $requisition->is_procurement_created : false;
  }

  public function completeProcurement(int $requisitionId): Requisition
  {
    $requisition = Requisition::find($requisitionId);

    if (!$requisition) {
      throw ProcurementException::requisitionNotFound($requisitionId);
    }

    if (!$requisition->is_procurement_created) {
      throw ProcurementException::procurementNotStarted();
    }

    $status = $this->getProcurementStatus($requisitionId);
    if ($status['current_status'] !== 'completed') {
      $payment = PaymentVoucher::where('requisition_id', $requisition->id)
        ->where('status', 'paid')
        ->first();

      if (!$payment) {
        throw ProcurementException::procurementNotComplete();
      }
    }

    return $this->transaction(function () use ($requisition) {
      $userId = $this->getCurrentUserId();
      if (!$userId) {
        $userId = $requisition->user_id;
      }

      $oldValues = $requisition->toArray();

      $metadata = $requisition->metadata ?? [];
      $metadata['procurement']['completed_at'] = now();
      $metadata['procurement']['status'] = 'completed';
      $metadata['procurement']['is_completed'] = true;

      $requisition->update([
        'metadata' => $metadata,
        'status' => 'procurement_completed',
      ]);

      $this->auditLogService->logModelUpdated(
        $requisition,
        $oldValues,
        "Procurement completed for requisition #{$requisition->id} ({$requisition->reference_number})"
      );

      ProcurementHistory::create([
        'requisition_id' => $requisition->id,
        'user_id' => $userId,
        'action' => 'procurement_completed',
        'entity_type' => 'requisition',
        'entity_id' => $requisition->id,
        'old_values' => null,
        'new_values' => ['status' => 'procurement_completed'],
        'comment' => 'Procurement completed successfully',
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);

      return $requisition;
    });
  }

  public function cancelProcurement(int $requisitionId, string $reason): Requisition
  {
    $requisition = Requisition::find($requisitionId);

    if (!$requisition) {
      throw ProcurementException::requisitionNotFound($requisitionId);
    }

    if (!$requisition->is_procurement_created) {
      throw ProcurementException::procurementNotStarted();
    }

    return $this->transaction(function () use ($requisition, $reason) {
      $userId = $this->getCurrentUserId();
      if (!$userId) {
        $userId = $requisition->user_id;
      }

      $oldValues = $requisition->toArray();

      $metadata = $requisition->metadata ?? [];
      $metadata['procurement']['cancelled_at'] = now();
      $metadata['procurement']['status'] = 'cancelled';
      $metadata['procurement']['cancellation_reason'] = $reason;
      $metadata['procurement']['is_completed'] = false;

      $requisition->update([
        'metadata' => $metadata,
        'is_procurement_created' => false,
      ]);

      $this->auditLogService->logModelUpdated(
        $requisition,
        $oldValues,
        "Procurement cancelled for requisition #{$requisition->id} ({$requisition->reference_number}). Reason: {$reason}"
      );

      ProcurementHistory::create([
        'requisition_id' => $requisition->id,
        'user_id' => $userId,
        'action' => 'procurement_cancelled',
        'entity_type' => 'requisition',
        'entity_id' => $requisition->id,
        'old_values' => null,
        'new_values' => ['status' => 'procurement_cancelled'],
        'comment' => "Procurement cancelled: {$reason}",
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);

      return $requisition;
    });
  }

  public function getProcurementTimeline(int $requisitionId): array
  {
    $history = ProcurementHistory::where('requisition_id', $requisitionId)
      ->orderBy('created_at', 'asc')
      ->get();

    return $history->map(function ($item) {
      return [
        'action' => $item->action,
        'action_label' => $item->action_label ?? str_replace('_', ' ', ucfirst($item->action)),
        'user' => $item->user_name ?? 'System',
        'comment' => $item->comment,
        'created_at' => $item->formatted_created_at ?? $item->created_at->toDateTimeString(),
      ];
    })->toArray();
  }

  public function getProcurementMetrics(int $requisitionId): array
  {
    $requisition = Requisition::find($requisitionId);

    if (!$requisition) {
      return [
        'time_to_start' => null,
        'time_to_complete' => null,
        'total_approvals' => 0,
        'total_quotes' => 0,
        'total_amount_saved' => 0,
        'total_amount_spent' => 0,
        'completion_rate' => 0,
      ];
    }

    $metrics = [
      'time_to_start' => null,
      'time_to_complete' => null,
      'total_approvals' => 0,
      'total_quotes' => 0,
      'total_amount_saved' => 0,
      'total_amount_spent' => 0,
      'completion_rate' => 0,
    ];

    if ($requisition->procurement_created_at && $requisition->submitted_at) {
      $metrics['time_to_start'] = $requisition->submitted_at->diffInHours($requisition->procurement_created_at);
    }

    $metadata = $requisition->metadata ?? [];
    if (isset($metadata['procurement']['completed_at'])) {
      $completedAt = $metadata['procurement']['completed_at'];
      if (is_string($completedAt)) {
        $completedAt = Carbon::parse($completedAt);
      }
      if ($requisition->procurement_created_at) {
        $metrics['time_to_complete'] = $requisition->procurement_created_at->diffInHours($completedAt);
      }
    }

    $metrics['total_approvals'] = $requisition->approvals()->count();

    $qtn = QuotationRequest::where('requisition_id', $requisition->id)->first();
    if ($qtn) {
      $submittedQuotes = $qtn->supplierQuotations()
        ->where('status', 'submitted')
        ->get();

      $metrics['total_quotes'] = $submittedQuotes->count();

      if ($submittedQuotes->isNotEmpty()) {
        $lowest = $submittedQuotes->sortBy('net_amount')->first();

        if ($lowest && $requisition->total_amount) {
          $estimatedAmount = floatval($requisition->total_amount);
          $lowestAmount = floatval($lowest->net_amount);
          $metrics['total_amount_saved'] = max(0, $estimatedAmount - $lowestAmount);
          $metrics['total_amount_spent'] = $lowestAmount;
        }
      }
    }

    $status = $this->getProcurementStatus($requisitionId);
    $currentStatus = $status['current_status'];

    if ($currentStatus === 'completed') {
      $metrics['completion_rate'] = 100;
    } elseif ($currentStatus === 'not_started') {
      $metrics['completion_rate'] = 0;
    } else {
      $metrics['completion_rate'] = self::STAGE_WEIGHTS[$currentStatus] ?? 0;

      if ($currentStatus === 'supplier_selected') {
        $po = PurchaseOrder::where('requisition_id', $requisition->id)->first();
        if ($po) {
          $metrics['completion_rate'] += 5;
        }
      }

      $metrics['completion_rate'] = min($metrics['completion_rate'], 100);
    }

    return $metrics;
  }

  public function getProcurementSteps(int $requisitionId): array
  {
    $status = $this->getProcurementStatus($requisitionId);
    return $status['steps'] ?? [];
  }

  public function isProcurementCompleted(int $requisitionId): bool
  {
    $status = $this->getProcurementStatus($requisitionId);
    return $status['current_status'] === 'completed';
  }
}
