<?php
// app/Notifications/Procurement/TenderNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class TenderNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'tender';
  }

  protected function getTitle(): string
  {
    $tenderNumber = $this->data['tender_number'] ?? 'N/A';
    $status = $this->data['status'] ?? 'published';
    return "Tender {$tenderNumber} {$status}";
  }

  protected function getMessage(): string
  {
    $tenderNumber = $this->data['tender_number'] ?? 'N/A';
    $status = ucfirst($this->data['status'] ?? 'published');
    $closingDate = $this->data['closing_date'] ?? 'N/A';
    return "Tender {$tenderNumber} has been {$status}. Closing date: {$closingDate}.";
  }

  protected function getActionUrl(): ?string
  {
    $tenderId = $this->data['tender_id'] ?? null;
    if ($tenderId) {
      return url("/procurement/tenders/{$tenderId}");
    }
    return url('/procurement/tenders');
  }

  protected function getAdditionalLines(): array
  {
    $lines = [];
    if (isset($this->data['awarded_amount'])) {
      $lines[] = "Awarded Amount: {$this->data['awarded_amount']}";
    }
    if (isset($this->data['awarded_to_name'])) {
      $lines[] = "Awarded To: {$this->data['awarded_to_name']}";
    }
    if (isset($this->data['reason'])) {
      $lines[] = "Reason: {$this->data['reason']}";
    }
    return $lines;
  }
}
