// frontend/src/app/(dashboard)/procurement/dashboard/page.tsx

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Eye,
  RefreshCw,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  ShoppingCart,
  Award,
  Target,
  Rocket,
  Zap,
  PieChart,
  BarChart3,
  Gauge,
  GitBranch,
  Percent,
  FileCheck,
  ClipboardList,
  Timer,
  ChevronRight,

  Receipt,
  Shield,
  Star,
  TrendingDown,
  AlertTriangle,
  Warehouse,
  Scale,
  Hourglass,
  Briefcase,
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
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
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
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from 'recharts';

// Hooks
import {
  useQuotations,
  useActiveQuotations,
  useClosingSoonQuotations,
} from '@/hooks/useQuotation';
import {
  useProcurementStatistics,
} from '@/hooks/useProcurement';
import { useSupplierQuotations } from '@/hooks/useSupplierQuotation';
import {
  useRequisitions,
  useRequisitionStats,
} from '@/hooks/useRequisitionQueries';
import { useSuppliers } from '@/hooks/useSuppliers';

// Analytics Hooks
import {
  useProcurementDashboard as useProcurementAnalytics,
  useRequisitionAnalyticsSummary,
  useRequisitionTrends,
  useApprovalFunnel,
  useApprovalCycle,
  useSlaCompliance,
  usePurchaseOrderAnalyticsSummary,
  usePurchaseOrderDeliveryPerformance,
  usePurchaseOrderCycleTime,
  useOverduePurchaseOrders,
  useQuotationResponseRates,
  useSupplierDeliveryPerformance,
  useSupplierQualityRatings,
  useTopSuppliers,
  useFinancialSummary,
  useBudgetUtilization,
  useSpendingAnalysis,
  useCostSavings,
  useOperationSummary,
  useApprovalBottlenecks,
} from '@/hooks/useAnalytics';

// GRN & SAN Hooks
import {
  useGrns,
  useSans,
  usePendingGrns,
  usePendingSans,
  useGrnsByPurchaseOrder,
  useSansByPurchaseOrder,
} from '@/hooks/useGoodsReceived';

// Purchase Order Hooks
import {
  usePurchaseOrders,
  usePurchaseOrderSummary,
  useOverduePurchaseOrders as useOverduePOs,
} from '@/hooks/usePurchaseOrder';

// Types
import type { QuotationRequest } from '@/types/quotations.types';
import type { Requisition, RequisitionStats } from '@/types/requisition.types';
import type { PaginatedResponse } from '@/types/common.types';
import type { GoodsReceivedNote, ServiceAcknowledgmentNote } from '@/types/goodsReceived.types';
import type { PurchaseOrder } from '@/types/purchaseOrder.types';

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';

// ============================================
// CONSTANTS
// ============================================

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  responded: 'Responded',
  evaluating: 'Evaluating',
  closed: 'Closed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  sent: '#3b82f6',
  responded: '#6366f1',
  evaluating: '#8b5cf6',
  closed: '#10b981',
  cancelled: '#ef4444',
  expired: '#f59e0b',
};

const CHART_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#94a3b8', '#06b6d4', '#ec4899', '#f97316'];

const MAX_PER_PAGE = 100;

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

const formatTimeAgo = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusLabel = (status: string): string => STATUS_LABELS[status] || status;
const getStatusColor = (status: string): string => STATUS_COLORS[status] || '#94a3b8';

const getRequisitionStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    draft: '#94a3b8',
    submitted: '#6366f1',
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
    revised: '#6366f1',
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

const getGrnStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    draft: '#94a3b8',
    submitted: '#6366f1',
    hod_approved: '#f59e0b',
    principal_approved: '#f59e0b',
    completed: '#10b981',
    rejected: '#ef4444',
  };
  return map[status] || '#94a3b8';
};

const getGrnStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    hod_approved: 'HOD Approved',
    principal_approved: 'Principal Approved',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  return map[status] || status;
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const statusBgMap: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    responded: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    evaluating: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <Badge className={cn("flex items-center gap-1.5 px-3 py-1 font-medium rounded-full border-0", statusBgMap[status] || 'bg-gray-100')}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getStatusColor(status) }} />
      {getStatusLabel(status)}
    </Badge>
  );
};

// ============================================
// HELPER FUNCTIONS
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

// ============================================
// MAIN PAGE
// ============================================

export default function ProcurementDashboardPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============================================
  // HOOKS - EXISTING
  // ============================================

  const { data: procurementStats, isLoading: statsLoading, refetch: refetchStats } = useProcurementStatistics();
  const { data: quotationsData, isLoading: quotesLoading, refetch: refetchQuotes } = useQuotations({
    page: 1,
    per_page: MAX_PER_PAGE,
  });
  const { data: activeQuotations, isLoading: activeLoading, refetch: refetchActive } = useActiveQuotations();
  const { data: closingSoonQuotations, isLoading: closingSoonLoading, refetch: refetchClosing } = useClosingSoonQuotations();
  const { data: supplierQuotationsData, isLoading: supplierQuotesLoading, refetch: refetchSupplierQuotes } = useSupplierQuotations({});
  const { data: allRequisitionsData, refetch: refetchAllRequisitions } = useRequisitions({ per_page: MAX_PER_PAGE });
  const { data: requisitionStatsData, refetch: refetchRequisitionStats } = useRequisitionStats();
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, refetch: refetchSuppliers } = useAllSuppliers();

  // ============================================
  // HOOKS - ANALYTICS
  // ============================================

  const { data: procurementAnalytics, refetch: refetchProcurementAnalytics } = useProcurementAnalytics();
  const { data: requisitionAnalytics, refetch: refetchRequisitionAnalytics } = useRequisitionAnalyticsSummary();
  const { data: requisitionTrends, refetch: refetchRequisitionTrends } = useRequisitionTrends();
  const { data: approvalFunnel, refetch: refetchApprovalFunnel } = useApprovalFunnel();
  const { data: approvalCycle, refetch: refetchApprovalCycle } = useApprovalCycle();
  const { data: slaCompliance, refetch: refetchSlaCompliance } = useSlaCompliance();
  const { data: poAnalytics, refetch: refetchPoAnalytics } = usePurchaseOrderAnalyticsSummary();
  const { data: deliveryPerformance, refetch: refetchDeliveryPerformance } = usePurchaseOrderDeliveryPerformance();
  const { data: poCycleTime, refetch: refetchPoCycleTime } = usePurchaseOrderCycleTime();
  const { data: overduePOs, refetch: refetchOverduePOs } = useOverduePurchaseOrders();
  const { data: quotationResponseRates, refetch: refetchQuotationResponseRates } = useQuotationResponseRates();
  const { data: supplierDeliveryPerformance, refetch: refetchSupplierDeliveryPerformance } = useSupplierDeliveryPerformance();
  const { data: supplierQualityRatings, refetch: refetchSupplierQualityRatings } = useSupplierQualityRatings();
  const { data: topSuppliers, refetch: refetchTopSuppliers } = useTopSuppliers(10);
  const { data: financialSummary, refetch: refetchFinancialSummary } = useFinancialSummary();
  const { data: budgetUtilization, refetch: refetchBudgetUtilization } = useBudgetUtilization();
  const { data: spendingAnalysis, refetch: refetchSpendingAnalysis } = useSpendingAnalysis();
  const { data: costSavings, refetch: refetchCostSavings } = useCostSavings();
  const { data: operationSummary, refetch: refetchOperationSummary } = useOperationSummary();
  const { data: approvalBottlenecks, refetch: refetchApprovalBottlenecks } = useApprovalBottlenecks();

  // ============================================
  // HOOKS - GRN & SAN
  // ============================================

  const { data: grnsData, refetch: refetchGrns } = useGrns({ per_page: MAX_PER_PAGE });
  const { data: sansData, refetch: refetchSans } = useSans({ per_page: MAX_PER_PAGE });
  const { data: pendingGrns, refetch: refetchPendingGrns } = usePendingGrns();
  const { data: pendingSans, refetch: refetchPendingSans } = usePendingSans();

  // ============================================
  // HOOKS - PURCHASE ORDERS
  // ============================================

  const { data: purchaseOrdersData, refetch: refetchPurchaseOrders } = usePurchaseOrders({ per_page: MAX_PER_PAGE });

  // ============================================
  // EXTRACT DATA
  // ============================================

  const quotations = extractData(quotationsData);
  const allRequisitions = extractData(allRequisitionsData);
  const suppliers = extractData(suppliersData);
  const supplierQuotations = extractData(supplierQuotationsData);
  const requisitionStats = extractStats(requisitionStatsData);
  const grns = extractData(grnsData) as GoodsReceivedNote[];
  const sans = extractData(sansData) as ServiceAcknowledgmentNote[];
  const purchaseOrders = extractData(purchaseOrdersData) as PurchaseOrder[];

  // ============================================
  // DERIVED DATA - EXISTING
  // ============================================

  const totalQtns = procurementStats?.with_qtns || 0;
  const activeCount = activeQuotations?.length || 0;
  const closingSoonCount = closingSoonQuotations?.length || 0;
  const supplierQuoteCount = supplierQuotations.length;
  const totalRequisitions = procurementStats?.total || 0;
  const readyForProcurement = procurementStats?.ready_for_procurement || 0;
  const inProgress = procurementStats?.in_progress || 0;
  const completed = procurementStats?.completed || 0;
  const withQtns = procurementStats?.with_qtns || 0;
  const withoutQtns = procurementStats?.without_qtns || 0;

  // ============================================
  // DERIVED DATA - NEW STATS
  // ============================================

  const totalGrns = grns.length;
  const completedGrns = grns.filter(g => g.status === 'completed').length;
  const pendingGrnApprovals = grns.filter(g => g.status === 'submitted' || g.status === 'hod_approved').length;
  const rejectedGrns = grns.filter(g => g.status === 'rejected').length;
  const grnCompletionRate = totalGrns > 0 ? (completedGrns / totalGrns) * 100 : 0;

  const totalSans = sans.length;
  const completedSans = sans.filter(s => s.status === 'completed').length;
  const pendingSanApprovals = sans.filter(s => s.status === 'submitted' || s.status === 'hod_approved').length;
  const rejectedSans = sans.filter(s => s.status === 'rejected').length;
  const sanCompletionRate = totalSans > 0 ? (completedSans / totalSans) * 100 : 0;

  const totalPendingApprovals = pendingGrnApprovals + pendingSanApprovals;
  const totalRejections = rejectedGrns + rejectedSans;

  const totalPOs = purchaseOrders.length;
  const issuedPOs = purchaseOrders.filter(p => p.status === 'issued').length;
  const completedPOs = purchaseOrders.filter(p => p.status === 'completed' || p.status === 'closed').length;
  const cancelledPOs = purchaseOrders.filter(p => p.status === 'cancelled').length;
  const poCompletionRate = totalPOs > 0 ? (completedPOs / totalPOs) * 100 : 0;
  const poIssueRate = totalPOs > 0 ? (issuedPOs / totalPOs) * 100 : 0;

  const overduePOsCount = overduePOs?.overdue_count || 0;
  const overdueRate = totalPOs > 0 ? (overduePOsCount / totalPOs) * 100 : 0;

  const totalBudget = budgetUtilization?.reduce((acc, b) => acc + b.total_budget, 0) || 0;
  const totalSpent = budgetUtilization?.reduce((acc, b) => acc + b.total_spent, 0) || 0;
  const budgetUtilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const totalSavings = costSavings?.total_savings || 0;
  const savingsRate = costSavings?.savings_rate || 0;

  const topSuppliersList = topSuppliers || [];
  const supplierResponseRates = quotationResponseRates || [];
  const avgSupplierResponseRate = supplierResponseRates.length > 0
    ? supplierResponseRates.reduce((acc, s) => acc + s.response_rate, 0) / supplierResponseRates.length
    : 0;

  const bottlenecks = approvalBottlenecks || [];
  const criticalBottlenecks = bottlenecks.filter(b => b.bottleneck_status === 'critical');
  const warningBottlenecks = bottlenecks.filter(b => b.bottleneck_status === 'warning');

  const slaComplianceRate = slaCompliance?.compliance_rate || 0;
  const avgApprovalTime = approvalCycle?.cycle_time?.total_cycle || 0;

  // ============================================
  // STATUS DISTRIBUTION
  // ============================================

  const statusDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    quotations.forEach((q: QuotationRequest) => {
      map[q.status] = (map[q.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: getStatusLabel(status),
      value: count,
      status,
      color: getStatusColor(status),
    }));
  }, [quotations]);

  const requisitionStatusDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    allRequisitions.forEach((r: Requisition) => {
      map[r.status] = (map[r.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: getRequisitionStatusLabel(status),
      value: count,
      status,
      color: getRequisitionStatusColor(status),
    }));
  }, [allRequisitions]);

  const grnStatusDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    grns.forEach((g: GoodsReceivedNote) => {
      map[g.status] = (map[g.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: getGrnStatusLabel(status),
      value: count,
      status,
      color: getGrnStatusColor(status),
    }));
  }, [grns]);

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

      const dayQuotes = quotations.filter((q: QuotationRequest) => {
        if (!q.created_at) return false;
        return format(new Date(q.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      const dayReqs = allRequisitions.filter((r: Requisition) => {
        if (!r.created_at) return false;
        return format(new Date(r.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      const dayPOs = purchaseOrders.filter((p: PurchaseOrder) => {
        if (!p.created_at) return false;
        return format(new Date(p.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      data.push({
        date: format(date, 'MMM dd'),
        quotes: dayQuotes.length,
        requisitions: dayReqs.length,
        purchaseOrders: dayPOs.length,
        responses: dayQuotes.reduce((sum, q) => sum + (q.response_count || 0), 0),
      });
    }
    return data;
  }, [quotations, allRequisitions, purchaseOrders, timeRange]);

  // ============================================
  // RESPONSE RATE DATA
  // ============================================

  const responseRateData = useMemo(() => {
    return quotations
      .filter((q: QuotationRequest) => q.response_rate !== undefined)
      .slice(0, 15)
      .map((q: QuotationRequest) => ({
        name: q.qtn_number,
        rate: q.response_rate || 0,
        responses: q.response_count || 0,
        total: q.sent_suppliers_count || 0,
        status: q.status,
        color: getStatusColor(q.status),
        title: q.title,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [quotations]);

  // ============================================
  // SUPPLIER PERFORMANCE DATA
  // ============================================

  const supplierPerformanceData = useMemo(() => {
    return supplierQuotations
      .reduce((acc: any[], sq: any) => {
        const supplierName = sq.supplier?.company_name || sq.supplier?.full_name || 'Unknown';
        const existing = acc.find(s => s.name === supplierName);
        if (existing) {
          existing.quotes += 1;
          if (sq.status === 'accepted') {
            existing.accepted += 1;
            existing.totalValue += sq.total_amount || 0;
          }
        } else {
          acc.push({
            name: supplierName,
            quotes: 1,
            accepted: sq.status === 'accepted' ? 1 : 0,
            rate: 0,
            totalValue: sq.status === 'accepted' ? (sq.total_amount || 0) : 0,
          });
        }
        return acc;
      }, [])
      .map((s: any) => ({ ...s, rate: s.quotes > 0 ? Math.round((s.accepted / s.quotes) * 100) : 0 }))
      .sort((a: any, b: any) => b.quotes - a.quotes)
      .slice(0, 8);
  }, [supplierQuotations]);

  // ============================================
  // APPROVAL FUNNEL DATA
  // ============================================

  const funnelData = useMemo(() => {
    if (approvalFunnel && approvalFunnel.length > 0) {
      return approvalFunnel.map(item => ({
        name: item.stage,
        value: item.count,
        percentage: item.percentage,
        color: CHART_COLORS[approvalFunnel.indexOf(item) % CHART_COLORS.length],
      }));
    }
    return [
      { name: 'Total Requisitions', value: totalRequisitions, percentage: 100, color: '#6366f1' },
      { name: 'HOD Approved', value: requisitionStats?.hod_approved || 0, percentage: totalRequisitions > 0 ? ((requisitionStats?.hod_approved || 0) / totalRequisitions) * 100 : 0, color: '#3b82f6' },
      { name: 'Accountant Approved', value: requisitionStats?.accountant_approved || 0, percentage: totalRequisitions > 0 ? ((requisitionStats?.accountant_approved || 0) / totalRequisitions) * 100 : 0, color: '#8b5cf6' },
      { name: 'Principal Approved', value: requisitionStats?.principal_approved || 0, percentage: totalRequisitions > 0 ? ((requisitionStats?.principal_approved || 0) / totalRequisitions) * 100 : 0, color: '#f59e0b' },
      { name: 'Final Approved', value: requisitionStats?.final_approved || 0, percentage: totalRequisitions > 0 ? ((requisitionStats?.final_approved || 0) / totalRequisitions) * 100 : 0, color: '#10b981' },
    ];
  }, [approvalFunnel, totalRequisitions, requisitionStats]);

  // ============================================
  // BUILD STATS FOR STATSCARDS COMPONENT
  // ============================================

  const statsItems: StatCardItem[] = useMemo(() => {
    return [
      {
        label: "Total RFQs",
        value: totalQtns,
        icon: FileText,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: `${activeCount} active`,
      },
      {
        label: "Active RFQs",
        value: activeCount,
        icon: Activity,
        tagLabel: "ACTIVE",
        tagColor: "emerald",
        subtitle: `${closingSoonCount} closing soon`,
      },
      {
        label: "Closing Soon",
        value: closingSoonCount,
        icon: AlertCircle,
        tagLabel: "CLOSING",
        tagColor: "amber",
        subtitle: "Within 48 hours",
      },
      {
        label: "Response Rate",
        value: Math.round(avgSupplierResponseRate),
        icon: TrendingUp,
        tagLabel: "RATE",
        tagColor: "purple",
        subtitle: `${Math.round(avgSupplierResponseRate)}% average`,
        suffix: '%',
        compact: false,
      },
      {
        label: "Supplier Quotes",
        value: supplierQuoteCount,
        icon: Users,
        tagLabel: "QUOTES",
        tagColor: "indigo",
        subtitle: "Total submissions",
      },
      {
        label: "Total Requisitions",
        value: totalRequisitions,
        icon: ClipboardList,
        tagLabel: "REQS",
        tagColor: "blue",
        subtitle: `${readyForProcurement} ready for RFQ`,
      },
      {
        label: "GRNs Completed",
        value: completedGrns,
        icon: Warehouse,
        tagLabel: "GRN",
        tagColor: "emerald",
        subtitle: `${grnCompletionRate.toFixed(0)}% completion rate`,
      },
      {
        label: "SANs Completed",
        value: completedSans,
        icon: Briefcase,
        tagLabel: "SAN",
        tagColor: "teal",
        subtitle: `${sanCompletionRate.toFixed(0)}% completion rate`,
      },
      {
        label: "Pending Approvals",
        value: totalPendingApprovals,
        icon: Clock,
        tagLabel: "PENDING",
        tagColor: "amber",
        subtitle: `${pendingGrnApprovals} GRN, ${pendingSanApprovals} SAN`,
      },
      {
        label: "Total Rejections",
        value: totalRejections,
        icon: XCircle,
        tagLabel: "REJECTED",
        tagColor: "rose",
        subtitle: `${rejectedGrns} GRN, ${rejectedSans} SAN rejected`,
      },
      {
        label: "Purchase Orders",
        value: totalPOs,
        icon: ShoppingCart,
        tagLabel: "POs",
        tagColor: "blue",
        subtitle: `${issuedPOs} issued, ${completedPOs} completed`,
      },
      {
        label: "PO Completion",
        value: Math.round(poCompletionRate),
        icon: CheckCircle,
        tagLabel: "RATE",
        tagColor: "emerald",
        suffix: '%',
        subtitle: `${poCompletionRate.toFixed(0)}% completed`,
      },
      {
        label: "Overdue POs",
        value: overduePOsCount,
        icon: AlertTriangle,
        tagLabel: "OVERDUE",
        tagColor: "red",
        subtitle: `${overdueRate.toFixed(0)}% of total`,
      },
      {
        label: "Budget Utilization",
        value: Math.round(budgetUtilizationRate),
        icon: DollarSign,
        tagLabel: "USED",
        tagColor: "purple",
        suffix: '%',
        subtitle: `${formatCurrency(totalSpent)} of ${formatCurrency(totalBudget)}`,
      },
      {
        label: "Cost Savings",
        value: Math.round(savingsRate),
        icon: TrendingDown,
        tagLabel: "SAVED",
        tagColor: "emerald",
        suffix: '%',
        subtitle: `${formatCurrency(totalSavings)} saved`,
      },
      {
        label: "SLA Compliance",
        value: Math.round(slaComplianceRate),
        icon: Shield,
        tagLabel: "SLA",
        tagColor: "indigo",
        suffix: '%',
        subtitle: `${slaComplianceRate.toFixed(0)}% compliance`,
      }
    ];
  }, [
    totalQtns, activeCount, closingSoonCount, avgSupplierResponseRate, supplierQuoteCount,
    totalRequisitions, readyForProcurement, completedGrns, grnCompletionRate,
    completedSans, sanCompletionRate, totalPendingApprovals, pendingGrnApprovals,
    pendingSanApprovals, totalRejections, rejectedGrns, rejectedSans,
    totalPOs, issuedPOs, completedPOs, poCompletionRate, overduePOsCount,
    overdueRate, budgetUtilizationRate, totalSpent, totalBudget, totalSavings,
    savingsRate, slaComplianceRate, avgApprovalTime, bottlenecks,
    criticalBottlenecks, warningBottlenecks,
  ]);

  // ============================================
  // REFRESH FUNCTION
  // ============================================

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchQuotes(),
        refetchActive(),
        refetchClosing(),
        refetchSupplierQuotes(),
        refetchAllRequisitions(),
        refetchRequisitionStats(),
        refetchSuppliers(),
        refetchProcurementAnalytics(),
        refetchRequisitionAnalytics(),
        refetchRequisitionTrends(),
        refetchApprovalFunnel(),
        refetchApprovalCycle(),
        refetchSlaCompliance(),
        refetchPoAnalytics(),
        refetchDeliveryPerformance(),
        refetchPoCycleTime(),
        refetchOverduePOs(),
        refetchQuotationResponseRates(),
        refetchSupplierDeliveryPerformance(),
        refetchSupplierQualityRatings(),
        refetchTopSuppliers(),
        refetchFinancialSummary(),
        refetchBudgetUtilization(),
        refetchSpendingAnalysis(),
        refetchCostSavings(),
        refetchOperationSummary(),
        refetchApprovalBottlenecks(),
        refetchGrns(),
        refetchSans(),
        refetchPendingGrns(),
        refetchPendingSans(),
        refetchPurchaseOrders(),
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    refetchStats,
    refetchQuotes,
    refetchActive,
    refetchClosing,
    refetchSupplierQuotes,
    refetchAllRequisitions,
    refetchRequisitionStats,
    refetchSuppliers,
    refetchProcurementAnalytics,
    refetchRequisitionAnalytics,
    refetchRequisitionTrends,
    refetchApprovalFunnel,
    refetchApprovalCycle,
    refetchSlaCompliance,
    refetchPoAnalytics,
    refetchDeliveryPerformance,
    refetchPoCycleTime,
    refetchOverduePOs,
    refetchQuotationResponseRates,
    refetchSupplierDeliveryPerformance,
    refetchSupplierQualityRatings,
    refetchTopSuppliers,
    refetchFinancialSummary,
    refetchBudgetUtilization,
    refetchSpendingAnalysis,
    refetchCostSavings,
    refetchOperationSummary,
    refetchApprovalBottlenecks,
    refetchGrns,
    refetchSans,
    refetchPendingGrns,
    refetchPendingSans,
    refetchPurchaseOrders,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 300000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  // ============================================
  // IS LOADING
  // ============================================

  const isLoading = statsLoading || quotesLoading || activeLoading || closingSoonLoading || supplierQuotesLoading;

  // ============================================
  // RENDER
  // ============================================

  if (isLoading && !isRefreshing) {
    return (
      <PageTemplate
        title="Procurement Dashboard"
        description="Monitor procurement activities and RFQ performance"
        icon={<Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Procurement Dashboard"
      description="Comprehensive overview of procurement activities, requisition status, and RFQ performance"
      icon={<Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement/dashboard' },
        { label: 'Dashboard' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="h-9 w-[130px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
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
            onClick={() => router.push('/procurement/request-for-quotations/create')}
            className="gap-2 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl"
          >
            <Plus className="h-3.5 w-3.5" />
            New RFQ
          </Button>
        </div>
      }
    >
      {/* SECTION 1: KEY METRICS */}
      <StatsCards
        stats={statsItems}
        isLoading={isLoading}
        columns={8}
        variant="default"
        formatCompact={true}
        tagOrientation="none"
      />

      {/* SECTION 2: QUICK ACTIONS */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Actions</h3>
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { icon: Plus, label: 'Create RFQ', href: '/procurement/request-for-quotations/create', color: 'blue' },
            { icon: FileText, label: 'View RFQs', href: '/procurement/request-for-quotations/manage', color: 'purple' },
            { icon: Users, label: 'Suppliers', href: '/procurement/suppliers', color: 'emerald' },
            { icon: ShoppingCart, label: 'POs', href: '/procurement/purchase-orders/manage-orders', color: 'amber' },
            { icon: Warehouse, label: 'GRN', href: '/procurement/goods-received', color: 'teal' },
            { icon: Briefcase, label: 'SAN', href: '/procurement/service-acknowledgments', color: 'cyan' },
            { icon: Receipt, label: 'Invoices', href: '/procurement/invoices', color: 'rose' },
            { icon: BarChart3, label: 'Reports', href: '/procurement/reports', color: 'indigo' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all duration-300 group",
                `border-${action.color}-200 dark:border-${action.color}-800/50`,
                `hover:border-solid hover:border-${action.color}-500 dark:hover:border-${action.color}-500`,
                `hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20`
              )}
            >
              <div className={cn(
                "p-3 rounded-xl transition-all duration-300",
                `bg-${action.color}-50 dark:bg-${action.color}-900/20`,
                `group-hover:bg-${action.color}-100 dark:group-hover:bg-${action.color}-900/30`
              )}>
                <action.icon className={cn(
                  "h-6 w-6",
                  `text-${action.color}-600 dark:text-${action.color}-400`
                )} />
              </div>
              <span className="text-sm font-medium mt-2 text-gray-700 dark:text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: REQUISITION STATUS OVERVIEW */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex-[2]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Requisition Status
                </CardTitle>
                <CardDescription className="text-xs mt-1">Distribution by status with counts</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                {totalRequisitions} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 280 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={requisitionStatusDistribution.slice(0, 7)}
                  layout="vertical"
                  margin={{ left: 80, right: 30, top: 10, bottom: 10 }}
                >
                  <defs>
                    {requisitionStatusDistribution.slice(0, 7).map((item, index) => (
                      <linearGradient key={`grad-${index}`} id={`barGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={item.color} stopOpacity={0.7} />
                        <stop offset="100%" stopColor={item.color} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-white/10" opacity={0.3} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} domain={[0, 'dataMax + 2']} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }} tickLine={false} axisLine={false} width={80} />
                  <RechartsTooltip content={({ active, payload }: any) => {
                    if (!active || !payload) return null;
                    const data = payload[0]?.payload;
                    const total = totalRequisitions;
                    const percentage = total > 0 ? (data?.value / total) * 100 : 0;
                    return (
                      <div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[180px]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: data?.color }} />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{data?.name}</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Count</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{data?.value}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Percentage</span>
                            <span className="text-sm font-semibold" style={{ color: data?.color }}>{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: data?.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  }} />
                  <Bar dataKey="value" name="Requisitions" radius={[0, 6, 6, 0]} barSize={32} animationDuration={1000} animationEasing="ease-out" label={{ position: 'right', fill: '#6b7280', fontSize: 11, fontWeight: 600 }}>
                    {requisitionStatusDistribution.slice(0, 7).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#barGrad-${index})`} style={{ filter: `drop-shadow(0 2px 8px ${entry.color}30)`, cursor: 'pointer' }} className="hover:opacity-80 transition-opacity duration-200" onClick={() => router.push(`/requisitions/manage?status=${entry.status}`)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <ClipboardList className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Stats</h4>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Total', value: totalRequisitions, color: 'blue', href: '/requisitions/manage' },
              { label: 'Ready for RFQ', value: readyForProcurement, color: 'emerald', href: '/procurement/request-for-quotations/create' },
              { label: 'In Progress', value: inProgress, color: 'amber', href: '/procurement/request-for-quotations/manage?status=in_progress' },
              { label: 'Completed', value: completed, color: 'teal', href: '/procurement/request-for-quotations/manage?status=completed' },
              { label: 'With QTNs', value: withQtns, color: 'purple', href: '/procurement/request-for-quotations/manage' },
              { label: 'Without QTNs', value: withoutQtns, color: 'rose', href: '/procurement/request-for-quotations/manage?status=no_qtns' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer hover:shadow-md transition-all duration-200",
                  `bg-${stat.color}-50 dark:bg-${stat.color}-900/20`,
                  `border-${stat.color}-200 dark:border-${stat.color}-800`
                )}
                onClick={() => router.push(stat.href)}
              >
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className={cn("text-xl font-bold", `text-${stat.color}-600 dark:text-${stat.color}-400`)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: CHARTS - Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Activity Trend
                </CardTitle>
                <CardDescription className="text-xs mt-1">Daily activity over {timeRange}</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                {dailyTrend.reduce((acc, item) => acc + item.quotes, 0)} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 300 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorQuotes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRequisitions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPurchaseOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-white/10" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={({ active, payload, label }: any) => {
                    if (!active || !payload) return null;
                    return (
                      <div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[180px]">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
                        {payload.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between gap-4 py-1">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || item.stroke }} />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }} />
                  <Legend />
                  <Area type="monotone" dataKey="quotes" name="RFQs" stroke="#3b82f6" fillOpacity={1} fill="url(#colorQuotes)" />
                  <Area type="monotone" dataKey="requisitions" name="Requisitions" stroke="#10b981" fillOpacity={1} fill="url(#colorRequisitions)" />
                  <Area type="monotone" dataKey="purchaseOrders" name="POs" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPurchaseOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <PieChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  RFQ Status Distribution
                </CardTitle>
                <CardDescription className="text-xs mt-1">Current status breakdown of all RFQs</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                {statusDistribution.reduce((acc, item) => acc + item.value, 0)} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 300 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={({ active, payload }: any) => {
                    if (!active || !payload) return null;
                    return (
                      <div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[180px]">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0]?.payload?.name}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{payload[0]?.value}</p>
                        <p className="text-xs text-muted-foreground">{((payload[0]?.payload?.percent || 0) * 100).toFixed(1)}% of total</p>
                      </div>
                    );
                  }} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 5: APPROVAL FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 group relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Approval Funnel
                </CardTitle>
                <CardDescription className="text-xs mt-1">Requisition to approval conversion tracking</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                {funnelData.length > 0 ? `${funnelData[funnelData.length - 1]?.percentage?.toFixed(0) || 0}%` : '0%'} Conversion
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="relative" style={{ height: 350 }}>
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-emerald-500/5 rounded-xl pointer-events-none" />
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <defs>
                    {funnelData.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`funnelGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Funnel data={funnelData} dataKey="value" nameKey="name" isAnimationActive animationDuration={1500} animationEasing="ease-out">
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#funnelGrad-${index})`} stroke={entry.color} strokeWidth={1} style={{ filter: `drop-shadow(0 4px 12px ${entry.color}30)` }} />
                    ))}
                    <LabelList dataKey="name" position="inside" fill="#fff" stroke="none" fontSize={12} fontWeight="bold" className="drop-shadow-sm" />
                    <LabelList dataKey="value" position="right" fill="#6b7280" fontSize={12} fontWeight="semibold" formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value} />
                  </Funnel>
                  <RechartsTooltip content={({ active, payload }: any) => {
                    if (!active || !payload) return null;
                    return (
                      <div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[180px]">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0]?.payload?.name}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{payload[0]?.value}</p>
                        <p className="text-xs text-muted-foreground">{payload[0]?.payload?.percentage?.toFixed(1)}% of total</p>
                      </div>
                    );
                  }} />
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 group relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  Approval Bottlenecks
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {bottlenecks.length > 0 ? `${criticalBottlenecks.length} critical, ${warningBottlenecks.length} warning bottlenecks detected` : 'All approval stages performing optimally'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">{bottlenecks.length} Stages</Badge>
                {bottlenecks.length > 0 && (
                  <Badge className={cn("text-[10px] rounded-full px-3 py-1", criticalBottlenecks.length > 0 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : warningBottlenecks.length > 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400")}>
                    {criticalBottlenecks.length > 0 ? `${criticalBottlenecks.length} Critical` : warningBottlenecks.length > 0 ? `${warningBottlenecks.length} Warning` : 'Healthy'}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {bottlenecks.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div style={{ height: 300 }} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bottlenecks.map(b => ({ ...b, fillColor: b.bottleneck_status === 'critical' ? '#ef4444' : b.bottleneck_status === 'warning' ? '#f59e0b' : '#10b981', criticalThreshold: 48, warningThreshold: 24 }))} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                        <defs>
                          {bottlenecks.map((b, i) => (
                            <linearGradient key={`grad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={b.bottleneck_status === 'critical' ? '#ef4444' : b.bottleneck_status === 'warning' ? '#f59e0b' : '#10b981'} stopOpacity={0.7} />
                              <stop offset="100%" stopColor={b.bottleneck_status === 'critical' ? '#dc2626' : b.bottleneck_status === 'warning' ? '#d97706' : '#059669'} stopOpacity={0.9} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-white/10" opacity={0.3} horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} domain={[0, 'dataMax + 10']} label={{ value: 'Hours', position: 'bottom', fontSize: 10, fill: '#6b7280' }} />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} width={100} />
                        <RechartsTooltip content={({ active, payload }: any) => {
                          if (!active || !payload) return null;
                          const data = payload[0]?.payload;
                          return (
                            <div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[220px]">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.bottleneck_status === 'critical' ? '#ef4444' : data.bottleneck_status === 'warning' ? '#f59e0b' : '#10b981' }} />
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.label}</p>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Stage</span><span className="text-xs font-medium text-gray-700 dark:text-gray-300">{data.stage}</span></div>
                                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Avg Time</span><span className="text-sm font-bold text-gray-900 dark:text-gray-100">{data.avg_time_hours.toFixed(1)}h</span></div>
                                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Status</span><Badge className={cn("text-[10px] rounded-full px-2 py-0.5", data.bottleneck_status === 'critical' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : data.bottleneck_status === 'warning' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400")}>{data.bottleneck_status}</Badge></div>
                              </div>
                            </div>
                          );
                        }} />
                        <Bar dataKey="avg_time_hours" name="Avg Time (hours)" radius={[0, 6, 6, 0]} barSize={32} animationDuration={1000} animationEasing="ease-out">
                          {bottlenecks.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#barGrad-${index})`} style={{ filter: `drop-shadow(0 2px 8px ${entry.bottleneck_status === 'critical' ? '#ef4444' : entry.bottleneck_status === 'warning' ? '#f59e0b' : '#10b981'}30)` }} />
                          ))}
                          <LabelList dataKey="avg_time_hours" position="right" fill="#6b7280" fontSize={10} fontWeight="semibold" />
                        </Bar>
                        <ReferenceLine x={24} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: 'Warning', position: 'top', fontSize: 8, fill: '#f59e0b' }} />
                        <ReferenceLine x={48} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: 'Critical', position: 'top', fontSize: 8, fill: '#ef4444' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <ScrollArea className="h-[300px] pr-2">
                    <div className="space-y-3">
                      {bottlenecks.map((bottleneck, index) => (
                        <div key={index} className={cn("p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] cursor-default", bottleneck.bottleneck_status === 'critical' ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20" : bottleneck.bottleneck_status === 'warning' ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20" : "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20")}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={cn("p-1.5 rounded-lg flex-shrink-0", bottleneck.bottleneck_status === 'critical' ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : bottleneck.bottleneck_status === 'warning' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400")}>
                                {bottleneck.bottleneck_status === 'critical' ? <AlertCircle className="h-3.5 w-3.5" /> : bottleneck.bottleneck_status === 'warning' ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{bottleneck.label}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{bottleneck.stage}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{bottleneck.avg_time_hours.toFixed(1)}h</span>
                              <div className={cn("h-2 w-2 rounded-full flex-shrink-0", bottleneck.bottleneck_status === 'critical' ? "bg-red-500 animate-pulse" : bottleneck.bottleneck_status === 'warning' ? "bg-amber-500" : "bg-emerald-500")} />
                            </div>
                          </div>
                          <div className="w-full h-1 mt-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((bottleneck.avg_time_hours / 72) * 100, 100)}%`, backgroundColor: bottleneck.bottleneck_status === 'critical' ? '#ef4444' : bottleneck.bottleneck_status === 'warning' ? '#f59e0b' : '#10b981' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative p-5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full"><CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" /></div>
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-4">No Bottlenecks Detected</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">All approval stages are performing optimally with average times within acceptable thresholds.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION 6: GRN & SAN STATUS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg"><Warehouse className="h-4 w-4 text-teal-600 dark:text-teal-400" /></div>
                  GRN Status Distribution
                </CardTitle>
                <CardDescription className="text-xs mt-1">Goods Received Notes by status</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">{totalGrns} Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 250 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={grnStatusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {grnStatusDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />))}
                  </Pie>
                  <RechartsTooltip content={({ active, payload }: any) => {
                    if (!active || !payload) return null;
                    return (<div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[180px]"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0]?.payload?.name}</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{payload[0]?.value}</p></div>);
                  }} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: 'Total', value: totalGrns, color: 'gray' },
                { label: 'Completed', value: completedGrns, color: 'emerald' },
                { label: 'Pending', value: pendingGrnApprovals, color: 'amber' },
                { label: 'Rejected', value: rejectedGrns, color: 'red' },
              ].map((s) => (
                <div key={s.label} className={cn("text-center p-2 rounded-lg", `bg-${s.color}-50 dark:bg-${s.color}-900/20`)}>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={cn("text-lg font-bold", `text-${s.color}-600 dark:text-${s.color}-400`)}>{s.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-1.5 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg"><Briefcase className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /></div>
                  SAN Status Distribution
                </CardTitle>
                <CardDescription className="text-xs mt-1">Service Acknowledgment Notes by status</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">{totalSans} Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 250 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={[
                    { name: 'Draft', value: sans.filter(s => s.status === 'draft').length, color: '#94a3b8' },
                    { name: 'Submitted', value: sans.filter(s => s.status === 'submitted').length, color: '#6366f1' },
                    { name: 'HOD Approved', value: sans.filter(s => s.status === 'hod_approved').length, color: '#f59e0b' },
                    { name: 'Principal Approved', value: sans.filter(s => s.status === 'principal_approved').length, color: '#f59e0b' },
                    { name: 'Completed', value: sans.filter(s => s.status === 'completed').length, color: '#10b981' },
                    { name: 'Rejected', value: sans.filter(s => s.status === 'rejected').length, color: '#ef4444' },
                  ].filter(item => item.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {[
                      { name: 'Draft', value: sans.filter(s => s.status === 'draft').length, color: '#94a3b8' },
                      { name: 'Submitted', value: sans.filter(s => s.status === 'submitted').length, color: '#6366f1' },
                      { name: 'HOD Approved', value: sans.filter(s => s.status === 'hod_approved').length, color: '#f59e0b' },
                      { name: 'Principal Approved', value: sans.filter(s => s.status === 'principal_approved').length, color: '#f59e0b' },
                      { name: 'Completed', value: sans.filter(s => s.status === 'completed').length, color: '#10b981' },
                      { name: 'Rejected', value: sans.filter(s => s.status === 'rejected').length, color: '#ef4444' },
                    ].filter(item => item.value > 0).map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />))}
                  </Pie>
                  <RechartsTooltip content={({ active, payload }: any) => {
                    if (!active || !payload) return null;
                    return (<div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[180px]"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0]?.payload?.name}</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{payload[0]?.value}</p></div>);
                  }} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: 'Total', value: totalSans, color: 'gray' },
                { label: 'Completed', value: completedSans, color: 'emerald' },
                { label: 'Pending', value: pendingSanApprovals, color: 'amber' },
                { label: 'Rejected', value: rejectedSans, color: 'red' },
              ].map((s) => (
                <div key={s.label} className={cn("text-center p-2 rounded-lg", `bg-${s.color}-50 dark:bg-${s.color}-900/20`)}>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={cn("text-lg font-bold", `text-${s.color}-600 dark:text-${s.color}-400`)}>{s.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 7: SUPPLIER PERFORMANCE & RESPONSE RATES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"><Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /></div>
                  Supplier Performance
                </CardTitle>
                <CardDescription className="text-xs mt-1">Quotes and acceptance rates by supplier</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">{supplierPerformanceData.length} Suppliers</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 320 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={supplierPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-white/10" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip content={({ active, payload }: any) => {
                    if (!active || !payload) return null;
                    return (<div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[200px]"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0]?.payload?.name}</p>{payload.map((item: any) => (<div key={item.name} className="flex items-center justify-between gap-4 py-1"><span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span><span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.value}</span></div>))}</div>);
                  }} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
                  <Bar yAxisId="left" dataKey="quotes" name="Total Quotes" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar yAxisId="left" dataKey="accepted" name="Accepted" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="rate" name="Acceptance Rate %" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><Percent className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
                  Response Rates by RFQ
                </CardTitle>
                <CardDescription className="text-xs mt-1">Top RFQs by supplier response rate</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">{responseRateData.length} RFQs</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4">
                {responseRateData.map((item, index) => (
                  <div key={index} className="space-y-1 group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2.5 rounded-lg transition-all duration-200 hover:pl-4" onClick={() => router.push(`/procurement/request-for-quotations/manage/${item.name}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-6">#{index + 1}</span>
                        <div className="relative"><span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} /></div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[180px] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">{item.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{item.responses}/{item.total}</span>
                        <span className={cn("text-sm font-bold min-w-[40px] text-right", item.rate >= 80 ? "text-emerald-600 dark:text-emerald-400" : item.rate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>{item.rate}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700 group-hover:shadow-lg" style={{ width: `${item.rate}%`, backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}40` }} />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 8: RECENT RFQs, GRNs, SANs & POs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                Recent RFQs
              </CardTitle>
              <CardDescription className="text-xs mt-1">Latest 5 request for quotations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/procurement/request-for-quotations/manage')} className="gap-1 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">View All<ChevronRight className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5">
                    {['RFQ #', 'Title', 'Status', 'Responses', 'Action'].map((h) => (
                      <th key={h} className={cn("text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap", h === 'Action' ? 'text-right' : 'text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quotations.sort((a: QuotationRequest, b: QuotationRequest) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map((rfq: QuotationRequest) => (
                    <tr key={rfq.id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => router.push(`/procurement/request-for-quotations/manage/${rfq.id}`)}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{rfq.qtn_number}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{rfq.title}</td>
                      <td className="px-4 py-3"><StatusBadge status={rfq.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rfq.response_count || 0}</span>
                          <span className="text-xs text-muted-foreground">/ {rfq.sent_suppliers_count || 0}</span>
                          <div className="w-12 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(rfq.response_rate || 0, 100)}%`, backgroundColor: (rfq.response_rate || 0) >= 80 ? '#10b981' : (rfq.response_rate || 0) >= 50 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5" onClick={(e) => { e.stopPropagation(); router.push(`/procurement/request-for-quotations/manage/${rfq.id}`); }}>
                          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {quotations.length === 0 && (<tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No RFQs found</td></tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg"><Warehouse className="h-4 w-4 text-teal-600 dark:text-teal-400" /></div>
                Recent GRNs & SANs
              </CardTitle>
              <CardDescription className="text-xs mt-1">Latest goods and service receipts</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/procurement/goods-received')} className="gap-1 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">GRNs<ChevronRight className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/procurement/service-acknowledgments')} className="gap-1 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">SANs<ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5">
                    {['Type', 'Number', 'Status', 'Date', 'Action'].map((h) => (
                      <th key={h} className={cn("text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap", h === 'Action' ? 'text-right' : 'text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...grns, ...sans].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map((item) => {
                    const isGrn = 'grn_number' in item;
                    const number = isGrn ? item.grn_number : (item as ServiceAcknowledgmentNote).san_number;
                    const status = item.status;
                    const date = item.created_at;
                    const id = item.id;
                    const route = isGrn ? '/procurement/goods-received' : '/procurement/service-acknowledgments';
                    return (
                      <tr key={`${isGrn ? 'grn' : 'san'}-${id}`} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => router.push(`${route}/${id}`)}>
                        <td className="px-4 py-3">
                          <Badge className={cn("text-xs rounded-full px-2 py-0.5", isGrn ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400")}>{isGrn ? 'GRN' : 'SAN'}</Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{number}</td>
                        <td className="px-4 py-3">
                          <Badge className={cn("flex items-center gap-1.5 px-3 py-1 font-medium rounded-full border-0", status === 'completed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : status === 'submitted' ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : status === 'hod_approved' || status === 'principal_approved' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : status === 'rejected' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300")}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getGrnStatusColor(status) }} />
                            {getGrnStatusLabel(status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm">{formatDate(date)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5" onClick={(e) => { e.stopPropagation(); router.push(`${route}/${id}`); }}>
                            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {grns.length === 0 && sans.length === 0 && (<tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No GRNs or SANs found</td></tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 9: BUDGET UTILIZATION & COST SAVINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
                  Budget Utilization
                </CardTitle>
                <CardDescription className="text-xs mt-1">Budget vs actual spending by department</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">{budgetUtilization?.length || 0} Departments</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 320 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetUtilization?.slice(0, 8) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-white/10" opacity={0.5} />
                  <XAxis dataKey="department_name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <RechartsTooltip content={({ active, payload }: any) => {
                    if (!active || !payload) return null;
                    return (<div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[200px]"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0]?.payload?.department_name}</p>{payload.map((item: any) => (<div key={item.name} className="flex items-center justify-between gap-4 py-1"><span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span><span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(item.value)}</span></div>))}<div className="mt-2 pt-2 border-t border-gray-200 dark:border-white/10"><div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-300">Utilization</span><span className={cn("text-sm font-bold", (payload[0]?.payload?.utilization_rate || 0) > 90 ? "text-red-600 dark:text-red-400" : (payload[0]?.payload?.utilization_rate || 0) > 70 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>{payload[0]?.payload?.utilization_rate?.toFixed(0)}%</span></div></div></div>);
                  }} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
                  <Bar dataKey="total_budget" name="Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="total_spent" name="Spent" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><TrendingDown className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
                  Cost Savings & SLA
                </CardTitle>
                <CardDescription className="text-xs mt-1">Savings performance and SLA compliance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSavings)}</p>
                <p className="text-xs text-muted-foreground mt-1">{savingsRate.toFixed(1)}% savings rate</p>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">SLA Compliance</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{slaComplianceRate.toFixed(0)}%</p>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${slaComplianceRate}%`, backgroundColor: slaComplianceRate >= 90 ? '#10b981' : slaComplianceRate >= 70 ? '#f59e0b' : '#ef4444' }} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: Clock, label: 'Avg Approval Time', sub: 'Total cycle time', value: `${avgApprovalTime.toFixed(1)}h`, color: 'blue' },
                { icon: ShoppingCart, label: 'PO Completion', sub: `${completedPOs} of ${totalPOs} completed`, value: `${poCompletionRate.toFixed(0)}%`, color: 'amber' },
                { icon: AlertTriangle, label: 'Overdue POs', sub: `${overduePOsCount} overdue`, value: `${overdueRate.toFixed(0)}%`, color: 'rose' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", `bg-${item.color}-50 dark:bg-${item.color}-900/20`)}>
                      <item.icon className={cn("h-4 w-4", `text-${item.color}-600 dark:text-${item.color}-400`)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </div>
                  <p className={cn("text-lg font-bold", item.color === 'rose' ? 'text-rose-600 dark:text-rose-400' : item.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100')}>{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 10: APPROVAL FLOW CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg"><GitBranch className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
                  Approval Flow Distribution
                </CardTitle>
                <CardDescription className="text-xs mt-1">Requisitions by approval stage</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">{totalRequisitions} Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 280 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { stage: 'HOD', approved: requisitionStats?.hod_approved || 0, declined: requisitionStats?.hod_declined || 0 },
                  { stage: 'Accountant', approved: requisitionStats?.accountant_approved || 0, declined: requisitionStats?.accountant_declined || 0 },
                  { stage: 'Principal', approved: requisitionStats?.principal_approved || 0, declined: requisitionStats?.principal_declined || 0 },
                  { stage: 'Final', approved: requisitionStats?.final_approved || 0, declined: requisitionStats?.final_declined || 0 },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-white/10" opacity={0.5} />
                  <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
                  <RechartsTooltip content={({ active, payload }: any) => {
                    if (!active || !payload) return null;
                    return (<div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[180px]"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0]?.payload?.stage}</p>{payload.map((item: any) => (<div key={item.name} className="flex items-center justify-between gap-4 py-1"><span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span><span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.value}</span></div>))}</div>);
                  }} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
                  <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="declined" name="Declined" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg"><PieChart className="h-4 w-4 text-teal-600 dark:text-teal-400" /></div>
                  Requisition Status Breakdown
                </CardTitle>
                <CardDescription className="text-xs mt-1">Overall status distribution</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">{totalRequisitions} Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div style={{ height: 280 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={[
                    { name: 'Approved', value: requisitionStats?.final_approved || 0, color: '#10b981' },
                    { name: 'Pending', value: requisitionStats?.pending || 0, color: '#f59e0b' },
                    { name: 'Declined', value: (requisitionStats?.hod_declined || 0) + (requisitionStats?.accountant_declined || 0) + (requisitionStats?.principal_declined || 0) + (requisitionStats?.final_declined || 0), color: '#ef4444' },
                    { name: 'Returned', value: requisitionStats?.returned || 0, color: '#8b5cf6' },
                    { name: 'Draft', value: requisitionStats?.draft || 0, color: '#94a3b8' },
                    { name: 'Cancelled', value: requisitionStats?.cancelled || 0, color: '#6b7280' },
                  ].filter(item => item.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {[
                      { name: 'Approved', value: requisitionStats?.final_approved || 0, color: '#10b981' },
                      { name: 'Pending', value: requisitionStats?.pending || 0, color: '#f59e0b' },
                      { name: 'Declined', value: (requisitionStats?.hod_declined || 0) + (requisitionStats?.accountant_declined || 0) + (requisitionStats?.principal_declined || 0) + (requisitionStats?.final_declined || 0), color: '#ef4444' },
                      { name: 'Returned', value: requisitionStats?.returned || 0, color: '#8b5cf6' },
                      { name: 'Draft', value: requisitionStats?.draft || 0, color: '#94a3b8' },
                      { name: 'Cancelled', value: requisitionStats?.cancelled || 0, color: '#6b7280' },
                    ].filter(item => item.value > 0).map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />))}
                  </Pie>
                  <RechartsTooltip content={({ active, payload }: any) => {
                    if (!active || !payload) return null;
                    return (<div className="bg-background border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 min-w-[180px]"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0]?.payload?.name}</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{payload[0]?.value}</p></div>);
                  }} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
