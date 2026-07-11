// services/backup.service.ts

import { privateApi } from './api'
import {
  Backup,
  BackupStats,
  BackupFilters,
  BackupsResponse,
  BackupStatsResponse,
  BackupSingleResponse,
  BackupCreateData,
} from '@/types/backup.types'

export class BackupService {
  /**
   * Get all backups with filters
   * Uses raw axios client to preserve meta data
   */
  static async getBackups(filters: BackupFilters = {}): Promise<BackupsResponse> {
    console.log('🔍 [BackupService] Fetching backups:', filters)
    try {
      // Use raw axios client to get full response with meta
      const client = privateApi.getClient()
      const response = await client.get('/admin/backups', {
        params: filters,
      })

      console.log('✅ [BackupService] Backups response:', response.data)

      const responseData = response.data

      // Check if response has the expected structure
      if (responseData && typeof responseData === 'object') {
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
      console.error('❌ [BackupService] Error fetching backups:', error)
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
   * Get backup statistics
   */
  static async getStats(): Promise<BackupStatsResponse> {
    console.log('🔍 [BackupService] Fetching backup stats...')
    try {
      const client = privateApi.getClient()
      const response = await client.get('/admin/backups/stats')

      console.log('✅ [BackupService] Backup stats response:', response.data)

      const responseData = response.data

      if (responseData && typeof responseData === 'object') {
        if ('data' in responseData) {
          return {
            success: true,
            data: responseData.data,
          }
        }
        if ('total_backups' in responseData) {
          return {
            success: true,
            data: responseData as BackupStats,
          }
        }
      }

      // Default stats
      return {
        success: false,
        data: {
          total_backups: 0,
          total_size: 0,
          completed_backups: 0,
          failed_backups: 0,
          pending_backups: 0,
          running_backups: 0,
          manual_backups: 0,
          scheduled_backups: 0,
          latest_backup: null,
          backups_by_day: [],
          backups_by_status: {},
        },
      }
    } catch (error) {
      console.error('❌ [BackupService] Error fetching backup stats:', error)
      return {
        success: false,
        data: {
          total_backups: 0,
          total_size: 0,
          completed_backups: 0,
          failed_backups: 0,
          pending_backups: 0,
          running_backups: 0,
          manual_backups: 0,
          scheduled_backups: 0,
          latest_backup: null,
          backups_by_day: [],
          backups_by_status: {},
        },
      }
    }
  }

  /**
   * Get a single backup
   */
  static async getBackup(id: number): Promise<BackupSingleResponse> {
    console.log(`🔍 [BackupService] Fetching backup ${id}...`)
    try {
      const client = privateApi.getClient()
      const response = await client.get(`/admin/backups/${id}`)

      console.log(`✅ [BackupService] Backup ${id} response:`, response.data)

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
            data: responseData as Backup,
          }
        }
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error(`❌ [BackupService] Error fetching backup ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new backup
   */
  static async createBackup(data: BackupCreateData = {}): Promise<BackupSingleResponse> {
    console.log('🔍 [BackupService] Creating backup:', data)
    try {
      const client = privateApi.getClient()
      const response = await client.post('/admin/backups', data)

      console.log('✅ [BackupService] Backup created:', response.data)

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
            data: responseData as Backup,
          }
        }
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('❌ [BackupService] Error creating backup:', error)
      throw error
    }
  }

  /**
   * Delete a backup
   */
  static async deleteBackup(id: number): Promise<{ success: boolean; message: string }> {
    console.log(`🔍 [BackupService] Deleting backup ${id}...`)
    try {
      const client = privateApi.getClient()
      const response = await client.delete(`/admin/backups/${id}`)

      console.log(`✅ [BackupService] Backup ${id} deleted:`, response.data)

      const responseData = response.data

      if (responseData && typeof responseData === 'object') {
        return {
          success: responseData.success !== undefined ? responseData.success : true,
          message: responseData.message || 'Backup deleted successfully',
        }
      }

      return {
        success: true,
        message: 'Backup deleted successfully',
      }
    } catch (error) {
      console.error(`❌ [BackupService] Error deleting backup ${id}:`, error)
      throw error
    }
  }

  /**
   * Download a backup
   */
  static async downloadBackup(id: number): Promise<Blob> {
    console.log(`🔍 [BackupService] Downloading backup ${id}...`)
    try {
      const client = privateApi.getClient()
      const response = await client.get(`/admin/backups/${id}/download`, {
        responseType: 'blob',
      })

      console.log(`✅ [BackupService] Backup ${id} downloaded`)
      return response.data
    } catch (error) {
      console.error(`❌ [BackupService] Error downloading backup ${id}:`, error)
      throw error
    }
  }

  /**
   * Restore a backup
   */
  static async restoreBackup(id: number): Promise<{ success: boolean; message: string }> {
    console.log(`🔍 [BackupService] Restoring backup ${id}...`)
    try {
      const client = privateApi.getClient()
      const response = await client.post(`/admin/backups/${id}/restore`)

      console.log(`✅ [BackupService] Backup ${id} restored:`, response.data)

      const responseData = response.data

      if (responseData && typeof responseData === 'object') {
        return {
          success: responseData.success !== undefined ? responseData.success : true,
          message: responseData.message || 'Backup restored successfully',
        }
      }

      return {
        success: true,
        message: 'Backup restored successfully',
      }
    } catch (error) {
      console.error(`❌ [BackupService] Error restoring backup ${id}:`, error)
      throw error
    }
  }

  /**
   * Clean old backups
   */
  static async cleanBackups(days: number = 30): Promise<{ success: boolean; message: string; data: { deleted_count: number } }> {
    console.log(`🔍 [BackupService] Cleaning backups older than ${days} days...`)
    try {
      const client = privateApi.getClient()
      const response = await client.post('/admin/backups/clean', { days })

      console.log('✅ [BackupService] Backups cleaned:', response.data)

      const responseData = response.data

      if (responseData && typeof responseData === 'object') {
        return {
          success: responseData.success !== undefined ? responseData.success : true,
          message: responseData.message || 'Backups cleaned successfully',
          data: responseData.data || { deleted_count: 0 },
        }
      }

      return {
        success: true,
        message: 'Backups cleaned successfully',
        data: { deleted_count: 0 },
      }
    } catch (error) {
      console.error('❌ [BackupService] Error cleaning backups:', error)
      throw error
    }
  }

  /**
   * Helper: Download backup file
   */
  static async downloadBackupFile(id: number): Promise<void> {
    try {
      const blob = await this.downloadBackup(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `backup_${id}_${new Date().toISOString().split('T')[0]}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('❌ [BackupService] Error downloading backup file:', error)
      throw error
    }
  }
}

export default BackupService
