<?php
// app/Services/Signatures/Contracts/Repositories/SignatureSpecimenRepositoryInterface.php

namespace App\Services\Signatures\Contracts\Repositories;

use App\Models\SignatureSpecimen;
use Illuminate\Database\Eloquent\Collection;

interface SignatureSpecimenRepositoryInterface
{
  public function all(): Collection;
  public function find(int $id): ?SignatureSpecimen;
  public function getUserSignature(int $userId): ?SignatureSpecimen;
  public function getUserVerifiedSignature(int $userId): ?SignatureSpecimen;
  public function getUserSignatures(int $userId): Collection;
  public function create(array $data): SignatureSpecimen;
  public function update(int $id, array $data): SignatureSpecimen;
  public function delete(int $id): bool;
  public function verify(int $id, int $verifiedBy, ?string $notes = null): SignatureSpecimen;
  public function reject(int $id, ?string $reason = null): SignatureSpecimen;
  public function getPending(): Collection;
  public function getVerified(): Collection;
  public function searchByUser(string $searchTerm): Collection;
  public function findByToken(string $token): ?SignatureSpecimen;
}
