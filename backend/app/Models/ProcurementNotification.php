<?php
// app/Models/ProcurementNotification.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcurementNotification extends Model
{
  use HasFactory;

  /**
   * The table associated with the model.
   */
  protected $table = 'procurement_notifications';

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'user_id',
    'supplier_id',
    'sent_by',
    'type',
    'channel',
    'subject',
    'message',
    'html_message',
    'data',
    'sent_at',
    'read_at',
    'delivered_at',
    'is_read',
    'is_sent',
    'is_delivered',
    'retry_count',
    'next_retry_at',
    'error_message',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'data' => 'json',
    'sent_at' => 'datetime',
    'read_at' => 'datetime',
    'delivered_at' => 'datetime',
    'next_retry_at' => 'datetime',
    'is_read' => 'boolean',
    'is_sent' => 'boolean',
    'is_delivered' => 'boolean',
    'retry_count' => 'integer',
    'metadata' => 'json',
    'created_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'type_label',
    'type_color',
    'status_label',
    'status_color',
    'user_name',
    'formatted_created_at',
    'channel_label',
    'is_unread',
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

  public function supplier(): BelongsTo
  {
    return $this->belongsTo(User::class, 'supplier_id');
  }

  public function sentBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'sent_by');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getTypeLabelAttribute(): string
  {
    $labels = [
      // Quotation notifications
      'qtn_sent' => 'Quotation Request Sent',
      'qtn_reminder' => 'Quotation Reminder',
      'qtn_closed' => 'Quotation Closed',
      'quotation_received' => 'Quotation Received',
      'quotation_accepted' => 'Quotation Accepted',
      'quotation_rejected' => 'Quotation Rejected',
      'supplier_selected' => 'Supplier Selected',

      // Purchase Order notifications
      'po_generated' => 'Purchase Order Generated',
      'po_issued' => 'Purchase Order Issued',
      'po_sent' => 'Purchase Order Sent',
      'po_acknowledged' => 'Purchase Order Acknowledged',
      'po_completed' => 'Purchase Order Completed',

      // GRN/SAN notifications
      'grn_generated' => 'GRN Generated',
      'grn_approval' => 'GRN Approval Required',
      'grn_approved' => 'GRN Approved',
      'grn_rejected' => 'GRN Rejected',
      'san_generated' => 'SAN Generated',
      'san_approval' => 'SAN Approval Required',
      'san_approved' => 'SAN Approved',
      'san_rejected' => 'SAN Rejected',

      // Invoice notifications
      'invoice_submitted' => 'Invoice Submitted',
      'invoice_verified' => 'Invoice Verified',
      'invoice_approved' => 'Invoice Approved',
      'invoice_paid' => 'Invoice Paid',
      'invoice_sent_back' => 'Invoice Sent Back',

      // Payment notifications
      'voucher_prepared' => 'Payment Voucher Prepared',
      'voucher_endorsement' => 'Payment Voucher Endorsement Required',
      'voucher_approval' => 'Payment Voucher Approval Required',
      'voucher_paid' => 'Payment Processed',

      // Cheque notifications
      'cheque_issued' => 'Cheque Issued',
      'cheque_cashed' => 'Cheque Cashed',

      // Contract notifications
      'contract_created' => 'Contract Created',
      'contract_activation' => 'Contract Activated',
      'contract_expiring' => 'Contract Expiring Soon',
      'contract_completed' => 'Contract Completed',

      // Tender notifications
      'tender_published' => 'Tender Published',
      'tender_closing' => 'Tender Closing Soon',
      'tender_awarded' => 'Tender Awarded',

      // General notifications
      'reminder' => 'Reminder',
      'escalation' => 'Escalation',
      'system' => 'System Notification',
    ];

    return $labels[$this->type] ?? ucfirst(str_replace('_', ' ', $this->type));
  }

  public function getTypeColorAttribute(): string
  {
    $colors = [
      'qtn_sent' => 'primary',
      'qtn_reminder' => 'warning',
      'quotation_received' => 'success',
      'quotation_accepted' => 'success',
      'quotation_rejected' => 'danger',
      'supplier_selected' => 'success',
      'po_generated' => 'primary',
      'po_issued' => 'info',
      'po_completed' => 'success',
      'grn_generated' => 'primary',
      'grn_approval' => 'warning',
      'grn_approved' => 'success',
      'grn_rejected' => 'danger',
      'invoice_submitted' => 'info',
      'invoice_verified' => 'success',
      'invoice_paid' => 'success',
      'invoice_sent_back' => 'danger',
      'voucher_prepared' => 'primary',
      'voucher_endorsement' => 'warning',
      'voucher_approval' => 'warning',
      'voucher_paid' => 'success',
      'cheque_issued' => 'info',
      'cheque_cashed' => 'success',
      'contract_created' => 'primary',
      'contract_activation' => 'success',
      'contract_expiring' => 'warning',
      'tender_published' => 'info',
      'tender_closing' => 'warning',
      'tender_awarded' => 'success',
      'reminder' => 'info',
      'escalation' => 'danger',
      'system' => 'secondary',
    ];

    return $colors[$this->type] ?? 'secondary';
  }

  public function getStatusLabelAttribute(): string
  {
    if ($this->is_read) {
      return 'Read';
    }
    if ($this->is_delivered) {
      return 'Delivered';
    }
    if ($this->is_sent) {
      return 'Sent';
    }
    return 'Pending';
  }

  public function getStatusColorAttribute(): string
  {
    if ($this->is_read) {
      return 'success';
    }
    if ($this->is_delivered) {
      return 'info';
    }
    if ($this->is_sent) {
      return 'primary';
    }
    return 'warning';
  }

  public function getUserNameAttribute(): string
  {
    if ($this->user) {
      return $this->user->full_name;
    }
    if ($this->supplier) {
      return $this->supplier->full_name . ' (Supplier)';
    }
    return 'Unknown User';
  }

  public function getFormattedCreatedAtAttribute(): string
  {
    return $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : '';
  }

  public function getChannelLabelAttribute(): string
  {
    $labels = [
      'email' => 'Email',
      'in_app' => 'In-App',
      'sms' => 'SMS',
      'whatsapp' => 'WhatsApp',
    ];

    return $labels[$this->channel] ?? ucfirst($this->channel ?? 'Unknown');
  }

  public function getIsUnreadAttribute(): bool
  {
    return !$this->is_read;
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopeUnread($query)
  {
    return $query->where('is_read', false);
  }

  public function scopeRead($query)
  {
    return $query->where('is_read', true);
  }

  public function scopeSent($query)
  {
    return $query->where('is_sent', true);
  }

  public function scopeDelivered($query)
  {
    return $query->where('is_delivered', true);
  }

  public function scopePending($query)
  {
    return $query->where('is_sent', false);
  }

  public function scopeByType($query, string $type)
  {
    return $query->where('type', $type);
  }

  public function scopeByChannel($query, string $channel)
  {
    return $query->where('channel', $channel);
  }

  public function scopeForUser($query, int $userId)
  {
    return $query->where('user_id', $userId);
  }

  public function scopeForSupplier($query, int $supplierId)
  {
    return $query->where('supplier_id', $supplierId);
  }

  public function scopeByRequisition($query, int $requisitionId)
  {
    return $query->where('requisition_id', $requisitionId);
  }

  public function scopeFailed($query)
  {
    return $query->whereNotNull('error_message')
      ->where('is_sent', false);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isUnread(): bool
  {
    return !$this->is_read;
  }

  public function isRead(): bool
  {
    return $this->is_read;
  }

  public function isSent(): bool
  {
    return $this->is_sent;
  }

  public function isDelivered(): bool
  {
    return $this->is_delivered;
  }

  public function isPending(): bool
  {
    return !$this->is_sent;
  }

  public function hasFailed(): bool
  {
    return !is_null($this->error_message) && !$this->is_sent;
  }

  public function markAsSent(): self
  {
    $this->update([
      'is_sent' => true,
      'sent_at' => now(),
    ]);
    return $this;
  }

  public function markAsDelivered(): self
  {
    $this->update([
      'is_delivered' => true,
      'delivered_at' => now(),
    ]);
    return $this;
  }

  public function markAsRead(): self
  {
    $this->update([
      'is_read' => true,
      'read_at' => now(),
    ]);
    return $this;
  }

  public function markAsFailed(string $error): self
  {
    $this->update([
      'error_message' => $error,
      'retry_count' => $this->retry_count + 1,
      'next_retry_at' => now()->addHours($this->retry_count + 1),
    ]);
    return $this;
  }

  public function scheduleRetry(): self
  {
    $this->update([
      'is_sent' => false,
      'next_retry_at' => now()->addHours($this->retry_count + 1),
    ]);
    return $this;
  }

  public function getRecipientType(): string
  {
    if ($this->user_id) {
      return 'user';
    }
    if ($this->supplier_id) {
      return 'supplier';
    }
    return 'unknown';
  }

  public function getRecipientName(): string
  {
    if ($this->user) {
      return $this->user->full_name;
    }
    if ($this->supplier) {
      return $this->supplier->full_name;
    }
    return 'Unknown';
  }

  public function getData(string $key = null)
  {
    $data = $this->data ?? [];
    if ($key) {
      return $data[$key] ?? null;
    }
    return $data;
  }

  public function isForUser(int $userId): bool
  {
    return $this->user_id === $userId;
  }

  public function isForSupplier(int $supplierId): bool
  {
    return $this->supplier_id === $supplierId;
  }
}
