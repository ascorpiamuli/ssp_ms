<?php
// app/services/analytics/Contracts/Services/PurchaseOrderAnalyticsServiceInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Services;

use Illuminate\Support\Collection;

interface PurchaseOrderAnalyticsServiceInterface extends AnalyticsServiceInterface
{
  public function getPurchaseOrderVolume(array $filters = []): array;
  public function getPurchaseOrderStatusDistribution(array $filters = []): Collection;
  public function getPurchaseOrderByType(array $filters = []): Collection;
  public function getPurchaseOrderValueDistribution(array $filters = []): Collection;
  public function getDeliveryPerformance(array $filters = []): array;
  public function getPurchaseOrderCycleTime(array $filters = []): array;
  public function getOverduePurchaseOrders(array $filters = []): array;
  public function getPurchaseOrderBySupplier(array $filters = []): Collection;
  public function getPurchaseOrderCompletionRate(array $filters = []): float;
  public function getPurchaseOrderTrends(string $interval = 'day', array $filters = []): Collection;
  public function getPurchaseOrderByDepartment(array $filters = []): Collection;
  public function getSignatureWorkflowAnalytics(array $filters = []): array;
  public function getStageTransitionTimes(array $filters = []): Collection;
  public function getTopSuppliers(int $limit = 10, array $filters = []): Collection;
}
