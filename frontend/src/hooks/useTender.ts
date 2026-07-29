// frontend/src/hooks/useTender.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { tenderService } from '@/services/tender.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  Tender,
  TenderFilters,
  TenderStatistics,
  CreateTenderData,
  AwardTenderData,
} from '@/types/tender.types';
import type { PaginatedResponse } from '@/types/common.types';

export const TENDERS_QUERY_KEY = 'tenders';

// ============================================
// QUERIES
// ============================================

export const useTenders = (
  filters?: TenderFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Tender>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [TENDERS_QUERY_KEY, filters],
    queryFn: () => tenderService.getAll(filters),
    ...options,
  });
};

export const useTender = (
  id: number,
  options?: Omit<UseQueryOptions<Tender>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['tender', id],
    queryFn: () => tenderService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useTenderStatistics = (
  id: number,
  options?: Omit<UseQueryOptions<TenderStatistics>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['tender-statistics', id],
    queryFn: () => tenderService.getStatistics(id),
    enabled: !!id,
    ...options,
  });
};

export const useTenderBidders = (
  id: number,
  options?: Omit<UseQueryOptions<number[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['tender-bidders', id],
    queryFn: () => tenderService.getBidders(id),
    enabled: !!id,
    ...options,
  });
};

export const useOpenTenders = (
  options?: Omit<UseQueryOptions<Tender[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['open-tenders'],
    queryFn: () => tenderService.getOpen(),
    ...options,
  });
};

export const useClosingSoonTenders = (
  options?: Omit<UseQueryOptions<Tender[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['closing-soon-tenders'],
    queryFn: () => tenderService.getClosingSoon(),
    ...options,
  });
};

export const useTendersByStatus = (
  status: string,
  options?: Omit<UseQueryOptions<Tender[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['tenders-by-status', status],
    queryFn: () => tenderService.getByStatus(status),
    enabled: !!status,
    ...options,
  });
};

export const useTendersByRequisition = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<Tender[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['tenders-by-requisition', requisitionId],
    queryFn: () => tenderService.getByRequisition(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreateTender = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateTenderData) => tenderService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TENDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['tenders-by-requisition', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['open-tenders'] });
      success(`Tender "${data.tender_number}" created successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to create tender');
    },
  });
};

export const usePublishTender = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => tenderService.publish(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TENDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['tender', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tender-statistics', data.id] });
      queryClient.invalidateQueries({ queryKey: ['open-tenders'] });
      queryClient.invalidateQueries({ queryKey: ['closing-soon-tenders'] });
      success(`Tender "${data.tender_number}" published successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to publish tender');
    },
  });
};

export const useAddTenderBidder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, supplierId }: { id: number; supplierId: number }) =>
      tenderService.addBidder(id, supplierId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tender-bidders', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tender-statistics', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tender', data.id] });
      success(`Bidder added to tender "${data.tender_number}" successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to add bidder');
    },
  });
};

export const useRemoveTenderBidder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, supplierId }: { id: number; supplierId: number }) =>
      tenderService.removeBidder(id, supplierId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tender-bidders', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tender-statistics', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tender', data.id] });
      success(`Bidder removed from tender "${data.tender_number}" successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to remove bidder');
    },
  });
};

export const useStartTenderEvaluation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => tenderService.startEvaluation(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TENDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['tender', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tender-statistics', data.id] });
      queryClient.invalidateQueries({ queryKey: ['open-tenders'] });
      success(`Tender "${data.tender_number}" evaluation started`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to start tender evaluation');
    },
  });
};

export const useAwardTender = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AwardTenderData }) =>
      tenderService.award(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TENDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['tender', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tender-statistics', data.id] });
      queryClient.invalidateQueries({ queryKey: ['open-tenders'] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status'] });
      success(`Tender "${data.tender_number}" awarded successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to award tender');
    },
  });
};

export const useCancelTender = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      tenderService.cancel(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TENDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['tender', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tender-statistics', data.id] });
      queryClient.invalidateQueries({ queryKey: ['open-tenders'] });
      success(`Tender "${data.tender_number}" cancelled`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel tender');
    },
  });
};

export const useGetTenderPdf = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => tenderService.getPdf(id),
    onSuccess: () => {
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF');
    },
  });
};
