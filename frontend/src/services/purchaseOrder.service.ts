// frontend/src/services/purchaseOrder.service.ts

import { api } from './api';
import type {
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderSummary,
  PurchaseOrderWorkflow,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
} from '@/types/purchaseOrder.types';
import type { PaginatedResponse } from '@/types/common.types';

const BASE_URL = '/purchase-orders';

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
 * extractFilenameFromHeader('attachment; filename="LPO-2026-00002.pdf"')
 * // Returns: "LPO-2026-00002.pdf"
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

export const purchaseOrderService = {
  /**
   * Get all purchase orders with filters
   */
  getAll: async (filters?: PurchaseOrderFilters): Promise<PaginatedResponse<PurchaseOrder>> => {
    return api.get<PaginatedResponse<PurchaseOrder>>(BASE_URL, { params: filters });
  },

  /**
   * Get purchase order by ID
   */
  getById: async (id: number): Promise<PurchaseOrder> => {
    return api.get<PurchaseOrder>(`${BASE_URL}/${id}`);
  },

  /**
   * Get purchase order summary
   */
  getSummary: async (id: number): Promise<PurchaseOrderSummary> => {
    return api.get<PurchaseOrderSummary>(`${BASE_URL}/${id}/summary`);
  },

  /**
   * Create a new purchase order
   */
  create: async (data: CreatePurchaseOrderData): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(BASE_URL, data);
  },

  /**
   * Update a purchase order
   */
  update: async (id: number, data: UpdatePurchaseOrderData): Promise<PurchaseOrder> => {
    return api.put<PurchaseOrder>(`${BASE_URL}/${id}`, data);
  },

  // ============================================================
  // ✅ WORKFLOW METHODS (NEW)
  // ============================================================

  /**
   * ✅ Check purchase order (HOD)
   *
   * @param id - Purchase order ID
   * @param comment - Optional comment
   * @returns Updated purchase order
   */
  check: async (id: number, comment?: string): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/check`, { comment });
  },

  /**
   * ✅ Endorse purchase order (Accountant)
   *
   * @param id - Purchase order ID
   * @param comment - Optional comment
   * @returns Updated purchase order
   */
  endorse: async (id: number, comment?: string): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/endorse`, { comment });
  },

  /**
   * ✅ Approve purchase order (Director/Finance Admin)
   *
   * @param id - Purchase order ID
   * @param comment - Optional comment
   * @returns Updated purchase order
   */
  approve: async (id: number, comment?: string): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/approve`, { comment });
  },

  /**
   * ✅ Get workflow status for a purchase order
   *
   * @param id - Purchase order ID
   * @returns Workflow status with user permissions
   */
  getWorkflow: async (id: number): Promise<PurchaseOrderWorkflow> => {
    return api.get<PurchaseOrderWorkflow>(`${BASE_URL}/${id}/workflow`);
  },

  // ============================================================
  // STATUS MANAGEMENT METHODS
  // ============================================================

  /**
   * Issue a purchase order (make it ready for sending)
   */
  issue: async (id: number): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/issue`);
  },

  /**
   * Send purchase order to supplier
   */
  sendToSupplier: async (id: number): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/send`);
  },

  /**
   * Acknowledge purchase order by supplier
   */
  acknowledge: async (id: number, supplierId: number): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/acknowledge`, { supplier_id: supplierId });
  },

  /**
   * Mark purchase order as delivered
   */
  markDelivered: async (id: number): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/deliver`);
  },

  /**
   * Complete a purchase order
   */
  complete: async (id: number): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/complete`);
  },

  /**
   * Cancel a purchase order
   */
  cancel: async (id: number, reason: string): Promise<PurchaseOrder> => {
    return api.post<PurchaseOrder>(`${BASE_URL}/${id}/cancel`, { reason });
  },

  /**
   * Get delivery progress
   */
  getDeliveryProgress: async (id: number): Promise<{ progress: number }> => {
    return api.get<{ progress: number }>(`${BASE_URL}/${id}/delivery-progress`);
  },

  /**
   * Get overdue purchase orders
   */
  getOverdue: async (): Promise<PurchaseOrder[]> => {
    return api.get<PurchaseOrder[]>(`${BASE_URL}/overdue`);
  },

  /**
   * Get purchase orders by requisition
   */
  getByRequisition: async (requisitionId: number): Promise<PurchaseOrder[]> => {
    return api.get<PurchaseOrder[]>(`${BASE_URL}`, { params: { requisition_id: requisitionId } });
  },

  // ============================================================
  // PDF GENERATION METHODS
  // ============================================================

  /**
   * Download PO as PDF (file download)
   * Extracts filename from Content-Disposition header
   *
   * @param id - The PO ID
   * @param customFilename - Optional custom filename override
   * @returns Promise<{ blob: Blob; filename: string }>
   */
  downloadPDF: async (id: number, customFilename?: string): Promise<{ blob: Blob; filename: string }> => {
    const client = api.getClient();
    const response = await client.get(`${BASE_URL}/${id}/pdf`, {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = extractFilenameFromHeader(contentDisposition);

    // If no filename from header, use custom or fallback
    if (!filename) {
      filename = customFilename || `PO-${id}.pdf`;
    }

    return {
      blob: response.data,
      filename: filename,
    };
  },

  /**
   * Download PO as PDF with filename from header (direct download)
   *
   * @param id - The PO ID
   * @param customFilename - Optional custom filename override (will use header if not provided)
   */
  downloadPDFDirect: async (id: number, customFilename?: string): Promise<void> => {
    const { blob, filename } = await purchaseOrderService.downloadPDF(id, customFilename);

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
   * Preview PO as PDF (opens in new tab)
   *
   * @param id - The PO ID
   * @param openInNewTab - Whether to open in new tab (default: true)
   */
  previewPDF: async (id: number, openInNewTab: boolean = true): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${BASE_URL}/${id}/preview`;

    if (openInNewTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  },

  /**
   * Get PO as Base64 encoded PDF (for email attachments)
   * The filename comes from the backend
   *
   * @param id - The PO ID
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
   * Get PO as Base64 for email attachment
   *
   * @param id - The PO ID
   * @returns Promise<{ content: string; filename: string; type: string }>
   */
  getPDFForEmail: async (id: number): Promise<{ content: string; filename: string; type: string }> => {
    const data = await purchaseOrderService.getBase64PDF(id);
    return {
      content: data.base64,
      filename: data.filename,
      type: 'application/pdf',
    };
  },

  /**
   * Download multiple POs as individual files
   *
   * @param ids - Array of PO IDs
   * @param customFilename - Optional custom filename
   */
  downloadMultiplePDFs: async (ids: number[], customFilename?: string): Promise<void> => {
    // For multiple downloads, we'll download them one by one
    // Each will use its own filename from the backend
    for (const id of ids) {
      await purchaseOrderService.downloadPDFDirect(id, customFilename);
    }
  },

  /**
   * Get PDF download URL (for use in link tags, iframes, etc.)
   *
   * @param id - The PO ID
   * @param mode - 'download' | 'preview' (default: 'download')
   * @returns string - The full URL
   */
  getPDFUrl: (id: number, mode: 'download' | 'preview' = 'download'): string => {
    const baseUrl = getBaseUrl();
    const endpoint = mode === 'download' ? 'pdf' : 'preview';
    return `${baseUrl}${BASE_URL}/${id}/${endpoint}`;
  },

  /**
   * Save PDF to server storage
   *
   * @param id - The PO ID
   * @param suffix - Optional suffix for filename (e.g., 'final', 'draft')
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
   * Print PO PDF (opens print dialog)
   *
   * @param id - The PO ID
   */
  printPDF: async (id: number): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${BASE_URL}/${id}/preview`;

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
   * @param id - The PO ID
   * @param email - Recipient email address
   * @param subject - Email subject
   * @param body - Email body
   */
  sharePDFViaEmail: async (id: number, email: string, subject?: string, body?: string): Promise<void> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${BASE_URL}/${id}/preview`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject || 'Purchase Order Document')}&body=${encodeURIComponent(
      body || `Please find the purchase order document at: ${url}`
    )}`;

    window.location.href = mailtoLink;
  },

  // ============================================================
  // TRACKING METHODS
  // ============================================================

  /**
   * ✅ Track PO download (increments download count without returning file)
   *
   * @param id - The PO ID
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
   * @param id - The PO ID
   * @param customFilename - Optional custom filename
   */
  trackAndDownloadPDF: async (id: number, customFilename?: string): Promise<void> => {
    // Track the download first
    await purchaseOrderService.trackDownload(id);
    // Then download the PDF
    await purchaseOrderService.downloadPDFDirect(id, customFilename);
  },

  /**
   * Get download statistics for a specific PO
   *
   * @param id - The PO ID
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
   * ✅ Track PO view (without downloading)
   *
   * @param id - The PO ID
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
   * ✅ Track PO share
   *
   * @param id - The PO ID
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
   * ✅ Bulk track multiple downloads
   *
   * @param ids - Array of PO IDs
   * @returns Promise<Array<{ id: number; po_number: string; old_count: number; new_count: number }>>
   */
  bulkTrackDownloads: async (ids: number[]): Promise<
    Array<{ id: number; po_number: string; old_count: number; new_count: number }>
  > => {
    const response = await api.post<{
      success: boolean;
      data: Array<{ id: number; po_number: string; old_count: number; new_count: number }>;
      message: string;
    }>(`${BASE_URL}/bulk-track-downloads`, { ids });

    return response.data;
  },

  // ============================================================
  // LEGACY METHODS (for backward compatibility)
  // ============================================================

  /**
   * Legacy method - kept for backward compatibility
   * Use downloadPDFDirect instead
   */
  getPdf: async (id: number): Promise<void> => {
    return purchaseOrderService.downloadPDFDirect(id);
  },
};

export default purchaseOrderService;
