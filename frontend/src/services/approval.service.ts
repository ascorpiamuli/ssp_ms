// frontend/src/services/approval.service.ts

import { api } from './api';
import type { Approval } from '@/types/approval.types';
import type { ApprovalStats } from '@/types/approval.types';
import type { ProcessApprovalData } from '@/types/approval.types';
import type { DelegateApprovalData } from '@/types/approval.types';
import type { PaginatedResponse } from '@/types/common.types';

export const approvalService = {
  /**
   * Get approvals for a requisition
   */
  getByRequisitionId: async (requisitionId: number): Promise<Approval[]> => {
    return api.get<Approval[]>(`/approvals/requisitions/${requisitionId}`);
  },

  /**
   * Get pending approvals for current user
   */
  getPending: async (filters?: {
    level?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Approval>> => {
    return api.get<PaginatedResponse<Approval>>('/approvals/pending', { params: filters });
  },

  /**
   * Get approvals by role (all statuses including processed)
   */
  getByRole: async (
    role: string,
    filters?: {
      status?: string; // 'all', 'pending', 'approved', 'declined', 'returned'
      page?: number;
      per_page?: number;
      department_id?: number;
      date_from?: string;
      date_to?: string;
      search?: string;
    }
  ): Promise<PaginatedResponse<Approval>> => {
    return api.get<PaginatedResponse<Approval>>('/approvals/role', {
      params: {
        role,
        ...filters,
      },
    });
  },

  /**
   * Get approval statistics for current user
   */
  getStats: async (): Promise<ApprovalStats> => {
    return api.get<ApprovalStats>('/approvals/stats');
  },

  /**
   * Process an approval (approve/decline/return)
   */
  process: async (requisitionId: number, level: string, data: ProcessApprovalData): Promise<Approval> => {
    return api.post<Approval>(`/approvals/requisitions/${requisitionId}/${level}/process`, data);
  },

  /**
   * Delegate approval to another user
   */
  delegate: async (approvalId: number, data: DelegateApprovalData): Promise<Approval> => {
    return api.post<Approval>(`/approvals/${approvalId}/delegate`, data);
  },

  /**
   * Admin - Get all pending approvals (admin only)
   */
  adminGetPending: async (filters?: {
    department_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Approval>> => {
    return api.get<PaginatedResponse<Approval>>('/admin/approvals/all-pending', { params: filters });
  },

  /**
   * Admin - Get delayed approvals (admin only)
   */
  adminGetDelayed: async (filters?: {
    department_id?: number;
    days?: number;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Approval>> => {
    return api.get<PaginatedResponse<Approval>>('/admin/approvals/delayed', { params: filters });
  },


  getDelegated: async (filters?: {
    status?: string;
    page?: number;
    per_page?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<Approval>> => {
    return api.get<PaginatedResponse<Approval>>('/approvals/delegated', { params: filters });
  },

  /**
   * Admin - Escalate approval (admin only)
   */
  adminEscalate: async (approvalId: number, data: { reason: string }): Promise<Approval> => {
    return api.post<Approval>(`/admin/approvals/${approvalId}/escalate`, data);
  },

  /**
   * Admin - Reassign approval (admin only)
   */
  adminReassign: async (approvalId: number, data: { user_id: number }): Promise<Approval> => {
    return api.post<Approval>(`/admin/approvals/${approvalId}/reassign`, data);
  },
};
