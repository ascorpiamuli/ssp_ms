<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'first_name' => $this->first_name,
      'last_name' => $this->last_name,
      'full_name' => $this->full_name,
      'initials' => $this->initials,
      'email' => $this->email,
      'phone' => $this->phone,
      'id_number' => $this->id_number,
      'date_of_birth' => $this->date_of_birth,
      'profile_photo' => $this->profile_photo,
      'avatar_url' => $this->avatar_url,
      'role' => $this->role,
      'department_id' => $this->department_id,
      'department' => $this->whenLoaded('department', function () {
        return [
          'id' => $this->department->id,
          'name' => $this->department->name,
          'code' => $this->department->code,
        ];
      }),
      'profile' => $this->whenLoaded('profile', function () {
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
      'is_active' => $this->is_active,
      'is_approved' => $this->is_approved,
      'approved_at' => $this->approved_at,
      'approved_by' => $this->approved_by,
      'rejection_reason' => $this->rejection_reason,
      'last_login_at' => $this->last_login_at,
      'timezone' => $this->timezone,
      'roles' => $this->whenLoaded('roles', function () {
        return $this->roles->pluck('name');
      }),
      'permissions' => $this->whenLoaded('permissions', function () {
        return $this->getAllPermissions()->pluck('name');
      }),
      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,
    ];
  }
}
