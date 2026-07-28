// frontend/src/services/requisition-history.service.ts

import { api } from './api';
import type { RequisitionHistory } from '@/types/requisition.types';
import type { HistoryAction } from '@/types/requisition.types';
import type { PaginatedResponse } from '@/types/common.types';

export const requisitionHistoryService = {
  /**
   * Get history for a requisition
   */
  getByRequisitionId: async (
    requisitionId: number,
    filters?: {
      action?: HistoryAction;
      user_id?: number;
      date_from?: string;
      date_to?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RequisitionHistory>> => {
    return api.get<PaginatedResponse<RequisitionHistory>>(`/requisitions/${requisitionId}/history`, {
      params: filters,
    });
  },

  /**
   * Get history by ID
   */
  getById: async (requisitionId: number, historyId: number): Promise<RequisitionHistory> => {
    return api.get<RequisitionHistory>(`/requisitions/${requisitionId}/history/${historyId}`);
  },

  /**
   * Get history by action type (global)
   */
  getByAction: async (
    action: HistoryAction,
    filters?: {
      requisition_id?: number;
      date_from?: string;
      date_to?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RequisitionHistory>> => {
    return api.get<PaginatedResponse<RequisitionHistory>>(`/history/actions/${action}`, {
      params: filters,
    });
  },

  /**
   * Get history statistics
   */
  getStats: async (filters?: {
    requisition_id?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    total: number;
    by_action: Record<string, number>;
    by_user: Array<{ user: string; count: number }>;
  }> => {
    return api.get('/history/stats', { params: filters });
  },

  /**
   * Get recent history for a user
   */
  getRecentForUser: async (userId: number, limit: number = 10): Promise<RequisitionHistory[]> => {
    return api.get<RequisitionHistory[]>(`/history/recent/${userId}`, { params: { limit } });
  },
};
