// hooks/useNavigation.ts

import { useMemo, useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { navigationSections } from '@/lib/navigation/sections'
import { NavItem, NavigationSection } from '@/lib/types/navigation.types'

const ACTIVE_TAB_STORAGE_KEY = 'sspms_active_tab'
const OPEN_SECTIONS_STORAGE_KEY = 'sspms_open_sections'
const COMING_SOON_ROUTE = '/coming-soon'

export function useNavigation() {
  const { user, isAuthenticated, roles } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Initialize open sections from localStorage - FIXED: explicit Set<string> return type
  const getInitialOpenSections = useCallback((): Set<string> => {
    if (typeof window === 'undefined') return new Set<string>()

    try {
      const stored = localStorage.getItem(OPEN_SECTIONS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Ensure we're returning a Set<string>
        if (Array.isArray(parsed)) {
          return new Set<string>(parsed.filter((item): item is string => typeof item === 'string'))
        }
      }
    } catch (error) {
      // Silent fail
    }
    return new Set<string>()
  }, [])

  const [openSections, setOpenSections] = useState<Set<string>>(getInitialOpenSections)
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  // ✅ Add state for dynamic badge values
  const [dynamicBadges, setDynamicBadges] = useState<Record<string, string>>({})

  // Get user's role names from backend - ONLY ROLES, no permissions
  const userRoles = useMemo(() => {
    if (!user) {
      return []
    }

    const roleNames: string[] = []

    // Check for primary role on user object
    if (user.role) {
      roleNames.push(user.role.toLowerCase())
    }

    // Add roles from the roles array (this is where "ADMIN" is)
    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach((role: string) => {
        if (role) {
          roleNames.push(role.toLowerCase())
        }
      })
    }

    // Also check the roles parameter from useAuth
    if (roles && Array.isArray(roles)) {
      roles.forEach((role: any) => {
        const name = typeof role === 'string' ? role : role.name
        if (name && !roleNames.includes(name.toLowerCase())) {
          roleNames.push(name.toLowerCase())
        }
      })
    }

    // If no roles found, add 'guest' as default
    if (roleNames.length === 0) {
      roleNames.push('guest')
    }

    return roleNames
  }, [user, roles])

  // Check if user has any of the given roles
  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    if (!roleNames || roleNames.length === 0) return true

    // Admin has all access
    if (userRoles.includes('admin') || userRoles.includes('super_admin')) return true

    // Check if user has any of the required roles
    return roleNames.some(role =>
      userRoles.includes(role.toLowerCase())
    )
  }, [userRoles])

  // Check if an item is accessible - ONLY BASED ON ROLES
  const isItemAccessible = useCallback((item: NavItem): boolean => {
    // If no roles specified, accessible to all authenticated users
    if (!item.roles || item.roles.length === 0) {
      return isAuthenticated
    }

    // Check roles (OR logic) - user must have at least one of the required roles
    return hasAnyRole(item.roles)
  }, [isAuthenticated, hasAnyRole])

  // Find the active tab based on current path
  const findActiveTab = useCallback((navigationItems: NavigationSection[]): string | null => {
    for (const section of navigationItems) {
      for (const item of section.items) {
        // Check if current path matches this item
        if (item.href === pathname) {
          return item.id
        }
        // Check if current path starts with item href (for nested routes)
        if (item.href !== '/' && pathname.startsWith(item.href)) {
          return item.id
        }
        // Check children
        if (item.children) {
          for (const child of item.children) {
            if (child.href === pathname || (child.href !== '/' && pathname.startsWith(child.href))) {
              return child.id
            }
            // Check grandchildren
            if (child.children) {
              for (const grandChild of child.children) {
                if (grandChild.href === pathname || (grandChild.href !== '/' && pathname.startsWith(grandChild.href))) {
                  return grandChild.id
                }
              }
            }
          }
        }
      }
    }
    return null
  }, [pathname])

  // Build filtered navigation
  const navigation = useMemo(() => {
    if (!isAuthenticated || !user) {
      return []
    }

    const filtered: NavigationSection[] = []

    for (const section of navigationSections) {
      // Filter items in this section based on roles
      const filteredItems = section.items.filter(item => {
        return isItemAccessible(item)
      })

      // If no items in this section, skip the section
      if (filteredItems.length === 0) {
        continue
      }

      filtered.push({
        ...section,
        items: filteredItems
      })
    }

    return filtered
  }, [isAuthenticated, user, isItemAccessible])

  // Save active tab to localStorage
  const saveActiveTab = useCallback((tabId: string | null) => {
    if (typeof window === 'undefined') return

    try {
      if (tabId) {
        localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tabId)
      } else {
        localStorage.removeItem(ACTIVE_TAB_STORAGE_KEY)
      }
    } catch (error) {
      // Silent fail
    }
  }, [])

  // Save open sections to localStorage
  const saveOpenSections = useCallback((sections: Set<string>) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(OPEN_SECTIONS_STORAGE_KEY, JSON.stringify(Array.from(sections)))
    } catch (error) {
      // Silent fail
    }
  }, [])

  // ✅ Update dynamic badge value
  const updateBadge = useCallback((badgeKey: string, value: string) => {
    setDynamicBadges(prev => ({
      ...prev,
      [badgeKey]: value
    }))
  }, [])

  // ✅ Get badge value for an item
  const getBadgeValue = useCallback((item: NavItem): string => {
    // If item is dynamic, check the dynamicBadges state
    if (item.isDynamic && item.badgeKey) {
      return dynamicBadges[item.badgeKey] || item.badge || '0'
    }
    // Otherwise return the static badge
    return item.badge || ''
  }, [dynamicBadges])

  // ✅ Check if an item is disabled
  const isItemDisabled = useCallback((item: NavItem): boolean => {
    return item.disabled === true
  }, [])

  // ✅ Get the appropriate href for an item (coming soon if disabled)
  const getItemHref = useCallback((item: NavItem): string => {
    if (item.disabled) {
      return COMING_SOON_ROUTE
    }
    return item.href
  }, [])

  // ✅ Navigate to an item, handling disabled items
  const navigateTo = useCallback((item: NavItem) => {
    if (item.disabled) {
      // Store the original path for reference
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirected_from', item.href)
        sessionStorage.setItem('redirected_item_name', item.name)
        sessionStorage.setItem('redirected_item_id', item.id)
      }
      router.push(COMING_SOON_ROUTE)
    } else {
      router.push(item.href)
    }
  }, [router])

  // ✅ Check if current page is the coming soon page
  const isComingSoonPage = useCallback(() => {
    return pathname === COMING_SOON_ROUTE
  }, [pathname])

  // ✅ Get redirected from info
  const getRedirectedFrom = useCallback(() => {
    if (typeof window === 'undefined') return null
    return {
      path: sessionStorage.getItem('redirected_from'),
      name: sessionStorage.getItem('redirected_item_name'),
      id: sessionStorage.getItem('redirected_item_id')
    }
  }, [])

  // ✅ Clear redirected info
  const clearRedirectedInfo = useCallback(() => {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem('redirected_from')
    sessionStorage.removeItem('redirected_item_name')
    sessionStorage.removeItem('redirected_item_id')
  }, [])

  // Update active tab when path changes
  useEffect(() => {
    if (navigation.length === 0) {
      return
    }

    const activeTab = findActiveTab(navigation)

    if (activeTab) {
      setActiveTabId(activeTab)
      saveActiveTab(activeTab)
    } else {
      // Check if we have a stored active tab that might still be valid
      const storedTab = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_TAB_STORAGE_KEY) : null

      // Only use stored tab if it exists in the current navigation
      if (storedTab) {
        const exists = navigation.some(section =>
          section.items.some(item => {
            if (item.id === storedTab) return true
            if (item.children) {
              return item.children.some(child => {
                if (child.id === storedTab) return true
                if (child.children) {
                  return child.children.some(gc => gc.id === storedTab)
                }
                return false
              })
            }
            return false
          })
        )
        if (exists) {
          setActiveTabId(storedTab)
        } else {
          setActiveTabId(null)
          saveActiveTab(null)
        }
      } else {
        setActiveTabId(null)
      }
    }
  }, [pathname, navigation, findActiveTab, saveActiveTab])

  // Auto-open section based on current path
  useEffect(() => {
    if (navigation.length === 0) {
      return
    }

    let foundSection: string | null = null

    for (const section of navigation) {
      for (const item of section.items) {
        // Check if current path matches this item
        if (item.href === pathname) {
          foundSection = section.id
          break
        }
        // Check if current path starts with item href (for nested routes)
        if (item.href !== '/' && pathname.startsWith(item.href)) {
          foundSection = section.id
          break
        }
        // Check children
        if (item.children) {
          for (const child of item.children) {
            if (child.href === pathname || (child.href !== '/' && pathname.startsWith(child.href))) {
              foundSection = section.id
              break
            }
            // Check grandchildren
            if (child.children) {
              for (const grandChild of child.children) {
                if (grandChild.href === pathname || (grandChild.href !== '/' && pathname.startsWith(grandChild.href))) {
                  foundSection = section.id
                  break
                }
              }
            }
          }
        }
        if (foundSection) break
      }
      if (foundSection) break
    }

    if (foundSection) {
      setOpenSections(prev => {
        const newSet = new Set(prev)
        newSet.add(foundSection)
        // Save to localStorage
        saveOpenSections(newSet)
        return newSet
      })
    }
  }, [pathname, navigation, saveOpenSections])

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      // Save to localStorage
      saveOpenSections(newSet)
      return newSet
    })
  }, [saveOpenSections])

  const isSectionOpen = useCallback((sectionId: string, defaultOpen?: boolean) => {
    if (openSections.has(sectionId)) return true
    return defaultOpen || false
  }, [openSections])

  // Get primary role
  const primaryRole = userRoles.length > 0 ? userRoles[0] : 'guest'

  // Check if a tab is active
  const isTabActive = useCallback((tabId: string): boolean => {
    return activeTabId === tabId
  }, [activeTabId])

  // Get the active tab object
  const getActiveTab = useCallback((): NavItem | null => {
    if (!activeTabId) return null

    for (const section of navigation) {
      for (const item of section.items) {
        if (item.id === activeTabId) {
          return item
        }
        if (item.children) {
          for (const child of item.children) {
            if (child.id === activeTabId) {
              return child
            }
            if (child.children) {
              for (const grandChild of child.children) {
                if (grandChild.id === activeTabId) {
                  return grandChild
                }
              }
            }
          }
        }
      }
    }
    return null
  }, [navigation, activeTabId])

  return {
    navigation,
    userRole: primaryRole,
    userRoles,
    openSections,
    toggleSection,
    isSectionOpen,
    hasAnyRole,
    activeTabId,
    isTabActive,
    getActiveTab,
    setActiveTab: (tabId: string) => {
      setActiveTabId(tabId)
      saveActiveTab(tabId)
    },
    // ✅ Dynamic badge methods
    updateBadge,
    getBadgeValue,
    dynamicBadges,
    // ✅ Disabled item handling methods
    isItemDisabled,
    getItemHref,
    navigateTo,
    isComingSoonPage,
    getRedirectedFrom,
    clearRedirectedInfo,
  }
}
