"use client"

import { Logo } from '@/components/ui/logo'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Menu,
  X,
  Dot,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { useNavigation } from '@/hooks/useNavigation'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useAuthContext } from '@/contexts/AuthContext'

interface NavItemProps {
  item: any
  depth?: number
  isActive: boolean
  isMobile?: boolean
  onItemClick?: () => void
}

function NavItem({
  item,
  depth = 0,
  isActive,
  isMobile = false,
  onItemClick
}: NavItemProps) {
  const pathname = usePathname()
  const hasChildren = item.children && item.children.length > 0
  const [isOpen, setIsOpen] = useState(false)
  const ItemIcon = item.icon

  // Check if any child is active
  const hasActiveChild = useMemo(() => {
    if (!hasChildren) return false
    return item.children.some((child: any) => {
      if (child.href === pathname) return true
      if (child.href !== '/' && pathname.startsWith(child.href)) return true
      if (child.children) {
        return child.children.some((grandChild: any) => {
          if (grandChild.href === pathname) return true
          if (grandChild.href !== '/' && pathname.startsWith(grandChild.href)) return true
          return false
        })
      }
      return false
    })
  }, [hasChildren, item.children, pathname])

  // Auto-open if child is active
  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true)
    }
  }, [hasActiveChild])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }

  const handleClick = () => {
    if (onItemClick) {
      onItemClick()
    }
  }

  // Render child items
  const renderChildren = () => {
    if (!hasChildren || !isOpen) return null

    return (
      <div className={cn(
        "mt-1 space-y-0.5",
        depth === 0 ? "pl-3" : "pl-2"
      )}>
        {item.children.map((child: any) => {
          const isChildActive = child.href === pathname ||
            (child.href !== '/' && pathname.startsWith(child.href)) ||
            (child.children && child.children.some((gc: any) =>
              gc.href === pathname || (gc.href !== '/' && pathname.startsWith(gc.href))
            ))

          const ChildIcon = child.icon

          // If child has grandchildren, render as nested
          if (child.children && child.children.length > 0) {
            return (
              <NavItem
                key={child.id || child.name}
                item={child}
                depth={depth + 1}
                isActive={isChildActive}
                isMobile={isMobile}
                onItemClick={onItemClick}
              />
            )
          }

          return (
            <Link
              key={child.id || child.name}
              href={child.href}
              onClick={handleClick}
              className={cn(
                "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group",
                isChildActive
                  ? "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400 shadow-sm shadow-indigo-500/10"
                  : "text-gray-600 hover:bg-indigo-50/80 dark:text-gray-300 dark:hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400",
                isMobile && "py-3 text-base",
                depth > 0 && "pl-8"
              )}
            >
              {ChildIcon && (
                <ChildIcon
                  className={cn(
                    "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                    isChildActive && "text-indigo-600 dark:text-indigo-400"
                  )}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{child.name}</span>
                </div>
                {child.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {child.description}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  // If this is a child item (depth > 0) without children, render as simple link
  if (depth > 0 && !hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={handleClick}
        className={cn(
          "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group",
          isActive
            ? "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400 shadow-sm shadow-indigo-500/10"
            : "text-gray-600 hover:bg-indigo-50/80 dark:text-gray-300 dark:hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400",
          isMobile && "py-3 text-base",
          depth > 0 && "pl-8"
        )}
      >
        {ItemIcon && (
          <ItemIcon
            className={cn(
              "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
              isActive && "text-indigo-600 dark:text-indigo-400"
            )}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate">{item.name}</span>
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {item.description}
            </p>
          )}
        </div>
      </Link>
    )
  }

  // Render parent item with children
  return (
    <div className="space-y-0.5">
      <button
        onClick={handleToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group w-full",
          isActive || hasActiveChild
            ? "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400 shadow-sm shadow-indigo-500/10"
            : "text-gray-600 hover:bg-indigo-50/80 dark:text-gray-300 dark:hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400",
          isMobile && "py-3 text-base",
          depth > 0 && "pl-8"
        )}
      >
        <div className="flex items-center flex-1 min-w-0">
          {ItemIcon && (
            <ItemIcon
              className={cn(
                "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                (isActive || hasActiveChild) && "text-indigo-600 dark:text-indigo-400"
              )}
            />
          )}
          <span className="truncate">{item.name}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-transform duration-200 ml-2",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {renderChildren()}
    </div>
  )
}

interface NavSectionProps {
  section: any
  collapsed: boolean
  isMobile?: boolean
  userRole: string
  openSections: Set<string>
  onToggleSection: (sectionId: string) => void
  activeTabId: string | null
  onItemClick?: () => void
}

function NavSection({
  section,
  collapsed,
  isMobile = false,
  userRole,
  openSections,
  onToggleSection,
  activeTabId,
  onItemClick
}: NavSectionProps) {
  const pathname = usePathname()
  const isOpen = openSections.has(section.id)

  // Check if section has any visible items for this role and permissions
  const visibleItems = section.items.filter((item: any) => {
    if (item.roles) {
      const hasRole = item.roles.some((role: string) =>
        role.toLowerCase() === userRole?.toLowerCase()
      )
      if (!hasRole) return false
    }

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
    if (item.children) {
      return item.children.some((child: any) => {
        if (child.href === pathname) return true
        if (child.href !== '/' && pathname.startsWith(child.href)) return true
        if (child.children) {
          return child.children.some((gc: any) => {
            if (gc.href === pathname) return true
            if (gc.href !== '/' && pathname.startsWith(gc.href)) return true
            return false
          })
        }
        return false
      })
    }
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
          const isActive = activeTabId === item.id ||
            item.href === pathname ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const ItemIcon = item.icon
          return (
            <Link
              key={item.id || item.name}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center justify-center rounded-xl p-3 text-sm font-medium transition-all duration-200 relative group",
                isActive
                  ? "bg-indigo-500/25 text-indigo-600 dark:bg-indigo-500/35 dark:text-indigo-400 shadow-lg shadow-indigo-500/25"
                  : "text-gray-500 hover:bg-indigo-50/80 dark:text-gray-400 dark:hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
              title={`${item.name} - ${item.description || ''}`}
            >
              {ItemIcon && <ItemIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />}
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
            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 shadow-sm"
            : "text-gray-500 hover:bg-indigo-50/80 dark:text-gray-400 dark:hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400"
        )}
      >
        <div className="flex items-center space-x-3 min-w-0">
          {SectionIcon && (
            <SectionIcon
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-all duration-200",
                hasActiveItem && "text-indigo-600 dark:text-indigo-400"
              )}
            />
          )}
          <span className="truncate font-medium">{section.title}</span>
          {section.department && (
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full flex-shrink-0">
              {section.department}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-xs bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
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
        <div className="space-y-0.5 pl-4 border-l-2 border-indigo-200 dark:border-indigo-500/30 ml-3 animate-slideDown">
          {visibleItems.map((item: any) => {
            const isActive = activeTabId === item.id ||
              item.href === pathname ||
              (item.href !== '/' && pathname.startsWith(item.href))

            if (item.children && item.children.length > 0) {
              return (
                <NavItem
                  key={item.id || item.name}
                  item={item}
                  depth={1}
                  isActive={isActive}
                  isMobile={isMobile}
                  onItemClick={onItemClick}
                />
              )
            }

            const ItemIcon = item.icon

            return (
              <Link
                key={item.id || item.name}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 group hover:scale-[1.02]",
                  isActive
                    ? "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400 shadow-sm shadow-indigo-500/10"
                    : "text-gray-600 hover:bg-indigo-50/80 dark:text-gray-300 dark:hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400",
                  isMobile && "py-3.5 text-base"
                )}
              >
                {ItemIcon && (
                  <ItemIcon
                    className={cn(
                      "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                      isActive && "text-indigo-600 dark:text-indigo-400"
                    )}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{item.name}</span>
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  const {
    navigation,
    userRole,
    toggleSection,
    activeTabId,
  } = useNavigation()

  const { user } = useAuthContext()

  // Check if user is a supplier
  const isSupplier = user?.roles?.some(
    (r: any) => r.toLowerCase() === 'supplier'
  ) || false

  const { useSupplierProfileExists } = useSuppliers()

  // Properly handle the hook return value
  let supplierResult;
  try {
    const result = useSupplierProfileExists();
    supplierResult = {
      exists: result?.exists || false,
      supplier: result?.supplier || null,
      isLoading: result?.isLoading || false,
    };
  } catch (error) {
    supplierResult = {
      exists: false,
      supplier: null,
      isLoading: false,
    };
  }

  const initialLoadDone = useRef(false)
  const previousPathname = useRef(pathname)

  // Get the company logo URL from supplier data
  const getCompanyLogo = (): string | null => {
    if (!isSupplier || !supplierResult?.exists || !supplierResult?.supplier) return null
    const supplier = supplierResult.supplier as any
    return supplier?.company_logo || null
  }

  const companyLogo = getCompanyLogo()

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized && userRole && pathname && !pathname.includes('/login') && !pathname.includes('/auth/')) {
      localStorage.setItem('lastVisitedPath', pathname)
    }
  }, [pathname, isInitialized, userRole])

  useEffect(() => {
    if (isInitialized && openSections.size > 0) {
      localStorage.setItem('openSections', JSON.stringify(Array.from(openSections)))
    }
  }, [openSections, isInitialized])

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

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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

  const handleItemClick = useCallback(() => {
    if (isMobile) {
      setMobileOpen(false)
    }
  }, [isMobile])

  if (!isInitialized || !userRole) {
    return null
  }

  const sidebarContent = (
    <>
      {/* Header with gradient - Indigo/Purple/Pink theme */}
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-20 items-center justify-between px-4 border-b border-indigo-200/30 dark:border-indigo-800/30 bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-pink-50/90 dark:from-indigo-950/50 dark:via-purple-950/50 dark:to-pink-950/50 backdrop-blur-xl">
        <div className="flex items-center justify-center flex-1">
          <Logo
            collapsed={false}
            showText={false}
            companyLogo={companyLogo}
          />
        </div>
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
      </div>

      {/* Content with gradient - Indigo/Purple/Pink theme */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 bg-gradient-to-b from-indigo-50/20 via-white to-purple-50/20 dark:from-indigo-950/10 dark:via-gray-900/50 dark:to-purple-950/10">
        <div className="space-y-3">
          {navigation.map((section) => (
            <NavSection
              key={section.id}
              section={section}
              collapsed={false}
              isMobile={isMobile}
              userRole={userRole}
              openSections={openSections}
              onToggleSection={handleToggleSection}
              activeTabId={activeTabId}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      </div>

      {/* Footer with gradient - Indigo/Purple/Pink theme */}
      <div className="flex-shrink-0 border-t border-indigo-200/30 dark:border-indigo-800/30 p-4 bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-pink-50/90 dark:from-indigo-950/50 dark:via-purple-950/50 dark:to-pink-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium shadow-lg shadow-indigo-500/25">
              {user?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {user?.full_name || user?.email || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
              {userRole || 'Guest'}
            </p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-[100] md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-indigo-200/50 dark:border-indigo-800/50 hover:bg-white dark:hover:bg-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-indigo-200/30 dark:border-indigo-800/30 shadow-xl transition-all duration-300 ease-in-out relative overflow-hidden",
          !isMobile && "w-80",
          isMobile && cn(
            "fixed top-0 left-0 h-screen w-80 shadow-2xl z-[200] transition-transform duration-300",
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
