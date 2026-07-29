<?php
// app/Models/GoodsReceivedNote.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoodsReceivedNote extends Model
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
    'grn_number',
    'reference_number',
    'received_date',
    'received_time',
    'received_by',
    'inspected_by',
    'inspected_at',
    'inspection_notes',
    'inspection_result',
    'total_quantity',
    'total_value',
    'total_tax',
    'total_discount',
    'net_total',
    'delivery_note_number',
    'carrier',
    'waybill_number',
    'vehicle_number',
    'delivery_condition',
    'status',
    'approval_level',
    'hod_approved_by',
    'hod_approved_at',
    'principal_approved_by',
    'principal_approved_at',
    'returned_at',
    'return_reason',
    'additional_notes',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'received_date' => 'date',
    'received_time' => 'datetime',
    'inspected_at' => 'datetime',
    'inspection_result' => 'string',
    'total_quantity' => 'decimal:2',
    'total_value' => 'decimal:2',
    'total_tax' => 'decimal:2',
    'total_discount' => 'decimal:2',
    'net_total' => 'decimal:2',
    'hod_approved_at' => 'datetime',
    'principal_approved_at' => 'datetime',
    'returned_at' => 'datetime',
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
    'inspection_result_label',
    'inspection_result_color',
    'formatted_total_value',
    'is_approved',
    'is_pending_approval',
    'approval_level_label',
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

  public function receivedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'received_by');
  }

  public function inspectedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'inspected_by');
  }

  public function hodApprovedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'hod_approved_by');
  }

  public function principalApprovedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'principal_approved_by');
  }

  public function items(): HasMany
  {
    return $this->hasMany(GoodsReceivedItem::class, 'goods_received_note_id');
  }

  public function invoices(): HasMany
  {
    return $this->hasMany(Invoice::class, 'goods_received_note_id');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'draft' => 'Draft',
      'submitted' => 'Submitted',
      'hod_approved' => 'HOD Approved',
      'principal_approved' => 'Principal Approved',
      'completed' => 'Completed',
      'rejected' => 'Rejected',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'draft' => 'gray',
      'submitted' => 'info',
      'hod_approved' => 'primary',
      'principal_approved' => 'success',
      'completed' => 'success',
      'rejected' => 'danger',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getInspectionResultLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending Inspection',
      'passed' => 'Passed',
      'failed' => 'Failed',
      'partial' => 'Partial',
    ];

    return $labels[$this->inspection_result] ?? ucfirst($this->inspection_result ?? 'Pending');
  }

  public function getInspectionResultColorAttribute(): string
  {
    $colors = [
      'pending' => 'warning',
      'passed' => 'success',
      'failed' => 'danger',
      'partial' => 'info',
    ];

    return $colors[$this->inspection_result] ?? 'secondary';
  }

  public function getFormattedTotalValueAttribute(): string
  {
    return number_format((float) ($this->total_value ?? 0), 2);
  }

  public function getIsApprovedAttribute(): bool
  {
    return in_array($this->status, ['hod_approved', 'principal_approved', 'completed']);
  }

  public function getIsPendingApprovalAttribute(): bool
  {
    return $this->status === 'submitted';
  }

  public function getApprovalLevelLabelAttribute(): string
  {
    return $this->approval_level === 'hod' ? 'HOD' : 'Principal';
  }

  /**
   * Set grn_number to uppercase.
   */
  public function setGrnNumberAttribute(string $value): void
  {
    $this->attributes['grn_number'] = strtoupper(trim($value));
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopeDraft($query)
  {
    return $query->where('status', 'draft');
  }

  public function scopeSubmitted($query)
  {
    return $query->where('status', 'submitted');
  }

  public function scopeApproved($query)
  {
    return $query->whereIn('status', ['hod_approved', 'principal_approved', 'completed']);
  }

  public function scopeByPurchaseOrder($query, int $purchaseOrderId)
  {
    return $query->where('purchase_order_id', $purchaseOrderId);
  }

  public function scopeByRequisition($query, int $requisitionId)
  {
    return $query->where('requisition_id', $requisitionId);
  }

  public function scopeByStatus($query, string $status)
  {
    return $query->where('status', $status);
  }

  public function scopePendingApproval($query)
  {
    return $query->where('status', 'submitted');
  }

  public function scopeInspectionPassed($query)
  {
    return $query->where('inspection_result', 'passed');
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isDraft(): bool
  {
    return $this->status === 'draft';
  }

  public function isSubmitted(): bool
  {
    return $this->status === 'submitted';
  }

  public function isApproved(): bool
  {
    return $this->isApprovedAttribute();
  }

  public function isRejected(): bool
  {
    return $this->status === 'rejected';
  }

  public function isCompleted(): bool
  {
    return $this->status === 'completed';
  }

  public function isHodApproval(): bool
  {
    return $this->approval_level === 'hod';
  }

  public function isPrincipalApproval(): bool
  {
    return $this->approval_level === 'principal';
  }

  public function inspectionPassed(): bool
  {
    return $this->inspection_result === 'passed';
  }

  public function inspectionFailed(): bool
  {
    return $this->inspection_result === 'failed';
  }

  public function updateTotals(): self
  {
    $items = $this->items;
    $totalValue = $items->sum('total_value');
    $totalTax = $items->sum('tax_amount');
    $totalDiscount = $items->sum('discount_amount');
    $netTotal = $totalValue - $totalDiscount + $totalTax;

    $this->update([
      'total_quantity' => $items->sum('received_quantity'),
      'total_value' => $totalValue,
      'total_tax' => $totalTax,
      'total_discount' => $totalDiscount,
      'net_total' => $netTotal,
    ]);

    return $this;
  }

  public function markAsSubmitted(): self
  {
    $this->update(['status' => 'submitted']);
    return $this;
  }

  public function markAsHodApproved(int $userId, ?string $comment = null): self
  {
    $this->update([
      'status' => 'hod_approved',
      'hod_approved_by' => $userId,
      'hod_approved_at' => now(),
    ]);

    if ($this->approval_level === 'hod') {
      $this->markAsCompleted();
    }

    return $this;
  }

  public function markAsPrincipalApproved(int $userId, ?string $comment = null): self
  {
    $this->update([
      'status' => 'principal_approved',
      'principal_approved_by' => $userId,
      'principal_approved_at' => now(),
    ]);

    if ($this->approval_level === 'principal') {
      $this->markAsCompleted();
    }

    return $this;
  }

  public function markAsCompleted(): self
  {
    $this->update(['status' => 'completed']);
    return $this;
  }

  public function markAsRejected(string $reason): self
  {
    $this->update([
      'status' => 'rejected',
      'return_reason' => $reason,
      'returned_at' => now(),
    ]);
    return $this;
  }

  public function markAsReturned(string $reason): self
  {
    $this->update([
      'status' => 'draft',
      'return_reason' => $reason,
      'returned_at' => now(),
    ]);
    return $this;
  }

  public function updateInspection(string $result, ?string $notes = null): self
  {
    $this->update([
      'inspection_result' => $result,
      'inspection_notes' => $notes,
      'inspected_at' => now(),
    ]);
    return $this;
  }

  public static function generateGrnNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;
    return 'GRN-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->requisition_id,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'goods_received_note',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
