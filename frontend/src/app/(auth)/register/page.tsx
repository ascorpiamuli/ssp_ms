'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Shield,
  Building2,
  Phone,
  Clock,
  Users,
  Check,
  Store,
  AtSign,
  Building,
  MapPin,
  Globe,
  FileText,
  Briefcase,
  Loader2
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
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast-context'

export default function RegisterPage() {
  const router = useRouter()
  const {
    register,
    isLoading: authLoading,
    departments,
    availableRoles,
    supplierCategories,
    isLoadingDepartments,
    isLoadingRoles,
    isLoadingCategories
  } = useAuth()
  const { success, error } = useToast()

  // ============================================
  // DEBUG LOGS - Track data flow
  // ============================================

  useEffect(() => {
    console.log('🔍 ===== REGISTER PAGE DEBUG =====')
    console.log('📦 Departments:', departments)
    console.log('📦 Departments type:', typeof departments)
    console.log('📦 Departments length:', departments?.length)
    console.log('👤 Available Roles:', availableRoles)
    console.log('👤 Available Roles type:', typeof availableRoles)
    console.log('👤 Available Roles length:', availableRoles?.length)
    console.log('📋 Supplier Categories:', supplierCategories)
    console.log('📋 Supplier Categories type:', typeof supplierCategories)
    console.log('📋 Supplier Categories length:', supplierCategories?.length)
    console.log('🔄 Loading states:', { isLoadingDepartments, isLoadingRoles, isLoadingCategories })
    console.log('🔍 ===== END DEBUG =====')
  }, [departments, availableRoles, supplierCategories, isLoadingDepartments, isLoadingRoles, isLoadingCategories])

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [formData, setFormData] = useState({
    // Common fields
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
    agree_terms: false,

    // Department (only for STAFF & HOD)
    department: '',

    // Supplier specific fields
    companyName: '',
    companyEmail: '',
    companyRegistration: '',
    companyAddress: '',
    companyWebsite: '',
    companyPhone: '',
    taxId: '',
    supplierCategory: '',

    // Additional info
    idNumber: '',
    dateOfBirth: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})

  // Get selected role details - FIX: Use name instead of value
  const selectedRole = availableRoles?.find((r: any) => r.name === formData.role)
  console.log('🎯 Selected role:', selectedRole, 'for value:', formData.role)

  const requiresDepartment = selectedRole?.name === 'HOD' || selectedRole?.name === 'STAFF'
  const isSupplier = formData.role === 'SUPPLIER'

  // Reset form when role changes
  useEffect(() => {
    if (formData.role) {
      setFormData(prev => ({
        ...prev,
        department: '',
        companyName: '',
        companyEmail: '',
        companyRegistration: '',
        companyAddress: '',
        supplierCategory: '',
      }))
    }
  }, [formData.role])

  // Handle password strength
  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, label: 'None', color: 'bg-gray-200' }

    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25
    if (/(?=.*[a-z])/.test(password)) strength += 15
    if (/(?=.*[A-Z])/.test(password)) strength += 15
    if (/(?=.*\d)/.test(password)) strength += 10
    if (/(?=.*[@$!%*?&])/.test(password)) strength += 10

    if (strength < 30) return { strength, label: 'Weak', color: 'bg-red-500' }
    if (strength < 60) return { strength, label: 'Fair', color: 'bg-yellow-500' }
    if (strength < 80) return { strength, label: 'Good', color: 'bg-blue-500' }
    return { strength, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Common validation
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.role) newErrors.role = 'Please select a role'

    // Department validation (if role requires it)
    if (requiresDepartment && !formData.department) {
      newErrors.department = 'Department is required for this role'
    }

    // Supplier-specific validation
    if (isSupplier) {
      if (!formData.companyName) newErrors.companyName = 'Company name is required'
      if (!formData.companyEmail) newErrors.companyEmail = 'Company email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) newErrors.companyEmail = 'Company email is invalid'
      if (!formData.companyRegistration) newErrors.companyRegistration = 'Company registration number is required'
      if (!formData.companyAddress) newErrors.companyAddress = 'Company address is required'
      if (!formData.supplierCategory) newErrors.supplierCategory = 'Please select a supplier category'
    }

    // Password validation
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number'
    }

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password'
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agree_terms) newErrors.agree_terms = 'You must agree to the terms'

    setErrors(newErrors)
    setServerErrors({})
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setServerErrors({})

    try {
      // Prepare registration data - include agree_terms
      const registrationData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        id_number: formData.idNumber || undefined,
        date_of_birth: formData.dateOfBirth || undefined,
        role: formData.role,
        department: formData.department || undefined,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        // Supplier fields
        company_name: formData.companyName || undefined,
        company_email: formData.companyEmail || undefined,
        company_registration: formData.companyRegistration || undefined,
        company_address: formData.companyAddress || undefined,
        company_website: formData.companyWebsite || undefined,
        company_phone: formData.companyPhone || undefined,
        tax_id: formData.taxId || undefined,
        supplier_category: formData.supplierCategory || undefined,
        // ✅ IMPORTANT: Include agree_terms
        agree_terms: formData.agree_terms,
      }

      console.log('📝 Submitting registration:', registrationData)
      await register(registrationData)

      success('Registration successful! Please wait for admin approval.', 5000)
      setRegistrationComplete(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?registered=true')
      }, 3000)

    } catch (err: any) {
      console.error('❌ Registration error:', err)
      // Handle validation errors from server
      if (err.response?.data?.errors) {
        setServerErrors(err.response.data.errors)
        error('Please fix the errors below', 4000)
      } else {
        error(err.message || 'Registration failed. Please try again.', 5000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const FieldError = ({ field }: { field: string }) => {
    const serverError = serverErrors[field]
    const clientError = errors[field]
    const errorMessage = serverError?.[0] || clientError

    if (!errorMessage) return null

    return (
      <p className="text-xs text-red-500 flex items-center mt-1">
        <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
        {errorMessage}
      </p>
    )
  }

  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
  }

  // Loading state
  const isLoadingState = isLoading || authLoading

  // Success screen
  if (registrationComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center animate-bounce-in">
          <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Registration Submitted! 🎉
        </h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 space-y-3 w-full text-left">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Awaiting Admin Approval</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your account is pending approval from a system administrator.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You'll receive an email notification once your account is approved.
              </p>
            </div>
          </div>
          {isSupplier && (
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  As a supplier, you'll be able to respond to quotation requests and submit invoices.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2 w-full">
          <Link href="/login">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full">
              Return to Login
            </Button>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Approval typically takes 24-48 hours
          </p>
        </div>
      </div>
    )
  }

  // Render loading state for dropdowns
  if (isLoadingDepartments || isLoadingRoles || isLoadingCategories) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-600 dark:text-slate-400">Loading registration form...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-bold tracking-wider uppercase">SSPMS</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 bg-clip-text text-transparent">
          Create Account
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Register for School Supplies & Purchases Management System
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 inline-block mx-auto">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Shield className="h-3 w-3" />
            All accounts require admin approval
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <User className="h-4 w-4" /> Personal Information
            </h3>

            {/* First Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="John"
                className={cn((errors.firstName || serverErrors.firstName) && "border-red-500")}
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value })
                  if (errors.firstName) setErrors({ ...errors, firstName: '' })
                  if (serverErrors.firstName) setServerErrors({ ...serverErrors, firstName: [] })
                }}
                disabled={isLoadingState}
              />
              <FieldError field="firstName" />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Doe"
                className={cn((errors.lastName || serverErrors.lastName) && "border-red-500")}
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value })
                  if (errors.lastName) setErrors({ ...errors, lastName: '' })
                  if (serverErrors.lastName) setServerErrors({ ...serverErrors, lastName: [] })
                }}
                disabled={isLoadingState}
              />
              <FieldError field="lastName" />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="john.doe@school.com"
                className={cn((errors.email || serverErrors.email) && "border-red-500")}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (errors.email) setErrors({ ...errors, email: '' })
                  if (serverErrors.email) setServerErrors({ ...serverErrors, email: [] })
                }}
                disabled={isLoadingState}
              />
              <FieldError field="email" />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="tel"
                  placeholder="+254 712 345 678"
                  className={cn("pl-10", (errors.phone || serverErrors.phone) && "border-red-500")}
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value })
                    if (errors.phone) setErrors({ ...errors, phone: '' })
                    if (serverErrors.phone) setServerErrors({ ...serverErrors, phone: [] })
                  }}
                  disabled={isLoadingState}
                />
              </div>
              <FieldError field="phone" />
            </div>

            {/* Role Selection - FIXED field names */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Role <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => {
                  console.log('🔄 Role changed to:', value)
                  setFormData(prev => ({ ...prev, role: value, department: '' }))
                  if (errors.role) setErrors({ ...errors, role: '' })
                  if (serverErrors.role) setServerErrors({ ...serverErrors, role: [] })
                }}
                disabled={isLoadingState}
              >
                <SelectTrigger className={cn((errors.role || serverErrors.role) && "border-red-500")}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles && availableRoles.length > 0 ? (
                    availableRoles.map((role: any) => {
                      console.log('📋 Rendering role option:', role)
                      return (
                        // FIX: Use role.name as the value and display
                        <SelectItem key={`role-${role.id}`} value={role.name}>
                          {role.name}
                        </SelectItem>
                      )
                    })
                  ) : (
                    <SelectItem key="loading-roles" value="loading" disabled>
                      Loading roles...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FieldError field="role" />
            </div>

            {/* Department (only for roles that require it) - HOD and STAFF */}
            {requiresDepartment && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Department <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => {
                    console.log('🏢 Department changed to:', value)
                    setFormData({ ...formData, department: value })
                    if (errors.department) setErrors({ ...errors, department: '' })
                    if (serverErrors.department) setServerErrors({ ...serverErrors, department: [] })
                  }}
                  disabled={isLoadingState}
                >
                  <SelectTrigger className={cn((errors.department || serverErrors.department) && "border-red-500")}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments && departments.length > 0 ? (
                      departments.map((dept: any) => {
                        console.log('🏢 Rendering department option:', dept)
                        return (
                          <SelectItem key={`dept-${dept.id}`} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        )
                      })
                    ) : (
                      <SelectItem key="loading-depts" value="loading" disabled>
                        Loading departments...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FieldError field="department" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formData.role === 'HOD' ? 'You will be assigned as Head of this department' : 'Your department affiliation'}
                </p>
              </div>
            )}

            {/* ID Number (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                National ID / Passport <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="12345678"
                  className="pl-10"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  disabled={isLoadingState}
                />
              </div>
            </div>

            {/* Date of Birth (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Date of Birth <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={isLoadingState}
              />
            </div>
          </div>

          {/* Right Column - Role-specific & Security */}
          <div className="space-y-4">
            {/* Supplier-specific fields */}
            {isSupplier && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <Store className="h-4 w-4" /> Company Information
                </h3>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="ABC Supplies Ltd"
                    className={cn((errors.companyName || serverErrors.companyName) && "border-red-500")}
                    value={formData.companyName}
                    onChange={(e) => {
                      setFormData({ ...formData, companyName: e.target.value })
                      if (errors.companyName) setErrors({ ...errors, companyName: '' })
                      if (serverErrors.companyName) setServerErrors({ ...serverErrors, companyName: [] })
                    }}
                    disabled={isLoadingState}
                  />
                  <FieldError field="companyName" />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Company Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="info@abcsupplies.com"
                      className={cn("pl-10", (errors.companyEmail || serverErrors.companyEmail) && "border-red-500")}
                      value={formData.companyEmail}
                      onChange={(e) => {
                        setFormData({ ...formData, companyEmail: e.target.value })
                        if (errors.companyEmail) setErrors({ ...errors, companyEmail: '' })
                        if (serverErrors.companyEmail) setServerErrors({ ...serverErrors, companyEmail: [] })
                      }}
                      disabled={isLoadingState}
                    />
                  </div>
                  <FieldError field="companyEmail" />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Company Registration <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="PVT-2024-1234"
                    className={cn((errors.companyRegistration || serverErrors.companyRegistration) && "border-red-500")}
                    value={formData.companyRegistration}
                    onChange={(e) => {
                      setFormData({ ...formData, companyRegistration: e.target.value })
                      if (errors.companyRegistration) setErrors({ ...errors, companyRegistration: '' })
                      if (serverErrors.companyRegistration) setServerErrors({ ...serverErrors, companyRegistration: [] })
                    }}
                    disabled={isLoadingState}
                  />
                  <FieldError field="companyRegistration" />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Company Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="123 Business Street, City"
                      className={cn("pl-10", (errors.companyAddress || serverErrors.companyAddress) && "border-red-500")}
                      value={formData.companyAddress}
                      onChange={(e) => {
                        setFormData({ ...formData, companyAddress: e.target.value })
                        if (errors.companyAddress) setErrors({ ...errors, companyAddress: '' })
                        if (serverErrors.companyAddress) setServerErrors({ ...serverErrors, companyAddress: [] })
                      }}
                      disabled={isLoadingState}
                    />
                  </div>
                  <FieldError field="companyAddress" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Supplier Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.supplierCategory}
                      onValueChange={(value) => {
                        console.log('📋 Supplier category changed to:', value)
                        setFormData({ ...formData, supplierCategory: value })
                        if (errors.supplierCategory) setErrors({ ...errors, supplierCategory: '' })
                        if (serverErrors.supplierCategory) setServerErrors({ ...serverErrors, supplierCategory: [] })
                      }}
                      disabled={isLoadingState}
                    >
                      <SelectTrigger className={cn((errors.supplierCategory || serverErrors.supplierCategory) && "border-red-500")}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {supplierCategories && supplierCategories.length > 0 ? (
                          supplierCategories.map((cat: any) => {
                            console.log('📋 Rendering category option:', cat)
                            return (
                              <SelectItem key={`cat-${cat.value}`} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            )
                          })
                        ) : (
                          <SelectItem key="loading-cats" value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FieldError field="supplierCategory" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Tax ID / PIN <span className="text-slate-400 text-xs">(Optional)</span>
                    </label>
                    <Input
                      placeholder="A123456789Z"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      disabled={isLoadingState}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Company Website <span className="text-slate-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="https://www.abcsupplies.com"
                      className="pl-10"
                      value={formData.companyWebsite}
                      onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                      disabled={isLoadingState}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Company Phone <span className="text-slate-400 text-xs">(Optional)</span>
                  </label>
                  <Input
                    placeholder="+254 700 123 456"
                    value={formData.companyPhone}
                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                    disabled={isLoadingState}
                  />
                </div>
              </div>
            )}

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <Lock className="h-4 w-4" /> Security
              </h3>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={cn("pr-10", (errors.password || serverErrors.password) && "border-red-500")}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      if (errors.password) setErrors({ ...errors, password: '' })
                      if (serverErrors.password) setServerErrors({ ...serverErrors, password: [] })
                    }}
                    disabled={isLoadingState}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={isLoadingState}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && !errors.password && !serverErrors.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Password strength:</span>
                      <span className={`text-xs font-medium ${passwordStrength.color === 'bg-red-500' ? 'text-red-500' :
                          passwordStrength.color === 'bg-yellow-500' ? 'text-yellow-500' :
                            passwordStrength.color === 'bg-blue-500' ? 'text-blue-500' : 'text-green-500'
                        }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
                <FieldError field="password" />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={cn("pr-10", (errors.confirmPassword || serverErrors.confirmPassword) && "border-red-500")}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value })
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                      if (serverErrors.confirmPassword) setServerErrors({ ...serverErrors, confirmPassword: [] })
                    }}
                    disabled={isLoadingState}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={isLoadingState}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError field="confirmPassword" />
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password must contain:</p>
                <ul className="grid grid-cols-2 gap-1 text-xs">
                  <li className={cn("flex items-center", /.{8,}/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-500")}>
                    <CheckCircle className="h-3 w-3 mr-1" /> 8+ characters
                  </li>
                  <li className={cn("flex items-center", /[A-Z]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-500")}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Uppercase
                  </li>
                  <li className={cn("flex items-center", /[a-z]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-500")}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Lowercase
                  </li>
                  <li className={cn("flex items-center", /\d/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-500")}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Number
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width - Terms & Actions */}
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={formData.agree_terms}
              onChange={(e) => setFormData({ ...formData, agree_terms: e.target.checked })}
              disabled={isLoadingState}
            />
            <label htmlFor="terms" className="block text-sm text-slate-700 dark:text-slate-300">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank">
                Privacy Policy
              </Link>
            </label>
          </div>
          <FieldError field="agree_terms" />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 py-6"
            disabled={isLoadingState}
          >
            {isLoadingState ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Account...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </div>
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-slate-600 dark:text-slate-400">Already have an account? </span>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </form>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
