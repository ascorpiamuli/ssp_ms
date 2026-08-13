import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  User, Building2, Mail, Zap, RotateCcw, AlertCircle,
  Edit, Send, Trash2, X, ShoppingCart, CheckCircle,
  TrendingUp, FileCheck, Users, Truck, Receipt,
  Loader2, Sparkles, Award, Gem, Star, Clock,
  Calendar, DollarSign, Package, Shield, Crown,
  UserCheck, CreditCard, Briefcase, FolderOpen,
  Link2, ExternalLink, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFullName, getInitials, getRoleLabel, formatCurrency, formatDate } from '../utils/helpers';

interface RequisitionSidebarProps {
  requisition: any;
  isDeclined: boolean;
  isReturned: boolean;
  isEmergency: boolean;
  isProcurementComplete: boolean;
  hasProcurementStarted: boolean;
  procurementProgress: number;
  qtnDetails: any;
  quotesCount: number;
  hasSupplierSelected: boolean;
  poDetails: any;
  grnDetails: any;
  paymentDetails: any;
  totalItems: number;
  totalApprovals: number;
  pendingApprovals: number;
  canSubmit: boolean;
  canEdit: boolean;
  canReturn: boolean;
  canCancel: boolean;
  canDelete: boolean;
  canStartProcurement: boolean;
  canContinueProcurement: boolean;
  canCompleteProcurement: boolean;
  canCancelProcurement: boolean;
  isStartingProcurement: boolean;
  isCompletingProcurement: boolean;
  isCancellingProcurement: boolean;
  onEdit: () => void;
  onSubmit: () => void;
  onReturn: () => void;
  onCancelRequisition: () => void;
  onDelete: () => void;
  onStartProcurement: () => void;
  onCompleteProcurement: () => void;
  onNavigateToProcurement: () => void;
  setShowCancelDialog: (show: boolean) => void;
  setComment: (comment: string) => void;
}

export const RequisitionSidebar: React.FC<RequisitionSidebarProps> = ({
  requisition,
  isDeclined,
  isReturned,
  isEmergency,
  isProcurementComplete,
  hasProcurementStarted,
  procurementProgress,
  qtnDetails,
  quotesCount,
  hasSupplierSelected,
  poDetails,
  grnDetails,
  paymentDetails,
  totalItems,
  totalApprovals,
  pendingApprovals,
  canSubmit,
  canEdit,
  canReturn,
  canCancel,
  canDelete,
  canStartProcurement,
  canContinueProcurement,
  canCompleteProcurement,
  canCancelProcurement,
  isStartingProcurement,
  isCompletingProcurement,
  isCancellingProcurement,
  onEdit,
  onSubmit,
  onReturn,
  onCancelRequisition,
  onDelete,
  onStartProcurement,
  onCompleteProcurement,
  onNavigateToProcurement,
  setShowCancelDialog,
  setComment,
}) => {
  const router = useRouter();

  // Helper to get status color for progress
  const getProgressColor = () => {
    if (isDeclined) return 'bg-red-500';
    if (isReturned) return 'bg-amber-500';
    if (isProcurementComplete) return 'bg-emerald-500';
    if (hasProcurementStarted) return 'bg-blue-500';
    return 'bg-gray-300 dark:bg-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Requester Card - Enhanced */}
      <Card className="relative overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-950/90 backdrop-blur-sm rounded-2xl">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-2xl" />

        <CardHeader className={cn(
          "relative pb-3 rounded-t-2xl border-b backdrop-blur-sm",
          isReturned ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-amber-500/10 border-amber-200/30 dark:border-amber-800/30" :
            isEmergency ? "bg-gradient-to-r from-red-500/10 via-rose-500/10 to-red-500/5 dark:from-red-500/20 dark:via-rose-500/20 dark:to-red-500/10 border-red-200/30 dark:border-red-800/30" :
              "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/5 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-blue-500/10 border-blue-200/30 dark:border-blue-800/30"
        )}>
          <CardTitle className="text-sm font-medium flex items-center gap-2 relative">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            Requester
            <div className="ml-auto flex items-center gap-1.5">
              {isReturned && (
                <Badge className="bg-amber-500/20 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 border-amber-300/50 dark:border-amber-700/50 backdrop-blur-sm flex items-center gap-1 font-medium shadow-sm text-[10px] rounded-full px-2 py-0.5">
                  <RotateCcw className="h-2.5 w-2.5" />
                  Returned
                </Badge>
              )}
              {isEmergency && (
                <Badge variant="destructive" className="text-[10px] rounded-full px-2 py-0.5 shadow-sm animate-pulse">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  Emergency
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-lg">
                  {getInitials(getFullName(requisition?.user))}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base truncate">{getFullName(requisition?.user)}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                <Mail className="h-3 w-3 flex-shrink-0" />
                {requisition?.user?.email}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/5">
                  {getRoleLabel(requisition?.user?.role || '')}
                </Badge>
                {requisition?.user?.department && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {requisition.user.department}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="dark:border-gray-700/50" />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5 p-2.5 bg-muted/30 rounded-lg">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Department</p>
                <p className="text-sm font-medium truncate">{requisition?.department?.name || 'N/A'}</p>
                {requisition?.department?.code && (
                  <p className="text-[10px] text-muted-foreground font-mono">{requisition.department.code}</p>
                )}
              </div>
            </div>

            {requisition?.supplier && (
              <div className="flex items-start gap-2.5 p-2.5 bg-muted/30 rounded-lg">
                <Truck className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Supplier</p>
                  <p className="text-sm font-medium truncate">{requisition.supplier.company_name}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Enhanced */}
      {(canSubmit || canEdit || canReturn || canCancel || canDelete || canStartProcurement || canContinueProcurement || canCompleteProcurement || canCancelProcurement) && !isDeclined && (
        <Card className="relative overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-950/90 backdrop-blur-sm rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl" />

          <CardHeader className={cn(
            "relative pb-3 rounded-t-2xl border-b backdrop-blur-sm",
            isReturned ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-amber-500/10 border-amber-200/30 dark:border-amber-800/30" :
              isEmergency ? "bg-gradient-to-r from-red-500/10 via-rose-500/10 to-red-500/5 dark:from-red-500/20 dark:via-rose-500/20 dark:to-red-500/10 border-red-200/30 dark:border-red-800/30" :
                "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/5 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-blue-500/10 border-blue-200/30 dark:border-blue-800/30"
          )}>
            <CardTitle className="text-sm font-medium flex items-center gap-2 relative">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              Quick Actions
              {isReturned && (
                <Badge className="ml-auto bg-amber-500/20 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 border-amber-300/50 dark:border-amber-700/50 backdrop-blur-sm flex items-center gap-1 font-medium shadow-sm text-[10px] rounded-full px-2 py-0.5">
                  <RotateCcw className="h-2.5 w-2.5" />
                  Returned
                </Badge>
              )}
              {isEmergency && (
                <Badge variant="destructive" className="ml-auto text-[10px] rounded-full px-2 py-0.5 shadow-sm animate-pulse">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  Emergency
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="relative space-y-2 pt-4">
            {canSubmit && (
              <Button
                className={cn(
                  "w-full gap-2 shadow-lg rounded-xl transition-all duration-300 hover:scale-[1.02]",
                  isEmergency ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/30" :
                    "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30"
                )}
                onClick={onSubmit}
              >
                <Send className="h-4 w-4" />
                {isReturned ? 'Resubmit for Approval' : 'Submit for Approval'}
                <Sparkles className="h-3.5 w-3.5 ml-1 opacity-70" />
              </Button>
            )}

            {canEdit && (
              <Button
                className="w-full gap-2 rounded-xl border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]"
                variant="outline"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
                Edit Requisition
              </Button>
            )}

            {canReturn && (
              <Button
                className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                onClick={onReturn}
              >
                <RotateCcw className="h-4 w-4" />
                Return for Revision
              </Button>
            )}

            {canCancel && (
              <Button
                className="w-full gap-2 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                variant="destructive"
                onClick={onCancelRequisition}
              >
                <X className="h-4 w-4" />
                Cancel Requisition
              </Button>
            )}

            {canDelete && (
              <Button
                className="w-full gap-2 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                variant="destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete Requisition
              </Button>
            )}

            {canStartProcurement && (
              <Button
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                onClick={onStartProcurement}
                disabled={isStartingProcurement}
              >
                {isStartingProcurement ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                Start Procurement
                <ArrowRight className="h-3.5 w-3.5 ml-1 opacity-70" />
              </Button>
            )}

            {canContinueProcurement && (
              <Button
                className={cn(
                  "w-full gap-2 shadow-lg rounded-xl transition-all duration-300 hover:scale-[1.02]",
                  isProcurementComplete ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/30" :
                    "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30"
                )}
                onClick={onNavigateToProcurement}
              >
                <ShoppingCart className="h-4 w-4" />
                {isProcurementComplete ? 'View Procurement' : 'Continue Procurement'}
                <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-70" />
              </Button>
            )}

            {canCompleteProcurement && (
              <Button
                className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                onClick={onCompleteProcurement}
                disabled={isCompletingProcurement}
              >
                {isCompletingProcurement ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Complete Procurement
                <Award className="h-3.5 w-3.5 ml-1 opacity-70" />
              </Button>
            )}

            {canCancelProcurement && (
              <Button
                className="w-full gap-2 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                variant="destructive"
                onClick={() => {
                  setShowCancelDialog(true);
                  setComment('');
                }}
                disabled={isCancellingProcurement}
              >
                {isCancellingProcurement ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Cancel Procurement
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Procurement Status Card - Enhanced */}
      {requisition?.status === 'final_approved' && !isDeclined && (
        <Card className={cn(
          "relative overflow-hidden shadow-lg border rounded-2xl transition-all duration-300 hover:shadow-xl",
          isProcurementComplete ? "border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 dark:border-emerald-800/50" :
            hasProcurementStarted ? "border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800/50" :
              "border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800/50"
        )}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-2xl" />

          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-lg",
                isProcurementComplete ? "bg-emerald-100 dark:bg-emerald-900/40" :
                  hasProcurementStarted ? "bg-blue-100 dark:bg-blue-900/40" :
                    "bg-blue-100 dark:bg-blue-900/40"
              )}>
                <ShoppingCart className={cn(
                  "h-4 w-4",
                  isProcurementComplete ? "text-emerald-600 dark:text-emerald-400" :
                    hasProcurementStarted ? "text-blue-600 dark:text-blue-400" :
                      "text-blue-600 dark:text-blue-400"
                )} />
              </div>
              Procurement Status
              {isProcurementComplete && (
                <Badge className="ml-auto bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                  <Star className="h-3 w-3 mr-0.5" />
                  Complete
                </Badge>
              )}
              {hasProcurementStarted && !isProcurementComplete && (
                <Badge className="ml-auto bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px]">
                  <Activity className="h-3 w-3 mr-0.5" />
                  {Math.round(procurementProgress)}%
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            {/* Progress Bar */}
            {hasProcurementStarted && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(procurementProgress)}%</span>
                </div>
                <Progress
                  value={procurementProgress}
                  className={cn(
                    "h-2",
                    isProcurementComplete ? "bg-emerald-200 dark:bg-emerald-800" :
                      "bg-blue-200 dark:bg-blue-800"
                  )}
                />
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {isProcurementComplete ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  Fully procured and completed
                </span>
              ) : hasProcurementStarted ? (
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                  In progress - {Math.round(procurementProgress)}% complete
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Gem className="h-4 w-4 text-emerald-500" />
                  Ready to start procurement
                </span>
              )}
            </p>

            {/* Procurement Details */}
            <div className="grid grid-cols-2 gap-2">
              {qtnDetails.hasQtn && (
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                  <FileCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">QTN</p>
                    <p className="text-xs font-semibold truncate">{qtnDetails.number}</p>
                  </div>
                </div>
              )}
              {quotesCount > 0 && (
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                  <Users className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Quotes</p>
                    <p className="text-xs font-semibold">{quotesCount} received</p>
                  </div>
                </div>
              )}
              {hasSupplierSelected && (
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                  <CheckCircle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Supplier</p>
                    <p className="text-xs font-semibold text-green-600">✓ Selected</p>
                  </div>
                </div>
              )}
              {poDetails.hasPo && (
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100/50 dark:border-gray-700/50">
                  <ShoppingCart className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{poDetails.type}</p>
                    <p className="text-xs font-semibold truncate">{poDetails.number}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-2">
              {canStartProcurement && (
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl transition-all duration-300 hover:scale-[1.02]"
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
              {(canContinueProcurement || canCompleteProcurement) && (
                <Button
                  className={cn(
                    "w-full shadow-lg rounded-xl transition-all duration-300 hover:scale-[1.02]",
                    isProcurementComplete ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/30" :
                      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30"
                  )}
                  onClick={onNavigateToProcurement}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isProcurementComplete ? 'View Procurement' : 'Continue Procurement'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {isReturned && !isDeclined && (
        <Card className="relative overflow-hidden border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800/50 rounded-2xl shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <RotateCcw className="h-4 w-4" />
              </div>
              Returned for Revision
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <p className="text-sm text-muted-foreground">
              Please review the feedback and make necessary changes.
            </p>
            {requisition?.return_reason && (
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Reason:</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">{requisition.return_reason}</p>
              </div>
            )}
            {requisition?.returned_at && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Returned on: {formatDate(requisition.returned_at)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isEmergency && !isDeclined && !isReturned && (
        <Card className="relative overflow-hidden border-red-200/50 bg-gradient-to-br from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 dark:border-red-800/50 rounded-2xl shadow-lg animate-pulse">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40">
                <Zap className="h-4 w-4" />
              </div>
              Emergency Requisition
              <Badge variant="destructive" className="ml-auto text-[10px] animate-pulse">Urgent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Fast-track approval process activated.
            </p>
            <div className="mt-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-red-200/50 dark:border-red-800/50">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-red-600 dark:text-red-400">Approval Flow:</span>
                <span className="ml-1">Accountant → Principal → Final Approver</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="font-medium">Bypasses:</span> HOD approval
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isDeclined && (
        <Card className="relative overflow-hidden border-red-200/50 bg-gradient-to-br from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 dark:border-red-800/50 rounded-2xl shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40">
                <AlertCircle className="h-4 w-4" />
              </div>
              Requisition Declined
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <p className="text-sm text-muted-foreground">
              This requisition cannot be processed further.
            </p>
            {requisition?.approvals?.find((a: any) => a.status === 'declined')?.decline_reason && (
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-red-200/50 dark:border-red-800/50">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">Reason:</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {requisition.approvals.find((a: any) => a.status === 'declined')?.decline_reason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats - Enhanced */}
      <Card className="relative overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-950/90 backdrop-blur-sm rounded-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl" />

        <CardHeader className={cn(
          "relative pb-3 rounded-t-2xl border-b backdrop-blur-sm",
          isReturned ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-amber-500/10 border-amber-200/30 dark:border-amber-800/30" :
            isEmergency ? "bg-gradient-to-r from-red-500/10 via-rose-500/10 to-red-500/5 dark:from-red-500/20 dark:via-rose-500/20 dark:to-red-500/10 border-red-200/30 dark:border-red-800/30" :
              "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/5 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-blue-500/10 border-blue-200/30 dark:border-blue-800/30"
        )}>
          <CardTitle className="text-sm font-medium flex items-center gap-2 relative">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            Summary
            <div className="ml-auto flex items-center gap-1.5">
              {isReturned && (
                <Badge className="bg-amber-500/20 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 border-amber-300/50 dark:border-amber-700/50 backdrop-blur-sm flex items-center gap-1 font-medium shadow-sm text-[10px] rounded-full px-2 py-0.5">
                  <RotateCcw className="h-2.5 w-2.5" />
                  Returned
                </Badge>
              )}
              {isEmergency && (
                <Badge variant="destructive" className="text-[10px] rounded-full px-2 py-0.5 shadow-sm animate-pulse">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  Emergency
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-3 pt-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2.5 bg-muted/20 rounded-lg">
              <Package className="h-4 w-4 mx-auto text-muted-foreground mb-0.5" />
              <p className="text-xs text-muted-foreground">Items</p>
              <p className="text-lg font-bold">{totalItems}</p>
            </div>
            <div className="text-center p-2.5 bg-muted/20 rounded-lg">
              <Shield className="h-4 w-4 mx-auto text-muted-foreground mb-0.5" />
              <p className="text-xs text-muted-foreground">Approvals</p>
              <p className="text-lg font-bold">{totalApprovals}</p>
            </div>
            <div className="text-center p-2.5 bg-muted/20 rounded-lg">
              <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-0.5" />
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className={cn(
                "text-lg font-bold",
                isDeclined ? "text-red-600" :
                  isReturned ? "text-amber-600" :
                    isEmergency ? "text-red-600" :
                      "text-amber-600"
              )}>
                {isDeclined ? 0 : pendingApprovals}
              </p>
            </div>
          </div>

          <Separator className="dark:border-gray-700/50" />

          {/* Detailed Stats */}
          <div className="space-y-2">
            {isReturned && (
              <div className="flex justify-between items-center p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg">
                <span className="text-sm text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Return Count
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {requisition?.return_count || 0}x
                </span>
              </div>
            )}

            {isEmergency && (
              <div className="flex justify-between items-center p-2 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                <span className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  Emergency Type
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">Yes</span>
              </div>
            )}

            {hasProcurementStarted && (
              <>
                <div className="flex justify-between items-center p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <ShoppingCart className="h-3.5 w-3.5 text-blue-500" />
                    Procurement
                  </span>
                  <span className={cn(
                    "font-semibold",
                    isProcurementComplete ? "text-emerald-600" :
                      hasProcurementStarted ? "text-blue-600" :
                        "text-muted-foreground"
                  )}>
                    {isProcurementComplete ? 'Complete' :
                      hasProcurementStarted ? `${Math.round(procurementProgress)}%` :
                        'Not Started'}
                  </span>
                </div>

                {qtnDetails.hasQtn && (
                  <div className="flex justify-between items-center p-2 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5 text-indigo-500" />
                      QTN
                    </span>
                    <span className="font-mono text-sm font-semibold">{qtnDetails.number}</span>
                  </div>
                )}

                {quotesCount > 0 && (
                  <div className="flex justify-between items-center p-2 bg-green-50/50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-green-500" />
                      Quotes
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">{quotesCount}</span>
                  </div>
                )}

                {hasSupplierSelected && (
                  <div className="flex justify-between items-center p-2 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-purple-500" />
                      Supplier
                    </span>
                    <span className="font-medium text-green-600">✓ Selected</span>
                  </div>
                )}

                {poDetails.hasPo && (
                  <div className="flex justify-between items-center p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <ShoppingCart className="h-3.5 w-3.5 text-blue-500" />
                      {poDetails.type}
                    </span>
                    <span className="font-mono text-sm font-semibold">{poDetails.number}</span>
                  </div>
                )}

                {grnDetails.hasGrn && (
                  <div className="flex justify-between items-center p-2 bg-teal-50/50 dark:bg-teal-950/20 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-teal-500" />
                      GRN
                    </span>
                    <span className="font-mono text-sm font-semibold">{grnDetails.number}</span>
                  </div>
                )}

                {paymentDetails.hasPayment && (
                  <div className="flex justify-between items-center p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-amber-500" />
                      Payment
                    </span>
                    <span className="font-mono text-sm font-semibold">{paymentDetails.number}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <Separator className="dark:border-gray-700/50" />

          {/* Total Amount */}
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary" />
              Total Amount
            </span>
            <span className={cn(
              "text-xl font-bold",
              isDeclined ? "text-red-600" :
                isReturned ? "text-amber-600" :
                  isEmergency ? "text-red-600" :
                    requisition?.status === 'final_approved' ? "text-emerald-600" :
                      "text-blue-600"
            )}>
              {formatCurrency(requisition?.total_amount || 0)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add missing import
import { Activity } from 'lucide-react';

export default RequisitionSidebar;
