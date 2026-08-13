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
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
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
  const [isSupplier, setIsSupplier] = useState(false)
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Check if supplier profile exists
  const {
    exists: supplierProfileExists,
    isLoading: isCheckingSupplierProfile,
    isError: isProfileCheckError,
    error: profileCheckError,
    refetch: refetchProfile,
  } = useSupplierProfileExists()

  // Memoized values
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
    if (authLoading || isCheckingRole || isCheckingSupplierProfile || !isAuthenticated || !user || !isSupplier) {
      return
    }

    if (isOnAuthPage) return

    if (!supplierProfileExists && !isOnProfileSetupPage) {
      setIsNavigating(true)
      router.push('/profile-setup')
      setTimeout(() => setIsNavigating(false), 500)
      return
    }

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

  // Handle retry
  const handleRetryProfileCheck = useCallback(() => {
    refetchProfile()
  }, [refetchProfile])

  // Handle sidebar toggle
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  // Loading states
  if (authLoading || isCheckingRole || isCheckingSupplierProfile || isNavigating) {
    return <CenteredLoading />
  }

  if (!isAuthenticated) {
    return null
  }

  // Error state
  if (isProfileCheckError && isSupplier && !isOnAuthPage) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
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

  // Profile setup required
  const isSupplierWithMissingProfile = isSupplier && !supplierProfileExists && !isOnProfileSetupPage
  if (isSupplierWithMissingProfile) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
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

  // Full dashboard
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
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
            className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-950 relative"
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
            <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-t from-gray-50 dark:from-gray-950 via-transparent to-transparent" />
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
