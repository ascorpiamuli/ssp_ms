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
// ROLE TYPES
// ============================================

export interface Role {
  id: number;
  name: string;
  label: string | null;
  description: string | null;
  guard_name: string;
  permissions?: string[];
  permission_count?: number;
  created_at: string;
  updated_at: string;
}

// RoleDetails is now the same as Role (removed duplicate)
export type RoleDetails = Role;

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionGroup {
  [module: string]: Permission[];
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
  role: string;
  role_label: string;  // NEW: Role label from roles table
  role_description: string |null;  // NEW: Role description from roles table
  department_id?: number;
  department?: {
    id: number;
    name: string;
    code: string;
    description?: string;
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
  avatar?: string | null;
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
  role_details?: RoleDetails[];  // Full role details with labels and descriptions
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

// ============================================
// ROLE MANAGEMENT TYPES
// ============================================

export interface CreateRoleRequest {
  name: string;
  label?: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  label?: string;
  description?: string;
  permissions?: string[];
}

export interface AssignPermissionsRequest {
  permissions: string[];
}

export interface AssignRoleToUserRequest {
  user_id: number;
  role_name: string;
}

export interface UpdateUserRolesRequest {
  user_id: number;
  roles: string[];
}

export interface RoleStats {
  total_roles: number;
  total_permissions: number;
  roles_with_users: number;
  roles_without_users: number;
  roles_with_labels: number;
  roles_without_labels: number;
  permissions_per_role: Record<string, {
    label: string | null;
    permission_count: number;
    user_count: number;
  }>;
}

export interface RoleOption {
  id: number;
  name: string;
  label: string | null;
  description: string | null;
}

export interface UserRoleInfo {
  has_role: boolean;
  role?: {
    id: number;
    name: string;
    label: string | null;
    description: string | null;
    permissions: string[];
  };
  all_roles?: string[];
  permissions?: string[];
}

// ============================================
// HELPER TYPE GUARDS
// ============================================

export function isAuthenticated(response: any): response is AuthResponse {
  return response?.success === true && response?.data?.user !== undefined;
}

export function hasToken(response: any): response is AuthResponse {
  return response?.success === true && response?.data?.token !== undefined;
}

export function isUserData(response: any): response is UserResponse {
  return response?.success === true && response?.data?.user !== undefined;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getUserRoleLabel(user: User | null): string | null {
  if (!user) return null;
  return user.role_label || null;
}

export function getUserRoleDescription(user: User | null): string | null {
  if (!user) return null;
  return user.role_description || null;
}

export function getUserRoleDisplayName(user: User | null): string {
  if (!user) return 'No Role Assigned';
  if (user.role_label) return user.role_label;
  if (user.role) return user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return 'No Role Assigned';
}

export function getUserPrimaryRole(user: User | null): string | null {
  if (!user) return null;
  return user.role || null;
}

export function getRoleLabel(role: Role | null): string {
  if (!role) return 'No Role';
  return role.label || role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function getRoleDisplayName(role: Role | null): string {
  if (!role) return 'No Role Assigned';
  if (role.label) return role.label;
  return role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ============================================
// ROLE HELPER FUNCTIONS (for frontend use)
// ============================================

export function hasRoleName(user: User | null, roleName: string): boolean {
  if (!user) return false;
  return user.role === roleName || (user.roles && user.roles.includes(roleName));
}

export function hasRoleLabel(user: User | null, roleLabel: string): boolean {
  if (!user) return false;
  if (!user.role_label) return false;
  return user.role_label.toLowerCase() === roleLabel.toLowerCase();
}

export function hasRoleByNameOrLabel(user: User | null, roleNameOrLabel: string): boolean {
  if (!user) return false;
  return hasRoleName(user, roleNameOrLabel) || hasRoleLabel(user, roleNameOrLabel);
}

export function isUserAdmin(user: User | null): boolean {
  if (!user) return false;
  return hasRoleByNameOrLabel(user, 'ADMIN') ||
    hasRoleByNameOrLabel(user, 'Administrator') ||
    user.role === 'ADMIN' ||
    user.role_label === 'Administrator';
}

export function isUserSupplier(user: User | null): boolean {
  if (!user) return false;
  return hasRoleByNameOrLabel(user, 'SUPPLIER') ||
    hasRoleByNameOrLabel(user, 'Supplier');
}

export function isUserHOD(user: User | null): boolean {
  if (!user) return false;
  return hasRoleByNameOrLabel(user, 'HOD') ||
    hasRoleByNameOrLabel(user, 'Head of Department');
}

export function isUserAccountant(user: User | null): boolean {
  if (!user) return false;
  return hasRoleByNameOrLabel(user, 'ACCOUNTANT') ||
    hasRoleByNameOrLabel(user, 'Accountant');
}

export function isUserPrincipal(user: User | null): boolean {
  if (!user) return false;
  return hasRoleByNameOrLabel(user, 'PRINCIPAL') ||
    hasRoleByNameOrLabel(user, 'Principal');
}

export function isUserProcurement(user: User | null): boolean {
  if (!user) return false;
  return hasRoleByNameOrLabel(user, 'PROCUREMENT') ||
    hasRoleByNameOrLabel(user, 'Procurement Officer') ||
    hasRoleByNameOrLabel(user, 'Procurement');
}
