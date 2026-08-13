// frontend/src/types/signature.types.ts

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Request to upload a signature specimen
 */
export interface UploadSignatureRequest {
  signature: File;
  notes?: string;
}

/**
 * Request to verify a signature specimen
 */
export interface VerifySignatureRequest {
  notes?: string;
}

/**
 * Request to verify signature via QR Code
 */
export interface VerifySignatureQRRequest {
  qr_data: string;
}

/**
 * Request to reject a signature specimen
 */
export interface RejectSignatureRequest {
  reason?: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Signature Specimen - Full model response
 */
export interface SignatureSpecimen {
  id: number;
  user_id: number;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    role_label: string;
  } | null;
  signature_image_url: string | null;
  signature_hash: string | null;
  is_verified: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  status_label: string;
  status_color: 'warning' | 'success' | 'danger' | 'secondary';
  verified_at: string | null;
  verification_notes: string | null;
  verification_method: string | null;
  qr_code: {
    data: string | null;
    image: string | null;
    hash: string | null;
  };
  verified_by: {
    id: number;
    full_name: string;
    email: string;
  } | null;
  created_at: string;
  updated_at: string;
}

/**
 * Signature Verification - Full model response
 */
export interface SignatureVerification {
  id: number;
  signature_specimen_id: number;
  user_id: number;
  user: {
    id: number;
    full_name: string;
    email: string;
  } | null;
  verified_by: {
    id: number;
    full_name: string;
    email: string;
  } | null;
  document_type: string | null;
  document_reference: string | null;
  verification_status: 'pending' | 'verified' | 'failed' | 'expired';
  verification_status_label: string;
  verification_status_color: 'warning' | 'success' | 'danger' | 'secondary';
  verification_method: string | null;
  verification_data: Record<string, any> | null;
  failure_reason: string | null;
  qr_code: {
    data: string | null;
    image: string | null;
  };
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Signature Status - Lightweight status response
 */
export interface SignatureStatus {
  status: 'none' | 'pending' | 'verified' | 'rejected' | 'unknown';
  label: string;
  color: 'secondary' | 'warning' | 'success' | 'danger';
  message?: string | null;
  specimen?: SignatureSpecimen | null;
}

/**
 * QR Code data structure
 */
export interface QRCodeData {
  data: string | null;
  image: string | null;
  hash: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
}

/**
 * QR Code verification result
 */
export interface QRCodeVerificationResult {
  verified: SignatureSpecimen;
  already_verified: boolean;
  qr_data: Record<string, any>;
}

/**
 * Signature statistics
 */
export interface SignatureStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  percentage_verified: number;
}

// ============================================
// API RESPONSE WRAPPERS
// ============================================

/**
 * Upload signature response
 */
export interface UploadSignatureResponse {
  success: boolean;
  message: string;
  data: SignatureSpecimen;
}

/**
 * Verify signature response
 */
export interface VerifySignatureResponse {
  success: boolean;
  message: string;
  data: {
    specimen: SignatureSpecimen;
    qr_code: QRCodeData | null;
  };
}

/**
 * Verify signature via QR response
 */
export interface VerifySignatureQRResponse {
  success: boolean;
  message: string;
  data: QRCodeVerificationResult;
}

/**
 * Reject signature response
 */
export interface RejectSignatureResponse {
  success: boolean;
  message: string;
  data: SignatureSpecimen;
}

/**
 * Get signature status response
 */
export interface SignatureStatusResponse {
  success: boolean;
  data: SignatureStatus;
}

/**
 * Get user signature response
 */
export interface UserSignatureResponse {
  success: boolean;
  data: SignatureSpecimen | null;
  message?: string;
}

/**
 * Get QR Code response
 */
export interface QRCodeResponse {
  success: boolean;
  data: QRCodeData | null;
  message?: string;
}

/**
 * Regenerate QR Code response
 */
export interface RegenerateQRResponse {
  success: boolean;
  message: string;
  data: QRCodeData;
}

/**
 * Delete signature response
 */
export interface DeleteSignatureResponse {
  success: boolean;
  message: string;
}

/**
 * Pending signatures response
 */
export interface PendingSignaturesResponse {
  success: boolean;
  data: SignatureSpecimen[];
  meta: {
    total: number;
  };
}

/**
 * Verified signatures response
 */
export interface VerifiedSignaturesResponse {
  success: boolean;
  data: SignatureSpecimen[];
  meta: {
    total: number;
  };
}

/**
 * Signature statistics response
 */
export interface SignatureStatsResponse {
  success: boolean;
  data: SignatureStats;
}

// ============================================
// API ERROR RESPONSE
// ============================================

export interface SignatureApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================
// HOOK RETURN TYPES
// ============================================

export interface UseSignatureReturn {
  signature: SignatureSpecimen | null;
  status: SignatureStatus | null;
  isLoading: boolean;
  isUploading: boolean;
  isVerifying: boolean;
  isDeleting: boolean;
  uploadProgress: number;
  uploadSignature: (file: File, notes?: string) => Promise<SignatureSpecimen>;
  verifySignature: (specimenId: number, notes?: string) => Promise<{
    specimen: SignatureSpecimen;
    qr_code: QRCodeData | null;
  }>;
  verifySignatureByQR: (qrData: string) => Promise<QRCodeVerificationResult>;
  rejectSignature: (specimenId: number, reason?: string) => Promise<SignatureSpecimen>;
  getSignatureStatus: () => Promise<SignatureStatus>;
  getMySignature: () => Promise<SignatureSpecimen | null>;
  getQRCode: (specimenId: number) => Promise<QRCodeData | null>;
  regenerateQR: (specimenId: number) => Promise<QRCodeData>;
  deleteSignature: (specimenId: number) => Promise<boolean>;
  refetch: () => void;
}

// ============================================
// HELPER TYPE GUARDS
// ============================================

export function isSignatureSpecimen(data: any): data is SignatureSpecimen {
  return data && typeof data === 'object' && 'id' in data && 'user_id' in data && 'signature_image_url' in data;
}

export function isSignatureStatus(data: any): data is SignatureStatus {
  return data && typeof data === 'object' && 'status' in data && 'label' in data && 'color' in data;
}

export function isQRCodeData(data: any): data is QRCodeData {
  return data && typeof data === 'object' && 'data' in data && 'image' in data && 'hash' in data;
}

// ============================================
// ENUM TYPES FOR FRONTEND USE
// ============================================

export type SignatureStatusType = 'pending' | 'approved' | 'rejected' | 'expired';
export type SignatureStatusColor = 'warning' | 'success' | 'danger' | 'secondary';
export type VerificationStatusType = 'pending' | 'verified' | 'failed' | 'expired';
export type SignatureOverallStatus = 'none' | 'pending' | 'verified' | 'rejected' | 'unknown';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the display label for a signature status
 */
export function getSignatureStatusLabel(status: SignatureStatusType | string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
  };
  return labels[status] || status;
}

/**
 * Get the color for a signature status
 */
export function getSignatureStatusColor(status: SignatureStatusType | string): SignatureStatusColor {
  const colors: Record<string, SignatureStatusColor> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    expired: 'secondary',
  };
  return colors[status] || 'secondary';
}

/**
 * Get the overall status label
 */
export function getOverallStatusLabel(status: SignatureOverallStatus): string {
  const labels: Record<SignatureOverallStatus, string> = {
    none: 'No Signature',
    pending: 'Pending Verification',
    verified: 'Verified',
    rejected: 'Rejected',
    unknown: 'Unknown',
  };
  return labels[status] || 'Unknown';
}

/**
 * Get the overall status color
 */
export function getOverallStatusColor(status: SignatureOverallStatus): SignatureStatusColor {
  const colors: Record<SignatureOverallStatus, SignatureStatusColor> = {
    none: 'secondary',
    pending: 'warning',
    verified: 'success',
    rejected: 'danger',
    unknown: 'secondary',
  };
  return colors[status] || 'secondary';
}

/**
 * Check if a signature is verified
 */
export function isSignatureVerified(specimen: SignatureSpecimen | null): boolean {
  if (!specimen) return false;
  return specimen.is_verified && specimen.status === 'approved';
}

/**
 * Check if a signature is pending
 */
export function isSignaturePending(specimen: SignatureSpecimen | null): boolean {
  if (!specimen) return false;
  return specimen.status === 'pending';
}

/**
 * Check if a signature is rejected
 */
export function isSignatureRejected(specimen: SignatureSpecimen | null): boolean {
  if (!specimen) return false;
  return specimen.status === 'rejected';
}

/**
 * Get the user's full name from a signature
 */
export function getSignatureUserName(specimen: SignatureSpecimen | null): string {
  if (!specimen) return 'Unknown';
  if (specimen.user) return specimen.user.full_name;
  return 'Unknown';
}

/**
 * Get the user's email from a signature
 */
export function getSignatureUserEmail(specimen: SignatureSpecimen | null): string {
  if (!specimen) return 'Unknown';
  if (specimen.user) return specimen.user.email;
  return 'Unknown';
}

/**
 * Get the signature image URL with fallback
 */
export function getSignatureImageUrl(specimen: SignatureSpecimen | null): string | null {
  if (!specimen) return null;
  return specimen.signature_image_url || null;
}

/**
 * Get the QR code image with fallback
 */
export function getQRCodeImage(specimen: SignatureSpecimen | null): string | null {
  if (!specimen) return null;
  return specimen.qr_code?.image || null;
}

/**
 * Check if a user has a valid signature
 */
export function hasValidSignature(user: any): boolean {
  if (!user) return false;
  // This will be populated after fetching the signature status
  return user.signature_status === 'verified';
}
export interface SignatureVerificationLog {
  id: number;
  signature_verification_id: number | null;
  action: string;
  status: string;
  message: string;
  data: any; // JSON string or parsed object
  ip_address: string | null;
  user_agent: string | null;
  created_by: number;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}
