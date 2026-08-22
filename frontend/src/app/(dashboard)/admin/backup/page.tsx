// app/(dashboard)/admin/backups/page.tsx

'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Server,
  Zap,
  Award,
  Target,
  Rocket,
  Gem,
  Flame,
  Leaf,
  MinusCircle,
  CircleDashed,
  Fingerprint,
  Smartphone,
  History,
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
import { Card, CardContent } from '@/components/ui/card'
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

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    case 'running':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
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

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'manual':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    case 'scheduled':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    case 'auto':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
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
// CREATE BACKUP MODAL (Portal Ready - No Tags)
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
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
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
              className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generated name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Backup Type
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="manual" className="dark:text-white">Manual</SelectItem>
                <SelectItem value="scheduled" className="dark:text-white">Scheduled</SelectItem>
                <SelectItem value="auto" className="dark:text-white">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
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
// DELETE BACKUP MODAL (Portal Ready - No Tags)
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
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
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
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
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
// VIEW BACKUP MODAL (Portal Ready - No Tags)
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
  const statusLabel = getStatusLabel(backup.status)
  const typeLabel = getTypeLabel(backup.type)
  const isRunning = backup.status === 'running'
  const statusBadgeClass = getStatusBadgeClass(backup.status)
  const typeBadgeClass = getTypeBadgeClass(backup.type)

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
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Backup Details
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30 mb-6">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {backup.name}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                <Badge className={cn("flex items-center gap-1 rounded-full", statusBadgeClass)}>
                  <StatusIcon className={cn("h-3 w-3", isRunning && "animate-spin")} />
                  {statusLabel}
                </Badge>
                <Badge className={cn("rounded-full", typeBadgeClass)}>{typeLabel}</Badge>
                <span className="text-xs text-gray-400">#{backup.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">File Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{backup.file_name}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatFileSize(backup.size)}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Disk</p>
              <p className="font-medium text-gray-900 dark:text-white">{backup.disk}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <Badge className={cn("rounded-full", typeBadgeClass)}>{typeLabel}</Badge>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(backup.created_at)}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(backup.completed_at)}</p>
            </div>
            <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Path</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{backup.path}</p>
            </div>
            {backup.error_message && (
              <div className="md:col-span-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Error Message
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{backup.error_message}</p>
              </div>
            )}
            {backup.metadata && (
              <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">Metadata</p>
                <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-40 border border-gray-200 dark:border-gray-700 mt-1">
                  {JSON.stringify(backup.metadata, null, 2)}
                </pre>
              </div>
            )}
            {backup.creator && (
              <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-8 w-8 ring-2 ring-gray-200 dark:ring-gray-700">
                    <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
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
// RESTORE BACKUP MODAL (Portal Ready - No Tags)
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
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
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
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
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
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isRestoring}
              className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
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
// MAIN COMPONENT
// ============================================

export default function BackupsPage() {
  const { hasPermission, isAdmin } = useAuthContext()
  const { success, error: toastError } = useToast()
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
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // Compute stats for StatsCards
  const statsItems: StatCardItem[] = useMemo(() => {
    const total = stats?.total_backups || 0
    const completed = stats?.completed_backups || 0
    const failed = stats?.failed_backups || 0
    const totalSize = stats?.total_size || 0

    return [
      {
        label: "Total Backups",
        value: total,
        icon: Database,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: "All backups",
      },
      {
        label: "Completed",
        value: completed,
        icon: CheckCircle,
        tagLabel: "DONE",
        tagColor: "emerald",
        subtitle: `${completed} successful`,
      },
      {
        label: "Failed",
        value: failed,
        icon: XCircle,
        tagLabel: "FAILED",
        tagColor: "rose",
        subtitle: `${failed} failed backups`,
      },
      {
        label: "Total Size",
        value: formatFileSize(totalSize),
        icon: HardDrive,
        tagLabel: "SIZE",
        tagColor: "purple",
        subtitle: "Total storage used",
      },
    ]
  }, [stats])

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
                You don't have permission to manage backups.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    )
  }

  // Handlers
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
    success('Filters cleared')
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
      success('Backup created successfully')
      setShowCreateModal(false)
      refetch()
    } catch (error) {
      toastError('Failed to create backup')
    }
  }

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return
    try {
      await deleteBackup.mutateAsync(selectedBackup.id)
      success(`Backup "${selectedBackup.name}" deleted successfully`)
      setShowDeleteModal(false)
      setSelectedBackup(null)
      refetch()
    } catch (error) {
      toastError('Failed to delete backup')
    }
  }

  const handleDownloadBackup = async (id: number) => {
    try {
      await downloadBackup.mutateAsync(id)
      success('Backup download started')
    } catch (error) {
      toastError('Failed to download backup')
    }
  }

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return
    try {
      await restoreBackup.mutateAsync(selectedBackup.id)
      success(`Backup "${selectedBackup.name}" restored successfully`)
      setShowRestoreModal(false)
      setSelectedBackup(null)
      refetch()
    } catch (error) {
      toastError('Failed to restore backup')
    }
  }

  const handleCleanBackups = async () => {
    try {
      await cleanBackups.mutateAsync(30)
      success('Old backups cleaned successfully')
      refetch()
    } catch (error) {
      toastError('Failed to clean old backups')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      success('Data refreshed successfully')
    } catch (error) {
      toastError('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <PageTemplate
      title="Backup Management"
      description="Manage system backups and restore points"
      icon={<Database className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Backups' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full">
            <Sparkles className="h-3 w-3 mr-1" />
            {meta?.total || 0} Backups
          </Badge>
          <Button
            variant="outline"
            onClick={handleCleanBackups}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
            Clean Old
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", (isLoading || isRefreshing) && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="gap-2 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            New Backup
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <StatsCards
          stats={statsItems}
          isLoading={statsLoading}
          columns={4}
          variant="default"
          formatCompact={true}
          tagOrientation="wrapped"
          tagPosition="top-left"
        />

        {/* Filters */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">
  
          <CardContent className="p-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search backups..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
              >
                <SelectTrigger className="w-[160px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
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
                <SelectTrigger className="w-[160px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
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
        {(filters.search || filters.status !== 'all' || filters.type !== 'all') && (
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
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="rounded-full text-xs">
                Status: {getStatusLabel(filters.status)}
                <button
                  onClick={() => setFilters({ ...filters, status: 'all', page: 1 })}
                  className="ml-1 hover:text-gray-700"
                >
                  <XCircleIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.type !== 'all' && (
              <Badge variant="secondary" className="rounded-full text-xs">
                Type: {getTypeLabel(filters.type)}
                <button
                  onClick={() => setFilters({ ...filters, type: 'all', page: 1 })}
                  className="ml-1 hover:text-gray-700"
                >
                  <XCircleIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Backups Table */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden relative">
          <WrappedCornerTag label="BACKUPS" color="blue" position="top-left" size="lg" />
          <div className="pt-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Loading backups...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Database className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No backups found</p>
                <p className="text-sm text-gray-400 mt-1">Create your first backup to get started</p>
                <Button onClick={() => setShowCreateModal(true)} className="mt-4 gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  Create Backup
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
                      <TableHead className="min-w-[200px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</TableHead>
                      <TableHead className="min-w-[120px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Type</TableHead>
                      <TableHead className="min-w-[120px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="min-w-[100px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Size</TableHead>
                      <TableHead className="min-w-[150px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Created</TableHead>
                      <TableHead className="text-right min-w-[180px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup: any) => {
                      const StatusIcon = getStatusIcon(backup.status)
                      const statusLabel = getStatusLabel(backup.status)
                      const typeLabel = getTypeLabel(backup.type)
                      const isRunning = backup.status === 'running'
                      const isCompleted = backup.status === 'completed'
                      const statusBadgeClass = getStatusBadgeClass(backup.status)
                      const typeBadgeClass = getTypeBadgeClass(backup.type)

                      return (
                        <TableRow key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-xl",
                                isCompleted ? "bg-emerald-50 dark:bg-emerald-900/20" :
                                  backup.status === 'failed' ? "bg-red-50 dark:bg-red-900/20" :
                                    "bg-blue-50 dark:bg-blue-900/20"
                              )}>
                                <Database className={cn(
                                  "h-4 w-4",
                                  isCompleted ? "text-emerald-600 dark:text-emerald-400" :
                                    backup.status === 'failed' ? "text-red-600 dark:text-red-400" :
                                      "text-blue-600 dark:text-blue-400"
                                )} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                  {backup.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{backup.file_name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs rounded-full", typeBadgeClass)}>
                              {typeLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("flex items-center gap-1.5 rounded-full", statusBadgeClass)}>
                              <StatusIcon className={cn("h-3 w-3", isRunning && "animate-spin")} />
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getFormattedSize(backup.size)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {formatRelativeTime(backup.created_at)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {formatDate(backup.created_at)}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl">
                                  <p className="text-xs">{formatDate(backup.created_at)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      onClick={() => {
                                        setSelectedBackup(backup)
                                        setShowViewModal(true)
                                      }}
                                    >
                                      <Eye className="h-4 w-4 text-gray-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="rounded-xl">View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {isCompleted && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                        onClick={() => handleDownloadBackup(backup.id)}
                                        disabled={downloadBackup.isPending}
                                      >
                                        {downloadBackup.isPending && downloadBackup.variables === backup.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Download className="h-4 w-4 text-gray-500" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-xl">Download Backup</TooltipContent>
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
                                        className="h-8 w-8 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                        onClick={() => {
                                          setSelectedBackup(backup)
                                          setShowRestoreModal(true)
                                        }}
                                      >
                                        <RotateCw className="h-4 w-4 text-gray-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-xl">Restore Backup</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                                  <DropdownMenuLabel className="text-sm font-semibold px-3 py-2 text-gray-700 dark:text-gray-200">Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBackup(backup)
                                      setShowViewModal(true)
                                    }}
                                    className="rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {isCompleted && (
                                    <DropdownMenuItem
                                      onClick={() => handleDownloadBackup(backup.id)}
                                      className="rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                  )}
                                  {isCompleted && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedBackup(backup)
                                        setShowRestoreModal(true)
                                      }}
                                      className="rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                    >
                                      <RotateCw className="h-4 w-4 mr-2" />
                                      Restore
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBackup(backup)
                                      setShowDeleteModal(true)
                                    }}
                                    className="text-red-600 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
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
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 gap-2">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700 dark:text-gray-300">{backups.length}</span> of{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">{meta.total}</span> backups
              </div>
              <div className="flex items-center gap-4">
                <Select
                  value={filters.per_page.toString()}
                  onValueChange={(value) => {
                    setFilters({ ...filters, per_page: parseInt(value), page: 1 })
                  }}
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
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={meta.current_page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2 text-gray-600 dark:text-gray-400">
                    Page <span className="font-medium">{meta.current_page}</span> of{' '}
                    <span className="font-medium">{meta.last_page}</span>
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={meta.current_page >= meta.last_page}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

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
