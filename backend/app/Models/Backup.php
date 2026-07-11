<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Backup extends Model
{
  use HasFactory;

  protected $table = 'backups';

  protected $fillable = [
    'name',
    'file_name',
    'disk',
    'path',
    'size',
    'status',
    'type',
    'metadata',
    'error_message',
    'completed_at',
    'created_by',
  ];

  protected $casts = [
    'metadata' => 'array',
    'size' => 'integer',
    'completed_at' => 'datetime',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
  ];

  // Status constants
  const STATUS_PENDING = 'pending';
  const STATUS_RUNNING = 'running';
  const STATUS_COMPLETED = 'completed';
  const STATUS_FAILED = 'failed';

  // Type constants
  const TYPE_MANUAL = 'manual';
  const TYPE_SCHEDULED = 'scheduled';
  const TYPE_AUTO = 'auto';

  public function creator(): BelongsTo
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  public function getFormattedSizeAttribute(): string
  {
    $bytes = $this->size;
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];

    for ($i = 0; $bytes > 1024; $i++) {
      $bytes /= 1024;
    }

    return round($bytes, 2) . ' ' . $units[$i];
  }

  public function getStatusColorAttribute(): string
  {
    return match ($this->status) {
      self::STATUS_PENDING => 'warning',
      self::STATUS_RUNNING => 'info',
      self::STATUS_COMPLETED => 'success',
      self::STATUS_FAILED => 'danger',
      default => 'secondary',
    };
  }

  public function getStatusLabelAttribute(): string
  {
    return match ($this->status) {
      self::STATUS_PENDING => 'Pending',
      self::STATUS_RUNNING => 'Running',
      self::STATUS_COMPLETED => 'Completed',
      self::STATUS_FAILED => 'Failed',
      default => ucfirst($this->status),
    };
  }

  public function getTypeLabelAttribute(): string
  {
    return match ($this->type) {
      self::TYPE_MANUAL => 'Manual',
      self::TYPE_SCHEDULED => 'Scheduled',
      self::TYPE_AUTO => 'Auto',
      default => ucfirst($this->type),
    };
  }

  public function scopePending($query)
  {
    return $query->where('status', self::STATUS_PENDING);
  }

  public function scopeRunning($query)
  {
    return $query->where('status', self::STATUS_RUNNING);
  }

  public function scopeCompleted($query)
  {
    return $query->where('status', self::STATUS_COMPLETED);
  }

  public function scopeFailed($query)
  {
    return $query->where('status', self::STATUS_FAILED);
  }

  public function scopeManual($query)
  {
    return $query->where('type', self::TYPE_MANUAL);
  }

  public function scopeScheduled($query)
  {
    return $query->where('type', self::TYPE_SCHEDULED);
  }
}
