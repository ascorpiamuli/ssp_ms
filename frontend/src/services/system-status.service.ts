// services/system-status.service.ts

import { privateApi } from './api'
import {
  SystemStatusResponse,
  SystemStatusSummary,
  SystemStatusHistoryFilters,
  SystemStatusHistoryResponse,
} from '@/types/system-status.types'

export class SystemStatusService {
  /**
   * Get current system status
   * The extractData function already unwraps the response, so we get SystemStatusResponse directly
   */
  static async getCurrentStatus(): Promise<SystemStatusResponse> {
    console.log('🔍 [SystemStatusService] Fetching current system status...')
    try {
      // The API returns { success: true, data: SystemStatusResponse }
      // extractData unwraps it and returns SystemStatusResponse directly
      const response = await privateApi.get<SystemStatusResponse>('/admin/system-status/current')
      console.log('📦 [SystemStatusService] Current status response:', response)
      return response
    } catch (error) {
      console.error('❌ [SystemStatusService] Error fetching system status:', error)
      throw error
    }
  }

  /**
   * Get system status history
   * History response has { success: true, data: [...], meta: {...} }
   * extractData returns the full response object (with data and meta)
   */
  static async getHistory(filters: SystemStatusHistoryFilters = {}): Promise<SystemStatusHistoryResponse> {
    console.log('🔍 [SystemStatusService] Fetching system status history:', filters)
    try {
      const response = await privateApi.get<SystemStatusHistoryResponse>('/admin/system-status/history', {
        params: filters,
      })
      console.log('📦 [SystemStatusService] History response:', response)
      return response
    } catch (error) {
      console.error('❌ [SystemStatusService] Error fetching status history:', error)
      throw error
    }
  }

  /**
   * Get system status summary
   * The API returns { success: true, data: SystemStatusSummary }
   * extractData unwraps it and returns SystemStatusSummary directly
   */
  static async getSummary(): Promise<SystemStatusSummary> {
    console.log('🔍 [SystemStatusService] Fetching system status summary...')
    try {
      const response = await privateApi.get<SystemStatusSummary>('/admin/system-status/summary')
      console.log('📦 [SystemStatusService] Summary response:', response)
      return response
    } catch (error) {
      console.error('❌ [SystemStatusService] Error fetching system summary:', error)
      throw error
    }
  }

  /**
   * Refresh system status (force check)
   * The API returns { success: true, data: SystemStatusResponse }
   * extractData unwraps it and returns SystemStatusResponse directly
   */
  static async refreshStatus(): Promise<SystemStatusResponse> {
    console.log('🔄 [SystemStatusService] Refreshing system status...')
    try {
      const response = await privateApi.post<SystemStatusResponse>('/admin/system-status/refresh')
      console.log('📦 [SystemStatusService] Refresh response:', response)
      return response
    } catch (error) {
      console.error('❌ [SystemStatusService] Error refreshing system status:', error)
      throw error
    }
  }

  /**
   * Get component status
   */
  static async getComponentStatus(component: string): Promise<any> {
    console.log(`🔍 [SystemStatusService] Fetching ${component} status...`)
    try {
      const response = await privateApi.get(`/admin/system-status/component/${component}`)
      return response
    } catch (error) {
      console.error(`❌ [SystemStatusService] Error fetching ${component} status:`, error)
      throw error
    }
  }
}

export default SystemStatusService
