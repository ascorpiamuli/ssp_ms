<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'company_name',
    'company_email',
    'company_phone',
    'company_registration',
    'company_address',
    'company_website',
    'tax_id',
    'category',
    'status',
    'blacklist_reason',
    'blacklisted_by',
    'blacklisted_at',
    'created_by',
  ];

  protected $casts = [
    'blacklisted_at' => 'datetime',
    'category' => 'string',
    'status' => 'string',
  ];

  /**
   * Get the user that owns the supplier account.
   */
  public function user()
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Get the user who created this supplier.
   */
  public function creator()
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  /**
   * Get the user who blacklisted this supplier.
   */
  public function blacklistedBy()
  {
    return $this->belongsTo(User::class, 'blacklisted_by');
  }

  /**
   * Scope for active suppliers.
   */
  public function scopeActive($query)
  {
    return $query->where('status', 'ACTIVE');
  }

  /**
   * Scope for blacklisted suppliers.
   */
  public function scopeBlacklisted($query)
  {
    return $query->where('status', 'BLACKLISTED');
  }

  /**
   * Check if supplier is active.
   */
  public function isActive(): bool
  {
    return $this->status === 'ACTIVE';
  }

  /**
   * Check if supplier is blacklisted.
   */
  public function isBlacklisted(): bool
  {
    return $this->status === 'BLACKLISTED';
  }
}
