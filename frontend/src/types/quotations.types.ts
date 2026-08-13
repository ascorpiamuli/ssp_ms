// frontend/src/types/quotations.types.ts

import { ApiResponse, PaginatedResponse } from './common.types';
import { Requisition } from './requisition.types';

// ============================================
// ENUMS
// ============================================

export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'responded'
  | 'evaluating'
  | 'closed'
  | 'cancelled'
  | 'expired';

export type QuotationStatusInfo = {
  value: QuotationStatus;
  label: string;
  color: string;
};

// ============================================
// USER TYPE (matches API response)
// ============================================

export interface QuotationUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  department_id: number | null;
  is_active: boolean;
}

// ============================================
// QUOTATION REQUEST (matches API response)
// ============================================

export interface QuotationRequest {
  id: number;
  requisition_id: number;
  qtn_number: string;
  title: string;
  description: string | null;
  issue_date: string;
  sent_suppliers_count:number,

  closing_date: string;
  closing_time: string | null;
  delivery_terms: string | null;
  payment_terms: string | null;
  special_conditions: string | null;
  instructions: string | null;
  status: QuotationStatus;
  status_label: string;
  status_color: string;
  sent_to_suppliers: number[] | null;
  responded_suppliers: number[] | null;
  declined_suppliers: number[] | null;
  is_automated: boolean;
  is_tender: boolean;
  tender_number: string | null;
  generated_by: QuotationUser | number;
  approved_by: number | null;
  approved_at: string | null;
  sent_at: string | null;
  closed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  reminder_days: number;
  response_count: number;
  response_rate: number;
  is_expired: boolean;
  is_closing_soon: boolean;
  can_respond: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Relations
  requisition?: Requisition;
  supplier_quotations?: SupplierQuotation[];
  // Formatted fields
  formatted_issue_date?: string;
  formatted_closing_date?: string;
}

// ============================================
// SUPPLIER QUOTATION ITEM
// ============================================

export interface SupplierQuotationItem {
  id: number;
  supplier_quotation_id: number;
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
  delivery_days: number | null;
  warranty_months: number | null;
  specifications: string | null;
  brand: string | null;
  model: string | null;
  is_alternative: boolean;
  is_alternative_label: string;
  alternative_notes: string | null;
  notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// SUPPLIER QUOTATION (Response)
// ============================================

export interface SupplierQuotation {
  id: number;
  quotation_request_id: number;
  supplier_id: number;
  supplier?: {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    company_name?: string;
  };
  quotation_number: string;
  supplier_reference_no: string | null;
  submission_date: string;
  validity_date: string;
  delivery_time: string | null;
  payment_terms: string | null;
  delivery_terms: string | null;
  warranty_terms: string | null;
  total_amount: number;
  formatted_total_amount: string;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  formatted_net_amount: string;
  currency: string;
  exchange_rate: number;
  total_amount_base_currency: number | null;
  status: 'pending' | 'submitted' | 'evaluated' | 'accepted' | 'rejected' | 'cancelled';
  status_label: string;
  status_color: string;
  is_lowest: boolean;
  is_valid: boolean;
  submission_method: 'system' | 'upload' | 'manual';
  submission_method_label: string;
  uploaded_file_path: string | null;
  original_filename: string | null;
  file_hash: string | null;
  is_data_extracted: boolean;
  extracted_data: Record<string, any> | null;
  manual_entry_notes: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_status_label: string;
  verification_notes: string | null;
  evaluated_by: number | null;
  evaluated_at: string | null;
  evaluation_notes: string | null;
  evaluation_score: number | null;
  notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  items?: SupplierQuotationItem[];
}

// ============================================
// REQUEST TYPES
// ============================================

export interface CreateQuotationData {
  requisition_id: number;
  title: string;
  description?: string;
  issue_date?: string;
  closing_date?: string;
  closing_time?: string;
  delivery_terms?: string;
  payment_terms?: string;
  special_conditions?: string;
  instructions?: string;
  is_automated?: boolean;
  is_tender?: boolean;
  tender_number?: string;
  reminder_days?: number;
  supplier_ids: number[];
  metadata?: Record<string, any>;
}

export interface UpdateQuotationData {
  title?: string;
  description?: string;
  closing_date?: string;
  closing_time?: string;
  delivery_terms?: string;
  payment_terms?: string;
  special_conditions?: string;
  instructions?: string;
  reminder_days?: number;
  metadata?: Record<string, any>;
}

export interface SendQuotationData {
  supplier_ids: number[];
}

export interface CancelQuotationData {
  reason: string;
}

export interface SelectSupplierData {
  requisition_id: number;
  supplier_id: number;
  quotation_id: number;
}

// ============================================
// FILTERS
// ============================================

export interface QuotationFilters {
  status?: QuotationStatus | QuotationStatus[];
  requisition_id?: number;
  generated_by?: number;
  is_tender?: boolean;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  search?: string; // Added search property
}

// ============================================
// STATISTICS
// ============================================

export interface QuotationStatistics {
  total: number;
  draft: number;
  sent: number;
  responded: number;
  evaluating: number;
  closed: number;
  cancelled: number;
  expired: number;
  response_rate: number;
  average_response_time: number | null;
  total_quotations_received: number;
  lowest_quotation_amount: number | null;
  highest_quotation_amount: number | null;
  average_quotation_amount: number | null;
}

// ============================================
// RESPONSE TYPES
// ============================================

export type QuotationResponse = ApiResponse<QuotationRequest>;
export type QuotationListResponse = ApiResponse<PaginatedResponse<QuotationRequest>>;
export type SupplierQuotationResponse = ApiResponse<SupplierQuotation>;
export type SupplierQuotationListResponse = ApiResponse<PaginatedResponse<SupplierQuotation>>;
export type QuotationStatisticsResponse = ApiResponse<QuotationStatistics>;
