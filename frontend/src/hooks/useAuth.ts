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
      console.log('🔐 Initializing auth - Token found:', !!token);

      if (token) {
        try {
          // Validate token by fetching user
          await refetchUser();
          console.log('✅ Session restored successfully');
        } catch (err) {
          console.log('❌ Session invalid, clearing token');
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
      console.log('👤 Fetching current user...');
      const token = tokenManager.get();

      if (!token) {
        console.log('❌ No token found');
        throw new Error('No authentication token');
      }

      try {
        const response = await AuthService.getMe();
        console.log('✅ User fetched successfully:', response.data?.user?.email);
        return response;
      } catch (error: any) {
        console.error('❌ Failed to fetch user:', error);

        // If 401, clear invalid token
        if (error.response?.status === 401) {
          console.log('🔴 Token invalid, clearing...');
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

  console.log('🔐 Auth State:', {
    user: user?.email || null,
    permissions: permissions.length,
    roles: roles.length,
    isAuthenticated,
    isInitialized,
    hasToken: !!tokenManager.get()
  });

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
    queryFn: async () => {
      console.log('📦 Fetching departments...');
      const result = await DepartmentService.getActiveDepartments();
      console.log('📦 Departments raw response:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Get available roles (for dropdowns)
   */
  const { data: rolesResponse, refetch: refetchRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles', 'available'],
    queryFn: async () => {
      console.log('📦 Fetching roles...');
      const result = await RoleService.getAvailableRoles();
      console.log('📦 Roles raw response:', result);
      return result;
    },
    staleTime: 10 * 60 * 1000,
  });

  /**
   * Get supplier categories (for dropdowns)
   */
  const { data: categoriesResponse, refetch: refetchCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['supplier', 'categories'],
    queryFn: async () => {
      console.log('📦 Fetching supplier categories...');
      const result = await SupplierService.getCategories();
      console.log('📦 Supplier categories raw response:', result);
      return result;
    },
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

  /**
   * Login mutation with CSRF and session handling
   */
  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      console.log('🔑 Login attempt:', data.email);

      try {
        // Step 1: Get CSRF cookie
        console.log('🍪 Getting CSRF cookie...');
        await csrf.getCookie();
        console.log('✅ CSRF cookie obtained');

        // Step 2: Perform login
        console.log('🔑 Performing login...');
        const response = await AuthService.login(data);
        console.log('✅ Login response received');
        return response;
      } catch (error: any) {
        console.error('❌ Login error:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('✅ Login successful:', response);

      if (response.success && response.data) {
        // Store token
        if (response.data.token) {
          console.log('💾 Storing token...');
          tokenManager.set(response.data.token,  false);
        }

        // Store user data
        if (response.data.user) {
          console.log('💾 Storing user data...');
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        }

        success(response.message || 'Login successful');

        // Invalidate and refetch user
        queryClient.invalidateQueries({ queryKey: ['user'] });

        // Redirect based on role
        const role = response.data.user?.role?.toUpperCase();
        console.log('🔄 Redirecting based on role:', role);

        setTimeout(() => {
          if (role === 'ADMIN') {
            router.push('/admin/dashboard');
          } else if (role === 'SUPPLIER') {
            router.push('/supplier/dashboard');
          } else {
            router.push('/dashboard');
          }
        }, 100);
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
      console.log('📝 Register attempt:', data.email);

      // Get CSRF cookie first
      await csrf.getCookie();

      return AuthService.register(data);
    },
    onSuccess: (response) => {
      console.log('✅ Register response:', response);
      if (response.success) {
        success(response.message || 'Registration successful');
        router.push('/login?registered=true');
      }
    },
    onError: (err: any) => {
      console.error('❌ Register error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred during registration');
    },
  });

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('🚪 Logout attempt');
      try {
        const response = await AuthService.logout();
        console.log('✅ Logout response:', response);
        return response;
      } catch (error) {
        console.error('❌ Logout error:', error);
        // Still clear local data even if API fails
        return { success: true, message: 'Logged out locally' };
      }
    },
    onSuccess: () => {
      console.log('✅ Logout successful');
      tokenManager.remove();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
      queryClient.clear();
      success('Logged out successfully');
      router.push('/login');
    },
    onError: (err) => {
      console.error('❌ Logout error:', err);
      // Always clear tokens even on error
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
  // REST OF THE MUTATIONS (unchanged)
  // ============================================

  /**
   * Forgot password mutation
   */
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      console.log('🔑 Forgot password for:', data.email);
      await csrf.getCookie();
      return AuthService.forgotPassword(data);
    },
    onSuccess: (response) => {
      console.log('✅ Forgot password response:', response);
      if (response.success) {
        success(response.message || 'Password reset link sent to your email');
      } else {
        error(response.message || 'Failed to send reset link');
      }
    },
    onError: (err: any) => {
      console.error('❌ Forgot password error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Reset password mutation
   */
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      console.log('🔑 Reset password for:', data.email);
      await csrf.getCookie();
      return AuthService.resetPassword(data);
    },
    onSuccess: (response) => {
      console.log('✅ Reset password response:', response);
      if (response.success) {
        success(response.message || 'Password reset successfully');
        router.push('/login?reset=true');
      } else {
        error(response.message || 'Failed to reset password');
      }
    },
    onError: (err: any) => {
      console.error('❌ Reset password error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Update profile mutation
   */
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => {
      console.log('👤 Update profile:', data);
      return AuthService.updateProfile(data);
    },
    onSuccess: (response) => {
      console.log('✅ Update profile response:', response);
      if (response.success) {
        success('Profile updated successfully');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['profile', 'completion'] });
      } else {
        error(response.message || 'Failed to update profile');
      }
    },
    onError: (err: any) => {
      console.error('❌ Update profile error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred while updating profile');
    },
  });

  /**
   * Upload avatar mutation
   */
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => {
      console.log('📸 Upload avatar:', file.name);
      return AuthService.uploadAvatar(file);
    },
    onSuccess: (response) => {
      console.log('✅ Upload avatar response:', response);
      if (response.success) {
        success('Avatar uploaded successfully');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['profile', 'completion'] });
      } else {
        error(response.message || 'Failed to upload avatar');
      }
    },
    onError: (err: any) => {
      console.error('❌ Upload avatar error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred while uploading avatar');
    },
  });

  /**
   * Change password mutation
   */
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => {
      console.log('🔑 Change password');
      return AuthService.changePassword(data);
    },
    onSuccess: (response) => {
      console.log('✅ Change password response:', response);
      if (response.success) {
        success('Password changed successfully');
      } else {
        error(response.message || 'Failed to change password');
      }
    },
    onError: (err: any) => {
      console.error('❌ Change password error:', err);
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
    mutationFn: (data: TwoFactorEnableRequest) => {
      console.log('🔐 Enable 2FA');
      return AuthService.enableTwoFactor(data);
    },
    onSuccess: (response) => {
      console.log('✅ Enable 2FA response:', response);
      if (response.success) {
        success('Two-factor authentication enabled successfully');
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } else {
        error(response.message || 'Failed to enable 2FA');
      }
    },
    onError: (err: any) => {
      console.error('❌ Enable 2FA error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Disable 2FA mutation
   */
  const disableTwoFactorMutation = useMutation({
    mutationFn: () => {
      console.log('🔐 Disable 2FA');
      return AuthService.disableTwoFactor();
    },
    onSuccess: (response) => {
      console.log('✅ Disable 2FA response:', response);
      if (response.success) {
        success('Two-factor authentication disabled');
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } else {
        error(response.message || 'Failed to disable 2FA');
      }
    },
    onError: (err: any) => {
      console.error('❌ Disable 2FA error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Verify 2FA mutation
   */
  const verifyTwoFactorMutation = useMutation({
    mutationFn: (data: TwoFactorVerifyRequest) => {
      console.log('🔐 Verify 2FA');
      return AuthService.verifyTwoFactor(data);
    },
    onSuccess: (response) => {
      console.log('✅ Verify 2FA response:', response);
      if (response.success) {
        success('2FA code verified successfully');
      } else {
        error(response.message || 'Invalid 2FA code');
      }
    },
    onError: (err: any) => {
      console.error('❌ Verify 2FA error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Generate recovery codes mutation
   */
  const generateRecoveryCodesMutation = useMutation({
    mutationFn: () => {
      console.log('🔐 Generate recovery codes');
      return AuthService.generateRecoveryCodes();
    },
    onSuccess: (response) => {
      console.log('✅ Generate recovery codes response:', response);
      if (response.success) {
        success('Recovery codes generated successfully');
        return response.data.recovery_codes;
      } else {
        error(response.message || 'Failed to generate recovery codes');
      }
    },
    onError: (err: any) => {
      console.error('❌ Generate recovery codes error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Verify recovery code mutation
   */
  const verifyRecoveryCodeMutation = useMutation({
    mutationFn: (data: TwoFactorRecoveryRequest) => {
      console.log('🔐 Verify recovery code');
      return AuthService.verifyRecoveryCode(data);
    },
    onSuccess: (response) => {
      console.log('✅ Verify recovery code response:', response);
      if (response.success) {
        success('Recovery code verified successfully');
      } else {
        error(response.message || 'Invalid recovery code');
      }
    },
    onError: (err: any) => {
      console.error('❌ Verify recovery code error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred');
    },
  });

  /**
   * Get 2FA status query
   */
  const { data: twoFactorStatus, refetch: refetchTwoFactorStatus } = useQuery({
    queryKey: ['twoFactorStatus'],
    queryFn: () => {
      console.log('🔐 Fetching 2FA status');
      return AuthService.getTwoFactorStatus();
    },
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
    console.log('🔄 Refreshing dropdown data...');
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
