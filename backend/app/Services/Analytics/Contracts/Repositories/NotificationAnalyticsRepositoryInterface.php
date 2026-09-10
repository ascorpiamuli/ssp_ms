<?php
// app/services/analytics/contracts/repositories/NotificationAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Notification Analytics Repository Interface
 * Handles all notification-related analytics queries
 */
interface NotificationAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get notification volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get notification by type distribution
   */
  public function getByType(array $filters = []): Collection;

  /**
   * Get notification by channel distribution
   */
  public function getByChannel(array $filters = []): Collection;

  /**
   * Get notification delivery rate
   */
  public function getDeliveryRate(array $filters = []): float;

  /**
   * Get notification read rate
   */
  public function getReadRate(array $filters = []): float;

  /**
   * Get failed notifications analysis
   */
  public function getFailedNotifications(array $filters = []): Collection;

  /**
   * Get notification retry statistics
   */
  public function getRetryStats(array $filters = []): array;

  /**
   * Get notification by recipient
   */
  public function getByRecipient(array $filters = []): Collection;

  /**
   * Get notification channel effectiveness
   */
  public function getChannelEffectiveness(array $filters = []): Collection;

  /**
   * Get user notification preferences
   */
  public function getUserPreferences(array $filters = []): Collection;
}
