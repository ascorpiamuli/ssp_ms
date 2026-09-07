// frontend/src/services/requisition.service.ts

import { api } from './api';
import type {
  Requisition,
  RequisitionStats,
  RequisitionFilters,
  CreateRequisitionData,
  UpdateRequisitionData,
  SubmitRequisitionData,
  ReturnRequisitionData,
  CancelRequisitionData,
} from '@/types/requisition.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/requisitions';

export const requisitionService = {
  /**
   * Get all requisitions with filters
   */
  getAll: async (filters?: RequisitionFilters): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(BASE_URL, { params: filters });
  },

  /**
   * Get requisition by ID
   */
  getById: async (id: number): Promise<Requisition> => {
    return api.get<Requisition>(`${BASE_URL}/${id}`);
  },

  /**
   * Get requisition by reference number
   */
  getByReference: async (referenceNumber: string): Promise<Requisition> => {
    return api.get<Requisition>(`${BASE_URL}/reference/${referenceNumber}`);
  },

  /**
   * Get current user's requisitions
   */
  getMyRequisitions: async (filters?: RequisitionFilters): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`${BASE_URL}/my`, { params: filters });
  },

  /**
   * Get pending approvals for current user
   */
  getPendingApprovals: async (filters?: RequisitionFilters): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`${BASE_URL}/pending`, { params: filters });
  },

  /**
   * Get requisition statistics
   */
  getStats: async (filters?: RequisitionFilters): Promise<RequisitionStats> => {
    return api.get<RequisitionStats>(`${BASE_URL}/stats`, { params: filters });
  },

  /**
   * Get current user's requisition statistics
   */
  getMyStats: async (): Promise<RequisitionStats> => {
    return api.get<RequisitionStats>(`${BASE_URL}/my/stats`);
  },

  /**
   * Create a new requisition
   */
  create: async (data: CreateRequisitionData): Promise<Requisition> => {
    return api.post<Requisition>(BASE_URL, data);
  },

  /**
   * Update a requisition
   */
  update: async (id: number, data: UpdateRequisitionData): Promise<Requisition> => {
    return api.put<Requisition>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete a requisition (draft only)
   */
  delete: async (id: number): Promise<void> => {
    return api.delete<void>(`${BASE_URL}/${id}`);
  },

  /**
   * Submit requisition for approval
   */
  submit: async (id: number, data: SubmitRequisitionData): Promise<Requisition> => {
    return api.post<Requisition>(`${BASE_URL}/${id}/submit`, data);
  },

  /**
   * Return requisition for revision
   */
  return: async (id: number, data: ReturnRequisitionData): Promise<Requisition> => {
    return api.post<Requisition>(`${BASE_URL}/${id}/return`, data);
  },

  /**
   * Cancel requisition
   */
  cancel: async (id: number, data: CancelRequisitionData): Promise<Requisition> => {
    return api.post<Requisition>(`${BASE_URL}/${id}/cancel`, data);
  },

  // ============================================
  // NEW: SERVICE AND GOODS SPECIFIC ENDPOINTS
  // ============================================

  /**
   * Get only service requisitions (LSO)
   */
  getServices: async (filters?: RequisitionFilters): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`${BASE_URL}/services`, { params: filters });
  },

  /**
   * Get only goods requisitions (LPO)
   */
  getGoods: async (filters?: RequisitionFilters): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`${BASE_URL}/goods`, { params: filters });
  },

  /**
   * Get requisitions by service category
   */
  getByServiceCategory: async (
    category: string,
    filters?: RequisitionFilters
  ): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`${BASE_URL}/by-service-category/${category}`, {
      params: filters,
    });
  },

  /**
   * Get requisitions ready for LPO generation (goods)
   */
  getForLpo: async (filters?: RequisitionFilters): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`${BASE_URL}/for-lpo`, { params: filters });
  },

  /**
   * Get requisitions ready for LSO generation (services)
   */
  getForLso: async (filters?: RequisitionFilters): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`${BASE_URL}/for-lso`, { params: filters });
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Admin - Get all requisitions (admin only)
   */
  adminGetAll: async (filters?: RequisitionFilters): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`/admin/requisitions/all`, { params: filters });
  },

  /**
   * Admin - Get requisition statistics (admin only)
   */
  adminGetStats: async (filters?: RequisitionFilters): Promise<RequisitionStats> => {
    return api.get<RequisitionStats>(`/admin/requisitions/stats`, { params: filters });
  },

  /**
   * Admin - Get department requisitions (admin only)
   */
  adminGetDepartmentRequisitions: async (
    departmentId: number,
    filters?: RequisitionFilters
  ): Promise<PaginatedResponse<Requisition>> => {
    return api.get<PaginatedResponse<Requisition>>(`/admin/requisitions/department/${departmentId}`, {
      params: filters,
    });
  },

  /**
   * Admin - Force approve requisition (admin only)
   */
  adminForceApprove: async (id: number): Promise<Requisition> => {
    return api.post<Requisition>(`/admin/requisitions/${id}/force-approve`);
  },

  /**
   * Admin - Force decline requisition (admin only)
   */
  adminForceDecline: async (id: number, data: { reason: string }): Promise<Requisition> => {
    return api.post<Requisition>(`/admin/requisitions/${id}/force-decline`, data);
  },

  /**
   * Admin - Force return requisition (admin only)
   */
  adminForceReturn: async (id: number, data: { reason: string }): Promise<Requisition> => {
    return api.post<Requisition>(`/admin/requisitions/${id}/force-return`, data);
  },

  /**
   * Admin - Assign approver (admin only)
   */
  adminAssignApprover: async (id: number, data: { user_id: number; level: string }): Promise<Requisition> => {
    return api.post<Requisition>(`/admin/requisitions/${id}/assign-approver`, data);
  },
};
