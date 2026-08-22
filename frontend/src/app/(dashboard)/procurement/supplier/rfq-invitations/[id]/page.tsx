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
  Tag,
  Hash,
  Bell,
  Timer,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Hooks
import { useSuppliers } from '@/hooks/useSuppliers';
import { useQuotation } from '@/hooks/useQuotation';
import {
  useCreateSupplierQuotation,
} from '@/hooks/useSupplierQuotation';

// Types
import type { QuotationRequest } from '@/types/quotations.types';
import type { Requisition } from '@/types/requisition.types';

// Components
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

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

const getTimeRemaining = (closingDate: string | Date): {
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
// STATS CARDS
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
      color: 'from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Response Rate',
      value: `${quotation.response_rate || 0}%`,
      icon: TrendingUp,
      color: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total Items',
      value: (quotation.requisition as ExtendedRequisition)?.items?.length || 0,
      icon: Package,
      color: 'from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Suppliers Invited',
      value: quotation.sent_to_suppliers?.length || 0,
      icon: Users,
      color: 'from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 border-indigo-200/50',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className={cn("border shadow-sm rounded-xl bg-gradient-to-br", stat.color)}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div className={cn("p-2.5 rounded-xl flex-shrink-0 ml-3", stat.iconBg)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
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
    <Card className="border shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
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
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// CONFIDENTIALITY BANNER
// ============================================

const ConfidentialityBanner = () => {
  return (
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
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
        <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
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
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
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
          <div key={approval.id} className="relative flex gap-4 group">
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-muted-foreground/20 group-hover:bg-muted-foreground/40 transition-colors" />
            )}

            <div className={cn("p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 border", colorClass)}>
              <Icon className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-1.5 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">
                  {approval.level_label}
                </p>
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
// ITEMS TABLE
// ============================================

interface ItemsTableProps {
  items: any[];
  isLoading: boolean;
}

const ItemsTable = ({ items, isLoading }: ItemsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
        <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No items found for this RFQ</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
      <ScrollArea className="w-full max-h-[400px]">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
              <TableHead className="min-w-[150px] py-3.5 text-xs font-semibold uppercase tracking-wider">Item</TableHead>
              <TableHead className="min-w-[120px] py-3.5 text-xs font-semibold uppercase tracking-wider">Description</TableHead>
              <TableHead className="text-center w-[80px] py-3.5 text-xs font-semibold uppercase tracking-wider">Qty</TableHead>
              <TableHead className="text-center w-[100px] py-3.5 text-xs font-semibold uppercase tracking-wider">Unit</TableHead>
              <TableHead className="min-w-[200px] py-3.5 text-xs font-semibold uppercase tracking-wider">Specifications</TableHead>
              <TableHead className="text-right w-[140px] py-3.5 text-xs font-semibold uppercase tracking-wider">Est. Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any) => (
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

  // Cast requisition to ExtendedRequisition
  const extendedRequisition = quotation?.requisition as unknown as ExtendedRequisition | undefined;

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
        actions={
          <Button variant="outline" size="sm" disabled className="gap-2 h-9 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </Button>
        }
      >
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
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

  const generatedByName = getUserName(quotation.generated_by);
  const generatedByEmail = getUserEmail(quotation.generated_by);

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
            Refresh
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

        <HeaderCard quotation={quotation} />
        <StatsGrid quotation={quotation} />
        <ConfidentialityBanner />

        <Tabs defaultValue="items" className="space-y-4">
          <TabsList className="w-full bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl h-auto">
            <TabsTrigger value="items" className="flex-1 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-medium transition-all">
              <Package className="h-4 w-4" />
              <span>Items & Specifications</span>
            </TabsTrigger>
            <TabsTrigger value="requisition" className="flex-1 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-medium transition-all">
              <FileText className="h-4 w-4" />
              <span>Requisition Details</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex-1 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-medium transition-all">
              <CheckCircle className="h-4 w-4" />
              <span>Approvals Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex-1 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-medium transition-all">
              <Shield className="h-4 w-4" />
              <span>Terms & Instructions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <Card className="border shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Items & Specifications
                </CardTitle>
                <CardDescription>
                  Items required for this RFQ with quantities and specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
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
            <Card className="border shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Requisition Details
                </CardTitle>
                <CardDescription>
                  Original requisition information for this RFQ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {extendedRequisition ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reference Number</p>
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
                ) : (
                  <p className="text-muted-foreground">No requisition details available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals">
            <Card className="border shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Approvals Timeline
                </CardTitle>
                <CardDescription>Approval history for the original requisition</CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovalsTimeline approvals={extendedRequisition?.approvals || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <FileCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Special Conditions</p>
                        <p className="font-medium">{quotation.special_conditions}</p>
                      </div>
                    </div>
                  )}
                  {!quotation.delivery_terms && !quotation.payment_terms && !quotation.special_conditions && (
                    <p className="text-muted-foreground text-center py-4">No additional terms specified</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quotation.instructions ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{quotation.instructions}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No special instructions</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
