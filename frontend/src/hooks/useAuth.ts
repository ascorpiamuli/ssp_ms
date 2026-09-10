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
  AuthResponse,
  AuthData,
  User,
  Role,
} from '@/types/auth.types';
import { tokenManager, csrf } from '@/services/api';
import { useToast } from '@/components/ui/toast-context';
import { ProfileService } from '@/services/profile.service';
import { DepartmentService } from '@/services/department.service';
import { RoleService } from '@/services/role.service';
import { SupplierService } from '@/services/supplier.service';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  // ✅ Use ref to track initialization to prevent double calls
  const isInitializedRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================
  // ✅ FIX 1: INITIALIZATION - Only runs ONCE on mount
  // ============================================

  useEffect(() => {
    // ✅ Prevent double initialization
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initAuth = async () => {
      const token = tokenManager.get();

      if (token) {
        try {
          // ✅ Only refetch if we have a token and user data doesn't exist
          const existingUser = queryClient.getQueryData(['user']);
          if (!existingUser) {
            await refetchUser();
          }
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
  }, []); // ✅ Empty dependency array - runs once

  // ============================================
  // ✅ FIX 2: USER QUERY - Proper caching to prevent repeated calls
  // ============================================

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
    // ✅ Only enable when we have a token AND initialized
    enabled: !!(typeof window !== 'undefined' && tokenManager.get() && isInitialized),

    // ✅ IMPORTANT: Prevent retries on auth errors
    retry: false,

    // ✅ CRITICAL: Long stale time to prevent refetches
    staleTime: 30 * 60 * 1000, // 30 minutes

    // ✅ Long cache time
    gcTime: 60 * 60 * 1000, // 60 minutes

    // ✅ Prevent refetch on window focus
    refetchOnWindowFocus: false,

    // ✅ Prevent refetch on reconnect
    refetchOnReconnect: false,

    // ✅ Don't refetch on mount if data exists
    refetchOnMount: true,

    // ✅ Prevent automatic refetching
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  const user = userData?.data?.user || null;
  const permissions = userData?.data?.permissions || [];
  const roles = userData?.data?.roles || [];

  // ✅ Memoize authentication state to prevent unnecessary re-renders
  const isAuthenticated = useMemo(() => !!user, [user]);

  // ============================================
  // ✅ FIX 3: PROFILE COMPLETION - Only runs when authenticated
  // ============================================

  const { data: completionStatus, refetch: refetchCompletionStatus } = useQuery({
    queryKey: ['profile', 'completion'],
    queryFn: () => ProfileService.getCompletionStatus(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // ============================================
  // ✅ FIX 4: DROPDOWN DATA - Long cache times
  // ============================================

  const { data: departmentsResponse, refetch: refetchDepartments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments', 'active'],
    queryFn: () => DepartmentService.getActiveDepartments(),
    enabled: isAuthenticated,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 120 * 60 * 1000, // 120 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: rolesResponse, refetch: refetchRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles', 'available'],
    queryFn: () => RoleService.getAvailableRoles(),
    enabled: isAuthenticated,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 120 * 60 * 1000, // 120 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: categoriesResponse, refetch: refetchCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['supplier', 'categories'],
    queryFn: () => SupplierService.getCategories(),
    enabled: isAuthenticated,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 120 * 60 * 1000, // 120 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // ============================================
  // DROPDOWN DATA HELPERS (memoized)
  // ============================================

  const getDepartments = useCallback(() => {
    if (Array.isArray(departmentsResponse)) {
      return departmentsResponse;
    }
    if (departmentsResponse && Array.isArray(departmentsResponse.data)) {
      return departmentsResponse.data;
    }
    return [];
  }, [departmentsResponse]);

  const getAvailableRoles = useCallback(() => {
    if (Array.isArray(rolesResponse)) {
      return rolesResponse;
    }
    if (rolesResponse && Array.isArray(rolesResponse.data)) {
      return rolesResponse.data;
    }
    return [];
  }, [rolesResponse]);

  const getSupplierCategories = useCallback(() => {
    if (Array.isArray(categoriesResponse)) {
      return categoriesResponse;
    }
    if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
      return categoriesResponse.data;
    }
    return [];
  }, [categoriesResponse]);

  // ============================================
  // ✅ FIX 5: USER ROLE HELPERS (memoized)
  // ============================================

  const getRoleLabel = useCallback((): string | null => {
    if (!user) return null;
    return user.role_label || null;
  }, [user]);

  const getRoleDescription = useCallback((): string | null => {
    if (!user) return null;
    return user.role_description || null;
  }, [user]);

  const getRoleName = useCallback((): string | null => {
    if (!user) return null;
    return user.role || null;
  }, [user]);

  const getRoleDisplayName = useCallback((): string => {
    if (!user) return 'No Role Assigned';
    if (user.role_label) return user.role_label;
    if (user.role) return user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return 'No Role Assigned';
  }, [user]);

  const getUserRolesWithDetails = useCallback((): Role[] => {
    if (!user || !user.role_details) return [];
    return user.role_details;
  }, [user]);

  const hasRoleByNameOrLabel = useCallback((roleNameOrLabel: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    if (user.role === roleNameOrLabel) return true;
    if (roles.includes(roleNameOrLabel)) return true;
    if (user.role_label === roleNameOrLabel) return true;

    if (user.role_details) {
      return user.role_details.some(role =>
        role.name === roleNameOrLabel ||
        role.label === roleNameOrLabel
      );
    }

    return false;
  }, [user, roles]);

  // ============================================
  // ✅ FIX 6: ROLE HELPERS (memoized)
  // ============================================

  const hasPermission = useCallback((permission: string): boolean => {
    if (!permissions.length) return false;
    if (user?.role === 'ADMIN') return true;
    return permissions.includes(permission);
  }, [permissions, user]);

  const hasRole = useCallback((rolesToCheck: string | string[]): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (typeof rolesToCheck === 'string') {
      return user.role === rolesToCheck || roles.includes(rolesToCheck);
    }
    return rolesToCheck.some((role) => user.role === role || roles.includes(role));
  }, [user, roles]);

  const isAdmin = useCallback((): boolean => {
    if (!user) return false;
    return user.role === 'ADMIN' ||
      user.roles?.includes('ADMIN') ||
      user.role_label?.toUpperCase() === 'ADMIN' ||
      user.role_label?.toUpperCase() === 'ADMINISTRATOR' ||
      false;
  }, [user]);

  const isSupplier = useCallback((): boolean => {
    if (!user) return false;
    return user.roles?.includes('SUPPLIER') ||
      user.role_label?.toUpperCase() === 'SUPPLIER' ||
      false;
  }, [user]);

  const isHOD = useCallback((): boolean => {
    if (!user) return false;
    return user.role === 'HOD' ||
      user.roles?.includes('HOD') ||
      user.role_label?.toUpperCase() === 'HEAD OF DEPARTMENT' ||
      user.role_label?.toUpperCase() === 'HOD' ||
      false;
  }, [user]);

  const isAccountant = useCallback((): boolean => {
    if (!user) return false;
    return user.role === 'ACCOUNTANT' ||
      user.roles?.includes('ACCOUNTANT') ||
      user.role_label?.toUpperCase() === 'ACCOUNTANT' ||
      false;
  }, [user]);

  const isPrincipal = useCallback((): boolean => {
    if (!user) return false;
    return user.role === 'PRINCIPAL' ||
      user.roles?.includes('PRINCIPAL') ||
      user.role_label?.toUpperCase() === 'PRINCIPAL' ||
      false;
  }, [user]);

  const isFinalApprover = useCallback((): boolean => {
    if (!user) return false;
    return user.role === 'FINAL_APPROVER' ||
      user.roles?.includes('FINAL_APPROVER') ||
      user.role_label?.toUpperCase() === 'FINAL APPROVER' ||
      user.role_label?.toUpperCase() === 'FINAL_APPROVER' ||
      false;
  }, [user]);

  const isStaff = useCallback((): boolean => {
    if (!user) return false;
    return user.role === 'STAFF' ||
      user.roles?.includes('STAFF') ||
      user.role_label?.toUpperCase() === 'STAFF' ||
      false;
  }, [user]);

  const isAuditor = useCallback((): boolean => {
    if (!user) return false;
    return user.role === 'AUDITOR' ||
      user.roles?.includes('AUDITOR') ||
      user.role_label?.toUpperCase() === 'AUDITOR' ||
      false;
  }, [user]);

  const isProcurement = useCallback((): boolean => {
    if (!user) return false;
    return user.role === 'PROCUREMENT' ||
      user.roles?.includes('PROCUREMENT') ||
      user.role_label?.toUpperCase() === 'PROCUREMENT' ||
      user.role_label?.toUpperCase() === 'PROCUREMENT OFFICER' ||
      false;
  }, [user]);

  // ============================================
  // PROFILE COMPLETION HELPERS (memoized)
  // ============================================

  const getCompletionStatus = useCallback(() => {
    return completionStatus || { percentage: 0, is_complete: false, missing_fields: [] };
  }, [completionStatus]);

  const isProfileComplete = useCallback((): boolean => {
    return (completionStatus as { is_complete: boolean } | undefined)?.is_complete || false;
  }, [completionStatus]);

  const getProfilePercentage = useCallback((): number => {
    return (completionStatus as { percentage: number } | undefined)?.percentage || 0;
  }, [completionStatus]);

  // ============================================
  // REFRESH METHODS (memoized)
  // ============================================

  const refreshDropdownData = useCallback(() => {
    refetchDepartments();
    refetchRoles();
    refetchCategories();
  }, [refetchDepartments, refetchRoles, refetchCategories]);

  // ============================================
  // MUTATIONS (unchanged but with proper callbacks)
  // ============================================

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      await csrf.getCookie();
      return AuthService.login(data);
    },
    onSuccess: (response: AuthResponse) => {
      console.log('✅ Login response:', response);

      let authData: AuthData | null = null;

      if (response?.data) {
        if ('token' in response.data) {
          authData = response.data;
        }
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

        tokenManager.set(token, false);
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);

        if (user) {
          const userWithLabels = {
            ...user,
            role_label: user.role_label || null,
            role_description: user.role_description || null,
          };
          localStorage.setItem('user', JSON.stringify(userWithLabels));
        }

        queryClient.setQueryData(['user'], {
          data: {
            user: user,
            permissions: permissions,
            roles: user?.roles || [],
          }
        });

        success(response.message || 'Login successful');
        // ✅ Navigate after successful login
        router.push('/dashboard');
      } else {
        error('Login failed: No token received');
      }
    },
    onError: (err: any) => {
      console.error('❌ Login error:', err);
      error(err.response?.data?.message || err.message || 'An error occurred during login');
    },
  });

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
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    },
    onError: () => {
      tokenManager.remove();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
      queryClient.clear();

      error('Failed to logout properly. Redirecting...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    },
  });

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

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => AuthService.uploadAvatar(file),
    onSuccess: (response) => {
      if (response?.success) {
        if (user && response.data?.avatar) {
          const updatedUser = {
            ...user,
            avatar: response.data.avatar,
            profile_photo: response.data.avatar,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
          queryClient.setQueryData(['user'], {
            data: {
              user: updatedUser,
              permissions: permissions,
              roles: user?.roles || [],
            }
          });
        }
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

  const { data: twoFactorStatus, refetch: refetchTwoFactorStatus } = useQuery({
    queryKey: ['twoFactorStatus'],
    queryFn: () => AuthService.getTwoFactorStatus(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // ============================================
  // RETURN - All values are memoized or stable
  // ============================================

  return {
    // State
    user,
    permissions,
    roles,
    isAuthenticated,
    isLoading: isLoadingUser || loginMutation.isPending || registerMutation.isPending || isLoadingDepartments || isLoadingRoles || isLoadingCategories || !isInitialized,

    // User role helpers
    getRoleLabel,
    getRoleDescription,
    getRoleName,
    getRoleDisplayName,
    getUserRolesWithDetails,
    hasRoleByNameOrLabel,

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
