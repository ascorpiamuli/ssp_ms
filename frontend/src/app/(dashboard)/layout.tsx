'use client'

import { AuthProvider, useAuthContext } from '@/contexts/AuthContext'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardFooter } from '@/components/dashboard/footer'
import { LoadingSpinner } from '../../components/ui/loading'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function DashboardContent({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    isAuthenticated,
    isLoading,
    user,
    isProfileComplete,
  } = useAuthContext()
  const router = useRouter()

  // Log authentication state on mount and when it changes
  useEffect(() => {
    console.log('🔐 DashboardLayout - Auth State:', {
      isAuthenticated,
      isLoading,
      user: user ? {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_approved: user.is_approved,
      } : null,
      isProfileComplete,
      pathname: window.location.pathname,
    })
  }, [isAuthenticated, isLoading, user, isProfileComplete])

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('🔄 DashboardLayout - Checking authentication...', {
      isLoading,
      isAuthenticated,
      willRedirect: !isLoading && !isAuthenticated,
    })

    if (!isLoading && !isAuthenticated) {
      console.log('🔴 DashboardLayout - Not authenticated, redirecting to login...')
      router.push('/login')
    } else if (!isLoading && isAuthenticated) {
      console.log('✅ DashboardLayout - Authenticated successfully!')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading while checking auth
  if (isLoading) {
    console.log('⏳ DashboardLayout - Loading...')
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    console.log('🔴 DashboardLayout - Not authenticated, returning null')
    return null
  }

  console.log('✅ DashboardLayout - Rendering dashboard with user:', user?.full_name || user?.email)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto lg:px-8">
            {children}
          </div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  )
}

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('🚀 DashboardLayoutWrapper - Rendering with AuthProvider')

  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  )
}
