// app/(dashboard)/admin/departments/page.tsx
'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
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
  Layers,
  Activity,
  Zap,
  Gem,
  Flame,
  Leaf,
  MinusCircle,
  CircleDashed,
  ChevronDown,
  ChevronUp,
  Hash,
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
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards'
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag'

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
  department_id?: number
  avatar_url?: string
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

const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return '?'
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

const getFullName = (user: any) => {
  if (!user) return 'Unknown'
  if (user.full_name) return user.full_name
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown'
}

// Generate a random department code
const generateDepartmentCode = (name: string): string => {
  if (!name) return ''
  // Take first 3 letters of the name and add random numbers
  const prefix = name.substring(0, 3).toUpperCase()
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `${prefix}-${randomNum}`
}

// ============================================
// VIEW DEPARTMENT MODAL - Full Screen
// ============================================

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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <WrappedCornerTag label="DETAILS" color="blue" position="top-left" size="lg" />
        <div className="p-6 pt-10 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                {department.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className="rounded-full font-mono">{department.code}</Badge>
                <Badge className={cn("text-xs rounded-full", getStatusColor(department.is_active))}>
                  {department.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline" className="rounded-full text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  ID: {department.id}
                </Badge>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Department ID</p>
              <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                #{department.id}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Department Name</p>
              <p className="font-semibold text-gray-900 dark:text-white">{department.name}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Department Code</p>
              <Badge variant="secondary" className="rounded-full font-mono">{department.code}</Badge>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <Badge variant="outline" className="rounded-full">{department.users_count || 0} users</Badge>
            </div>
          </div>

          {department.description && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
              <p className="text-gray-900 dark:text-white">{department.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-gray-900 dark:text-white">{formatDate(department.created_at)}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="text-gray-900 dark:text-white">{formatDate(department.updated_at)}</p>
            </div>
          </div>

          {department.hod && (
            <>
              <Separator />
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Head of Department
                </h4>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-yellow-200 dark:ring-yellow-800">
                    <AvatarFallback className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-lg">
                      {getInitials(department.hod.first_name, department.hod.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getFullName(department.hod)}
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

          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-blue-600/20"
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

export default function AdminDepartmentsPage() {
  const { user: currentUser, hasPermission, isAdmin } = useAuthContext()
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
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // Refs for scroll restoration
  const tableRef = useRef<HTMLDivElement>(null)

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

  // Process users - show ALL users for HOD assignment (Admin can assign anyone)
  let allUsers: User[] = []
  if (usersData?.data) {
    allUsers = usersData.data
  } else if (Array.isArray(usersData)) {
    allUsers = usersData
  }

  // Filter users that can be assigned as HOD (all active users)
  const availableUsers = useMemo(() => {
    return allUsers.filter(user => {
      // Exclude users who are already HOD of a department
      const isAlreadyHOD = departments.some(d => d.hod_id === user.id)
      return !isAlreadyHOD
    })
  }, [allUsers, departments])

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
  const departmentsWithValidHOD = departments.filter(d => d.hod).length
  const departmentsWithoutHOD = departments.filter(d => !d.hod_id).length

  // Stats for StatsCards
  const statsItems: StatCardItem[] = useMemo(() => {
    return [
      {
        label: "Total Departments",
        value: totalDepartments,
        icon: Building2,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: "All departments",
      },
      {
        label: "Active",
        value: activeDepartments,
        icon: Check,
        tagLabel: "ACTIVE",
        tagColor: "emerald",
        subtitle: `${activeDepartments} active departments`,
      },
      {
        label: "Inactive",
        value: inactiveDepartments,
        icon: X,
        tagLabel: "INACTIVE",
        tagColor: "gray",
        subtitle: `${inactiveDepartments} inactive departments`,
      },
      {
        label: "Users",
        value: totalUsersInDepts,
        icon: Users,
        tagLabel: "USERS",
        tagColor: "purple",
        subtitle: `${totalUsersInDepts} total users`,
      },
      {
        label: "With HOD",
        value: departmentsWithValidHOD,
        icon: Crown,
        tagLabel: "HOD",
        tagColor: "amber",
        subtitle: `${departmentsWithValidHOD} with HOD`,
      },
      {
        label: "Without HOD",
        value: departmentsWithoutHOD,
        icon: UserX,
        tagLabel: "MISSING",
        tagColor: "red",
        subtitle: `${departmentsWithoutHOD} need HOD`,
      },
    ]
  }, [totalDepartments, activeDepartments, inactiveDepartments, totalUsersInDepts, departmentsWithValidHOD, departmentsWithoutHOD])

  // Permissions
  const canCreateDepartments = hasPermission('create_departments') || isAdmin()
  const canEditDepartments = hasPermission('edit_departments') || isAdmin()
  const canDeleteDepartments = hasPermission('delete_departments') || isAdmin()
  const canViewDepartments = hasPermission('view_departments') || isAdmin()

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Scroll to top when page changes
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentPage])

  // Auto-generate code when name changes (only for create)
  useEffect(() => {
    if (showCreateDialog && departmentForm.name && !departmentForm.code) {
      const generatedCode = generateDepartmentCode(departmentForm.name)
      setDepartmentForm(prev => ({ ...prev, code: generatedCode }))
    }
  }, [departmentForm.name, showCreateDialog])

  // Handlers
  const handleCreateDepartment = async (data: any) => {
    const errors: Record<string, string> = {}
    if (!data.name) errors.name = 'Department name is required'
    if (!data.code) errors.code = 'Department code is required'

    // Check if code already exists (case insensitive)
    const codeExists = departments.some(d => d.code.toUpperCase() === data.code.toUpperCase())
    if (codeExists) {
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
      setShowCreateDialog(false)
      setDepartmentForm({ name: '', code: '', description: '' })
      setFormErrors({})
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      console.error('Failed to create department:', error)
      if (error?.response?.data?.errors?.code) {
        setFormErrors({ code: error.response.data.errors.code[0] })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateDepartment = async (data: any) => {
    if (!selectedDepartment) return

    const errors: Record<string, string> = {}
    if (!data.name) errors.name = 'Department name is required'
    if (!data.code) errors.code = 'Department code is required'

    // Check if code already exists and it's not the current department
    const codeExists = departments.some(d =>
      d.code.toUpperCase() === data.code.toUpperCase() && d.id !== selectedDepartment.id
    )
    if (codeExists) {
      errors.code = 'Department code already exists'
    }

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
      setShowEditDialog(false)
      setSelectedDepartment(null)
      setDepartmentForm({ name: '', code: '', description: '' })
      setFormErrors({})
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      console.error('Failed to update department:', error)
      if (error?.response?.data?.errors?.code) {
        setFormErrors({ code: error.response.data.errors.code[0] })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return
    setIsSubmitting(true)
    try {
      await deleteDepartment.mutateAsync(selectedDepartment.id)
      setShowDeleteDialog(false)
      setSelectedDepartment(null)
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      console.error('Failed to delete department:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await deactivateDepartment.mutateAsync(id)
      } else {
        await activateDepartment.mutateAsync(id)
      }
      await refetchDepts()
      await refetchStats()
    } catch (error: any) {
      console.error('Failed to update department status:', error)
    }
  }

  const handleAssignHOD = async () => {
    if (!selectedDepartment || !hodUserId) {
      console.error('Please select a user to assign as HOD')
      return
    }

    setIsSubmitting(true)
    try {
      await assignHOD.mutateAsync({
        id: selectedDepartment.id,
        hod_id: parseInt(hodUserId)
      })
      setShowAssignHODDialog(false)
      setHodUserId('')
      setSelectedHOD(null)
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      console.error('Failed to assign HOD:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveHOD = async (departmentId: number) => {
    try {
      await removeHOD.mutateAsync(departmentId)
      refetchDepts()
      refetchStats()
    } catch (error: any) {
      console.error('Failed to remove HOD:', error)
    }
  }

  const forceRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([refetchDepts(), refetchStats()])
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Loading state
  const isLoading = deptLoading || statsLoading || usersLoading || isRefreshing

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
        <Alert variant="destructive" className="mb-4 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Departments</AlertTitle>
          <AlertDescription>
            <p>Failed to load departments data. Please try again.</p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={forceRefresh}>
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
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Departments' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full">
            <Sparkles className="h-3 w-3 mr-1" />
            {totalDepartments} Departments
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={forceRefresh}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          {canCreateDepartments && (
            <Button
              size="sm"
              onClick={() => {
                setDepartmentForm({ name: '', code: '', description: '' })
                setFormErrors({})
                setShowCreateDialog(true)
              }}
              className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
            >
              <Plus className="h-4 w-4" />
              New Department
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <StatsCards
          stats={statsItems}
          isLoading={isLoading}
          columns={6}
          variant="default"
          formatCompact={true}
          tagOrientation="wrapped"
          tagPosition="top-left"
        />

        {/* Search and Filter */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">
          <CardContent className="p-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search departments by name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className="gap-2 h-11 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <FilterX className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Departments Table */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden relative">
          <WrappedCornerTag label="DEPARTMENTS" color="blue" position="top-left" size="lg" />
          <div className="pt-8" ref={tableRef}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
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
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
                        <TableHead className="min-w-[60px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ID</TableHead>
                        <TableHead className="min-w-[220px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Department</TableHead>
                        <TableHead className="min-w-[100px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Code</TableHead>
                        <TableHead className="min-w-[100px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
                        <TableHead className="min-w-[80px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Users</TableHead>
                        <TableHead className="min-w-[220px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Head of Department</TableHead>
                        <TableHead className="min-w-[120px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Created</TableHead>
                        <TableHead className="text-right min-w-[160px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedDepartments.map((department, index) => (
                        <motion.tr
                          key={department.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group border-b dark:border-gray-700/50"
                        >
                          <TableCell>
                            <span className="text-sm font-mono text-muted-foreground">
                              #{department.id}
                            </span>
                          </TableCell>
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
                            <Badge variant="secondary" className="font-mono rounded-full">
                              {department.code}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs border rounded-full flex items-center gap-1 w-fit", getStatusColor(department.is_active))}>
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
                                    {getInitials(department.hod.first_name, department.hod.last_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {getFullName(department.hod)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {department.hod.email}
                                  </p>
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Crown className="h-3.5 w-3.5 text-yellow-500 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-xl">Head of Department</TooltipContent>
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
                                <TooltipContent className="rounded-xl">
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
                                      className="h-8 w-8 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      onClick={() => {
                                        setSelectedDepartment(department)
                                        setShowViewDialog(true)
                                      }}
                                    >
                                      <Eye className="h-4 w-4 text-gray-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="rounded-xl">View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                                  <DropdownMenuLabel className="text-sm font-semibold px-3 py-2 text-gray-700 dark:text-gray-200">Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
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
                                      className="rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleToggleStatus(department.id, department.is_active)}
                                    className="rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
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
                                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                                  {department.hod ? (
                                    <DropdownMenuItem
                                      onClick={() => handleRemoveHOD(department.id)}
                                      className="text-red-600 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
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
                                      className="rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                    >
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Assign HOD
                                    </DropdownMenuItem>
                                  )}
                                  {canDeleteDepartments && (
                                    <>
                                      <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedDepartment(department)
                                          setShowDeleteDialog(true)
                                        }}
                                        className="text-red-600 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
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
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 gap-2">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-700 dark:text-gray-300">
                      {filteredDepartments.length > 0 ? Math.min((currentPage - 1) * itemsPerPage + 1, filteredDepartments.length) : 0}
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
                      <SelectTrigger className="w-[80px] h-9 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
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
                        className="h-8 w-8 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
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
                        className="h-8 w-8 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
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
        </Card>
      </div>

      {/* ============================================
          MODALS - Full Screen using createPortal
          ============================================ */}

      {/* View Department Modal - Using the separate component */}
      <ViewDepartmentModal
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false)
          setSelectedDepartment(null)
        }}
        department={selectedDepartment}
      />

      {/* Create Department Modal - Full Screen Overlay with Portal */}
      {showCreateDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
            onClick={() => {
              setShowCreateDialog(false)
              setFormErrors({})
              setDepartmentForm({ name: '', code: '', description: '' })
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <WrappedCornerTag label="NEW" color="blue" position="top-left" size="lg" />
              <div className="p-6 pt-10 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Plus className="h-6 w-6 text-blue-600" />
                      Create New Department
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Add a new department to the system
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateDialog(false)
                      setFormErrors({})
                      setDepartmentForm({ name: '', code: '', description: '' })
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                handleCreateDepartment(departmentForm)
              }} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Computer Science"
                    value={departmentForm.name}
                    onChange={(e) => {
                      setDepartmentForm({ ...departmentForm, name: e.target.value })
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' })
                    }}
                    className={cn("rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11", formErrors.name ? 'border-red-500' : '')}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Department code will be auto-generated based on the name
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Department Code <span className="text-red-500">*</span>
                    <span className="text-xs text-muted-foreground ml-2">(Auto-generated, editable)</span>
                  </label>
                  <Input
                    placeholder="Auto-generated code..."
                    value={departmentForm.code}
                    onChange={(e) => {
                      setDepartmentForm({ ...departmentForm, code: e.target.value.toUpperCase() })
                      if (formErrors.code) setFormErrors({ ...formErrors, code: '' })
                    }}
                    className={cn("rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11 font-mono", formErrors.code ? 'border-red-500' : '')}
                  />
                  {formErrors.code && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    You can edit this code if needed. Must be unique.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Description
                  </label>
                  <Input
                    placeholder="Brief description of the department"
                    value={departmentForm.description}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                    className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateDialog(false)
                      setFormErrors({})
                      setDepartmentForm({ name: '', code: '', description: '' })
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Department
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Edit Department Modal - Full Screen Overlay with Portal */}
      {showEditDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
            onClick={() => {
              setShowEditDialog(false)
              setFormErrors({})
              setSelectedDepartment(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <WrappedCornerTag label="EDIT" color="amber" position="top-left" size="lg" />
              <div className="p-6 pt-10 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Edit className="h-6 w-6 text-amber-600" />
                      Edit Department
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Update department information
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditDialog(false)
                      setFormErrors({})
                      setSelectedDepartment(null)
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                handleUpdateDepartment(departmentForm)
              }} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Computer Science"
                    value={departmentForm.name}
                    onChange={(e) => {
                      setDepartmentForm({ ...departmentForm, name: e.target.value })
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' })
                    }}
                    className={cn("rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11", formErrors.name ? 'border-red-500' : '')}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Department Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., CS"
                    value={departmentForm.code}
                    onChange={(e) => {
                      setDepartmentForm({ ...departmentForm, code: e.target.value.toUpperCase() })
                      if (formErrors.code) setFormErrors({ ...formErrors, code: '' })
                    }}
                    className={cn("rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11 font-mono", formErrors.code ? 'border-red-500' : '')}
                  />
                  {formErrors.code && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Description
                  </label>
                  <Input
                    placeholder="Brief description of the department"
                    value={departmentForm.description}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                    className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditDialog(false)
                      setFormErrors({})
                      setSelectedDepartment(null)
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update Department
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Department Modal - Full Screen Overlay with Portal */}
      {showDeleteDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
            onClick={() => {
              setShowDeleteDialog(false)
              setSelectedDepartment(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <WrappedCornerTag label="DANGER" color="red" position="top-left" size="lg" />
              <div className="p-6 pt-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Department</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Are you sure you want to delete the department "<span className="font-semibold text-gray-900 dark:text-white">{selectedDepartment?.name}</span>"?
                </p>
                {selectedDepartment && selectedDepartment.users_count > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
                    <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      This department has <strong>{selectedDepartment.users_count}</strong> user(s). Users must be reassigned before deletion.
                    </p>
                  </div>
                )}
                <p className="text-sm text-red-500 dark:text-red-400 mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setSelectedDepartment(null)
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteDepartment}
                    disabled={isSubmitting || (selectedDepartment?.users_count || 0) > 0}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                  >
                    {isSubmitting ? (
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
        </AnimatePresence>,
        document.body
      )}

      {/* Assign HOD Modal - Full Screen Overlay with Portal */}
      {showAssignHODDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
            onClick={() => {
              setShowAssignHODDialog(false)
              setHodUserId('')
              setSelectedHOD(null)
              setSelectedDepartment(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <WrappedCornerTag label="ASSIGN" color="amber" position="top-left" size="lg" />
              <div className="p-6 pt-10 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Crown className="h-6 w-6 text-yellow-500" />
                      Assign Head of Department
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Select a user to assign as HOD for "{selectedDepartment?.name}"
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAssignHODDialog(false)
                      setHodUserId('')
                      setSelectedHOD(null)
                      setSelectedDepartment(null)
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All users are available for assignment. Select a user from the dropdown below.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Select User <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={hodUserId}
                    onValueChange={(value) => {
                      setHodUserId(value)
                      const user = allUsers.find(u => u.id === parseInt(value))
                      setSelectedHOD(user || null)
                    }}
                  >
                    <SelectTrigger className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11 w-full">
                      <SelectValue placeholder="Search and select a user..." />
                    </SelectTrigger>
                    <SelectContent
                      className="dark:bg-gray-800 dark:border-gray-700 max-h-60 z-[999999]"
                      position="popper"
                      sideOffset={8}
                    >
                      {allUsers.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No users available
                        </div>
                      ) : (
                        allUsers.map((user) => {
                          const isAlreadyHOD = departments.some(d => d.hod_id === user.id)
                          return (
                            <SelectItem
                              key={user.id}
                              value={user.id.toString()}
                              className={cn(
                                "dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer py-2.5",
                                isAlreadyHOD && "opacity-50 pointer-events-none"
                              )}
                              disabled={isAlreadyHOD}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                    {getInitials(user.first_name, user.last_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{getFullName(user)}</span>
                                    {user.role && (
                                      <Badge variant="outline" className="text-[10px] rounded-full px-1.5 py-0">
                                        {user.role}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                                {isAlreadyHOD && (
                                  <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                    Already HOD
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })
                      )}
                    </SelectContent>
                  </Select>
                  {allUsers.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      No users available to assign as HOD.
                    </p>
                  )}
                </div>

                {selectedHOD && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-200 dark:ring-blue-800">
                      <AvatarFallback className="text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        {getInitials(selectedHOD.first_name, selectedHOD.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {getFullName(selectedHOD)}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {selectedHOD.email} • {selectedHOD.role || 'No role'}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full text-xs">
                      Selected
                    </Badge>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignHODDialog(false)
                      setHodUserId('')
                      setSelectedHOD(null)
                      setSelectedDepartment(null)
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignHOD}
                    disabled={isSubmitting || !hodUserId}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
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
        </AnimatePresence>,
        document.body
      )}
    </PageTemplate>
  )
}
