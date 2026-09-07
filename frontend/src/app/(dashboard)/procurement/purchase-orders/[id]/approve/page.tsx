// frontend/src/app/(dashboard)/procurement/purchase-orders/[id]/approve/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
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
  ChevronRight,
  ArrowRight,
  X,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Check,
  Wallet,
  Receipt,
  Landmark,
  PiggyBank,
  Banknote,
  Coins,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  PieChart,
  BarChart3,
  LineChart,
  Gauge,
  Scale,
  Calculator,
  FileSpreadsheet,
  BadgeDollarSign,
  HandCoins,
  CircleDollarSign,
  ReceiptText,
  ClipboardList,
  BookCheck,
  Stamp,
  Signature,
  FileCheck2,
  CheckCheck,
  Users,
  Building,
  Briefcase as BriefcaseIcon,
  GitBranch,
  Workflow,
  Timer,
  Hourglass,
  History,
  ExternalLink,
  Eye,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  ChartPie,
  ChartBar,
  ChartLine,
  Activity as ActivityIcon,
  Gauge as GaugeIcon,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Hooks
import {
  usePurchaseOrder,
  useApprovePurchaseOrder,
} from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

import type { RequisitionItem } from '@/types/requisition.types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

const formatCurrencyCompact = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'KES 0';
  if (num >= 1000000) return `KES ${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `KES ${(num / 1000).toFixed(1)}K`;
  return `KES ${Math.round(num).toLocaleString()}`;
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
// PO STATUS LABELS & COLORS
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

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700',
    pending_check: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    checked: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    pending_endorsement: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    pending_approval: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    issued: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    sent: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    acknowledged: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    partial: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    completed: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
    closed: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700',
  };
  return colors[status] || colors.draft;
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, any> = {
    draft: FileText,
    pending_check: Clock,
    checked: UserCheck,
    pending_endorsement: Stamp,
    pending_approval: Shield,
    issued: Send,
    sent: Send,
    acknowledged: CheckCircle,
    delivered: Truck,
    partial: AlertCircle,
    completed: CheckCircle2,
    cancelled: Ban,
    closed: FileCheck,
  };
  return icons[status] || FileText;
};

// ============================================
// STATUS BADGE
// ============================================

const StatusBadge = ({ status, size = 'default', showIcon = true }: { status: string; size?: 'sm' | 'default' | 'lg'; showIcon?: boolean }) => {
  const colorClass = getStatusColor(status);
  const Icon = getStatusIcon(status);
  const label = PO_STATUS_LABELS[status] || status;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    default: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <Badge
      className={cn(
        "font-medium rounded-full border transition-all duration-200",
        sizeClasses[size],
        colorClass,
        "hover:scale-105 cursor-default"
      )}
    >
      {showIcon && <Icon className={cn("inline", size === 'sm' ? 'h-3 w-3 mr-1' : 'h-3.5 w-3.5 mr-1.5')} />}
      {label}
    </Badge>
  );
};

// ============================================
// WORKFLOW STEP COMPONENT - HORIZONTAL
// ============================================

interface WorkflowStepProps {
  step: number;
  title: string;
  status: 'completed' | 'current' | 'pending';
  date?: string | null;
  by?: string;
}

const WorkflowStep = ({ step, title, status, date, by }: WorkflowStepProps) => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isPending = status === 'pending';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
          isCompleted && "bg-emerald-500 text-white shadow-md shadow-emerald-500/25",
          isCurrent && "bg-purple-500 text-white shadow-md shadow-purple-500/25 ring-4 ring-purple-500/20",
          isPending && "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
        )}>
          {isCompleted ? <Check className="h-5 w-5" /> : step}
        </div>
      </div>
      <p className={cn(
        "mt-2 text-sm font-medium text-center",
        isPending ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"
      )}>
        {title}
      </p>
      {isCompleted && date && (
        <p className="text-xs text-muted-foreground text-center">
          {formatDate(date)}
          {by && <span className="ml-1">by {by}</span>}
        </p>
      )}
      {isCurrent && (
        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium text-center">Action Required</p>
      )}
    </div>
  );
};

// ============================================
// MAIN APPROVE PAGE
// ============================================

export default function PurchaseOrderApprovePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { success, error } = useToast();
  const { user, isPrincipal, isFinalApprover, isAdmin } = useAuthContext();

  // ============================================
  // ALL HOOKS - CALLED AT TOP LEVEL
  // ============================================

  // State
  const [approveComment, setApproveComment] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  // Hooks
  const { data: po, isLoading, refetch } = usePurchaseOrder(id);
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData } = useAllSuppliers();
  const approveMutation = useApprovePurchaseOrder();

  // Check if user is authorized to approve
  const canApprove = useMemo(() => {
    return isPrincipal() || isFinalApprover() || isAdmin();
  }, [isPrincipal, isFinalApprover, isAdmin]);

  // Supplier info
  const supplier = useMemo(() => {
    if (!po?.supplier_id || !Array.isArray(suppliersData)) return null;
    return suppliersData.find((s: any) => s.id === po.supplier_id) || po.supplier;
  }, [po, suppliersData]);

  const supplierName = getSupplierName(supplier || po?.supplier);

  // Supplier contact info
  const supplierEmail = useMemo(() => {
    return supplier?.company_email || supplier?.email || po?.supplier?.email || 'No email';
  }, [supplier, po]);

  const supplierPhone = useMemo(() => {
    return supplier?.company_phone || supplier?.phone || po?.supplier?.phone || 'N/A';
  }, [supplier, po]);

  const supplierAddress = useMemo(() => {
    return supplier?.company_address || 'N/A';
  }, [supplier]);

  // Determine workflow status
  const isChecked = !!po?.checked_by;
  const isEndorsed = !!po?.endorsed_by;
  const isApproved = !!po?.approved_by;

  const canApproveOrder = isChecked && isEndorsed && !isApproved;

  // ============================================
  // ITEM ANALYSIS - WITH SUPPLIER-ADDED ITEMS
  // ============================================

  const itemAnalysis = useMemo(() => {
    if (!po?.items) return {
      total: 0,
      verified: 0,
      supplierAdded: 0,
      count: 0,
      matchRate: 0,
      canApprove: false
    };

    const poItems = po.items || [];
    const reqItems = po.requisition?.items || [];

    let verified = 0;
    let supplierAdded = 0;
    let count = 0;

    poItems.forEach((item: any) => {
      // Supplier-added items - no requisition_item_id
      if (!item.requisition_item_id) {
        supplierAdded++;
        verified++; // Count as verified for approval
        return;
      }

      const reqItem = reqItems.find((ri: any) => ri.id === item.requisition_item_id);
      if (reqItem) {
        count++;
        const nameMatch = item.item_name?.toLowerCase() === reqItem.item_name?.toLowerCase();
        const qtyMatch = item.quantity === reqItem.quantity;
        const unitMatch = item.unit_of_measure === reqItem.unit_of_measure;
        if (nameMatch && qtyMatch && unitMatch) verified++;
      }
    });

    const totalItems = poItems.length;
    const totalAcceptable = verified;
    const totalItemsForRate = totalItems > 0 ? totalItems : 1;

    // Can approve if all items are either verified OR supplier-added
    const canApprove = totalItems === (verified);

    return {
      total: totalItems,
      verified,
      supplierAdded,
      count,
      matchRate: Math.round((totalAcceptable / totalItemsForRate) * 100),
      canApprove
    };
  }, [po]);

  // ============================================
  // FINANCIAL ANALYSIS - WITH SUPPLIER-ADDED ITEMS
  // ============================================

  const financialAnalysis = useMemo(() => {
    if (!po?.items || !po?.requisition?.items) {
      return {
        estimatedTotal: 0,
        actualTotal: 0,
        difference: 0,
        savings: 0,
        isSaving: false,
        percentVariance: 0,
        itemCount: 0,
        averagePriceDiff: 0,
        budgetStatus: 'unknown' as 'on_budget' | 'under_budget' | 'over_budget',
        supplierAddedTotal: 0,
      };
    }

    const poItems = po.items || [];
    const reqItems = po.requisition.items || [];

    let estimatedTotal = 0;
    let actualTotal = 0;
    let supplierAddedTotal = 0;
    let count = 0;
    let totalPriceDiff = 0;

    poItems.forEach((item: any) => {
      const reqItem = reqItems.find((ri: any) => ri.id === item.requisition_item_id);
      const isSupplierAdded = !item.requisition_item_id;

      if (isSupplierAdded) {
        supplierAddedTotal += (item.unit_price || 0) * (item.quantity || 0);
        actualTotal += (item.unit_price || 0) * (item.quantity || 0);
      } else if (reqItem) {
        const estCost = (reqItem.estimated_unit_cost || 0) * (item.quantity || 0);
        const actCost = (item.unit_price || 0) * (item.quantity || 0);
        estimatedTotal += estCost;
        actualTotal += actCost;
        totalPriceDiff += (item.unit_price || 0) - (reqItem.estimated_unit_cost || 0);
        count++;
      } else {
        actualTotal += (item.unit_price || 0) * (item.quantity || 0);
      }
    });

    const difference = actualTotal - estimatedTotal;
    const savings = difference < 0 ? Math.abs(difference) : 0;
    const isSaving = difference < 0;
    const percentVariance = estimatedTotal > 0 ? (difference / estimatedTotal) * 100 : 0;
    const averagePriceDiff = count > 0 ? totalPriceDiff / count : 0;

    let budgetStatus: 'on_budget' | 'under_budget' | 'over_budget' = 'on_budget';
    if (Math.abs(percentVariance) < 5) budgetStatus = 'on_budget';
    else if (percentVariance < 0) budgetStatus = 'under_budget';
    else budgetStatus = 'over_budget';

    return {
      estimatedTotal,
      actualTotal,
      difference,
      savings,
      isSaving,
      percentVariance,
      itemCount: count,
      averagePriceDiff,
      budgetStatus,
      supplierAddedTotal,
    };
  }, [po]);

  // ============================================
  // PRICE COMPARISON ITEMS - WITH SUPPLIER-ADDED
  // ============================================

  const priceComparisonItems = useMemo(() => {
    if (!po?.items || !po?.requisition?.items) return [];

    const poItems = po.items || [];
    const reqItems = po.requisition.items || [];

    const results: any[] = [];

    poItems.forEach((item: any) => {
      const isSupplierAdded = !item.requisition_item_id;
      const reqItem = reqItems.find((ri: any) => ri.id === item.requisition_item_id);

      if (isSupplierAdded) {
        results.push({
          itemName: item.item_name,
          quantity: item.quantity,
          estimatedPrice: 0,
          actualPrice: item.unit_price || 0,
          difference: 0,
          percentDifference: 0,
          isSaving: false,
          totalEstimated: 0,
          totalActual: (item.unit_price || 0) * (item.quantity || 0),
          reqItem: null,
          isSupplierAdded: true,
        });
      } else if (reqItem) {
        const estPrice = reqItem.estimated_unit_cost || 0;
        const actPrice = item.unit_price || 0;
        const diff = actPrice - estPrice;
        const percentDiff = estPrice > 0 ? (diff / estPrice) * 100 : 0;

        results.push({
          itemName: item.item_name,
          quantity: item.quantity,
          estimatedPrice: estPrice,
          actualPrice: actPrice,
          difference: diff,
          percentDifference: percentDiff,
          isSaving: diff < 0,
          totalEstimated: estPrice * (item.quantity || 0),
          totalActual: actPrice * (item.quantity || 0),
          reqItem,
          isSupplierAdded: false,
        });
      }
    });

    return results;
  }, [po]);

  // Total savings and premiums
  const totalSavings = useMemo(() => {
    return priceComparisonItems.reduce((sum, item) => sum + (item.difference < 0 ? Math.abs(item.difference) * item.quantity : 0), 0);
  }, [priceComparisonItems]);

  const totalPremiums = useMemo(() => {
    return priceComparisonItems.reduce((sum, item) => sum + (item.difference > 0 ? item.difference * item.quantity : 0), 0);
  }, [priceComparisonItems]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleBack = () => router.push('/procurement/purchase-orders/pending-approval');

  const handleApprove = () => {
    setShowApproveDialog(true);
  };

  const handleConfirmApprove = () => {
    if (po) {
      approveMutation.mutate(
        { id: po.id, comment: approveComment || undefined },
        {
          onSuccess: () => {
            success(`Purchase Order ${po.po_number} approved successfully`);
            setShowApproveDialog(false);
            router.push('/procurement/purchase-orders/pending-approval');
          },
          onError: (err: any) => {
            error(err?.message || 'Failed to approve purchase order');
          }
        }
      );
    }
  };

  // ============================================
  // CONDITIONAL RETURNS - AFTER ALL HOOKS
  // ============================================

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate
        title="Approve Purchase Order"
        description="Loading..."
        icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Approval', href: '/procurement/purchase-orders/pending-approval' },
          { label: 'Approve' },
        ]}
      >
        <div className="space-y-6">
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    );
  }

  // Not found
  if (!po) {
    return (
      <PageTemplate
        title="Approve Purchase Order"
        description="Not found"
        icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Approval', href: '/procurement/purchase-orders/pending-approval' },
          { label: 'Approve' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-full w-fit mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Purchase Order Not Found</h3>
            <p className="text-muted-foreground">The purchase order you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Approval
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // Already approved
  if (isApproved) {
    return (
      <PageTemplate
        title="Approve Purchase Order"
        description="Already approved"
        icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Approval', href: '/procurement/purchase-orders/pending-approval' },
          { label: 'Approve' },
        ]}
      >
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-16 text-center">
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-14 w-14 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Already Approved</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This purchase order has already been approved by {(po as any)?.approved_by_user?.full_name || getUserName(po.approved_by)} on {formatDateTime(po.approved_at)}.
            </p>
            <Button onClick={handleBack} className="mt-6 rounded-xl px-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Approval
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // Not checked yet
  if (!isChecked) {
    return (
      <PageTemplate
        title="Approve Purchase Order"
        description="Not checked yet"
        icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Approval', href: '/procurement/purchase-orders/pending-approval' },
          { label: 'Approve' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-full w-fit mx-auto mb-4">
              <Clock className="h-12 w-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Waiting for HOD Check</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This purchase order has not been checked by the HOD yet. Please wait for the HOD to review it first.
            </p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Approval
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // Not endorsed yet
  if (!isEndorsed) {
    return (
      <PageTemplate
        title="Approve Purchase Order"
        description="Not endorsed yet"
        icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Approval', href: '/procurement/purchase-orders/pending-approval' },
          { label: 'Approve' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-full w-fit mx-auto mb-4">
              <Stamp className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Waiting for Accountant Endorsement</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This purchase order has not been endorsed by the Accountant yet. Please wait for the Accountant to review it first.
            </p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Approval
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // Access denied
  if (!canApprove) {
    return (
      <PageTemplate
        title="Approve Purchase Order"
        description="Access Denied"
        icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Approval', href: '/procurement/purchase-orders/pending-approval' },
          { label: 'Approve' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full w-fit mx-auto mb-4">
              <Ban className="h-12 w-12 text-rose-500" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Access Denied</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Only the Director/Finance Administrator or Principal can approve purchase orders.
            </p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Approval
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <PageTemplate
      title={`Approve: ${po.po_number}`}
      description={`Review and approve this purchase order from ${po.requisition?.department?.name || 'your department'}`}
      icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
        { label: 'Pending Approval', href: '/procurement/purchase-orders/pending-approval' },
        { label: po.po_number },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-3 py-1.5">
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  Final Approval
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Your role: Director/Principal</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* ✅ Show supplier-added items count */}
          {itemAnalysis.supplierAdded > 0 && (
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {itemAnalysis.supplierAdded} Supplier-Added Items
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="gap-2 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            className="h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
            onClick={handleApprove}
            disabled={approveMutation.isPending || !itemAnalysis.canApprove}
          >
            {approveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            {itemAnalysis.canApprove ? 'Approve Order' : 'Resolve Issues First'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ============================================ */}
        {/* STATUS ALERT - Updated for Supplier-Added Items */}
        {/* ============================================ */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Alert className={cn(
              "rounded-xl shadow-sm",
              itemAnalysis.supplierAdded > 0
                ? "bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/50 dark:border-purple-800/50"
                : "bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/50 dark:border-purple-800/50"
            )}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <AlertTitle className="text-purple-700 dark:text-purple-300 font-semibold">
                    {itemAnalysis.supplierAdded > 0
                      ? `Ready for Final Approval (${itemAnalysis.supplierAdded} Supplier-Added Items)`
                      : 'Ready for Final Approval'
                    }
                  </AlertTitle>
                  <AlertDescription className="text-purple-600 dark:text-purple-400">
                    This purchase order has been checked by HOD and endorsed by the Accountant.
                    {itemAnalysis.supplierAdded > 0 && ` ${itemAnalysis.supplierAdded} supplier-added items are included and have been reviewed.`}
                    Review the details below and approve to authorize issuance.
                  </AlertDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">{formatCurrency(po.total_amount)}</span>
                </div>
              </div>
            </Alert>
          </motion.div>
        </AnimatePresence>

        {/* ============================================ */}
        {/* WORKFLOW - HORIZONTAL */}
        {/* ============================================ */}

        <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Workflow className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Approval Workflow</h3>
              <Badge className="ml-auto rounded-full px-3 py-1 text-xs font-medium border-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                Awaiting Your Action
              </Badge>
            </div>

            <Separator className="mb-6" />

            <div className="grid grid-cols-4 gap-4">
              <WorkflowStep
                step={1}
                title="Draft Created"
                status="completed"
              />
              <WorkflowStep
                step={2}
                title="HOD Check"
                status="completed"
                date={po.checked_at}
                by={getUserName(po.checked_by)}
              />
              <WorkflowStep
                step={3}
                title="Accountant Endorsement"
                status="completed"
                date={po.endorsed_at}
                by={getUserName(po.endorsed_by)}
              />
              <WorkflowStep
                step={4}
                title="Final Approval"
                status="current"
              />
            </div>

            <Separator className="mt-6" />

            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progress</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Draft</span>
                <span>HOD Check</span>
                <span>Endorsement</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">Approval</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* PO HEADER CARD */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">PO Number</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">{po.po_number}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Type</p>
                  <div className="mt-0.5">
                    <Badge variant="outline" className="text-xs rounded-full">
                      {po.type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Amount</p>
                  <p className="text-sm font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">{formatCurrency(po.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Department</p>
                  <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{po.requisition?.department?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={po.status} size="sm" />
                  </div>
                </div>
              </div>

              <Separator className="my-4 bg-gray-200/50 dark:bg-gray-700/50" />

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Issue Date</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(po.issue_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Expected Delivery</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(po.expected_delivery_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Items</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{po.items?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Checked By</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{getUserName(po.checked_by)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Endorsed By</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Stamp className="h-3.5 w-3.5 text-blue-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{getUserName(po.endorsed_by)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* SUPPLIER CARD */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Supplier Information
                </CardTitle>
                <Badge variant="outline" className="rounded-full text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Verified Supplier
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex-shrink-0 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-base font-bold">
                      {getInitials(supplierName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">{supplierName}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{supplierEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{supplierPhone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{supplierAddress}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 md:pl-6 md:border-l border-gray-200 dark:border-gray-700">
                  {(supplier as any)?.company_registration && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Registration</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{(supplier as any).company_registration}</p>
                    </div>
                  )}
                  {(supplier as any)?.tax_id && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tax ID</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{(supplier as any).tax_id}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* ITEMS TABLE - WITH SUPPLIER-ADDED INDICATOR */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-base">Order Items</CardTitle>
                <Badge variant="outline" className="text-xs rounded-full">
                  {po.items?.length || 0} items
                </Badge>
                {itemAnalysis.supplierAdded > 0 && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 rounded-full text-xs">
                    <Sparkles className="h-3 w-3 mr-0.5" />
                    {itemAnalysis.supplierAdded} Added
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {!po.items || po.items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No items in this order</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <UITable>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-center">Unit</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {po.items.map((item: any, index: number) => {
                        const isSupplierAdded = !item.requisition_item_id;
                        return (
                          <TableRow key={item.id} className={isSupplierAdded ? "bg-purple-50/20 dark:bg-purple-950/10" : ""}>
                            <TableCell className="text-center text-xs text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {item.item_name}
                              {isSupplierAdded && (
                                <Badge className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 rounded-full text-[10px]">
                                  <Sparkles className="h-3 w-3 mr-0.5" />
                                  Supplier Added
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">{item.formatted_quantity || item.quantity}</TableCell>
                            <TableCell className="text-center">{item.unit_of_measure || '—'}</TableCell>
                            <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency((item.unit_price || 0) * (item.quantity || 0))}
                            </TableCell>
                            <TableCell className="text-center">
                              {isSupplierAdded ? (
                                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 rounded-full text-[10px]">
                                  <Sparkles className="h-3 w-3 mr-0.5" />
                                  Added
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 rounded-full text-[10px]">
                                  <Check className="h-3 w-3 mr-0.5" />
                                  Requisition
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </UITable>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* COST SUMMARY */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Subtotal</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(po.total_amount || 0)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tax Amount</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(po.tax_amount || 0)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Discount</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(0)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(po.total_amount || 0)}</p>
                </div>
              </div>

              {/* ✅ Supplier-Added Items Total */}
              {financialAnalysis.supplierAddedTotal > 0 && (
                <div className="mt-3 p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-purple-700 dark:text-purple-300">
                      <strong>{itemAnalysis.supplierAdded}</strong> supplier-added items totaling{' '}
                      <strong>{formatCurrency(financialAnalysis.supplierAddedTotal)}</strong> are included in this order.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* TERMS & CONDITIONS */}
        {/* ============================================ */}
        {(po.delivery_terms || po.payment_terms || po.special_conditions) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {po.delivery_terms && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                        <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Delivery Terms</p>
                        <p className="text-sm text-gray-900 dark:text-white mt-0.5">{po.delivery_terms}</p>
                      </div>
                    </div>
                  )}
                  {po.payment_terms && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0">
                        <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Terms</p>
                        <p className="text-sm text-gray-900 dark:text-white mt-0.5">{po.payment_terms}</p>
                      </div>
                    </div>
                  )}
                  {po.special_conditions && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl md:col-span-2">
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Special Conditions</p>
                        <p className="text-sm text-gray-900 dark:text-white mt-0.5">{po.special_conditions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* FINAL AUTHORIZATION SUMMARY - Updated */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className={cn(
            "border-0 shadow-sm rounded-xl overflow-hidden border-l-[6px]",
            itemAnalysis.supplierAdded > 0 ? "border-l-purple-500" : "border-l-purple-500"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                    {itemAnalysis.supplierAdded > 0 ? 'Final Authorization (Supplier-Added Items Included)' : 'Final Authorization'}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    By approving this purchase order, you are authorizing the issuance of <span className="font-bold text-purple-600 dark:text-purple-400">{po.po_number}</span> to <span className="font-medium">{supplierName}</span> for the total amount of <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(po.total_amount)}</span>.
                    {itemAnalysis.supplierAdded > 0 && (
                      <> This includes <span className="font-medium text-purple-600 dark:text-purple-400">{itemAnalysis.supplierAdded} supplier-added items</span> totaling <span className="font-bold text-purple-600 dark:text-purple-400">{formatCurrency(financialAnalysis.supplierAddedTotal)}</span>.</>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-5 mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        HOD Check: <span className="font-medium">✓ Complete</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Accountant Endorsement: <span className="font-medium">✓ Complete</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Your Action: <span className="font-medium text-purple-600 dark:text-purple-400">Pending Approval</span>
                      </span>
                    </div>
                    {itemAnalysis.supplierAdded > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Supplier Added: <span className="font-medium text-purple-600 dark:text-purple-400">{itemAnalysis.supplierAdded} items</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* APPROVE DIALOG - Updated */}
      {/* ============================================ */}

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="rounded-xl dark:bg-gray-900 max-w-lg border-0 shadow-2xl p-0 overflow-hidden">
          <div className="p-6 pb-0">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/25">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-gray-900 dark:text-gray-100 text-xl font-bold">
                    Confirm Approval
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    You are about to approve purchase order <span className="font-mono font-medium">{po?.po_number}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Amount</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{formatCurrency(po?.total_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                <Badge className="mt-1 border-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-full px-3 py-1">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3 w-3" />
                    <span>Pending Approval</span>
                  </div>
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">PO Number</p>
                <p className="font-semibold text-gray-900 dark:text-white font-mono">{po?.po_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Supplier</p>
                <p className="font-semibold text-gray-900 dark:text-white truncate">{supplierName}</p>
              </div>
            </div>

            {/* ✅ Supplier-Added Items Summary in Dialog */}
            {itemAnalysis.supplierAdded > 0 && (
              <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>
                    <strong>{itemAnalysis.supplierAdded}</strong> supplier-added items totaling{' '}
                    <strong>{formatCurrency(financialAnalysis.supplierAddedTotal)}</strong> are included in this order.
                  </span>
                </div>
              </div>
            )}

            {/* Workflow Summary */}
            <div className="p-3 bg-muted/30 rounded-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Workflow Status:</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 rounded-full px-2 py-0 h-5 text-[10px]">
                    ✓ Checked
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 rounded-full px-2 py-0 h-5 text-[10px]">
                    ✓ Endorsed
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 rounded-full px-2 py-0 h-5 text-[10px]">
                    ⏳ Approving
                  </Badge>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">Approval Note <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Textarea
                placeholder="Add any approval notes or conditions..."
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 focus-visible:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2.5 p-3.5 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <span className="leading-relaxed">
                By approving, you authorize the issuance of this purchase order and commit the funds.
                {itemAnalysis.supplierAdded > 0 && ' Supplier-added items have been reviewed and approved by HOD and Accountant.'}
              </span>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20 gap-2">
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="rounded-xl px-6">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApprove}
              disabled={approveMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 text-white transition-all duration-300 px-6"
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
