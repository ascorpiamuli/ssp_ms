// services/audit-log.service.ts

import { privateApi } from './api'
import {
  AuditLog,
  AuditLogStats,
  AuditLogFilters,
  AuditLogsResponse,
  AuditLogStatsResponse,
  AuditLogModulesResponse,
  AuditLogActionsResponse,
  AuditLogSingleResponse,
  AuditLogExportResponse,
} from '@/types/audit-log.types'

export class AuditLogService {
  // ============================================
  // AUDIT LOG ROUTES (Authentication required)
  // ============================================

  /**
   * Get all audit logs with filters
   */
  static async getLogs(filters: AuditLogFilters = {}): Promise<AuditLogsResponse> {
    console.log('🔍 [AuditLogService] Fetching audit logs:', filters)

    try {
      // Use the raw axios client to get the full response without extraction
      // This bypasses the extractData function in the API client
      const client = privateApi.getClient()
      const response = await client.get('/admin/audit-logs', {
        params: filters,
      })

      console.log('✅ [AuditLogService] Raw response:', response.data)

      const responseData = response.data

      // Check if the response has the expected structure
      if (responseData && typeof responseData === 'object') {
        // If it has data and meta, return it directly
        if ('data' in responseData && 'meta' in responseData) {
          return {
            success: responseData.success !== undefined ? responseData.success : true,
            data: Array.isArray(responseData.data) ? responseData.data : [],
            meta: {
              current_page: responseData.meta?.current_page || filters.page || 1,
              per_page: responseData.meta?.per_page || filters.per_page || 20,
              total: responseData.meta?.total || (Array.isArray(responseData.data) ? responseData.data.length : 0),
              last_page: responseData.meta?.last_page || 1,
            },
          }
        }

        // If it has data but no meta
        if ('data' in responseData && Array.isArray(responseData.data)) {
          return {
            success: true,
            data: responseData.data,
            meta: {
              current_page: filters.page || 1,
              per_page: filters.per_page || 20,
              total: responseData.data.length,
              last_page: 1,
            },
          }
        }
      }

      // Fallback
      return {
        success: false,
        data: [],
        meta: {
          current_page: filters.page || 1,
          per_page: filters.per_page || 20,
          total: 0,
          last_page: 1,
        },
      }
    } catch (error) {
      console.error('❌ [AuditLogService] Error fetching audit logs:', error)
      return {
        success: false,
        data: [],
        meta: {
          current_page: filters.page || 1,
          per_page: filters.per_page || 20,
          total: 0,
          last_page: 1,
        },
      }
    }
  }

  /**
   * Get audit log statistics
   */
  static async getStats(): Promise<AuditLogStatsResponse> {
    console.log('🔍 [AuditLogService] Fetching audit stats...')
    try {
      // Use the raw axios client for stats as well
      const client = privateApi.getClient()
      const response = await client.get('/admin/audit-logs/stats')

      console.log('✅ [AuditLogService] Audit stats response:', response.data)

      const responseData = response.data

      if (responseData && typeof responseData === 'object') {
        if ('data' in responseData) {
          return {
            success: true,
            data: responseData.data,
          }
        }
        if ('total_logs' in responseData) {
          return {
            success: true,
            data: responseData as AuditLogStats,
          }
        }
      }

      return {
        success: false,
        data: {
          total_logs: 0,
          unique_users: 0,
          today_logs: 0,
          week_logs: 0,
          month_logs: 0,
          modules: {},
          actions: {},
          recent_activities: [],
        },
      }
    } catch (error) {
      console.error('❌ [AuditLogService] Error fetching audit stats:', error)
      return {
        success: false,
        data: {
          total_logs: 0,
          unique_users: 0,
          today_logs: 0,
          week_logs: 0,
          month_logs: 0,
          modules: {},
          actions: {},
          recent_activities: [],
        },
      }
    }
  }

  /**
   * Get available modules for filtering
   */
  static async getModules(): Promise<AuditLogModulesResponse> {
    console.log('🔍 [AuditLogService] Fetching audit modules...')
    try {
      const client = privateApi.getClient()
      const response = await client.get('/admin/audit-logs/modules')

      console.log('✅ [AuditLogService] Audit modules response:', response.data)

      const responseData = response.data

      if (responseData && typeof responseData === 'object') {
        if ('data' in responseData && Array.isArray(responseData.data)) {
          return {
            success: true,
            data: responseData.data,
          }
        }
        if (Array.isArray(responseData)) {
          return {
            success: true,
            data: responseData,
          }
        }
      }

      return {
        success: false,
        data: [],
      }
    } catch (error) {
      console.error('❌ [AuditLogService] Error fetching audit modules:', error)
      return {
        success: false,
        data: [],
      }
    }
  }

  /**
   * Get available actions for filtering
   */
  static async getActions(): Promise<AuditLogActionsResponse> {
    console.log('🔍 [AuditLogService] Fetching audit actions...')
    try {
      const client = privateApi.getClient()
      const response = await client.get('/admin/audit-logs/actions')

      console.log('✅ [AuditLogService] Audit actions response:', response.data)

      const responseData = response.data

      if (responseData && typeof responseData === 'object') {
        if ('data' in responseData && Array.isArray(responseData.data)) {
          return {
            success: true,
            data: responseData.data,
          }
        }
        if (Array.isArray(responseData)) {
          return {
            success: true,
            data: responseData,
          }
        }
      }

      return {
        success: false,
        data: [],
      }
    } catch (error) {
      console.error('❌ [AuditLogService] Error fetching audit actions:', error)
      return {
        success: false,
        data: [],
      }
    }
  }

  /**
   * Get a single audit log entry
   */
  static async getLog(id: number): Promise<AuditLogSingleResponse> {
    console.log(`🔍 [AuditLogService] Fetching audit log ${id}...`)
    try {
      const client = privateApi.getClient()
      const response = await client.get(`/admin/audit-logs/${id}`)

      console.log(`✅ [AuditLogService] Audit log ${id} response:`, response.data)

      const responseData = response.data

      if (responseData && typeof responseData === 'object') {
        if ('data' in responseData) {
          return {
            success: true,
            data: responseData.data,
          }
        }
        if ('id' in responseData) {
          return {
            success: true,
            data: responseData as AuditLog,
          }
        }
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error(`❌ [AuditLogService] Error fetching audit log ${id}:`, error)
      throw error
    }
  }

  /**
   * Export audit logs to CSV
   */
  static async exportLogs(filters: AuditLogFilters = {}): Promise<AuditLogExportResponse> {
    console.log('🔍 [AuditLogService] Exporting audit logs:', filters)
    try {
      const client = privateApi.getClient()
      const response = await client.get('/admin/audit-logs/export', {
        params: filters,
        responseType: 'blob',
      })

      return {
        success: true,
        message: 'Audit logs exported successfully',
        data: response.data,
      }
    } catch (error) {
      console.error('❌ [AuditLogService] Error exporting audit logs:', error)
      throw error
    }
  }

  /**
   * Helper: Download exported CSV
   */
  static async downloadExport(filters: AuditLogFilters = {}): Promise<void> {
    try {
      const response = await this.exportLogs(filters)
      const blob = response.data as Blob
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('❌ [AuditLogService] Error downloading export:', error)
      throw error
    }
  }
}

export default AuditLogService
