// src/components/dashboard/sidebar.tsx

"use client"

import { Logo } from '@/components/ui/logo'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Menu,
  X,
  Settings,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { useNavigation } from '@/hooks/useNavigation'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useAuthContext } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// ANIMATION VARIANTS
// ============================================

const sidebarVariants = {
  expanded: {
    width: 280,
    transition: { duration: 0.3 }
  },
  collapsed: {
    width: 72,
    transition: { duration: 0.3 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 }
}

const sectionVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 }
  }
}

// ============================================
// SIDEBAR LOADING SPINNER
// ============================================

const SidebarLoading = () => (
  <div className="flex flex-col h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-blue-200/30 dark:border-blue-800/30">
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-14 items-center justify-center px-3 border-b border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-blue-50/90 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-blue-950/50">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 animate-pulse" />
    </div>

    <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
      <div className="space-y-2">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-4 w-4 rounded bg-gradient-to-r from-blue-200/50 to-indigo-200/50 dark:from-blue-800/30 dark:to-indigo-800/30 animate-pulse" />
              <div className="flex-1 h-3 rounded bg-gradient-to-r from-blue-200/50 to-indigo-200/50 dark:from-blue-800/30 dark:to-indigo-800/30 animate-pulse" />
              <div className="h-4 w-4 rounded bg-gradient-to-r from-blue-200/50 to-indigo-200/50 dark:from-blue-800/30 dark:to-indigo-800/30 animate-pulse" />
            </div>
            <div className="ml-6 pl-3 border-l-2 border-blue-200/30 dark:border-blue-800/30 space-y-1">
              {[...Array(3)].map((_, childIndex) => (
                <div key={childIndex} className="flex items-center gap-3 px-3 py-1.5">
                  <div className="h-3 w-3 rounded bg-gradient-to-r from-blue-200/40 to-indigo-200/40 dark:from-blue-800/20 dark:to-indigo-800/20 animate-pulse" />
                  <div className="flex-1 h-2.5 rounded bg-gradient-to-r from-blue-200/40 to-indigo-200/40 dark:from-blue-800/20 dark:to-indigo-800/20 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="flex-shrink-0 border-t border-blue-200/30 dark:border-blue-800/30 p-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-blue-50/90 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-blue-950/50">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 animate-pulse" />
        <div className="flex-1 space-y-1">
          <div className="h-3 w-24 rounded bg-gradient-to-r from-blue-200/50 to-indigo-200/50 dark:from-blue-800/30 dark:to-indigo-800/30 animate-pulse" />
          <div className="h-2 w-16 rounded bg-gradient-to-r from-blue-200/30 to-indigo-200/30 dark:from-blue-800/20 dark:to-indigo-800/20 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
)

// ============================================
// NAV ITEM COMPONENT
// ============================================

interface NavItemProps {
  item: any
  depth?: number
  isActive: boolean
  isMobile?: boolean
  onItemClick?: () => void
  collapsed?: boolean
}

function NavItem({
  item,
  depth = 0,
  isActive,
  isMobile = false,
  onItemClick,
  collapsed = false
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
    if (!hasChildren || !isOpen || collapsed) return null

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={sectionVariants}
        className={cn(
          "mt-1 space-y-0.5",
          depth === 0 ? "pl-3" : "pl-2"
        )}
      >
        {item.children.map((child: any, index: number) => {
          const isChildActive = child.href === pathname ||
            (child.href !== '/' && pathname.startsWith(child.href)) ||
            (child.children && child.children.some((gc: any) =>
              gc.href === pathname || (gc.href !== '/' && pathname.startsWith(gc.href))
            ))

          const ChildIcon = child.icon

          if (child.children && child.children.length > 0) {
            return (
              <NavItem
                key={child.id || child.name}
                item={child}
                depth={depth + 1}
                isActive={isChildActive}
                isMobile={isMobile}
                onItemClick={onItemClick}
                collapsed={collapsed}
              />
            )
          }

          return (
            <motion.div
              key={child.id || child.name}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={child.href}
                onClick={handleClick}
                className={cn(
                  "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group relative",
                  isChildActive
                    ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm shadow-blue-500/10"
                    : "text-gray-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
                  isMobile && "py-3 text-base",
                  depth > 0 && "pl-8"
                )}
              >
                {ChildIcon && (
                  <ChildIcon
                    className={cn(
                      "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                      isChildActive && "text-blue-600 dark:text-blue-400"
                    )}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{child.label || child.name}</span>
                    {child.badge && (
                      <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                        {child.badge}
                      </span>
                    )}
                  </div>
                  {child.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {child.description}
                    </p>
                  )}
                </div>
                {!collapsed && isChildActive && (
                  <motion.div
                    className="absolute right-1 w-0.5 h-6 bg-blue-500 rounded-full"
                    layoutId="activeIndicator"
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    )
  }

  // If collapsed, render as icon only
  if (collapsed) {
    return (
      <motion.div variants={itemVariants}>
        <Link
          href={item.href}
          onClick={handleClick}
          className={cn(
            "flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 group relative",
            isActive || hasActiveChild
              ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm"
              : "text-gray-500 hover:bg-blue-50/80 dark:text-gray-400 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
          )}
          title={item.label || item.name}
        >
          {ItemIcon && <ItemIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />}
          {isActive && (
            <motion.div
              className="absolute -right-1 w-0.5 h-6 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30"
              layoutId="activeIndicator"
            />
          )}
        </Link>
      </motion.div>
    )
  }

  // If this is a child item (depth > 0) without children, render as simple link
  if (depth > 0 && !hasChildren) {
    return (
      <motion.div variants={itemVariants}>
        <Link
          href={item.href}
          onClick={handleClick}
          className={cn(
            "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group",
            isActive
              ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm shadow-blue-500/10"
              : "text-gray-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
            isMobile && "py-3 text-base",
            depth > 0 && "pl-8"
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
              <span className="truncate">{item.label || item.name}</span>
              {item.badge && (
                <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
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
          {isActive && !collapsed && (
            <motion.div
              className="absolute right-1 w-0.5 h-6 bg-blue-500 rounded-full"
              layoutId="activeIndicator"
            />
          )}
        </Link>
      </motion.div>
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
            ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm shadow-blue-500/10"
            : "text-gray-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
          isMobile && "py-3 text-base",
          depth > 0 && "pl-8"
        )}
      >
        <div className="flex items-center flex-1 min-w-0">
          {ItemIcon && (
            <ItemIcon
              className={cn(
                "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                (isActive || hasActiveChild) && "text-blue-600 dark:text-blue-400"
              )}
            />
          )}
          <span className="truncate">{item.label || item.name}</span>
          {item.badge && (
            <span className="flex-shrink-0 ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
              {item.badge}
            </span>
          )}
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

// ============================================
// NAV SECTION COMPONENT
// ============================================

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

  // Collapsed view
  if (collapsed && !isMobile) {
    return (
      <div className="space-y-1">
        {visibleItems.map((item: any, index: number) => {
          const isActive = activeTabId === item.id ||
            item.href === pathname ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const ItemIcon = item.icon
          return (
            <motion.div
              key={item.id || item.name}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 group relative",
                  isActive
                    ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 hover:bg-blue-50/80 dark:text-gray-400 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                )}
                title={`${item.label || item.name}${item.description ? ` - ${item.description}` : ''}`}
              >
                {ItemIcon && <ItemIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />}
                {isActive && (
                  <motion.div
                    className="absolute -right-1 w-0.5 h-6 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30"
                    layoutId="activeIndicator"
                  />
                )}
              </Link>
            </motion.div>
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
          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200",
          hasActiveItem
            ? "text-blue-700 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 shadow-sm"
            : "text-gray-500 hover:bg-blue-50/80 dark:text-gray-400 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
        )}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          {SectionIcon && (
            <SectionIcon
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-all duration-200",
                hasActiveItem && "text-blue-600 dark:text-blue-400"
              )}
            />
          )}
          <span className="truncate font-medium text-xs">{section.title}</span>
          {section.department && (
            <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
              {section.department}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-medium">
            {visibleItems.length}
          </span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && !collapsed && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sectionVariants}
            className="space-y-0.5 pl-3 border-l-2 border-blue-200/30 dark:border-blue-500/30 ml-3"
          >
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
                    collapsed={collapsed}
                  />
                )
              }

              const ItemIcon = item.icon

              return (
                <motion.div
                  key={item.id || item.name}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group hover:scale-[1.02]",
                      isActive
                        ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm shadow-blue-500/10"
                        : "text-gray-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
                      isMobile && "py-3 text-base"
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
                        <span className="truncate">{item.label || item.name}</span>
                        {item.badge && (
                          <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
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
                    {isActive && (
                      <motion.div
                        className="absolute right-1 w-0.5 h-6 bg-blue-500 rounded-full"
                        layoutId="activeIndicator"
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// MAIN SIDEBAR COMPONENT
// ============================================

export function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState(false)
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
    // Simulate loading of navigation items
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
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

  // Load saved collapsed state
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed')
    if (savedCollapsed !== null) {
      setCollapsed(JSON.parse(savedCollapsed))
    }
  }, [])

  // Save collapsed state
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
  }, [collapsed])

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

  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => !prev)
  }, [])

  // Show loading spinner while navigation is loading
  if (isLoading || !isInitialized) {
    return <SidebarLoading />
  }

  if (!userRole) {
    return null
  }

  const isCollapsed = collapsed && !isMobile

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-14 items-center justify-between px-3 border-b border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-blue-50/90 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-blue-950/50 backdrop-blur-xl">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center w-full" : "flex-1"
        )}>
          <Logo
            collapsed={isCollapsed}
            showText={!isCollapsed}
            companyLogo={companyLogo}
            variant="compact"
            className={cn(
              "transition-all duration-300",
              isCollapsed ? "scale-90" : "scale-100"
            )}
          />
        </div>

        {/* Toggle Button */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className={cn(
              "flex items-center justify-center rounded-lg p-1.5",
              "hover:bg-blue-100/50 dark:hover:bg-blue-800/30",
              "transition-all duration-200 flex-shrink-0",
              "text-blue-600 dark:text-blue-400",
              isCollapsed
                ? "absolute -right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg border border-blue-200/50 dark:border-blue-800/50 z-20"
                : "relative",
              "hover:scale-110 active:scale-95"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}

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

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2.5 bg-gradient-to-b from-blue-50/20 via-white to-indigo-50/20 dark:from-blue-950/10 dark:via-gray-900/50 dark:to-indigo-950/10">
        <div className={cn(
          "space-y-2",
          isCollapsed ? "flex flex-col items-center" : ""
        )}>
          {navigation.map((section) => (
            <NavSection
              key={section.id}
              section={section}
              collapsed={isCollapsed}
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

    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-[100] md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-blue-200/50 dark:border-blue-800/50 hover:bg-white dark:hover:bg-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        className={cn(
          "flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-blue-200/30 dark:border-blue-800/30 shadow-xl relative overflow-hidden",
          !isMobile && "h-screen sticky top-0",
          isMobile && cn(
            "fixed top-0 left-0 h-screen shadow-2xl z-[200]",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )
        )}
      >
        <div className="relative z-10 flex flex-col h-full w-full">
          {sidebarContent}
        </div>
      </motion.div>
    </>
  )
}
