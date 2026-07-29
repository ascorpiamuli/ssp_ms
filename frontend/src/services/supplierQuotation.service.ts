// frontend/src/services/supplierQuotation.service.ts

import { api } from './api';
import type {
  SupplierQuotation,
  SupplierQuotationFilters,
  CreateSupplierQuotationData,
  VerifySupplierQuotationData,
  EvaluateSupplierQuotationData,
} from '@/types/supplierQuotation.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/supplier-quotations';

export const supplierQuotationService = {
  /**
   * Get all supplier quotations with filters
   */
  getAll: async (filters?: SupplierQuotationFilters): Promise<PaginatedResponse<SupplierQuotation>> => {
    return api.get<PaginatedResponse<SupplierQuotation>>(BASE_URL, { params: filters });
  },

  /**
   * Get supplier quotation by ID
   */
  getById: async (id: number): Promise<SupplierQuotation> => {
    return api.get<SupplierQuotation>(`${BASE_URL}/${id}`);
  },

  /**
   * Create a new supplier quotation
   */
  create: async (data: CreateSupplierQuotationData): Promise<SupplierQuotation> => {
    return api.post<SupplierQuotation>(BASE_URL, data);
  },

  /**
   * Verify a supplier quotation
   */
  verify: async (id: number, data: VerifySupplierQuotationData): Promise<SupplierQuotation> => {
    return api.post<SupplierQuotation>(`${BASE_URL}/${id}/verify`, data);
  },

  /**
   * Evaluate a supplier quotation
   */
  evaluate: async (id: number, data: EvaluateSupplierQuotationData): Promise<SupplierQuotation> => {
    return api.post<SupplierQuotation>(`${BASE_URL}/${id}/evaluate`, data);
  },

  /**
   * Get the lowest quotation for a QTN
   */
  getLowest: async (qtnId: number): Promise<SupplierQuotation | null> => {
    return api.get<SupplierQuotation | null>(`${BASE_URL}/lowest/${qtnId}`);
  },

  /**
   * Get quotations by QTN ID
   */
  getByQtn: async (qtnId: number): Promise<SupplierQuotation[]> => {
    return api.get<SupplierQuotation[]>(`${BASE_URL}`, { params: { qtn_id: qtnId } });
  },

  /**
   * Get quotations by supplier ID
   */
  getBySupplier: async (supplierId: number): Promise<SupplierQuotation[]> => {
    return api.get<SupplierQuotation[]>(`${BASE_URL}`, { params: { supplier_id: supplierId } });
  },
};
