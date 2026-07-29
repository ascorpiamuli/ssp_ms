<?php
// app/Notifications/Procurement/PurchaseOrderNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class PurchaseOrderNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'purchase_order';
  }

  protected function getTitle(): string
  {
    $poNumber = $this->data['po_number'] ?? 'N/A';
    return "Purchase Order {$poNumber}";
  }

  protected function getMessage(): string
  {
    $poNumber = $this->data['po_number'] ?? 'N/A';
    $status = $this->data['status'] ?? 'generated';
    return "Purchase Order {$poNumber} has been {$status}.";
  }

  protected function getActionUrl(): ?string
  {
    $poId = $this->data['purchase_order_id'] ?? null;
    if ($poId) {
      return url("/procurement/purchase-orders/{$poId}");
    }
    return url('/procurement/purchase-orders');
  }
}
