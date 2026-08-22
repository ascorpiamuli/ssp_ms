// app/(dashboard)/admin/permissions/page.tsx
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
  Key,
  Check,
  X,
  Eye,
  Layers,
  AlertCircle,
  User,
  Database,
  XCircle,
  Sparkles,
  Tag,
  Lock,
  Unlock,
  Crown,
  Clock,
  Calendar,
  UserCheck,
  ListFilter,
  FilterX,
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Textarea } from '@/components/ui/textarea'


import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag'
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag'

// ============================================
// TYPES
// ============================================

interface Permission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

interface Role {
  id: number
  name: string
  label: string | null
  description: string | null
  guard_name: string
  permissions: Permission[] | string[]
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
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'Requisitions',
    description: 'Create, view, edit, and manage requisitions'
  },
  'approvals': {
    icon: Shield,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    label: 'Approvals',
    description: 'Multi-level approval workflow management'
  },
  'procurement': {
    icon: ShoppingCart,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    label: 'Procurement',
    description: 'Supplier and quotation management'
  },
  'orders': {
    icon: Package,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    label: 'Orders',
    description: 'Purchase orders and tracking'
  },
  'invoices': {
    icon: CreditCard,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    label: 'Invoices & Payments',
    description: 'Invoice verification and payment processing'
  },
  'budget': {
    icon: DollarSign,
    color: 'text-lime-600 dark:text-lime-400',
    bgColor: 'bg-lime-50 dark:bg-lime-900/20',
    label: 'Budget & Finance',
    description: 'Budget allocation and expenditure tracking'
  },
  'reports': {
    icon: BarChart3,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    label: 'Reports',
    description: 'Generate and export reports'
  },
  'users': {
    icon: Users,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    label: 'Users',
    description: 'User management and role assignment'
  },
  'departments': {
    icon: Building2,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
    label: 'Departments',
    description: 'Department management'
  },
  'suppliers': {
    icon: Users,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    label: 'Suppliers',
    description: 'Supplier registration and management'
  },
  'quotations': {
    icon: FileText,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    label: 'Quotations',
    description: 'Quotation requests and responses'
  },
  'audit': {
    icon: Shield,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    label: 'Audit',
    description: 'Audit logs and compliance'
  },
  'settings': {
    icon: Settings,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    label: 'Settings',
    description: 'System configuration'
  },
  'backup': {
    icon: Database,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    label: 'Backup',
    description: 'Backup and restore management'
  },
  'profile': {
    icon: User,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
    label: 'Profile',
    description: 'User profile management'
  },
  'support': {
    icon: User,
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    label: 'Support',
    description: 'Support tickets and help'
  },
  'hr': {
    icon: User,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    label: 'Human Resources',
    description: 'Staff and HR management'
  },
  'assets': {
    icon: Package,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    label: 'Assets',
    description: 'Asset and inventory management'
  },
  'facilities': {
    icon: Building2,
    color: 'text-lime-600 dark:text-lime-400',
    bgColor: 'bg-lime-50 dark:bg-lime-900/20',
    label: 'Facilities',
    description: 'Facilities and room management'
  },
  'other': {
    icon: Layers,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    label: 'Other',
    description: 'Miscellaneous permissions'
  }
}

// ============================================
// HELPERS
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

const extractRoles = (data: any): Role[] => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.data && Array.isArray(data.data)) return data.data
  if (data.roles && Array.isArray(data.roles)) return data.roles
  if (data.data && data.data.data && Array.isArray(data.data.data)) return data.data.data
  return []
}

const extractPermissions = (data: any): Permission[] => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.data && Array.isArray(data.data)) return data.data
  if (data.permissions && Array.isArray(data.permissions)) return data.permissions
  if (data.data && data.data.data && Array.isArray(data.data.data)) return data.data.data
  return []
}

const formatDate = (date: string | null) => {
  if (!date) return 'Never'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

const getRoleBadgeColor = (roleName: string) => {
  const map: Record<string, string> = {
    'ADMIN': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    'SUPER_ADMIN': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    'HOD': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'ACCOUNTANT': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    'PRINCIPAL': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'FINAL_APPROVER': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    'PROCUREMENT': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    'SUPPLIER': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'AUDITOR': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800',
    'STAFF': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  }
  return map[roleName] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
}

// ============================================
// MODALS
// ============================================

// Create/Edit Role Modal - No Tags
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
    label: '',
    description: '',
  })

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        name: initialData.name || '',
        label: initialData.label || '',
        description: initialData.description || '',
      })
    } else if (!isEdit) {
      setFormData({
        name: '',
        label: '',
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
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Role' : 'Create New Role'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
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
              className={cn(
                "rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                formErrors.name ? 'border-red-500' : ''
              )}
              readOnly={isEdit}
              disabled={isEdit}
            />
            {isEdit && (
              <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Role name cannot be changed
              </p>
            )}
            {formErrors.name && (
              <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Label <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Administrator, Manager, Staff"
              value={formData.label}
              onChange={(e) => {
                setFormData({ ...formData, label: e.target.value })
                if (formErrors.label) setFormErrors({ ...formErrors, label: '' })
              }}
              className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              This is what users will see throughout the system
            </p>
            {formErrors.label && (
              <p className="text-xs text-red-500 mt-1">{formErrors.label}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <Textarea
              placeholder="Brief description of this role and its responsibilities"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[80px]"
              rows={3}
            />
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
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

// View Role Modal - No Tags
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
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {role.label || role.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{role.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Label</p>
              <p className="font-medium text-gray-900 dark:text-white">{role.label || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Role Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{role.name}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Permissions</p>
              <p className="font-medium text-gray-900 dark:text-white">{role.permissions?.length || 0}</p>
            </div>
          </div>

          {role.description && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
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
                {role.permissions.map((permission: any) => {
                  const permName = typeof permission === 'string' ? permission : permission.name
                  const group = getPermissionGroup(permName)
                  const groupInfo = PERMISSION_GROUPS[group]
                  return (
                    <Badge key={permName}
                      className={cn("text-xs rounded-full", groupInfo?.bgColor || "bg-gray-100 dark:bg-gray-800")}>
                      {permName}
                    </Badge>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No permissions assigned</p>
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

// Delete Role Modal - No Tags
const DeleteRoleModal = ({
  isOpen,
  onClose,
  onConfirm,
  roleName,
  roleLabel,
  usersCount,
  isDeleting
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  roleName: string
  roleLabel: string | null
  usersCount: number
  isDeleting: boolean
}) => {
  if (!isOpen) return null

  const displayName = roleLabel || roleName

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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Role</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Are you sure you want to delete the role "{displayName}"?
          </p>
          {usersCount > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
              This role is assigned to {usersCount} user(s). Deleting it will remove their permissions.
            </p>
          )}
          <p className="text-sm text-red-500 dark:text-red-400 mb-6">
            This action cannot be undone.
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
                  Delete Role
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

export default function PermissionsMatrixPage() {
  const { user: currentUser, hasPermission, isAdmin, refetchUser } = useAuthContext()
  const { success, error: toastError } = useToast()
  const {
    useAllRolesWithLabels,
    usePermissions,
    usePermissionsGrouped,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
  } = useRoles()

  // Queries
  const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles, error: rolesError } = useAllRolesWithLabels()
  const { data: permissionsData, isLoading: permissionsLoading, refetch: refetchPermissions, error: permissionsError } = usePermissions()
  const { data: permissionsGroupedData, isLoading: groupedLoading, refetch: refetchGrouped, error: groupedError } = usePermissionsGrouped()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleForm, setRoleForm] = useState({ name: '', label: '', description: '' })
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
    if (selectedRoleId) {
      const found = roles.find(r => r.id === selectedRoleId)
      return found || null
    }
    return roles.length > 0 ? roles[0] : null
  }, [roles, selectedRoleId])

  // Initialize pending permissions when role changes
  useEffect(() => {
    if (currentRole) {
      let permissionNames: string[] = []

      if (Array.isArray(currentRole.permissions)) {
        if (currentRole.permissions.length > 0 && typeof currentRole.permissions[0] === 'string') {
          permissionNames = currentRole.permissions as string[]
        } else {
          permissionNames = currentRole.permissions.map((p: any) => p?.name).filter(Boolean)
        }
      }

      setPendingPermissions(new Set(permissionNames))
      setIsDirty(false)
    } else {
      setPendingPermissions(new Set())
    }
  }, [currentRole?.id])

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
          const permName = typeof p === 'string' ? p : p?.name
          if (permName && !allPermissionsMap.has(permName)) {
            allPermissionsMap.set(permName, {
              id: 0,
              name: permName,
              guard_name: 'web',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        })
      }
    })

    if (allPermissionsMap.size === 0 && permissions.length > 0) {
      permissions.forEach(p => {
        if (p && p.name && !allPermissionsMap.has(p.name)) {
          allPermissionsMap.set(p.name, p)
        }
      })
    }

    if (allPermissionsMap.size === 0 && permissionsGroupedData) {
      const grouped = permissionsGroupedData.data || permissionsGroupedData
      Object.values(grouped).forEach((group: any) => {
        if (Array.isArray(group)) {
          group.forEach((p: any) => {
            if (p && p.name && !allPermissionsMap.has(p.name)) {
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
      if (permission && permission.name) {
        const groupName = getPermissionGroup(permission.name)
        if (!groups[groupName]) groups[groupName] = []
        groups[groupName].push(permission)
      }
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
          p && p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(group => group.permissions.length > 0)
  }, [permissionMatrix, searchTerm])



  const getGroupInfo = (groupName: string) => {
    return PERMISSION_GROUPS[groupName] || PERMISSION_GROUPS['other']
  }

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

  const handleTogglePermission = (permissionName: string) => {
    if (!currentRole || !permissionName) return

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

    const isAdminRole = currentRole.name === 'ADMIN'
    const currentUserRoles = currentUser?.roles || []
    const isCurrentUserAdmin = currentUserRoles.includes('ADMIN')

    if (isAdminRole && isCurrentUserAdmin) {
      const criticalPermissions = ['assign_roles', 'manage_users', 'manage_permissions']
      const removedCritical = criticalPermissions.filter(p =>
        pendingPermissions.has(p) && !new Set(currentRole.permissions?.map((p: any) => typeof p === 'string' ? p : p?.name).filter(Boolean)).has(p)
      )

      if (removedCritical.length > 0) {
        const confirmRemove = confirm(
          `You are about to remove critical permissions from your own ADMIN role:\n\n` +
          `${removedCritical.map(p => `• ${p}`).join('\n')}\n\n` +
          `This may permanently lock you out of admin functions.\n\n` +
          `Are you sure you want to continue?`
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
      success(`Permissions updated for "${currentRole.label || currentRole.name}"`)
      setIsDirty(false)
      await forceRefresh()
    } catch (error: any) {
      toastError(error.message || 'Failed to update permissions')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectAllGroup = (groupName: string, perms: Permission[]) => {
    if (!currentRole) return

    const permissionNames = perms.map(p => p.name)
    const allSelected = permissionNames.every(p => pendingPermissions.has(p))

    const newSet = new Set(pendingPermissions)
    if (allSelected) {
      permissionNames.forEach(p => newSet.delete(p))
    } else {
      permissionNames.forEach(p => newSet.add(p))
    }
    setPendingPermissions(newSet)
    setIsDirty(true)
  }

  const handleCreateRole = async (data: any) => {
    const errors: Record<string, string> = {}
    if (!data.name) errors.name = 'Role name is required'
    if (!data.label) errors.label = 'Display label is required'
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
        label: data.label,
        description: data.description,
        permissions: []
      })
      success('Role created successfully')
      setShowCreateRoleDialog(false)
      setRoleForm({ name: '', label: '', description: '' })
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
    if (!data.label) errors.label = 'Display label is required'
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await updateRole.mutateAsync({
        id: selectedRole.id,
        data: {
          label: data.label,
          description: data.description
        }
      })
      success('Role updated successfully')
      setShowEditRoleDialog(false)
      setSelectedRole(null)
      setRoleForm({ name: '', label: '', description: '' })
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

    const currentUserRoles = currentUser?.roles || []
    if (currentUserRoles.includes(selectedRole.name)) {
      toastError('You cannot delete your own role')
      return
    }

    setIsSubmitting(true)
    try {
      await deleteRole.mutateAsync(selectedRole.id)
      success(`Role "${selectedRole.label || selectedRole.name}" deleted successfully`)
      setShowDeleteRoleDialog(false)
      setSelectedRole(null)
      await forceRefresh()
    } catch (error: any) {
      toastError(error.message || 'Failed to delete role')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasChanges = isDirty
  const isLoading = rolesLoading || permissionsLoading || groupedLoading || isRefreshing

  // Check permissions
  if (!hasPermission('assign_roles') && !isAdmin()) {
    return (
      <PageTemplate
        title="Permissions"
        description="Manage roles and permissions across the system"
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
                You don't have permission to manage roles and permissions.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    )
  }

  if (rolesError || permissionsError || groupedError) {
    return (
      <PageTemplate
        title="Permissions"
        description="Manage roles and permissions across the system"
        icon={<Shield className="h-5 w-5" />}
        background="gradient"
      >
        <Alert variant="destructive" className="mb-4 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Permissions</AlertTitle>
          <AlertDescription>
            <p>Failed to load permissions data. Please try again.</p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={forceRefresh}>
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
      title="Role Management"
      description="Manage roles, labels, and permissions across the system"
      icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Permissions' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 rounded-full">
            <Sparkles className="h-3 w-3 mr-1" />
            {roles.length} Roles
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
          <Button
            size="sm"
            onClick={() => {
              setRoleForm({ name: '', label: '', description: '' })
              setFormErrors({})
              setShowCreateRoleDialog(true)
            }}
            className="gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-600/20"
          >
            <Plus className="h-4 w-4" />
            New Role
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Controls */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">

          <CardContent className="p-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <Select
                value={selectedRoleId?.toString() || ''}
                onValueChange={(value) => {
                  const newRoleId = parseInt(value)
                  if (newRoleId > 0) {
                    setSelectedRoleId(newRoleId)
                    setIsDirty(false)
                  }
                }}
                disabled={roles.length === 0}
              >
                <SelectTrigger className="w-[220px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder={roles.length === 0 ? "No roles" : "Select role"} />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()} className="dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{role.label || role.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({role.name})</span>
                        <Badge variant="secondary" className="text-xs ml-auto rounded-full">
                          {role.permissions?.length || 0}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="h-11 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FilterX className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role Info Card */}
        {currentRole && (
          <div className={cn(
            "bg-white dark:bg-gray-900/50 rounded-xl border p-4 transition-all shadow-sm",
            hasChanges
              ? "border-amber-400 dark:border-amber-600 shadow-lg shadow-amber-500/10"
              : "border-gray-200 dark:border-gray-700"
          )}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2.5 rounded-xl",
                  currentRole.name === 'ADMIN' ? "bg-purple-100 dark:bg-purple-900/30" : "bg-gray-100 dark:bg-gray-800"
                )}>
                  {currentRole.name === 'ADMIN' ? (
                    <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentRole.label || currentRole.name}
                    </h3>
                    <Badge className={cn("text-xs border rounded-full", getRoleBadgeColor(currentRole.name))}>
                      {currentRole.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs rounded-full">
                      {pendingPermissions.size} permissions
                    </Badge>
                    {hasChanges && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse text-xs rounded-full">
                        Unsaved
                      </Badge>
                    )}
                  </div>
                  {currentRole.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentRole.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created {formatDate(currentRole.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(currentRole)
                    setShowViewRoleDialog(true)
                  }}
                  className="rounded-xl"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(currentRole)
                    setRoleForm({
                      name: currentRole.name,
                      label: currentRole.label || '',
                      description: currentRole.description || '',
                    })
                    setFormErrors({})
                    setShowEditRoleDialog(true)
                  }}
                  className="rounded-xl"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(currentRole)
                    setShowDeleteRoleDialog(true)
                  }}
                  className="rounded-xl"
                  disabled={currentRole.name === 'ADMIN' && (currentUser?.roles || []).includes('ADMIN')}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePermissions}
                  disabled={isSubmitting || !hasChanges}
                  className={cn(
                    "rounded-xl transition-all",
                    hasChanges
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-600/20"
                      : "bg-gray-400 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {hasChanges ? 'Save Changes' : 'No Changes'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Grid */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden relative">
          <WrappedCornerTag label="PERMISSIONS" color="purple" position="top-left" size="lg" />
          <div className="pt-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
                <p className="text-gray-500">Loading permissions...</p>
              </div>
            ) : filteredMatrix.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Shield className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No permissions found</p>
                {searchTerm && <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>}
                {roles.length === 0 && <p className="text-sm text-gray-400 mt-1">Create a role to get started</p>}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMatrix.map((group) => {
                  const groupInfo = getGroupInfo(group.name)
                  const Icon = groupInfo.icon
                  const allSelected = group.permissions.every(p => pendingPermissions.has(p.name))
                  const someSelected = group.permissions.some(p => pendingPermissions.has(p.name))

                  return (
                    <div key={group.name} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-1.5 rounded-lg", groupInfo.bgColor)}>
                            <Icon className={cn("h-4 w-4", groupInfo.color)} />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{groupInfo.label}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                              {group.permissions.length} permissions
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectAllGroup(group.name, group.permissions)}
                          className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        >
                          {allSelected ? (
                            <><Unlock className="h-3 w-3" /> Deselect All</>
                          ) : (
                            <><Lock className="h-3 w-3" /> Select All</>
                          )}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.permissions.map((permission) => {
                          if (!permission || !permission.name) return null
                          const isChecked = pendingPermissions.has(permission.name)
                          const isCritical = ['assign_roles', 'manage_users', 'manage_permissions'].includes(permission.name)

                          return (
                            <TooltipProvider key={permission.id || permission.name}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleTogglePermission(permission.name)}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                      isChecked
                                        ? isCritical
                                          ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
                                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                        : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                                    )}
                                  >
                                    {isChecked ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <X className="h-3 w-3" />
                                    )}
                                    {permission.name}
                                    {isCritical && isChecked && (
                                      <span className="text-[10px] text-red-500">*</span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl">
                                  <p className="text-xs">
                                    {isChecked ? 'Click to remove' : 'Click to grant'}
                                    {isCritical && isChecked && ' (Critical permission)'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 gap-2">
            <span className="text-sm text-gray-500">
              {filteredMatrix.reduce((acc, g) => acc + g.permissions.length, 0)} total permissions
            </span>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Enabled
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                Disabled
              </span>
              <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Critical
              </span>
              {hasChanges && (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Unsaved changes
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
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
        roleLabel={selectedRole?.label || null}
        usersCount={selectedRole?.users_count || 0}
        isDeleting={isSubmitting}
      />
    </PageTemplate>
  )
}
