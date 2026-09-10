<?php
// app/services/analytics/contracts/repositories/ApprovalAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Approval Analytics Repository Interface
 * Handles all approval-related analytics queries
 */
interface ApprovalAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get approval volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get approval by status distribution
   */
  public function getStatusDistribution(array $filters = []): Collection;

  /**
   * Get approval by level distribution
   */
  public function getByLevel(array $filters = []): Collection;

  /**
   * Get average approval time by level
   */
  public function getAverageTimeByLevel(array $filters = []): Collection;

  /**
   * Get approval rate by level
   */
  public function getApprovalRateByLevel(array $filters = []): Collection;

  /**
   * Get pending approvals by approver
   */
  public function getPendingByApprover(array $filters = []): Collection;

  /**
   * Get delegation statistics
   */
  public function getDelegationStats(array $filters = []): array;

  /**
   * Get escalation statistics
   */
  public function getEscalationStats(array $filters = []): array;

  /**
   * Get approval bottleneck analysis
   */
  public function getBottleneckAnalysis(array $filters = []): Collection;


  /**
   * Get approval SLA compliance rate
   */
  public function getSlaComplianceRate(array $filters = []): float;

  /**
   * Get approval workload by approver
   */
  public function getWorkloadByApprover(array $filters = []): Collection;

  /**
   * Get approval cycle time breakdown
   */
  public function getCycleTimeBreakdown(array $filters = []): array;

  /**
   * Get approval return rate by approver
   */
  public function getReturnRateByApprover(array $filters = []): Collection;
}
