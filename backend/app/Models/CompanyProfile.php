<?php
// app/Models/CompanyProfile.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyProfile extends Model
{
  use HasFactory, SoftDeletes;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'company_name',
    'company_email',
    'company_phone',
    'company_address',
    'company_website',
    'registration_number',
    'tax_id',
    'license_number',
    'industry',
    'company_size',
    'employee_count',
    'annual_revenue',
    'established_year',
    'description',
    'company_logo',
    'company_logo_upload_id',
    'favicon',
    'primary_color',
    'secondary_color',
    'accent_color',
    'font_family',
    'contact_person_name',
    'contact_person_email',
    'contact_person_phone',
    'facebook_url',
    'twitter_url',
    'linkedin_url',
    'instagram_url',
    'youtube_url',
    'timezone',
    'currency',
    'date_format',
    'time_format',
    'is_active',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'is_active' => 'boolean',
    'metadata' => 'json',
    'employee_count' => 'integer',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
    'deleted_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'logo_url',
    'industry_label',
    'company_size_label',
  ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

  /**
   * Get the company logo upload.
   */
  public function companyLogoUpload(): BelongsTo
  {
    return $this->belongsTo(Upload::class, 'company_logo_upload_id');
  }

    // ============================================
    // ACCESSORS
    // ============================================

  /**
   * Get the company logo URL.
   */
  public function getLogoUrlAttribute(): ?string
  {
    if ($this->company_logo) {
      return $this->company_logo;
    }

    if ($this->companyLogoUpload) {
      return $this->companyLogoUpload->file_url;
    }

    return null;
  }

  /**
   * Get industry label.
   */
  public function getIndustryLabelAttribute(): string
  {
    $industries = [
      'education' => 'Education',
      'technology' => 'Technology',
      'healthcare' => 'Healthcare',
      'finance' => 'Finance',
      'manufacturing' => 'Manufacturing',
      'retail' => 'Retail',
      'services' => 'Services',
      'government' => 'Government',
      'nonprofit' => 'Non-Profit',
      'agriculture' => 'Agriculture',
      'construction' => 'Construction',
      'transportation' => 'Transportation',
      'hospitality' => 'Hospitality',
      'real_estate' => 'Real Estate',
      'other' => 'Other',
    ];

    return $industries[$this->industry] ?? ucfirst($this->industry ?? 'Not specified');
  }

  /**
   * Get company size label.
   */
  public function getCompanySizeLabelAttribute(): string
  {
    $sizes = [
      'small' => 'Small (1-50 employees)',
      'medium' => 'Medium (51-200 employees)',
      'large' => 'Large (201-1000 employees)',
      'enterprise' => 'Enterprise (1000+ employees)',
    ];

    return $sizes[$this->company_size] ?? ucfirst($this->company_size ?? 'Not specified');
  }

    // ============================================
    // SCOPES
    // ============================================

  /**
   * Scope for active company profiles.
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  /**
   * Scope for searching.
   */
  public function scopeSearch($query, string $search)
  {
    return $query->where(function ($q) use ($search) {
      $q->where('company_name', 'LIKE', "%{$search}%")
        ->orWhere('company_email', 'LIKE', "%{$search}%")
        ->orWhere('registration_number', 'LIKE', "%{$search}%")
        ->orWhere('tax_id', 'LIKE', "%{$search}%");
    });
  }

    // ============================================
    // HELPER METHODS
    // ============================================

  /**
   * Check if company profile exists.
   */
  public static function exists(): bool
  {
    return self::count() > 0;
  }

  /**
   * Get the first company profile or create default.
   */
  public static function getDefault(): self
  {
    $profile = self::first();

    if (!$profile) {
      $profile = self::create([
        'company_name' => config('app.name', 'SSPMS'),
        'company_email' => 'info@sspms.com',
        'company_phone' => '+254 700 000 000',
        'company_address' => 'P.O. Box 123, Nairobi, Kenya',
        'primary_color' => '#1a237e',
        'secondary_color' => '#3498db',
        'accent_color' => '#ffc107',
        'currency' => 'KES',
        'timezone' => 'Africa/Nairobi',
        'is_active' => true,
      ]);
    }

    return $profile;
  }
}
