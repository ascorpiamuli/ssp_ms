// hooks/useRoles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import RoleService, { CreateRoleData, UpdateRoleData } from '@/services/role.service'
import { useToast } from '@/components/ui/toast-context'

// Helper to extract data from API response
const extractData = (response: any) => {
  if (response?.data?.data) return response.data.data
  if (response?.data) return response.data
  return response
}

// Helper to get error message
const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return 'An unexpected error occurred'
}

export function useRoles() {
  const queryClient = useQueryClient()
  const { error: toastError, success: toastSuccess } = useToast()

  // GET /roles/available (public)
  const useAvailableRoles = () => {
    return useQuery({
      queryKey: ['roles', 'available'],
      queryFn: async () => {
        const response = await RoleService.getAvailableRoles()
        return extractData(response)
      },
      staleTime: 10 * 60 * 1000,
    })
  }

  // GET /admin/roles
  const useAllRoles = () => {
    return useQuery({
      queryKey: ['roles', 'all'],
      queryFn: async () => {
        const response = await RoleService.getRoles()
        return extractData(response)
      },
      staleTime: 5 * 60 * 1000,
    })
  }

  // GET /admin/roles/{id}
  const useRole = (id: number) => {
    return useQuery({
      queryKey: ['roles', id],
      queryFn: async () => {
        const response = await RoleService.getRole(id)
        return extractData(response)
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })
  }

  // GET /admin/roles/stats
  const useRoleStats = () => {
    return useQuery({
      queryKey: ['roles', 'stats'],
      queryFn: async () => {
        const response = await RoleService.getRoleStats()
        return extractData(response)
      },
      staleTime: 5 * 60 * 1000,
    })
  }

  // GET /admin/roles/{id}/users
  const useRoleUsers = (id: number) => {
    return useQuery({
      queryKey: ['roles', id, 'users'],
      queryFn: async () => {
        const response = await RoleService.getRoleUsers(id)
        return extractData(response)
      },
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    })
  }

  // GET /admin/roles/permissions
  const usePermissions = () => {
    return useQuery({
      queryKey: ['permissions'],
      queryFn: async () => {
        const response = await RoleService.getPermissions()
        return extractData(response)
      },
      staleTime: 10 * 60 * 1000,
    })
  }

  // GET /admin/roles/permissions/grouped
  const usePermissionsGrouped = () => {
    return useQuery({
      queryKey: ['permissions', 'grouped'],
      queryFn: async () => {
        const response = await RoleService.getPermissionsGrouped()
        return extractData(response)
      },
      staleTime: 10 * 60 * 1000,
    })
  }

  // POST /admin/roles
  const createRole = useMutation({
    mutationFn: (data: CreateRoleData) => RoleService.createRole(data),
    onSuccess: (response) => {
      const role = extractData(response)
      toastSuccess(`Role "${role?.name || 'New Role'}" created successfully`)
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'stats'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  // PUT /admin/roles/{id}
  const updateRole = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleData }) =>
      RoleService.updateRole(id, data),
    onSuccess: (response, variables) => {
      const role = extractData(response)
      toastSuccess(`Role "${role?.name || variables.id}" updated successfully`)
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  // DELETE /admin/roles/{id}
  const deleteRole = useMutation({
    mutationFn: (id: number) => RoleService.deleteRole(id),
    onSuccess: (_, id) => {
      toastSuccess(`Role deleted successfully`)
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['roles', id] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  // POST /admin/roles/{id}/permissions
  const assignPermissions = useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
      RoleService.assignPermissions(id, permissions),
    onSuccess: (response, variables) => {
      const role = extractData(response)
      toastSuccess(`Permissions updated for role "${role?.name || variables.id}"`)
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      queryClient.invalidateQueries({ queryKey: ['permissions', 'grouped'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  // POST /admin/assignments/assign-role
  const assignRoleToUser = useMutation({
    mutationFn: (data: { user_id: number; role_name: string }) =>
      RoleService.assignRoleToUser(data),
    onSuccess: (_, data) => {
      toastSuccess(`Role "${data.role_name}" assigned to user`)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['users', data.user_id] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  // POST /admin/assignments/user-roles
  const updateUserRoles = useMutation({
    mutationFn: (data: { user_id: number; roles: string[] }) =>
      RoleService.updateUserRoles(data),
    onSuccess: (_, data) => {
      toastSuccess(`User roles updated successfully`)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['users', data.user_id] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  return {
    // Queries
    useAvailableRoles,
    useAllRoles,
    useRole,
    useRoleStats,
    useRoleUsers,
    usePermissions,
    usePermissionsGrouped,
    // Mutations
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
    assignRoleToUser,
    updateUserRoles,
  }
}
