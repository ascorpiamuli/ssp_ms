// frontend/src/services/signature.service.ts

import { api, publicApi } from './api';
import type {
  SignatureSpecimen,
  SignatureVerification,
  SignatureStatus,
  QRCodeData,
  QRCodeVerificationResult,
  SignatureStats,
  UploadSignatureRequest,
  VerifySignatureRequest,
  VerifySignatureQRRequest,
  RejectSignatureRequest,
  SignatureVerificationLog,
  PublicSignatureData,
  PublicSignatureStatusData,
} from '@/types/signature.types';

const BASE_URL = '/signatures';

console.log('🔧 [SignatureService] Initialized with BASE_URL:', BASE_URL);

// Helper to get full image URL - only for signature images, not QR codes
const getFullImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;

  // If it's already a full URL or data URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiUrl = baseUrl || 'https://api.sspmis.pasbestventures.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${apiUrl}${cleanPath}`;
};

export const signatureService = {
  // ============================================
  // AUTHENTICATED USER ENDPOINTS
  // ============================================

  /**
   * Get authenticated user's signature
   * Requires authentication
   * @route GET /api/v1/signatures/my
   */
  getMySignature: async (): Promise<SignatureSpecimen | null> => {
    console.log('📄 [SignatureService.getMySignature] Fetching authenticated user signature...');
    try {
      const response = await api.get(`${BASE_URL}/my`);
      console.log('📄 [SignatureService.getMySignature] Response:', response);

      const signatureData = response;

      if (!signatureData || !signatureData.id) {
        console.log('📄 [SignatureService.getMySignature] No signature found, returning null');
        return null;
      }

      // Fix the signature image URL
      if (signatureData.signature_image_url) {
        signatureData.signature_image_url = getFullImageUrl(signatureData.signature_image_url);
      }

      console.log('📄 [SignatureService.getMySignature] Returning signature:', {
        id: signatureData.id,
        hasImage: !!signatureData.signature_image_url,
        status: signatureData.status,
      });
      return signatureData;
    } catch (error) {
      console.error('📄 [SignatureService.getMySignature] Error fetching signature:', error);
      throw error;
    }
  },

  /**
   * Get authenticated user's signature status
   * Requires authentication
   * @route GET /api/v1/signatures/my/status
   */
  getMyStatus: async (): Promise<SignatureStatus | null> => {
    console.log('📊 [SignatureService.getMyStatus] Fetching authenticated user status...');
    try {
      const response = await api.get(`${BASE_URL}/my/status`);
      console.log('📊 [SignatureService.getMyStatus] Response:', response);

      const statusData = response;

      if (!statusData || !statusData.status) {
        console.warn('📊 [SignatureService.getMyStatus] No valid status data received');
        return {
          status: 'none',
          label: 'No Signature',
          color: 'secondary',
          message: "You haven't uploaded a signature yet.",
          specimen: null,
        } as SignatureStatus;
      }

      return statusData;
    } catch (error) {
      console.error('📊 [SignatureService.getMyStatus] Error fetching status:', error);
      throw error;
    }
  },

  // ============================================
  // PUBLIC/UNAUTHENTICATED USER ENDPOINTS
  // ============================================

  /**
   * Get public signature by token
   * No authentication required
   * @route GET /api/v1/signatures/public/{token}
   */
  getPublicSignature: async (token: string): Promise<PublicSignatureData | null> => {
    console.log('🌐 [SignatureService.getPublicSignature] Fetching public signature by token', {
      token_preview: token.substring(0, 10) + '...',
    });
    try {
      const response = await publicApi.get(`${BASE_URL}/public/${token}`);
      console.log('🌐 [SignatureService.getPublicSignature] Response:', response);

      const data = response;

      if (!data || !data.specimen) {
        console.log('🌐 [SignatureService.getPublicSignature] No signature found');
        return null;
      }

      // Fix the signature image URL if present
      if (data.specimen?.signature_image_url) {
        data.specimen.signature_image_url = getFullImageUrl(data.specimen.signature_image_url);
      }

      return data;
    } catch (error) {
      console.error('🌐 [SignatureService.getPublicSignature] Error fetching public signature:', error);
      throw error;
    }
  },

  /**
   * Get public signature status by token
   * No authentication required
   * @route GET /api/v1/signatures/public/{token}/status
   */
  getPublicStatus: async (token: string): Promise<PublicSignatureStatusData | null> => {
    console.log('🌐 [SignatureService.getPublicStatus] Fetching public status by token', {
      token_preview: token.substring(0, 10) + '...',
    });
    try {
      const response = await publicApi.get(`${BASE_URL}/public/${token}/status`);
      console.log('🌐 [SignatureService.getPublicStatus] Response:', response);

      const data = response;

      if (!data) {
        console.log('🌐 [SignatureService.getPublicStatus] No status data found');
        return null;
      }

      return data;
    } catch (error) {
      console.error('🌐 [SignatureService.getPublicStatus] Error fetching public status:', error);
      throw error;
    }
  },

  /**
   * Verify signature by Secure Token (QR Code flow)
   * No authentication required
   * @route GET /api/v1/signatures/token/{token}
   */
  verifyByToken: async (token: string): Promise<PublicSignatureData | null> => {
    console.log('🔑 [SignatureService.verifyByToken] Verifying signature by token (public)', {
      token_preview: token.substring(0, 10) + '...',
    });
    try {
      const response = await publicApi.get(`${BASE_URL}/token/${token}`);
      console.log('🔑 [SignatureService.verifyByToken] Response:', response);

      const data = response;

      if (!data || !data.specimen) {
        console.log('🔑 [SignatureService.verifyByToken] No signature found');
        return null;
      }

      // Fix the signature image URL if present
      if (data.specimen?.signature_image_url) {
        data.specimen.signature_image_url = getFullImageUrl(data.specimen.signature_image_url);
      }

      return data;
    } catch (error) {
      console.error('🔑 [SignatureService.verifyByToken] Error verifying by token:', error);
      throw error;
    }
  },

  /**
   * Get QR code for a signature specimen
   * No authentication required
   * @route GET /api/v1/signatures/qr/{specimenId}
   */
  getQR: async (specimenId: number): Promise<QRCodeData | null> => {
    console.log('📱 [SignatureService.getQR] Fetching QR code', { specimenId });
    try {
      const response = await publicApi.get(`${BASE_URL}/qr/${specimenId}`);
      console.log('📱 [SignatureService.getQR] Response:', response);

      const qrData = response;
      console.log('📱 [SignatureService.getQR] QR data:', qrData);
      return qrData;
    } catch (error) {
      console.error('📱 [SignatureService.getQR] Error fetching QR code:', error);
      return null;
    }
  },

  // ============================================
  // PROTECTED ENDPOINTS (Require Authentication)
  // ============================================

  /**
   * Upload a signature specimen
   * Requires authentication
   * @route POST /api/v1/signatures/upload
   */
  upload: async (file: File, notes?: string): Promise<SignatureSpecimen> => {
    console.log('📤 [SignatureService.upload] Starting upload', { fileName: file.name, notes });
    const formData = new FormData();
    formData.append('signature', file);
    if (notes) {
      formData.append('notes', notes);
    }

    const response = await api.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('📤 [SignatureService.upload] Response:', response);

    const data = response;
    if (data.signature_image_url) {
      data.signature_image_url = getFullImageUrl(data.signature_image_url);
    }
    return data;
  },

  /**
   * Verify a signature specimen (Admin only)
   * Requires authentication
   * @route POST /api/v1/signatures/verify/{specimenId}
   */
  verify: async (specimenId: number, notes?: string): Promise<{
    specimen: SignatureSpecimen;
    qr_code: QRCodeData | null;
  }> => {
    console.log('✅ [SignatureService.verify] Starting verification', { specimenId, notes });
    const data: VerifySignatureRequest = { notes };
    const response = await api.post(`${BASE_URL}/verify/${specimenId}`, data);
    console.log('✅ [SignatureService.verify] Response:', response);

    const result = response;
    // Fix the signature image URL
    if (result.specimen?.signature_image_url) {
      result.specimen.signature_image_url = getFullImageUrl(result.specimen.signature_image_url);
    }
    return result;
  },

  /**
   * Verify signature via QR Code (Legacy JSON payload scanning)
   * Requires authentication
   * @route POST /api/v1/signatures/verify-qr
   */
  verifyByQR: async (qrData: string): Promise<QRCodeVerificationResult> => {
    console.log('📱 [SignatureService.verifyByQR] Starting QR verification');
    const data: VerifySignatureQRRequest = { qr_data: qrData };
    const response = await api.post(`${BASE_URL}/verify-qr`, data);
    console.log('📱 [SignatureService.verifyByQR] Response:', response);

    const result = response;
    // Fix the signature image URL if present
    if (result.verified?.signature_image_url) {
      result.verified.signature_image_url = getFullImageUrl(result.verified.signature_image_url);
    }
    return result;
  },

  /**
   * Regenerate QR code for a signature specimen
   * Requires authentication
   * @route POST /api/v1/signatures/regenerate-qr/{specimenId}
   */
  regenerateQR: async (specimenId: number): Promise<QRCodeData> => {
    console.log('🔄 [SignatureService.regenerateQR] Regenerating QR', { specimenId });
    try {
      const response = await api.post(`${BASE_URL}/regenerate-qr/${specimenId}`);
      console.log('🔄 [SignatureService.regenerateQR] Response:', response);

      const qrData = response;
      console.log('🔄 [SignatureService.regenerateQR] QR data:', qrData);
      return qrData;
    } catch (error) {
      console.error('🔄 [SignatureService.regenerateQR] Error regenerating QR:', error);
      throw error;
    }
  },

  /**
   * Delete a signature specimen
   * Requires authentication
   * @route DELETE /api/v1/signatures/{specimenId}
   */
  delete: async (specimenId: number): Promise<boolean> => {
    console.log('🗑️ [SignatureService.delete] Deleting signature', { specimenId });
    try {
      const response = await api.delete(`${BASE_URL}/${specimenId}`);
      console.log('🗑️ [SignatureService.delete] Response:', response);

      
      if (response.data && response.data.success !== undefined) {
        return response.data.success;
      }
      if (typeof response.data === 'boolean') {
        return response.data;
      }
      return response.data?.success || false;
    } catch (error) {
      console.error('🗑️ [SignatureService.delete] Error deleting signature:', error);
      throw error;
    }
  },

  /**
   * Reject a signature specimen (Admin only)
   * Requires authentication
   * @route POST /api/v1/signatures/reject/{specimenId}
   */
  reject: async (specimenId: number, reason?: string): Promise<SignatureSpecimen> => {
    console.log('❌ [SignatureService.reject] Starting rejection', { specimenId, reason });
    const data: RejectSignatureRequest = { reason };
    const response = await api.post(`${BASE_URL}/reject/${specimenId}`, data);
    console.log('❌ [SignatureService.reject] Response:', response);

    const result = response;
    if (result.signature_image_url) {
      result.signature_image_url = getFullImageUrl(result.signature_image_url);
    }
    return result;
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Admin - Get all pending signatures
   * Requires authentication (Admin)
   * @route GET /api/v1/signatures/pending
   */
  getPending: async (): Promise<SignatureSpecimen[]> => {
    console.log('⏳ [SignatureService.getPending] Fetching pending signatures...');
    try {
      const response = await api.get(`${BASE_URL}/pending`);
      console.log('⏳ [SignatureService.getPending] Response:', response);

      let pendingData = response;
      if (!Array.isArray(pendingData)) {
        pendingData = response || [];
      }

      if (Array.isArray(pendingData)) {
        pendingData = pendingData.map(item => ({
          ...item,
          signature_image_url: getFullImageUrl(item.signature_image_url),
        }));
      }

      console.log('⏳ [SignatureService.getPending] Pending data:', pendingData);
      return pendingData || [];
    } catch (error) {
      console.error('⏳ [SignatureService.getPending] Error fetching pending:', error);
      throw error;
    }
  },

  /**
   * Admin - Get all verified signatures
   * Requires authentication (Admin)
   * @route GET /api/v1/signatures/verified
   */
  getVerified: async (): Promise<SignatureSpecimen[]> => {
    console.log('✅ [SignatureService.getVerified] Fetching verified signatures...');
    try {
      const response = await api.get(`${BASE_URL}/verified`);
      console.log('✅ [SignatureService.getVerified] Response:', response);

      let verifiedData = response;
      if (!Array.isArray(verifiedData)) {
        verifiedData = response.data || [];
      }

      if (Array.isArray(verifiedData)) {
        verifiedData = verifiedData.map(item => ({
          ...item,
          signature_image_url: getFullImageUrl(item.signature_image_url),
        }));
      }

      console.log('✅ [SignatureService.getVerified] Verified data:', verifiedData);
      return verifiedData || [];
    } catch (error) {
      console.error('✅ [SignatureService.getVerified] Error fetching verified:', error);
      throw error;
    }
  },

  /**
   * Admin - Get signature statistics
   * Requires authentication (Admin)
   * @route GET /api/v1/signatures/stats
   */
  getStats: async (): Promise<SignatureStats> => {
    console.log('📊 [SignatureService.getStats] Fetching stats...');
    try {
      const response = await api.get(`${BASE_URL}/stats`);
      console.log('📊 [SignatureService.getStats] Response:', response);

      const statsData = response;
      console.log('📊 [SignatureService.getStats] Stats data:', statsData);
      return statsData || { total: 0, pending: 0, verified: 0, rejected: 0, percentage_verified: 0 };
    } catch (error) {
      console.error('📊 [SignatureService.getStats] Error fetching stats:', error);
      throw error;
    }
  },

  /**
   * Admin - Get all signature verification logs
   * Requires authentication (Admin)
   * @route GET /api/v1/signatures/logs
   */
  getLogs: async (filters?: {
    action?: string;
    status?: string;
    user_id?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<SignatureVerificationLog[]> => {
    console.log('📋 [SignatureService.getLogs] Fetching verification logs...', filters);
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }

      const queryString = queryParams.toString();
      const url = queryString ? `${BASE_URL}/logs?${queryString}` : `${BASE_URL}/logs`;

      const response = await api.get(url);
      console.log('📋 [SignatureService.getLogs] Response:', response);

      const logsData = response|| response.data || [];
      console.log('📋 [SignatureService.getLogs] Logs data:', logsData);
      return Array.isArray(logsData) ? logsData : [];
    } catch (error) {
      console.error('📋 [SignatureService.getLogs] Error fetching logs:', error);
      throw error;
    }
  },

  // ============================================
  // DEPRECATED LEGACY METHODS (for backward compatibility)
  // Will be removed in future versions
  // ============================================

  /**
   * @deprecated Use getMySignature() or verifyByToken() instead
   */
  getMySignatureLegacy: async (token?: string): Promise<SignatureSpecimen | null> => {
    console.warn('⚠️ [SignatureService.getMySignatureLegacy] DEPRECATED - Use getMySignature() or verifyByToken()');
    if (token) {
      // Try to get signature via token
      const publicData = await signatureService.verifyByToken(token);
      if (publicData && publicData.specimen) {
        // Convert PublicSignatureData to SignatureSpecimen
        const specimen = publicData.specimen;
        return {
          id: 0, // Public data doesn't expose ID
          user_id: 0, // Public data doesn't expose user_id
          user: {
            full_name: specimen.user.full_name,
            email: specimen.user.email,
            role_label: specimen.user.role_label,
          } as any,
          signature_image_url: specimen.signature_image_url || null,
          signature_image_path: null,
          signature_hash: null,
          is_verified: specimen.is_verified,
          status: specimen.status,
          status_label: specimen.status_label,
          status_color: specimen.status_color,
          verified_at: specimen.verified_at,
          verification_notes: specimen.verification_notes,
          verification_method: specimen.verification_method,
          verified_by: null,
          qr_code: publicData.qr_code || null,
          qr_code_data: publicData.qr_code?.data || null,
          qr_code_image: publicData.qr_code?.image || null,
          qr_code_hash: publicData.qr_code?.hash || null,
          qr_verification_token: null,
          ip_address: null,
          user_agent: null,
          metadata: null,
          created_at: new Date().toISOString(), // Use current date as fallback
          updated_at: new Date().toISOString(), // Use current date as fallback
        } as SignatureSpecimen;
      }
      return null;
    }
    return signatureService.getMySignature();
  },

  /**
   * @deprecated Use getMyStatus() or getPublicStatus() instead
   */
  getStatus: async (token?: string): Promise<SignatureStatus | null> => {
    console.warn('⚠️ [SignatureService.getStatus] DEPRECATED - Use getMyStatus() or getPublicStatus()');
    try {
      if (token) {
        // Use public status endpoint
        const result = await signatureService.getPublicStatus(token);
        if (result) {
          // Convert to legacy format if needed
          return {
            status: result.signature.status,
            label: result.signature.status_label || result.signature.status,
            color: result.signature.status_color || 'secondary',
            message: `Signature is ${result.signature.status}`,
            specimen: null,
          } as SignatureStatus;
        }
        return null;
      } else {
        return signatureService.getMyStatus();
      }
    } catch (error) {
      console.error('📊 [SignatureService.getStatus] Error fetching status:', error);
      return null;
    }
  },

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check if a signature is verified
   */
  isSignatureVerified: (specimen: SignatureSpecimen | null): boolean => {
    if (!specimen) return false;
    return specimen.is_verified && specimen.status === 'approved';
  },

  /**
   * Check if a signature is pending
   */
  isSignaturePending: (specimen: SignatureSpecimen | null): boolean => {
    if (!specimen) return false;
    return specimen.status === 'pending';
  },

  /**
   * Check if a signature is rejected
   */
  isSignatureRejected: (specimen: SignatureSpecimen | null): boolean => {
    if (!specimen) return false;
    return specimen.status === 'rejected';
  },

  /**
   * Get the user's full name from a signature
   */
  getUserName: (specimen: SignatureSpecimen | null): string => {
    if (!specimen) return 'Unknown';
    if (specimen.user) return specimen.user.full_name;
    if (specimen.user_id) return `User ${specimen.user_id}`;
    return 'Unknown';
  },

  /**
   * Get the user's email from a signature
   */
  getUserEmail: (specimen: SignatureSpecimen | null): string => {
    if (!specimen) return 'Unknown';
    if (specimen.user) return specimen.user.email;
    return 'Unknown';
  },

  /**
   * Get the signature image URL with fallback
   */
  getSignatureImageUrl: (specimen: SignatureSpecimen | null): string | null => {
    if (!specimen) return null;
    return specimen.signature_image_url || null;
  },

  /**
   * Get the QR code image with fallback
   */
  getQRCodeImage: (specimen: SignatureSpecimen | null): string | null => {
    if (!specimen) return null;
    return specimen.qr_code?.image || null;
  },

  /**
   * Check if a user has a valid signature
   */
  hasValidSignature: (user: any): boolean => {
    if (!user) return false;
    return user.signature_status === 'verified';
  },
};
