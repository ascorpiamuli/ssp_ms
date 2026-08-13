<?php
// app/Models/SignatureVerification.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SignatureVerification extends Model
{
  use HasFactory;

  protected $table = 'signature_verifications';

  protected $fillable = [
    'signature_specimen_id',
    'user_id',
    'verified_by',
    'document_type',
    'document_id',
    'document_reference',
    'verification_status',
    'verification_method',
    'verification_data',
    'failure_reason',
    'qr_code_data',
    'qr_code_image',
    'verified_at',
    'ip_address',
    'user_agent',
    'metadata',
  ];

  protected $casts = [
    'verified_at' => 'datetime',
    'metadata' => 'array',
    'document_id' => 'integer',
  ];

  protected $attributes = [
    'verification_status' => 'pending',
    'verification_method' => 'manual',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function signatureSpecimen(): BelongsTo
  {
    return $this->belongsTo(SignatureSpecimen::class);
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function verifiedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'verified_by');
  }

  /**
   * Get all logs for this verification
   */
  public function logs(): HasMany
  {
    return $this->hasMany(SignatureVerificationLog::class, 'signature_verification_id');
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopePending($query)
  {
    return $query->where('verification_status', 'pending');
  }

  public function scopeVerified($query)
  {
    return $query->where('verification_status', 'verified');
  }

  public function scopeFailed($query)
  {
    return $query->where('verification_status', 'failed');
  }

  public function scopeByDocumentType($query, string $type)
  {
    return $query->where('document_type', $type);
  }

  public function scopeByDocumentReference($query, string $reference)
  {
    return $query->where('document_reference', $reference);
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getVerificationStatusLabelAttribute(): string
  {
    return match ($this->verification_status) {
      'pending' => 'Pending',
      'verified' => 'Verified',
      'failed' => 'Failed',
      'expired' => 'Expired',
      default => ucfirst($this->verification_status),
    };
  }

  public function getVerificationStatusColorAttribute(): string
  {
    return match ($this->verification_status) {
      'pending' => 'warning',
      'verified' => 'success',
      'failed' => 'danger',
      'expired' => 'secondary',
      default => 'secondary',
    };
  }

  public function getQrCodeUrlAttribute(): ?string
  {
    return $this->qr_code_image ?? null;
  }

  public function getDocumentTypeLabelAttribute(): string
  {
    return match ($this->document_type) {
      'requisition' => 'Requisition',
      'purchase_order' => 'Purchase Order',
      'contract' => 'Contract',
      'invoice' => 'Invoice',
      'payment_voucher' => 'Payment Voucher',
      default => ucfirst($this->document_type ?? 'Unknown'),
    };
  }

    // ============================================
    // HELPER METHODS WITH LOGGING
    // ============================================

  /**
   * Check if verification is pending
   */
  public function isPending(): bool
  {
    return $this->verification_status === 'pending';
  }

  /**
   * Check if verification was successful
   */
  public function isVerified(): bool
  {
    return $this->verification_status === 'verified';
  }

  /**
   * Check if verification failed
   */
  public function isFailed(): bool
  {
    return $this->verification_status === 'failed';
  }

  /**
   * Mark verification as successful with logging
   */
  public function markAsVerified(User $verifier, ?array $data = null): bool
  {
    $this->verification_status = 'verified';
    $this->verified_by = $verifier->id;
    $this->verified_at = now();

    if ($data) {
      $this->verification_data = json_encode($data);
    }

    $saved = $this->save();

    if ($saved) {
      // Log the verification
      SignatureVerificationLog::logSuccess(
        $this->id,
        'verify',
        "Signature verified by {$verifier->full_name}",
        $data,
        $verifier
      );
    }

    return $saved;
  }

  /**
   * Mark verification as failed with logging
   */
  public function markAsFailed(string $reason, ?array $data = null, ?User $user = null): bool
  {
    $this->verification_status = 'failed';
    $this->failure_reason = $reason;

    if ($data) {
      $this->verification_data = json_encode($data);
    }

    $saved = $this->save();

    if ($saved) {
      SignatureVerificationLog::logFailed(
        $this->id,
        'verify',
        "Signature verification failed: {$reason}",
        array_merge($data ?? [], ['reason' => $reason]),
        $user
      );
    }

    return $saved;
  }

  /**
   * Generate QR code data with logging
   */
  public function generateQRCodeData(): array
  {
    $specimen = $this->signatureSpecimen;

    return [
      'verification_id' => $this->id,
      'signature_id' => $this->signature_specimen_id,
      'user_id' => $this->user_id,
      'user_name' => $this->user?->full_name ?? 'Unknown',
      'user_role' => $this->user?->role ?? 'Unknown',
      'role_label' => $this->user?->role_label ?? 'Unknown Role',
      'document_type' => $this->document_type,
      'document_reference' => $this->document_reference,
      'verification_status' => $this->verification_status,
      'verified_at' => $this->verified_at?->toISOString(),
      'verified_by' => $this->verifiedBy?->full_name ?? 'Unknown',
      'timestamp' => now()->timestamp,
      'hash' => $specimen?->signature_hash ?? null,
    ];
  }

  /**
   * Regenerate QR code with logging
   */
  public function regenerateQRCode(?User $user = null): bool
  {
    $qrData = $this->generateQRCodeData();
    $this->qr_code_data = json_encode($qrData);

    $saved = $this->save();

    if ($saved) {
      SignatureVerificationLog::logSuccess(
        $this->id,
        'qr_generate',
        "QR code regenerated for verification",
        ['qr_data' => $qrData],
        $user
      );
    }

    return $saved;
  }

  /**
   * Verify QR code with logging
   */
  public function verifyQRCode(string $qrData, ?User $user = null): bool
  {
    try {
      $data = json_decode($qrData, true);

      // Validate required fields
      if (!isset($data['verification_id']) || !isset($data['signature_id'])) {
        SignatureVerificationLog::logFailed(
          $this->id,
          'qr_verify',
          'Invalid QR code data: missing required fields',
          ['qr_data' => $qrData],
          $user
        );
        return false;
      }

      // Check if this verification matches
      if ($data['verification_id'] != $this->id) {
        SignatureVerificationLog::logFailed(
          $this->id,
          'qr_verify',
          'QR code verification ID mismatch',
          ['expected' => $this->id, 'got' => $data['verification_id']],
          $user
        );
        return false;
      }

      // Check if signature matches
      if ($data['signature_id'] != $this->signature_specimen_id) {
        SignatureVerificationLog::logFailed(
          $this->id,
          'qr_verify',
          'QR code signature ID mismatch',
          ['expected' => $this->signature_specimen_id, 'got' => $data['signature_id']],
          $user
        );
        return false;
      }

      // Check if user matches
      if ($data['user_id'] != $this->user_id) {
        SignatureVerificationLog::logFailed(
          $this->id,
          'qr_verify',
          'QR code user ID mismatch',
          ['expected' => $this->user_id, 'got' => $data['user_id']],
          $user
        );
        return false;
      }

      // Log successful QR verification
      SignatureVerificationLog::logSuccess(
        $this->id,
        'qr_verify',
        'QR code verified successfully',
        ['qr_data' => $data],
        $user
      );

      return true;
    } catch (\Exception $e) {
      SignatureVerificationLog::logFailed(
        $this->id,
        'qr_verify',
        'QR code verification exception: ' . $e->getMessage(),
        ['error' => $e->getMessage(), 'qr_data' => $qrData],
        $user
      );
      return false;
    }
  }

  /**
   * Log a QR code scan (without verification)
   */
  public function logQRScan(?User $user = null): void
  {
    SignatureVerificationLog::logSuccess(
      $this->id,
      'qr_scan',
      'QR code was scanned',
      [
        'scanned_at' => now()->toISOString(),
        'scanner' => $user?->full_name ?? 'Unknown',
      ],
      $user
    );
  }
}
