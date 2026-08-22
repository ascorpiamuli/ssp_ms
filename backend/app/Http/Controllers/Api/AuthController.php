<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
  protected AuthService $authService;

  public function __construct(AuthService $authService)
  {
    $this->authService = $authService;
  }

  /**
   * Register a new user.
   */
  public function register(RegisterRequest $request)
  {
    try {
      $result = $this->authService->register($request->validated());

      return $this->created([
        'user' => new UserResource($result['user']),
        'requires_approval' => $result['requires_approval'],
      ], 'Registration successful. Please wait for admin approval.');
    } catch (ValidationException $e) {
      return $this->validationError($e);
    } catch (\Exception $e) {
      return $this->error('Registration failed: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Login user.
   */
  public function login(LoginRequest $request)
  {
    try {
      $result = $this->authService->login($request->validated());

      if (!$result['success']) {
        return $this->error($result['message'], 401);
      }

      return $this->success([
        'user' => new UserResource($result['data']['user']),
        'permissions' => $result['data']['permissions'],
        'token' => $result['data']['token'],
        'token_type' => $result['data']['token_type'],
      ], 'Login successful');
    } catch (\Exception $e) {
      return $this->error('Login failed: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Logout user.
   */
  public function logout(Request $request)
  {
    try {
      $this->authService->logout(
        $request->user(),
        $request->ip(),
        $request->userAgent()
      );

      return $this->success(null, 'Logged out successfully');
    } catch (\Exception $e) {
      return $this->error('Logout failed: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Get authenticated user.
   */
  // app/Http/Controllers/Api/AuthController.php

  public function me(Request $request)
  {
    try {

      $data = $this->authService->getAuthUserData($request->user());

      return $this->success([
        'user' => new UserResource($data['user']),
        'permissions' => $data['permissions'],
        'roles' => $data['roles'],
      ], 'User retrieved successfully');
    } catch (\Exception $e) {
      
      return $this->error('Failed to get user: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Get user permissions.
   */
  public function permissions(Request $request)
  {
    try {
      $data = $this->authService->getUserPermissions($request->user());

      return $this->success($data, 'Permissions retrieved successfully');
    } catch (\Exception $e) {
      return $this->error('Failed to get permissions: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Update user profile.
   */
  public function updateProfile(UpdateProfileRequest $request)
  {
    try {
      $user = $this->authService->updateProfile($request->user(), $request->validated());

      return $this->success([
        'user' => new UserResource($user),
      ], 'Profile updated successfully');
    } catch (ValidationException $e) {
      return $this->validationError($e);
    } catch (\Exception $e) {
      return $this->error('Failed to update profile: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Change password.
   */
  public function changePassword(ChangePasswordRequest $request)
  {
    try {
      $this->authService->changePassword(
        $request->user(),
        $request->password,
        $request->ip(),
        $request->userAgent()
      );

      return $this->success(null, 'Password changed successfully');
    } catch (ValidationException $e) {
      return $this->validationError($e);
    } catch (\Exception $e) {
      return $this->error('Failed to change password: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Forgot password - Send reset link.
   */
  public function forgotPassword(ForgotPasswordRequest $request)
  {
    try {
      $result = $this->authService->sendPasswordResetLink(
        $request->email,
        $request->ip(),
        $request->userAgent()
      );

      if (!$result['success']) {
        return $this->error($result['message'], 400);
      }

      return $this->success(null, $result['message']);
    } catch (ValidationException $e) {
      return $this->validationError($e);
    } catch (\Exception $e) {
      return $this->error('Failed to send reset link: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Reset password.
   */
  public function resetPassword(ResetPasswordRequest $request)
  {
    try {
      $result = $this->authService->resetPassword($request->validated());

      if (!$result['success']) {
        return $this->error($result['message'], 400);
      }

      return $this->success(null, $result['message']);
    } catch (ValidationException $e) {
      return $this->validationError($e);
    } catch (\Exception $e) {
      return $this->error('Failed to reset password: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Validate reset token.
   */
  public function validateResetToken(Request $request)
  {
    try {
      $request->validate([
        'email' => 'required|email|exists:users',
        'token' => 'required|string',
      ]);

      $result = $this->authService->validateResetToken(
        $request->email,
        $request->token
      );

      if (!$result['success']) {
        return $this->error($result['message'], 400);
      }

      return $this->success(null, $result['message']);
    } catch (ValidationException $e) {
      return $this->validationError($e);
    } catch (\Exception $e) {
      return $this->error('Failed to validate token: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Refresh token.
   */
  public function refresh(Request $request)
  {
    try {
      $user = $request->user();
      $token = $user->createToken('auth_token')->plainTextToken;

      return $this->success([
        'token' => $token,
        'token_type' => 'Bearer',
      ], 'Token refreshed successfully');
    } catch (\Exception $e) {
      return $this->error('Failed to refresh token: ' . $e->getMessage(), 500);
    }
  }

    // ============================================
    // TWO FACTOR AUTHENTICATION METHODS
    // ============================================

  /**
   * Enable 2FA.
   */
  public function enableTwoFactor(Request $request)
  {
    try {
      $request->validate([
        'code' => 'required|string|size:6',
      ]);

      $secretKey = base64_encode(random_bytes(20));

      $this->authService->enableTwoFactor(
        $request->user(),
        $secretKey
      );

      $recoveryCodes = $this->authService->generateRecoveryCodes();

      return $this->success([
        'secret_key' => $secretKey,
        'recovery_codes' => $recoveryCodes,
      ], '2FA enabled successfully');
    } catch (ValidationException $e) {
      return $this->validationError($e);
    } catch (\Exception $e) {
      return $this->error('Failed to enable 2FA: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Disable 2FA.
   */
  public function disableTwoFactor(Request $request)
  {
    try {
      $this->authService->disableTwoFactor($request->user());

      return $this->success(null, '2FA disabled successfully');
    } catch (\Exception $e) {
      return $this->error('Failed to disable 2FA: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Verify 2FA code.
   */
  public function verifyTwoFactor(Request $request)
  {
    try {
      $request->validate([
        'code' => 'required|string|size:6',
      ]);

      $isValid = $this->authService->verifyTwoFactorCode(
        $request->user(),
        $request->code
      );

      if (!$isValid) {
        return $this->error('Invalid 2FA code', 400);
      }

      return $this->success(null, '2FA verified successfully');
    } catch (ValidationException $e) {
      return $this->validationError($e);
    } catch (\Exception $e) {
      return $this->error('Failed to verify 2FA: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Generate recovery codes.
   */
  public function generateRecoveryCodes(Request $request)
  {
    try {
      $recoveryCodes = $this->authService->generateRecoveryCodes();

      return $this->success([
        'recovery_codes' => $recoveryCodes,
      ], 'Recovery codes generated successfully');
    } catch (\Exception $e) {
      return $this->error('Failed to generate recovery codes: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Verify recovery code.
   */
  public function verifyRecoveryCode(Request $request)
  {
    try {
      $request->validate([
        'recovery_code' => 'required|string',
      ]);

      $isValid = $this->authService->validateRecoveryCode(
        $request->user(),
        $request->recovery_code
      );

      if (!$isValid) {
        return $this->error('Invalid recovery code', 400);
      }

      return $this->success(null, 'Recovery code verified successfully');
    } catch (ValidationException $e) {
      return $this->validationError($e);
    } catch (\Exception $e) {
      return $this->error('Failed to verify recovery code: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Get 2FA status.
   */
  public function getTwoFactorStatus(Request $request)
  {
    try {
      $status = $this->authService->getTwoFactorStatus($request->user());

      return $this->success($status, '2FA status retrieved');
    } catch (\Exception $e) {
      return $this->error('Failed to get 2FA status: ' . $e->getMessage(), 500);
    }
  }
}
