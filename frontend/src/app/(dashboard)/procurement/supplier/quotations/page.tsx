// frontend/src/app/(dashboard)/procurement/supplier/quotations/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  Mail,
  Building2,
  Send,
  Ban,
  FileCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Truck,
  CreditCard,
  FileSignature,
  MessageSquare,
  Info,
  ExternalLink,
  Printer,
  Download,
  Share2,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  List,
  Grid3X3,
  ChevronRight,
  CalendarDays,
  Briefcase,
  Building,
  Phone,
  Globe,
  Mail as MailIcon,
  UserCheck,
  UserX,
  Timer,
  PieChart,
  BarChart3,
  Activity,
  Sparkles,
  Zap,
  Star,
  Crown,
  Award as AwardIcon,
  Receipt,
  Package,
  Users,
  TrendingDown,
  Percent,
  Clock3,
  Shield,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Scale,
  BadgeCheck,
  Store,
  PhoneCall,
  MapPin,
  Link,
  Copy,
  CheckCheck,
  MoreVertical,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isBefore, isAfter, differenceInDays, differenceInHours } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Hooks
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierQuotations } from '@/hooks/useSupplierQuotation';

// Types
import type { SupplierQuotation, SupplierQuotationItem } from '@/types/supplierQuotation.types';
import type { QuotationRequest } from '@/types/quotations.types';

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 10;

const QUOTATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  evaluated: 'Evaluated',
  accepted: 'Accepted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const QUOTATION_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  evaluated: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
};

const QUOTATION_STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  submitted: Send,
  evaluated: FileCheck,
  accepted: CheckCircle,
  rejected: XCircle,
  cancelled: Ban,
};

const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Verification',
  verified: 'Verified',
  rejected: 'Verification Failed',
};

const VERIFICATION_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

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

const formatDateFull = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'EEEE, dd MMMM yyyy');
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

const formatTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return '0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getStatusLabel = (status: string): string => {
  return QUOTATION_STATUS_LABELS[status] || status;
};

const getStatusColor = (status: string): string => {
  return QUOTATION_STATUS_COLORS[status] || QUOTATION_STATUS_COLORS.pending;
};

const getVerificationStatusLabel = (status: string): string => {
  return VERIFICATION_STATUS_LABELS[status] || status;
};

const getVerificationStatusColor = (status: string): string => {
  return VERIFICATION_STATUS_COLORS[status] || VERIFICATION_STATUS_COLORS.pending;
};

const isQuotationValid = (quotation: SupplierQuotation): boolean => {
  if (!quotation.validity_date) return true;
  try {
    const now = new Date();
    const validity = new Date(quotation.validity_date);
    return now <= validity;
  } catch {
    return false;
  }
};

const getValidityStatus = (quotation: SupplierQuotation): { valid: boolean; text: string; color: string } => {
  if (!quotation.validity_date) {
    return { valid: true, text: 'No expiry', color: 'text-muted-foreground' };
  }
  try {
    const now = new Date();
    const validity = new Date(quotation.validity_date);
    const daysRemaining = differenceInDays(validity, now);

    if (daysRemaining < 0) {
      return { valid: false, text: 'Expired', color: 'text-red-500' };
    } else if (daysRemaining < 7) {
      return { valid: true, text: `${daysRemaining} days remaining`, color: 'text-amber-500' };
    } else {
      return { valid: true, text: `${daysRemaining} days remaining`, color: 'text-emerald-500' };
    }
  } catch {
    return { valid: true, text: 'N/A', color: 'text-muted-foreground' };
  }
};

// ============================================
// SUB-COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const Icon = QUOTATION_STATUS_ICONS[status] || FileText;
  const colorClass = getStatusColor(status);

  return (
    <Badge className={cn("flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-full", colorClass)}>
      <Icon className="h-3 w-3" />
      {getStatusLabel(status)}
    </Badge>
  );
};

const VerificationStatusBadge = ({ status }: { status: string }) => {
  const colorClass = getVerificationStatusColor(status);

  return (
    <Badge variant="outline" className={cn("text-xs rounded-full", colorClass)}>
      {getVerificationStatusLabel(status)}
    </Badge>
  );
};

// ============================================
// QUOTATION ALERTS
// ============================================

interface QuotationAlertsProps {
  quotations: SupplierQuotation[];
}

const QuotationAlerts = ({ quotations }: QuotationAlertsProps) => {
  const pendingCount = useMemo(() => {
    return quotations.filter(q => q.status === 'pending' || q.status === 'submitted').length;
  }, [quotations]);

  const acceptedCount = useMemo(() => {
    return quotations.filter(q => q.status === 'accepted').length;
  }, [quotations]);

  const rejectedCount = useMemo(() => {
    return quotations.filter(q => q.status === 'rejected').length;
  }, [quotations]);

  if (pendingCount > 0) {
    return (
      <Card className="border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-700 dark:text-amber-300">
                {pendingCount} Quotation{pendingCount > 1 ? 's' : ''} Pending Evaluation
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400/80">
                Your quotations are being reviewed by procurement. You'll be notified of any updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (acceptedCount > 0) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-emerald-700 dark:text-emerald-300">
                {acceptedCount} Quotation{acceptedCount > 1 ? 's' : ''} Accepted!
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400/80">
                Congratulations! Your quotation{acceptedCount > 1 ? 's have' : ' has'} been accepted by procurement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rejectedCount > 0) {
    return (
      <Card className="border-red-200 dark:border-red-800/50 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-xl flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-700 dark:text-red-300">
                {rejectedCount} Quotation{rejectedCount > 1 ? 's' : ''} Rejected
              </p>
              <p className="text-sm text-red-600 dark:text-red-400/80">
                Some of your quotations were not selected. You can review the feedback and submit new quotations for future RFQs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

// ============================================
// STATS CARDS
// ============================================

interface StatsCardsProps {
  quotations: SupplierQuotation[];
  isLoading: boolean;
}

const StatsCards = ({ quotations, isLoading }: StatsCardsProps) => {
  const stats = useMemo(() => {
    const total = quotations.length;
    const pending = quotations.filter(q => q.status === 'pending').length;
    const submitted = quotations.filter(q => q.status === 'submitted').length;
    const evaluated = quotations.filter(q => q.status === 'evaluated').length;
    const accepted = quotations.filter(q => q.status === 'accepted').length;
    const rejected = quotations.filter(q => q.status === 'rejected').length;
    const cancelled = quotations.filter(q => q.status === 'cancelled').length;

    const totalAmount = quotations.reduce((sum, q) => sum + (parseFloat(q.total_amount as any) || 0), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    const verified = quotations.filter(q => q.verification_status === 'verified').length;
    const verificationRate = total > 0 ? Math.round((verified / total) * 100) : 0;

    const lowestAmount = quotations.length > 0
      ? Math.min(...quotations.map(q => parseFloat(q.total_amount as any) || 0))
      : 0;

    const highestAmount = quotations.length > 0
      ? Math.max(...quotations.map(q => parseFloat(q.total_amount as any) || 0))
      : 0;

    return {
      total,
      pending,
      submitted,
      evaluated,
      accepted,
      rejected,
      cancelled,
      totalAmount,
      avgAmount,
      verified,
      verificationRate,
      lowestAmount,
      highestAmount,
    };
  }, [quotations]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Quotations',
      value: stats.total,
      icon: FileText,
      description: 'All submitted quotations',
      color: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Pending',
      value: stats.pending + stats.submitted,
      icon: Clock,
      description: 'Awaiting evaluation',
      color: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Evaluated',
      value: stats.evaluated,
      icon: FileCheck,
      description: 'Under evaluation',
      color: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Accepted',
      value: stats.accepted,
      icon: CheckCircle,
      description: 'Accepted quotations',
      color: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Total Value',
      value: `KES ${formatCurrency(stats.totalAmount)}`,
      icon: DollarSign,
      description: 'Total quotation value',
      color: 'from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30',
      iconBg: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    },
    {
      title: 'Verification Rate',
      value: `${stats.verificationRate}%`,
      icon: Shield,
      description: 'Quotations verified',
      color: 'from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={cn("border-0 shadow-sm bg-gradient-to-br rounded-xl hover:shadow-md transition-all duration-300", card.color)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
              <div className={cn("p-1.5 rounded-lg", card.iconBg)}>
                <card.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-xl font-bold mt-1.5 truncate">{card.value}</p>
            {card.description && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{card.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ============================================
// FILTERS COMPONENT
// ============================================

interface FiltersProps {
  filters: {
    search?: string;
    status?: string;
    verification_status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

const Filters = ({ filters, onFilterChange, onReset }: FiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'evaluated', label: 'Evaluated' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const verificationOptions = [
    { value: 'all', label: 'All Verification' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <Card className="mb-6 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filters</span>
            <Badge variant="secondary" className="ml-2 rounded-full">
              {Object.keys(filters).filter(key => filters[key as keyof typeof filters]).length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1 rounded-xl"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1 rounded-xl">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotation number..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
              />
            </div>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.verification_status || 'all'}
              onValueChange={(value) => onFilterChange('verification_status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                {verificationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="From"
                value={filters.dateFrom || ''}
                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="To"
                value={filters.dateTo || ''}
                onChange={(e) => onFilterChange('dateTo', e.target.value)}
                className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// QUOTATION ITEMS COMPONENT
// ============================================

interface QuotationItemsProps {
  items: SupplierQuotationItem[];
  isRejected?: boolean;
}

const QuotationItems = ({ items, isRejected = false }: QuotationItemsProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
        <p>No items in this quotation</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-gray-800/50">
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Delivery (Days)</TableHead>
            <TableHead className="text-right">Warranty (Months)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className={cn(
                isRejected && "opacity-60"
              )}
            >
              <TableCell>
                <div className={cn(
                  "font-medium",
                  isRejected && "line-through"
                )}>
                  {item.item_name}
                </div>
                {item.description && (
                  <div className={cn(
                    "text-xs text-muted-foreground",
                    isRejected && "line-through"
                  )}>
                    {item.description}
                  </div>
                )}
                {item.brand && (
                  <div className={cn(
                    "text-xs text-muted-foreground",
                    isRejected && "line-through"
                  )}>
                    Brand: {item.brand} {item.model ? `- ${item.model}` : ''}
                  </div>
                )}
              </TableCell>
              <TableCell className={cn(
                "text-right",
                isRejected && "line-through"
              )}>
                {item.formatted_quantity || item.quantity}
              </TableCell>
              <TableCell className={cn(
                "text-right",
                isRejected && "line-through"
              )}>
                KES {item.formatted_unit_price || formatCurrency(item.unit_price)}
              </TableCell>
              <TableCell className={cn(
                "text-right font-medium",
                isRejected && "line-through text-muted-foreground"
              )}>
                KES {item.formatted_total_price || formatCurrency(item.total_price)}
              </TableCell>
              <TableCell className={cn(
                "text-right",
                isRejected && "line-through"
              )}>
                {item.delivery_days || '-'}
              </TableCell>
              <TableCell className={cn(
                "text-right",
                isRejected && "line-through"
              )}>
                {item.warranty_months || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ============================================
// QUOTATION DETAIL CARD
// ============================================

interface QuotationDetailCardProps {
  quotation: SupplierQuotation;
  onView: (id: number) => void;
}

const QuotationDetailCard = ({ quotation, onView }: QuotationDetailCardProps) => {
  const validity = getValidityStatus(quotation);
  const isLowest = quotation.is_lowest;
  const totalItems = quotation.items?.length || 0;
  const isRejected = quotation.status === 'rejected' || quotation.status === 'cancelled';

  return (
    <Card className={cn(
      "border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl hover:shadow-md transition-all duration-300 overflow-hidden",
      isRejected && "opacity-75"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded",
                isRejected && "line-through"
              )}>
                {quotation.quotation_number}
              </span>
              <StatusBadge status={quotation.status} />
              <VerificationStatusBadge status={quotation.verification_status} />
              {isLowest && !isRejected && (
                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full">
                  <Award className="h-3 w-3 mr-1" />
                  Lowest Bid
                </Badge>
              )}
              {quotation.is_valid && !isRejected && (
                <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 rounded-full">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Valid
                </Badge>
              )}
              {isRejected && (
                <Badge variant="outline" className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-400 rounded-full">
                  <XCircle className="h-3 w-3 mr-1" />
                  {quotation.status === 'rejected' ? 'Rejected' : 'Cancelled'}
                </Badge>
              )}
            </div>
            <CardTitle className={cn(
              "text-lg mt-1.5 truncate",
              isRejected && "line-through text-muted-foreground"
            )}>
              {quotation.quotation_request?.title || 'Quotation'}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              RFQ: {quotation.quotation_request?.qtn_number || 'N/A'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 ml-4 flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl"
                    onClick={() => onView(quotation.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Total Amount
            </p>
            <p className={cn(
              "text-lg font-bold",
              isRejected ? "text-muted-foreground line-through" : "text-emerald-600 dark:text-emerald-400"
            )}>
              KES {formatCurrency(quotation.total_amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Submitted
            </p>
            <p className={cn(
              "text-sm font-medium",
              isRejected && "line-through"
            )}>
              {formatDate(quotation.submission_date)}
            </p>
            <p className={cn(
              "text-xs text-muted-foreground",
              isRejected && "line-through"
            )}>
              {formatTime(quotation.submission_date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Timer className="h-3 w-3" />
              Validity
            </p>
            <p className={cn(
              "text-sm font-medium",
              isRejected ? "text-muted-foreground line-through" : validity.color
            )}>
              {isRejected ? 'N/A' : validity.text}
            </p>
            <p className={cn(
              "text-xs text-muted-foreground",
              isRejected && "line-through"
            )}>
              {formatDate(quotation.validity_date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" />
              Items
            </p>
            <p className={cn(
              "text-sm font-medium",
              isRejected && "line-through"
            )}>
              {totalItems} item{totalItems > 1 ? 's' : ''}
            </p>
            <p className={cn(
              "text-xs text-muted-foreground",
              isRejected && "line-through"
            )}>
              {quotation.submission_method_label || 'System Submission'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Scale className="h-3 w-3" />
              Evaluation
            </p>
            {quotation.evaluation_score && !isRejected ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {quotation.evaluation_score}%
                </span>
                <Progress value={quotation.evaluation_score} className="h-1.5 w-12" />
              </div>
            ) : (
              <p className={cn(
                "text-sm",
                isRejected ? "text-muted-foreground line-through" : "text-muted-foreground"
              )}>
                {isRejected ? 'N/A' : 'Not evaluated'}
              </p>
            )}
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className={cn(
                "text-sm text-muted-foreground",
                isRejected && "line-through"
              )}>
                {quotation.quotation_request?.generated_by && typeof quotation.quotation_request.generated_by === 'object'
                  ? quotation.quotation_request.generated_by.full_name
                  : 'Unknown'}
              </span>
            </div>
            {quotation.evaluated_at && !isRejected && (
              <Badge variant="outline" className="text-xs rounded-full">
                Evaluated: {formatDate(quotation.evaluated_at)}
              </Badge>
            )}
            {isRejected && (
              <Badge variant="outline" className="text-xs rounded-full border-red-200 text-red-600 dark:border-red-800 dark:text-red-400">
                <X className="h-3 w-3 mr-1" />
                {quotation.status === 'rejected' ? 'Not Selected' : 'Cancelled'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {quotation.verification_status === 'verified' && !isRejected && (
              <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {quotation.is_lowest && !isRejected && (
              <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full">
                <Crown className="h-3 w-3 mr-1" />
                Lowest Price
              </Badge>
            )}
          </div>
        </div>

        {/* Items Preview - Show items with strikethrough if rejected */}
        {quotation.items && quotation.items.length > 0 && (
          <div className="mt-3 pt-3 border-t dark:border-gray-700">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                View Items ({quotation.items.length})
              </summary>
              <div className="mt-2">
                <QuotationItems items={quotation.items} isRejected={isRejected} />
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// QUOTATIONS TABLE
// ============================================

interface QuotationsTableProps {
  data: SupplierQuotation[];
  isLoading: boolean;
  onView: (id: number) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
}

const QuotationsTable = ({
  data,
  isLoading,
  onView,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
  viewMode,
  setViewMode,
}: QuotationsTableProps) => {
  const getViewModeVariant = (mode: 'table' | 'cards', currentMode: 'table' | 'cards'): 'default' | 'ghost' => {
    return mode === currentMode ? 'default' : 'ghost';
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
              <FileText className="h-12 w-12 text-blue-400 dark:text-blue-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Quotations Found</h3>
            <p className="text-muted-foreground max-w-sm">
              You haven't submitted any quotations yet. When you respond to RFQs, your quotations will appear here.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div className="space-y-4">
        {data.map((quotation) => (
          <QuotationDetailCard
            key={quotation.id}
            quotation={quotation}
            onView={onView}
          />
        ))}
        {totalItems > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-muted/30 rounded-b-xl">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 dark:bg-gray-800/30 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Your Quotations</span>
          <Badge variant="secondary" className="rounded-full">{data.length}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={getViewModeVariant('table', viewMode)}
            size="sm"
            className="h-8 w-8 p-0 rounded-lg"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={getViewModeVariant('cards', viewMode)}
            size="sm"
            className="h-8 w-8 p-0 rounded-lg"
            onClick={() => setViewMode('cards')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-gray-800/50">
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="min-w-[180px]">Quotation Number</TableHead>
              <TableHead className="min-w-[200px]">RFQ Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((quotation, index) => {
              const validity = getValidityStatus(quotation);
              const totalItems = quotation.items?.length || 0;
              const isRejected = quotation.status === 'rejected' || quotation.status === 'cancelled';

              return (
                <TableRow
                  key={quotation.id}
                  className={cn(
                    "hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group",
                    isRejected && "opacity-60"
                  )}
                  onClick={() => onView(quotation.id)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className={cn(
                        "font-medium truncate max-w-[150px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
                        isRejected && "line-through"
                      )}>
                        {quotation.quotation_number}
                      </p>
                      <p className={cn(
                        "text-xs text-muted-foreground",
                        isRejected && "line-through"
                      )}>
                        {quotation.supplier_reference_no || 'No ref.'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className={cn(
                        "font-medium truncate max-w-[180px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
                        isRejected && "line-through"
                      )}>
                        {quotation.quotation_request?.title || 'N/A'}
                      </p>
                      <p className={cn(
                        "text-xs text-muted-foreground truncate max-w-[180px]",
                        isRejected && "line-through"
                      )}>
                        {quotation.quotation_request?.qtn_number || 'No RFQ'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={quotation.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className={cn(
                        "text-sm font-bold",
                        isRejected ? "text-muted-foreground line-through" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        KES {formatCurrency(quotation.total_amount)}
                      </p>
                      <p className={cn(
                        "text-xs text-muted-foreground",
                        isRejected && "line-through"
                      )}>
                        {totalItems} item{totalItems > 1 ? 's' : ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "text-sm",
                      isRejected && "line-through"
                    )}>
                      {formatDate(quotation.submission_date)}
                    </div>
                    <div className={cn(
                      "text-xs text-muted-foreground",
                      isRejected && "line-through"
                    )}>
                      {formatTime(quotation.submission_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "text-sm font-medium",
                      isRejected ? "text-muted-foreground line-through" : validity.color
                    )}>
                      {isRejected ? 'N/A' : validity.text}
                    </div>
                    <div className={cn(
                      "text-xs text-muted-foreground",
                      isRejected && "line-through"
                    )}>
                      {formatDate(quotation.validity_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <VerificationStatusBadge status={quotation.verification_status} />
                    {quotation.evaluation_score && !isRejected && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-xs font-medium">{quotation.evaluation_score}%</span>
                        <Progress value={quotation.evaluation_score} className="h-1 w-12" />
                      </div>
                    )}
                    {isRejected && (
                      <div className="mt-1 text-xs text-red-500">Not selected</div>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(quotation.id)}
                              className="h-8 w-8 p-0 rounded-xl hover:bg-muted/50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {quotation.is_lowest && !isRejected && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0 h-6">
                                <Crown className="h-3 w-3" />
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Lowest Bid</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {isRejected && (
                        <Badge variant="outline" className="border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 rounded-full px-2 py-0 h-6 text-xs">
                          <X className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      {totalItems > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function SupplierQuotationsPage() {
  const router = useRouter();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    verification_status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Get supplier profile
  const { useSupplierProfileExists } = useSuppliers();
  const { exists: hasSupplierProfile, supplier } = useSupplierProfileExists();

  // Get supplier ID
  const supplierId = useMemo(() => {
    if (!supplier) return undefined;
    return (supplier as any)?.id as number | undefined;
  }, [supplier]);

  // Build filters with supplier ID
  const queryFilters = useMemo(() => {
    const filterParams: any = {
      page: currentPage,
      per_page: ITEMS_PER_PAGE,
    };

    if (supplierId) {
      filterParams.supplier_id = supplierId;
    }

    if (filters.status) {
      filterParams.status = filters.status;
    }

    if (filters.verification_status) {
      filterParams.verification_status = filters.verification_status;
    }

    if (filters.search) {
      filterParams.search = filters.search;
    }

    if (filters.dateFrom) {
      filterParams.date_from = filters.dateFrom;
    }

    if (filters.dateTo) {
      filterParams.date_to = filters.dateTo;
    }

    return filterParams;
  }, [currentPage, supplierId, filters]);

  // Get supplier quotations with supplier_id filter
  const { data: quotationsData, isLoading, refetch, isFetching } = useSupplierQuotations(queryFilters);

  // Extract data with proper typing
  const quotations = useMemo(() => {
    if (Array.isArray(quotationsData)) {
      return quotationsData;
    }
    if (quotationsData && typeof quotationsData === 'object' && 'data' in quotationsData) {
      return Array.isArray(quotationsData.data) ? quotationsData.data : [];
    }
    return [];
  }, [quotationsData]);

  const pagination = useMemo(() => {
    if (quotationsData && typeof quotationsData === 'object' && 'meta' in quotationsData) {
      return quotationsData.meta as { total: number; current_page: number; last_page: number };
    }
    return { total: 0, current_page: 1, last_page: 1 };
  }, [quotationsData]);

  // Callbacks
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleView = useCallback((id: number) => {
    router.push(`/procurement/supplier/quotations/${id}`);
  }, [router]);

  const handleRefresh = () => {
    refetch();
  };

  // Calculate some stats for badges
  const acceptedCount = useMemo(() => {
    return quotations.filter(q => q.status === 'accepted').length;
  }, [quotations]);

  const pendingCount = useMemo(() => {
    return quotations.filter(q => q.status === 'pending' || q.status === 'submitted').length;
  }, [quotations]);

  const rejectedCount = useMemo(() => {
    return quotations.filter(q => q.status === 'rejected').length;
  }, [quotations]);

  // Show loading while supplier is being fetched
  if (!hasSupplierProfile && !isLoading) {
    return (
      <PageTemplate
        title="My Quotations"
        description="View and manage all your submitted quotations"
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'My Quotations' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-4">
                <Store className="h-12 w-12 text-amber-400 dark:text-amber-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Supplier Profile Required</h3>
              <p className="text-muted-foreground max-w-sm">
                Please complete your supplier profile to view and manage your quotations.
              </p>
              <Button
                variant="default"
                size="sm"
                className="mt-4 rounded-xl"
                onClick={() => router.push('/procurement/supplier/profile')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Complete Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="My Quotations"
      description="View and manage all your submitted quotations"
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="full"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier', href: '/procurement/supplier' },
        { label: 'My Quotations' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {pendingCount > 0 && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-full animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              {pendingCount} Pending
            </Badge>
          )}
          {acceptedCount > 0 && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-full">
              <CheckCircle className="h-3 w-3 mr-1" />
              {acceptedCount} Accepted
            </Badge>
          )}
          {rejectedCount > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full">
              <XCircle className="h-3 w-3 mr-1" />
              {rejectedCount} Rejected
            </Badge>
          )}
          <Badge className="bg-primary/10 dark:bg-primary/20 text-primary border-primary/20 dark:border-primary/30 rounded-full">
            <FileText className="h-3 w-3 mr-1" />
            {quotations.length} Quotations
          </Badge>
          {hasSupplierProfile && supplier && (
            <Badge variant="outline" className="rounded-full">
              <Store className="h-3 w-3 mr-1" />
              {(supplier as any)?.company_name || (supplier as any)?.full_name || 'Supplier'}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4", (isLoading || isFetching) && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <StatsCards
          quotations={quotations}
          isLoading={isLoading}
        />

        {/* Alerts */}
        <QuotationAlerts quotations={quotations} />

        {/* Filters */}
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Table */}
        <QuotationsTable
          data={quotations}
          isLoading={isLoading}
          onView={handleView}
          currentPage={currentPage}
          totalItems={pagination.total || 0}
          totalPages={pagination.last_page || 0}
          onPageChange={handlePageChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>
    </PageTemplate>
  );
}
