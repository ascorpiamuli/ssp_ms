// frontend/src/hooks/useQuotation.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { quotationService } from '@/services/quotation.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  QuotationRequest,
  QuotationFilters,
  QuotationStatistics,
  CreateQuotationData,
  UpdateQuotationData,
  SendQuotationData,
  CancelQuotationData,
  SelectSupplierData,
} from '@/types/quotations.types';
import type { PaginatedResponse } from '@/types/common.types';

export const QUOTATIONS_QUERY_KEY = 'quotations';

// ============================================
// QUERIES
// ============================================

export const useQuotations = (
  filters?: QuotationFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<QuotationRequest>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, filters],
    queryFn: () => quotationService.getAll(filters),
    ...options,
  });
};

export const useActiveQuotations = (
  options?: Omit<UseQueryOptions<QuotationRequest[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['active-quotations'],
    queryFn: () => quotationService.getActive(),
    ...options,
  });
};

export const useClosingSoonQuotations = (
  options?: Omit<UseQueryOptions<QuotationRequest[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['closing-soon-quotations'],
    queryFn: () => quotationService.getClosingSoon(),
    ...options,
  });
};

export const useQuotation = (
  id: number,
  options?: Omit<UseQueryOptions<QuotationRequest>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: () => quotationService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useQuotationStatistics = (
  id: number,
  options?: Omit<UseQueryOptions<QuotationStatistics>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['quotation-statistics', id],
    queryFn: () => quotationService.getStatistics(id),
    enabled: !!id,
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateQuotationData) => quotationService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['active-quotations'] });
      queryClient.invalidateQueries({ queryKey: ['closing-soon-quotations'] });
      success(`Quotation request "${data.qtn_number}" created successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to create quotation');
    },
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateQuotationData }) =>
      quotationService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-quotations'] });
      success(`Quotation "${data.qtn_number}" updated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to update quotation');
    },
  });
};

export const useSendQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SendQuotationData }) =>
      quotationService.send(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-quotations'] });
      success(`Quotation "${data.qtn_number}" sent to suppliers successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to send quotation');
    },
  });
};

export const useCloseQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => quotationService.close(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-quotations'] });
      success(`Quotation "${data.qtn_number}" closed successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to close quotation');
    },
  });
};

export const useCancelQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelQuotationData }) =>
      quotationService.cancel(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
      success(`Quotation "${data.qtn_number}" cancelled successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel quotation');
    },
  });
};

export const useSendQuotationReminder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => quotationService.sendReminder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      success('Reminder sent to suppliers successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to send reminder');
    },
  });
};

export const useSelectSupplier = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: SelectSupplierData) => quotationService.selectSupplier(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status', data.requisition_id] });
      success('Supplier selected successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to select supplier');
    },
  });
};
