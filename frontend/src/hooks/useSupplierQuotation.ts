// frontend/src/hooks/useSupplierQuotation.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { supplierQuotationService } from '@/services/supplierQuotation.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  SupplierQuotation,
  SupplierQuotationFilters,
  CreateSupplierQuotationData,
  VerifySupplierQuotationData,
  EvaluateSupplierQuotationData,
} from '@/types/supplierQuotation.types';
import type { PaginatedResponse } from '@/types/common.types';

export const SUPPLIER_QUOTATIONS_QUERY_KEY = 'supplier-quotations';

// ============================================
// QUERIES
// ============================================

export const useSupplierQuotations = (
  filters?: SupplierQuotationFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<SupplierQuotation>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [SUPPLIER_QUOTATIONS_QUERY_KEY, filters],
    queryFn: () => supplierQuotationService.getAll(filters),
    ...options,
  });
};

export const useSupplierQuotation = (
  id: number,
  options?: Omit<UseQueryOptions<SupplierQuotation>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['supplier-quotation', id],
    queryFn: () => supplierQuotationService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useLowestSupplierQuotation = (
  qtnId: number,
  options?: Omit<UseQueryOptions<SupplierQuotation | null>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['lowest-supplier-quotation', qtnId],
    queryFn: () => supplierQuotationService.getLowest(qtnId),
    enabled: !!qtnId,
    ...options,
  });
};

export const useSupplierQuotationsByQtn = (
  qtnId: number,
  options?: Omit<UseQueryOptions<SupplierQuotation[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['supplier-quotations-by-qtn', qtnId],
    queryFn: () => supplierQuotationService.getByQtn(qtnId),
    enabled: !!qtnId,
    ...options,
  });
};

export const useSupplierQuotationsBySupplier = (
  supplierId: number,
  options?: Omit<UseQueryOptions<SupplierQuotation[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['supplier-quotations-by-supplier', supplierId],
    queryFn: () => supplierQuotationService.getBySupplier(supplierId),
    enabled: !!supplierId,
    ...options,
  });
};

// ============================================
// TRACKING QUERIES
// ============================================

/**
 * Hook for getting download statistics for a supplier quotation
 *
 * @param id - The supplier quotation ID
 * @param options - Optional query options
 * @returns Query result with download statistics
 *
 * @example
 * const { data: stats, isLoading } = useSupplierQuotationDownloadStats(123);
 * console.log(stats.download_count, stats.last_downloaded_at);
 */
export const useSupplierQuotationDownloadStats = (
  id: number,
  options?: Omit<UseQueryOptions<{
    download_count: number;
    last_downloaded_at: string;
    view_count: number;
    last_viewed_at: string;
    shared_count: number;
    last_shared_at: string;
  }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['supplier-quotation-download-stats', id],
    queryFn: () => supplierQuotationService.getDownloadStats(id),
    enabled: !!id,
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreateSupplierQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateSupplierQuotationData) => supplierQuotationService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotations-by-qtn', data.quotation_request_id] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.quotation_request_id] });
      queryClient.invalidateQueries({ queryKey: ['quotation-statistics', data.quotation_request_id] });
      success(`Quotation submitted successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to submit quotation');
    },
  });
};

export const useVerifySupplierQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VerifySupplierQuotationData }) =>
      supplierQuotationService.verify(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotations-by-qtn', data.quotation_request_id] });
      queryClient.invalidateQueries({ queryKey: ['lowest-supplier-quotation', data.quotation_request_id] });
      success(`Quotation verified successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to verify quotation');
    },
  });
};

export const useEvaluateSupplierQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EvaluateSupplierQuotationData }) =>
      supplierQuotationService.evaluate(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotations-by-qtn', data.quotation_request_id] });
      success(`Quotation evaluated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to evaluate quotation');
    },
  });
};

// ============================================
// PDF HOOKS WITH TRACKING
// ============================================

/**
 * Hook for downloading supplier quotation as PDF with automatic tracking
 *
 * @param options - Optional configuration for the mutation
 * @returns Mutation object with download function
 *
 * @example
 * const { mutate: downloadPDF, isPending } = useDownloadSupplierQuotationPDF();
 *
 * // Download PDF with automatic tracking
 * downloadPDF(123);
 *
 * // With custom filename
 * downloadPDF({ id: 123, filename: 'my-quotation.pdf' });
 */
export const useDownloadSupplierQuotationPDF = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async ({ id, filename }: { id: number; filename?: string }) => {
      // ✅ Track the download first
      await supplierQuotationService.trackDownload(id);
      // Then download the PDF
      await supplierQuotationService.downloadPDFDirect(id, filename);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation-download-stats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', variables.id] });
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to download PDF');
    },
  });
};

/**
 * Hook for downloading verified supplier quotation as PDF with automatic tracking
 *
 * @param options - Optional configuration for the mutation
 * @returns Mutation object with download function
 *
 * @example
 * const { mutate: downloadVerifiedPDF, isPending } = useDownloadVerifiedSupplierQuotationPDF();
 *
 * // Download verified PDF with automatic tracking
 * downloadVerifiedPDF(123);
 */
export const useDownloadVerifiedSupplierQuotationPDF = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async ({ id, filename }: { id: number; filename?: string }) => {
      // ✅ Track the download first
      await supplierQuotationService.trackDownload(id);
      // Then download the verified PDF
      await supplierQuotationService.downloadVerifiedPDF(id, filename);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation-download-stats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', variables.id] });
      success('Verified PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to download verified PDF');
    },
  });
};

/**
 * Hook for downloading draft supplier quotation as PDF with automatic tracking
 *
 * @param options - Optional configuration for the mutation
 * @returns Mutation object with download function
 *
 * @example
 * const { mutate: downloadDraftPDF, isPending } = useDownloadDraftSupplierQuotationPDF();
 *
 * // Download draft PDF with automatic tracking
 * downloadDraftPDF(123);
 */
export const useDownloadDraftSupplierQuotationPDF = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async ({ id, filename }: { id: number; filename?: string }) => {
      // ✅ Track the download first
      await supplierQuotationService.trackDownload(id);
      // Then download the draft PDF
      await supplierQuotationService.downloadDraftPDF(id, filename);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation-download-stats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', variables.id] });
      success('Draft PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to download draft PDF');
    },
  });
};

/**
 * Hook for previewing supplier quotation as PDF (does NOT track downloads)
 *
 * @param options - Optional configuration
 * @returns Object with preview function
 *
 * @example
 * const { previewPDF } = usePreviewSupplierQuotationPDF();
 *
 * // Open in new tab
 * previewPDF(123);
 *
 * // Open in same window
 * previewPDF({ id: 123, openInNewTab: false });
 */
export const usePreviewSupplierQuotationPDF = () => {
  const { error } = useToast();

  const previewPDF = async (idOrOptions: number | { id: number; openInNewTab?: boolean }) => {
    try {
      let id: number;
      let openInNewTab: boolean = true;

      if (typeof idOrOptions === 'number') {
        id = idOrOptions;
      } else {
        id = idOrOptions.id;
        openInNewTab = idOrOptions.openInNewTab ?? true;
      }

      await supplierQuotationService.previewPDF(id, openInNewTab);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to preview PDF');
    }
  };

  return { previewPDF };
};

/**
 * Hook for getting Base64 encoded supplier quotation PDF (does NOT track downloads)
 *
 * @param options - Optional configuration
 * @returns Object with getBase64 function and loading state
 *
 * @example
 * const { getBase64PDF, isPending } = useBase64SupplierQuotationPDF();
 *
 * // Get base64 PDF
 * const data = await getBase64PDF(123);
 * console.log(data.base64, data.filename, data.size);
 */
export const useBase64SupplierQuotationPDF = () => {
  const { error } = useToast();

  return useMutation({
    mutationFn: (id: number) => supplierQuotationService.getBase64PDF(id),
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate Base64 PDF');
    },
  });
};

/**
 * Hook for getting supplier quotation PDF for email attachment (does NOT track downloads)
 *
 * @param options - Optional configuration
 * @returns Object with getPDFForEmail function and loading state
 *
 * @example
 * const { getPDFForEmail, isPending } = useSupplierQuotationPDFForEmail();
 *
 * // Get PDF for email
 * const emailData = await getPDFForEmail(123);
 * // Send email with attachment
 */
export const useSupplierQuotationPDFForEmail = () => {
  const { error } = useToast();

  return useMutation({
    mutationFn: (id: number) => supplierQuotationService.getPDFForEmail(id),
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF for email');
    },
  });
};

/**
 * Hook for saving supplier quotation PDF to server storage (does NOT track downloads)
 *
 * @param options - Optional configuration
 * @returns Mutation object with save function
 *
 * @example
 * const { mutate: savePDF, isPending } = useSaveSupplierQuotationPDF();
 *
 * // Save PDF
 * const result = await savePDF(123);
 * console.log(result.path, result.url);
 *
 * // With suffix
 * const result = await savePDF({ id: 123, suffix: 'final' });
 */
export const useSaveSupplierQuotationPDF = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, suffix }: { id: number; suffix?: string }) =>
      supplierQuotationService.savePDF(id, suffix),
    onSuccess: (data) => {
      success(`PDF saved successfully at: ${data.path}`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to save PDF');
    },
  });
};

/**
 * Hook for printing supplier quotation PDF (does NOT track downloads)
 *
 * @returns Object with print function
 *
 * @example
 * const { printPDF } = usePrintSupplierQuotationPDF();
 *
 * // Print PDF
 * printPDF(123);
 */
export const usePrintSupplierQuotationPDF = () => {
  const { error } = useToast();

  const printPDF = async (id: number) => {
    try {
      await supplierQuotationService.printPDF(id);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to print PDF');
    }
  };

  return { printPDF };
};

/**
 * Hook for sharing supplier quotation PDF via email (does NOT track downloads)
 *
 * @returns Object with share function
 *
 * @example
 * const { sharePDFViaEmail } = useShareSupplierQuotationPDFViaEmail();
 *
 * // Share via email
 * sharePDFViaEmail({
 *   id: 123,
 *   email: 'supplier@example.com',
 *   subject: 'Your Quotation',
 *   body: 'Please review the attached quotation.'
 * });
 */
export const useShareSupplierQuotationPDFViaEmail = () => {
  const { error } = useToast();

  const sharePDFViaEmail = async ({
    id,
    email,
    subject,
    body,
  }: {
    id: number;
    email: string;
    subject?: string;
    body?: string;
  }) => {
    try {
      await supplierQuotationService.sharePDFViaEmail(id, email, subject, body);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to share PDF via email');
    }
  };

  return { sharePDFViaEmail };
};

/**
 * Hook for downloading multiple supplier quotations as PDFs with automatic tracking
 *
 * @param options - Optional configuration
 * @returns Mutation object with download function
 *
 * @example
 * const { mutate: downloadMultiple, isPending } = useDownloadMultipleSupplierQuotationPDFs();
 *
 * // Download multiple PDFs with automatic tracking
 * downloadMultiple([1, 2, 3]);
 *
 * // With custom zip filename
 * downloadMultiple({ ids: [1, 2, 3], filename: 'my-quotations.zip' });
 */
export const useDownloadMultipleSupplierQuotationPDFs = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async ({ ids, filename }: { ids: number[]; filename?: string }) => {
      // ✅ Track all downloads first
      for (const id of ids) {
        await supplierQuotationService.trackDownload(id);
      }
      // Then download all PDFs
      await supplierQuotationService.downloadMultiplePDFs(ids, filename);
    },
    onSuccess: (_, variables) => {
      for (const id of variables.ids) {
        queryClient.invalidateQueries({ queryKey: ['supplier-quotation-download-stats', id] });
        queryClient.invalidateQueries({ queryKey: ['supplier-quotation', id] });
      }
      success('Multiple PDFs downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to download multiple PDFs');
    },
  });
};

/**
 * Hook for getting supplier quotation PDF URL
 *
 * @returns Function that returns the PDF URL
 *
 * @example
 * const { getPDFUrl } = useSupplierQuotationPDFUrl();
 *
 * // Get download URL
 * const downloadUrl = getPDFUrl(123, 'download');
 *
 * // Get preview URL
 * const previewUrl = getPDFUrl(123, 'preview');
 */
export const useSupplierQuotationPDFUrl = () => {
  const getPDFUrl = (id: number, mode: 'download' | 'preview' = 'download'): string => {
    return supplierQuotationService.getPDFUrl(id, mode);
  };

  return { getPDFUrl };
};

// ============================================
// TRACKING MUTATIONS
// ============================================

/**
 * Hook for manually tracking a supplier quotation download
 *
 * @returns Mutation object with track function
 *
 * @example
 * const { mutate: trackDownload } = useTrackSupplierQuotationDownload();
 *
 * // Track download manually
 * trackDownload(123);
 */
export const useTrackSupplierQuotationDownload = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => supplierQuotationService.trackDownload(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation-download-stats', id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', id] });
      success(`Download tracked successfully (${data.download_count} total downloads)`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to track download');
    },
  });
};

/**
 * Hook for manually tracking a supplier quotation view
 *
 * @returns Mutation object with track function
 *
 * @example
 * const { mutate: trackView } = useTrackSupplierQuotationView();
 *
 * // Track view manually
 * trackView(123);
 */
export const useTrackSupplierQuotationView = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => supplierQuotationService.trackView(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation-download-stats', id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', id] });
      success(`View tracked successfully (${data.view_count} total views)`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to track view');
    },
  });
};

/**
 * Hook for manually tracking a supplier quotation share
 *
 * @returns Mutation object with track function
 *
 * @example
 * const { mutate: trackShare } = useTrackSupplierQuotationShare();
 *
 * // Track share manually
 * trackShare({ id: 123, share_method: 'email', recipient: 'supplier@example.com' });
 */
export const useTrackSupplierQuotationShare = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, shareData }: { id: number; shareData?: { share_method?: string; recipient?: string } }) =>
      supplierQuotationService.trackShare(id, shareData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation-download-stats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', variables.id] });
      success(`Share tracked successfully (${data.shared_count} total shares)`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to track share');
    },
  });
};

/**
 * Hook for bulk tracking multiple supplier quotation downloads
 *
 * @returns Mutation object with bulk track function
 *
 * @example
 * const { mutate: bulkTrackDownloads } = useBulkTrackSupplierQuotationDownloads();
 *
 * // Bulk track multiple downloads
 * bulkTrackDownloads([1, 2, 3]);
 */
export const useBulkTrackSupplierQuotationDownloads = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (ids: number[]) => supplierQuotationService.bulkTrackDownloads(ids),
    onSuccess: (data) => {
      for (const item of data) {
        queryClient.invalidateQueries({ queryKey: ['supplier-quotation-download-stats', item.id] });
        queryClient.invalidateQueries({ queryKey: ['supplier-quotation', item.id] });
      }
      success(`Bulk download tracked successfully for ${data.length} quotations`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to bulk track downloads');
    },
  });
};

/**
 * Hook for combined track and download (single call)
 *
 * @returns Mutation object with track and download function
 *
 * @example
 * const { mutate: trackAndDownload, isPending } = useTrackAndDownloadSupplierQuotationPDF();
 *
 * // Track and download in one call
 * trackAndDownload(123);
 */
export const useTrackAndDownloadSupplierQuotationPDF = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async ({ id, filename }: { id: number; filename?: string }) => {
      await supplierQuotationService.trackAndDownloadPDF(id, filename);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation-download-stats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-quotation', variables.id] });
      success('PDF downloaded and tracked successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to download and track PDF');
    },
  });
};

// ============================================
// EXPORT ALL HOOKS
// ============================================

export default {
  // Queries
  useSupplierQuotations,
  useSupplierQuotation,
  useLowestSupplierQuotation,
  useSupplierQuotationsByQtn,
  useSupplierQuotationsBySupplier,

  // Tracking Queries
  useSupplierQuotationDownloadStats,

  // Mutations
  useCreateSupplierQuotation,
  useVerifySupplierQuotation,
  useEvaluateSupplierQuotation,

  // PDF Hooks (with automatic tracking)
  useDownloadSupplierQuotationPDF,
  useDownloadVerifiedSupplierQuotationPDF,
  useDownloadDraftSupplierQuotationPDF,

  // PDF Hooks (without tracking - view/preview/base64/save/print/share)
  usePreviewSupplierQuotationPDF,
  useBase64SupplierQuotationPDF,
  useSupplierQuotationPDFForEmail,
  useSaveSupplierQuotationPDF,
  usePrintSupplierQuotationPDF,
  useShareSupplierQuotationPDFViaEmail,
  useDownloadMultipleSupplierQuotationPDFs,
  useSupplierQuotationPDFUrl,

  // Tracking Mutations
  useTrackSupplierQuotationDownload,
  useTrackSupplierQuotationView,
  useTrackSupplierQuotationShare,
  useBulkTrackSupplierQuotationDownloads,
  useTrackAndDownloadSupplierQuotationPDF,
};
