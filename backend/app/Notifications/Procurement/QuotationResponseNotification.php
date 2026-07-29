<?php
// app/Notifications/Procurement/QuotationResponseNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class QuotationResponseNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'quotation_response';
  }

  protected function getTitle(): string
  {
    return 'Quotation Response Received';
  }

  protected function getMessage(): string
  {
    $supplierName = $this->data['supplier_name'] ?? 'A supplier';
    $qtnNumber = $this->data['qtn_number'] ?? 'N/A';
    return "{$supplierName} has submitted a quotation for request {$qtnNumber}.";
  }

  protected function getActionUrl(): ?string
  {
    $quotationId = $this->data['quotation_id'] ?? null;
    if ($quotationId) {
      return url("/procurement/quotations/responses/{$quotationId}");
    }
    return url('/procurement/quotations');
  }
}
