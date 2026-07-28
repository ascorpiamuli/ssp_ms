<?php
// app/Models/RequisitionRevision.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequisitionRevision extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'requested_by',
    'approved_by',
    'rejected_by',
    'revision_number',
    'revision_reason',
    'revision_notes',
    'changes',
    'status',
    'approval_notes',
    'rejection_reason',
    'requested_at',
    'approved_at',
    'rejected_at',
    'cancelled_at',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'changes' => 'json',
    'metadata' => 'json',
    'requested_at' => 'datetime',
    'approved_at' => 'datetime',
    'rejected_at' => 'datetime',
    'cancelled_at' => 'datetime',
    'revision_number' => 'integer',
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
    'formatted_requested_at',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the requisition this revision belongs to.
   */
  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class);
  }

  /**
   * Get the user who requested this revision.
   */
  public function requestedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'requested_by');
  }

  /**
   * Get the user who approved this revision.
   */
  public function approvedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'approved_by');
  }

  /**
   * Get the user who rejected this revision.
   */
  public function rejectedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'rejected_by');
  }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

  /**
   * Get status label.
   */
  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending Review',
      'approved' => 'Approved',
      'rejected' => 'Rejected',
      'cancelled' => 'Cancelled',
    ];

    return $labels[$this->status] ?? ucfirst($this->status);
  }

  /**
   * Get status color.
   */
  public function getStatusColorAttribute(): string
  {
    $colors = [
      'pending' => 'warning',
      'approved' => 'success',
      'rejected' => 'danger',
      'cancelled' => 'danger',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  /**
   * Get formatted requested at.
   */
  public function getFormattedRequestedAtAttribute(): string
  {
    return $this->requested_at ? $this->requested_at->format('Y-m-d H:i:s') : '';
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for pending revisions.
   */
  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  /**
   * Scope for approved revisions.
   */
  public function scopeApproved($query)
  {
    return $query->where('status', 'approved');
  }

  /**
   * Scope for rejected revisions.
   */
  public function scopeRejected($query)
  {
    return $query->where('status', 'rejected');
  }

  /**
   * Scope by revision number.
   */
  public function scopeByRevisionNumber($query, int $revisionNumber)
  {
    return $query->where('revision_number', $revisionNumber);
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Check if revision is pending.
   */
  public function isPending(): bool
  {
    return $this->status === 'pending';
  }

  /**
   * Check if revision is approved.
   */
  public function isApproved(): bool
  {
    return $this->status === 'approved';
  }

  /**
   * Check if revision is rejected.
   */
  public function isRejected(): bool
  {
    return $this->status === 'rejected';
  }

  /**
   * Approve the revision.
   */
  public function approve(int $userId, ?string $notes = null): void
  {
    $this->update([
      'status' => 'approved',
      'approved_by' => $userId,
      'approved_at' => now(),
      'approval_notes' => $notes,
    ]);
  }

  /**
   * Reject the revision.
   */
  public function reject(int $userId, string $reason): void
  {
    $this->update([
      'status' => 'rejected',
      'rejected_by' => $userId,
      'rejected_at' => now(),
      'rejection_reason' => $reason,
    ]);
  }

  /**
   * Cancel the revision.
   */
  public function cancel(?string $reason = null): void
  {
    $this->update([
      'status' => 'cancelled',
      'cancelled_at' => now(),
      'revision_notes' => $reason,
    ]);
  }

  /**
   * Get the next revision number for a requisition.
   */
  public static function getNextRevisionNumber(int $requisitionId): int
  {
    $lastRevision = self::where('requisition_id', $requisitionId)
      ->orderBy('revision_number', 'desc')
      ->first();

    return $lastRevision ? $lastRevision->revision_number + 1 : 1;
  }
}
