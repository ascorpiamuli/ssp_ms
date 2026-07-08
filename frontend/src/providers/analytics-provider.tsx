'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function AnalyticsProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Page View]:', {
        path: pathname,
        params: Object.fromEntries(searchParams.entries()),
        timestamp: new Date().toISOString()
      })
    }
  }, [pathname, searchParams])

  return (
    <>
      <Analytics
        mode="auto"
        debug={process.env.NODE_ENV === 'development'}
        beforeSend={(event) => {
          if (process.env.NODE_ENV === 'development') {
            console.group('🔍 Analytics Event')
            console.log('Event:', event)
            console.log('Timestamp:', new Date().toISOString())
            console.groupEnd()
          }
          return event
        }}
      />
      <SpeedInsights
        debug={process.env.NODE_ENV === 'development'}
      />
    </>
  )
}
