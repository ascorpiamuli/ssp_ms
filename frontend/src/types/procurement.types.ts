// frontend/src/types/procurement.types.ts

import { ApiResponse } from './common.types';

export type ProcurementStatus =
  | 'not_started'
  | 'initiated'
  | 'quotation_in_progress'
  | 'awaiting_quotations'
  | 'evaluating_quotations'
  | 'supplier_selected'
  | 'goods_receipt_pending'
  | 'invoicing_pending'
  | 'payment_pending'
  | 'completed';

export interface ProcurementStatusResponse {
  requisition_id: number;
  reference_number: string;
  is_procurement_created: boolean;
  procurement_created_at: string | null;
  current_status: ProcurementStatus;
  steps: {
    quotation?: {
      status: string;
      qtn_number: string;
      created_at: string;
    };
    purchase_order?: {
      status: string;
      po_number: string;
      type: string;
      created_at: string;
    };
    goods_received?: {
      status: string;
      grn_number: string;
      created_at: string;
    };
    invoice?: {
      status: string;
      invoice_number: string;
      created_at: string;
    };
    payment?: {
      status: string;
      voucher_number: string;
      created_at: string;
    };
  };
}

export interface ProcurementMetrics {
  time_to_start: number | null;
  time_to_complete: number | null;
  total_approvals: number;
  total_quotes: number;
  total_amount_saved: number;
  total_amount_spent: number;
  completion_rate: number;
}

export interface ProcurementTimelineItem {
  action: string;
  action_label: string;
  user: string;
  comment: string | null;
  created_at: string;
}

export interface ProcurementSummary {
  requisition: {
    id: number;
    reference_number: string;
    title: string;
    total_amount: number;
    status: string;
  };
  procurement: ProcurementStatusResponse;
  timeline: ProcurementTimelineItem[];
  metrics: ProcurementMetrics;
}

export interface StartProcurementData {
  requisition_id: number;
}

export interface CancelProcurementData {
  requisition_id: number;
  reason: string;
}

export type ProcurementStatusResponseData = ApiResponse<ProcurementStatusResponse>;
export type ProcurementSummaryResponse = ApiResponse<ProcurementSummary>;
export type ProcurementMetricsResponse = ApiResponse<ProcurementMetrics>;
export type ProcurementTimelineResponse = ApiResponse<ProcurementTimelineItem[]>;
