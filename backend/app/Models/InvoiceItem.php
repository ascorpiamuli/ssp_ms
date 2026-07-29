<?php
// app/Models/InvoiceItem.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'invoice_id',
    'purchase_order_item_id',
    'goods_received_item_id',
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
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function invoice(): BelongsTo
  {
    return $this->belongsTo(Invoice::class, 'invoice_id');
  }

  public function purchaseOrderItem(): BelongsTo
  {
    return $this->belongsTo(PurchaseOrderItem::class, 'purchase_order_item_id');
  }

  public function goodsReceivedItem(): BelongsTo
  {
    return $this->belongsTo(GoodsReceivedItem::class, 'goods_received_item_id');
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

  public function scopeByInvoice($query, int $invoiceId)
  {
    return $query->where('invoice_id', $invoiceId);
  }

  public function scopeByRequisitionItem($query, int $requisitionItemId)
  {
    return $query->where('requisition_item_id', $requisitionItemId);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

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
