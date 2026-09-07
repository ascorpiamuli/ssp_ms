// frontend/src/hooks/useGoodsReceived.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { goodsReceivedService } from '@/services/goodsReceived.service';
import { useToast } from '@/components/ui/toast-context';
import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  GoodsReceivedNote,
  ServiceAcknowledgmentNote,
  GoodsReceivedFilters,
  GRNSummary,
  CreateGoodsReceivedData,
  InspectGoodsData,
  RateServiceData,
  CreateServiceAcknowledgmentData,
} from '@/types/goodsReceived.types';
import type { PaginatedResponse } from '@/types/common.types';

export const GOODS_RECEIVED_QUERY_KEY = 'goods-received';
export const SERVICE_ACKNOWLEDGMENT_QUERY_KEY = 'service-acknowledgments';

// ============================================
// GRN QUERIES
// ============================================

export const useGrns = (
  filters?: GoodsReceivedFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<GoodsReceivedNote>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [GOODS_RECEIVED_QUERY_KEY, filters],
    queryFn: () => goodsReceivedService.getGrns(filters),
    ...options,
  });
};

export const useGrn = (
  id: number,
  options?: Omit<UseQueryOptions<GoodsReceivedNote>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['grn', id],
    queryFn: () => goodsReceivedService.getGrnById(id),
    enabled: !!id,
    ...options,
  });
};

export const useGrnSummary = (
  id: number,
  options?: Omit<UseQueryOptions<GRNSummary>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['grn-summary', id],
    queryFn: () => goodsReceivedService.getGrnSummary(id),
    enabled: !!id,
    ...options,
  });
};

export const usePendingGrns = (
  options?: Omit<UseQueryOptions<GoodsReceivedNote[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['pending-grns'],
    queryFn: () => goodsReceivedService.getPendingGrns(),
    ...options,
  });
};

export const useGrnsByPurchaseOrder = (
  purchaseOrderId: number,
  options?: Omit<UseQueryOptions<GoodsReceivedNote[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['grns-by-purchase-order', purchaseOrderId],
    queryFn: () => goodsReceivedService.getGrnsByPurchaseOrder(purchaseOrderId),
    enabled: !!purchaseOrderId,
    ...options,
  });
};

// ============================================
// SAN QUERIES
// ============================================

export const useSans = (
  filters?: GoodsReceivedFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<ServiceAcknowledgmentNote>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY, filters],
    queryFn: () => goodsReceivedService.getSans(filters),
    ...options,
  });
};

export const useSan = (
  id: number,
  options?: Omit<UseQueryOptions<ServiceAcknowledgmentNote>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['san', id],
    queryFn: () => goodsReceivedService.getSanById(id),
    enabled: !!id,
    ...options,
  });
};

export const useSanSummary = (
  id: number,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['san-summary', id],
    queryFn: () => goodsReceivedService.getSanSummary(id),
    enabled: !!id,
    ...options,
  });
};

export const usePendingSans = (
  options?: Omit<UseQueryOptions<ServiceAcknowledgmentNote[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['pending-sans'],
    queryFn: () => goodsReceivedService.getPendingSans(),
    ...options,
  });
};

export const useSansByPurchaseOrder = (
  purchaseOrderId: number,
  options?: Omit<UseQueryOptions<ServiceAcknowledgmentNote[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['sans-by-purchase-order', purchaseOrderId],
    queryFn: () => goodsReceivedService.getSansByPurchaseOrder(purchaseOrderId),
    enabled: !!purchaseOrderId,
    ...options,
  });
};

// ============================================
// GRN MUTATIONS
// ============================================

export const useCreateGrn = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateGoodsReceivedData) => goodsReceivedService.createGrn(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOODS_RECEIVED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['grns-by-purchase-order', data.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status'] });
      success(`GRN "${data.grn_number || data.reference_number || ''}" created successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to create GRN');
    },
  });
};

export const useSubmitGrn = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => goodsReceivedService.submitGrn(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOODS_RECEIVED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['grn', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-grns'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`GRN "${data.grn_number}" submitted for approval`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to submit GRN for approval');
    },
  });
};

export const useApproveGrn = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      goodsReceivedService.approveGrn(id, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOODS_RECEIVED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['grn', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-grns'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`GRN "${data.grn_number}" approved successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to approve GRN');
    },
  });
};

export const useRejectGrn = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      goodsReceivedService.rejectGrn(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOODS_RECEIVED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['grn', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-grns'] });
      success(`GRN "${data.grn_number}" rejected`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to reject GRN');
    },
  });
};

export const useInspectGoods = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InspectGoodsData }) =>
      goodsReceivedService.inspectGoods(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOODS_RECEIVED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['grn', data.id] });
      queryClient.invalidateQueries({ queryKey: ['grn-summary', data.id] });
      success(`Goods inspected successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to inspect goods');
    },
  });
};

// ============================================
// GRN PDF MUTATIONS WITH RETRY LOGIC
// ============================================

/**
 * ✅ Download GRN PDF with retry logic
 * Implements exponential backoff retry for network failures
 */
export const useGetGrnPdf = () => {
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetries = 3;
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const download = useCallback(
    async (id: number, onProgress?: (progress: number) => void): Promise<void> => {
      if (!isMountedRef.current) return;

      setIsDownloading(true);
      setDownloadProgress(0);
      setRetryAttempt(0);
      setErrorMessage(null);

      const attemptDownload = async (attempt: number): Promise<void> => {
        if (!isMountedRef.current) return;

        try {
          abortControllerRef.current = new AbortController();

          // Track and download
          await goodsReceivedService.trackAndDownloadGrnPDF(id);

          if (isMountedRef.current) {
            setIsDownloading(false);
            setDownloadProgress(100);
            if (onProgress) onProgress(100);
            success('GRN PDF downloaded successfully');
          }
        } catch (err: any) {
          if (!isMountedRef.current) return;

          if (err?.name === 'AbortError' || err?.message?.includes('abort')) {
            setIsDownloading(false);
            setErrorMessage('Download cancelled');
            return;
          }

          const status = err?.response?.status;
          const isRetryable =
            status === 503 ||
            status === 504 ||
            status === 408 ||
            status === 429 ||
            status === 500 ||
            err?.message?.includes('timeout') ||
            err?.message?.includes('network') ||
            err?.message?.includes('ECONNRESET') ||
            err?.code === 'ECONNABORTED';

          if (isRetryable && attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
            setRetryAttempt(attempt + 1);
            setDownloadProgress(0);

            await new Promise((resolve) => setTimeout(resolve, delay));
            return attemptDownload(attempt + 1);
          }

          setIsDownloading(false);
          const msg = err?.response?.data?.message || err?.message || 'Failed to generate PDF';
          setErrorMessage(msg);
          error(msg);
        }
      };

      try {
        await attemptDownload(0);
      } catch (err: any) {
        if (isMountedRef.current && err?.name !== 'AbortError') {
          setIsDownloading(false);
          const msg = err?.message || 'An unexpected error occurred';
          setErrorMessage(msg);
          error('An unexpected error occurred while generating the PDF');
        }
      } finally {
        if (isMountedRef.current) {
          setIsDownloading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [success, error, maxRetries]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDownloading(false);
    setDownloadProgress(0);
    setErrorMessage(null);
  }, []);

  const reset = useCallback(() => {
    setIsDownloading(false);
    setDownloadProgress(0);
    setRetryAttempt(0);
    setErrorMessage(null);
    abortControllerRef.current = null;
  }, []);

  return {
    download,
    cancel,
    reset,
    isDownloading,
    downloadProgress,
    retryAttempt,
    errorMessage,
    maxRetries,
  };
};

/**
 * ✅ Download GRN PDF with simplified interface
 */
export const useDownloadGrnPdf = () => {
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetries = 3;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const download = useCallback(
    async (id: number): Promise<boolean> => {
      if (!isMountedRef.current) return false;

      setIsDownloading(true);
      setDownloadProgress(0);
      setRetryAttempt(0);
      setErrorMessage(null);

      const attemptDownload = async (attempt: number): Promise<boolean> => {
        if (!isMountedRef.current) return false;

        try {
          abortControllerRef.current = new AbortController();

          await goodsReceivedService.trackAndDownloadGrnPDF(id);

          if (isMountedRef.current) {
            setIsDownloading(false);
            setDownloadProgress(100);
            success('GRN PDF downloaded successfully');
            return true;
          }
          return false;
        } catch (err: any) {
          if (!isMountedRef.current) return false;

          if (err?.name === 'AbortError' || err?.message?.includes('abort')) {
            setIsDownloading(false);
            setErrorMessage('Download cancelled');
            return false;
          }

          const status = err?.response?.status;
          const isRetryable =
            status === 503 ||
            status === 504 ||
            status === 408 ||
            status === 429 ||
            status === 500 ||
            err?.message?.includes('timeout') ||
            err?.message?.includes('network') ||
            err?.message?.includes('ECONNRESET') ||
            err?.code === 'ECONNABORTED';

          if (isRetryable && attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
            setRetryAttempt(attempt + 1);
            setDownloadProgress(0);

            await new Promise((resolve) => setTimeout(resolve, delay));
            return attemptDownload(attempt + 1);
          }

          setIsDownloading(false);
          const msg = err?.response?.data?.message || 'Failed to generate PDF. Please try again.';
          setErrorMessage(msg);
          error(msg);
          return false;
        }
      };

      try {
        return await attemptDownload(0);
      } catch {
        setIsDownloading(false);
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsDownloading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [success, error, maxRetries]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDownloading(false);
    setDownloadProgress(0);
    setErrorMessage(null);
  }, []);

  const reset = useCallback(() => {
    setIsDownloading(false);
    setDownloadProgress(0);
    setRetryAttempt(0);
    setErrorMessage(null);
    abortControllerRef.current = null;
  }, []);

  return {
    download,
    cancel,
    reset,
    isDownloading,
    downloadProgress,
    retryAttempt,
    errorMessage,
    maxRetries,
  };
};

/**
 * Preview GRN PDF without tracking
 */
export const usePreviewGrnPdf = () => {
  const { error } = useToast();

  return useMutation({
    mutationFn: ({ id, openInNewTab }: { id: number; openInNewTab?: boolean }) =>
      goodsReceivedService.previewGrnPDF(id, openInNewTab),
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to preview PDF');
    },
  });
};

/**
 * Download verified GRN PDF
 */
export const useDownloadVerifiedGrnPdf = () => {
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(
    async (id: number, customFilename?: string): Promise<void> => {
      setIsDownloading(true);
      try {
        await goodsReceivedService.downloadVerifiedGrnPDF(id, customFilename);
        success('Verified GRN PDF downloaded successfully');
      } catch (err: any) {
        error(err?.response?.data?.message || 'Failed to download verified GRN PDF');
      } finally {
        setIsDownloading(false);
      }
    },
    [success, error]
  );

  return { download, isDownloading };
};

/**
 * Download draft GRN PDF
 */
export const useDownloadDraftGrnPdf = () => {
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(
    async (id: number, customFilename?: string): Promise<void> => {
      setIsDownloading(true);
      try {
        await goodsReceivedService.downloadDraftGrnPDF(id, customFilename);
        success('Draft GRN PDF downloaded successfully');
      } catch (err: any) {
        error(err?.response?.data?.message || 'Failed to download draft GRN PDF');
      } finally {
        setIsDownloading(false);
      }
    },
    [success, error]
  );

  return { download, isDownloading };
};

/**
 * Save GRN PDF to server storage
 */
export const useSaveGrnPdf = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, suffix }: { id: number; suffix?: string }) =>
      goodsReceivedService.saveGrnPDF(id, suffix),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['grn', id] });
      success('GRN PDF saved successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to save GRN PDF');
    },
  });
};

/**
 * Track GRN download
 */
export const useTrackGrnDownload = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => goodsReceivedService.trackGrnDownload(id),
    onSuccess: () => {
      success('Download tracked successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to track download');
    },
  });
};

/**
 * Share GRN PDF via email
 */
export const useShareGrnPdf = () => {
  const { error } = useToast();

  const share = useCallback(
    async (id: number, email: string, subject?: string, body?: string): Promise<void> => {
      try {
        await goodsReceivedService.shareGrnPDFViaEmail(id, email, subject, body);
      } catch (err: any) {
        error(err?.message || 'Failed to share PDF');
      }
    },
    [error]
  );

  return { share };
};

/**
 * Print GRN PDF
 */
export const usePrintGrnPdf = () => {
  const { error } = useToast();

  const print = useCallback(
    async (id: number): Promise<void> => {
      try {
        await goodsReceivedService.printGrnPDF(id);
      } catch (err: any) {
        error(err?.message || 'Failed to print PDF');
      }
    },
    [error]
  );

  return { print };
};

// ============================================
// SAN MUTATIONS
// ============================================

export const useCreateSan = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateServiceAcknowledgmentData) => goodsReceivedService.createSan(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sans-by-purchase-order', data.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status'] });
      success(`SAN "${data.san_number || data.reference_number || ''}" created successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to create SAN');
    },
  });
};

export const useSubmitSan = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => goodsReceivedService.submitSan(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['san', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-sans'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`SAN "${data.san_number}" submitted for approval`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to submit SAN for approval');
    },
  });
};

export const useApproveSan = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      goodsReceivedService.approveSan(id, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['san', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-sans'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`SAN "${data.san_number}" approved successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to approve SAN');
    },
  });
};

export const useRejectSan = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      goodsReceivedService.rejectSan(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['san', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-sans'] });
      success(`SAN "${data.san_number}" rejected`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to reject SAN');
    },
  });
};

export const useRateService = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RateServiceData }) =>
      goodsReceivedService.rateService(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['san', data.id] });
      queryClient.invalidateQueries({ queryKey: ['san-summary', data.id] });
      success(`Service quality rated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to rate service quality');
    },
  });
};

// ============================================
// SAN PDF MUTATIONS WITH RETRY LOGIC
// ============================================

/**
 * ✅ Download SAN PDF with retry logic
 * Implements exponential backoff retry for network failures
 */
export const useGetSanPdf = () => {
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetries = 3;
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const download = useCallback(
    async (id: number, onProgress?: (progress: number) => void): Promise<void> => {
      if (!isMountedRef.current) return;

      setIsDownloading(true);
      setDownloadProgress(0);
      setRetryAttempt(0);
      setErrorMessage(null);

      const attemptDownload = async (attempt: number): Promise<void> => {
        if (!isMountedRef.current) return;

        try {
          abortControllerRef.current = new AbortController();

          // Track and download
          await goodsReceivedService.trackAndDownloadSanPDF(id);

          if (isMountedRef.current) {
            setIsDownloading(false);
            setDownloadProgress(100);
            if (onProgress) onProgress(100);
            success('SAN PDF downloaded successfully');
          }
        } catch (err: any) {
          if (!isMountedRef.current) return;

          if (err?.name === 'AbortError' || err?.message?.includes('abort')) {
            setIsDownloading(false);
            setErrorMessage('Download cancelled');
            return;
          }

          const status = err?.response?.status;
          const isRetryable =
            status === 503 ||
            status === 504 ||
            status === 408 ||
            status === 429 ||
            status === 500 ||
            err?.message?.includes('timeout') ||
            err?.message?.includes('network') ||
            err?.message?.includes('ECONNRESET') ||
            err?.code === 'ECONNABORTED';

          if (isRetryable && attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
            setRetryAttempt(attempt + 1);
            setDownloadProgress(0);

            await new Promise((resolve) => setTimeout(resolve, delay));
            return attemptDownload(attempt + 1);
          }

          setIsDownloading(false);
          const msg = err?.response?.data?.message || err?.message || 'Failed to generate PDF';
          setErrorMessage(msg);
          error(msg);
        }
      };

      try {
        await attemptDownload(0);
      } catch (err: any) {
        if (isMountedRef.current && err?.name !== 'AbortError') {
          setIsDownloading(false);
          const msg = err?.message || 'An unexpected error occurred';
          setErrorMessage(msg);
          error('An unexpected error occurred while generating the PDF');
        }
      } finally {
        if (isMountedRef.current) {
          setIsDownloading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [success, error, maxRetries]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDownloading(false);
    setDownloadProgress(0);
    setErrorMessage(null);
  }, []);

  const reset = useCallback(() => {
    setIsDownloading(false);
    setDownloadProgress(0);
    setRetryAttempt(0);
    setErrorMessage(null);
    abortControllerRef.current = null;
  }, []);

  return {
    download,
    cancel,
    reset,
    isDownloading,
    downloadProgress,
    retryAttempt,
    errorMessage,
    maxRetries,
  };
};

/**
 * ✅ Download SAN PDF with simplified interface
 */
export const useDownloadSanPdf = () => {
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetries = 3;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const download = useCallback(
    async (id: number): Promise<boolean> => {
      if (!isMountedRef.current) return false;

      setIsDownloading(true);
      setDownloadProgress(0);
      setRetryAttempt(0);
      setErrorMessage(null);

      const attemptDownload = async (attempt: number): Promise<boolean> => {
        if (!isMountedRef.current) return false;

        try {
          abortControllerRef.current = new AbortController();

          await goodsReceivedService.trackAndDownloadSanPDF(id);

          if (isMountedRef.current) {
            setIsDownloading(false);
            setDownloadProgress(100);
            success('SAN PDF downloaded successfully');
            return true;
          }
          return false;
        } catch (err: any) {
          if (!isMountedRef.current) return false;

          if (err?.name === 'AbortError' || err?.message?.includes('abort')) {
            setIsDownloading(false);
            setErrorMessage('Download cancelled');
            return false;
          }

          const status = err?.response?.status;
          const isRetryable =
            status === 503 ||
            status === 504 ||
            status === 408 ||
            status === 429 ||
            status === 500 ||
            err?.message?.includes('timeout') ||
            err?.message?.includes('network') ||
            err?.message?.includes('ECONNRESET') ||
            err?.code === 'ECONNABORTED';

          if (isRetryable && attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
            setRetryAttempt(attempt + 1);
            setDownloadProgress(0);

            await new Promise((resolve) => setTimeout(resolve, delay));
            return attemptDownload(attempt + 1);
          }

          setIsDownloading(false);
          const msg = err?.response?.data?.message || 'Failed to generate PDF. Please try again.';
          setErrorMessage(msg);
          error(msg);
          return false;
        }
      };

      try {
        return await attemptDownload(0);
      } catch {
        setIsDownloading(false);
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsDownloading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [success, error, maxRetries]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDownloading(false);
    setDownloadProgress(0);
    setErrorMessage(null);
  }, []);

  const reset = useCallback(() => {
    setIsDownloading(false);
    setDownloadProgress(0);
    setRetryAttempt(0);
    setErrorMessage(null);
    abortControllerRef.current = null;
  }, []);

  return {
    download,
    cancel,
    reset,
    isDownloading,
    downloadProgress,
    retryAttempt,
    errorMessage,
    maxRetries,
  };
};

/**
 * Preview SAN PDF without tracking
 */
export const usePreviewSanPdf = () => {
  const { error } = useToast();

  return useMutation({
    mutationFn: ({ id, openInNewTab }: { id: number; openInNewTab?: boolean }) =>
      goodsReceivedService.previewSanPDF(id, openInNewTab),
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to preview PDF');
    },
  });
};

/**
 * Download verified SAN PDF
 */
export const useDownloadVerifiedSanPdf = () => {
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(
    async (id: number, customFilename?: string): Promise<void> => {
      setIsDownloading(true);
      try {
        await goodsReceivedService.downloadVerifiedSanPDF(id, customFilename);
        success('Verified SAN PDF downloaded successfully');
      } catch (err: any) {
        error(err?.response?.data?.message || 'Failed to download verified SAN PDF');
      } finally {
        setIsDownloading(false);
      }
    },
    [success, error]
  );

  return { download, isDownloading };
};

/**
 * Download draft SAN PDF
 */
export const useDownloadDraftSanPdf = () => {
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(
    async (id: number, customFilename?: string): Promise<void> => {
      setIsDownloading(true);
      try {
        await goodsReceivedService.downloadDraftSanPDF(id, customFilename);
        success('Draft SAN PDF downloaded successfully');
      } catch (err: any) {
        error(err?.response?.data?.message || 'Failed to download draft SAN PDF');
      } finally {
        setIsDownloading(false);
      }
    },
    [success, error]
  );

  return { download, isDownloading };
};

/**
 * Save SAN PDF to server storage
 */
export const useSaveSanPdf = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, suffix }: { id: number; suffix?: string }) =>
      goodsReceivedService.saveSanPDF(id, suffix),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['san', id] });
      success('SAN PDF saved successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to save SAN PDF');
    },
  });
};

/**
 * Track SAN download
 */
export const useTrackSanDownload = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => goodsReceivedService.trackSanDownload(id),
    onSuccess: () => {
      success('Download tracked successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to track download');
    },
  });
};

/**
 * Share SAN PDF via email
 */
export const useShareSanPdf = () => {
  const { error } = useToast();

  const share = useCallback(
    async (id: number, email: string, subject?: string, body?: string): Promise<void> => {
      try {
        await goodsReceivedService.shareSanPDFViaEmail(id, email, subject, body);
      } catch (err: any) {
        error(err?.message || 'Failed to share PDF');
      }
    },
    [error]
  );

  return { share };
};

/**
 * Print SAN PDF
 */
export const usePrintSanPdf = () => {
  const { error } = useToast();

  const print = useCallback(
    async (id: number): Promise<void> => {
      try {
        await goodsReceivedService.printSanPDF(id);
      } catch (err: any) {
        error(err?.message || 'Failed to print PDF');
      }
    },
    [error]
  );

  return { print };
};

// ============================================
// LEGACY HOOKS (for backward compatibility)
// ============================================

/**
 * Legacy hook - kept for backward compatibility
 * Use useDownloadGrnPdf instead
 */
export const useGetGrnPdfLegacy = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => goodsReceivedService.getGrnPdf(id),
    onSuccess: () => {
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF');
    },
  });
};

/**
 * Legacy hook - kept for backward compatibility
 * Use useDownloadSanPdf instead
 */
export const useGetSanPdfLegacy = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => goodsReceivedService.getSanPdf(id),
    onSuccess: () => {
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF');
    },
  });
};

// ============================================
// EXPORT ALL HOOKS
// ============================================

export default {
  // GRN Queries
  useGrns,
  useGrn,
  useGrnSummary,
  usePendingGrns,
  useGrnsByPurchaseOrder,

  // SAN Queries
  useSans,
  useSan,
  useSanSummary,
  usePendingSans,
  useSansByPurchaseOrder,

  // GRN Mutations
  useCreateGrn,
  useSubmitGrn,
  useApproveGrn,
  useRejectGrn,
  useInspectGoods,

  // GRN PDF Mutations
  useGetGrnPdf,
  useDownloadGrnPdf,
  usePreviewGrnPdf,
  useDownloadVerifiedGrnPdf,
  useDownloadDraftGrnPdf,
  useSaveGrnPdf,
  useTrackGrnDownload,
  useShareGrnPdf,
  usePrintGrnPdf,

  // SAN Mutations
  useCreateSan,
  useSubmitSan,
  useApproveSan,
  useRejectSan,
  useRateService,

  // SAN PDF Mutations
  useGetSanPdf,
  useDownloadSanPdf,
  usePreviewSanPdf,
  useDownloadVerifiedSanPdf,
  useDownloadDraftSanPdf,
  useSaveSanPdf,
  useTrackSanDownload,
  useShareSanPdf,
  usePrintSanPdf,

  // Legacy
  useGetGrnPdfLegacy,
  useGetSanPdfLegacy,
};
