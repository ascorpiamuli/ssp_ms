// frontend/src/app/(dashboard)/procurement/request-for-quotations/responses/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  Users,
  Loader2,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Crown,
  Award,
  FileCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
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
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Hooks
import { useQuotations } from '@/hooks/useQuotation';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { QuotationRequest } from '@/types/quotations.types';

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 10;

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  responded: 'Responded',
  evaluating: 'Evaluating',
  closed: 'Closed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  responded: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  evaluating: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
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

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(num);
};

const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status] || status;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <Badge className={cn("flex items-center gap-1.5 px-3 py-1 font-medium rounded-full", colorClass)}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {getStatusLabel(status)}
    </Badge>
  );
};

// ============================================
// STATS CARDS - Fixed Dark Mode Gradients
// ============================================

interface StatsCardsProps {
  quotations: QuotationRequest[];
  isLoading: boolean;
}

const StatsCards = ({ quotations, isLoading }: StatsCardsProps) => {
  const stats = useMemo(() => {
    const total = quotations.length;
    const responded = quotations.filter(q => q.status === 'responded').length;
    const evaluating = quotations.filter(q => q.status === 'evaluating').length;
    const closed = quotations.filter(q => q.status === 'closed').length;
    const sent = quotations.filter(q => q.status === 'sent').length;

    const totalResponses = quotations.reduce((sum, q) => sum + (q.response_count || 0), 0);
    const avgResponseRate = total > 0 ? Math.round(quotations.reduce((sum, q) => sum + (q.response_rate || 0), 0) / total) : 0;

    const acceptedQuotations = quotations.reduce((sum, q) => {
      if (q.supplier_quotations) {
        return sum + q.supplier_quotations.filter((sq: any) => sq.status === 'accepted').length;
      }
      return sum;
    }, 0);

    return {
      total,
      sent,
      responded,
      evaluating,
      closed,
      totalResponses,
      avgResponseRate,
      acceptedQuotations,
    };
  }, [quotations]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-sm rounded-xl bg-gray-100 dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total RFQs',
      value: stats.total,
      icon: FileText,
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Sent',
      value: stats.sent,
      icon: FileText,
      bgColor: 'bg-sky-50 dark:bg-sky-900/30',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      label: 'Responded',
      value: stats.responded,
      icon: Users,
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Total Responses',
      value: stats.totalResponses,
      icon: MessageSquare,
      bgColor: 'bg-violet-50 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Evaluating',
      value: stats.evaluating,
      icon: Clock,
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Accepted',
      value: stats.acceptedQuotations,
      icon: Crown,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Closed',
      value: stats.closed,
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Avg Response',
      value: `${stats.avgResponseRate}%`,
      icon: TrendingUp,
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                {card.label}
              </p>
              <div className={cn("p-2 rounded-xl", card.bgColor, card.iconColor)}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ============================================
// RESPONSE DETAILS DIALOG
// ============================================

interface ResponseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfq: QuotationRequest | null;
}

const ResponseDetailsDialog = ({ open, onOpenChange, rfq }: ResponseDetailsDialogProps) => {
  if (!rfq) return null;

  // Get supplier name from quotation or fallback to supplier_id
  const getSupplierName = (sq: any): string => {
    if (sq.supplier_name && sq.supplier_name !== 'Unknown Supplier') {
      return sq.supplier_name;
    }
    // Try to get from supplier relationship if available
    if (sq.supplier?.company_name) {
      return sq.supplier.company_name;
    }
    if (sq.supplier?.display_name) {
      return sq.supplier.display_name;
    }
    if (sq.supplier?.full_name) {
      return sq.supplier.full_name;
    }
    return `Supplier #${sq.supplier_id}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {rfq.qtn_number} - Responses
          </DialogTitle>
          <DialogDescription>
            {rfq.title} • {formatDate(rfq.issue_date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rfq.response_count || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rfq.response_rate || 0}%</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={rfq.status} />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(rfq.requisition?.total_amount || 0)}
              </p>
            </div>
          </div>

          {/* Responses List */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Users className="h-4 w-4 text-indigo-500" />
              Supplier Quotations
            </h4>
            {rfq.supplier_quotations && rfq.supplier_quotations.length > 0 ? (
              <div className="space-y-3">
                {rfq.supplier_quotations.map((sq: any) => {
                  const supplierName = getSupplierName(sq);
                  return (
                    <div
                      key={sq.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                            <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                              {getInitials(supplierName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{supplierName}</p>
                            <p className="text-sm text-muted-foreground">{sq.quotation_number}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge className={cn(
                                "rounded-full text-xs px-2.5 py-0.5",
                                sq.status === 'accepted' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                  sq.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                    sq.status === 'evaluated' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                              )}>
                                {sq.status.charAt(0).toUpperCase() + sq.status.slice(1)}
                              </Badge>
                              {sq.is_lowest && (
                                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 rounded-full text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Lowest
                                </Badge>
                              )}
                              {sq.evaluation_score && sq.evaluation_score > 0 && (
                                <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full text-xs">
                                  <Award className="h-3 w-3 mr-1" />
                                  {sq.evaluation_score}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(sq.net_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatDate(sq.submission_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p>No supplier quotations yet</p>
                <p className="text-sm">Responses will appear here once suppliers submit their quotations</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// RESPONSES TABLE
// ============================================

interface ResponsesTableProps {
  rfqs: QuotationRequest[];
  isLoading: boolean;
  onView: (id: number) => void;
  onEvaluate: (id: number) => void;
  onSelect: (id: number) => void;
  onVerify: (id: number) => void;
  onViewResponses: (rfq: QuotationRequest) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ResponsesTable = ({
  rfqs,
  isLoading,
  onView,
  onEvaluate,
  onSelect,
  onVerify,
  onViewResponses,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
}: ResponsesTableProps) => {
  // Get supplier name from quotation
  const getSupplierName = (sq: any): string => {
    if (sq.supplier_name && sq.supplier_name !== 'Unknown Supplier') {
      return sq.supplier_name;
    }
    if (sq.supplier?.company_name) {
      return sq.supplier.company_name;
    }
    if (sq.supplier?.display_name) {
      return sq.supplier.display_name;
    }
    if (sq.supplier?.full_name) {
      return sq.supplier.full_name;
    }
    return `Supplier #${sq.supplier_id}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (rfqs.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No RFQ Responses</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          No RFQs with supplier responses found. RFQs appear here once suppliers have submitted quotations.
        </p>
        <Button
          variant="outline"
          className="mt-4 rounded-xl"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
              <TableHead className="w-[50px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">#</TableHead>
              <TableHead className="min-w-[180px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  RFQ Number
                </div>
              </TableHead>
              <TableHead className="min-w-[200px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Title</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Responses</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Best Bid</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqs.map((rfq, index) => {
              const hasResponses = (rfq.response_count || 0) > 0;
              const canEvaluate = rfq.status === 'responded' && hasResponses;
              const canSelect = rfq.status === 'evaluating' && hasResponses;
              const canVerify = rfq.status === 'responded' && hasResponses;

              // Calculate best bid with supplier name
              let bestBid: number | null = null;
              let bestBidSupplier = 'Unknown';
              if (rfq.supplier_quotations && rfq.supplier_quotations.length > 0) {
                const sorted = [...rfq.supplier_quotations].sort((a: any, b: any) =>
                  parseFloat(a.net_amount || 0) - parseFloat(b.net_amount || 0)
                );
                if (sorted.length > 0) {
                  bestBid = parseFloat(String(sorted[0].net_amount || 0));
                  bestBidSupplier = getSupplierName(sorted[0]);
                }
              }
              const responseRate = rfq.response_rate || 0;

              return (
                <TableRow
                  key={rfq.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group"
                  onClick={() => onView(rfq.id)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground py-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors text-gray-700 dark:text-gray-300">
                      {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {rfq.qtn_number}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(rfq.issue_date)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[220px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {rfq.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {rfq.description || 'No description'}
                      </p>
                      {rfq.requisition && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Req: {rfq.requisition.reference_number}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={rfq.status} />
                      {rfq.is_expired && (
                        <Badge variant="destructive" className="text-[10px] rounded-full">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      )}
                      {rfq.is_closing_soon && !rfq.is_expired && rfq.status !== "closed" && rfq.status !== "cancelled" && (
                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px] rounded-full">
                          <Clock className="h-3 w-3 mr-1" />
                          Closing Soon
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {rfq.response_count || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / {rfq.sent_suppliers_count || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-[40px]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(responseRate, 100)}%`,
                              backgroundColor: responseRate >= 80 ? '#10b981' : responseRate >= 50 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium min-w-[35px] text-right text-gray-700 dark:text-gray-300">
                          {responseRate}%
                        </span>
                      </div>
                      {rfq.supplier_quotations && rfq.supplier_quotations.length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          {rfq.supplier_quotations.map((sq: any, i: number) => (
                            <div
                              key={i}
                              className={cn(
                                "h-2 w-2 rounded-full",
                                sq.status === 'accepted' ? 'bg-emerald-500' :
                                  sq.status === 'rejected' ? 'bg-red-500' :
                                    sq.status === 'evaluated' ? 'bg-purple-500' :
                                      'bg-amber-500'
                              )}
                              title={`${getSupplierName(sq)} - ${sq.status}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    {bestBid !== null ? (
                      <div>
                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(bestBid)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px] ml-auto">
                          {bestBidSupplier}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(rfq.id)}
                              className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl">View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {hasResponses && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewResponses(rfq)}
                                className="h-8 px-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              >
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                Responses
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">View All Responses</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {canVerify && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onVerify(rfq.id)}
                                className="h-8 px-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              >
                                <FileCheck className="h-3.5 w-3.5 mr-1" />
                                Verify
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">Verify Quotations</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {canEvaluate && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEvaluate(rfq.id)}
                                className="h-8 px-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                              >
                                <Award className="h-3.5 w-3.5 mr-1" />
                                Evaluate
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">Evaluate Quotations</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {canSelect && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSelect(rfq.id)}
                                className="h-8 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                              >
                                <Crown className="h-3.5 w-3.5 mr-1" />
                                Select
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">Select Supplier</TooltipContent>
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
              className="h-8 px-3 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
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

export default function RFQResponsesPage() {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRFQ, setSelectedRFQ] = useState<QuotationRequest | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
  }>({});

  // Fetch RFQs with responses
  const { data: quotationsData, isLoading, refetch } = useQuotations({
    status: filters.status as any,
    search: filters.search,
    page: currentPage,
    per_page: ITEMS_PER_PAGE,
  });

  // Extract data
  const quotations = useMemo(() => {
    const raw = Array.isArray(quotationsData) ? quotationsData : quotationsData?.data || [];
    return raw.filter((q: QuotationRequest) =>
      q.status === 'responded' || q.status === 'evaluating' || q.status === 'closed'
    );
  }, [quotationsData]);

  const pagination = useMemo(() => {
    return quotationsData?.meta || { total: 0, current_page: 1, last_page: 1 };
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
    router.push(`/procurement/request-for-quotations/${id}`);
  }, [router]);

  const handleVerify = useCallback((id: number) => {
    router.push(`/procurement/request-for-quotations/${id}/verify`);
  }, [router]);

  const handleEvaluate = useCallback((id: number) => {
    router.push(`/procurement/request-for-quotations/${id}/evaluate`);
  }, [router]);

  const handleSelect = useCallback((id: number) => {
    router.push(`/procurement/request-for-quotations/${id}/select-supplier`);
  }, [router]);

  const handleViewResponses = useCallback((rfq: QuotationRequest) => {
    setSelectedRFQ(rfq);
    setShowResponseDialog(true);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <PageTemplate
      title="RFQ Responses"
      description="Evaluate supplier quotations and select the best supplier"
      icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Request for Quotations', href: '/procurement/request-for-quotations' },
        { label: 'Responses' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 rounded-full px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {quotations.length} Active RFQs
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <StatsCards quotations={quotations} isLoading={isLoading} />

      {/* Info Banner */}
      {quotations.filter((q: QuotationRequest) => q.status === 'responded').length > 0 && (
        <Card className="mb-6 border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex-shrink-0">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-indigo-800 dark:text-indigo-300">
                  {quotations.filter((q: QuotationRequest) => q.status === 'responded').length}
                  RFQ{quotations.filter((q: QuotationRequest) => q.status === 'responded').length > 1 ? 's' : ''}
                  Ready for Evaluation
                </p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400/80">
                  These RFQs have supplier responses. Review and evaluate quotations to select the best supplier.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-6">
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search RFQ by number or title..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full"
                />
              </div>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="evaluating">Evaluating</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1 rounded-xl shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <ResponsesTable
        rfqs={quotations}
        isLoading={isLoading}
        onView={handleView}
        onEvaluate={handleEvaluate}
        onSelect={handleSelect}
        onVerify={handleVerify}
        onViewResponses={handleViewResponses}
        currentPage={currentPage}
        totalItems={pagination.total || 0}
        totalPages={pagination.last_page || 1}
        onPageChange={handlePageChange}
      />

      {/* Response Details Dialog */}
      <ResponseDetailsDialog
        open={showResponseDialog}
        onOpenChange={setShowResponseDialog}
        rfq={selectedRFQ}
      />
    </PageTemplate>
  );
}
