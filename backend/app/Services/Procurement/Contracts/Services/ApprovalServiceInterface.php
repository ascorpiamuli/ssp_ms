<?php
// app/Services/Procurement/Contracts/Services/ApprovalServiceInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Services;

use App\Models\ProcurementApproval;

interface ApprovalServiceInterface
{
  /**
   * Create an approval request.
   */
  public function createApproval(array $data): ProcurementApproval;

  /**
   * Get an approval by ID.
   */
  public function getApproval(int $approvalId): ProcurementApproval;

  /**
   * Get all approvals for an entity.
   */
  public function getApprovalsForEntity(int $entityId, string $entityType): array;

  /**
   * Approve an approval request.
   */
  public function approve(int $approvalId, int $userId, ?string $comment = null): ProcurementApproval;

  /**
   * Decline an approval request.
   */
  public function decline(int $approvalId, string $reason): ProcurementApproval;

  /**
   * Return an approval request for revision.
   */
  public function return(int $approvalId, string $reason): ProcurementApproval;

  /**
   * Check if an entity is fully approved.
   */
  public function isApproved(int $entityId, string $entityType): bool;

  /**
   * Get the current approval level for an entity.
   */
  public function getCurrentApprovalLevel(int $entityId, string $entityType): ?ProcurementApproval;

  /**
   * Get pending approvals for a user.
   */
  public function getPendingApprovalsForUser(int $userId): array;

  /**
   * Get approval timeline for an entity.
   */
  public function getApprovalTimeline(int $entityId, string $entityType): array;

  /**
   * Delegate an approval to another user.
   */
  public function delegateApproval(int $approvalId, int $delegateId): ProcurementApproval;

  /**
   * Check and send reminders for pending approvals.
   */
  public function checkAndSendReminders(): void;

  /**
   * Get all pending approvals.
   */
  public function getPendingApprovals(): array;

  /**
   * Get overdue approvals.
   */
  public function getOverdueApprovals(): array;

  /**
   * Get approval statistics.
   */
  public function getApprovalStatistics(): array;

  /**
   * Cancel an approval request.
   */
  public function cancelApproval(int $approvalId, string $reason): ProcurementApproval;

  /**
   * Reassign an approval to a different approver.
   */
  public function reassignApproval(int $approvalId, int $newApproverId): ProcurementApproval;
}
