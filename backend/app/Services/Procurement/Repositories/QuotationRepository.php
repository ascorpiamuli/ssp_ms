<?php
// app/Services/Procurement/Repositories/QuotationRepository.php

declare(strict_types=1);

namespace App\Services\Procurement\Repositories;

use App\Models\QuotationRequest;
use App\Models\SupplierQuotation;
use App\Models\SupplierQuotationItem;
use App\Services\Procurement\Contracts\Repositories\QuotationRepositoryInterface;
use App\Services\Procurement\Repositories\BaseRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class QuotationRepository extends BaseRepository implements QuotationRepositoryInterface
{
  public function __construct()
  {
    parent::__construct(new QuotationRequest());
  }

  public function findQuotationRequest(int $id): ?QuotationRequest
  {
    return QuotationRequest::with(['requisition', 'supplierQuotations.supplier', 'generatedBy'])
      ->find($id);
  }

  public function findQuotationRequestOrFail(int $id): QuotationRequest
  {
    return QuotationRequest::with(['requisition', 'supplierQuotations.supplier', 'generatedBy'])
      ->findOrFail($id);
  }

  public function findSupplierQuotation(int $id): ?SupplierQuotation
  {
    return SupplierQuotation::with(['quotationRequest', 'supplier', 'items'])
      ->find($id);
  }

  public function findSupplierQuotationOrFail(int $id): SupplierQuotation
  {
    return SupplierQuotation::with(['quotationRequest', 'supplier', 'items'])
      ->findOrFail($id);
  }

  public function getQuotationRequestsForRequisition(int $requisitionId): array
  {
    return QuotationRequest::where('requisition_id', $requisitionId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  /**
   * Get all supplier quotations for a specific QTN (Quotation Request)
   *
   * @param int $qtnId The QTN ID
   * @return array Array of supplier quotations with supplier and items
   */
  public function getSupplierQuotationsForQtn(int $qtnId): array
  {
    return SupplierQuotation::where('quotation_request_id', $qtnId)
      ->with(['supplier', 'items'])
      ->orderBy('net_amount')
      ->get()
      ->toArray();
  }

  /**
   * Get the lowest quotation for a specific QTN
   *
   * @param int $qtnId The QTN ID
   * @return SupplierQuotation|null The lowest quotation or null if none found
   */
  public function getLowestQuotationForQtn(int $qtnId): ?SupplierQuotation
  {
    return SupplierQuotation::where('quotation_request_id', $qtnId)
      ->where('status', 'submitted')
      ->where('verification_status', 'verified')
      ->orderBy('net_amount')
      ->first();
  }

  /**
   * Get all quotations for a specific supplier
   *
   * @param int $supplierId The supplier ID
   * @return array Array of supplier quotations with quotation request
   */
  public function getQuotationsBySupplier(int $supplierId): array
  {
    return SupplierQuotation::where('supplier_id', $supplierId)
      ->with(['quotationRequest', 'items'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  /**
   * Get all supplier quotations with optional filters
   *
   * @param array $filters Optional filters (status, verification_status, date range, etc.)
   * @return array Array of supplier quotations
   */
  public function getAllSupplierQuotations(array $filters = []): array
  {
    $query = SupplierQuotation::with(['supplier', 'quotationRequest', 'items']);

    // Apply filters if provided
    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (!empty($filters['verification_status'])) {
      $query->where('verification_status', $filters['verification_status']);
    }

    if (!empty($filters['supplier_id'])) {
      $query->where('supplier_id', (int) $filters['supplier_id']);
    }

    if (!empty($filters['quotation_request_id'])) {
      $query->where('quotation_request_id', (int) $filters['quotation_request_id']);
    }

    if (!empty($filters['from_date'])) {
      $query->whereDate('submission_date', '>=', $filters['from_date']);
    }

    if (!empty($filters['to_date'])) {
      $query->whereDate('submission_date', '<=', $filters['to_date']);
    }

    if (!empty($filters['min_amount'])) {
      $query->where('net_amount', '>=', (float) $filters['min_amount']);
    }

    if (!empty($filters['max_amount'])) {
      $query->where('net_amount', '<=', (float) $filters['max_amount']);
    }

    // Sort results
    $sortBy = $filters['sort_by'] ?? 'created_at';
    $sortOrder = $filters['sort_order'] ?? 'desc';
    $query->orderBy($sortBy, $sortOrder);

    // Limit results if specified
    if (!empty($filters['limit'])) {
      $query->limit((int) $filters['limit']);
    }

    return $query->get()->toArray();
  }

  /**
   * Get supplier quotations with pagination and filters
   *
   * @param int $perPage Number of items per page
   * @param array $filters Optional filters
   * @return LengthAwarePaginator Paginated results
   */
  public function paginateSupplierQuotations(int $perPage = 15, array $filters = []): LengthAwarePaginator
  {
    $query = SupplierQuotation::with(['supplier', 'quotationRequest', 'items']);

    // Apply filters
    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (!empty($filters['verification_status'])) {
      $query->where('verification_status', $filters['verification_status']);
    }

    if (!empty($filters['supplier_id'])) {
      $query->where('supplier_id', (int) $filters['supplier_id']);
    }

    if (!empty($filters['quotation_request_id'])) {
      $query->where('quotation_request_id', (int) $filters['quotation_request_id']);
    }

    if (!empty($filters['from_date'])) {
      $query->whereDate('submission_date', '>=', $filters['from_date']);
    }

    if (!empty($filters['to_date'])) {
      $query->whereDate('submission_date', '<=', $filters['to_date']);
    }

    // Sort
    $sortBy = $filters['sort_by'] ?? 'created_at';
    $sortOrder = $filters['sort_order'] ?? 'desc';
    $query->orderBy($sortBy, $sortOrder);

    return $query->paginate($perPage);
  }

  public function createQuotationRequest(array $data): QuotationRequest
  {
    return QuotationRequest::create($data);
  }

  public function createSupplierQuotation(array $data): SupplierQuotation
  {
    return SupplierQuotation::create($data);
  }

  public function createSupplierQuotationItem(array $data): SupplierQuotationItem
  {
    return SupplierQuotationItem::create($data);
  }

  public function updateQuotationRequest(int $id, array $data): QuotationRequest
  {
    $qtn = $this->findQuotationRequestOrFail($id);
    $qtn->update($data);
    return $qtn;
  }

  public function updateSupplierQuotation(int $id, array $data): SupplierQuotation
  {
    $quotation = $this->findSupplierQuotationOrFail($id);
    $quotation->update($data);
    return $quotation;
  }

  public function getActiveQtns(): array
  {
    return QuotationRequest::whereIn('status', ['sent', 'responded', 'evaluating'])
      ->with(['requisition'])
      ->orderBy('closing_date')
      ->get()
      ->toArray();
  }

  public function getExpiredQtns(): array
  {
    return QuotationRequest::whereDate('closing_date', '<', now())
      ->whereNotIn('status', ['closed', 'cancelled'])
      ->with(['requisition'])
      ->get()
      ->toArray();
  }

  public function getQtnsClosingSoon(int $days = 2): array
  {
    return QuotationRequest::whereDate('closing_date', '<=', now()->addDays($days))
      ->whereDate('closing_date', '>=', now())
      ->whereIn('status', ['sent', 'responded'])
      ->with(['requisition'])
      ->get()
      ->toArray();
  }

  public function paginateQtns(int $perPage = 15): LengthAwarePaginator
  {
    return QuotationRequest::with(['requisition', 'generatedBy'])
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  public function hasSupplierResponded(int $qtnId, int $supplierId): bool
  {
    return SupplierQuotation::where('quotation_request_id', $qtnId)
      ->where('supplier_id', $supplierId)
      ->where('status', 'submitted')
      ->exists();
  }

  public function isSupplierInvited(int $qtnId, int $supplierId): bool
  {
    $qtn = $this->findQuotationRequest($qtnId);
    if (!$qtn) {
      return false;
    }
    $sentSuppliers = $qtn->sent_to_suppliers ?? [];
    return in_array($supplierId, $sentSuppliers);
  }

  public function getQuotationCountForQtn(int $qtnId): int
  {
    return SupplierQuotation::where('quotation_request_id', $qtnId)
      ->where('status', 'submitted')
      ->count();
  }

  public function getRespondedSupplierCount(int $qtnId): int
  {
    $qtn = $this->findQuotationRequest($qtnId);
    if (!$qtn) {
      return 0;
    }
    return count($qtn->responded_suppliers ?? []);
  }

  public function getQuotationsPendingVerification(): array
  {
    return SupplierQuotation::where('verification_status', 'pending')
      ->where('status', 'submitted')
      ->with(['quotationRequest', 'supplier'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function getQuotationsPendingEvaluation(): array
  {
    return SupplierQuotation::where('status', 'submitted')
      ->where('verification_status', 'verified')
      ->with(['quotationRequest', 'supplier'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function getSupplierQuotationWithItems(int $quotationId): SupplierQuotation
  {
    return SupplierQuotation::with(['items', 'supplier', 'quotationRequest'])
      ->findOrFail($quotationId);
  }

  /**
   * Get supplier quotations by status
   *
   * @param string $status The status to filter by
   * @return array Array of supplier quotations
   */
  public function getQuotationsByStatus(string $status): array
  {
    return SupplierQuotation::where('status', $status)
      ->with(['supplier', 'quotationRequest'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  /**
   * Get verified quotations
   *
   * @return array Array of verified supplier quotations
   */
  public function getVerifiedQuotations(): array
  {
    return SupplierQuotation::where('verification_status', 'verified')
      ->where('status', 'submitted')
      ->with(['supplier', 'quotationRequest'])
      ->orderBy('net_amount')
      ->get()
      ->toArray();
  }

  /**
   * Get the highest quotation for a specific QTN
   *
   * @param int $qtnId The QTN ID
   * @return SupplierQuotation|null The highest quotation or null if none found
   */
  public function getHighestQuotationForQtn(int $qtnId): ?SupplierQuotation
  {
    return SupplierQuotation::where('quotation_request_id', $qtnId)
      ->where('status', 'submitted')
      ->where('verification_status', 'verified')
      ->orderBy('net_amount', 'desc')
      ->first();
  }

  /**
   * Get the average quotation amount for a specific QTN
   *
   * @param int $qtnId The QTN ID
   * @return float The average amount or 0 if no quotations
   */
  public function getAverageQuotationForQtn(int $qtnId): float
  {
    return (float) SupplierQuotation::where('quotation_request_id', $qtnId)
      ->where('status', 'submitted')
      ->where('verification_status', 'verified')
      ->avg('net_amount') ?? 0;
  }

  /**
   * Count quotations by QTN and status
   *
   * @param int $qtnId The QTN ID
   * @param string $status The status to count
   * @return int Number of quotations
   */
  public function countQuotationsByStatus(int $qtnId, string $status): int
  {
    return SupplierQuotation::where('quotation_request_id', $qtnId)
      ->where('status', $status)
      ->count();
  }

  /**
   * Check if a quotation exists for a QTN and supplier
   *
   * @param int $qtnId The QTN ID
   * @param int $supplierId The supplier ID
   * @return bool True if quotation exists
   */
  public function quotationExistsForSupplier(int $qtnId, int $supplierId): bool
  {
    return SupplierQuotation::where('quotation_request_id', $qtnId)
      ->where('supplier_id', $supplierId)
      ->exists();
  }

  /**
   * Get quotations with date range filter
   *
   * @param string $startDate Start date (Y-m-d)
   * @param string $endDate End date (Y-m-d)
   * @return array Array of supplier quotations
   */
  public function getQuotationsByDateRange(string $startDate, string $endDate): array
  {
    return SupplierQuotation::whereDate('submission_date', '>=', $startDate)
      ->whereDate('submission_date', '<=', $endDate)
      ->with(['supplier', 'quotationRequest'])
      ->orderBy('submission_date')
      ->get()
      ->toArray();
  }

  /**
   * Get quotations with total amount range
   *
   * @param float $minAmount Minimum amount
   * @param float $maxAmount Maximum amount
   * @return array Array of supplier quotations
   */
  public function getQuotationsByAmountRange(float $minAmount, float $maxAmount): array
  {
    return SupplierQuotation::where('net_amount', '>=', $minAmount)
      ->where('net_amount', '<=', $maxAmount)
      ->where('status', 'submitted')
      ->where('verification_status', 'verified')
      ->with(['supplier', 'quotationRequest'])
      ->orderBy('net_amount')
      ->get()
      ->toArray();
  }

  /**
   * Get supplier quotation items for a specific quotation
   *
   * @param int $quotationId The quotation ID
   * @return Collection Collection of quotation items
   */
  public function getQuotationItems(int $quotationId): Collection
  {
    return SupplierQuotationItem::where('supplier_quotation_id', $quotationId)
      ->orderBy('created_at')
      ->get();
  }

  /**
   * Delete a supplier quotation (soft delete or hard delete based on implementation)
   *
   * @param int $id The quotation ID
   * @return bool True if deleted successfully
   */
  public function deleteSupplierQuotation(int $id): bool
  {
    $quotation = $this->findSupplierQuotation($id);
    if (!$quotation) {
      return false;
    }
    return (bool) $quotation->delete();
  }

  /**
   * Bulk update quotation status
   *
   * @param array $ids Array of quotation IDs
   * @param string $status New status
   * @return int Number of updated records
   */
  public function bulkUpdateQuotationStatus(array $ids, string $status): int
  {
    return SupplierQuotation::whereIn('id', $ids)
      ->update(['status' => $status]);
  }
}
