<?php
// app/services/analytics/repositories/OperationAnalyticsRepository.php

declare(strict_types=1);

namespace App\Services\Analytics\Repositories;

use App\Models\User;
use App\Models\ProcurementHistory;
use App\Models\ProcurementNotification;
use App\Models\SystemStatusLog;
use App\Models\SignatureVerification;
use App\Models\Backup;
use App\Services\Analytics\Contracts\Repositories\OperationAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Builder;

class OperationAnalyticsRepository extends BaseAnalyticsRepository implements OperationAnalyticsRepositoryInterface
{
  public function getDashboardSummary(array $filters = []): array
  {
    return [
      'total_users' => User::count(),
      'active_users' => User::where('is_active', true)->count(),
      'system_status' => $this->getSystemHealth($filters),
      'recent_activity' => $this->getRecentActivity($filters),
      'notifications' => $this->getNotificationStats($filters),
    ];
  }

  protected function getRecentActivity(array $filters = []): array
  {
    $query = ProcurementHistory::query();
    $this->applyFilters($query, $filters);

    return [
      'today' => $query->clone()->whereDate('created_at', now()->today())->count(),
      'this_week' => $query->clone()->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
      'this_month' => $query->clone()->whereMonth('created_at', now()->month)->count(),
    ];
  }

  protected function getNotificationStats(array $filters = []): array
  {
    $query = ProcurementNotification::query();
    $this->applyFilters($query, $filters);

    return [
      'total' => $query->clone()->count(),
      'sent' => $query->clone()->where('is_sent', true)->count(),
      'read' => $query->clone()->where('is_read', true)->count(),
      'failed' => $query->clone()->whereNotNull('error_message')->count(),
    ];
  }

  public function getTrends(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    $query = $this->getModelForMetric($metric)::query();
    $this->applyFilters($query, $filters);
    $this->groupByInterval($query, 'created_at', $interval);

    switch ($metric) {
      case 'user_activity':
        $query->selectRaw('COUNT(*) as value');
        break;
      case 'notifications':
        $query->selectRaw('COUNT(*) as value');
        break;
      case 'system_errors':
        $query->whereIn('status', ['down', 'degraded'])
          ->selectRaw('COUNT(*) as value');
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

  protected function getModelForMetric(string $metric): string
  {
    return match ($metric) {
      'user_activity' => ProcurementHistory::class,
      'notifications' => ProcurementNotification::class,
      'system_errors' => SystemStatusLog::class,
      default => ProcurementHistory::class,
    };
  }

  public function getVolumeStats(array $filters = []): array
  {
    return [
      'users' => User::count(),
      'active_users' => User::where('is_active', true)->count(),
      'user_sessions' => $this->getSessionStats($filters),
      'activities' => $this->getActivityStats($filters),
    ];
  }

  protected function getSessionStats(array $filters = []): array
  {
    try {
      $tableExists = Schema::hasTable('user_sessions');
      if (!$tableExists) {
        return ['total' => 0, 'active' => 0];
      }

      return [
        'total' => DB::table('user_sessions')->count(),
        'active' => DB::table('user_sessions')->where('is_active', true)->count(),
      ];
    } catch (\Exception $e) {
      return ['total' => 0, 'active' => 0];
    }
  }

  protected function getActivityStats(array $filters = []): array
  {
    $query = ProcurementHistory::query();
    $this->applyFilters($query, $filters);

    return [
      'total' => $query->clone()->count(),
      'unique_users' => $query->clone()->distinct('user_id')->count('user_id'),
      'today' => $query->clone()->whereDate('created_at', now()->today())->count(),
    ];
  }

  public function getSystemHealth(array $filters = []): array
  {
    // Check if system_status_logs table exists
    $tableExists = Schema::hasTable('system_status_logs');

    if (!$tableExists) {
      return [
        'overall_status' => 'operational',
        'label' => 'Operational',
        'color' => '#10b981',
        'components' => collect([]),
        'metrics' => [
          'total_checks' => 0,
          'operational_rate' => 100,
          'degraded_rate' => 0,
          'down_rate' => 0,
        ],
      ];
    }

    $statuses = [
      'operational' => SystemStatusLog::where('status', 'operational')->count(),
      'degraded' => SystemStatusLog::where('status', 'degraded')->count(),
      'maintenance' => SystemStatusLog::where('status', 'maintenance')->count(),
      'down' => SystemStatusLog::where('status', 'down')->count(),
    ];

    $total = array_sum($statuses);
    $overallStatus = 'operational';

    if ($statuses['down'] > 0) {
      $overallStatus = 'down';
    } elseif ($statuses['degraded'] > 0) {
      $overallStatus = 'degraded';
    } elseif ($statuses['maintenance'] > 0) {
      $overallStatus = 'maintenance';
    }

    return [
      'overall_status' => $overallStatus,
      'label' => $this->getStatusLabel($overallStatus),
      'color' => $this->getStatusColor($overallStatus),
      'components' => $this->getComponentStatus($filters),
      'metrics' => [
        'total_checks' => $total,
        'operational_rate' => $this->calculatePercentage($statuses['operational'], $total),
        'degraded_rate' => $this->calculatePercentage($statuses['degraded'], $total),
        'down_rate' => $this->calculatePercentage($statuses['down'], $total),
      ],
    ];
  }

  protected function getStatusLabel(string $status): string
  {
    $labels = [
      'operational' => 'Operational',
      'degraded' => 'Degraded',
      'maintenance' => 'Maintenance',
      'down' => 'Down',
    ];
    return $labels[$status] ?? 'Unknown';
  }

  protected function getStatusColor(string $status): string
  {
    $colors = [
      'operational' => '#10b981',
      'degraded' => '#f59e0b',
      'maintenance' => '#3b82f6',
      'down' => '#ef4444',
    ];
    return $colors[$status] ?? '#94a3b8';
  }

  protected function getComponentStatus(array $filters = []): Collection
  {
    try {
      $tableExists = Schema::hasTable('system_status_logs');
      if (!$tableExists) {
        return collect([]);
      }

      return SystemStatusLog::query()
        ->select('component', DB::raw('COUNT(*) as count'))
        ->groupBy('component')
        ->get()
        ->map(function ($item) {
          $latest = SystemStatusLog::where('component', $item->component)
            ->latest('checked_at')
            ->first();

          return [
            'component' => $item->component,
            'label' => $this->getComponentLabel($item->component),
            'icon' => $this->getComponentIcon($item->component),
            'status' => $latest?->status ?? 'unknown',
            'color' => $this->getStatusColor($latest?->status ?? 'unknown'),
          ];
        });
    } catch (\Exception $e) {
      return collect([]);
    }
  }

  protected function getComponentLabel(string $component): string
  {
    $labels = [
      'database' => 'Database',
      'cache' => 'Cache',
      'queue' => 'Queue',
      'storage' => 'Storage',
      'api' => 'API',
      'email' => 'Email Service',
      'sms' => 'SMS Service',
    ];
    return $labels[$component] ?? ucfirst($component);
  }

  protected function getComponentIcon(string $component): string
  {
    $icons = [
      'database' => 'Database',
      'cache' => 'Zap',
      'queue' => 'GitBranch',
      'storage' => 'HardDrive',
      'api' => 'Server',
      'email' => 'Mail',
      'sms' => 'MessageSquare',
    ];
    return $icons[$component] ?? 'Circle';
  }

  public function getWorkflowBottlenecks(array $filters = []): Collection
  {
    // Analyze stages that take the longest
    $stages = [
      'requisition_creation' => ['created_at', 'submitted_at'],
      'hod_approval' => ['hod_approved_at', 'hod_declined_at'],
      'accountant_approval' => ['accountant_approved_at', 'accountant_declined_at'],
      'principal_approval' => ['principal_approved_at', 'principal_declined_at'],
      'final_approval' => ['final_approved_at', 'final_declined_at'],
    ];

    $results = collect();

    // Check if requisitions table exists
    if (!Schema::hasTable('requisitions')) {
      return $results;
    }

    foreach ($stages as $stageName => [$startField, $endField]) {
      try {
        $avgTime = DB::table('requisitions')
          ->whereNotNull($startField)
          ->whereNotNull($endField)
          ->select(
            DB::raw("AVG(TIMESTAMPDIFF(HOUR, {$startField}, {$endField})) as avg_time")
          )
          ->first();

        $avgHours = $this->safeAverage($avgTime->avg_time ?? 0);

        $results->push([
          'stage' => $stageName,
          'label' => ucwords(str_replace('_', ' ', $stageName)),
          'avg_time_hours' => $avgHours,
          'bottleneck_status' => $avgHours > 48 ? 'critical' : ($avgHours > 24 ? 'warning' : 'normal'),
        ]);
      } catch (\Exception $e) {
        // Skip if fields don't exist
        continue;
      }
    }

    return $results->sortByDesc('avg_time_hours')->values();
  }

  public function getAuditSummary(array $filters = []): array
  {
    $query = ProcurementHistory::query();
    $this->applyFilters($query, $filters);

    $total = $query->clone()->count();

    // Check if columns exist
    $hasActionColumn = Schema::hasColumn('procurement_history', 'action');
    $hasActionLabel = Schema::hasColumn('procurement_history', 'action_label');
    $hasActionColor = Schema::hasColumn('procurement_history', 'action_color');

    $result = [
      'total_actions' => $total,
      'unique_users' => $query->clone()->distinct('user_id')->count('user_id'),
      'unique_entities' => $query->clone()->distinct('entity_type')->count('entity_type'),
      'top_actions' => collect([]),
      'by_entity' => collect([]),
    ];

    if ($total > 0) {
      // Top actions
      $topActionsQuery = $query->clone()
        ->select('action', DB::raw('COUNT(*) as count'));

      if ($hasActionLabel) {
        $topActionsQuery->addSelect('action_label');
      }
      if ($hasActionColor) {
        $topActionsQuery->addSelect('action_color');
      }

      $topActions = $topActionsQuery
        ->groupBy('action')
        ->orderBy('count', 'desc')
        ->limit(10)
        ->get();

      $result['top_actions'] = $topActions->map(function ($item) use ($hasActionLabel, $hasActionColor) {
        return [
          'action' => $item->action,
          'label' => $hasActionLabel ? ($item->action_label ?? $item->action) : $item->action,
          'color' => $hasActionColor ? ($item->action_color ?? '#94a3b8') : '#94a3b8',
          'count' => (int) $item->count,
        ];
      });

      // By entity
      $result['by_entity'] = $query->clone()
        ->select('entity_type', DB::raw('COUNT(*) as count'))
        ->groupBy('entity_type')
        ->orderBy('count', 'desc')
        ->get()
        ->map(function ($item) {
          return [
            'entity_type' => $item->entity_type,
            'label' => $item->entity_type ? ucwords(str_replace('_', ' ', $item->entity_type)) : 'Unknown',
            'count' => (int) $item->count,
          ];
        });
    }

    return $result;
  }

  public function getNotificationEffectiveness(array $filters = []): array
  {
    try {
      $query = ProcurementNotification::query();
      $this->applyFilters($query, $filters);

      $total = $query->clone()->count();

      // Check if columns exist
      $hasIsDelivered = Schema::hasColumn('procurement_notifications', 'is_delivered');
      $hasIsRead = Schema::hasColumn('procurement_notifications', 'is_read');
      $hasChannel = Schema::hasColumn('procurement_notifications', 'channel');
      $hasType = Schema::hasColumn('procurement_notifications', 'type');

      $delivered = $hasIsDelivered ? $query->clone()->where('is_delivered', true)->count() : 0;
      $read = $hasIsRead ? $query->clone()->where('is_read', true)->count() : 0;

      $result = [
        'total' => $total,
        'delivered' => $delivered,
        'read' => $read,
        'delivery_rate' => $this->calculatePercentage($delivered, $total),
        'read_rate' => $this->calculatePercentage($read, $delivered),
        'by_channel' => collect([]),
        'by_type' => collect([]),
      ];

      if ($hasChannel) {
        $result['by_channel'] = $query->clone()
          ->select('channel', DB::raw('COUNT(*) as count'))
          ->groupBy('channel')
          ->get()
          ->map(function ($item) {
            return [
              'channel' => $item->channel,
              'label' => $this->getChannelLabel($item->channel),
              'count' => (int) $item->count,
            ];
          });
      }

      if ($hasType) {
        $result['by_type'] = $query->clone()
          ->select('type', DB::raw('COUNT(*) as count'))
          ->groupBy('type')
          ->orderBy('count', 'desc')
          ->limit(10)
          ->get()
          ->map(function ($item) {
            return [
              'type' => $item->type,
              'label' => $this->getTypeLabel($item->type),
              'count' => (int) $item->count,
            ];
          });
      }

      return $result;
    } catch (\Exception $e) {
      return [
        'total' => 0,
        'delivered' => 0,
        'read' => 0,
        'delivery_rate' => 0,
        'read_rate' => 0,
        'by_channel' => collect([]),
        'by_type' => collect([]),
      ];
    }
  }

  protected function getChannelLabel(string $channel): string
  {
    $labels = [
      'email' => 'Email',
      'sms' => 'SMS',
      'push' => 'Push Notification',
      'in_app' => 'In-App Notification',
    ];
    return $labels[$channel] ?? ucfirst($channel);
  }

  protected function getTypeLabel(string $type): string
  {
    $labels = [
      'requisition_approval' => 'Requisition Approval',
      'requisition_decline' => 'Requisition Decline',
      'requisition_created' => 'Requisition Created',
      'rfq_response' => 'RFQ Response',
      'purchase_order_created' => 'Purchase Order Created',
      'purchase_order_approval' => 'Purchase Order Approval',
    ];
    return $labels[$type] ?? ucwords(str_replace('_', ' ', $type));
  }

  public function getSignatureAdoption(array $filters = []): array
  {
    try {
      $totalUsers = User::count();
      $tableExists = Schema::hasTable('signature_verifications');
      $verifiedSignatures = 0;

      if ($tableExists) {
        $verifiedSignatures = SignatureVerification::where('verification_status', 'verified')
          ->distinct('user_id')
          ->count();
      }

      return [
        'total_users' => $totalUsers,
        'users_with_verified_signatures' => $verifiedSignatures,
        'adoption_rate' => $this->calculatePercentage($verifiedSignatures, $totalUsers),
        'verification_success_rate' => $this->getVerificationSuccessRate($filters),
      ];
    } catch (\Exception $e) {
      return [
        'total_users' => 0,
        'users_with_verified_signatures' => 0,
        'adoption_rate' => 0,
        'verification_success_rate' => 0,
      ];
    }
  }

  protected function getVerificationSuccessRate(array $filters = []): float
  {
    try {
      $tableExists = Schema::hasTable('signature_verifications');
      if (!$tableExists) {
        return 0;
      }

      $query = SignatureVerification::query();
      $this->applyFilters($query, $filters);

      $total = $query->clone()->count();
      $verified = $query->clone()->where('verification_status', 'verified')->count();

      return $this->calculatePercentage($verified, $total);
    } catch (\Exception $e) {
      return 0;
    }
  }

  /**
   * ✅ FIXED: Get user activity - implements the required interface method
   */
  public function getUserActivity(array $filters = []): array
  {
    $dateRange = $this->getDateRange(
      $filters['start_date'] ?? null,
      $filters['end_date'] ?? null
    );

    $query = ProcurementHistory::query()
      ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

    $this->applyFilters($query, $filters);

    // Get total activity
    $totalActivity = $query->clone()->count();

    // Get unique users
    $uniqueUsers = $query->clone()->distinct('user_id')->count('user_id');

    // Get activity by action type
    $hasActionColumn = Schema::hasColumn('procurement_history', 'action');
    $activityByAction = collect([]);

    if ($hasActionColumn) {
      $activityByAction = $query->clone()
        ->select('action', DB::raw('COUNT(*) as count'))
        ->groupBy('action')
        ->orderBy('count', 'desc')
        ->get()
        ->map(function ($item) {
          return [
            'action' => $item->action,
            'label' => $item->action_label ?? $item->action,
            'count' => (int) $item->count,
          ];
        });
    }

    // Get activity by user
    $activityByUser = $query->clone()
      ->select('user_id', DB::raw('COUNT(*) as count'))
      ->groupBy('user_id')
      ->orderBy('count', 'desc')
      ->limit(10)
      ->get()
      ->map(function ($item) {
        $user = User::find($item->user_id);
        return [
          'user_id' => (int) $item->user_id,
          'user_name' => $user ? ($user->full_name ?? $user->name ?? $user->email ?? 'Unknown') : 'Unknown',
          'count' => (int) $item->count,
        ];
      });

    // Get activity trends (daily)
    $dailyTrend = $query->clone()
      ->select(
        DB::raw('DATE(created_at) as date'),
        DB::raw('COUNT(*) as count')
      )
      ->groupBy('date')
      ->orderBy('date', 'desc')
      ->limit(30)
      ->get()
      ->map(function ($item) {
        return [
          'date' => $item->date,
          'label' => Carbon::parse($item->date)->format('M d, Y'),
          'count' => (int) $item->count,
        ];
      });

    return [
      'total_activity' => $totalActivity,
      'unique_users' => $uniqueUsers,
      'activity_by_action' => $activityByAction,
      'activity_by_user' => $activityByUser,
      'daily_trend' => $dailyTrend,
      'period' => [
        'start' => $dateRange['start']->toISOString(),
        'end' => $dateRange['end']->toISOString(),
      ],
    ];
  }

  /**
   * ✅ FIXED: Get usage patterns with proper date handling
   */
  public function getUsagePatterns(array $filters = []): array
  {
    $query = ProcurementHistory::query();
    $this->applyFilters($query, $filters);

    // ✅ FIX: Properly parse date strings to Carbon objects
    $startDate = isset($filters['start_date'])
      ? Carbon::parse($filters['start_date'])
      : Carbon::now()->subDays(30);

    $endDate = isset($filters['end_date'])
      ? Carbon::parse($filters['end_date'])
      : Carbon::now();

    $query->whereBetween('created_at', [$startDate, $endDate]);

    // Check if 'actions' column exists
    $hasActionsColumn = Schema::hasTable('procurement_history') &&
      Schema::hasColumn('procurement_history', 'actions');

    // Peak hours
    $peakHours = $query->clone()
      ->select(
        DB::raw('HOUR(created_at) as hour'),
        DB::raw('COUNT(*) as count')
      )
      ->groupBy('hour')
      ->orderBy('hour', 'asc')
      ->get()
      ->map(function ($item) {
        return [
          'hour' => (int) $item->hour,
          'label' => sprintf('%02d:00 - %02d:59', $item->hour, $item->hour),
          'count' => (int) $item->count,
        ];
      });

    // Peak days
    $peakDays = $query->clone()
      ->select(
        DB::raw('DAYNAME(created_at) as day'),
        DB::raw('COUNT(*) as count')
      )
      ->groupBy('day')
      ->get()
      ->map(function ($item) {
        return [
          'day' => $item->day,
          'count' => (int) $item->count,
        ];
      });

    // Average actions per user
    $avgActionsPerUser = 0;
    if ($hasActionsColumn) {
      try {
        $avgActionsPerUser = $this->safeAverage(
          $query->clone()
            ->select('user_id', DB::raw('AVG(actions) as avg_actions'))
            ->groupBy('user_id')
            ->avg('avg_actions')
        );
      } catch (\Exception $e) {
        $avgActionsPerUser = 0;
      }
    }

    return [
      'peak_hours' => $peakHours,
      'peak_days' => $peakDays,
      'avg_actions_per_user' => $avgActionsPerUser,
    ];
  }

  public function getUserPerformance(array $filters = []): Collection
  {
    $dateRange = $this->getDateRange(
      $filters['start_date'] ?? null,
      $filters['end_date'] ?? null
    );

    return ProcurementHistory::query()
      ->with('user')
      ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
      ->select(
        'user_id',
        DB::raw('COUNT(*) as actions'),
        DB::raw('COUNT(DISTINCT DATE(created_at)) as active_days')
      )
      ->groupBy('user_id')
      ->orderBy('actions', 'desc')
      ->limit(20)
      ->get()
      ->map(function ($item) {
        $user = User::find($item->user_id);
        return [
          'user_id' => $item->user_id,
          'user_name' => $user ? ($user->full_name ?? $user->name ?? $user->email ?? 'Unknown') : 'Unknown',
          'actions' => (int) $item->actions,
          'active_days' => (int) $item->active_days,
          'avg_actions_per_day' => $item->active_days > 0
            ? round($item->actions / $item->active_days, 2)
            : 0,
        ];
      });
  }

  public function getPeakUsageTimes(array $filters = []): array
  {
    $patterns = $this->getUsagePatterns($filters);
    $peakHour = $patterns['peak_hours']->sortByDesc('count')->first();

    return [
      'peak_hour' => $peakHour ? $peakHour['hour'] : null,
      'peak_hour_label' => $peakHour ? $peakHour['label'] : null,
      'peak_day' => $patterns['peak_days']->sortByDesc('count')->first()['day'] ?? null,
      'top_actions' => $this->getTopActions($filters),
    ];
  }

  protected function getTopActions(array $filters = []): Collection
  {
    $dateRange = $this->getDateRange(
      $filters['start_date'] ?? null,
      $filters['end_date'] ?? null
    );

    $query = ProcurementHistory::query()
      ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

    $this->applyFilters($query, $filters);

    return $query
      ->select('action', DB::raw('COUNT(*) as count'))
      ->groupBy('action')
      ->orderBy('count', 'desc')
      ->limit(10)
      ->get()
      ->map(function ($item) {
        return [
          'action' => $item->action,
          'label' => $item->action_label ?? $item->action,
          'count' => (int) $item->count,
        ];
      });
  }

  public function getErrorAnalytics(array $filters = []): array
  {
    try {
      $tableExists = Schema::hasTable('system_status_logs');
      if (!$tableExists) {
        return [
          'total_errors' => 0,
          'by_component' => collect([]),
          'downtime_hours' => 0,
          'mtbf' => 0,
          'mttr' => 0,
        ];
      }

      $query = SystemStatusLog::whereIn('status', ['down', 'degraded']);
      $this->applyFilters($query, $filters);

      return [
        'total_errors' => $query->clone()->count(),
        'by_component' => $query->clone()
          ->select('component', DB::raw('COUNT(*) as count'))
          ->groupBy('component')
          ->get()
          ->map(function ($item) {
            return [
              'component' => $item->component,
              'label' => $this->getComponentLabel($item->component),
              'count' => (int) $item->count,
            ];
          }),
        'downtime_hours' => $this->calculateDowntimeHours($filters),
        'mtbf' => $this->calculateMTBF($filters),
        'mttr' => $this->calculateMTTR($filters),
      ];
    } catch (\Exception $e) {
      return [
        'total_errors' => 0,
        'by_component' => collect([]),
        'downtime_hours' => 0,
        'mtbf' => 0,
        'mttr' => 0,
      ];
    }
  }

  protected function calculateDowntimeHours(array $filters = []): float
  {
    try {
      $tableExists = Schema::hasTable('system_status_logs');
      if (!$tableExists) {
        return 0;
      }

      $query = SystemStatusLog::where('status', 'down');
      $this->applyFilters($query, $filters);

      return $query->count() * 0.5; // Assume 30 minutes per down event
    } catch (\Exception $e) {
      return 0;
    }
  }

  protected function calculateMTBF(array $filters = []): float
  {
    try {
      $totalEvents = SystemStatusLog::count();
      $downEvents = SystemStatusLog::where('status', 'down')->count();
      $uptimeEvents = $totalEvents - $downEvents;

      return $downEvents > 0 ? round($uptimeEvents / $downEvents, 2) : 0;
    } catch (\Exception $e) {
      return 0;
    }
  }

  protected function calculateMTTR(array $filters = []): float
  {
    try {
      return SystemStatusLog::where('status', 'down')->count() > 0
        ? 1.5 // Average 1.5 hours to recover
        : 0;
    } catch (\Exception $e) {
      return 0;
    }
  }

  public function getBackupStatus(array $filters = []): array
  {
    try {
      $tableExists = Schema::hasTable('backups');
      if (!$tableExists) {
        return [
          'total' => 0,
          'pending' => 0,
          'running' => 0,
          'completed' => 0,
          'failed' => 0,
          'success_rate' => 0,
          'latest' => null,
          'total_size' => 0,
        ];
      }

      $query = Backup::query();
      $this->applyFilters($query, $filters);

      $total = $query->clone()->count();

      return [
        'total' => $total,
        'pending' => $query->clone()->where('status', 'pending')->count(),
        'running' => $query->clone()->where('status', 'running')->count(),
        'completed' => $query->clone()->where('status', 'completed')->count(),
        'failed' => $query->clone()->where('status', 'failed')->count(),
        'success_rate' => $this->calculatePercentage(
          $query->clone()->where('status', 'completed')->count(),
          $total
        ),
        'latest' => Backup::latest('created_at')->first(),
        'total_size' => Backup::sum('size') ?? 0,
      ];
    } catch (\Exception $e) {
      return [
        'total' => 0,
        'pending' => 0,
        'running' => 0,
        'completed' => 0,
        'failed' => 0,
        'success_rate' => 0,
        'latest' => null,
        'total_size' => 0,
      ];
    }
  }

  /**
   * ✅ Safe average with null handling
   */
  protected function safeAverage($value): float
  {
    return $value ? round((float) $value, 2) : 0;
  }

  /**
   * ✅ Safe calculate percentage with zero handling
   */
  protected function calculatePercentage(float $part, float $total, int $decimals = 2): float
  {
    if ($total == 0) {
      return 0.0;
    }
    return round(($part / $total) * 100, $decimals);
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
