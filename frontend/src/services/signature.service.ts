// frontend/src/services/signature.service.ts

import { api, publicApi } from './api'; // ✅ Import publicApi
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
  // Otherwise, prepend the API base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://api.sspms.internal:443';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const signatureService = {
  /**
   * Upload a signature specimen
   * Requires authentication
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
    return response.data;
  },

  /**
   * Verify a signature specimen (Admin only)
   * Requires authentication
   */
  verify: async (specimenId: number, notes?: string): Promise<{
    specimen: SignatureSpecimen;
    qr_code: QRCodeData | null;
  }> => {
    console.log('✅ [SignatureService.verify] Starting verification', { specimenId, notes });
    const data: VerifySignatureRequest = { notes };
    const response = await api.post(`${BASE_URL}/verify/${specimenId}`, data);
    console.log('✅ [SignatureService.verify] Response:', response);
    return response.data;
  },

  /**
   * Verify signature via QR Code (Legacy JSON payload scanning)
   * Requires authentication
   */
  verifyByQR: async (qrData: string): Promise<QRCodeVerificationResult> => {
    console.log('📱 [SignatureService.verifyByQR] Starting QR verification');
    const data: VerifySignatureQRRequest = { qr_data: qrData };
    const response = await api.post(`${BASE_URL}/verify-qr`, data);
    console.log('📱 [SignatureService.verifyByQR] Response:', response);
    return response.data;
  },

  /**
   * 🔑 VERIFY SIGNATURE BY TOKEN - PUBLIC ENDPOINT (No authentication required)
   * This is the endpoint called by the frontend page at /verify-signature/token/{token}
   * Uses publicApi so it works without authentication
   */
  verifyByToken: async (token: string): Promise<{
    specimen: SignatureSpecimen;
    qr_code: QRCodeData | null;
  }> => {
    console.log('🔑 [SignatureService.verifyByToken] Fetching signature by token (public)', { token });
    try {
      // ✅ Use publicApi instead of api for unauthenticated access
      const response = await publicApi.get(`${BASE_URL}/token/${token}`);
      console.log('🔑 [SignatureService.verifyByToken] Response:', response);

      // Ensure we don't modify the QR code image (it's a base64 data URL)
      const data = response;
      if (data?.specimen?.signature_image_url) {
        data.specimen.signature_image_url = getFullImageUrl(data.specimen.signature_image_url);
      }

      return data;
    } catch (error) {
      console.error('🔑 [SignatureService.verifyByToken] Error fetching by token:', error);
      throw error;
    }
  },

  /**
   * Reject a signature specimen
   * Requires authentication (Admin)
   */
  reject: async (specimenId: number, reason?: string): Promise<SignatureSpecimen> => {
    console.log('❌ [SignatureService.reject] Starting rejection', { specimenId, reason });
    const data: RejectSignatureRequest = { reason };
    const response = await api.post(`${BASE_URL}/reject/${specimenId}`, data);
    console.log('❌ [SignatureService.reject] Response:', response);
    return response.data;
  },

  /**
   * Get current user's signature status
   * Can work with or without authentication when token is provided
   */
  getStatus: async (token?: string): Promise<SignatureStatus | null> => {
    console.log('📊 [SignatureService.getStatus] Fetching signature status...', { token });
    try {
      let url = `${BASE_URL}/status`;
      if (token) {
        url += `?token=${token}`;
      }

      // ✅ Use publicApi for this endpoint (works without auth)
      const response = await publicApi.get(url);
      console.log('📊 [SignatureService.getStatus] Response:', response);

      const statusData = response;

      console.log('📊 [SignatureService.getStatus] Status data:', statusData);

      if (!statusData || !statusData.status) {
        console.warn('📊 [SignatureService.getStatus] No valid status data received, returning default');
        return {
          status: 'none',
          label: 'No Signature',
          color: 'secondary',
          message: "You haven't uploaded a signature yet.",
          specimen: null,
        } as SignatureStatus;
      }

      console.log('📊 [SignatureService.getStatus] Returning status:', statusData);
      return statusData;
    } catch (error) {
      console.error('📊 [SignatureService.getStatus] Error fetching status:', error);
      // Return null instead of throwing for public access
      return null;
    }
  },

  /**
   * Get current user's signature specimen
   * Can work with or without authentication when token is provided
   */
  getMySignature: async (token?: string): Promise<SignatureSpecimen | null> => {
    console.log('📄 [SignatureService.getMySignature] Fetching user signature...', { token });
    try {
      let url = `${BASE_URL}/my-signature`;
      if (token) {
        url += `?token=${token}`;
      }

      // ✅ Use publicApi for this endpoint (works without auth)
      const response = await publicApi.get(url);
      console.log('📄 [SignatureService.getMySignature] Response:', response);

      const signatureData = response;

      console.log('📄 [SignatureService.getMySignature] Signature data:', signatureData);

      if (!signatureData || !signatureData.id) {
        console.log('📄 [SignatureService.getMySignature] No signature found, returning null');
        return null;
      }

      // Only fix the signature image URL - QR codes are base64 and should not be modified
      if (signatureData.signature_image_url) {
        signatureData.signature_image_url = getFullImageUrl(signatureData.signature_image_url);
        console.log('📄 [SignatureService.getMySignature] Fixed image URL:', signatureData.signature_image_url);
      }

      console.log('📄 [SignatureService.getMySignature] Returning signature:', {
        id: signatureData.id,
        hasImage: !!signatureData.signature_image_url,
        status: signatureData.status,
        hasQR: !!signatureData.qr_code?.image,
      });
      return signatureData;
    } catch (error) {
      console.error('📄 [SignatureService.getMySignature] Error fetching signature:', error);
      // Return null instead of throwing for public access
      return null;
    }
  },

  /**
   * Get QR code for a signature specimen
   * PUBLIC - Works without authentication
   */
  getQR: async (specimenId: number): Promise<QRCodeData | null> => {
    console.log('📱 [SignatureService.getQR] Fetching QR code', { specimenId });
    try {
      // ✅ Use publicApi for this endpoint (works without auth)
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

  /**
   * Regenerate QR code for a signature specimen
   * Requires authentication
   */
  regenerateQR: async (specimenId: number): Promise<QRCodeData> => {
    console.log('🔄 [SignatureService.regenerateQR] Regenerating QR', { specimenId });
    try {
      const response = await api.post(`${BASE_URL}/regenerate-qr/${specimenId}`);
      console.log('🔄 [SignatureService.regenerateQR] Response:', response);

      const qrData = response.data;
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
   * Admin - Get all pending signatures
   * Requires authentication (Admin)
   */
  getPending: async (): Promise<SignatureSpecimen[]> => {
    console.log('⏳ [SignatureService.getPending] Fetching pending signatures...');
    try {
      const response = await api.get(`${BASE_URL}/pending`);
      console.log('⏳ [SignatureService.getPending] Response:', response);

      let pendingData = response;
      if (!Array.isArray(pendingData)) {
        pendingData = response.data?.data || [];
      }

      if (Array.isArray(pendingData)) {
        pendingData = pendingData.map(item => ({
          ...item,
          signature_image_url: getFullImageUrl(item.signature_image_url),
          qr_code: item.qr_code,
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
   */
  getVerified: async (): Promise<SignatureSpecimen[]> => {
    console.log('✅ [SignatureService.getVerified] Fetching verified signatures...');
    try {
      const response = await api.get(`${BASE_URL}/verified`);
      console.log('✅ [SignatureService.getVerified] Response:', response);

      let verifiedData = response;
      if (!Array.isArray(verifiedData)) {
        verifiedData = response.data?.data || [];
      }

      if (Array.isArray(verifiedData)) {
        verifiedData = verifiedData.map(item => ({
          ...item,
          signature_image_url: getFullImageUrl(item.signature_image_url),
          qr_code: item.qr_code,
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

      const logsData = response || response.data;

      console.log('📋 [SignatureService.getLogs] Logs data:', logsData);
      return Array.isArray(logsData) ? logsData : [];
    } catch (error) {
      console.error('📋 [SignatureService.getLogs] Error fetching logs:', error);
      throw error;
    }
  },

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
