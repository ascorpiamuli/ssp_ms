// types/audit-log.types.ts

export interface AuditLogUser {
  id: number
  first_name: string
  last_name: string
  email: string
  email_verified_at: string | null
  phone: string | null
  id_number: string | null
  date_of_birth: string | null
  profile_photo: string | null
  department_id: number | null
  is_active: boolean
  is_approved: boolean
  approved_at: string | null
  approved_by: string | null
  rejection_reason: string | null
  last_login_at: string | null
  timezone: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AuditLog {
  id: number
  user_id: number
  action: string
  module: string
  entity_type: string | null
  entity_id: number | null
  description: string
  data: Record<string, any> | null
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  metadata: {
    added?: Record<string, any>
    removed?: Record<string, any>
    role_name?: string
    total_added?: number
    total_removed?: number
    [key: string]: any
  } | null
  ip_address: string
  user_agent: string
  created_at: string
  updated_at: string
  user: AuditLogUser
  // Computed properties (optional, from backend accessors)
  action_display_name?: string
  module_display_name?: string
  action_color?: string
}

export interface AuditLogStats {
  total_logs: number
  unique_users: number
  today_logs: number
  week_logs: number
  month_logs: number
  modules: Record<string, number>
  actions: Record<string, number>
  recent_activities: AuditLog[]
}

export interface AuditLogFilters {
  module?: string
  action?: string
  user_id?: number
  entity_type?: string
  entity_id?: number
  start_date?: string
  end_date?: string
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export interface AuditLogModule {
  value: string
  label: string
}

export interface AuditLogAction {
  value: string
  label: string
}

// Response types
export interface AuditLogsResponse {
  success: boolean
  data: AuditLog[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface AuditLogStatsResponse {
  success: boolean
  data: AuditLogStats
}

export interface AuditLogModulesResponse {
  success: boolean
  data: AuditLogModule[]
}

export interface AuditLogActionsResponse {
  success: boolean
  data: AuditLogAction[]
}

export interface AuditLogSingleResponse {
  success: boolean
  data: AuditLog
}

export interface AuditLogExportResponse {
  success: boolean
  message?: string
  data: Blob
}

// Action display mapping
export const ACTION_DISPLAY_NAMES: Record<string, string> = {
  // Role & Permission actions
  permissions_updated: 'Permissions Updated',
  permission_granted: 'Permission Granted',
  permission_revoked: 'Permission Revoked',
  role_created: 'Role Created',
  role_created_with_permissions: 'Role Created with Permissions',
  role_renamed: 'Role Renamed',
  role_deleted: 'Role Deleted',
  role_assigned: 'Role Assigned',
  role_removed: 'Role Removed',

  // User actions
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

  // Department actions
  department_created: 'Department Created',
  department_updated: 'Department Updated',
  department_deleted: 'Department Deleted',
  department_activated: 'Department Activated',
  department_deactivated: 'Department Deactivated',
  hod_assigned: 'HOD Assigned',
  hod_removed: 'HOD Removed',

  // Auth actions
  login: 'Logged In',
  logout: 'Logged Out',
  register: 'Registered',
  password_changed: 'Password Changed',
  password_reset: 'Password Reset',
  profile_updated: 'Profile Updated',

  // CRUD actions
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  restored: 'Restored',
  viewed: 'Viewed',

  // Approval actions
  approved: 'Approved',
  rejected: 'Rejected',
  submitted: 'Submitted',
  verified: 'Verified',
  published: 'Published',
  unpublished: 'Unpublished',

  // Status actions
  activated: 'Activated',
  deactivated: 'Deactivated',
  enabled: 'Enabled',
  disabled: 'Disabled',

  // Other
  api_request: 'API Request',
  export_reports: 'Reports Exported',
  view_audit_logs: 'Audit Logs Viewed',
}

// Module display mapping
export const MODULE_DISPLAY_NAMES: Record<string, string> = {
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
  department: 'Departments',
  role: 'Roles & Permissions',
}

// Action color mapping for badges
export const ACTION_COLORS: Record<string, string> = {
  // Success actions (green)
  created: 'success',
  approved: 'success',
  activated: 'success',
  enabled: 'success',
  login: 'success',
  restored: 'success',
  verified: 'success',
  published: 'success',
  user_created: 'success',
  user_approved: 'success',
  user_activated: 'success',
  user_restored: 'success',
  role_created: 'success',
  role_created_with_permissions: 'success',
  permission_granted: 'success',
  department_activated: 'success',
  hod_assigned: 'success',
  register: 'success',

  // Info actions (blue)
  updated: 'info',
  viewed: 'info',
  downloaded: 'info',
  exported: 'info',
  profile_updated: 'info',
  user_updated: 'info',
  permissions_updated: 'info',
  role_renamed: 'info',
  department_updated: 'info',
  password_changed: 'warning',
  password_reset: 'warning',

  // Danger actions (red)
  deleted: 'danger',
  rejected: 'danger',
  deactivated: 'danger',
  disabled: 'danger',
  unassigned: 'danger',
  unpublished: 'danger',
  logout: 'secondary',
  user_rejected: 'danger',
  user_deactivated: 'danger',
  user_soft_deleted: 'danger',
  user_force_deleted: 'danger',
  role_deleted: 'danger',
  role_removed: 'danger',
  permission_revoked: 'danger',
  department_deleted: 'danger',
  department_deactivated: 'danger',
  hod_removed: 'danger',

  // Warning actions (yellow)
  imported: 'warning',
  assigned: 'warning',
  submitted: 'primary',
  users_bulk_action: 'primary',
  role_assigned: 'primary',
  department_created: 'success',

  // Default
  api_request: 'secondary',
  view_audit_logs: 'secondary',
}

// Helper functions
export const getActionDisplayName = (action: string): string => {
  return ACTION_DISPLAY_NAMES[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export const getModuleDisplayName = (module: string): string => {
  return MODULE_DISPLAY_NAMES[module] || module.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export const getActionColor = (action: string): string => {
  return ACTION_COLORS[action] || 'secondary'
}
