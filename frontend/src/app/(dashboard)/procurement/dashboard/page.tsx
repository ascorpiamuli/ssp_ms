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
  Minus,
  ThumbsUp,
  ThumbsDown,
  Store,
  Receipt,
  Building2,
  Calendar,
  CreditCard,
  Package,
  Truck,
  Globe,
  Shield,
  Star,
  TrendingDown,
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

// Types
import type { QuotationRequest } from '@/types/quotations.types';
import type { Requisition, RequisitionStats } from '@/types/requisition.types';
import type { PaginatedResponse } from '@/types/common.types';

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
    principal_approved: 'Principal / Head of Institution Approved',
    principal_declined: 'Principal / Head of Institution Declined',
    final_approved: 'Director / FInance Administrator Approved',
    final_declined: 'Director / FInance Administrator  Declined',
    returned: 'Returned',
    cancelled: 'Cancelled',
    revised: 'Revised',
  };
  return map[status] || status;
};

const getRequisitionStatusBgColor = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    submitted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    hod_approved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    hod_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    accountant_approved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    accountant_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    principal_approved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    principal_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    final_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    final_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    returned: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    revised: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  };
  return map[status] || 'bg-gray-100 dark:bg-gray-800';
};

// ============================================
// BADGE COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const statusBgMap: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
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

const RequisitionStatusBadge = ({ status }: { status: string }) => {
  const color = getRequisitionStatusColor(status);
  const bgColor = getRequisitionStatusBgColor(status);

  return (
    <Badge className={cn("flex items-center gap-1.5 px-3 py-1 font-medium rounded-full border-0", bgColor)}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {getRequisitionStatusLabel(status)}
    </Badge>
  );
};

// ============================================
// STATS CARD
// ============================================

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
  color?: string;
  loading?: boolean;
  href?: string;
}

const StatsCard = ({ title, value, icon: Icon, trend, trendLabel, subtitle, color = 'blue', loading, href }: StatsCardProps) => {
  const router = useRouter();

  const colorMap: Record<string, { bg: string; icon: string; gradient: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-blue-600' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-500 to-emerald-600' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', gradient: 'from-amber-500 to-amber-600' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400', gradient: 'from-purple-500 to-purple-600' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'text-indigo-600 dark:text-indigo-400', gradient: 'from-indigo-500 to-indigo-600' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400', gradient: 'from-red-500 to-red-600' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', icon: 'text-teal-600 dark:text-teal-400', gradient: 'from-teal-500 to-teal-600' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'text-rose-600 dark:text-rose-400', gradient: 'from-rose-500 to-rose-600' },
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', icon: 'text-cyan-600 dark:text-cyan-400', gradient: 'from-cyan-500 to-cyan-600' },
  };

  const colors = colorMap[color] || colorMap.blue;

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden animate-pulse">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 hover:shadow-md transition-all duration-300 group overflow-hidden",
        href && "hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer hover:scale-[1.02]"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </p>
            <p className="text-2xl font-bold mt-1.5 text-gray-900 dark:text-gray-100 truncate">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
            {trend !== undefined && trend !== 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-medium rounded-full px-2 py-0.5 border-0",
                    trend > 0 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" :
                      trend < 0 ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" :
                        "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  )}
                >
                  {trend > 0 ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> :
                    trend < 0 ? <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" /> :
                      <Minus className="h-2.5 w-2.5 mr-0.5" />}
                  {Math.abs(trend)}%
                </Badge>
                {trendLabel && (
                  <span className="text-[10px] text-muted-foreground">{trendLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg", colors.bg, colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className={cn("h-0.5 w-full mt-3 rounded-full bg-gradient-to-r", colors.gradient)} />
      </CardContent>
    </Card>
  );
};

// ============================================
// MINI STATS CARD
// ============================================

interface MiniStatsCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ElementType;
  subtitle?: string;
  href?: string;
}

const MiniStatsCard = ({ label, value, color = 'blue', icon: Icon, subtitle, href }: MiniStatsCardProps) => {
  const router = useRouter();

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  };

  const colors = colorMap[color] || colorMap.blue;

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3.5 p-4 bg-white dark:bg-gray-900 rounded-xl border transition-all duration-200",
        colors.border,
        href && "cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-gray-300 dark:hover:border-gray-600"
      )}
      onClick={handleClick}
    >
      {Icon && (
        <div className={cn("p-2.5 rounded-xl flex-shrink-0", colors.bg, colors.text)}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-lg font-bold mt-0.5 text-gray-900 dark:text-gray-100">
          {value}
        </p>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// ============================================
// CHART CARD
// ============================================

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  height?: number;
  className?: string;
  href?: string;
}

const ChartCard = ({ title, description, children, icon: Icon, height = 300, className, href }: ChartCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <Card
      className={cn(
        "border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden",
        href && "cursor-pointer hover:shadow-md transition-all duration-300",
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            <span className="truncate">{title}</span>
          </CardTitle>
          {description && <CardDescription className="truncate">{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div style={{ height }} className="w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// CUSTOM TOOLTIP
// ============================================

const CustomTooltip = ({ active, payload, label }: any) => {
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
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================
// QUICK ACTION BUTTON
// ============================================

interface QuickActionProps {
  label: string;
  icon: React.ElementType;
  href: string;
  color?: string;
  description?: string;
}

const QuickAction = ({ label, icon: Icon, href, color = 'blue', description }: QuickActionProps) => {
  const router = useRouter();

  const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', hover: 'hover:bg-red-100 dark:hover:bg-red-900/30' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400', hover: 'hover:bg-teal-100 dark:hover:bg-teal-900/30' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/30' },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={() => router.push(href)}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all duration-300 group",
        colors.bg,
        colors.hover,
        "border-gray-200 dark:border-gray-700 hover:border-solid hover:shadow-lg"
      )}
    >
      <div className={cn("p-3 rounded-xl transition-all duration-300 group-hover:scale-110", colors.bg)}>
        <Icon className={cn("h-6 w-6", colors.text)} />
      </div>
      <span className="text-sm font-medium mt-2 text-gray-700 dark:text-gray-300">{label}</span>
      {description && (
        <span className="text-xs text-muted-foreground mt-0.5">{description}</span>
      )}
    </button>
  );
};

// ============================================
// HELPERS FOR EXTRACTING DATA
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
    emergency: 0, average_amount: 0
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
  // HOOKS
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
  // EXTRACT DATA
  // ============================================

  const quotations = extractData(quotationsData);
  const allRequisitions = extractData(allRequisitionsData);
  const suppliers = extractData(suppliersData);
  const supplierQuotations = extractData(supplierQuotationsData);
  const requisitionStats = extractStats(requisitionStatsData);

  // ============================================
  // DERIVED DATA
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

  // Calculate acceptance rate from requisition stats
  const totalApproved = requisitionStats?.approved || 0;
  const totalDeclined = requisitionStats?.declined || 0;
  const totalPending = requisitionStats?.pending || 0;
  const totalReturned = requisitionStats?.returned || 0;

  const acceptanceRate = totalRequisitions > 0 ? (totalApproved / totalRequisitions) * 100 : 0;
  const denialRate = totalRequisitions > 0 ? (totalDeclined / totalRequisitions) * 100 : 0;
  const pendingRate = totalRequisitions > 0 ? (totalPending / totalRequisitions) * 100 : 0;
  const returnedRate = totalRequisitions > 0 ? (totalReturned / totalRequisitions) * 100 : 0;

  const avgResponseRate = useMemo(() => {
    if (!quotations.length) return 0;
    const total = quotations.reduce((acc: number, q: QuotationRequest) => acc + (q.response_rate || 0), 0);
    return total / quotations.length;
  }, [quotations]);

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

      data.push({
        date: format(date, 'MMM dd'),
        quotes: dayQuotes.length,
        requisitions: dayReqs.length,
        responses: dayQuotes.reduce((sum, q) => sum + (q.response_count || 0), 0),
      });
    }
    return data;
  }, [quotations, allRequisitions, timeRange]);

  const monthlyTrend = useMemo(() => {
    const months = 6;
    const data = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthStr = format(date, 'MMM yyyy');

      const monthQuotes = quotations.filter((q: QuotationRequest) => {
        if (!q.created_at) return false;
        const d = new Date(q.created_at);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });

      data.push({
        month: monthStr,
        quotes: monthQuotes.length,
        responses: monthQuotes.reduce((sum, q) => sum + (q.response_count || 0), 0),
        rate: monthQuotes.length > 0
          ? monthQuotes.reduce((sum, q) => sum + (q.response_rate || 0), 0) / monthQuotes.length
          : 0,
      });
    }
    return data;
  }, [quotations]);

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

  const funnelData = useMemo(() => {
    return [
      { name: 'Total Requisitions', value: totalRequisitions, color: '#6366f1' },
      { name: 'Ready for RFQ', value: readyForProcurement, color: '#3b82f6' },
      { name: 'With QTNs', value: withQtns, color: '#8b5cf6' },
      { name: 'In Progress', value: inProgress, color: '#f59e0b' },
      { name: 'Completed', value: completed, color: '#10b981' },
    ];
  }, [totalRequisitions, readyForProcurement, withQtns, inProgress, completed]);

  const trendData = useMemo(() => {
    const lastMonth = quotations.filter((q: QuotationRequest) => {
      if (!q.created_at) return false;
      const d = new Date(q.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear();
    });
    const currentMonth = quotations.filter((q: QuotationRequest) => {
      if (!q.created_at) return false;
      const d = new Date(q.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const lastCount = lastMonth.length;
    const currentCount = currentMonth.length;
    const trend = lastCount > 0 ? ((currentCount - lastCount) / lastCount) * 100 : 0;

    return {
      trend: Math.round(trend),
      current: currentCount,
      previous: lastCount,
    };
  }, [quotations]);

  const supplierPerformance = useMemo(() => {
    const supplierMap: Record<string, { name: string; quotes: number; accepted: number; rate: number; totalValue: number; company?: string }> = {};

    supplierQuotations.forEach((sq: any) => {
      const supplierName = sq.supplier?.company_name || sq.supplier?.full_name || 'Unknown';
      if (!supplierMap[supplierName]) {
        supplierMap[supplierName] = {
          name: supplierName,
          quotes: 0,
          accepted: 0,
          rate: 0,
          totalValue: 0,
          company: sq.supplier?.company_name,
        };
      }
      supplierMap[supplierName].quotes += 1;
      if (sq.status === 'accepted') {
        supplierMap[supplierName].accepted += 1;
        supplierMap[supplierName].totalValue += sq.total_amount || 0;
      }
    });

    return Object.values(supplierMap)
      .map(s => ({
        ...s,
        rate: s.quotes > 0 ? Math.round((s.accepted / s.quotes) * 100) : 0,
      }))
      .sort((a, b) => b.quotes - a.quotes)
      .slice(0, 8);
  }, [supplierQuotations]);

  const valueDistribution = useMemo(() => {
    const ranges = [
      { label: '$0 - $1K', min: 0, max: 1000 },
      { label: '$1K - $5K', min: 1000, max: 5000 },
      { label: '$5K - $10K', min: 5000, max: 10000 },
      { label: '$10K - $50K', min: 10000, max: 50000 },
      { label: '$50K - $100K', min: 50000, max: 100000 },
      { label: '$100K+', min: 100000, max: Infinity },
    ];

    return ranges.map(range => {
      const count = quotations.filter((q: QuotationRequest) => {
        const amount = q.requisition?.total_amount || 0;
        return amount >= range.min && amount < range.max;
      }).length;
      return { ...range, count };
    });
  }, [quotations]);

  const recentQuotations = useMemo(() => {
    return quotations
      .sort((a: QuotationRequest, b: QuotationRequest) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 5);
  }, [quotations]);

  const recentRequisitions = useMemo(() => {
    return allRequisitions
      .sort((a: Requisition, b: Requisition) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 5);
  }, [allRequisitions]);

  const isLoading = statsLoading || quotesLoading || activeLoading || closingSoonLoading || supplierQuotesLoading;

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
            <SelectTrigger className="h-9 w-[130px] rounded-xl dark:bg-gray-800 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
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
      {/* ============================================ */}
      {/* SECTION 1: KEY METRICS - Primary Stats Row */}
      {/* ============================================ */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total RFQs"
          value={totalQtns}
          icon={FileText}
          trend={trendData.trend}
          trendLabel="vs last month"
          color="blue"
          loading={isLoading}
          href="/procurement/request-for-quotations/manage"
        />
        <StatsCard
          title="Active RFQs"
          value={activeCount}
          icon={Activity}
          trend={activeCount > 0 ? 8 : 0}
          trendLabel="vs last month"
          color="emerald"
          loading={isLoading}
          href="/procurement/request-for-quotations/manage?status=sent,responded,evaluating"
        />
        <StatsCard
          title="Closing Soon"
          value={closingSoonCount}
          icon={AlertCircle}
          subtitle={closingSoonCount > 0 ? `${closingSoonCount} closing within 48hrs` : 'All good'}
          color="amber"
          loading={isLoading}
          href="/procurement/request-for-quotations/manage?closing_soon=true"
        />
        <StatsCard
          title="Response Rate"
          value={`${Math.round(avgResponseRate)}%`}
          icon={TrendingUp}
          trend={5}
          trendLabel="vs last month"
          color="purple"
          loading={isLoading}
        />
        <StatsCard
          title="Supplier Quotes"
          value={supplierQuoteCount}
          icon={Users}
          trend={12}
          trendLabel="vs last month"
          color="indigo"
          loading={isLoading}
          href="/procurement/request-for-quotations/responses"
        />
      </div>

      {/* ============================================ */}
      {/* SECTION 2: QUICK ACTIONS - Below Stats */}
      {/* ============================================ */}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <QuickAction
            label="Create RFQ"
            icon={Plus}
            href="/procurement/request-for-quotations/create"
            color="blue"
            description="New request"
          />
          <QuickAction
            label="View RFQs"
            icon={FileText}
            href="/procurement/request-for-quotations/manage"
            color="purple"
            description="All RFQs"
          />
          <QuickAction
            label="Manage Suppliers"
            icon={Users}
            href="/procurement/suppliers"
            color="emerald"
            description="Supplier list"
          />
          <QuickAction
            label="Purchase Orders"
            icon={ShoppingCart}
            href="/procurement/purchase-orders"
            color="amber"
            description="LPO/LSO"
          />
          <QuickAction
            label="Invoices"
            icon={Receipt}
            href="/procurement/invoices"
            color="rose"
            description="Supplier invoices"
          />
          <QuickAction
            label="Reports"
            icon={BarChart3}
            href="/procurement/reports"
            color="indigo"
            description="Analytics"
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 3: REQUISITION STATUS OVERVIEW */}
      {/* ============================================ */}

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Requisition Status Distribution */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden flex-1 hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <PieChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Requisition Status
                </CardTitle>
                <CardDescription className="text-xs mt-1">Distribution by status with totals</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs rounded-full px-3 py-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {totalRequisitions} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="space-y-3">
              {requisitionStatusDistribution.slice(0, 7).map((item) => {
                const percentage = totalRequisitions > 0 ? (item.value / totalRequisitions) * 100 : 0;
                return (
                  <div
                    key={item.status}
                    className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 p-2.5 rounded-xl transition-all duration-200"
                    onClick={() => router.push(`/requisitions/manage?status=${item.status}`)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 min-w-[24px] text-right">
                          {item.value}
                        </span>
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 min-w-[36px] text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                          boxShadow: `0 0 12px ${item.color}40`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-xs rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 h-10"
                onClick={() => router.push('/requisitions/manage')}
              >
                View All Requisitions
                <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid - Requisition Metrics */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <ClipboardList className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Requisition Metrics</h4>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MiniStatsCard
              label="Total Requisitions"
              value={totalRequisitions}
              color="blue"
              icon={ClipboardList}
              href="/requisitions/manage"
            />
            <MiniStatsCard
              label="Ready for RFQ"
              value={readyForProcurement}
              color="emerald"
              icon={Rocket}
              href="/procurement/request-for-quotations/create"
            />
            <MiniStatsCard
              label="In Progress"
              value={inProgress}
              color="amber"
              icon={Timer}
              href="/procurement/dashboard?tab=in-progress"
            />
            <MiniStatsCard
              label="Completed"
              value={completed}
              color="teal"
              icon={CheckCircle}
              href="/procurement/dashboard?tab=completed"
            />
            <MiniStatsCard
              label="With QTNs"
              value={withQtns}
              color="purple"
              icon={FileCheck}
              href="/procurement/request-for-quotations/manage"
            />
            <MiniStatsCard
              label="Without QTNs"
              value={withoutQtns}
              color="rose"
              icon={XCircle}
              href="/procurement/ready-for-rfq"
            />
            <MiniStatsCard
              label="Completion Rate"
              value={totalRequisitions > 0 ? `${Math.round((completed / totalRequisitions) * 100)}%` : '0%'}
              color="indigo"
              icon={Gauge}
            />
            <MiniStatsCard
              label="Total Suppliers"
              value={suppliers.length}
              color="cyan"
              icon={Store}
              href="/procurement/suppliers"
            />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 4: CHARTS - Main Analytics */}
      {/* ============================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="RFQ Activity Trend"
          description={`Daily RFQ creation over ${timeRange}`}
          icon={Activity}
          href="/procurement/analytics"
        >
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
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="quotes" name="RFQs Created" stroke="#3b82f6" fillOpacity={1} fill="url(#colorQuotes)" />
              <Area type="monotone" dataKey="requisitions" name="Requisitions" stroke="#10b981" fillOpacity={1} fill="url(#colorRequisitions)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="RFQ Status Distribution"
          description="Current status breakdown of all RFQs"
          icon={PieChart}
          href="/procurement/request-for-quotations/manage"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ============================================ */}
      {/* SECTION 5: REQUISITION ANALYTICS - ACCEPTANCE & DENIAL RATES */}
      {/* ============================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Acceptance Rate</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {acceptanceRate.toFixed(0)}%
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <ThumbsUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${acceptanceRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {totalApproved} approved out of {totalRequisitions} total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Denial Rate</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {denialRate.toFixed(0)}%
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <ThumbsDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500 transition-all duration-700"
                  style={{ width: `${denialRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {totalDeclined} denied out of {totalRequisitions} total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Approval</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {totalPending}
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${pendingRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {totalPending} requisitions awaiting approval
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Returned for Revision</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {totalReturned}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-700"
                  style={{ width: `${returnedRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {totalReturned} requisitions returned for revision
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* SECTION 6: PROCUREMENT FUNNEL & VALUE DISTRIBUTION */}
      {/* ============================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Chart 1: Procurement Funnel */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition-all duration-500 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Procurement Funnel
                </CardTitle>
                <CardDescription className="text-xs mt-1">Requisition to completion conversion tracking</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {totalRequisitions > 0 ? `${Math.round((completed / totalRequisitions) * 100)}%` : '0%'} Conversion
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
                  <Funnel
                    data={funnelData}
                    dataKey="value"
                    nameKey="name"
                    isAnimationActive
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {funnelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#funnelGrad-${index})`}
                        stroke={entry.color}
                        strokeWidth={1}
                        style={{
                          filter: `drop-shadow(0 4px 12px ${entry.color}30)`,
                        }}
                      />
                    ))}
                    <LabelList
                      dataKey="name"
                      position="inside"
                      fill="#fff"
                      stroke="none"
                      fontSize={12}
                      fontWeight="bold"
                      className="drop-shadow-sm"
                    />
                    <LabelList
                      dataKey="value"
                      position="right"
                      fill="#6b7280"
                      fontSize={12}
                      fontWeight="semibold"
                      className="dark:text-gray-400"
                      formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value}
                    />
                  </Funnel>
                  <RechartsTooltip content={<CustomTooltip />} />
                </FunnelChart>
              </ResponsiveContainer>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] text-muted-foreground">
                <span>Start: {funnelData[0]?.value || 0}</span>
                <span>End: {funnelData[funnelData.length - 1]?.value || 0}</span>
                <span>Drop-off: {(funnelData[0]?.value || 0) - (funnelData[funnelData.length - 1]?.value || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: RFQ Value Distribution */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition-all duration-500 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  RFQ Value Distribution
                </CardTitle>
                <CardDescription className="text-xs mt-1">Distribution of RFQ amounts by range</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {valueDistribution.reduce((acc, item) => acc + item.count, 0)} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="relative" style={{ height: 350 }}>
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-cyan-500/5 rounded-xl pointer-events-none" />

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueDistribution} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
                  <defs>
                    {valueDistribution.map((entry, index) => (
                      <linearGradient key={`barGrad-${index}`} id={`barGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.7} />
                        <stop offset="100%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.9} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.3} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    className="dark:text-gray-400"
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                    className="dark:text-gray-400"
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="RFQs"
                    radius={[0, 6, 6, 0]}
                    barSize={28}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {valueDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#barGrad-${index})`}
                        style={{
                          filter: `drop-shadow(0 2px 8px ${CHART_COLORS[index % CHART_COLORS.length]}30)`,
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] text-muted-foreground">
                <span>Min: {valueDistribution.find(item => item.count > 0)?.label || 'N/A'}</span>
                <span>Max: {[...valueDistribution].reverse().find(item => item.count > 0)?.label || 'N/A'}</span>
                <span>Avg: {quotations.length > 0 ? `$${Math.round(quotations.reduce((acc, q) => acc + (q.requisition?.total_amount || 0), 0) / quotations.length).toLocaleString()}` : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* SECTION 7: SUPPLIER PERFORMANCE */}
      {/* ============================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Supplier Performance"
          description="Quotes and acceptance rates by supplier"
          icon={Award}
          height={320}
          href="/procurement/suppliers"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={supplierPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis yAxisId="left" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
              <Bar yAxisId="left" dataKey="quotes" name="Total Quotes" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar yAxisId="left" dataKey="accepted" name="Accepted" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              <Line yAxisId="right" type="monotone" dataKey="rate" name="Acceptance Rate %" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Monthly Performance"
          description="RFQ creation and response trends by month"
          icon={BarChart3}
          href="/procurement/analytics"
          height={320}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
              <Bar yAxisId="left" dataKey="quotes" name="RFQs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="responses" name="Responses" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="rate" name="Response Rate %" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ============================================ */}
      {/* SECTION 8: RESPONSE RATES - 2 COLUMN LAYOUT */}
      {/* ============================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Column: Response Rates List */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Percent className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                Response Rates by RFQ
              </CardTitle>
              <CardDescription>Top RFQs by supplier response rate</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/procurement/request-for-quotations/manage')}
              className="gap-1 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4">
                {responseRateData.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-1 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 p-2.5 rounded-lg transition-all duration-200 hover:pl-4"
                    onClick={() => router.push(`/procurement/request-for-quotations/manage/${item.name}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-6">#{index + 1}</span>
                        <div className="relative">
                          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[180px] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">{item.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{item.responses}/{item.total}</span>
                        <span className={cn(
                          "text-sm font-bold min-w-[40px] text-right",
                          item.rate >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                            item.rate >= 50 ? "text-amber-600 dark:text-amber-400" :
                              "text-red-600 dark:text-red-400"
                        )}>
                          {item.rate}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 group-hover:shadow-lg"
                        style={{
                          width: `${item.rate}%`,
                          backgroundColor: item.color,
                          boxShadow: `0 0 12px ${item.color}40`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column: Response Insights */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Response Insights
            </CardTitle>
            <CardDescription>Key metrics and trends</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center hover:shadow-md transition-all duration-200">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {responseRateData.length}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Total RFQs</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center hover:shadow-md transition-all duration-200">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(responseRateData.reduce((acc, item) => acc + item.rate, 0) / (responseRateData.length || 1))}%
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Avg Response Rate</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center hover:shadow-md transition-all duration-200">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {responseRateData.filter(item => item.rate >= 80).length}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">High Performers</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center hover:shadow-md transition-all duration-200">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {responseRateData.reduce((acc, item) => acc + item.responses, 0)}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Responses</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Performance Distribution</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Excellent (80%+)', count: responseRateData.filter(item => item.rate >= 80).length, color: '#10b981' },
                  { label: 'Good (50-79%)', count: responseRateData.filter(item => item.rate >= 50 && item.rate < 80).length, color: '#f59e0b' },
                  { label: 'Needs Improvement (<50%)', count: responseRateData.filter(item => item.rate < 50).length, color: '#ef4444' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600 dark:text-gray-300 flex-1">{item.label}</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 h-9"
              onClick={() => router.push('/procurement/request-for-quotations/create')}
            >
              <Plus className="h-3 w-3 mr-1" />
              Create New RFQ
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* SECTION 9: RECENT RFQs & REQUISITIONS */}
      {/* ============================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent RFQs */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Recent RFQs
              </CardTitle>
              <CardDescription>Latest 5 request for quotations</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/procurement/request-for-quotations/manage')}
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
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">RFQ #</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Title</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Responses</th>
                    <th className="text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotations.map((rfq: QuotationRequest) => (
                    <tr
                      key={rfq.id}
                      className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                      onClick={() => router.push(`/procurement/request-for-quotations/manage/${rfq.id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {rfq.qtn_number}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                        {rfq.title}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={rfq.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rfq.response_count || 0}</span>
                          <span className="text-xs text-muted-foreground">/ {rfq.sent_suppliers_count || 0}</span>
                          <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(rfq.response_rate || 0, 100)}%`,
                                backgroundColor: (rfq.response_rate || 0) >= 80 ? '#10b981' : (rfq.response_rate || 0) >= 50 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/procurement/request-for-quotations/manage/${rfq.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {recentQuotations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No RFQs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Requisitions */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <ClipboardList className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Recent Requisitions
              </CardTitle>
              <CardDescription>Latest 5 requisitions with status</CardDescription>
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
                  {recentRequisitions.map((req: Requisition) => (
                    <tr
                      key={req.id}
                      className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                      onClick={() => router.push(`/requisitions/${req.id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {req.reference_number}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                        {req.title}
                      </td>
                      <td className="px-4 py-3">
                        <RequisitionStatusBadge status={req.status} />
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
                  ))}
                  {recentRequisitions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No requisitions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* SECTION 10: APPROVAL FLOW CHART */}
      {/* ============================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Approval Flow Distribution"
          description="Requisitions by approval stage"
          icon={GitBranch}
          height={280}
          href="/requisitions/manage?tab=approvals"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { stage: 'HOD', approved: requisitionStats?.hod_approved || 0, declined: requisitionStats?.hod_declined || 0 },
              { stage: 'Accountant', approved: requisitionStats?.accountant_approved || 0, declined: requisitionStats?.accountant_declined || 0 },
              { stage: 'Principal', approved: requisitionStats?.principal_approved || 0, declined: requisitionStats?.principal_declined || 0 },
              { stage: 'Final', approved: requisitionStats?.final_approved || 0, declined: requisitionStats?.final_declined || 0 },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
              <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
              <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              <Bar dataKey="declined" name="Declined" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Requisition Status Breakdown"
          description="Overall status distribution"
          icon={PieChart}
          height={280}
          href="/requisitions/manage"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={[
                  { name: 'Approved', value: requisitionStats?.final_approved || 0, color: '#10b981' },
                  { name: 'Pending', value: requisitionStats?.pending || 0, color: '#f59e0b' },
                  { name: 'Declined', value: totalDeclined, color: '#ef4444' },
                  { name: 'Returned', value: requisitionStats?.returned || 0, color: '#8b5cf6' },
                  { name: 'Draft', value: requisitionStats?.draft || 0, color: '#94a3b8' },
                  { name: 'Cancelled', value: requisitionStats?.cancelled || 0, color: '#6b7280' },
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {[
                  { name: 'Approved', value: requisitionStats?.final_approved || 0, color: '#10b981' },
                  { name: 'Pending', value: requisitionStats?.pending || 0, color: '#f59e0b' },
                  { name: 'Declined', value: totalDeclined, color: '#ef4444' },
                  { name: 'Returned', value: requisitionStats?.returned || 0, color: '#8b5cf6' },
                  { name: 'Draft', value: requisitionStats?.draft || 0, color: '#94a3b8' },
                  { name: 'Cancelled', value: requisitionStats?.cancelled || 0, color: '#6b7280' },
                ].filter(item => item.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </PageTemplate>
  );
}
