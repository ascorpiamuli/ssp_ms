// frontend/src/types/purchaseOrder.types.ts

import { ApiResponse, PaginatedResponse } from './common.types';
import { Requisition } from './requisition.types';
import { SupplierQuotation } from './supplierQuotation.types';

export type PurchaseOrderType = 'lpo' | 'lso';
export type PurchaseOrderStatus =
  | 'draft'
  | 'issued'
  | 'sent'
  | 'acknowledged'
  | 'delivered'
  | 'partial'
  | 'completed'
  | 'cancelled'
  | 'closed';

// frontend/src/types/purchaseOrder.types.ts

// ... existing types ...

export type PurchaseOrderWorkflowStatus =
  | 'draft'
  | 'pending_check'
  | 'pending_endorsement'
  | 'pending_approval'
  | 'issued'
  | 'sent'
  | 'acknowledged'
  | 'delivered'
  | 'partial'
  | 'completed'
  | 'cancelled'
  | 'closed';

export interface PurchaseOrderWorkflow {
  id: number;
  po_number: string;
  status: PurchaseOrderWorkflowStatus;
  checked_by: number | null;
  checked_at: string | null;
  endorsed_by: number | null;
  endorsed_at: string | null;
  approved_by: number | null;
  approved_at: string | null;
  checked_by_user: string | null;
  endorsed_by_user: string | null;
  approved_by_user: string | null;
  can_check: boolean;
  can_endorse: boolean;
  can_approve: boolean;
  can_download: boolean;
  can_issue: boolean;
  can_send: boolean;
  can_cancel: boolean;
  can_complete: boolean;
  is_checkable: boolean;
  is_endorsable: boolean;
  is_approvable: boolean;
  current_step: 'check' | 'endorse' | 'approve' | 'issue' | 'send' | 'complete' | 'done';
  next_action: string | null;
  missing_signature: string | null;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  requisition_item_id: number;
  supplier_quotation_item_id: number | null;
  item_name: string;
  description: string | null;
  unit_of_measure: string | null;
  quantity: number;
  formatted_quantity: string;
  unit_price: number;
  formatted_unit_price: string;
  total_price: number;
  formatted_total_price: string;
  tax_rate: number;
  tax_amount: number;
  discount_rate: number;
  discount_amount: number;
  net_price: number;
  formatted_net_price: string;
  delivery_days: number | null;
  warranty_months: number | null;
  specifications: string | null;
  brand: string | null;
  model: string | null;
  catalog_number: string | null;
  received_quantity: number;
  formatted_received_quantity: string;
  remaining_quantity: number;
  formatted_remaining_quantity: string;
  accepted_quantity: number;
  rejected_quantity: number;
  fully_received: boolean;
  fully_received_at: string | null;
  status: 'pending' | 'partial' | 'received' | 'cancelled';
  status_label: string;
  status_color: string;
  is_fully_received: boolean;
  notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: number;
  requisition_id: number;
  supplier_id: number;
  supplier_quotation_id: number | null;
  po_number: string;
  type: PurchaseOrderType;
  type_label: string;
  type_color: string;
  download_count:number,
  is_lpo: boolean;
  is_lso: boolean;
  title: string;
  description: string | null;
  total_amount: number;
  formatted_total_amount: string;
  tax_amount: number;
  total_with_tax: number;
  currency: string;
  issue_date: string;
  expected_delivery_date: string;
  actual_delivery_date: string | null;
  delivery_address: string | null;
  delivery_contact: string | null;
  delivery_phone: string | null;
  delivery_email: string | null;
  payment_terms: string | null;
  delivery_terms: string | null;
  special_conditions: string | null;
  terms_and_conditions: string | null;
  validity_period_days: number;
  contract_number: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  status: PurchaseOrderStatus;
  status_label: string;
  status_color: string;
  is_overdue: boolean;
  delivery_progress: number;
  is_fully_delivered: boolean;
  can_be_modified: boolean;
  generated_by: number;
  checked_by: number | null;
  endorsed_by: number | null;
  approved_by: number | null;
  checked_at: string | null;
  endorsed_at: string | null;
  approved_at: string | null;
  issued_at: string | null;
  sent_at: string | null;
  acknowledged_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  digital_signature_generator: string | null;
  digital_signature_checker: string | null;
  digital_signature_endorser: string | null;
  digital_signature_approver: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Relationships
  requisition?: Requisition;
  supplier?: {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
  };
  supplier_quotation?: SupplierQuotation;
  items?: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderData {
  requisition_id: number;
  type: PurchaseOrderType;
  title: string;
  description?: string;
  issue_date?: string;
  expected_delivery_date?: string;
  delivery_address?: string;
  delivery_contact?: string;
  delivery_phone?: string;
  delivery_email?: string;
  payment_terms?: string;
  delivery_terms?: string;
  special_conditions?: string;
  terms_and_conditions?: string;
  validity_period_days?: number;
  contract_number?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  currency?: string;
  generate_contract?: boolean;
  items: {
    requisition_item_id: number;
    item_name: string;
    description?: string;
    unit_of_measure?: string;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
    discount_rate?: number;
    delivery_days?: number;
    warranty_months?: number;
    specifications?: string;
    brand?: string;
    model?: string;
  }[];
  metadata?: Record<string, any>;
}

export interface UpdatePurchaseOrderData {
  title?: string;
  description?: string;
  expected_delivery_date?: string;
  delivery_address?: string;
  delivery_contact?: string;
  delivery_phone?: string;
  delivery_email?: string;
  payment_terms?: string;
  delivery_terms?: string;
  special_conditions?: string;
  terms_and_conditions?: string;
  validity_period_days?: number;
  metadata?: Record<string, any>;
}

export interface PurchaseOrderFilters {
  requisition_id?: number;
  supplier_id?: number;
  type?: PurchaseOrderType;
  status?: PurchaseOrderStatus | PurchaseOrderStatus[];
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface PurchaseOrderSummary {
  purchase_order: {
    id: number;
    po_number: string;
    type: string;
    status: string;
    total_amount: string;
    issue_date: string;
    expected_delivery: string;
  };
  supplier: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  items: {
    id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    received_quantity: number;
    status: string;
    is_fully_received: boolean;
  }[];
  delivery_progress: number;
  is_overdue: boolean;
  approvals: {
    generated_by: string;
    checked_by: string | null;
    endorsed_by: string | null;
    approved_by: string | null;
  };
  timeline: {
    generated_at: string;
    issued_at: string | null;
    sent_at: string | null;
    acknowledged_at: string | null;
    completed_at: string | null;
  };
}

export type PurchaseOrderResponse = ApiResponse<PurchaseOrder>;
export type PurchaseOrderListResponse = ApiResponse<PaginatedResponse<PurchaseOrder>>;
export type PurchaseOrderSummaryResponse = ApiResponse<PurchaseOrderSummary>;
