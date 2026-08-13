<?php
// app/Services/Signatures/DTOs/QRCodeData.php

namespace App\Services\Signatures\DTOs;

class QRCodeData
{
  public function __construct(
    public readonly ?int $verificationId,
    public readonly ?int $signatureId,
    public readonly int $userId,
    public readonly string $userName,
    public readonly string $userRole,
    public readonly string $roleLabel,
    public readonly ?string $documentType,
    public readonly ?string $documentReference,
    public readonly string $verificationStatus,
    public readonly ?string $verifiedAt,
    public readonly ?string $verifiedBy,
    public readonly int $timestamp,
    public readonly string $hash,
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      verificationId: $data['verification_id'] ?? null,
      signatureId: $data['signature_id'] ?? null,
      userId: $data['user_id'],
      userName: $data['user_name'],
      userRole: $data['user_role'],
      roleLabel: $data['role_label'],
      documentType: $data['document_type'] ?? null,
      documentReference: $data['document_reference'] ?? null,
      verificationStatus: $data['verification_status'],
      verifiedAt: $data['verified_at'] ?? null,
      verifiedBy: $data['verified_by'] ?? null,
      timestamp: $data['timestamp'],
      hash: $data['hash'],
    );
  }

  public function toArray(): array
  {
    return [
      'verification_id' => $this->verificationId,
      'signature_id' => $this->signatureId,
      'user_id' => $this->userId,
      'user_name' => $this->userName,
      'user_role' => $this->userRole,
      'role_label' => $this->roleLabel,
      'document_type' => $this->documentType,
      'document_reference' => $this->documentReference,
      'verification_status' => $this->verificationStatus,
      'verified_at' => $this->verifiedAt,
      'verified_by' => $this->verifiedBy,
      'timestamp' => $this->timestamp,
      'hash' => $this->hash,
    ];
  }

  public function toJson(): string
  {
    return json_encode($this->toArray());
  }
}
