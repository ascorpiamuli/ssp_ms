<?php
// app/Services/Procurement/Contracts/Services/QuotationServiceInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Services;

use App\Models\QuotationRequest;
use App\Models\SupplierQuotation;
use App\Models\Requisition;
use App\Services\Procurement\DTOs\QuotationDTO;
use App\Services\Procurement\DTOs\SupplierQuotationDTO;

interface QuotationServiceInterface
{
  /**
   * Create a quotation request (QTN).
   */
  public function createQuotationRequest(QuotationDTO $dto): QuotationRequest;

  /**
   * Send QTN to selected suppliers.
   */
  public function sendQtnToSuppliers(int $qtnId, array $supplierIds): QuotationRequest;

  /**
   * Get a quotation request by ID.
   */
  public function getQuotationRequest(int $qtnId): QuotationRequest;

  /**
   * Submit a supplier quotation.
   */
  public function submitSupplierQuotation(SupplierQuotationDTO $dto): SupplierQuotation;

  /**
   * Verify a supplier quotation.
   */
  public function verifySupplierQuotation(int $quotationId, int $userId, string $status, ?string $notes = null): SupplierQuotation;

  /**
   * Evaluate a supplier quotation.
   */
  public function evaluateSupplierQuotation(int $quotationId, int $score, ?string $notes = null): SupplierQuotation;

  /**
   * Select a supplier for the requisition.
   */
  public function selectSupplier(int $requisitionId, int $supplierId, int $quotationId): Requisition;

  /**
   * Get the lowest quotation for a QTN.
   */
  public function getLowestQuotation(int $qtnId): ?SupplierQuotation;

  /**
   * Get all quotations for a QTN.
   */
  public function getQuotationsForQtn(int $qtnId): array;

  /**
   * Close a QTN.
   */
  public function closeQtn(int $qtnId, ?string $reason = null): QuotationRequest;

  /**
   * Cancel a QTN.
   */
  public function cancelQtn(int $qtnId, string $reason): QuotationRequest;

  /**
   * Send reminder to suppliers who haven't responded.
   */
  public function sendQtnReminder(int $qtnId): void;

  /**
   * Get QTN statistics.
   */
  public function getQtnStatistics(int $qtnId): array;

  /**
   * Check if a supplier is invited to a QTN.
   */
  public function isSupplierInvited(int $qtnId, int $supplierId): bool;

  /**
   * Check if a supplier has responded to a QTN.
   */
  public function hasSupplierResponded(int $qtnId, int $supplierId): bool;

  /**
   * Get a supplier quotation by ID.
   */
  public function getSupplierQuotation(int $quotationId): SupplierQuotation;

  /**
   * Update a quotation request.
   */
  public function updateQuotationRequest(int $qtnId, array $data): QuotationRequest;

  /**
   * Get all active QTNs.
   */
  public function getActiveQtns(): array;

  /**
   * Get QTNs closing soon.
   */
  public function getQtnsClosingSoon(int $days = 2): array;
}
