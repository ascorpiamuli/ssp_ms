'use client'

import { AuthProvider, useAuthContext } from '@/contexts/AuthContext'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardFooter } from '@/components/dashboard/footer'
import { LoadingSpinner } from '../../components/ui/loading'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSuppliers } from '@/hooks/useSuppliers'

function DashboardContent({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
  } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()
  const { useSupplierProfileExists } = useSuppliers()

  // Local state
  const [isSupplier, setIsSupplier] = useState(false)
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)

  // Check if supplier profile exists using React Query
  const {
    exists: supplierProfileExists,
    isLoading: isCheckingSupplierProfile,
    isError: isProfileCheckError,
    error: profileCheckError,
    refetch: refetchProfile,
  } = useSupplierProfileExists()

  // Memoized values for better performance
  const currentPath = useMemo(() => pathname || (typeof window !== 'undefined' ? window.location.pathname : ''), [pathname])

  const isOnProfileSetupPage = useMemo(() => currentPath.startsWith('/profile-setup'), [currentPath])
  const isOnAuthPage = useMemo(() =>
    currentPath.startsWith('/login') ||
    currentPath.startsWith('/register') ||
    currentPath.startsWith('/forgot-password') ||
    currentPath.startsWith('/reset-password'),
    [currentPath]
  )

  // Check if user is a supplier
  useEffect(() => {
    if (user) {
      const isSupplierRole = user.roles?.some((role: string) =>
        role.toLowerCase() === 'supplier'
      ) || false
      setIsSupplier(isSupplierRole)
    }
    setIsCheckingRole(false)
  }, [user])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Handle supplier profile redirects
  useEffect(() => {
    // Skip if still loading or not a supplier
    if (authLoading || isCheckingRole || isCheckingSupplierProfile || !isAuthenticated || !user || !isSupplier) {
      return
    }

    // Don't redirect on auth pages
    if (isOnAuthPage) {
      return
    }

    // If profile doesn't exist and not on profile setup page
    if (!supplierProfileExists && !isOnProfileSetupPage) {
      setIsNavigating(true)
      router.push('/profile-setup')
      setTimeout(() => setIsNavigating(false), 500)
      return
    }

    // If profile exists and on profile setup page
    if (supplierProfileExists && isOnProfileSetupPage) {
      setIsNavigating(true)
      router.push('/dashboard')
      setTimeout(() => setIsNavigating(false), 500)
      return
    }
  }, [
    authLoading,
    isCheckingRole,
    isCheckingSupplierProfile,
    isAuthenticated,
    user,
    isSupplier,
    supplierProfileExists,
    isOnProfileSetupPage,
    isOnAuthPage,
    router,
  ])

  // Handle profile check error - show retry option
  const handleRetryProfileCheck = useCallback(() => {
    refetchProfile()
  }, [refetchProfile])

  // Show loading while checking auth or role
  if (authLoading || isCheckingRole || isCheckingSupplierProfile || isNavigating) {
    return <LoadingSpinner />
  }

  // Not authenticated - return null (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Check if supplier profile is missing and we're not on profile setup
  const isSupplierWithMissingProfile = isSupplier && !supplierProfileExists && !isOnProfileSetupPage

  // If profile check failed with error, show error state
  if (isProfileCheckError && isSupplier && !isOnAuthPage) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto lg:px-8">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md mx-auto p-6">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Profile Check Failed
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    We couldn't verify your supplier profile. Please try again.
                  </p>
                  <button
                    onClick={handleRetryProfileCheck}
                    className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </main>
          <DashboardFooter />
        </div>
      </div>
    )
  }

  // Block navigation if supplier profile doesn't exist and not on profile setup
  if (isSupplierWithMissingProfile) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto lg:px-8">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md mx-auto p-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Supplier Profile Required
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Please complete your supplier profile to access this page and start receiving procurement opportunities.
                  </p>
                  <button
                    onClick={() => router.push('/profile-setup')}
                    className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </main>
          <DashboardFooter />
        </div>
      </div>
    )
  }

  // Render full dashboard
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto lg:px-8">
            {children}
          </div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  )
}

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  )
}
