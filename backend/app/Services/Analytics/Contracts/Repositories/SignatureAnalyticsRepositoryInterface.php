<?php
// app/services/analytics/contracts/repositories/SignatureAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Signature Analytics Repository Interface
 * Handles digital signature analytics queries
 */
interface SignatureAnalyticsRepositoryInterface extends AnalyticsRepositoryInterface
{
  /**
   * Get signature volume statistics
   */
  public function getVolumeStats(array $filters = []): array;

  /**
   * Get signature verification success rate
   */
  public function getVerificationSuccessRate(array $filters = []): float;

  /**
   * Get signature verification by method
   */
  public function getByVerificationMethod(array $filters = []): Collection;

  /**
   * Get signature verification by document type
   */
  public function getByDocumentType(array $filters = []): Collection;

  /**
   * Get average verification time
   */
  public function getAverageVerificationTime(array $filters = []): array;

  /**
   * Get signature status distribution
   */
  public function getStatusDistribution(array $filters = []): Collection;

  /**
   * Get QR code scan statistics
   */
  public function getQrCodeScanStats(array $filters = []): array;

  /**
   * Get verification failure reasons
   */
  public function getFailureReasons(array $filters = []): Collection;

  /**
   * Get user signature adoption rate
   */
  public function getSignatureAdoptionRate(array $filters = []): float;

  /**
   * Get verifier workload
   */
  public function getVerifierWorkload(array $filters = []): Collection;
}
