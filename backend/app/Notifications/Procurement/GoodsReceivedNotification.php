<?php
// app/Notifications/Procurement/GoodsReceivedNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class GoodsReceivedNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'goods_received';
  }

  protected function getTitle(): string
  {
    $grnNumber = $this->data['grn_number'] ?? 'N/A';
    return "Goods Received Note {$grnNumber}";
  }

  protected function getMessage(): string
  {
    $grnNumber = $this->data['grn_number'] ?? 'N/A';
    $poNumber = $this->data['po_number'] ?? 'N/A';
    $status = $this->data['status'] ?? 'generated';
    return "GRN {$grnNumber} for PO {$poNumber} has been {$status}.";
  }

  protected function getActionUrl(): ?string
  {
    $grnId = $this->data['grn_id'] ?? null;
    if ($grnId) {
      return url("/procurement/grn/{$grnId}");
    }
    return url('/procurement/grn');
  }
}
