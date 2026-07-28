// frontend/src/types/budget.types.ts

import { User, ApiResponse, PaginatedResponse } from './common.types';
import { Requisition } from './requisition.types';

// ============================================
// BUDGET ENUMS
// ============================================

export type BudgetType = 'capital' | 'recurrent' | 'emergency' | 'project';
export type BudgetStatus = 'pending' | 'verified' | 'approved' | 'rejected' | 'exhausted';

// ============================================
// REQUISITION BUDGET
// ============================================

export interface RequisitionBudget {
  id: number;
  requisition_id: number;
  budget_code: string;
  budget_line_item: string | null;
  budget_category: string | null;
  budget_type: BudgetType;
  budget_type_label: string;
  project_id: string | null;
  grant_code: string | null;
  allocated_amount: number;
  formatted_allocated_amount: string;
  utilized_amount: number;
  formatted_utilized_amount: string;
  remaining_amount: number;
  formatted_remaining_amount: string;
  requested_amount: number;
  formatted_requested_amount: string;
  utilization_percentage: number;
  fiscal_year: string | null;
  fiscal_quarter: string | null;
  budget_start_date: string | null;
  budget_end_date: string | null;
  is_transferred: boolean;
  transferred_at: string | null;
  transferred_from: string | null;
  transferred_to: string | null;
  is_carry_over: boolean;
  carry_over_amount: number | null;
  variance_amount: number | null;
  variance_percentage: number | null;
  variance_reason: string | null;
  status: BudgetStatus;
  status_label: string;
  status_color: string;
  verified_by: number | null;
  verified_at: string | null;
  verification_notes: string | null;
  authorized_by: number | null;
  authorized_at: string | null;
  authorization_notes: string | null;
  verifiedBy?: User;
  authorizedBy?: User;
  requisition?: Requisition;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface CreateBudgetData {
  budget_code: string;
  budget_line_item?: string;
  budget_category?: string;
  budget_type?: BudgetType;
  project_id?: string;
  grant_code?: string;
  allocated_amount: number;
  utilized_amount?: number;
  requested_amount: number;
  fiscal_year?: string;
  fiscal_quarter?: string;
  budget_start_date?: string;
  budget_end_date?: string;
}

export interface UpdateBudgetData {
  budget_code?: string;
  budget_line_item?: string;
  budget_category?: string;
  budget_type?: BudgetType;
  project_id?: string;
  grant_code?: string;
  allocated_amount?: number;
  utilized_amount?: number;
  requested_amount?: number;
  fiscal_year?: string;
  fiscal_quarter?: string;
  budget_start_date?: string;
  budget_end_date?: string;
}

export interface BudgetStats {
  total_allocated: number;
  total_utilized: number;
  total_remaining: number;
  total_requested: number;
  count: number;
  by_status: Record<string, number>;
  by_type?: Record<string, number>;
}

export type BudgetResponse = ApiResponse<RequisitionBudget>;
export type BudgetListResponse = ApiResponse<PaginatedResponse<RequisitionBudget>>;
export type BudgetStatsResponse = ApiResponse<BudgetStats>;
