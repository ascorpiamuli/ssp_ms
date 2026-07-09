// hooks/useAuth.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/auth.service';
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  TwoFactorEnableRequest,
  TwoFactorVerifyRequest,
  TwoFactorRecoveryRequest,
  User,
  AuthResponse,
  AuthData,
} from '@/types/auth.types';
import { tokenManager, csrf } from '@/services/api';
import { useToast } from '@/components/ui/toast-context';
import { ProfileService } from '@/services/profile.service';
import { DepartmentService } from '@/services/department.service';
import { RoleService } from '@/services/role.service';
import { SupplierService } from '@/services/supplier.service';
import { useEffect, useState } from 'react';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================
  // INITIALIZATION - Check session on mount
  // ============================================

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.get();

      if (token) {
        try {
          await refetchUser();
        } catch (err) {
          tokenManager.remove();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
          }
        }
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  // ============================================
  // QUERIES
  // ============================================

  /**
   * Get current user - with session validation
   */
  const {
    data: userData,
    refetch: refetchUser,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = tokenManager.get();

      if (!token) {
        throw new Error('No authentication token');
      }

      try {
        const response = await AuthService.getMe();
        return response;
      } catch (error: any) {
        if (error.response?.status === 401) {
          tokenManager.remove();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
          }
        }
        throw error;
      }
    },
    enabled: typeof window !== 'undefined' && !!tokenManager.get() && isInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = userData?.data?.user || null;
  const permissions = userData?.data?.permissions || [];
  const roles = userData?.data?.roles || [];
  const isAuthenticated = !!user;

  /**
   * Get profile completion status
   */
  const { data: completionStatus, refetch: refetchCompletionStatus } = useQuery({
    queryKey: ['profile', 'completion'],
    queryFn: () => ProfileService.getCompletionStatus(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  /**
   * Get active departments (for dropdowns)
   */
  const { data: departmentsResponse, refetch: refetchDepartments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments', 'active'],
    queryFn: () => DepartmentService.getActiveDepartments(),
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Get available roles (for dropdowns)
   */
  const { data: rolesResponse, refetch: refetchRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles', 'available'],
    queryFn: () => RoleService.getAvailableRoles(),
    staleTime: 10 * 60 * 1000,
  });

  /**
   * Get supplier categories (for dropdowns)
   */
  const { data: categoriesResponse, refetch: refetchCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['supplier', 'categories'],
    queryFn: () => SupplierService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });

  // ============================================
  // DROPDOWN DATA HELPERS
  // ============================================

  const getDepartments = () => {
    if (Array.isArray(departmentsResponse)) {
      return departmentsResponse;
    }
    if (departmentsResponse && Array.isArray(departmentsResponse.data)) {
      return departmentsResponse.data;
    }
    return [];
  };

  const getAvailableRoles = () => {
    if (Array.isArray(rolesResponse)) {
      return rolesResponse;
    }
    if (rolesResponse && Array.isArray(rolesResponse.data)) {
      return rolesResponse.data;
    }
    return [];
  };

  const getSupplierCategories = () => {
    if (Array.isArray(categoriesResponse)) {
      return categoriesResponse;
    }
    if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
      return categoriesResponse.data;
    }
    return [];
  };

  // ============================================
  // MUTATIONS
  // ============================================

// hooks/useAuth.ts - Fixed loginMutation

  // hooks/useAuth.ts - Fixed loginMutation

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      await csrf.getCookie();
      return AuthService.login(data);
    },
    onSuccess: (response: AuthResponse) => {
      console.log('✅ Login response:', response);

      // Extract auth data - handles both single and double nested responses
      let authData: AuthData | null = null;

      if (response?.data) {
        // Check if response.data has the token (single nested)
        if ('token' in response.data) {
          authData = response.data;
        }
        // Check if response.data has a data property (double nested)
        else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          const nestedData = response.data as any;
          if (nestedData.data && 'token' in nestedData.data) {
            authData = nestedData.data;
          }
        }
      }

      if (authData?.token) {
        const token = authData.token;
        const user = authData.user;
        const permissions = authData.permissions || [];

        console.log('💾 Saving token...');

        // Save token
        tokenManager.set(token, false);
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);

        // Save user
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          console.log('✅ User saved:', user.email);
        }

        // Update query cache
        queryClient.setQueryData(['user'], {
          data: {
            user: user,
            permissions: permissions,
            roles: user?.roles || [],
          }
        });

        success(response.message || 'Login successful');

      } else {
        console.error('❌ No token found in response!');
        error('Login failed: No token received');
      }
    },
    onError: (err: any) => {
      console.error('❌ Login error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred during login');
    },
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      await csrf.getCookie();
      return AuthService.register(data);
    },
    onSuccess: (response) => {
      if (response?.success) {
        success(response.message || 'Registration successful');
        router.push('/login?registered=true');
      } else {
        error(response?.message || 'Registration failed');
      }
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'An error occurred during registration');
    },
  });

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await AuthService.logout();
        return response;
      } catch (error) {
        return { success: true, message: 'Logged out locally' };
      }
    },
    onSuccess: (response) => {
      tokenManager.remove();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
      queryClient.clear();
      success(response?.message || 'Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      tokenManager.remove();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
      queryClient.clear();
      router.push('/login');
    },
  });

  // ============================================
  // PASSWORD RESET MUTATIONS
  // ============================================

  /**
   * Forgot password mutation
   */
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      await csrf.getCookie();
      return AuthService.forgotPassword(data);
    },
    onSuccess: (response) => {
      if (response?.success === true) {
        success(response.message || 'Password reset link sent to your email');
      } else {
        error(response?.message || 'Failed to send reset link. Please try again.');
      }
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || err?.message || 'An error occurred while sending the reset link');
    },
  });

  /**
   * Reset password mutation
   */
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      await csrf.getCookie();
      return AuthService.resetPassword(data);
    },
    onSuccess: (response) => {
      if (response?.success === true) {
        success(response.message || 'Password reset successfully');
        router.push('/login?reset=true');
      } else {
        error(response?.message || 'Failed to reset password');
      }
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || err?.message || 'An error occurred while resetting your password');
    },
  });

  /**
   * Update profile mutation
   */
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => AuthService.updateProfile(data),
    onSuccess: (response) => {
      if (response?.success) {
        success('Profile updated successfully');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['profile', 'completion'] });
      } else {
        error(response?.message || 'Failed to update profile');
      }
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'An error occurred while updating profile');
    },
  });

  /**
   * Upload avatar mutation
   */
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => AuthService.uploadAvatar(file),
    onSuccess: (response) => {
      if (response?.success) {
        success('Avatar uploaded successfully');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['profile', 'completion'] });
      } else {
        error(response?.message || 'Failed to upload avatar');
      }
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'An error occurred while uploading avatar');
    },
  });

  /**
   * Change password mutation
   */
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => AuthService.changePassword(data),
    onSuccess: (response) => {
      if (response?.success) {
        success('Password changed successfully');
      } else {
        error(response?.message || 'Failed to change password');
      }
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'An error occurred while changing password');
    },
  });

  // ============================================
  // TWO FACTOR AUTH MUTATIONS
  // ============================================

  /**
   * Enable 2FA mutation
   */
  const enableTwoFactorMutation = useMutation({
    mutationFn: (data: TwoFactorEnableRequest) => AuthService.enableTwoFactor(data),
    onSuccess: (response) => {
      if (response?.success) {
        success('Two-factor authentication enabled successfully');
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } else {
        error(response?.message || 'Failed to enable 2FA');
      }
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Disable 2FA mutation
   */
  const disableTwoFactorMutation = useMutation({
    mutationFn: () => AuthService.disableTwoFactor(),
    onSuccess: (response) => {
      if (response?.success) {
        success('Two-factor authentication disabled');
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } else {
        error(response?.message || 'Failed to disable 2FA');
      }
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Verify 2FA mutation
   */
  const verifyTwoFactorMutation = useMutation({
    mutationFn: (data: TwoFactorVerifyRequest) => AuthService.verifyTwoFactor(data),
    onSuccess: (response) => {
      if (response?.success) {
        success('2FA code verified successfully');
      } else {
        error(response?.message || 'Invalid 2FA code');
      }
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Generate recovery codes mutation
   */
  const generateRecoveryCodesMutation = useMutation({
    mutationFn: () => AuthService.generateRecoveryCodes(),
    onSuccess: (response) => {
      if (response?.success) {
        success('Recovery codes generated successfully');
        return response.data?.recovery_codes;
      } else {
        error(response?.message || 'Failed to generate recovery codes');
      }
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Verify recovery code mutation
   */
  const verifyRecoveryCodeMutation = useMutation({
    mutationFn: (data: TwoFactorRecoveryRequest) => AuthService.verifyRecoveryCode(data),
    onSuccess: (response) => {
      if (response?.success) {
        success('Recovery code verified successfully');
      } else {
        error(response?.message || 'Invalid recovery code');
      }
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Get 2FA status query
   */
  const { data: twoFactorStatus, refetch: refetchTwoFactorStatus } = useQuery({
    queryKey: ['twoFactorStatus'],
    queryFn: () => AuthService.getTwoFactorStatus(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // ============================================
  // HELPER METHODS
  // ============================================

  const hasPermission = (permission: string): boolean => {
    if (!permissions.length) return false;
    if (user?.role === 'ADMIN') return true;
    return permissions.includes(permission);
  };

  const hasRole = (rolesToCheck: string | string[]): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (typeof rolesToCheck === 'string') {
      return user.role === rolesToCheck || roles.includes(rolesToCheck);
    }
    return rolesToCheck.some((role) => user.role === role || roles.includes(role));
  };

  const isAdmin = (): boolean => user?.role === 'ADMIN';
  const isSupplier = (): boolean => user?.role === 'SUPPLIER';
  const isHOD = (): boolean => user?.role === 'HOD';
  const isAccountant = (): boolean => user?.role === 'ACCOUNTANT';
  const isPrincipal = (): boolean => user?.role === 'PRINCIPAL';
  const isFinalApprover = (): boolean => user?.role === 'FINAL_APPROVER';
  const isStaff = (): boolean => user?.role === 'STAFF';
  const isAuditor = (): boolean => user?.role === 'AUDITOR';
  const isProcurement = (): boolean => user?.role === 'PROCUREMENT';

  // ============================================
  // PROFILE COMPLETION HELPERS
  // ============================================

  const getCompletionStatus = () => {
    return completionStatus?.data || { percentage: 0, is_complete: false, missing_fields: [] };
  };

  const isProfileComplete = (): boolean => {
    return completionStatus?.data?.is_complete || false;
  };

  const getProfilePercentage = (): number => {
    return completionStatus?.data?.percentage || 0;
  };

  // ============================================
  // REFRESH METHODS
  // ============================================

  const refreshDropdownData = () => {
    refetchDepartments();
    refetchRoles();
    refetchCategories();
  };

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    user,
    permissions,
    roles,
    isAuthenticated,
    isLoading: isLoadingUser || loginMutation.isPending || registerMutation.isPending || isLoadingDepartments || isLoadingRoles || isLoadingCategories || !isInitialized,

    // Auth methods
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refetchUser,

    // Password reset
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,

    // Profile
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,

    // 2FA
    enableTwoFactor: enableTwoFactorMutation.mutateAsync,
    disableTwoFactor: disableTwoFactorMutation.mutateAsync,
    verifyTwoFactor: verifyTwoFactorMutation.mutateAsync,
    generateRecoveryCodes: generateRecoveryCodesMutation.mutateAsync,
    verifyRecoveryCode: verifyRecoveryCodeMutation.mutateAsync,
    twoFactorStatus: twoFactorStatus?.data,
    refetchTwoFactorStatus,

    // Profile completion
    completionStatus: getCompletionStatus(),
    isProfileComplete: isProfileComplete(),
    profilePercentage: getProfilePercentage(),
    refetchCompletionStatus,

    // Dropdown data
    departments: getDepartments(),
    availableRoles: getAvailableRoles(),
    supplierCategories: getSupplierCategories(),
    refreshDropdownData,
    isLoadingDepartments,
    isLoadingRoles,
    isLoadingCategories,

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

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
  };
}

export default useAuth;
