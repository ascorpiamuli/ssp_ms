// frontend/src/services/requisition-budget.service.ts

import { api } from './api';
import type { RequisitionBudget } from '@/types/budget.types';
import type { CreateBudgetData } from '@/types/budget.types';
import type { UpdateBudgetData } from '@/types/budget.types';
import type { BudgetStats } from '@/types/budget.types';

export const requisitionBudgetService = {
  /**
   * Get budgets for a requisition
   */
  getByRequisitionId: async (requisitionId: number): Promise<RequisitionBudget[]> => {
    return api.get<RequisitionBudget[]>(`/requisitions/${requisitionId}/budgets`);
  },

  /**
   * Get budget by ID
   */
  getById: async (requisitionId: number, budgetId: number): Promise<RequisitionBudget> => {
    return api.get<RequisitionBudget>(`/requisitions/${requisitionId}/budgets/${budgetId}`);
  },

  /**
   * Create a budget
   */
  create: async (requisitionId: number, data: CreateBudgetData): Promise<RequisitionBudget> => {
    return api.post<RequisitionBudget>(`/requisitions/${requisitionId}/budgets`, data);
  },

  /**
   * Update a budget
   */
  update: async (
    requisitionId: number,
    budgetId: number,
    data: UpdateBudgetData
  ): Promise<RequisitionBudget> => {
    return api.put<RequisitionBudget>(`/requisitions/${requisitionId}/budgets/${budgetId}`, data);
  },

  /**
   * Verify budget
   */
  verify: async (requisitionId: number, budgetId: number, data?: { notes?: string }): Promise<RequisitionBudget> => {
    return api.post<RequisitionBudget>(`/requisitions/${requisitionId}/budgets/${budgetId}/verify`, data || {});
  },

  /**
   * Approve budget
   */
  approve: async (requisitionId: number, budgetId: number, data?: { notes?: string }): Promise<RequisitionBudget> => {
    return api.post<RequisitionBudget>(`/requisitions/${requisitionId}/budgets/${budgetId}/approve`, data || {});
  },

  /**
   * Reject budget
   */
  reject: async (requisitionId: number, budgetId: number, data: { reason: string }): Promise<RequisitionBudget> => {
    return api.post<RequisitionBudget>(`/requisitions/${requisitionId}/budgets/${budgetId}/reject`, data);
  },

  /**
   * Get budget statistics
   */
  getStats: async (filters?: {
    department_id?: number;
    fiscal_year?: string;
  }): Promise<BudgetStats> => {
    return api.get<BudgetStats>('/budgets/stats', { params: filters });
  },

  /**
   * Get fiscal years
   */
  getFiscalYears: async (): Promise<string[]> => {
    return api.get<string[]>('/budgets/fiscal-years');
  },
};
