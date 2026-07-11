// contexts/AdminContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useDepartments } from '@/hooks/useDepartments'
import { UserFilters } from '@/services/user.service'

// Extended filter type that allows 'all' for UI state
interface AdminUserFilters {
  search: string
  role: string
  status: 'all' | 'active' | 'inactive' | 'pending'
  department: string
  sort_by: string
  sort_order: 'asc' | 'desc'
  per_page: number
  page: number
}

interface AdminContextType {
  // Users
  users: any[]
  usersLoading: boolean
  usersTotal: number
  userStats: any
  userStatsLoading: boolean
  fetchUsers: (filters?: Partial<AdminUserFilters>) => Promise<void>
  refetchUsers: () => void

  // Roles
  roles: any[]
  rolesLoading: boolean
  rolesStats: any
  rolesStatsLoading: boolean
  permissions: any[]
  permissionsLoading: boolean
  permissionsGrouped: any[]
  permissionsGroupedLoading: boolean
  refetchRoles: () => void

  // Departments
  departments: any[]
  departmentsLoading: boolean
  departmentsStats: any
  departmentsStatsLoading: boolean
  refetchDepartments: () => void

  // Mutations
  createUser: (data: any) => Promise<any>
  updateUser: (id: number, data: any) => Promise<any>
  deleteUser: (id: number) => Promise<any>
  approveUser: (id: number) => Promise<any>
  rejectUser: (id: number) => Promise<any>
  activateUser: (id: number) => Promise<any>
  deactivateUser: (id: number) => Promise<any>
  resetUserPassword: (id: number, password: string) => Promise<any>
  bulkAction: (data: any) => Promise<any>

  createRole: (data: any) => Promise<any>
  updateRole: (id: number, data: any) => Promise<any>
  deleteRole: (id: number) => Promise<any>
  assignPermissions: (id: number, permissions: string[]) => Promise<any>

  createDepartment: (data: any) => Promise<any>
  updateDepartment: (id: number, data: any) => Promise<any>
  deleteDepartment: (id: number) => Promise<any>
  assignHOD: (id: number, userId: number) => Promise<any>
  removeHOD: (id: number) => Promise<any>

  // Loading states
  isMutating: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  // ============================================
  // HOOKS
  // ============================================
  const {
    useGetUsers,
    useGetUserStats,
    createUser: createUserMutation,
    updateUser: updateUserMutation,
    deleteUser: deleteUserMutation,
    approveUser: approveUserMutation,
    rejectUser: rejectUserMutation,
    activateUser: activateUserMutation,
    deactivateUser: deactivateUserMutation,
    resetPassword: resetPasswordMutation,
    bulkAction: bulkActionMutation,
  } = useUsers()

  const {
    useAllRoles,
    useRoleStats,
    usePermissions,
    usePermissionsGrouped,
    createRole: createRoleMutation,
    updateRole: updateRoleMutation,
    deleteRole: deleteRoleMutation,
    assignPermissions: assignPermissionsMutation,
  } = useRoles()

  const {
    useAllDepartments,
    useDepartmentStats,
    createDepartment: createDepartmentMutation,
    updateDepartment: updateDepartmentMutation,
    deleteDepartment: deleteDepartmentMutation,
    assignHOD: assignHODMutation,
    removeHOD: removeHODMutation,
  } = useDepartments()

  // ============================================
  // QUERIES - USERS
  // ============================================
  const [userFilters, setUserFilters] = useState<AdminUserFilters>({
    page: 1,
    per_page: 10,
    search: '',
    role: 'all',
    status: 'all',
    department: 'all',
    sort_by: 'created_at',
    sort_order: 'desc'
  })

  // Convert filters for API - remove 'all' values
  const apiFilters = {
    page: userFilters.page,
    per_page: userFilters.per_page,
    search: userFilters.search || undefined,
    role: userFilters.role === 'all' ? undefined : userFilters.role,
    status: userFilters.status === 'all' ? undefined : userFilters.status,
    department: userFilters.department === 'all' ? undefined : userFilters.department,
    sort_by: userFilters.sort_by,
    sort_order: userFilters.sort_order,
  }

  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsersQuery
  } = useGetUsers(apiFilters)

  const {
    data: statsData,
    isLoading: userStatsLoading,
    refetch: refetchStats
  } = useGetUserStats()

  // ============================================
  // QUERIES - ROLES
  // ============================================
  const {
    data: rolesData,
    isLoading: rolesLoading,
    refetch: refetchRolesQuery
  } = useAllRoles()

  const {
    data: roleStatsData,
    isLoading: rolesStatsLoading,
    refetch: refetchRoleStats
  } = useRoleStats()

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    refetch: refetchPermissions
  } = usePermissions()

  const {
    data: permissionsGroupedData,
    isLoading: permissionsGroupedLoading,
    refetch: refetchPermissionsGrouped
  } = usePermissionsGrouped()

  // ============================================
  // QUERIES - DEPARTMENTS
  // ============================================
  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    refetch: refetchDepartmentsQuery
  } = useAllDepartments()

  const {
    data: departmentStatsData,
    isLoading: departmentsStatsLoading,
    refetch: refetchDepartmentStats
  } = useDepartmentStats()

  // ============================================
  // MUTATION LOADING STATE
  // ============================================
  const [isMutating, setIsMutating] = useState(false)

  // ============================================
  // WRAPPED MUTATIONS
  // ============================================

  // User Mutations
  const createUser = useCallback(async (data: any) => {
    setIsMutating(true)
    try {
      const result = await createUserMutation.mutateAsync(data)
      await Promise.all([refetchUsersQuery(), refetchStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [createUserMutation, refetchUsersQuery, refetchStats])

  const updateUser = useCallback(async (id: number, data: any) => {
    setIsMutating(true)
    try {
      const result = await updateUserMutation.mutateAsync({ id, data })
      await Promise.all([refetchUsersQuery(), refetchStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [updateUserMutation, refetchUsersQuery, refetchStats])

  const deleteUser = useCallback(async (id: number) => {
    setIsMutating(true)
    try {
      const result = await deleteUserMutation.mutateAsync(id)
      await Promise.all([refetchUsersQuery(), refetchStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [deleteUserMutation, refetchUsersQuery, refetchStats])

  const approveUser = useCallback(async (id: number) => {
    setIsMutating(true)
    try {
      const result = await approveUserMutation.mutateAsync(id)
      await Promise.all([refetchUsersQuery(), refetchStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [approveUserMutation, refetchUsersQuery, refetchStats])

  const rejectUser = useCallback(async (id: number) => {
    setIsMutating(true)
    try {
      const result = await rejectUserMutation.mutateAsync(id)
      await Promise.all([refetchUsersQuery(), refetchStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [rejectUserMutation, refetchUsersQuery, refetchStats])

  const activateUser = useCallback(async (id: number) => {
    setIsMutating(true)
    try {
      const result = await activateUserMutation.mutateAsync(id)
      await Promise.all([refetchUsersQuery(), refetchStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [activateUserMutation, refetchUsersQuery, refetchStats])

  const deactivateUser = useCallback(async (id: number) => {
    setIsMutating(true)
    try {
      const result = await deactivateUserMutation.mutateAsync(id)
      await Promise.all([refetchUsersQuery(), refetchStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [deactivateUserMutation, refetchUsersQuery, refetchStats])

  const resetUserPassword = useCallback(async (id: number, password: string) => {
    setIsMutating(true)
    try {
      const result = await resetPasswordMutation.mutateAsync({ id, password })
      return result
    } finally {
      setIsMutating(false)
    }
  }, [resetPasswordMutation])

  const bulkAction = useCallback(async (data: any) => {
    setIsMutating(true)
    try {
      const result = await bulkActionMutation.mutateAsync(data)
      await Promise.all([refetchUsersQuery(), refetchStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [bulkActionMutation, refetchUsersQuery, refetchStats])

  // Role Mutations
  const createRole = useCallback(async (data: any) => {
    setIsMutating(true)
    try {
      const result = await createRoleMutation.mutateAsync(data)
      await Promise.all([refetchRolesQuery(), refetchRoleStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [createRoleMutation, refetchRolesQuery, refetchRoleStats])

  const updateRole = useCallback(async (id: number, data: any) => {
    setIsMutating(true)
    try {
      const result = await updateRoleMutation.mutateAsync({ id, data })
      await Promise.all([refetchRolesQuery(), refetchRoleStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [updateRoleMutation, refetchRolesQuery, refetchRoleStats])

  const deleteRole = useCallback(async (id: number) => {
    setIsMutating(true)
    try {
      const result = await deleteRoleMutation.mutateAsync(id)
      await Promise.all([refetchRolesQuery(), refetchRoleStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [deleteRoleMutation, refetchRolesQuery, refetchRoleStats])

  const assignPermissions = useCallback(async (id: number, permissions: string[]) => {
    setIsMutating(true)
    try {
      const result = await assignPermissionsMutation.mutateAsync({ id, permissions })
      await Promise.all([refetchRolesQuery(), refetchPermissions(), refetchPermissionsGrouped()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [assignPermissionsMutation, refetchRolesQuery, refetchPermissions, refetchPermissionsGrouped])

  // Department Mutations
  const createDepartment = useCallback(async (data: any) => {
    setIsMutating(true)
    try {
      const result = await createDepartmentMutation.mutateAsync(data)
      await Promise.all([refetchDepartmentsQuery(), refetchDepartmentStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [createDepartmentMutation, refetchDepartmentsQuery, refetchDepartmentStats])

  const updateDepartment = useCallback(async (id: number, data: any) => {
    setIsMutating(true)
    try {
      const result = await updateDepartmentMutation.mutateAsync({ id, data })
      await Promise.all([refetchDepartmentsQuery(), refetchDepartmentStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [updateDepartmentMutation, refetchDepartmentsQuery, refetchDepartmentStats])

  const deleteDepartment = useCallback(async (id: number) => {
    setIsMutating(true)
    try {
      const result = await deleteDepartmentMutation.mutateAsync(id)
      await Promise.all([refetchDepartmentsQuery(), refetchDepartmentStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [deleteDepartmentMutation, refetchDepartmentsQuery, refetchDepartmentStats])

  const assignHOD = useCallback(async (id: number, userId: number) => {
    setIsMutating(true)
    try {
      const result = await assignHODMutation.mutateAsync({ id, hod_id: userId })
      await Promise.all([refetchDepartmentsQuery(), refetchDepartmentStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [assignHODMutation, refetchDepartmentsQuery, refetchDepartmentStats])

  const removeHOD = useCallback(async (id: number) => {
    setIsMutating(true)
    try {
      const result = await removeHODMutation.mutateAsync(id)
      await Promise.all([refetchDepartmentsQuery(), refetchDepartmentStats()])
      return result
    } finally {
      setIsMutating(false)
    }
  }, [removeHODMutation, refetchDepartmentsQuery, refetchDepartmentStats])

  // ============================================
  // FETCH FUNCTIONS
  // ============================================
  const fetchUsers = useCallback(async (filters?: Partial<AdminUserFilters>) => {
    if (filters) {
      setUserFilters(prev => ({ ...prev, ...filters }))
    } else {
      await refetchUsersQuery()
    }
  }, [refetchUsersQuery])

  const refetchUsers = useCallback(() => {
    refetchUsersQuery()
  }, [refetchUsersQuery])

  const refetchRoles = useCallback(() => {
    refetchRolesQuery()
  }, [refetchRolesQuery])

  const refetchDepartments = useCallback(() => {
    refetchDepartmentsQuery()
  }, [refetchDepartmentsQuery])

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AdminContextType = {
    // Users
    users: usersData?.data || [],
    usersLoading,
    usersTotal: usersData?.meta?.total || 0,
    userStats: statsData?.data || null,
    userStatsLoading,
    fetchUsers,
    refetchUsers,

    // Roles
    roles: rolesData?.data || [],
    rolesLoading,
    rolesStats: roleStatsData?.data || null,
    rolesStatsLoading,
    permissions: permissionsData?.data || [],
    permissionsLoading,
    permissionsGrouped: permissionsGroupedData?.data || [],
    permissionsGroupedLoading,
    refetchRoles,

    // Departments
    departments: departmentsData?.data || [],
    departmentsLoading,
    departmentsStats: departmentStatsData?.data || null,
    departmentsStatsLoading,
    refetchDepartments,

    // Mutations
    createUser,
    updateUser,
    deleteUser,
    approveUser,
    rejectUser,
    activateUser,
    deactivateUser,
    resetUserPassword,
    bulkAction,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignHOD,
    removeHOD,

    // Loading states
    isMutating,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

// ============================================
// HOOK TO USE ADMIN CONTEXT
// ============================================
export function useAdminContext() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider')
  }
  return context
}
