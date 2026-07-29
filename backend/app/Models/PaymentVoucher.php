<?php
// app/Models/PaymentVoucher.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PaymentVoucher extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'invoice_id',
    'purchase_order_id',
    'supplier_id',
    'voucher_number',
    'payee_name',
    'payee_address',
    'payee_phone',
    'payee_email',
    'amount',
    'amount_words',
    'bank_name',
    'account_number',
    'bank_branch',
    'cheque_number',
    'payment_date',
    'payment_description',
    'payment_method',
    'transaction_reference',
    'status',
    'prepared_by',
    'endorsed_by',
    'approved_by',
    'endorsed_at',
    'approved_at',
    'paid_at',
    'digital_signature_endorsement',
    'digital_signature_approval',
    'digital_signature_preparer',
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
    'payment_date' => 'date',
    'endorsed_at' => 'datetime',
    'approved_at' => 'datetime',
    'paid_at' => 'datetime',
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
    'payment_method_label',
    'formatted_amount',
    'supplier_name',
    'is_endorsed',
    'is_approved',
    'is_paid',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class, 'requisition_id');
  }

  public function invoice(): BelongsTo
  {
    return $this->belongsTo(Invoice::class, 'invoice_id');
  }

  public function purchaseOrder(): BelongsTo
  {
    return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
  }

  public function supplier(): BelongsTo
  {
    return $this->belongsTo(User::class, 'supplier_id');
  }

  public function preparedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'prepared_by');
  }

  public function endorsedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'endorsed_by');
  }

  public function approvedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'approved_by');
  }

  public function cheque(): HasOne
  {
    return $this->hasOne(Cheque::class, 'payment_voucher_id');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'draft' => 'Draft',
      'endorsed' => 'Endorsed',
      'approved' => 'Approved',
      'paid' => 'Paid',
      'cancelled' => 'Cancelled',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'draft' => 'gray',
      'endorsed' => 'info',
      'approved' => 'primary',
      'paid' => 'success',
      'cancelled' => 'danger',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getPaymentMethodLabelAttribute(): string
  {
    $labels = [
      'cheque' => 'Cheque',
      'bank_transfer' => 'Bank Transfer',
      'cash' => 'Cash',
      'mobile_money' => 'Mobile Money',
    ];

    return $labels[$this->payment_method] ?? ucfirst($this->payment_method ?? 'Unknown');
  }

  public function getFormattedAmountAttribute(): string
  {
    return number_format((float) ($this->amount ?? 0), 2);
  }

  public function getSupplierNameAttribute(): string
  {
    return $this->supplier ? $this->supplier->full_name : 'Unknown Supplier';
  }

  public function getIsEndorsedAttribute(): bool
  {
    return $this->status === 'endorsed' || $this->status === 'approved' || $this->status === 'paid';
  }

  public function getIsApprovedAttribute(): bool
  {
    return $this->status === 'approved' || $this->status === 'paid';
  }

  public function getIsPaidAttribute(): bool
  {
    return $this->status === 'paid';
  }

  /**
   * Set voucher_number to uppercase.
   */
  public function setVoucherNumberAttribute(string $value): void
  {
    $this->attributes['voucher_number'] = strtoupper(trim($value));
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

  public function scopeDraft($query)
  {
    return $query->where('status', 'draft');
  }

  public function scopeEndorsed($query)
  {
    return $query->where('status', 'endorsed');
  }

  public function scopeApproved($query)
  {
    return $query->where('status', 'approved');
  }

  public function scopePaid($query)
  {
    return $query->where('status', 'paid');
  }

  public function scopeBySupplier($query, int $supplierId)
  {
    return $query->where('supplier_id', $supplierId);
  }

  public function scopeByRequisition($query, int $requisitionId)
  {
    return $query->where('requisition_id', $requisitionId);
  }

  public function scopeByInvoice($query, int $invoiceId)
  {
    return $query->where('invoice_id', $invoiceId);
  }

  public function scopeByPaymentMethod($query, string $method)
  {
    return $query->where('payment_method', $method);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isDraft(): bool
  {
    return $this->status === 'draft';
  }

  public function isEndorsed(): bool
  {
    return $this->status === 'endorsed';
  }

  public function isApproved(): bool
  {
    return $this->status === 'approved';
  }

  public function isPaid(): bool
  {
    return $this->status === 'paid';
  }

  public function isCancelled(): bool
  {
    return $this->status === 'cancelled';
  }

  public function isChequePayment(): bool
  {
    return $this->payment_method === 'cheque';
  }

  public function isBankTransfer(): bool
  {
    return $this->payment_method === 'bank_transfer';
  }

  public function markAsEndorsed(int $userId, ?string $signature = null): self
  {
    $this->update([
      'status' => 'endorsed',
      'endorsed_by' => $userId,
      'endorsed_at' => now(),
      'digital_signature_endorsement' => $signature,
    ]);
    return $this;
  }

  public function markAsApproved(int $userId, ?string $signature = null): self
  {
    $this->update([
      'status' => 'approved',
      'approved_by' => $userId,
      'approved_at' => now(),
      'digital_signature_approval' => $signature,
    ]);
    return $this;
  }

  public function markAsPaid(?string $reference = null): self
  {
    $this->update([
      'status' => 'paid',
      'paid_at' => now(),
      'transaction_reference' => $reference,
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

  public function generateDigitalSignature(string $type, int $userId): string
  {
    $data = $this->id . $this->voucher_number . $this->amount . $userId;
    return hash_hmac('sha256', $data, config('app.key'));
  }

  public function attachCheque(array $chequeData): Cheque
  {
    return $this->cheque()->create($chequeData);
  }

  public static function generateVoucherNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;
    return 'PV-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->requisition_id,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'payment_voucher',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
