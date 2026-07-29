<?php
// app/Services/Procurement/Exceptions/PurchaseOrderException.php

declare(strict_types=1);

namespace App\Services\Procurement\Exceptions;

class PurchaseOrderException extends ProcurementException
{
  public static function poNotFound(int $id): self
  {
    return new self("Purchase Order #{$id} not found.");
  }

  public static function noSupplierSelected(): self
  {
    return new self('Requisition must have a selected supplier before generating PO.');
  }

  public static function poAlreadyExists(): self
  {
    return new self('A purchase order already exists for this requisition.');
  }

  public static function poCannotBeModified(): self
  {
    return new self('Purchase order cannot be modified in its current status.');
  }

  public static function poAlreadyCompleted(): self
  {
    return new self('Purchase order is already completed.');
  }

  public static function wrongType(string $type): self
  {
    return new self("Invalid PO type: {$type}. Must be 'lpo' or 'lso'.");
  }

  public static function poMustBeIssued(): self
  {
    return new self('PO must be issued before sending to supplier.');
  }

  public static function poMustBeSent(): self
  {
    return new self('PO must be sent before acknowledgment.');
  }

  public static function supplierMismatch(): self
  {
    return new self('Supplier does not match the PO supplier.');
  }

  public static function cannotCancelCompleted(): self
  {
    return new self('Cannot cancel a completed PO.');
  }
}
