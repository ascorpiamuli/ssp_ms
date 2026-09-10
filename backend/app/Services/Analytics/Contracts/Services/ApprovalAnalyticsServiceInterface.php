<?php
// app/services/analytics/Contracts/Services/ApprovalAnalyticsServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;

interface ApprovalAnalyticsServiceInterface extends AnalyticsServiceInterface
{
  public function getApprovalVolume(array $filters = []): array;
  public function getApprovalStatusDistribution(array $filters = []): Collection;
  public function getApprovalByLevel(array $filters = []): Collection;
  public function getApprovalPerformance(array $filters = []): array;
  public function getPendingApprovals(array $filters = []): Collection;
  public function getApproverWorkload(array $filters = []): Collection;
  public function getDelegationAnalytics(array $filters = []): array;
  public function getEscalationAnalytics(array $filters = []): array;
  public function getApprovalTrends(string $interval = 'day', array $filters = []): Collection;
  public function getReturnRateByApprover(array $filters = []): Collection;
  public function getSlaCompliance(array $filters = []): array;
  public function getApprovalBottlenecks(array $filters = []): Collection;
}
