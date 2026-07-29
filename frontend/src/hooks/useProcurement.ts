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
} from '@/types/procurement.types';

// ============================================
// QUERIES
// ============================================

export const useProcurementStatus = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<ProcurementStatusResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['procurement-status', requisitionId],
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
    queryKey: ['procurement-summary', requisitionId],
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
    queryKey: ['procurement-timeline', requisitionId],
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
    queryKey: ['procurement-metrics', requisitionId],
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
    queryKey: ['procurement-steps', requisitionId],
    queryFn: () => procurementService.getSteps(requisitionId),
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
      queryClient.invalidateQueries({ queryKey: ['procurement-status', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-summary', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.requisition_id] });
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
      queryClient.invalidateQueries({ queryKey: ['procurement-status', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-summary', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-metrics', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.requisition_id] });
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
      queryClient.invalidateQueries({ queryKey: ['procurement-status', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-summary', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.requisition_id] });
      success('Procurement cancelled successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel procurement');
    },
  });
};
