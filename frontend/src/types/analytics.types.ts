// frontend/src/types/analytics.types.ts

import { ApiResponse, PaginatedResponse, User, Department, Supplier } from './common.types';
import { Requisition, RequisitionStats } from './requisition.types';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderType } from './purchaseOrder.types';
import { Supplier as SupplierType } from './common.types';

// ============================================
// COMMON ANALYTICS TYPES
// ============================================

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
  department_id?: number;
  supplier_id?: number;
  status?: string;
  category?: string;
  type?: string;
  level?: string;
  user_id?: number;
  limit?: number;
  interval?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface TrendDataPoint {
  period: string;
  value: number;
}

export interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  change_percentage: number;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface ExecutiveDashboard {
  procurement_summary: RequisitionStats;
  financial_summary: FinancialSummary;
  supplier_summary: SupplierAnalyticsSummary;
  key_metrics: KeyMetrics;
}

export interface KeyMetrics {
  total_requisitions: number;
  total_spend: number;
  active_suppliers: number;
  avg_approval_time: number;
  sla_compliance: number;
}

export interface ProcurementDashboard {
  requisitions: RequisitionStats;
  approvals: ApprovalStats;
  purchase_orders: PurchaseOrderStats;
  contracts: ContractStats;
  grn: GRNStats;
}

export interface FinancialDashboard {
  budget: BudgetUtilization[];
  invoices: InvoiceMetrics;
  payments: PaymentMetrics;
  spending: SpendingAnalysis;
  cost_savings: CostSavings;
}

export interface OperationalDashboard {
  user_activity: UserActivityStats;
  system_health: SystemHealth;
  bottlenecks: WorkflowBottleneck[];
  usage_patterns: UsagePatterns;
  notifications: NotificationStats;
}

export interface SupplierDashboard {
  supplier_summary: SupplierAnalyticsSummary;
  top_suppliers: TopSupplier[];
  delivery_performance: SupplierDeliveryPerformance[];
  quality_ratings: SupplierQualityRating[];
  quotation_responses: QuotationResponseRate[];
}

export interface DepartmentDashboard {
  requisitions: RequisitionStats;
  budget: BudgetUtilization[];
  performance: DepartmentScorecard;
  spending: SpendingAnalysis;
}

// ============================================
// REQUISITION ANALYTICS TYPES
// ============================================

export interface RequisitionAnalyticsSummary extends RequisitionStats {
  by_type: {
    goods: number;
    services: number;
  };
  by_priority: Record<string, number>;
  by_status: Record<string, number>;
}

export interface ApprovalCycleAnalysis {
  cycle_time: {
    submission_to_approval: number;
    hod_approval: number;
    total_cycle: number;
  };
  bottlenecks: WorkflowBottleneck[];
  average_by_level: ApprovalLevelTime[];
  approval_rate_by_level: ApprovalLevelRate[];
}

export interface ApprovalLevelTime {
  level: string;
  label: string;
  avg_time_hours: number;
}

export interface ApprovalLevelRate {
  level: string;
  label: string;
  total: number;
  approved: number;
  rate: number;
}

export interface RequisitionReturnAnalysis {
  return_rate: number;
  by_department: {
    department_id: number;
    department_name: string;
    return_count: number;
    total_count: number;
    return_rate: number;
  }[];
  revision_stats: RevisionStats;
}

export interface RevisionStats {
  total_revisions: number;
  avg_revisions: number;
  max_revisions: number;
  requisitions_with_revisions: number;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  percentage: number;
}

export interface SlaCompliance {
  compliance_rate: number;
  by_department: {
    department_id: number;
    department_name: string;
    compliance_rate: number;
  }[];
  trend: TrendDataPoint[];
}

export interface EmergencyRequisitionMetrics {
  emergency_rate: number;
  by_department: {
    department_id: number;
    department_name: string;
    emergency_count: number;
    total_count: number;
    emergency_rate: number;
  }[];
  trend: TrendDataPoint[];
}

export interface RequisitionItemAnalytics {
  top_items: TopItem[];
  quality_inspection: QualityInspectionStats;
  procurement_completion: number;
  below_reorder: BelowReorderItem[];
}

export interface TopItem {
  item_name: string;
  total_quantity: number;
  total_value: number;
  count: number;
}

export interface QualityInspectionStats {
  total: number;
  pending: number;
  inspected: number;
  accepted: number;
  rejected: number;
  pass_rate: number;
}

export interface BelowReorderItem {
  id: number;
  item_name: string;
  current_stock: number;
  reorder_level: number;
  reorder_quantity: number;
}

export interface DepartmentScorecard {
  volume: RequisitionStats;
  approval_cycle: ApprovalCycleAnalysis['cycle_time'];
  return_rate: number;
  emergency_rate: number;
  sla_compliance: number;
  top_items: TopItem[];
}

// ============================================
// APPROVAL ANALYTICS TYPES
// ============================================

export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  delegated: number;
  avg_response_time: number;
}

export interface ApprovalPerformance {
  avg_time_by_level: ApprovalLevelTime[];
  approval_rate_by_level: ApprovalLevelRate[];
  bottlenecks: WorkflowBottleneck[];
  cycle_time_breakdown: CycleTimeBreakdown;
}

export interface CycleTimeBreakdown {
  hod: {
    avg_hours: number;
    min_hours: number;
    max_hours: number;
  };
  accountant: {
    avg_hours: number;
    min_hours: number;
    max_hours: number;
  };
  principal: {
    avg_hours: number;
    min_hours: number;
    max_hours: number;
  };
  final: {
    avg_hours: number;
    min_hours: number;
    max_hours: number;
  };
}

export interface ApproverWorkload {
  approver_id: number;
  approver_name: string;
  pending_count: number;
  avg_waiting_hours: number;
  workload_level: 'low' | 'medium' | 'high';
}

export interface DelegationStats {
  total_delegations: number;
  active_delegations: number;
  by_delegate: {
    delegate_id: number;
    delegate_name: string;
    count: number;
  }[];
}

export interface EscalationStats {
  total_escalations: number;
  by_level: {
    level: string;
    label: string;
    count: number;
  }[];
}

export interface WorkflowBottleneck {
  stage: string;
  label: string;
  avg_time_hours: number;
  bottleneck_status: 'normal' | 'warning' | 'critical';
}

// ============================================
// PURCHASE ORDER ANALYTICS TYPES
// ============================================

export interface PurchaseOrderStats {
  total: number;
  lpo_count: number;
  lso_count: number;
  pending_approval: number;
  issued: number;
  completed: number;
  cancelled: number;
  total_value: number;
  avg_value: number;
}

export interface PurchaseOrderAnalyticsSummary extends PurchaseOrderStats {
  by_type: {
    lpo: number;
    lso: number;
  };
}

export interface PurchaseOrderDeliveryPerformance {
  total: number;
  on_time: number;
  delayed: number;
  on_time_rate: number;
  avg_delay_days: number;
  by_supplier: SupplierDeliveryPerformance[];
}

export interface PurchaseOrderCycleTime {
  creation_to_issue: number;
  issue_to_completion: number;
  total_cycle: number;
  by_type: {
    type: string;
    label: string;
    avg_cycle_hours: number;
  }[];
}

export interface PurchaseOrderOverdue {
  overdue_count: number;
  total_active: number;
  overdue_rate: number;
  by_supplier: {
    supplier_id: number;
    supplier_name: string;
    overdue_count: number;
  }[];
}

export interface SignatureWorkflowStats {
  checked: number;
  endorsed: number;
  approved: number;
  all_signed: number;
  check_rate: number;
  endorsement_rate: number;
  approval_rate: number;
}

export interface StageTransitionTime {
  stage: string;
  label: string;
  avg_time_hours: number;
}

// ============================================
// FINANCIAL ANALYTICS TYPES
// ============================================

export interface FinancialSummary {
  total_invoices: number;
  total_invoice_value: number;
  pending_invoices: number;
  overdue_invoices: number;
  total_payments: number;
  total_payment_value: number;
  budget_utilization: BudgetUtilization[];
}

export interface BudgetUtilization {
  department_id: number;
  department_name: string;
  total_budget: number;
  total_spent: number;
  budget_balance: number;
  utilization_rate: number;
}

export interface SpendingAnalysis {
  by_category: SpendingByCategory[];
  by_department: SpendingByDepartment[];
  trend: TrendDataPoint[];
}

export interface SpendingByCategory {
  category: string;
  count: number;
  total_spent: number;
}

export interface SpendingByDepartment {
  department_id: number;
  department_name: string;
  total_spent: number;
  percentage: number;
}

export interface InvoiceMetrics {
  volume: InvoiceVolumeStats;
  status: InvoiceStatusDistribution[];
  matching: InvoiceMatchingStats;
  overdue: OverdueInvoice[];
}

export interface InvoiceVolumeStats {
  total: number;
  total_value: number;
  pending: number;
  verified: number;
  approved: number;
  paid: number;
  disputed: number;
}

export interface InvoiceStatusDistribution {
  status: string;
  label: string;
  color: string;
  count: number;
  value: number;
}

export interface InvoiceMatchingStats {
  total: number;
  matched: number;
  partial: number;
  mismatch: number;
  pending: number;
  match_rate: number;
  by_status: {
    matched: number;
    partial: number;
    mismatch: number;
    pending: number;
  };
}

export interface OverdueInvoice {
  invoice_id: number;
  invoice_number: string;
  supplier_name: string;
  total_amount: number;
  due_date: string;
  days_overdue: number;
  status: string;
}

export interface PaymentMetrics {
  cycle_time: PaymentCycleTime;
  method_distribution: PaymentMethodDistribution[];
  cheque_status: ChequeStatusDistribution[];
}

export interface PaymentCycleTime {
  preparation_to_endorsement: number;
  endorsement_to_approval: number;
  approval_to_payment: number;
  total_cycle: number;
}

export interface PaymentMethodDistribution {
  method: string;
  label: string;
  count: number;
  total_value: number;
}

export interface ChequeStatusDistribution {
  status: string;
  label: string;
  color: string;
  count: number;
  total_value: number;
}

export interface CostSavings {
  total_budget: number;
  total_actual: number;
  total_savings: number;
  savings_rate: number;
  by_department: BudgetUtilization[];
}

export interface BudgetVariance {
  department_id: number;
  department_name: string;
  budget: number;
  actual: number;
  variance: number;
  variance_percentage: number;
}

// ============================================
// SUPPLIER ANALYTICS TYPES
// ============================================

export interface SupplierAnalyticsSummary {
  total: number;
  active: number;
  blacklisted: number;
  inactive: number;
}

export interface SupplierPerformance {
  supplier_id: number;
  supplier_name: string;
  overall_score: number;
  metrics: {
    delivery: {
      total: number;
      on_time: number;
      rate: number;
    };
    quality: {
      total: number;
      passed: number;
      rate: number;
    };
    quotation: {
      total: number;
      accepted: number;
      rate: number;
    };
  };
}

export interface SupplierComparison {
  supplier_id: number;
  supplier_name: string;
  overall_score: number;
  metrics: SupplierPerformance['metrics'];
}

export interface SupplierDeliveryPerformance {
  supplier_id: number;
  supplier_name: string;
  total: number;
  on_time: number;
  on_time_rate: number;
  avg_delay_days: number;
}

export interface SupplierQualityRating {
  supplier_id: number;
  supplier_name: string;
  total: number;
  passed: number;
  failed: number;
  partial: number;
  pass_rate: number;
}

export interface QuotationResponseRate {
  supplier_id: number;
  supplier_name: string;
  total_quotations: number;
  submitted: number;
  response_rate: number;
}

export interface SupplierRiskAssessment {
  blacklisted: boolean;
  delivery_risk: number;
  quality_risk: number;
  overall_risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
}

export interface SupplierSpendAnalysis {
  supplier_id: number;
  supplier_name: string;
  order_count: number;
  total_spent: number;
  avg_order_value: number;
  min_order_value: number;
  max_order_value: number;
}

export interface TopSupplier {
  supplier_id: number;
  supplier_name: string;
  order_count: number;
  total_spent: number;
}

// ============================================
// OPERATIONAL ANALYTICS TYPES
// ============================================

export interface OperationSummary {
  total_users: number;
  active_users: number;
  system_status: SystemHealth;
  recent_activity: RecentActivity;
  notifications: NotificationStats;
}

export interface SystemHealth {
  overall_status: 'operational' | 'degraded' | 'maintenance' | 'down';
  label: string;
  color: string;
  components: SystemComponent[];
  metrics: {
    total_checks: number;
    operational_rate: number;
    degraded_rate: number;
    down_rate: number;
  };
}

export interface SystemComponent {
  component: string;
  label: string;
  icon: string;
  status: string;
  color: string;
}

export interface RecentActivity {
  today: number;
  this_week: number;
  this_month: number;
}

export interface UserActivityStats {
  total: number;
  unique_users: number;
  today: number;
}

export interface UsagePatterns {
  peak_hours: PeakHour[];
  peak_days: PeakDay[];
  avg_actions_per_user: number;
}

export interface PeakHour {
  hour: number;
  label: string;
  count: number;
}

export interface PeakDay {
  day: string;
  count: number;
}

export interface NotificationStats {
  total: number;
  sent: number;
  read: number;
  failed: number;
  delivery_rate: number;
  read_rate: number;
  by_channel: NotificationChannelStats[];
  by_type: NotificationTypeStats[];
}

export interface NotificationChannelStats {
  channel: string;
  label: string;
  count: number;
}

export interface NotificationTypeStats {
  type: string;
  label: string;
  count: number;
}

export interface AuditSummary {
  total_actions: number;
  unique_users: number;
  unique_entities: number;
  top_actions: TopAction[];
  by_entity: EntityActivity[];
}

export interface TopAction {
  action: string;
  label: string;
  color: string;
  count: number;
}

export interface EntityActivity {
  entity_type: string;
  label: string;
  count: number;
}

export interface SignatureAdoption {
  total_users: number;
  users_with_verified_signatures: number;
  adoption_rate: number;
  verification_success_rate: number;
}

export interface UserPerformance {
  user_id: number;
  user_name: string;
  actions: number;
  active_days: number;
  avg_actions_per_day: number;
}

export interface ErrorAnalytics {
  total_errors: number;
  by_component: ErrorByComponent[];
  downtime_hours: number;
  mtbf: number;
  mttr: number;
}

export interface ErrorByComponent {
  component: string;
  label: string;
  count: number;
}

export interface BackupStatus {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  success_rate: number;
  latest: Backup | null;
  total_size: number;
}

export interface Backup {
  id: number;
  name: string;
  file_name: string;
  size: number;
  status: string;
  type: string;
  completed_at: string | null;
  created_at: string;
}

// ============================================
// CONTRACT ANALYTICS TYPES
// ============================================

export interface ContractStats {
  total: number;
  active: number;
  completed: number;
  expired: number;
  terminated: number;
  draft: number;
  suspended: number;
  total_value: number;
  avg_value: number;
}

export interface ContractRenewalStats {
  renewable_count: number;
  renewed_count: number;
  renewal_rate: number;
  avg_renewal_period: number;
}

export interface ContractValueDistribution {
  range: string;
  count: number;
  total_value: number;
}

export interface ContractBySupplier {
  supplier_id: number;
  supplier_name: string;
  contract_count: number;
  total_value: number;
  avg_value: number;
}

// ============================================
// GRN ANALYTICS TYPES
// ============================================

export interface GRNStats {
  total: number;
  draft: number;
  submitted: number;
  hod_approved: number;
  principal_approved: number;
  completed: number;
  rejected: number;
}

export interface GRNInspectionResult {
  result: string;
  label: string;
  count: number;
}

export interface GRNQuarantineStats {
  total_quarantined: number;
  active_quarantine: number;
  released: number;
  by_reason: {
    reason: string;
    count: number;
  }[];
}

export interface GRNItemCondition {
  condition: string;
  count: number;
}

// ============================================
// SAN ANALYTICS TYPES
// ============================================

export interface SANStats {
  total: number;
  draft: number;
  submitted: number;
  hod_approved: number;
  principal_approved: number;
  completed: number;
  rejected: number;
}

export interface SANQualityRating {
  rating: string;
  label: string;
  count: number;
}

export interface ServiceProviderPerformance {
  provider_id: number;
  provider_name: string;
  total: number;
  avg_rating: number;
  excellent: number;
  good: number;
  average: number;
  poor: number;
}

// ============================================
// QUOTATION ANALYTICS TYPES
// ============================================

export interface RFQStats {
  total: number;
  draft: number;
  sent: number;
  responded: number;
  evaluating: number;
  closed: number;
  cancelled: number;
  expired: number;
}

export interface RFQResponseRate {
  total_rfqs: number;
  total_sent: number;
  total_responded: number;
  total_declined: number;
  response_rate: number;
}

export interface QuotationVerificationStats {
  total: number;
  pending: number;
  in_progress: number;
  verified: number;
  rejected: number;
  needs_more_info: number;
}

export interface QuotationEvaluationStats {
  total: number;
  pending: number;
  evaluated: number;
  accepted: number;
  rejected: number;
}

// ============================================
// TENDER ANALYTICS TYPES
// ============================================

export interface TenderStats {
  total: number;
  draft: number;
  published: number;
  evaluating: number;
  awarded: number;
  cancelled: number;
  expired: number;
  total_estimated_value: number;
  total_awarded_value: number;
}

export interface TenderAwardVariance {
  average_variance: number;
  min_variance: number;
  max_variance: number;
  by_tender: {
    tender_id: number;
    tender_number: string;
    estimated_value: number;
    awarded_amount: number;
    variance: number;
  }[];
}

// ============================================
// RESPONSE TYPES
// ============================================

export type ExecutiveDashboardResponse = ApiResponse<ExecutiveDashboard>;
export type ProcurementDashboardResponse = ApiResponse<ProcurementDashboard>;
export type FinancialDashboardResponse = ApiResponse<FinancialDashboard>;
export type OperationalDashboardResponse = ApiResponse<OperationalDashboard>;
export type SupplierDashboardResponse = ApiResponse<SupplierDashboard>;
export type DepartmentDashboardResponse = ApiResponse<DepartmentDashboard>;
export type KPIDashboardResponse = ApiResponse<KeyMetrics>;

export type RequisitionAnalyticsSummaryResponse = ApiResponse<RequisitionAnalyticsSummary>;
export type RequisitionTrendsResponse = ApiResponse<TrendDataPoint[]>;
export type RequisitionStatusDistributionResponse = ApiResponse<Record<string, number>>;
export type ApprovalCycleAnalysisResponse = ApiResponse<ApprovalCycleAnalysis>;
export type RequisitionReturnAnalysisResponse = ApiResponse<RequisitionReturnAnalysis>;
export type ConversionFunnelResponse = ApiResponse<ConversionFunnel[]>;
export type SlaComplianceResponse = ApiResponse<SlaCompliance>;
export type EmergencyRequisitionMetricsResponse = ApiResponse<EmergencyRequisitionMetrics>;
export type RequisitionItemAnalyticsResponse = ApiResponse<RequisitionItemAnalytics>;
export type DepartmentScorecardResponse = ApiResponse<DepartmentScorecard>;
