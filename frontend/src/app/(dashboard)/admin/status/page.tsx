// app/admin/system-status/page.tsx

'use client'

import { useState, useEffect } from 'react'
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Server,
  Database,
  Zap,
  GitBranch,
  HardDrive,
  Lock,
  Globe,
  RefreshCw,
  Clock,
  TrendingUp,
  BarChart3,
  Shield,
  XCircle as XCircleIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast-context'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSystemStatus } from '@/hooks/useSystemStatus'
import { cn } from '@/lib/utils'
import { PageTemplate } from '@/components/dashboard/PageTemplate'
import { Separator } from '@/components/ui/separator'
import {
  getStatusColor,
  getStatusLabel,
  getComponentLabel,
  getComponentColor,
} from '@/types/system-status.types'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatDate = (date: string | null) => {
  if (!date) return 'Never'
  return format(new Date(date), 'MMM d, yyyy HH:mm:ss')
}

const formatRelativeTime = (date: string | null) => {
  if (!date) return 'Never'
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return CheckCircle
    case 'degraded':
      return AlertTriangle
    case 'maintenance':
      return Settings
    case 'down':
      return XCircle
    default:
      return Activity
  }
}

const getComponentIconByName = (component: string) => {
  const iconMap: Record<string, any> = {
    api: Server,
    database: Database,
    cache: Zap,
    queue: GitBranch,
    storage: HardDrive,
    authentication: Lock,
    services: Globe,
  }
  return iconMap[component] || Activity
}

const getStatusBadgeVariant = (status: string): string => {
  return getStatusColor(status)
}

// ============================================
// STATUS HISTORY MODAL (Custom modal like Users page)
// ============================================

const StatusHistoryModal = ({
  isOpen,
  onClose,
  history,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  history: any[]
  isLoading: boolean
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              System Status History
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No status history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Checked At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => {
                    const StatusIcon = getStatusIcon(item.status)
                    const statusColor = getStatusBadgeVariant(item.status)
                    const statusLabel = getStatusLabel(item.status)
                    const componentLabel = getComponentLabel(item.component)

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{componentLabel}</TableCell>
                        <TableCell>
                          <Badge variant={statusColor as any} className="flex items-center gap-1.5">
                            <StatusIcon className="h-3 w-3" />
                            {statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.message || '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatRelativeTime(item.checked_at)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
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
// COMPONENT STATUS CARD
// ============================================

const ComponentStatusCard = ({
  name,
  status,
  component,
}: {
  name: string
  status: string
  component: any
}) => {
  const Icon = getComponentIconByName(name)
  const StatusIcon = getStatusIcon(status)
  const color = getComponentColor(name)
  const statusColor = getStatusBadgeVariant(status)
  const statusLabel = getStatusLabel(status)
  const displayName = getComponentLabel(name)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              `bg-${color}-50 dark:bg-${color}-900/20`
            )}>
              <Icon className={cn("h-5 w-5", `text-${color}-600 dark:text-${color}-400`)} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{displayName}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{name}</p>
            </div>
          </div>
          <Badge variant={statusColor as any} className="flex items-center gap-1.5">
            <StatusIcon className="h-3 w-3" />
            {statusLabel}
          </Badge>
        </div>

        <div className="mt-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">{component.message || 'No message'}</p>
          {component.response_time && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Response: {component.response_time}ms</span>
            </div>
          )}
        </div>

        {component.details && Object.keys(component.details).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {Object.entries(component.details).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                  <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SystemStatusPage() {
  const { hasPermission, isAdmin } = useAuthContext()
  const { error: toastError } = useToast()
  const {
    useCurrentStatus,
    useSummary,
    useHistory,
    refreshStatus,
    getStatusBadgeColor,
    getStatusDisplayLabel,
    getComponentDisplayName,
  } = useSystemStatus()

  // State
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyFilters, setHistoryFilters] = useState({
    component: '',
    status: '',
    limit: 50,
  })

  // Queries
  const {
    data: status,
    isLoading: statusLoading,
    isError: statusError,
    error: statusErrorObj,
    refetch
  } = useCurrentStatus({
    refetchInterval: 60000,
  })

  const {
    data: summary,
    isLoading: summaryLoading,
  } = useSummary()

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory
  } = useHistory(historyFilters)

  // Handlers
  const handleRefresh = () => {
    refreshStatus.mutate()
    refetch()
  }

  const handleViewHistory = () => {
    setShowHistoryModal(true)
    refetchHistory()
  }


  // Loading state
  if (statusLoading || summaryLoading) {
    return (
      <PageTemplate
        title="System Status"
        description="Monitor the health and performance of your system"
        icon={<Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-gray-500">Loading system status...</span>
          </div>
        </div>
      </PageTemplate>
    )
  }

  // Error state
  if (statusError || !status) {
    return (
      <PageTemplate
        title="System Status"
        description="Monitor the health and performance of your system"
        icon={<Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load System Status
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {statusErrorObj?.message || 'Unable to fetch system status information. Please try again.'}
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    )
  }

  const StatusIcon = getStatusIcon(status.status)
  const statusColor = getStatusBadgeColor(status.status)
  const statusLabel = getStatusDisplayLabel(status.status)
  const isHealthy = status.status === 'operational'

  // Sort components
  const sortedComponents = Object.entries(status.components || {}).sort((a, b) => {
    const order = { operational: 0, degraded: 1, maintenance: 2, down: 3 }
    return (order[a[1].status as keyof typeof order] || 99) - (order[b[1].status as keyof typeof order] || 99)
  })

  return (
    <PageTemplate
      title="System Status"
      description="Monitor the health and performance of your system"
      icon={<Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
    >
      {/* Overall Status */}
      <Card className={cn(
        "mb-6 border-l-4",
        isHealthy ? "border-l-emerald-500" : "border-l-amber-500"
      )}>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-full",
                isHealthy ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"
              )}>
                <StatusIcon className={cn(
                  "h-6 w-6",
                  isHealthy ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                )} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  System {isHealthy ? 'Operational' : 'Degraded'}
                </h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <Badge variant={statusColor as any} className="text-xs">
                    {statusLabel}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Last checked: {formatRelativeTime(status.last_checked)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleViewHistory}
                className="gap-2 h-9 text-sm"
              >
                <BarChart3 className="h-4 w-4" />
                History
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={refreshStatus.isPending}
                className="gap-2 h-9 text-sm"
              >
                {refreshStatus.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500">Uptime</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {summary.uptime_percentage}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Checks</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {summary.total_checks}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Components</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {summary.components_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current Status</p>
                <Badge variant={statusColor as any} className="mt-0.5 text-xs">
                  {statusLabel}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Times */}
      {status.response_times && Object.keys(status.response_times).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Response Times (ms)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(status.response_times).map(([component, time]) => (
                <div key={component} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getComponentDisplayName(component)}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {time}ms
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedComponents.length > 0 ? (
          sortedComponents.map(([name, component]) => (
            <ComponentStatusCard
              key={name}
              name={name}
              status={component.status}
              component={component}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No components data available</p>
          </div>
        )}
      </div>

      {/* Status History Modal */}
      <StatusHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={historyData?.data || []}
        isLoading={historyLoading}
      />
    </PageTemplate>
  )
}
