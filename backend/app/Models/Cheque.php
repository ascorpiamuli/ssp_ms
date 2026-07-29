<?php
// app/Models/Cheque.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cheque extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'payment_voucher_id',
    'cheque_number',
    'payee_name',
    'payee_address',
    'amount',
    'amount_words',
    'issued_date',
    'status',
    'bank_name',
    'account_number',
    'bank_branch',
    'bank_sort_code',
    'recorded_by',
    'received_by',
    'received_at',
    'cashed_at',
    'cancelled_at',
    'cancellation_reason',
    'cancelled_by',
    'notes',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'amount' => 'decimal:2',
    'issued_date' => 'date',
    'received_at' => 'datetime',
    'cashed_at' => 'datetime',
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
    'formatted_amount',
    'is_cashed',
    'is_cancelled',
    'is_void',
    'payee_name_display',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function paymentVoucher(): BelongsTo
  {
    return $this->belongsTo(PaymentVoucher::class, 'payment_voucher_id');
  }

  public function recordedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'recorded_by');
  }

  public function receivedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'received_by');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'issued' => 'Issued',
      'cashed' => 'Cashed',
      'cancelled' => 'Cancelled',
      'void' => 'Void',
      'stopped' => 'Stopped',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'issued' => 'info',
      'cashed' => 'success',
      'cancelled' => 'danger',
      'void' => 'danger',
      'stopped' => 'warning',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getFormattedAmountAttribute(): string
  {
    return number_format((float) ($this->amount ?? 0), 2);
  }

  public function getIsCashedAttribute(): bool
  {
    return $this->status === 'cashed';
  }

  public function getIsCancelledAttribute(): bool
  {
    return $this->status === 'cancelled';
  }

  public function getIsVoidAttribute(): bool
  {
    return $this->status === 'void';
  }

  public function getPayeeNameDisplayAttribute(): string
  {
    return $this->payee_name ?? 'Unknown Payee';
  }

  /**
   * Set cheque_number to uppercase.
   */
  public function setChequeNumberAttribute(string $value): void
  {
    $this->attributes['cheque_number'] = strtoupper(trim($value));
  }

  /**
   * Set amount_words with proper capitalization.
   */
  public function setAmountWordsAttribute(string $value): void
  {
    $this->attributes['amount_words'] = ucwords(strtolower(trim($value)));
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopeIssued($query)
  {
    return $query->where('status', 'issued');
  }

  public function scopeCashed($query)
  {
    return $query->where('status', 'cashed');
  }

  public function scopeCancelled($query)
  {
    return $query->where('status', 'cancelled');
  }

  public function scopeByPaymentVoucher($query, int $paymentVoucherId)
  {
    return $query->where('payment_voucher_id', $paymentVoucherId);
  }

  public function scopeByBank($query, string $bankName)
  {
    return $query->where('bank_name', 'LIKE', "%{$bankName}%");
  }

  public function scopeByDateRange($query, string $startDate, string $endDate)
  {
    return $query->whereBetween('issued_date', [$startDate, $endDate]);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isIssued(): bool
  {
    return $this->status === 'issued';
  }

  public function isCashed(): bool
  {
    return $this->status === 'cashed';
  }

  public function isCancelled(): bool
  {
    return $this->status === 'cancelled';
  }

  public function isVoid(): bool
  {
    return $this->status === 'void';
  }

  public function isStopped(): bool
  {
    return $this->status === 'stopped';
  }

  public function markAsCashed(?string $notes = null): self
  {
    $this->update([
      'status' => 'cashed',
      'cashed_at' => now(),
      'notes' => $notes,
    ]);
    return $this;
  }

  public function markAsCancelled(string $reason, ?string $cancelledBy = null): self
  {
    $this->update([
      'status' => 'cancelled',
      'cancelled_at' => now(),
      'cancellation_reason' => $reason,
      'cancelled_by' => $cancelledBy,
    ]);
    return $this;
  }

  public function markAsVoid(string $reason): self
  {
    $this->update([
      'status' => 'void',
      'cancelled_at' => now(),
      'cancellation_reason' => $reason,
    ]);
    return $this;
  }

  public function markAsStopped(string $reason): self
  {
    $this->update([
      'status' => 'stopped',
      'cancelled_at' => now(),
      'cancellation_reason' => $reason,
    ]);
    return $this;
  }

  public function markAsReceived(int $userId): self
  {
    $this->update([
      'received_by' => $userId,
      'received_at' => now(),
    ]);
    return $this;
  }

  public static function generateChequeNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;
    return 'CHQ-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->paymentVoucher->requisition_id ?? null,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'cheque',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
