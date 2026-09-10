<?php
// app/services/analytics/contracts/services/AnalyticsExportServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Analytics Export Service Interface
 * Handles data export in various formats
 */
interface AnalyticsExportServiceInterface
{
  /**
   * Export to CSV
   */
  public function toCsv(array $data, string $filename, array $headers = []): mixed;

  /**
   * Export to Excel
   */
  public function toExcel(array $data, string $filename, array $headers = []): mixed;

  /**
   * Export to PDF
   */
  public function toPdf(array $data, string $filename, array $options = []): mixed;

  /**
   * Export to JSON
   */
  public function toJson(array $data, string $filename): mixed;

  /**
   * Export to XML
   */
  public function toXml(array $data, string $filename): mixed;

  /**
   * Queue export job
   */
  public function queueExport(array $data, string $format, string $filename, array $options = []): int;

  /**
   * Get export job status
   */
  public function getExportStatus(int $jobId): array;

  /**
   * Download exported file
   */
  public function downloadExport(string $filename): mixed;

  /**
   * Clean up old exports
   */
  public function cleanupExports(int $days = 7): int;

  /**
   * Get export history
   */
  public function getExportHistory(array $filters = []): Collection;

  /**
   * Stream large export
   */
  public function streamExport(callable $callback, string $format, string $filename): mixed;
}
