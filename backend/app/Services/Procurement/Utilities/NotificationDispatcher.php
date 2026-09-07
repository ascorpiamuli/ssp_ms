<?php
// app/Services/Procurement/Utilities/NotificationDispatcher.php

declare(strict_types=1);

namespace App\Services\Procurement\Utilities;

use App\Models\User;
use App\Models\ProcurementNotification;
use App\Models\QuotationRequest;
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
use App\Notifications\Procurement\ProcurementStartedNotification;

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
    Log::info('🔔 [NotificationDispatcher::notify]', [
      'event' => $event,
      'data_keys' => array_keys($data)
    ]);

    if (!$this->eventExists($event)) {
      throw new \Exception("Unknown notification event: {$event}");
    }

    // Ensure requisition_id is set
    $data = $this->ensureRequisitionId($data);

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

    // Ensure requisition_id is set
    $data = $this->ensureRequisitionId($data);

    $config = $this->getEventConfig($event);
    $notificationClass = $config['class'];
    $this->sendNotification($user, $notificationClass, $data);
  }

  public function notifySupplier(int $supplierId, string $event, array $data): void
  {
    // 🔧 FIX: Get supplier from suppliers table
    $supplier = \App\Models\Supplier::with('user')->find($supplierId);

    if (!$supplier || !$supplier->user) {
      return;
    }

    if (!$this->eventExists($event)) {
      throw new \Exception("Unknown notification event: {$event}");
    }

    // Ensure requisition_id is set
    $data = $this->ensureRequisitionId($data);

    $config = $this->getEventConfig($event);
    $notificationClass = $config['class'];
    $this->sendNotification($supplier->user, $notificationClass, $data);
  }

  public function notifyRole(string $role, string $event, array $data): void
  {
    // 🔧 FIX: Use Spatie Permission role checking
    $users = User::where('is_active', true)
      ->role($role)
      ->get();

    if ($users->isEmpty()) {
      return;
    }

    if (!$this->eventExists($event)) {
      throw new \Exception("Unknown notification event: {$event}");
    }

    // Ensure requisition_id is set
    $data = $this->ensureRequisitionId($data);

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

    // Ensure requisition_id is set
    $data = $this->ensureRequisitionId($data);

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

    // 🔧 FIX: Get suppliers from suppliers table
    $suppliers = \App\Models\Supplier::whereIn('id', $supplierIds)
      ->with('user')
      ->get()
      ->filter(function ($supplier) {
        return $supplier->user && $supplier->user->is_active;
      })
      ->map(function ($supplier) {
        return $supplier->user;
      })
      ->filter();

    if ($suppliers->isEmpty()) {
      return;
    }

    if (!$this->eventExists($event)) {
      throw new \Exception("Unknown notification event: {$event}");
    }

    // Ensure requisition_id is set
    $data = $this->ensureRequisitionId($data);

    $config = $this->getEventConfig($event);
    $notificationClass = $config['class'];

    foreach ($suppliers as $user) {
      $this->sendNotification($user, $notificationClass, $data);
    }
  }

  protected function ensureRequisitionId(array $data): array
  {
    // If requisition_id is already set and not null, return as is
    if (isset($data['requisition_id']) && $data['requisition_id'] !== null) {
      return $data;
    }

    Log::info('🔔 [NotificationDispatcher::ensureRequisitionId] requisition_id not set, attempting to find it');

    // Try to get requisition_id from qtn_id
    if (isset($data['qtn_id'])) {
      try {
        $quotation = QuotationRequest::find($data['qtn_id']);
        if ($quotation && $quotation->requisition_id) {
          $data['requisition_id'] = $quotation->requisition_id;
          Log::info('✅ [NotificationDispatcher::ensureRequisitionId] Found requisition_id from qtn_id', [
            'qtn_id' => $data['qtn_id'],
            'requisition_id' => $data['requisition_id']
          ]);
          return $data;
        }
      } catch (\Exception $e) {
        Log::warning('⚠️ [NotificationDispatcher::ensureRequisitionId] Failed to get requisition_id from qtn_id', [
          'qtn_id' => $data['qtn_id'],
          'error' => $e->getMessage()
        ]);
      }
    }

    // Try to get requisition_id from rfq_id (alias for qtn_id)
    if (isset($data['rfq_id'])) {
      try {
        $quotation = QuotationRequest::find($data['rfq_id']);
        if ($quotation && $quotation->requisition_id) {
          $data['requisition_id'] = $quotation->requisition_id;
          Log::info('✅ [NotificationDispatcher::ensureRequisitionId] Found requisition_id from rfq_id', [
            'rfq_id' => $data['rfq_id'],
            'requisition_id' => $data['requisition_id']
          ]);
          return $data;
        }
      } catch (\Exception $e) {
        Log::warning('⚠️ [NotificationDispatcher::ensureRequisitionId] Failed to get requisition_id from rfq_id', [
          'rfq_id' => $data['rfq_id'],
          'error' => $e->getMessage()
        ]);
      }
    }

    // Try to get requisition_id from data array if it exists but is null
    if (isset($data['data']) && is_array($data['data'])) {
      if (isset($data['data']['qtn_id'])) {
        try {
          $quotation = QuotationRequest::find($data['data']['qtn_id']);
          if ($quotation && $quotation->requisition_id) {
            $data['requisition_id'] = $quotation->requisition_id;
            Log::info('✅ [NotificationDispatcher::ensureRequisitionId] Found requisition_id from nested qtn_id', [
              'qtn_id' => $data['data']['qtn_id'],
              'requisition_id' => $data['requisition_id']
            ]);
            return $data;
          }
        } catch (\Exception $e) {
          Log::warning('⚠️ [NotificationDispatcher::ensureRequisitionId] Failed to get requisition_id from nested qtn_id', [
            'error' => $e->getMessage()
          ]);
        }
      }
    }

    // ✅ FIXED: Use only 'user_id' column (not 'created_by')
    if (auth()->check() && auth()->user()) {
      // Try to find any requisition created by the current user
      $requisition = \App\Models\Requisition::where('user_id', auth()->id())
        ->latest()
        ->first();

      if ($requisition) {
        $data['requisition_id'] = $requisition->id;
        Log::info('✅ [NotificationDispatcher::ensureRequisitionId] Using fallback requisition_id from user context', [
          'requisition_id' => $data['requisition_id']
        ]);
        return $data;
      }
    }

    // Last resort: throw an exception if requisition_id is still null and it's a critical notification
    $criticalEvents = ['qtn_sent', 'qtn_reminder', 'supplier_selected', 'po_generated', 'po_sent', 'po_cancelled'];
    if (in_array($data['type'] ?? '', $criticalEvents) || in_array($data['event'] ?? '', $criticalEvents)) {
      Log::error('❌ [NotificationDispatcher::ensureRequisitionId] Critical notification missing requisition_id', [
        'data' => $data
      ]);
      // Don't throw exception, use a default placeholder
      $data['requisition_id'] = 0; // Use 0 as a placeholder for critical notifications
    } else {
      // For non-critical notifications, we can proceed with null
      $data['requisition_id'] = null;
    }

    return $data;
  }

  public function getUserChannels(int $userId): array
  {
    $user = User::find($userId);
    if (!$user) {
      return ['database'];
    }

    $channels = ['database'];

    if ($user->email && ($user->email_notifications ?? true)) {
      $channels[] = 'mail';
    }

    if ($user->phone && ($user->sms_notifications ?? false)) {
      $channels[] = 'nexmo';
    }

    return $channels;
  }

  public function getSupplierChannels(int $supplierId): array
  {
    // 🔧 FIX: Get supplier from suppliers table
    $supplier = \App\Models\Supplier::with('user')->find($supplierId);

    if (!$supplier || !$supplier->user) {
      return ['database'];
    }

    $channels = ['database'];

    if ($supplier->user->email) {
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

  protected function registerDefaultEvents(): void
  {
    $this->eventMap = [
      // ============================================
      // PROCUREMENT EVENTS
      // ============================================
      'procurement_started' => [
        'class' => ProcurementStartedNotification::class,
        'roles' => ['PROCUREMENT', 'ADMIN'],
        'priority' => 'normal',
      ],

      // ============================================
      // QUOTATION EVENTS
      // ============================================
      'qtn_generated' => [
        'class' => QuotationRequestNotification::class,
        'roles' => ['PROCUREMENT'],
        'priority' => 'normal',
      ],
      'qtn_sent' => [
        'class' => QuotationRequestNotification::class,
        'roles' => ['SUPPLIER'],
        'priority' => 'normal',
      ],
      'qtn_reminder' => [
        'class' => ReminderNotification::class,
        'roles' => ['SUPPLIER'],
        'priority' => 'normal',
      ],
      'quotation_received' => [
        'class' => QuotationResponseNotification::class,
        'roles' => ['PROCUREMENT', 'ACCOUNTANT'],
        'priority' => 'normal',
      ],
      'supplier_selected' => [
        'class' => SupplierSelectedNotification::class,
        'roles' => ['SUPPLIER', 'HOD'],
        'priority' => 'high',
      ],

      // ============================================
      // PURCHASE ORDER EVENTS
      // ============================================
      'po_generated' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['SUPPLIER', 'PROCUREMENT', 'ACCOUNTANT'],
        'priority' => 'normal',
      ],
      'po_sent' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['SUPPLIER'],
        'priority' => 'normal',
      ],
      'po_approved' => [
        'class' => ApprovalStatusNotification::class,
        'roles' => ['PROCUREMENT', 'ACCOUNTANT'],
        'priority' => 'normal',
      ],
      'po_cancelled' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['SUPPLIER', 'PROCUREMENT', 'ACCOUNTANT', 'HOD'],
        'priority' => 'high',
      ],
      'po_checked' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['ACCOUNTANT', 'PROCUREMENT'],
        'priority' => 'normal',
      ],
      'po_endorsed' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['FINAL_APPROVER', 'PROCUREMENT'],
        'priority' => 'normal',
      ],
      'po_issued' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['SUPPLIER', 'PROCUREMENT'],
        'priority' => 'normal',
      ],
      'po_delivered' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['ACCOUNTANT', 'PROCUREMENT', 'HOD'],
        'priority' => 'normal',
      ],
      'po_completed' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['ACCOUNTANT', 'PROCUREMENT', 'HOD', 'SUPPLIER'],
        'priority' => 'normal',
      ],
      'po_ready_for_endorsement' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['ACCOUNTANT'],
        'priority' => 'high',
      ],
      'po_ready_for_approval' => [
        'class' => PurchaseOrderNotification::class,
        'roles' => ['FINAL_APPROVER'],
        'priority' => 'high',
      ],

      // ============================================
      // GRN EVENTS
      // ============================================
      'grn_generated' => [
        'class' => GoodsReceivedNotification::class,
        'roles' => ['ACCOUNTANT', 'PROCUREMENT'],
        'priority' => 'normal',
      ],
      'grn_approval_required' => [
        'class' => ApprovalRequiredNotification::class,
        'roles' => ['HOD', 'HEAD OF INSTITUTION'],
        'priority' => 'high',
      ],
      'grn_submitted' => [
        'class' => ApprovalRequiredNotification::class,
        'roles' => ['HOD', 'HEAD OF INSTITUTION'],
        'priority' => 'high',
      ],
      'grn_approved' => [
        'class' => ApprovalStatusNotification::class,
        'roles' => ['ACCOUNTANT', 'PROCUREMENT'],
        'priority' => 'normal',
      ],
      'grn_rejected' => [
        'class' => ApprovalStatusNotification::class,
        'roles' => ['ACCOUNTANT', 'PROCUREMENT', 'SUPPLIER'],
        'priority' => 'normal',
      ],
      'grn_inspected' => [
        'class' => GoodsReceivedNotification::class,
        'roles' => ['PROCUREMENT', 'ACCOUNTANT'],
        'priority' => 'normal',
      ],

      // ============================================
      // ✅ SAN EVENTS - ADDED
      // ============================================
      'san_generated' => [
        'class' => GoodsReceivedNotification::class,
        'roles' => ['ACCOUNTANT', 'PROCUREMENT'],
        'priority' => 'normal',
      ],
      'san_approval_required' => [
        'class' => ApprovalRequiredNotification::class,
        'roles' => ['HOD', 'HEAD OF INSTITUTION'],
        'priority' => 'high',
      ],
      'san_submitted' => [
        'class' => ApprovalRequiredNotification::class,
        'roles' => ['HOD', 'HEAD OF INSTITUTION'],
        'priority' => 'high',
      ],
      'san_approved' => [
        'class' => ApprovalStatusNotification::class,
        'roles' => ['ACCOUNTANT', 'PROCUREMENT'],
        'priority' => 'normal',
      ],
      'san_rejected' => [
        'class' => ApprovalStatusNotification::class,
        'roles' => ['ACCOUNTANT', 'PROCUREMENT', 'SUPPLIER'],
        'priority' => 'normal',
      ],
      'san_quality_rated' => [
        'class' => ApprovalStatusNotification::class,
        'roles' => ['PROCUREMENT', 'SUPPLIER'],
        'priority' => 'normal',
      ],

      // ============================================
      // INVOICE EVENTS
      // ============================================
      'invoice_submitted' => [
        'class' => InvoiceNotification::class,
        'roles' => ['ACCOUNTANT'],
        'priority' => 'high',
      ],
      'invoice_verified' => [
        'class' => InvoiceNotification::class,
        'roles' => ['SUPPLIER', 'ACCOUNTANT'],
        'priority' => 'normal',
      ],
      'invoice_paid' => [
        'class' => InvoiceNotification::class,
        'roles' => ['SUPPLIER', 'ACCOUNTANT'],
        'priority' => 'normal',
      ],

      // ============================================
      // PAYMENT VOUCHER EVENTS
      // ============================================
      'voucher_prepared' => [
        'class' => PaymentVoucherNotification::class,
        'roles' => ['HEAD OF INSTITUTION', 'ACCOUNTANT'],
        'priority' => 'high',
      ],
      'voucher_endorsed' => [
        'class' => PaymentVoucherNotification::class,
        'roles' => ['ACCOUNTANT', 'HEAD OF INSTITUTION'],
        'priority' => 'normal',
      ],
      'voucher_approved' => [
        'class' => PaymentVoucherNotification::class,
        'roles' => ['ACCOUNTANT'],
        'priority' => 'normal',
      ],

      // ============================================
      // CONTRACT EVENTS
      // ============================================
      'contract_created' => [
        'class' => ContractNotification::class,
        'roles' => ['SUPPLIER', 'PROCUREMENT'],
        'priority' => 'normal',
      ],
      'contract_activated' => [
        'class' => ContractNotification::class,
        'roles' => ['SUPPLIER', 'PROCUREMENT'],
        'priority' => 'normal',
      ],
      'contract_expiring' => [
        'class' => ReminderNotification::class,
        'roles' => ['PROCUREMENT', 'SUPPLIER'],
        'priority' => 'normal',
      ],

      // ============================================
      // TENDER EVENTS
      // ============================================
      'tender_published' => [
        'class' => TenderNotification::class,
        'roles' => ['SUPPLIER'],
        'priority' => 'normal',
      ],
      'tender_awarded' => [
        'class' => TenderNotification::class,
        'roles' => ['SUPPLIER', 'PROCUREMENT'],
        'priority' => 'high',
      ],

      // ============================================
      // APPROVAL EVENTS
      // ============================================
      'approval_required' => [
        'class' => ApprovalRequiredNotification::class,
        'roles' => ['HOD', 'ACCOUNTANT', 'HEAD OF INSTITUTION', 'FINAL_APPROVER'],
        'priority' => 'high',
      ],
      'approval_completed' => [
        'class' => ApprovalStatusNotification::class,
        'roles' => ['requisition_creator'],
        'priority' => 'normal',
      ],
    ];
  }

  protected function getRecipients(string $event, array $data, array $roles): array
  {
    $recipients = [];

    if (isset($data['user_ids']) && is_array($data['user_ids'])) {
      $users = User::whereIn('id', $data['user_ids'])
        ->where('is_active', true)
        ->get();
      $recipients = array_merge($recipients, $users->toArray());
    }

    if (isset($data['supplier_ids']) && is_array($data['supplier_ids'])) {
      // 🔧 FIX: Get suppliers from suppliers table
      $suppliers = \App\Models\Supplier::whereIn('id', $data['supplier_ids'])
        ->with('user')
        ->get()
        ->filter(function ($supplier) {
          return $supplier->user && $supplier->user->is_active;
        })
        ->map(function ($supplier) {
          return $supplier->user;
        })
        ->filter()
        ->toArray();
      $recipients = array_merge($recipients, $suppliers);
    }

    foreach ($roles as $role) {
      if ($role === 'SUPPLIER') {
        if (isset($data['supplier_ids']) && !empty($data['supplier_ids'])) {
          continue;
        }
        // 🔧 FIX: Get users who are suppliers via Supplier model
        $supplierUsers = \App\Models\Supplier::with('user')
          ->get()
          ->filter(function ($supplier) {
            return $supplier->user && $supplier->user->is_active;
          })
          ->map(function ($supplier) {
            return $supplier->user;
          })
          ->filter()
          ->toArray();
        $recipients = array_merge($recipients, $supplierUsers);
      } elseif ($role === 'requisition_creator') {
        if (isset($data['requisition_id'])) {
          $requisition = \App\Models\Requisition::find($data['requisition_id']);
          if ($requisition && $requisition->user) {
            $recipients[] = $requisition->user->toArray();
          }
        }
      } else {
        // 🔧 FIX: Use Spatie Permission's role checking with UPPERCASE role names
        $users = User::where('is_active', true)
          ->role($role)  // Spatie's role() method will handle the name
          ->get()
          ->toArray();
        $recipients = array_merge($recipients, $users);
      }
    }

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

    // Ensure requisition_id is set before saving
    $data = $this->ensureRequisitionId($data);
    $this->saveNotificationRecord($user->id, $data);
  }

  protected function saveNotificationRecord(int $userId, array $data): void
  {
    // Ensure requisition_id is not null
    $requisitionId = $data['requisition_id'] ?? null;

    // If requisition_id is null, try to find it from the data
    if ($requisitionId === null) {
      Log::warning('⚠️ [NotificationDispatcher::saveNotificationRecord] requisition_id is null, attempting to find it', [
        'data' => $data
      ]);

      // Try to get from qtn_id
      if (isset($data['qtn_id'])) {
        try {
          $quotation = QuotationRequest::find($data['qtn_id']);
          if ($quotation && $quotation->requisition_id) {
            $requisitionId = $quotation->requisition_id;
            Log::info('✅ [NotificationDispatcher::saveNotificationRecord] Found requisition_id from qtn_id', [
              'qtn_id' => $data['qtn_id'],
              'requisition_id' => $requisitionId
            ]);
          }
        } catch (\Exception $e) {
          Log::warning('⚠️ [NotificationDispatcher::saveNotificationRecord] Failed to get requisition_id from qtn_id', [
            'error' => $e->getMessage()
          ]);
        }
      }

      // Try to get from rfq_id
      if ($requisitionId === null && isset($data['rfq_id'])) {
        try {
          $quotation = QuotationRequest::find($data['rfq_id']);
          if ($quotation && $quotation->requisition_id) {
            $requisitionId = $quotation->requisition_id;
            Log::info('✅ [NotificationDispatcher::saveNotificationRecord] Found requisition_id from rfq_id', [
              'rfq_id' => $data['rfq_id'],
              'requisition_id' => $requisitionId
            ]);
          }
        } catch (\Exception $e) {
          Log::warning('⚠️ [NotificationDispatcher::saveNotificationRecord] Failed to get requisition_id from rfq_id', [
            'error' => $e->getMessage()
          ]);
        }
      }

      // Try to get from nested data
      if ($requisitionId === null && isset($data['data']) && is_array($data['data'])) {
        if (isset($data['data']['qtn_id'])) {
          try {
            $quotation = QuotationRequest::find($data['data']['qtn_id']);
            if ($quotation && $quotation->requisition_id) {
              $requisitionId = $quotation->requisition_id;
              Log::info('✅ [NotificationDispatcher::saveNotificationRecord] Found requisition_id from nested data', [
                'qtn_id' => $data['data']['qtn_id'],
                'requisition_id' => $requisitionId
              ]);
            }
          } catch (\Exception $e) {
            Log::warning('⚠️ [NotificationDispatcher::saveNotificationRecord] Failed to get requisition_id from nested data', [
              'error' => $e->getMessage()
            ]);
          }
        }
      }
    }

    // If we still don't have a requisition_id, log error but use a fallback
    if ($requisitionId === null) {
      Log::error('❌ [NotificationDispatcher::saveNotificationRecord] requisition_id is null after all attempts', [
        'user_id' => $userId,
        'data' => $data
      ]);
      // Use 0 as a fallback to avoid database error
      $requisitionId = 0;
    }

    // Prepare the notification data
    $notificationData = [
      'user_id' => $userId,
      'requisition_id' => $requisitionId,
      'type' => $data['type'] ?? $data['event'] ?? 'general',
      'subject' => $data['subject'] ?? 'Procurement Notification',
      'message' => $data['message'] ?? $data['description'] ?? null,
      'data' => json_encode($data),
      'sent_by' => auth()->id() ?? $data['sent_by'] ?? null,
      'sent_at' => now(),
      'created_at' => now(),
      'updated_at' => now(),
    ];

    try {
      ProcurementNotification::create($notificationData);
      Log::info('✅ [NotificationDispatcher::saveNotificationRecord] Notification saved successfully', [
        'user_id' => $userId,
        'requisition_id' => $requisitionId
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [NotificationDispatcher::saveNotificationRecord] Failed to save notification', [
        'user_id' => $userId,
        'error' => $e->getMessage(),
        'data' => $notificationData
      ]);
      throw $e;
    }
  }
}
