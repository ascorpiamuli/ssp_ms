// frontend/src/app/(dashboard)/procurement/purchase-orders/pending-endorsement/page.tsx

'use client';

import React, { useState } from 'react';
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
  Calendar,
  DollarSign,
  Package,
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast-context';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import {
  usePurchaseOrders,
  useEndorsePurchaseOrder,
} from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

// Types
import type { PurchaseOrder } from '@/types/purchaseOrder.types';
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
// WORKFLOW STEP COMPONENT
// ============================================

interface WorkflowStepProps {
  step: number;
  title: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ReactNode;
  description?: string;
  date?: string;
  by?: string;
}

const WorkflowStep = ({ step, title, status, icon, description, date, by }: WorkflowStepProps) => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isPending = status === 'pending';

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
          isCompleted && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
          isCurrent && "bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20",
          isPending && "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
        )}>
          {isCompleted ? <Check className="h-5 w-5" /> : icon}
        </div>
        {step < 4 && (
          <div className={cn(
            "absolute -right-6 w-8 h-0.5",
            isCompleted ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"
          )} />
        )}
      </div>
      <div className={cn(
        "flex-1 min-w-0",
        isCurrent && "bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 -m-1 border border-blue-200 dark:border-blue-800"
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium truncate",
            isPending ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"
          )}>
            {title}
          </span>
          {isCurrent && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-[10px] px-2 py-0 h-5">
              Current
            </Badge>
          )}
          {isCompleted && date && (
            <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">
              {formatDate(date)}
              {by && <span className="ml-1">by {by}</span>}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function PendingEndorsementPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { user, isAccountant } = useAuthContext();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    search?: string;
    type?: 'all' | 'lpo' | 'lso';
  }>({});
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showEndorseDialog, setShowEndorseDialog] = useState(false);
  const [endorseComment, setEndorseComment] = useState('');

  // Hooks - Fetch ALL POs
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

  const endorseMutation = useEndorsePurchaseOrder();

  // ============================================
  // PROCESS DATA
  // ============================================

  // Extract purchase orders from response
  const allPurchaseOrders = (() => {
    if (Array.isArray(purchaseOrdersData)) {
      return purchaseOrdersData;
    }
    if (purchaseOrdersData && typeof purchaseOrdersData === 'object' && 'data' in purchaseOrdersData) {
      return (purchaseOrdersData as any).data || [];
    }
    return [];
  })();

  // Build supplier map
  const supplierMap = new Map();
  if (Array.isArray(suppliersData)) {
    suppliersData.forEach((supplier: any) => {
      supplierMap.set(supplier.id, supplier);
    });
  }

  // ✅ CORRECT: A PO is pending endorsement when:
  // - checked_by is NOT null (HOD has checked it)
  // - endorsed_by IS null (Accountant hasn't endorsed yet)
  const isPendingEndorsement = (po: any) => {
    return po.checked_by !== null && po.checked_by !== undefined && po.endorsed_by === null;
  };

  // ✅ CORRECT: A PO is endorsed when endorsed_by is NOT null
  const isEndorsed = (po: any) => {
    return po.endorsed_by !== null && po.endorsed_by !== undefined;
  };

  // Filter: Only show POs that are checked (pending endorsement) OR already endorsed
  const filteredOrders = (() => {
    let orders = allPurchaseOrders;

    // Only show checked (pending endorsement) OR endorsed orders
    orders = orders.filter((po: any) => isPendingEndorsement(po) || isEndorsed(po));

    // Search filter
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

    // Type filter
    if (filters.type && filters.type !== 'all') {
      orders = orders.filter((po: any) => po.type === filters.type);
    }

    return orders;
  })();

  // Separate pending vs endorsed
  const pendingEndorsement = filteredOrders.filter((po: any) => isPendingEndorsement(po));
  const endorsed = filteredOrders.filter((po: any) => isEndorsed(po));
  const totalValue = filteredOrders.reduce((sum: number, po: any) => sum + (parseFloat(po.total_amount) || 0), 0);
  const pendingApproval = allPurchaseOrders.filter((po: any) => po.status === 'pending_approval');
  const issued = allPurchaseOrders.filter((po: any) => po.status === 'issued' || po.status === 'sent');

  const hasPending = pendingEndorsement.length > 0;
  const hasEndorsed = endorsed.length > 0;

  // Pagination
  const paginatedOrders = (() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredOrders.slice(start, end);
  })();

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  // Stats
  const statsItems: StatCardItem[] = [
    {
      label: "Total Orders",
      value: filteredOrders.length,
      icon: FileText,
      tagLabel: "TOTAL",
      tagColor: "blue",
      subtitle: "Checked & endorsed orders",
    },
    {
      label: "Pending Endorsement",
      value: pendingEndorsement.length,
      icon: Stamp,
      tagLabel: pendingEndorsement.length > 0 ? "ACTION REQUIRED" : "ALL CLEAR",
      tagColor: pendingEndorsement.length > 0 ? "blue" : "emerald",
      subtitle: pendingEndorsement.length > 0 ? "Awaiting your endorsement" : "No pending endorsements",
    },
    {
      label: "Endorsed",
      value: endorsed.length,
      icon: BadgeCheck,
      tagLabel: "COMPLETED",
      tagColor: "emerald",
      subtitle: "Successfully endorsed",
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
    router.push(`/procurement/purchase-orders/${id}/endorse`);
  };

  const handleEndorse = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setEndorseComment('');
    setShowEndorseDialog(true);
  };

  const handleConfirmEndorse = () => {
    if (selectedPO) {
      endorseMutation.mutate(
        { id: selectedPO.id, comment: endorseComment || undefined },
        {
          onSuccess: () => {
            success(`Purchase Order ${selectedPO.po_number} endorsed successfully`);
            setShowEndorseDialog(false);
            setSelectedPO(null);
            setEndorseComment('');
            refetch();
          },
          onError: (err: any) => {
            error(err?.message || 'Failed to endorse purchase order');
          }
        }
      );
    }
  };

  // ============================================
  // RENDER
  // ============================================

  // Check if user is Accountant
  if (!isAccountant()) {
    return (
      <PageTemplate
        title="Accountant Endorsement"
        description="Restricted access"
        icon={<Stamp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Endorsement' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Access Denied</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This page is restricted to Accountant role only.
            </p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (isLoading || isLoadingSuppliers) {
    return (
      <PageTemplate
        title="Accountant Endorsement"
        description="Loading..."
        icon={<Stamp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Endorsement' },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Accountant Endorsement"
      description="Review and endorse purchase orders that have been checked by HOD"
      icon={<Stamp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
        { label: 'Pending Endorsement' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {filteredOrders.length} Orders
          </Badge>
          <Badge className={cn(
            "rounded-full px-4 py-1.5",
            hasPending
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
          )}>
            <Stamp className="h-3.5 w-3.5 mr-1.5" />
            {pendingEndorsement.length} Pending Endorsement
          </Badge>
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            {formatCurrency(totalValue)}
          </Badge>
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-4 py-1.5">
            <BadgeCheck className="h-3.5 w-3.5 mr-1.5" />
            {endorsed.length} Endorsed
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
        {/* Stats Cards */}
        <StatsCards
          stats={statsItems}
          isLoading={isLoading || isLoadingSuppliers}
          columns={4}
          variant="default"
          tagOrientation='none'
          formatCompact={true}
        />

        {/* ============================================ */}
        {/* ALERT CONTAINERS */}
        {/* ============================================ */}

        <AnimatePresence mode="wait">
          {/* HIGH PRIORITY: Pending Endorsement Alert */}
          {hasPending && (
            <AlertContainer
              key="alert-pending"
              id="alert-pending"
              type="warning"
              title={`${pendingEndorsement.length} Purchase Order(s) Awaiting Your Endorsement`}
              description={`${pendingEndorsement.length} purchase order(s) have been checked by HOD and are now pending your endorsement. Please review each order carefully for budget compliance before endorsing.`}
              count={pendingEndorsement.length}
              icon={<Stamp className="h-5 w-5" />}
              actions={
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 px-4 text-xs"
                  onClick={() => {
                    const firstPending = pendingEndorsement[0];
                    if (firstPending) handleRowClick(firstPending.id);
                  }}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Review First Order
                </Button>
              }
            />
          )}

          {/* SUCCESS: All endorsed */}
          {!hasPending && hasEndorsed && (
            <AlertContainer
              key="alert-success"
              id="alert-success"
              type="success"
              title="All Orders Endorsed"
              description={`All ${endorsed.length} purchase order(s) have been endorsed by you. No pending actions required. They are now awaiting Director/Principal approval.`}
              count={endorsed.length}
              icon={<BadgeCheck className="h-5 w-5" />}
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg h-8 px-4 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                  onClick={() => handleFilterChange('type', 'all')}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View All
                </Button>
              }
            />
          )}

          {/* INFO: Pending Approval */}
          {pendingApproval.length > 0 && (
            <AlertContainer
              key="alert-approval"
              id="alert-approval"
              type="info"
              title="Orders in Approval Pipeline"
              description={`${pendingApproval.length} purchase order(s) have been endorsed and are now awaiting Director/Principal approval.`}
              count={pendingApproval.length}
              icon={<Shield className="h-5 w-5" />}
            />
          )}

          {/* SUCCESS: Issued orders */}
          {issued.length > 0 && (
            <AlertContainer
              key="alert-issued"
              id="alert-issued"
              type="success"
              title="Issued Orders"
              description={`${issued.length} purchase order(s) have been issued to suppliers and are now in delivery phase.`}
              count={issued.length}
              icon={<Send className="h-5 w-5" />}
            />
          )}

          {/* INFO: No pending but no endorsed yet */}
          {!hasPending && !hasEndorsed && allPurchaseOrders.length > 0 && (
            <AlertContainer
              key="alert-empty"
              id="alert-empty"
              type="info"
              title="No Orders to Endorse"
              description="There are currently no purchase orders that have been checked by HOD and awaiting your endorsement. Check back later."
              icon={<Info className="h-5 w-5" />}
            />
          )}

          {/* INFO: Summary Alert */}
          {filteredOrders.length > 0 && (
            <AlertContainer
              key="alert-summary"
              id="alert-summary"
              type="info"
              title="Endorsement Summary"
              description={`Total of ${filteredOrders.length} purchase orders valued at ${formatCurrency(totalValue)}. ${pendingEndorsement.length} pending your endorsement.`}
              icon={<Wallet className="h-5 w-5" />}
            />
          )}
        </AnimatePresence>

        {/* ============================================ */}
        {/* WORKFLOW - PREMIUM ANIMATED */}
        {/* ============================================ */}

        <Card className="border-0 shadow-xl rounded-2xl bg-white dark:bg-gray-900 relative overflow-hidden">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, #3b82f6, transparent 50%)',
                'radial-gradient(circle at 100% 100%, #8b5cf6, transparent 50%)',
                'radial-gradient(circle at 0% 100%, #06b6d4, transparent 50%)',
                'radial-gradient(circle at 100% 0%, #3b82f6, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
          />

          {/* Animated side bar */}
          <motion.div
            className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-emerald-500 to-purple-500"
            animate={{
              opacity: [1, 0.6, 1],
              scaleY: [1, 0.95, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Glowing orb decoration */}
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <CardContent className="p-6 pt-8 relative z-10">
            {/* Header with counter animation */}
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25"
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Workflow className="h-5 w-5 text-white" />
              </motion.div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Endorsement Workflow</h3>
              <motion.div
                className="ml-auto flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium border-0",
                    hasPending
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 animate-pulse"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  )}
                >
                  {hasPending ? `${pendingEndorsement.length} Pending` : '✨ All Complete'}
                </Badge>
                {hasPending && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Workflow Steps - Animated */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
              {/* Step 1: Draft Created */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <motion.div
                      className="absolute -inset-1 rounded-full border-2 border-emerald-400/30"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Draft Created</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Completed</p>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </motion.div>
                </div>
                {/* Connector line */}
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-emerald-300 dark:bg-emerald-700" />
              </motion.div>

              {/* Step 2: HOD Check */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">HOD Check</p>
                    <motion.p
                      className="text-xs text-emerald-600 dark:text-emerald-400 truncate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      by {pendingEndorsement[0]?.checked_by_user || endorsed[0]?.checked_by_user || '—'}
                    </motion.p>
                    <motion.p
                      className="text-[10px] text-muted-foreground truncate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      {formatDate(pendingEndorsement[0]?.checked_at || endorsed[0]?.checked_at)}
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </motion.div>
                </div>
                {/* Connector line */}
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-emerald-300 dark:bg-emerald-700" />
              </motion.div>

              {/* Step 3: Accountant Endorsement */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
                whileHover={{ scale: 1.03 }}
                className="relative"
              >
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 shadow-md transition-all duration-300",
                  hasPending
                    ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-blue-500/20"
                    : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50"
                )}>
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    animate={hasPending ? {
                      rotate: [0, -5, 5, -5, 0],
                    } : {}}
                    transition={{ duration: 2, repeat: hasPending ? Infinity : 0 }}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
                      hasPending
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-500/40"
                        : "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30"
                    )}>
                      <Stamp className="h-5 w-5 text-white" />
                    </div>
                    {hasPending && (
                      <motion.div
                        className="absolute -inset-1 rounded-full border-2 border-blue-400/50"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.6, 0, 0.6],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "font-medium text-sm",
                        hasPending ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"
                      )}>
                        Accountant Endorsement
                      </p>
                      {hasPending && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Badge className="bg-blue-500 text-white border-0 text-[10px] px-2 py-0 h-5">
                            Current
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    {hasPending ? (
                      <motion.p
                        className="text-xs text-blue-600 dark:text-blue-400"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Waiting for your endorsement
                      </motion.p>
                    ) : (
                      <>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                          by {endorsed[0]?.endorsed_by_user || '—'}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {formatDate(endorsed[0]?.endorsed_at)}
                        </p>
                      </>
                    )}
                  </div>
                  {!hasPending && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: 'spring' }}
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  )}
                  {hasPending && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                    </motion.div>
                  )}
                </div>
                {/* Connector line */}
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gray-300 dark:bg-gray-600" />
              </motion.div>

              {/* Step 4: Final Approval */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border shadow-sm",
                  hasPending
                    ? "bg-gray-50/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                    : "bg-gray-50/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60"
                )}>
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      hasPending
                        ? "bg-gradient-to-br from-gray-400 to-gray-500"
                        : "bg-gradient-to-br from-gray-300 to-gray-400"
                    )}>
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm",
                      hasPending ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
                    )}>
                      Final Approval
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasPending ? 'Pending' : 'Waiting'}
                    </p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Progress bar */}
            <motion.div
              className="mt-6 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Workflow Progress</span>
                <span className="font-medium">
                  {hasPending ? '75%' : '100%'}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
                  initial={{ width: '0%' }}
                  animate={{ width: hasPending ? '75%' : '100%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Draft</span>
                <span>HOD Check</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">Endorsement</span>
                <span>Approval</span>
              </div>
            </motion.div>

            {/* Completion celebration animation */}
            {!hasPending && endorsed.length > 0 && (
              <motion.div
                className="mt-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  </motion.div>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    All endorsements completed! 🎉
                  </span>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Pending count badge with pulse */}
            {hasPending && (
              <motion.div
                className="mt-3 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-full border border-blue-200 dark:border-blue-800">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </motion.div>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {pendingEndorsement.length} order{pendingEndorsement.length > 1 ? 's' : ''} awaiting your endorsement
                  </span>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* No Orders Banner */}
        {filteredOrders.length === 0 && (
          <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-8 text-center">
              <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <Stamp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">No Purchase Orders Pending Endorsement</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                All checked purchase orders have been endorsed. Check back later for new orders.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {filteredOrders.length > 0 && (
          <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">
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
              <span className="text-muted-foreground">
                {' '}• <span className="font-medium text-blue-600 dark:text-blue-400">{pendingEndorsement.length}</span> pending endorsement
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
                        <UserCheck className="h-3.5 w-3.5" />
                        Checked By
                      </div>
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                      <div className="flex items-center gap-2">
                        <Stamp className="h-3.5 w-3.5" />
                        Action
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((po: any, index: number) => {
                    const supplier = supplierMap.get(po.supplier_id) || po.supplier;
                    const supplierName = getSupplierName(supplier);
                    const needsEndorsement = isPendingEndorsement(po);
                    const isEndorsedStatus = isEndorsed(po);
                    const checkedBy = po.checked_by;
                    const checkedByName = getUserName(checkedBy);

                    return (
                      <TableRow
                        key={po.id}
                        className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group",
                          needsEndorsement && "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10"
                        )}
                        onClick={() => handleRowClick(po.id)}
                      >
                        <TableCell className="py-4 text-center">
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors",
                            needsEndorsement
                              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60"
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
                            <StatusBadge status={needsEndorsement ? 'pending_endorsement' : po.status} />
                            {needsEndorsement && (
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs">
                                <Stamp className="h-3 w-3 mr-1" />
                                Needs Endorsement
                              </Badge>
                            )}
                            {isEndorsedStatus && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs">
                                <BadgeCheck className="h-3 w-3 mr-1" />
                                Endorsed
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
                              <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {checkedByName}
                              </span>
                            </div>
                            {po.checked_at && (
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(po.checked_at)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <div className="flex items-center justify-center">
                            {needsEndorsement ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEndorse(po);
                                }}
                                className="h-8 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 group-hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                <Stamp className="h-3.5 w-3.5 mr-1.5" />
                                Endorse
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
      {/* ENDORSE DIALOG */}
      {/* ============================================ */}

      <Dialog open={showEndorseDialog} onOpenChange={setShowEndorseDialog}>
        <DialogContent className="rounded-xl dark:bg-gray-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Stamp className="h-5 w-5 text-emerald-600" />
              Endorse Purchase Order
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Confirm endorsement of "{selectedPO?.po_number}" after reviewing all details.
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

            {/* Checked By Info */}
            {selectedPO?.checked_by && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Checked by <span className="font-medium">{getUserName(selectedPO.checked_by)}</span>
                    {selectedPO.checked_at && (
                      <span className="text-muted-foreground ml-1">
                        on {formatDateTime(selectedPO.checked_at)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Items Summary */}
            {selectedPO?.items && selectedPO.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Items to Endorse</p>
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

            {/* Budget Verification Note */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Wallet className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Budget Verification</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    By endorsing, you confirm that the required funds are available and budget allocation is compliant.
                  </p>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label className="text-sm">Comment (Optional)</Label>
              <Textarea
                placeholder="Add any financial verification notes..."
                value={endorseComment}
                onChange={(e) => setEndorseComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndorseDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEndorse}
              disabled={endorseMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30 text-white"
            >
              {endorseMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Stamp className="h-4 w-4 mr-2" />
              )}
              Confirm Endorsement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
