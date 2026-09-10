// src/components/dashboard/DashboardLayout.tsx

'use client'

import { AuthProvider, useAuthContext } from '@/contexts/AuthContext'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardFooter } from '@/components/dashboard/footer'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSuppliers } from '@/hooks/useSuppliers'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  RefreshCw,
  UserPlus,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../../lib/utils'

// ============================================
// CENTERED LOADING - Premium Animated Loader
// ============================================

const CenteredLoading = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="relative flex flex-col items-center gap-5">
      {/* Multi-ring loader */}
      <div className="relative">
        {/* Background ring */}
        <div className="w-16 h-16 rounded-full border-4 border-gray-100 dark:border-gray-800" />

        {/* Gradient spinning ring */}
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-transparent border-r-blue-500 border-b-indigo-500 border-l-purple-500 animate-spin" />

        {/* Inner pulsing dot */}
        <div className="absolute inset-[18px] w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse shadow-lg shadow-blue-500/25" />
      </div>

      {/* Loading text with gradient */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wider animate-pulse">
        Loading
      </p>
    </div>
  </div>
)

// ============================================
// ERROR STATE
// ============================================

interface ErrorStateProps {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

const ErrorState = ({
  title,
  message,
  actionLabel,
  onAction,
  icon
}: ErrorStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex-1 flex items-center justify-center p-6"
  >
    <div className="text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
        {icon || <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  </motion.div>
)

// ============================================
// PROFILE SETUP REQUIRED
// ============================================

const ProfileSetupRequired = ({ onComplete }: { onComplete: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex-1 flex items-center justify-center p-6"
  >
    <div className="text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/10">
        <Building2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Complete Your Profile
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
        To start receiving procurement opportunities and manage your supplier profile,
        please complete your business information.
      </p>
      <button
        onClick={onComplete}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        <UserPlus className="w-4 h-4" />
        Complete Profile
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
)

// ============================================
// DASHBOARD CONTENT
// ============================================

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
  const [isNavigating, setIsNavigating] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ============================================
  // ✅ FIX 1: Memoize path checks
  // ============================================

  const currentPath = useMemo(() => pathname || '', [pathname])

  const isOnProfileSetupPage = useMemo(() =>
    currentPath.startsWith('/profile-setup'),
    [currentPath]
  )

  const isOnAuthPage = useMemo(() =>
    currentPath.startsWith('/login') ||
    currentPath.startsWith('/register') ||
    currentPath.startsWith('/forgot-password') ||
    currentPath.startsWith('/reset-password'),
    [currentPath]
  )

  // ============================================
  // ✅ FIX 2: Memoize supplier check (NO API CALL YET)
  // ============================================

  const isUserSupplier = useMemo(() => {
    if (!user) return false
    return user.roles?.some((role: string) =>
      role.toLowerCase() === 'supplier'
    ) || false
  }, [user])

  // ============================================
  // ✅ FIX 3: Only call API if user is a supplier
  // ============================================

  const shouldCheckProfile = useMemo(() => {
    // Only check if:
    // 1. User is authenticated
    // 2. User is a supplier
    // 3. Not on auth pages
    return isAuthenticated && isUserSupplier && !isOnAuthPage
  }, [isAuthenticated, isUserSupplier, isOnAuthPage])

  // ============================================
  // ✅ FIX 4: Conditional hook with enabled option
  // ============================================

  const {
    exists: supplierProfileExists,
    isLoading: isCheckingSupplierProfile,
    isError: isProfileCheckError,
    error: profileCheckError,
    refetch: refetchProfile,
  } = useSupplierProfileExists({
    enabled: shouldCheckProfile,
  })

  // ============================================
  // ✅ FIX 5: Redirect to login if not authenticated
  // ============================================

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // ============================================
  // ✅ FIX 6: Handle supplier profile redirects (with proper guards)
  // ============================================

  useEffect(() => {
    // Don't run while loading or on auth pages
    if (authLoading || isCheckingSupplierProfile || !isAuthenticated || !user) {
      return
    }

    // Don't run on auth pages
    if (isOnAuthPage) return

    // Only check for suppliers
    if (!isUserSupplier) return

    // If supplier profile doesn't exist and we're not on profile setup page
    if (!supplierProfileExists && !isOnProfileSetupPage) {
      setIsNavigating(true)
      router.push('/profile-setup')
      setTimeout(() => setIsNavigating(false), 500)
      return
    }

    // If supplier profile exists and we're on profile setup page
    if (supplierProfileExists && isOnProfileSetupPage) {
      setIsNavigating(true)
      router.push('/dashboard')
      setTimeout(() => setIsNavigating(false), 500)
      return
    }
  }, [
    authLoading,
    isCheckingSupplierProfile,
    isAuthenticated,
    user,
    isUserSupplier,
    supplierProfileExists,
    isOnProfileSetupPage,
    isOnAuthPage,
    router,
  ])

  // ============================================
  // ✅ FIX 7: Handle retry with proper loading state
  // ============================================

  const handleRetryProfileCheck = useCallback(async () => {
    try {
      await refetchProfile()
    } catch (error) {
      console.error('Profile check retry failed:', error)
    }
  }, [refetchProfile])

  // ============================================
  // ✅ FIX 8: Handle sidebar toggle
  // ============================================

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  // ============================================
  // ✅ FIX 9: Loading states with proper conditions
  // ============================================

  // Auth loading
  if (authLoading) {
    return <CenteredLoading />
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Checking supplier profile (only for suppliers)
  if (isUserSupplier && isCheckingSupplierProfile) {
    return <CenteredLoading />
  }

  // Navigation in progress
  if (isNavigating) {
    return <CenteredLoading />
  }

  // ============================================
  // ✅ FIX 10: Error state - only for suppliers
  // ============================================

  if (isProfileCheckError && isUserSupplier && !isOnAuthPage) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <ErrorState
            title="Profile Verification Failed"
            message="We couldn't verify your supplier profile. This might be a temporary issue. Please try again or contact support if the problem persists."
            actionLabel="Retry Verification"
            onAction={handleRetryProfileCheck}
            icon={<AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />}
          />
          <DashboardFooter />
        </div>
      </div>
    )
  }

  // ============================================
  // ✅ FIX 11: Profile setup required - only for suppliers
  // ============================================

  const isSupplierWithMissingProfile = isUserSupplier && !supplierProfileExists && !isOnProfileSetupPage
  if (isSupplierWithMissingProfile) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <ProfileSetupRequired
            onComplete={() => router.push('/profile-setup')}
          />
          <DashboardFooter />
        </div>
      </div>
    )
  }

  // ============================================
  // ✅ FULL DASHBOARD - Render children
  // ============================================

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        sidebarCollapsed ? "ml-0" : "ml-0"
      )}>
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={currentPath}
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 40,
              rotateX: -10,
              filter: "blur(10px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateX: 0,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: -40,
              rotateX: 10,
              filter: "blur(10px)",
            }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.35, ease: "easeOut" },
              scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 0.4, ease: "easeOut" },
              rotateX: { duration: 0.4, ease: "easeOut" },
              filter: { duration: 0.35, ease: "easeOut" },
            }}
            className="flex-1 overflow-y-auto overflow-x-hidden bg-background relative"
          >
            {/* Ambient glow effect */}
            <motion.div
              className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <motion.div
              className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />

            {/* Content with staggered children */}
            <motion.div
              className="relative z-10"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="show"
            >
              {children}
            </motion.div>

            {/* Decorative scan line */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.05 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
              }}
            />

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent" />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================
// EXPORT
// ============================================

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
