<?php
// app/Services/Requisitions/ApprovalService.php

declare(strict_types=1);

namespace App\Services\Requisitions;

use App\Exceptions\Requisitions\ApprovalException;
use App\Models\Requisition;
use App\Models\Approval;
use App\Models\ApprovalWorkflow;
use App\Models\User;
use App\Models\Department;
use App\Services\Admin\AuditLogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Approval Service
 *
 * Handles all business logic for approval management
 */
class ApprovalService
{
  /**
   * @var RequisitionHistoryService
   */
  protected RequisitionHistoryService $historyService;

  /**
   * @var AuditLogService
   */
  protected AuditLogService $auditLogService;

  /**
   * Constructor
   */
  public function __construct(
    RequisitionHistoryService $historyService,
    AuditLogService $auditLogService
  ) {
    $this->historyService = $historyService;
    $this->auditLogService = $auditLogService;
    Log::info('🏗️ ApprovalService initialized');
  }

  /**
   * Create approvals for a requisition - ALWAYS USES 4-LEVEL WORKFLOW
   *
   * @param Requisition $requisition
   * @return \Illuminate\Database\Eloquent\Collection
   * @throws ApprovalException
   */
  public function createApprovals(Requisition $requisition)
  {
    try {
      DB::beginTransaction();

      Log::info('📝 Creating approvals for requisition', [
        'requisition_id' => $requisition->id,
        'department_id' => $requisition->department_id,
        'total_amount' => $requisition->total_amount,
      ]);

      // ✅ Always use 4-level approval workflow
      $workflow = $this->getDefaultWorkflow();

      if (!$workflow) {
        Log::warning('No workflow found in database, using default 4-level configuration');
        $levels = $this->getDefaultApprovalLevels();
      } else {
        $levels = $workflow->approval_levels ?? $this->getDefaultApprovalLevels();
        Log::info('Using workflow from database', [
          'workflow_id' => $workflow->id,
          'workflow_name' => $workflow->name,
        ]);
      }

      if (empty($levels)) {
        throw new ApprovalException('No approval levels configured');
      }

      $approvals = [];
      $missingApprovers = [];

      foreach ($levels as $levelConfig) {
        // Handle both array and object formats
        $level = is_array($levelConfig) ? $levelConfig['level'] : $levelConfig->level;
        $order = is_array($levelConfig) ? ($levelConfig['order'] ?? 0) : ($levelConfig->order ?? 0);
        $required = is_array($levelConfig) ? ($levelConfig['required'] ?? true) : ($levelConfig->required ?? true);

        Log::info('Processing approval level', [
          'level' => $level,
          'requisition_id' => $requisition->id,
        ]);

        // ✅ Get approver by ROLE, not specific user
        $approverId = $this->getApproverByRole($level, $requisition->department_id);

        Log::info('Approver lookup result', [
          'level' => $level,
          'approver_id' => $approverId,
          'found' => $approverId ? 'YES' : 'NO',
        ]);

        if (!$approverId) {
          $missingApprovers[] = $level;
          Log::warning("No approver found for level: {$level}", [
            'requisition_id' => $requisition->id,
            'department_id' => $requisition->department_id,
          ]);
          continue;
        }

        // Check if approval already exists for this level
        $existingApproval = Approval::where('requisition_id', $requisition->id)
          ->where('level', $level)
          ->first();

        if ($existingApproval) {
          Log::info('Approval already exists for level, skipping', [
            'level' => $level,
            'approval_id' => $existingApproval->id,
          ]);
          continue;
        }

        $levelName = $this->getLevelName($level);

        $approval = Approval::create([
          'requisition_id' => $requisition->id,
          'approver_id' => $approverId,
          'level' => $level,
          'level_name' => $levelName,
          'status' => 'pending',
          'status_label' => 'Pending',
          'order' => $order,
          'is_required' => $required,
          'assigned_at' => now(),
          'received_at' => now(),
          'due_date' => now()->addDays(7),
        ]);

        $approvals[] = $approval;
      }

      if (empty($approvals)) {
        $errorMsg = 'No approvers found for any approval level. Missing: ' . implode(', ', $missingApprovers);
        Log::error($errorMsg, [
          'requisition_id' => $requisition->id,
          'missing_approvers' => $missingApprovers,
        ]);
        throw new ApprovalException($errorMsg);
      }

      DB::commit();

      // Audit: Log approvals created
      foreach ($approvals as $approval) {
        $this->auditLogService->logModelCreated(
          $approval,
          "Approval created for requisition #{$requisition->id} at level {$approval->level}"
        );
      }

      Log::info('✅ Approvals created successfully', [
        'requisition_id' => $requisition->id,
        'approval_count' => count($approvals),
        'levels' => array_column($approvals, 'level'),
        'approver_ids' => array_column($approvals, 'approver_id'),
      ]);

      return collect($approvals);
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create approvals: ' . $e->getMessage());
      throw new ApprovalException('Failed to create approvals: ' . $e->getMessage());
    }
  }

  /**
   * Get approver by ROLE - NOT a specific user
   *
   * @param string $level
   * @param int|null $departmentId
   * @return int|null
   */
  protected function getApproverByRole(string $level, ?int $departmentId = null): ?int
  {
    // Map level to role name (using Spatie role names)
    // ✅ UPDATED: Changed 'PRINCIPAL' to 'Head of Institution'
    $roleMap = [
      'hod' => 'HOD',
      'accountant' => 'ACCOUNTANT',
      'principal' => 'Head of Institution',  // ✅ Changed from 'PRINCIPAL'
      'final' => 'FINAL_APPROVER',
    ];

    $roleName = $roleMap[$level] ?? null;

    if (!$roleName) {
      Log::warning('Unknown approval level', ['level' => $level]);
      return null;
    }

    Log::info('🔍 Looking for user with role', [
      'role_name' => $roleName,
      'department_id' => $departmentId,
    ]);

    // Build query for users with the specific role
    $query = User::role($roleName);

    // For HOD, prioritize users in the same department
    if ($level === 'hod' && $departmentId) {
      // First try: HOD in the same department
      $hod = $query->where('department_id', $departmentId)->first();
      if ($hod) {
        Log::info('✅ Found HOD in department', [
          'user_id' => $hod->id,
          'department_id' => $departmentId,
        ]);
        return $hod->id;
      }

      // Second try: Check if department has hod_id set
      $department = Department::find($departmentId);
      if ($department && $department->hod_id) {
        $hod = User::find($department->hod_id);
        if ($hod) {
          Log::info('✅ Found HOD from department hod_id', [
            'user_id' => $hod->id,
            'department_id' => $departmentId,
          ]);
          return $hod->id;
        }
      }

      // Third try: Any HOD (fallback)
      $hod = User::role($roleName)->first();
      if ($hod) {
        Log::info('✅ Found HOD globally (fallback)', [
          'user_id' => $hod->id,
        ]);
        return $hod->id;
      }
    }

    // ✅ Special handling for 'principal' role - get user with 'Head of Institution' role
    if ($level === 'principal') {
      $user = User::role('Head of Institution')->first();
      if ($user) {
        Log::info('✅ Found Head of Institution', [
          'user_id' => $user->id,
          'role' => 'Head of Institution',
        ]);
        return $user->id;
      }

      // Fallback: Try ADMIN if no Head of Institution found
      $admin = User::role('ADMIN')->first();
      if ($admin) {
        Log::warning('⚠️ No Head of Institution found, using ADMIN as fallback', [
          'admin_user_id' => $admin->id,
        ]);
        return $admin->id;
      }

      return null;
    }

    // For other roles, find any user with the role
    $user = $query->first();

    if ($user) {
      Log::info('✅ Found user with role', [
        'user_id' => $user->id,
        'role' => $roleName,
        'department_id' => $user->department_id,
      ]);
      return $user->id;
    }

    // ✅ CRITICAL FALLBACK: If no user found with specific role, use ADMIN as fallback
    $admin = User::role('ADMIN')->first();
    if ($admin) {
      Log::warning('⚠️ No user found with role, using ADMIN as fallback', [
        'role' => $roleName,
        'admin_user_id' => $admin->id,
      ]);
      return $admin->id;
    }

    // ❌ Absolute last resort: Get any user
    $anyUser = User::first();
    if ($anyUser) {
      Log::warning('⚠️ No ADMIN found, using first available user as fallback', [
        'role' => $roleName,
        'user_id' => $anyUser->id,
      ]);
      return $anyUser->id;
    }

    Log::error('❌ No user found for role and no fallback available', [
      'role' => $roleName,
    ]);

    return null;
  }

  /**
   * Get the default 4-level approval workflow from database
   * If none exists, return null to use fallback
   *
   * @return ApprovalWorkflow|null
   */
  protected function getDefaultWorkflow(): ?ApprovalWorkflow
  {
    // First try to get the default workflow
    $workflow = ApprovalWorkflow::where('is_default', true)
      ->where('is_active', true)
      ->first();

    if ($workflow) {
      return $workflow;
    }

    // If no default, try to get any active workflow with 4 levels
    $workflow = ApprovalWorkflow::where('is_active', true)
      ->first();

    if ($workflow) {
      return $workflow;
    }

    return null;
  }

  /**
   * Get default 4-level approval levels
   *
   * @return array
   */
  protected function getDefaultApprovalLevels(): array
  {
    return [
      [
        'level' => 'hod',
        'order' => 1,
        'required' => true,
        'description' => 'Head of Department Approval',
      ],
      [
        'level' => 'accountant',
        'order' => 2,
        'required' => true,
        'description' => 'Accountant Verification & Approval',
      ],
      [
        'level' => 'principal',
        'order' => 3,
        'required' => true,
        'description' => 'Head of Institution Approval',  // ✅ Updated description
      ],
      [
        'level' => 'final',
        'order' => 4,
        'required' => true,
        'description' => 'Final Approver (Director/Education Secretary)',
      ],
    ];
  }

  /**
   * Process an approval
   *
   * @param int $requisitionId
   * @param string $level
   * @param string $action
   * @param array $data
   * @return Approval
   * @throws ApprovalException
   */
  public function process(int $requisitionId, string $level, string $action, array $data): Approval
  {
    try {
      DB::beginTransaction();

      Log::info('Processing approval', [
        'requisition_id' => $requisitionId,
        'level' => $level,
        'action' => $action,
        'user_id' => $data['user_id'] ?? Auth::id(),
      ]);

      // Get requisition directly without going through RequisitionService
      $requisition = Requisition::with(['user', 'department'])->findOrFail($requisitionId);

      // Get all approvals for this requisition ordered by level/order
      $allApprovals = Approval::where('requisition_id', $requisitionId)
        ->orderBy('order')
        ->get();

      if ($allApprovals->isEmpty()) {
        throw new ApprovalException("No approval workflow found for requisition: {$requisitionId}");
      }

      // Get the approval record for the requested level
      $approval = $allApprovals->firstWhere('level', $level);

      if (!$approval) {
        throw new ApprovalException("Approval not found for level: {$level}");
      }

      // ✅ FIX: Check sequential order
      // Find the current index of this approval in the sequence
      $currentIndex = $allApprovals->search(function ($item) use ($level) {
        return $item->level === $level;
      });

      // Check if all previous approvals are completed (approved)
      if ($currentIndex > 0) {
        $previousApproval = $allApprovals->get($currentIndex - 1);

        // Previous approval must be approved (not pending, declined, returned, etc.)
        if ($previousApproval->status !== 'approved') {
          throw new ApprovalException(
            "Cannot process level '{$level}' because previous level '{$previousApproval->level}' is not yet approved. " .
              "Current status: {$previousApproval->status}"
          );
        }
      }

      // ✅ Check if this approval is already processed
      if (!$approval->isPending() && !$approval->isDelegated()) {
        throw new ApprovalException('This approval has already been processed');
      }

      // Check if user is authorized
      $this->authorizeApproval($approval, $data['user_id'] ?? Auth::id());

      // Process based on action
      switch ($action) {
        case 'approved':
          $oldValues = $approval->toArray();
          $approval->approve($data['comment'] ?? null);
          // Audit: Log approval
          $this->auditLogService->logModelUpdated(
            $approval,
            $oldValues,
            "Approval #{$approval->id} for requisition #{$requisitionId} at level {$level} approved"
          );
          $this->handleApproval($requisition, $level, $data['comment'] ?? null);
          break;

        case 'declined':
          if (empty($data['reason'])) {
            throw new ApprovalException('Reason is required for declining');
          }
          $oldValues = $approval->toArray();
          $approval->decline($data['reason'], $data['comment'] ?? null);
          // Audit: Log decline
          $this->auditLogService->logModelUpdated(
            $approval,
            $oldValues,
            "Approval #{$approval->id} for requisition #{$requisitionId} at level {$level} declined. Reason: {$data['reason']}"
          );
          $this->handleDecline($requisition, $level, $data['reason'], $data['comment'] ?? null);
          break;

        case 'returned':
          if (empty($data['reason'])) {
            throw new ApprovalException('Reason is required for returning');
          }
          $oldValues = $approval->toArray();
          $approval->return($data['reason'], $data['comment'] ?? null);
          // Audit: Log return
          $this->auditLogService->logModelUpdated(
            $approval,
            $oldValues,
            "Approval #{$approval->id} for requisition #{$requisitionId} at level {$level} returned. Reason: {$data['reason']}"
          );
          $this->handleReturn($requisition, $level, $data['reason'], $data['comment'] ?? null);
          break;

        default:
          throw new ApprovalException("Invalid action: {$action}");
      }

      DB::commit();

      Log::info('✅ Approval processed successfully', [
        'requisition_id' => $requisitionId,
        'level' => $level,
        'action' => $action,
        'approval_id' => $approval->id,
      ]);

      return $approval->fresh();
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to process approval: ' . $e->getMessage());
      throw new ApprovalException('Failed to process approval: ' . $e->getMessage());
    }
  }

  /**
   * Handle successful approval
   */
  protected function handleApproval(Requisition $requisition, string $level, ?string $comment = null): void
  {
    $statusMap = [
      'hod' => 'hod_approved',
      'accountant' => 'accountant_approved',
      'principal' => 'principal_approved',
      'final' => 'final_approved'
    ];

    $newStatus = $statusMap[$level] ?? null;

    if ($newStatus) {
      $oldValues = $requisition->toArray();
      $updateData = ['status' => $newStatus];
      $timestampField = $level . '_approved_at';
      $updateData[$timestampField] = now();

      if ($level === 'final') {
        $updateData['approved_at'] = now();
        $updateData['sla_status'] = 'on_track';
        $updateData['last_approval_at'] = now();
      }

      $requisition->update($updateData);

      // Audit: Log requisition status update
      $this->auditLogService->logModelUpdated(
        $requisition,
        $oldValues,
        "Requisition #{$requisition->id} status updated to {$newStatus} via {$level} approval"
      );

      Log::info('Requisition status updated', [
        'requisition_id' => $requisition->id,
        'new_status' => $newStatus,
        'level' => $level,
      ]);
    }

    $this->historyService->log(
      $requisition->id,
      $newStatus ?? 'approved',
      ['status' => $requisition->getOriginal('status')],
      ['status' => $newStatus],
      $comment
    );
  }

  /**
   * Handle declined approval
   */
  protected function handleDecline(Requisition $requisition, string $level, string $reason, ?string $comment = null): void
  {
    $statusMap = [
      'hod' => 'hod_declined',
      'accountant' => 'accountant_declined',
      'principal' => 'principal_declined',
      'final' => 'final_declined'
    ];

    $newStatus = $statusMap[$level] ?? null;

    if ($newStatus) {
      $oldValues = $requisition->toArray();
      $updateData = ['status' => $newStatus];
      $timestampField = $level . '_declined_at';
      $updateData[$timestampField] = now();
      $reasonField = $level . '_decline_reason';
      $updateData[$reasonField] = $reason;

      $requisition->update($updateData);

      // Audit: Log requisition declined
      $this->auditLogService->logModelUpdated(
        $requisition,
        $oldValues,
        "Requisition #{$requisition->id} declined at {$level} level. Reason: {$reason}"
      );

      Log::info('Requisition declined', [
        'requisition_id' => $requisition->id,
        'new_status' => $newStatus,
        'level' => $level,
        'reason' => $reason,
      ]);
    }

    $this->historyService->log(
      $requisition->id,
      $newStatus ?? 'declined',
      ['status' => $requisition->getOriginal('status')],
      ['status' => $newStatus],
      $comment ?? $reason
    );
  }

  /**
   * Handle returned approval
   */
  protected function handleReturn(Requisition $requisition, string $level, string $reason, ?string $comment = null): void
  {
    $oldValues = $requisition->toArray();

    $requisition->update([
      'status' => 'returned',
      'returned_at' => now(),
      'returned_by' => Auth::id(),
      'return_reason' => $reason,
      'return_count' => ($requisition->return_count ?? 0) + 1,
      'last_returned_at' => now(),
    ]);

    // Audit: Log requisition returned
    $this->auditLogService->logModelUpdated(
      $requisition,
      $oldValues,
      "Requisition #{$requisition->id} returned at {$level} level. Reason: {$reason}"
    );

    Approval::where('requisition_id', $requisition->id)
      ->where('status', 'pending')
      ->update(['status' => 'cancelled']);

    Log::info('Requisition returned', [
      'requisition_id' => $requisition->id,
      'level' => $level,
      'reason' => $reason,
    ]);

    $this->historyService->log(
      $requisition->id,
      'returned',
      ['status' => $requisition->getOriginal('status')],
      ['status' => 'returned'],
      $comment ?? $reason
    );
  }

  /**
   * Get level name
   *
   * @param string $level
   * @return string
   */
  protected function getLevelName(string $level): string
  {
    $names = [
      'hod' => 'Head of Department',
      'accountant' => 'Accountant',
      'principal' => 'Head of Institution',  // ✅ Updated name
      'final' => 'Final Approver',
    ];
    return $names[$level] ?? ucfirst($level);
  }

  /**
   * Authorize approval action
   */
  protected function authorizeApproval(Approval $approval, int $userId): void
  {
    $isApprover = $approval->approver_id === $userId;
    $isDelegate = $approval->delegate_id === $userId;

    // ✅ Allow both the original approver AND the delegate to process
    // The delegate is the one who should process it after delegation
    if (!$isApprover && !$isDelegate) {
      throw new ApprovalException('You are not authorized to process this approval');
    }
  }

  /**
   * Delegate approval to another user
   */
  public function delegate(int $approvalId, int $delegateId, ?string $comment = null): Approval
  {
    try {
      DB::beginTransaction();

      Log::info('🔄 Delegating approval', [
        'approval_id' => $approvalId,
        'delegate_id' => $delegateId,
        'user_id' => Auth::id(),
      ]);

      $approval = Approval::findOrFail($approvalId);

      // ✅ Allow delegation if status is 'pending' OR 'delegated'
      if (!$approval->isPending() && !$approval->isDelegated()) {
        throw new ApprovalException('Cannot delegate a processed approval');
      }

      // ✅ Allow the current delegate or the original approver to delegate
      $currentUserId = Auth::id();
      $isApprover = $approval->approver_id === $currentUserId;
      $isDelegate = $approval->delegate_id === $currentUserId;

      if (!$isApprover && !$isDelegate) {
        throw new ApprovalException('You are not authorized to delegate this approval');
      }

      $delegate = User::find($delegateId);
      if (!$delegate) {
        throw new ApprovalException('Delegate user not found');
      }

      // If this is a re-delegation, keep the original approver
      $originalApproverId = $approval->original_approver_id ?? $approval->approver_id;

      $oldValues = $approval->toArray();

      $approval->update([
        'status' => 'delegated',
        'delegate_id' => $delegateId,
        'delegated_at' => now(),
        'comment' => $comment,
        'original_approver_id' => $originalApproverId,
      ]);

      // Audit: Log delegation
      $this->auditLogService->logModelUpdated(
        $approval,
        $oldValues,
        "Approval #{$approval->id} delegated to user #{$delegateId}" . ($comment ? " - {$comment}" : "")
      );

      $this->historyService->log(
        $approval->requisition_id,
        'delegated',
        ['approver_id' => $approval->approver_id, 'delegate_id' => $approval->delegate_id],
        ['delegate_id' => $delegateId],
        "Approval delegated to {$delegate->full_name}" . ($comment ? " - $comment" : "")
      );

      DB::commit();

      Log::info('✅ Approval delegated successfully', [
        'approval_id' => $approvalId,
        'from_user' => $currentUserId,
        'to_user' => $delegateId,
        'original_approver' => $originalApproverId,
      ]);

      return $approval->fresh();
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to delegate approval: ' . $e->getMessage());
      throw new ApprovalException('Failed to delegate approval: ' . $e->getMessage());
    }
  }

  /**
   * Get approvals for a requisition
   */
  public function getByRequisitionId(int $requisitionId)
  {
    Log::info('ApprovalService::getByRequisitionId called', ['requisitionId' => $requisitionId]);

    try {
      $approvals = Approval::where('requisition_id', $requisitionId)
        ->with(['approver', 'delegate', 'originalApprover'])
        ->orderBy('order')
        ->get();

      Log::info('ApprovalService::getByRequisitionId - Result', [
        'requisitionId' => $requisitionId,
        'count' => $approvals->count()
      ]);

      return $approvals;
    } catch (\Exception $e) {
      Log::error('ApprovalService::getByRequisitionId - Failed', [
        'requisitionId' => $requisitionId,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }

  /**
   * Get pending approvals for a user with pagination and filters
   *
   * @param int $userId
   * @param string|null $level
   * @param int $perPage
   * @param int $page
   * @param int|null $departmentId
   * @param string|null $dateFrom
   * @param string|null $dateTo
   * @param string|null $search
   * @return array
   */
  public function getPendingForUser(
    int $userId,
    ?string $level = null,
    int $perPage = 10,
    int $page = 1,
    ?int $departmentId = null,
    ?string $dateFrom = null,
    ?string $dateTo = null,
    ?string $search = null
  ): array {
    Log::info('ApprovalService::getPendingForUser called', [
      'userId' => $userId,
      'level' => $level,
      'perPage' => $perPage,
      'page' => $page,
      'departmentId' => $departmentId,
      'dateFrom' => $dateFrom,
      'dateTo' => $dateTo,
      'search' => $search
    ]);

    try {
      // Build the query
      $query = Approval::where('status', 'pending')
        ->where(function ($q) use ($userId) {
          $q->where('approver_id', $userId)
            ->orWhere('delegate_id', $userId);
        })
        ->with([
          'requisition',
          'requisition.user',
          'requisition.department',
          'requisition.items',
          'requisition.approvals',
          'approver',
          'delegate'
        ]);

      Log::info('ApprovalService::getPendingForUser - Base query built');

      // Apply level filter
      if ($level) {
        Log::info('ApprovalService::getPendingForUser - Applying level filter', ['level' => $level]);
        $query->where('level', $level);
      }

      // Apply department filter
      if ($departmentId) {
        Log::info('ApprovalService::getPendingForUser - Applying department filter', ['departmentId' => $departmentId]);
        $query->whereHas('requisition', function ($q) use ($departmentId) {
          $q->where('department_id', $departmentId);
        });
      }

      // Apply date filters
      if ($dateFrom) {
        Log::info('ApprovalService::getPendingForUser - Applying date_from filter', ['dateFrom' => $dateFrom]);
        $query->whereDate('created_at', '>=', $dateFrom);
      }

      if ($dateTo) {
        Log::info('ApprovalService::getPendingForUser - Applying date_to filter', ['dateTo' => $dateTo]);
        $query->whereDate('created_at', '<=', $dateTo);
      }

      // Apply search filter
      if ($search) {
        Log::info('ApprovalService::getPendingForUser - Applying search filter', ['search' => $search]);
        $query->whereHas('requisition', function ($q) use ($search) {
          $q->where('title', 'like', "%{$search}%")
            ->orWhere('reference_number', 'like', "%{$search}%");
        });
      }

      // Order by oldest first (FIFO - first in, first out)
      $query->orderBy('created_at', 'asc');

      // Get total count for pagination
      $total = $query->count();
      Log::info('ApprovalService::getPendingForUser - Total records found', ['total' => $total]);

      // Apply pagination
      $data = $query->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get();

      Log::info('ApprovalService::getPendingForUser - Data retrieved', [
        'data_count' => $data->count(),
        'total' => $total,
        'per_page' => $perPage,
        'current_page' => $page,
        'last_page' => ceil($total / $perPage)
      ]);

      // Log sample data if available
      if ($data->count() > 0) {
        $firstItem = $data->first();
        Log::info('ApprovalService::getPendingForUser - Sample data', [
          'id' => $firstItem->id,
          'level' => $firstItem->level,
          'status' => $firstItem->status,
          'requisition_id' => $firstItem->requisition_id,
          'requisition_title' => $firstItem->requisition?->title,
          'requisition_reference' => $firstItem->requisition?->reference_number,
          'approver_id' => $firstItem->approver_id
        ]);
      } else {
        Log::info('ApprovalService::getPendingForUser - No data found for user', [
          'userId' => $userId,
          'level' => $level
        ]);
      }

      return [
        'data' => $data,
        'total' => $total,
        'per_page' => $perPage,
        'current_page' => $page,
        'last_page' => ceil($total / $perPage),
      ];
    } catch (\Exception $e) {
      Log::error('ApprovalService::getPendingForUser - Failed', [
        'userId' => $userId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Get approvals by role for a user (all statuses).
   * Ensures only approvals where the user is the approver or delegate are returned.
   */
  public function getByRoleForUser(
    int $userId,
    string $role,
    string $status = 'all',
    int $perPage = 10,
    int $page = 1,
    ?int $departmentId = null,
    ?string $dateFrom = null,
    ?string $dateTo = null,
    ?string $search = null
  ): array {
    Log::info('ApprovalService::getByRoleForUser called', [
      'userId' => $userId,
      'role' => $role,
      'status' => $status,
      'perPage' => $perPage,
      'page' => $page
    ]);

    try {
      // ✅ CRITICAL: Only fetch approvals where the user is the approver or delegate
      $query = Approval::with([
        'requisition',
        'requisition.user',
        'requisition.department',
        'requisition.items',
        'requisition.approvals',
        'approver',
        'delegate'
      ])
        ->where('level', $role)
        ->where(function ($q) use ($userId) {
          $q->where('approver_id', $userId)
            ->orWhere('delegate_id', $userId);
        });

      // Apply status filter
      if ($status !== 'all') {
        $query->where('status', $status);
      }

      // Apply department filter (only if user has permission)
      if ($departmentId) {
        $query->whereHas('requisition', function ($q) use ($departmentId) {
          $q->where('department_id', $departmentId);
        });
      }

      // Apply date filters
      if ($dateFrom) {
        $query->whereDate('created_at', '>=', $dateFrom);
      }

      if ($dateTo) {
        $query->whereDate('created_at', '<=', $dateTo);
      }

      // Apply search filter
      if ($search) {
        $query->whereHas('requisition', function ($q) use ($search) {
          $q->where('title', 'like', "%{$search}%")
            ->orWhere('reference_number', 'like', "%{$search}%");
        });
      }

      // Order by most recent first
      $query->orderBy('created_at', 'desc');

      // Get total count
      $total = $query->count();

      // Apply pagination
      $data = $query->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get();

      Log::info('ApprovalService::getByRoleForUser - Data retrieved', [
        'userId' => $userId,
        'data_count' => $data->count(),
        'total' => $total
      ]);

      return [
        'data' => $data,
        'total' => $total,
        'per_page' => $perPage,
        'current_page' => $page,
        'last_page' => ceil($total / $perPage),
      ];
    } catch (\Exception $e) {
      Log::error('ApprovalService::getByRoleForUser - Failed', [
        'userId' => $userId,
        'role' => $role,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Get delegated approvals for a user (where user is the delegate)
   *
   * @param int $userId
   * @param string $status
   * @param int $perPage
   * @param int $page
   * @param string|null $level
   * @param string|null $dateFrom
   * @param string|null $dateTo
   * @param string|null $search
   * @return array
   */
  public function getDelegatedForUser(
    int $userId,
    string $status = 'all',
    int $perPage = 10,
    int $page = 1,
    ?string $level = null,
    ?string $dateFrom = null,
    ?string $dateTo = null,
    ?string $search = null
  ): array {
    Log::info('🔍 ApprovalService::getDelegatedForUser called', [
      'user_id' => $userId,
      'status' => $status,
      'perPage' => $perPage,
      'page' => $page,
      'level' => $level,
      'dateFrom' => $dateFrom,
      'dateTo' => $dateTo,
      'search' => $search
    ]);

    try {
      $query = Approval::with([
        'requisition' => function ($q) {
          $q->with([
            'user:id,first_name,last_name,email',
            'department:id,name,code',
            'items' => function ($q) {
              $q->select([
                'id',
                'requisition_id',
                'item_name',
                'description',
                'unit_of_measure',
                'quantity',
                'estimated_unit_cost',
                'total_cost',
                'specifications'
              ]);
            },
            'approvals' => function ($q) {
              $q->with([
                'approver:id,first_name,last_name,email',
                'delegate:id,first_name,last_name,email'
              ])->orderBy('order', 'asc');
            }
          ]);
        },
        'approver:id,first_name,last_name,email',
        'delegate:id,first_name,last_name,email',
        'originalApprover:id,first_name,last_name,email'
      ])
        ->where('delegate_id', $userId);

      // ✅ FIX: Always include 'delegated' status, and optionally 'pending' if status is 'all' or 'pending'
      if ($status === 'all' || $status === 'pending') {
        $query->whereIn('status', ['pending', 'delegated']);
      } elseif ($status === 'delegated') {
        $query->where('status', 'delegated');
      } elseif ($status === 'approved') {
        $query->where('status', 'approved');
      } elseif ($status === 'declined') {
        $query->where('status', 'declined');
      } elseif ($status === 'returned') {
        $query->where('status', 'returned');
      } else {
        // For any other status, filter by that status
        $query->where('status', $status);
      }

      // Apply level filter
      if ($level) {
        $query->where('level', $level);
      }

      // Apply date filters
      if ($dateFrom) {
        $query->whereDate('created_at', '>=', $dateFrom);
      }
      if ($dateTo) {
        $query->whereDate('created_at', '<=', $dateTo);
      }

      // Apply search filter
      if ($search) {
        $query->where(function ($q) use ($search) {
          $q->whereHas('requisition', function ($subQ) use ($search) {
            $subQ->where('reference_number', 'like', '%' . $search . '%')
              ->orWhere('title', 'like', '%' . $search . '%');
          })->orWhereHas('approver', function ($subQ) use ($search) {
            $subQ->where('first_name', 'like', '%' . $search . '%')
              ->orWhere('last_name', 'like', '%' . $search . '%')
              ->orWhere('email', 'like', '%' . $search . '%');
          });
        });
      }

      // ✅ Add debug logging to see the actual SQL
      Log::info('🔍 ApprovalService::getDelegatedForUser - Query SQL', [
        'sql' => $query->toSql(),
        'bindings' => $query->getBindings()
      ]);

      $total = $query->count();

      Log::info('🔍 ApprovalService::getDelegatedForUser - Total count', [
        'total' => $total,
        'user_id' => $userId
      ]);

      // Apply pagination
      $data = $query->orderBy('created_at', 'desc')
        ->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get();

      Log::info('✅ ApprovalService::getDelegatedForUser completed', [
        'user_id' => $userId,
        'total' => $total,
        'count' => $data->count(),
        'data_ids' => $data->pluck('id')->toArray()
      ]);

      return [
        'data' => $data,
        'total' => $total,
        'per_page' => $perPage,
        'current_page' => $page,
        'last_page' => ceil($total / $perPage)
      ];
    } catch (\Exception $e) {
      Log::error('❌ ApprovalService::getDelegatedForUser failed', [
        'user_id' => $userId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  /**
   * Get delegated approvals for a user with simpler parameters (for controller compatibility)
   *
   * @param int $userId
   * @param array $filters
   * @param int $perPage
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getDelegatedApprovals(int $userId, array $filters = [], int $perPage = 15)
  {
    // ✅ Default to 'pending' to include both pending and delegated statuses
    $status = $filters['status'] ?? 'pending';
    $level = $filters['level'] ?? null;
    $dateFrom = $filters['date_from'] ?? null;
    $dateTo = $filters['date_to'] ?? null;
    $search = $filters['search'] ?? null;
    $page = $filters['page'] ?? 1;

    Log::info('🔍 ApprovalService::getDelegatedApprovals', [
      'user_id' => $userId,
      'filters' => $filters,
      'status' => $status
    ]);

    $result = $this->getDelegatedForUser(
      $userId,
      $status,
      $perPage,
      $page,
      $level,
      $dateFrom,
      $dateTo,
      $search
    );

    // Convert to paginator format
    return new \Illuminate\Pagination\LengthAwarePaginator(
      $result['data'],
      $result['total'],
      $result['per_page'],
      $result['current_page'],
      ['path' => request()->url(), 'query' => request()->query()]
    );
  }

  /**
   * Get approval statistics for a user
   */
  public function getStatsForUser(int $userId): array
  {
    Log::info('ApprovalService::getStatsForUser called', ['userId' => $userId]);

    try {
      $query = Approval::where(function ($q) use ($userId) {
        $q->where('approver_id', $userId)
          ->orWhere('delegate_id', $userId);
      });

      $stats = [
        'total' => (clone $query)->count(),
        'pending' => (clone $query)->where('status', 'pending')->count(),
        'approved' => (clone $query)->where('status', 'approved')->count(),
        'declined' => (clone $query)->where('status', 'declined')->count(),
        'returned' => (clone $query)->where('status', 'returned')->count(),
        'delegated' => (clone $query)->where('status', 'delegated')->count(),
        'escalated' => (clone $query)->where('status', 'escalated')->count(),
        'avg_response_time' => (clone $query)->whereNotNull('response_time_hours')->avg('response_time_hours'),
      ];

      // Add delegated to you specifically (where user is delegate)
      $stats['delegated_to_you'] = Approval::where('delegate_id', $userId)
        ->whereIn('status', ['pending', 'delegated'])
        ->count();

      Log::info('ApprovalService::getStatsForUser - Result', [
        'userId' => $userId,
        'stats' => $stats
      ]);

      return $stats;
    } catch (\Exception $e) {
      Log::error('ApprovalService::getStatsForUser - Failed', [
        'userId' => $userId,
        'error' => $e->getMessage()
      ]);
      throw $e;
    }
  }
}
