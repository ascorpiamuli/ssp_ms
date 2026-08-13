// frontend/src/app/(dashboard)/procurement/supplier/rfq-invitations/[id]/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
  CheckCircle2,
  XCircle as XCircleIcon,
  AlertOctagon,
  Clock as ClockIcon,
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
  Briefcase as BriefcaseIcon2,
  CalendarDays,
  Hourglass,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon2,
  Award as AwardIcon2,
  Users as UsersIcon2,
  CheckCircle as CheckCircleIcon2,
  XCircle as XCircleIcon2,
  AlertTriangle as AlertTriangleIcon2,
  Lock,
  Unlock,
  EyeOff,
  ShieldQuestion,
  Sparkles,
  CreditCard,
  Coins,
  Wallet,
  Fingerprint,
  Key,
  ScanEye,
  Binary,
  Zap,
  Crown,
  Gem,
  Star,
  Gift,
  Rocket,
  Flame,
  Sparkle,
  ExternalLink,
  DollarSign,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar as AvatarComponent, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';

// Hooks
import { useSuppliers } from '@/hooks/useSuppliers';
import { useQuotation } from '@/hooks/useQuotation';
import {
  useCreateSupplierQuotation,
} from '@/hooks/useSupplierQuotation';

// Types
import type { QuotationRequest } from '@/types/quotations.types';
import type { Requisition } from '@/types/requisition.types';

// ============================================
// TYPE EXTENSIONS
// ============================================

// Extended Requisition type with items and approvals
interface ExtendedRequisition extends Requisition {
  items: any[];
  approvals: any[];
}

// ============================================
// CONSTANTS
// ============================================

const CURRENCY = 'KES';

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

const getTimeRemaining = (closingDate: string | Date): string => {
  if (!closingDate) return 'N/A';
  try {
    const now = new Date();
    const closing = new Date(closingDate);
    const diff = closing.getTime() - now.getTime();

    if (diff < 0) return 'Closed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m remaining`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  } catch {
    return 'N/A';
  }
};

// Helper to safely get user name from QuotationUser | number
const getUserName = (user: { full_name?: string; first_name?: string; last_name?: string } | number | null | undefined): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'number') return 'User ' + user;
  if (typeof user === 'object') {
    return user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown';
  }
  return 'Unknown';
};

// Helper to safely get user email
const getUserEmail = (user: { email?: string } | number | null | undefined): string => {
  if (!user) return '';
  if (typeof user === 'number') return '';
  if (typeof user === 'object') {
    return user.email || '';
  }
  return '';
};

// Helper to safely get approver name
const getApproverName = (approver: { full_name?: string; first_name?: string; last_name?: string } | null | undefined): string => {
  if (!approver) return 'Unknown';
  return approver.full_name || [approver.first_name, approver.last_name].filter(Boolean).join(' ') || 'Unknown';
};

// ============================================
// STATUS CONFIGURATIONS
// ============================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; description: string }> = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    icon: Edit,
    description: 'This RFQ is still in draft',
  },
  sent: {
    label: 'Open for Bidding',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: Mail,
    description: 'Suppliers can submit their quotations',
  },
  responded: {
    label: 'Bids Received',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    icon: Users,
    description: 'Suppliers have submitted their quotations',
  },
  evaluating: {
    label: 'Under Evaluation',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    icon: Clock,
    description: 'Quotations are being evaluated',
  },
  closed: {
    label: 'Closed',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle,
    description: 'This RFQ is closed',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    icon: Ban,
    description: 'This RFQ has been cancelled',
  },
  expired: {
    label: 'Expired',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: AlertCircle,
    description: 'The closing date has passed',
  },
};

// ============================================
// SUB-COMPONENTS
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

// ============================================
// BLURRED PRICE
// ============================================

interface BlurredPriceProps {
  amount?: number | string | null;
  className?: string;
  showLock?: boolean;
}

const BlurredPrice = ({ amount, className, showLock = true }: BlurredPriceProps) => {
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

// ============================================
// HEADER CARD
// ============================================

interface HeaderCardProps {
  quotation: QuotationRequest;
}

const HeaderCard = ({ quotation }: HeaderCardProps) => {
  const isExpired = quotation.is_expired;
  const isClosingSoon = quotation.is_closing_soon;
  const timeRemaining = getTimeRemaining(quotation.closing_date);
  const generatedByName = getUserName(quotation.generated_by);

  return (
    <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{quotation.qtn_number}</h1>
              <StatusBadge status={quotation.status} isExpired={isExpired} />
              {isClosingSoon && !isExpired && (
                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse rounded-full">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Closing Soon
                </Badge>
              )}
            </div>

            <h2 className="text-xl font-semibold text-muted-foreground">{quotation.title}</h2>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Requisition: {quotation.requisition?.reference_number || 'N/A'}</span>
              <Separator orientation="vertical" className="h-4" />
              <User className="h-4 w-4" />
              <span>Issued by: {generatedByName}</span>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <p className={cn(
                  "text-lg font-bold",
                  isExpired ? "text-red-500" :
                    isClosingSoon ? "text-amber-500" :
                      "text-emerald-500"
                )}>
                  {timeRemaining}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Closing Date</p>
                <p className="font-medium">{formatDateTime(quotation.closing_date)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// STATS GRID
// ============================================

interface StatsGridProps {
  quotation: QuotationRequest;
}

const StatsGrid = ({ quotation }: StatsGridProps) => {
  const stats = [
    {
      label: 'Response Count',
      value: quotation.response_count || 0,
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Response Rate',
      value: `${quotation.response_rate || 0}%`,
      icon: TrendingUp,
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total Items',
      value: (quotation.requisition as ExtendedRequisition)?.items?.length || 0,
      icon: Package,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className={cn("p-2 rounded-xl", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ============================================
// REQUISITION DETAILS
// ============================================

interface RequisitionDetailsProps {
  requisition: ExtendedRequisition | null | undefined;
}

const RequisitionDetails = ({ requisition }: RequisitionDetailsProps) => {
  if (!requisition) return null;

  const details = [
    { label: 'Reference Number', value: requisition.reference_number },
    { label: 'Status', value: requisition.status_label },
    { label: 'Priority', value: requisition.priority_label },
    { label: 'Type', value: requisition.type_label },
    { label: 'Risk Level', value: requisition.risk_level_label },
    { label: 'Department', value: requisition.department?.name || 'N/A' },
  ];

  return (
    <Card className="border-0 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Requisition Details
        </CardTitle>
        <CardDescription>
          Original requisition information for this RFQ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {details.map((detail, index) => (
            <div key={index}>
              <p className="text-sm text-muted-foreground">{detail.label}</p>
              <p className="font-medium">{detail.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// ITEMS TABLE
// ============================================

interface ItemsTableProps {
  items: any[];
  isLoading: boolean;
}

const ItemsTable = ({ items, isLoading }: ItemsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No items found for this RFQ</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-gray-800/50">
              <TableHead className="min-w-[150px]">Item</TableHead>
              <TableHead className="min-w-[120px]">Description</TableHead>
              <TableHead className="text-center w-[80px]">Quantity</TableHead>
              <TableHead className="text-center w-[100px]">Unit</TableHead>
              <TableHead className="min-w-[200px]">Specifications</TableHead>
              <TableHead className="text-right w-[140px]">Est. Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any) => (
              <TableRow key={item.id} className="hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors">
                <TableCell>
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    {item.catalog_number && (
                      <p className="text-xs text-muted-foreground">
                        Catalog: {item.catalog_number}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">
                    {item.description || '—'}
                  </p>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {parseFloat(item.quantity).toLocaleString()}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {item.unit_of_measure || 'Unit'}
                </TableCell>
                <TableCell>
                  {item.specifications ? (
                    <p className="text-sm text-muted-foreground max-w-[250px]">
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
  );
};

// ============================================
// APPROVALS TIMELINE
// ============================================

interface ApprovalsTimelineProps {
  approvals: any[];
}

const ApprovalsTimeline = ({ approvals }: ApprovalsTimelineProps) => {
  if (!approvals || approvals.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No approval records found</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle2;
      case 'rejected':
        return XCircleIcon;
      case 'pending':
        return ClockIcon;
      default:
        return AlertOctagon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30';
      case 'rejected':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'pending':
        return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-800/30';
    }
  };

  return (
    <div className="relative space-y-4">
      {approvals.map((approval: any, index: number) => {
        const Icon = getStatusIcon(approval.status);
        const colorClass = getStatusColor(approval.status);
        const isLast = index === approvals.length - 1;
        const approverName = getApproverName(approval.approver);

        return (
          <div key={approval.id} className="relative flex gap-4">
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-muted-foreground/20" />
            )}

            <div className={cn("p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0", colorClass)}>
              <Icon className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {approval.level_label}
                </p>
                <Badge variant="outline" className="text-xs">
                  {formatDateTime(approval.updated_at)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {approverName}
              </p>
              {approval.comment && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
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
// CONFIDENTIALITY BANNER
// ============================================

const ConfidentialityBanner = () => {
  return (
    <Card className="border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex-shrink-0">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-amber-700 dark:text-amber-300">
              Pricing Information is Confidential
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400/80">
              Estimated prices are not visible to suppliers. Submit your own competitive quotation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
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

  // Safe supplier ID
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

  const canRespond = useMemo(() => {
    if (!quotation) return false;
    const isExpired = quotation.is_expired;
    const isClosed = quotation.status === 'closed' || quotation.status === 'cancelled';
    return !isExpired && !isClosed && !hasResponded && quotation.status === 'sent';
  }, [quotation, hasResponded]);

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

  // Cast requisition to ExtendedRequisition
  const extendedRequisition = quotation?.requisition as unknown as ExtendedRequisition | undefined;

  if (isLoading) {
    return (
      <PageTemplate
        title="RFQ Invitation"
        description="Loading invitation details..."
        icon={<Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'RFQ Invitations', href: '/procurement/supplier/rfq-invitations' },
          { label: 'Loading...' },
        ]}
        actions={
          <Button variant="outline" size="sm" disabled className="gap-2 h-9 rounded-xl">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </Button>
        }
      >
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
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
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">RFQ Not Found</h3>
            <p className="text-muted-foreground">
              The RFQ invitation you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const generatedByName = getUserName(quotation.generated_by);
  const generatedByEmail = getUserEmail(quotation.generated_by);

  return (
    <PageTemplate
      title="RFQ Invitation"
      description={`${quotation.qtn_number} - ${quotation.title}`}
      icon={<Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
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
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          {canRespond && (
            <Button
              size="sm"
              onClick={handleSubmitQuotation}
              className="gap-2 h-9 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 rounded-xl"
            >
              <Send className="h-4 w-4" />
              Submit Quotation
            </Button>
          )}

          {hasResponded && (
            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-2 text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Quotation Submitted
            </Badge>
          )}

          {!canRespond && !hasResponded && quotation.status !== 'sent' && (
            <Badge variant="outline" className="rounded-full px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {quotation.is_expired ? 'Expired' : 'Not Accepting Responses'}
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 h-9 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <HeaderCard quotation={quotation} />
        <StatsGrid quotation={quotation} />
        <ConfidentialityBanner />

        <Tabs defaultValue="items" className="space-y-4">
          <TabsList className="rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="items" className="rounded-lg">
              <Package className="h-4 w-4 mr-2" />
              Items & Specifications
            </TabsTrigger>
            <TabsTrigger value="requisition" className="rounded-lg">
              <FileText className="h-4 w-4 mr-2" />
              Requisition Details
            </TabsTrigger>
            <TabsTrigger value="approvals" className="rounded-lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approvals Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  Items & Specifications
                </CardTitle>
                <CardDescription>
                  Items required for this RFQ with quantities and specifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ItemsTable items={extendedRequisition?.items || []} isLoading={isLoading} />
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  Estimated prices are confidential
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="requisition">
            <RequisitionDetails requisition={extendedRequisition} />
          </TabsContent>

          <TabsContent value="approvals">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  Approvals Timeline
                </CardTitle>
                <CardDescription>Approval history for the original requisition</CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovalsTimeline approvals={extendedRequisition?.approvals || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quotation.delivery_terms && (
                <div className="flex items-start gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Terms</p>
                    <p className="font-medium">{quotation.delivery_terms}</p>
                  </div>
                </div>
              )}
              {quotation.payment_terms && (
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Terms</p>
                    <p className="font-medium">{quotation.payment_terms}</p>
                  </div>
                </div>
              )}
              {quotation.special_conditions && (
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Special Conditions</p>
                    <p className="font-medium">{quotation.special_conditions}</p>
                  </div>
                </div>
              )}
              {!quotation.delivery_terms && !quotation.payment_terms && !quotation.special_conditions && (
                <p className="text-muted-foreground">No additional terms specified</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quotation.instructions ? (
                <p className="whitespace-pre-wrap">{quotation.instructions}</p>
              ) : (
                <p className="text-muted-foreground">No special instructions</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm rounded-xl bg-muted/30 dark:bg-gray-800/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <AvatarComponent className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  {getInitials(generatedByName)}
                </AvatarFallback>
              </AvatarComponent>
              <div>
                <p className="text-sm text-muted-foreground">Generated By</p>
                <p className="font-medium">{generatedByName}</p>
                <p className="text-xs text-muted-foreground">{generatedByEmail}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDateTime(quotation.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Decline RFQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline {quotation.qtn_number}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeclineConfirm} className="bg-red-600 hover:bg-red-700 rounded-xl">
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}
