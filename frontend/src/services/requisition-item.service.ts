// frontend/src/services/requisition-item.service.ts

import { api } from './api';
import type {
  RequisitionItem,
  CreateRequisitionItemData,
  UpdateRequisitionItemData,
} from '@/types/requisition.types';

export const requisitionItemService = {
  /**
   * Get all items for a requisition
   */
  getByRequisitionId: async (requisitionId: number): Promise<RequisitionItem[]> => {
    return api.get<RequisitionItem[]>(`/requisitions/${requisitionId}/items`);
  },

  /**
   * Get item by ID
   */
  getById: async (requisitionId: number, itemId: number): Promise<RequisitionItem> => {
    return api.get<RequisitionItem>(`/requisitions/${requisitionId}/items/${itemId}`);
  },

  /**
   * Get item statistics for a requisition
   */
  getStats: async (requisitionId: number): Promise<{
    total_items: number;
    total_quantity: number;
    total_cost: number;
    total_received: number;
    total_delivered: number;
    pending_items: number;
    procured_items: number;
    delivered_items: number;
    received_items: number;
  }> => {
    return api.get(`/requisitions/${requisitionId}/items/stats`);
  },

  /**
   * Create a new requisition item
   */
  create: async (requisitionId: number, data: CreateRequisitionItemData): Promise<RequisitionItem> => {
    return api.post<RequisitionItem>(`/requisitions/${requisitionId}/items`, data);
  },

  /**
   * Bulk create requisition items
   */
  bulkCreate: async (requisitionId: number, items: CreateRequisitionItemData[]): Promise<RequisitionItem[]> => {
    return api.post<RequisitionItem[]>(`/requisitions/${requisitionId}/items/bulk`, { items });
  },

  /**
   * Update a requisition item
   */
  update: async (
    requisitionId: number,
    itemId: number,
    data: UpdateRequisitionItemData
  ): Promise<RequisitionItem> => {
    return api.put<RequisitionItem>(`/requisitions/${requisitionId}/items/${itemId}`, data);
  },

  /**
   * Delete a requisition item
   */
  delete: async (requisitionId: number, itemId: number): Promise<void> => {
    return api.delete<void>(`/requisitions/${requisitionId}/items/${itemId}`);
  },

  /**
   * Receive item (mark as received)
   */
  receiveItem: async (
    requisitionId: number,
    itemId: number,
    data: {
      received_quantity: number;
      receipt_number?: string;
    }
  ): Promise<RequisitionItem> => {
    return api.post<RequisitionItem>(`/requisitions/${requisitionId}/items/${itemId}/receive`, data);
  },

  /**
   * Update quality inspection status
   */
  updateQualityStatus: async (
    requisitionId: number,
    itemId: number,
    data: {
      quality_status: 'pending' | 'inspected' | 'accepted' | 'rejected';
      quality_notes?: string;
    }
  ): Promise<RequisitionItem> => {
    return api.post<RequisitionItem>(`/requisitions/${requisitionId}/items/${itemId}/quality`, data);
  },
};
