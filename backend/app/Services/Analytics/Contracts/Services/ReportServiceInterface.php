<?php
// app/services/analytics/contracts/services/ReportServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Report Service Interface
 * Handles report generation, scheduling, and distribution
 */
interface ReportServiceInterface
{
  /**
   * Generate a report
   */
  public function generateReport(string $type, array $parameters = [], string $format = 'pdf'): mixed;

  /**
   * Schedule a report
   */
  public function scheduleReport(string $name, string $type, array $parameters, string $schedule, array $recipients): int;

  /**
   * Get scheduled reports
   */
  public function getScheduledReports(array $filters = []): Collection;

  /**
   * Cancel a scheduled report
   */
  public function cancelScheduledReport(int $scheduleId): bool;

  /**
   * Get available report templates
   */
  public function getReportTemplates(): Collection;

  /**
   * Export data in various formats
   */
  public function exportData(string $entity, string $format = 'csv', array $filters = []): mixed;

  /**
   * Generate a custom report
   */
  public function generateCustomReport(array $columns, array $filters = [], string $format = 'pdf'): mixed;

  /**
   * Get report history
   */
  public function getReportHistory(array $filters = []): Collection;

  /**
   * Download a generated report
   */
  public function downloadReport(int $reportId): mixed;
}
