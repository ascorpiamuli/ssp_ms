<?php
// app/Models/Contract.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
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
    'supplier_id',
    'contract_number',
    'title',
    'description',
    'start_date',
    'end_date',
    'contract_value',
    'terms_and_conditions',
    'deliverables',
    'scope_of_work',
    'payment_schedule',
    'penalty_clauses',
    'termination_clauses',
    'status',
    'created_by',
    'approved_by',
    'approved_at',
    'completed_at',
    'terminated_at',
    'termination_reason',
    'is_renewable',
    'renewal_period_months',
    'renewal_count',
    'last_renewal_date',
    'next_renewal_date',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'start_date' => 'date',
    'end_date' => 'date',
    'contract_value' => 'decimal:2',
    'approved_at' => 'datetime',
    'completed_at' => 'datetime',
    'terminated_at' => 'datetime',
    'last_renewal_date' => 'date',
    'next_renewal_date' => 'date',
    'is_renewable' => 'boolean',
    'renewal_period_months' => 'integer',
    'renewal_count' => 'integer',
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
    'formatted_contract_value',
    'is_active',
    'is_expired',
    'is_completed',
    'is_terminated',
    'days_remaining',
    'supplier_name',
    'formatted_start_date',
    'formatted_end_date',
    'is_renewable_label',
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

  public function supplier(): BelongsTo
  {
    return $this->belongsTo(User::class, 'supplier_id');
  }

  public function createdBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  public function approvedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'approved_by');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'draft' => 'Draft',
      'active' => 'Active',
      'completed' => 'Completed',
      'expired' => 'Expired',
      'terminated' => 'Terminated',
      'suspended' => 'Suspended',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'draft' => 'gray',
      'active' => 'success',
      'completed' => 'info',
      'expired' => 'danger',
      'terminated' => 'danger',
      'suspended' => 'warning',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getFormattedContractValueAttribute(): string
  {
    return number_format((float) ($this->contract_value ?? 0), 2);
  }

  public function getIsActiveAttribute(): bool
  {
    return $this->status === 'active';
  }

  public function getIsExpiredAttribute(): bool
  {
    return $this->status === 'expired' || ($this->end_date && $this->end_date->isPast() && $this->status !== 'completed');
  }

  public function getIsCompletedAttribute(): bool
  {
    return $this->status === 'completed';
  }

  public function getIsTerminatedAttribute(): bool
  {
    return $this->status === 'terminated';
  }

  public function getDaysRemainingAttribute(): int
  {
    if (!$this->end_date || $this->status === 'completed' || $this->status === 'terminated') {
      return 0;
    }
    return max(0, (int) now()->diffInDays($this->end_date, false));
  }

  public function getSupplierNameAttribute(): string
  {
    return $this->supplier ? $this->supplier->full_name : 'Unknown Supplier';
  }

  public function getFormattedStartDateAttribute(): string
  {
    return $this->start_date ? $this->start_date->format('Y-m-d') : '';
  }

  public function getFormattedEndDateAttribute(): string
  {
    return $this->end_date ? $this->end_date->format('Y-m-d') : '';
  }

  public function getIsRenewableLabelAttribute(): string
  {
    return $this->is_renewable ? 'Yes' : 'No';
  }

  /**
   * Set contract_number to uppercase.
   */
  public function setContractNumberAttribute(string $value): void
  {
    $this->attributes['contract_number'] = strtoupper(trim($value));
  }

  /**
   * Set title to proper case.
   */
  public function setTitleAttribute(string $value): void
  {
    $this->attributes['title'] = ucwords(strtolower(trim($value)));
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopeDraft($query)
  {
    return $query->where('status', 'draft');
  }

  public function scopeActive($query)
  {
    return $query->where('status', 'active');
  }

  public function scopeCompleted($query)
  {
    return $query->where('status', 'completed');
  }

  public function scopeExpired($query)
  {
    return $query->where('status', 'expired')
      ->orWhereDate('end_date', '<', now());
  }

  public function scopeBySupplier($query, int $supplierId)
  {
    return $query->where('supplier_id', $supplierId);
  }

  public function scopeByRequisition($query, int $requisitionId)
  {
    return $query->where('requisition_id', $requisitionId);
  }

  public function scopeRenewable($query)
  {
    return $query->where('is_renewable', true);
  }

  public function scopeExpiringSoon($query, int $days = 30)
  {
    return $query->whereDate('end_date', '<=', now()->addDays($days))
      ->whereDate('end_date', '>=', now())
      ->where('status', 'active');
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isDraft(): bool
  {
    return $this->status === 'draft';
  }

  public function isActive(): bool
  {
    return $this->status === 'active';
  }

  public function isCompleted(): bool
  {
    return $this->status === 'completed';
  }

  public function isExpired(): bool
  {
    return $this->isExpiredAttribute();
  }

  public function isTerminated(): bool
  {
    return $this->status === 'terminated';
  }

  public function isSuspended(): bool
  {
    return $this->status === 'suspended';
  }

  public function isRenewable(): bool
  {
    return (bool) $this->is_renewable;
  }

  public function canBeRenewed(): bool
  {
    return $this->isRenewable() &&
      ($this->status === 'active' || $this->status === 'expired') &&
      ($this->next_renewal_date && $this->next_renewal_date <= now()->addDays(30));
  }

  public function markAsActive(): self
  {
    $this->update(['status' => 'active']);
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

  public function markAsExpired(): self
  {
    $this->update(['status' => 'expired']);
    return $this;
  }

  public function markAsTerminated(string $reason): self
  {
    $this->update([
      'status' => 'terminated',
      'terminated_at' => now(),
      'termination_reason' => $reason,
    ]);
    return $this;
  }

  public function markAsSuspended(string $reason): self
  {
    $this->update([
      'status' => 'suspended',
      'termination_reason' => $reason,
    ]);
    return $this;
  }

  public function renew(): self
  {
    if (!$this->isRenewable()) {
      throw new \Exception('This contract is not renewable.');
    }

    $newStartDate = $this->end_date->copy()->addDay();
    $newEndDate = $newStartDate->copy()->addMonths($this->renewal_period_months ?? 12);

    $this->update([
      'start_date' => $newStartDate,
      'end_date' => $newEndDate,
      'renewal_count' => $this->renewal_count + 1,
      'last_renewal_date' => now(),
      'next_renewal_date' => $newEndDate->copy()->subMonths(1),
      'status' => 'active',
    ]);

    return $this;
  }

  public function approve(int $userId): self
  {
    $this->update([
      'approved_by' => $userId,
      'approved_at' => now(),
      'status' => 'active',
    ]);
    return $this;
  }

  public static function generateContractNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;
    return 'CTR-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->requisition_id,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'contract',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
