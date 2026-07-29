<?php
// app/Services/Procurement/Contracts/Services/ProcurementServiceInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Services;

use App\Models\Requisition;

interface ProcurementServiceInterface
{
  /**
   * Start procurement for a requisition.
   */
  public function startProcurement(int $requisitionId): Requisition;

  /**
   * Get procurement status for a requisition.
   */
  public function getProcurementStatus(int $requisitionId): array;

  /**
   * Get procurement summary for a requisition.
   */
  public function getProcurementSummary(int $requisitionId): array;

  /**
   * Check if requisition has active procurement.
   */
  public function hasActiveProcurement(int $requisitionId): bool;

  /**
   * Complete procurement for a requisition.
   */
  public function completeProcurement(int $requisitionId): Requisition;

  /**
   * Cancel procurement for a requisition.
   */
  public function cancelProcurement(int $requisitionId, string $reason): Requisition;

  /**
   * Get procurement timeline for a requisition.
   */
  public function getProcurementTimeline(int $requisitionId): array;

  /**
   * Get procurement metrics for a requisition.
   */
  public function getProcurementMetrics(int $requisitionId): array;

  /**
   * Get all procurement steps for a requisition.
   */
  public function getProcurementSteps(int $requisitionId): array;

  /**
   * Check if procurement is completed.
   */
  public function isProcurementCompleted(int $requisitionId): bool;
}
