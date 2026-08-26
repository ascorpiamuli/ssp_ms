// frontend/src/hooks/useSignature.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { signatureService } from '@/services/signature.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  SignatureSpecimen,
  SignatureStatus,
  QRCodeData,
  QRCodeVerificationResult,
  SignatureStats,
  SignatureVerificationLog,
} from '@/types/signature.types';

console.log('🔧 [useSignature] Hook module loaded');

// ============================================
// QUERIES (no toasts needed)
// ============================================

export const useSignatureStatus = (
  token?: string,
  options?: Omit<UseQueryOptions<SignatureStatus | null>, 'queryKey' | 'queryFn'>
) => {
  console.log('🔧 [useSignatureStatus] Creating query', { token });

  return useQuery<SignatureStatus | null>({
    queryKey: ['signature-status', token],
    queryFn: async () => {
      console.log('🔧 [useSignatureStatus.queryFn] Executing...', { token });
      try {
        const result = await signatureService.getStatus(token);
        console.log('🔧 [useSignatureStatus.queryFn] Service returned:', result);
        return result;
      } catch (error) {
        console.error('🔧 [useSignatureStatus.queryFn] Error:', error);
        // Return null instead of throwing for public access
        return null;
      }
    },
    ...options,
  });
};

export const useMySignature = (
  token?: string,
  options?: Omit<UseQueryOptions<SignatureSpecimen | null>, 'queryKey' | 'queryFn'>
) => {
  console.log('🔧 [useMySignature] Creating query', { token });

  return useQuery<SignatureSpecimen | null>({
    queryKey: ['my-signature', token],
    queryFn: async () => {
      console.log('🔧 [useMySignature.queryFn] Executing...', { token });
      try {
        const result = await signatureService.getMySignature(token);
        console.log('🔧 [useMySignature.queryFn] Service returned:', result);
        return result;
      } catch (error) {
        console.error('🔧 [useMySignature.queryFn] Error:', error);
        // Return null instead of throwing for public access
        return null;
      }
    },
    ...options,
  });
};

export const useSignatureQR = (
  specimenId: number,
  options?: Omit<UseQueryOptions<QRCodeData | null>, 'queryKey' | 'queryFn'>
) => {
  console.log('🔧 [useSignatureQR] Creating query', { specimenId });

  return useQuery<QRCodeData | null>({
    queryKey: ['signature-qr', specimenId],
    queryFn: async () => {
      console.log('🔧 [useSignatureQR.queryFn] Executing...', { specimenId });
      if (!specimenId) {
        console.log('🔧 [useSignatureQR.queryFn] No specimenId, returning null');
        return null;
      }
      const result = await signatureService.getQR(specimenId);
      console.log('🔧 [useSignatureQR.queryFn] Service returned:', result);
      return result;
    },
    enabled: !!specimenId,
    ...options,
  });
};

export const usePendingSignatures = (
  options?: Omit<UseQueryOptions<SignatureSpecimen[]>, 'queryKey' | 'queryFn'>
) => {
  console.log('🔧 [usePendingSignatures] Creating query');

  return useQuery<SignatureSpecimen[]>({
    queryKey: ['pending-signatures'],
    queryFn: async () => {
      console.log('🔧 [usePendingSignatures.queryFn] Executing...');
      const result = await signatureService.getPending();
      console.log('🔧 [usePendingSignatures.queryFn] Service returned:', result);
      return result;
    },
    ...options,
  });
};

export const useVerifiedSignatures = (
  options?: Omit<UseQueryOptions<SignatureSpecimen[]>, 'queryKey' | 'queryFn'>
) => {
  console.log('🔧 [useVerifiedSignatures] Creating query');

  return useQuery<SignatureSpecimen[]>({
    queryKey: ['verified-signatures'],
    queryFn: async () => {
      console.log('🔧 [useVerifiedSignatures.queryFn] Executing...');
      const result = await signatureService.getVerified();
      console.log('🔧 [useVerifiedSignatures.queryFn] Service returned:', result);
      return result;
    },
    ...options,
  });
};

export const useSignatureStats = (
  options?: Omit<UseQueryOptions<SignatureStats>, 'queryKey' | 'queryFn'>
) => {
  console.log('🔧 [useSignatureStats] Creating query');

  return useQuery<SignatureStats>({
    queryKey: ['signature-stats'],
    queryFn: async () => {
      console.log('🔧 [useSignatureStats.queryFn] Executing...');
      const result = await signatureService.getStats();
      console.log('🔧 [useSignatureStats.queryFn] Service returned:', result);
      return result;
    },
    ...options,
  });
};

// ============================================
// 🆕 NEW QUERY: Signature Verification Logs
// ============================================

export const useSignatureLogs = (
  filters?: {
    action?: string;
    status?: string;
    user_id?: number;
    date_from?: string;
    date_to?: string;
  },
  options?: Omit<UseQueryOptions<SignatureVerificationLog[]>, 'queryKey' | 'queryFn'>
) => {
  console.log('🔧 [useSignatureLogs] Creating query', { filters });

  return useQuery<SignatureVerificationLog[]>({
    queryKey: ['signature-logs', filters],
    queryFn: async () => {
      console.log('🔧 [useSignatureLogs.queryFn] Executing...');
      const result = await signatureService.getLogs(filters);
      console.log('🔧 [useSignatureLogs.queryFn] Service returned:', result);
      return result;
    },
    ...options,
  });
};

// ============================================
// MUTATIONS WITH TOASTS
// ============================================

export const useUploadSignature = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ file, notes }: { file: File; notes?: string }) => {
      console.log('📤 [useUploadSignature.mutationFn] Uploading...', { fileName: file.name, notes });
      return signatureService.upload(file, notes);
    },
    onSuccess: (data) => {
      console.log('📤 [useUploadSignature.onSuccess] Upload successful', data);
      queryClient.invalidateQueries({ queryKey: ['my-signature'] });
      queryClient.invalidateQueries({ queryKey: ['signature-status'] });
      queryClient.invalidateQueries({ queryKey: ['signature-stats'] });
      success('Signature uploaded successfully');
    },
    onError: (error: any) => {
      console.error('📤 [useUploadSignature.onError] Upload failed', error);
      success('An error occurred', error?.response?.data?.message || 'Failed to upload signature');
    },
  });
};

export const useVerifySignature = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ specimenId, notes }: { specimenId: number; notes?: string }) => {
      console.log('✅ [useVerifySignature.mutationFn] Verifying...', { specimenId, notes });
      return signatureService.verify(specimenId, notes);
    },
    onSuccess: (data, variables) => {
      console.log('✅ [useVerifySignature.onSuccess] Verification successful', data);
      queryClient.invalidateQueries({ queryKey: ['my-signature'] });
      queryClient.invalidateQueries({ queryKey: ['signature-status'] });
      queryClient.invalidateQueries({ queryKey: ['pending-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['verified-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['signature-stats'] });
      success('Signature verified successfully');
    },
    onError: (error: any) => {
      console.error('✅ [useVerifySignature.onError] Verification failed', error);
      error(error?.response?.data?.message || 'Failed to verify signature');
    },
  });
};

export const useVerifySignatureByQR = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ qrData }: { qrData: string }) => {
      console.log('📱 [useVerifySignatureByQR.mutationFn] Verifying by QR...');
      return signatureService.verifyByQR(qrData);
    },
    onSuccess: (data) => {
      console.log('📱 [useVerifySignatureByQR.onSuccess] QR verification successful', data);
      queryClient.invalidateQueries({ queryKey: ['my-signature'] });
      queryClient.invalidateQueries({ queryKey: ['signature-status'] });
      queryClient.invalidateQueries({ queryKey: ['pending-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['verified-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['signature-stats'] });
      success('Signature verified via QR code successfully');
    },
    onError: (error: any) => {
      console.error('📱 [useVerifySignatureByQR.onError] QR verification failed', error);
      error(error?.response?.data?.message || 'Failed to verify signature via QR code');
    },
  });
};

export const useVerifySignatureByToken = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ token }: { token: string }) => {
      console.log('🔑 [useVerifySignatureByToken.mutationFn] Verifying by token...', { token });
      return signatureService.verifyByToken(token);
    },
    onSuccess: (data) => {
      console.log('🔑 [useVerifySignatureByToken.onSuccess] Token verification successful', data);
      success('Signature found and verified successfully');
      return data;
    },
    onError: (error: any) => {
      console.error('🔑 [useVerifySignatureByToken.onError] Token verification failed', error);
      error(error?.response?.data?.message || 'Invalid or expired verification link');
    },
  });
};

export const useRejectSignature = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ specimenId, reason }: { specimenId: number; reason?: string }) => {
      console.log('❌ [useRejectSignature.mutationFn] Rejecting...', { specimenId, reason });
      return signatureService.reject(specimenId, reason);
    },
    onSuccess: (data, variables) => {
      console.log('❌ [useRejectSignature.onSuccess] Rejection successful', data);
      queryClient.invalidateQueries({ queryKey: ['my-signature'] });
      queryClient.invalidateQueries({ queryKey: ['signature-status'] });
      queryClient.invalidateQueries({ queryKey: ['pending-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['verified-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['signature-stats'] });
      success('Signature rejected successfully');
    },
    onError: (error: any) => {
      console.error('❌ [useRejectSignature.onError] Rejection failed', error);
      error(error?.response?.data?.message || 'Failed to reject signature');
    },
  });
};

export const useRegenerateQR = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ specimenId }: { specimenId: number }) => {
      console.log('🔄 [useRegenerateQR.mutationFn] Regenerating QR...', { specimenId });
      return signatureService.regenerateQR(specimenId);
    },
    onSuccess: (data, variables) => {
      console.log('🔄 [useRegenerateQR.onSuccess] QR regenerated', data);
      queryClient.invalidateQueries({ queryKey: ['signature-qr', variables.specimenId] });
      queryClient.invalidateQueries({ queryKey: ['my-signature'] });
      success('QR code regenerated successfully');
    },
    onError: (error: any) => {
      console.error('🔄 [useRegenerateQR.onError] QR regeneration failed', error);
      error(error?.response?.data?.message || 'Failed to regenerate QR code');
    },
  });
};

export const useDeleteSignature = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ specimenId }: { specimenId: number }) => {
      console.log('🗑️ [useDeleteSignature.mutationFn] Deleting...', { specimenId });
      return signatureService.delete(specimenId);
    },
    onSuccess: (_, variables) => {
      console.log('🗑️ [useDeleteSignature.onSuccess] Deletion successful');
      queryClient.invalidateQueries({ queryKey: ['my-signature'] });
      queryClient.invalidateQueries({ queryKey: ['signature-status'] });
      queryClient.invalidateQueries({ queryKey: ['pending-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['verified-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['signature-stats'] });
      queryClient.invalidateQueries({ queryKey: ['signature-qr', variables.specimenId] });
      success('Signature deleted successfully');
    },
    onError: (error: any) => {
      console.error('🗑️ [useDeleteSignature.onError] Deletion failed', error);
      error(error?.response?.data?.message || 'Failed to delete signature');
    },
  });
};

// ============================================
// COMBINED HOOKS FOR EASY USE
// ============================================

export const useSignature = (token?: string) => {
  console.log('🔧 [useSignature] Creating combined hook', { token });

  const statusQuery = useSignatureStatus(token);
  const mySignatureQuery = useMySignature(token);

  const signature = mySignatureQuery.data ?? null;
  const status = statusQuery.data ?? null;

  // Effective signature: use signature from mySignature, fallback to status.specimen
  const effectiveSignature = signature || status?.specimen || null;

  console.log('🔧 [useSignature] Data:', {
    hasSignature: !!signature,
    signatureId: signature?.id,
    signatureStatus: signature?.status,
    hasStatus: !!status,
    statusValue: status?.status,
    statusLabel: status?.label,
    hasEffectiveSignature: !!effectiveSignature,
    effectiveSignatureId: effectiveSignature?.id,
    effectiveSignatureStatus: effectiveSignature?.status,
  });

  // Helper methods using effective signature
  const isVerified = () => {
    if (!effectiveSignature) return false;
    return effectiveSignature.is_verified === true && effectiveSignature.status === 'approved';
  };

  const isPending = () => {
    if (!effectiveSignature) return false;
    return effectiveSignature.status === 'pending';
  };

  const isRejected = () => {
    if (!effectiveSignature) return false;
    return effectiveSignature.status === 'rejected';
  };

  const getUserName = () => {
    if (!effectiveSignature) return 'Unknown';
    if (effectiveSignature.user) return effectiveSignature.user.full_name || 'Unknown';
    return 'Unknown';
  };

  const getUserEmail = () => {
    if (!effectiveSignature) return 'Unknown';
    if (effectiveSignature.user) return effectiveSignature.user.email || 'Unknown';
    return 'Unknown';
  };

  const getImageUrl = () => {
    if (!effectiveSignature) return null;
    return effectiveSignature.signature_image_url || null;
  };

  const getQRCodeImage = () => {
    if (!effectiveSignature) return null;
    return effectiveSignature.qr_code?.image || null;
  };

  console.log('🔧 [useSignature] Helper results:', {
    isVerified: isVerified(),
    isPending: isPending(),
    isRejected: isRejected(),
    userName: getUserName(),
    userEmail: getUserEmail(),
    hasImage: !!getImageUrl(),
    hasQR: !!getQRCodeImage(),
  });

  return {
    // Data - keep both for flexibility
    signature,
    status,
    effectiveSignature,

    // Loading states
    isLoading: statusQuery.isLoading || mySignatureQuery.isLoading,
    isFetching: statusQuery.isFetching || mySignatureQuery.isFetching,

    // Error states
    error: statusQuery.error || mySignatureQuery.error,

    // Mutations
    upload: useUploadSignature(),
    verify: useVerifySignature(),
    verifyByQR: useVerifySignatureByQR(),
    verifyByToken: useVerifySignatureByToken(),
    reject: useRejectSignature(),
    regenerateQR: useRegenerateQR(),
    delete: useDeleteSignature(),

    // Refetch functions
    refetchStatus: statusQuery.refetch,
    refetchSignature: mySignatureQuery.refetch,
    refetch: () => {
      console.log('🔧 [useSignature.refetch] Refetching all data');
      statusQuery.refetch();
      mySignatureQuery.refetch();
    },

    // Helper methods using effective signature
    isVerified,
    isPending,
    isRejected,
    getUserName,
    getUserEmail,
    getImageUrl,
    getQRCodeImage,
  };
};

// ============================================
// ADMIN HOOKS
// ============================================

export const useAdminSignature = () => {
  console.log('🔧 [useAdminSignature] Creating admin hook');

  const pendingQuery = usePendingSignatures();
  const verifiedQuery = useVerifiedSignatures();
  const statsQuery = useSignatureStats();
  const logsQuery = useSignatureLogs();

  console.log('🔧 [useAdminSignature] Data:', {
    pendingCount: pendingQuery.data?.length || 0,
    verifiedCount: verifiedQuery.data?.length || 0,
    stats: statsQuery.data,
    logsCount: logsQuery.data?.length || 0,
  });

  return {
    // Data
    pending: pendingQuery.data ?? [],
    verified: verifiedQuery.data ?? [],
    stats: statsQuery.data ?? null,
    logs: logsQuery.data ?? [],

    // Loading states
    isLoading: pendingQuery.isLoading || verifiedQuery.isLoading || statsQuery.isLoading || logsQuery.isLoading,
    isFetching: pendingQuery.isFetching || verifiedQuery.isFetching || statsQuery.isFetching || logsQuery.isFetching,

    // Error states
    error: pendingQuery.error || verifiedQuery.error || statsQuery.error || logsQuery.error,

    // Mutations
    verify: useVerifySignature(),
    reject: useRejectSignature(),
    regenerateQR: useRegenerateQR(),
    delete: useDeleteSignature(),

    // Refetch functions
    refetchPending: pendingQuery.refetch,
    refetchVerified: verifiedQuery.refetch,
    refetchStats: statsQuery.refetch,
    refetchLogs: logsQuery.refetch,
    refetch: () => {
      pendingQuery.refetch();
      verifiedQuery.refetch();
      statsQuery.refetch();
      logsQuery.refetch();
    },

    // Helper methods
    getPendingCount: () => statsQuery.data?.pending ?? 0,
    getVerifiedCount: () => statsQuery.data?.verified ?? 0,
    getTotalCount: () => statsQuery.data?.total ?? 0,
    getPercentageVerified: () => statsQuery.data?.percentage_verified ?? 0,
  };
};

// ============================================
// UTILITY HOOKS
// ============================================

export const useSignatureQRCode = (specimenId: number) => {
  console.log('🔧 [useSignatureQRCode] Creating QR hook', { specimenId });

  const qrQuery = useSignatureQR(specimenId);
  const regenerateMutation = useRegenerateQR();

  return {
    qrData: qrQuery.data ?? null,
    isLoading: qrQuery.isLoading,
    isRegenerating: regenerateMutation.isPending,
    regenerate: () => regenerateMutation.mutateAsync({ specimenId }),
    refetch: qrQuery.refetch,
  };
};
