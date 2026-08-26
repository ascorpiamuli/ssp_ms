// frontend/src/app/(dashboard)/requisitions/[id]/page.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, FileText, ShoppingCart, ArrowLeft, Edit, Trash2, Send, RotateCcw, X, Printer, MoreVertical, RefreshCw, CheckCircle, TrendingUp, FileCheck, Zap, AlertCircle } from 'lucide-react';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import { useRequisition, useRequisitionHistory } from '@/hooks/useRequisitionQueries';
import {
  useDeleteRequisition,
  useSubmitRequisition,
  useReturnRequisition,
  useCancelRequisition,
} from '@/hooks/useRequisitionMutations';
import {
  useProcurementStatus,
  useProcurementSummary,
  useProcurementTimeline,
  useProcurementMetrics,
  useStartProcurement,
  useCompleteProcurement,
  useCancelProcurement,
} from '@/hooks/useProcurement';

// Components
import { StatusBadge } from './components/StatusBadge';
import { PriorityBadge } from './components/PriorityBadge';
import { RequisitionAlerts } from './components/RequisitionAlerts';
import { RequisitionSidebar } from './components/RequisitionSidebar';
import { RequisitionOverviewTab } from './components/RequisitionOverviewTab';
import { RequisitionItemsTab } from './components/RequisitionItemsTab';
import { RequisitionApprovalsTab } from './components/RequisitionApprovalsTab';
import { RequisitionProcurementTab } from './components/RequisitionProcurementTab';
import { RequisitionHistoryTab } from './components/RequisitionHistoryTab';

// Dialogs
import { DeleteDialog } from './components/Dialogs/DeleteDialog';
import { SubmitDialog } from './components/Dialogs/SubmitDialog';
import { ReturnDialog } from './components/Dialogs/ReturnDialog';
import { CancelDialog } from './components/Dialogs/CancelDialog';
import { StartProcurementDialog } from './components/Dialogs/StartProcurementDialog';
import { CompleteProcurementDialog } from './components/Dialogs/CompleteProcurementDialog';

// Utils
import { usePermissions } from './utils/permissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

// Dynamically import ProcurementProgress with SSR disabled to fix React error
import dynamic from 'next/dynamic';

const ProcurementProgress = dynamic(
  () => import('./components/ProcurementProgress'),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 bg-muted/20 rounded-xl animate-pulse" />
    )
  }
);

// Stage weights for completion calculation (fallback only)
const STAGE_WEIGHTS: Record<string, number> = {
  'initiated': 10,
  'quotation_in_progress': 25,
  'awaiting_quotations': 30,
  'evaluating_quotations': 45,
  'supplier_selected': 60,
  'goods_receipt_pending': 75,
  'invoicing_pending': 85,
  'payment_pending': 95,
  'completed': 100,
};

// Type guard to safely access nested properties
const safeGet = <T,>(obj: any, path: string, fallback: T): T => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return fallback;
    }
    result = result[key];
  }
  return (result === undefined || result === null) ? fallback : result as T;
};

export default function RequisitionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { user } = useAuthContext();

  // Get user roles
  const userRoles = useMemo(() => {
    const roles: string[] = [];
    if (user?.role) roles.push(user.role.toUpperCase());
    if (user?.roles) {
      user.roles.forEach((r: any) => {
        const roleName = typeof r === 'string' ? r.toUpperCase() : r.name?.toUpperCase();
        if (roleName) roles.push(roleName);
      });
    }
    return roles;
  }, [user]);

  // Queries
  const { data: requisition, isLoading, error, refetch } = useRequisition(id);
  const { data: historyData, isLoading: historyLoading } = useRequisitionHistory(id, { per_page: 50 });

  const isApproved = requisition?.status === 'final_approved';
  const {
    data: procurementStatus,
    isLoading: procurementStatusLoading,
    refetch: refetchProcurementStatus
  } = useProcurementStatus(id, { enabled: !!id && isApproved });

  const { data: procurementSummary, isLoading: procurementSummaryLoading } = useProcurementSummary(id, {
    enabled: !!id && isApproved && procurementStatus?.is_procurement_created === true,
  });

  const { data: procurementTimeline, isLoading: procurementTimelineLoading } = useProcurementTimeline(id, {
    enabled: !!id && isApproved && procurementStatus?.is_procurement_created === true,
  });

  const { data: procurementMetrics, isLoading: procurementMetricsLoading } = useProcurementMetrics(id, {
    enabled: !!id && isApproved && procurementStatus?.is_procurement_created === true,
  });

  // Mutations
  const { mutate: deleteRequisition } = useDeleteRequisition();
  const { mutate: submitRequisition } = useSubmitRequisition();
  const { mutate: returnRequisition } = useReturnRequisition();
  const { mutate: cancelRequisition } = useCancelRequisition();
  const { mutate: startProcurement, isPending: isStartingProcurement } = useStartProcurement();
  const { mutate: completeProcurement, isPending: isCompletingProcurement } = useCompleteProcurement();
  const { mutate: cancelProcurement, isPending: isCancellingProcurement } = useCancelProcurement();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showStartProcurementDialog, setShowStartProcurementDialog] = useState(false);
  const [showCompleteProcurementDialog, setShowCompleteProcurementDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Derived State - USING BACKEND DATA DIRECTLY with safe access
  const hasProcurementStarted = useMemo(() => {
    if ((procurementStatus as any)?.is_procurement_created === true) return true;
    if (requisition?.is_procurement_created === true) return true;
    if (requisition?.procurement_created_at) return true;
    return false;
  }, [procurementStatus, requisition]);

  const isProcurementComplete = useMemo(() => {
    // Use backend status from procurementStatus with type assertion
    const status = procurementStatus as any;
    if (status?.is_completed === true) return true;
    if (status?.current_status === 'completed') return true;
    // Check procurement summary
    const summary = procurementSummary as any;
    if (summary?.procurement?.is_completed === true) return true;
    if (requisition?.status === 'procurement_completed' as any) return true;
    return false;
  }, [procurementStatus, procurementSummary, requisition]);

  const currentProcurementStatus = useMemo(() => {
    // Use backend status directly from procurementStatus with type assertion
    const status = procurementStatus as any;
    if (status?.current_status) return status.current_status;
    const summary = procurementSummary as any;
    if (summary?.procurement?.status) return summary.procurement.status;
    if (requisition?.metadata?.procurement_status) return requisition.metadata.procurement_status;
    return null;
  }, [procurementStatus, procurementSummary, requisition]);

  // Use backend steps from procurementSummary with type assertion
  const steps = useMemo(() => {
    const summary = procurementSummary as any;
    return summary?.procurement?.steps || {};
  }, [procurementSummary]);

  // Use backend metrics directly with type assertion
  const metrics = useMemo(() => {
    return procurementMetrics as any || {};
  }, [procurementMetrics]);

  // Use backend completion rate as progress
  const procurementProgress = useMemo(() => {
    if (isProcurementComplete) return 100;
    if (!hasProcurementStarted) return 0;

    // Use backend metrics completion_rate
    if (metrics?.completion_rate !== undefined && metrics.completion_rate !== null) {
      return Math.min(Math.max(metrics.completion_rate, 0), 100);
    }

    // Fallback to status-based if metrics not available
    if (currentProcurementStatus && STAGE_WEIGHTS[currentProcurementStatus]) {
      return STAGE_WEIGHTS[currentProcurementStatus];
    }

    return 0;
  }, [isProcurementComplete, hasProcurementStarted, metrics, currentProcurementStatus]);

  // Get qtn details from backend steps
  const qtnDetails = useMemo(() => {
    const stepQuotation = steps?.quotation;
    if (stepQuotation) {
      return {
        status: stepQuotation.status || 'active',
        number: stepQuotation.qtn_number || null,
        created_at: stepQuotation.created_at || null,
        hasQtn: !!stepQuotation.qtn_number,
      };
    }
    if (requisition?.metadata?.qtn_number) {
      return {
        status: requisition.metadata.qtn_status || 'generated',
        number: requisition.metadata.qtn_number,
        created_at: requisition.metadata.qtn_created_at,
        hasQtn: true,
      };
    }
    return { hasQtn: false };
  }, [steps, requisition]);

  // Get PO details from backend steps - handle different property names
  const poDetails = useMemo(() => {
    // Try po_generation first (from procurementSummary)
    const stepPo = steps?.po_generation || steps?.purchase_order;
    if (stepPo && stepPo.po_number) {
      return {
        status: stepPo.status || 'generated',
        number: stepPo.po_number,
        type: stepPo.po_type || stepPo.type || 'LPO',
        created_at: stepPo.created_at || null,
        hasPo: true,
      };
    }
    if (requisition?.metadata?.lpo_number) {
      return {
        status: 'generated',
        number: requisition.metadata.lpo_number,
        type: requisition.metadata.lpo_type || 'LPO',
        created_at: requisition.metadata.lpo_created_at,
        hasPo: true,
      };
    }
    return { hasPo: false };
  }, [steps, requisition]);

  // Get GRN details from backend steps - handle different property names
  const grnDetails = useMemo(() => {
    // Try delivery first (from procurementSummary)
    const stepDelivery = steps?.delivery || steps?.goods_received;
    if (stepDelivery && stepDelivery.grn_number) {
      return {
        status: stepDelivery.status || 'generated',
        number: stepDelivery.grn_number,
        created_at: stepDelivery.created_at || null,
        hasGrn: true,
      };
    }
    if (requisition?.metadata?.grn_number) {
      return {
        status: 'generated',
        number: requisition.metadata.grn_number,
        created_at: requisition.metadata.grn_created_at,
        hasGrn: true,
      };
    }
    return { hasGrn: false };
  }, [steps, requisition]);

  // Get payment details from backend steps
  const paymentDetails = useMemo(() => {
    const stepPayment = steps?.payment;
    if (stepPayment && stepPayment.voucher_number) {
      return {
        status: stepPayment.status || 'generated',
        number: stepPayment.voucher_number,
        created_at: stepPayment.created_at || null,
        hasPayment: true,
      };
    }
    if (requisition?.metadata?.payment_voucher_number) {
      return {
        status: 'generated',
        number: requisition.metadata.payment_voucher_number,
        created_at: requisition.metadata.payment_created_at,
        hasPayment: true,
      };
    }
    return { hasPayment: false };
  }, [steps, requisition]);

  // Get supplier selected from backend - handle different property names
  const hasSupplierSelected = useMemo(() => {
    const selection = steps?.supplier_selection;
    if (selection?.status === 'completed') return true;
    if (selection?.selected_supplier_id) return true;
    const status = procurementStatus as any;
    if (status?.current_status === 'supplier_selected') return true;
    if (requisition?.metadata?.supplier_selected === true) return true;
    return false;
  }, [steps, procurementStatus, requisition]);

  // Get quotes count from backend
  const quotesCount = useMemo(() => {
    const quotations = steps?.supplier_quotations;
    if (quotations?.quotes_received) {
      return quotations.quotes_received;
    }
    if (metrics?.total_quotes !== undefined) {
      return metrics.total_quotes;
    }
    if (requisition?.metadata?.quotes_received_count) {
      return requisition.metadata.quotes_received_count;
    }
    return 0;
  }, [steps, metrics, requisition]);

  // Permissions
  const permissions = usePermissions(requisition, user, userRoles);
  const { isDeclined, isReturned, isEmergency, canEdit, canSubmit, canCancel, canDelete, canReturn, canViewProcurement } = permissions;

  const canStartProcurement = useMemo(() => {
    if (!requisition) return false;
    if (!canViewProcurement) return false;
    if (requisition.status !== 'final_approved') return false;
    if (isDeclined) return false;
    if (hasProcurementStarted) return false;
    if (isProcurementComplete) return false;
    return true;
  }, [requisition, canViewProcurement, isDeclined, hasProcurementStarted, isProcurementComplete]);

  const canCompleteProcurement = useMemo(() => {
    if (!requisition) return false;
    if (!canViewProcurement) return false;
    if (!hasProcurementStarted) return false;
    if (isProcurementComplete) return false;
    // Check if all required steps are complete based on backend status
    if (paymentDetails.hasPayment && paymentDetails.status === 'completed') return true;
    if (poDetails.hasPo && grnDetails.hasGrn) return true;
    if (qtnDetails.hasQtn && quotesCount > 0 && hasSupplierSelected && poDetails.hasPo && grnDetails.hasGrn) {
      return true;
    }
    return false;
  }, [requisition, canViewProcurement, hasProcurementStarted, isProcurementComplete, paymentDetails, poDetails, grnDetails, qtnDetails, quotesCount, hasSupplierSelected]);

  const canCancelProcurement = useMemo(() => {
    if (!requisition) return false;
    if (!canViewProcurement) return false;
    if (!hasProcurementStarted) return false;
    if (isProcurementComplete) return false;
    return true;
  }, [requisition, canViewProcurement, hasProcurementStarted, isProcurementComplete]);

  const canContinueProcurement = useMemo(() => {
    if (!requisition) return false;
    if (!canViewProcurement) return false;
    if (!hasProcurementStarted) return false;
    if (isProcurementComplete) return false;
    return true;
  }, [requisition, canViewProcurement, hasProcurementStarted, isProcurementComplete]);

  // Derived Data
  const totalItems = requisition?.items?.length || 0;
  const totalApprovals = requisition?.approvals?.length || 0;
  const pendingApprovals = requisition?.approvals?.filter((a: any) => a.status === 'pending') || [];
  const historyItems = useMemo(() => {
    if (!historyData) return [];
    if (historyData.data && Array.isArray(historyData.data)) return historyData.data;
    if (Array.isArray(historyData)) return historyData;
    return [];
  }, [historyData]);

  // Handlers
  const handleBack = () => router.push('/requisitions/manage');
  const handleEdit = () => router.push(`/requisitions/${id}/edit`);
  const handleDelete = () => setShowDeleteDialog(true);
  const handleSubmit = () => { setShowSubmitDialog(true); setComment(''); };
  const handleReturn = () => { setShowReturnDialog(true); setComment(''); };
  const handleCancelRequisition = () => { setShowCancelDialog(true); setComment(''); };
  const handlePrint = () => window.print();
  const handleStartProcurement = () => { setShowStartProcurementDialog(true); setComment(''); };
  const handleCompleteProcurement = () => { setShowCompleteProcurementDialog(true); setComment(''); };
  const handleNavigateToProcurement = () => router.push(`/procurement`);
  const handleRefresh = () => { refetch(); refetchProcurementStatus(); };

  const handleConfirmDelete = () => {
    if (requisition) {
      deleteRequisition(requisition.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          router.push('/requisitions/manage');
        },
      });
    }
  };

  const handleConfirmSubmit = () => {
    if (requisition) {
      submitRequisition({
        id: requisition.id,
        data: { comment: comment || undefined },
      }, {
        onSuccess: () => {
          setShowSubmitDialog(false);
          refetch();
        },
      });
    }
  };

  const handleConfirmReturn = () => {
    if (requisition) {
      returnRequisition({
        id: requisition.id,
        data: { reason: comment || 'Returned for revision' },
      }, {
        onSuccess: () => {
          setShowReturnDialog(false);
          refetch();
        },
      });
    }
  };

  const handleConfirmCancel = () => {
    if (requisition) {
      if (hasProcurementStarted && !isProcurementComplete) {
        cancelProcurement({
          requisition_id: requisition.id,
          reason: comment || 'Cancelled by user',
        }, {
          onSuccess: () => {
            setShowCancelDialog(false);
            refetch();
            refetchProcurementStatus();
          },
        });
      } else {
        cancelRequisition({
          id: requisition.id,
          data: { reason: comment || 'Cancelled by user' },
        }, {
          onSuccess: () => {
            setShowCancelDialog(false);
            refetch();
          },
        });
      }
    }
  };

  const handleConfirmStartProcurement = () => {
    if (requisition) {
      startProcurement({
        requisition_id: requisition.id,
      }, {
        onSuccess: () => {
          setShowStartProcurementDialog(false);
          refetch();
          refetchProcurementStatus();
        },
      });
    }
  };

  const handleConfirmCompleteProcurement = () => {
    if (requisition) {
      completeProcurement(requisition.id, {
        onSuccess: () => {
          setShowCompleteProcurementDialog(false);
          refetch();
          refetchProcurementStatus();
        },
      });
    }
  };

  // Loading State
  const isLoadingOverall = isLoading || procurementStatusLoading || procurementSummaryLoading || procurementTimelineLoading || procurementMetricsLoading;

  if (isLoadingOverall) {
    return (
      <PageTemplate
        title="Requisition Details"
        description="Loading requisition information..."
        icon={<FileText className="h-5 w-5 text-primary" />}
        background="gradient"
        variant="default"
      >
        <div className="space-y-6">
          <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-64 rounded-xl" />
                <Skeleton className="h-4 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-32 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }

  // Error State
  if (error || !requisition) {
    return (
      <PageTemplate
        title="Requisition Details"
        description="Error loading requisition"
        icon={<FileText className="h-5 w-5 text-primary" />}
        background="gradient"
        variant="full"
      >
        <div className="space-y-6">
          <Alert variant="destructive" className="max-w-2xl mx-auto rounded-xl border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Requisition</AlertTitle>
            <AlertDescription>
              We couldn't load the requisition details. Please try again or go back to the requisitions list.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={handleRefresh} className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" onClick={handleBack} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <>
      <PageTemplate
        title={`Requisition: ${requisition.reference_number}`}
        description={`${requisition.title} - ${requisition.department?.name || 'No Department'}`}
        icon={<FileText className="h-5 w-5 text-primary" />}
        background="gradient"
        variant="full"
        breadcrumbs={[
          { label: 'Requisitions', href: '/requisitions' },
          { label: requisition.reference_number || 'Details' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {isReturned && (
              <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 flex items-center gap-1.5 font-medium shadow-sm h-8 px-3 text-sm rounded-full">
                <RotateCcw className="h-3.5 w-3.5" />
                Returned
              </Badge>
            )}

            {requisition?.status === 'final_approved' && !isDeclined && (
              <Badge className={cn(
                "h-8 px-3 text-sm font-medium rounded-full",
                isProcurementComplete ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" :
                  hasProcurementStarted ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" :
                    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
              )}>
                {isProcurementComplete ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Complete
                  </>
                ) : hasProcurementStarted ? (
                  <>
                    <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                    {Math.round(procurementProgress)}%
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    Ready
                  </>
                )}
              </Badge>
            )}

            {qtnDetails.hasQtn && (
              <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 font-medium shadow-sm h-8 px-3 text-sm rounded-full">
                <FileCheck className="h-3.5 w-3.5 mr-1.5" />
                QTN: {qtnDetails.number}
              </Badge>
            )}

            {isEmergency && (
              <Badge variant="destructive" className="h-8 px-3 text-sm font-medium animate-pulse rounded-full">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Emergency
              </Badge>
            )}

            <StatusBadge status={requisition?.status} size="sm" />
            <PriorityBadge priority={requisition?.priority} />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800">
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print this requisition</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800" disabled={isLoadingOverall}>
                    <RefreshCw className={cn("h-4 w-4", isLoadingOverall && "animate-spin")} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh requisition data</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800">
                  <MoreVertical className="h-4 w-4" />
                  <span className="hidden sm:inline">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 dark:bg-gray-900 dark:border-gray-700">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-gray-700" />
                {canEdit && (
                  <DropdownMenuItem onClick={handleEdit} className="dark:hover:bg-gray-800">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Requisition
                  </DropdownMenuItem>
                )}
                {canSubmit && (
                  <DropdownMenuItem onClick={handleSubmit} className="text-emerald-600 dark:hover:bg-gray-800">
                    <Send className="h-4 w-4 mr-2" />
                    {isReturned ? 'Resubmit for Approval' : 'Submit for Approval'}
                  </DropdownMenuItem>
                )}
                {canReturn && (
                  <DropdownMenuItem onClick={handleReturn} className="text-amber-600 dark:hover:bg-gray-800">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return for Revision
                  </DropdownMenuItem>
                )}
                {canCancel && (
                  <DropdownMenuItem onClick={handleCancelRequisition} className="text-red-600 dark:hover:bg-gray-800">
                    <X className="h-4 w-4 mr-2" />
                    Cancel Requisition
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:hover:bg-gray-800">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Requisition
                    </DropdownMenuItem>
                  </>
                )}
                {requisition?.status === 'final_approved' && !isDeclined && canViewProcurement && (
                  <>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    {canStartProcurement && (
                      <DropdownMenuItem onClick={handleStartProcurement} className="text-blue-600 dark:hover:bg-gray-800">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Start Procurement
                      </DropdownMenuItem>
                    )}
                    {canContinueProcurement && (
                      <DropdownMenuItem onClick={handleNavigateToProcurement} className={cn(isProcurementComplete ? "text-emerald-600" : "text-blue-600", "dark:hover:bg-gray-800")}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {isProcurementComplete ? 'View Procurement' : 'Continue Procurement'}
                      </DropdownMenuItem>
                    )}
                    {canCompleteProcurement && (
                      <DropdownMenuItem onClick={handleCompleteProcurement} className="text-emerald-600 dark:hover:bg-gray-800">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Procurement
                      </DropdownMenuItem>
                    )}
                    {canCancelProcurement && (
                      <DropdownMenuItem onClick={() => { setShowCancelDialog(true); setComment(''); }} className="text-red-600 dark:hover:bg-gray-800">
                        <X className="h-4 w-4 mr-2" />
                        Cancel Procurement
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {isDeclined && (
                  <DropdownMenuItem disabled className="text-red-400 cursor-not-allowed dark:hover:bg-gray-800">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Requisition Declined
                  </DropdownMenuItem>
                )}
                {isReturned && !isDeclined && (
                  <DropdownMenuItem disabled className="text-amber-400 cursor-not-allowed dark:hover:bg-gray-800">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Returned - Needs Revision
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="default" size="sm" onClick={handleBack} className="gap-2 h-9 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <ProcurementProgress
            hasProcurementStarted={hasProcurementStarted}
            isProcurementComplete={isProcurementComplete}
            procurementProgress={procurementProgress}
            currentProcurementStatus={currentProcurementStatus}
            quotesCount={quotesCount}
            qtnDetails={qtnDetails}
            steps={steps}
          />

          <div>
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-muted/50 p-1 h-auto rounded-xl">
                  <TabsTrigger value="overview" className="flex-1 gap-2 data-[state=active]:bg-background py-2.5 rounded-lg">
                    <FileText className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="items" className="flex-1 gap-2 data-[state=active]:bg-background py-2.5 rounded-lg">
                    <ShoppingCart className="h-4 w-4" />
                    Items ({totalItems})
                  </TabsTrigger>
                  <TabsTrigger value="approvals" className="flex-1 gap-2 data-[state=active]:bg-background py-2.5 rounded-lg">
                    <ShoppingCart className="h-4 w-4" />
                    Approvals ({totalApprovals})
                  </TabsTrigger>
                  <TabsTrigger value="procurement" className="flex-1 gap-2 data-[state=active]:bg-background py-2.5 rounded-lg">
                    <ShoppingCart className="h-4 w-4" />
                    Procurement
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1 gap-2 data-[state=active]:bg-background py-2.5 rounded-lg">
                    <ShoppingCart className="h-4 w-4" />
                    History ({historyItems.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <RequisitionOverviewTab
                    requisition={requisition}
                    isDeclined={isDeclined}
                    isReturned={isReturned}
                    isEmergency={isEmergency}
                    isProcurementComplete={isProcurementComplete}
                    hasProcurementStarted={hasProcurementStarted}
                    procurementProgress={procurementProgress}
                    currentProcurementStatus={currentProcurementStatus}
                    qtnDetails={qtnDetails}
                    hasSupplierSelected={hasSupplierSelected}
                    poDetails={poDetails}
                    grnDetails={grnDetails}
                    paymentDetails={paymentDetails}
                    quotesCount={quotesCount}
                    totalItems={totalItems}
                    totalApprovals={totalApprovals}
                    pendingApprovals={pendingApprovals}
                  />
                </TabsContent>

                <TabsContent value="items" className="mt-4">
                  <RequisitionItemsTab
                    requisition={requisition}
                    isDeclined={isDeclined}
                    isReturned={isReturned}
                    isEmergency={isEmergency}
                    expandedRows={expandedRows}
                    toggleRow={(id: number) => {
                      setExpandedRows(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(id)) newSet.delete(id);
                        else newSet.add(id);
                        return newSet;
                      });
                    }}
                  />
                </TabsContent>

                <TabsContent value="approvals" className="mt-4">
                  <RequisitionApprovalsTab
                    requisition={requisition}
                    isDeclined={isDeclined}
                    isReturned={isReturned}
                    isEmergency={isEmergency}
                  />
                </TabsContent>

                <TabsContent value="procurement" className="mt-4">
                  <RequisitionProcurementTab
                    requisition={requisition}
                    isDeclined={isDeclined}
                    isReturned={isReturned}
                    isEmergency={isEmergency}
                    isProcurementComplete={isProcurementComplete}
                    hasProcurementStarted={hasProcurementStarted}
                    procurementProgress={procurementProgress}
                    currentProcurementStatus={currentProcurementStatus}
                    qtnDetails={qtnDetails}
                    poDetails={poDetails}
                    grnDetails={grnDetails}
                    paymentDetails={paymentDetails}
                    hasSupplierSelected={hasSupplierSelected}
                    quotesCount={quotesCount}
                    procurementSummary={procurementSummary}
                    procurementTimeline={procurementTimeline || []}
                    canViewProcurement={canViewProcurement}
                    canStartProcurement={canStartProcurement}
                    canContinueProcurement={canContinueProcurement}
                    canCompleteProcurement={canCompleteProcurement}
                    canCancelProcurement={canCancelProcurement}
                    isStartingProcurement={isStartingProcurement}
                    isCompletingProcurement={isCompletingProcurement}
                    isCancellingProcurement={isCancellingProcurement}
                    onStartProcurement={handleStartProcurement}
                    onCompleteProcurement={handleCompleteProcurement}
                    onNavigateToProcurement={handleNavigateToProcurement}
                    onCancelProcurement={() => {
                      setShowCancelDialog(true);
                      setComment('');
                    }}
                  />
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <RequisitionHistoryTab
                    historyItems={historyItems}
                    historyLoading={historyLoading}
                    isReturned={isReturned}
                    isEmergency={isEmergency}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </PageTemplate>

      {/* Dialogs */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        requisition={requisition}
        onConfirm={handleConfirmDelete}
      />

      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        requisition={requisition}
        comment={comment}
        setComment={setComment}
        isReturned={isReturned}
        isEmergency={isEmergency}
        onConfirm={handleConfirmSubmit}
      />

      <ReturnDialog
        open={showReturnDialog}
        onOpenChange={setShowReturnDialog}
        requisition={requisition}
        comment={comment}
        setComment={setComment}
        onConfirm={handleConfirmReturn}
      />

      <CancelDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        requisition={requisition}
        comment={comment}
        setComment={setComment}
        hasProcurementStarted={hasProcurementStarted}
        isProcurementComplete={isProcurementComplete}
        onConfirm={handleConfirmCancel}
      />

      <StartProcurementDialog
        open={showStartProcurementDialog}
        onOpenChange={setShowStartProcurementDialog}
        requisition={requisition}
        comment={comment}
        setComment={setComment}
        onConfirm={handleConfirmStartProcurement}
      />

      <CompleteProcurementDialog
        open={showCompleteProcurementDialog}
        onOpenChange={setShowCompleteProcurementDialog}
        requisition={requisition}
        comment={comment}
        setComment={setComment}
        onConfirm={handleConfirmCompleteProcurement}
      />
    </>
  );
}
