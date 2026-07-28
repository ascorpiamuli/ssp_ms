<?php
// app/Models/RequisitionComment.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequisitionComment extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'user_id',
    'parent_id',
    'comment',
    'type',
    'mentions',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'mentions' => 'json',
    'metadata' => 'json',
    'deleted_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'type_label',
    'type_color',
    'user_name',
    'formatted_created_at',
    'is_edited',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the requisition this comment belongs to.
   */
  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class);
  }

  /**
   * Get the user who made this comment.
   */
  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Get the parent comment.
   */
  public function parent(): BelongsTo
  {
    return $this->belongsTo(RequisitionComment::class, 'parent_id');
  }

  /**
   * Get the child comments.
   */
  public function children(): HasMany
  {
    return $this->hasMany(RequisitionComment::class, 'parent_id')->orderBy('created_at');
  }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

  /**
   * Get type label.
   */
  public function getTypeLabelAttribute(): string
  {
    $labels = [
      'comment' => 'Comment',
      'question' => 'Question',
      'suggestion' => 'Suggestion',
      'clarification' => 'Clarification',
    ];

    return $labels[$this->type] ?? ucfirst($this->type);
  }

  /**
   * Get type color.
   */
  public function getTypeColorAttribute(): string
  {
    $colors = [
      'comment' => 'secondary',
      'question' => 'warning',
      'suggestion' => 'info',
      'clarification' => 'primary',
    ];

    return $colors[$this->type] ?? 'secondary';
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

  /**
   * Get is edited.
   */
  public function getIsEditedAttribute(): bool
  {
    return $this->created_at != $this->updated_at;
  }

  /**
   * Set comment.
   */
  public function setCommentAttribute(string $value): void
  {
    $this->attributes['comment'] = trim($value);
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for top-level comments.
   */
  public function scopeTopLevel($query)
  {
    return $query->whereNull('parent_id');
  }

  /**
   * Scope by type.
   */
  public function scopeByType($query, string $type)
  {
    return $query->where('type', $type);
  }

  /**
   * Scope by user.
   */
  public function scopeByUser($query, int $userId)
  {
    return $query->where('user_id', $userId);
  }

  /**
   * Scope mentioning a user.
   */
  public function scopeMentioningUser($query, int $userId)
  {
    return $query->whereJsonContains('mentions', $userId);
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Check if comment is a top-level comment.
   */
  public function isTopLevel(): bool
  {
    return $this->parent_id === null;
  }

  /**
   * Get mentioned users.
   */
  public function getMentionedUsers(): array
  {
    return is_array($this->mentions) ? $this->mentions : [];
  }

  /**
   * Check if comment mentions a user.
   */
  public function mentionsUser(int $userId): bool
  {
    return in_array($userId, $this->getMentionedUsers());
  }

  /**
   * Get comment thread.
   */
  public function getThread(): array
  {
    $thread = [$this];
    $current = $this;

    while ($current->parent) {
      array_unshift($thread, $current->parent);
      $current = $current->parent;
    }

    return $thread;
  }

  /**
   * Get all child comments recursively.
   */
  public function getAllChildren(): array
  {
    $children = [];

    foreach ($this->children as $child) {
      $children[] = $child;
      $children = array_merge($children, $child->getAllChildren());
    }

    return $children;
  }
}
