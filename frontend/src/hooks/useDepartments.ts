import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DepartmentService, Department } from '@/services/department.service';

export function useDepartments() {
  const queryClient = useQueryClient();

  // Query: Get active departments (public)
  const useActiveDepartments = () => {
    return useQuery({
      queryKey: ['departments', 'active'],
      queryFn: DepartmentService.getActiveDepartments,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Query: Get all departments
  const useAllDepartments = (options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ['departments', 'all'],
      queryFn: DepartmentService.getDepartments,
      staleTime: 5 * 60 * 1000,
      enabled: options?.enabled ?? true,
    });
  };

  // Query: Get single department
  const useDepartment = (id: number) => {
    return useQuery({
      queryKey: ['departments', id],
      queryFn: () => DepartmentService.getDepartment(id),
      enabled: !!id,
    });
  };

  // Mutation: Create department
  const createDepartment = useMutation({
    mutationFn: DepartmentService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  // Mutation: Update department
  const updateDepartment = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Department> }) =>
      DepartmentService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  // Mutation: Delete department
  const deleteDepartment = useMutation({
    mutationFn: DepartmentService.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  return {
    useActiveDepartments,
    useAllDepartments,
    useDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
}
