<?php
// app/Models/ProcurementApproval.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ProcurementApproval extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'approvable_id',
    'approvable_type',
    'level',
    'approver_id',
    'delegate_id',
    'status',
    'order',
    'comment',
    'decline_reason',
    'return_reason',
    'approved_at',
    'declined_at',
    'returned_at',
    'deadline',
    'is_reminder_sent',
    'reminder_sent_at',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'order' => 'integer',
    'approved_at' => 'datetime',
    'declined_at' => 'datetime',
    'returned_at' => 'datetime',
    'deadline' => 'datetime',
    'reminder_sent_at' => 'datetime',
    'is_reminder_sent' => 'boolean',
    'metadata' => 'json',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'status_label',
    'status_color',
    'level_label',
    'level_color',
    'approver_name',
    'is_pending',
    'is_approved',
    'is_declined',
    'is_returned',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class, 'requisition_id');
  }

  public function approvable(): MorphTo
  {
    return $this->morphTo();
  }

  public function approver(): BelongsTo
  {
    return $this->belongsTo(User::class, 'approver_id');
  }

  public function delegate(): BelongsTo
  {
    return $this->belongsTo(User::class, 'delegate_id');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending',
      'approved' => 'Approved',
      'declined' => 'Declined',
      'returned' => 'Returned',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'pending' => 'warning',
      'approved' => 'success',
      'declined' => 'danger',
      'returned' => 'info',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getLevelLabelAttribute(): string
  {
    $labels = [
      'hod' => 'Head of Department',
      'accountant' => 'Accountant',
      'principal' => 'Principal',
      'final' => 'Final Approver',
      'diocesan_accountant' => 'Diocesan Accountant',
      'procurement' => 'Procurement Officer',
    ];

    return $labels[$this->level] ?? ucfirst($this->level ?? 'Unknown');
  }

  public function getLevelColorAttribute(): string
  {
    $colors = [
      'hod' => 'primary',
      'accountant' => 'info',
      'principal' => 'warning',
      'final' => 'success',
      'diocesan_accountant' => 'purple',
      'procurement' => 'secondary',
    ];

    return $colors[$this->level] ?? 'secondary';
  }

  public function getApproverNameAttribute(): string
  {
    return $this->approver ? $this->approver->full_name : 'Unknown User';
  }

  public function getIsPendingAttribute(): bool
  {
    return $this->status === 'pending';
  }

  public function getIsApprovedAttribute(): bool
  {
    return $this->status === 'approved';
  }

  public function getIsDeclinedAttribute(): bool
  {
    return $this->status === 'declined';
  }

  public function getIsReturnedAttribute(): bool
  {
    return $this->status === 'returned';
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  public function scopeApproved($query)
  {
    return $query->where('status', 'approved');
  }

  public function scopeDeclined($query)
  {
    return $query->where('status', 'declined');
  }

  public function scopeByApprover($query, int $approverId)
  {
    return $query->where('approver_id', $approverId)
      ->orWhere('delegate_id', $approverId);
  }

  public function scopeByLevel($query, string $level)
  {
    return $query->where('level', $level);
  }

  public function scopeByRequisition($query, int $requisitionId)
  {
    return $query->where('requisition_id', $requisitionId);
  }

  public function scopeByEntity($query, string $type, int $id)
  {
    return $query->where('approvable_type', $type)
      ->where('approvable_id', $id);
  }

  public function scopeOverdue($query)
  {
    return $query->where('status', 'pending')
      ->where('deadline', '<', now());
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isPending(): bool
  {
    return $this->isPendingAttribute();
  }

  public function isApproved(): bool
  {
    return $this->isApprovedAttribute();
  }

  public function isDeclined(): bool
  {
    return $this->isDeclinedAttribute();
  }

  public function isReturned(): bool
  {
    return $this->isReturnedAttribute();
  }

  public function approve(?string $comment = null): self
  {
    $this->update([
      'status' => 'approved',
      'approved_at' => now(),
      'comment' => $comment,
    ]);
    return $this;
  }

  public function decline(string $reason): self
  {
    $this->update([
      'status' => 'declined',
      'declined_at' => now(),
      'decline_reason' => $reason,
    ]);
    return $this;
  }

  public function return(string $reason): self
  {
    $this->update([
      'status' => 'returned',
      'returned_at' => now(),
      'return_reason' => $reason,
    ]);
    return $this;
  }

  public function sendReminder(): self
  {
    $this->update([
      'is_reminder_sent' => true,
      'reminder_sent_at' => now(),
    ]);
    return $this;
  }

  public function isOverdue(): bool
  {
    return $this->deadline && $this->deadline->isPast() && $this->status === 'pending';
  }

  public function canBeApproved(): bool
  {
    return $this->status === 'pending' && !$this->isOverdue();
  }

  public function isDelegated(): bool
  {
    return !is_null($this->delegate_id);
  }
}
