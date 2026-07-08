import { privateApi, publicApi } from './api';

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  hod_id?: number;
  hod?: {
    id: number;
    full_name: string;
    email: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentResponse {
  success: boolean;
  data: Department[];
}

export class DepartmentService {
  /**
   * Get all active departments (public - for registration dropdown)
   */
  static async getActiveDepartments(): Promise<DepartmentResponse> {
    return publicApi.get('/departments/active');
  }

  /**
   * Get all departments (authenticated)
   */
  static async getDepartments(): Promise<DepartmentResponse> {
    return privateApi.get('/departments');
  }

  /**
   * Get department by ID
   */
  static async getDepartment(id: number): Promise<{ success: boolean; data: Department }> {
    return privateApi.get(`/departments/${id}`);
  }

  /**
   * Create department (Admin only)
   */
  static async createDepartment(data: Partial<Department>): Promise<{ success: boolean; data: Department }> {
    return privateApi.post('/departments', data);
  }

  /**
   * Update department (Admin only)
   */
  static async updateDepartment(id: number, data: Partial<Department>): Promise<{ success: boolean; data: Department }> {
    return privateApi.put(`/departments/${id}`, data);
  }

  /**
   * Delete department (Admin only)
   */
  static async deleteDepartment(id: number): Promise<{ success: boolean; message: string }> {
    return privateApi.delete(`/departments/${id}`);
  }

  /**
   * Get department stats (Admin only)
   */
  static async getDepartmentStats(): Promise<{ success: boolean; data: any }> {
    return privateApi.get('/departments/stats');
  }
}
