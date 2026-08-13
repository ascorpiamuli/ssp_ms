// frontend/src/app/(dashboard)/profile/page.tsx

'use client';

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
import { useCompanyProfile } from '@/hooks/useCompanyProfile'
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
  X,
  Sparkles,
  ChevronRight,
  Check,
  UserCog,
  MailCheck,
  PhoneCall,
  CalendarDays,
  MapPinned,
  Link,
  Store,
  Banknote,
  BriefcaseBusiness,
  Clock,
  Package,
  Building,
  Palette,
  Type,
  Facebook,
  Instagram,
  Youtube,
  DollarSign,
  PenTool,
  Settings,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { Supplier } from '@/services/supplier.service'
import { motion } from 'framer-motion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ============================================
// TYPES
// ============================================

// ============================================
// CONSTANTS - Role Labels
// ============================================

// Role label mapping based on roles table
const ROLE_LABELS: Record<string, string> = {
  'ADMIN': 'Administrator',
  'HOD': 'Head of Department',
  'ACCOUNTANT': 'Accountant/Finance',
  'HEAD OF INSTITUTION': 'Principal/Head of Institution',
  'FINAL_APPROVER': 'Director/Finance Administrator',
  'PROCUREMENT': 'Procurement Officer',
  'SUPPLIER': 'Supplier/Vendor',
  'AUDITOR': 'Auditorial Staff Officer',
  'SUPER_ADMIN': 'Super Administrator',
};

// Role descriptions from the roles table
const ROLE_DESCRIPTIONS: Record<string, string> = {
  'ADMIN': 'The Chief Administrator of the System',
  'HOD': 'Approves departmental requisitions',
  'ACCOUNTANT': 'Verifies budget & financial compliance',
  'HEAD OF INSTITUTION': 'Final institutional approval authority',
  'FINAL_APPROVER': 'Authorizes financial commitments',
  'PROCUREMENT': 'Manages procurement & supplier processes',
  'SUPPLIER': 'Provides goods or services',
  'AUDITOR': 'Ensures compliance & transparency',
  'SUPER_ADMIN': 'Super Administrator with full system access',
};

// Get role label helper
const getRoleLabel = (roleName: string): string => {
  if (!roleName) return 'Unknown Role';
  const upperRole = roleName.toUpperCase();
  return ROLE_LABELS[upperRole] || roleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Get role description helper
const getRoleDescription = (roleName: string): string => {
  if (!roleName) return '';
  const upperRole = roleName.toUpperCase();
  return ROLE_DESCRIPTIONS[upperRole] || '';
};

// Get role badge color
const getRoleBadgeColor = (roleName: string): string => {
  if (!roleName) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  const upperRole = roleName.toUpperCase();
  const colors: Record<string, string> = {
    'ADMIN': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'HOD': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    'ACCOUNTANT': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    'HEAD OF INSTITUTION': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'FINAL_APPROVER': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'PROCUREMENT': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    'SUPPLIER': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'AUDITOR': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    'SUPER_ADMIN': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return colors[upperRole] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};

// ============================================
// INTERFACES
// ============================================

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

interface CompanyProfileFormData {
  company_name: string
  company_email: string
  company_phone: string
  company_address: string
  company_website: string
  registration_number: string
  tax_id: string
  license_number: string
  industry: string
  company_size: string
  employee_count: number | string
  annual_revenue: string
  established_year: string
  description: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  contact_person_name: string
  contact_person_email: string
  contact_person_phone: string
  facebook_url: string
  twitter_url: string
  linkedin_url: string
  instagram_url: string
  youtube_url: string
  timezone: string
  currency: string
  date_format: string
  time_format: string
  is_active: boolean
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

// ============================================
// CONSTANTS
// ============================================

const CATEGORY_OPTIONS = [
  { value: 'goods', label: 'Goods Supplier', icon: Package, color: 'text-blue-600 dark:text-blue-400' },
  { value: 'services', label: 'Services Provider', icon: BriefcaseBusiness, color: 'text-purple-600 dark:text-purple-400' },
  { value: 'both', label: 'Both Goods & Services', icon: Store, color: 'text-orange-600 dark:text-orange-400' },
]

const INDUSTRY_OPTIONS = [
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'services', label: 'Services' },
  { value: 'government', label: 'Government' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'construction', label: 'Construction' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
]

const COMPANY_SIZE_OPTIONS = [
  { value: 'small', label: 'Small (1-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
]

const CURRENCY_OPTIONS = [
  { value: 'KES', label: 'KES - Kenyan Shilling' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'UGX', label: 'UGX - Ugandan Shilling' },
  { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
]

const TIMEZONE_OPTIONS = [
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (UTC+3)' },
  { value: 'Africa/Dar_es_Salaam', label: 'Africa/Dar_es_Salaam (UTC+3)' },
  { value: 'Africa/Kampala', label: 'Africa/Kampala (UTC+3)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+1)' },
]

const FONT_OPTIONS = [
  { value: 'space-grotesk', label: 'Space Grotesk', className: 'font-space-grotesk' },
  { value: 'inter', label: 'Inter', className: 'font-inter' },
  { value: 'dm-sans', label: 'DM Sans', className: 'font-dm-sans' },
  { value: 'plus-jakarta', label: 'Plus Jakarta Sans', className: 'font-plus-jakarta' },
  { value: 'nunito-sans', label: 'Nunito Sans', className: 'font-nunito-sans' },
  { value: 'poppins', label: 'Poppins', className: 'font-poppins' },
  { value: 'manrope', label: 'Manrope', className: 'font-manrope' },
  { value: 'outfit', label: 'Outfit', className: 'font-outfit' },
  { value: 'urbanist', label: 'Urbanist', className: 'font-urbanist' },
  { value: 'Inter', label: 'Inter', className: 'font-inter' },
  { value: 'Roboto', label: 'Roboto', className: 'font-inter' },
  { value: 'Open Sans', label: 'Open Sans', className: 'font-inter' },
  { value: 'Lato', label: 'Lato', className: 'font-inter' },
  { value: 'Montserrat', label: 'Montserrat', className: 'font-inter' },
  { value: 'Poppins', label: 'Poppins', className: 'font-poppins' },
  { value: 'Nunito', label: 'Nunito', className: 'font-nunito-sans' },
  { value: 'Raleway', label: 'Raleway', className: 'font-inter' },
  { value: 'Playfair Display', label: 'Playfair Display', className: 'font-inter' },
  { value: 'Merriweather', label: 'Merriweather', className: 'font-inter' },
  { value: 'Fira Sans', label: 'Fira Sans', className: 'font-inter' },
  { value: 'Oswald', label: 'Oswald', className: 'font-inter' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', className: 'font-inter' },
  { value: 'Quicksand', label: 'Quicksand', className: 'font-inter' },
  { value: 'Work Sans', label: 'Work Sans', className: 'font-inter' },
]

// ============================================
// HELPERS
// ============================================

const safeValue = (value: any): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const safeBoolean = (value: any): boolean => {
  if (value === null || value === undefined) return true
  return Boolean(value)
}

interface CompanyProfileResponse {
  id: number
  company_name: string
  company_email: string
  company_phone: string | null
  company_address: string | null
  company_website: string | null
  registration_number: string | null
  tax_id: string | null
  license_number: string | null
  industry: string | null
  industry_label: string
  company_size: string | null
  company_size_label: string
  employee_count: number | null
  annual_revenue: string | null
  established_year: string | null
  description: string | null
  company_logo: string | null
  logo_url: string | null
  favicon: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  contact_person_name: string | null
  contact_person_email: string | null
  contact_person_phone: string | null
  social_links: {
    facebook: string | null
    twitter: string | null
    linkedin: string | null
    instagram: string | null
    youtube: string | null
  }
  timezone: string
  currency: string
  date_format: string
  time_format: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const castProfileData = (data: any): CompanyProfileResponse | undefined => {
  if (!data) return undefined
  return data as CompanyProfileResponse
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProfilePage() {
  const router = useRouter()

  // ============================================
  // AUTH CONTEXT
  // ============================================

  const {
    user,
    updateProfile,
    uploadAvatar,
    isUpdatingProfile,
    isUploadingAvatar,
    refetchUser,
  } = useAuthContext()

  // ============================================
  // SUPPLIER HOOKS
  // ============================================

  const {
    useSupplierProfileExists,
    createSupplier,
    updateSupplier,
    useSupplierCategories,
  } = useSuppliers()

  // ============================================
  // COMPANY PROFILE HOOKS
  // ============================================

  const {
    useGetProfile,
    useGetCompletionStatus,
    saveProfile,
    updateProfile: updateCompanyProfile,
    deleteLogo,
    uploadLogo,
    updateBranding,
    updateSocialLinks,
    updateSettings,
  } = useCompanyProfile()

  // ============================================
  // STATE
  // ============================================

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
  const [activeTab, setActiveTab] = useState<string>('personal')

  // ============================================
  // QUERIES
  // ============================================

  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetProfile()
  const { data: completionData, isLoading: completionLoading } = useGetCompletionStatus()
  const { data: categoriesData, isLoading: categoriesLoading } = useSupplierCategories()
  const { exists: supplierExists, supplier: supplierData, refetch: refetchSupplier } = useSupplierProfileExists()

  // ============================================
  // USER DATA
  // ============================================

  const userExtended = user as ExtendedUser | null

  // Check if user has specific roles using the role names from the database
  const userRoles = useMemo(() => {
    const roles: string[] = [];
    if (userExtended?.role) roles.push(userExtended.role.toUpperCase());
    if (userExtended?.roles) {
      userExtended.roles.forEach((r: any) => {
        const roleName = typeof r === 'string' ? r.toUpperCase() : r.name?.toUpperCase();
        if (roleName) roles.push(roleName);
      });
    }
    return roles;
  }, [userExtended]);

  const isAdmin = userRoles.some(r => r === 'ADMIN' || r === 'SUPER_ADMIN');
  const isSupplier = userRoles.some(r => r === 'SUPPLIER');

  // Get the primary role for display
  const primaryRole = userExtended?.role?.toUpperCase() || '';
  const roleLabel = getRoleLabel(primaryRole);
  const roleDescription = getRoleDescription(primaryRole);
  const roleBadgeColor = getRoleBadgeColor(primaryRole);

  // ============================================
  // COMPANY PROFILE DATA - Cast to correct type
  // ============================================

  const companyProfile = castProfileData(profileData)
  const companyCompletion = completionData?.data

  // ============================================
  // FORM DATA - Personal Profile
  // ============================================

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

  // ============================================
  // FORM DATA - Supplier
  // ============================================

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

  // ============================================
  // FORM DATA - Company Profile (Admin)
  // ============================================

  const [companyFormData, setCompanyFormData] = useState<CompanyProfileFormData>({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    company_website: '',
    registration_number: '',
    tax_id: '',
    license_number: '',
    industry: '',
    company_size: '',
    employee_count: '',
    annual_revenue: '',
    established_year: '',
    description: '',
    primary_color: '#1a237e',
    secondary_color: '#3498db',
    accent_color: '#ffc107',
    font_family: 'Inter',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    instagram_url: '',
    youtube_url: '',
    timezone: 'Africa/Nairobi',
    currency: 'KES',
    date_format: 'd M Y',
    time_format: 'H:i',
    is_active: true,
  })

  // ============================================
  // ERRORS
  // ============================================

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [supplierErrors, setSupplierErrors] = useState<Record<string, string>>({})
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({})

  // ============================================
  // EFFECTS - Load User Data
  // ============================================

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

  // ============================================
  // EFFECTS - Load Company Profile Data
  // ============================================

  useEffect(() => {
    if (companyProfile) {
      setCompanyFormData({
        company_name: safeValue(companyProfile.company_name),
        company_email: safeValue(companyProfile.company_email),
        company_phone: safeValue(companyProfile.company_phone),
        company_address: safeValue(companyProfile.company_address),
        company_website: safeValue(companyProfile.company_website),
        registration_number: safeValue(companyProfile.registration_number),
        tax_id: safeValue(companyProfile.tax_id),
        license_number: safeValue(companyProfile.license_number),
        industry: safeValue(companyProfile.industry),
        company_size: safeValue(companyProfile.company_size),
        employee_count: companyProfile.employee_count ?? '',
        annual_revenue: safeValue(companyProfile.annual_revenue),
        established_year: safeValue(companyProfile.established_year),
        description: safeValue(companyProfile.description),
        primary_color: safeValue(companyProfile.primary_color) || '#1a237e',
        secondary_color: safeValue(companyProfile.secondary_color) || '#3498db',
        accent_color: safeValue(companyProfile.accent_color) || '#ffc107',
        font_family: safeValue(companyProfile.font_family) || 'Inter',
        contact_person_name: safeValue(companyProfile.contact_person_name),
        contact_person_email: safeValue(companyProfile.contact_person_email),
        contact_person_phone: safeValue(companyProfile.contact_person_phone),
        facebook_url: safeValue(companyProfile.social_links?.facebook),
        twitter_url: safeValue(companyProfile.social_links?.twitter),
        linkedin_url: safeValue(companyProfile.social_links?.linkedin),
        instagram_url: safeValue(companyProfile.social_links?.instagram),
        youtube_url: safeValue(companyProfile.social_links?.youtube),
        timezone: safeValue(companyProfile.timezone) || 'Africa/Nairobi',
        currency: safeValue(companyProfile.currency) || 'KES',
        date_format: safeValue(companyProfile.date_format) || 'd M Y',
        time_format: safeValue(companyProfile.time_format) || 'H:i',
        is_active: safeBoolean(companyProfile.is_active),
      })
    }
  }, [companyProfile])

  // ============================================
  // EFFECTS - Load Supplier Data
  // ============================================

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

  // ============================================
  // VALIDATION
  // ============================================

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

  const validateCompanyForm = () => {
    const errors: Record<string, string> = {}

    if (!companyFormData.company_name.trim()) {
      errors.company_name = 'Company name is required'
    }
    if (!companyFormData.company_email.trim()) {
      errors.company_email = 'Company email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyFormData.company_email)) {
      errors.company_email = 'Invalid email format'
    }
    if (!companyFormData.company_address.trim()) {
      errors.company_address = 'Company address is required'
    }

    setCompanyErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ============================================
  // HANDLERS - Personal Profile
  // ============================================

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

  // ============================================
  // HANDLERS - Supplier
  // ============================================

  const handleSupplierChange = (field: string, value: string) => {
    setSupplierFormData(prev => ({ ...prev, [field]: value }))
    if (supplierErrors[field]) {
      setSupplierErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCategorySelect = (value: string) => {
    handleSupplierChange('category', value)
  }

  const getCategoryValue = (): string => {
    return supplierFormData.category || ''
  }

  // ============================================
  // HANDLERS - Company Profile (Admin)
  // ============================================

  const handleCompanyChange = (field: string, value: string) => {
    setCompanyFormData(prev => ({ ...prev, [field]: value }))
    if (companyErrors[field]) {
      setCompanyErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCompanyNumberChange = (field: string, value: string) => {
    const numValue = value === '' ? '' : Number(value)
    setCompanyFormData(prev => ({ ...prev, [field]: numValue }))
    if (companyErrors[field]) {
      setCompanyErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCompanySelectChange = (field: string, value: string) => {
    setCompanyFormData(prev => ({ ...prev, [field]: value }))
    if (companyErrors[field]) {
      setCompanyErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFontSelectChange = (value: string) => {
    setCompanyFormData(prev => ({ ...prev, font_family: value }))
    if (companyErrors.font_family) {
      setCompanyErrors(prev => ({ ...prev, font_family: '' }))
    }
  }

  // ============================================
  // HANDLERS - File Uploads
  // ============================================

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

  // ============================================
  // HANDLERS - Submit
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isProfileValid = validateForm()
    let isCompanyValid = true
    let isSupplierValid = true

    if (isAdmin) {
      isCompanyValid = validateCompanyForm()
    }

    if (isSupplier) {
      isSupplierValid = validateSupplierForm()
    }

    if (!isProfileValid || !isCompanyValid || !isSupplierValid) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (avatarFile) {
        await uploadAvatar(avatarFile)
      }

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

      if (isAdmin) {
        const formDataToSubmit = new FormData()

        Object.entries(companyFormData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (key === 'is_active') {
              formDataToSubmit.append(key, value === true || value === 'true' ? '1' : '0')
            } else if (key === 'employee_count') {
              formDataToSubmit.append(key, String(value))
            } else {
              formDataToSubmit.append(key, String(value))
            }
          }
        })

        if (companyLogoFile) {
          formDataToSubmit.append('company_logo', companyLogoFile)
        }

        await saveProfile.mutateAsync(formDataToSubmit)
      }

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
      await refetchProfile()

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

  // ============================================
  // HANDLERS - Refresh
  // ============================================

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetchUser()
      await refetchSupplier()
      await refetchProfile()
    } catch (error) {
      setError('Failed to refresh profile data.')
    } finally {
      setIsRefreshing(false)
    }
  }

  // ============================================
  // HELPERS
  // ============================================

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

  const getSupplierLogoUrl = (): string | null => {
    if (companyLogoPreview) return companyLogoPreview
    if (supplier && 'company_logo' in supplier) {
      return supplier.company_logo || null
    }
    return null
  }

  const getCompanyLogoUrl = (): string | null => {
    if (companyLogoPreview) return companyLogoPreview
    if (companyProfile?.logo_url) return companyProfile.logo_url
    if (companyProfile?.company_logo) return companyProfile.company_logo
    return null
  }

  const getCategoryLabel = (value: string): string => {
    const option = CATEGORY_OPTIONS.find(opt => opt.value === value)
    return option ? option.label : ''
  }

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const categories = categoriesData?.data || []
  const isLoadingData = categoriesLoading || !supplierData

  const completionPercentage = useMemo(() => {
    const fields = [
      formData.first_name,
      formData.last_name,
      formData.email,
      formData.phone,
      formData.profile.address,
      formData.profile.city,
      formData.profile.country,
    ]
    const filled = fields.filter(f => f && f.trim() !== '').length
    return Math.round((filled / fields.length) * 100)
  }, [formData])

  const companyCompletionPercentage = companyCompletion?.percentage || 0

  const showCompanyTab = isAdmin
  const showSupplierTab = isSupplier

  // ============================================
  // RENDER
  // ============================================

  return (
    <PageTemplate
      title="Profile Settings"
      description="Manage your personal information and preferences"
      icon={<User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Profile' },
      ]}
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Badge className="bg-primary/10 dark:bg-primary/20 text-primary border-primary/20 dark:border-primary/30 rounded-full px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            {completionPercentage}% Complete
          </Badge>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <Avatar className="h-32 w-32 ring-4 ring-blue-100 dark:ring-blue-900/30 shadow-lg">
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
                    className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-600/30 hover:scale-110"
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
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                  {formData.first_name} {formData.last_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {formData.email}
                </p>
                {/* Role Badge with proper label and description */}
                {primaryRole && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <Badge className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 border font-medium",
                      roleBadgeColor
                    )}>
                      <Shield className="h-3.5 w-3.5" />
                      {roleLabel}
                    </Badge>
                    {roleDescription && (
                      <p className="text-xs text-muted-foreground max-w-[200px] text-center">
                        {roleDescription}
                      </p>
                    )}
                  </div>
                )}
                {isAdmin && (
                  <Badge variant="outline" className="mt-1 flex items-center gap-1 rounded-full px-3 py-1 border-blue-500 text-blue-600 dark:text-blue-400">
                    <Building className="h-3 w-3" />
                    Administrator Access
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
                      className="h-6 px-2 text-red-500 hover:text-red-600 rounded-xl"
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

              <Separator className="my-4 dark:bg-gray-700" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Member Since
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {userExtended?.created_at ? new Date(userExtended.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {userExtended?.last_login_at && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Last Login
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(userExtended.last_login_at).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Status
                  </span>
                  <Badge variant="success" className="flex items-center gap-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
                {/* Role info section */}
                {primaryRole && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Role
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {roleLabel}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-4 dark:bg-gray-700" />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6 rounded-xl border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 rounded-xl border-green-500/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
                    ✅ Profile updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="personal" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                  <TabsList className="grid w-full rounded-xl bg-gray-100/50 dark:bg-gray-800/50 p-1" style={{
                    gridTemplateColumns: `repeat(${1 + (showCompanyTab ? 1 : 0) + (showSupplierTab ? 1 : 0)}, 1fr)`
                  }}>
                    <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
                      <User className="h-4 w-4 mr-2" />
                      Personal
                    </TabsTrigger>
                    {showCompanyTab && (
                      <TabsTrigger value="company" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
                        <Building className="h-4 w-4 mr-2" />
                        Company
                      </TabsTrigger>
                    )}
                    {showSupplierTab && (
                      <TabsTrigger value="supplier" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
                        <Store className="h-4 w-4 mr-2" />
                        Supplier
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {/* Personal Tab - Keep existing content */}
                  <TabsContent value="personal" className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-sm font-medium flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="first_name"
                          placeholder="Enter first name"
                          value={formData.first_name}
                          onChange={(e) => handleChange('first_name', e.target.value)}
                          disabled={isLoading}
                          className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", formErrors.first_name && "border-red-500")}
                        />
                        {formErrors.first_name && (
                          <p className="text-sm text-red-500">{formErrors.first_name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-sm font-medium flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="last_name"
                          placeholder="Enter last name"
                          value={formData.last_name}
                          onChange={(e) => handleChange('last_name', e.target.value)}
                          disabled={isLoading}
                          className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", formErrors.last_name && "border-red-500")}
                        />
                        {formErrors.last_name && (
                          <p className="text-sm text-red-500">{formErrors.last_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        disabled
                        className="h-11 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          placeholder="+254 700 000 000"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          disabled={isLoading}
                          className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", formErrors.phone && "border-red-500")}
                        />
                        {formErrors.phone && (
                          <p className="text-sm text-red-500">{formErrors.phone}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="id_number" className="text-sm font-medium flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                          ID Number
                        </Label>
                        <Input
                          id="id_number"
                          placeholder="Enter ID number"
                          value={formData.id_number}
                          onChange={(e) => handleChange('id_number', e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="text-sm font-medium flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        Date of Birth
                      </Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleChange('date_of_birth', e.target.value)}
                        disabled={isLoading}
                        className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us a bit about yourself..."
                        value={formData.profile.bio}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        disabled={isLoading}
                        className="min-h-[100px] resize-none rounded-xl dark:bg-gray-900 dark:border-gray-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        Address
                      </Label>
                      <Input
                        id="address"
                        placeholder="Enter street address"
                        value={formData.profile.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        disabled={isLoading}
                        className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          City
                        </Label>
                        <Input
                          id="city"
                          placeholder="Enter city"
                          value={formData.profile.city}
                          onChange={(e) => handleProfileChange('city', e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          State/Province
                        </Label>
                        <Input
                          id="state"
                          placeholder="Enter state or province"
                          value={formData.profile.state}
                          onChange={(e) => handleProfileChange('state', e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postal_code" className="text-sm font-medium flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                          Postal Code
                        </Label>
                        <Input
                          id="postal_code"
                          placeholder="Enter postal code"
                          value={formData.profile.postal_code}
                          onChange={(e) => handleProfileChange('postal_code', e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          Country
                        </Label>
                        <Input
                          id="country"
                          placeholder="Enter country"
                          value={formData.profile.country}
                          onChange={(e) => handleProfileChange('country', e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Link className="h-3.5 w-3.5 text-muted-foreground" />
                        Social Links
                      </Label>
                      <div className="space-y-3">
                        <Input
                          placeholder="Website URL"
                          value={formData.profile.social_links?.website || ''}
                          onChange={(e) => handleSocialChange('website', e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                        />
                        <Input
                          placeholder="GitHub URL"
                          value={formData.profile.social_links?.github || ''}
                          onChange={(e) => handleSocialChange('github', e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                        />
                        <Input
                          placeholder="Twitter/X URL"
                          value={formData.profile.social_links?.twitter || ''}
                          onChange={(e) => handleSocialChange('twitter', e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                        />
                        <Input
                          placeholder="LinkedIn URL"
                          value={formData.profile.social_links?.linkedin || ''}
                          onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Company Tab - Keep existing content */}
                  {showCompanyTab && (
                    <TabsContent value="company" className="mt-6 space-y-4">
                      {/* Company tab content remains the same */}
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20">
                          <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Company Profile
                        </h3>
                        <Badge variant="outline" className="ml-2 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                          {companyCompletionPercentage}% Complete
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Manage your organization's profile, branding, and contact information.
                      </p>

                      {/* Company tab fields - same as before */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Company Logo */}
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium">Company Logo</Label>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="relative">
                              <div className="h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                                {getCompanyLogoUrl() ? (
                                  <img
                                    src={getCompanyLogoUrl()!}
                                    alt="Company Logo"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                              <label
                                htmlFor="company-logo-upload-company"
                                className="absolute -bottom-2 -right-2 p-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-600/30 hover:scale-110"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                <input
                                  id="company-logo-upload-company"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleCompanyLogoChange}
                                  disabled={isLoading}
                                />
                              </label>
                            </div>
                            <div className="text-sm text-gray-500">
                              <p className="font-medium">Upload company logo</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
                            </div>
                          </div>
                        </div>

                        {/* Company Name */}
                        <div className="space-y-2">
                          <Label htmlFor="company_name" className="text-sm font-medium flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="company_name"
                            placeholder="Enter company name"
                            value={companyFormData.company_name}
                            onChange={(e) => handleCompanyChange('company_name', e.target.value)}
                            disabled={isLoading}
                            className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", companyErrors.company_name && "border-red-500")}
                          />
                          {companyErrors.company_name && (
                            <p className="text-sm text-red-500">{companyErrors.company_name}</p>
                          )}
                        </div>

                        {/* Company Email */}
                        <div className="space-y-2">
                          <Label htmlFor="company_email" className="text-sm font-medium flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="company_email"
                            type="email"
                            placeholder="company@example.com"
                            value={companyFormData.company_email}
                            onChange={(e) => handleCompanyChange('company_email', e.target.value)}
                            disabled={isLoading}
                            className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", companyErrors.company_email && "border-red-500")}
                          />
                          {companyErrors.company_email && (
                            <p className="text-sm text-red-500">{companyErrors.company_email}</p>
                          )}
                        </div>

                        {/* Company Phone */}
                        <div className="space-y-2">
                          <Label htmlFor="company_phone" className="text-sm font-medium flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Phone
                          </Label>
                          <Input
                            id="company_phone"
                            placeholder="+254 700 000 000"
                            value={companyFormData.company_phone}
                            onChange={(e) => handleCompanyChange('company_phone', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Registration Number */}
                        <div className="space-y-2">
                          <Label htmlFor="registration_number" className="text-sm font-medium flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            Registration Number
                          </Label>
                          <Input
                            id="registration_number"
                            placeholder="Enter registration number"
                            value={companyFormData.registration_number}
                            onChange={(e) => handleCompanyChange('registration_number', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Tax ID */}
                        <div className="space-y-2">
                          <Label htmlFor="tax_id" className="text-sm font-medium flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                            Tax ID / PIN
                          </Label>
                          <Input
                            id="tax_id"
                            placeholder="Enter tax ID or PIN"
                            value={companyFormData.tax_id}
                            onChange={(e) => handleCompanyChange('tax_id', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* License Number */}
                        <div className="space-y-2">
                          <Label htmlFor="license_number" className="text-sm font-medium flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-muted-foreground" />
                            License Number
                          </Label>
                          <Input
                            id="license_number"
                            placeholder="Enter license number"
                            value={companyFormData.license_number}
                            onChange={(e) => handleCompanyChange('license_number', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Industry */}
                        <div className="space-y-2">
                          <Label htmlFor="industry" className="text-sm font-medium flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            Industry
                          </Label>
                          <Select
                            value={companyFormData.industry}
                            onValueChange={(value) => handleCompanySelectChange('industry', value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                              {INDUSTRY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Company Size */}
                        <div className="space-y-2">
                          <Label htmlFor="company_size" className="text-sm font-medium flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Size
                          </Label>
                          <Select
                            value={companyFormData.company_size}
                            onValueChange={(value) => handleCompanySelectChange('company_size', value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                              {COMPANY_SIZE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Employee Count */}
                        <div className="space-y-2">
                          <Label htmlFor="employee_count" className="text-sm font-medium flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            Employee Count
                          </Label>
                          <Input
                            id="employee_count"
                            type="number"
                            placeholder="Enter number of employees"
                            value={companyFormData.employee_count}
                            onChange={(e) => handleCompanyNumberChange('employee_count', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Annual Revenue */}
                        <div className="space-y-2">
                          <Label htmlFor="annual_revenue" className="text-sm font-medium flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                            Annual Revenue
                          </Label>
                          <Input
                            id="annual_revenue"
                            placeholder="e.g., 5,000,000"
                            value={companyFormData.annual_revenue}
                            onChange={(e) => handleCompanyChange('annual_revenue', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Established Year */}
                        <div className="space-y-2">
                          <Label htmlFor="established_year" className="text-sm font-medium flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            Year Established
                          </Label>
                          <Input
                            id="established_year"
                            placeholder="e.g., 2010"
                            value={companyFormData.established_year}
                            onChange={(e) => handleCompanyChange('established_year', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Company Address */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="company_address" className="text-sm font-medium flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Address <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="company_address"
                            placeholder="Enter company address"
                            value={companyFormData.company_address}
                            onChange={(e) => handleCompanyChange('company_address', e.target.value)}
                            disabled={isLoading}
                            className={cn("min-h-[80px] resize-none rounded-xl dark:bg-gray-900 dark:border-gray-700", companyErrors.company_address && "border-red-500")}
                            rows={2}
                          />
                          {companyErrors.company_address && (
                            <p className="text-sm text-red-500">{companyErrors.company_address}</p>
                          )}
                        </div>

                        {/* Company Website */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="company_website" className="text-sm font-medium flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Website
                          </Label>
                          <Input
                            id="company_website"
                            placeholder="https://example.com"
                            value={companyFormData.company_website}
                            onChange={(e) => handleCompanyChange('company_website', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Description
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Describe your company, products, and services..."
                            value={companyFormData.description}
                            onChange={(e) => handleCompanyChange('description', e.target.value)}
                            disabled={isLoading}
                            className="min-h-[100px] resize-none rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        <Separator className="md:col-span-2 my-2 dark:bg-gray-700" />

                        {/* Branding */}
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            Branding
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Primary Color</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  value={companyFormData.primary_color}
                                  onChange={(e) => handleCompanyChange('primary_color', e.target.value)}
                                  disabled={isLoading}
                                  className="h-11 w-16 rounded-xl dark:bg-gray-900 dark:border-gray-700 p-1"
                                />
                                <Input
                                  value={companyFormData.primary_color}
                                  onChange={(e) => handleCompanyChange('primary_color', e.target.value)}
                                  disabled={isLoading}
                                  className="h-11 flex-1 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Secondary Color</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  value={companyFormData.secondary_color}
                                  onChange={(e) => handleCompanyChange('secondary_color', e.target.value)}
                                  disabled={isLoading}
                                  className="h-11 w-16 rounded-xl dark:bg-gray-900 dark:border-gray-700 p-1"
                                />
                                <Input
                                  value={companyFormData.secondary_color}
                                  onChange={(e) => handleCompanyChange('secondary_color', e.target.value)}
                                  disabled={isLoading}
                                  className="h-11 flex-1 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Accent Color</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  value={companyFormData.accent_color}
                                  onChange={(e) => handleCompanyChange('accent_color', e.target.value)}
                                  disabled={isLoading}
                                  className="h-11 w-16 rounded-xl dark:bg-gray-900 dark:border-gray-700 p-1"
                                />
                                <Input
                                  value={companyFormData.accent_color}
                                  onChange={(e) => handleCompanyChange('accent_color', e.target.value)}
                                  disabled={isLoading}
                                  className="h-11 flex-1 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Label className="text-sm font-medium flex items-center gap-1.5">
                              <Type className="h-3.5 w-3.5 text-muted-foreground" />
                              Font Family
                            </Label>
                            <Select
                              value={companyFormData.font_family}
                              onValueChange={handleFontSelectChange}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                                <SelectValue placeholder="Select font family" />
                              </SelectTrigger>
                              <SelectContent className="dark:bg-gray-900 dark:border-gray-700 max-h-[200px]">
                                {FONT_OPTIONS.map((font) => (
                                  <SelectItem key={font.value} value={font.value}>
                                    <span className={font.className}>{font.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Separator className="md:col-span-2 my-2 dark:bg-gray-700" />

                        {/* Contact Person */}
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                            Contact Person
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Full Name</Label>
                              <Input
                                placeholder="Contact person name"
                                value={companyFormData.contact_person_name}
                                onChange={(e) => handleCompanyChange('contact_person_name', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Email</Label>
                              <Input
                                type="email"
                                placeholder="contact@example.com"
                                value={companyFormData.contact_person_email}
                                onChange={(e) => handleCompanyChange('contact_person_email', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Phone</Label>
                              <Input
                                placeholder="+254 700 000 000"
                                value={companyFormData.contact_person_phone}
                                onChange={(e) => handleCompanyChange('contact_person_phone', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="md:col-span-2 my-2 dark:bg-gray-700" />

                        {/* Social Media */}
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Link className="h-4 w-4 text-muted-foreground" />
                            Social Media
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Facebook className="h-4 w-4 text-muted-foreground" />
                                Facebook
                              </Label>
                              <Input
                                placeholder="https://facebook.com/company"
                                value={companyFormData.facebook_url}
                                onChange={(e) => handleCompanyChange('facebook_url', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Twitter className="h-4 w-4 text-muted-foreground" />
                                Twitter/X
                              </Label>
                              <Input
                                placeholder="https://twitter.com/company"
                                value={companyFormData.twitter_url}
                                onChange={(e) => handleCompanyChange('twitter_url', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Linkedin className="h-4 w-4 text-muted-foreground" />
                                LinkedIn
                              </Label>
                              <Input
                                placeholder="https://linkedin.com/company"
                                value={companyFormData.linkedin_url}
                                onChange={(e) => handleCompanyChange('linkedin_url', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Instagram className="h-4 w-4 text-muted-foreground" />
                                Instagram
                              </Label>
                              <Input
                                placeholder="https://instagram.com/company"
                                value={companyFormData.instagram_url}
                                onChange={(e) => handleCompanyChange('instagram_url', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Youtube className="h-4 w-4 text-muted-foreground" />
                                YouTube
                              </Label>
                              <Input
                                placeholder="https://youtube.com/company"
                                value={companyFormData.youtube_url}
                                onChange={(e) => handleCompanyChange('youtube_url', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="md:col-span-2 my-2 dark:bg-gray-700" />

                        {/* Settings */}
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            Settings
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                Timezone
                              </Label>
                              <Select
                                value={companyFormData.timezone}
                                onValueChange={(value) => handleCompanySelectChange('timezone', value)}
                                disabled={isLoading}
                              >
                                <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                  {TIMEZONE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                Currency
                              </Label>
                              <Select
                                value={companyFormData.currency}
                                onValueChange={(value) => handleCompanySelectChange('currency', value)}
                                disabled={isLoading}
                              >
                                <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                  {CURRENCY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Supplier Tab - Keep existing content */}
                  {showSupplierTab && (
                    <TabsContent value="supplier" className="mt-6 space-y-4">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20">
                          <Store className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Supplier Information
                        </h3>
                        <Badge variant="outline" className="ml-2 rounded-full bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                          {isEditingSupplier ? 'Update' : 'Complete'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isEditingSupplier
                          ? 'Update your company information and supplier details.'
                          : 'Complete your supplier profile to start receiving procurement opportunities.'}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Company Logo - Supplier */}
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium">Company Logo</Label>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="relative">
                              <div className="h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
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
                                className="absolute -bottom-2 -right-2 p-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-600/30 hover:scale-110"
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
                              <p className="font-medium">Upload company logo</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
                            </div>
                          </div>
                        </div>

                        {/* Company Name */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="Enter company name"
                            value={supplierFormData.company_name}
                            onChange={(e) => handleSupplierChange('company_name', e.target.value)}
                            disabled={isLoading}
                            className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", supplierErrors.company_name && "border-red-500")}
                          />
                          {supplierErrors.company_name && (
                            <p className="text-sm text-red-500">{supplierErrors.company_name}</p>
                          )}
                        </div>

                        {/* Company Email */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="email"
                            placeholder="company@example.com"
                            value={supplierFormData.company_email}
                            onChange={(e) => handleSupplierChange('company_email', e.target.value)}
                            disabled={isLoading}
                            className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", supplierErrors.company_email && "border-red-500")}
                          />
                          {supplierErrors.company_email && (
                            <p className="text-sm text-red-500">{supplierErrors.company_email}</p>
                          )}
                        </div>

                        {/* Company Phone */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Phone
                          </Label>
                          <Input
                            placeholder="+254 700 000 000"
                            value={supplierFormData.company_phone}
                            onChange={(e) => handleSupplierChange('company_phone', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Registration Number */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                            Registration Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="Enter registration number"
                            value={supplierFormData.company_registration}
                            onChange={(e) => handleSupplierChange('company_registration', e.target.value)}
                            disabled={isLoading}
                            className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", supplierErrors.company_registration && "border-red-500")}
                          />
                          {supplierErrors.company_registration && (
                            <p className="text-sm text-red-500">{supplierErrors.company_registration}</p>
                          )}
                        </div>

                        {/* Tax ID */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            Tax ID / PIN
                          </Label>
                          <Input
                            placeholder="Enter tax ID or PIN"
                            value={supplierFormData.tax_id}
                            onChange={(e) => handleSupplierChange('tax_id', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* License Number */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-muted-foreground" />
                            License Number
                          </Label>
                          <Input
                            placeholder="Enter license number"
                            value={supplierFormData.license_number}
                            onChange={(e) => handleSupplierChange('license_number', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Registration Date */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            Registration Date
                          </Label>
                          <Input
                            type="date"
                            value={supplierFormData.registration_date}
                            onChange={(e) => handleSupplierChange('registration_date', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Established Year */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            Year Established
                          </Label>
                          <Input
                            placeholder="e.g., 2010"
                            value={supplierFormData.established_year}
                            onChange={(e) => handleSupplierChange('established_year', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Employee Count */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            Number of Employees
                          </Label>
                          <Input
                            placeholder="e.g., 50"
                            value={supplierFormData.employee_count}
                            onChange={(e) => handleSupplierChange('employee_count', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Annual Revenue */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                            Annual Revenue
                          </Label>
                          <Input
                            placeholder="e.g., 5,000,000"
                            value={supplierFormData.annual_revenue}
                            onChange={(e) => handleSupplierChange('annual_revenue', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            Business Category <span className="text-red-500">*</span>
                          </Label>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {CATEGORY_OPTIONS.map((option) => {
                              const Icon = option.icon;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => handleCategorySelect(option.value)}
                                  className={cn(
                                    "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200",
                                    getCategoryValue() === option.value
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm shadow-blue-500/10"
                                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                    supplierErrors.category && "border-red-500"
                                  )}
                                  disabled={isLoading}
                                >
                                  <Icon className={cn("h-4 w-4", option.color)} />
                                  <span className="text-sm font-medium">{option.label}</span>
                                  {getCategoryValue() === option.value && (
                                    <CheckCircle className="h-4 w-4 text-blue-500" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {supplierErrors.category && (
                            <p className="text-sm text-red-500">{supplierErrors.category}</p>
                          )}
                          <p className="text-xs text-muted-foreground">Select the category that best describes your business.</p>
                        </div>

                        {/* Company Address */}
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Address <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            placeholder="Enter company address"
                            value={supplierFormData.company_address}
                            onChange={(e) => handleSupplierChange('company_address', e.target.value)}
                            disabled={isLoading}
                            className={cn("min-h-[80px] resize-none rounded-xl dark:bg-gray-900 dark:border-gray-700", supplierErrors.company_address && "border-red-500")}
                            rows={2}
                          />
                          {supplierErrors.company_address && (
                            <p className="text-sm text-red-500">{supplierErrors.company_address}</p>
                          )}
                        </div>

                        {/* Company Website */}
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Website
                          </Label>
                          <Input
                            placeholder="https://example.com"
                            value={supplierFormData.company_website}
                            onChange={(e) => handleSupplierChange('company_website', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Certifications */}
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <BadgeCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            Certifications
                          </Label>
                          <Input
                            placeholder="e.g., ISO 9001, ISO 14001"
                            value={supplierFormData.certifications}
                            onChange={(e) => handleSupplierChange('certifications', e.target.value)}
                            disabled={isLoading}
                            className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        {/* Company Description */}
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            Company Description
                          </Label>
                          <Textarea
                            placeholder="Describe your company, products, and services..."
                            value={supplierFormData.description}
                            onChange={(e) => handleSupplierChange('description', e.target.value)}
                            disabled={isLoading}
                            className="min-h-[100px] resize-none rounded-xl dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>

                        <Separator className="md:col-span-2 my-2 dark:bg-gray-700" />

                        {/* Contact Person - Supplier */}
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                            Contact Person
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Full Name</Label>
                              <Input
                                placeholder="Contact person name"
                                value={supplierFormData.contact_person_name}
                                onChange={(e) => handleSupplierChange('contact_person_name', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Email</Label>
                              <Input
                                type="email"
                                placeholder="contact@example.com"
                                value={supplierFormData.contact_person_email}
                                onChange={(e) => handleSupplierChange('contact_person_email', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Phone</Label>
                              <Input
                                placeholder="+254 700 000 000"
                                value={supplierFormData.contact_person_phone}
                                onChange={(e) => handleSupplierChange('contact_person_phone', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="md:col-span-2 my-2 dark:bg-gray-700" />

                        {/* Banking Information - Supplier */}
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            Banking Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Bank Name</Label>
                              <Input
                                placeholder="Bank name"
                                value={supplierFormData.bank_name}
                                onChange={(e) => handleSupplierChange('bank_name', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Bank Branch</Label>
                              <Input
                                placeholder="Branch name"
                                value={supplierFormData.bank_branch}
                                onChange={(e) => handleSupplierChange('bank_branch', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Account Number</Label>
                              <Input
                                placeholder="Bank account number"
                                value={supplierFormData.bank_account}
                                onChange={(e) => handleSupplierChange('bank_account', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Payment Terms</Label>
                              <Input
                                placeholder="e.g., Net 30"
                                value={supplierFormData.payment_terms}
                                onChange={(e) => handleSupplierChange('payment_terms', e.target.value)}
                                disabled={isLoading}
                                className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Preferred Currency</Label>
                              <Select
                                value={supplierFormData.preferred_currency}
                                onValueChange={(value: string) => handleSupplierChange('preferred_currency', value)}
                                disabled={isLoading}
                              >
                                <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                  <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                  <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                                  <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>

                <Separator className="dark:bg-gray-700" />

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    className="gap-2 px-8 min-w-[140px] h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
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
                    className="gap-2 h-12 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t border-gray-200/50 dark:border-gray-700/50 py-4 px-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-xl">
              <div className="flex justify-between items-center w-full">
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-500">*</span> Required fields. Your information is secure and will not be shared.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] rounded-full px-2.5 py-0">
                      Secure
                    </Badge>
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageTemplate>
  )
}
