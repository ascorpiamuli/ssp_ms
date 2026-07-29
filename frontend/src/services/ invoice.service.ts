// frontend/src/services/invoice.service.ts

import { api } from './api';
import type {
  Invoice,
  InvoiceFilters,
  InvoiceSummary,
  MatchingStatusResponse,
  CreateInvoiceData,
} from '@/types/invoice.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/invoices';

export const invoiceService = {
  /**
   * Get all invoices with filters
   */
  getAll: async (filters?: InvoiceFilters): Promise<PaginatedResponse<Invoice>> => {
    return api.get<PaginatedResponse<Invoice>>(BASE_URL, { params: filters });
  },

  /**
   * Get invoice by ID
   */
  getById: async (id: number): Promise<Invoice> => {
    return api.get<Invoice>(`${BASE_URL}/${id}`);
  },

  /**
   * Get invoice summary
   */
  getSummary: async (id: number): Promise<InvoiceSummary> => {
    return api.get<InvoiceSummary>(`${BASE_URL}/${id}/summary`);
  },

  /**
   * Get matching status
   */
  getMatchingStatus: async (id: number): Promise<MatchingStatusResponse> => {
    return api.get<MatchingStatusResponse>(`${BASE_URL}/${id}/matching-status`);
  },

  /**
   * Create a new invoice
   */
  create: async (data: CreateInvoiceData): Promise<Invoice> => {
    return api.post<Invoice>(BASE_URL, data);
  },

  /**
   * Perform three-way matching
   */
  match: async (id: number): Promise<Invoice> => {
    return api.post<Invoice>(`${BASE_URL}/${id}/match`);
  },

  /**
   * Verify an invoice
   */
  verify: async (id: number, notes?: string): Promise<Invoice> => {
    return api.post<Invoice>(`${BASE_URL}/${id}/verify`, { notes });
  },

  /**
   * Approve an invoice
   */
  approve: async (id: number, notes?: string): Promise<Invoice> => {
    return api.post<Invoice>(`${BASE_URL}/${id}/approve`, { notes });
  },

  /**
   * Mark invoice as paid
   */
  markPaid: async (id: number): Promise<Invoice> => {
    return api.post<Invoice>(`${BASE_URL}/${id}/pay`);
  },

  /**
   * Dispute an invoice
   */
  dispute: async (id: number, reason: string): Promise<Invoice> => {
    return api.post<Invoice>(`${BASE_URL}/${id}/dispute`, { reason });
  },

  /**
   * Cancel an invoice
   */
  cancel: async (id: number, reason: string): Promise<Invoice> => {
    return api.post<Invoice>(`${BASE_URL}/${id}/cancel`, { reason });
  },

  /**
   * Send invoice back to supplier
   */
  sendBack: async (id: number, reason: string): Promise<Invoice> => {
    return api.post<Invoice>(`${BASE_URL}/${id}/send-back`, { reason });
  },

  /**
   * Get overdue invoices
   */
  getOverdue: async (): Promise<Invoice[]> => {
    return api.get<Invoice[]>(`${BASE_URL}/overdue`);
  },

  /**
   * Get pending invoices
   */
  getPending: async (): Promise<Invoice[]> => {
    return api.get<Invoice[]>(BASE_URL);
  },

  /**
   * Get invoices for matching
   */
  getForMatching: async (): Promise<Invoice[]> => {
    return api.get<Invoice[]>(`${BASE_URL}`, { params: { status: 'matching' } });
  },

  /**
   * Get invoice PDF
   */
  getPdf: async (id: number): Promise<{ pdf: string }> => {
    return api.get<{ pdf: string }>(`${BASE_URL}/${id}/pdf`);
  },

  /**
   * Get invoices by purchase order
   */
  getByPurchaseOrder: async (purchaseOrderId: number): Promise<Invoice[]> => {
    return api.get<Invoice[]>(BASE_URL, { params: { purchase_order_id: purchaseOrderId } });
  },

  /**
   * Get invoices by supplier
   */
  getBySupplier: async (supplierId: number): Promise<Invoice[]> => {
    return api.get<Invoice[]>(BASE_URL, { params: { supplier_id: supplierId } });
  },
};
