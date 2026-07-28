// frontend/src/hooks/requisition/useRequisitionQueries.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { requisitionService } from '@/services/requisition.service';
import { requisitionHistoryService } from '@/services/requisition-history.service';
import { requisitionAttachmentService } from '@/services/requisition-attachment.service';
import type {
  Requisition,
  RequisitionFilters,
  RequisitionStats,
  RequisitionHistory,
  HistoryAction,
  RequisitionAttachment,
} from '@/types/requisition.types';
import { PaginatedResponse } from '../types/common.types';

export const REQUISITIONS_QUERY_KEY = 'requisitions';

// ============================================
// REQUISITION LIST QUERIES
// ============================================

export const useRequisitions = (
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [REQUISITIONS_QUERY_KEY, filters],
    queryFn: () => requisitionService.getAll(filters),
    ...options,
  });
};

export const useMyRequisitions = (
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['my-requisitions', filters],
    queryFn: () => requisitionService.getMyRequisitions(filters),
    ...options,
  });
};

export const usePendingApprovalsList = (
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['pending-approvals-list', filters],
    queryFn: () => requisitionService.getPendingApprovals(filters),
    ...options,
  });
};

export const useAdminRequisitions = (
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['admin-requisitions', filters],
    queryFn: () => requisitionService.adminGetAll(filters),
    ...options,
  });
};

export const useAdminDepartmentRequisitions = (
  departmentId: number,
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['admin-department-requisitions', departmentId, filters],
    queryFn: () => requisitionService.adminGetDepartmentRequisitions(departmentId, filters),
    enabled: !!departmentId,
    ...options,
  });
};

// ============================================
// REQUISITION DETAIL QUERIES
// ============================================

export const useRequisition = (
  id: number,
  options?: Omit<UseQueryOptions<Requisition>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition', id],
    queryFn: () => requisitionService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useRequisitionByReference = (
  referenceNumber: string,
  options?: Omit<UseQueryOptions<Requisition>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-ref', referenceNumber],
    queryFn: () => requisitionService.getByReference(referenceNumber),
    enabled: !!referenceNumber,
    ...options,
  });
};

// ============================================
// REQUISITION STATS QUERIES
// ============================================

export const useRequisitionStats = (
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<RequisitionStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-stats', filters],
    queryFn: () => requisitionService.getStats(filters),
    ...options,
  });
};

export const useMyRequisitionStats = (
  options?: Omit<UseQueryOptions<RequisitionStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['my-requisition-stats'],
    queryFn: () => requisitionService.getMyStats(),
    ...options,
  });
};

export const useAdminRequisitionStats = (
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<RequisitionStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['admin-requisition-stats', filters],
    queryFn: () => requisitionService.adminGetStats(filters),
    ...options,
  });
};

// ============================================
// REQUISITION HISTORY QUERIES
// ============================================

export const useRequisitionHistory = (
  requisitionId: number,
  filters?: {
    action?: HistoryAction;
    user_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<RequisitionHistory>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-history', requisitionId, filters],
    queryFn: () => requisitionHistoryService.getByRequisitionId(requisitionId, filters),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useHistoryByAction = (
  action: HistoryAction,
  filters?: {
    requisition_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<RequisitionHistory>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['history-by-action', action, filters],
    queryFn: () => requisitionHistoryService.getByAction(action, filters),
    enabled: !!action,
    ...options,
  });
};

export const useHistoryStats = (
  filters?: {
    requisition_id?: number;
    date_from?: string;
    date_to?: string;
  },
  options?: Omit<UseQueryOptions<{
    total: number;
    by_action: Record<string, number>;
    by_user: Array<{ user: string; count: number }>;
  }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['history-stats', filters],
    queryFn: () => requisitionHistoryService.getStats(filters),
    ...options,
  });
};

export const useRecentHistory = (
  userId: number,
  limit: number = 10,
  options?: Omit<UseQueryOptions<RequisitionHistory[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['recent-history', userId, limit],
    queryFn: () => requisitionHistoryService.getRecentForUser(userId, limit),
    enabled: !!userId,
    ...options,
  });
};

// ============================================
// REQUISITION ATTACHMENT QUERIES
// ============================================

export const useRequisitionAttachments = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<RequisitionAttachment[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-attachments', requisitionId],
    queryFn: () => requisitionAttachmentService.getByRequisitionId(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useRequisitionAttachment = (
  requisitionId: number,
  attachmentId: number,
  options?: Omit<UseQueryOptions<RequisitionAttachment>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-attachment', requisitionId, attachmentId],
    queryFn: () => requisitionAttachmentService.getById(requisitionId, attachmentId),
    enabled: !!requisitionId && !!attachmentId,
    ...options,
  });
};
