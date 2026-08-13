<?php
// app/Services/Signatures/DTOs/SignatureStatus.php

namespace App\Services\Signatures\DTOs;

class SignatureStatus
{
  public function __construct(
    public readonly string $status,
    public readonly string $label,
    public readonly string $color,
    public readonly ?SignatureData $specimen = null,
    public readonly ?string $message = null,
  ) {}

  public static function none(): self
  {
    return new self(
      status: 'none',
      label: 'No Signature',
      color: 'secondary',
      message: 'User has not uploaded a signature'
    );
  }

  public static function pending(SignatureData $specimen): self
  {
    return new self(
      status: 'pending',
      label: 'Pending Verification',
      color: 'warning',
      specimen: $specimen,
      message: 'Signature is pending verification'
    );
  }

  public static function verified(SignatureData $specimen): self
  {
    return new self(
      status: 'verified',
      label: 'Verified',
      color: 'success',
      specimen: $specimen,
      message: 'Signature has been verified'
    );
  }

  public static function rejected(SignatureData $specimen): self
  {
    return new self(
      status: 'rejected',
      label: 'Rejected',
      color: 'danger',
      specimen: $specimen,
      message: 'Signature has been rejected'
    );
  }

  public function toArray(): array
  {
    return [
      'status' => $this->status,
      'label' => $this->label,
      'color' => $this->color,
      'message' => $this->message,
      'specimen' => $this->specimen?->toArray(),
    ];
  }
}
