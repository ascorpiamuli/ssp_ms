// services/department.service.ts
import { api } from './api'

export interface CreateDepartmentData {
  name: string
  code: string
  description?: string
}

export interface UpdateDepartmentData {
  name?: string
  code?: string
  description?: string
  is_active?: boolean
}

export interface StaffAssignmentData {
  user_id: number
}

export interface BulkStaffAssignmentData {
  user_ids: number[]
}

export class DepartmentService {
  // ============================================
  // PUBLIC / GENERAL ENDPOINTS
  // ============================================

  // GET /departments/active (public)
  static async getActiveDepartments() {
    console.log('🔍 [DepartmentService] Fetching active departments...')
    try {
      const response = await api.get('/departments/active')
      console.log('✅ [DepartmentService] Active departments fetched:', response)
      return response
    } catch (error) {
      console.error('❌ [DepartmentService] Error fetching active departments:', error)
      throw error
    }
  }

  // GET /departments
  static async getDepartments() {
    console.log('🔍 [DepartmentService] Fetching all departments...')
    try {
      const response = await api.get('/departments')
      console.log('✅ [DepartmentService] Departments fetched:', response)
      return response
    } catch (error) {
      console.error('❌ [DepartmentService] Error fetching departments:', error)
      throw error
    }
  }

  // GET /departments/stats
  static async getDepartmentStats() {
    console.log('🔍 [DepartmentService] Fetching department stats...')
    try {
      const response = await api.get('/departments/stats')
      console.log('✅ [DepartmentService] Department stats fetched:', response)
      return response
    } catch (error) {
      console.error('❌ [DepartmentService] Error fetching department stats:', error)
      throw error
    }
  }

  // GET /departments/{id}
  static async getDepartment(id: number) {
    console.log(`🔍 [DepartmentService] Fetching department ${id}...`)
    try {
      const response = await api.get(`/departments/${id}`)
      console.log(`✅ [DepartmentService] Department ${id} fetched:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error fetching department ${id}:`, error)
      throw error
    }
  }

  // GET /departments/{id}/users
  static async getDepartmentUsers(id: number) {
    console.log(`🔍 [DepartmentService] Fetching users for department ${id}...`)
    try {
      const response = await api.get(`/departments/${id}/users`)
      console.log(`✅ [DepartmentService] Department ${id} users fetched:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error fetching users for department ${id}:`, error)
      throw error
    }
  }

  // ============================================
  // ADMIN ONLY ENDPOINTS
  // ============================================

  // POST /departments (Admin only)
  static async createDepartment(data: CreateDepartmentData) {
    console.log('🔍 [DepartmentService] Creating department:', data)
    try {
      const response = await api.post('/departments', data)
      console.log('✅ [DepartmentService] Department created:', response)
      return response
    } catch (error) {
      console.error('❌ [DepartmentService] Error creating department:', error)
      throw error
    }
  }

  // PUT /departments/{id} (Admin only)
  static async updateDepartment(id: number, data: UpdateDepartmentData) {
    console.log(`🔍 [DepartmentService] Updating department ${id}:`, data)
    try {
      const response = await api.put(`/departments/${id}`, data)
      console.log(`✅ [DepartmentService] Department ${id} updated:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error updating department ${id}:`, error)
      throw error
    }
  }

  // DELETE /departments/{id} (Admin only)
  static async deleteDepartment(id: number) {
    console.log(`🔍 [DepartmentService] Deleting department ${id}...`)
    try {
      const response = await api.delete(`/departments/${id}`)
      console.log(`✅ [DepartmentService] Department ${id} deleted:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error deleting department ${id}:`, error)
      throw error
    }
  }

  // POST /departments/{id}/activate (Admin only)
  static async activateDepartment(id: number) {
    console.log(`🔍 [DepartmentService] Activating department ${id}...`)
    try {
      const response = await api.post(`/departments/${id}/activate`)
      console.log(`✅ [DepartmentService] Department ${id} activated:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error activating department ${id}:`, error)
      throw error
    }
  }

  // POST /departments/{id}/deactivate (Admin only)
  static async deactivateDepartment(id: number) {
    console.log(`🔍 [DepartmentService] Deactivating department ${id}...`)
    try {
      const response = await api.post(`/departments/${id}/deactivate`)
      console.log(`✅ [DepartmentService] Department ${id} deactivated:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error deactivating department ${id}:`, error)
      throw error
    }
  }

  // POST /departments/{id}/assign-hod (Admin only)
  // FIXED: The backend expects 'hod_id' field name
  static async assignHOD(id: number, hod_id: number) {
    console.log(`🔍 [DepartmentService] Assigning HOD to department ${id}:`, { hod_id })
    try {
      const response = await api.post(`/departments/${id}/assign-hod`, {
        hod_id
      })
      console.log(`✅ [DepartmentService] HOD assigned to department ${id}:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error assigning HOD to department ${id}:`, error)
      throw error
    }
  }

  // POST /departments/{id}/remove-hod (Admin only)
  static async removeHOD(id: number) {
    console.log(`🔍 [DepartmentService] Removing HOD from department ${id}...`)
    try {
      const response = await api.post(`/departments/${id}/remove-hod`)
      console.log(`✅ [DepartmentService] HOD removed from department ${id}:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error removing HOD from department ${id}:`, error)
      throw error
    }
  }

  // ============================================
  // HOD ONLY ENDPOINTS - STAFF MANAGEMENT
  // ============================================

  // GET /departments/{id}/available-staff (HOD only)
  // Fetch staff members available for assignment (not assigned to any department)
  static async getAvailableStaff(id: number) {
    console.log(`🔍 [DepartmentService] Fetching available staff for department ${id}...`)
    try {
      const response = await api.get(`/departments/${id}/available-staff`)
      console.log(`✅ [DepartmentService] Available staff fetched for department ${id}:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error fetching available staff for department ${id}:`, error)
      throw error
    }
  }

  // GET /departments/{id}/staff-list (HOD only)
  // Fetch all staff members currently assigned to the department
  static async getDepartmentStaffList(id: number) {
    console.log(`🔍 [DepartmentService] Fetching staff list for department ${id}...`)
    try {
      const response = await api.get(`/departments/${id}/staff-list`)
      console.log(`✅ [DepartmentService] Staff list fetched for department ${id}:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error fetching staff list for department ${id}:`, error)
      throw error
    }
  }

  // POST /departments/{id}/assign-staff (HOD only)
  // Assign a single staff member to the department
  static async assignStaffToDepartment(id: number, user_id: number) {
    console.log(`🔍 [DepartmentService] Assigning staff ${user_id} to department ${id}...`)
    try {
      const response = await api.post(`/departments/${id}/assign-staff`, { user_id })
      console.log(`✅ [DepartmentService] Staff ${user_id} assigned to department ${id}:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error assigning staff to department ${id}:`, error)
      throw error
    }
  }

  // POST /departments/{id}/remove-staff (HOD only)
  // Remove a single staff member from the department
  static async removeStaffFromDepartment(id: number, user_id: number) {
    console.log(`🔍 [DepartmentService] Removing staff ${user_id} from department ${id}...`)
    try {
      const response = await api.post(`/departments/${id}/remove-staff`, { user_id })
      console.log(`✅ [DepartmentService] Staff ${user_id} removed from department ${id}:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error removing staff from department ${id}:`, error)
      throw error
    }
  }

  // POST /departments/{id}/bulk-assign-staff (HOD only)
  // Bulk assign multiple staff members to the department
  static async bulkAssignStaffToDepartment(id: number, user_ids: number[]) {
    console.log(`🔍 [DepartmentService] Bulk assigning staff to department ${id}:`, user_ids)
    try {
      const response = await api.post(`/departments/${id}/bulk-assign-staff`, { user_ids })
      console.log(`✅ [DepartmentService] Staff assigned to department ${id}:`, response)
      return response
    } catch (error) {
      console.error(`❌ [DepartmentService] Error bulk assigning staff to department ${id}:`, error)
      throw error
    }
  }
}

export default DepartmentService
