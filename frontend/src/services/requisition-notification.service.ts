// frontend/src/services/requisition-notification.service.ts

import { api } from './api';
import type { RequisitionNotification } from '@/types/notification.types';
import type { NotificationFilters } from '@/types/notification.types';
import type { PaginatedResponse } from '@/types/common.types';

export const requisitionNotificationService = {
  /**
   * Get notifications for current user
   */
  getAll: async (filters?: NotificationFilters): Promise<PaginatedResponse<RequisitionNotification>> => {
    return api.get<PaginatedResponse<RequisitionNotification>>('/notifications', { params: filters });
  },

  /**
   * Get notifications for a specific requisition
   */
  getForRequisition: async (requisitionId: number, filters?: NotificationFilters): Promise<PaginatedResponse<RequisitionNotification>> => {
    return api.get<PaginatedResponse<RequisitionNotification>>(`/notifications/requisition/${requisitionId}`, {
      params: filters,
    });
  },

  /**
   * Get notification by ID
   */
  getById: async (id: number): Promise<RequisitionNotification> => {
    return api.get<RequisitionNotification>(`/notifications/${id}`);
  },

  /**
   * Get unread count for current user
   */
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    return api.get<{ unread_count: number }>('/notifications/unread-count');
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<RequisitionNotification> => {
    return api.post<RequisitionNotification>(`/notifications/${id}/mark-read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ marked_count: number }> => {
    return api.post<{ marked_count: number }>('/notifications/mark-all-read');
  },

  /**
   * Delete a notification
   */
  delete: async (id: number): Promise<void> => {
    return api.delete<void>(`/notifications/${id}`);
  },

  /**
   * Delete all notifications
   */
  deleteAll: async (): Promise<{ deleted_count: number }> => {
    return api.delete<{ deleted_count: number }>('/notifications/delete-all');
  },
};
