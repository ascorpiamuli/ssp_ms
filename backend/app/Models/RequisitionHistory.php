<?php
// app/Models/RequisitionHistory.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequisitionHistory extends Model
{
  use HasFactory;
  protected $table = 'requisition_history';

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'user_id',
    'action',
    'old_values',
    'new_values',
    'comment',
    'revision_number',
    'revision_reason',
    'ip_address',
    'user_agent',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'old_values' => 'json',
    'new_values' => 'json',
    'metadata' => 'json',
    'created_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'action_label',
    'action_color',
    'formatted_created_at',
    'user_name',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the requisition this history belongs to.
   */
  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class);
  }

  /**
   * Get the user who performed this action.
   */
  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

  /**
   * Get action label.
   */
  public function getActionLabelAttribute(): string
  {
    $labels = [
      'created' => 'Created',
      'updated' => 'Updated',
      'submitted' => 'Submitted',
      'hod_approved' => 'HOD Approved',
      'hod_declined' => 'HOD Declined',
      'accountant_approved' => 'Accountant Approved',
      'accountant_declined' => 'Accountant Declined',
      'principal_approved' => 'Principal Approved',
      'principal_declined' => 'Principal Declined',
      'final_approved' => 'Final Approved',
      'final_declined' => 'Final Declined',
      'returned' => 'Returned',
      'cancelled' => 'Cancelled',
      'restored' => 'Restored',
      'commented' => 'Comment Added',
      'attachment_added' => 'Attachment Added',
      'attachment_removed' => 'Attachment Removed',
      'item_added' => 'Item Added',
      'item_removed' => 'Item Removed',
      'item_updated' => 'Item Updated',
      'budget_updated' => 'Budget Updated',
      'revised' => 'Revised',
      'revision_approved' => 'Revision Approved',
      'revision_rejected' => 'Revision Rejected',
      'escalated' => 'Escalated',
      'delegated' => 'Delegated',
    ];

    return $labels[$this->action] ?? ucfirst(str_replace('_', ' ', $this->action));
  }

  /**
   * Get action color.
   */
  public function getActionColorAttribute(): string
  {
    $colors = [
      'created' => 'success',
      'updated' => 'info',
      'submitted' => 'primary',
      'hod_approved' => 'success',
      'hod_declined' => 'danger',
      'accountant_approved' => 'success',
      'accountant_declined' => 'danger',
      'principal_approved' => 'success',
      'principal_declined' => 'danger',
      'final_approved' => 'success',
      'final_declined' => 'danger',
      'returned' => 'warning',
      'cancelled' => 'danger',
      'restored' => 'success',
      'commented' => 'info',
      'attachment_added' => 'primary',
      'attachment_removed' => 'danger',
      'item_added' => 'primary',
      'item_removed' => 'danger',
      'item_updated' => 'info',
      'budget_updated' => 'warning',
      'revised' => 'warning',
      'revision_approved' => 'success',
      'revision_rejected' => 'danger',
      'escalated' => 'danger',
      'delegated' => 'info',
    ];

    return $colors[$this->action] ?? 'secondary';
  }

  /**
   * Get formatted created at.
   */
  public function getFormattedCreatedAtAttribute(): string
  {
    return $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : '';
  }

  /**
   * Get user name.
   */
  public function getUserNameAttribute(): string
  {
    return $this->user ? $this->user->full_name : 'System';
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope by action.
   */
  public function scopeByAction($query, string $action)
  {
    return $query->where('action', $action);
  }

  /**
   * Scope by user.
   */
  public function scopeByUser($query, int $userId)
  {
    return $query->where('user_id', $userId);
  }

  /**
   * Scope by date range.
   */
  public function scopeDateRange($query, string $startDate, string $endDate)
  {
    return $query->whereBetween('created_at', [$startDate, $endDate]);
  }

  /**
   * Scope for revision history.
   */
  public function scopeRevisions($query)
  {
    return $query->whereIn('action', ['revised', 'revision_approved', 'revision_rejected']);
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Check if action is a status change.
   */
  public function isStatusChange(): bool
  {
    return in_array($this->action, [
      'submitted',
      'hod_approved',
      'hod_declined',
      'accountant_approved',
      'accountant_declined',
      'principal_approved',
      'principal_declined',
      'final_approved',
      'final_declined',
      'returned',
      'cancelled',
      'revised',
    ]);
  }

  /**
   * Get the status before change.
   */
  public function getOldStatus(): ?string
  {
    return $this->old_values['status'] ?? null;
  }

  /**
   * Get the status after change.
   */
  public function getNewStatus(): ?string
  {
    return $this->new_values['status'] ?? null;
  }
}
