// frontend/src/services/analytics.service.ts

import { api } from './api';
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
  StageTransitionTime,
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

const BASE_URL = '/analytics';

export const analyticsService = {
  // ============================================
  // DASHBOARD ENDPOINTS
  // ============================================

  /**
   * Get executive dashboard metrics
   */
  getExecutiveDashboard: async (filters?: AnalyticsFilters): Promise<ExecutiveDashboard> => {
    return api.get<ExecutiveDashboard>(`${BASE_URL}/dashboard/executive`, { params: filters });
  },

  /**
   * Get procurement dashboard metrics
   */
  getProcurementDashboard: async (filters?: AnalyticsFilters): Promise<ProcurementDashboard> => {
    return api.get<ProcurementDashboard>(`${BASE_URL}/dashboard/procurement`, { params: filters });
  },

  /**
   * Get financial dashboard metrics
   */
  getFinancialDashboard: async (filters?: AnalyticsFilters): Promise<FinancialDashboard> => {
    return api.get<FinancialDashboard>(`${BASE_URL}/dashboard/financial`, { params: filters });
  },

  /**
   * Get operational dashboard metrics
   */
  getOperationalDashboard: async (filters?: AnalyticsFilters): Promise<OperationalDashboard> => {
    return api.get<OperationalDashboard>(`${BASE_URL}/dashboard/operational`, { params: filters });
  },

  /**
   * Get supplier dashboard metrics
   */
  getSupplierDashboard: async (filters?: AnalyticsFilters): Promise<SupplierDashboard> => {
    return api.get<SupplierDashboard>(`${BASE_URL}/dashboard/supplier`, { params: filters });
  },

  /**
   * Get department dashboard metrics
   */
  getDepartmentDashboard: async (departmentId: number, filters?: AnalyticsFilters): Promise<DepartmentDashboard> => {
    return api.get<DepartmentDashboard>(`${BASE_URL}/dashboard/department/${departmentId}`, { params: filters });
  },

  /**
   * Get KPI report
   */
  getKpiReport: async (filters?: AnalyticsFilters): Promise<KeyMetrics> => {
    return api.get<KeyMetrics>(`${BASE_URL}/dashboard/kpis`, { params: filters });
  },

  // ============================================
  // REQUISITION ANALYTICS ENDPOINTS
  // ============================================

  /**
   * Get requisition analytics summary
   */
  getRequisitionSummary: async (filters?: AnalyticsFilters): Promise<RequisitionAnalyticsSummary> => {
    return api.get<RequisitionAnalyticsSummary>(`${BASE_URL}/requisitions/summary`, { params: filters });
  },

  /**
   * Get requisition volume statistics
   */
  getRequisitionVolume: async (filters?: AnalyticsFilters): Promise<RequisitionAnalyticsSummary> => {
    return api.get<RequisitionAnalyticsSummary>(`${BASE_URL}/requisitions/volume`, { params: filters });
  },

  /**
   * Get requisition status distribution
   */
  getRequisitionStatusDistribution: async (filters?: AnalyticsFilters): Promise<Record<string, number>> => {
    return api.get<Record<string, number>>(`${BASE_URL}/requisitions/status-distribution`, { params: filters });
  },

  /**
   * Get requisitions by department
   */
  getRequisitionByDepartment: async (filters?: AnalyticsFilters): Promise<Record<string, number>> => {
    return api.get<Record<string, number>>(`${BASE_URL}/requisitions/by-department`, { params: filters });
  },

  /**
   * Get requisition trends
   */
  getRequisitionTrends: async (filters?: AnalyticsFilters): Promise<TrendDataPoint[]> => {
    return api.get<TrendDataPoint[]>(`${BASE_URL}/requisitions/trends`, { params: filters });
  },

  /**
   * Get approval funnel analysis
   */
  getApprovalFunnel: async (filters?: AnalyticsFilters): Promise<ConversionFunnel[]> => {
    return api.get<ConversionFunnel[]>(`${BASE_URL}/requisitions/approval-funnel`, { params: filters });
  },

  /**
   * Get approval cycle analysis
   */
  getApprovalCycle: async (filters?: AnalyticsFilters): Promise<ApprovalCycleAnalysis> => {
    return api.get<ApprovalCycleAnalysis>(`${BASE_URL}/requisitions/approval-cycle`, { params: filters });
  },

  /**
   * Get SLA compliance
   */
  getSlaCompliance: async (filters?: AnalyticsFilters): Promise<SlaCompliance> => {
    return api.get<SlaCompliance>(`${BASE_URL}/requisitions/sla-compliance`, { params: filters });
  },

  /**
   * Get top departments
   */
  getTopDepartments: async (limit?: number, filters?: AnalyticsFilters): Promise<Record<string, number>> => {
    return api.get<Record<string, number>>(`${BASE_URL}/requisitions/top-departments`, {
      params: { ...filters, limit },
    });
  },

  /**
   * Get department scorecard
   */
  getDepartmentScorecard: async (departmentId: number, filters?: AnalyticsFilters): Promise<DepartmentScorecard> => {
    return api.get<DepartmentScorecard>(`${BASE_URL}/requisitions/department-scorecard/${departmentId}`, {
      params: filters,
    });
  },

  // ============================================
  // APPROVAL ANALYTICS ENDPOINTS
  // ============================================

  /**
   * Get approval summary
   */
  getApprovalSummary: async (filters?: AnalyticsFilters): Promise<ApprovalStats> => {
    return api.get<ApprovalStats>(`${BASE_URL}/approvals/summary`, { params: filters });
  },

  /**
   * Get approval volume
   */
  getApprovalVolume: async (filters?: AnalyticsFilters): Promise<ApprovalStats> => {
    return api.get<ApprovalStats>(`${BASE_URL}/approvals/volume`, { params: filters });
  },

  /**
   * Get approval status distribution
   */
  getApprovalStatusDistribution: async (filters?: AnalyticsFilters): Promise<Record<string, number>> => {
    return api.get<Record<string, number>>(`${BASE_URL}/approvals/status-distribution`, { params: filters });
  },

  /**
   * Get approval by level
   */
  getApprovalByLevel: async (filters?: AnalyticsFilters): Promise<Record<string, number>> => {
    return api.get<Record<string, number>>(`${BASE_URL}/approvals/by-level`, { params: filters });
  },

  /**
   * Get approval performance metrics
   */
  getApprovalPerformance: async (filters?: AnalyticsFilters): Promise<ApprovalPerformance> => {
    return api.get<ApprovalPerformance>(`${BASE_URL}/approvals/performance`, { params: filters });
  },

  /**
   * Get pending approvals
   */
  getPendingApprovals: async (filters?: AnalyticsFilters): Promise<ApproverWorkload[]> => {
    return api.get<ApproverWorkload[]>(`${BASE_URL}/approvals/pending`, { params: filters });
  },

  /**
   * Get approver workload
   */
  getApproverWorkload: async (filters?: AnalyticsFilters): Promise<ApproverWorkload[]> => {
    return api.get<ApproverWorkload[]>(`${BASE_URL}/approvals/workload`, { params: filters });
  },

  /**
   * Get delegation analytics
   */
  getDelegationAnalytics: async (filters?: AnalyticsFilters): Promise<DelegationStats> => {
    return api.get<DelegationStats>(`${BASE_URL}/approvals/delegation`, { params: filters });
  },

  /**
   * Get escalation analytics
   */
  getEscalationAnalytics: async (filters?: AnalyticsFilters): Promise<EscalationStats> => {
    return api.get<EscalationStats>(`${BASE_URL}/approvals/escalation`, { params: filters });
  },

  /**
   * Get approval bottlenecks
   */
  getApprovalBottlenecks: async (filters?: AnalyticsFilters): Promise<WorkflowBottleneck[]> => {
    return api.get<WorkflowBottleneck[]>(`${BASE_URL}/approvals/bottlenecks`, { params: filters });
  },

  // ============================================
  // PURCHASE ORDER ANALYTICS ENDPOINTS
  // ============================================

  /**
   * Get purchase order summary
   */
  getPurchaseOrderSummary: async (filters?: AnalyticsFilters): Promise<PurchaseOrderAnalyticsSummary> => {
    return api.get<PurchaseOrderAnalyticsSummary>(`${BASE_URL}/purchase-orders/summary`, { params: filters });
  },

  /**
   * Get purchase order volume
   */
  getPurchaseOrderVolume: async (filters?: AnalyticsFilters): Promise<PurchaseOrderAnalyticsSummary> => {
    return api.get<PurchaseOrderAnalyticsSummary>(`${BASE_URL}/purchase-orders/volume`, { params: filters });
  },

  /**
   * Get purchase order status distribution
   */
  getPurchaseOrderStatusDistribution: async (filters?: AnalyticsFilters): Promise<Record<string, number>> => {
    return api.get<Record<string, number>>(`${BASE_URL}/purchase-orders/status-distribution`, { params: filters });
  },

  /**
   * Get purchase orders by type (LPO/LSO)
   */
  getPurchaseOrderByType: async (filters?: AnalyticsFilters): Promise<Record<string, number>> => {
    return api.get<Record<string, number>>(`${BASE_URL}/purchase-orders/by-type`, { params: filters });
  },

  /**
   * Get delivery performance
   */
  getDeliveryPerformance: async (filters?: AnalyticsFilters): Promise<PurchaseOrderDeliveryPerformance> => {
    return api.get<PurchaseOrderDeliveryPerformance>(`${BASE_URL}/purchase-orders/delivery-performance`, { params: filters });
  },

  /**
   * Get purchase order cycle time
   */
  getPurchaseOrderCycleTime: async (filters?: AnalyticsFilters): Promise<PurchaseOrderCycleTime> => {
    return api.get<PurchaseOrderCycleTime>(`${BASE_URL}/purchase-orders/cycle-time`, { params: filters });
  },

  /**
   * Get overdue purchase orders
   */
  getOverduePurchaseOrders: async (filters?: AnalyticsFilters): Promise<PurchaseOrderOverdue> => {
    return api.get<PurchaseOrderOverdue>(`${BASE_URL}/purchase-orders/overdue`, { params: filters });
  },

  /**
   * Get purchase orders by supplier
   */
  getPurchaseOrderBySupplier: async (filters?: AnalyticsFilters): Promise<Record<string, number>> => {
    return api.get<Record<string, number>>(`${BASE_URL}/purchase-orders/by-supplier`, { params: filters });
  },

  /**
   * Get purchase order trends
   */
  getPurchaseOrderTrends: async (filters?: AnalyticsFilters): Promise<TrendDataPoint[]> => {
    return api.get<TrendDataPoint[]>(`${BASE_URL}/purchase-orders/trends`, { params: filters });
  },

  /**
   * Get signature workflow analytics
   */
  getSignatureWorkflowAnalytics: async (filters?: AnalyticsFilters): Promise<SignatureWorkflowStats> => {
    return api.get<SignatureWorkflowStats>(`${BASE_URL}/purchase-orders/signature-workflow`, { params: filters });
  },

  // ============================================
  // FINANCIAL ANALYTICS ENDPOINTS
  // ============================================

  /**
   * Get financial summary
   */
  getFinancialSummary: async (filters?: AnalyticsFilters): Promise<FinancialSummary> => {
    return api.get<FinancialSummary>(`${BASE_URL}/financial/summary`, { params: filters });
  },

  /**
   * Get budget vs actual
   */
  getBudgetVsActual: async (filters?: AnalyticsFilters): Promise<BudgetUtilization[]> => {
    return api.get<BudgetUtilization[]>(`${BASE_URL}/financial/budget-vs-actual`, { params: filters });
  },

  /**
   * Get spending analysis
   */
  getSpendingAnalysis: async (filters?: AnalyticsFilters): Promise<SpendingAnalysis> => {
    return api.get<SpendingAnalysis>(`${BASE_URL}/financial/spending-analysis`, { params: filters });
  },

  /**
   * Get invoice metrics
   */
  getInvoiceMetrics: async (filters?: AnalyticsFilters): Promise<InvoiceMetrics> => {
    return api.get<InvoiceMetrics>(`${BASE_URL}/financial/invoice-metrics`, { params: filters });
  },

  /**
   * Get payment cycle analysis
   */
  getPaymentCycle: async (filters?: AnalyticsFilters): Promise<PaymentMetrics> => {
    return api.get<PaymentMetrics>(`${BASE_URL}/financial/payment-cycle`, { params: filters });
  },

  /**
   * Get cost savings
   */
  getCostSavings: async (filters?: AnalyticsFilters): Promise<CostSavings> => {
    return api.get<CostSavings>(`${BASE_URL}/financial/cost-savings`, { params: filters });
  },

  /**
   * Get spending trends
   */
  getSpendingTrends: async (filters?: AnalyticsFilters): Promise<TrendDataPoint[]> => {
    return api.get<TrendDataPoint[]>(`${BASE_URL}/financial/spending-trends`, { params: filters });
  },

  /**
   * Get overdue invoices
   */
  getOverdueInvoices: async (filters?: AnalyticsFilters): Promise<OverdueInvoice[]> => {
    return api.get<OverdueInvoice[]>(`${BASE_URL}/financial/overdue-invoices`, { params: filters });
  },

  /**
   * Get spend forecast
   */
  getForecast: async (months?: number, filters?: AnalyticsFilters): Promise<TrendDataPoint[]> => {
    return api.get<TrendDataPoint[]>(`${BASE_URL}/financial/forecast`, {
      params: { ...filters, months },
    });
  },

  /**
   * Get budget utilization
   */
  getBudgetUtilization: async (filters?: AnalyticsFilters): Promise<BudgetUtilization[]> => {
    return api.get<BudgetUtilization[]>(`${BASE_URL}/financial/budget-utilization`, { params: filters });
  },

  // ============================================
  // SUPPLIER ANALYTICS ENDPOINTS
  // ============================================

  /**
   * Get supplier summary
   */
  getSupplierSummary: async (filters?: AnalyticsFilters): Promise<SupplierAnalyticsSummary> => {
    return api.get<SupplierAnalyticsSummary>(`${BASE_URL}/suppliers/summary`, { params: filters });
  },

  /**
   * Get supplier performance
   */
  getSupplierPerformance: async (supplierId: number, filters?: AnalyticsFilters): Promise<SupplierPerformance> => {
    return api.get<SupplierPerformance>(`${BASE_URL}/suppliers/performance/${supplierId}`, { params: filters });
  },

  /**
   * Compare multiple suppliers
   */
  compareSuppliers: async (supplierIds: number[], filters?: AnalyticsFilters): Promise<SupplierComparison[]> => {
    return api.post<SupplierComparison[]>(`${BASE_URL}/suppliers/compare`, {
      supplier_ids: supplierIds,
      ...filters,
    });
  },

  /**
   * Get top suppliers by spend
   */
  getTopSuppliers: async (limit?: number, filters?: AnalyticsFilters): Promise<TopSupplier[]> => {
    return api.get<TopSupplier[]>(`${BASE_URL}/suppliers/top`, {
      params: { ...filters, limit },
    });
  },

  /**
   * Get quotation response rates
   */
  getQuotationResponseRates: async (filters?: AnalyticsFilters): Promise<QuotationResponseRate[]> => {
    return api.get<QuotationResponseRate[]>(`${BASE_URL}/suppliers/quotation-response-rates`, { params: filters });
  },

  /**
   * Get supplier delivery performance
   */
  getSupplierDeliveryPerformance: async (filters?: AnalyticsFilters): Promise<SupplierDeliveryPerformance[]> => {
    return api.get<SupplierDeliveryPerformance[]>(`${BASE_URL}/suppliers/delivery-performance`, { params: filters });
  },

  /**
   * Get supplier quality ratings
   */
  getSupplierQualityRatings: async (filters?: AnalyticsFilters): Promise<SupplierQualityRating[]> => {
    return api.get<SupplierQualityRating[]>(`${BASE_URL}/suppliers/quality-ratings`, { params: filters });
  },

  /**
   * Get supplier risk assessment
   */
  getSupplierRiskAssessment: async (supplierId: number, filters?: AnalyticsFilters): Promise<SupplierRiskAssessment> => {
    return api.get<SupplierRiskAssessment>(`${BASE_URL}/suppliers/risk-assessment/${supplierId}`, { params: filters });
  },

  /**
   * Get supplier spend analysis
   */
  getSupplierSpendAnalysis: async (filters?: AnalyticsFilters): Promise<SupplierSpendAnalysis[]> => {
    return api.get<SupplierSpendAnalysis[]>(`${BASE_URL}/suppliers/spend-analysis`, { params: filters });
  },

  /**
   * Get supplier category distribution
   */
  getSupplierCategoryDistribution: async (filters?: AnalyticsFilters): Promise<Record<string, number>> => {
    return api.get<Record<string, number>>(`${BASE_URL}/suppliers/category-distribution`, { params: filters });
  },

  // ============================================
  // OPERATIONAL ANALYTICS ENDPOINTS
  // ============================================

  /**
   * Get operation summary
   */
  getOperationSummary: async (filters?: AnalyticsFilters): Promise<OperationSummary> => {
    return api.get<OperationSummary>(`${BASE_URL}/operations/summary`, { params: filters });
  },

  /**
   * Get system health
   */
  getSystemHealth: async (filters?: AnalyticsFilters): Promise<SystemHealth> => {
    return api.get<SystemHealth>(`${BASE_URL}/operations/system-health`, { params: filters });
  },

  /**
   * Get user activity
   */
  getUserActivity: async (filters?: AnalyticsFilters): Promise<UserActivityStats> => {
    return api.get<UserActivityStats>(`${BASE_URL}/operations/user-activity`, { params: filters });
  },

  /**
   * Get workflow bottlenecks
   */
  getWorkflowBottlenecks: async (filters?: AnalyticsFilters): Promise<WorkflowBottleneck[]> => {
    return api.get<WorkflowBottleneck[]>(`${BASE_URL}/operations/bottlenecks`, { params: filters });
  },

  /**
   * Get audit summary
   */
  getAuditSummary: async (filters?: AnalyticsFilters): Promise<AuditSummary> => {
    return api.get<AuditSummary>(`${BASE_URL}/operations/audit-summary`, { params: filters });
  },

  /**
   * Get notification effectiveness
   */
  getNotificationEffectiveness: async (filters?: AnalyticsFilters): Promise<NotificationStats> => {
    return api.get<NotificationStats>(`${BASE_URL}/operations/notification-effectiveness`, { params: filters });
  },

  /**
   * Get signature adoption
   */
  getSignatureAdoption: async (filters?: AnalyticsFilters): Promise<SignatureAdoption> => {
    return api.get<SignatureAdoption>(`${BASE_URL}/operations/signature-adoption`, { params: filters });
  },

  /**
   * Get usage patterns
   */
  getUsagePatterns: async (filters?: AnalyticsFilters): Promise<UsagePatterns> => {
    return api.get<UsagePatterns>(`${BASE_URL}/operations/usage-patterns`, { params: filters });
  },

  /**
   * Get user performance
   */
  getUserPerformance: async (filters?: AnalyticsFilters): Promise<UserPerformance[]> => {
    return api.get<UserPerformance[]>(`${BASE_URL}/operations/user-performance`, { params: filters });
  },

  /**
   * Get backup status
   */
  getBackupStatus: async (filters?: AnalyticsFilters): Promise<BackupStatus> => {
    return api.get<BackupStatus>(`${BASE_URL}/operations/backup-status`, { params: filters });
  },
};
