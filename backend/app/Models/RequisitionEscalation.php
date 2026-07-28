<?php
// app/Models/RequisitionEscalation.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequisitionEscalation extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'escalated_by',
    'escalated_to',
    'resolved_by',
    'reason',
    'remarks',
    'resolution_notes',
    'status',
    'escalated_at',
    'resolved_at',
    'acknowledged_at',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'escalated_at' => 'datetime',
    'resolved_at' => 'datetime',
    'acknowledged_at' => 'datetime',
    'metadata' => 'json',
    'created_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'reason_label',
    'status_label',
    'status_color',
    'escalated_by_name',
    'escalated_to_name',
    'resolved_by_name',
    'formatted_escalated_at',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the requisition this escalation belongs to.
   */
  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class);
  }

  /**
   * Get the user who escalated this.
   */
  public function escalatedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'escalated_by');
  }

  /**
   * Get the user this was escalated to.
   */
  public function escalatedTo(): BelongsTo
  {
    return $this->belongsTo(User::class, 'escalated_to');
  }

  /**
   * Get the user who resolved this.
   */
  public function resolvedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'resolved_by');
  }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

  /**
   * Get reason label.
   */
  public function getReasonLabelAttribute(): string
  {
    $labels = [
      'delayed_approval' => 'Delayed Approval',
      'budget_issue' => 'Budget Issue',
      'emergency' => 'Emergency',
      'exception' => 'Exception',
      'policy_violation' => 'Policy Violation',
      'revision_dispute' => 'Revision Dispute',
    ];

    return $labels[$this->reason] ?? ucfirst(str_replace('_', ' ', $this->reason));
  }

  /**
   * Get status label.
   */
  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending',
      'resolved' => 'Resolved',
      'rejected' => 'Rejected',
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
      'resolved' => 'success',
      'rejected' => 'danger',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  /**
   * Get escalated by name.
   */
  public function getEscalatedByNameAttribute(): string
  {
    return $this->escalatedBy ? $this->escalatedBy->full_name : 'Unknown User';
  }

  /**
   * Get escalated to name.
   */
  public function getEscalatedToNameAttribute(): string
  {
    return $this->escalatedTo ? $this->escalatedTo->full_name : 'Unknown User';
  }

  /**
   * Get resolved by name.
   */
  public function getResolvedByNameAttribute(): string
  {
    return $this->resolvedBy ? $this->resolvedBy->full_name : 'N/A';
  }

  /**
   * Get formatted escalated at.
   */
  public function getFormattedEscalatedAtAttribute(): string
  {
    return $this->escalated_at ? $this->escalated_at->format('Y-m-d H:i:s') : '';
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for pending escalations.
   */
  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  /**
   * Scope for resolved escalations.
   */
  public function scopeResolved($query)
  {
    return $query->where('status', 'resolved');
  }

  /**
   * Scope by reason.
   */
  public function scopeByReason($query, string $reason)
  {
    return $query->where('reason', $reason);
  }

  /**
   * Scope for user.
   */
  public function scopeForUser($query, int $userId)
  {
    return $query->where(function ($q) use ($userId) {
      $q->where('escalated_by', $userId)
        ->orWhere('escalated_to', $userId)
        ->orWhere('resolved_by', $userId);
    });
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Check if escalation is pending.
   */
  public function isPending(): bool
  {
    return $this->status === 'pending';
  }

  /**
   * Check if escalation is resolved.
   */
  public function isResolved(): bool
  {
    return $this->status === 'resolved';
  }

  /**
   * Resolve the escalation.
   */
  public function resolve(int $userId, ?string $notes = null): void
  {
    $this->update([
      'status' => 'resolved',
      'resolved_by' => $userId,
      'resolved_at' => now(),
      'resolution_notes' => $notes,
    ]);
  }

  /**
   * Reject the escalation.
   */
  public function reject(?string $reason = null): void
  {
    $this->update([
      'status' => 'rejected',
      'resolution_notes' => $reason,
    ]);
  }

  /**
   * Acknowledge the escalation.
   */
  public function acknowledge(): void
  {
    $this->update([
      'acknowledged_at' => now(),
    ]);
  }
}
