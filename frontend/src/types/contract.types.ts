// frontend/src/types/contract.types.ts

import { ApiResponse, PaginatedResponse } from './common.types';

export type ContractStatus = 'draft' | 'active' | 'completed' | 'expired' | 'terminated' | 'suspended';

export interface Contract {
  id: number;
  requisition_id: number;
  purchase_order_id: number | null;
  supplier_id: number;
  contract_number: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  contract_value: number;
  formatted_contract_value: string;
  terms_and_conditions: string | null;
  deliverables: string | null;
  scope_of_work: string | null;
  payment_schedule: string | null;
  penalty_clauses: string | null;
  termination_clauses: string | null;
  status: ContractStatus;
  status_label: string;
  status_color: string;
  is_active: boolean;
  is_expired: boolean;
  is_completed: boolean;
  is_terminated: boolean;
  days_remaining: number;
  is_renewable: boolean;
  is_renewable_label: string;
  renewal_period_months: number | null;
  renewal_count: number;
  last_renewal_date: string | null;
  next_renewal_date: string | null;
  created_by: number;
  approved_by: number | null;
  approved_at: string | null;
  completed_at: string | null;
  terminated_at: string | null;
  termination_reason: string | null;
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
  created_by_user?: {
    full_name: string;
  };
  approved_by_user?: {
    full_name: string;
  };
}

export interface CreateContractData {
  requisition_id: number;
  supplier_id: number;
  purchase_order_id?: number;
  contract_number?: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  contract_value: number;
  terms_and_conditions?: string;
  deliverables?: string;
  scope_of_work?: string;
  payment_schedule?: string;
  penalty_clauses?: string;
  termination_clauses?: string;
  is_renewable?: boolean;
  renewal_period_months?: number;
  metadata?: Record<string, any>;
}

export interface ContractFilters {
  requisition_id?: number;
  supplier_id?: number;
  status?: ContractStatus | ContractStatus[];
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface ContractSummary {
  contract: {
    id: number;
    contract_number: string;
    title: string;
    status: string;
    value: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    is_expired: boolean;
    days_remaining: number;
    is_renewable: string;
    renewal_count: number;
  };
  supplier: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  terms: {
    scope_of_work: string | null;
    deliverables: string | null;
    payment_schedule: string | null;
    penalty_clauses: string | null;
    termination_clauses: string | null;
  };
  approvals: {
    created_by: string;
    created_at: string;
    approved_by: string | null;
    approved_at: string | null;
  };
  timeline: {
    activated_at: string;
    completed_at: string | null;
    terminated_at: string | null;
    last_renewal: string | null;
    next_renewal: string | null;
  };
}

export type ContractResponse = ApiResponse<Contract>;
export type ContractListResponse = ApiResponse<PaginatedResponse<Contract>>;
export type ContractSummaryResponse = ApiResponse<ContractSummary>;
