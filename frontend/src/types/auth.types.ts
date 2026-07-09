// types/auth.types.ts

// ============================================
// REQUEST TYPES
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: string;
  department?: string;  // Not null, optional
  timezone?: string;
  id_number?: string;   // Not null, optional
  date_of_birth?: string; // Not null, optional
  // Supplier specific fields
  company_name?: string;
  company_email?: string;
  company_registration?: string;
  company_address?: string;
  supplier_category?: string;
  company_phone?: string;
  company_website?: string;
  tax_id?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ValidateTokenRequest {
  email: string;
  token: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  timezone?: string;
  profile?: {
    date_of_birth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    bio?: string;
    avatar?: File;
  };
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface TwoFactorEnableRequest {
  code: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface TwoFactorRecoveryRequest {
  recovery_code: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  initials?: string;
  email: string;
  phone: string;
  role: string | null;
  department_id?: number;
  department?: {
    id: number;
    name: string;
    code: string;
  };
  is_active: boolean;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: number | null;
  rejection_reason?: string | null;
  last_login_at?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  profile_photo?: string | null;
  avatar_url?: string | null;
  id_number?: string | null;
  date_of_birth?: string | null;
  profile?: {
    id: number;
    avatar?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    bio?: string;
  };
  roles: string[];
  permissions: string[];
}

export interface AuthData {
  user: User;
  token?: string;
  token_type?: string;
  permissions?: string[];
  roles?: string[];
  requires_approval?: boolean;
}

export interface UserData {
  user: User;
  permissions: string[];
  roles: string[];
}

export interface PermissionsData {
  permissions: string[];
  roles: string[];
}

export interface RefreshTokenData {
  token: string;
}

export interface AvatarData {
  avatar: string;
}

export interface TwoFactorData {
  secret_key: string;
  recovery_codes: string[];
}

export interface RecoveryCodesData {
  recovery_codes: string[];
}

export interface TwoFactorStatusData {
  enabled: boolean;
  confirmed_at?: string;
  has_recovery_codes: boolean;
}

// ============================================
// API RESPONSE WRAPPERS
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// SERVICE RESPONSE TYPES (with required message)
// ============================================

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthData;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: UserData;
}

export interface PermissionsResponse {
  success: boolean;
  message: string;
  data: PermissionsData;
}

export interface SimpleResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: RefreshTokenData;
}

export interface AvatarResponse {
  success: boolean;
  message: string;
  data: AvatarData;
}

export interface TwoFactorResponse {
  success: boolean;
  message: string;
  data: TwoFactorData;
}

export interface RecoveryCodesResponse {
  success: boolean;
  message: string;
  data: RecoveryCodesData;
}

export interface TwoFactorStatusResponse {
  success: boolean;
  message: string;
  data: TwoFactorStatusData;
}
