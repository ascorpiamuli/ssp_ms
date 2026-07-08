// app/(auth)/reset-password/page.tsx

'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Key,
  Loader2,
  Building2,
  Shield,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Create a separate component that uses useSearchParams
function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState('')
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const email = searchParams.get('email')
  const token = searchParams.get('token')

  // Validate token on mount (simulated)
  useEffect(() => {
    const validateToken = async () => {
      if (!email || !token) {
        setIsValidToken(false)
        setIsValidating(false)
        setApiError('Missing email or token parameter')
        return
      }

      // Simulate token validation
      setTimeout(() => {
        // For demo purposes, accept any token with length > 10
        if (token.length > 10) {
          setIsValidToken(true)
        } else {
          setIsValidToken(false)
          setApiError('Invalid or expired reset link')
        }
        setIsValidating(false)
      }, 1500)
    }

    validateToken()
  }, [email, token])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setApiError('')

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 2000)
  }

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

  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
  }

  // Loading state
  if (isValidating) {
    return (
      <div className="text-center space-y-6 py-8 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-bold tracking-wider uppercase">SSPMS</span>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Validating your reset link...</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Please wait while we verify your request</p>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-bold tracking-wider uppercase">SSPMS</span>
        </div>

        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Invalid Reset Link</h2>
          <p className="text-slate-600 dark:text-slate-400">
            {apiError || 'This password reset link is invalid or has expired.'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Password reset links expire after 60 minutes for security reasons.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-left border border-amber-200 dark:border-amber-800">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">Common issues:</h3>
          <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>The link may have expired (they're only valid for 60 minutes)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>The link might have been used already</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Check if you copied the complete link</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3 pt-4">
          <Link
            href="/forgot-password"
            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 text-center"
          >
            Request New Reset Link
          </Link>

          <Link
            href="/login"
            className="block text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="inline h-4 w-4 mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-bold tracking-wider uppercase">SSPMS</span>
        </div>

        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-ping-slow bg-emerald-400/30 dark:bg-emerald-500/30" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <Check className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
            Password Reset Successfully!
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your password has been updated. You'll be redirected to the login page in a moment.
          </p>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: '100%', animation: 'progress 3s linear forwards' }}
          />
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go to login now
          </Link>
        </div>

        <style jsx>{`
          @keyframes ping-slow {
            75%, 100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
          .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          @keyframes progress {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
        `}</style>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-bold tracking-wider uppercase">SSPMS</span>
        </div>
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/20 rounded-full flex items-center justify-center">
            <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 bg-clip-text text-transparent">
          Set New Password
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Create a new password for your account
        </p>
        {email && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            for <span className="font-medium text-blue-600 dark:text-blue-400">{email}</span>
          </p>
        )}
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
            {apiError}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={cn(
                "pl-10 pr-10 transition-all duration-200",
                errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-2 focus:ring-blue-500/20"
              )}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Password strength:</span>
                <span className={cn(
                  "text-xs font-medium",
                  passwordStrength.label === 'Weak' && "text-red-500",
                  passwordStrength.label === 'Fair' && "text-yellow-500",
                  passwordStrength.label === 'Good' && "text-blue-500",
                  passwordStrength.label === 'Strong' && "text-green-500"
                )}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    passwordStrength.color
                  )}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
            </div>
          )}

          {errors.password && (
            <p className="text-xs text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              {errors.password}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={cn(
                "pl-10 pr-10 transition-all duration-200",
                errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "focus:ring-2 focus:ring-blue-500/20"
              )}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value })
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
              }}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-3">Password must contain:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li className={cn(
              "flex items-center text-xs",
              /.{8,}/.test(formData.password)
                ? "text-green-600 dark:text-green-400"
                : "text-slate-500 dark:text-slate-400"
            )}>
              <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>At least 8 characters</span>
            </li>
            <li className={cn(
              "flex items-center text-xs",
              /[A-Z]/.test(formData.password)
                ? "text-green-600 dark:text-green-400"
                : "text-slate-500 dark:text-slate-400"
            )}>
              <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>One uppercase letter</span>
            </li>
            <li className={cn(
              "flex items-center text-xs",
              /[a-z]/.test(formData.password)
                ? "text-green-600 dark:text-green-400"
                : "text-slate-500 dark:text-slate-400"
            )}>
              <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>One lowercase letter</span>
            </li>
            <li className={cn(
              "flex items-center text-xs",
              /\d/.test(formData.password)
                ? "text-green-600 dark:text-green-400"
                : "text-slate-500 dark:text-slate-400"
            )}>
              <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>One number</span>
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Resetting Password...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Key className="h-4 w-4 mr-2" />
              Reset Password
            </div>
          )}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          href="/login"
          className="text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 inline-flex items-center transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>
      </div>

      {/* Security Note */}
      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3" />
          This is a secure area. Your password will be encrypted.
        </p>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

// Main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="text-center space-y-6 py-8 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-bold tracking-wider uppercase">SSPMS</span>
        </div>
        <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto animate-spin" />
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
