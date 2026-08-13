<?php
// app/Services/CompanyProfileService.php

namespace App\Services;

use App\Models\CompanyProfile;
use App\Models\Upload;
use App\Services\UploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompanyProfileService extends BaseService
{
  protected UploadService $uploadService;

  public function __construct(UploadService $uploadService)
  {
    $this->uploadService = $uploadService;
  }

  /**
   * Get the company profile.
   */
  public function getProfile(): ?CompanyProfile
  {
    return CompanyProfile::with('companyLogoUpload')->first();
  }

  /**
   * Get or create default company profile.
   */
  public function getOrCreate(): CompanyProfile
  {
    $profile = CompanyProfile::first();

    if (!$profile) {
      $profile = CompanyProfile::create([
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

  /**
   * Create or update company profile.
   */
  public function save(array $data): CompanyProfile
  {
    return DB::transaction(function () use ($data) {
      $profile = CompanyProfile::first();

      if (!$profile) {
        Log::info('[CompanyProfileService] Creating new company profile');
        $profile = new CompanyProfile();
      } else {
        Log::info('[CompanyProfileService] Updating existing company profile', [
          'profile_id' => $profile->id,
        ]);
      }

      // Prepare update data
      $updateData = $this->prepareData($data);

      // Handle company logo upload using UploadService
      if (isset($data['company_logo']) && $data['company_logo'] instanceof UploadedFile) {
        Log::info('[CompanyProfileService] Uploading company logo', [
          'file_name' => $data['company_logo']->getClientOriginalName(),
          'file_size' => $data['company_logo']->getSize(),
        ]);

        // Delete old logo if exists
        if ($profile->company_logo_upload_id) {
          $oldUpload = Upload::find($profile->company_logo_upload_id);
          if ($oldUpload) {
            try {
              $this->uploadService->delete($oldUpload);
              Log::info('[CompanyProfileService] Deleted old logo', [
                'upload_id' => $oldUpload->id,
              ]);
            } catch (\Exception $e) {
              Log::warning('[CompanyProfileService] Failed to delete old logo: ' . $e->getMessage());
            }
          }
        }

        // Upload new logo using UploadService
        try {
          $upload = $this->uploadService->upload(
            $data['company_logo'],
            $profile,
            'company_logo',
            ($data['company_name'] ?? $profile->company_name ?? 'Company') . ' Logo',
            'Company logo for ' . ($data['company_name'] ?? $profile->company_name ?? 'Company'),
            [
              'uploaded_from' => 'company_profile',
              'company_name' => $data['company_name'] ?? $profile->company_name,
            ]
          );

          $updateData['company_logo'] = $upload->file_url;
          $updateData['company_logo_upload_id'] = $upload->id;

          Log::info('[CompanyProfileService] Logo uploaded successfully', [
            'upload_id' => $upload->id,
            'file_url' => $upload->file_url,
          ]);
        } catch (\Exception $e) {
          Log::error('[CompanyProfileService] Logo upload failed: ' . $e->getMessage());
          // Continue without logo if upload fails
        }
      }

      // Fill and save
      $profile->fill($updateData);
      $profile->save();

      Log::info('[CompanyProfileService] Profile saved successfully', [
        'profile_id' => $profile->id,
        'company_name' => $profile->company_name,
      ]);

      return $profile->fresh('companyLogoUpload');
    });
  }

  /**
   * Update company profile with provided data.
   */
  public function update(array $data): CompanyProfile
  {
    $profile = $this->getOrCreate();

    // Filter out null values
    $updateData = array_filter($data, function ($value) {
      return $value !== null;
    });

    if (!empty($updateData)) {
      $profile->update($updateData);
    }

    return $profile->fresh();
  }

  /**
   * Upload company logo (standalone method).
   */
  public function uploadLogo(UploadedFile $file, CompanyProfile $profile): Upload
  {
    // Delete old logo if exists
    if ($profile->company_logo_upload_id) {
      $oldUpload = Upload::find($profile->company_logo_upload_id);
      if ($oldUpload) {
        try {
          $this->uploadService->delete($oldUpload);
          Log::info('[CompanyProfileService] Deleted old logo for upload', [
            'upload_id' => $oldUpload->id,
          ]);
        } catch (\Exception $e) {
          Log::warning('[CompanyProfileService] Failed to delete old logo: ' . $e->getMessage());
        }
      }
    }

    // Upload new logo
    $upload = $this->uploadService->upload(
      $file,
      $profile,
      'company_logo',
      $profile->company_name . ' Logo',
      'Company logo for ' . $profile->company_name,
      [
        'uploaded_from' => 'company_profile_upload',
        'company_name' => $profile->company_name,
      ]
    );

    // Update profile with new logo
    $profile->update([
      'company_logo' => $upload->file_url,
      'company_logo_upload_id' => $upload->id,
    ]);

    Log::info('[CompanyProfileService] Logo uploaded successfully', [
      'upload_id' => $upload->id,
      'file_url' => $upload->file_url,
    ]);

    return $upload;
  }

  /**
   * Delete company logo.
   */
  public function deleteLogo(): bool
  {
    $profile = CompanyProfile::first();
    if (!$profile) {
      return false;
    }

    if ($profile->company_logo_upload_id) {
      $upload = Upload::find($profile->company_logo_upload_id);
      if ($upload) {
        try {
          $this->uploadService->delete($upload);
          Log::info('[CompanyProfileService] Deleted logo', [
            'upload_id' => $upload->id,
          ]);
        } catch (\Exception $e) {
          Log::warning('[CompanyProfileService] Failed to delete logo: ' . $e->getMessage());
        }
      }
    }

    $profile->update([
      'company_logo' => null,
      'company_logo_upload_id' => null,
    ]);

    return true;
  }

  /**
   * Prepare data for saving.
   */
  protected function prepareData(array $data): array
  {
    $fields = [
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

    $prepared = [];
    foreach ($fields as $field) {
      if (array_key_exists($field, $data)) {
        $value = $data[$field];
        // Convert empty strings to null for nullable fields
        if ($value === '' || $value === 'null') {
          $prepared[$field] = null;
        } else {
          $prepared[$field] = $value;
        }
      }
    }

    return $prepared;
  }

  /**
   * Get company profile for frontend.
   */
  public function getFrontendData(): array
  {
    $profile = $this->getOrCreate();

    return [
      'id' => $profile->id,
      'company_name' => $profile->company_name,
      'company_email' => $profile->company_email,
      'company_phone' => $profile->company_phone,
      'company_address' => $profile->company_address,
      'company_website' => $profile->company_website,
      'registration_number' => $profile->registration_number,
      'tax_id' => $profile->tax_id,
      'license_number' => $profile->license_number,
      'industry' => $profile->industry,
      'industry_label' => $profile->industry_label ?? ucfirst($profile->industry ?? ''),
      'company_size' => $profile->company_size,
      'company_size_label' => $profile->company_size_label ?? $this->getCompanySizeLabel($profile->company_size),
      'employee_count' => $profile->employee_count,
      'annual_revenue' => $profile->annual_revenue,
      'established_year' => $profile->established_year,
      'description' => $profile->description,
      'company_logo' => $profile->company_logo,
      'logo_url' => $profile->logo_url ?? $profile->company_logo,
      'favicon' => $profile->favicon,
      'primary_color' => $profile->primary_color,
      'secondary_color' => $profile->secondary_color,
      'accent_color' => $profile->accent_color,
      'font_family' => $profile->font_family,
      'contact_person_name' => $profile->contact_person_name,
      'contact_person_email' => $profile->contact_person_email,
      'contact_person_phone' => $profile->contact_person_phone,
      'social_links' => [
        'facebook' => $profile->facebook_url,
        'twitter' => $profile->twitter_url,
        'linkedin' => $profile->linkedin_url,
        'instagram' => $profile->instagram_url,
        'youtube' => $profile->youtube_url,
      ],
      'timezone' => $profile->timezone,
      'currency' => $profile->currency,
      'date_format' => $profile->date_format,
      'time_format' => $profile->time_format,
      'is_active' => $profile->is_active,
      'created_at' => $profile->created_at,
      'updated_at' => $profile->updated_at,
    ];
  }

  /**
   * Get company size label.
   */
  protected function getCompanySizeLabel(?string $size): string
  {
    $labels = [
      'small' => 'Small (1-50 employees)',
      'medium' => 'Medium (51-200 employees)',
      'large' => 'Large (201-1000 employees)',
      'enterprise' => 'Enterprise (1000+ employees)',
    ];

    return $labels[$size] ?? ucfirst($size ?? 'Not specified');
  }

  /**
   * Get profile completion status.
   */
  public function getCompletionStatus(): array
  {
    $profile = $this->getProfile();

    $fields = [
      'company_name',
      'company_email',
      'company_address',
      'company_phone',
      'company_website',
      'registration_number',
      'tax_id',
      'industry',
      'description',
      'company_logo',
      'contact_person_name',
    ];

    $missingFields = [];
    $filledCount = 0;

    if ($profile) {
      foreach ($fields as $field) {
        $value = $profile->$field;
        if (empty($value)) {
          $missingFields[] = $field;
        } else {
          $filledCount++;
        }
      }
    }

    $percentage = $profile ? round(($filledCount / count($fields)) * 100) : 0;
    $isComplete = $percentage >= 80;

    return [
      'percentage' => $percentage,
      'is_complete' => $isComplete,
      'missing_fields' => $missingFields,
    ];
  }

  /**
   * Check if company profile exists.
   */
  public function exists(): bool
  {
    return CompanyProfile::exists();
  }

  /**
   * Get company settings.
   */
  public function getSettings(): array
  {
    $profile = $this->getOrCreate();

    return [
      'company_name' => $profile->company_name,
      'company_email' => $profile->company_email,
      'company_phone' => $profile->company_phone,
      'company_address' => $profile->company_address,
      'primary_color' => $profile->primary_color,
      'secondary_color' => $profile->secondary_color,
      'accent_color' => $profile->accent_color,
      'logo_url' => $profile->logo_url ?? $profile->company_logo,
      'favicon' => $profile->favicon,
      'timezone' => $profile->timezone,
      'currency' => $profile->currency,
      'date_format' => $profile->date_format,
      'time_format' => $profile->time_format,
    ];
  }

  /**
   * Get company branding.
   */
  public function getBranding(): array
  {
    $profile = $this->getOrCreate();

    return [
      'primary_color' => $profile->primary_color,
      'secondary_color' => $profile->secondary_color,
      'accent_color' => $profile->accent_color,
      'logo_url' => $profile->logo_url ?? $profile->company_logo,
      'font_family' => $profile->font_family,
    ];
  }

  /**
   * Get social media links.
   */
  public function getSocialLinks(): array
  {
    $profile = $this->getOrCreate();

    return [
      'facebook' => $profile->facebook_url,
      'twitter' => $profile->twitter_url,
      'linkedin' => $profile->linkedin_url,
      'instagram' => $profile->instagram_url,
      'youtube' => $profile->youtube_url,
    ];
  }
}
