<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Notifications\CustomResetPasswordNotification;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
  use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

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
    'avatar',
    'id_number',
    'date_of_birth',
    'profile_photo',
    'avatar_upload_id',
  ];

  /**
   * The attributes that should be hidden for serialization.
   */
  protected $hidden = [
    'password',
    'remember_token',
  ];

  /**
   * The accessors to append to the model's array form.
   */
  protected $appends = [
    'full_name',
    'initials',
    'role_label',
    'role_display_name',
    'role_info',
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

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

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

  /**
   * Get the user's avatar URL.
   */
  public function getAvatarUrlAttribute(): ?string
  {
    return $this->avatar ?? null;
  }

    // ============================================
    // ROLE HELPERS (Using Spatie Permission)
    // ============================================

  /**
   * Get the user's primary role.
   */
  public function getPrimaryRole()
  {
    return $this->roles()->first();
  }

  /**
   * Get the role label (human-readable name).
   */
  public function getRoleLabelAttribute(): ?string
  {
    $role = $this->getPrimaryRole();
    if (!$role) {
      return null;
    }
    return $role->label ?? ucfirst(str_replace('_', ' ', $role->name));
  }

  /**
   * Get the role display name (with fallback to formatted name).
   */
  public function getRoleDisplayNameAttribute(): ?string
  {
    $role = $this->getPrimaryRole();
    if (!$role) {
      return 'No Role Assigned';
    }
    return $role->label ?? ucfirst(str_replace('_', ' ', $role->name));
  }

  /**
   * Get the role description.
   */
  public function getRoleDescriptionAttribute(): ?string
  {
    $role = $this->getPrimaryRole();
    if (!$role) {
      return null;
    }
    return $role->description;
  }

  /**
   * Get complete role information.
   */
  public function getRoleInfoAttribute(): ?array
  {
    $role = $this->getPrimaryRole();
    if (!$role) {
      return null;
    }

    return [
      'id' => $role->id,
      'name' => $role->name,
      'label' => $role->label ?? ucfirst(str_replace('_', ' ', $role->name)),
      'description' => $role->description,
      'guard_name' => $role->guard_name,
    ];
  }

  /**
   * Get all roles with their labels and descriptions.
   */
  public function getAllRolesWithLabels(): array
  {
    $roles = $this->roles()->get();
    return $roles->map(function ($role) {
      return [
        'id' => $role->id,
        'name' => $role->name,
        'label' => $role->label ?? ucfirst(str_replace('_', ' ', $role->name)),
        'description' => $role->description,
      ];
    })->toArray();
  }

  /**
   * Check if user has a specific role by name or label (case-insensitive).
   */
  public function hasRoleByNameOrLabel(string $roleNameOrLabel): bool
  {
    $roleNameOrLabel = strtolower($roleNameOrLabel);

    return $this->roles()
      ->whereRaw('LOWER(name) = ?', [$roleNameOrLabel])
      ->orWhereRaw('LOWER(label) = ?', [$roleNameOrLabel])
      ->exists();
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

  /**
   * Avatar upload relationship.
   */
  public function avatarUpload()
  {
    return $this->belongsTo(Upload::class, 'avatar_upload_id');
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

  /**
   * Scope for users with a specific role (case-insensitive).
   */
  public function scopeWithRole($query, string $roleName)
  {
    $roleName = strtolower($roleName);
    return $query->whereHas('roles', function ($q) use ($roleName) {
      $q->whereRaw('LOWER(name) = ?', [$roleName]);
    });
  }

  /**
   * Scope for users with a specific role label (case-insensitive).
   */
  public function scopeWithRoleLabel($query, string $roleLabel)
  {
    $roleLabel = strtolower($roleLabel);
    return $query->whereHas('roles', function ($q) use ($roleLabel) {
      $q->whereRaw('LOWER(label) = ?', [$roleLabel]);
    });
  }

    // ============================================
    // ROLE CHECK METHODS (CASE-INSENSITIVE)
    // ============================================

  /**
   * Check if user is a specific role (by name or label) - case-insensitive.
   */
  public function isRole(string $roleNameOrLabel): bool
  {
    return $this->hasRoleByNameOrLabel($roleNameOrLabel);
  }

  /**
   * Check if user is an admin.
   * Handles: 'ADMIN', 'admin', 'Admin', 'super_admin', 'SUPER_ADMIN'
   */
  public function isAdmin(): bool
  {
    $roleNames = ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN', 'Admin', 'Super_Admin'];

    foreach ($roleNames as $role) {
      if ($this->hasRole($role) || $this->hasRole($role, 'web') || $this->hasRole($role, 'api')) {
        return true;
      }
    }

    // Check by label
    return $this->roles()
      ->whereRaw('LOWER(label) LIKE ?', ['%admin%'])
      ->exists();
  }

  /**
   * Check if user is a super admin.
   */
  public function isSuperAdmin(): bool
  {
    $roleNames = ['super_admin', 'SUPER_ADMIN', 'Super_Admin'];

    foreach ($roleNames as $role) {
      if ($this->hasRole($role) || $this->hasRole($role, 'web') || $this->hasRole($role, 'api')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user is a department head.
   * Handles: 'HOD', 'hod', 'Head of Department'
   */
  public function isHOD(): bool
  {
    // Check by exact role names
    $roleNames = ['hod', 'HOD', 'Head of Department'];

    foreach ($roleNames as $role) {
      if ($this->hasRole($role) || $this->hasRole($role, 'web') || $this->hasRole($role, 'api')) {
        return true;
      }
    }

    // Check by label
    return $this->roles()
      ->whereRaw('LOWER(label) LIKE ?', ['%head of department%'])
      ->orWhereRaw('LOWER(label) LIKE ?', ['%hod%'])
      ->exists();
  }

  /**
   * Check if user is an accountant.
   * Handles: 'ACCOUNTANT', 'accountant', 'Accountant', 'Accountant/Finance'
   */
  public function isAccountant(): bool
  {
    // Check by exact role names
    $roleNames = ['accountant', 'ACCOUNTANT', 'Accountant'];

    foreach ($roleNames as $role) {
      if ($this->hasRole($role) || $this->hasRole($role, 'web') || $this->hasRole($role, 'api')) {
        return true;
      }
    }

    // Check by label
    return $this->roles()
      ->whereRaw('LOWER(label) LIKE ?', ['%accountant%'])
      ->orWhereRaw('LOWER(label) LIKE ?', ['%finance%'])
      ->exists();
  }

  /**
   * Check if user is a principal.
   * Handles: 'HEAD OF INSTITUTION', 'head of institution', 'principal', 'PRINCIPAL'
   */
  public function isPrincipal(): bool
  {
    // Check by exact role names
    $roleNames = [
      'head of institution',
      'HEAD OF INSTITUTION',
      'principal',
      'PRINCIPAL',
      'Head of Institution'
    ];

    foreach ($roleNames as $role) {
      if ($this->hasRole($role) || $this->hasRole($role, 'web') || $this->hasRole($role, 'api')) {
        return true;
      }
    }

    // Check by label
    return $this->roles()
      ->whereRaw('LOWER(label) LIKE ?', ['%head of institution%'])
      ->orWhereRaw('LOWER(label) LIKE ?', ['%principal%'])
      ->exists();
  }

  /**
   * Check if user is a final approver (Director/Finance Administrator).
   * Handles: 'FINAL_APPROVER', 'final_approver', 'Director', 'Finance Administrator'
   */
  public function isFinalApprover(): bool
  {
    // Check by exact role names
    $roleNames = [
      'final_approver',
      'FINAL_APPROVER',
      'Final_Approver',
    ];

    foreach ($roleNames as $role) {
      if ($this->hasRole($role) || $this->hasRole($role, 'web') || $this->hasRole($role, 'api')) {
        return true;
      }
    }

    // Check by label
    return $this->roles()
      ->whereRaw('LOWER(label) LIKE ?', ['%director%'])
      ->orWhereRaw('LOWER(label) LIKE ?', ['%finance administrator%'])
      ->orWhereRaw('LOWER(label) LIKE ?', ['%final approver%'])
      ->exists();
  }

  /**
   * Check if user is a staff member.
   * Staff = has no specific role or has basic staff role
   */
  public function isStaff(): bool
  {
    // If user has any of the admin/procurement/management roles, they're not staff
    if (
      $this->isAdmin() || $this->isHOD() || $this->isAccountant() ||
      $this->isPrincipal() || $this->isFinalApprover() || $this->isProcurement() ||
      $this->isAuditor() || $this->isSupplier()
    ) {
      return false;
    }

    // User has roles but none of the above - treat as staff
    return $this->roles()->exists();
  }

  /**
   * Check if user is a supplier.
   * Handles: 'SUPPLIER', 'supplier', 'Supplier/Vendor'
   */
  public function isSupplier(): bool
  {
    $roleNames = ['supplier', 'SUPPLIER', 'Supplier', 'vendor', 'VENDOR'];

    foreach ($roleNames as $role) {
      if ($this->hasRole($role) || $this->hasRole($role, 'web') || $this->hasRole($role, 'api')) {
        return true;
      }
    }

    return $this->roles()
      ->whereRaw('LOWER(label) LIKE ?', ['%supplier%'])
      ->orWhereRaw('LOWER(label) LIKE ?', ['%vendor%'])
      ->exists();
  }

  /**
   * Check if user is an auditor.
   * Handles: 'AUDITOR', 'auditor', 'Auditorial Staff Officer'
   */
  public function isAuditor(): bool
  {
    $roleNames = ['auditor', 'AUDITOR', 'Auditor'];

    foreach ($roleNames as $role) {
      if ($this->hasRole($role) || $this->hasRole($role, 'web') || $this->hasRole($role, 'api')) {
        return true;
      }
    }

    return $this->roles()
      ->whereRaw('LOWER(label) LIKE ?', ['%auditor%'])
      ->exists();
  }

  /**
   * Check if user is a procurement officer.
   * Handles: 'PROCUREMENT', 'procurement', 'Procurement Officer'
   */
  public function isProcurement(): bool
  {
    $roleNames = ['procurement', 'PROCUREMENT', 'Procurement', 'procurement_officer', 'PROCUREMENT_OFFICER'];

    foreach ($roleNames as $role) {
      if ($this->hasRole($role) || $this->hasRole($role, 'web') || $this->hasRole($role, 'api')) {
        return true;
      }
    }

    return $this->roles()
      ->whereRaw('LOWER(label) LIKE ?', ['%procurement%'])
      ->exists();
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
    // PASSWORD RESET NOTIFICATION
    // ============================================

  /**
   * Send the password reset notification.
   */
  public function sendPasswordResetNotification($token)
  {
    $this->notify(new ResetPasswordNotification($token));
  }



      // ============================================
    // SIGNATURE RELATIONSHIPS
    // ============================================

  /**
   * Get the user's verified signature specimen
   */
  public function signatureSpecimen(): HasOne
  {
    return $this->hasOne(SignatureSpecimen::class)
      ->where('is_verified', true)
      ->where('status', 'approved');
  }

  /**
   * Get all signature specimens for this user
   */
  public function signatureSpecimens(): HasMany
  {
    return $this->hasMany(SignatureSpecimen::class);
  }

  /**
   * Get signatures verified by this user
   */
  public function verifiedSignatures(): HasMany
  {
    return $this->hasMany(SignatureSpecimen::class, 'verified_by');
  }

  /**
   * Get all signature verifications for this user
   */
  public function signatureVerifications(): HasMany
  {
    return $this->hasMany(SignatureVerification::class);
  }

  /**
   * Get verifications performed by this user
   */
  public function performedVerifications(): HasMany
  {
    return $this->hasMany(SignatureVerification::class, 'verified_by');
  }

    // ============================================
    // SIGNATURE HELPER METHODS
    // ============================================

  /**
   * Check if user has a verified signature
   */
  public function hasVerifiedSignature(): bool
  {
    return $this->signatureSpecimen()->exists();
  }

  /**
   * Get the user's signature URL
   */
  public function getSignatureUrlAttribute(): ?string
  {
    return $this->signatureSpecimen?->signature_url;
  }

  /**
   * Get the user's signature status
   */
  public function getSignatureStatusAttribute(): string
  {
    if ($this->hasVerifiedSignature()) {
      return 'verified';
    }

    $pending = $this->signatureSpecimens()
      ->where('status', 'pending')
      ->exists();

    return $pending ? 'pending' : 'none';
  }

  /**
   * Get the signature status label
   */
  public function getSignatureStatusLabelAttribute(): string
  {
    return match ($this->signature_status) {
      'verified' => 'Verified',
      'pending' => 'Pending Verification',
      'none' => 'No Signature',
      default => 'Unknown',
    };
  }

  /**
   * Get the signature status color
   */
  public function getSignatureStatusColorAttribute(): string
  {
    return match ($this->signature_status) {
      'verified' => 'success',
      'pending' => 'warning',
      'none' => 'secondary',
      default => 'secondary',
    };
  }
}
