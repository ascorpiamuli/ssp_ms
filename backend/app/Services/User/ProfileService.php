<?php

namespace App\Services\User;

use App\Services\BaseService;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserActivityLog;
use Illuminate\Support\Facades\Storage;

class ProfileService extends BaseService
{
  /**
   * Get user profile.
   */
  public function getProfile(int $userId): ?UserProfile
  {
    return UserProfile::where('user_id', $userId)->first();
  }

  /**
   * Get user with profile.
   */
  public function getUserWithProfile(int $userId): ?User
  {
    return User::with(['department', 'profile', 'roles'])->find($userId);
  }

  /**
   * Update user profile.
   */
  public function updateProfile(int $userId, array $data): UserProfile
  {
    $profile = UserProfile::updateOrCreate(
      ['user_id' => $userId],
      [
        'gender' => $data['gender'] ?? null,
        'address' => $data['address'] ?? null,
        'city' => $data['city'] ?? null,
        'state' => $data['state'] ?? null,
        'postal_code' => $data['postal_code'] ?? null,
        'country' => $data['country'] ?? 'Kenya',
        'bio' => $data['bio'] ?? null,
        'preferences' => $data['preferences'] ?? null,
        'social_links' => $data['social_links'] ?? null,
      ]
    );

    // Log activity
    $this->logActivity($userId, 'PROFILE_UPDATED', 'User profile updated');

    return $profile;
  }

  /**
   * Upload profile photo.
   */
  public function uploadPhoto(int $userId, $file): string
  {
    $path = $file->store('profile-photos', 'public');

    // Update user's profile photo
    $user = User::find($userId);
    if ($user) {
      // Delete old photo
      if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
        Storage::disk('public')->delete($user->profile_photo);
      }
      $user->update(['profile_photo' => $path]);

      // Log activity
      $this->logActivity($userId, 'PHOTO_UPLOADED', 'Profile photo uploaded');
    }

    return $path;
  }

  /**
   * Delete profile photo.
   */
  public function deletePhoto(int $userId): void
  {
    $user = User::find($userId);
    if ($user && $user->profile_photo) {
      if (Storage::disk('public')->exists($user->profile_photo)) {
        Storage::disk('public')->delete($user->profile_photo);
      }
      $user->update(['profile_photo' => null]);

      // Log activity
      $this->logActivity($userId, 'PHOTO_DELETED', 'Profile photo deleted');
    }
  }

  /**
   * Update user and profile together.
   */
  public function updateUserAndProfile(int $userId, array $data): User
  {
    $user = User::findOrFail($userId);

    // Update user basic info
    $user->update([
      'first_name' => $data['first_name'] ?? $user->first_name,
      'last_name' => $data['last_name'] ?? $user->last_name,
      'phone' => $data['phone'] ?? $user->phone,
      'id_number' => $data['id_number'] ?? $user->id_number,
      'date_of_birth' => $data['date_of_birth'] ?? $user->date_of_birth,
    ]);

    // Update profile if profile data exists
    if (isset($data['profile'])) {
      $this->updateProfile($userId, $data['profile']);
    }

    // Log activity
    $this->logActivity($userId, 'PROFILE_UPDATED', 'User and profile updated');

    return $user->fresh(['department', 'profile', 'roles']);
  }

  /**
   * Get profile completion status.
   */
  public function getProfileCompletion(int $userId): array
  {
    $user = User::with('profile')->find($userId);
    $profile = $user->profile;

    $fields = [
      'first_name' => !empty($user->first_name),
      'last_name' => !empty($user->last_name),
      'email' => !empty($user->email),
      'phone' => !empty($user->phone),
      'id_number' => !empty($user->id_number),
      'date_of_birth' => !empty($user->date_of_birth),
      'gender' => $profile && !empty($profile->gender),
      'address' => $profile && !empty($profile->address),
      'city' => $profile && !empty($profile->city),
      'country' => $profile && !empty($profile->country),
      'bio' => $profile && !empty($profile->bio),
    ];

    $completed = array_filter($fields);
    $total = count($fields);
    $percentage = round(($total > 0) ? (count($completed) / $total) * 100 : 0);

    return [
      'percentage' => $percentage,
      'completed_fields' => array_keys($completed),
      'missing_fields' => array_keys(array_diff($fields, $completed)),
      'is_complete' => $percentage >= 80,
    ];
  }

  /**
   * Get all user profiles (admin only).
   */
  public function getAllProfiles(array $filters = [])
  {
    $query = User::with(['department', 'profile', 'roles']);

    if (isset($filters['search'])) {
      $query->where(function ($q) use ($filters) {
        $q->where('first_name', 'LIKE', "%{$filters['search']}%")
          ->orWhere('last_name', 'LIKE', "%{$filters['search']}%")
          ->orWhere('email', 'LIKE', "%{$filters['search']}%");
      });
    }

    if (isset($filters['department_id'])) {
      $query->where('department_id', $filters['department_id']);
    }

    return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 20);
  }

  /**
   * Log activity.
   */
  protected function logActivity(int $userId, string $action, string $description): void
  {
    UserActivityLog::create([
      'user_id' => $userId,
      'action' => $action,
      'module' => 'PROFILE',
      'description' => $description,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
