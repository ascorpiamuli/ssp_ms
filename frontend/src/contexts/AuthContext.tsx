'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { tokenManager } from '@/services/api'
import { User, UpdateProfileRequest } from '@/types/auth.types'

interface AuthContextType {
  // User state
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  // Auth methods
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  register: (userData: any) => Promise<void>

  // Password reset methods
  forgotPassword: (data: { email: string }) => Promise<any>
  resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }) => Promise<any>

  // Profile methods
  updateProfile: (data: UpdateProfileRequest) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  changePassword: (data: { current_password: string; password: string; password_confirmation: string }) => Promise<void>

  // Profile completion
  isProfileComplete: boolean
  profilePercentage: number
  refetchCompletionStatus: () => Promise<void>

  // Dropdown data
  departments: any[]
  availableRoles: any[]
  supplierCategories: any[]
  refreshDropdownData: () => void

  // Permission helpers
  hasPermission: (permission: string) => boolean
  hasRole: (roles: string | string[]) => boolean

  // Role helpers
  isAdmin: () => boolean
  isSupplier: () => boolean
  isHOD: () => boolean
  isAccountant: () => boolean
  isPrincipal: () => boolean
  isFinalApprover: () => boolean
  isStaff: () => boolean
  isAuditor: () => boolean
  isProcurement: () => boolean

  // Loading states
  isUpdatingProfile: boolean
  isChangingPassword: boolean
  isUploadingAvatar: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password']

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const {
    // User state
    user,
    isLoading,
    isAuthenticated,

    // Auth methods
    login: loginMutation,
    logout: logoutMutation,
    register: registerMutation,

    // Password reset methods
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,

    // Profile
    updateProfile: updateProfileMutation,
    changePassword: changePasswordMutation,
    uploadAvatar: uploadAvatarMutation,

    // Profile completion
    isProfileComplete,
    profilePercentage,
    refetchCompletionStatus: refetchCompletionStatusRaw,

    // Dropdown data
    departments,
    availableRoles,
    supplierCategories,
    refreshDropdownData,

    // Permission helpers
    hasPermission,
    hasRole,

    // Role helpers
    isAdmin,
    isSupplier,
    isHOD,
    isAccountant,
    isPrincipal,
    isFinalApprover,
    isStaff,
    isAuditor,
    isProcurement,

    // Loading states
    isUpdatingProfile,
    isChangingPassword,
    isUploadingAvatar,

    refetchUser,
  } = useAuth()

  const [isInitialized, setIsInitialized] = useState(false)

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.get()
      if (token) {
        await refetchUser()
      }
      setIsInitialized(true)
    }
    checkAuth()
  }, [refetchUser])

  // Handle redirects based on auth state
  useEffect(() => {
    if (!isInitialized || isLoading) return

    const isPublicPath = publicPaths.some(path => pathname?.startsWith(path))

    // Redirect to login if not authenticated and on protected page
    if (!user && !isPublicPath) {
      router.push('/login')
      return
    }

    // Redirect to dashboard if authenticated and on public page
    if (user && isPublicPath) {
      router.push('/dashboard')
      return
    }

  }, [user, isLoading, isInitialized, pathname, router, isProfileComplete])

  // ============================================
  // WRAPPED METHODS
  // ============================================

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    await loginMutation({ email, password, rememberMe })
  }, [loginMutation])

  const logout = useCallback(async () => {
    await logoutMutation()
  }, [logoutMutation])

  const register = useCallback(async (userData: any) => {
    await registerMutation(userData)
  }, [registerMutation])

  const forgotPassword = useCallback(async (data: { email: string }) => {
    return await forgotPasswordMutation(data)
  }, [forgotPasswordMutation])

  const resetPassword = useCallback(async (data: { email: string; token: string; password: string; password_confirmation: string }) => {
    return await resetPasswordMutation(data)
  }, [resetPasswordMutation])

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    await updateProfileMutation(data)
  }, [updateProfileMutation])

  const uploadAvatar = useCallback(async (file: File) => {
    await uploadAvatarMutation(file)
  }, [uploadAvatarMutation])

  const changePassword = useCallback(async (data: { current_password: string; password: string; password_confirmation: string }) => {
    await changePasswordMutation(data)
  }, [changePasswordMutation])

  // Wrap refetchCompletionStatus to match the expected type
  const refetchCompletionStatus = useCallback(async () => {
    await refetchCompletionStatusRaw()
  }, [refetchCompletionStatusRaw])

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AuthContextType = {
    // User state
    user,
    isLoading: isLoading || !isInitialized,
    isAuthenticated,

    // Auth methods
    login,
    logout,
    register,

    // Password reset methods
    forgotPassword,
    resetPassword,

    // Profile methods
    updateProfile,
    uploadAvatar,
    changePassword,

    // Profile completion
    isProfileComplete,
    profilePercentage,
    refetchCompletionStatus,

    // Dropdown data
    departments,
    availableRoles,
    supplierCategories,
    refreshDropdownData,

    // Permission helpers
    hasPermission,
    hasRole,

    // Role helpers
    isAdmin,
    isSupplier,
    isHOD,
    isAccountant,
    isPrincipal,
    isFinalApprover,
    isStaff,
    isAuditor,
    isProcurement,

    // Loading states
    isUpdatingProfile,
    isChangingPassword,
    isUploadingAvatar,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context in components
 */
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

/**
 * Re-export useAuth from hooks for convenience
 */
export { useAuth } from '@/hooks/useAuth'
