<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Upload extends Model
{
  use HasFactory;

  protected $fillable = [
    'uploadable_type',
    'uploadable_id',
    'file_name',
    'original_name',
    'file_path',
    'file_url',
    'file_type',
    'mime_type',
    'extension',
    'file_size',
    'width',
    'height',
    'image_orientation',
    'disk',
    'collection',
    'title',
    'description',
    'meta_data',
    'status',
    'uploaded_by',
    'uploaded_at',
  ];

  protected $casts = [
    'file_size' => 'integer',
    'width' => 'integer',
    'height' => 'integer',
    'meta_data' => 'array',
    'uploaded_at' => 'datetime',
  ];

  protected $appends = [
    'formatted_size',
    'is_image',
  ];

  /**
   * Get the parent uploadable model (polymorphic).
   */
  public function uploadable(): MorphTo
  {
    return $this->morphTo();
  }

  /**
   * Get the user who uploaded the file.
   */
  public function uploadedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'uploaded_by');
  }

  /**
   * Get formatted file size.
   */
  public function getFormattedSizeAttribute(): string
  {
    if (!$this->file_size) {
      return '0 B';
    }

    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $i = 0;
    $size = $this->file_size;

    while ($size >= 1024 && $i < count($units) - 1) {
      $size /= 1024;
      $i++;
    }

    return round($size, 2) . ' ' . $units[$i];
  }

  /**
   * Check if file is an image.
   */
  public function getIsImageAttribute(): bool
  {
    return in_array($this->file_type, ['image', 'photo']);
  }

  /**
   * Get full URL for the file.
   */
  public function getUrlAttribute(): string
  {
    return $this->file_url ?? asset('storage/' . $this->file_path);
  }

  /**
   * Scope a query to only include images.
   */
  public function scopeImages($query)
  {
    return $query->where('file_type', 'image');
  }

  /**
   * Scope a query to only include documents.
   */
  public function scopeDocuments($query)
  {
    return $query->where('file_type', 'document');
  }

  /**
   * Scope a query by collection.
   */
  public function scopeCollection($query, string $collection)
  {
    return $query->where('collection', $collection);
  }

  /**
   * Scope a query by uploadable model.
   */
  public function scopeForModel($query, $model)
  {
    return $query->where('uploadable_type', get_class($model))
      ->where('uploadable_id', $model->id);
  }
}
