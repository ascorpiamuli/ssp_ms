'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileSignature,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  QrCode,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  Info,
  Shield,
  User,
  Calendar,
  Mail,
  Check,
  X,
  Hourglass,
  PenTool,
  Scan,
  ShieldCheck,
  Award,
  Sparkles,
  Zap,
  Star,
  TrendingUp,
  Users,
  Building2,
  Fingerprint,
  Lock,
  Key,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  History,
  UserCheck,
  FileText,
  PenLine,
  Signature,
  Image,
  FileImage,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useSignature } from '@/hooks/useSignature';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignatureSettingsPage() {
  const { user } = useAuthContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Use the new signature hook for authenticated users
  const {
    signature,
    status,
    effectiveSignature,
    isLoading,
    upload,
    verify,
    reject,
    regenerateQR,
    delete: deleteSignature,
    isVerified,
    isPending,
    isRejected,
    getUserName,
    getUserEmail,
    getImageUrl,
    getQRCodeImage,
    refetch,
  } = useSignature();

  // Use effectiveSignature from the hook
  const currentSignature = effectiveSignature || signature || status?.specimen || null;
  const effectiveImageUrl = currentSignature?.signature_image_url || null;
  const effectiveQrCodeImage = currentSignature?.qr_code?.image || null;
  const effectiveCreatedAt = currentSignature?.created_at || null;
  const effectiveIsVerified = currentSignature?.is_verified || isVerified() || false;
  const effectiveIsPending = currentSignature?.status === 'pending' || isPending() || false;
  const effectiveIsRejected = currentSignature?.status === 'rejected' || isRejected() || false;

  // Extract Forensic & Rejection Data
  const verificationNotes = currentSignature?.verification_notes || null;
  const verifiedBy = currentSignature?.verified_by || null;
  const verificationMethod = currentSignature?.verification_method || null;

  // Helpers to truncate User Agent for UI
  const truncateUserAgent = (ua: string | null) => {
    if (!ua) return 'Unknown Device';
    if (ua.length > 60) return ua.substring(0, 60) + '...';
    return ua;
  };

  // Clear success alert after 5 seconds
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PNG, JPG, JPEG, or SVG file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size must be less than 2MB.');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any;
      handleFileSelect(fakeEvent);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await upload.mutateAsync({
        file: selectedFile,
        notes: 'Signature specimen uploaded via settings'
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowSuccessAlert('✨ Signature uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleVerify = async () => {
    if (!currentSignature) return;
    try {
      await verify.mutateAsync({
        specimenId: currentSignature.id,
        notes: 'Verified via settings'
      });
      setShowSuccessAlert('✅ Signature verified successfully!');
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const handleReject = async () => {
    if (!currentSignature) return;
    try {
      await reject.mutateAsync({
        specimenId: currentSignature.id,
        reason: 'Rejected via settings'
      });
      setShowSuccessAlert('Signature rejected.');
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  const handleRegenerateQR = async () => {
    if (!currentSignature) return;
    try {
      await regenerateQR.mutateAsync({ specimenId: currentSignature.id });
      setShowQRDialog(true);
      setShowSuccessAlert('🔄 QR Code regenerated successfully!');
    } catch (error) {
      console.error('QR regeneration failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!currentSignature) return;
    try {
      await deleteSignature.mutateAsync({ specimenId: currentSignature.id });
      setShowDeleteDialog(false);
      setShowSuccessAlert('🗑️ Signature deleted successfully.');
    } catch (error) {
      console.error('Deletion failed:', error);
    }
  };

  const handleDownloadQR = () => {
    const qrImage = effectiveQrCodeImage || getQRCodeImage();
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `signature-qr-${currentSignature?.id || 'unknown'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusConfig = () => {
    if (!status) {
      return {
        icon: Clock,
        label: 'Loading...',
        color: 'text-gray-500',
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        description: 'Loading signature status...',
        gradient: 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
        statusKey: 'loading',
        glow: 'shadow-gray-200/20',
        action: 'Loading...',
      };
    }

    const statusKey = status.status || status.label?.toLowerCase() || 'unknown';

    switch (statusKey) {
      case 'none':
        return {
          icon: FileSignature,
          label: 'No Signature',
          color: 'text-gray-500',
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          description: "You haven't uploaded a signature yet.",
          gradient: 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
          statusKey: 'none',
          glow: 'shadow-gray-200/20',
          action: 'Upload your first signature',
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending Verification',
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          border: 'border-amber-200 dark:border-amber-800',
          description: 'Your signature is awaiting verification by an administrator.',
          gradient: 'from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20',
          statusKey: 'pending',
          glow: 'shadow-amber-200/20',
          action: 'Awaiting admin review',
        };
      case 'verified':
        return {
          icon: ShieldCheck,
          label: 'Verified',
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          border: 'border-emerald-200 dark:border-emerald-800',
          description: 'Your signature has been verified and is ready to use.',
          gradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20',
          statusKey: 'verified',
          glow: 'shadow-emerald-200/20',
          action: 'Ready for use',
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejected',
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-100 dark:bg-rose-900/30',
          border: 'border-rose-200 dark:border-rose-800',
          description: 'Your signature was rejected. Please upload a new one.',
          gradient: 'from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20',
          statusKey: 'rejected',
          glow: 'shadow-rose-200/20',
          action: 'Upload a new signature',
        };
      default:
        return {
          icon: FileSignature,
          label: status.label || 'Unknown',
          color: 'text-gray-500',
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          description: status.message || 'Unknown status.',
          gradient: 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
          statusKey: 'unknown',
          glow: 'shadow-gray-200/20',
          action: 'Refresh',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const isSignatureVerified = effectiveIsVerified;
  const isSignaturePending = effectiveIsPending;
  const isSignatureRejected = effectiveIsRejected;

  // Determine if upload should be disabled
  const isUploadDisabled = isSignaturePending || upload.isPending;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 relative" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading your signature...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Success Alert */}
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Alert className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-lg shadow-emerald-200/20 dark:shadow-emerald-800/20">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle className="text-emerald-800 dark:text-emerald-300 font-semibold">Success</AlertTitle>
              <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                {showSuccessAlert}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Upload Warning */}
      {isSignaturePending && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 rounded-2xl shadow-lg shadow-amber-200/20 dark:shadow-amber-800/20">
            <Hourglass className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold">Signature Pending Verification</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              You already have a signature awaiting verification. You cannot upload a new signature until the current one is verified or rejected.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/* INSTRUCTIONS CARD - How to upload signature correctly */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                    <PenLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    How to Upload Your Signature
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Follow these instructions to ensure your signature is accepted for verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step 1 */}
                  <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-medium dark:text-white">Use a White Sheet of Paper</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Place a clean, white sheet of paper on a flat, hard surface.
                          Avoid lined or colored paper.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-medium dark:text-white">Use a Dark, Visible Pen</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Use a black or dark blue pen with a clear, consistent ink flow.
                          Avoid light colors, pencils, or markers.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium dark:text-white">Sign Clearly and Legibly</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Write your full signature as you would on official documents.
                          Ensure it matches your official signature for verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                        4
                      </div>
                      <div>
                        <p className="text-sm font-medium dark:text-white">Take a High-Quality Photo</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Take a well-lit, focused photo of the signature.
                          Ensure the signature fills most of the frame and is not cut off.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Important Tips</p>
                      <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-1 list-disc list-inside">
                        <li>Ensure good lighting to avoid shadows on the signature</li>
                        <li>Hold the camera steady to avoid blurry images</li>
                        <li>Crop the image to focus only on the signature area</li>
                        <li>Signature must match the one on your official documents</li>
                        <li>Upload a clear, high-resolution image (PNG or JPG recommended)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card - Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-1"
        >
          <Card className={cn(
            'border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br',
            statusConfig.gradient,
            statusConfig.glow
          )}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={cn(
                    'p-5 rounded-3xl mb-4',
                    statusConfig.bg,
                    'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-gray-900',
                    statusConfig.statusKey === 'verified' && 'ring-emerald-200 dark:ring-emerald-800',
                    statusConfig.statusKey === 'pending' && 'ring-amber-200 dark:ring-amber-800',
                    statusConfig.statusKey === 'rejected' && 'ring-rose-200 dark:ring-rose-800',
                    statusConfig.statusKey === 'none' && 'ring-gray-200 dark:ring-gray-700'
                  )}
                >
                  <StatusIcon className={cn('h-12 w-12', statusConfig.color)} />
                </motion.div>
                <h3 className="text-xl font-bold dark:text-white">{statusConfig.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{statusConfig.description}</p>
                {status?.message && (
                  <p className="text-xs text-muted-foreground mt-2 px-3 py-1.5 bg-muted/50 rounded-full">
                    {status.message}
                  </p>
                )}
                <div className="w-full mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium dark:text-white">{getUserName()}</span>
                    <span className="text-muted-foreground">•</span>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">{getUserEmail()}</span>
                  </div>
                  {effectiveCreatedAt && (
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3" />
                      <span>Uploaded {format(new Date(effectiveCreatedAt), 'PPP')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Signature Preview - Right Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <PenTool className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Signature Specimen</CardTitle>
                    <CardDescription>
                      {statusConfig.statusKey === 'none'
                        ? 'Upload your signature image to get started.'
                        : isSignatureVerified
                          ? 'Your verified signature is ready to use.'
                          : isSignaturePending
                            ? 'Your signature is awaiting verification.'
                            : 'Review your signature status.'}
                    </CardDescription>
                  </div>
                </div>
                {currentSignature && (
                  <Badge
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-full',
                      isSignatureVerified && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                      isSignaturePending && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                      isSignatureRejected && 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    )}
                  >
                    {isSignatureVerified && <CheckCircle className="h-3 w-3 mr-1 inline" />}
                    {isSignaturePending && <Clock className="h-3 w-3 mr-1 inline" />}
                    {isSignatureRejected && <XCircle className="h-3 w-3 mr-1 inline" />}
                    {statusConfig.label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {effectiveImageUrl ? (
                // Existing Signature View
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="relative group"
                    >
                      <div className="w-56 h-36 rounded-2xl border-2 border-border overflow-hidden bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center">
                        <img
                          src={effectiveImageUrl}
                          alt="Your signature"
                          className="max-w-full max-h-full object-contain p-3"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-signature.png';
                          }}
                        />
                      </div>
                      {isSignatureVerified && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute -top-3 -right-3"
                        >
                          <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-lg ring-4 ring-white dark:ring-gray-900">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        </motion.div>
                      )}
                      {isSignaturePending && (
                        <div className="absolute -top-3 -right-3">
                          <div className="bg-amber-500 text-white rounded-full p-1.5 shadow-lg ring-4 ring-white dark:ring-gray-900">
                            <Clock className="h-5 w-5" />
                          </div>
                        </div>
                      )}
                    </motion.div>

                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-3 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium dark:text-white">{getUserName()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{getUserEmail()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Uploaded: {effectiveCreatedAt ? format(new Date(effectiveCreatedAt), 'PPP') : 'N/A'}
                        </span>
                      </div>
                      {isSignatureVerified && currentSignature?.verified_at && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 text-sm text-emerald-600 dark:text-emerald-400"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>
                            Verified on {format(new Date(currentSignature.verified_at), 'PPP')}
                            {currentSignature.verified_by?.full_name && ` by ${currentSignature.verified_by.full_name}`}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* QR Code Section - Only show when verified */}
                  {isSignatureVerified && effectiveQrCodeImage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="mt-4 p-5 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-200/20 dark:shadow-emerald-800/20"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <motion.div
                          whileHover={{ scale: 1.05, rotate: 2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className="relative"
                        >
                          <div className="w-32 h-32 bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex items-center justify-center p-3 border-2 border-emerald-200 dark:border-emerald-800">
                            <img
                              src={effectiveQrCodeImage}
                              alt="Signature QR Code"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 shadow-lg shadow-emerald-500/30">
                            <Scan className="h-4 w-4 text-white" />
                          </div>
                          <div className="absolute -top-2 -left-2">
                            <Badge className="bg-emerald-500 text-white border-0 text-[10px] px-2 py-0.5">
                              <ShieldCheck className="h-3 w-3 mr-1 inline" />
                              Verified
                            </Badge>
                          </div>
                        </motion.div>
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-sm font-semibold dark:text-white flex items-center justify-center sm:justify-start gap-2">
                            <QrCode className="h-4 w-4 text-emerald-600" />
                            Verified QR Code
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Scan this QR code to verify the authenticity of this signature
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-600/20"
                              onClick={handleDownloadQR}
                            >
                              <Download className="h-4 w-4" />
                              Download QR
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                              onClick={handleRegenerateQR}
                              disabled={regenerateQR.isPending}
                            >
                              {regenerateQR.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                              Regenerate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                              onClick={() => setShowQRDialog(true)}
                            >
                              <Eye className="h-4 w-4" />
                              View Full
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Forensic & Audit Trail Section */}
                  {(verificationNotes || verifiedBy || verificationMethod) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-4 p-5 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl border border-border shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Forensic & Audit Details</h4>
                      </div>

                      <Separator className="my-3" />

                      {verificationNotes && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {isSignatureRejected ? (
                              <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            ) : (
                              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                            <span className="text-xs font-medium text-muted-foreground">
                              {isSignatureRejected ? 'Rejection Reason' : 'Verification Notes'}
                            </span>
                          </div>
                          <p className="text-sm p-3 bg-background/50 rounded-lg border border-border/50 italic dark:text-gray-300">
                            "{verificationNotes}"
                          </p>
                        </div>
                      )}

                      {(verifiedBy || verificationMethod) && (
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {verifiedBy && (
                            <span className="flex items-center gap-1.5">
                              <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              Verified by: <span className="font-medium dark:text-white">{verifiedBy.full_name}</span>
                            </span>
                          )}
                          {verificationMethod && (
                            <span className="flex items-center gap-1.5">
                              <Key className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                              Method: <span className="font-medium dark:text-white capitalize">{verificationMethod}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    {isSignaturePending && (
                      <>
                        <Button
                          size="sm"
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
                          onClick={handleVerify}
                          disabled={verify.isPending}
                        >
                          {verify.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          {verify.isPending ? 'Verifying...' : 'Verify Signature'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2 rounded-xl"
                          onClick={handleReject}
                          disabled={reject.isPending}
                        >
                          {reject.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          {reject.isPending ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </>
                    )}
                    {!isSignaturePending && currentSignature && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 dark:border-rose-800"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={deleteSignature.isPending}
                      >
                        {deleteSignature.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        {deleteSignature.isPending ? 'Deleting...' : 'Delete Signature'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                // Upload Area - Only show if no signature image
                <div className="space-y-4">
                  {uploadError && (
                    <Alert variant="destructive" className="rounded-2xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}

                  {isSignaturePending ? (
                    // Pending upload warning
                    <div className="text-center py-12">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <Clock className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold dark:text-white">Signature Pending</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                        You already have a signature awaiting verification. Please wait for it to be processed before uploading a new one.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 gap-2 rounded-xl"
                        onClick={() => refetch()}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Check Status
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer',
                        isDragging
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.02]'
                          : previewUrl
                            ? 'border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
                      )}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {previewUrl ? (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div className="w-52 h-36 rounded-2xl border border-border overflow-hidden bg-white dark:bg-gray-900 shadow-lg flex items-center justify-center">
                              <img
                                src={previewUrl}
                                alt="Signature preview"
                                className="max-w-full max-h-full object-contain p-3"
                              />
                            </div>
                          </div>
                          <p className="text-sm font-medium dark:text-white">
                            {selectedFile?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile?.size || 0) / 1024} KB
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-2 rounded-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                                setPreviewUrl(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                              Remove
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpload();
                              }}
                              disabled={upload.isPending}
                            >
                              {upload.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                              {upload.isPending ? 'Uploading...' : 'Upload Signature'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/30">
                              <Upload className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div>
                            <p className="text-base font-semibold dark:text-white">
                              Drop your signature here
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              or click to browse files
                            </p>
                          </div>
                          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                            <span className="px-3 py-1 bg-muted/50 rounded-full">PNG</span>
                            <span className="px-3 py-1 bg-muted/50 rounded-full">JPG</span>
                            <span className="px-3 py-1 bg-muted/50 rounded-full">JPEG</span>
                            <span className="px-3 py-1 bg-muted/50 rounded-full">SVG</span>
                            <span className="px-3 py-1 bg-muted/50 rounded-full">Max 2MB</span>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                            className="hidden"
                            onChange={handleFileSelect}
                            disabled={upload.isPending}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {isSignatureRejected && (
                    <Alert className="bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 rounded-2xl">
                      <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      <AlertTitle className="text-rose-800 dark:text-rose-300">Signature Rejected</AlertTitle>
                      <AlertDescription className="text-rose-700 dark:text-rose-400">
                        Your previous signature was rejected. Please upload a new signature for verification.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Features / Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold dark:text-white">Secure Identity</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your digital signature verifies your identity for document approvals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Scan className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold dark:text-white">QR Verification</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scan the QR code to instantly verify signature authenticity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold dark:text-white">Verified Trust</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Once verified, your signature is trusted across all workflows
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="rounded-2xl max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <QrCode className="h-6 w-6" />
                Verified QR Code
              </DialogTitle>
              <DialogDescription className="text-emerald-100">
                Scan this QR code to verify your signature
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex flex-col items-center p-8">
            {effectiveQrCodeImage ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative"
              >
                <div className="w-72 h-72 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-emerald-200 dark:border-emerald-800">
                  <img
                    src={effectiveQrCodeImage}
                    alt="Signature QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 shadow-lg shadow-emerald-500/30">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-3 py-1 text-xs font-medium shadow-lg shadow-emerald-500/30">
                  Verified
                </div>
              </motion.div>
            ) : (
              <div className="w-72 h-72 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
              </div>
            )}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm font-medium dark:text-white">Verification QR Code</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                This QR code contains your encrypted signature verification data.
                It can be scanned by authorized personnel to verify your identity.
              </p>
              {currentSignature?.verified_at && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified on {format(new Date(currentSignature.verified_at), 'PPP')}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 flex gap-3">
            <Button variant="outline" onClick={() => setShowQRDialog(false)} className="flex-1 rounded-xl">
              Close
            </Button>
            <Button onClick={handleDownloadQR} className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-600/20">
              <Download className="h-4 w-4" />
              Download QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30">
                <Trash2 className="h-5 w-5" />
              </div>
              Delete Signature
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your signature specimen?
              This action cannot be undone and you will need to upload a new signature.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4 border border-rose-200 dark:border-rose-800">
            <p className="text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              This will permanently remove your signature from the system.
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSignature.isPending}
              className="rounded-xl gap-2"
            >
              {deleteSignature.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleteSignature.isPending ? 'Deleting...' : 'Delete Signature'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
