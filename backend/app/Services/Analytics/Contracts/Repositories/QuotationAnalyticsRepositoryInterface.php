<?php
// app/services/analytics/contracts/repositories/QuotationAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Quotation Analytics Repository Interface
 * Handles all quotation and RFQ-related analytics queries
 */
interface QuotationAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get RFQ volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get RFQ by status distribution
   */
  public function getStatusDistribution(array $filters = []): Collection;

  /**
   * Get RFQ response rate
   */
  public function getResponseRate(array $filters = []): float;

  /**
   * Get RFQ by department
   */
  public function getByDepartment(array $filters = []): Collection;

  /**
   * Get quotation verification stats
   */
  public function getVerificationStats(array $filters = []): array;

  /**
   * Get average number of quotations per RFQ
   */
  public function getAverageQuotationsPerRfq(array $filters = []): float;

  /**
   * Get quotation evaluation statistics
   */
  public function getEvaluationStats(array $filters = []): array;


  /**
   * Get quotation acceptance rate
   */
  public function getAcceptanceRate(array $filters = []): float;

  /**
   * Get quotation verification turnaround time
   */
  public function getVerificationTurnaroundTime(array $filters = []): array;

  /**
   * Get RFQ closing soon analysis
   */
  public function getClosingSoonAnalysis(array $filters = []): Collection;

  /**
   * Get tender statistics
   */
  public function getTenderStats(array $filters = []): array;

  /**
   * Get tender success rate
   */
  public function getTenderSuccessRate(array $filters = []): float;
}
