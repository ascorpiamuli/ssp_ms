// frontend/src/types/requisition.types.ts

import { User, Department, Supplier, PaginatedResponse, ApiResponse } from './common.types';
import { Approval } from './approval.types';
import { RequisitionBudget } from './budget.types';

// ============================================
// ENUMS
// ============================================

export type RequisitionStatus =
  | 'draft'
  | 'submitted'
  | 'hod_approved'
  | 'hod_declined'
  | 'accountant_approved'
  | 'accountant_declined'
  | 'principal_approved'
  | 'principal_declined'
  | 'final_approved'
  | 'final_declined'
  | 'returned'
  | 'cancelled'
  | 'revised';

export type RequisitionPriority = 'low' | 'medium' | 'high' | 'emergency';
export type RequisitionType = 'normal' | 'emergency';
export type RequisitionUrgency = 'routine' | 'urgent' | 'critical';
export type ProcurementMethod = 'direct_purchase' | 'request_for_quotation' | 'tender' | 'framework_agreement' | 'emergency_procurement';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type SlaStatus = 'on_track' | 'at_risk' | 'breached';

// ============================================
// REQUISITION ITEM
// ============================================

export interface RequisitionItem {
  id: number;
  requisition_id: number;
  item_name: string;
  description: string | null;
  unit_of_measure: string;
  quantity: number;
  formatted_quantity: string;
  estimated_unit_cost: number;
  formatted_estimated_unit_cost: string;
  total_cost: number;
  formatted_total_cost: string;
  specifications: string | null;
  catalog_number: string | null;
  manufacturer: string | null;
  model_number: string | null;
  tax_rate: number;
  tax_amount: number;
  discount_percentage: number;
  discount_amount: number;
  net_amount: number;
  total_with_tax: number;
  budget_allocated: number | null;
  budget_line_item: string | null;
  is_inventory_item: boolean;
  inventory_code: string | null;
  current_stock: number | null;
  reorder_level: number | null;
  supplier_id: number | null;
  supplier_quotation_number: string | null;
  alternative_suppliers: any[] | null;
  alternative_quotations: any[] | null;
  is_procured: boolean;
  procured_at: string | null;
  actual_unit_cost: number | null;
  actual_total_cost: number | null;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  delivery_lead_time_days: number | null;
  delivery_address: string | null;
  delivery_contact_person: string | null;
  delivery_contact_phone: string | null;
  is_delivered: boolean;
  delivery_receipt_date: string | null;
  delivery_receipt_number: string | null;
  quality_status: 'pending' | 'inspected' | 'accepted' | 'rejected';
  quality_status_label: string;
  quality_notes: string | null;
  quality_inspected_at: string | null;
  quality_inspected_by: number | null;
  warranty_period_months: number | null;
  warranty_start_date: string | null;
  warranty_end_date: string | null;
  warranty_terms: string | null;
  received_quantity: number;
  remaining_quantity: number;
  fully_received_at: string | null;
  purchase_order_id: number | null;
  purchase_order_line_item: string | null;
  status: 'pending' | 'approved' | 'procured' | 'delivered' | 'received' | 'cancelled';
  status_label: string;
  status_color: string;
  is_fully_received: boolean;
  supplier?: Supplier;
  quality_inspector?: User;
  created_at: string;
  updated_at: string;
}

// ============================================
// REQUISITION ATTACHMENT
// ============================================

export type AttachmentCategory =
  | 'quotation'
  | 'specification'
  | 'justification'
  | 'approval_document'
  | 'budget_document'
  | 'invoice'
  | 'receipt'
  | 'contract'
  | 'other';

export interface RequisitionAttachment {
  id: number;
  requisition_id: number;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number;
  formatted_file_size: string;
  mime_type: string | null;
  file_extension: string;
  is_image: boolean;
  url: string;
  category: AttachmentCategory;
  category_label: string;
  description: string | null;
  is_required: boolean;
  is_verified: boolean;
  version: number;
  uploaded_at: string;
  uploaded_by: number;
  uploadedBy?: User;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// REQUISITION HISTORY
// ============================================

export type HistoryAction =
  | 'created'
  | 'updated'
  | 'submitted'
  | 'hod_approved'
  | 'hod_declined'
  | 'accountant_approved'
  | 'accountant_declined'
  | 'principal_approved'
  | 'principal_declined'
  | 'final_approved'
  | 'final_declined'
  | 'returned'
  | 'cancelled'
  | 'restored'
  | 'commented'
  | 'attachment_added'
  | 'attachment_removed'
  | 'item_added'
  | 'item_removed'
  | 'item_updated'
  | 'budget_updated'
  | 'revised'
  | 'revision_approved'
  | 'revision_rejected'
  | 'escalated'
  | 'delegated';

export interface RequisitionHistory {
  id: number;
  requisition_id: number;
  action: HistoryAction;
  action_label: string;
  action_color: string;
  user_agent:string,
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  comment: string | null;
  revision_number: number | null;
  revision_reason: string | null;
  ip_address: string | null;
  user_id: number;
  user?: User;
  is_status_change: boolean;
  old_status: string | null;
  new_status: string | null;
  created_at: string;
  formatted_created_at: string;
}

// ============================================
// REQUISITION REVISION
// ============================================

export type RevisionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface RequisitionRevision {
  id: number;
  requisition_id: number;
  revision_number: number;
  revision_reason: string;
  revision_notes: string | null;
  changes: Record<string, any> | null;
  status: RevisionStatus;
  status_label: string;
  status_color: string;
  approval_notes: string | null;
  rejection_reason: string | null;
  requested_by: number;
  requestedBy?: User;
  approved_by: number | null;
  approvedBy?: User;
  rejected_by: number | null;
  rejectedBy?: User;
  requested_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  is_pending: boolean;
  is_approved: boolean;
  is_rejected: boolean;
  can_approve: boolean;
  can_reject: boolean;
  can_cancel: boolean;
  can_revise: boolean;
}

// ============================================
// REQUISITION NOTIFICATION
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

export type NotificationChannel = 'email' | 'database' | 'broadcast' | 'sms';

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
// REQUISITION ESCALATION
// ============================================

export type EscalationReason =
  | 'delayed_approval'
  | 'budget_issue'
  | 'emergency'
  | 'exception'
  | 'policy_violation'
  | 'revision_dispute';

export type EscalationStatus = 'pending' | 'resolved' | 'rejected';

export interface RequisitionEscalation {
  id: number;
  requisition_id: number;
  reason: EscalationReason;
  reason_label: string;
  remarks: string;
  resolution_notes: string | null;
  status: EscalationStatus;
  status_label: string;
  status_color: string;
  escalated_by: number;
  escalated_by_name: string;
  escalated_to: number;
  escalated_to_name: string;
  resolved_by: number | null;
  resolved_by_name: string;
  escalated_at: string;
  resolved_at: string | null;
  acknowledged_at: string | null;
  formatted_escalated_at: string;
  is_pending: boolean;
  is_resolved: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// REQUISITION DELEGATION
// ============================================

export type ApprovalLevel = 'hod' | 'accountant' | 'principal' | 'final';

export interface RequisitionDelegation {
  id: number;
  approver_id: number;
  delegate_id: number;
  department_id: number;
  level: ApprovalLevel;
  level_label: string;
  level_color: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  is_active: boolean;
  is_permanent: boolean;
  status_label: string;
  status_color: string;
  is_active_label: string;
  is_permanent_label: string;
  approver_name: string;
  delegate_name: string;
  department_name: string;
  formatted_start_date: string;
  formatted_end_date: string;
  is_expired: boolean;
  is_upcoming: boolean;
  is_currently_active: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// REQUISITION TEMPLATE
// ============================================

export interface RequisitionTemplate {
  id: number;
  department_id: number;
  name: string;
  description: string | null;
  items: RequisitionItem[];
  items_count: number;
  is_active: boolean;
  is_public: boolean;
  status_label: string;
  status_color: string;
  visibility_label: string;
  department?: Department;
  created_by: number;
  createdBy?: User;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// MAIN REQUISITION
// ============================================

export interface Requisition {
  id: number;
  reference_number: string;
  title: string;
  description: string | null;
  total_amount: number;
  formatted_total_amount: string;
  status: RequisitionStatus;
  status_label: string;
  status_color: string;
  priority: RequisitionPriority;
  priority_label: string;
  priority_color: string;
  type: RequisitionType;
  type_label: string;
  urgency: RequisitionUrgency;
  urgency_label: string;
  justification: string | null;
  required_by_date: string | null;
  required_delivery_date: string | null;
  revision_count: number;
  last_revised_at: string | null;
  revision_notes: string | null;
  revision_status: RevisionStatus | null;
  budget_allocated: number | null;
  budget_utilized: number;
  budget_code: string | null;
  budget_source: string | null;
  funding_source: string | null;
  project_code: string | null;
  procurement_method: ProcurementMethod | null;
  is_framework_agreement: boolean;
  framework_agreement_id: string | null;
  risk_level: RiskLevel;
  risk_level_label: string;
  risk_mitigation: string | null;
  is_compliant: boolean;
  compliance_notes: string | null;
  sla_status: SlaStatus | null;
  sla_status_label: string | null;
  sla_started_at: string | null;
  sla_target_at: string | null;
  approval_level_count: number;
  total_approval_levels: number;
  last_approval_at: string | null;
  estimated_completion_date: string | null;
  currency: string;
  exchange_rate: number;
  total_amount_usd: number | null;
  department_budget_balance: number | null;
  department_utilization_percentage: number | null;
  audit_trail_last_checked: string | null;
  audit_status: string | null;
  is_procurement_created: boolean;
  procurement_created_at: string | null;
  procurement_plan_id: number | null;
  submitted_at: string | null;
  submitted_by: number | null;
  hod_approved_at: string | null;
  hod_declined_at: string | null;
  hod_decline_reason: string | null;
  hod_approver_id: number | null;
  accountant_approved_at: string | null;
  accountant_declined_at: string | null;
  accountant_decline_reason: string | null;
  accountant_approver_id: number | null;
  principal_approved_at: string | null;
  principal_declined_at: string | null;
  principal_decline_reason: string | null;
  principal_approver_id: number | null;
  final_approved_at: string | null;
  final_declined_at: string | null;
  final_decline_reason: string | null;
  final_approver_id: number | null;
  returned_at: string | null;
  return_reason: string | null;
  returned_by: number | null;
  return_count: number;
  last_returned_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: number | null;
  approved_at: string | null;
  declined_at: string | null;
  user_id: number;
  department_id: number;
  supplier_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Relationships
  user?: User;
  department?: Department;
  supplier?: Supplier;
  items?: RequisitionItem[];
  attachments?: RequisitionAttachment[];
  history?: RequisitionHistory[];
  approvals?: Approval[];
  budgets?: RequisitionBudget[];
  revisions?: RequisitionRevision[];
  notifications?: RequisitionNotification[];
  escalations?: RequisitionEscalation[];
  hodApprover?: User;
  accountantApprover?: User;
  principalApprover?: User;
  finalApprover?: User;
  returnedBy?: User;
  cancelledBy?: User;
  submittedBy?: User;

  // Flags
  is_editable: boolean;
  is_approvable: boolean;
  is_returnable: boolean;
  can_be_revised: boolean;

  // Metadata
  metadata: Record<string, any> | null;
  custom_fields: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
}

// ============================================
// REQUISITION FILTERS
// ============================================

export interface RequisitionFilters {
  search?: string;
  status?: RequisitionStatus | RequisitionStatus[];
  department_id?: number;
  user_id?: number;
  priority?: RequisitionPriority;
  type?: RequisitionType;
  urgency?: RequisitionUrgency;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

// ============================================
// REQUISITION STATS
// ============================================

export interface RequisitionStats {
  total: number;
  draft: number;
  submitted: number;
  pending: number;
  approved: number;
  hod_approved: number;
  accountant_approved: number;
  principal_approved: number;
  final_approved: number;
  declined: number;
  hod_declined: number;
  accountant_declined: number;
  principal_declined: number;
  final_declined: number;
  returned: number;
  cancelled: number;
  revised: number;
  total_amount: number;
  emergency: number;
  average_amount: number;
  by_department?: Record<string, number>;
  by_priority?: Record<string, number>;
  by_urgency?: Record<string, number>;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface CreateRequisitionData {
  reference_number:string,
  title: string;
  description?: string;
  department_id: number;
  supplier_id?: number;
  priority?: RequisitionPriority;
  type?: RequisitionType;
  urgency?: RequisitionUrgency;
  justification?: string;
  required_by_date?: string;
  required_delivery_date?: string;
  budget_code?: string;
  budget_source?: string;
  funding_source?: string;
  project_code?: string;
  procurement_method?: ProcurementMethod;
  is_framework_agreement?: boolean;
  framework_agreement_id?: string;
  risk_level?: RiskLevel;
  risk_mitigation?: string;
  is_compliant?: boolean;
  compliance_notes?: string;
  currency?: string;
  exchange_rate?: number;
  metadata?: Record<string, any>;
  custom_fields?: Record<string, any>;
  items?: CreateRequisitionItemData[];
}

export interface CreateRequisitionItemData {
  item_name: string;
  description?: string;
  unit_of_measure: string;
  quantity: number;
  estimated_unit_cost: number;
  specifications?: string;
  catalog_number?: string;
  manufacturer?: string;
  model_number?: string;
  supplier_id?: number;
  is_inventory_item?: boolean;
  inventory_code?: string;
  tax_rate?: number;
  discount_percentage?: number;
}

export interface UpdateRequisitionData {
  title?: string;
  description?: string;
  department_id?: number;
  supplier_id?: number;
  priority?: RequisitionPriority;
  type?: RequisitionType;
  urgency?: RequisitionUrgency;
  justification?: string;
  required_by_date?: string;
  required_delivery_date?: string;
  budget_code?: string;
  budget_source?: string;
  funding_source?: string;
  project_code?: string;
  procurement_method?: ProcurementMethod;
  is_framework_agreement?: boolean;
  framework_agreement_id?: string;
  risk_level?: RiskLevel;
  risk_mitigation?: string;
  is_compliant?: boolean;
  compliance_notes?: string;
  currency?: string;
  exchange_rate?: number;
  metadata?: Record<string, any>;
  custom_fields?: Record<string, any>;
  items?: UpdateRequisitionItemData[];
}

export interface UpdateRequisitionItemData {
  id?: number;
  item_name?: string;
  description?: string;
  unit_of_measure?: string;
  quantity?: number;
  estimated_unit_cost?: number;
  specifications?: string;
  catalog_number?: string;
  manufacturer?: string;
  model_number?: string;
  supplier_id?: number;
  is_inventory_item?: boolean;
  inventory_code?: string;
  tax_rate?: number;
  discount_percentage?: number;
}

export interface SubmitRequisitionData {
  comment?: string;
}

export interface ReturnRequisitionData {
  reason: string;
  comment?: string;
}

export interface CancelRequisitionData {
  reason: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export type RequisitionResponse = ApiResponse<Requisition>;
export type RequisitionListResponse = ApiResponse<PaginatedResponse<Requisition>>;
export type RequisitionStatsResponse = ApiResponse<RequisitionStats>;
