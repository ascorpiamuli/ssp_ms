<?php
// app/Models/RequisitionBudget.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequisitionBudget extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'verified_by',
    'authorized_by',
    'budget_code',
    'budget_line_item',
    'budget_category',
    'budget_type',
    'project_id',
    'grant_code',
    'allocated_amount',
    'utilized_amount',
    'remaining_amount',
    'requested_amount',
    'fiscal_year',
    'fiscal_quarter',
    'budget_start_date',
    'budget_end_date',
    'is_transferred',
    'transferred_at',
    'transferred_from',
    'transferred_to',
    'is_carry_over',
    'carry_over_amount',
    'variance_amount',
    'variance_percentage',
    'variance_reason',
    'status',
    'verified_at',
    'verification_notes',
    'authorized_at',
    'authorization_notes',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'allocated_amount' => 'decimal:2',
    'utilized_amount' => 'decimal:2',
    'remaining_amount' => 'decimal:2',
    'requested_amount' => 'decimal:2',
    'carry_over_amount' => 'decimal:2',
    'variance_amount' => 'decimal:2',
    'variance_percentage' => 'decimal:2',
    'budget_start_date' => 'date',
    'budget_end_date' => 'date',
    'transferred_at' => 'datetime',
    'verified_at' => 'datetime',
    'authorized_at' => 'datetime',
    'is_transferred' => 'boolean',
    'is_carry_over' => 'boolean',
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
    'budget_type_label',
    'formatted_allocated_amount',
    'formatted_utilized_amount',
    'formatted_remaining_amount',
    'formatted_requested_amount',
    'utilization_percentage',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the requisition this budget belongs to.
   */
  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class);
  }

  /**
   * Get the verifier.
   */
  public function verifiedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'verified_by');
  }

  /**
   * Get the authorizer.
   */
  public function authorizedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'authorized_by');
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
      'verified' => 'Verified',
      'approved' => 'Approved',
      'rejected' => 'Rejected',
      'exhausted' => 'Exhausted',
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
      'verified' => 'info',
      'approved' => 'success',
      'rejected' => 'danger',
      'exhausted' => 'danger',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  /**
   * Get budget type label.
   */
  public function getBudgetTypeLabelAttribute(): string
  {
    $labels = [
      'capital' => 'Capital',
      'recurrent' => 'Recurrent',
      'emergency' => 'Emergency',
      'project' => 'Project',
    ];

    return $labels[$this->budget_type] ?? ucfirst($this->budget_type);
  }

  /**
   * Get formatted allocated amount.
   */
  public function getFormattedAllocatedAmountAttribute(): string
  {
    return number_format($this->allocated_amount, 2);
  }

  /**
   * Get formatted utilized amount.
   */
  public function getFormattedUtilizedAmountAttribute(): string
  {
    return number_format($this->utilized_amount, 2);
  }

  /**
   * Get formatted remaining amount.
   */
  public function getFormattedRemainingAmountAttribute(): string
  {
    return number_format($this->remaining_amount, 2);
  }

  /**
   * Get formatted requested amount.
   */
  public function getFormattedRequestedAmountAttribute(): string
  {
    return number_format($this->requested_amount, 2);
  }

  /**
   * Get utilization percentage.
   */
  public function getUtilizationPercentageAttribute(): float
  {
    if ($this->allocated_amount <= 0) {
      return 0;
    }
    return round(($this->utilized_amount / $this->allocated_amount) * 100, 2);
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for pending budgets.
   */
  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  /**
   * Scope for verified budgets.
   */
  public function scopeVerified($query)
  {
    return $query->where('status', 'verified');
  }

  /**
   * Scope for approved budgets.
   */
  public function scopeApproved($query)
  {
    return $query->where('status', 'approved');
  }

  /**
   * Scope by budget code.
   */
  public function scopeByBudgetCode($query, string $budgetCode)
  {
    return $query->where('budget_code', $budgetCode);
  }

  /**
   * Scope by fiscal year.
   */
  public function scopeByFiscalYear($query, string $fiscalYear)
  {
    return $query->where('fiscal_year', $fiscalYear);
  }

  /**
   * Scope by budget type.
   */
  public function scopeByBudgetType($query, string $budgetType)
  {
    return $query->where('budget_type', $budgetType);
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Check if budget is exhausted.
   */
  public function isExhausted(): bool
  {
    return $this->status === 'exhausted';
  }

  /**
   * Check if budget has sufficient funds.
   */
  public function hasSufficientFunds(float $amount): bool
  {
    return $this->remaining_amount >= $amount;
  }

  /**
   * Calculate remaining amount.
   */
  public function calculateRemainingAmount(): float
  {
    return (float) $this->allocated_amount - (float) $this->utilized_amount;
  }

  /**
   * Update remaining amount.
   */
  public function updateRemainingAmount(): void
  {
    $this->update([
      'remaining_amount' => $this->calculateRemainingAmount(),
    ]);
  }

  /**
   * Verify the budget.
   */
  public function verify(int $userId, ?string $notes = null): void
  {
    $this->update([
      'status' => 'verified',
      'verified_by' => $userId,
      'verified_at' => now(),
      'verification_notes' => $notes,
    ]);
  }

  /**
   * Approve the budget.
   */
  public function approve(int $userId, ?string $notes = null): void
  {
    $this->update([
      'status' => 'approved',
      'authorized_by' => $userId,
      'authorized_at' => now(),
      'authorization_notes' => $notes,
    ]);
  }

  /**
   * Reject the budget.
   */
  public function reject(?string $reason = null): void
  {
    $this->update([
      'status' => 'rejected',
      'verification_notes' => $reason,
    ]);
  }

  /**
   * Mark budget as exhausted.
   */
  public function markAsExhausted(): void
  {
    $this->update([
      'status' => 'exhausted',
    ]);
  }
}
