<?php
// app/Http/Resources/Signature/SignatureVerificationResource.php

namespace App\Http\Resources\Signature;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SignatureVerificationResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'signature_specimen_id' => $this->signature_specimen_id,
      'user_id' => $this->user_id,
      'user' => [
        'id' => $this->user?->id,
        'full_name' => $this->user?->full_name,
        'email' => $this->user?->email,
      ],
      'verified_by' => $this->verifiedBy ? [
        'id' => $this->verifiedBy->id,
        'full_name' => $this->verifiedBy->full_name,
        'email' => $this->verifiedBy->email,
      ] : null,
      'document_type' => $this->document_type,
      'document_reference' => $this->document_reference,
      'verification_status' => $this->verification_status,
      'verification_status_label' => $this->verification_status_label,
      'verification_status_color' => $this->verification_status_color,
      'verification_method' => $this->verification_method,
      'verification_data' => $this->verification_data ? json_decode($this->verification_data, true) : null,
      'failure_reason' => $this->failure_reason,
      'qr_code' => [
        'data' => $this->qr_code_data,
        'image' => $this->qr_code_image,
      ],
      'verified_at' => $this->verified_at?->toISOString(),
      'created_at' => $this->created_at?->toISOString(),
      'updated_at' => $this->updated_at?->toISOString(),
    ];
  }
}
