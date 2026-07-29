// frontend/src/services/contract.service.ts

import { api } from './api';
import type {
  Contract,
  ContractFilters,
  ContractSummary,
  CreateContractData,
} from '@/types/contract.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/contracts';

export const contractService = {
  /**
   * Get all contracts with filters
   */
  getAll: async (filters?: ContractFilters): Promise<PaginatedResponse<Contract>> => {
    return api.get<PaginatedResponse<Contract>>(BASE_URL, { params: filters });
  },

  /**
   * Get contract by ID
   */
  getById: async (id: number): Promise<Contract> => {
    return api.get<Contract>(`${BASE_URL}/${id}`);
  },

  /**
   * Get contract summary
   */
  getSummary: async (id: number): Promise<ContractSummary> => {
    return api.get<ContractSummary>(`${BASE_URL}/${id}/summary`);
  },

  /**
   * Create a new contract
   */
  create: async (data: CreateContractData): Promise<Contract> => {
    return api.post<Contract>(BASE_URL, data);
  },

  /**
   * Approve a contract
   */
  approve: async (id: number): Promise<Contract> => {
    return api.post<Contract>(`${BASE_URL}/${id}/approve`);
  },

  /**
   * Activate a contract
   */
  activate: async (id: number): Promise<Contract> => {
    return api.post<Contract>(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Complete a contract
   */
  complete: async (id: number): Promise<Contract> => {
    return api.post<Contract>(`${BASE_URL}/${id}/complete`);
  },

  /**
   * Terminate a contract
   */
  terminate: async (id: number, reason: string): Promise<Contract> => {
    return api.post<Contract>(`${BASE_URL}/${id}/terminate`, { reason });
  },

  /**
   * Suspend a contract
   */
  suspend: async (id: number, reason: string): Promise<Contract> => {
    return api.post<Contract>(`${BASE_URL}/${id}/suspend`, { reason });
  },

  /**
   * Renew a contract
   */
  renew: async (id: number): Promise<Contract> => {
    return api.post<Contract>(`${BASE_URL}/${id}/renew`);
  },

  /**
   * Get expiring contracts
   */
  getExpiring: async (days: number = 30): Promise<Contract[]> => {
    return api.get<Contract[]>(`${BASE_URL}/expiring`, { params: { days } });
  },

  /**
   * Get renewable contracts
   */
  getRenewable: async (): Promise<Contract[]> => {
    return api.get<Contract[]>(`${BASE_URL}/renewable`);
  },

  /**
   * Get active contracts
   */
  getActive: async (): Promise<Contract[]> => {
    return api.get<Contract[]>(BASE_URL);
  },

  /**
   * Get contract PDF
   */
  getPdf: async (id: number): Promise<{ pdf: string }> => {
    return api.get<{ pdf: string }>(`${BASE_URL}/${id}/pdf`);
  },

  /**
   * Get contracts by requisition
   */
  getByRequisition: async (requisitionId: number): Promise<Contract[]> => {
    return api.get<Contract[]>(BASE_URL, { params: { requisition_id: requisitionId } });
  },

  /**
   * Get contracts by supplier
   */
  getBySupplier: async (supplierId: number): Promise<Contract[]> => {
    return api.get<Contract[]>(BASE_URL, { params: { supplier_id: supplierId } });
  },
};
