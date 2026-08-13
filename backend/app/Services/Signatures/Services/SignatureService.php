<?php

namespace App\Services\Signatures\Services;

use App\Models\SignatureSpecimen;
use App\Models\User;
use App\Services\Signatures\Contracts\Repositories\SignatureSpecimenRepositoryInterface;
use App\Services\Signatures\Contracts\Repositories\SignatureVerificationRepositoryInterface;
use App\Services\Signatures\Contracts\Repositories\SignatureVerificationLogRepositoryInterface;
use App\Services\Signatures\Contracts\Services\SignatureServiceInterface;
use App\Services\Signatures\Contracts\Services\QRCodeServiceInterface;
use App\Services\Signatures\DTOs\SignatureData;
use App\Services\Signatures\DTOs\SignatureStatus;
use App\Services\Signatures\Exceptions\SignatureNotFoundException;
use App\Services\Signatures\Exceptions\SignatureAlreadyVerifiedException;
use App\Services\Signatures\Exceptions\InvalidSignatureFileException;
use App\Services\Signatures\Exceptions\SignatureVerificationFailedException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Collection;

class SignatureService implements SignatureServiceInterface
{
  protected const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  protected const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  protected const QR_SIZE = 300;

  public function __construct(
    protected SignatureSpecimenRepositoryInterface $specimenRepository,
    protected SignatureVerificationRepositoryInterface $verificationRepository,
    protected SignatureVerificationLogRepositoryInterface $logRepository,
    protected QRCodeServiceInterface $qrCodeService
  ) {}

  /**
   * Upload a signature specimen
   */
  public function uploadSignature(User $user, UploadedFile $file, ?string $ip = null, ?string $userAgent = null): SignatureSpecimen
  {
    $this->validateSignatureFile($file);

    $path = $this->storeSignatureFile($user, $file);
    $hash = hash_file('sha256', $file->getRealPath());

    $specimen = $this->specimenRepository->create([
      'user_id' => $user->id,
      'signature_image_path' => $path,
      'signature_image_url' => Storage::url($path),
      'signature_hash' => $hash,
      'status' => 'pending',
      'ip_address' => $ip,
      'user_agent' => $userAgent,
    ]);

    $this->logRepository->create([
      'signature_verification_id' => null,
      'action' => 'upload',
      'status' => 'success',
      'message' => "Signature uploaded by {$user->full_name}",
      'data' => json_encode(['specimen_id' => $specimen->id]),
      'ip_address' => $ip,
      'user_agent' => $userAgent,
      'created_by' => $user->id,
    ]);

    return $specimen;
  }

  /**
   * Verify a signature specimen with QR Code generation
   */
  public function verifySignature(int $specimenId, User $verifier, ?string $notes = null, ?string $ip = null, ?string $userAgent = null): SignatureSpecimen
  {
    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) throw new SignatureNotFoundException('Signature specimen not found');
    if ($specimen->is_verified) throw new SignatureAlreadyVerifiedException('Signature already verified');

    // Verify specimen
    $verified = $this->specimenRepository->verify($specimenId, $verifier->id, $notes);

    // ==========================================
    // 1. GENERATE A UNIQUE SECURE TOKEN
    // ==========================================
    $shortToken = SignatureSpecimen::generateSecureToken();

    // ==========================================
    // 2. BUILD THE FULL JSON FOR DATABASE STORAGE
    // ==========================================
    $user = $specimen->user;
    $qrDataArray = [
      'verification_id' => null, // Updated later
      'signature_id' => $specimen->id,
      'user_id' => $specimen->user_id,
      'user_name' => $user->full_name ?? 'Unknown',
      'user_role' => $user->role ?? 'Unknown',
      'role_label' => $user->role_label ?? 'Unknown Role',
      'document_type' => 'signature',
      'document_reference' => 'SIG-' . $specimen->id,
      'verification_status' => 'verified',
      'verified_at' => $verified->verified_at?->toISOString(),
      'verified_by' => $verifier->full_name,
      'timestamp' => time(),
    ];

    // ==========================================
    // 3. GENERATE CLEAN QR IMAGE USING ONLY THE TOKEN
    // ==========================================
    $cleanQrUrl = config('app.frontend_url') . '/verify-signature/token/' . $shortToken;

    $qrImagePath = $this->qrCodeService->generateQRWithVerificationUrl($cleanQrUrl);
    $qrBase64 = $qrImagePath && file_exists($qrImagePath)
      ? 'data:image/png;base64,' . base64_encode(file_get_contents($qrImagePath))
      : null;
    if ($qrImagePath) $this->qrCodeService->cleanupTempFiles($qrImagePath);

    // Create Verification Record
    $qrDataJson = json_encode($qrDataArray);
    $verification = $this->verificationRepository->create([
      'signature_specimen_id' => $specimenId,
      'user_id' => $specimen->user_id,
      'verified_by' => $verifier->id,
      'verification_status' => 'verified',
      'verification_method' => 'manual',
      'verified_at' => now(),
      'qr_code_data' => $qrDataJson,
      'qr_code_image' => $qrBase64,
    ]);

    // Update QR Data with Verification ID
    $qrDataArray['verification_id'] = $verification->id;
    $updatedQrDataJson = json_encode($qrDataArray);

    $this->specimenRepository->update($specimenId, [
      'qr_code_data' => $updatedQrDataJson, // Full JSON stays in DB
      'qr_code_image' => $qrBase64,         // Clean Image stays in DB
      'qr_code_hash' => hash('sha256', $updatedQrDataJson),
      'qr_verification_token' => $shortToken, // Token saved for lookup
    ]);

    // LOG WITH IP AND USER AGENT
    $this->logRepository->logSuccess(
      $verification->id,
      'verify',
      "Signature verified by {$verifier->full_name}",
      ['specimen_id' => $specimenId],
      $verifier->id,
      $ip,
      $userAgent
    );

    return $verified;
  }

  /**
   * Verify signature using QR Code
   */
  public function verifySignatureByQR(string $qrData, User $verifier, ?string $ip = null, ?string $userAgent = null): array
  {
    $decodedData = $this->qrCodeService->verifyQRData($qrData);
    if (!$decodedData || !isset($decodedData['signature_id'])) {
      throw new SignatureVerificationFailedException('Invalid QR Code data');
    }

    $specimenId = $decodedData['signature_id'];
    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) throw new SignatureNotFoundException('Signature specimen not found');

    if ($specimen->is_verified) {
      return ['verified' => $specimen, 'already_verified' => true, 'qr_data' => $decodedData];
    }

    $verified = $this->verifySignature($specimenId, $verifier, 'Verified via QR Code', $ip, $userAgent);

    return ['verified' => $verified, 'already_verified' => false, 'qr_data' => $decodedData];
  }

  /**
   * Get QR Code for a signature (from DB or regenerated)
   */
  public function getSignatureQR(int $specimenId): ?array
  {
    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) throw new SignatureNotFoundException('Signature specimen not found');
    if (!$specimen->is_verified) throw new SignatureVerificationFailedException('Signature not verified');

    // Return directly from DB if present
    if ($specimen->qr_code_image) {
      return [
        'data' => $specimen->qr_code_data,
        'image' => $specimen->qr_code_image,
        'hash' => $specimen->qr_code_hash,
        'verified_at' => $specimen->verified_at,
        'verified_by' => $specimen->verifiedBy?->full_name,
      ];
    }

    // Regenerate if missing in DB
    $user = $specimen->user;
    $shortToken = $specimen->qr_verification_token ?? SignatureSpecimen::generateSecureToken();
    $cleanQrUrl = config('app.url') . '/verify-signature/token/' . $shortToken;

    // We only generate the image, we don't need to pass the array to the QR generator anymore
    $qrImagePath = $this->qrCodeService->generateQRWithVerificationUrl($cleanQrUrl);
    if (!$qrImagePath || !file_exists($qrImagePath)) return null;

    $base64 = 'data:image/png;base64,' . base64_encode(file_get_contents($qrImagePath));

    // We don't regenerate the JSON data here, just pull it from DB
    $qrDataJson = $specimen->qr_code_data;

    $this->specimenRepository->update($specimenId, [
      'qr_code_image' => $base64, // Update just the clean image
      'qr_verification_token' => $shortToken,
    ]);
    $this->qrCodeService->cleanupTempFiles($qrImagePath);

    return [
      'data' => $qrDataJson,
      'image' => $base64,
      'hash' => $specimen->qr_code_hash,
      'verified_at' => $specimen->verified_at,
      'verified_by' => $specimen->verifiedBy?->full_name,
    ];
  }

  /**
   * Regenerate QR Code for a signature (Preserves DB Storage)
   */
  public function regenerateQR(int $specimenId, User $user, ?string $ip = null, ?string $userAgent = null): array
  {
    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) throw new SignatureNotFoundException('Signature specimen not found');
    if (!$specimen->is_verified) throw new SignatureVerificationFailedException('Signature not verified');

    // ==========================================
    // REGENERATE A NEW SECURE TOKEN
    // ==========================================
    $newToken = SignatureSpecimen::generateSecureToken();
    $cleanQrUrl = config('app.frontend_url') . '/verify-signature/token/' . $newToken;

    $qrImagePath = $this->qrCodeService->generateQRWithVerificationUrl($cleanQrUrl);
    if (!$qrImagePath || !file_exists($qrImagePath)) {
      throw new \RuntimeException('Failed to generate QR Code');
    }

    $base64 = 'data:image/png;base64,' . base64_encode(file_get_contents($qrImagePath));

    // Update specimen with new image and token
    $this->specimenRepository->update($specimenId, [
      'qr_code_image' => $base64,
      'qr_verification_token' => $newToken,
    ]);
    $this->qrCodeService->cleanupTempFiles($qrImagePath);

    // LOG WITH IP AND USER AGENT
    $this->logRepository->create([
      'signature_verification_id' => null,
      'action' => 'qr_generate',
      'status' => 'success',
      'message' => "QR Code regenerated by {$user->full_name}",
      'data' => json_encode(['specimen_id' => $specimenId]),
      'ip_address' => $ip,
      'user_agent' => $userAgent,
      'created_by' => $user->id,
    ]);

    return [
      'data' => $specimen->qr_code_data,
      'image' => $base64,
      'hash' => $specimen->qr_code_hash,
      'verified_at' => $specimen->verified_at,
      'verified_by' => $specimen->verifiedBy?->full_name,
    ];
  }

  /**
   * Reject a signature specimen
   */
  public function rejectSignature(int $specimenId, User $rejector, ?string $reason = null, ?string $ip = null, ?string $userAgent = null): SignatureSpecimen
  {
    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) throw new SignatureNotFoundException('Signature specimen not found');

    $rejected = $this->specimenRepository->reject($specimenId, $reason);

    // LOG WITH IP AND USER AGENT
    $this->logRepository->create([
      'signature_verification_id' => null,
      'action' => 'reject',
      'status' => 'failed',
      'message' => "Signature rejected by {$rejector->full_name}" . ($reason ? ": {$reason}" : ''),
      'data' => json_encode(['specimen_id' => $specimenId, 'reason' => $reason]),
      'ip_address' => $ip,
      'user_agent' => $userAgent,
      'created_by' => $rejector->id,
    ]);

    return $rejected;
  }

  /**
   * Get user's verified signature
   */
  public function getUserSignature(User $user): ?SignatureData
  {
    $specimen = $this->specimenRepository->getUserVerifiedSignature($user->id);
    return $specimen ? SignatureData::fromArray($this->buildSignatureArray($specimen)) : null;
  }

  /**
   * Get user's signature status
   */
  public function getUserSignatureStatus(User $user): SignatureStatus
  {
    $specimen = $this->specimenRepository->getUserSignature($user->id);
    if (!$specimen) return SignatureStatus::none();

    $data = SignatureData::fromArray($this->buildSignatureArray($specimen));

    return match (true) {
      $specimen->is_verified && $specimen->status === 'approved' => SignatureStatus::verified($data),
      $specimen->status === 'pending' => SignatureStatus::pending($data),
      $specimen->status === 'rejected' => SignatureStatus::rejected($data),
      default => SignatureStatus::none(),
    };
  }

  /**
   * Delete a signature specimen
   */
  public function deleteSignature(int $specimenId, User $deleter): bool
  {
    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) throw new SignatureNotFoundException('Signature specimen not found');

    if ($specimen->signature_image_path) {
      Storage::disk('public')->delete($specimen->signature_image_path);
    }

    $result = $this->specimenRepository->delete($specimenId);

    $this->logRepository->create([
      'signature_verification_id' => null,
      'action' => 'delete',
      'status' => 'success',
      'message' => "Signature deleted by {$deleter->full_name}",
      'data' => json_encode(['specimen_id' => $specimenId]),
      'created_by' => $deleter->id,
    ]);

    return $result;
  }

  /**
   * Get pending signatures
   */
  public function getPendingSignatures(): Collection
  {
    return $this->specimenRepository->getPending();
  }

  /**
   * Get verified signatures
   */
  public function getVerifiedSignatures(): Collection
  {
    return $this->specimenRepository->getVerified();
  }

  /**
   * Get signature statistics
   */
  public function getStats(): array
  {
    $pending = $this->specimenRepository->getPending()->count();
    $verified = $this->specimenRepository->getVerified()->count();
    $total = SignatureSpecimen::count();

    return [
      'total' => $total,
      'pending' => $pending,
      'verified' => $verified,
      'rejected' => $total - $pending - $verified,
      'percentage_verified' => $total > 0 ? round(($verified / $total) * 100, 2) : 0,
    ];
  }

  /* --- HELPERS --- */

  protected function validateSignatureFile(UploadedFile $file): void
  {
    if (!in_array($file->getMimeType(), self::ALLOWED_MIMES)) {
      throw new InvalidSignatureFileException('Invalid file type. Allowed: ' . implode(', ', self::ALLOWED_MIMES));
    }
    if ($file->getSize() > self::MAX_FILE_SIZE) {
      throw new InvalidSignatureFileException('File size exceeds ' . (self::MAX_FILE_SIZE / 1024 / 1024) . 'MB limit');
    }
  }

  protected function storeSignatureFile(User $user, UploadedFile $file): string
  {
    $path = $file->storeAs(
      'signatures',
      "user_{$user->id}_" . time() . '.' . $file->getClientOriginalExtension(),
      'public'
    );
    if (!$path) throw new InvalidSignatureFileException('Failed to store signature file');
    return $path;
  }

  protected function buildSignatureArray(SignatureSpecimen $specimen): array
  {
    return [
      'id' => $specimen->id,
      'user_id' => $specimen->user_id,
      'signature_image_path' => $specimen->signature_image_path,
      'signature_image_url' => $specimen->signature_image_url,
      'signature_hash' => $specimen->signature_hash,
      'qr_code_data' => $specimen->qr_code_data,
      'qr_code_image' => $specimen->qr_code_image,
      'qr_code_hash' => $specimen->qr_code_hash,
      'qr_verification_token' => $specimen->qr_verification_token,
      'is_verified' => $specimen->is_verified,
      'verified_at' => $specimen->verified_at?->toISOString(),
      'verified_by' => $specimen->verified_by,
      'verification_notes' => $specimen->verification_notes,
      'verification_method' => $specimen->verification_method,
      'status' => $specimen->status,
      'ip_address' => $specimen->ip_address,
      'user_agent' => $specimen->user_agent,
      'metadata' => $specimen->metadata,
      'created_at' => $specimen->created_at?->toISOString(),
      'updated_at' => $specimen->updated_at?->toISOString(),
      'user' => $specimen->user?->toArray(),
      'verified_by_user' => $specimen->verifiedBy?->toArray(),
    ];
  }

  // ==========================================================
  // 🆕 NEW METHOD: Get all signature verification logs
  // ==========================================================

  /**
   * Get all signature verification logs
   *
   * @param array $filters
   * @return Collection
   */
  public function getVerificationLogs(array $filters = []): Collection
  {
    return $this->logRepository->getAll($filters);
  }
}
