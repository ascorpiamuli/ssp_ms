// frontend/src/app/(dashboard)/procurement/supplier/quotations/page.tsx

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
  Store,
  Timer,
  Scale,
  Shield as ShieldIcon,
  Crown,
  Package,
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

// Hooks
import { useSupplierQuotations } from '@/hooks/useSupplierQuotation';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { SupplierQuotation } from '@/types/supplierQuotation.types';

// Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

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

const formatDateTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy HH:mm');
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

const getVerificationStatusLabel = (status: string): string => {
  return VERIFICATION_STATUS_LABELS[status] || status;
};

const getVerificationStatusColor = (status: string): string => {
  return VERIFICATION_STATUS_COLORS[status] || VERIFICATION_STATUS_COLORS.pending;
};

const getValidityStatus = (quotation: any): { valid: boolean; text: string; color: string } => {
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

const VerificationStatusBadge = ({ status }: { status: string }) => {
  const colorClass = getVerificationStatusColor(status);
  return (
    <Badge variant="outline" className={cn("text-xs rounded-full", colorClass)}>
      {getVerificationStatusLabel(status)}
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
    verification_status?: string;
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

  const verificationOptions = [
    { value: 'all', label: 'All Verification' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by quotation number, RFQ..."
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
              value={filters.verification_status || 'all'}
              onValueChange={(value) => onFilterChange('verification_status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-[150px]">
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
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const QuotationTable = ({
  data,
  isLoading,
  onView,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
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
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No Quotations Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You haven't submitted any quotations yet. Quotations will appear here once you respond to RFQs.
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
              <TableHead className="py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Submitted</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Validity</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Verification</TableHead>
              <TableHead className="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((quotation, index) => {
              const rfqNumber = quotation.quotation_request?.qtn_number || 'N/A';
              const isLowest = quotation.is_lowest;
              const status = quotation.status || 'pending';
              const validity = getValidityStatus(quotation);
              const isRejected = status === 'rejected' || status === 'cancelled';
              const totalItems = quotation.items?.length || 0;

              return (
                <TableRow
                  key={quotation.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group relative",
                    status === 'accepted' && "border-l-4 border-l-emerald-500",
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
                  <TableCell className="py-3 text-right">
                    <div>
                      <p className={cn(
                        "font-bold text-sm",
                        isRejected ? "text-muted-foreground line-through" : "text-gray-900 dark:text-gray-100"
                      )}>
                        {formatCurrency(quotation.total_amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {totalItems} item{totalItems > 1 ? 's' : ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className={cn(
                      "text-sm font-medium",
                      isRejected && "line-through"
                    )}>
                      {formatDate(quotation.submission_date)}
                    </div>
                    <div className={cn(
                      "text-xs text-muted-foreground",
                      isRejected && "line-through"
                    )}>
                      {quotation.submission_date ? format(new Date(quotation.submission_date), 'HH:mm') : ''}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
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
                  <TableCell className="py-3 text-center">
                    <VerificationStatusBadge status={quotation.verification_status} />
                    {quotation.evaluation_score && !isRejected && (
                      <div className="mt-1 flex items-center justify-center gap-1">
                        <span className="text-xs font-medium">{quotation.evaluation_score}%</span>
                        <Progress value={quotation.evaluation_score} className="h-1 w-12" />
                      </div>
                    )}
                    {isRejected && (
                      <div className="mt-1 text-xs text-red-500">Not selected</div>
                    )}
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
    verification_status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  // ============================================
  // QUERIES
  // ============================================

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

    if (filters.status && filters.status !== 'all') {
      filterParams.status = filters.status;
    }

    if (filters.verification_status && filters.verification_status !== 'all') {
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

  const {
    data: quotationsData,
    isLoading,
    refetch,
    isFetching,
  } = useSupplierQuotations(queryFilters);

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
      const title = q.quotation_request?.title?.toLowerCase() || '';
      return qtnNumber.includes(searchLower) ||
        rfqNumber.includes(searchLower) ||
        title.includes(searchLower);
    });
  }, [quotations, filters.search]);

  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredQuotations.slice(start, end);
  }, [filteredQuotations, currentPage]);

  const pagination = useMemo(() => {
    if (quotationsData && typeof quotationsData === 'object' && 'meta' in quotationsData) {
      return (quotationsData as any).meta;
    }
    return {
      total: filteredQuotations.length,
      current_page: currentPage,
      last_page: Math.ceil(filteredQuotations.length / ITEMS_PER_PAGE) || 1,
    };
  }, [quotationsData, filteredQuotations.length, currentPage]);

  // Stats
  const totalQuotations = filteredQuotations.length;
  const acceptedCount = filteredQuotations.filter((q: any) => q.status === 'accepted').length;
  const rejectedCount = filteredQuotations.filter((q: any) => q.status === 'rejected').length;
  const pendingCount = filteredQuotations.filter((q: any) => q.status === 'pending').length;
  const submittedCount = filteredQuotations.filter((q: any) => q.status === 'submitted').length;
  const evaluatedCount = filteredQuotations.filter((q: any) => q.status === 'evaluated').length;
  const cancelledCount = filteredQuotations.filter((q: any) => q.status === 'cancelled').length;

  const totalAcceptedAmount = filteredQuotations
    .filter((q: any) => q.status === 'accepted')
    .reduce((sum: number, q: any) => sum + (parseFloat(q.total_amount) || 0), 0);

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
    router.push(`/procurement/supplier/quotations/${id}`);
  }, [router]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const isLoadingData = isLoading || isFetching;

  // Show loading while supplier is being fetched
  if (!hasSupplierProfile && !isLoading) {
    return (
      <PageTemplate
        title="My Quotations"
        description="View and manage all your submitted quotations"
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />}
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

  // Stats cards
  const statsItems: StatCardItem[] = useMemo(() => [
    {
      label: 'Total Quotations',
      value: totalQuotations,
      icon: FileText,
      tagLabel: 'TOTAL',
      tagColor: 'blue',
      subtitle: 'All submitted quotations',
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
      value: pendingCount + submittedCount,
      icon: Clock,
      tagLabel: 'PENDING',
      tagColor: 'amber',
      subtitle: 'Awaiting evaluation',
    },
    {
      label: 'Evaluated',
      value: evaluatedCount,
      icon: FileCheck,
      tagLabel: 'EVALUATED',
      tagColor: 'purple',
      subtitle: 'Under review',
    },
    {
      label: 'Total Value',
      value: totalAcceptedAmount,
      icon: DollarSign,
      isCurrency: true,
      tagLabel: 'VALUE',
      tagColor: 'indigo',
      subtitle: `${acceptedCount} accepted quotations`,
    },
  ], [totalQuotations, acceptedCount, pendingCount, submittedCount, evaluatedCount, totalAcceptedAmount]);

  return (
    <PageTemplate
      title="My Quotations"
      description="View and manage all your submitted quotations. Track the status of each quotation and view evaluation results."
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier', href: '/procurement/supplier' },
        { label: 'My Quotations' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            {acceptedCount} Accepted
          </Badge>
          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 rounded-full px-3 py-1">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            {pendingCount + submittedCount} Pending
          </Badge>
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-3 py-1">
            <FileCheck className="h-3.5 w-3.5 mr-1.5" />
            {evaluatedCount} Evaluated
          </Badge>
          <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 rounded-full px-3 py-1">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            {formatCurrency(totalAcceptedAmount)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingData}
            className="gap-2 h-9 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4", isLoadingData && "animate-spin")} />
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
          isLoading={isLoadingData}
          columns={5}
          variant="default"
          formatCompact={true}
        />

        {/* Alert: Accepted Quotations */}
        {acceptedCount > 0 && (
          <Alert className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <AlertTitle className="text-emerald-800 dark:text-emerald-300">
                  {acceptedCount} Quotation{acceptedCount > 1 ? 's' : ''} Accepted!
                </AlertTitle>
                <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                  Congratulations! Your quotation{acceptedCount > 1 ? 's have' : ' has'} been accepted by procurement.
                  {acceptedCount > 1 && ' Please review the accepted quotations for next steps.'}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Alert: Pending Quotations */}
        {(pendingCount > 0 || submittedCount > 0) && (
          <Alert className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <AlertTitle className="text-amber-800 dark:text-amber-300">
                  {pendingCount + submittedCount} Quotation{(pendingCount + submittedCount) > 1 ? 's' : ''} Pending Evaluation
                </AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  Your quotations are being reviewed by procurement. You'll be notified of any updates.
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
                  Some of your quotations were not selected. You can review the feedback and submit new quotations for future RFQs.
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
              <span className="font-medium text-gray-900 dark:text-gray-100">{filteredQuotations.length}</span> quotations
            </p>
            <Badge variant="outline" className="rounded-full text-xs bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
              <FileText className="h-3 w-3 mr-1" />
              {totalQuotations} Total
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
          currentPage={currentPage}
          totalItems={pagination.total || 0}
          totalPages={pagination.last_page || 0}
          onPageChange={handlePageChange}
        />
      </div>
    </PageTemplate>
  );
}
