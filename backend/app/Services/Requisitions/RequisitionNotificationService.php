<?php
// app/Services/Requisitions/RequisitionNotificationService.php

declare(strict_types=1);

namespace App\Services\Requisitions;

use App\Models\Requisition;
use App\Models\RequisitionNotification;
use App\Models\User;
use App\Notifications\RequisitionNotificationMail;
use App\Exceptions\Requisitions\NotificationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

/**
 * Requisition Notification Service
 *
 * Handles sending and managing notifications for requisitions
 * No circular dependencies - independent service
 */
class RequisitionNotificationService
{
  /**
   * Send notification to a user using Laravel Notification
   *
   * @param int $requisitionId
   * @param int $userId
   * @param string $type
   * @param string $subject
   * @param string $message
   * @param array $data
   * @param array $channels
   * @return RequisitionNotification
   * @throws NotificationException
   */
  public function send(
    int $requisitionId,
    int $userId,
    string $type,
    string $subject,
    string $message,
    array $data = [],
    array $channels = ['mail', 'database']
  ): RequisitionNotification {
    try {
      $user = User::findOrFail($userId);
      $requisition = Requisition::findOrFail($requisitionId);

      // Create notification record in database
      $notification = RequisitionNotification::create([
        'requisition_id' => $requisitionId,
        'user_id' => $userId,
        'sent_by' => Auth::id(),
        'type' => $type,
        'channel' => implode(',', $channels),
        'subject' => $subject,
        'message' => $message,
        'data' => $data,
        'is_sent' => false,
      ]);

      // Send using Laravel Notification system
      Notification::send($user, new RequisitionNotificationMail(
        $notification,
        $channels
      ));

      // Mark as sent
      $notification->markAsSent();
      $notification->markAsDelivered();

      return $notification->fresh();
    } catch (\Exception $e) {
      Log::error('Failed to send notification: ' . $e->getMessage());
      throw new NotificationException('Failed to send notification: ' . $e->getMessage());
    }
  }

  /**
   * Send requisition submitted notification
   *
   * @param Requisition $requisition
   * @param int $approverId
   * @return RequisitionNotification
   */
  public function notifySubmitted(Requisition $requisition, int $approverId): RequisitionNotification
  {
    $channels = ['mail', 'database'];

    return $this->send(
      $requisition->id,
      $approverId,
      'submitted',
      "New Requisition Submitted: {$requisition->reference_number}",
      "A new requisition has been submitted for your approval.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'requester' => $requisition->user->full_name ?? 'Unknown',
        'department' => $requisition->department->name ?? 'Unknown',
        'items_count' => $requisition->items()->count(),
        'url' => config('app.frontend_url') . '/approvals/pending',
        'action' => 'approve'
      ],
      $channels
    );
  }

  /**
   * Send requisition approved notification
   *
   * @param Requisition $requisition
   * @param string $level
   * @return RequisitionNotification|null
   */
  public function notifyApproved(Requisition $requisition, string $level): ?RequisitionNotification
  {
    $nextApprover = $this->getNextApprover($requisition, $level);
    $channels = ['mail', 'database'];

    if ($nextApprover) {
      return $this->send(
        $requisition->id,
        $nextApprover,
        'approved',
        "Requisition Approved: {$requisition->reference_number}",
        "The requisition has been approved at the {$level} level.",
        [
          'reference_number' => $requisition->reference_number,
          'amount' => $requisition->total_amount,
          'level' => $level,
          'approved_by' => Auth::user()?->full_name ?? 'System',
          'url' => config('app.frontend_url') . '/approvals/pending',
          'action' => 'approve'
        ],
        $channels
      );
    }

    // Notify requester of final approval
    return $this->send(
      $requisition->id,
      $requisition->user_id,
      'approved',
      "Requisition Fully Approved: {$requisition->reference_number}",
      "Your requisition has been fully approved.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'url' => config('app.frontend_url') . '/requisitions/' . $requisition->id,
        'action' => 'view'
      ],
      $channels
    );
  }

  /**
   * Send requisition declined notification
   *
   * @param Requisition $requisition
   * @param string $level
   * @param string $reason
   * @return RequisitionNotification
   */
  public function notifyDeclined(Requisition $requisition, string $level, string $reason): RequisitionNotification
  {
    $channels = ['mail', 'database'];

    return $this->send(
      $requisition->id,
      $requisition->user_id,
      'declined',
      "Requisition Declined: {$requisition->reference_number}",
      "Your requisition has been declined at the {$level} level.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'level' => $level,
        'reason' => $reason,
        'declined_by' => Auth::user()?->full_name ?? 'System',
        'url' => config('app.frontend_url') . '/requisitions/' . $requisition->id,
        'action' => 'view'
      ],
      $channels
    );
  }

  /**
   * Send requisition returned notification
   *
   * @param Requisition $requisition
   * @param string $reason
   * @return RequisitionNotification
   */
  public function notifyReturned(Requisition $requisition, string $reason): RequisitionNotification
  {
    $channels = ['mail', 'database'];

    return $this->send(
      $requisition->id,
      $requisition->user_id,
      'returned',
      "Requisition Returned: {$requisition->reference_number}",
      "Your requisition has been returned for revision.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'reason' => $reason,
        'returned_by' => Auth::user()?->full_name ?? 'System',
        'url' => config('app.frontend_url') . '/requisitions/' . $requisition->id . '/edit',
        'action' => 'revise'
      ],
      $channels
    );
  }

  /**
   * Send reminder notification
   *
   * @param Requisition $requisition
   * @param int $approverId
   * @return RequisitionNotification
   */
  public function sendReminder(Requisition $requisition, int $approverId): RequisitionNotification
  {
    $channels = ['mail', 'database'];
    $daysPending = $requisition->submitted_at ? $requisition->submitted_at->diffInDays(now()) : 0;

    return $this->send(
      $requisition->id,
      $approverId,
      'reminder',
      "Reminder: Requisition Awaiting Approval - {$requisition->reference_number}",
      "This is a reminder that a requisition is awaiting your approval.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'days_pending' => $daysPending,
        'requester' => $requisition->user->full_name ?? 'Unknown',
        'url' => config('app.frontend_url') . '/approvals/pending',
        'action' => 'approve'
      ],
      $channels
    );
  }

  /**
   * Send escalation notification
   *
   * @param Requisition $requisition
   * @param int $escalateTo
   * @param string $reason
   * @return RequisitionNotification
   */
  public function sendEscalation(Requisition $requisition, int $escalateTo, string $reason): RequisitionNotification
  {
    $channels = ['mail', 'database'];

    return $this->send(
      $requisition->id,
      $escalateTo,
      'escalation',
      "Escalation: Requisition Needs Attention - {$requisition->reference_number}",
      "A requisition has been escalated to you.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'reason' => $reason,
        'requester' => $requisition->user->full_name ?? 'Unknown',
        'department' => $requisition->department->name ?? 'Unknown',
        'url' => config('app.frontend_url') . '/approvals/pending',
        'action' => 'approve'
      ],
      $channels
    );
  }

  /**
   * Send revision requested notification
   *
   * @param Requisition $requisition
   * @param int $approverId
   * @param string $reason
   * @return RequisitionNotification
   */
  public function notifyRevisionRequested(Requisition $requisition, int $approverId, string $reason): RequisitionNotification
  {
    $channels = ['mail', 'database'];

    return $this->send(
      $requisition->id,
      $approverId,
      'revision_requested',
      "Revision Requested: {$requisition->reference_number}",
      "A revision has been requested for this requisition.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'reason' => $reason,
        'requested_by' => Auth::user()?->full_name ?? 'System',
        'url' => config('app.frontend_url') . '/requisitions/' . $requisition->id,
        'action' => 'review'
      ],
      $channels
    );
  }

  /**
   * Send revision approved notification
   *
   * @param Requisition $requisition
   * @return RequisitionNotification
   */
  public function notifyRevisionApproved(Requisition $requisition): RequisitionNotification
  {
    $channels = ['mail', 'database'];

    return $this->send(
      $requisition->id,
      $requisition->user_id,
      'revision_approved',
      "Revision Approved: {$requisition->reference_number}",
      "Your revision has been approved.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'approved_by' => Auth::user()?->full_name ?? 'System',
        'url' => config('app.frontend_url') . '/requisitions/' . $requisition->id,
        'action' => 'view'
      ],
      $channels
    );
  }

  /**
   * Send revision rejected notification
   *
   * @param Requisition $requisition
   * @param string $reason
   * @return RequisitionNotification
   */
  public function notifyRevisionRejected(Requisition $requisition, string $reason): RequisitionNotification
  {
    $channels = ['mail', 'database'];

    return $this->send(
      $requisition->id,
      $requisition->user_id,
      'revision_rejected',
      "Revision Rejected: {$requisition->reference_number}",
      "Your revision has been rejected.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'reason' => $reason,
        'rejected_by' => Auth::user()?->full_name ?? 'System',
        'url' => config('app.frontend_url') . '/requisitions/' . $requisition->id,
        'action' => 'view'
      ],
      $channels
    );
  }

  /**
   * Send delegation notification
   *
   * @param Requisition $requisition
   * @param int $delegateId
   * @param int $approverId
   * @return RequisitionNotification
   */
  public function notifyDelegated(Requisition $requisition, int $delegateId, int $approverId): RequisitionNotification
  {
    $channels = ['mail', 'database'];
    $approver = User::find($approverId);

    return $this->send(
      $requisition->id,
      $delegateId,
      'delegated',
      "Approval Delegated: {$requisition->reference_number}",
      "Approval has been delegated to you.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'delegated_by' => $approver?->full_name ?? 'System',
        'url' => config('app.frontend_url') . '/approvals/pending',
        'action' => 'approve'
      ],
      $channels
    );
  }

  /**
   * Send budget alert notification
   *
   * @param Requisition $requisition
   * @param string $alertType
   * @param array $data
   * @return RequisitionNotification
   */
  public function sendBudgetAlert(Requisition $requisition, string $alertType, array $data = []): RequisitionNotification
  {
    $channels = ['mail', 'database'];
    $subject = "Budget Alert: {$requisition->reference_number}";
    $message = "A budget alert has been triggered for requisition {$requisition->reference_number}.";

    switch ($alertType) {
      case 'insufficient':
        $subject = "Insufficient Budget: {$requisition->reference_number}";
        $message = "The requisition amount exceeds the available budget. Available: {$data['available']}, Required: {$data['required']}";
        break;
      case 'exhausted':
        $subject = "Budget Exhausted: {$requisition->reference_number}";
        $message = "The budget has been fully utilized.";
        break;
      case 'threshold':
        $subject = "Budget Threshold Warning: {$requisition->reference_number}";
        $message = "Budget utilization has reached {$data['percentage']}% of allocated amount.";
        break;
    }

    return $this->send(
      $requisition->id,
      $requisition->user_id,
      'budget_alert',
      $subject,
      $message,
      array_merge([
        'reference_number' => $requisition->reference_number,
        'alert_type' => $alertType,
        'url' => config('app.frontend_url') . '/requisitions/' . $requisition->id,
      ], $data),
      $channels
    );
  }

  /**
   * Get notifications for a user
   *
   * @param int $userId
   * @param array $filters
   * @param int $perPage
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getForUser(int $userId, array $filters = [], int $perPage = 20)
  {
    $query = RequisitionNotification::forUser($userId)
      ->with(['requisition', 'sentBy']);

    if (isset($filters['is_read'])) {
      $query->where('is_read', $filters['is_read']);
    }

    if (!empty($filters['type'])) {
      $query->byType($filters['type']);
    }

    if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
      $query->whereBetween('created_at', [$filters['date_from'], $filters['date_to']]);
    }

    return $query->orderBy('created_at', 'desc')->paginate($perPage);
  }

  /**
   * Mark notification as read
   *
   * @param int $notificationId
   * @return RequisitionNotification
   * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
   */
  public function markAsRead(int $notificationId): RequisitionNotification
  {
    $notification = RequisitionNotification::findOrFail($notificationId);
    $notification->markAsRead();
    return $notification->fresh();
  }

  /**
   * Mark all notifications as read for a user
   *
   * @param int $userId
   * @return int
   */
  public function markAllAsRead(int $userId): int
  {
    return RequisitionNotification::forUser($userId)
      ->where('is_read', false)
      ->update([
        'is_read' => true,
        'read_at' => now(),
      ]);
  }

  /**
   * Get unread count for a user
   *
   * @param int $userId
   * @return int
   */
  public function getUnreadCount(int $userId): int
  {
    return RequisitionNotification::forUser($userId)
      ->where('is_read', false)
      ->count();
  }

  /**
   * Delete notification
   *
   * @param int $notificationId
   * @return bool
   * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
   */
  public function delete(int $notificationId): bool
  {
    $notification = RequisitionNotification::findOrFail($notificationId);
    return $notification->delete();
  }

  /**
   * Delete all notifications for a user
   *
   * @param int $userId
   * @return int
   */
  public function deleteAllForUser(int $userId): int
  {
    return RequisitionNotification::forUser($userId)->delete();
  }

  /**
   * Get next approver for requisition
   *
   * @param Requisition $requisition
   * @param string $currentLevel
   * @return int|null
   */
  protected function getNextApprover(Requisition $requisition, string $currentLevel): ?int
  {
    $levels = ['hod', 'accountant', 'principal', 'final'];
    $currentIndex = array_search($currentLevel, $levels);

    if ($currentIndex !== false && isset($levels[$currentIndex + 1])) {
      $nextLevel = $levels[$currentIndex + 1];

      // Find approval for next level
      $approval = $requisition->approvals()
        ->where('level', $nextLevel)
        ->where('status', 'pending')
        ->first();

      if ($approval) {
        return $approval->approver_id;
      }
    }

    return null;
  }

  /**
   * Send notification to multiple users
   *
   * @param int $requisitionId
   * @param array $userIds
   * @param string $type
   * @param string $subject
   * @param string $message
   * @param array $data
   * @param array $channels
   * @return array
   */
  public function sendBulk(
    int $requisitionId,
    array $userIds,
    string $type,
    string $subject,
    string $message,
    array $data = [],
    array $channels = ['mail', 'database']
  ): array {
    $notifications = [];

    foreach ($userIds as $userId) {
      try {
        $notifications[] = $this->send(
          $requisitionId,
          $userId,
          $type,
          $subject,
          $message,
          $data,
          $channels
        );
      } catch (\Exception $e) {
        Log::warning("Failed to send notification to user {$userId}: " . $e->getMessage());
      }
    }

    return $notifications;
  }

  /**
   * Send notifications to all approvers
   *
   * @param Requisition $requisition
   * @return array
   */
  public function notifyAllApprovers(Requisition $requisition): array
  {
    $approverIds = $requisition->approvals()
      ->where('status', 'pending')
      ->pluck('approver_id')
      ->toArray();

    if (empty($approverIds)) {
      return [];
    }

    return $this->sendBulk(
      $requisition->id,
      $approverIds,
      'approval_required',
      "Approval Required: {$requisition->reference_number}",
      "A requisition is awaiting your approval.",
      [
        'reference_number' => $requisition->reference_number,
        'amount' => $requisition->total_amount,
        'requester' => $requisition->user->full_name ?? 'Unknown',
        'url' => config('app.frontend_url') . '/approvals/pending',
        'action' => 'approve'
      ],
      ['mail', 'database']
    );
  }

  /**
   * Get notification statistics for a user
   *
   * @param int $userId
   * @return array
   */
  public function getStatsForUser(int $userId): array
  {
    $query = RequisitionNotification::forUser($userId);

    return [
      'total' => (clone $query)->count(),
      'unread' => (clone $query)->where('is_read', false)->count(),
      'read' => (clone $query)->where('is_read', true)->count(),
      'by_type' => (clone $query)->select('type', DB::raw('count(*) as count'))
        ->groupBy('type')
        ->get()
        ->pluck('count', 'type')
        ->toArray(),
      'by_channel' => $this->getChannelStats($userId),
    ];
  }

  /**
   * Get channel statistics for a user
   *
   * @param int $userId
   * @return array
   */
  protected function getChannelStats(int $userId): array
  {
    $notifications = RequisitionNotification::forUser($userId)->get();
    $stats = [];

    foreach ($notifications as $notification) {
      $channels = explode(',', $notification->channel);
      foreach ($channels as $channel) {
        if (!isset($stats[$channel])) {
          $stats[$channel] = 0;
        }
        $stats[$channel]++;
      }
    }

    return $stats;
  }
}
