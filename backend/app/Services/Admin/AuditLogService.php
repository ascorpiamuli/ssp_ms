<?php

namespace App\Services\Admin;

use App\Models\UserActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;

class AuditLogService
{
  /**
   * List of ALL models that should be logged (PUBLIC)
   * This includes every model from your application
   */
  public array $criticalModels = [
    // ============================================
    // AUTH & USER MODELS
    // ============================================
    'User',
    'UserProfile',
    'UserSession',
    'UserActivityLog',
    'PasswordResetHistory',
    'TwoFactorAuthentication',

    // ============================================
    // ROLE & PERMISSION MODELS
    // ============================================
    'Role',
    'Permission',
    'ModelHasRole',
    'ModelHasPermission',
    'RoleHasPermission',

    // ============================================
    // DEPARTMENT MODELS
    // ============================================
    'Department',

    // ============================================
    // REQUISITION MODELS
    // ============================================
    'Requisition',
    'RequisitionItem',
    'RequisitionAttachment',
    'RequisitionBudget',
    'RequisitionHistory',
    'RequisitionRevision',
    'RequisitionNotification',
    'RequisitionComment',
    'RequisitionDelegation',
    'RequisitionEscalation',
    'RequisitionTemplate',

    // ============================================
    // APPROVAL MODELS
    // ============================================
    'Approval',
    'ApprovalWorkflow',
    'ProcurementApproval',

    // ============================================
    // PROCUREMENT MODELS
    // ============================================
    'ProcurementHistory',
    'ProcurementNotification',
    'ProcurementSetting',

    // ============================================
    // PURCHASE ORDER MODELS
    // ============================================
    'PurchaseOrder',
    'PurchaseOrderItem',

    // ============================================
    // GOODS RECEIVED MODELS
    // ============================================
    'GoodsReceivedNote',
    'GoodsReceivedItem',

    // ============================================
    // SERVICE ACKNOWLEDGMENT MODELS
    // ============================================
    'ServiceAcknowledgmentNote',

    // ============================================
    // INVOICE MODELS
    // ============================================
    'Invoice',
    'InvoiceItem',

    // ============================================
    // PAYMENT MODELS
    // ============================================
    'PaymentVoucher',
    'Cheque',

    // ============================================
    // CONTRACT MODELS
    // ============================================
    'Contract',

    // ============================================
    // TENDER MODELS
    // ============================================
    'Tender',

    // ============================================
    // SUPPLIER MODELS
    // ============================================
    'Supplier',
    'SupplierBlacklist',
    'SupplierQuotation',
    'SupplierQuotationItem',

    // ============================================
    // QUOTATION MODELS
    // ============================================
    'QuotationRequest',
    'QuotationVerification',

    // ============================================
    // SIGNATURE MODELS
    // ============================================
    'SignatureSpecimen',
    'SignatureVerification',
    'SignatureVerificationLog',

    // ============================================
    // COMPANY & SYSTEM MODELS
    // ============================================
    'CompanyProfile',
    'Backup',
    'SystemStatusLog',
    'Upload',

    // ============================================
    // JOB & QUEUE MODELS
    // ============================================
    'Job',
    'FailedJob',
    'Notification',
  ];

  /**
   * Get user display name from user ID or model.
   */
  public function getUserDisplayName(?int $userId = null): string
  {
    if (!$userId) {
      return 'System';
    }

    try {
      $user = User::find($userId);
      if (!$user) {
        return "User #{$userId}";
      }

      // Build full name from first_name and last_name
      $firstName = $user->first_name ?? '';
      $lastName = $user->last_name ?? '';

      if ($firstName && $lastName) {
        return $firstName . ' ' . $lastName;
      } elseif ($firstName) {
        return $firstName;
      } elseif ($lastName) {
        return $lastName;
      }

      return $user->email ?? "User #{$userId}";
    } catch (\Exception $e) {
      return "User #{$userId}";
    }
  }

  /**
   * Check if a model should be logged.
   */
  public function shouldLogModel(Model $model, string $action): bool
  {
    $className = class_basename($model);

    // Always log critical models
    if (in_array($className, $this->criticalModels)) {
      return true;
    }

    // Skip logging for non-critical models on read-only actions
    if (in_array($action, ['retrieved', 'viewed', 'read'])) {
      return false;
    }

    // Log other models if they have significant changes
    if ($action === 'updated' && method_exists($model, 'wasChanged')) {
      $significantFields = ['status', 'is_active', 'is_approved', 'approved_at', 'deleted_at'];
      foreach ($significantFields as $field) {
        if ($model->wasChanged($field)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get display name for a model.
   */
  public function getModelDisplayName(Model $model): string
  {
    $className = class_basename($model);

    // Try to get a name from common fields
    $nameFields = ['name', 'title', 'reference_number', 'po_number', 'email', 'company_name', 'full_name'];
    foreach ($nameFields as $field) {
      if (isset($model->{$field}) && !empty($model->{$field})) {
        return $model->{$field};
      }
    }

    // Try to get from user relationship
    if (method_exists($model, 'user') && $model->user) {
      return $this->getUserDisplayName($model->user->id);
    }

    // Fallback to ID
    return "{$className} #{$model->id}";
  }

  /**
   * Get additional data specific to model type.
   */
  public function getModelAdditionalData(Model $model): array
  {
    $className = class_basename($model);
    $data = [];

    switch ($className) {
      case 'User':
        $data = [
          'email' => $model->email ?? null,
          'is_active' => $model->is_active ?? null,
          'is_approved' => $model->is_approved ?? null,
          'department_id' => $model->department_id ?? null,
        ];
        break;

      case 'Requisition':
        $data = [
          'reference_number' => $model->reference_number ?? null,
          'status' => $model->status ?? null,
          'total_amount' => $model->total_amount ?? null,
          'department_id' => $model->department_id ?? null,
          'user_id' => $model->user_id ?? null,
        ];
        break;

      case 'PurchaseOrder':
        $data = [
          'po_number' => $model->po_number ?? null,
          'status' => $model->status ?? null,
          'total_amount' => $model->total_amount ?? null,
          'supplier_id' => $model->supplier_id ?? null,
          'requisition_id' => $model->requisition_id ?? null,
        ];
        break;

      case 'Supplier':
        $data = [
          'company_name' => $model->company_name ?? null,
          'email' => $model->email ?? null,
          'phone' => $model->phone ?? null,
          'is_active' => $model->is_active ?? null,
          'is_blacklisted' => $model->is_blacklisted ?? null,
        ];
        break;

      case 'Invoice':
        $data = [
          'invoice_number' => $model->invoice_number ?? null,
          'status' => $model->status ?? null,
          'total_amount' => $model->total_amount ?? null,
          'supplier_id' => $model->supplier_id ?? null,
          'purchase_order_id' => $model->purchase_order_id ?? null,
        ];
        break;

      case 'PaymentVoucher':
        $data = [
          'voucher_number' => $model->voucher_number ?? null,
          'status' => $model->status ?? null,
          'amount' => $model->amount ?? null,
          'supplier_id' => $model->supplier_id ?? null,
          'invoice_id' => $model->invoice_id ?? null,
        ];
        break;

      case 'Cheque':
        $data = [
          'cheque_number' => $model->cheque_number ?? null,
          'status' => $model->status ?? null,
          'amount' => $model->amount ?? null,
          'payee' => $model->payee ?? null,
          'payment_voucher_id' => $model->payment_voucher_id ?? null,
        ];
        break;

      case 'Contract':
        $data = [
          'contract_number' => $model->contract_number ?? null,
          'status' => $model->status ?? null,
          'total_value' => $model->total_value ?? null,
          'supplier_id' => $model->supplier_id ?? null,
          'start_date' => $model->start_date ?? null,
          'end_date' => $model->end_date ?? null,
        ];
        break;

      case 'Tender':
        $data = [
          'tender_number' => $model->tender_number ?? null,
          'status' => $model->status ?? null,
          'budget' => $model->budget ?? null,
          'closing_date' => $model->closing_date ?? null,
        ];
        break;

      case 'GoodsReceivedNote':
        $data = [
          'grn_number' => $model->grn_number ?? null,
          'status' => $model->status ?? null,
          'purchase_order_id' => $model->purchase_order_id ?? null,
          'supplier_id' => $model->supplier_id ?? null,
        ];
        break;

      case 'ServiceAcknowledgmentNote':
        $data = [
          'san_number' => $model->san_number ?? null,
          'status' => $model->status ?? null,
          'purchase_order_id' => $model->purchase_order_id ?? null,
          'supplier_id' => $model->supplier_id ?? null,
        ];
        break;

      case 'QuotationRequest':
        $data = [
          'qtn_number' => $model->qtn_number ?? null,
          'status' => $model->status ?? null,
          'requisition_id' => $model->requisition_id ?? null,
        ];
        break;

      case 'SupplierQuotation':
        $data = [
          'quotation_number' => $model->quotation_number ?? null,
          'status' => $model->status ?? null,
          'total_amount' => $model->total_amount ?? null,
          'supplier_id' => $model->supplier_id ?? null,
          'quotation_request_id' => $model->quotation_request_id ?? null,
        ];
        break;

      case 'SignatureSpecimen':
        $data = [
          'status' => $model->status ?? null,
          'is_verified' => $model->is_verified ?? null,
          'user_id' => $model->user_id ?? null,
        ];
        break;

      case 'Department':
        $data = [
          'name' => $model->name ?? null,
          'code' => $model->code ?? null,
          'is_active' => $model->is_active ?? null,
          'hod_id' => $model->hod_id ?? null,
        ];
        break;

      case 'Approval':
        $data = [
          'status' => $model->status ?? null,
          'level' => $model->level ?? null,
          'requisition_id' => $model->requisition_id ?? null,
          'approver_id' => $model->approver_id ?? null,
        ];
        break;

      case 'ApprovalWorkflow':
        $data = [
          'name' => $model->name ?? null,
          'department_id' => $model->department_id ?? null,
          'is_active' => $model->is_active ?? null,
        ];
        break;

      case 'CompanyProfile':
        $data = [
          'company_name' => $model->company_name ?? null,
          'email' => $model->email ?? null,
          'phone' => $model->phone ?? null,
        ];
        break;

      case 'Backup':
        $data = [
          'file_name' => $model->file_name ?? null,
          'size' => $model->size ?? null,
          'status' => $model->status ?? null,
        ];
        break;

      case 'SystemStatusLog':
        $data = [
          'component' => $model->component ?? null,
          'status' => $model->status ?? null,
          'message' => $model->message ?? null,
        ];
        break;

      default:
        // Try to get common fields
        $commonFields = ['status', 'is_active', 'is_approved', 'is_verified'];
        foreach ($commonFields as $field) {
          if (isset($model->{$field})) {
            $data[$field] = $model->{$field};
          }
        }
        break;
    }

    return $data;
  }

  /**
   * Log an action to the audit trail with detailed message and data.
   */
  public function logWithDetails(
    string $action,
    string $module,
    string $message,
    array $data = [],
    ?Model $entity = null,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?int $userId = null,
    ?array $metadata = null
  ): ?UserActivityLog {
    try {
      // Use provided user ID or fallback to current user
      $userId = $userId ?? auth()->id();

      // If no user ID and action is not critical, skip logging
      if (!$userId && !$this->isCriticalAction($action) && !$this->isCriticalModule($module)) {
        return null;
      }

      // Prepare the log data
      $logData = [
        'user_id' => $userId,
        'action' => $action,
        'module' => $module,
        'description' => $message,
        'data' => $data,
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
        'metadata' => $metadata,
      ];

      // Add entity information if provided
      if ($entity) {
        $logData['entity_type'] = get_class($entity);
        $logData['entity_id'] = $entity->id;
      }

      // Add old and new values if provided
      if ($oldValues) {
        $logData['old_values'] = $oldValues;
      }
      if ($newValues) {
        $logData['new_values'] = $newValues;
      }

      return $this->log($logData);
    } catch (\Exception $e) {
      Log::error('Audit log failed: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Log a model creation with detailed message.
   */
  public function logModelCreated(Model $model, ?string $customMessage = null, ?array $additionalData = []): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);
    $extraData = $this->getModelAdditionalData($model);

    $message = $customMessage ?? "{$className} '{$displayName}' created by {$userName}";

    return $this->logWithDetails(
      action: 'created',
      module: $module,
      message: $message,
      data: array_merge(
        [
          'model_id' => $model->id,
          'model_class' => get_class($model),
          'model_name' => $displayName,
        ],
        $extraData,
        $additionalData
      ),
      entity: $model,
      newValues: $model->toArray(),
      userId: auth()->id()
    );
  }

  /**
   * Log a model update with detailed message.
   */
  public function logModelUpdated(Model $model, ?array $oldValues = null, ?string $customMessage = null, ?array $additionalData = []): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);
    $extraData = $this->getModelAdditionalData($model);

    $message = $customMessage ?? "{$className} '{$displayName}' updated by {$userName}";

    // If old values not provided, try to get them from the model
    if ($oldValues === null && method_exists($model, 'getOriginal')) {
      $oldValues = $model->getOriginal();
    }

    // Calculate what changed
    $changes = [];
    if ($oldValues && $model->toArray()) {
      foreach ($model->toArray() as $key => $value) {
        if (isset($oldValues[$key]) && $oldValues[$key] != $value) {
          $changes[$key] = [
            'old' => $oldValues[$key],
            'new' => $value,
          ];
        }
      }
    }

    return $this->logWithDetails(
      action: 'updated',
      module: $module,
      message: $message,
      data: array_merge(
        [
          'model_id' => $model->id,
          'model_class' => get_class($model),
          'model_name' => $displayName,
          'changes' => $changes,
        ],
        $extraData,
        $additionalData
      ),
      entity: $model,
      oldValues: $oldValues,
      newValues: $model->toArray(),
      userId: auth()->id()
    );
  }

  /**
   * Log a model deletion with detailed message.
   */
  public function logModelDeleted(Model $model, ?string $customMessage = null, ?array $additionalData = []): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);
    $extraData = $this->getModelAdditionalData($model);

    $message = $customMessage ?? "{$className} '{$displayName}' deleted by {$userName}";

    return $this->logWithDetails(
      action: 'deleted',
      module: $module,
      message: $message,
      data: array_merge(
        [
          'model_id' => $model->id,
          'model_class' => get_class($model),
          'model_name' => $displayName,
        ],
        $extraData,
        $additionalData
      ),
      entity: $model,
      oldValues: $model->toArray(),
      userId: auth()->id()
    );
  }

  /**
   * Log a model restore with detailed message.
   */
  public function logModelRestored(Model $model, ?string $customMessage = null, ?array $additionalData = []): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);
    $extraData = $this->getModelAdditionalData($model);

    $message = $customMessage ?? "{$className} '{$displayName}' restored by {$userName}";

    return $this->logWithDetails(
      action: 'restored',
      module: $module,
      message: $message,
      data: array_merge(
        [
          'model_id' => $model->id,
          'model_class' => get_class($model),
          'model_name' => $displayName,
        ],
        $extraData,
        $additionalData
      ),
      entity: $model,
      newValues: $model->toArray(),
      userId: auth()->id()
    );
  }

  /**
   * Log a model force deletion with detailed message.
   */
  public function logModelForceDeleted(Model $model, ?string $customMessage = null, ?array $additionalData = []): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);
    $extraData = $this->getModelAdditionalData($model);

    $message = $customMessage ?? "{$className} '{$displayName}' permanently deleted by {$userName}";

    return $this->logWithDetails(
      action: 'force_deleted',
      module: $module,
      message: $message,
      data: array_merge(
        [
          'model_id' => $model->id,
          'model_class' => get_class($model),
          'model_name' => $displayName,
        ],
        $extraData,
        $additionalData
      ),
      entity: $model,
      oldValues: $model->toArray(),
      userId: auth()->id()
    );
  }

  /**
   * Log an approval action with detailed message.
   */
  public function logApproval(
    Model $model,
    string $status,
    ?string $notes = null,
    ?string $customMessage = null,
    ?array $additionalData = []
  ): ?UserActivityLog {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);
    $extraData = $this->getModelAdditionalData($model);

    $action = $status === 'approved' ? 'approved' : 'rejected';
    $message = $customMessage ?? "{$className} '{$displayName}' {$action} by {$userName}" . ($notes ? " - Notes: {$notes}" : '');

    return $this->logWithDetails(
      action: $action,
      module: $module,
      message: $message,
      data: array_merge(
        [
          'model_id' => $model->id,
          'model_class' => get_class($model),
          'model_name' => $displayName,
          'status' => $status,
          'notes' => $notes,
        ],
        $extraData,
        $additionalData
      ),
      entity: $model,
      newValues: $model->toArray(),
      userId: auth()->id()
    );
  }

  /**
   * Log a status change with detailed message.
   */
  public function logStatusChange(
    Model $model,
    string $oldStatus,
    string $newStatus,
    ?string $reason = null,
    ?string $customMessage = null,
    ?array $additionalData = []
  ): ?UserActivityLog {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);
    $extraData = $this->getModelAdditionalData($model);

    $message = $customMessage ?? "{$className} '{$displayName}' status changed from {$oldStatus} to {$newStatus} by {$userName}" . ($reason ? " - Reason: {$reason}" : '');

    return $this->logWithDetails(
      action: 'status_change',
      module: $module,
      message: $message,
      data: array_merge(
        [
          'model_id' => $model->id,
          'model_class' => get_class($model),
          'model_name' => $displayName,
          'old_status' => $oldStatus,
          'new_status' => $newStatus,
          'reason' => $reason,
        ],
        $extraData,
        $additionalData
      ),
      entity: $model,
      oldValues: ['status' => $oldStatus],
      newValues: ['status' => $newStatus],
      userId: auth()->id()
    );
  }

  /**
   * Log a user action with detailed message.
   */
  public function logUserAction(
    int $userId,
    string $action,
    string $module,
    string $message,
    ?array $data = [],
    ?Model $entity = null,
    ?array $metadata = null
  ): ?UserActivityLog {
    return $this->logWithDetails(
      action: $action,
      module: $module,
      message: $message,
      data: $data ?? [],
      entity: $entity,
      userId: $userId,
      metadata: $metadata
    );
  }

  /**
   * Log a system action with detailed message.
   */
  public function logSystemAction(
    string $action,
    string $module,
    string $message,
    ?array $data = [],
    ?array $metadata = null
  ): ?UserActivityLog {
    return $this->logWithDetails(
      action: $action,
      module: $module,
      message: $message,
      data: $data ?? [],
      userId: null,
      metadata: $metadata
    );
  }

  /**
   * Log an error with detailed message.
   */
  public function logError(
    string $module,
    string $message,
    ?array $data = [],
    ?\Throwable $exception = null,
    ?int $userId = null
  ): ?UserActivityLog {
    $errorData = $data ?? [];

    if ($exception) {
      $errorData['exception'] = [
        'message' => $exception->getMessage(),
        'code' => $exception->getCode(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => $exception->getTraceAsString(),
      ];
    }

    return $this->logWithDetails(
      action: 'error',
      module: $module,
      message: $message,
      data: $errorData,
      userId: $userId ?? auth()->id(),
      metadata: ['severity' => 'error']
    );
  }

  /**
   * Log a warning with detailed message.
   */
  public function logWarning(
    string $module,
    string $message,
    ?array $data = [],
    ?int $userId = null
  ): ?UserActivityLog {
    return $this->logWithDetails(
      action: 'warning',
      module: $module,
      message: $message,
      data: $data ?? [],
      userId: $userId ?? auth()->id(),
      metadata: ['severity' => 'warning']
    );
  }

  /**
   * Log an info message with detailed data.
   */
  public function logInfo(
    string $module,
    string $message,
    ?array $data = [],
    ?int $userId = null
  ): ?UserActivityLog {
    return $this->logWithDetails(
      action: 'info',
      module: $module,
      message: $message,
      data: $data ?? [],
      userId: $userId ?? auth()->id(),
      metadata: ['severity' => 'info']
    );
  }

  /**
   * Log a custom action with full control.
   */
  public function logCustom(
    string $action,
    string $module,
    string $message,
    array $data = [],
    ?Model $entity = null,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?int $userId = null,
    ?array $metadata = null
  ): ?UserActivityLog {
    return $this->logWithDetails(
      action: $action,
      module: $module,
      message: $message,
      data: $data,
      entity: $entity,
      oldValues: $oldValues,
      newValues: $newValues,
      userId: $userId,
      metadata: $metadata
    );
  }

  /**
   * Log an action to the audit trail (base method).
   */
  public function log(array $data): ?UserActivityLog
  {
    try {
      $action = $data['action'] ?? 'unknown';
      $module = $data['module'] ?? 'general';

      // Skip logging if no user_id and it's a public request
      $userId = $data['user_id'] ?? auth()->id();

      // If no user_id and it's an api_request, skip logging
      if (!$userId && $action === 'api_request') {
        return null;
      }

      // For non-critical actions without a user, skip
      if (!$userId && !$this->isCriticalAction($action) && !$this->isCriticalModule($module)) {
        return null;
      }

      $auditLog = UserActivityLog::create([
        'user_id' => $userId,
        'action' => $action,
        'module' => $module,
        'description' => $data['description'] ?? null,
        'data' => $data['data'] ?? null,
        'ip_address' => $data['ip_address'] ?? request()->ip(),
        'user_agent' => $data['user_agent'] ?? request()->userAgent(),
        'entity_type' => $data['entity_type'] ?? null,
        'entity_id' => $data['entity_id'] ?? null,
        'old_values' => $data['old_values'] ?? null,
        'new_values' => $data['new_values'] ?? null,
        'metadata' => $data['metadata'] ?? null,
      ]);

      return $auditLog;
    } catch (\Exception $e) {
      // Silently fail - don't let audit logging break the application
      Log::error('Audit log failed: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Check if an action is critical (PUBLIC)
   */
  public function isCriticalAction(string $action): bool
  {
    $criticalActions = [
      'login',
      'logout',
      'register',
      'password_reset',
      '2fa_enable',
      '2fa_disable',
      'delete',
      'restore',
      'force_delete',
      'approve',
      'reject',
      'verify',
      'reject_signature',
      'verify_signature',
      'regenerate_qr',
      'upload_signature',
      'delete_signature',
      'create',
      'update',
      'assign',
      'remove',
      'activate',
      'deactivate',
      'blacklist',
      'unblacklist',
      'publish',
      'award',
      'issue',
      'endorse',
      'submit',
      'return',
      'cancel',
      'send',
      'match',
      'pay',
      'cash',
      'complete',
      'terminate',
      'suspend',
      'renew',
      'escalate',
      'delegate',
      'reassign',
      'approve_budget',
      'reject_budget',
      'verify_budget',
      'force_approve',
      'force_decline',
      'force_return',
      'upload',
      'download',
      'preview',
      'generate_qr',
      'regenerate_qr',
      'verify_qr',
      'scan_qr',
      'check',
      'endorse_po',
      'approve_po',
      'issue_po',
      'receive',
      'inspect',
      'quality_check',
      'dispute',
      'send_back',
      'stop_cheque',
      'cancel_cheque',
      'convert_to_lpo',
      'convert_to_lso',
      'select_supplier',
      'evaluate_quotation',
      'status_change',
      'error',
      'warning',
      'info',
    ];
    return in_array($action, $criticalActions);
  }

  /**
   * Check if a module is critical (PUBLIC)
   */
  public function isCriticalModule(string $module): bool
  {
    $criticalModules = [
      'auth',
      'security',
      'admin',
      'user_management',
      'role_management',
      'system_settings',
      'backup',
      'signature',
      'approval',
      'requisition',
      'purchase_order',
      'payment',
      'cheque',
      'contract',
      'tender',
      'supplier',
      'invoice',
      'goods_received',
      'service_acknowledgment',
      'company',
      'procurement',
      'quotation',
      'budget',
      'department',
      'user',
      'permission',
      'role',
    ];
    return in_array($module, $criticalModules);
  }

  /**
   * Get the module name from a model class (PUBLIC)
   */
  public function getModuleFromModel(string $modelClass): string
  {
    $className = class_basename($modelClass);

    $mapping = [
      // Auth & User Models
      'User' => 'user_management',
      'UserProfile' => 'user_management',
      'UserSession' => 'user_management',
      'UserActivityLog' => 'audit',
      'PasswordResetHistory' => 'auth',
      'TwoFactorAuthentication' => 'security',

      // Role & Permission Models
      'Role' => 'role_management',
      'Permission' => 'role_management',
      'ModelHasRole' => 'role_management',
      'ModelHasPermission' => 'role_management',
      'RoleHasPermission' => 'role_management',

      // Department Models
      'Department' => 'department',

      // Requisition Models
      'Requisition' => 'requisition',
      'RequisitionItem' => 'requisition',
      'RequisitionAttachment' => 'requisition',
      'RequisitionBudget' => 'requisition',
      'RequisitionHistory' => 'requisition',
      'RequisitionRevision' => 'requisition',
      'RequisitionNotification' => 'requisition',
      'RequisitionComment' => 'requisition',
      'RequisitionDelegation' => 'requisition',
      'RequisitionEscalation' => 'requisition',
      'RequisitionTemplate' => 'requisition',

      // Approval Models
      'Approval' => 'approval',
      'ApprovalWorkflow' => 'approval',
      'ProcurementApproval' => 'procurement',

      // Procurement Models
      'ProcurementHistory' => 'procurement',
      'ProcurementNotification' => 'procurement',
      'ProcurementSetting' => 'procurement',

      // Purchase Order Models
      'PurchaseOrder' => 'purchase_order',
      'PurchaseOrderItem' => 'purchase_order',

      // Goods Received Models
      'GoodsReceivedNote' => 'goods_received',
      'GoodsReceivedItem' => 'goods_received',

      // Service Acknowledgment Models
      'ServiceAcknowledgmentNote' => 'service_acknowledgment',

      // Invoice Models
      'Invoice' => 'invoice',
      'InvoiceItem' => 'invoice',

      // Payment Models
      'PaymentVoucher' => 'payment',
      'Cheque' => 'cheque',

      // Contract Models
      'Contract' => 'contract',

      // Tender Models
      'Tender' => 'tender',

      // Supplier Models
      'Supplier' => 'supplier',
      'SupplierBlacklist' => 'supplier',
      'SupplierQuotation' => 'quotation',
      'SupplierQuotationItem' => 'quotation',

      // Quotation Models
      'QuotationRequest' => 'quotation',
      'QuotationVerification' => 'quotation',

      // Signature Models
      'SignatureSpecimen' => 'signature',
      'SignatureVerification' => 'signature',
      'SignatureVerificationLog' => 'signature',

      // Company & System Models
      'CompanyProfile' => 'company',
      'Backup' => 'backup',
      'SystemStatusLog' => 'system',
      'Upload' => 'file_management',

      // Job & Queue Models
      'Job' => 'queue',
      'FailedJob' => 'queue',
      'Notification' => 'notification',
    ];

    return $mapping[$className] ?? strtolower($className);
  }

  /**
   * Get all audit logs with filters.
   */
  public function getAll(array $filters = [])
  {
    try {
      $query = UserActivityLog::with('user');

      // Apply filters
      if (isset($filters['module']) && !empty($filters['module'])) {
        $query->module($filters['module']);
      }

      if (isset($filters['action']) && !empty($filters['action'])) {
        $query->action($filters['action']);
      }

      if (isset($filters['user_id']) && !empty($filters['user_id'])) {
        $query->user($filters['user_id']);
      }

      if (isset($filters['entity_type']) && !empty($filters['entity_type'])) {
        $query->where('entity_type', $filters['entity_type']);
      }

      if (isset($filters['entity_id']) && !empty($filters['entity_id'])) {
        $query->where('entity_id', $filters['entity_id']);
      }

      if (isset($filters['start_date']) && isset($filters['end_date'])) {
        $query->dateRange($filters['start_date'], $filters['end_date']);
      }

      if (isset($filters['search']) && !empty($filters['search'])) {
        $search = $filters['search'];
        $query->where(function ($q) use ($search) {
          $q->where('description', 'like', "%{$search}%")
            ->orWhere('action', 'like', "%{$search}%")
            ->orWhere('module', 'like', "%{$search}%")
            ->orWhere('entity_type', 'like', "%{$search}%");
        });
      }

      // Sort
      $sortBy = $filters['sort_by'] ?? 'created_at';
      $sortOrder = $filters['sort_order'] ?? 'desc';
      $query->orderBy($sortBy, $sortOrder);

      // Paginate or get all
      $perPage = $filters['per_page'] ?? 50;
      $result = $query->paginate($perPage);

      return $result;
    } catch (\Exception $e) {
      // Return empty result on error
      return collect([]);
    }
  }

  /**
   * Get a single audit log entry.
   */
  public function getById(int $id): ?UserActivityLog
  {
    try {
      return UserActivityLog::with('user')->find($id);
    } catch (\Exception $e) {
      return null;
    }
  }

  /**
   * Get audit log statistics.
   */
  public function getStats(): array
  {
    try {
      $stats = [
        'total_logs' => UserActivityLog::count(),
        'unique_users' => UserActivityLog::distinct('user_id')->count('user_id'),
        'today_logs' => UserActivityLog::whereDate('created_at', today())->count(),
        'week_logs' => UserActivityLog::whereDate('created_at', '>=', now()->subDays(7))->count(),
        'month_logs' => UserActivityLog::whereDate('created_at', '>=', now()->subDays(30))->count(),
        'modules' => UserActivityLog::select('module', DB::raw('count(*) as count'))
          ->whereNotNull('module')
          ->groupBy('module')
          ->get()
          ->pluck('count', 'module')
          ->toArray(),
        'actions' => UserActivityLog::select('action', DB::raw('count(*) as count'))
          ->whereNotNull('action')
          ->groupBy('action')
          ->orderBy('count', 'desc')
          ->limit(10)
          ->get()
          ->pluck('count', 'action')
          ->toArray(),
        'recent_activities' => UserActivityLog::with('user')
          ->orderBy('created_at', 'desc')
          ->limit(10)
          ->get(),
      ];

      return $stats;
    } catch (\Exception $e) {
      return [
        'total_logs' => 0,
        'unique_users' => 0,
        'today_logs' => 0,
        'week_logs' => 0,
        'month_logs' => 0,
        'modules' => [],
        'actions' => [],
        'recent_activities' => [],
      ];
    }
  }

  /**
   * Get available modules for filtering.
   */
  public function getModules(): array
  {
    try {
      return UserActivityLog::distinct('module')
        ->whereNotNull('module')
        ->pluck('module')
        ->filter()
        ->values()
        ->toArray();
    } catch (\Exception $e) {
      return [];
    }
  }

  /**
   * Get available actions for filtering.
   */
  public function getActions(): array
  {
    try {
      return UserActivityLog::distinct('action')
        ->whereNotNull('action')
        ->pluck('action')
        ->filter()
        ->values()
        ->toArray();
    } catch (\Exception $e) {
      return [];
    }
  }

  /**
   * Log user login.
   */
  public function logLogin(int $userId): ?UserActivityLog
  {
    $userName = $this->getUserDisplayName($userId);

    return $this->log([
      'user_id' => $userId,
      'action' => 'login',
      'module' => 'auth',
      'description' => "User {$userName} logged in",
    ]);
  }

  /**
   * Log user logout.
   */
  public function logLogout(int $userId): ?UserActivityLog
  {
    $userName = $this->getUserDisplayName($userId);

    return $this->log([
      'user_id' => $userId,
      'action' => 'logout',
      'module' => 'auth',
      'description' => "User {$userName} logged out",
    ]);
  }

  /**
   * Log user registration.
   */
  public function logRegistration(int $userId, array $userData): ?UserActivityLog
  {
    $userName = $this->getUserDisplayName($userId);

    return $this->log([
      'user_id' => $userId,
      'action' => 'register',
      'module' => 'auth',
      'description' => "User {$userName} registered",
      'data' => $userData,
    ]);
  }

  /**
   * Log password reset.
   */
  public function logPasswordReset(int $userId, string $email): ?UserActivityLog
  {
    $userName = $this->getUserDisplayName($userId);

    return $this->log([
      'user_id' => $userId,
      'action' => 'password_reset',
      'module' => 'auth',
      'description' => "User {$userName} reset password",
      'data' => ['email' => $email],
    ]);
  }

  /**
   * Log 2FA enable/disable.
   */
  public function logTwoFactor(int $userId, string $action): ?UserActivityLog
  {
    $userName = $this->getUserDisplayName($userId);
    $actionText = $action === 'enable' ? 'enabled' : 'disabled';

    return $this->log([
      'user_id' => $userId,
      'action' => $action === 'enable' ? '2fa_enable' : '2fa_disable',
      'module' => 'security',
      'description' => "User {$userName} {$actionText} two-factor authentication",
    ]);
  }

  /**
   * Log role assignment.
   */
  public function logRoleAssignment(int $userId, int $targetUserId, string $roleName, string $action = 'assigned'): ?UserActivityLog
  {
    $userName = $this->getUserDisplayName($userId);
    $targetName = $this->getUserDisplayName($targetUserId);
    $actionText = $action === 'assigned' ? 'assigned to' : 'removed from';

    return $this->log([
      'user_id' => $userId,
      'action' => $action === 'assigned' ? 'role_assigned' : 'role_removed',
      'module' => 'role_management',
      'description' => "Role '{$roleName}' {$actionText} user {$targetName} by {$userName}",
      'data' => [
        'target_user_id' => $targetUserId,
        'role' => $roleName,
        'action' => $action,
      ],
    ]);
  }

  /**
   * Log permission assignment.
   */
  public function logPermissionAssignment(int $userId, string $roleName, string $permissionName, string $action = 'granted'): ?UserActivityLog
  {
    $userName = $this->getUserDisplayName($userId);
    $actionText = $action === 'granted' ? 'granted to' : 'revoked from';

    return $this->log([
      'user_id' => $userId,
      'action' => $action === 'granted' ? 'permission_granted' : 'permission_revoked',
      'module' => 'role_management',
      'description' => "Permission '{$permissionName}' {$actionText} role '{$roleName}' by {$userName}",
      'data' => [
        'role' => $roleName,
        'permission' => $permissionName,
        'action' => $action,
      ],
    ]);
  }

  /**
   * Log a generic creation.
   */
  public function logCreated(string $module, $model, ?string $description = null): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);

    return $this->log([
      'action' => 'created',
      'module' => $module,
      'description' => $description ?? "{$className} '{$displayName}' created by {$userName}",
      'entity_type' => get_class($model),
      'entity_id' => $model->id,
      'new_values' => $model->toArray(),
      'data' => ['model_name' => $displayName],
    ]);
  }

  /**
   * Log a generic update.
   */
  public function logUpdated(string $module, $model, array $oldValues, ?string $description = null): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);

    return $this->log([
      'action' => 'updated',
      'module' => $module,
      'description' => $description ?? "{$className} '{$displayName}' updated by {$userName}",
      'entity_type' => get_class($model),
      'entity_id' => $model->id,
      'old_values' => $oldValues,
      'new_values' => $model->toArray(),
      'data' => ['model_name' => $displayName],
    ]);
  }

  /**
   * Log a generic deletion.
   */
  public function logDeleted(string $module, $model, ?string $description = null): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);

    return $this->log([
      'action' => 'deleted',
      'module' => $module,
      'description' => $description ?? "{$className} '{$displayName}' deleted by {$userName}",
      'entity_type' => get_class($model),
      'entity_id' => $model->id,
      'old_values' => $model->toArray(),
      'data' => ['model_name' => $displayName],
    ]);
  }

  /**
   * Log a generic restore.
   */
  public function logRestored(string $module, $model, ?string $description = null): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);

    return $this->log([
      'action' => 'restored',
      'module' => $module,
      'description' => $description ?? "{$className} '{$displayName}' restored by {$userName}",
      'entity_type' => get_class($model),
      'entity_id' => $model->id,
      'new_values' => $model->toArray(),
      'data' => ['model_name' => $displayName],
    ]);
  }

  /**
   * Log model upload.
   */
  public function logUpload(string $module, $model, string $fileInfo, ?string $description = null): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);

    return $this->log([
      'action' => 'upload',
      'module' => $module,
      'description' => $description ?? "{$className} '{$displayName}' file uploaded by {$userName}",
      'entity_type' => get_class($model),
      'entity_id' => $model->id,
      'data' => ['file' => $fileInfo, 'model_name' => $displayName],
    ]);
  }

  /**
   * Log model download.
   */
  public function logDownload(string $module, $model, string $fileInfo, ?string $description = null): ?UserActivityLog
  {
    $module = $this->getModuleFromModel(get_class($model));
    $className = class_basename($model);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($model);

    return $this->log([
      'action' => 'download',
      'module' => $module,
      'description' => $description ?? "{$className} '{$displayName}' file downloaded by {$userName}",
      'entity_type' => get_class($model),
      'entity_id' => $model->id,
      'data' => ['file' => $fileInfo, 'model_name' => $displayName],
    ]);
  }

  /**
   * Log custom action (legacy - use logCustom instead).
   */
  public function logCustomAction(string $action, string $module, string $description, array $data = [], $entity = null): ?UserActivityLog
  {
    return $this->logCustom(
      action: $action,
      module: $module,
      message: $description,
      data: $data,
      entity: $entity
    );
  }

  /**
   * Log a purchase order action.
   */
  public function logPurchaseOrderAction(string $action, $purchaseOrder, ?string $notes = null, ?array $additionalData = []): ?UserActivityLog
  {
    $module = 'purchase_order';
    $className = class_basename($purchaseOrder);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($purchaseOrder);
    $extraData = $this->getModelAdditionalData($purchaseOrder);

    $actionMap = [
      'created' => 'created',
      'updated' => 'updated',
      'submitted' => 'submitted for approval',
      'checked' => 'checked by HOD',
      'endorsed' => 'endorsed by Accountant',
      'approved' => 'approved',
      'issued' => 'issued to supplier',
      'sent' => 'sent to supplier',
      'delivered' => 'marked as delivered',
      'completed' => 'completed',
      'cancelled' => 'cancelled',
    ];

    $actionDescription = $actionMap[$action] ?? $action;
    $message = $notes
      ? "{$className} '{$displayName}' {$actionDescription} by {$userName} - Notes: {$notes}"
      : "{$className} '{$displayName}' {$actionDescription} by {$userName}";

    return $this->logWithDetails(
      action: $action,
      module: $module,
      message: $message,
      data: array_merge(
        [
          'purchase_order_id' => $purchaseOrder->id,
          'po_number' => $purchaseOrder->po_number ?? $purchaseOrder->id,
          'status' => $purchaseOrder->status ?? null,
          'model_name' => $displayName,
        ],
        $extraData,
        $additionalData ?? []
      ),
      entity: $purchaseOrder,
      newValues: $purchaseOrder->toArray(),
      userId: auth()->id()
    );
  }

  /**
   * Log a requisition action.
   */
  public function logRequisitionAction(string $action, $requisition, ?string $notes = null, ?array $additionalData = []): ?UserActivityLog
  {
    $module = 'requisition';
    $className = class_basename($requisition);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($requisition);
    $extraData = $this->getModelAdditionalData($requisition);

    $actionMap = [
      'created' => 'created',
      'updated' => 'updated',
      'submitted' => 'submitted for approval',
      'approved' => 'approved',
      'rejected' => 'rejected',
      'returned' => 'returned for revision',
      'cancelled' => 'cancelled',
    ];

    $actionDescription = $actionMap[$action] ?? $action;
    $message = $notes
      ? "{$className} '{$displayName}' {$actionDescription} by {$userName} - Notes: {$notes}"
      : "{$className} '{$displayName}' {$actionDescription} by {$userName}";

    return $this->logWithDetails(
      action: $action,
      module: $module,
      message: $message,
      data: array_merge(
        [
          'requisition_id' => $requisition->id,
          'reference_number' => $requisition->reference_number ?? $requisition->id,
          'status' => $requisition->status ?? null,
          'model_name' => $displayName,
        ],
        $extraData,
        $additionalData ?? []
      ),
      entity: $requisition,
      newValues: $requisition->toArray(),
      userId: auth()->id()
    );
  }

  /**
   * Log a supplier action.
   */
  public function logSupplierAction(string $action, $supplier, ?string $notes = null, ?array $additionalData = []): ?UserActivityLog
  {
    $module = 'supplier';
    $className = class_basename($supplier);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($supplier);
    $extraData = $this->getModelAdditionalData($supplier);

    $actionMap = [
      'created' => 'created',
      'updated' => 'updated',
      'activated' => 'activated',
      'deactivated' => 'deactivated',
      'blacklisted' => 'blacklisted',
      'unblacklisted' => 'removed from blacklist',
      'deleted' => 'deleted',
    ];

    $actionDescription = $actionMap[$action] ?? $action;
    $message = $notes
      ? "{$className} '{$displayName}' {$actionDescription} by {$userName} - Notes: {$notes}"
      : "{$className} '{$displayName}' {$actionDescription} by {$userName}";

    return $this->logWithDetails(
      action: $action,
      module: $module,
      message: $message,
      data: array_merge(
        [
          'supplier_id' => $supplier->id,
          'supplier_name' => $supplier->company_name ?? $supplier->name ?? $supplier->id,
          'model_name' => $displayName,
        ],
        $extraData,
        $additionalData ?? []
      ),
      entity: $supplier,
      newValues: $supplier->toArray(),
      userId: auth()->id()
    );
  }

  /**
   * Log a signature action.
   */
  public function logSignatureAction(string $action, $signature, ?string $notes = null, ?array $additionalData = []): ?UserActivityLog
  {
    $module = 'signature';
    $className = class_basename($signature);
    $userName = $this->getUserDisplayName(auth()->id());
    $displayName = $this->getModelDisplayName($signature);
    $extraData = $this->getModelAdditionalData($signature);

    $actionMap = [
      'uploaded' => 'uploaded',
      'verified' => 'verified',
      'rejected' => 'rejected',
      'deleted' => 'deleted',
      'qr_regenerated' => 'QR code regenerated',
    ];

    $actionDescription = $actionMap[$action] ?? $action;
    $message = $notes
      ? "{$className} '{$displayName}' {$actionDescription} by {$userName} - Notes: {$notes}"
      : "{$className} '{$displayName}' {$actionDescription} by {$userName}";

    return $this->logWithDetails(
      action: $action,
      module: $module,
      message: $message,
      data: array_merge(
        [
          'signature_id' => $signature->id,
          'user_id' => $signature->user_id ?? null,
          'status' => $signature->status ?? null,
          'model_name' => $displayName,
        ],
        $extraData,
        $additionalData ?? []
      ),
      entity: $signature,
      newValues: $signature->toArray(),
      userId: auth()->id()
    );
  }

  /**
   * Log a user management action.
   */
  public function logUserManagementAction(string $action, $user, ?string $notes = null, ?array $additionalData = []): ?UserActivityLog
  {
    $module = 'user_management';
    $className = class_basename($user);
    $userName = $this->getUserDisplayName(auth()->id());
    $targetName = $this->getUserDisplayName($user->id ?? null);
    $extraData = $this->getModelAdditionalData($user);

    $actionMap = [
      'created' => 'created',
      'updated' => 'updated',
      'activated' => 'activated',
      'deactivated' => 'deactivated',
      'approved' => 'approved',
      'rejected' => 'rejected',
      'deleted' => 'deleted',
      'password_reset' => 'password reset',
    ];

    $actionDescription = $actionMap[$action] ?? $action;
    $message = $notes
      ? "User {$targetName} {$actionDescription} by {$userName} - Notes: {$notes}"
      : "User {$targetName} {$actionDescription} by {$userName}";

    return $this->logWithDetails(
      action: $action,
      module: $module,
      message: $message,
      data: array_merge(
        [
          'target_user_id' => $user->id ?? null,
          'target_user_email' => $user->email ?? null,
          'target_user_name' => $targetName,
        ],
        $extraData,
        $additionalData ?? []
      ),
      entity: $user,
      newValues: $user->toArray(),
      userId: auth()->id()
    );
  }
}
