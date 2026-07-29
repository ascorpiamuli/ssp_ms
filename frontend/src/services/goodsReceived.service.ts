// frontend/src/services/goodsReceived.service.ts

import { api } from './api';
import type {
  GoodsReceivedNote,
  ServiceAcknowledgmentNote,
  GoodsReceivedFilters,
  GRNSummary,
  CreateGoodsReceivedData,
  InspectGoodsData,
  RateServiceData,
} from '@/types/goodsReceived.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/goods-received';
const SAN_URL = '/service-acknowledgments';

export const goodsReceivedService = {
  // ============================================
  // GRN Services
  // ============================================

  /**
   * Get all GRNs with filters
   */
  getGrns: async (filters?: GoodsReceivedFilters): Promise<PaginatedResponse<GoodsReceivedNote>> => {
    return api.get<PaginatedResponse<GoodsReceivedNote>>(BASE_URL, { params: filters });
  },

  /**
   * Get GRN by ID
   */
  getGrnById: async (id: number): Promise<GoodsReceivedNote> => {
    return api.get<GoodsReceivedNote>(`${BASE_URL}/${id}`);
  },

  /**
   * Get GRN summary
   */
  getGrnSummary: async (id: number): Promise<GRNSummary> => {
    return api.get<GRNSummary>(`${BASE_URL}/${id}/summary`);
  },

  /**
   * Create a new GRN
   */
  createGrn: async (data: CreateGoodsReceivedData): Promise<GoodsReceivedNote> => {
    return api.post<GoodsReceivedNote>(BASE_URL, { ...data, type: 'grn' });
  },

  /**
   * Submit GRN for approval
   */
  submitGrn: async (id: number): Promise<GoodsReceivedNote> => {
    return api.post<GoodsReceivedNote>(`${BASE_URL}/${id}/submit`);
  },

  /**
   * Approve a GRN
   */
  approveGrn: async (id: number, comment?: string): Promise<GoodsReceivedNote> => {
    return api.post<GoodsReceivedNote>(`${BASE_URL}/${id}/approve`, { comment });
  },

  /**
   * Reject a GRN
   */
  rejectGrn: async (id: number, reason: string): Promise<GoodsReceivedNote> => {
    return api.post<GoodsReceivedNote>(`${BASE_URL}/${id}/reject`, { reason });
  },

  /**
   * Inspect goods
   */
  inspectGoods: async (id: number, data: InspectGoodsData): Promise<GoodsReceivedNote> => {
    return api.post<GoodsReceivedNote>(`${BASE_URL}/${id}/inspect`, data);
  },

  /**
   * Get GRN PDF
   */
  getGrnPdf: async (id: number): Promise<{ pdf: string }> => {
    return api.get<{ pdf: string }>(`${BASE_URL}/${id}/pdf`);
  },

  /**
   * Get GRNs by purchase order
   */
  getGrnsByPurchaseOrder: async (purchaseOrderId: number): Promise<GoodsReceivedNote[]> => {
    return api.get<GoodsReceivedNote[]>(BASE_URL, { params: { purchase_order_id: purchaseOrderId } });
  },

  /**
   * Get pending approval GRNs
   */
  getPendingGrns: async (): Promise<GoodsReceivedNote[]> => {
    return api.get<GoodsReceivedNote[]>(BASE_URL);
  },

  // ============================================
  // SAN Services
  // ============================================

  /**
   * Get all SANs with filters
   */
  getSans: async (filters?: GoodsReceivedFilters): Promise<PaginatedResponse<ServiceAcknowledgmentNote>> => {
    return api.get<PaginatedResponse<ServiceAcknowledgmentNote>>(SAN_URL, { params: filters });
  },

  /**
   * Get SAN by ID
   */
  getSanById: async (id: number): Promise<ServiceAcknowledgmentNote> => {
    return api.get<ServiceAcknowledgmentNote>(`${SAN_URL}/${id}`);
  },

  /**
   * Get SAN summary
   */
  getSanSummary: async (id: number): Promise<any> => {
    return api.get<any>(`${SAN_URL}/${id}/summary`);
  },

  /**
   * Create a new SAN
   */
  createSan: async (data: CreateGoodsReceivedData): Promise<ServiceAcknowledgmentNote> => {
    return api.post<ServiceAcknowledgmentNote>(SAN_URL, { ...data, type: 'san' });
  },

  /**
   * Submit SAN for approval
   */
  submitSan: async (id: number): Promise<ServiceAcknowledgmentNote> => {
    return api.post<ServiceAcknowledgmentNote>(`${SAN_URL}/${id}/submit`);
  },

  /**
   * Approve a SAN
   */
  approveSan: async (id: number, comment?: string): Promise<ServiceAcknowledgmentNote> => {
    return api.post<ServiceAcknowledgmentNote>(`${SAN_URL}/${id}/approve`, { comment });
  },

  /**
   * Reject a SAN
   */
  rejectSan: async (id: number, reason: string): Promise<ServiceAcknowledgmentNote> => {
    return api.post<ServiceAcknowledgmentNote>(`${SAN_URL}/${id}/reject`, { reason });
  },

  /**
   * Rate service quality
   */
  rateService: async (id: number, data: RateServiceData): Promise<ServiceAcknowledgmentNote> => {
    return api.post<ServiceAcknowledgmentNote>(`${SAN_URL}/${id}/rate`, data);
  },

  /**
   * Get SAN PDF
   */
  getSanPdf: async (id: number): Promise<{ pdf: string }> => {
    return api.get<{ pdf: string }>(`${SAN_URL}/${id}/pdf`);
  },

  /**
   * Get SANs by purchase order
   */
  getSansByPurchaseOrder: async (purchaseOrderId: number): Promise<ServiceAcknowledgmentNote[]> => {
    return api.get<ServiceAcknowledgmentNote[]>(SAN_URL, { params: { purchase_order_id: purchaseOrderId } });
  },

  /**
   * Get pending approval SANs
   */
  getPendingSans: async (): Promise<ServiceAcknowledgmentNote[]> => {
    return api.get<ServiceAcknowledgmentNote[]>(SAN_URL);
  },
};
