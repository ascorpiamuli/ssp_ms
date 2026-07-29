<?php
// app/Services/Procurement/Exceptions/QuotationException.php

declare(strict_types=1);

namespace App\Services\Procurement\Exceptions;

class QuotationException extends ProcurementException
{
  public static function qtnNotFound(int $id): self
  {
    return new self("Quotation Request #{$id} not found.");
  }

  public static function supplierNotInvited(int $supplierId): self
  {
    return new self("Supplier #{$supplierId} was not invited to quote.");
  }

  public static function qtnNotOpen(): self
  {
    return new self('This QTN is not open for responses.');
  }

  public static function supplierAlreadyResponded(int $supplierId): self
  {
    return new self("Supplier #{$supplierId} has already responded.");
  }

  public static function noValidSuppliers(): self
  {
    return new self('No valid suppliers found to send QTN.');
  }

  public static function qtnExpired(): self
  {
    return new self('This QTN has expired.');
  }

  public static function noItems(): self
  {
    return new self('Quotation must have at least one item.');
  }

  public static function qtnAlreadyClosed(): self
  {
    return new self('QTN is already closed.');
  }

  public static function qtnAlreadyCancelled(): self
  {
    return new self('QTN is already cancelled.');
  }

  public static function quotationAlreadyVerified(): self
  {
    return new self('Quotation has already been verified.');
  }

  public static function quotationAlreadyEvaluated(): self
  {
    return new self('Quotation has already been evaluated.');
  }

  public static function quotationNotFound(int $id): self
  {
    return new self("Supplier Quotation #{$id} not found.");
  }

  public static function quotationNotVerified(int $id): self
  {
    return new self("Quotation #{$id} must be verified before evaluation.");
  }

  public static function supplierQuotationMismatch(): self
  {
    return new self('Quotation does not belong to the selected supplier.');
  }
}
