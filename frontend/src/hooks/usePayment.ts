// frontend/src/hooks/usePayment.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  PaymentVoucher,
  Cheque,
  PaymentFilters,
  PaymentSummary,
  CreatePaymentData,
  CreateChequeData,
} from '@/types/payment.types';
import type { PaginatedResponse } from '@/types/common.types';

export const PAYMENT_VOUCHERS_QUERY_KEY = 'payment-vouchers';

// ============================================
// VOUCHER QUERIES
// ============================================

export const usePaymentVouchers = (
  filters?: PaymentFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<PaymentVoucher>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PAYMENT_VOUCHERS_QUERY_KEY, filters],
    queryFn: () => paymentService.getVouchers(filters),
    ...options,
  });
};

export const usePaymentVoucher = (
  id: number,
  options?: Omit<UseQueryOptions<PaymentVoucher>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['payment-voucher', id],
    queryFn: () => paymentService.getVoucherById(id),
    enabled: !!id,
    ...options,
  });
};

export const usePaymentVoucherSummary = (
  id: number,
  options?: Omit<UseQueryOptions<PaymentSummary>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['payment-voucher-summary', id],
    queryFn: () => paymentService.getVoucherSummary(id),
    enabled: !!id,
    ...options,
  });
};

export const useDraftVouchers = (
  options?: Omit<UseQueryOptions<PaymentVoucher[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['draft-vouchers'],
    queryFn: () => paymentService.getDraftVouchers(),
    ...options,
  });
};

export const useVouchersByInvoice = (
  invoiceId: number,
  options?: Omit<UseQueryOptions<PaymentVoucher[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['vouchers-by-invoice', invoiceId],
    queryFn: () => paymentService.getVouchersByInvoice(invoiceId),
    enabled: !!invoiceId,
    ...options,
  });
};

// ============================================
// CHEQUE QUERIES
// ============================================

export const useCheque = (
  id: number,
  options?: Omit<UseQueryOptions<Cheque>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['cheque', id],
    queryFn: () => paymentService.getChequeById(id),
    enabled: !!id,
    ...options,
  });
};

export const useChequeByVoucher = (
  voucherId: number,
  options?: Omit<UseQueryOptions<Cheque>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['cheque-by-voucher', voucherId],
    queryFn: () => paymentService.getChequeByVoucher(voucherId),
    enabled: !!voucherId,
    ...options,
  });
};

export const useIssuedCheques = (
  options?: Omit<UseQueryOptions<Cheque[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['issued-cheques'],
    queryFn: () => paymentService.getIssuedCheques(),
    ...options,
  });
};

// ============================================
// VOUCHER MUTATIONS
// ============================================

export const useCreatePaymentVoucher = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreatePaymentData) => paymentService.createVoucher(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_VOUCHERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['vouchers-by-invoice', data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['draft-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status'] });
      success(`Payment Voucher "${data.voucher_number}" prepared successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to prepare payment voucher');
    },
  });
};

export const useEndorsePaymentVoucher = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, signature }: { id: number; signature?: string }) =>
      paymentService.endorseVoucher(id, signature),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_VOUCHERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payment-voucher-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`Payment Voucher "${data.voucher_number}" endorsed successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to endorse payment voucher');
    },
  });
};

export const useApprovePaymentVoucher = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, signature }: { id: number; signature?: string }) =>
      paymentService.approveVoucher(id, signature),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_VOUCHERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payment-voucher-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`Payment Voucher "${data.voucher_number}" approved successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to approve payment voucher');
    },
  });
};

export const useMarkPaymentVoucherPaid = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reference }: { id: number; reference?: string }) =>
      paymentService.markVoucherPaid(id, reference),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_VOUCHERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payment-voucher-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status'] });
      success(`Payment Voucher "${data.voucher_number}" marked as paid`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to mark payment voucher as paid');
    },
  });
};

export const useCancelPaymentVoucher = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      paymentService.cancelVoucher(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_VOUCHERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', data.id] });
      success(`Payment Voucher "${data.voucher_number}" cancelled`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel payment voucher');
    },
  });
};

export const useGetPaymentVoucherPdf = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => paymentService.getVoucherPdf(id),
    onSuccess: () => {
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF');
    },
  });
};

// ============================================
// CHEQUE MUTATIONS
// ============================================

export const useRecordCheque = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateChequeData) => paymentService.recordCheque(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cheque-by-voucher', data.payment_voucher_id] });
      queryClient.invalidateQueries({ queryKey: ['issued-cheques'] });
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', data.payment_voucher_id] });
      success(`Cheque "${data.cheque_number}" recorded successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to record cheque');
    },
  });
};

export const useCashCheque = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => paymentService.cashCheque(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cheque', data.id] });
      queryClient.invalidateQueries({ queryKey: ['issued-cheques'] });
      success(`Cheque "${data.cheque_number}" cashed successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cash cheque');
    },
  });
};

export const useCancelCheque = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      paymentService.cancelCheque(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cheque', data.id] });
      queryClient.invalidateQueries({ queryKey: ['issued-cheques'] });
      success(`Cheque "${data.cheque_number}" cancelled`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel cheque');
    },
  });
};

export const useStopCheque = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      paymentService.stopCheque(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cheque', data.id] });
      queryClient.invalidateQueries({ queryKey: ['issued-cheques'] });
      success(`Cheque "${data.cheque_number}" stopped`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to stop cheque');
    },
  });
};

export const useGetChequePdf = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => paymentService.getChequePdf(id),
    onSuccess: () => {
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF');
    },
  });
};
