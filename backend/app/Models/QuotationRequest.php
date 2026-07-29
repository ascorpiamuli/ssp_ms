<?php
// app/Models/QuotationRequest.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuotationRequest extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'qtn_number',
    'title',
    'description',
    'issue_date',
    'closing_date',
    'closing_time',
    'delivery_terms',
    'payment_terms',
    'special_conditions',
    'instructions',
    'status',
    'sent_to_suppliers',
    'responded_suppliers',
    'declined_suppliers',
    'is_automated',
    'is_tender',
    'tender_number',
    'generated_by',
    'approved_by',
    'approved_at',
    'sent_at',
    'closed_at',
    'cancelled_at',
    'cancellation_reason',
    'reminder_days',
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
    'sent_to_suppliers' => 'json',
    'responded_suppliers' => 'json',
    'declined_suppliers' => 'json',
    'is_automated' => 'boolean',
    'is_tender' => 'boolean',
    'approved_at' => 'datetime',
    'sent_at' => 'datetime',
    'closed_at' => 'datetime',
    'cancelled_at' => 'datetime',
    'reminder_days' => 'integer',
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
    'formatted_issue_date',
    'formatted_closing_date',
    'is_expired',
    'is_closing_soon',
    'response_count',
    'response_rate',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class, 'requisition_id');
  }

  public function generatedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'generated_by');
  }

  public function approvedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'approved_by');
  }

  public function supplierQuotations(): HasMany
  {
    return $this->hasMany(SupplierQuotation::class, 'quotation_request_id');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'draft' => 'Draft',
      'sent' => 'Sent',
      'responded' => 'Responded',
      'evaluating' => 'Evaluating',
      'closed' => 'Closed',
      'cancelled' => 'Cancelled',
      'expired' => 'Expired',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'draft' => 'gray',
      'sent' => 'blue',
      'responded' => 'info',
      'evaluating' => 'warning',
      'closed' => 'success',
      'cancelled' => 'danger',
      'expired' => 'danger',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getFormattedIssueDateAttribute(): string
  {
    return $this->issue_date ? $this->issue_date->format('Y-m-d') : '';
  }

  public function getFormattedClosingDateAttribute(): string
  {
    return $this->closing_date ? $this->closing_date->format('Y-m-d') : '';
  }

  public function getIsExpiredAttribute(): bool
  {
    return $this->closing_date && $this->closing_date->isPast() && $this->status !== 'closed';
  }

  public function getIsClosingSoonAttribute(): bool
  {
    if (!$this->closing_date) {
      return false;
    }
    return $this->closing_date->diffInDays(now()) <= 2 && !$this->isExpired();
  }

  public function getResponseCountAttribute(): int
  {
    return $this->supplierQuotations()->where('status', 'submitted')->count();
  }

  public function getResponseRateAttribute(): float
  {
    $total = count($this->sent_to_suppliers ?? []);
    if ($total === 0) {
      return 0;
    }
    return round(($this->response_count / $total) * 100, 2);
  }

  /**
   * Set the qtn_number to uppercase.
   */
  public function setQtnNumberAttribute(string $value): void
  {
    $this->attributes['qtn_number'] = strtoupper(trim($value));
  }

  /**
   * Set the title to proper case.
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

  public function scopeSent($query)
  {
    return $query->where('status', 'sent');
  }

  public function scopeResponded($query)
  {
    return $query->where('status', 'responded');
  }

  public function scopeClosed($query)
  {
    return $query->where('status', 'closed');
  }

  public function scopeActive($query)
  {
    return $query->whereIn('status', ['sent', 'responded', 'evaluating']);
  }

  public function scopeTender($query)
  {
    return $query->where('is_tender', true);
  }

  public function scopeNotTender($query)
  {
    return $query->where('is_tender', false);
  }

  public function scopeExpired($query)
  {
    return $query->whereDate('closing_date', '<', now())
      ->whereNotIn('status', ['closed', 'cancelled']);
  }

  public function scopeClosingSoon($query, int $days = 2)
  {
    return $query->whereDate('closing_date', '<=', now()->addDays($days))
      ->whereDate('closing_date', '>=', now())
      ->whereNotIn('status', ['closed', 'cancelled']);
  }

  public function scopeByRequisition($query, int $requisitionId)
  {
    return $query->where('requisition_id', $requisitionId);
  }

  public function scopeByStatus($query, string $status)
  {
    return $query->where('status', $status);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isDraft(): bool
  {
    return $this->status === 'draft';
  }

  public function isSent(): bool
  {
    return $this->status === 'sent';
  }

  public function isResponded(): bool
  {
    return $this->status === 'responded';
  }

  public function isClosed(): bool
  {
    return $this->status === 'closed';
  }

  public function isCancelled(): bool
  {
    return $this->status === 'cancelled';
  }

  public function isExpired(): bool
  {
    return $this->isExpiredAttribute();
  }

  public function isTender(): bool
  {
    return (bool) $this->is_tender;
  }

  public function canRespond(): bool
  {
    return in_array($this->status, ['sent', 'responded']) && !$this->isExpired();
  }

  public function getSentSuppliers(): array
  {
    return is_array($this->sent_to_suppliers) ? $this->sent_to_suppliers : [];
  }

  public function getRespondedSuppliers(): array
  {
    return is_array($this->responded_suppliers) ? $this->responded_suppliers : [];
  }

  public function getDeclinedSuppliers(): array
  {
    return is_array($this->declined_suppliers) ? $this->declined_suppliers : [];
  }

  public function addSentSupplier(int $supplierId): self
  {
    $sent = $this->getSentSuppliers();
    if (!in_array($supplierId, $sent)) {
      $sent[] = $supplierId;
      $this->sent_to_suppliers = $sent;
      $this->save();
    }
    return $this;
  }

  public function addRespondedSupplier(int $supplierId): self
  {
    $responded = $this->getRespondedSuppliers();
    if (!in_array($supplierId, $responded)) {
      $responded[] = $supplierId;
      $this->responded_suppliers = $responded;
      $this->save();
    }
    return $this;
  }

  public function addDeclinedSupplier(int $supplierId): self
  {
    $declined = $this->getDeclinedSuppliers();
    if (!in_array($supplierId, $declined)) {
      $declined[] = $supplierId;
      $this->declined_suppliers = $declined;
      $this->save();
    }
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

  public function markAsResponded(): self
  {
    $this->update(['status' => 'responded']);
    return $this;
  }

  public function markAsClosed(): self
  {
    $this->update([
      'status' => 'closed',
      'closed_at' => now(),
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

  public function getLowestQuotation(): ?SupplierQuotation
  {
    return $this->supplierQuotations()
      ->where('status', 'submitted')
      ->orderBy('net_amount', 'asc')
      ->first();
  }

  public function getHighestQuotation(): ?SupplierQuotation
  {
    return $this->supplierQuotations()
      ->where('status', 'submitted')
      ->orderBy('net_amount', 'desc')
      ->first();
  }

  public function getAverageQuotation(): float
  {
    return (float) $this->supplierQuotations()
      ->where('status', 'submitted')
      ->avg('net_amount') ?? 0;
  }

  public static function generateQtnNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;
    return 'QTN-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->requisition_id,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'quotation_request',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
