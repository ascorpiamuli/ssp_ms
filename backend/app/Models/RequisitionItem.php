<?php
// app/Models/RequisitionItem.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequisitionItem extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'requisition_id',
    'supplier_id',
    'purchase_order_id',
    'quality_inspected_by',
    'item_name',
    'description',
    'unit_of_measure',
    'quantity',
    'estimated_unit_cost',
    'total_cost',
    'specifications',
    'catalog_number',
    'manufacturer',
    'model_number',
    'tax_rate',
    'tax_amount',
    'discount_percentage',
    'discount_amount',
    'net_amount',
    'budget_allocated',
    'budget_line_item',
    'is_inventory_item',
    'inventory_code',
    'current_stock',
    'reorder_level',
    'supplier_quotation_number',
    'alternative_suppliers',
    'alternative_quotations',
    'is_procured',
    'procured_at',
    'actual_unit_cost',
    'actual_total_cost',
    'expected_delivery_date',
    'actual_delivery_date',
    'delivery_lead_time_days',
    'delivery_address',
    'delivery_contact_person',
    'delivery_contact_phone',
    'is_delivered',
    'delivery_receipt_date',
    'delivery_receipt_number',
    'quality_status',
    'quality_notes',
    'quality_inspected_at',
    'warranty_period_months',
    'warranty_start_date',
    'warranty_end_date',
    'warranty_terms',
    'received_quantity',
    'remaining_quantity',
    'fully_received_at',
    'purchase_order_line_item',
    'status',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'quantity' => 'decimal:2',
    'estimated_unit_cost' => 'decimal:2',
    'total_cost' => 'decimal:2',
    'tax_rate' => 'decimal:2',
    'tax_amount' => 'decimal:2',
    'discount_percentage' => 'decimal:2',
    'discount_amount' => 'decimal:2',
    'net_amount' => 'decimal:2',
    'budget_allocated' => 'decimal:2',
    'actual_unit_cost' => 'decimal:2',
    'actual_total_cost' => 'decimal:2',
    'received_quantity' => 'decimal:2',
    'remaining_quantity' => 'decimal:2',
    'current_stock' => 'integer',
    'reorder_level' => 'integer',
    'delivery_lead_time_days' => 'integer',
    'warranty_period_months' => 'integer',
    'expected_delivery_date' => 'date',
    'actual_delivery_date' => 'date',
    'delivery_receipt_date' => 'date',
    'warranty_start_date' => 'date',
    'warranty_end_date' => 'date',
    'procured_at' => 'datetime',
    'quality_inspected_at' => 'datetime',
    'fully_received_at' => 'datetime',
    'is_inventory_item' => 'boolean',
    'is_procured' => 'boolean',
    'is_delivered' => 'boolean',
    'alternative_suppliers' => 'json',
    'alternative_quotations' => 'json',
    'metadata' => 'json',
    'deleted_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'formatted_total_cost',
    'formatted_estimated_unit_cost',
    'formatted_quantity',
    'status_label',
    'status_color',
    'quality_status_label',
    'total_with_tax',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the requisition this item belongs to.
   */
  public function requisition(): BelongsTo
  {
    return $this->belongsTo(Requisition::class);
  }

  /**
   * Get the supplier for this item.
   */
  public function supplier(): BelongsTo
  {
    return $this->belongsTo(Supplier::class);
  }

  /**
   * Get the quality inspector.
   */
  public function qualityInspector(): BelongsTo
  {
    return $this->belongsTo(User::class, 'quality_inspected_by');
  }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

  /**
   * Get formatted total cost.
   */
  public function getFormattedTotalCostAttribute(): string
  {
    return number_format((float) $this->total_cost, 2);
  }

  /**
   * Get formatted estimated unit cost.
   */
  public function getFormattedEstimatedUnitCostAttribute(): string
  {
    return number_format((float) $this->estimated_unit_cost, 2);
  }

  /**
   * Get formatted quantity.
   */
  public function getFormattedQuantityAttribute(): string
  {
    return number_format((float) $this->quantity, 2);
  }

  /**
   * Get total with tax.
   */
  public function getTotalWithTaxAttribute(): float
  {
    return (float) $this->total_cost + (float) ($this->tax_amount ?? 0);
  }

  /**
   * ✅ FIXED: Get status label with null safety.
   */
  public function getStatusLabelAttribute(): string
  {
    $status = $this->status;

    // If status is null, return 'Pending'
    if (is_null($status)) {
      return 'Pending';
    }

    $labels = [
      'pending' => 'Pending',
      'approved' => 'Approved',
      'procured' => 'Procured',
      'delivered' => 'Delivered',
      'received' => 'Received',
      'cancelled' => 'Cancelled',
      'rejected' => 'Rejected',
      'draft' => 'Draft',
      'submitted' => 'Submitted',
      'returned' => 'Returned',
      'revised' => 'Revised',
    ];

    return $labels[strtolower($status)] ?? ucfirst(strtolower($status));
  }

  /**
   * ✅ FIXED: Get status color with null safety.
   */
  public function getStatusColorAttribute(): string
  {
    $status = $this->status;

    if (is_null($status)) {
      return 'warning';
    }

    $colors = [
      'pending' => 'warning',
      'approved' => 'info',
      'procured' => 'primary',
      'delivered' => 'success',
      'received' => 'success',
      'cancelled' => 'danger',
      'rejected' => 'danger',
      'draft' => 'secondary',
      'submitted' => 'primary',
      'returned' => 'warning',
      'revised' => 'info',
    ];

    return $colors[strtolower($status)] ?? 'secondary';
  }

  /**
   * ✅ FIXED: Get quality status label with null safety.
   */
  public function getQualityStatusLabelAttribute(): string
  {
    $status = $this->quality_status;

    if (is_null($status)) {
      return 'Pending Inspection';
    }

    $labels = [
      'pending' => 'Pending Inspection',
      'inspected' => 'Inspected',
      'accepted' => 'Accepted',
      'rejected' => 'Rejected',
      'passed' => 'Passed',
      'failed' => 'Failed',
    ];

    return $labels[strtolower($status)] ?? ucfirst(strtolower($status));
  }

  /**
   * Set item name to uppercase words.
   */
  public function setItemNameAttribute(string $value): void
  {
    $this->attributes['item_name'] = ucwords(strtolower(trim($value)));
  }

  /**
   * Get remaining quantity.
   */
  public function getRemainingQuantityAttribute(): float
  {
    return max(0, (float) $this->quantity - (float) ($this->received_quantity ?? 0));
  }

  /**
   * Check if item is fully received.
   */
  public function getIsFullyReceivedAttribute(): bool
  {
    return (float) ($this->received_quantity ?? 0) >= (float) $this->quantity;
  }

  /**
   * Get tax amount if not set.
   */
  public function getTaxAmountAttribute(): float
  {
    if (isset($this->attributes['tax_amount']) && !is_null($this->attributes['tax_amount'])) {
      return (float) $this->attributes['tax_amount'];
    }
    return (float) ($this->total_cost * ($this->tax_rate / 100));
  }

  /**
   * Get discount amount if not set.
   */
  public function getDiscountAmountAttribute(): float
  {
    if (isset($this->attributes['discount_amount']) && !is_null($this->attributes['discount_amount'])) {
      return (float) $this->attributes['discount_amount'];
    }
    return (float) ($this->total_cost * ($this->discount_percentage / 100));
  }

  /**
   * Get net amount if not set.
   */
  public function getNetAmountAttribute(): float
  {
    if (isset($this->attributes['net_amount']) && !is_null($this->attributes['net_amount'])) {
      return (float) $this->attributes['net_amount'];
    }
    return (float) ($this->total_cost - $this->discount_amount + $this->tax_amount);
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for pending items.
   */
  public function scopePending($query)
  {
    return $query->where('status', 'pending');
  }

  /**
   * Scope for procured items.
   */
  public function scopeProcured($query)
  {
    return $query->where('status', 'procured');
  }

  /**
   * Scope for delivered items.
   */
  public function scopeDelivered($query)
  {
    return $query->where('status', 'delivered');
  }

  /**
   * Scope for received items.
   */
  public function scopeReceived($query)
  {
    return $query->where('status', 'received');
  }

  /**
   * Scope for inventory items.
   */
  public function scopeInventoryItems($query)
  {
    return $query->where('is_inventory_item', true);
  }

  /**
   * Scope for items below reorder level.
   */
  public function scopeBelowReorderLevel($query)
  {
    return $query->where('is_inventory_item', true)
      ->whereColumn('current_stock', '<=', 'reorder_level');
  }

  /**
   * Scope for items with pending quality inspection.
   */
  public function scopePendingQualityInspection($query)
  {
    return $query->where('quality_status', 'pending');
  }

  /**
   * Scope for items that are not fully received.
   */
  public function scopeNotFullyReceived($query)
  {
    return $query->whereRaw('received_quantity < quantity');
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Calculate total cost.
   */
  public function calculateTotalCost(): float
  {
    return (float) $this->quantity * (float) $this->estimated_unit_cost;
  }

  /**
   * Calculate net amount after discount and tax.
   */
  public function calculateNetAmount(): float
  {
    $total = (float) $this->total_cost;
    $discount = $total * ((float) $this->discount_percentage / 100);
    $tax = ($total - $discount) * ((float) $this->tax_rate / 100);

    return $total - $discount + $tax;
  }

  /**
   * Check if item is fully received.
   */
  public function isFullyReceived(): bool
  {
    return (float) ($this->received_quantity ?? 0) >= (float) $this->quantity;
  }

  /**
   * Get remaining quantity to receive.
   */
  public function getRemainingQuantity(): float
  {
    return max(0, (float) $this->quantity - (float) ($this->received_quantity ?? 0));
  }

  /**
   * Update total cost.
   */
  public function updateTotalCost(): self
  {
    $this->total_cost = $this->calculateTotalCost();
    $this->save();
    return $this;
  }

  /**
   * Mark item as received.
   */
  public function markAsReceived(float $quantity, ?string $receiptNumber = null): self
  {
    $this->received_quantity = $quantity;
    $this->delivery_receipt_number = $receiptNumber;
    $this->delivery_receipt_date = now();

    if ($this->isFullyReceived()) {
      $this->fully_received_at = now();
      $this->status = 'received';
    }

    $this->save();
    return $this;
  }

  /**
   * Mark item as delivered.
   */
  public function markAsDelivered(?\DateTime $deliveryDate = null): self
  {
    $this->actual_delivery_date = $deliveryDate ?? now();
    $this->is_delivered = true;
    $this->status = 'delivered';
    $this->save();
    return $this;
  }

  /**
   * Update quality status.
   */
  public function updateQuality(string $status, ?string $notes = null): self
  {
    $this->quality_status = $status;
    $this->quality_notes = $notes;
    $this->quality_inspected_at = now();
    $this->quality_inspected_by = auth()->id();
    $this->save();
    return $this;
  }

  /**
   * Mark item as procured.
   */
  public function markAsProcured(float $actualUnitCost, ?string $quotationNumber = null): self
  {
    $this->is_procured = true;
    $this->procured_at = now();
    $this->actual_unit_cost = $actualUnitCost;
    $this->actual_total_cost = $actualUnitCost * (float) $this->quantity;
    $this->supplier_quotation_number = $quotationNumber;
    $this->status = 'procured';
    $this->save();
    return $this;
  }

  /**
   * Check if item needs reorder.
   */
  public function needsReorder(): bool
  {
    if (!$this->is_inventory_item) {
      return false;
    }
    return (int) $this->current_stock <= (int) $this->reorder_level;
  }

  /**
   * Get warranty status.
   */
  public function getWarrantyStatus(): string
  {
    if (is_null($this->warranty_end_date)) {
      return 'No Warranty';
    }

    $now = now();
    $endDate = $this->warranty_end_date;

    if ($now > $endDate) {
      return 'Expired';
    }

    $daysLeft = $now->diffInDays($endDate);

    if ($daysLeft <= 30) {
      return 'Expiring Soon';
    }

    return 'Active';
  }

  /**
   * Get the formatted warranty period.
   */
  public function getFormattedWarrantyPeriodAttribute(): string
  {
    if (!$this->warranty_period_months) {
      return 'No Warranty';
    }

    $months = (int) $this->warranty_period_months;

    if ($months >= 12) {
      $years = floor($months / 12);
      $remainingMonths = $months % 12;
      $parts = [];
      if ($years > 0) {
        $parts[] = $years . ' year' . ($years > 1 ? 's' : '');
      }
      if ($remainingMonths > 0) {
        $parts[] = $remainingMonths . ' month' . ($remainingMonths > 1 ? 's' : '');
      }
      return implode(' ', $parts);
    }

    return $months . ' month' . ($months > 1 ? 's' : '');
  }
}
