// frontend/src/types/supplierQuotation.types.ts

import { ApiResponse, PaginatedResponse } from './common.types';
import { QuotationRequest } from './quotations.types';

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

export interface SupplierQuotation {
  id: number;
  quotation_request_id: number;
  supplier_id: number;
  quotation_number: string;
  supplier_reference_no: string | null;
  submission_date: string;
  validity_date: string;
  delivery_time: string | null;
  payment_terms: string | null;
  delivery_terms: string | null;
  warranty_terms: string | null;
  total_amount: number;
  download_count:number,
  upload:string,
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

  // Relationships
  quotation_request?: QuotationRequest;
  supplier?: {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
  };
  items?: SupplierQuotationItem[];
}

export interface CreateSupplierQuotationData {
  quotation_request_id: number;
  supplier_id: number;
  supplier_reference_no?: string;
  submission_date?: string;
  validity_date?: string;
  delivery_time?: string;
  payment_terms?: string;
  delivery_terms?: string;
  warranty_terms?: string;
  currency?: string;
  submission_method?: 'system' | 'upload' | 'manual';
  uploaded_file_path?: string;
  original_filename?: string;
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
    is_alternative?: boolean;
    alternative_notes?: string;
  }[];
  notes?: string;
  metadata?: Record<string, any>;
}

export interface VerifySupplierQuotationData {
  status: 'verified' | 'rejected';
  notes?: string;
}

export interface EvaluateSupplierQuotationData {
  score: number;
  notes?: string;
}

export interface SupplierQuotationFilters {
  quotation_request_id?: number;
  supplier_id?: number;
  status?: string;
  verification_status?: string;
  is_lowest?: boolean;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export type SupplierQuotationResponse = ApiResponse<SupplierQuotation>;
export type SupplierQuotationListResponse = ApiResponse<PaginatedResponse<SupplierQuotation>>;
