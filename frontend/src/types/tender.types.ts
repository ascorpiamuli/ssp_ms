// frontend/src/types/tender.types.ts

import { ApiResponse, PaginatedResponse } from './common.types';

export type TenderStatus = 'draft' | 'published' | 'evaluating' | 'awarded' | 'cancelled' | 'expired';

export interface Tender {
  id: number;
  requisition_id: number;
  tender_number: string;
  title: string;
  description: string | null;
  issue_date: string;
  closing_date: string;
  closing_time: string | null;
  tender_document_path: string | null;
  evaluation_criteria: string | null;
  estimated_value: number | null;
  formatted_estimated_value: string | null;
  status: TenderStatus;
  status_label: string;
  status_color: string;
  is_open: boolean;
  is_closed: boolean;
  is_awarded: boolean;
  is_cancelled: boolean;
  days_until_closing: number;
  bidder_count: number;
  bidders: number[] | null;
  awarded_to: number | null;
  awarded_at: string | null;
  awarded_amount: number | null;
  formatted_awarded_amount: string | null;
  award_notes: string | null;
  published_by: number | null;
  published_at: string | null;
  cancelled_by: number | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Relationships
  requisition?: {
    id: number;
    reference_number: string;
    title: string;
  };
  awarded_to_user?: {
    id: number;
    full_name: string;
  };
  published_by_user?: {
    full_name: string;
  };
}

export interface CreateTenderData {
  requisition_id: number;
  tender_number?: string;
  title: string;
  description?: string;
  issue_date?: string;
  closing_date?: string;
  closing_time?: string;
  tender_document_path?: string;
  evaluation_criteria?: string;
  estimated_value?: number;
  bidders?: number[];
  metadata?: Record<string, any>;
}

export interface AwardTenderData {
  supplier_id: number;
  amount: number;
  notes?: string;
}

export interface TenderFilters {
  requisition_id?: number;
  status?: TenderStatus | TenderStatus[];
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface TenderStatistics {
  tender: {
    id: number;
    tender_number: string;
    title: string;
    status: string;
    estimated_value: string;
    issue_date: string;
    closing_date: string;
    is_open: boolean;
    is_expired: boolean;
    days_until_closing: number;
  };
  bidders: {
    total: number;
    list: number[];
  };
  award: {
    awarded_to: number | null;
    awarded_at: string | null;
    awarded_amount: string | null;
    award_notes: string | null;
  } | null;
  timeline: {
    created_at: string;
    published_at: string | null;
    evaluated_at: string | null;
    awarded_at: string | null;
    cancelled_at: string | null;
  };
}

export type TenderResponse = ApiResponse<Tender>;
export type TenderListResponse = ApiResponse<PaginatedResponse<Tender>>;
export type TenderStatisticsResponse = ApiResponse<TenderStatistics>;
