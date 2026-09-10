// src/app/layout.tsx

import type { Metadata } from 'next'
import { cn } from "@/lib/utils"
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/ui/toast-context'
import { ErrorBoundary } from '../providers/error-boundary'
import { NetworkStatusProvider } from '@/contexts/NetworkContext'
import { OfflineHandler } from '../providers/offline-handler'
import { ProgressBarProvider } from '../providers/progress-bar-provider'
import { ScrollRestoration } from '../providers/scroll-restoration'
import { GlobalModals } from '@/components/global-modals'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeManager } from '../providers/ThemeManager'
import './globals.css'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const content = (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="theme"
      >
        <ThemeManager>
          <NetworkStatusProvider>
            <OfflineHandler>
              <ProgressBarProvider>
                <ScrollRestoration>
                  <ToastProvider>
                    {/* CHANGED: Use bg-background instead of hardcoded colors.
                        This will now respect the black background defined in globals.css for dark mode. */}
                    <main className="min-h-screen bg-background text-foreground">
                      {children}
                    </main>
                    <GlobalModals />
                  </ToastProvider>
                </ScrollRestoration>
              </ProgressBarProvider>
            </OfflineHandler>
          </NetworkStatusProvider>
        </ThemeManager>
      </ThemeProvider>
    </QueryProvider>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      {/* Added bg-background here as well to ensure full coverage */}
      <body className="antialiased bg-background text-foreground">
        {isDevelopment ? (
          <ErrorBoundary>{content}</ErrorBoundary>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
