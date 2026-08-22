'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { tokenManager } from '@/services/api'
import { User, UpdateProfileRequest, Role } from '@/types/auth.types'

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

  // Role helpers (existing)
  isAdmin: () => boolean
  isSupplier: () => boolean
  isHOD: () => boolean
  isAccountant: () => boolean
  isPrincipal: () => boolean
  isFinalApprover: () => boolean
  isStaff: () => boolean
  isAuditor: () => boolean
  isProcurement: () => boolean

  // NEW: Role label and description helpers
  getRoleLabel: () => string | null
  getRoleDescription: () => string | null
  getRoleName: () => string | null
  getRoleDisplayName: () => string
  getUserRolesWithDetails: () => Role[]
  hasRoleByNameOrLabel: (roleNameOrLabel: string) => boolean

  // Loading states
  isUpdatingProfile: boolean
  isChangingPassword: boolean
  isUploadingAvatar: boolean

  // Refetch user data
  refetchUser: () => Promise<void>
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

    // NEW: Role label and description helpers
    getRoleLabel,
    getRoleDescription,
    getRoleName,
    getRoleDisplayName,
    getUserRolesWithDetails,
    hasRoleByNameOrLabel,

    // Loading states
    isUpdatingProfile,
    isChangingPassword,
    isUploadingAvatar,

    refetchUser: refetchUserRaw,
  } = useAuth()

  const [isInitialized, setIsInitialized] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ✅ Track if we're in the middle of a redirect to avoid loops
  const isRedirectingRef = useRef(false)

  // ✅ Track previous path to detect if we just came from a public path
  const previousPathRef = useRef<string | null>(null)

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.get()
      if (token) {
        await refetchUserRaw()
      }
      setIsInitialized(true)
    }
    checkAuth()
  }, [refetchUserRaw])

  // ✅ Handle redirects based on auth state - WITH SAFEGUARDS
  useEffect(() => {
    // Don't redirect if not initialized or still loading
    if (!isInitialized || isLoading) return

    // Prevent multiple redirects
    if (isRedirectingRef.current) return

    const isPublicPath = publicPaths.some(path => pathname?.startsWith(path))

    // ✅ Special case: If we're on a public path and have a token but no user,
    // wait for the user to load before redirecting
    if (isPublicPath && tokenManager.get() && !user) {
      // User is loading, don't redirect
      return
    }

    // ✅ Redirect to login if not authenticated and on protected page
    if (!user && !isPublicPath) {
      isRedirectingRef.current = true
      router.push('/login')
      return
    }

    // ✅ Redirect to dashboard if authenticated and on public page
    if (user && isPublicPath) {
      isRedirectingRef.current = true
      router.push('/dashboard')
      return
    }

    // Reset redirect flag after successful navigation
    isRedirectingRef.current = false

  }, [user, isLoading, isInitialized, pathname, router])

  // ============================================
  // WRAPPED METHODS
  // ============================================

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    // Reset redirect flag before login
    isRedirectingRef.current = false
    await loginMutation({ email, password, rememberMe })
  }, [loginMutation])

  const logout = useCallback(async () => {
    // Reset redirect flag before logout
    isRedirectingRef.current = false
    await logoutMutation()
  }, [logoutMutation])

  const register = useCallback(async (userData: any) => {
    // ✅ Reset redirect flag before registration
    isRedirectingRef.current = false
    await registerMutation(userData)
  }, [registerMutation])

  const forgotPassword = useCallback(async (data: { email: string }) => {
    return await forgotPasswordMutation(data)
  }, [forgotPasswordMutation])

  const resetPassword = useCallback(async (data: { email: string; token: string; password: string; password_confirmation: string }) => {
    // ✅ Reset redirect flag before password reset
    isRedirectingRef.current = false
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

  // Wrap refetchUser with loading state
  const refetchUser = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refetchUserRaw()
    } finally {
      setIsRefreshing(false)
    }
  }, [refetchUserRaw])

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AuthContextType = {
    // User state
    user,
    isLoading: isLoading || !isInitialized || isRefreshing,
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

    // Role helpers (existing)
    isAdmin,
    isSupplier,
    isHOD,
    isAccountant,
    isPrincipal,
    isFinalApprover,
    isStaff,
    isAuditor,
    isProcurement,

    // NEW: Role label and description helpers
    getRoleLabel,
    getRoleDescription,
    getRoleName,
    getRoleDisplayName,
    getUserRolesWithDetails,
    hasRoleByNameOrLabel,

    // Loading states
    isUpdatingProfile,
    isChangingPassword,
    isUploadingAvatar,

    // Refetch user data
    refetchUser,
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
