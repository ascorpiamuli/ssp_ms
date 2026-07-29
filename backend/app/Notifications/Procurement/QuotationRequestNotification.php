<?php
// app/Notifications/Procurement/QuotationRequestNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class QuotationRequestNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'quotation_request';
  }

  protected function getTitle(): string
  {
    return 'Quotation Request';
  }

  protected function getMessage(): string
  {
    $qtnNumber = $this->data['qtn_number'] ?? 'N/A';
    $closingDate = $this->data['closing_date'] ?? 'N/A';
    return "A new quotation request ({$qtnNumber}) has been sent. Please respond by {$closingDate}.";
  }

  protected function getActionUrl(): ?string
  {
    $qtnId = $this->data['qtn_id'] ?? null;
    if ($qtnId) {
      return url("/procurement/quotations/{$qtnId}");
    }
    return url('/procurement/quotations');
  }
}
