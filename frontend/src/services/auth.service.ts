// services/auth.service.ts

import { privateApi, publicApi } from './api';
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ValidateTokenRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  TwoFactorEnableRequest,
  TwoFactorVerifyRequest,
  TwoFactorRecoveryRequest,
  AuthData,
  UserData,
  PermissionsData,
  RefreshTokenData,
  AvatarData,
  TwoFactorData,
  RecoveryCodesData,
  TwoFactorStatusData,
  AuthResponse,
  UserResponse,
  PermissionsResponse,
  SimpleResponse,
  RefreshTokenResponse,
  AvatarResponse,
  TwoFactorResponse,
  RecoveryCodesResponse,
  TwoFactorStatusResponse,
} from '../types/auth.types';

export class AuthService {
  // ============================================
  // PUBLIC ROUTES (No authentication required)
  // ============================================

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const result = await publicApi.post<AuthData>('/auth/register', data);
      return {
        success: true,
        message: 'Registration successful',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const result = await publicApi.post<AuthData>('/auth/login', data);
      return {
        success: true,
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  static async forgotPassword(data: ForgotPasswordRequest): Promise<SimpleResponse> {
    try {
      const result = await publicApi.post<SimpleResponse>('/auth/forgot-password', data);

      if (result && typeof result === 'object') {
        return {
          success: result.success === true,
          message: result.message || 'Password reset link sent',
        };
      }

      return {
        success: false,
        message: 'Invalid response from server',
      };
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(data: ResetPasswordRequest): Promise<SimpleResponse> {
    try {
      const result = await publicApi.post<SimpleResponse>('/auth/reset-password', data);

      if (result && typeof result === 'object') {
        return {
          success: result.success === true,
          message: result.message || 'Password reset successful',
        };
      }

      return {
        success: false,
        message: 'Invalid response from server',
      };
    } catch (error) {
      throw error;
    }
  }

  static async validateResetToken(data: ValidateTokenRequest): Promise<SimpleResponse> {
    try {
      const result = await publicApi.post<SimpleResponse>('/auth/validate-reset-token', data);

      if (result && typeof result === 'object') {
        return {
          success: result.success === true,
          message: result.message || 'Token is valid',
        };
      }

      return {
        success: false,
        message: 'Invalid response from server',
      };
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const result = await publicApi.post<RefreshTokenData>('/auth/refresh');
      return {
        success: true,
        message: 'Token refreshed',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // PROTECTED ROUTES (Authentication required)
  // ============================================

  static async logout(): Promise<SimpleResponse> {
    try {
      const result = await privateApi.post<SimpleResponse>('/auth/logout');

      if (result && typeof result === 'object') {
        return {
          success: result.success === true,
          message: result.message || 'Logged out successfully',
        };
      }

      return {
        success: false,
        message: 'Invalid response from server',
      };
    } catch (error) {
      throw error;
    }
  }

  static async getMe(): Promise<UserResponse> {
    try {
      const result = await privateApi.get<UserData>('/auth/me');
      return {
        success: true,
        message: 'User retrieved',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getPermissions(): Promise<PermissionsResponse> {
    try {
      const result = await privateApi.get<PermissionsData>('/auth/permissions');
      return {
        success: true,
        message: 'Permissions retrieved',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(data: UpdateProfileRequest): Promise<AuthResponse> {
    try {
      // If avatar is included, use FormData
      if (data.profile?.avatar) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'profile' && value !== undefined) {
            formData.append(key, value as string);
          }
        });

        if (data.profile) {
          Object.entries(data.profile).forEach(([key, value]) => {
            if (key !== 'avatar' && value !== undefined) {
              formData.append(`profile[${key}]`, value as string);
            }
          });
          if (data.profile.avatar) {
            formData.append('avatar', data.profile.avatar);
          }
        }

        const result = await privateApi.post<AuthData>('/auth/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return {
          success: true,
          message: 'Profile updated',
          data: result,
        };
      }

      const result = await privateApi.put<AuthData>('/auth/profile', data);
      return {
        success: true,
        message: 'Profile updated',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload avatar - FIXED: Using the correct endpoint from your routes
   * The route is POST /profile/photo in your API
   */
  static async uploadAvatar(file: File): Promise<AvatarResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Use the correct endpoint from your routes: /profile/photo
      const result = await privateApi.post<AvatarData>('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        message: 'Avatar uploaded successfully',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete avatar - FIXED: Using the correct endpoint from your routes
   * The route is DELETE /profile/photo in your API
   */
  static async deleteAvatar(): Promise<SimpleResponse> {
    try {
      const result = await privateApi.delete<SimpleResponse>('/profile/photo');

      if (result && typeof result === 'object') {
        return {
          success: result.success === true,
          message: result.message || 'Avatar deleted successfully',
        };
      }

      return {
        success: false,
        message: 'Invalid response from server',
      };
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(data: ChangePasswordRequest): Promise<SimpleResponse> {
    try {
      const result = await privateApi.post<SimpleResponse>('/auth/change-password', data);

      if (result && typeof result === 'object') {
        return {
          success: result.success === true,
          message: result.message || 'Password changed successfully',
        };
      }

      return {
        success: false,
        message: 'Invalid response from server',
      };
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // TWO FACTOR AUTHENTICATION ROUTES
  // ============================================

  static async enableTwoFactor(data: TwoFactorEnableRequest): Promise<TwoFactorResponse> {
    try {
      const result = await privateApi.post<TwoFactorData>('/2fa/enable', data);
      return {
        success: true,
        message: '2FA enabled',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  static async disableTwoFactor(): Promise<SimpleResponse> {
    try {
      const result = await privateApi.post<SimpleResponse>('/2fa/disable');

      if (result && typeof result === 'object') {
        return {
          success: result.success === true,
          message: result.message || '2FA disabled successfully',
        };
      }

      return {
        success: false,
        message: 'Invalid response from server',
      };
    } catch (error) {
      throw error;
    }
  }

  static async verifyTwoFactor(data: TwoFactorVerifyRequest): Promise<SimpleResponse> {
    try {
      const result = await privateApi.post<SimpleResponse>('/2fa/verify', data);

      if (result && typeof result === 'object') {
        return {
          success: result.success === true,
          message: result.message || '2FA code verified',
        };
      }

      return {
        success: false,
        message: 'Invalid response from server',
      };
    } catch (error) {
      throw error;
    }
  }

  static async generateRecoveryCodes(): Promise<RecoveryCodesResponse> {
    try {
      const result = await privateApi.post<RecoveryCodesData>('/2fa/recovery-codes');
      return {
        success: true,
        message: 'Recovery codes generated',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  static async verifyRecoveryCode(data: TwoFactorRecoveryRequest): Promise<SimpleResponse> {
    try {
      const result = await privateApi.post<SimpleResponse>('/2fa/verify-recovery', data);

      if (result && typeof result === 'object') {
        return {
          success: result.success === true,
          message: result.message || 'Recovery code verified',
        };
      }

      return {
        success: false,
        message: 'Invalid response from server',
      };
    } catch (error) {
      throw error;
    }
  }

  static async getTwoFactorStatus(): Promise<TwoFactorStatusResponse> {
    try {
      const result = await privateApi.get<TwoFactorStatusData>('/2fa/status');
      return {
        success: true,
        message: '2FA status retrieved',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService;
