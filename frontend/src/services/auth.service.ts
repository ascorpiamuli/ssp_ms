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
    const result = await publicApi.post<AuthData>('/auth/register', data);
    return {
      success: true,
      message: 'Registration successful',
      data: result,
    };
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const result = await publicApi.post<AuthData>('/auth/login', data);
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  static async forgotPassword(data: ForgotPasswordRequest): Promise<SimpleResponse> {
    return publicApi.post<SimpleResponse>('/auth/forgot-password', data);
  }

  static async resetPassword(data: ResetPasswordRequest): Promise<SimpleResponse> {
    return publicApi.post<SimpleResponse>('/auth/reset-password', data);
  }

  static async validateResetToken(data: ValidateTokenRequest): Promise<SimpleResponse> {
    return publicApi.post<SimpleResponse>('/auth/validate-reset-token', data);
  }

  static async refreshToken(): Promise<RefreshTokenResponse> {
    const result = await publicApi.post<RefreshTokenData>('/auth/refresh');
    return {
      success: true,
      message: 'Token refreshed',
      data: result,
    };
  }

  // ============================================
  // PROTECTED ROUTES (Authentication required)
  // ============================================

  static async logout(): Promise<SimpleResponse> {
    return privateApi.post<SimpleResponse>('/auth/logout');
  }

  static async getMe(): Promise<UserResponse> {
    const result = await privateApi.get<UserData>('/auth/me');
    return {
      success: true,
      message: 'User retrieved',
      data: result,
    };
  }

  static async getPermissions(): Promise<PermissionsResponse> {
    const result = await privateApi.get<PermissionsData>('/auth/permissions');
    return {
      success: true,
      message: 'Permissions retrieved',
      data: result,
    };
  }

  static async updateProfile(data: UpdateProfileRequest): Promise<AuthResponse> {
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
  }

  static async uploadAvatar(file: File): Promise<AvatarResponse> {
    const result = await privateApi.upload<AvatarData>('/auth/profile/avatar', file, 'avatar');
    return {
      success: true,
      message: 'Avatar uploaded',
      data: result,
    };
  }

  static async changePassword(data: ChangePasswordRequest): Promise<SimpleResponse> {
    return privateApi.post<SimpleResponse>('/auth/change-password', data);
  }

  // ============================================
  // TWO FACTOR AUTHENTICATION ROUTES
  // ============================================

  static async enableTwoFactor(data: TwoFactorEnableRequest): Promise<TwoFactorResponse> {
    const result = await privateApi.post<TwoFactorData>('/auth/2fa/enable', data);
    return {
      success: true,
      message: '2FA enabled',
      data: result,
    };
  }

  static async disableTwoFactor(): Promise<SimpleResponse> {
    return privateApi.post<SimpleResponse>('/auth/2fa/disable');
  }

  static async verifyTwoFactor(data: TwoFactorVerifyRequest): Promise<SimpleResponse> {
    return privateApi.post<SimpleResponse>('/auth/2fa/verify', data);
  }

  static async generateRecoveryCodes(): Promise<RecoveryCodesResponse> {
    const result = await privateApi.post<RecoveryCodesData>('/auth/2fa/recovery-codes');
    return {
      success: true,
      message: 'Recovery codes generated',
      data: result,
    };
  }

  static async verifyRecoveryCode(data: TwoFactorRecoveryRequest): Promise<SimpleResponse> {
    return privateApi.post<SimpleResponse>('/auth/2fa/verify-recovery', data);
  }

  static async getTwoFactorStatus(): Promise<TwoFactorStatusResponse> {
    const result = await privateApi.get<TwoFactorStatusData>('/auth/2fa/status');
    return {
      success: true,
      message: '2FA status retrieved',
      data: result,
    };
  }
}

export default AuthService;
