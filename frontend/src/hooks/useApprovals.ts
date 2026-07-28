// frontend/src/hooks/useApprovals.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { approvalService } from '@/services/approval.service';
import { approvalWorkflowService } from '@/services/approval-workflow.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  Approval,
  ApprovalStats,
  ApprovalWorkflow,
  CreateWorkflowData,
  UpdateWorkflowData,
  ProcessApprovalData,
  DelegateApprovalData,
} from '@/types/approval.types';
import { PaginatedResponse } from '../types/common.types';

// ============================================
// APPROVAL QUERIES
// ============================================

export const useApprovals = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<Approval[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['approvals', requisitionId],
    queryFn: () => approvalService.getByRequisitionId(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const usePendingApprovals = (
  filters?: {
    level?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<Approval>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['pending-approvals', filters],
    queryFn: () => approvalService.getPending(filters),
    ...options,
  });
};

/**
 * Get approvals by role (all statuses including processed)
 */
export const useRoleApprovals = (
  role: string,
  filters?: {
    status?: string; // 'all', 'pending', 'approved', 'declined', 'returned'
    page?: number;
    per_page?: number;
    department_id?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<Approval>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['role-approvals', role, filters],
    queryFn: () => approvalService.getByRole(role, filters),
    enabled: !!role,
    ...options,
  });
};

export const useApprovalStats = (
  options?: Omit<UseQueryOptions<ApprovalStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['approval-stats'],
    queryFn: () => approvalService.getStats(),
    ...options,
  });
};

export const useAdminPendingApprovals = (
  filters?: {
    department_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<Approval>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['admin-pending-approvals', filters],
    queryFn: () => approvalService.adminGetPending(filters),
    ...options,
  });
};

export const useAdminDelayedApprovals = (
  filters?: {
    department_id?: number;
    days?: number;
    page?: number;
    per_page?: number;
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<Approval>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['admin-delayed-approvals', filters],
    queryFn: () => approvalService.adminGetDelayed(filters),
    ...options,
  });
};

// ============================================
// APPROVAL WORKFLOW QUERIES
// ============================================

export const useApprovalWorkflows = (
  filters?: {
    department_id?: number;
    is_active?: boolean;
    search?: string;
  },
  options?: Omit<UseQueryOptions<ApprovalWorkflow[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['approval-workflows', filters],
    queryFn: () => approvalWorkflowService.getAll(filters),
    ...options,
  });
};

export const useApprovalWorkflow = (
  id: number,
  options?: Omit<UseQueryOptions<ApprovalWorkflow>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['approval-workflow', id],
    queryFn: () => approvalWorkflowService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useDefaultApprovalWorkflow = (
  departmentId: number,
  options?: Omit<UseQueryOptions<ApprovalWorkflow | null>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['default-approval-workflow', departmentId],
    queryFn: () => approvalWorkflowService.getDefault(departmentId),
    enabled: !!departmentId,
    ...options,
  });
};

// ============================================
// APPROVAL MUTATIONS WITH TOASTS
// ============================================

export const useProcessApproval = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      level,
      data,
    }: {
      requisitionId: number;
      level: string;
      data: ProcessApprovalData;
    }) => approvalService.process(requisitionId, level, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approvals', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['role-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval-stats'] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });

      const actionMap = {
        approved: 'approved',
        declined: 'declined',
        returned: 'returned for revision',
      };
      success(`Requisition ${actionMap[variables.data.action as keyof typeof actionMap] || 'processed'} successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to process approval');
    },
  });
};

/**
 * Get delegated approvals for a user (approvals delegated to them)
 */
export const useDelegatedApprovals = (
  filters?: {
    status?: string; // 'pending', 'approved', 'declined', 'all'
    page?: number;
    per_page?: number;
    date_from?: string;
    date_to?: string;
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<Approval>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['delegated-approvals', filters],
    queryFn: () => approvalService.getDelegated(filters),
    ...options,
  });
};

export const useDelegateApproval = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ approvalId, data }: { approvalId: number; data: DelegateApprovalData }) =>
      approvalService.delegate(approvalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['role-approvals'] });
      success('Approval delegated successfully');
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to delegate approval');
    },
  });
};

export const useAdminEscalateApproval = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ approvalId, data }: { approvalId: number; data: { reason: string } }) =>
      approvalService.adminEscalate(approvalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-approvals'] });
      success('Approval escalated successfully');
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to escalate approval');
    },
  });
};

export const useAdminReassignApproval = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ approvalId, data }: { approvalId: number; data: { user_id: number } }) =>
      approvalService.adminReassign(approvalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-approvals'] });
      success('Approval reassigned successfully');
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to reassign approval');
    },
  });
};

// ============================================
// APPROVAL WORKFLOW MUTATIONS WITH TOASTS
// ============================================

export const useCreateApprovalWorkflow = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateWorkflowData) => approvalWorkflowService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      success(`Workflow "${data.name}" created successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to create workflow');
    },
  });
};

export const useUpdateApprovalWorkflow = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWorkflowData }) =>
      approvalWorkflowService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['approval-workflow', variables.id] });
      success(`Workflow "${data.name}" updated successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to update workflow');
    },
  });
};

export const useDeleteApprovalWorkflow = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => approvalWorkflowService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      success('Workflow deleted successfully');
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to delete workflow');
    },
  });
};

export const useCloneApprovalWorkflow = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { department_id: number; name: string } }) =>
      approvalWorkflowService.clone(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      success(`Workflow "${data.name}" cloned successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to clone workflow');
    },
  });
};
