// services/admin.service.ts
import api from './api'

export interface AuditFilters {
  page?: number
  per_page?: number
  user_id?: number
  event?: string
  model_type?: string
  start_date?: string
  end_date?: string
  search?: string
}

export class AdminService {
  private static baseUrl = '/admin'

  // ============================================
  // SETTINGS - Not exposed in routes, skip for now
  // ============================================
  // (No settings endpoints are exposed in the routes provided)

  // ============================================
  // AUDIT LOGS - Not exposed in routes, skip for now
  // ============================================
  // (No audit endpoints are exposed in the routes provided)

  // ============================================
  // SYSTEM STATUS - Not exposed in routes, skip for now
  // ============================================
  // (No status endpoints are exposed in the routes provided)

  // ============================================
  // BACKUP & RESTORE - Not exposed in routes, skip for now
  // ============================================
  // (No backup endpoints are exposed in the routes provided)
}

export default AdminService
