<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemStatusLog extends Model
{
  use HasFactory;

  protected $table = 'system_status_logs';

  protected $fillable = [
    'status',
    'component',
    'environment',
    'message',
    'metrics',
    'details',
    'checked_at',
  ];

  protected $casts = [
    'metrics' => 'array',
    'details' => 'array',
    'checked_at' => 'datetime',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
  ];

  // Status constants
  const STATUS_OPERATIONAL = 'operational';
  const STATUS_DEGRADED = 'degraded';
  const STATUS_MAINTENANCE = 'maintenance';
  const STATUS_DOWN = 'down';

  // Component constants
  const COMPONENT_API = 'api';
  const COMPONENT_DATABASE = 'database';
  const COMPONENT_CACHE = 'cache';
  const COMPONENT_QUEUE = 'queue';
  const COMPONENT_STORAGE = 'storage';
  const COMPONENT_AUTHENTICATION = 'authentication';
  const COMPONENT_SERVICES = 'services';

  /**
   * Get status color for badges
   */
  public static function getStatusColor(string $status): string
  {
    return match ($status) {
      self::STATUS_OPERATIONAL => 'success',
      self::STATUS_DEGRADED => 'warning',
      self::STATUS_MAINTENANCE => 'info',
      self::STATUS_DOWN => 'danger',
      default => 'secondary',
    };
  }

  /**
   * Get status label
   */
  public static function getStatusLabel(string $status): string
  {
    return match ($status) {
      self::STATUS_OPERATIONAL => 'Operational',
      self::STATUS_DEGRADED => 'Degraded Performance',
      self::STATUS_MAINTENANCE => 'Under Maintenance',
      self::STATUS_DOWN => 'Down / Unavailable',
      default => ucfirst($status),
    };
  }

  /**
   * Get component label
   */
  public static function getComponentLabel(string $component): string
  {
    return match ($component) {
      self::COMPONENT_API => 'API Server',
      self::COMPONENT_DATABASE => 'Database',
      self::COMPONENT_CACHE => 'Cache Service',
      self::COMPONENT_QUEUE => 'Queue System',
      self::COMPONENT_STORAGE => 'Storage Service',
      self::COMPONENT_AUTHENTICATION => 'Authentication Service',
      self::COMPONENT_SERVICES => 'External Services',
      default => ucfirst($component),
    };
  }

  /**
   * Get component icon
   */
  public static function getComponentIcon(string $component): string
  {
    return match ($component) {
      self::COMPONENT_API => 'Server',
      self::COMPONENT_DATABASE => 'Database',
      self::COMPONENT_CACHE => 'Zap',
      self::COMPONENT_QUEUE => 'GitBranch',
      self::COMPONENT_STORAGE => 'HardDrive',
      self::COMPONENT_AUTHENTICATION => 'Lock',
      self::COMPONENT_SERVICES => 'Globe',
      default => 'Activity',
    };
  }
}
