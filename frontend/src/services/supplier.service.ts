import { privateApi, publicApi } from './api';

export interface Supplier {
  id: number;
  user_id: number;
  company_name: string;
  company_email: string;
  company_phone?: string;
  company_registration: string;
  company_address: string;
  company_website?: string;
  tax_id?: string;
  category: 'goods' | 'services' | 'both';
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
  blacklist_reason?: string;
  blacklisted_at?: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
  };
  created_by?: {
    id: number;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SupplierCategory {
  value: string;
  label: string;
}

export class SupplierService {
  /**
   * Get supplier categories (public)
   */
  static async getCategories(): Promise<{ success: boolean; data: SupplierCategory[] }> {
    return publicApi.get('/supplier-categories');
  }

  /**
   * Get active suppliers (authenticated)
   */
  static async getActiveSuppliers(): Promise<{ success: boolean; data: Supplier[] }> {
    return privateApi.get('/suppliers/active');
  }

  /**
   * Get all suppliers (authenticated)
   */
  static async getSuppliers(): Promise<{ success: boolean; data: Supplier[] }> {
    return privateApi.get('/suppliers');
  }

  /**
   * Get supplier by ID
   */
  static async getSupplier(id: number): Promise<{ success: boolean; data: Supplier }> {
    return privateApi.get(`/suppliers/${id}`);
  }

  /**
   * Create supplier
   */
  static async createSupplier(data: Partial<Supplier>): Promise<{ success: boolean; data: Supplier }> {
    return privateApi.post('/suppliers', data);
  }

  /**
   * Update supplier
   */
  static async updateSupplier(id: number, data: Partial<Supplier>): Promise<{ success: boolean; data: Supplier }> {
    return privateApi.put(`/suppliers/${id}`, data);
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(id: number): Promise<{ success: boolean; message: string }> {
    return privateApi.delete(`/suppliers/${id}`);
  }

  /**
   * Blacklist supplier
   */
  static async blacklistSupplier(id: number, reason: string): Promise<{ success: boolean; data: Supplier }> {
    return privateApi.post(`/suppliers/${id}/blacklist`, { reason });
  }

  /**
   * Unblacklist supplier
   */
  static async unblacklistSupplier(id: number): Promise<{ success: boolean; data: Supplier }> {
    return privateApi.post(`/suppliers/${id}/unblacklist`);
  }

  /**
   * Get supplier stats
   */
  static async getSupplierStats(): Promise<{ success: boolean; data: any }> {
    return privateApi.get('/suppliers/stats');
  }
}
