// app/admin/departments/page.tsx
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
  Pencil,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Eye,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  AlertCircle,
  Check,
  X,
  Grid,
  List,
  UserPlus,
  UserMinus,
  Crown,
  Mail,
  Phone,
  Shield,
  XCircle,
  User
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

const getStatusColor = (isActive: boolean) => {
  return isActive
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
}

// ============================================
// MODAL COMPONENTS
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Department' : 'Create New Department'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
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
              className={formErrors.name ? 'border-red-500' : ''}
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
              className={formErrors.code ? 'border-red-500' : ''}
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
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
      </div>
    </div>
  )
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Department Details: {department.name}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {department.name}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <Badge variant="secondary">{department.code}</Badge>
                <Badge className={cn("text-xs", getStatusColor(department.is_active))}>
                  {department.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <span>{department.users_count || 0} users</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Department Name</p>
              <p className="font-semibold text-gray-900 dark:text-white">{department.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Department Code</p>
              <Badge variant="secondary">{department.code}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={cn("text-xs", getStatusColor(department.is_active))}>
                {department.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Users</p>
              <Badge variant="outline">{department.users_count || 0} users</Badge>
            </div>
            {department.description && (
              <div className="col-span-2 space-y-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-900 dark:text-white">{department.description}</p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-gray-900 dark:text-white">{formatDate(department.created_at)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Last Updated</p>
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
                    <AvatarFallback className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                      {department.hod.first_name?.[0]}{department.hod.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {department.hod.full_name}
                    </p>
                    <p className="text-sm text-gray-500">{department.hod.email}</p>
                    {department.hod.phone && (
                      <p className="text-sm text-gray-500">{department.hod.phone}</p>
                    )}
                  </div>
                </div>
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="p-6">
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
              ⚠️ This department has {usersCount} user(s). Users must be reassigned before deletion.
            </p>
          )}
          <p className="text-sm text-red-500 dark:text-red-400 mb-6">
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
      </div>
    </div>
  )
}

// Assign HOD Modal
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Assign Head of Department
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
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
              <SelectTrigger>
                <SelectValue placeholder="Select a user to assign as HOD" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
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
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting || !hodUserId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
      </div>
    </div>
  )
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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
    if (!searchTerm) return departments
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
  }, [departments, searchTerm])

  // Stats
  const totalDepartments = departments.length
  const activeDepartments = departments.filter(d => d.is_active).length
  const inactiveDepartments = departments.filter(d => !d.is_active).length
  const totalUsersInDepts = departments.reduce((acc, d) => acc + (d.users_count || 0), 0)

  // Permissions
  const canCreateDepartments = hasPermission('create_departments') || isAdmin()
  const canEditDepartments = hasPermission('edit_departments') || isAdmin()
  const canDeleteDepartments = hasPermission('delete_departments') || isAdmin()
  const canViewDepartments = hasPermission('view_departments') || isAdmin()

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

  // FIXED: The backend expects 'hod_id' field name, not 'user_id'
  const handleAssignHOD = async () => {
    if (!selectedDepartment || !hodUserId) {
      toastError('Please select a user to assign as HOD')
      return
    }

    setIsSubmitting(true)
    try {
      // The backend expects 'hod_id' not 'user_id'
      await assignHOD.mutateAsync({
        id: selectedDepartment.id,
        hod_id: parseInt(hodUserId)  // Changed from 'user_id' to 'hod_id'
      })
      success('HOD assigned successfully')
      setShowAssignHODDialog(false)
      setHodUserId('')
      setSelectedHOD(null)
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      // Handle validation errors from backend
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
    )
  }

  // Error state
  if (deptError || statsError || usersError) {
    return (
      <PageTemplate
        title="Department Management"
        description="Manage departments and assign Heads of Department"
        icon={<Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
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
      icon={<Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Departments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDepartments}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeDepartments}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveDepartments}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalUsersInDepts}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search departments by name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            {canCreateDepartments && (
              <Button
                onClick={() => {
                  setDepartmentForm({ name: '', code: '', description: '' })
                  setFormErrors({})
                  setShowCreateDialog(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Department
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Departments Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredDepartments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No departments found' : 'No departments created yet'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm
                ? `No departments match "${searchTerm}"`
                : 'Get started by creating your first department'}
            </p>
            {canCreateDepartments && !searchTerm && (
              <Button
                onClick={() => {
                  setDepartmentForm({ name: '', code: '', description: '' })
                  setFormErrors({})
                  setShowCreateDialog(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Department
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((department) => (
            <Card key={department.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{department.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {department.code}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={cn("text-xs", getStatusColor(department.is_active))}>
                    {department.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {department.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {department.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{department.users_count || 0} users</span>
                  </div>
                  {department.hod && (
                    <div className="flex items-center gap-1">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs truncate max-w-[100px]">
                        {department.hod.full_name}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between gap-2">
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedDepartment(department)
                            setShowViewDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {canEditDepartments && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
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
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Department</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {canDeleteDepartments && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedDepartment(department)
                              setShowDeleteDialog(true)
                            }}
                            disabled={department.users_count > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {department.users_count > 0
                            ? 'Cannot delete: Department has users'
                            : 'Delete Department'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Head of Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{department.name}</span>
                      </div>
                      {department.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {department.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{department.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", getStatusColor(department.is_active))}>
                        {department.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{department.users_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {department.hod ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-yellow-100 text-yellow-700">
                              {department.hod.first_name?.[0]}
                              {department.hod.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{department.hod.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedDepartment(department)
                            setShowViewDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEditDepartments && (
                          <Button
                            variant="ghost"
                            size="icon"
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
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
          </CardContent>
        </Card>
      )}

      {/* Modals */}
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
