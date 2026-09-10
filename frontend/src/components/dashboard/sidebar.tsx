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
  Clock,
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
// SIDEBAR LOADING SPINNER - UPDATED for black bg
// ============================================

const SidebarLoading = () => (
  <div className="flex flex-col h-full bg-background/95 backdrop-blur-sm border-r border-blue-200/30 dark:border-blue-800/30">
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-14 items-center justify-center px-3 border-b border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-blue-50/90 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30">
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

    <div className="flex-shrink-0 border-t border-blue-200/30 dark:border-blue-800/30 p-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-blue-50/90 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30">
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
  const { navigateTo, isItemDisabled, getItemHref } = useNavigation()
  const hasChildren = item.children && item.children.length > 0
  const [isOpen, setIsOpen] = useState(false)
  const ItemIcon = item.icon
  const isDisabled = isItemDisabled(item)
  const href = getItemHref(item)

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

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true)
    }
  }, [hasActiveChild])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault()
      navigateTo(item)
    }
    if (onItemClick) {
      onItemClick()
    }
  }

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
          const isChildDisabled = isItemDisabled(child)
          const childHref = getItemHref(child)

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
                href={childHref}
                onClick={(e) => {
                  if (isChildDisabled) {
                    e.preventDefault()
                    navigateTo(child)
                  }
                  if (onItemClick) onItemClick()
                }}
                className={cn(
                  "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group relative",
                  isChildActive && !isChildDisabled
                    ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm shadow-blue-500/10"
                    : isChildDisabled
                      ? "text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5"
                      : "text-gray-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
                  isMobile && "py-3 text-base",
                  depth > 0 && "pl-8"
                )}
                aria-disabled={isChildDisabled}
              >
                {ChildIcon && (
                  <ChildIcon
                    className={cn(
                      "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                      isChildActive && !isChildDisabled && "text-blue-600 dark:text-blue-400",
                      isChildDisabled && "opacity-50"
                    )}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "truncate",
                      isChildDisabled && "line-through decoration-gray-300 dark:decoration-gray-600"
                    )}>
                      {child.label || child.name}
                    </span>
                    {child.badge && !isChildDisabled && (
                      <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                        {child.badge}
                      </span>
                    )}
                    {isChildDisabled && (
                      <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                        <Clock className="h-2.5 w-2.5" />
                        Soon
                      </span>
                    )}
                  </div>
                  {child.description && (
                    <p className={cn(
                      "text-xs truncate mt-0.5",
                      isChildDisabled ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {child.description}
                    </p>
                  )}
                </div>
                {!collapsed && isChildActive && !isChildDisabled && (
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

  if (collapsed) {
    return (
      <motion.div variants={itemVariants}>
        <Link
          href={href}
          onClick={(e) => {
            if (isDisabled) {
              e.preventDefault()
              navigateTo(item)
            }
            if (onItemClick) onItemClick()
          }}
          className={cn(
            "flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 group relative",
            (isActive || hasActiveChild) && !isDisabled
              ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm"
              : isDisabled
                ? "text-gray-300 dark:text-gray-600 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5"
                : "text-gray-500 hover:bg-blue-50/80 dark:text-gray-400 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
          )}
          title={`${item.label || item.name}${isDisabled ? ' (Coming Soon)' : ''}`}
          aria-disabled={isDisabled}
        >
          {ItemIcon && (
            <ItemIcon className={cn(
              "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
              isDisabled && "opacity-50"
            )} />
          )}
          {isDisabled && (
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 dark:bg-amber-500 shadow-sm" />
          )}
          {isActive && !isDisabled && (
            <motion.div
              className="absolute -right-1 w-0.5 h-6 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30"
              layoutId="activeIndicator"
            />
          )}
        </Link>
      </motion.div>
    )
  }

  if (depth > 0 && !hasChildren) {
    return (
      <motion.div variants={itemVariants}>
        <Link
          href={href}
          onClick={(e) => {
            if (isDisabled) {
              e.preventDefault()
              navigateTo(item)
            }
            if (onItemClick) onItemClick()
          }}
          className={cn(
            "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group",
            isActive && !isDisabled
              ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm shadow-blue-500/10"
              : isDisabled
                ? "text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5"
                : "text-gray-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
            isMobile && "py-3 text-base",
            depth > 0 && "pl-8"
          )}
          aria-disabled={isDisabled}
        >
          {ItemIcon && (
            <ItemIcon
              className={cn(
                "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                isActive && !isDisabled && "text-blue-600 dark:text-blue-400",
                isDisabled && "opacity-50"
              )}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={cn(
                "truncate",
                isDisabled && "line-through decoration-gray-300 dark:decoration-gray-600"
              )}>
                {item.label || item.name}
              </span>
              {item.badge && !isDisabled && (
                <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                  {item.badge}
                </span>
              )}
              {isDisabled && (
                <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                  <Clock className="h-2.5 w-2.5" />
                  Soon
                </span>
              )}
            </div>
            {item.description && (
              <p className={cn(
                "text-xs truncate mt-0.5",
                isDisabled ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"
              )}>
                {item.description}
              </p>
            )}
          </div>
          {isActive && !isDisabled && !collapsed && (
            <motion.div
              className="absolute right-1 w-0.5 h-6 bg-blue-500 rounded-full"
              layoutId="activeIndicator"
            />
          )}
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={handleToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group w-full",
          (isActive || hasActiveChild) && !isDisabled
            ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm shadow-blue-500/10"
            : isDisabled
              ? "text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5"
              : "text-gray-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
          isMobile && "py-3 text-base",
          depth > 0 && "pl-8"
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
      >
        <div className="flex items-center flex-1 min-w-0">
          {ItemIcon && (
            <ItemIcon
              className={cn(
                "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                (isActive || hasActiveChild) && !isDisabled && "text-blue-600 dark:text-blue-400",
                isDisabled && "opacity-50"
              )}
            />
          )}
          <span className={cn(
            "truncate",
            isDisabled && "line-through decoration-gray-300 dark:decoration-gray-600"
          )}>
            {item.label || item.name}
          </span>
          {item.badge && !isDisabled && (
            <span className="flex-shrink-0 ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
              {item.badge}
            </span>
          )}
          {isDisabled && (
            <span className="flex-shrink-0 ml-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
              <Clock className="h-2.5 w-2.5" />
              Soon
            </span>
          )}
        </div>
        {!isDisabled && (
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-transform duration-200 ml-2",
              isOpen && "rotate-180"
            )}
          />
        )}
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
  const { isItemDisabled, navigateTo, getItemHref } = useNavigation()
  const isOpen = openSections.has(section.id)

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

  const hasActiveItem = visibleItems.some((item: any) => {
    if (isItemDisabled(item)) return false
    if (item.href === pathname) return true
    if (item.href !== '/' && pathname.startsWith(item.href)) return true
    if (item.children) {
      return item.children.some((child: any) => {
        if (isItemDisabled(child)) return false
        if (child.href === pathname) return true
        if (child.href !== '/' && pathname.startsWith(child.href)) return true
        if (child.children) {
          return child.children.some((gc: any) => {
            if (isItemDisabled(gc)) return false
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
  const isSectionComingSoon = section.comingSoon

  if (collapsed && !isMobile) {
    return (
      <div className="space-y-1">
        {visibleItems.map((item: any, index: number) => {
          const isDisabled = isItemDisabled(item)
          const isActive = !isDisabled && (activeTabId === item.id ||
            item.href === pathname ||
            (item.href !== '/' && pathname.startsWith(item.href)))
          const ItemIcon = item.icon
          const href = getItemHref(item)
          return (
            <motion.div
              key={item.id || item.name}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={href}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault()
                    navigateTo(item)
                  }
                  if (onItemClick) onItemClick()
                }}
                className={cn(
                  "flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 group relative",
                  isActive && !isDisabled
                    ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm"
                    : isDisabled
                      ? "text-gray-300 dark:text-gray-600 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5"
                      : "text-gray-500 hover:bg-blue-50/80 dark:text-gray-400 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                )}
                title={`${item.label || item.name}${isDisabled ? ' (Coming Soon)' : ''}${item.description ? ` - ${item.description}` : ''}`}
                aria-disabled={isDisabled}
              >
                {ItemIcon && (
                  <ItemIcon className={cn(
                    "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                    isDisabled && "opacity-50"
                  )} />
                )}
                {isDisabled && (
                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 dark:bg-amber-500 shadow-sm" />
                )}
                {isActive && !isDisabled && (
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
            : isSectionComingSoon
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-500 hover:bg-blue-50/80 dark:text-gray-400 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
        )}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          {SectionIcon && (
            <SectionIcon
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-all duration-200",
                hasActiveItem && "text-blue-600 dark:text-blue-400",
                isSectionComingSoon && "opacity-50"
              )}
            />
          )}
          <span className={cn(
            "truncate font-medium text-xs",
            isSectionComingSoon && "line-through decoration-gray-300 dark:decoration-gray-600"
          )}>
            {section.title}
          </span>
          {section.department && (
            <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
              {section.department}
            </span>
          )}
          {isSectionComingSoon && (
            <span className="flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
              <Clock className="h-2.5 w-2.5" />
              Soon
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
              const isDisabled = isItemDisabled(item)
              const isActive = !isDisabled && (activeTabId === item.id ||
                item.href === pathname ||
                (item.href !== '/' && pathname.startsWith(item.href)))
              const href = getItemHref(item)

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
                    href={href}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault()
                        navigateTo(item)
                      }
                      if (onItemClick) onItemClick()
                    }}
                    className={cn(
                      "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group hover:scale-[1.02]",
                      isActive && !isDisabled
                        ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm shadow-blue-500/10"
                        : isDisabled
                          ? "text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5"
                          : "text-gray-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
                      isMobile && "py-3 text-base"
                    )}
                    aria-disabled={isDisabled}
                  >
                    {ItemIcon && (
                      <ItemIcon
                        className={cn(
                          "mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                          isActive && !isDisabled && "text-blue-600 dark:text-blue-400",
                          isDisabled && "opacity-50"
                        )}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "truncate",
                          isDisabled && "line-through decoration-gray-300 dark:decoration-gray-600"
                        )}>
                          {item.label || item.name}
                        </span>
                        {item.badge && !isDisabled && (
                          <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                            {item.badge}
                          </span>
                        )}
                        {isDisabled && (
                          <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                            <Clock className="h-2.5 w-2.5" />
                            Soon
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className={cn(
                          "text-xs truncate mt-0.5",
                          isDisabled ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"
                        )}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    {isActive && !isDisabled && (
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

  const isSupplier = user?.roles?.some(
    (r: any) => r.toLowerCase() === 'supplier'
  ) || false

  const { useSupplierProfileExists } = useSuppliers()

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

  const getCompanyLogo = (): string | null => {
    if (!isSupplier || !supplierResult?.exists || !supplierResult?.supplier) return null
    const supplier = supplierResult.supplier as any
    return supplier?.company_logo || null
  }

  const companyLogo = getCompanyLogo()

  useEffect(() => {
    setIsInitialized(true)
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

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed')
    if (savedCollapsed !== null) {
      setCollapsed(JSON.parse(savedCollapsed))
    }
  }, [])

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

  if (isLoading || !isInitialized) {
    return <SidebarLoading />
  }

  if (!userRole) {
    return null
  }

  const isCollapsed = collapsed && !isMobile

  const sidebarContent = (
    <>
      {/* Header - UPDATED: black dark bg */}
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-14 items-center justify-between px-3 border-b border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-blue-50/90 dark:from-blue-950/30 dark:via-background dark:to-blue-950/30 backdrop-blur-xl">
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

        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className={cn(
              "flex items-center justify-center rounded-lg p-1.5",
              "hover:bg-blue-100/50 dark:hover:bg-blue-800/30",
              "transition-all duration-200 flex-shrink-0",
              "text-blue-600 dark:text-blue-400",
              isCollapsed
                ? "absolute -right-3 top-1/2 -translate-y-1/2 bg-background shadow-lg border border-blue-200/50 dark:border-blue-800/50 z-20"
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
            className="rounded-lg p-2 hover:bg-white/50 dark:hover:bg-white/5 transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
      </div>

      {/* Content - UPDATED: black dark bg */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2.5 bg-gradient-to-b from-blue-50/20 via-background to-indigo-50/20 dark:from-blue-950/10 dark:via-background dark:to-indigo-950/10">
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
      {/* Mobile Menu Button - UPDATED: black dark bg */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-[100] md:hidden bg-background/90 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-blue-200/50 dark:border-blue-800/50 hover:bg-background transition-colors"
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

      {/* Sidebar - UPDATED: black dark bg */}
      <motion.div
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        className={cn(
          "flex flex-col bg-background/95 backdrop-blur-sm border-r border-blue-200/30 dark:border-blue-800/30 shadow-xl relative overflow-hidden",
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
