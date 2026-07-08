'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Building2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthContext } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast-context'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading: authLoading, isAuthenticated } = useAuthContext()
  const { success, error } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  })
  const [serverError, setServerError] = useState<string | null>(null)

  // Prevent duplicate submissions
  const isSubmitting = useRef(false)

  // Check for redirect params
  const registered = searchParams?.get('registered')
  const reset = searchParams?.get('reset')

  useEffect(() => {
    // Show success messages from query params
    if (registered === 'true') {
      success('Registration successful! Please login to continue.', 5000)
    }
    if (reset === 'true') {
      success('Password reset successfully! Please login with your new password.', 5000)
    }
  }, [registered, reset, success])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const validateForm = () => {
    let valid = true
    const newErrors = { email: '', password: '' }

    if (!formData.email) {
      newErrors.email = 'Email is required'
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      valid = false
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent duplicate submissions
    if (isSubmitting.current || isLoadingState) {
      console.log('Login already in progress, skipping duplicate submission')
      return
    }

    setServerError(null)

    if (!validateForm()) return

    isSubmitting.current = true
    setIsLoading(true)

    try {
      await login(formData.email, formData.password, formData.rememberMe)
      // The redirect is handled in the auth context
    } catch (err: any) {
      // Handle specific error messages
      let errorMessage = err.message || 'Login failed. Please try again.'

      // Check for specific server errors
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      // Handle specific error cases
      if (errorMessage.toLowerCase().includes('pending admin approval')) {
        setServerError('Your account is pending admin approval. Please wait for confirmation.')
      } else if (errorMessage.toLowerCase().includes('deactivated')) {
        setServerError('Your account has been deactivated. Please contact the administrator.')
      } else if (errorMessage.toLowerCase().includes('invalid credentials')) {
        setServerError('Invalid email or password. Please try again.')
      } else {
        setServerError(errorMessage)
      }

      error(errorMessage, 5000)
    } finally {
      setIsLoading(false)
      // Reset submission flag after a short delay to prevent race conditions
      setTimeout(() => {
        isSubmitting.current = false
      }, 500)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value })
    if (errors.email) setErrors({ ...errors, email: '' })
    if (serverError) setServerError(null)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, password: e.target.value })
    if (errors.password) setErrors({ ...errors, password: '' })
    if (serverError) setServerError(null)
  }

  const isLoadingState = isLoading || authLoading

  return (
    <div className="space-y-6">
      {/* Header with SSPMS branding */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-semibold tracking-wider uppercase">SSPMS</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Sign in to manage school supplies & procurement
        </p>
      </div>

      {/* Form */}
      <div className="max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Server Error Display */}
          {serverError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="admin@school.com"
                className={cn(
                  "pl-10 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500",
                  errors.email && "border-red-500 focus-visible:ring-red-500"
                )}
                value={formData.email}
                onChange={handleEmailChange}
                disabled={isLoadingState}
                autoComplete="email"
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={cn(
                  "pl-10 pr-10 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500",
                  errors.password && "border-red-500 focus-visible:ring-red-500"
                )}
                value={formData.password}
                onChange={handlePasswordChange}
                disabled={isLoadingState}
                autoComplete="current-password"
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              disabled={isLoadingState}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
            disabled={isLoadingState}
            aria-label="Sign in to your account"
          >
            {isLoadingState ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </div>
            )}
          </Button>
        </form>
      </div>

      {/* Divider */}
      <div className="relative max-w-sm mx-auto">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white/95 dark:bg-slate-800/95 px-3 text-xs text-slate-500 dark:text-slate-400">
            Or continue with
          </span>
        </div>
      </div>

      {/* SSO Options */}
      <div className="max-w-sm mx-auto space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full relative flex items-center justify-center gap-3 py-5 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group"
          onClick={() => {
            error('Google SSO coming soon!', 3000)
          }}
          disabled={isLoadingState}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Continue with Google
          </span>
        </Button>
      </div>

      {/* Sign Up Link */}
      <div className="text-center text-sm">
        <span className="text-slate-600 dark:text-slate-400">Don't have an account? </span>
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Create one now
        </Link>
      </div>

      {/* System features */}
      <div className="max-w-sm mx-auto pt-2">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            Secure
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            Encrypted
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            24/7 Access
          </span>
        </div>
      </div>

      {/* Add animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
