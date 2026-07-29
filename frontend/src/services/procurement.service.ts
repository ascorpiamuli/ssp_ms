// frontend/src/services/procurement.service.ts

import { api } from './api';
import type {
  ProcurementStatusResponse,
  ProcurementSummary,
  ProcurementMetrics,
  ProcurementTimelineItem,
  StartProcurementData,
  CancelProcurementData,
} from '@/types/procurement.types';

const BASE_URL = '/procurement';

export const procurementService = {
  /**
   * Start procurement for a requisition
   */
  start: async (data: StartProcurementData): Promise<{ requisition_id: number; reference_number: string; is_procurement_created: boolean; procurement_created_at: string }> => {
    return api.post<{ requisition_id: number; reference_number: string; is_procurement_created: boolean; procurement_created_at: string }>(
      `${BASE_URL}/start`,
      data
    );
  },

  /**
   * Complete procurement for a requisition
   */
  complete: async (requisitionId: number): Promise<{ requisition_id: number; status: string }> => {
    return api.post<{ requisition_id: number; status: string }>(`${BASE_URL}/complete`, { requisition_id: requisitionId });
  },

  /**
   * Cancel procurement for a requisition
   */
  cancel: async (data: CancelProcurementData): Promise<{ requisition_id: number; is_procurement_created: boolean }> => {
    return api.post<{ requisition_id: number; is_procurement_created: boolean }>(`${BASE_URL}/cancel`, data);
  },

  /**
   * Get procurement status
   */
  getStatus: async (requisitionId: number): Promise<ProcurementStatusResponse> => {
    return api.get<ProcurementStatusResponse>(`${BASE_URL}/status/${requisitionId}`);
  },

  /**
   * Get procurement summary
   */
  getSummary: async (requisitionId: number): Promise<ProcurementSummary> => {
    return api.get<ProcurementSummary>(`${BASE_URL}/summary/${requisitionId}`);
  },

  /**
   * Get procurement timeline
   */
  getTimeline: async (requisitionId: number): Promise<ProcurementTimelineItem[]> => {
    return api.get<ProcurementTimelineItem[]>(`${BASE_URL}/timeline/${requisitionId}`);
  },

  /**
   * Get procurement metrics
   */
  getMetrics: async (requisitionId: number): Promise<ProcurementMetrics> => {
    return api.get<ProcurementMetrics>(`${BASE_URL}/metrics/${requisitionId}`);
  },

  /**
   * Get procurement steps
   */
  getSteps: async (requisitionId: number): Promise<any> => {
    return api.get<any>(`${BASE_URL}/steps/${requisitionId}`);
  },
};
