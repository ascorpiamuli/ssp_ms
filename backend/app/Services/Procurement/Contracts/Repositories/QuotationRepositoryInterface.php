<?php
// app/Services/Procurement/Contracts/Repositories/QuotationRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Repositories;

use App\Models\QuotationRequest;
use App\Models\SupplierQuotation;
use App\Models\SupplierQuotationItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface QuotationRepositoryInterface
{
  /**
   * Find a quotation request by ID
   */
  public function findQuotationRequest(int $id): ?QuotationRequest;

  /**
   * Find a quotation request by ID or fail
   */
  public function findQuotationRequestOrFail(int $id): QuotationRequest;

  /**
   * Find a supplier quotation by ID
   */
  public function findSupplierQuotation(int $id): ?SupplierQuotation;

  /**
   * Find a supplier quotation by ID or fail
   */
  public function findSupplierQuotationOrFail(int $id): SupplierQuotation;

  /**
   * Get all quotation requests for a requisition
   */
  public function getQuotationRequestsForRequisition(int $requisitionId): array;

  /**
   * Get all supplier quotations for a specific QTN
   */
  public function getSupplierQuotationsForQtn(int $qtnId): array;

  /**
   * Get the lowest quotation for a specific QTN
   */
  public function getLowestQuotationForQtn(int $qtnId): ?SupplierQuotation;

  /**
   * Get all quotations for a specific supplier
   */
  public function getQuotationsBySupplier(int $supplierId): array;

  /**
   * Get all supplier quotations with optional filters
   */
  public function getAllSupplierQuotations(array $filters = []): array;

  /**
   * Create a new quotation request
   */
  public function createQuotationRequest(array $data): QuotationRequest;

  /**
   * Create a new supplier quotation
   */
  public function createSupplierQuotation(array $data): SupplierQuotation;

  /**
   * Create a new supplier quotation item
   */
  public function createSupplierQuotationItem(array $data): SupplierQuotationItem;

  /**
   * Update a quotation request
   */
  public function updateQuotationRequest(int $id, array $data): QuotationRequest;

  /**
   * Update a supplier quotation
   */
  public function updateSupplierQuotation(int $id, array $data): SupplierQuotation;

  /**
   * Get active QTNs
   */
  public function getActiveQtns(): array;

  /**
   * Get expired QTNs
   */
  public function getExpiredQtns(): array;

  /**
   * Get QTNs closing soon
   */
  public function getQtnsClosingSoon(int $days = 2): array;

  /**
   * Paginate QTNs
   */
  public function paginateQtns(int $perPage = 15): LengthAwarePaginator;

  /**
   * Check if a supplier has responded to a QTN
   */
  public function hasSupplierResponded(int $qtnId, int $supplierId): bool;

  /**
   * Check if a supplier is invited to a QTN
   */
  public function isSupplierInvited(int $qtnId, int $supplierId): bool;

  /**
   * Get quotation count for a QTN
   */
  public function getQuotationCountForQtn(int $qtnId): int;

  /**
   * Get responded supplier count for a QTN
   */
  public function getRespondedSupplierCount(int $qtnId): int;

  /**
   * Get quotations pending verification
   */
  public function getQuotationsPendingVerification(): array;

  /**
   * Get quotations pending evaluation
   */
  public function getQuotationsPendingEvaluation(): array;

  /**
   * Get supplier quotation with items
   */
  public function getSupplierQuotationWithItems(int $quotationId): SupplierQuotation;

  /**
   * Get supplier quotations by status
   */
  public function getQuotationsByStatus(string $status): array;

  /**
   * Get verified quotations
   */
  public function getVerifiedQuotations(): array;

  /**
   * Get the highest quotation for a specific QTN
   */
  public function getHighestQuotationForQtn(int $qtnId): ?SupplierQuotation;

  /**
   * Get the average quotation amount for a specific QTN
   */
  public function getAverageQuotationForQtn(int $qtnId): float;

  /**
   * Count quotations by QTN and status
   */
  public function countQuotationsByStatus(int $qtnId, string $status): int;

  /**
   * Check if a quotation exists for a QTN and supplier
   */
  public function quotationExistsForSupplier(int $qtnId, int $supplierId): bool;

  /**
   * Get quotations with date range filter
   */
  public function getQuotationsByDateRange(string $startDate, string $endDate): array;

  /**
   * Get quotations with total amount range
   */
  public function getQuotationsByAmountRange(float $minAmount, float $maxAmount): array;

  /**
   * Get supplier quotation items for a specific quotation
   */
  public function getQuotationItems(int $quotationId): Collection;

  /**
   * Delete a supplier quotation
   */
  public function deleteSupplierQuotation(int $id): bool;

  /**
   * Bulk update quotation status
   */
  public function bulkUpdateQuotationStatus(array $ids, string $status): int;

  /**
   * Paginate supplier quotations with filters
   */
  public function paginateSupplierQuotations(int $perPage = 15, array $filters = []): LengthAwarePaginator;
}
