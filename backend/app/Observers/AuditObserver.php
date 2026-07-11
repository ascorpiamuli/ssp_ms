<?php

namespace App\Observers;

use App\Services\Admin\AuditLogService;
use Illuminate\Database\Eloquent\Model;

class AuditObserver
{
  protected $auditLogService;

  public function __construct(AuditLogService $auditLogService)
  {
    $this->auditLogService = $auditLogService;
  }

  public function created(Model $model)
  {
    $this->log('created', $model);
  }

  public function updated(Model $model)
  {
    $this->log('updated', $model);
  }

  public function deleted(Model $model)
  {
    $this->log('deleted', $model);
  }

  public function restored(Model $model)
  {
    $this->log('restored', $model);
  }

  protected function log(string $action, Model $model)
  {
    try {
      $module = $this->getModuleName($model);

      $data = [
        'action' => $action,
        'module' => $module,
        'description' => ucfirst($action) . ' ' . class_basename($model),
        'entity_type' => get_class($model),
        'entity_id' => $model->id,
      ];

      if ($action === 'updated') {
        $data['old_values'] = $model->getOriginal();
        $data['new_values'] = $model->getAttributes();
      } elseif ($action === 'created') {
        $data['new_values'] = $model->getAttributes();
      } elseif ($action === 'deleted') {
        $data['old_values'] = $model->getAttributes();
      }

      $this->auditLogService->log($data);
    } catch (\Exception $e) {
      // Don't let audit logging break the application
      \Log::error('Audit observer failed: ' . $e->getMessage());
    }
  }

  protected function getModuleName(Model $model): string
  {
    $class = class_basename($model);
    $map = [
      'User' => 'users',
      'Department' => 'departments',
      'Supplier' => 'suppliers',
      'Requisition' => 'requisitions',
      'PurchaseOrder' => 'orders',
      'Invoice' => 'invoices',
      'Budget' => 'budget',
      'Role' => 'roles',
      'Permission' => 'roles',
    ];

    return $map[$class] ?? strtolower($class);
  }
}
