<?php
// app/Services/Procurement/Contracts/Services/ContractServiceInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Services;

use App\Models\Contract;
use App\Services\Procurement\DTOs\ContractDTO;

interface ContractServiceInterface
{
  /**
   * Create a contract.
   */
  public function createContract(ContractDTO $dto): Contract;

  /**
   * Get a contract by ID.
   */
  public function getContract(int $contractId): Contract;

  /**
   * Get all contracts for a requisition.
   */
  public function getContractsForRequisition(int $requisitionId): array;

  /**
   * Get all contracts for a supplier.
   */
  public function getContractsForSupplier(int $supplierId): array;

  /**
   * Approve a contract.
   */
  public function approveContract(int $contractId, int $userId): Contract;

  /**
   * Activate a contract.
   */
  public function activateContract(int $contractId): Contract;

  /**
   * Complete a contract.
   */
  public function completeContract(int $contractId): Contract;

  /**
   * Terminate a contract.
   */
  public function terminateContract(int $contractId, string $reason): Contract;

  /**
   * Suspend a contract.
   */
  public function suspendContract(int $contractId, string $reason): Contract;

  /**
   * Renew a contract.
   */
  public function renewContract(int $contractId): Contract;

  /**
   * Get contract summary.
   */
  public function getContractSummary(int $contractId): array;

  /**
   * Generate contract PDF.
   */
  public function generateContractPdf(int $contractId): string;

  /**
   * Get contracts expiring soon.
   */
  public function getExpiringContracts(int $days = 30): array;

  /**
   * Get active contracts.
   */
  public function getActiveContracts(): array;

  /**
   * Get contracts ready for renewal.
   */
  public function getContractsReadyForRenewal(): array;

  /**
   * Check if contract is renewable.
   */
  public function isContractRenewable(int $contractId): bool;

  /**
   * Check if contract can be renewed.
   */
  public function canRenewContract(int $contractId): bool;
}
