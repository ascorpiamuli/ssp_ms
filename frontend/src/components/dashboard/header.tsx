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
  User
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast-context'

export function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const {
    user,
    logout,
    profilePercentage,
  } = useAuthContext()
  const { success, error: toastError } = useToast()
  const [showProfile, setShowProfile] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)

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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    // Use the name to pick a consistent color
    const index = fullName.length % colors.length
    return colors[index]
  }

  // Get user role badge color
  const getRoleColor = () => {
    const role = user?.role?.toLowerCase()
    switch (role) {
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
    const role = user?.role?.toLowerCase()
    switch (role) {
      case 'admin': return 'Administrator'
      case 'staff': return 'Staff'
      case 'hod': return 'Head of Department'
      case 'accountant': return 'Accountant'
      case 'principal': return 'Head of Institution'
      case 'final_approver': return 'Final Approver'
      case 'procurement': return 'Procurement Officer'
      case 'supplier': return 'Supplier'
      case 'auditor': return 'Auditor'
      default: return user?.role || 'User'
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      success('Logged out successfully', 3000)
    } catch (error) {
      console.error('Logout failed:', error)
      toastError('Failed to logout')
    }
  }

  const avatarColors = getAvatarColors()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 px-4 shadow-sm">
      {/* Left section - Logo/Brand and Menu button */}
      <div className="flex items-center gap-3">
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
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
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

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 sm:px-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className={cn(
              "h-8 w-8 rounded-full bg-gradient-to-r flex items-center justify-center text-white font-medium overflow-hidden ring-2 ring-white dark:ring-gray-700",
              avatarColors
            )}>
              <span className="text-sm font-bold">{getUserInitials()}</span>
            </div>
            {!isMobile && (
              <>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                    {user?.full_name  || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400" />
              </>
            )}
          </Button>

          {showProfile && (
            <div className={cn(
              "absolute mt-2 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700 z-50",
              isMobile
                ? "fixed left-4 right-4 top-auto w-auto"
                : "right-0 w-80"
            )}
              style={isMobile ? { top: '4rem' } : {}}>
              <div className="border-b border-gray-200 dark:border-gray-600 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-full bg-gradient-to-r flex items-center justify-center text-white font-medium overflow-hidden",
                    avatarColors
                  )}>
                    <span className="text-base font-bold">{getUserInitials()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.full_name  || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                    <div className="mt-1.5">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", getRoleColor())}>
                        {getRoleDisplayName()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile completion */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Profile Completion</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{profilePercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full transition-all duration-300"
                      style={{ width: `${profilePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Your Profile</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>

                <Link
                  href="/help"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Support</span>
                </Link>

                <div className="border-t border-gray-200 dark:border-gray-600 my-2" />

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
    </header>
  )
}
