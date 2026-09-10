<?php
// app/services/analytics/repositories/SupplierAnalyticsRepository.php

declare(strict_types=1);

namespace App\Services\Analytics\Repositories;

use App\Models\Supplier;
use App\Models\SupplierQuotation;
use App\Models\PurchaseOrder;
use App\Models\GoodsReceivedNote;
use App\Models\Invoice;
use App\Services\Analytics\Contracts\Repositories\SupplierAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class SupplierAnalyticsRepository extends BaseAnalyticsRepository implements SupplierAnalyticsRepositoryInterface
{
  public function getDashboardSummary(array $filters = []): array
  {
    $query = Supplier::query();
    $this->applyFilters($query, $filters);

    return [
      'total' => $query->count(),
      'active' => $query->clone()->where('status', 'ACTIVE')->count(),
      'blacklisted' => $query->clone()->where('status', 'BLACKLISTED')->count(),
      'inactive' => $query->clone()->where('status', 'INACTIVE')->count(),
    ];
  }

  public function getTrends(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    $query = Supplier::query();
    $this->applyFilters($query, $filters);
    $this->groupByInterval($query, 'created_at', $interval);

    switch ($metric) {
      case 'registration':
        $query->selectRaw('COUNT(*) as value');
        break;
      case 'active':
        $query->where('status', 'ACTIVE')->selectRaw('COUNT(*) as value');
        break;
      default:
        $query->selectRaw('COUNT(*) as value');
    }

    $query->orderBy('period', 'asc');

    return $query->get()->map(function ($row) {
      return [
        'period' => $row->period,
        'value' => (float) $row->value,
      ];
    });
  }

  public function getVolumeStats(array $filters = []): array
  {
    $query = Supplier::query();
    $this->applyFilters($query, $filters);

    $dateRange = $this->getDateRange(
      $filters['start_date'] ?? null,
      $filters['end_date'] ?? null
    );

    return [
      'total' => $query->clone()->count(),
      'active' => $query->clone()->where('status', 'ACTIVE')->count(),
      'blacklisted' => $query->clone()->where('status', 'BLACKLISTED')->count(),
      'inactive' => $query->clone()->where('status', 'INACTIVE')->count(),
      'new_this_period' => $query->clone()
        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
        ->count(),
    ];
  }

  public function getByCategory(array $filters = []): Collection
  {
    return Supplier::query()
      ->select('category', DB::raw('COUNT(*) as count'))
      ->groupBy('category')
      ->get()
      ->map(function ($item) {
        return [
          'category' => $item->category,
          'label' => $item->category_label ?? $item->category,
          'count' => (int) $item->count,
        ];
      });
  }

  public function getByStatus(array $filters = []): Collection
  {
    return Supplier::query()
      ->select('status', DB::raw('COUNT(*) as count'))
      ->groupBy('status')
      ->get()
      ->map(function ($item) {
        return [
          'status' => $item->status,
          'label' => $item->status_label,
          'color' => $item->status_color,
          'count' => (int) $item->count,
        ];
      });
  }

  /**
   * ✅ FIXED: Get quotation response rate with proper relationship handling
   */
  public function getQuotationResponseRate(array $filters = []): Collection
  {
    return Supplier::query()
      // ✅ FIX: Use 'quotations' relationship instead of 'supplierQuotations'
      ->withCount(['quotations as total_quotations'])
      ->withCount(['quotations as submitted_quotations' => function ($q) {
        $q->whereIn('status', ['submitted', 'evaluated', 'accepted', 'rejected']);
      }])
      ->when(isset($filters['category']), function ($q) use ($filters) {
        $q->where('category', $filters['category']);
      })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereHas('quotations', function ($q2) use ($filters) {
          $q2->whereBetween('created_at', [
            Carbon::parse($filters['start_date'])->startOfDay(),
            Carbon::parse($filters['end_date'])->endOfDay()
          ]);
        });
      })
      ->get()
      ->map(function ($supplier) {
        $total = (int) $supplier->total_quotations;
        $submitted = (int) $supplier->submitted_quotations;
        return [
          'supplier_id' => $supplier->id,
          'supplier_name' => $supplier->company_name ?? $supplier->full_name ?? 'Unknown',
          'total_quotations' => $total,
          'submitted' => $submitted,
          'response_rate' => $this->calculatePercentage($submitted, $total),
        ];
      });
  }

  public function getPerformanceScore(int $supplierId, array $filters = []): array
  {
    // Get supplier performance metrics
    $supplier = Supplier::find($supplierId);
    if (!$supplier) {
      return [];
    }

    // Delivery performance
    $deliveryData = PurchaseOrder::where('supplier_id', $supplierId)
      ->whereNotNull('actual_delivery_date')
      ->whereNotNull('expected_delivery_date')
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(CASE WHEN actual_delivery_date <= expected_delivery_date THEN 1 ELSE 0 END) as on_time')
      )
      ->first();

    // Quality performance (GRN acceptance)
    $qualityData = GoodsReceivedNote::whereHas('purchaseOrder', function ($q) use ($supplierId) {
      $q->where('supplier_id', $supplierId);
    })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(CASE WHEN inspection_result = "passed" THEN 1 ELSE 0 END) as passed')
      )
      ->first();

    // Quotation acceptance rate
    $quotationData = SupplierQuotation::where('supplier_id', $supplierId)
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(CASE WHEN status = "accepted" THEN 1 ELSE 0 END) as accepted')
      )
      ->first();

    $deliveryTotal = (int) ($deliveryData->total ?? 0);
    $deliveryOnTime = (int) ($deliveryData->on_time ?? 0);
    $qualityTotal = (int) ($qualityData->total ?? 0);
    $qualityPassed = (int) ($qualityData->passed ?? 0);
    $quotationTotal = (int) ($quotationData->total ?? 0);
    $quotationAccepted = (int) ($quotationData->accepted ?? 0);

    return [
      'supplier_id' => $supplierId,
      'supplier_name' => $supplier->company_name ?? $supplier->full_name ?? 'Unknown',
      'overall_score' => $this->calculateOverallScore([
        'delivery' => $this->calculatePercentage($deliveryOnTime, $deliveryTotal),
        'quality' => $this->calculatePercentage($qualityPassed, $qualityTotal),
        'quotation' => $this->calculatePercentage($quotationAccepted, $quotationTotal),
      ]),
      'metrics' => [
        'delivery' => [
          'total' => $deliveryTotal,
          'on_time' => $deliveryOnTime,
          'rate' => $this->calculatePercentage($deliveryOnTime, $deliveryTotal),
        ],
        'quality' => [
          'total' => $qualityTotal,
          'passed' => $qualityPassed,
          'rate' => $this->calculatePercentage($qualityPassed, $qualityTotal),
        ],
        'quotation' => [
          'total' => $quotationTotal,
          'accepted' => $quotationAccepted,
          'rate' => $this->calculatePercentage($quotationAccepted, $quotationTotal),
        ],
      ],
    ];
  }

  protected function calculateOverallScore(array $scores): float
  {
    $total = 0;
    $count = 0;

    foreach ($scores as $score) {
      if ($score >= 0) {
        $total += $score;
        $count++;
      }
    }

    return $count > 0 ? round($total / $count, 2) : 0;
  }

  public function getTopBySpend(int $limit = 10, array $filters = []): Collection
  {
    // ✅ Ensure limit is valid
    $limit = max(1, min(100, $limit));

    return PurchaseOrder::query()
      ->with('supplier')
      ->whereNotNull('total_amount')
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->when(isset($filters['supplier_id']), function ($q) use ($filters) {
        $q->where('supplier_id', $filters['supplier_id']);
      })
      ->select(
        'supplier_id',
        DB::raw('COUNT(*) as order_count'),
        DB::raw('SUM(total_amount) as total_spent')
      )
      ->groupBy('supplier_id')
      ->orderBy('total_spent', 'desc')
      ->limit($limit)
      ->get()
      ->map(function ($item) {
        return [
          'supplier_id' => $item->supplier_id,
          'supplier_name' => $item->supplier?->company_name ?? $item->supplier?->full_name ?? 'Unknown',
          'order_count' => (int) $item->order_count,
          'total_spent' => (float) $item->total_spent,
        ];
      });
  }

  public function getDeliveryPerformance(array $filters = []): Collection
  {
    return PurchaseOrder::query()
      ->with('supplier')
      ->whereNotNull('actual_delivery_date')
      ->whereNotNull('expected_delivery_date')
      ->when(isset($filters['supplier_id']), function ($q) use ($filters) {
        $q->where('supplier_id', $filters['supplier_id']);
      })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        'supplier_id',
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(CASE WHEN actual_delivery_date <= expected_delivery_date THEN 1 ELSE 0 END) as on_time'),
        DB::raw('AVG(DATEDIFF(actual_delivery_date, expected_delivery_date)) as avg_delay_days')
      )
      ->groupBy('supplier_id')
      ->get()
      ->map(function ($item) {
        $total = (int) $item->total;
        $onTime = (int) $item->on_time;
        return [
          'supplier_id' => $item->supplier_id,
          'supplier_name' => $item->supplier?->company_name ?? $item->supplier?->full_name ?? 'Unknown',
          'total' => $total,
          'on_time' => $onTime,
          'on_time_rate' => $this->calculatePercentage($onTime, $total),
          'avg_delay_days' => round((float) ($item->avg_delay_days ?? 0), 2),
        ];
      });
  }

  /**
   * ✅ FIXED: Get quality ratings with correct column references
   */
  public function getQualityRatings(array $filters = []): Collection
  {
    return GoodsReceivedNote::query()
      ->with('purchaseOrder.supplier')
      ->whereNotNull('inspection_result')
      ->when(isset($filters['supplier_id']), function ($q) use ($filters) {
        $q->whereHas('purchaseOrder', function ($q2) use ($filters) {
          $q2->where('supplier_id', $filters['supplier_id']);
        });
      })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('goods_received_notes.created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      // ✅ FIX: Use correct table alias 'purchase_orders' (plural)
      ->join('purchase_orders', 'goods_received_notes.purchase_order_id', '=', 'purchase_orders.id')
      ->select(
        'purchase_orders.supplier_id',
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(CASE WHEN goods_received_notes.inspection_result = "passed" THEN 1 ELSE 0 END) as passed'),
        DB::raw('SUM(CASE WHEN goods_received_notes.inspection_result = "failed" THEN 1 ELSE 0 END) as failed'),
        DB::raw('SUM(CASE WHEN goods_received_notes.inspection_result = "partial" THEN 1 ELSE 0 END) as partial')
      )
      ->groupBy('purchase_orders.supplier_id')
      ->get()
      ->map(function ($item) {
        $total = (int) $item->total;
        $passed = (int) $item->passed;
        return [
          'supplier_id' => $item->supplier_id,
          'supplier_name' => Supplier::find($item->supplier_id)?->company_name
            ?? Supplier::find($item->supplier_id)?->full_name
            ?? 'Unknown',
          'total' => $total,
          'passed' => $passed,
          'failed' => (int) $item->failed,
          'partial' => (int) $item->partial,
          'pass_rate' => $this->calculatePercentage($passed, $total),
        ];
      });
  }

  public function getQuotationAcceptanceRate(array $filters = []): Collection
  {
    return SupplierQuotation::query()
      ->with('supplier')
      ->when(isset($filters['supplier_id']), function ($q) use ($filters) {
        $q->where('supplier_id', $filters['supplier_id']);
      })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        'supplier_id',
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(CASE WHEN status = "accepted" THEN 1 ELSE 0 END) as accepted'),
        DB::raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected')
      )
      ->groupBy('supplier_id')
      ->get()
      ->map(function ($item) {
        $total = (int) $item->total;
        $accepted = (int) $item->accepted;
        return [
          'supplier_id' => $item->supplier_id,
          'supplier_name' => $item->supplier?->company_name
            ?? $item->supplier?->full_name
            ?? 'Unknown',
          'total' => $total,
          'accepted' => $accepted,
          'rejected' => (int) $item->rejected,
          'acceptance_rate' => $this->calculatePercentage($accepted, $total),
        ];
      });
  }

  public function getPriceCompetitiveness(array $filters = []): Collection
  {
    // Compare supplier prices vs average
    return SupplierQuotation::query()
      ->with('supplier')
      ->whereNotNull('net_amount')
      ->when(isset($filters['supplier_id']), function ($q) use ($filters) {
        $q->where('supplier_id', $filters['supplier_id']);
      })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        'supplier_id',
        DB::raw('AVG(net_amount) as avg_price'),
        DB::raw('COUNT(*) as quotation_count')
      )
      ->groupBy('supplier_id')
      ->get()
      ->map(function ($item) {
        $avgPrice = (float) $item->avg_price;
        // Calculate market average
        $marketAvg = SupplierQuotation::avg('net_amount') ?? 0;
        return [
          'supplier_id' => $item->supplier_id,
          'supplier_name' => $item->supplier?->company_name
            ?? $item->supplier?->full_name
            ?? 'Unknown',
          'avg_price' => $avgPrice,
          'quotation_count' => (int) $item->quotation_count,
          'market_avg' => $marketAvg,
          'price_difference' => $avgPrice - $marketAvg,
          'competitiveness' => $marketAvg > 0
            ? round((($marketAvg - $avgPrice) / $marketAvg) * 100, 2)
            : 0,
        ];
      });
  }

  public function getSupplierComparison(array $supplierIds, array $filters = []): array
  {
    $comparison = [];

    foreach ($supplierIds as $supplierId) {
      $performance = $this->getPerformanceScore($supplierId, $filters);
      if (!empty($performance)) {
        $comparison[] = $performance;
      }
    }

    return $comparison;
  }

  public function getRiskAnalysis(int $supplierId, array $filters = []): array
  {
    $supplier = Supplier::find($supplierId);
    if (!$supplier) {
      return [];
    }

    // Risk indicators
    $indicators = [];

    // Check if blacklisted
    $indicators['blacklisted'] = $supplier->isBlacklisted();

    // Check delivery performance
    $deliveryData = PurchaseOrder::where('supplier_id', $supplierId)
      ->whereNotNull('actual_delivery_date')
      ->whereNotNull('expected_delivery_date')
      ->select(
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(CASE WHEN actual_delivery_date > expected_delivery_date THEN 1 ELSE 0 END) as delayed')
      )
      ->first();

    $totalDeliveries = (int) ($deliveryData->total ?? 0);
    $delayed = (int) ($deliveryData->delayed ?? 0);
    $indicators['delivery_risk'] = $totalDeliveries > 0
      ? $this->calculatePercentage($delayed, $totalDeliveries)
      : 0;

    // Check quality issues
    $qualityData = GoodsReceivedNote::whereHas('purchaseOrder', function ($q) use ($supplierId) {
      $q->where('supplier_id', $supplierId);
    })
      ->select(
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(CASE WHEN inspection_result = "failed" THEN 1 ELSE 0 END) as failed')
      )
      ->first();

    $totalInspections = (int) ($qualityData->total ?? 0);
    $failed = (int) ($qualityData->failed ?? 0);
    $indicators['quality_risk'] = $totalInspections > 0
      ? $this->calculatePercentage($failed, $totalInspections)
      : 0;

    // Calculate overall risk score
    $riskScore = 0;
    if ($indicators['blacklisted']) {
      $riskScore += 50;
    }
    $riskScore += ($indicators['delivery_risk'] * 0.25);
    $riskScore += ($indicators['quality_risk'] * 0.25);

    $indicators['overall_risk_score'] = min(100, $riskScore);
    $indicators['risk_level'] = $this->getRiskLevel($indicators['overall_risk_score']);

    return $indicators;
  }

  protected function getRiskLevel(float $score): string
  {
    if ($score >= 70) {
      return 'high';
    } elseif ($score >= 40) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  public function getSpendAnalysis(array $filters = []): Collection
  {
    return PurchaseOrder::query()
      ->with('supplier')
      ->whereNotNull('total_amount')
      ->when(isset($filters['supplier_id']), function ($q) use ($filters) {
        $q->where('supplier_id', $filters['supplier_id']);
      })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        'supplier_id',
        DB::raw('COUNT(*) as order_count'),
        DB::raw('SUM(total_amount) as total_spent'),
        DB::raw('AVG(total_amount) as avg_order_value'),
        DB::raw('MIN(total_amount) as min_order_value'),
        DB::raw('MAX(total_amount) as max_order_value')
      )
      ->groupBy('supplier_id')
      ->get()
      ->map(function ($item) {
        return [
          'supplier_id' => $item->supplier_id,
          'supplier_name' => $item->supplier?->company_name
            ?? $item->supplier?->full_name
            ?? 'Unknown',
          'order_count' => (int) $item->order_count,
          'total_spent' => (float) $item->total_spent,
          'avg_order_value' => (float) $item->avg_order_value,
          'min_order_value' => (float) $item->min_order_value,
          'max_order_value' => (float) $item->max_order_value,
        ];
      });
  }

  /**
   * ✅ FIXED: Override parent methods to handle filters properly
   */
  public function getDateRange(?Carbon $startDate = null, ?Carbon $endDate = null): array
  {
    return parent::getDateRange($startDate, $endDate);
  }

  public function applyFilters($query, array $filters = []): void
  {
    parent::applyFilters($query, $filters);
  }

  /**
   * ✅ NEW: Get supplier by ID with safe fallback
   */
  protected function getSupplierName(int $supplierId): string
  {
    $supplier = Supplier::find($supplierId);
    if (!$supplier) {
      return 'Unknown';
    }
    return $supplier->company_name ?? $supplier->full_name ?? 'Unknown';
  }

  /**
   * ✅ NEW: Safe relationship count
   */
  protected function safeWithCount($query, string $relation, string $alias): Builder
  {
    try {
      return $query->withCount([$relation . ' as ' . $alias]);
    } catch (\Exception $e) {
      // If relationship doesn't exist, return query without the count
      return $query;
    }
  }
}
