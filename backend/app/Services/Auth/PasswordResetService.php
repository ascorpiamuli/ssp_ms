<?php

namespace App\Services\Auth;

use App\Services\BaseService;
use App\Models\User;
use App\Models\PasswordResetHistory;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PasswordResetService extends BaseService
{
  /**
   * Send password reset link.
   */
  public function sendResetLink(string $email, string $ip, string $userAgent): array
  {
    \Log::info('PasswordResetService::sendResetLink - Starting', [
      'email' => $email,
      'ip' => $ip,
      'userAgent' => $userAgent
    ]);

    try {
      $status = Password::sendResetLink(['email' => $email]);

      \Log::info('PasswordResetService::sendResetLink - Password::sendResetLink result', [
        'email' => $email,
        'status' => $status,
        'status_constant' => $status
      ]);

      // Log reset request
      $user = User::where('email', $email)->first();
      if ($user) {
        \Log::info('PasswordResetService::sendResetLink - User found', [
          'user_id' => $user->id,
          'email' => $user->email
        ]);

        try {
          PasswordResetHistory::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'requested_at' => now(),
            'is_successful' => $status === Password::RESET_LINK_SENT,
          ]);

          \Log::info('PasswordResetService::sendResetLink - History created successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
            'is_successful' => $status === Password::RESET_LINK_SENT
          ]);
        } catch (\Exception $e) {
          \Log::error('PasswordResetService::sendResetLink - Failed to create history', [
            'user_id' => $user->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
          ]);
        }
      } else {
        \Log::warning('PasswordResetService::sendResetLink - User not found', [
          'email' => $email
        ]);
      }

      if ($status === Password::RESET_LINK_SENT) {
        \Log::info('PasswordResetService::sendResetLink - Success', [
          'email' => $email,
          'message' => 'Password reset link sent to your email'
        ]);

        return [
          'success' => true,
          'message' => 'Password reset link sent to your email',
        ];
      }

      // Get the actual error message
      $errorMessage = $this->getResetError($status);

      \Log::warning('PasswordResetService::sendResetLink - Failed', [
        'email' => $email,
        'status' => $status,
        'error_message' => $errorMessage
      ]);

      return [
        'success' => false,
        'message' => $errorMessage,
      ];
    } catch (\Exception $e) {
      \Log::error('PasswordResetService::sendResetLink - Exception', [
        'email' => $email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return [
        'success' => false,
        'message' => 'An error occurred: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * Get the error message for a password reset status.
   */
  protected function getResetError($status): string
  {
    $messages = [
      Password::INVALID_USER => 'We could not find a user with that email address.',
      Password::INVALID_TOKEN => 'Invalid reset token.',
      Password::RESET_THROTTLED => 'Please wait before requesting another reset link.',
      Password::RESET_LINK_SENT => 'Password reset link sent to your email.',
    ];

    \Log::info('PasswordResetService::getResetError', [
      'status' => $status,
      'message' => $messages[$status] ?? 'Unable to send reset link. Please try again.'
    ]);

    return $messages[$status] ?? 'Unable to send reset link. Please try again.';
  }

  /**
   * Reset password.
   */
  public function resetPassword(array $credentials): array
  {
    \Log::info('PasswordResetService::resetPassword - Starting', [
      'email' => $credentials['email'] ?? null
    ]);

    try {
      // Validate the token first
      $tokenData = DB::table('password_reset_tokens')
        ->where('email', $credentials['email'])
        ->first();

      if (!$tokenData) {
        \Log::warning('PasswordResetService::resetPassword - No token found', [
          'email' => $credentials['email'] ?? null
        ]);
        return [
          'success' => false,
          'message' => 'No reset token found for this email address.'
        ];
      }

      // Validate the token using Hash::check
      if (!Hash::check($credentials['token'], $tokenData->token)) {
        \Log::warning('PasswordResetService::resetPassword - Token mismatch', [
          'email' => $credentials['email'] ?? null
        ]);
        return [
          'success' => false,
          'message' => 'Invalid reset token.'
        ];
      }

      // Check if token is expired (60 minutes)
      $createdAt = Carbon::parse($tokenData->created_at);
      $expiresAt = $createdAt->copy()->addMinutes(60);

      if (now()->greaterThan($expiresAt)) {
        \Log::warning('PasswordResetService::resetPassword - Token expired', [
          'email' => $credentials['email'] ?? null,
          'created_at' => $createdAt->toDateTimeString(),
          'expires_at' => $expiresAt->toDateTimeString(),
          'now' => now()->toDateTimeString()
        ]);

        // Delete expired token
        DB::table('password_reset_tokens')->where('email', $credentials['email'])->delete();

        return [
          'success' => false,
          'message' => 'Reset token has expired. Please request a new one.'
        ];
      }

      // Find the user
      $user = User::where('email', $credentials['email'])->first();

      if (!$user) {
        \Log::warning('PasswordResetService::resetPassword - User not found', [
          'email' => $credentials['email'] ?? null
        ]);
        return [
          'success' => false,
          'message' => 'User not found.'
        ];
      }

      // Update the password
      $user->forceFill([
        'password' => bcrypt($credentials['password']),
      ])->save();

      // Delete the token
      DB::table('password_reset_tokens')->where('email', $credentials['email'])->delete();

      // Update reset history
      $this->updateResetHistory($user);

      \Log::info('PasswordResetService::resetPassword - Success', [
        'email' => $credentials['email'] ?? null,
        'user_id' => $user->id
      ]);

      return [
        'success' => true,
        'message' => 'Password reset successfully',
      ];
    } catch (\Exception $e) {
      \Log::error('PasswordResetService::resetPassword - Exception', [
        'email' => $credentials['email'] ?? null,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return [
        'success' => false,
        'message' => 'Failed to reset password: ' . $e->getMessage()
      ];
    }
  }

  /**
   * Validate reset token.
   */
  public function validateToken(string $email, string $token): array
  {
    \Log::info('PasswordResetService::validateToken - Starting', [
      'email' => $email,
      'token_length' => strlen($token)
    ]);

    try {
      // Check if the token exists in the password_reset_tokens table
      $tokenData = DB::table('password_reset_tokens')
        ->where('email', $email)
        ->first();

      if (!$tokenData) {
        \Log::warning('PasswordResetService::validateToken - No token found', [
          'email' => $email
        ]);
        return [
          'success' => false,
          'message' => 'No reset token found for this email address.'
        ];
      }

      \Log::info('PasswordResetService::validateToken - Token found', [
        'email' => $email,
        'db_token' => substr($tokenData->token, 0, 20) . '...',
        'provided_token' => substr($token, 0, 20) . '...'
      ]);

      // Use Hash::check() to validate the token (Laravel stores hashed tokens)
      $isValid = Hash::check($token, $tokenData->token);

      \Log::info('PasswordResetService::validateToken - Validation result', [
        'email' => $email,
        'is_valid' => $isValid
      ]);

      if (!$isValid) {
        \Log::warning('PasswordResetService::validateToken - Token mismatch', [
          'email' => $email
        ]);
        return [
          'success' => false,
          'message' => 'Invalid reset token.'
        ];
      }

      // Check if token is expired (60 minutes)
      $createdAt = Carbon::parse($tokenData->created_at);
      $expiresAt = $createdAt->copy()->addMinutes(60);

      if (now()->greaterThan($expiresAt)) {
        \Log::warning('PasswordResetService::validateToken - Token expired', [
          'email' => $email,
          'created_at' => $createdAt->toDateTimeString(),
          'expires_at' => $expiresAt->toDateTimeString(),
          'now' => now()->toDateTimeString()
        ]);

        // Delete expired token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return [
          'success' => false,
          'message' => 'Reset token has expired. Please request a new one.'
        ];
      }

      \Log::info('PasswordResetService::validateToken - Token valid', [
        'email' => $email
      ]);

      return [
        'success' => true,
        'message' => 'Token is valid.',
        'data' => [
          'email' => $email,
          'created_at' => $createdAt->toDateTimeString(),
          'expires_at' => $expiresAt->toDateTimeString()
        ]
      ];
    } catch (\Exception $e) {
      \Log::error('PasswordResetService::validateToken - Exception', [
        'email' => $email,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return [
        'success' => false,
        'message' => 'Failed to validate token: ' . $e->getMessage()
      ];
    }
  }

  /**
   * Update password reset history.
   */
  protected function updateResetHistory(User $user): void
  {
    try {
      PasswordResetHistory::where('user_id', $user->id)
        ->whereNull('completed_at')
        ->latest()
        ->first()
        ?->update([
          'completed_at' => now(),
          'is_successful' => true,
        ]);

      \Log::info('PasswordResetService::updateResetHistory - Updated', [
        'user_id' => $user->id,
        'email' => $user->email
      ]);
    } catch (\Exception $e) {
      \Log::error('PasswordResetService::updateResetHistory - Failed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $e->getMessage()
      ]);
    }
  }

  /**
   * Validate reset password request.
   */
  public function validateResetRequest(array $data): array
  {
    return [
      'token' => 'required|string',
      'email' => 'required|email|exists:users',
      'password' => 'required|string|min:8|confirmed',
    ];
  }

  /**
   * Validate forgot password request.
   */
  public function validateForgotRequest(array $data): array
  {
    return [
      'email' => 'required|email|exists:users,email',
    ];
  }
}
