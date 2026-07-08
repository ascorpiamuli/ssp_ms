// lib/website-nav.config.ts
import {
  Home, Info, Users, Calendar, BookOpen, MessageCircle,
  Sparkles, Award, Church, Music, Shield, Crown, Flame,
  Clock, HandHeart, ShoppingBag, Gift, Shirt, Headphones,
  Camera, LayoutDashboard, GraduationCap, Briefcase,
  Send, Globe, ExternalLink, Heart, Star, CreditCard,
  DollarSign, FileText, HelpCircle,
  CrownIcon,
  Target,
  Palette,
  Package,
  Utensils,
  Coffee,
  Tv,
  Sun,
  Cross,
  Mic,
  Megaphone,
  Mail
} from "lucide-react"

export interface WebsiteNavItem {
  name: string
  href?: string
  icon?: any
  children?: WebsiteNavItem[]
  external?: boolean
}

export type DropdownItem = WebsiteNavItem

// ─── Navigation Configuration ──────────────────────────────────
export const websiteNavLinks: WebsiteNavItem[] = [
  { name: "Home", href: "/", icon: Home },
  {
    name: "About Us",
    icon: Info,
    children: [
      { name: "Who We Are", href: "/about", icon: Users },
      { name: "Leadership", href: "/about/leaders", icon: CrownIcon },
      { name: "Patron Saint", href: "/about/patron-saint", icon: Church },
      { name: "Contact", href: "/about/contact", icon: MessageCircle },
    ]
  },
  {
    name: "Community Groups",
    icon: Users,
    children: [
      {
        name: "Secretariat",
        icon: FileText,
        children: [
          { name: "Member Registry", href: "/community-groups/secretariat/members", icon: Users },
          { name: "Correspondence", href: "/community-groups/secretariat/correspondence", icon: Mail },
        ]
      },
      {
        name: "Treasury",
        icon: CreditCard,
        children: [
          { name: "Financial Reports", href: "/community-groups/treasury/reports", icon: FileText },
          { name: "Budget & Planning", href: "/community-groups/treasury/budget", icon: DollarSign },
          { name: "Finance Committee", href: "/community-groups/treasury/committee", icon: Users },
        ]
      },
      {
        name: "Communications",
        icon: Calendar,
        children: [
          { name: "Events Calendar", href: "/community-groups/events/calendar", icon: Calendar },
          { name: "Publicity & Media", href: "/community-groups/events/media", icon: Megaphone },
          { name: "Ceremonies & MC", href: "/community-groups/events/ceremonies", icon: Mic },
        ]
      },
      {
        name: "Liturgy",
        icon: Church,
        children: [
          { name: "Altar Servers", href: "/community-groups/liturgy/altar-servers", icon: Cross },
          { name: "Praise & Worship", href: "/community-groups/liturgy/praise-worship", icon: Heart },
          { name: "Lunch Hour Prayers", href: "/community-groups/liturgy/lunch-prayers", icon: Clock },
          {
            name: "Choir",
            icon: Music,
            children: [
              { name: "About Choir", href: "/community-groups/liturgy/choir/about", icon: Info },
              { name: "Join Choir", href: "/community-groups/liturgy/choir/join", icon: Users },
              { name: "Choir Gallery", href: "/community-groups/liturgy/choir/gallery", icon: Camera },
            ]
          },
          {
            name: "Liturgical Dancers",
            icon: Sparkles,
            href: "/community-groups/liturgy/dancers",
          }
        ]
      },
      {
        name: "Library & Assets",
        icon: BookOpen,
        href: "/community-groups/assets",
      },
      {
        name: "Hospitality",
        icon: Coffee,
        href: "/community-groups/hospitality",
      },
      {
        name: "SCCs (Jumuias)",
        icon: Heart,
        href: "/community-groups/sccs",
      },
      {
        name: "Associations",
        icon: Users,
        children: [
          { name: "CMA", icon: Shield, href: "/community-groups/associations/cma" },
          { name: "CLA", icon: Crown, href: "/community-groups/associations/cla" },
        ]
      },
      {
        name: "Welfare",
        icon: HandHeart,
        href: "/community-groups/welfare",
      },
    ]
  },
  {
    name: "Events",
    icon: Calendar,
    children: [
      { name: "Upcoming Events", href: "/events", icon: Calendar },
      { name: "Mass Schedule", href: "/events#mass-schedule", icon: Clock },
      { name: "Retreats", href: "/events#retreats", icon: Sparkles },
      { name: "Outreach", href: "/events#outreach", icon: HandHeart },
    ]
  },
  {
    name: "Resources",
    icon: BookOpen,
    children: [
      { name: "Constitution", href: "/constitution", icon: FileText },
      { name: "Faith Formation", href: "/resources#faith-formation", icon: BookOpen },
      { name: "Prayer Requests", href: "/resources#prayer-requests", icon: MessageCircle },
      { name: "FAQ", href: "/faq", icon: HelpCircle },
    ]
  },
  {
    name: "Portals",
    icon: GraduationCap,
    children: [
      { name: "Member Portal", href: "https://app.tumcathcom.com", icon: LayoutDashboard, external: true },
      { name: "TUMMIS Portal", href: "https://smis.tum.ac.ke", icon: Globe, external: true },
      { name: "IAP Portal", href: "https://iap.tum.ac.ke", icon: Briefcase, external: true },
      { name: "Mailer", href: "https://mail.pasbestventures.com", icon: Send, external: true }
    ]
  },
  {
    name: "Shop",
    icon: ShoppingBag,
    children: [
      { name: "T-Shirts", href: "/shop/tshirts", icon: Shirt },
      { name: "Hoodies", href: "/shop/hoodies", icon: Shirt },
      { name: "Caps & Hats", href: "/shop/caps", icon: Headphones },
      { name: "Bibles & Books", href: "/shop/books", icon: BookOpen },
      { name: "Accessories", href: "/shop/accessories", icon: Camera },
    ]
  },
  {
    name: "Donate",
    icon: Gift,
    children: [
      { name: "Support Us", href: "/donate", icon: Heart },
      { name: "Give Online", href: "/donate/online", icon: CreditCard },
      { name: "Tithe & Offerings", href: "/donate/tithe", icon: DollarSign },
      { name: "Projects", href: "/donate/projects", icon: Star },
    ]
  },
]

// ─── LocalStorage Keys ──────────────────────────────────────────
const NAV_STORAGE_KEY = 'tumcathcom_nav_clicks'
const NAV_STATS_KEY = 'tumcathcom_nav_stats'

// ─── Types for Tracking ─────────────────────────────────────────
interface NavClickData {
  path: string
  name: string
  timestamp: string
  parentPath?: string
}

interface NavStats {
  totalClicks: number
  lastClick: string
  clicks: Record<string, number>
  lastVisited: string
}

// ─── Navigation Tracking Functions ─────────────────────────────

/**
 * Track a navigation click in localStorage
 */
export function trackNavClick(path: string, name: string, parentPath?: string): void {
  if (typeof window === 'undefined') return

  try {
    const clickData: NavClickData = {
      path,
      name,
      timestamp: new Date().toISOString(),
      parentPath
    }

    // Store click history (keep last 100 clicks)
    const history = getNavHistory()
    history.unshift(clickData)
    if (history.length > 100) {
      history.length = 100
    }
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(history))

    // Update stats
    updateNavStats(path, name)

    console.log('[Nav Track]', { path, name, parentPath })
  } catch (error) {
    console.error('[Nav Track] Error:', error)
  }
}

/**
 * Get navigation click history
 */
export function getNavHistory(): NavClickData[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(NAV_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * Update navigation statistics
 */
function updateNavStats(path: string, name: string): void {
  if (typeof window === 'undefined') return

  try {
    const currentStats = getNavStats()
    currentStats.totalClicks += 1
    currentStats.lastClick = new Date().toISOString()
    currentStats.lastVisited = path
    currentStats.clicks[path] = (currentStats.clicks[path] || 0) + 1

    localStorage.setItem(NAV_STATS_KEY, JSON.stringify(currentStats))
  } catch (error) {
    console.error('[Nav Track] Error updating stats:', error)
  }
}

/**
 * Get navigation statistics
 */
export function getNavStats(): NavStats {
  if (typeof window === 'undefined') {
    return { totalClicks: 0, lastClick: '', clicks: {}, lastVisited: '' }
  }
  try {
    const data = localStorage.getItem(NAV_STATS_KEY)
    return data ? JSON.parse(data) : { totalClicks: 0, lastClick: '', clicks: {}, lastVisited: '' }
  } catch {
    return { totalClicks: 0, lastClick: '', clicks: {}, lastVisited: '' }
  }
}

/**
 * Get most visited pages
 */
export function getMostVisitedPages(limit: number = 5): { path: string; count: number }[] {
  const stats = getNavStats()
  return Object.entries(stats.clicks)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Clear navigation history (for debugging)
 */
export function clearNavHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(NAV_STORAGE_KEY)
  localStorage.removeItem(NAV_STATS_KEY)
  console.log('[Nav Track] History cleared')
}

/**
 * Get popular pages (aggregated from localStorage)
 */
export function getPopularPages(): string[] {
  const history = getNavHistory()
  const pageCount: Record<string, number> = {}
  history.forEach(click => {
    pageCount[click.path] = (pageCount[click.path] || 0) + 1
  })
  return Object.entries(pageCount)
    .sort((a, b) => b[1] - a[1])
    .map(([path]) => path)
    .slice(0, 10)
}

// ─── Debug Helper ──────────────────────────────────────────────

/**
 * Log navigation stats to console (for debugging)
 */
export function debugNavStats(): void {
  if (typeof window === 'undefined') return
  console.log('=== NAVIGATION STATS ===')
  console.log('History:', getNavHistory())
  console.log('Stats:', getNavStats())
  console.log('Most Visited:', getMostVisitedPages())
  console.log('Popular Pages:', getPopularPages())
  console.log('========================')
}

// Make debug available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ; (window as any).__debugNav = debugNavStats
}
