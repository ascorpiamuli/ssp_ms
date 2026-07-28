<?php
// app/Models/RequisitionAttachment.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequisitionAttachment extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'upload_id',
    'uploaded_by',
    'parent_id',
    'file_name',
    'file_path',
    'file_type',
    'file_size',
    'mime_type',
    'file_hash',
    'category',
    'description',
    'is_required',
    'is_verified',
    'version',
    'uploaded_at',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'file_size' => 'integer',
    'version' => 'integer',
    'is_required' => 'boolean',
    'is_verified' => 'boolean',
    'uploaded_at' => 'datetime',
    'metadata' => 'json',
    'deleted_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'formatted_file_size',
    'category_label',
    'is_image',
    'file_extension',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the requisition this attachment belongs to.
   */
  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class);
  }

  /**
   * Get the upload record.
   */
  public function upload(): BelongsTo
  {
    return $this->belongsTo(Upload::class);
  }

  /**
   * Get the user who uploaded this attachment.
   */
  public function uploadedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'uploaded_by');
  }

  /**
   * Get the parent attachment.
   */
  public function parent(): BelongsTo
  {
    return $this->belongsTo(RequisitionAttachment::class, 'parent_id');
  }

  /**
   * Get the child attachments.
   */
  public function children(): HasMany
  {
    return $this->hasMany(RequisitionAttachment::class, 'parent_id');
  }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

  /**
   * Get formatted file size.
   */
  public function getFormattedFileSizeAttribute(): string
  {
    $bytes = $this->file_size;
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];

    for ($i = 0; $bytes > 1024; $i++) {
      $bytes /= 1024;
    }

    return round($bytes, 2) . ' ' . $units[$i] ?? 'B';
  }

  /**
   * Get category label.
   */
  public function getCategoryLabelAttribute(): string
  {
    $labels = [
      'quotation' => 'Quotation',
      'specification' => 'Specification',
      'justification' => 'Justification',
      'approval_document' => 'Approval Document',
      'budget_document' => 'Budget Document',
      'invoice' => 'Invoice',
      'receipt' => 'Receipt',
      'contract' => 'Contract',
      'other' => 'Other',
    ];

    return $labels[$this->category] ?? ucfirst($this->category);
  }

  /**
   * Check if file is an image.
   */
  public function getIsImageAttribute(): bool
  {
    return in_array($this->mime_type, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
  }

  /**
   * Get file extension.
   */
  public function getFileExtensionAttribute(): string
  {
    return pathinfo($this->file_name, PATHINFO_EXTENSION);
  }

  /**
   * Set file name.
   */
  public function setFileNameAttribute(string $value): void
  {
    $this->attributes['file_name'] = preg_replace('/[^a-zA-Z0-9._-]/', '_', $value);
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope by category.
   */
  public function scopeByCategory($query, string $category)
  {
    return $query->where('category', $category);
  }

  /**
   * Scope for verified attachments.
   */
  public function scopeVerified($query)
  {
    return $query->where('is_verified', true);
  }

  /**
   * Scope for required attachments.
   */
  public function scopeRequired($query)
  {
    return $query->where('is_required', true);
  }

  /**
   * Scope for images.
   */
  public function scopeImages($query)
  {
    return $query->whereIn('mime_type', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Get full URL of attachment.
   */
  public function getUrl(): string
  {
    return asset('storage/' . $this->file_path);
  }

  /**
   * Check if file exists.
   */
  public function fileExists(): bool
  {
    return file_exists(storage_path('app/public/' . $this->file_path));
  }

  /**
   * Delete the file from storage.
   */
  public function deleteFile(): bool
  {
    if ($this->fileExists()) {
      return unlink(storage_path('app/public/' . $this->file_path));
    }
    return false;
  }
}
