// hooks/useBackup.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import BackupService from '@/services/backup.service'
import { useToast } from '@/components/ui/toast-context'
import {
  Backup,
  BackupStats,
  BackupFilters,
  BackupCreateData,
  getBackupStatusColor,
  getBackupStatusLabel,
  getBackupTypeLabel,
  formatFileSize,
  BACKUP_STATUS_ICONS,
} from '@/types/backup.types'

// Helper to get error message
const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return 'An unexpected error occurred'
}

interface UseBackupOptions {
  enabled?: boolean
  staleTime?: number
  refetchInterval?: number
}

export function useBackup() {
  const { error: toastError, success: toastSuccess } = useToast()
  const queryClient = useQueryClient()

  /**
   * Get all backups with filters
   */
  const useBackups = (
    filters: BackupFilters = {},
    options: UseBackupOptions = {}
  ) => {
    const {
      enabled = true,
      staleTime = 2 * 60 * 1000, // 2 minutes
    } = options

    return useQuery({
      queryKey: ['backups', JSON.stringify(filters)],
      queryFn: async () => {
        const response = await BackupService.getBackups(filters)
        return {
          backups: response.data,
          meta: response.meta,
        }
      },
      enabled,
      staleTime,
    })
  }

  /**
   * Get backup statistics
   */
  const useStats = (options: UseBackupOptions = {}) => {
    const {
      enabled = true,
      staleTime = 5 * 60 * 1000, // 5 minutes
      refetchInterval = 60 * 1000, // 1 minute
    } = options

    return useQuery({
      queryKey: ['backups', 'stats'],
      queryFn: async () => {
        const response = await BackupService.getStats()
        return response.data
      },
      enabled,
      staleTime,
      refetchInterval,
    })
  }

  /**
   * Get a single backup
   */
  const useBackup = (id: number, options: UseBackupOptions = {}) => {
    const { enabled = !!id, staleTime = 5 * 60 * 1000 } = options

    return useQuery({
      queryKey: ['backups', id],
      queryFn: async () => {
        const response = await BackupService.getBackup(id)
        return response.data
      },
      enabled,
      staleTime,
    })
  }

  /**
   * Create a backup
   */
  const createBackup = useMutation({
    mutationFn: (data: BackupCreateData) => BackupService.createBackup(data),
    onSuccess: (response) => {
      toastSuccess('Backup created successfully')
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      queryClient.invalidateQueries({ queryKey: ['backups', 'stats'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  /**
   * Delete a backup
   */
  const deleteBackup = useMutation({
    mutationFn: (id: number) => BackupService.deleteBackup(id),
    onSuccess: (_, id) => {
      toastSuccess('Backup deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      queryClient.invalidateQueries({ queryKey: ['backups', 'stats'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  /**
   * Download a backup
   */
  const downloadBackup = useMutation({
    mutationFn: (id: number) => BackupService.downloadBackupFile(id),
    onSuccess: () => {
      toastSuccess('Backup downloaded successfully')
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  /**
   * Restore a backup
   */
  const restoreBackup = useMutation({
    mutationFn: (id: number) => BackupService.restoreBackup(id),
    onSuccess: (_, id) => {
      toastSuccess('Backup restored successfully')
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  /**
   * Clean old backups
   */
  const cleanBackups = useMutation({
    mutationFn: (days: number = 30) => BackupService.cleanBackups(days),
    onSuccess: (response) => {
      toastSuccess(response.message || 'Old backups cleaned successfully')
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      queryClient.invalidateQueries({ queryKey: ['backups', 'stats'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  /**
   * Get status color for badge
   */
  const getStatusColor = (status: string): string => {
    return getBackupStatusColor(status)
  }

  /**
   * Get status label
   */
  const getStatusLabel = (status: string): string => {
    return getBackupStatusLabel(status)
  }

  /**
   * Get type label
   */
  const getTypeLabel = (type: string): string => {
    return getBackupTypeLabel(type)
  }

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string): string => {
    return BACKUP_STATUS_ICONS[status] || 'Activity'
  }

  /**
   * Format file size
   */
  const getFormattedSize = (bytes: number): string => {
    return formatFileSize(bytes)
  }

  return {
    // Queries
    useBackups,
    useStats,
    useBackup,

    // Mutations
    createBackup,
    deleteBackup,
    downloadBackup,
    restoreBackup,
    cleanBackups,

    // Helpers
    getStatusColor,
    getStatusLabel,
    getTypeLabel,
    getStatusIcon,
    getFormattedSize,
  }
}
