// frontend/src/hooks/useCompanyProfile.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompanyService, UpdateCompanyProfileData } from '@/services/company.service';
import { CompanySettings } from '../types/company.types';

export function useCompanyProfile() {
  const queryClient = useQueryClient();

  // ============================================
  // QUERIES
  // ============================================

  /**
   * Query: Get company profile
   */
  const useGetProfile = () => {
    return useQuery({
      queryKey: ['company', 'profile'],
      queryFn: CompanyService.getProfile,
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Query: Get company settings
   */
  const useGetSettings = () => {
    return useQuery({
      queryKey: ['company', 'settings'],
      queryFn: CompanyService.getSettings,
      staleTime: 10 * 60 * 1000,
    });
  };

  /**
   * Query: Get company branding
   */
  const useGetBranding = () => {
    return useQuery({
      queryKey: ['company', 'branding'],
      queryFn: CompanyService.getBranding,
      staleTime: 10 * 60 * 1000,
    });
  };

  /**
   * Query: Get social media links
   */
  const useGetSocialLinks = () => {
    return useQuery({
      queryKey: ['company', 'social-links'],
      queryFn: CompanyService.getSocialLinks,
      staleTime: 10 * 60 * 1000,
    });
  };

  /**
   * Query: Check if company profile exists
   */
  const useExists = () => {
    return useQuery({
      queryKey: ['company', 'exists'],
      queryFn: CompanyService.exists,
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Query: Get profile completion status
   */
  const useGetCompletionStatus = () => {
    return useQuery({
      queryKey: ['company', 'completion'],
      queryFn: CompanyService.getCompletionStatus,
      staleTime: 2 * 60 * 1000,
    });
  };

  // ============================================
  // MUTATIONS
  // ============================================

  /**
   * Mutation: Save company profile (with file upload)
   */
  const saveProfile = useMutation({
    mutationFn: (data: FormData) => CompanyService.saveProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'branding'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'completion'] });
    },
  });

  /**
   * Mutation: Update company profile (JSON only)
   */
  const updateProfile = useMutation({
    mutationFn: (data: UpdateCompanyProfileData) => CompanyService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'branding'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'completion'] });
    },
  });

  /**
   * Mutation: Delete company logo
   */
  const deleteLogo = useMutation({
    mutationFn: CompanyService.deleteLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'branding'] });
    },
  });

  /**
   * Mutation: Upload company logo
   */
  const uploadLogo = useMutation({
    mutationFn: (file: File) => CompanyService.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'branding'] });
    },
  });

  /**
   * Mutation: Update company branding
   */
  const updateBranding = useMutation({
    mutationFn: (data: { primary_color?: string; secondary_color?: string; accent_color?: string; font_family?: string }) =>
      CompanyService.updateBranding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'branding'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
    },
  });

  /**
   * Mutation: Update social media links
   */
  const updateSocialLinks = useMutation({
    mutationFn: (data: { facebook_url?: string; twitter_url?: string; linkedin_url?: string; instagram_url?: string; youtube_url?: string }) =>
      CompanyService.updateSocialLinks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'social-links'] });
    },
  });

  /**
   * Mutation: Update company settings
   */
  const updateSettings = useMutation({
    mutationFn: (data: Partial<CompanySettings>) => CompanyService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'branding'] });
    },
  });

  // ============================================
  // RETURN
  // ============================================

  return {
    // Queries
    useGetProfile,
    useGetSettings,
    useGetBranding,
    useGetSocialLinks,
    useExists,
    useGetCompletionStatus,

    // Mutations
    saveProfile,
    updateProfile,
    deleteLogo,
    uploadLogo,
    updateBranding,
    updateSocialLinks,
    updateSettings,
  };
}
