'use client'

import { useNetwork } from '@/contexts/NetworkContext'
import { useEffect } from 'react'

export function OfflineHandler({ children }: { children: React.ReactNode }) {
  const { isOnline } = useNetwork()

  useEffect(() => {
    if (!isOnline) {
      // You can show a toast notification here if you have a toast system
      console.log('User is offline')
    }
  }, [isOnline])

  return <>{children}</>
}
