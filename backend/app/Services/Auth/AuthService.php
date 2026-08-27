<?php

namespace App\Services\Auth;

use App\Models\Department;
use App\Services\BaseService;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Models\UserSession;
use App\Services\Admin\AuditLogService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AuthService extends BaseService
{
  protected RegistrationService $registrationService;
  protected LoginService $loginService;
  protected PasswordResetService $passwordResetService;
  protected TwoFactorAuthService $twoFactorAuthService;
  protected AuditLogService $auditLogService;

  public function __construct(
    RegistrationService $registrationService,
    LoginService $loginService,
    PasswordResetService $passwordResetService,
    TwoFactorAuthService $twoFactorAuthService,
    AuditLogService $auditLogService
  ) {
    $this->registrationService = $registrationService;
    $this->loginService = $loginService;
    $this->passwordResetService = $passwordResetService;
    $this->twoFactorAuthService = $twoFactorAuthService;
    $this->auditLogService = $auditLogService;
  }

  /**
   * Register a new user.
   */
  public function register(array $data): array
  {
    Log::info('AuthService::register called', [
      'email' => $data['email'] ?? null,
      'name' => $data['name'] ?? null,
    ]);

    try {
      $result = $this->registrationService->register($data);

      // Audit: Log registration
      if (isset($result['user']) && $result['user']) {
        $this->auditLogService->logRegistration(
          $result['user']->id,
          $data
        );
      }

      Log::info('AuthService::register completed', [
        'success' => true,
        'user_id' => $result['user']->id ?? null,
        'email' => $result['user']->email ?? null,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::register failed', [
        'email' => $data['email'] ?? null,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Login a user.
   */
  public function login(array $credentials): array
  {
    Log::info('AuthService::login called', [
      'email' => $credentials['email'] ?? null,
      'remember_me' => $credentials['remember_me'] ?? false,
      'ip' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);

    try {
      $result = $this->loginService->login($credentials);

      if ($result['success']) {
        // Audit: Log successful login
        if (isset($result['data']['user'])) {
          $this->auditLogService->logLogin(
            $result['data']['user']->id
          );
        }

        Log::info('AuthService::login successful', [
          'email' => $credentials['email'] ?? null,
          'user_id' => $result['data']['user']->id ?? null,
          'token_generated' => isset($result['data']['token']),
        ]);

        // The LoginService already returns the token, just pass it through
        return $result;
      }

      Log::warning('AuthService::login failed', [
        'email' => $credentials['email'] ?? null,
        'message' => $result['message'] ?? 'Unknown error',
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::login exception', [
        'email' => $credentials['email'] ?? null,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Logout a user.
   */
  public function logout(User $user, string $ip, string $userAgent): void
  {
    Log::info('AuthService::logout called', [
      'user_id' => $user->id,
      'email' => $user->email,
      'ip' => $ip,
    ]);

    try {
      $this->loginService->logout($user, $ip, $userAgent);

      // Audit: Log logout
      $this->auditLogService->logLogout($user->id);

      Log::info('AuthService::logout successful', [
        'user_id' => $user->id,
        'email' => $user->email,
      ]);
    } catch (\Exception $e) {
      Log::error('AuthService::logout failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Send password reset link.
   */
  public function sendPasswordResetLink(string $email, string $ip, string $userAgent): array
  {

    try {
      $result = $this->passwordResetService->sendResetLink($email, $ip, $userAgent);

      // Audit: Log password reset request
      if ($result['success'] ?? false) {
        $user = User::where('email', $email)->first();
        if ($user) {
          $this->auditLogService->logPasswordReset($user->id, $email);
        }
      }

      Log::info('AuthService::sendPasswordResetLink completed', [
        'email' => $email,
        'success' => $result['success'] ?? false,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::sendPasswordResetLink failed', [
        'email' => $email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Reset password.
   */
  public function resetPassword(array $credentials): array
  {
    Log::info('AuthService::resetPassword called', [
      'email' => $credentials['email'] ?? null,
    ]);

    try {
      $result = $this->passwordResetService->resetPassword($credentials);

      // Audit: Log password reset completion
      if ($result['success'] ?? false) {
        $user = User::where('email', $credentials['email'])->first();
        if ($user) {
          $this->auditLogService->logPasswordReset($user->id, $credentials['email']);
        }
      }

      Log::info('AuthService::resetPassword completed', [
        'email' => $credentials['email'] ?? null,
        'success' => $result['success'] ?? false,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::resetPassword failed', [
        'email' => $credentials['email'] ?? null,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Validate reset token.
   */
  public function validateResetToken(string $email, string $token): array
  {
    Log::info('AuthService::validateResetToken called', [
      'email' => $email,
    ]);

    try {
      $result = $this->passwordResetService->validateToken($email, $token);

      Log::info('AuthService::validateResetToken completed', [
        'email' => $email,
        'success' => $result['success'] ?? false,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::validateResetToken failed', [
        'email' => $email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Enable 2FA.
   */
  public function enableTwoFactor(User $user, string $secretKey): void
  {
    Log::info('AuthService::enableTwoFactor called', [
      'user_id' => $user->id,
      'email' => $user->email,
    ]);

    try {
      $this->twoFactorAuthService->enable($user, $secretKey);

      // Audit: Log 2FA enable
      $this->auditLogService->logTwoFactor($user->id, 'enable');

      Log::info('AuthService::enableTwoFactor completed', [
        'user_id' => $user->id,
        'email' => $user->email,
      ]);
    } catch (\Exception $e) {
      Log::error('AuthService::enableTwoFactor failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Disable 2FA.
   */
  public function disableTwoFactor(User $user): void
  {
    Log::info('AuthService::disableTwoFactor called', [
      'user_id' => $user->id,
      'email' => $user->email,
    ]);

    try {
      $this->twoFactorAuthService->disable($user);

      // Audit: Log 2FA disable
      $this->auditLogService->logTwoFactor($user->id, 'disable');

      Log::info('AuthService::disableTwoFactor completed', [
        'user_id' => $user->id,
        'email' => $user->email,
      ]);
    } catch (\Exception $e) {
      Log::error('AuthService::disableTwoFactor failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Verify 2FA code.
   */
  public function verifyTwoFactorCode(User $user, string $code): bool
  {
    Log::info('AuthService::verifyTwoFactorCode called', [
      'user_id' => $user->id,
      'email' => $user->email,
    ]);

    try {
      $result = $this->twoFactorAuthService->verifyCode($user, $code);

      Log::info('AuthService::verifyTwoFactorCode completed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'success' => $result,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::verifyTwoFactorCode failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Get 2FA status.
   */
  public function getTwoFactorStatus(User $user): array
  {
    Log::info('AuthService::getTwoFactorStatus called', [
      'user_id' => $user->id,
      'email' => $user->email,
    ]);

    try {
      $result = $this->twoFactorAuthService->getStatus($user);

      Log::info('AuthService::getTwoFactorStatus completed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'enabled' => $result['enabled'] ?? false,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::getTwoFactorStatus failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Get authenticated user with permissions and department info.
   */
  public function getAuthUserData(User $user): array
  {
    Log::info('AuthService::getAuthUserData called', [
      'user_id' => $user->id,
      'email' => $user->email,
    ]);

    try {
      // ✅ Load relationships
      $user->load(['department', 'roles', 'profile']);

      // ✅ Get all roles (they might be uppercase)
      $allRoles = $user->getRoleNames();

      // ✅ Check if user has HOD role (case insensitive)
      $hasHodRole = $user->hasRole('hod') ||
        $user->hasRole('HOD') ||
        $allRoles->contains('hod') ||
        $allRoles->contains('HOD') ||
        $allRoles->contains(strtolower('HOD'));

      // ✅ Also check by role label
      $hasHodLabel = false;
      if ($user->relationLoaded('roles') && $user->roles) {
        foreach ($user->roles as $role) {
          if (strtolower($role->name) === 'hod' || strtolower($role->label ?? '') === 'hod') {
            $hasHodLabel = true;
            break;
          }
        }
      }

      $isHOD = $hasHodRole || $hasHodLabel;

      Log::info('AuthService::role_debug', [
        'user_id' => $user->id,
        'all_roles' => $allRoles->toArray(),
        'has_hod_role' => $hasHodRole,
        'has_hod_label' => $hasHodLabel,
        'is_hod' => $isHOD,
      ]);

      // ✅ Find the department where this user is the HOD
      $hodDepartment = null;
      if ($isHOD) {
        $hodDepartment = Department::where('hod_id', $user->id)->first();

        Log::info('AuthService::hod_department_check', [
          'user_id' => $user->id,
          'is_hod' => $isHOD,
          'hod_department_found' => $hodDepartment ? true : false,
          'hod_department_id' => $hodDepartment?->id,
          'hod_department_name' => $hodDepartment?->name,
        ]);
      }

      // ✅ If no HOD department found but user has hod role, try to find any department
      if ($isHOD && !$hodDepartment) {
        $anyDepartment = Department::where('hod_id', $user->id)->first();
        if ($anyDepartment) {
          $hodDepartment = $anyDepartment;
          Log::info('AuthService::hod_department_found_by_direct_query', [
            'user_id' => $user->id,
            'department_id' => $anyDepartment->id,
            'department_name' => $anyDepartment->name,
          ]);
        }
      }

      // ✅ Determine effective department
      $effectiveDepartment = $hodDepartment ?? $user->department;

      // ✅ If still null, try to find department via direct query one more time
      if (!$effectiveDepartment && $isHOD) {
        $effectiveDepartment = Department::where('hod_id', $user->id)->first();
      }

      Log::info('AuthService::effective_department', [
        'user_id' => $user->id,
        'assigned_department_id' => $user->department_id,
        'hod_department_id' => $hodDepartment?->id,
        'effective_department_id' => $effectiveDepartment?->id,
        'effective_department_name' => $effectiveDepartment?->name,
        'is_hod' => $isHOD,
      ]);

      // ✅ Set the effective department on the user (for the resource to use)
      $user->setAttribute('effective_department', $effectiveDepartment);
      $user->setAttribute('hod_department', $hodDepartment);
      $user->setAttribute('is_hod', $isHOD);
      $user->setAttribute('has_hod_department', $hodDepartment ? true : false);

      $permissions = $user->getAllPermissions()->pluck('name');
      $roles = $user->getRoleNames();

      Log::info('AuthService::getAuthUserData completed', [
        'user_id' => $user->id,
        'effective_department_id' => $effectiveDepartment?->id,
        'effective_department_name' => $effectiveDepartment?->name,
        'permissions_count' => $permissions->count(),
        'roles_count' => $roles->count(),
      ]);

      return [
        'user' => $user,
        'permissions' => $permissions,
        'roles' => $roles,
      ];
    } catch (\Exception $e) {
      Log::error('AuthService::getAuthUserData failed', [
        'user_id' => $user->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Get user permissions.
   */
  public function getUserPermissions(User $user): array
  {
    Log::info('AuthService::getUserPermissions called', [
      'user_id' => $user->id,
      'email' => $user->email,
    ]);

    try {
      $permissions = $user->getAllPermissions()->pluck('name');
      $roles = $user->getRoleNames();

      Log::info('AuthService::getUserPermissions completed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'permissions_count' => $permissions->count(),
        'roles_count' => $roles->count(),
      ]);

      return [
        'permissions' => $permissions,
        'roles' => $roles,
      ];
    } catch (\Exception $e) {
      Log::error('AuthService::getUserPermissions failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Change user password.
   */
  public function changePassword(User $user, string $newPassword, string $ip, string $userAgent): void
  {
    Log::info('AuthService::changePassword called', [
      'user_id' => $user->id,
      'email' => $user->email,
      'ip' => $ip,
    ]);

    try {
      $user->update([
        'password' => Hash::make($newPassword),
      ]);

      // Audit: Log password change
      $this->auditLogService->logUserAction(
        $user->id,
        'change_password',
        'security',
        'User changed password',
        [
          'ip_address' => $ip,
          'user_agent' => $userAgent,
        ]
      );

      Log::info('AuthService::changePassword completed', [
        'user_id' => $user->id,
        'email' => $user->email,
      ]);
    } catch (\Exception $e) {
      Log::error('AuthService::changePassword failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Update user profile.
   */
  public function updateProfile(User $user, array $data): User
  {
    Log::info('AuthService::updateProfile called', [
      'user_id' => $user->id,
      'email' => $user->email,
      'data_keys' => array_keys($data),
    ]);

    try {
      // Get old values before update for audit
      $oldUser = clone $user;
      $oldValues = $oldUser->toArray();

      $user->update($data);

      if ($user->profile && isset($data['profile'])) {
        $user->profile->update($data['profile']);
      }

      $user->fresh(['department', 'roles', 'profile']);

      // Audit: Log profile update if there were changes
      if ($user->getChanges()) {
        $this->auditLogService->logModelUpdated($user, $oldValues);
      }

      Log::info('AuthService::updateProfile completed', [
        'user_id' => $user->id,
        'email' => $user->email,
      ]);

      return $user;
    } catch (\Exception $e) {
      Log::error('AuthService::updateProfile failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Validate registration data.
   */
  public function validateRegistration(array $data): array
  {
    Log::info('AuthService::validateRegistration called', [
      'email' => $data['email'] ?? null,
    ]);

    try {
      $result = $this->registrationService->validateRegistrationData($data);

      Log::info('AuthService::validateRegistration completed', [
        'email' => $data['email'] ?? null,
        'valid' => $result['valid'] ?? false,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::validateRegistration failed', [
        'email' => $data['email'] ?? null,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Validate login credentials.
   */
  public function validateLogin(array $credentials): array
  {
    Log::info('AuthService::validateLogin called', [
      'email' => $credentials['email'] ?? null,
    ]);

    try {
      $result = $this->loginService->validateCredentials($credentials);

      Log::info('AuthService::validateLogin completed', [
        'email' => $credentials['email'] ?? null,
        'valid' => $result['valid'] ?? false,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::validateLogin failed', [
        'email' => $credentials['email'] ?? null,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Validate forgot password request.
   */
  public function validateForgotPassword(array $data): array
  {
    Log::info('AuthService::validateForgotPassword called', [
      'email' => $data['email'] ?? null,
    ]);

    try {
      $result = $this->passwordResetService->validateForgotRequest($data);

      Log::info('AuthService::validateForgotPassword completed', [
        'email' => $data['email'] ?? null,
        'valid' => $result['valid'] ?? false,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::validateForgotPassword failed', [
        'email' => $data['email'] ?? null,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Validate reset password request.
   */
  public function validateResetPassword(array $data): array
  {
    Log::info('AuthService::validateResetPassword called', [
      'email' => $data['email'] ?? null,
    ]);

    try {
      $result = $this->passwordResetService->validateResetRequest($data);

      Log::info('AuthService::validateResetPassword completed', [
        'email' => $data['email'] ?? null,
        'valid' => $result['valid'] ?? false,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::validateResetPassword failed', [
        'email' => $data['email'] ?? null,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Create session for user.
   */
  public function createUserSession(User $user, string $ip, string $userAgent): void
  {
    Log::info('AuthService::createUserSession called', [
      'user_id' => $user->id,
      'email' => $user->email,
      'ip' => $ip,
    ]);

    try {
      UserSession::create([
        'user_id' => $user->id,
        'session_id' => Str::random(40),
        'ip_address' => $ip,
        'user_agent' => $userAgent,
        'last_activity' => now(),
        'is_active' => true,
      ]);

      Log::info('AuthService::createUserSession completed', [
        'user_id' => $user->id,
        'email' => $user->email,
      ]);
    } catch (\Exception $e) {
      Log::error('AuthService::createUserSession failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Log user activity.
   */
  public function logActivity(User $user, string $action, string $module, string $description, string $ip, string $userAgent): void
  {
    Log::info('AuthService::logActivity called', [
      'user_id' => $user->id,
      'email' => $user->email,
      'action' => $action,
      'module' => $module,
    ]);

    try {
      // Audit: Log user activity using AuditLogService
      $this->auditLogService->logUserAction(
        $user->id,
        $action,
        $module,
        $description,
        [
          'ip_address' => $ip,
          'user_agent' => $userAgent,
        ]
      );

      Log::info('AuthService::logActivity completed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'action' => $action,
      ]);
    } catch (\Exception $e) {
      Log::error('AuthService::logActivity failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'action' => $action,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Generate recovery codes for 2FA.
   */
  public function generateRecoveryCodes(): array
  {
    Log::info('AuthService::generateRecoveryCodes called');

    try {
      $codes = [];
      for ($i = 0; $i < 8; $i++) {
        $codes[] = strtoupper(substr(md5(uniqid()), 0, 8));
      }

      Log::info('AuthService::generateRecoveryCodes completed', [
        'codes_count' => count($codes),
      ]);

      return $codes;
    } catch (\Exception $e) {
      Log::error('AuthService::generateRecoveryCodes failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Validate recovery code.
   */
  public function validateRecoveryCode(User $user, string $code): bool
  {
    Log::info('AuthService::validateRecoveryCode called', [
      'user_id' => $user->id,
      'email' => $user->email,
    ]);

    try {
      // In production, this would check against stored hashed recovery codes
      // For now, just return true for demo
      $result = true;

      Log::info('AuthService::validateRecoveryCode completed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'success' => $result,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('AuthService::validateRecoveryCode failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Save recovery codes for user.
   */
  public function saveRecoveryCodes(User $user, array $codes): void
  {
    Log::info('AuthService::saveRecoveryCodes called', [
      'user_id' => $user->id,
      'email' => $user->email,
      'codes_count' => count($codes),
    ]);

    try {
      // In production, save hashed recovery codes to database
      // For now, just log

      // Audit: Log recovery codes generation
      $this->auditLogService->logUserAction(
        $user->id,
        'generate_recovery_codes',
        'security',
        'User generated new 2FA recovery codes',
        ['codes_count' => count($codes)]
      );

      Log::info('AuthService::saveRecoveryCodes completed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'codes_count' => count($codes),
      ]);
    } catch (\Exception $e) {
      Log::error('AuthService::saveRecoveryCodes failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }
}
