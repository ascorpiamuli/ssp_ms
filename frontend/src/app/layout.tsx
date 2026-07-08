// src/app/layout.tsx
import type { Metadata } from 'next'
import {
  Space_Grotesk,
  Inter,
  Plus_Jakarta_Sans,
  DM_Sans,
  Nunito_Sans
} from 'next/font/google'
import { cn } from "@/lib/utils"
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/ui/toast-context'
import { ErrorBoundary } from '../providers/error-boundary'
import { NetworkStatusProvider } from '@/contexts/NetworkContext'
import { OfflineHandler } from '../providers/offline-handler'
import { ProgressBarProvider } from '../providers/progress-bar-provider'
import { ScrollRestoration } from '../providers/scroll-restoration'
import { GlobalModals } from '@/components/global-modals'
import './globals.css'

// ============================================
// FONT OPTIONS - Choose one
// ============================================

// Option 1: Space Grotesk (BEST for square/geometric feel)
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

// Option 2: Inter (Clean, slightly square)
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

// Option 3: DM Sans (Very geometric, square feel)
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-dm-sans',
  display: 'swap',
})

// Option 4: Plus Jakarta Sans
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

// Option 5: Nunito Sans (Slightly rounded but clean)
const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito-sans',
  display: 'swap',
})

// ============================================
// SELECT YOUR PRIMARY FONT HERE
// ============================================
// Change this to use different font options
// spaceGrotesk - BEST for square/geometric feel
// inter - Clean and professional
// dmSans - Very geometric
// plusJakarta - Modern and clean
// nunitoSans - Clean with slight rounding

const font = spaceGrotesk // ← Change this to try different fonts

// ============================================
// METADATA
// ============================================
export const metadata: Metadata = {
  title: 'SSPMS - School Supplies & Purchases Management System',
  description: 'Complete procurement lifecycle management for schools - From requisition to payment',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logo.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SSPMS',
  },
  formatDetection: {
    telephone: false,
  },
}

// ============================================
// LAYOUT
// ============================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={font.variable}>
      <body className={cn(font.className, "antialiased")}>
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NetworkStatusProvider>
                <OfflineHandler>
                  <ProgressBarProvider>
                    <ScrollRestoration>
                      <ToastProvider>
                        {/* Main content without aria-hidden interfering with dropdowns */}
                        <main className="min-h-screen bg-white dark:bg-gray-900">
                          {children}
                        </main>
                        <GlobalModals />

                      </ToastProvider>
                    </ScrollRestoration>
                  </ProgressBarProvider>
                </OfflineHandler>
              </NetworkStatusProvider>
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
