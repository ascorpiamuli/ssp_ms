// frontend/src/services/purchaseOrder.service.ts

import { api } from './api';
import type {
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderSummary,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
} from '@/types/purchaseOrder.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/purchase-orders';

export const purchaseOrderService = {
  /**
   * Get all purchase orders with filters
   */
  getAll: async (filters?: PurchaseOrderFilters): Promise<PaginatedResponse<PurchaseOrder>> => {
    return api.get<PaginatedResponse<PurchaseOrder>>(BASE_URL, { params: filters });
  },

  /**
   * Get purchase order by ID
   */
  getById: async (id: number): Promise<PurchaseOrder> => {
    return api.get<PurchaseOrder>(`${BASE_URL}/${id}`);
  },

  /**
   * Get purchase order summary
   */
  getSummary: async (id: number): Promise<PurchaseOrderSummary> => {
    return api.get<PurchaseOrderSummary>(`${BASE_URL}/${id}/summary`);
  },

  /**
   * Create a new purchase order
   */
  create: async (data: CreatePurchaseOrderData): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(BASE_URL, data);
  },

  /**
   * Update a purchase order
   */
  update: async (id: number, data: UpdatePurchaseOrderData): Promise<PurchaseOrder> => {
    return api.put<PurchaseOrder>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Approve a purchase order
   */
  approve: async (id: number, comment?: string): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/approve`, { comment });
  },

  /**
   * Issue a purchase order
   */
  issue: async (id: number): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/issue`);
  },

  /**
   * Send purchase order to supplier
   */
  sendToSupplier: async (id: number): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/send`);
  },

  /**
   * Acknowledge purchase order by supplier
   */
  acknowledge: async (id: number, supplierId: number): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/acknowledge`, { supplier_id: supplierId });
  },

  /**
   * Mark purchase order as delivered
   */
  markDelivered: async (id: number): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/deliver`);
  },

  /**
   * Complete a purchase order
   */
  complete: async (id: number): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/complete`);
  },

  /**
   * Cancel a purchase order
   */
  cancel: async (id: number, reason: string): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/cancel`, { reason });
  },

  /**
   * Get delivery progress
   */
  getDeliveryProgress: async (id: number): Promise<{ progress: number }> => {
    return api.get<{ progress: number }>(`${BASE_URL}/${id}/delivery-progress`);
  },

  /**
   * Get overdue purchase orders
   */
  getOverdue: async (): Promise<PurchaseOrder[]> => {
    return api.get<PurchaseOrder[]>(`${BASE_URL}/overdue`);
  },

  /**
   * Get purchase order PDF
   */
  getPdf: async (id: number): Promise<{ pdf: string }> => {
    return api.get<{ pdf: string }>(`${BASE_URL}/${id}/pdf`);
  },

  /**
   * Get purchase orders by requisition
   */
  getByRequisition: async (requisitionId: number): Promise<PurchaseOrder[]> => {
    return api.get<PurchaseOrder[]>(`${BASE_URL}`, { params: { requisition_id: requisitionId } });
  },
};
