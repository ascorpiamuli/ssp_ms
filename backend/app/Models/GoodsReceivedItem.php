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
    'is_custom_item',
    'source',
    'source_color',
    'department_id',
    'department_name',
    'department_code',
    'requisition_title',
    'requisition_reference',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  /**
   * Get the Goods Received Note that owns this item.
   */
  public function goodsReceivedNote(): BelongsTo
  {
    return $this->belongsTo(GoodsReceivedNote::class, 'goods_received_note_id');
  }

  /**
   * Get the Purchase Order Item that this item is associated with.
   */
  public function purchaseOrderItem(): BelongsTo
  {
    return $this->belongsTo(PurchaseOrderItem::class, 'purchase_order_item_id');
  }

  /**
   * Get the Requisition Item that this item is associated with.
   * Can be null for custom supplier items.
   */
  public function requisitionItem(): BelongsTo
  {
    return $this->belongsTo(RequisitionItem::class, 'requisition_item_id');
  }

  /**
   * ✅ Get the requisition through the goods received note.
   * This provides access to requisition data including department info.
   */
  public function requisition()
  {
    return $this->hasOneThrough(
      Requisition::class,
      GoodsReceivedNote::class,
      'id', // Foreign key on goods_received_notes table
      'id', // Foreign key on requisitions table
      'goods_received_note_id', // Local key on goods_received_items table
      'requisition_id' // Local key on goods_received_notes table
    );
  }

  /**
   * ✅ Get the department through the requisition.
   * This provides direct access to department info.
   */
  public function department()
  {
    return $this->hasOneThrough(
      Department::class,
      Requisition::class,
      'id', // Foreign key on requisitions table
      'id', // Foreign key on departments table
      'goods_received_note_id', // Local key on goods_received_items table
      'department_id' // Local key on requisitions table
    );
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  /**
   * ✅ Check if this is a custom item added by supplier (not from requisition)
   */
  public function getIsCustomItemAttribute(): bool
  {
    return is_null($this->requisition_item_id);
  }

  /**
   * ✅ Get the source of the item (Requisition or Custom)
   */
  public function getSourceAttribute(): string
  {
    return $this->isCustomItem() ? 'Custom (Supplier Added)' : 'From Requisition';
  }

  /**
   * ✅ Get source badge color
   */
  public function getSourceColorAttribute(): string
  {
    return $this->isCustomItem() ? 'warning' : 'success';
  }

  /**
   * ✅ Get department ID through the requisition
   */
  public function getDepartmentIdAttribute(): ?int
  {
    // Try through requisition relationship
    if ($this->relationLoaded('requisition')) {
      return $this->requisition?->department_id;
    }

    // Try through goods received note -> requisition
    if (
      $this->relationLoaded('goodsReceivedNote') &&
      $this->goodsReceivedNote->relationLoaded('requisition')
    ) {
      return $this->goodsReceivedNote->requisition?->department_id;
    }

    // Fallback: load the relation
    $requisition = $this->requisition;
    return $requisition?->department_id;
  }

  /**
   * ✅ Get department name through the requisition
   */
  public function getDepartmentNameAttribute(): ?string
  {
    // Try through department relationship
    if ($this->relationLoaded('department')) {
      return $this->department?->name;
    }

    // Try through requisition -> department
    if (
      $this->relationLoaded('requisition') &&
      $this->requisition->relationLoaded('department')
    ) {
      return $this->requisition->department?->name;
    }

    // Try through goods received note -> requisition -> department
    if (
      $this->relationLoaded('goodsReceivedNote') &&
      $this->goodsReceivedNote->relationLoaded('requisition') &&
      $this->goodsReceivedNote->requisition->relationLoaded('department')
    ) {
      return $this->goodsReceivedNote->requisition->department?->name;
    }

    // Fallback: load the department relation
    $department = $this->department;
    return $department?->name;
  }

  /**
   * ✅ Get department code through the requisition
   */
  public function getDepartmentCodeAttribute(): ?string
  {
    $department = $this->department;
    return $department?->code;
  }

  /**
   * ✅ Get requisition title
   */
  public function getRequisitionTitleAttribute(): ?string
  {
    $requisition = $this->requisition;
    return $requisition?->title;
  }

  /**
   * ✅ Get requisition reference number
   */
  public function getRequisitionReferenceAttribute(): ?string
  {
    $requisition = $this->requisition;
    return $requisition?->reference_number;
  }

  /**
   * ✅ Get item name in uppercase when accessed
   */
  public function getItemNameAttribute(?string $value): string
  {
    return $value ? strtoupper($value) : '';
  }

  /**
   * ✅ Set item name to uppercase when saved
   */
  public function setItemNameAttribute(?string $value): void
  {
    $this->attributes['item_name'] = $value ? strtoupper(trim($value)) : null;
  }

  /**
   * ✅ Get description in proper case when accessed
   */
  public function getDescriptionAttribute(?string $value): ?string
  {
    return $value;
  }

  /**
   * ✅ Set description with proper formatting
   */
  public function setDescriptionAttribute(?string $value): void
  {
    $this->attributes['description'] = $value ? trim($value) : null;
  }

  /**
   * ✅ Get unit of measure in uppercase when accessed
   */
  public function getUnitOfMeasureAttribute(?string $value): string
  {
    return $value ? strtoupper($value) : '';
  }

  /**
   * ✅ Set unit of measure to uppercase when saved
   */
  public function setUnitOfMeasureAttribute(?string $value): void
  {
    $this->attributes['unit_of_measure'] = $value ? strtoupper(trim($value)) : null;
  }

  /**
   * ✅ Get rejection reason with proper case when accessed
   */
  public function getRejectionReasonAttribute(?string $value): ?string
  {
    return $value;
  }

  /**
   * ✅ Set rejection reason with proper formatting
   */
  public function setRejectionReasonAttribute(?string $value): void
  {
    $this->attributes['rejection_reason'] = $value ? trim($value) : null;
  }

  /**
   * ✅ Get condition notes with proper case when accessed
   */
  public function getConditionNotesAttribute(?string $value): ?string
  {
    return $value;
  }

  /**
   * ✅ Set condition notes with proper formatting
   */
  public function setConditionNotesAttribute(?string $value): void
  {
    $this->attributes['condition_notes'] = $value ? trim($value) : null;
  }

  /**
   * ✅ Get quality notes with proper case when accessed
   */
  public function getQualityNotesAttribute(?string $value): ?string
  {
    return $value;
  }

  /**
   * ✅ Set quality notes with proper formatting
   */
  public function setQualityNotesAttribute(?string $value): void
  {
    $this->attributes['quality_notes'] = $value ? trim($value) : null;
  }

  /**
   * ✅ Get batch number in uppercase when accessed
   */
  public function getBatchNumberAttribute(?string $value): string
  {
    return $value ? strtoupper($value) : '';
  }

  /**
   * ✅ Set batch number to uppercase when saved
   */
  public function setBatchNumberAttribute(?string $value): void
  {
    $this->attributes['batch_number'] = $value ? strtoupper(trim($value)) : null;
  }

  /**
   * ✅ Get storage location in uppercase when accessed
   */
  public function getStorageLocationAttribute(?string $value): string
  {
    return $value ? strtoupper($value) : '';
  }

  /**
   * ✅ Set storage location to uppercase when saved
   */
  public function setStorageLocationAttribute(?string $value): void
  {
    $this->attributes['storage_location'] = $value ? strtoupper(trim($value)) : null;
  }

  /**
   * ✅ Get bin number in uppercase when accessed
   */
  public function getBinNumberAttribute(?string $value): string
  {
    return $value ? strtoupper($value) : '';
  }

  /**
   * ✅ Set bin number to uppercase when saved
   */
  public function setBinNumberAttribute(?string $value): void
  {
    $this->attributes['bin_number'] = $value ? strtoupper(trim($value)) : null;
  }

  /**
   * ✅ Get rack number in uppercase when accessed
   */
  public function getRackNumberAttribute(?string $value): string
  {
    return $value ? strtoupper($value) : '';
  }

  /**
   * ✅ Set rack number to uppercase when saved
   */
  public function setRackNumberAttribute(?string $value): void
  {
    $this->attributes['rack_number'] = $value ? strtoupper(trim($value)) : null;
  }

  /**
   * ✅ Get quarantine reason with proper case when accessed
   */
  public function getQuarantineReasonAttribute(?string $value): ?string
  {
    return $value;
  }

  /**
   * ✅ Set quarantine reason with proper formatting
   */
  public function setQuarantineReasonAttribute(?string $value): void
  {
    $this->attributes['quarantine_reason'] = $value ? trim($value) : null;
  }

  /**
   * ✅ Format ordered quantity
   */
  public function getFormattedOrderedQuantityAttribute(): string
  {
    return number_format((float) ($this->ordered_quantity ?? 0), 2);
  }

  /**
   * ✅ Format received quantity
   */
  public function getFormattedReceivedQuantityAttribute(): string
  {
    return number_format((float) ($this->received_quantity ?? 0), 2);
  }

  /**
   * ✅ Format accepted quantity
   */
  public function getFormattedAcceptedQuantityAttribute(): string
  {
    return number_format((float) ($this->accepted_quantity ?? 0), 2);
  }

  /**
   * ✅ Format rejected quantity
   */
  public function getFormattedRejectedQuantityAttribute(): string
  {
    return number_format((float) ($this->rejected_quantity ?? 0), 2);
  }

  /**
   * ✅ Format unit price
   */
  public function getFormattedUnitPriceAttribute(): string
  {
    return number_format((float) ($this->unit_price ?? 0), 2);
  }

  /**
   * ✅ Format total value
   */
  public function getFormattedTotalValueAttribute(): string
  {
    return number_format((float) ($this->total_value ?? 0), 2);
  }

  /**
   * ✅ Get quality status label
   */
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

  /**
   * ✅ Get quality status color
   */
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

  /**
   * ✅ Get quarantined label
   */
  public function getIsQuarantinedLabelAttribute(): string
  {
    return $this->is_quarantined ? 'Yes' : 'No';
  }

  /**
   * ✅ Check if item is fully accepted
   */
  public function getIsFullyAcceptedAttribute(): bool
  {
    return (float) ($this->accepted_quantity ?? 0) >= (float) ($this->received_quantity ?? 0);
  }

  /**
   * ✅ Get acceptance rate
   */
  public function getAcceptanceRateAttribute(): float
  {
    $received = (float) ($this->received_quantity ?? 0);
    if ($received === 0) {
      return 0;
    }
    $accepted = (float) ($this->accepted_quantity ?? 0);
    return round(($accepted / $received) * 100, 2);
  }

  // ============================================
  // SCOPES
  // ============================================

  /**
   * ✅ Scope for items that came from requisition (not custom)
   */
  public function scopeFromRequisition($query)
  {
    return $query->whereNotNull('requisition_item_id');
  }

  /**
   * ✅ Scope for custom items (added by supplier, not in requisition)
   */
  public function scopeCustomItems($query)
  {
    return $query->whereNull('requisition_item_id');
  }

  /**
   * ✅ Scope by goods received note ID
   */
  public function scopeByGoodsReceivedNote($query, int $goodsReceivedNoteId)
  {
    return $query->where('goods_received_note_id', $goodsReceivedNoteId);
  }

  /**
   * ✅ Scope by purchase order item ID
   */
  public function scopeByPurchaseOrderItem($query, int $purchaseOrderItemId)
  {
    return $query->where('purchase_order_item_id', $purchaseOrderItemId);
  }

  /**
   * ✅ Scope by department ID (through requisition)
   */
  public function scopeByDepartment($query, int $departmentId)
  {
    return $query->whereHas('goodsReceivedNote.requisition', function ($q) use ($departmentId) {
      $q->where('department_id', $departmentId);
    });
  }

  /**
   * ✅ Scope for quality passed items
   */
  public function scopeQualityPassed($query)
  {
    return $query->where('quality_status', 'passed');
  }

  /**
   * ✅ Scope for quality failed items
   */
  public function scopeQualityFailed($query)
  {
    return $query->where('quality_status', 'failed');
  }

  /**
   * ✅ Scope for quarantined items
   */
  public function scopeQuarantined($query)
  {
    return $query->where('is_quarantined', true);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * ✅ Check if item is from requisition
   */
  public function isFromRequisition(): bool
  {
    return !is_null($this->requisition_item_id);
  }

  /**
   * ✅ Check if item is custom (added by supplier)
   */
  public function isCustomItem(): bool
  {
    return is_null($this->requisition_item_id);
  }

  /**
   * ✅ Check if quality passed
   */
  public function isQualityPassed(): bool
  {
    return $this->quality_status === 'passed';
  }

  /**
   * ✅ Check if quality failed
   */
  public function isQualityFailed(): bool
  {
    return $this->quality_status === 'failed';
  }

  /**
   * ✅ Check if conditional
   */
  public function isConditional(): bool
  {
    return $this->quality_status === 'conditional';
  }

  /**
   * ✅ Check if quarantined
   */
  public function isQuarantined(): bool
  {
    return (bool) $this->is_quarantined;
  }

  /**
   * ✅ Check if fully accepted
   */
  public function isFullyAccepted(): bool
  {
    return $this->isFullyAcceptedAttribute();
  }

  /**
   * ✅ Get the department info as an array
   */
  public function getDepartmentInfo(): ?array
  {
    $department = $this->department;
    if (!$department) {
      return null;
    }

    return [
      'id' => $department->id,
      'name' => $department->name,
      'code' => $department->code,
      'description' => $department->description,
      'is_active' => $department->is_active,
      'hod_id' => $department->hod_id,
    ];
  }

  /**
   * ✅ Get the requisition info as an array
   */
  public function getRequisitionInfo(): ?array
  {
    $requisition = $this->requisition;
    if (!$requisition) {
      return null;
    }

    return [
      'id' => $requisition->id,
      'reference_number' => $requisition->reference_number,
      'title' => $requisition->title,
      'department_id' => $requisition->department_id,
      'department' => $this->getDepartmentInfo(),
    ];
  }

  /**
   * ✅ Calculate total value
   */
  public function calculateTotalValue(): self
  {
    $this->total_value = (float) $this->received_quantity * (float) $this->unit_price;
    $this->save();
    return $this;
  }

  /**
   * ✅ Mark quality as passed
   */
  public function markQualityPassed(?string $notes = null): self
  {
    $this->update([
      'quality_status' => 'passed',
      'quality_notes' => $notes,
    ]);
    return $this;
  }

  /**
   * ✅ Mark quality as failed
   */
  public function markQualityFailed(string $reason, ?string $notes = null): self
  {
    $this->update([
      'quality_status' => 'failed',
      'quality_notes' => $notes,
      'rejection_reason' => $reason,
    ]);
    return $this;
  }

  /**
   * ✅ Mark quality as conditional
   */
  public function markQualityConditional(?string $notes = null): self
  {
    $this->update([
      'quality_status' => 'conditional',
      'quality_notes' => $notes,
    ]);
    return $this;
  }

  /**
   * ✅ Quarantine the item
   */
  public function quarantine(string $reason, ?int $days = null): self
  {
    $this->update([
      'is_quarantined' => true,
      'quarantine_reason' => $reason,
      'quarantine_end_date' => $days ? now()->addDays($days) : null,
    ]);
    return $this;
  }

  /**
   * ✅ Release from quarantine
   */
  public function releaseQuarantine(): self
  {
    $this->update([
      'is_quarantined' => false,
      'quarantine_end_date' => now(),
    ]);
    return $this;
  }

  /**
   * ✅ Get the item's full location description
   */
  public function getLocationDescriptionAttribute(): string
  {
    $parts = array_filter([
      $this->storage_location,
      $this->rack_number,
      $this->bin_number,
    ]);
    return implode(' - ', $parts) ?: 'No location assigned';
  }

  /**
   * ✅ Check if item has serial numbers
   */
  public function hasSerialNumbers(): bool
  {
    return !empty($this->serial_numbers) && count($this->serial_numbers) > 0;
  }

  /**
   * ✅ Get serial numbers as a comma-separated string
   */
  public function getSerialNumbersListAttribute(): string
  {
    if (!$this->hasSerialNumbers()) {
      return 'No serial numbers';
    }
    return implode(', ', $this->serial_numbers);
  }
}
