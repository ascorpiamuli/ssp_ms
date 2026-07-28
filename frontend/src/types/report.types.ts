// frontend/src/types/report.types.ts

import { ApiResponse } from './common.types';
import { RequisitionStats } from './requisition.types';
import { ApprovalStats } from './approval.types';
import { BudgetStats } from './budget.types';

// ============================================
// DASHBOARD STATS
// ============================================

export interface DashboardStats {
  requisitions: RequisitionStats;
  approvals: ApprovalStats;
  budgets: BudgetStats;
  timestamp: string;
}

// ============================================
// SUMMARY REPORT
// ============================================

export interface SummaryReport {
  summary: RequisitionStats;
  total_approved_amount: number;
  pending_amount: number;
  report_generated_at: string;
}

// ============================================
// APPROVAL PERFORMANCE REPORT
// ============================================

export interface ApprovalPerformanceReport {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  returned: number;
  delegated: number;
  escalated: number;
  avg_response_time: number | null;
  by_day?: Record<string, number>;
  by_month?: Record<string, number>;
}

// ============================================
// BUDGET UTILIZATION REPORT
// ============================================

export interface BudgetUtilizationReport {
  total_allocated: number;
  total_utilized: number;
  total_remaining: number;
  total_requested: number;
  utilization_percentage: number;
  by_budget_code?: Record<string, {
    allocated: number;
    utilized: number;
    remaining: number;
    percentage: number;
  }>;
  by_department?: Record<string, {
    allocated: number;
    utilized: number;
    remaining: number;
    percentage: number;
  }>;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export type DashboardStatsResponse = ApiResponse<DashboardStats>;
export type SummaryReportResponse = ApiResponse<SummaryReport>;
export type ApprovalPerformanceResponse = ApiResponse<ApprovalPerformanceReport>;
export type BudgetUtilizationResponse = ApiResponse<BudgetUtilizationReport>;

export interface ReportFilters {
  department_id?: number;
  user_id?: number;
  date_from?: string;
  date_to?: string;
}
