// frontend/src/types/company.types.ts

import { ApiResponse } from './auth.types';

// ============================================
// COMPANY PROFILE ENUMS
// ============================================

export type CompanySize = 'small' | 'medium' | 'large' | 'enterprise';
export type Industry =
  | 'education'
  | 'technology'
  | 'healthcare'
  | 'finance'
  | 'manufacturing'
  | 'retail'
  | 'services'
  | 'government'
  | 'nonprofit'
  | 'agriculture'
  | 'construction'
  | 'transportation'
  | 'hospitality'
  | 'real_estate'
  | 'other';

// ============================================
// COMPANY PROFILE
// ============================================

export interface CompanyProfile {
  id: number;

  // Basic Information
  company_name: string;
  company_email: string;
  company_phone: string | null;
  company_address: string | null;
  company_website: string | null;

  // Registration & Identification
  registration_number: string | null;
  tax_id: string | null;
  license_number: string | null;

  // Company Details
  industry: Industry | null;
  industry_label: string;
  company_size: CompanySize | null;
  company_size_label: string;
  employee_count: number | null;
  annual_revenue: string | null;
  established_year: string | null;
  description: string | null;

  // Branding & Design
  company_logo: string | null;
  logo_url: string | null;
  favicon: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;

  // Contact Information
  contact_person_name: string | null;
  contact_person_email: string | null;
  contact_person_phone: string | null;

  // Social Media Links
  social_links: {
    facebook: string | null;
    twitter: string | null;
    linkedin: string | null;
    instagram: string | null;
    youtube: string | null;
  };

  // System Settings
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  is_active: boolean;

  // Metadata
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface CompanyProfileFormData {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  company_website: string;
  registration_number: string;
  tax_id: string;
  license_number: string;
  industry: Industry | '';
  company_size: CompanySize | '';
  employee_count: number | string;
  annual_revenue: string;
  established_year: string;
  description: string;
  company_logo: File | null;
  favicon: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  facebook_url: string;
  twitter_url: string;
  linkedin_url: string;
  instagram_url: string;
  youtube_url: string;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  is_active: boolean;
}

export interface CompanyProfileUpdateData extends Partial<CompanyProfileFormData> { }

// ============================================
// COMPANY SETTINGS
// ============================================

export interface CompanySettings {
  company_name: string;
  company_email: string;
  company_phone: string | null;
  company_address: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url: string | null;
  favicon: string | null;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export type CompanyProfileResponse = ApiResponse<CompanyProfile>;
export type CompanyProfileListResponse = ApiResponse<CompanyProfile[]>;
export type CompanySettingsResponse = ApiResponse<CompanySettings>;

// ============================================
// HELPER TYPES
// ============================================

export interface CompanyLogoUploadResponse {
  success: boolean;
  data: {
    file_url: string;
    upload_id: number;
  };
  message: string;
}

export interface CompanyProfileExistsResponse {
  success: boolean;
  data: {
    exists: boolean;
    profile?: CompanyProfile;
  };
  message: string;
}
