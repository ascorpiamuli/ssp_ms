<?php
// app/Models/ServiceAcknowledgmentNote.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceAcknowledgmentNote extends Model
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
    'san_number',
    'reference_number',
    'acknowledgment_date',
    'acknowledgment_time',
    'acknowledged_by',
    'service_start_date',
    'service_end_date',
    'service_provider',
    'service_description',
    'service_deliverables',
    'total_value',
    'total_tax',
    'total_discount',
    'net_total',
    'quality_notes',
    'performance_notes',
    'quality_rating',
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
    'acknowledgment_date' => 'date',
    'acknowledgment_time' => 'datetime',
    'service_start_date' => 'date',
    'service_end_date' => 'date',
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
    'formatted_total_value',
    'quality_rating_label',
    'quality_rating_color',
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

  public function acknowledgedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'acknowledged_by');
  }

  public function hodApprovedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'hod_approved_by');
  }

  public function principalApprovedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'principal_approved_by');
  }

  public function invoices(): HasMany
  {
    return $this->hasMany(Invoice::class, 'service_acknowledgment_note_id');
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

  public function getFormattedTotalValueAttribute(): string
  {
    return number_format((float) ($this->total_value ?? 0), 2);
  }

  public function getQualityRatingLabelAttribute(): string
  {
    $labels = [
      'excellent' => 'Excellent',
      'good' => 'Good',
      'average' => 'Average',
      'poor' => 'Poor',
    ];

    return $labels[$this->quality_rating] ?? ucfirst($this->quality_rating ?? 'Not Rated');
  }

  public function getQualityRatingColorAttribute(): string
  {
    $colors = [
      'excellent' => 'success',
      'good' => 'info',
      'average' => 'warning',
      'poor' => 'danger',
    ];

    return $colors[$this->quality_rating] ?? 'secondary';
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
   * Set san_number to uppercase.
   */
  public function setSanNumberAttribute(string $value): void
  {
    $this->attributes['san_number'] = strtoupper(trim($value));
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

  public function scopePendingApproval($query)
  {
    return $query->where('status', 'submitted');
  }

  public function scopeQualityExcellent($query)
  {
    return $query->where('quality_rating', 'excellent');
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

  public function rateQuality(string $rating, ?string $notes = null): self
  {
    $this->update([
      'quality_rating' => $rating,
      'quality_notes' => $notes,
    ]);
    return $this;
  }

  public static function generateSanNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;
    return 'SAN-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->requisition_id,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'service_acknowledgment_note',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
