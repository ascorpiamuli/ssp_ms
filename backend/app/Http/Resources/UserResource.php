<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   */
  public function toArray($request): array
  {
    return [
      'id' => $this->id,
      'first_name' => $this->first_name,
      'last_name' => $this->last_name,
      'full_name' => $this->full_name ?? $this->first_name . ' ' . $this->last_name,
      'initials' => $this->initials ?? strtoupper(substr($this->first_name, 0, 1) . substr($this->last_name, 0, 1)),
      'email' => $this->email,
      'phone' => $this->phone,
      'id_number' => $this->id_number,
      'date_of_birth' => $this->date_of_birth,
      'profile_photo' => $this->profile_photo,
      'avatar_url' => $this->avatar_url,
      'role' => $this->role,
      'department_id' => $this->department_id,
      'department' => $this->department ? [
        'id' => $this->department->id,
        'name' => $this->department->name,
        'code' => $this->department->code,
        'description' => $this->department->description,
      ] : null,
      'profile' => $this->profile ? [
        'id' => $this->profile->id,
        'gender' => $this->profile->gender,
        'address' => $this->profile->address,
        'city' => $this->profile->city,
        'state' => $this->profile->state,
        'postal_code' => $this->profile->postal_code,
        'country' => $this->profile->country,
        'bio' => $this->profile->bio,
        'preferences' => $this->profile->preferences,
        'social_links' => $this->profile->social_links,
      ] : null,
      'is_active' => (bool) $this->is_active,
      'is_approved' => (bool) $this->is_approved,
      'approved_at' => $this->approved_at,
      'approved_by' => $this->approved_by,
      'rejection_reason' => $this->rejection_reason,
      'last_login_at' => $this->last_login_at,
      'timezone' => $this->timezone,
      'roles' => $this->roles ? $this->roles->pluck('name') : [],
      'permissions' => $this->getUserPermissions(),
      'role_details' => $this->getRoleDetails(),
      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,
    ];
  }

  /**
   * Get all permissions for the user (direct + via roles).
   */
  protected function getUserPermissions(): array
  {
    try {
      // Get permissions from Spatie
      $permissions = $this->getAllPermissions();

      // Convert to array of permission names
      return $permissions->pluck('name')->toArray();
    } catch (\Exception $e) {
      // If permissions are not loaded, return empty array
      return [];
    }
  }

  /**
   * Get detailed role information.
   */
  protected function getRoleDetails(): array
  {
    $roleDetails = [];

    try {
      // Check if roles relationship is loaded
      if ($this->relationLoaded('roles') && $this->roles) {
        foreach ($this->roles as $role) {
          // Check if permissions are loaded for this role
          $permissions = [];
          if ($role->relationLoaded('permissions') && $role->permissions) {
            $permissions = $role->permissions->pluck('name')->toArray();
          }

          $roleDetails[] = [
            'id' => $role->id,
            'name' => $role->name,
            'guard_name' => $role->guard_name,
            'permissions' => $permissions,
            'permission_count' => count($permissions),
            'created_at' => $role->created_at,
          ];
        }
      }
    } catch (\Exception $e) {
      // If roles are not loaded, return empty
    }

    return $roleDetails;
  }
}
  