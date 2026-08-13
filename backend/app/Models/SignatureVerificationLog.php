<?php
// app/Models/SignatureVerificationLog.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SignatureVerificationLog extends Model
{
  use HasFactory;

  protected $table = 'signature_verification_logs';

  protected $fillable = [
    'signature_verification_id',
    'action',
    'status',
    'message',
    'data',
    'ip_address',
    'user_agent',
    'created_by',
  ];

  protected $casts = [
    'data' => 'array',
    'created_at' => 'datetime',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  /**
   * Get the signature verification record associated with this log.
   */
  public function verification(): BelongsTo
  {
    return $this->belongsTo(SignatureVerification::class, 'signature_verification_id');
  }

  /**
   * Get the user who performed this action.
   * NOTE: Your Repository must use ->with(['createdBy']) to eager load this!
   */
  public function createdBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopeByAction($query, string $action)
  {
    return $query->where('action', $action);
  }

  public function scopeByStatus($query, string $status)
  {
    return $query->where('status', $status);
  }

  // ============================================
  // ACCESSORS
  // ============================================

  /**
   * Get a human-readable label for the action.
   */
  public function getActionLabelAttribute(): string
  {
    return match ($this->action) {
      'upload'      => 'Uploaded Signature',
      'verify'      => 'Verified Signature',
      'reject'      => 'Rejected Signature',
      'delete'      => 'Deleted Signature',
      'qr_generate' => 'Generated QR Code',
      'qr_verify'   => 'Verified QR Code',
      'update'      => 'Updated Signature',
      default       => ucfirst($this->action ?? 'Unknown'),
    };
  }

  /**
   * Get a human-readable label for the status.
   */
  public function getStatusLabelAttribute(): string
  {
    return match ($this->status) {
      'success' => '✅ Success',
      'failed'  => '❌ Failed',
      'pending' => '⏳ Pending',
      'warning' => '⚠️ Warning',
      default   => ucfirst($this->status ?? 'Unknown'),
    };
  }

  /**
   * Get a color class for the status badge.
   */
  public function getStatusColorAttribute(): string
  {
    return match ($this->status) {
      'success' => 'emerald',
      'failed'  => 'rose',
      'pending' => 'amber',
      'warning' => 'yellow',
      default   => 'gray',
    };
  }
}
