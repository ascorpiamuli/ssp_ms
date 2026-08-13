// frontend/src/app/(dashboard)/requisitions/[id]/components/RequisitionProcurementTab.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart, CheckCircle, XCircle, Loader2, Clock,
  FileCheck, Users, Truck, Receipt, Layers, History,
  ArrowRight, Circle, Zap, RotateCcw, AlertTriangle,
  DollarSign, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Helper functions
const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(numAmount);
};

const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

// History action config
const HISTORY_ACTION_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  procurement_started: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: ShoppingCart, label: 'Procurement Started' },
  procurement_completed: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle, label: 'Procurement Completed' },
  procurement_cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Procurement Cancelled' },
  qtn_generated: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: FileCheck, label: 'QTN Generated' },
  qtn_sent: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: FileCheck, label: 'QTN Sent' },
  quotation_submitted: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Users, label: 'Quotation Submitted' },
  qtn_closed: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: CheckCircle, label: 'QTN Closed' },
};

export interface RequisitionProcurementTabProps {
  requisition: any;
  isDeclined: boolean;
  isReturned: boolean;
  isEmergency: boolean;
  isProcurementComplete: boolean;
  hasProcurementStarted: boolean;
  procurementProgress: number;
  currentProcurementStatus: string | null;
  qtnDetails: any;
  poDetails: any;
  grnDetails: any;
  paymentDetails: any;
  hasSupplierSelected: boolean;
  quotesCount: number;
  procurementSummary: any;
  procurementTimeline: any[];
  canViewProcurement: boolean;
  canStartProcurement: boolean;
  canContinueProcurement: boolean;
  canCompleteProcurement: boolean;
  canCancelProcurement: boolean;
  isStartingProcurement: boolean;
  isCompletingProcurement: boolean;
  isCancellingProcurement: boolean;
  onStartProcurement: () => void;
  onCompleteProcurement: () => void;
  onNavigateToProcurement: () => void;
  onCancelProcurement: () => void;
}

// Helper to get stage status
const getStageStatus = (status: string): 'completed' | 'in_progress' | 'waiting' => {
  switch (status) {
    case 'completed':
    case 'complete':
      return 'completed';
    case 'in_progress':
    case 'active':
      return 'in_progress';
    case 'waiting':
    case 'pending':
    default:
      return 'waiting';
  }
};

export const RequisitionProcurementTab: React.FC<RequisitionProcurementTabProps> = ({
  requisition,
  isDeclined,
  isReturned,
  isEmergency,
  isProcurementComplete,
  hasProcurementStarted,
  procurementProgress,
  currentProcurementStatus,
  qtnDetails,
  poDetails,
  grnDetails,
  paymentDetails,
  hasSupplierSelected,
  quotesCount,
  procurementSummary,
  procurementTimeline,
  canViewProcurement,
  canStartProcurement,
  canContinueProcurement,
  canCompleteProcurement,
  canCancelProcurement,
  isStartingProcurement,
  isCompletingProcurement,
  isCancellingProcurement,
  onStartProcurement,
  onCompleteProcurement,
  onNavigateToProcurement,
  onCancelProcurement,
}) => {
  // Only show if requisition is approved or has procurement started
  if (requisition?.status !== 'final_approved' && !hasProcurementStarted) {
    return (
      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Procurement Not Available</h3>
            <p className="text-sm text-muted-foreground">
              This requisition must be fully approved before procurement can begin.
            </p>
            <Badge variant="outline" className="mt-4 rounded-full">
              Status: {requisition?.status_label || requisition?.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get steps from procurementSummary
  const steps = procurementSummary?.procurement?.steps || {};

  // Define stages with proper status from API
  const stages = [
    {
      id: 'qtn',
      label: 'Quotation Request (QTN)',
      icon: FileCheck,
      status: qtnDetails.hasQtn ? 'completed' : 'in_progress',
      description: 'Generate and send QTN to suppliers',
      details: qtnDetails.hasQtn ? (
        <div className="mt-1 text-xs space-y-0.5">
          <p className="text-indigo-600 dark:text-indigo-400">Number: {qtnDetails.number}</p>
          <p className="text-indigo-600 dark:text-indigo-400">Status: {qtnDetails.status || 'Active'}</p>
        </div>
      ) : null,
      step: steps.quotation,
    },
    {
      id: 'supplier_quotations',
      label: 'Supplier Quotations',
      icon: Users,
      status: steps.supplier_quotations?.status || (quotesCount > 0 ? 'completed' : 'in_progress'),
      description: 'Receive and review supplier quotations',
      details: quotesCount > 0 ? (
        <div className="mt-1 text-xs">
          <p className="text-green-600 dark:text-green-400">{quotesCount} quote{quotesCount > 1 ? 's' : ''} received</p>
          {steps.supplier_quotations?.quotes_reviewed > 0 && (
            <p className="text-blue-600 dark:text-blue-400">{steps.supplier_quotations.quotes_reviewed} reviewed</p>
          )}
        </div>
      ) : null,
      step: steps.supplier_quotations,
    },
    {
      id: 'supplier_selection',
      label: 'Supplier Selection',
      icon: CheckCircle,
      status: steps.supplier_selection?.status || (hasSupplierSelected ? 'completed' : 'in_progress'),
      description: 'Select the best supplier',
      details: hasSupplierSelected ? (
        <div className="mt-1 text-xs">
          <p className="text-purple-600 dark:text-purple-400">✓ Supplier selected</p>
        </div>
      ) : null,
      step: steps.supplier_selection,
    },
    {
      id: 'po_generation',
      label: 'LPO/LSO Generation',
      icon: ShoppingCart,
      status: steps.po_generation?.status || (poDetails.hasPo ? 'completed' : 'waiting'),
      description: 'Generate purchase/service order',
      details: poDetails.hasPo ? (
        <div className="mt-1 text-xs space-y-0.5">
          <p className="text-blue-600 dark:text-blue-400">{poDetails.type}: {poDetails.number}</p>
        </div>
      ) : null,
      step: steps.po_generation,
    },
    {
      id: 'delivery',
      label: 'Delivery / Service',
      icon: Truck,
      status: steps.delivery?.status || (grnDetails.hasGrn ? 'completed' : 'waiting'),
      description: 'Receive goods or acknowledge service',
      details: grnDetails.hasGrn ? (
        <div className="mt-1 text-xs space-y-0.5">
          <p className="text-teal-600 dark:text-teal-400">GRN: {grnDetails.number}</p>
        </div>
      ) : null,
      step: steps.delivery,
    },
    {
      id: 'payment',
      label: 'Payment Processing',
      icon: Receipt,
      status: steps.payment?.status || (paymentDetails.hasPayment ? 'completed' : 'waiting'),
      description: 'Process payment and issue cheque',
      details: paymentDetails.hasPayment ? (
        <div className="mt-1 text-xs space-y-0.5">
          <p className="text-amber-600 dark:text-amber-400">Voucher: {paymentDetails.number}</p>
        </div>
      ) : null,
      step: steps.payment,
    },
  ];

  const getStatusBadge = (status: string) => {
    const stageStatus = getStageStatus(status);
    switch (stageStatus) {
      case 'completed':
        return { label: 'Complete', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'waiting':
      default:
        return { label: 'Waiting', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
    }
  };

  const getStatusIcon = (status: string) => {
    const stageStatus = getStageStatus(status);
    switch (stageStatus) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Loader2;
      case 'waiting':
      default:
        return Circle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Procurement Status Card */}
      <Card className={cn(
        "border-0 shadow-lg rounded-2xl",
        isProcurementComplete ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20" :
          hasProcurementStarted ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20" :
            "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                isProcurementComplete ? "bg-emerald-100 dark:bg-emerald-900/30" :
                  hasProcurementStarted ? "bg-blue-100 dark:bg-blue-900/30" :
                    "bg-blue-100 dark:bg-blue-900/30"
              )}>
                <ShoppingCart className={cn(
                  "h-8 w-8",
                  isProcurementComplete ? "text-emerald-600 dark:text-emerald-400" :
                    hasProcurementStarted ? "text-blue-600 dark:text-blue-400" :
                      "text-blue-600 dark:text-blue-400"
                )} />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {isProcurementComplete ? 'Procurement Complete' :
                    hasProcurementStarted ? `Procurement In Progress (${Math.round(procurementProgress)}%)` :
                      'Ready for Procurement'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isProcurementComplete ? 'All procurement stages have been completed successfully.' :
                    hasProcurementStarted ? `Current status: ${currentProcurementStatus || 'In Progress'}.` :
                      'Start the procurement process for this approved requisition.'}
                </p>
                {qtnDetails.hasQtn && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                    <FileCheck className="h-4 w-4" />
                    QTN: {qtnDetails.number} ({qtnDetails.status || 'Active'})
                    {qtnDetails.created_at && ` • ${formatDate(qtnDetails.created_at)}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {canStartProcurement && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl"
                  onClick={onStartProcurement}
                  disabled={isStartingProcurement}
                >
                  {isStartingProcurement ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  Start Procurement
                </Button>
              )}
              {canContinueProcurement && (
                <Button
                  className={cn(
                    "shadow-sm text-white rounded-xl",
                    isProcurementComplete ? "bg-emerald-600 hover:bg-emerald-700" :
                      "bg-blue-600 hover:bg-blue-700"
                  )}
                  onClick={onNavigateToProcurement}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isProcurementComplete ? 'View Procurement' : 'Continue Procurement'}
                </Button>
              )}
              {canCompleteProcurement && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl"
                  onClick={onCompleteProcurement}
                  disabled={isCompletingProcurement}
                >
                  {isCompletingProcurement ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Complete
                </Button>
              )}
              {canCancelProcurement && (
                <Button
                  variant="destructive"
                  className="rounded-xl"
                  onClick={onCancelProcurement}
                  disabled={isCancellingProcurement}
                >
                  {isCancellingProcurement ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {(hasProcurementStarted || isProcurementComplete) && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{Math.round(procurementProgress)}%</span>
              </div>
              <div className="relative h-2.5 w-full bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isProcurementComplete ? "bg-emerald-600 dark:bg-emerald-400" :
                      "bg-blue-600 dark:bg-blue-400"
                  )}
                  style={{ width: `${procurementProgress}%` }}
                />
              </div>
              {procurementSummary?.metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      quotesCount > 0 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                    )} />
                    <span className="text-muted-foreground">Quotes: {quotesCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      hasSupplierSelected ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                    )} />
                    <span className="text-muted-foreground">Supplier: {hasSupplierSelected ? 'Selected' : 'Pending'}</span>
                  </div>
                  {procurementSummary.metrics?.total_amount_saved && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Saved: {formatCurrency(procurementSummary.metrics.total_amount_saved)}</span>
                    </div>
                  )}
                  {procurementSummary.metrics?.total_amount_spent && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Spent: {formatCurrency(procurementSummary.metrics.total_amount_spent)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Procurement Stages */}
      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            Procurement Stages
          </CardTitle>
          <CardDescription>
            {hasProcurementStarted
              ? 'Track the progress of each stage in the procurement workflow'
              : requisition?.status === 'final_approved'
                ? 'Ready to start procurement'
                : 'Awaiting approval to start procurement'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const StageIcon = stage.icon;
              const statusBadge = getStatusBadge(stage.status);
              const StatusIcon = getStatusIcon(stage.status);
              const isActive = stage.status === 'in_progress';
              const isCompleted = stage.status === 'completed';
              const isWaiting = stage.status === 'waiting';

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border transition-all",
                    isActive ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-sm" :
                      isCompleted ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" :
                        hasProcurementStarted ? "bg-muted/30 border-muted/50 opacity-60" :
                          "bg-muted/30 border-muted/50 opacity-60"
                  )}>
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                      isActive ? "bg-blue-500 text-white animate-pulse" :
                        isCompleted ? "bg-emerald-500 text-white" :
                          "bg-muted/50 text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : isActive ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <StageIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={cn(
                          "font-medium",
                          isActive ? "text-blue-700 dark:text-blue-300" :
                            isCompleted ? "text-emerald-700 dark:text-emerald-300" :
                              "text-muted-foreground"
                        )}>
                          {stage.label}
                        </h4>
                        <Badge className={cn(
                          "text-xs rounded-full",
                          statusBadge.color
                        )}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{stage.description}</p>
                      {stage.details}
                      {isActive && hasProcurementStarted && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30 rounded-xl"
                          onClick={onNavigateToProcurement}
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Continue to {stage.label}
                        </Button>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {isActive ? (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Procurement Timeline */}
      {hasProcurementStarted && procurementTimeline && procurementTimeline.length > 0 && (
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Procurement Timeline
            </CardTitle>
            <CardDescription>
              Key events in the procurement process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l-2 border-muted space-y-4">
              {procurementTimeline.map((item: any, index: number) => {
                const config = HISTORY_ACTION_CONFIG[item.action] || {
                  color: 'bg-muted/50 text-muted-foreground border-muted',
                  icon: Clock,
                  label: item.action_label || item.action,
                };
                const Icon = config.icon;

                return (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <div className={cn(
                      "absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm",
                      config.color.split(' ')[0]
                    )}>
                      <div className="absolute inset-0 rounded-full bg-current opacity-20" />
                    </div>
                    <div className="bg-card rounded-xl p-4 border hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("text-xs font-medium rounded-full", config.color)}>
                              <Icon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                            {item.comment && (
                              <p className="text-sm text-card-foreground mt-1">{item.comment}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs font-medium text-muted-foreground">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RequisitionProcurementTab;
