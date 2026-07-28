<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'user_id',
    'company_name',
    'company_email',
    'company_phone',
    'company_registration',
    'company_address',
    'company_website',
    'tax_id',
    'category',
    'status',
    'blacklist_reason',
    'blacklisted_by',
    'blacklisted_at',
    'created_by',

    // New fields
    'description',
    'established_year',
    'employee_count',
    'annual_revenue',
    'certifications',
    'registration_date',
    'license_number',
    'bank_name',
    'bank_account',
    'bank_branch',
    'payment_terms',
    'preferred_currency',
    'contact_person_name',
    'contact_person_email',
    'contact_person_phone',
    'company_logo',
    'company_logo_upload_id',
  ];

  protected $casts = [
    'blacklisted_at' => 'datetime',
    'registration_date' => 'date',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
    'deleted_at' => 'datetime',
    'category' => 'string',
    'status' => 'string',
  ];

  /**
   * Get the user that owns the supplier account.
   */
  public function user()
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Get the user who created this supplier.
   */
  public function creator()
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  /**
   * Get the user who blacklisted this supplier.
   */
  public function blacklistedBy()
  {
    return $this->belongsTo(User::class, 'blacklisted_by');
  }

  /**
   * Get the company logo upload.
   */
  public function companyLogoUpload()
  {
    return $this->belongsTo(Upload::class, 'company_logo_upload_id');
  }

  /**
   * Get the supplier's full address.
   */
  public function getFullAddressAttribute(): string
  {
    $parts = array_filter([
      $this->company_address,
      $this->city ?? null,
      $this->state ?? null,
      $this->postal_code ?? null,
      $this->country ?? null,
    ]);

    return implode(', ', $parts);
  }

  /**
   * Get the supplier's display name.
   */
  public function getDisplayNameAttribute(): string
  {
    return $this->company_name . ' (' . $this->company_email . ')';
  }

  /**
   * Get the formatted annual revenue.
   */
  public function getFormattedAnnualRevenueAttribute(): string
  {
    if (!$this->annual_revenue) {
      return 'N/A';
    }
    return 'KSh ' . number_format((float) $this->annual_revenue, 2);
  }

  /**
   * Scope for active suppliers.
   */
  public function scopeActive($query)
  {
    return $query->where('status', 'ACTIVE');
  }

  /**
   * Scope for blacklisted suppliers.
   */
  public function scopeBlacklisted($query)
  {
    return $query->where('status', 'BLACKLISTED');
  }

  /**
   * Scope for suppliers by category.
   */
  public function scopeCategory($query, string $category)
  {
    return $query->where('category', $category);
  }

  /**
   * Scope for suppliers with valid registration.
   */
  public function scopeValidRegistration($query)
  {
    return $query->whereNotNull('company_registration');
  }

  /**
   * Check if supplier is active.
   */
  public function isActive(): bool
  {
    return $this->status === 'ACTIVE';
  }

  /**
   * Check if supplier is blacklisted.
   */
  public function isBlacklisted(): bool
  {
    return $this->status === 'BLACKLISTED';
  }

  /**
   * Check if supplier has a company logo.
   */
  public function hasCompanyLogo(): bool
  {
    return !is_null($this->company_logo);
  }

  /**
   * Get the company logo URL.
   */
  public function getCompanyLogoUrlAttribute(): ?string
  {
    return $this->company_logo ?? null;
  }

  /**
   * Get the supplier's category label.
   */
  public function getCategoryLabelAttribute(): string
  {
    $labels = [
      'goods' => 'Goods Supplier',
      'services' => 'Services Provider',
      'both' => 'Both Goods & Services',
    ];

    return $labels[$this->category] ?? $this->category;
  }

  /**
   * Get the supplier's status label.
   */
  public function getStatusLabelAttribute(): string
  {
    $labels = [
      'ACTIVE' => 'Active',
      'INACTIVE' => 'Inactive',
      'BLACKLISTED' => 'Blacklisted',
    ];

    return $labels[$this->status] ?? $this->status;
  }

  /**
   * Get the supplier's status color.
   */
  public function getStatusColorAttribute(): string
  {
    $colors = [
      'ACTIVE' => 'green',
      'INACTIVE' => 'gray',
      'BLACKLISTED' => 'red',
    ];

    return $colors[$this->status] ?? 'gray';
  }

  /**
   * Get the supplier's category color.
   */
  public function getCategoryColorAttribute(): string
  {
    $colors = [
      'goods' => 'blue',
      'services' => 'purple',
      'both' => 'orange',
    ];

    return $colors[$this->category] ?? 'gray';
  }

  /**
   * Get the contact person's full name.
   */
  public function getContactPersonFullNameAttribute(): string
  {
    return $this->contact_person_name ?? 'N/A';
  }

  /**
   * Get the supplier's banking details summary.
   */
  public function getBankingSummaryAttribute(): string
  {
    $parts = array_filter([
      $this->bank_name,
      $this->bank_branch,
      $this->bank_account ? 'Account: ' . $this->bank_account : null,
    ]);

    return implode(' - ', $parts) ?: 'No banking information provided';
  }

  /**
   * Get the supplier's certifications as array.
   */
  public function getCertificationsArrayAttribute(): array
  {
    if (!$this->certifications) {
      return [];
    }

    return array_map('trim', explode(',', $this->certifications));
  }
}
