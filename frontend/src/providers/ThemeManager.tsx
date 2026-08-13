// src/providers/ThemeManager.tsx

'use client'

import {
  Space_Grotesk,
  Inter,
  Plus_Jakarta_Sans,
  DM_Sans,
  Nunito_Sans,
  Poppins,
  Manrope,
  Outfit,
  Urbanist,
} from 'next/font/google'
import { useCompanyProfile } from '@/hooks/useCompanyProfile'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { navigationSections } from '@/lib/navigation/sections'

// ============================================
// FONT CONFIGURATION - ALL FONTS IMPORTED
// ============================================

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

// ============================================
// FONT MAP
// ============================================

const FONTS: Record<string, { name: string; className: string; fontFamily: string }> = {
  'space-grotesk': {
    name: 'Space Grotesk',
    className: spaceGrotesk.className,
    fontFamily: 'Space Grotesk, sans-serif',
  },
  'inter': {
    name: 'Inter',
    className: inter.className,
    fontFamily: 'Inter, sans-serif',
  },
  'dm-sans': {
    name: 'DM Sans',
    className: dmSans.className,
    fontFamily: 'DM Sans, sans-serif',
  },
  'plus-jakarta': {
    name: 'Plus Jakarta Sans',
    className: plusJakarta.className,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  },
  'nunito-sans': {
    name: 'Nunito Sans',
    className: nunitoSans.className,
    fontFamily: 'Nunito Sans, sans-serif',
  },
  'poppins': {
    name: 'Poppins',
    className: poppins.className,
    fontFamily: 'Poppins, sans-serif',
  },
  'manrope': {
    name: 'Manrope',
    className: manrope.className,
    fontFamily: 'Manrope, sans-serif',
  },
  'outfit': {
    name: 'Outfit',
    className: outfit.className,
    fontFamily: 'Outfit, sans-serif',
  },
  'urbanist': {
    name: 'Urbanist',
    className: urbanist.className,
    fontFamily: 'Urbanist, sans-serif',
  },
  'Inter': {
    name: 'Inter',
    className: inter.className,
    fontFamily: 'Inter, sans-serif',
  },
  'Roboto': {
    name: 'Roboto',
    className: inter.className,
    fontFamily: 'Roboto, sans-serif',
  },
  'Open Sans': {
    name: 'Open Sans',
    className: inter.className,
    fontFamily: 'Open Sans, sans-serif',
  },
  'Lato': {
    name: 'Lato',
    className: inter.className,
    fontFamily: 'Lato, sans-serif',
  },
  'Montserrat': {
    name: 'Montserrat',
    className: inter.className,
    fontFamily: 'Montserrat, sans-serif',
  },
  'Poppins': {
    name: 'Poppins',
    className: poppins.className,
    fontFamily: 'Poppins, sans-serif',
  },
  'Nunito': {
    name: 'Nunito',
    className: nunitoSans.className,
    fontFamily: 'Nunito, sans-serif',
  },
  'Raleway': {
    name: 'Raleway',
    className: inter.className,
    fontFamily: 'Raleway, sans-serif',
  },
  'Playfair Display': {
    name: 'Playfair Display',
    className: inter.className,
    fontFamily: 'Playfair Display, serif',
  },
  'Merriweather': {
    name: 'Merriweather',
    className: inter.className,
    fontFamily: 'Merriweather, serif',
  },
  'Fira Sans': {
    name: 'Fira Sans',
    className: inter.className,
    fontFamily: 'Fira Sans, sans-serif',
  },
  'Oswald': {
    name: 'Oswald',
    className: inter.className,
    fontFamily: 'Oswald, sans-serif',
  },
  'Source Sans Pro': {
    name: 'Source Sans Pro',
    className: inter.className,
    fontFamily: 'Source Sans Pro, sans-serif',
  },
  'Quicksand': {
    name: 'Quicksand',
    className: inter.className,
    fontFamily: 'Quicksand, sans-serif',
  },
  'Work Sans': {
    name: 'Work Sans',
    className: inter.className,
    fontFamily: 'Work Sans, sans-serif',
  },
}

const DEFAULT_FONT = 'manrope'

// ============================================
// BRANDING STYLES
// ============================================

const getBrandStyles = (profile: any) => {
  const primaryColor = profile?.primary_color || '#1a237e'
  const secondaryColor = profile?.secondary_color || '#3498db'
  const accentColor = profile?.accent_color || '#ffc107'
  const companyName = profile?.company_name || 'SSPMS'

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '26, 35, 126'
  }

  const primaryRgb = hexToRgb(primaryColor)
  const secondaryRgb = hexToRgb(secondaryColor)
  const accentRgb = hexToRgb(accentColor)

  return `
    :root {
      --primary-color: ${primaryColor} !important;
      --secondary-color: ${secondaryColor} !important;
      --accent-color: ${accentColor} !important;
      --primary-color-rgb: ${primaryRgb} !important;
      --secondary-color-rgb: ${secondaryRgb} !important;
      --accent-color-rgb: ${accentRgb} !important;
      --company-name: "${companyName}" !important;
    }

    .brand-primary { color: var(--primary-color) !important; }
    .brand-secondary { color: var(--secondary-color) !important; }
    .brand-accent { color: var(--accent-color) !important; }

    .bg-brand-primary { background-color: var(--primary-color) !important; }
    .bg-brand-secondary { background-color: var(--secondary-color) !important; }
    .bg-brand-accent { background-color: var(--accent-color) !important; }

    .border-brand-primary { border-color: var(--primary-color) !important; }
    .border-brand-secondary { border-color: var(--secondary-color) !important; }
    .border-brand-accent { border-color: var(--accent-color) !important; }

    .hover\\:brand-primary:hover { color: var(--primary-color) !important; }
    .hover\\:brand-secondary:hover { color: var(--secondary-color) !important; }
    .hover\\:brand-accent:hover { color: var(--accent-color) !important; }

    .hover\\:bg-brand-primary:hover { background-color: var(--primary-color) !important; }
    .hover\\:bg-brand-secondary:hover { background-color: var(--secondary-color) !important; }
    .hover\\:bg-brand-accent:hover { background-color: var(--accent-color) !important; }

    .ring-brand-primary { --tw-ring-color: var(--primary-color) !important; }
    .ring-brand-secondary { --tw-ring-color: var(--secondary-color) !important; }
    .ring-brand-accent { --tw-ring-color: var(--accent-color) !important; }

    .bg-gradient-brand {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)) !important;
    }
    .bg-gradient-brand-accent {
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color)) !important;
    }
    .bg-gradient-secondary-accent {
      background: linear-gradient(135deg, var(--secondary-color), var(--accent-color)) !important;
    }

    .text-gradient-brand {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }

    .shadow-brand {
      box-shadow: 0 4px 14px 0 rgba(var(--primary-color-rgb), 0.2) !important;
    }
    .shadow-brand-lg {
      box-shadow: 0 10px 40px 0 rgba(var(--primary-color-rgb), 0.3) !important;
    }

    .focus\\:ring-brand-primary:focus {
      --tw-ring-color: var(--primary-color) !important;
    }
    .focus\\:ring-brand-secondary:focus {
      --tw-ring-color: var(--secondary-color) !important;
    }
    .focus\\:ring-brand-accent:focus {
      --tw-ring-color: var(--accent-color) !important;
    }
  `
}

// ============================================
// PAGE TITLE MAPPINGS WITH DESCRIPTIONS
// ============================================

const getPageTitle = (pathname: string, companyName: string = 'SSPMS'): string => {
  let pageTitle = ''
  let pageDescription = ''

  // Search through navigation sections
  for (const section of navigationSections) {
    for (const item of section.items) {
      if (item.href === pathname) {
        pageTitle = item.name
        pageDescription = item.description || ''
        break
      }
      if (item.href.includes('[id]') && pathname.match(new RegExp('^' + item.href.replace('[id]', '[^/]+') + '$'))) {
        pageTitle = item.name
        pageDescription = item.description || ''
        break
      }
    }
    if (pageTitle) break
  }

  // Fallback mappings
  if (!pageTitle) {
    const fallbackRoutes: Record<string, string> = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/profile': 'Profile Settings',
      '/profile/company': 'Company Profile',
      '/profile/supplier': 'Supplier Profile',
      '/settings': 'Settings',
      '/settings/general': 'General Settings',
      '/settings/security': 'Security Settings',
      '/settings/branding': 'Branding Settings',
      '/admin/users': 'User Management',
      '/admin/suppliers': 'Supplier Management',
      '/admin/permissions': 'Permission Matrix',
      '/admin/departments': 'Departments',
      '/admin/settings': 'System Settings',
      '/admin/audit': 'Audit Logs',
      '/admin/status': 'System Status',
      '/admin/backup': 'Backup & Restore',
      '/requisitions/create': 'Create Requisition',
      '/requisitions/manage': 'Manage Requisitions',
      '/requisitions/history': 'Requisitions History',
      '/requisitions/pending': 'Pending Approvals',
      '/procurement/dashboard': 'Procurement Dashboard',
      '/procurement/quotations/create': 'Create Quotation',
      '/procurement/quotations/manage': 'Manage Quotations',
      '/procurement/tenders': 'Tenders',
      '/procurement/purchase-orders': 'Purchase Orders',
      '/procurement/grn': 'Goods Received',
      '/procurement/san': 'Service Acknowledgment',
      '/procurement/invoices': 'Invoices',
      '/procurement/payments': 'Payments',
      '/procurement/contracts': 'Contracts',
      '/procurement/planning': 'Procurement Planning',
      '/orders': 'Manage Orders',
      '/orders/track': 'Track Orders',
      '/orders/history': 'Order History',
      '/invoices': 'Invoices',
      '/payments/vouchers': 'Payment Vouchers',
      '/payments/cheques': 'Cheque Management',
      '/payments/analytics': 'Payment Analytics',
      '/budget': 'Budget Overview',
      '/budget/expenditure': 'Expenditure',
      '/reports': 'All Reports',
      '/reports/custom': 'Custom Reports',
      '/notifications': 'Notifications',
      '/messages': 'Messages',
      '/announcements': 'Announcements',
      '/help/tickets': 'Support Tickets',
      '/help': 'Knowledge Base',
      '/hr': 'Staff Management',
      '/hr/performance': 'Performance & Training',
      '/assets': 'Assets & Inventory',
      '/facilities': 'Facilities & Rooms',
    }

    if (fallbackRoutes[pathname]) {
      pageTitle = fallbackRoutes[pathname]
    } else {
      for (const [route, title] of Object.entries(fallbackRoutes)) {
        if (route.includes('[id]') && pathname.match(new RegExp('^' + route.replace('[id]', '[^/]+') + '$'))) {
          pageTitle = title
          break
        }
      }
    }

    if (!pageTitle) {
      const pathSegments = pathname.split('/').filter(Boolean)
      if (pathSegments.length === 0) {
        pageTitle = 'Dashboard'
      } else {
        const lastSegment = pathSegments[pathSegments.length - 1]
        pageTitle = lastSegment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
    }
  }

  if (pageDescription) {
    return `${pageTitle} - ${pageDescription} | ${companyName}`
  }

  return `${pageTitle} | ${companyName}`
}

// ============================================
// THEME MANAGER COMPONENT
// ============================================

export function ThemeManager({ children }: { children: React.ReactNode }) {
  const { useGetProfile } = useCompanyProfile()
  const { data } = useGetProfile()
  const pathname = usePathname()

  const [profile, setProfile] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const previousProfileRef = useRef<any>(null)
  const hasAppliedRef = useRef(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Extract profile data
  useEffect(() => {
    if (!isMounted) return

    let profileData: any = null
    const dataObj = data as any

    if (dataObj) {
      if (dataObj.data && typeof dataObj.data === 'object' && dataObj.data.id) {
        profileData = dataObj.data
      } else if (dataObj.success && dataObj.data && dataObj.data.id) {
        profileData = dataObj.data
      } else if (dataObj.id) {
        profileData = dataObj
      } else if (dataObj.data && dataObj.data.data && dataObj.data.data.id) {
        profileData = dataObj.data.data
      }
    }

    if (profileData) {
      setProfile(profileData)
    }
  }, [data, isMounted])

  // Update page title whenever pathname or profile changes
  useEffect(() => {
    if (!isMounted) return

    const companyName = profile?.company_name || 'SSPMS'
    const title = getPageTitle(pathname, companyName)
    document.title = title
  }, [pathname, profile, isMounted])

  // Apply theme changes (font, colors, etc.)
  useEffect(() => {
    if (!isMounted) return
    if (!profile) return

    const prev = previousProfileRef.current
    const curr = profile

    if (prev) {
      const changes = []
      if (prev.font_family !== curr.font_family) changes.push('font_family')
      if (prev.primary_color !== curr.primary_color) changes.push('primary_color')
      if (prev.secondary_color !== curr.secondary_color) changes.push('secondary_color')
      if (prev.accent_color !== curr.accent_color) changes.push('accent_color')
      if (prev.logo_url !== curr.logo_url) changes.push('logo_url')
      if (prev.company_name !== curr.company_name) changes.push('company_name')

      if (changes.length === 0 && hasAppliedRef.current) return
    }

    // Apply font
    const fontName = profile.font_family || DEFAULT_FONT
    const fontConfig = FONTS[fontName]
    if (fontConfig) {
      const classes = document.documentElement.className.split(' ')
      const filteredClasses = classes.filter(cls => {
        return !Object.values(FONTS).some(f => f.className === cls)
      })
      document.documentElement.className = filteredClasses.join(' ')
      document.documentElement.classList.add(fontConfig.className)

      document.body.style.setProperty('font-family', fontConfig.fontFamily, 'important')
      document.body.style.setProperty('--font-family', fontConfig.fontFamily, 'important')
      document.documentElement.style.setProperty('font-family', fontConfig.fontFamily, 'important')
    }

    // Apply brand styles
    const styleElement = document.getElementById('brand-styles')
    const newStyles = getBrandStyles(profile)

    if (styleElement) {
      styleElement.textContent = newStyles
    } else {
      const newStyle = document.createElement('style')
      newStyle.id = 'brand-styles'
      newStyle.textContent = newStyles
      document.head.appendChild(newStyle)
    }

    // Update favicon
    if (profile.logo_url || profile.company_logo) {
      const logoUrl = profile.logo_url || profile.company_logo
      const existingLinks = document.querySelectorAll("link[rel*='icon']")
      if (existingLinks.length > 0) {
        existingLinks.forEach(link => {
          ; (link as HTMLLinkElement).href = logoUrl
        })
      } else {
        const link = document.createElement('link')
        link.rel = 'icon'
        link.href = logoUrl
        document.head.appendChild(link)
      }

      let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement
      if (!appleLink) {
        appleLink = document.createElement('link')
        appleLink.rel = 'apple-touch-icon'
        document.head.appendChild(appleLink)
      }
      appleLink.href = logoUrl
    }

    // Update theme color
    if (profile.primary_color) {
      let meta = document.querySelector("meta[name='theme-color']") as HTMLMetaElement
      if (meta) {
        meta.content = profile.primary_color
      } else {
        meta = document.createElement('meta')
        meta.name = 'theme-color'
        meta.content = profile.primary_color
        document.head.appendChild(meta)
      }
    }

    previousProfileRef.current = profile
    hasAppliedRef.current = true
  }, [profile, isMounted])

  return <>{children}</>
}
