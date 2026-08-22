<?php
// app/Models/PurchaseOrder.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PurchaseOrder extends Model
{
  use HasFactory, SoftDeletes;

    // ============================================
    // STATUS CONSTANTS
    // ============================================

  /**
   * Purchase order status constants
   */
  public const STATUS_DRAFT = 'draft';
  public const STATUS_PENDING_CHECK = 'pending_check';
  public const STATUS_PENDING_ENDORSEMENT = 'pending_endorsement';
  public const STATUS_PENDING_APPROVAL = 'pending_approval';
  public const STATUS_ISSUED = 'issued';
  public const STATUS_SENT = 'sent';
  public const STATUS_ACKNOWLEDGED = 'acknowledged';
  public const STATUS_DELIVERED = 'delivered';
  public const STATUS_PARTIAL = 'partial';
  public const STATUS_COMPLETED = 'completed';
  public const STATUS_CANCELLED = 'cancelled';
  public const STATUS_CLOSED = 'closed';

  /**
   * Workflow configuration
   */
  public const WORKFLOW = [
    self::STATUS_DRAFT => [
      'step' => 'draft',
      'label' => 'Draft',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => true,
      'next' => self::STATUS_PENDING_CHECK,
      'permission' => 'purchase_orders.edit',
      'color' => 'gray',
    ],
    self::STATUS_PENDING_CHECK => [
      'step' => 'check',
      'label' => 'Pending Check',
      'requires_check' => true,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => self::STATUS_PENDING_ENDORSEMENT,
      'permission' => 'purchase_orders.check',
      'color' => 'warning',
    ],
    self::STATUS_PENDING_ENDORSEMENT => [
      'step' => 'endorse',
      'label' => 'Pending Endorsement',
      'requires_check' => false,
      'requires_endorse' => true,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => self::STATUS_PENDING_APPROVAL,
      'permission' => 'purchase_orders.endorse',
      'color' => 'info',
    ],
    self::STATUS_PENDING_APPROVAL => [
      'step' => 'approve',
      'label' => 'Pending Approval',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => true,
      'can_edit' => false,
      'next' => self::STATUS_ISSUED,
      'permission' => 'purchase_orders.approve',
      'color' => 'primary',
    ],
    self::STATUS_ISSUED => [
      'step' => 'issued',
      'label' => 'Issued',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => self::STATUS_SENT,
      'permission' => 'purchase_orders.send',
      'color' => 'indigo',
    ],
    self::STATUS_SENT => [
      'step' => 'sent',
      'label' => 'Sent to Supplier',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => self::STATUS_ACKNOWLEDGED,
      'permission' => null,
      'color' => 'primary',
    ],
    self::STATUS_ACKNOWLEDGED => [
      'step' => 'acknowledged',
      'label' => 'Acknowledged',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => self::STATUS_DELIVERED,
      'permission' => null,
      'color' => 'purple',
    ],
    self::STATUS_DELIVERED => [
      'step' => 'delivered',
      'label' => 'Delivered',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => self::STATUS_COMPLETED,
      'permission' => 'purchase_orders.complete',
      'color' => 'emerald',
    ],
    self::STATUS_PARTIAL => [
      'step' => 'partial',
      'label' => 'Partially Delivered',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => self::STATUS_DELIVERED,
      'permission' => null,
      'color' => 'amber',
    ],
    self::STATUS_COMPLETED => [
      'step' => 'completed',
      'label' => 'Completed',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => null,
      'permission' => null,
      'color' => 'teal',
    ],
    self::STATUS_CANCELLED => [
      'step' => 'cancelled',
      'label' => 'Cancelled',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => null,
      'permission' => null,
      'color' => 'danger',
    ],
    self::STATUS_CLOSED => [
      'step' => 'closed',
      'label' => 'Closed',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => null,
      'permission' => null,
      'color' => 'secondary',
    ],
  ];

  /**
   * Statuses that allow PDF download
   */
  public const DOWNLOADABLE_STATUSES = [
    self::STATUS_PENDING_ENDORSEMENT,
    self::STATUS_PENDING_APPROVAL,
    self::STATUS_ISSUED,
    self::STATUS_SENT,
    self::STATUS_ACKNOWLEDGED,
    self::STATUS_DELIVERED,
    self::STATUS_PARTIAL,
    self::STATUS_COMPLETED,
  ];

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'supplier_id',
    'supplier_quotation_id',
    'po_number',
    'type',
    'title',
    'description',
    'total_amount',
    'tax_amount',
    'total_with_tax',
    'currency',
    'issue_date',
    'expected_delivery_date',
    'actual_delivery_date',
    'delivery_address',
    'delivery_contact',
    'delivery_phone',
    'delivery_email',
    'payment_terms',
    'delivery_terms',
    'special_conditions',
    'terms_and_conditions',
    'validity_period_days',
    'contract_number',
    'contract_start_date',
    'contract_end_date',
    'status',
    'generated_by',
    'checked_by',
    'endorsed_by',
    'approved_by',
    'checked_at',
    'endorsed_at',
    'approved_at',
    'issued_at',
    'sent_at',
    'acknowledged_at',
    'completed_at',
    'cancelled_at',
    'cancellation_reason',
    'digital_signature_generator',
    'digital_signature_checker',
    'digital_signature_endorser',
    'digital_signature_approver',
    'metadata',
    'download_count',
    'pdf_upload_id',
    'pdf_storage_path',
    'pdf_filename',
    'last_downloaded_at'
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'total_amount' => 'decimal:2',
    'tax_amount' => 'decimal:2',
    'total_with_tax' => 'decimal:2',
    'exchange_rate' => 'decimal:4',
    'issue_date' => 'date',
    'expected_delivery_date' => 'date',
    'actual_delivery_date' => 'date',
    'validity_period_days' => 'integer',
    'contract_start_date' => 'date',
    'contract_end_date' => 'date',
    'checked_at' => 'datetime',
    'endorsed_at' => 'datetime',
    'approved_at' => 'datetime',
    'issued_at' => 'datetime',
    'sent_at' => 'datetime',
    'acknowledged_at' => 'datetime',
    'completed_at' => 'datetime',
    'cancelled_at' => 'datetime',
    'metadata' => 'json',
    'deleted_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'status_label',
    'status_color',
    'status_step',
    'type_label',
    'type_color',
    'formatted_total_amount',
    'is_lpo',
    'is_lso',
    'supplier_name',
    'is_overdue',
    'is_fully_delivered',
    'delivery_progress',
    'can_download_pdf',
    'needs_check',
    'needs_endorsement',
    'needs_approval',
    'is_checked',
    'is_endorsed',
    'is_approved',
    'workflow_completion',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class, 'requisition_id');
  }

  public function supplier(): BelongsTo
  {
    return $this->belongsTo(User::class, 'supplier_id');
  }

  public function supplierQuotation(): BelongsTo
  {
    return $this->belongsTo(SupplierQuotation::class, 'supplier_quotation_id');
  }

  public function generatedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'generated_by');
  }

  public function checkedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'checked_by');
  }

  public function endorsedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'endorsed_by');
  }

  public function approvedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'approved_by');
  }

  public function items(): HasMany
  {
    return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id');
  }

  public function goodsReceivedNotes(): HasMany
  {
    return $this->hasMany(GoodsReceivedNote::class, 'purchase_order_id');
  }

  public function serviceAcknowledgmentNotes(): HasMany
  {
    return $this->hasMany(ServiceAcknowledgmentNote::class, 'purchase_order_id');
  }

  public function invoices(): HasMany
  {
    return $this->hasMany(Invoice::class, 'purchase_order_id');
  }

  public function paymentVouchers(): HasMany
  {
    return $this->hasMany(PaymentVoucher::class, 'purchase_order_id');
  }

  public function contracts(): HasMany
  {
    return $this->hasMany(Contract::class, 'purchase_order_id');
  }

  public function pdfUpload(): BelongsTo
  {
    return $this->belongsTo(Upload::class, 'pdf_upload_id');
  }

  /**
   * Get the upload record (alias for pdfUpload)
   */
  public function upload(): BelongsTo
  {
    return $this->belongsTo(Upload::class, 'pdf_upload_id');
  }

  // ============================================
  // WORKFLOW ACCESSORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    return self::WORKFLOW[$this->status]['label'] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    return self::WORKFLOW[$this->status]['color'] ?? 'secondary';
  }

  public function getStatusStepAttribute(): string
  {
    return self::WORKFLOW[$this->status]['step'] ?? $this->status;
  }

  public function getCanDownloadPdfAttribute(): bool
  {
    return in_array($this->status, self::DOWNLOADABLE_STATUSES) && $this->pdf_storage_path;
  }

  public function getNeedsCheckAttribute(): bool
  {
    return $this->status === self::STATUS_PENDING_CHECK;
  }

  public function getNeedsEndorsementAttribute(): bool
  {
    return $this->status === self::STATUS_PENDING_ENDORSEMENT;
  }

  public function getNeedsApprovalAttribute(): bool
  {
    return $this->status === self::STATUS_PENDING_APPROVAL;
  }

  public function getIsCheckedAttribute(): bool
  {
    return $this->checked_by !== null && $this->checked_at !== null;
  }

  public function getIsEndorsedAttribute(): bool
  {
    return $this->endorsed_by !== null && $this->endorsed_at !== null;
  }

  public function getIsApprovedAttribute(): bool
  {
    return $this->approved_by !== null && $this->approved_at !== null;
  }

  public function getWorkflowCompletionAttribute(): array
  {
    return [
      'check' => $this->getIsCheckedAttribute(),
      'endorse' => $this->getIsEndorsedAttribute(),
      'approve' => $this->getIsApprovedAttribute(),
      'all_complete' => $this->getIsCheckedAttribute() &&
        $this->getIsEndorsedAttribute() &&
        $this->getIsApprovedAttribute(),
      'step' => $this->getStatusStepAttribute(),
    ];
  }

  // ============================================
  // OTHER ACCESSORS
  // ============================================

  public function getTypeLabelAttribute(): string
  {
    return $this->type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)';
  }

  public function getTypeColorAttribute(): string
  {
    return $this->type === 'lpo' ? 'success' : 'info';
  }

  public function getFormattedTotalAmountAttribute(): string
  {
    return number_format((float) ($this->total_amount ?? 0), 2);
  }

  public function getIsLpoAttribute(): bool
  {
    return $this->type === 'lpo';
  }

  public function getIsLsoAttribute(): bool
  {
    return $this->type === 'lso';
  }

  public function getSupplierNameAttribute(): string
  {
    return $this->supplier ? $this->supplier->full_name : 'Unknown Supplier';
  }

  public function getIsOverdueAttribute(): bool
  {
    if (
      $this->status === self::STATUS_COMPLETED ||
      $this->status === self::STATUS_CANCELLED ||
      $this->status === self::STATUS_CLOSED
    ) {
      return false;
    }
    return $this->expected_delivery_date && $this->expected_delivery_date->isPast();
  }

  public function getIsFullyDeliveredAttribute(): bool
  {
    return $this->status === self::STATUS_COMPLETED;
  }

  public function getDeliveryProgressAttribute(): float
  {
    $totalItems = $this->items->count();
    if ($totalItems === 0) {
      return 0;
    }

    $receivedItems = $this->items->where('fully_received', true)->count();
    return round(($receivedItems / $totalItems) * 100, 2);
  }

  /**
   * Set po_number to uppercase.
   */
  public function setPoNumberAttribute(string $value): void
  {
    $this->attributes['po_number'] = strtoupper(trim($value));
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopeLpo($query)
  {
    return $query->where('type', 'lpo');
  }

  public function scopeLso($query)
  {
    return $query->where('type', 'lso');
  }

  public function scopeDraft($query)
  {
    return $query->where('status', self::STATUS_DRAFT);
  }

  public function scopePendingCheck($query)
  {
    return $query->where('status', self::STATUS_PENDING_CHECK);
  }

  public function scopePendingEndorsement($query)
  {
    return $query->where('status', self::STATUS_PENDING_ENDORSEMENT);
  }

  public function scopePendingApproval($query)
  {
    return $query->where('status', self::STATUS_PENDING_APPROVAL);
  }

  public function scopeIssued($query)
  {
    return $query->where('status', self::STATUS_ISSUED);
  }

  public function scopeSent($query)
  {
    return $query->where('status', self::STATUS_SENT);
  }

  public function scopeDelivered($query)
  {
    return $query->where('status', self::STATUS_DELIVERED);
  }

  public function scopeCompleted($query)
  {
    return $query->where('status', self::STATUS_COMPLETED);
  }

  public function scopeCancelled($query)
  {
    return $query->where('status', self::STATUS_CANCELLED);
  }

  public function scopeOverdue($query)
  {
    return $query->whereDate('expected_delivery_date', '<', now())
      ->whereNotIn('status', [self::STATUS_COMPLETED, self::STATUS_CANCELLED, self::STATUS_CLOSED]);
  }

  public function scopeActive($query)
  {
    return $query->whereIn('status', [
      self::STATUS_ISSUED,
      self::STATUS_SENT,
      self::STATUS_ACKNOWLEDGED,
      self::STATUS_DELIVERED,
      self::STATUS_PARTIAL
    ]);
  }

  public function scopeBySupplier($query, int $supplierId)
  {
    return $query->where('supplier_id', $supplierId);
  }

  public function scopeByRequisition($query, int $requisitionId)
  {
    return $query->where('requisition_id', $requisitionId);
  }

  public function scopeByStatus($query, string $status)
  {
    return $query->where('status', $status);
  }

  public function scopeByType($query, string $type)
  {
    return $query->where('type', $type);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isDraft(): bool
  {
    return $this->status === self::STATUS_DRAFT;
  }

  public function isPendingCheck(): bool
  {
    return $this->status === self::STATUS_PENDING_CHECK;
  }

  public function isPendingEndorsement(): bool
  {
    return $this->status === self::STATUS_PENDING_ENDORSEMENT;
  }

  public function isPendingApproval(): bool
  {
    return $this->status === self::STATUS_PENDING_APPROVAL;
  }

  public function isIssued(): bool
  {
    return $this->status === self::STATUS_ISSUED;
  }

  public function isSent(): bool
  {
    return $this->status === self::STATUS_SENT;
  }

  public function isAcknowledged(): bool
  {
    return $this->status === self::STATUS_ACKNOWLEDGED;
  }

  public function isDelivered(): bool
  {
    return $this->status === self::STATUS_DELIVERED;
  }

  public function isPartial(): bool
  {
    return $this->status === self::STATUS_PARTIAL;
  }

  public function isCompleted(): bool
  {
    return $this->status === self::STATUS_COMPLETED;
  }

  public function isCancelled(): bool
  {
    return $this->status === self::STATUS_CANCELLED;
  }

  public function isClosed(): bool
  {
    return $this->status === self::STATUS_CLOSED;
  }

  public function isOverdue(): bool
  {
    return $this->isOverdueAttribute();
  }

  public function isLpo(): bool
  {
    return $this->type === 'lpo';
  }

  public function isLso(): bool
  {
    return $this->type === 'lso';
  }

  public function canBeModified(): bool
  {
    return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_ISSUED]);
  }

  public function canBeDeleted(): bool
  {
    return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_CANCELLED]);
  }

  public function canBeCheckedBy(int $userId): bool
  {
    if (!$this->isPendingCheck()) {
      return false;
    }

    if ($this->generated_by === $userId) {
      return false;
    }

    $user = \App\Models\User::find($userId);
    if (!$user || !$user->hasRole('hod')) {
      return false;
    }

    $requisition = $this->requisition;
    if ($requisition && $user->department_id !== $requisition->department_id) {
      return false;
    }

    return true;
  }

  public function canBeEndorsedBy(int $userId): bool
  {
    if (!$this->isPendingEndorsement()) {
      return false;
    }

    $user = \App\Models\User::find($userId);
    if (!$user || !$user->hasRole('accountant')) {
      return false;
    }

    return true;
  }

  public function canBeApprovedBy(int $userId): bool
  {
    if (!$this->isPendingApproval()) {
      return false;
    }

    $user = \App\Models\User::find($userId);
    if (!$user) {
      return false;
    }

    return $user->hasRole('director') ||
      $user->hasRole('finance_admin') ||
      $user->hasRole('admin');
  }

  public function canDownloadPdf(): bool
  {
    return $this->can_download_pdf;
  }

  public function needsAction(): bool
  {
    return in_array($this->status, [
      self::STATUS_PENDING_CHECK,
      self::STATUS_PENDING_ENDORSEMENT,
      self::STATUS_PENDING_APPROVAL,
    ]);
  }

  public function getNextAction(): ?string
  {
    if ($this->isPendingCheck()) {
      return 'HOD Check';
    }

    if ($this->isPendingEndorsement()) {
      return 'Accountant Endorsement';
    }

    if ($this->isPendingApproval()) {
      return 'Director Approval';
    }

    return null;
  }

  public function getMissingSignatures(): array
  {
    $missing = [];

    if (!$this->getIsCheckedAttribute() && $this->needs_check) {
      $missing[] = 'HOD Check';
    }

    if (!$this->getIsEndorsedAttribute() && $this->needs_endorsement) {
      $missing[] = 'Accountant Endorsement';
    }

    if (!$this->getIsApprovedAttribute() && $this->needs_approval) {
      $missing[] = 'Director Approval';
    }

    return $missing;
  }

  public function getSignatureProgress(): float
  {
    $total = 3; // Check, Endorse, Approve
    $done = 0;

    if ($this->getIsCheckedAttribute()) {
      $done++;
    }
    if ($this->getIsEndorsedAttribute()) {
      $done++;
    }
    if ($this->getIsApprovedAttribute()) {
      $done++;
    }

    return round(($done / $total) * 100, 2);
  }

  public function updateTotalAmount(): self
  {
    $total = $this->items()->sum('net_price');
    $tax = $this->items()->sum('tax_amount');

    $this->update([
      'total_amount' => $total,
      'tax_amount' => $tax,
      'total_with_tax' => $total + $tax,
    ]);

    return $this;
  }

  public function markAsChecked(int $userId, ?string $comment = null): self
  {
    $this->update([
      'checked_by' => $userId,
      'checked_at' => now(),
      'status' => self::STATUS_PENDING_ENDORSEMENT,
    ]);
    return $this;
  }

  public function markAsEndorsed(int $userId, ?string $comment = null): self
  {
    $this->update([
      'endorsed_by' => $userId,
      'endorsed_at' => now(),
      'status' => self::STATUS_PENDING_APPROVAL,
    ]);
    return $this;
  }

  public function markAsApproved(int $userId, ?string $comment = null): self
  {
    $this->update([
      'approved_by' => $userId,
      'approved_at' => now(),
      'status' => self::STATUS_ISSUED,
    ]);
    return $this;
  }

  public function markAsIssued(): self
  {
    $this->update([
      'status' => self::STATUS_ISSUED,
      'issued_at' => now(),
    ]);
    return $this;
  }

  public function markAsSent(): self
  {
    $this->update([
      'status' => self::STATUS_SENT,
      'sent_at' => now(),
    ]);
    return $this;
  }

  public function markAsAcknowledged(): self
  {
    $this->update([
      'status' => self::STATUS_ACKNOWLEDGED,
      'acknowledged_at' => now(),
    ]);
    return $this;
  }

  public function markAsDelivered(): self
  {
    $this->update([
      'status' => self::STATUS_DELIVERED,
      'actual_delivery_date' => now(),
    ]);
    return $this;
  }

  public function markAsPartial(): self
  {
    $this->update(['status' => self::STATUS_PARTIAL]);
    return $this;
  }

  public function markAsCompleted(): self
  {
    $this->update([
      'status' => self::STATUS_COMPLETED,
      'completed_at' => now(),
    ]);
    return $this;
  }

  public function markAsCancelled(string $reason): self
  {
    $this->update([
      'status' => self::STATUS_CANCELLED,
      'cancelled_at' => now(),
      'cancellation_reason' => $reason,
    ]);
    return $this;
  }

  public function markAsClosed(): self
  {
    $this->update([
      'status' => self::STATUS_CLOSED,
    ]);
    return $this;
  }

  public function checkDeliveryStatus(): void
  {
    $items = $this->items;
    $total = $items->count();

    if ($total === 0) {
      return;
    }

    $received = $items->where('fully_received', true)->count();

    if ($received === $total) {
      $this->markAsCompleted();
    } elseif ($received > 0) {
      $this->markAsPartial();
    }
  }

  public static function generatePoNumber(string $type): string
  {
    $prefix = strtoupper($type); // LPO or LSO
    $year = date('Y');
    $last = self::where('type', $type)
      ->whereYear('created_at', $year)
      ->count() + 1;
    return $prefix . '-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  /**
   * Get the workflow configuration for the current status
   */
  public function getWorkflowConfig(): array
  {
    return self::WORKFLOW[$this->status] ?? [
      'step' => 'unknown',
      'label' => 'Unknown',
      'requires_check' => false,
      'requires_endorse' => false,
      'requires_approve' => false,
      'can_edit' => false,
      'next' => null,
      'permission' => null,
      'color' => 'secondary',
    ];
  }

  /**
   * Check if the purchase order is in a workflow status
   */
  public function isInWorkflow(): bool
  {
    return in_array($this->status, [
      self::STATUS_PENDING_CHECK,
      self::STATUS_PENDING_ENDORSEMENT,
      self::STATUS_PENDING_APPROVAL,
    ]);
  }

  /**
   * Log activity for this purchase order
   */
  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->requisition_id,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'purchase_order',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }

  /**
   * Get the next status in the workflow
   */
  public function getNextStatus(): ?string
  {
    return self::WORKFLOW[$this->status]['next'] ?? null;
  }

  /**
   * Check if the purchase order has all required signatures
   */
  public function hasAllRequiredSignatures(): bool
  {
    return $this->getIsCheckedAttribute() &&
      $this->getIsEndorsedAttribute() &&
      $this->getIsApprovedAttribute();
  }

  /**
   * Get the user who performed each action
   */
  public function getSignatureDetails(): array
  {
    return [
      'checked' => [
        'by' => $this->checkedBy?->full_name,
        'at' => $this->checked_at?->toDateTimeString(),
        'done' => $this->getIsCheckedAttribute(),
      ],
      'endorsed' => [
        'by' => $this->endorsedBy?->full_name,
        'at' => $this->endorsed_at?->toDateTimeString(),
        'done' => $this->getIsEndorsedAttribute(),
      ],
      'approved' => [
        'by' => $this->approvedBy?->full_name,
        'at' => $this->approved_at?->toDateTimeString(),
        'done' => $this->getIsApprovedAttribute(),
      ],
    ];
  }
}
