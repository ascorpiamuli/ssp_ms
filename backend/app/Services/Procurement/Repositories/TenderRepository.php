<?php
// app/Services/Procurement/Repositories/TenderRepository.php

declare(strict_types=1);

namespace App\Services\Procurement\Repositories;

use App\Models\Tender;
use App\Services\Procurement\Contracts\Repositories\TenderRepositoryInterface;
use App\Services\Procurement\Repositories\BaseRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class TenderRepository extends BaseRepository implements TenderRepositoryInterface
{
  public function __construct()
  {
    parent::__construct(new Tender());
  }

  public function findTender(int $id): ?Tender
  {
    return Tender::with([
      'requisition',
      'publishedBy',
      'awardedTo',
      'cancelledBy'
    ])->find($id);
  }

  public function findTenderOrFail(int $id): Tender
  {
    return Tender::with([
      'requisition',
      'publishedBy',
      'awardedTo',
      'cancelledBy'
    ])->findOrFail($id);
  }

  public function getTenderForRequisition(int $requisitionId): ?Tender
  {
    return Tender::where('requisition_id', $requisitionId)
      ->whereNotIn('status', ['cancelled', 'expired'])
      ->first();
  }

  public function getTenderByNumber(string $tenderNumber): ?Tender
  {
    return Tender::where('tender_number', $tenderNumber)->first();
  }

  public function createTender(array $data): Tender
  {
    return Tender::create($data);
  }

  public function updateTender(int $id, array $data): Tender
  {
    $tender = $this->findTenderOrFail($id);
    $tender->update($data);
    return $tender;
  }

  public function getDraftTenders(): array
  {
    return Tender::where('status', 'draft')
      ->with(['requisition'])
      ->orderBy('created_at')
      ->get()
      ->toArray();
  }

  public function getPublishedTenders(): array
  {
    return Tender::where('status', 'published')
      ->with(['requisition'])
      ->orderBy('closing_date')
      ->get()
      ->toArray();
  }

  public function getEvaluatingTenders(): array
  {
    return Tender::where('status', 'evaluating')
      ->with(['requisition'])
      ->orderBy('closing_date')
      ->get()
      ->toArray();
  }

  public function getAwardedTenders(): array
  {
    return Tender::where('status', 'awarded')
      ->with(['requisition', 'awardedTo'])
      ->orderBy('awarded_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getCancelledTenders(): array
  {
    return Tender::where('status', 'cancelled')
      ->with(['requisition'])
      ->orderBy('cancelled_at', 'desc')
      ->get()
      ->toArray();
  }

  public function getOpenTenders(): array
  {
    return Tender::where('status', 'published')
      ->whereDate('closing_date', '>=', now())
      ->with(['requisition'])
      ->orderBy('closing_date')
      ->get()
      ->toArray();
  }

  public function getTendersClosingSoon(int $days = 7): array
  {
    return Tender::where('status', 'published')
      ->whereDate('closing_date', '<=', now()->addDays($days))
      ->whereDate('closing_date', '>=', now())
      ->with(['requisition'])
      ->orderBy('closing_date')
      ->get()
      ->toArray();
  }

  public function getExpiredTenders(): array
  {
    return Tender::where('status', 'expired')
      ->orWhere(function ($query) {
        $query->where('status', 'published')
          ->whereDate('closing_date', '<', now());
      })
      ->with(['requisition'])
      ->orderBy('closing_date')
      ->get()
      ->toArray();
  }

  public function paginateTenders(int $perPage = 15): LengthAwarePaginator
  {
    return Tender::with(['requisition', 'awardedTo'])
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  public function getTenderStatistics(): array
  {
    return [
      'total' => Tender::count(),
      'draft' => Tender::where('status', 'draft')->count(),
      'published' => Tender::where('status', 'published')->count(),
      'evaluating' => Tender::where('status', 'evaluating')->count(),
      'awarded' => Tender::where('status', 'awarded')->count(),
      'cancelled' => Tender::where('status', 'cancelled')->count(),
      'expired' => Tender::where('status', 'expired')->count(),
      'total_bidders' => $this->getTotalBiddersCount(),
      'total_awarded_amount' => Tender::where('status', 'awarded')->sum('awarded_amount'),
    ];
  }

  public function getTendersByBidder(int $supplierId): array
  {
    return Tender::whereJsonContains('bidders', $supplierId)
      ->with(['requisition'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }

  public function addBidderToTender(int $tenderId, int $supplierId): Tender
  {
    $tender = $this->findTenderOrFail($tenderId);
    $bidders = $tender->bidders ?? [];
    if (!in_array($supplierId, $bidders)) {
      $bidders[] = $supplierId;
      $tender->update(['bidders' => $bidders]);
    }
    return $tender;
  }

  public function removeBidderFromTender(int $tenderId, int $supplierId): Tender
  {
    $tender = $this->findTenderOrFail($tenderId);
    $bidders = $tender->bidders ?? [];
    $bidders = array_filter($bidders, function ($id) use ($supplierId) {
      return $id !== $supplierId;
    });
    $tender->update(['bidders' => array_values($bidders)]);
    return $tender;
  }

  public function getBiddersForTender(int $tenderId): array
  {
    $tender = $this->findTender($tenderId);
    if (!$tender) {
      return [];
    }
    return $tender->bidders ?? [];
  }

  public function deleteTender(int $id): bool
  {
    $tender = $this->findTender($id);
    if (!$tender) {
      return false;
    }
    return $tender->delete();
  }

  protected function getTotalBiddersCount(): int
  {
    $tenders = Tender::whereNotNull('bidders')->get();
    $total = 0;
    foreach ($tenders as $tender) {
      $total += count($tender->bidders ?? []);
    }
    return $total;
  }
  public function getTendersByStatus(string $status): array
  {
    return Tender::where('status', $status)
      ->with(['requisition', 'awardedTo'])
      ->orderBy('created_at', 'desc')
      ->get()
      ->toArray();
  }
}
