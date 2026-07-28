<?php
// app/Models/ApprovalWorkflow.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalWorkflow extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'department_id',
    'created_by',
    'updated_by',
    'name',
    'description',
    'approval_levels',
    'rules',
    'conditions',
    'is_active',
    'is_default',
    'min_amount',
    'max_amount',
    'threshold_level_1',
    'threshold_level_2',
    'threshold_level_3',
    'required_approvals',
    'require_all_approvals',
    'allow_delegation',
    'allow_parallel_approvals',
    'require_sequential',
    'max_approvers',
    'sla_hours',
    'reminder_hours',
    'escalation_hours',
    'allow_override',
    'allow_reassignment',
    'allow_skip',
    'allow_revision',
    'max_revisions',
    'require_justification_for_revision',
    'auto_approve_after_revision',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'approval_levels' => 'json',
    'rules' => 'json',
    'conditions' => 'json',
    'min_amount' => 'decimal:2',
    'max_amount' => 'decimal:2',
    'threshold_level_1' => 'decimal:2',
    'threshold_level_2' => 'decimal:2',
    'threshold_level_3' => 'decimal:2',
    'is_active' => 'boolean',
    'is_default' => 'boolean',
    'require_all_approvals' => 'boolean',
    'allow_delegation' => 'boolean',
    'allow_parallel_approvals' => 'boolean',
    'require_sequential' => 'boolean',
    'allow_override' => 'boolean',
    'allow_reassignment' => 'boolean',
    'allow_skip' => 'boolean',
    'allow_revision' => 'boolean',
    'require_justification_for_revision' => 'boolean',
    'auto_approve_after_revision' => 'boolean',
    'required_approvals' => 'integer',
    'max_approvers' => 'integer',
    'sla_hours' => 'integer',
    'reminder_hours' => 'integer',
    'escalation_hours' => 'integer',
    'max_revisions' => 'integer',
    'deleted_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'is_default_label',
    'status_label',
    'status_color',
    'approval_levels_count',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the department this workflow belongs to.
   */
  public function department(): BelongsTo
  {
    return $this->belongsTo(Department::class);
  }

  /**
   * Get the user who created this workflow.
   */
  public function createdBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  /**
   * Get the user who last updated this workflow.
   */
  public function updatedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'updated_by');
  }

  /**
   * Get the approvals using this workflow.
   */
  public function approvals(): HasMany
  {
    return $this->hasMany(Approval::class);
  }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

  /**
   * Get is default label.
   */
  public function getIsDefaultLabelAttribute(): string
  {
    return $this->is_default ? 'Yes' : 'No';
  }

  /**
   * Get status label.
   */
  public function getStatusLabelAttribute(): string
  {
    return $this->is_active ? 'Active' : 'Inactive';
  }

  /**
   * Get status color.
   */
  public function getStatusColorAttribute(): string
  {
    return $this->is_active ? 'success' : 'danger';
  }

  /**
   * Get approval levels count.
   */
  public function getApprovalLevelsCountAttribute(): int
  {
    return is_array($this->approval_levels) ? count($this->approval_levels) : 0;
  }

  /**
   * Set approval levels.
   */
  public function setApprovalLevelsAttribute(array $value): void
  {
    $this->attributes['approval_levels'] = json_encode($value);
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for active workflows.
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  /**
   * Scope for default workflows.
   */
  public function scopeDefault($query)
  {
    return $query->where('is_default', true);
  }

  /**
   * Scope by department.
   */
  public function scopeByDepartment($query, int $departmentId)
  {
    return $query->where('department_id', $departmentId);
  }

  /**
   * Scope by amount range.
   */
  public function scopeByAmount($query, float $amount)
  {
    return $query->where('min_amount', '<=', $amount)
      ->where(function ($q) use ($amount) {
        $q->where('max_amount', '>=', $amount)
          ->orWhereNull('max_amount');
      });
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Get approval level by order.
   */
  public function getApprovalLevelByOrder(int $order): ?array
  {
    $levels = $this->approval_levels ?? [];

    foreach ($levels as $level) {
      if (($level['order'] ?? 0) === $order) {
        return $level;
      }
    }

    return null;
  }

  /**
   * Get next approval level.
   */
  public function getNextApprovalLevel(int $currentOrder): ?array
  {
    $levels = $this->approval_levels ?? [];
    $nextOrder = $currentOrder + 1;

    foreach ($levels as $level) {
      if (($level['order'] ?? 0) === $nextOrder) {
        return $level;
      }
    }

    return null;
  }

  /**
   * Check if workflow requires approval at level.
   */
  public function requiresApproval(string $level): bool
  {
    $levels = $this->approval_levels ?? [];

    foreach ($levels as $approvalLevel) {
      if (($approvalLevel['level'] ?? '') === $level && ($approvalLevel['required'] ?? true)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get approver for level.
   */
  public function getApproverForLevel(string $level): ?int
  {
    $levels = $this->approval_levels ?? [];

    foreach ($levels as $approvalLevel) {
      if (($approvalLevel['level'] ?? '') === $level) {
        return $approvalLevel['approver_id'] ?? null;
      }
    }

    return null;
  }
}
