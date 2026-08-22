// frontend/src/hooks/useQuotation.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { quotationService } from '@/services/quotation.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  QuotationRequest,
  QuotationFilters,
  QuotationStatistics,
  CreateQuotationData,
  UpdateQuotationData,
  SendQuotationData,
  CancelQuotationData,
  SelectSupplierData,
} from '@/types/quotations.types';
import type { PaginatedResponse } from '@/types/common.types';

export const QUOTATIONS_QUERY_KEY = 'quotations';

// ============================================
// QUERIES
// ============================================

export const useQuotations = (
  filters?: QuotationFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<QuotationRequest>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, filters],
    queryFn: () => quotationService.getAll(filters),
    ...options,
  });
};

export const useActiveQuotations = (
  options?: Omit<UseQueryOptions<QuotationRequest[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['active-quotations'],
    queryFn: () => quotationService.getActive(),
    ...options,
  });
};

export const useClosingSoonQuotations = (
  options?: Omit<UseQueryOptions<QuotationRequest[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['closing-soon-quotations'],
    queryFn: () => quotationService.getClosingSoon(),
    ...options,
  });
};

export const useQuotation = (
  id: number,
  options?: Omit<UseQueryOptions<QuotationRequest>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: () => quotationService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useQuotationStatistics = (
  id: number,
  options?: Omit<UseQueryOptions<QuotationStatistics>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['quotation-statistics', id],
    queryFn: () => quotationService.getStatistics(id),
    enabled: !!id,
    ...options,
  });
};

// ============================================
// TRACKING QUERIES
// ============================================

/**
 * Hook for getting download statistics for a quotation
 *
 * @param id - The quotation ID
 * @param options - Optional query options
 * @returns Query result with download statistics
 *
 * @example
 * const { data: stats, isLoading } = useQuotationDownloadStats(123);
 * console.log(stats.download_count, stats.last_downloaded_at);
 */
export const useQuotationDownloadStats = (
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
    queryKey: ['quotation-download-stats', id],
    queryFn: () => quotationService.getDownloadStats(id),
    enabled: !!id,
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateQuotationData) => quotationService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['active-quotations'] });
      queryClient.invalidateQueries({ queryKey: ['closing-soon-quotations'] });
      success(`Quotation request "${data.qtn_number}" created successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to create quotation');
    },
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateQuotationData }) =>
      quotationService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-quotations'] });
      success(`Quotation "${data.qtn_number}" updated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to update quotation');
    },
  });
};

export const useSendQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SendQuotationData }) =>
      quotationService.send(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-quotations'] });
      success(`Quotation "${data.qtn_number}" sent to suppliers successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to send quotation');
    },
  });
};

export const useCloseQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => quotationService.close(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-quotations'] });
      success(`Quotation "${data.qtn_number}" closed successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to close quotation');
    },
  });
};

export const useCancelQuotation = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelQuotationData }) =>
      quotationService.cancel(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
      success(`Quotation "${data.qtn_number}" cancelled successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel quotation');
    },
  });
};

export const useSendQuotationReminder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => quotationService.sendReminder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      success('Reminder sent to suppliers successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to send reminder');
    },
  });
};

export const useSelectSupplier = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: SelectSupplierData) => quotationService.selectSupplier(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status', data.requisition_id] });
      success('Supplier selected successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to select supplier');
    },
  });
};

// ============================================
// PDF HOOKS WITH TRACKING
// ============================================

/**
 * Hook for downloading QTN as PDF with automatic tracking
 *
 * @param options - Optional configuration for the mutation
 * @returns Mutation object with download function
 *
 * @example
 * const { mutate: downloadPDF, isPending } = useDownloadPDF();
 *
 * // Download PDF with automatic tracking
 * downloadPDF(123);
 *
 * // With custom filename
 * downloadPDF({ id: 123, filename: 'my-qtn.pdf' });
 */
export const useDownloadPDF = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async ({ id, filename }: { id: number; filename?: string }) => {
      // ✅ Track the download first
      await quotationService.trackDownload(id);
      // Then download the PDF
      await quotationService.downloadPDFDirect(id, filename);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotation-download-stats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to download PDF');
    },
  });
};

/**
 * Hook for downloading verified QTN as PDF with automatic tracking
 *
 * @param options - Optional configuration for the mutation
 * @returns Mutation object with download function
 *
 * @example
 * const { mutate: downloadVerifiedPDF, isPending } = useDownloadVerifiedPDF();
 *
 * // Download verified PDF with automatic tracking
 * downloadVerifiedPDF(123);
 */
export const useDownloadVerifiedPDF = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async ({ id, filename }: { id: number; filename?: string }) => {
      // ✅ Track the download first
      await quotationService.trackDownload(id);
      // Then download the verified PDF
      await quotationService.downloadVerifiedPDF(id, filename);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotation-download-stats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
      success('Verified PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to download verified PDF');
    },
  });
};

/**
 * Hook for downloading draft QTN as PDF with automatic tracking
 *
 * @param options - Optional configuration for the mutation
 * @returns Mutation object with download function
 *
 * @example
 * const { mutate: downloadDraftPDF, isPending } = useDownloadDraftPDF();
 *
 * // Download draft PDF with automatic tracking
 * downloadDraftPDF(123);
 */
export const useDownloadDraftPDF = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async ({ id, filename }: { id: number; filename?: string }) => {
      // ✅ Track the download first
      await quotationService.trackDownload(id);
      // Then download the draft PDF
      await quotationService.downloadDraftPDF(id, filename);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotation-download-stats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
      success('Draft PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to download draft PDF');
    },
  });
};

/**
 * Hook for previewing QTN as PDF (does NOT track downloads)
 *
 * @param options - Optional configuration
 * @returns Object with preview function
 *
 * @example
 * const { previewPDF } = usePreviewPDF();
 *
 * // Open in new tab
 * previewPDF(123);
 *
 * // Open in same window
 * previewPDF({ id: 123, openInNewTab: false });
 */
export const usePreviewPDF = () => {
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

      await quotationService.previewPDF(id, openInNewTab);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to preview PDF');
    }
  };

  return { previewPDF };
};

/**
 * Hook for getting Base64 encoded PDF (for email attachments) - does NOT track downloads
 *
 * @param options - Optional configuration
 * @returns Object with getBase64 function and loading state
 *
 * @example
 * const { getBase64PDF, isPending } = useBase64PDF();
 *
 * // Get base64 PDF
 * const data = await getBase64PDF(123);
 * console.log(data.base64, data.filename, data.size);
 */
export const useBase64PDF = () => {
  const { error } = useToast();

  return useMutation({
    mutationFn: (id: number) => quotationService.getBase64PDF(id),
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate Base64 PDF');
    },
  });
};

/**
 * Hook for getting PDF for email attachment (does NOT track downloads)
 *
 * @param options - Optional configuration
 * @returns Object with getEmailPDF function and loading state
 *
 * @example
 * const { getPDFForEmail, isPending } = usePDFForEmail();
 *
 * // Get PDF for email
 * const emailData = await getPDFForEmail(123);
 * // Send email with attachment
 */
export const usePDFForEmail = () => {
  const { error } = useToast();

  return useMutation({
    mutationFn: (id: number) => quotationService.getPDFForEmail(id),
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF for email');
    },
  });
};

/**
 * Hook for saving PDF to server storage (does NOT track downloads)
 *
 * @param options - Optional configuration
 * @returns Mutation object with save function
 *
 * @example
 * const { mutate: savePDF, isPending } = useSavePDF();
 *
 * // Save PDF
 * const result = await savePDF(123);
 * console.log(result.path);
 */
export const useSavePDF = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => quotationService.savePDF(id),
    onSuccess: (data) => {
      success(`PDF saved successfully at: ${data.path}`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to save PDF');
    },
  });
};

/**
 * Hook for printing QTN PDF (does NOT track downloads)
 *
 * @returns Object with print function
 *
 * @example
 * const { printPDF } = usePrintPDF();
 *
 * // Print PDF
 * printPDF(123);
 */
export const usePrintPDF = () => {
  const { error } = useToast();

  const printPDF = async (id: number) => {
    try {
      await quotationService.printPDF(id);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to print PDF');
    }
  };

  return { printPDF };
};

/**
 * Hook for sharing PDF via email (does NOT track downloads)
 *
 * @returns Object with share function
 *
 * @example
 * const { sharePDFViaEmail } = useSharePDFViaEmail();
 *
 * // Share via email
 * sharePDFViaEmail({
 *   id: 123,
 *   email: 'supplier@example.com',
 *   subject: 'QTN Document',
 *   body: 'Please review the attached QTN.'
 * });
 */
export const useSharePDFViaEmail = () => {
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
      await quotationService.sharePDFViaEmail(id, email, subject, body);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to share PDF via email');
    }
  };

  return { sharePDFViaEmail };
};

/**
 * Hook for downloading multiple QTNs as PDF with automatic tracking
 *
 * @param options - Optional configuration
 * @returns Mutation object with download function
 *
 * @example
 * const { mutate: downloadMultiple, isPending } = useDownloadMultiplePDFs();
 *
 * // Download multiple PDFs with automatic tracking
 * downloadMultiple([1, 2, 3]);
 *
 * // With custom filename
 * downloadMultiple({ ids: [1, 2, 3], filename: 'my-qtn.zip' });
 */
export const useDownloadMultiplePDFs = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async ({ ids, filename }: { ids: number[]; filename?: string }) => {
      // ✅ Track all downloads first
      for (const id of ids) {
        await quotationService.trackDownload(id);
      }
      // Then download all PDFs
      await quotationService.downloadMultiplePDFs(ids, filename);
    },
    onSuccess: (_, variables) => {
      for (const id of variables.ids) {
        queryClient.invalidateQueries({ queryKey: ['quotation-download-stats', id] });
        queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      }
      success('Multiple PDFs downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to download multiple PDFs');
    },
  });
};

/**
 * Hook for getting PDF URL
 *
 * @returns Function that returns the PDF URL
 *
 * @example
 * const { getPDFUrl } = usePDFUrl();
 *
 * // Get download URL
 * const downloadUrl = getPDFUrl(123, 'download');
 *
 * // Get preview URL
 * const previewUrl = getPDFUrl(123, 'preview');
 */
export const usePDFUrl = () => {
  const getPDFUrl = (id: number, mode: 'download' | 'preview' = 'download'): string => {
    return quotationService.getPDFUrl(id, mode);
  };

  return { getPDFUrl };
};

// ============================================
// TRACKING MUTATIONS
// ============================================

/**
 * Hook for manually tracking a quotation download
 *
 * @returns Mutation object with track function
 *
 * @example
 * const { mutate: trackDownload } = useTrackQuotationDownload();
 *
 * // Track download manually
 * trackDownload(123);
 */
export const useTrackQuotationDownload = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => quotationService.trackDownload(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotation-download-stats', id] });
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      success(`Download tracked successfully (${data.download_count} total downloads)`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to track download');
    },
  });
};

/**
 * Hook for manually tracking a quotation view
 *
 * @returns Mutation object with track function
 *
 * @example
 * const { mutate: trackView } = useTrackQuotationView();
 *
 * // Track view manually
 * trackView(123);
 */
export const useTrackQuotationView = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => quotationService.trackView(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotation-download-stats', id] });
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      success(`View tracked successfully (${data.view_count} total views)`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to track view');
    },
  });
};

/**
 * Hook for manually tracking a quotation share
 *
 * @returns Mutation object with track function
 *
 * @example
 * const { mutate: trackShare } = useTrackQuotationShare();
 *
 * // Track share manually
 * trackShare({ id: 123, share_method: 'email', recipient: 'supplier@example.com' });
 */
export const useTrackQuotationShare = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, shareData }: { id: number; shareData?: { share_method?: string; recipient?: string } }) =>
      quotationService.trackShare(id, shareData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotation-download-stats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
      success(`Share tracked successfully (${data.shared_count} total shares)`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to track share');
    },
  });
};

/**
 * Hook for bulk tracking multiple quotation downloads
 *
 * @returns Mutation object with bulk track function
 *
 * @example
 * const { mutate: bulkTrackDownloads } = useBulkTrackQuotationDownloads();
 *
 * // Bulk track multiple downloads
 * bulkTrackDownloads([1, 2, 3]);
 */
export const useBulkTrackQuotationDownloads = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (ids: number[]) => quotationService.bulkTrackDownloads(ids),
    onSuccess: (data) => {
      for (const item of data) {
        queryClient.invalidateQueries({ queryKey: ['quotation-download-stats', item.id] });
        queryClient.invalidateQueries({ queryKey: ['quotation', item.id] });
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
 * const { mutate: trackAndDownload, isPending } = useTrackAndDownloadPDF();
 *
 * // Track and download in one call
 * trackAndDownload(123);
 */
export const useTrackAndDownloadPDF = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async ({ id, filename }: { id: number; filename?: string }) => {
      await quotationService.trackAndDownloadPDF(id, filename);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotation-download-stats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
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
  useQuotations,
  useActiveQuotations,
  useClosingSoonQuotations,
  useQuotation,
  useQuotationStatistics,

  // Tracking Queries
  useQuotationDownloadStats,

  // Mutations
  useCreateQuotation,
  useUpdateQuotation,
  useSendQuotation,
  useCloseQuotation,
  useCancelQuotation,
  useSendQuotationReminder,
  useSelectSupplier,

  // PDF Hooks (with automatic tracking)
  useDownloadPDF,
  useDownloadVerifiedPDF,
  useDownloadDraftPDF,

  // PDF Hooks (without tracking - preview/base64/email/save/print/share)
  usePreviewPDF,
  useBase64PDF,
  usePDFForEmail,
  useSavePDF,
  usePrintPDF,
  useSharePDFViaEmail,
  useDownloadMultiplePDFs,
  usePDFUrl,

  // Tracking Mutations
  useTrackQuotationDownload,
  useTrackQuotationView,
  useTrackQuotationShare,
  useBulkTrackQuotationDownloads,
  useTrackAndDownloadPDF,
};
