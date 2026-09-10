<?php
// app/services/analytics/Repositories/RequisitionItemAnalyticsRepository.php

declare(strict_types=1);

namespace App\Services\Analytics\Repositories;

use App\Models\RequisitionItem;
use App\Services\Analytics\Contracts\Repositories\RequisitionItemAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RequisitionItemAnalyticsRepository extends BaseAnalyticsRepository implements RequisitionItemAnalyticsRepositoryInterface
{
    public function getTopItems(int $limit = 10, array $filters = []): Collection
    {
        $query = RequisitionItem::query();
        $this->applyFilters($query, $filters);

        return $query
            ->select(
                'item_name',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_cost) as total_value'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('item_name')
            ->orderBy('total_value', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'item_name' => $item->item_name,
                    'total_quantity' => (float) $item->total_quantity,
                    'total_value' => (float) $item->total_value,
                    'count' => (int) $item->count,
                ];
            });
    }

    public function getQualityInspectionStats(array $filters = []): array
    {
        $query = RequisitionItem::query();
        $this->applyFilters($query, $filters);

        $total = $query->clone()->count();
        $pending = $query->clone()->where('quality_status', 'pending')->count();
        $inspected = $query->clone()->whereIn('quality_status', ['inspected', 'accepted', 'rejected'])->count();
        $accepted = $query->clone()->where('quality_status', 'accepted')->count();
        $rejected = $query->clone()->where('quality_status', 'rejected')->count();

        return [
            'total' => $total,
            'pending' => $pending,
            'inspected' => $inspected,
            'accepted' => $accepted,
            'rejected' => $rejected,
            'pass_rate' => $inspected > 0 ? round(($accepted / $inspected) * 100, 2) : 0,
        ];
    }

    public function getProcurementCompletionRate(array $filters = []): float
    {
        $query = RequisitionItem::query();
        $this->applyFilters($query, $filters);

        $total = $query->clone()->count();
        $procured = $query->clone()->where('is_procured', true)->count();

        return $total > 0 ? round(($procured / $total) * 100, 2) : 0;
    }

    public function getBelowReorderLevel(array $filters = []): Collection
    {
        $query = RequisitionItem::where('is_inventory_item', true)
            ->whereColumn('current_stock', '<=', 'reorder_level');

        $this->applyFilters($query, $filters);

        return $query
            ->select(
                'id',
                'item_name',
                'current_stock',
                'reorder_level',
                DB::raw('reorder_level - current_stock as reorder_quantity')
            )
            ->orderBy('reorder_quantity', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => (int) $item->id,
                    'item_name' => $item->item_name,
                    'current_stock' => (int) $item->current_stock,
                    'reorder_level' => (int) $item->reorder_level,
                    'reorder_quantity' => (int) $item->reorder_quantity,
                ];
            });
    }
}
