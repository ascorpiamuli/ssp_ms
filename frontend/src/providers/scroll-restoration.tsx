// src/components/providers/scroll-restoration.tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollRestoration({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Safely check if window is defined
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return <>{children}</>
}
