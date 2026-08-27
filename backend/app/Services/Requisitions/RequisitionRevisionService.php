<?php
// app/Services/Requisitions/RequisitionRevisionService.php

declare(strict_types=1);

namespace App\Services\Requisitions;

use App\Models\Requisition;
use App\Models\RequisitionRevision;
use App\Models\ApprovalWorkflow;
use App\Exceptions\Requisitions\RevisionException;
use App\Services\Admin\AuditLogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Requisition Revision Service
 *
 * Handles business logic for requisition revisions
 * No circular dependencies - independent service
 */
class RequisitionRevisionService
{
  /**
   * @var RequisitionHistoryService
   */
  protected RequisitionHistoryService $historyService;

  /**
   * @var RequisitionService
   */
  protected RequisitionService $requisitionService;

  /**
   * @var AuditLogService
   */
  protected AuditLogService $auditLogService;

  /**
   * Constructor
   */
  public function __construct(
    RequisitionHistoryService $historyService,
    RequisitionService $requisitionService,
    AuditLogService $auditLogService
  ) {
    $this->historyService = $historyService;
    $this->requisitionService = $requisitionService;
    $this->auditLogService = $auditLogService;
    Log::info('🏗️ RequisitionRevisionService initialized');
  }

  /**
   * Get all revisions for a requisition
   *
   * @param int $requisitionId
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getByRequisitionId(int $requisitionId)
  {
    return RequisitionRevision::where('requisition_id', $requisitionId)
      ->with(['requestedBy', 'approvedBy', 'rejectedBy'])
      ->orderBy('revision_number', 'desc')
      ->get();
  }

  /**
   * Get revision by ID
   *
   * @param int $id
   * @return RequisitionRevision
   * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
   */
  public function getById(int $id): RequisitionRevision
  {
    return RequisitionRevision::with(['requisition', 'requestedBy', 'approvedBy', 'rejectedBy'])
      ->findOrFail($id);
  }

  /**
   * Get latest revision for a requisition
   *
   * @param int $requisitionId
   * @return RequisitionRevision|null
   */
  public function getLatest(int $requisitionId): ?RequisitionRevision
  {
    return RequisitionRevision::where('requisition_id', $requisitionId)
      ->orderBy('revision_number', 'desc')
      ->first();
  }

  /**
   * Create a revision request
   *
   * @param int $requisitionId
   * @param array $data
   * @return RequisitionRevision
   * @throws RevisionException
   */
  public function create(int $requisitionId, array $data): RequisitionRevision
  {
    try {
      DB::beginTransaction();

      $requisition = $this->requisitionService->getById($requisitionId);

      // Check if requisition can be revised
      if (!$requisition->canBeRevised()) {
        throw new RevisionException('Requisition cannot be revised in current status');
      }

      // Check max revisions
      $workflow = ApprovalWorkflow::where('department_id', $requisition->department_id)
        ->where('is_active', true)
        ->first();

      $maxRevisions = $workflow->max_revisions ?? 3;

      if ($requisition->revision_count >= $maxRevisions) {
        throw new RevisionException("Maximum revisions ({$maxRevisions}) reached");
      }

      // Get next revision number
      $nextRevisionNumber = $this->getNextRevisionNumber($requisitionId);

      // Create revision
      $revision = RequisitionRevision::create([
        'requisition_id' => $requisitionId,
        'requested_by' => Auth::id(),
        'revision_number' => $nextRevisionNumber,
        'revision_reason' => $data['reason'],
        'revision_notes' => $data['notes'] ?? null,
        'changes' => $data['changes'] ?? null,
        'status' => 'pending',
        'requested_at' => now(),
      ]);

      // Audit: Log revision creation
      $this->auditLogService->logModelCreated(
        $revision,
        "Revision #{$nextRevisionNumber} created for requisition #{$requisitionId} - Reason: {$data['reason']}"
      );

      // Update requisition
      $oldValues = $requisition->toArray();
      $requisition->update([
        'status' => 'revised',
        'revision_count' => $requisition->revision_count + 1,
        'last_revised_at' => now(),
        'last_revised_by' => Auth::id(),
        'revision_notes' => $data['notes'] ?? null,
        'revision_status' => 'pending',
      ]);

      // Audit: Log requisition status update
      $this->auditLogService->logModelUpdated(
        $requisition,
        $oldValues,
        "Requisition #{$requisitionId} status updated to 'revised' with revision #{$nextRevisionNumber}"
      );

      // Log activity
      $this->historyService->log(
        $requisitionId,
        'revised',
        ['status' => $requisition->getOriginal('status')],
        ['status' => 'revised', 'revision_number' => $nextRevisionNumber],
        $data['reason']
      );

      DB::commit();

      return $revision->fresh();
    } catch (RevisionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create revision: ' . $e->getMessage());
      throw new RevisionException('Failed to create revision: ' . $e->getMessage());
    }
  }

  /**
   * Approve revision
   *
   * @param int $id
   * @param string|null $notes
   * @return RequisitionRevision
   * @throws RevisionException
   */
  public function approve(int $id, ?string $notes = null): RequisitionRevision
  {
    try {
      DB::beginTransaction();

      $revision = $this->getById($id);

      if (!$revision->isPending()) {
        throw new RevisionException('Revision is not pending');
      }

      $oldData = $revision->toArray();
      $requisition = $revision->requisition;

      // Approve revision
      $revision->approve(Auth::id(), $notes);

      // Audit: Log revision approval
      $this->auditLogService->logModelUpdated(
        $revision,
        $oldData,
        "Revision #{$revision->revision_number} approved for requisition #{$requisition->id}" . ($notes ? " - Notes: {$notes}" : "")
      );

      // Update requisition
      $reqOldValues = $requisition->toArray();
      $requisition->update([
        'status' => 'submitted',
        'revision_status' => 'approved',
        'revision_notes' => $notes,
      ]);

      // Audit: Log requisition status update
      $this->auditLogService->logModelUpdated(
        $requisition,
        $reqOldValues,
        "Requisition #{$requisition->id} status updated to 'submitted' after revision approval"
      );

      // Create new approvals
      $approvalService = app(ApprovalService::class);
      $approvalService->createApprovals($requisition);

      // Log activity
      $this->historyService->log(
        $requisition->id,
        'revision_approved',
        ['revision_status' => 'pending'],
        ['revision_status' => 'approved'],
        $notes ?? 'Revision approved'
      );

      DB::commit();

      return $revision->fresh();
    } catch (RevisionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to approve revision: ' . $e->getMessage());
      throw new RevisionException('Failed to approve revision: ' . $e->getMessage());
    }
  }

  /**
   * Reject revision
   *
   * @param int $id
   * @param string $reason
   * @return RequisitionRevision
   * @throws RevisionException
   */
  public function reject(int $id, string $reason): RequisitionRevision
  {
    try {
      DB::beginTransaction();

      $revision = $this->getById($id);

      if (!$revision->isPending()) {
        throw new RevisionException('Revision is not pending');
      }

      $oldData = $revision->toArray();
      $requisition = $revision->requisition;

      // Reject revision
      $revision->reject(Auth::id(), $reason);

      // Audit: Log revision rejection
      $this->auditLogService->logModelUpdated(
        $revision,
        $oldData,
        "Revision #{$revision->revision_number} rejected for requisition #{$requisition->id}. Reason: {$reason}"
      );

      // Update requisition
      $reqOldValues = $requisition->toArray();
      $requisition->update([
        'revision_status' => 'rejected',
        'revision_notes' => $reason,
      ]);

      // Audit: Log requisition status update
      $this->auditLogService->logModelUpdated(
        $requisition,
        $reqOldValues,
        "Requisition #{$requisition->id} revision status updated to 'rejected'. Reason: {$reason}"
      );

      // Log activity
      $this->historyService->log(
        $requisition->id,
        'revision_rejected',
        ['revision_status' => 'pending'],
        ['revision_status' => 'rejected'],
        $reason
      );

      DB::commit();

      return $revision->fresh();
    } catch (RevisionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to reject revision: ' . $e->getMessage());
      throw new RevisionException('Failed to reject revision: ' . $e->getMessage());
    }
  }

  /**
   * Cancel revision
   *
   * @param int $id
   * @param string|null $reason
   * @return RequisitionRevision
   * @throws RevisionException
   */
  public function cancel(int $id, ?string $reason = null): RequisitionRevision
  {
    try {
      DB::beginTransaction();

      $revision = $this->getById($id);

      if (!$revision->isPending()) {
        throw new RevisionException('Cannot cancel processed revision');
      }

      $oldData = $revision->toArray();
      $requisition = $revision->requisition;

      // Cancel revision
      $revision->cancel($reason);

      // Audit: Log revision cancellation
      $this->auditLogService->logModelUpdated(
        $revision,
        $oldData,
        "Revision #{$revision->revision_number} cancelled for requisition #{$requisition->id}" . ($reason ? " - Reason: {$reason}" : "")
      );

      // Update requisition
      $reqOldValues = $requisition->toArray();
      $requisition->update([
        'revision_status' => 'cancelled',
        'revision_notes' => $reason ?? 'Revision cancelled',
      ]);

      // Audit: Log requisition status update
      $this->auditLogService->logModelUpdated(
        $requisition,
        $reqOldValues,
        "Requisition #{$requisition->id} revision status updated to 'cancelled'"
      );

      // Log activity
      $this->historyService->log(
        $requisition->id,
        'revision_cancelled',
        ['revision_status' => 'pending'],
        ['revision_status' => 'cancelled'],
        $reason ?? 'Revision cancelled'
      );

      DB::commit();

      return $revision->fresh();
    } catch (RevisionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to cancel revision: ' . $e->getMessage());
      throw new RevisionException('Failed to cancel revision: ' . $e->getMessage());
    }
  }

  /**
   * Get revision statistics
   *
   * @param int $requisitionId
   * @return array
   */
  public function getStats(int $requisitionId): array
  {
    $query = RequisitionRevision::where('requisition_id', $requisitionId);

    return [
      'total' => $query->count(),
      'pending' => (clone $query)->pending()->count(),
      'approved' => (clone $query)->approved()->count(),
      'rejected' => (clone $query)->rejected()->count(),
      'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
      'latest_revision_number' => (clone $query)->max('revision_number') ?? 0,
      'by_user' => (clone $query)->select('requested_by', DB::raw('count(*) as count'))
        ->groupBy('requested_by')
        ->with('requestedBy:id,first_name,last_name,email')
        ->get()
        ->map(function ($item) {
          return [
            'user' => $item->requestedBy?->full_name ?? 'Unknown',
            'count' => $item->count,
          ];
        }),
    ];
  }

  /**
   * Get next revision number
   *
   * @param int $requisitionId
   * @return int
   */
  public function getNextRevisionNumber(int $requisitionId): int
  {
    $lastRevision = RequisitionRevision::where('requisition_id', $requisitionId)
      ->orderBy('revision_number', 'desc')
      ->first();

    return $lastRevision ? $lastRevision->revision_number + 1 : 1;
  }

  /**
   * Check if requisition has pending revision
   *
   * @param int $requisitionId
   * @return bool
   */
  public function hasPendingRevision(int $requisitionId): bool
  {
    return RequisitionRevision::where('requisition_id', $requisitionId)
      ->where('status', 'pending')
      ->exists();
  }

  /**
   * Get revisions by status
   *
   * @param string $status
   * @param int|null $requisitionId
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getByStatus(string $status, ?int $requisitionId = null)
  {
    $query = RequisitionRevision::where('status', $status);

    if ($requisitionId) {
      $query->where('requisition_id', $requisitionId);
    }

    return $query->with(['requisition', 'requestedBy', 'approvedBy', 'rejectedBy'])
      ->orderBy('created_at', 'desc')
      ->get();
  }

  /**
   * Get revisions by user
   *
   * @param int $userId
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getByUser(int $userId)
  {
    return RequisitionRevision::where('requested_by', $userId)
      ->orWhere('approved_by', $userId)
      ->orWhere('rejected_by', $userId)
      ->with(['requisition'])
      ->orderBy('created_at', 'desc')
      ->get();
  }

  /**
   * Get revisions for a date range
   *
   * @param string $startDate
   * @param string $endDate
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getByDateRange(string $startDate, string $endDate)
  {
    return RequisitionRevision::whereBetween('created_at', [$startDate, $endDate])
      ->with(['requisition', 'requestedBy'])
      ->orderBy('created_at', 'desc')
      ->get();
  }

  /**
   * Get revision summary for dashboard
   *
   * @param array $filters
   * @return array
   */
  public function getSummary(array $filters = []): array
  {
    $query = RequisitionRevision::query();

    if (!empty($filters['department_id'])) {
      $query->whereHas('requisition', function ($q) use ($filters) {
        $q->where('department_id', $filters['department_id']);
      });
    }

    if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
      $query->whereBetween('created_at', [$filters['date_from'], $filters['date_to']]);
    }

    return [
      'total' => $query->count(),
      'pending' => (clone $query)->pending()->count(),
      'approved' => (clone $query)->approved()->count(),
      'rejected' => (clone $query)->rejected()->count(),
      'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
      'avg_response_time' => $this->calculateAvgResponseTime($query),
    ];
  }

  /**
   * Calculate average response time for revisions
   *
   * @param \Illuminate\Database\Eloquent\Builder $query
   * @return float|null
   */
  protected function calculateAvgResponseTime($query): ?float
  {
    $processed = (clone $query)
      ->whereIn('status', ['approved', 'rejected'])
      ->whereNotNull('approved_at')
      ->orWhereNotNull('rejected_at')
      ->get();

    if ($processed->isEmpty()) {
      return null;
    }

    $totalHours = 0;
    $count = 0;

    foreach ($processed as $revision) {
      $resolvedAt = $revision->approved_at ?? $revision->rejected_at;
      if ($resolvedAt) {
        $totalHours += $revision->created_at->diffInHours($resolvedAt);
        $count++;
      }
    }

    return $count > 0 ? round($totalHours / $count, 2) : null;
  }

  /**
   * Auto-approve revision if configured
   *
   * @param int $id
   * @return RequisitionRevision|null
   * @throws RevisionException
   */
  public function autoApprove(int $id): ?RequisitionRevision
  {
    try {
      DB::beginTransaction();

      $revision = $this->getById($id);
      $requisition = $revision->requisition;

      // Check if auto-approve is enabled
      $workflow = ApprovalWorkflow::where('department_id', $requisition->department_id)
        ->where('is_active', true)
        ->first();

      if (!$workflow || !$workflow->auto_approve_after_revision) {
        return null;
      }

      // Check if all changes are minor (e.g., only description changed)
      $changes = $revision->changes ?? [];
      $minorChanges = ['description', 'justification', 'required_by_date'];
      $isMinor = true;

      foreach ($changes as $field => $value) {
        if (!in_array($field, $minorChanges)) {
          $isMinor = false;
          break;
        }
      }

      if (!$isMinor) {
        return null;
      }

      // Auto-approve
      return $this->approve($id, 'Auto-approved (minor changes)');
    } catch (RevisionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to auto-approve revision: ' . $e->getMessage());
      throw new RevisionException('Failed to auto-approve revision: ' . $e->getMessage());
    }
  }

  /**
   * Get revision history for a requisition with pagination
   *
   * @param int $requisitionId
   * @param int $perPage
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getPaginated(int $requisitionId, int $perPage = 15)
  {
    return RequisitionRevision::where('requisition_id', $requisitionId)
      ->with(['requestedBy', 'approvedBy', 'rejectedBy'])
      ->orderBy('revision_number', 'desc')
      ->paginate($perPage);
  }

  /**
   * Compare revision changes
   *
   * @param int $revisionId
   * @return array
   * @throws RevisionException
   */
  public function compareChanges(int $revisionId): array
  {
    $revision = $this->getById($revisionId);
    $requisition = $revision->requisition;

    $changes = $revision->changes ?? [];
    $originalData = [];

    // Get original data before changes
    if (!empty($changes)) {
      foreach ($changes as $field => $newValue) {
        // Try to get original value from old_values if available
        $oldValue = $revision->old_values[$field] ?? null;
        $originalData[$field] = [
          'old' => $oldValue,
          'new' => $newValue,
        ];
      }
    }

    return [
      'revision' => $revision,
      'changes' => $originalData,
      'summary' => $this->getChangeSummary($originalData),
    ];
  }

  /**
   * Get change summary
   *
   * @param array $changes
   * @return array
   */
  protected function getChangeSummary(array $changes): array
  {
    $summary = [
      'total_changes' => count($changes),
      'fields_changed' => array_keys($changes),
      'significant_changes' => [],
    ];

    $significantFields = ['total_amount', 'items', 'supplier_id', 'procurement_method'];

    foreach ($changes as $field => $values) {
      if (in_array($field, $significantFields)) {
        $summary['significant_changes'][] = $field;
      }
    }

    return $summary;
  }

  /**
   * Get revision timeline
   *
   * @param int $requisitionId
   * @return array
   */
  public function getTimeline(int $requisitionId): array
  {
    $revisions = $this->getByRequisitionId($requisitionId);
    $timeline = [];

    foreach ($revisions as $revision) {
      $timeline[] = [
        'revision_number' => $revision->revision_number,
        'status' => $revision->status,
        'status_label' => $revision->status_label,
        'requested_at' => $revision->requested_at?->format('Y-m-d H:i:s'),
        'requested_by' => $revision->requestedBy?->full_name ?? 'Unknown',
        'reason' => $revision->revision_reason,
        'resolved_at' => $revision->approved_at?->format('Y-m-d H:i:s') ??
          $revision->rejected_at?->format('Y-m-d H:i:s'),
        'resolved_by' => $revision->approvedBy?->full_name ??
          $revision->rejectedBy?->full_name ?? null,
      ];
    }

    return $timeline;
  }

  /**
   * Get revision count by status for dashboard
   *
   * @param array $filters
   * @return array
   */
  public function getStatusCounts(array $filters = []): array
  {
    $query = RequisitionRevision::query();

    if (!empty($filters['department_id'])) {
      $query->whereHas('requisition', function ($q) use ($filters) {
        $q->where('department_id', $filters['department_id']);
      });
    }

    return [
      'pending' => (clone $query)->pending()->count(),
      'approved' => (clone $query)->approved()->count(),
      'rejected' => (clone $query)->rejected()->count(),
      'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
    ];
  }
}
