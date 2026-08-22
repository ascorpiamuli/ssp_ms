// frontend/src/app/(dashboard)/procurement/purchase-orders/track-orders/page.tsx

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
  FileText,
  Package,
  Truck,
  DollarSign,
  Building2,
  RefreshCw,
  FileCheck,
  AlertTriangle,
  Info,
  Handshake,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  CreditCard,
  Receipt,
  Send,
  Sparkles,
  Zap,
  Rocket,
  Shield,
  Award,
  Gem,
  TrendingUp,
  Activity,
  ChevronRight,
  ArrowRight,
  Star,
  BadgeCheck,
  Circle,
  CircleCheck,
  CircleDot,
  Crown,
  Bell,
  BellRing,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  LayoutGrid,
  List,
  Table,
  Grid,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  Target,
  Flag,
  Milestone,
  Route,
  Compass,
  Navigation,
  Waypoints,
  History,
  BookOpen,
  GraduationCap,
  BarChart3,
  LineChart,
  PieChart,
  Layers,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Workflow,
  RefreshCcw,
  RotateCw,
  Repeat,
  Share2,
  ExternalLink,
  Link2,
  Copy,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  ListChecks,
  CheckSquare,
  Square,
  SquareCheck,
  Radio,
  RadioTower,
  Signal,
  Wifi,
  WifiOff,
  UserCheck,
  MessagesSquare,
  Megaphone,
  BellPlus,
  BellOff,
  CircleAlert,
  TriangleAlert,
  OctagonAlert,
  Flame,
  Bug,
  Ban,
  ShieldAlert,
  ShieldCheck as ShieldCheckIcon,
  ShieldQuestion,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  MoreHorizontal,
  MoreVertical,
  Maximize2,
  Minimize2,
  Download as DownloadIcon,
  Printer,
  Share,
  Link,
  Copy as CopyIcon,
  Plus,
  Minus,
  EyeOff,
  RotateCcw,
  Timer,
  Hourglass,
  CalendarDays,
  BarChart,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Gauge,
  CheckCheck,
  CircleSlash,
  CircleOff,
  CircleDashed,
  CircleDotDashed,
  ToggleLeft,
  ToggleRight,
  MoveHorizontal,
  MoveVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useToast } from '@/components/ui/toast-context';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import {
  usePurchaseOrders,
  useGetPurchaseOrderPdf,
} from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder.types';
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'KES 0.00';
  return `KES ${Number(numAmount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getUserName = (userObj: any): string => {
  if (!userObj) return '—';
  if (typeof userObj === 'object' && userObj !== null) {
    return userObj.full_name || userObj.name || 'Unknown';
  }
  if (typeof userObj === 'string') return userObj;
  return '—';
};

const formatStepDate = (date: string | null | undefined): string => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd/MM/yy HH:mm');
  } catch {
    return '';
  }
};

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_STEPS = [
  { id: 'draft', label: 'Draft', icon: FileText, color: 'gray' },
  { id: 'pending_check', label: 'Check', icon: UserCheck, color: 'amber' },
  { id: 'pending_endorsement', label: 'Endorse', icon: CreditCard, color: 'blue' },
  { id: 'pending_approval', label: 'Approve', icon: Shield, color: 'purple' },
  { id: 'issued', label: 'Issued', icon: Send, color: 'indigo' },
  { id: 'sent', label: 'Sent', icon: Mail, color: 'indigo' },
  { id: 'acknowledged', label: 'Ack\'d', icon: Handshake, color: 'emerald' },
  { id: 'delivered', label: 'Delivered', icon: Truck, color: 'blue' },
  { id: 'completed', label: 'Complete', icon: FileCheck, color: 'teal' },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'red' },
  { id: 'closed', label: 'Closed', icon: FileCheck, color: 'gray' },
];

const STATUS_ORDER = STATUS_STEPS.map(s => s.id);

const statusOrderMap: Record<string, number> = {};
STATUS_ORDER.forEach((id, index) => {
  statusOrderMap[id] = index;
});

const getStatusStepIndex = (status: string): number => {
  return statusOrderMap[status] ?? -1;
};

const isStepCompleted = (order: PurchaseOrder, stepId: string): boolean => {
  const status = order.status;

  if (status === 'cancelled' || status === 'closed') {
    const orderIndex = getStatusStepIndex(status);
    const stepIndex = getStatusStepIndex(stepId);
    return stepIndex <= orderIndex;
  }

  switch (stepId) {
    case 'draft': return true;
    case 'pending_check': return !!(order.checked_at && order.checked_by);
    case 'pending_endorsement': return !!(order.endorsed_at && order.endorsed_by);
    case 'pending_approval': return !!(order.approved_at && order.approved_by);
    case 'issued': return !!order.issued_at || ['issued', 'sent', 'acknowledged', 'delivered', 'completed'].includes(status);
    case 'sent': return !!order.sent_at || ['sent', 'acknowledged', 'delivered', 'completed'].includes(status);
    case 'acknowledged': return !!order.acknowledged_at || ['acknowledged', 'delivered', 'completed'].includes(status);
    case 'delivered': return !!order.actual_delivery_date || ['delivered', 'completed'].includes(status);
    case 'completed': return !!order.completed_at || status === 'completed';
    default: return false;
  }
};

const isStepCurrent = (order: PurchaseOrder, stepId: string): boolean => {
  const status = order.status;
  if (status === 'cancelled' || status === 'closed') return false;
  if (isStepCompleted(order, stepId)) return false;

  const stepIndex = getStatusStepIndex(stepId);
  if (stepIndex <= 0) return true;

  const prevStepId = STATUS_ORDER[stepIndex - 1];
  return isStepCompleted(order, prevStepId);
};

const getStepStatus = (order: PurchaseOrder, stepId: string): { label: string; isCompleted: boolean; isCurrent: boolean } => {
  const completed = isStepCompleted(order, stepId);
  const current = isStepCurrent(order, stepId);
  if (completed) return { label: 'Done', isCompleted: true, isCurrent: false };
  if (current) return { label: 'Active', isCompleted: false, isCurrent: true };
  return { label: 'Pending', isCompleted: false, isCurrent: false };
};

const getStepUser = (order: PurchaseOrder, stepId: string): string | null => {
  switch (stepId) {
    case 'pending_check':
      return getUserName(order.checked_by);
    case 'pending_endorsement':
      return getUserName(order.endorsed_by);
    case 'pending_approval':
      return getUserName(order.approved_by);
    default:
      return null;
  }
};

const getStepDate = (order: PurchaseOrder, stepId: string): string | null => {
  switch (stepId) {
    case 'draft': return order.created_at;
    case 'pending_check': return order.checked_at;
    case 'pending_endorsement': return order.endorsed_at;
    case 'pending_approval': return order.approved_at;
    case 'issued': return order.issued_at;
    case 'sent': return order.sent_at;
    case 'acknowledged': return order.acknowledged_at;
    case 'delivered': return order.actual_delivery_date;
    case 'completed': return order.completed_at;
    default: return null;
  }
};

// ============================================
// ORDER STATUS BADGE
// ============================================

const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    draft: { label: 'Draft', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700', icon: FileText },
    pending_check: { label: 'Pending Check', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800', icon: UserCheck },
    pending_endorsement: { label: 'Pending Endorsement', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800', icon: CreditCard },
    pending_approval: { label: 'Pending Approval', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800', icon: Shield },
    issued: { label: 'Issued', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800', icon: Send },
    sent: { label: 'Sent', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800', icon: Mail },
    acknowledged: { label: 'Acknowledged', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', icon: Handshake },
    delivered: { label: 'Delivered', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800', icon: Truck },
    completed: { label: 'Completed', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800', icon: FileCheck },
    cancelled: { label: 'Cancelled', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700', icon: XCircle },
    closed: { label: 'Closed', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700', icon: FileCheck },
  };
  return config[status] || config.draft;
};

interface OrderStatusBadgeProps {
  status: string;
  size?: 'sm' | 'default' | 'lg';
}

const OrderStatusBadge = ({ status, size = 'default' }: OrderStatusBadgeProps) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  const sizeClasses = { sm: 'text-[10px] px-2 py-0.5 gap-1', default: 'text-xs px-3 py-1 gap-1.5', lg: 'text-sm px-4 py-1.5 gap-2' };

  return (
    <div className={cn("inline-flex items-center font-medium rounded-full border", config.bg, config.color, sizeClasses[size])}>
      <Icon className={cn("flex-shrink-0", size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
      {config.label}
    </div>
  );
};

// ============================================
// ORDER STATUS TIMELINE CELL - FULL INFO VISIBLE
// ============================================

interface OrderTimelineCellProps {
  order: PurchaseOrder;
  stepId: string;
  stepLabel: string;
  stepIcon: any;
}

const OrderTimelineCell = ({ order, stepId, stepLabel, stepIcon: Icon }: OrderTimelineCellProps) => {
  const { isCompleted, isCurrent, label } = getStepStatus(order, stepId);
  const isCancelled = order.status === 'cancelled' || order.status === 'closed';
  const date = getStepDate(order, stepId);
  const user = getStepUser(order, stepId);
  const formattedDate = formatStepDate(date);

  if (isCancelled && !isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-1 min-h-[90px]">
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
          <CircleSlash className="h-4 w-4 text-gray-400" />
        </div>
        <span className="text-[9px] text-muted-foreground mt-0.5">N/A</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-1 min-h-[90px]">
      {/* Step Circle */}
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300",
        isCompleted && !isCurrent && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md shadow-emerald-500/20",
        isCurrent && "border-amber-500 bg-amber-50 dark:bg-amber-950/30 ring-3 ring-amber-500/30 animate-pulse shadow-md shadow-amber-500/20",
        !isCompleted && !isCurrent && "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
      )}>
        {isCompleted && !isCurrent ? (
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
        ) : isCurrent ? (
          <Loader2 className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 animate-spin" />
        ) : (
          <Icon className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
        )}
      </div>

      {/* Label */}
      <span className={cn(
        "text-[10px] font-semibold mt-1 text-center leading-tight",
        isCompleted && !isCurrent ? "text-emerald-700 dark:text-emerald-400" :
          isCurrent ? "text-amber-700 dark:text-amber-400" :
            "text-gray-400 dark:text-gray-500"
      )}>
        {stepLabel}
      </span>

      {/* User Name */}
      {user && (
        <span className="text-[8px] text-muted-foreground mt-0.5 truncate max-w-[65px] text-center leading-tight">
          {user}
        </span>
      )}

      {/* Date/Time */}
      {formattedDate && (
        <span className="text-[7px] text-muted-foreground/70 mt-0.5 truncate max-w-[65px] text-center leading-tight">
          {formattedDate}
        </span>
      )}

      {/* Status Badge */}
      <div className="mt-0.5">
        {isCompleted && !isCurrent && (
          <span className="text-[7px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">✓</span>
        )}
        {isCurrent && (
          <span className="text-[7px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 animate-pulse">⟳</span>
        )}
        {!isCompleted && !isCurrent && (
          <span className="text-[7px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/30 px-1.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">○</span>
        )}
      </div>
    </div>
  );
};

// ============================================
// LOADING SKELETON
// ============================================

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-96 rounded-xl" />
  </div>
);

// ============================================
// MAIN PAGE
// ============================================

export default function TrackOrdersPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: ordersData, isLoading, refetch } = usePurchaseOrders();
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: suppliersLoading } = useAllSuppliers();

  const getOrdersArray = useCallback((data: any): PurchaseOrder[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.success && data.data && Array.isArray(data.data)) return data.data;
    return [];
  }, []);

  const orders = useMemo(() => getOrdersArray(ordersData), [ordersData, getOrdersArray]);

  const supplierMap: Record<number, any> = useMemo(() => {
    const map: Record<number, any> = {};
    if (Array.isArray(suppliersData)) {
      suppliersData.forEach((s: any) => {
        if (s && typeof s === 'object' && 'id' in s) {
          map[s.id] = s;
        }
      });
    }
    return map;
  }, [suppliersData]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order: PurchaseOrder) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (typeFilter !== 'all' && order.type !== typeFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const supplier = supplierMap[order.supplier_id];
        const supplierName = supplier?.company_name || supplier?.full_name || '';
        return order.po_number.toLowerCase().includes(search) ||
          order.title?.toLowerCase().includes(search) ||
          supplierName.toLowerCase().includes(search);
      }
      return true;
    });
  }, [orders, searchTerm, statusFilter, typeFilter, supplierMap]);

  const stats = useMemo(() => {
    const total = orders.length;
    const draft = orders.filter((o: PurchaseOrder) => o.status === 'draft').length;
    const pendingCheck = orders.filter((o: PurchaseOrder) => o.status === ('pending_check' as PurchaseOrderStatus)).length;
    const pendingEndorsement = orders.filter((o: PurchaseOrder) => o.status === ('pending_endorsement' as PurchaseOrderStatus)).length;
    const pendingApproval = orders.filter((o: PurchaseOrder) => o.status === ('pending_approval' as PurchaseOrderStatus)).length;
    const inProgress = orders.filter((o: PurchaseOrder) => ['issued', 'sent', 'acknowledged', 'delivered'].includes(o.status)).length;
    const completed = orders.filter((o: PurchaseOrder) => o.status === 'completed' || o.status === 'closed').length;
    const cancelled = orders.filter((o: PurchaseOrder) => o.status === 'cancelled').length;
    return { total, draft, pendingCheck, pendingEndorsement, pendingApproval, inProgress, completed, cancelled };
  }, [orders]);

  const handleRefresh = () => refetch();

  const handleRowClick = (orderId: number) => {
    router.push(`/procurement/purchase-orders/${orderId}`);
  };

  const statsItems: StatCardItem[] = useMemo(() => [
    { label: 'Total Orders', value: stats.total, icon: FileText, tagLabel: 'TOTAL', tagColor: 'blue' as const, subtitle: 'All purchase orders' },
    { label: 'Draft', value: stats.draft, icon: FileText, tagLabel: 'DRAFT', tagColor: 'gray' as const, subtitle: 'Awaiting workflow' },
    { label: 'Pending Check', value: stats.pendingCheck, icon: UserCheck, tagLabel: 'PENDING', tagColor: 'amber' as const, subtitle: 'Awaiting HOD check' },
    { label: 'Pending Endorsement', value: stats.pendingEndorsement, icon: CreditCard, tagLabel: 'PENDING', tagColor: 'blue' as const, subtitle: 'Awaiting Accountant' },
    { label: 'Pending Approval', value: stats.pendingApproval, icon: Shield, tagLabel: 'PENDING', tagColor: 'purple' as const, subtitle: 'Awaiting Director' },
  ], [stats]);

  const timelineHeaders = STATUS_STEPS.filter(s => s.id !== 'cancelled' && s.id !== 'closed');

  if (isLoading || suppliersLoading) {
    return (
      <PageTemplate
        title="Track Orders"
        description="Loading orders..."
        icon={<Target className="h-5 w-5 text-emerald-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[{ label: 'Procurement', href: '/procurement' }, { label: 'Track Orders' }]}
      >
        <LoadingSkeleton />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Track Orders"
      description="Monitor all purchase orders and their progress through the workflow"
      icon={<Target className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[{ label: 'Procurement', href: '/procurement' }, { label: 'Track Orders' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm">
            <Printer className="h-3.5 w-3.5" />
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <StatsCards stats={statsItems} isLoading={isLoading} columns={5} variant="default" formatCompact={true} />

        <Card className="border shadow-sm rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by LPO number, title, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 rounded-xl bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[150px] rounded-xl bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_STEPS.map((step) => (
                      <SelectItem key={step.id} value={step.id}>{step.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[130px] rounded-xl bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="lpo">LPO (Goods)</SelectItem>
                    <SelectItem value="lso">LSO (Services)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
        >
          <Card className="border shadow-sm rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Order Tracking
                  <UIBadge variant="secondary" className="ml-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {filteredOrders.length}
                  </UIBadge>
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Showing {filteredOrders.length} of {orders.length}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                  </motion.div>
                  <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'No orders match your current filters. Try adjusting your search criteria.'
                      : 'No purchase orders have been created yet.'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <TableComponent>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-10 text-center">#</TableHead>
                          <TableHead className="min-w-[150px]">LPO Number</TableHead>
                          <TableHead className="min-w-[160px]">Supplier</TableHead>
                          <TableHead className="text-center w-[70px]">Type</TableHead>
                          <TableHead className="text-right w-[120px]">Amount</TableHead>
                          {timelineHeaders.map((step) => (
                            <TableHead key={step.id} className="text-center min-w-[100px]">
                              <div className="flex flex-col items-center">
                                <step.icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight font-medium">{step.label}</span>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order: PurchaseOrder, index: number) => {
                          const supplier = supplierMap[order.supplier_id];
                          const supplierName = supplier?.company_name || supplier?.full_name || 'Unknown';
                          const isCancelled = order.status === 'cancelled' || order.status === 'closed';

                          return (
                            <TableRow
                              key={order.id}
                              className={cn(
                                "hover:bg-muted/50 transition-colors cursor-pointer group",
                                isCancelled && "opacity-60"
                              )}
                              onClick={() => handleRowClick(order.id)}
                            >
                              <TableCell className="text-center text-muted-foreground text-xs font-mono">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline text-sm">
                                  {order.po_number}
                                </p>
                                <p className="text-[11px] text-muted-foreground">{order.title || 'N/A'}</p>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                                    <span className="text-[10px] font-bold text-white">
                                      {getInitials(supplierName)}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium truncate max-w-[130px]">{supplierName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <UIBadge variant="outline" className={cn(
                                  "rounded-full text-[13px] px-2.5 py-0.5 ",
                                  order.type === 'lpo' ? "border-blue-200 text-blue-600 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950/30" : "border-purple-200 text-purple-600 bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:bg-purple-950/30"
                                )}>
                                  {order.type === 'lpo' ? 'LPO' : 'LSO'}
                                </UIBadge>
                              </TableCell>
                              <TableCell className="text-right font-medium text-sm">
                                {formatCurrency(order.total_amount)}
                              </TableCell>
                              {timelineHeaders.map((step) => (
                                <TableCell key={step.id} className="p-1">
                                  <OrderTimelineCell order={order} stepId={step.id} stepLabel={step.label} stepIcon={step.icon} />
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </TableComponent>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Card className="border shadow-sm rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <span className="font-medium text-muted-foreground">Legend:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 ring-2 ring-amber-500/30">
                  <Loader2 className="h-3 w-3 text-amber-600 animate-spin" />
                </div>
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                  <span className="text-[8px] font-medium text-gray-400">●</span>
                </div>
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30">
                  <XCircle className="h-3 w-3 text-red-500" />
                </div>
                <span className="text-sm">Cancelled/Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
