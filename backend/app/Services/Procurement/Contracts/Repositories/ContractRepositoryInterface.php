<?php
// app/Services/Procurement/Contracts/Repositories/ContractRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Repositories;

use App\Models\Contract;
use Illuminate\Pagination\LengthAwarePaginator;

interface ContractRepositoryInterface
{
  /**
   * Find a contract by ID.
   */
  public function findContract(int $id): ?Contract;

  /**
   * Find a contract by ID or fail.
   */
  public function findContractOrFail(int $id): Contract;

  /**
   * Get all contracts for a requisition.
   */
  public function getContractsForRequisition(int $requisitionId): array;

  /**
   * Get all contracts for a supplier.
   */
  public function getContractsForSupplier(int $supplierId): array;

  /**
   * Get all contracts for a purchase order.
   */
  public function getContractsForPurchaseOrder(int $purchaseOrderId): array;

  /**
   * Get a contract by number.
   */
  public function getContractByNumber(string $contractNumber): ?Contract;

  /**
   * Create a contract.
   */
  public function createContract(array $data): Contract;

  /**
   * Update a contract.
   */
  public function updateContract(int $id, array $data): Contract;

  /**
   * Get active contracts.
   */
  public function getActiveContracts(): array;

  /**
   * Get draft contracts.
   */
  public function getDraftContracts(): array;

  /**
   * Get completed contracts.
   */
  public function getCompletedContracts(): array;

  /**
   * Get expired contracts.
   */
  public function getExpiredContracts(): array;

  /**
   * Get terminated contracts.
   */
  public function getTerminatedContracts(): array;

  /**
   * Get contracts expiring soon.
   */
  public function getContractsExpiringSoon(int $days = 30): array;

  /**
   * Paginate contracts.
   */
  public function paginateContracts(int $perPage = 15): LengthAwarePaginator;

  /**
   * Get renewable contracts.
   */
  public function getRenewableContracts(): array;

  /**
   * Get contracts ready for renewal.
   */
  public function getContractsReadyForRenewal(): array;

  /**
   * Get contract statistics.
   */
  public function getContractStatistics(): array;

  /**
   * Delete a contract.
   */
  public function deleteContract(int $id): bool;
}
