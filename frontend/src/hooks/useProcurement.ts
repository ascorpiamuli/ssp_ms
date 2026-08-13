// frontend/src/hooks/useProcurement.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { procurementService } from '@/services/procurement.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  ProcurementStatusResponse,
  ProcurementSummary,
  ProcurementMetrics,
  ProcurementTimelineItem,
  StartProcurementData,
  CancelProcurementData,
  ProcurementStatistics,
  RequisitionWithQtn,
} from '@/types/procurement.types';
import type { Requisition } from '@/types/requisition.types';
import type { PaginatedResponse } from '@/types/common.types';

export const PROCUREMENT_QUERY_KEY = 'procurement';

// ============================================
// QUERIES
// ============================================

export const useProcurementStatus = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<ProcurementStatusResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_QUERY_KEY, 'status', requisitionId],
    queryFn: () => procurementService.getStatus(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useProcurementSummary = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<ProcurementSummary>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_QUERY_KEY, 'summary', requisitionId],
    queryFn: () => procurementService.getSummary(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useProcurementTimeline = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<ProcurementTimelineItem[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_QUERY_KEY, 'timeline', requisitionId],
    queryFn: () => procurementService.getTimeline(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useProcurementMetrics = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<ProcurementMetrics>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_QUERY_KEY, 'metrics', requisitionId],
    queryFn: () => procurementService.getMetrics(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useProcurementSteps = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_QUERY_KEY, 'steps', requisitionId],
    queryFn: () => procurementService.getSteps(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

// ============================================
// 🔧 NEW: Procurement-Ready Requisitions Queries
// ============================================

/**
 * Get requisitions ready for procurement
 */
export const useReadyRequisitions = (
  params?: {
    page?: number;
    per_page?: number;
    search?: string;
    department_id?: number;
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_QUERY_KEY, 'ready-requisitions', params],
    queryFn: () => procurementService.getReadyRequisitions(params),
    ...options,
  });
};

/**
 * Get requisitions that already have QTNs
 */
export const useRequisitionsWithQtns = (
  params?: {
    page?: number;
    per_page?: number;
    search?: string;
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<RequisitionWithQtn>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_QUERY_KEY, 'requisitions-with-qtns', params],
    queryFn: () => procurementService.getRequisitionsWithQtns(params),
    ...options,
  });
};

/**
 * Get requisitions in procurement process
 */
export const useProcurementInProgress = (
  params?: {
    page?: number;
    per_page?: number;
    search?: string;
  },
  options?: Omit<UseQueryOptions<PaginatedResponse<Requisition>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_QUERY_KEY, 'in-progress', params],
    queryFn: () => procurementService.getInProgress(params),
    ...options,
  });
};

/**
 * Get procurement statistics
 * The API returns: total, approved, pending, declined, draft, returned, revised, cancelled,
 * ready_for_procurement, in_progress, with_qtns, completed, by_status
 */
export const useProcurementStatistics = (
  options?: Omit<UseQueryOptions<ProcurementStatistics>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_QUERY_KEY, 'statistics'],
    queryFn: async () => {
      const response = await procurementService.getStatistics();
      // The API returns the data directly with all the fields
      return response as ProcurementStatistics;
    },
    ...options,
  });
};

/**
 * Get requisition with its QTN
 */
export const useRequisitionWithQtn = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<{ requisition: Requisition; qtn: any }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PROCUREMENT_QUERY_KEY, 'requisition-qtn', requisitionId],
    queryFn: () => procurementService.getRequisitionWithQtn(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useStartProcurement = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: StartProcurementData) => procurementService.start(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_QUERY_KEY, 'statistics'] });
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_QUERY_KEY, 'ready-requisitions'] });
      success(`Procurement started for requisition "${data.reference_number}"`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to start procurement');
    },
  });
};

export const useCompleteProcurement = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (requisitionId: number) => procurementService.complete(requisitionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_QUERY_KEY, 'statistics'] });
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_QUERY_KEY, 'in-progress'] });
      success('Procurement completed successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to complete procurement');
    },
  });
};

export const useCancelProcurement = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CancelProcurementData) => procurementService.cancel(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_QUERY_KEY, 'statistics'] });
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_QUERY_KEY, 'ready-requisitions'] });
      queryClient.invalidateQueries({ queryKey: [PROCUREMENT_QUERY_KEY, 'in-progress'] });
      success('Procurement cancelled successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel procurement');
    },
  });
};
