'use client'

import { PageTemplate } from '@/components/dashboard/PageTemplate'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSuppliers } from '@/hooks/useSuppliers'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CheckCircle,
  CreditCard,
  FileText,
  Github,
  Globe,
  Hash,
  Image as ImageIcon,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Twitter,
  Upload,
  User,
  Users,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Supplier } from '@/services/supplier.service'

interface ProfileFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  id_number: string
  date_of_birth: string
  profile: {
    address: string
    city: string
    state: string
    postal_code: string
    country: string
    bio: string
    gender: string
    social_links?: {
      github?: string
      twitter?: string
      linkedin?: string
      website?: string
    }
  }
}

interface SupplierFormData {
  company_name: string
  company_email: string
  company_phone: string
  company_registration: string
  company_address: string
  company_website: string
  tax_id: string
  category: 'goods' | 'services' | 'both' | ''
  description: string
  established_year: string
  employee_count: string
  annual_revenue: string
  certifications: string
  registration_date: string
  license_number: string
  bank_name: string
  bank_account: string
  bank_branch: string
  payment_terms: string
  preferred_currency: string
  contact_person_name: string
  contact_person_email: string
  contact_person_phone: string
}

interface ExtendedProfile {
  id: number
  avatar?: string
  date_of_birth?: string
  gender?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  bio?: string
  social_links?: {
    github?: string
    twitter?: string
    linkedin?: string
    website?: string
  }
}

interface ExtendedUser {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  role: string | null
  avatar?: string
  avatar_url?: string
  id_number?: string
  date_of_birth?: string
  created_at: string
  last_login_at?: string
  profile?: ExtendedProfile
  roles: string[]
}

// Category options with display names
const CATEGORY_OPTIONS = [
  { value: 'goods', label: 'Goods Supplier' },
  { value: 'services', label: 'Services Provider' },
  { value: 'both', label: 'Both Goods & Services' },
]

export default function ProfilePage() {
  const router = useRouter()

  const {
    user,
    updateProfile,
    uploadAvatar,
    isUpdatingProfile,
    isUploadingAvatar,
    refetchUser,
  } = useAuthContext()

  const {
    useSupplierProfileExists,
    createSupplier,
    updateSupplier,
    useSupplierCategories,
  } = useSuppliers()

  const { data: categoriesData, isLoading: categoriesLoading } = useSupplierCategories()
  const { exists: supplierExists, supplier: supplierData, refetch: refetchSupplier } = useSupplierProfileExists()

  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null)
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null)
  const [isEditingSupplier, setIsEditingSupplier] = useState(false)
  const [supplierId, setSupplierId] = useState<number | null>(null)

  const userExtended = user as ExtendedUser | null
  const isSupplier = userExtended?.roles?.some(r => r.toLowerCase() === 'supplier') || false

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
    date_of_birth: '',
    profile: {
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      bio: '',
      gender: '',
      social_links: {
        github: '',
        twitter: '',
        linkedin: '',
        website: '',
      },
    },
  })

  const [supplierFormData, setSupplierFormData] = useState<SupplierFormData>({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_registration: '',
    company_address: '',
    company_website: '',
    tax_id: '',
    category: '',
    description: '',
    established_year: '',
    employee_count: '',
    annual_revenue: '',
    certifications: '',
    registration_date: '',
    license_number: '',
    bank_name: '',
    bank_account: '',
    bank_branch: '',
    payment_terms: '',
    preferred_currency: 'KES',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [supplierErrors, setSupplierErrors] = useState<Record<string, string>>({})

  // Load user data
  useEffect(() => {
    if (userExtended) {
      const profile = userExtended.profile

      setFormData({
        first_name: userExtended.first_name || '',
        last_name: userExtended.last_name || '',
        email: userExtended.email || '',
        phone: userExtended.phone || '',
        id_number: userExtended.id_number || '',
        date_of_birth: userExtended.date_of_birth || '',
        profile: {
          address: profile?.address || '',
          city: profile?.city || '',
          state: profile?.state || '',
          postal_code: profile?.postal_code || '',
          country: profile?.country || '',
          bio: profile?.bio || '',
          gender: profile?.gender || '',
          social_links: {
            github: profile?.social_links?.github || '',
            twitter: profile?.social_links?.twitter || '',
            linkedin: profile?.social_links?.linkedin || '',
            website: profile?.social_links?.website || '',
          },
        },
      })
    }
  }, [userExtended])

  // Load supplier data
  const getSupplierData = (): Supplier | null => {
    if (!supplierData) return null
    const data = supplierData as any
    if (data && typeof data === 'object' && 'id' in data && 'company_name' in data) {
      return data as Supplier
    }
    return null
  }

  const supplier = getSupplierData()

  useEffect(() => {
    if (supplier) {
      console.log('📦 Loading supplier data:', {
        category: supplier.category,
        allData: supplier
      })

      // Normalize category to lowercase for consistency
      let categoryValue: 'goods' | 'services' | 'both' | '' = ''
      const rawCategory = supplier.category || ''

      if (rawCategory) {
        const normalized = rawCategory.toLowerCase()
        if (normalized === 'goods' || normalized === 'services' || normalized === 'both') {
          categoryValue = normalized as 'goods' | 'services' | 'both'
        }
      }

      setSupplierFormData({
        company_name: supplier.company_name || '',
        company_email: supplier.company_email || '',
        company_phone: supplier.company_phone || '',
        company_registration: supplier.company_registration || '',
        company_address: supplier.company_address || '',
        company_website: supplier.company_website || '',
        tax_id: supplier.tax_id || '',
        category: categoryValue,
        description: supplier.description || '',
        established_year: supplier.established_year || '',
        employee_count: supplier.employee_count || '',
        annual_revenue: supplier.annual_revenue || '',
        certifications: supplier.certifications || '',
        registration_date: supplier.registration_date || '',
        license_number: supplier.license_number || '',
        bank_name: supplier.bank_name || '',
        bank_account: supplier.bank_account || '',
        bank_branch: supplier.bank_branch || '',
        payment_terms: supplier.payment_terms || '',
        preferred_currency: supplier.preferred_currency || 'KES',
        contact_person_name: supplier.contact_person_name || '',
        contact_person_email: supplier.contact_person_email || '',
        contact_person_phone: supplier.contact_person_phone || '',
      })
      setSupplierId(supplier.id)
      setIsEditingSupplier(true)
    }
  }, [supplier])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required'
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required'
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateSupplierForm = () => {
    const errors: Record<string, string> = {}

    if (!supplierFormData.company_name.trim()) {
      errors.company_name = 'Company name is required'
    }
    if (!supplierFormData.company_email.trim()) {
      errors.company_email = 'Company email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierFormData.company_email)) {
      errors.company_email = 'Invalid email format'
    }
    if (!supplierFormData.company_registration.trim()) {
      errors.company_registration = 'Registration number is required'
    }
    if (!supplierFormData.company_address.trim()) {
      errors.company_address = 'Company address is required'
    }
    if (!supplierFormData.category) {
      errors.category = 'Category is required'
    }

    setSupplierErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isProfileValid = validateForm()
    const isSupplierValid = isSupplier ? validateSupplierForm() : true

    if (!isProfileValid || !isSupplierValid) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // 1. Upload avatar if changed
      if (avatarFile) {
        await uploadAvatar(avatarFile)
      }

      // 2. Update user profile
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        profile: {
          address: formData.profile.address,
          city: formData.profile.city,
          state: formData.profile.state,
          postal_code: formData.profile.postal_code,
          country: formData.profile.country,
          bio: formData.profile.bio,
          gender: formData.profile.gender,
          social_links: formData.profile.social_links,
        },
      }

      if (formData.id_number) {
        ; (updateData as any).id_number = formData.id_number
      }

      await updateProfile(updateData)

      // 3. Update supplier profile if user is supplier
      if (isSupplier) {
        const toUndefined = (value: string | null | undefined): string | undefined => {
          return value === null ? undefined : value || undefined
        }

        const supplierPayload: any = {
          company_name: supplierFormData.company_name,
          company_email: supplierFormData.company_email,
          company_phone: toUndefined(supplierFormData.company_phone),
          company_registration: supplierFormData.company_registration,
          company_address: supplierFormData.company_address,
          company_website: toUndefined(supplierFormData.company_website),
          tax_id: toUndefined(supplierFormData.tax_id),
          category: supplierFormData.category as 'goods' | 'services' | 'both',
          description: toUndefined(supplierFormData.description),
          established_year: toUndefined(supplierFormData.established_year),
          employee_count: toUndefined(supplierFormData.employee_count),
          annual_revenue: toUndefined(supplierFormData.annual_revenue),
          certifications: toUndefined(supplierFormData.certifications),
          registration_date: toUndefined(supplierFormData.registration_date),
          license_number: toUndefined(supplierFormData.license_number),
          bank_name: toUndefined(supplierFormData.bank_name),
          bank_account: toUndefined(supplierFormData.bank_account),
          bank_branch: toUndefined(supplierFormData.bank_branch),
          payment_terms: toUndefined(supplierFormData.payment_terms),
          preferred_currency: supplierFormData.preferred_currency || 'KES',
          contact_person_name: toUndefined(supplierFormData.contact_person_name),
          contact_person_email: toUndefined(supplierFormData.contact_person_email),
          contact_person_phone: toUndefined(supplierFormData.contact_person_phone),
        }

        if (companyLogoFile) {
          supplierPayload.company_logo = companyLogoFile
        }

        let supplierResponse
        if (isEditingSupplier && supplierId) {
          supplierResponse = await updateSupplier.mutateAsync({
            id: supplierId,
            data: supplierPayload,
          })
        } else {
          supplierResponse = await createSupplier.mutateAsync(supplierPayload)
        }

        if (!isEditingSupplier && supplierResponse && 'id' in supplierResponse) {
          setSupplierId((supplierResponse as any).id)
          setIsEditingSupplier(true)
        }
      }

      setSuccess(true)
      await refetchUser()
      await refetchSupplier()
      setAvatarFile(null)
      setAvatarPreview(null)
      setCompanyLogoFile(null)
      setCompanyLogoPreview(null)

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      console.error('Profile update error:', err)
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

  const handleProfileChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }))
    if (formErrors[`profile.${field}`]) {
      setFormErrors(prev => ({ ...prev, [`profile.${field}`]: '' }))
    }
  }

  const handleSocialChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        social_links: {
          ...(prev.profile.social_links || {}),
          [platform]: value,
        },
      },
    }))
  }

  const handleSupplierChange = (field: string, value: string) => {
    setSupplierFormData(prev => ({ ...prev, [field]: value }))
    if (supplierErrors[field]) {
      setSupplierErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Avatar image must be less than 5MB.')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Company logo must be less than 5MB.')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.')
        return
      }
      setCompanyLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCompanyLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetchUser()
      await refetchSupplier()
    } catch (error) {
      setError('Failed to refresh profile data.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const getUserInitials = () => {
    const first = formData.first_name?.charAt(0) || ''
    const last = formData.last_name?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
  }

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview
    if (userExtended?.avatar_url) return userExtended.avatar_url
    if (userExtended?.avatar) return userExtended.avatar
    return null
  }

  // Get the category display label
  const getCategoryLabel = (value: string): string => {
    const option = CATEGORY_OPTIONS.find(opt => opt.value === value)
    return option ? option.label : ''
  }

  // Get the category value from the form
  const getCategoryValue = (): string => {
    return supplierFormData.category || ''
  }

  // Handle category select
  const handleCategorySelect = (value: string) => {
    console.log('📌 Category selected:', value)
    handleSupplierChange('category', value)
  }

  const getSupplierLogoUrl = (): string | null => {
    if (companyLogoPreview) return companyLogoPreview
    if (supplier && 'company_logo' in supplier) {
      return supplier.company_logo || null
    }
    return null
  }

  const categories = categoriesData?.data || []

  // Determine if we should show the loading state
  const isLoadingData = categoriesLoading || !supplierData

  return (
    <PageTemplate
      title="Profile Settings"
      description="Manage your personal information and preferences"
      icon={<User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      actions={
        <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Quick Info */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <Avatar className="h-32 w-32 ring-4 ring-blue-100 dark:ring-blue-900/30">
                    {getAvatarUrl() ? (
                      <AvatarImage
                        src={getAvatarUrl()!}
                        alt={formData.first_name}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-4xl font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {formData.first_name} {formData.last_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formData.email}</p>
                {userExtended?.role && (
                  <Badge variant="secondary" className="mt-2 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {userExtended.role}
                  </Badge>
                )}
                {isUploadingAvatar && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
                {avatarFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-green-600">New avatar selected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-red-500 hover:text-red-600"
                      onClick={() => {
                        setAvatarFile(null)
                        setAvatarPreview(null)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Member Since</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {userExtended?.created_at ? new Date(userExtended.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {userExtended?.last_login_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Last Login</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(userExtended.last_login_at).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Edit Profile
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
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
                    Profile updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="social">Social Links</TabsTrigger>
                  </TabsList>

                  {/* Personal Tab */}
                  <TabsContent value="personal" className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                          id="first_name"
                          placeholder="Enter first name"
                          value={formData.first_name}
                          onChange={(e) => handleChange('first_name', e.target.value)}
                          disabled={isLoading}
                          className={formErrors.first_name ? 'border-red-500' : ''}
                        />
                        {formErrors.first_name && (
                          <p className="text-sm text-red-500">{formErrors.first_name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input
                          id="last_name"
                          placeholder="Enter last name"
                          value={formData.last_name}
                          onChange={(e) => handleChange('last_name', e.target.value)}
                          disabled={isLoading}
                          className={formErrors.last_name ? 'border-red-500' : ''}
                        />
                        {formErrors.last_name && (
                          <p className="text-sm text-red-500">{formErrors.last_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        disabled
                        className="bg-gray-50 dark:bg-gray-700/50"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+254 700 000 000"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          disabled={isLoading}
                          className={formErrors.phone ? 'border-red-500' : ''}
                        />
                        {formErrors.phone && (
                          <p className="text-sm text-red-500">{formErrors.phone}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="id_number">ID Number</Label>
                        <Input
                          id="id_number"
                          placeholder="Enter ID number"
                          value={formData.id_number}
                          onChange={(e) => handleChange('id_number', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleChange('date_of_birth', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us a bit about yourself..."
                        value={formData.profile.bio}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        disabled={isLoading}
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                  </TabsContent>

                  {/* Contact Tab */}
                  <TabsContent value="contact" className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Enter street address"
                        value={formData.profile.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Enter city"
                          value={formData.profile.city}
                          onChange={(e) => handleProfileChange('city', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          placeholder="Enter state or province"
                          value={formData.profile.state}
                          onChange={(e) => handleProfileChange('state', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                          id="postal_code"
                          placeholder="Enter postal code"
                          value={formData.profile.postal_code}
                          onChange={(e) => handleProfileChange('postal_code', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          placeholder="Enter country"
                          value={formData.profile.country}
                          onChange={(e) => handleProfileChange('country', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Social Links Tab */}
                  <TabsContent value="social" className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        placeholder="https://example.com"
                        value={formData.profile.social_links?.website || ''}
                        onChange={(e) => handleSocialChange('website', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github" className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        GitHub
                      </Label>
                      <Input
                        id="github"
                        placeholder="https://github.com/username"
                        value={formData.profile.social_links?.github || ''}
                        onChange={(e) => handleSocialChange('github', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="flex items-center gap-2">
                        <Twitter className="h-4 w-4" />
                        Twitter/X
                      </Label>
                      <Input
                        id="twitter"
                        placeholder="https://twitter.com/username"
                        value={formData.profile.social_links?.twitter || ''}
                        onChange={(e) => handleSocialChange('twitter', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        placeholder="https://linkedin.com/in/username"
                        value={formData.profile.social_links?.linkedin || ''}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Supplier Section */}
                {isSupplier && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-orange-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Supplier Information
                        </h3>
                        <Badge variant="outline" className="ml-2">
                          {isEditingSupplier ? 'Update' : 'Complete'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isEditingSupplier
                          ? 'Update your company information and supplier details.'
                          : 'Complete your supplier profile to start receiving procurement opportunities.'}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Company Logo */}
                        <div className="md:col-span-2">
                          <Label>Company Logo</Label>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="relative">
                              <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                                {getSupplierLogoUrl() ? (
                                  <img
                                    src={getSupplierLogoUrl()!}
                                    alt="Company Logo"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                              <label
                                htmlFor="company-logo-upload"
                                className="absolute -bottom-2 -right-2 p-1 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                <input
                                  id="company-logo-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleCompanyLogoChange}
                                  disabled={isLoading}
                                />
                              </label>
                            </div>
                            <div className="text-sm text-gray-500">
                              <p>Upload company logo</p>
                              <p className="text-xs">PNG, JPG, SVG up to 5MB</p>
                            </div>
                          </div>
                        </div>

                        {/* Company Name */}
                        <div className="space-y-2">
                          <Label htmlFor="company_name" className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            Company Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="company_name"
                            placeholder="Enter company name"
                            value={supplierFormData.company_name}
                            onChange={(e) => handleSupplierChange('company_name', e.target.value)}
                            disabled={isLoading}
                            className={supplierErrors.company_name ? 'border-red-500' : ''}
                          />
                          {supplierErrors.company_name && (
                            <p className="text-sm text-red-500">{supplierErrors.company_name}</p>
                          )}
                        </div>

                        {/* Company Email */}
                        <div className="space-y-2">
                          <Label htmlFor="company_email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            Company Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="company_email"
                            type="email"
                            placeholder="company@example.com"
                            value={supplierFormData.company_email}
                            onChange={(e) => handleSupplierChange('company_email', e.target.value)}
                            disabled={isLoading}
                            className={supplierErrors.company_email ? 'border-red-500' : ''}
                          />
                          {supplierErrors.company_email && (
                            <p className="text-sm text-red-500">{supplierErrors.company_email}</p>
                          )}
                        </div>

                        {/* Company Phone */}
                        <div className="space-y-2">
                          <Label htmlFor="company_phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            Company Phone
                          </Label>
                          <Input
                            id="company_phone"
                            placeholder="+254 700 000 000"
                            value={supplierFormData.company_phone}
                            onChange={(e) => handleSupplierChange('company_phone', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Registration Number */}
                        <div className="space-y-2">
                          <Label htmlFor="company_registration" className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-400" />
                            Registration Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="company_registration"
                            placeholder="Enter registration number"
                            value={supplierFormData.company_registration}
                            onChange={(e) => handleSupplierChange('company_registration', e.target.value)}
                            disabled={isLoading}
                            className={supplierErrors.company_registration ? 'border-red-500' : ''}
                          />
                          {supplierErrors.company_registration && (
                            <p className="text-sm text-red-500">{supplierErrors.company_registration}</p>
                          )}
                        </div>

                        {/* Tax ID */}
                        <div className="space-y-2">
                          <Label htmlFor="tax_id" className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            Tax ID / PIN
                          </Label>
                          <Input
                            id="tax_id"
                            placeholder="Enter tax ID or PIN"
                            value={supplierFormData.tax_id}
                            onChange={(e) => handleSupplierChange('tax_id', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* License Number */}
                        <div className="space-y-2">
                          <Label htmlFor="license_number" className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-gray-400" />
                            License Number
                          </Label>
                          <Input
                            id="license_number"
                            placeholder="Enter license number"
                            value={supplierFormData.license_number}
                            onChange={(e) => handleSupplierChange('license_number', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Registration Date */}
                        <div className="space-y-2">
                          <Label htmlFor="registration_date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            Registration Date
                          </Label>
                          <Input
                            id="registration_date"
                            type="date"
                            value={supplierFormData.registration_date}
                            onChange={(e) => handleSupplierChange('registration_date', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Established Year */}
                        <div className="space-y-2">
                          <Label htmlFor="established_year" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            Year Established
                          </Label>
                          <Input
                            id="established_year"
                            placeholder="e.g., 2010"
                            value={supplierFormData.established_year}
                            onChange={(e) => handleSupplierChange('established_year', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Employee Count */}
                        <div className="space-y-2">
                          <Label htmlFor="employee_count" className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            Number of Employees
                          </Label>
                          <Input
                            id="employee_count"
                            placeholder="e.g., 50"
                            value={supplierFormData.employee_count}
                            onChange={(e) => handleSupplierChange('employee_count', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Annual Revenue */}
                        <div className="space-y-2">
                          <Label htmlFor="annual_revenue" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            Annual Revenue
                          </Label>
                          <Input
                            id="annual_revenue"
                            placeholder="e.g., 5,000,000"
                            value={supplierFormData.annual_revenue}
                            onChange={(e) => handleSupplierChange('annual_revenue', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Category - Using Radio Buttons instead of Dropdown */}
                        <div className="space-y-2 md:col-span-2">
                          <Label className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            Business Category <span className="text-red-500">*</span>
                          </Label>

                          {/* Display current category value for debugging */}
                          <div className="text-xs text-gray-400 mb-1">
                            Current value: <span className="font-mono">{getCategoryValue() || 'EMPTY'}</span>
                            {supplierFormData.category && (
                              <span className="ml-2 text-green-600">
                                → {getCategoryLabel(supplierFormData.category)}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {CATEGORY_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleCategorySelect(option.value)}
                                className={cn(
                                  "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200",
                                  getCategoryValue() === option.value
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                  supplierErrors.category && "border-red-500"
                                )}
                                disabled={isLoading}
                              >
                                <span className="text-sm font-medium">{option.label}</span>
                                {getCategoryValue() === option.value && (
                                  <CheckCircle className="h-4 w-4 text-blue-500" />
                                )}
                              </button>
                            ))}
                          </div>
                          {supplierErrors.category && (
                            <p className="text-sm text-red-500">{supplierErrors.category}</p>
                          )}
                          <p className="text-xs text-gray-400">Select the category that best describes your business.</p>
                        </div>

                        {/* Company Address */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="company_address" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            Company Address <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="company_address"
                            placeholder="Enter company address"
                            value={supplierFormData.company_address}
                            onChange={(e) => handleSupplierChange('company_address', e.target.value)}
                            disabled={isLoading}
                            className={supplierErrors.company_address ? 'border-red-500' : ''}
                            rows={2}
                          />
                          {supplierErrors.company_address && (
                            <p className="text-sm text-red-500">{supplierErrors.company_address}</p>
                          )}
                        </div>

                        {/* Company Website */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="company_website" className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            Company Website
                          </Label>
                          <Input
                            id="company_website"
                            placeholder="https://example.com"
                            value={supplierFormData.company_website}
                            onChange={(e) => handleSupplierChange('company_website', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Certifications */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="certifications" className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-gray-400" />
                            Certifications
                          </Label>
                          <Input
                            id="certifications"
                            placeholder="e.g., ISO 9001, ISO 14001"
                            value={supplierFormData.certifications}
                            onChange={(e) => handleSupplierChange('certifications', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Company Description */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description" className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            Company Description
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Describe your company, products, and services..."
                            value={supplierFormData.description}
                            onChange={(e) => handleSupplierChange('description', e.target.value)}
                            disabled={isLoading}
                            className="min-h-[100px] resize-none"
                          />
                        </div>

                        <Separator className="md:col-span-2 my-2" />

                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Contact Person
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="contact_person_name">Full Name</Label>
                              <Input
                                id="contact_person_name"
                                placeholder="Contact person name"
                                value={supplierFormData.contact_person_name}
                                onChange={(e) => handleSupplierChange('contact_person_name', e.target.value)}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contact_person_email">Email</Label>
                              <Input
                                id="contact_person_email"
                                type="email"
                                placeholder="contact@example.com"
                                value={supplierFormData.contact_person_email}
                                onChange={(e) => handleSupplierChange('contact_person_email', e.target.value)}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contact_person_phone">Phone</Label>
                              <Input
                                id="contact_person_phone"
                                placeholder="+254 700 000 000"
                                value={supplierFormData.contact_person_phone}
                                onChange={(e) => handleSupplierChange('contact_person_phone', e.target.value)}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="md:col-span-2 my-2" />

                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Banking Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="bank_name">Bank Name</Label>
                              <Input
                                id="bank_name"
                                placeholder="Bank name"
                                value={supplierFormData.bank_name}
                                onChange={(e) => handleSupplierChange('bank_name', e.target.value)}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bank_branch">Bank Branch</Label>
                              <Input
                                id="bank_branch"
                                placeholder="Branch name"
                                value={supplierFormData.bank_branch}
                                onChange={(e) => handleSupplierChange('bank_branch', e.target.value)}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bank_account">Account Number</Label>
                              <Input
                                id="bank_account"
                                placeholder="Bank account number"
                                value={supplierFormData.bank_account}
                                onChange={(e) => handleSupplierChange('bank_account', e.target.value)}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="payment_terms">Payment Terms</Label>
                              <Input
                                id="payment_terms"
                                placeholder="e.g., Net 30"
                                value={supplierFormData.payment_terms}
                                onChange={(e) => handleSupplierChange('payment_terms', e.target.value)}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="preferred_currency">Preferred Currency</Label>
                              <select
                                value={supplierFormData.preferred_currency}
                                onChange={(e) => handleSupplierChange('preferred_currency', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                              >
                                <option value="KES">KES - Kenyan Shilling</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="UGX">UGX - Ugandan Shilling</option>
                                <option value="TZS">TZS - Tanzanian Shilling</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    className="gap-2 px-8 min-w-[140px]"
                    disabled={isLoading || isUploadingAvatar}
                  >
                    {isLoading || isUploadingAvatar ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isUploadingAvatar ? 'Uploading...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
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
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-4 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="text-red-500">*</span> Required fields. Your information is secure and will not be shared.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageTemplate>
  )
}
