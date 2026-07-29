// frontend/src/types/payment.types.ts

import { ApiResponse, PaginatedResponse } from './common.types';

export type PaymentVoucherStatus = 'draft' | 'endorsed' | 'approved' | 'paid' | 'cancelled';
export type PaymentMethod = 'cheque' | 'bank_transfer' | 'cash' | 'mobile_money';
export type ChequeStatus = 'issued' | 'cashed' | 'cancelled' | 'void' | 'stopped';

export interface PaymentVoucher {
  id: number;
  requisition_id: number;
  invoice_id: number;
  purchase_order_id: number;
  supplier_id: number;
  voucher_number: string;
  payee_name: string;
  payee_address: string | null;
  payee_phone: string | null;
  payee_email: string | null;
  amount: number;
  formatted_amount: string;
  amount_words: string | null;
  bank_name: string | null;
  account_number: string | null;
  bank_branch: string | null;
  cheque_number: string | null;
  payment_date: string | null;
  payment_description: string | null;
  payment_method: PaymentMethod;
  payment_method_label: string;
  transaction_reference: string | null;
  status: PaymentVoucherStatus;
  status_label: string;
  status_color: string;
  is_endorsed: boolean;
  is_approved: boolean;
  is_paid: boolean;
  prepared_by: number;
  endorsed_by: number | null;
  approved_by: number | null;
  endorsed_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  digital_signature_endorsement: string | null;
  digital_signature_approval: string | null;
  digital_signature_preparer: string | null;
  notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Relationships
  supplier?: {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
  };
  invoice?: {
    id: number;
    invoice_number: string;
    total_amount: number;
  };
  cheque?: Cheque;
  prepared_by_user?: {
    full_name: string;
  };
  endorsed_by_user?: {
    full_name: string;
  };
  approved_by_user?: {
    full_name: string;
  };
}

export interface Cheque {
  id: number;
  payment_voucher_id: number;
  cheque_number: string;
  payee_name: string;
  payee_address: string | null;
  amount: number;
  formatted_amount: string;
  amount_words: string | null;
  issued_date: string;
  status: ChequeStatus;
  status_label: string;
  status_color: string;
  bank_name: string | null;
  account_number: string | null;
  bank_branch: string | null;
  bank_sort_code: string | null;
  recorded_by: number;
  received_by: number | null;
  received_at: string | null;
  cashed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Relationships
  payment_voucher?: PaymentVoucher;
}

export interface CreatePaymentData {
  invoice_id: number;
  payee_name: string;
  payee_address?: string;
  payee_phone?: string;
  payee_email?: string;
  amount_words?: string;
  bank_name?: string;
  account_number?: string;
  bank_branch?: string;
  payment_method: PaymentMethod;
  payment_description?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CreateChequeData {
  invoice_id: number;
  payee_name: string;
  payee_address?: string;
  amount_words?: string;
  bank_name?: string;
  account_number?: string;
  bank_branch?: string;
  bank_sort_code?: string;
  cheque_number?: string;
  issued_date?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface PaymentFilters {
  invoice_id?: number;
  supplier_id?: number;
  status?: PaymentVoucherStatus | PaymentVoucherStatus[];
  payment_method?: PaymentMethod;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface PaymentSummary {
  voucher: {
    id: number;
    voucher_number: string;
    status: string;
    amount: string;
    payment_method: string;
    cheque_number: string | null;
    payment_date: string | null;
  };
  payee: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
  };
  bank: {
    name: string | null;
    account: string | null;
    branch: string | null;
  };
  invoice: {
    id: number;
    invoice_number: string;
  };
  approvals: {
    prepared_by: string;
    prepared_at: string;
    endorsed_by: string | null;
    endorsed_at: string | null;
    approved_by: string | null;
    approved_at: string | null;
    paid_at: string | null;
  };
  cheque: {
    cheque_number: string;
    status: string;
    issued_date: string;
    cashed_at: string | null;
  } | null;
}

export type PaymentVoucherResponse = ApiResponse<PaymentVoucher>;
export type PaymentVoucherListResponse = ApiResponse<PaginatedResponse<PaymentVoucher>>;
export type ChequeResponse = ApiResponse<Cheque>;
export type PaymentSummaryResponse = ApiResponse<PaymentSummary>;
