<?php
// app/services/analytics/contracts/repositories/TenderAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Tender Analytics Repository Interface
 * Handles tender-specific analytics queries
 */
interface TenderAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get tender volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get tender by status distribution
   */
  public function getStatusDistribution(array $filters = []): Collection;

  /**
   * Get tender value distribution
   */
  public function getValueDistribution(array $filters = []): Collection;

  /**
   * Get average number of bidders
   */
  public function getAverageBidders(array $filters = []): float;

  /**
   * Get tender success rate
   */
  public function getSuccessRate(array $filters = []): float;

  /**
   * Get tender award rate
   */
  public function getAwardRate(array $filters = []): float;

  /**
   * Get average award vs estimated value
   */
  public function getAverageAwardVariance(array $filters = []): array;


  /**
   * Get tenders closing soon
   */
  public function getClosingSoon(int $days = 7, array $filters = []): Collection;

  /**
   * Get bidder participation rate
   */
  public function getBidderParticipationRate(array $filters = []): float;

  /**
   * Get tender by department
   */
  public function getByDepartment(array $filters = []): Collection;

  /**
   * Get tender evaluation timeline
   */
  public function getEvaluationTimeline(array $filters = []): array;
}
