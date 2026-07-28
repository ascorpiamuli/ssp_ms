<?php
// app/Models/RequisitionTemplate.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequisitionTemplate extends Model
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
    'name',
    'description',
    'items',
    'metadata',
    'is_active',
    'is_public',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'items' => 'json',
    'metadata' => 'json',
    'is_active' => 'boolean',
    'is_public' => 'boolean',
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
    'visibility_label',
    'items_count',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the department this template belongs to.
   */
  public function department(): BelongsTo
  {
    return $this->belongsTo(Department::class);
  }

  /**
   * Get the user who created this template.
   */
  public function createdBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'created_by');
  }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

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
   * Get visibility label.
   */
  public function getVisibilityLabelAttribute(): string
  {
    return $this->is_public ? 'Public' : 'Private';
  }

  /**
   * Get items count.
   */
  public function getItemsCountAttribute(): int
  {
    return is_array($this->items) ? count($this->items) : 0;
  }

  /**
   * Set items.
   */
  public function setItemsAttribute(array $value): void
  {
    $this->attributes['items'] = json_encode($value);
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for active templates.
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  /**
   * Scope for public templates.
   */
  public function scopePublic($query)
  {
    return $query->where('is_public', true);
  }

  /**
   * Scope by department.
   */
  public function scopeByDepartment($query, int $departmentId)
  {
    return $query->where('department_id', $departmentId);
  }

  /**
   * Scope for search.
   */
  public function scopeSearch($query, string $search)
  {
    return $query->where('name', 'like', "%{$search}%")
      ->orWhere('description', 'like', "%{$search}%");
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Create a requisition from this template.
   */
  public function createRequisition(array $data): Requisition
  {
    $requisition = Requisition::create(array_merge($data, [
      'user_id' => auth()->id(),
      'department_id' => $this->department_id,
    ]));

    foreach ($this->items as $item) {
      $requisition->items()->create($item);
    }

    return $requisition;
  }
}
