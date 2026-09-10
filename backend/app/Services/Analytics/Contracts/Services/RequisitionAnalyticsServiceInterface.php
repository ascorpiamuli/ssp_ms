<?php
// app/services/analytics/Contracts/Services/RequisitionAnalyticsServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;

interface RequisitionAnalyticsServiceInterface extends AnalyticsServiceInterface
{
  public function getRequisitionVolume(array $filters = []): array;
  public function getRequisitionStatusDistribution(array $filters = []): Collection;
  public function getRequisitionByDepartment(array $filters = []): Collection;
  public function getRequisitionByPriority(array $filters = []): Collection;
  public function getRequisitionByType(array $filters = []): Collection;
  public function getApprovalCycleAnalysis(array $filters = []): array;
  public function getRequisitionReturnAnalysis(array $filters = []): array;
  public function getConversionFunnel(array $filters = []): Collection;
  public function getRequisitionTrends(string $interval = 'day', array $filters = []): Collection;
  public function getSlaCompliance(array $filters = []): array;
  public function getValueDistribution(array $filters = []): Collection;
  public function getTopDepartments(int $limit = 10, array $filters = []): Collection;
  public function getEmergencyRequisitionMetrics(array $filters = []): array;
  public function getRequisitionItemAnalytics(array $filters = []): array;
  public function getDepartmentScorecard(int $departmentId, array $filters = []): array;
}
