// frontend/src/services/requisition-revision.service.ts

import { api } from './api';
import type { RequisitionRevision } from '@/types/requisition.types';
import type { PaginatedResponse } from '@/types/common.types';

export const requisitionRevisionService = {
  /**
   * Get revisions for a requisition
   */
  getByRequisitionId: async (requisitionId: number): Promise<RequisitionRevision[]> => {
    return api.get<RequisitionRevision[]>(`/requisitions/${requisitionId}/revisions`);
  },

  /**
   * Get revision by ID
   */
  getById: async (requisitionId: number, revisionId: number): Promise<RequisitionRevision> => {
    return api.get<RequisitionRevision>(`/requisitions/${requisitionId}/revisions/${revisionId}`);
  },

  /**
   * Get revision statistics
   */
  getStats: async (requisitionId: number): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    latest_revision_number: number;
  }> => {
    return api.get(`/requisitions/${requisitionId}/revisions/stats`);
  },

  /**
   * Create a revision request
   */
  create: async (
    requisitionId: number,
    data: {
      reason: string;
      notes?: string;
      changes?: Record<string, any>;
    }
  ): Promise<RequisitionRevision> => {
    return api.post<RequisitionRevision>(`/requisitions/${requisitionId}/revisions`, data);
  },

  /**
   * Approve a revision
   */
  approve: async (requisitionId: number, revisionId: number, data?: { notes?: string }): Promise<RequisitionRevision> => {
    return api.post<RequisitionRevision>(`/requisitions/${requisitionId}/revisions/${revisionId}/approve`, data || {});
  },

  /**
   * Reject a revision
   */
  reject: async (requisitionId: number, revisionId: number, data: { reason: string }): Promise<RequisitionRevision> => {
    return api.post<RequisitionRevision>(`/requisitions/${requisitionId}/revisions/${revisionId}/reject`, data);
  },
};
