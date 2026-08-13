<?php
// app/Http/Resources/Signature/SignatureListResource.php

namespace App\Http\Resources\Signature;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SignatureListResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'user' => [
        'id' => $this->user?->id,
        'full_name' => $this->user?->full_name,
        'email' => $this->user?->email,
        'role_label' => $this->user?->role_label,
      ],
      'signature_image_url' => $this->signature_image_url,
      'is_verified' => $this->is_verified,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'verified_at' => $this->verified_at?->toISOString(),
      'created_at' => $this->created_at?->toISOString(),
    ];
  }
}
