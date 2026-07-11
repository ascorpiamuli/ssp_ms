// app/admin/permissions/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Shield,
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
  Building2,
  Settings,
  FileText,
  ShoppingCart,
  Package,
  CreditCard,
  DollarSign,
  BarChart3,
  UserCog,
  Key,
  Check,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  Layers,
  AlertCircle,
  CheckSquare,
  Square,
  Grid,
  List,
  HelpCircle,
  User,
  Database,
  XCircle
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast-context'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRoles } from '@/hooks/useRoles'
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

interface Permission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
  pivot?: {
    role_id: number
    permission_id: number
  }
}

interface Role {
  id: number
  name: string
  guard_name: string
  description?: string
  permissions: Permission[]
  permission_count: number
  users_count?: number
  created_at: string
  updated_at: string
}

// ============================================
// PERMISSION GROUPS
// ============================================

const PERMISSION_GROUPS: Record<string, { icon: any; color: string; bgColor: string; label: string; description: string }> = {
  'requisitions': {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'Requisitions',
    description: 'Create, view, edit, and manage requisitions'
  },
  'approvals': {
    icon: Shield,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    label: 'Approvals',
    description: 'Multi-level approval workflow management'
  },
  'procurement': {
    icon: ShoppingCart,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    label: 'Procurement',
    description: 'Supplier and quotation management'
  },
  'orders': {
    icon: Package,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    label: 'Orders',
    description: 'Purchase orders and tracking'
  },
  'invoices': {
    icon: CreditCard,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    label: 'Invoices & Payments',
    description: 'Invoice verification and payment processing'
  },
  'budget': {
    icon: DollarSign,
    color: 'text-lime-600',
    bgColor: 'bg-lime-50 dark:bg-lime-900/20',
    label: 'Budget & Finance',
    description: 'Budget allocation and expenditure tracking'
  },
  'reports': {
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    label: 'Reports',
    description: 'Generate and export reports'
  },
  'users': {
    icon: Users,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    label: 'Users',
    description: 'User management and role assignment'
  },
  'departments': {
    icon: Building2,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
    label: 'Departments',
    description: 'Department management'
  },
  'suppliers': {
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    label: 'Suppliers',
    description: 'Supplier registration and management'
  },
  'quotations': {
    icon: FileText,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    label: 'Quotations',
    description: 'Quotation requests and responses'
  },
  'audit': {
    icon: Shield,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    label: 'Audit',
    description: 'Audit logs and compliance'
  },
  'settings': {
    icon: Settings,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    label: 'Settings',
    description: 'System configuration'
  },
  'backup': {
    icon: Database,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    label: 'Backup',
    description: 'Backup and restore management'
  },
  'profile': {
    icon: User,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
    label: 'Profile',
    description: 'User profile management'
  },
  'support': {
    icon: HelpCircle,
    color: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    label: 'Support',
    description: 'Support tickets and help'
  },
  'hr': {
    icon: User,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    label: 'Human Resources',
    description: 'Staff and HR management'
  },
  'assets': {
    icon: Package,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    label: 'Assets',
    description: 'Asset and inventory management'
  },
  'facilities': {
    icon: Building2,
    color: 'text-lime-600',
    bgColor: 'bg-lime-50 dark:bg-lime-900/20',
    label: 'Facilities',
    description: 'Facilities and room management'
  },
  'other': {
    icon: Layers,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    label: 'Other',
    description: 'Miscellaneous permissions'
  }
}

// ============================================
// GET PERMISSION GROUP
// ============================================

const getPermissionGroup = (permissionName: string): string => {
  const keywordMap: Record<string, string> = {
    'requisition': 'requisitions',
    'approv': 'approvals',
    'supplier': 'suppliers',
    'quotation': 'quotations',
    'tender': 'procurement',
    'contract': 'procurement',
    'purchase_order': 'orders',
    'purchase_orders': 'orders',
    'lpo': 'orders',
    'lso': 'orders',
    'grn': 'orders',
    'san': 'orders',
    'invoice': 'invoices',
    'payment_voucher': 'invoices',
    'cheque': 'invoices',
    'budget': 'budget',
    'expenditure': 'budget',
    'report': 'reports',
    'user': 'users',
    'department': 'departments',
    'audit': 'audit',
    'settings': 'settings',
    'backup': 'backup',
    'profile': 'profile',
    'support': 'support',
    'hr': 'hr',
    'asset': 'assets',
    'facility': 'facilities',
  }

  const lowerName = permissionName.toLowerCase()
  for (const [key, group] of Object.entries(keywordMap)) {
    if (lowerName.includes(key)) {
      return group
    }
  }

  return 'other'
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const extractRoles = (data: any): Role[] => {
  if (!data) return []
  if (data.data && Array.isArray(data.data)) return data.data
  if (Array.isArray(data)) return data
  if (data.roles && Array.isArray(data.roles)) return data.roles
  return []
}

const extractPermissions = (data: any): Permission[] => {
  if (!data) return []
  if (data.data && Array.isArray(data.data)) return data.data
  if (Array.isArray(data)) return data
  if (data.permissions && Array.isArray(data.permissions)) return data.permissions
  return []
}

// ============================================
// MODAL COMPONENTS
// ============================================

// Create/Edit Role Modal
const RoleFormModal = ({
  isOpen,
  isEdit,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  roles,
  formErrors,
  setFormErrors,
}: {
  isOpen: boolean
  isEdit: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: any
  isSubmitting: boolean
  roles: any[]
  formErrors: Record<string, string>
  setFormErrors: (errors: Record<string, string>) => void
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
      })
    } else if (!isEdit) {
      setFormData({
        name: '',
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
              {isEdit ? 'Edit Role' : 'Create New Role'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., ADMIN, MANAGER, STAFF"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value.toUpperCase() })
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
              Description
            </label>
            <Input
              placeholder="Brief description of this role"
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
                  {isEdit ? 'Update Role' : 'Create Role'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// View Role Modal
const ViewRoleModal = ({
  isOpen,
  onClose,
  role
}: {
  isOpen: boolean
  onClose: () => void
  role: Role | null
}) => {
  if (!isOpen || !role) return null

  const getRoleColor = (roleName: string) => {
    const map: Record<string, string> = {
      'ADMIN': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'SUPER_ADMIN': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'HOD': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'ACCOUNTANT': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'PRINCIPAL': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'FINAL_APPROVER': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'PROCUREMENT': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      'SUPPLIER': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'AUDITOR': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'STAFF': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
    return map[roleName] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }

  const getRoleDisplayName = (roleName: string) => {
    const map: Record<string, string> = {
      'ADMIN': 'Administrator',
      'SUPER_ADMIN': 'Super Admin',
      'HOD': 'Head of Department',
      'ACCOUNTANT': 'Accountant',
      'PRINCIPAL': 'Principal',
      'FINAL_APPROVER': 'Final Approver',
      'PROCUREMENT': 'Procurement',
      'SUPPLIER': 'Supplier',
      'AUDITOR': 'Auditor',
      'STAFF': 'Staff'
    }
    return map[roleName] || roleName
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Role Details: {role.name}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getRoleDisplayName(role.name)}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span>{role.permissions?.length || 0} permissions</span>
                <span>•</span>
                <span>{role.users_count || 0} users assigned</span>
                <span>•</span>
                <span>Created {formatDate(role.created_at)}</span>
              </div>
            </div>
          </div>

          {role.description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h4>
              <p className="text-gray-600 dark:text-gray-400">{role.description}</p>
            </div>
          )}

          <Separator className="my-4" />

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Permissions ({role.permissions?.length || 0})
            </h4>
            {role.permissions && role.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((permission) => (
                  <Badge key={permission.id || permission.name} variant="secondary" className="text-xs">
                    {permission.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No permissions assigned</p>
            )}
          </div>

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

// Delete Role Modal
const DeleteRoleModal = ({
  isOpen,
  onClose,
  onConfirm,
  roleName,
  usersCount,
  isDeleting
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  roleName: string
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Role</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Are you sure you want to delete the role "{roleName}"?
          </p>
          {usersCount > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
              ⚠️ This role is assigned to {usersCount} user(s). Deleting it will remove their permissions.
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
                  Delete Role
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

export default function PermissionsMatrixPage() {
  const { user: currentUser, hasPermission, isAdmin, refetchUser } = useAuthContext()
  const { success, error: toastError } = useToast()
  const {
    useAllRoles,
    usePermissions,
    usePermissionsGrouped,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
  } = useRoles()

  // Queries
  const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles, error: rolesError } = useAllRoles()
  const { data: permissionsData, isLoading: permissionsLoading, refetch: refetchPermissions, error: permissionsError } = usePermissions()
  const { data: permissionsGroupedData, isLoading: groupedLoading, refetch: refetchGrouped, error: groupedError } = usePermissionsGrouped()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleForm, setRoleForm] = useState({ name: '', description: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [pendingPermissions, setPendingPermissions] = useState<Set<string>>(new Set())
  const [isDirty, setIsDirty] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Dialog states
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false)
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false)
  const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false)
  const [showViewRoleDialog, setShowViewRoleDialog] = useState(false)

  // Process data
  const roles: Role[] = extractRoles(rolesData)
  const permissions: Permission[] = extractPermissions(permissionsData)

  // Current role
  const currentRole = useMemo(() => {
    if (selectedRoleId) return roles.find(r => r.id === selectedRoleId) || null
    return roles.length > 0 ? roles[0] : null
  }, [roles, selectedRoleId])

  // Initialize pending permissions when role changes
  useEffect(() => {
    if (currentRole) {
      const perms = new Set(currentRole.permissions?.map(p => p.name) || [])
      setPendingPermissions(perms)
      setIsDirty(false)
    }
  }, [currentRole])

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id)
    }
  }, [roles, selectedRoleId])

  // Build permission matrix
  const permissionMatrix = useMemo(() => {
    const allPermissionsMap = new Map<string, Permission>()

    roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(p => {
          if (!allPermissionsMap.has(p.name)) allPermissionsMap.set(p.name, p)
        })
      }
    })

    if (allPermissionsMap.size === 0 && permissions.length > 0) {
      permissions.forEach(p => allPermissionsMap.set(p.name, p))
    }

    if (allPermissionsMap.size === 0 && permissionsGroupedData) {
      const grouped = permissionsGroupedData.data || permissionsGroupedData
      Object.values(grouped).forEach((group: any) => {
        if (Array.isArray(group)) {
          group.forEach((p: any) => {
            if (p.name && !allPermissionsMap.has(p.name)) {
              allPermissionsMap.set(p.name, {
                id: p.id || 0,
                name: p.name,
                guard_name: p.guard_name || 'api',
                created_at: p.created_at || new Date().toISOString(),
                updated_at: p.updated_at || new Date().toISOString()
              })
            }
          })
        }
      })
    }

    const groups: Record<string, Permission[]> = {}
    allPermissionsMap.forEach((permission) => {
      const groupName = getPermissionGroup(permission.name)
      if (!groups[groupName]) groups[groupName] = []
      groups[groupName].push(permission)
    })

    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, perms]) => ({
        name,
        permissions: perms.sort((a, b) => a.name.localeCompare(b.name))
      }))
  }, [roles, permissions, permissionsGroupedData])

  // Filtered matrix
  const filteredMatrix = useMemo(() => {
    if (!searchTerm) return permissionMatrix
    return permissionMatrix
      .map(group => ({
        ...group,
        permissions: group.permissions.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(group => group.permissions.length > 0)
  }, [permissionMatrix, searchTerm])

  // Get group info
  const getGroupInfo = (groupName: string) => {
    return PERMISSION_GROUPS[groupName] || PERMISSION_GROUPS['other']
  }

  // Helper to force refresh all data
  const forceRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchRoles(),
        refetchPermissions(),
        refetchGrouped(),
        refetchUser()
      ])
      success('Data refreshed successfully')
    } catch (error) {
      toastError('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handlers
  const handleTogglePermission = (permissionName: string) => {
    if (!currentRole) return

    // Check if trying to remove own permissions
    const isSelf = currentUser?.id === currentUser?.id // We'll check role-specific
    if (isSelf && currentRole.name === 'ADMIN' && pendingPermissions.has(permissionName)) {
      // Warn before removing admin permissions
      const confirmRemove = confirm(
        `⚠️ Warning: You are about to remove the "${permissionName}" permission from your own ADMIN role.\n\n` +
        `This may lock you out of certain admin features. Continue?`
      )
      if (!confirmRemove) return
    }

    const newSet = new Set(pendingPermissions)
    if (newSet.has(permissionName)) {
      newSet.delete(permissionName)
    } else {
      newSet.add(permissionName)
    }
    setPendingPermissions(newSet)
    setIsDirty(true)
  }

  const handleSavePermissions = async () => {
    if (!currentRole) return

    // Check if user is removing their own admin permissions
    const isAdminRole = currentRole.name === 'ADMIN'
    const currentUserRoles = currentUser?.roles || []
    const isCurrentUserAdmin = currentUserRoles.includes('ADMIN')

    if (isAdminRole && isCurrentUserAdmin) {
      // Check if any critical permissions are being removed
      const criticalPermissions = ['assign_roles', 'manage_users', 'manage_permissions']
      const removedCritical = criticalPermissions.filter(p =>
        pendingPermissions.has(p) && !new Set(currentRole.permissions?.map(p => p.name)).has(p)
      )

      if (removedCritical.length > 0) {
        const confirmRemove = confirm(
          `⚠️⚠️⚠️ CRITICAL WARNING ⚠️⚠️⚠️\n\n` +
          `You are about to remove the following critical permissions from your own ADMIN role:\n` +
          `${removedCritical.map(p => `• ${p}`).join('\n')}\n\n` +
          `This may permanently lock you out of admin functions.\n\n` +
          `Are you absolutely sure you want to continue?`
        )
        if (!confirmRemove) return
      }
    }

    setIsSubmitting(true)
    try {
      await assignPermissions.mutateAsync({
        id: currentRole.id,
        permissions: Array.from(pendingPermissions)
      })
      success(`Permissions updated for role "${currentRole.name}"`)
      setIsDirty(false)

      // Force refresh all data
      await forceRefresh()

      // Update the current role with new permissions
      const updatedRole = roles.find(r => r.id === currentRole.id)
      if (updatedRole) {
        setPendingPermissions(new Set(updatedRole.permissions?.map(p => p.name) || []))
      }
    } catch (error: any) {
      toastError(error.message || 'Failed to update permissions')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectAllGroup = (groupName: string, perms: Permission[]) => {
    if (!currentRole) return

    // Check if admin is trying to remove multiple permissions
    const isAdminRole = currentRole.name === 'ADMIN'
    const currentUserRoles = currentUser?.roles || []
    const isCurrentUserAdmin = currentUserRoles.includes('ADMIN')

    const permissionNames = perms.map(p => p.name)
    const allSelected = permissionNames.every(p => pendingPermissions.has(p))

    if (isAdminRole && isCurrentUserAdmin && allSelected) {
      const criticalPermissions = ['assign_roles', 'manage_users', 'manage_permissions']
      const removedCritical = permissionNames.filter(p =>
        criticalPermissions.includes(p)
      )

      if (removedCritical.length > 0) {
        const confirmRemove = confirm(
          `⚠️⚠️⚠️ CRITICAL WARNING ⚠️⚠️⚠️\n\n` +
          `You are about to remove critical permissions from your own ADMIN role:\n` +
          `${removedCritical.map(p => `• ${p}`).join('\n')}\n\n` +
          `This may lock you out of admin functions.\n\n` +
          `Are you sure you want to continue?`
        )
        if (!confirmRemove) return
      }
    }

    const newSet = new Set(pendingPermissions)
    if (allSelected) {
      permissionNames.forEach(p => newSet.delete(p))
    } else {
      permissionNames.forEach(p => newSet.add(p))
    }
    setPendingPermissions(newSet)
    setIsDirty(true)
  }

  const toggleGroupExpand = (groupName: string) => {
    const newSet = new Set(expandedGroups)
    if (newSet.has(groupName)) newSet.delete(groupName)
    else newSet.add(groupName)
    setExpandedGroups(newSet)
  }

  const handleCreateRole = async (data: any) => {
    const errors: Record<string, string> = {}
    if (!data.name) errors.name = 'Role name is required'
    if (roles.some(r => r.name === data.name.toUpperCase())) {
      errors.name = 'Role already exists'
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await createRole.mutateAsync({
        name: data.name.toUpperCase(),
        description: data.description,
        permissions: []
      })
      success('Role created successfully')
      setShowCreateRoleDialog(false)
      setRoleForm({ name: '', description: '' })
      setFormErrors({})
      await forceRefresh()
    } catch (error: any) {
      toastError(error.message || 'Failed to create role')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateRole = async (data: any) => {
    if (!selectedRole) return

    const errors: Record<string, string> = {}
    if (!data.name) errors.name = 'Role name is required'
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await updateRole.mutateAsync({
        id: selectedRole.id,
        data: {
          name: data.name.toUpperCase(),
          description: data.description
        }
      })
      success('Role updated successfully')
      setShowEditRoleDialog(false)
      setSelectedRole(null)
      setRoleForm({ name: '', description: '' })
      setFormErrors({})
      await forceRefresh()
    } catch (error: any) {
      toastError(error.message || 'Failed to update role')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!selectedRole) return

    // Prevent deleting own role
    const currentUserRoles = currentUser?.roles || []
    if (currentUserRoles.includes(selectedRole.name)) {
      toastError('You cannot delete your own role')
      return
    }

    setIsSubmitting(true)
    try {
      await deleteRole.mutateAsync(selectedRole.id)
      success(`Role "${selectedRole.name}" deleted successfully`)
      setShowDeleteRoleDialog(false)
      setSelectedRole(null)
      await forceRefresh()
    } catch (error: any) {
      toastError(error.message || 'Failed to delete role')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if role has pending changes
  const hasChanges = isDirty

  // Loading state
  const isLoading = rolesLoading || permissionsLoading || groupedLoading || isRefreshing

  // Check permissions
  if (!hasPermission('assign_roles') && !isAdmin()) {
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
              You don't have permission to manage roles and permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (rolesError || permissionsError || groupedError) {
    return (
      <PageTemplate
        title="Permissions Matrix"
        description="Manage roles and permissions across the system"
        icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
      >
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Permissions</AlertTitle>
          <AlertDescription>
            <p>Failed to load permissions data. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={forceRefresh}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </PageTemplate>
    )
  }

  return (
    <PageTemplate
      title="Permissions Matrix"
      description="Manage roles and permissions across the system"
      icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{roles.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Permissions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {permissionMatrix.reduce((acc, g) => acc + g.permissions.length, 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Key className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Groups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{permissionMatrix.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {roles.filter(r => r.permissions && r.permissions.length > 0).length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
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
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={selectedRoleId?.toString() || ''}
              onValueChange={(value) => {
                const newRoleId = parseInt(value)
                setSelectedRoleId(newRoleId)
                // Reset dirty state when switching roles
                setIsDirty(false)
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      <span>{role.name}</span>
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {role.permissions?.length || 0}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => {
                setRoleForm({ name: '', description: '' })
                setFormErrors({})
                setShowCreateRoleDialog(true)
              }}
              className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4" />
              New Role
            </Button>
            <Button
              variant="outline"
              onClick={forceRefresh}
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Role Info */}
      {currentRole && (
        <Card className={cn(
          "mb-6 border-l-4 transition-colors",
          hasChanges ? "border-l-amber-500" : "border-l-purple-500"
        )}>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentRole.name}
                    </h3>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {pendingPermissions.size} permissions
                    </Badge>
                    {hasChanges && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse">
                        Unsaved Changes
                      </Badge>
                    )}
                    {currentRole.name === 'ADMIN' && (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        ⚠️ Admin Role
                      </Badge>
                    )}
                  </div>
                  {currentRole.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentRole.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(currentRole.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(currentRole)
                    setRoleForm({
                      name: currentRole.name,
                      description: currentRole.description || '',
                    })
                    setFormErrors({})
                    setShowViewRoleDialog(true)
                  }}
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(currentRole)
                    setRoleForm({
                      name: currentRole.name,
                      description: currentRole.description || '',
                    })
                    setFormErrors({})
                    setShowEditRoleDialog(true)
                  }}
                  className="gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(currentRole)
                    setShowDeleteRoleDialog(true)
                  }}
                  className="gap-1"
                  disabled={currentRole.name === 'ADMIN' && (currentUser?.roles || []).includes('ADMIN')}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePermissions}
                  disabled={isSubmitting || !hasChanges}
                  className={cn(
                    "gap-1",
                    hasChanges
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      : "bg-gray-400 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {hasChanges ? 'Save Changes' : 'No Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Matrix - Grid View */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
              <p className="text-gray-500">Loading permissions...</p>
            </div>
          ) : filteredMatrix.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Shield className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No permissions found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400">Try adjusting your search</p>
              )}
              {roles.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">No roles found. Create a role first.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {filteredMatrix.map((group) => {
                const groupInfo = getGroupInfo(group.name)
                const Icon = groupInfo.icon
                const allSelected = group.permissions.every(p => pendingPermissions.has(p.name))
                const someSelected = group.permissions.some(p => pendingPermissions.has(p.name))

                return (
                  <Card key={group.name} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className={cn("px-4 py-2 border-b", groupInfo.bgColor)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", groupInfo.color)} />
                          <span className="font-semibold text-sm">{groupInfo.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {group.permissions.length}
                          </Badge>
                        </div>
                        <button
                          onClick={() => handleSelectAllGroup(group.name, group.permissions)}
                          className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {group.permissions.map((permission) => {
                          const isChecked = pendingPermissions.has(permission.name)
                          const isCritical = ['assign_roles', 'manage_users', 'manage_permissions'].includes(permission.name)
                          const isCurrentUserAdmin = currentRole?.name === 'ADMIN' && (currentUser?.roles || []).includes('ADMIN')

                          return (
                            <TooltipProvider key={permission.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleTogglePermission(permission.name)}
                                    className={cn(
                                      "inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
                                      isChecked
                                        ? isCritical && isCurrentUserAdmin
                                          ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                                    )}
                                  >
                                    {isChecked ? (
                                      <Check className="h-2.5 w-2.5" />
                                    ) : (
                                      <X className="h-2.5 w-2.5" />
                                    )}
                                    {permission.name}
                                    {isCritical && isCurrentUserAdmin && isChecked && (
                                      <span className="text-[10px] ml-0.5">⚠️</span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {isChecked ? 'Click to remove' : 'Click to grant'}
                                    {isCritical && isCurrentUserAdmin && isChecked && ' (⚠️ Critical permission)'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between py-3 px-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500">
            Showing {filteredMatrix.reduce((acc, g) => acc + g.permissions.length, 0)} permissions
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-emerald-500"></div>
              <span>Enabled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-gray-300 dark:bg-gray-600"></div>
              <span>Disabled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-red-400"></div>
              <span>Critical</span>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3 w-3" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* ============================================
          MODALS
          ============================================ */}

      <RoleFormModal
        isOpen={showCreateRoleDialog}
        isEdit={false}
        onClose={() => setShowCreateRoleDialog(false)}
        onSubmit={handleCreateRole}
        roles={roles}
        isSubmitting={isSubmitting}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
      />

      <RoleFormModal
        isOpen={showEditRoleDialog}
        isEdit={true}
        onClose={() => {
          setShowEditRoleDialog(false)
          setSelectedRole(null)
        }}
        onSubmit={handleUpdateRole}
        initialData={selectedRole}
        roles={roles}
        isSubmitting={isSubmitting}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
      />

      <ViewRoleModal
        isOpen={showViewRoleDialog}
        onClose={() => {
          setShowViewRoleDialog(false)
          setSelectedRole(null)
        }}
        role={selectedRole}
      />

      <DeleteRoleModal
        isOpen={showDeleteRoleDialog}
        onClose={() => {
          setShowDeleteRoleDialog(false)
          setSelectedRole(null)
        }}
        onConfirm={handleDeleteRole}
        roleName={selectedRole?.name || ''}
        usersCount={selectedRole?.users_count || 0}
        isDeleting={isSubmitting}
      />
    </PageTemplate>
  )
}
