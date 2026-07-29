// frontend/src/services/payment.service.ts

import { api } from './api';
import type {
  PaymentVoucher,
  Cheque,
  PaymentFilters,
  PaymentSummary,
  CreatePaymentData,
  CreateChequeData,
} from '@/types/payment.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/payments';

export const paymentService = {
  // ============================================
  // Payment Voucher Services
  // ============================================

  /**
   * Get all payment vouchers with filters
   */
  getVouchers: async (filters?: PaymentFilters): Promise<PaginatedResponse<PaymentVoucher>> => {
    return api.get<PaginatedResponse<PaymentVoucher>>(`${BASE_URL}/vouchers`, { params: filters });
  },

  /**
   * Get payment voucher by ID
   */
  getVoucherById: async (id: number): Promise<PaymentVoucher> => {
    return api.get<PaymentVoucher>(`${BASE_URL}/vouchers/${id}`);
  },

  /**
   * Get payment voucher summary
   */
  getVoucherSummary: async (id: number): Promise<PaymentSummary> => {
    return api.get<PaymentSummary>(`${BASE_URL}/vouchers/${id}/summary`);
  },

  /**
   * Create a new payment voucher
   */
  createVoucher: async (data: CreatePaymentData): Promise<PaymentVoucher> => {
    return api.post<PaymentVoucher>(`${BASE_URL}/vouchers`, data);
  },

  /**
   * Endorse a payment voucher
   */
  endorseVoucher: async (id: number, signature?: string): Promise<PaymentVoucher> => {
    return api.post<PaymentVoucher>(`${BASE_URL}/vouchers/${id}/endorse`, { signature });
  },

  /**
   * Approve a payment voucher
   */
  approveVoucher: async (id: number, signature?: string): Promise<PaymentVoucher> => {
    return api.post<PaymentVoucher>(`${BASE_URL}/vouchers/${id}/approve`, { signature });
  },

  /**
   * Mark payment voucher as paid
   */
  markVoucherPaid: async (id: number, reference?: string): Promise<PaymentVoucher> => {
    return api.post<PaymentVoucher>(`${BASE_URL}/vouchers/${id}/pay`, { reference });
  },

  /**
   * Cancel a payment voucher
   */
  cancelVoucher: async (id: number, reason: string): Promise<PaymentVoucher> => {
    return api.post<PaymentVoucher>(`${BASE_URL}/vouchers/${id}/cancel`, { reason });
  },

  /**
   * Get payment voucher PDF
   */
  getVoucherPdf: async (id: number): Promise<{ pdf: string }> => {
    return api.get<{ pdf: string }>(`${BASE_URL}/vouchers/${id}/pdf`);
  },

  /**
   * Get draft vouchers
   */
  getDraftVouchers: async (): Promise<PaymentVoucher[]> => {
    return api.get<PaymentVoucher[]>(`${BASE_URL}/vouchers`);
  },

  /**
   * Get vouchers by invoice
   */
  getVouchersByInvoice: async (invoiceId: number): Promise<PaymentVoucher[]> => {
    return api.get<PaymentVoucher[]>(`${BASE_URL}/vouchers`, { params: { invoice_id: invoiceId } });
  },

  // ============================================
  // Cheque Services
  // ============================================

  /**
   * Record a new cheque
   */
  recordCheque: async (data: CreateChequeData): Promise<Cheque> => {
    return api.post<Cheque>(`${BASE_URL}/cheques`, data);
  },

  /**
   * Get cheque by ID
   */
  getChequeById: async (id: number): Promise<Cheque> => {
    return api.get<Cheque>(`${BASE_URL}/cheques/${id}`);
  },

  /**
   * Mark cheque as cashed
   */
  cashCheque: async (id: number): Promise<Cheque> => {
    return api.post<Cheque>(`${BASE_URL}/cheques/${id}/cash`);
  },

  /**
   * Cancel a cheque
   */
  cancelCheque: async (id: number, reason: string): Promise<Cheque> => {
    return api.post<Cheque>(`${BASE_URL}/cheques/${id}/cancel`, { reason });
  },

  /**
   * Stop a cheque
   */
  stopCheque: async (id: number, reason: string): Promise<Cheque> => {
    return api.post<Cheque>(`${BASE_URL}/cheques/${id}/stop`, { reason });
  },

  /**
   * Get cheque PDF
   */
  getChequePdf: async (id: number): Promise<{ pdf: string }> => {
    return api.get<{ pdf: string }>(`${BASE_URL}/cheques/${id}/pdf`);
  },

  /**
   * Get issued cheques
   */
  getIssuedCheques: async (): Promise<Cheque[]> => {
    return api.get<Cheque[]>(`${BASE_URL}/cheques`);
  },

  /**
   * Get cheque by voucher
   */
  getChequeByVoucher: async (voucherId: number): Promise<Cheque> => {
    return api.get<Cheque>(`${BASE_URL}/cheques`, { params: { voucher_id: voucherId } });
  },
};
