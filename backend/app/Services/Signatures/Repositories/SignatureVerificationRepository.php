<?php
// app/Services/Signatures/Repositories/SignatureVerificationRepository.php

namespace App\Services\Signatures\Repositories;

use App\Models\SignatureVerification;
use App\Services\Signatures\Contracts\Repositories\SignatureVerificationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SignatureVerificationRepository implements SignatureVerificationRepositoryInterface
{
  public function all(): Collection
  {
    return SignatureVerification::with(['user', 'verifiedBy', 'signatureSpecimen'])->get();
  }

  public function find(int $id): ?SignatureVerification
  {
    return SignatureVerification::with(['user', 'verifiedBy', 'signatureSpecimen'])->find($id);
  }

  public function getUserVerifications(int $userId): Collection
  {
    return SignatureVerification::with(['user', 'verifiedBy', 'signatureSpecimen'])
      ->where('user_id', $userId)
      ->orderBy('created_at', 'desc')
      ->get();
  }

  public function getBySignatureSpecimen(int $specimenId): Collection
  {
    return SignatureVerification::with(['user', 'verifiedBy', 'signatureSpecimen'])
      ->where('signature_specimen_id', $specimenId)
      ->orderBy('created_at', 'desc')
      ->get();
  }

  public function getByDocument(string $documentType, int $documentId): Collection
  {
    return SignatureVerification::with(['user', 'verifiedBy', 'signatureSpecimen'])
      ->where('document_type', $documentType)
      ->where('document_id', $documentId)
      ->orderBy('created_at', 'desc')
      ->get();
  }

  public function getByDocumentReference(string $reference): Collection
  {
    return SignatureVerification::with(['user', 'verifiedBy', 'signatureSpecimen'])
      ->where('document_reference', $reference)
      ->orderBy('created_at', 'desc')
      ->get();
  }

  public function getPending(): Collection
  {
    return SignatureVerification::with(['user', 'verifiedBy', 'signatureSpecimen'])
      ->where('verification_status', 'pending')
      ->orderBy('created_at', 'asc')
      ->get();
  }

  public function getVerified(): Collection
  {
    return SignatureVerification::with(['user', 'verifiedBy', 'signatureSpecimen'])
      ->where('verification_status', 'verified')
      ->orderBy('verified_at', 'desc')
      ->get();
  }

  public function getFailed(): Collection
  {
    return SignatureVerification::with(['user', 'verifiedBy', 'signatureSpecimen'])
      ->where('verification_status', 'failed')
      ->orderBy('created_at', 'desc')
      ->get();
  }

  public function create(array $data): SignatureVerification
  {
    return SignatureVerification::create($data);
  }

  public function update(int $id, array $data): SignatureVerification
  {
    $verification = $this->find($id);
    if (!$verification) {
      throw new \Exception('Signature verification not found');
    }
    $verification->update($data);
    return $verification->fresh();
  }

  public function markVerified(int $id, int $verifiedBy, ?array $data = null): SignatureVerification
  {
    $verification = $this->find($id);
    if (!$verification) {
      throw new \Exception('Signature verification not found');
    }
    $verification->verification_status = 'verified';
    $verification->verified_by = $verifiedBy;
    $verification->verified_at = now();

    if ($data) {
      $verification->verification_data = json_encode($data);
    }

    $verification->save();
    return $verification->fresh();
  }

  public function markFailed(int $id, string $reason, ?array $data = null): SignatureVerification
  {
    $verification = $this->find($id);
    if (!$verification) {
      throw new \Exception('Signature verification not found');
    }
    $verification->verification_status = 'failed';
    $verification->failure_reason = $reason;

    if ($data) {
      $verification->verification_data = json_encode($data);
    }

    $verification->save();
    return $verification->fresh();
  }

  public function saveQRCode(int $id, string $qrData, string $qrImage): SignatureVerification
  {
    $verification = $this->find($id);
    if (!$verification) {
      throw new \Exception('Signature verification not found');
    }
    $verification->qr_code_data = $qrData;
    $verification->qr_code_image = $qrImage;
    $verification->save();
    return $verification->fresh();
  }

  public function verifyQRCode(int $id, string $qrData): bool
  {
    $verification = $this->find($id);
    if (!$verification) {
      return false;
    }

    try {
      $data = json_decode($qrData, true);

      if (!isset($data['verification_id']) || $data['verification_id'] != $id) {
        return false;
      }

      if (!isset($data['signature_id']) || $data['signature_id'] != $verification->signature_specimen_id) {
        return false;
      }

      if (!isset($data['user_id']) || $data['user_id'] != $verification->user_id) {
        return false;
      }

      return true;
    } catch (\Exception $e) {
      return false;
    }
  }
}
