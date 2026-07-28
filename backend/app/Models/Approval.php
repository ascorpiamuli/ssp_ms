<?php
// app/Models/Approval.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Approval extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'approver_id',
    'delegate_id',
    'original_approver_id',
    'level',
    'status',
    'comment',
    'decline_reason',
    'return_reason',
    'revision_notes',
    'revision_count',
    'last_revised_at',
    'approved_at',
    'declined_at',
    'returned_at',
    'delegated_at',
    'reminded_at',
    'escalated_at',
    'viewed_at',
    'response_time_hours',
    'received_at',
    'notification_sent',
    'notification_sent_at',
    'notification_count',
    'reminder_count',
    'order',
    'is_required',
    'conditions',
    'condition_notes',
    'action_taken',
    'device_info',
    'ip_address',
    'digital_signature',
    'is_signed',
    'signed_at',
    'is_group_approval',
    'approval_group',
    'group_order',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'approved_at' => 'datetime',
    'declined_at' => 'datetime',
    'returned_at' => 'datetime',
    'delegated_at' => 'datetime',
    'reminded_at' => 'datetime',
    'escalated_at' => 'datetime',
    'viewed_at' => 'datetime',
    'received_at' => 'datetime',
    'notification_sent_at' => 'datetime',
    'signed_at' => 'datetime',
    'last_revised_at' => 'datetime',
    'response_time_hours' => 'integer',
    'notification_count' => 'integer',
    'reminder_count' => 'integer',
    'revision_count' => 'integer',
    'order' => 'integer',
    'group_order' => 'integer',
    'is_required' => 'boolean',
    'notification_sent' => 'boolean',
    'is_signed' => 'boolean',
    'is_group_approval' => 'boolean',
    'conditions' => 'json',
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
    'level_label',
    'level_color',
    'is_pending',
    'is_approved',
    'is_declined',
    'is_delegated',
    'response_time_label',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the requisition this approval belongs to.
   */
  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class);
  }

  /**
   * Get the approver.
   */
  public function approver(): BelongsTo
  {
    return $this->belongsTo(User::class, 'approver_id');
  }

  /**
   * Get the delegate.
   */
  public function delegate(): BelongsTo
  {
    return $this->belongsTo(User::class, 'delegate_id');
  }

  /**
   * Get the original approver.
   */
  public function originalApprover(): BelongsTo
  {
    return $this->belongsTo(User::class, 'original_approver_id');
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
      'pending' => 'Pending',
      'approved' => 'Approved',
      'declined' => 'Declined',
      'returned' => 'Returned',
      'delegated' => 'Delegated',
      'escalated' => 'Escalated',
      'revised' => 'Revised',
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
      'declined' => 'danger',
      'returned' => 'warning',
      'delegated' => 'info',
      'escalated' => 'danger',
      'revised' => 'warning',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  /**
   * Get level label.
   */
  public function getLevelLabelAttribute(): string
  {
    $labels = [
      'hod' => 'HOD',
      'accountant' => 'Accountant',
      'principal' => 'Principal',
      'final' => 'Final Approval',
    ];

    return $labels[$this->level] ?? ucfirst($this->level);
  }

  /**
   * Get level color.
   */
  public function getLevelColorAttribute(): string
  {
    $colors = [
      'hod' => 'primary',
      'accountant' => 'info',
      'principal' => 'warning',
      'final' => 'success',
    ];

    return $colors[$this->level] ?? 'secondary';
  }

  /**
   * Check if pending.
   */
  public function getIsPendingAttribute(): bool
  {
    return $this->status === 'pending';
  }

  /**
   * Check if approved.
   */
  public function getIsApprovedAttribute(): bool
  {
    return $this->status === 'approved';
  }

  /**
   * Check if declined.
   */
  public function getIsDeclinedAttribute(): bool
  {
    return $this->status === 'declined';
  }

  /**
   * Check if delegated.
   */
  public function getIsDelegatedAttribute(): bool
  {
    return $this->status === 'delegated';
  }

  /**
   * Get response time label.
   */
  public function getResponseTimeLabelAttribute(): string
  {
    if (!$this->response_time_hours) {
      return 'N/A';
    }

    if ($this->response_time_hours < 1) {
      return round($this->response_time_hours * 60) . ' minutes';
    }

    return number_format($this->response_time_hours, 1) . ' hours';
  }

  /**
   * Set comment.
   */
  public function setCommentAttribute(?string $value): void
  {
    $this->attributes['comment'] = $value ? trim($value) : null;
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for pending approvals.
   */
  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  /**
   * Scope for approved approvals.
   */
  public function scopeApproved($query)
  {
    return $query->where('status', 'approved');
  }

  /**
   * Scope for declined approvals.
   */
  public function scopeDeclined($query)
  {
    return $query->where('status', 'declined');
  }

  /**
   * Scope for delegated approvals.
   */
  public function scopeDelegated($query)
  {
    return $query->where('status', 'delegated');
  }

  /**
   * Scope by approver.
   */
  public function scopeByApprover($query, int $approverId)
  {
    return $query->where('approver_id', $approverId);
  }

  /**
   * Scope by delegate.
   */
  public function scopeByDelegate($query, int $delegateId)
  {
    return $query->where('delegate_id', $delegateId);
  }

  /**
   * Scope by level.
   */
  public function scopeByLevel($query, string $level)
  {
    return $query->where('level', $level);
  }

  /**
   * Scope for pending approvals for user.
   */
  public function scopePendingForUser($query, int $userId)
  {
    return $query->where('status', 'pending')
      ->where(function ($q) use ($userId) {
        $q->where('approver_id', $userId)
          ->orWhere('delegate_id', $userId);
      });
  }

  /**
   * Scope by date range.
   */
  public function scopeDateRange($query, string $startDate, string $endDate)
  {
    return $query->whereBetween('created_at', [$startDate, $endDate]);
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Approve the approval.
   */
  public function approve(?string $comment = null): void
  {
    $this->update([
      'status' => 'approved',
      'approved_at' => now(),
      'comment' => $comment,
      'response_time_hours' => $this->created_at->diffInHours(now()),
    ]);
  }

  /**
   * Decline the approval.
   */
  public function decline(string $reason, ?string $comment = null): void
  {
    $this->update([
      'status' => 'declined',
      'declined_at' => now(),
      'decline_reason' => $reason,
      'comment' => $comment,
      'response_time_hours' => $this->created_at->diffInHours(now()),
    ]);
  }

  /**
   * Return the approval.
   */
  public function return(string $reason, ?string $comment = null): void
  {
    $this->update([
      'status' => 'returned',
      'returned_at' => now(),
      'return_reason' => $reason,
      'comment' => $comment,
      'response_time_hours' => $this->created_at->diffInHours(now()),
    ]);
  }



  /**
   * Escalate the approval.
   */
  public function escalate(?string $reason = null): void
  {
    $this->update([
      'status' => 'escalated',
      'escalated_at' => now(),
      'comment' => $reason,
    ]);
  }

  /**
   * Check if approval is in pending status.
   */
  public function isPending(): bool
  {
    return $this->status === 'pending';
  }

  /**
   * Check if approval is approved.
   */
  public function isApproved(): bool
  {
    return $this->status === 'approved';
  }

  /**
   * Check if approval is declined.
   */
  public function isDeclined(): bool
  {
    return $this->status === 'declined';
  }

  /**
   * Check if approval is returned.
   */
  public function isReturned(): bool
  {
    return $this->status === 'returned';
  }

  /**
   * Check if approval is delegated.
   */
  public function isDelegated(): bool
  {
    return $this->status === 'delegated';
  }

  /**
   * Check if approval is escalated.
   */
  public function isEscalated(): bool
  {
    return $this->status === 'escalated';
  }

  /**
   * Get the actual approver (delegate if delegated, otherwise approver).
   */
  public function getActualApprover(): ?User
  {
    if ($this->isDelegated() && $this->delegate) {
      return $this->delegate;
    }
    return $this->approver;
  }
}
