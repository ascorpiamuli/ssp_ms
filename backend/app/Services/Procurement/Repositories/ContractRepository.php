<?php
// app/Services/Procurement/Repositories/ContractRepository.php

declare(strict_types=1);

namespace App\Services\Procurement\Repositories;

use App\Models\Contract;
use App\Services\Procurement\Contracts\Repositories\ContractRepositoryInterface;
use App\Services\Procurement\Repositories\BaseRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class ContractRepository extends BaseRepository implements ContractRepositoryInterface
{
  public function __construct()
  {
    parent::__construct(new Contract());
  }

  public function findContract(int $id): ?Contract
  {
    return Contract::with([
      'requisition',
      'purchaseOrder',
      'supplier',
      'createdBy',
      'approvedBy'
    ])->find($id);
  }

  public function findContractOrFail(int $id): Contract
  {
    return Contract::with([
      'requisition',
      'purchaseOrder',
      'supplier',
      'createdBy',
      'approvedBy'
    ])->findOrFail($id);
  }

  public function getContractsForRequisition(int $requisitionId): array
  {
    return Contract::where('requisition_id', $requisitionId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getContractsForSupplier(int $supplierId): array
  {
    return Contract::where('supplier_id', $supplierId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getContractsForPurchaseOrder(int $purchaseOrderId): array
  {
    return Contract::where('purchase_order_id', $purchaseOrderId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getContractByNumber(string $contractNumber): ?Contract
  {
    return Contract::where('contract_number', $contractNumber)->first();
  }

  public function createContract(array $data): Contract
  {
    return Contract::create($data);
  }

  public function updateContract(int $id, array $data): Contract
  {
    $contract = $this->findContractOrFail($id);
    $contract->update($data);
    return $contract;
  }

  public function getActiveContracts(): array
  {
    return Contract::where('status', 'active')
      ->with(['supplier', 'requisition'])
      ->orderBy('end_date')
      ->get()
      ->toArray();
  }

  public function getDraftContracts(): array
  {
    return Contract::where('status', 'draft')
      ->with(['supplier', 'requisition'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function getCompletedContracts(): array
  {
    return Contract::where('status', 'completed')
      ->with(['supplier', 'requisition'])
      ->orderBy('completed_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getExpiredContracts(): array
  {
    return Contract::where('status', 'expired')
      ->orWhereDate('end_date', '<', now())
      ->with(['supplier', 'requisition'])
      ->orderBy('end_date')
      ->get()
      ->toArray();
  }

  public function getTerminatedContracts(): array
  {
    return Contract::where('status', 'terminated')
      ->with(['supplier', 'requisition'])
      ->orderBy('terminated_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getContractsExpiringSoon(int $days = 30): array
  {
    return Contract::where('status', 'active')
      ->whereDate('end_date', '<=', now()->addDays($days))
      ->whereDate('end_date', '>=', now())
      ->with(['supplier', 'requisition'])
      ->orderBy('end_date')
      ->get()
      ->toArray();
  }

  public function paginateContracts(int $perPage = 15): LengthAwarePaginator
  {
    return Contract::with(['supplier', 'requisition'])
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  public function getRenewableContracts(): array
  {
    return Contract::where('is_renewable', true)
      ->where('status', 'active')
      ->with(['supplier', 'requisition'])
      ->orderBy('end_date')
      ->get()
      ->toArray();
  }

  public function getContractsReadyForRenewal(): array
  {
    return Contract::where('is_renewable', true)
      ->where('status', 'active')
      ->where(function ($query) {
        $query->whereNull('next_renewal_date')
          ->orWhereDate('next_renewal_date', '<=', now()->addDays(30));
      })
      ->with(['supplier', 'requisition'])
      ->orderBy('end_date')
      ->get()
      ->toArray();
  }

  public function getContractStatistics(): array
  {
    return [
      'total' => Contract::count(),
      'draft' => Contract::where('status', 'draft')->count(),
      'active' => Contract::where('status', 'active')->count(),
      'completed' => Contract::where('status', 'completed')->count(),
      'expired' => Contract::where('status', 'expired')->count(),
      'terminated' => Contract::where('status', 'terminated')->count(),
      'suspended' => Contract::where('status', 'suspended')->count(),
      'total_value' => Contract::sum('contract_value'),
      'active_value' => Contract::where('status', 'active')->sum('contract_value'),
    ];
  }

  public function deleteContract(int $id): bool
  {
    $contract = $this->findContract($id);
    if (!$contract) {
      return false;
    }
    return $contract->delete();
  }
}
