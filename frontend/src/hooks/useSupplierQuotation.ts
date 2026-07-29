// frontend/src/hooks/useSupplierQuotation.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { supplierQuotationService } from '@/services/supplierQuotation.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  SupplierQuotation,
  SupplierQuotationFilters,
  CreateSupplierQuotationData,
  VerifySupplierQuotationData,
  EvaluateSupplierQuotationData,
} from '@/types/supplierQuotation.types';
import type { PaginatedResponse } from '@/types/common.types';

export const SUPPLIER_QUOTATIONS_QUERY_KEY = 'supplier-quotations';

// ============================================
// QUERIES
// ============================================

export const useSupplierQuotations = (
  filters?: SupplierQuotationFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<SupplierQuotation>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [SUPPLIER_QUOTATIONS_QUERY_KEY, filters],
    queryFn: () => supplierQuotationService.getAll(filters),
    ...options,
  });
};

export const useSupplierQuotation = (
  id: number,
  options?: Omit<UseQueryOptions<SupplierQuotation>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['supplier-quotation', id],
    queryFn: () => supplierQuotationService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useLowestSupplierQuotation = (
  qtnId: number,
  options?: Omit<UseQueryOptions<SupplierQuotation | null>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['lowest-supplier-quotation', qtnId],
    queryFn: () => supplierQuotationService.getLowest(qtnId),
    enabled: !!qtnId,
    ...options,
  });
};

export const useSupplierQuotationsByQtn = (
  qtnId: number,
  options?: Omit<UseQueryOptions<SupplierQuotation[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['supplier-quotations-by-qtn', qtnId],
    queryFn: () => supplierQuotationService.getByQtn(qtnId),
    enabled: !!qtnId,
    ...options,
  });
};

export const useSupplierQuotationsBySupplier = (
  supplierId: number,
  options?: Omit<UseQueryOptions<SupplierQuotation[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['supplier-quotations-by-supplier', supplierId],
    queryFn: () => supplierQuotationService.getBySupplier(supplierId),
    enabled: !!supplierId,
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreateSupplierQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateSupplierQuotationData) => supplierQuotationService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotations-by-qtn', data.quotation_request_id] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.quotation_request_id] });
      queryClient.invalidateQueries({ queryKey: ['quotation-statistics', data.quotation_request_id] });
      success(`Quotation submitted successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to submit quotation');
    },
  });
};

export const useVerifySupplierQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VerifySupplierQuotationData }) =>
      supplierQuotationService.verify(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotations-by-qtn', data.quotation_request_id] });
      queryClient.invalidateQueries({ queryKey: ['lowest-supplier-quotation', data.quotation_request_id] });
      success(`Quotation verified successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to verify quotation');
    },
  });
};

export const useEvaluateSupplierQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EvaluateSupplierQuotationData }) =>
      supplierQuotationService.evaluate(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotations-by-qtn', data.quotation_request_id] });
      success(`Quotation evaluated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to evaluate quotation');
    },
  });
};
