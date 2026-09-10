// lib/navigation/utils.ts

import { NavItem } from '@/lib/types/navigation.types'

export const COMING_SOON_ROUTE = '/coming-soon'

/**
 * Gets the appropriate href for a navigation item
 * If the item is disabled, returns the coming soon route
 */
export function getNavigationHref(item: NavItem): string {
  if (item.disabled) {
    return COMING_SOON_ROUTE
  }
  return item.href
}

/**
 * Checks if a navigation item is disabled
 */
export function isNavigationItemDisabled(item: NavItem): boolean {
  return item.disabled === true
}

/**
 * Gets the original href if the current path is the coming soon page
 * Used to determine which item was clicked
 */
export function getOriginalPathFromComingSoon(pathname: string): string | null {
  if (pathname === COMING_SOON_ROUTE) {
    // You can store the original path in sessionStorage or query params
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('redirected_from') || null
    }
  }
  return null
}
