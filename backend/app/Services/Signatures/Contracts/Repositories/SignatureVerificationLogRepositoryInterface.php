<?php
// app/Services/Signatures/Contracts/Repositories/SignatureVerificationLogRepositoryInterface.php

namespace App\Services\Signatures\Contracts\Repositories;

use App\Models\SignatureVerificationLog;
use Illuminate\Database\Eloquent\Collection;

interface SignatureVerificationLogRepositoryInterface
{
  public function all(): Collection;
  public function find(int $id): ?SignatureVerificationLog;
  public function getByVerification(int $verificationId): Collection;
  public function getByAction(string $action): Collection;
  public function getByStatus(string $status): Collection;
  public function getRecent(int $limit = 50): Collection;
  public function create(array $data): SignatureVerificationLog;
  public function logSuccess(int $verificationId, string $action, ?string $message = null, ?array $data = null, ?int $userId = null): SignatureVerificationLog;
  public function logFailure(int $verificationId, string $action, string $message, ?array $data = null, ?int $userId = null): SignatureVerificationLog;
  public function logPending(int $verificationId, string $action, ?string $message = null, ?array $data = null, ?int $userId = null): SignatureVerificationLog;
  public function getWithUserDetails(int $verificationId): Collection;
  public function getStats(): array;
  public function getAll(array $filters = []): Collection;
}
