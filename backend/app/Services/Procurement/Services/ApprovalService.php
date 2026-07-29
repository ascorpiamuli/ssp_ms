<?php
// app/Services/Procurement/Services/ApprovalService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\ProcurementApproval;
use App\Models\User;
use App\Services\Procurement\Base\BaseService;
use App\Services\Procurement\Contracts\Services\ApprovalServiceInterface;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\Exceptions\ProcurementException;

class ApprovalService extends BaseService implements ApprovalServiceInterface
{
  protected array $levelOrder = ['hod', 'accountant', 'principal', 'final', 'diocesan_accountant', 'procurement'];

  public function __construct(
    protected NotificationDispatcherInterface $notificationDispatcher
  ) {
    parent::__construct();
  }

  public function createApproval(array $data): ProcurementApproval
  {
    return $this->transaction(function () use ($data) {
      $approval = ProcurementApproval::create([
        'requisition_id' => $data['requisition_id'],
        'approvable_id' => $data['entity_id'],
        'approvable_type' => $data['entity_type'],
        'level' => $data['level'],
        'approver_id' => $data['approver_id'],
        'order' => $this->getNextOrder($data['entity_id'], $data['entity_type']),
        'status' => 'pending',
        'deadline' => $data['deadline'] ?? now()->addDays(3),
        'metadata' => $data['metadata'] ?? null,
      ]);

      $this->notificationDispatcher->notify('approval_required', [
        'approval_id' => $approval->id,
        'entity_id' => $data['entity_id'],
        'entity_type' => $data['entity_type'],
        'approver_id' => $data['approver_id'],
        'requisition_id' => $data['requisition_id'],
        'deadline' => $approval->deadline?->toDateTimeString(),
      ]);

      return $approval;
    });
  }

  public function getApproval(int $approvalId): ProcurementApproval
  {
    $approval = ProcurementApproval::with(['approver', 'delegate'])->find($approvalId);

    if (!$approval) {
      throw new \Exception("Approval #{$approvalId} not found.");
    }

    return $approval;
  }

  public function getApprovalsForEntity(int $entityId, string $entityType): array
  {
    return ProcurementApproval::where('approvable_id', $entityId)
      ->where('approvable_type', $entityType)
      ->orderBy('order')
      ->get()
      ->toArray();
  }

  public function approve(int $approvalId, int $userId, ?string $comment = null): ProcurementApproval
  {
    $approval = $this->getApproval($approvalId);

    if ($approval->status !== 'pending') {
      throw new \Exception('This approval is no longer pending.');
    }

    if ($approval->approver_id !== $userId && $approval->delegate_id !== $userId) {
      throw ProcurementException::unauthorizedAction('approve');
    }

    return $this->transaction(function () use ($approval, $userId, $comment) {
      $approval->approve($comment);

      $this->notificationDispatcher->notify('approval_completed', [
        'approval_id' => $approval->id,
        'entity_id' => $approval->approvable_id,
        'entity_type' => $approval->approvable_type,
        'status' => 'approved',
        'approved_by' => $userId,
      ]);

      // Check if all approvals are done
      $this->checkAllApprovalsCompleted($approval->approvable_id, $approval->approvable_type);

      return $approval;
    });
  }

  public function decline(int $approvalId, string $reason): ProcurementApproval
  {
    $approval = $this->getApproval($approvalId);

    if ($approval->status !== 'pending') {
      throw new \Exception('This approval is no longer pending.');
    }

    return $this->transaction(function () use ($approval, $reason) {
      $approval->decline($reason);

      $this->notificationDispatcher->notify('approval_completed', [
        'approval_id' => $approval->id,
        'entity_id' => $approval->approvable_id,
        'entity_type' => $approval->approvable_type,
        'status' => 'declined',
        'reason' => $reason,
      ]);

      return $approval;
    });
  }

  public function return(int $approvalId, string $reason): ProcurementApproval
  {
    $approval = $this->getApproval($approvalId);

    if ($approval->status !== 'pending') {
      throw new \Exception('This approval is no longer pending.');
    }

    return $this->transaction(function () use ($approval, $reason) {
      $approval->return($reason);

      $this->notificationDispatcher->notify('approval_completed', [
        'approval_id' => $approval->id,
        'entity_id' => $approval->approvable_id,
        'entity_type' => $approval->approvable_type,
        'status' => 'returned',
        'reason' => $reason,
      ]);

      return $approval;
    });
  }

  public function isApproved(int $entityId, string $entityType): bool
  {
    $approvals = ProcurementApproval::where('approvable_id', $entityId)
      ->where('approvable_type', $entityType)
      ->get();

    if ($approvals->isEmpty()) {
      return false;
    }

    return $approvals->every(function ($approval) {
      return $approval->status === 'approved';
    });
  }

  public function getCurrentApprovalLevel(int $entityId, string $entityType): ?ProcurementApproval
  {
    return ProcurementApproval::where('approvable_id', $entityId)
      ->where('approvable_type', $entityType)
      ->where('status', 'pending')
      ->orderBy('order')
      ->first();
  }

  public function getPendingApprovalsForUser(int $userId): array
  {
    return ProcurementApproval::where('status', 'pending')
      ->where(function ($query) use ($userId) {
        $query->where('approver_id', $userId)
          ->orWhere('delegate_id', $userId);
      })
      ->with(['approvable', 'requisition'])
      ->orderBy('deadline')
      ->get()
      ->toArray();
  }

  public function getApprovalTimeline(int $entityId, string $entityType): array
  {
    return ProcurementApproval::where('approvable_id', $entityId)
      ->where('approvable_type', $entityType)
      ->orderBy('order')
      ->get()
      ->map(function ($approval) {
        return [
          'level' => $approval->level_label,
          'approver' => $approval->approver_name,
          'status' => $approval->status_label,
          'comment' => $approval->comment,
          'approved_at' => $approval->approved_at?->toDateTimeString(),
          'declined_at' => $approval->declined_at?->toDateTimeString(),
          'returned_at' => $approval->returned_at?->toDateTimeString(),
        ];
      })
      ->toArray();
  }

  public function delegateApproval(int $approvalId, int $delegateId): ProcurementApproval
  {
    $approval = $this->getApproval($approvalId);

    if ($approval->status !== 'pending') {
      throw new \Exception('Cannot delegate a non-pending approval.');
    }

    $delegate = User::find($delegateId);
    if (!$delegate) {
      throw new \Exception("User #{$delegateId} not found.");
    }

    return $this->transaction(function () use ($approval, $delegateId) {
      $approval->update([
        'delegate_id' => $delegateId,
      ]);

      $this->notificationDispatcher->notify('approval_required', [
        'approval_id' => $approval->id,
        'entity_id' => $approval->approvable_id,
        'entity_type' => $approval->approvable_type,
        'approver_id' => $delegateId,
        'requisition_id' => $approval->requisition_id,
        'is_delegated' => true,
        'original_approver_id' => $approval->approver_id,
      ]);

      return $approval;
    });
  }

  public function checkAndSendReminders(): void
  {
    $overdue = ProcurementApproval::where('status', 'pending')
      ->where('deadline', '<', now())
      ->where('is_reminder_sent', false)
      ->get();

    foreach ($overdue as $approval) {
      $this->notificationDispatcher->notify('approval_reminder', [
        'approval_id' => $approval->id,
        'entity_id' => $approval->approvable_id,
        'entity_type' => $approval->approvable_type,
        'approver_id' => $approval->approver_id,
        'requisition_id' => $approval->requisition_id,
        'days_overdue' => now()->diffInDays($approval->deadline),
      ]);

      $approval->sendReminder();
    }
  }

  public function getPendingApprovals(): array
  {
    return ProcurementApproval::where('status', 'pending')
      ->with(['approvable', 'requisition', 'approver'])
      ->orderBy('deadline')
      ->get()
      ->toArray();
  }

  public function getOverdueApprovals(): array
  {
    return ProcurementApproval::where('status', 'pending')
      ->where('deadline', '<', now())
      ->with(['approvable', 'requisition', 'approver'])
      ->orderBy('deadline')
      ->get()
      ->toArray();
  }

  public function getApprovalStatistics(): array
  {
    return [
      'total' => ProcurementApproval::count(),
      'pending' => ProcurementApproval::where('status', 'pending')->count(),
      'approved' => ProcurementApproval::where('status', 'approved')->count(),
      'declined' => ProcurementApproval::where('status', 'declined')->count(),
      'returned' => ProcurementApproval::where('status', 'returned')->count(),
      'overdue' => ProcurementApproval::where('status', 'pending')
        ->where('deadline', '<', now())
        ->count(),
      'delegated' => ProcurementApproval::whereNotNull('delegate_id')->count(),
    ];
  }

  public function cancelApproval(int $approvalId, string $reason): ProcurementApproval
  {
    $approval = $this->getApproval($approvalId);

    if ($approval->status === 'approved') {
      throw new \Exception('Cannot cancel an approved approval.');
    }

    return $this->transaction(function () use ($approval, $reason) {
      $approval->update([
        'status' => 'cancelled',
        'return_reason' => $reason,
        'returned_at' => now(),
      ]);

      return $approval;
    });
  }

  public function reassignApproval(int $approvalId, int $newApproverId): ProcurementApproval
  {
    $approval = $this->getApproval($approvalId);

    if ($approval->status !== 'pending') {
      throw new \Exception('Cannot reassign a non-pending approval.');
    }

    $newApprover = User::find($newApproverId);
    if (!$newApprover) {
      throw new \Exception("User #{$newApproverId} not found.");
    }

    return $this->transaction(function () use ($approval, $newApproverId) {
      $approval->update([
        'approver_id' => $newApproverId,
        'delegate_id' => null,
      ]);

      $this->notificationDispatcher->notify('approval_required', [
        'approval_id' => $approval->id,
        'entity_id' => $approval->approvable_id,
        'entity_type' => $approval->approvable_type,
        'approver_id' => $newApproverId,
        'requisition_id' => $approval->requisition_id,
        'is_reassigned' => true,
      ]);

      return $approval;
    });
  }

  /**
   * Get the next order number for approvals.
   */
  protected function getNextOrder(int $entityId, string $entityType): int
  {
    return ProcurementApproval::where('approvable_id', $entityId)
      ->where('approvable_type', $entityType)
      ->max('order') + 1;
  }

  /**
   * Check if all approvals are completed.
   */
  protected function checkAllApprovalsCompleted(int $entityId, string $entityType): void
  {
    $allApprovals = ProcurementApproval::where('approvable_id', $entityId)
      ->where('approvable_type', $entityType)
      ->get();

    $allApproved = $allApprovals->every(function ($approval) {
      return $approval->status === 'approved';
    });

    if ($allApproved) {
      $this->notificationDispatcher->notify('all_approvals_completed', [
        'entity_id' => $entityId,
        'entity_type' => $entityType,
        'requisition_id' => $allApprovals->first()?->requisition_id,
      ]);
    }
  }
}
