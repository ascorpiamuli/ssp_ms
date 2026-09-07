<?php
// app/Services/Procurement/Services/PurchaseOrderService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\Requisition;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\SupplierQuotation;
use App\Models\Supplier;
use App\Services\Procurement\Base\BaseService;
use App\Services\Procurement\Contracts\Services\PurchaseOrderServiceInterface;
use App\Services\Procurement\Contracts\Repositories\PurchaseOrderRepositoryInterface;
use App\Services\Procurement\Contracts\Utilities\ReferenceNumberGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\PdfGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\DTOs\PurchaseOrderDTO;
use App\Services\Procurement\Exceptions\PurchaseOrderException;
use App\Services\Admin\AuditLogService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class PurchaseOrderService extends BaseService implements PurchaseOrderServiceInterface
{
  public function __construct(
    protected PurchaseOrderRepositoryInterface $repository,
    protected ReferenceNumberGeneratorInterface $referenceGenerator,
    protected PdfGeneratorInterface $pdfGenerator,
    protected NotificationDispatcherInterface $notificationDispatcher,
    protected AuditLogService $auditLogService
  ) {
    parent::__construct();
  }
public function generatePurchaseOrder(PurchaseOrderDTO $dto): PurchaseOrder
{
  Log::info('[PurchaseOrderService] generatePurchaseOrder - START', [
    'requisition_id' => $dto->requisitionId,
    'type' => $dto->type,
    'title' => $dto->title,
    'items_count' => count($dto->items ?? []),
  ]);

  $requisition = Requisition::with(['items', 'supplier'])->find($dto->requisitionId);

  if (!$requisition) {
    Log::error('[PurchaseOrderService] Requisition not found', [
      'requisition_id' => $dto->requisitionId
    ]);
    throw PurchaseOrderException::requisitionNotFound($dto->requisitionId);
  }

  Log::info('[PurchaseOrderService] Requisition found', [
    'requisition_id' => $requisition->id,
    'reference_number' => $requisition->reference_number ?? $requisition->id,
    'supplier_id' => $requisition->supplier_id,
    'requisition_items_count' => $requisition->items->count(),
  ]);

  if (!$requisition->supplier_id) {
    Log::error('[PurchaseOrderService] No supplier selected for requisition', [
      'requisition_id' => $requisition->id
    ]);
    throw PurchaseOrderException::noSupplierSelected();
  }

  $supplierId = $requisition->supplier_id;

  $supplier = Supplier::find($supplierId);
  if (!$supplier) {
    Log::error('[PurchaseOrderService] Supplier not found', [
      'supplier_id' => $supplierId,
    ]);
    throw new \Exception("Supplier with ID {$supplierId} not found");
  }

  Log::info('[PurchaseOrderService] Supplier verified', [
    'supplier_id' => $supplierId,
    'supplier_name' => $supplier->company_name ?? $supplier->name,
  ]);

  $existing = PurchaseOrder::where('requisition_id', $requisition->id)
    ->whereNotIn('status', ['cancelled', 'closed', 'completed'])
    ->first();

  if ($existing) {
    Log::warning('[PurchaseOrderService] PO already exists for requisition', [
      'requisition_id' => $requisition->id,
      'existing_po_id' => $existing->id,
      'existing_po_number' => $existing->po_number,
    ]);
    throw PurchaseOrderException::poAlreadyExists();
  }

  $userId = $this->getCurrentUserId();
  if (!$userId) {
    Log::error('[PurchaseOrderService] No authenticated user found');
    throw new \Exception('User must be authenticated to create a purchase order');
  }

  Log::info('[PurchaseOrderService] User authenticated', [
    'user_id' => $userId,
  ]);

  return $this->transaction(function () use ($requisition, $dto, $userId, $supplierId) {
    $metadata = $requisition->metadata ?? [];
    $selectedQuotationId = $metadata['procurement']['selected_quotation_id'] ??
      $metadata['selected_quotation_id'] ??
      $dto->supplier_quotation_id ??
      null;

    Log::info('[PurchaseOrderService] Looking for selected quotation', [
      'selected_quotation_id' => $selectedQuotationId,
    ]);

    $quotation = null;
    if ($selectedQuotationId) {
      $quotation = SupplierQuotation::with(['items', 'supplier'])
        ->where('id', $selectedQuotationId)
        ->first();

      if ($quotation) {
        Log::info('[PurchaseOrderService] Quotation found', [
          'quotation_id' => $quotation->id,
          'quotation_number' => $quotation->quotation_number,
          'quotation_items_count' => $quotation->items->count(),
        ]);
      } else {
        Log::warning('[PurchaseOrderService] Quotation not found', [
          'selected_quotation_id' => $selectedQuotationId,
        ]);
      }
    }

    // ✅ FIXED: Calculate totals from the items array in the DTO
    // This allows supplier-added items to be included
    $totalAmount = 0;
    $taxAmount = 0;
    $totalWithTax = 0;

    // Create a lookup map of requisition items by ID for quick access
    $requisitionItemsMap = $requisition->items->keyBy('id');

    Log::info('[PurchaseOrderService] Processing items from DTO', [
      'dto_items_count' => count($dto->items ?? []),
      'requisition_items_count' => $requisitionItemsMap->count(),
    ]);

    // ✅ Process items from the DTO (which includes supplier-added items)
    foreach ($dto->items as $itemData) {
      $requisitionItemId = $itemData['requisition_item_id'] ?? null;
      $quantity = $itemData['quantity'] ?? 0;
      $unitPrice = $itemData['unit_price'] ?? 0;
      $itemTotal = $quantity * $unitPrice;
      $totalAmount += $itemTotal;

      $itemTaxRate = $itemData['tax_rate'] ?? 0;
      $taxAmount += $itemTotal * ($itemTaxRate / 100);

      Log::debug('[PurchaseOrderService] Processing item', [
        'requisition_item_id' => $requisitionItemId,
        'item_name' => $itemData['item_name'] ?? 'Unknown',
        'quantity' => $quantity,
        'unit_price' => $unitPrice,
        'item_total' => $itemTotal,
        'is_from_requisition' => $requisitionItemId !== null && $requisitionItemsMap->has($requisitionItemId),
        'is_supplier_added' => $requisitionItemId === null || !$requisitionItemsMap->has($requisitionItemId),
      ]);
    }

    $totalWithTax = $totalAmount + $taxAmount;

    Log::info('[PurchaseOrderService] Calculated totals', [
      'total_amount' => $totalAmount,
      'tax_amount' => $taxAmount,
      'total_with_tax' => $totalWithTax,
    ]);

    $poNumber = $this->referenceGenerator->generatePoNumber($dto->type);

    Log::info('[PurchaseOrderService] Generated PO number', [
      'po_number' => $poNumber,
      'type' => $dto->type,
    ]);

    $po = $this->repository->createPurchaseOrder([
      'requisition_id' => $requisition->id,
      'supplier_id' => $supplierId,
      'supplier_quotation_id' => $quotation?->id,
      'po_number' => $poNumber,
      'type' => $dto->type,
      'title' => $dto->title ?? "Order from {$requisition->reference_number}",
      'description' => $dto->description ?? $requisition->description,
      'total_amount' => $totalAmount,
      'tax_amount' => $taxAmount,
      'total_with_tax' => $totalWithTax,
      'currency' => $dto->currency ?? 'KES',
      'issue_date' => $dto->issueDate?->toDateString() ?? now()->toDateString(),
      'expected_delivery_date' => $dto->expectedDeliveryDate?->toDateString(),
      'delivery_address' => $dto->deliveryAddress ?? $requisition->delivery_address,
      'delivery_contact' => $dto->deliveryContact ?? $requisition->delivery_contact,
      'delivery_phone' => $dto->deliveryPhone ?? $requisition->delivery_phone,
      'delivery_email' => $dto->deliveryEmail ?? $requisition->delivery_email,
      'payment_terms' => $dto->paymentTerms ?? $requisition->payment_terms,
      'delivery_terms' => $dto->deliveryTerms ?? $requisition->delivery_terms,
      'special_conditions' => $dto->specialConditions,
      'terms_and_conditions' => $dto->termsAndConditions,
      'validity_period_days' => $dto->validityPeriodDays ?? 30,
      'contract_number' => $dto->contractNumber,
      'contract_start_date' => $dto->contractStartDate?->toDateString(),
      'contract_end_date' => $dto->contractEndDate?->toDateString(),
      'status' => 'draft',
      'generated_by' => $userId,
      'metadata' => array_merge($dto->metadata ?? [], [
        'selected_quotation_id' => $quotation?->id,
        'generated_from' => 'purchase_order_creation',
        'generated_at' => now()->toIso8601String(),
        'total_items' => count($dto->items ?? []),
        'requisition_items_count' => $requisitionItemsMap->count(),
        'supplier_added_items_count' => collect($dto->items)->filter(function ($item) use ($requisitionItemsMap) {
          $reqItemId = $item['requisition_item_id'] ?? null;
          return $reqItemId === null || !$requisitionItemsMap->has($reqItemId);
        })->count(),
      ]),
    ]);

    // Audit: Log PO creation
    $this->auditLogService->logModelCreated(
      $po,
      "Purchase Order {$po->po_number} generated for requisition #{$requisition->id}"
    );

    Log::info('[PurchaseOrderService] Purchase order created', [
      'po_id' => $po->id,
      'po_number' => $po->po_number,
      'supplier_id' => $po->supplier_id,
    ]);

    // ✅ FIXED: Create PO items from the DTO items (including supplier-added items)
    foreach ($dto->items as $itemData) {
      $requisitionItemId = $itemData['requisition_item_id'] ?? null;
      $supplierQuotationItemId = $itemData['supplier_quotation_item_id'] ?? null;

      // Check if this item exists in the requisition (for logging)
      $requisitionItem = $requisitionItemsMap->get($requisitionItemId);
      $isFromRequisition = $requisitionItem !== null;

      $quantity = $itemData['quantity'] ?? 0;
      $unitPrice = $itemData['unit_price'] ?? 0;
      $itemTotal = $quantity * $unitPrice;
      $taxRate = $itemData['tax_rate'] ?? 0;
      $itemTaxAmount = $itemTotal * ($taxRate / 100);
      $itemNetPrice = $itemTotal + $itemTaxAmount;

      Log::info('[PurchaseOrderService] Creating PO item', [
        'requisition_item_id' => $requisitionItemId,
        'supplier_quotation_item_id' => $supplierQuotationItemId,
        'item_name' => $itemData['item_name'] ?? 'Unknown',
        'quantity' => $quantity,
        'unit_price' => $unitPrice,
        'total_price' => $itemTotal,
        'is_from_requisition' => $isFromRequisition,
        'is_supplier_added' => !$isFromRequisition,
      ]);

      $this->repository->createPurchaseOrderItem([
        'purchase_order_id' => $po->id,
        'requisition_item_id' => $requisitionItemId, // ✅ Can be null for supplier-added items
        'supplier_quotation_item_id' => $supplierQuotationItemId,
        'item_name' => $itemData['item_name'],
        'description' => $itemData['description'] ?? null,
        'unit_of_measure' => $itemData['unit_of_measure'] ?? ($isFromRequisition ? $requisitionItem->unit_of_measure : 'pcs'),
        'quantity' => $quantity,
        'unit_price' => $unitPrice,
        'total_price' => $itemTotal,
        'tax_rate' => $taxRate,
        'tax_amount' => $itemTaxAmount,
        'discount_rate' => $itemData['discount_rate'] ?? 0,
        'discount_amount' => 0,
        'net_price' => $itemNetPrice,
        'delivery_days' => $itemData['delivery_days'] ?? ($isFromRequisition ? $requisitionItem->delivery_days : null),
        'warranty_months' => $itemData['warranty_months'] ?? ($isFromRequisition ? $requisitionItem->warranty_months : null),
        'specifications' => $itemData['specifications'] ?? ($isFromRequisition ? $requisitionItem->specifications : null),
        'brand' => $itemData['brand'] ?? null,
        'model' => $itemData['model'] ?? null,
        'catalog_number' => $itemData['catalog_number'] ?? null,
        'status' => 'pending',
        'metadata' => [
          'is_from_requisition' => $isFromRequisition,
          'is_supplier_added' => !$isFromRequisition,
          'requisition_item_exists' => $isFromRequisition,
        ],
      ]);
    }

    $po->updateTotalAmount();

    // ✅ Update requisition status if all items are from requisition
    // If there are supplier-added items, we keep the requisition status as is
    $hasSupplierAddedItems = collect($dto->items)->contains(function ($item) use ($requisitionItemsMap) {
      $reqItemId = $item['requisition_item_id'] ?? null;
      return $reqItemId === null || !$requisitionItemsMap->has($reqItemId);
    });

    if (!$hasSupplierAddedItems) {
      try {
        $requisition->status = 'final_approved';
        $requisition->save();

        Log::info('[PurchaseOrderService] Requisition status updated to final_approved', [
          'requisition_id' => $requisition->id,
          'old_status' => $requisition->getOriginal('status'),
        ]);
      } catch (\Exception $e) {
        Log::warning('[PurchaseOrderService] Could not update requisition status to final_approved', [
          'requisition_id' => $requisition->id,
          'error' => $e->getMessage(),
        ]);
      }
    } else {
      Log::info('[PurchaseOrderService] Requisition status unchanged - supplier added items present', [
        'requisition_id' => $requisition->id,
        'current_status' => $requisition->status,
        'supplier_added_items_count' => collect($dto->items)->filter(function ($item) use ($requisitionItemsMap) {
          $reqItemId = $item['requisition_item_id'] ?? null;
          return $reqItemId === null || !$requisitionItemsMap->has($reqItemId);
        })->count(),
      ]);
    }

    $this->logHistory(
      $requisition->id,
      'po_generated',
      'purchase_order',
      $po->id,
      $userId,
      null,
      [
        'po_number' => $po->po_number,
        'type' => $po->type,
        'total_amount' => $po->total_amount,
        'requisition_status' => $requisition->status,
        'total_items' => count($dto->items ?? []),
        'supplier_added_items_count' => $hasSupplierAddedItems ? collect($dto->items)->filter(function ($item) use ($requisitionItemsMap) {
          $reqItemId = $item['requisition_item_id'] ?? null;
          return $reqItemId === null || !$requisitionItemsMap->has($reqItemId);
        })->count() : 0,
      ],
      "Purchase Order {$po->po_number} generated for requisition {$requisition->reference_number}" .
      ($hasSupplierAddedItems ? " (with supplier-added items)" : "")
    );

    Log::info('[PurchaseOrderService] generatePurchaseOrder - COMPLETED', [
      'po_id' => $po->id,
      'po_number' => $po->po_number,
      'status' => $po->status,
      'total_amount' => $po->total_amount,
      'requisition_status' => $requisition->status,
      'total_items' => $po->items->count(),
      'has_supplier_added_items' => $hasSupplierAddedItems,
    ]);

    return $po;
  });
}

  public function getPurchaseOrder(int $poId): PurchaseOrder
  {
    $po = $this->repository->findPurchaseOrder($poId);

    if (!$po) {
      throw PurchaseOrderException::poNotFound($poId);
    }

    return $po;
  }

  public function getPurchaseOrdersForRequisition(int $requisitionId): array
  {
    return $this->repository->getPurchaseOrdersForRequisition($requisitionId);
  }

  /**
   * ✅ Approve purchase order (Director/Principal)
   * ONLY updates approved_by and approved_at - status remains as draft
   */
  public function approvePurchaseOrder(int $poId, int $userId, ?string $comment = null): PurchaseOrder
  {
    Log::info('[PurchaseOrderService] approvePurchaseOrder - START', [
      'po_id' => $poId,
      'user_id' => $userId,
      'timestamp' => now()->toIso8601String(),
    ]);

    try {
      $po = $this->getPurchaseOrder($poId);

      Log::debug('[PurchaseOrderService] approvePurchaseOrder - Purchase order retrieved', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
        'checked_by' => $po->checked_by,
        'checked_at' => $po->checked_at,
        'endorsed_by' => $po->endorsed_by,
        'endorsed_at' => $po->endorsed_at,
        'approved_by' => $po->approved_by,
        'approved_at' => $po->approved_at,
      ]);

      $user = \App\Models\User::with('roles')->find($userId);

      if (!$user) {
        Log::error('[PurchaseOrderService] approvePurchaseOrder - User not found', [
          'user_id' => $userId,
          'po_id' => $poId,
          'po_number' => $po->po_number,
        ]);
        throw new \Exception('User not found');
      }

      Log::debug('[PurchaseOrderService] approvePurchaseOrder - User found', [
        'user_id' => $user->id,
        'user_email' => $user->email,
        'user_full_name' => $user->full_name ?? $user->name ?? 'Unknown',
      ]);

      Log::debug('[PurchaseOrderService] approvePurchaseOrder - Checking user role', [
        'user_id' => $user->id,
        'user_email' => $user->email,
        'is_final_approver' => $user->isFinalApprover(),
        'is_principal' => $user->isPrincipal(),
        'is_admin' => $user->isAdmin(),
        'roles' => $user->roles->map(function ($role) {
          return [
            'id' => $role->id,
            'name' => $role->name,
            'label' => $role->label ?? $role->name,
          ];
        })->toArray(),
      ]);

      $canApprove = $user->isFinalApprover() || $user->isPrincipal() || $user->isAdmin();

      if (!$canApprove) {
        Log::warning('[PurchaseOrderService] approvePurchaseOrder - User is not authorized to approve', [
          'user_id' => $user->id,
          'user_email' => $user->email,
          'user_roles' => $user->roles->pluck('name')->toArray(),
          'user_roles_labels' => $user->roles->pluck('label')->toArray(),
          'po_id' => $po->id,
          'po_number' => $po->po_number,
        ]);
        throw new \Exception('Only Director/Finance Administrator or Principal can approve purchase orders');
      }

      Log::info('[PurchaseOrderService] approvePurchaseOrder - User role validated successfully', [
        'user_id' => $user->id,
        'user_email' => $user->email,
      ]);

      Log::debug('[PurchaseOrderService] approvePurchaseOrder - Validating PO has been checked', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'checked_by' => $po->checked_by,
        'checked_at' => $po->checked_at,
      ]);

      if (is_null($po->checked_by) || is_null($po->checked_at)) {
        Log::warning('[PurchaseOrderService] approvePurchaseOrder - PO has not been checked by HOD', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'checked_by' => $po->checked_by,
          'checked_at' => $po->checked_at,
        ]);
        throw new \Exception('Purchase order must be checked by HOD before approval.');
      }

      Log::debug('[PurchaseOrderService] approvePurchaseOrder - Validating PO has been endorsed', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'endorsed_by' => $po->endorsed_by,
        'endorsed_at' => $po->endorsed_at,
      ]);

      if (is_null($po->endorsed_by) || is_null($po->endorsed_at)) {
        Log::warning('[PurchaseOrderService] approvePurchaseOrder - PO has not been endorsed by Accountant', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'endorsed_by' => $po->endorsed_by,
          'endorsed_at' => $po->endorsed_at,
        ]);
        throw new \Exception('Purchase order must be endorsed by Accountant before approval.');
      }

      Log::debug('[PurchaseOrderService] approvePurchaseOrder - Validating PO is not already approved', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'approved_by' => $po->approved_by,
        'approved_at' => $po->approved_at,
      ]);

      if (!is_null($po->approved_by) || !is_null($po->approved_at)) {
        Log::warning('[PurchaseOrderService] approvePurchaseOrder - PO is already approved', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'approved_by' => $po->approved_by,
          'approved_at' => $po->approved_at,
        ]);
        throw new \Exception('Purchase order has already been approved.');
      }

      Log::info('[PurchaseOrderService] approvePurchaseOrder - All validations passed', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'checked_by' => $po->checked_by,
        'checked_at' => $po->checked_at,
        'endorsed_by' => $po->endorsed_by,
        'endorsed_at' => $po->endorsed_at,
      ]);

      Log::debug('[PurchaseOrderService] approvePurchaseOrder - Executing approval transaction', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'user_id' => $userId,
        'has_comment' => !empty($comment),
        'comment' => $comment,
      ]);

      $result = $this->transaction(function () use ($po, $userId, $comment) {
        Log::debug('[PurchaseOrderService] approvePurchaseOrder - Transaction START', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
        ]);

        $oldValues = $po->toArray();

        // ✅ Approve the purchase order (ONLY updates approved_by and approved_at)
        $po->update([
          'approved_by' => $userId,
          'approved_at' => now(),
          'metadata' => array_merge($po->metadata ?? [], [
            'approved_comment' => $comment,
            'approved_at' => now()->toIso8601String(),
            'approved_by_name' => \App\Models\User::find($userId)?->full_name ?? $userId,
          ]),
        ]);

        // Audit: Log PO approval
        $approvalMessage = "Purchase Order {$po->po_number} approved by user #{$userId}";
        if ($comment) {
          $approvalMessage .= ": {$comment}";
        }
        $this->auditLogService->logModelUpdated(
          $po,
          $oldValues,
          $approvalMessage
        );

        Log::debug('[PurchaseOrderService] approvePurchaseOrder - Repository approval completed', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'status' => $po->status,
          'approved_by' => $po->approved_by,
          'approved_at' => $po->approved_at,
          'checked_by' => $po->checked_by,
          'checked_at' => $po->checked_at,
          'endorsed_by' => $po->endorsed_by,
          'endorsed_at' => $po->endorsed_at,
        ]);

        Log::debug('[PurchaseOrderService] approvePurchaseOrder - Logging history', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'requisition_id' => $po->requisition_id,
          'user_id' => $userId,
          'action' => 'po_approved',
        ]);

        $this->logHistory(
          $po->requisition_id,
          'po_approved',
          'purchase_order',
          $po->id,
          $userId,
          null,
          [
            'approved_by' => $userId,
            'approved_at' => now()->toIso8601String(),
            'comment' => $comment,
            'status_unchanged' => $po->status,
            'checked_by' => $po->checked_by,
            'checked_at' => $po->checked_at,
            'endorsed_by' => $po->endorsed_by,
            'endorsed_at' => $po->endorsed_at,
          ],
          "Purchase Order {$po->po_number} approved by Director" . ($comment ? ": {$comment}" : "")
        );

        Log::debug('[PurchaseOrderService] approvePurchaseOrder - History logged successfully', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
        ]);

        Log::debug('[PurchaseOrderService] approvePurchaseOrder - Dispatching notification', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'requisition_id' => $po->requisition_id,
          'total_amount' => $po->total_amount,
        ]);

        $this->notificationDispatcher->notify('po_approved', [
          'purchase_order_id' => $po->id,
          'po_number' => $po->po_number,
          'requisition_id' => $po->requisition_id,
          'approved_by' => $userId,
          'approved_by_name' => $po->approved_by_user ?? 'Director',
          'total_amount' => $po->total_amount,
          'formatted_total' => number_format((float) $po->total_amount, 2),
          'department' => $po->requisition?->department?->name ?? 'Unknown',
          'checked_by' => $po->checked_by_user ?? 'HOD',
          'endorsed_by' => $po->endorsed_by_user ?? 'Accountant',
        ]);

        Log::debug('[PurchaseOrderService] approvePurchaseOrder - Notification dispatched successfully', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
        ]);

        Log::debug('[PurchaseOrderService] approvePurchaseOrder - Transaction END', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'final_status' => $po->status,
          'approved_by' => $userId,
          'approved_at' => $po->approved_at,
        ]);

        return $po->fresh();
      });

      Log::info('[PurchaseOrderService] approvePurchaseOrder - COMPLETED', [
        'po_id' => $result->id,
        'po_number' => $result->po_number,
        'status' => $result->status,
        'approved_by' => $result->approved_by,
        'approved_at' => $result->approved_at,
        'user_id' => $userId,
        'total_amount' => $result->total_amount,
        'checked_by' => $result->checked_by,
        'checked_at' => $result->checked_at,
        'endorsed_by' => $result->endorsed_by,
        'endorsed_at' => $result->endorsed_at,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('[PurchaseOrderService] approvePurchaseOrder - FAILED', [
        'po_id' => $poId,
        'user_id' => $userId,
        'error_message' => $e->getMessage(),
        'error_code' => $e->getCode(),
        'error_file' => $e->getFile(),
        'error_line' => $e->getLine(),
        'timestamp' => now()->toIso8601String(),
      ]);

      throw $e;
    }
  }

  public function issuePurchaseOrder(int $poId): PurchaseOrder
  {
    Log::info('[PurchaseOrderService] issuePurchaseOrder - START', [
      'po_id' => $poId,
    ]);

    $po = $this->getPurchaseOrder($poId);

    if ($po->status !== 'draft') {
      throw new \Exception('PO can only be issued from draft status.');
    }

    return $this->transaction(function () use ($po) {
      $oldValues = $po->toArray();

      $po->update([
        'status' => 'issued',
        'issued_at' => now(),
      ]);

      // Audit: Log PO issuance
      $this->auditLogService->logModelUpdated(
        $po,
        $oldValues,
        "Purchase Order {$po->po_number} issued"
      );

      $this->logHistory(
        $po->requisition_id,
        'po_issued',
        'purchase_order',
        $po->id,
        $this->getCurrentUserId(),
        null,
        ['status' => 'issued'],
        "Purchase Order {$po->po_number} issued"
      );

      Log::info('[PurchaseOrderService] issuePurchaseOrder - COMPLETED', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
      ]);

      return $po;
    });
  }

  public function sendPurchaseOrderToSupplier(int $poId): PurchaseOrder
  {
    Log::info('[PurchaseOrderService] sendPurchaseOrderToSupplier - START', [
      'po_id' => $poId,
    ]);

    $po = $this->getPurchaseOrder($poId);

    if ($po->status !== 'issued') {
      throw PurchaseOrderException::poMustBeIssued();
    }

    return $this->transaction(function () use ($po) {
      $oldValues = $po->toArray();

      $po->update([
        'status' => 'sent',
        'sent_at' => now(),
      ]);

      // Audit: Log PO sent to supplier
      $this->auditLogService->logModelUpdated(
        $po,
        $oldValues,
        "Purchase Order {$po->po_number} sent to supplier"
      );

      $this->logHistory(
        $po->requisition_id,
        'po_sent',
        'purchase_order',
        $po->id,
        $this->getCurrentUserId(),
        null,
        ['sent_to' => $po->supplier_id],
        "Purchase Order {$po->po_number} sent to supplier"
      );

      Log::info('[PurchaseOrderService] sendPurchaseOrderToSupplier - COMPLETED', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
      ]);

      return $po;
    });
  }

  public function acknowledgePurchaseOrder(int $poId, int $supplierId): PurchaseOrder
  {
    Log::info('[PurchaseOrderService] acknowledgePurchaseOrder - START', [
      'po_id' => $poId,
      'supplier_id' => $supplierId,
    ]);

    $po = $this->getPurchaseOrder($poId);

    if ($po->supplier_id !== $supplierId) {
      throw PurchaseOrderException::supplierMismatch();
    }

    if ($po->status !== 'sent') {
      throw PurchaseOrderException::poMustBeSent();
    }

    return $this->transaction(function () use ($po) {
      $oldValues = $po->toArray();

      $po->update([
        'status' => 'acknowledged',
        'acknowledged_at' => now(),
      ]);

      // Audit: Log PO acknowledged
      $this->auditLogService->logModelUpdated(
        $po,
        $oldValues,
        "Purchase Order {$po->po_number} acknowledged by supplier"
      );

      $this->logHistory(
        $po->requisition_id,
        'po_acknowledged',
        'purchase_order',
        $po->id,
        $this->getCurrentUserId(),
        null,
        ['status' => 'acknowledged'],
        "Purchase Order {$po->po_number} acknowledged by supplier"
      );

      Log::info('[PurchaseOrderService] acknowledgePurchaseOrder - COMPLETED', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
      ]);

      return $po;
    });
  }

  public function markPurchaseOrderDelivered(int $poId): PurchaseOrder
  {
    Log::info('[PurchaseOrderService] markPurchaseOrderDelivered - START', [
      'po_id' => $poId,
    ]);

    $po = $this->getPurchaseOrder($poId);

    if ($po->status === 'completed') {
      throw PurchaseOrderException::poAlreadyCompleted();
    }

    return $this->transaction(function () use ($po) {
      $oldValues = $po->toArray();

      $po->update([
        'status' => 'delivered',
        'actual_delivery_date' => now(),
      ]);

      // Audit: Log PO delivered
      $this->auditLogService->logModelUpdated(
        $po,
        $oldValues,
        "Purchase Order {$po->po_number} delivered"
      );

      $this->logHistory(
        $po->requisition_id,
        'po_delivered',
        'purchase_order',
        $po->id,
        $this->getCurrentUserId(),
        null,
        ['status' => 'delivered'],
        "Purchase Order {$po->po_number} delivered"
      );

      Log::info('[PurchaseOrderService] markPurchaseOrderDelivered - COMPLETED', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
      ]);

      return $po;
    });
  }

  public function completePurchaseOrder(int $poId): PurchaseOrder
  {
    Log::info('[PurchaseOrderService] completePurchaseOrder - START', [
      'po_id' => $poId,
    ]);

    $po = $this->getPurchaseOrder($poId);

    return $this->transaction(function () use ($po) {
      $oldValues = $po->toArray();

      $po->update([
        'status' => 'completed',
        'completed_at' => now(),
      ]);

      // Audit: Log PO completed
      $this->auditLogService->logModelUpdated(
        $po,
        $oldValues,
        "Purchase Order {$po->po_number} completed"
      );

      $this->logHistory(
        $po->requisition_id,
        'po_completed',
        'purchase_order',
        $po->id,
        $this->getCurrentUserId(),
        null,
        ['status' => 'completed'],
        "Purchase Order {$po->po_number} completed"
      );

      Log::info('[PurchaseOrderService] completePurchaseOrder - COMPLETED', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
      ]);

      return $po;
    });
  }

  public function cancelPurchaseOrder(int $poId, string $reason): PurchaseOrder
  {
    Log::info('[PurchaseOrderService] cancelPurchaseOrder - START', [
      'po_id' => $poId,
      'reason' => $reason,
    ]);

    $po = $this->getPurchaseOrder($poId);

    if ($po->status === 'completed') {
      throw PurchaseOrderException::cannotCancelCompleted();
    }

    return $this->transaction(function () use ($po, $reason) {
      $oldValues = $po->toArray();

      $po->update([
        'status' => 'cancelled',
        'cancelled_at' => now(),
        'cancellation_reason' => $reason,
      ]);

      // Audit: Log PO cancellation
      $this->auditLogService->logModelUpdated(
        $po,
        $oldValues,
        "Purchase Order {$po->po_number} cancelled. Reason: {$reason}"
      );

      $this->notificationDispatcher->notify('po_cancelled', [
        'purchase_order_id' => $po->id,
        'po_number' => $po->po_number,
        'supplier_id' => $po->supplier_id,
        'reason' => $reason,
      ]);

      $this->logHistory(
        $po->requisition_id,
        'po_cancelled',
        'purchase_order',
        $po->id,
        $this->getCurrentUserId(),
        null,
        ['cancellation_reason' => $reason],
        "Purchase Order {$po->po_number} cancelled: {$reason}"
      );

      Log::info('[PurchaseOrderService] cancelPurchaseOrder - COMPLETED', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
      ]);

      return $po;
    });
  }

  public function getLpoForRequisition(int $requisitionId): ?PurchaseOrder
  {
    return $this->repository->getLpoForRequisition($requisitionId);
  }

  public function getLsoForRequisition(int $requisitionId): ?PurchaseOrder
  {
    return $this->repository->getLsoForRequisition($requisitionId);
  }

  public function getPurchaseOrderSummary(int $poId): array
  {
    $po = $this->getPurchaseOrder($poId);

    return [
      'purchase_order' => [
        'id' => $po->id,
        'po_number' => $po->po_number,
        'type' => $po->type_label,
        'status' => $po->status_label,
        'total_amount' => $po->formatted_total_amount,
        'issue_date' => $po->issue_date->toDateString(),
        'expected_delivery' => $po->expected_delivery_date->toDateString(),
      ],
      'supplier' => [
        'id' => $po->supplier_id,
        'name' => $po->supplier_name,
        'email' => $po->supplier?->email,
        'phone' => $po->supplier?->phone,
      ],
      'items' => $po->items->map(function ($item) {
        return [
          'id' => $item->id,
          'item_name' => $item->item_name,
          'quantity' => $item->quantity,
          'unit_price' => $item->unit_price,
          'total_price' => $item->total_price,
          'received_quantity' => $item->received_quantity,
          'status' => $item->status_label,
          'is_fully_received' => $item->is_fully_received,
        ];
      }),
      'delivery_progress' => $po->delivery_progress,
      'is_overdue' => $po->is_overdue,
      'approvals' => [
        'generated_by' => $po->generatedBy?->full_name,
        'checked_by' => $po->checkedBy?->full_name,
        'endorsed_by' => $po->endorsedBy?->full_name,
        'approved_by' => $po->approvedBy?->full_name,
      ],
      'timeline' => [
        'generated_at' => $po->created_at->toDateTimeString(),
        'issued_at' => $po->issued_at?->toDateTimeString(),
        'sent_at' => $po->sent_at?->toDateTimeString(),
        'acknowledged_at' => $po->acknowledged_at?->toDateTimeString(),
        'completed_at' => $po->completed_at?->toDateTimeString(),
      ],
    ];
  }

  /**
   * Generate purchase order PDF and return as string
   */
  public function generatePurchaseOrderPdf(int $poId): string
  {
    $po = $this->getPurchaseOrder($poId);
    return $this->pdfGenerator->generatePurchaseOrder($po);
  }

  /**
   * Generate purchase order PDF and return as download response
   */
  public function generatePurchaseOrderPdfResponse(int $poId): Response
  {
    Log::info('[PurchaseOrderService] generatePurchaseOrderPdfResponse - START', [
      'po_id' => $poId,
    ]);

    $po = $this->getPurchaseOrder($poId);
    $po->load(['requisition', 'supplier', 'items']);

    $pdfContent = $this->pdfGenerator->generatePurchaseOrder($po);

    $filename = $this->getPdfFilename($po);

    Log::info('[PurchaseOrderService] generatePurchaseOrderPdfResponse - COMPLETED', [
      'po_id' => $poId,
      'filename' => $filename,
    ]);

    return new Response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => "attachment; filename=\"{$filename}\"",
      'Content-Length' => strlen($pdfContent),
      'X-Generated-At' => now()->toDateTimeString(),
    ]);
  }

  /**
   * Stream purchase order PDF for preview
   */
  public function streamPurchaseOrderPDF(int $poId): Response
  {
    Log::info('[PurchaseOrderService] streamPurchaseOrderPDF - START', [
      'po_id' => $poId,
    ]);

    $po = $this->getPurchaseOrder($poId);
    $po->load(['requisition', 'supplier', 'items']);

    $pdfContent = $this->pdfGenerator->generatePurchaseOrder($po);

    $filename = $this->getPdfFilename($po);

    Log::info('[PurchaseOrderService] streamPurchaseOrderPDF - COMPLETED', [
      'po_id' => $poId,
    ]);

    return new Response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => "inline; filename=\"{$filename}\"",
      'Content-Length' => strlen($pdfContent),
    ]);
  }

  /**
   * Generate PDF filename for purchase order
   */
  protected function getPdfFilename(PurchaseOrder $po): string
  {
    return $po->po_number . '.pdf';
  }

  public function canModifyPurchaseOrder(int $poId): bool
  {
    $po = $this->getPurchaseOrder($poId);
    return in_array($po->status, ['draft', 'issued']);
  }

  public function getDeliveryProgress(int $poId): float
  {
    return $this->repository->updateDeliveryProgress($poId);
  }

  public function getOverduePurchaseOrders(): array
  {
    return $this->repository->getOverduePurchaseOrders();
  }

  public function updatePurchaseOrderItems(int $poId, array $items): PurchaseOrder
  {
    Log::info('[PurchaseOrderService] updatePurchaseOrderItems - START', [
      'po_id' => $poId,
      'items_count' => count($items),
    ]);

    $po = $this->getPurchaseOrder($poId);

    if (!$this->canModifyPurchaseOrder($poId)) {
      throw PurchaseOrderException::poCannotBeModified();
    }

    return $this->transaction(function () use ($po, $items) {
      $oldValues = $po->toArray();

      foreach ($items as $itemData) {
        $item = PurchaseOrderItem::find($itemData['id']);
        if ($item && $item->purchase_order_id === $po->id) {
          $item->update($itemData);
          $item->calculateTotals();
        }
      }

      $po->updateTotalAmount();

      // Audit: Log PO items update
      $this->auditLogService->logModelUpdated(
        $po,
        $oldValues,
        "Purchase Order {$po->po_number} items updated"
      );

      $this->logHistory(
        $po->requisition_id,
        'po_items_updated',
        'purchase_order',
        $po->id,
        $this->getCurrentUserId(),
        null,
        ['item_count' => count($items)],
        "Purchase Order {$po->po_number} items updated"
      );

      Log::info('[PurchaseOrderService] updatePurchaseOrderItems - COMPLETED', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
      ]);

      return $po;
    });
  }

  /**
   * Get all purchase orders with filters and pagination
   */
  public function getPurchaseOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
  {
    Log::info('[PurchaseOrderService] getPurchaseOrders - START', [
      'filters' => $filters,
      'per_page' => $perPage,
    ]);

    $query = PurchaseOrder::with([
      'requisition',
      'supplier',
      'items',
      'checkedBy',
      'endorsedBy',
      'approvedBy'
    ]);

    if (isset($filters['status']) && $filters['status']) {
      $query->where('status', $filters['status']);
    }

    if (isset($filters['type']) && $filters['type']) {
      $query->where('type', $filters['type']);
    }

    if (isset($filters['date_from']) && $filters['date_from']) {
      $query->whereDate('created_at', '>=', $filters['date_from']);
    }

    if (isset($filters['date_to']) && $filters['date_to']) {
      $query->whereDate('created_at', '<=', $filters['date_to']);
    }

    if (isset($filters['search']) && $filters['search']) {
      $search = $filters['search'];
      $query->where(function ($q) use ($search) {
        $q->where('po_number', 'LIKE', "%{$search}%")
          ->orWhereHas('supplier', function ($sq) use ($search) {
            $sq->where('company_name', 'LIKE', "%{$search}%")
              ->orWhere('full_name', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%");
          })
          ->orWhereHas('requisition', function ($rq) use ($search) {
            $rq->where('reference_number', 'LIKE', "%{$search}%")
              ->orWhere('title', 'LIKE', "%{$search}%");
          });
      });
    }

    $result = $query->orderBy('created_at', 'desc')->paginate($perPage);

    $result->getCollection()->transform(function ($po) {
      return $this->enrichPurchaseOrderWithWorkflow($po);
    });

    Log::info('[PurchaseOrderService] getPurchaseOrders - COMPLETED', [
      'total' => $result->total(),
      'current_page' => $result->currentPage(),
      'per_page' => $result->perPage(),
    ]);

    return $result;
  }

  /**
   * Enrich a purchase order with workflow status fields
   */
  protected function enrichPurchaseOrderWithWorkflow(PurchaseOrder $po): PurchaseOrder
  {
    $isChecked = $po->checked_by !== null && $po->checked_at !== null;
    $isEndorsed = $po->endorsed_by !== null && $po->endorsed_at !== null;
    $isApproved = $po->approved_by !== null && $po->approved_at !== null;
    $hasAllSignatures = $isChecked && $isEndorsed && $isApproved;

    $needsCheck = $po->status === 'draft' && !$isChecked;
    $needsEndorsement = $po->status === 'draft' && $isChecked && !$isEndorsed;
    $needsApproval = $po->status === 'draft' && $isChecked && $isEndorsed && !$isApproved;

    $step = 'draft';
    if ($needsCheck) $step = 'check';
    elseif ($needsEndorsement) $step = 'endorse';
    elseif ($needsApproval) $step = 'approve';
    elseif ($hasAllSignatures && $po->status === 'draft') $step = 'ready';
    elseif ($po->status === 'issued') $step = 'issued';
    elseif ($po->status === 'sent') $step = 'sent';
    elseif ($po->status === 'delivered') $step = 'delivered';
    elseif ($po->status === 'completed') $step = 'completed';
    elseif ($po->status === 'cancelled') $step = 'cancelled';

    $po->setAttribute('needs_check', $needsCheck);
    $po->setAttribute('needs_endorsement', $needsEndorsement);
    $po->setAttribute('needs_approval', $needsApproval);
    $po->setAttribute('is_checked', $isChecked);
    $po->setAttribute('is_endorsed', $isEndorsed);
    $po->setAttribute('is_approved', $isApproved);
    $po->setAttribute('workflow_completion', [
      'check' => $isChecked,
      'endorse' => $isEndorsed,
      'approve' => $isApproved,
      'all_complete' => $hasAllSignatures,
      'step' => $step,
    ]);

    $po->setAttribute('checked_by_user', $po->checkedBy?->full_name);
    $po->setAttribute('endorsed_by_user', $po->endorsedBy?->full_name);
    $po->setAttribute('approved_by_user', $po->approvedBy?->full_name);

    return $po;
  }

  /**
   * Log history with proper user ID
   */
  protected function logHistory(
    int $requisitionId,
    string $action,
    string $entityType,
    int $entityId,
    ?int $userId = null,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null
  ): void {
    try {
      \App\Models\ProcurementHistory::create([
        'requisition_id' => $requisitionId,
        'user_id' => $userId ?? $this->getCurrentUserId(),
        'action' => $action,
        'entity_type' => $entityType,
        'entity_id' => $entityId,
        'old_values' => $oldValues,
        'new_values' => $newValues,
        'comment' => $comment,
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);
    } catch (\Exception $e) {
      Log::error('[PurchaseOrderService] Failed to log history', [
        'error' => $e->getMessage(),
        'requisition_id' => $requisitionId,
        'action' => $action,
      ]);
    }
  }

  /**
   * Check purchase order (HOD)
   */
  public function checkPurchaseOrder(int $poId, int $userId, ?string $comment = null): PurchaseOrder
  {
    Log::info('[PurchaseOrderService] checkPurchaseOrder - START', [
      'po_id' => $poId,
      'user_id' => $userId,
    ]);

    $po = $this->getPurchaseOrder($poId);

    $requisition = $po->requisition;
    $user = \App\Models\User::find($userId);

    if (!$user) {
      throw new \Exception('User not found');
    }

    $department = \App\Models\Department::where('hod_id', $userId)->first();

    if (!$department) {
      Log::warning('[PurchaseOrderService] User is not an HOD of any department', [
        'user_id' => $userId,
      ]);
      throw new \Exception('Only HOD can check purchase orders');
    }

    if ($department->id !== $requisition->department_id) {
      Log::warning('[PurchaseOrderService] Department mismatch', [
        'user_id' => $userId,
        'hod_department_id' => $department->id,
        'hod_department_name' => $department->name,
        'requisition_department_id' => $requisition->department_id,
        'requisition_department_name' => $requisition->department?->name,
      ]);
      throw new \Exception('You can only check orders for your department');
    }

    if ($po->generated_by === $userId) {
      throw new \Exception('You cannot check your own purchase order. Another HOD must check it.');
    }

    if ($po->status !== 'draft') {
      throw new \Exception('Purchase order must be in draft status to check.');
    }

    if ($po->checked_by !== null && $po->checked_at !== null) {
      throw new \Exception('This purchase order has already been checked.');
    }

    return $this->transaction(function () use ($po, $userId, $comment) {
      $oldValues = $po->toArray();

      $po->update([
        'checked_by' => $userId,
        'checked_at' => now(),
        'metadata' => array_merge($po->metadata ?? [], [
          'check_comment' => $comment,
          'checked_at' => now()->toIso8601String(),
        ]),
      ]);

      // Audit: Log PO checked
      $checkMessage = "Purchase Order {$po->po_number} checked by user #{$userId}";
      if ($comment) {
        $checkMessage .= ": {$comment}";
      }
      $this->auditLogService->logModelUpdated(
        $po,
        $oldValues,
        $checkMessage
      );

      $this->logHistory(
        $po->requisition_id,
        'po_checked',
        'purchase_order',
        $po->id,
        $userId,
        null,
        ['checked_by' => $userId, 'checked_at' => now()],
        "Purchase Order {$po->po_number} checked" . ($comment ? ": {$comment}" : "")
      );

      $this->notificationDispatcher->notify('po_ready_for_endorsement', [
        'purchase_order_id' => $po->id,
        'po_number' => $po->po_number,
        'requisition_id' => $po->requisition_id,
        'checked_by' => $userId,
        'department' => $po->requisition?->department?->name,
      ]);

      Log::info('[PurchaseOrderService] checkPurchaseOrder - COMPLETED', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
        'checked_by' => $userId,
        'checked_at' => $po->checked_at,
      ]);

      return $po->fresh();
    });
  }

  /**
   * Endorse purchase order (Accountant)
   */
  public function endorsePurchaseOrder(int $poId, int $userId, ?string $comment = null): PurchaseOrder
  {
    Log::info('[PurchaseOrderService] endorsePurchaseOrder - START', [
      'po_id' => $poId,
      'user_id' => $userId,
      'timestamp' => now()->toIso8601String(),
    ]);

    try {
      $po = $this->getPurchaseOrder($poId);

      Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Purchase order retrieved', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'status' => $po->status,
        'checked_by' => $po->checked_by,
        'checked_at' => $po->checked_at,
        'endorsed_by' => $po->endorsed_by,
        'endorsed_at' => $po->endorsed_at,
        'approved_by' => $po->approved_by,
        'approved_at' => $po->approved_at,
      ]);

      $user = \App\Models\User::with('roles')->find($userId);

      if (!$user) {
        Log::error('[PurchaseOrderService] endorsePurchaseOrder - User not found', [
          'user_id' => $userId,
          'po_id' => $poId,
          'po_number' => $po->po_number,
        ]);
        throw new \Exception('User not found');
      }

      Log::debug('[PurchaseOrderService] endorsePurchaseOrder - User found', [
        'user_id' => $user->id,
        'user_email' => $user->email,
        'user_full_name' => $user->full_name ?? $user->name ?? 'Unknown',
      ]);

      Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Checking user role', [
        'user_id' => $user->id,
        'user_email' => $user->email,
        'is_accountant' => $user->isAccountant(),
        'roles' => $user->roles->map(function ($role) {
          return [
            'id' => $role->id,
            'name' => $role->name,
            'label' => $role->label ?? $role->name,
          ];
        })->toArray(),
      ]);

      if (!$user->isAccountant()) {
        Log::warning('[PurchaseOrderService] endorsePurchaseOrder - User is not an Accountant', [
          'user_id' => $user->id,
          'user_email' => $user->email,
          'user_roles' => $user->roles->pluck('name')->toArray(),
          'user_roles_labels' => $user->roles->pluck('label')->toArray(),
          'po_id' => $po->id,
          'po_number' => $po->po_number,
        ]);
        throw new \Exception('Only Accountant can endorse purchase orders');
      }

      Log::info('[PurchaseOrderService] endorsePurchaseOrder - User role validated successfully', [
        'user_id' => $user->id,
        'user_email' => $user->email,
      ]);

      Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Validating PO has been checked', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'checked_by' => $po->checked_by,
        'checked_at' => $po->checked_at,
      ]);

      if (is_null($po->checked_by) || is_null($po->checked_at)) {
        Log::warning('[PurchaseOrderService] endorsePurchaseOrder - PO has not been checked by HOD', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'checked_by' => $po->checked_by,
          'checked_at' => $po->checked_at,
        ]);
        throw new \Exception('Purchase order must be checked by HOD before endorsement.');
      }

      Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Validating PO is not already endorsed', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'endorsed_by' => $po->endorsed_by,
        'endorsed_at' => $po->endorsed_at,
      ]);

      if (!is_null($po->endorsed_by) || !is_null($po->endorsed_at)) {
        Log::warning('[PurchaseOrderService] endorsePurchaseOrder - PO is already endorsed', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'endorsed_by' => $po->endorsed_by,
          'endorsed_at' => $po->endorsed_at,
        ]);
        throw new \Exception('Purchase order has already been endorsed.');
      }

      Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Validating PO is not already approved', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'approved_by' => $po->approved_by,
        'approved_at' => $po->approved_at,
      ]);

      if (!is_null($po->approved_by) || !is_null($po->approved_at)) {
        Log::warning('[PurchaseOrderService] endorsePurchaseOrder - PO is already approved', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'approved_by' => $po->approved_by,
          'approved_at' => $po->approved_at,
        ]);
        throw new \Exception('Purchase order has already been approved.');
      }

      Log::info('[PurchaseOrderService] endorsePurchaseOrder - All validations passed', [
        'po_id' => $po->id,
        'po_number' => $po->po_number,
        'checked_by' => $po->checked_by,
        'checked_at' => $po->checked_at,
      ]);

      $result = $this->transaction(function () use ($po, $userId, $comment) {
        Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Transaction START', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
        ]);

        $oldValues = $po->toArray();

        $po = $this->repository->endorsePurchaseOrder($po->id, $userId, $comment);

        // Audit: Log PO endorsed
        $endorseMessage = "Purchase Order {$po->po_number} endorsed by user #{$userId}";
        if ($comment) {
          $endorseMessage .= ": {$comment}";
        }
        $this->auditLogService->logModelUpdated(
          $po,
          $oldValues,
          $endorseMessage
        );

        Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Repository endorsement completed', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'status' => $po->status,
          'endorsed_by' => $po->endorsed_by,
          'endorsed_at' => $po->endorsed_at,
          'checked_by' => $po->checked_by,
          'checked_at' => $po->checked_at,
        ]);

        Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Logging history', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'requisition_id' => $po->requisition_id,
          'user_id' => $userId,
          'action' => 'po_endorsed',
        ]);

        $this->logHistory(
          $po->requisition_id,
          'po_endorsed',
          'purchase_order',
          $po->id,
          $userId,
          null,
          [
            'endorsed_by' => $userId,
            'endorsed_at' => now()->toIso8601String(),
            'comment' => $comment,
            'status_unchanged' => $po->status,
            'checked_by' => $po->checked_by,
            'checked_at' => $po->checked_at,
          ],
          "Purchase Order {$po->po_number} endorsed by Accountant" . ($comment ? ": {$comment}" : "")
        );

        Log::debug('[PurchaseOrderService] endorsePurchaseOrder - History logged successfully', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
        ]);

        Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Dispatching notification', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'requisition_id' => $po->requisition_id,
          'total_amount' => $po->total_amount,
        ]);

        $this->notificationDispatcher->notify('po_ready_for_approval', [
          'purchase_order_id' => $po->id,
          'po_number' => $po->po_number,
          'requisition_id' => $po->requisition_id,
          'endorsed_by' => $userId,
          'endorsed_by_name' => $po->endorsed_by_user ?? 'Accountant',
          'total_amount' => $po->total_amount,
          'formatted_total' => number_format((float) $po->total_amount, 2),
          'department' => $po->requisition?->department?->name ?? 'Unknown',
          'checked_by' => $po->checked_by_user ?? 'HOD',
          'checked_at' => $po->checked_at,
        ]);

        Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Notification dispatched successfully', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
        ]);

        Log::debug('[PurchaseOrderService] endorsePurchaseOrder - Transaction END', [
          'po_id' => $po->id,
          'po_number' => $po->po_number,
          'final_status' => $po->status,
          'endorsed_by' => $userId,
          'endorsed_at' => $po->endorsed_at,
        ]);

        return $po;
      });

      Log::info('[PurchaseOrderService] endorsePurchaseOrder - COMPLETED', [
        'po_id' => $result->id,
        'po_number' => $result->po_number,
        'status' => $result->status,
        'endorsed_by' => $result->endorsed_by,
        'endorsed_at' => $result->endorsed_at,
        'user_id' => $userId,
        'total_amount' => $result->total_amount,
        'checked_by' => $result->checked_by,
        'checked_at' => $result->checked_at,
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error('[PurchaseOrderService] endorsePurchaseOrder - FAILED', [
        'po_id' => $poId,
        'user_id' => $userId,
        'error_message' => $e->getMessage(),
        'error_code' => $e->getCode(),
        'error_file' => $e->getFile(),
        'error_line' => $e->getLine(),
        'timestamp' => now()->toIso8601String(),
      ]);

      throw $e;
    }
  }

  /**
   * Get workflow status for current user
   */
  public function getWorkflowStatus(int $poId, ?int $userId = null): array
  {
    Log::info('[PurchaseOrderService] getWorkflowStatus - START', [
      'po_id' => $poId,
      'user_id' => $userId,
    ]);

    $po = $this->getPurchaseOrder($poId);
    $workflow = $this->repository->getWorkflowStatus($poId);

    $canCheck = false;
    $canEndorse = false;
    $canApprove = false;
    $canDownload = false;
    $currentStep = 'done';
    $nextAction = null;
    $missingSignature = null;

    if ($userId) {
      $user = \App\Models\User::with('roles')->find($userId);

      if ($user) {
        $canDownload = $po->status === 'pending_approval' ||
          $po->status === 'issued' ||
          $po->status === 'sent' ||
          $po->status === 'acknowledged' ||
          $po->status === 'delivered' ||
          $po->status === 'completed';

        if ($user->hasRole('hod') && $po->status === 'draft') {
          $canCheck = true;
          $currentStep = 'check';
          $nextAction = 'Check this purchase order';
          $missingSignature = 'HOD Check';
        }

        if ($user->hasRole('accountant') && $po->status === 'pending_endorsement') {
          $canEndorse = true;
          $currentStep = 'endorse';
          $nextAction = 'Endorse this purchase order';
          $missingSignature = 'Accountant Endorsement';
        }

        if (($user->isFinalApprover() || $user->hasRole('admin')) &&
          $po->status === 'pending_approval'
        ) {
          $canApprove = true;
          $currentStep = 'approve';
          $nextAction = 'Approve this purchase order';
          $missingSignature = 'Director Approval';
        }
      }
    }

    Log::info('[PurchaseOrderService] getWorkflowStatus - COMPLETED', [
      'po_id' => $poId,
      'can_check' => $canCheck,
      'can_endorse' => $canEndorse,
      'can_approve' => $canApprove,
      'current_step' => $currentStep,
    ]);

    return array_merge($workflow, [
      'can_check' => $canCheck,
      'can_endorse' => $canEndorse,
      'can_approve' => $canApprove,
      'can_download' => $canDownload,
      'current_step' => $currentStep,
      'next_action' => $nextAction,
      'missing_signature' => $missingSignature,
      'is_checkable' => $canCheck,
      'is_endorsable' => $canEndorse,
      'is_approvable' => $canApprove,
    ]);
  }
}
