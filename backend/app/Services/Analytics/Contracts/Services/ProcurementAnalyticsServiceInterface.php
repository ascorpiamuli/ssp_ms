<?php
// app/services/analytics/contracts/services/ProcurementAnalyticsServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Procurement Analytics Service Interface
 * Handles all procurement-related analytics (requisitions, approvals, POs, GRNs, contracts)
 */
interface ProcurementAnalyticsServiceInterface extends AnalyticsServiceInterface
{
  /**
   * Get procurement volume metrics
   */
  public function getVolumeMetrics(array $filters = []): array;

  /**
   * Get procurement cycle time analysis
   */
  public function getCycleTimeAnalysis(array $filters = []): array;

  /**
   * Get procurement by department
   */
  public function getByDepartment(array $filters = []): Collection;

  /**
   * Get requisition approval funnel
   */
  public function getApprovalFunnel(array $filters = []): array;

  /**
   * Get purchase order performance
   */
  public function getPurchaseOrderPerformance(array $filters = []): array;

  /**
   * Get goods receiving quality metrics
   */
  public function getGoodsReceivedQuality(array $filters = []): array;

  /**
   * Get contract performance
   */
  public function getContractPerformance(array $filters = []): array;

  /**
   * Get SLA compliance
   */
  public function getSlaCompliance(array $filters = []): array;

  /**
   * Get procurement trend over time
   */
  public function getProcurementTrends(string $interval = 'day', array $filters = []): Collection;

  /**
   * Get bottleneck analysis
   */
  public function getBottlenecks(array $filters = []): Collection;

  /**
   * Get department scorecard
   */
  public function getDepartmentScorecard(int $departmentId, array $filters = []): array;
}
