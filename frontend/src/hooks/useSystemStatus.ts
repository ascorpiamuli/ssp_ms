// hooks/useSystemStatus.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import SystemStatusService from '@/services/system-status.service'
import { useToast } from '@/components/ui/toast-context'
import {
  SystemStatusResponse,
  SystemStatusSummary,
  SystemStatusHistoryFilters,
  SystemStatusHistoryItem,
  getStatusColor,
  getStatusLabel,
  getComponentLabel,
  getComponentIcon,
  getComponentColor,
} from '@/types/system-status.types'

// Helper to get error message
const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return 'An unexpected error occurred'
}

// Helper to extract data from API response
const extractResponseData = <T>(response: any): T => {
  console.log('🔍 [useSystemStatus] extractResponseData input:', response)

  // If response is undefined or null
  if (!response) {
    console.warn('⚠️ [useSystemStatus] Response is null or undefined')
    return {} as T
  }

  // If response is already the data (has status and components)
  if (response && typeof response === 'object' && 'status' in response && 'components' in response) {
    console.log('✅ [useSystemStatus] Response is already the data object')
    return response as T
  }

  // If response has a data property, return it
  if (response && typeof response === 'object' && 'data' in response) {
    console.log('✅ [useSystemStatus] Found data property, returning it')
    return response.data as T
  }

  // If response is the data itself
  console.log('✅ [useSystemStatus] Returning response as-is')
  return response as T
}

interface UseSystemStatusOptions {
  enabled?: boolean
  staleTime?: number
  refetchInterval?: number
}

export function useSystemStatus() {
  const { error: toastError, success: toastSuccess } = useToast()
  const queryClient = useQueryClient()

  /**
   * Get current system status with auto-refresh
   */
  const useCurrentStatus = (options: UseSystemStatusOptions = {}) => {
    const {
      enabled = true,
      staleTime = 30 * 1000, // 30 seconds
      refetchInterval = 60 * 1000, // 1 minute
    } = options

    return useQuery({
      queryKey: ['system-status', 'current'],
      queryFn: async () => {
        console.log('🔄 [useSystemStatus] Fetching current status...')
        const response = await SystemStatusService.getCurrentStatus()
        console.log('📦 [useSystemStatus] Current status raw response:', response)
        const data = extractResponseData<SystemStatusResponse>(response)
        console.log('✅ [useSystemStatus] Current status data:', data)
        return data
      },
      enabled,
      staleTime,
      refetchInterval,
      retry: 1,
    })
  }

  /**
   * Get system status summary
   */
  const useSummary = (options: UseSystemStatusOptions = {}) => {
    const {
      enabled = true,
      staleTime = 60 * 1000, // 1 minute
    } = options

    return useQuery({
      queryKey: ['system-status', 'summary'],
      queryFn: async () => {
        console.log('🔄 [useSystemStatus] Fetching summary...')
        const response = await SystemStatusService.getSummary()
        console.log('📦 [useSystemStatus] Summary raw response:', response)
        // Summary response is already the data (not wrapped)
        const data = response as SystemStatusSummary
        console.log('✅ [useSystemStatus] Summary data:', data)
        return data
      },
      enabled,
      staleTime,
      retry: 1,
    })
  }

  /**
   * Get system status history
   */
  const useHistory = (
    filters: SystemStatusHistoryFilters = {},
    options: UseSystemStatusOptions = {}
  ) => {
    const {
      enabled = true,
      staleTime = 2 * 60 * 1000, // 2 minutes
    } = options

    return useQuery({
      queryKey: ['system-status', 'history', JSON.stringify(filters)],
      queryFn: async () => {
        console.log('🔄 [useSystemStatus] Fetching history...', filters)
        const response = await SystemStatusService.getHistory(filters)
        console.log('📦 [useSystemStatus] History raw response:', response)

        // History response has { success, data, meta } structure
        // But extractData might have already unwrapped it
        if (response && typeof response === 'object') {
          // Check if it's the full response with data and meta
          if ('data' in response && 'meta' in response) {
            return {
              data: response.data || [],
              meta: response.meta || { count: 0, components: [], statuses: [] },
            }
          }
          // If it's already unwrapped
          if (Array.isArray(response)) {
            return {
              data: response,
              meta: { count: response.length, components: [], statuses: [] },
            }
          }
        }
        return { data: [], meta: { count: 0, components: [], statuses: [] } }
      },
      enabled,
      staleTime,
      retry: 1,
    })
  }

  /**
   * Refresh system status (mutation)
   */
  const refreshStatus = useMutation({
    mutationFn: async () => {
      console.log('🔄 [useSystemStatus] Refreshing status...')
      const response = await SystemStatusService.refreshStatus()
      console.log('📦 [useSystemStatus] Refresh raw response:', response)
      const data = extractResponseData<SystemStatusResponse>(response)
      console.log('✅ [useSystemStatus] Refresh data:', data)
      return data
    },
    onSuccess: (data) => {
      toastSuccess('System status refreshed successfully')
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['system-status'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  /**
   * Get status color for badge
   */
  const getStatusBadgeColor = (status: string): string => {
    return getStatusColor(status)
  }

  /**
   * Get status display label
   */
  const getStatusDisplayLabel = (status: string): string => {
    return getStatusLabel(status)
  }

  /**
   * Get component display name
   */
  const getComponentDisplayName = (component: string): string => {
    return getComponentLabel(component)
  }

  /**
   * Get component icon name
   */
  const getComponentIconName = (component: string): string => {
    return getComponentIcon(component)
  }

  /**
   * Get component color
   */
  const getComponentColorName = (component: string): string => {
    return getComponentColor(component)
  }

  /**
   * Check if system is healthy
   */
  const isSystemHealthy = (status: SystemStatusResponse): boolean => {
    if (!status) return false
    return status.status === 'operational'
  }

  /**
   * Get status order for sorting
   */
  const getStatusOrder = (status: string): number => {
    const order = {
      operational: 0,
      degraded: 1,
      maintenance: 2,
      down: 3,
    }
    return order[status as keyof typeof order] ?? 99
  }

  /**
   * Sort components by status (healthy first)
   */
  const sortComponentsByStatus = (components: Record<string, any>): [string, any][] => {
    if (!components) return []
    return Object.entries(components).sort((a, b) => {
      return getStatusOrder(a[1].status) - getStatusOrder(b[1].status)
    })
  }

  return {
    // Queries
    useCurrentStatus,
    useSummary,
    useHistory,

    // Mutations
    refreshStatus,

    // Helpers
    getStatusBadgeColor,
    getStatusDisplayLabel,
    getComponentDisplayName,
    getComponentIconName,
    getComponentColorName,
    isSystemHealthy,
    sortComponentsByStatus,
  }
}
