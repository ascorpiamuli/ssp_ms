<?php
// app/Services/Signatures/Repositories/SignatureVerificationLogRepository.php

namespace App\Services\Signatures\Repositories;

use App\Models\SignatureVerificationLog;
use App\Services\Signatures\Contracts\Repositories\SignatureVerificationLogRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SignatureVerificationLogRepository implements SignatureVerificationLogRepositoryInterface
{
  public function all(): Collection
  {
    return SignatureVerificationLog::with(['verification', 'createdBy'])->get();
  }

  public function find(int $id): ?SignatureVerificationLog
  {
    return SignatureVerificationLog::with(['verification', 'createdBy'])->find($id);
  }

  public function getByVerification(int $verificationId): Collection
  {
    return SignatureVerificationLog::with(['verification', 'createdBy'])
      ->where('signature_verification_id', $verificationId)
      ->orderBy('created_at', 'desc')
      ->get();
  }

  public function getByAction(string $action): Collection
  {
    return SignatureVerificationLog::with(['verification', 'createdBy'])
      ->where('action', $action)
      ->orderBy('created_at', 'desc')
      ->get();
  }

  public function getByStatus(string $status): Collection
  {
    return SignatureVerificationLog::with(['verification', 'createdBy'])
      ->where('status', $status)
      ->orderBy('created_at', 'desc')
      ->get();
  }

  public function getRecent(int $limit = 50): Collection
  {
    return SignatureVerificationLog::with(['verification', 'createdBy'])
      ->orderBy('created_at', 'desc')
      ->limit($limit)
      ->get();
  }

  public function create(array $data): SignatureVerificationLog
  {
    // If signature_verification_id is 0 or null, set to null (not 0)
    if (isset($data['signature_verification_id'])) {
      if ($data['signature_verification_id'] === 0 || $data['signature_verification_id'] === '0') {
        $data['signature_verification_id'] = null;
      }
    }

    // If it's not set at all, set to null
    if (!isset($data['signature_verification_id'])) {
      $data['signature_verification_id'] = null;
    }

    return SignatureVerificationLog::create($data);
  }

  public function logSuccess(int $verificationId, string $action, ?string $message = null, ?array $data = null, ?int $userId = null): SignatureVerificationLog
  {
    $logData = [
      'action' => $action,
      'status' => 'success',
      'message' => $message,
      'data' => $data,
      'created_by' => $userId,
    ];

    // Only set verification_id if it's > 0
    if ($verificationId > 0) {
      $logData['signature_verification_id'] = $verificationId;
    }

    return $this->create($logData);
  }

  public function logFailure(int $verificationId, string $action, string $message, ?array $data = null, ?int $userId = null): SignatureVerificationLog
  {
    $logData = [
      'action' => $action,
      'status' => 'failed',
      'message' => $message,
      'data' => $data,
      'created_by' => $userId,
    ];

    if ($verificationId > 0) {
      $logData['signature_verification_id'] = $verificationId;
    }

    return $this->create($logData);
  }

  public function logPending(int $verificationId, string $action, ?string $message = null, ?array $data = null, ?int $userId = null): SignatureVerificationLog
  {
    $logData = [
      'action' => $action,
      'status' => 'pending',
      'message' => $message,
      'data' => $data,
      'created_by' => $userId,
    ];

    if ($verificationId > 0) {
      $logData['signature_verification_id'] = $verificationId;
    }

    return $this->create($logData);
  }

  public function getWithUserDetails(int $verificationId): Collection
  {
    return $this->getByVerification($verificationId);
  }

  public function getStats(): array
  {
    return [
      'total' => SignatureVerificationLog::count(),
      'success' => SignatureVerificationLog::where('status', 'success')->count(),
      'failed' => SignatureVerificationLog::where('status', 'failed')->count(),
      'pending' => SignatureVerificationLog::where('status', 'pending')->count(),
      'by_action' => SignatureVerificationLog::selectRaw('action, count(*) as count')
        ->groupBy('action')
        ->get()
        ->toArray(),
    ];
  }
  public function getAll(array $filters = []): Collection
  {
    $query = SignatureVerificationLog::query()
      ->with(['verification', 'createdBy']) // ✅ FIXED: Changed from 'user' to 'createdBy'
      ->orderBy('created_at', 'desc');

    if (isset($filters['action'])) {
      $query->where('action', $filters['action']);
    }

    if (isset($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (isset($filters['user_id'])) {
      $query->where('created_by', $filters['user_id']);
    }

    if (isset($filters['date_from'])) {
      $query->whereDate('created_at', '>=', $filters['date_from']);
    }

    if (isset($filters['date_to'])) {
      $query->whereDate('created_at', '<=', $filters['date_to']);
    }

    return $query->get();
  }
}
