<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TwoFactorAuthentication extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'secret_key',
    'recovery_codes',
    'is_enabled',
    'confirmed_at',
  ];

  protected $casts = [
    'recovery_codes' => 'array',
    'is_enabled' => 'boolean',
    'confirmed_at' => 'datetime',
  ];

  /**
   * Get the user that owns the 2FA.
   */
  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
