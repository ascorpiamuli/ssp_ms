<?php
// app/Services/Procurement/Base/BaseService.php

declare(strict_types=1);

namespace App\Services\Procurement\Base;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

abstract class BaseService
{
  protected ?User $currentUser;

  public function __construct()
  {
    $this->currentUser = auth()->user();
  }

  protected function getCurrentUser(): ?User
  {
    return $this->currentUser;
  }

  protected function getCurrentUserId(): ?int
  {
    return $this->currentUser?->id;
  }

  protected function beginTransaction(): void
  {
    DB::beginTransaction();
  }

  protected function commit(): void
  {
    DB::commit();
  }

  protected function rollback(): void
  {
    DB::rollBack();
  }

  protected function transaction(callable $callback)
  {
    return DB::transaction($callback);
  }

  protected function logError(string $message, array $context = []): void
  {
    Log::error($message, array_merge($context, [
      'service' => static::class,
      'user_id' => $this->getCurrentUserId(),
    ]));
  }

  protected function logInfo(string $message, array $context = []): void
  {
    Log::info($message, array_merge($context, [
      'service' => static::class,
      'user_id' => $this->getCurrentUserId(),
    ]));
  }

  protected function hasPermission(string $permission): bool
  {
    return $this->currentUser && $this->currentUser->can($permission);
  }

  protected function hasRole(string $role): bool
  {
    return $this->currentUser && $this->currentUser->hasRole($role);
  }

  protected function formatCurrency(float $amount, string $currency = 'KES'): string
  {
    return number_format($amount, 2) . ' ' . $currency;
  }

  protected function calculatePercentage(float $part, float $total): float
  {
    if ($total === 0.0) {
      return 0.0;
    }
    return round(($part / $total) * 100, 2);
  }
}
