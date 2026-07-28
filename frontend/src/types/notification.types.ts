// frontend/src/types/notification.types.ts

import { User, ApiResponse, PaginatedResponse } from './common.types';
import { Requisition } from './requisition.types';

// ============================================
// NOTIFICATION ENUMS
// ============================================

export type NotificationType =
  | 'submitted'
  | 'approved'
  | 'declined'
  | 'returned'
  | 'reminder'
  | 'escalation'
  | 'comment'
  | 'mention'
  | 'status_change'
  | 'revision_requested'
  | 'revision_approved'
  | 'revision_rejected'
  | 'delegated';

// ============================================
// REQUISITION NOTIFICATION
// ============================================

export interface RequisitionNotification {
  id: number;
  requisition_id: number;
  user_id: number;
  sent_by: number | null;
  type: NotificationType;
  type_label: string;
  type_color: string;
  channel: string;
  subject: string;
  message: string;
  data: Record<string, any> | null;
  is_read: boolean;
  is_sent: boolean;
  status_label: string;
  status_color: string;
  sent_at: string | null;
  read_at: string | null;
  delivered_at: string | null;
  user?: User;
  sentBy?: User;
  requisition?: {
    id: number;
    reference_number: string;
    title: string;
    status: string;
    status_label: string;
    total_amount: number;
  };
  is_read_label: string;
  is_sent_label: string;
  formatted_created_at: string;
  user_name: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface NotificationFilters {
  is_read?: boolean;
  type?: NotificationType;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface NotificationStats {
  unread_count: number;
  total_count: number;
  by_type: Record<string, number>;
}

export type NotificationResponse = ApiResponse<RequisitionNotification>;
export type NotificationListResponse = ApiResponse<PaginatedResponse<RequisitionNotification>>;
export type NotificationStatsResponse = ApiResponse<NotificationStats>;
