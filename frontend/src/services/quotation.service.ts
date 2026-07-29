// frontend/src/services/quotation.service.ts

import { api } from './api';
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

const BASE_URL = '/quotations';

export const quotationService = {
  /**
   * Get all quotations with filters
   */
  getAll: async (filters?: QuotationFilters): Promise<PaginatedResponse<QuotationRequest>> => {
    return api.get<PaginatedResponse<QuotationRequest>>(BASE_URL, { params: filters });
  },

  /**
   * Get quotation by ID
   */
  getById: async (id: number): Promise<QuotationRequest> => {
    return api.get<QuotationRequest>(`${BASE_URL}/${id}`);
  },

  /**
   * Create a new quotation request
   */
  create: async (data: CreateQuotationData): Promise<QuotationRequest> => {
    return api.post<QuotationRequest>(BASE_URL, data);
  },

  /**
   * Update a quotation request
   */
  update: async (id: number, data: UpdateQuotationData): Promise<QuotationRequest> => {
    return api.put<QuotationRequest>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Send quotation to suppliers
   */
  send: async (id: number, data: SendQuotationData): Promise<QuotationRequest> => {
    return api.post<QuotationRequest>(`${BASE_URL}/${id}/send`, data);
  },

  /**
   * Close a quotation request
   */
  close: async (id: number): Promise<QuotationRequest> => {
    return api.post<QuotationRequest>(`${BASE_URL}/${id}/close`);
  },

  /**
   * Cancel a quotation request
   */
  cancel: async (id: number, data: CancelQuotationData): Promise<QuotationRequest> => {
    return api.post<QuotationRequest>(`${BASE_URL}/${id}/cancel`, data);
  },

  /**
   * Send reminder to suppliers
   */
  sendReminder: async (id: number): Promise<void> => {
    return api.post<void>(`${BASE_URL}/${id}/reminder`);
  },

  /**
   * Get quotation statistics
   */
  getStatistics: async (id: number): Promise<QuotationStatistics> => {
    return api.get<QuotationStatistics>(`${BASE_URL}/${id}/statistics`);
  },

  /**
   * Select supplier for requisition
   */
  selectSupplier: async (data: SelectSupplierData): Promise<{ requisition_id: number; supplier_id: number; quotation_id: number }> => {
    return api.post<{ requisition_id: number; supplier_id: number; quotation_id: number }>(
      `${BASE_URL}/select-supplier`,
      data
    );
  },

  /**
   * Get quotations closing soon
   */
  getClosingSoon: async (): Promise<QuotationRequest[]> => {
    return api.get<QuotationRequest[]>(`${BASE_URL}`, { params: { status: 'closing_soon' } });
  },

  /**
   * Get active quotations
   */
  getActive: async (): Promise<QuotationRequest[]> => {
    return api.get<QuotationRequest[]>(`${BASE_URL}`, { params: { status: 'active' } });
  },
};
