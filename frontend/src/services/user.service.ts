// services/user.service.ts
import api from './api'

export interface UserFilters {
  page?: number
  per_page?: number
  search?: string
  role?: string
  status?: 'active' | 'inactive' | 'pending'
  department_id?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface CreateUserData {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  department_id?: number | null
  password: string
  password_confirmation: string
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  role?: string
  department_id?: number | null
}

export interface BulkActionData {
  action: 'activate' | 'deactivate' | 'delete' | 'approve'
  user_ids: number[]
}

export class UserService {
  private static baseUrl = '/admin/users'

  // GET /admin/users
  static async getUsers(filters: UserFilters = {}) {
    const response = await api.get(this.baseUrl, { params: filters })
    return response.data
  }

  // GET /admin/users/{id}
  static async getUser(id: number) {
    const response = await api.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  // GET /admin/users/pending
  static async getPendingUsers() {
    const response = await api.get(`${this.baseUrl}/pending`)
    return response.data
  }

  // GET /admin/users/recent
  static async getRecentUsers(limit: number = 5) {
    const response = await api.get(`${this.baseUrl}/recent`, { params: { limit } })
    return response.data
  }

  // GET /admin/users/stats
  static async getUserStats() {
    const response = await api.get(`${this.baseUrl}/stats`)
    return response.data
  }

  // POST /admin/users
  static async createUser(data: CreateUserData) {
    const response = await api.post(this.baseUrl, data)
    return response.data
  }

  // PUT /admin/users/{id}
  static async updateUser(id: number, data: UpdateUserData) {
    const response = await api.put(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  // DELETE /admin/users/{id}
  static async deleteUser(id: number) {
    const response = await api.delete(`${this.baseUrl}/${id}`)
    return response.data
  }

  // POST /admin/users/bulk
  static async bulkAction(data: BulkActionData) {
    const response = await api.post(`${this.baseUrl}/bulk`, data)
    return response.data
  }

  // POST /admin/users/{id}/approve
  static async approveUser(id: number) {
    const response = await api.post(`${this.baseUrl}/${id}/approve`)
    return response.data
  }

  // POST /admin/users/{id}/reject
  static async rejectUser(id: number) {
    const response = await api.post(`${this.baseUrl}/${id}/reject`)
    return response.data
  }

  // POST /admin/users/{id}/activate
  static async activateUser(id: number) {
    const response = await api.post(`${this.baseUrl}/${id}/activate`)
    return response.data
  }

  // POST /admin/users/{id}/deactivate
  static async deactivateUser(id: number) {
    const response = await api.post(`${this.baseUrl}/${id}/deactivate`)
    return response.data
  }

  // POST /admin/users/{id}/reset-password
  static async resetPassword(id: number, password: string) {
    const response = await api.post(`${this.baseUrl}/${id}/reset-password`, { password })
    return response.data
  }
}

export default UserService
