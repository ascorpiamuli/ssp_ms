<?php
// app/Services/Procurement/Utilities/NotificationDispatcher.php

declare(strict_types=1);

namespace App\Services\Procurement\Utilities;

use App\Models\User;
use App\Models\ProcurementNotification;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Notifications\Procurement\QuotationRequestNotification;
use App\Notifications\Procurement\QuotationResponseNotification;
use App\Notifications\Procurement\SupplierSelectedNotification;
use App\Notifications\Procurement\PurchaseOrderNotification;
use App\Notifications\Procurement\GoodsReceivedNotification;
use App\Notifications\Procurement\InvoiceNotification;
use App\Notifications\Procurement\PaymentVoucherNotification;
use App\Notifications\Procurement\ApprovalRequiredNotification;
use App\Notifications\Procurement\ApprovalStatusNotification;
use App\Notifications\Procurement\ContractNotification;
use App\Notifications\Procurement\TenderNotification;
use App\Notifications\Procurement\ReminderNotification;

class NotificationDispatcher implements NotificationDispatcherInterface
{
  protected array $eventMap = [];
  protected array $priorities = [];
  protected array $channels = [];

  public function __construct()
  {
    $this->registerDefaultEvents();
  }

  public function notify(string $event, array $data): void
  {
    if (!$this->eventExists($event)) {
      throw new \Exception("Unknown notification event: {$event}");
    }

    $config = $this->getEventConfig($event);
    $notificationClass = $config['class'];
    $recipients = $this->getRecipients($event, $data, $config['roles'] ?? []);

    foreach ($recipients as $recipient) {
      $this->sendNotification($recipient, $notificationClass, $data);
    }
  }

  public function notifyUser(int $userId, string $event, array $data): void
  {
    $user = User::find($userId);
    if (!$user) {
      return;
    }

    if (!$this->eventExists($event)) {
      throw new \Exception("Unknown notification event: {$event}");
    }

    $config = $this->getEventConfig($event);
    $notificationClass = $config['class'];
    $this->sendNotification($user, $notificationClass, $data);
  }

  public function notifySupplier(int $supplierId, string $event, array $data): void
  {
    $supplier = User::where('id', $supplierId)
      ->where('role', 'supplier')
      ->first();

    if (!$supplier) {
      return;
    }

    if (!$this->eventExists($event)) {
      throw new \Exception("Unknown notification event: {$event}");
    }

    $config = $this->getEventConfig($event);
    $notificationClass = $config['class'];
    $this->sendNotification($supplier, $notificationClass, $data);
  }

  public function notifyRole(string $role, string $event, array $data): void
  {
    $users = User::where('role', $role)
      ->where('is_active', true)
      ->get();

    if ($users->isEmpty()) {
      return;
    }

    if (!$this->eventExists($event)) {
      throw new \Exception("Unknown notification event: {$event}");
    }

    $config = $this->getEventConfig($event);
    $notificationClass = $config['class'];

    foreach ($users as $user) {
      $this->sendNotification($user, $notificationClass, $data);
    }
  }

  public function notifyUsers(array $userIds, string $event, array $data): void
  {
    if (empty($userIds)) {
      return;
    }

    $users = User::whereIn('id', $userIds)
      ->where('is_active', true)
      ->get();

    if ($users->isEmpty()) {
      return;
    }

    if (!$this->eventExists($event)) {
      throw new \Exception("Unknown notification event: {$event}");
    }

    $config = $this->getEventConfig($event);
    $notificationClass = $config['class'];

    foreach ($users as $user) {
      $this->sendNotification($user, $notificationClass, $data);
    }
  }

  public function notifySuppliers(array $supplierIds, string $event, array $data): void
  {
    if (empty($supplierIds)) {
      return;
    }

    $suppliers = User::whereIn('id', $supplierIds)
      ->where('role', 'supplier')
      ->where('is_active', true)
      ->get();

    if ($suppliers->isEmpty()) {
      return;
    }

    if (!$this->eventExists($event)) {
      throw new \Exception("Unknown notification event: {$event}");
    }

    $config = $this->getEventConfig($event);
    $notificationClass = $config['class'];

    foreach ($suppliers as $supplier) {
      $this->sendNotification($supplier, $notificationClass, $data);
    }
  }

  public function getUserChannels(int $userId): array
  {
    $user = User::find($userId);
    if (!$user) {
      return ['database'];
    }

    $channels = ['database'];

    // Check if user has email preference
    if ($user->email && ($user->email_notifications ?? true)) {
      $channels[] = 'mail';
    }

    // Check if user has SMS preference
    if ($user->phone && ($user->sms_notifications ?? false)) {
      $channels[] = 'nexmo';
    }

    return $channels;
  }

  public function getSupplierChannels(int $supplierId): array
  {
    $supplier = User::where('id', $supplierId)
      ->where('role', 'supplier')
      ->first();

    if (!$supplier) {
      return ['database'];
    }

    $channels = ['database'];

    // Suppliers always get emails
    if ($supplier->email) {
      $channels[] = 'mail';
    }

    return $channels;
  }

  public function getAvailableChannels(): array
  {
    return ['database', 'mail', 'nexmo', 'broadcast'];
  }

  public function registerEvent(string $event, array $config): void
  {
    $this->eventMap[$event] = $config;
  }

  public function getEventConfig(string $event): array
  {
    return $this->eventMap[$event] ?? [];
  }

  public function eventExists(string $event): bool
  {
    return isset($this->eventMap[$event]);
  }

  public function getRegisteredEvents(): array
  {
    return array_keys($this->eventMap);
  }

  public function setPriority(string $event, string $priority): void
  {
    $this->priorities[$event] = $priority;
  }

  public function getPriority(string $event): string
  {
    return $this->priorities[$event] ?? 'normal';
  }

  public function notifyBulk(array $notifications): void
  {
    foreach ($notifications as $notification) {
      $this->notify(
        $notification['event'],
        $notification['data']
      );
    }
  }

  public function queueNotification(string $event, array $data, ?\DateTime $delay = null): void
  {
    // Queue the notification for later delivery
    // This would use Laravel's queue system
    dispatch(function () use ($event, $data) {
      $this->notify($event, $data);
    })->delay($delay ?? now()->addMinutes(5));
  }

  public function getNotificationHistory(int $userId, int $limit = 50): array
  {
    return ProcurementNotification::where('user_id', $userId)
      ->orderBy('created_at', 'desc')
      ->limit($limit)
      ->get()
      ->toArray();
  }

  public function getNotificationStatistics(): array
  {
    return [
      'total' => ProcurementNotification::count(),
      'sent' => ProcurementNotification::where('is_sent', true)->count(),
      'delivered' => ProcurementNotification::where('is_delivered', true)->count(),
      'read' => ProcurementNotification::where('is_read', true)->count(),
      'unread' => ProcurementNotification::where('is_read', false)->count(),
      'failed' => ProcurementNotification::whereNotNull('error_message')->count(),
    ];
  }

  public function markAsRead(int $notificationId): void
  {
    $notification = ProcurementNotification::find($notificationId);
    if ($notification) {
      $notification->markAsRead();
    }
  }

  public function markAllAsRead(int $userId): void
  {
    ProcurementNotification::where('user_id', $userId)
      ->where('is_read', false)
      ->update([
        'is_read' => true,
        'read_at' => now(),
      ]);
  }

  public function getUnreadCount(int $userId): int
  {
    return ProcurementNotification::where('user_id', $userId)
      ->where('is_read', false)
      ->count();
  }

  /**
   * Register default notification events.
   */
  protected function registerDefaultEvents(): void
  {
    $this->eventMap = [
      // Quotation events
      'qtn_generated' => [
        'class' => QuotationRequestNotification::class,
        'roles' => ['procurement'],
        'priority' => 'normal',
      ],
      'qtn_sent' => [
        'class' => QuotationRequestNotification::class,
        'roles' => ['supplier'],
        'priority' => 'normal',
      ],
      'qtn_reminder' => [
        'class' => ReminderNotification::class,
        'roles' => ['supplier'],
        'priority' => 'normal',
      ],
      'quotation_received' => [
        'class' => QuotationResponseNotification::class,
        'roles' => ['procurement', 'accountant'],
        'priority' => 'normal',
      ],
      'supplier_selected' => [
        'class' => SupplierSelectedNotification::class,
        'roles' => ['supplier', 'hod'],
        'priority' => 'high',
      ],
      // Purchase Order events
      'po_generated' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['supplier', 'procurement', 'accountant'],
        'priority' => 'normal',
      ],
      'po_sent' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['supplier'],
        'priority' => 'normal',
      ],
      'po_approved' => [
        'class' => ApprovalStatusNotification::class,
        'roles' => ['procurement', 'accountant'],
        'priority' => 'normal',
      ],
      // GRN/SAN events
      'grn_generated' => [
        'class' => GoodsReceivedNotification::class,
        'roles' => ['accountant', 'procurement'],
        'priority' => 'normal',
      ],
      'grn_approval_required' => [
        'class' => ApprovalRequiredNotification::class,
        'roles' => ['hod', 'principal'],
        'priority' => 'high',
      ],
      'grn_approved' => [
        'class' => ApprovalStatusNotification::class,
        'roles' => ['accountant', 'procurement'],
        'priority' => 'normal',
      ],
      // Invoice events
      'invoice_submitted' => [
        'class' => InvoiceNotification::class,
        'roles' => ['accountant'],
        'priority' => 'high',
      ],
      'invoice_verified' => [
        'class' => InvoiceNotification::class,
        'roles' => ['supplier', 'accountant'],
        'priority' => 'normal',
      ],
      'invoice_paid' => [
        'class' => InvoiceNotification::class,
        'roles' => ['supplier', 'accountant'],
        'priority' => 'normal',
      ],
      // Payment events
      'voucher_prepared' => [
        'class' => PaymentVoucherNotification::class,
        'roles' => ['principal', 'diocesan_accountant'],
        'priority' => 'high',
      ],
      'voucher_endorsed' => [
        'class' => PaymentVoucherNotification::class,
        'roles' => ['accountant', 'principal'],
        'priority' => 'normal',
      ],
      'voucher_approved' => [
        'class' => PaymentVoucherNotification::class,
        'roles' => ['accountant'],
        'priority' => 'normal',
      ],
      // Contract events
      'contract_created' => [
        'class' => ContractNotification::class,
        'roles' => ['supplier', 'procurement'],
        'priority' => 'normal',
      ],
      'contract_activated' => [
        'class' => ContractNotification::class,
        'roles' => ['supplier', 'procurement'],
        'priority' => 'normal',
      ],
      'contract_expiring' => [
        'class' => ReminderNotification::class,
        'roles' => ['procurement', 'supplier'],
        'priority' => 'normal',
      ],
      // Tender events
      'tender_published' => [
        'class' => TenderNotification::class,
        'roles' => ['supplier'],
        'priority' => 'normal',
      ],
      'tender_awarded' => [
        'class' => TenderNotification::class,
        'roles' => ['supplier', 'procurement'],
        'priority' => 'high',
      ],
      // Approval events
      'approval_required' => [
        'class' => ApprovalRequiredNotification::class,
        'roles' => ['hod', 'accountant', 'principal', 'final_approver'],
        'priority' => 'high',
      ],
      'approval_completed' => [
        'class' => ApprovalStatusNotification::class,
        'roles' => ['requisition_creator'],
        'priority' => 'normal',
      ],
    ];
  }

  /**
   * Get recipients for an event.
   */
  protected function getRecipients(string $event, array $data, array $roles): array
  {
    $recipients = [];

    // Check for specific recipients in data
    if (isset($data['user_ids']) && is_array($data['user_ids'])) {
      $users = User::whereIn('id', $data['user_ids'])
        ->where('is_active', true)
        ->get();
      $recipients = array_merge($recipients, $users->toArray());
    }

    if (isset($data['supplier_ids']) && is_array($data['supplier_ids'])) {
      $suppliers = User::whereIn('id', $data['supplier_ids'])
        ->where('role', 'supplier')
        ->where('is_active', true)
        ->get();
      $recipients = array_merge($recipients, $suppliers->toArray());
    }

    // Get recipients by roles
    foreach ($roles as $role) {
      if ($role === 'supplier') {
        if (isset($data['supplier_ids']) && !empty($data['supplier_ids'])) {
          continue;
        }
        $users = User::where('role', 'supplier')
          ->where('is_active', true)
          ->get();
        $recipients = array_merge($recipients, $users->toArray());
      } elseif ($role === 'requisition_creator') {
        if (isset($data['requisition_id'])) {
          $requisition = \App\Models\Requisition::find($data['requisition_id']);
          if ($requisition && $requisition->user) {
            $recipients[] = $requisition->user->toArray();
          }
        }
      } else {
        $users = User::where('role', $role)
          ->where('is_active', true)
          ->get();
        $recipients = array_merge($recipients, $users->toArray());
      }
    }

    // Remove duplicates
    $seen = [];
    $uniqueRecipients = [];
    foreach ($recipients as $recipient) {
      if (!isset($seen[$recipient['id']])) {
        $seen[$recipient['id']] = true;
        $uniqueRecipients[] = $recipient;
      }
    }

    $userIds = array_column($uniqueRecipients, 'id');
    return User::whereIn('id', $userIds)->get()->toArray();
  }

  /**
   * Send notification to a recipient.
   */
  protected function sendNotification($recipient, string $notificationClass, array $data): void
  {
    $user = $recipient instanceof User ? $recipient : User::find($recipient['id'] ?? $recipient);

    if (!$user) {
      return;
    }

    $channels = $this->getUserChannels($user->id);

    try {
      $notification = new $notificationClass($data);
      $user->notify($notification);
    } catch (\Exception $e) {
      Log::error('Failed to send notification', [
        'user_id' => $user->id,
        'notification_class' => $notificationClass,
        'error' => $e->getMessage(),
      ]);
    }

    // Save notification record
    $this->saveNotificationRecord($user->id, $data);
  }

  /**
   * Save notification record for audit.
   */
  protected function saveNotificationRecord(int $userId, array $data): void
  {
    ProcurementNotification::create([
      'user_id' => $userId,
      'requisition_id' => $data['requisition_id'] ?? null,
      'type' => $data['type'] ?? 'general',
      'subject' => $data['subject'] ?? 'Procurement Notification',
      'message' => $data['message'] ?? null,
      'data' => $data,
      'sent_by' => auth()->id(),
      'sent_at' => now(),
    ]);
  }
}
