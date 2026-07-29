<?php
// app/Models/PurchaseOrderItem.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'purchase_order_id',
    'requisition_item_id',
    'supplier_quotation_item_id',
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
    'catalog_number',
    'received_quantity',
    'remaining_quantity',
    'accepted_quantity',
    'rejected_quantity',
    'fully_received',
    'fully_received_at',
    'status',
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
    'received_quantity' => 'decimal:2',
    'remaining_quantity' => 'decimal:2',
    'accepted_quantity' => 'decimal:2',
    'rejected_quantity' => 'decimal:2',
    'delivery_days' => 'integer',
    'warranty_months' => 'integer',
    'fully_received' => 'boolean',
    'fully_received_at' => 'datetime',
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
    'formatted_received_quantity',
    'formatted_remaining_quantity',
    'status_label',
    'status_color',
    'is_fully_received',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function purchaseOrder(): BelongsTo
  {
    return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
  }

  public function requisitionItem(): BelongsTo
  {
    return $this->belongsTo(RequisitionItem::class, 'requisition_item_id');
  }

  public function supplierQuotationItem(): BelongsTo
  {
    return $this->belongsTo(SupplierQuotationItem::class, 'supplier_quotation_item_id');
  }

  public function goodsReceivedItems(): HasMany
  {
    return $this->hasMany(GoodsReceivedItem::class, 'purchase_order_item_id');
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

  public function getFormattedReceivedQuantityAttribute(): string
  {
    return number_format((float) ($this->received_quantity ?? 0), 2);
  }

  public function getFormattedRemainingQuantityAttribute(): string
  {
    return number_format((float) ($this->remaining_quantity ?? 0), 2);
  }

  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'pending' => 'Pending',
      'partial' => 'Partially Received',
      'received' => 'Fully Received',
      'cancelled' => 'Cancelled',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Pending');
  }

  public function getStatusColorAttribute(): string
  {
    $colors = [
      'pending' => 'warning',
      'partial' => 'info',
      'received' => 'success',
      'cancelled' => 'danger',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  public function getIsFullyReceivedAttribute(): bool
  {
    return (bool) $this->fully_received;
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

  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  public function scopePartial($query)
  {
    return $query->where('status', 'partial');
  }

  public function scopeReceived($query)
  {
    return $query->where('status', 'received');
  }

  public function scopeByPurchaseOrder($query, int $purchaseOrderId)
  {
    return $query->where('purchase_order_id', $purchaseOrderId);
  }

  public function scopeByRequisitionItem($query, int $requisitionItemId)
  {
    return $query->where('requisition_item_id', $requisitionItemId);
  }

  public function scopeNotFullyReceived($query)
  {
    return $query->where('fully_received', false);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isPending(): bool
  {
    return $this->status === 'pending';
  }

  public function isPartial(): bool
  {
    return $this->status === 'partial';
  }

  public function isFullyReceived(): bool
  {
    return (bool) $this->fully_received;
  }

  public function getRemainingQuantity(): float
  {
    return max(0, (float) $this->quantity - (float) ($this->received_quantity ?? 0));
  }

  public function updateReceivedQuantity(float $quantity): self
  {
    $this->received_quantity = (float) $this->received_quantity + $quantity;
    $this->remaining_quantity = $this->getRemainingQuantity();

    if ($this->remaining_quantity <= 0) {
      $this->fully_received = true;
      $this->fully_received_at = now();
      $this->status = 'received';
    } elseif ((float) $this->received_quantity > 0) {
      $this->status = 'partial';
    }

    $this->save();
    return $this;
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
