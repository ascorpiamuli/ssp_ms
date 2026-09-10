<?php
// app/services/analytics/repositories/RequisitionAnalyticsRepository.php

declare(strict_types=1);

namespace App\Services\Analytics\Repositories;

use App\Models\Requisition;
use App\Models\RequisitionHistory;
use App\Services\Analytics\Contracts\Repositories\RequisitionAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RequisitionAnalyticsRepository extends BaseAnalyticsRepository implements RequisitionAnalyticsRepositoryInterface
{
  public function getDashboardSummary(array $filters = []): array
  {
    $query = Requisition::query();
    $this->applyFilters($query, $filters);

    return [
      'total' => $query->count(),
      'pending' => $query->clone()->where('status', 'submitted')->count(),
      'approved' => $query->clone()->where('status', 'final_approved')->count(),
      'returned' => $query->clone()->where('status', 'returned')->count(),
      'cancelled' => $query->clone()->where('status', 'cancelled')->count(),
      'total_value' => $query->clone()->sum('total_amount') ?? 0,
    ];
  }

  public function getTrends(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    $query = Requisition::query();
    $this->applyFilters($query, $filters);

    // Group by interval
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
    $query = Requisition::query();
    $this->applyFilters($query, $filters);

    $dateRange = $this->getDateRange(
      $filters['start_date'] ?? null,
      $filters['end_date'] ?? null
    );

    $total = $query->clone()->count();
    $previousTotal = Requisition::whereBetween('created_at', [
      $dateRange['start']->copy()->subYear(),
      $dateRange['end']->copy()->subYear()
    ])->count();

    return [
      'total' => $total,
      'previous_total' => $previousTotal,
      'growth' => $previousTotal > 0
        ? round((($total - $previousTotal) / $previousTotal) * 100, 2)
        : 0,
      'daily_avg' => $total > 0
        ? round($total / $dateRange['start']->diffInDays($dateRange['end']), 2)
        : 0,
      'monthly_avg' => $total > 0
        ? round($total / $dateRange['start']->diffInMonths($dateRange['end']), 2)
        : 0,
    ];
  }

  public function getStatusDistribution(array $filters = []): Collection
  {
    return Requisition::query()
      ->when(isset($filters['department_id']), function ($q) use ($filters) {
        $q->where('department_id', $filters['department_id']);
      })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
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

  public function getByDepartment(array $filters = []): Collection
  {
    return Requisition::query()
      ->with('department')
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        'department_id',
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(total_amount) as total_value'),
        DB::raw('AVG(total_amount) as avg_value')
      )
      ->groupBy('department_id')
      ->get()
      ->map(function ($item) {
        return [
          'department_id' => $item->department_id,
          'department_name' => $item->department?->name ?? 'Unknown',
          'total' => (int) $item->total,
          'total_value' => (float) $item->total_value,
          'avg_value' => (float) $item->avg_value,
        ];
      });
  }

  public function getByPriority(array $filters = []): Collection
  {
    return Requisition::query()
      ->when(isset($filters['department_id']), function ($q) use ($filters) {
        $q->where('department_id', $filters['department_id']);
      })
      ->select('priority', DB::raw('COUNT(*) as count'))
      ->groupBy('priority')
      ->get()
      ->map(function ($item) {
        return [
          'priority' => $item->priority,
          'label' => $item->priority_label,
          'color' => $item->priority_color,
          'count' => (int) $item->count,
        ];
      });
  }

  public function getByType(array $filters = []): Collection
  {
    return Requisition::query()
      ->when(isset($filters['department_id']), function ($q) use ($filters) {
        $q->where('department_id', $filters['department_id']);
      })
      ->select('requisition_type', DB::raw('COUNT(*) as count'))
      ->groupBy('requisition_type')
      ->get()
      ->map(function ($item) {
        return [
          'type' => $item->requisition_type,
          'label' => $item->requisition_type_label,
          'count' => (int) $item->count,
        ];
      });
  }

  public function getApprovalCycleTime(array $filters = []): array
  {
    $query = Requisition::whereNotNull('hod_approved_at')
      ->whereNotNull('final_approved_at');

    $this->applyFilters($query, $filters);

    $data = $query->select(
      DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, submitted_at)) as submission_time'),
      DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, hod_approved_at)) as hod_approval_time'),
      DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, final_approved_at)) as total_time')
    )->first();

    return [
      'submission_to_approval' => $this->safeAverage($data->submission_time ?? 0),
      'hod_approval' => $this->safeAverage($data->hod_approval_time ?? 0),
      'total_cycle' => $this->safeAverage($data->total_time ?? 0),
    ];
  }

  public function getReturnRate(array $filters = []): float
  {
    $query = Requisition::query();
    $this->applyFilters($query, $filters);

    $total = $query->clone()->count();
    $returned = $query->clone()->where('status', 'returned')->count();

    return $this->calculatePercentage($returned, $total);
  }

  public function getConversionFunnel(array $filters = []): Collection
  {
    $query = Requisition::query();
    $this->applyFilters($query, $filters);

    $total = $query->clone()->count();

    return collect([
      [
        'stage' => 'Total Requisitions',
        'count' => $total,
        'percentage' => 100,
      ],
      [
        'stage' => 'Submitted',
        'count' => $query->clone()->where('status', 'submitted')->count(),
        'percentage' => $this->calculatePercentage(
          $query->clone()->where('status', 'submitted')->count(),
          $total
        ),
      ],
      [
        'stage' => 'HOD Approved',
        'count' => $query->clone()->whereIn('status', ['hod_approved', 'accountant_approved', 'principal_approved', 'final_approved'])->count(),
        'percentage' => $this->calculatePercentage(
          $query->clone()->whereIn('status', ['hod_approved', 'accountant_approved', 'principal_approved', 'final_approved'])->count(),
          $total
        ),
      ],
      [
        'stage' => 'Final Approved',
        'count' => $query->clone()->where('status', 'final_approved')->count(),
        'percentage' => $this->calculatePercentage(
          $query->clone()->where('status', 'final_approved')->count(),
          $total
        ),
      ],
    ]);
  }

  public function getAverageTimeInStatus(array $filters = []): Collection
  {
    // This is complex - using RequisitionHistory to calculate time in each status
    $statuses = ['draft', 'submitted', 'hod_approved', 'accountant_approved', 'principal_approved', 'final_approved'];

    $results = collect();

    foreach ($statuses as $status) {
      $avgTime = RequisitionHistory::where('action', 'status_changed')
        ->where('new_values->status', $status)
        ->when(isset($filters['department_id']), function ($q) use ($filters) {
          $q->whereHas('requisition', function ($q2) use ($filters) {
            $q2->where('department_id', $filters['department_id']);
          });
        })
        ->select(DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at,
                    (SELECT created_at FROM requisition_history rh2
                     WHERE rh2.requisition_id = requisition_history.requisition_id
                     AND rh2.action = "status_changed"
                     AND JSON_EXTRACT(rh2.new_values, "$.status") != "' . $status . '"
                     ORDER BY created_at LIMIT 1
                ))) as avg_time'))
        ->first();

      $results->push([
        'status' => $status,
        'label' => ucfirst(str_replace('_', ' ', $status)),
        'avg_time_hours' => $this->safeAverage($avgTime->avg_time ?? 0),
      ]);
    }

    return $results;
  }

  public function getTopDepartments(int $limit = 10, array $filters = []): Collection
  {
    return Requisition::query()
      ->with('department')
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        'department_id',
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(total_amount) as total_value')
      )
      ->groupBy('department_id')
      ->orderBy('total_value', 'desc')
      ->limit($limit)
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

  public function getSlaComplianceRate(array $filters = []): float
  {
    $query = Requisition::whereNotNull('sla_target_at');
    $this->applyFilters($query, $filters);

    $total = $query->clone()->count();
    $compliant = $query->clone()
      ->where('sla_status', 'on_track')
      ->orWhere('sla_status', 'at_risk')
      ->count();

    return $this->calculatePercentage($compliant, $total);
  }

  public function getValueDistribution(array $filters = []): Collection
  {
    $ranges = [
      '0-1000' => [0, 1000],
      '1001-5000' => [1001, 5000],
      '5001-10000' => [5001, 10000],
      '10001-50000' => [10001, 50000],
      '50001-100000' => [50001, 100000],
      '100001+' => [100001, PHP_FLOAT_MAX],
    ];

    $results = collect();

    foreach ($ranges as $label => [$min, $max]) {
      $query = Requisition::query();
      $this->applyFilters($query, $filters);

      $count = $query->whereBetween('total_amount', [$min, $max])->count();

      $results->push([
        'range' => $label,
        'count' => $count,
      ]);
    }

    return $results;
  }

  public function getEmergencyRate(array $filters = []): float
  {
    $query = Requisition::query();
    $this->applyFilters($query, $filters);

    $total = $query->clone()->count();
    $emergency = $query->clone()->where('type', 'emergency')->count();

    return $this->calculatePercentage($emergency, $total);
  }

  public function getRevisionStats(array $filters = []): array
  {
    $query = Requisition::query();
    $this->applyFilters($query, $filters);

    return [
      'total_revisions' => $query->clone()->sum('revision_count') ?? 0,
      'avg_revisions' => $this->safeAverage($query->clone()->avg('revision_count')),
      'max_revisions' => $query->clone()->max('revision_count') ?? 0,
      'requisitions_with_revisions' => $query->clone()->where('revision_count', '>', 0)->count(),
    ];
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
