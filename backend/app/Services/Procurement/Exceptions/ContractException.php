<?php
// app/Services/Procurement/Exceptions/ContractException.php

declare(strict_types=1);

namespace App\Services\Procurement\Exceptions;

class ContractException extends ProcurementException
{
  public static function contractNotFound(int $id): self
  {
    return new self("Contract #{$id} not found.");
  }

  public static function contractAlreadyExists(): self
  {
    return new self('A contract already exists for this requisition.');
  }

  public static function contractMustBeDraft(): self
  {
    return new self('Contract must be in draft status to approve.');
  }

  public static function contractNotRenewable(): self
  {
    return new self('This contract is not renewable.');
  }

  public static function contractCannotBeRenewed(): self
  {
    return new self('Contract cannot be renewed at this time.');
  }

  public static function contractMustBeActive(): self
  {
    return new self('Only active contracts can be suspended or completed.');
  }

  public static function contractCannotBeTerminated(): self
  {
    return new self('Contract cannot be terminated in its current status.');
  }
}
