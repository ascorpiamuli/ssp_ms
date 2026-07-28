<?php
// app/Services/Requisitions/ApprovalWorkflowService.php

declare(strict_types=1);

namespace App\Services\Requisitions;

use App\Models\ApprovalWorkflow;
use App\Models\Department;
use App\Models\User;
use App\Exceptions\Requisitions\WorkflowException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Approval Workflow Service
 *
 * Handles business logic for approval workflows
 * No circular dependencies - independent service
 */
class ApprovalWorkflowService
{
  /**
   * Get all workflows
   *
   * @param array $filters
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getAll(array $filters = [])
  {
    $query = ApprovalWorkflow::with(['department', 'createdBy', 'updatedBy']);

    if (!empty($filters['department_id'])) {
      $query->byDepartment((int) $filters['department_id']);
    }

    if (isset($filters['is_active'])) {
      $query->where('is_active', $filters['is_active']);
    }

    if (!empty($filters['search'])) {
      $query->where('name', 'like', "%{$filters['search']}%")
        ->orWhere('description', 'like', "%{$filters['search']}%");
    }

    return $query->orderBy('name')->get();
  }

  /**
   * Get workflow by ID
   *
   * @param int $id
   * @return ApprovalWorkflow
   * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
   */
  public function getById(int $id): ApprovalWorkflow
  {
    return ApprovalWorkflow::with(['department', 'createdBy', 'updatedBy'])
      ->findOrFail($id);
  }

  /**
   * Create a new workflow
   *
   * @param array $data
   * @return ApprovalWorkflow
   * @throws WorkflowException
   */
  public function create(array $data): ApprovalWorkflow
  {
    try {
      DB::beginTransaction();

      // Validate department
      $department = Department::find($data['department_id']);
      if (!$department) {
        throw new WorkflowException('Department not found');
      }

      // Validate approval levels
      $this->validateApprovalLevels($data['approval_levels'] ?? []);

      // If this is default, remove other defaults for department
      if ($data['is_default'] ?? false) {
        ApprovalWorkflow::where('department_id', $data['department_id'])
          ->where('is_default', true)
          ->update(['is_default' => false]);
      }

      $data['created_by'] = Auth::id();

      // Ensure approval_levels is array
      if (isset($data['approval_levels']) && is_string($data['approval_levels'])) {
        $data['approval_levels'] = json_decode($data['approval_levels'], true);
      }

      $workflow = ApprovalWorkflow::create($data);

      DB::commit();

      return $workflow->fresh();
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create workflow: ' . $e->getMessage());
      throw new WorkflowException('Failed to create workflow: ' . $e->getMessage());
    }
  }

  /**
   * Update workflow
   *
   * @param int $id
   * @param array $data
   * @return ApprovalWorkflow
   * @throws WorkflowException
   */
  public function update(int $id, array $data): ApprovalWorkflow
  {
    try {
      DB::beginTransaction();

      $workflow = $this->getById($id);

      // Validate approval levels if provided
      if (isset($data['approval_levels'])) {
        $this->validateApprovalLevels($data['approval_levels']);
      }

      // If this is default, remove other defaults for department
      if (isset($data['is_default']) && $data['is_default']) {
        ApprovalWorkflow::where('department_id', $workflow->department_id)
          ->where('id', '!=', $id)
          ->where('is_default', true)
          ->update(['is_default' => false]);
      }

      $data['updated_by'] = Auth::id();

      // Ensure approval_levels is array
      if (isset($data['approval_levels']) && is_string($data['approval_levels'])) {
        $data['approval_levels'] = json_decode($data['approval_levels'], true);
      }

      $workflow->update($data);

      DB::commit();

      return $workflow->fresh();
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to update workflow: ' . $e->getMessage());
      throw new WorkflowException('Failed to update workflow: ' . $e->getMessage());
    }
  }

  /**
   * Delete workflow
   *
   * @param int $id
   * @return bool
   * @throws WorkflowException
   */
  public function delete(int $id): bool
  {
    try {
      DB::beginTransaction();

      $workflow = $this->getById($id);

      // Check if workflow is in use
      if ($workflow->approvals()->count() > 0) {
        throw new WorkflowException('Cannot delete workflow that has approvals');
      }

      $result = $workflow->delete();

      DB::commit();

      return $result;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to delete workflow: ' . $e->getMessage());
      throw new WorkflowException('Failed to delete workflow: ' . $e->getMessage());
    }
  }

  /**
   * Get default workflow for department
   *
   * @param int $departmentId
   * @return ApprovalWorkflow|null
   */
  public function getDefaultForDepartment(int $departmentId): ?ApprovalWorkflow
  {
    return ApprovalWorkflow::where('department_id', $departmentId)
      ->where('is_default', true)
      ->where('is_active', true)
      ->first();
  }

  /**
   * Get workflow by amount
   *
   * @param int $departmentId
   * @param float $amount
   * @return ApprovalWorkflow|null
   */
  public function getByAmount(int $departmentId, float $amount): ?ApprovalWorkflow
  {
    return ApprovalWorkflow::active()
      ->byDepartment($departmentId)
      ->byAmount($amount)
      ->first();
  }

  /**
   * Clone workflow
   *
   * @param int $id
   * @param int $departmentId
   * @param string $name
   * @return ApprovalWorkflow
   * @throws WorkflowException
   */
  public function clone(int $id, int $departmentId, string $name): ApprovalWorkflow
  {
    try {
      DB::beginTransaction();

      $original = $this->getById($id);

      $data = $original->toArray();
      unset($data['id'], $data['created_at'], $data['updated_at'], $data['deleted_at']);

      $data['department_id'] = $departmentId;
      $data['name'] = $name;
      $data['is_default'] = false;
      $data['created_by'] = Auth::id();

      $workflow = ApprovalWorkflow::create($data);

      DB::commit();

      return $workflow->fresh();
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to clone workflow: ' . $e->getMessage());
      throw new WorkflowException('Failed to clone workflow: ' . $e->getMessage());
    }
  }

  /**
   * Validate workflow configuration
   *
   * @param array $data
   * @return array
   * @throws WorkflowException
   */
  public function validateConfiguration(array $data): array
  {
    $errors = [];

    // Validate approval levels
    if (empty($data['approval_levels']) || !is_array($data['approval_levels'])) {
      $errors[] = 'At least one approval level is required';
    } else {
      $this->validateApprovalLevels($data['approval_levels']);
    }

    // Validate thresholds
    if (isset($data['min_amount']) && isset($data['max_amount'])) {
      if ($data['min_amount'] > $data['max_amount']) {
        $errors[] = 'Minimum amount cannot be greater than maximum amount';
      }
    }

    // Validate SLA
    if (isset($data['sla_hours']) && $data['sla_hours'] < 1) {
      $errors[] = 'SLA hours must be at least 1';
    }

    if (isset($data['max_revisions']) && $data['max_revisions'] < 0) {
      $errors[] = 'Maximum revisions cannot be negative';
    }

    if (!empty($errors)) {
      throw new WorkflowException('Workflow validation failed: ' . implode(', ', $errors));
    }

    return $data;
  }

  /**
   * Validate approval levels
   *
   * @param array $levels
   * @return void
   * @throws WorkflowException
   */
  protected function validateApprovalLevels(array $levels): void
  {
    if (empty($levels)) {
      throw new WorkflowException('At least one approval level is required');
    }

    $validLevels = ['hod', 'accountant', 'principal', 'final'];
    $levelNames = array_column($levels, 'level');

    // Check for duplicate levels
    if (count($levelNames) !== count(array_unique($levelNames))) {
      throw new WorkflowException('Duplicate approval levels detected');
    }

    // Check for valid level values
    foreach ($levels as $level) {
      if (!in_array($level['level'], $validLevels)) {
        throw new WorkflowException("Invalid approval level: {$level['level']}");
      }
    }

    // Check for sequential ordering
    $orders = array_column($levels, 'order');
    $expectedOrder = range(1, count($orders));
    sort($orders);
    if ($orders !== $expectedOrder) {
      throw new WorkflowException('Approval levels must be in sequential order (1, 2, 3...)');
    }
  }

  /**
   * Toggle workflow status
   *
   * @param int $id
   * @param bool $status
   * @return ApprovalWorkflow
   * @throws WorkflowException
   */
  public function toggleStatus(int $id, bool $status): ApprovalWorkflow
  {
    try {
      DB::beginTransaction();

      $workflow = $this->getById($id);
      $workflow->update([
        'is_active' => $status,
        'updated_by' => Auth::id(),
      ]);

      DB::commit();

      return $workflow->fresh();
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to toggle workflow status: ' . $e->getMessage());
      throw new WorkflowException('Failed to toggle workflow status: ' . $e->getMessage());
    }
  }

  /**
   * Get workflows by department
   *
   * @param int $departmentId
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getByDepartment(int $departmentId)
  {
    return ApprovalWorkflow::where('department_id', $departmentId)
      ->orderBy('is_default', 'desc')
      ->orderBy('name')
      ->get();
  }

  /**
   * Get active workflows count
   *
   * @return int
   */
  public function getActiveCount(): int
  {
    return ApprovalWorkflow::where('is_active', true)->count();
  }

  /**
   * Get total workflows count
   *
   * @return int
   */
  public function getTotalCount(): int
  {
    return ApprovalWorkflow::count();
  }

  /**
   * Get workflow statistics
   *
   * @return array
   */
  public function getStats(): array
  {
    return [
      'total' => $this->getTotalCount(),
      'active' => $this->getActiveCount(),
      'inactive' => $this->getTotalCount() - $this->getActiveCount(),
      'by_department' => ApprovalWorkflow::select('department_id', DB::raw('count(*) as count'))
        ->groupBy('department_id')
        ->with('department:id,name')
        ->get()
        ->map(function ($item) {
          return [
            'department' => $item->department?->name ?? 'Unknown',
            'count' => $item->count,
          ];
        }),
    ];
  }

  /**
   * Check if workflow exists
   *
   * @param int $id
   * @return bool
   */
  public function exists(int $id): bool
  {
    return ApprovalWorkflow::where('id', $id)->exists();
  }

  /**
   * Get workflow by name and department
   *
   * @param string $name
   * @param int $departmentId
   * @return ApprovalWorkflow|null
   */
  public function getByNameAndDepartment(string $name, int $departmentId): ?ApprovalWorkflow
  {
    return ApprovalWorkflow::where('name', $name)
      ->where('department_id', $departmentId)
      ->first();
  }

  /**
   * Set workflow as default
   *
   * @param int $id
   * @return ApprovalWorkflow
   * @throws WorkflowException
   */
  public function setDefault(int $id): ApprovalWorkflow
  {
    try {
      DB::beginTransaction();

      $workflow = $this->getById($id);

      // Remove other defaults for same department
      ApprovalWorkflow::where('department_id', $workflow->department_id)
        ->where('id', '!=', $id)
        ->where('is_default', true)
        ->update(['is_default' => false]);

      $workflow->update([
        'is_default' => true,
        'updated_by' => Auth::id(),
      ]);

      DB::commit();

      return $workflow->fresh();
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to set workflow as default: ' . $e->getMessage());
      throw new WorkflowException('Failed to set workflow as default: ' . $e->getMessage());
    }
  }

  /**
   * Remove workflow from default
   *
   * @param int $id
   * @return ApprovalWorkflow
   * @throws WorkflowException
   */
  public function removeDefault(int $id): ApprovalWorkflow
  {
    try {
      DB::beginTransaction();

      $workflow = $this->getById($id);
      $workflow->update([
        'is_default' => false,
        'updated_by' => Auth::id(),
      ]);

      DB::commit();

      return $workflow->fresh();
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to remove workflow from default: ' . $e->getMessage());
      throw new WorkflowException('Failed to remove workflow from default: ' . $e->getMessage());
    }
  }
}
