<?php
// app/Services/Procurement/Base/BaseService.php

declare(strict_types=1);

namespace App\Services\Procurement\Base;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

abstract class BaseService
{
  protected ?User $currentUser;

  /**
   * Constructor - Gets the authenticated user
   * Note: This may be called before auth middleware runs
   * So we use a lazy loading approach
   */
  public function __construct()
  {
    // Try to get user immediately, but it might be null
    // if called before the middleware runs
    $this->currentUser = $this->getAuthenticatedUser();
  }

  /**
   * Get the authenticated user with multiple fallback attempts
   * This ensures we can get the user even if the service
   * was instantiated before the auth middleware ran
   */
  protected function getAuthenticatedUser(): ?User
  {
    // Try multiple approaches to get the authenticated user

    // 1. Try the default auth facade
    $user = Auth::user();
    if ($user) {
      return $user;
    }

    // 2. Try the Sanctum guard specifically
    $user = Auth::guard('sanctum')->user();
    if ($user) {
      return $user;
    }

    // 3. Try the web guard (for session-based auth)
    $user = Auth::guard('web')->user();
    if ($user) {
      return $user;
    }

    // 4. Try to get from the request (if available)
    if (request()->has('user') && request()->user() instanceof User) {
      return request()->user();
    }

    // 5. Check if we have a user ID in the request headers (custom)
    $userId = request()->header('X-User-Id');
    if ($userId) {
      $user = User::find($userId);
      if ($user) {
        return $user;
      }
    }

    // 6. Check if we have a user in the session
    if (session()->has('user_id')) {
      $user = User::find(session('user_id'));
      if ($user) {
        return $user;
      }
    }

    return null;
  }

  /**
   * Get the current user with lazy loading
   * This is the recommended method to use in child classes
   * It will attempt to get the user when needed, not just at construction time
   */
  protected function getCurrentUser(): ?User
  {
    // If we already have a user, return it
    if ($this->currentUser) {
      return $this->currentUser;
    }

    // Otherwise, try to get it now (lazy loading)
    $this->currentUser = $this->getAuthenticatedUser();
    return $this->currentUser;
  }

  /**
   * Get the current user ID
   */
  protected function getCurrentUserId(): ?int
  {
    $user = $this->getCurrentUser();
    return $user?->id;
  }

  /**
   * Check if a user is authenticated
   */
  protected function isAuthenticated(): bool
  {
    return $this->getCurrentUser() !== null;
  }

  /**
   * Require authentication - throws exception if not authenticated
   */
  protected function requireAuthentication(): User
  {
    $user = $this->getCurrentUser();
    if (!$user) {
      Log::error('Authentication required', [
        'service' => static::class,
        'method' => __METHOD__,
        'headers' => request()->headers->all(),
        'auth_check' => Auth::check(),
        'sanctum_user' => Auth::guard('sanctum')->user() ? 'exists' : 'null',
      ]);
      throw new \Exception('User must be authenticated to perform this action');
    }
    return $user;
  }

  /**
   * Begin a database transaction
   */
  protected function beginTransaction(): void
  {
    DB::beginTransaction();
  }

  /**
   * Commit a database transaction
   */
  protected function commit(): void
  {
    DB::commit();
  }

  /**
   * Rollback a database transaction
   */
  protected function rollback(): void
  {
    DB::rollBack();
  }

  /**
   * Execute a callback within a transaction
   */
  protected function transaction(callable $callback)
  {
    return DB::transaction($callback);
  }

  /**
   * Log an error message
   */
  protected function logError(string $message, array $context = []): void
  {
    Log::error($message, array_merge($context, [
      'service' => static::class,
      'user_id' => $this->getCurrentUserId(),
      'authenticated' => $this->isAuthenticated(),
    ]));
  }

  /**
   * Log an info message
   */
  protected function logInfo(string $message, array $context = []): void
  {
    Log::info($message, array_merge($context, [
      'service' => static::class,
      'user_id' => $this->getCurrentUserId(),
    ]));
  }

  /**
   * Check if the current user has a specific permission
   */
  protected function hasPermission(string $permission): bool
  {
    $user = $this->getCurrentUser();
    return $user && $user->can($permission);
  }

  /**
   * Check if the current user has a specific role
   */
  protected function hasRole(string $role): bool
  {
    $user = $this->getCurrentUser();
    return $user && $user->hasRole($role);
  }

  /**
   * Format currency amount
   */
  protected function formatCurrency(float $amount, string $currency = 'KES'): string
  {
    return number_format($amount, 2) . ' ' . $currency;
  }

  /**
   * Calculate percentage
   */
  protected function calculatePercentage(float $part, float $total): float
  {
    if ($total === 0.0) {
      return 0.0;
    }
    return round(($part / $total) * 100, 2);
  }

  /**
   * Check if the current user is a specific role
   */
  protected function isRole(string $role): bool
  {
    $user = $this->getCurrentUser();
    return $user && $user->role === $role;
  }

  /**
   * Check if the current user is an admin
   */
  protected function isAdmin(): bool
  {
    return $this->isRole('admin') || $this->isRole('administrator');
  }
}
