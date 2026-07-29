<?php
// app/Notifications/Procurement/PaymentVoucherNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class PaymentVoucherNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'payment_voucher';
  }

  protected function getTitle(): string
  {
    $voucherNumber = $this->data['voucher_number'] ?? 'N/A';
    return "Payment Voucher {$voucherNumber}";
  }

  protected function getMessage(): string
  {
    $voucherNumber = $this->data['voucher_number'] ?? 'N/A';
    $status = $this->data['status'] ?? 'prepared';
    $amount = $this->data['amount'] ?? 'N/A';
    return "Payment Voucher {$voucherNumber} for {$amount} has been {$status}.";
  }

  protected function getActionUrl(): ?string
  {
    $voucherId = $this->data['voucher_id'] ?? null;
    if ($voucherId) {
      return url("/procurement/payments/vouchers/{$voucherId}");
    }
    return url('/procurement/payments');
  }
}
