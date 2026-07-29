<?php
// app/Services/Procurement/Exceptions/InvoiceException.php

declare(strict_types=1);

namespace App\Services\Procurement\Exceptions;

class InvoiceException extends ProcurementException
{
  public static function invoiceNotFound(int $id): self
  {
    return new self("Invoice #{$id} not found.");
  }

  public static function noItems(): self
  {
    return new self('Invoice must have at least one item.');
  }

  public static function supplierMismatch(): self
  {
    return new self('Supplier does not match the PO supplier.');
  }

  public static function invoiceAlreadyExists(): self
  {
    return new self('An invoice already exists for this PO.');
  }

  public static function cannotModifyPaid(): self
  {
    return new self('Cannot modify a paid invoice.');
  }

  public static function threeWayMatchingFailed(): self
  {
    return new self('Three-way matching failed. Amounts do not match.');
  }

  public static function noPoForMatching(): self
  {
    return new self('No purchase order found for three-way matching.');
  }

  public static function noGrnForMatching(): self
  {
    return new self('No GRN found for three-way matching.');
  }

  public static function invoiceMustBePending(): self
  {
    return new self('Invoice must be pending before verification.');
  }

  public static function invoiceMustBeVerified(): self
  {
    return new self('Invoice must be verified before approval.');
  }

  public static function invoiceMustBeApproved(): self
  {
    return new self('Invoice must be approved before marking as paid.');
  }

  public static function cannotDisputePaid(): self
  {
    return new self('Cannot dispute a paid invoice.');
  }

  public static function cannotCancelPaid(): self
  {
    return new self('Cannot cancel a paid invoice.');
  }
}
