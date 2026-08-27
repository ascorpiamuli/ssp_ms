<?php

namespace App\Services\Auth;

use App\Services\BaseService;
use App\Models\User;
use App\Models\UserSession;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LoginService extends BaseService
{
  /**
   * Attempt to login a user.
   */
  public function login(array $credentials): array
  {
    $user = User::where('email', $credentials['email'])->first();

    if (!$user || !Hash::check($credentials['password'], $user->password)) {
      return [
        'success' => false,
        'message' => 'Invalid credentials',
      ];
    }

    // Check if user is active
    if (!$user->is_active) {
      return [
        'success' => false,
        'message' => 'Your account has been deactivated. Please contact administrator.',
      ];
    }

    // Check if user is approved
    if (!$user->is_approved) {
      return [
        'success' => false,
        'message' => 'Your account is pending admin approval. Please wait for confirmation.',
      ];
    }

    // Create token
    $token = $user->createToken('auth_token')->plainTextToken;

    // Update last login
    $user->update([
      'last_login_at' => now(),
    ]);

    // Create session
    $this->createSession($user);


    return [
      'success' => true,
      'message' => 'Login successful',
      'data' => [
        'user' => $user->load(['department', 'roles']),
        'permissions' => $user->getAllPermissions()->pluck('name'),
        'token' => $token,
        'token_type' => 'Bearer',
      ],
    ];
  }

  /**
   * Logout a user.
   */
  public function logout(User $user, string $ip, string $userAgent): void
  {
    // Deactivate session
    UserSession::where('user_id', $user->id)
      ->where('is_active', true)
      ->update(['is_active' => false]);

    // Delete current token
    $user->currentAccessToken()->delete();
  }

  /**
   * Create user session.
   */
  protected function createSession(User $user): void
  {
    UserSession::create([
      'user_id' => $user->id,
      'session_id' => Str::random(40),
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
      'last_activity' => now(),
      'is_active' => true,
    ]);
  }



  /**
   * Check if user can login.
   */
  public function canLogin(User $user): bool
  {
    return $user->is_active && $user->is_approved;
  }

  /**
   * Validate login credentials.
   */
  public function validateCredentials(array $credentials): array
  {
    return [
      'email' => 'required|email',
      'password' => 'required|string',
    ];
  }
}
