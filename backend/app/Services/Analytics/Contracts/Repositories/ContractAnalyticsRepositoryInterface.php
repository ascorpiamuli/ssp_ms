<?php
// app/services/analytics/contracts/repositories/ContractAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Contract Analytics Repository Interface
 * Handles all contract-related analytics queries
 */
interface ContractAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get contract volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get contract by status distribution
   */
  public function getStatusDistribution(array $filters = []): Collection;

  /**
   * Get contract value distribution
   */
  public function getValueDistribution(array $filters = []): Collection;

  /**
   * Get contract renewal statistics
   */
  public function getRenewalStats(array $filters = []): array;

  /**
   * Get contracts expiring soon
   */
  public function getExpiringSoon(int $days = 30, array $filters = []): Collection;

  /**
   * Get contract by supplier
   */
  public function getBySupplier(array $filters = []): Collection;

  /**
   * Get average contract value
   */
  public function getAverageValue(array $filters = []): float;

  /**
   * Get contract completion rate
   */
  public function getCompletionRate(array $filters = []): float;

  /**
   * Get contract value by department
   */
  public function getValueByDepartment(array $filters = []): Collection;

  /**
   * Get contract lifecycle analysis
   */
  public function getLifecycleAnalysis(array $filters = []): array;

  /**
   * Get contract compliance rate
   */
  public function getComplianceRate(array $filters = []): float;
}
