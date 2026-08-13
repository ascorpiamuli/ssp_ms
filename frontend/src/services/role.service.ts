// services/role.service.ts
import { api } from './api'

export interface CreateRoleData {
  name: string
  label?: string
  description?: string
  permissions?: string[]
}

export interface UpdateRoleData {
  name?: string
  label?: string
  description?: string
  permissions?: string[]
}

export interface Role {
  id: number
  name: string
  label: string | null
  description: string | null
  guard_name: string
  permissions?: Permission[]
  permission_count?: number
  created_at: string
  updated_at: string
}

export interface Permission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

export interface AssignPermissionsResponse {
  success: boolean
  message: string
  data: {
    id: number
    name: string
    label: string | null
    description: string | null
    permissions: Array<{
      id: number
      name: string
      guard_name: string
    }>
  }
}

export interface RoleWithDetails {
  id: number
  name: string
  label: string | null
  description: string | null
  guard_name: string
  permissions: string[]
  permission_count: number
  created_at: string
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

  // GET /admin/roles/with-labels (new endpoint for labels)
  static async getRolesWithLabels() {
    console.log('🔍 [RoleService] Fetching roles with labels...')
    try {
      const response = await api.get('/admin/roles/with-labels')
      console.log('✅ [RoleService] Roles with labels:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error fetching roles with labels:', error)
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

  // GET /admin/roles/{id}/with-labels
  static async getRoleWithLabels(id: number) {
    console.log(`🔍 [RoleService] Fetching role ${id} with labels...`)
    try {
      const response = await api.get(`/admin/roles/${id}/with-labels`)
      console.log(`✅ [RoleService] Role ${id} with labels:`, response)
      return response
    } catch (error) {
      console.error(`❌ [RoleService] Error fetching role ${id} with labels:`, error)
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

  // GET /admin/roles/users-with-roles
  static async getUsersWithRoles() {
    console.log('🔍 [RoleService] Fetching users with roles...')
    try {
      const response = await api.get('/admin/roles/users-with-roles')
      console.log('✅ [RoleService] Users with roles:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error fetching users with roles:', error)
      throw error
    }
  }

  // GET /admin/roles/options (for dropdowns)
  static async getRoleOptions() {
    console.log('🔍 [RoleService] Fetching role options...')
    try {
      const response = await api.get('/admin/roles/options')
      console.log('✅ [RoleService] Role options:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error fetching role options:', error)
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

  // POST /admin/roles/{id}/assign-permissions
  static async assignPermissions(id: number, permissions: string[]): Promise<AssignPermissionsResponse> {
    console.log(`🔍 [RoleService] Assigning permissions to role ${id}:`, permissions)

    if (!permissions || !Array.isArray(permissions)) {
      throw new Error('Permissions must be an array of permission names')
    }

    try {
      const response = await api.post(`/admin/roles/${id}/assign-permissions`, { permissions })

      if (response?.data?.success === false) {
        throw new Error(response.data.message || 'Failed to assign permissions')
      }

      console.log(`✅ [RoleService] Permissions assigned to role ${id}:`, response)
      return response.data
    } catch (error: any) {
      console.error(`❌ [RoleService] Error assigning permissions to role ${id}:`, error)

      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to assign permissions'

      throw new Error(errorMessage)
    }
  }

  // POST /admin/roles/{id}/grant-permission
  static async grantPermission(id: number, permission: string) {
    console.log(`🔍 [RoleService] Granting permission "${permission}" to role ${id}...`)
    try {
      const response = await api.post(`/admin/roles/${id}/grant-permission`, { permission })
      console.log(`✅ [RoleService] Permission granted to role ${id}:`, response)
      return response
    } catch (error) {
      console.error(`❌ [RoleService] Error granting permission to role ${id}:`, error)
      throw error
    }
  }

  // POST /admin/roles/{id}/revoke-permission
  static async revokePermission(id: number, permission: string) {
    console.log(`🔍 [RoleService] Revoking permission "${permission}" from role ${id}...`)
    try {
      const response = await api.post(`/admin/roles/${id}/revoke-permission`, { permission })
      console.log(`✅ [RoleService] Permission revoked from role ${id}:`, response)
      return response
    } catch (error) {
      console.error(`❌ [RoleService] Error revoking permission from role ${id}:`, error)
      throw error
    }
  }

  // POST /admin/roles/assign-to-user
  static async assignRoleToUser(data: { user_id: number; role_name: string }) {
    console.log('🔍 [RoleService] Assigning role to user:', data)
    try {
      const response = await api.post('/admin/roles/assign-to-user', data)
      console.log('✅ [RoleService] Role assigned:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error assigning role to user:', error)
      throw error
    }
  }

  // DELETE /admin/roles/remove-role-from-user
  static async removeRoleFromUser(data: { user_id: number; role_name: string }) {
    console.log('🔍 [RoleService] Removing role from user:', data)
    try {
      const response = await api.delete('/admin/roles/remove-role-from-user', { data })
      console.log('✅ [RoleService] Role removed:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error removing role from user:', error)
      throw error
    }
  }

  // GET /admin/roles/search
  static async searchRoles(search: string) {
    console.log('🔍 [RoleService] Searching roles:', search)
    try {
      const response = await api.get('/admin/roles/search', { params: { search } })
      console.log('✅ [RoleService] Search results:', response)
      return response
    } catch (error) {
      console.error('❌ [RoleService] Error searching roles:', error)
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

  // Helper: Get role label with fallback
  static getRoleLabel(role: Role | null): string {
    if (!role) return 'No Role'
    return role.label || role.name.replace(/_/g, ' ')
  }

  // Helper: Get role display name
  static getRoleDisplayName(role: Role | null): string {
    if (!role) return 'No Role Assigned'
    if (role.label) return role.label
    return role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

export default RoleService
