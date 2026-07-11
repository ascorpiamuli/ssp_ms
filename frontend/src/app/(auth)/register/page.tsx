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
  Loader2,
  FileText,
  ArrowLeft
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
    isLoadingDepartments,
    isLoadingRoles,
  } = useAuth()


  useEffect(() => {
    console.log('🔍 ===== REGISTER PAGE DEBUG =====')
    console.log('📦 Departments:', departments)
    console.log('📦 Departments length:', departments?.length)
    console.log('👤 Available Roles:', availableRoles)
    console.log('👤 Available Roles length:', availableRoles?.length)
    console.log('🔄 Loading states:', { isLoadingDepartments, isLoadingRoles })
    console.log('🔍 ===== END DEBUG =====')
  }, [departments, availableRoles, isLoadingDepartments, isLoadingRoles])

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
    agree_terms: false,
    department: '',
    idNumber: '',
    dateOfBirth: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})

  const selectedRole = availableRoles?.find((r: any) => r.name === formData.role)
  const requiresDepartment = selectedRole?.name === 'HOD' || selectedRole?.name === 'STAFF'
  const isSupplier = formData.role === 'SUPPLIER'

  useEffect(() => {
    if (formData.role) {
      setFormData(prev => ({ ...prev, department: '' }))
    }
  }, [formData.role])

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

    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.role) newErrors.role = 'Please select a role'

    if (requiresDepartment && !formData.department) {
      newErrors.department = 'Department is required for this role'
    }

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
        agree_terms: formData.agree_terms,
      }

      console.log('📝 Submitting registration:', registrationData)
      await register(registrationData)
      setRegistrationComplete(true)

      setTimeout(() => {
        router.push('/login?registered=true')
      }, 3000)

    } catch (err: any) {
      console.error('❌ Registration error:', err)
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
      <p className="text-xs text-red-500 flex items-center mt-1 animate-shake">
        <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
        {errorMessage}
      </p>
    )
  }

  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
  }

  const isLoadingState = isLoading || authLoading

  if (registrationComplete) {
    return (
      <div className="space-y-8 animate-fade-in max-w-md mx-auto">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full animate-ping-slow bg-emerald-400/30 dark:bg-emerald-500/30" />
            <div className="absolute inset-0 rounded-full animate-ping-slower bg-emerald-400/20 dark:bg-emerald-500/20" />
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110">
              <Check className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
              Registration Submitted! 🎉
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your account is pending approval from a system administrator.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Awaiting Admin Approval</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  You'll receive an email notification once your account is approved.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Account Details</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                  {isSupplier ? 'You registered as a Supplier. Complete your profile after approval.' : 'Your account will be activated after admin approval.'}
                </p>
              </div>
            </div>
          </div>

          {isSupplier && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Complete Your Profile</h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    After approval, you'll need to complete your supplier profile with company details.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/login">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300">
              Return to Login
            </Button>
          </Link>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Approval typically takes 24-48 hours
          </p>
        </div>
      </div>
    )
  }

  if (isLoadingDepartments || isLoadingRoles) {
    return (
      <div className="space-y-8 animate-fade-in max-w-md mx-auto text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-full flex items-center justify-center shadow-xl">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Loading Registration Form</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Please wait while we prepare your registration...</p>
        </div>
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-md mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-bold tracking-wider uppercase">SSPMS</span>
        </div>

        <div className="relative inline-block">
          <div className="absolute inset-0 rounded-full animate-ping-slow bg-blue-400/30 dark:bg-blue-500/30" />
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Register for School Supplies & Purchases Management System
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 inline-block mx-auto border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Shield className="h-3 w-3" />
            All accounts require admin approval
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
            <User className="h-4 w-4" /> Personal Information
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="John"
                className={cn(
                  "transition-all duration-200",
                  (errors.firstName || serverErrors.firstName)
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                )}
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Doe"
                className={cn(
                  "transition-all duration-200",
                  (errors.lastName || serverErrors.lastName)
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                )}
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
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              <Input
                type="email"
                placeholder="john.doe@school.com"
                className={cn(
                  "pl-10 transition-all duration-200",
                  (errors.email || serverErrors.email)
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                )}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (errors.email) setErrors({ ...errors, email: '' })
                  if (serverErrors.email) setServerErrors({ ...serverErrors, email: [] })
                }}
                disabled={isLoadingState}
              />
            </div>
            <FieldError field="email" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              <Input
                type="tel"
                placeholder="+254 712 345 678"
                className={cn(
                  "pl-10 transition-all duration-200",
                  (errors.phone || serverErrors.phone)
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                )}
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

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Role <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, role: value, department: '' }))
                if (errors.role) setErrors({ ...errors, role: '' })
                if (serverErrors.role) setServerErrors({ ...serverErrors, role: [] })
              }}
              disabled={isLoadingState}
            >
              <SelectTrigger className={cn(
                "transition-all duration-200",
                (errors.role || serverErrors.role)
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
              )}>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles && availableRoles.length > 0 ? (
                  availableRoles.map((role: any) => (
                    <SelectItem key={`role-${role.id}`} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                )}
              </SelectContent>
            </Select>
            <FieldError field="role" />
            {isSupplier && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                After admin approval, complete your supplier profile with company details.
              </p>
            )}
          </div>

          {requiresDepartment && (
            <div className="space-y-1 animate-fade-in">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Department <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.department}
                onValueChange={(value) => {
                  setFormData({ ...formData, department: value })
                  if (errors.department) setErrors({ ...errors, department: '' })
                  if (serverErrors.department) setServerErrors({ ...serverErrors, department: [] })
                }}
                disabled={isLoadingState}
              >
                <SelectTrigger className={cn(
                  "transition-all duration-200",
                  (errors.department || serverErrors.department)
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                )}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments && departments.length > 0 ? (
                    departments.map((dept: any) => (
                      <SelectItem key={`dept-${dept.id}`} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FieldError field="department" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                ID Number <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <div className="relative group">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                <Input
                  placeholder="12345678"
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  disabled={isLoadingState}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Date of Birth <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <Input
                type="date"
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={isLoadingState}
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
            <Lock className="h-4 w-4" /> Security
          </h3>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={cn(
                  "pr-10 transition-all duration-200",
                  (errors.password || serverErrors.password)
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                )}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isLoadingState}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.password && !errors.password && !serverErrors.password && (
              <div className="mt-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-slate-500">Strength:</span>
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

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={cn(
                  "pr-10 transition-all duration-200",
                  (errors.confirmPassword || serverErrors.confirmPassword)
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                )}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isLoadingState}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError field="confirmPassword" />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password must contain:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
              <span className={cn("flex items-center", /.{8,}/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-500")}>
                <CheckCircle className="h-3 w-3 mr-1" /> 8+ characters
              </span>
              <span className={cn("flex items-center", /[A-Z]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-500")}>
                <CheckCircle className="h-3 w-3 mr-1" /> Uppercase
              </span>
              <span className={cn("flex items-center", /[a-z]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-500")}>
                <CheckCircle className="h-3 w-3 mr-1" /> Lowercase
              </span>
              <span className={cn("flex items-center", /\d/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-500")}>
                <CheckCircle className="h-3 w-3 mr-1" /> Number
              </span>
            </div>
          </div>
        </div>

        {/* Terms & Actions */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={formData.agree_terms}
              onChange={(e) => setFormData({ ...formData, agree_terms: e.target.checked })}
              disabled={isLoadingState}
            />
            <label htmlFor="terms" className="text-sm text-slate-700 dark:text-slate-300">
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
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
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

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
              Back to login
            </Link>
          </div>
        </div>
      </form>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes ping-slower {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-ping-slower {
          animation: ping-slower 4s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .animate-bounce {
          animation: bounce 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
