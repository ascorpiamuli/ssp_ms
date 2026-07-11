// services/role.service.ts
import { api } from './api'

export interface CreateRoleData {
  name: string
  description?: string
  permissions?: string[]
}

export interface UpdateRoleData {
  name?: string
  description?: string
  permissions?: string[]
}

export interface AssignPermissionsResponse {
  success: boolean
  message: string
  data: {
    id: number
    name: string
    permissions: Array<{
      id: number
      name: string
      guard_name: string
    }>
  }
}

export class RoleService {
  // GET /roles/available (public)
  static async getAvailableRoles() {
    console.log('🔍 [RoleService] Fetching available roles...')
    try {
      const response = await api.get('/roles/available')
      console.log('✅ [RoleService] Available roles:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error fetching available roles:', error)
      throw error
    }
  }

  // GET /admin/roles
  static async getRoles() {
    console.log('🔍 [RoleService] Fetching all roles...')
    try {
      const response = await api.get('/admin/roles')
      console.log('✅ [RoleService] Roles response:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error fetching roles:', error)
      throw error
    }
  }

  // GET /admin/roles/{id}
  static async getRole(id: number) {
    console.log(`🔍 [RoleService] Fetching role ${id}...`)
    try {
      const response = await api.get(`/admin/roles/${id}`)
      console.log(`✅ [RoleService] Role ${id}:`, response)
      return response
    } catch (error) {
      console.error(`❌ [RoleService] Error fetching role ${id}:`, error)
      throw error
    }
  }

  // GET /admin/roles/stats
  static async getRoleStats() {
    console.log('🔍 [RoleService] Fetching role stats...')
    try {
      const response = await api.get('/admin/roles/stats')
      console.log('✅ [RoleService] Role stats:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error fetching role stats:', error)
      throw error
    }
  }

  // GET /admin/roles/{id}/users
  static async getRoleUsers(id: number) {
    console.log(`🔍 [RoleService] Fetching users for role ${id}...`)
    try {
      const response = await api.get(`/admin/roles/${id}/users`)
      console.log(`✅ [RoleService] Role ${id} users:`, response)
      return response
    } catch (error) {
      console.error(`❌ [RoleService] Error fetching users for role ${id}:`, error)
      throw error
    }
  }

  // POST /admin/roles
  static async createRole(data: CreateRoleData) {
    console.log('🔍 [RoleService] Creating role:', data)
    try {
      const response = await api.post('/admin/roles', data)
      console.log('✅ [RoleService] Role created:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error creating role:', error)
      throw error
    }
  }

  // PUT /admin/roles/{id}
  static async updateRole(id: number, data: UpdateRoleData) {
    console.log(`🔍 [RoleService] Updating role ${id}:`, data)
    try {
      const response = await api.put(`/admin/roles/${id}`, data)
      console.log(`✅ [RoleService] Role ${id} updated:`, response)
      return response
    } catch (error) {
      console.error(`❌ [RoleService] Error updating role ${id}:`, error)
      throw error
    }
  }

  // DELETE /admin/roles/{id}
  static async deleteRole(id: number) {
    console.log(`🔍 [RoleService] Deleting role ${id}...`)
    try {
      const response = await api.delete(`/admin/roles/${id}`)
      console.log(`✅ [RoleService] Role ${id} deleted:`, response)
      return response
    } catch (error) {
      console.error(`❌ [RoleService] Error deleting role ${id}:`, error)
      throw error
    }
  }

  // GET /admin/roles/permissions
  static async getPermissions() {
    console.log('🔍 [RoleService] Fetching all permissions...')
    try {
      const response = await api.get('/admin/roles/permissions')
      console.log('✅ [RoleService] Permissions:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error fetching permissions:', error)
      throw error
    }
  }

  // GET /admin/roles/permissions/grouped
  static async getPermissionsGrouped() {
    console.log('🔍 [RoleService] Fetching grouped permissions...')
    try {
      const response = await api.get('/admin/roles/permissions/grouped')
      console.log('✅ [RoleService] Grouped permissions:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error fetching grouped permissions:', error)
      throw error
    }
  }

  // POST /admin/roles/{id}/permissions
  static async assignPermissions(id: number, permissions: string[]): Promise<AssignPermissionsResponse> {
    console.log(`🔍 [RoleService] Assigning permissions to role ${id}:`, permissions)

    if (!permissions || !Array.isArray(permissions)) {
      throw new Error('Permissions must be an array of permission names')
    }

    try {
      const response = await api.post(`/admin/roles/${id}/permissions`, { permissions })

      // Check if response indicates success
      if (response?.data?.success === false) {
        throw new Error(response.data.message || 'Failed to assign permissions')
      }

      console.log(`✅ [RoleService] Permissions assigned to role ${id}:`, response)
      return response.data
    } catch (error: any) {
      console.error(`❌ [RoleService] Error assigning permissions to role ${id}:`, error)

      // Extract meaningful error message
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to assign permissions'

      throw new Error(errorMessage)
    }
  }

  // POST /admin/assignments/assign-role
  static async assignRoleToUser(data: { user_id: number; role_name: string }) {
    console.log('🔍 [RoleService] Assigning role to user:', data)
    try {
      const response = await api.post('/admin/assignments/assign-role', data)
      console.log('✅ [RoleService] Role assigned:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error assigning role to user:', error)
      throw error
    }
  }

  // POST /admin/assignments/user-roles
  static async updateUserRoles(data: { user_id: number; roles: string[] }) {
    console.log('🔍 [RoleService] Updating user roles:', data)
    try {
      const response = await api.post('/admin/assignments/user-roles', data)
      console.log('✅ [RoleService] User roles updated:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error updating user roles:', error)
      throw error
    }
  }

  // Helper: Extract permission names from role
  static extractPermissionNames(role: any): string[] {
    if (!role) return []
    if (role.permissions && Array.isArray(role.permissions)) {
      return role.permissions.map((p: any) => p.name)
    }
    if (role.permission_names && Array.isArray(role.permission_names)) {
      return role.permission_names
    }
    return []
  }

  // Helper: Compare permission sets
  static arePermissionsEqual(current: string[], newPermissions: string[]): boolean {
    if (current.length !== newPermissions.length) return false
    const sortedCurrent = [...current].sort()
    const sortedNew = [...newPermissions].sort()
    return sortedCurrent.every((perm, index) => perm === sortedNew[index])
  }
}

export default RoleService
