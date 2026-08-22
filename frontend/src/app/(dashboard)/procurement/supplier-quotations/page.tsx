// frontend/src/app/(dashboard)/procurement/supplier-quotations/page.tsx

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Sparkles,
  Star,
  SlidersHorizontal,
  ChevronDown,
  Table as TableIcon,
  LayoutGrid,
  Plus,
  Send,
  Download,
  FileArchive,
  ShoppingBag,
  Ban,
  AlertCircle,
  Filter,
  TrendingUp,
  TrendingDown,
  ListChecks,
  ClipboardList,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Flag,
  Users,
  Mail,
  Phone,
  MapPin,
  Globe,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Shield,
  ShieldCheck as ShieldCheckIcon,
  ShieldAlert,
  ShieldQuestion,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Info,
  Lightbulb,
  Rocket,
  Zap as ZapIcon,
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
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Hooks
import { useSupplierQuotations } from '@/hooks/useSupplierQuotation';
import { useProcurementStatistics } from '@/hooks/useProcurement';
import { useSuppliers } from '@/hooks/useSuppliers';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrder';

// Types
import type { SupplierQuotation } from '@/types/supplierQuotation.types';
import type { PurchaseOrder, PurchaseOrderFilters } from '@/types/purchaseOrder.types';

// Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';
import HorizontalCornerTag from '../../../../components/ui/horizontal-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 10;

// Status color map for WrappedCornerTag
const statusColorMap: Record<string, 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'teal' | 'indigo' | 'gray' | 'slate'> = {
  accepted: 'emerald',
  rejected: 'red',
  pending: 'amber',
  submitted: 'blue',
  evaluated: 'purple',
  cancelled: 'gray',
};

// PO Status color map
const poStatusColorMap: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  issued: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sent: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  acknowledged: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  partial: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

// Full status config for badges with icons
const statusBadgeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  },
  submitted: {
    label: 'Submitted',
    icon: Send,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  },
  evaluated: {
    label: 'Evaluated',
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

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  return `KES ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getSupplierName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusBadgeConfig[status] || statusBadgeConfig.pending;
  const Icon = config.icon;
  return (
    <Badge className={cn("flex items-center gap-1.5 px-3 py-1 font-medium rounded-full", config.bg, config.color)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

// PO Status Badge
const POStatusBadge = ({ status }: { status: string }) => {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const colorClass = poStatusColorMap[status] || poStatusColorMap.draft;

  return (
    <Badge className={cn("flex items-center gap-1.5 px-3 py-1 font-medium rounded-full", colorClass)}>
      <ShoppingBag className="h-3 w-3 mr-1" />
      {label}
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
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'evaluated', label: 'Evaluated' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by quotation number, RFQ, supplier..."
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
// QUOTATION TABLE COMPONENT
// ============================================

interface QuotationTableProps {
  data: any[];
  isLoading: boolean;
  onView: (id: number) => void;
  onGeneratePO: (id: number) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  supplierMap: Map<number, any>;
  poMap: Map<number, PurchaseOrder>;
  isPOLoading: boolean;
}

const QuotationTable = ({
  data,
  isLoading,
  onView,
  onGeneratePO,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
  supplierMap,
  poMap,
  isPOLoading,
}: QuotationTableProps) => {
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
          <FileCheck className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No Supplier Quotations</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          No supplier quotations have been received yet. Quotations will appear here once suppliers respond to RFQs.
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
              <TableHead className="min-w-[160px] py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Quotation</TableHead>
              <TableHead className="min-w-[140px] py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">RFQ</TableHead>
              <TableHead className="min-w-[180px] py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Supplier</TableHead>
              <TableHead className="py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">PO</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((quotation, index) => {
              const supplier = supplierMap.get(quotation.supplier_id) || quotation.supplier;
              const supplierName = getSupplierName(supplier);
              const rfqNumber = quotation.quotation_request?.qtn_number || 'N/A';
              const isLowest = quotation.is_lowest;
              const status = quotation.status || 'pending';
              const statusColor = statusColorMap[status] || 'gray';
              const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

              const purchaseOrder = poMap.get(quotation.id);
              const hasPO = !!purchaseOrder;
              const poStatus = purchaseOrder?.status || null;
              const poNumber = purchaseOrder?.po_number || null;

              const isAccepted = status === 'accepted';

              return (
                <TableRow
                  key={quotation.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group relative",
                    isAccepted && "border-l-4 border-l-emerald-500",
                    status === 'rejected' && "border-l-4 border-l-red-500",
                    status === 'pending' && "border-l-4 border-l-amber-500",
                    status === 'submitted' && "border-l-4 border-l-blue-500",
                    status === 'evaluated' && "border-l-4 border-l-purple-500",
                    status === 'cancelled' && "border-l-4 border-l-gray-400 opacity-60"
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
                        {quotation.quotation_number}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(quotation.submission_date)}
                      </p>
                      {isLowest && (
                        <Badge className="mt-1 text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full">
                          <Star className="h-3 w-3 mr-1" />
                          Lowest Price
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {rfqNumber}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[130px]">
                        {quotation.quotation_request?.title || 'No title'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-medium">
                          {getInitials(supplierName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate max-w-[130px]">
                          {supplierName}
                        </p>
                        {supplier?.company_email && (
                          <p className="text-xs text-muted-foreground truncate max-w-[130px]">
                            {supplier.company_email}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {formatCurrency(quotation.total_amount)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    {isPOLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto" />
                    ) : hasPO ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <POStatusBadge status={poStatus || 'draft'} />
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {poNumber}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No PO</span>
                    )}
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
                              onClick={() => onView(quotation.id)}
                              className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg">View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {isAccepted && !hasPO && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => onGeneratePO(quotation.id)}
                                className="h-7 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/20 text-[10px]"
                              >
                                <Award className="h-3 w-3 mr-1" />
                                Award
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg">Generate Purchase Order</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {hasPO && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  window.location.href = `/procurement/purchase-orders/${purchaseOrder.id}`;
                                }}
                                className="h-7 px-3 rounded-lg border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-[10px]"
                              >
                                <ShoppingBag className="h-3 w-3 mr-1" />
                                View PO
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg">View Purchase Order</TooltipContent>
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

export default function SupplierQuotationsPage() {
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

  // ============================================
  // QUERIES
  // ============================================

  const {
    data: quotationsData,
    isLoading,
    refetch,
  } = useSupplierQuotations({
    status: filters.status !== 'all' ? filters.status : undefined,
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    page: currentPage,
    per_page: ITEMS_PER_PAGE,
  });

  const { data: procurementStats, isLoading: statsLoading } = useProcurementStatistics();

  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: suppliersLoading } = useAllSuppliers();

  const {
    data: purchaseOrdersData,
    isLoading: isPOLoading,
    refetch: refetchPOs,
  } = usePurchaseOrders({
    per_page: 1000,
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

  const filteredQuotations = useMemo(() => {
    if (!filters.search) return quotations;
    const searchLower = filters.search.toLowerCase();
    return quotations.filter((q: any) => {
      const qtnNumber = q.quotation_number?.toLowerCase() || '';
      const rfqNumber = q.quotation_request?.qtn_number?.toLowerCase() || '';
      const supplierName = getSupplierName(q.supplier).toLowerCase();
      const title = q.quotation_request?.title?.toLowerCase() || '';
      return qtnNumber.includes(searchLower) ||
        rfqNumber.includes(searchLower) ||
        supplierName.includes(searchLower) ||
        title.includes(searchLower);
    });
  }, [quotations, filters.search]);

  const supplierMap = useMemo(() => {
    const map = new Map<number, any>();
    if (Array.isArray(suppliersData)) {
      suppliersData.forEach((supplier: any) => {
        map.set(supplier.id, supplier);
      });
    }
    return map;
  }, [suppliersData]);

  const poMap = useMemo(() => {
    const map = new Map<number, PurchaseOrder>();
    const poData = Array.isArray(purchaseOrdersData)
      ? purchaseOrdersData
      : (purchaseOrdersData as any)?.data || [];

    if (Array.isArray(poData)) {
      poData.forEach((po: PurchaseOrder) => {
        if (po.supplier_quotation_id) {
          map.set(po.supplier_quotation_id, po);
        }
      });
    }
    return map;
  }, [purchaseOrdersData]);

  const enhancedQuotations = useMemo(() => {
    return filteredQuotations.map((q: any) => {
      const supplier = supplierMap.get(q.supplier_id) || q.supplier;
      return {
        ...q,
        supplier: supplier || q.supplier,
        _supplierName: getSupplierName(supplier || q.supplier),
      };
    });
  }, [filteredQuotations, supplierMap]);

  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return enhancedQuotations.slice(start, end);
  }, [enhancedQuotations, currentPage]);

  const pagination = useMemo(() => {
    if (quotationsData && typeof quotationsData === 'object' && 'meta' in quotationsData) {
      return (quotationsData as any).meta;
    }
    return {
      total: enhancedQuotations.length,
      current_page: currentPage,
      last_page: Math.ceil(enhancedQuotations.length / ITEMS_PER_PAGE) || 1,
    };
  }, [quotationsData, enhancedQuotations.length, currentPage]);

  // Stats
  const totalQuotations = enhancedQuotations.length;
  const acceptedCount = enhancedQuotations.filter((q: any) => q.status === 'accepted').length;
  const rejectedCount = enhancedQuotations.filter((q: any) => q.status === 'rejected').length;
  const pendingCount = enhancedQuotations.filter((q: any) => q.status === 'pending').length;
  const submittedCount = enhancedQuotations.filter((q: any) => q.status === 'submitted').length;
  const evaluatedCount = enhancedQuotations.filter((q: any) => q.status === 'evaluated').length;
  const cancelledCount = enhancedQuotations.filter((q: any) => q.status === 'cancelled').length;

  const quotationsWithPO = useMemo(() => {
    return enhancedQuotations.filter((q: any) => poMap.has(q.id)).length;
  }, [enhancedQuotations, poMap]);

  const totalAcceptedAmount = enhancedQuotations
    .filter((q: any) => q.status === 'accepted')
    .reduce((sum: number, q: any) => sum + (parseFloat(q.total_amount) || 0), 0);

  // Check if there are accepted quotations without PO
  const acceptedWithoutPO = acceptedCount - quotationsWithPO;

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
    router.push(`/procurement/supplier-quotations/${id}`);
  }, [router]);

  const handleGeneratePO = useCallback((id: number) => {
    router.push(`/procurement/purchase-orders/create?quotation_id=${id}`);
  }, [router]);

  const handleRefresh = useCallback(() => {
    refetch();
    refetchPOs();
  }, [refetch, refetchPOs]);

  const isLoadingData = isLoading || suppliersLoading;

  // Stats cards
  const statsItems: StatCardItem[] = useMemo(() => [
    {
      label: 'Total Quotations',
      value: totalQuotations,
      icon: FileText,
      tagLabel: 'TOTAL',
      tagColor: 'blue',
      subtitle: 'All quotations received',
    },
    {
      label: 'Accepted',
      value: acceptedCount,
      icon: CheckCircle,
      tagLabel: 'ACCEPTED',
      tagColor: 'emerald',
      subtitle: `${totalQuotations > 0 ? Math.round((acceptedCount / totalQuotations) * 100) : 0}% of total`,
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: Clock,
      tagLabel: 'PENDING',
      tagColor: 'amber',
      subtitle: 'Awaiting evaluation',
    },
    {
      label: 'Awarded',
      value: quotationsWithPO,
      icon: ShoppingBag,
      tagLabel: 'AWARDED',
      tagColor: 'indigo',
      subtitle: `${quotationsWithPO} purchase orders`,
    },
    {
      label: 'Total Value',
      value: totalAcceptedAmount,
      icon: DollarSign,
      isCurrency: true,
      tagLabel: 'VALUE',
      tagColor: 'purple',
      subtitle: `${acceptedCount} accepted quotations`,
    },
  ], [totalQuotations, acceptedCount, pendingCount, quotationsWithPO, totalAcceptedAmount]);

  return (
    <PageTemplate
      title="Supplier Quotations"
      description="Manage all supplier quotations including accepted, pending, rejected, and evaluated quotations. Generate Purchase Orders for accepted quotations."
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier Quotations' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            {acceptedCount} Accepted
          </Badge>
          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 rounded-full px-3 py-1">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            {pendingCount} Pending
          </Badge>
          <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 rounded-full px-3 py-1">
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
            {quotationsWithPO} Awarded
          </Badge>
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-3 py-1">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            {formatCurrency(totalAcceptedAmount)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingData || isPOLoading}
            className="gap-2 h-9 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4", (isLoadingData || isPOLoading) && "animate-spin")} />
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
          isLoading={statsLoading}
          columns={5}
          variant="default"
          formatCompact={true}
        />

        {/* Alert: Accepted Quotations Ready for Award */}
        {acceptedWithoutPO > 0 && (
          <Alert className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <AlertTitle className="text-emerald-800 dark:text-emerald-300">
                  {acceptedWithoutPO} of {acceptedCount} accepted quotation{acceptedCount > 1 ? 's' : ''} awaiting Purchase Order
                </AlertTitle>
                <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                  Click the <strong>"Award"</strong> button on the quotation to generate a Purchase Order.
                  {quotationsWithPO > 0 && ` ${quotationsWithPO} already have Purchase Orders.`}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Alert: Pending Quotations Need Evaluation */}
        {pendingCount > 0 && (
          <Alert className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <AlertTitle className="text-amber-800 dark:text-amber-300">
                  {pendingCount} Quotation{pendingCount > 1 ? 's' : ''} Pending Evaluation
                </AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  These quotations have been submitted and are awaiting evaluation.
                  Review each quotation to determine acceptance or rejection.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Alert: Submitted Quotations */}
        {submittedCount > 0 && (
          <Alert className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <AlertTitle className="text-blue-800 dark:text-blue-300">
                  {submittedCount} Quotation{submittedCount > 1 ? 's' : ''} Submitted
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  These quotations have been submitted by suppliers and are ready for review.
                  Evaluate them to proceed with the procurement process.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Alert: Rejected Quotations */}
        {rejectedCount > 0 && (
          <Alert className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertTitle className="text-red-800 dark:text-red-300">
                  {rejectedCount} Quotation{rejectedCount > 1 ? 's' : ''} Rejected
                </AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-400">
                  These quotations have been rejected. No further action is required.
                  Review rejection reasons if needed.
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
              Showing <span className="font-medium text-gray-900 dark:text-gray-100">{paginatedQuotations.length}</span> of{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{enhancedQuotations.length}</span> quotations
            </p>
            <Badge variant="outline" className="rounded-full text-xs bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
              <ShoppingBag className="h-3 w-3 mr-1" />
              {quotationsWithPO} with Purchase Orders
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Total Accepted Value: <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAcceptedAmount)}</span>
          </p>
        </div>

        {/* Table */}
        <QuotationTable
          data={paginatedQuotations}
          isLoading={isLoadingData}
          onView={handleView}
          onGeneratePO={handleGeneratePO}
          currentPage={currentPage}
          totalItems={pagination.total || 0}
          totalPages={pagination.last_page || 0}
          onPageChange={handlePageChange}
          supplierMap={supplierMap}
          poMap={poMap}
          isPOLoading={isPOLoading}
        />
      </div>
    </PageTemplate>
  );
}
