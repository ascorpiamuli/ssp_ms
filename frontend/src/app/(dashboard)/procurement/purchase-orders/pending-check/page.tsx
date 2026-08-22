// frontend/src/app/(dashboard)/procurement/purchase-orders/pending-check/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
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
  UserCheck,
  FileCheck,
  Search,
  ChevronDown,
  Sparkles,
  Info,
  TrendingUp,
  Award,
  Shield,
  Briefcase,
  Layers,
  User,
  CreditCard,
  Zap,
  Hash,
  Tag,
  Globe,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Circle,
  CheckCircle2,
  AlertTriangle,
  Ban,
  MoreVertical,
  Grid3x3,
  List,
  LayoutGrid,
  Table,
  Mail,
  ChevronRight,
  ArrowRight,
  Star,
  Crown,
  Gem,
  Rocket,
  Target,
  Flag,
  BadgeCheck,
  UserCog,
  Wallet,
  Receipt,
  File,
  FolderOpen,
  PanelLeft,
  ArrowUpDown,
  Filter,
  X,
  Plus,
  Minus,
  ChevronUp,
  ChevronsUpDown,
  ExternalLink,
  FileSignature,
  Bell,
  BellRing,
  AlertOctagon,
  AlertTriangle as AlertTriangleIcon,
  Flame,
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
  Table as TableComponent,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  useCheckPurchaseOrder,
} from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

// Types
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder.types';
import type { RequisitionItem } from '@/types/requisition.types';
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

const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
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

const getSupplierName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

// ============================================
// STATUS CONFIGURATION
// ============================================

const PO_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_check: 'Pending Check',
  pending_endorsement: 'Pending Endorsement',
  pending_approval: 'Pending Approval',
  issued: 'Issued',
  sent: 'Sent',
  acknowledged: 'Acknowledged',
  delivered: 'Delivered',
  partial: 'Partial',
  completed: 'Completed',
  cancelled: 'Cancelled',
  closed: 'Closed',
};

const PO_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  pending_check: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  pending_endorsement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  pending_approval: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  issued: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  sent: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  acknowledged: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  completed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const colorClass = PO_STATUS_COLORS[status] || PO_STATUS_COLORS.draft;
  const label = PO_STATUS_LABELS[status] || status;

  return (
    <Badge className={cn("px-3 py-1 font-medium rounded-full", colorClass)}>
      {label}
    </Badge>
  );
};

// ============================================
// ALERT CONTAINER COMPONENTS
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
      defaultIcon: <AlertTriangleIcon className="h-5 w-5" />,
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
      defaultIcon: <AlertOctagon className="h-5 w-5" />,
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
// MAIN PAGE
// ============================================

export default function PendingCheckPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { user } = useAuthContext();

  // Get the user's effective department (handles HOD correctly) - with type assertion
  const userDepartmentId = useMemo(() => {
    const userAny = user as any;
    return userAny?.effective_department?.id ||
      userAny?.hod_department?.id ||
      user?.department_id ||
      userAny?.department?.id ||
      null;
  }, [user]);

  const userDepartmentName = useMemo(() => {
    const userAny = user as any;
    return userAny?.effective_department?.name ||
      userAny?.hod_department?.name ||
      userAny?.department?.name ||
      null;
  }, [user]);

  const isUserHOD = useMemo(() => {
    const userAny = user as any;
    return userAny?.is_hod || false;
  }, [user]);

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    search?: string;
    type?: 'all' | 'lpo' | 'lso';
    status?: 'all' | 'draft' | 'pending_check' | 'checked' | 'pending_endorsement' | 'pending_approval' | 'issued' | 'completed' | 'cancelled';
    dateFrom?: string;
    dateTo?: string;
  }>({ status: 'all' });
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showCheckDialog, setShowCheckDialog] = useState(false);
  const [checkComment, setCheckComment] = useState('');

  // Hooks - Fetch ALL POs (not just draft)
  const {
    data: purchaseOrdersData,
    isLoading,
    refetch,
  } = usePurchaseOrders({
    per_page: 100,
    page: 1,
  });

  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useAllSuppliers();

  const checkMutation = useCheckPurchaseOrder();

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

  // Filter POs based on user's department
  const filteredByDepartment = useMemo(() => {
    return purchaseOrders.filter((po: any) => {
      if (userDepartmentId) {
        const requisitionDeptId = po.requisition?.department_id;
        return requisitionDeptId === userDepartmentId;
      }
      return true;
    });
  }, [purchaseOrders, userDepartmentId]);

  // Determine if a PO needs checking
  const needsChecking = (po: any) => {
    return po.status === 'draft' && !po.checked_by;
  };

  // Apply filters
  const filteredOrders = useMemo(() => {
    let orders = filteredByDepartment;

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'checked') {
        orders = orders.filter((p: any) => !!p.checked_by);
      } else if (filters.status === 'pending_check') {
        orders = orders.filter((p: any) => needsChecking(p));
      } else {
        orders = orders.filter((p: any) => p.status === filters.status);
      }
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

    // Type filter
    if (filters.type && filters.type !== 'all') {
      orders = orders.filter((p: any) => p.type === filters.type);
    }

    return orders;
  }, [filteredByDepartment, filters]);

  // Calculate alert data
  const alertData = useMemo(() => {
    const pendingCheck = filteredOrders.filter((p: any) => needsChecking(p));
    const checked = filteredOrders.filter((p: any) => !!p.checked_by);
    const endorsed = filteredOrders.filter((p: any) => !!p.endorsed_by && !p.approved_by);
    const approved = filteredOrders.filter((p: any) => !!p.approved_by);
    const cancelled = filteredOrders.filter((p: any) => p.status === 'cancelled');
    const totalValue = filteredOrders.reduce((sum: number, p: any) => sum + (parseFloat(p.total_amount) || 0), 0);

    return {
      pendingCheck,
      checked,
      endorsed,
      approved,
      cancelled,
      totalValue,
      hasPending: pendingCheck.length > 0,
      hasChecked: checked.length > 0,
      hasEndorsed: endorsed.length > 0,
      hasApproved: approved.length > 0,
    };
  }, [filteredOrders]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  // Stats
  const statsItems: StatCardItem[] = useMemo(() => {
    const total = filteredOrders.length;
    const pendingCheck = alertData.pendingCheck.length;
    const checked = alertData.checked.length;
    const totalValue = alertData.totalValue;

    return [
      {
        label: "Total Orders",
        value: total,
        icon: FileText,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: `In ${userDepartmentName || 'your department'}`,
      },
      {
        label: "Pending Check",
        value: pendingCheck,
        icon: UserCheck,
        tagLabel: pendingCheck > 0 ? "ACTION REQUIRED" : "ALL CLEAR",
        tagColor: pendingCheck > 0 ? "amber" : "emerald",
        subtitle: pendingCheck > 0 ? "Awaiting your review" : "No pending checks",
      },
      {
        label: "Checked",
        value: checked,
        icon: FileSignature,
        tagLabel: "REVIEWED",
        tagColor: "emerald",
        subtitle: "Already checked",
      },
      {
        label: "Total Value",
        value: totalValue,
        icon: DollarSign,
        isCurrency: true,
        tagLabel: "VALUE",
        tagColor: "emerald",
        subtitle: "Total amount",
      },
    ];
  }, [filteredOrders, alertData, userDepartmentName]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ status: 'all' });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRowClick = useCallback((id: number) => {
    router.push(`/procurement/purchase-orders/${id}/check`);
  }, [router]);

  const handleCheck = useCallback((po: PurchaseOrder) => {
    setSelectedPO(po);
    setCheckComment('');
    setShowCheckDialog(true);
  }, []);

  const handleConfirmCheck = useCallback(() => {
    if (selectedPO) {
      checkMutation.mutate(
        { id: selectedPO.id, comment: checkComment || undefined },
        {
          onSuccess: () => {
            success(`Purchase Order ${selectedPO.po_number} checked successfully`);
            setShowCheckDialog(false);
            setSelectedPO(null);
            setCheckComment('');
            refetch();
          }
        }
      );
    }
  }, [selectedPO, checkComment, checkMutation, success, refetch]);

  // ============================================
  // RENDER
  // ============================================

  if (isLoading || isLoadingSuppliers) {
    return (
      <PageTemplate
        title="Purchase Orders"
        description="Loading purchase orders..."
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'All Orders' },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </PageTemplate>
    );
  }

  // If user is HOD but has no department, show error
  if (isUserHOD && !userDepartmentId) {
    return (
      <PageTemplate
        title="Purchase Orders"
        description="No department assigned"
        icon={<AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'All Orders' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">No Department Assigned</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You are listed as a Head of Department but no department has been assigned to you.
              Please contact the system administrator to assign your department.
            </p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Purchase Orders"
      description={userDepartmentName
        ? `View all purchase orders from ${userDepartmentName} Department`
        : `View all purchase orders from your department`}
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
        { label: 'All Orders' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {filteredOrders.length} Orders
          </Badge>
          <Badge className={cn(
            "rounded-full px-4 py-1.5",
            alertData.hasPending
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
          )}>
            <UserCheck className="h-3.5 w-3.5 mr-1.5" />
            {alertData.pendingCheck.length} Pending Check
          </Badge>
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            {formatCurrency(alertData.totalValue)}
          </Badge>
          {userDepartmentName && (
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-4 py-1.5">
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              {userDepartmentName}
              {isUserHOD && (
                <span className="ml-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">(HOD)</span>
              )}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ============================================ */}
        {/* ALERT CONTAINERS */}
        {/* ============================================ */}

        <AnimatePresence mode="wait">
          {/* HIGH PRIORITY: Pending Check Alerts */}
          {alertData.hasPending && (
            <AlertContainer
              key="alert-pending"
              id="alert-pending"
              type="warning"
              title="Purchase Orders Awaiting Your Check"
              description={`${alertData.pendingCheck.length} purchase order(s) from ${userDepartmentName || 'your department'} require your review and verification before they can proceed to the next workflow stage.`}
              count={alertData.pendingCheck.length}
              icon={<Flame className="h-5 w-5" />}
              actions={
                <Button
                  size="sm"
                  onClick={() => handleFilterChange('status', 'pending_check')}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-8 px-4 text-xs"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Review Now
                </Button>
              }
            />
          )}

          {/* SUCCESS: All checked */}
          {!alertData.hasPending && alertData.checked.length > 0 && (
            <AlertContainer
              key="alert-success"
              id="alert-success"
              type="success"
              title="All Orders Reviewed"
              description={`All ${alertData.checked.length} purchase order(s) from ${userDepartmentName || 'your department'} have been checked. No pending actions required.`}
              count={alertData.checked.length}
              icon={<BadgeCheck className="h-5 w-5" />}
            />
          )}

          {/* INFO: Endorsed/Approved status */}
          {alertData.hasEndorsed && (
            <AlertContainer
              key="alert-endorsed"
              id="alert-endorsed"
              type="info"
              title="Orders in Workflow Pipeline"
              description={`${alertData.endorsed.length} purchase order(s) have been checked and endorsed by the Accountant. They are now awaiting Director approval.`}
              count={alertData.endorsed.length}
              icon={<Bell className="h-5 w-5" />}
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFilterChange('status', 'pending_approval')}
                  className="rounded-lg h-8 px-4 text-xs border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Pending Approval
                </Button>
              }
            />
          )}

          {alertData.hasApproved && (
            <AlertContainer
              key="alert-approved"
              id="alert-approved"
              type="success"
              title="Approved Orders"
              description={`${alertData.approved.length} purchase order(s) have been fully approved and issued. These are ready for processing.`}
              count={alertData.approved.length}
              icon={<Shield className="h-5 w-5" />}
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFilterChange('status', 'issued')}
                  className="rounded-lg h-8 px-4 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Issued
                </Button>
              }
            />
          )}

          {/* WARNING: Cancelled orders */}
          {alertData.cancelled.length > 0 && (
            <AlertContainer
              key="alert-cancelled"
              id="alert-cancelled"
              type="error"
              title="Cancelled Orders"
              description={`${alertData.cancelled.length} purchase order(s) have been cancelled. Please review the cancellation reasons if needed.`}
              count={alertData.cancelled.length}
              icon={<XCircle className="h-5 w-5" />}
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFilterChange('status', 'cancelled')}
                  className="rounded-lg h-8 px-4 text-xs border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Cancelled
                </Button>
              }
            />
          )}

          {/* Summary Alert */}
          {filteredOrders.length > 0 && (
            <AlertContainer
              key="alert-summary"
              id="alert-summary"
              type="info"
              title="Department Summary"
              description={`${userDepartmentName || 'Your department'} has ${filteredOrders.length} total purchase orders valued at ${formatCurrency(alertData.totalValue)}.`}
              icon={<Building2 className="h-5 w-5" />}
            />
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <StatsCards
          stats={statsItems}
          isLoading={isLoading || isLoadingSuppliers}
          columns={4}
          variant="default"
          formatCompact={true}
        />

        {/* No Orders Banner */}
        {filteredOrders.length === 0 && (
          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-8 text-center">
              <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">No Purchase Orders Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {userDepartmentName
                  ? `There are no purchase orders from ${userDepartmentName} to display.`
                  : 'There are no purchase orders to display.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {filteredOrders.length > 0 && (
          <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">
            <WrappedCornerTag label="FILTERS" color="blue" position="top-left" size="sm" />
            <CardContent className="p-4 pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by PO number, supplier..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full"
                  />
                </div>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[160px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_check">Pending Check</SelectItem>
                    <SelectItem value="checked">Checked</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_endorsement">Pending Endorsement</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="lpo">LPO (Goods)</SelectItem>
                    <SelectItem value="lso">LSO (Services)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-1 rounded-xl shrink-0 h-11 px-4"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-gray-900 dark:text-gray-100">{paginatedOrders.length}</span> of{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{filteredOrders.length}</span> purchase orders
              {userDepartmentName && (
                <span className="text-muted-foreground">
                  {' '}from <span className="font-medium">{userDepartmentName}</span>
                </span>
              )}
            </p>
          </div>
        )}

        {/* Table */}
        {filteredOrders.length > 0 && (
          <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
            <ScrollArea className="w-full">
              <TableComponent>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
                    <TableHead className="w-[50px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">#</TableHead>
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
                    <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="h-3.5 w-3.5" />
                        Amount
                      </div>
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Package className="h-3.5 w-3.5" />
                        Items
                      </div>
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                      <div className="flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5" />
                        Action
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((po: any, index: number) => {
                    const supplier = supplierMap.get(po.supplier_id) || po.supplier;
                    const supplierName = getSupplierName(supplier);
                    const itemsCount = po.items?.length || 0;
                    const needsCheck = po.status === 'draft' && !po.checked_by;
                    const isChecked = !!po.checked_by;
                    const isEndorsed = !!po.endorsed_by;
                    const isApproved = !!po.approved_by;

                    // Determine check status display
                    let checkStatusLabel = 'Not Checked';
                    let checkStatusColor = 'text-amber-600 dark:text-amber-400';
                    let checkStatusIcon = <Clock className="h-3.5 w-3.5" />;

                    if (isApproved) {
                      checkStatusLabel = 'Approved';
                      checkStatusColor = 'text-purple-600 dark:text-purple-400';
                      checkStatusIcon = <Shield className="h-3.5 w-3.5" />;
                    } else if (isEndorsed) {
                      checkStatusLabel = 'Endorsed';
                      checkStatusColor = 'text-blue-600 dark:text-blue-400';
                      checkStatusIcon = <UserCheck className="h-3.5 w-3.5" />;
                    } else if (isChecked) {
                      checkStatusLabel = 'Checked';
                      checkStatusColor = 'text-emerald-600 dark:text-emerald-400';
                      checkStatusIcon = <FileSignature className="h-3.5 w-3.5" />;
                    }

                    return (
                      <TableRow
                        key={po.id}
                        className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group",
                          needsCheck && "border-l-4 border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10"
                        )}
                        onClick={() => handleRowClick(po.id)}
                      >
                        <TableCell className="py-4 text-center">
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors",
                            needsCheck
                              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                          )}>
                            {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {po.po_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(po.issue_date)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium">
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
                        <TableCell className="py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <StatusBadge status={po.status} />
                            <div className={cn("flex items-center gap-1 text-xs font-medium", checkStatusColor)}>
                              {checkStatusIcon}
                              <span>{checkStatusLabel}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(po.total_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {po.currency || 'KES'}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {itemsCount}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          {needsCheck ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(po.id);
                              }}
                              className="h-8 px-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 group-hover:scale-105 transition-all duration-300"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              Review
                              <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(po.id);
                              }}
                              className="h-8 px-3 rounded-xl text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableComponent>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* CHECK DIALOG */}
      {/* ============================================ */}

      <Dialog open={showCheckDialog} onOpenChange={setShowCheckDialog}>
        <DialogContent className="rounded-xl dark:bg-gray-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-600" />
              Check Purchase Order
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Review and check "{selectedPO?.po_number}" before it proceeds to the next stage.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground">PO Number</p>
                <p className="font-semibold">{selectedPO?.po_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Supplier</p>
                <p className="font-semibold">{selectedPO ? getSupplierName(supplierMap.get(selectedPO.supplier_id) || selectedPO.supplier) : ''}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-semibold">{selectedPO?.type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-emerald-600">{formatCurrency(selectedPO?.total_amount)}</p>
              </div>
            </div>

            {/* Items Summary */}
            {selectedPO?.items && selectedPO.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Items to Check</p>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {selectedPO.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">{item.item_name}</span>
                      <span className="text-muted-foreground">
                        {item.formatted_quantity || item.quantity} × {formatCurrency(item.unit_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            <div className="space-y-2">
              <Label className="text-sm">Comment (Optional)</Label>
              <Textarea
                placeholder="Add any notes or observations about this order..."
                value={checkComment}
                onChange={(e) => setCheckComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              <span>Checking confirms all items match the requisition</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCheck}
              disabled={checkMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-lg shadow-amber-500/30 text-white"
            >
              {checkMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Confirm Check
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
