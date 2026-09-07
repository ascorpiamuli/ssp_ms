// frontend/src/app/(dashboard)/requisitions/[id]/components/RequisitionOverviewTab.tsx

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  FileText,
  MessageSquare,
  Layers,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  RotateCcw,
  Package,
  Shield,
  Clock,
  DollarSign,
  Building2,
  User,
  AlertTriangle,
  ShoppingCart,
  Users,
  Truck,
  Receipt,
  FileCheck,
  Calendar,
  Hash,
  Tag,
  Sparkles,
  Activity,
  Award,
  Gem,
  Crown,
  Info,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link2,
  Briefcase,
  CreditCard,
  CalendarDays,
  Timer,
  Target,
  Rocket,
  Star,
  Heart,
  Flame,
  ChevronDown,
  ChevronUp,
  Wrench,
  ClipboardList,
  UserCog,
  Construction,
  Laptop,
  Handshake,
  FileCheck as FileCheckIcon,
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
  sanDetails: any; // ✅ Added SAN details
  paymentDetails: any;
  quotesCount: number;
  totalItems: number;
  totalApprovals: number;
  pendingApprovals: any[];
}

// ============================================
// REUSABLE COMPONENTS
// ============================================

const InfoRow = ({
  icon: Icon,
  label,
  value,
  className,
  valueClassName,
  badge,
}: {
  icon: any;
  label: string;
  value: string | React.ReactNode;
  className?: string;
  valueClassName?: string;
  badge?: React.ReactNode;
}) => (
  <div className={cn("flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors", className)}>
    <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        {badge}
      </div>
      <div className={cn("text-base font-medium mt-0.5 truncate", valueClassName)}>{value || 'N/A'}</div>
    </div>
  </div>
);

const DetailCard = ({
  title,
  icon: Icon,
  children,
  className,
  badge,
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}) => (
  <Card className={cn("shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl hover:shadow-md transition-shadow", className)}>
    <CardHeader className="pb-3 flex flex-row items-center justify-between">
      <CardTitle className="text-base font-semibold flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        {title}
      </CardTitle>
      {badge}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const StatusChip = ({ label, color = 'gray', icon: Icon }: { label: string; color?: string; icon?: any }) => {
  const colors: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium", colors[color] || colors.gray)}>
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </div>
  );
};

const ExpandableText = ({ text, maxLines = 3 }: { text: string; maxLines?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = text?.split('\n') || [];
  const shouldTruncate = lines.length > maxLines || text?.length > 300;

  const displayText = isExpanded ? text : text?.slice(0, 300) + (text?.length > 300 ? '...' : '');

  if (!text) return <p className="text-muted-foreground italic">No description provided</p>;

  return (
    <div className="space-y-2">
      <div className={cn(
        "text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap",
        !isExpanded && "line-clamp-3"
      )}>
        {text}
      </div>
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto font-medium"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Read More
            </>
          )}
        </Button>
      )}
    </div>
  );
};

const SectionBadge = ({ label, color = 'blue' }: { label: string; color?: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  };

  return (
    <Badge className={cn("text-[10px] rounded-full px-2.5 py-0.5", colors[color] || colors.gray)}>
      {label}
    </Badge>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

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
  sanDetails,
  paymentDetails,
  quotesCount,
  totalItems,
  totalApprovals,
  pendingApprovals,
}) => {
  const statusColors: Record<string, string> = {
    'initiated': 'bg-blue-500',
    'quotation_in_progress': 'bg-indigo-500',
    'awaiting_quotations': 'bg-yellow-500',
    'evaluating_quotations': 'bg-orange-500',
    'supplier_selected': 'bg-purple-500',
    'delivery_pending': 'bg-teal-500',
    'invoicing_pending': 'bg-cyan-500',
    'payment_pending': 'bg-amber-500',
    'completed': 'bg-emerald-500',
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'initiated': 'Initiated',
      'quotation_in_progress': 'Quotation In Progress',
      'awaiting_quotations': 'Awaiting Quotations',
      'evaluating_quotations': 'Evaluating Quotations',
      'supplier_selected': 'Supplier Selected',
      'delivery_pending': 'Delivery Pending',
      'invoicing_pending': 'Invoicing Pending',
      'payment_pending': 'Payment Pending',
      'completed': 'Completed',
    };
    return labels[status] || status?.replace(/_/g, ' ') || 'In Progress';
  };

  const getStatusColor = (status: string) => statusColors[status] || 'bg-gray-500';

  const approvalCount = requisition?.approvals?.filter((a: any) => a.status === 'approved').length || 0;
  const totalApprovalLevels = 4;
  const approvalProgress = (approvalCount / totalApprovalLevels) * 100;

  const requester = requisition?.requester || requisition?.user || {};
  const department = requisition?.department || {};

  const isService = requisition?.requisition_type === 'services';
  const isGoods = requisition?.requisition_type === 'goods';

  const serviceCategory = requisition?.service_category;
  const serviceCategoryLabel = serviceCategory ?
    serviceCategory.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : null;

  const goodsCategoryLabel = requisition?.goods_category ?
    requisition.goods_category.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : null;

  // Determine delivery type
  const hasGrn = grnDetails?.hasGrn || false;
  const hasSan = sanDetails?.hasSan || false;
  const hasDelivery = hasGrn || hasSan;

  return (
    <div className="space-y-6">
      {/* Status Alerts */}
      {isReturned && (
        <Alert className="border-amber-500/30 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 backdrop-blur-sm rounded-xl shadow-sm">
          <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold text-base flex items-center gap-2 flex-wrap">
            Returned for Revision
            <Badge className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 text-xs">
              Needs Action
            </Badge>
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
            This requisition has been returned for revision. Please review the comments, make necessary changes, and resubmit for approval.
            {requisition?.return_reason && (
              <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Reason:</p>
                <p className="text-sm text-amber-800 dark:text-amber-300">{requisition.return_reason}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isDeclined && (
        <Alert variant="destructive" className="border-red-500/30 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm rounded-xl shadow-sm">
          <XCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold text-base flex items-center gap-2 flex-wrap">
            Requisition Declined
            <Badge variant="destructive" className="text-xs">Rejected</Badge>
          </AlertTitle>
          <AlertDescription className="text-sm">
            This requisition has been declined and cannot be processed further.
            {requisition?.approvals?.find((a: any) => a.status === 'declined')?.decline_reason && (
              <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-red-200/50 dark:border-red-800/50">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Reason:</p>
                <p className="text-sm text-red-800 dark:text-red-300">{requisition.approvals.find((a: any) => a.status === 'declined')?.decline_reason}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isEmergency && !isDeclined && !isReturned && (
        <Alert className="border-red-500/30 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm rounded-xl shadow-sm">
          <Zap className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-300 font-semibold text-base flex items-center gap-2 flex-wrap">
            Emergency Requisition
            <Badge variant="destructive" className="animate-pulse text-xs">Urgent</Badge>
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
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
                "font-semibold text-base flex items-center gap-2 flex-wrap",
                isProcurementComplete ? "text-emerald-800 dark:text-emerald-300" :
                  hasProcurementStarted ? "text-blue-800 dark:text-blue-300" :
                    "text-emerald-800 dark:text-emerald-300"
              )}>
                {isProcurementComplete ? (
                  <>
                    Procurement Complete
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs">
                      <Award className="h-3.5 w-3.5 mr-1" />
                      Success
                    </Badge>
                  </>
                ) : hasProcurementStarted ? (
                  <>
                    Procurement In Progress
                    <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs">
                      <Activity className="h-3.5 w-3.5 mr-1" />
                      {Math.round(procurementProgress)}%
                    </Badge>
                  </>
                ) : (
                  <>
                    Approved - Ready for Procurement
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs">
                      <Gem className="h-3.5 w-3.5 mr-1" />
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
                    ? `${getStatusLabel(currentProcurementStatus || '')} in progress.`
                    : 'This requisition has been fully approved and is ready for the procurement process.'}
              </AlertDescription>
            </div>
          </div>

          {/* Procurement Chips */}
          {(hasProcurementStarted || isProcurementComplete) && (
            <div className="mt-3 pt-3 border-t border-gray-200/30 dark:border-gray-700/30 flex flex-wrap gap-2">
              {qtnDetails.hasQtn && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-indigo-200 dark:border-indigo-800">
                  <FileCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">QTN:</span>
                  <span className="text-sm font-mono font-medium">{qtnDetails.number}</span>
                </div>
              )}
              {quotesCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-blue-200 dark:border-blue-800">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Quotes:</span>
                  <span className="text-sm font-medium">{quotesCount} received</span>
                </div>
              )}
              {hasSupplierSelected && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Supplier Selected</span>
                </div>
              )}
              {poDetails.hasPo && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-purple-200 dark:border-purple-800">
                  <ShoppingCart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{poDetails.type || 'PO'}:</span>
                  <span className="text-sm font-mono font-medium">{poDetails.number}</span>
                </div>
              )}
              {/* ✅ GRN Chip */}
              {hasGrn && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-teal-200 dark:border-teal-800">
                  <Truck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-medium text-teal-600 dark:text-teal-400">GRN:</span>
                  <span className="text-sm font-mono font-medium">{grnDetails.number}</span>
                </div>
              )}
              {/* ✅ SAN Chip */}
              {hasSan && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-cyan-200 dark:border-cyan-800">
                  <FileCheckIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">SAN:</span>
                  <span className="text-sm font-mono font-medium">{sanDetails.number}</span>
                </div>
              )}
              {paymentDetails.hasPayment && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-rose-200 dark:border-rose-800">
                  <Receipt className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Payment:</span>
                  <span className="text-sm font-mono font-medium">{paymentDetails.number}</span>
                </div>
              )}
            </div>
          )}
        </Alert>
      )}

      {requisition?.status === 'cancelled' && (
        <Alert variant="destructive" className="border-red-500/30 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm rounded-xl shadow-sm">
          <XCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold text-base flex items-center gap-2 flex-wrap">
            Cancelled
            <Badge variant="destructive" className="text-xs">Cancelled</Badge>
          </AlertTitle>
          <AlertDescription className="text-sm">
            This requisition has been cancelled and cannot be processed further.
          </AlertDescription>
        </Alert>
      )}

      {/* Requisition Type Banner */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
        <div className={cn(
          "p-2.5 rounded-xl",
          isService ? "bg-purple-100 dark:bg-purple-900/40" : "bg-blue-100 dark:bg-blue-900/40"
        )}>
          {isService ? (
            <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          ) : (
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isService ? 'Service Requisition (LSO)' : 'Goods Requisition (LPO)'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isService
              ? 'This requisition is for professional services, contracts, or maintenance work.'
              : 'This requisition is for physical items, materials, equipment, or supplies.'}
          </p>
        </div>
        <div className="ml-auto">
          <Badge className={cn(
            "rounded-full px-3 py-1",
            isService
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
          )}>
            {isService ? 'LSO' : 'LPO'}
          </Badge>
        </div>
      </div>

      {/* Description & Justification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DetailCard title="Description" icon={FileText}>
          <ExpandableText text={requisition?.description} />
        </DetailCard>

        {requisition?.justification && (
          <DetailCard title="Justification" icon={MessageSquare}>
            <ExpandableText text={requisition?.justification} />
          </DetailCard>
        )}
      </div>

      {/* Requisition Details */}
      <DetailCard
        title="Requisition Details"
        icon={Layers}
        badge={
          <div className="flex items-center gap-2">
            {isService && serviceCategoryLabel && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-[10px]">
                {serviceCategoryLabel}
              </Badge>
            )}
            {isGoods && goodsCategoryLabel && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-[10px]">
                {goodsCategoryLabel}
              </Badge>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Type-specific info */}
          {isService && (
            <>
              <InfoRow
                icon={Briefcase}
                label="Service Category"
                value={serviceCategoryLabel || 'N/A'}
              />
              {requisition?.service_scope_of_work && (
                <div className="col-span-3">
                  <InfoRow
                    icon={ClipboardList}
                    label="Service Description"
                    value={<ExpandableText text={requisition.service_scope_of_work} maxLines={2} />}
                  />
                </div>
              )}
              {requisition?.service_deliverables_expected && (
                <div className="col-span-3">
                  <InfoRow
                    icon={Target}
                    label="Expected Deliverables"
                    value={<ExpandableText text={requisition.service_deliverables_expected} maxLines={2} />}
                  />
                </div>
              )}
              {requisition?.service_expected_start_date && (
                <InfoRow
                  icon={Calendar}
                  label="Service Start Date"
                  value={formatDate(requisition.service_expected_start_date)}
                />
              )}
              {requisition?.service_expected_end_date && (
                <InfoRow
                  icon={CalendarDays}
                  label="Service End Date"
                  value={formatDate(requisition.service_expected_end_date)}
                />
              )}
              {requisition?.service_estimated_duration_days && (
                <InfoRow
                  icon={Timer}
                  label="Estimated Duration"
                  value={`${requisition.service_estimated_duration_days} days`}
                />
              )}
              {requisition?.service_requires_onsite_visit && (
                <InfoRow
                  icon={MapPin}
                  label="Requires Onsite Visit"
                  value="Yes"
                  valueClassName="text-emerald-600 dark:text-emerald-400 font-semibold"
                />
              )}
              {requisition?.service_special_requirements && (
                <div className="col-span-3">
                  <InfoRow
                    icon={AlertTriangle}
                    label="Special Requirements"
                    value={<ExpandableText text={requisition.service_special_requirements} maxLines={2} />}
                  />
                </div>
              )}
              {requisition?.service_qualifications_required && (
                <div className="col-span-3">
                  <InfoRow
                    icon={UserCog}
                    label="Qualifications Required"
                    value={<ExpandableText text={requisition.service_qualifications_required} maxLines={2} />}
                  />
                </div>
              )}
            </>
          )}

          {isGoods && (
            <>
              <InfoRow
                icon={Tag}
                label="Goods Category"
                value={goodsCategoryLabel || 'N/A'}
              />
              {requisition?.goods_warehouse_location && (
                <InfoRow
                  icon={MapPin}
                  label="Warehouse Location"
                  value={requisition.goods_warehouse_location}
                />
              )}
              {requisition?.goods_storage_requirements && (
                <InfoRow
                  icon={Shield}
                  label="Storage Requirements"
                  value={requisition.goods_storage_requirements}
                />
              )}
              {requisition?.goods_expected_delivery_date && (
                <InfoRow
                  icon={Truck}
                  label="Expected Delivery Date"
                  value={formatDate(requisition.goods_expected_delivery_date)}
                />
              )}
            </>
          )}

          {/* Common fields */}
          <InfoRow icon={Tag} label="Requisition Type" value={requisition?.type ? requisition.type.charAt(0).toUpperCase() + requisition.type.slice(1) : 'N/A'} />
          <InfoRow icon={Clock} label="Urgency" value={requisition?.urgency ? requisition.urgency.charAt(0).toUpperCase() + requisition.urgency.slice(1) : 'N/A'} />
          <InfoRow icon={Shield} label="Risk Level" value={requisition?.risk_level ? requisition.risk_level.charAt(0).toUpperCase() + requisition.risk_level.slice(1) : 'N/A'} />
          <InfoRow icon={Package} label="Total Items" value={totalItems?.toString() || '0'} />

          {/* Total Amount - Conditional for Services */}
          {isService ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <InfoRow
                icon={DollarSign}
                label="Total Amount"
                value="To be determined by supplier quotations"
                valueClassName="text-amber-600 dark:text-amber-400 font-medium"
                badge={
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] rounded-full">
                    Awaiting Quotation
                  </Badge>
                }
              />
            </div>
          ) : (
            <InfoRow
              icon={DollarSign}
              label="Total Amount"
              value={formatCurrency(requisition?.total_amount)}
              valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
            />
          )}

          {requisition?.budget_code && (
            <InfoRow icon={Hash} label="Budget Code" value={requisition.budget_code} valueClassName="font-mono" />
          )}
          {requisition?.budget_source && (
            <InfoRow icon={DollarSign} label="Budget Source" value={requisition.budget_source} />
          )}
          {requisition?.funding_source && (
            <InfoRow icon={Building2} label="Funding Source" value={requisition.funding_source} />
          )}
          {requisition?.project_code && (
            <InfoRow icon={Briefcase} label="Project Code" value={requisition.project_code} valueClassName="font-mono" />
          )}
          {requisition?.procurement_method && (
            <InfoRow icon={ShoppingCart} label="Procurement Method" value={requisition.procurement_method.replace(/_/g, ' ')} />
          )}
        </div>

        {/* Special Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {isEmergency && (
            <div className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-200/30 dark:border-red-800/30 flex items-center gap-3">
              <Zap className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Emergency Procurement</p>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">Fast-track approval process</p>
              </div>
            </div>
          )}

          {isReturned && requisition?.returned_at && (
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/30 dark:border-amber-800/30">
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Returned At</p>
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{formatDate(requisition.returned_at)}</p>
                </div>
              </div>
              {requisition?.return_reason && (
                <div className="mt-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Reason:</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{requisition.return_reason}</p>
                </div>
              )}
            </div>
          )}

          {requisition?.return_count > 0 && (
            <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Return Count</p>
                <p className="text-lg font-semibold">{requisition.return_count}x</p>
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <InfoRow icon={Calendar} label="Created At" value={formatDate(requisition?.created_at)} />
          <InfoRow icon={CalendarDays} label="Submitted At" value={formatDate(requisition?.submitted_at)} />
          {requisition?.required_by_date && (
            <InfoRow icon={Timer} label="Required By" value={formatDate(requisition?.required_by_date)} />
          )}
          {requisition?.required_delivery_date && (
            <InfoRow icon={Truck} label="Required Delivery" value={formatDate(requisition?.required_delivery_date)} />
          )}
        </div>
      </DetailCard>

      {/* Requester Information */}
      <DetailCard title="Requester Information" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoRow icon={User} label="Full Name" value={requester?.full_name || requester?.name || 'N/A'} />
          <InfoRow icon={Mail} label="Email" value={requester?.email || 'N/A'} />
          <InfoRow icon={Phone} label="Phone" value={requester?.phone || 'N/A'} />
          <InfoRow icon={Building2} label="Department" value={department?.name || 'N/A'} />
          {department?.code && (
            <InfoRow icon={Hash} label="Department Code" value={department.code} valueClassName="font-mono" />
          )}
          {requester?.id_number && (
            <InfoRow icon={CreditCard} label="ID Number" value={requester.id_number} />
          )}
        </div>
      </DetailCard>

      {/* Approval Progress */}
      <DetailCard title="Approval Progress" icon={TrendingUp}>
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
                      "flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-500 shadow-lg",
                      isCompleted && "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/30",
                      isCurrent && !isDeclined && !isReturned && "bg-amber-500 border-amber-500 text-white shadow-amber-500/30",
                      isLevelDeclined && "bg-red-500 border-red-500 text-white shadow-red-500/30",
                      !isCompleted && !isCurrent && !isLevelDeclined && "bg-muted/50 border-muted-foreground/30 text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="h-7 w-7" />
                      ) : isCurrent && !isDeclined && !isReturned ? (
                        <Loader2 className="h-7 w-7 animate-spin" />
                      ) : isLevelDeclined ? (
                        <XCircle className="h-7 w-7" />
                      ) : (
                        <Icon className="h-7 w-7" />
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
                    "text-sm font-medium mt-2 text-center",
                    isCompleted && "text-emerald-600 dark:text-emerald-400",
                    isCurrent && !isDeclined && !isReturned && "text-amber-600 dark:text-amber-400",
                    isLevelDeclined && "text-red-600 dark:text-red-400",
                    !isCompleted && !isCurrent && !isLevelDeclined && "text-muted-foreground"
                  )}>
                    {levelInfo.name}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {isCompleted ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Approved</span>
                    ) : isCurrent && !isDeclined && !isReturned ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Pending</span>
                    ) : isLevelDeclined ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">Declined</span>
                    ) : (
                      <span className="text-muted-foreground">Waiting</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Summary */}
          <div className="flex items-center justify-center gap-6 pt-2 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              Approved: <span className="font-medium text-emerald-600 dark:text-emerald-400">{approvalCount}</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              Pending: <span className="font-medium text-amber-600 dark:text-amber-400">{pendingApprovals.length}</span>
            </span>
            {isDeclined && (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                Declined
              </span>
            )}
            {isReturned && (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                Returned
              </span>
            )}
          </div>
        </div>
      </DetailCard>
    </div>
  );
};

export default RequisitionOverviewTab;
