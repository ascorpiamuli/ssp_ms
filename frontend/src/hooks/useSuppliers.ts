// frontend/src/hooks/useSuppliers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupplierService, Supplier } from '@/services/supplier.service';
import { useToast } from '@/components/ui/toast-context';

export function useSuppliers() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

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

  // Query: Get all suppliers - FIXED to handle response properly
  const useAllSuppliers = () => {
    return useQuery({
      queryKey: ['suppliers', 'all'],
      queryFn: async () => {
        console.log('🔍 [useAllSuppliers] Fetching suppliers...');
        try {
          const response = await SupplierService.getSuppliers();
          console.log('📦 [useAllSuppliers] Raw response:', response);

          // Check if response has a data property that is an array
          if (response && typeof response === 'object') {
            // Case 1: Response is { data: [...] }
            if ('data' in response && Array.isArray(response.data)) {
              console.log('✅ [useAllSuppliers] Response has data array, length:', response.data.length);
              return response.data;
            }
            // Case 2: Response is { success: true, data: [...] }
            if ('success' in response && response.success && 'data' in response && Array.isArray(response.data)) {
              console.log('✅ [useAllSuppliers] Response is success wrapper, length:', response.data.length);
              return response.data;
            }
            // Case 3: Response is already an array
            if (Array.isArray(response)) {
              console.log('✅ [useAllSuppliers] Response is array, length:', response.length);
              return response;
            }
          }

          console.log('⚠️ [useAllSuppliers] No valid data found, returning empty array');
          return [];
        } catch (error) {
          console.error('❌ [useAllSuppliers] Error fetching suppliers:', error);
          throw error;
        }
      },
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

  // Query: Get supplier by user ID (for profile setup)
  const useSupplierByUserId = () => {
    return useQuery({
      queryKey: ['supplier', 'me'],
      queryFn: async () => {
        console.log('🔍 [useSupplierByUserId] Fetching supplier by user ID...');
        try {
          const response = await SupplierService.getSupplierByUserId();
          console.log('📦 [useSupplierByUserId] Response:', response);
          return response;
        } catch (error) {
          console.error('❌ [useSupplierByUserId] Error:', error);
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000,
      retry: false,
    });
  };

  // Hook to check if supplier profile exists
  const useSupplierProfileExists = (options?: { enabled?: boolean }) => {
    const { enabled = true } = options || {}

    const { data, isLoading, isError, error: queryError, refetch, isFetching } = useQuery({
      queryKey: ['supplier', 'profile-exists'],
      queryFn: async () => {
        console.log('🔍 [useSupplierProfileExists] Checking if supplier exists...');
        try {
          const response = await SupplierService.getSupplierByUserId();
          console.log('📦 [useSupplierProfileExists] Response:', response);

          // Check if response is a valid supplier object with an id
          const exists = response !== null &&
            response !== undefined &&
            typeof response === 'object' &&
            'id' in response &&
            response.id !== null &&
            response.id !== undefined;

          console.log('✅ [useSupplierProfileExists] Exists:', exists);

          return {
            exists: exists,
            supplier: exists ? response : null,
            response: response,
          };
        } catch (err: any) {
          console.log('❌ [useSupplierProfileExists] Error:', err);
          // If error is 404, supplier doesn't exist
          if (err?.response?.status === 404) {
            console.log('📌 [useSupplierProfileExists] 404 - Supplier not found');
            return { exists: false, supplier: null, response: null };
          }
          // For other errors, re-throw
          throw err;
        }
      },
      // ✅ FIX 1: Respect the enabled option
      enabled: enabled,

      // ✅ FIX 2: Increased stale time to prevent unnecessary refetches
      staleTime: 10 * 60 * 1000, // 10 minutes (was 2 min)

      // ✅ FIX 3: Increased cache time
      gcTime: 30 * 60 * 1000, // 30 minutes (was 5 min)

      // ✅ FIX 4: Don't refetch on window focus
      refetchOnWindowFocus: false,

      // ✅ FIX 5: Don't refetch on reconnect
      refetchOnReconnect: false,

      // ✅ FIX 6: Only refetch on mount when data is stale
      refetchOnMount: true,

      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      throwOnError: (error: any) => {
        const status = error?.response?.status;
        if (status === 404) {
          return false;
        }
        return true;
      },
    });

    return {
      exists: data?.exists || false,
      supplier: data?.supplier || null,
      response: data?.response || null,
      isLoading: isLoading || isFetching,
      isError,
      error: queryError,
      refetch,
    };
  };
  // Helper function to extract error messages from API response
  const extractErrorMessage = (err: any): string => {
    // Check for validation errors (422)
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
      const allErrors = Object.values(errors).flat();
      if (allErrors.length > 0) {
        return allErrors[0] as string;
      }
    }

    // Check for message in response
    if (err.response?.data?.message) {
      return err.response.data.message;
    }

    // Check for error message
    if (err.message) {
      return err.message;
    }

    return 'An error occurred. Please try again.';
  };

  // Helper to check if response is a supplier object (has id)
  const isSupplierObject = (response: any): boolean => {
    return response !== null &&
      response !== undefined &&
      typeof response === 'object' &&
      'id' in response &&
      response.id !== null &&
      response.id !== undefined;
  };

  // Helper to create FormData from supplier data with file
  const createSupplierFormData = (data: any): FormData => {
    const formData = new FormData();

    // List of fields to send
    const fields = [
      'company_name', 'company_email', 'company_phone',
      'company_registration', 'company_address', 'company_website',
      'tax_id', 'category', 'description', 'established_year',
      'employee_count', 'annual_revenue', 'certifications',
      'registration_date', 'license_number', 'bank_name',
      'bank_account', 'bank_branch', 'payment_terms',
      'preferred_currency', 'contact_person_name',
      'contact_person_email', 'contact_person_phone'
    ];

    // Append all fields
    fields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        formData.append(field, data[field]);
      }
    });

    // Append the file if it exists
    if (data.company_logo instanceof File) {
      formData.append('company_logo', data.company_logo);
      console.log('📤 FormData: Company logo file attached', {
        name: data.company_logo.name,
        size: data.company_logo.size,
        type: data.company_logo.type
      });
    }

    return formData;
  };

  // Helper to create update FormData with _method
  const createUpdateSupplierFormData = (data: any): FormData => {
    const formData = createSupplierFormData(data);
    // Add _method for Laravel to treat as PUT
    formData.append('_method', 'PUT');
    return formData;
  };

  // Mutation: Create supplier
  const createSupplier = useMutation({
    mutationFn: async (data: any) => {
      // Check if there's a file
      if (data.company_logo instanceof File) {
        const formData = createSupplierFormData(data);
        console.log('📤 Sending create supplier with FormData');
        return SupplierService.createSupplierWithFile(formData);
      }
      // No file, send as JSON
      console.log('📤 Sending create supplier as JSON');
      return SupplierService.createSupplier(data);
    },
    onSuccess: (response: any) => {
      if (isSupplierObject(response)) {
        success('Supplier profile created successfully');
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        queryClient.invalidateQueries({ queryKey: ['supplier'] });
        queryClient.invalidateQueries({ queryKey: ['supplier', 'profile-exists'] });
        queryClient.invalidateQueries({ queryKey: ['supplier', 'me'] });
      } else {
        if (response && typeof response === 'object' && 'success' in response && !response.success) {
          error(response?.message || 'Failed to create supplier profile');
        } else {
          error('Failed to create supplier profile');
        }
      }
    },
    onError: (err: any) => {
      const errorMessage = extractErrorMessage(err);
      error(errorMessage);
    },
  });

  // Mutation: Update supplier
  const updateSupplier = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // Check if there's a file
      if (data.company_logo instanceof File) {
        const formData = createUpdateSupplierFormData(data);
        console.log('📤 Sending update supplier with FormData', { id });
        return SupplierService.updateSupplierWithFile(id, formData);
      }
      // No file, send as JSON
      console.log('📤 Sending update supplier as JSON', { id });
      return SupplierService.updateSupplier(id, data);
    },
    onSuccess: (response: any) => {
      if (isSupplierObject(response)) {
        success('Supplier profile updated successfully');
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        queryClient.invalidateQueries({ queryKey: ['supplier'] });
        queryClient.invalidateQueries({ queryKey: ['supplier', 'profile-exists'] });
        queryClient.invalidateQueries({ queryKey: ['supplier', 'me'] });
      } else {
        if (response && typeof response === 'object' && 'success' in response && !response.success) {
          error(response?.message || 'Failed to update supplier profile');
        } else {
          error('Failed to update supplier profile');
        }
      }
    },
    onError: (err: any) => {
      const errorMessage = extractErrorMessage(err);
      error(errorMessage);
    },
  });

  // Mutation: Delete supplier
  const deleteSupplier = useMutation({
    mutationFn: SupplierService.deleteSupplier,
    onSuccess: (response: any) => {
      if (response && typeof response === 'object' && 'success' in response) {
        if (response.success) {
          success(response?.message || 'Supplier deleted successfully');
        } else {
          error(response?.message || 'Failed to delete supplier');
        }
      } else {
        success('Supplier deleted successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', 'profile-exists'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', 'me'] });
    },
    onError: (err: any) => {
      const errorMessage = extractErrorMessage(err);
      error(errorMessage);
    },
  });

  // Mutation: Blacklist supplier
  const blacklistSupplier = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      SupplierService.blacklistSupplier(id, reason),
    onSuccess: (response: any) => {
      if (isSupplierObject(response)) {
        success('Supplier blacklisted successfully');
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        queryClient.invalidateQueries({ queryKey: ['supplier'] });
        queryClient.invalidateQueries({ queryKey: ['supplier', 'profile-exists'] });
        queryClient.invalidateQueries({ queryKey: ['supplier', 'me'] });
      } else {
        if (response && typeof response === 'object' && 'success' in response && !response.success) {
          error(response?.message || 'Failed to blacklist supplier');
        } else {
          error('Failed to blacklist supplier');
        }
      }
    },
    onError: (err: any) => {
      const errorMessage = extractErrorMessage(err);
      error(errorMessage);
    },
  });

  // Mutation: Unblacklist supplier
  const unblacklistSupplier = useMutation({
    mutationFn: SupplierService.unblacklistSupplier,
    onSuccess: (response: any) => {
      if (isSupplierObject(response)) {
        success('Supplier removed from blacklist successfully');
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        queryClient.invalidateQueries({ queryKey: ['supplier'] });
        queryClient.invalidateQueries({ queryKey: ['supplier', 'profile-exists'] });
        queryClient.invalidateQueries({ queryKey: ['supplier', 'me'] });
      } else {
        if (response && typeof response === 'object' && 'success' in response && !response.success) {
          error(response?.message || 'Failed to remove supplier from blacklist');
        } else {
          error('Failed to remove supplier from blacklist');
        }
      }
    },
    onError: (err: any) => {
      const errorMessage = extractErrorMessage(err);
      error(errorMessage);
    },
  });

  return {
    // Queries
    useSupplierCategories,
    useActiveSuppliers,
    useAllSuppliers,
    useSupplier,
    useSupplierByUserId,
    useSupplierProfileExists,

    // Mutations
    createSupplier,
    updateSupplier,
    deleteSupplier,
    blacklistSupplier,
    unblacklistSupplier,
  };
}
