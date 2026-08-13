<?php
// app/Http/Resources/Signature/SignatureResource.php

namespace App\Http\Resources\Signature;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SignatureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // If the resource is a model (SignatureSpecimen)
        if ($this->resource instanceof \App\Models\SignatureSpecimen) {
            return [
                'id' => $this->id,
                'user_id' => $this->user_id,
                'user' => $this->user ? [
                    'id' => $this->user->id,
                    'full_name' => $this->user->full_name,
                    'email' => $this->user->email,
                    'role' => $this->user->role,
                    'role_label' => $this->user->role_label,
                ] : null,
                'signature_image_url' => $this->signature_image_url,
                'signature_hash' => $this->signature_hash,
                'is_verified' => $this->is_verified,
                'status' => $this->status,
                'status_label' => $this->status_label,
                'status_color' => $this->status_color,
                'verified_at' => $this->verified_at?->toISOString(),
                'verification_notes' => $this->verification_notes,
                'verification_method' => $this->verification_method,
                'qr_code' => [
                    'data' => $this->qr_code_data,
                    'image' => $this->qr_code_image,
                    'hash' => $this->qr_code_hash,
                ],
                'verified_by' => $this->verifiedBy ? [
                    'id' => $this->verifiedBy->id,
                    'full_name' => $this->verifiedBy->full_name,
                    'email' => $this->verifiedBy->email,
                ] : null,
                'created_at' => $this->created_at?->toISOString(),
                'updated_at' => $this->updated_at?->toISOString(),
            ];
        }

        // If the resource is a DTO (SignatureData)
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'user' => $this->user,
            'signature_image_url' => $this->signatureImageUrl,
            'signature_hash' => $this->signatureHash,
            'is_verified' => $this->isVerified,
            'status' => $this->status,
            'status_label' => $this->statusLabel ?? $this->getStatusLabel(),
            'status_color' => $this->statusColor ?? $this->getStatusColor(),
            'verified_at' => $this->verifiedAt,
            'verification_notes' => $this->verificationNotes,
            'verification_method' => $this->verificationMethod,
            'qr_code' => [
                'data' => $this->qrCodeData,
                'image' => $this->qrCodeImage,
                'hash' => $this->qrCodeHash,
            ],
            'verified_by' => $this->verifiedByUser,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }

    protected function getStatusLabel(): string
    {
        $labels = [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'expired' => 'Expired',
        ];
        return $labels[$this->status] ?? ucfirst($this->status);
    }

    protected function getStatusColor(): string
    {
        $colors = [
            'pending' => 'warning',
            'approved' => 'success',
            'rejected' => 'danger',
            'expired' => 'secondary',
        ];
        return $colors[$this->status] ?? 'secondary';
    }
}
