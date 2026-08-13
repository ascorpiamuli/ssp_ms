// frontend/src/services/quotation.service.ts

import { api } from './api';
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

const BASE_URL = '/quotations';

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
 * extractFilenameFromHeader('attachment; filename="RFQ-2026-00002.pdf"')
 * // Returns: "RFQ-2026-00002.pdf"
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

export const quotationService = {
  /**
   * Get all quotations with filters
   */
  getAll: async (filters?: QuotationFilters): Promise<PaginatedResponse<QuotationRequest>> => {
    return api.get<PaginatedResponse<QuotationRequest>>(BASE_URL, { params: filters });
  },

  /**
   * Get quotation by ID
   */
  getById: async (id: number): Promise<QuotationRequest> => {
    return api.get<QuotationRequest>(`${BASE_URL}/${id}`);
  },

  /**
   * Create a new quotation request
   */
  create: async (data: CreateQuotationData): Promise<QuotationRequest> => {
    return api.post<QuotationRequest>(BASE_URL, data);
  },

  /**
   * Update a quotation request
   */
  update: async (id: number, data: UpdateQuotationData): Promise<QuotationRequest> => {
    return api.put<QuotationRequest>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Send quotation to suppliers
   */
  send: async (id: number, data: SendQuotationData): Promise<QuotationRequest> => {
    return api.post<QuotationRequest>(`${BASE_URL}/${id}/send`, data);
  },

  /**
   * Close a quotation request
   */
  close: async (id: number): Promise<QuotationRequest> => {
    return api.post<QuotationRequest>(`${BASE_URL}/${id}/close`);
  },

  /**
   * Cancel a quotation request
   */
  cancel: async (id: number, data: CancelQuotationData): Promise<QuotationRequest> => {
    return api.post<QuotationRequest>(`${BASE_URL}/${id}/cancel`, data);
  },

  /**
   * Send reminder to suppliers
   */
  sendReminder: async (id: number): Promise<void> => {
    return api.post<void>(`${BASE_URL}/${id}/reminder`);
  },

  /**
   * Get quotation statistics
   */
  getStatistics: async (id: number): Promise<QuotationStatistics> => {
    return api.get<QuotationStatistics>(`${BASE_URL}/${id}/statistics`);
  },

  /**
   * Select supplier for requisition
   */
  selectSupplier: async (data: SelectSupplierData): Promise<{ requisition_id: number; supplier_id: number; quotation_id: number }> => {
    return api.post<{ requisition_id: number; supplier_id: number; quotation_id: number }>(
      `${BASE_URL}/select-supplier`,
      data
    );
  },

  /**
   * Get quotations closing soon
   */
  getClosingSoon: async (): Promise<QuotationRequest[]> => {
    return api.get<QuotationRequest[]>(`${BASE_URL}`, { params: { status: 'closing_soon' } });
  },

  /**
   * Get active quotations
   */
  getActive: async (): Promise<QuotationRequest[]> => {
    return api.get<QuotationRequest[]>(`${BASE_URL}`, { params: { status: 'active' } });
  },

  // ============================================================
  // PDF GENERATION METHODS
  // ============================================================

  /**
   * Download QTN as PDF (file download)
   * Extracts filename from Content-Disposition header
   *
   * @param id - The QTN ID
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
      filename = customFilename || `QTN-${id}.pdf`;
    }

    return {
      blob: response.data,
      filename: filename,
    };
  },

  /**
   * Download QTN as PDF with filename from header (direct download)
   *
   * @param id - The QTN ID
   * @param customFilename - Optional custom filename override (will use header if not provided)
   */
  downloadPDFDirect: async (id: number, customFilename?: string): Promise<void> => {
    const { blob, filename } = await quotationService.downloadPDF(id, customFilename);

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
   * Preview QTN as PDF (opens in new tab)
   *
   * @param id - The QTN ID
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
   * Get QTN as Base64 encoded PDF (for email attachments)
   * The filename comes from the backend
   *
   * @param id - The QTN ID
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
   * Get QTN as Base64 for email attachment
   *
   * @param id - The QTN ID
   * @returns Promise<{ content: string; filename: string; type: string }>
   */
  getPDFForEmail: async (id: number): Promise<{ content: string; filename: string; type: string }> => {
    const data = await quotationService.getBase64PDF(id);
    return {
      content: data.base64,
      filename: data.filename,
      type: 'application/pdf',
    };
  },

  /**
   * Download multiple QTNs as a zip file
   *
   * @param ids - Array of QTN IDs
   * @param customFilename - Optional custom filename
   */
  downloadMultiplePDFs: async (ids: number[], customFilename?: string): Promise<void> => {
    // For multiple downloads, we'll download them one by one
    // Each will use its own filename from the backend
    for (const id of ids) {
      await quotationService.downloadPDFDirect(id);
    }
  },

  /**
   * Get PDF download URL (for use in link tags, iframes, etc.)
   *
   * @param id - The QTN ID
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
   * @param id - The QTN ID
   * @returns Promise<{ path: string }>
   */
  savePDF: async (id: number): Promise<{ path: string }> => {
    return api.post<{ path: string }>(`${BASE_URL}/${id}/save-pdf`);
  },

  /**
   * Print QTN PDF (opens print dialog)
   *
   * @param id - The QTN ID
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
   * @param id - The QTN ID
   * @param email - Recipient email address
   * @param subject - Email subject
   * @param body - Email body
   */
  sharePDFViaEmail: async (id: number, email: string, subject?: string, body?: string): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${BASE_URL}/${id}/preview-pdf`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject || 'QTN Document')}&body=${encodeURIComponent(
      body || `Please find the QTN document at: ${url}`
    )}`;

    window.location.href = mailtoLink;
  },
};

export default quotationService;
