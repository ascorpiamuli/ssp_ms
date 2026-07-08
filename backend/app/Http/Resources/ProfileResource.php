<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'user_id' => $this->user_id,
      'avatar' => $this->avatar,
      'date_of_birth' => $this->date_of_birth,
      'gender' => $this->gender,
      'address' => $this->address,
      'city' => $this->city,
      'state' => $this->state,
      'postal_code' => $this->postal_code,
      'country' => $this->country,
      'bio' => $this->bio,
      'preferences' => $this->preferences,
      'social_links' => $this->social_links,
      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,
    ];
  }
}
