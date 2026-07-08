<?php

namespace App\Services\Auth;

use App\Services\BaseService;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Models\UserSession;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AuthService extends BaseService
{
  protected RegistrationService $registrationService;
  protected LoginService $loginService;
  protected PasswordResetService $passwordResetService;
  protected TwoFactorAuthService $twoFactorAuthService;

  public function __construct(
    RegistrationService $registrationService,
    LoginService $loginService,
    PasswordResetService $passwordResetService,
    TwoFactorAuthService $twoFactorAuthService
  ) {
    $this->registrationService = $registrationService;
    $this->loginService = $loginService;
    $this->passwordResetService = $passwordResetService;
    $this->twoFactorAuthService = $twoFactorAuthService;
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
        Log::info('AuthService::login successful', [
          'email' => $credentials['email'] ?? null,
          'user_id' => $result['data']['user']->id ?? null,
          'token_generated' => isset($result['data']['token']),
        ]);
      } else {
        Log::warning('AuthService::login failed', [
          'email' => $credentials['email'] ?? null,
          'message' => $result['message'] ?? 'Unknown error',
        ]);
      }

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
    Log::info('AuthService::sendPasswordResetLink called', [
      'email' => $email,
      'ip' => $ip,
    ]);

    try {
      $result = $this->passwordResetService->sendResetLink($email, $ip, $userAgent);

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
   * Get authenticated user with permissions.
   */
  public function getAuthUserData(User $user): array
  {
    Log::info('AuthService::getAuthUserData called', [
      'user_id' => $user->id,
      'email' => $user->email,
      'role' => $user->role,
    ]);

    try {
      $user->load(['department', 'roles', 'profile']);

      $permissions = $user->getAllPermissions()->pluck('name');
      $roles = $user->getRoleNames();

      Log::info('AuthService::getAuthUserData completed', [
        'user_id' => $user->id,
        'email' => $user->email,
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
        'email' => $user->email,
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

      UserActivityLog::create([
        'user_id' => $user->id,
        'action' => 'CHANGE_PASSWORD',
        'module' => 'SECURITY',
        'description' => 'User changed password',
        'ip_address' => $ip,
        'user_agent' => $userAgent,
      ]);

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
      $user->update($data);

      if ($user->profile && isset($data['profile'])) {
        $user->profile->update($data['profile']);
      }

      $user->fresh(['department', 'roles', 'profile']);

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
      UserActivityLog::create([
        'user_id' => $user->id,
        'action' => $action,
        'module' => $module,
        'description' => $description,
        'ip_address' => $ip,
        'user_agent' => $userAgent,
      ]);

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
