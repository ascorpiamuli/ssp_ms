<?php
// app/Services/Signatures/Contracts/Repositories/SignatureVerificationRepositoryInterface.php

namespace App\Services\Signatures\Contracts\Repositories;

use App\Models\SignatureVerification;
use Illuminate\Database\Eloquent\Collection;

interface SignatureVerificationRepositoryInterface
{
  public function all(): Collection;
  public function find(int $id): ?SignatureVerification;
  public function getUserVerifications(int $userId): Collection;
  public function getBySignatureSpecimen(int $specimenId): Collection;
  public function getByDocument(string $documentType, int $documentId): Collection;
  public function getByDocumentReference(string $reference): Collection;
  public function getPending(): Collection;
  public function getVerified(): Collection;
  public function getFailed(): Collection;
  public function create(array $data): SignatureVerification;
  public function update(int $id, array $data): SignatureVerification;
  public function markVerified(int $id, int $verifiedBy, ?array $data = null): SignatureVerification;
  public function markFailed(int $id, string $reason, ?array $data = null): SignatureVerification;
  public function saveQRCode(int $id, string $qrData, string $qrImage): SignatureVerification;
  public function verifyQRCode(int $id, string $qrData): bool;
}
