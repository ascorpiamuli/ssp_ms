// app/admin/users/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  Building2,
  FilterX,
  AlertTriangle,
  Mail,
  Phone,
  Shield,
  Calendar,
  User,
  UserCheck2,
  Activity,
  XCircle,
  Crown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useToast } from '@/components/ui/toast-context'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAdminContext } from '@/contexts/AdminContext'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageTemplate } from '@/components/dashboard/PageTemplate'

// ============================================
// TYPES
// ============================================

interface UserFilters {
  search: string
  role: string
  status: 'all' | 'active' | 'inactive' | 'pending'
  department: string
  sort_by: string
  sort_order: 'asc' | 'desc'
  per_page: number
  page: number
}

interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  initials: string
  email: string
  phone: string
  id_number: string | null
  date_of_birth: string | null
  profile_photo: string | null
  avatar_url: string | null
  role: string | null
  department_id: number | null
  department: {
    id: number
    name: string
    code: string
    description: string | null
  } | null
  profile: {
    id: number
    gender: string | null
    address: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    country: string | null
    bio: string | null
    preferences: any | null
    social_links: any | null
  } | null
  is_active: boolean
  is_approved: boolean
  approved_at: string | null
  approved_by: number | null
  rejection_reason: string | null
  last_login_at: string | null
  timezone: string
  roles: string[]
  permissions: string[]
  role_details: {
    id: number
    name: string
    guard_name: string
    permissions: string[]
    permission_count: number
    created_at: string
  }[]
  created_at: string
  updated_at: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getRoleDisplayName = (role: string) => {
  const map: Record<string, string> = {
    'ADMIN': 'Administrator',
    'SUPER_ADMIN': 'Super Admin',
    'HOD': 'Head of Department',
    'ACCOUNTANT': 'Accountant',
    'HEAD OF INSTITUTION': 'Head of Institution',
    'FINAL_APPROVER': 'Final Approver',
    'PROCUREMENT': 'Procurement Officer',
    'SUPPLIER': 'Supplier',
    'AUDITOR': 'Auditor',
    'STAFF': 'Staff'
  }
  return map[role] || role
}

const getRoleColor = (role: string) => {
  const map: Record<string, string> = {
    'ADMIN': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    'SUPER_ADMIN': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    'HOD': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'ACCOUNTANT': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    'HEAD OF INSTITUTION': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'FINAL_APPROVER': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    'PROCUREMENT': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    'SUPPLIER': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'AUDITOR': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800',
    'STAFF': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  }
  return map[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
}

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    'active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'inactive': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
  }
  return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
}

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

// ============================================
// View User Modal
// ============================================

const ViewUserModal = ({
  isOpen,
  onClose,
  user
}: {
  isOpen: boolean
  onClose: () => void
  user: User | null
}) => {
  if (!isOpen || !user) return null

  const primaryRole = user.role_details?.[0]?.name || 'STAFF'
  const isAdmin = user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN')

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-6">
            <Avatar className="h-16 w-16 ring-4 ring-white dark:ring-gray-700">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-medium">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.full_name}
                </h3>
                <Badge className={cn("font-medium border", getRoleColor(primaryRole))}>
                  {getRoleDisplayName(primaryRole)}
                </Badge>
                {isAdmin && (
                  <Badge variant="secondary" className="border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                <Badge className={cn("font-medium border", getStatusColor(user.is_active ? 'active' : 'inactive'))}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {!user.is_approved && (
                  <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                    Pending Approval
                  </Badge>
                )}
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{user.department.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Joined {formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Full Name</span><span className="font-medium">{user.full_name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{user.email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{user.phone || 'Not set'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">ID Number</span><span className="font-medium">{user.id_number || 'Not set'}</span></div>
                  </div>
                </div>
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Account Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Primary Role</span><span className="font-medium">{getRoleDisplayName(primaryRole)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Department</span><span className="font-medium">{user.department?.name || 'Not assigned'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge className={cn("text-xs", getStatusColor(user.is_active ? 'active' : 'inactive'))}>{user.is_active ? 'Active' : 'Inactive'}</Badge></div>
                    <div className="flex justify-between"><span className="text-gray-500">Last Login</span><span className="font-medium">{formatDate(user.last_login_at) || 'Never'}</span></div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="pt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">All Permissions ({user.permissions?.length || 0})</h4>
                {user.permissions && user.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {user.permissions.map((permission: string) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No permissions assigned</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="roles" className="pt-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-500">Role Details ({user.role_details?.length || 0})</h4>
                {user.role_details && user.role_details.length > 0 ? (
                  user.role_details.map((role) => (
                    <div key={role.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-l-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={cn("font-medium border", getRoleColor(role.name))}>
                          {getRoleDisplayName(role.name)}
                        </Badge>
                        <span className="text-xs text-gray-500">({role.permission_count} permissions)</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission: string) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No roles assigned</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="pt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="mt-1 rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Account Created</p>
                    <p className="text-xs text-gray-500">{formatDate(user.created_at)}</p>
                  </div>
                </div>
                {user.approved_at && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="mt-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-1.5">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Account Approved</p>
                      <p className="text-xs text-gray-500">{formatDate(user.approved_at)}</p>
                    </div>
                  </div>
                )}
                {user.last_login_at && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="mt-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-1.5">
                      <Activity className="h-3 w-3 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Last Login</p>
                      <p className="text-xs text-gray-500">{formatDate(user.last_login_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-blue-600/20"
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

export default function AdminUsersPage() {
  const { user: currentUser, hasPermission } = useAuthContext()
  const { success, error: toastError } = useToast()

  const { departments, availableRoles } = useAuthContext()

  const {
    users,
    usersLoading,
    usersTotal,
    userStats,
    userStatsLoading,
    fetchUsers,
    refetchUsers,
    createUser,
    updateUser,
    deleteUser,
    approveUser,
    rejectUser,
    activateUser,
    deactivateUser,
    resetUserPassword,
    bulkAction,
    roles,
    rolesLoading,
    departmentsLoading,
    isMutating,
  } = useAdminContext()

  // ============================================
  // STATE
  // ============================================
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    department: 'all',
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 10,
    page: 1
  })

  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [resetPasswordErrors, setResetPasswordErrors] = useState<Record<string, string>>({})
  const [bulkActionType, setBulkActionType] = useState<'activate' | 'deactivate' | 'approve'>('activate')

  // ============================================
  // COMPUTED STATS
  // ============================================
  const computedStats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        total: usersTotal || 0,
        active: 0,
        inactive: 0,
        pending: 0,
        approved: 0
      }
    }

    const active = users.filter((u: User) => u.is_active).length
    const inactive = users.filter((u: User) => !u.is_active).length
    const pending = users.filter((u: User) => !u.is_approved).length
    const approved = users.filter((u: User) => u.is_approved).length

    return {
      total: usersTotal || users.length,
      active,
      inactive,
      pending,
      approved
    }
  }, [users, usersTotal])

  const stats = userStats || computedStats

  // ============================================
  // PERMISSIONS
  // ============================================
  const canCreateUsers = hasPermission('create_users')
  const canEditUsers = hasPermission('edit_users')
  const canDeleteUsers = hasPermission('delete_users')
  const canApproveUsers = hasPermission('approve_users')

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN') || false

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    const apiFilters = {
      ...filters,
      status: filters.status === 'all' ? undefined : filters.status,
      role: filters.role === 'all' ? undefined : filters.role,
      department: filters.department === 'all' ? undefined : filters.department,
    }
    fetchUsers(apiFilters)
  }, [filters, fetchUsers])

  // ============================================
  // HANDLERS
  // ============================================
  const handleCreateUser = async (data: any) => {
    try {
      await createUser({
        ...data,
        department_id: data.department_id && data.department_id !== 'none' ? parseInt(data.department_id) : null
      })
      success('User created successfully')
      setShowCreateDialog(false)
      setFormErrors({})
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors)
      } else {
        toastError('Failed to create user')
      }
    }
  }

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return

    const isTargetAdmin = selectedUser.roles?.includes('ADMIN') || selectedUser.roles?.includes('SUPER_ADMIN')
    if (isTargetAdmin && !isSuperAdmin) {
      toastError('Cannot edit admin users')
      setShowEditDialog(false)
      return
    }

    try {
      await updateUser(selectedUser.id, {
        ...data,
        department_id: data.department_id && data.department_id !== 'none' ? parseInt(data.department_id) : null
      })
      success('User updated successfully')
      setShowEditDialog(false)
      setSelectedUser(null)
      setFormErrors({})
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors)
      } else {
        toastError('Failed to update user')
      }
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    const isTargetAdmin = selectedUser.roles?.includes('ADMIN') || selectedUser.roles?.includes('SUPER_ADMIN')
    if (isTargetAdmin) {
      toastError('Cannot delete admin users')
      setShowDeleteDialog(false)
      return
    }

    try {
      await deleteUser(selectedUser.id)
      success('User deleted successfully')
      setShowDeleteDialog(false)
      setSelectedUser(null)
    } catch (error) {
      toastError('Failed to delete user')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return

    const nonAdminUsers = selectedUsers.filter(id => {
      const user = users.find((u: User) => u.id === id)
      return !(user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN'))
    })

    if (nonAdminUsers.length === 0) {
      toastError('Cannot delete admin users')
      setShowBulkDeleteDialog(false)
      return
    }

    if (nonAdminUsers.length < selectedUsers.length) {
      toastError(`Skipping ${selectedUsers.length - nonAdminUsers.length} admin user(s)`)
    }

    try {
      await bulkAction({ action: 'delete', user_ids: nonAdminUsers })
      success(`${nonAdminUsers.length} users deleted successfully`)
      setSelectedUsers([])
      setShowBulkDeleteDialog(false)
    } catch (error) {
      toastError('Failed to delete users')
    }
  }

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) return

    const nonAdminUsers = selectedUsers.filter(id => {
      const user = users.find((u: User) => u.id === id)
      return !(user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN'))
    })

    if (nonAdminUsers.length === 0) {
      toastError(`Cannot ${bulkActionType} admin users`)
      setShowBulkActionDialog(false)
      return
    }

    if (nonAdminUsers.length < selectedUsers.length) {
      toastError(`Skipping ${selectedUsers.length - nonAdminUsers.length} admin user(s)`)
    }

    try {
      await bulkAction({
        action: bulkActionType,
        user_ids: nonAdminUsers
      })
      success(`${nonAdminUsers.length} users ${bulkActionType}d successfully`)
      setSelectedUsers([])
      setShowBulkActionDialog(false)
    } catch (error) {
      toastError(`Failed to ${bulkActionType} users`)
    }
  }


  const handleToggleStatus = async (userId: number, action: 'activate' | 'deactivate') => {
    const user = users.find((u: User) => u.id === userId)
    if (user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN')) {
      toastError(`Cannot ${action} admin users`)
      return
    }

    try {
      if (action === 'activate') {
        await activateUser(userId)
        success('User activated successfully')
      } else {
        await deactivateUser(userId)
        success('User deactivated successfully')
      }
    } catch (error) {
      toastError(`Failed to ${action} user`)
    }
  }

  const handleToggleApproval = async (userId: number, action: 'approve' | 'reject') => {
    const user = users.find((u: User) => u.id === userId)
    if (user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN')) {
      toastError(`Cannot ${action} admin users`)
      return
    }

    try {
      if (action === 'approve') {
        await approveUser(userId)
        success('User approved successfully')
      } else {
        await rejectUser(userId)
        success('User rejected successfully')
      }
    } catch (error) {
      toastError(`Failed to ${action} user`)
    }
  }

  // ============================================
  // RENDER
  // ============================================
  const isLoading = usersLoading || userStatsLoading || rolesLoading || departmentsLoading

  if (!hasPermission('view_users')) {
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
              You don't have permission to view users. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <PageTemplate
      title="User Management"
      description="Manage users, roles, and permissions across the system"
      icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.total || 0}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats?.active || 0}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats?.pending || 0}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Departments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {departments?.length || 0}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search users by name, email, or phone..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select
                value={filters.role}
                onValueChange={(value) => setFilters({ ...filters, role: value, page: 1 })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {availableRoles?.map((role: any) => (
                    <SelectItem key={role.name} value={role.name}>
                      {getRoleDisplayName(role.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value: any) => setFilters({ ...filters, status: value, page: 1 })}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters({ ...filters, department: value, page: 1 })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    search: '',
                    role: 'all',
                    status: 'all',
                    department: 'all',
                    sort_by: 'created_at',
                    sort_order: 'desc',
                    per_page: 10,
                    page: 1
                  })
                }}
                className="gap-2"
              >
                <FilterX className="h-4 w-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={() => refetchUsers()}
                className="gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(users.map((u: any) => u.id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="min-w-[220px]">User</TableHead>
                    <TableHead className="min-w-[130px]">Role</TableHead>
                    <TableHead className="min-w-[130px]">Department</TableHead>
                    <TableHead className="min-w-[110px]">Status</TableHead>
                    <TableHead className="min-w-[150px]">Last Login</TableHead>
                    <TableHead className="min-w-[200px]">Permissions</TableHead>
                    <TableHead className="text-right min-w-[130px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-500">Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm font-medium text-gray-500">No users found</p>
                          <p className="text-xs text-gray-400">Try adjusting your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: User) => {
                      const primaryRole = user.role_details?.[0]?.name || 'STAFF'
                      const displayPermissions = user.permissions?.slice(0, 4) || []
                      const hasMorePermissions = (user.permissions?.length || 0) > 4
                      const isAdmin = user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN')
                      const isTargetCurrentUser = user.id === currentUser?.id

                      return (
                        <TableRow key={user.id} className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                          isTargetCurrentUser && "bg-blue-50/50 dark:bg-blue-900/10"
                        )}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUsers([...selectedUsers, user.id])
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                }
                              }}
                              disabled={isAdmin}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 ring-2 ring-gray-200 dark:ring-gray-700">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {user.full_name}
                                  </p>
                                  {isAdmin && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Crown className="h-3.5 w-3.5 text-yellow-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Administrator</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {isTargetCurrentUser && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("font-medium border", getRoleColor(primaryRole))}>
                              {getRoleDisplayName(primaryRole)}
                            </Badge>
                            {user.roles && user.roles.length > 1 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="outline" className="text-xs ml-1">
                                      +{user.roles.length - 1}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Additional roles: {user.roles.slice(1).join(', ')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {user.department?.name || '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className={cn("font-medium border text-xs", getStatusColor(user.is_active ? 'active' : 'inactive'))}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              {!user.is_approved && (
                                <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600 dark:text-yellow-400">
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatTimeAgo(user.last_login_at)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-1">
                              {displayPermissions.map((permission: string) => (
                                <Badge key={permission} variant="secondary" className="text-xs whitespace-nowrap">
                                  {permission}
                                </Badge>
                              ))}
                              {hasMorePermissions && (
                                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                  +{user.permissions.length - 4} more
                                </Badge>
                              )}
                              {user.permissions?.length === 0 && (
                                <span className="text-xs text-gray-400">No permissions</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      onClick={() => {
                                        setSelectedUser(user)
                                        setShowViewDialog(true)
                                      }}
                                    >
                                      <Eye className="h-4 w-4 text-gray-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {!isAdmin && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {canApproveUsers && !user.is_approved && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleToggleApproval(user.id, 'approve')}>
                                          <UserCheck2 className="h-4 w-4 mr-2 text-emerald-600" />
                                          Approve User
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleApproval(user.id, 'reject')}>
                                          <UserX className="h-4 w-4 mr-2 text-red-600" />
                                          Reject User
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}
                                    <DropdownMenuItem onClick={() => {
                                      if (user.is_active) {
                                        handleToggleStatus(user.id, 'deactivate')
                                      } else {
                                        handleToggleStatus(user.id, 'activate')
                                      }
                                    }}>
                                      {user.is_active ? (
                                        <>
                                          <UserX className="h-4 w-4 mr-2 text-red-600" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="h-4 w-4 mr-2 text-emerald-600" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    {canDeleteUsers && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedUser(user)
                                            setShowDeleteDialog(true)
                                          }}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete User
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}

                              {isAdmin && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 cursor-not-allowed" disabled>
                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Admin users cannot be modified</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700 dark:text-gray-300">{users.length}</span> of{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{usersTotal}</span> users
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={filters.per_page.toString()}
                onValueChange={(value) => setFilters({ ...filters, per_page: parseInt(value), page: 1 })}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                      className={filters.page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive>{filters.page}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      className={users.length < filters.per_page ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </Card>
      </div>

      {/* ============================================
          MODALS
          ============================================ */}

      <ViewUserModal
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />

      {/* Delete User Modal */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-red-100 text-red-600">
                    {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedUser.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="gap-2" disabled={isMutating}>
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Modal */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Selected Users
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUsers.length} selected users?
              <br />
              <span className="text-sm text-yellow-600">Admin users will be automatically skipped.</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} className="gap-2" disabled={isMutating}>
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Modal */}
      <Dialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {bulkActionType === 'activate' && <UserCheck className="h-5 w-5 text-emerald-600" />}
              {bulkActionType === 'deactivate' && <UserX className="h-5 w-5 text-red-600" />}
              {bulkActionType === 'approve' && <UserCheck2 className="h-5 w-5 text-emerald-600" />}
              {bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1)} Users
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkActionType} {selectedUsers.length} selected users?
              <br />
              <span className="text-sm text-yellow-600">Admin users will be automatically skipped.</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              className="gap-2"
              disabled={isMutating}
              variant={bulkActionType === 'deactivate' ? 'destructive' : 'default'}
            >
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {bulkActionType === 'activate' && <UserCheck className="h-4 w-4" />}
                  {bulkActionType === 'deactivate' && <UserX className="h-4 w-4" />}
                  {bulkActionType === 'approve' && <UserCheck2 className="h-4 w-4" />}
                </>
              )}
              {bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1)} Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  )
}
