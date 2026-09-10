// frontend/src/hooks/useAnalytics.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import type {
  AnalyticsFilters,
  ExecutiveDashboard,
  ProcurementDashboard,
  FinancialDashboard,
  OperationalDashboard,
  SupplierDashboard,
  DepartmentDashboard,
  KeyMetrics,
  RequisitionAnalyticsSummary,
  TrendDataPoint,
  ApprovalCycleAnalysis,
  RequisitionReturnAnalysis,
  ConversionFunnel,
  SlaCompliance,
  EmergencyRequisitionMetrics,
  RequisitionItemAnalytics,
  DepartmentScorecard,
  ApprovalStats,
  ApprovalPerformance,
  ApproverWorkload,
  DelegationStats,
  EscalationStats,
  WorkflowBottleneck,
  PurchaseOrderAnalyticsSummary,
  PurchaseOrderDeliveryPerformance,
  PurchaseOrderCycleTime,
  PurchaseOrderOverdue,
  SignatureWorkflowStats,
  FinancialSummary,
  BudgetUtilization,
  SpendingAnalysis,
  InvoiceMetrics,
  PaymentMetrics,
  CostSavings,
  BudgetVariance,
  SupplierAnalyticsSummary,
  SupplierPerformance,
  SupplierComparison,
  SupplierDeliveryPerformance,
  SupplierQualityRating,
  QuotationResponseRate,
  SupplierRiskAssessment,
  SupplierSpendAnalysis,
  TopSupplier,
  OperationSummary,
  SystemHealth,
  UserActivityStats,
  AuditSummary,
  NotificationStats,
  SignatureAdoption,
  UsagePatterns,
  UserPerformance,
  ErrorAnalytics,
  BackupStatus,
  OverdueInvoice,
} from '@/types/analytics.types';

// ============================================
// QUERY KEYS
// ============================================

export const analyticsKeys = {
  all: ['analytics'] as const,

  // Dashboard
  dashboard: {
    all: () => [...analyticsKeys.all, 'dashboard'] as const,
    executive: (filters?: AnalyticsFilters) => [...analyticsKeys.dashboard.all(), 'executive', filters] as const,
    procurement: (filters?: AnalyticsFilters) => [...analyticsKeys.dashboard.all(), 'procurement', filters] as const,
    financial: (filters?: AnalyticsFilters) => [...analyticsKeys.dashboard.all(), 'financial', filters] as const,
    operational: (filters?: AnalyticsFilters) => [...analyticsKeys.dashboard.all(), 'operational', filters] as const,
    supplier: (filters?: AnalyticsFilters) => [...analyticsKeys.dashboard.all(), 'supplier', filters] as const,
    department: (departmentId: number, filters?: AnalyticsFilters) =>
      [...analyticsKeys.dashboard.all(), 'department', departmentId, filters] as const,
    kpis: (filters?: AnalyticsFilters) => [...analyticsKeys.dashboard.all(), 'kpis', filters] as const,
  },

  // Requisitions
  requisitions: {
    all: () => [...analyticsKeys.all, 'requisitions'] as const,
    summary: (filters?: AnalyticsFilters) => [...analyticsKeys.requisitions.all(), 'summary', filters] as const,
    volume: (filters?: AnalyticsFilters) => [...analyticsKeys.requisitions.all(), 'volume', filters] as const,
    statusDistribution: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.requisitions.all(), 'status-distribution', filters] as const,
    byDepartment: (filters?: AnalyticsFilters) => [...analyticsKeys.requisitions.all(), 'by-department', filters] as const,
    trends: (filters?: AnalyticsFilters) => [...analyticsKeys.requisitions.all(), 'trends', filters] as const,
    approvalFunnel: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.requisitions.all(), 'approval-funnel', filters] as const,
    approvalCycle: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.requisitions.all(), 'approval-cycle', filters] as const,
    slaCompliance: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.requisitions.all(), 'sla-compliance', filters] as const,
    topDepartments: (limit?: number, filters?: AnalyticsFilters) =>
      [...analyticsKeys.requisitions.all(), 'top-departments', limit, filters] as const,
    departmentScorecard: (departmentId: number, filters?: AnalyticsFilters) =>
      [...analyticsKeys.requisitions.all(), 'department-scorecard', departmentId, filters] as const,
  },

  // Approvals
  approvals: {
    all: () => [...analyticsKeys.all, 'approvals'] as const,
    summary: (filters?: AnalyticsFilters) => [...analyticsKeys.approvals.all(), 'summary', filters] as const,
    volume: (filters?: AnalyticsFilters) => [...analyticsKeys.approvals.all(), 'volume', filters] as const,
    statusDistribution: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.approvals.all(), 'status-distribution', filters] as const,
    byLevel: (filters?: AnalyticsFilters) => [...analyticsKeys.approvals.all(), 'by-level', filters] as const,
    performance: (filters?: AnalyticsFilters) => [...analyticsKeys.approvals.all(), 'performance', filters] as const,
    pending: (filters?: AnalyticsFilters) => [...analyticsKeys.approvals.all(), 'pending', filters] as const,
    workload: (filters?: AnalyticsFilters) => [...analyticsKeys.approvals.all(), 'workload', filters] as const,
    delegation: (filters?: AnalyticsFilters) => [...analyticsKeys.approvals.all(), 'delegation', filters] as const,
    escalation: (filters?: AnalyticsFilters) => [...analyticsKeys.approvals.all(), 'escalation', filters] as const,
    bottlenecks: (filters?: AnalyticsFilters) => [...analyticsKeys.approvals.all(), 'bottlenecks', filters] as const,
  },

  // Purchase Orders
  purchaseOrders: {
    all: () => [...analyticsKeys.all, 'purchase-orders'] as const,
    summary: (filters?: AnalyticsFilters) => [...analyticsKeys.purchaseOrders.all(), 'summary', filters] as const,
    volume: (filters?: AnalyticsFilters) => [...analyticsKeys.purchaseOrders.all(), 'volume', filters] as const,
    statusDistribution: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.purchaseOrders.all(), 'status-distribution', filters] as const,
    byType: (filters?: AnalyticsFilters) => [...analyticsKeys.purchaseOrders.all(), 'by-type', filters] as const,
    deliveryPerformance: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.purchaseOrders.all(), 'delivery-performance', filters] as const,
    cycleTime: (filters?: AnalyticsFilters) => [...analyticsKeys.purchaseOrders.all(), 'cycle-time', filters] as const,
    overdue: (filters?: AnalyticsFilters) => [...analyticsKeys.purchaseOrders.all(), 'overdue', filters] as const,
    bySupplier: (filters?: AnalyticsFilters) => [...analyticsKeys.purchaseOrders.all(), 'by-supplier', filters] as const,
    trends: (filters?: AnalyticsFilters) => [...analyticsKeys.purchaseOrders.all(), 'trends', filters] as const,
    signatureWorkflow: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.purchaseOrders.all(), 'signature-workflow', filters] as const,
  },

  // Financial
  financial: {
    all: () => [...analyticsKeys.all, 'financial'] as const,
    summary: (filters?: AnalyticsFilters) => [...analyticsKeys.financial.all(), 'summary', filters] as const,
    budgetVsActual: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.financial.all(), 'budget-vs-actual', filters] as const,
    spendingAnalysis: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.financial.all(), 'spending-analysis', filters] as const,
    invoiceMetrics: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.financial.all(), 'invoice-metrics', filters] as const,
    paymentCycle: (filters?: AnalyticsFilters) => [...analyticsKeys.financial.all(), 'payment-cycle', filters] as const,
    costSavings: (filters?: AnalyticsFilters) => [...analyticsKeys.financial.all(), 'cost-savings', filters] as const,
    spendingTrends: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.financial.all(), 'spending-trends', filters] as const,
    overdueInvoices: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.financial.all(), 'overdue-invoices', filters] as const,
    forecast: (months?: number, filters?: AnalyticsFilters) =>
      [...analyticsKeys.financial.all(), 'forecast', months, filters] as const,
    budgetUtilization: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.financial.all(), 'budget-utilization', filters] as const,
  },

  // Suppliers
  suppliers: {
    all: () => [...analyticsKeys.all, 'suppliers'] as const,
    summary: (filters?: AnalyticsFilters) => [...analyticsKeys.suppliers.all(), 'summary', filters] as const,
    performance: (supplierId: number, filters?: AnalyticsFilters) =>
      [...analyticsKeys.suppliers.all(), 'performance', supplierId, filters] as const,
    compare: (supplierIds: number[], filters?: AnalyticsFilters) =>
      [...analyticsKeys.suppliers.all(), 'compare', supplierIds, filters] as const,
    top: (limit?: number, filters?: AnalyticsFilters) =>
      [...analyticsKeys.suppliers.all(), 'top', limit, filters] as const,
    quotationResponseRates: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.suppliers.all(), 'quotation-response-rates', filters] as const,
    deliveryPerformance: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.suppliers.all(), 'delivery-performance', filters] as const,
    qualityRatings: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.suppliers.all(), 'quality-ratings', filters] as const,
    riskAssessment: (supplierId: number, filters?: AnalyticsFilters) =>
      [...analyticsKeys.suppliers.all(), 'risk-assessment', supplierId, filters] as const,
    spendAnalysis: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.suppliers.all(), 'spend-analysis', filters] as const,
    categoryDistribution: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.suppliers.all(), 'category-distribution', filters] as const,
  },

  // Operations
  operations: {
    all: () => [...analyticsKeys.all, 'operations'] as const,
    summary: (filters?: AnalyticsFilters) => [...analyticsKeys.operations.all(), 'summary', filters] as const,
    systemHealth: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.operations.all(), 'system-health', filters] as const,
    userActivity: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.operations.all(), 'user-activity', filters] as const,
    bottlenecks: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.operations.all(), 'bottlenecks', filters] as const,
    auditSummary: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.operations.all(), 'audit-summary', filters] as const,
    notificationEffectiveness: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.operations.all(), 'notification-effectiveness', filters] as const,
    signatureAdoption: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.operations.all(), 'signature-adoption', filters] as const,
    usagePatterns: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.operations.all(), 'usage-patterns', filters] as const,
    userPerformance: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.operations.all(), 'user-performance', filters] as const,
    backupStatus: (filters?: AnalyticsFilters) =>
      [...analyticsKeys.operations.all(), 'backup-status', filters] as const,
  },
};

// ============================================
// DASHBOARD HOOKS
// ============================================

export const useExecutiveDashboard = (filters?: AnalyticsFilters) => {
  return useQuery<ExecutiveDashboard>({
    queryKey: analyticsKeys.dashboard.executive(filters),
    queryFn: () => analyticsService.getExecutiveDashboard(filters),
  });
};

export const useProcurementDashboard = (filters?: AnalyticsFilters) => {
  return useQuery<ProcurementDashboard>({
    queryKey: analyticsKeys.dashboard.procurement(filters),
    queryFn: () => analyticsService.getProcurementDashboard(filters),
  });
};

export const useFinancialDashboard = (filters?: AnalyticsFilters) => {
  return useQuery<FinancialDashboard>({
    queryKey: analyticsKeys.dashboard.financial(filters),
    queryFn: () => analyticsService.getFinancialDashboard(filters),
  });
};

export const useOperationalDashboard = (filters?: AnalyticsFilters) => {
  return useQuery<OperationalDashboard>({
    queryKey: analyticsKeys.dashboard.operational(filters),
    queryFn: () => analyticsService.getOperationalDashboard(filters),
  });
};

export const useSupplierDashboard = (filters?: AnalyticsFilters) => {
  return useQuery<SupplierDashboard>({
    queryKey: analyticsKeys.dashboard.supplier(filters),
    queryFn: () => analyticsService.getSupplierDashboard(filters),
  });
};

export const useDepartmentDashboard = (departmentId: number, filters?: AnalyticsFilters) => {
  return useQuery<DepartmentDashboard>({
    queryKey: analyticsKeys.dashboard.department(departmentId, filters),
    queryFn: () => analyticsService.getDepartmentDashboard(departmentId, filters),
    enabled: !!departmentId,
  });
};

export const useKpiReport = (filters?: AnalyticsFilters) => {
  return useQuery<KeyMetrics>({
    queryKey: analyticsKeys.dashboard.kpis(filters),
    queryFn: () => analyticsService.getKpiReport(filters),
  });
};

// ============================================
// REQUISITION ANALYTICS HOOKS
// ============================================

export const useRequisitionAnalyticsSummary = (filters?: AnalyticsFilters) => {
  return useQuery<RequisitionAnalyticsSummary>({
    queryKey: analyticsKeys.requisitions.summary(filters),
    queryFn: () => analyticsService.getRequisitionSummary(filters),
  });
};

export const useRequisitionVolume = (filters?: AnalyticsFilters) => {
  return useQuery<RequisitionAnalyticsSummary>({
    queryKey: analyticsKeys.requisitions.volume(filters),
    queryFn: () => analyticsService.getRequisitionVolume(filters),
  });
};

export const useRequisitionStatusDistribution = (filters?: AnalyticsFilters) => {
  return useQuery<Record<string, number>>({
    queryKey: analyticsKeys.requisitions.statusDistribution(filters),
    queryFn: () => analyticsService.getRequisitionStatusDistribution(filters),
  });
};

export const useRequisitionByDepartment = (filters?: AnalyticsFilters) => {
  return useQuery<Record<string, number>>({
    queryKey: analyticsKeys.requisitions.byDepartment(filters),
    queryFn: () => analyticsService.getRequisitionByDepartment(filters),
  });
};

export const useRequisitionTrends = (filters?: AnalyticsFilters) => {
  return useQuery<TrendDataPoint[]>({
    queryKey: analyticsKeys.requisitions.trends(filters),
    queryFn: () => analyticsService.getRequisitionTrends(filters),
  });
};

export const useApprovalFunnel = (filters?: AnalyticsFilters) => {
  return useQuery<ConversionFunnel[]>({
    queryKey: analyticsKeys.requisitions.approvalFunnel(filters),
    queryFn: () => analyticsService.getApprovalFunnel(filters),
  });
};

export const useApprovalCycle = (filters?: AnalyticsFilters) => {
  return useQuery<ApprovalCycleAnalysis>({
    queryKey: analyticsKeys.requisitions.approvalCycle(filters),
    queryFn: () => analyticsService.getApprovalCycle(filters),
  });
};

export const useSlaCompliance = (filters?: AnalyticsFilters) => {
  return useQuery<SlaCompliance>({
    queryKey: analyticsKeys.requisitions.slaCompliance(filters),
    queryFn: () => analyticsService.getSlaCompliance(filters),
  });
};

export const useTopDepartments = (limit?: number, filters?: AnalyticsFilters) => {
  return useQuery<Record<string, number>>({
    queryKey: analyticsKeys.requisitions.topDepartments(limit, filters),
    queryFn: () => analyticsService.getTopDepartments(limit, filters),
  });
};

export const useDepartmentScorecard = (departmentId: number, filters?: AnalyticsFilters) => {
  return useQuery<DepartmentScorecard>({
    queryKey: analyticsKeys.requisitions.departmentScorecard(departmentId, filters),
    queryFn: () => analyticsService.getDepartmentScorecard(departmentId, filters),
    enabled: !!departmentId,
  });
};

// ============================================
// APPROVAL ANALYTICS HOOKS
// ============================================

export const useApprovalSummary = (filters?: AnalyticsFilters) => {
  return useQuery<ApprovalStats>({
    queryKey: analyticsKeys.approvals.summary(filters),
    queryFn: () => analyticsService.getApprovalSummary(filters),
  });
};

export const useApprovalVolume = (filters?: AnalyticsFilters) => {
  return useQuery<ApprovalStats>({
    queryKey: analyticsKeys.approvals.volume(filters),
    queryFn: () => analyticsService.getApprovalVolume(filters),
  });
};

export const useApprovalStatusDistribution = (filters?: AnalyticsFilters) => {
  return useQuery<Record<string, number>>({
    queryKey: analyticsKeys.approvals.statusDistribution(filters),
    queryFn: () => analyticsService.getApprovalStatusDistribution(filters),
  });
};

export const useApprovalByLevel = (filters?: AnalyticsFilters) => {
  return useQuery<Record<string, number>>({
    queryKey: analyticsKeys.approvals.byLevel(filters),
    queryFn: () => analyticsService.getApprovalByLevel(filters),
  });
};

export const useApprovalPerformance = (filters?: AnalyticsFilters) => {
  return useQuery<ApprovalPerformance>({
    queryKey: analyticsKeys.approvals.performance(filters),
    queryFn: () => analyticsService.getApprovalPerformance(filters),
  });
};

export const usePendingApprovals = (filters?: AnalyticsFilters) => {
  return useQuery<ApproverWorkload[]>({
    queryKey: analyticsKeys.approvals.pending(filters),
    queryFn: () => analyticsService.getPendingApprovals(filters),
  });
};

export const useApproverWorkload = (filters?: AnalyticsFilters) => {
  return useQuery<ApproverWorkload[]>({
    queryKey: analyticsKeys.approvals.workload(filters),
    queryFn: () => analyticsService.getApproverWorkload(filters),
  });
};

export const useDelegationAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery<DelegationStats>({
    queryKey: analyticsKeys.approvals.delegation(filters),
    queryFn: () => analyticsService.getDelegationAnalytics(filters),
  });
};

export const useEscalationAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery<EscalationStats>({
    queryKey: analyticsKeys.approvals.escalation(filters),
    queryFn: () => analyticsService.getEscalationAnalytics(filters),
  });
};

export const useApprovalBottlenecks = (filters?: AnalyticsFilters) => {
  return useQuery<WorkflowBottleneck[]>({
    queryKey: analyticsKeys.approvals.bottlenecks(filters),
    queryFn: () => analyticsService.getApprovalBottlenecks(filters),
  });
};

// ============================================
// PURCHASE ORDER ANALYTICS HOOKS
// ============================================

export const usePurchaseOrderAnalyticsSummary = (filters?: AnalyticsFilters) => {
  return useQuery<PurchaseOrderAnalyticsSummary>({
    queryKey: analyticsKeys.purchaseOrders.summary(filters),
    queryFn: () => analyticsService.getPurchaseOrderSummary(filters),
  });
};

export const usePurchaseOrderVolume = (filters?: AnalyticsFilters) => {
  return useQuery<PurchaseOrderAnalyticsSummary>({
    queryKey: analyticsKeys.purchaseOrders.volume(filters),
    queryFn: () => analyticsService.getPurchaseOrderVolume(filters),
  });
};

export const usePurchaseOrderStatusDistribution = (filters?: AnalyticsFilters) => {
  return useQuery<Record<string, number>>({
    queryKey: analyticsKeys.purchaseOrders.statusDistribution(filters),
    queryFn: () => analyticsService.getPurchaseOrderStatusDistribution(filters),
  });
};

export const usePurchaseOrderByType = (filters?: AnalyticsFilters) => {
  return useQuery<Record<string, number>>({
    queryKey: analyticsKeys.purchaseOrders.byType(filters),
    queryFn: () => analyticsService.getPurchaseOrderByType(filters),
  });
};

export const usePurchaseOrderDeliveryPerformance = (filters?: AnalyticsFilters) => {
  return useQuery<PurchaseOrderDeliveryPerformance>({
    queryKey: analyticsKeys.purchaseOrders.deliveryPerformance(filters),
    queryFn: () => analyticsService.getDeliveryPerformance(filters),
  });
};

export const usePurchaseOrderCycleTime = (filters?: AnalyticsFilters) => {
  return useQuery<PurchaseOrderCycleTime>({
    queryKey: analyticsKeys.purchaseOrders.cycleTime(filters),
    queryFn: () => analyticsService.getPurchaseOrderCycleTime(filters),
  });
};

export const useOverduePurchaseOrders = (filters?: AnalyticsFilters) => {
  return useQuery<PurchaseOrderOverdue>({
    queryKey: analyticsKeys.purchaseOrders.overdue(filters),
    queryFn: () => analyticsService.getOverduePurchaseOrders(filters),
  });
};

export const usePurchaseOrderBySupplier = (filters?: AnalyticsFilters) => {
  return useQuery<Record<string, number>>({
    queryKey: analyticsKeys.purchaseOrders.bySupplier(filters),
    queryFn: () => analyticsService.getPurchaseOrderBySupplier(filters),
  });
};

export const usePurchaseOrderTrends = (filters?: AnalyticsFilters) => {
  return useQuery<TrendDataPoint[]>({
    queryKey: analyticsKeys.purchaseOrders.trends(filters),
    queryFn: () => analyticsService.getPurchaseOrderTrends(filters),
  });
};

export const useSignatureWorkflowAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery<SignatureWorkflowStats>({
    queryKey: analyticsKeys.purchaseOrders.signatureWorkflow(filters),
    queryFn: () => analyticsService.getSignatureWorkflowAnalytics(filters),
  });
};

// ============================================
// FINANCIAL ANALYTICS HOOKS
// ============================================

export const useFinancialSummary = (filters?: AnalyticsFilters) => {
  return useQuery<FinancialSummary>({
    queryKey: analyticsKeys.financial.summary(filters),
    queryFn: () => analyticsService.getFinancialSummary(filters),
  });
};

export const useBudgetVsActual = (filters?: AnalyticsFilters) => {
  return useQuery<BudgetUtilization[]>({
    queryKey: analyticsKeys.financial.budgetVsActual(filters),
    queryFn: () => analyticsService.getBudgetVsActual(filters),
  });
};

export const useSpendingAnalysis = (filters?: AnalyticsFilters) => {
  return useQuery<SpendingAnalysis>({
    queryKey: analyticsKeys.financial.spendingAnalysis(filters),
    queryFn: () => analyticsService.getSpendingAnalysis(filters),
  });
};

export const useInvoiceMetrics = (filters?: AnalyticsFilters) => {
  return useQuery<InvoiceMetrics>({
    queryKey: analyticsKeys.financial.invoiceMetrics(filters),
    queryFn: () => analyticsService.getInvoiceMetrics(filters),
  });
};

export const usePaymentCycle = (filters?: AnalyticsFilters) => {
  return useQuery<PaymentMetrics>({
    queryKey: analyticsKeys.financial.paymentCycle(filters),
    queryFn: () => analyticsService.getPaymentCycle(filters),
  });
};

export const useCostSavings = (filters?: AnalyticsFilters) => {
  return useQuery<CostSavings>({
    queryKey: analyticsKeys.financial.costSavings(filters),
    queryFn: () => analyticsService.getCostSavings(filters),
  });
};

export const useSpendingTrends = (filters?: AnalyticsFilters) => {
  return useQuery<TrendDataPoint[]>({
    queryKey: analyticsKeys.financial.spendingTrends(filters),
    queryFn: () => analyticsService.getSpendingTrends(filters),
  });
};

export const useOverdueInvoices = (filters?: AnalyticsFilters) => {
  return useQuery<OverdueInvoice[]>({
    queryKey: analyticsKeys.financial.overdueInvoices(filters),
    queryFn: () => analyticsService.getOverdueInvoices(filters),
  });
};

export const useForecast = (months?: number, filters?: AnalyticsFilters) => {
  return useQuery<TrendDataPoint[]>({
    queryKey: analyticsKeys.financial.forecast(months, filters),
    queryFn: () => analyticsService.getForecast(months, filters),
  });
};

export const useBudgetUtilization = (filters?: AnalyticsFilters) => {
  return useQuery<BudgetUtilization[]>({
    queryKey: analyticsKeys.financial.budgetUtilization(filters),
    queryFn: () => analyticsService.getBudgetUtilization(filters),
  });
};

// ============================================
// SUPPLIER ANALYTICS HOOKS
// ============================================

export const useSupplierAnalyticsSummary = (filters?: AnalyticsFilters) => {
  return useQuery<SupplierAnalyticsSummary>({
    queryKey: analyticsKeys.suppliers.summary(filters),
    queryFn: () => analyticsService.getSupplierSummary(filters),
  });
};

export const useSupplierPerformance = (supplierId: number, filters?: AnalyticsFilters) => {
  return useQuery<SupplierPerformance>({
    queryKey: analyticsKeys.suppliers.performance(supplierId, filters),
    queryFn: () => analyticsService.getSupplierPerformance(supplierId, filters),
    enabled: !!supplierId,
  });
};

export const useCompareSuppliers = (supplierIds: number[], filters?: AnalyticsFilters) => {
  return useQuery<SupplierComparison[]>({
    queryKey: analyticsKeys.suppliers.compare(supplierIds, filters),
    queryFn: () => analyticsService.compareSuppliers(supplierIds, filters),
    enabled: supplierIds.length > 0,
  });
};

export const useTopSuppliers = (limit?: number, filters?: AnalyticsFilters) => {
  return useQuery<TopSupplier[]>({
    queryKey: analyticsKeys.suppliers.top(limit, filters),
    queryFn: () => analyticsService.getTopSuppliers(limit, filters),
  });
};

export const useQuotationResponseRates = (filters?: AnalyticsFilters) => {
  return useQuery<QuotationResponseRate[]>({
    queryKey: analyticsKeys.suppliers.quotationResponseRates(filters),
    queryFn: () => analyticsService.getQuotationResponseRates(filters),
  });
};

export const useSupplierDeliveryPerformance = (filters?: AnalyticsFilters) => {
  return useQuery<SupplierDeliveryPerformance[]>({
    queryKey: analyticsKeys.suppliers.deliveryPerformance(filters),
    queryFn: () => analyticsService.getSupplierDeliveryPerformance(filters),
  });
};

export const useSupplierQualityRatings = (filters?: AnalyticsFilters) => {
  return useQuery<SupplierQualityRating[]>({
    queryKey: analyticsKeys.suppliers.qualityRatings(filters),
    queryFn: () => analyticsService.getSupplierQualityRatings(filters),
  });
};

export const useSupplierRiskAssessment = (supplierId: number, filters?: AnalyticsFilters) => {
  return useQuery<SupplierRiskAssessment>({
    queryKey: analyticsKeys.suppliers.riskAssessment(supplierId, filters),
    queryFn: () => analyticsService.getSupplierRiskAssessment(supplierId, filters),
    enabled: !!supplierId,
  });
};

export const useSupplierSpendAnalysis = (filters?: AnalyticsFilters) => {
  return useQuery<SupplierSpendAnalysis[]>({
    queryKey: analyticsKeys.suppliers.spendAnalysis(filters),
    queryFn: () => analyticsService.getSupplierSpendAnalysis(filters),
  });
};

export const useSupplierCategoryDistribution = (filters?: AnalyticsFilters) => {
  return useQuery<Record<string, number>>({
    queryKey: analyticsKeys.suppliers.categoryDistribution(filters),
    queryFn: () => analyticsService.getSupplierCategoryDistribution(filters),
  });
};

// ============================================
// OPERATIONAL ANALYTICS HOOKS
// ============================================

export const useOperationSummary = (filters?: AnalyticsFilters) => {
  return useQuery<OperationSummary>({
    queryKey: analyticsKeys.operations.summary(filters),
    queryFn: () => analyticsService.getOperationSummary(filters),
  });
};

export const useSystemHealth = (filters?: AnalyticsFilters) => {
  return useQuery<SystemHealth>({
    queryKey: analyticsKeys.operations.systemHealth(filters),
    queryFn: () => analyticsService.getSystemHealth(filters),
  });
};

export const useUserActivity = (filters?: AnalyticsFilters) => {
  return useQuery<UserActivityStats>({
    queryKey: analyticsKeys.operations.userActivity(filters),
    queryFn: () => analyticsService.getUserActivity(filters),
  });
};

export const useWorkflowBottlenecks = (filters?: AnalyticsFilters) => {
  return useQuery<WorkflowBottleneck[]>({
    queryKey: analyticsKeys.operations.bottlenecks(filters),
    queryFn: () => analyticsService.getWorkflowBottlenecks(filters),
  });
};

export const useAuditSummary = (filters?: AnalyticsFilters) => {
  return useQuery<AuditSummary>({
    queryKey: analyticsKeys.operations.auditSummary(filters),
    queryFn: () => analyticsService.getAuditSummary(filters),
  });
};

export const useNotificationEffectiveness = (filters?: AnalyticsFilters) => {
  return useQuery<NotificationStats>({
    queryKey: analyticsKeys.operations.notificationEffectiveness(filters),
    queryFn: () => analyticsService.getNotificationEffectiveness(filters),
  });
};

export const useSignatureAdoption = (filters?: AnalyticsFilters) => {
  return useQuery<SignatureAdoption>({
    queryKey: analyticsKeys.operations.signatureAdoption(filters),
    queryFn: () => analyticsService.getSignatureAdoption(filters),
  });
};

export const useUsagePatterns = (filters?: AnalyticsFilters) => {
  return useQuery<UsagePatterns>({
    queryKey: analyticsKeys.operations.usagePatterns(filters),
    queryFn: () => analyticsService.getUsagePatterns(filters),
  });
};

export const useUserPerformance = (filters?: AnalyticsFilters) => {
  return useQuery<UserPerformance[]>({
    queryKey: analyticsKeys.operations.userPerformance(filters),
    queryFn: () => analyticsService.getUserPerformance(filters),
  });
};

export const useBackupStatus = (filters?: AnalyticsFilters) => {
  return useQuery<BackupStatus>({
    queryKey: analyticsKeys.operations.backupStatus(filters),
    queryFn: () => analyticsService.getBackupStatus(filters),
  });
};

// ============================================
// MUTATION HOOKS (if needed for analytics)
// ============================================

export const useRefreshAnalyticsCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Implementation would depend on your backend
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate all analytics queries
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
};

// ============================================
// EXPORT ALL HOOKS
// ============================================

export default {
  // Dashboard
  useExecutiveDashboard,
  useProcurementDashboard,
  useFinancialDashboard,
  useOperationalDashboard,
  useSupplierDashboard,
  useDepartmentDashboard,
  useKpiReport,

  // Requisitions
  useRequisitionAnalyticsSummary,
  useRequisitionVolume,
  useRequisitionStatusDistribution,
  useRequisitionByDepartment,
  useRequisitionTrends,
  useApprovalFunnel,
  useApprovalCycle,
  useSlaCompliance,
  useTopDepartments,
  useDepartmentScorecard,

  // Approvals
  useApprovalSummary,
  useApprovalVolume,
  useApprovalStatusDistribution,
  useApprovalByLevel,
  useApprovalPerformance,
  usePendingApprovals,
  useApproverWorkload,
  useDelegationAnalytics,
  useEscalationAnalytics,
  useApprovalBottlenecks,

  // Purchase Orders
  usePurchaseOrderAnalyticsSummary,
  usePurchaseOrderVolume,
  usePurchaseOrderStatusDistribution,
  usePurchaseOrderByType,
  usePurchaseOrderDeliveryPerformance,
  usePurchaseOrderCycleTime,
  useOverduePurchaseOrders,
  usePurchaseOrderBySupplier,
  usePurchaseOrderTrends,
  useSignatureWorkflowAnalytics,

  // Financial
  useFinancialSummary,
  useBudgetVsActual,
  useSpendingAnalysis,
  useInvoiceMetrics,
  usePaymentCycle,
  useCostSavings,
  useSpendingTrends,
  useOverdueInvoices,
  useForecast,
  useBudgetUtilization,

  // Suppliers
  useSupplierAnalyticsSummary,
  useSupplierPerformance,
  useCompareSuppliers,
  useTopSuppliers,
  useQuotationResponseRates,
  useSupplierDeliveryPerformance,
  useSupplierQualityRatings,
  useSupplierRiskAssessment,
  useSupplierSpendAnalysis,
  useSupplierCategoryDistribution,

  // Operations
  useOperationSummary,
  useSystemHealth,
  useUserActivity,
  useWorkflowBottlenecks,
  useAuditSummary,
  useNotificationEffectiveness,
  useSignatureAdoption,
  useUsagePatterns,
  useUserPerformance,
  useBackupStatus,

  // Mutations
  useRefreshAnalyticsCache,
};
