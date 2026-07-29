<?php
// app/Models/Tender.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tender extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'tender_number',
    'title',
    'description',
    'issue_date',
    'closing_date',
    'closing_time',
    'tender_document_path',
    'evaluation_criteria',
    'estimated_value',
    'status',
    'published_by',
    'published_at',
    'awarded_to',
    'awarded_at',
    'awarded_amount',
    'award_notes',
    'cancelled_by',
    'cancelled_at',
    'cancellation_reason',
    'bidders',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'issue_date' => 'date',
    'closing_date' => 'date',
    'closing_time' => 'datetime',
    'estimated_value' => 'decimal:2',
    'awarded_amount' => 'decimal:2',
    'published_at' => 'datetime',
    'awarded_at' => 'datetime',
    'cancelled_at' => 'datetime',
    'bidders' => 'json',
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
    'formatted_estimated_value',
    'formatted_awarded_amount',
    'is_open',
    'is_closed',
    'is_awarded',
    'is_cancelled',
    'days_until_closing',
    'bidder_count',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class, 'requisition_id');
  }

  public function publishedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'published_by');
  }

  public function awardedTo(): BelongsTo
  {
    return $this->belongsTo(User::class, 'awarded_to');
  }

  public function cancelledBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'cancelled_by');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'draft' => 'Draft',
      'published' => 'Published',
      'evaluating' => 'Evaluating',
      'awarded' => 'Awarded',
      'cancelled' => 'Cancelled',
      'expired' => 'Expired',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'draft' => 'gray',
      'published' => 'info',
      'evaluating' => 'warning',
      'awarded' => 'success',
      'cancelled' => 'danger',
      'expired' => 'danger',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getFormattedEstimatedValueAttribute(): string
  {
    return number_format((float) ($this->estimated_value ?? 0), 2);
  }

  public function getFormattedAwardedAmountAttribute(): string
  {
    return number_format((float) ($this->awarded_amount ?? 0), 2);
  }

  public function getIsOpenAttribute(): bool
  {
    return $this->status === 'published' && !$this->isExpired();
  }

  public function getIsClosedAttribute(): bool
  {
    return $this->status === 'evaluating' || $this->status === 'awarded' || $this->isExpired();
  }

  public function getIsAwardedAttribute(): bool
  {
    return $this->status === 'awarded';
  }

  public function getIsCancelledAttribute(): bool
  {
    return $this->status === 'cancelled';
  }

  public function getDaysUntilClosingAttribute(): int
  {
    if (!$this->closing_date) {
      return 0;
    }
    return max(0, (int) now()->diffInDays($this->closing_date, false));
  }

  public function getBidderCountAttribute(): int
  {
    return is_array($this->bidders) ? count($this->bidders) : 0;
  }

  public function isExpired(): bool
  {
    return $this->closing_date && $this->closing_date->isPast() && $this->status !== 'awarded' && $this->status !== 'cancelled';
  }

  /**
   * Set tender_number to uppercase.
   */
  public function setTenderNumberAttribute(string $value): void
  {
    $this->attributes['tender_number'] = strtoupper(trim($value));
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

  public function scopePublished($query)
  {
    return $query->where('status', 'published');
  }

  public function scopeAwarded($query)
  {
    return $query->where('status', 'awarded');
  }

  public function scopeCancelled($query)
  {
    return $query->where('status', 'cancelled');
  }

  public function scopeOpen($query)
  {
    return $query->where('status', 'published')
      ->whereDate('closing_date', '>=', now());
  }

  public function scopeClosingSoon($query, int $days = 7)
  {
    return $query->where('status', 'published')
      ->whereDate('closing_date', '<=', now()->addDays($days))
      ->whereDate('closing_date', '>=', now());
  }

  public function scopeByRequisition($query, int $requisitionId)
  {
    return $query->where('requisition_id', $requisitionId);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isDraft(): bool
  {
    return $this->status === 'draft';
  }

  public function isPublished(): bool
  {
    return $this->status === 'published';
  }

  public function isEvaluating(): bool
  {
    return $this->status === 'evaluating';
  }

  public function isAwarded(): bool
  {
    return $this->status === 'awarded';
  }

  public function isCancelled(): bool
  {
    return $this->status === 'cancelled';
  }

  public function isOpen(): bool
  {
    return $this->isOpenAttribute();
  }

  public function isExpired(): bool
  {
    return $this->isExpired();
  }

  public function publish(int $userId): self
  {
    $this->update([
      'status' => 'published',
      'published_by' => $userId,
      'published_at' => now(),
    ]);
    return $this;
  }

  public function award(int $supplierId, float $amount, ?string $notes = null): self
  {
    $this->update([
      'status' => 'awarded',
      'awarded_to' => $supplierId,
      'awarded_at' => now(),
      'awarded_amount' => $amount,
      'award_notes' => $notes,
    ]);
    return $this;
  }

  public function cancel(string $reason, int $userId): self
  {
    $this->update([
      'status' => 'cancelled',
      'cancelled_at' => now(),
      'cancellation_reason' => $reason,
      'cancelled_by' => $userId,
    ]);
    return $this;
  }

  public function startEvaluation(): self
  {
    $this->update(['status' => 'evaluating']);
    return $this;
  }

  public function addBidder(int $supplierId): self
  {
    $bidders = $this->bidders ?? [];
    if (!in_array($supplierId, $bidders)) {
      $bidders[] = $supplierId;
      $this->bidders = $bidders;
      $this->save();
    }
    return $this;
  }

  public function removeBidder(int $supplierId): self
  {
    $bidders = $this->bidders ?? [];
    $bidders = array_filter($bidders, function ($id) use ($supplierId) {
      return $id !== $supplierId;
    });
    $this->bidders = array_values($bidders);
    $this->save();
    return $this;
  }

  public function getBidders(): array
  {
    return $this->bidders ?? [];
  }

  public static function generateTenderNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;
    return 'TND-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->requisition_id,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'tender',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
