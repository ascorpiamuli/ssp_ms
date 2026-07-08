<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

abstract class BaseService
{
  /**
   * Begin a database transaction.
   */
  protected function beginTransaction(): void
  {
    DB::beginTransaction();
  }

  /**
   * Commit a database transaction.
   */
  protected function commitTransaction(): void
  {
    DB::commit();
  }

  /**
   * Rollback a database transaction.
   */
  protected function rollbackTransaction(): void
  {
    DB::rollBack();
  }

  /**
   * Execute a callback within a transaction.
   */
  protected function transaction(callable $callback)
  {
    return DB::transaction($callback);
  }

  /**
   * Get the current authenticated user.
   */
  protected function getAuthUser()
  {
    return auth()->user();
  }

  /**
   * Get the current authenticated user ID.
   */
  protected function getAuthUserId(): ?int
  {
    return auth()->id();
  }

  /**
   * Check if user is authenticated.
   */
  protected function isAuthenticated(): bool
  {
    return auth()->check();
  }
}
