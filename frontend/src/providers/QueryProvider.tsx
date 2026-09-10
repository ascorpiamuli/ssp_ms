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
            // ============================================
            // CACHE & STALE TIME - PREVENT UNNECESSARY REFETCHES
            // ============================================

            // ✅ INCREASED: Data stays fresh for 5 minutes
            // No network requests for 5 minutes after fetch
            staleTime: 5 * 60 * 1000, // 5 minutes

            // ✅ INCREASED: Data stays in cache for 30 minutes
            // Even after becoming stale, it stays in cache
            gcTime: 30 * 60 * 1000, // 30 minutes (was 10 min)

            // ============================================
            // RETRY LOGIC - Only for legitimate failures
            // ============================================

            retry: (failureCount, error) => {
              // Don't retry on client errors (4xx)
              if ((error as any)?.response?.status === 400) return false
              if ((error as any)?.response?.status === 401) return false
              if ((error as any)?.response?.status === 403) return false
              if ((error as any)?.response?.status === 404) return false
              // Retry up to 2 times for server errors (5xx)
              return failureCount < 2
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

            // ============================================
            // REFETCHING BEHAVIOR - MINIMIZE NETWORK CALLS
            // ============================================

            // ❌ DISABLED: Don't refetch on window focus (prevents unwanted calls)
            refetchOnWindowFocus: false,

            // ✅ ENABLED: Only fetch on mount when data is stale
            refetchOnMount: true,

            // ❌ DISABLED: Don't refetch on reconnect (prevents network churn)
            refetchOnReconnect: false,

            // ❌ DISABLED: No automatic refetch interval
            refetchInterval: false,

            // ❌ DISABLED: Don't refetch in background
            refetchIntervalInBackground: false,

            // ============================================
            // PERFORMANCE OPTIMIZATIONS
            // ============================================

            enabled: true,
            throwOnError: false,

            // ✅ ENABLED: Keep previous data while fetching new data
            placeholderData: (previousData: any) => previousData,

            // ✅ ENABLED: Use cached data immediately
            initialData: undefined,
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
