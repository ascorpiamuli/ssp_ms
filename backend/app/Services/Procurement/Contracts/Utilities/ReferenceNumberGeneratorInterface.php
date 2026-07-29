<?php
// app/Services/Procurement/Contracts/Utilities/ReferenceNumberGeneratorInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Utilities;

interface ReferenceNumberGeneratorInterface
{
  /**
   * Generate a QTN number.
   */
  public function generateQtnNumber(): string;

  /**
   * Generate a supplier quotation number.
   */
  public function generateSupplierQuotationNumber(): string;

  /**
   * Generate a purchase order number (LPO or LSO).
   */
  public function generatePoNumber(string $type): string;

  /**
   * Generate a GRN number.
   */
  public function generateGrnNumber(): string;

  /**
   * Generate a SAN number.
   */
  public function generateSanNumber(): string;

  /**
   * Generate an invoice number.
   */
  public function generateInvoiceNumber(): string;

  /**
   * Generate a payment voucher number.
   */
  public function generateVoucherNumber(): string;

  /**
   * Generate a cheque number.
   */
  public function generateChequeNumber(): string;

  /**
   * Generate a contract number.
   */
  public function generateContractNumber(): string;

  /**
   * Generate a tender number.
   */
  public function generateTenderNumber(): string;

  /**
   * Generate a generic reference number.
   */
  public function generateNumber(string $prefix, string $modelClass, array $filters = []): string;

  /**
   * Set the format for a specific reference type.
   */
  public function setFormat(string $type, array $format): void;

  /**
   * Get the format for a specific reference type.
   */
  public function getFormat(string $type): array;

  /**
   * Get the next sequence number for a model.
   */
  public function getNextSequence(string $modelClass, array $filters = []): int;

  /**
   * Reset the sequence for a model (admin only).
   */
  public function resetSequence(string $modelClass, int $start = 1): void;
}
