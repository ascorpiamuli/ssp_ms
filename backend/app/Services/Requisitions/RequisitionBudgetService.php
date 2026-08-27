<?php
// app/Services/Requisitions/RequisitionBudgetService.php

declare(strict_types=1);

namespace App\Services\Requisitions;

use App\Models\Requisition;
use App\Models\RequisitionBudget;
use App\Exceptions\Requisitions\BudgetException;
use App\Services\Admin\AuditLogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Requisition Budget Service
 *
 * Handles business logic for requisition budgets
 * No circular dependencies - independent service
 */
class RequisitionBudgetService
{
  /**
   * @var AuditLogService
   */
  protected AuditLogService $auditLogService;

  /**
   * Constructor
   */
  public function __construct(AuditLogService $auditLogService)
  {
    $this->auditLogService = $auditLogService;
  }

  /**
   * Get all budgets for a requisition
   *
   * @param int $requisitionId
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getByRequisitionId(int $requisitionId)
  {
    return RequisitionBudget::where('requisition_id', $requisitionId)
      ->with(['verifiedBy', 'authorizedBy'])
      ->orderBy('created_at')
      ->get();
  }

  /**
   * Get budget by ID
   *
   * @param int $id
   * @return RequisitionBudget
   * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
   */
  public function getById(int $id): RequisitionBudget
  {
    return RequisitionBudget::with(['requisition', 'verifiedBy', 'authorizedBy'])
      ->findOrFail($id);
  }

  /**
   * Get budget by requisition and budget code
   *
   * @param int $requisitionId
   * @param string $budgetCode
   * @return RequisitionBudget|null
   */
  public function getByRequisitionAndCode(int $requisitionId, string $budgetCode): ?RequisitionBudget
  {
    return RequisitionBudget::where('requisition_id', $requisitionId)
      ->where('budget_code', $budgetCode)
      ->first();
  }

  /**
   * Create a budget for requisition
   *
   * @param int $requisitionId
   * @param array $data
   * @return RequisitionBudget
   * @throws BudgetException
   */
  public function create(int $requisitionId, array $data): RequisitionBudget
  {
    try {
      DB::beginTransaction();

      $requisition = Requisition::findOrFail($requisitionId);

      // Check if budget already exists
      if ($requisition->budgets()->count() > 0) {
        throw new BudgetException('Budget already exists for this requisition');
      }

      // Validate budget allocation
      if (isset($data['allocated_amount']) && isset($data['requested_amount'])) {
        if ($data['requested_amount'] > $data['allocated_amount']) {
          throw new BudgetException('Requested amount cannot exceed allocated amount');
        }
      }

      // Calculate remaining amount
      $data['remaining_amount'] = ($data['allocated_amount'] ?? 0) - ($data['utilized_amount'] ?? 0);

      // Set default values
      $data['requisition_id'] = $requisitionId;
      $data['status'] = $data['status'] ?? 'pending';

      $budget = RequisitionBudget::create($data);

      // Update requisition budget fields
      $requisition->update([
        'budget_allocated' => $budget->allocated_amount,
        'budget_utilized' => $budget->utilized_amount ?? 0,
        'budget_code' => $budget->budget_code,
      ]);

      // Audit: Log budget creation
      $this->auditLogService->logModelCreated(
        $budget,
        "Budget created for requisition #{$requisitionId} - Code: {$budget->budget_code}"
      );

      // Log activity
      $this->logBudgetActivity(
        $requisitionId,
        'budget_created',
        null,
        $budget->toArray(),
        'Budget created'
      );

      DB::commit();

      return $budget->fresh();
    } catch (BudgetException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create budget: ' . $e->getMessage());
      throw new BudgetException('Failed to create budget: ' . $e->getMessage());
    }
  }

  /**
   * Update budget
   *
   * @param int $id
   * @param array $data
   * @return RequisitionBudget
   * @throws BudgetException
   */
  public function update(int $id, array $data): RequisitionBudget
  {
    try {
      DB::beginTransaction();

      $budget = $this->getById($id);
      $oldData = $budget->toArray();

      // Validate budget allocation
      if (isset($data['allocated_amount']) && isset($data['requested_amount'])) {
        if ($data['requested_amount'] > $data['allocated_amount']) {
          throw new BudgetException('Requested amount cannot exceed allocated amount');
        }
      }

      // Recalculate remaining amount
      if (isset($data['allocated_amount']) || isset($data['utilized_amount'])) {
        $allocated = $data['allocated_amount'] ?? $budget->allocated_amount;
        $utilized = $data['utilized_amount'] ?? $budget->utilized_amount;
        $data['remaining_amount'] = $allocated - $utilized;
      }

      $budget->update($data);

      // Update requisition budget fields
      $budget->requisition->update([
        'budget_allocated' => $budget->allocated_amount,
        'budget_utilized' => $budget->utilized_amount,
        'budget_code' => $budget->budget_code,
      ]);

      // Audit: Log budget update
      $this->auditLogService->logModelUpdated(
        $budget,
        $oldData,
        "Budget #{$budget->id} updated for requisition #{$budget->requisition_id}"
      );

      // Log activity
      $this->logBudgetActivity(
        $budget->requisition_id,
        'budget_updated',
        $oldData,
        $budget->toArray(),
        'Budget updated'
      );

      DB::commit();

      return $budget->fresh();
    } catch (BudgetException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to update budget: ' . $e->getMessage());
      throw new BudgetException('Failed to update budget: ' . $e->getMessage());
    }
  }

  /**
   * Delete budget
   *
   * @param int $id
   * @return bool
   * @throws BudgetException
   */
  public function delete(int $id): bool
  {
    try {
      DB::beginTransaction();

      $budget = $this->getById($id);

      // Check if budget can be deleted
      if ($budget->status !== 'pending') {
        throw new BudgetException('Only pending budgets can be deleted');
      }

      // Audit: Log budget deletion
      $this->auditLogService->logModelDeleted(
        $budget,
        "Budget #{$budget->id} deleted for requisition #{$budget->requisition_id}"
      );

      // Log activity
      $this->logBudgetActivity(
        $budget->requisition_id,
        'budget_deleted',
        $budget->toArray(),
        null,
        'Budget deleted'
      );

      $result = $budget->delete();

      // Update requisition budget fields
      $budget->requisition->update([
        'budget_allocated' => null,
        'budget_utilized' => 0,
        'budget_code' => null,
      ]);

      DB::commit();

      return $result;
    } catch (BudgetException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to delete budget: ' . $e->getMessage());
      throw new BudgetException('Failed to delete budget: ' . $e->getMessage());
    }
  }

  /**
   * Verify budget
   *
   * @param int $id
   * @param string|null $notes
   * @return RequisitionBudget
   * @throws BudgetException
   */
  public function verify(int $id, ?string $notes = null): RequisitionBudget
  {
    try {
      DB::beginTransaction();

      $budget = $this->getById($id);

      if ($budget->status !== 'pending') {
        throw new BudgetException('Budget is not pending verification');
      }

      $oldData = $budget->toArray();
      $budget->verify(Auth::id(), $notes);

      // Audit: Log budget verification
      $this->auditLogService->logModelUpdated(
        $budget,
        $oldData,
        "Budget #{$budget->id} verified for requisition #{$budget->requisition_id}" . ($notes ? " - Notes: {$notes}" : "")
      );

      // Log activity
      $this->logBudgetActivity(
        $budget->requisition_id,
        'budget_verified',
        $oldData,
        $budget->toArray(),
        $notes ?? 'Budget verified'
      );

      DB::commit();

      return $budget->fresh();
    } catch (BudgetException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to verify budget: ' . $e->getMessage());
      throw new BudgetException('Failed to verify budget: ' . $e->getMessage());
    }
  }

  /**
   * Approve budget
   *
   * @param int $id
   * @param string|null $notes
   * @return RequisitionBudget
   * @throws BudgetException
   */
  public function approve(int $id, ?string $notes = null): RequisitionBudget
  {
    try {
      DB::beginTransaction();

      $budget = $this->getById($id);

      if ($budget->status !== 'verified') {
        throw new BudgetException('Budget must be verified before approval');
      }

      $oldData = $budget->toArray();
      $budget->approve(Auth::id(), $notes);

      // Audit: Log budget approval
      $this->auditLogService->logModelUpdated(
        $budget,
        $oldData,
        "Budget #{$budget->id} approved for requisition #{$budget->requisition_id}" . ($notes ? " - Notes: {$notes}" : "")
      );

      // Log activity
      $this->logBudgetActivity(
        $budget->requisition_id,
        'budget_approved',
        $oldData,
        $budget->toArray(),
        $notes ?? 'Budget approved'
      );

      DB::commit();

      return $budget->fresh();
    } catch (BudgetException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to approve budget: ' . $e->getMessage());
      throw new BudgetException('Failed to approve budget: ' . $e->getMessage());
    }
  }

  /**
   * Reject budget
   *
   * @param int $id
   * @param string $reason
   * @return RequisitionBudget
   * @throws BudgetException
   */
  public function reject(int $id, string $reason): RequisitionBudget
  {
    try {
      DB::beginTransaction();

      $budget = $this->getById($id);

      if ($budget->status !== 'pending' && $budget->status !== 'verified') {
        throw new BudgetException('Cannot reject budget in current status');
      }

      $oldData = $budget->toArray();
      $budget->reject($reason);

      // Audit: Log budget rejection
      $this->auditLogService->logModelUpdated(
        $budget,
        $oldData,
        "Budget #{$budget->id} rejected for requisition #{$budget->requisition_id}. Reason: {$reason}"
      );

      // Log activity
      $this->logBudgetActivity(
        $budget->requisition_id,
        'budget_rejected',
        $oldData,
        $budget->toArray(),
        $reason
      );

      DB::commit();

      return $budget->fresh();
    } catch (BudgetException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to reject budget: ' . $e->getMessage());
      throw new BudgetException('Failed to reject budget: ' . $e->getMessage());
    }
  }

  /**
   * Get budget statistics
   *
   * @param array $filters
   * @return array
   */
  public function getStats(array $filters = []): array
  {
    $query = RequisitionBudget::query();

    if (!empty($filters['department_id'])) {
      $query->whereHas('requisition', function ($q) use ($filters) {
        $q->where('department_id', $filters['department_id']);
      });
    }

    if (!empty($filters['fiscal_year'])) {
      $query->where('fiscal_year', $filters['fiscal_year']);
    }

    if (!empty($filters['budget_code'])) {
      $query->where('budget_code', $filters['budget_code']);
    }

    return [
      'total_allocated' => (float) (clone $query)->sum('allocated_amount'),
      'total_utilized' => (float) (clone $query)->sum('utilized_amount'),
      'total_remaining' => (float) (clone $query)->sum('remaining_amount'),
      'total_requested' => (float) (clone $query)->sum('requested_amount'),
      'count' => (clone $query)->count(),
      'by_status' => (clone $query)->select('status', DB::raw('count(*) as count'))
        ->groupBy('status')
        ->get()
        ->pluck('count', 'status')
        ->toArray(),
      'by_budget_type' => (clone $query)->select('budget_type', DB::raw('count(*) as count'))
        ->groupBy('budget_type')
        ->get()
        ->pluck('count', 'budget_type')
        ->toArray(),
      'by_fiscal_year' => (clone $query)->select('fiscal_year', DB::raw('count(*) as count'))
        ->groupBy('fiscal_year')
        ->get()
        ->pluck('count', 'fiscal_year')
        ->toArray(),
    ];
  }

  /**
   * Get fiscal years
   *
   * @return array
   */
  public function getFiscalYears(): array
  {
    return RequisitionBudget::select('fiscal_year')
      ->whereNotNull('fiscal_year')
      ->distinct()
      ->orderBy('fiscal_year', 'desc')
      ->pluck('fiscal_year')
      ->toArray();
  }

  /**
   * Get budget utilization by department
   *
   * @param int $departmentId
   * @param string|null $fiscalYear
   * @return array
   */
  public function getUtilizationByDepartment(int $departmentId, ?string $fiscalYear = null): array
  {
    $query = RequisitionBudget::whereHas('requisition', function ($q) use ($departmentId) {
      $q->where('department_id', $departmentId);
    });

    if ($fiscalYear) {
      $query->where('fiscal_year', $fiscalYear);
    }

    $budgets = $query->get();

    return [
      'total_allocated' => $budgets->sum('allocated_amount'),
      'total_utilized' => $budgets->sum('utilized_amount'),
      'total_remaining' => $budgets->sum('remaining_amount'),
      'utilization_percentage' => $budgets->sum('allocated_amount') > 0
        ? round(($budgets->sum('utilized_amount') / $budgets->sum('allocated_amount')) * 100, 2)
        : 0,
      'budgets' => $budgets->map(function ($budget) {
        return [
          'budget_code' => $budget->budget_code,
          'allocated' => $budget->allocated_amount,
          'utilized' => $budget->utilized_amount,
          'remaining' => $budget->remaining_amount,
          'percentage' => $budget->allocated_amount > 0
            ? round(($budget->utilized_amount / $budget->allocated_amount) * 100, 2)
            : 0,
        ];
      }),
    ];
  }

  /**
   * Check if budget has sufficient funds
   *
   * @param int $id
   * @param float $amount
   * @return bool
   * @throws BudgetException
   */
  public function hasSufficientFunds(int $id, float $amount): bool
  {
    $budget = $this->getById($id);
    return $budget->remaining_amount >= $amount;
  }

  /**
   * Reserve budget amount
   *
   * @param int $id
   * @param float $amount
   * @return RequisitionBudget
   * @throws BudgetException
   */
  public function reserveAmount(int $id, float $amount): RequisitionBudget
  {
    try {
      DB::beginTransaction();

      $budget = $this->getById($id);

      if ($budget->status !== 'approved') {
        throw new BudgetException('Only approved budgets can reserve funds');
      }

      if (!$this->hasSufficientFunds($id, $amount)) {
        throw new BudgetException('Insufficient budget funds');
      }

      $oldData = $budget->toArray();

      // Update utilized amount
      $newUtilized = $budget->utilized_amount + $amount;
      $budget->update([
        'utilized_amount' => $newUtilized,
        'remaining_amount' => $budget->allocated_amount - $newUtilized,
      ]);

      // Check if budget is exhausted
      if ($budget->remaining_amount <= 0) {
        $budget->markAsExhausted();
      }

      // Audit: Log budget reserve
      $this->auditLogService->logModelUpdated(
        $budget,
        $oldData,
        "Budget #{$budget->id} reserved amount: {$amount} for requisition #{$budget->requisition_id}"
      );

      // Log activity
      $this->logBudgetActivity(
        $budget->requisition_id,
        'budget_reserved',
        $oldData,
        $budget->toArray(),
        "Reserved amount: {$amount}"
      );

      DB::commit();

      return $budget->fresh();
    } catch (BudgetException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to reserve budget amount: ' . $e->getMessage());
      throw new BudgetException('Failed to reserve budget amount: ' . $e->getMessage());
    }
  }

  /**
   * Release reserved budget amount
   *
   * @param int $id
   * @param float $amount
   * @return RequisitionBudget
   * @throws BudgetException
   */
  public function releaseAmount(int $id, float $amount): RequisitionBudget
  {
    try {
      DB::beginTransaction();

      $budget = $this->getById($id);

      if ($budget->status !== 'approved') {
        throw new BudgetException('Only approved budgets can release funds');
      }

      if ($budget->utilized_amount < $amount) {
        throw new BudgetException('Cannot release more than utilized amount');
      }

      $oldData = $budget->toArray();

      // Update utilized amount
      $newUtilized = $budget->utilized_amount - $amount;
      $budget->update([
        'utilized_amount' => $newUtilized,
        'remaining_amount' => $budget->allocated_amount - $newUtilized,
        'status' => 'approved', // Reset from exhausted if it was
      ]);

      // Audit: Log budget release
      $this->auditLogService->logModelUpdated(
        $budget,
        $oldData,
        "Budget #{$budget->id} released amount: {$amount} for requisition #{$budget->requisition_id}"
      );

      // Log activity
      $this->logBudgetActivity(
        $budget->requisition_id,
        'budget_released',
        $oldData,
        $budget->toArray(),
        "Released amount: {$amount}"
      );

      DB::commit();

      return $budget->fresh();
    } catch (BudgetException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to release budget amount: ' . $e->getMessage());
      throw new BudgetException('Failed to release budget amount: ' . $e->getMessage());
    }
  }

  /**
   * Log budget activity
   *
   * @param int $requisitionId
   * @param string $action
   * @param array|null $oldValues
   * @param array|null $newValues
   * @param string|null $comment
   * @return void
   */
  protected function logBudgetActivity(
    int $requisitionId,
    string $action,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null
  ): void {
    try {
      $historyService = app(RequisitionHistoryService::class);
      $historyService->log(
        $requisitionId,
        $action,
        $oldValues,
        $newValues,
        $comment
      );
    } catch (\Exception $e) {
      Log::warning('Failed to log budget activity: ' . $e->getMessage());
    }
  }

  /**
   * Get budget summary
   *
   * @param int $requisitionId
   * @return array
   */
  public function getSummary(int $requisitionId): array
  {
    $budgets = $this->getByRequisitionId($requisitionId);

    return [
      'total_allocated' => $budgets->sum('allocated_amount'),
      'total_utilized' => $budgets->sum('utilized_amount'),
      'total_remaining' => $budgets->sum('remaining_amount'),
      'total_requested' => $budgets->sum('requested_amount'),
      'count' => $budgets->count(),
      'budgets' => $budgets->map(function ($budget) {
        return [
          'id' => $budget->id,
          'budget_code' => $budget->budget_code,
          'allocated' => $budget->allocated_amount,
          'utilized' => $budget->utilized_amount,
          'remaining' => $budget->remaining_amount,
          'status' => $budget->status,
          'status_label' => $budget->status_label,
        ];
      }),
    ];
  }

  /**
   * Check if budget exists for requisition
   *
   * @param int $requisitionId
   * @return bool
   */
  public function existsForRequisition(int $requisitionId): bool
  {
    return RequisitionBudget::where('requisition_id', $requisitionId)->exists();
  }

  /**
   * Get budget by budget code
   *
   * @param string $budgetCode
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getByBudgetCode(string $budgetCode)
  {
    return RequisitionBudget::where('budget_code', $budgetCode)
      ->with(['requisition', 'verifiedBy', 'authorizedBy'])
      ->get();
  }

  /**
   * Get budgets by fiscal year
   *
   * @param string $fiscalYear
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getByFiscalYear(string $fiscalYear)
  {
    return RequisitionBudget::where('fiscal_year', $fiscalYear)
      ->with(['requisition.department'])
      ->orderBy('created_at', 'desc')
      ->get();
  }

  /**
   * Transfer budget between requisitions
   *
   * @param int $fromBudgetId
   * @param int $toRequisitionId
   * @param float $amount
   * @param string|null $reason
   * @return array
   * @throws BudgetException
   */
  public function transferBudget(
    int $fromBudgetId,
    int $toRequisitionId,
    float $amount,
    ?string $reason = null
  ): array {
    try {
      DB::beginTransaction();

      // Get source budget
      $sourceBudget = $this->getById($fromBudgetId);

      // Check if source has enough funds
      if (!$this->hasSufficientFunds($fromBudgetId, $amount)) {
        throw new BudgetException('Insufficient funds in source budget');
      }

      // Check if target requisition exists
      $targetRequisition = Requisition::findOrFail($toRequisitionId);

      // Check if target already has a budget
      if ($this->existsForRequisition($toRequisitionId)) {
        throw new BudgetException('Target requisition already has a budget');
      }

      // Create budget for target requisition
      $targetBudget = $this->create($toRequisitionId, [
        'budget_code' => $sourceBudget->budget_code . '-TRANSFER',
        'budget_line_item' => $sourceBudget->budget_line_item,
        'budget_category' => $sourceBudget->budget_category,
        'budget_type' => $sourceBudget->budget_type,
        'allocated_amount' => $amount,
        'utilized_amount' => 0,
        'requested_amount' => $amount,
        'fiscal_year' => $sourceBudget->fiscal_year,
        'fiscal_quarter' => $sourceBudget->fiscal_quarter,
        'status' => 'pending',
        'is_transferred' => true,
        'transferred_from' => $sourceBudget->budget_code,
      ]);

      // Update source budget
      $sourceBudget->update([
        'is_transferred' => true,
        'transferred_to' => $targetBudget->budget_code,
        'transferred_at' => now(),
      ]);

      // Release amount from source
      $this->releaseAmount($sourceBudget->id, $amount);

      // Audit: Log budget transfer
      $this->auditLogService->logUserAction(
        Auth::id(),
        'BUDGET_TRANSFERRED',
        'BUDGET',
        "Budget transferred from #{$sourceBudget->id} to #{$targetBudget->id} - Amount: {$amount}" . ($reason ? " - Reason: {$reason}" : ""),
        [
          'from_budget_id' => $sourceBudget->id,
          'to_budget_id' => $targetBudget->id,
          'amount' => $amount,
          'reason' => $reason,
        ]
      );

      DB::commit();

      return [
        'source_budget' => $sourceBudget->fresh(),
        'target_budget' => $targetBudget->fresh(),
      ];
    } catch (BudgetException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to transfer budget: ' . $e->getMessage());
      throw new BudgetException('Failed to transfer budget: ' . $e->getMessage());
    }
  }
}
