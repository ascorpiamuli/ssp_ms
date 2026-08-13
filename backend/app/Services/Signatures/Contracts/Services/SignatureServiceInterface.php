<?php
// app/Services/Signatures/Contracts/Services/SignatureServiceInterface.php

namespace App\Services\Signatures\Contracts\Services;

use App\Models\SignatureSpecimen;
use App\Models\User;
use App\Services\Signatures\DTOs\SignatureData;
use App\Services\Signatures\DTOs\SignatureStatus;
use Illuminate\Http\UploadedFile;
use Illuminate\Database\Eloquent\Collection;

interface SignatureServiceInterface
{
  /**
   * Upload a signature specimen
   */
  public function uploadSignature(User $user, UploadedFile $file, ?string $ip = null, ?string $userAgent = null): SignatureSpecimen;

  /**
   * Verify a signature specimen with QR Code generation
   */
  public function verifySignature(int $specimenId, User $verifier, ?string $notes = null): SignatureSpecimen;

  /**
   * Verify signature using QR Code
   */
  public function verifySignatureByQR(string $qrData, User $verifier): array;

  /**
   * Reject a signature specimen
   */
  public function rejectSignature(int $specimenId, User $rejector, ?string $reason = null): SignatureSpecimen;

  /**
   * Get a user's signature specimen
   */
  public function getUserSignature(User $user): ?SignatureData;

  /**
   * Get a user's signature status
   */
  public function getUserSignatureStatus(User $user): SignatureStatus;

  /**
   * Get QR Code for a signature
   */
  public function getSignatureQR(int $specimenId): ?array;

  /**
   * Regenerate QR Code for a signature
   */
  public function regenerateQR(int $specimenId, User $user): array;

  /**
   * Delete a signature specimen
   */
  public function deleteSignature(int $specimenId, User $deleter): bool;

  /**
   * Get all pending signatures
   */
  public function getPendingSignatures(): Collection;

  /**
   * Get all verified signatures
   */
  public function getVerifiedSignatures(): Collection;

  /**
   * Get signature statistics
   */
  public function getStats(): array;

  public function getVerificationLogs(array $filters = []):Collection;

}
