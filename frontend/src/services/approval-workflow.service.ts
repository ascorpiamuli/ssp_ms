// frontend/src/services/approval-workflow.service.ts

import { api } from './api';
import type { ApprovalWorkflow } from '@/types/approval.types';
import type { CreateWorkflowData } from '@/types/approval.types';
import type { UpdateWorkflowData } from '@/types/approval.types';

export const approvalWorkflowService = {
  /**
   * Get all workflows
   */
  getAll: async (filters?: {
    department_id?: number;
    is_active?: boolean;
    search?: string;
  }): Promise<ApprovalWorkflow[]> => {
    return api.get<ApprovalWorkflow[]>('/approvals/workflows', { params: filters });
  },

  /**
   * Get workflow by ID
   */
  getById: async (id: number): Promise<ApprovalWorkflow> => {
    return api.get<ApprovalWorkflow>(`/approvals/workflows/${id}`);
  },

  /**
   * Get default workflow for a department
   */
  getDefault: async (departmentId: number): Promise<ApprovalWorkflow | null> => {
    return api.get<ApprovalWorkflow | null>(`/approvals/workflows/default/${departmentId}`);
  },

  /**
   * Create a new workflow (admin only)
   */
  create: async (data: CreateWorkflowData): Promise<ApprovalWorkflow> => {
    return api.post<ApprovalWorkflow>('/approvals/workflows', data);
  },

  /**
   * Update a workflow (admin only)
   */
  update: async (id: number, data: UpdateWorkflowData): Promise<ApprovalWorkflow> => {
    return api.put<ApprovalWorkflow>(`/approvals/workflows/${id}`, data);
  },

  /**
   * Delete a workflow (admin only)
   */
  delete: async (id: number): Promise<void> => {
    return api.delete<void>(`/approvals/workflows/${id}`);
  },

  /**
   * Clone a workflow (admin only)
   */
  clone: async (id: number, data: { department_id: number; name: string }): Promise<ApprovalWorkflow> => {
    return api.post<ApprovalWorkflow>(`/approvals/workflows/${id}/clone`, data);
  },
};
