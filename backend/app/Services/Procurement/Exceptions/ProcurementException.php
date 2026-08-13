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

  /**
   * Thrown when attempting to complete procurement but not all steps are complete
   */
  public static function procurementNotComplete(): self
  {
    return new self('Cannot complete procurement. Not all procurement steps have been completed.');
  }

  /**
   * Thrown when attempting to complete procurement but payment is not processed
   */
  public static function paymentNotProcessed(): self
  {
    return new self('Cannot complete procurement. Payment has not been processed.');
  }

  /**
   * Thrown when attempting to complete procurement but goods not received
   */
  public static function goodsNotReceived(): self
  {
    return new self('Cannot complete procurement. Goods/Services have not been received.');
  }

  /**
   * Thrown when attempting to complete procurement but invoice not approved
   */
  public static function invoiceNotApproved(): self
  {
    return new self('Cannot complete procurement. Invoice has not been approved.');
  }

  /**
   * Thrown when attempting to complete procurement but PO not generated
   */
  public static function purchaseOrderNotGenerated(): self
  {
    return new self('Cannot complete procurement. Purchase Order has not been generated.');
  }

  /**
   * Thrown when attempting to start procurement but requisition is already in procurement
   */
  public static function requisitionInProcurement(): self
  {
    return new self('This requisition is already in procurement process.');
  }

  public static function unauthorizedAction(string $action): self
  {
    return new self("You are not authorized to perform this action: {$action}.");
  }

  public static function invalidStatusTransition(string $from, string $to): self
  {
    return new self("Cannot transition from {$from} to {$to}.");
  }

  /**
   * Thrown when attempting to close a QTN that is already closed
   */
  public static function qtnAlreadyClosed(): self
  {
    return new self('This Quotation Request is already closed.');
  }

  /**
   * Thrown when attempting to close a QTN that has no responses
   */
  public static function qtnNoResponses(): self
  {
    return new self('Cannot close Quotation Request. No supplier responses received.');
  }

  /**
   * Thrown when attempting to select a supplier that hasn't responded
   */
  public static function supplierNotResponded(int $supplierId): self
  {
    return new self("Supplier #{$supplierId} has not submitted a quotation.");
  }

  /**
   * Thrown when attempting to select a supplier that is blacklisted
   */
  public static function supplierBlacklisted(int $supplierId): self
  {
    return new self("Supplier #{$supplierId} is blacklisted and cannot be selected.");
  }

  /**
   * Thrown when attempting to select a supplier with invalid quotation
   */
  public static function supplierQuotationInvalid(int $supplierId): self
  {
    return new self("Supplier #{$supplierId} quotation is invalid or expired.");
  }

  /**
   * Thrown when attempting to generate PO without selected supplier
   */
  public static function noSupplierSelected(): self
  {
    return new self('Cannot generate Purchase Order. No supplier has been selected.');
  }

  /**
   * Thrown when attempting to generate PO with no QTN
   */
  public static function noQuotationRequest(): self
  {
    return new self('Cannot generate Purchase Order. No Quotation Request exists.');
  }

  /**
   * Thrown when attempting to receive goods without PO
   */
  public static function noPurchaseOrder(): self
  {
    return new self('Cannot receive goods. No Purchase Order exists.');
  }

  /**
   * Thrown when attempting to process payment without invoice
   */
  public static function noInvoice(): self
  {
    return new self('Cannot process payment. No invoice has been submitted.');
  }

  /**
   * Thrown when attempting to process payment without GRN
   */
  public static function noGoodsReceived(): self
  {
    return new self('Cannot process payment. Goods have not been received.');
  }
}
