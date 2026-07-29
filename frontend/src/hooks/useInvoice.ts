// frontend/src/hooks/useInvoice.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { invoiceService } from '@/services/ invoice.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  Invoice,
  InvoiceFilters,
  InvoiceSummary,
  MatchingStatusResponse,
  CreateInvoiceData,
} from '@/types/invoice.types';
import type { PaginatedResponse } from '@/types/common.types';

export const INVOICES_QUERY_KEY = 'invoices';

// ============================================
// QUERIES
// ============================================

export const useInvoices = (
  filters?: InvoiceFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Invoice>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, filters],
    queryFn: () => invoiceService.getAll(filters),
    ...options,
  });
};

export const useInvoice = (
  id: number,
  options?: Omit<UseQueryOptions<Invoice>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useInvoiceSummary = (
  id: number,
  options?: Omit<UseQueryOptions<InvoiceSummary>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['invoice-summary', id],
    queryFn: () => invoiceService.getSummary(id),
    enabled: !!id,
    ...options,
  });
};

export const useInvoiceMatchingStatus = (
  id: number,
  options?: Omit<UseQueryOptions<MatchingStatusResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['invoice-matching-status', id],
    queryFn: () => invoiceService.getMatchingStatus(id),
    enabled: !!id,
    ...options,
  });
};

export const useOverdueInvoices = (
  options?: Omit<UseQueryOptions<Invoice[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['overdue-invoices'],
    queryFn: () => invoiceService.getOverdue(),
    ...options,
  });
};

export const usePendingInvoices = (
  options?: Omit<UseQueryOptions<Invoice[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['pending-invoices'],
    queryFn: () => invoiceService.getPending(),
    ...options,
  });
};

export const useInvoicesForMatching = (
  options?: Omit<UseQueryOptions<Invoice[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['invoices-for-matching'],
    queryFn: () => invoiceService.getForMatching(),
    ...options,
  });
};

export const useInvoicesByPurchaseOrder = (
  purchaseOrderId: number,
  options?: Omit<UseQueryOptions<Invoice[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['invoices-by-purchase-order', purchaseOrderId],
    queryFn: () => invoiceService.getByPurchaseOrder(purchaseOrderId),
    enabled: !!purchaseOrderId,
    ...options,
  });
};

export const useInvoicesBySupplier = (
  supplierId: number,
  options?: Omit<UseQueryOptions<Invoice[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['invoices-by-supplier', supplierId],
    queryFn: () => invoiceService.getBySupplier(supplierId),
    enabled: !!supplierId,
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateInvoiceData) => invoiceService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoices-by-purchase-order', data.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['invoices-by-supplier', data.supplier_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status'] });
      success(`Invoice "${data.invoice_number}" submitted successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to submit invoice');
    },
  });
};

export const useMatchInvoice = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => invoiceService.match(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice-matching-status', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices-for-matching'] });
      success(`Three-way matching completed successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to perform three-way matching');
    },
  });
};

export const useVerifyInvoice = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      invoiceService.verify(id, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-invoices'] });
      success(`Invoice "${data.invoice_number}" verified successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to verify invoice');
    },
  });
};

export const useApproveInvoice = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      invoiceService.approve(id, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`Invoice "${data.invoice_number}" approved successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to approve invoice');
    },
  });
};

export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => invoiceService.markPaid(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status'] });
      success(`Invoice "${data.invoice_number}" marked as paid`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to mark invoice as paid');
    },
  });
};

export const useDisputeInvoice = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      invoiceService.dispute(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      success(`Invoice "${data.invoice_number}" disputed`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to dispute invoice');
    },
  });
};

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      invoiceService.cancel(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      success(`Invoice "${data.invoice_number}" cancelled`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel invoice');
    },
  });
};

export const useSendInvoiceBack = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      invoiceService.sendBack(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      success(`Invoice "${data.invoice_number}" sent back to supplier`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to send invoice back');
    },
  });
};

export const useGetInvoicePdf = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => invoiceService.getPdf(id),
    onSuccess: () => {
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF');
    },
  });
};
