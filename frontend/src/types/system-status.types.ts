// types/system-status.types.ts

export interface SystemStatusComponent {
  status: 'operational' | 'degraded' | 'maintenance' | 'down'
  response_time?: number | null
  message: string
  details?: {
    [key: string]: any
  }
  services?: Record<string, any>
}

export interface SystemStatusResponse {
  status: 'operational' | 'degraded' | 'maintenance' | 'down'
  components: {
    api: SystemStatusComponent
    database: SystemStatusComponent
    cache: SystemStatusComponent
    queue: SystemStatusComponent
    storage: SystemStatusComponent
    authentication: SystemStatusComponent
    services: SystemStatusComponent
  }
  last_checked: string
  uptime_percentage: number
  response_times: Record<string, number>
}

export interface SystemStatusSummary {
  current_status: string
  last_checked: string | null
  uptime_percentage: number
  total_checks: number
  components_count: number
  latest_check: any | null
}

export interface SystemStatusHistoryFilters {
  component?: string
  status?: string
  start_date?: string
  end_date?: string
  limit?: number
}

export interface SystemStatusHistoryItem {
  id: number
  status: string
  component: string
  environment: string
  message: string | null
  metrics: any | null
  details: any | null
  checked_at: string
  created_at: string
  updated_at: string
}

export interface SystemStatusHistoryResponse {
  success: boolean
  data: SystemStatusHistoryItem[]
  meta: {
    count: number
    components: string[]
    statuses: string[]
  }
}

// Helper functions for status display
export const STATUS_COLORS: Record<string, string> = {
  operational: 'success',
  degraded: 'warning',
  maintenance: 'info',
  down: 'danger',
}

export const STATUS_LABELS: Record<string, string> = {
  operational: 'Operational',
  degraded: 'Degraded Performance',
  maintenance: 'Under Maintenance',
  down: 'Down / Unavailable',
}

export const STATUS_ICONS: Record<string, string> = {
  operational: 'CheckCircle',
  degraded: 'AlertTriangle',
  maintenance: 'Settings',
  down: 'XCircle',
}

export const COMPONENT_LABELS: Record<string, string> = {
  api: 'API Server',
  database: 'Database',
  cache: 'Cache Service',
  queue: 'Queue System',
  storage: 'Storage Service',
  authentication: 'Authentication Service',
  services: 'External Services',
}

export const COMPONENT_ICONS: Record<string, string> = {
  api: 'Server',
  database: 'Database',
  cache: 'Zap',
  queue: 'GitBranch',
  storage: 'HardDrive',
  authentication: 'Lock',
  services: 'Globe',
}

export const COMPONENT_COLORS: Record<string, string> = {
  api: 'blue',
  database: 'emerald',
  cache: 'amber',
  queue: 'purple',
  storage: 'cyan',
  authentication: 'indigo',
  services: 'pink',
}

export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] || 'secondary'
}

export const getStatusLabel = (status: string): string => {
  // Check if status is undefined or null
  if (!status) return 'Unknown'
  return STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

export const getComponentLabel = (component: string): string => {
  if (!component) return 'Unknown'
  return COMPONENT_LABELS[component] || component.charAt(0).toUpperCase() + component.slice(1)
}

export const getComponentIcon = (component: string): string => {
  if (!component) return 'Activity'
  return COMPONENT_ICONS[component] || 'Activity'
}

export const getComponentColor = (component: string): string => {
  if (!component) return 'gray'
  return COMPONENT_COLORS[component] || 'gray'
}
