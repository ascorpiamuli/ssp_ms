<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      // Basic Information
      'id' => $this->id,
      'user_id' => $this->user_id,
      'company_name' => $this->company_name,
      'company_email' => $this->company_email,
      'company_phone' => $this->company_phone,
      'company_registration' => $this->company_registration,
      'company_address' => $this->company_address,
      'company_website' => $this->company_website,
      'tax_id' => $this->tax_id,
      'category' => $this->category,
      'category_label' => $this->category_label,
      'category_color' => $this->category_color,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'blacklist_reason' => $this->blacklist_reason,
      'blacklisted_at' => $this->blacklisted_at,

      // New Company Details
      'description' => $this->description,
      'established_year' => $this->established_year,
      'employee_count' => $this->employee_count,
      'annual_revenue' => $this->annual_revenue,
      'formatted_annual_revenue' => $this->formatted_annual_revenue,
      'certifications' => $this->certifications,
      'certifications_array' => $this->certifications_array,
      'registration_date' => $this->registration_date?->toDateString(),
      'license_number' => $this->license_number,

      // Banking Information
      'bank_name' => $this->bank_name,
      'bank_account' => $this->bank_account,
      'bank_branch' => $this->bank_branch,
      'payment_terms' => $this->payment_terms,
      'preferred_currency' => $this->preferred_currency,
      'banking_summary' => $this->banking_summary,

      // Contact Person
      'contact_person_name' => $this->contact_person_name,
      'contact_person_full_name' => $this->contact_person_full_name,
      'contact_person_email' => $this->contact_person_email,
      'contact_person_phone' => $this->contact_person_phone,

      // Company Logo
      'company_logo' => $this->company_logo,
      'company_logo_url' => $this->company_logo_url,
      'company_logo_upload_id' => $this->company_logo_upload_id,
      'has_company_logo' => $this->hasCompanyLogo(),

      // Derived Attributes
      'full_address' => $this->full_address,
      'display_name' => $this->display_name,
      'is_active' => $this->isActive(),
      'is_blacklisted' => $this->isBlacklisted(),

      // Relationships
      'user' => $this->whenLoaded('user', function () {
        return [
          'id' => $this->user->id,
          'full_name' => $this->user->full_name,
          'email' => $this->user->email,
          'phone' => $this->user->phone,
          'avatar_url' => $this->user->avatar_url ?? null,
        ];
      }),
      'created_by' => $this->whenLoaded('creator', function () {
        return [
          'id' => $this->creator->id,
          'full_name' => $this->creator->full_name,
        ];
      }),
      'blacklisted_by' => $this->whenLoaded('blacklistedBy', function () {
        return [
          'id' => $this->blacklistedBy->id,
          'full_name' => $this->blacklistedBy->full_name,
        ];
      }),
      'company_logo_upload' => $this->whenLoaded('companyLogoUpload', function () {
        return [
          'id' => $this->companyLogoUpload->id,
          'file_name' => $this->companyLogoUpload->file_name,
          'file_url' => $this->companyLogoUpload->file_url,
          'file_size' => $this->companyLogoUpload->formatted_size,
        ];
      }),

      // Timestamps
      'created_at' => $this->created_at?->toISOString(),
      'updated_at' => $this->updated_at?->toISOString(),
      'deleted_at' => $this->deleted_at?->toISOString(),
    ];
  }
}
