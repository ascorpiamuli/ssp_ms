// frontend/src/app/(dashboard)/procurement/supplier/rfq-invitations/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Building2,
  Loader2,
  Award,
  FileCheck,
  DollarSign,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  Table as TableIcon,
  LayoutGrid,
  Send,
  Ban,
  Filter,
  Users,
  Mail,
  Bell,
  AlertCircle,
  Timer,
  ChevronRight,
  ChevronUp,
  Tag,
  Hash,
  ExternalLink,
  User,
  Briefcase,
  AlertTriangle,
  Zap,
  TrendingUp,
  Check,
  ClipboardList,
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Hooks
import { useSuppliers } from '@/hooks/useSuppliers';
import { useQuotations } from '@/hooks/useQuotation';

// Types
import type { QuotationRequest } from '@/types/quotations.types';

// Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 10;

// Status config for badges
const statusBadgeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  sent: {
    label: 'Sent',
    icon: Send,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  },
  responded: {
    label: 'Responded',
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  },
  declined: {
    label: 'Declined',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  },
  closed: {
    label: 'Closed',
    icon: FileCheck,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Ban,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  },
  draft: {
    label: 'Draft',
    icon: FileText,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
  },
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

const formatDateTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
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

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusBadgeConfig[status] || statusBadgeConfig.draft;
  const Icon = config.icon;
  return (
    <Badge className={cn("flex items-center gap-1.5 px-3 py-1 font-medium rounded-full", config.bg, config.color)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
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
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'sent', label: 'Sent' },
    { value: 'responded', label: 'Responded' },
    { value: 'declined', label: 'Declined' },
    { value: 'closed', label: 'Closed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
  ];

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by RFQ number or title..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-9 h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-[150px]">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="gap-1 rounded-xl h-10 px-3"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="gap-1 rounded-xl h-10 px-3"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
            </Button>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-3 border-t dark:border-gray-700">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Date To</Label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => onFilterChange('dateTo', e.target.value)}
                className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// RFQ TABLE COMPONENT
// ============================================

interface RFQTableProps {
  data: QuotationRequest[];
  isLoading: boolean;
  supplierId?: number;
  onView: (id: number) => void;
  onRespond: (id: number) => void;
  onDecline: (id: number) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const RFQTable = ({
  data,
  isLoading,
  supplierId,
  onView,
  onRespond,
  onDecline,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
}: RFQTableProps) => {
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
    return quotation.status || 'sent';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 relative">
        <WrappedCornerTag label="Empty" color="gray" position="top-left" size="sm" />
        <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <Mail className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No RFQ Invitations</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You haven't received any RFQ invitations yet. When procurement sends you an RFQ, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
              <TableHead className="w-[50px] py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">#</TableHead>
              <TableHead className="min-w-[160px] py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">RFQ</TableHead>
              <TableHead className="min-w-[180px] py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Title</TableHead>
              <TableHead className="min-w-[140px] py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Requisition</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Closing</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Time Left</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Responses</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((quotation, index) => {
              const isExpired = quotation.is_expired;
              const timeRemaining = getTimeRemaining(quotation.closing_date);
              const hasResponded = hasSupplierResponded(quotation);
              const hasDeclined = hasSupplierDeclined(quotation);
              const isClosed = quotation.status === 'closed' || quotation.status === 'cancelled';
              const supplierStatus = getSupplierSpecificStatus(quotation);
              const supplierCount = quotation.sent_to_suppliers?.length || 0;
              const respondedCount = quotation.responded_suppliers?.length || 0;
              const responseRate = supplierCount > 0 ? Math.round((respondedCount / supplierCount) * 100) : 0;

              const canRespond = !isExpired && !isClosed && !hasResponded && !hasDeclined && quotation.status === 'sent';

              const generatedBy = quotation.generated_by as any;
              const creatorName = generatedBy?.full_name || 'Unknown';
              const requisitionNumber = (quotation as any).requisition?.reference_number || 'N/A';

              return (
                <TableRow
                  key={quotation.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group relative",
                    supplierStatus === 'responded' && "border-l-4 border-l-emerald-500",
                    supplierStatus === 'declined' && "border-l-4 border-l-red-500",
                    supplierStatus === 'sent' && "border-l-4 border-l-blue-500",
                    supplierStatus === 'closed' && "border-l-4 border-l-purple-500",
                    supplierStatus === 'expired' && "border-l-4 border-l-amber-500",
                    supplierStatus === 'cancelled' && "border-l-4 border-l-gray-400 opacity-60"
                  )}
                  onClick={() => onView(quotation.id)}
                >
                  <TableCell className="py-3 relative text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors text-gray-700 dark:text-gray-300 text-xs font-medium">
                        {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                        {quotation.qtn_number}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        Issued: {formatDate(quotation.issue_date)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <User className="h-3 w-3" />
                        {creatorName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate max-w-[200px]">
                        {quotation.title}
                      </p>
                      {quotation.is_automated && (
                        <Badge className="mt-1 text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full">
                          <Zap className="h-3 w-3 mr-1" />
                          Automated
                        </Badge>
                      )}
                      {quotation.is_tender && (
                        <Badge className="mt-1 text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full">
                          <Award className="h-3 w-3 mr-1" />
                          Tender
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                        {requisitionNumber}
                      </p>
                      {(quotation as any).requisition?.title && (
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {(quotation as any).requisition.title}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <StatusBadge status={supplierStatus} />
                      {timeRemaining.isClosingSoon && !isExpired && !isClosed && !hasResponded && !hasDeclined && (
                        <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full animate-pulse">
                          <Clock className="h-2.5 w-2.5 mr-0.5" />
                          Closing Soon
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(quotation.closing_date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quotation.closing_time ? format(new Date(quotation.closing_time), 'HH:mm') : ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "text-sm font-medium",
                        isExpired ? "text-red-500 dark:text-red-400" :
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
                  <TableCell className="py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {respondedCount}/{supplierCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {responseRate}% responded
                      </span>
                      <Progress value={responseRate} className="h-1 w-16 mt-1" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(quotation.id)}
                              className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg">View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {canRespond && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => onRespond(quotation.id)}
                                className="h-7 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/20 text-[10px]"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Respond
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg">Submit your quotation</TooltipContent>
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
                                className="h-7 px-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-[10px]"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Decline
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg">Decline this RFQ</TooltipContent>
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
      </div>

      {totalItems > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
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

  const quickReasons = [
    'Capacity constraints - unable to fulfill order',
    'Pricing does not meet our minimum threshold',
    'Terms and conditions not acceptable',
    'Insufficient timeline for delivery',
    'Already committed to other projects',
    'Not within our area of expertise',
  ];

  const handleSubmit = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Decline RFQ
          </DialogTitle>
          <DialogDescription>
            You are about to decline <strong>{quotation?.qtn_number}</strong>
            <br />
            <span className="text-xs text-muted-foreground">This action cannot be undone.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Reasons</Label>
            <div className="flex flex-wrap gap-1.5">
              {quickReasons.map((reasonText) => (
                <Button
                  key={reasonText}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-xs rounded-full h-7 px-3",
                    reason === reasonText && "border-red-500 bg-red-50 dark:bg-red-900/20"
                  )}
                  onClick={() => setReason(reasonText)}
                >
                  {reasonText.length > 30 ? reasonText.slice(0, 30) + '...' : reasonText}
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
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="bg-red-600 hover:bg-red-700 rounded-xl gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Decline RFQ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function SupplierRFQInvitationsPage() {
  const router = useRouter();
  const { success } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRequest | null>(null);

  // ============================================
  // QUERIES
  // ============================================

  const { useSupplierProfileExists } = useSuppliers();
  const { exists: hasSupplierProfile, supplier } = useSupplierProfileExists();

  const { data: quotationsData, isLoading, refetch, isFetching } = useQuotations({
    status: filters.status as any,
    search: filters.search,
    page: currentPage,
    per_page: ITEMS_PER_PAGE,
  });

  // ============================================
  // PROCESS DATA
  // ============================================

  const quotations = useMemo(() => {
    if (Array.isArray(quotationsData)) {
      return quotationsData;
    }
    if (quotationsData && typeof quotationsData === 'object' && 'data' in quotationsData) {
      return (quotationsData as any).data || [];
    }
    return [];
  }, [quotationsData]);

  const supplierId = useMemo(() => {
    if (!supplier) return undefined;
    return (supplier as any)?.id as number | undefined;
  }, [supplier]);

  const supplierQuotations = useMemo(() => {
    if (!supplierId) return [];
    return quotations.filter((q: QuotationRequest) => {
      return q.sent_to_suppliers && Array.isArray(q.sent_to_suppliers) && q.sent_to_suppliers.includes(supplierId);
    });
  }, [quotations, supplierId]);

  const pagination = useMemo(() => {
    if (quotationsData && typeof quotationsData === 'object' && 'meta' in quotationsData) {
      return (quotationsData as any).meta;
    }
    return {
      total: supplierQuotations.length,
      current_page: currentPage,
      last_page: Math.ceil(supplierQuotations.length / ITEMS_PER_PAGE) || 1,
    };
  }, [quotationsData, supplierQuotations.length, currentPage]);

  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return supplierQuotations.slice(start, end);
  }, [supplierQuotations, currentPage]);

  // Stats
  const totalQuotations = supplierQuotations.length;
  const pendingCount = supplierQuotations.filter((q: QuotationRequest) => {
    if (!supplierId) return false;
    const hasResponded = q.responded_suppliers?.includes(supplierId);
    const hasDeclined = q.declined_suppliers?.includes(supplierId);
    return q.status === 'sent' && !q.is_expired && !hasResponded && !hasDeclined;
  }).length;

  const respondedCount = supplierQuotations.filter((q: QuotationRequest) => {
    if (!supplierId) return false;
    return q.responded_suppliers?.includes(supplierId);
  }).length;

  const declinedCount = supplierQuotations.filter((q: QuotationRequest) => {
    if (!supplierId) return false;
    return q.declined_suppliers?.includes(supplierId);
  }).length;

  const expiredCount = supplierQuotations.filter((q: QuotationRequest) => q.is_expired).length;

  const avgResponseRate = supplierQuotations.length > 0
    ? Math.round(supplierQuotations.reduce((acc: number, q: QuotationRequest) => {
      const total = q.sent_to_suppliers?.length || 0;
      const responded = q.responded_suppliers?.length || 0;
      return acc + (total > 0 ? (responded / total) * 100 : 0);
    }, 0) / supplierQuotations.length)
    : 0;

  // ============================================
  // HANDLERS
  // ============================================

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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

  const handleDeclineConfirm = useCallback(
    (reason: string) => {
      setShowDeclineDialog(false);
      setSelectedQuotation(null);
      success('RFQ declined successfully');
      refetch();
    },
    [refetch, success]
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Stats cards
  const statsItems: StatCardItem[] = useMemo(
    () => [
      {
        label: 'Total Invitations',
        value: totalQuotations,
        icon: Mail,
        tagLabel: 'TOTAL',
        tagColor: 'blue',
        subtitle: 'RFQs sent to you',
      },
      {
        label: 'Pending Response',
        value: pendingCount,
        icon: Clock,
        tagLabel: 'PENDING',
        tagColor: 'amber',
        subtitle: 'Awaiting your response',
      },
      {
        label: 'Responded',
        value: respondedCount,
        icon: CheckCircle,
        tagLabel: 'RESPONDED',
        tagColor: 'emerald',
        subtitle: 'You have responded',
      },
      {
        label: 'Declined',
        value: declinedCount,
        icon: XCircle,
        tagLabel: 'DECLINED',
        tagColor: 'red',
        subtitle: 'You have declined',
      },
      {
        label: 'Response Rate',
        value: `${avgResponseRate}%`,
        icon: TrendingUp,
        tagLabel: 'RATE',
        tagColor: 'purple',
        subtitle: 'Your overall response rate',
      },
    ],
    [totalQuotations, pendingCount, respondedCount, declinedCount, avgResponseRate]
  );

  return (
    <PageTemplate
      title="RFQ Invitations"
      description="View and respond to Request for Quotations (RFQs) from procurement"
      icon={<Mail className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />}
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
            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 animate-pulse">
              <Bell className="h-3.5 w-3.5 mr-1.5" />
              {pendingCount} Pending
            </Badge>
          )}
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            {respondedCount} Responded
          </Badge>
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full px-3 py-1">
            <Mail className="h-3.5 w-3.5 mr-1.5" />
            {totalQuotations} Total
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            className="gap-2 h-9 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn('h-4 w-4', (isLoading || isFetching) && 'animate-spin')} />
            Refresh
          </Button>
          <div className="flex items-center gap-1 border-l dark:border-gray-700 pl-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-9 w-9 p-0 rounded-lg"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-9 w-9 p-0 rounded-lg"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <StatsCards stats={statsItems} isLoading={isLoading} columns={5} variant="default" formatCompact={true} />

        {/* Alert: Pending Invitations */}
        {pendingCount > 0 && (
          <Alert className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <AlertTitle className="text-blue-800 dark:text-blue-300">
                  {pendingCount} New RFQ Invitation{pendingCount > 1 ? 's' : ''} Received
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  Please review and respond to these RFQs before the closing date.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Alert: Expired Invitations */}
        {expiredCount > 0 && (
          <Alert className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <AlertTitle className="text-amber-800 dark:text-amber-300">
                  {expiredCount} RFQ{expiredCount > 1 ? 's' : ''} Have Expired
                </AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  These invitations have passed their closing date and are no longer accepting responses.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Filters */}
        <Filters filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

        {/* Results Count */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-gray-900 dark:text-gray-100">{paginatedQuotations.length}</span> of{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{supplierQuotations.length}</span> invitations
            </p>
            <Badge variant="outline" className="rounded-full text-xs bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
              <Mail className="h-3 w-3 mr-1" />
              {totalQuotations} Total
            </Badge>
          </div>
        </div>

        {/* Table */}
        <RFQTable
          data={paginatedQuotations}
          isLoading={isLoading}
          supplierId={supplierId}
          onView={handleView}
          onRespond={handleRespond}
          onDecline={handleDecline}
          currentPage={currentPage}
          totalItems={pagination.total || 0}
          totalPages={pagination.last_page || 0}
          onPageChange={handlePageChange}
        />

        {/* Decline Dialog */}
        <DeclineDialog
          open={showDeclineDialog}
          onOpenChange={setShowDeclineDialog}
          quotation={selectedQuotation}
          onConfirm={handleDeclineConfirm}
          isSubmitting={false}
        />
      </div>
    </PageTemplate>
  );
}
