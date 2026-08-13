<?php
// app/Services/Requisitions/RequisitionService.php

declare(strict_types=1);

namespace App\Services\Requisitions;

use App\Exceptions\Requisitions\RequisitionException;
use App\Models\Requisition;
use App\Models\Approval;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Builder;

/**
 * Requisition Service
 *
 * Handles all business logic for requisition management
 */
class RequisitionService
{
  /**
   * @var RequisitionHistoryService
   */
  protected RequisitionHistoryService $historyService;

  /**
   * Constructor with dependency injection
   */
  public function __construct(
    RequisitionHistoryService $historyService
  ) {
    $this->historyService = $historyService;
    Log::info('🏗️ RequisitionService initialized');
  }

  /**
   * Get all requisitions with filters - LOADS ITEMS AND APPROVALS
   *
   * @param array $filters
   * @param int $perPage
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getAll(array $filters = [], int $perPage = 15)
  {
    $query = Requisition::query()
      ->with([
        'user:id,first_name,last_name,email',
        'department:id,name,code',
        'items' => function ($query) {
          $query->select([
            'id',
            'requisition_id',
            'item_name',
            'description',
            'unit_of_measure',
            'quantity',
            'estimated_unit_cost',
            'total_cost',
            'specifications',
            'catalog_number',
            'manufacturer',
            'model_number',
            'tax_rate',
            'discount_percentage',
            'is_inventory_item',
            'inventory_code',
            'status',
            'created_at',
            'updated_at'
          ]);
        },
        'approvals' => function ($query) {
          $query->select([
            'id',
            'requisition_id',
            'approver_id',
            'delegate_id',
            'original_approver_id',
            'level',
            'status',
            'comment',
            'decline_reason',
            'return_reason',
            'revision_notes',
            'revision_count',
            'last_revised_at',
            'approved_at',
            'declined_at',
            'returned_at',
            'delegated_at',
            'reminded_at',
            'escalated_at',
            'viewed_at',
            'response_time_hours',
            'received_at',
            'notification_sent',
            'notification_sent_at',
            'notification_count',
            'reminder_count',
            'order',
            'is_required',
            'conditions',
            'condition_notes',
            'action_taken',
            'device_info',
            'ip_address',
            'digital_signature',
            'is_signed',
            'signed_at',
            'is_group_approval',
            'approval_group',
            'group_order',
            'metadata',
            'created_at',
            'updated_at'
          ])->with([
            'approver:id,first_name,last_name,email',
            'delegate:id,first_name,last_name,email'
          ])->orderBy('order', 'asc');
        },
        'supplier:id,company_name,company_email,company_phone'
      ])
      ->select([
        'id',
        'reference_number',
        'title',
        'description',
        'total_amount',
        'status',
        'priority',
        'type',
        'urgency',
        'user_id',
        'department_id',
        'supplier_id',
        'budget_code',
        'project_code',
        'risk_level',
        'submitted_at',
        'approved_at',
        'created_at',
        'updated_at'
      ]);

    // Apply filters
    if (!empty($filters['search'])) {
      $query->search($filters['search']);
    }

    if (!empty($filters['status']) && $filters['status'] !== 'all') {
      $query->byStatus($filters['status']);
    }

    if (!empty($filters['department_id'])) {
      $query->byDepartment((int) $filters['department_id']);
    }

    if (!empty($filters['user_id'])) {
      $query->byUser((int) $filters['user_id']);
    }

    if (!empty($filters['priority']) && $filters['priority'] !== 'all') {
      $query->byPriority($filters['priority']);
    }

    if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
      $query->dateRange($filters['date_from'], $filters['date_to']);
    }

    return $query->orderBy('created_at', 'desc')->paginate($perPage);
  }

  /**
   * Get requisition by ID with essential relationships - LOADS ITEMS AND APPROVALS
   *
   * @param int $id
   * @return Requisition
   * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
   */
  public function getById(int $id): Requisition
  {
    return Requisition::with([
      'user:id,first_name,last_name,email,phone',
      'department:id,name,code',
      'supplier:id,company_name,company_email,company_phone',
      'items' => function ($query) {
        $query->select([
          'id',
          'requisition_id',
          'item_name',
          'description',
          'unit_of_measure',
          'quantity',
          'estimated_unit_cost',
          'total_cost',
          'specifications',
          'catalog_number',
          'manufacturer',
          'model_number',
          'tax_rate',
          'discount_percentage',
          'is_inventory_item',
          'inventory_code',
          'status',
          'created_at',
          'updated_at'
        ]);
      },
      'approvals' => function ($query) {
        $query->select([
          'id',
          'requisition_id',
          'approver_id',
          'delegate_id',
          'original_approver_id',
          'level',
          'status',
          'comment',
          'decline_reason',
          'return_reason',
          'revision_notes',
          'revision_count',
          'last_revised_at',
          'approved_at',
          'declined_at',
          'returned_at',
          'delegated_at',
          'reminded_at',
          'escalated_at',
          'viewed_at',
          'response_time_hours',
          'received_at',
          'notification_sent',
          'notification_sent_at',
          'notification_count',
          'reminder_count',
          'order',
          'is_required',
          'conditions',
          'condition_notes',
          'action_taken',
          'device_info',
          'ip_address',
          'digital_signature',
          'is_signed',
          'signed_at',
          'is_group_approval',
          'approval_group',
          'group_order',
          'metadata',
          'created_at',
          'updated_at'
        ])->with([
          'approver:id,first_name,last_name,email',
          'delegate:id,first_name,last_name,email'
        ])->orderBy('order', 'asc');
      }
    ])->findOrFail($id);
  }

  /**
   * Get requisition by reference number
   *
   * @param string $referenceNumber
   * @return Requisition
   * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
   */
  public function getByReferenceNumber(string $referenceNumber): Requisition
  {
    return Requisition::where('reference_number', $referenceNumber)
      ->with([
        'items',
        'approvals' => function ($query) {
          $query->select([
            'id',
            'requisition_id',
            'approver_id',
            'delegate_id',
            'level',
            'status',
            'comment',
            'decline_reason',
            'return_reason',
            'approved_at',
            'declined_at',
            'returned_at',
            'order',
            'created_at',
            'updated_at'
          ])->with([
            'approver:id,first_name,last_name,email',
            'delegate:id,first_name,last_name,email'
          ])->orderBy('order', 'asc');
        }
      ])
      ->select([
        'id',
        'reference_number',
        'title',
        'description',
        'total_amount',
        'status',
        'priority',
        'type',
        'urgency',
        'user_id',
        'department_id',
        'supplier_id',
        'created_at',
        'updated_at'
      ])
      ->firstOrFail();
  }

  /**
   * Create a new requisition - OPTIMIZED
   *
   * @param array $data
   * @return Requisition
   * @throws RequisitionException
   */
  public function create(array $data): Requisition
  {
    try {
      DB::beginTransaction();

      // ✅ PRIORITIZE FRONTEND REFERENCE NUMBER
      if (!empty($data['reference_number'])) {
        $data['reference_number'] = $this->validateAndCleanReferenceNumber($data['reference_number']);
        Log::info('📝 Using frontend-generated requisition number', [
          'reference_number' => $data['reference_number']
        ]);
      } else {
        $data['reference_number'] = Requisition::generateReferenceNumber();
        Log::info('📝 Generated requisition number (fallback)', [
          'reference_number' => $data['reference_number']
        ]);
      }

      $data['user_id'] = Auth::id();
      $data['status'] = 'draft';

      $fillableData = array_intersect_key($data, array_flip([
        'reference_number',
        'user_id',
        'department_id',
        'supplier_id',
        'title',
        'description',
        'total_amount',
        'status',
        'priority',
        'type',
        'urgency',
        'justification',
        'required_by_date',
        'required_delivery_date',
        'budget_code',
        'budget_source',
        'funding_source',
        'project_code',
        'procurement_method',
        'is_framework_agreement',
        'framework_agreement_id',
        'risk_level',
        'risk_mitigation',
        'is_compliant',
        'compliance_notes',
        'currency',
        'exchange_rate'
      ]));

      // Create requisition
      $requisition = Requisition::create($fillableData);

      // ✅ CREATE ITEMS - Include ALL fields
      if (!empty($data['items']) && is_array($data['items'])) {
        $totalAmount = 0;
        foreach ($data['items'] as $itemData) {
          $itemFillable = array_intersect_key($itemData, array_flip([
            'item_name',
            'description',
            'unit_of_measure',
            'quantity',
            'estimated_unit_cost',
            'specifications',
            'catalog_number',
            'manufacturer',
            'model_number',
            'supplier_id',
            'is_inventory_item',
            'inventory_code',
            'tax_rate',
            'discount_percentage'
          ]));

          $item = $requisition->items()->create($itemFillable);
          $totalAmount += ($item->quantity * $item->estimated_unit_cost);
        }
        // Update total amount
        $requisition->update(['total_amount' => $totalAmount]);
      }

      // Log creation
      $this->historyService->log(
        $requisition->id,
        'created',
        null,
        ['id' => $requisition->id, 'reference_number' => $requisition->reference_number],
        'Requisition created'
      );

      DB::commit();

      return $requisition->fresh(['items' => function ($query) {
        $query->select([
          'id',
          'requisition_id',
          'item_name',
          'description',
          'unit_of_measure',
          'quantity',
          'estimated_unit_cost',
          'total_cost',
          'specifications',
          'catalog_number',
          'manufacturer',
          'model_number',
          'tax_rate',
          'discount_percentage',
          'is_inventory_item',
          'inventory_code',
          'status'
        ]);
      }]);
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create requisition: ' . $e->getMessage(), [
        'trace' => $e->getTraceAsString()
      ]);
      throw new RequisitionException('Failed to create requisition: ' . $e->getMessage());
    }
  }

  /**
   * Validate and clean reference number
   *
   * @param string $referenceNumber
   * @return string
   * @throws RequisitionException
   */
  protected function validateAndCleanReferenceNumber(string $referenceNumber): string
  {
    // Remove any unwanted characters
    $cleaned = preg_replace('/[^A-Za-z0-9\-]/', '', $referenceNumber);

    // Check if it matches the expected format
    if (!preg_match('/^REQ-\d{8}-\d{4}$/', $cleaned) && !preg_match('/^REQ-\d{4}-\d{5}$/', $cleaned)) {
      Log::warning('⚠️ Frontend requisition number format is invalid, generating new one', [
        'provided' => $referenceNumber,
        'cleaned' => $cleaned
      ]);
      return Requisition::generateReferenceNumber();
    }

    // Check if reference number already exists
    if (Requisition::where('reference_number', $cleaned)->exists()) {
      Log::warning('⚠️ Frontend requisition number already exists, generating new one', [
        'reference_number' => $cleaned
      ]);
      return Requisition::generateReferenceNumber();
    }

    return $cleaned;
  }

  /**
   * Check if user has permission to modify a requisition
   *
   * @param Requisition $requisition
   * @param string $action
   * @return bool
   */
  protected function canModify(Requisition $requisition, string $action = 'edit'): bool
  {
    $user = Auth::user();
    $userId = $user->id;

    // Admin can modify any requisition
    if ($user->hasRole('admin')) {
      return true;
    }

    // Only the creator can modify draft/returned requisitions
    if (in_array($requisition->status, ['draft', 'returned'])) {
      return $requisition->user_id === $userId;
    }

    // For other statuses, only admin can modify
    return false;
  }

  /**
   * Check if user has permission to delete a requisition
   *
   * @param Requisition $requisition
   * @return bool
   */
  protected function canDelete(Requisition $requisition): bool
  {
    $user = Auth::user();
    $userId = $user->id;

    // Admin can delete any draft requisition
    if ($user->hasRole('admin')) {
      return $requisition->status === 'draft';
    }

    // Only the creator can delete their own draft requisitions
    return $requisition->user_id === $userId && $requisition->status === 'draft';
  }

  /**
   * Update requisition - WITH OWNERSHIP CHECK
   *
   * @param int $id
   * @param array $data
   * @return Requisition
   * @throws RequisitionException
   */
  public function update(int $id, array $data): Requisition
  {
    try {
      DB::beginTransaction();

      $requisition = $this->getById($id);
      $user = Auth::user();

      // ✅ Check if user can edit this requisition
      if (!$this->canModify($requisition, 'edit')) {
        Log::warning('⚠️ Unauthorized requisition edit attempt', [
          'requisition_id' => $requisition->id,
          'requisition_creator_id' => $requisition->user_id,
          'attempted_by_user_id' => $user->id,
          'attempted_by_user_email' => $user->email,
          'requisition_status' => $requisition->status,
        ]);

        throw new RequisitionException(
          'You do not have permission to edit this requisition. Only the creator can edit draft/returned requisitions.'
        );
      }

      // Check if requisition can be updated
      if (!$requisition->isEditable) {
        throw new RequisitionException('Requisition cannot be edited in current status');
      }

      $fillableData = array_intersect_key($data, array_flip([
        'department_id',
        'supplier_id',
        'title',
        'description',
        'priority',
        'type',
        'urgency',
        'justification',
        'required_by_date',
        'required_delivery_date',
        'budget_code',
        'budget_source',
        'funding_source',
        'project_code',
        'procurement_method',
        'is_framework_agreement',
        'framework_agreement_id',
        'risk_level',
        'risk_mitigation',
        'is_compliant',
        'compliance_notes',
        'currency',
        'exchange_rate'
      ]));

      $requisition->update($fillableData);

      // ✅ Update items with ALL fields
      if (!empty($data['items']) && is_array($data['items'])) {
        // Delete existing items
        $requisition->items()->delete();

        // Create new items
        $totalAmount = 0;
        foreach ($data['items'] as $itemData) {
          $itemFillable = array_intersect_key($itemData, array_flip([
            'item_name',
            'description',
            'unit_of_measure',
            'quantity',
            'estimated_unit_cost',
            'specifications',
            'catalog_number',
            'manufacturer',
            'model_number',
            'supplier_id',
            'is_inventory_item',
            'inventory_code',
            'tax_rate',
            'discount_percentage'
          ]));

          $item = $requisition->items()->create($itemFillable);
          $totalAmount += ($item->quantity * $item->estimated_unit_cost);
        }
        // Update total amount
        $requisition->update(['total_amount' => $totalAmount]);
      }

      // Log update
      $this->historyService->log(
        $requisition->id,
        'updated',
        ['id' => $requisition->id],
        ['updated_at' => now()],
        'Requisition updated'
      );

      DB::commit();

      return $requisition->fresh(['items' => function ($query) {
        $query->select([
          'id',
          'requisition_id',
          'item_name',
          'description',
          'unit_of_measure',
          'quantity',
          'estimated_unit_cost',
          'total_cost',
          'specifications',
          'catalog_number',
          'manufacturer',
          'model_number',
          'tax_rate',
          'discount_percentage',
          'is_inventory_item',
          'inventory_code',
          'status'
        ]);
      }]);
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to update requisition: ' . $e->getMessage(), [
        'requisition_id' => $id,
        'user_id' => Auth::id(),
        'trace' => $e->getTraceAsString()
      ]);
      throw new RequisitionException('Failed to update requisition: ' . $e->getMessage());
    }
  }

  /**
   * Delete requisition - WITH OWNERSHIP CHECK
   *
   * @param int $id
   * @return bool
   * @throws RequisitionException
   */
  public function delete(int $id): bool
  {
    try {
      DB::beginTransaction();

      $requisition = Requisition::findOrFail($id);
      $user = Auth::user();

      // ✅ Check if user can delete this requisition
      if (!$this->canDelete($requisition)) {
        Log::warning('⚠️ Unauthorized requisition delete attempt', [
          'requisition_id' => $requisition->id,
          'requisition_creator_id' => $requisition->user_id,
          'attempted_by_user_id' => $user->id,
          'attempted_by_user_email' => $user->email,
          'requisition_status' => $requisition->status,
        ]);

        throw new RequisitionException(
          'You do not have permission to delete this requisition. Only the creator can delete draft requisitions.'
        );
      }

      // Check if requisition can be deleted
      if (!$requisition->isDraft()) {
        throw new RequisitionException('Only draft requisitions can be deleted');
      }

      // Delete items first
      $requisition->items()->delete();

      // Log deletion
      $this->historyService->log(
        $requisition->id,
        'cancelled',
        ['id' => $requisition->id, 'status' => $requisition->status],
        null,
        'Requisition deleted'
      );

      // Delete requisition
      $result = $requisition->delete();

      DB::commit();

      Log::info('✅ Requisition deleted successfully', [
        'requisition_id' => $requisition->id,
        'deleted_by_user_id' => $user->id,
      ]);

      return $result;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to delete requisition: ' . $e->getMessage(), [
        'requisition_id' => $id,
        'user_id' => Auth::id(),
        'trace' => $e->getTraceAsString()
      ]);
      throw new RequisitionException('Failed to delete requisition: ' . $e->getMessage());
    }
  }

  /**
   * Submit requisition for approval - WITH CREATOR CHECK
   * Allows both draft and returned requisitions to be submitted
   * ONLY the requisition creator can submit it
   *
   * @param int $id
   * @param array $data
   * @param ApprovalService|null $approvalService
   * @return Requisition
   * @throws RequisitionException
   */
  public function submit(int $id, array $data = [], ?ApprovalService $approvalService = null): Requisition
  {
    try {
      DB::beginTransaction();

      $requisition = $this->getById($id);
      $user = Auth::user();
      $userId = $user->id;

      // ✅ CRITICAL: Check if the current user is the creator
      if ($requisition->user_id !== $userId) {
        Log::warning('⚠️ Unauthorized requisition submission attempt', [
          'requisition_id' => $requisition->id,
          'requisition_creator_id' => $requisition->user_id,
          'attempted_by_user_id' => $userId,
          'attempted_by_user_email' => $user->email,
        ]);

        throw new RequisitionException(
          'Only the requisition creator can submit this requisition for approval.'
        );
      }

      // ✅ Allow both draft AND returned requisitions
      $allowedStatuses = ['draft', 'returned'];
      if (!in_array($requisition->status, $allowedStatuses)) {
        throw new RequisitionException(
          sprintf(
            'Only draft or returned requisitions can be submitted. Current status: %s',
            $requisition->status
          )
        );
      }

      // Check if requisition has items
      if ($requisition->items()->count() === 0) {
        throw new RequisitionException('Cannot submit requisition without items');
      }

      // ✅ If it's a returned requisition, clean up previous approvals
      if ($requisition->status === 'returned') {
        Log::info('🔄 Resubmitting returned requisition', [
          'requisition_id' => $requisition->id,
          'return_count' => $requisition->return_count,
          'submitted_by' => $userId,
        ]);

        // Delete previous approvals to start fresh
        Approval::where('requisition_id', $requisition->id)->delete();

        // Reset return-related fields
        $requisition->update([
          'returned_at' => null,
          'returned_by' => null,
          'return_reason' => null,
          'last_returned_at' => null,
          'return_count' => ($requisition->return_count ?? 0) + 1,
          'last_resubmitted_at' => now(),
          'resubmitted_by' => $userId,
        ]);

        Log::info('🔄 Reset returned requisition for resubmission', [
          'requisition_id' => $requisition->id,
          'new_return_count' => $requisition->return_count + 1,
        ]);
      }

      // Update status to pending/submitted
      $requisition->update([
        'status' => 'submitted',
        'submitted_at' => now(),
        'submitted_by' => $userId,
        'sla_started_at' => now(),
      ]);

      // Create approval workflow
      if ($approvalService) {
        $approvalService->createApprovals($requisition);
      } else {
        // Fallback - create approvals directly if service not provided
        $approvalService = app(ApprovalService::class);
        $approvalService->createApprovals($requisition);
      }

      // Log submission with context about resubmission
      $logData = [
        'previous_status' => $requisition->getOriginal('status'),
        'new_status' => 'submitted',
        'submitted_by' => $userId,
      ];

      if ($requisition->getOriginal('status') === 'returned') {
        $logData['resubmission'] = true;
        $logData['return_count'] = $requisition->return_count + 1;
      }

      $this->historyService->log(
        $requisition->id,
        'submitted',
        ['status' => $requisition->getOriginal('status')],
        ['status' => 'submitted'],
        $data['comment'] ?? ($requisition->getOriginal('status') === 'returned'
          ? 'Requisition resubmitted after revision'
          : 'Requisition submitted for approval')
      );

      DB::commit();

      Log::info('✅ Requisition submitted successfully', [
        'requisition_id' => $requisition->id,
        'previous_status' => $requisition->getOriginal('status'),
        'is_resubmission' => $requisition->getOriginal('status') === 'returned',
        'submitted_by_user_id' => $userId,
      ]);

      return $requisition->fresh(['items' => function ($query) {
        $query->select([
          'id',
          'requisition_id',
          'item_name',
          'description',
          'unit_of_measure',
          'quantity',
          'estimated_unit_cost',
          'total_cost',
          'specifications',
          'catalog_number',
          'manufacturer',
          'model_number',
          'tax_rate',
          'discount_percentage'
        ]);
      }]);
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to submit requisition: ' . $e->getMessage(), [
        'requisition_id' => $id,
        'user_id' => Auth::id(),
        'trace' => $e->getTraceAsString()
      ]);
      throw new RequisitionException('Failed to submit requisition: ' . $e->getMessage());
    }
  }

  /**
   * Return requisition for revision - WITH APPROVER CHECK
   *
   * @param int $id
   * @param array $data
   * @return Requisition
   * @throws RequisitionException
   */
  public function returnForRevision(int $id, array $data): Requisition
  {
    try {
      DB::beginTransaction();

      $requisition = Requisition::findOrFail($id);
      $user = Auth::user();

      // Check if requisition can be returned
      if (!$requisition->isApprovable) {
        throw new RequisitionException('Requisition cannot be returned in current status');
      }

      // Check if user is the current approver
      $currentApproval = Approval::where('requisition_id', $requisition->id)
        ->where('status', 'pending')
        ->where(function ($q) use ($user) {
          $q->where('approver_id', $user->id)
            ->orWhere('delegate_id', $user->id);
        })
        ->first();

      if (!$currentApproval && !$user->hasRole('admin')) {
        Log::warning('⚠️ Unauthorized requisition return attempt', [
          'requisition_id' => $requisition->id,
          'attempted_by_user_id' => $user->id,
          'attempted_by_user_email' => $user->email,
        ]);

        throw new RequisitionException(
          'You are not authorized to return this requisition. Only the current approver can return it.'
        );
      }

      // Update status
      $requisition->update([
        'status' => 'returned',
        'returned_at' => now(),
        'returned_by' => $user->id,
        'return_reason' => $data['reason'] ?? null,
        'return_count' => $requisition->return_count + 1,
        'last_returned_at' => now(),
      ]);

      // Update the approval status
      if ($currentApproval) {
        $currentApproval->update([
          'status' => 'returned',
          'returned_at' => now(),
          'return_reason' => $data['reason'] ?? null,
        ]);
      }

      // Log return
      $this->historyService->log(
        $requisition->id,
        'returned',
        ['status' => $requisition->getOriginal('status')],
        ['status' => 'returned'],
        $data['reason'] ?? 'Requisition returned for revision'
      );

      DB::commit();

      Log::info('✅ Requisition returned for revision', [
        'requisition_id' => $requisition->id,
        'returned_by_user_id' => $user->id,
        'return_count' => $requisition->return_count,
      ]);

      return $requisition->fresh();
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to return requisition: ' . $e->getMessage(), [
        'requisition_id' => $id,
        'user_id' => Auth::id(),
        'trace' => $e->getTraceAsString()
      ]);
      throw new RequisitionException('Failed to return requisition: ' . $e->getMessage());
    }
  }

  /**
   * Cancel requisition - WITH OWNERSHIP CHECK
   *
   * @param int $id
   * @param array $data
   * @return Requisition
   * @throws RequisitionException
   */
  public function cancel(int $id, array $data): Requisition
  {
    try {
      DB::beginTransaction();

      $requisition = Requisition::findOrFail($id);
      $user = Auth::user();

      // ✅ Check if user can cancel this requisition
      $canCancel = false;
      $reason = '';

      // Admin can cancel any requisition
      if ($user->hasRole('admin')) {
        $canCancel = true;
        $reason = 'admin';
      }
      // Creator can cancel their own draft/returned requisitions
      elseif ($requisition->user_id === $user->id && in_array($requisition->status, ['draft', 'returned'])) {
        $canCancel = true;
        $reason = 'creator';
      }
      // HOD can cancel requisitions from their department (if configured)
      elseif ($user->hasRole('hod') && $requisition->department_id === $user->department_id) {
        $canCancel = true;
        $reason = 'hod';
      }

      if (!$canCancel) {
        Log::warning('⚠️ Unauthorized requisition cancellation attempt', [
          'requisition_id' => $requisition->id,
          'requisition_creator_id' => $requisition->user_id,
          'requisition_status' => $requisition->status,
          'attempted_by_user_id' => $user->id,
          'attempted_by_user_email' => $user->email,
          'user_roles' => $user->roles->pluck('name')->toArray(),
        ]);

        throw new RequisitionException(
          'You do not have permission to cancel this requisition.'
        );
      }

      // Check if requisition can be cancelled
      if ($requisition->isApproved()) {
        throw new RequisitionException('Approved requisitions cannot be cancelled');
      }

      // Update status
      $requisition->update([
        'status' => 'cancelled',
        'cancelled_at' => now(),
        'cancelled_by' => $user->id,
        'cancellation_reason' => $data['reason'] ?? null,
      ]);

      // Cancel all pending approvals - optimized query
      Approval::where('requisition_id', $requisition->id)
        ->where('status', 'pending')
        ->update(['status' => 'cancelled']);

      // Log cancellation
      $this->historyService->log(
        $requisition->id,
        'cancelled',
        ['status' => $requisition->getOriginal('status')],
        ['status' => 'cancelled'],
        $data['reason'] ?? 'Requisition cancelled'
      );

      DB::commit();

      Log::info('✅ Requisition cancelled successfully', [
        'requisition_id' => $requisition->id,
        'cancelled_by_user_id' => $user->id,
        'cancellation_reason' => $data['reason'] ?? null,
        'cancelled_by_role' => $reason,
      ]);

      return $requisition->fresh();
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to cancel requisition: ' . $e->getMessage(), [
        'requisition_id' => $id,
        'user_id' => Auth::id(),
        'trace' => $e->getTraceAsString()
      ]);
      throw new RequisitionException('Failed to cancel requisition: ' . $e->getMessage());
    }
  }

  /**
   * Get requisition statistics - OPTIMIZED
   *
   * @param array $filters
   * @return array
   */
  public function getStats(array $filters = []): array
  {
    $query = Requisition::query();

    if (!empty($filters['department_id'])) {
      $query->byDepartment((int) $filters['department_id']);
    }

    if (!empty($filters['user_id'])) {
      $query->byUser((int) $filters['user_id']);
    }

    return [
      'total' => $query->count(),
      'pending' => (clone $query)->pendingApproval()->count(),
      'approved' => (clone $query)->approved()->count(),
      'declined' => (clone $query)->declined()->count(),
      'returned' => (clone $query)->returned()->count(),
      'cancelled' => (clone $query)->cancelled()->count(),
    ];
  }

  /**
   * Get requisitions for a specific user - LOADS ITEMS AND APPROVALS
   *
   * @param int $userId
   * @param array $filters
   * @param int $perPage
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getUserRequisitions(int $userId, array $filters = [], int $perPage = 15)
  {
    $filters['user_id'] = $userId;
    return $this->getAll($filters, $perPage);
  }

  /**
   * Get requisitions pending approval for a user - LOADS ITEMS AND APPROVALS
   *
   * @param int $userId   * @param array $filters
   * @param int $perPage
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getPendingApprovals(int $userId, array $filters = [], int $perPage = 15)
  {
    $query = Approval::where(function ($q) use ($userId) {
      $q->where('approver_id', $userId)
        ->orWhere('delegate_id', $userId);
    })
      ->where('status', 'pending')
      ->with(['requisition' => function ($q) {
        $q->select([
          'id',
          'reference_number',
          'title',
          'description',
          'total_amount',
          'status',
          'user_id',
          'department_id',
          'submitted_at',
          'created_at'
        ])->with([
          'user:id,first_name,last_name,email',
          'department:id,name,code',
          'items' => function ($query) {
            $query->select([
              'id',
              'requisition_id',
              'item_name',
              'quantity',
              'estimated_unit_cost',
              'total_cost',
              'unit_of_measure'
            ]);
          },
          'approvals' => function ($query) {
            $query->select([
              'id',
              'requisition_id',
              'approver_id',
              'delegate_id',
              'level',
              'status',
              'comment',
              'decline_reason',
              'return_reason',
              'approved_at',
              'declined_at',
              'returned_at',
              'order',
              'created_at',
              'updated_at'
            ])->with([
              'approver:id,first_name,last_name,email',
              'delegate:id,first_name,last_name,email'
            ])->orderBy('order', 'asc');
          }
        ]);
      }]);

    if (!empty($filters['level'])) {
      $query->where('level', $filters['level']);
    }

    if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
      $query->whereBetween('created_at', [$filters['date_from'], $filters['date_to']]);
    }

    return $query->select([
      'id',
      'requisition_id',
      'approver_id',
      'delegate_id',
      'level',
      'status',
      'created_at',
      'updated_at'
    ])->orderBy('created_at', 'asc')->paginate($perPage);
  }

  /**
   * Get requisition by ID without relationships (for performance)
   *
   * @param int $id
   * @return Requisition
   * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
   */
  public function getByIdBasic(int $id): Requisition
  {
    return Requisition::select([
      'id',
      'reference_number',
      'title',
      'status',
      'total_amount',
      'user_id',
      'department_id',
      'created_at'
    ])->findOrFail($id);
  }

  /**
   * Check if requisition exists
   *
   * @param int $id
   * @return bool
   */
  public function exists(int $id): bool
  {
    return Requisition::where('id', $id)->exists();
  }

  /**
   * Get requisition count by status - OPTIMIZED
   *
   * @param string $status
   * @param array $filters
   * @return int
   */
  public function countByStatus(string $status, array $filters = []): int
  {
    $query = Requisition::where('status', $status);

    if (!empty($filters['department_id'])) {
      $query->byDepartment((int) $filters['department_id']);
    }

    if (!empty($filters['user_id'])) {
      $query->byUser((int) $filters['user_id']);
    }

    return $query->count();
  }
}
