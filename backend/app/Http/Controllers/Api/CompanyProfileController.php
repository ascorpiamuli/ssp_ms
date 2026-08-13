<?php
// app/Http/Controllers/Api/CompanyProfileController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CompanyProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class CompanyProfileController extends Controller
{
  protected CompanyProfileService $companyProfileService;

  public function __construct(CompanyProfileService $companyProfileService)
  {
    $this->companyProfileService = $companyProfileService;
  }

  /**
   * Get company profile.
   */
  public function index(): JsonResponse
  {
    try {
      $profile = $this->companyProfileService->getFrontendData();

      return response()->json([
        'success' => true,
        'data' => $profile,
        'message' => 'Company profile retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error fetching profile', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve company profile: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Create or update company profile.
   */
  public function save(Request $request): JsonResponse
  {
    try {
      Log::info('[CompanyProfileController] Saving company profile', [
        'data' => $request->all(),
        'has_logo' => $request->hasFile('company_logo'),
      ]);

      $validated = $request->validate([
        'company_name' => 'required|string|max:255',
        'company_email' => 'required|email|max:255',
        'company_phone' => 'nullable|string|max:50',
        'company_address' => 'nullable|string|max:500',
        'company_website' => 'nullable|url|max:255',
        'registration_number' => 'nullable|string|max:100',
        'tax_id' => 'nullable|string|max:100',
        'license_number' => 'nullable|string|max:100',
        'industry' => 'nullable|string|max:100',
        'company_size' => 'nullable|string|in:small,medium,large,enterprise',
        'employee_count' => 'nullable|integer|min:0',
        'annual_revenue' => 'nullable|string|max:100',
        'established_year' => 'nullable|string|max:10',
        'description' => 'nullable|string|max:1000',
        'company_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
        'favicon' => 'nullable|string|max:255',
        'primary_color' => 'nullable|string|max:20',
        'secondary_color' => 'nullable|string|max:20',
        'accent_color' => 'nullable|string|max:20',
        'font_family' => 'nullable|string|max:100',
        'contact_person_name' => 'nullable|string|max:255',
        'contact_person_email' => 'nullable|email|max:255',
        'contact_person_phone' => 'nullable|string|max:50',
        'facebook_url' => 'nullable|url|max:255',
        'twitter_url' => 'nullable|url|max:255',
        'linkedin_url' => 'nullable|url|max:255',
        'instagram_url' => 'nullable|url|max:255',
        'youtube_url' => 'nullable|url|max:255',
        'timezone' => 'nullable|string|max:100',
        'currency' => 'nullable|string|max:10',
        'date_format' => 'nullable|string|max:50',
        'time_format' => 'nullable|string|max:50',
        'is_active' => 'nullable|boolean',
      ]);

      // Handle file upload separately
      $data = $validated;
      if ($request->hasFile('company_logo')) {
        $data['company_logo'] = $request->file('company_logo');
      }

      $profile = $this->companyProfileService->save($data);

      return response()->json([
        'success' => true,
        'data' => $profile,
        'message' => 'Company profile saved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error saving profile', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to save company profile: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete company logo.
   */
  public function deleteLogo(): JsonResponse
  {
    try {
      $result = $this->companyProfileService->deleteLogo();

      if (!$result) {
        return response()->json([
          'success' => false,
          'message' => 'No company logo found to delete.',
        ], 404);
      }

      return response()->json([
        'success' => true,
        'message' => 'Company logo deleted successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error deleting logo', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to delete logo: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get company profile completion status.
   */
  public function getCompletionStatus(): JsonResponse
  {
    try {
      $profile = $this->companyProfileService->getProfile();

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

      return response()->json([
        'success' => true,
        'data' => [
          'percentage' => $percentage,
          'is_complete' => $isComplete,
          'missing_fields' => $missingFields,
        ],
        'message' => 'Completion status retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error getting completion status', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get completion status: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get company settings.
   */
  public function getSettings(): JsonResponse
  {
    try {
      $profile = $this->companyProfileService->getOrCreate();

      return response()->json([
        'success' => true,
        'data' => [
          'company_name' => $profile->company_name,
          'company_email' => $profile->company_email,
          'company_phone' => $profile->company_phone,
          'company_address' => $profile->company_address,
          'primary_color' => $profile->primary_color,
          'secondary_color' => $profile->secondary_color,
          'accent_color' => $profile->accent_color,
          'logo_url' => $profile->logo_url,
          'favicon' => $profile->favicon,
          'timezone' => $profile->timezone,
          'currency' => $profile->currency,
          'date_format' => $profile->date_format,
          'time_format' => $profile->time_format,
        ],
        'message' => 'Settings retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error getting settings', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get settings: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update company settings.
   */
  public function updateSettings(Request $request): JsonResponse
  {
    try {
      $validated = $request->validate([
        'company_name' => 'nullable|string|max:255',
        'company_email' => 'nullable|email|max:255',
        'company_phone' => 'nullable|string|max:50',
        'company_address' => 'nullable|string|max:500',
        'primary_color' => 'nullable|string|max:20',
        'secondary_color' => 'nullable|string|max:20',
        'accent_color' => 'nullable|string|max:20',
        'favicon' => 'nullable|string|max:255',
        'timezone' => 'nullable|string|max:100',
        'currency' => 'nullable|string|max:10',
        'date_format' => 'nullable|string|max:50',
        'time_format' => 'nullable|string|max:50',
      ]);

      $profile = $this->companyProfileService->update($validated);

      return response()->json([
        'success' => true,
        'data' => [
          'company_name' => $profile->company_name,
          'company_email' => $profile->company_email,
          'company_phone' => $profile->company_phone,
          'company_address' => $profile->company_address,
          'primary_color' => $profile->primary_color,
          'secondary_color' => $profile->secondary_color,
          'accent_color' => $profile->accent_color,
          'logo_url' => $profile->logo_url,
          'favicon' => $profile->favicon,
          'timezone' => $profile->timezone,
          'currency' => $profile->currency,
          'date_format' => $profile->date_format,
          'time_format' => $profile->time_format,
        ],
        'message' => 'Settings updated successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error updating settings', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to update settings: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get company branding.
   */
  public function getBranding(): JsonResponse
  {
    try {
      $profile = $this->companyProfileService->getOrCreate();

      return response()->json([
        'success' => true,
        'data' => [
          'primary_color' => $profile->primary_color,
          'secondary_color' => $profile->secondary_color,
          'accent_color' => $profile->accent_color,
          'logo_url' => $profile->logo_url,
          'font_family' => $profile->font_family,
        ],
        'message' => 'Branding retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error getting branding', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get branding: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update company branding.
   */
  public function updateBranding(Request $request): JsonResponse
  {
    try {
      $validated = $request->validate([
        'primary_color' => 'nullable|string|max:20',
        'secondary_color' => 'nullable|string|max:20',
        'accent_color' => 'nullable|string|max:20',
        'font_family' => 'nullable|string|max:100',
      ]);

      $profile = $this->companyProfileService->update($validated);

      return response()->json([
        'success' => true,
        'data' => [
          'primary_color' => $profile->primary_color,
          'secondary_color' => $profile->secondary_color,
          'accent_color' => $profile->accent_color,
          'logo_url' => $profile->logo_url,
          'font_family' => $profile->font_family,
        ],
        'message' => 'Branding updated successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error updating branding', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to update branding: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get social media links.
   */
  public function getSocialLinks(): JsonResponse
  {
    try {
      $profile = $this->companyProfileService->getOrCreate();

      return response()->json([
        'success' => true,
        'data' => [
          'facebook' => $profile->facebook_url,
          'twitter' => $profile->twitter_url,
          'linkedin' => $profile->linkedin_url,
          'instagram' => $profile->instagram_url,
          'youtube' => $profile->youtube_url,
        ],
        'message' => 'Social links retrieved successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error getting social links', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get social links: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update social media links.
   */
  public function updateSocialLinks(Request $request): JsonResponse
  {
    try {
      $validated = $request->validate([
        'facebook_url' => 'nullable|url|max:255',
        'twitter_url' => 'nullable|url|max:255',
        'linkedin_url' => 'nullable|url|max:255',
        'instagram_url' => 'nullable|url|max:255',
        'youtube_url' => 'nullable|url|max:255',
      ]);

      $profile = $this->companyProfileService->update($validated);

      return response()->json([
        'success' => true,
        'data' => [
          'facebook' => $profile->facebook_url,
          'twitter' => $profile->twitter_url,
          'linkedin' => $profile->linkedin_url,
          'instagram' => $profile->instagram_url,
          'youtube' => $profile->youtube_url,
        ],
        'message' => 'Social links updated successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error updating social links', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to update social links: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Upload company logo.
   */
  public function uploadLogo(Request $request): JsonResponse
  {
    try {
      $request->validate([
        'company_logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
      ]);

      $file = $request->file('company_logo');

      // Get the current profile or create a new one
      $profile = $this->companyProfileService->getOrCreate();

      // Upload the logo
      $upload = $this->companyProfileService->uploadLogo($file, $profile);

      return response()->json([
        'success' => true,
        'data' => [
          'file_url' => $upload->file_url,
          'upload_id' => $upload->id,
        ],
        'message' => 'Logo uploaded successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error uploading logo', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to upload logo: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Check if company profile exists.
   */
  public function exists(): JsonResponse
  {
    try {
      $profile = $this->companyProfileService->getProfile();

      return response()->json([
        'success' => true,
        'data' => [
          'exists' => $profile !== null,
        ],
        'message' => 'Company profile existence checked successfully.',
      ]);
    } catch (\Exception $e) {
      Log::error('[CompanyProfileController] Error checking existence', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to check company profile existence: ' . $e->getMessage(),
      ], 500);
    }
  }
}
