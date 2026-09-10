<?php
// app/services/analytics/repositories/PurchaseOrderAnalyticsRepository.php

declare(strict_types=1);

namespace App\Services\Analytics\Repositories;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Services\Analytics\Contracts\Repositories\PurchaseOrderAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PurchaseOrderAnalyticsRepository extends BaseAnalyticsRepository implements PurchaseOrderAnalyticsRepositoryInterface
{
  public function getDashboardSummary(array $filters = []): array
  {
    $query = PurchaseOrder::query();
    $this->applyFilters($query, $filters);

    return [
      'total' => $query->count(),
      'lpo_count' => $query->clone()->where('type', 'lpo')->count(),
      'lso_count' => $query->clone()->where('type', 'lso')->count(),
      'pending_approval' => $query->clone()->whereIn('status', [
        PurchaseOrder::STATUS_PENDING_CHECK,
        PurchaseOrder::STATUS_PENDING_ENDORSEMENT,
        PurchaseOrder::STATUS_PENDING_APPROVAL
      ])->count(),
      'issued' => $query->clone()->where('status', PurchaseOrder::STATUS_ISSUED)->count(),
      'completed' => $query->clone()->where('status', PurchaseOrder::STATUS_COMPLETED)->count(),
      'cancelled' => $query->clone()->where('status', PurchaseOrder::STATUS_CANCELLED)->count(),
      'total_value' => $query->clone()->sum('total_amount') ?? 0,
    ];
  }

  public function getTrends(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    $query = PurchaseOrder::query();
    $this->applyFilters($query, $filters);
    $this->groupByInterval($query, 'created_at', $interval);

    switch ($metric) {
      case 'volume':
        $query->selectRaw('COUNT(*) as value');
        break;
      case 'value':
        $query->selectRaw('SUM(total_amount) as value');
        break;
      case 'avg_value':
        $query->selectRaw('AVG(total_amount) as value');
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
    $query = PurchaseOrder::query();
    $this->applyFilters($query, $filters);

    $dateRange = $this->getDateRange(
      $filters['start_date'] ?? null,
      $filters['end_date'] ?? null
    );

    return [
      'total' => $query->clone()->count(),
      'lpo_count' => $query->clone()->where('type', 'lpo')->count(),
      'lso_count' => $query->clone()->where('type', 'lso')->count(),
      'total_value' => $query->clone()->sum('total_amount') ?? 0,
      'avg_value' => $this->safeAverage($query->clone()->avg('total_amount')),
      'new_this_period' => $query->clone()
        ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
        ->count(),
    ];
  }

  public function getStatusDistribution(array $filters = []): Collection
  {
    return PurchaseOrder::query()
      ->when(isset($filters['type']), function ($q) use ($filters) {
        $q->where('type', $filters['type']);
      })
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

  public function getByType(array $filters = []): Collection
  {
    return PurchaseOrder::query()
      ->when(isset($filters['status']), function ($q) use ($filters) {
        $q->where('status', $filters['status']);
      })
      ->select('type', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total_value'))
      ->groupBy('type')
      ->get()
      ->map(function ($item) {
        return [
          'type' => $item->type,
          'label' => $item->type_label,
          'color' => $item->type_color,
          'count' => (int) $item->count,
          'total_value' => (float) $item->total_value,
        ];
      });
  }

  public function getValueDistribution(array $filters = []): Collection
  {
    $ranges = [
      '0-10000' => [0, 10000],
      '10001-50000' => [10001, 50000],
      '50001-100000' => [50001, 100000],
      '100001-500000' => [100001, 500000],
      '500000-1000000' => [500000, 1000000],
      '1000000+' => [1000000, PHP_FLOAT_MAX],
    ];

    $results = collect();

    foreach ($ranges as $label => [$min, $max]) {
      $query = PurchaseOrder::query();
      $this->applyFilters($query, $filters);

      $count = $query->whereBetween('total_amount', [$min, $max])->count();
      $total = $query->whereBetween('total_amount', [$min, $max])->sum('total_amount') ?? 0;

      $results->push([
        'range' => $label,
        'count' => $count,
        'total_value' => $total,
      ]);
    }

    return $results;
  }

  public function getDeliveryPerformance(array $filters = []): array
  {
    $query = PurchaseOrder::query()
      ->whereNotNull('actual_delivery_date')
      ->whereNotNull('expected_delivery_date');

    $this->applyFilters($query, $filters);

    $data = $query->select(
      DB::raw('COUNT(*) as total'),
      DB::raw('SUM(CASE WHEN actual_delivery_date <= expected_delivery_date THEN 1 ELSE 0 END) as on_time'),
      DB::raw('AVG(DATEDIFF(actual_delivery_date, expected_delivery_date)) as avg_delay_days')
    )->first();

    $total = (int) ($data->total ?? 0);
    $onTime = (int) ($data->on_time ?? 0);

    return [
      'total' => $total,
      'on_time' => $onTime,
      'delayed' => $total - $onTime,
      'on_time_rate' => $this->calculatePercentage($onTime, $total),
      'avg_delay_days' => round((float) ($data->avg_delay_days ?? 0), 2),
      'by_supplier' => $this->getDeliveryPerformanceBySupplier($filters),
    ];
  }

  protected function getDeliveryPerformanceBySupplier(array $filters = []): Collection
  {
    return PurchaseOrder::query()
      ->with('supplier')
      ->whereNotNull('actual_delivery_date')
      ->whereNotNull('expected_delivery_date')
      ->when(isset($filters['type']), function ($q) use ($filters) {
        $q->where('type', $filters['type']);
      })
      ->select(
        'supplier_id',
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(CASE WHEN actual_delivery_date <= expected_delivery_date THEN 1 ELSE 0 END) as on_time')
      )
      ->groupBy('supplier_id')
      ->get()
      ->map(function ($item) {
        $total = (int) $item->total;
        $onTime = (int) $item->on_time;
        return [
          'supplier_id' => $item->supplier_id,
          'supplier_name' => $item->supplier?->company_name ?? 'Unknown',
          'total' => $total,
          'on_time' => $onTime,
          'on_time_rate' => $this->calculatePercentage($onTime, $total),
        ];
      });
  }

  public function getCycleTime(array $filters = []): array
  {
    $query = PurchaseOrder::query()
      ->whereNotNull('issued_at')
      ->whereNotNull('completed_at');

    $this->applyFilters($query, $filters);

    $data = $query->select(
      DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, issued_at)) as creation_to_issue'),
      DB::raw('AVG(TIMESTAMPDIFF(HOUR, issued_at, completed_at)) as issue_to_completion'),
      DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, completed_at)) as total_cycle')
    )->first();

    return [
      'creation_to_issue' => $this->safeAverage($data->creation_to_issue ?? 0),
      'issue_to_completion' => $this->safeAverage($data->issue_to_completion ?? 0),
      'total_cycle' => $this->safeAverage($data->total_cycle ?? 0),
      'by_type' => $this->getCycleTimeByType($filters),
    ];
  }

  protected function getCycleTimeByType(array $filters = []): Collection
  {
    return PurchaseOrder::query()
      ->whereNotNull('issued_at')
      ->whereNotNull('completed_at')
      ->when(isset($filters['supplier_id']), function ($q) use ($filters) {
        $q->where('supplier_id', $filters['supplier_id']);
      })
      ->select(
        'type',
        DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, completed_at)) as avg_cycle_time')
      )
      ->groupBy('type')
      ->get()
      ->map(function ($item) {
        return [
          'type' => $item->type,
          'label' => $item->type_label,
          'avg_cycle_hours' => $this->safeAverage($item->avg_cycle_time),
        ];
      });
  }

  public function getOverdueStats(array $filters = []): array
  {
    $query = PurchaseOrder::query()
      ->whereDate('expected_delivery_date', '<', now())
      ->whereNotIn('status', [
        PurchaseOrder::STATUS_COMPLETED,
        PurchaseOrder::STATUS_CANCELLED,
        PurchaseOrder::STATUS_CLOSED
      ]);

    $this->applyFilters($query, $filters);

    $overdue = $query->clone()->count();
    $total = PurchaseOrder::query()
      ->when(isset($filters['type']), function ($q) use ($filters) {
        $q->where('type', $filters['type']);
      })
      ->count();

    return [
      'overdue_count' => $overdue,
      'total_active' => $total,
      'overdue_rate' => $this->calculatePercentage($overdue, $total),
      'by_supplier' => $query->clone()
        ->select('supplier_id', DB::raw('COUNT(*) as count'))
        ->groupBy('supplier_id')
        ->get()
        ->map(function ($item) {
          return [
            'supplier_id' => $item->supplier_id,
            'supplier_name' => $item->supplier?->company_name ?? 'Unknown',
            'overdue_count' => (int) $item->count,
          ];
        }),
    ];
  }

  public function getBySupplier(array $filters = []): Collection
  {
    return PurchaseOrder::query()
      ->with('supplier')
      ->when(isset($filters['type']), function ($q) use ($filters) {
        $q->where('type', $filters['type']);
      })
      ->when(isset($filters['status']), function ($q) use ($filters) {
        $q->where('status', $filters['status']);
      })
      ->select(
        'supplier_id',
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(total_amount) as total_value'),
        DB::raw('AVG(total_amount) as avg_value')
      )
      ->groupBy('supplier_id')
      ->get()
      ->map(function ($item) {
        return [
          'supplier_id' => $item->supplier_id,
          'supplier_name' => $item->supplier?->company_name ?? 'Unknown',
          'total' => (int) $item->total,
          'total_value' => (float) $item->total_value,
          'avg_value' => (float) $item->avg_value,
        ];
      });
  }

  public function getCompletionRate(array $filters = []): float
  {
    $query = PurchaseOrder::query();
    $this->applyFilters($query, $filters);

    $total = $query->clone()->count();
    $completed = $query->clone()->where('status', PurchaseOrder::STATUS_COMPLETED)->count();

    return $this->calculatePercentage($completed, $total);
  }

  public function getByDepartment(array $filters = []): Collection
  {
    return PurchaseOrder::query()
      ->with('requisition.department')
      ->whereHas('requisition')
      ->when(isset($filters['type']), function ($q) use ($filters) {
        $q->where('type', $filters['type']);
      })
      ->when(isset($filters['status']), function ($q) use ($filters) {
        $q->where('status', $filters['status']);
      })
      ->select(
        'requisition.department_id',
        DB::raw('COUNT(purchase_orders.id) as total'),
        DB::raw('SUM(purchase_orders.total_amount) as total_value')
      )
      ->join('requisitions', 'purchase_orders.requisition_id', '=', 'requisitions.id')
      ->groupBy('requisition.department_id')
      ->get()
      ->map(function ($item) {
        return [
          'department_id' => $item->department_id,
          'department_name' => $item->department?->name ?? 'Unknown',
          'total' => (int) $item->total,
          'total_value' => (float) $item->total_value,
        ];
      });
  }

  public function getSignatureWorkflowStats(array $filters = []): array
  {
    $query = PurchaseOrder::query();
    $this->applyFilters($query, $filters);

    $total = $query->clone()->count();

    return [
      'checked' => $query->clone()->whereNotNull('checked_by')->count(),
      'endorsed' => $query->clone()->whereNotNull('endorsed_by')->count(),
      'approved' => $query->clone()->whereNotNull('approved_by')->count(),
      'all_signed' => $query->clone()
        ->whereNotNull('checked_by')
        ->whereNotNull('endorsed_by')
        ->whereNotNull('approved_by')
        ->count(),
      'check_rate' => $this->calculatePercentage(
        $query->clone()->whereNotNull('checked_by')->count(),
        $total
      ),
      'endorsement_rate' => $this->calculatePercentage(
        $query->clone()->whereNotNull('endorsed_by')->count(),
        $total
      ),
      'approval_rate' => $this->calculatePercentage(
        $query->clone()->whereNotNull('approved_by')->count(),
        $total
      ),
    ];
  }

  public function getStageTransitionTimes(array $filters = []): Collection
  {
    $stages = [
      'created_to_check' => ['created_at', 'checked_at'],
      'check_to_endorse' => ['checked_at', 'endorsed_at'],
      'endorse_to_approve' => ['endorsed_at', 'approved_at'],
      'approve_to_issue' => ['approved_at', 'issued_at'],
    ];

    $results = collect();

    foreach ($stages as $stageName => [$startField, $endField]) {
      $query = PurchaseOrder::query()
        ->whereNotNull($startField)
        ->whereNotNull($endField);

      $this->applyFilters($query, $filters);

      $avgTime = $query->select(
        DB::raw("AVG(TIMESTAMPDIFF(HOUR, {$startField}, {$endField})) as avg_time")
      )->first();

      $results->push([
        'stage' => $stageName,
        'label' => ucwords(str_replace('_', ' ', $stageName)),
        'avg_time_hours' => $this->safeAverage($avgTime->avg_time ?? 0),
      ]);
    }

    return $results;
  }

  public function getTopSuppliers(int $limit = 10, array $filters = []): Collection
  {
    return PurchaseOrder::query()
      ->with('supplier')
      ->whereNotNull('supplier_id')
      ->when(isset($filters['type']), function ($q) use ($filters) {
        $q->where('type', $filters['type']);
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
        DB::raw('SUM(total_amount) as total_spent')
      )
      ->groupBy('supplier_id')
      ->orderBy('total_spent', 'desc')
      ->limit($limit)
      ->get()
      ->map(function ($item) {
        return [
          'supplier_id' => $item->supplier_id,
          'supplier_name' => $item->supplier?->company_name ?? 'Unknown',
          'order_count' => (int) $item->order_count,
          'total_spent' => (float) $item->total_spent,
        ];
      });
  }

  public function getDateRange(?Carbon $startDate = null, ?Carbon $endDate = null): array
  {
    return parent::getDateRange($startDate, $endDate);
  }

  public function applyFilters($query, array $filters = []): void
  {
    parent::applyFilters($query, $filters);
  }
}
