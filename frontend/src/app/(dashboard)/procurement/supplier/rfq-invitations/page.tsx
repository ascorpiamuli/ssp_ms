// frontend/src/app/(dashboard)/procurement/supplier/rfq-invitations/page.tsx

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  MapPin,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Award,
  Shield,
  Truck,
  CreditCard,
  FileSignature,
  MessageSquare,
  Info,
  ExternalLink,
  Printer,
  Download,
  Share2,
  Bell,
  Clock3,
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

// Hooks
import { useSuppliers } from '@/hooks/useSuppliers';
import { useQuotations } from '@/hooks/useQuotation';

// Types
import type { QuotationRequest, QuotationStatus, SupplierQuotation } from '@/types/quotations.types';

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 10;

const INVITATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  responded: 'Responded',
  declined: 'Declined',
  expired: 'Expired',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

const INVITATION_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  responded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  closed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
};

const INVITATION_STATUS_ICONS: Record<string, any> = {
  draft: FileText,
  sent: Mail,
  responded: CheckCircle,
  declined: XCircle,
  expired: AlertCircle,
  closed: FileCheck,
  cancelled: Ban,
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

const getStatusLabel = (status: string): string => {
  return INVITATION_STATUS_LABELS[status] || status;
};

const getTimeRemaining = (closingDate: string | Date): {
  text: string;
  days: number;
  hours: number;
  isExpired: boolean;
  isClosingSoon: boolean;
} => {
  if (!closingDate) return { text: 'N/A', days: 0, hours: 0, isExpired: false, isClosingSoon: false };
  try {
    const now = new Date();
    const closing = new Date(closingDate);
    const diff = closing.getTime() - now.getTime();

    if (diff < 0) {
      return { text: 'Closed', days: 0, hours: 0, isExpired: true, isClosingSoon: false };
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
      hours,
      isExpired: false,
      isClosingSoon: days < 3 || (days === 0 && hours < 24),
    };
  } catch {
    return { text: 'N/A', days: 0, hours: 0, isExpired: false, isClosingSoon: false };
  }
};

const getSupplierCount = (quotation: QuotationRequest): number => {
  if (!quotation.sent_to_suppliers) return 0;
  return Array.isArray(quotation.sent_to_suppliers) ? quotation.sent_to_suppliers.length : 0;
};

const getRespondedCount = (quotation: QuotationRequest): number => {
  if (!quotation.responded_suppliers) return 0;
  return Array.isArray(quotation.responded_suppliers) ? quotation.responded_suppliers.length : 0;
};

const getDeclinedCount = (quotation: QuotationRequest): number => {
  if (!quotation.declined_suppliers) return 0;
  return Array.isArray(quotation.declined_suppliers) ? quotation.declined_suppliers.length : 0;
};

const getResponseRate = (quotation: QuotationRequest): number => {
  const total = getSupplierCount(quotation);
  if (total === 0) return 0;
  const responded = getRespondedCount(quotation);
  return Math.round((responded / total) * 100);
};

// ============================================
// SUB-COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const Icon = INVITATION_STATUS_ICONS[status] || FileText;
  const colorClass = INVITATION_STATUS_COLORS[status] || INVITATION_STATUS_COLORS.draft;

  return (
    <Badge className={cn("flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-full", colorClass)}>
      <Icon className="h-3 w-3" />
      {getStatusLabel(status)}
    </Badge>
  );
};

// ============================================
// STATS CARDS
// ============================================

interface StatsCardsProps {
  quotations: QuotationRequest[];
  isLoading: boolean;
  supplierId?: number;
}

const StatsCards = ({ quotations, isLoading, supplierId }: StatsCardsProps) => {
  const stats = useMemo(() => {
    const total = quotations.length;

    let sent = 0;
    let responded = 0;
    let declined = 0;
    let closed = 0;
    let cancelled = 0;
    let expired = 0;
    let pending = 0;
    let totalSuppliers = 0;
    let totalResponses = 0;

    quotations.forEach((q: QuotationRequest) => {
      const hasResponded = q.responded_suppliers &&
        Array.isArray(q.responded_suppliers) &&
        supplierId &&
        q.responded_suppliers.includes(supplierId);

      const hasDeclined = q.declined_suppliers &&
        Array.isArray(q.declined_suppliers) &&
        supplierId &&
        q.declined_suppliers.includes(supplierId);

      totalSuppliers += getSupplierCount(q);
      totalResponses += getRespondedCount(q);

      if (q.is_expired) {
        expired++;
      } else if (hasDeclined) {
        declined++;
      } else if (hasResponded) {
        responded++;
      } else if (q.status === 'closed') {
        closed++;
      } else if (q.status === 'cancelled') {
        cancelled++;
      } else if (q.status === 'sent') {
        sent++;
        pending++;
      } else if (q.status === 'responded') {
        responded++;
      }
    });

    const avgResponseRate = total > 0 ? Math.round((totalResponses / totalSuppliers) * 100) : 0;

    return {
      total,
      sent,
      responded,
      declined,
      closed,
      cancelled,
      expired,
      pending,
      totalSuppliers,
      totalResponses,
      avgResponseRate,
    };
  }, [quotations, supplierId]);

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
      title: 'Total Invitations',
      value: stats.total,
      icon: Mail,
      description: 'RFQs sent to you',
      color: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      trend: null,
    },
    {
      title: 'Pending Response',
      value: stats.pending,
      icon: Clock,
      description: 'Awaiting your response',
      color: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      trend: stats.pending > 0 ? 'action needed' : null,
    },
    {
      title: 'Responded',
      value: stats.responded,
      icon: CheckCircle,
      description: 'You have responded',
      color: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      trend: stats.responded > 0 ? 'completed' : null,
    },
    {
      title: 'Declined',
      value: stats.declined,
      icon: XCircle,
      description: 'You have declined',
      color: 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
      iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      trend: stats.declined > 0 ? 'declined' : null,
    },
    {
      title: 'Closed',
      value: stats.closed + stats.cancelled,
      icon: FileCheck,
      description: 'No longer accepting',
      color: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      trend: null,
    },
    {
      title: 'Response Rate',
      value: `${stats.avgResponseRate}%`,
      icon: TrendingUp,
      description: 'Your response rate',
      color: 'from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30',
      iconBg: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
      trend: stats.avgResponseRate > 70 ? 'excellent' : stats.avgResponseRate > 40 ? 'good' : 'needs improvement',
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
            <p className="text-2xl font-bold mt-1.5">{card.value}</p>
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
    { value: 'sent', label: 'Sent / Pending' },
    { value: 'responded', label: 'Responded' },
    { value: 'declined', label: 'Declined' },
    { value: 'closed', label: 'Closed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search RFQ number or title..."
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
// RFQ DETAIL CARD
// ============================================

interface RFQDetailCardProps {
  quotation: QuotationRequest;
  supplierId?: number;
  onView: (id: number) => void;
  onRespond: (id: number) => void;
  onDecline: (id: number) => void;
}

const RFQDetailCard = ({ quotation, supplierId, onView, onRespond, onDecline }: RFQDetailCardProps) => {
  const hasResponded = quotation.responded_suppliers &&
    Array.isArray(quotation.responded_suppliers) &&
    supplierId &&
    quotation.responded_suppliers.includes(supplierId);

  const hasDeclined = quotation.declined_suppliers &&
    Array.isArray(quotation.declined_suppliers) &&
    supplierId &&
    quotation.declined_suppliers.includes(supplierId);

  const isExpired = quotation.is_expired;
  const isClosed = quotation.status === 'closed' || quotation.status === 'cancelled';
  const timeRemaining = getTimeRemaining(quotation.closing_date);
  const supplierCount = getSupplierCount(quotation);
  const respondedCount = getRespondedCount(quotation);
  const responseRate = getResponseRate(quotation);

  const canRespond = !isExpired && !isClosed && !hasResponded && !hasDeclined && quotation.status === 'sent';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                {quotation.qtn_number}
              </span>
              <StatusBadge status={hasDeclined ? 'declined' : hasResponded ? 'responded' : quotation.status} />
              {isExpired && (
                <Badge variant="destructive" className="text-xs rounded-full">Expired</Badge>
              )}
              {timeRemaining.isClosingSoon && !isExpired && !isClosed && !hasResponded && !hasDeclined && (
                <Badge className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse rounded-full">
                  <Clock className="h-3 w-3 mr-1" />
                  Closing Soon
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg mt-1.5 truncate">{quotation.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {quotation.description || 'No description provided'}
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
            {canRespond && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => onRespond(quotation.id)}
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Respond
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Submit your quotation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!hasResponded && !hasDeclined && !isClosed && !isExpired && quotation.status === 'sent' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => onDecline(quotation.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Decline</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Issued
            </p>
            <p className="text-sm font-medium">{formatDateFull(quotation.issue_date)}</p>
            <p className="text-xs text-muted-foreground">{formatTime(quotation.issue_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              Closing
            </p>
            <p className="text-sm font-medium">{formatDateFull(quotation.closing_date)}</p>
            <p className="text-xs text-muted-foreground">{formatTime(quotation.closing_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Timer className="h-3 w-3" />
              Time Remaining
            </p>
            <p className={cn(
              "text-sm font-medium",
              isExpired ? "text-red-500" :
                timeRemaining.isClosingSoon ? "text-amber-500" :
                  "text-emerald-500"
            )}>
              {timeRemaining.text}
            </p>
            {!isExpired && !isClosed && (
              <div className="w-full mt-1">
                <Progress
                  value={Math.min(100, ((24 * 7 - (timeRemaining.days * 24 + timeRemaining.hours)) / (24 * 7)) * 100)}
                  className="h-1"
                />
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              Suppliers
            </p>
            <p className="text-sm font-medium">
              {respondedCount}/{supplierCount} responded
            </p>
            <p className="text-xs text-muted-foreground">{responseRate}% response rate</p>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-muted-foreground">
                {quotation.generated_by && typeof quotation.generated_by === 'object'
                  ? quotation.generated_by.full_name
                  : 'Unknown'}
              </span>
            </div>
            {quotation.is_automated && (
              <Badge variant="outline" className="text-xs rounded-full gap-1">
                <Zap className="h-3 w-3" />
                Automated
              </Badge>
            )}
            {quotation.is_tender && (
              <Badge variant="outline" className="text-xs rounded-full gap-1 border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400">
                <AwardIcon className="h-3 w-3" />
                Tender
              </Badge>
            )}
            {quotation.response_count > 0 && (
              <Badge variant="outline" className="text-xs rounded-full gap-1 border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
                <CheckCircle className="h-3 w-3" />
                {quotation.response_count} response{quotation.response_count > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {hasResponded && (
            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full">
              <CheckCircle className="h-3 w-3 mr-1" />
              You Responded
            </Badge>
          )}
          {hasDeclined && (
            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 rounded-full">
              <XCircle className="h-3 w-3 mr-1" />
              You Declined
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// RFQ INVITATIONS TABLE
// ============================================

interface RFQInvitationsTableProps {
  data: QuotationRequest[];
  isLoading: boolean;
  supplierId?: number;
  onView: (id: number) => void;
  onRespond: (id: number) => void;
  onDecline: (id: number) => void;
  onRowClick: (id: number) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
}

const RFQInvitationsTable = ({
  data,
  isLoading,
  supplierId,
  onView,
  onRespond,
  onDecline,
  onRowClick,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
  viewMode,
  setViewMode,
}: RFQInvitationsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
              <Mail className="h-12 w-12 text-blue-400 dark:text-blue-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No RFQ Invitations</h3>
            <p className="text-muted-foreground max-w-sm">
              You haven't received any RFQ invitations yet. When procurement sends you an RFQ, it will appear here.
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
          <RFQDetailCard
            key={quotation.id}
            quotation={quotation}
            supplierId={supplierId}
            onView={onView}
            onRespond={onRespond}
            onDecline={onDecline}
          />
        ))}
      </div>
    );
  }

  const hasSupplierResponded = (quotation: QuotationRequest): boolean => {
    if (!supplierId) return false;
    if (quotation.responded_suppliers && Array.isArray(quotation.responded_suppliers)) {
      return quotation.responded_suppliers.includes(supplierId);
    }
    return false;
  };

  const hasSupplierDeclined = (quotation: QuotationRequest): boolean => {
    if (!supplierId) return false;
    if (quotation.declined_suppliers && Array.isArray(quotation.declined_suppliers)) {
      return quotation.declined_suppliers.includes(supplierId);
    }
    return false;
  };

  const getSupplierSpecificStatus = (quotation: QuotationRequest): string => {
    if (quotation.is_expired) return 'expired';
    if (hasSupplierDeclined(quotation)) return 'declined';
    if (hasSupplierResponded(quotation)) return 'responded';
    if (quotation.status === 'closed') return 'closed';
    if (quotation.status === 'cancelled') return 'cancelled';
    return quotation.status;
  };

  // Helper function to determine button variant
  const getViewModeVariant = (mode: 'table' | 'cards', currentMode: 'table' | 'cards'): 'default' | 'ghost' => {
    return mode === currentMode ? 'default' : 'ghost';
  };

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 dark:bg-gray-800/30 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">RFQ Invitations</span>
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
              <TableHead className="min-w-[180px]">RFQ Number</TableHead>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Closing Date</TableHead>
              <TableHead>Time Remaining</TableHead>
              <TableHead>Suppliers</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((quotation, index) => {
              const isExpired = quotation.is_expired;
              const isClosingSoon = quotation.is_closing_soon;
              const timeRemaining = getTimeRemaining(quotation.closing_date);
              const hasResponded = hasSupplierResponded(quotation);
              const hasDeclined = hasSupplierDeclined(quotation);
              const isClosed = quotation.status === 'closed' || quotation.status === 'cancelled';
              const supplierStatus = getSupplierSpecificStatus(quotation);
              const supplierCount = getSupplierCount(quotation);
              const respondedCount = getRespondedCount(quotation);

              const canRespond = !isExpired &&
                !isClosed &&
                !hasResponded &&
                !hasDeclined &&
                quotation.status === 'sent';

              return (
                <TableRow
                  key={quotation.id}
                  className="hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                  onClick={() => onRowClick(quotation.id)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium truncate max-w-[150px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {quotation.qtn_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(quotation.issue_date)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium truncate max-w-[180px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {quotation.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {quotation.description || 'No description'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={supplierStatus} />
                      {isExpired && (
                        <Badge variant="destructive" className="text-[10px] rounded-full">Expired</Badge>
                      )}
                      {isClosingSoon && !isExpired && !isClosed && !hasResponded && !hasDeclined && (
                        <Badge className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse rounded-full">
                          <Clock className="h-2.5 w-2.5 mr-0.5" />
                          Closing Soon
                        </Badge>
                      )}
                      {hasResponded && (
                        <Badge className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full">
                          <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                          You Responded
                        </Badge>
                      )}
                      {hasDeclined && (
                        <Badge className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 rounded-full">
                          <XCircle className="h-2.5 w-2.5 mr-0.5" />
                          You Declined
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {quotation.closing_date ? formatDate(quotation.closing_date) : 'N/A'}
                    </div>
                    {quotation.closing_time && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(quotation.closing_time), 'HH:mm')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-medium text-sm",
                        isExpired ? "text-red-500" :
                          timeRemaining.isClosingSoon ? "text-amber-500 dark:text-amber-400" :
                            "text-emerald-500 dark:text-emerald-400"
                      )}>
                        {timeRemaining.text}
                      </span>
                      {!isExpired && !timeRemaining.isClosingSoon && !isClosed && !hasResponded && !hasDeclined && (
                        <span className="text-xs text-muted-foreground">Open</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {respondedCount}/{supplierCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getResponseRate(quotation)}% responded
                      </span>
                    </div>
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

                      {canRespond && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRespond(quotation.id)}
                                className="h-8 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Respond
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Submit your quotation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {!hasResponded && !hasDeclined && !isClosed && !isExpired && quotation.status === 'sent' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDecline(quotation.id)}
                                className="h-8 px-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Decline
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Decline this RFQ</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
// DECLINE DIALOG
// ============================================

interface DeclineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: QuotationRequest | null;
  onConfirm: (reason: string) => void;
  isSubmitting: boolean;
}

const DeclineDialog = ({
  open,
  onOpenChange,
  quotation,
  onConfirm,
  isSubmitting,
}: DeclineDialogProps) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('');

  const quickReasons = [
    'Capacity constraints - unable to fulfill order',
    'Pricing does not meet our minimum threshold',
    'Terms and conditions not acceptable',
    'Insufficient timeline for delivery',
    'Already committed to other projects',
    'Not within our area of expertise',
  ];

  const handleSelectQuickReason = (reason: string) => {
    setSelectedReason(reason);
    setReason(reason);
  };

  const handleSubmit = () => {
    onConfirm(reason);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Decline RFQ
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to decline <strong>{quotation?.qtn_number}</strong>: {quotation?.title}
            <br />
            <span className="text-xs text-muted-foreground">This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Reasons</Label>
            <div className="flex flex-wrap gap-1.5">
              {quickReasons.slice(0, 4).map((reason) => (
                <Button
                  key={reason}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-xs rounded-full h-7 px-3",
                    selectedReason === reason && "border-red-500 bg-red-50 dark:bg-red-900/20"
                  )}
                  onClick={() => handleSelectQuickReason(reason)}
                >
                  {reason.length > 30 ? reason.slice(0, 30) + '...' : reason}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decline-reason">Detailed Reason <span className="text-red-500">*</span></Label>
            <Textarea
              id="decline-reason"
              placeholder="Please provide a detailed reason for declining..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setSelectedReason('');
              }}
              rows={3}
              className="rounded-xl resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/500 characters
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="bg-red-600 hover:bg-red-700 rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Decline RFQ
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function SupplierRFQInvitationsPage() {
  const router = useRouter();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRequest | null>(null);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Get supplier profile
  const { useSupplierProfileExists } = useSuppliers();
  const { exists: hasSupplierProfile, supplier } = useSupplierProfileExists();

  // Get RFQ invitations
  const { data: quotationsData, isLoading, refetch, isFetching } = useQuotations({
    status: filters.status as QuotationStatus,
    search: filters.search,
    page: currentPage,
    per_page: ITEMS_PER_PAGE,
  });

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

  // Filter quotations for supplier - ONLY show RFQs sent to this supplier
  const supplierQuotations = useMemo(() => {
    if (!supplier) return [];
    const supplierId = (supplier as any)?.id;
    if (!supplierId) return [];

    return quotations.filter((q: QuotationRequest) => {
      const wasSentToSupplier = q.sent_to_suppliers &&
        Array.isArray(q.sent_to_suppliers) &&
        q.sent_to_suppliers.includes(supplierId);

      if (!wasSentToSupplier) return false;
      return true;
    });
  }, [quotations, supplier]);

  // Get supplier ID safely
  const supplierId = useMemo(() => {
    if (!supplier) return undefined;
    return (supplier as any)?.id as number | undefined;
  }, [supplier]);

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

  const handleRowClick = useCallback((id: number) => {
    router.push(`/procurement/supplier/rfq-invitations/${id}`);
  }, [router]);

  const handleView = useCallback((id: number) => {
    router.push(`/procurement/supplier/rfq-invitations/${id}`);
  }, [router]);

  const handleRespond = useCallback((id: number) => {
    router.push(`/procurement/supplier/rfq-invitations/${id}/submit`);
  }, [router]);

  const handleDecline = useCallback((id: number) => {
    const quotation = supplierQuotations.find((q: QuotationRequest) => q.id === id);
    if (quotation) {
      setSelectedQuotation(quotation);
      setShowDeclineDialog(true);
    }
  }, [supplierQuotations]);

  const handleDeclineConfirm = useCallback((reason: string) => {
    setShowDeclineDialog(false);
    setSelectedQuotation(null);
    refetch();
  }, [refetch]);

  const handleRefresh = () => {
    refetch();
  };

  // Count pending invitations
  const pendingCount = useMemo(() => {
    if (!supplierId) return 0;
    return supplierQuotations.filter((q: QuotationRequest) => {
      const hasResponded = q.responded_suppliers?.includes(supplierId);
      const hasDeclined = q.declined_suppliers?.includes(supplierId);
      return q.status === 'sent' && !q.is_expired && !hasResponded && !hasDeclined;
    }).length;
  }, [supplierQuotations, supplierId]);

  return (
    <PageTemplate
      title="RFQ Invitations"
      description="View and respond to Request for Quotations (RFQs) from procurement"
      icon={<Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier', href: '/procurement/supplier' },
        { label: 'RFQ Invitations' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {pendingCount > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full animate-pulse">
              <Bell className="h-3 w-3 mr-1" />
              {pendingCount} Pending
            </Badge>
          )}
          <Badge className="bg-primary/10 dark:bg-primary/20 text-primary border-primary/20 dark:border-primary/30 rounded-full">
            <Mail className="h-3 w-3 mr-1" />
            {supplierQuotations.length} Invitations
          </Badge>
          {hasSupplierProfile && supplier && (
            <Badge variant="outline" className="rounded-full">
              <Building2 className="h-3 w-3 mr-1" />
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
        </div>
      }
    >
      {/* Stats Cards */}
      <StatsCards
        quotations={supplierQuotations}
        isLoading={isLoading}
        supplierId={supplierId}
      />

      {/* Info Banner - New Invitations */}
      {pendingCount > 0 && (
        <div className="mt-6">
          <Card className="border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-700 dark:text-blue-300">
                    {pendingCount} New RFQ Invitation{pendingCount > 1 ? 's' : ''} Received
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400/80">
                    Please review and respond to these RFQs before the closing date.
                  </p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl"
                      onClick={() => {
                        // Scroll to the first pending item
                        const firstPending = supplierQuotations.find((q: QuotationRequest) => {
                          const hasResponded = q.responded_suppliers?.includes(supplierId || 0);
                          const hasDeclined = q.declined_suppliers?.includes(supplierId || 0);
                          return q.status === 'sent' && !q.is_expired && !hasResponded && !hasDeclined;
                        });
                        if (firstPending) {
                          const element = document.getElementById(`rfq-${firstPending.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Pending
                    </Button>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Respond Now</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expired Warning */}
      {supplierQuotations.filter((q: QuotationRequest) => q.is_expired).length > 0 && (
        <div className="mt-4">
          <Card className="border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-amber-700 dark:text-amber-300">
                    {supplierQuotations.filter((q: QuotationRequest) => q.is_expired).length}
                    {' '}RFQ{hasSupplierProfile ? '' : 's'} Have Expired
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400/80">
                    These invitations have passed their closing date and are no longer accepting responses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6">
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Table */}
      <RFQInvitationsTable
        data={supplierQuotations}
        isLoading={isLoading}
        supplierId={supplierId}
        onView={handleView}
        onRespond={handleRespond}
        onDecline={handleDecline}
        onRowClick={handleRowClick}
        currentPage={currentPage}
        totalItems={pagination.total || 0}
        totalPages={pagination.last_page || 0}
        onPageChange={handlePageChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Decline Dialog */}
      <DeclineDialog
        open={showDeclineDialog}
        onOpenChange={setShowDeclineDialog}
        quotation={selectedQuotation}
        onConfirm={handleDeclineConfirm}
        isSubmitting={false}
      />
    </PageTemplate>
  );
}
