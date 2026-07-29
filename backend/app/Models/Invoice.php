<?php
// app/Models/Invoice.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Invoice extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'purchase_order_id',
    'goods_received_note_id',
    'service_acknowledgment_note_id',
    'supplier_id',
    'invoice_number',
    'customer_invoice_no',
    'invoice_date',
    'due_date',
    'description',
    'subtotal',
    'tax_amount',
    'discount_amount',
    'total_amount',
    'currency',
    'exchange_rate',
    'total_amount_base_currency',
    'payment_reference',
    'bank_name',
    'bank_account',
    'status',
    'matching_status',
    'matching_notes',
    'matched_by',
    'matched_at',
    'verified_by',
    'verified_at',
    'approved_by',
    'approved_at',
    'is_credit_note',
    'credit_note_reference',
    'payment_terms',
    'notes',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'invoice_date' => 'date',
    'due_date' => 'date',
    'subtotal' => 'decimal:2',
    'tax_amount' => 'decimal:2',
    'discount_amount' => 'decimal:2',
    'total_amount' => 'decimal:2',
    'exchange_rate' => 'decimal:4',
    'total_amount_base_currency' => 'decimal:2',
    'is_credit_note' => 'boolean',
    'matched_at' => 'datetime',
    'verified_at' => 'datetime',
    'approved_at' => 'datetime',
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
    'matching_status_label',
    'matching_status_color',
    'formatted_total_amount',
    'is_overdue',
    'days_overdue',
    'supplier_name',
    'is_fully_matched',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class, 'requisition_id');
  }

  public function purchaseOrder(): BelongsTo
  {
    return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
  }

  public function goodsReceivedNote(): BelongsTo
  {
    return $this->belongsTo(GoodsReceivedNote::class, 'goods_received_note_id');
  }

  public function serviceAcknowledgmentNote(): BelongsTo
  {
    return $this->belongsTo(ServiceAcknowledgmentNote::class, 'service_acknowledgment_note_id');
  }

  public function supplier(): BelongsTo
  {
    return $this->belongsTo(User::class, 'supplier_id');
  }

  public function matchedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'matched_by');
  }

  public function verifiedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'verified_by');
  }

  public function approvedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'approved_by');
  }

  public function items(): HasMany
  {
    return $this->hasMany(InvoiceItem::class, 'invoice_id');
  }

  public function paymentVouchers(): HasMany
  {
    return $this->hasMany(PaymentVoucher::class, 'invoice_id');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending',
      'verified' => 'Verified',
      'approved' => 'Approved',
      'paid' => 'Paid',
      'disputed' => 'Disputed',
      'cancelled' => 'Cancelled',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'pending' => 'warning',
      'verified' => 'info',
      'approved' => 'primary',
      'paid' => 'success',
      'disputed' => 'danger',
      'cancelled' => 'danger',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getMatchingStatusLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending Matching',
      'matched' => 'Matched',
      'partial' => 'Partial Match',
      'mismatch' => 'Mismatch',
      'not_applicable' => 'Not Applicable',
    ];

    return $labels[$this->matching_status] ?? ucfirst($this->matching_status ?? 'Pending');
  }

  public function getMatchingStatusColorAttribute(): string
  {
    $colors = [
      'pending' => 'warning',
      'matched' => 'success',
      'partial' => 'info',
      'mismatch' => 'danger',
      'not_applicable' => 'secondary',
    ];

    return $colors[$this->matching_status] ?? 'secondary';
  }

  public function getFormattedTotalAmountAttribute(): string
  {
    return number_format((float) ($this->total_amount ?? 0), 2);
  }

  public function getIsOverdueAttribute(): bool
  {
    if ($this->status === 'paid' || $this->status === 'cancelled') {
      return false;
    }
    return $this->due_date && $this->due_date->isPast();
  }

  public function getDaysOverdueAttribute(): int
  {
    if (!$this->isOverdue) {
      return 0;
    }
    return (int) $this->due_date->diffInDays(now());
  }

  public function getSupplierNameAttribute(): string
  {
    return $this->supplier ? $this->supplier->full_name : 'Unknown Supplier';
  }

  public function getIsFullyMatchedAttribute(): bool
  {
    return $this->matching_status === 'matched';
  }

  /**
   * Set invoice_number to uppercase.
   */
  public function setInvoiceNumberAttribute(string $value): void
  {
    $this->attributes['invoice_number'] = strtoupper(trim($value));
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  public function scopeVerified($query)
  {
    return $query->where('status', 'verified');
  }

  public function scopeApproved($query)
  {
    return $query->where('status', 'approved');
  }

  public function scopePaid($query)
  {
    return $query->where('status', 'paid');
  }

  public function scopeMatched($query)
  {
    return $query->where('matching_status', 'matched');
  }

  public function scopeMismatched($query)
  {
    return $query->where('matching_status', 'mismatch');
  }

  public function scopeOverdue($query)
  {
    return $query->whereDate('due_date', '<', now())
      ->whereNotIn('status', ['paid', 'cancelled']);
  }

  public function scopeBySupplier($query, int $supplierId)
  {
    return $query->where('supplier_id', $supplierId);
  }

  public function scopeByPurchaseOrder($query, int $purchaseOrderId)
  {
    return $query->where('purchase_order_id', $purchaseOrderId);
  }

  public function scopeByRequisition($query, int $requisitionId)
  {
    return $query->where('requisition_id', $requisitionId);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isPending(): bool
  {
    return $this->status === 'pending';
  }

  public function isVerified(): bool
  {
    return $this->status === 'verified';
  }

  public function isApproved(): bool
  {
    return $this->status === 'approved';
  }

  public function isPaid(): bool
  {
    return $this->status === 'paid';
  }

  public function isOverdue(): bool
  {
    return $this->isOverdueAttribute();
  }

  public function isMatched(): bool
  {
    return $this->matching_status === 'matched';
  }

  public function isMismatched(): bool
  {
    return $this->matching_status === 'mismatch';
  }

  public function isCreditNote(): bool
  {
    return (bool) $this->is_credit_note;
  }

  public function updateTotals(): self
  {
    $items = $this->items;
    $subtotal = $items->sum('total_price');
    $tax = $items->sum('tax_amount');
    $discount = $items->sum('discount_amount');
    $total = $subtotal - $discount + $tax;

    $this->update([
      'subtotal' => $subtotal,
      'tax_amount' => $tax,
      'discount_amount' => $discount,
      'total_amount' => $total,
    ]);

    return $this;
  }

  public function markAsVerified(int $userId, ?string $notes = null): self
  {
    $this->update([
      'status' => 'verified',
      'verified_by' => $userId,
      'verified_at' => now(),
      'notes' => $notes,
    ]);
    return $this;
  }

  public function markAsApproved(int $userId, ?string $notes = null): self
  {
    $this->update([
      'status' => 'approved',
      'approved_by' => $userId,
      'approved_at' => now(),
      'notes' => $notes,
    ]);
    return $this;
  }

  public function markAsPaid(): self
  {
    $this->update(['status' => 'paid']);
    return $this;
  }

  public function markAsDisputed(string $reason): self
  {
    $this->update([
      'status' => 'disputed',
      'notes' => $reason,
    ]);
    return $this;
  }

  public function markAsCancelled(string $reason): self
  {
    $this->update([
      'status' => 'cancelled',
      'notes' => $reason,
    ]);
    return $this;
  }

  public function performThreeWayMatching(): self
  {
    $po = $this->purchaseOrder;
    $grn = $this->goodsReceivedNote;

    if (!$po) {
      $this->matching_status = 'not_applicable';
      $this->matching_notes = 'No purchase order found for matching';
      $this->save();
      return $this;
    }

    // Check if GRN exists (for goods)
    if ($po->type === 'lpo' && !$grn) {
      $this->matching_status = 'pending';
      $this->matching_notes = 'GRN not yet received for matching';
      $this->save();
      return $this;
    }

    // Compare amounts
    $poTotal = (float) $po->total_with_tax;
    $grnTotal = $grn ? (float) $grn->net_total : 0;
    $invoiceTotal = (float) $this->total_amount;

    $tolerance = 0.01; // 0.01 tolerance for floating point

    if (
      abs($invoiceTotal - $poTotal) <= $tolerance &&
      ($po->type === 'lso' || abs($invoiceTotal - $grnTotal) <= $tolerance)
    ) {
      $this->matching_status = 'matched';
      $this->matching_notes = 'Invoice matches PO and GRN/SAN';
    } elseif ($invoiceTotal > $poTotal || ($grn && $invoiceTotal > $grnTotal)) {
      $this->matching_status = 'mismatch';
      $this->matching_notes = 'Invoice amount exceeds PO or GRN amount';
    } else {
      $this->matching_status = 'partial';
      $this->matching_notes = 'Partial match - amounts differ within tolerance';
    }

    $this->matched_by = auth()->id();
    $this->matched_at = now();
    $this->save();

    return $this;
  }

  public static function generateInvoiceNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;
    return 'INV-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->requisition_id,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'invoice',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
