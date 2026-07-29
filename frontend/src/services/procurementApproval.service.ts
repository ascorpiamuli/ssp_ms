// frontend/src/services/procurementApproval.service.ts

import { api } from './api';
import type {
  ProcurementApproval,
  ApprovalFilters,
  ApprovalStatistics,
  ApprovalTimeline,
  CreateApprovalData,
  ApproveApprovalData,
  DeclineApprovalData,
  ReturnApprovalData,
  DelegateApprovalData,
  ReassignApprovalData,
  EntityApprovalRequest,
} from '@/types/procurementApproval.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/procurement-approvals';

export const procurementApprovalService = {
  /**
   * Get all approvals with filters
   */
  getAll: async (filters?: ApprovalFilters): Promise<PaginatedResponse<ProcurementApproval>> => {
    return api.get<PaginatedResponse<ProcurementApproval>>(BASE_URL, { params: filters });
  },

  /**
   * Get approval by ID
   */
  getById: async (id: number): Promise<ProcurementApproval> => {
    return api.get<ProcurementApproval>(`${BASE_URL}/${id}`);
  },

  /**
   * Create a new approval
   */
  create: async (data: CreateApprovalData): Promise<ProcurementApproval> => {
    return api.post<ProcurementApproval>(BASE_URL, data);
  },

  /**
   * Get approvals for an entity
   */
  getForEntity: async (params: EntityApprovalRequest): Promise<ProcurementApproval[]> => {
    return api.get<ProcurementApproval[]>(`${BASE_URL}/entity`, { params });
  },

  /**
   * Approve an approval
   */
  approve: async (id: number, data: ApproveApprovalData): Promise<ProcurementApproval> => {
    return api.post<ProcurementApproval>(`${BASE_URL}/${id}/approve`, data);
  },

  /**
   * Decline an approval
   */
  decline: async (id: number, data: DeclineApprovalData): Promise<ProcurementApproval> => {
    return api.post<ProcurementApproval>(`${BASE_URL}/${id}/decline`, data);
  },

  /**
   * Return an approval
   */
  return: async (id: number, data: ReturnApprovalData): Promise<ProcurementApproval> => {
    return api.post<ProcurementApproval>(`${BASE_URL}/${id}/return`, data);
  },

  /**
   * Delegate an approval
   */
  delegate: async (id: number, data: DelegateApprovalData): Promise<ProcurementApproval> => {
    return api.post<ProcurementApproval>(`${BASE_URL}/${id}/delegate`, data);
  },

  /**
   * Reassign an approval
   */
  reassign: async (id: number, data: ReassignApprovalData): Promise<ProcurementApproval> => {
    return api.post<ProcurementApproval>(`${BASE_URL}/${id}/reassign`, data);
  },

  /**
   * Get approval timeline
   */
  getTimeline: async (params: EntityApprovalRequest): Promise<ApprovalTimeline[]> => {
    return api.get<ApprovalTimeline[]>(`${BASE_URL}/timeline`, { params });
  },

  /**
   * Check if entity is approved
   */
  isApproved: async (params: EntityApprovalRequest): Promise<{ is_approved: boolean }> => {
    return api.get<{ is_approved: boolean }>(`${BASE_URL}/is-approved`, { params });
  },

  /**
   * Get current approval level
   */
  getCurrentLevel: async (params: EntityApprovalRequest): Promise<ProcurementApproval | null> => {
    return api.get<ProcurementApproval | null>(`${BASE_URL}/current-level`, { params });
  },

  /**
   * Get approval statistics
   */
  getStatistics: async (): Promise<ApprovalStatistics> => {
    return api.get<ApprovalStatistics>(`${BASE_URL}/statistics`);
  },

  /**
   * Get pending approvals for user
   */
  getPendingForUser: async (userId?: number): Promise<ProcurementApproval[]> => {
    return api.get<ProcurementApproval[]>(`${BASE_URL}`, { params: { user_id: userId, pending: true } });
  },

  /**
   * Get overdue approvals
   */
  getOverdue: async (): Promise<ProcurementApproval[]> => {
    return api.get<ProcurementApproval[]>(`${BASE_URL}`, { params: { overdue: true } });
  },
};
