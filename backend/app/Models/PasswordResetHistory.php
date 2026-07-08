<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetHistory extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'ip_address',
    'user_agent',
    'requested_at',
    'completed_at',
    'is_successful',
    'failure_reason',
  ];

  protected $casts = [
    'requested_at' => 'datetime',
    'completed_at' => 'datetime',
    'is_successful' => 'boolean',
  ];

  /**
   * Get the user that owns the password reset history.
   */
  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
