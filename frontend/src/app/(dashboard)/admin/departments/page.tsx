// app/(dashboard)/admin/departments/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Save,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Eye,
  MoreVertical,
  AlertCircle,
  Check,
  X,
  UserPlus,
  UserMinus,
  Crown,
  Mail,
  Phone,
  Shield,
  XCircle,
  User,
  Sparkles,
  FilterX,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Award,
  Briefcase,
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
import { useDepartments } from '@/hooks/useDepartments'
import { useUsers } from '@/hooks/useUsers'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { PageTemplate } from '@/components/dashboard/PageTemplate'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// TYPES
// ============================================

interface Department {
  id: number
  name: string
  code: string
  description?: string
  is_active: boolean
  hod_id?: number
  hod?: {
    id: number
    first_name: string
    last_name: string
    full_name: string
    email: string
    phone?: string
    avatar_url?: string
  }
  users_count: number
  created_at: string
  updated_at: string
}

interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  role: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatDate = (date: string | null) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTimeAgo = (date: string | null) => {
  if (!date) return 'Never'
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

const getStatusColor = (isActive: boolean) => {
  return isActive
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
}

const getStatusIcon = (isActive: boolean) => {
  return isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />
}

// ============================================
// MODAL COMPONENTS (Portal Ready)
// ============================================

// Create/Edit Department Modal
const DepartmentFormModal = ({
  isOpen,
  isEdit,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  formErrors,
  setFormErrors,
}: {
  isOpen: boolean
  isEdit: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: any
  isSubmitting: boolean
  formErrors: Record<string, string>
  setFormErrors: (errors: Record<string, string>) => void
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  })

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
      })
    } else if (!isEdit) {
      setFormData({
        name: '',
        code: '',
        description: '',
      })
    }
  }, [initialData, isEdit, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

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
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Department' : 'Create New Department'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 bg-white dark:bg-gray-900">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Computer Science"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (formErrors.name) setFormErrors({ ...formErrors, name: '' })
              }}
              className={cn("dark:bg-gray-800 dark:border-gray-700 dark:text-white", formErrors.name ? 'border-red-500' : '')}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department Code <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., CS"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
                if (formErrors.code) setFormErrors({ ...formErrors, code: '' })
              }}
              className={cn("dark:bg-gray-800 dark:border-gray-700 dark:text-white", formErrors.code ? 'border-red-500' : '')}
            />
            {formErrors.code && (
              <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <Input
              placeholder="Brief description of the department"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? 'Update Department' : 'Create Department'}
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

// View Department Modal
const ViewDepartmentModal = ({
  isOpen,
  onClose,
  department
}: {
  isOpen: boolean
  onClose: () => void
  department: Department | null
}) => {
  if (!isOpen || !department) return null

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
        className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {department.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{department.code}</Badge>
                <Badge className={cn("text-xs", getStatusColor(department.is_active))}>
                  {department.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Department Name</p>
              <p className="font-semibold text-gray-900 dark:text-white">{department.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Department Code</p>
              <Badge variant="secondary">{department.code}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <Badge className={cn("text-xs", getStatusColor(department.is_active))}>
                {department.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <Badge variant="outline">{department.users_count || 0} users</Badge>
            </div>
            {department.description && (
              <div className="col-span-2 space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                <p className="text-gray-900 dark:text-white">{department.description}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-gray-900 dark:text-white">{formatDate(department.created_at)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="text-gray-900 dark:text-white">{formatDate(department.updated_at)}</p>
            </div>
          </div>

          {department.hod && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Head of Department
                </h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm">
                      {department.hod.first_name?.[0]}{department.hod.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {department.hod.full_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{department.hod.email}</p>
                    {department.hod.phone && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{department.hod.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {!department.hod && department.hod_id && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  Head of Department (User Deleted)
                </h4>
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <UserX className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      User ID: {department.hod_id}
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      The previously assigned HOD has been deleted.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
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

// Delete Department Modal
const DeleteDepartmentModal = ({
  isOpen,
  onClose,
  onConfirm,
  departmentName,
  usersCount,
  isDeleting
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  departmentName: string
  usersCount: number
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
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Department</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Are you sure you want to delete the department "{departmentName}"?
          </p>
          {usersCount > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
              This department has {usersCount} user(s). Users must be reassigned before deletion.
            </p>
          )}
          <p className="text-sm text-red-500 dark:text-red-400 mb-6">
            This action cannot be undone.
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
              disabled={isDeleting || usersCount > 0}
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
                  Delete Department
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

// Assign HOD Modal - FIXED: Better z-index management
const AssignHODModal = ({
  isOpen,
  onClose,
  onConfirm,
  departmentName,
  users,
  hodUserId,
  setHodUserId,
  selectedHOD,
  setSelectedHOD,
  isSubmitting
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  departmentName: string
  users: User[]
  hodUserId: string
  setHodUserId: (value: string) => void
  selectedHOD: User | null
  setSelectedHOD: (user: User | null) => void
  isSubmitting: boolean
}) => {
  if (!isOpen) return null

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
        className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl relative z-[10000]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-[10001]">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Assign Head of Department
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a user to assign as Head of Department for "{departmentName}".
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select User <span className="text-red-500">*</span>
            </label>
            <Select
              value={hodUserId}
              onValueChange={(value) => {
                setHodUserId(value)
                const user = users.find(u => u.id === parseInt(value))
                setSelectedHOD(user || null)
              }}
            >
              <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full">
                <SelectValue placeholder="Select a user to assign as HOD" />
              </SelectTrigger>
              <SelectContent
                className="dark:bg-gray-800 dark:border-gray-700 z-[10002]"
                position="popper"
                sideOffset={4}
              >
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()} className="dark:text-white">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {user.full_name}
                      <span className="text-xs text-gray-400">({user.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedHOD && (
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <User className="h-3 w-3" />
                Selected: {selectedHOD.full_name} ({selectedHOD.email})
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting || !hodUserId}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Assign HOD
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

export default function AdminDepartmentsPage() {
  const { user: currentUser, hasPermission, isAdmin } = useAuthContext()
  const { success, error: toastError } = useToast()
  const {
    useAllDepartments,
    useDepartmentStats,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    activateDepartment,
    deactivateDepartment,
    assignHOD,
    removeHOD,
  } = useDepartments()
  const { useGetUsers } = useUsers()

  // Queries
  const { data: departmentsData, isLoading: deptLoading, refetch: refetchDepts, error: deptError } = useAllDepartments()
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats, error: statsError } = useDepartmentStats()
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetUsers({ per_page: 1000 })

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showAssignHODDialog, setShowAssignHODDialog] = useState(false)

  // Form states
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    code: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [hodUserId, setHodUserId] = useState<string>('')
  const [selectedHOD, setSelectedHOD] = useState<User | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Process data
  let departments: Department[] = []
  if (departmentsData?.data) {
    departments = departmentsData.data
  } else if (Array.isArray(departmentsData)) {
    departments = departmentsData
  } else if (departmentsData?.departments) {
    departments = departmentsData.departments
  }

  const stats = statsData?.data || statsData || {}
  let users: User[] = []
  if (usersData?.data) {
    users = usersData.data
  } else if (Array.isArray(usersData)) {
    users = usersData
  }

  // Filter departments
  const filteredDepartments = useMemo(() => {
    let result = departments
    if (searchTerm) {
      result = result.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    }
    return result
  }, [departments, searchTerm])

  // Paginate departments
  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredDepartments.slice(start, end)
  }, [filteredDepartments, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage)

  // Stats
  const totalDepartments = departments.length
  const activeDepartments = departments.filter(d => d.is_active).length
  const inactiveDepartments = departments.filter(d => !d.is_active).length
  const totalUsersInDepts = departments.reduce((acc, d) => acc + (d.users_count || 0), 0)
  const departmentsWithHOD = departments.filter(d => d.hod_id).length
  const departmentsWithValidHOD = departments.filter(d => d.hod).length

  // Permissions
  const canCreateDepartments = hasPermission('create_departments') || isAdmin()
  const canEditDepartments = hasPermission('edit_departments') || isAdmin()
  const canDeleteDepartments = hasPermission('delete_departments') || isAdmin()
  const canViewDepartments = hasPermission('view_departments') || isAdmin()

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Handlers
  const handleCreateDepartment = async (data: any) => {
    const errors: Record<string, string> = {}
    if (!data.name) errors.name = 'Department name is required'
    if (!data.code) errors.code = 'Department code is required'
    if (departments.some(d => d.code === data.code.toUpperCase())) {
      errors.code = 'Department code already exists'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await createDepartment.mutateAsync({
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description,
      })
      success('Department created successfully')
      setShowCreateDialog(false)
      setDepartmentForm({ name: '', code: '', description: '' })
      setFormErrors({})
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      toastError(error.message || 'Failed to create department')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateDepartment = async (data: any) => {
    if (!selectedDepartment) return

    const errors: Record<string, string> = {}
    if (!data.name) errors.name = 'Department name is required'
    if (!data.code) errors.code = 'Department code is required'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await updateDepartment.mutateAsync({
        id: selectedDepartment.id,
        data: {
          name: data.name,
          code: data.code.toUpperCase(),
          description: data.description,
        }
      })
      success('Department updated successfully')
      setShowEditDialog(false)
      setSelectedDepartment(null)
      setDepartmentForm({ name: '', code: '', description: '' })
      setFormErrors({})
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      toastError(error.message || 'Failed to update department')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return
    setIsSubmitting(true)
    try {
      await deleteDepartment.mutateAsync(selectedDepartment.id)
      success(`Department "${selectedDepartment.name}" deleted successfully`)
      setShowDeleteDialog(false)
      setSelectedDepartment(null)
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      toastError(error.message || 'Failed to delete department')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await deactivateDepartment.mutateAsync(id)
        success('Department deactivated successfully')
      } else {
        await activateDepartment.mutateAsync(id)
        success('Department activated successfully')
      }
      await refetchDepts()
      await refetchStats()
    } catch (error: any) {
      toastError(error.message || 'Failed to update department status')
    }
  }

  const handleAssignHOD = async () => {
    if (!selectedDepartment || !hodUserId) {
      toastError('Please select a user to assign as HOD')
      return
    }

    setIsSubmitting(true)
    try {
      await assignHOD.mutateAsync({
        id: selectedDepartment.id,
        hod_id: parseInt(hodUserId)
      })
      success('HOD assigned successfully')
      setShowAssignHODDialog(false)
      setHodUserId('')
      setSelectedHOD(null)
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat()
        toastError(errorMessages.join(', '))
      } else {
        toastError(error.message || 'Failed to assign HOD')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveHOD = async (departmentId: number) => {
    try {
      await removeHOD.mutateAsync(departmentId)
      success('HOD removed successfully')
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      toastError(error.message || 'Failed to remove HOD')
    }
  }

  // Loading state
  const isLoading = deptLoading || statsLoading || usersLoading

  // Check permissions
  if (!canViewDepartments) {
    return (
      <PageTemplate
        title="Department Management"
        description="Manage departments and assign Heads of Department"
        icon={<Building2 className="h-5 w-5" />}
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
                You don't have permission to view departments.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    )
  }

  // Error state
  if (deptError || statsError || usersError) {
    return (
      <PageTemplate
        title="Department Management"
        description="Manage departments and assign Heads of Department"
        icon={<Building2 className="h-5 w-5" />}
        background="gradient"
      >
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Departments</AlertTitle>
          <AlertDescription>
            <p>Failed to load departments data. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              refetchDepts()
              refetchStats()
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </PageTemplate>
    )
  }

  return (
    <PageTemplate
      title="Department Management"
      description="Manage departments and assign Heads of Department"
      icon={<Building2 className="h-5 w-5" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Departments' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5">
            <Sparkles className="h-3 w-3 mr-1" />
            {totalDepartments} Departments
          </Badge>
          {canCreateDepartments && (
            <Button
              size="sm"
              onClick={() => {
                setDepartmentForm({ name: '', code: '', description: '' })
                setFormErrors({})
                setShowCreateDialog(true)
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Department
            </Button>
          )}
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDepartments}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeDepartments}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveDepartments}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Users</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalUsersInDepts}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">With HOD</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{departmentsWithValidHOD}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search departments by name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="gap-2"
            >
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchDepts()
                refetchStats()
              }}
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-500">Loading departments...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No departments found</p>
            {searchTerm && <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>}
            {!searchTerm && <p className="text-sm text-gray-400 mt-1">Create a department to get started</p>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
                    <TableHead className="min-w-[200px]">Department</TableHead>
                    <TableHead className="min-w-[80px]">Code</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[80px]">Users</TableHead>
                    <TableHead className="min-w-[180px]">Head of Department</TableHead>
                    <TableHead className="min-w-[150px]">Created</TableHead>
                    <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDepartments.map((department) => (
                    <TableRow key={department.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{department.name}</p>
                            {department.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                {department.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {department.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs border flex items-center gap-1 w-fit", getStatusColor(department.is_active))}>
                          {getStatusIcon(department.is_active)}
                          {department.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {department.users_count || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {department.hod ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 ring-2 ring-yellow-200 dark:ring-yellow-800">
                              <AvatarFallback className="text-xs bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                                {department.hod.first_name?.[0]}
                                {department.hod.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {department.hod.full_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {department.hod.email}
                              </p>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Crown className="h-3.5 w-3.5 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>Head of Department</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ) : department.hod_id ? (
                          <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            User deleted (ID: {department.hod_id})
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 flex items-center gap-1">
                            <UserX className="h-3.5 w-3.5" />
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatTimeAgo(department.created_at)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{formatDate(department.created_at)}</p>
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
                                  className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  onClick={() => {
                                    setSelectedDepartment(department)
                                    setShowViewDialog(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 text-gray-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {canEditDepartments && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedDepartment(department)
                                    setDepartmentForm({
                                      name: department.name,
                                      code: department.code,
                                      description: department.description || '',
                                    })
                                    setFormErrors({})
                                    setShowEditDialog(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(department.id, department.is_active)}
                              >
                                {department.is_active ? (
                                  <>
                                    <X className="h-4 w-4 mr-2 text-red-500" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-2 text-emerald-500" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {department.hod ? (
                                <DropdownMenuItem
                                  onClick={() => handleRemoveHOD(department.id)}
                                  className="text-red-600"
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Remove HOD
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedDepartment(department)
                                    setHodUserId('')
                                    setSelectedHOD(null)
                                    setShowAssignHODDialog(true)
                                  }}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Assign HOD
                                </DropdownMenuItem>
                              )}
                              {canDeleteDepartments && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedDepartment(department)
                                      setShowDeleteDialog(true)
                                    }}
                                    className="text-red-600"
                                    disabled={department.users_count > 0}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between py-3 px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700 dark:text-gray-300">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDepartments.length)}
                </span> to{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {Math.min(currentPage * itemsPerPage, filteredDepartments.length)}
                </span> of{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">{filteredDepartments.length}</span> departments
              </div>
              <div className="flex items-center gap-4">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[80px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="5" className="dark:text-white">5</SelectItem>
                    <SelectItem value="10" className="dark:text-white">10</SelectItem>
                    <SelectItem value="25" className="dark:text-white">25</SelectItem>
                    <SelectItem value="50" className="dark:text-white">50</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============================================
          MODALS - Rendered using Portal
          ============================================ */}

      <DepartmentFormModal
        isOpen={showCreateDialog}
        isEdit={false}
        onClose={() => {
          setShowCreateDialog(false)
          setFormErrors({})
          setDepartmentForm({ name: '', code: '', description: '' })
        }}
        onSubmit={handleCreateDepartment}
        initialData={null}
        isSubmitting={isSubmitting}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
      />

      <DepartmentFormModal
        isOpen={showEditDialog}
        isEdit={true}
        onClose={() => {
          setShowEditDialog(false)
          setFormErrors({})
          setSelectedDepartment(null)
        }}
        onSubmit={handleUpdateDepartment}
        initialData={departmentForm}
        isSubmitting={isSubmitting}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
      />

      <ViewDepartmentModal
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false)
          setSelectedDepartment(null)
        }}
        department={selectedDepartment}
      />

      <DeleteDepartmentModal
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedDepartment(null)
        }}
        onConfirm={handleDeleteDepartment}
        departmentName={selectedDepartment?.name || ''}
        usersCount={selectedDepartment?.users_count || 0}
        isDeleting={isSubmitting}
      />

      <AssignHODModal
        isOpen={showAssignHODDialog}
        onClose={() => {
          setShowAssignHODDialog(false)
          setHodUserId('')
          setSelectedHOD(null)
          setSelectedDepartment(null)
        }}
        onConfirm={handleAssignHOD}
        departmentName={selectedDepartment?.name || ''}
        users={users}
        hodUserId={hodUserId}
        setHodUserId={setHodUserId}
        selectedHOD={selectedHOD}
        setSelectedHOD={setSelectedHOD}
        isSubmitting={isSubmitting}
      />
    </PageTemplate>
  )
}
