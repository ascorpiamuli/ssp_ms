// src/components/dashboard/header.tsx

"use client"

import { Button } from '@/components/ui/button'
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  Search,
  Building2,
  Sparkles,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Info,
  TrendingUp,
  Zap,
  Award,
  Shield,
  Users,
  Calendar,
  BarChart3,
  Gift,
  Star,
  Crown,
  Diamond,
  Flame,
  Rocket,
  ArrowRight,
  Tag,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSuppliers } from '@/hooks/useSuppliers'
import { Input } from '@/components/ui/input'
import { Supplier } from '@/services/supplier.service'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInDown = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
  transition: { duration: 0.2 }
}

const slideIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
}

// ============================================
// TYPES
// ============================================

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  icon?: React.ReactNode
}

// ============================================
// THEME TOGGLER COMPONENT
// ============================================

const ThemeToggler = () => {
  const { theme, setTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="relative rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors w-9 h-9 overflow-hidden"
      >
        <motion.div
          className="relative w-5 h-5"
          initial={false}
          animate={{
            rotate: theme === 'dark' ? 360 : 0,
          }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 10
          }}
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: theme === 'dark' ? 0 : 1,
              rotate: theme === 'dark' ? 180 : 0,
              scale: theme === 'dark' ? 0 : 1,
            }}
            transition={{ duration: 0.4 }}
          >
            <Sun className={cn(
              "h-5 w-5 transition-colors",
              isHovered ? "text-amber-500" : "text-gray-600 dark:text-gray-400"
            )} />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: theme === 'dark' ? 1 : 0,
              rotate: theme === 'dark' ? 0 : -180,
              scale: theme === 'dark' ? 1 : 0,
            }}
            transition={{ duration: 0.4 }}
          >
            <Moon className={cn(
              "h-5 w-5 transition-colors",
              isHovered ? "text-blue-400" : "text-gray-400 dark:text-gray-300"
            )} />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-purple-400/0"
          animate={{
            background: isHovered
              ? theme === 'dark'
                ? 'radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle at center, rgba(251,191,36,0.15) 0%, transparent 70%)'
              : 'transparent'
          }}
          transition={{ duration: 0.3 }}
        />
      </Button>
    </motion.div>
  )
}

// ============================================
// NOTIFICATION ITEM COMPONENT
// ============================================

const NotificationItem = ({
  notification,
  onClick,
}: {
  notification: Notification
  onClick: () => void
}) => {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800/30',
          iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
          dot: 'bg-blue-500',
        }
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800/30',
          iconBg: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
          dot: 'bg-green-500',
        }
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800/30',
          iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
          dot: 'bg-amber-500',
        }
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800/30',
          iconBg: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
          dot: 'bg-red-500',
        }
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800/50',
          border: 'border-gray-200 dark:border-gray-700',
          iconBg: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
          dot: 'bg-gray-500',
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <motion.div
      variants={slideIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 border-l-4",
        !notification.read ? `border-l-blue-500 ${styles.bg}` : "border-l-transparent",
        "hover:scale-[1.01] hover:shadow-sm"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={cn(
            "mt-0.5 p-1.5 rounded-full transition-all duration-200",
            styles.iconBg
          )}
        >
          {notification.icon || <Info className="h-3.5 w-3.5" />}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {notification.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-400">{notification.time}</span>
            {!notification.read && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn("ml-auto h-2 w-2 rounded-full", styles.dot)}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// ROLE HELPERS
// ============================================

/**
 * Get role color based on role name (not label)
 * Role names are used for matching/colors as they won't be modified
 */
const getRoleColorByName = (roleName: string) => {
  const name = roleName?.toUpperCase() || ''

  switch (name) {
    case 'ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'SUPER_ADMIN': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'HOD': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'ACCOUNTANT': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'HEAD OF INSTITUTION':
    case 'PRINCIPAL': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'FINAL_APPROVER': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'PROCUREMENT': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    case 'SUPPLIER': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'AUDITOR': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
    case 'STAFF': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    case 'BISHOP': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

/**
 * Get display label for a role (use label if available, fallback to formatted name)
 */
const getDisplayLabel = (roleName: string, roleLabel: string | null) => {
  if (roleLabel) return roleLabel

  // Fallback: format the role name
  const name = roleName?.toUpperCase() || ''
  switch (name) {
    case 'ADMIN': return 'Administrator'
    case 'SUPER_ADMIN': return 'Super Administrator'
    case 'HOD': return 'Head of Department'
    case 'ACCOUNTANT': return 'Accountant'
    case 'HEAD OF INSTITUTION': return 'Head of Institution'
    case 'PRINCIPAL': return 'Principal'
    case 'FINAL_APPROVER': return 'Final Approver'
    case 'PROCUREMENT': return 'Procurement Officer'
    case 'SUPPLIER': return 'Supplier'
    case 'AUDITOR': return 'Auditor'
    case 'STAFF': return 'Staff'
    case 'BISHOP': return 'Bishop'
    default: return roleName || 'User'
  }
}

/**
 * Check if user has a specific role by name
 */
const hasRoleByName = (roles: string[], roleName: string) => {
  return roles.some(r => r.toUpperCase() === roleName.toUpperCase())
}

// ============================================
// MAIN HEADER COMPONENT
// ============================================

export function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const {
    user,
    logout,
    profilePercentage,
  } = useAuthContext()
  const { useSupplierProfileExists } = useSuppliers()
  const { exists: supplierExists, supplier: supplierData } = useSupplierProfileExists()

  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [mounted, setMounted] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const supplier = supplierData as unknown as Supplier | null

  // Demo notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Tender Opportunity',
      message: 'A new tender opportunity matching your category has been posted. Submit your bid before the deadline.',
      time: '2 minutes ago',
      type: 'info',
      read: false,
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: '2',
      title: 'Bid Shortlisted',
      message: 'Your bid for "Office Supplies Procurement 2026" has been shortlisted for the next evaluation phase.',
      time: '1 hour ago',
      type: 'success',
      read: false,
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      id: '3',
      title: 'Profile Verified',
      message: 'Your supplier profile has been verified successfully. You can now access all procurement opportunities.',
      time: '3 hours ago',
      type: 'success',
      read: true,
      icon: <Award className="h-4 w-4" />,
    },
    {
      id: '4',
      title: 'Document Expiring Soon',
      message: 'Your tax compliance certificate will expire in 30 days. Please upload a new certificate.',
      time: '1 day ago',
      type: 'warning',
      read: true,
      icon: <AlertCircle className="h-4 w-4" />,
    },
    {
      id: '5',
      title: 'New Message',
      message: 'You have received a new message from the Procurement Department regarding your recent bid.',
      time: '2 days ago',
      type: 'info',
      read: true,
      icon: <Mail className="h-4 w-4" />,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const getUserInitials = () => {
    const fullName = user?.full_name || 'User'
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getAvatarColors = () => {
    const fullName = user?.full_name || 'User'
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
      'from-orange-500 to-orange-600',
      'from-cyan-500 to-cyan-600',
      'from-amber-500 to-amber-600',
    ]
    const index = fullName.length % colors.length
    return colors[index]
  }

  const getAvatarUrl = () => {
    if ((user as any)?.avatar_url) {
      return (user as any).avatar_url
    }
    if ((user as any)?.avatar) {
      return (user as any).avatar
    }
    return null
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
  }

  // ============================================
  // ROLE DATA EXTRACTION - Using role names for matching
  // ============================================

  const avatarColors = getAvatarColors()
  const avatarUrl = getAvatarUrl()

  // Get user's roles from the user object
  const userRoles = user?.roles || []
  const primaryRoleName = userRoles.length > 0 ? userRoles[0] : ''
  const primaryRoleLabel = (user as any)?.role_label || null
  const primaryRoleDescription = (user as any)?.role_description || null

  // Get role details if available
  const roleDetails = (user as any)?.role_details || []

  // Determine if user is a supplier by role name
  const isSupplier = hasRoleByName(userRoles, 'SUPPLIER')

  // Get the role color based on role name (not label)
  const roleColor = getRoleColorByName(primaryRoleName)

  // Get display label (use label if available, fallback to formatted name)
  const displayName = getDisplayLabel(primaryRoleName, primaryRoleLabel)

  // Build all roles with their labels and descriptions
  const allRolesWithDetails = roleDetails.length > 0
    ? roleDetails.map((role: any) => ({
      name: role.name,
      label: role.label || null,
      description: role.description || null,
      color: getRoleColorByName(role.name),
      displayLabel: getDisplayLabel(role.name, role.label),
    }))
    : userRoles.map((roleName: string) => ({
      name: roleName,
      label: null,
      description: null,
      color: getRoleColorByName(roleName),
      displayLabel: getDisplayLabel(roleName, null),
    }))

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-800/95 px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </header>
    )
  }

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-4 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20"
    >
      {/* Left section - Logo/Brand and Menu button */}
      <motion.div
        className="flex items-center gap-3 flex-shrink-0"
        variants={staggerContainer}
      >
        {onMenuClick && (isMobile || isTablet) && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
        <motion.div
          className="hidden sm:flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-15 w-auto flex items-center justify-center">
              <img
                src="/images/pasbest-logo.png"
                alt="SSPMS Logo"
                className="h-full w-auto object-fit"
              />
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Search Bar - Centered */}
      <motion.div
        className="hidden md:flex flex-1 max-w-2xl mx-4"
        ref={searchRef}
        variants={fadeInDown}
      >
        <div className="relative w-full group">
          <Search className={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-300",
            isSearchFocused ? "text-blue-500" : "text-gray-400"
          )} />
          <Input
            type="text"
            placeholder="Search for tenders, suppliers, documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={cn(
              "w-full pl-9 pr-4 h-9 rounded-xl border-gray-200/50 bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700/50 transition-all duration-300",
              "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
              "group-hover:shadow-md group-hover:shadow-blue-500/5",
              isSearchFocused && "shadow-lg shadow-blue-500/10 scale-[1.02]"
            )}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                <p>Search results for "{searchQuery}"</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Right section - Actions */}
      <motion.div
        className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
        variants={staggerContainer}
      >
        {/* Search button for mobile */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Theme Toggler */}
        <ThemeToggler />

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/30"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeInDown}
                className={cn(
                  "absolute mt-2 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 z-50 max-h-[500px] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50",
                  isMobile
                    ? "fixed left-4 right-4 top-auto w-auto"
                    : "right-0 w-[420px]"
                )}
                style={isMobile ? { top: '4rem' } : {}}
              >
                <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-lg transition-colors"
                      >
                        Mark all read
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  <AnimatePresence>
                    {notifications.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No notifications</p>
                        <p className="text-xs mt-1">We'll notify you when something arrives</p>
                      </motion.div>
                    ) : (
                      notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onClick={() => handleNotificationClick(notification)}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>

                <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                  <Link
                    href="/notifications"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications
                    <ArrowRight className="inline-block ml-1 h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 sm:px-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="relative">
                <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-gray-700 shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/20 transition-shadow">
                  {avatarUrl ? (
                    <AvatarImage
                      src={avatarUrl}
                      alt={user?.full_name || 'User'}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className={cn(
                    "bg-gradient-to-r text-white font-medium text-sm",
                    avatarColors
                  )}>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {profilePercentage < 100 && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-amber-400 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <span className="text-[6px] font-bold text-white">!</span>
                  </div>
                )}
              </div>
              {!isMobile && (
                <>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[120px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {user?.full_name || 'User'}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                        {displayName}
                      </span>
                      {primaryRoleDescription && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                          <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[80px]">
                            {primaryRoleDescription.length > 20
                              ? primaryRoleDescription.substring(0, 20) + '...'
                              : primaryRoleDescription}
                          </span>
                        </>
                      )}
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="text-xs text-green-500 dark:text-green-400">
                        ● Online
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </>
              )}
            </Button>
          </motion.div>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeInDown}
                className={cn(
                  "absolute mt-2 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 z-50 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden",
                  isMobile
                    ? "fixed left-4 right-4 top-auto w-auto"
                    : "right-0 w-96"
                )}
                style={isMobile ? { top: '4rem' } : {}}
              >
                <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-5">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Avatar className="h-16 w-16 ring-4 ring-blue-100 dark:ring-blue-900/30 shadow-xl">
                        {avatarUrl ? (
                          <AvatarImage
                            src={avatarUrl}
                            alt={user?.full_name || 'User'}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className={cn(
                          "bg-gradient-to-r text-white font-bold text-xl",
                          avatarColors
                        )}>
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {user?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {allRolesWithDetails.map((role:any, index: number) => (
                          <motion.div
                            key={role.name}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group"
                          >
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-help",
                              role.color
                            )}>
                              {role.displayLabel}
                            </span>
                            {role.description && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {role.description}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Primary Role Description */}
                  {primaryRoleDescription && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {primaryRoleDescription}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Supplier Company Info */}
                  {isSupplier && supplierExists && supplier && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl border border-orange-200/30 dark:border-orange-800/30"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {supplier.company_name || 'Company Name'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span>Category: {supplier.category || 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>Status: {supplier.status || 'N/A'}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Profile completion */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-500 dark:text-gray-400">Profile Completion</span>
                      <motion.span
                        key={profilePercentage}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="font-bold text-gray-700 dark:text-gray-300"
                      >
                        {profilePercentage}%
                      </motion.span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${profilePercentage}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/25"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  {[
                    { icon: User, label: 'Your Profile', href: '/settings/profile', color: 'text-blue-500' },
                    { icon: Settings, label: 'Settings', href: '/settings', color: 'text-gray-500' },
                    { icon: Shield, label: 'Security', href: '/settings/security', color: 'text-purple-500' },
                    { icon: HelpCircle, label: 'Help & Support', href: '/help', color: 'text-cyan-500' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={() => setShowProfile(false)}
                      >
                        <item.icon className={cn("h-4 w-4", item.color)} />
                        <span>{item.label}</span>
                        <ArrowRight className="ml-auto h-3 w-3 text-gray-400" />
                      </Link>
                    </motion.div>
                  ))}

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                      <ArrowRight className="ml-auto h-3 w-3 text-red-400" />
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {showSearch && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 shadow-2xl border-b border-gray-200 dark:border-gray-700"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for tenders, suppliers, documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-12 rounded-xl border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-base"
                autoFocus
              />
              <button
                onClick={() => setShowSearch(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
