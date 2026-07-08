'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface NetworkContextType {
  isOnline: boolean
  isSlowConnection: boolean
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [isSlowConnection, setIsSlowConnection] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Detect slow connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')

      connection.addEventListener('change', () => {
        setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <NetworkContext.Provider value={{ isOnline, isSlowConnection }}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => {
  const context = useContext(NetworkContext)
  if (!context) throw new Error('useNetwork must be used within NetworkStatusProvider')
  return context
}
