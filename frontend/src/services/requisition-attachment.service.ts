// frontend/src/services/requisition-attachment.service.ts

import { api } from './api';
import type { RequisitionAttachment } from '@/types/requisition.types';
import type { AttachmentCategory } from '@/types/requisition.types';

export const requisitionAttachmentService = {
  /**
   * Get all attachments for a requisition
   */
  getByRequisitionId: async (requisitionId: number): Promise<RequisitionAttachment[]> => {
    return api.get<RequisitionAttachment[]>(`/requisitions/${requisitionId}/attachments`);
  },

  /**
   * Get attachment by ID
   */
  getById: async (requisitionId: number, attachmentId: number): Promise<RequisitionAttachment> => {
    return api.get<RequisitionAttachment>(`/requisitions/${requisitionId}/attachments/${attachmentId}`);
  },

  /**
   * Upload an attachment
   */
  upload: async (
    requisitionId: number,
    file: File,
    data?: {
      category?: AttachmentCategory;
      description?: string;
      is_required?: boolean;
    }
  ): Promise<RequisitionAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    if (data?.category) formData.append('category', data.category);
    if (data?.description) formData.append('description', data.description);
    if (data?.is_required !== undefined) formData.append('is_required', String(data.is_required));

    return api.upload<RequisitionAttachment>(`/requisitions/${requisitionId}/attachments`, file, 'file', {
      data: formData,
    });
  },

  /**
   * Update attachment metadata
   */
  update: async (
    requisitionId: number,
    attachmentId: number,
    data: {
      category?: AttachmentCategory;
      description?: string;
      is_required?: boolean;
    }
  ): Promise<RequisitionAttachment> => {
    return api.put<RequisitionAttachment>(`/requisitions/${requisitionId}/attachments/${attachmentId}`, data);
  },

  /**
   * Delete an attachment
   */
  delete: async (requisitionId: number, attachmentId: number): Promise<void> => {
    return api.delete<void>(`/requisitions/${requisitionId}/attachments/${attachmentId}`);
  },

  /**
   * Download an attachment
   */
  download: async (requisitionId: number, attachmentId: number): Promise<Blob> => {
    const response = await api.getClient().get(
      `/requisitions/${requisitionId}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Get download URL for an attachment
   */
  getDownloadUrl: (requisitionId: number, attachmentId: number): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    return `${baseUrl}/requisitions/${requisitionId}/attachments/${attachmentId}/download`;
  },
};
