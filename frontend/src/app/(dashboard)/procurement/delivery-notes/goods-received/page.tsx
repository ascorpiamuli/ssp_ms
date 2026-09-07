// frontend/src/app/(dashboard)/procurement/delivery-notes/goods-received/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Eye,
  Check,
  X,
  AlertCircle,
  Info,
  Package,
  Calendar,
  Building2,
  FileText,
  Download,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Send,
  Star,
  ThumbsUp,
  Scale,
  SlidersHorizontal,
  DollarSign,
  ExternalLink,
  ChevronDown,
  Hash,
  Users,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useToast } from '@/components/ui/toast-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

// Hooks
import {
  useGrns,
  usePendingGrns,
  useSubmitGrn,
  useInspectGoods,
  useDownloadGrnPdf,
  usePreviewGrnPdf,
  useTrackGrnDownload,
} from '@/hooks/useGoodsReceived';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

// Types
import type {
  GoodsReceivedNote,
  GoodsReceivedFilters,
  InspectGoodsData,
  GRNStatus,
  InspectionResult,
} from '@/types/goodsReceived.types';

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 10;

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
  return `KES ${Number(num).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getSupplierCompanyName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    hod_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    principal_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    completed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return map[status] || map.draft;
};

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    hod_approved: 'HOD Approved',
    principal_approved: 'Approved',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  return map[status] || status;
};

const getUserName = (user: any): string => {
  if (!user) return 'System';
  if (typeof user === 'string') return user;
  if (typeof user === 'number') return `User ${user}`;
  if (typeof user === 'object') {
    if (user.full_name) return user.full_name;
    if (user.first_name || user.last_name) {
      return [user.first_name, user.last_name].filter(Boolean).join(' ');
    }
    if (user.name) return user.name;
    if (user.id) return `User ${user.id}`;
  }
  return 'System';
};

// Check if GRN is fully approved (PDF download allowed)
const isFullyApproved = (status: string): boolean => {
  return status === 'hod_approved' || status === 'principal_approved' || status === 'completed';
};

// ============================================
// STATUS BADGE COMPONENT
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <Badge className={cn("px-3 py-1.5 font-medium rounded-full text-xs border", color)}>
      {label}
    </Badge>
  );
};

// ============================================
// QUALITY BADGE COMPONENT
// ============================================

const QualityBadge = ({ quality }: { quality: string | null }) => {
  if (!quality) return null;

  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    excellent: { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: <Star className="h-3 w-3" /> },
    good: { label: 'Good', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: <ThumbsUp className="h-3 w-3" /> },
    average: { label: 'Average', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: <Scale className="h-3 w-3" /> },
    poor: { label: 'Poor', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
    damaged: { label: 'Damaged', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800', icon: <AlertCircle className="h-3 w-3" /> },
  };

  const { label, color, icon } = map[quality] || map.average;

  return (
    <Badge className={cn("px-2 py-1 text-[10px] font-medium rounded-full flex items-center gap-1 border", color)}>
      {icon}
      {label}
    </Badge>
  );
};

// ============================================
// ALERT CONTAINER COMPONENT
// ============================================

interface AlertContainerProps {
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  description: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
  id: string;
}

const AlertContainer = ({ type, title, description, actions, icon, count, id }: AlertContainerProps) => {
  const configs = {
    warning: {
      bg: 'bg-amber-50/90 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/60',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-800 dark:text-amber-300',
      descColor: 'text-amber-700 dark:text-amber-400',
      defaultIcon: <AlertTriangle className="h-5 w-5" />,
    },
    info: {
      bg: 'bg-blue-50/90 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800/60',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-800 dark:text-blue-300',
      descColor: 'text-blue-700 dark:text-blue-400',
      defaultIcon: <Info className="h-5 w-5" />,
    },
    success: {
      bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      titleColor: 'text-emerald-800 dark:text-emerald-300',
      descColor: 'text-emerald-700 dark:text-emerald-400',
      defaultIcon: <CheckCircle className="h-5 w-5" />,
    },
    error: {
      bg: 'bg-rose-50/90 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800/60',
      iconBg: 'bg-rose-100 dark:bg-rose-900/40',
      iconColor: 'text-rose-600 dark:text-rose-400',
      titleColor: 'text-rose-800 dark:text-rose-300',
      descColor: 'text-rose-700 dark:text-rose-400',
      defaultIcon: <AlertCircle className="h-5 w-5" />,
    },
  };

  const config = configs[type];

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border shadow-sm p-4 md:p-5",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-2.5 rounded-xl flex-shrink-0",
          config.iconBg
        )}>
          <div className={cn("h-5 w-5", config.iconColor)}>
            {icon || config.defaultIcon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={cn("font-semibold text-sm", config.titleColor)}>
              {title}
            </h4>
            {count !== undefined && count > 0 && (
              <Badge className={cn(
                "rounded-full text-xs font-medium border-0",
                type === 'warning' && "bg-amber-200 text-amber-800 dark:bg-amber-800/60 dark:text-amber-300",
                type === 'info' && "bg-blue-200 text-blue-800 dark:bg-blue-800/60 dark:text-blue-300",
                type === 'success' && "bg-emerald-200 text-emerald-800 dark:bg-emerald-800/60 dark:text-emerald-300",
                type === 'error' && "bg-rose-200 text-rose-800 dark:bg-rose-800/60 dark:text-rose-300",
              )}>
                {count}
              </Badge>
            )}
          </div>
          <p className={cn("text-sm mt-0.5", config.descColor)}>
            {description}
          </p>
          {actions && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// FILTERS COMPONENT
// ============================================

interface FiltersProps {
  filters: {
    search?: string;
    status?: string;
    po_type?: 'all' | 'lpo' | 'lso';
    dateFrom?: string;
    dateTo?: string;
    has_quality?: 'all' | 'yes' | 'no';
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

const Filters = ({ filters, onFilterChange, onReset }: FiltersProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'hod_approved', label: 'HOD Approved' },
    { value: 'principal_approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'lpo', label: 'LPO (Goods)' },
    { value: 'lso', label: 'LSO (Services)' },
  ];

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">
      <CardContent className="p-4 pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by GRN number, PO, supplier..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[160px]">
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
              value={filters.po_type || 'all'}
              onValueChange={(value) => onFilterChange('po_type', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[150px]">
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
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="gap-1 rounded-xl shrink-0 h-11 px-4"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="gap-1 rounded-xl shrink-0 h-11 px-4"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced
                <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
              </Button>
            </div>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
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
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Has Quality Inspection</Label>
                <Select
                  value={filters.has_quality || 'all'}
                  onValueChange={(value) => onFilterChange('has_quality', value)}
                >
                  <SelectTrigger className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Inspected</SelectItem>
                    <SelectItem value="no">Not Inspected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// GRN TABLE COMPONENT - WITH DEPARTMENT COLUMN
// ============================================

interface GrnTableProps {
  data: GoodsReceivedNote[];
  isLoading: boolean;
  isHOD: boolean;
  onView: (grn: GoodsReceivedNote) => void;
  onSubmit: (grn: GoodsReceivedNote) => void;
  onInspect: (grn: GoodsReceivedNote) => void;
  onDownloadPdf: (grn: GoodsReceivedNote) => void;
  onRowClick: (grn: GoodsReceivedNote) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  suppliersMap?: Map<number, any>;
  isDownloadingPdf?: boolean;
}

const GrnTable = ({
  data,
  isLoading,
  isHOD,
  onView,
  onSubmit,
  onInspect,
  onDownloadPdf,
  onRowClick,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
  suppliersMap,
  isDownloadingPdf = false,
}: GrnTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 relative">
        <WrappedCornerTag label="Empty" color="gray" position="top-left" size="sm" />
        <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No Goods Received Notes Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          No goods received notes match your current filters or permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900 relative">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 dark:bg-gray-800/50 hover:bg-transparent border-b dark:border-gray-700">
              <TableHead className="w-[50px] py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</TableHead>
              <TableHead className="min-w-[160px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  GRN Number
                </div>
              </TableHead>
              <TableHead className="min-w-[160px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5" />
                  Reference
                </div>
              </TableHead>
              <TableHead className="min-w-[180px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  Supplier / PO
                </div>
              </TableHead>
              <TableHead className="min-w-[140px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Department
                </div>
              </TableHead>
              <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</TableHead>
              <TableHead className="py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="h-3.5 w-3.5" />
                  Amount
                </div>
              </TableHead>
              <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-2">
                  <Package className="h-3.5 w-3.5" />
                  Items
                </div>
              </TableHead>
              <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Received
                </div>
              </TableHead>
              <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((grn, index) => {
              const supplierId = grn.purchase_order?.supplier_id;
              const supplier = suppliersMap?.get(supplierId ?? 0) || grn.purchase_order?.supplier;
              const supplierCompany = getSupplierCompanyName(supplier);
              const poNumber = grn.purchase_order?.po_number || 'N/A';
              const itemsCount = grn.items?.length || 0;
              const isLpo = grn.purchase_order?.type === 'lpo';
              const receivedByName = getUserName(grn.received_by);
              const receivedDate = grn.received_date;
              const canDownloadPdf = isFullyApproved(grn.status);
              const referenceNumber = grn.reference_number || '—';

              // Use type assertion for department data from API
              const grnWithDept = grn as any;
              const department = grnWithDept.department || grnWithDept.requisition?.department || null;
              const departmentName = department?.name || 'N/A';

              const isDraft = grn.status === 'draft';
              const isClickable = !(isHOD && isDraft);

              return (
                <TableRow
                  key={grn.id}
                  className={cn(
                    "transition-colors border-b dark:border-gray-700/50 last:border-0",
                    isClickable
                      ? "hover:bg-gray-50/70 dark:hover:bg-gray-800/40 cursor-pointer group"
                      : "cursor-not-allowed opacity-60",
                    isDraft && "opacity-70"
                  )}
                  onClick={() => {
                    if (isClickable) {
                      onRowClick(grn);
                    }
                  }}
                >
                  <TableCell className="py-3.5 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {grn.grn_number}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Created: {formatDate(grn.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {referenceNumber}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/30 dark:to-teal-500/30 flex-shrink-0 border border-emerald-200/30 dark:border-emerald-800/30">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-medium">
                          {getInitials(supplierCompany)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                          {supplierCompany}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                            PO: {poNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                        {departmentName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <Badge className={cn(
                      "rounded-full text-[10px] px-2.5 py-0.5 font-medium",
                      isLpo
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    )}>
                      {isLpo ? 'LPO' : 'LSO'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(grn.total_value || 0)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {itemsCount}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {grn.items?.filter((i) => i.received_quantity > 0).length || 0} received
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(receivedDate)}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                        by {receivedByName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <StatusBadge status={grn.status} />
                      {grn.status === 'hod_approved' && grn.inspection_result === 'pending' && (
                        <Badge className="text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800 rounded-full">
                          <Scale className="h-2.5 w-2.5 mr-1" />
                          Pending Inspection
                        </Badge>
                      )}
                      {isDraft && isHOD && (
                        <Badge className="text-[9px] bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 rounded-full">
                          <Lock className="h-2.5 w-2.5 mr-1" />
                          Draft - Locked
                        </Badge>
                      )}
                      {isDraft && !isHOD && (
                        <Badge className="text-[9px] bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 rounded-full">
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          Not Submitted
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-0.5">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (isHOD && isDraft) return;
                                onView(grn);
                              }}
                              className={cn(
                                "h-8 w-8 p-0 rounded-lg",
                                isHOD && isDraft
                                  ? "text-gray-300 cursor-not-allowed dark:text-gray-600"
                                  : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-500 hover:text-emerald-600"
                              )}
                              disabled={isHOD && isDraft}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl">
                            {isHOD && isDraft ? 'Draft - Not Available' : 'View Details'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {isDraft && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSubmit(grn)}
                                className="h-8 w-8 p-0 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">Submit for Approval</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {grn.status === 'hod_approved' && grn.inspection_result === 'pending' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onInspect(grn)}
                                className="h-8 w-8 p-0 rounded-lg text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              >
                                <Scale className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">Inspect Goods</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {canDownloadPdf && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDownloadPdf(grn)}
                                className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                disabled={isDownloadingPdf}
                              >
                                {isDownloadingPdf ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">
                              {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
                            </TooltipContent>
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
        <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
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

export default function GoodsReceivedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  // Auth context for role checking
  const {
    user,
    isHOD,
    isAdmin,
    isAccountant,
    isProcurement,
    isStaff
  } = useAuthContext();

  // Get query params
  const purchaseOrderId = searchParams.get('purchase_order_id');

  // State
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    po_type?: 'all' | 'lpo' | 'lso';
    dateFrom?: string;
    dateTo?: string;
    has_quality?: 'all' | 'yes' | 'no';
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGrn, setSelectedGrn] = useState<GoodsReceivedNote | null>(null);
  const [showInspectDialog, setShowInspectDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inspection data
  const [inspectionData, setInspectionData] = useState<InspectGoodsData>({
    inspection_result: 'pending',
    inspection_notes: '',
  });

  // Hooks
  const filtersObj: GoodsReceivedFilters = {
    page: currentPage,
    status: filters.status as GRNStatus | GRNStatus[] | undefined,
    purchase_order_id: purchaseOrderId ? parseInt(purchaseOrderId) : undefined,
  };

  const {
    data: grns,
    isLoading: isLoadingGrns,
    refetch: refetchGrns,
  } = useGrns(filtersObj);

  const {
    data: pendingGrns,
    isLoading: isLoadingPending,
  } = usePendingGrns();

  const {
    data: purchaseOrders,
    isLoading: isLoadingPOs,
  } = usePurchaseOrders({});

  // Suppliers hook
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useAllSuppliers();

  // Mutations
  const submitGrn = useSubmitGrn();
  const inspectGoods = useInspectGoods();

  // ✅ REAL PDF HOOKS - Using the actual hooks from useGoodsReceived
  const {
    download: downloadGrnPdf,
    isDownloading: isDownloadingPdf,
    downloadProgress: pdfDownloadProgress,
    errorMessage: pdfErrorMessage,
  } = useDownloadGrnPdf();

  const {
    mutateAsync: trackDownload
  } = useTrackGrnDownload();

  // Build supplier map for quick lookup
  const suppliersMap = useMemo(() => {
    const map = new Map<number, any>();
    if (Array.isArray(suppliersData)) {
      suppliersData.forEach((supplier: any) => {
        if (supplier?.id) {
          map.set(supplier.id, supplier);
        }
      });
    }
    return map;
  }, [suppliersData]);

  // Extract GRN list from response
  const grnList = useMemo(() => {
    if (!grns) return [];
    if (Array.isArray(grns)) return grns as GoodsReceivedNote[];
    if (grns && typeof grns === 'object' && 'data' in grns && Array.isArray((grns as any).data)) {
      return (grns as any).data as GoodsReceivedNote[];
    }
    return [];
  }, [grns]);

  const pendingGrnList = useMemo(() => {
    if (!pendingGrns) return [];
    if (Array.isArray(pendingGrns)) return pendingGrns;
    if (pendingGrns && typeof pendingGrns === 'object' && 'data' in pendingGrns && Array.isArray((pendingGrns as any).data)) {
      return (pendingGrns as any).data;
    }
    return [];
  }, [pendingGrns]);

  const pendingCount = pendingGrnList.length;

  // ============================================
  // ROLE-BASED FILTERING
  // ============================================
  const filteredGrns = useMemo(() => {
    let result = grnList;

    // Filter by PO type
    if (filters.po_type && filters.po_type !== 'all') {
      result = result.filter((grn: any) =>
        grn.purchase_order?.type === filters.po_type
      );
    }

    // Filter by quality inspection
    if (filters.has_quality === 'yes') {
      result = result.filter((grn: any) => grn.quality);
    } else if (filters.has_quality === 'no') {
      result = result.filter((grn: any) => !grn.quality);
    }

    // ============================================
    // ROLE-BASED FILTERING
    // ============================================
    const isAdminUser = isAdmin();
    const isProcurementUser = isProcurement();
    const isAccountantUser = isAccountant();
    const isHODUser = isHOD();

    // Admin, Procurement, Accountant can see all GRNs
    if (isAdminUser || isProcurementUser || isAccountantUser) {
      return result;
    }

    // HOD should only see GRNs for their department
    if (isHODUser) {
      let hodDepartmentId = user?.department_id;

      // If user has no department_id, find it from GRN data
      if (!hodDepartmentId) {
        const foundDept = result.find((grn: any) => {
          const g = grn as any;
          return g.department?.hod_id === user?.id || g.requisition?.department?.hod_id === user?.id;
        });
        if (foundDept) {
          const g = foundDept as any;
          hodDepartmentId = g.department?.id || g.requisition?.department?.id;
        }
      }

      if (!hodDepartmentId) {
        return [];
      }

      // Show ALL GRNs for their department (draft, submitted, approved, etc.)
      result = result.filter((grn: any) => {
        const g = grn as any;
        const grnDepartmentId = g.department?.id || g.requisition?.department?.id || g.requisition?.department_id;
        return grnDepartmentId === hodDepartmentId;
      });

      return result;
    }

    // Staff and other roles - only show submitted and approved GRNs (not drafts)
    result = result.filter((grn: any) => grn.status !== 'draft');

    return result;
  }, [grnList, filters.po_type, filters.has_quality, isAdmin, isProcurement, isAccountant, isHOD, user]);

  // ============================================
  // STATS CARDS - FIXED to calculate from GRNs only
  // ============================================
  const statsItems: StatCardItem[] = useMemo(() => {
    const visibleGrns = filteredGrns;

    const grnDraft = visibleGrns.filter((g: any) => g.status === 'draft').length;
    const grnSubmitted = visibleGrns.filter((g: any) => g.status === 'submitted').length;
    const grnHodApproved = visibleGrns.filter((g: any) => g.status === 'hod_approved').length;
    const grnPrincipalApproved = visibleGrns.filter((g: any) => g.status === 'principal_approved').length;
    const grnApproved = grnHodApproved + grnPrincipalApproved;
    const grnCompleted = visibleGrns.filter((g: any) => g.status === 'completed').length;
    const grnRejected = visibleGrns.filter((g: any) => g.status === 'rejected').length;
    const grnInspected = visibleGrns.filter((g: any) => g.inspection_result && g.inspection_result !== 'pending').length;

    // Calculate total value from GRNs only
    const totalValue = visibleGrns.reduce((sum: number, g: any) => sum + (parseFloat(g.total_value) || 0), 0);

    // Count total items received across all GRNs
    const totalItemsReceived = visibleGrns.reduce((sum: number, g: any) => {
      return sum + (g.items?.reduce((itemSum: number, item: any) =>
        itemSum + (parseFloat(item.received_quantity) || 0), 0) || 0);
    }, 0);

    return [
      {
        label: "Total GRNs",
        value: visibleGrns.length,
        icon: Package,
        tagLabel: "GRNS",
        tagColor: "blue",
        subtitle: `${visibleGrns.length} goods received notes`,
      },
      {
        label: "Total Value",
        value: totalValue,
        icon: DollarSign,
        tagLabel: "VALUE",
        tagColor: "emerald",
        subtitle: formatCurrency(totalValue),
      },
      {
        label: "Items Received",
        value: totalItemsReceived,
        icon: Package,
        tagLabel: "ITEMS",
        tagColor: "teal",
        subtitle: `Across ${visibleGrns.length} GRNs`,
      },
      {
        label: "Pending Approval",
        value: grnSubmitted,
        icon: Clock,
        tagLabel: "PENDING",
        tagColor: "amber",
        subtitle: "Awaiting approval",
      },
      {
        label: "Approved GRNs",
        value: grnApproved,
        icon: CheckCircle,
        tagLabel: "APPROVED",
        tagColor: "emerald",
        subtitle: "Goods received approved",
      },
      {
        label: "Inspected",
        value: grnInspected,
        icon: Scale,
        tagLabel: "QUALITY",
        tagColor: "purple",
        subtitle: "Quality checked",
      },
      {
        label: "Draft GRNs",
        value: grnDraft,
        icon: FileText,
        tagLabel: "DRAFT",
        tagColor: "gray",
        subtitle: "Not submitted yet",
      },
      {
        label: "Completed",
        value: grnCompleted,
        icon: CheckCircle,
        tagLabel: "DONE",
        tagColor: "teal",
        subtitle: "Fully processed",
      },
    ];
  }, [filteredGrns]);

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

  const handleRefresh = useCallback(() => {
    refetchGrns();
    success('GRN list refreshed');
  }, [refetchGrns, success]);

  const handleCreateGrn = () => {
    const poId = purchaseOrderId ? `?purchase_order_id=${purchaseOrderId}` : '';
    router.push(`/procurement/delivery-notes/goods-received/create${poId}`);
  };

  const handleViewGrn = (grn: GoodsReceivedNote) => {
    router.push(`/procurement/delivery-notes/goods-received/${grn.id}`);
  };

  const handleSubmitGrn = (grn: GoodsReceivedNote) => {
    setSelectedGrn(grn);
    setShowSubmitDialog(true);
  };

  const handleInspectGrn = (grn: GoodsReceivedNote) => {
    setSelectedGrn(grn);
    setInspectionData({
      inspection_result: 'pending',
      inspection_notes: '',
    });
    setShowInspectDialog(true);
  };

  // ✅ UPDATED: Using the real PDF download hook
  const handleDownloadPdf = useCallback((grn: GoodsReceivedNote) => {
    downloadGrnPdf(grn.id);
  }, [downloadGrnPdf]);


  const handleRowClick = (grn: GoodsReceivedNote) => {
    if (isHOD() && grn.status === 'draft') return;
    handleViewGrn(grn);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedGrn) return;
    setIsSubmitting(true);
    try {
      await submitGrn.mutateAsync(selectedGrn.id);
      setShowSubmitDialog(false);
      refetchGrns();
      success(`GRN submitted for approval successfully`);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to submit GRN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmInspect = async () => {
    if (!selectedGrn) return;
    setIsSubmitting(true);
    try {
      await inspectGoods.mutateAsync({
        id: selectedGrn.id,
        data: inspectionData,
      });
      setShowInspectDialog(false);
      refetchGrns();
      success(`Goods inspected successfully`);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to inspect goods');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingData = isLoadingGrns || isLoadingPending || isLoadingPOs || isLoadingSuppliers;

  const totalGrns = filteredGrns.length || 0;
  const totalPages = Math.ceil(totalGrns / ITEMS_PER_PAGE) || 1;

  const canCreateGrn = isAdmin() || isProcurement() || isAccountant();

  return (
    <PageTemplate
      title="Goods Received Notes"
      description="Manage goods received notes for purchase orders. Track deliveries, quality inspection, and approval workflow."
      icon={<Package className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
        { label: 'Goods Received Notes' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {pendingCount} Pending
            </Badge>
          )}
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            {totalGrns} GRNs
          </Badge>
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 rounded-full px-4 py-1.5">
            <Scale className="h-3.5 w-3.5 mr-1.5" />
            {filteredGrns.filter((g: any) => g.inspection_result && g.inspection_result !== 'pending').length} Inspected
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingData}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4", isLoadingData && "animate-spin")} />
            Refresh
          </Button>
          {canCreateGrn && (
            <Button
              onClick={handleCreateGrn}
              className="gap-2 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 text-white"
            >
              <Plus className="h-4 w-4" />
              New GRN
            </Button>
          )}
        </div>
      }
    >
      {/* Stats Cards */}
      <StatsCards
        stats={statsItems}
        isLoading={isLoadingData}
        columns={8}
        variant="default"
        tagOrientation='none'
        formatCompact={true}
      />

      {/* ============================================ */}
      {/* FILTERS */}
      {/* ============================================ */}
      <div className="mt-6 mb-6">
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-gray-900 dark:text-gray-100">{filteredGrns.length}</span> of{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">{grnList.length}</span> goods received notes
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {filteredGrns.filter((g: any) => g.status === 'submitted').length} Pending
            </span>
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {filteredGrns.filter((g: any) => g.status === 'hod_approved' || g.status === 'principal_approved').length} Approved
            </span>
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {filteredGrns.filter((g: any) => g.inspection_result && g.inspection_result !== 'pending').length} Inspected
            </span>
          </span>
        </div>
      </div>

      {/* ============================================ */}
      {/* GRN TABLE */}
      {/* ============================================ */}
      <GrnTable
        data={filteredGrns as GoodsReceivedNote[]}
        isLoading={isLoadingData}
        isHOD={isHOD()}
        onView={handleViewGrn}
        onSubmit={handleSubmitGrn}
        onInspect={handleInspectGrn}
        onDownloadPdf={handleDownloadPdf}
        onRowClick={handleRowClick}
        currentPage={currentPage}
        totalItems={totalGrns}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        suppliersMap={suppliersMap}
        isDownloadingPdf={isDownloadingPdf}
      />

      {/* ============================================ */}
      {/* SUBMIT GRN DIALOG */}
      {/* ============================================ */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-gray-700/50 shadow-2xl p-0 overflow-hidden">
          <div className="p-6 border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-100/50 dark:bg-amber-900/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                <Send className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Submit GRN for Approval
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedGrn?.grn_number || `GRN-${String(selectedGrn?.id || '').padStart(4, '0')}`} will be sent for approval
                </AlertDialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="p-4 rounded-xl bg-amber-50/30 dark:bg-amber-950/20 border border-amber-200/30 dark:border-amber-800/30">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <p className="font-semibold">Ready for approval</p>
                  <p className="text-xs mt-0.5">
                    This GRN will be reviewed by the Head of Department or Principal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10 dark:border-gray-700/30 bg-muted/10 dark:bg-gray-800/10 backdrop-blur-sm flex justify-end gap-3">
            <AlertDialogCancel className="rounded-xl px-6 border-white/20 dark:border-gray-700/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 rounded-xl px-6 shadow-lg shadow-amber-600/20 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </>
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================ */}
      {/* INSPECT GOODS DIALOG */}
      {/* ============================================ */}
      <Dialog open={showInspectDialog} onOpenChange={setShowInspectDialog}>
        <DialogContent className="max-w-lg rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-gray-700/50 shadow-2xl p-0 overflow-hidden">
          <div className="p-6 border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-100/50 dark:bg-purple-900/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Inspect Goods
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedGrn?.grn_number || `GRN-${String(selectedGrn?.id || '').padStart(4, '0')}`} - Quality inspection
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Inspection Result <span className="text-red-500">*</span></Label>
              <Select
                value={inspectionData.inspection_result || 'pending'}
                onValueChange={(value) => setInspectionData({
                  ...inspectionData,
                  inspection_result: value as InspectionResult
                })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspection-notes">Inspection Notes</Label>
              <Textarea
                id="inspection-notes"
                placeholder="Describe the condition of the goods..."
                value={inspectionData.inspection_notes || ''}
                onChange={(e) => setInspectionData({
                  ...inspectionData,
                  inspection_notes: e.target.value
                })}
                rows={3}
                className="rounded-xl resize-none border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="p-6 border-t border-white/10 dark:border-gray-700/30 bg-muted/10 dark:bg-gray-800/10 backdrop-blur-sm flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowInspectDialog(false)}
              className="rounded-xl px-6 border-white/20 dark:border-gray-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmInspect}
              disabled={isSubmitting}
              className="rounded-xl px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-600/20 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Inspecting...
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4 mr-2" />
                  Complete Inspection
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
