// src/providers/QueryProvider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache & Stale Time
            staleTime: 5 * 60 * 1000, // 5 minutes (increased from 1 min)
            gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)

            // Retry Logic
            retry: (failureCount, error) => {
              // Don't retry on 404 or 403
              if ((error as any)?.response?.status === 404) return false
              if ((error as any)?.response?.status === 403) return false
              return failureCount < 3 // Retry up to 3 times
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetching Behavior
            refetchOnWindowFocus: false, // Good for performance
            refetchOnMount: true,
            refetchOnReconnect: true,

            // Performance
            enabled: true,
            throwOnError: false, // Let components handle errors
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools

          initialIsOpen={false}
          buttonPosition="bottom-right"
          position="bottom"
        />
      )}
    </QueryClientProvider>
  )
}
