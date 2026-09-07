<?php
// app/Models/SupplierQuotation.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class SupplierQuotation extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'quotation_request_id',
    'supplier_id',
    'quotation_number',
    'supplier_reference_no',
    'submission_date',
    'validity_date',
    'delivery_time',
    'payment_terms',
    'delivery_terms',
    'warranty_terms',
    'total_amount',
    'tax_amount',
    'discount_amount',
    'net_amount',
    'currency',
    'exchange_rate',
    'total_amount_base_currency',
    'status',
    'notes',
    'is_lowest',
    'submission_method',
    'uploaded_file_path',
    'original_filename',
    'file_hash',
    'is_data_extracted',
    'extracted_data',
    'manual_entry_notes',
    'verified_by',
    'verified_at',
    'verification_status',
    'verification_notes',
    'evaluated_by',
    'evaluated_at',
    'evaluation_notes',
    'evaluation_score',
    'metadata',
    'download_count',
    'last_downloaded_at',
    'pdf_storage_path',
    'pdf_filename',
    'pdf_upload_id',
    'view_count',
    'last_viewed_at',
    'shared_count',
    'last_shared_at',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'submission_date' => 'date',
    'validity_date' => 'date',
    'total_amount' => 'decimal:2',
    'tax_amount' => 'decimal:2',
    'discount_amount' => 'decimal:2',
    'net_amount' => 'decimal:2',
    'exchange_rate' => 'decimal:4',
    'total_amount_base_currency' => 'decimal:2',
    'is_lowest' => 'boolean',
    'is_data_extracted' => 'boolean',
    'extracted_data' => 'json',
    'verified_at' => 'datetime',
    'evaluated_at' => 'datetime',
    'evaluation_score' => 'integer',
    'metadata' => 'json',
    'deleted_at' => 'datetime',
    'download_count' => 'integer',
    'last_downloaded_at' => 'datetime',
    'view_count' => 'integer',
    'last_viewed_at' => 'datetime',
    'shared_count' => 'integer',
    'last_shared_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'status_label',
    'status_color',
    'formatted_total_amount',
    'formatted_net_amount',
    'verification_status_label',
    'submission_method_label',
    'is_valid',
    'supplier_name',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  /**
   * Get the quotation request that this quotation belongs to.
   */
  public function quotationRequest(): BelongsTo
  {
    return $this->belongsTo(QuotationRequest::class, 'quotation_request_id');
  }

  /**
   * ✅ Get the requisition through the quotation request.
   * This is a has-one-through relationship.
   */
  public function requisition(): HasOneThrough
  {
    return $this->hasOneThrough(
      Requisition::class,
      QuotationRequest::class,
      'id', // Foreign key on QuotationRequest table
      'id', // Foreign key on Requisition table
      'quotation_request_id', // Local key on SupplierQuotation table
      'requisition_id' // Local key on QuotationRequest table
    );
  }

  /**
   * Get the supplier (user) that submitted this quotation.
   */
  public function supplier(): BelongsTo
  {
    return $this->belongsTo(User::class, 'supplier_id');
  }

  /**
   * Get the user who verified this quotation.
   */
  public function verifiedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'verified_by');
  }

  /**
   * Get the user who evaluated this quotation.
   */
  public function evaluatedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'evaluated_by');
  }

  /**
   * Get the items for this quotation.
   */
  public function items(): HasMany
  {
    return $this->hasMany(SupplierQuotationItem::class, 'supplier_quotation_id');
  }

  /**
   * Get the purchase orders created from this quotation.
   */
  public function purchaseOrders(): HasMany
  {
    return $this->hasMany(PurchaseOrder::class, 'supplier_quotation_id');
  }

  /**
   * Get the verifications for this quotation.
   */
  public function verifications(): HasMany
  {
    return $this->hasMany(QuotationVerification::class, 'supplier_quotation_id');
  }

  /**
   * ✅ Relationship to the uploaded PDF file.
   */
  public function pdfUpload(): BelongsTo
  {
    return $this->belongsTo(Upload::class, 'pdf_upload_id');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending',
      'submitted' => 'Submitted',
      'evaluated' => 'Evaluated',
      'accepted' => 'Accepted',
      'rejected' => 'Rejected',
      'cancelled' => 'Cancelled',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'pending' => 'warning',
      'submitted' => 'info',
      'evaluated' => 'primary',
      'accepted' => 'success',
      'rejected' => 'danger',
      'cancelled' => 'danger',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getFormattedTotalAmountAttribute(): string
  {
    return number_format((float) ($this->total_amount ?? 0), 2);
  }

  public function getFormattedNetAmountAttribute(): string
  {
    return number_format((float) ($this->net_amount ?? 0), 2);
  }

  public function getVerificationStatusLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending Verification',
      'verified' => 'Verified',
      'rejected' => 'Rejected',
    ];

    return $labels[$this->verification_status] ?? ucfirst($this->verification_status ?? 'Pending');
  }

  public function getSubmissionMethodLabelAttribute(): string
  {
    $labels = [
      'system' => 'System Submission',
      'upload' => 'File Upload',
      'manual' => 'Manual Entry',
    ];

    return $labels[$this->submission_method] ?? ucfirst($this->submission_method ?? 'Unknown');
  }

  public function getIsValidAttribute(): bool
  {
    return $this->validity_date && $this->validity_date->isFuture();
  }

  public function getSupplierNameAttribute(): string
  {
    return $this->supplier ? $this->supplier->full_name : 'Unknown Supplier';
  }

  /**
   * Set quotation_number to uppercase.
   */
  public function setQuotationNumberAttribute(string $value): void
  {
    $this->attributes['quotation_number'] = strtoupper(trim($value));
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  public function scopeSubmitted($query)
  {
    return $query->where('status', 'submitted');
  }

  public function scopeAccepted($query)
  {
    return $query->where('status', 'accepted');
  }

  public function scopeRejected($query)
  {
    return $query->where('status', 'rejected');
  }

  public function scopeLowest($query)
  {
    return $query->where('is_lowest', true);
  }

  public function scopeVerified($query)
  {
    return $query->where('verification_status', 'verified');
  }

  public function scopeBySupplier($query, int $supplierId)
  {
    return $query->where('supplier_id', $supplierId);
  }

  public function scopeByQuotationRequest($query, int $quotationRequestId)
  {
    return $query->where('quotation_request_id', $quotationRequestId);
  }

  public function scopeValid($query)
  {
    return $query->whereDate('validity_date', '>=', now());
  }

  public function scopeBySubmissionMethod($query, string $method)
  {
    return $query->where('submission_method', $method);
  }

  public function scopeMostDownloaded($query, int $limit = 10)
  {
    return $query->orderBy('download_count', 'desc')->limit($limit);
  }

  public function scopeRecentlyDownloaded($query, int $limit = 10)
  {
    return $query->whereNotNull('last_downloaded_at')
      ->orderBy('last_downloaded_at', 'desc')
      ->limit($limit);
  }

  public function scopeNeverDownloaded($query)
  {
    return $query->where(function ($q) {
      $q->whereNull('download_count')
        ->orWhere('download_count', 0);
    });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isPending(): bool
  {
    return $this->status === 'pending';
  }

  public function isSubmitted(): bool
  {
    return $this->status === 'submitted';
  }

  public function isAccepted(): bool
  {
    return $this->status === 'accepted';
  }

  public function isRejected(): bool
  {
    return $this->status === 'rejected';
  }

  public function isVerified(): bool
  {
    return $this->verification_status === 'verified';
  }

  public function isValid(): bool
  {
    return $this->isValidAttribute();
  }

  public function isLowest(): bool
  {
    return (bool) $this->is_lowest;
  }

  public function isSystemSubmission(): bool
  {
    return $this->submission_method === 'system';
  }

  public function isUploadSubmission(): bool
  {
    return $this->submission_method === 'upload';
  }

  public function isManualSubmission(): bool
  {
    return $this->submission_method === 'manual';
  }

  public function hasPDF(): bool
  {
    return !empty($this->pdf_storage_path) || !empty($this->pdf_upload_id);
  }

  public function getPDFUrl(): ?string
  {
    if ($this->pdf_upload_id && $this->pdfUpload) {
      return $this->pdfUpload->url ?? null;
    }

    if ($this->pdf_storage_path) {
      return asset('storage/' . $this->pdf_storage_path);
    }

    return null;
  }

  public function incrementDownloadCount(): self
  {
    $this->increment('download_count');
    $this->last_downloaded_at = now();
    $this->save();

    return $this;
  }

  public function incrementViewCount(): self
  {
    $this->increment('view_count');
    $this->last_viewed_at = now();
    $this->save();

    return $this;
  }

  public function incrementSharedCount(): self
  {
    $this->increment('shared_count');
    $this->last_shared_at = now();
    $this->save();

    return $this;
  }

  public function updateTotals(): self
  {
    $items = $this->items;
    $total = $items->sum('total_price');
    $tax = $items->sum('tax_amount');
    $discount = $items->sum('discount_amount');
    $net = $items->sum('net_price');

    $this->update([
      'total_amount' => $total,
      'tax_amount' => $tax,
      'discount_amount' => $discount,
      'net_amount' => $net,
    ]);

    return $this;
  }

  public function markAsSubmitted(): self
  {
    $this->update([
      'status' => 'submitted',
      'submission_date' => now(),
    ]);
    return $this;
  }

  public function markAsAccepted(): self
  {
    $this->update(['status' => 'accepted']);
    return $this;
  }

  public function markAsRejected(?string $reason = null): self
  {
    $this->update([
      'status' => 'rejected',
      'notes' => $reason,
    ]);
    return $this;
  }

  public function markAsVerified(int $userId, ?string $notes = null): self
  {
    $this->update([
      'verification_status' => 'verified',
      'verified_by' => $userId,
      'verified_at' => now(),
      'verification_notes' => $notes,
    ]);
    return $this;
  }

  public function markAsLowest(): self
  {
    // Reset all other quotations for this request
    $this->quotationRequest->supplierQuotations()
      ->where('id', '!=', $this->id)
      ->update(['is_lowest' => false]);

    $this->update(['is_lowest' => true]);
    return $this;
  }

  public function evaluate(int $userId, int $score, ?string $notes = null): self
  {
    $this->update([
      'status' => 'evaluated',
      'evaluated_by' => $userId,
      'evaluated_at' => now(),
      'evaluation_score' => $score,
      'evaluation_notes' => $notes,
    ]);
    return $this;
  }

  public function hasFileUpload(): bool
  {
    return $this->submission_method === 'upload' && !empty($this->uploaded_file_path);
  }

  public function getFileUrl(): ?string
  {
    if (!$this->hasFileUpload()) {
      return null;
    }
    return asset('storage/' . $this->uploaded_file_path);
  }

  public static function generateQuotationNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;
    return 'SQ-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->quotationRequest->requisition_id ?? null,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'supplier_quotation',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
