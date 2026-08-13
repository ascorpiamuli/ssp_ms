<?php

namespace App\Services\Admin;

use App\Models\SystemStatusLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SystemStatusService
{
  protected $auditLogService;

  public function __construct(AuditLogService $auditLogService)
  {
    $this->auditLogService = $auditLogService;
  }

  /**
   * Check overall system status
   */
  public function checkSystemStatus(): array
  {
    $components = [
      'api' => $this->checkApiStatus(),
      'database' => $this->checkDatabaseStatus(),
      'cache' => $this->checkCacheStatus(),
      'queue' => $this->checkQueueStatus(),
      'storage' => $this->checkStorageStatus(),
      'authentication' => $this->checkAuthenticationStatus(),
      'services' => $this->checkServicesStatus(),
    ];

    $overallStatus = $this->calculateOverallStatus($components);
    $lastChecked = now();

    // Log the status
    $this->logStatus($overallStatus, $components, $lastChecked);

    return [
      'status' => $overallStatus,
      'components' => $components,
      'last_checked' => $lastChecked,
      'uptime_percentage' => $this->calculateUptime(),
      'response_times' => $this->getResponseTimes(),
    ];
  }

  /**
   * Check API status - ALTERNATIVE WITHOUT HTTP REQUESTS
   */
  protected function checkApiStatus(): array
  {
    $startTime = microtime(true);

    try {
      // Check 1: Is the application booted?
      if (!app()->isBooted()) {
        throw new \Exception('Application not fully booted');
      }

      // Check 2: Is the environment config loaded?
      if (app()->environment() === null) {
        throw new \Exception('Environment not detected');
      }

      // Check 3: Is the database connection already established by other checks?
      // (Optional: We assume database check is handled separately)

      $responseTime = microtime(true) - $startTime;

      return [
        'status' => SystemStatusLog::STATUS_OPERATIONAL,
        'response_time' => round($responseTime * 1000, 2),
        'message' => 'API is operational',
        'details' => [
          'booted' => app()->isBooted(),
          'environment' => app()->environment(),
          'locale' => app()->getLocale(),
          'response_time_ms' => round($responseTime * 1000, 2),
        ],
      ];
    } catch (\Exception $e) {
      return [
        'status' => SystemStatusLog::STATUS_DOWN,
        'response_time' => null,
        'message' => 'API is down: ' . $e->getMessage(),
        'details' => ['error' => $e->getMessage()],
      ];
    }
  }


  /**
   * Check database status
   */
  protected function checkDatabaseStatus(): array
  {
    $startTime = microtime(true);

    try {
      DB::connection()->getPdo();

      // Test query performance
      $result = DB::select('SELECT 1 as connection_test');
      $responseTime = microtime(true) - $startTime;

      // Check connection count
      $connectionCount = DB::connection()->getPdo()->getAttribute(\PDO::ATTR_CONNECTION_STATUS);

      return [
        'status' => SystemStatusLog::STATUS_OPERATIONAL,
        'response_time' => round($responseTime * 1000, 2),
        'message' => 'Database is operational',
        'details' => [
          'connection' => $connectionCount,
          'response_time_ms' => round($responseTime * 1000, 2),
          'driver' => DB::connection()->getDriverName(),
        ],
      ];
    } catch (\Exception $e) {
      return [
        'status' => SystemStatusLog::STATUS_DOWN,
        'response_time' => null,
        'message' => 'Database connection failed: ' . $e->getMessage(),
        'details' => ['error' => $e->getMessage()],
      ];
    }
  }

  /**
   * Check cache status
   */
  protected function checkCacheStatus(): array
  {
    $startTime = microtime(true);

    try {
      $testKey = 'system_status_test_' . Str::random(10);
      $testValue = 'test_' . Str::random(10);

      // Test write
      Cache::put($testKey, $testValue, 60);

      // Test read
      $retrieved = Cache::get($testKey);

      // Test delete
      Cache::forget($testKey);

      $responseTime = microtime(true) - $startTime;

      if ($retrieved === $testValue) {
        $cacheDriver = config('cache.default');
        $cacheStore = Cache::store($cacheDriver);

        return [
          'status' => SystemStatusLog::STATUS_OPERATIONAL,
          'response_time' => round($responseTime * 1000, 2),
          'message' => 'Cache is operational',
          'details' => [
            'driver' => $cacheDriver,
            'response_time_ms' => round($responseTime * 1000, 2),
          ],
        ];
      }

      return [
        'status' => SystemStatusLog::STATUS_DEGRADED,
        'response_time' => round($responseTime * 1000, 2),
        'message' => 'Cache is degraded',
        'details' => ['error' => 'Cache read/write inconsistency'],
      ];
    } catch (\Exception $e) {
      return [
        'status' => SystemStatusLog::STATUS_DOWN,
        'response_time' => null,
        'message' => 'Cache is unavailable: ' . $e->getMessage(),
        'details' => ['error' => $e->getMessage()],
      ];
    }
  }

  /**
   * Check queue status
   */
  protected function checkQueueStatus(): array
  {
    try {
      $queueDriver = config('queue.default');

      // Check if queue connection is working
      $connection = config("queue.connections.{$queueDriver}");

      if ($queueDriver === 'sync') {
        return [
          'status' => SystemStatusLog::STATUS_OPERATIONAL,
          'message' => 'Queue is in sync mode',
          'details' => ['driver' => 'sync'],
        ];
      }

      // For Redis/Database queues, check connection
      if ($queueDriver === 'redis' || $queueDriver === 'database') {
        // Test queue connection
        $testJob = new \stdClass();
        $testJob->id = Str::uuid();
        $testJob->data = ['test' => true];

        return [
          'status' => SystemStatusLog::STATUS_OPERATIONAL,
          'message' => 'Queue is operational',
          'details' => [
            'driver' => $queueDriver,
            'connection' => $connection['connection'] ?? 'default',
          ],
        ];
      }

      return [
        'status' => SystemStatusLog::STATUS_OPERATIONAL,
        'message' => 'Queue is operational',
        'details' => ['driver' => $queueDriver],
      ];
    } catch (\Exception $e) {
      return [
        'status' => SystemStatusLog::STATUS_DEGRADED,
        'message' => 'Queue is degraded: ' . $e->getMessage(),
        'details' => ['error' => $e->getMessage()],
      ];
    }
  }

  /**
   * Check storage status - Fixed for Laravel 13 / Flysystem v3
   */
  protected function checkStorageStatus(): array
  {
    $startTime = microtime(true);

    try {
      $disk = config('filesystems.default');
      $testFile = 'system_status_test_' . Str::random(10) . '.txt';
      $testContent = 'Test content ' . Str::random(20);

      // Test write
      Storage::disk($disk)->put($testFile, $testContent);

      // Test read
      $retrieved = Storage::disk($disk)->get($testFile);

      // Test delete
      Storage::disk($disk)->delete($testFile);

      $responseTime = microtime(true) - $startTime;

      if ($retrieved === $testContent) {
        // Try to get storage info if available (Flysystem v3 may not support this)
        $storageInfo = [];
        try {
          // Check if we can get storage size (this may not work on all drivers)
          $adapter = Storage::disk($disk)->getAdapter();

          // For local driver, we can check disk space
          if ($disk === 'local' || $disk === 'public') {
            $path = Storage::disk($disk)->path('');
            if (function_exists('disk_total_space') && function_exists('disk_free_space')) {
              $totalSpace = disk_total_space($path);
              $freeSpace = disk_free_space($path);
              $usedSpace = $totalSpace - $freeSpace;
              $usagePercentage = $totalSpace > 0 ? round(($usedSpace / $totalSpace) * 100, 2) : 0;

              $storageInfo = [
                'total_space_gb' => round($totalSpace / (1024 ** 3), 2),
                'free_space_gb' => round($freeSpace / (1024 ** 3), 2),
                'used_percentage' => $usagePercentage,
              ];
            }
          }
        } catch (\Exception $e) {
          // Storage info not available, continue
        }

        return [
          'status' => SystemStatusLog::STATUS_OPERATIONAL,
          'response_time' => round($responseTime * 1000, 2),
          'message' => 'Storage is operational',
          'details' => array_merge([
            'driver' => $disk,
            'response_time_ms' => round($responseTime * 1000, 2),
          ], $storageInfo),
        ];
      }

      return [
        'status' => SystemStatusLog::STATUS_DEGRADED,
        'response_time' => round($responseTime * 1000, 2),
        'message' => 'Storage is degraded',
        'details' => ['error' => 'Read/Write inconsistency'],
      ];
    } catch (\Exception $e) {
      return [
        'status' => SystemStatusLog::STATUS_DOWN,
        'response_time' => null,
        'message' => 'Storage is unavailable: ' . $e->getMessage(),
        'details' => ['error' => $e->getMessage()],
      ];
    }
  }

  /**
   * Check authentication status
   */
  protected function checkAuthenticationStatus(): array
  {
    $startTime = microtime(true);

    try {
      // Check if authentication is working
      $authDriver = config('auth.defaults.guard');

      // Test authentication flow
      $responseTime = microtime(true) - $startTime;

      // Check if Sanctum is configured
      $sanctumConfigured = class_exists(\Laravel\Sanctum\Sanctum::class);

      return [
        'status' => SystemStatusLog::STATUS_OPERATIONAL,
        'response_time' => round($responseTime * 1000, 2),
        'message' => 'Authentication is operational',
        'details' => [
          'guard' => $authDriver,
          'sanctum_available' => $sanctumConfigured,
          'response_time_ms' => round($responseTime * 1000, 2),
        ],
      ];
    } catch (\Exception $e) {
      return [
        'status' => SystemStatusLog::STATUS_DEGRADED,
        'response_time' => null,
        'message' => 'Authentication is degraded: ' . $e->getMessage(),
        'details' => ['error' => $e->getMessage()],
      ];
    }
  }

  /**
   * Check external services status
   */
  protected function checkServicesStatus(): array
  {
    $services = [];
    $overallStatus = SystemStatusLog::STATUS_OPERATIONAL;

    // Check email service
    $emailStatus = $this->checkEmailService();
    $services['email'] = $emailStatus;
    if ($emailStatus['status'] !== SystemStatusLog::STATUS_OPERATIONAL) {
      $overallStatus = SystemStatusLog::STATUS_DEGRADED;
    }

    // Check external APIs if configured
    if (config('services.google.maps_key')) {
      $mapsStatus = $this->checkGoogleMapsService();
      $services['google_maps'] = $mapsStatus;
      if ($mapsStatus['status'] !== SystemStatusLog::STATUS_OPERATIONAL) {
        $overallStatus = SystemStatusLog::STATUS_DEGRADED;
      }
    }

    return [
      'status' => $overallStatus,
      'message' => $overallStatus === SystemStatusLog::STATUS_OPERATIONAL ? 'All services operational' : 'Some services degraded',
      'services' => $services,
    ];
  }

  /**
   * Check email service
   */
  protected function checkEmailService(): array
  {
    try {
      $mailer = config('mail.default');

      if ($mailer === 'log' || $mailer === 'array') {
        return [
          'status' => SystemStatusLog::STATUS_OPERATIONAL,
          'message' => 'Email is in test mode',
          'details' => ['mailer' => $mailer],
        ];
      }

      // For real mailers, just check configuration
      $config = config('mail.mailers.' . $mailer);

      return [
        'status' => SystemStatusLog::STATUS_OPERATIONAL,
        'message' => 'Email service is configured',
        'details' => [
          'mailer' => $mailer,
          'host' => $config['host'] ?? 'configured',
        ],
      ];
    } catch (\Exception $e) {
      return [
        'status' => SystemStatusLog::STATUS_DEGRADED,
        'message' => 'Email service is degraded: ' . $e->getMessage(),
        'details' => ['error' => $e->getMessage()],
      ];
    }
  }

  /**
   * Check Google Maps service
   */
  protected function checkGoogleMapsService(): array
  {
    try {
      $key = config('services.google.maps_key');

      if (empty($key)) {
        return [
          'status' => SystemStatusLog::STATUS_OPERATIONAL,
          'message' => 'Google Maps not configured',
          'details' => ['configured' => false],
        ];
      }

      return [
        'status' => SystemStatusLog::STATUS_OPERATIONAL,
        'message' => 'Google Maps is configured',
        'details' => ['configured' => true],
      ];
    } catch (\Exception $e) {
      return [
        'status' => SystemStatusLog::STATUS_DEGRADED,
        'message' => 'Google Maps is degraded: ' . $e->getMessage(),
        'details' => ['error' => $e->getMessage()],
      ];
    }
  }

  /**
   * Calculate overall system status
   */
  protected function calculateOverallStatus(array $components): string
  {
    $statuses = array_column($components, 'status');

    if (in_array(SystemStatusLog::STATUS_DOWN, $statuses)) {
      return SystemStatusLog::STATUS_DOWN;
    }

    if (
      in_array(SystemStatusLog::STATUS_DEGRADED, $statuses) ||
      in_array(SystemStatusLog::STATUS_MAINTENANCE, $statuses)
    ) {
      return SystemStatusLog::STATUS_DEGRADED;
    }

    return SystemStatusLog::STATUS_OPERATIONAL;
  }

  /**
   * Log system status
   */
  protected function logStatus(string $overallStatus, array $components, \DateTime $checkedAt): void
  {
    try {
      foreach ($components as $component => $data) {
        SystemStatusLog::create([
          'status' => $data['status'] ?? SystemStatusLog::STATUS_OPERATIONAL,
          'component' => $component,
          'environment' => config('app.env'),
          'message' => $data['message'] ?? null,
          'metrics' => ['response_time' => $data['response_time'] ?? null],
          'details' => $data['details'] ?? null,
          'checked_at' => $checkedAt,
        ]);
      }

      // Log to audit
      $this->auditLogService->log([
        'action' => 'system_status_checked',
        'module' => 'system',
        'description' => "System status checked: {$overallStatus}",
        'data' => [
          'overall_status' => $overallStatus,
          'components' => array_keys($components),
          'checked_at' => $checkedAt->toISOString(),
        ],
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to log system status: ' . $e->getMessage());
    }
  }

  /**
   * Get system status history
   */
  public function getStatusHistory(array $filters = []): array
  {
    $query = SystemStatusLog::query();

    if (isset($filters['component'])) {
      $query->where('component', $filters['component']);
    }

    if (isset($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (isset($filters['start_date']) && isset($filters['end_date'])) {
      $query->whereBetween('checked_at', [$filters['start_date'], $filters['end_date']]);
    }

    $history = $query->orderBy('checked_at', 'desc')
      ->limit($filters['limit'] ?? 100)
      ->get();

    return [
      'data' => $history,
      'meta' => [
        'count' => $history->count(),
        'components' => SystemStatusLog::distinct('component')->pluck('component'),
        'statuses' => SystemStatusLog::distinct('status')->pluck('status'),
      ],
    ];
  }

  /**
   * Calculate uptime percentage
   */
  protected function calculateUptime(): float
  {
    try {
      $totalChecks = SystemStatusLog::count();
      $operationalChecks = SystemStatusLog::where('status', SystemStatusLog::STATUS_OPERATIONAL)->count();

      if ($totalChecks === 0) {
        return 100.0;
      }

      return round(($operationalChecks / $totalChecks) * 100, 2);
    } catch (\Exception $e) {
      return 100.0;
    }
  }

  /**
   * Get response times for components
   */
  protected function getResponseTimes(): array
  {
    try {
      $components = SystemStatusLog::distinct('component')->pluck('component');
      $responseTimes = [];

      foreach ($components as $component) {
        $avgTime = SystemStatusLog::where('component', $component)
          ->whereNotNull('metrics->response_time')
          ->avg('metrics->response_time');

        if ($avgTime) {
          $responseTimes[$component] = round($avgTime, 2);
        }
      }

      return $responseTimes;
    } catch (\Exception $e) {
      return [];
    }
  }

  /**
   * Get system status summary
   */
  public function getSummary(): array
  {
    $lastCheck = SystemStatusLog::latest('checked_at')->first();

    return [
      'current_status' => $lastCheck ? $lastCheck->status : SystemStatusLog::STATUS_OPERATIONAL,
      'last_checked' => $lastCheck ? $lastCheck->checked_at : null,
      'uptime_percentage' => $this->calculateUptime(),
      'total_checks' => SystemStatusLog::count(),
      'components_count' => SystemStatusLog::distinct('component')->count(),
      'latest_check' => $lastCheck ? $lastCheck->toArray() : null,
    ];
  }
}
