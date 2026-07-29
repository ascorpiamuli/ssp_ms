<?php
// app/Models/GoodsReceivedItem.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceivedItem extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'goods_received_note_id',
    'purchase_order_item_id',
    'requisition_item_id',
    'item_name',
    'description',
    'unit_of_measure',
    'ordered_quantity',
    'received_quantity',
    'accepted_quantity',
    'rejected_quantity',
    'unit_price',
    'total_value',
    'rejection_reason',
    'condition_notes',
    'quality_status',
    'quality_notes',
    'batch_number',
    'serial_numbers',
    'expiry_date',
    'manufacturing_date',
    'warranty_start_date',
    'warranty_end_date',
    'storage_location',
    'bin_number',
    'rack_number',
    'is_quarantined',
    'quarantine_reason',
    'quarantine_end_date',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'ordered_quantity' => 'decimal:2',
    'received_quantity' => 'decimal:2',
    'accepted_quantity' => 'decimal:2',
    'rejected_quantity' => 'decimal:2',
    'unit_price' => 'decimal:2',
    'total_value' => 'decimal:2',
    'serial_numbers' => 'json',
    'expiry_date' => 'date',
    'manufacturing_date' => 'date',
    'warranty_start_date' => 'date',
    'warranty_end_date' => 'date',
    'quarantine_end_date' => 'date',
    'is_quarantined' => 'boolean',
    'metadata' => 'json',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'formatted_ordered_quantity',
    'formatted_received_quantity',
    'formatted_accepted_quantity',
    'formatted_rejected_quantity',
    'formatted_unit_price',
    'formatted_total_value',
    'quality_status_label',
    'quality_status_color',
    'is_quarantined_label',
    'is_fully_accepted',
    'acceptance_rate',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function goodsReceivedNote(): BelongsTo
  {
    return $this->belongsTo(GoodsReceivedNote::class, 'goods_received_note_id');
  }

  public function purchaseOrderItem(): BelongsTo
  {
    return $this->belongsTo(PurchaseOrderItem::class, 'purchase_order_item_id');
  }

  public function requisitionItem(): BelongsTo
  {
    return $this->belongsTo(RequisitionItem::class, 'requisition_item_id');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getFormattedOrderedQuantityAttribute(): string
  {
    return number_format((float) ($this->ordered_quantity ?? 0), 2);
  }

  public function getFormattedReceivedQuantityAttribute(): string
  {
    return number_format((float) ($this->received_quantity ?? 0), 2);
  }

  public function getFormattedAcceptedQuantityAttribute(): string
  {
    return number_format((float) ($this->accepted_quantity ?? 0), 2);
  }

  public function getFormattedRejectedQuantityAttribute(): string
  {
    return number_format((float) ($this->rejected_quantity ?? 0), 2);
  }

  public function getFormattedUnitPriceAttribute(): string
  {
    return number_format((float) ($this->unit_price ?? 0), 2);
  }

  public function getFormattedTotalValueAttribute(): string
  {
    return number_format((float) ($this->total_value ?? 0), 2);
  }

  public function getQualityStatusLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending Inspection',
      'passed' => 'Passed',
      'failed' => 'Failed',
      'conditional' => 'Conditional Acceptance',
    ];

    return $labels[$this->quality_status] ?? ucfirst($this->quality_status ?? 'Pending');
  }

  public function getQualityStatusColorAttribute(): string
  {
    $colors = [
      'pending' => 'warning',
      'passed' => 'success',
      'failed' => 'danger',
      'conditional' => 'info',
    ];

    return $colors[$this->quality_status] ?? 'secondary';
  }

  public function getIsQuarantinedLabelAttribute(): string
  {
    return $this->is_quarantined ? 'Yes' : 'No';
  }

  public function getIsFullyAcceptedAttribute(): bool
  {
    return (float) ($this->accepted_quantity ?? 0) >= (float) ($this->received_quantity ?? 0);
  }

  public function getAcceptanceRateAttribute(): float
  {
    $received = (float) ($this->received_quantity ?? 0);
    if ($received === 0) {
      return 0;
    }
    $accepted = (float) ($this->accepted_quantity ?? 0);
    return round(($accepted / $received) * 100, 2);
  }

  /**
   * Set item_name to proper case.
   */
  public function setItemNameAttribute(string $value): void
  {
    $this->attributes['item_name'] = ucwords(strtolower(trim($value)));
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopeByGoodsReceivedNote($query, int $goodsReceivedNoteId)
  {
    return $query->where('goods_received_note_id', $goodsReceivedNoteId);
  }

  public function scopeByPurchaseOrderItem($query, int $purchaseOrderItemId)
  {
    return $query->where('purchase_order_item_id', $purchaseOrderItemId);
  }

  public function scopeQualityPassed($query)
  {
    return $query->where('quality_status', 'passed');
  }

  public function scopeQualityFailed($query)
  {
    return $query->where('quality_status', 'failed');
  }

  public function scopeQuarantined($query)
  {
    return $query->where('is_quarantined', true);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isQualityPassed(): bool
  {
    return $this->quality_status === 'passed';
  }

  public function isQualityFailed(): bool
  {
    return $this->quality_status === 'failed';
  }

  public function isConditional(): bool
  {
    return $this->quality_status === 'conditional';
  }

  public function isQuarantined(): bool
  {
    return (bool) $this->is_quarantined;
  }

  public function isFullyAccepted(): bool
  {
    return $this->isFullyAcceptedAttribute();
  }

  public function calculateTotalValue(): self
  {
    $this->total_value = (float) $this->received_quantity * (float) $this->unit_price;
    $this->save();
    return $this;
  }

  public function markQualityPassed(?string $notes = null): self
  {
    $this->update([
      'quality_status' => 'passed',
      'quality_notes' => $notes,
    ]);
    return $this;
  }

  public function markQualityFailed(string $reason, ?string $notes = null): self
  {
    $this->update([
      'quality_status' => 'failed',
      'quality_notes' => $notes,
      'rejection_reason' => $reason,
    ]);
    return $this;
  }

  public function markQualityConditional(?string $notes = null): self
  {
    $this->update([
      'quality_status' => 'conditional',
      'quality_notes' => $notes,
    ]);
    return $this;
  }

  public function quarantine(string $reason, ?int $days = null): self
  {
    $this->update([
      'is_quarantined' => true,
      'quarantine_reason' => $reason,
      'quarantine_end_date' => $days ? now()->addDays($days) : null,
    ]);
    return $this;
  }

  public function releaseQuarantine(): self
  {
    $this->update([
      'is_quarantined' => false,
      'quarantine_end_date' => now(),
    ]);
    return $this;
  }
}
