<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SignatureSpecimen extends Model
{
  use HasFactory, SoftDeletes;

  protected $table = 'signature_specimens';

  protected $fillable = [
    'user_id',
    'signature_image_path',
    'signature_image_url',
    'signature_hash',
    'qr_code_data',
    'qr_code_image',
    'qr_code_hash',
    'qr_verification_token', // <--- ADDED THIS
    'is_verified',
    'verified_at',
    'verified_by',
    'verification_notes',
    'verification_method',
    'status',
    'ip_address',
    'user_agent',
    'metadata',
  ];

  protected $casts = [
    'is_verified' => 'boolean',
    'verified_at' => 'datetime',
    'metadata' => 'array',
    'qr_verification_token' => 'string', // <--- ADDED THIS
  ];

  protected $attributes = [
    'status' => 'pending',
    'verification_method' => 'manual',
    'is_verified' => false,
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the user who owns this signature
   */
  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Get the user who verified this signature
   */
  public function verifiedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'verified_by');
  }

  /**
   * Get all verifications for this signature
   */
  public function verifications(): HasMany
  {
    return $this->hasMany(SignatureVerification::class);
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope to get only verified signatures
   */
  public function scopeVerified($query)
  {
    return $query->where('is_verified', true);
  }

  /**
   * Scope to get only pending signatures
   */
  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  /**
   * Scope to get only approved signatures
   */
  public function scopeApproved($query)
  {
    return $query->where('status', 'approved');
  }

  /**
   * Scope to get only rejected signatures
   */
  public function scopeRejected($query)
  {
    return $query->where('status', 'rejected');
  }

  /**
   * Scope to get active signatures
   */
  public function scopeActive($query)
  {
    return $query->where('status', 'approved')
      ->where('is_verified', true);
  }

  /**
   * Scope to find a signature by its secure QR token (Fast lookup for scanning)
   */
  public function scopeByToken($query, string $token)
  {
    return $query->where('qr_verification_token', $token);
  }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

  /**
   * Get the status label
   */
  public function getStatusLabelAttribute(): string
  {
    return match ($this->status) {
      'pending' => 'Pending',
      'approved' => 'Approved',
      'rejected' => 'Rejected',
      'expired' => 'Expired',
      default => ucfirst($this->status),
    };
  }

  /**
   * Get the status color for UI
   */
  public function getStatusColorAttribute(): string
  {
    return match ($this->status) {
      'pending' => 'warning',
      'approved' => 'success',
      'rejected' => 'danger',
      'expired' => 'secondary',
      default => 'secondary',
    };
  }

  /**
   * Get the QR code URL
   */
  public function getQrCodeUrlAttribute(): ?string
  {
    return $this->qr_code_image ?? null;
  }

  /**
   * Get the signature image URL
   */
  public function getSignatureUrlAttribute(): ?string
  {
    if ($this->signature_image_url) {
      return $this->signature_image_url;
    }
    if ($this->signature_image_path) {
      return asset('storage/' . $this->signature_image_path);
    }
    return null;
  }

  /**
   * Get the verification status label
   */
  public function getVerificationStatusLabelAttribute(): string
  {
    return $this->is_verified ? 'Verified' : 'Not Verified';
  }

  /**
   * Get the verification status color
   */
  public function getVerificationStatusColorAttribute(): string
  {
    return $this->is_verified ? 'success' : 'warning';
  }

  /**
   * Get the full name of the user
   */
  public function getUserFullNameAttribute(): string
  {
    return $this->user?->full_name ?? 'Unknown User';
  }

  /**
   * Get the user's role label
   */
  public function getUserRoleLabelAttribute(): string
  {
    return $this->user?->role_label ?? 'Unknown Role';
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Check if signature is verified
   */
  public function isVerified(): bool
  {
    return $this->is_verified && $this->status === 'approved';
  }

  /**
   * Check if signature is pending
   */
  public function isPending(): bool
  {
    return $this->status === 'pending';
  }

  /**
   * Check if signature is approved
   */
  public function isApproved(): bool
  {
    return $this->status === 'approved';
  }

  /**
   * Check if signature is rejected
   */
  public function isRejected(): bool
  {
    return $this->status === 'rejected';
  }

  /**
   * Generate a unique, URL-safe secure token for QR codes
   */
  public static function generateSecureToken(): string
  {
    return bin2hex(random_bytes(16));
  }

  /**
   * Generate QR code data
   */
  public function generateQRCodeData(): array
  {
    return [
      'signature_id' => $this->id,
      'user_id' => $this->user_id,
      'user_name' => $this->user?->full_name ?? 'Unknown',
      'user_role' => $this->user?->role ?? 'Unknown',
      'role_label' => $this->user?->role_label ?? 'Unknown Role',
      'signature_verified' => $this->is_verified,
      'verified_at' => $this->verified_at?->toISOString(),
      'timestamp' => now()->timestamp,
      'hash' => $this->signature_hash,
    ];
  }

  /**
   * Verify the signature
   */
  public function verify(User $verifier, ?string $notes = null): bool
  {
    $this->is_verified = true;
    $this->verified_at = now();
    $this->verified_by = $verifier->id;
    $this->status = 'approved';
    $this->verification_notes = $notes;
    $this->verification_method = 'manual';

    return $this->save();
  }

  /**
   * Reject the signature
   */
  public function reject(?string $reason = null): bool
  {
    $this->is_verified = false;
    $this->status = 'rejected';
    $this->verification_notes = $reason;

    return $this->save();
  }

  /**
   * Regenerate QR code
   */
  public function regenerateQRCode(): bool
  {
    $qrData = $this->generateQRCodeData();
    $this->qr_code_data = json_encode($qrData);
    $this->qr_code_hash = hash('sha256', json_encode($qrData));

    return $this->save();
  }
}
