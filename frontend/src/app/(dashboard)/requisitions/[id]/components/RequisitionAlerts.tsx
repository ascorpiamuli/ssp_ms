'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw, XCircle, CheckCircle, Zap, X, FileCheck,
  Users, ShoppingCart, Truck, Receipt, Clock, Activity,
  Sparkles, AlertTriangle, Info, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RequisitionAlertsProps {
  isReturned: boolean;
  isDeclined: boolean;
  isEmergency: boolean;
  isProcurementComplete: boolean;
  hasProcurementStarted: boolean;
  procurementProgress: number;
  currentProcurementStatus: string | null;
  qtnDetails: any;
  quotesCount: number;
  hasSupplierSelected: boolean;
  poDetails: any;
  grnDetails: any;
  paymentDetails: any;
  requisition: any;
}

// Helper to format status label
const formatStatusLabel = (status: string | null): string => {
  if (!status) return 'In Progress';

  const statusMap: Record<string, string> = {
    'initiated': 'Initiated',
    'quotation_in_progress': 'Quotation in Progress',
    'awaiting_quotations': 'Awaiting Quotations',
    'evaluating_quotations': 'Evaluating Quotations',
    'supplier_selected': 'Supplier Selected',
    'goods_receipt_pending': 'Goods Receipt Pending',
    'invoicing_pending': 'Invoicing Pending',
    'payment_pending': 'Payment Pending',
    'completed': 'Completed',
  };

  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const RequisitionAlerts: React.FC<RequisitionAlertsProps> = ({
  isReturned,
  isDeclined,
  isEmergency,
  isProcurementComplete,
  hasProcurementStarted,
  procurementProgress,
  currentProcurementStatus,
  qtnDetails,
  quotesCount,
  hasSupplierSelected,
  poDetails,
  grnDetails,
  paymentDetails,
  requisition,
}) => {
  // Returned Alert
  if (isReturned && !isDeclined) {
    return (
      <Alert className="mb-6 rounded-xl border-amber-500/30 bg-gradient-to-r from-amber-50/90 to-orange-50/90 dark:from-amber-950/30 dark:to-orange-950/30 backdrop-blur-sm shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
            <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2 text-sm font-semibold">
              Returned for Revision
              <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px]">
                <AlertTriangle className="h-3 w-3 mr-0.5" />
                Needs Action
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
              This requisition has been returned for revision. Please review the comments, make necessary changes, and resubmit for approval.
              {requisition?.return_reason && (
                <span className="block mt-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200/50 dark:border-amber-800/50 text-sm">
                  <strong>Reason:</strong> {requisition.return_reason}
                </span>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  // Declined Alert
  if (isDeclined) {
    return (
      <Alert className="mb-6 rounded-xl border-red-500/30 bg-gradient-to-r from-red-50/90 to-rose-50/90 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-red-800 dark:text-red-300 flex items-center gap-2 text-sm font-semibold">
              Requisition Declined
              <Badge variant="destructive" className="text-[10px]">
                <X className="h-3 w-3 mr-0.5" />
                Rejected
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
              This requisition has been declined and cannot be processed further.
              {requisition?.approvals?.find((a: any) => a.status === 'declined')?.decline_reason && (
                <span className="block mt-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-red-200/50 dark:border-red-800/50 text-sm">
                  <strong>Reason:</strong> {requisition.approvals.find((a: any) => a.status === 'declined')?.decline_reason}
                </span>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  // Procurement Status Alert
  if (requisition?.status === 'final_approved' && !isDeclined) {
    const isComplete = isProcurementComplete;
    const isInProgress = hasProcurementStarted && !isComplete;
    const isReady = !hasProcurementStarted && !isComplete;

    const statusLabel = formatStatusLabel(currentProcurementStatus);
    const progressRounded = Math.round(procurementProgress);

    return (
      <Alert className={cn(
        "mb-6 rounded-xl border shadow-md backdrop-blur-sm",
        isComplete ? "border-emerald-500/30 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/30 dark:to-teal-950/30" :
          isInProgress ? "border-blue-500/30 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/30 dark:to-indigo-950/30" :
            "border-emerald-500/30 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/30 dark:to-teal-950/30"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isComplete ? "bg-emerald-100 dark:bg-emerald-900/40" :
              isInProgress ? "bg-blue-100 dark:bg-blue-900/40" :
                "bg-emerald-100 dark:bg-emerald-900/40"
          )}>
            {isComplete ? (
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : isInProgress ? (
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="flex-1">
            <AlertTitle className={cn(
              "flex items-center gap-2 text-sm font-semibold",
              isComplete ? "text-emerald-800 dark:text-emerald-300" :
                isInProgress ? "text-blue-800 dark:text-blue-300" :
                  "text-emerald-800 dark:text-emerald-300"
            )}>
              {isComplete ? (
                <>
                  Procurement Complete
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-0.5" />
                    Success
                  </Badge>
                </>
              ) : isInProgress ? (
                <>
                  Procurement In Progress
                  <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px]">
                    <Activity className="h-3 w-3 mr-0.5" />
                    {progressRounded}%
                  </Badge>
                  <Badge className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[10px]">
                    <Clock className="h-3 w-3 mr-0.5" />
                    {statusLabel}
                  </Badge>
                </>
              ) : (
                <>
                  Approved - Ready for Procurement
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                    <CheckCircle className="h-3 w-3 mr-0.5" />
                    Ready
                  </Badge>
                </>
              )}
            </AlertTitle>
            <AlertDescription className={cn(
              "text-sm",
              isComplete ? "text-emerald-700 dark:text-emerald-400" :
                isInProgress ? "text-blue-700 dark:text-blue-400" :
                  "text-emerald-700 dark:text-emerald-400"
            )}>
              {isComplete
                ? 'All procurement stages have been completed successfully.'
                : isInProgress
                  ? `Procurement is in progress. Current status: ${statusLabel}.`
                  : 'This requisition has been fully approved and is ready for the procurement process.'}
            </AlertDescription>

            {/* Procurement Details Grid */}
            {(isInProgress || isComplete) && (
              <div className="mt-3 pt-3 border-t border-gray-200/30 dark:border-gray-700/30 grid grid-cols-2 md:grid-cols-4 gap-2">
                {qtnDetails.hasQtn && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                    <FileCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">QTN</p>
                      <p className="text-xs font-semibold truncate">{qtnDetails.number}</p>
                    </div>
                  </div>
                )}
                {quotesCount > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                    <Users className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Quotes</p>
                      <p className="text-xs font-semibold">{quotesCount} received</p>
                    </div>
                  </div>
                )}
                {hasSupplierSelected && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                    <CheckCircle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Supplier</p>
                      <p className="text-xs font-semibold text-green-600">✓ Selected</p>
                    </div>
                  </div>
                )}
                {poDetails.hasPo && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                    <ShoppingCart className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{poDetails.type}</p>
                      <p className="text-xs font-semibold truncate">{poDetails.number}</p>
                    </div>
                  </div>
                )}
                {grnDetails.hasGrn && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                    <Truck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <div>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">GRN</p>
                      <p className="text-xs font-semibold truncate">{grnDetails.number}</p>
                    </div>
                  </div>
                )}
                {paymentDetails.hasPayment && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                    <Receipt className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Payment</p>
                      <p className="text-xs font-semibold truncate">{paymentDetails.number}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Alert>
    );
  }

  // Emergency Alert
  if (isEmergency && requisition?.status !== 'final_approved') {
    return (
      <Alert className="mb-6 rounded-xl border-red-500/30 bg-gradient-to-r from-red-50/90 to-rose-50/90 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 animate-pulse">
            <Zap className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-red-800 dark:text-red-300 flex items-center gap-2 text-sm font-semibold">
              🚨 Emergency Requisition
              <Badge variant="destructive" className="text-[10px] animate-pulse">
                <Zap className="h-3 w-3 mr-0.5" />
                Urgent
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
              This is an emergency requisition. It will follow the fast-track approval process.
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  // Cancelled Alert
  if (requisition?.status === 'cancelled') {
    return (
      <Alert className="mb-6 rounded-xl border-red-500/30 bg-gradient-to-r from-red-50/90 to-rose-50/90 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40">
            <X className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-red-800 dark:text-red-300 flex items-center gap-2 text-sm font-semibold">
              Cancelled
              <Badge variant="destructive" className="text-[10px]">
                <X className="h-3 w-3 mr-0.5" />
                Cancelled
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
              This requisition has been cancelled and cannot be processed further.
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  return null;
};

export default RequisitionAlerts;
