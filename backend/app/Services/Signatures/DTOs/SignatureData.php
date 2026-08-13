<?php
// app/Services/Signatures/DTOs/SignatureData.php

namespace App\Services\Signatures\DTOs;

use Carbon\Carbon;

class SignatureData
{
  public function __construct(
    public readonly ?int $id,
    public readonly int $userId,
    public readonly ?string $signatureImagePath,
    public readonly ?string $signatureImageUrl,
    public readonly ?string $signatureHash,
    public readonly ?string $qrCodeData,
    public readonly ?string $qrCodeImage,
    public readonly ?string $qrCodeHash,
    public readonly ?string $qrVerificationToken, // <--- ADDED THIS
    public readonly bool $isVerified,
    public readonly ?string $verifiedAt,
    public readonly ?int $verifiedBy,
    public readonly ?string $verificationNotes,
    public readonly ?string $verificationMethod,
    public readonly string $status,
    public readonly ?string $ipAddress,
    public readonly ?string $userAgent,
    public readonly ?array $metadata,
    public readonly ?string $createdAt,
    public readonly ?string $updatedAt,
    public readonly ?array $user = null,
    public readonly ?array $verifiedByUser = null,
  ) {}

  public static function fromArray(array $data): self
  {
    // Extract and clean the data
    $userId = isset($data['user_id']) ? (int) $data['user_id'] : 0;
    $verifiedBy = isset($data['verified_by']) ? (int) $data['verified_by'] : null;
    $isVerified = isset($data['is_verified']) ? (bool) $data['is_verified'] : false;
    $status = isset($data['status']) ? (string) $data['status'] : 'pending';

    // Handle user relationship - if it's an object, convert to array
    $user = null;
    if (isset($data['user'])) {
      if (is_array($data['user'])) {
        $user = $data['user'];
      } elseif (is_object($data['user']) && method_exists($data['user'], 'toArray')) {
        $user = $data['user']->toArray();
      } elseif (is_object($data['user'])) {
        $user = (array) $data['user'];
      }
    }

    // Handle verified_by_user relationship
    $verifiedByUser = null;
    if (isset($data['verified_by_user'])) {
      if (is_array($data['verified_by_user'])) {
        $verifiedByUser = $data['verified_by_user'];
      } elseif (is_object($data['verified_by_user']) && method_exists($data['verified_by_user'], 'toArray')) {
        $verifiedByUser = $data['verified_by_user']->toArray();
      } elseif (is_object($data['verified_by_user'])) {
        $verifiedByUser = (array) $data['verified_by_user'];
      }
    }

    return new self(
      id: isset($data['id']) ? (int) $data['id'] : null,
      userId: $userId,
      signatureImagePath: isset($data['signature_image_path']) ? (string) $data['signature_image_path'] : null,
      signatureImageUrl: isset($data['signature_image_url']) ? (string) $data['signature_image_url'] : null,
      signatureHash: isset($data['signature_hash']) ? (string) $data['signature_hash'] : null,
      qrCodeData: isset($data['qr_code_data']) ? (string) $data['qr_code_data'] : null,
      qrCodeImage: isset($data['qr_code_image']) ? (string) $data['qr_code_image'] : null,
      qrCodeHash: isset($data['qr_code_hash']) ? (string) $data['qr_code_hash'] : null,
      qrVerificationToken: isset($data['qr_verification_token']) ? (string) $data['qr_verification_token'] : null, // <--- ADDED THIS
      isVerified: $isVerified,
      verifiedAt: isset($data['verified_at']) ? (string) $data['verified_at'] : null,
      verifiedBy: $verifiedBy,
      verificationNotes: isset($data['verification_notes']) ? (string) $data['verification_notes'] : null,
      verificationMethod: isset($data['verification_method']) ? (string) $data['verification_method'] : null,
      status: $status,
      ipAddress: isset($data['ip_address']) ? (string) $data['ip_address'] : null,
      userAgent: isset($data['user_agent']) ? (string) $data['user_agent'] : null,
      metadata: isset($data['metadata']) && is_array($data['metadata']) ? $data['metadata'] : null,
      createdAt: isset($data['created_at']) ? (string) $data['created_at'] : null,
      updatedAt: isset($data['updated_at']) ? (string) $data['updated_at'] : null,
      user: $user,
      verifiedByUser: $verifiedByUser,
    );
  }

  public function toArray(): array
  {
    return [
      'id' => $this->id,
      'user_id' => $this->userId,
      'signature_image_path' => $this->signatureImagePath,
      'signature_image_url' => $this->signatureImageUrl,
      'signature_hash' => $this->signatureHash,
      'qr_code_data' => $this->qrCodeData,
      'qr_code_image' => $this->qrCodeImage,
      'qr_code_hash' => $this->qrCodeHash,
      'qr_verification_token' => $this->qrVerificationToken, // <--- ADDED THIS
      'is_verified' => $this->isVerified,
      'verified_at' => $this->verifiedAt,
      'verified_by' => $this->verifiedBy,
      'verification_notes' => $this->verificationNotes,
      'verification_method' => $this->verificationMethod,
      'status' => $this->status,
      'ip_address' => $this->ipAddress,
      'user_agent' => $this->userAgent,
      'metadata' => $this->metadata,
      'created_at' => $this->createdAt,
      'updated_at' => $this->updatedAt,
      'user' => $this->user,
      'verified_by_user' => $this->verifiedByUser,
    ];
  }

  /**
   * Get the user's full name from the user array
   */
  public function getUserName(): string
  {
    if ($this->user && isset($this->user['full_name'])) {
      return (string) $this->user['full_name'];
    }
    if ($this->user && isset($this->user['name'])) {
      return (string) $this->user['name'];
    }
    return 'Unknown User';
  }

  /**
   * Get the user's email from the user array
   */
  public function getUserEmail(): string
  {
    if ($this->user && isset($this->user['email'])) {
      return (string) $this->user['email'];
    }
    return 'Unknown Email';
  }

  /**
   * Get the verifier's name from the verified_by_user array
   */
  public function getVerifierName(): ?string
  {
    if ($this->verifiedByUser && isset($this->verifiedByUser['full_name'])) {
      return (string) $this->verifiedByUser['full_name'];
    }
    if ($this->verifiedByUser && isset($this->verifiedByUser['name'])) {
      return (string) $this->verifiedByUser['name'];
    }
    return null;
  }

  /**
   * Check if the signature is verified
   */
  public function isVerified(): bool
  {
    return $this->isVerified && $this->status === 'approved';
  }

  /**
   * Check if the signature is pending
   */
  public function isPending(): bool
  {
    return $this->status === 'pending';
  }

  /**
   * Check if the signature is rejected
   */
  public function isRejected(): bool
  {
    return $this->status === 'rejected';
  }

  /**
   * Get the status label
   */
  public function getStatusLabel(): string
  {
    $labels = [
      'pending' => 'Pending',
      'approved' => 'Approved',
      'rejected' => 'Rejected',
      'expired' => 'Expired',
    ];
    return $labels[$this->status] ?? $this->status;
  }

  /**
   * Get the status color
   */
  public function getStatusColor(): string
  {
    $colors = [
      'pending' => 'warning',
      'approved' => 'success',
      'rejected' => 'danger',
      'expired' => 'secondary',
    ];
    return $colors[$this->status] ?? 'secondary';
  }

  /**
   * Get formatted created date
   */
  public function getFormattedCreatedAt(string $format = 'F d, Y'): string
  {
    if (!$this->createdAt) {
      return 'N/A';
    }
    try {
      return Carbon::parse($this->createdAt)->format($format);
    } catch (\Exception $e) {
      return $this->createdAt;
    }
  }

  /**
   * Get formatted verified date
   */
  public function getFormattedVerifiedAt(string $format = 'F d, Y H:i'): string
  {
    if (!$this->verifiedAt) {
      return 'Not verified';
    }
    try {
      return Carbon::parse($this->verifiedAt)->format($format);
    } catch (\Exception $e) {
      return $this->verifiedAt;
    }
  }
}
