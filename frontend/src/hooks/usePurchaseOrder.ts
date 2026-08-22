// frontend/src/hooks/usePurchaseOrder.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { purchaseOrderService } from '@/services/purchaseOrder.service';
import { useToast } from '@/components/ui/toast-context';
import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderSummary,
  PurchaseOrderWorkflow,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
} from '@/types/purchaseOrder.types';
import type { PaginatedResponse } from '@/types/common.types';

export const PURCHASE_ORDERS_QUERY_KEY = 'purchase-orders';

// ============================================
// QUERIES
// ============================================

export const usePurchaseOrders = (
  filters?: PurchaseOrderFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<PurchaseOrder>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PURCHASE_ORDERS_QUERY_KEY, filters],
    queryFn: () => purchaseOrderService.getAll(filters),
    ...options,
  });
};

export const usePurchaseOrder = (
  id: number,
  options?: Omit<UseQueryOptions<PurchaseOrder>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => purchaseOrderService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const usePurchaseOrderSummary = (
  id: number,
  options?: Omit<UseQueryOptions<PurchaseOrderSummary>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['purchase-order-summary', id],
    queryFn: () => purchaseOrderService.getSummary(id),
    enabled: !!id,
    ...options,
  });
};

export const usePurchaseOrderDeliveryProgress = (
  id: number,
  options?: Omit<UseQueryOptions<{ progress: number }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['purchase-order-delivery-progress', id],
    queryFn: () => purchaseOrderService.getDeliveryProgress(id),
    enabled: !!id,
    ...options,
  });
};

export const useOverduePurchaseOrders = (
  options?: Omit<UseQueryOptions<PurchaseOrder[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['overdue-purchase-orders'],
    queryFn: () => purchaseOrderService.getOverdue(),
    ...options,
  });
};

export const usePurchaseOrdersByRequisition = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<PurchaseOrder[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['purchase-orders-by-requisition', requisitionId],
    queryFn: () => purchaseOrderService.getByRequisition(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

// ============================================
// WORKFLOW QUERIES
// ============================================

/**
 * Get workflow status for a purchase order
 */
export const usePurchaseOrderWorkflow = (
  id: number,
  options?: Omit<UseQueryOptions<PurchaseOrderWorkflow>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['purchase-order-workflow', id],
    queryFn: () => purchaseOrderService.getWorkflow(id),
    enabled: !!id,
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderData) => purchaseOrderService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders-by-requisition', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status', data.requisition_id] });
      success(`Purchase Order "${data.po_number}" generated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate purchase order');
    },
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePurchaseOrderData }) =>
      purchaseOrderService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      success(`Purchase Order updated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to update purchase order');
    },
  });
};

// ============================================
// WORKFLOW MUTATIONS
// ============================================

/**
 * Check purchase order (HOD)
 */
export const useCheckPurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      purchaseOrderService.check(id, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-workflow', data.id] });
      success(`Purchase Order "${data.po_number}" checked successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to check purchase order');
    },
  });
};

/**
 * Endorse purchase order (Accountant)
 */
export const useEndorsePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      purchaseOrderService.endorse(id, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-workflow', data.id] });
      success(`Purchase Order "${data.po_number}" endorsed successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to endorse purchase order');
    },
  });
};

/**
 * Approve purchase order (Director/Finance Admin)
 */
export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      purchaseOrderService.approve(id, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-workflow', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`Purchase Order "${data.po_number}" approved successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to approve purchase order');
    },
  });
};

// ============================================
// STATUS MANAGEMENT MUTATIONS
// ============================================

export const useIssuePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.issue(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-workflow', data.id] });
      success(`Purchase Order "${data.po_number}" issued successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to issue purchase order');
    },
  });
};

export const useSendPurchaseOrderToSupplier = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.sendToSupplier(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-workflow', data.id] });
      success(`Purchase Order "${data.po_number}" sent to supplier successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to send purchase order to supplier');
    },
  });
};

export const useAcknowledgePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, supplierId }: { id: number; supplierId: number }) =>
      purchaseOrderService.acknowledge(id, supplierId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-workflow', data.id] });
      success(`Purchase Order "${data.po_number}" acknowledged by supplier`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to acknowledge purchase order');
    },
  });
};

export const useMarkPurchaseOrderDelivered = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.markDelivered(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-delivery-progress', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-workflow', data.id] });
      success(`Purchase Order "${data.po_number}" marked as delivered`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to mark purchase order as delivered');
    },
  });
};

export const useCompletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.complete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-workflow', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status', data.requisition_id] });
      success(`Purchase Order "${data.po_number}" completed successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to complete purchase order');
    },
  });
};

export const useCancelPurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      purchaseOrderService.cancel(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-workflow', data.id] });
      success(`Purchase Order "${data.po_number}" cancelled successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel purchase order');
    },
  });
};

// ============================================
// PDF MUTATIONS WITH RETRY LOGIC
// ============================================

/**
 * ✅ Download purchase order PDF with retry logic
 * Uses existing purchaseOrderService.trackAndDownloadPDF
 * Implements exponential backoff retry for network failures
 */
export const useGetPurchaseOrderPdf = () => {
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
          // Create abort controller for this attempt
          abortControllerRef.current = new AbortController();

          // Use the existing service method
          await purchaseOrderService.trackAndDownloadPDF(id);

          if (isMountedRef.current) {
            setIsDownloading(false);
            setDownloadProgress(100);
            if (onProgress) onProgress(100);
            success('PDF downloaded successfully');
          }
        } catch (err: any) {
          if (!isMountedRef.current) return;

          // Check if this was an abort
          if (err?.name === 'AbortError' || err?.message?.includes('abort')) {
            setIsDownloading(false);
            setErrorMessage('Download cancelled');
            return;
          }

          // Determine if we should retry
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

          const shouldRetry = isRetryable && attempt < maxRetries;

          if (shouldRetry) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
            setRetryAttempt(attempt + 1);
            setDownloadProgress(0);

            if (isMountedRef.current) {
              // Wait with exponential backoff
              await new Promise((resolve) => setTimeout(resolve, delay));
              // Retry
              return attemptDownload(attempt + 1);
            }
          } else {
            // No more retries or non-retryable error
            setIsDownloading(false);
            const msg = err?.response?.data?.message || err?.message || 'Failed to generate PDF';
            setErrorMessage(msg);
            error(msg);
          }
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
 * ✅ Download purchase order PDF with simplified interface
 * Uses the retry logic internally
 */
export const useDownloadPurchaseOrderPdf = () => {
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

          await purchaseOrderService.trackAndDownloadPDF(id);

          if (isMountedRef.current) {
            setIsDownloading(false);
            setDownloadProgress(100);
            success('PDF downloaded successfully');
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
 * Preview purchase order PDF without tracking
 */
export const usePreviewPurchaseOrderPdf = () => {
  const { error } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.previewPDF(id),
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to preview PDF');
    },
  });
};

// ============================================
// EXPORT ALL HOOKS
// ============================================

export default {
  // Queries
  usePurchaseOrders,
  usePurchaseOrder,
  usePurchaseOrderSummary,
  usePurchaseOrderDeliveryProgress,
  useOverduePurchaseOrders,
  usePurchaseOrdersByRequisition,
  usePurchaseOrderWorkflow,

  // Mutations - Creation & Update
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,

  // Mutations - Workflow
  useCheckPurchaseOrder,
  useEndorsePurchaseOrder,
  useApprovePurchaseOrder,

  // Mutations - Status Management
  useIssuePurchaseOrder,
  useSendPurchaseOrderToSupplier,
  useAcknowledgePurchaseOrder,
  useMarkPurchaseOrderDelivered,
  useCompletePurchaseOrder,
  useCancelPurchaseOrder,

  // Mutations - PDF
  useGetPurchaseOrderPdf,
  useDownloadPurchaseOrderPdf,
  usePreviewPurchaseOrderPdf,
};
