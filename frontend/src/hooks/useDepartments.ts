  // hooks/useDepartments.ts
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  import DepartmentService, { CreateDepartmentData, UpdateDepartmentData } from '@/services/department.service'

  export function useDepartments() {
    const queryClient = useQueryClient()

    // ============================================
    // QUERIES
    // ============================================

    // GET /departments/active (public)
    const useActiveDepartments = () => {
      return useQuery({
        queryKey: ['departments', 'active'],
        queryFn: DepartmentService.getActiveDepartments,
        staleTime: 5 * 60 * 1000,
        retry: 1,
      })
    }

    // GET /departments
    const useAllDepartments = () => {
      return useQuery({
        queryKey: ['departments', 'all'],
        queryFn: DepartmentService.getDepartments,
        staleTime: 5 * 60 * 1000,
        retry: 1,
      })
    }

    // GET /departments/stats
    const useDepartmentStats = () => {
      return useQuery({
        queryKey: ['departments', 'stats'],
        queryFn: DepartmentService.getDepartmentStats,
        staleTime: 5 * 60 * 1000,
        retry: 1,
      })
    }

    // GET /departments/{id}
    const useDepartment = (id: number) => {
      return useQuery({
        queryKey: ['departments', id],
        queryFn: () => DepartmentService.getDepartment(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        retry: 1,
      })
    }

    // GET /departments/{id}/users
    const useDepartmentUsers = (id: number) => {
      return useQuery({
        queryKey: ['departments', id, 'users'],
        queryFn: () => DepartmentService.getDepartmentUsers(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
        retry: 1,
      })
    }

    // ============================================
    // MUTATIONS
    // ============================================

    // POST /departments (Admin only) - Create department
    const createDepartment = useMutation({
      mutationFn: (data: CreateDepartmentData) => DepartmentService.createDepartment(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['departments'] })
        queryClient.invalidateQueries({ queryKey: ['departments', 'stats'] })
      },
      onError: (error: any) => {
        console.error('Failed to create department:', error)
      },
    })

    // PUT /departments/{id} (Admin only) - Update department
    const updateDepartment = useMutation({
      mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentData }) =>
        DepartmentService.updateDepartment(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['departments'] })
        queryClient.invalidateQueries({ queryKey: ['departments', 'stats'] })
      },
      onError: (error: any) => {
        console.error('Failed to update department:', error)
      },
    })

    // DELETE /departments/{id} (Admin only) - Delete/Deactivate department
    const deleteDepartment = useMutation({
      mutationFn: (id: number) => DepartmentService.deleteDepartment(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['departments'] })
        queryClient.invalidateQueries({ queryKey: ['departments', 'stats'] })
      },
      onError: (error: any) => {
        console.error('Failed to delete department:', error)
      },
    })

    // POST /departments/{id}/activate (Admin only) - Activate department
    const activateDepartment = useMutation({
      mutationFn: (id: number) => DepartmentService.activateDepartment(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['departments'] })
        queryClient.invalidateQueries({ queryKey: ['departments', 'stats'] })
      },
      onError: (error: any) => {
        console.error('Failed to activate department:', error)
      },
    })

    // POST /departments/{id}/deactivate (Admin only) - Deactivate department
    const deactivateDepartment = useMutation({
      mutationFn: (id: number) => DepartmentService.deactivateDepartment(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['departments'] })
        queryClient.invalidateQueries({ queryKey: ['departments', 'stats'] })
      },
      onError: (error: any) => {
        console.error('Failed to deactivate department:', error)
      },
    })

    // POST /departments/{id}/assign-hod (Admin only) - Assign HOD
    // FIXED: The backend expects 'hod_id' field name
    const assignHOD = useMutation({
      mutationFn: ({ id, hod_id }: { id: number; hod_id: number }) =>
        DepartmentService.assignHOD(id, hod_id),
      onSuccess: (_, variables) => {
        // Invalidate all department-related queries
        queryClient.invalidateQueries({ queryKey: ['departments'] })
        queryClient.invalidateQueries({ queryKey: ['departments', variables.id] })
        queryClient.invalidateQueries({ queryKey: ['departments', 'stats'] })
        // Also invalidate the specific department's users if needed
        queryClient.invalidateQueries({ queryKey: ['departments', variables.id, 'users'] })
      },
      onError: (error: any) => {
        console.error('Failed to assign HOD:', error)
      },
    })

    // POST /departments/{id}/remove-hod (Admin only) - Remove HOD
    const removeHOD = useMutation({
      mutationFn: (id: number) => DepartmentService.removeHOD(id),
      onSuccess: (_, variables) => {
        // Invalidate all department-related queries
        queryClient.invalidateQueries({ queryKey: ['departments'] })
        queryClient.invalidateQueries({ queryKey: ['departments', variables] })
        queryClient.invalidateQueries({ queryKey: ['departments', 'stats'] })
        queryClient.invalidateQueries({ queryKey: ['departments', variables, 'users'] })
      },
      onError: (error: any) => {
        console.error('Failed to remove HOD:', error)
      },
    })

    // ============================================
    // HELPER FUNCTIONS FOR PAGES
    // ============================================

    // Toggle department status (activate/deactivate)
    const toggleDepartmentStatus = async (id: number, currentStatus: boolean) => {
      if (currentStatus) {
        return await deactivateDepartment.mutateAsync(id)
      } else {
        return await activateDepartment.mutateAsync(id)
      }
    }

    // Get department statistics with formatted labels
    const getFormattedStats = (stats: any) => {
      if (!stats) return null

      return {
        total: stats.total_departments || 0,
        active: stats.active_departments || 0,
        inactive: stats.inactive_departments || 0,
        withHOD: stats.with_hod || 0,
        withoutHOD: stats.without_hod || 0,
        totalUsers: stats.total_users || 0,
      }
    }

    // Check if department can be deleted (no users assigned)
    const canDeleteDepartment = (department: any) => {
      return !department || (department.users_count || 0) === 0
    }

    // Get department by ID from list
    const findDepartmentById = (departments: any[], id: number) => {
      return departments?.find(dept => dept.id === id) || null
    }

    // Filter departments by status
    const filterDepartmentsByStatus = (departments: any[], status: 'active' | 'inactive' | 'all') => {
      if (status === 'all') return departments
      return departments?.filter(dept =>
        status === 'active' ? dept.is_active : !dept.is_active
      ) || []
    }

    // Search departments by term
    const searchDepartments = (departments: any[], searchTerm: string) => {
      if (!searchTerm) return departments
      const term = searchTerm.toLowerCase()
      return departments?.filter(dept =>
        dept.name?.toLowerCase().includes(term) ||
        dept.code?.toLowerCase().includes(term) ||
        dept.description?.toLowerCase().includes(term)
      ) || []
    }

    return {
      // Queries
      useActiveDepartments,
      useAllDepartments,
      useDepartmentStats,
      useDepartment,
      useDepartmentUsers,

      // Mutations
      createDepartment,
      updateDepartment,
      deleteDepartment,
      activateDepartment,
      deactivateDepartment,
      assignHOD,
      removeHOD,

      // Helper functions
      toggleDepartmentStatus,
      getFormattedStats,
      canDeleteDepartment,
      findDepartmentById,
      filterDepartmentsByStatus,
      searchDepartments,
    }
  }
