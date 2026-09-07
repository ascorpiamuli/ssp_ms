// frontend/src/app/(dashboard)/procurement/supplier/rfq-invitations/[id]/page.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  Users,
  Mail,
  Calendar,
  Building2,
  User,
  Package,
  TrendingUp,
  AlertTriangle,
  Info,
  MessageSquare,
  Box,
  Activity,
  Shield,
  Briefcase,
  Ban,
  Send,
  Edit,
  Trash2,
  Truck,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  FileCheck,
  ShoppingCart,
  Building,
  MapPin,
  Phone,
  AtSign,
  Globe2,
  CalendarDays,
  Hourglass,
  Target,
  Award,
  Lock,
  CreditCard,
  DollarSign,
  Tag,
  Hash,
  Bell,
  Timer,
  ClipboardList,
  UserCog,
  FileSpreadsheet,
  RotateCcw,
  Construction,
  Wrench,
  HardHat,
  PenTool,
  Settings,
  Toolbox,
  Compass,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar as AvatarComponent, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Hooks
import { useSuppliers } from '@/hooks/useSuppliers';
import { useQuotation } from '@/hooks/useQuotation';

// Types
import type { QuotationRequest } from '@/types/quotations.types';
import type { Requisition, ServiceCategory } from '@/types/requisition.types';


// ============================================
// CONSTANTS
// ============================================

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  consultancy: 'Consultancy Services',
  maintenance: 'Maintenance & Repair',
  training: 'Training & Development',
  installation: 'Installation Services',
  cleaning: 'Cleaning & Sanitation',
  security: 'Security Services',
  transport: 'Transport & Logistics',
  construction: 'Construction & Renovation',
  professional_services: 'Professional Services',
  it_services: 'IT Services',
  other: 'Other Services',
};

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'N/A';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'N/A';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getTimeRemaining = (closingDate: string | Date | null | undefined): {
  text: string;
  days: number;
  isExpired: boolean;
  isClosingSoon: boolean;
} => {
  if (!closingDate) return { text: 'N/A', days: 0, isExpired: false, isClosingSoon: false };
  try {
    const now = new Date();
    const closing = new Date(closingDate);
    const diff = closing.getTime() - now.getTime();

    if (diff < 0) {
      return { text: 'Closed', days: 0, isExpired: true, isClosingSoon: false };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let text = '';
    if (days > 0) {
      text = `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      text = `${hours}h remaining`;
    } else {
      text = 'Less than an hour';
    }

    return {
      text,
      days,
      isExpired: false,
      isClosingSoon: days < 3 || (days === 0 && hours < 24),
    };
  } catch {
    return { text: 'N/A', days: 0, isExpired: false, isClosingSoon: false };
  }
};

const getUserName = (user: { full_name?: string; first_name?: string; last_name?: string } | number | null | undefined): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'number') return 'User ' + user;
  if (typeof user === 'object') {
    return user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown';
  }
  return 'Unknown';
};

const getUserEmail = (user: { email?: string } | number | null | undefined): string => {
  if (!user) return '';
  if (typeof user === 'number') return '';
  if (typeof user === 'object') {
    return user.email || '';
  }
  return '';
};

const getApproverName = (approver: { full_name?: string; first_name?: string; last_name?: string } | null | undefined): string => {
  if (!approver) return 'Unknown';
  return approver.full_name || [approver.first_name, approver.last_name].filter(Boolean).join(' ') || 'Unknown';
};

const getServiceCategoryLabel = (category: string | null | undefined): string => {
  if (!category) return 'N/A';
  return SERVICE_CATEGORY_LABELS[category] || category.replace(/_/g, ' ');
};

const isServiceRequisition = (requisition: any): boolean => {
  if (!requisition) return false;
  if (requisition.is_service_requisition === true) return true;
  if (requisition.is_goods_requisition === true) return false;
  return requisition.requisition_type === 'services';
};

// ============================================
// STATUS CONFIGURATIONS
// ============================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    icon: Edit,
  },
  sent: {
    label: 'Open for Bidding',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: Mail,
  },
  responded: {
    label: 'Bids Received',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    icon: Users,
  },
  evaluating: {
    label: 'Under Evaluation',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    icon: Clock,
  },
  closed: {
    label: 'Closed',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    icon: Ban,
  },
  expired: {
    label: 'Expired',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: AlertCircle,
  },
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status, isExpired, className }: { status: string; isExpired?: boolean; className?: string }) => {
  const statusKey = isExpired ? 'expired' : status;
  const config = STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
  const Icon = config.icon;

  return (
    <Badge className={cn("flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-full text-sm", config.color, className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

const BlurredPrice = ({ amount, className, showLock = true }: { amount?: number | string | null; className?: string; showLock?: boolean }) => {
  return (
    <div className={cn("inline-flex items-center gap-2 select-none", className)}>
      <span className="font-mono text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg text-transparent blur-sm select-none">
        {formatCurrency(amount || 0)}
      </span>
      {showLock && (
        <Lock className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
      )}
    </div>
  );
};

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
      <div className={cn("text-base font-medium mt-0.5", valueClassName)}>{value || 'N/A'}</div>
    </div>
  </div>
);

const ExpandableText = ({ text, maxLines = 3 }: { text: string | null | undefined; maxLines?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return <p className="text-muted-foreground italic">No information provided</p>;

  const lines = text.split('\n') || [];
  const shouldTruncate = lines.length > maxLines || text.length > 300;

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

const ApprovalsTimeline = ({ approvals }: { approvals: any[] }) => {
  if (!approvals || approvals.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
        <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No approval records found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'pending': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-gray-100 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="relative space-y-4">
      {approvals.map((approval: any, index: number) => {
        const colorClass = getStatusColor(approval.status);
        const isLast = index === approvals.length - 1;
        const approverName = getApproverName(approval.approver);

        return (
          <div key={approval.id} className="relative flex gap-4 group">
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-muted-foreground/20 group-hover:bg-muted-foreground/40 transition-colors" />
            )}

            <div className={cn("p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 border", colorClass)}>
              {approval.status === 'approved' ? (
                <CheckCircle className="h-5 w-5" />
              ) : approval.status === 'rejected' ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1 space-y-1.5 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{approval.level_label}</p>
                <Badge variant="outline" className="text-xs rounded-full">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDateTime(approval.updated_at)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {approverName}
              </p>
              {approval.comment && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  "{approval.comment}"
                </p>
              )}
              <Badge className={cn(
                "text-xs rounded-full",
                approval.status === 'approved' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
                  approval.status === 'rejected' ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
              )}>
                {approval.status_label}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function SupplierRFQInvitationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [showDeclineDialog, setShowDeclineDialog] = useState(false);

  const { useSupplierProfileExists } = useSuppliers();
  const { exists: hasSupplierProfile, supplier } = useSupplierProfileExists();

  const { data: quotation, isLoading, refetch } = useQuotation(id);

  const supplierId = useMemo(() => {
    if (!supplier) return undefined;
    return (supplier as any)?.id as number | undefined;
  }, [supplier]);

  const hasResponded = useMemo(() => {
    if (!quotation || !supplierId) return false;
    if (quotation.responded_suppliers && Array.isArray(quotation.responded_suppliers)) {
      return quotation.responded_suppliers.includes(supplierId);
    }
    return false;
  }, [quotation, supplierId]);

  const hasDeclined = useMemo(() => {
    if (!quotation || !supplierId) return false;
    if (quotation.declined_suppliers && Array.isArray(quotation.declined_suppliers)) {
      return quotation.declined_suppliers.includes(supplierId);
    }
    return false;
  }, [quotation, supplierId]);

  const canRespond = useMemo(() => {
    if (!quotation) return false;
    const isExpired = quotation.is_expired;
    const isClosed = quotation.status === 'closed' || quotation.status === 'cancelled';
    return !isExpired && !isClosed && !hasResponded && !hasDeclined && quotation.status === 'sent';
  }, [quotation, hasResponded, hasDeclined]);

  const isExpired = quotation?.is_expired || false;
  const isClosingSoon = quotation?.is_closing_soon || false;

  const handleBack = () => router.back();
  const handleRefresh = () => refetch();

  const handleSubmitQuotation = () => {
    router.push(`/procurement/supplier/rfq-invitations/${id}/submit`);
  };

  const handleDecline = () => setShowDeclineDialog(true);
  const handleDeclineConfirm = () => {
    setShowDeclineDialog(false);
    refetch();
  };

  const extendedRequisition = quotation?.requisition as unknown as Requisition | undefined;
  const isService = useMemo(() => isServiceRequisition(extendedRequisition), [extendedRequisition]);
  const timeRemaining = getTimeRemaining(quotation?.closing_date);
  const generatedByName = getUserName(quotation?.generated_by);

  if (isLoading) {
    return (
      <PageTemplate
        title="RFQ Invitation"
        description="Loading invitation details..."
        icon={<Mail className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'RFQ Invitations', href: '/procurement/supplier/rfq-invitations' },
          { label: 'Loading...' },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </PageTemplate>
    );
  }

  if (!quotation) {
    return (
      <PageTemplate
        title="RFQ Not Found"
        description="The requested RFQ invitation could not be found"
        icon={<AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'RFQ Invitations', href: '/procurement/supplier/rfq-invitations' },
          { label: 'Not Found' },
        ]}
      >
        <Card className="border shadow-sm rounded-xl">
          <CardContent className="text-center py-16">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">RFQ Not Found</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                The RFQ invitation you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={handleBack} className="gap-2 rounded-lg">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`RFQ ${quotation.qtn_number}`}
      description={quotation.title}
      icon={<Mail className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier', href: '/procurement/supplier' },
        { label: 'RFQ Invitations', href: '/procurement/supplier/rfq-invitations' },
        { label: quotation.qtn_number },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 h-9 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {canRespond && (
            <Button
              size="sm"
              onClick={handleSubmitQuotation}
              className="gap-2 h-9 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 rounded-lg"
            >
              <Send className="h-4 w-4" />
              Submit Quotation
            </Button>
          )}

          {!canRespond && !hasResponded && !hasDeclined && quotation.status === 'sent' && isExpired && (
            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 rounded-full px-4 py-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              Expired
            </Badge>
          )}

          {hasResponded && (
            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Quotation Submitted
            </Badge>
          )}

          {hasDeclined && (
            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 rounded-full px-4 py-2">
              <XCircle className="h-4 w-4 mr-2" />
              Declined
            </Badge>
          )}

          {!canRespond && !hasResponded && !hasDeclined && quotation.status !== 'sent' && !isExpired && (
            <Badge variant="outline" className="rounded-full px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              Not Accepting Responses
            </Badge>
          )}

          {canRespond && !hasDeclined && !hasResponded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecline}
              className="gap-2 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 h-9 rounded-lg">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Alerts */}
        {isExpired && !hasResponded && !hasDeclined && (
          <Alert className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold">
                  This RFQ Has Expired
                </AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  The closing date has passed. You can no longer submit a quotation for this RFQ.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {isClosingSoon && !isExpired && !hasResponded && !hasDeclined && canRespond && (
          <Alert className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl animate-pulse">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <AlertTitle className="text-blue-800 dark:text-blue-300 font-semibold">
                  Closing Soon - Submit Your Quotation
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  This RFQ is closing soon. Please submit your quotation before the deadline.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {hasResponded && (
          <Alert className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <AlertTitle className="text-emerald-800 dark:text-emerald-300 font-semibold">
                  Quotation Submitted Successfully
                </AlertTitle>
                <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                  Your quotation has been submitted. You will be notified of the evaluation results.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {hasDeclined && (
          <Alert className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertTitle className="text-red-800 dark:text-red-300 font-semibold">
                  You Declined This RFQ
                </AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-400">
                  You have declined this RFQ. You will not be able to submit a quotation for it.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Header Card */}
        <Card className="border shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {quotation.qtn_number}
                    </h2>
                    <StatusBadge status={quotation.status} isExpired={isExpired} />
                    {isClosingSoon && !isExpired && (
                      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 animate-pulse">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Closing Soon
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {quotation.title}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {quotation.requisition?.reference_number || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Issued by: {generatedByName}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeRemaining.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidentiality Banner */}
        <Alert className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold">
                Pricing Information is Confidential
              </AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                Estimated prices are not visible to suppliers. Submit your own competitive quotation.
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Section */}
            <Card className="border shadow-sm rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    isService ? "bg-purple-100 dark:bg-purple-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                  )}>
                    {isService ? (
                      <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  {isService ? 'Service Items & Specifications' : 'Items & Specifications'}
                </CardTitle>
                <CardDescription>
                  {isService ? 'Service items required for this RFQ with scope and deliverables' : 'Items required for this RFQ with quantities and specifications'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : !extendedRequisition?.items || extendedRequisition.items.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No {isService ? 'service' : ''} items found for this RFQ</p>
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden dark:border-gray-700">
                    <ScrollArea className="w-full max-h-[400px]">
                      <Table>
                        <TableHeader className="sticky top-0 z-10">
                          <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                            <TableHead className="min-w-[150px] py-3.5 text-xs font-semibold uppercase tracking-wider">{isService ? 'Service' : 'Item'}</TableHead>
                            <TableHead className="min-w-[120px] py-3.5 text-xs font-semibold uppercase tracking-wider">Description</TableHead>
                            <TableHead className="text-center w-[80px] py-3.5 text-xs font-semibold uppercase tracking-wider">Qty</TableHead>
                            <TableHead className="text-center w-[100px] py-3.5 text-xs font-semibold uppercase tracking-wider">Unit</TableHead>
                            <TableHead className="min-w-[200px] py-3.5 text-xs font-semibold uppercase tracking-wider">Specifications</TableHead>
                            <TableHead className="text-right w-[140px] py-3.5 text-xs font-semibold uppercase tracking-wider">Est. Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {extendedRequisition.items.map((item: any) => (
                            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                              <TableCell>
                                <div>
                                  <p className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {item.item_name}
                                  </p>
                                  {item.catalog_number && (
                                    <p className="text-xs text-muted-foreground">
                                      <Hash className="h-3 w-3 inline mr-0.5" />
                                      {item.catalog_number}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm text-muted-foreground">{item.description || '—'}</p>
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {parseFloat(item.quantity).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-center text-sm text-muted-foreground">
                                {item.unit_of_measure || (isService ? 'Service' : 'Unit')}
                              </TableCell>
                              <TableCell>
                                {item.specifications ? (
                                  <p className="text-sm text-muted-foreground max-w-[250px] line-clamp-2">
                                    {item.specifications}
                                  </p>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <BlurredPrice amount={item.estimated_unit_cost} showLock={true} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  Estimated prices are confidential
                </div>
              </CardFooter>
            </Card>

            {/* Service Details (if service) or Requisition Details */}
            <Card className="border shadow-sm rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    isService ? "bg-purple-100 dark:bg-purple-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                  )}>
                    {isService ? (
                      <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  {isService ? 'Service Details' : 'Requisition Details'}
                </CardTitle>
                <CardDescription>
                  {isService ? 'Detailed service information for this RFQ' : 'Original requisition information for this RFQ'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {extendedRequisition ? (
                  <div className="space-y-4">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reference</p>
                        <p className="font-medium mt-0.5">{extendedRequisition.reference_number}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                        <Badge className="mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          {extendedRequisition.status_label}
                        </Badge>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Priority</p>
                        <Badge className={cn(
                          "mt-0.5 rounded-full",
                          extendedRequisition.priority === 'high' ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                            extendedRequisition.priority === 'medium' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                              "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        )}>
                          {extendedRequisition.priority_label}
                        </Badge>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Type</p>
                        <p className="font-medium mt-0.5">{extendedRequisition.type_label}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Risk Level</p>
                        <p className="font-medium mt-0.5">{extendedRequisition.risk_level_label}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Department</p>
                        <p className="font-medium mt-0.5">{(extendedRequisition as any).department?.name || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Service-Specific Details */}
                    {isService && (
                      <div className="space-y-3">
                        <Separator className="my-3" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {extendedRequisition.service_category && (
                            <InfoRow
                              icon={Tag}
                              label="Service Category"
                              value={getServiceCategoryLabel(extendedRequisition.service_category)}
                            />
                          )}
                          {extendedRequisition.service_scope_of_work && (
                            <div className="col-span-2">
                              <InfoRow
                                icon={ClipboardList}
                                label="Scope of Work"
                                value={<ExpandableText text={extendedRequisition.service_scope_of_work} maxLines={2} />}
                              />
                            </div>
                          )}
                          {extendedRequisition.service_deliverables_expected && (
                            <div className="col-span-2">
                              <InfoRow
                                icon={Target}
                                label="Expected Deliverables"
                                value={<ExpandableText text={extendedRequisition.service_deliverables_expected} maxLines={2} />}
                              />
                            </div>
                          )}
                          {extendedRequisition.service_expected_start_date && (
                            <InfoRow
                              icon={Calendar}
                              label="Service Start Date"
                              value={formatDate(extendedRequisition.service_expected_start_date)}
                            />
                          )}
                          {extendedRequisition.service_expected_end_date && (
                            <InfoRow
                              icon={CalendarDays}
                              label="Service End Date"
                              value={formatDate(extendedRequisition.service_expected_end_date)}
                            />
                          )}
                          {extendedRequisition.service_estimated_duration_days && (
                            <InfoRow
                              icon={Timer}
                              label="Estimated Duration"
                              value={`${extendedRequisition.service_estimated_duration_days} days`}
                            />
                          )}
                          {extendedRequisition.service_requires_onsite_visit !== undefined && extendedRequisition.service_requires_onsite_visit !== null && (
                            <InfoRow
                              icon={MapPin}
                              label="Requires Onsite Visit"
                              value={extendedRequisition.service_requires_onsite_visit ? 'Yes' : 'No'}
                              valueClassName={extendedRequisition.service_requires_onsite_visit ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}
                            />
                          )}
                          {extendedRequisition.service_special_requirements && (
                            <div className="col-span-2">
                              <InfoRow
                                icon={AlertTriangle}
                                label="Special Requirements"
                                value={<ExpandableText text={extendedRequisition.service_special_requirements} maxLines={2} />}
                              />
                            </div>
                          )}
                          {extendedRequisition.service_qualifications_required && (
                            <div className="col-span-2">
                              <InfoRow
                                icon={UserCog}
                                label="Qualifications Required"
                                value={<ExpandableText text={extendedRequisition.service_qualifications_required} maxLines={2} />}
                              />
                            </div>
                          )}
                          {extendedRequisition.service_experience_required && (
                            <div className="col-span-2">
                              <InfoRow
                                icon={Award}
                                label="Experience Required"
                                value={<ExpandableText text={extendedRequisition.service_experience_required} maxLines={2} />}
                              />
                            </div>
                          )}
                          {extendedRequisition.service_certifications_required && (
                            <div className="col-span-2">
                              <InfoRow
                                icon={FileCheck}
                                label="Certifications Required"
                                value={<ExpandableText text={extendedRequisition.service_certifications_required} maxLines={2} />}
                              />
                            </div>
                          )}
                          {extendedRequisition.service_insurance_required !== undefined && extendedRequisition.service_insurance_required !== null && (
                            <InfoRow
                              icon={Shield}
                              label="Insurance Required"
                              value={extendedRequisition.service_insurance_required ? 'Yes' : 'No'}
                              valueClassName={extendedRequisition.service_insurance_required ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}
                            />
                          )}
                          {extendedRequisition.service_insurance_details && (
                            <div className="col-span-2">
                              <InfoRow
                                icon={Shield}
                                label="Insurance Details"
                                value={<ExpandableText text={extendedRequisition.service_insurance_details} maxLines={2} />}
                              />
                            </div>
                          )}
                          {extendedRequisition.service_contract_type && (
                            <InfoRow
                              icon={FileSpreadsheet}
                              label="Contract Type"
                              value={extendedRequisition.service_contract_type.replace(/_/g, ' ')}
                            />
                          )}
                          {extendedRequisition.service_contract_duration && (
                            <InfoRow
                              icon={Hourglass}
                              label="Contract Duration"
                              value={extendedRequisition.service_contract_duration}
                            />
                          )}
                          {extendedRequisition.service_renewal_options && (
                            <InfoRow
                              icon={RotateCcw}
                              label="Renewal Options"
                              value={extendedRequisition.service_renewal_options}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Goods-Specific Details */}
                    {!isService && extendedRequisition.goods_category && (
                      <div className="space-y-3">
                        <Separator className="my-3" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {extendedRequisition.goods_category && (
                            <InfoRow
                              icon={Tag}
                              label="Goods Category"
                              value={extendedRequisition.goods_category.replace(/_/g, ' ')}
                            />
                          )}
                          {extendedRequisition.goods_warehouse_location && (
                            <InfoRow
                              icon={MapPin}
                              label="Warehouse Location"
                              value={extendedRequisition.goods_warehouse_location}
                            />
                          )}
                          {extendedRequisition.goods_storage_requirements && (
                            <InfoRow
                              icon={Shield}
                              label="Storage Requirements"
                              value={extendedRequisition.goods_storage_requirements}
                            />
                          )}
                          {extendedRequisition.goods_expected_delivery_date && (
                            <InfoRow
                              icon={Truck}
                              label="Expected Delivery Date"
                              value={formatDate(extendedRequisition.goods_expected_delivery_date)}
                            />
                          )}
                          {extendedRequisition.goods_delivery_terms && (
                            <InfoRow
                              icon={FileCheck}
                              label="Delivery Terms"
                              value={extendedRequisition.goods_delivery_terms}
                            />
                          )}
                          {extendedRequisition.goods_warranty_required !== undefined && extendedRequisition.goods_warranty_required !== null && (
                            <InfoRow
                              icon={Shield}
                              label="Warranty Required"
                              value={extendedRequisition.goods_warranty_required ? 'Yes' : 'No'}
                              valueClassName={extendedRequisition.goods_warranty_required ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}
                            />
                          )}
                          {extendedRequisition.goods_warranty_period && (
                            <InfoRow
                              icon={Clock}
                              label="Warranty Period"
                              value={extendedRequisition.goods_warranty_period}
                            />
                          )}
                          {extendedRequisition.goods_specifications && (
                            <div className="col-span-2">
                              <InfoRow
                                icon={FileText}
                                label="Specifications"
                                value={<ExpandableText text={extendedRequisition.goods_specifications} maxLines={2} />}
                              />
                            </div>
                          )}
                          {extendedRequisition.goods_quality_requirements && (
                            <div className="col-span-2">
                              <InfoRow
                                icon={Award}
                                label="Quality Requirements"
                                value={<ExpandableText text={extendedRequisition.goods_quality_requirements} maxLines={2} />}
                              />
                            </div>
                          )}
                          {extendedRequisition.goods_installation_required !== undefined && extendedRequisition.goods_installation_required !== null && (
                            <InfoRow
                              icon={Construction}
                              label="Installation Required"
                              value={extendedRequisition.goods_installation_required ? 'Yes' : 'No'}
                              valueClassName={extendedRequisition.goods_installation_required ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No details available</p>
                )}
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            {(quotation.delivery_terms || quotation.payment_terms || quotation.special_conditions) && (
              <Card className="border shadow-sm rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <FileCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quotation.delivery_terms && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Delivery Terms</p>
                          <p className="font-medium">{quotation.delivery_terms}</p>
                        </div>
                      </div>
                    )}
                    {quotation.payment_terms && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Terms</p>
                          <p className="font-medium">{quotation.payment_terms}</p>
                        </div>
                      </div>
                    )}
                    {quotation.special_conditions && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 md:col-span-2">
                        <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Special Conditions</p>
                          <p className="font-medium">{quotation.special_conditions}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            {quotation.instructions && (
              <Card className="border shadow-sm rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{quotation.instructions}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* RFQ Information */}
            <Card className="border shadow-sm rounded-xl">
              <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Info className="h-4 w-4 text-gray-500" />
                  RFQ Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <StatusBadge status={quotation.status} isExpired={isExpired} />
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Issue Date</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{formatDate(quotation.issue_date)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Closing Date</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{formatDate(quotation.closing_date)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Time Remaining</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{timeRemaining.text}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Requisition Type</span>
                  <Badge className={cn(
                    "rounded-full px-3 py-1",
                    isService
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  )}>
                    {isService ? 'Services (LSO)' : 'Goods (LPO)'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Items</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{extendedRequisition?.items?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Generated By */}
            <Card className="border shadow-sm rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <AvatarComponent className="h-12 w-12 border border-gray-200 dark:border-gray-700">
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-base font-semibold">
                      {getInitials(generatedByName)}
                    </AvatarFallback>
                  </AvatarComponent>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Generated By</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{generatedByName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{getUserEmail(quotation.generated_by)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="border shadow-sm rounded-xl">
              <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Rocket className="h-4 w-4 text-gray-500" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {canRespond && (
                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl h-11 shadow-lg shadow-emerald-600/20"
                    onClick={handleSubmitQuotation}
                  >
                    <Send className="h-4 w-4" />
                    Submit Quotation
                  </Button>
                )}

                {canRespond && !hasDeclined && !hasResponded && (
                  <Button
                    className="w-full gap-2 rounded-xl h-11 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    variant="outline"
                    onClick={handleDecline}
                  >
                    <XCircle className="h-4 w-4" />
                    Decline RFQ
                  </Button>
                )}

                {hasResponded && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Quotation Submitted</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">You have already submitted your quotation</p>
                  </div>
                )}

                {hasDeclined && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-center">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">RFQ Declined</p>
                    <p className="text-xs text-red-600 dark:text-red-400">You have declined this RFQ</p>
                  </div>
                )}

                {!canRespond && !hasResponded && !hasDeclined && quotation.status === 'sent' && isExpired && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">RFQ Expired</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">The closing date has passed</p>
                  </div>
                )}

                {!canRespond && !hasResponded && !hasDeclined && quotation.status !== 'sent' && !isExpired && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                    <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Not Accepting Responses</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">This RFQ is not open for bidding</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Decline RFQ
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline <strong>{quotation.qtn_number}</strong>?
              <br />
              <span className="text-xs text-muted-foreground">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeclineConfirm} className="bg-red-600 hover:bg-red-700 rounded-xl gap-2">
              <XCircle className="h-4 w-4" />
              Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}
