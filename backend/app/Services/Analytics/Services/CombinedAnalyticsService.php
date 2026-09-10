<?php
// app/services/analytics/Services/CombinedAnalyticsService.php

declare(strict_types=1);

namespace App\Services\Analytics\Services;

use App\Services\Analytics\Contracts\Services\CombinedAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\RequisitionAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\ApprovalAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\PurchaseOrderAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\SupplierAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\FinancialAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\OperationAnalyticsServiceInterface;
use Illuminate\Support\Collection;

class CombinedAnalyticsService implements CombinedAnalyticsServiceInterface
{
  public function __construct(
    protected RequisitionAnalyticsServiceInterface $requisitionService,
    protected ApprovalAnalyticsServiceInterface $approvalService,
    protected PurchaseOrderAnalyticsServiceInterface $poService,
    protected SupplierAnalyticsServiceInterface $supplierService,
    protected FinancialAnalyticsServiceInterface $financialService,
    protected OperationAnalyticsServiceInterface $operationService
  ) {}

  public function getExecutiveDashboard(array $filters = []): array
  {
    return [
      'procurement_summary' => $this->requisitionService->getSummary($filters),
      'financial_summary' => $this->financialService->getSummary($filters),
      'supplier_summary' => $this->supplierService->getSummary($filters),
      'operational_summary' => $this->operationService->getSummary($filters),
      'key_metrics' => $this->getKeyMetrics($filters),
    ];
  }

  public function getProcurementDashboard(array $filters = []): array
  {
    return [
      'requisitions' => $this->requisitionService->getDashboardMetrics($filters),
      'approvals' => $this->approvalService->getDashboardMetrics($filters),
      'purchase_orders' => $this->poService->getDashboardMetrics($filters),
      'suppliers' => $this->supplierService->getDashboardMetrics($filters),
    ];
  }

  public function getFinancialDashboard(array $filters = []): array
  {
    return [
      'budget' => $this->financialService->getBudgetVsActual($filters),
      'invoices' => $this->financialService->getInvoiceMetrics($filters),
      'payments' => $this->financialService->getPaymentCycleAnalysis($filters),
      'spending' => $this->financialService->getSpendingAnalysis($filters),
      'cost_savings' => $this->financialService->getCostSavings($filters),
    ];
  }

  public function getOperationalDashboard(array $filters = []): array
  {
    return [
      'user_activity' => $this->operationService->getUserActivity($filters),
      'system_health' => $this->operationService->getSystemHealth($filters),
      'bottlenecks' => $this->operationService->getWorkflowBottlenecks($filters),
      'usage_patterns' => $this->operationService->getUsagePatterns($filters),
      'audit_summary' => $this->operationService->getAuditSummary($filters),
      'notifications' => $this->operationService->getNotificationEffectiveness($filters),
    ];
  }

  public function getSupplierDashboard(array $filters = []): array
  {
    return [
      'supplier_summary' => $this->supplierService->getSummary($filters),
      'top_suppliers' => $this->supplierService->getTopSuppliersBySpend(10, $filters),
      'delivery_performance' => $this->supplierService->getSupplierDeliveryPerformance($filters),
      'quality_ratings' => $this->supplierService->getSupplierQualityRatings($filters),
      'quotation_responses' => $this->supplierService->getQuotationResponseRates($filters),
      'risk_assessment' => $this->getSupplierRiskMetrics($filters),
    ];
  }

  public function getDepartmentDashboard(int $departmentId, array $filters = []): array
  {
    $filters['department_id'] = $departmentId;

    return [
      'requisitions' => $this->requisitionService->getRequisitionByDepartment($filters),
      'budget' => $this->financialService->getBudgetUtilization($filters),
      'performance' => $this->requisitionService->getDepartmentScorecard($departmentId, $filters),
      'spending' => $this->financialService->getSpendingAnalysis($filters),
      'approvals' => $this->approvalService->getApprovalByLevel($filters),
    ];
  }

  public function getKpiReport(array $filters = []): array
  {
    return [
      'procurement_kpis' => $this->requisitionService->getProcurementKpis($filters),
      'financial_kpis' => $this->financialService->getProcurementKpis($filters),
      'supplier_kpis' => $this->supplierService->getProcurementKpis($filters),
      'operational_kpis' => $this->operationService->getProcurementKpis($filters),
    ];
  }

  public function getMultiMetricTrends(array $metrics, string $interval = 'day', array $filters = []): Collection
  {
    $results = collect();

    foreach ($metrics as $metric) {
      $data = $this->getTrendForMetric($metric, $interval, $filters);
      $results->put($metric, $data);
    }

    return $results;
  }

  public function getComparativeAnalysis(string $dimension, array $metrics, array $filters = []): Collection
  {
    $results = collect();

    switch ($dimension) {
      case 'department':
        $departments = $this->requisitionService->getRequisitionByDepartment($filters);
        foreach ($departments as $dept) {
          $deptFilters = array_merge($filters, ['department_id' => $dept['department_id']]);
          $row = ['department' => $dept['department_name']];
          foreach ($metrics as $metric) {
            $row[$metric] = $this->getMetricValue($metric, $deptFilters);
          }
          $results->push($row);
        }
        break;

      case 'supplier':
        $suppliers = $this->supplierService->getTopSuppliersBySpend(10, $filters);
        foreach ($suppliers as $supplier) {
          $supplierFilters = array_merge($filters, ['supplier_id' => $supplier['supplier_id']]);
          $row = ['supplier' => $supplier['supplier_name']];
          foreach ($metrics as $metric) {
            $row[$metric] = $this->getMetricValue($metric, $supplierFilters);
          }
          $results->push($row);
        }
        break;

      case 'status':
        $statuses = ['draft', 'submitted', 'hod_approved', 'final_approved', 'cancelled'];
        foreach ($statuses as $status) {
          $statusFilters = array_merge($filters, ['status' => $status]);
          $row = ['status' => $status];
          foreach ($metrics as $metric) {
            $row[$metric] = $this->getMetricValue($metric, $statusFilters);
          }
          $results->push($row);
        }
        break;

      default:
        $groups = $this->getUniqueValues($dimension, $filters);
        foreach ($groups as $group) {
          $groupFilters = array_merge($filters, [$dimension => $group]);
          $row = [$dimension => $group];
          foreach ($metrics as $metric) {
            $row[$metric] = $this->getMetricValue($metric, $groupFilters);
          }
          $results->push($row);
        }
    }

    return $results;
  }

  protected function getKeyMetrics(array $filters = []): array
  {
    $volume = $this->requisitionService->getRequisitionVolume($filters);
    $financial = $this->financialService->getProcurementKpis($filters);
    $supplier = $this->supplierService->getProcurementKpis($filters);
    $operational = $this->operationService->getProcurementKpis($filters);

    return [
      'total_requisitions' => $volume['total'] ?? 0,
      'total_spend' => $financial['financial']['budget']['total_spent'] ?? 0,
      'active_suppliers' => $supplier['volume']['active'] ?? 0,
      'avg_approval_time' => $this->requisitionService->getApprovalCycleAnalysis($filters)['cycle_time']['total_cycle'] ?? 0,
      'sla_compliance' => $this->requisitionService->getSlaCompliance($filters)['compliance_rate'] ?? 0,
      'system_health' => $operational['system_health']['overall_status'] ?? 'unknown',
    ];
  }

  protected function getTrendForMetric(string $metric, string $interval, array $filters): Collection
  {
    if (str_starts_with($metric, 'requisition_')) {
      return $this->requisitionService->getTrend(str_replace('requisition_', '', $metric), $interval, $filters);
    } elseif (str_starts_with($metric, 'financial_')) {
      return $this->financialService->getTrend(str_replace('financial_', '', $metric), $interval, $filters);
    } elseif (str_starts_with($metric, 'supplier_')) {
      return $this->supplierService->getTrend(str_replace('supplier_', '', $metric), $interval, $filters);
    } elseif (str_starts_with($metric, 'operation_')) {
      return $this->operationService->getTrend(str_replace('operation_', '', $metric), $interval, $filters);
    }
    return collect();
  }

  protected function getMetricValue(string $metric, array $filters): mixed
  {
    $metricMap = [
      'total_requisitions' => fn() => $this->requisitionService->getRequisitionVolume($filters)['total'] ?? 0,
      'total_spend' => fn() => $this->financialService->getProcurementKpis($filters)['financial']['budget']['total_spent'] ?? 0,
      'avg_approval_time' => fn() => $this->requisitionService->getApprovalCycleAnalysis($filters)['cycle_time']['total_cycle'] ?? 0,
      'sla_compliance' => fn() => $this->requisitionService->getSlaCompliance($filters)['compliance_rate'] ?? 0,
      'supplier_count' => fn() => $this->supplierService->getSupplierVolume($filters)['total'] ?? 0,
      'budget_utilization' => fn() => $this->financialService->getBudgetUtilization($filters)->avg('utilization_rate') ?? 0,
      'invoice_payment_rate' => fn() => $this->financialService->getInvoiceMetrics($filters)['matching']['match_rate'] ?? 0,
      'user_activity_count' => fn() => $this->operationService->getUserActivity($filters)['total'] ?? 0,
      'system_health_status' => fn() => $this->operationService->getSystemHealth($filters)['overall_status'] ?? 'unknown',
    ];

    return $metricMap[$metric] ?? null;
  }

  protected function getUniqueValues(string $field, array $filters): array
  {
    $model = match ($field) {
      'department_id' => \App\Models\Department::class,
      'supplier_id' => \App\Models\Supplier::class,
      'status' => \App\Models\Requisition::class,
      default => null,
    };

    if ($model) {
      return $model::distinct()->pluck($field)->toArray();
    }

    return [];
  }

  protected function getSupplierRiskMetrics(array $filters = []): array
  {
    // Simplified risk metrics
    return [
      'high_risk_suppliers' => 0,
      'medium_risk_suppliers' => 0,
      'low_risk_suppliers' => 0,
    ];
  }
}
