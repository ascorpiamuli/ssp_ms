// frontend/src/types/approval.types.ts

import { User, Department, ApiResponse, PaginatedResponse } from './common.types';
import { Requisition, RequisitionStatus } from './requisition.types';

// ============================================
// APPROVAL ENUMS
// ============================================

export type ApprovalLevel = 'hod' | 'accountant' | 'principal' | 'final';
export type ApprovalStatus = 'pending' | 'approved' | 'declined' | 'returned' | 'delegated' | 'escalated' | 'revised';
export type ApprovalAction = 'approved' | 'declined' | 'returned';

// ============================================
// APPROVAL
// ============================================

export interface Approval {
  id: number;
  requisition_id: number;
  approver_id: number;
  delegate_id: number | null;
  original_approver_id: number | null;
  level: ApprovalLevel;
  level_label: string;
  level_color: string;
  status: ApprovalStatus;
  status_label: string;
  status_color: string;
  comment: string | null;
  decline_reason: string | null;
  return_reason: string | null;
  revision_notes: string | null;
  revision_count: number;
  last_revised_at: string | null;
  approved_at: string | null;
  declined_at: string | null;
  returned_at: string | null;
  delegated_at: string | null;
  reminded_at: string | null;
  escalated_at: string | null;
  viewed_at: string | null;
  response_time_hours: number | null;
  response_time_label: string;
  received_at: string;
  notification_sent: boolean;
  notification_sent_at: string | null;
  notification_count: number;
  reminder_count: number;
  order: number;
  is_required: boolean;
  conditions: Record<string, any> | null;
  condition_notes: string | null;
  action_taken: 'online' | 'offline' | 'delegated' | 'escalated' | null;
  device_info: string | null;
  ip_address: string | null;
  digital_signature: string | null;
  is_signed: boolean;
  signed_at: string | null;
  is_group_approval: boolean;
  approval_group: string | null;
  group_order: number | null;
  is_pending: boolean;
  is_approved: boolean;
  is_declined: boolean;
  is_delegated: boolean;
  metadata: Record<string, any> | null;
  approver?: User;
  delegate?: User;
  originalApprover?: User;
  requisition?: Requisition;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ============================================
// APPROVAL WORKFLOW
// ============================================

export interface ApprovalLevelConfig {
  level: ApprovalLevel;
  order: number;
  required: boolean;
  approver_id?: number;
}

export interface ApprovalWorkflow {
  id: number;
  department_id: number;
  name: string;
  description: string | null;
  approval_levels: ApprovalLevelConfig[];
  approval_levels_count: number;
  rules: Record<string, any> | null;
  conditions: Record<string, any> | null;
  is_active: boolean;
  is_default: boolean;
  status_label: string;
  status_color: string;
  is_default_label: string;
  min_amount: number;
  max_amount: number | null;
  threshold_level_1: number | null;
  threshold_level_2: number | null;
  threshold_level_3: number | null;
  required_approvals: number;
  require_all_approvals: boolean;
  allow_delegation: boolean;
  allow_parallel_approvals: boolean;
  require_sequential: boolean;
  max_approvers: number | null;
  sla_hours: number;
  reminder_hours: number;
  escalation_hours: number;
  allow_override: boolean;
  allow_reassignment: boolean;
  allow_skip: boolean;
  allow_revision: boolean;
  max_revisions: number;
  require_justification_for_revision: boolean;
  auto_approve_after_revision: boolean;
  created_by: number;
  updated_by: number | null;
  department?: Department;
  createdBy?: User;
  updatedBy?: User;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface ProcessApprovalData {
  action: ApprovalAction;
  reason?: string;
  comment?: string;
  user_id?: number;
}

export interface DelegateApprovalData {
  delegate_id: number;
  comment?: string;
}

export interface CreateWorkflowData {
  department_id: number;
  name: string;
  description?: string;
  approval_levels: ApprovalLevelConfig[];
  is_active?: boolean;
  is_default?: boolean;
  min_amount?: number;
  max_amount?: number;
  required_approvals?: number;
  require_all_approvals?: boolean;
  allow_delegation?: boolean;
  sla_hours?: number;
  reminder_hours?: number;
  escalation_hours?: number;
  max_revisions?: number;
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  approval_levels?: ApprovalLevelConfig[];
  is_active?: boolean;
  is_default?: boolean;
  min_amount?: number;
  max_amount?: number;
  required_approvals?: number;
  require_all_approvals?: boolean;
  allow_delegation?: boolean;
  sla_hours?: number;
  reminder_hours?: number;
  escalation_hours?: number;
  max_revisions?: number;
}

export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  returned: number;
  delegated: number;
  escalated: number;
  avg_response_time: number | null;
  by_level?: Record<string, number>;
  by_status?: Record<string, number>;
}

export type ApprovalResponse = ApiResponse<Approval>;
export type ApprovalListResponse = ApiResponse<PaginatedResponse<Approval>>;
export type ApprovalWorkflowResponse = ApiResponse<ApprovalWorkflow>;
export type ApprovalStatsResponse = ApiResponse<ApprovalStats>;
