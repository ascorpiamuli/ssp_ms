<?php
// app/Models/Requisition.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Requisition extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'user_id',
    'department_id',
    'supplier_id',
    'reference_number',
    'title',
    'description',
    'total_amount',
    // === NEW: Requisition Type ===
    'requisition_type',
    // === NEW: Service-Specific Fields ===
    'service_category',
    'service_scope_of_work',
    'service_deliverables_expected',
    'service_expected_start_date',
    'service_expected_end_date',
    'service_estimated_duration_days',
    'service_requires_onsite_visit',
    'service_special_requirements',
    'service_qualifications_required',
    // === NEW: Goods-Specific Fields ===
    'goods_category',
    'goods_warehouse_location',
    'goods_storage_requirements',
    'goods_expected_delivery_date',
    // === NEW: Procurement Type ===
    'procurement_type',
    // === Existing Fields ===
    'status',
    'priority',
    'type',
    'urgency',
    'justification',
    'required_by_date',
    'required_delivery_date',
    'revision_count',
    'last_revised_at',
    'last_revised_by',
    'revision_notes',
    'revision_status',
    'hod_approved_at',
    'hod_declined_at',
    'hod_decline_reason',
    'hod_approver_id',
    'accountant_approved_at',
    'accountant_declined_at',
    'accountant_decline_reason',
    'accountant_approver_id',
    'principal_approved_at',
    'principal_declined_at',
    'principal_decline_reason',
    'principal_approver_id',
    'final_approved_at',
    'final_declined_at',
    'final_decline_reason',
    'final_approver_id',
    'returned_at',
    'return_reason',
    'returned_by',
    'return_count',
    'last_returned_at',
    'cancelled_at',
    'cancellation_reason',
    'cancelled_by',
    'submitted_at',
    'submitted_by',
    'budget_allocated',
    'budget_utilized',
    'budget_code',
    'budget_source',
    'funding_source',
    'project_code',
    'is_procurement_created',
    'procurement_created_at',
    'procurement_plan_id',
    'procurement_method',
    'is_framework_agreement',
    'framework_agreement_id',
    'risk_level',
    'risk_mitigation',
    'is_compliant',
    'compliance_notes',
    'sla_started_at',
    'sla_target_at',
    'sla_status',
    'approval_level_count',
    'total_approval_levels',
    'last_approval_at',
    'estimated_completion_date',
    'currency',
    'exchange_rate',
    'total_amount_usd',
    'department_budget_balance',
    'department_utilization_percentage',
    'audit_trail_last_checked',
    'audit_status',
    'audited_by',
    'metadata',
    'custom_fields',
    'ip_address',
    'user_agent',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    // === Existing Casts ===
    'total_amount' => 'decimal:2',
    'budget_allocated' => 'decimal:2',
    'budget_utilized' => 'decimal:2',
    'department_budget_balance' => 'decimal:2',
    'department_utilization_percentage' => 'decimal:2',
    'exchange_rate' => 'decimal:4',
    'total_amount_usd' => 'decimal:2',
    'required_by_date' => 'date',
    'required_delivery_date' => 'datetime',
    'hod_approved_at' => 'datetime',
    'hod_declined_at' => 'datetime',
    'accountant_approved_at' => 'datetime',
    'accountant_declined_at' => 'datetime',
    'principal_approved_at' => 'datetime',
    'principal_declined_at' => 'datetime',
    'final_approved_at' => 'datetime',
    'final_declined_at' => 'datetime',
    'returned_at' => 'datetime',
    'last_returned_at' => 'datetime',
    'cancelled_at' => 'datetime',
    'submitted_at' => 'datetime',
    'last_revised_at' => 'datetime',
    'sla_started_at' => 'datetime',
    'sla_target_at' => 'datetime',
    'last_approval_at' => 'datetime',
    'estimated_completion_date' => 'datetime',
    'procurement_created_at' => 'datetime',
    'audit_trail_last_checked' => 'datetime',
    'is_compliant' => 'boolean',
    'is_procurement_created' => 'boolean',
    'is_framework_agreement' => 'boolean',
    'return_count' => 'integer',
    'revision_count' => 'integer',
    'approval_level_count' => 'integer',
    'total_approval_levels' => 'integer',
    'metadata' => 'json',
    'custom_fields' => 'json',
    'deleted_at' => 'datetime',
    // === NEW: Service Casts ===
    'service_expected_start_date' => 'date',
    'service_expected_end_date' => 'date',
    'service_estimated_duration_days' => 'integer',
    'service_requires_onsite_visit' => 'boolean',
    // === NEW: Goods Casts ===
    'goods_expected_delivery_date' => 'date',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'formatted_total_amount',
    'status_label',
    'status_color',
    'priority_label',
    'priority_color',
    'type_label',
    'urgency_label',
    'risk_level_label',
    'sla_status_label',
    'is_editable',
    'is_approvable',
    'is_returnable',
    'can_be_revised',
    // === NEW: Appends ===
    'requisition_type_label',
    'service_category_label',
    'procurement_type_label',
    'is_service_requisition',
    'is_goods_requisition',
  ];

  // ============================================
  // CONSTANTS
  // ============================================

  /**
   * Requisition types.
   */
  public const TYPE_GOODS = 'goods';
  public const TYPE_SERVICES = 'services';

  /**
   * Service categories.
   */
  public const SERVICE_CATEGORIES = [
    'consultancy',
    'maintenance',
    'training',
    'installation',
    'cleaning',
    'security',
    'transport',
    'construction',
    'professional_services',
    'it_services',
    'other'
  ];

  /**
   * Procurement types.
   */
  public const PROCUREMENT_GOODS = 'goods';
  public const PROCUREMENT_SERVICES = 'services';

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_id');
  }

  public function department(): BelongsTo
  {
    return $this->belongsTo(Department::class, 'department_id');
  }

  public function supplier(): BelongsTo
  {
    return $this->belongsTo(Supplier::class, 'supplier_id');
  }

  public function hodApprover(): BelongsTo
  {
    return $this->belongsTo(User::class, 'hod_approver_id');
  }

  public function accountantApprover(): BelongsTo
  {
    return $this->belongsTo(User::class, 'accountant_approver_id');
  }

  public function principalApprover(): BelongsTo
  {
    return $this->belongsTo(User::class, 'principal_approver_id');
  }

  public function finalApprover(): BelongsTo
  {
    return $this->belongsTo(User::class, 'final_approver_id');
  }

  public function returnedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'returned_by');
  }

  public function cancelledBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'cancelled_by');
  }

  public function submittedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'submitted_by');
  }

  public function lastRevisedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'last_revised_by');
  }

  public function auditedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'audited_by');
  }

  public function items(): HasMany
  {
    return $this->hasMany(RequisitionItem::class);
  }

  public function attachments(): HasMany
  {
    return $this->hasMany(RequisitionAttachment::class);
  }

  public function history(): HasMany
  {
    return $this->hasMany(RequisitionHistory::class)->orderBy('created_at', 'desc');
  }

  public function approvals(): HasMany
  {
    return $this->hasMany(Approval::class)->orderBy('order');
  }

  public function budgets(): HasMany
  {
    return $this->hasMany(RequisitionBudget::class);
  }

  public function revisions(): HasMany
  {
    return $this->hasMany(RequisitionRevision::class)->orderBy('revision_number', 'desc');
  }

  public function comments(): HasMany
  {
    return $this->hasMany(RequisitionComment::class)->orderBy('created_at', 'desc');
  }

  public function notifications(): HasMany
  {
    return $this->hasMany(RequisitionNotification::class);
  }

  public function escalations(): HasMany
  {
    return $this->hasMany(RequisitionEscalation::class)->orderBy('escalated_at', 'desc');
  }

  // ============================================
  // ACCESSORS & MUTATORS - ALL WITH NULL SAFETY
  // ============================================

  /**
   * Get formatted total amount with proper casting.
   */
  public function getFormattedTotalAmountAttribute(): string
  {
    return number_format((float) ($this->total_amount ?? 0), 2);
  }

  /**
   * Get status label.
   */
  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'draft' => 'Draft',
      'submitted' => 'Submitted',
      'hod_approved' => 'HOD Approved',
      'hod_declined' => 'HOD Declined',
      'accountant_approved' => 'Accountant Approved',
      'accountant_declined' => 'Accountant Declined',
      'principal_approved' => 'Principal Approved',
      'principal_declined' => 'Principal Declined',
      'final_approved' => 'Final Approved',
      'final_declined' => 'Final Declined',
      'returned' => 'Returned',
      'cancelled' => 'Cancelled',
      'revised' => 'Revised',
    ];

    return $labels[$this->status] ?? ucfirst($this->status ?? 'Unknown');
  }

  /**
   * Get status color.
   */
  public function getStatusColorAttribute(): string
  {
    $colors = [
      'draft' => 'gray',
      'submitted' => 'blue',
      'hod_approved' => 'info',
      'hod_declined' => 'danger',
      'accountant_approved' => 'info',
      'accountant_declined' => 'danger',
      'principal_approved' => 'info',
      'principal_declined' => 'danger',
      'final_approved' => 'success',
      'final_declined' => 'danger',
      'returned' => 'warning',
      'cancelled' => 'danger',
      'revised' => 'warning',
    ];

    return $colors[$this->status] ?? 'secondary';
  }

  /**
   * Get priority label.
   */
  public function getPriorityLabelAttribute(): string
  {
    $labels = [
      'low' => 'Low',
      'medium' => 'Medium',
      'high' => 'High',
      'emergency' => 'Emergency',
    ];

    return $labels[$this->priority] ?? ucfirst($this->priority ?? 'Medium');
  }

  /**
   * Get priority color.
   */
  public function getPriorityColorAttribute(): string
  {
    $colors = [
      'low' => 'success',
      'medium' => 'info',
      'high' => 'warning',
      'emergency' => 'danger',
    ];

    return $colors[$this->priority] ?? 'secondary';
  }

  /**
   * Get type label.
   */
  public function getTypeLabelAttribute(): string
  {
    return $this->type === 'emergency' ? 'Emergency' : 'Normal';
  }

  /**
   * Get urgency label.
   */
  public function getUrgencyLabelAttribute(): string
  {
    $labels = [
      'routine' => 'Routine',
      'urgent' => 'Urgent',
      'critical' => 'Critical',
    ];

    return $labels[$this->urgency] ?? ucfirst($this->urgency ?? 'Routine');
  }

  /**
   * Get risk level label.
   */
  public function getRiskLevelLabelAttribute(): string
  {
    $labels = [
      'low' => 'Low Risk',
      'medium' => 'Medium Risk',
      'high' => 'High Risk',
      'critical' => 'Critical Risk',
    ];

    return $labels[$this->risk_level] ?? ucfirst($this->risk_level ?? 'Low');
  }

  /**
   * Get SLA status label.
   */
  public function getSlaStatusLabelAttribute(): string
  {
    $labels = [
      'on_track' => 'On Track',
      'at_risk' => 'At Risk',
      'breached' => 'Breached',
    ];

    return $labels[$this->sla_status] ?? 'Not Set';
  }

  // ============================================
  // NEW ACCESSORS
  // ============================================

  /**
   * Get requisition type label.
   */
  public function getRequisitionTypeLabelAttribute(): string
  {
    $labels = [
      'goods' => 'Goods (LPO)',
      'services' => 'Services (LSO)',
    ];

    return $labels[$this->requisition_type] ?? ucfirst($this->requisition_type ?? 'Goods');
  }

  /**
   * Get service category label.
   */
  public function getServiceCategoryLabelAttribute(): string
  {
    $labels = [
      'consultancy' => 'Consultancy',
      'maintenance' => 'Maintenance',
      'training' => 'Training',
      'installation' => 'Installation',
      'cleaning' => 'Cleaning',
      'security' => 'Security',
      'transport' => 'Transport',
      'construction' => 'Construction',
      'professional_services' => 'Professional Services',
      'it_services' => 'IT Services',
      'other' => 'Other',
    ];

    return $labels[$this->service_category] ?? $this->service_category ?? 'Not Specified';
  }

  /**
   * Get procurement type label.
   */
  public function getProcurementTypeLabelAttribute(): string
  {
    $labels = [
      'goods' => 'Goods (LPO)',
      'services' => 'Services (LSO)',
    ];

    return $labels[$this->procurement_type] ?? ucfirst($this->procurement_type ?? 'Goods');
  }

  /**
   * Check if requisition is for goods.
   */
  public function getIsGoodsRequisitionAttribute(): bool
  {
    return $this->requisition_type === self::TYPE_GOODS;
  }

  /**
   * Check if requisition is for services.
   */
  public function getIsServiceRequisitionAttribute(): bool
  {
    return $this->requisition_type === self::TYPE_SERVICES;
  }

  // ============================================
  // MUTATORS
  // ============================================

  /**
   * Check if requisition is editable.
   */
  public function getIsEditableAttribute(): bool
  {
    return in_array($this->status, ['draft', 'returned', 'revised']);
  }

  /**
   * Check if requisition can be approved.
   */
  public function getIsApprovableAttribute(): bool
  {
    return in_array($this->status, ['submitted', 'hod_approved', 'accountant_approved', 'principal_approved']);
  }

  /**
   * Check if requisition can be returned.
   */
  public function getIsReturnableAttribute(): bool
  {
    return in_array($this->status, ['submitted', 'hod_approved', 'accountant_approved', 'principal_approved']);
  }

  /**
   * Check if requisition can be revised.
   */
  public function getCanBeRevisedAttribute(): bool
  {
    return in_array($this->status, ['hod_declined', 'accountant_declined', 'principal_declined', 'final_declined']);
  }

  /**
   * Set the title attribute.
   */
  public function setTitleAttribute(string $value): void
  {
    $this->attributes['title'] = ucwords(strtolower(trim($value)));
  }

  /**
   * Set the requisition type with validation.
   */
  public function setRequisitionTypeAttribute(string $value): void
  {
    if (!in_array($value, [self::TYPE_GOODS, self::TYPE_SERVICES])) {
      throw new \InvalidArgumentException('Invalid requisition type. Must be "goods" or "services".');
    }
    $this->attributes['requisition_type'] = $value;
  }

  /**
   * Set the procurement type with validation.
   */
  public function setProcurementTypeAttribute(string $value): void
  {
    if (!in_array($value, [self::PROCUREMENT_GOODS, self::PROCUREMENT_SERVICES])) {
      throw new \InvalidArgumentException('Invalid procurement type. Must be "goods" or "services".');
    }
    $this->attributes['procurement_type'] = $value;
  }

  /**
   * Set the service category with validation.
   */
  public function setServiceCategoryAttribute(?string $value): void
  {
    if ($value !== null && !in_array($value, self::SERVICE_CATEGORIES)) {
      throw new \InvalidArgumentException('Invalid service category.');
    }
    $this->attributes['service_category'] = $value;
  }

  /**
   * Generate reference number.
   */
  public static function generateReferenceNumber(): string
  {
    $year = date('Y');
    $last = self::whereYear('created_at', $year)->count() + 1;

    return 'REQ-' . $year . '-' . str_pad((string) $last, 5, '0', STR_PAD_LEFT);
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopeDraft($query)
  {
    return $query->where('status', 'draft');
  }

  public function scopeSubmitted($query)
  {
    return $query->where('status', 'submitted');
  }

  public function scopePendingApproval($query)
  {
    return $query->whereIn('status', ['submitted', 'hod_approved', 'accountant_approved', 'principal_approved']);
  }

  public function scopeApproved($query)
  {
    return $query->where('status', 'final_approved');
  }

  public function scopeDeclined($query)
  {
    return $query->whereIn('status', ['hod_declined', 'accountant_declined', 'principal_declined', 'final_declined']);
  }

  public function scopeReturned($query)
  {
    return $query->where('status', 'returned');
  }

  public function scopeCancelled($query)
  {
    return $query->where('status', 'cancelled');
  }

  public function scopeEmergency($query)
  {
    return $query->where('type', 'emergency');
  }

  // ============================================
  // NEW SCOPES
  // ============================================

  /**
   * Scope to only goods requisitions.
   */
  public function scopeGoods($query)
  {
    return $query->where('requisition_type', self::TYPE_GOODS);
  }

  /**
   * Scope to only services requisitions.
   */
  public function scopeServices($query)
  {
    return $query->where('requisition_type', self::TYPE_SERVICES);
  }

  /**
   * Scope to requisitions that will generate LPO.
   */
  public function scopeForLpo($query)
  {
    return $query->where('procurement_type', self::PROCUREMENT_GOODS);
  }

  /**
   * Scope to requisitions that will generate LSO.
   */
  public function scopeForLso($query)
  {
    return $query->where('procurement_type', self::PROCUREMENT_SERVICES);
  }

  /**
   * Scope by service category.
   */
  public function scopeByServiceCategory($query, string $category)
  {
    return $query->where('service_category', $category);
  }

  public function scopeByDepartment($query, int $departmentId)
  {
    return $query->where('department_id', $departmentId);
  }

  public function scopeByUser($query, int $userId)
  {
    return $query->where('user_id', $userId);
  }

  public function scopeByStatus($query, string $status)
  {
    return $query->where('status', $status);
  }

  public function scopeByPriority($query, string $priority)
  {
    return $query->where('priority', $priority);
  }

  public function scopeDateRange($query, string $startDate, string $endDate)
  {
    return $query->whereBetween('created_at', [$startDate, $endDate]);
  }

  public function scopeSearch($query, string $search)
  {
    return $query->where(function ($q) use ($search) {
      $q->where('reference_number', 'like', "%{$search}%")
        ->orWhere('title', 'like', "%{$search}%")
        ->orWhere('description', 'like', "%{$search}%");
    });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function isDraft(): bool
  {
    return $this->status === 'draft';
  }

  public function isSubmitted(): bool
  {
    return $this->status === 'submitted';
  }

  public function isApproved(): bool
  {
    return $this->status === 'final_approved';
  }

  public function isDeclined(): bool
  {
    return in_array($this->status, ['hod_declined', 'accountant_declined', 'principal_declined', 'final_declined']);
  }

  public function isReturned(): bool
  {
    return $this->status === 'returned';
  }

  public function isCancelled(): bool
  {
    return $this->status === 'cancelled';
  }

  // ============================================
  // NEW HELPER METHODS
  // ============================================

  /**
   * Check if requisition is for goods.
   */
  public function isGoods(): bool
  {
    return $this->requisition_type === self::TYPE_GOODS;
  }

  /**
   * Check if requisition is for services.
   */
  public function isServices(): bool
  {
    return $this->requisition_type === self::TYPE_SERVICES;
  }

  /**
   * Check if requisition will generate LPO.
   */
  public function willGenerateLpo(): bool
  {
    return $this->procurement_type === self::PROCUREMENT_GOODS;
  }

  /**
   * Check if requisition will generate LSO.
   */
  public function willGenerateLso(): bool
  {
    return $this->procurement_type === self::PROCUREMENT_SERVICES;
  }

  /**
   * Get the appropriate order type based on requisition type.
   */
  public function getOrderType(): string
  {
    return $this->isGoods() ? 'LPO' : 'LSO';
  }

  /**
   * Check if requisition has service-specific fields filled.
   */
  public function hasServiceDetails(): bool
  {
    return $this->isServices() && (
      $this->service_scope_of_work !== null ||
      $this->service_deliverables_expected !== null ||
      $this->service_category !== null
    );
  }

  /**
   * Check if requisition has goods-specific fields filled.
   */
  public function hasGoodsDetails(): bool
  {
    return $this->isGoods() && (
      $this->goods_category !== null ||
      $this->goods_warehouse_location !== null ||
      $this->goods_expected_delivery_date !== null
    );
  }

  public function canBeRevised(): bool
  {
    return $this->isDeclined() && ($this->revision_count ?? 0) < 3;
  }

  public function getNextApprovalLevel(): ?string
  {
    $levels = ['hod', 'accountant', 'principal', 'final'];
    $currentIndex = array_search($this->status, array_map(function ($level) {
      return $level . '_approved';
    }, $levels));

    if ($currentIndex !== false && isset($levels[$currentIndex + 1])) {
      return $levels[$currentIndex + 1];
    }

    return null;
  }

  public function calculateTotalAmount(): float
  {
    return (float) $this->items()->sum('total_cost');
  }

  public function updateTotalAmount(): void
  {
    $this->update([
      'total_amount' => $this->calculateTotalAmount(),
    ]);
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    RequisitionHistory::create([
      'requisition_id' => $this->id,
      'user_id' => auth()->id(),
      'action' => $action,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
