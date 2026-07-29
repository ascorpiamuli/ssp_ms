<?php
// app/Notifications/Procurement/InvoiceNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class InvoiceNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'invoice';
  }

  protected function getTitle(): string
  {
    $invoiceNumber = $this->data['invoice_number'] ?? 'N/A';
    return "Invoice {$invoiceNumber}";
  }

  protected function getMessage(): string
  {
    $invoiceNumber = $this->data['invoice_number'] ?? 'N/A';
    $status = $this->data['status'] ?? 'submitted';
    return "Invoice {$invoiceNumber} has been {$status}.";
  }

  protected function getActionUrl(): ?string
  {
    $invoiceId = $this->data['invoice_id'] ?? null;
    if ($invoiceId) {
      return url("/procurement/invoices/{$invoiceId}");
    }
    return url('/procurement/invoices');
  }
}
