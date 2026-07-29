<?php
// app/Services/Procurement/Contracts/Repositories/QuotationRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Repositories;

use App\Models\QuotationRequest;
use App\Models\SupplierQuotation;
use App\Models\SupplierQuotationItem;
use Illuminate\Pagination\LengthAwarePaginator;

interface QuotationRepositoryInterface
{
  /**
   * Find a quotation request by ID.
   */
  public function findQuotationRequest(int $id): ?QuotationRequest;

  /**
   * Find a quotation request by ID or fail.
   */
  public function findQuotationRequestOrFail(int $id): QuotationRequest;

  /**
   * Find a supplier quotation by ID.
   */
  public function findSupplierQuotation(int $id): ?SupplierQuotation;

  /**
   * Find a supplier quotation by ID or fail.
   */
  public function findSupplierQuotationOrFail(int $id): SupplierQuotation;

  /**
   * Get all quotation requests for a requisition.
   */
  public function getQuotationRequestsForRequisition(int $requisitionId): array;

  /**
   * Get all supplier quotations for a QTN.
   */
  public function getSupplierQuotationsForQtn(int $qtnId): array;

  /**
   * Get the lowest quotation for a QTN.
   */
  public function getLowestQuotationForQtn(int $qtnId): ?SupplierQuotation;

  /**
   * Get all quotations by supplier.
   */
  public function getQuotationsBySupplier(int $supplierId): array;

  /**
   * Create a quotation request.
   */
  public function createQuotationRequest(array $data): QuotationRequest;

  /**
   * Create a supplier quotation.
   */
  public function createSupplierQuotation(array $data): SupplierQuotation;

  /**
   * Create a supplier quotation item.
   */
  public function createSupplierQuotationItem(array $data): SupplierQuotationItem;

  /**
   * Update a quotation request.
   */
  public function updateQuotationRequest(int $id, array $data): QuotationRequest;

  /**
   * Update a supplier quotation.
   */
  public function updateSupplierQuotation(int $id, array $data): SupplierQuotation;

  /**
   * Get all active QTNs.
   */
  public function getActiveQtns(): array;

  /**
   * Get all expired QTNs.
   */
  public function getExpiredQtns(): array;

  /**
   * Get QTNs closing soon.
   */
  public function getQtnsClosingSoon(int $days = 2): array;

  /**
   * Paginate QTNs.
   */
  public function paginateQtns(int $perPage = 15): LengthAwarePaginator;

  /**
   * Check if a supplier has responded to a QTN.
   */
  public function hasSupplierResponded(int $qtnId, int $supplierId): bool;

  /**
   * Check if a supplier is invited to a QTN.
   */
  public function isSupplierInvited(int $qtnId, int $supplierId): bool;

  /**
   * Get the total quotation count for a QTN.
   */
  public function getQuotationCountForQtn(int $qtnId): int;

  /**
   * Get the number of suppliers who have responded to a QTN.
   */
  public function getRespondedSupplierCount(int $qtnId): int;

  /**
   * Get all supplier quotations with verification pending.
   */
  public function getQuotationsPendingVerification(): array;

  /**
   * Get all supplier quotations with evaluation pending.
   */
  public function getQuotationsPendingEvaluation(): array;

  /**
   * Get supplier quotation with items.
   */
  public function getSupplierQuotationWithItems(int $quotationId): SupplierQuotation;
}
