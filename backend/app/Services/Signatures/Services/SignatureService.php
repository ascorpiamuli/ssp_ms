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
use App\Services\Signatures\Exceptions\InvalidSignatureTokenException;
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
   * Get signature by token (for public endpoints)
   * Returns the signature specimen for the given token
   */
  public function getSignatureByToken(string $token): ?SignatureSpecimen
  {
    Log::debug('🔍 [SignatureService] Getting signature by token', [
      'token_preview' => substr($token, 0, 10) . '...'
    ]);

    $specimen = $this->specimenRepository->findByToken($token);

    if (!$specimen) {
      Log::debug('❌ [SignatureService] No signature found for token', [
        'token_preview' => substr($token, 0, 10) . '...'
      ]);
      return null;
    }

    Log::debug('✅ [SignatureService] Signature found by token', [
      'specimen_id' => $specimen->id,
      'user_id' => $specimen->user_id,
    ]);

    return $specimen;
  }

  /**
   * Get user from signature token (for public endpoints)
   */
  public function getUserFromToken(string $token): ?User
  {
    Log::debug('🔍 [SignatureService] Getting user by token', [
      'token_preview' => substr($token, 0, 10) . '...'
    ]);

    $specimen = $this->getSignatureByToken($token);

    if (!$specimen || !$specimen->user) {
      Log::debug('❌ [SignatureService] No user found for token', [
        'token_preview' => substr($token, 0, 10) . '...'
      ]);
      return null;
    }

    Log::debug('✅ [SignatureService] User found by token', [
      'user_id' => $specimen->user->id,
      'specimen_id' => $specimen->id,
    ]);

    return $specimen->user;
  }

  /**
   * Get public signature data by token (for unauthenticated users)
   * Returns formatted signature data without sensitive information
   */
  public function getPublicSignatureByToken(string $token): ?array
  {
    Log::debug('🔍 [SignatureService] Getting public signature by token', [
      'token_preview' => substr($token, 0, 10) . '...'
    ]);

    $specimen = $this->getSignatureByToken($token);

    if (!$specimen) {
      return null;
    }

    $user = $specimen->user;
    $verifiedBy = $specimen->verifiedBy;

    return [
      'specimen' => [
        // Public user details
        'user' => [
          'full_name' => $user?->full_name ?? 'Unknown User',
          'email' => $user?->email ?? 'No email provided',
          'role_label' => $user?->role_label ?? $user?->role ?? 'Unknown Role',
        ],
        // Public signature details
        'signature_image_url' => $specimen->signature_image_url,
        'is_verified' => (bool) $specimen->is_verified,
        'status' => $specimen->status,
        'status_label' => $specimen->status_label,
        'status_color' => $specimen->status_color,
        'verified_at' => $specimen->verified_at?->toISOString(),
        'verification_notes' => $specimen->verification_notes,
        'verification_method' => $specimen->verification_method,
        'document_reference' => 'SIG-' . $specimen->id,
        // Public verifier details
        'verified_by' => [
          'full_name' => $verifiedBy?->full_name ?? 'Unknown Verifier',
          'email' => $verifiedBy?->email ?? 'N/A',
        ],
      ],
      'qr_code' => [
        'data' => $specimen->qr_code_data,
        'image' => $specimen->qr_code_image,
        'hash' => $specimen->qr_code_hash,
      ],
    ];
  }

  /**
   * Get public signature status by token (for unauthenticated users)
   */
  public function getPublicSignatureStatusByToken(string $token): ?array
  {
    Log::debug('🔍 [SignatureService] Getting public signature status by token', [
      'token_preview' => substr($token, 0, 10) . '...'
    ]);

    $specimen = $this->getSignatureByToken($token);

    if (!$specimen) {
      return null;
    }

    $user = $specimen->user;

    return [
      'user' => [
        'id' => $user?->id,
        'full_name' => $user?->full_name ?? 'Unknown User',
        'email' => $user?->email ?? 'No email provided',
      ],
      'signature' => [
        'id' => $specimen->id,
        'status' => $specimen->status,
        'status_label' => $specimen->status_label,
        'status_color' => $specimen->status_color,
        'is_verified' => (bool) $specimen->is_verified,
        'verified_at' => $specimen->verified_at?->toISOString(),
        'verification_method' => $specimen->verification_method,
        'signature_image_url' => $specimen->signature_image_url,
        'created_at' => $specimen->created_at?->toISOString(),
        'updated_at' => $specimen->updated_at?->toISOString(),
      ],
    ];
  }

  /**
   * Validate a signature token
   */
  public function validateSignatureToken(string $token): bool
  {
    Log::debug('🔍 [SignatureService] Validating signature token', [
      'token_preview' => substr($token, 0, 10) . '...'
    ]);

    $specimen = $this->getSignatureByToken($token);

    if (!$specimen) {
      Log::debug('❌ [SignatureService] Invalid token', [
        'token_preview' => substr($token, 0, 10) . '...'
      ]);
      return false;
    }

    Log::debug('✅ [SignatureService] Token is valid', [
      'specimen_id' => $specimen->id,
    ]);

    return true;
  }

  /**
   * Upload a signature specimen
   */
  public function uploadSignature(User $user, UploadedFile $file, ?string $ip = null, ?string $userAgent = null): SignatureSpecimen
  {
    Log::info('📤 [SignatureService] Uploading signature', [
      'user_id' => $user->id,
      'user_email' => $user->email ?? 'N/A',
      'file_size' => $file->getSize(),
      'file_mime' => $file->getMimeType(),
      'ip' => $ip,
    ]);

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

    Log::info('✅ [SignatureService] Signature uploaded successfully', [
      'user_id' => $user->id,
      'specimen_id' => $specimen->id,
      'file_path' => $path,
    ]);

    return $specimen;
  }

  /**
   * Verify a signature specimen with QR Code generation
   */
  public function verifySignature(int $specimenId, User $verifier, ?string $notes = null, ?string $ip = null, ?string $userAgent = null): SignatureSpecimen
  {
    Log::info('🔍 [SignatureService] Verifying signature', [
      'specimen_id' => $specimenId,
      'verifier_id' => $verifier->id,
      'verifier_email' => $verifier->email ?? 'N/A',
      'ip' => $ip,
    ]);

    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) {
      Log::warning('❌ [SignatureService] Signature specimen not found', [
        'specimen_id' => $specimenId
      ]);
      throw new SignatureNotFoundException('Signature specimen not found');
    }

    if ($specimen->is_verified) {
      Log::warning('⚠️ [SignatureService] Signature already verified', [
        'specimen_id' => $specimenId,
        'verified_at' => $specimen->verified_at,
      ]);
      throw new SignatureAlreadyVerifiedException('Signature already verified');
    }

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

    Log::info('✅ [SignatureService] Signature verified successfully', [
      'specimen_id' => $specimenId,
      'verifier_id' => $verifier->id,
      'verification_id' => $verification->id,
      'token_generated' => true,
    ]);

    return $verified;
  }

  /**
   * Verify signature using QR Code
   */
  public function verifySignatureByQR(string $qrData, User $verifier, ?string $ip = null, ?string $userAgent = null): array
  {
    Log::info('🔍 [SignatureService] Verifying signature by QR', [
      'verifier_id' => $verifier->id,
      'verifier_email' => $verifier->email ?? 'N/A',
      'ip' => $ip,
    ]);

    $decodedData = $this->qrCodeService->verifyQRData($qrData);
    if (!$decodedData || !isset($decodedData['signature_id'])) {
      Log::warning('❌ [SignatureService] Invalid QR Code data', [
        'qr_data_preview' => substr($qrData, 0, 50) . '...'
      ]);
      throw new SignatureVerificationFailedException('Invalid QR Code data');
    }

    $specimenId = $decodedData['signature_id'];
    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) {
      Log::warning('❌ [SignatureService] Signature specimen not found for QR', [
        'specimen_id' => $specimenId
      ]);
      throw new SignatureNotFoundException('Signature specimen not found');
    }

    if ($specimen->is_verified) {
      Log::info('ℹ️ [SignatureService] Signature already verified via QR', [
        'specimen_id' => $specimenId,
        'verified_at' => $specimen->verified_at,
      ]);
      return ['verified' => $specimen, 'already_verified' => true, 'qr_data' => $decodedData];
    }

    $verified = $this->verifySignature($specimenId, $verifier, 'Verified via QR Code', $ip, $userAgent);

    Log::info('✅ [SignatureService] Signature verified via QR successfully', [
      'specimen_id' => $specimenId,
      'verifier_id' => $verifier->id,
    ]);

    return ['verified' => $verified, 'already_verified' => false, 'qr_data' => $decodedData];
  }

  /**
   * Get QR Code for a signature (from DB or regenerated)
   */
  public function getSignatureQR(int $specimenId): ?array
  {
    Log::debug('🔍 [SignatureService] Getting QR code', [
      'specimen_id' => $specimenId
    ]);

    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) {
      Log::warning('❌ [SignatureService] Signature specimen not found for QR', [
        'specimen_id' => $specimenId
      ]);
      throw new SignatureNotFoundException('Signature specimen not found');
    }

    if (!$specimen->is_verified) {
      Log::warning('⚠️ [SignatureService] Signature not verified, cannot get QR', [
        'specimen_id' => $specimenId,
        'status' => $specimen->status,
      ]);
      throw new SignatureVerificationFailedException('Signature not verified');
    }

    // Return directly from DB if present
    if ($specimen->qr_code_image) {
      Log::debug('✅ [SignatureService] QR code found in database', [
        'specimen_id' => $specimenId,
        'has_image' => true,
        'has_data' => (bool) $specimen->qr_code_data,
        'has_hash' => (bool) $specimen->qr_code_hash,
      ]);

      return [
        'data' => $specimen->qr_code_data,
        'image' => $specimen->qr_code_image,
        'hash' => $specimen->qr_code_hash,
        'verified_at' => $specimen->verified_at,
        'verified_by' => $specimen->verifiedBy?->full_name,
      ];
    }

    // Regenerate if missing in DB
    Log::info('🔄 [SignatureService] Regenerating QR code (missing from DB)', [
      'specimen_id' => $specimenId
    ]);

    $user = $specimen->user;
    $shortToken = $specimen->qr_verification_token ?? SignatureSpecimen::generateSecureToken();
    $cleanQrUrl = config('app.url') . '/verify-signature/token/' . $shortToken;

    // We only generate the image, we don't need to pass the array to the QR generator anymore
    $qrImagePath = $this->qrCodeService->generateQRWithVerificationUrl($cleanQrUrl);
    if (!$qrImagePath || !file_exists($qrImagePath)) {
      Log::error('❌ [SignatureService] Failed to generate QR image', [
        'specimen_id' => $specimenId
      ]);
      return null;
    }

    $base64 = 'data:image/png;base64,' . base64_encode(file_get_contents($qrImagePath));

    // We don't regenerate the JSON data here, just pull it from DB
    $qrDataJson = $specimen->qr_code_data;

    $this->specimenRepository->update($specimenId, [
      'qr_code_image' => $base64, // Update just the clean image
      'qr_verification_token' => $shortToken,
    ]);
    $this->qrCodeService->cleanupTempFiles($qrImagePath);

    Log::info('✅ [SignatureService] QR code regenerated successfully', [
      'specimen_id' => $specimenId,
      'token_preview' => substr($shortToken, 0, 10) . '...',
    ]);

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
    Log::info('🔄 [SignatureService] Regenerating QR code', [
      'specimen_id' => $specimenId,
      'user_id' => $user->id,
      'user_email' => $user->email ?? 'N/A',
      'ip' => $ip,
    ]);

    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) {
      Log::warning('❌ [SignatureService] Signature specimen not found for QR regeneration', [
        'specimen_id' => $specimenId
      ]);
      throw new SignatureNotFoundException('Signature specimen not found');
    }

    if (!$specimen->is_verified) {
      Log::warning('⚠️ [SignatureService] Signature not verified, cannot regenerate QR', [
        'specimen_id' => $specimenId,
        'status' => $specimen->status,
      ]);
      throw new SignatureVerificationFailedException('Signature not verified');
    }

    // ==========================================
    // REGENERATE A NEW SECURE TOKEN
    // ==========================================
    $newToken = SignatureSpecimen::generateSecureToken();
    $cleanQrUrl = config('app.frontend_url') . '/verify-signature/token/' . $newToken;

    $qrImagePath = $this->qrCodeService->generateQRWithVerificationUrl($cleanQrUrl);
    if (!$qrImagePath || !file_exists($qrImagePath)) {
      Log::error('❌ [SignatureService] Failed to generate QR image for regeneration', [
        'specimen_id' => $specimenId
      ]);
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

    Log::info('✅ [SignatureService] QR code regenerated successfully', [
      'specimen_id' => $specimenId,
      'user_id' => $user->id,
      'new_token_preview' => substr($newToken, 0, 10) . '...',
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
    Log::info('🚫 [SignatureService] Rejecting signature', [
      'specimen_id' => $specimenId,
      'rejector_id' => $rejector->id,
      'rejector_email' => $rejector->email ?? 'N/A',
      'reason' => $reason,
      'ip' => $ip,
    ]);

    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) {
      Log::warning('❌ [SignatureService] Signature specimen not found for rejection', [
        'specimen_id' => $specimenId
      ]);
      throw new SignatureNotFoundException('Signature specimen not found');
    }

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

    Log::info('✅ [SignatureService] Signature rejected successfully', [
      'specimen_id' => $specimenId,
      'rejector_id' => $rejector->id,
    ]);

    return $rejected;
  }

  /**
   * Get user's verified signature (for authenticated users)
   */
  public function getUserSignature(User $user): ?SignatureData
  {
    Log::debug('🔍 [SignatureService] Getting user signature', [
      'user_id' => $user->id,
      'user_email' => $user->email ?? 'N/A',
    ]);

    $specimen = $this->specimenRepository->getUserVerifiedSignature($user->id);

    if (!$specimen) {
      Log::debug('ℹ️ [SignatureService] No verified signature found for user', [
        'user_id' => $user->id
      ]);
      return null;
    }

    Log::debug('✅ [SignatureService] User signature found', [
      'user_id' => $user->id,
      'specimen_id' => $specimen->id,
      'status' => $specimen->status,
    ]);

    return $specimen ? SignatureData::fromArray($this->buildSignatureArray($specimen)) : null;
  }

  /**
   * Get user's signature status (for authenticated users)
   */
  public function getUserSignatureStatus(User $user): SignatureStatus
  {
    Log::debug('🔍 [SignatureService] Getting user signature status', [
      'user_id' => $user->id,
      'user_email' => $user->email ?? 'N/A',
    ]);

    $specimen = $this->specimenRepository->getUserSignature($user->id);

    if (!$specimen) {
      Log::debug('ℹ️ [SignatureService] No signature found for user', [
        'user_id' => $user->id
      ]);
      return SignatureStatus::none();
    }

    $data = SignatureData::fromArray($this->buildSignatureArray($specimen));

    $status = match (true) {
      $specimen->is_verified && $specimen->status === 'approved' => SignatureStatus::verified($data),
      $specimen->status === 'pending' => SignatureStatus::pending($data),
      $specimen->status === 'rejected' => SignatureStatus::rejected($data),
      default => SignatureStatus::none(),
    };

    return $status;
  }

  /**
   * Get signature by ID (for admin/public QR view)
   */
  public function getSignatureById(int $specimenId): ?SignatureSpecimen
  {
    Log::debug('🔍 [SignatureService] Getting signature by ID', [
      'specimen_id' => $specimenId
    ]);

    $specimen = $this->specimenRepository->find($specimenId);

    if (!$specimen) {
      Log::debug('❌ [SignatureService] No signature found for ID', [
        'specimen_id' => $specimenId
      ]);
      return null;
    }

    Log::debug('✅ [SignatureService] Signature found by ID', [
      'specimen_id' => $specimenId,
      'user_id' => $specimen->user_id,
    ]);

    return $specimen;
  }

  /**
   * Delete a signature specimen
   */
  public function deleteSignature(int $specimenId, User $deleter): bool
  {
    Log::info('🗑️ [SignatureService] Deleting signature', [
      'specimen_id' => $specimenId,
      'deleter_id' => $deleter->id,
      'deleter_email' => $deleter->email ?? 'N/A',
    ]);

    $specimen = $this->specimenRepository->find($specimenId);
    if (!$specimen) {
      Log::warning('❌ [SignatureService] Signature specimen not found for deletion', [
        'specimen_id' => $specimenId
      ]);
      throw new SignatureNotFoundException('Signature specimen not found');
    }

    if ($specimen->signature_image_path) {
      Storage::disk('public')->delete($specimen->signature_image_path);
      Log::debug('🗑️ [SignatureService] Signature file deleted', [
        'specimen_id' => $specimenId,
        'file_path' => $specimen->signature_image_path,
      ]);
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

    Log::info('✅ [SignatureService] Signature deleted successfully', [
      'specimen_id' => $specimenId,
      'deleter_id' => $deleter->id,
    ]);

    return $result;
  }

  /**
   * Get pending signatures (Admin only)
   */
  public function getPendingSignatures(): Collection
  {
    Log::debug('🔍 [SignatureService] Getting pending signatures');
    $result = $this->specimenRepository->getPending();
    Log::debug('✅ [SignatureService] Pending signatures retrieved', [
      'count' => $result->count()
    ]);
    return $result;
  }

  /**
   * Get verified signatures (Admin only)
   */
  public function getVerifiedSignatures(): Collection
  {
    Log::debug('🔍 [SignatureService] Getting verified signatures');
    $result = $this->specimenRepository->getVerified();
    Log::debug('✅ [SignatureService] Verified signatures retrieved', [
      'count' => $result->count()
    ]);
    return $result;
  }

  /**
   * Get signature statistics (Admin only)
   */
  public function getStats(): array
  {
    Log::debug('🔍 [SignatureService] Getting signature statistics');

    $pending = $this->specimenRepository->getPending()->count();
    $verified = $this->specimenRepository->getVerified()->count();
    $total = SignatureSpecimen::count();
    $rejected = $total - $pending - $verified;

    $stats = [
      'total' => $total,
      'pending' => $pending,
      'verified' => $verified,
      'rejected' => $rejected,
      'percentage_verified' => $total > 0 ? round(($verified / $total) * 100, 2) : 0,
    ];

    Log::debug('✅ [SignatureService] Statistics retrieved', $stats);

    return $stats;
  }

  /**
   * Get all signature verification logs (Admin only)
   */
  public function getVerificationLogs(array $filters = []): Collection
  {
    Log::debug('🔍 [SignatureService] Getting verification logs', [
      'filters' => $filters
    ]);

    $result = $this->logRepository->getAll($filters);

    Log::debug('✅ [SignatureService] Verification logs retrieved', [
      'count' => $result->count()
    ]);

    return $result;
  }

  /* --- HELPERS --- */

  protected function validateSignatureFile(UploadedFile $file): void
  {
    if (!in_array($file->getMimeType(), self::ALLOWED_MIMES)) {
      Log::warning('❌ [SignatureService] Invalid file type', [
        'mime_type' => $file->getMimeType(),
        'allowed_mimes' => self::ALLOWED_MIMES,
      ]);
      throw new InvalidSignatureFileException('Invalid file type. Allowed: ' . implode(', ', self::ALLOWED_MIMES));
    }

    if ($file->getSize() > self::MAX_FILE_SIZE) {
      Log::warning('❌ [SignatureService] File size exceeds limit', [
        'file_size' => $file->getSize(),
        'max_size' => self::MAX_FILE_SIZE,
      ]);
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

    if (!$path) {
      Log::error('❌ [SignatureService] Failed to store signature file', [
        'user_id' => $user->id,
        'file_name' => $file->getClientOriginalName(),
      ]);
      throw new InvalidSignatureFileException('Failed to store signature file');
    }

    Log::debug('✅ [SignatureService] Signature file stored', [
      'user_id' => $user->id,
      'path' => $path,
    ]);

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
}
