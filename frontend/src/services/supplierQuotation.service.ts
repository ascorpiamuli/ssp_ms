// frontend/src/services/supplierQuotation.service.ts

import { api } from './api';
import type {
  SupplierQuotation,
  SupplierQuotationFilters,
  CreateSupplierQuotationData,
  VerifySupplierQuotationData,
  EvaluateSupplierQuotationData,
} from '@/types/supplierQuotation.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/supplier-quotations';

// Get the base URL from the api client
const getBaseUrl = (): string => {
  const client = api.getClient();
  if (client?.defaults?.baseURL) {
    return client.defaults.baseURL;
  }
  return process.env.NEXT_PUBLIC_API_URL || '';
};

/**
 * Extract filename from Content-Disposition header
 *
 * @param contentDisposition - The Content-Disposition header value
 * @returns The extracted filename or null if not found
 *
 * @example
 * extractFilenameFromHeader('attachment; filename="QTN-2026-00006.pdf"')
 * // Returns: "QTN-2026-00006.pdf"
 */
const extractFilenameFromHeader = (contentDisposition: string | null): string | null => {
  if (!contentDisposition) {
    return null;
  }

  // Try to match filename* (RFC 5987) - UTF-8 encoded
  const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
  if (filenameStarMatch) {
    return decodeURIComponent(filenameStarMatch[1]);
  }

  // Try to match filename with quotes (RFC 2616) - "filename"
  const filenameQuotedMatch = contentDisposition.match(/filename="([^"]+)"/);
  if (filenameQuotedMatch) {
    return filenameQuotedMatch[1];
  }

  // Try to match filename without quotes (RFC 2616) - filename=value
  const filenameUnquotedMatch = contentDisposition.match(/filename=([^;]+)/);
  if (filenameUnquotedMatch) {
    return filenameUnquotedMatch[1].trim();
  }

  return null;
};

export const supplierQuotationService = {
  /**
   * Get all supplier quotations with filters
   */
  getAll: async (filters?: SupplierQuotationFilters): Promise<PaginatedResponse<SupplierQuotation>> => {
    return api.get<PaginatedResponse<SupplierQuotation>>(BASE_URL, { params: filters });
  },

  /**
   * Get supplier quotation by ID
   */
  getById: async (id: number): Promise<SupplierQuotation> => {
    return api.get<SupplierQuotation>(`${BASE_URL}/${id}`);
  },

  /**
   * Create a new supplier quotation
   */
  create: async (data: CreateSupplierQuotationData): Promise<SupplierQuotation> => {
    return api.post<SupplierQuotation>(BASE_URL, data);
  },

  /**
   * Verify a supplier quotation
   */
  verify: async (id: number, data: VerifySupplierQuotationData): Promise<SupplierQuotation> => {
    return api.post<SupplierQuotation>(`${BASE_URL}/${id}/verify`, data);
  },

  /**
   * Evaluate a supplier quotation
   */
  evaluate: async (id: number, data: EvaluateSupplierQuotationData): Promise<SupplierQuotation> => {
    return api.post<SupplierQuotation>(`${BASE_URL}/${id}/evaluate`, data);
  },

  /**
   * Get the lowest quotation for a QTN
   */
  getLowest: async (qtnId: number): Promise<SupplierQuotation | null> => {
    return api.get<SupplierQuotation | null>(`${BASE_URL}/lowest/${qtnId}`);
  },

  /**
   * Get quotations by QTN ID
   */
  getByQtn: async (qtnId: number): Promise<SupplierQuotation[]> => {
    return api.get<SupplierQuotation[]>(`${BASE_URL}`, { params: { qtn_id: qtnId } });
  },

  /**
   * Get quotations by supplier ID
   */
  getBySupplier: async (supplierId: number): Promise<SupplierQuotation[]> => {
    return api.get<SupplierQuotation[]>(`${BASE_URL}`, { params: { supplier_id: supplierId } });
  },

  // ============================================================
  // PDF GENERATION METHODS
  // ============================================================

  /**
   * Download supplier quotation as PDF (file download)
   * Extracts filename from Content-Disposition header
   *
   * @param id - The supplier quotation ID
   * @param customFilename - Optional custom filename override
   * @returns Promise<{ blob: Blob; filename: string }>
   */
  downloadPDF: async (id: number, customFilename?: string): Promise<{ blob: Blob; filename: string }> => {
    const client = api.getClient();
    const response = await client.get(`${BASE_URL}/${id}/download-pdf`, {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = extractFilenameFromHeader(contentDisposition);

    // If no filename from header, use custom or fallback
    if (!filename) {
      filename = customFilename || `Quotation-${id}.pdf`;
    }

    return {
      blob: response.data,
      filename: filename,
    };
  },

  /**
   * Download supplier quotation as PDF with filename from header (direct download)
   *
   * @param id - The supplier quotation ID
   * @param customFilename - Optional custom filename override (will use header if not provided)
   */
  downloadPDFDirect: async (id: number, customFilename?: string): Promise<void> => {
    const { blob, filename } = await supplierQuotationService.downloadPDF(id, customFilename);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Preview supplier quotation as PDF (opens in new tab)
   *
   * @param id - The supplier quotation ID
   * @param openInNewTab - Whether to open in new tab (default: true)
   */
  previewPDF: async (id: number, openInNewTab: boolean = true): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${BASE_URL}/${id}/preview-pdf`;

    if (openInNewTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  },

  /**
   * Get supplier quotation as Base64 encoded PDF (for email attachments)
   * The filename comes from the backend
   *
   * @param id - The supplier quotation ID
   * @returns Promise<{ base64: string; filename: string; size: number }>
   */
  getBase64PDF: async (id: number): Promise<{ base64: string; filename: string; size: number }> => {
    const response = await api.get<{
      success: boolean;
      data: { base64: string; filename: string; size: number };
      message: string;
    }>(`${BASE_URL}/${id}/base64-pdf`);

    return response.data;
  },

  /**
   * Get supplier quotation as Base64 for email attachment
   *
   * @param id - The supplier quotation ID
   * @returns Promise<{ content: string; filename: string; type: string }>
   */
  getPDFForEmail: async (id: number): Promise<{ content: string; filename: string; type: string }> => {
    const data = await supplierQuotationService.getBase64PDF(id);
    return {
      content: data.base64,
      filename: data.filename,
      type: 'application/pdf',
    };
  },

  /**
   * Download multiple supplier quotations as a zip file
   *
   * @param ids - Array of supplier quotation IDs
   * @param customFilename - Optional custom filename
   */
  downloadMultiplePDFs: async (ids: number[], customFilename?: string): Promise<void> => {
    // For multiple downloads, we'll download them one by one
    // Each will use its own filename from the backend
    for (const id of ids) {
      await supplierQuotationService.downloadPDFDirect(id);
    }
  },

  /**
   * Get PDF download URL (for use in link tags, iframes, etc.)
   *
   * @param id - The supplier quotation ID
   * @param mode - 'download' | 'preview' (default: 'download')
   * @returns string - The full URL
   */
  getPDFUrl: (id: number, mode: 'download' | 'preview' = 'download'): string => {
    const baseUrl = getBaseUrl();
    const endpoint = mode === 'download' ? 'download-pdf' : 'preview-pdf';
    return `${baseUrl}${BASE_URL}/${id}/${endpoint}`;
  },

  /**
   * Save PDF to server storage
   *
   * @param id - The supplier quotation ID
   * @param suffix - Optional suffix for the filename
   * @returns Promise<{ path: string; url: string }>
   */
  savePDF: async (id: number, suffix?: string): Promise<{ path: string; url: string }> => {
    const response = await api.post<{
      success: boolean;
      data: { path: string; url: string };
      message: string;
    }>(`${BASE_URL}/${id}/save-pdf`, { suffix });

    return response.data;
  },

  /**
   * Print supplier quotation PDF (opens print dialog)
   *
   * @param id - The supplier quotation ID
   */
  printPDF: async (id: number): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${BASE_URL}/${id}/preview-pdf`;

    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  },

  /**
   * Share PDF via email (opens email client with PDF link)
   *
   * @param id - The supplier quotation ID
   * @param email - Recipient email address
   * @param subject - Email subject
   * @param body - Email body
   */
  sharePDFViaEmail: async (id: number, email: string, subject?: string, body?: string): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${BASE_URL}/${id}/preview-pdf`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject || 'Supplier Quotation')}&body=${encodeURIComponent(
      body || `Please find the supplier quotation at: ${url}`
    )}`;

    window.location.href = mailtoLink;
  },

  /**
   * Download verified supplier quotation as PDF
   *
   * @param id - The supplier quotation ID
   * @param customFilename - Optional custom filename
   */
  downloadVerifiedPDF: async (id: number, customFilename?: string): Promise<void> => {
    const client = api.getClient();
    const response = await client.get(`${BASE_URL}/${id}/download-verified`, {
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = extractFilenameFromHeader(contentDisposition);
    if (!filename) {
      filename = customFilename || `Quotation-${id}-verified.pdf`;
    }

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Download draft supplier quotation as PDF
   *
   * @param id - The supplier quotation ID
   * @param customFilename - Optional custom filename
   */
  downloadDraftPDF: async (id: number, customFilename?: string): Promise<void> => {
    const client = api.getClient();
    const response = await client.get(`${BASE_URL}/${id}/download-draft`, {
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = extractFilenameFromHeader(contentDisposition);
    if (!filename) {
      filename = customFilename || `Quotation-${id}-draft.pdf`;
    }

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // ============================================================
  // TRACKING METHODS
  // ============================================================

  /**
   * ✅ Track supplier quotation download (increments download count without returning file)
   *
   * @param id - The supplier quotation ID
   * @returns Promise<{ download_count: number; last_downloaded_at: string }>
   */
  trackDownload: async (id: number): Promise<{ download_count: number; last_downloaded_at: string }> => {
    const response = await api.post<{
      success: boolean;
      data: { download_count: number; last_downloaded_at: string };
      message: string;
    }>(`${BASE_URL}/${id}/track-download`);

    return response.data;
  },

  /**
   * ✅ Track download and then download the PDF
   * Combines tracking and downloading in one call
   *
   * @param id - The supplier quotation ID
   * @param customFilename - Optional custom filename
   */
  trackAndDownloadPDF: async (id: number, customFilename?: string): Promise<void> => {
    // Track the download first
    await supplierQuotationService.trackDownload(id);
    // Then download the PDF
    await supplierQuotationService.downloadPDFDirect(id, customFilename);
  },

  /**
   * Get download statistics for a specific supplier quotation
   *
   * @param id - The supplier quotation ID
   * @returns Promise<{ download_count: number; last_downloaded_at: string; view_count: number; last_viewed_at: string; shared_count: number; last_shared_at: string }>
   */
  getDownloadStats: async (id: number): Promise<{
    download_count: number;
    last_downloaded_at: string;
    view_count: number;
    last_viewed_at: string;
    shared_count: number;
    last_shared_at: string;
  }> => {
    const response = await api.get<{
      success: boolean;
      data: {
        download_count: number;
        last_downloaded_at: string;
        view_count: number;
        last_viewed_at: string;
        shared_count: number;
        last_shared_at: string;
      };
      message: string;
    }>(`${BASE_URL}/${id}/download-stats`);

    return response.data;
  },

  /**
   * ✅ Track supplier quotation view (without downloading)
   *
   * @param id - The supplier quotation ID
   * @returns Promise<{ view_count: number; last_viewed_at: string }>
   */
  trackView: async (id: number): Promise<{ view_count: number; last_viewed_at: string }> => {
    const response = await api.post<{
      success: boolean;
      data: { view_count: number; last_viewed_at: string };
      message: string;
    }>(`${BASE_URL}/${id}/track-view`);

    return response.data;
  },

  /**
   * ✅ Track supplier quotation share
   *
   * @param id - The supplier quotation ID
   * @param shareData - Share data (method, recipient, etc.)
   * @returns Promise<{ shared_count: number; last_shared_at: string }>
   */
  trackShare: async (
    id: number,
    shareData?: { share_method?: string; recipient?: string }
  ): Promise<{ shared_count: number; last_shared_at: string }> => {
    const response = await api.post<{
      success: boolean;
      data: { shared_count: number; last_shared_at: string };
      message: string;
    }>(`${BASE_URL}/${id}/track-share`, shareData);

    return response.data;
  },

  /**
   * ✅ Bulk track multiple supplier quotation downloads
   *
   * @param ids - Array of supplier quotation IDs
   * @returns Promise<Array<{ id: number; qtn_number: string; old_count: number; new_count: number }>>
   */
  bulkTrackDownloads: async (ids: number[]): Promise<
    Array<{ id: number; qtn_number: string; old_count: number; new_count: number }>
  > => {
    const response = await api.post<{
      success: boolean;
      data: Array<{ id: number; qtn_number: string; old_count: number; new_count: number }>;
      message: string;
    }>(`${BASE_URL}/bulk-track-downloads`, { ids });

    return response.data;
  },
};

export default supplierQuotationService;
