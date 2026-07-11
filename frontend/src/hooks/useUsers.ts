// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import UserService, { UserFilters, CreateUserData, UpdateUserData, BulkActionData } from '@/services/user.service'

export function useUsers() {
  const queryClient = useQueryClient()

  // GET /admin/users
  const useGetUsers = (filters: UserFilters = {}) => {
    return useQuery({
      queryKey: ['users', filters],
      queryFn: () => UserService.getUsers(filters),
      staleTime: 2 * 60 * 1000,
    })
  }

  // GET /admin/users/{id}
  const useGetUser = (id: number) => {
    return useQuery({
      queryKey: ['users', id],
      queryFn: () => UserService.getUser(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })
  }

  // GET /admin/users/pending
  const useGetPendingUsers = () => {
    return useQuery({
      queryKey: ['users', 'pending'],
      queryFn: UserService.getPendingUsers,
      staleTime: 1 * 60 * 1000,
    })
  }

  // GET /admin/users/recent
  const useGetRecentUsers = (limit: number = 5) => {
    return useQuery({
      queryKey: ['users', 'recent', limit],
      queryFn: () => UserService.getRecentUsers(limit),
      staleTime: 5 * 60 * 1000,
    })
  }

  // GET /admin/users/stats
  const useGetUserStats = () => {
    return useQuery({
      queryKey: ['users', 'stats'],
      queryFn: UserService.getUserStats,
      
      staleTime: 5 * 60 * 1000,
    })
  }

  // POST /admin/users
  const createUser = useMutation({
    mutationFn: (data: CreateUserData) => UserService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] })
    },
  })

  // PUT /admin/users/{id}
  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) =>
      UserService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] })
    },
  })

  // DELETE /admin/users/{id}
  const deleteUser = useMutation({
    mutationFn: (id: number) => UserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] })
    },
  })

  // POST /admin/users/bulk
  const bulkAction = useMutation({
    mutationFn: (data: BulkActionData) => UserService.bulkAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] })
    },
  })

  // POST /admin/users/{id}/approve
  const approveUser = useMutation({
    mutationFn: (id: number) => UserService.approveUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'pending'] })
    },
  })

  // POST /admin/users/{id}/reject
  const rejectUser = useMutation({
    mutationFn: (id: number) => UserService.rejectUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'pending'] })
    },
  })

  // POST /admin/users/{id}/activate
  const activateUser = useMutation({
    mutationFn: (id: number) => UserService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] })
    },
  })

  // POST /admin/users/{id}/deactivate
  const deactivateUser = useMutation({
    mutationFn: (id: number) => UserService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] })
    },
  })

  // POST /admin/users/{id}/reset-password
  const resetPassword = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      UserService.resetPassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    // Queries
    useGetUsers,
    useGetUser,
    useGetPendingUsers,
    useGetRecentUsers,
    useGetUserStats,
    // Mutations
    createUser,
    updateUser,
    deleteUser,
    bulkAction,
    approveUser,
    rejectUser,
    activateUser,
    deactivateUser,
    resetPassword,
  }
}
