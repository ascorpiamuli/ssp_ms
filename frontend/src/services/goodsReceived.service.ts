// frontend/src/services/goodsReceived.service.ts

import { api } from './api';
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

const BASE_URL = '/goods-received';
const SAN_URL = '/service-acknowledgments';

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
 * extractFilenameFromHeader('attachment; filename="GRN-2026-00002.pdf"')
 * // Returns: "GRN-2026-00002.pdf"
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

export const goodsReceivedService = {
  // ============================================
  // GRN Services
  // ============================================

  /**
   * Get all GRNs with filters
   */
  getGrns: async (filters?: GoodsReceivedFilters): Promise<PaginatedResponse<GoodsReceivedNote>> => {
    // ✅ Ensure type is set to 'grn' for GRN queries
    const params = { ...filters, type: 'grn' };
    return api.get<PaginatedResponse<GoodsReceivedNote>>(BASE_URL, { params });
  },

  /**
   * Get GRN by ID
   */
  getGrnById: async (id: number): Promise<GoodsReceivedNote> => {
    return api.get<GoodsReceivedNote>(`${BASE_URL}/${id}`);
  },

  /**
   * Get GRN summary
   */
  getGrnSummary: async (id: number): Promise<GRNSummary> => {
    return api.get<GRNSummary>(`${BASE_URL}/${id}/summary`);
  },

  /**
   * Create a new GRN
   */
  createGrn: async (data: CreateGoodsReceivedData): Promise<GoodsReceivedNote> => {
    return api.post<GoodsReceivedNote>(BASE_URL, { ...data, type: 'grn' });
  },

  /**
   * Submit GRN for approval
   */
  submitGrn: async (id: number): Promise<GoodsReceivedNote> => {
    return api.post<GoodsReceivedNote>(`${BASE_URL}/${id}/submit`);
  },

  /**
   * Approve a GRN
   */
  approveGrn: async (id: number, comment?: string): Promise<GoodsReceivedNote> => {
    return api.post<GoodsReceivedNote>(`${BASE_URL}/${id}/approve`, { comment });
  },

  /**
   * Reject a GRN
   */
  rejectGrn: async (id: number, reason: string): Promise<GoodsReceivedNote> => {
    return api.post<GoodsReceivedNote>(`${BASE_URL}/${id}/reject`, { reason });
  },

  /**
   * Inspect goods
   */
  inspectGoods: async (id: number, data: InspectGoodsData): Promise<GoodsReceivedNote> => {
    return api.post<GoodsReceivedNote>(`${BASE_URL}/${id}/inspect`, data);
  },

  /**
   * Get GRNs by purchase order
   */
  getGrnsByPurchaseOrder: async (purchaseOrderId: number): Promise<GoodsReceivedNote[]> => {
    return api.get<GoodsReceivedNote[]>(BASE_URL, { params: { purchase_order_id: purchaseOrderId, type: 'grn' } });
  },

  /**
   * Get pending approval GRNs
   */
  getPendingGrns: async (): Promise<GoodsReceivedNote[]> => {
    return api.get<GoodsReceivedNote[]>(BASE_URL, { params: { filter: 'pending', type: 'grn' } });
  },

  // ============================================================
  // GRN PDF GENERATION METHODS
  // ============================================================

  /**
   * Download GRN as PDF (file download)
   * Extracts filename from Content-Disposition header
   *
   * @param id - The GRN ID
   * @param customFilename - Optional custom filename override
   * @returns Promise<{ blob: Blob; filename: string }>
   */
  downloadGrnPDF: async (id: number, customFilename?: string): Promise<{ blob: Blob; filename: string }> => {
    const client = api.getClient();
    const response = await client.get(`${BASE_URL}/${id}/pdf`, {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = extractFilenameFromHeader(contentDisposition);

    // If no filename from header, use custom or fallback
    if (!filename) {
      filename = customFilename || `GRN-${id}.pdf`;
    }

    return {
      blob: response.data,
      filename: filename,
    };
  },

  /**
   * Download GRN as PDF with filename from header (direct download)
   *
   * @param id - The GRN ID
   * @param customFilename - Optional custom filename override (will use header if not provided)
   */
  downloadGrnPDFDirect: async (id: number, customFilename?: string): Promise<void> => {
    const { blob, filename } = await goodsReceivedService.downloadGrnPDF(id, customFilename);

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
   * Preview GRN as PDF (opens in new tab)
   *
   * @param id - The GRN ID
   * @param openInNewTab - Whether to open in new tab (default: true)
   */
  previewGrnPDF: async (id: number, openInNewTab: boolean = true): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${BASE_URL}/${id}/preview-pdf`;

    if (openInNewTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  },

  /**
   * Get GRN as Base64 encoded PDF (for email attachments)
   *
   * @param id - The GRN ID
   * @returns Promise<{ base64: string; filename: string; size: number }>
   */
  getGrnBase64PDF: async (id: number): Promise<{ base64: string; filename: string; size: number }> => {
    const response = await api.get<{
      success: boolean;
      data: { base64: string; filename: string; size: number };
      message: string;
    }>(`${BASE_URL}/${id}/base64-pdf`);

    return response.data;
  },

  /**
   * Get GRN as Base64 for email attachment
   *
   * @param id - The GRN ID
   * @returns Promise<{ content: string; filename: string; type: string }>
   */
  getGrnPDFForEmail: async (id: number): Promise<{ content: string; filename: string; type: string }> => {
    const data = await goodsReceivedService.getGrnBase64PDF(id);
    return {
      content: data.base64,
      filename: data.filename,
      type: 'application/pdf',
    };
  },

  /**
   * Download verified GRN PDF
   *
   * @param id - The GRN ID
   * @param customFilename - Optional custom filename
   */
  downloadVerifiedGrnPDF: async (id: number, customFilename?: string): Promise<void> => {
    const client = api.getClient();
    const response = await client.get(`${BASE_URL}/${id}/download-verified`, {
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = extractFilenameFromHeader(contentDisposition);
    if (!filename) {
      filename = customFilename || `VERIFIED_GRN-${id}.pdf`;
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
   * Download draft GRN PDF
   *
   * @param id - The GRN ID
   * @param customFilename - Optional custom filename
   */
  downloadDraftGrnPDF: async (id: number, customFilename?: string): Promise<void> => {
    const client = api.getClient();
    const response = await client.get(`${BASE_URL}/${id}/download-draft`, {
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = extractFilenameFromHeader(contentDisposition);
    if (!filename) {
      filename = customFilename || `DRAFT_GRN-${id}.pdf`;
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
   * Save GRN PDF to server storage
   *
   * @param id - The GRN ID
   * @param suffix - Optional suffix for filename (e.g., 'final', 'draft')
   * @returns Promise<{ path: string; url: string }>
   */
  saveGrnPDF: async (id: number, suffix?: string): Promise<{ path: string; url: string }> => {
    const response = await api.post<{
      success: boolean;
      data: { path: string; url: string };
      message: string;
    }>(`${BASE_URL}/${id}/save-pdf`, { suffix });

    return response.data;
  },

  /**
   * Get GRN PDF download URL
   *
   * @param id - The GRN ID
   * @param mode - 'download' | 'preview' (default: 'download')
   * @returns string - The full URL
   */
  getGrnPDFUrl: (id: number, mode: 'download' | 'preview' = 'download'): string => {
    const baseUrl = getBaseUrl();
    const endpoint = mode === 'download' ? 'pdf' : 'preview-pdf';
    return `${baseUrl}${BASE_URL}/${id}/${endpoint}`;
  },

  /**
   * Print GRN PDF (opens print dialog)
   *
   * @param id - The GRN ID
   */
  printGrnPDF: async (id: number): Promise<void> => {
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
   * Share GRN PDF via email
   *
   * @param id - The GRN ID
   * @param email - Recipient email address
   * @param subject - Email subject
   * @param body - Email body
   */
  shareGrnPDFViaEmail: async (id: number, email: string, subject?: string, body?: string): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${BASE_URL}/${id}/preview-pdf`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject || 'Goods Received Note Document')}&body=${encodeURIComponent(
      body || `Please find the GRN document at: ${url}`
    )}`;

    window.location.href = mailtoLink;
  },

  /**
   * Track GRN download (increments download count without returning file)
   *
   * @param id - The GRN ID
   * @returns Promise<{ download_count: number; last_downloaded_at: string }>
   */
  trackGrnDownload: async (id: number): Promise<{ download_count: number; last_downloaded_at: string }> => {
    const response = await api.post<{
      success: boolean;
      data: { download_count: number; last_downloaded_at: string };
      message: string;
    }>(`${BASE_URL}/${id}/track-download`);

    return response.data;
  },

  /**
   * Track GRN download and then download the PDF
   * Combines tracking and downloading in one call
   *
   * @param id - The GRN ID
   * @param customFilename - Optional custom filename
   */
  trackAndDownloadGrnPDF: async (id: number, customFilename?: string): Promise<void> => {
    // Track the download first
    await goodsReceivedService.trackGrnDownload(id);
    // Then download the PDF
    await goodsReceivedService.downloadGrnPDFDirect(id, customFilename);
  },

  // ============================================
  // SAN Services - ✅ FIXED: Always pass type: 'san'
  // ============================================

  /**
   * Get all SANs with filters
   * ✅ FIXED: Always include type: 'san' in params
   */
  getSans: async (filters?: GoodsReceivedFilters): Promise<PaginatedResponse<ServiceAcknowledgmentNote>> => {
    // ✅ CRITICAL FIX: Always pass type: 'san' to get SAN data
    const params = { ...filters, type: 'san' };
    return api.get<PaginatedResponse<ServiceAcknowledgmentNote>>(SAN_URL, { params });
  },

  /**
   * Get SAN by ID
   */
  getSanById: async (id: number): Promise<ServiceAcknowledgmentNote> => {
    return api.get<ServiceAcknowledgmentNote>(`${SAN_URL}/${id}`, { params: { type: 'san' } });
  },

  /**
   * Get SAN summary
   */
  getSanSummary: async (id: number): Promise<any> => {
    return api.get<any>(`${SAN_URL}/${id}/summary`, { params: { type: 'san' } });
  },

  /**
   * Create a new SAN
   */
  createSan: async (data: CreateServiceAcknowledgmentData): Promise<ServiceAcknowledgmentNote> => {
    return api.post<ServiceAcknowledgmentNote>(SAN_URL, { ...data, type: 'san' });
  },

  /**
   * Submit SAN for approval
   */
  submitSan: async (id: number): Promise<ServiceAcknowledgmentNote> => {
    return api.post<ServiceAcknowledgmentNote>(`${SAN_URL}/${id}/submit`);
  },

  /**
   * Approve a SAN
   */
  approveSan: async (id: number, comment?: string): Promise<ServiceAcknowledgmentNote> => {
    return api.post<ServiceAcknowledgmentNote>(`${SAN_URL}/${id}/approve`, { comment });
  },

  /**
   * Reject a SAN
   */
  rejectSan: async (id: number, reason: string): Promise<ServiceAcknowledgmentNote> => {
    return api.post<ServiceAcknowledgmentNote>(`${SAN_URL}/${id}/reject`, { reason });
  },

  /**
   * Rate service quality
   */
  rateService: async (id: number, data: RateServiceData): Promise<ServiceAcknowledgmentNote> => {
    return api.post<ServiceAcknowledgmentNote>(`${SAN_URL}/${id}/rate`, data);
  },

  /**
   * Get SANs by purchase order
   * ✅ FIXED: Always pass type: 'san'
   */
  getSansByPurchaseOrder: async (purchaseOrderId: number): Promise<ServiceAcknowledgmentNote[]> => {
    return api.get<ServiceAcknowledgmentNote[]>(SAN_URL, { params: { purchase_order_id: purchaseOrderId, type: 'san' } });
  },

  /**
   * Get pending approval SANs
   * ✅ FIXED: Always pass type: 'san' and filter: 'pending'
   */
  getPendingSans: async (): Promise<ServiceAcknowledgmentNote[]> => {
    return api.get<ServiceAcknowledgmentNote[]>(SAN_URL, { params: { filter: 'pending', type: 'san' } });
  },

  // ============================================================
  // SAN PDF GENERATION METHODS
  // ============================================================

  /**
   * Download SAN as PDF (file download)
   * Extracts filename from Content-Disposition header
   *
   * @param id - The SAN ID
   * @param customFilename - Optional custom filename override
   * @returns Promise<{ blob: Blob; filename: string }>
   */
  downloadSanPDF: async (id: number, customFilename?: string): Promise<{ blob: Blob; filename: string }> => {
    const client = api.getClient();
    const response = await client.get(`${SAN_URL}/${id}/pdf`, {
      responseType: 'blob',
      params: { type: 'san' },
    });

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = extractFilenameFromHeader(contentDisposition);

    // If no filename from header, use custom or fallback
    if (!filename) {
      filename = customFilename || `SAN-${id}.pdf`;
    }

    return {
      blob: response.data,
      filename: filename,
    };
  },

  /**
   * Download SAN as PDF with filename from header (direct download)
   *
   * @param id - The SAN ID
   * @param customFilename - Optional custom filename override (will use header if not provided)
   */
  downloadSanPDFDirect: async (id: number, customFilename?: string): Promise<void> => {
    const { blob, filename } = await goodsReceivedService.downloadSanPDF(id, customFilename);

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
   * Preview SAN as PDF (opens in new tab)
   *
   * @param id - The SAN ID
   * @param openInNewTab - Whether to open in new tab (default: true)
   */
  previewSanPDF: async (id: number, openInNewTab: boolean = true): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${SAN_URL}/${id}/preview-pdf?type=san`;

    if (openInNewTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  },

  /**
   * Get SAN as Base64 encoded PDF (for email attachments)
   *
   * @param id - The SAN ID
   * @returns Promise<{ base64: string; filename: string; size: number }>
   */
  getSanBase64PDF: async (id: number): Promise<{ base64: string; filename: string; size: number }> => {
    const response = await api.get<{
      success: boolean;
      data: { base64: string; filename: string; size: number };
      message: string;
    }>(`${SAN_URL}/${id}/base64-pdf`, { params: { type: 'san' } });

    return response.data;
  },

  /**
   * Get SAN as Base64 for email attachment
   *
   * @param id - The SAN ID
   * @returns Promise<{ content: string; filename: string; type: string }>
   */
  getSanPDFForEmail: async (id: number): Promise<{ content: string; filename: string; type: string }> => {
    const data = await goodsReceivedService.getSanBase64PDF(id);
    return {
      content: data.base64,
      filename: data.filename,
      type: 'application/pdf',
    };
  },

  /**
   * Download verified SAN PDF
   *
   * @param id - The SAN ID
   * @param customFilename - Optional custom filename
   */
  downloadVerifiedSanPDF: async (id: number, customFilename?: string): Promise<void> => {
    const client = api.getClient();
    const response = await client.get(`${SAN_URL}/${id}/download-verified`, {
      responseType: 'blob',
      params: { type: 'san' },
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = extractFilenameFromHeader(contentDisposition);
    if (!filename) {
      filename = customFilename || `VERIFIED_SAN-${id}.pdf`;
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
   * Download draft SAN PDF
   *
   * @param id - The SAN ID
   * @param customFilename - Optional custom filename
   */
  downloadDraftSanPDF: async (id: number, customFilename?: string): Promise<void> => {
    const client = api.getClient();
    const response = await client.get(`${SAN_URL}/${id}/download-draft`, {
      responseType: 'blob',
      params: { type: 'san' },
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = extractFilenameFromHeader(contentDisposition);
    if (!filename) {
      filename = customFilename || `DRAFT_SAN-${id}.pdf`;
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
   * Save SAN PDF to server storage
   *
   * @param id - The SAN ID
   * @param suffix - Optional suffix for filename (e.g., 'final', 'draft')
   * @returns Promise<{ path: string; url: string }>
   */
  saveSanPDF: async (id: number, suffix?: string): Promise<{ path: string; url: string }> => {
    const response = await api.post<{
      success: boolean;
      data: { path: string; url: string };
      message: string;
    }>(`${SAN_URL}/${id}/save-pdf`, { suffix });

    return response.data;
  },

  /**
   * Get SAN PDF download URL
   *
   * @param id - The SAN ID
   * @param mode - 'download' | 'preview' (default: 'download')
   * @returns string - The full URL
   */
  getSanPDFUrl: (id: number, mode: 'download' | 'preview' = 'download'): string => {
    const baseUrl = getBaseUrl();
    const endpoint = mode === 'download' ? 'pdf' : 'preview-pdf';
    return `${baseUrl}${SAN_URL}/${id}/${endpoint}?type=san`;
  },

  /**
   * Print SAN PDF (opens print dialog)
   *
   * @param id - The SAN ID
   */
  printSanPDF: async (id: number): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${SAN_URL}/${id}/preview-pdf?type=san`;

    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  },

  /**
   * Share SAN PDF via email
   *
   * @param id - The SAN ID
   * @param email - Recipient email address
   * @param subject - Email subject
   * @param body - Email body
   */
  shareSanPDFViaEmail: async (id: number, email: string, subject?: string, body?: string): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${SAN_URL}/${id}/preview-pdf?type=san`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject || 'Service Acknowledgment Note Document')}&body=${encodeURIComponent(
      body || `Please find the SAN document at: ${url}`
    )}`;

    window.location.href = mailtoLink;
  },

  /**
   * Track SAN download (increments download count without returning file)
   *
   * @param id - The SAN ID
   * @returns Promise<{ download_count: number; last_downloaded_at: string }>
   */
  trackSanDownload: async (id: number): Promise<{ download_count: number; last_downloaded_at: string }> => {
    const response = await api.post<{
      success: boolean;
      data: { download_count: number; last_downloaded_at: string };
      message: string;
    }>(`${SAN_URL}/${id}/track-download`);

    return response.data;
  },

  /**
   * Track SAN download and then download the PDF
   * Combines tracking and downloading in one call
   *
   * @param id - The SAN ID
   * @param customFilename - Optional custom filename
   */
  trackAndDownloadSanPDF: async (id: number, customFilename?: string): Promise<void> => {
    // Track the download first
    await goodsReceivedService.trackSanDownload(id);
    // Then download the PDF
    await goodsReceivedService.downloadSanPDFDirect(id, customFilename);
  },

  // ============================================================
  // LEGACY METHODS (for backward compatibility)
  // ============================================================

  /**
   * Legacy method - kept for backward compatibility
   * Use downloadGrnPDFDirect instead
   */
  getGrnPdf: async (id: number): Promise<{ pdf: string }> => {
    return api.get<{ pdf: string }>(`${BASE_URL}/${id}/pdf`);
  },

  /**
   * Legacy method - kept for backward compatibility
   * Use downloadSanPDFDirect instead
   */
  getSanPdf: async (id: number): Promise<{ pdf: string }> => {
    return api.get<{ pdf: string }>(`${SAN_URL}/${id}/pdf`, { params: { type: 'san' } });
  },
};

export default goodsReceivedService;
