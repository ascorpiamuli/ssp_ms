// lib/types/navigation.types.ts

import { LucideIcon } from 'lucide-react'

export interface NavItem {
  id: string
  name: string
  href: string
  icon: LucideIcon | string  // Allow both component and string
  description?: string
  permissions?: string[]
  roles?: string[]
  minRole?: string
  badge?: string
  badgeColor?: string
  isDynamic?: boolean
  badgeKey?: string  // ✅ Added: Key for dynamic badge updates
  children?: NavItem[]
  [key: string]: any  // Allow additional properties
}

export interface NavigationSection {
  id: string
  title: string
  icon: LucideIcon | string  // Allow both component and string
  defaultOpen?: boolean
  department?: string
  items: NavItem[]
  [key: string]: any  // Allow additional properties
}
