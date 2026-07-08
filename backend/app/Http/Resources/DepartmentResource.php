<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'code' => $this->code,
      'description' => $this->description,
      'hod_id' => $this->hod_id,
      'hod' => $this->whenLoaded('hod', function () {
        return [
          'id' => $this->hod->id,
          'first_name' => $this->hod->first_name,
          'last_name' => $this->hod->last_name,
          'full_name' => $this->hod->full_name,
          'email' => $this->hod->email,
          'phone' => $this->hod->phone,
          'avatar_url' => $this->hod->avatar_url ?? null,
        ];
      }),
      'users_count' => $this->whenCounted('users'),
      'is_active' => (bool) $this->is_active,
      'created_at' => $this->created_at?->toISOString(),
      'updated_at' => $this->updated_at?->toISOString(),
    ];
  }

  /**
   * Get additional data that should be returned with the resource array.
   */
  public function with(Request $request): array
  {
    return [
      'success' => true,
    ];
  }
}
