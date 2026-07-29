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
    'formatted_net_price',
    'is_alternative_label',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function supplierQuotation(): BelongsTo
  {
    return $this->belongsTo(SupplierQuotation::class, 'supplier_quotation_id');
  }

  public function requisitionItem(): BelongsTo
  {
    return $this->belongsTo(RequisitionItem::class, 'requisition_item_id');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getFormattedQuantityAttribute(): string
  {
    return number_format((float) ($this->quantity ?? 0), 2);
  }

  public function getFormattedUnitPriceAttribute(): string
  {
    return number_format((float) ($this->unit_price ?? 0), 2);
  }

  public function getFormattedTotalPriceAttribute(): string
  {
    return number_format((float) ($this->total_price ?? 0), 2);
  }

  public function getFormattedNetPriceAttribute(): string
  {
    return number_format((float) ($this->net_price ?? 0), 2);
  }

  public function getIsAlternativeLabelAttribute(): string
  {
    return $this->is_alternative ? 'Yes' : 'No';
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

  public function scopeAlternative($query)
  {
    return $query->where('is_alternative', true);
  }

  public function scopeNotAlternative($query)
  {
    return $query->where('is_alternative', false);
  }

  public function scopeBySupplierQuotation($query, int $supplierQuotationId)
  {
    return $query->where('supplier_quotation_id', $supplierQuotationId);
  }

  public function scopeByRequisitionItem($query, int $requisitionItemId)
  {
    return $query->where('requisition_item_id', $requisitionItemId);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isAlternative(): bool
  {
    return (bool) $this->is_alternative;
  }

  public function calculateTotals(): self
  {
    $total = (float) $this->quantity * (float) $this->unit_price;
    $tax = $total * ((float) $this->tax_rate / 100);
    $discount = $total * ((float) $this->discount_rate / 100);
    $net = $total - $discount + $tax;

    $this->total_price = $total;
    $this->tax_amount = $tax;
    $this->discount_amount = $discount;
    $this->net_price = $net;
    $this->save();

    return $this;
  }
}
