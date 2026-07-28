<?php
// app/Models/RequisitionNotification.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequisitionNotification extends Model
{
  use HasFactory;

  /**
   * The table associated with the model.
   *
   * @var string
   */
  protected $table = 'requisition_notifications';

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'user_id',
    'sent_by',
    'type',
    'channel',
    'subject',
    'message',
    'data',
    'sent_at',
    'read_at',
    'delivered_at',
    'is_read',
    'is_sent',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'data' => 'json',
    'sent_at' => 'datetime',
    'read_at' => 'datetime',
    'delivered_at' => 'datetime',
    'is_read' => 'boolean',
    'is_sent' => 'boolean',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'type_label',
    'type_color',
    'status_label',
    'status_color',
    'user_name',
    'formatted_created_at',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the requisition this notification belongs to.
   */
  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class);
  }

  /**
   * Get the user this notification is for.
   */
  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Get the user who sent this notification.
   */
  public function sentBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'sent_by');
  }

    // ============================================
    // ACCESSORS
    // ============================================

  /**
   * Get type label.
   */
  public function getTypeLabelAttribute(): string
  {
    $labels = [
      'submitted' => 'Submitted',
      'approved' => 'Approved',
      'declined' => 'Declined',
      'returned' => 'Returned',
      'reminder' => 'Reminder',
      'escalation' => 'Escalation',
      'comment' => 'Comment',
      'mention' => 'Mention',
      'status_change' => 'Status Change',
      'revision_requested' => 'Revision Requested',
      'revision_approved' => 'Revision Approved',
      'revision_rejected' => 'Revision Rejected',
      'delegated' => 'Delegated',
    ];

    return $labels[$this->type] ?? ucfirst(str_replace('_', ' ', $this->type));
  }

  /**
   * Get type color.
   */
  public function getTypeColorAttribute(): string
  {
    $colors = [
      'submitted' => 'primary',
      'approved' => 'success',
      'declined' => 'danger',
      'returned' => 'warning',
      'reminder' => 'info',
      'escalation' => 'danger',
      'comment' => 'secondary',
      'mention' => 'primary',
      'status_change' => 'info',
      'revision_requested' => 'warning',
      'revision_approved' => 'success',
      'revision_rejected' => 'danger',
      'delegated' => 'info',
    ];

    return $colors[$this->type] ?? 'secondary';
  }

  /**
   * Get status label.
   */
  public function getStatusLabelAttribute(): string
  {
    if ($this->is_read) {
      return 'Read';
    }
    if ($this->is_sent) {
      return 'Sent';
    }
    return 'Pending';
  }

  /**
   * Get status color.
   */
  public function getStatusColorAttribute(): string
  {
    if ($this->is_read) {
      return 'success';
    }
    if ($this->is_sent) {
      return 'info';
    }
    return 'warning';
  }

  /**
   * Get user name.
   */
  public function getUserNameAttribute(): string
  {
    return $this->user ? $this->user->full_name : 'Unknown User';
  }

  /**
   * Get formatted created at.
   */
  public function getFormattedCreatedAtAttribute(): string
  {
    return $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : '';
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for unread notifications.
   */
  public function scopeUnread($query)
  {
    return $query->where('is_read', false);
  }

  /**
   * Scope for read notifications.
   */
  public function scopeRead($query)
  {
    return $query->where('is_read', true);
  }

  /**
   * Scope for sent notifications.
   */
  public function scopeSent($query)
  {
    return $query->where('is_sent', true);
  }

  /**
   * Scope by type.
   */
  public function scopeByType($query, string $type)
  {
    return $query->where('type', $type);
  }

  /**
   * Scope by channel.
   */
  public function scopeByChannel($query, string $channel)
  {
    return $query->where('channel', 'like', "%{$channel}%");
  }

  /**
   * Scope for user.
   */
  public function scopeForUser($query, int $userId)
  {
    return $query->where('user_id', $userId);
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Mark notification as read.
   */
  public function markAsRead(): void
  {
    $this->update([
      'is_read' => true,
      'read_at' => now(),
    ]);
  }

  /**
   * Mark notification as sent.
   */
  public function markAsSent(): void
  {
    $this->update([
      'is_sent' => true,
      'sent_at' => now(),
    ]);
  }

  /**
   * Mark notification as delivered.
   */
  public function markAsDelivered(): void
  {
    $this->update([
      'delivered_at' => now(),
    ]);
  }

  /**
   * Check if notification is unread.
   */
  public function isUnread(): bool
  {
    return !$this->is_read;
  }

  /**
   * Check if notification is sent.
   */
  public function isSent(): bool
  {
    return $this->is_sent;
  }

  /**
   * Get notification data as array.
   */
  public function getData(): array
  {
    return is_array($this->data) ? $this->data : [];
  }
}
