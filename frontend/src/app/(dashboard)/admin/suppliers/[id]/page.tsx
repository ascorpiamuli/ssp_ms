// app/(dashboard)/admin/suppliers/[id]/page.tsx
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Building2,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  Award,
  User as UserIcon,
  ExternalLink,
  Ban,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Shield,
  AlertCircle,
  Check,
  X,
  Crown,
  Users,
  Briefcase,
  DollarSign,
  Package,
  Layers,
  Hash,
  Printer,
  Download,
  Share2,
  Bookmark,
  Flag,
  MoreVertical,
  Settings,
  HelpCircle,
  Info,
  Sparkles,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTemplate } from '@/components/dashboard/PageTemplate'
import { useSuppliers } from '@/hooks/useSuppliers'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Types
import type { Supplier, SupplierResponse } from '@/services/supplier.service'

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
  const map: Record<string, { label: string, icon: any }> = {
    'ACTIVE': { label: 'Active', icon: CheckCircle },
    'INACTIVE': { label: 'Inactive', icon: XCircle },
    'BLACKLISTED': { label: 'Blacklisted', icon: Ban }
  }
  return map[status] || { label: status, icon: AlertCircle }
}

const formatDate = (date: string | null) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (date: string | null) => {
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
  return formatDateShort(date)
}

const getUserInitials = (name: string) => {
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Type guard to check if value is a Supplier (not SupplierResponse)
const isSupplier = (value: any): value is Supplier => {
  return value && typeof value === 'object' && 'id' in value && 'company_name' in value
}

// ============================================
// INFO CARD COMPONENT
// ============================================

const InfoCard = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: any;
  label: string;
  value: string | React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700", className)}>
    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex-shrink-0">
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium dark:text-gray-100 truncate">{value || 'N/A'}</p>
    </div>
  </div>
)

// ============================================
// MAIN COMPONENT
// ============================================

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supplierId = parseInt(params.id as string)

  const {
    useSupplier,
    deleteSupplier,
    blacklistSupplier,
    unblacklistSupplier,
  } = useSuppliers()

  const { data: supplierData, isLoading, refetch } = useSupplier(supplierId)
  const deleteMutation = deleteSupplier
  const blacklistMutation = blacklistSupplier
  const unblacklistMutation = unblacklistSupplier

  // Extract supplier from response - handle both Supplier and SupplierResponse
  let supplier: Supplier | null = null
  if (supplierData) {
    if (isSupplier(supplierData)) {
      supplier = supplierData
    } else if (supplierData && typeof supplierData === 'object' && 'data' in supplierData) {
      const responseData = supplierData as SupplierResponse<Supplier>
      if (responseData.data && isSupplier(responseData.data)) {
        supplier = responseData.data
      }
    }
  }

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false)
  const [showUnblacklistDialog, setShowUnblacklistDialog] = useState(false)
  const [blacklistReason, setBlacklistReason] = useState('')
  const [isMutating, setIsMutating] = useState(false)

  const isBlacklisted = supplier?.status === 'BLACKLISTED'
  const StatusBadge = supplier ? getStatusBadge(supplier.status) : { label: 'Unknown', icon: AlertCircle }
  const StatusIcon = StatusBadge.icon

  const handleDelete = async () => {
    setIsMutating(true)
    try {
      await deleteMutation.mutateAsync(supplierId)
      setShowDeleteDialog(false)
      router.push('/admin/suppliers')
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsMutating(false)
    }
  }

  const handleBlacklist = async () => {
    if (!blacklistReason.trim()) {
      console.error('Please provide a reason for blacklisting.')
      return
    }
    setIsMutating(true)
    try {
      await blacklistMutation.mutateAsync({
        id: supplierId,
        reason: blacklistReason
      })
      setShowBlacklistDialog(false)
      setBlacklistReason('')
      refetch()
    } catch (error) {
      console.error('Blacklist error:', error)
    } finally {
      setIsMutating(false)
    }
  }

  const handleUnblacklist = async () => {
    setIsMutating(true)
    try {
      await unblacklistMutation.mutateAsync(supplierId)
      setShowUnblacklistDialog(false)
      refetch()
    } catch (error) {
      console.error('Unblacklist error:', error)
    } finally {
      setIsMutating(false)
    }
  }

  if (isLoading) {
    return (
      <PageTemplate
        title="Supplier Details"
        description="Loading supplier information..."
        icon={<Building2 className="h-5 w-5" />}
        background="gradient"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </PageTemplate>
    )
  }

  if (!supplier) {
    return (
      <PageTemplate
        title="Supplier Not Found"
        description="The requested supplier could not be found"
        icon={<Building2 className="h-5 w-5" />}
        background="gradient"
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Supplier Not Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The supplier you are looking for does not exist or you don't have permission to view them.
            </p>
            <Button
              className="mt-4 rounded-xl"
              onClick={() => router.push('/admin/suppliers')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Suppliers
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    )
  }

  return (
    <PageTemplate
      title="Supplier Details"
      description={`Viewing ${supplier.company_name}'s profile`}
      icon={<Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Suppliers', href: '/admin/suppliers' },
        { label: supplier.company_name },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {isBlacklisted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUnblacklistDialog(true)}
              className="gap-2 h-9 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              <Check className="h-4 w-4" />
              Remove from Blacklist
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBlacklistDialog(true)}
              className="gap-2 h-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <Ban className="h-4 w-4" />
              Blacklist
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2 h-9 rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                {supplier.company_logo ? (
                  <div className="h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-lg">
                    <Image
                      src={supplier.company_logo}
                      alt={supplier.company_name}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-gray-800">
                    {supplier.company_name?.[0] || 'S'}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2">
                  <Badge className={cn("border font-medium rounded-full", getStatusColor(supplier.status))}>
                    <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                    {supplier.status_label || supplier.status}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold dark:text-gray-100">{supplier.company_name}</h1>
                  <Badge className={cn("font-medium border rounded-full", getCategoryColor(supplier.category))}>
                    {supplier.category_label || getCategoryLabel(supplier.category)}
                  </Badge>
                  {isBlacklisted && supplier.blacklist_reason && (
                    <Badge variant="outline" className="border-red-400 text-red-600 dark:text-red-400 rounded-full">
                      <Ban className="h-3.5 w-3.5 mr-1.5" />
                      Blacklisted
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {supplier.company_email}
                  </span>
                  {supplier.company_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {supplier.company_phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Registered {formatTimeAgo(supplier.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    ID: #{supplier.id}
                  </span>
                </div>
                {supplier.user && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Avatar className="h-6 w-6">
                      {supplier.user.avatar_url ? (
                        <AvatarImage src={supplier.user.avatar_url} alt={supplier.user.full_name} />
                      ) : null}
                      <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        {getUserInitials(supplier.user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">
                      Account: <span className="font-medium text-foreground">{supplier.user.full_name}</span>
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{supplier.user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Registration Number</p>
            <p className="font-semibold text-gray-900 dark:text-white">{supplier.company_registration}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tax ID / PIN</p>
            <p className="font-semibold text-gray-900 dark:text-white">{supplier.tax_id || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Year Established</p>
            <p className="font-semibold text-gray-900 dark:text-white">{supplier.established_year || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Annual Revenue</p>
            <p className="font-semibold text-gray-900 dark:text-white">{supplier.formatted_annual_revenue || 'N/A'}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card className="border-0 shadow-sm rounded-xl relative">
            <CardHeader className="pt-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoCard icon={Building2} label="Company Name" value={supplier.company_name} />
              <InfoCard icon={FileText} label="Registration Number" value={supplier.company_registration} />
              {supplier.tax_id && <InfoCard icon={Hash} label="Tax ID / PIN" value={supplier.tax_id} />}
              {supplier.established_year && <InfoCard icon={Calendar} label="Year Established" value={supplier.established_year} />}
              {supplier.employee_count && <InfoCard icon={Users} label="Employees" value={supplier.employee_count} />}
              {supplier.annual_revenue && <InfoCard icon={DollarSign} label="Annual Revenue" value={supplier.formatted_annual_revenue} />}
              {supplier.description && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm dark:text-gray-100">{supplier.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Location */}
          <Card className="border-0 shadow-sm rounded-xl relative">
            <CardHeader className="pt-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-purple-600" />
                Contact & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoCard icon={Mail} label="Email" value={supplier.company_email} />
              {supplier.company_phone && <InfoCard icon={Phone} label="Phone" value={supplier.company_phone} />}
              {supplier.company_website && (
                <InfoCard
                  icon={Globe}
                  label="Website"
                  value={
                    <a
                      href={supplier.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {supplier.company_website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  }
                />
              )}
              {supplier.company_address && <InfoCard icon={MapPin} label="Address" value={supplier.full_address || supplier.company_address} />}
            </CardContent>
          </Card>

          {/* Contact Person */}
          {(supplier.contact_person_full_name || supplier.contact_person_email || supplier.contact_person_phone) && (
            <Card className="border-0 shadow-sm rounded-xl relative">
              <CardHeader className="pt-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-amber-600" />
                  Contact Person
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.contact_person_full_name && <InfoCard icon={UserIcon} label="Full Name" value={supplier.contact_person_full_name} />}
                {supplier.contact_person_email && <InfoCard icon={Mail} label="Email" value={supplier.contact_person_email} />}
                {supplier.contact_person_phone && <InfoCard icon={Phone} label="Phone" value={supplier.contact_person_phone} />}
              </CardContent>
            </Card>
          )}

          {/* Banking Information */}
          {(supplier.bank_name || supplier.bank_account || supplier.bank_branch) && (
            <Card className="border-0 shadow-sm rounded-xl relative">
              <CardHeader className="pt-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.bank_name && <InfoCard icon={CreditCard} label="Bank Name" value={supplier.bank_name} />}
                {supplier.bank_branch && <InfoCard icon={Building2} label="Branch" value={supplier.bank_branch} />}
                {supplier.bank_account && <InfoCard icon={Hash} label="Account Number" value={supplier.bank_account} />}
                {supplier.payment_terms && <InfoCard icon={FileText} label="Payment Terms" value={supplier.payment_terms} />}
                {supplier.preferred_currency && <InfoCard icon={DollarSign} label="Preferred Currency" value={supplier.preferred_currency} />}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Certifications */}
        {supplier.certifications_array && supplier.certifications_array.length > 0 && (
          <Card className="border-0 shadow-sm rounded-xl relative">
            <CardHeader className="pt-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Certifications & Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {supplier.certifications_array.map((cert: string) => (
                  <Badge key={cert} variant="secondary" className="px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700">
                    <Award className="h-3 w-3 mr-1.5 text-amber-500" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blacklist Info */}
        {isBlacklisted && supplier.blacklist_reason && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 rounded-xl relative">
            <CardHeader className="pt-6">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <Ban className="h-5 w-5" />
                Blacklist Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-100/50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Reason for Blacklisting</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{supplier.blacklist_reason}</p>
                {supplier.blacklisted_at && (
                  <p className="text-xs text-gray-500 mt-2">Blacklisted on {formatDate(supplier.blacklisted_at)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="border-0 shadow-sm rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created: {formatDate(supplier.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Updated: {formatDate(supplier.updated_at)}
                </span>
                {supplier.created_by && (
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    Created by: {supplier.created_by.full_name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1 rounded-xl"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================
          MODALS - Properly Centered
          ============================================ */}

      {/* Delete Modal */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Supplier
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this supplier? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {supplier.company_name?.[0] || 'S'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {supplier.company_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {supplier.company_email}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-2 rounded-xl" disabled={isMutating}>
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blacklist Modal */}
      <Dialog open={showBlacklistDialog} onOpenChange={setShowBlacklistDialog}>
        <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Blacklist Supplier
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for blacklisting this supplier.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {supplier.company_name?.[0] || 'S'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {supplier.company_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {supplier.company_email}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlacklistDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlacklist}
              className="gap-2 rounded-xl"
              disabled={isMutating || !blacklistReason.trim()}
            >
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
              Blacklist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblacklist Modal */}
      <Dialog open={showUnblacklistDialog} onOpenChange={setShowUnblacklistDialog}>
        <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Check className="h-5 w-5" />
              Remove from Blacklist
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this supplier from the blacklist?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {supplier.company_name?.[0] || 'S'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {supplier.company_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {supplier.company_email}
                </p>
                {supplier.blacklist_reason && (
                  <p className="text-xs text-red-600 mt-1">
                    Reason: {supplier.blacklist_reason}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnblacklistDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleUnblacklist}
              className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700"
              disabled={isMutating}
            >
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  )
}
