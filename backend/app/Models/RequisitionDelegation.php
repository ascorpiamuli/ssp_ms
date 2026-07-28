<?php
// app/Models/RequisitionDelegation.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequisitionDelegation extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'approver_id',
    'delegate_id',
    'department_id',
    'created_by',
    'level',
    'start_date',
    'end_date',
    'reason',
    'is_active',
    'is_permanent',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'start_date' => 'date',
    'end_date' => 'date',
    'is_active' => 'boolean',
    'is_permanent' => 'boolean',
    'metadata' => 'json',
    'created_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'level_label',
    'level_color',
    'status_label',
    'status_color',
    'is_active_label',
    'is_permanent_label',
    'approver_name',
    'delegate_name',
    'department_name',
    'formatted_start_date',
    'formatted_end_date',
    'is_expired',
    'is_upcoming',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

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
   * Get the department.
   */
  public function department(): BelongsTo
  {
    return $this->belongsTo(Department::class);
  }

  /**
   * Get the user who created this delegation.
   */
  public function createdBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'created_by');
  }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

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
   * Get status label.
   */
  public function getStatusLabelAttribute(): string
  {
    if (!$this->is_active) {
      return 'Inactive';
    }
    if ($this->isExpired()) {
      return 'Expired';
    }
    if ($this->isUpcoming()) {
      return 'Upcoming';
    }
    return 'Active';
  }

  /**
   * Get status color.
   */
  public function getStatusColorAttribute(): string
  {
    if (!$this->is_active) {
      return 'danger';
    }
    if ($this->isExpired()) {
      return 'danger';
    }
    if ($this->isUpcoming()) {
      return 'warning';
    }
    return 'success';
  }

  /**
   * Get is active label.
   */
  public function getIsActiveLabelAttribute(): string
  {
    return $this->is_active ? 'Yes' : 'No';
  }

  /**
   * Get is permanent label.
   */
  public function getIsPermanentLabelAttribute(): string
  {
    return $this->is_permanent ? 'Yes' : 'No';
  }

  /**
   * Get approver name.
   */
  public function getApproverNameAttribute(): string
  {
    return $this->approver ? $this->approver->full_name : 'Unknown';
  }

  /**
   * Get delegate name.
   */
  public function getDelegateNameAttribute(): string
  {
    return $this->delegate ? $this->delegate->full_name : 'Unknown';
  }

  /**
   * Get department name.
   */
  public function getDepartmentNameAttribute(): string
  {
    return $this->department ? $this->department->name : 'Unknown';
  }

  /**
   * Get formatted start date.
   */
  public function getFormattedStartDateAttribute(): string
  {
    return $this->start_date ? $this->start_date->format('Y-m-d') : '';
  }

  /**
   * Get formatted end date.
   */
  public function getFormattedEndDateAttribute(): string
  {
    return $this->end_date ? $this->end_date->format('Y-m-d') : '';
  }

  /**
   * Check if delegation is expired.
   */
  public function getIsExpiredAttribute(): bool
  {
    if ($this->is_permanent) {
      return false;
    }
    return $this->end_date && $this->end_date->isPast();
  }

  /**
   * Check if delegation is upcoming.
   */
  public function getIsUpcomingAttribute(): bool
  {
    return $this->start_date && $this->start_date->isFuture();
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for active delegations.
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true)
      ->where(function ($q) {
        $q->where('is_permanent', true)
          ->orWhereDate('end_date', '>=', now());
      });
  }

  /**
   * Scope for current delegations.
   */
  public function scopeCurrent($query)
  {
    return $query->where('is_active', true)
      ->where(function ($q) {
        $q->where('is_permanent', true)
          ->orWhere(function ($q2) {
            $q2->whereDate('start_date', '<=', now())
              ->whereDate('end_date', '>=', now());
          });
      });
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
   * Scope by department.
   */
  public function scopeByDepartment($query, int $departmentId)
  {
    return $query->where('department_id', $departmentId);
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Check if delegation is active.
   */
  public function isActive(): bool
  {
    return $this->is_active && !$this->isExpired();
  }

  /**
   * Check if delegation is expired.
   */
  public function isExpired(): bool
  {
    if ($this->is_permanent) {
      return false;
    }
    return $this->end_date && $this->end_date->isPast();
  }

  /**
   * Check if delegation is upcoming.
   */
  public function isUpcoming(): bool
  {
    return $this->start_date && $this->start_date->isFuture();
  }

  /**
   * Check if delegation is currently active.
   */
  public function isCurrentlyActive(): bool
  {
    if (!$this->is_active) {
      return false;
    }

    if ($this->is_permanent) {
      return true;
    }

    $now = now();
    return $this->start_date <= $now && $this->end_date >= $now;
  }

  /**
   * Activate the delegation.
   */
  public function activate(): void
  {
    $this->update(['is_active' => true]);
  }

  /**
   * Deactivate the delegation.
   */
  public function deactivate(): void
  {
    $this->update(['is_active' => false]);
  }

  /**
   * Extend the delegation.
   */
  public function extend(int $days): void
  {
    if (!$this->is_permanent) {
      $this->update([
        'end_date' => $this->end_date->addDays($days),
      ]);
    }
  }

  /**
   * Get active delegation for approver and level.
   */
  public static function getActiveDelegation(int $approverId, string $level): ?self
  {
    return self::active()
      ->byApprover($approverId)
      ->byLevel($level)
      ->first();
  }

  /**
   * Check if user is a delegate for approver.
   */
  public static function isDelegate(int $approverId, int $delegateId): bool
  {
    return self::active()
      ->byApprover($approverId)
      ->byDelegate($delegateId)
      ->exists();
  }
}
