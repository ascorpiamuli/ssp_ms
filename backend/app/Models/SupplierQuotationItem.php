<?php
// app/Models/SupplierQuotationItem.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierQuotationItem extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'supplier_quotation_id',
    'requisition_item_id',
    'item_name',
    'description',
    'unit_of_measure',
    'quantity',
    'unit_price',
    'total_price',
    'tax_rate',
    'tax_amount',
    'discount_rate',
    'discount_amount',
    'net_price',
    'delivery_days',
    'warranty_months',
    'specifications',
    'brand',
    'model',
    'is_alternative',
    'alternative_notes',
    'is_custom',
    'custom_item_notes',
    'notes',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'quantity' => 'decimal:2',
    'unit_price' => 'decimal:2',
    'total_price' => 'decimal:2',
    'tax_rate' => 'decimal:2',
    'tax_amount' => 'decimal:2',
    'discount_rate' => 'decimal:2',
    'discount_amount' => 'decimal:2',
    'net_price' => 'decimal:2',
    'delivery_days' => 'integer',
    'warranty_months' => 'integer',
    'is_alternative' => 'boolean',
    'is_custom' => 'boolean',
    'metadata' => 'json',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'formatted_quantity',
    'formatted_unit_price',
    'formatted_total_price',
    'formatted_tax_amount',
    'formatted_discount_amount',
    'formatted_net_price',
    'is_alternative_label',
    'item_type_label',
    'is_from_requisition',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  /**
   * Get the supplier quotation that owns this item.
   */
  public function supplierQuotation(): BelongsTo
  {
    return $this->belongsTo(SupplierQuotation::class, 'supplier_quotation_id');
  }

  /**
   * Get the requisition item that this belongs to.
   */
  public function requisitionItem(): BelongsTo
  {
    return $this->belongsTo(RequisitionItem::class, 'requisition_item_id');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

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
   * ✅ Get specifications in proper case when accessed
   */
  public function getSpecificationsAttribute(?string $value): ?string
  {
    return $value;
  }

  /**
   * ✅ Set specifications with proper formatting
   */
  public function setSpecificationsAttribute(?string $value): void
  {
    $this->attributes['specifications'] = $value ? trim($value) : null;
  }

  /**
   * ✅ Get brand name in uppercase when accessed
   */
  public function getBrandAttribute(?string $value): string
  {
    return $value ? strtoupper($value) : '';
  }

  /**
   * ✅ Set brand name to uppercase when saved
   */
  public function setBrandAttribute(?string $value): void
  {
    $this->attributes['brand'] = $value ? strtoupper(trim($value)) : null;
  }

  /**
   * ✅ Get model in uppercase when accessed
   */
  public function getModelAttribute(?string $value): string
  {
    return $value ? strtoupper($value) : '';
  }

  /**
   * ✅ Set model to uppercase when saved
   */
  public function setModelAttribute(?string $value): void
  {
    $this->attributes['model'] = $value ? strtoupper(trim($value)) : null;
  }

  /**
   * ✅ Get alternative notes in proper case when accessed
   */
  public function getAlternativeNotesAttribute(?string $value): ?string
  {
    return $value;
  }

  /**
   * ✅ Set alternative notes with proper formatting
   */
  public function setAlternativeNotesAttribute(?string $value): void
  {
    $this->attributes['alternative_notes'] = $value ? trim($value) : null;
  }

  /**
   * ✅ Get custom item notes in proper case when accessed
   */
  public function getCustomItemNotesAttribute(?string $value): ?string
  {
    return $value;
  }

  /**
   * ✅ Set custom item notes with proper formatting
   */
  public function setCustomItemNotesAttribute(?string $value): void
  {
    $this->attributes['custom_item_notes'] = $value ? trim($value) : null;
  }

  /**
   * ✅ Get notes in proper case when accessed
   */
  public function getNotesAttribute(?string $value): ?string
  {
    return $value;
  }

  /**
   * ✅ Set notes with proper formatting
   */
  public function setNotesAttribute(?string $value): void
  {
    $this->attributes['notes'] = $value ? trim($value) : null;
  }

  /**
   * Get formatted quantity.
   */
  public function getFormattedQuantityAttribute(): string
  {
    return number_format((float) ($this->quantity ?? 0), 2);
  }

  /**
   * Get formatted unit price.
   */
  public function getFormattedUnitPriceAttribute(): string
  {
    return number_format((float) ($this->unit_price ?? 0), 2);
  }

  /**
   * Get formatted total price.
   */
  public function getFormattedTotalPriceAttribute(): string
  {
    return number_format((float) ($this->total_price ?? 0), 2);
  }

  /**
   * Get formatted tax amount.
   */
  public function getFormattedTaxAmountAttribute(): string
  {
    return number_format((float) ($this->tax_amount ?? 0), 2);
  }

  /**
   * Get formatted discount amount.
   */
  public function getFormattedDiscountAmountAttribute(): string
  {
    return number_format((float) ($this->discount_amount ?? 0), 2);
  }

  /**
   * Get formatted net price.
   */
  public function getFormattedNetPriceAttribute(): string
  {
    return number_format((float) ($this->net_price ?? 0), 2);
  }

  /**
   * Get is alternative label.
   */
  public function getIsAlternativeLabelAttribute(): string
  {
    return $this->is_alternative ? 'Yes' : 'No';
  }

  /**
   * Get item type label.
   */
  public function getItemTypeLabelAttribute(): string
  {
    if ($this->is_custom) {
      return 'Custom Item';
    }
    if ($this->is_alternative) {
      return 'Alternative Item';
    }
    return 'From Requisition';
  }

  /**
   * Check if item is from requisition.
   */
  public function getIsFromRequisitionAttribute(): bool
  {
    return !$this->is_custom && !$this->is_alternative && !is_null($this->requisition_item_id);
  }

  // ============================================
  // SCOPES
  // ============================================

  /**
   * Scope to only alternative items.
   */
  public function scopeAlternative($query)
  {
    return $query->where('is_alternative', true);
  }

  /**
   * Scope to only non-alternative items.
   */
  public function scopeNotAlternative($query)
  {
    return $query->where('is_alternative', false);
  }

  /**
   * Scope to only custom items.
   */
  public function scopeCustom($query)
  {
    return $query->where('is_custom', true);
  }

  /**
   * Scope to only requisition items.
   */
  public function scopeFromRequisition($query)
  {
    return $query->where('is_custom', false)
      ->where('is_alternative', false)
      ->whereNotNull('requisition_item_id');
  }

  /**
   * Scope by supplier quotation ID.
   */
  public function scopeBySupplierQuotation($query, int $supplierQuotationId)
  {
    return $query->where('supplier_quotation_id', $supplierQuotationId);
  }

  /**
   * Scope by requisition item ID.
   */
  public function scopeByRequisitionItem($query, int $requisitionItemId)
  {
    return $query->where('requisition_item_id', $requisitionItemId);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Check if item is an alternative.
   */
  public function isAlternative(): bool
  {
    return (bool) $this->is_alternative;
  }

  /**
   * Check if item is custom.
   */
  public function isCustom(): bool
  {
    return (bool) $this->is_custom;
  }

  /**
   * Check if item is from requisition.
   */
  public function isFromRequisition(): bool
  {
    return !$this->is_custom && !$this->is_alternative && !is_null($this->requisition_item_id);
  }

  /**
   * Check if item was added by the supplier.
   */
  public function isSupplierAdded(): bool
  {
    return $this->is_custom || $this->is_alternative || is_null($this->requisition_item_id);
  }

  /**
   * Get the source type label.
   */
  public function getSourceTypeLabelAttribute(): string
  {
    if ($this->is_custom) {
      return 'Custom (Supplier Added)';
    }
    if ($this->is_alternative) {
      return 'Alternative (Supplier Added)';
    }
    if (is_null($this->requisition_item_id)) {
      return 'Supplier Added';
    }
    return 'Requisition';
  }

  /**
   * Get the source type color.
   */
  public function getSourceTypeColorAttribute(): string
  {
    if ($this->is_custom || $this->is_alternative || is_null($this->requisition_item_id)) {
      return 'purple';
    }
    return 'emerald';
  }

  /**
   * Calculate item totals.
   */
  public function calculateTotals(): self
  {
    $quantity = (float) $this->quantity;
    $unitPrice = (float) $this->unit_price;

    // Calculate total price
    $this->total_price = $quantity * $unitPrice;

    // Calculate tax amount
    if ($this->tax_rate > 0) {
      $this->tax_amount = $this->total_price * ((float) $this->tax_rate / 100);
    } else {
      $this->tax_amount = 0;
    }

    // Calculate discount amount
    if ($this->discount_rate > 0) {
      $this->discount_amount = $this->total_price * ((float) $this->discount_rate / 100);
    } else {
      $this->discount_amount = 0;
    }

    // Calculate net price (total - discount + tax)
    $this->net_price = $this->total_price - $this->discount_amount + $this->tax_amount;

    return $this;
  }

  /**
   * Calculate totals and save.
   */
  public function calculateAndSave(): self
  {
    $this->calculateTotals();
    $this->save();
    return $this;
  }

  /**
   * Get the requisition item name with fallback to custom name.
   */
  public function getDisplayName(): string
  {
    if ($this->is_custom) {
      return $this->item_name . ' (Custom)';
    }
    if ($this->is_alternative) {
      return $this->item_name . ' (Alternative)';
    }
    return $this->item_name;
  }

  /**
   * Get the requisition item description with fallback.
   */
  public function getDisplayDescription(): ?string
  {
    if ($this->is_custom && $this->custom_item_notes) {
      return $this->custom_item_notes;
    }
    return $this->description;
  }

  /**
   * Duplicate this item for a new supplier quotation.
   */
  public function duplicateForQuotation(int $newSupplierQuotationId): self
  {
    $newItem = $this->replicate();
    $newItem->supplier_quotation_id = $newSupplierQuotationId;
    $newItem->save();
    return $newItem;
  }

  /**
   * Get the total price including tax and after discount.
   */
  public function getFinalPrice(): float
  {
    return (float) $this->net_price;
  }

  /**
   * Get the total price formatted.
   */
  public function getFormattedFinalPrice(): string
  {
    return number_format($this->getFinalPrice(), 2);
  }
}
