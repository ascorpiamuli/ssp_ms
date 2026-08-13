<?php
// app/Services/Signatures/Repositories/SignatureSpecimenRepository.php

namespace App\Services\Signatures\Repositories;

use App\Models\SignatureSpecimen;
use App\Services\Signatures\Contracts\Repositories\SignatureSpecimenRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SignatureSpecimenRepository implements SignatureSpecimenRepositoryInterface
{
  public function all(): Collection
  {
    return SignatureSpecimen::with(['user', 'verifiedBy'])->get();
  }

  public function find(int $id): ?SignatureSpecimen
  {
    return SignatureSpecimen::with(['user', 'verifiedBy'])->find($id);
  }

  /**
   * Find a signature specimen by its unique QR verification token
   */
  public function findByToken(string $token): ?SignatureSpecimen
  {
    return SignatureSpecimen::with(['user', 'verifiedBy'])
      ->where('qr_verification_token', $token)
      ->first();
  }

  public function getUserSignature(int $userId): ?SignatureSpecimen
  {
    return SignatureSpecimen::with(['user', 'verifiedBy'])
      ->where('user_id', $userId)
      ->latest()
      ->first();
  }

  public function getUserVerifiedSignature(int $userId): ?SignatureSpecimen
  {
    return SignatureSpecimen::with(['user', 'verifiedBy'])
      ->where('user_id', $userId)
      ->where('is_verified', true)
      ->where('status', 'approved')
      ->first();
  }

  public function getUserSignatures(int $userId): Collection
  {
    return SignatureSpecimen::with(['user', 'verifiedBy'])
      ->where('user_id', $userId)
      ->orderBy('created_at', 'desc')
      ->get();
  }

  public function create(array $data): SignatureSpecimen
  {
    return SignatureSpecimen::create($data);
  }

  public function update(int $id, array $data): SignatureSpecimen
  {
    $specimen = $this->find($id);
    if (!$specimen) {
      throw new \Exception('Signature specimen not found');
    }
    $specimen->update($data);
    return $specimen->fresh();
  }

  public function delete(int $id): bool
  {
    $specimen = $this->find($id);
    return $specimen ? $specimen->delete() : false;
  }

  public function verify(int $id, int $verifiedBy, ?string $notes = null): SignatureSpecimen
  {
    $specimen = $this->find($id);
    if (!$specimen) {
      throw new \Exception('Signature specimen not found');
    }
    $specimen->is_verified = true;
    $specimen->verified_at = now();
    $specimen->verified_by = $verifiedBy;
    $specimen->verification_notes = $notes;
    $specimen->status = 'approved';
    $specimen->save();
    return $specimen->fresh();
  }

  public function reject(int $id, ?string $reason = null): SignatureSpecimen
  {
    $specimen = $this->find($id);
    if (!$specimen) {
      throw new \Exception('Signature specimen not found');
    }
    $specimen->is_verified = false;
    $specimen->status = 'rejected';
    $specimen->verification_notes = $reason;
    $specimen->save();
    return $specimen->fresh();
  }

  public function getPending(): Collection
  {
    return SignatureSpecimen::with(['user', 'verifiedBy'])
      ->where('status', 'pending')
      ->orderBy('created_at', 'asc')
      ->get();
  }

  public function getVerified(): Collection
  {
    return SignatureSpecimen::with(['user', 'verifiedBy'])
      ->where('is_verified', true)
      ->where('status', 'approved')
      ->orderBy('verified_at', 'desc')
      ->get();
  }

  public function searchByUser(string $searchTerm): Collection
  {
    return SignatureSpecimen::with(['user', 'verifiedBy'])
      ->whereHas('user', function ($query) use ($searchTerm) {
        $query->where('first_name', 'like', "%{$searchTerm}%")
          ->orWhere('last_name', 'like', "%{$searchTerm}%")
          ->orWhere('email', 'like', "%{$searchTerm}%");
      })
      ->get();
  }
}
