<?php
// app/Notifications/Procurement/SupplierSelectedNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class SupplierSelectedNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'supplier_selected';
  }

  protected function getTitle(): string
  {
    return 'Supplier Selected';
  }

  protected function getMessage(): string
  {
    $supplierName = $this->data['supplier_name'] ?? 'A supplier';
    $reference = $this->referenceNumber ?? 'N/A';
    return "{$supplierName} has been selected for requisition {$reference}.";
  }

  protected function getActionUrl(): ?string
  {
    $requisitionId = $this->requisitionId;
    if ($requisitionId) {
      return url("/procurement/requisitions/{$requisitionId}");
    }
    return url('/procurement');
  }
}
