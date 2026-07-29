<?php
// app/Services/Procurement/Repositories/GoodsReceivedRepository.php

declare(strict_types=1);

namespace App\Services\Procurement\Repositories;

use App\Models\GoodsReceivedNote;
use App\Models\GoodsReceivedItem;
use App\Models\ServiceAcknowledgmentNote;
use App\Services\Procurement\Contracts\Repositories\GoodsReceivedRepositoryInterface;
use App\Services\Procurement\Repositories\BaseRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class GoodsReceivedRepository extends BaseRepository implements GoodsReceivedRepositoryInterface
{
  public function __construct()
  {
    parent::__construct(new GoodsReceivedNote());
  }

  public function findGrn(int $id): ?GoodsReceivedNote
  {
    return GoodsReceivedNote::with([
      'requisition',
      'purchaseOrder',
      'receivedBy',
      'inspectedBy',
      'hodApprovedBy',
      'principalApprovedBy',
      'items'
    ])->find($id);
  }

  public function findGrnOrFail(int $id): GoodsReceivedNote
  {
    return GoodsReceivedNote::with([
      'requisition',
      'purchaseOrder',
      'receivedBy',
      'inspectedBy',
      'hodApprovedBy',
      'principalApprovedBy',
      'items'
    ])->findOrFail($id);
  }

  public function findSan(int $id): ?ServiceAcknowledgmentNote
  {
    return ServiceAcknowledgmentNote::with([
      'requisition',
      'purchaseOrder',
      'acknowledgedBy',
      'hodApprovedBy',
      'principalApprovedBy'
    ])->find($id);
  }

  public function findSanOrFail(int $id): ServiceAcknowledgmentNote
  {
    return ServiceAcknowledgmentNote::with([
      'requisition',
      'purchaseOrder',
      'acknowledgedBy',
      'hodApprovedBy',
      'principalApprovedBy'
    ])->findOrFail($id);
  }

  public function getGrnsForPurchaseOrder(int $purchaseOrderId): array
  {
    return GoodsReceivedNote::where('purchase_order_id', $purchaseOrderId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getSansForPurchaseOrder(int $purchaseOrderId): array
  {
    return ServiceAcknowledgmentNote::where('purchase_order_id', $purchaseOrderId)
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function createGrn(array $data): GoodsReceivedNote
  {
    return GoodsReceivedNote::create($data);
  }

  public function createGrnItem(array $data): GoodsReceivedItem
  {
    return GoodsReceivedItem::create($data);
  }

  public function createSan(array $data): ServiceAcknowledgmentNote
  {
    return ServiceAcknowledgmentNote::create($data);
  }

  public function updateGrn(int $id, array $data): GoodsReceivedNote
  {
    $grn = $this->findGrnOrFail($id);
    $grn->update($data);
    return $grn;
  }

  public function updateSan(int $id, array $data): ServiceAcknowledgmentNote
  {
    $san = $this->findSanOrFail($id);
    $san->update($data);
    return $san;
  }

  public function getPendingApprovalGrns(): array
  {
    return GoodsReceivedNote::where('status', 'submitted')
      ->with(['requisition', 'purchaseOrder', 'receivedBy'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function getPendingApprovalSans(): array
  {
    return ServiceAcknowledgmentNote::where('status', 'submitted')
      ->with(['requisition', 'purchaseOrder', 'acknowledgedBy'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function getCompletedGrns(): array
  {
    return GoodsReceivedNote::where('status', 'completed')
      ->with(['requisition', 'purchaseOrder'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getCompletedSans(): array
  {
    return ServiceAcknowledgmentNote::where('status', 'completed')
      ->with(['requisition', 'purchaseOrder'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function paginateGrns(int $perPage = 15): LengthAwarePaginator
  {
    return GoodsReceivedNote::with(['requisition', 'purchaseOrder', 'receivedBy'])
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  public function paginateSans(int $perPage = 15): LengthAwarePaginator
  {
    return ServiceAcknowledgmentNote::with(['requisition', 'purchaseOrder', 'acknowledgedBy'])
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  public function getGrnByNumber(string $grnNumber): ?GoodsReceivedNote
  {
    return GoodsReceivedNote::where('grn_number', $grnNumber)->first();
  }

  public function getSanByNumber(string $sanNumber): ?ServiceAcknowledgmentNote
  {
    return ServiceAcknowledgmentNote::where('san_number', $sanNumber)->first();
  }

  public function getGrnItems(int $grnId): array
  {
    return GoodsReceivedItem::where('goods_received_note_id', $grnId)
      ->get()
      ->toArray();
  }

  public function getGrnsByStatus(string $status): array
  {
    return GoodsReceivedNote::where('status', $status)
      ->with(['requisition', 'purchaseOrder'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getSansByStatus(string $status): array
  {
    return ServiceAcknowledgmentNote::where('status', $status)
      ->with(['requisition', 'purchaseOrder'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function updateGrnItem(int $id, array $data): GoodsReceivedItem
  {
    $item = GoodsReceivedItem::findOrFail($id);
    $item->update($data);
    return $item;
  }

  public function deleteGrnItem(int $id): bool
  {
    $item = GoodsReceivedItem::find($id);
    if (!$item) {
      return false;
    }
    return $item->delete();
  }
}
