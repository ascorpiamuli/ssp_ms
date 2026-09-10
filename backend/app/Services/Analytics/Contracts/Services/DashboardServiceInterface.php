<?php
// app/services/analytics/contracts/services/DashboardServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Dashboard Service Interface
 * Handles dashboard configurations, widgets, and real-time data
 */
interface DashboardServiceInterface
{
  /**
   * Get dashboard configuration
   */
  public function getDashboardConfig(string $dashboard = 'default'): array;

  /**
   * Get widget data
   */
  public function getWidgetData(string $widgetId, array $parameters = []): array;

  /**
   * Get real-time dashboard data
   */
  public function getRealTimeData(array $widgets = []): array;

  /**
   * Save dashboard layout
   */
  public function saveDashboardLayout(array $layout, ?int $userId = null): bool;

  /**
   * Get user dashboard preferences
   */
  public function getUserDashboardPreferences(int $userId): array;

  /**
   * Get available widgets
   */
  public function getAvailableWidgets(): Collection;

  /**
   * Create a custom widget
   */
  public function createCustomWidget(array $config): int;

  /**
   * Update widget configuration
   */
  public function updateWidgetConfig(int $widgetId, array $config): bool;

  /**
   * Delete a widget
   */
  public function deleteWidget(int $widgetId): bool;

  /**
   * Get widget data with caching
   */
  public function getWidgetDataWithCache(string $widgetId, array $parameters = [], int $ttl = 300): array;

  /**
   * Refresh dashboard data
   */
  public function refreshDashboardData(string $dashboard = 'default'): array;

  /**
   * Get widget performance metrics
   */
  public function getWidgetPerformance(array $filters = []): Collection;
}
