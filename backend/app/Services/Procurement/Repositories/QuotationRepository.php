<?php
// app/Services/Procurement/Repositories/QuotationRepository.php

declare(strict_types=1);

namespace App\Services\Procurement\Repositories;

use App\Models\QuotationRequest;
use App\Models\SupplierQuotation;
use App\Models\SupplierQuotationItem;
use App\Models\Upload;
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

  /**
   * Add upload relationship to supplier quotation query if pdf_upload_id exists
   */
  protected function withUploadIfExists($query)
  {
    return $query->with(['supplier', 'quotationRequest', 'items', 'pdfUpload']);
  }

  public function findQuotationRequest(int $id): ?QuotationRequest
  {
    return QuotationRequest::with(['requisition', 'supplierQuotations.supplier', 'supplierQuotations.pdfUpload', 'generatedBy'])
      ->find($id);
  }

  public function findQuotationRequestOrFail(int $id): QuotationRequest
  {
    return QuotationRequest::with(['requisition', 'supplierQuotations.supplier', 'supplierQuotations.pdfUpload', 'generatedBy'])
      ->findOrFail($id);
  }

  public function findSupplierQuotation(int $id): ?SupplierQuotation
  {
    return SupplierQuotation::with(['quotationRequest', 'supplier', 'items', 'pdfUpload'])
      ->find($id);
  }

  public function findSupplierQuotationOrFail(int $id): SupplierQuotation
  {
    return SupplierQuotation::with(['quotationRequest', 'supplier', 'items', 'pdfUpload'])
      ->findOrFail($id);
  }

  public function getQuotationRequestsForRequisition(int $requisitionId): array
  {
    $requests = QuotationRequest::where('requisition_id', $requisitionId)
      ->with(['supplierQuotations.pdfUpload'])
      ->orderBy('created_at', 'desc')
      ->get();

    return $this->toArrayWithUploads($requests);
  }

  /**
   * Get all supplier quotations for a specific QTN (Quotation Request)
   *
   * @param int $qtnId The QTN ID
   * @return array Array of supplier quotations with supplier, items, and upload
   */
  public function getSupplierQuotationsForQtn(int $qtnId): array
  {
    $quotations = SupplierQuotation::where('quotation_request_id', $qtnId)
      ->with(['supplier', 'items', 'pdfUpload'])
      ->orderBy('net_amount')
      ->get();

    return $this->toArrayWithUploads($quotations);
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
      ->with(['pdfUpload'])
      ->orderBy('net_amount')
      ->first();
  }

  /**
   * Get all quotations for a specific supplier
   *
   * @param int $supplierId The supplier ID
   * @return array Array of supplier quotations with quotation request and upload
   */
  public function getQuotationsBySupplier(int $supplierId): array
  {
    $quotations = SupplierQuotation::where('supplier_id', $supplierId)
      ->with(['quotationRequest', 'items', 'pdfUpload'])
      ->orderBy('created_at', 'desc')
      ->get();

    return $this->toArrayWithUploads($quotations);
  }

  /**
   * Get all supplier quotations with optional filters
   *
   * @param array $filters Optional filters (status, verification_status, date range, etc.)
   * @return array Array of supplier quotations with upload data
   */
  public function getAllSupplierQuotations(array $filters = []): array
  {
    $query = SupplierQuotation::with(['supplier', 'quotationRequest', 'items', 'pdfUpload']);

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

    $quotations = $query->get();
    return $this->toArrayWithUploads($quotations);
  }

  /**
   * Get supplier quotations with pagination and filters
   *
   * @param int $perPage Number of items per page
   * @param array $filters Optional filters
   * @return LengthAwarePaginator Paginated results with upload data
   */
  public function paginateSupplierQuotations(int $perPage = 15, array $filters = []): LengthAwarePaginator
  {
    $query = SupplierQuotation::with(['supplier', 'quotationRequest', 'items', 'pdfUpload']);

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

    $paginator = $query->paginate($perPage);

    // Transform the items to include upload data
    $items = $this->toArrayWithUploads($paginator->items());
    $paginator->setCollection(collect($items));

    return $paginator;
  }

  /**
   * Convert collection to array with upload data included
   */
  protected function toArrayWithUploads($items): array
  {
    if ($items instanceof \Illuminate\Support\Collection) {
      $items = $items->toArray();
    }

    // If it's already an array, process each item
    if (is_array($items)) {
      foreach ($items as &$item) {
        $item = $this->addUploadData($item);
      }
    }

    return $items;
  }

  /**
   * Add upload data to a single item array if pdf_upload_id exists
   */
  protected function addUploadData(array $item): array
  {
    // Check if pdf_upload_id exists and is not null
    if (isset($item['pdf_upload_id']) && !empty($item['pdf_upload_id'])) {
      // If the upload relationship was loaded, get the upload data
      if (isset($item['pdf_upload']) && !empty($item['pdf_upload'])) {
        $item['upload'] = $item['pdf_upload'];
      } else {
        // Try to fetch the upload directly if not loaded
        $upload = Upload::find($item['pdf_upload_id']);
        if ($upload) {
          $item['upload'] = $upload->toArray();
        }
      }
    }

    // Remove the pdf_upload key from the item (it's already used)
    unset($item['pdf_upload']);

    return $item;
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
    $qtns = QuotationRequest::whereIn('status', ['sent', 'responded', 'evaluating'])
      ->with(['requisition', 'supplierQuotations.pdfUpload'])
      ->orderBy('closing_date')
      ->get();

    return $qtns->toArray();
  }

  public function getExpiredQtns(): array
  {
    $qtns = QuotationRequest::whereDate('closing_date', '<', now())
      ->whereNotIn('status', ['closed', 'cancelled'])
      ->with(['requisition', 'supplierQuotations.pdfUpload'])
      ->get();

    return $qtns->toArray();
  }

  public function getQtnsClosingSoon(int $days = 2): array
  {
    $qtns = QuotationRequest::whereDate('closing_date', '<=', now()->addDays($days))
      ->whereDate('closing_date', '>=', now())
      ->whereIn('status', ['sent', 'responded'])
      ->with(['requisition', 'supplierQuotations.pdfUpload'])
      ->get();

    return $qtns->toArray();
  }

  public function paginateQtns(int $perPage = 15): LengthAwarePaginator
  {
    $paginator = QuotationRequest::with(['requisition', 'generatedBy', 'supplierQuotations.pdfUpload'])
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);

    return $paginator;
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
    $quotations = SupplierQuotation::where('verification_status', 'pending')
      ->where('status', 'submitted')
      ->with(['quotationRequest', 'supplier', 'pdfUpload'])
      ->orderBy('created_at')
      ->get();

    return $this->toArrayWithUploads($quotations);
  }

  public function getQuotationsPendingEvaluation(): array
  {
    $quotations = SupplierQuotation::where('status', 'submitted')
      ->where('verification_status', 'verified')
      ->with(['quotationRequest', 'supplier', 'pdfUpload'])
      ->orderBy('created_at')
      ->get();

    return $this->toArrayWithUploads($quotations);
  }

  public function getSupplierQuotationWithItems(int $quotationId): SupplierQuotation
  {
    return SupplierQuotation::with(['items', 'supplier', 'quotationRequest', 'pdfUpload'])
      ->findOrFail($quotationId);
  }

  /**
   * Get supplier quotations by status
   *
   * @param string $status The status to filter by
   * @return array Array of supplier quotations with upload data
   */
  public function getQuotationsByStatus(string $status): array
  {
    $quotations = SupplierQuotation::where('status', $status)
      ->with(['supplier', 'quotationRequest', 'pdfUpload'])
      ->orderBy('created_at', 'desc')
      ->get();

    return $this->toArrayWithUploads($quotations);
  }

  /**
   * Get verified quotations
   *
   * @return array Array of verified supplier quotations with upload data
   */
  public function getVerifiedQuotations(): array
  {
    $quotations = SupplierQuotation::where('verification_status', 'verified')
      ->where('status', 'submitted')
      ->with(['supplier', 'quotationRequest', 'pdfUpload'])
      ->orderBy('net_amount')
      ->get();

    return $this->toArrayWithUploads($quotations);
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
      ->with(['pdfUpload'])
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
   * @return array Array of supplier quotations with upload data
   */
  public function getQuotationsByDateRange(string $startDate, string $endDate): array
  {
    $quotations = SupplierQuotation::whereDate('submission_date', '>=', $startDate)
      ->whereDate('submission_date', '<=', $endDate)
      ->with(['supplier', 'quotationRequest', 'pdfUpload'])
      ->orderBy('submission_date')
      ->get();

    return $this->toArrayWithUploads($quotations);
  }

  /**
   * Get quotations with total amount range
   *
   * @param float $minAmount Minimum amount
   * @param float $maxAmount Maximum amount
   * @return array Array of supplier quotations with upload data
   */
  public function getQuotationsByAmountRange(float $minAmount, float $maxAmount): array
  {
    $quotations = SupplierQuotation::where('net_amount', '>=', $minAmount)
      ->where('net_amount', '<=', $maxAmount)
      ->where('status', 'submitted')
      ->where('verification_status', 'verified')
      ->with(['supplier', 'quotationRequest', 'pdfUpload'])
      ->orderBy('net_amount')
      ->get();

    return $this->toArrayWithUploads($quotations);
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
