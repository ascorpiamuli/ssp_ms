<?php
// app/Models/ProcurementHistory.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcurementHistory extends Model
{
  use HasFactory;

  /**
   * The table associated with the model.
   */
  protected $table = 'procurement_history';

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'user_id',
    'action',
    'entity_type',
    'entity_id',
    'old_values',
    'new_values',
    'comment',
    'ip_address',
    'user_agent',
    'session_id',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'old_values' => 'json',
    'new_values' => 'json',
    'metadata' => 'json',
    'created_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'action_label',
    'action_color',
    'formatted_created_at',
    'user_name',
    'entity_label',
    'is_status_change',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class, 'requisition_id');
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_id');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getActionLabelAttribute(): string
  {
    $labels = [
      // Quotation events
      'qtn_generated' => 'QTN Generated',
      'qtn_sent' => 'QTN Sent',
      'qtn_closed' => 'QTN Closed',
      'qtn_cancelled' => 'QTN Cancelled',
      'quotation_submitted' => 'Quotation Submitted',
      'quotation_verified' => 'Quotation Verified',
      'quotation_accepted' => 'Quotation Accepted',
      'quotation_rejected' => 'Quotation Rejected',
      'supplier_selected' => 'Supplier Selected',

      // Purchase Order events
      'po_generated' => 'PO Generated',
      'po_issued' => 'PO Issued',
      'po_sent' => 'PO Sent',
      'po_acknowledged' => 'PO Acknowledged',
      'po_completed' => 'PO Completed',
      'po_cancelled' => 'PO Cancelled',

      // GRN/SAN events
      'grn_generated' => 'GRN Generated',
      'grn_submitted' => 'GRN Submitted',
      'grn_approved' => 'GRN Approved',
      'grn_rejected' => 'GRN Rejected',
      'san_generated' => 'SAN Generated',
      'san_submitted' => 'SAN Submitted',
      'san_approved' => 'SAN Approved',
      'san_rejected' => 'SAN Rejected',

      // Invoice events
      'invoice_submitted' => 'Invoice Submitted',
      'invoice_matched' => 'Invoice Matched',
      'invoice_verified' => 'Invoice Verified',
      'invoice_approved' => 'Invoice Approved',
      'invoice_paid' => 'Invoice Paid',
      'invoice_disputed' => 'Invoice Disputed',
      'invoice_cancelled' => 'Invoice Cancelled',

      // Payment events
      'voucher_prepared' => 'Payment Voucher Prepared',
      'voucher_endorsed' => 'Payment Voucher Endorsed',
      'voucher_approved' => 'Payment Voucher Approved',
      'voucher_paid' => 'Payment Voucher Paid',
      'voucher_cancelled' => 'Payment Voucher Cancelled',

      // Cheque events
      'cheque_issued' => 'Cheque Issued',
      'cheque_cashed' => 'Cheque Cashed',
      'cheque_cancelled' => 'Cheque Cancelled',
      'cheque_stopped' => 'Cheque Stopped',

      // Contract events
      'contract_created' => 'Contract Created',
      'contract_approved' => 'Contract Approved',
      'contract_activated' => 'Contract Activated',
      'contract_completed' => 'Contract Completed',
      'contract_terminated' => 'Contract Terminated',
      'contract_renewed' => 'Contract Renewed',

      // Tender events
      'tender_published' => 'Tender Published',
      'tender_evaluating' => 'Tender Evaluating',
      'tender_awarded' => 'Tender Awarded',
      'tender_cancelled' => 'Tender Cancelled',

      // General events
      'created' => 'Created',
      'updated' => 'Updated',
      'deleted' => 'Deleted',
      'restored' => 'Restored',
      'status_changed' => 'Status Changed',
    ];

    return $labels[$this->action] ?? ucfirst(str_replace('_', ' ', $this->action));
  }

  public function getActionColorAttribute(): string
  {
    $colors = [
      'qtn_generated' => 'primary',
      'qtn_sent' => 'info',
      'quotation_submitted' => 'success',
      'quotation_accepted' => 'success',
      'quotation_rejected' => 'danger',
      'supplier_selected' => 'success',
      'po_generated' => 'primary',
      'po_issued' => 'info',
      'po_completed' => 'success',
      'po_cancelled' => 'danger',
      'grn_generated' => 'primary',
      'grn_approved' => 'success',
      'grn_rejected' => 'danger',
      'invoice_submitted' => 'info',
      'invoice_verified' => 'success',
      'invoice_paid' => 'success',
      'voucher_prepared' => 'primary',
      'voucher_endorsed' => 'info',
      'voucher_approved' => 'success',
      'cheque_issued' => 'info',
      'cheque_cashed' => 'success',
      'contract_created' => 'primary',
      'contract_activated' => 'success',
      'contract_completed' => 'info',
      'contract_terminated' => 'danger',
      'tender_published' => 'info',
      'tender_awarded' => 'success',
      'tender_cancelled' => 'danger',
      'created' => 'success',
      'updated' => 'info',
      'deleted' => 'danger',
      'restored' => 'success',
      'status_changed' => 'warning',
    ];

    return $colors[$this->action] ?? 'secondary';
  }

  public function getFormattedCreatedAtAttribute(): string
  {
    return $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : '';
  }

  public function getUserNameAttribute(): string
  {
    return $this->user ? $this->user->full_name : 'System';
  }

  public function getEntityLabelAttribute(): string
  {
    $labels = [
      'quotation_request' => 'Quotation Request',
      'supplier_quotation' => 'Supplier Quotation',
      'purchase_order' => 'Purchase Order',
      'goods_received_note' => 'Goods Received Note',
      'service_acknowledgment_note' => 'Service Acknowledgment Note',
      'invoice' => 'Invoice',
      'payment_voucher' => 'Payment Voucher',
      'cheque' => 'Cheque',
      'contract' => 'Contract',
      'tender' => 'Tender',
    ];

    return $labels[$this->entity_type] ?? ucfirst(str_replace('_', ' ', $this->entity_type));
  }

  public function getIsStatusChangeAttribute(): bool
  {
    return in_array($this->action, [
      'status_changed',
      'qtn_sent',
      'qtn_closed',
      'qtn_cancelled',
      'quotation_accepted',
      'quotation_rejected',
      'po_issued',
      'po_completed',
      'po_cancelled',
      'grn_approved',
      'grn_rejected',
      'invoice_verified',
      'invoice_paid',
      'voucher_endorsed',
      'voucher_approved',
      'cheque_cashed',
      'cheque_cancelled',
      'contract_activated',
      'contract_completed',
      'contract_terminated',
      'tender_published',
      'tender_awarded',
    ]);
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopeByAction($query, string $action)
  {
    return $query->where('action', $action);
  }

  public function scopeByEntity($query, string $type, int $id)
  {
    return $query->where('entity_type', $type)
      ->where('entity_id', $id);
  }

  public function scopeByRequisition($query, int $requisitionId)
  {
    return $query->where('requisition_id', $requisitionId);
  }

  public function scopeByUser($query, int $userId)
  {
    return $query->where('user_id', $userId);
  }

  public function scopeByDateRange($query, string $startDate, string $endDate)
  {
    return $query->whereBetween('created_at', [$startDate, $endDate]);
  }

  public function scopeStatusChanges($query)
  {
    return $query->where('action', 'status_changed')
      ->orWhereIn('action', [
        'qtn_sent',
        'qtn_closed',
        'quotation_accepted',
        'quotation_rejected',
        'po_issued',
        'po_completed',
        'grn_approved',
        'grn_rejected',
        'invoice_verified',
        'invoice_paid',
        'voucher_endorsed',
        'voucher_approved',
        'cheque_cashed',
        'cheque_cancelled',
      ]);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function getOldStatus(): ?string
  {
    return $this->old_values['status'] ?? null;
  }

  public function getNewStatus(): ?string
  {
    return $this->new_values['status'] ?? null;
  }

  public function getChangedFields(): array
  {
    if (!$this->old_values || !$this->new_values) {
      return [];
    }

    $changed = [];
    foreach ($this->new_values as $key => $value) {
      if (isset($this->old_values[$key]) && $this->old_values[$key] !== $value) {
        $changed[$key] = [
          'old' => $this->old_values[$key],
          'new' => $value,
        ];
      }
    }
    return $changed;
  }

  public function isAction(string $action): bool
  {
    return $this->action === $action;
  }

  public function isEntity(string $type): bool
  {
    return $this->entity_type === $type;
  }
}
