<?php
// app/services/analytics/contracts/repositories/PurchaseOrderAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Purchase Order Analytics Repository Interface
 * Handles all purchase order-related analytics queries
 */
interface PurchaseOrderAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get PO volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get PO by status distribution
   */
  public function getStatusDistribution(array $filters = []): Collection;

  /**
   * Get PO by type (LPO/LSO)
   */
  public function getByType(array $filters = []): Collection;

  /**
   * Get PO value distribution
   */
  public function getValueDistribution(array $filters = []): Collection;

  /**
   * Get PO delivery performance
   */
  public function getDeliveryPerformance(array $filters = []): array;

  /**
   * Get average PO cycle time
   */
  public function getCycleTime(array $filters = []): array;

  /**
   * Get overdue POs
   */
  public function getOverdueStats(array $filters = []): array;

  /**
   * Get PO by supplier
   */
  public function getBySupplier(array $filters = []): Collection;

  /**
   * Get PO completion rate
   */
  public function getCompletionRate(array $filters = []): float;

  /**
   * Get PO by department
   */
  public function getByDepartment(array $filters = []): Collection;

  /**
   * Get PO signature workflow completion
   */
  public function getSignatureWorkflowStats(array $filters = []): array;

  /**
   * Get average time between PO stages
   */
  public function getStageTransitionTimes(array $filters = []): Collection;

  /**
   * Get top suppliers by PO value
   */
  public function getTopSuppliers(int $limit = 10, array $filters = []): Collection;
}
