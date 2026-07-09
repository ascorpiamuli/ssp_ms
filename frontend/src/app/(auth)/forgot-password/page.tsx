// app/(auth)/forgot-password/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, AlertCircle, ArrowLeft, Send, CheckCircle, Key, Clock, Shield, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthContext } from '@/contexts/AuthContext'

export default function ForgotPasswordPage() {
  const { user, forgotPassword, isLoading: authLoading } = useAuthContext()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [attemptCount, setAttemptCount] = useState(0)
  const [rateLimited, setRateLimited] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard'
    }
  }, [user])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const validateEmail = () => {
    if (!email) {
      setError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rateLimited) {
      setError('Too many attempts. Please try again later.')
      return
    }

    if (!validateEmail()) return

    setIsLoading(true)
    setError('')

    try {
      // The hook handles the toast - we just handle UI state
      await forgotPassword({ email })

      // If we get here without error, it was successful
      setIsSubmitted(true)
      setAttemptCount(prev => prev + 1)

      // If multiple attempts, add cooldown
      if (attemptCount >= 2) {
        setResendCooldown(60)
        setRateLimited(true)
        setTimeout(() => setRateLimited(false), 5 * 60 * 1000)
      }
    } catch (err: any) {
      // The hook already shows a toast for errors
      // We just show inline error for UI feedback
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        'Failed to send reset link. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setError('')
    setIsLoading(true)

    try {
      // Hook handles toast
      await forgotPassword({ email })
      setResendCooldown(60)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        'Failed to resend. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAnother = () => {
    setIsSubmitted(false)
    setEmail('')
    setError('')
    setAttemptCount(0)
    setRateLimited(false)
    setResendCooldown(0)
  }

  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
  }

  // Loading state
  if (isLoading && !isSubmitted) {
    return (
      <div className="space-y-8 animate-fade-in max-w-md mx-auto text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-full flex items-center justify-center shadow-xl">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Sending Reset Link</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Please wait while we process your request...</p>
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

  if (isSubmitted) {
    return (
      <div className="space-y-8 animate-fade-in max-w-md mx-auto">
        {/* Success Section */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full animate-ping-slow bg-emerald-400/30 dark:bg-emerald-500/30" />
            <div className="absolute inset-0 rounded-full animate-ping-slower bg-emerald-400/20 dark:bg-emerald-500/20" />
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
              Check Your Email
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We've sent a password reset link to
            </p>
            <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 break-all">
                {email}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Click the Reset Link</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Open the email and click the secure link to reset your password
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Quick Action Required</h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  The link will expire in 60 minutes for your security
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Check Spam Folder</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                  If you don't see the email, please check your spam/junk folder
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleTryAnother}
            variant="outline"
            className="w-full border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
          >
            <Mail className="h-4 w-4 mr-2" />
            Try another email
          </Button>

          <Link
            href="/login"
            className="block text-center text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft className="inline h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Back to login
          </Link>
        </div>

        {/* Resend - NO TOAST HERE, just UI */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Didn't receive the email?{' '}
          <button
            onClick={handleResend}
            disabled={isLoading || resendCooldown > 0}
            className={cn(
              "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors",
              (isLoading || resendCooldown > 0) && "opacity-50 cursor-not-allowed hover:no-underline"
            )}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Click here to resend'}
          </button>
        </p>

        {/* Inline error - displayed when hook throws */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              {error}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-md mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-bold tracking-wider uppercase">SSPMIS</span>
        </div>

        <div className="relative inline-block">
          <div className="absolute inset-0 rounded-full animate-ping-slow bg-blue-400/30 dark:bg-blue-500/30" />
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110">
            <Key className="h-10 w-10 text-white" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 bg-clip-text text-transparent">
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Don't worry! We'll help you reset your password
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
            <Input
              id="email"
              type="email"
              placeholder="john.doe@school.com"
              className={cn(
                "pl-10 transition-all duration-200",
                error
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 group-hover:border-blue-300"
              )}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
                if (rateLimited) setRateLimited(false)
              }}
              disabled={isLoading || authLoading}
              autoComplete="email"
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 flex items-center mt-1 animate-shake">
              <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-semibold">60 min expiry</span>
                <br />
                Link expires for security
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                <span className="font-semibold">Secure reset</span>
                <br />
                One-time use only
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
          disabled={isLoading || rateLimited || authLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Sending reset link...
            </div>
          ) : rateLimited ? (
            <div className="flex items-center justify-center">
              <Clock className="h-4 w-4 mr-2" />
              Too many attempts. Try again later.
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Send className="h-4 w-4 mr-2" />
              Send Reset Link
            </div>
          )}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>
      </div>

      {/* Help */}
      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Need assistance?{' '}
          <Link
            href="/support"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
          >
            Contact Support
          </Link>
        </p>
      </div>

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
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
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
