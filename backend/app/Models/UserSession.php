<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSession extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'session_id',
    'ip_address',
    'user_agent',
    'last_activity',
    'is_active',
  ];

  protected $casts = [
    'last_activity' => 'datetime',
    'is_active' => 'boolean',
  ];

  /**
   * Get the user that owns the session.
   */
  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
