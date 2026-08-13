// app/(dashboard)/admin/backups/page.tsx

'use client'

import { useState } from 'react'
import {
  Database,
  Plus,
  Search,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Shield,
  HardDrive,
  Calendar,
  FilterX,
  RotateCw,
  FileText,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  XCircle as XCircleIcon,
  Sparkles,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast-context'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBackup } from '@/hooks/useBackup'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

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
    case 'pending':
      return Clock
    case 'running':
      return Loader2
    case 'completed':
      return CheckCircle
    case 'failed':
      return XCircle
    default:
      return Activity
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'running':
      return 'info'
    case 'completed':
      return 'success'
    case 'failed':
      return 'danger'
    default:
      return 'secondary'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'running':
      return 'Running'
    case 'completed':
      return 'Completed'
    case 'failed':
      return 'Failed'
    default:
      return status
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'manual':
      return 'Manual'
    case 'scheduled':
      return 'Scheduled'
    case 'auto':
      return 'Auto'
    default:
      return type
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============================================
// CREATE BACKUP MODAL (Portal Ready)
// ============================================

const CreateBackupModal = ({
  isOpen,
  onClose,
  onCreate,
  isCreating,
}: {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: { name: string; type: string }) => void
  isCreating: boolean
}) => {
  const [name, setName] = useState('')
  const [type, setType] = useState('manual')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({ name: name || `Backup_${new Date().toISOString().split('T')[0]}`, type })
  }

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
        className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Create Backup
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Backup Name
            </label>
            <Input
              placeholder="Enter backup name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="dark:bg-gray-900 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generated name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Backup Type
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Create Backup
                </>
              )}
            </button>
          </div>
        </form>
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
// DELETE BACKUP MODAL (Portal Ready)
// ============================================

const DeleteBackupModal = ({
  isOpen,
  onClose,
  onConfirm,
  backupName,
  isDeleting,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  backupName: string
  isDeleting: boolean
}) => {
  if (!isOpen) return null

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Backup</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Are you sure you want to delete the backup "{backupName}"?
          </p>
          <p className="text-sm text-red-500 dark:text-red-400 mb-6">
            This action cannot be undone. The backup file will be permanently removed.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Backup
                </>
              )}
            </button>
          </div>
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
// VIEW BACKUP MODAL (Portal Ready)
// ============================================

const ViewBackupModal = ({
  isOpen,
  onClose,
  backup,
}: {
  isOpen: boolean
  onClose: () => void
  backup: any | null
}) => {
  if (!isOpen || !backup) return null

  const StatusIcon = getStatusIcon(backup.status)
  const statusColor = getStatusColor(backup.status)
  const statusLabel = getStatusLabel(backup.status)
  const typeLabel = getTypeLabel(backup.type)
  const isRunning = backup.status === 'running'

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
        className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Backup Details
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {backup.name}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <Badge variant={statusColor as any} className="flex items-center gap-1">
                  <StatusIcon className={cn("h-3 w-3", isRunning && "animate-spin")} />
                  {statusLabel}
                </Badge>
                <Badge variant="secondary">{typeLabel}</Badge>
                <span>#{backup.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">File Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{backup.file_name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Size</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatFileSize(backup.size)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Disk</p>
              <p className="font-medium text-gray-900 dark:text-white">{backup.disk}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Type</p>
              <Badge variant="secondary">{typeLabel}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(backup.created_at)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(backup.completed_at)}</p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <p className="text-sm text-gray-500">Path</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{backup.path}</p>
            </div>
            {backup.error_message && (
              <div className="md:col-span-2 space-y-2">
                <p className="text-sm text-red-600 dark:text-red-400">Error Message</p>
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {backup.error_message}
                </p>
              </div>
            )}
            {backup.metadata && (
              <div className="md:col-span-2 space-y-2">
                <p className="text-sm text-gray-500">Metadata</p>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto max-h-40">
                  {JSON.stringify(backup.metadata, null, 2)}
                </pre>
              </div>
            )}
            {backup.creator && (
              <div className="md:col-span-2 space-y-2">
                <p className="text-sm text-gray-500">Created By</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {backup.creator.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {backup.creator.full_name}
                  </span>
                  <span className="text-sm text-gray-500">({backup.creator.email})</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg shadow-blue-600/20"
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
// RESTORE BACKUP MODAL (Portal Ready)
// ============================================

const RestoreBackupModal = ({
  isOpen,
  onClose,
  onConfirm,
  backup,
  isRestoring,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  backup: any | null
  isRestoring: boolean
}) => {
  if (!isOpen || !backup) return null

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
        className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Restore Backup</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Are you sure you want to restore from this backup?
          </p>
          <p className="text-sm text-red-500 dark:text-red-400 mb-4">
            This will overwrite current data. This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-4">
            <Database className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {backup.name}
              </p>
              <p className="text-xs text-gray-500">
                Created: {formatDate(backup.created_at)}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isRestoring}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCw className="h-4 w-4" />
                  Restore Backup
                </>
              )}
            </button>
          </div>
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
// STATS CARDS
// ============================================

const StatsCards = ({ stats, isLoading }: { stats: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      label: 'Total Backups',
      value: stats.total_backups || 0,
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Completed',
      value: stats.completed_backups || 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Failed',
      value: stats.failed_backups || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Total Size',
      value: formatFileSize(stats.total_size || 0),
      icon: HardDrive,
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
                    {item.value}
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
// MAIN COMPONENT
// ============================================

export default function BackupsPage() {
  const { hasPermission, isAdmin } = useAuthContext()
  const { error: toastError } = useToast()
  const {
    useBackups,
    useStats,
    createBackup,
    deleteBackup,
    downloadBackup,
    restoreBackup,
    cleanBackups,
    getStatusColor,
    getStatusLabel,
    getTypeLabel,
    getFormattedSize,
  } = useBackup()

  // State
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    sort_by: 'created_at',
    sort_order: 'desc' as 'asc' | 'desc',
    per_page: 20,
    page: 1,
  })
  const [selectedBackup, setSelectedBackup] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)

  // Queries
  const { data: backupsData, isLoading, refetch } = useBackups({
    search: filters.search || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    type: filters.type !== 'all' ? filters.type : undefined,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
    per_page: filters.per_page,
    page: filters.page,
  })

  const { data: stats, isLoading: statsLoading } = useStats()

  // Process data
  const backups = backupsData?.backups || []
  const meta = backupsData?.meta

  // Check permissions
  if (!hasPermission('manage_backups') && !isAdmin()) {
    return (
      <PageTemplate
        title="Backup Management"
        description="Manage system backups and restore points"
        icon={<Database className="h-5 w-5" />}
        background="gradient"
      >
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
                You don't have permission to manage backups.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    )
  }

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      type: 'all',
      sort_by: 'created_at',
      sort_order: 'desc',
      per_page: 20,
      page: 1,
    })
    setTimeout(refetch, 100)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (meta?.last_page || 1)) {
      setFilters({ ...filters, page: newPage })
    }
  }

  const handleCreateBackup = async (data: { name: string; type: string }) => {
    try {
      await createBackup.mutateAsync({
        name: data.name,
        type: data.type as 'manual' | 'scheduled' | 'auto',
      })
      setShowCreateModal(false)
      refetch()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return
    try {
      await deleteBackup.mutateAsync(selectedBackup.id)
      setShowDeleteModal(false)
      setSelectedBackup(null)
      refetch()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDownloadBackup = async (id: number) => {
    try {
      await downloadBackup.mutateAsync(id)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return
    try {
      await restoreBackup.mutateAsync(selectedBackup.id)
      setShowRestoreModal(false)
      setSelectedBackup(null)
      refetch()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleCleanBackups = async () => {
    try {
      await cleanBackups.mutateAsync(30)
      refetch()
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <PageTemplate
      title="Backup Management"
      description="Manage system backups and restore points"
      icon={<Database className="h-5 w-5" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Backups' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 dark:bg-primary/20 text-primary border-primary/20 dark:border-primary/30">
            <Sparkles className="h-3 w-3 mr-1" />
            {meta?.total || 0} Backups
          </Badge>
          <Button
            variant="outline"
            onClick={handleCleanBackups}
            className="gap-2 dark:border-gray-700 dark:hover:bg-gray-800"
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
            Clean Old
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="gap-2 dark:border-gray-700 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            New Backup
          </Button>
        </div>
      }
    >
      {/* Stats */}
      <StatsCards stats={stats} isLoading={statsLoading} />

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search backups..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-9 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <SelectTrigger className="w-[160px] dark:bg-gray-900 dark:border-gray-700">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value, page: 1 })}
            >
              <SelectTrigger className="w-[160px] dark:bg-gray-900 dark:border-gray-700">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="gap-2 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-sm">
            {meta?.total || 0} backups
          </Badge>
          {filters.search && (
            <Badge variant="outline" className="text-sm">
              Search: {filters.search}
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="outline" className="text-sm">
              Status: {getStatusLabel(filters.status)}
            </Badge>
          )}
          {filters.type !== 'all' && (
            <Badge variant="outline" className="text-sm">
              Type: {getTypeLabel(filters.type)}
            </Badge>
          )}
        </div>
      </div>

      {/* Backups Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Database className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No backups found</p>
              <p className="text-sm text-gray-400 mt-1">Create your first backup to get started</p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Backup
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead className="min-w-[120px]">Type</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Size</TableHead>
                    <TableHead className="min-w-[150px]">Created</TableHead>
                    <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup: any) => {
                    const StatusIcon = getStatusIcon(backup.status)
                    const statusColor = getStatusColor(backup.status)
                    const statusLabel = getStatusLabel(backup.status)
                    const typeLabel = getTypeLabel(backup.type)
                    const isRunning = backup.status === 'running'
                    const isCompleted = backup.status === 'completed'

                    return (
                      <TableRow key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                              <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                {backup.name}
                              </p>
                              <p className="text-xs text-gray-500">{backup.file_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {typeLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor as any} className="flex items-center gap-1.5">
                            <StatusIcon className={cn("h-3 w-3", isRunning && "animate-spin")} />
                            {statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {getFormattedSize(backup.size)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatRelativeTime(backup.created_at)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(backup.created_at)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    onClick={() => {
                                      setSelectedBackup(backup)
                                      setShowViewModal(true)
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {isCompleted && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                      onClick={() => handleDownloadBackup(backup.id)}
                                      disabled={downloadBackup.isPending}
                                    >
                                      {downloadBackup.isPending && downloadBackup.variables === backup.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Download className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Download Backup</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            {isCompleted && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                      onClick={() => {
                                        setSelectedBackup(backup)
                                        setShowRestoreModal(true)
                                      }}
                                    >
                                      <RotateCw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Restore Backup</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedBackup(backup)
                                  setShowViewModal(true)
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {isCompleted && (
                                  <DropdownMenuItem onClick={() => handleDownloadBackup(backup.id)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                )}
                                {isCompleted && (
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedBackup(backup)
                                    setShowRestoreModal(true)
                                  }}>
                                    <RotateCw className="h-4 w-4 mr-2" />
                                    Restore
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedBackup(backup)
                                    setShowDeleteModal(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {meta && meta.last_page > 1 && (
          <CardFooter className="flex items-center justify-between py-4 px-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{backups.length}</span> of{' '}
              <span className="font-medium">{meta.total}</span> backups
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(meta.current_page - 1)}
                disabled={meta.current_page <= 1}
                className="h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page <span className="font-medium">{meta.current_page}</span> of{' '}
                <span className="font-medium">{meta.last_page}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(meta.current_page + 1)}
                disabled={meta.current_page >= meta.last_page}
                className="h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* ============================================
          MODALS - Rendered using Portal
          ============================================ */}

      <CreateBackupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateBackup}
        isCreating={createBackup.isPending}
      />

      <DeleteBackupModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedBackup(null)
        }}
        onConfirm={handleDeleteBackup}
        backupName={selectedBackup?.name || ''}
        isDeleting={deleteBackup.isPending}
      />

      <ViewBackupModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedBackup(null)
        }}
        backup={selectedBackup}
      />

      <RestoreBackupModal
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false)
          setSelectedBackup(null)
        }}
        onConfirm={handleRestoreBackup}
        backup={selectedBackup}
        isRestoring={restoreBackup.isPending}
      />
    </PageTemplate>
  )
}
