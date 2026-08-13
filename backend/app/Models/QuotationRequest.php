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
    'total_quotations',
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

  /**
   * Get all submitted quotations (excluding drafts, pending, and cancelled).
   */
  public function submittedQuotations(): HasMany
  {
    return $this->supplierQuotations()
      ->whereNotIn('status', ['draft', 'pending', 'cancelled']);
  }

  /**
   * Get accepted quotations.
   */
  public function acceptedQuotations(): HasMany
  {
    return $this->supplierQuotations()
      ->where('status', 'accepted');
  }

  /**
   * Get rejected quotations.
   */
  public function rejectedQuotations(): HasMany
  {
    return $this->supplierQuotations()
      ->where('status', 'rejected');
  }

  /**
   * Get pending quotations.
   */
  public function pendingQuotations(): HasMany
  {
    return $this->supplierQuotations()
      ->where('status', 'pending');
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
    return $this->isExpired();
  }

  public function getIsClosingSoonAttribute(): bool
  {
    if (!$this->closing_date) {
      return false;
    }
    return $this->closing_date->diffInDays(now()) <= 2 && !$this->isExpired();
  }

  /**
   * 🔧 FIXED: Get the count of responses (all submitted quotations except rejected/draft/cancelled).
   * This counts ALL quotations that have been submitted, including rejected ones,
   * because a rejection is still a response.
   */
  public function getResponseCountAttribute(): int
  {
    // Count all quotations that are not draft, pending, or cancelled
    // This includes rejected, evaluated, accepted, etc.
    return $this->supplierQuotations()
      ->whereNotIn('status', ['draft', 'pending', 'cancelled'])
      ->count();
  }

  /**
   * Get the total number of quotations (including all statuses).
   */
  public function getTotalQuotationsAttribute(): int
  {
    return $this->supplierQuotations()->count();
  }

  /**
   * 🔧 FIXED: Get the response rate based on responded suppliers.
   * This uses the responded_suppliers array which tracks which suppliers actually responded.
   */
  public function getResponseRateAttribute(): float
  {
    $sentCount = count($this->sent_to_suppliers ?? []);
    if ($sentCount === 0) {
      return 0;
    }

    $respondedCount = count($this->responded_suppliers ?? []);
    return round(($respondedCount / $sentCount) * 100, 2);
  }

  /**
   * Get the number of suppliers who responded.
   */
  public function getRespondedSuppliersCountAttribute(): int
  {
    return count($this->responded_suppliers ?? []);
  }

  /**
   * Get the number of suppliers who declined.
   */
  public function getDeclinedSuppliersCountAttribute(): int
  {
    return count($this->declined_suppliers ?? []);
  }

  /**
   * Get the number of suppliers who were sent the RFQ.
   */
  public function getSentSuppliersCountAttribute(): int
  {
    return count($this->sent_to_suppliers ?? []);
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

  public function scopeWithResponses($query)
  {
    return $query->whereHas('supplierQuotations', function ($q) {
      $q->whereNotIn('status', ['draft', 'pending', 'cancelled']);
    });
  }

  public function scopeWithoutResponses($query)
  {
    return $query->whereDoesntHave('supplierQuotations', function ($q) {
      $q->whereNotIn('status', ['draft', 'pending', 'cancelled']);
    });
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

  /**
   * Check if the quotation has expired.
   * A quotation is expired if:
   * - closing_date is in the past
   * - AND status is not 'closed' or 'cancelled'
   */
  public function isExpired(): bool
  {
    return $this->closing_date
      && $this->closing_date->isPast()
      && !in_array($this->status, ['closed', 'cancelled']);
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
    return $this->submittedQuotations()
      ->orderBy('net_amount', 'asc')
      ->first();
  }

  public function getHighestQuotation(): ?SupplierQuotation
  {
    return $this->submittedQuotations()
      ->orderBy('net_amount', 'desc')
      ->first();
  }

  public function getAverageQuotation(): float
  {
    return (float) $this->submittedQuotations()
      ->avg('net_amount') ?? 0;
  }

  public function hasResponses(): bool
  {
    return $this->response_count > 0;
  }

  public function hasAllSuppliersResponded(): bool
  {
    $sent = count($this->sent_to_suppliers ?? []);
    $responded = count($this->responded_suppliers ?? []);
    return $sent > 0 && $responded >= $sent;
  }

  public function getResponseSummary(): array
  {
    return [
      'sent' => $this->sent_suppliers_count,
      'responded' => $this->responded_suppliers_count,
      'declined' => $this->declined_suppliers_count,
      'pending' => $this->sent_suppliers_count - $this->responded_suppliers_count - $this->declined_suppliers_count,
      'rate' => $this->response_rate,
    ];
  }

  public static function generateQtnNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;
    return 'RFQ-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  public function logActivity(
    string $action,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null
  ): void {
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

  /**
   * Override toArray to ensure calculated attributes are included.
   */
  public function toArray()
  {
    $array = parent::toArray();

    // Ensure all calculated attributes are included
    $array['response_count'] = $this->response_count;
    $array['response_rate'] = $this->response_rate;
    $array['total_quotations'] = $this->total_quotations;
    $array['responded_suppliers_count'] = $this->responded_suppliers_count;
    $array['declined_suppliers_count'] = $this->declined_suppliers_count;
    $array['sent_suppliers_count'] = $this->sent_suppliers_count;

    return $array;
  }
}
