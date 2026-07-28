<?php
// app/Services/Requisitions/RequisitionItemService.php

declare(strict_types=1);

namespace App\Services\Requisitions;

use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Exceptions\Requisitions\RequisitionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Requisition Item Service
 *
 * Handles business logic for requisition items
 * No circular dependencies - independent service
 */
class RequisitionItemService
{
  /**
   * Get all items for a requisition
   *
   * @param int $requisitionId
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getByRequisitionId(int $requisitionId)
  {
    return RequisitionItem::where('requisition_id', $requisitionId)
      ->with(['supplier', 'qualityInspector'])
      ->orderBy('created_at')
      ->get();
  }

  /**
   * Get item by ID
   *
   * @param int $id
   * @return RequisitionItem
   * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
   */
  public function getById(int $id): RequisitionItem
  {
    return RequisitionItem::with(['requisition', 'supplier', 'qualityInspector'])
      ->findOrFail($id);
  }

  /**
   * Get item by requisition and item ID
   *
   * @param int $requisitionId
   * @param int $itemId
   * @return RequisitionItem
   * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
   */
  public function getByRequisitionAndItem(int $requisitionId, int $itemId): RequisitionItem
  {
    return RequisitionItem::where('requisition_id', $requisitionId)
      ->where('id', $itemId)
      ->with(['supplier', 'qualityInspector'])
      ->firstOrFail();
  }

  /**
   * Create a new requisition item
   *
   * @param int $requisitionId
   * @param array $data
   * @return RequisitionItem
   * @throws RequisitionException
   */
  public function create(int $requisitionId, array $data): RequisitionItem
  {
    try {
      DB::beginTransaction();

      $requisition = Requisition::findOrFail($requisitionId);

      // Check if requisition can be modified
      if (!$requisition->isEditable) {
        throw new RequisitionException('Cannot add items to a requisition that is not editable');
      }

      // Calculate total cost
      $data['total_cost'] = $data['quantity'] * $data['estimated_unit_cost'];

      // Calculate net amount if tax and discount provided
      if (isset($data['tax_rate']) || isset($data['discount_percentage'])) {
        $total = $data['total_cost'];
        $discount = $total * (($data['discount_percentage'] ?? 0) / 100);
        $tax = ($total - $discount) * (($data['tax_rate'] ?? 0) / 100);
        $data['net_amount'] = $total - $discount + $tax;
      }

      // Set default status
      $data['status'] = $data['status'] ?? 'pending';
      $data['requisition_id'] = $requisitionId;

      // Create item
      $item = RequisitionItem::create($data);

      // Update requisition total
      $requisition->updateTotalAmount();

      // Log activity
      $this->logItemActivity(
        $requisitionId,
        'item_added',
        null,
        $item->toArray(),
        "Item added: {$item->item_name}"
      );

      DB::commit();

      return $item->fresh(['supplier']);
    } catch (RequisitionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to create requisition item: ' . $e->getMessage());
      throw new RequisitionException('Failed to create requisition item: ' . $e->getMessage());
    }
  }

  /**
   * Update requisition item
   *
   * @param int $id
   * @param array $data
   * @return RequisitionItem
   * @throws RequisitionException
   */
  public function update(int $id, array $data): RequisitionItem
  {
    try {
      DB::beginTransaction();

      $item = $this->getById($id);
      $requisition = $item->requisition;

      // Check if requisition can be modified
      if (!$requisition->isEditable) {
        throw new RequisitionException('Cannot update items on a requisition that is not editable');
      }

      $oldData = $item->toArray();

      // Calculate total cost if quantity or unit cost changed
      if (isset($data['quantity']) || isset($data['estimated_unit_cost'])) {
        $quantity = $data['quantity'] ?? $item->quantity;
        $unitCost = $data['estimated_unit_cost'] ?? $item->estimated_unit_cost;
        $data['total_cost'] = $quantity * $unitCost;
      }

      // Calculate net amount if tax or discount changed
      if (isset($data['tax_rate']) || isset($data['discount_percentage']) || isset($data['total_cost'])) {
        $total = $data['total_cost'] ?? $item->total_cost;
        $discount = $total * (($data['discount_percentage'] ?? $item->discount_percentage) / 100);
        $tax = ($total - $discount) * (($data['tax_rate'] ?? $item->tax_rate) / 100);
        $data['net_amount'] = $total - $discount + $tax;
      }

      // Update item
      $item->update($data);

      // Update requisition total
      $requisition->updateTotalAmount();

      // Log activity
      $this->logItemActivity(
        $requisition->id,
        'item_updated',
        $oldData,
        $item->toArray(),
        "Item updated: {$item->item_name}"
      );

      DB::commit();

      return $item->fresh(['supplier']);
    } catch (RequisitionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to update requisition item: ' . $e->getMessage());
      throw new RequisitionException('Failed to update requisition item: ' . $e->getMessage());
    }
  }

  /**
   * Delete requisition item
   *
   * @param int $id
   * @return bool
   * @throws RequisitionException
   */
  public function delete(int $id): bool
  {
    try {
      DB::beginTransaction();

      $item = $this->getById($id);
      $requisition = $item->requisition;

      // Check if requisition can be modified
      if (!$requisition->isEditable) {
        throw new RequisitionException('Cannot delete items from a requisition that is not editable');
      }

      $oldData = $item->toArray();
      $itemName = $item->item_name;

      // Delete item
      $result = $item->delete();

      // Update requisition total
      $requisition->updateTotalAmount();

      // Log activity
      $this->logItemActivity(
        $requisition->id,
        'item_removed',
        $oldData,
        null,
        "Item removed: {$itemName}"
      );

      DB::commit();

      return $result;
    } catch (RequisitionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to delete requisition item: ' . $e->getMessage());
      throw new RequisitionException('Failed to delete requisition item: ' . $e->getMessage());
    }
  }

  /**
   * Bulk create items for a requisition
   *
   * @param int $requisitionId
   * @param array $items
   * @return \Illuminate\Database\Eloquent\Collection
   * @throws RequisitionException
   */
  public function bulkCreate(int $requisitionId, array $items)
  {
    try {
      DB::beginTransaction();

      $requisition = Requisition::findOrFail($requisitionId);

      // Check if requisition can be modified
      if (!$requisition->isEditable) {
        throw new RequisitionException('Cannot add items to a requisition that is not editable');
      }

      $createdItems = [];
      $totalAmount = 0;

      foreach ($items as $itemData) {
        // Calculate total cost
        $itemData['total_cost'] = $itemData['quantity'] * $itemData['estimated_unit_cost'];
        $itemData['requisition_id'] = $requisitionId;
        $itemData['status'] = $itemData['status'] ?? 'pending';

        $item = RequisitionItem::create($itemData);
        $createdItems[] = $item;
        $totalAmount += $item->total_cost;
      }

      // Update requisition total
      $requisition->update(['total_amount' => $totalAmount]);

      // Log activity
      $this->logItemActivity(
        $requisitionId,
        'items_bulk_added',
        null,
        ['count' => count($createdItems)],
        count($createdItems) . ' items added'
      );

      DB::commit();

      return collect($createdItems);
    } catch (RequisitionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to bulk create requisition items: ' . $e->getMessage());
      throw new RequisitionException('Failed to bulk create requisition items: ' . $e->getMessage());
    }
  }

  /**
   * Update item quantities for receiving
   *
   * @param int $id
   * @param float $receivedQuantity
   * @param string|null $receiptNumber
   * @return RequisitionItem
   * @throws RequisitionException
   */
  public function receiveItem(int $id, float $receivedQuantity, ?string $receiptNumber = null): RequisitionItem
  {
    try {
      DB::beginTransaction();

      $item = $this->getById($id);
      $requisition = $item->requisition;

      // Check if item can be received
      if ($item->isFullyReceived()) {
        throw new RequisitionException('Item is already fully received');
      }

      $oldData = $item->toArray();

      // Update received quantity
      $newReceived = $item->received_quantity + $receivedQuantity;
      $item->update([
        'received_quantity' => $newReceived,
        'delivery_receipt_number' => $receiptNumber ?? $item->delivery_receipt_number,
        'is_delivered' => true,
        'delivery_receipt_date' => now(),
      ]);

      // Check if fully received
      if ($item->isFullyReceived()) {
        $item->update([
          'status' => 'received',
          'fully_received_at' => now(),
        ]);
      }

      // Log activity
      $this->logItemActivity(
        $requisition->id,
        'item_received',
        $oldData,
        $item->toArray(),
        "Received {$receivedQuantity} {$item->unit_of_measure} of {$item->item_name}"
      );

      DB::commit();

      return $item->fresh();
    } catch (RequisitionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to receive requisition item: ' . $e->getMessage());
      throw new RequisitionException('Failed to receive requisition item: ' . $e->getMessage());
    }
  }

  /**
   * Update quality inspection status
   *
   * @param int $id
   * @param string $status
   * @param string|null $notes
   * @return RequisitionItem
   * @throws RequisitionException
   */
  public function updateQualityStatus(int $id, string $status, ?string $notes = null): RequisitionItem
  {
    try {
      DB::beginTransaction();

      $item = $this->getById($id);
      $requisition = $item->requisition;

      $oldData = $item->toArray();

      $item->update([
        'quality_status' => $status,
        'quality_notes' => $notes,
        'quality_inspected_at' => now(),
        'quality_inspected_by' => Auth::id(),
      ]);

      // Log activity
      $this->logItemActivity(
        $requisition->id,
        'quality_status_updated',
        $oldData,
        $item->toArray(),
        "Quality status updated to: {$status}"
      );

      DB::commit();

      return $item->fresh();
    } catch (RequisitionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to update quality status: ' . $e->getMessage());
      throw new RequisitionException('Failed to update quality status: ' . $e->getMessage());
    }
  }

  /**
   * Update item procurement status
   *
   * @param int $id
   * @param array $data
   * @return RequisitionItem
   * @throws RequisitionException
   */
  public function updateProcurementStatus(int $id, array $data): RequisitionItem
  {
    try {
      DB::beginTransaction();

      $item = $this->getById($id);
      $requisition = $item->requisition;

      $oldData = $item->toArray();

      $updateData = [
        'is_procured' => $data['is_procured'] ?? true,
        'procured_at' => now(),
      ];

      if (isset($data['actual_unit_cost'])) {
        $updateData['actual_unit_cost'] = $data['actual_unit_cost'];
        $updateData['actual_total_cost'] = $data['actual_unit_cost'] * $item->quantity;
      }

      if (isset($data['supplier_id'])) {
        $updateData['supplier_id'] = $data['supplier_id'];
      }

      if (isset($data['status'])) {
        $updateData['status'] = $data['status'];
      }

      $item->update($updateData);

      // Log activity
      $this->logItemActivity(
        $requisition->id,
        'item_procured',
        $oldData,
        $item->toArray(),
        "Item marked as procured"
      );

      DB::commit();

      return $item->fresh();
    } catch (RequisitionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to update procurement status: ' . $e->getMessage());
      throw new RequisitionException('Failed to update procurement status: ' . $e->getMessage());
    }
  }

  /**
   * Update delivery information
   *
   * @param int $id
   * @param array $data
   * @return RequisitionItem
   * @throws RequisitionException
   */
  public function updateDelivery(int $id, array $data): RequisitionItem
  {
    try {
      DB::beginTransaction();

      $item = $this->getById($id);
      $requisition = $item->requisition;

      $oldData = $item->toArray();

      $updateData = [];

      if (isset($data['expected_delivery_date'])) {
        $updateData['expected_delivery_date'] = $data['expected_delivery_date'];
      }

      if (isset($data['actual_delivery_date'])) {
        $updateData['actual_delivery_date'] = $data['actual_delivery_date'];
        $updateData['is_delivered'] = true;
      }

      if (isset($data['delivery_address'])) {
        $updateData['delivery_address'] = $data['delivery_address'];
      }

      if (isset($data['delivery_contact_person'])) {
        $updateData['delivery_contact_person'] = $data['delivery_contact_person'];
      }

      if (isset($data['delivery_contact_phone'])) {
        $updateData['delivery_contact_phone'] = $data['delivery_contact_phone'];
      }

      if (isset($data['delivery_receipt_number'])) {
        $updateData['delivery_receipt_number'] = $data['delivery_receipt_number'];
      }

      if (isset($data['status'])) {
        $updateData['status'] = $data['status'];
      }

      $item->update($updateData);

      // Log activity
      $this->logItemActivity(
        $requisition->id,
        'delivery_updated',
        $oldData,
        $item->toArray(),
        "Delivery information updated"
      );

      DB::commit();

      return $item->fresh();
    } catch (RequisitionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to update delivery information: ' . $e->getMessage());
      throw new RequisitionException('Failed to update delivery information: ' . $e->getMessage());
    }
  }

  /**
   * Update warranty information
   *
   * @param int $id
   * @param array $data
   * @return RequisitionItem
   * @throws RequisitionException
   */
  public function updateWarranty(int $id, array $data): RequisitionItem
  {
    try {
      DB::beginTransaction();

      $item = $this->getById($id);
      $requisition = $item->requisition;

      $oldData = $item->toArray();

      $updateData = [];

      if (isset($data['warranty_period_months'])) {
        $updateData['warranty_period_months'] = $data['warranty_period_months'];
      }

      if (isset($data['warranty_start_date'])) {
        $updateData['warranty_start_date'] = $data['warranty_start_date'];
        // Auto-calculate end date if period is set
        if (isset($data['warranty_period_months']) || $item->warranty_period_months) {
          $period = $data['warranty_period_months'] ?? $item->warranty_period_months;
          $updateData['warranty_end_date'] = date('Y-m-d', strtotime($data['warranty_start_date'] . " + {$period} months"));
        }
      }

      if (isset($data['warranty_terms'])) {
        $updateData['warranty_terms'] = $data['warranty_terms'];
      }

      $item->update($updateData);

      // Log activity
      $this->logItemActivity(
        $requisition->id,
        'warranty_updated',
        $oldData,
        $item->toArray(),
        "Warranty information updated"
      );

      DB::commit();

      return $item->fresh();
    } catch (RequisitionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to update warranty information: ' . $e->getMessage());
      throw new RequisitionException('Failed to update warranty information: ' . $e->getMessage());
    }
  }

  /**
   * Log item activity
   *
   * @param int $requisitionId
   * @param string $action
   * @param array|null $oldValues
   * @param array|null $newValues
   * @param string|null $comment
   * @return void
   */
  protected function logItemActivity(
    int $requisitionId,
    string $action,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null
  ): void {
    try {
      $historyService = app(RequisitionHistoryService::class);
      $historyService->log(
        $requisitionId,
        $action,
        $oldValues,
        $newValues,
        $comment
      );
    } catch (\Exception $e) {
      Log::warning('Failed to log item activity: ' . $e->getMessage());
    }
  }

  /**
   * Get items statistics for a requisition
   *
   * @param int $requisitionId
   * @return array
   */
  public function getStats(int $requisitionId): array
  {
    $items = RequisitionItem::where('requisition_id', $requisitionId)->get();

    return [
      'total_items' => $items->count(),
      'total_quantity' => (float) $items->sum('quantity'),
      'total_cost' => (float) $items->sum('total_cost'),
      'total_received' => (float) $items->sum('received_quantity'),
      'total_delivered' => $items->where('is_delivered', true)->count(),
      'pending_items' => $items->where('status', 'pending')->count(),
      'approved_items' => $items->where('status', 'approved')->count(),
      'procured_items' => $items->where('status', 'procured')->count(),
      'delivered_items' => $items->where('status', 'delivered')->count(),
      'received_items' => $items->where('status', 'received')->count(),
      'cancelled_items' => $items->where('status', 'cancelled')->count(),
      'inventory_items' => $items->where('is_inventory_item', true)->count(),
      'by_unit_of_measure' => $items->groupBy('unit_of_measure')
        ->map(function ($group) {
          return [
            'count' => $group->count(),
            'total_quantity' => (float) $group->sum('quantity'),
          ];
        })->toArray(),
    ];
  }

  /**
   * Get items below reorder level
   *
   * @param int $requisitionId
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getItemsBelowReorderLevel(int $requisitionId)
  {
    return RequisitionItem::where('requisition_id', $requisitionId)
      ->where('is_inventory_item', true)
      ->whereColumn('current_stock', '<=', 'reorder_level')
      ->get();
  }

  /**
   * Check if item exists in requisition
   *
   * @param int $requisitionId
   * @param int $itemId
   * @return bool
   */
  public function existsInRequisition(int $requisitionId, int $itemId): bool
  {
    return RequisitionItem::where('requisition_id', $requisitionId)
      ->where('id', $itemId)
      ->exists();
  }

  /**
   * Get items by supplier
   *
   * @param int $supplierId
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getBySupplier(int $supplierId)
  {
    return RequisitionItem::where('supplier_id', $supplierId)
      ->with(['requisition'])
      ->orderBy('created_at', 'desc')
      ->get();
  }

  /**
   * Get items by status
   *
   * @param string $status
   * @param int|null $requisitionId
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getByStatus(string $status, ?int $requisitionId = null)
  {
    $query = RequisitionItem::where('status', $status);

    if ($requisitionId) {
      $query->where('requisition_id', $requisitionId);
    }

    return $query->with(['requisition', 'supplier'])->get();
  }

  /**
   * Update item stock
   *
   * @param int $id
   * @param int $quantity
   * @return RequisitionItem
   * @throws RequisitionException
   */
  public function updateStock(int $id, int $quantity): RequisitionItem
  {
    try {
      DB::beginTransaction();

      $item = $this->getById($id);

      if (!$item->is_inventory_item) {
        throw new RequisitionException('Item is not an inventory item');
      }

      $oldData = $item->toArray();

      $item->update([
        'current_stock' => $quantity,
      ]);

      // Log activity
      $this->logItemActivity(
        $item->requisition_id,
        'stock_updated',
        $oldData,
        $item->toArray(),
        "Stock updated to: {$quantity}"
      );

      DB::commit();

      return $item->fresh();
    } catch (RequisitionException $e) {
      DB::rollBack();
      throw $e;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Failed to update stock: ' . $e->getMessage());
      throw new RequisitionException('Failed to update stock: ' . $e->getMessage());
    }
  }
}
