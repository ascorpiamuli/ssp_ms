// frontend/src/app/(dashboard)/procurement/purchase-orders/pending-approval/page.tsx

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
  Info,
  Shield,
  BadgeCheck,
  UserCog,
  Wallet,
  Receipt,
  FileSignature,
  AlertOctagon,
  AlertTriangle as AlertTriangleIcon,
  Flame,
  Check,
  Users,
  Stamp,
  Workflow,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Crown,
  Briefcase,
  CreditCard,
  Landmark,
  Banknote,
  HandCoins,
  PiggyBank,
  ChartPie,
  Gauge,
  Scale,
  Calculator,
  BookCheck,
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
import { Separator } from '@/components/ui/separator';

// Hooks
import {
  usePurchaseOrders,
  useApprovePurchaseOrder,
} from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

// Types
import type { PurchaseOrder } from '@/types/purchaseOrder.types';
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';

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

const getUserName = (user: any): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'string') return user;
  if (user.full_name) return user.full_name;
  if (user.name) return user.name;
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  return 'Unknown';
};

// ============================================
// STATUS CONFIGURATION
// ============================================

const PO_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_check: 'Pending Check',
  checked: 'Checked',
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
  checked: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
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
// WORKFLOW STEP COMPONENT - CLEAN DESIGN
// ============================================

interface WorkflowStepProps {
  step: number;
  title: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  by?: string;
}

const WorkflowStep = ({ step, title, status, date, by }: WorkflowStepProps) => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isPending = status === 'pending';

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
          isCompleted && "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30",
          isCurrent && "bg-purple-500 text-white shadow-sm shadow-purple-500/30 ring-2 ring-purple-500/20",
          isPending && "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
        )}>
          {isCompleted ? <Check className="h-4 w-4" /> : step}
        </div>
        {step < 4 && (
          <div className={cn(
            "absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-0.5",
            isCompleted ? "bg-emerald-400" : "bg-gray-300 dark:bg-gray-600"
          )} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium truncate",
            isPending ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"
          )}>
            {title}
          </span>
          {isCurrent && (
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0 text-[10px] px-2 py-0 h-5">
              Current
            </Badge>
          )}
        </div>
        {isCompleted && date && (
          <p className="text-xs text-muted-foreground">
            {formatDate(date)} {by && <span className="ml-1">by {by}</span>}
          </p>
        )}
        {isCurrent && (
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Action Required
          </p>
        )}
        {isPending && (
          <p className="text-xs text-muted-foreground">
            Waiting
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function PendingApprovalPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { isPrincipal, isFinalApprover, isAdmin } = useAuthContext();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    search?: string;
    type?: 'all' | 'lpo' | 'lso';
    sortBy?: 'date' | 'amount' | 'supplier';
  }>({});
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approveComment, setApproveComment] = useState('');

  // Hooks
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

  const approveMutation = useApprovePurchaseOrder();

  const canApprove = isPrincipal() || isFinalApprover() || isAdmin();

  // ============================================
  // PROCESS DATA
  // ============================================

  const purchaseOrders = (() => {
    if (Array.isArray(purchaseOrdersData)) {
      return purchaseOrdersData;
    }
    if (purchaseOrdersData && typeof purchaseOrdersData === 'object' && 'data' in purchaseOrdersData) {
      return (purchaseOrdersData as any).data || [];
    }
    return [];
  })();

  const supplierMap = new Map();
  if (Array.isArray(suppliersData)) {
    suppliersData.forEach((supplier: any) => {
      supplierMap.set(supplier.id, supplier);
    });
  }

  const isPendingApproval = (po: any) => {
    return po.checked_by !== null &&
      po.checked_by !== undefined &&
      po.endorsed_by !== null &&
      po.endorsed_by !== undefined &&
      po.approved_by === null;
  };

  const isApproved = (po: any) => {
    return po.approved_by !== null && po.approved_by !== undefined;
  };

  const filteredOrders = (() => {
    let orders = purchaseOrders;

    orders = orders.filter((po: any) => isPendingApproval(po) || isApproved(po));

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      orders = orders.filter((po: any) => {
        const poNumber = po.po_number?.toLowerCase() || '';
        const supplierName = getSupplierName(po.supplier).toLowerCase();
        const requisitionRef = po.requisition?.reference_number?.toLowerCase() || '';
        return poNumber.includes(searchLower) ||
          supplierName.includes(searchLower) ||
          requisitionRef.includes(searchLower);
      });
    }

    if (filters.type && filters.type !== 'all') {
      orders = orders.filter((po: any) => po.type === filters.type);
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'amount':
          orders = orders.sort((a: any, b: any) => parseFloat(b.total_amount) - parseFloat(a.total_amount));
          break;
        case 'date':
          orders = orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'supplier':
          orders = orders.sort((a: any, b: any) => {
            const nameA = getSupplierName(a.supplier).toLowerCase();
            const nameB = getSupplierName(b.supplier).toLowerCase();
            return nameA.localeCompare(nameB);
          });
          break;
        default:
          break;
      }
    }

    return orders;
  })();

  const pendingApproval = filteredOrders.filter((po: any) => isPendingApproval(po));
  const approved = filteredOrders.filter((po: any) => isApproved(po));
  const totalValue = filteredOrders.reduce((sum: number, po: any) => sum + (parseFloat(po.total_amount) || 0), 0);

  const hasPending = pendingApproval.length > 0;
  const hasApproved = approved.length > 0;

  const paginatedOrders = (() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredOrders.slice(start, end);
  })();

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const statsItems: StatCardItem[] = [
    {
      label: "Total Orders",
      value: filteredOrders.length,
      icon: FileText,
      tagLabel: "TOTAL",
      tagColor: "blue",
      subtitle: "Pending & approved orders",
    },
    {
      label: "Pending Approval",
      value: pendingApproval.length,
      icon: Shield,
      tagLabel: pendingApproval.length > 0 ? "ACTION REQUIRED" : "ALL CLEAR",
      tagColor: pendingApproval.length > 0 ? "purple" : "emerald",
      subtitle: pendingApproval.length > 0 ? "Awaiting your approval" : "No pending approvals",
    },
    {
      label: "Approved",
      value: approved.length,
      icon: CheckCircle,
      tagLabel: "COMPLETED",
      tagColor: "emerald",
      subtitle: "Successfully approved",
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

  // ============================================
  // HANDLERS
  // ============================================

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleRowClick = (id: number) => {
    router.push(`/procurement/purchase-orders/${id}/approve`);
  };

  const handleApprove = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setApproveComment('');
    setShowApproveDialog(true);
  };

  const handleConfirmApprove = () => {
    if (selectedPO) {
      approveMutation.mutate(
        { id: selectedPO.id, comment: approveComment || undefined },
        {
          onSuccess: () => {
            success(`Purchase Order ${selectedPO.po_number} approved successfully`);
            setShowApproveDialog(false);
            setSelectedPO(null);
            setApproveComment('');
            refetch();
          },
          onError: (err: any) => {
            error(err?.message || 'Failed to approve purchase order');
          }
        }
      );
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (!canApprove) {
    return (
      <PageTemplate
        title="Pending Approval"
        description="Restricted access"
        icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Approval' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Access Denied</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This page is restricted to Director/Finance Administrator or Principal.
            </p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (isLoading || isLoadingSuppliers) {
    return (
      <PageTemplate
        title="Pending Approval"
        description="Loading purchase orders..."
        icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Approval' },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Pending Approval"
      description="Review and approve purchase orders that have been endorsed by the Accountant"
      icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
        { label: 'Pending Approval' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-4 py-1.5">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {filteredOrders.length} Orders
          </Badge>
          <Badge className={cn(
            "rounded-full px-4 py-1.5",
            hasPending
              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
          )}>
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            {pendingApproval.length} Pending Approval
          </Badge>
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            {formatCurrency(totalValue)}
          </Badge>
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            {approved.length} Approved
          </Badge>
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
        {/* ALERTS SECTION */}
        {/* ============================================ */}

        <AnimatePresence mode="wait">
          <div className="space-y-3">
            {hasPending && (
              <AlertContainer
                key="alert-pending-approval"
                id="alert-pending-approval"
                type="warning"
                title={`${pendingApproval.length} Order${pendingApproval.length > 1 ? 's' : ''} Pending Your Approval`}
                description={`${pendingApproval.length} purchase order${pendingApproval.length > 1 ? 's' : ''} ${pendingApproval.length > 1 ? 'have' : 'has'} been endorsed and ${pendingApproval.length > 1 ? 'are' : 'is'} awaiting your final approval.`}
                count={pendingApproval.length}
                icon={<Shield className="h-5 w-5" />}
                actions={
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-8 px-4 text-xs"
                    onClick={() => {
                      const firstPending = pendingApproval[0];
                      if (firstPending) handleRowClick(firstPending.id);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Review First Order
                  </Button>
                }
              />
            )}

            {!hasPending && hasApproved && (
              <AlertContainer
                key="alert-all-approved"
                id="alert-all-approved"
                type="success"
                title="All Orders Approved"
                description={`All ${approved.length} purchase order${approved.length > 1 ? 's' : ''} have been approved.`}
                count={approved.length}
                icon={<CheckCircle className="h-5 w-5" />}
              />
            )}

            {!hasPending && !hasApproved && (
              <AlertContainer
                key="alert-no-orders"
                id="alert-no-orders"
                type="info"
                title="No Orders Pending Approval"
                description="There are currently no purchase orders awaiting your approval."
                icon={<Info className="h-5 w-5" />}
              />
            )}
          </div>
        </AnimatePresence>


        {/* Stats Cards - tagOrientation none */}
        <StatsCards
          stats={statsItems}
          isLoading={isLoading || isLoadingSuppliers}
          columns={4}
          variant="default"
          tagOrientation="none"
          formatCompact={true}
        />

        {/* No Orders Banner */}
        {filteredOrders.length === 0 && (
          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-950/20 dark:to-indigo-950/20">
            <CardContent className="p-8 text-center">
              <div className="inline-flex p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                <Shield className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">No Purchase Orders Pending Approval</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                All endorsed purchase orders have been approved. Check back later for new orders.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {filteredOrders.length > 0 && (
          <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900">
            <CardContent className="p-4">
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
                <Select
                  value={filters.sortBy || 'date'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[140px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    <SelectItem value="date">Latest First</SelectItem>
                    <SelectItem value="amount">Highest Amount</SelectItem>
                    <SelectItem value="supplier">Supplier Name</SelectItem>
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
              <span className="text-muted-foreground">
                {' '}• <span className="font-medium text-purple-600 dark:text-purple-400">{pendingApproval.length}</span> pending approval
              </span>
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
                      PO Number
                    </TableHead>
                    <TableHead className="min-w-[180px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Supplier
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Type</TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">
                      Amount
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                      Endorsed By
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((po: any, index: number) => {
                    const supplier = supplierMap.get(po.supplier_id) || po.supplier;
                    const supplierName = getSupplierName(supplier);
                    const needsApproval = isPendingApproval(po);
                    const isApprovedStatus = isApproved(po);
                    const endorsedByName = getUserName(po.endorsed_by);

                    return (
                      <TableRow
                        key={po.id}
                        className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group",
                          needsApproval && "border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-950/10"
                        )}
                        onClick={() => handleRowClick(po.id)}
                      >
                        <TableCell className="py-4 text-center">
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors",
                            needsApproval
                              ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          )}>
                            {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {po.po_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(po.issue_date)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-medium">
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
                            <StatusBadge status={needsApproval ? 'pending_approval' : po.status} />
                            {needsApproval && (
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0 text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Needs Approval
                              </Badge>
                            )}
                            {isApprovedStatus && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            )}
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
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5">
                              <Stamp className="h-3.5 w-3.5 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {endorsedByName}
                              </span>
                            </div>
                            {po.endorsed_at && (
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(po.endorsed_at)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <div className="flex items-center justify-center">
                            {needsApproval ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(po);
                                }}
                                className="h-8 px-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                              >
                                <Shield className="h-3.5 w-3.5 mr-1.5" />
                                Approve
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
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableComponent>
            </ScrollArea>

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
      {/* APPROVE DIALOG */}
      {/* ============================================ */}

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="rounded-xl dark:bg-gray-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Approve Purchase Order
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Confirm approval of "{selectedPO?.po_number}"
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
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

            {selectedPO?.endorsed_by && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Stamp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Endorsed by <span className="font-medium">{getUserName(selectedPO.endorsed_by)}</span>
                    {selectedPO.endorsed_at && (
                      <span className="text-muted-foreground ml-1">
                        on {formatDateTime(selectedPO.endorsed_at)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Final Authorization</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                    By approving, you authorize the issuance of this purchase order and commit the funds.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Comment (Optional)</Label>
              <Textarea
                placeholder="Add any approval notes..."
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApprove}
              disabled={approveMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30 text-white"
            >
              {approveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
