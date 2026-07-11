// types/backup.types.ts

export interface Backup {
  id: number
  name: string
  file_name: string
  disk: string
  path: string
  size: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  type: 'manual' | 'scheduled' | 'auto'
  metadata: Record<string, any> | null
  error_message: string | null
  completed_at: string | null
  created_by: number | null
  created_at: string
  updated_at: string
  // Computed properties
  formatted_size?: string
  status_color?: string
  status_label?: string
  type_label?: string
  creator?: {
    id: number
    full_name: string
    email: string
  }
}

export interface BackupStats {
  total_backups: number
  total_size: number
  completed_backups: number
  failed_backups: number
  pending_backups: number
  running_backups: number
  manual_backups: number
  scheduled_backups: number
  latest_backup: Backup | null
  backups_by_day: Array<{
    date: string
    count: number
  }>
  backups_by_status: Record<string, number>
}

export interface BackupFilters {
  status?: string
  type?: string
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export interface BackupsResponse {
  success: boolean
  data: Backup[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface BackupStatsResponse {
  success: boolean
  data: BackupStats
}

export interface BackupSingleResponse {
  success: boolean
  data: Backup
}

export interface BackupCreateData {
  name?: string
  type?: 'manual' | 'scheduled' | 'auto'
  disk?: 'local' | 's3'
  metadata?: Record<string, any>
}

// Helper functions
export const BACKUP_STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  running: 'info',
  completed: 'success',
  failed: 'danger',
}

export const BACKUP_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
}

export const BACKUP_TYPE_LABELS: Record<string, string> = {
  manual: 'Manual',
  scheduled: 'Scheduled',
  auto: 'Auto',
}

export const BACKUP_STATUS_ICONS: Record<string, string> = {
  pending: 'Clock',
  running: 'Loader2',
  completed: 'CheckCircle',
  failed: 'XCircle',
}

export const getBackupStatusColor = (status: string): string => {
  return BACKUP_STATUS_COLORS[status] || 'secondary'
}

export const getBackupStatusLabel = (status: string): string => {
  return BACKUP_STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

export const getBackupTypeLabel = (type: string): string => {
  return BACKUP_TYPE_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

export const getBackupStatusIcon = (status: string): string => {
  return BACKUP_STATUS_ICONS[status] || 'Activity'
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
