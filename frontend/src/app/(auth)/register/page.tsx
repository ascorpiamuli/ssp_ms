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
  Phone,
  Clock,
  Users,
  Check,
  Loader2,
  ArrowLeft,
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
import { cn } from '@/lib/utils'

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
    else if (formData.password.length < 8) newErrors.password = 'At least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Must contain upper, lower & number'
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
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department || undefined,
        password: formData.password,
        password_confirmation: formData.confirmPassword,

      })
      setRegistrationComplete(true)
      setTimeout(() => router.push('/login?registered=true'), 3000)
    } catch (err: any) {
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const FieldError = ({ field }: { field: string }) => {
    const msg = serverErrors[field]?.[0] || errors[field]
    if (!msg) return null
    return (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-shake">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        {msg}
      </p>
    )
  }

  const isLoadingState = isLoading || authLoading

  // ───────────── Success State ─────────────
  if (registrationComplete) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full animate-ping-slow bg-emerald-400/30" />
            <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <Check className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              Registration Submitted
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Your account is pending admin approval.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                  Awaiting Admin Approval
                </h3>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                  You'll be notified by email once approved.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start gap-2.5">
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
                  {isSupplier ? 'Supplier Account' : 'Staff Account'}
                </h3>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {isSupplier
                    ? 'Complete your supplier profile after approval.'
                    : 'Your account activates after admin approval.'}
                </p>
              </div>
            </div>
          </div>

          {isSupplier && (
            <div className="sm:col-span-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Profile Required
                  </h3>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                    Add company details once approved.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Link href="/login">
          <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
            Return to Login
          </Button>
        </Link>
        <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
          Approval typically takes 24–48 hours
        </p>
      </div>
    )
  }

  // ───────────── Loading State ─────────────
  if (isLoadingDepartments || isLoadingRoles) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 py-8 text-center animate-fade-in">
        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <Loader2 className="h-7 w-7 text-white animate-spin" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Preparing form...
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Loading roles and departments
          </p>
        </div>
      </div>
    )
  }

  // ───────────── Main Form ─────────────
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 border border-blue-200 dark:border-blue-800">
          <p className="text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Shield className="h-3 w-3 flex-shrink-0" />
            All accounts require admin approval
          </p>
        </div>

        {/* ─── Personal Information ─── */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <User className="h-3.5 w-3.5" /> Personal Information
          </h3>

          {/* Row 1: First + Last */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="John"
                className={cn(
                  "w-full h-10",
                  (errors.firstName || serverErrors.firstName)
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Doe"
                className={cn(
                  "w-full h-10",
                  (errors.lastName || serverErrors.lastName)
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

          {/* Row 2: Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  placeholder="john.doe@school.com"
                  className={cn(
                    "w-full pl-10 h-10",
                    (errors.email || serverErrors.email)
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="tel"
                  placeholder="+254 712 345 678"
                  className={cn(
                    "w-full pl-10 h-10",
                    (errors.phone || serverErrors.phone)
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
          </div>

          {/* Row 3: Role + Department (Department only shows when needed) */}
          <div className={cn("grid gap-3", requiresDepartment ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                  "w-full h-10",
                  (errors.role || serverErrors.role)
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                )}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles?.length ? (
                    availableRoles.map((role: any) => (
                      <SelectItem key={`role-${role.id}`} value={role.name}>
                        {role.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FieldError field="role" />
            </div>

            {requiresDepartment && (
              <div className="animate-fade-in">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                    "w-full h-10",
                    (errors.department || serverErrors.department)
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  )}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.length ? (
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
          </div>
        </div>

        {/* ─── Security ─── */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" /> Security
          </h3>

          {/* Password + Confirm side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn(
                    "w-full pr-10 h-10",
                    (errors.password || serverErrors.password)
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError field="password" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn(
                    "w-full pr-10 h-10",
                    (errors.confirmPassword || serverErrors.confirmPassword)
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError field="confirmPassword" />
            </div>
          </div>

          {/* Password strength + rules — one compact row */}
          <div className="rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2.5">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Strength
                  </span>
                  <span className={cn(
                    "text-[10px] font-semibold",
                    passwordStrength.label === 'Weak' && 'text-red-500',
                    passwordStrength.label === 'Fair' && 'text-yellow-500',
                    passwordStrength.label === 'Good' && 'text-blue-500',
                    passwordStrength.label === 'Strong' && 'text-green-500',
                    passwordStrength.label === 'None' && 'text-slate-400',
                  )}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-300", passwordStrength.color)}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] flex-shrink-0">
                <span className={cn("flex items-center gap-1", /.{8,}/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-400")}>
                  <CheckCircle className="h-3 w-3" /> 8+
                </span>
                <span className={cn("flex items-center gap-1", /[A-Z]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-400")}>
                  <CheckCircle className="h-3 w-3" /> A-Z
                </span>
                <span className={cn("flex items-center gap-1", /[a-z]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-400")}>
                  <CheckCircle className="h-3 w-3" /> a-z
                </span>
                <span className={cn("flex items-center gap-1", /\d/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-slate-400")}>
                  <CheckCircle className="h-3 w-3" /> 0-9
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Terms & Submit ─── */}
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-white/20 dark:bg-white/5"
                checked={formData.agree_terms}
                onChange={(e) => setFormData({ ...formData, agree_terms: e.target.checked })}
                disabled={isLoadingState}
              />
              <label htmlFor="terms" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank">
                  Terms
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Back to login */}
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors group self-start sm:self-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1 transition-transform group-hover:-translate-x-1" />
              Back to login
            </Link>
          </div>
          <FieldError field="agree_terms" />

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all"
            disabled={isLoadingState}
          >
            {isLoadingState ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </div>
            )}
          </Button>
        </div>
      </form>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping-slow {
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes shake {
          0%, 25%, 50%, 75%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-ping-slow { animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  )
}
