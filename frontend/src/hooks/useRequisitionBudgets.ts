// frontend/src/hooks/useRequisitionBudgets.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { requisitionBudgetService } from '@/services/requisition-budget.service';
import { requisitionRevisionService } from '@/services/requisition-revision.service';
import { requisitionNotificationService } from '@/services/requisition-notification.service';
import { requisitionReportService } from '@/services/requisition-report.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  RequisitionBudget,
  CreateBudgetData,
  UpdateBudgetData,
  BudgetStats,
} from '@/types/budget.types';
import type { RequisitionRevision } from '@/types/requisition.types';
import type { RequisitionNotification, NotificationFilters} from '@/types/notification.types';
import { PaginatedResponse } from '../types/common.types';
import type { DashboardStats, SummaryReport, ApprovalPerformanceReport, BudgetUtilizationReport } from '@/types/report.types';

// ============================================
// BUDGET QUERIES (no toasts needed)
// ============================================

export const useRequisitionBudgets = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<RequisitionBudget[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-budgets', requisitionId],
    queryFn: () => requisitionBudgetService.getByRequisitionId(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useRequisitionBudget = (
  requisitionId: number,
  budgetId: number,
  options?: Omit<UseQueryOptions<RequisitionBudget>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-budget', requisitionId, budgetId],
    queryFn: () => requisitionBudgetService.getById(requisitionId, budgetId),
    enabled: !!requisitionId && !!budgetId,
    ...options,
  });
};

export const useBudgetStats = (
  filters?: {
    department_id?: number;
    fiscal_year?: string;
  },
  options?: Omit<UseQueryOptions<BudgetStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['budget-stats', filters],
    queryFn: () => requisitionBudgetService.getStats(filters),
    ...options,
  });
};

export const useFiscalYears = (
  options?: Omit<UseQueryOptions<string[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['fiscal-years'],
    queryFn: () => requisitionBudgetService.getFiscalYears(),
    ...options,
  });
};

// ============================================
// BUDGET MUTATIONS WITH TOASTS
// ============================================

export const useCreateRequisitionBudget = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ requisitionId, data }: { requisitionId: number; data: CreateBudgetData }) =>
      requisitionBudgetService.create(requisitionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-budgets', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['budget-stats'] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      success(`Budget "${data.budget_code}" created successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to create budget');
    },
  });
};

export const useUpdateRequisitionBudget = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      budgetId,
      data,
    }: {
      requisitionId: number;
      budgetId: number;
      data: UpdateBudgetData;
    }) => requisitionBudgetService.update(requisitionId, budgetId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-budgets', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-budget', variables.requisitionId, variables.budgetId] });
      queryClient.invalidateQueries({ queryKey: ['budget-stats'] });
      success(`Budget "${data.budget_code}" updated successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to update budget');
    },
  });
};

export const useVerifyBudget = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      budgetId,
      data,
    }: {
      requisitionId: number;
      budgetId: number;
      data?: { notes?: string };
    }) => requisitionBudgetService.verify(requisitionId, budgetId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-budgets', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-budget', variables.requisitionId, variables.budgetId] });
      success(`Budget "${data.budget_code}" verified successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to verify budget');
    },
  });
};

export const useApproveBudget = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      budgetId,
      data,
    }: {
      requisitionId: number;
      budgetId: number;
      data?: { notes?: string };
    }) => requisitionBudgetService.approve(requisitionId, budgetId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-budgets', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-budget', variables.requisitionId, variables.budgetId] });
      success(`Budget "${data.budget_code}" approved successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to approve budget');
    },
  });
};

export const useRejectBudget = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      budgetId,
      data,
    }: {
      requisitionId: number;
      budgetId: number;
      data: { reason: string };
    }) => requisitionBudgetService.reject(requisitionId, budgetId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-budgets', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-budget', variables.requisitionId, variables.budgetId] });
      success(`Budget "${data.budget_code}" rejected`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to reject budget');
    },
  });
};

// ============================================
// REVISION QUERIES & MUTATIONS WITH TOASTS
// ============================================

export const useRequisitionRevisions = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<RequisitionRevision[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-revisions', requisitionId],
    queryFn: () => requisitionRevisionService.getByRequisitionId(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useRevisionStats = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    latest_revision_number: number;
  }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['revision-stats', requisitionId],
    queryFn: () => requisitionRevisionService.getStats(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useCreateRevision = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      data,
    }: {
      requisitionId: number;
      data: { reason: string; notes?: string; changes?: Record<string, any> };
    }) => requisitionRevisionService.create(requisitionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-revisions', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['revision-stats', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      success(`Revision #${data.revision_number} created successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to create revision');
    },
  });
};

export const useApproveRevision = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      revisionId,
      data,
    }: {
      requisitionId: number;
      revisionId: number;
      data?: { notes?: string };
    }) => requisitionRevisionService.approve(requisitionId, revisionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-revisions', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['revision-stats', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      success(`Revision #${data.revision_number} approved`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to approve revision');
    },
  });
};

export const useRejectRevision = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      revisionId,
      data,
    }: {
      requisitionId: number;
      revisionId: number;
      data: { reason: string };
    }) => requisitionRevisionService.reject(requisitionId, revisionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-revisions', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['revision-stats', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      success(`Revision #${data.revision_number} rejected`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to reject revision');
    },
  });
};

// ============================================
// NOTIFICATION QUERIES & MUTATIONS WITH TOASTS
// ============================================

export const useNotifications = (
  filters?: NotificationFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<RequisitionNotification>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => requisitionNotificationService.getAll(filters),
    ...options,
  });
};

export const useRequisitionNotifications = (
  requisitionId: number,
  filters?: NotificationFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<RequisitionNotification>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-notifications', requisitionId, filters],
    queryFn: () => requisitionNotificationService.getForRequisition(requisitionId, filters),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useUnreadNotificationCount = (
  options?: Omit<UseQueryOptions<{ unread_count: number }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['unread-notification-count'],
    queryFn: () => requisitionNotificationService.getUnreadCount(),
    ...options,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => requisitionNotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
      success('Notification marked as read');
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to mark notification as read');
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: () => requisitionNotificationService.markAllAsRead(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
      success(`${data.marked_count} notifications marked as read`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to mark all notifications as read');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => requisitionNotificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
      success('Notification deleted');
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to delete notification');
    },
  });
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: () => requisitionNotificationService.deleteAll(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
      success(`${data.deleted_count} notifications deleted`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to delete notifications');
    },
  });
};

// ============================================
// REPORT QUERIES (no toasts needed - just data)
// ============================================

export const useDashboardStats = (
  filters?: {
    department_id?: number;
    user_id?: number;
    date_from?: string;
    date_to?: string;
  },
  options?: Omit<UseQueryOptions<DashboardStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['dashboard-stats', filters],
    queryFn: () => requisitionReportService.getDashboard(filters),
    ...options,
  });
};

export const useSummaryReport = (
  filters?: {
    department_id?: number;
    user_id?: number;
    date_from?: string;
    date_to?: string;
  },
  options?: Omit<UseQueryOptions<SummaryReport>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['summary-report', filters],
    queryFn: () => requisitionReportService.getSummary(filters),
    ...options,
  });
};

export const useApprovalPerformanceReport = (
  userId: number,
  options?: Omit<UseQueryOptions<ApprovalPerformanceReport>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['approval-performance-report', userId],
    queryFn: () => requisitionReportService.getApprovalPerformance(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useBudgetUtilizationReport = (
  filters?: {
    department_id?: number;
    date_from?: string;
    date_to?: string;
  },
  options?: Omit<UseQueryOptions<BudgetUtilizationReport>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['budget-utilization-report', filters],
    queryFn: () => requisitionReportService.getBudgetUtilization(filters),
    ...options,
  });
};

export const useDepartmentReport = (
  departmentId: number,
  filters?: {
    date_from?: string;
    date_to?: string;
  },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['department-report', departmentId, filters],
    queryFn: () => requisitionReportService.getDepartmentReport(departmentId, filters),
    enabled: !!departmentId,
    ...options,
  });
};
