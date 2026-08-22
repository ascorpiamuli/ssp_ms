// app/(dashboard)/admin/audit-logs/page.tsx

'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Sparkles,
  Calendar,
  Fingerprint,
  Smartphone,
  History,
  Zap,
  Award,
  Target,
  Rocket,
  Gem,
  Flame,
  Leaf,
  MinusCircle,
  CircleDashed,
  Globe,
  Monitor,
  Laptop,
  Tablet,
  Database,
  Plus,
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
import { Card, CardContent } from '@/components/ui/card'
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
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards'
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag'
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag'

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

const truncateText = (text: string, maxLength: number = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// ============================================
// VIEW LOG DETAILS MODAL (Portal Ready - No Tags)
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

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Audit Log Details
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30 mb-6">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {displayName}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                <Badge variant={color as any} className="flex items-center gap-1 rounded-full">
                  <Icon className="h-3 w-3" />
                  {displayName}
                </Badge>
                <Badge variant="secondary" className="rounded-full">{moduleName}</Badge>
                <span className="text-xs text-gray-400">#{log.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Timestamp</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(log.created_at)}</p>
              <p className="text-xs text-gray-400">{formatRelativeTime(log.created_at)}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
              {log.user ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <Avatar className="h-7 w-7 ring-2 ring-gray-200 dark:ring-gray-700">
                    <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
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
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">IP Address</p>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                <Fingerprint className="h-3.5 w-3.5 text-blue-500" />
                {log.ip_address || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Module</p>
              <Badge variant="secondary" className="rounded-full">{moduleName}</Badge>
            </div>
            <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p className="text-gray-900 dark:text-white">{log.description || 'No description'}</p>
            </div>
          </div>

          {log.entity_type && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Entity Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">{log.entity_type}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Entity ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{log.entity_id || 'N/A'}</p>
                </div>
              </div>
            </>
          )}

          {(log.old_values || log.new_values) && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-500" />
                  Changes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {log.old_values && (
                    <div className="space-y-2">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <MinusCircle className="h-3.5 w-3.5" />
                        Old Values
                      </p>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-xl overflow-auto max-h-40 border border-gray-200 dark:border-gray-700">
                        {JSON.stringify(log.old_values, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.new_values && (
                    <div className="space-y-2">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        New Values
                      </p>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-xl overflow-auto max-h-40 border border-gray-200 dark:border-gray-700">
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
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-500" />
                  Metadata
                </h4>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-xl overflow-auto max-h-40 border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </>
          )}

          {log.data && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  Additional Data
                </h4>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-xl overflow-auto max-h-40 border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </div>
            </>
          )}

          {log.user_agent && (
            <>
              <Separator className="my-4" />
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-purple-500" />
                  User Agent
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all mt-1">{log.user_agent}</p>
              </div>
            </>
          )}

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-blue-600/20"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(
      <AnimatePresence>
        {isOpen && modalContent}
      </AnimatePresence>,
      document.body
    )
  }

  return null
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AuditLogsPage() {
  const { hasPermission, isAdmin } = useAuthContext()
  const { success, error: toastError } = useToast()
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
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // Compute stats for StatsCards
  const statsItems: StatCardItem[] = useMemo(() => {
    const total = stats?.total_logs || 0
    const today = stats?.today_logs || 0
    const week = stats?.week_logs || 0
    const uniqueUsers = stats?.unique_users || 0

    return [
      {
        label: "Total Logs",
        value: total,
        icon: FileText,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: "All audit records",
      },
      {
        label: "Today",
        value: today,
        icon: Clock,
        tagLabel: "TODAY",
        tagColor: "emerald",
        subtitle: `${today} logs today`,
      },
      {
        label: "This Week",
        value: week,
        icon: Activity,
        tagLabel: "WEEK",
        tagColor: "amber",
        subtitle: `${week} logs this week`,
      },
      {
        label: "Unique Users",
        value: uniqueUsers,
        icon: Users,
        tagLabel: "USERS",
        tagColor: "purple",
        subtitle: `${uniqueUsers} active users`,
      },
    ]
  }, [stats])

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
    success('Filters cleared')
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
      success('Logs exported successfully')
    } catch (error) {
      toastError('Failed to export audit logs')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        logsQuery.refetch(),
        statsQuery.refetch(),
        modulesQuery.refetch(),
        actionsQuery.refetch(),
      ])
      success('Data refreshed successfully')
    } catch (error) {
      toastError('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Check permissions
  if (!hasPermission('view_audit_logs') && !isAdmin()) {
    return (
      <PageTemplate
        title="Audit Logs"
        description="View and monitor all system activities"
        icon={<Shield className="h-5 w-5" />}
        background="gradient"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md relative">
            <WrappedCornerTag label="DENIED" color="red" position="top-left" size="lg" />
            <CardContent className="pt-8 text-center">
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
      </PageTemplate>
    )
  }

  return (
    <PageTemplate
      title="Audit Logs"
      description="View and monitor all system activities with forensic tracking"
      icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Audit Logs' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full">
            <Sparkles className="h-3 w-3 mr-1" />
            {meta?.total || 0} Logs
          </Badge>
          <Button
            variant="outline"
            onClick={handleExport}
            size="sm"
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            disabled={logsQuery.isLoading || isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", (logsQuery.isLoading || isRefreshing) && "animate-spin")} />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <StatsCards
          stats={statsItems}
          isLoading={statsQuery.isLoading}
          columns={4}
          variant="default"
          formatCompact={true}
          tagOrientation="wrapped"
          tagPosition="top-left"
        />

        {/* Filters */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">
          <HorizontalCornerTag label="FILTERS" color="blue" position="top-left" size="sm" variant="rounded" />
          <CardContent className="p-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search logs by user, action, or description..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>
              <Select
                value={filters.module}
                onValueChange={(value) => setFilters({ ...filters, module: value, page: 1 })}
              >
                <SelectTrigger className="w-[180px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Modules</SelectItem>
                  {modulesQuery.data?.map((module: any) => (
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
                <SelectTrigger className="w-[180px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionsQuery.data?.map((action: any) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="gap-2 h-11 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <FilterX className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters */}
        {(filters.search || filters.module !== 'all' || filters.action !== 'all' || filters.start_date || filters.end_date) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
            {filters.search && (
              <Badge variant="secondary" className="rounded-full text-xs">
                Search: {filters.search}
                <button
                  onClick={() => setFilters({ ...filters, search: '', page: 1 })}
                  className="ml-1 hover:text-gray-700"
                >
                  <XCircleIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.module !== 'all' && (
              <Badge variant="secondary" className="rounded-full text-xs">
                Module: {getModuleDisplayName(filters.module)}
                <button
                  onClick={() => setFilters({ ...filters, module: 'all', page: 1 })}
                  className="ml-1 hover:text-gray-700"
                >
                  <XCircleIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.action !== 'all' && (
              <Badge variant="secondary" className="rounded-full text-xs">
                Action: {getActionDisplayName(filters.action)}
                <button
                  onClick={() => setFilters({ ...filters, action: 'all', page: 1 })}
                  className="ml-1 hover:text-gray-700"
                >
                  <XCircleIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Logs Table */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden relative">
          <WrappedCornerTag label="AUDIT LOGS" color="blue" position="top-left" size="lg" />
          <div className="pt-8">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
                    <TableHead className="min-w-[150px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Timestamp</TableHead>
                    <TableHead className="min-w-[220px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</TableHead>
                    <TableHead className="min-w-[150px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Action</TableHead>
                    <TableHead className="min-w-[150px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Module</TableHead>
                    <TableHead className="min-w-[200px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Description</TableHead>
                    <TableHead className="min-w-[120px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">IP Address</TableHead>
                    <TableHead className="text-right min-w-[80px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-500">Loading audit logs...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : logsQuery.isError ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <AlertCircle className="h-12 w-12 text-red-500" />
                          <p className="text-sm font-medium text-gray-500">Failed to load audit logs</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="gap-2 rounded-xl"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
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
                            "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group",
                            index % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50/30 dark:bg-gray-800/20"
                          )}
                        >
                          <TableCell className="whitespace-nowrap">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm font-medium cursor-help text-gray-700 dark:text-gray-300 flex flex-col">
                                    <span>{formatRelativeTime(log.created_at)}</span>
                                    <span className="text-xs text-gray-400">{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl">
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
                            <Badge variant={color as any} className="flex items-center gap-1.5 whitespace-nowrap rounded-full">
                              <Icon className="h-3 w-3" />
                              {displayName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs whitespace-nowrap rounded-full">
                              {moduleName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs cursor-help">
                                    {truncateText(log.description || '—', 40)}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl max-w-md">
                                  <p className="text-xs">{log.description || '—'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                              {log.ip_address || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                                    onClick={() => handleViewLog(log)}
                                  >
                                    <Eye className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl">View Details</TooltipContent>
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
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 gap-2">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700 dark:text-gray-300">{logs.length}</span> of{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{meta?.total || 0}</span> logs
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={filters.per_page.toString()}
                onValueChange={handlePerPageChange}
              >
                <SelectTrigger className="w-[80px] h-9 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="10" className="dark:text-white">10</SelectItem>
                  <SelectItem value="20" className="dark:text-white">20</SelectItem>
                  <SelectItem value="50" className="dark:text-white">50</SelectItem>
                  <SelectItem value="100" className="dark:text-white">100</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2 text-gray-600 dark:text-gray-400">
                  Page <span className="font-medium">{filters.page}</span> of{' '}
                  <span className="font-medium">{meta?.last_page || 1}</span>
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!meta || filters.page >= (meta?.last_page || 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

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
