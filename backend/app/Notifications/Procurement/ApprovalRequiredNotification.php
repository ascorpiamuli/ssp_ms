<?php
// app/Notifications/Procurement/ApprovalRequiredNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class ApprovalRequiredNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'approval_required';
  }

  protected function getTitle(): string
  {
    $entityType = ucwords(str_replace('_', ' ', $this->data['entity_type'] ?? 'document'));
    return "Approval Required: {$entityType}";
  }

  protected function getMessage(): string
  {
    $entityType = ucwords(str_replace('_', ' ', $this->data['entity_type'] ?? 'document'));
    $reference = $this->referenceNumber ?? 'N/A';
    $level = $this->data['level'] ?? 'N/A';
    $deadline = $this->data['deadline'] ?? 'N/A';
    return "A {$entityType} ({$reference}) requires your {$level} approval by {$deadline}.";
  }

  protected function getActionUrl(): ?string
  {
    $approvalId = $this->data['approval_id'] ?? null;
    if ($approvalId) {
      return url("/procurement/approvals/{$approvalId}");
    }
    return url('/procurement/approvals');
  }

  protected function getAdditionalLines(): array
  {
    $lines = [];
    if (isset($this->data['is_delegated']) && $this->data['is_delegated']) {
      $lines[] = '⚠️ This approval has been delegated to you.';
    }
    if (isset($this->data['is_reassigned']) && $this->data['is_reassigned']) {
      $lines[] = '⚠️ This approval has been reassigned to you.';
    }
    return $lines;
  }
}
