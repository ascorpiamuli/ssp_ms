// frontend/src/types/goodsReceived.types.ts

import { ApiResponse, PaginatedResponse } from './common.types';
import { PurchaseOrder } from './purchaseOrder.types';

export type GRNStatus =
  | 'draft'
  | 'submitted'
  | 'hod_approved'
  | 'principal_approved'
  | 'completed'
  | 'rejected';

export type InspectionResult = 'pending' | 'passed' | 'failed' | 'partial';
export type QualityStatus = 'pending' | 'passed' | 'failed' | 'conditional';
export type ApprovalLevel = 'hod' | 'principal';
export type QualityRating = 'excellent' | 'good' | 'average' | 'poor';

export interface GoodsReceivedItem {
  id: number;
  goods_received_note_id: number;
  purchase_order_item_id: number;
  requisition_item_id: number;
  item_name: string;
  description: string | null;
  unit_of_measure: string | null;
  ordered_quantity: number;
  formatted_ordered_quantity: string;
  received_quantity: number;
  formatted_received_quantity: string;
  accepted_quantity: number;
  formatted_accepted_quantity: string;
  rejected_quantity: number;
  formatted_rejected_quantity: string;
  unit_price: number;
  formatted_unit_price: string;
  total_value: number;
  formatted_total_value: string;
  rejection_reason: string | null;
  condition_notes: string | null;
  quality_status: QualityStatus;
  quality_status_label: string;
  quality_status_color: string;
  quality_notes: string | null;
  batch_number: string | null;
  serial_numbers: string[] | null;
  expiry_date: string | null;
  manufacturing_date: string | null;
  warranty_start_date: string | null;
  warranty_end_date: string | null;
  storage_location: string | null;
  bin_number: string | null;
  rack_number: string | null;
  is_quarantined: boolean;
  is_quarantined_label: string;
  quarantine_reason: string | null;
  quarantine_end_date: string | null;
  acceptance_rate: number;
  is_fully_accepted: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface GoodsReceivedNote {
  id: number;
  requisition_id: number;
  purchase_order_id: number;
  grn_number: string;
  reference_number: string | null;
  received_date: string;
  received_time: string | null;
  received_by: number;
  inspected_by: number | null;
  inspected_at: string | null;
  inspection_notes: string | null;
  inspection_result: InspectionResult;
  inspection_result_label: string;
  inspection_result_color: string;
  total_quantity: number;
  total_value: number;
  formatted_total_value: string;
  total_tax: number;
  total_discount: number;
  net_total: number;
  delivery_note_number: string | null;
  carrier: string | null;
  waybill_number: string | null;
  vehicle_number: string | null;
  delivery_condition: string | null;
  status: GRNStatus;
  status_label: string;
  status_color: string;
  is_approved: boolean;
  is_pending_approval: boolean;
  approval_level: ApprovalLevel;
  approval_level_label: string;
  hod_approved_by: number | null;
  hod_approved_at: string | null;
  principal_approved_by: number | null;
  principal_approved_at: string | null;
  returned_at: string | null;
  return_reason: string | null;
  additional_notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Relationships
  purchase_order?: PurchaseOrder;
  items?: GoodsReceivedItem[];
}

export interface ServiceAcknowledgmentNote {
  id: number;
  requisition_id: number;
  purchase_order_id: number;
  san_number: string;
  reference_number: string | null;
  acknowledgment_date: string;
  acknowledgment_time: string | null;
  acknowledged_by: number;
  service_start_date: string | null;
  service_end_date: string | null;
  service_provider: string | null;
  service_description: string | null;
  service_deliverables: string | null;
  total_value: number;
  total_tax: number;
  total_discount: number;
  net_total: number;
  quality_notes: string | null;
  performance_notes: string | null;
  quality_rating: QualityRating | null;
  quality_rating_label: string;
  quality_rating_color: string;
  status: GRNStatus;
  status_label: string;
  status_color: string;
  is_approved: boolean;
  is_pending_approval: boolean;
  approval_level: ApprovalLevel;
  approval_level_label: string;
  hod_approved_by: number | null;
  hod_approved_at: string | null;
  principal_approved_by: number | null;
  principal_approved_at: string | null;
  returned_at: string | null;
  return_reason: string | null;
  additional_notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Relationships
  purchase_order?: PurchaseOrder;
}

export interface CreateGoodsReceivedData {
  purchase_order_id: number;
  type: 'grn' | 'san';
  received_date?: string;
  received_time?: string;
  reference_number?: string;
  delivery_note_number?: string;
  carrier?: string;
  waybill_number?: string;
  vehicle_number?: string;
  delivery_condition?: string;
  service_description?: string;
  service_start_date?: string;
  service_end_date?: string;
  service_provider?: string;
  service_deliverables?: string;
  approval_level?: ApprovalLevel;
  items?: {
    purchase_order_item_id: number;
    received_quantity: number;
    rejected_quantity?: number;
    rejection_reason?: string;
    condition_notes?: string;
    batch_number?: string;
    serial_numbers?: string[];
    expiry_date?: string;
    manufacturing_date?: string;
    warranty_start_date?: string;
    warranty_end_date?: string;
    storage_location?: string;
    bin_number?: string;
    rack_number?: string;
    is_quarantined?: boolean;
    quarantine_reason?: string;
  }[];
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CreateServiceAcknowledgmentItemData {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

/**
 * Payload for creating a Service Acknowledgment Note (SAN).
 * SANs describe services rendered, so their line items are free-form
 * (description / quantity / unit price) rather than PO-item based like GRNs.
 */
export interface CreateServiceAcknowledgmentData {
  purchase_order_id: number;
  requisition_id?: number;
  received_date?: string;
  received_time?: string;
  service_quality_rating?:number;
  notes: string;
  supplier_id?: number;
  service_quality_notes?: string;
  service_performance_notes?: string;
  acknowledged_by?: number;
  san_number?: string;
  reference_number?: string;
  acknowledgment_date: string;
  acknowledgment_time?: string;
  service_description: string;
  service_provider?: string;
  service_start_date?: string;
  service_end_date?: string;
  service_deliverables?: string;
  quality_rating?: number;
  quality_notes?: string;
  performance_notes?: string;
  approval_level?: string;
  additional_notes?: string;
  status?: string;
  total_value?: number;
  total_tax?: number;
  total_discount?: number;
  net_total?: number;
  items: CreateServiceAcknowledgmentItemData[];
  metadata?: Record<string, any>;
}

export interface InspectGoodsData {
  inspection_result: InspectionResult;
  inspection_notes?: string;
  items?: {
    id: number;
    quality_status: QualityStatus;
    quality_notes?: string;
  }[];
}

export interface RateServiceData {
  quality_rating: QualityRating;
  quality_notes?: string;
  performance_notes?: string;
}

export interface GoodsReceivedFilters {
  purchase_order_id?: number;
  status?: GRNStatus | GRNStatus[];
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface GRNSummary {
  grn: {
    id: number;
    grn_number: string;
    status: string;
    received_date: string;
    total_value: string;
    approval_level: string;
  };
  purchase_order: {
    id: number;
    po_number: string;
  };
  items: {
    id: number;
    item_name: string;
    ordered_quantity: number;
    received_quantity: number;
    accepted_quantity: number;
    rejected_quantity: number;
    quality_status: string;
    is_quarantined: boolean;
  }[];
  inspection: {
    result: string;
    notes: string | null;
    inspected_at: string | null;
  };
  approvals: {
    hod_approved_at: string | null;
    principal_approved_at: string | null;
  };
}

export type GoodsReceivedResponse = ApiResponse<GoodsReceivedNote>;
export type GoodsReceivedListResponse = ApiResponse<PaginatedResponse<GoodsReceivedNote>>;
export type ServiceAcknowledgmentResponse = ApiResponse<ServiceAcknowledgmentNote>;
export type GRNSummaryResponse = ApiResponse<GRNSummary>;
