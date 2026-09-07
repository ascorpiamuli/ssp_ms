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
  ServiceCategory,
  RequisitionTypeEnum,
  ProcurementTypeEnum,
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
// REQUISITION TYPE-SPECIFIC LIST QUERIES
// ============================================

/**
 * Get only service requisitions (LSO)
 */
export const useServiceRequisitions = (
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['service-requisitions', filters],
    queryFn: () => requisitionService.getServices(filters),
    ...options,
  });
};

/**
 * Get only goods requisitions (LPO)
 */
export const useGoodsRequisitions = (
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['goods-requisitions', filters],
    queryFn: () => requisitionService.getGoods(filters),
    ...options,
  });
};

/**
 * Get requisitions by service category
 */
export const useRequisitionsByServiceCategory = (
  category: ServiceCategory,
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisitions-by-category', category, filters],
    queryFn: () => requisitionService.getByServiceCategory(category, filters),
    enabled: !!category,
    ...options,
  });
};

/**
 * Get requisitions ready for LPO generation (goods)
 */
export const useRequisitionsForLpo = (
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisitions-for-lpo', filters],
    queryFn: () => requisitionService.getForLpo(filters),
    ...options,
  });
};

/**
 * Get requisitions ready for LSO generation (services)
 */
export const useRequisitionsForLso = (
  filters?: RequisitionFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisitions-for-lso', filters],
    queryFn: () => requisitionService.getForLso(filters),
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

// ============================================
// COMBINED QUERY HOOKS FOR CONVENIENCE
// ============================================

/**
 * Get all requisition data for a dashboard
 */
export const useRequisitionDashboardData = (
  filters?: RequisitionFilters
) => {
  const requisitions = useRequisitions(filters);
  const stats = useRequisitionStats(filters);
  const myStats = useMyRequisitionStats();
  const pendingApprovals = usePendingApprovalsList(filters);

  return {
    requisitions,
    stats,
    myStats,
    pendingApprovals,
    isLoading: requisitions.isLoading || stats.isLoading || myStats.isLoading || pendingApprovals.isLoading,
    isError: requisitions.isError || stats.isError || myStats.isError || pendingApprovals.isError,
    error: requisitions.error || stats.error || myStats.error || pendingApprovals.error,
  };
};

/**
 * Get service requisition dashboard data
 */
export const useServiceRequisitionDashboardData = (
  filters?: RequisitionFilters
) => {
  const serviceRequisitions = useServiceRequisitions(filters);
  const stats = useRequisitionStats({ ...filters, requisition_type: 'services' });
  const forLso = useRequisitionsForLso(filters);
  const pendingApprovals = usePendingApprovalsList(filters);

  return {
    serviceRequisitions,
    stats,
    forLso,
    pendingApprovals,
    isLoading: serviceRequisitions.isLoading || stats.isLoading || forLso.isLoading || pendingApprovals.isLoading,
    isError: serviceRequisitions.isError || stats.isError || forLso.isError || pendingApprovals.isError,
    error: serviceRequisitions.error || stats.error || forLso.error || pendingApprovals.error,
  };
};

/**
 * Get goods requisition dashboard data
 */
export const useGoodsRequisitionDashboardData = (
  filters?: RequisitionFilters
) => {
  const goodsRequisitions = useGoodsRequisitions(filters);
  const stats = useRequisitionStats({ ...filters, requisition_type: 'goods' });
  const forLpo = useRequisitionsForLpo(filters);
  const pendingApprovals = usePendingApprovalsList(filters);

  return {
    goodsRequisitions,
    stats,
    forLpo,
    pendingApprovals,
    isLoading: goodsRequisitions.isLoading || stats.isLoading || forLpo.isLoading || pendingApprovals.isLoading,
    isError: goodsRequisitions.isError || stats.isError || forLpo.isError || pendingApprovals.isError,
    error: goodsRequisitions.error || stats.error || forLpo.error || pendingApprovals.error,
  };
};

// ============================================
// EXPORT ALL QUERIES
// ============================================

export const useRequisitionQueries = () => {
  return {
    // List queries
    requisitions: useRequisitions,
    myRequisitions: useMyRequisitions,
    pendingApprovals: usePendingApprovalsList,
    adminRequisitions: useAdminRequisitions,
    adminDepartmentRequisitions: useAdminDepartmentRequisitions,

    // Type-specific list queries
    serviceRequisitions: useServiceRequisitions,
    goodsRequisitions: useGoodsRequisitions,
    requisitionsByServiceCategory: useRequisitionsByServiceCategory,
    requisitionsForLpo: useRequisitionsForLpo,
    requisitionsForLso: useRequisitionsForLso,

    // Detail queries
    requisition: useRequisition,
    requisitionByReference: useRequisitionByReference,

    // Stats queries
    requisitionStats: useRequisitionStats,
    myRequisitionStats: useMyRequisitionStats,
    adminRequisitionStats: useAdminRequisitionStats,

    // History queries
    requisitionHistory: useRequisitionHistory,
    historyByAction: useHistoryByAction,
    historyStats: useHistoryStats,
    recentHistory: useRecentHistory,

    // Attachment queries
    requisitionAttachments: useRequisitionAttachments,
    requisitionAttachment: useRequisitionAttachment,

    // Dashboard data
    dashboardData: useRequisitionDashboardData,
    serviceDashboardData: useServiceRequisitionDashboardData,
    goodsDashboardData: useGoodsRequisitionDashboardData,
  };
};
