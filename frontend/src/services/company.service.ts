// frontend/src/services/company.service.ts

import { privateApi } from './api';

// ============================================
// TYPES
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

export interface CompanyProfile {
  id: number;
  company_name: string;
  company_email: string;
  company_phone: string | null;
  company_address: string | null;
  company_website: string | null;
  registration_number: string | null;
  tax_id: string | null;
  license_number: string | null;
  industry: Industry | null;
  industry_label: string;
  company_size: CompanySize | null;
  company_size_label: string;
  employee_count: number | null;
  annual_revenue: string | null;
  established_year: string | null;
  description: string | null;
  company_logo: string | null;
  logo_url: string | null;
  favicon: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  contact_person_name: string | null;
  contact_person_email: string | null;
  contact_person_phone: string | null;
  social_links: {
    facebook: string | null;
    twitter: string | null;
    linkedin: string | null;
    instagram: string | null;
    youtube: string | null;
  };
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  is_active: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

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

export interface CompanyBranding {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url: string | null;
  font_family: string;
}

export interface CompanySocialLinks {
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
}

export interface UpdateCompanyProfileData {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_website?: string;
  registration_number?: string;
  tax_id?: string;
  license_number?: string;
  industry?: Industry | '';
  company_size?: CompanySize | '';
  employee_count?: number | string;
  annual_revenue?: string;
  established_year?: string;
  description?: string;
  favicon?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  timezone?: string;
  currency?: string;
  date_format?: string;
  time_format?: string;
  is_active?: boolean;
}

export class CompanyService {
  /**
   * Get company profile
   */
  static async getProfile(): Promise<{ success: boolean; data: CompanyProfile }> {
    return privateApi.get('/company/profile');
  }

  /**
   * Create or update company profile
   */
  static async saveProfile(data: FormData): Promise<{ success: boolean; data: CompanyProfile }> {
    return privateApi.post('/company/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Update company profile (JSON)
   */
  static async updateProfile(data: UpdateCompanyProfileData): Promise<{ success: boolean; data: CompanyProfile }> {
    return privateApi.put('/company/profile', data);
  }

  /**
   * Delete company logo
   */
  static async deleteLogo(): Promise<{ success: boolean; message: string }> {
    return privateApi.delete('/company/profile/logo');
  }

  /**
   * Get company settings (for system-wide use)
   */
  static async getSettings(): Promise<{ success: boolean; data: CompanySettings }> {
    return privateApi.get('/company/settings');
  }

  /**
   * Update company settings
   */
  static async updateSettings(data: Partial<CompanySettings>): Promise<{ success: boolean; data: CompanySettings }> {
    return privateApi.put('/company/settings', data);
  }

  /**
   * Get company branding colors
   */
  static async getBranding(): Promise<{ success: boolean; data: CompanyBranding }> {
    return privateApi.get('/company/branding');
  }

  /**
   * Update branding colors
   */
  static async updateBranding(data: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    font_family?: string;
  }): Promise<{ success: boolean; data: CompanyBranding }> {
    return privateApi.put('/company/branding', data);
  }

  /**
   * Get social media links
   */
  static async getSocialLinks(): Promise<{ success: boolean; data: CompanySocialLinks }> {
    return privateApi.get('/company/social-links');
  }

  /**
   * Update social media links
   */
  static async updateSocialLinks(data: {
    facebook_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
    youtube_url?: string;
  }): Promise<{ success: boolean; data: CompanySocialLinks }> {
    return privateApi.put('/company/social-links', data);
  }

  /**
   * Upload company logo
   */
  static async uploadLogo(file: File): Promise<{ success: boolean; data: { file_url: string; upload_id: number } }> {
    const formData = new FormData();
    formData.append('company_logo', file);
    return privateApi.post('/company/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Check if company profile exists
   */
  static async exists(): Promise<{ success: boolean; data: { exists: boolean } }> {
    return privateApi.get('/company/exists');
  }

  /**
   * Get profile completion percentage
   */
  static async getCompletionStatus(): Promise<{
    success: boolean;
    data: {
      percentage: number;
      is_complete: boolean;
      missing_fields: string[]
    }
  }> {
    return privateApi.get('/company/completion');
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get company logo URL
   */
  static getLogoUrl(profile: CompanyProfile | null): string | null {
    if (!profile) return null;
    return profile.logo_url || profile.company_logo || null;
  }

  /**
   * Get full company address as string
   */
  static getFullAddress(profile: CompanyProfile | null): string {
    if (!profile || !profile.company_address) return '';
    return profile.company_address;
  }

  /**
   * Get company display name
   */
  static getDisplayName(profile: CompanyProfile | null): string {
    if (!profile) return 'SSPMS';
    return profile.company_name || 'SSPMS';
  }

  /**
   * Check if profile is complete
   */
  static isProfileComplete(profile: CompanyProfile | null): boolean {
    if (!profile) return false;
    return !!(
      profile.company_name &&
      profile.company_email &&
      profile.company_address
    );
  }

  /**
   * Get profile completion percentage
   */
  static getCompletionPercentage(profile: CompanyProfile | null): number {
    if (!profile) return 0;

    const fields = [
      profile.company_name,
      profile.company_email,
      profile.company_phone,
      profile.company_address,
      profile.company_website,
      profile.registration_number,
      profile.tax_id,
      profile.industry,
      profile.description,
      profile.logo_url,
      profile.contact_person_name,
    ];

    const filled = fields.filter(f => f && f.trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }
}
