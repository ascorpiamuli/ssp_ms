'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Hash,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Save,
  X,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSuppliers } from '@/hooks/useSuppliers'
import { Supplier } from '@/services/supplier.service'
import { PageTemplate } from '@/components/dashboard/PageTemplate'
import { cn } from '@/lib/utils'

// ============================================
// SUPPLIER PROFILE COMPLETION STATUS
// ============================================

const SupplierProfileStatus = ({
  percentage,
  isComplete
}: {
  percentage: number
  isComplete: boolean
}) => {
  return (
    <div className="flex items-center gap-3">
      <Badge
        variant={isComplete ? 'success' : 'warning'}
        className="flex items-center gap-1.5 px-3 py-1"
      >
        {isComplete ? (
          <CheckCircle className="h-3.5 w-3.5" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5" />
        )}
        {isComplete ? 'Complete' : `${percentage}% Complete`}
      </Badge>
      <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            isComplete ? "bg-emerald-500" : "bg-blue-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// USER PROFILE CARD
// ============================================

const UserProfileCard = ({ user }: { user: any }) => {
  if (!user) return null

  const initials = user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-4 ring-blue-100 dark:ring-blue-900/30">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.full_name || 'User'}
              </h3>
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <Shield className="h-3 w-3" />
                {user.role?.toUpperCase() || 'USER'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                <Phone className="h-3.5 w-3.5" />
                {user.phone}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProfileSetupPage() {
  const router = useRouter()
  const {
    user,
    refetchUser,
    isSupplier
  } = useAuthContext()
  const {
    useSupplierCategories,
    createSupplier,
    updateSupplier,
    useSupplierProfileExists
  } = useSuppliers()

  const { data: categoriesData, isLoading: categoriesLoading } = useSupplierCategories()
  const {
    exists: supplierExists,
    supplier: supplierData,
    isLoading: isCheckingSupplier,
    refetch: refetchSupplier
  } = useSupplierProfileExists()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_registration: '',
    company_address: '',
    company_website: '',
    tax_id: '',
    category: '' as 'goods' | 'services' | 'both' | '',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Helper to get supplier as Supplier type
  const getSupplier = (): Supplier | null => {
    if (!supplierData) return null
    // The supplier data is the supplier object directly
    return supplierData as unknown as Supplier
  }

  const existingSupplier = getSupplier()

  // Load existing supplier data when found
  useEffect(() => {
    if (existingSupplier) {
      setFormData({
        company_name: existingSupplier.company_name || '',
        company_email: existingSupplier.company_email || '',
        company_phone: existingSupplier.company_phone || '',
        company_registration: existingSupplier.company_registration || '',
        company_address: existingSupplier.company_address || '',
        company_website: existingSupplier.company_website || '',
        tax_id: existingSupplier.tax_id || '',
        category: existingSupplier.category || '',
      })
      setIsEditing(true)
    } else {
      setIsEditing(false)
    }
  }, [existingSupplier])

  // Redirect if supplier profile exists and we're on profile setup
  useEffect(() => {
    if (!isCheckingSupplier && supplierExists) {
      router.push('/dashboard')
    }
  }, [supplierExists, isCheckingSupplier, router])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.company_name.trim()) {
      errors.company_name = 'Company name is required'
    }
    if (!formData.company_email.trim()) {
      errors.company_email = 'Company email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
      errors.company_email = 'Invalid email format'
    }
    if (!formData.company_registration.trim()) {
      errors.company_registration = 'Company registration number is required'
    }
    if (!formData.company_address.trim()) {
      errors.company_address = 'Company address is required'
    }
    if (!formData.category) {
      errors.category = 'Category is required'
    }
    if (formData.company_website && !/^https?:\/\/.+/.test(formData.company_website)) {
      errors.company_website = 'Website must start with http:// or https://'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supplierData = {
        ...formData,
        user_id: user?.id,
        category: formData.category as 'goods' | 'services' | 'both',
        status: 'ACTIVE' as const,
      }

      let response
      if (isEditing && existingSupplier) {
        response = await updateSupplier.mutateAsync({
          id: existingSupplier.id,
          data: supplierData,
        })
      } else {
        response = await createSupplier.mutateAsync(supplierData)
      }

      if (response.success) {
        setSuccess(true)
        await refetchUser()
        await refetchSupplier()
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save supplier profile'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetchUser()
      await refetchSupplier()
    } catch (error) {
      // Silent error handling
    } finally {
      setIsRefreshing(false)
    }
  }

  const categories = categoriesData?.data || []

  // Calculate supplier profile completion percentage
  const calculateCompletionPercentage = () => {
    if (!existingSupplier) return 0

    const fields: (keyof Supplier)[] = [
      'company_name',
      'company_email',
      'company_registration',
      'company_address',
      'category'
    ]

    const filled = fields.filter(field => {
      const value = existingSupplier[field]
      return value && value.toString().trim().length > 0
    })

    return Math.round((filled.length / fields.length) * 100)
  }

  const completionPercentage = calculateCompletionPercentage()
  const isSupplierProfileComplete = completionPercentage === 100

  // Show loading state
  if (categoriesLoading || isCheckingSupplier) {
    return (
      <PageTemplate
        title="Supplier Profile Setup"
        description="Setting up your supplier profile"
        icon={<Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <span className="text-sm text-gray-500">Loading your profile...</span>
          </div>
        </div>
      </PageTemplate>
    )
  }

  // Check if user is a supplier
  if (!isSupplier()) {
    return (
      <PageTemplate
        title="Supplier Profile Setup"
        description="Supplier profile setup"
        icon={<Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      >
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <AlertCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Access Restricted
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              This page is only accessible to suppliers. Please contact an administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </PageTemplate>
    )
  }

  return (
    <PageTemplate
      title="Supplier Profile Setup"
      description={isEditing ? 'Update your company information' : 'Complete your supplier profile to start receiving procurement opportunities'}
      icon={<Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      actions={
        <div className="flex items-center gap-3">
          <SupplierProfileStatus
            percentage={completionPercentage}
            isComplete={isSupplierProfileComplete}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 h-9"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* User Profile Card */}
      <UserProfileCard user={user} />

      {/* Form Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            {isEditing ? 'Update Your Supplier Profile' : 'Complete Your Supplier Profile'}
          </CardTitle>
          <CardDescription className="text-sm">
            {isEditing
              ? 'Update your company information to continue as a supplier'
              : 'Fill in your company details to complete your supplier profile'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
                {isEditing ? 'Supplier profile updated successfully!' : 'Supplier profile created successfully!'}
                {' '}Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name" className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  placeholder="Enter your company name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  disabled={isLoading || success}
                  className={cn(
                    "h-10",
                    formErrors.company_name && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {formErrors.company_name && (
                  <p className="text-sm text-red-500">{formErrors.company_name}</p>
                )}
              </div>

              {/* Company Email */}
              <div className="space-y-2">
                <Label htmlFor="company_email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-gray-400" />
                  Company Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_email"
                  type="email"
                  placeholder="company@example.com"
                  value={formData.company_email}
                  onChange={(e) => handleChange('company_email', e.target.value)}
                  disabled={isLoading || success}
                  className={cn(
                    "h-10",
                    formErrors.company_email && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {formErrors.company_email && (
                  <p className="text-sm text-red-500">{formErrors.company_email}</p>
                )}
              </div>

              {/* Company Phone */}
              <div className="space-y-2">
                <Label htmlFor="company_phone" className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-gray-400" />
                  Company Phone
                </Label>
                <Input
                  id="company_phone"
                  placeholder="+1234567890"
                  value={formData.company_phone}
                  onChange={(e) => handleChange('company_phone', e.target.value)}
                  disabled={isLoading || success}
                  className="h-10"
                />
              </div>

              {/* Company Registration */}
              <div className="space-y-2">
                <Label htmlFor="company_registration" className="flex items-center gap-2 text-sm font-medium">
                  <Hash className="h-4 w-4 text-gray-400" />
                  Registration Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_registration"
                  placeholder="Enter registration number"
                  value={formData.company_registration}
                  onChange={(e) => handleChange('company_registration', e.target.value)}
                  disabled={isLoading || success}
                  className={cn(
                    "h-10",
                    formErrors.company_registration && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {formErrors.company_registration && (
                  <p className="text-sm text-red-500">{formErrors.company_registration}</p>
                )}
              </div>

              {/* Company Website */}
              <div className="space-y-2">
                <Label htmlFor="company_website" className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4 text-gray-400" />
                  Company Website
                </Label>
                <Input
                  id="company_website"
                  placeholder="https://www.example.com"
                  value={formData.company_website}
                  onChange={(e) => handleChange('company_website', e.target.value)}
                  disabled={isLoading || success}
                  className={cn(
                    "h-10",
                    formErrors.company_website && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {formErrors.company_website && (
                  <p className="text-sm text-red-500">{formErrors.company_website}</p>
                )}
              </div>

              {/* Tax ID */}
              <div className="space-y-2">
                <Label htmlFor="tax_id" className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Tax ID
                </Label>
                <Input
                  id="tax_id"
                  placeholder="Enter tax ID"
                  value={formData.tax_id}
                  onChange={(e) => handleChange('tax_id', e.target.value)}
                  disabled={isLoading || success}
                  className="h-10"
                />
              </div>

              {/* Category - Full width */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  Business Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  disabled={isLoading || success}
                >
                  <SelectTrigger className={cn(
                    "h-10",
                    formErrors.category && "border-red-500 focus-visible:ring-red-500"
                  )}>
                    <SelectValue placeholder="Select your business category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="goods">Goods</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              {/* Company Address - Full width */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_address" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Company Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="company_address"
                  placeholder="Enter your company address"
                  value={formData.company_address}
                  onChange={(e) => handleChange('company_address', e.target.value)}
                  disabled={isLoading || success}
                  className={cn(
                    "min-h-[80px] resize-none",
                    formErrors.company_address && "border-red-500 focus-visible:ring-red-500"
                  )}
                  rows={3}
                />
                {formErrors.company_address && (
                  <p className="text-sm text-red-500">{formErrors.company_address}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Submit Buttons */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                className="gap-2 px-8 min-w-[140px]"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Update Profile' : 'Create Profile'}
                  </>
                )}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-4 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="text-red-500">*</span> Required fields. Your information will be reviewed by administrators.
          </p>
        </CardFooter>
      </Card>
    </PageTemplate>
  )
}
