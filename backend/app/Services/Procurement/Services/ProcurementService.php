<?php
// app/Services/Procurement/Services/ProcurementService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\Requisition;
use App\Models\ProcurementHistory;
use App\Models\QuotationRequest;
use App\Models\PurchaseOrder;
use App\Models\GoodsReceivedNote;
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

class ProcurementService extends BaseService implements ProcurementServiceInterface
{
  public function __construct(
    protected QuotationRepositoryInterface $quotationRepository,
    protected PurchaseOrderRepositoryInterface $purchaseOrderRepository,
    protected GoodsReceivedRepositoryInterface $goodsReceivedRepository,
    protected InvoiceRepositoryInterface $invoiceRepository,
    protected PaymentRepositoryInterface $paymentRepository,
    protected NotificationDispatcherInterface $notificationDispatcher
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
      $requisition->update([
        'is_procurement_created' => true,
        'procurement_created_at' => now(),
        'metadata' => array_merge($requisition->metadata ?? [], [
          'procurement' => [
            'started_at' => now(),
            'started_by' => $this->getCurrentUserId(),
            'status' => 'initiated',
            'steps' => [],
          ]
        ])
      ]);

      $this->logHistory(
        $requisition->id,
        'procurement_started',
        'requisition',
        $requisition->id,
        null,
        ['status' => 'procurement_initiated'],
        'Procurement initiated for requisition'
      );

      // Notify procurement officer
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
      'is_procurement_created' => $requisition->is_procurement_created,
      'procurement_created_at' => $requisition->procurement_created_at,
      'current_status' => 'not_started',
      'steps' => [],
    ];

    if (!$requisition->is_procurement_created) {
      return $status;
    }

    // Check QTN
    $qtn = QuotationRequest::where('requisition_id', $requisition->id)->first();
    if ($qtn) {
      $status['steps']['quotation'] = [
        'status' => $qtn->status,
        'qtn_number' => $qtn->qtn_number,
        'created_at' => $qtn->created_at->toDateTimeString(),
      ];
    }

    // Check Purchase Order
    $po = PurchaseOrder::where('requisition_id', $requisition->id)->first();
    if ($po) {
      $status['steps']['purchase_order'] = [
        'status' => $po->status,
        'po_number' => $po->po_number,
        'type' => $po->type,
        'created_at' => $po->created_at->toDateTimeString(),
      ];
    }

    // Check GRN
    $grn = GoodsReceivedNote::where('requisition_id', $requisition->id)->first();
    if ($grn) {
      $status['steps']['goods_received'] = [
        'status' => $grn->status,
        'grn_number' => $grn->grn_number,
        'created_at' => $grn->created_at->toDateTimeString(),
      ];
    }

    // Check Invoice
    $invoice = Invoice::where('requisition_id', $requisition->id)->first();
    if ($invoice) {
      $status['steps']['invoice'] = [
        'status' => $invoice->status,
        'invoice_number' => $invoice->invoice_number,
        'created_at' => $invoice->created_at->toDateTimeString(),
      ];
    }

    // Check Payment
    $payment = PaymentVoucher::where('requisition_id', $requisition->id)->first();
    if ($payment) {
      $status['steps']['payment'] = [
        'status' => $payment->status,
        'voucher_number' => $payment->voucher_number,
        'created_at' => $payment->created_at->toDateTimeString(),
      ];
    }

    // Determine overall status
    if ($payment && $payment->status === 'paid') {
      $status['current_status'] = 'completed';
    } elseif ($invoice && $invoice->status === 'approved') {
      $status['current_status'] = 'payment_pending';
    } elseif ($grn && $grn->status === 'completed') {
      $status['current_status'] = 'invoicing_pending';
    } elseif ($po && $po->status === 'completed') {
      $status['current_status'] = 'goods_receipt_pending';
    } elseif ($qtn && $qtn->status === 'closed') {
      $status['current_status'] = 'supplier_selected';
    } elseif ($qtn && $qtn->status === 'responded') {
      $status['current_status'] = 'evaluating_quotations';
    } elseif ($qtn && $qtn->status === 'sent') {
      $status['current_status'] = 'awaiting_quotations';
    } elseif ($qtn) {
      $status['current_status'] = 'quotation_in_progress';
    } elseif ($requisition->is_procurement_created) {
      $status['current_status'] = 'initiated';
    }

    return $status;
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

    return $this->transaction(function () use ($requisition) {
      $metadata = $requisition->metadata ?? [];
      $metadata['procurement']['completed_at'] = now();
      $metadata['procurement']['status'] = 'completed';

      $requisition->update([
        'metadata' => $metadata,
        'status' => 'procurement_completed',
      ]);

      $this->logHistory(
        $requisition->id,
        'procurement_completed',
        'requisition',
        $requisition->id,
        null,
        ['status' => 'procurement_completed'],
        'Procurement completed successfully'
      );

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
      $metadata = $requisition->metadata ?? [];
      $metadata['procurement']['cancelled_at'] = now();
      $metadata['procurement']['status'] = 'cancelled';
      $metadata['procurement']['cancellation_reason'] = $reason;

      $requisition->update([
        'metadata' => $metadata,
        'is_procurement_created' => false,
      ]);

      $this->logHistory(
        $requisition->id,
        'procurement_cancelled',
        'requisition',
        $requisition->id,
        null,
        ['status' => 'procurement_cancelled'],
        "Procurement cancelled: {$reason}"
      );

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
        'action_label' => $item->action_label,
        'user' => $item->user_name,
        'comment' => $item->comment,
        'created_at' => $item->formatted_created_at,
      ];
    })->toArray();
  }

  public function getProcurementMetrics(int $requisitionId): array
  {
    $requisition = Requisition::find($requisitionId);

    if (!$requisition) {
      return [];
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

    if ($requisition->procurement_created_at) {
      $metrics['time_to_start'] = $requisition->submitted_at?->diffInHours($requisition->procurement_created_at);
    }

    $metadata = $requisition->metadata ?? [];
    if (isset($metadata['procurement']['completed_at'])) {
      $completedAt = $metadata['procurement']['completed_at'];
      if (is_string($completedAt)) {
        $completedAt = \Carbon\Carbon::parse($completedAt);
      }
      $metrics['time_to_complete'] = $requisition->procurement_created_at?->diffInHours($completedAt);
    }

    // Get quote count
    $qtn = QuotationRequest::where('requisition_id', $requisition->id)->first();
    if ($qtn) {
      $metrics['total_quotes'] = $qtn->supplierQuotations()->where('status', 'submitted')->count();
    }

    // Get amount saved (lowest quote vs estimated)
    if ($qtn) {
      $lowest = $qtn->supplierQuotations()->where('status', 'submitted')->orderBy('net_amount')->first();
      if ($lowest && $requisition->total_amount) {
        $metrics['total_amount_saved'] = max(0, $requisition->total_amount - $lowest->net_amount);
        $metrics['total_amount_spent'] = $lowest->net_amount;
      }
    }

    // Check if procurement is complete
    $status = $this->getProcurementStatus($requisitionId);
    if ($status['current_status'] === 'completed') {
      $metrics['completion_rate'] = 100;
    } else {
      $steps = count($status['steps']);
      $completedSteps = 0;
      foreach ($status['steps'] as $step) {
        if (in_array($step['status'], ['completed', 'closed', 'paid', 'cashed'])) {
          $completedSteps++;
        }
      }
      $metrics['completion_rate'] = $steps > 0 ? round(($completedSteps / $steps) * 100, 2) : 0;
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

  /**
   * Log procurement history.
   */
  protected function logHistory(
    int $requisitionId,
    string $action,
    string $entityType,
    int $entityId,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null
  ): void {
    ProcurementHistory::create([
      'requisition_id' => $requisitionId,
      'user_id' => $this->getCurrentUserId(),
      'action' => $action,
      'entity_type' => $entityType,
      'entity_id' => $entityId,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
