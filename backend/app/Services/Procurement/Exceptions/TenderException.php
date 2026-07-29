<?php
// app/Services/Procurement/Exceptions/TenderException.php

declare(strict_types=1);

namespace App\Services\Procurement\Exceptions;

class TenderException extends ProcurementException
{
  public static function tenderNotFound(int $id): self
  {
    return new self("Tender #{$id} not found.");
  }

  public static function tenderAlreadyExists(): self
  {
    return new self('A tender already exists for this requisition.');
  }

  public static function tenderMustBeDraft(): self
  {
    return new self('Tender must be in draft status to publish.');
  }

  public static function tenderMustBePublished(): self
  {
    return new self('Only published tenders can be evaluated.');
  }

  public static function tenderMustBeEvaluating(): self
  {
    return new self('Tender must be in evaluation status to award.');
  }

  public static function tenderExpired(): self
  {
    return new self('Cannot evaluate an expired tender.');
  }

  public static function bidderNotFound(int $supplierId): self
  {
    return new self("Supplier #{$supplierId} is not a bidder.");
  }

  public static function tenderAlreadyAwarded(): self
  {
    return new self('Tender has already been awarded.');
  }

  public static function tenderAlreadyCancelled(): self
  {
    return new self('Tender has already been cancelled.');
  }

  public static function cannotAwardCancelled(): self
  {
    return new self('Cannot award a cancelled tender.');
  }
}
