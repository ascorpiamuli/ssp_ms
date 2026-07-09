<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PasswordResetHistory extends Model
{
  protected $fillable = [
    'user_id',
    'email', // Add this
    'ip_address',
    'user_agent',
    'requested_at',
    'is_successful',
    'error_message',
    'completed_at',
  ];

  protected $casts = [
    'requested_at' => 'datetime',
    'completed_at' => 'datetime',
    'is_successful' => 'boolean',
  ];

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }
}
