<?php

namespace App\Services\User;

use App\Services\BaseService;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserActivityLog;
use App\Models\Upload;
use App\Services\UploadService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;

class ProfileService extends BaseService
{
  protected UploadService $uploadService;

  public function __construct(UploadService $uploadService)
  {
    $this->uploadService = $uploadService;
  }

  /**
   * Get user profile.
   */
  public function getProfile(int $userId): ?UserProfile
  {
    return UserProfile::where('user_id', $userId)->first();
  }

  /**
   * Get user with profile and role information.
   */
  public function getUserWithProfile(int $userId): ?array
  {
    $user = User::with(['department', 'profile', 'roles', 'roles.permissions'])->find($userId);

    if (!$user) {
      return null;
    }

    // Get primary role with label
    $primaryRole = $user->roles()->first();

    return [
      'user' => $user,
      'role_info' => $primaryRole ? [
        'id' => $primaryRole->id,
        'name' => $primaryRole->name,
        'label' => $primaryRole->label ?? $this->formatRoleName($primaryRole->name),
        'description' => $primaryRole->description,
        'guard_name' => $primaryRole->guard_name,
        'permissions' => $primaryRole->permissions->pluck('name')->toArray(),
      ] : null,
      'all_roles' => $user->roles->map(function ($role) {
        return [
          'id' => $role->id,
          'name' => $role->name,
          'label' => $role->label ?? $this->formatRoleName($role->name),
          'description' => $role->description,
        ];
      }),
      'role_names' => $user->getRoleNames()->toArray(),
      'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
    ];
  }

  /**
   * Get user with profile (legacy method - returns User model).
   */
  public function getUserWithProfileModel(int $userId): ?User
  {
    return User::with(['department', 'profile', 'roles'])->find($userId);
  }

  /**
   * Format role name to human-readable label.
   */
  protected function formatRoleName(string $name): string
  {
    return ucfirst(str_replace('_', ' ', $name));
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
   * Upload profile photo using UploadService.
   */
  public function uploadPhoto(int $userId, UploadedFile $file): string
  {
    // Get the user
    $user = User::findOrFail($userId);

    // Delete old photo if exists
    if ($user->profile_photo_upload_id) {
      $oldUpload = Upload::find($user->profile_photo_upload_id);
      if ($oldUpload) {
        try {
          $this->uploadService->delete($oldUpload);
          \Log::info('[ProfileService] Deleted old profile photo upload', [
            'upload_id' => $oldUpload->id,
            'user_id' => $userId,
          ]);
        } catch (\Exception $e) {
          \Log::warning('[ProfileService] Failed to delete old profile photo: ' . $e->getMessage());
        }
      }
    }

    // Also check and delete old file if it exists (legacy)
    if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
      Storage::disk('public')->delete($user->profile_photo);
      \Log::info('[ProfileService] Deleted old profile photo file', [
        'path' => $user->profile_photo,
        'user_id' => $userId,
      ]);
    }

    // Upload new photo using UploadService
    try {
      $upload = $this->uploadService->upload(
        $file,                          // File
        $user,                          // Uploadable model
        'avatar',                       // Collection
        $user->full_name . ' Avatar',   // Title
        'Profile photo for ' . $user->full_name, // Description
        [                               // Metadata
          'uploaded_from' => 'profile_upload',
          'user_id' => $userId,
          'user_email' => $user->email,
        ]
      );

      // Update user with new photo
      $user->update([
        'profile_photo' => $upload->file_url,
        'profile_photo_upload_id' => $upload->id,
        'avatar' => $upload->file_url,
      ]);

      \Log::info('[ProfileService] Profile photo uploaded successfully', [
        'user_id' => $userId,
        'upload_id' => $upload->id,
        'file_url' => $upload->file_url,
      ]);

      // Log activity
      $this->logActivity($userId, 'PHOTO_UPLOADED', 'Profile photo uploaded');

      return $upload->file_url;
    } catch (\Exception $e) {
      \Log::error('[ProfileService] Failed to upload profile photo: ' . $e->getMessage());
      throw new \Exception('Failed to upload profile photo: ' . $e->getMessage());
    }
  }

  /**
   * Delete profile photo.
   */
  public function deletePhoto(int $userId): void
  {
    $user = User::find($userId);
    if (!$user) {
      return;
    }

    // Delete upload record
    if ($user->profile_photo_upload_id) {
      $upload = Upload::find($user->profile_photo_upload_id);
      if ($upload) {
        try {
          $this->uploadService->delete($upload);
          \Log::info('[ProfileService] Deleted profile photo upload', [
            'upload_id' => $upload->id,
            'user_id' => $userId,
          ]);
        } catch (\Exception $e) {
          \Log::warning('[ProfileService] Failed to delete profile photo upload: ' . $e->getMessage());
        }
      }
    }

    // Delete file if exists (legacy)
    if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
      Storage::disk('public')->delete($user->profile_photo);
      \Log::info('[ProfileService] Deleted profile photo file', [
        'path' => $user->profile_photo,
        'user_id' => $userId,
      ]);
    }

    // Update user
    $user->update([
      'profile_photo' => null,
      'profile_photo_upload_id' => null,
      'avatar' => null,
    ]);

    // Log activity
    $this->logActivity($userId, 'PHOTO_DELETED', 'Profile photo deleted');
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

    // Update role if provided (by name or label)
    if (isset($data['role'])) {
      $role = $this->findRole($data['role']);
      if ($role) {
        $user->syncRoles([$role]);
      }
    }

    // Update multiple roles if provided
    if (isset($data['roles']) && is_array($data['roles'])) {
      $roles = [];
      foreach ($data['roles'] as $roleName) {
        $role = $this->findRole($roleName);
        if ($role) {
          $roles[] = $role;
        }
      }
      if (!empty($roles)) {
        $user->syncRoles($roles);
      }
    }

    // Log activity
    $this->logActivity($userId, 'PROFILE_UPDATED', 'User and profile updated');

    return $user->fresh(['department', 'profile', 'roles']);
  }

  /**
   * Find role by name or label.
   */
  protected function findRole(string $roleNameOrLabel): ?Role
  {
    return Role::where('name', $roleNameOrLabel)
      ->orWhere('label', $roleNameOrLabel)
      ->first();
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
   * Get all user profiles with role information (admin only).
   */
  public function getAllProfiles(array $filters = [])
  {
    $query = User::with(['department', 'profile', 'roles', 'roles.permissions']);

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

    // Filter by role (by name or label)
    if (isset($filters['role']) && $filters['role'] !== 'all') {
      $role = $this->findRole($filters['role']);
      if ($role) {
        $query->whereHas('roles', function ($q) use ($role) {
          $q->where('id', $role->id);
        });
      }
    }

    $users = $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 20);

    // Transform to include role labels
    $users->getCollection()->transform(function ($user) {
      $primaryRole = $user->roles()->first();
      $user->role_label = $primaryRole ? ($primaryRole->label ?? $this->formatRoleName($primaryRole->name)) : null;
      $user->role_description = $primaryRole ? $primaryRole->description : null;
      return $user;
    });

    return $users;
  }

  /**
   * Get profile with complete user information including roles and permissions.
   */
  public function getCompleteProfile(int $userId): ?array
  {
    $user = User::with([
      'department',
      'profile',
      'roles',
      'roles.permissions',
      'permissions',
      'avatarUpload'
    ])->find($userId);

    if (!$user) {
      return null;
    }

    $primaryRole = $user->roles()->first();

    return [
      'id' => $user->id,
      'first_name' => $user->first_name,
      'last_name' => $user->last_name,
      'full_name' => $user->full_name,
      'email' => $user->email,
      'phone' => $user->phone,
      'id_number' => $user->id_number,
      'date_of_birth' => $user->date_of_birth,
      'is_active' => $user->is_active,
      'is_approved' => $user->is_approved,
      'approved_at' => $user->approved_at,
      'last_login_at' => $user->last_login_at,
      'timezone' => $user->timezone,
      'avatar' => $user->avatar,
      'profile_photo' => $user->profile_photo,
      'department' => $user->department ? [
        'id' => $user->department->id,
        'name' => $user->department->name,
      ] : null,
      'profile' => $user->profile ? [
        'gender' => $user->profile->gender,
        'address' => $user->profile->address,
        'city' => $user->profile->city,
        'state' => $user->profile->state,
        'postal_code' => $user->profile->postal_code,
        'country' => $user->profile->country,
        'bio' => $user->profile->bio,
        'preferences' => $user->profile->preferences,
        'social_links' => $user->profile->social_links,
      ] : null,
      'role' => $primaryRole ? [
        'id' => $primaryRole->id,
        'name' => $primaryRole->name,
        'label' => $primaryRole->label ?? $this->formatRoleName($primaryRole->name),
        'description' => $primaryRole->description,
        'permissions' => $primaryRole->permissions->pluck('name')->toArray(),
      ] : null,
      'all_roles' => $user->roles->map(function ($role) {
        return [
          'id' => $role->id,
          'name' => $role->name,
          'label' => $role->label ?? $this->formatRoleName($role->name),
          'description' => $role->description,
        ];
      }),
      'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
      'created_at' => $user->created_at,
      'updated_at' => $user->updated_at,
    ];
  }

  /**
   * Update user's role by name or label.
   */
  public function updateUserRole(int $userId, string $roleNameOrLabel): User
  {
    $user = User::findOrFail($userId);
    $role = $this->findRole($roleNameOrLabel);

    if (!$role) {
      throw new \Exception('Role not found: ' . $roleNameOrLabel);
    }

    $oldRole = $user->roles()->first();
    $oldRoleName = $oldRole ? ($oldRole->label ?? $oldRole->name) : 'None';

    $user->syncRoles([$role]);

    $this->logActivity($userId, 'ROLE_UPDATED', 'User role updated from "' . $oldRoleName . '" to "' . ($role->label ?? $role->name) . '"');

    return $user->fresh(['roles']);
  }

  /**
   * Get user's role with label and description.
   */
  public function getUserRole(int $userId): ?array
  {
    $user = User::find($userId);
    if (!$user) {
      return null;
    }

    $role = $user->roles()->first();
    if (!$role) {
      return [
        'has_role' => false,
        'role' => null,
        'role_names' => [],
      ];
    }

    return [
      'has_role' => true,
      'role' => [
        'id' => $role->id,
        'name' => $role->name,
        'label' => $role->label ?? $this->formatRoleName($role->name),
        'description' => $role->description,
        'permissions' => $role->permissions->pluck('name')->toArray(),
      ],
      'role_names' => $user->getRoleNames()->toArray(),
      'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
    ];
  }

  /**
   * Log activity.
   */
  protected function logActivity(int $userId, string $action, string $description): void
  {
    try {
      UserActivityLog::create([
        'user_id' => $userId,
        'action' => $action,
        'module' => 'PROFILE',
        'description' => $description,
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);
    } catch (\Exception $e) {
      \Log::warning('[ProfileService] Failed to log activity: ' . $e->getMessage());
    }
  }
}
