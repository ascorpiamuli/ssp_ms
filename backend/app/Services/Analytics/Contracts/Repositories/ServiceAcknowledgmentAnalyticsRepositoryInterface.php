<?php
// app/services/analytics/contracts/repositories/ServiceAcknowledgmentAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Service Acknowledgment Analytics Repository Interface
 * Handles SAN-specific analytics queries
 */
interface ServiceAcknowledgmentAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get SAN volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get SAN by status distribution
   */
  public function getStatusDistribution(array $filters = []): Collection;

  /**
   * Get SAN quality rating distribution
   */
  public function getQualityRatingDistribution(array $filters = []): Collection;

  /**
   * Get average quality rating by department
   */
  public function getAverageQualityRatingByDepartment(array $filters = []): Collection;

  /**
   * Get service performance by provider
   */
  public function getServicePerformanceByProvider(array $filters = []): Collection;



  /**
   * Get approval completion rate
   */
  public function getApprovalCompletionRate(array $filters = []): float;

  /**
   * Get quality rating by service category
   */
  public function getQualityRatingByCategory(array $filters = []): Collection;

  /**
   * Get service acknowledgment timeline
   */
  public function getAcknowledgmentTimeline(array $filters = []): array;

  /**
   * Get top performing service providers
   */
  public function getTopProviders(int $limit = 10, array $filters = []): Collection;
}
