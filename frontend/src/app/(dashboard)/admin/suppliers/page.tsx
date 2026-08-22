// app/(dashboard)/admin/suppliers/page.tsx
'use client'

import { useState, useMemo } from 'react'
import {
  Building2,
  Search,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  FilterX,
  AlertTriangle,
  Mail,
  Phone,
  Shield,
  Calendar,
  XCircle,
  Ban,
  Check,
  Globe,
  FileText,
  Hash,
  CreditCard,
  Users,
  Award,
  User as UserIcon,
  ExternalLink,
  Building,
  Sparkles,
  Crown,
  Info,
  Clock,
  MapPin,
  Briefcase,
  DollarSign,
  Package,
  Layers,
  Grid,
  List,
  Filter,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Flag,
  Camera,
  Video,
  Music,
  Code,
  Cloud,
  Database,
  Server,
  Wifi,
  Bluetooth,
  Battery,
  Lightbulb,
  HeartPulse,
  Brain,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Speaker,
  Mic,
  MailIcon,
  GlobeIcon,
  ClockIcon,
  Settings,
  Menu,
  MoreHorizontal,
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
import { useAuthContext } from '@/contexts/AuthContext'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSuppliers } from '@/hooks/useSuppliers'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards'
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag'

// ============================================
// TYPES
// ============================================

interface SupplierFilters {
  search: string
  category: string
  status: 'all' | 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
  sort_by: string
  sort_order: 'asc' | 'desc'
  per_page: number
  page: number
}

interface ExtendedSupplier {
  id: number
  user_id: number
  company_name: string
  company_email: string
  company_phone?: string
  company_registration: string
  company_address: string
  company_website?: string
  tax_id?: string
  category: 'goods' | 'services' | 'both'
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
  blacklist_reason?: string
  blacklisted_at?: string
  description?: string
  established_year?: string
  employee_count?: string
  annual_revenue?: string
  certifications?: string
  registration_date?: string
  license_number?: string
  bank_name?: string
  bank_account?: string
  bank_branch?: string
  payment_terms?: string
  preferred_currency?: string
  contact_person_name?: string
  contact_person_email?: string
  contact_person_phone?: string
  company_logo?: string
  company_logo_upload_id?: number
  category_label?: string
  category_color?: string
  status_label?: string
  status_color?: string
  formatted_annual_revenue?: string
  certifications_array?: string[]
  banking_summary?: string
  contact_person_full_name?: string
  full_address?: string
  display_name?: string
  company_logo_url?: string
  has_company_logo?: boolean
  is_active?: boolean
  is_blacklisted?: boolean
  user?: {
    id: number
    full_name: string
    email: string
    phone: string
    avatar_url?: string
  }
  created_by?: {
    id: number
    full_name: string
  }
  created_at: string
  updated_at: string
  deleted_at?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    'goods': 'Goods Supplier',
    'services': 'Services Provider',
    'both': 'Both Goods & Services'
  }
  return map[category] || category
}

const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    'goods': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'services': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    'both': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800'
  }
  return map[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
}

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    'ACTIVE': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'INACTIVE': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    'BLACKLISTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
  }
  return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
}

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string, icon: any, color: string }> = {
    'ACTIVE': { label: 'Active', icon: CheckCircle, color: 'text-emerald-500' },
    'INACTIVE': { label: 'Inactive', icon: XCircle, color: 'text-gray-500' },
    'BLACKLISTED': { label: 'Blacklisted', icon: Ban, color: 'text-red-500' }
  }
  return map[status] || { label: status, icon: AlertCircle, color: 'text-gray-500' }
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

const getUserInitials = (name: string) => {
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ============================================
// VIEW SUPPLIER MODAL
// ============================================

const ViewSupplierModal = ({
  isOpen,
  onClose,
  supplier
}: {
  isOpen: boolean
  onClose: () => void
  supplier: ExtendedSupplier | null
}) => {
  if (!isOpen || !supplier) return null

  const StatusBadge = getStatusBadge(supplier.status)
  const StatusIcon = StatusBadge.icon

  const infoCards: {
    title: string
    icon: any
    items: {
      label: string
      value: string
      isBadge?: boolean
      isLink?: boolean
    }[]
  }[] = [
      {
        title: 'Company Information',
        icon: Building,
        items: [
          { label: 'Company Name', value: supplier.company_name },
          { label: 'Registration Number', value: supplier.company_registration },
          { label: 'Tax ID / PIN', value: supplier.tax_id || 'Not set' },
          { label: 'Category', value: supplier.category_label || getCategoryLabel(supplier.category), isBadge: true },
        ]
      },
      {
        title: 'Contact Details',
        icon: Phone,
        items: [
          { label: 'Email', value: supplier.company_email, isLink: true },
          { label: 'Phone', value: supplier.company_phone || 'Not set' },
          { label: 'Website', value: supplier.company_website || 'Not set', isLink: true },
          { label: 'Address', value: supplier.full_address || 'Not set' },
        ]
      },
      {
        title: 'Contact Person',
        icon: UserIcon,
        items: [
          { label: 'Name', value: supplier.contact_person_full_name || 'Not set' },
          { label: 'Email', value: supplier.contact_person_email || 'Not set', isLink: true },
          { label: 'Phone', value: supplier.contact_person_phone || 'Not set' },
        ]
      },
      {
        title: 'Banking Information',
        icon: CreditCard,
        items: [
          { label: 'Bank Name', value: supplier.bank_name || 'Not set' },
          { label: 'Branch', value: supplier.bank_branch || 'Not set' },
          { label: 'Account Number', value: supplier.bank_account || 'Not set' },
          { label: 'Preferred Currency', value: supplier.preferred_currency || 'KES' },
        ]
      },
      {
        title: 'User Account',
        icon: UserIcon,
        items: [
          { label: 'User', value: supplier.user?.full_name || 'N/A' },
          { label: 'Email', value: supplier.user?.email || 'N/A', isLink: true },
          { label: 'Phone', value: supplier.user?.phone || 'N/A' },
        ]
      },
    ]

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
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <WrappedCornerTag label="SUPPLIER" color="blue" position="top-left" size="lg" />

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 rounded-t-2xl pt-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="relative">
                {supplier.company_logo ? (
                  <div className="h-16 w-16 rounded-2xl overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900/30 shadow-lg">
                    <Image
                      src={supplier.company_logo}
                      alt={supplier.company_name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/30">
                    {supplier.company_name?.[0] || 'S'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  <Badge className={cn("border font-medium", getStatusColor(supplier.status))}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {supplier.status_label || supplier.status}
                  </Badge>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {supplier.company_name}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={cn("font-medium border", getCategoryColor(supplier.category))}>
                    {supplier.category_label || getCategoryLabel(supplier.category)}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    • Registered {formatTimeAgo(supplier.created_at)}
                  </span>
                  {supplier.is_blacklisted && supplier.blacklist_reason && (
                    <Badge variant="outline" className="border-red-400 text-red-600 dark:text-red-400">
                      <Ban className="h-3 w-3 mr-1" />
                      Blacklisted
                    </Badge>
                  )}
                </div>
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

        {/* Content */}
        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Registration</p>
              <p className="font-semibold text-gray-900 dark:text-white">{supplier.company_registration}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Year Established</p>
              <p className="font-semibold text-gray-900 dark:text-white">{supplier.established_year || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Employees</p>
              <p className="font-semibold text-gray-900 dark:text-white">{supplier.employee_count || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Annual Revenue</p>
              <p className="font-semibold text-gray-900 dark:text-white">{supplier.formatted_annual_revenue || 'N/A'}</p>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {infoCards.map((card, idx) => {
              const Icon = card.icon
              return (
                <Card key={idx} className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-4 w-4 text-blue-500" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{card.title}</h3>
                    </div>
                    {card.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                        {item.isBadge ? (
                          <Badge className={cn("text-xs font-medium", getCategoryColor(supplier.category))}>
                            {item.value}
                          </Badge>
                        ) : item.isLink && item.value !== 'Not set' && item.value !== 'N/A' ? (
                          <a
                            href={item.value.includes('@') ? `mailto:${item.value}` : item.value}
                            target={!item.value.includes('@') ? '_blank' : undefined}
                            rel={!item.value.includes('@') ? 'noopener noreferrer' : undefined}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            {item.value}
                            {!item.value.includes('@') && item.value !== 'Not set' && <ExternalLink className="h-3 w-3" />}
                          </a>
                        ) : (
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Company Description */}
          {supplier.description && (
            <Card className="mt-6 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Company Description</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {supplier.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {supplier.certifications_array && supplier.certifications_array.length > 0 && (
            <Card className="mt-6 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Certifications</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {supplier.certifications_array.map((cert) => (
                    <Badge key={cert} variant="secondary" className="px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700">
                      <Award className="h-3 w-3 mr-1 text-amber-500" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blacklist Info */}
          {supplier.is_blacklisted && supplier.blacklist_reason && (
            <Card className="mt-6 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Ban className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Reason for Blacklisting</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{supplier.blacklist_reason}</p>
                    {supplier.blacklisted_at && (
                      <p className="text-xs text-gray-500 mt-2">Blacklisted on {formatDate(supplier.blacklisted_at)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
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

export default function AdminSuppliersPage() {
  const { user: currentUser, hasPermission } = useAuthContext()

  const {
    useAllSuppliers,
    useSupplierCategories,
    deleteSupplier,
    blacklistSupplier,
    unblacklistSupplier,
  } = useSuppliers()

  // Get data from hooks
  const suppliersQuery = useAllSuppliers()
  const categoriesQuery = useSupplierCategories()

  const { data: suppliersList, isLoading: suppliersLoading, refetch: refetchSuppliers } = suppliersQuery
  const { data: categoriesData, isLoading: categoriesLoading } = categoriesQuery

  // Process suppliers data safely
  const safeSuppliersList = useMemo(() => {
    if (!suppliersList) return []
    if (Array.isArray(suppliersList)) return suppliersList
    if (typeof suppliersList === 'object' && suppliersList !== null) {
      const list = suppliersList as { data?: unknown }
      if (list.data && Array.isArray(list.data)) {
        return list.data
      }
    }
    return []
  }, [suppliersList])

  // Process categories data safely
  const categories = useMemo(() => {
    if (!categoriesData) return []
    if (Array.isArray(categoriesData)) return categoriesData
    if (categoriesData && typeof categoriesData === 'object' && 'data' in categoriesData && Array.isArray(categoriesData.data)) {
      return categoriesData.data
    }
    return []
  }, [categoriesData])

  const [filters, setFilters] = useState<SupplierFilters>({
    search: '',
    category: 'all',
    status: 'all',
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 10,
    page: 1
  })

  const [selectedSupplier, setSelectedSupplier] = useState<ExtendedSupplier | null>(null)
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([])
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false)
  const [showUnblacklistDialog, setShowUnblacklistDialog] = useState(false)
  const [showBulkBlacklistDialog, setShowBulkBlacklistDialog] = useState(false)
  const [blacklistReason, setBlacklistReason] = useState('')
  const [bulkBlacklistReason, setBulkBlacklistReason] = useState('')
  const [isMutating, setIsMutating] = useState(false)

  const canManageSuppliers = hasPermission('manage_suppliers') || currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('PROCUREMENT')
  const isAdmin = currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('SUPER_ADMIN')

  // Computed stats for StatsCards
  const statsItems: StatCardItem[] = useMemo(() => {
    const total = safeSuppliersList.length
    const active = safeSuppliersList.filter((s: ExtendedSupplier) => s.status === 'ACTIVE').length
    const inactive = safeSuppliersList.filter((s: ExtendedSupplier) => s.status === 'INACTIVE').length
    const blacklisted = safeSuppliersList.filter((s: ExtendedSupplier) => s.status === 'BLACKLISTED').length

    return [
      {
        label: "Total Suppliers",
        value: total,
        icon: Building2,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: "All registered suppliers",
      },
      {
        label: "Active",
        value: active,
        icon: UserCheck,
        tagLabel: "ACTIVE",
        tagColor: "emerald",
        subtitle: `${active} active suppliers`,
      },
      {
        label: "Inactive",
        value: inactive,
        icon: UserX,
        tagLabel: "INACTIVE",
        tagColor: "gray",
        subtitle: `${inactive} inactive suppliers`,
      },
      {
        label: "Blacklisted",
        value: blacklisted,
        icon: Ban,
        tagLabel: "BLACKLISTED",
        tagColor: "red",
        subtitle: `${blacklisted} blacklisted suppliers`,
      },
      {
        label: "Categories",
        value: categories.length || 0,
        icon: Layers,
        tagLabel: "CATEGORIES",
        tagColor: "purple",
        subtitle: `${categories.length || 0} categories`,
      },
    ]
  }, [safeSuppliersList, categories])

  const suppliers = useMemo(() => {
    if (!safeSuppliersList || safeSuppliersList.length === 0) {
      return []
    }

    let filtered = [...safeSuppliersList]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter((s: ExtendedSupplier) =>
        s.company_name.toLowerCase().includes(searchLower) ||
        s.company_email.toLowerCase().includes(searchLower) ||
        s.company_registration.toLowerCase().includes(searchLower)
      )
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter((s: ExtendedSupplier) => s.category === filters.category)
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((s: ExtendedSupplier) => s.status === filters.status)
    }

    return filtered
  }, [safeSuppliersList, filters])

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return
    setIsMutating(true)
    try {
      await deleteSupplier.mutateAsync(selectedSupplier.id)
      setShowDeleteDialog(false)
      setSelectedSupplier(null)
      refetchSuppliers()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsMutating(false)
    }
  }

  const handleBulkDeleteSuppliers = async () => {
    if (selectedSuppliers.length === 0) return
    setIsMutating(true)
    try {
      await Promise.all(selectedSuppliers.map(id => deleteSupplier.mutateAsync(id)))
      setSelectedSuppliers([])
      setShowBulkDeleteDialog(false)
      refetchSuppliers()
    } catch (error) {
      console.error('Bulk delete error:', error)
    } finally {
      setIsMutating(false)
    }
  }

  const handleBlacklistSupplier = async () => {
    if (!selectedSupplier || !blacklistReason.trim()) return
    setIsMutating(true)
    try {
      await blacklistSupplier.mutateAsync({
        id: selectedSupplier.id,
        reason: blacklistReason
      })
      setShowBlacklistDialog(false)
      setSelectedSupplier(null)
      setBlacklistReason('')
      refetchSuppliers()
    } catch (error) {
      console.error('Blacklist error:', error)
    } finally {
      setIsMutating(false)
    }
  }

  const handleBulkBlacklistSuppliers = async () => {
    if (selectedSuppliers.length === 0 || !bulkBlacklistReason.trim()) return
    setIsMutating(true)
    try {
      await Promise.all(selectedSuppliers.map(id =>
        blacklistSupplier.mutateAsync({ id, reason: bulkBlacklistReason })
      ))
      setSelectedSuppliers([])
      setShowBulkBlacklistDialog(false)
      setBulkBlacklistReason('')
      refetchSuppliers()
    } catch (error) {
      console.error('Bulk blacklist error:', error)
    } finally {
      setIsMutating(false)
    }
  }

  const handleUnblacklistSupplier = async () => {
    if (!selectedSupplier) return
    setIsMutating(true)
    try {
      await unblacklistSupplier.mutateAsync(selectedSupplier.id)
      setShowUnblacklistDialog(false)
      setSelectedSupplier(null)
      refetchSuppliers()
    } catch (error) {
      console.error('Unblacklist error:', error)
    } finally {
      setIsMutating(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(suppliers.map((s: ExtendedSupplier) => s.id))
    } else {
      setSelectedSuppliers([])
    }
  }

  const handleSelectSupplier = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers([...selectedSuppliers, id])
    } else {
      setSelectedSuppliers(selectedSuppliers.filter(sid => sid !== id))
    }
  }

  const isLoading = suppliersLoading || categoriesLoading

  if (!canManageSuppliers) {
    return (
      <PageTemplate
        title="Supplier Management"
        description="Manage suppliers, view profiles, and control supplier access"
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
                You don't have permission to manage suppliers. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    )
  }

  return (
    <PageTemplate
      title="Supplier Management"
      description="Manage suppliers, view profiles, and control supplier access"
      icon={<Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Suppliers' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {selectedSuppliers.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkBlacklistDialog(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 rounded-xl"
              >
                <Ban className="h-4 w-4 mr-1" />
                Blacklist ({selectedSuppliers.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete ({selectedSuppliers.length})
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchSuppliers()}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <StatsCards
          stats={statsItems}
          isLoading={isLoading}
          columns={5}
          variant="default"
          formatCompact={true}
          tagOrientation="wrapped"
          tagPosition="top-left"
        />

        {/* Filters */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search suppliers by name, email, or registration..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value, page: 1 })}
              >
                <SelectTrigger className="w-[180px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="goods">Goods Supplier</SelectItem>
                  <SelectItem value="services">Services Provider</SelectItem>
                  <SelectItem value="both">Both Goods & Services</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value as any, page: 1 })}
              >
                <SelectTrigger className="w-[160px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    search: '',
                    category: 'all',
                    status: 'all',
                    sort_by: 'created_at',
                    sort_order: 'desc',
                    per_page: 10,
                    page: 1
                  })
                }}
                className="gap-2 h-11 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <FilterX className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden relative">
          <WrappedCornerTag label="SUPPLIERS" color="blue" position="top-left" size="lg" />
          <div className="pt-8">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
                    <TableHead className="w-[40px] py-4">
                      <Checkbox
                        checked={selectedSuppliers.length === suppliers.length && suppliers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-[250px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Supplier</TableHead>
                    <TableHead className="min-w-[130px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Category</TableHead>
                    <TableHead className="min-w-[150px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Registration</TableHead>
                    <TableHead className="min-w-[120px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="min-w-[200px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</TableHead>
                    <TableHead className="min-w-[150px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Joined</TableHead>
                    <TableHead className="text-right min-w-[130px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-500">Loading suppliers...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm font-medium text-gray-500">No suppliers found</p>
                          <p className="text-xs text-gray-400">Try adjusting your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier: ExtendedSupplier) => {
                      const StatusBadge = getStatusBadge(supplier.status)
                      const StatusIcon = StatusBadge.icon
                      const isBlacklisted = supplier.status === 'BLACKLISTED'

                      return (
                        <TableRow key={supplier.id} className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group",
                          isBlacklisted && "bg-red-50/30 dark:bg-red-900/5"
                        )}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSuppliers.includes(supplier.id)}
                              onCheckedChange={(checked) => handleSelectSupplier(supplier.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {supplier.company_logo ? (
                                <div className="relative h-10 w-10 rounded-xl overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700 flex-shrink-0">
                                  <Image
                                    src={supplier.company_logo}
                                    alt={supplier.company_name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700">
                                  {supplier.company_name?.[0] || 'S'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {supplier.company_name}
                                  </p>
                                  {isBlacklisted && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Ban className="h-3.5 w-3.5 text-red-500" />
                                        </TooltipTrigger>
                                        <TooltipContent className="rounded-xl">Blacklisted</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {supplier.company_email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("font-medium border rounded-full text-xs", getCategoryColor(supplier.category))}>
                              {supplier.category_label || getCategoryLabel(supplier.category)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {supplier.company_registration}
                              </span>
                              {supplier.tax_id && (
                                <span className="text-xs text-gray-400">Tax: {supplier.tax_id}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("font-medium border rounded-full text-xs", getStatusColor(supplier.status))}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {supplier.status_label || supplier.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 ring-2 ring-gray-200 dark:ring-gray-700">
                                {supplier.user?.avatar_url ? (
                                  <AvatarImage src={supplier.user.avatar_url} alt={supplier.user.full_name} />
                                ) : null}
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium">
                                  {getUserInitials(supplier.user?.full_name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                  {supplier.user?.full_name || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {supplier.user?.email || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatTimeAgo(supplier.created_at)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {supplier.created_at ? formatDate(supplier.created_at) : 'Never'}
                              </span>
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
                                      className="h-8 w-8 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      onClick={() => {
                                        setSelectedSupplier(supplier)
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

                                  {isBlacklisted ? (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedSupplier(supplier)
                                        setShowUnblacklistDialog(true)
                                      }}
                                      className="text-emerald-600 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 cursor-pointer"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Remove from Blacklist
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedSupplier(supplier)
                                        setShowBlacklistDialog(true)
                                        setBlacklistReason('')
                                      }}
                                      className="text-red-600 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 cursor-pointer"
                                    >
                                      <Ban className="h-4 w-4 mr-2" />
                                      Blacklist Supplier
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSupplier(supplier)
                                      setShowDeleteDialog(true)
                                    }}
                                    className="text-red-600 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Supplier
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700 dark:text-gray-300">{suppliers.length}</span> of{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{safeSuppliersList.length}</span> suppliers
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={filters.per_page.toString()}
                onValueChange={(value) => setFilters({ ...filters, per_page: parseInt(value), page: 1 })}
              >
                <SelectTrigger className="w-[80px] h-9 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
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
                      className={suppliers.length < filters.per_page ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </Card>
      </div>

      {/* ============================================
          MODALS - Rendered using Portal
          ============================================ */}

      {/* View Supplier Modal */}
      <ViewSupplierModal
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false)
          setSelectedSupplier(null)
        }}
        supplier={selectedSupplier}
      />

      {/* Delete Modal */}
      {showDeleteDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 relative">
              <WrappedCornerTag label="DELETE" color="red" position="top-left" size="sm" />
              <DialogHeader className="pt-6">
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Supplier
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this supplier? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {selectedSupplier && (
                <div className="py-4">
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {selectedSupplier.company_name?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedSupplier.company_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedSupplier.company_email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteSupplier} className="gap-2 rounded-xl" disabled={isMutating}>
                  {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </AnimatePresence>,
        document.body
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
            <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 relative">
              <WrappedCornerTag label="BULK DELETE" color="red" position="top-left" size="sm" />
              <DialogHeader className="pt-6">
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Selected Suppliers
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedSuppliers.length} selected suppliers?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleBulkDeleteSuppliers} className="gap-2 rounded-xl" disabled={isMutating}>
                  {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </AnimatePresence>,
        document.body
      )}

      {/* Blacklist Modal */}
      {showBlacklistDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <Dialog open={showBlacklistDialog} onOpenChange={setShowBlacklistDialog}>
            <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 relative">
              <WrappedCornerTag label="BLACKLIST" color="red" position="top-left" size="sm" />
              <DialogHeader className="pt-6">
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <Ban className="h-5 w-5" />
                  Blacklist Supplier
                </DialogTitle>
                <DialogDescription>
                  Please provide a reason for blacklisting this supplier.
                </DialogDescription>
              </DialogHeader>
              {selectedSupplier && (
                <div className="py-4 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {selectedSupplier.company_name?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedSupplier.company_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedSupplier.company_email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blacklist-reason" className="text-sm font-medium">
                      Reason <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="blacklist-reason"
                      placeholder="Enter the reason for blacklisting..."
                      value={blacklistReason}
                      onChange={(e) => setBlacklistReason(e.target.value)}
                      className="min-h-[100px] rounded-xl"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBlacklistDialog(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBlacklistSupplier}
                  className="gap-2 rounded-xl"
                  disabled={isMutating || !blacklistReason.trim()}
                >
                  {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                  Blacklist
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </AnimatePresence>,
        document.body
      )}

      {/* Bulk Blacklist Modal */}
      {showBulkBlacklistDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <Dialog open={showBulkBlacklistDialog} onOpenChange={setShowBulkBlacklistDialog}>
            <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 relative">
              <WrappedCornerTag label="BULK BLACKLIST" color="red" position="top-left" size="sm" />
              <DialogHeader className="pt-6">
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <Ban className="h-5 w-5" />
                  Blacklist Selected Suppliers
                </DialogTitle>
                <DialogDescription>
                  Please provide a reason for blacklisting {selectedSuppliers.length} selected suppliers.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-blacklist-reason" className="text-sm font-medium">
                    Reason <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="bulk-blacklist-reason"
                    placeholder="Enter the reason for blacklisting..."
                    value={bulkBlacklistReason}
                    onChange={(e) => setBulkBlacklistReason(e.target.value)}
                    className="min-h-[100px] rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBulkBlacklistDialog(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkBlacklistSuppliers}
                  className="gap-2 rounded-xl"
                  disabled={isMutating || !bulkBlacklistReason.trim()}
                >
                  {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                  Blacklist All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </AnimatePresence>,
        document.body
      )}

      {/* Unblacklist Modal */}
      {showUnblacklistDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <Dialog open={showUnblacklistDialog} onOpenChange={setShowUnblacklistDialog}>
            <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 relative">
              <WrappedCornerTag label="REMOVE" color="emerald" position="top-left" size="sm" />
              <DialogHeader className="pt-6">
                <DialogTitle className="flex items-center gap-2 text-emerald-600">
                  <Check className="h-5 w-5" />
                  Remove from Blacklist
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove this supplier from the blacklist?
                </DialogDescription>
              </DialogHeader>
              {selectedSupplier && (
                <div className="py-4">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {selectedSupplier.company_name?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedSupplier.company_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedSupplier.company_email}
                      </p>
                      {selectedSupplier.blacklist_reason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {selectedSupplier.blacklist_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUnblacklistDialog(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={handleUnblacklistSupplier}
                  className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  disabled={isMutating}
                >
                  {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Remove
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </AnimatePresence>,
        document.body
      )}
    </PageTemplate>
  )
}
