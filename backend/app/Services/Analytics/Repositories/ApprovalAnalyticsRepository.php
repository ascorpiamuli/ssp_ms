<?php
// app/services/analytics/repositories/ApprovalAnalyticsRepository.php

declare(strict_types=1);

namespace App\Services\Analytics\Repositories;

use App\Models\Approval;
use App\Models\ProcurementApproval;
use App\Services\Analytics\Contracts\Repositories\ApprovalAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ApprovalAnalyticsRepository extends BaseAnalyticsRepository implements ApprovalAnalyticsRepositoryInterface
{
  public function getDashboardSummary(array $filters = []): array
  {
    $query = Approval::query();
    $this->applyFilters($query, $filters);

    return [
      'total' => $query->count(),
      'pending' => $query->clone()->where('status', 'pending')->count(),
      'approved' => $query->clone()->where('status', 'approved')->count(),
      'declined' => $query->clone()->where('status', 'declined')->count(),
      'delegated' => $query->clone()->where('status', 'delegated')->count(),
      'avg_response_time' => $this->safeAverage($query->clone()->avg('response_time_hours')),
    ];
  }

  public function getTrends(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    $query = Approval::query();
    $this->applyFilters($query, $filters);
    $this->groupByInterval($query, 'created_at', $interval);

    switch ($metric) {
      case 'volume':
        $query->selectRaw('COUNT(*) as value');
        break;
      case 'approved':
        $query->where('status', 'approved')->selectRaw('COUNT(*) as value');
        break;
      case 'declined':
        $query->where('status', 'declined')->selectRaw('COUNT(*) as value');
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
    $query = Approval::query();
    $this->applyFilters($query, $filters);

    $dateRange = $this->getDateRange(
      $filters['start_date'] ?? null,
      $filters['end_date'] ?? null
    );

    return [
      'total' => $query->clone()->count(),
      'pending' => $query->clone()->where('status', 'pending')->count(),
      'approved' => $query->clone()->where('status', 'approved')->count(),
      'declined' => $query->clone()->where('status', 'declined')->count(),
      'delegated' => $query->clone()->where('status', 'delegated')->count(),
      'daily_avg' => $query->clone()->count() > 0
        ? round($query->clone()->count() / $dateRange['start']->diffInDays($dateRange['end']), 2)
        : 0,
    ];
  }

  public function getStatusDistribution(array $filters = []): Collection
  {
    return Approval::query()
      ->when(isset($filters['level']), function ($q) use ($filters) {
        $q->where('level', $filters['level']);
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

  public function getByLevel(array $filters = []): Collection
  {
    return Approval::query()
      ->when(isset($filters['status']), function ($q) use ($filters) {
        $q->where('status', $filters['status']);
      })
      ->select('level', DB::raw('COUNT(*) as count'))
      ->groupBy('level')
      ->get()
      ->map(function ($item) {
        return [
          'level' => $item->level,
          'label' => $item->level_label,
          'color' => $item->level_color,
          'count' => (int) $item->count,
        ];
      });
  }

  public function getAverageTimeByLevel(array $filters = []): Collection
  {
    return Approval::query()
      ->whereNotNull('response_time_hours')
      ->when(isset($filters['status']), function ($q) use ($filters) {
        $q->where('status', $filters['status']);
      })
      ->select(
        'level',
        DB::raw('AVG(response_time_hours) as avg_time')
      )
      ->groupBy('level')
      ->get()
      ->map(function ($item) {
        return [
          'level' => $item->level,
          'label' => $item->level_label,
          'color' => $item->level_color,
          'avg_time_hours' => $this->safeAverage($item->avg_time),
        ];
      });
  }

  public function getApprovalRateByLevel(array $filters = []): Collection
  {
    $levels = ['hod', 'accountant', 'principal', 'final'];

    $results = collect();

    foreach ($levels as $level) {
      $query = Approval::where('level', $level);
      $this->applyFilters($query, $filters);

      $total = $query->clone()->count();
      $approved = $query->clone()->where('status', 'approved')->count();

      $results->push([
        'level' => $level,
        'label' => Approval::make(['level' => $level])->level_label,
        'total' => $total,
        'approved' => $approved,
        'rate' => $this->calculatePercentage($approved, $total),
      ]);
    }

    return $results;
  }

  public function getPendingByApprover(array $filters = []): Collection
  {
    return Approval::query()
      ->with(['approver', 'requisition'])
      ->where('status', 'pending')
      ->when(isset($filters['level']), function ($q) use ($filters) {
        $q->where('level', $filters['level']);
      })
      ->select(
        'approver_id',
        DB::raw('COUNT(*) as pending_count'),
        DB::raw('MIN(created_at) as oldest_pending')
      )
      ->groupBy('approver_id')
      ->orderBy('pending_count', 'desc')
      ->get()
      ->map(function ($item) {
        return [
          'approver_id' => $item->approver_id,
          'approver_name' => $item->approver?->full_name ?? 'Unknown',
          'pending_count' => (int) $item->pending_count,
          'oldest_pending' => Carbon::parse($item->oldest_pending)->diffForHumans(),
        ];
      });
  }

  public function getDelegationStats(array $filters = []): array
  {
    $query = Approval::whereNotNull('delegate_id');
    $this->applyFilters($query, $filters);

    return [
      'total_delegations' => $query->clone()->count(),
      'active_delegations' => $query->clone()->where('status', 'delegated')->count(),
      'by_delegate' => $query->clone()
        ->select('delegate_id', DB::raw('COUNT(*) as count'))
        ->groupBy('delegate_id')
        ->get()
        ->map(function ($item) {
          return [
            'delegate_id' => $item->delegate_id,
            'delegate_name' => $item->delegate?->full_name ?? 'Unknown',
            'count' => (int) $item->count,
          ];
        }),
    ];
  }

  public function getEscalationStats(array $filters = []): array
  {
    $query = Approval::where('status', 'escalated');
    $this->applyFilters($query, $filters);

    return [
      'total_escalations' => $query->clone()->count(),
      'by_level' => $query->clone()
        ->select('level', DB::raw('COUNT(*) as count'))
        ->groupBy('level')
        ->get()
        ->map(function ($item) {
          return [
            'level' => $item->level,
            'label' => $item->level_label,
            'count' => (int) $item->count,
          ];
        }),
    ];
  }

  public function getBottleneckAnalysis(array $filters = []): Collection
  {
    return $this->getAverageTimeByLevel($filters)
      ->sortByDesc('avg_time_hours')
      ->values()
      ->map(function ($item) {
        $item['bottleneck_status'] = $item['avg_time_hours'] > 48 ? 'critical' : ($item['avg_time_hours'] > 24 ? 'warning' : 'normal');
        return $item;
      });
  }

  public function getSlaComplianceRate(array $filters = []): float
  {
    // Assuming SLA is 48 hours for approvals
    $query = Approval::whereNotNull('response_time_hours');
    $this->applyFilters($query, $filters);

    $total = $query->clone()->count();
    $compliant = $query->clone()->where('response_time_hours', '<=', 48)->count();

    return $this->calculatePercentage($compliant, $total);
  }

  public function getWorkloadByApprover(array $filters = []): Collection
  {
    return Approval::query()
      ->with('approver')
      ->where('status', 'pending')
      ->when(isset($filters['level']), function ($q) use ($filters) {
        $q->where('level', $filters['level']);
      })
      ->select(
        'approver_id',
        DB::raw('COUNT(*) as pending_count'),
        DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, NOW())) as avg_waiting_time')
      )
      ->groupBy('approver_id')
      ->get()
      ->map(function ($item) {
        return [
          'approver_id' => $item->approver_id,
          'approver_name' => $item->approver?->full_name ?? 'Unknown',
          'pending_count' => (int) $item->pending_count,
          'avg_waiting_hours' => $this->safeAverage($item->avg_waiting_time),
          'workload_level' => $item->pending_count > 10 ? 'high' : ($item->pending_count > 5 ? 'medium' : 'low'),
        ];
      });
  }

  public function getCycleTimeBreakdown(array $filters = []): array
  {
    $levels = ['hod', 'accountant', 'principal', 'final'];
    $breakdown = [];

    foreach ($levels as $level) {
      $query = Approval::where('level', $level)
        ->whereNotNull('response_time_hours');
      $this->applyFilters($query, $filters);

      $data = $query->select(
        DB::raw('AVG(response_time_hours) as avg_time'),
        DB::raw('MIN(response_time_hours) as min_time'),
        DB::raw('MAX(response_time_hours) as max_time')
      )->first();

      $breakdown[$level] = [
        'avg_hours' => $this->safeAverage($data->avg_time ?? 0),
        'min_hours' => $this->safeAverage($data->min_time ?? 0),
        'max_hours' => $this->safeAverage($data->max_time ?? 0),
      ];
    }

    return $breakdown;
  }

  public function getReturnRateByApprover(array $filters = []): Collection
  {
    return Approval::query()
      ->with('approver')
      ->where('status', 'returned')
      ->when(isset($filters['level']), function ($q) use ($filters) {
        $q->where('level', $filters['level']);
      })
      ->select(
        'approver_id',
        DB::raw('COUNT(*) as return_count')
      )
      ->groupBy('approver_id')
      ->get()
      ->map(function ($item) {
        $total = Approval::where('approver_id', $item->approver_id)->count();
        return [
          'approver_id' => $item->approver_id,
          'approver_name' => $item->approver?->full_name ?? 'Unknown',
          'return_count' => (int) $item->return_count,
          'total_approvals' => $total,
          'return_rate' => $this->calculatePercentage($item->return_count, $total),
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
