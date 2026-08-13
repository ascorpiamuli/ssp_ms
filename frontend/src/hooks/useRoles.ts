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

// Helper to get role display name (label or formatted name)
const getRoleDisplayName = (role: any): string => {
  if (!role) return 'Unknown Role'
  if (role.label) return role.label
  if (role.name) return role.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  return 'Unknown Role'
}

export function useRoles() {
  const queryClient = useQueryClient()
  const { error: toastError, success: toastSuccess } = useToast()

  // GET /roles/available (public) - now includes labels
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

  // GET /admin/roles/with-labels (NEW - roles with labels and descriptions)
  const useAllRolesWithLabels = () => {
    return useQuery({
      queryKey: ['roles', 'all', 'with-labels'],
      queryFn: async () => {
        const response = await RoleService.getRolesWithLabels()
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

  // GET /admin/roles/{id}/with-labels (NEW - role with labels)
  const useRoleWithLabels = (id: number) => {
    return useQuery({
      queryKey: ['roles', id, 'with-labels'],
      queryFn: async () => {
        const response = await RoleService.getRoleWithLabels(id)
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

  // GET /admin/roles/users-with-roles (NEW - users with role info)
  const useUsersWithRoles = () => {
    return useQuery({
      queryKey: ['users', 'with-roles'],
      queryFn: async () => {
        const response = await RoleService.getUsersWithRoles()
        return extractData(response)
      },
      staleTime: 2 * 60 * 1000,
    })
  }

  // GET /admin/roles/options (NEW - role options for dropdowns)
  const useRoleOptions = () => {
    return useQuery({
      queryKey: ['roles', 'options'],
      queryFn: async () => {
        const response = await RoleService.getRoleOptions()
        return extractData(response)
      },
      staleTime: 10 * 60 * 1000,
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

  // GET /admin/roles/search (NEW - search roles)
  const useSearchRoles = (search: string) => {
    return useQuery({
      queryKey: ['roles', 'search', search],
      queryFn: async () => {
        const response = await RoleService.searchRoles(search)
        return extractData(response)
      },
      enabled: !!search && search.length >= 2,
      staleTime: 2 * 60 * 1000,
    })
  }

  // POST /admin/roles
  const createRole = useMutation({
    mutationFn: (data: CreateRoleData) => RoleService.createRole(data),
    onSuccess: (response) => {
      const role = extractData(response)
      const displayName = getRoleDisplayName(role)
      toastSuccess(`Role "${displayName}" created successfully`)
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'options'] })
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
      const displayName = getRoleDisplayName(role)
      toastSuccess(`Role "${displayName}" updated successfully`)
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'options'] })
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
      queryClient.invalidateQueries({ queryKey: ['roles', 'options'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  // POST /admin/roles/{id}/assign-permissions
  const assignPermissions = useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
      RoleService.assignPermissions(id, permissions),
    onSuccess: (response, variables) => {
      const role = extractData(response)
      const displayName = getRoleDisplayName(role)
      toastSuccess(`Permissions updated for role "${displayName}"`)
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      queryClient.invalidateQueries({ queryKey: ['permissions', 'grouped'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  // POST /admin/roles/{id}/grant-permission (NEW - grant single permission)
  const grantPermission = useMutation({
    mutationFn: ({ id, permission }: { id: number; permission: string }) =>
      RoleService.grantPermission(id, permission),
    onSuccess: (response, variables) => {
      const role = extractData(response)
      const displayName = getRoleDisplayName(role)
      toastSuccess(`Permission "${variables.permission}" granted to role "${displayName}"`)
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  // POST /admin/roles/{id}/revoke-permission (NEW - revoke single permission)
  const revokePermission = useMutation({
    mutationFn: ({ id, permission }: { id: number; permission: string }) =>
      RoleService.revokePermission(id, permission),
    onSuccess: (response, variables) => {
      const role = extractData(response)
      const displayName = getRoleDisplayName(role)
      toastSuccess(`Permission "${variables.permission}" revoked from role "${displayName}"`)
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['roles', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  // POST /admin/roles/assign-to-user
  const assignRoleToUser = useMutation({
    mutationFn: (data: { user_id: number; role_name: string }) =>
      RoleService.assignRoleToUser(data),
    onSuccess: (_, data) => {
      toastSuccess(`Role "${data.role_name}" assigned to user`)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['users', data.user_id] })
      queryClient.invalidateQueries({ queryKey: ['users', 'with-roles'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  // DELETE /admin/roles/remove-role-from-user (NEW - remove role from user)
  const removeRoleFromUser = useMutation({
    mutationFn: (data: { user_id: number; role_name: string }) =>
      RoleService.removeRoleFromUser(data),
    onSuccess: (_, data) => {
      toastSuccess(`Role "${data.role_name}" removed from user`)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['users', data.user_id] })
      queryClient.invalidateQueries({ queryKey: ['users', 'with-roles'] })
    },
    onError: (error: any) => {
      toastError(getErrorMessage(error))
    },
  })

  return {
    // Queries
    useAvailableRoles,
    useAllRoles,
    useAllRolesWithLabels,
    useRole,
    useRoleWithLabels,
    useRoleStats,
    useRoleUsers,
    useUsersWithRoles,
    useRoleOptions,
    usePermissions,
    usePermissionsGrouped,
    useSearchRoles,

    // Mutations
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
    grantPermission,
    revokePermission,
    assignRoleToUser,
    removeRoleFromUser,
  }
}
