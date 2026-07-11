// app/admin/audit-logs/page.tsx

'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  Search,
  RefreshCw,
  Download,
  Eye,
  Activity,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Key,
  FilterX,
  XCircle as XCircleIcon,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast-context'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAuditLog } from '@/hooks/useAuditLog'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { PageTemplate } from '@/components/dashboard/PageTemplate'
import {
  getActionDisplayName,
  getModuleDisplayName,
  getActionColor,
} from '@/types/audit-log.types'
import type { AuditLog } from '@/types/audit-log.types'
import { format } from 'date-fns'

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy HH:mm:ss')
}

const formatRelativeTime = (date: string) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const getActionIcon = (action: string) => {
  const iconMap: Record<string, any> = {
    created: CheckCircle,
    updated: Edit,
    deleted: Trash2,
    restored: RefreshCw,
    approved: CheckCircle,
    rejected: XCircle,
    activated: CheckCircle,
    deactivated: XCircle,
    login: LogIn,
    logout: LogOut,
    register: UserPlus,
    user_created: UserPlus,
    user_updated: Edit,
    user_approved: CheckCircle,
    user_rejected: XCircle,
    user_activated: CheckCircle,
    user_deactivated: XCircle,
    user_soft_deleted: Trash2,
    user_restored: RefreshCw,
    user_force_deleted: Trash2,
    permission_granted: Key,
    permission_revoked: Key,
    permissions_updated: Key,
    role_created: Shield,
    role_deleted: Trash2,
    role_renamed: Edit,
    LOGIN: LogIn,
    LOGOUT: LogOut,
    REGISTER: UserPlus,
    HOD_ASSIGNED: UserCheck,
    DEACTIVATED: XCircle,
    DELETED: Trash2,
  }
  return iconMap[action] || iconMap[action?.toLowerCase()] || Activity
}

const getUserInitials = (user: any) => {
  if (!user) return '?'
  const first = user.first_name?.charAt(0) || ''
  const last = user.last_name?.charAt(0) || ''
  return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
}

// ============================================
// STATS CARDS
// ============================================

const StatsCards = ({ stats, isLoading }: { stats: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      label: 'Total Logs',
      value: stats.total_logs || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Today',
      value: stats.today_logs || 0,
      icon: Clock,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'This Week',
      value: stats.week_logs || 0,
      icon: Activity,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'Unique Users',
      value: stats.unique_users || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {item.value.toLocaleString()}
                  </p>
                </div>
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", item.bgColor)}>
                  <Icon className={cn("h-5 w-5", item.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ============================================
// VIEW LOG DETAILS MODAL
// ============================================

const ViewLogModal = ({
  isOpen,
  onClose,
  log,
}: {
  isOpen: boolean
  onClose: () => void
  log: AuditLog | null
}) => {
  if (!isOpen || !log) return null

  const Icon = getActionIcon(log.action)
  const color = getActionColor(log.action)
  const displayName = getActionDisplayName(log.action)
  const moduleName = getModuleDisplayName(log.module)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Audit Log Details
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {displayName}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <Badge variant={color as any} className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {displayName}
                </Badge>
                <Badge variant="secondary">{moduleName}</Badge>
                <span>#{log.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Timestamp</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(log.created_at)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">User</p>
              {log.user ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {getUserInitials(log.user)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {log.user.first_name} {log.user.last_name}
                  </span>
                  <span className="text-xs text-gray-500">({log.user.email})</span>
                </div>
              ) : (
                <span className="text-gray-500">System</span>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">IP Address</p>
              <p className="font-medium text-gray-900 dark:text-white">{log.ip_address || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Module</p>
              <Badge variant="secondary">{moduleName}</Badge>
            </div>
            <div className="md:col-span-2 space-y-2">
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-900 dark:text-white">{log.description || 'No description'}</p>
            </div>
          </div>

          {log.entity_type && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">{log.entity_type}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{log.entity_id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {(log.old_values || log.new_values) && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Changes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {log.old_values && (
                    <div className="space-y-2">
                      <p className="text-sm text-red-600 dark:text-red-400">Old Values</p>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto max-h-40">
                        {JSON.stringify(log.old_values, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.new_values && (
                    <div className="space-y-2">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">New Values</p>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto max-h-40">
                        {JSON.stringify(log.new_values, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {log.metadata && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadata</h4>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto max-h-40">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </>
          )}

          {log.data && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Data</h4>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto max-h-40">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </div>
            </>
          )}

          {log.user_agent && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Agent</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all">{log.user_agent}</p>
              </div>
            </>
          )}

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AuditLogsPage() {
  const { hasPermission, isAdmin } = useAuthContext()
  const { error: toastError } = useToast()
  const {
    useLogs,
    useStats,
    useModules,
    useActions,
    exportLogs,
  } = useAuditLog()

  // State
  const [filters, setFilters] = useState({
    search: '',
    module: 'all',
    action: 'all',
    start_date: '',
    end_date: '',
    sort_by: 'created_at',
    sort_order: 'desc' as 'asc' | 'desc',
    per_page: 20,
    page: 1,
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Queries
  const logsQuery = useLogs({
    search: filters.search || undefined,
    module: filters.module !== 'all' ? filters.module : undefined,
    action: filters.action !== 'all' ? filters.action : undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
    per_page: filters.per_page,
    page: filters.page,
  })

  const statsQuery = useStats()
  const modulesQuery = useModules()
  const actionsQuery = useActions()

  // Process data - with fallback for undefined
  const logs = logsQuery.data?.logs || []
  const meta = logsQuery.data?.meta || {
    current_page: 1,
    per_page: filters.per_page || 20,
    total: 0,
    last_page: 1,
  }

  const stats = statsQuery.data
  const modules = modulesQuery.data
  const actions = actionsQuery.data

  // Debug logging
  console.log('📊 [AuditLogs] Query data:', {
    logsQueryData: logsQuery.data,
    logsCount: logs.length,
    meta,
    filters,
  })

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, page: 1 })
    setTimeout(() => logsQuery.refetch(), 100)
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      module: 'all',
      action: 'all',
      start_date: '',
      end_date: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      per_page: 20,
      page: 1,
    })
    setTimeout(() => logsQuery.refetch(), 100)
  }

  const handlePageChange = (newPage: number) => {
    const lastPage = meta?.last_page || 1
    if (newPage >= 1 && newPage <= lastPage) {
      setFilters({ ...filters, page: newPage })
      setTimeout(() => logsQuery.refetch(), 100)
    }
  }

  const handlePerPageChange = (value: string) => {
    setFilters({ ...filters, per_page: parseInt(value), page: 1 })
    setTimeout(() => logsQuery.refetch(), 100)
  }

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetailsModal(true)
  }

  const handleExport = async () => {
    try {
      await exportLogs({
        search: filters.search || undefined,
        module: filters.module !== 'all' ? filters.module : undefined,
        action: filters.action !== 'all' ? filters.action : undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      })
    } catch (error) {
      toastError('Failed to export audit logs')
    }
  }

  // Check permissions
  if (!hasPermission('view_audit_logs') && !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You don't have permission to view audit logs.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <PageTemplate
      title="Audit Logs"
      description="View and monitor all system activities"
      icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
    >
      {/* Stats */}
      <StatsCards stats={stats} isLoading={statsQuery.isLoading} />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={filters.module}
              onValueChange={(value) => setFilters({ ...filters, module: value, page: 1 })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules?.map((module) => (
                  <SelectItem key={module.value} value={module.value}>
                    {module.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.action}
              onValueChange={(value) => setFilters({ ...filters, action: value, page: 1 })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions?.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="gap-2"
            >
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                logsQuery.refetch()
                statsQuery.refetch()
                modulesQuery.refetch()
                actionsQuery.refetch()
              }}
              className="gap-2"
              disabled={logsQuery.isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", logsQuery.isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-sm">
            {meta?.total || 0} logs
          </Badge>
          {filters.search && (
            <Badge variant="outline" className="text-sm">
              Search: {filters.search}
            </Badge>
          )}
          {filters.module !== 'all' && (
            <Badge variant="outline" className="text-sm">
              Module: {getModuleDisplayName(filters.module)}
            </Badge>
          )}
          {filters.action !== 'all' && (
            <Badge variant="outline" className="text-sm">
              Action: {getActionDisplayName(filters.action)}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="min-w-[150px]">Timestamp</TableHead>
                  <TableHead className="min-w-[220px]">User</TableHead>
                  <TableHead className="min-w-[150px]">Action</TableHead>
                  <TableHead className="min-w-[150px]">Module</TableHead>
                  <TableHead className="min-w-[200px]">Description</TableHead>
                  <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-500">Loading audit logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logsQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                        <p className="text-sm font-medium text-gray-500">Failed to load audit logs</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => logsQuery.refetch()}
                          className="gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Shield className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm font-medium text-gray-500">No audit logs found</p>
                        <p className="text-xs text-gray-400">Try adjusting your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: AuditLog, index: number) => {
                    const Icon = getActionIcon(log.action)
                    const color = getActionColor(log.action)
                    const displayName = getActionDisplayName(log.action)
                    const moduleName = getModuleDisplayName(log.module)

                    return (
                      <TableRow
                        key={log.id}
                        className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                          index % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50/50 dark:bg-gray-800/30"
                        )}
                      >
                        <TableCell className="whitespace-nowrap">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm font-medium cursor-help text-gray-700 dark:text-gray-300">
                                  {formatRelativeTime(log.created_at)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{formatDate(log.created_at)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          {log.user ? (
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 ring-2 ring-gray-200 dark:ring-gray-700">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium">
                                  {getUserInitials(log.user)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {log.user.first_name} {log.user.last_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {log.user.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={color as any} className="flex items-center gap-1.5 whitespace-nowrap">
                            <Icon className="h-3 w-3" />
                            {displayName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">
                            {moduleName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs">
                            {log.description || '—'}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                                  onClick={() => handleViewLog(log)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between py-4 px-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700 dark:text-gray-300">{logs.length}</span> of{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">{meta?.total || 0}</span> logs
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={filters.per_page.toString()}
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 text-gray-600 dark:text-gray-400">
                Page <span className="font-medium">{filters.page}</span> of{' '}
                <span className="font-medium">{meta?.last_page || 1}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={!meta || filters.page >= (meta?.last_page || 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* View Log Modal */}
      <ViewLogModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedLog(null)
        }}
        log={selectedLog}
      />
    </PageTemplate>
  )
}
