<?php
// app/Notifications/Procurement/ContractNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class ContractNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'contract';
  }

  protected function getTitle(): string
  {
    $contractNumber = $this->data['contract_number'] ?? 'N/A';
    $status = $this->data['status'] ?? 'created';
    return "Contract {$contractNumber} {$status}";
  }

  protected function getMessage(): string
  {
    $contractNumber = $this->data['contract_number'] ?? 'N/A';
    $status = ucfirst($this->data['status'] ?? 'created');
    $supplierName = $this->data['supplier_name'] ?? 'N/A';
    return "Contract {$contractNumber} with {$supplierName} has been {$status}.";
  }

  protected function getActionUrl(): ?string
  {
    $contractId = $this->data['contract_id'] ?? null;
    if ($contractId) {
      return url("/procurement/contracts/{$contractId}");
    }
    return url('/procurement/contracts');
  }
}
