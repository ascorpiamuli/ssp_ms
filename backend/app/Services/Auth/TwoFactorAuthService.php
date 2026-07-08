<?php

namespace App\Services\Auth;

use App\Services\BaseService;
use App\Models\TwoFactorAuthentication;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TwoFactorAuthService extends BaseService
{
  /**
   * Enable 2FA for a user.
   */
  public function enable(User $user, string $secretKey): void
  {
    $twoFactor = TwoFactorAuthentication::updateOrCreate(
      ['user_id' => $user->id],
      [
        'secret_key' => $secretKey,
        'is_enabled' => true,
        'confirmed_at' => now(),
      ]
    );
  }

  /**
   * Disable 2FA for a user.
   */
  public function disable(User $user): void
  {
    $twoFactor = $user->twoFactorAuth;
    if ($twoFactor) {
      $twoFactor->update([
        'is_enabled' => false,
        'secret_key' => null,
        'recovery_codes' => null,
      ]);
    }
  }

  /**
   * Verify 2FA code.
   */
  public function verifyCode(User $user, string $code): bool
  {
    $twoFactor = $user->twoFactorAuth;
    if (!$twoFactor || !$twoFactor->is_enabled) {
      return false;
    }

    // This is a placeholder - actual verification will use a 2FA library
    // e.g., Google2FA or OTPHP
    return true;
  }

  /**
   * Generate recovery codes.
   */
  public function generateRecoveryCodes(): array
  {
    $codes = [];
    for ($i = 0; $i < 8; $i++) {
      $codes[] = strtoupper(substr(md5(uniqid()), 0, 8));
    }
    return $codes;
  }

  /**
   * Save recovery codes for user.
   */
  public function saveRecoveryCodes(User $user, array $codes): void
  {
    $twoFactor = $user->twoFactorAuth;
    if ($twoFactor) {
      $twoFactor->update([
        'recovery_codes' => array_map(function ($code) {
          return bcrypt($code);
        }, $codes),
      ]);
    }
  }

  /**
   * Validate recovery code.
   */
  public function validateRecoveryCode(User $user, string $code): bool
  {
    $twoFactor = $user->twoFactorAuth;
    if (!$twoFactor || !$twoFactor->recovery_codes) {
      return false;
    }

    foreach ($twoFactor->recovery_codes as $hashedCode) {
      if (Hash::check($code, $hashedCode)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user has 2FA enabled.
   */
  public function isEnabled(User $user): bool
  {
    $twoFactor = $user->twoFactorAuth;
    return $twoFactor && $twoFactor->is_enabled;
  }

  /**
   * Get 2FA status.
   */
  public function getStatus(User $user): array
  {
    $twoFactor = $user->twoFactorAuth;

    return [
      'enabled' => $twoFactor && $twoFactor->is_enabled,
      'confirmed_at' => $twoFactor?->confirmed_at,
      'has_recovery_codes' => $twoFactor && !empty($twoFactor->recovery_codes),
    ];
  }
}
