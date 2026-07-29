<?php
// app/Services/Procurement/Exceptions/ProcurementException.php

declare(strict_types=1);

namespace App\Services\Procurement\Exceptions;

use Exception;

class ProcurementException extends Exception
{
  protected array $context = [];

  public function __construct(string $message, array $context = [], int $code = 0, ?Exception $previous = null)
  {
    $this->context = $context;
    parent::__construct($message, $code, $previous);
  }

  public function getContext(): array
  {
    return $this->context;
  }

  public static function requisitionNotFound(int $id): self
  {
    return new self("Requisition #{$id} not found.");
  }

  public static function requisitionNotApproved(): self
  {
    return new self('Requisition must be fully approved before procurement can start.');
  }

  public static function procurementAlreadyStarted(): self
  {
    return new self('Procurement has already been initiated for this requisition.');
  }

  public static function requisitionCancelled(): self
  {
    return new self('Cannot start procurement for a cancelled requisition.');
  }

  public static function procurementNotStarted(): self
  {
    return new self('Procurement has not been started for this requisition.');
  }

  public static function procurementAlreadyCompleted(): self
  {
    return new self('Procurement is already completed.');
  }

  public static function unauthorizedAction(string $action): self
  {
    return new self("You are not authorized to perform this action: {$action}.");
  }

  public static function invalidStatusTransition(string $from, string $to): self
  {
    return new self("Cannot transition from {$from} to {$to}.");
  }
}
