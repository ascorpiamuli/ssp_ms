// frontend/src/services/tender.service.ts

import { api } from './api';
import type {
  Tender,
  TenderFilters,
  TenderStatistics,
  CreateTenderData,
  AwardTenderData,
} from '@/types/tender.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/tenders';

export const tenderService = {
  /**
   * Get all tenders with filters
   */
  getAll: async (filters?: TenderFilters): Promise<PaginatedResponse<Tender>> => {
    return api.get<PaginatedResponse<Tender>>(BASE_URL, { params: filters });
  },

  /**
   * Get tender by ID
   */
  getById: async (id: number): Promise<Tender> => {
    return api.get<Tender>(`${BASE_URL}/${id}`);
  },

  /**
   * Get tender statistics
   */
  getStatistics: async (id: number): Promise<TenderStatistics> => {
    return api.get<TenderStatistics>(`${BASE_URL}/${id}/statistics`);
  },

  /**
   * Create a new tender
   */
  create: async (data: CreateTenderData): Promise<Tender> => {
    return api.post<Tender>(BASE_URL, data);
  },

  /**
   * Publish a tender
   */
  publish: async (id: number): Promise<Tender> => {
    return api.post<Tender>(`${BASE_URL}/${id}/publish`);
  },

  /**
   * Add a bidder to tender
   */
  addBidder: async (id: number, supplierId: number): Promise<Tender> => {
    return api.post<Tender>(`${BASE_URL}/${id}/bidder`, { supplier_id: supplierId });
  },

  /**
   * Remove a bidder from tender
   */
  removeBidder: async (id: number, supplierId: number): Promise<Tender> => {
    return api.delete<Tender>(`${BASE_URL}/${id}/bidder/${supplierId}`);
  },

  /**
   * Get bidders for a tender
   */
  getBidders: async (id: number): Promise<number[]> => {
    return api.get<number[]>(`${BASE_URL}/${id}/bidders`);
  },

  /**
   * Start evaluation
   */
  startEvaluation: async (id: number): Promise<Tender> => {
    return api.post<Tender>(`${BASE_URL}/${id}/evaluate`);
  },

  /**
   * Award a tender
   */
  award: async (id: number, data: AwardTenderData): Promise<Tender> => {
    return api.post<Tender>(`${BASE_URL}/${id}/award`, data);
  },

  /**
   * Cancel a tender
   */
  cancel: async (id: number, reason: string): Promise<Tender> => {
    return api.post<Tender>(`${BASE_URL}/${id}/cancel`, { reason });
  },

  /**
   * Get open tenders
   */
  getOpen: async (): Promise<Tender[]> => {
    return api.get<Tender[]>(`${BASE_URL}`, { params: { status: 'open' } });
  },

  /**
   * Get tenders closing soon
   */
  getClosingSoon: async (): Promise<Tender[]> => {
    return api.get<Tender[]>(`${BASE_URL}`, { params: { status: 'closing_soon' } });
  },

  /**
   * Get tenders by status
   */
  getByStatus: async (status: string): Promise<Tender[]> => {
    return api.get<Tender[]>(`${BASE_URL}`, { params: { status } });
  },

  /**
   * Get tender PDF
   */
  getPdf: async (id: number): Promise<{ pdf: string }> => {
    return api.get<{ pdf: string }>(`${BASE_URL}/${id}/pdf`);
  },

  /**
   * Get tenders by requisition
   */
  getByRequisition: async (requisitionId: number): Promise<Tender[]> => {
    return api.get<Tender[]>(BASE_URL, { params: { requisition_id: requisitionId } });
  },
};
