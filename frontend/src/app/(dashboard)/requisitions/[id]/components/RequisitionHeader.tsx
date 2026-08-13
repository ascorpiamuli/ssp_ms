'use client';

import React from 'react';
import {
  ArrowLeft, Edit, Trash2, Send, RotateCcw, X, FileText,
  Printer, MoreVertical, RefreshCw, ShoppingCart, CheckCircle,
  TrendingUp, FileCheck, Zap, AlertCircle
} from 'lucide-react';
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
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { cn } from '@/lib/utils';

export interface RequisitionHeaderProps {
  requisition: any;
  isLoading: boolean;
  isDeclined: boolean;
  isReturned: boolean;
  isEmergency: boolean;
  isProcurementComplete: boolean;
  hasProcurementStarted: boolean;
  procurementProgress: number;
  qtnDetails: any;
  canEdit: boolean;
  canSubmit: boolean;
  canCancel: boolean;
  canDelete: boolean;
  canReturn: boolean;
  canViewProcurement: boolean;
  canStartProcurement: boolean;
  canContinueProcurement: boolean;
  canCompleteProcurement: boolean;
  canCancelProcurement: boolean;
  isStartingProcurement: boolean;
  isCompletingProcurement: boolean;
  isCancellingProcurement: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSubmit: () => void;
  onReturn: () => void;
  onCancelRequisition: () => void;
  onPrint: () => void;
  onRefresh: () => void;
  onStartProcurement: () => void;
  onCompleteProcurement: () => void;
  onCancelProcurement: () => void;
  onNavigateToProcurement: () => void;
  setShowCancelDialog: (show: boolean) => void;
  setComment: (comment: string) => void;
  children?: React.ReactNode;
}

export const RequisitionHeader: React.FC<RequisitionHeaderProps> = ({
  requisition,
  isLoading,
  isDeclined,
  isReturned,
  isEmergency,
  isProcurementComplete,
  hasProcurementStarted,
  procurementProgress,
  qtnDetails,
  canEdit,
  canSubmit,
  canCancel,
  canDelete,
  canReturn,
  canViewProcurement,
  canStartProcurement,
  canContinueProcurement,
  canCompleteProcurement,
  canCancelProcurement,
  isStartingProcurement,
  isCompletingProcurement,
  isCancellingProcurement,
  onBack,
  onEdit,
  onDelete,
  onSubmit,
  onReturn,
  onCancelRequisition,
  onPrint,
  onRefresh,
  onStartProcurement,
  onCompleteProcurement,
  onCancelProcurement,
  onNavigateToProcurement,
  setShowCancelDialog,
  setComment,
  children,
}) => {
  return (
    <PageTemplate
      title={`Requisition: ${requisition?.reference_number}`}
      description={`${requisition?.title} - ${requisition?.department?.name || 'No Department'}`}
      icon={<FileText className="h-5 w-5 text-primary" />}
      background="gradient"
      variant="full"
      breadcrumbs={[
        { label: 'Requisitions', href: '/requisitions' },
        { label: requisition?.reference_number || 'Details' },
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
                <Button variant="outline" size="sm" onClick={onPrint} className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800">
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
                <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800" disabled={isLoading}>
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
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
                <DropdownMenuItem onClick={onEdit} className="dark:hover:bg-gray-800">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Requisition
                </DropdownMenuItem>
              )}
              {canSubmit && (
                <DropdownMenuItem onClick={onSubmit} className="text-emerald-600 dark:hover:bg-gray-800">
                  <Send className="h-4 w-4 mr-2" />
                  {isReturned ? 'Resubmit for Approval' : 'Submit for Approval'}
                </DropdownMenuItem>
              )}
              {canReturn && (
                <DropdownMenuItem onClick={onReturn} className="text-amber-600 dark:hover:bg-gray-800">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return for Revision
                </DropdownMenuItem>
              )}
              {canCancel && (
                <DropdownMenuItem onClick={onCancelRequisition} className="text-red-600 dark:hover:bg-gray-800">
                  <X className="h-4 w-4 mr-2" />
                  Cancel Requisition
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:hover:bg-gray-800">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Requisition
                  </DropdownMenuItem>
                </>
              )}
              {requisition?.status === 'final_approved' && !isDeclined && canViewProcurement && (
                <>
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  {canStartProcurement && (
                    <DropdownMenuItem
                      onClick={onStartProcurement}
                      className="text-blue-600 dark:hover:bg-gray-800"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Start Procurement
                    </DropdownMenuItem>
                  )}
                  {canContinueProcurement && (
                    <DropdownMenuItem
                      onClick={onNavigateToProcurement}
                      className={cn(
                        isProcurementComplete ? "text-emerald-600" : "text-blue-600",
                        "dark:hover:bg-gray-800"
                      )}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isProcurementComplete ? 'View Procurement' : 'Continue Procurement'}
                    </DropdownMenuItem>
                  )}
                  {canCompleteProcurement && (
                    <DropdownMenuItem
                      onClick={onCompleteProcurement}
                      className="text-emerald-600 dark:hover:bg-gray-800"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Procurement
                    </DropdownMenuItem>
                  )}
                  {canCancelProcurement && (
                    <DropdownMenuItem
                      onClick={() => {
                        setShowCancelDialog(true);
                        setComment('');
                      }}
                      className="text-red-600 dark:hover:bg-gray-800"
                    >
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

          <Button variant="default" size="sm" onClick={onBack} className="gap-2 h-9 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
      }
    >
      {children}
    </PageTemplate>
  );
};

export default RequisitionHeader;
