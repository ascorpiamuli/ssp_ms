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
import type { Requisition } from '@/types/requisition.types';
import type { PaginatedResponse } from '@/types/common.types';

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

  // ============================================
  // 🔧 NEW: Procurement-Ready Requisitions Endpoints
  // ============================================

  /**
   * Get requisitions ready for procurement (approved, no QTN yet)
   */
  getReadyRequisitions: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    department_id?: number;
  }): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`${BASE_URL}/ready-requisitions`, { params });
  },

  /**
   * Get requisitions that already have QTNs
   */
  getRequisitionsWithQtns: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<PaginatedResponse<Requisition & { qtn?: any }>> => {
    return api.get<PaginatedResponse<Requisition & { qtn?: any }>>(`${BASE_URL}/requisitions-with-qtns`, { params });
  },

  /**
   * Get requisitions currently in procurement process
   * (Has QTN but not yet completed)
   */
  getInProgress: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`${BASE_URL}/in-progress`, { params });
  },

  /**
   * Get procurement statistics (counts for dashboard)
   */
  getStatistics: async (): Promise<{
    ready_for_procurement: number;
    has_qtns: number;
    in_progress: number;
    completed: number;
    total: number;
  }> => {
    return api.get<{
      ready_for_procurement: number;
      has_qtns: number;
      in_progress: number;
      completed: number;
      total: number;
    }>(`${BASE_URL}/statistics`);
  },

  /**
   * Get requisition with its QTN details
   */
  getRequisitionWithQtn: async (requisitionId: number): Promise<{
    requisition: Requisition;
    qtn: any;
  }> => {
    return api.get<{
      requisition: Requisition;
      qtn: any;
    }>(`${BASE_URL}/requisition/${requisitionId}/qtn`);
  },
};
