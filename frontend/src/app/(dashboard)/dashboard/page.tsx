// app/dashboard/page.tsx

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  PlusCircle,
  Bell,
  ChevronRight,
  Download,
  Printer,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  Truck,
  Receipt,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Send,
  MessageSquare,
  HelpCircle,
  Settings,
  User,
  LogOut,
  Shield,
  Award,
  Star,
  Users2,
  Briefcase,
  Box,
  DoorOpen,
  Wrench,
  Megaphone,
  AlertTriangle,
  Check,
  X,
  FileCheck,
  ClipboardList,
  DollarSign,
  TrendingDown,
  RefreshCw,
  CalendarDays,
  Clock8,
  Timer,
  Target,
  EyeOff,
  Lock,
  Key,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link as LinkIcon,
  ExternalLink,
  Zap,
  Flame,
  Gift,
  Crown,
  Sparkles,
  Info,
  Loader2,
  Lightbulb,
  ThumbsUp,
  Rocket,
  ShieldCheck,
  Gauge,
  Gem,
  Sparkle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

// Hooks
import {
  useRequisitions,
  useRequisitionStats,
} from '@/hooks/useRequisitionQueries';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useQuotations } from '@/hooks/useQuotation';
import {
  usePurchaseOrders,
  useOverduePurchaseOrders as useOverduePOs,
} from '@/hooks/usePurchaseOrder';
import {
  useRequisitionAnalyticsSummary,
  useRequisitionTrends,
  useApprovalFunnel,
  useApprovalCycle,
  useSlaCompliance,
  useBudgetUtilization,
  useTopSuppliers,
} from '@/hooks/useAnalytics';
import { useGrns, useSans } from '@/hooks/useGoodsReceived';
import { useProcurementStatistics } from '@/hooks/useProcurement';

// Types
import type { Requisition, RequisitionStats } from '@/types/requisition.types';
import type { PaginatedResponse } from '@/types/common.types';
import type { PurchaseOrder } from '@/types/purchaseOrder.types';
import type { GoodsReceivedNote, ServiceAcknowledgmentNote } from '@/types/goodsReceived.types';
import type { QuotationRequest } from '@/types/quotations.types';
import type { Supplier } from '@/services/supplier.service';

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { PageTemplate } from '@/components/dashboard/PageTemplate';

// Recharts
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';

// ============================================
// CONSTANTS
// ============================================

const MAX_PER_PAGE = 100;
const CHART_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#94a3b8', '#06b6d4'];

// Enhanced status colors for better visibility
const STATUS_COLORS = {
  draft: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', dot: '#94a3b8' },
  submitted: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', dot: '#3b82f6' },
  hod_approved: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', dot: '#f59e0b' },
  hod_declined: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', dot: '#ef4444' },
  accountant_approved: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', dot: '#f59e0b' },
  accountant_declined: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', dot: '#ef4444' },
  principal_approved: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', dot: '#f59e0b' },
  principal_declined: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', dot: '#ef4444' },
  final_approved: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', dot: '#10b981' },
  final_declined: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', dot: '#ef4444' },
  returned: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', dot: '#8b5cf6' },
  cancelled: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', dot: '#ef4444' },
  revised: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', dot: '#3b82f6' },
  draft_po: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', dot: '#94a3b8' },
  issued: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', dot: '#3b82f6' },
  sent: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', dot: '#10b981' },
  acknowledged: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', dot: '#f59e0b' },
  delivered: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', dot: '#8b5cf6' },
  completed: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', dot: '#10b981' },
  cancelled_po: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', dot: '#ef4444' },
  closed: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', dot: '#94a3b8' },
};

const getStatusStyle = (status: string, type: 'requisition' | 'po' = 'requisition') => {
  const key = type === 'po' ? `${status}_po` : status;
  return STATUS_COLORS[key as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;
};

// ============================================
// HELPERS
// ============================================

function extractData<T>(response: PaginatedResponse<T> | T[] | undefined): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && 'data' in response) {
    return Array.isArray(response.data) ? response.data : [];
  }
  return [];
}

function extractStats(response: any): RequisitionStats {
  if (!response) return {
    total: 0, draft: 0, submitted: 0, pending: 0, approved: 0,
    hod_approved: 0, accountant_approved: 0, principal_approved: 0,
    final_approved: 0, declined: 0, hod_declined: 0,
    accountant_declined: 0, principal_declined: 0, final_declined: 0,
    returned: 0, cancelled: 0, revised: 0, total_amount: 0,
    emergency: 0, average_amount: 0,
    goods_requisitions: 0, services_requisitions: 0,
  };
  return response as RequisitionStats;
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatTimeAgo = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Invalid Date';
  }
};

const getRequisitionStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    draft: '#94a3b8',
    submitted: '#3b82f6',
    hod_approved: '#f59e0b',
    hod_declined: '#ef4444',
    accountant_approved: '#f59e0b',
    accountant_declined: '#ef4444',
    principal_approved: '#f59e0b',
    principal_declined: '#ef4444',
    final_approved: '#10b981',
    final_declined: '#ef4444',
    returned: '#8b5cf6',
    cancelled: '#ef4444',
    revised: '#3b82f6',
  };
  return map[status] || '#94a3b8';
};

const getRequisitionStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    hod_approved: 'HOD Approved',
    hod_declined: 'HOD Declined',
    accountant_approved: 'Accountant Approved',
    accountant_declined: 'Accountant Declined',
    principal_approved: 'Principal Approved',
    principal_declined: 'Principal Declined',
    final_approved: 'Final Approved',
    final_declined: 'Final Declined',
    returned: 'Returned',
    cancelled: 'Cancelled',
    revised: 'Revised',
  };
  return map[status] || status;
};

const getSupplierName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  return supplier.company_name || supplier.full_name || supplier.name || supplier.supplier_name || 'Unknown Supplier';
};

// ============================================
// MAIN DASHBOARD PAGE
// ============================================

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // ============================================
  // SUPPLIER HOOKS
  // ============================================

  const suppliersHook = useSuppliers();
  const { data: allSuppliersData, isLoading: suppliersLoading, refetch: refetchSuppliers } = suppliersHook.useAllSuppliers();
  const { data: activeSuppliersData, isLoading: activeSuppliersLoading } = suppliersHook.useActiveSuppliers();

  // Build filters with user_id and department_id
  const userFilters = useMemo(() => {
    if (!user) return {};
    return {
      user_id: user.id,
      ...(user.department?.id ? { department_id: user.department.id } : {}),
    };
  }, [user]);

  // ============================================
  // HOOKS – all filtered by current user
  // ============================================

  const { data: requisitionsData, isLoading: requisitionsLoading, refetch: refetchRequisitions } = useRequisitions({
    per_page: MAX_PER_PAGE,
    ...userFilters,
  });

  const { data: requisitionStatsData, isLoading: statsLoading, refetch: refetchStats } = useRequisitionStats({
    ...userFilters,
  });

  const { data: quotationsData, isLoading: quotesLoading, refetch: refetchQuotes } = useQuotations({
    page: 1,
    per_page: MAX_PER_PAGE,
    ...userFilters,
  });

  const { data: purchaseOrdersData, isLoading: ordersLoading, refetch: refetchOrders } = usePurchaseOrders({
    per_page: MAX_PER_PAGE,
    ...userFilters,
  });

  const { data: grnsData, isLoading: grnsLoading, refetch: refetchGrns } = useGrns({
    per_page: MAX_PER_PAGE,
    ...userFilters,
  });

  const { data: sansData, isLoading: sansLoading, refetch: refetchSans } = useSans({
    per_page: MAX_PER_PAGE,
    ...userFilters,
  });

  // Analytics hooks – pass user filters
  const { data: requisitionAnalytics, refetch: refetchRequisitionAnalytics } = useRequisitionAnalyticsSummary(userFilters);
  const { data: requisitionTrends, refetch: refetchRequisitionTrends } = useRequisitionTrends(userFilters);
  const { data: approvalFunnel, refetch: refetchApprovalFunnel } = useApprovalFunnel(userFilters);
  const { data: approvalCycle, refetch: refetchApprovalCycle } = useApprovalCycle(userFilters);
  const { data: slaCompliance, refetch: refetchSlaCompliance } = useSlaCompliance(userFilters);
  const { data: budgetUtilization, refetch: refetchBudgetUtilization } = useBudgetUtilization({
    ...userFilters,
  });
  const { data: topSuppliers, refetch: refetchTopSuppliers } = useTopSuppliers(5, userFilters);
  const { data: overduePOs, refetch: refetchOverduePOs } = useOverduePOs(userFilters);

  // ============================================
  // EXTRACT DATA
  // ============================================

  const requisitions = extractData(requisitionsData) as Requisition[];
  const quotations = extractData(quotationsData);
  const purchaseOrders = extractData(purchaseOrdersData) as PurchaseOrder[];
  const allSuppliers = extractData(allSuppliersData) as Supplier[];
  const grns = extractData(grnsData) as GoodsReceivedNote[];
  const sans = extractData(sansData) as ServiceAcknowledgmentNote[];

  // ============================================
  // BUILD SUPPLIER MAP FOR LOOKUP
  // ============================================

  const supplierMap = useMemo(() => {
    const map = new Map<number, Supplier>();
    allSuppliers.forEach(supplier => {
      if (supplier.id) {
        map.set(supplier.id, supplier);
      }
    });
    return map;
  }, [allSuppliers]);

  // ============================================
  // DERIVED DATA – all user-specific
  // ============================================

  const totalRequisitions = requisitions.length;

  const pendingApprovals = requisitions.filter(
    (r) => ['submitted', 'hod_approved', 'accountant_approved', 'principal_approved'].includes(r.status)
  ).length;

  const activeOrders = purchaseOrders.filter(p => p.status === 'issued' || p.status === 'sent').length;

  const totalSpent = purchaseOrders.reduce((sum, p) => sum + (p.total_amount || 0), 0);

  const approvedRequisitions = requisitions.filter(r => r.status === 'final_approved').length;

  const declinedRequisitions = requisitions.filter(
    r => r.status.includes('declined')
  ).length;

  const userSupplierIds = useMemo(() => {
    const ids = new Set<number>();
    requisitions.forEach(req => {
      if (req.supplier_id) ids.add(req.supplier_id);
    });
    purchaseOrders.forEach(po => {
      if (po.supplier_id) ids.add(po.supplier_id);
    });
    return ids;
  }, [requisitions, purchaseOrders]);

  const userSuppliers = useMemo(() => {
    const suppliers: Supplier[] = [];
    userSupplierIds.forEach(id => {
      const supplier = supplierMap.get(id);
      if (supplier) {
        suppliers.push(supplier);
      }
    });
    return suppliers;
  }, [userSupplierIds, supplierMap]);

  const totalSuppliers = userSuppliers.length;


  const avgApprovalTime = approvalCycle?.cycle_time?.total_cycle || 0;

  const slaComplianceRate = slaCompliance?.compliance_rate || 0;

  const totalQtns = quotations.length;
  const totalGrns = grns.length;
  const completedGrns = grns.filter(g => g.status === 'completed').length;
  const totalSans = sans.length;
  const completedSans = sans.filter(s => s.status === 'completed').length;

  const isLoading = requisitionsLoading || statsLoading || quotesLoading || ordersLoading ||
    suppliersLoading || grnsLoading || sansLoading;

  // ============================================
  // STATUS DISTRIBUTION
  // ============================================

  const requisitionStatusDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    requisitions.forEach((r: Requisition) => {
      map[r.status] = (map[r.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: getRequisitionStatusLabel(status),
      value: count,
      status,
      color: getRequisitionStatusColor(status),
    }));
  }, [requisitions]);

  // ============================================
  // DAILY TREND
  // ============================================

  const dailyTrend = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const dayReqs = requisitions.filter((r: Requisition) => {
        if (!r.created_at) return false;
        return format(new Date(r.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      const dayPOs = purchaseOrders.filter((p: PurchaseOrder) => {
        if (!p.created_at) return false;
        return format(new Date(p.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      data.push({
        date: format(date, 'MMM dd'),
        requisitions: dayReqs.length,
        orders: dayPOs.length,
      });
    }
    return data;
  }, [requisitions, purchaseOrders, timeRange]);

  // ============================================
  // BUILD STATS CARDS
  // ============================================

  const statsItems: StatCardItem[] = useMemo(() => {
    return [
      {
        label: "My Requisitions",
        value: totalRequisitions,
        icon: ClipboardList,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: `${approvedRequisitions} approved`,
      },
      {
        label: "Pending My Action",
        value: pendingApprovals,
        icon: Clock,
        tagLabel: "PENDING",
        tagColor: "amber",
        subtitle: `Awaiting my approval`,
      },
      {
        label: "My Active Orders",
        value: activeOrders,
        icon: ShoppingCart,
        tagLabel: "ACTIVE",
        tagColor: "emerald",
        subtitle: `${purchaseOrders.length} total orders`,
      },
      {
        label: "My Total Spent",
        value: formatCurrency(totalSpent),
        icon: DollarSign,
        tagLabel: "SPENT",
        tagColor: "purple",
        subtitle: `Across ${purchaseOrders.length} orders`,
        compact: false,
      },
      {
        label: "Suppliers I Use",
        value: totalSuppliers,
        icon: Users,
        tagLabel: "ACTIVE",
        tagColor: "indigo",
        subtitle: `${Math.min(userSuppliers.length, 5)} active suppliers`,
      },

      {
        label: "My Avg Approval Time",
        value: Math.round(avgApprovalTime),
        icon: Timer,
        tagLabel: "AVG",
        tagColor: "amber",
        suffix: 'h',
        subtitle: `${approvedRequisitions} approvals`,
      },
      {
        label: "My SLA Compliance",
        value: Math.round(slaComplianceRate),
        icon: Shield,
        tagLabel: "SLA",
        tagColor: "emerald",
        suffix: '%',
        subtitle: `${slaComplianceRate.toFixed(0)}% compliance`,
      },
    ];
  }, [
    totalRequisitions, pendingApprovals, activeOrders, totalSpent, totalSuppliers,
    avgApprovalTime, slaComplianceRate, approvedRequisitions,
    purchaseOrders.length, userSuppliers, budgetUtilization,
  ]);

  // ============================================
  // TIPS & SUGGESTIONS
  // ============================================

  const tips = useMemo(() => {
    const items = [];

    if (pendingApprovals > 0) {
      items.push({
        icon: Clock,
        title: `${pendingApprovals} requisitions pending your approval`,
        description: 'Review and take action on pending requisitions to keep procurement moving',
        action: 'Review Now',
        href: '/requisitions/pending',
        color: 'amber',
      });
    }

    if (totalRequisitions === 0) {
      items.push({
        icon: Rocket,
        title: 'Start your first requisition',
        description: 'Create a new requisition to begin the procurement process',
        action: 'Create Requisition',
        href: '/requisitions/create',
        color: 'blue',
      });
    }

    if (totalSuppliers === 0) {
      items.push({
        icon: Users,
        title: 'Add suppliers to your network',
        description: 'Build your supplier base to streamline procurement',
        action: 'Add Supplier',
        href: '/procurement/suppliers',
        color: 'purple',
      });
    }

    if (slaComplianceRate < 80 && slaComplianceRate > 0) {
      items.push({
        icon: Shield,
        title: 'SLA compliance needs attention',
        description: `Current compliance rate is ${slaComplianceRate.toFixed(0)}%. Review approval bottlenecks`,
        action: 'View Analytics',
        href: '/procurement/reports',
        color: 'red',
      });
    }


    if (items.length === 0) {
      items.push({
        icon: ThumbsUp,
        title: 'Everything looks great!',
        description: 'Your procurement activities are on track. Keep up the good work!',
        action: 'View Dashboard',
        href: '#',
        color: 'emerald',
      });
    }

    return items;
  }, [pendingApprovals, totalRequisitions, totalSuppliers, slaComplianceRate]);

  // ============================================
  // QUICK ACTIONS - Modern Icon Card Style (same as procurement)
  // ============================================

  const quickActions = [
    {
      title: 'New Requisition',
      icon: PlusCircle,
      href: '/requisitions/create',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'Create and submit',
      count: totalRequisitions,
    },
    {
      title: 'Pending Approvals',
      icon: Clock,
      href: '/requisitions/pending',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      description: `${pendingApprovals} awaiting`,
      count: pendingApprovals,
    },
    {
      title: 'Manage Suppliers',
      icon: Users,
      href: '/procurement/suppliers',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      description: `${totalSuppliers} suppliers`,
      count: totalSuppliers,
    },
    {
      title: 'Purchase Orders',
      icon: Package,
      href: '/procurement/purchase-orders/manage-orders',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      description: `${purchaseOrders.length} orders`,
      count: purchaseOrders.length,
    },
    {
      title: 'Invoices',
      icon: Receipt,
      href: '/procurement/invoices',
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      description: 'Process payments',
    },
    {
      title: 'Reports',
      icon: BarChart3,
      href: '/procurement/reports',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      description: 'Analytics & insights',
    },
  ];

  // ============================================
  // RECENT ACTIVITIES
  // ============================================

  const recentActivities = useMemo(() => {
    const activities: any[] = [];

    requisitions.slice(0, 3).forEach((r: Requisition) => {
      const statusStyle = getStatusStyle(r.status, 'requisition');
      activities.push({
        id: `req-${r.id}`,
        icon: FileText,
        title: `Requisition ${r.reference_number || r.id} ${r.status === 'submitted' ? 'submitted' : 'updated'}`,
        description: `${r.title} - ${r.department?.name || 'Unknown department'}`,
        time: formatTimeAgo(r.created_at),
        color: 'bg-blue-500',
        status: r.status,
        type: 'requisition',
        statusStyle,
      });
    });

    purchaseOrders.slice(0, 2).forEach((p: PurchaseOrder) => {
      const supplierName = p.supplier_id ? getSupplierName(supplierMap.get(p.supplier_id)) : 'Unknown';
      const statusStyle = getStatusStyle(p.status, 'po');
      activities.push({
        id: `po-${p.id}`,
        icon: ShoppingCart,
        title: `Order ${p.po_number} ${p.status}`,
        description: `Supplier: ${supplierName}`,
        time: formatTimeAgo(p.created_at),
        color: 'bg-emerald-500',
        status: p.status,
        type: 'po',
        statusStyle,
      });
    });

    return activities.slice(0, 6);
  }, [requisitions, purchaseOrders, supplierMap]);

  // ============================================
  // REFRESH FUNCTION
  // ============================================

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchRequisitions(),
        refetchStats(),
        refetchQuotes(),
        refetchOrders(),
        refetchSuppliers(),
        refetchGrns(),
        refetchSans(),
        refetchRequisitionAnalytics(),
        refetchRequisitionTrends(),
        refetchApprovalFunnel(),
        refetchApprovalCycle(),
        refetchSlaCompliance(),
        refetchBudgetUtilization(),
        refetchTopSuppliers(),
        refetchOverduePOs(),
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    refetchRequisitions,
    refetchStats,
    refetchQuotes,
    refetchOrders,
    refetchSuppliers,
    refetchGrns,
    refetchSans,
    refetchRequisitionAnalytics,
    refetchRequisitionTrends,
    refetchApprovalFunnel,
    refetchApprovalCycle,
    refetchSlaCompliance,
    refetchBudgetUtilization,
    refetchTopSuppliers,
    refetchOverduePOs,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 300000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  // ============================================
  // RENDER
  // ============================================

  if (!user) {
    return (
      <PageTemplate
        title="Dashboard"
        description="Please log in to view your dashboard"
        icon={<LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </PageTemplate>
    );
  }

  if (isLoading && !isRefreshing) {
    return (
      <PageTemplate
        title="Dashboard"
        description={`Welcome back, ${user.full_name || 'User'}! Loading your personalized dashboard...`}
        icon={<LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="mt-4 text-muted-foreground">Loading your data...</p>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Dashboard"
      description={`Welcome back, ${user.full_name || 'User'}! Here's your personalized procurement overview`}
      icon={<LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 gap-2 rounded-xl"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push('/requisitions/create')}
            className="gap-2 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Requisition
          </Button>
        </div>
      }
    >


      {/* ============================================ */}
      {/* QUICK ACTIONS - Modern Icon Card Style (same as procurement) */}
      {/* ============================================ */}

      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Actions</h3>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => router.push(action.href)}
              className="group relative p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg hover:border-transparent transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden"
            >
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl",
                `bg-gradient-to-br ${action.color}`
              )} />
              <div className="relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110",
                  action.bgColor
                )}>
                  <action.icon className={cn("h-6 w-6", action.iconColor, "group-hover:text-white transition-colors duration-300")} />
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-white transition-colors duration-300">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors duration-300 mt-0.5">
                  {action.description}
                </p>
                {action.count !== undefined && action.count > 0 && (
                  <Badge className="mt-2 bg-white/20 text-white border-0 text-[10px]">
                    {action.count}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* REQUISITION STATUS & TREND */}
      {/* ============================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Requisition Status Distribution */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <PieChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  My Requisition Status
                </CardTitle>
                <CardDescription className="text-xs mt-1">Distribution by status for your requisitions</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs rounded-full px-3 py-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {totalRequisitions} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 260 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={requisitionStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {requisitionStatusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={0}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(`/requisitions/manage?status=${entry.status}`)}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload) return null;
                      return (
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 min-w-[180px]">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0]?.payload?.name}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{payload[0]?.value}</p>
                          <p className="text-xs text-muted-foreground">Click to filter</p>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Trend */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  My Activity Trend
                </CardTitle>
                <CardDescription className="text-xs mt-1">Daily activity over {timeRange}</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs rounded-full px-3 py-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {dailyTrend.reduce((acc, item) => acc + item.requisitions, 0)} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 260 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload) return null;
                      return (
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 min-w-[180px]">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
                          {payload.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-4 py-1">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || item.stroke }} />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="requisitions" name="My Requisitions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReqs)" />
                  <Area type="monotone" dataKey="orders" name="My Orders" stroke="#10b981" fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* RECENT ACTIVITY with Enhanced Badges */}
      {/* ============================================ */}

      <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                My Recent Activity
              </CardTitle>
              <CardDescription className="text-xs mt-1">Latest actions I've taken</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/reports/audit')}
              className="gap-1 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-1">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const statusStyle = activity.statusStyle || getStatusStyle(activity.status, activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg ${activity.color} mt-0.5 flex-shrink-0`}>
                        <activity.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                          <Badge
                            className="text-[10px] rounded-full px-2 py-0.5 border-0"
                            style={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                              borderColor: statusStyle.border,
                            }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full inline-block mr-1" style={{ backgroundColor: statusStyle.dot }} />
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">{activity.time}</span>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                    <Activity className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No recent activity</p>
                  <p className="text-xs text-muted-foreground mt-1">Start by creating your first requisition</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* RECENT REQUISITIONS & ORDERS with Enhanced Status Colors */}
      {/* ============================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Requisitions */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                My Recent Requisitions
              </CardTitle>
              <CardDescription className="text-xs mt-1">Latest 5 requisitions I created</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/requisitions/manage')}
              className="gap-1 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Reference</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Title</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Amount</th>
                    <th className="text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitions
                    .sort((a: Requisition, b: Requisition) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((req: Requisition) => {
                      const statusStyle = getStatusStyle(req.status, 'requisition');
                      return (
                        <tr
                          key={req.id}
                          className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                          onClick={() => router.push(`/requisitions/${req.id}`)}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {req.reference_number || req.id}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                            {req.title}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className="flex items-center gap-1.5 px-3 py-1 font-medium rounded-full border"
                              style={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.text,
                                borderColor: statusStyle.border,
                              }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
                              {getRequisitionStatusLabel(req.status)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {formatCurrency(req.total_amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/requisitions/${req.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  {requisitions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No requisitions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders with Enhanced Status Colors */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                My Recent Orders
              </CardTitle>
              <CardDescription className="text-xs mt-1">Latest 5 purchase orders I created</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/procurement/purchase-orders/manage-orders')}
              className="gap-1 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">PO #</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Supplier</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Amount</th>
                    <th className="text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders
                    .sort((a: PurchaseOrder, b: PurchaseOrder) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((order: PurchaseOrder) => {
                      const supplierName = order.supplier_id ? getSupplierName(supplierMap.get(order.supplier_id)) : 'Unknown';
                      const statusStyle = getStatusStyle(order.status, 'po');
                      return (
                        <tr
                          key={order.id}
                          className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                          onClick={() => router.push(`/procurement/purchase-orders/${order.id}`)}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {order.po_number}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                            {supplierName}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className="flex items-center gap-1.5 px-3 py-1 font-medium rounded-full border"
                              style={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.text,
                                borderColor: statusStyle.border,
                              }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
                              {order.status_label || order.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {formatCurrency(order.total_amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/procurement/purchase-orders/${order.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  {purchaseOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* SYSTEM STATUS */}
      {/* ============================================ */}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">System Operational</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">|</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Last updated: {formatTimeAgo(new Date())}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {user.full_name || 'User'} online
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {user.department?.name || 'No department'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {totalSuppliers} suppliers
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Peak hours: 8AM - 5PM
            </span>
            <Link href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">
              Need help?
            </Link>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
