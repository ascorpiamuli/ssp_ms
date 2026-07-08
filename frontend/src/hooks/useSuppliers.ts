import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupplierService, Supplier } from '@/services/supplier.service';

export function useSuppliers() {
  const queryClient = useQueryClient();

  // Query: Get supplier categories (public)
  const useSupplierCategories = () => {
    return useQuery({
      queryKey: ['supplier', 'categories'],
      queryFn: SupplierService.getCategories,
      staleTime: 10 * 60 * 1000,
    });
  };

  // Query: Get active suppliers
  const useActiveSuppliers = () => {
    return useQuery({
      queryKey: ['suppliers', 'active'],
      queryFn: SupplierService.getActiveSuppliers,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: Get all suppliers
  const useAllSuppliers = () => {
    return useQuery({
      queryKey: ['suppliers', 'all'],
      queryFn: SupplierService.getSuppliers,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: Get single supplier
  const useSupplier = (id: number) => {
    return useQuery({
      queryKey: ['suppliers', id],
      queryFn: () => SupplierService.getSupplier(id),
      enabled: !!id,
    });
  };

  // Mutation: Create supplier
  const createSupplier = useMutation({
    mutationFn: SupplierService.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  // Mutation: Update supplier
  const updateSupplier = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Supplier> }) =>
      SupplierService.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  // Mutation: Delete supplier
  const deleteSupplier = useMutation({
    mutationFn: SupplierService.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  // Mutation: Blacklist supplier
  const blacklistSupplier = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      SupplierService.blacklistSupplier(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  // Mutation: Unblacklist supplier
  const unblacklistSupplier = useMutation({
    mutationFn: SupplierService.unblacklistSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  return {
    useSupplierCategories,
    useActiveSuppliers,
    useAllSuppliers,
    useSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    blacklistSupplier,
    unblacklistSupplier,
  };
}
