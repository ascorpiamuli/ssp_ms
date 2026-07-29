<?php
// app/Models/PurchaseOrder.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
  use HasFactory, SoftDeletes;

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
    'type_label',
    'type_color',
    'formatted_total_amount',
    'is_lpo',
    'is_lso',
    'supplier_name',
    'is_overdue',
    'is_fully_delivered',
    'delivery_progress',
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

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'draft' => 'Draft',
      'issued' => 'Issued',
      'sent' => 'Sent to Supplier',
      'acknowledged' => 'Acknowledged',
      'delivered' => 'Delivered',
      'partial' => 'Partially Delivered',
      'completed' => 'Completed',
      'cancelled' => 'Cancelled',
      'closed' => 'Closed',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'draft' => 'gray',
      'issued' => 'info',
      'sent' => 'primary',
      'acknowledged' => 'info',
      'delivered' => 'success',
      'partial' => 'warning',
      'completed' => 'success',
      'cancelled' => 'danger',
      'closed' => 'secondary',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

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
    if ($this->status === 'completed' || $this->status === 'cancelled') {
      return false;
    }
    return $this->expected_delivery_date && $this->expected_delivery_date->isPast();
  }

  public function getIsFullyDeliveredAttribute(): bool
  {
    return $this->status === 'completed';
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
    return $query->where('status', 'draft');
  }

  public function scopeIssued($query)
  {
    return $query->where('status', 'issued');
  }

  public function scopeCompleted($query)
  {
    return $query->where('status', 'completed');
  }

  public function scopeOverdue($query)
  {
    return $query->whereDate('expected_delivery_date', '<', now())
      ->whereNotIn('status', ['completed', 'cancelled', 'closed']);
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
    return $this->status === 'draft';
  }

  public function isIssued(): bool
  {
    return $this->status === 'issued';
  }

  public function isSent(): bool
  {
    return $this->status === 'sent';
  }

  public function isCompleted(): bool
  {
    return $this->status === 'completed';
  }

  public function isCancelled(): bool
  {
    return $this->status === 'cancelled';
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
    return in_array($this->status, ['draft', 'issued']);
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

  public function markAsIssued(): self
  {
    $this->update([
      'status' => 'issued',
      'issued_at' => now(),
    ]);
    return $this;
  }

  public function markAsSent(): self
  {
    $this->update([
      'status' => 'sent',
      'sent_at' => now(),
    ]);
    return $this;
  }

  public function markAsAcknowledged(): self
  {
    $this->update([
      'status' => 'acknowledged',
      'acknowledged_at' => now(),
    ]);
    return $this;
  }

  public function markAsPartial(): self
  {
    $this->update(['status' => 'partial']);
    return $this;
  }

  public function markAsCompleted(): self
  {
    $this->update([
      'status' => 'completed',
      'completed_at' => now(),
    ]);
    return $this;
  }

  public function markAsCancelled(string $reason): self
  {
    $this->update([
      'status' => 'cancelled',
      'cancelled_at' => now(),
      'cancellation_reason' => $reason,
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
}
