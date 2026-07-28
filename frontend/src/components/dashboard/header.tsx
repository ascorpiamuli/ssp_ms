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

// Notification type
interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  icon?: React.ReactNode
}

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
  const { theme, setTheme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Cast supplier data to Supplier type
  const supplier = supplierData as unknown as Supplier | null

  // Demo notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Tender Opportunity',
      message: 'A new tender opportunity matching your category has been posted.',
      time: '2 minutes ago',
      type: 'info',
      read: false,
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: '2',
      title: 'Bid Status Updated',
      message: 'Your bid for "Office Supplies Procurement" has been shortlisted.',
      time: '1 hour ago',
      type: 'success',
      read: false,
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      id: '3',
      title: 'Profile Verification',
      message: 'Your supplier profile has been verified and is now active.',
      time: '3 hours ago',
      type: 'success',
      read: true,
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      id: '4',
      title: 'Document Upload Reminder',
      message: 'Please upload your latest tax compliance certificate.',
      time: '1 day ago',
      type: 'warning',
      read: true,
      icon: <AlertCircle className="h-4 w-4" />,
    },
    {
      id: '5',
      title: 'New Message',
      message: 'You have received a new message from Procurement Department.',
      time: '2 days ago',
      type: 'info',
      read: true,
      icon: <Mail className="h-4 w-4" />,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Close dropdowns when clicking outside
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

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    const fullName = user?.full_name || 'User'
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Generate avatar colors based on name
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

  // Get avatar URL
  const getAvatarUrl = () => {
    if ((user as any)?.avatar_url) {
      return (user as any).avatar_url
    }
    if ((user as any)?.avatar) {
      return (user as any).avatar
    }
    return null
  }

  // Get user role badge color
  const getRoleColor = () => {
    const roles = user?.roles || []
    const primaryRole = roles.length > 0 ? roles[0].toLowerCase() : ''

    switch (primaryRole) {
      case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'super_admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'hod': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'accountant': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'principal': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'final_approver': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
      case 'procurement': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
      case 'supplier': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'auditor': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
      case 'staff': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  // Get user role display name
  const getRoleDisplayName = () => {
    const roles = user?.roles || []
    const primaryRole = roles.length > 0 ? roles[0].toLowerCase() : ''

    switch (primaryRole) {
      case 'admin': return 'Administrator'
      case 'staff': return 'Staff'
      case 'hod': return 'Head of Department'
      case 'accountant': return 'Accountant'
      case 'principal': return 'Head of Institution'
      case 'final_approver': return 'Final Approver'
      case 'procurement': return 'Procurement Officer'
      case 'supplier': return 'Supplier'
      case 'auditor': return 'Auditor'
      case 'super_admin': return 'Super Administrator'
      default: return roles.length > 0 ? roles[0] : 'User'
    }
  }

  // Get all roles for display
  const getAllRoles = () => {
    const roles = user?.roles || []
    if (roles.length === 0) return ['User']
    return roles.map(role => {
      switch (role.toLowerCase()) {
        case 'admin': return 'Administrator'
        case 'staff': return 'Staff'
        case 'hod': return 'Head of Department'
        case 'accountant': return 'Accountant'
        case 'principal': return 'Head of Institution'
        case 'final_approver': return 'Final Approver'
        case 'procurement': return 'Procurement Officer'
        case 'supplier': return 'Supplier'
        case 'auditor': return 'Auditor'
        case 'super_admin': return 'Super Administrator'
        default: return role
      }
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
  }

  const avatarColors = getAvatarColors()
  const roles = user?.roles || []
  const allRoles = getAllRoles()
  const avatarUrl = getAvatarUrl()

  // Check if user is supplier
  const isSupplier = roles.some(r => r.toLowerCase() === 'supplier')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 px-4 shadow-sm">
      {/* Left section - Logo/Brand and Menu button */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {onMenuClick && (isMobile || isTablet) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="hidden sm:block">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            SSPMS
          </span>
        </div>
      </div>

      {/* Search Bar - Centered */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-4" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for tenders, suppliers, documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-9 rounded-lg border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Search button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative rounded-full"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className={cn(
              "absolute mt-2 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 z-50 max-h-[500px] overflow-y-auto",
              isMobile
                ? "fixed left-4 right-4 top-auto w-auto"
                : "right-0 w-[380px]"
            )}
              style={isMobile ? { top: '4rem' } : {}}>
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors",
                        !notification.read && "bg-blue-50 dark:bg-blue-900/10"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5 p-1.5 rounded-full",
                          notification.type === 'info' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                          notification.type === 'success' && 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                          notification.type === 'warning' && 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                          notification.type === 'error' && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                        )}>
                          {notification.icon || (
                            notification.type === 'info' && <Info className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">{notification.time}</span>
                            {!notification.read && (
                              <span className="ml-auto h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                <Link
                  href="/notifications"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  onClick={() => setShowNotifications(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 sm:px-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowProfile(!showProfile)}
          >
            <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-700">
              {avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={user?.full_name || 'User'}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className={cn(
                "bg-gradient-to-r text-white font-medium",
                avatarColors
              )}>
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {!isMobile && (
              <>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                    {getRoleDisplayName()}
                  </p>
                </div>
                <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400" />
              </>
            )}
          </Button>

          {showProfile && (
            <div className={cn(
              "absolute mt-2 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 z-50",
              isMobile
                ? "fixed left-4 right-4 top-auto w-auto"
                : "right-0 w-80"
            )}
              style={isMobile ? { top: '4rem' } : {}}>
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-blue-100 dark:ring-blue-900/30">
                    {avatarUrl ? (
                      <AvatarImage
                        src={avatarUrl}
                        alt={user?.full_name || 'User'}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className={cn(
                      "bg-gradient-to-r text-white font-medium text-base",
                      avatarColors
                    )}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {allRoles.map((role, index) => (
                        <span
                          key={index}
                          className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", getRoleColor())}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Supplier Company Info */}
                {isSupplier && supplierExists && supplier && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {supplier.company_name || 'Company Name'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Category: {supplier.category || 'N/A'} • Status: {supplier.status || 'N/A'}
                    </div>
                  </div>
                )}

                {/* Profile completion */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Profile Completion</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{profilePercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${profilePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Your Profile</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>

                <Link
                  href="/help"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Support</span>
                </Link>

                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showSearch && isMobile && (
        <div className="fixed inset-x-0 top-16 z-50 bg-white dark:bg-gray-800 p-4 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for tenders, suppliers, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-10 rounded-lg border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              autoFocus
            />
            <button
              onClick={() => setShowSearch(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
