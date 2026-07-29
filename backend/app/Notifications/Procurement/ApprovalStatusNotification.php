<?php
// app/Notifications/Procurement/ApprovalStatusNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class ApprovalStatusNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'approval_status';
  }

  protected function getTitle(): string
  {
    $status = ucfirst($this->data['status'] ?? 'updated');
    $entityType = ucwords(str_replace('_', ' ', $this->data['entity_type'] ?? 'document'));
    return "{$entityType} {$status}";
  }

  protected function getMessage(): string
  {
    $status = ucfirst($this->data['status'] ?? 'updated');
    $entityType = ucwords(str_replace('_', ' ', $this->data['entity_type'] ?? 'document'));
    $reference = $this->referenceNumber ?? 'N/A';
    $by = $this->data['approved_by_name'] ?? 'Someone';
    return "Your {$entityType} ({$reference}) has been {$status} by {$by}.";
  }

  protected function getActionUrl(): ?string
  {
    $entityId = $this->data['entity_id'] ?? null;
    $entityType = $this->data['entity_type'] ?? null;
    if ($entityId && $entityType) {
      return url("/procurement/{$entityType}s/{$entityId}");
    }
    return url('/procurement');
  }

  protected function getAdditionalLines(): array
  {
    $lines = [];
    if (isset($this->data['reason']) && $this->data['status'] === 'declined') {
      $lines[] = "Reason: {$this->data['reason']}";
    }
    if (isset($this->data['reason']) && $this->data['status'] === 'returned') {
      $lines[] = "Return Reason: {$this->data['reason']}";
    }
    return $lines;
  }
}
