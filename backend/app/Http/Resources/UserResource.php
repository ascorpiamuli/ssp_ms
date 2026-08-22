<?php

namespace App\Http\Resources;

use App\Models\Department;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class UserResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   */
  public function toArray($request): array
  {
    try {
      // ✅ Check if user is HOD (safe, no method calls that might fail)
      $isHOD = $this->checkIfHOD();

      // ✅ Get the department where this user is HOD
      $hodDepartment = null;
      if ($isHOD) {
        $hodDepartment = Department::where('hod_id', $this->id)->first();
      }

      // ✅ Get the user's assigned department
      $assignedDepartment = $this->department;

      // ✅ Determine the effective department
      $effectiveDepartment = $hodDepartment ?? $assignedDepartment;

      // ✅ If still no department, try one more time
      if (!$effectiveDepartment && $isHOD) {
        $effectiveDepartment = Department::where('hod_id', $this->id)->first();
      }

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

        // ✅ Role information
        'role' => $this->getRoleName(),
        'role_label' => $this->getRoleLabel(),
        'role_description' => $this->getRoleDescription(),

        // ✅ Department information
        'department_id' => $this->department_id,
        'department' => $assignedDepartment ? [
          'id' => $assignedDepartment->id,
          'name' => $assignedDepartment->name,
          'code' => $assignedDepartment->code,
          'description' => $assignedDepartment->description,
          'hod_id' => $assignedDepartment->hod_id,
          'is_active' => (bool) $assignedDepartment->is_active,
        ] : null,

        // ✅ HOD Department
        'hod_department' => $hodDepartment ? [
          'id' => $hodDepartment->id,
          'name' => $hodDepartment->name,
          'code' => $hodDepartment->code,
          'description' => $hodDepartment->description,
          'hod_id' => $hodDepartment->hod_id,
          'is_active' => (bool) $hodDepartment->is_active,
        ] : null,

        // ✅ Effective department
        'effective_department' => $effectiveDepartment ? [
          'id' => $effectiveDepartment->id,
          'name' => $effectiveDepartment->name,
          'code' => $effectiveDepartment->code,
          'description' => $effectiveDepartment->description,
          'hod_id' => $effectiveDepartment->hod_id,
          'is_active' => (bool) $effectiveDepartment->is_active,
        ] : null,

        // ✅ Helper flags
        'is_hod' => $isHOD,
        'has_hod_department' => $hodDepartment ? true : false,
        'has_assigned_department' => $assignedDepartment ? true : false,

        'profile' => $this->whenLoaded('profile', function () {
          if (!$this->profile) {
            return null;
          }
          return [
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
          ];
        }),

        'is_active' => (bool) $this->is_active,
        'is_approved' => (bool) $this->is_approved,
        'approved_at' => $this->approved_at,
        'approved_by' => $this->approved_by,
        'rejection_reason' => $this->rejection_reason,
        'last_login_at' => $this->last_login_at,
        'timezone' => $this->timezone,

        // ✅ Roles
        'roles' => $this->whenLoaded('roles', function () {
          return $this->roles ? $this->roles->pluck('name') : [];
        }),
        'permissions' => $this->getUserPermissions(),
        'role_details' => $this->getRoleDetails(),

        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
      ];
    } catch (\Exception $e) {
      // ✅ Fallback: return basic user data if something fails
      Log::error('UserResource failed', [
        'user_id' => $this->id ?? null,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return [
        'id' => $this->id,
        'first_name' => $this->first_name ?? '',
        'last_name' => $this->last_name ?? '',
        'full_name' => ($this->first_name ?? '') . ' ' . ($this->last_name ?? ''),
        'email' => $this->email ?? '',
        'department_id' => $this->department_id ?? null,
        'is_hod' => false,
        'has_hod_department' => false,
        'has_assigned_department' => false,
        'roles' => [],
        'permissions' => [],
        'created_at' => $this->created_at ?? null,
        'updated_at' => $this->updated_at ?? null,
      ];
    }
  }

  /**
   * ✅ Safe method to check if user is HOD (no method calls that might fail)
   */
  protected function checkIfHOD(): bool
  {
    try {
      // Check via roles relationship
      if ($this->relationLoaded('roles') && $this->roles) {
        foreach ($this->roles as $role) {
          $roleName = strtolower($role->name);
          if ($roleName === 'hod') {
            return true;
          }
          // Also check label
          if ($role->label && strtolower($role->label) === 'head of department') {
            return true;
          }
        }
      }

      // Try using Spatie's hasRole if it exists
      if (method_exists($this, 'hasRole')) {
        if ($this->hasRole('hod') || $this->hasRole('HOD')) {
          return true;
        }
      }

      return false;
    } catch (\Exception $e) {
      return false;
    }
  }

  /**
   * Get all permissions for the user.
   */
  protected function getUserPermissions(): array
  {
    try {
      if (method_exists($this, 'getAllPermissions')) {
        $permissions = $this->getAllPermissions();
        return $permissions->pluck('name')->toArray();
      }
      return [];
    } catch (\Exception $e) {
      return [];
    }
  }

  /**
   * Get the role name for the user.
   */
  protected function getRoleName(): ?string
  {
    try {
      if ($this->relationLoaded('roles') && $this->roles) {
        $role = $this->roles->first();
        if ($role) {
          return $role->name;
        }
      }
      return null;
    } catch (\Exception $e) {
      return null;
    }
  }

  /**
   * Get the role label.
   */
  protected function getRoleLabel(): ?string
  {
    try {
      if ($this->relationLoaded('roles') && $this->roles) {
        $role = $this->roles->first();
        if ($role) {
          return $role->label ?? ucfirst(str_replace('_', ' ', $role->name));
        }
      }
      return null;
    } catch (\Exception $e) {
      return null;
    }
  }

  /**
   * Get the role description.
   */
  protected function getRoleDescription(): ?string
  {
    try {
      if ($this->relationLoaded('roles') && $this->roles) {
        $role = $this->roles->first();
        if ($role) {
          return $role->description;
        }
      }
      return null;
    } catch (\Exception $e) {
      return null;
    }
  }

  /**
   * Get detailed role information.
   */
  protected function getRoleDetails(): array
  {
    $roleDetails = [];

    try {
      if ($this->relationLoaded('roles') && $this->roles) {
        foreach ($this->roles as $role) {
          $permissions = [];
          if ($role->relationLoaded('permissions') && $role->permissions) {
            $permissions = $role->permissions->pluck('name')->toArray();
          }

          $roleDetails[] = [
            'id' => $role->id,
            'name' => $role->name,
            'label' => $role->label ?? ucfirst(str_replace('_', ' ', $role->name)),
            'description' => $role->description,
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
