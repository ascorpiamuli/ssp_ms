// frontend/src/app/(dashboard)/procurement/supplier/order-history/page.tsx

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
  ShoppingCart,
  Truck,
  Package,
  Download,
  Printer,
  Share2,
  MoreVertical,
  CheckCircle2,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  AlertOctagon,
  FileCheck2,
  ShoppingBag,
  Receipt,
  CreditCard,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Store,
  Handshake,
  ThumbsUp,
  Shield,
  Crown,
  Gem,
  Sparkles,
  Rocket,
  Zap as ZapIcon,
  Star,
  BellRing,
  CalendarDays,
  ListChecks,
  Clipboard,
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
import { usePurchaseOrders } from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRequisition } from '@/hooks/useRequisitionQueries';

// Types
import type { PurchaseOrder } from '@/types/purchaseOrder.types';

// Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 10;

// Status config for badges
const statusBadgeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  draft: {
    label: 'Draft',
    icon: FileText,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
  },
  issued: {
    label: 'Issued',
    icon: Send,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  },
  sent: {
    label: 'Awaiting Acknowledgment',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  },
  acknowledged: {
    label: 'Acknowledged',
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  },
  delivered: {
    label: 'Delivered',
    icon: Truck,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  },
  partial: {
    label: 'Partial',
    icon: Clock,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
  },
  completed: {
    label: 'Completed',
    icon: FileCheck,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Ban,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  },
  closed: {
    label: 'Closed',
    icon: FileCheck,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
  },
};

// Type labels
const typeLabels: Record<string, { label: string; color: string }> = {
  lpo: { label: 'LPO (Goods)', color: 'border-blue-200 text-blue-600 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950/30' },
  lso: { label: 'LSO (Services)', color: 'border-purple-200 text-purple-600 bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:bg-purple-950/30' },
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

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'KES 0.00';
  return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

const Filters = ({ filters, onFilterChange, onReset }: FiltersProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'sent', label: 'Awaiting Acknowledgment' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'partial', label: 'Partial' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'closed', label: 'Closed' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'lpo', label: 'LPO (Goods)' },
    { value: 'lso', label: 'LSO (Services)' },
  ];

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by PO number, title, or RFQ..."
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
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => onFilterChange('type', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                {typeOptions.map((option) => (
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
// REQUISITION FETCHER COMPONENT
// ============================================

interface RequisitionNumberProps {
  requisitionId: number;
}

const RequisitionNumber = ({ requisitionId }: RequisitionNumberProps) => {
  const { data: requisition, isLoading } = useRequisition(requisitionId, {
    enabled: !!requisitionId,
  });

  if (isLoading) {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }

  if (!requisition) {
    return <span className="text-sm text-muted-foreground">N/A</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-help">
            {requisition.reference_number}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-1">
            <p className="font-semibold">{requisition.reference_number}</p>
            <p className="text-xs text-muted-foreground">{requisition.title}</p>
            <p className="text-xs text-muted-foreground">Status: {requisition.status_label}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// ORDER HISTORY TABLE
// ============================================

interface OrderHistoryTableProps {
  data: PurchaseOrder[];
  isLoading: boolean;
  onView: (id: number) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const OrderHistoryTable = ({
  data,
  isLoading,
  onView,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
}: OrderHistoryTableProps) => {
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
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No Purchase Orders</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You don't have any purchase orders yet. Purchase orders will appear here once procurement issues them.
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
              <TableHead className="min-w-[160px] py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">PO Number</TableHead>
              <TableHead className="min-w-[180px] py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">PO Title</TableHead>
              <TableHead className="min-w-[140px] py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Requisition</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Issue Date</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Expected Delivery</TableHead>
              <TableHead className="py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((po, index) => {
              const status = po.status || 'draft';
              const type = po.type || 'lpo';
              const typeConfig = typeLabels[type] || typeLabels.lpo;
              const isOverdue = po.is_overdue;
              const deliveryProgress = po.delivery_progress || 0;

              return (
                <TableRow
                  key={po.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group relative",
                    status === 'completed' && "border-l-4 border-l-emerald-500",
                    status === 'cancelled' && "border-l-4 border-l-red-500",
                    status === 'sent' && "border-l-4 border-l-amber-500",
                    status === 'acknowledged' && "border-l-4 border-l-emerald-500",
                    status === 'delivered' && "border-l-4 border-l-blue-500",
                    status === 'partial' && "border-l-4 border-l-orange-500",
                    status === 'closed' && "border-l-4 border-l-gray-400 opacity-60",
                    isOverdue && status === 'sent' && "border-l-4 border-l-red-500 bg-red-50/5 dark:bg-red-950/10"
                  )}
                  onClick={() => onView(po.id)}
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
                        {po.po_number || 'N/A'}
                      </p>
                      {isOverdue && status === 'sent' && (
                        <Badge className="mt-1 text-[9px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 rounded-full animate-pulse">
                          <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate max-w-[180px]">
                        {po.title || 'N/A'}
                      </p>
                      {po.requisition && (
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {po.requisition.title || ''}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {po.requisition_id ? (
                      <RequisitionNumber requisitionId={po.requisition_id} />
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <Badge variant="outline" className={cn("rounded-full text-xs", typeConfig.color)}>
                      {typeConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(po.issue_date)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(po.expected_delivery_date)}
                      </p>
                      {deliveryProgress > 0 && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Progress value={deliveryProgress} className="h-1.5 w-16" />
                          <span className="text-xs text-muted-foreground">{deliveryProgress}%</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {formatCurrency(po.total_amount)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(po.id)}
                              className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg">View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => window.print()}
                            >
                              <Printer className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg">Print</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {(status === 'completed' || status === 'delivered') && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-7 w-7 p-0 rounded-lg",
                                  status === 'completed' ? "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600" : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"
                                )}
                              >
                                {status === 'completed' ? (
                                  <FileCheck className="h-3.5 w-3.5" />
                                ) : (
                                  <Truck className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg">
                              {status === 'completed' ? 'Completed Order' : 'Delivered'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {status === 'sent' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => onView(po.id)}
                                className="h-7 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/20 text-[10px]"
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Acknowledge
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg">Acknowledge this PO</TooltipContent>
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
// MAIN PAGE
// ============================================

export default function SupplierOrderHistoryPage() {
  const router = useRouter();
  const { success } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  // ============================================
  // QUERIES
  // ============================================

  const { useSupplierProfileExists } = useSuppliers();
  const { exists: hasSupplierProfile, supplier, isLoading: supplierLoading } = useSupplierProfileExists();

  // Get ALL purchase orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch,
    isFetching,
  } = usePurchaseOrders();

  // ============================================
  // PROCESS DATA
  // ============================================

  const getOrdersArray = useCallback((data: any): PurchaseOrder[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.success && data.data && Array.isArray(data.data)) return data.data;
    return [];
  }, []);

  const ordersArray = useMemo(() => getOrdersArray(ordersData), [ordersData, getOrdersArray]);

  const supplierId = useMemo(() => {
    if (!supplier) return undefined;
    return (supplier as any)?.id as number | undefined;
  }, [supplier]);

  // Filter orders to only show this supplier's orders with relevant statuses
  const supplierOrders = useMemo(() => {
    if (!ordersArray.length) return [];
    if (!supplierId) return [];

    return ordersArray.filter((order: PurchaseOrder) => {
      const isMatchingSupplier = order.supplier_id === supplierId;
      const isRelevantStatus = [
        'sent',
        'acknowledged',
        'delivered',
        'partial',
        'completed',
        'closed',
        'cancelled'
      ].includes(order.status);

      return isMatchingSupplier && isRelevantStatus;
    });
  }, [ordersArray, supplierId]);

  // Apply filters
  const filteredOrders = useMemo(() => {
    return supplierOrders.filter((order: PurchaseOrder) => {
      if (filters.status && filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }
      if (filters.type && filters.type !== 'all' && order.type !== filters.type) {
        return false;
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesPO = order.po_number?.toLowerCase().includes(search) || false;
        const matchesTitle = order.title?.toLowerCase().includes(search) || false;
        const matchesRFQ = (order as any).quotation_request?.qtn_number?.toLowerCase().includes(search) || false;
        return matchesPO || matchesTitle || matchesRFQ;
      }
      return true;
    });
  }, [supplierOrders, filters]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;

  // ============================================
  // STATS
  // ============================================

  const stats = useMemo(() => {
    const total = supplierOrders.length;
    const pending = supplierOrders.filter((o: PurchaseOrder) => o.status === 'sent').length;
    const acknowledged = supplierOrders.filter((o: PurchaseOrder) => o.status === 'acknowledged').length;
    const delivered = supplierOrders.filter((o: PurchaseOrder) => o.status === 'delivered').length;
    const completed = supplierOrders.filter((o: PurchaseOrder) => o.status === 'completed').length;
    const cancelled = supplierOrders.filter((o: PurchaseOrder) => o.status === 'cancelled').length;
    const overdue = supplierOrders.filter((o: PurchaseOrder) => o.is_overdue && o.status === 'sent').length;

    const totalAmount = supplierOrders.reduce((sum: number, o: PurchaseOrder) =>
      sum + (parseFloat(o.total_amount as any) || 0), 0
    );

    const avgOrderValue = total > 0 ? totalAmount / total : 0;

    return {
      total,
      pending,
      acknowledged,
      delivered,
      completed,
      cancelled,
      overdue,
      totalAmount,
      avgOrderValue,
    };
  }, [supplierOrders]);

  const isLoading = authLoading || supplierLoading || ordersLoading;

  // ============================================
  // HANDLERS
  // ============================================

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
    router.push(`/procurement/supplier/purchase-orders/${id}`);
  }, [router]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Stats cards
  const statsItems: StatCardItem[] = useMemo(() => [
    {
      label: 'Total Orders',
      value: stats.total,
      icon: ShoppingCart,
      tagLabel: 'TOTAL',
      tagColor: 'blue',
      subtitle: 'All your purchase orders',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      tagLabel: 'PENDING',
      tagColor: 'amber',
      subtitle: stats.overdue > 0 ? `${stats.overdue} overdue` : 'Awaiting acknowledgment',
    },
    {
      label: 'Acknowledged',
      value: stats.acknowledged,
      icon: CheckCircle,
      tagLabel: 'ACKNOWLEDGED',
      tagColor: 'emerald',
      subtitle: 'Accepted orders',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: FileCheck,
      tagLabel: 'COMPLETED',
      tagColor: 'teal',
      subtitle: 'Fully delivered',
    },
    {
      label: 'Total Value',
      value: formatCurrency(stats.totalAmount),
      icon: DollarSign,
      tagLabel: 'VALUE',
      tagColor: 'purple',
      subtitle: `Avg: ${formatCurrency(stats.avgOrderValue)}`,
    },
  ], [stats]);

  // Show loading state
  if (isLoading) {
    return (
      <PageTemplate
        title="My Order History"
        description="View all your purchase orders"
        icon={<ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'Order History' },
        ]}
        actions={
          <Button variant="outline" size="sm" disabled className="gap-2 h-9 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
          <div className="h-96 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </PageTemplate>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <PageTemplate
        title="My Order History"
        description="Please login to continue"
        icon={<ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'Order History' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-4">
                <AlertCircle className="h-12 w-12 text-amber-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Please Login</h3>
              <p className="text-muted-foreground max-w-sm">
                You need to be logged in to view your order history.
              </p>
              <Button
                variant="default"
                size="sm"
                className="mt-4 rounded-xl"
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // Show message if supplier profile doesn't exist
  if (!hasSupplierProfile) {
    return (
      <PageTemplate
        title="My Order History"
        description="View all your purchase orders"
        icon={<ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'Order History' },
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
                Please complete your supplier profile to view your order history.
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

  const supplierName = (supplier as any)?.company_name || (supplier as any)?.full_name || 'Supplier';

  return (
    <PageTemplate
      title="My Order History"
      description={`View all your purchase orders for ${supplierName}`}
      icon={<ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier', href: '/procurement/supplier' },
        { label: 'Order History' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {stats.pending > 0 && (
            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 animate-pulse">
              <BellRing className="h-3.5 w-3.5 mr-1.5" />
              {stats.pending} Pending
            </Badge>
          )}
          {stats.overdue > 0 && (
            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 rounded-full px-3 py-1 animate-pulse">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
              {stats.overdue} Overdue
            </Badge>
          )}
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            {stats.completed} Completed
          </Badge>
          <Badge className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 rounded-full px-3 py-1">
            <FileCheck className="h-3.5 w-3.5 mr-1.5" />
            {stats.acknowledged} Acknowledged
          </Badge>
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-3 py-1">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            {formatCurrency(stats.totalAmount)}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            <Store className="h-3.5 w-3.5 mr-1.5" />
            {supplierName}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            className="gap-2 h-9 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4", (isLoading || isFetching) && "animate-spin")} />
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
        <StatsCards
          stats={statsItems}
          isLoading={isLoading}
          columns={5}
          variant="default"
          formatCompact={true}
        />

        {/* Alert: Pending Orders */}
        {stats.pending > 0 && (
          <Alert className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <AlertTitle className="text-amber-800 dark:text-amber-300">
                  {stats.pending} Order{stats.pending > 1 ? 's' : ''} Awaiting Acknowledgment
                </AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  {stats.overdue > 0 && `${stats.overdue} of these are overdue. `}
                  Please review and acknowledge these orders to proceed with delivery.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Alert: Completed Orders Summary */}
        {stats.completed > 0 && (
          <Alert className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <AlertTitle className="text-emerald-800 dark:text-emerald-300">
                  {stats.completed} Order{stats.completed > 1 ? 's' : ''} Completed
                </AlertTitle>
                <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                  Total value of completed orders: {formatCurrency(stats.totalAmount)}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Filters */}
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-gray-900 dark:text-gray-100">{paginatedOrders.length}</span> of{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{filteredOrders.length}</span> orders
            </p>
            <Badge variant="outline" className="rounded-full text-xs bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
              <ShoppingCart className="h-3 w-3 mr-1" />
              {stats.total} Total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Total Value: <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalAmount)}</span>
          </p>
        </div>

        {/* Table */}
        <OrderHistoryTable
          data={paginatedOrders}
          isLoading={isLoading}
          onView={handleView}
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </PageTemplate>
  );
}
