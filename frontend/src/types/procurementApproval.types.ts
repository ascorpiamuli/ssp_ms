// frontend/src/types/procurementApproval.types.ts

import { ApiResponse, PaginatedResponse } from './common.types';

export type ApprovalLevel = 'hod' | 'accountant' | 'principal' | 'final' | 'diocesan_accountant' | 'procurement';
export type ApprovalStatus = 'pending' | 'approved' | 'declined' | 'returned';

export interface ProcurementApproval {
  id: number;
  requisition_id: number;
  approvable_id: number;
  entity_id:number,
  entity_type:any
  approvable_type: string;
  level: ApprovalLevel;
  level_label: string;
  level_color: string;
  approver_id: number;
  approver_name: string;
  delegate_id: number | null;
  status: ApprovalStatus;
  status_label: string;
  status_color: string;
  is_pending: boolean;
  is_approved: boolean;
  is_declined: boolean;
  is_returned: boolean;
  order: number;
  comment: string | null;
  decline_reason: string | null;
  return_reason: string | null;
  deadline: string | null;
  is_overdue: boolean;
  is_reminder_sent: boolean;
  reminder_sent_at: string | null;
  approved_at: string | null;
  declined_at: string | null;
  returned_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApprovalData {
  requisition_id: number;
  entity_id: number;
  entity_type: string;
  level: ApprovalLevel;
  approver_id: number;
  deadline?: string;
  metadata?: Record<string, any>;
}

export interface ApproveApprovalData {
  comment?: string;
}

export interface DeclineApprovalData {
  reason: string;
}

export interface ReturnApprovalData {
  reason: string;
}

export interface DelegateApprovalData {
  delegate_id: number;
}

export interface ReassignApprovalData {
  approver_id: number;
}

export interface EntityApprovalRequest {
  entity_id: number;
  entity_type: string;
}

export interface ApprovalFilters {
  user_id?: number;
  status?: ApprovalStatus | ApprovalStatus[];
  level?: ApprovalLevel | ApprovalLevel[];
  entity_id?: number;
  entity_type?: string;
  requisition_id?: number;
  pending?: boolean;
  overdue?: boolean;
  page?: number;
  per_page?: number;
}

export interface ApprovalStatistics {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  returned: number;
  overdue: number;
  delegated: number;
}

export interface ApprovalTimeline {
  level: string;
  approver: string;
  status: string;
  comment: string | null;
  approved_at: string | null;
  declined_at: string | null;
  returned_at: string | null;
}

export type ProcurementApprovalResponse = ApiResponse<ProcurementApproval>;
export type ProcurementApprovalListResponse = ApiResponse<PaginatedResponse<ProcurementApproval>>;
export type ApprovalStatisticsResponse = ApiResponse<ApprovalStatistics>;
export type ApprovalTimelineResponse = ApiResponse<ApprovalTimeline[]>;
export type IsApprovedResponse = ApiResponse<{ is_approved: boolean }>;
export type CurrentLevelResponse = ApiResponse<ProcurementApproval | null>;
