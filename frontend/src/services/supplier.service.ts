// services/supplier.service.ts

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

  // New fields
  description?: string;
  established_year?: string;
  employee_count?: string;
  annual_revenue?: string;
  certifications?: string;
  registration_date?: string;
  license_number?: string;

  // Banking Information
  bank_name?: string;
  bank_account?: string;
  bank_branch?: string;
  payment_terms?: string;
  preferred_currency?: string;

  // Contact Person
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;

  // Company Logo
  company_logo?: string;
  company_logo_upload_id?: number;

  // Relationships
  user?: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    avatar_url?: string;
  };
  created_by?: {
    id: number;
    full_name: string;
  };
  blacklisted_by?: {
    id: number;
    full_name: string;
  };
  company_logo_upload?: {
    id: number;
    file_name: string;
    file_url: string;
    file_size: number;
    formatted_size: string;
  };

  // Derived fields from backend
  category_label?: string;
  category_color?: string;
  status_label?: string;
  status_color?: string;
  formatted_annual_revenue?: string;
  certifications_array?: string[];
  banking_summary?: string;
  contact_person_full_name?: string;
  full_address?: string;
  display_name?: string;
  company_logo_url?: string;
  has_company_logo?: boolean;
  is_active?: boolean;
  is_blacklisted?: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface SupplierCategory {
  value: string;
  label: string;
}

export interface SupplierResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class SupplierService {
  /**
   * Get supplier categories (public)
   */
  static async getCategories(): Promise<SupplierResponse<SupplierCategory[]>> {
    return publicApi.get('/supplier-categories');
  }

  /**
   * Get active suppliers (authenticated)
   */
  static async getActiveSuppliers(): Promise<SupplierResponse<Supplier[]>> {
    return privateApi.get('/suppliers/active');
  }

  /**
   * Get all suppliers (authenticated)
   */
  static async getSuppliers(): Promise<SupplierResponse<Supplier[]>> {
    return privateApi.get('/suppliers');
  }

  /**
   * Get supplier by ID
   */
  static async getSupplier(id: number): Promise<SupplierResponse<Supplier>> {
    return privateApi.get(`/suppliers/${id}`);
  }

  /**
   * Get supplier by user ID (for suppliers to view their own profile)
   */
  static async getSupplierByUserId(): Promise<SupplierResponse<Supplier>> {
    return privateApi.get('/suppliers/me');
  }

  /**
   * Create supplier (JSON)
   */
  static async createSupplier(data: Partial<Supplier>): Promise<SupplierResponse<Supplier>> {
    return privateApi.post('/suppliers', data);
  }

  /**
   * Create supplier with file upload (FormData)
   */
  static async createSupplierWithFile(formData: FormData): Promise<SupplierResponse<Supplier>> {
    return privateApi.post('/suppliers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Update supplier (JSON)
   */
  static async updateSupplier(id: number, data: Partial<Supplier>): Promise<SupplierResponse<Supplier>> {
    return privateApi.put(`/suppliers/${id}`, data);
  }

  /**
   * Update supplier with file upload (FormData)
   */
  static async updateSupplierWithFile(id: number, formData: FormData): Promise<SupplierResponse<Supplier>> {
    return privateApi.post(`/suppliers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  static async blacklistSupplier(id: number, reason: string): Promise<SupplierResponse<Supplier>> {
    return privateApi.post(`/suppliers/${id}/blacklist`, { reason });
  }

  /**
   * Unblacklist supplier
   */
  static async unblacklistSupplier(id: number): Promise<SupplierResponse<Supplier>> {
    return privateApi.post(`/suppliers/${id}/unblacklist`);
  }

  /**
   * Get supplier stats
   */
  static async getSupplierStats(): Promise<{ success: boolean; data: any }> {
    return privateApi.get('/suppliers/stats');
  }
}
