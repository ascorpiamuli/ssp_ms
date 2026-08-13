<?php
// app/Services/Signatures/DTOs/SignatureVerificationData.php

namespace App\Services\Signatures\DTOs;

class SignatureVerificationData
{
  public function __construct(
    public readonly ?int $id,
    public readonly int $signatureSpecimenId,
    public readonly int $userId,
    public readonly ?int $verifiedBy,
    public readonly ?string $documentType,
    public readonly ?int $documentId,
    public readonly ?string $documentReference,
    public readonly string $verificationStatus,
    public readonly ?string $verificationMethod,
    public readonly ?string $verificationData,
    public readonly ?string $failureReason,
    public readonly ?string $qrCodeData,
    public readonly ?string $qrCodeImage,
    public readonly ?string $verifiedAt,
    public readonly ?string $ipAddress,
    public readonly ?string $userAgent,
    public readonly ?array $metadata,
    public readonly ?string $createdAt,
    public readonly ?string $updatedAt,
    public readonly ?array $user = null,
    public readonly ?array $verifiedByUser = null,
    public readonly ?array $signatureSpecimen = null,
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      id: $data['id'] ?? null,
      signatureSpecimenId: $data['signature_specimen_id'],
      userId: $data['user_id'],
      verifiedBy: $data['verified_by'] ?? null,
      documentType: $data['document_type'] ?? null,
      documentId: $data['document_id'] ?? null,
      documentReference: $data['document_reference'] ?? null,
      verificationStatus: $data['verification_status'] ?? 'pending',
      verificationMethod: $data['verification_method'] ?? null,
      verificationData: $data['verification_data'] ?? null,
      failureReason: $data['failure_reason'] ?? null,
      qrCodeData: $data['qr_code_data'] ?? null,
      qrCodeImage: $data['qr_code_image'] ?? null,
      verifiedAt: $data['verified_at'] ?? null,
      ipAddress: $data['ip_address'] ?? null,
      userAgent: $data['user_agent'] ?? null,
      metadata: $data['metadata'] ?? null,
      createdAt: $data['created_at'] ?? null,
      updatedAt: $data['updated_at'] ?? null,
      user: $data['user'] ?? null,
      verifiedByUser: $data['verified_by_user'] ?? null,
      signatureSpecimen: $data['signature_specimen'] ?? null,
    );
  }

  public function toArray(): array
  {
    return [
      'id' => $this->id,
      'signature_specimen_id' => $this->signatureSpecimenId,
      'user_id' => $this->userId,
      'verified_by' => $this->verifiedBy,
      'document_type' => $this->documentType,
      'document_id' => $this->documentId,
      'document_reference' => $this->documentReference,
      'verification_status' => $this->verificationStatus,
      'verification_method' => $this->verificationMethod,
      'verification_data' => $this->verificationData,
      'failure_reason' => $this->failureReason,
      'qr_code_data' => $this->qrCodeData,
      'qr_code_image' => $this->qrCodeImage,
      'verified_at' => $this->verifiedAt,
      'ip_address' => $this->ipAddress,
      'user_agent' => $this->userAgent,
      'metadata' => $this->metadata,
      'created_at' => $this->createdAt,
      'updated_at' => $this->updatedAt,
      'user' => $this->user,
      'verified_by_user' => $this->verifiedByUser,
      'signature_specimen' => $this->signatureSpecimen,
    ];
  }
}
