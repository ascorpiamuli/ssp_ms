<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserActivityLog extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'action',
    'module',
    'description',
    'data',
    'ip_address',
    'user_agent',
  ];

  protected $casts = [
    'data' => 'array',
  ];

  /**
   * Get the user that owns the activity log.
   */
  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
