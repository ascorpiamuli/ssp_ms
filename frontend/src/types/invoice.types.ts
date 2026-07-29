// frontend/src/types/invoice.types.ts

import { ApiResponse, PaginatedResponse } from './common.types';
import { PurchaseOrder } from './purchaseOrder.types';
import { GoodsReceivedNote } from './goodsReceived.types';

export type InvoiceStatus = 'pending' | 'verified' | 'approved' | 'paid' | 'disputed' | 'cancelled';
export type MatchingStatus = 'pending' | 'matched' | 'partial' | 'mismatch' | 'not_applicable';

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  purchase_order_item_id: number | null;
  goods_received_item_id: number | null;
  requisition_item_id: number;
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
  notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  requisition_id: number;
  purchase_order_id: number;
  goods_received_note_id: number | null;
  service_acknowledgment_note_id: number | null;
  supplier_id: number;
  invoice_number: string;
  customer_invoice_no: string;
  invoice_date: string;
  due_date: string;
  description: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  formatted_total_amount: string;
  currency: string;
  exchange_rate: number;
  total_amount_base_currency: number | null;
  payment_reference: string | null;
  bank_name: string | null;
  bank_account: string | null;
  status: InvoiceStatus;
  status_label: string;
  status_color: string;
  matching_status: MatchingStatus;
  matching_status_label: string;
  matching_status_color: string;
  matching_notes: string | null;
  is_overdue: boolean;
  days_overdue: number;
  is_credit_note: boolean;
  credit_note_reference: string | null;
  payment_terms: string | null;
  notes: string | null;
  matched_by: number | null;
  matched_at: string | null;
  verified_by: number | null;
  verified_at: string | null;
  approved_by: number | null;
  approved_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Relationships
  purchase_order?: PurchaseOrder;
  goods_received_note?: GoodsReceivedNote;
  supplier?: {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
  };
  items?: InvoiceItem[];
}

export interface CreateInvoiceData {
  purchase_order_id: number;
  supplier_id: number;
  customer_invoice_no: string;
  invoice_date?: string;
  due_date?: string;
  description?: string;
  currency?: string;
  exchange_rate?: number;
  payment_reference?: string;
  bank_name?: string;
  bank_account?: string;
  payment_terms?: string;
  items: {
    purchase_order_item_id?: number;
    goods_received_item_id?: number;
    requisition_item_id: number;
    item_name: string;
    description?: string;
    unit_of_measure?: string;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
    discount_rate?: number;
  }[];
  notes?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceFilters {
  purchase_order_id?: number;
  supplier_id?: number;
  status?: InvoiceStatus | InvoiceStatus[];
  matching_status?: MatchingStatus | MatchingStatus[];
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface InvoiceSummary {
  invoice: {
    id: number;
    invoice_number: string;
    customer_invoice_no: string;
    status: string;
    total_amount: string;
    invoice_date: string;
    due_date: string;
    is_overdue: boolean;
    days_overdue: number;
  };
  purchase_order: {
    id: number;
    po_number: string;
    type: string;
  };
  supplier: {
    id: number;
    name: string;
    email: string;
  };
  matching: {
    status: string;
    notes: string | null;
    matched_at: string | null;
    matched_by: string | null;
  };
  approvals: {
    verified_at: string | null;
    verified_by: string | null;
    approved_at: string | null;
    approved_by: string | null;
  };
  items: {
    id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    tax_amount: number;
    net_price: number;
  }[];
}

export interface MatchingStatusResponse {
  status: MatchingStatus;
  status_label: string;
  notes: string | null;
  po_total: number;
  grn_total: number;
  invoice_total: number;
  is_matched: boolean;
  matched_at: string | null;
  matched_by: string | null;
}

export type InvoiceResponse = ApiResponse<Invoice>;
export type InvoiceListResponse = ApiResponse<PaginatedResponse<Invoice>>;
export type InvoiceSummaryResponse = ApiResponse<InvoiceSummary>;
export type MatchingStatusResponseData = ApiResponse<MatchingStatusResponse>;
