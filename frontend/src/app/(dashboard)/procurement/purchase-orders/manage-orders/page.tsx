// frontend/src/app/(dashboard)/procurement/purchase-orders/manage-orders/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  Building2,
  Loader2,
  Send,
  Truck,
  Calendar,
  DollarSign,
  Package,
  Activity,
  Mail,
  Ban,
  Download,
  MoreVertical,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Info,
  TrendingUp,
  Award,
  Shield,
  Briefcase,
  BarChart3,
  PieChart,
  LineChart,
  Gauge,
  Target,
  Rocket,
  Gem,
  Crown as CrownIcon,
  Timer,
  PlayCircle,
  StopCircle,
  Grid3x3,
  ListChecks,
  ClipboardCheck,
  FileCheck2,
  ClipboardList,
  Layers,
  BarChart2,
  PieChart as PieChartIcon,
  Printer,
  RotateCcw,
  User,
  CreditCard,
  Crown,
  Flame,
  Leaf,
  MinusCircle,
  CircleDashed,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  MessageSquare,
  Box,
  Shield as ShieldIcon,
  Briefcase as BriefcaseIcon,
  CreditCard as CreditCardIcon,
  Wallet,
  Receipt as ReceiptIcon,
  PenTool,
  Star,
  Zap,
  ArrowRight,
  FileCheck,
  Stamp,
  UserCheck,
  Check,
  ChevronRight as ChevronRightIcon,
  Circle as CircleIcon,
  AlertTriangle,
  Bell,
  BellRing,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
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
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast-context';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import {
  usePurchaseOrders,
  useCancelPurchaseOrder,
  useGetPurchaseOrderPdf,
} from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder.types';
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

// ============================================
// HELPERS
// ============================================

const ITEMS_PER_PAGE = 10;

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

const getUserName = (user: any): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'string') return user;
  if (user.full_name) return user.full_name;
  if (user.first_name || user.last_name) {
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown';
  }
  return 'Unknown';
};

const getSupplierName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

const getSupplierEmail = (supplier: any): string | null => {
  if (!supplier) return null;
  if (typeof supplier === 'string') return null;
  if (supplier.company_email) return supplier.company_email;
  if (supplier.email) return supplier.email;
  return null;
};

// ============================================
// STATUS CONFIGURATION
// ============================================

const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  issued: 'Issued',
  sent: 'Sent',
  acknowledged: 'Acknowledged',
  delivered: 'Delivered',
  partial: 'Partial',
  completed: 'Completed',
  cancelled: 'Cancelled',
  closed: 'Closed',
};

const PO_STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  issued: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  sent: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  acknowledged: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  completed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

const PO_STATUS_ICONS: Record<PurchaseOrderStatus, any> = {
  draft: FileText,
  issued: Send,
  sent: Mail,
  acknowledged: CheckCircle,
  delivered: Truck,
  partial: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
  closed: FileCheck,
};

const statusColorMap: Record<string, 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'teal' | 'indigo' | 'gray' | 'slate'> = {
  draft: 'gray',
  issued: 'indigo',
  sent: 'indigo',
  acknowledged: 'purple',
  delivered: 'emerald',
  partial: 'amber',
  completed: 'teal',
  cancelled: 'red',
  closed: 'slate',
};

// Helper to safely get status label
const getStatusLabel = (status: string): string => {
  return PO_STATUS_LABELS[status as PurchaseOrderStatus] || status;
};

// Helper to safely get status color
const getStatusColor = (status: string): string => {
  return PO_STATUS_COLORS[status as PurchaseOrderStatus] || PO_STATUS_COLORS.draft;
};

// Helper to safely get status icon
const getStatusIcon = (status: string): any => {
  return PO_STATUS_ICONS[status as PurchaseOrderStatus] || FileText;
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
// WORKFLOW STEP COMPONENT
// ============================================

interface WorkflowStepProps {
  label: string;
  status: 'completed' | 'pending' | 'current';
  icon: React.ReactNode;
  by?: string | null;
  date?: string | null;
}

// ============================================
// FILTERS COMPONENT
// ============================================

interface FiltersProps {
  filters: {
    search?: string;
    status?: PurchaseOrderStatus | 'all';
    type?: 'all' | 'lpo' | 'lso';
    workflow?: 'all' | 'draft' | 'checked' | 'endorsed' | 'approved';
    dateFrom?: string;
    dateTo?: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

const Filters = ({ filters, onFilterChange, onReset }: FiltersProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'issued', label: 'Issued' },
    { value: 'sent', label: 'Sent' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'partial', label: 'Partial' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'closed', label: 'Closed' },
  ];

  const workflowOptions = [
    { value: 'all', label: 'All Stages' },
    { value: 'draft', label: 'Draft (Not Checked)' },
    { value: 'checked', label: 'Checked (Pending Endorsement)' },
    { value: 'endorsed', label: 'Endorsed (Pending Approval)' },
    { value: 'approved', label: 'Approved' },
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
                placeholder="Search by PO number, supplier, requisition..."
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
              value={filters.type || 'all'}
              onValueChange={(value) => onFilterChange('type', value === 'all' ? undefined : value)}
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
                <Label className="text-xs text-muted-foreground">Workflow Stage</Label>
                <Select
                  value={filters.workflow || 'all'}
                  onValueChange={(value) => onFilterChange('workflow', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    {workflowOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// PO TABLE COMPONENT
// ============================================

interface POTableProps {
  data: PurchaseOrder[];
  isLoading: boolean;
  onView: (id: number) => void;
  onCancel: (id: number) => void;
  onRowClick: (id: number) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  supplierMap: Map<number, any>;
}

const POTable = ({
  data,
  isLoading,
  onView,
  onCancel,
  onRowClick,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
  supplierMap,
}: POTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 relative">
        <WrappedCornerTag label="Empty" color="gray" position="top-left" size="sm" />
        <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No Purchase Orders Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          No purchase orders have been created yet. Generate one from an approved quotation.
        </p>
        <Button
          className="mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20"
          onClick={() => window.location.href = '/procurement/approved-quotations'}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm relative">
      <div className="pt-2">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
                <TableHead className="w-[60px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">#</TableHead>
                <TableHead className="min-w-[140px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    PO Number
                  </div>
                </TableHead>
                <TableHead className="min-w-[180px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" />
                    Supplier
                  </div>
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Type</TableHead>
                <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="h-3.5 w-3.5" />
                    Amount
                  </div>
                </TableHead>
                <TableHead className="min-w-[180px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5" />
                    Workflow Progress
                  </div>
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Truck className="h-3.5 w-3.5" />
                    Delivery
                  </div>
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Created
                  </div>
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((po: any, index) => {
                const supplier = supplierMap.get(po.supplier_id) || po.supplier;
                const supplierName = getSupplierName(supplier);
                const isOverdue = po.is_overdue;
                const itemsCount = po.items?.length || 0;
                const progress = po.delivery_progress || 0;
                const statusColor = statusColorMap[po.status] || 'gray';
                const statusLabel = getStatusLabel(po.status);

                // Determine workflow stage
                const isChecked = !!po.checked_by;
                const isEndorsed = !!po.endorsed_by;
                const isApproved = !!po.approved_by;

                let workflowStage = 'Draft';
                let workflowColor = 'gray';
                if (isApproved) { workflowStage = 'Approved'; workflowColor = 'emerald'; }
                else if (isEndorsed) { workflowStage = 'Endorsed'; workflowColor = 'blue'; }
                else if (isChecked) { workflowStage = 'Checked'; workflowColor = 'amber'; }

                const canCancel = po.status !== 'completed' && po.status !== 'cancelled' && po.status !== 'closed';

                return (
                  <TableRow
                    key={po.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group relative"
                    onClick={() => onRowClick(po.id)}
                  >
                    <TableCell className="py-4 relative text-center">
                      <div className="relative inline-flex items-center justify-center">
                        <div className="absolute -top-3 -left-3 z-20">
                          <WrappedCornerTag
                            label={statusLabel}
                            color={statusColor}
                            position="top-left"
                            size="sm"
                            width="w-[70px]"
                            height="h-[14px]"
                            fontSize="text-[7px]"
                            tracking="tracking-[0.06em]"
                            offsetX="8px"
                            offsetY="18px"
                            animated={true}
                          />
                        </div>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors text-gray-700 dark:text-gray-300">
                          {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {po.po_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(po.issue_date)}
                        </p>
                        {isOverdue && (
                          <Badge className="mt-1 text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium">
                            {getInitials(supplierName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                            {supplierName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {po.requisition?.reference_number || 'No requisition'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Badge className={cn(
                        "rounded-full",
                        po.type === 'lpo'
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      )}>
                        {po.type === 'lpo' ? 'LPO' : 'LSO'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(po.total_amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {po.currency || 'KES'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-[10px] rounded-full border-0",
                            isApproved ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                              isEndorsed ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                isChecked ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                                  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          )}>
                            {workflowStage}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {isChecked ? '✓ Checked' : '⬜ Not Checked'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isChecked ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                            )} />
                            <span className="text-[8px] text-muted-foreground">Check</span>
                          </div>
                          <div className={cn(
                            "w-3 h-0.5",
                            isChecked ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                          )} />
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isEndorsed ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                            )} />
                            <span className="text-[8px] text-muted-foreground">Endorse</span>
                          </div>
                          <div className={cn(
                            "w-3 h-0.5",
                            isEndorsed ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                          )} />
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isApproved ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                            )} />
                            <span className="text-[8px] text-muted-foreground">Approve</span>
                          </div>
                        </div>
                        {isChecked && !isApproved && (
                          <p className="text-[8px] text-muted-foreground truncate">
                            {isChecked && !isEndorsed ? '⏳ Pending Endorsement' :
                              isEndorsed && !isApproved ? '⏳ Pending Approval' :
                                isApproved ? '✅ Completed' : ''}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12">
                            <Progress
                              value={progress}
                              className="h-1.5"
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[30px]">
                            {progress}%
                          </span>
                        </div>
                        <p className="text-[8px] text-muted-foreground">
                          {po.items?.filter((i: any) => i.fully_received).length || 0}/{itemsCount} received
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(po.created_at)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          by #{po.generated_by}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(po.id)}
                                className="h-9 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                              >
                                <Eye className="h-4 w-4 mr-1.5" />
                                View
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">View Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {canCancel && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onCancel(po.id)}
                                  className="h-9 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                                >
                                  <Ban className="h-4 w-4 mr-1.5" />
                                  Cancel
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-xl">Cancel Order</TooltipContent>
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

export default function ManagePurchaseOrdersPage() {
  const router = useRouter();
  const { success, error } = useToast();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    search?: string;
    status?: PurchaseOrderStatus | 'all';
    type?: 'all' | 'lpo' | 'lso';
    workflow?: 'all' | 'draft' | 'checked' | 'endorsed' | 'approved';
    dateFrom?: string;
    dateTo?: string;
  }>({});
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Hooks
  const {
    data: purchaseOrdersData,
    isLoading,
    refetch,
  } = usePurchaseOrders({
    status: filters.status && filters.status !== 'all' ? filters.status : undefined,
    type: filters.type && filters.type !== 'all' ? filters.type : undefined,
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    page: currentPage,
    per_page: ITEMS_PER_PAGE,
  });

  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useAllSuppliers();

  // Mutations
  const cancelMutation = useCancelPurchaseOrder();

  // ============================================
  // PROCESS DATA
  // ============================================

  const purchaseOrders = useMemo(() => {
    if (Array.isArray(purchaseOrdersData)) {
      return purchaseOrdersData;
    }
    if (purchaseOrdersData && typeof purchaseOrdersData === 'object' && 'data' in purchaseOrdersData) {
      return (purchaseOrdersData as any).data || [];
    }
    return [];
  }, [purchaseOrdersData]);

  const pagination = useMemo(() => {
    if (purchaseOrdersData && typeof purchaseOrdersData === 'object' && 'meta' in purchaseOrdersData) {
      return (purchaseOrdersData as any).meta;
    }
    return {
      total: purchaseOrders.length,
      current_page: currentPage,
      last_page: Math.ceil(purchaseOrders.length / ITEMS_PER_PAGE) || 1
    };
  }, [purchaseOrdersData, purchaseOrders.length, currentPage]);

  // Build supplier map
  const supplierMap = useMemo(() => {
    const map = new Map<number, any>();
    if (Array.isArray(suppliersData)) {
      suppliersData.forEach((supplier: any) => {
        map.set(supplier.id, supplier);
      });
    }
    return map;
  }, [suppliersData]);

  // Filter by workflow stage
  const filteredOrders = useMemo(() => {
    let orders = purchaseOrders;

    // Workflow filter
    if (filters.workflow && filters.workflow !== 'all') {
      orders = orders.filter((p: any) => {
        const isChecked = !!p.checked_by;
        const isEndorsed = !!p.endorsed_by;
        const isApproved = !!p.approved_by;

        switch (filters.workflow) {
          case 'draft':
            return !isChecked && !isEndorsed && !isApproved;
          case 'checked':
            return isChecked && !isEndorsed && !isApproved;
          case 'endorsed':
            return isChecked && isEndorsed && !isApproved;
          case 'approved':
            return isChecked && isEndorsed && isApproved;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      orders = orders.filter((p: any) => {
        const poNumber = p.po_number?.toLowerCase() || '';
        const supplierName = getSupplierName(p.supplier).toLowerCase();
        const requisitionRef = p.requisition?.reference_number?.toLowerCase() || '';
        return poNumber.includes(searchLower) ||
          supplierName.includes(searchLower) ||
          requisitionRef.includes(searchLower);
      });
    }

    return orders;
  }, [purchaseOrders, filters]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage]);

  const totalOrders = filteredOrders.length;

  // ============================================
  // STATS CALCULATION
  // ============================================

  const statsItems: StatCardItem[] = useMemo(() => {
    const all = purchaseOrders;

    const totalValue = all.reduce((sum: number, p: any) => sum + (parseFloat(p.total_amount) || 0), 0);

    // Workflow stats using frontend logic
    const draft = all.filter((p: any) => {
      const isChecked = !!p.checked_by;
      return p.status === 'draft' && !isChecked;
    }).length;

    const checked = all.filter((p: any) => {
      const isChecked = !!p.checked_by;
      const isEndorsed = !!p.endorsed_by;
      return p.status === 'draft' && isChecked && !isEndorsed;
    }).length;

    const endorsed = all.filter((p: any) => {
      const isChecked = !!p.checked_by;
      const isEndorsed = !!p.endorsed_by;
      const isApproved = !!p.approved_by;
      return p.status === 'draft' && isChecked && isEndorsed && !isApproved;
    }).length;

    const approved = all.filter((p: any) => {
      const isChecked = !!p.checked_by;
      const isEndorsed = !!p.endorsed_by;
      const isApproved = !!p.approved_by;
      return p.status === 'draft' && isChecked && isEndorsed && isApproved;
    }).length;

    const inProgress = all.filter((p: any) =>
      p.status === 'issued' || p.status === 'sent' ||
      p.status === 'acknowledged' || p.status === 'delivered' ||
      p.status === 'partial'
    ).length;

    const completed = all.filter((p: any) => p.status === 'completed').length;
    const cancelled = all.filter((p: any) => p.status === 'cancelled').length;

    return [
      {
        label: "Total Orders",
        value: all.length,
        icon: Package,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: "All purchase orders",
      },
      {
        label: "Total Value",
        value: totalValue,
        icon: DollarSign,
        tagLabel: "VALUE",
        tagColor: "emerald",
        subtitle: "Total amount",
      },
      {
        label: "Draft",
        value: draft,
        icon: FileText,
        tagLabel: "DRAFT",
        tagColor: "gray",
        subtitle: "Not checked yet",
      },
      {
        label: "Checked",
        value: checked,
        icon: UserCheck,
        tagLabel: "CHECKED",
        tagColor: "amber",
        subtitle: "Pending endorsement",
      },
      {
        label: "Endorsed",
        value: endorsed,
        icon: Stamp,
        tagLabel: "ENDORSED",
        tagColor: "blue",
        subtitle: "Pending approval",
      },
      {
        label: "Approved",
        value: approved,
        icon: Shield,
        tagLabel: "APPROVED",
        tagColor: "emerald",
        subtitle: "Ready for issue",
      },
      {
        label: "In Progress",
        value: inProgress,
        icon: Truck,
        tagLabel: "ACTIVE",
        tagColor: "amber",
        subtitle: "Active orders",
      },
      {
        label: "Completed",
        value: completed,
        icon: CheckCircle,
        tagLabel: "DONE",
        tagColor: "emerald",
        subtitle: "Completed orders",
      },
    ];
  }, [purchaseOrders]);

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
    refetch();
  }, [refetch]);

  const handleRowClick = useCallback((id: number) => {
    router.push(`/procurement/purchase-orders/${id}`);
  }, [router]);

  const handleView = useCallback((id: number) => {
    router.push(`/procurement/purchase-orders/${id}`);
  }, [router]);

  const handleCancel = useCallback((id: number) => {
    const po = purchaseOrders.find((p: any) => p.id === id);
    if (po) {
      setSelectedPO(po);
      setCancelReason('');
      setShowCancelDialog(true);
    }
  }, [purchaseOrders]);

  const handleConfirmCancel = () => {
    if (selectedPO && cancelReason.trim()) {
      cancelMutation.mutate({
        id: selectedPO.id,
        reason: cancelReason,
      }, {
        onSuccess: () => {
          success(`Purchase Order ${selectedPO.po_number} cancelled`);
          setShowCancelDialog(false);
          setSelectedPO(null);
          refetch();
        }
      });
    }
  };

  const handleCreateNew = () => {
    router.push('/procurement/approved-quotations');
  };

  const isLoadingData = isLoading || isLoadingSuppliers;

  const overdueOrders = purchaseOrders.filter((po: any) => po.is_overdue && po.status !== 'completed' && po.status !== 'cancelled' && po.status !== 'closed');

  const getSelectedPOSupplierName = useCallback(() => {
    if (!selectedPO) return 'Unknown Supplier';
    const supplier = supplierMap.get(selectedPO.supplier_id) || selectedPO.supplier;
    return getSupplierName(supplier);
  }, [selectedPO, supplierMap]);

  // Calculate workflow counts for alerts
  const pendingCheckCount = purchaseOrders.filter((p: any) => {
    const isChecked = !!p.checked_by;
    return p.status === 'draft' && !isChecked;
  }).length;

  const pendingEndorsementCount = purchaseOrders.filter((p: any) => {
    const isChecked = !!p.checked_by;
    const isEndorsed = !!p.endorsed_by;
    return p.status === 'draft' && isChecked && !isEndorsed;
  }).length;

  const pendingApprovalCount = purchaseOrders.filter((p: any) => {
    const isChecked = !!p.checked_by;
    const isEndorsed = !!p.endorsed_by;
    const isApproved = !!p.approved_by;
    return p.status === 'draft' && isChecked && isEndorsed && !isApproved;
  }).length;

  const approvedCount = purchaseOrders.filter((p: any) => {
    const isChecked = !!p.checked_by;
    const isEndorsed = !!p.endorsed_by;
    const isApproved = !!p.approved_by;
    return p.status === 'draft' && isChecked && isEndorsed && isApproved;
  }).length;

  const totalValue = purchaseOrders.reduce((sum: number, p: any) => sum + (parseFloat(p.total_amount) || 0), 0);

  return (
    <PageTemplate
      title="Purchase Orders Management"
      description="Manage all purchase orders, track workflow progress, and monitor delivery status."
      icon={<Package className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Orders' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            {purchaseOrders.length} Total
          </Badge>
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            {formatCurrency(totalValue)}
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
          <Button
            className="h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 text-white"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      }
    >
      <StatsCards
        stats={statsItems}
        isLoading={isLoadingData}
        columns={8}
        variant="default"
        tagOrientation='none'
        formatCompact={true}
      />
      {/* ============================================ */}
      {/* ALERTS SECTION - SIMPLIFIED */}
      {/* ============================================ */}

      <AnimatePresence mode="wait">
        <div className="space-y-3 mb-6 mt-4">
          {/* ✅ Primary Alert: Show the most critical workflow issue */}
          {pendingEndorsementCount > 0 && (
            <AlertContainer
              key="alert-pending-endorsement"
              id="alert-pending-endorsement"
              type="warning"
              title={`${pendingEndorsementCount} Order${pendingEndorsementCount > 1 ? 's' : ''} Pending Endorsement`}
              description={`${pendingEndorsementCount} purchase order${pendingEndorsementCount > 1 ? 's' : ''} ${pendingEndorsementCount > 1 ? 'are' : 'is'} checked and awaiting your financial endorsement.`}
              count={pendingEndorsementCount}
              icon={<Stamp className="h-5 w-5" />}
              actions={
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 px-4 text-xs"
                  onClick={() => handleFilterChange('workflow', 'checked')}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Review Now
                </Button>
              }
            />
          )}

          {/* ✅ Secondary Alert: Pending Approval (if no endorsement pending) */}
          {pendingEndorsementCount === 0 && pendingApprovalCount > 0 && (
            <AlertContainer
              key="alert-pending-approval"
              id="alert-pending-approval"
              type="info"
              title={`${pendingApprovalCount} Order${pendingApprovalCount > 1 ? 's' : ''} Pending Approval`}
              description={`${pendingApprovalCount} purchase order${pendingApprovalCount > 1 ? 's' : ''} ${pendingApprovalCount > 1 ? 'are' : 'is'} endorsed and awaiting Director approval.`}
              count={pendingApprovalCount}
              icon={<Shield className="h-5 w-5" />}
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg h-8 px-4 text-xs border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                  onClick={() => handleFilterChange('workflow', 'endorsed')}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Orders
                </Button>
              }
            />
          )}

          {/* ✅ Success Alert: All caught up */}
          {pendingEndorsementCount === 0 && pendingApprovalCount === 0 && purchaseOrders.length > 0 && (
            <AlertContainer
              key="alert-all-caught-up"
              id="alert-all-caught-up"
              type="success"
              title="All Orders Processed"
              description={`All ${purchaseOrders.length} purchase orders have been reviewed. ${approvedCount} approved and ready for issuance.`}
              icon={<CheckCircle className="h-5 w-5" />}
              actions={
                approvedCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg h-8 px-4 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                    onClick={() => handleFilterChange('workflow', 'approved')}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View Approved
                  </Button>
                )
              }
            />
          )}
        </div>
      </AnimatePresence>

      {/* Overdue Card (legacy - kept for backwards compatibility) */}
      {overdueOrders.length > 0 && (
        <Card className="mb-6 border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 rounded-xl shadow-sm relative">
          <WrappedCornerTag label="Overdue" color="red" position="top-left" size="sm" />
          <CardContent className="p-4 pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/40 rounded-xl flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-300">
                  {overdueOrders.length} Order{overdueOrders.length > 1 ? 's' : ''} Overdue
                </p>
                <p className="text-sm text-red-600 dark:text-red-400/80">
                  These orders have passed their expected delivery date. Please follow up with suppliers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 mb-6">
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-gray-900 dark:text-gray-100">{paginatedOrders.length}</span> of{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">{totalOrders}</span> purchase orders
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Workflow: <span className="font-medium text-gray-900 dark:text-gray-100">
              {purchaseOrders.filter((p: any) => !!p.checked_by && !p.endorsed_by && !p.approved_by).length} Checked
            </span>
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {purchaseOrders.filter((p: any) => !!p.checked_by && !!p.endorsed_by && !p.approved_by).length} Endorsed
            </span>
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {purchaseOrders.filter((p: any) => !!p.checked_by && !!p.endorsed_by && !!p.approved_by).length} Approved
            </span>
          </span>
        </div>
      </div>

      <POTable
        data={paginatedOrders}
        isLoading={isLoadingData}
        onView={handleView}
        onCancel={handleCancel}
        onRowClick={handleRowClick}
        currentPage={currentPage}
        totalItems={pagination.total || 0}
        totalPages={pagination.last_page || 0}
        onPageChange={handlePageChange}
        supplierMap={supplierMap}
      />

      {/* ============================================ */}
      {/* CANCEL DIALOG */}
      {/* ============================================ */}

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="rounded-xl dark:bg-gray-900 max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl text-red-600">
              <XCircle className="h-5 w-5" />
              Cancel Purchase Order
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to cancel "{selectedPO?.po_number}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground">PO Number</p>
                <p className="font-semibold">{selectedPO?.po_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Supplier</p>
                <p className="font-semibold">{getSelectedPOSupplierName()}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason for Cancellation <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Please explain why you're cancelling this order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
              className="bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20"
            >
              {cancelMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cancelling...</> : <>Cancel Order</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}
