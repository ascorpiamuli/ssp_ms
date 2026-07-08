<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
  use HasFactory;

  protected $fillable = [
    'name',
    'code',
    'description',
    'hod_id',
    'is_active',
  ];

  protected $casts = [
    'is_active' => 'boolean',
  ];

  /**
   * Get the Head of Department user.
   */
  public function hod()
  {
    return $this->belongsTo(User::class, 'hod_id');
  }

  /**
   * Get all users in this department.
   */
  public function users()
  {
    return $this->hasMany(User::class);
  }

  /**
   * Scope for active departments.
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }
}
