// hooks/useAuditLog.ts

import { useQuery, useQueryClient } from '@tanstack/react-query'
import AuditLogService from '@/services/audit-log.service'
import {
  AuditLogFilters,
  AuditLogsResponse,
  AuditLogStatsResponse,
  AuditLogModulesResponse,
  AuditLogActionsResponse,
  AuditLogSingleResponse,
} from '@/types/audit-log.types'
import { useToast } from '@/components/ui/toast-context'
import { useMemo } from 'react'

// Helper to get error message
const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return 'An unexpected error occurred'
}

// Helper to generate stable query key
const getQueryKey = (filters: AuditLogFilters) => {
  // Create a stable key from filters
  const { page, per_page, search, module, action, start_date, end_date, sort_by, sort_order } = filters
  return ['audit-logs', { page, per_page, search, module, action, start_date, end_date, sort_by, sort_order }]
}

interface UseAuditLogOptions {
  enabled?: boolean
  staleTime?: number
  refetchOnWindowFocus?: boolean
  refetchOnMount?: boolean
}

export function useAuditLog() {
  const { error: toastError, success: toastSuccess } = useToast()
  const queryClient = useQueryClient()

  /**
   * Get audit logs with filters
   */
  const useLogs = (
    filters: AuditLogFilters = {},
    options: UseAuditLogOptions = {}
  ) => {
    const {
      enabled = true,
      staleTime = 2 * 60 * 1000,
      refetchOnWindowFocus = false,
      refetchOnMount = true,
    } = options

    // Use useMemo to create stable query key
    const queryKey = useMemo(() => getQueryKey(filters), [filters])

    return useQuery({
      queryKey,
      queryFn: async () => {
        const response: AuditLogsResponse = await AuditLogService.getLogs(filters)
        return {
          logs: response.data || [],
          meta: response.meta || {
            current_page: filters.page || 1,
            per_page: filters.per_page || 20,
            total: 0,
            last_page: 1,
          },
        }
      },
      enabled,
      staleTime,
      refetchOnWindowFocus,
      refetchOnMount,
      placeholderData: (previousData) => previousData,
    })
  }

  /**
   * Get audit log statistics
   */
  const useStats = (options: UseAuditLogOptions = {}) => {
    const { enabled = true, staleTime = 5 * 60 * 1000 } = options

    return useQuery({
      queryKey: ['audit-logs', 'stats'],
      queryFn: async () => {
        const response: AuditLogStatsResponse = await AuditLogService.getStats()
        return response.data || {
          total_logs: 0,
          unique_users: 0,
          today_logs: 0,
          week_logs: 0,
          month_logs: 0,
          modules: {},
          actions: {},
          recent_activities: [],
        }
      },
      enabled,
      staleTime,
    })
  }

  /**
   * Get available modules for filtering
   */
  const useModules = (options: UseAuditLogOptions = {}) => {
    const { enabled = true, staleTime = 10 * 60 * 1000 } = options

    return useQuery({
      queryKey: ['audit-logs', 'modules'],
      queryFn: async () => {
        const response: AuditLogModulesResponse = await AuditLogService.getModules()
        return response.data || []
      },
      enabled,
      staleTime,
    })
  }

  /**
   * Get available actions for filtering
   */
  const useActions = (options: UseAuditLogOptions = {}) => {
    const { enabled = true, staleTime = 10 * 60 * 1000 } = options

    return useQuery({
      queryKey: ['audit-logs', 'actions'],
      queryFn: async () => {
        const response: AuditLogActionsResponse = await AuditLogService.getActions()
        return response.data || []
      },
      enabled,
      staleTime,
    })
  }

  /**
   * Get a single audit log entry
   */
  const useLog = (id: number, options: UseAuditLogOptions = {}) => {
    const { enabled = !!id, staleTime = 5 * 60 * 1000 } = options

    return useQuery({
      queryKey: ['audit-logs', id],
      queryFn: async () => {
        const response: AuditLogSingleResponse = await AuditLogService.getLog(id)
        return response.data
      },
      enabled,
      staleTime,
    })
  }

  /**
   * Export audit logs
   */
  const exportLogs = async (filters: AuditLogFilters = {}) => {
    try {
      await AuditLogService.downloadExport(filters)
      toastSuccess('Audit logs exported successfully')
    } catch (error: any) {
      toastError(getErrorMessage(error))
      throw error
    }
  }

  /**
   * Refetch all audit log data
   */
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
  }

  /**
   * Refetch specific query
   */
  const refetchLogs = (filters?: AuditLogFilters) => {
    if (filters) {
      const queryKey = getQueryKey(filters)
      queryClient.invalidateQueries({ queryKey })
    } else {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    }
  }

  /**
   * Prefetch next page
   */
  const prefetchNextPage = (filters: AuditLogFilters) => {
    const nextPage = (filters.page || 1) + 1
    const nextFilters = { ...filters, page: nextPage }
    const queryKey = getQueryKey(nextFilters)

    queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const response: AuditLogsResponse = await AuditLogService.getLogs(nextFilters)
        return {
          logs: response.data || [],
          meta: response.meta,
        }
      },
    })
  }

  /**
   * Get action color badge variant
   */
  const getActionColor = (action: string): string => {
    const colorMap: Record<string, string> = {
      created: 'success',
      updated: 'info',
      deleted: 'danger',
      restored: 'success',
      viewed: 'secondary',
      downloaded: 'info',
      exported: 'info',
      imported: 'warning',
      assigned: 'warning',
      unassigned: 'danger',
      approved: 'success',
      rejected: 'danger',
      submitted: 'primary',
      verified: 'success',
      published: 'success',
      unpublished: 'warning',
      activated: 'success',
      deactivated: 'danger',
      enabled: 'success',
      disabled: 'danger',
      login: 'success',
      logout: 'secondary',
      password_changed: 'warning',
      password_reset: 'warning',
      profile_updated: 'info',
      role_assigned: 'primary',
      role_removed: 'danger',
      permission_granted: 'success',
      permission_revoked: 'danger',
      permissions_updated: 'info',
      user_created: 'success',
      user_updated: 'info',
      user_approved: 'success',
      user_rejected: 'danger',
      user_activated: 'success',
      user_deactivated: 'danger',
      user_soft_deleted: 'danger',
      user_restored: 'success',
      user_force_deleted: 'danger',
      user_password_reset: 'warning',
      users_bulk_action: 'primary',
      api_request: 'secondary',
      role_created: 'success',
      role_created_with_permissions: 'success',
      role_renamed: 'info',
      role_deleted: 'danger',
      LOGIN: 'success',
      LOGOUT: 'secondary',
      REGISTER: 'success',
      HOD_ASSIGNED: 'primary',
      DEACTIVATED: 'danger',
      DELETED: 'danger',
    }
    return colorMap[action] || 'secondary'
  }

  /**
   * Get action display name
   */
  const getActionDisplayName = (action: string): string => {
    const displayMap: Record<string, string> = {
      created: 'Created',
      updated: 'Updated',
      deleted: 'Deleted',
      restored: 'Restored',
      viewed: 'Viewed',
      downloaded: 'Downloaded',
      exported: 'Exported',
      imported: 'Imported',
      assigned: 'Assigned',
      unassigned: 'Unassigned',
      approved: 'Approved',
      rejected: 'Rejected',
      submitted: 'Submitted',
      verified: 'Verified',
      published: 'Published',
      unpublished: 'Unpublished',
      activated: 'Activated',
      deactivated: 'Deactivated',
      enabled: 'Enabled',
      disabled: 'Disabled',
      login: 'Logged In',
      logout: 'Logged Out',
      password_changed: 'Password Changed',
      password_reset: 'Password Reset',
      profile_updated: 'Profile Updated',
      role_assigned: 'Role Assigned',
      role_removed: 'Role Removed',
      permission_granted: 'Permission Granted',
      permission_revoked: 'Permission Revoked',
      permissions_updated: 'Permissions Updated',
      user_created: 'User Created',
      user_updated: 'User Updated',
      user_approved: 'User Approved',
      user_rejected: 'User Rejected',
      user_activated: 'User Activated',
      user_deactivated: 'User Deactivated',
      user_soft_deleted: 'User Deleted',
      user_restored: 'User Restored',
      user_force_deleted: 'User Permanently Deleted',
      user_password_reset: 'Password Reset',
      users_bulk_action: 'Bulk Action',
      api_request: 'API Request',
      role_created: 'Role Created',
      role_created_with_permissions: 'Role Created with Permissions',
      role_renamed: 'Role Renamed',
      role_deleted: 'Role Deleted',
      LOGIN: 'Logged In',
      LOGOUT: 'Logged Out',
      REGISTER: 'Registered',
      HOD_ASSIGNED: 'HOD Assigned',
      DEACTIVATED: 'Deactivated',
      DELETED: 'Deleted',
    }
    return displayMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Get module display name
   */
  const getModuleDisplayName = (module: string): string => {
    const displayMap: Record<string, string> = {
      auth: 'Authentication',
      users: 'Users',
      roles: 'Roles & Permissions',
      departments: 'Departments',
      suppliers: 'Suppliers',
      requisitions: 'Requisitions',
      approvals: 'Approvals',
      procurement: 'Procurement',
      orders: 'Purchase Orders',
      invoices: 'Invoices',
      budget: 'Budget',
      reports: 'Reports',
      settings: 'Settings',
      profile: 'Profile',
      audit: 'Audit Logs',
      user: 'Users',
      AUTH: 'Authentication',
      DEPARTMENT: 'Department',
    }
    return displayMap[module] || module.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return {
    // Queries
    useLogs,
    useStats,
    useModules,
    useActions,
    useLog,
    // Mutations / Actions
    exportLogs,
    refetch,
    refetchLogs,
    prefetchNextPage,
    // Helpers
    getActionColor,
    getActionDisplayName,
    getModuleDisplayName,
  }
}
