// frontend/src/app/(dashboard)/procurement/delivery-notes/tracking/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
import { format } from 'date-fns';
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
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useToast } from '@/components/ui/toast-context';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import {
  useGrns,
  useSans,
} from '@/hooks/useGoodsReceived';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

// Types
import type {
  GoodsReceivedNote,
  ServiceAcknowledgmentNote,
} from '@/types/goodsReceived.types';

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

const getSupplierCompanyName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

const getDepartmentName = (item: any): string => {
  const dept = item.department || item.requisition?.department || null;
  return dept?.name || 'N/A';
};

const getDepartmentId = (item: any): number | null => {
  const dept = item.department || item.requisition?.department || null;
  return dept?.id || item.requisition?.department_id || null;
};

const getItemNumber = (item: any): string => {
  return item.grn_number || item.san_number || 'N/A';
};

const getItemType = (item: any): 'grn' | 'san' => {
  return item.grn_number ? 'grn' : 'san';
};

const getItemStatus = (item: any): string => {
  return item.status || 'draft';
};

const getItemDate = (item: any): string => {
  return item.received_date || item.acknowledgment_date || item.created_at || '';
};

const getItemTotal = (item: any): number => {
  return parseFloat(item.total_value || item.net_total || 0);
};

// ✅ Helper to get supplier display name
const getSupplierDisplayName = (item: any): string => {
  // For SANs, use service_provider
  if (item.service_provider) {
    return item.service_provider;
  }
  // Use purchase_order supplier_name
  if (item.purchase_order?.supplier_name) {
    return item.purchase_order.supplier_name;
  }
  // Fallback to supplier object
  if (item.purchase_order?.supplier) {
    return getSupplierCompanyName(item.purchase_order.supplier);
  }
  // Last resort - check _supplier_name from mapping
  if (item._supplier_name) {
    return item._supplier_name;
  }
  return 'Unknown Supplier';
};

// ============================================
// STATUS CONFIG - EITHER HOD OR PRINCIPAL (NOT BOTH)
// ============================================

const STATUS_STEPS = [
  { id: 'draft', label: 'Draft', icon: FileText, color: 'gray' },
  { id: 'submitted', label: 'Submitted', icon: Send, color: 'amber' },
  { id: 'approved', label: 'Approved', icon: Shield, color: 'emerald' },
  { id: 'completed', label: 'Completed', icon: FileCheck, color: 'teal' },
  { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' },
];

const STATUS_ORDER = STATUS_STEPS.map(s => s.id);

const statusOrderMap: Record<string, number> = {};
STATUS_ORDER.forEach((id, index) => {
  statusOrderMap[id] = index;
});

const getStatusStepIndex = (status: string): number => {
  return statusOrderMap[status] ?? -1;
};

const isStepCompleted = (item: any, stepId: string): boolean => {
  const status = item.status;

  if (status === 'rejected') {
    return stepId === 'draft' || stepId === 'submitted';
  }

  switch (stepId) {
    case 'draft': return true;
    case 'submitted': return status === 'submitted' || status === 'hod_approved' || status === 'principal_approved' || status === 'completed';
    case 'approved': return status === 'hod_approved' || status === 'principal_approved' || status === 'completed';
    case 'completed': return status === 'completed';
    default: return false;
  }
};

const isStepCurrent = (item: any, stepId: string): boolean => {
  const status = item.status;
  if (status === 'rejected') return false;
  if (isStepCompleted(item, stepId)) return false;

  const stepIndex = getStatusStepIndex(stepId);
  if (stepIndex <= 0) return true;

  const prevStepId = STATUS_ORDER[stepIndex - 1];
  return isStepCompleted(item, prevStepId);
};

const getStepStatus = (item: any, stepId: string): { label: string; isCompleted: boolean; isCurrent: boolean } => {
  const completed = isStepCompleted(item, stepId);
  const current = isStepCurrent(item, stepId);
  if (completed) return { label: 'Done', isCompleted: true, isCurrent: false };
  if (current) return { label: 'Active', isCompleted: false, isCurrent: true };
  return { label: 'Pending', isCompleted: false, isCurrent: false };
};

const getStepDate = (item: any, stepId: string): string | null => {
  switch (stepId) {
    case 'draft': return item.created_at;
    case 'submitted': return item.submitted_at || item.updated_at;
    case 'approved': return item.hod_approved_at || item.principal_approved_at;
    case 'completed': return item.completed_at || item.updated_at;
    default: return null;
  }
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
// STATUS BADGE
// ============================================

const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    draft: { label: 'Draft', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700', icon: FileText },
    submitted: { label: 'Submitted', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800', icon: Send },
    hod_approved: { label: 'Approved', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', icon: Shield },
    principal_approved: { label: 'Approved', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', icon: Shield },
    completed: { label: 'Completed', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800', icon: FileCheck },
    rejected: { label: 'Rejected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800', icon: XCircle },
  };
  return config[status] || config.draft;
};

interface ItemStatusBadgeProps {
  status: string;
  size?: 'sm' | 'default' | 'lg';
}

const ItemStatusBadge = ({ status, size = 'default' }: ItemStatusBadgeProps) => {
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
// TIMELINE CELL
// ============================================

interface DeliveryTimelineCellProps {
  item: any;
  stepId: string;
  stepLabel: string;
  stepIcon: any;
}

const DeliveryTimelineCell = ({ item, stepId, stepLabel, stepIcon: Icon }: DeliveryTimelineCellProps) => {
  const { isCompleted, isCurrent, label } = getStepStatus(item, stepId);
  const isRejected = item.status === 'rejected';
  const date = getStepDate(item, stepId);
  const formattedDate = formatStepDate(date);

  if (isRejected && !isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-1 min-h-[70px]">
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
          <CircleSlash className="h-4 w-4 text-gray-400" />
        </div>
        <span className="text-[9px] text-muted-foreground mt-0.5">N/A</span>
      </div>
    );
  }

  // Get the approver name if this is the approved step
  let approverName = null;
  if (stepId === 'approved') {
    const hodApprovedBy = item.hod_approved_by;
    const principalApprovedBy = item.principal_approved_by;
    if (hodApprovedBy) {
      approverName = getUserName(hodApprovedBy);
    } else if (principalApprovedBy) {
      approverName = getUserName(principalApprovedBy);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-1 min-h-[70px]">
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

      <span className={cn(
        "text-[10px] font-semibold mt-1 text-center leading-tight",
        isCompleted && !isCurrent ? "text-emerald-700 dark:text-emerald-400" :
          isCurrent ? "text-amber-700 dark:text-amber-400" :
            "text-gray-400 dark:text-gray-500"
      )}>
        {stepLabel}
      </span>

      {approverName && isCompleted && (
        <span className="text-[8px] text-muted-foreground mt-0.5 truncate max-w-[65px] text-center leading-tight">
          by {approverName}
        </span>
      )}

      {formattedDate && (
        <span className="text-[7px] text-muted-foreground/70 mt-0.5 truncate max-w-[65px] text-center leading-tight">
          {formattedDate}
        </span>
      )}

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
    <Skeleton className="h-96 rounded-xl" />
  </div>
);

// ============================================
// MAIN PAGE
// ============================================

export default function DeliveryTrackingPage() {
  const router = useRouter();
  const { success, error } = useToast();

  // Auth context
  const { isHOD, user } = useAuthContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Hooks
  const { data: grnsResponse, isLoading: isLoadingGrns, refetch: refetchGrns } = useGrns({});
  const { data: sansResponse, isLoading: isLoadingSans, refetch: refetchSans } = useSans({});
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: suppliersLoading } = useAllSuppliers();

  const getItemsArray = useCallback((data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.success && data.data && Array.isArray(data.data)) return data.data;
    return [];
  }, []);

  const grns = useMemo(() => getItemsArray(grnsResponse), [grnsResponse, getItemsArray]);
  const sans = useMemo(() => getItemsArray(sansResponse), [sansResponse, getItemsArray]);

  // Combine GRNs and SANs into a single list with proper supplier name
  const allItems = useMemo(() => {
    const grnItems = grns.map((g: any) => ({
      ...g,
      _type: 'grn' as const,
      _date: g.received_date || g.created_at || '',
      _number: g.grn_number,
      _supplier_id: g.purchase_order?.supplier_id || null,
      _supplier_name: g.purchase_order?.supplier_name || null,
      _supplier: g.purchase_order?.supplier || null,
      _department: g.department || g.requisition?.department || null,
    }));

    const sanItems = sans.map((s: any) => ({
      ...s,
      _type: 'san' as const,
      _date: s.acknowledgment_date || s.created_at || '',
      _number: s.san_number,
      _supplier_id: s.purchase_order?.supplier_id || null,
      _supplier_name: s.purchase_order?.supplier_name || s.service_provider || null,
      _supplier: s.purchase_order?.supplier || null,
      _department: s.department || s.requisition?.department || null,
    }));

    return [...grnItems, ...sanItems];
  }, [grns, sans]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item: any) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (typeFilter !== 'all' && item._type !== typeFilter) return false;

      // Filter by department for HODs
      if (isHOD() && user?.department_id) {
        const deptId = item._department?.id || item.requisition?.department_id || null;
        if (deptId !== user.department_id) return false;
      }

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const supplierName = getSupplierDisplayName(item);
        return item._number.toLowerCase().includes(search) ||
          supplierName.toLowerCase().includes(search) ||
          (item.reference_number || '').toLowerCase().includes(search) ||
          (item.service_provider || '').toLowerCase().includes(search);
      }
      return true;
    });
  }, [allItems, searchTerm, statusFilter, typeFilter, isHOD, user]);

  const handleRefresh = () => {
    refetchGrns();
    refetchSans();
    success('Delivery tracking refreshed');
  };

  const handleRowClick = (item: any) => {
    const path = item._type === 'grn'
      ? `/procurement/delivery-notes/goods-received/${item.id}`
      : `/procurement/delivery-notes/service-acknowledgment/${item.id}`;
    router.push(path);
  };

  const isLoading = isLoadingGrns || isLoadingSans || suppliersLoading;

  if (isLoading) {
    return (
      <PageTemplate
        title="Delivery Tracking"
        description="Loading deliveries..."
        icon={<Truck className="h-5 w-5 text-emerald-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
          { label: 'Tracking' },
        ]}
      >
        <LoadingSkeleton />
      </PageTemplate>
    );
  }

  // Timeline headers - simplified to 4 steps
  const timelineHeaders = STATUS_STEPS.filter(s => s.id !== 'rejected');

  return (
    <PageTemplate
      title="Delivery Tracking"
      description="Monitor all goods received notes and service acknowledgment notes through their workflow"
      icon={<Truck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
        { label: 'Tracking' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card className="border shadow-sm rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by GRN/SAN number, supplier, or reference..."
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
                    <SelectItem value="grn">GRN</SelectItem>
                    <SelectItem value="san">SAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
        >
          <Card className="border shadow-sm rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  Delivery Tracking
                  <UIBadge variant="secondary" className="ml-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {filteredItems.length}
                  </UIBadge>
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Showing {filteredItems.length} of {allItems.length}</span>
                  <UIBadge variant="outline" className="rounded-full text-[10px]">
                    {grns.length} GRNs · {sans.length} SANs
                  </UIBadge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-4"
                  >
                    <Truck className="h-8 w-8 text-muted-foreground/50" />
                  </motion.div>
                  <h3 className="text-lg font-medium mb-2">No Deliveries Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'No deliveries match your current filters. Try adjusting your search criteria.'
                      : 'No goods received notes or service acknowledgment notes have been created yet.'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <TableComponent>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-10 text-center">#</TableHead>
                          <TableHead className="min-w-[150px]">Number</TableHead>
                          <TableHead className="min-w-[160px]">Supplier / Provider</TableHead>
                          <TableHead className="min-w-[120px]">Department</TableHead>
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
                        {filteredItems.map((item: any, index: number) => {
                          const isRejected = item.status === 'rejected';
                          // ✅ Use getSupplierDisplayName helper
                          const supplierName = getSupplierDisplayName(item);
                          const departmentName = getDepartmentName(item);
                          const itemType = getItemType(item);
                          const itemNumber = getItemNumber(item);
                          const totalValue = getItemTotal(item);

                          return (
                            <TableRow
                              key={`${item._type}-${item.id}`}
                              className={cn(
                                "hover:bg-muted/50 transition-colors cursor-pointer group",
                                isRejected && "opacity-60"
                              )}
                              onClick={() => handleRowClick(item)}
                            >
                              <TableCell className="text-center text-muted-foreground text-xs font-mono">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline text-sm">
                                  {itemNumber}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {item.reference_number || 'No reference'}
                                </p>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                                    <span className="text-[10px] font-bold text-white">
                                      {getInitials(supplierName)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium truncate max-w-[120px]">
                                      {supplierName}
                                    </span>
                                    {item.service_provider && itemType === 'san' && (
                                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                        Provider: {item.service_provider}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <span className="text-sm font-medium truncate max-w-[100px]">
                                    {departmentName}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <UIBadge
                                  variant="outline"
                                  className={cn(
                                    "rounded-full text-[11px] px-2.5 py-0.5",
                                    itemType === 'grn'
                                      ? "border-emerald-200 text-emerald-600 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950/30"
                                      : "border-blue-200 text-blue-600 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950/30"
                                  )}
                                >
                                  {itemType === 'grn' ? 'GRN' : 'SAN'}
                                </UIBadge>
                              </TableCell>
                              <TableCell className="text-right font-medium text-sm">
                                {formatCurrency(totalValue)}
                              </TableCell>
                              {timelineHeaders.map((step) => (
                                <TableCell key={step.id} className="p-1">
                                  <DeliveryTimelineCell
                                    item={item}
                                    stepId={step.id}
                                    stepLabel={step.label}
                                    stepIcon={step.icon}
                                  />
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

        {/* Legend */}
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
                <span className="text-sm">Rejected</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">G</span>
                </div>
                <span className="text-sm">GRN</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">S</span>
                </div>
                <span className="text-sm">SAN</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-sm">Approved by HOD or Principal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
