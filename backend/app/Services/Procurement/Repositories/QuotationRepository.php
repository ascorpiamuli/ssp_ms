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

  public function getSupplierQuotationsForQtn(int $qtnId): array
  {
    return SupplierQuotation::where('quotation_request_id', $qtnId)
      ->with(['supplier', 'items'])
      ->orderBy('net_amount')
      ->get()
      ->toArray();
  }

  public function getLowestQuotationForQtn(int $qtnId): ?SupplierQuotation
  {
    return SupplierQuotation::where('quotation_request_id', $qtnId)
      ->where('status', 'submitted')
      ->where('verification_status', 'verified')
      ->orderBy('net_amount')
      ->first();
  }

  public function getQuotationsBySupplier(int $supplierId): array
  {
    return SupplierQuotation::where('supplier_id', $supplierId)
      ->with(['quotationRequest'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
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
}
