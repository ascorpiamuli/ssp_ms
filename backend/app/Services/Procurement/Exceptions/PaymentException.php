<?php
// app/Services/Procurement/Exceptions/PaymentException.php

declare(strict_types=1);

namespace App\Services\Procurement\Exceptions;

class PaymentException extends ProcurementException
{
  public static function voucherNotFound(int $id): self
  {
    return new self("Payment Voucher #{$id} not found.");
  }

  public static function invoiceNotFound(int $id): self
  {
    return new self("Invoice #{$id} not found.");
  }

  public static function invoiceNotApproved(): self
  {
    return new self('Invoice must be approved before preparing payment voucher.');
  }

  public static function voucherAlreadyExists(): self
  {
    return new self('A payment voucher already exists for this invoice.');
  }

  public static function chequeAlreadyExists(): self
  {
    return new self('A cheque already exists for this voucher.');
  }

  public static function cannotCancelPaid(): self
  {
    return new self('Cannot cancel a paid voucher.');
  }

  public static function cannotCashCancelled(): self
  {
    return new self('Cannot cash a cancelled cheque.');
  }

  public static function voucherNotApproved(): self
  {
    return new self('Voucher must be approved before recording cheque.');
  }

  public static function voucherMustBeDraft(): self
  {
    return new self('Voucher must be in draft status to endorse.');
  }

  public static function voucherMustBeEndorsed(): self
  {
    return new self('Voucher must be endorsed before approval.');
  }

  public static function voucherMustBeApproved(): self
  {
    return new self('Voucher must be approved before marking as paid.');
  }

  public static function chequeNotFound(int $id): self
  {
    return new self("Cheque #{$id} not found.");
  }

  public static function chequeAlreadyCashed(): self
  {
    return new self('Cheque has already been cashed.');
  }

  public static function chequeAlreadyCancelled(): self
  {
    return new self('Cheque has already been cancelled.');
  }
}
