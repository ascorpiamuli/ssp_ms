'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  FileText, MessageSquare, Layers, TrendingUp, CheckCircle,
  XCircle, Loader2, Zap, RotateCcw, Package, Shield,
  Clock, DollarSign, Building2, User, AlertTriangle,
  ShoppingCart, Users, Truck, Receipt, FileCheck,
  Calendar, Hash, Tag, Sparkles, Activity, BarChart3,
  Circle, CheckCircle2, XCircle as XCircleIcon, Clock as ClockIcon,
  Star, Award, Gem, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, getApprovalLevelInfo } from '../utils/helpers';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export interface RequisitionOverviewTabProps {
  requisition: any;
  isDeclined: boolean;
  isReturned: boolean;
  isEmergency: boolean;
  isProcurementComplete: boolean;
  hasProcurementStarted: boolean;
  procurementProgress: number;
  currentProcurementStatus: string | null;
  qtnDetails: any;
  hasSupplierSelected: boolean;
  poDetails: any;
  grnDetails: any;
  paymentDetails: any;
  quotesCount: number;
  totalItems: number;
  totalApprovals: number;
  pendingApprovals: any[];
}

export const RequisitionOverviewTab: React.FC<RequisitionOverviewTabProps> = ({
  requisition,
  isDeclined,
  isReturned,
  isEmergency,
  isProcurementComplete,
  hasProcurementStarted,
  procurementProgress,
  currentProcurementStatus,
  qtnDetails,
  hasSupplierSelected,
  poDetails,
  grnDetails,
  paymentDetails,
  quotesCount,
  totalItems,
  totalApprovals,
  pendingApprovals,
}) => {
  // Helper to get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'initiated': 'bg-blue-500',
      'quotation_in_progress': 'bg-indigo-500',
      'awaiting_quotations': 'bg-yellow-500',
      'evaluating_quotations': 'bg-orange-500',
      'supplier_selected': 'bg-purple-500',
      'goods_receipt_pending': 'bg-teal-500',
      'invoicing_pending': 'bg-cyan-500',
      'payment_pending': 'bg-amber-500',
      'completed': 'bg-emerald-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  // Helper to get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'initiated': 'Initiated',
      'quotation_in_progress': 'Quotation In Progress',
      'awaiting_quotations': 'Awaiting Quotations',
      'evaluating_quotations': 'Evaluating Quotations',
      'supplier_selected': 'Supplier Selected',
      'goods_receipt_pending': 'Goods Receipt Pending',
      'invoicing_pending': 'Invoicing Pending',
      'payment_pending': 'Payment Pending',
      'completed': 'Completed',
    };
    return labels[status] || status?.replace(/_/g, ' ') || 'In Progress';
  };

  return (
    <div className="space-y-6">
      {/* Status Alerts */}
      {isReturned && (
        <Alert className="border-amber-500/30 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 backdrop-blur-sm rounded-xl shadow-sm">
          <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2">
            <span>Returned for Revision</span>
            <Badge variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-[10px]">
              Needs Action
            </Badge>
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            This requisition has been returned for revision. Please review the comments, make necessary changes, and resubmit for approval.
            {requisition?.return_reason && (
              <span className="block mt-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200/50 dark:border-amber-800/50 text-sm">
                <strong>Reason:</strong> {requisition.return_reason}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isDeclined && (
        <Alert variant="destructive" className="border-red-500/30 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm rounded-xl shadow-sm">
          <XCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold flex items-center gap-2">
            <span>Requisition Declined</span>
            <Badge variant="destructive" className="text-[10px]">Rejected</Badge>
          </AlertTitle>
          <AlertDescription>
            This requisition has been declined and cannot be processed further.
            {requisition?.approvals?.find((a: any) => a.status === 'declined')?.decline_reason && (
              <span className="block mt-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-red-200/50 dark:border-red-800/50 text-sm">
                <strong>Reason:</strong> {requisition.approvals.find((a: any) => a.status === 'declined')?.decline_reason}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isEmergency && !isDeclined && !isReturned && (
        <Alert className="border-red-500/30 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm rounded-xl shadow-sm">
          <Zap className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-300 font-semibold flex items-center gap-2">
            <span>🚨 Emergency Requisition</span>
            <Badge variant="destructive" className="animate-pulse text-[10px]">Urgent</Badge>
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            This requisition is marked as emergency and will follow the fast-track approval process.
          </AlertDescription>
        </Alert>
      )}

      {requisition?.status === 'final_approved' && !isDeclined && (
        <Alert className={cn(
          "border-emerald-500/30 bg-gradient-to-r backdrop-blur-sm rounded-xl shadow-sm",
          isProcurementComplete ? "from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30" :
            hasProcurementStarted ? "from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30" :
              "from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30"
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isProcurementComplete ? "bg-emerald-100 dark:bg-emerald-900/40" :
                hasProcurementStarted ? "bg-blue-100 dark:bg-blue-900/40" :
                  "bg-emerald-100 dark:bg-emerald-900/40"
            )}>
              {isProcurementComplete ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : hasProcurementStarted ? (
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div className="flex-1">
              <AlertTitle className={cn(
                "font-semibold flex items-center gap-2 flex-wrap",
                isProcurementComplete ? "text-emerald-800 dark:text-emerald-300" :
                  hasProcurementStarted ? "text-blue-800 dark:text-blue-300" :
                    "text-emerald-800 dark:text-emerald-300"
              )}>
                {isProcurementComplete ? (
                  <>
                    <span>Procurement Complete</span>
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                      <Star className="h-3 w-3 mr-1" />
                      Success
                    </Badge>
                  </>
                ) : hasProcurementStarted ? (
                  <>
                    <span>Procurement In Progress</span>
                    <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px]">
                      <Activity className="h-3 w-3 mr-1" />
                      {Math.round(procurementProgress)}%
                    </Badge>
                  </>
                ) : (
                  <>
                    <span>Approved - Ready for Procurement</span>
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                      <Gem className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  </>
                )}
              </AlertTitle>
              <AlertDescription className={cn(
                "text-sm",
                isProcurementComplete ? "text-emerald-700 dark:text-emerald-400" :
                  hasProcurementStarted ? "text-blue-700 dark:text-blue-400" :
                    "text-emerald-700 dark:text-emerald-400"
              )}>
                {isProcurementComplete
                  ? 'All procurement stages have been completed successfully.'
                  : hasProcurementStarted
                    ? `Procurement is in progress. Current status: ${getStatusLabel(currentProcurementStatus || '')}.`
                    : 'This requisition has been fully approved and is ready for the procurement process.'}
              </AlertDescription>
            </div>
          </div>

          {/* Procurement Details Grid */}
          {(hasProcurementStarted || isProcurementComplete) && (
            <div className="mt-3 pt-3 border-t border-gray-200/30 dark:border-gray-700/30 grid grid-cols-2 md:grid-cols-4 gap-3">
              {qtnDetails.hasQtn && (
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <FileCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">QTN</p>
                    <p className="text-xs font-semibold">{qtnDetails.number}</p>
                  </div>
                </div>
              )}
              {quotesCount > 0 && (
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">Quotes</p>
                    <p className="text-xs font-semibold">{quotesCount} received</p>
                  </div>
                </div>
              )}
              {hasSupplierSelected && (
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">Supplier</p>
                    <p className="text-xs font-semibold text-green-600">✓ Selected</p>
                  </div>
                </div>
              )}
              {poDetails.hasPo && (
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">{poDetails.type}</p>
                    <p className="text-xs font-semibold">{poDetails.number}</p>
                  </div>
                </div>
              )}
              {grnDetails.hasGrn && (
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <Truck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">GRN</p>
                    <p className="text-xs font-semibold">{grnDetails.number}</p>
                  </div>
                </div>
              )}
              {paymentDetails.hasPayment && (
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <Receipt className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">Payment</p>
                    <p className="text-xs font-semibold">{paymentDetails.number}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Alert>
      )}

      {requisition?.status === 'cancelled' && (
        <Alert variant="destructive" className="border-red-500/30 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm rounded-xl shadow-sm">
          <XCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold flex items-center gap-2">
            <span>Cancelled</span>
            <Badge variant="destructive" className="text-[10px]">Cancelled</Badge>
          </AlertTitle>
          <AlertDescription>
            This requisition has been cancelled and cannot be processed further.
          </AlertDescription>
        </Alert>
      )}

      {/* Description & Justification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requisition?.description && (
          <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn(
                "text-sm leading-relaxed",
                isDeclined && "text-muted-foreground"
              )}>{requisition.description}</p>
            </CardContent>
          </Card>
        )}

        {requisition?.justification && (
          <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Justification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn(
                "text-sm leading-relaxed",
                isDeclined && "text-muted-foreground"
              )}>{requisition.justification}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Details Card */}
      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Requisition Details
            <Badge variant="outline" className="ml-auto text-[10px]">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(requisition?.created_at)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-1 p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Type</p>
              </div>
              <p className="text-sm capitalize font-semibold">{requisition?.type || 'N/A'}</p>
            </div>

            <div className="space-y-1 p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Urgency</p>
              </div>
              <p className="text-sm capitalize font-semibold">{requisition?.urgency || 'N/A'}</p>
            </div>

            <div className="space-y-1 p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Risk Level</p>
              </div>
              <p className="text-sm capitalize font-semibold">{requisition?.risk_level || 'N/A'}</p>
            </div>

            {requisition?.budget_code && (
              <div className="space-y-1 p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Budget Code</p>
                </div>
                <p className="text-sm font-mono font-semibold">{requisition.budget_code}</p>
              </div>
            )}

            {requisition?.budget_source && (
              <div className="space-y-1 p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Budget Source</p>
                </div>
                <p className="text-sm font-semibold">{requisition.budget_source}</p>
              </div>
            )}

            {requisition?.funding_source && (
              <div className="space-y-1 p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Funding Source</p>
                </div>
                <p className="text-sm font-semibold">{requisition.funding_source}</p>
              </div>
            )}

            {requisition?.project_code && (
              <div className="space-y-1 p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Project Code</p>
                </div>
                <p className="text-sm font-mono font-semibold">{requisition.project_code}</p>
              </div>
            )}

            {requisition?.procurement_method && (
              <div className="space-y-1 p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Method</p>
                </div>
                <p className="text-sm capitalize font-semibold">{requisition.procurement_method?.replace('_', ' ')}</p>
              </div>
            )}

            {isEmergency && (
              <div className="col-span-2 p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-200/30 dark:border-red-800/30">
                <Badge variant="destructive" className="text-xs rounded-full animate-pulse">
                  <Zap className="h-3 w-3 mr-1" />
                  Emergency Procurement
                </Badge>
              </div>
            )}

            {isReturned && requisition?.returned_at && (
              <div className="col-span-2 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/30 dark:border-amber-800/30">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Returned At</p>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{formatDate(requisition.returned_at)}</p>
                  </div>
                </div>
                {requisition?.return_reason && (
                  <div className="mt-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Reason:</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{requisition.return_reason}</p>
                  </div>
                )}
              </div>
            )}

            {requisition?.return_count > 0 && (
              <div className="p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Return Count</p>
                </div>
                <p className="text-sm font-semibold">{requisition.return_count}x</p>
              </div>
            )}

            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Submitted</p>
              </div>
              <p className="text-sm font-semibold">{formatDate(requisition?.submitted_at)}</p>
            </div>


            {hasProcurementStarted && (
              <div className="col-span-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/30 dark:border-blue-800/30">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Procurement Status</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {isProcurementComplete ? 'Complete' : `${Math.round(procurementProgress)}%`}
                      </span>
                      {!isProcurementComplete && currentProcurementStatus && (
                        <Badge className={cn(
                          "text-[10px]",
                          getStatusColor(currentProcurementStatus),
                          "text-white"
                        )}>
                          {getStatusLabel(currentProcurementStatus)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {qtnDetails.hasQtn && (
              <div className="col-span-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200/30 dark:border-indigo-800/30">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">QTN Reference</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {qtnDetails.number}
                      </span>
                      <Badge variant="outline" className="text-[10px] border-indigo-200 dark:border-indigo-800">
                        {qtnDetails.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval Progress Card */}
      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Approval Progress
            <Badge variant="outline" className="ml-auto text-[10px]">
              <Award className="h-3 w-3 mr-1" />
              {requisition?.approvals?.filter((a: any) => a.status === 'approved').length || 0} of 4
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Approval Steps */}
            <div className="flex items-center justify-between gap-2">
              {['hod', 'accountant', 'principal', 'final'].map((key, index) => {
                const levelInfo = getApprovalLevelInfo(key);
                const approval = requisition?.approvals?.find((a: any) => a.level === key);
                const status = approval?.status || 'pending';
                const isCompleted = status === 'approved';
                const isCurrent = status === 'pending';
                const isLevelDeclined = status === 'declined' || status === 'returned';
                const Icon = levelInfo.icon;

                return (
                  <div key={key} className="flex-1 flex flex-col items-center">
                    <div className="relative">
                      <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 shadow-lg",
                        isCompleted && "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/30",
                        isCurrent && !isDeclined && !isReturned && "bg-amber-500 border-amber-500 text-white shadow-amber-500/30",
                        isLevelDeclined && "bg-red-500 border-red-500 text-white shadow-red-500/30",
                        !isCompleted && !isCurrent && !isLevelDeclined && "bg-muted/50 border-muted-foreground/30 text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : isCurrent && !isDeclined && !isReturned ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : isLevelDeclined ? (
                          <XCircle className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      {index < 3 && (
                        <div className={cn(
                          "absolute top-1/2 -translate-y-1/2 left-full w-full h-1 rounded-full",
                          isCompleted ? "bg-emerald-500" : "bg-muted-foreground/20"
                        )} />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium mt-2 text-center",
                      isCompleted && "text-emerald-600 dark:text-emerald-400",
                      isCurrent && !isDeclined && !isReturned && "text-amber-600 dark:text-amber-400",
                      isLevelDeclined && "text-red-600 dark:text-red-400",
                      !isCompleted && !isCurrent && !isLevelDeclined && "text-muted-foreground"
                    )}>
                      {levelInfo.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground text-center">
                      {isCompleted ? (
                        <span className="text-emerald-600 dark:text-emerald-400">✓ Approved</span>
                      ) : isCurrent && !isDeclined && !isReturned ? (
                        <span className="text-amber-600 dark:text-amber-400">⏳ Pending</span>
                      ) : isLevelDeclined ? (
                        <span className="text-red-600 dark:text-red-400">✕ Declined</span>
                      ) : (
                        <span className="text-muted-foreground">○ Waiting</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approval Progress</span>
                <span className="font-medium">
                  {requisition?.approvals?.filter((a: any) => a.status === 'approved').length || 0} of 4 levels completed
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={((requisition?.approvals?.filter((a: any) => a.status === 'approved').length || 0) / 4) * 100}
                  className="h-2.5"
                />
                <div className="absolute inset-0 flex items-center justify-end pr-1">
                  <span className="text-[8px] font-bold text-white">
                    {Math.round(((requisition?.approvals?.filter((a: any) => a.status === 'approved').length || 0) / 4) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Approved: {requisition?.approvals?.filter((a: any) => a.status === 'approved').length || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                Pending: {pendingApprovals.length}
              </span>
              {isDeclined && (
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Declined
                </span>
              )}
              {isReturned && (
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Returned
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequisitionOverviewTab;
