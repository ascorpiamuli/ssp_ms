// hooks/useNavigation.ts

import { useMemo, useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { navigationSections } from '@/lib/navigation/sections'
import { NavItem, NavigationSection } from '@/lib/types/navigation.types'

export function useNavigation() {
  const { user, isAuthenticated, roles } = useAuth()
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  console.log('[useNavigation] Hook called', {
    isAuthenticated,
    userId: user?.id,
    userEmail: user?.email,
    userRoleField: user?.role,
    userRolesArray: roles,
    pathname,
    rolesCount: roles?.length || 0
  })

  // Get user's role names from backend - ONLY ROLES, no permissions
  const userRoles = useMemo(() => {
    if (!user) {
      console.log('[useNavigation] No user, returning empty roles')
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

    console.log('[useNavigation] Final user roles:', roleNames)
    return roleNames
  }, [user, roles])

  // Check if user has any of the given roles
  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    if (!roleNames || roleNames.length === 0) return true

    // Admin has all access
    if (userRoles.includes('admin') || userRoles.includes('super_admin')) return true

    // Check if user has any of the required roles
    const hasRole = roleNames.some(role =>
      userRoles.includes(role.toLowerCase())
    )

    console.log('[hasAnyRole]', {
      requiredRoles: roleNames,
      userRoles,
      hasRole
    })

    return hasRole
  }, [userRoles])

  // Check if an item is accessible - ONLY BASED ON ROLES
  const isItemAccessible = useCallback((item: NavItem): boolean => {
    console.log(`[useNavigation] Checking item accessibility: ${item.name}`, {
      roles: item.roles,
      userRoles,
      isAuthenticated
    })

    // If no roles specified, accessible to all authenticated users
    if (!item.roles || item.roles.length === 0) {
      return isAuthenticated
    }

    // Check roles (OR logic) - user must have at least one of the required roles
    const hasRole = hasAnyRole(item.roles)

    if (!hasRole) {
      console.log(`[useNavigation] Item ${item.name} - Role check failed. Required:`, item.roles, 'User has:', userRoles)
      return false
    }

    console.log(`[useNavigation] Item ${item.name} - ACCESSIBLE (role check passed)`)
    return true
  }, [isAuthenticated, hasAnyRole, userRoles])

  // Build filtered navigation
  const navigation = useMemo(() => {
    console.log('[useNavigation] Building filtered navigation', {
      isAuthenticated,
      hasUser: !!user,
      userRoles,
      sectionsCount: navigationSections.length
    })

    if (!isAuthenticated || !user) {
      console.log('[useNavigation] Not authenticated or no user, returning empty navigation')
      return []
    }

    const filtered: NavigationSection[] = []

    for (const section of navigationSections) {
      console.log(`[useNavigation] Processing section: ${section.id} - ${section.title}`)

      // Filter items in this section based on roles
      const filteredItems = section.items.filter(item => {
        const accessible = isItemAccessible(item)
        return accessible
      })

      console.log(`[useNavigation] Section ${section.id} - Filtered items: ${filteredItems.length}/${section.items.length}`)

      // If no items in this section, skip the section
      if (filteredItems.length === 0) {
        console.log(`[useNavigation] Section ${section.id} - Skipping (no items)`)
        continue
      }

      filtered.push({
        ...section,
        items: filteredItems
      })
    }

    console.log('[useNavigation] Final navigation sections:', filtered.map(s => ({
      id: s.id,
      title: s.title,
      itemsCount: s.items.length
    })))

    return filtered
  }, [isAuthenticated, user, isItemAccessible, userRoles])

  // Auto-open section based on current path
  useEffect(() => {
    if (navigation.length === 0) {
      console.log('[useNavigation] No navigation items, skipping auto-open')
      return
    }

    console.log('[useNavigation] Auto-opening section for path:', pathname)
    let foundSection: string | null = null

    for (const section of navigation) {
      for (const item of section.items) {
        // Check if current path matches this item
        if (item.href === pathname) {
          console.log(`[useNavigation] Found exact match in section ${section.id}:`, item.name)
          foundSection = section.id
          break
        }
        // Check if current path starts with item href (for nested routes)
        if (item.href !== '/' && pathname.startsWith(item.href)) {
          console.log(`[useNavigation] Found prefix match in section ${section.id}:`, item.name)
          foundSection = section.id
          break
        }
        // Check children
        if (item.children) {
          for (const child of item.children) {
            if (child.href === pathname || (child.href !== '/' && pathname.startsWith(child.href))) {
              console.log(`[useNavigation] Found child match in section ${section.id}:`, child.name)
              foundSection = section.id
              break
            }
          }
        }
        if (foundSection) break
      }
      if (foundSection) break
    }

    if (foundSection) {
      console.log('[useNavigation] Opening section:', foundSection)
      setOpenSections(prev => {
        const newSet = new Set(prev)
        newSet.add(foundSection)
        return newSet
      })
    } else {
      console.log('[useNavigation] No matching section found for path:', pathname)
    }
  }, [pathname, navigation])

  const toggleSection = useCallback((sectionId: string) => {
    console.log('[useNavigation] toggleSection called:', sectionId)
    setOpenSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }, [])

  const isSectionOpen = useCallback((sectionId: string, defaultOpen?: boolean) => {
    if (openSections.has(sectionId)) return true
    return defaultOpen || false
  }, [openSections])

  // Get primary role
  const primaryRole = userRoles.length > 0 ? userRoles[0] : 'guest'
  console.log('[useNavigation] Primary role determined:', primaryRole, 'from roles:', userRoles)

  return {
    navigation,
    userRole: primaryRole,
    userRoles,
    openSections,
    toggleSection,
    isSectionOpen,
    hasAnyRole
  }
}
