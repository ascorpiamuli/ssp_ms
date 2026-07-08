<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'avatar',
    'date_of_birth',
    'gender',
    'address',
    'city',
    'state',
    'postal_code',
    'country',
    'bio',
    'preferences',
    'social_links',
  ];

  protected $casts = [
    'date_of_birth' => 'date',
    'preferences' => 'array',
    'social_links' => 'array',
  ];

  /**
   * Get the user that owns the profile.
   */
  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
