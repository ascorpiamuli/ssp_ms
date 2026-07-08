import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleService, AvailableRole } from '@/services/role.service';

export function useRoles() {
  const queryClient = useQueryClient();

  // Query: Get available roles (public)
  const useAvailableRoles = () => {
    return useQuery({
      queryKey: ['roles', 'available'],
      queryFn: RoleService.getAvailableRoles,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Query: Get all roles
  const useAllRoles = () => {
    return useQuery({
      queryKey: ['roles', 'all'],
      queryFn: RoleService.getRoles,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: Get single role
  const useRole = (id: number) => {
    return useQuery({
      queryKey: ['roles', id],
      queryFn: () => RoleService.getRole(id),
      enabled: !!id,
    });
  };

  // Query: Get permissions
  const usePermissions = () => {
    return useQuery({
      queryKey: ['permissions'],
      queryFn: RoleService.getPermissions,
      staleTime: 10 * 60 * 1000,
    });
  };

  // Query: Get grouped permissions
  const usePermissionsGrouped = () => {
    return useQuery({
      queryKey: ['permissions', 'grouped'],
      queryFn: RoleService.getPermissionsGrouped,
      staleTime: 10 * 60 * 1000,
    });
  };

  // Mutation: Create role
  const createRole = useMutation({
    mutationFn: RoleService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // Mutation: Update role
  const updateRole = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; permissions?: string[] } }) =>
      RoleService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // Mutation: Delete role
  const deleteRole = useMutation({
    mutationFn: RoleService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // Mutation: Assign permissions
  const assignPermissions = useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
      RoleService.assignPermissions(id, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });

  return {
    useAvailableRoles,
    useAllRoles,
    useRole,
    usePermissions,
    usePermissionsGrouped,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
  };
}
