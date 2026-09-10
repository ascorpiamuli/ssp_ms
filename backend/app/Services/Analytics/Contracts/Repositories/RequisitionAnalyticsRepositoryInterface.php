<?php
// app/services/analytics/contracts/repositories/RequisitionAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Requisition Analytics Repository Interface
 * Handles all requisition-related analytics queries
 */
interface RequisitionAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get requisition volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get requisition by status distribution
   */
  public function getStatusDistribution(array $filters = []): Collection;

  /**
   * Get requisition by department
   */
  public function getByDepartment(array $filters = []): Collection;

  /**
   * Get requisition by priority
   */
  public function getByPriority(array $filters = []): Collection;

  /**
   * Get requisition by type (goods/services)
   */
  public function getByType(array $filters = []): Collection;

  /**
   * Get requisition approval cycle time
   */
  public function getApprovalCycleTime(array $filters = []): array;

  /**
   * Get requisition return rate
   */
  public function getReturnRate(array $filters = []): float;

  /**
   * Get requisition conversion funnel
   */
  public function getConversionFunnel(array $filters = []): Collection;

  /**
   * Get average time in each status
   */
  public function getAverageTimeInStatus(array $filters = []): Collection;

  /**
   * Get top requisitioning departments
   */
  public function getTopDepartments(int $limit = 10, array $filters = []): Collection;

  /**
   * Get SLA compliance rate
   */
  public function getSlaComplianceRate(array $filters = []): float;

  /**
   * Get requisition value distribution
   */
  public function getValueDistribution(array $filters = []): Collection;

  /**
   * Get emergency requisition rate
   */
  public function getEmergencyRate(array $filters = []): float;

  /**
   * Get requisition revision statistics
   */
  public function getRevisionStats(array $filters = []): array;
}
