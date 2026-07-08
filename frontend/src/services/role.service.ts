import { privateApi, publicApi } from './api';

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
  users_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface AvailableRole {
  value: string;
  label: string;
  requires_department: boolean;
}

export class RoleService {
  /**
   * Get available roles for registration dropdown (public)
   */
  static async getAvailableRoles(): Promise<{ success: boolean; data: AvailableRole[] }> {
    return publicApi.get('/roles/available');
  }

  /**
   * Get all roles (Admin only)
   */
  static async getRoles(): Promise<{ success: boolean; data: Role[] }> {
    return privateApi.get('/admin/roles');
  }

  /**
   * Get role by ID (Admin only)
   */
  static async getRole(id: number): Promise<{ success: boolean; data: Role }> {
    return privateApi.get(`/admin/roles/${id}`);
  }

  /**
   * Create role (Admin only)
   */
  static async createRole(data: { name: string; permissions?: string[] }): Promise<{ success: boolean; data: Role }> {
    return privateApi.post('/admin/roles', data);
  }

  /**
   * Update role (Admin only)
   */
  static async updateRole(id: number, data: { name: string; permissions?: string[] }): Promise<{ success: boolean; data: Role }> {
    return privateApi.put(`/admin/roles/${id}`, data);
  }

  /**
   * Delete role (Admin only)
   */
  static async deleteRole(id: number): Promise<{ success: boolean; message: string }> {
    return privateApi.delete(`/admin/roles/${id}`);
  }

  /**
   * Get all permissions (Admin only)
   */
  static async getPermissions(): Promise<{ success: boolean; data: Permission[] }> {
    return privateApi.get('/admin/roles/permissions');
  }

  /**
   * Get permissions grouped by module (Admin only)
   */
  static async getPermissionsGrouped(): Promise<{ success: boolean; data: Record<string, Permission[]> }> {
    return privateApi.get('/admin/roles/permissions/grouped');
  }

  /**
   * Assign permissions to role (Admin only)
   */
  static async assignPermissions(id: number, permissions: string[]): Promise<{ success: boolean; data: Role }> {
    return privateApi.post(`/admin/roles/${id}/permissions`, { permissions });
  }
}
