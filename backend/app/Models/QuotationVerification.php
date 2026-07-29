<?php
// app/Models/QuotationVerification.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationVerification extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'supplier_quotation_id',
    'assigned_to',
    'completed_by',
    'status',
    'verification_notes',
    'rejection_reason',
    'verification_checklist',
    'verification_result',
    'assigned_at',
    'started_at',
    'completed_at',
    'deadline',
    'attempts',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'assigned_at' => 'datetime',
    'started_at' => 'datetime',
    'completed_at' => 'datetime',
    'deadline' => 'date',
    'attempts' => 'integer',
    'verification_checklist' => 'json',
    'verification_result' => 'json',
    'metadata' => 'json',
    'created_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'status_label',
    'status_color',
    'assigned_to_name',
    'completed_by_name',
    'supplier_name',
    'is_pending',
    'is_in_progress',
    'is_verified',
    'is_rejected',
    'is_overdue',
    'verification_progress',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function supplierQuotation(): BelongsTo
  {
    return $this->belongsTo(SupplierQuotation::class, 'supplier_quotation_id');
  }

  public function assignedTo(): BelongsTo
  {
    return $this->belongsTo(User::class, 'assigned_to');
  }

  public function completedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'completed_by');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending',
      'in_progress' => 'In Progress',
      'verified' => 'Verified',
      'rejected' => 'Rejected',
      'needs_more_info' => 'Needs More Info',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'pending' => 'warning',
      'in_progress' => 'info',
      'verified' => 'success',
      'rejected' => 'danger',
      'needs_more_info' => 'primary',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getAssignedToNameAttribute(): string
  {
    return $this->assignedTo ? $this->assignedTo->full_name : 'Unassigned';
  }

  public function getCompletedByNameAttribute(): string
  {
    return $this->completedBy ? $this->completedBy->full_name : 'Not Completed';
  }

  public function getSupplierNameAttribute(): string
  {
    return $this->supplierQuotation->supplier->full_name ?? 'Unknown Supplier';
  }

  public function getIsPendingAttribute(): bool
  {
    return $this->status === 'pending';
  }

  public function getIsInProgressAttribute(): bool
  {
    return $this->status === 'in_progress';
  }

  public function getIsVerifiedAttribute(): bool
  {
    return $this->status === 'verified';
  }

  public function getIsRejectedAttribute(): bool
  {
    return $this->status === 'rejected';
  }

  public function getIsOverdueAttribute(): bool
  {
    return $this->deadline && $this->deadline->isPast() &&
      in_array($this->status, ['pending', 'in_progress']);
  }

  public function getVerificationProgressAttribute(): float
  {
    if (!$this->verification_checklist) {
      return 0;
    }

    $total = count($this->verification_checklist);
    if ($total === 0) {
      return 0;
    }

    $completed = 0;
    foreach ($this->verification_checklist as $item) {
      if (isset($item['completed']) && $item['completed']) {
        $completed++;
      }
    }

    return round(($completed / $total) * 100, 2);
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  public function scopeInProgress($query)
  {
    return $query->where('status', 'in_progress');
  }

  public function scopeVerified($query)
  {
    return $query->where('status', 'verified');
  }

  public function scopeRejected($query)
  {
    return $query->where('status', 'rejected');
  }

  public function scopeByAssignedTo($query, int $userId)
  {
    return $query->where('assigned_to', $userId);
  }

  public function scopeBySupplierQuotation($query, int $supplierQuotationId)
  {
    return $query->where('supplier_quotation_id', $supplierQuotationId);
  }

  public function scopeOverdue($query)
  {
    return $query->where('deadline', '<', now())
      ->whereIn('status', ['pending', 'in_progress']);
  }

  public function scopeDueSoon($query, int $days = 2)
  {
    return $query->where('deadline', '<=', now()->addDays($days))
      ->where('deadline', '>=', now())
      ->whereIn('status', ['pending', 'in_progress']);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isPending(): bool
  {
    return $this->isPendingAttribute();
  }

  public function isInProgress(): bool
  {
    return $this->isInProgressAttribute();
  }

  public function isVerified(): bool
  {
    return $this->isVerifiedAttribute();
  }

  public function isRejected(): bool
  {
    return $this->isRejectedAttribute();
  }

  public function isOverdue(): bool
  {
    return $this->isOverdueAttribute();
  }

  public function assign(int $userId): self
  {
    $this->update([
      'assigned_to' => $userId,
      'assigned_at' => now(),
      'status' => 'pending',
    ]);
    return $this;
  }

  public function startVerification(): self
  {
    $this->update([
      'status' => 'in_progress',
      'started_at' => now(),
    ]);
    return $this;
  }

  public function completeVerification(string $result, ?string $notes = null): self
  {
    $this->update([
      'status' => $result === 'passed' ? 'verified' : 'rejected',
      'completed_by' => auth()->id(),
      'completed_at' => now(),
      'verification_notes' => $notes,
      'rejection_reason' => $result === 'failed' ? $notes : null,
    ]);
    return $this;
  }

  public function verify(array $checklist, ?string $notes = null): self
  {
    $this->update([
      'status' => 'verified',
      'verification_checklist' => $checklist,
      'verification_notes' => $notes,
      'completed_by' => auth()->id(),
      'completed_at' => now(),
    ]);
    return $this;
  }

  public function reject(string $reason): self
  {
    $this->update([
      'status' => 'rejected',
      'rejection_reason' => $reason,
      'completed_by' => auth()->id(),
      'completed_at' => now(),
    ]);
    return $this;
  }

  public function requestMoreInfo(string $reason): self
  {
    $this->update([
      'status' => 'needs_more_info',
      'verification_notes' => $reason,
    ]);
    return $this;
  }

  public function updateChecklist(array $checklist): self
  {
    $this->update(['verification_checklist' => $checklist]);
    return $this;
  }

  public function incrementAttempts(): self
  {
    $this->update(['attempts' => $this->attempts + 1]);
    return $this;
  }

  public function getChecklistSummary(): array
  {
    $checklist = $this->verification_checklist ?? [];
    $total = count($checklist);
    $completed = 0;

    foreach ($checklist as $item) {
      if (isset($item['completed']) && $item['completed']) {
        $completed++;
      }
    }

    return [
      'total' => $total,
      'completed' => $completed,
      'pending' => $total - $completed,
      'progress' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
    ];
  }

  public function getResultSummary(): ?array
  {
    return $this->verification_result;
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => $this->supplierQuotation->quotationRequest->requisition_id ?? null,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'quotation_verification',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
