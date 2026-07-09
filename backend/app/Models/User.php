<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Notifications\CustomResetPasswordNotification; // Add this
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable
{
  use HasApiTokens, HasFactory, Notifiable, HasRoles;

  /**
   * The attributes that are mass assignable.
   */
  protected $fillable = [
    'first_name',
    'last_name',
    'email',
    'password',
    'phone',
    'department_id',
    'is_active',
    'is_approved',
    'approved_at',
    'approved_by',
    'rejection_reason',
    'last_login_at',
    'timezone',
  ];

  /**
   * The attributes that should be hidden for serialization.
   */
  protected $hidden = [
    'password',
    'remember_token',
  ];

  /**
   * Get the attributes that should be cast.
   */
  protected function casts(): array
  {
    return [
      'email_verified_at' => 'datetime',
      'approved_at' => 'datetime',
      'last_login_at' => 'datetime',
      'is_active' => 'boolean',
      'is_approved' => 'boolean',
    ];
  }

  /**
   * Get the user's full name.
   */
  public function getFullNameAttribute(): string
  {
    return $this->first_name . ' ' . $this->last_name;
  }

  /**
   * Get the user's initials.
   */
  public function getInitialsAttribute(): string
  {
    return strtoupper($this->first_name[0] . $this->last_name[0]);
  }

  // ============================================
  // RELATIONSHIPS
  // ============================================

  /**
   * Department relationship.
   */
  public function department()
  {
    return $this->belongsTo(Department::class);
  }

  /**
   * User profile relationship.
   */
  public function profile()
  {
    return $this->hasOne(UserProfile::class);
  }

  /**
   * Users approved by this user.
   */
  public function approvedUsers()
  {
    return $this->hasMany(User::class, 'approved_by');
  }

  /**
   * User who approved this user.
   */
  public function approvedBy()
  {
    return $this->belongsTo(User::class, 'approved_by');
  }

  /**
   * User sessions.
   */
  public function sessions()
  {
    return $this->hasMany(UserSession::class);
  }

  /**
   * Activity logs.
   */
  public function activityLogs()
  {
    return $this->hasMany(UserActivityLog::class);
  }

  /**
   * Password reset history.
   */
  public function passwordResetHistory()
  {
    return $this->hasMany(PasswordResetHistory::class);
  }

  /**
   * Two factor authentication.
   */
  public function twoFactorAuth()
  {
    return $this->hasOne(TwoFactorAuthentication::class);
  }

  // ============================================
  // SCOPES
  // ============================================

  /**
   * Scope for active users.
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  /**
   * Scope for approved users.
   */
  public function scopeApproved($query)
  {
    return $query->where('is_approved', true);
  }

  /**
   * Scope for pending approval.
   */
  public function scopePending($query)
  {
    return $query->where('is_approved', false)->where('is_active', true);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Check if user is a specific role.
   */
  public function isRole(string $role): bool
  {
    return $this->role === $role;
  }

  /**
   * Check if user is an admin.
   */
  public function isAdmin(): bool
  {
    return $this->hasRole('ADMIN');
  }

  /**
   * Check if user is active and approved.
   */
  public function isActiveAndApproved(): bool
  {
    return $this->is_active && $this->is_approved;
  }

  /**
   * Check if user can login.
   */
  public function canLogin(): bool
  {
    return $this->is_active && $this->is_approved;
  }

  // ============================================
  // PASSWORD RESET NOTIFICATION - ADD THIS
  // ============================================

  /**
   * Send the password reset notification.
   * Overrides the default Laravel notification to use custom URL.
   *
   * @param  string  $token
   * @return void
   */
  public function sendPasswordResetNotification($token)
  {
    $this->notify(new ResetPasswordNotification($token));
  }
}
