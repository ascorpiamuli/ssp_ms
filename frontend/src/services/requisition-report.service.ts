// frontend/src/services/requisition-report.service.ts

import { api } from './api';
import type { DashboardStats } from '@/types/report.types';
import type { SummaryReport } from '@/types/report.types';
import type { ApprovalPerformanceReport } from '@/types/report.types';
import type { BudgetUtilizationReport } from '@/types/report.types';
import type { ReportFilters } from '@/types/report.types';

export const requisitionReportService = {
  /**
   * Get dashboard statistics
   */
  getDashboard: async (filters?: ReportFilters): Promise<DashboardStats> => {
    return api.get<DashboardStats>('/reports/dashboard', { params: filters });
  },

  /**
   * Get summary report
   */
  getSummary: async (filters?: ReportFilters): Promise<SummaryReport> => {
    return api.get<SummaryReport>('/reports/summary', { params: filters });
  },

  /**
   * Get approval performance report
   */
  getApprovalPerformance: async (userId: number): Promise<ApprovalPerformanceReport> => {
    return api.get<ApprovalPerformanceReport>('/reports/approval-performance', { params: { user_id: userId } });
  },

  /**
   * Get budget utilization report
   */
  getBudgetUtilization: async (filters?: ReportFilters): Promise<BudgetUtilizationReport> => {
    return api.get<BudgetUtilizationReport>('/reports/budget-utilization', { params: filters });
  },

  /**
   * Get department report
   */
  getDepartmentReport: async (departmentId: number, filters?: ReportFilters): Promise<any> => {
    return api.get(`/reports/department/${departmentId}`, { params: filters });
  },

  /**
   * Export report
   */
  export: async (filters?: ReportFilters): Promise<Blob> => {
    const response = await api.getClient().get('/reports/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
