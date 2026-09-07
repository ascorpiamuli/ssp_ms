// frontend/src/app/(dashboard)/procurement/delivery-notes/service-acknowledgment/[id]/page.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Package,
  Calendar,
  Building2,
  User,
  Truck,
  Scale,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  Download,
  Printer,
  Mail,
  Phone,
  MapPin,
  Hash,
  DollarSign,
  FileCheck,
  Send,
  ChevronRight,
  ExternalLink,
  FileArchive,
  Shield,
  Zap,
  Award,
  Activity,
  RefreshCw,
  Info,
  Check,
  X,
  BadgeCheck,
  AlertTriangle,
  Star,
  ThumbsUp,
  Briefcase,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Hooks - Using the same hook file that has both GRN and SAN hooks
import {
  useSan,
  useSubmitSan,
  useApproveSan,
  useRejectSan,
  useRateService,
  useDownloadSanPdf,
  usePreviewSanPdf,
  useGetSanPdf,
} from '@/hooks/useGoodsReceived';
import { useSuppliers } from '@/hooks/useSuppliers';
import { usePurchaseOrder } from '@/hooks/usePurchaseOrder';
import { useAuthContext } from '@/contexts/AuthContext';

// Types
import type { ServiceAcknowledgmentNote, QualityRating } from '@/types/goodsReceived.types';

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'KES 0.00';
  return `KES ${Number(num).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getUserName = (user: any): string => {
  if (!user) return 'System';
  if (typeof user === 'string') return user;
  if (typeof user === 'number') return `User ${user}`;
  if (typeof user === 'object') {
    if (user.full_name) return user.full_name;
    if (user.first_name || user.last_name) {
      return [user.first_name, user.last_name].filter(Boolean).join(' ');
    }
    if (user.name) return user.name;
    if (user.id) return `User ${user.id}`;
  }
  return 'System';
};

const getSupplierName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    hod_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    principal_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    completed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return map[status] || map.draft;
};

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    hod_approved: 'HOD Approved',
    principal_approved: 'Approved',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  return map[status] || status;
};

const getStatusIcon = (status: string): React.ReactNode => {
  const map: Record<string, React.ReactNode> = {
    draft: <FileText className="h-4 w-4" />,
    submitted: <Clock className="h-4 w-4" />,
    hod_approved: <CheckCircle className="h-4 w-4" />,
    principal_approved: <BadgeCheck className="h-4 w-4" />,
    completed: <Award className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
  };
  return map[status] || <FileText className="h-4 w-4" />;
};

const getQualityRatingLabel = (rating: string | null): string => {
  const map: Record<string, string> = {
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    poor: 'Poor',
  };
  return rating ? map[rating] || rating : 'Not Rated';
};

const getQualityRatingColor = (rating: string | null): string => {
  const map: Record<string, string> = {
    excellent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    average: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    poor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return rating ? map[rating] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  const icon = getStatusIcon(status);

  return (
    <Badge className={cn("px-3 py-1.5 font-medium rounded-full text-sm border flex items-center gap-1.5", color)}>
      {icon}
      {label}
    </Badge>
  );
};

const QualityRatingBadge = ({ rating }: { rating: string | null }) => {
  if (!rating) return null;

  const color = getQualityRatingColor(rating);
  const label = getQualityRatingLabel(rating);

  const iconMap: Record<string, React.ReactNode> = {
    excellent: <Star className="h-3 w-3" />,
    good: <ThumbsUp className="h-3 w-3" />,
    average: <Scale className="h-3 w-3" />,
    poor: <AlertCircle className="h-3 w-3" />,
  };

  return (
    <Badge className={cn("px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 border", color)}>
      {iconMap[rating] || <CheckCircle className="h-3 w-3" />}
      {label}
    </Badge>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function ServiceAcknowledgmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  // Auth context for role checking
  const { isHOD, isPrincipal, isAdmin, isAccountant } = useAuthContext();

  // Primary data - using SAN hooks from useGoodsReceived
  const { data: san, isLoading, refetch } = useSan(id);

  // ✅ REAL PDF HOOKS - Using the actual hooks from useGoodsReceived
  const {
    download: downloadSanPdf,
    isDownloading: isDownloadingPdf,
    downloadProgress: pdfDownloadProgress,
    errorMessage: pdfErrorMessage,
  } = useDownloadSanPdf();


  // Related data
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useAllSuppliers();

  const poId = san?.purchase_order_id || 0;
  const { data: purchaseOrder, isLoading: isLoadingPO } = usePurchaseOrder(poId, {
    enabled: !!poId,
  });

  // Mutations - using SAN mutations from useGoodsReceived
  const submitSan = useSubmitSan();
  const approveSan = useApproveSan();
  const rejectSan = useRejectSan();
  const rateService = useRateService();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showQualityRatingDialog, setShowQualityRatingDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [qualityRatingData, setQualityRatingData] = useState<{
    quality_rating: QualityRating | '';
    quality_notes: string;
    performance_notes: string;
  }>({
    quality_rating: '',
    quality_notes: '',
    performance_notes: '',
  });

  // Build supplier map
  const suppliersMap = useMemo(() => {
    const map: Record<number, any> = {};
    if (Array.isArray(suppliersData)) {
      suppliersData.forEach((supplier: any) => {
        if (supplier?.id) {
          map[supplier.id] = supplier;
        }
      });
    }
    return map;
  }, [suppliersData]);

  const handleBack = () => {
    router.push('/procurement/delivery-notes/service-acknowledgment');
  };

  // ✅ UPDATED: Using the real PDF download hook
  const handleDownloadPdf = () => {
    if (san) {
      downloadSanPdf(san.id);
    }
  };


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Action Handlers
  const handleSubmit = () => {
    if (san) {
      setShowSubmitDialog(true);
    }
  };

  const handleApprove = () => {
    if (san) {
      setApprovalComment('');
      setShowApproveDialog(true);
    }
  };

  const handleReject = () => {
    if (san) {
      setRejectionReason('');
      setShowRejectDialog(true);
    }
  };

  const handleQualityRate = () => {
    if (san) {
      setQualityRatingData({
        quality_rating: '',
        quality_notes: '',
        performance_notes: '',
      });
      setShowQualityRatingDialog(true);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!san) return;
    setIsSubmitting(true);
    try {
      await submitSan.mutateAsync(san.id);
      setShowSubmitDialog(false);
      await refetch();
    } catch (err: any) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmApprove = async () => {
    if (!san) return;
    setIsSubmitting(true);
    try {
      await approveSan.mutateAsync({
        id: san.id,
        comment: approvalComment || undefined,
      });
      setShowApproveDialog(false);
      await refetch();
    } catch (err: any) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!san) return;
    setIsSubmitting(true);
    try {
      await rejectSan.mutateAsync({
        id: san.id,
        reason: rejectionReason,
      });
      setShowRejectDialog(false);
      await refetch();
    } catch (err: any) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmQualityRate = async () => {
    if (!san || !qualityRatingData.quality_rating) return;
    setIsSubmitting(true);
    try {
      await rateService.mutateAsync({
        id: san.id,
        data: {
          quality_rating: qualityRatingData.quality_rating,
          quality_notes: qualityRatingData.quality_notes || undefined,
          performance_notes: qualityRatingData.performance_notes || undefined,
        },
      });
      setShowQualityRatingDialog(false);
      await refetch();
    } catch (err: any) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingAll = isLoading || isLoadingSuppliers || isLoadingPO;

  if (isLoadingAll) {
    return (
      <PageTemplate
        title="Service Acknowledgment Note Details"
        description="Loading..."
        icon={<FileText className="h-5 w-5" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
          { label: 'Service Acknowledgment', href: '/procurement/delivery-notes/service-acknowledgment' },
          { label: 'Details' },
        ]}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }

  if (!san) {
    return (
      <PageTemplate
        title="Service Acknowledgment Note Details"
        description="Not Found"
        icon={<FileText className="h-5 w-5" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
          { label: 'Service Acknowledgment', href: '/procurement/delivery-notes/service-acknowledgment' },
          { label: 'Details' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <AlertCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            </motion.div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">Service Acknowledgment Note Not Found</h3>
            <p className="text-muted-foreground">The SAN you're looking for doesn't exist or has been removed.</p>
            <Button onClick={handleBack} className="mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to SANs
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const supplierId = san.purchase_order?.supplier_id;
  const supplier = supplierId ? suppliersMap[supplierId] : san.purchase_order?.supplier;
  const supplierName = getSupplierName(supplier);
  const acknowledgedByName = typeof san.acknowledged_by === 'string' ? san.acknowledged_by : getUserName(san.acknowledged_by);
  const statusLabel = getStatusLabel(san.status);

  const poNumber = purchaseOrder?.po_number || san.purchase_order?.po_number || 'N/A';
  const requisitionId = san.requisition_id || 0;

  const isApproved = san.status === 'hod_approved' || san.status === 'principal_approved' || san.status === 'completed';
  const isPending = san.status === 'submitted';
  const isDraft = san.status === 'draft';
  const isRejected = san.status === 'rejected';
  const canDownloadPdf = isApproved;
  const canSubmit = san.status === 'draft';

  // ============================================
  // ROLE-BASED APPROVAL LOGIC - FIXED
  // ============================================
  // 🔥 FIX: Use type assertion to access nested approvals
  const sanWithApprovals = san as any;
  const approvals = sanWithApprovals.approvals || {};

  const approvalLevel = san.approval_level || 'hod';
  const isHodApproved = approvals.hod_approved_at !== null && approvals.hod_approved_at !== undefined;
  const isPrincipalApproved = approvals.principal_approved_at !== null && approvals.principal_approved_at !== undefined;

  const isCurrentUserHod = isHOD();
  const isCurrentUserPrincipal = isPrincipal();
  const isCurrentUserAdmin = isAdmin();
  const isCurrentUserAccountant = isAccountant();

  // HOD can approve if:
  // - Status is 'submitted'
  // - Approval level is 'hod'
  // - HOD hasn't approved yet
  // - Current user is HOD or Admin
  const canApprove = (() => {
    if (san.status !== 'submitted') return false;

    if (approvalLevel === 'hod') {
      return (isCurrentUserHod || isCurrentUserAdmin) && !isHodApproved;
    }

    if (approvalLevel === 'principal') {
      return (isCurrentUserPrincipal || isCurrentUserAdmin) && !isPrincipalApproved;
    }

    return false;
  })();

  // HOD can reject if:
  // - Status is 'submitted'
  // - Approval level is 'hod'
  // - HOD hasn't approved yet
  // - Current user is HOD or Admin
  const canReject = (() => {
    if (san.status !== 'submitted') return false;

    if (approvalLevel === 'hod') {
      return (isCurrentUserHod || isCurrentUserAdmin) && !isHodApproved;
    }

    if (approvalLevel === 'principal') {
      return (isCurrentUserPrincipal || isCurrentUserAdmin) && !isPrincipalApproved;
    }

    return false;
  })();

  // Principal can approve if:
  // - Status is 'submitted'
  // - Approval level is 'hod' AND HOD has approved
  // - OR approval level is 'principal'
  // - Principal hasn't approved yet
  // - Current user is Principal or Admin
  const canPrincipalApprove = (() => {
    if (san.status !== 'submitted') return false;
    if (!isCurrentUserPrincipal && !isCurrentUserAdmin) return false;
    if (isPrincipalApproved) return false;

    if (approvalLevel === 'hod') {
      return isHodApproved;
    }

    if (approvalLevel === 'principal') {
      return true;
    }

    return false;
  })();

  // Principal can reject if:
  // - Status is 'submitted'
  // - Approval level is 'hod' AND HOD has approved
  // - OR approval level is 'principal'
  // - Principal hasn't approved yet
  // - Current user is Principal or Admin
  const canPrincipalReject = (() => {
    if (san.status !== 'submitted') return false;
    if (!isCurrentUserPrincipal && !isCurrentUserAdmin) return false;
    if (isPrincipalApproved) return false;

    if (approvalLevel === 'hod') {
      return isHodApproved;
    }

    if (approvalLevel === 'principal') {
      return true;
    }

    return false;
  })();

  // Can rate quality - HOD, Accountant, or Admin can rate
  const canRateQuality = (() => {
    if (san.status !== 'completed') return false;
    if (san.quality_rating) return false;
    return isCurrentUserHod || isCurrentUserAccountant || isCurrentUserAdmin;
  })();

  const navigateToRequisition = () => {
    if (requisitionId) {
      router.push(`/requisitions/${requisitionId}`);
    }
  };

  const navigateToSupplier = () => {
    const supplierId = san.purchase_order?.supplier_id;
    if (supplierId) {
      router.push(`/suppliers/${supplierId}`);
    }
  };

  return (
    <PageTemplate
      title={`Service Acknowledgment Note ${san.san_number}`}
      description={`${statusLabel} - Acknowledged on ${formatDate(san.acknowledgment_date)}`}
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
        { label: 'Service Acknowledgment', href: '/procurement/delivery-notes/service-acknowledgment' },
        { label: san.san_number },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={san.status} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          </Button>
          {canDownloadPdf && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm"
            >
              {isDownloadingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {isDownloadingPdf ? `Downloading ${pdfDownloadProgress}%...` : 'Download PDF'}
            </Button>
          )}
          {canSubmit && (
            <Button
              size="sm"
              onClick={handleSubmit}
              className="gap-1.5 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              Submit for Approval
            </Button>
          )}
          {/* HOD Approval Button - Only shown to HOD or Admin */}
          {canApprove && (
            <Button
              size="sm"
              onClick={handleApprove}
              className="gap-1.5 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-white"
            >
              <Check className="h-3.5 w-3.5" />
              {approvalLevel === 'hod' ? 'HOD Approve' : 'Principal Approve'}
            </Button>
          )}
          {/* HOD Reject Button - Only shown to HOD or Admin */}
          {canReject && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              className="gap-1.5 h-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <X className="h-3.5 w-3.5" />
              {approvalLevel === 'hod' ? 'HOD Reject' : 'Principal Reject'}
            </Button>
          )}
          {/* Principal Approval Button - Only shown to Principal or Admin after HOD approval */}
          {canPrincipalApprove && (
            <Button
              size="sm"
              onClick={handleApprove}
              className="gap-1.5 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-white"
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              Principal Approve
            </Button>
          )}
          {/* Principal Reject Button - Only shown to Principal or Admin after HOD approval */}
          {canPrincipalReject && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              className="gap-1.5 h-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <X className="h-3.5 w-3.5" />
              Principal Reject
            </Button>
          )}
          {canRateQuality && (
            <Button
              size="sm"
              onClick={handleQualityRate}
              className="gap-1.5 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 text-white"
            >
              <Star className="h-3.5 w-3.5" />
              Rate Service
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleBack}
            className="gap-1.5 h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - SAN Details & Service Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* SAN Summary Card */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 animate-gradient-x" />
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse-slow" />

                <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 shadow-lg shadow-emerald-500/10">
                          <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent font-bold">
                          Service Acknowledgment Details
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Acknowledged on {formatDateTime(san.acknowledgment_date)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full animate-pulse",
                        isApproved ? "bg-emerald-500" :
                          isPending ? "bg-amber-500" :
                            isRejected ? "bg-red-500" :
                              isDraft ? "bg-gray-400" :
                                "bg-blue-500"
                      )} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {isApproved ? 'Approved' :
                          isPending ? 'Pending' :
                            isRejected ? 'Rejected' :
                              isDraft ? 'Draft' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                        <Hash className="h-3 w-3" />
                        SAN Number
                      </p>
                      <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white font-mono">
                        {san.san_number}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        Acknowledgment Date
                      </p>
                      <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">
                        {formatDate(san.acknowledgment_date)}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        Acknowledged By
                      </p>
                      <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white truncate">
                        {acknowledgedByName}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="h-3 w-3" />
                        Status
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={san.status} />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Value</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(san.total_value)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net Total</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(san.net_total)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tax</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(san.total_tax || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Service Details Card */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-gradient-x" />

                <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 shadow-lg shadow-blue-500/10">
                      <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
                      Service Details
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {san.service_provider && (
                      <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground">Service Provider</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{san.service_provider}</p>
                      </div>
                    )}
                    {san.service_description && (
                      <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700 col-span-2">
                        <p className="text-xs text-muted-foreground">Service Description</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{san.service_description}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {san.service_start_date && (
                      <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground">Service Start Date</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(san.service_start_date)}</p>
                      </div>
                    )}
                    {san.service_end_date && (
                      <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground">Service End Date</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(san.service_end_date)}</p>
                      </div>
                    )}
                  </div>

                  {san.service_deliverables && (
                    <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                      <p className="text-xs text-muted-foreground">Deliverables</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{san.service_deliverables}</p>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 animate-gradient-x" />
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow" />

                <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 shadow-lg shadow-purple-500/10">
                      <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent font-bold">
                      Quick Actions
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative pt-4 space-y-2">
                  {canSubmit && (
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      className="w-full justify-center rounded-xl bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </Button>
                  )}

                  {canApprove && (
                    <Button
                      size="sm"
                      onClick={handleApprove}
                      className="w-full justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {approvalLevel === 'hod' ? 'HOD Approve' : 'Principal Approve'}
                    </Button>
                  )}

                  {canReject && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReject}
                      className="w-full justify-center rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {approvalLevel === 'hod' ? 'HOD Reject' : 'Principal Reject'}
                    </Button>
                  )}

                  {canPrincipalApprove && (
                    <Button
                      size="sm"
                      onClick={handleApprove}
                      className="w-full justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-white"
                    >
                      <BadgeCheck className="h-4 w-4 mr-2" />
                      Principal Approve
                    </Button>
                  )}

                  {canPrincipalReject && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReject}
                      className="w-full justify-center rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Principal Reject
                    </Button>
                  )}

                  {canRateQuality && (
                    <Button
                      size="sm"
                      onClick={handleQualityRate}
                      className="w-full justify-center rounded-xl bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 text-white"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate Service Quality
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all duration-300 group"
                    onClick={handleDownloadPdf}
                    disabled={!canDownloadPdf || isDownloadingPdf}
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Download className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>
                      {isDownloadingPdf ? `Downloading ${pdfDownloadProgress}%...` : 'Download PDF'}
                    </span>
                    {!canDownloadPdf && (
                      <span className="text-xs text-muted-foreground ml-auto">(Approval Required)</span>
                    )}
                  </Button>


                  <Separator className="my-2" />

                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all duration-300 group"
                    onClick={() => router.push(`/procurement/purchase-orders/${san.purchase_order_id}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                    <span>View Purchase Order</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-gray-200/50 dark:border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all duration-300 group"
                    onClick={navigateToRequisition}
                    disabled={!requisitionId}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                    <span>View Requisition</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {san.purchase_order?.supplier_id && (
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all duration-300 group"
                      onClick={navigateToSupplier}
                    >
                      <ExternalLink className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      <span>View Supplier Profile</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </CardContent>
              </div>
            </Card>

            {/* Reference Numbers */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 animate-gradient-x" />

                <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 shadow-lg shadow-amber-500/10">
                      <Hash className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent font-bold">
                      Reference Numbers
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative pt-4 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/30 dark:border-gray-700/30">
                    <span className="text-sm text-muted-foreground">SAN Number</span>
                    <span className="text-sm font-medium font-mono text-gray-900 dark:text-gray-100">{san.san_number}</span>
                  </div>

                  {san.reference_number && (
                    <div className="flex justify-between items-center py-2 border-b border-border/30 dark:border-gray-700/30">
                      <span className="text-sm text-muted-foreground">Reference</span>
                      <span className="text-sm font-medium font-mono text-gray-900 dark:text-gray-100">{san.reference_number}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-border/30 dark:border-gray-700/30">
                    <span className="text-sm text-muted-foreground">Purchase Order</span>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-mono text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                      onClick={() => router.push(`/procurement/purchase-orders/${san.purchase_order_id}`)}
                    >
                      {poNumber}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Requisition</span>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-mono text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                      onClick={navigateToRequisition}
                      disabled={!requisitionId}
                    >
                      #{requisitionId}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Quality Rating */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 animate-gradient-x" />

                <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 shadow-lg shadow-purple-500/10">
                      <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent font-bold">
                      Quality Rating
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative pt-4">
                  {san.quality_rating ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <QualityRatingBadge rating={san.quality_rating} />
                      </div>

                      {san.quality_notes && (
                        <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                          <p className="text-xs text-muted-foreground mb-1">Quality Notes</p>
                          <p className="text-sm text-gray-900 dark:text-gray-100">{san.quality_notes}</p>
                        </div>
                      )}

                      {san.performance_notes && (
                        <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                          <p className="text-xs text-muted-foreground mb-1">Performance Notes</p>
                          <p className="text-sm text-gray-900 dark:text-gray-100">{san.performance_notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="inline-flex p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                        <Star className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No quality rating yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Rate service quality after completion</p>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>

            {/* Approval Flow */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 animate-gradient-x" />

                <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 shadow-lg shadow-emerald-500/10">
                      <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent font-bold">
                      Approval Flow
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <CardDescription>Approval Level:</CardDescription>
                    <Badge variant="outline" className="rounded-full text-xs">
                      {approvalLevel === 'hod' ? 'HOD → Principal' : 'Principal Only'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="relative pt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        isHodApproved ? "bg-emerald-500" :
                          san.status === 'submitted' || san.status === 'draft' ? "bg-amber-500 animate-pulse" :
                            "bg-gray-300 dark:bg-gray-600"
                      )} />
                      <span className="text-sm">HOD Approval</span>
                    </div>
                    <span className="text-sm">
                      {isHodApproved ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {formatDate(approvals.hod_approved_at)}
                        </span>
                      ) : san.status === 'submitted' || san.status === 'draft' ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Pending
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                  </div>

                  {(approvalLevel === 'hod' || isPrincipalApproved) && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          isPrincipalApproved ? "bg-emerald-500" :
                            isHodApproved && (san.status === 'submitted' || san.status === 'hod_approved') ? "bg-amber-500 animate-pulse" :
                              "bg-gray-300 dark:bg-gray-600"
                        )} />
                        <span className="text-sm">Principal Approval</span>
                      </div>
                      <span className="text-sm">
                        {isPrincipalApproved ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {formatDate(approvals.principal_approved_at)}
                          </span>
                        ) : isHodApproved && (san.status === 'submitted' || san.status === 'hod_approved') ? (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Pending
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </span>
                    </div>
                  )}

                  {san.returned_at && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/30 dark:bg-red-950/20 border border-red-200/30 dark:border-red-800/30">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="text-sm text-red-600 dark:text-red-400">Returned</span>
                        </div>
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {formatDate(san.returned_at)}
                        </span>
                      </div>
                      {san.return_reason && (
                        <div className="p-2 rounded-lg bg-red-50/20 dark:bg-red-950/10 border border-red-200/20 dark:border-red-800/20">
                          <p className="text-xs text-muted-foreground">Reason</p>
                          <p className="text-sm text-red-600 dark:text-red-400">{san.return_reason}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </div>
            </Card>

            {/* Additional Info */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-gradient-x" />

                <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 shadow-lg shadow-blue-500/10">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
                      Additional Info
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative pt-4 space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-border/30 dark:border-gray-700/30">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(san.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30 dark:border-gray-700/30">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(san.updated_at)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30 dark:border-gray-700/30">
                    <span className="text-sm text-muted-foreground">Approval Level</span>
                    <Badge variant="outline" className="rounded-full text-xs">
                      {approvalLevel === 'hod' ? 'HOD → Principal' : 'Principal Only'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Downloads</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{(san as any).download_count || 0}</span>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Notes */}
            {san.quality_notes && (
              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 animate-gradient-x" />

                  <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 shadow-lg shadow-amber-500/10">
                        <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent font-bold">
                        Quality Notes
                      </span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative pt-4">
                    <div className="p-3 rounded-xl bg-muted/10 dark:bg-gray-800/20 border border-border/30 dark:border-gray-700">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{san.quality_notes}</p>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* DIALOGS - DARK MODE COMPATIBLE */}
      {/* ============================================ */}

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Send className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Submit SAN for Approval
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {san?.san_number} will be sent for approval. Once submitted, it cannot be edited.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <p className="font-semibold">Ready for approval</p>
                  <p className="text-xs mt-0.5">
                    This SAN will be reviewed by the Head of Department or Principal.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 rounded-xl text-white dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Approve SAN
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {san?.san_number} will be approved. This confirms the service has been rendered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-comment" className="text-gray-700 dark:text-gray-300">Comment (Optional)</Label>
              <Textarea
                id="approval-comment"
                placeholder="Add any approval notes..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-700 dark:text-emerald-300">
                  <p className="font-semibold">Confirm Approval</p>
                  <p className="text-xs mt-0.5">This will approve the SAN and mark service as acknowledged.</p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApprove}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {isSubmitting ? 'Approving...' : 'Approve SAN'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              Reject SAN
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {san?.san_number} will be rejected. A reason is required.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-gray-700 dark:text-gray-300">Reason for Rejection <span className="text-red-500">*</span></Label>
              <Textarea
                id="rejection-reason"
                placeholder="Provide a reason for rejecting this SAN..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div className="p-4 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold">Confirm Rejection</p>
                  <p className="text-xs mt-0.5">The supplier will be notified and can make corrections.</p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              disabled={isSubmitting || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700 rounded-xl text-white dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
              {isSubmitting ? 'Rejecting...' : 'Reject SAN'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quality Rating Dialog */}
      <Dialog open={showQualityRatingDialog} onOpenChange={setShowQualityRatingDialog}>
        <DialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Rate Service Quality
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {san?.san_number} - Rate the quality of service provided.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Quality Rating <span className="text-red-500">*</span></Label>
              <Select
                value={qualityRatingData.quality_rating}
                onValueChange={(value) => setQualityRatingData({
                  ...qualityRatingData,
                  quality_rating: value as QualityRating
                })}
              >
                <SelectTrigger className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="excellent" className="dark:text-gray-300 dark:focus:bg-gray-700">Excellent</SelectItem>
                  <SelectItem value="good" className="dark:text-gray-300 dark:focus:bg-gray-700">Good</SelectItem>
                  <SelectItem value="average" className="dark:text-gray-300 dark:focus:bg-gray-700">Average</SelectItem>
                  <SelectItem value="poor" className="dark:text-gray-300 dark:focus:bg-gray-700">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality-notes" className="text-gray-700 dark:text-gray-300">Quality Notes</Label>
              <Textarea
                id="quality-notes"
                placeholder="Describe the quality of service..."
                value={qualityRatingData.quality_notes}
                onChange={(e) => setQualityRatingData({
                  ...qualityRatingData,
                  quality_notes: e.target.value
                })}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="performance-notes" className="text-gray-700 dark:text-gray-300">Performance Notes</Label>
              <Textarea
                id="performance-notes"
                placeholder="Notes on service provider performance..."
                value={qualityRatingData.performance_notes}
                onChange={(e) => setQualityRatingData({
                  ...qualityRatingData,
                  performance_notes: e.target.value
                })}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowQualityRatingDialog(false)} className="rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmQualityRate}
              disabled={isSubmitting || !qualityRatingData.quality_rating}
              className="bg-purple-600 hover:bg-purple-700 rounded-xl text-white shadow-lg shadow-purple-600/20 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Star className="h-4 w-4 mr-2" />}
              {isSubmitting ? 'Saving...' : 'Submit Rating'}
            </Button>
          </AlertDialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
