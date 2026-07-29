<?php
// app/Services/Procurement/Contracts/Utilities/NotificationDispatcherInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Utilities;

interface NotificationDispatcherInterface
{
  /**
   * Send a notification for a specific event.
   */
  public function notify(string $event, array $data): void;

  /**
   * Send notification to a specific user.
   */
  public function notifyUser(int $userId, string $event, array $data): void;

  /**
   * Send notification to a specific supplier.
   */
  public function notifySupplier(int $supplierId, string $event, array $data): void;

  /**
   * Send notification to all users with a specific role.
   */
  public function notifyRole(string $role, string $event, array $data): void;

  /**
   * Send notification to multiple users.
   */
  public function notifyUsers(array $userIds, string $event, array $data): void;

  /**
   * Send notification to multiple suppliers.
   */
  public function notifySuppliers(array $supplierIds, string $event, array $data): void;

  /**
   * Get notification channels for a user.
   */
  public function getUserChannels(int $userId): array;

  /**
   * Get notification channels for a supplier.
   */
  public function getSupplierChannels(int $supplierId): array;

  /**
   * Get all available notification channels.
   */
  public function getAvailableChannels(): array;

  /**
   * Register a notification event.
   */
  public function registerEvent(string $event, array $config): void;

  /**
   * Get event configuration.
   */
  public function getEventConfig(string $event): array;

  /**
   * Check if event exists.
   */
  public function eventExists(string $event): bool;

  /**
   * Get all registered events.
   */
  public function getRegisteredEvents(): array;

  /**
   * Set notification priority for an event.
   */
  public function setPriority(string $event, string $priority): void;

  /**
   * Get notification priority for an event.
   */
  public function getPriority(string $event): string;

  /**
   * Send bulk notifications.
   */
  public function notifyBulk(array $notifications): void;

  /**
   * Queue a notification for later delivery.
   */
  public function queueNotification(string $event, array $data, ?\DateTime $delay = null): void;

  /**
   * Get notification history for a user.
   */
  public function getNotificationHistory(int $userId, int $limit = 50): array;

  /**
   * Get notification statistics.
   */
  public function getNotificationStatistics(): array;

  /**
   * Mark notification as read.
   */
  public function markAsRead(int $notificationId): void;

  /**
   * Mark all notifications as read for a user.
   */
  public function markAllAsRead(int $userId): void;

  /**
   * Get unread notification count for a user.
   */
  public function getUnreadCount(int $userId): int;
}
