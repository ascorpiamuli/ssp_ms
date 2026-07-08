<?php

namespace App\Services\Auth;

use App\Services\BaseService;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class RegistrationService extends BaseService
{
  /**
   * Register a new user.
   */
  public function register(array $data): array
  {
    return $this->transaction(function () use ($data) {
      // Create user
      $user = User::create([
        'first_name' => $data['first_name'],
        'last_name' => $data['last_name'],
        'email' => $data['email'],
        'phone' => $data['phone'],
        'password' => Hash::make($data['password']),
        'timezone' => $data['timezone'] ?? 'Africa/Nairobi',
        'is_active' => true,
        'is_approved' => false, // Requires admin approval
      ]);

      // Assign role
      $user->assignRole($data['role']);

      // Create user profile
      UserProfile::create([
        'user_id' => $user->id,
        'country' => 'Kenya',
      ]);

      // Log activity
      $this->logRegistration($user, $data);

      return [
        'user' => $user,
        'requires_approval' => true,
      ];
    });
  }

  /**
   * Log registration activity.
   */
  protected function logRegistration(User $user, array $data): void
  {
    UserActivityLog::create([
      'user_id' => $user->id,
      'action' => 'REGISTER',
      'module' => 'AUTH',
      'description' => 'User registered with role: ' . $data['role'],
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }

  /**
   * Create supplier specific data if role is SUPPLIER.
   */
  protected function createSupplierData(User $user, array $data): void
  {
    if ($data['role'] === 'SUPPLIER') {
      // Supplier data will be created when Supplier model is built
      // This is a placeholder for future implementation
    }
  }

  /**
   * Validate registration data.
   */
  public function validateRegistrationData(array $data): array
  {
    $rules = [
      'first_name' => 'required|string|max:255',
      'last_name' => 'required|string|max:255',
      'email' => 'required|string|email|max:255|unique:users',
      'phone' => 'required|string|max:20',
      'password' => 'required|string|min:8|confirmed',
      'role' => 'required|string|in:STAFF,HOD,ACCOUNTANT,PRINCIPAL,FINAL_APPROVER,PROCUREMENT,SUPPLIER,AUDITOR',
      'timezone' => 'nullable|string|timezone',
    ];

    // Supplier specific validation
    if ($data['role'] === 'SUPPLIER') {
      $rules['company_name'] = 'required|string|max:255';
      $rules['company_email'] = 'required|email|max:255';
      $rules['company_registration'] = 'required|string|max:255';
      $rules['company_address'] = 'required|string|max:500';
      $rules['supplier_category'] = 'required|string|in:goods,services,both';
    }

    return $rules;
  }
}
