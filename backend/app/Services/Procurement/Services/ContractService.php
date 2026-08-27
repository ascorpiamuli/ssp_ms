<?php
// app/Services/Procurement/Services/ContractService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\Requisition;
use App\Models\Contract;
use App\Services\Procurement\Base\BaseService;
use App\Services\Procurement\Contracts\Services\ContractServiceInterface;
use App\Services\Procurement\Contracts\Repositories\ContractRepositoryInterface;
use App\Services\Procurement\Contracts\Utilities\ReferenceNumberGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\PdfGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\DTOs\ContractDTO;
use App\Services\Procurement\Exceptions\ContractException;
use App\Services\Admin\AuditLogService;

class ContractService extends BaseService implements ContractServiceInterface
{
  public function __construct(
    protected ContractRepositoryInterface $repository,
    protected ReferenceNumberGeneratorInterface $referenceGenerator,
    protected PdfGeneratorInterface $pdfGenerator,
    protected NotificationDispatcherInterface $notificationDispatcher,
    protected AuditLogService $auditLogService
  ) {
    parent::__construct();
  }

  public function createContract(ContractDTO $dto): Contract
  {
    $requisition = Requisition::find($dto->requisitionId);

    if (!$requisition) {
      throw ContractException::requisitionNotFound($dto->requisitionId);
    }

    $existing = Contract::where('requisition_id', $requisition->id)
      ->whereNotIn('status', ['terminated'])
      ->first();

    if ($existing) {
      throw ContractException::contractAlreadyExists();
    }

    return $this->transaction(function () use ($requisition, $dto) {
      $contract = $this->repository->createContract([
        'requisition_id' => $requisition->id,
        'supplier_id' => $dto->supplierId,
        'purchase_order_id' => $dto->purchaseOrderId,
        'contract_number' => $dto->contractNumber ?? $this->referenceGenerator->generateContractNumber(),
        'title' => $dto->title,
        'description' => $dto->description,
        'start_date' => $dto->startDate->toDateString(),
        'end_date' => $dto->endDate->toDateString(),
        'contract_value' => $dto->contractValue,
        'terms_and_conditions' => $dto->termsAndConditions,
        'deliverables' => $dto->deliverables,
        'scope_of_work' => $dto->scopeOfWork,
        'payment_schedule' => $dto->paymentSchedule,
        'penalty_clauses' => $dto->penaltyClauses,
        'termination_clauses' => $dto->terminationClauses,
        'status' => 'draft',
        'created_by' => $this->getCurrentUserId(),
        'is_renewable' => $dto->isRenewable,
        'renewal_period_months' => $dto->renewalPeriodMonths,
        'metadata' => $dto->metadata,
      ]);

      // Audit: Log contract creation
      $this->auditLogService->logModelCreated(
        $contract,
        "Contract {$contract->contract_number} created for requisition #{$requisition->id}"
      );

      $this->notificationDispatcher->notify('contract_created', [
        'contract_id' => $contract->id,
        'contract_number' => $contract->contract_number,
        'supplier_id' => $contract->supplier_id,
        'requisition_id' => $requisition->id,
      ]);

      $this->logHistory(
        $requisition->id,
        'contract_created',
        'contract',
        $contract->id,
        null,
        ['contract_number' => $contract->contract_number],
        "Contract {$contract->contract_number} created"
      );

      return $contract;
    });
  }

  public function getContract(int $contractId): Contract
  {
    $contract = $this->repository->findContract($contractId);

    if (!$contract) {
      throw ContractException::contractNotFound($contractId);
    }

    return $contract;
  }

  public function getContractsForRequisition(int $requisitionId): array
  {
    return $this->repository->getContractsForRequisition($requisitionId);
  }

  public function getContractsForSupplier(int $supplierId): array
  {
    return $this->repository->getContractsForSupplier($supplierId);
  }

  public function approveContract(int $contractId, int $userId): Contract
  {
    $contract = $this->getContract($contractId);

    if ($contract->status !== 'draft') {
      throw ContractException::contractMustBeDraft();
    }

    return $this->transaction(function () use ($contract, $userId) {
      $oldValues = $contract->toArray();

      $contract->approve($userId);

      // Audit: Log contract approval
      $this->auditLogService->logModelUpdated(
        $contract,
        $oldValues,
        "Contract {$contract->contract_number} approved by user #{$userId}"
      );

      $this->notificationDispatcher->notify('contract_approved', [
        'contract_id' => $contract->id,
        'contract_number' => $contract->contract_number,
        'supplier_id' => $contract->supplier_id,
        'approved_by' => $userId,
      ]);

      $this->logHistory(
        $contract->requisition_id,
        'contract_approved',
        'contract',
        $contract->id,
        null,
        ['status' => 'active'],
        "Contract {$contract->contract_number} approved"
      );

      return $contract;
    });
  }

  public function activateContract(int $contractId): Contract
  {
    $contract = $this->getContract($contractId);

    if ($contract->status !== 'draft' && $contract->status !== 'active') {
      throw new \Exception('Contract can only be activated from draft or active status.');
    }

    return $this->transaction(function () use ($contract) {
      $oldValues = $contract->toArray();

      $contract->markAsActive();

      // Audit: Log contract activation
      $this->auditLogService->logModelUpdated(
        $contract,
        $oldValues,
        "Contract {$contract->contract_number} activated"
      );

      $this->notificationDispatcher->notify('contract_activated', [
        'contract_id' => $contract->id,
        'contract_number' => $contract->contract_number,
        'supplier_id' => $contract->supplier_id,
      ]);

      $this->logHistory(
        $contract->requisition_id,
        'contract_activated',
        'contract',
        $contract->id,
        null,
        ['status' => 'active'],
        "Contract {$contract->contract_number} activated"
      );

      return $contract;
    });
  }

  public function completeContract(int $contractId): Contract
  {
    $contract = $this->getContract($contractId);

    if ($contract->status !== 'active') {
      throw ContractException::contractMustBeActive();
    }

    return $this->transaction(function () use ($contract) {
      $oldValues = $contract->toArray();

      $contract->markAsCompleted();

      // Audit: Log contract completion
      $this->auditLogService->logModelUpdated(
        $contract,
        $oldValues,
        "Contract {$contract->contract_number} completed"
      );

      $this->logHistory(
        $contract->requisition_id,
        'contract_completed',
        'contract',
        $contract->id,
        null,
        ['status' => 'completed'],
        "Contract {$contract->contract_number} completed"
      );

      return $contract;
    });
  }

  public function terminateContract(int $contractId, string $reason): Contract
  {
    $contract = $this->getContract($contractId);

    if ($contract->status === 'completed' || $contract->status === 'terminated') {
      throw ContractException::contractCannotBeTerminated();
    }

    return $this->transaction(function () use ($contract, $reason) {
      $oldValues = $contract->toArray();

      $contract->markAsTerminated($reason);

      // Audit: Log contract termination
      $this->auditLogService->logModelUpdated(
        $contract,
        $oldValues,
        "Contract {$contract->contract_number} terminated. Reason: {$reason}"
      );

      $this->notificationDispatcher->notify('contract_terminated', [
        'contract_id' => $contract->id,
        'contract_number' => $contract->contract_number,
        'supplier_id' => $contract->supplier_id,
        'reason' => $reason,
      ]);

      $this->logHistory(
        $contract->requisition_id,
        'contract_terminated',
        'contract',
        $contract->id,
        null,
        ['status' => 'terminated'],
        "Contract {$contract->contract_number} terminated: {$reason}"
      );

      return $contract;
    });
  }

  public function suspendContract(int $contractId, string $reason): Contract
  {
    $contract = $this->getContract($contractId);

    if ($contract->status !== 'active') {
      throw ContractException::contractMustBeActive();
    }

    return $this->transaction(function () use ($contract, $reason) {
      $oldValues = $contract->toArray();

      $contract->markAsSuspended($reason);

      // Audit: Log contract suspension
      $this->auditLogService->logModelUpdated(
        $contract,
        $oldValues,
        "Contract {$contract->contract_number} suspended. Reason: {$reason}"
      );

      $this->logHistory(
        $contract->requisition_id,
        'contract_suspended',
        'contract',
        $contract->id,
        null,
        ['status' => 'suspended'],
        "Contract {$contract->contract_number} suspended: {$reason}"
      );

      return $contract;
    });
  }

  public function renewContract(int $contractId): Contract
  {
    $contract = $this->getContract($contractId);

    if (!$contract->isRenewable()) {
      throw ContractException::contractNotRenewable();
    }

    if (!$contract->canBeRenewed()) {
      throw ContractException::contractCannotBeRenewed();
    }

    return $this->transaction(function () use ($contract) {
      $oldValues = $contract->toArray();
      $oldEndDate = $contract->end_date->toDateString();

      $contract->renew();

      // Audit: Log contract renewal
      $this->auditLogService->logModelUpdated(
        $contract,
        $oldValues,
        "Contract {$contract->contract_number} renewed (Renewal #{$contract->renewal_count})"
      );

      $this->notificationDispatcher->notify('contract_renewed', [
        'contract_id' => $contract->id,
        'contract_number' => $contract->contract_number,
        'supplier_id' => $contract->supplier_id,
        'old_end_date' => $oldEndDate,
        'new_end_date' => $contract->end_date->toDateString(),
        'renewal_count' => $contract->renewal_count,
      ]);

      $this->logHistory(
        $contract->requisition_id,
        'contract_renewed',
        'contract',
        $contract->id,
        null,
        [
          'old_end_date' => $oldEndDate,
          'new_end_date' => $contract->end_date->toDateString(),
          'renewal_count' => $contract->renewal_count,
        ],
        "Contract {$contract->contract_number} renewed (Renewal #{$contract->renewal_count})"
      );

      return $contract;
    });
  }

  public function getContractSummary(int $contractId): array
  {
    $contract = $this->getContract($contractId);

    return [
      'contract' => [
        'id' => $contract->id,
        'contract_number' => $contract->contract_number,
        'title' => $contract->title,
        'status' => $contract->status_label,
        'value' => $contract->formatted_contract_value,
        'start_date' => $contract->formatted_start_date,
        'end_date' => $contract->formatted_end_date,
        'is_active' => $contract->is_active,
        'is_expired' => $contract->is_expired,
        'days_remaining' => $contract->days_remaining,
        'is_renewable' => $contract->is_renewable_label,
        'renewal_count' => $contract->renewal_count,
      ],
      'supplier' => [
        'id' => $contract->supplier_id,
        'name' => $contract->supplier_name,
        'email' => $contract->supplier?->email,
        'phone' => $contract->supplier?->phone,
      ],
      'terms' => [
        'scope_of_work' => $contract->scope_of_work,
        'deliverables' => $contract->deliverables,
        'payment_schedule' => $contract->payment_schedule,
        'penalty_clauses' => $contract->penalty_clauses,
        'termination_clauses' => $contract->termination_clauses,
      ],
      'approvals' => [
        'created_by' => $contract->createdBy?->full_name,
        'created_at' => $contract->created_at->toDateTimeString(),
        'approved_by' => $contract->approvedBy?->full_name,
        'approved_at' => $contract->approved_at?->toDateTimeString(),
      ],
      'timeline' => [
        'activated_at' => $contract->created_at->toDateTimeString(),
        'completed_at' => $contract->completed_at?->toDateTimeString(),
        'terminated_at' => $contract->terminated_at?->toDateTimeString(),
        'last_renewal' => $contract->last_renewal_date?->toDateString(),
        'next_renewal' => $contract->next_renewal_date?->toDateString(),
      ],
    ];
  }

  public function generateContractPdf(int $contractId): string
  {
    $contract = $this->getContract($contractId);
    return $this->pdfGenerator->generateContract($contract);
  }

  public function getExpiringContracts(int $days = 30): array
  {
    return $this->repository->getContractsExpiringSoon($days);
  }

  public function getActiveContracts(): array
  {
    return $this->repository->getActiveContracts();
  }

  public function getContractsReadyForRenewal(): array
  {
    return $this->repository->getContractsReadyForRenewal();
  }

  public function isContractRenewable(int $contractId): bool
  {
    $contract = $this->getContract($contractId);
    return $contract->isRenewable();
  }

  public function canRenewContract(int $contractId): bool
  {
    $contract = $this->getContract($contractId);
    return $contract->canBeRenewed();
  }

  /**
   * Log history.
   */
  protected function logHistory(
    int $requisitionId,
    string $action,
    string $entityType,
    int $entityId,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null
  ): void {
    \App\Models\ProcurementHistory::create([
      'requisition_id' => $requisitionId,
      'user_id' => $this->getCurrentUserId(),
      'action' => $action,
      'entity_type' => $entityType,
      'entity_id' => $entityId,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
