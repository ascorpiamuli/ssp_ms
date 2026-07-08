<?php

namespace App\Services\Auth;

use App\Services\BaseService;
use App\Models\User;
use App\Models\PasswordResetHistory;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;

class PasswordResetService extends BaseService
{
  /**
   * Send password reset link.
   */
  public function sendResetLink(string $email, string $ip, string $userAgent): array
  {
    $status = Password::sendResetLink(['email' => $email]);

    // Log reset request
    $user = User::where('email', $email)->first();
    if ($user) {
      PasswordResetHistory::create([
        'user_id' => $user->id,
        'ip_address' => $ip,
        'user_agent' => $userAgent,
        'requested_at' => now(),
        'is_successful' => $status === Password::RESET_LINK_SENT,
      ]);
    }

    if ($status === Password::RESET_LINK_SENT) {
      return [
        'success' => true,
        'message' => 'Password reset link sent to your email',
      ];
    }

    return [
      'success' => false,
      'message' => 'Unable to send reset link',
    ];
  }

  /**
   * Reset password.
   */
  public function resetPassword(array $credentials): array
  {
    $status = Password::reset(
      $credentials,
      function ($user, $password) {
        $user->forceFill([
          'password' => bcrypt($password),
        ])->save();

        // Update reset history
        $this->updateResetHistory($user);
      }
    );

    if ($status === Password::PASSWORD_RESET) {
      return [
        'success' => true,
        'message' => 'Password reset successfully',
      ];
    }

    return [
      'success' => false,
      'message' => 'Invalid or expired reset token',
    ];
  }

  /**
   * Validate reset token.
   */
  public function validateToken(string $email, string $token): array
  {
    $tokenData = DB::table('password_reset_tokens')
      ->where('email', $email)
      ->where('token', $token)
      ->first();

    if (!$tokenData) {
      return [
        'success' => false,
        'message' => 'Invalid or expired reset token',
      ];
    }

    // Check if token is expired (60 minutes)
    if (now()->diffInMinutes($tokenData->created_at) > 60) {
      return [
        'success' => false,
        'message' => 'Reset token has expired',
      ];
    }

    return [
      'success' => true,
      'message' => 'Token is valid',
    ];
  }

  /**
   * Update password reset history.
   */
  protected function updateResetHistory(User $user): void
  {
    PasswordResetHistory::where('user_id', $user->id)
      ->whereNull('completed_at')
      ->latest()
      ->first()
      ?->update([
        'completed_at' => now(),
        'is_successful' => true,
      ]);
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
