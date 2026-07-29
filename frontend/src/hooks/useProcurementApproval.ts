// frontend/src/hooks/useProcurementApproval.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { procurementApprovalService } from '@/services/procurementApproval.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  ProcurementApproval,
  ApprovalFilters,
  ApprovalStatistics,
  ApprovalTimeline,
  CreateApprovalData,
  ApproveApprovalData,
  DeclineApprovalData,
  ReturnApprovalData,
  DelegateApprovalData,
  ReassignApprovalData,
  EntityApprovalRequest,
} from '@/types/procurementApproval.types';
import type { PaginatedResponse } from '@/types/common.types';

export const PROCUREMENT_APPROVALS_QUERY_KEY = 'procurement-approvals';

// ============================================
// QUERIES
// ============================================

export const useProcurementApprovals = (
  filters?: ApprovalFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<ProcurementApproval>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_APPROVALS_QUERY_KEY, filters],
    queryFn: () => procurementApprovalService.getAll(filters),
    ...options,
  });
};

export const useProcurementApproval = (
  id: number,
  options?: Omit<UseQueryOptions<ProcurementApproval>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['procurement-approval', id],
    queryFn: () => procurementApprovalService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useProcurementApprovalsForEntity = (
  params: EntityApprovalRequest,
  options?: Omit<UseQueryOptions<ProcurementApproval[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['procurement-approvals-entity', params.entity_id, params.entity_type],
    queryFn: () => procurementApprovalService.getForEntity(params),
    enabled: !!params.entity_id && !!params.entity_type,
    ...options,
  });
};

export const useProcurementApprovalTimeline = (
  params: EntityApprovalRequest,
  options?: Omit<UseQueryOptions<ApprovalTimeline[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['procurement-approval-timeline', params.entity_id, params.entity_type],
    queryFn: () => procurementApprovalService.getTimeline(params),
    enabled: !!params.entity_id && !!params.entity_type,
    ...options,
  });
};

export const useProcurementIsApproved = (
  params: EntityApprovalRequest,
  options?: Omit<UseQueryOptions<{ is_approved: boolean }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['procurement-is-approved', params.entity_id, params.entity_type],
    queryFn: () => procurementApprovalService.isApproved(params),
    enabled: !!params.entity_id && !!params.entity_type,
    ...options,
  });
};

export const useProcurementCurrentLevel = (
  params: EntityApprovalRequest,
  options?: Omit<UseQueryOptions<ProcurementApproval | null>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['procurement-current-level', params.entity_id, params.entity_type],
    queryFn: () => procurementApprovalService.getCurrentLevel(params),
    enabled: !!params.entity_id && !!params.entity_type,
    ...options,
  });
};

export const useProcurementApprovalStatistics = (
  options?: Omit<UseQueryOptions<ApprovalStatistics>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['procurement-approval-statistics'],
    queryFn: () => procurementApprovalService.getStatistics(),
    ...options,
  });
};

export const useProcurementPendingApprovals = (
  userId?: number,
  options?: Omit<UseQueryOptions<ProcurementApproval[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['procurement-pending-approvals', userId],
    queryFn: () => procurementApprovalService.getPendingForUser(userId),
    ...options,
  });
};

export const useProcurementOverdueApprovals = (
  options?: Omit<UseQueryOptions<ProcurementApproval[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['procurement-overdue-approvals'],
    queryFn: () => procurementApprovalService.getOverdue(),
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreateProcurementApproval = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateApprovalData) => procurementApprovalService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_APPROVALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals-entity', data.entity_id, data.entity_type] });
      queryClient.invalidateQueries({ queryKey: ['procurement-pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-current-level', data.entity_id, data.entity_type] });
      success('Approval created successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to create approval');
    },
  });
};

export const useApproveProcurementApproval = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApproveApprovalData }) =>
      procurementApprovalService.approve(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_APPROVALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approval', data.id] });
      queryClient.invalidateQueries({
        queryKey: ['procurement-approvals-entity', data.approvable_id, data.approvable_type]
      });
      queryClient.invalidateQueries({ queryKey: ['procurement-pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-overdue-approvals'] });
      queryClient.invalidateQueries({
        queryKey: ['procurement-is-approved', data.approvable_id, data.approvable_type]
      });
      queryClient.invalidateQueries({
        queryKey: ['procurement-current-level', data.approvable_id, data.approvable_type]
      });
      queryClient.invalidateQueries({ queryKey: ['procurement-approval-statistics'] });
      success('Approval approved successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to approve');
    },
  });
};

export const useDeclineProcurementApproval = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DeclineApprovalData }) =>
      procurementApprovalService.decline(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_APPROVALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approval', data.id] });
      queryClient.invalidateQueries({
        queryKey: ['procurement-approvals-entity', data.approvable_id, data.approvable_type]
      });
      queryClient.invalidateQueries({ queryKey: ['procurement-pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-overdue-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approval-statistics'] });
      success('Approval declined');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to decline');
    },
  });
};

export const useReturnProcurementApproval = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReturnApprovalData }) =>
      procurementApprovalService.return(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_APPROVALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approval', data.id] });
      queryClient.invalidateQueries({
        queryKey: ['procurement-approvals-entity', data.approvable_id, data.approvable_type]
      });
      queryClient.invalidateQueries({ queryKey: ['procurement-pending-approvals'] });
      success('Approval returned for revision');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to return approval');
    },
  });
};

export const useDelegateProcurementApproval = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DelegateApprovalData }) =>
      procurementApprovalService.delegate(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_APPROVALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approval', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-pending-approvals'] });
      success('Approval delegated successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to delegate approval');
    },
  });
};

export const useReassignProcurementApproval = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReassignApprovalData }) =>
      procurementApprovalService.reassign(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_APPROVALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approval', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-pending-approvals'] });
      success('Approval reassigned successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to reassign approval');
    },
  });
};
