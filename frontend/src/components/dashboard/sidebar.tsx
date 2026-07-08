"use client"

import { Logo } from '@/components/ui/logo'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Menu,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { cn } from '../../lib/utils'
import { useNavigation } from '@/hooks/useNavigation'

interface NavSectionProps {
  section: any
  collapsed: boolean
  isMobile?: boolean
  userRole: string
  openSections: Set<string>
  onToggleSection: (sectionId: string) => void
}

function NavSection({
  section,
  collapsed,
  isMobile = false,
  userRole,
  openSections,
  onToggleSection
}: NavSectionProps) {
  const pathname = usePathname()
  const isOpen = openSections.has(section.id)

  // Check if section has any visible items for this role and permissions
  const visibleItems = section.items.filter((item: any) => {
    // Check role-based access
    if (item.roles) {
      const hasRole = item.roles.some((role: string) =>
        role.toLowerCase() === userRole?.toLowerCase()
      )
      if (!hasRole) return false
    }


    // Check min role level
    if (item.minRole) {
      const roleLevels: Record<string, number> = {
        'admin': 100,
        'super_admin': 100,
        'accountant': 80,
        'principal': 70,
        'final_approver': 60,
        'hod': 50,
        'procurement': 40,
        'staff': 30,
        'auditor': 25,
        'supplier': 20,
        'guest': 0
      }
      const userLevel = roleLevels[userRole?.toLowerCase()] || 0
      const requiredLevel = roleLevels[item.minRole.toLowerCase()] || 0
      if (userLevel < requiredLevel) return false
    }

    return true
  })

  // Check if any item in this section is active
  const hasActiveItem = visibleItems.some((item: any) => {
    if (item.href === pathname) return true
    if (item.href !== '/' && pathname.startsWith(item.href)) return true
    return false
  })

  if (visibleItems.length === 0) {
    return null
  }

  const SectionIcon = section.icon

  if (collapsed && !isMobile) {
    return (
      <div className="space-y-1">
        {visibleItems.map((item: any) => {
          const isActive = item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href))
          const ItemIcon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-center rounded-xl p-3 text-sm font-medium transition-all duration-200 relative group",
                isActive
                  ? "bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-400 shadow-lg shadow-blue-500/20"
                  : "text-gray-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
              )}
              title={`${item.name} - ${item.description || ''}`}
            >
              {ItemIcon && <ItemIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />}
              {item.badge && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
              )}
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => onToggleSection(section.id)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200",
          hasActiveItem
            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 shadow-sm"
            : "text-gray-500 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
        )}
      >
        <div className="flex items-center space-x-3 min-w-0">
          {SectionIcon && (
            <SectionIcon
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-all duration-200",
                hasActiveItem && "text-blue-600 dark:text-blue-400"
              )}
            />
          )}
          <span className="truncate font-medium">{section.title}</span>
          {section.department && (
            <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full flex-shrink-0">
              {section.department}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
            {visibleItems.length}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="space-y-0.5 pl-4 border-l-2 border-blue-200 dark:border-blue-500/30 ml-3 animate-slideDown">
          {visibleItems.map((item: any) => {
            const isActive = item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href))
            const hasBadge = item.badge || (item.isDynamic && item.badge)
            const ItemIcon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 group hover:scale-[1.02]",
                  isActive
                    ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm shadow-blue-500/10"
                    : "text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
                  isMobile && "py-3.5 text-base"
                )}
              >
                {ItemIcon && (
                  <ItemIcon
                    className={cn(
                      "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                      isActive && "text-blue-600 dark:text-blue-400"
                    )}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{item.name}</span>
                    {hasBadge && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium",
                        item.badgeColor || "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  const {
    navigation,
    userRole,
    toggleSection
  } = useNavigation()

  const initialLoadDone = useRef(false)
  const previousPathname = useRef(pathname)

  // Load saved state from localStorage on initial mount
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed')
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === 'true')
    }
    setIsInitialized(true)
  }, [])

  // Save current path to localStorage
  useEffect(() => {
    if (isInitialized && userRole && pathname && !pathname.includes('/login') && !pathname.includes('/auth/')) {
      localStorage.setItem('lastVisitedPath', pathname)
    }
  }, [pathname, isInitialized, userRole])

  // Save collapsed state to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('sidebarCollapsed', String(collapsed))
    }
  }, [collapsed, isInitialized])

  // Save open sections to localStorage
  useEffect(() => {
    if (isInitialized && openSections.size > 0) {
      localStorage.setItem('openSections', JSON.stringify(Array.from(openSections)))
    }
  }, [openSections, isInitialized])

  // Initialize open sections from localStorage or current path
  useEffect(() => {
    if (navigation.length > 0 && !initialLoadDone.current) {
      const initiallyOpen = new Set<string>()

      const savedOpenSections = localStorage.getItem('openSections')
      if (savedOpenSections) {
        try {
          const parsed = JSON.parse(savedOpenSections)
          if (Array.isArray(parsed)) {
            parsed.forEach((sectionId: string) => {
              if (navigation.some(section => section.id === sectionId)) {
                initiallyOpen.add(sectionId)
              }
            })
          }
        } catch (e) {
          console.error('Failed to parse saved open sections', e)
        }
      }

      if (initiallyOpen.size === 0) {
        const currentSection = navigation.find(section =>
          section.items.some((item: any) =>
            item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href))
          )
        )
        if (currentSection) {
          initiallyOpen.add(currentSection.id)
        }
      }

      navigation.forEach(section => {
        if (section.defaultOpen && !initiallyOpen.has(section.id)) {
          initiallyOpen.add(section.id)
        }
      })

      setOpenSections(initiallyOpen)
      initialLoadDone.current = true
    }
  }, [navigation, pathname])

  // Auto-open parent section when path changes
  useEffect(() => {
    if (navigation.length > 0 && initialLoadDone.current && previousPathname.current !== pathname) {
      previousPathname.current = pathname

      const currentSection = navigation.find(section =>
        section.items.some((item: any) =>
          item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href))
        )
      )

      if (currentSection && !openSections.has(currentSection.id)) {
        setOpenSections(prev => {
          const newSet = new Set(prev)
          newSet.add(currentSection.id)
          return newSet
        })
      }
    }
  }, [pathname, navigation, openSections])

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile && mobileOpen) {
        setMobileOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [mobileOpen])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileOpen, isMobile])

  const handleToggleSection = useCallback((sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        navigation.forEach(section => {
          if (section.id !== sectionId && newSet.has(section.id)) {
            newSet.delete(section.id)
          }
        })
        newSet.add(sectionId)
      }
      return newSet
    })
    toggleSection(sectionId)
  }, [navigation, toggleSection])

  // Don't render until initialized and userRole is defined
  if (!isInitialized || !userRole) {
    return null
  }

  const sidebarContent = (
    <>
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Logo collapsed={collapsed && !isMobile} />
        <button
          onClick={() => {
            if (isMobile) {
              setMobileOpen(false)
            } else {
              setCollapsed(!collapsed)
            }
          }}
          className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          aria-label={isMobile ? "Close menu" : (collapsed ? "Expand sidebar" : "Collapse sidebar")}
        >
          {isMobile ? (
            <X className="h-4 w-4" />
          ) : collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3">
        <div className="space-y-3">
          {navigation.map((section) => (
            <NavSection
              key={section.id}
              section={section}
              collapsed={collapsed && !isMobile}
              isMobile={isMobile}
              userRole={userRole}
              openSections={openSections}
              onToggleSection={handleToggleSection}
            />
          ))}
        </div>
      </div>
    </>
  )

  return (
    <>
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-[100] md:hidden bg-white dark:bg-gray-800 p-2.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[150] md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out relative overflow-hidden",
          !isMobile && cn("fixed md:relative h-screen", collapsed ? "w-20" : "w-80"),
          isMobile && cn(
            "fixed top-0 left-0 h-screen w-80 shadow-xl z-[200] transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )
        )}
      >
        <div className="relative z-10 flex flex-col h-full w-full">
          {sidebarContent}
        </div>
      </div>
    </>
  )
}
