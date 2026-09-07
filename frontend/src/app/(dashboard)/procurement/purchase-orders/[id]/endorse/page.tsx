// frontend/src/app/(dashboard)/procurement/purchase-orders/[id]/endorse/page.tsx

'use client';

import React, { useState, useMemo } from 'react';
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
  useEndorsePurchaseOrder,
} from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

import type { RequisitionItem } from '@/types/requisition.types';

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
    pending_approval: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
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
// FINANCIAL METRIC CARD
// ============================================

interface FinancialMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'gray' | 'indigo';
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const FinancialMetricCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'blue',
  className,
  size = 'default'
}: FinancialMetricCardProps) => {
  const colorClasses = {
    emerald: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/50',
    blue: 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800/50',
    amber: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/50',
    rose: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-800/50',
    purple: 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-800/50',
    gray: 'bg-gray-50/80 dark:bg-gray-800/30 border-gray-200/60 dark:border-gray-700/50',
    indigo: 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-800/50',
  };

  const iconColors = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    gray: 'bg-gray-100 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  };

  const textColors = {
    emerald: 'text-emerald-700 dark:text-emerald-300',
    blue: 'text-blue-700 dark:text-blue-300',
    amber: 'text-amber-700 dark:text-amber-300',
    rose: 'text-rose-700 dark:text-rose-300',
    purple: 'text-purple-700 dark:text-purple-300',
    gray: 'text-gray-700 dark:text-gray-300',
    indigo: 'text-indigo-700 dark:text-indigo-300',
  };

  const sizeClasses = {
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-5',
  };

  const valueSize = {
    sm: 'text-base',
    default: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSize = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconPadding = {
    sm: 'p-1.5',
    default: 'p-2',
    lg: 'p-2.5',
  };

  return (
    <div className={cn(
      "rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]",
      colorClasses[color],
      sizeClasses[size],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{title}</p>
          <p className={cn("font-bold mt-1 truncate", valueSize[size], textColors[color])}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className={cn("rounded-lg flex-shrink-0 ml-3", iconPadding[size], iconColors[color])}>
          <div className={iconSize[size]}>{icon}</div>
        </div>
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
          {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-rose-500" />}
          {trend === 'neutral' && <Minus className="h-3 w-3 text-gray-400" />}
          <span className={cn(
            "font-medium",
            trend === 'up' ? "text-emerald-600 dark:text-emerald-400" :
              trend === 'down' ? "text-rose-600 dark:text-rose-400" :
                "text-gray-500"
          )}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================
// PRICE COMPARISON ROW - ENHANCED with Supplier-Added Items
// ============================================

interface PriceComparisonRowProps {
  item: any;
  index: number;
  isSupplierAdded?: boolean;
}

const PriceComparisonRow = ({ item, index, isSupplierAdded = false }: PriceComparisonRowProps) => {
  const isSaving = item.isSaving;
  const diffPercent = Math.abs(Math.round(item.percentDifference));
  const isSignificant = Math.abs(item.percentDifference) > 10;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "hover:bg-muted/30 transition-colors group",
        isSupplierAdded ? "bg-purple-50/30 dark:bg-purple-950/15" :
          isSaving ? "bg-emerald-50/20 dark:bg-emerald-950/10" :
            item.difference !== 0 ? "bg-amber-50/20 dark:bg-amber-950/10" : ""
      )}
    >
      <TableCell className="py-3 text-center">
        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
          {index + 1}
        </span>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">{item.itemName}</span>
          {isSupplierAdded && (
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 rounded-full text-[10px]">
              <Sparkles className="h-3 w-3 mr-0.5" />
              Supplier Added
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0 h-5 text-muted-foreground">
            {item.quantity} units
          </Badge>
        </div>
      </TableCell>
      <TableCell className="py-3 text-right">
        {isSupplierAdded ? (
          <span className="text-muted-foreground italic">—</span>
        ) : (
          <span className="text-gray-600 dark:text-gray-400">{formatCurrency(item.estimatedPrice)}</span>
        )}
      </TableCell>
      <TableCell className="py-3 text-right">
        <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(item.actualPrice)}</span>
      </TableCell>
      <TableCell className="py-3 text-right">
        {isSupplierAdded ? (
          <span className="text-purple-600 dark:text-purple-400 text-xs font-medium">New Item</span>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <span className={cn(
              "font-semibold",
              isSaving ? "text-emerald-600 dark:text-emerald-400" :
                item.difference > 0 ? "text-amber-600 dark:text-amber-400" :
                  "text-gray-500"
            )}>
              {isSaving ? `-${formatCurrency(Math.abs(item.difference))}` : formatCurrency(item.difference)}
            </span>
            {item.difference !== 0 && (
              <Badge className={cn(
                "rounded-full text-[10px] border-0",
                isSaving ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              )}>
                {isSaving ? '↓' : '↑'} {diffPercent}%
              </Badge>
            )}
            {isSignificant && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500">
                      <AlertCircle className="h-3.5 w-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isSaving ? 'Significant cost saving detected' : 'Significant price increase detected'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="py-3 text-right font-medium text-gray-900 dark:text-gray-100">
        {formatCurrency(item.totalActual)}
      </TableCell>
      <TableCell className="py-3 text-center">
        {isSupplierAdded ? (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 rounded-full">
            <Sparkles className="h-3 w-3 mr-1" />
            Added
          </Badge>
        ) : isSaving ? (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 rounded-full">
            <ArrowDownRight className="h-3 w-3 mr-1" />
            Saving
          </Badge>
        ) : item.difference > 0 ? (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0 rounded-full">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0 rounded-full">
            <Minus className="h-3 w-3 mr-1" />
            On Budget
          </Badge>
        )}
      </TableCell>
    </motion.tr>
  );
};

// ============================================
// MAIN ENDORSE PAGE
// ============================================

export default function PurchaseOrderEndorsePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { user } = useAuthContext();

  // ============================================
  // ALL HOOKS - CALLED AT TOP LEVEL
  // ============================================

  // State
  const [endorseComment, setEndorseComment] = useState('');
  const [showEndorseDialog, setShowEndorseDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks
  const { data: po, isLoading, refetch } = usePurchaseOrder(id);
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData } = useAllSuppliers();
  const endorseMutation = useEndorsePurchaseOrder();

  // User info - useMemo hooks
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

  // Checked by user
  const checkedByUser = useMemo(() => {
    if (!po?.checked_by) return null;
    return (po as any)?.checked_by_user?.full_name || getUserName(po.checked_by);
  }, [po]);

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
      canEndorse: false
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
        verified++; // Count as verified for endorsement
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

    // Can endorse if all items are either verified OR supplier-added
    const canEndorse = totalItems === (verified);

    return {
      total: totalItems,
      verified,
      supplierAdded,
      count,
      matchRate: Math.round((totalAcceptable / totalItemsForRate) * 100),
      canEndorse
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
  // BUDGET UTILIZATION
  // ============================================

  const budgetUtilization = useMemo(() => {
    const totalBudget = financialAnalysis.estimatedTotal * 1.2;
    const used = financialAnalysis.actualTotal;
    const remaining = totalBudget - used;
    const percentUsed = totalBudget > 0 ? (used / totalBudget) * 100 : 0;

    return {
      totalBudget,
      used,
      remaining,
      percentUsed,
      isOverBudget: used > totalBudget,
    };
  }, [financialAnalysis]);

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

  // ============================================
  // TOTAL SAVINGS AND PREMIUMS
  // ============================================

  const totalSavings = useMemo(() => {
    return priceComparisonItems.reduce((sum, item) => sum + (item.difference < 0 ? Math.abs(item.difference) * item.quantity : 0), 0);
  }, [priceComparisonItems]);

  const totalPremiums = useMemo(() => {
    return priceComparisonItems.reduce((sum, item) => sum + (item.difference > 0 ? item.difference * item.quantity : 0), 0);
  }, [priceComparisonItems]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleBack = () => router.push('/procurement/purchase-orders/pending-endorsement');

  const handleEndorse = () => {
    setShowEndorseDialog(true);
  };

  const handleConfirmEndorse = () => {
    if (po) {
      endorseMutation.mutate(
        { id: po.id, comment: endorseComment || undefined },
        {
          onSuccess: () => {
            setShowEndorseDialog(false);
            router.push('/procurement/purchase-orders/pending-endorsement');
          },
          onError: (err: any) => {
          }
        }
      );
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // ============================================
  // CONDITIONAL RETURNS - AFTER ALL HOOKS
  // ============================================

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate
        title="Endorse Purchase Order"
        description="Loading purchase order details..."
        icon={<Stamp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Endorsement', href: '/procurement/purchase-orders/pending-endorsement' },
          { label: 'Endorse' },
        ]}
      >
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-sm text-muted-foreground">Loading purchase order data...</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  // Not found
  if (!po) {
    return (
      <PageTemplate
        title="Endorse Purchase Order"
        description="Purchase order not found"
        icon={<Stamp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Endorsement', href: '/procurement/purchase-orders/pending-endorsement' },
          { label: 'Endorse' },
        ]}
      >
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-16 text-center">
            <div className="p-5 bg-blue-50 dark:bg-blue-950/20 rounded-full w-fit mx-auto mb-6">
              <AlertCircle className="h-14 w-14 text-blue-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Purchase Order Not Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">The purchase order you are looking for does not exist or has been removed.</p>
            <Button onClick={handleBack} className="mt-6 rounded-xl px-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Endorsements
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // Already endorsed
  if (po.endorsed_by) {
    return (
      <PageTemplate
        title="Endorse Purchase Order"
        description="Already endorsed"
        icon={<Stamp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Endorsement', href: '/procurement/purchase-orders/pending-endorsement' },
          { label: 'Endorse' },
        ]}
      >
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-16 text-center">
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-14 w-14 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Already Endorsed</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This purchase order has already been endorsed by{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {(po as any)?.endorsed_by_user?.full_name || getUserName(po?.endorsed_by)}
              </span>
              {' '}on {formatDateTime(po.endorsed_at)}.
            </p>
            <Button onClick={handleBack} className="mt-6 rounded-xl px-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Endorsements
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // Not checked yet
  if (!po.checked_by) {
    return (
      <PageTemplate
        title="Endorse Purchase Order"
        description="Waiting for HOD check"
        icon={<Stamp className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Endorsement', href: '/procurement/purchase-orders/pending-endorsement' },
          { label: 'Endorse' },
        ]}
      >
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-16 text-center">
            <div className="p-5 bg-amber-50 dark:bg-amber-950/20 rounded-full w-fit mx-auto mb-6">
              <Clock className="h-14 w-14 text-amber-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Waiting for HOD Check</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This purchase order has not been checked by the Head of Department yet. Please wait for the HOD to review and check it first.
            </p>
            <Button onClick={handleBack} className="mt-6 rounded-xl px-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Endorsements
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
      title={`Endorse: ${po.po_number}`}
      description={`Review financials and endorse this purchase order`}
      icon={<Stamp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
        { label: 'Pending Endorsement', href: '/procurement/purchase-orders/pending-endorsement' },
        { label: po.po_number },
      ]}
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                  <Stamp className="h-4 w-4" />
                  <span className="text-sm font-medium">Accountant Endorsement</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Your role: Accountant</TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
            className="h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
            onClick={handleEndorse}
            disabled={endorseMutation.isPending || !itemAnalysis.canEndorse}
          >
            {endorseMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Stamp className="h-4 w-4 mr-2" />
            )}
            {itemAnalysis.canEndorse ? 'Endorse Order' : 'Resolve Issues First'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ============================================ */}
        {/* FINANCIAL OVERVIEW - MAIN FOCUS */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-purple-50/30 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/10">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">Financial Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      Budget analysis and cost verification
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium border-0 shadow-sm",
                    financialAnalysis.budgetStatus === 'under_budget' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                      financialAnalysis.budgetStatus === 'on_budget' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  )}>
                    <div className="flex items-center gap-1.5">
                      {financialAnalysis.budgetStatus === 'under_budget' && <ArrowDownRight className="h-3.5 w-3.5" />}
                      {financialAnalysis.budgetStatus === 'on_budget' && <CheckCircle className="h-3.5 w-3.5" />}
                      {financialAnalysis.budgetStatus === 'over_budget' && <AlertCircle className="h-3.5 w-3.5" />}
                      <span>
                        {financialAnalysis.budgetStatus === 'under_budget' ? 'Under Budget' :
                          financialAnalysis.budgetStatus === 'on_budget' ? 'On Budget' :
                            'Over Budget'}
                      </span>
                    </div>
                  </Badge>
                  <StatusBadge status={po.status} size="lg" />
                </div>
              </div>

              <Separator className="mb-5 bg-gray-200/50 dark:bg-gray-700/50" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FinancialMetricCard
                  title="Estimated Total"
                  value={formatCurrencyCompact(financialAnalysis.estimatedTotal)}
                  icon={<Calculator className="h-5 w-5" />}
                  color="gray"
                />
                <FinancialMetricCard
                  title="Actual Total"
                  value={formatCurrencyCompact(financialAnalysis.actualTotal)}
                  icon={<DollarSign className="h-5 w-5" />}
                  color="blue"
                  trend={financialAnalysis.isSaving ? 'down' : 'up'}
                  trendValue={financialAnalysis.isSaving ? `${Math.abs(Math.round(financialAnalysis.percentVariance))}% below estimate` : `${Math.round(financialAnalysis.percentVariance)}% above estimate`}
                />
                <FinancialMetricCard
                  title="Variance"
                  value={financialAnalysis.isSaving ? `-${formatCurrencyCompact(financialAnalysis.savings)}` : formatCurrencyCompact(financialAnalysis.difference)}
                  subtitle={financialAnalysis.isSaving ? 'Cost saving achieved' : 'Additional cost incurred'}
                  icon={financialAnalysis.isSaving ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  color={financialAnalysis.isSaving ? 'emerald' : 'amber'}
                />
                <FinancialMetricCard
                  title="Budget Utilization"
                  value={`${Math.round(budgetUtilization.percentUsed)}%`}
                  subtitle={`${formatCurrencyCompact(budgetUtilization.remaining)} remaining`}
                  icon={<ChartPie className="h-5 w-5" />}
                  color={budgetUtilization.percentUsed > 90 ? 'amber' : budgetUtilization.percentUsed > 70 ? 'blue' : 'emerald'}
                />
              </div>

              {financialAnalysis.supplierAddedTotal > 0 && (
                <div className="mt-4 p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-purple-700 dark:text-purple-300">
                      <strong>{itemAnalysis.supplierAdded}</strong> supplier-added items totaling{' '}
                      <strong>{formatCurrency(financialAnalysis.supplierAddedTotal)}</strong> have been included in this order.
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-white/60 dark:bg-gray-800/40 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                      <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Utilization</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Spent:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrencyCompact(budgetUtilization.used)}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className={cn(
                        "font-semibold",
                        budgetUtilization.remaining > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>{formatCurrencyCompact(budgetUtilization.remaining)}</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-full h-2 bg-gray-200/70 dark:bg-gray-700/70 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        budgetUtilization.percentUsed > 90 ? "bg-amber-500" :
                          budgetUtilization.percentUsed > 70 ? "bg-blue-500" :
                            "bg-emerald-500"
                      )}
                      initial={{ width: '0%' }}
                      animate={{ width: `${Math.min(budgetUtilization.percentUsed, 100)}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="absolute -top-4 right-0">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {Math.round(budgetUtilization.percentUsed)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span>0%</span>
                  <Badge className={cn(
                    "rounded-full px-2.5 py-0 text-[9px] font-medium border-0",
                    budgetUtilization.percentUsed > 90 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                      budgetUtilization.percentUsed > 70 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  )}>
                    {budgetUtilization.percentUsed > 90 ? 'Near Limit' :
                      budgetUtilization.percentUsed > 70 ? 'Healthy' :
                        'On Track'}
                  </Badge>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* STATUS ALERT */}
        {/* ============================================ */}
        <AnimatePresence>
          {itemAnalysis.canEndorse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className={cn(
                "rounded-xl shadow-sm",
                itemAnalysis.supplierAdded > 0
                  ? "bg-purple-50/90 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-800/50"
                  : "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/50"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl flex-shrink-0",
                      itemAnalysis.supplierAdded > 0
                        ? "bg-purple-100 dark:bg-purple-900/40"
                        : "bg-emerald-100 dark:bg-emerald-900/40"
                    )}>
                      {itemAnalysis.supplierAdded > 0 ? (
                        <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "font-semibold",
                        itemAnalysis.supplierAdded > 0
                          ? "text-purple-700 dark:text-purple-300"
                          : "text-emerald-700 dark:text-emerald-300"
                      )}>
                        {itemAnalysis.supplierAdded > 0
                          ? `${itemAnalysis.supplierAdded} Supplier-Added Items Included`
                          : 'All Items Verified'
                        }
                      </p>
                      <p className={cn(
                        "text-sm",
                        itemAnalysis.supplierAdded > 0
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {itemAnalysis.supplierAdded > 0
                          ? `${itemAnalysis.supplierAdded} item(s) were added by the supplier during quotation. These items have been reviewed by the HOD.`
                          : `All ${itemAnalysis.total} items match the requisition. The order is ready for endorsement.`
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 bg-white/60 dark:bg-gray-800/40 px-3 py-1.5 rounded-xl">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{itemAnalysis.total} items</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/60 dark:bg-gray-800/40 px-3 py-1.5 rounded-xl">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{formatCurrency(financialAnalysis.actualTotal)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!itemAnalysis.canEndorse && itemAnalysis.total > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-amber-700 dark:text-amber-300">Items Require Review</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {itemAnalysis.total - itemAnalysis.verified} item(s) have mismatches. Please review before endorsing.
                        {itemAnalysis.supplierAdded > 0 && ` (${itemAnalysis.supplierAdded} supplier-added items are already approved)`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 rounded-full px-4 py-1.5">
                        {itemAnalysis.verified}/{itemAnalysis.total} match
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================ */}
        {/* PO HEADER CARD */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">PO Number</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">{po.po_number}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Type</p>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs rounded-full px-3 py-1">
                      {po.type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Amount</p>
                  <p className="text-sm font-bold mt-1 text-emerald-600 dark:text-emerald-400">{formatCurrency(po.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Department</p>
                  <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">{po.requisition?.department?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={po.status} size="sm" />
                  </div>
                </div>
              </div>

              <Separator className="my-4 bg-gray-200/50 dark:bg-gray-700/50" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Issue Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(po.issue_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Expected Delivery</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(po.expected_delivery_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Items</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{po.items?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Checked By</p>
                  <div className="flex items-center gap-2 mt-1">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{checkedByUser || 'N/A'}</p>
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
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/60 to-gray-100/30 dark:from-gray-900/30 dark:to-gray-800/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Supplier Information
                </CardTitle>
                <Badge variant="outline" className="rounded-full text-xs px-3 py-1">
                  <Award className="h-3 w-3 mr-1" />
                  Verified Supplier
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 shadow-lg shadow-blue-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-base font-bold">
                      {getInitials(supplierName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{supplierName}</p>
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
        {/* PRICE COMPARISON TABLE */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/60 to-gray-100/30 dark:from-gray-900/30 dark:to-gray-800/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-base">Price Comparison</CardTitle>
                  <Badge variant="outline" className="text-xs rounded-full px-3 py-0.5">
                    {priceComparisonItems.length} items
                  </Badge>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Saving</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">Premium</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span className="text-muted-foreground">Supplier Added</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="text-muted-foreground">On Budget</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      className="h-8 w-[160px] pl-8 rounded-lg text-xs bg-muted/30 border-0 focus-visible:ring-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setSearchTerm('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 mt-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Savings:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSavings)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Premiums:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalPremiums)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Net Difference:</span>
                  <span className={cn(
                    "font-bold",
                    financialAnalysis.isSaving ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  )}>
                    {financialAnalysis.isSaving ? '-' : '+'}{formatCurrency(Math.abs(financialAnalysis.difference))}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Supplier-Added Items:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {itemAnalysis.supplierAdded} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Items with savings:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {priceComparisonItems.filter(i => i.isSaving && !i.isSupplierAdded).length}/{priceComparisonItems.filter(i => !i.isSupplierAdded).length}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {priceComparisonItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-5 bg-muted/20 rounded-2xl w-fit mx-auto mb-5">
                    <Scale className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-medium">No items to compare</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">This purchase order has no line items</p>
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden shadow-sm">
                  <UITable>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">#</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Item Name</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Est. Price</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Actual Price</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Difference</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Total Actual</TableHead>
                        <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceComparisonItems
                        .filter((item) => {
                          if (!searchTerm) return true;
                          return item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
                        })
                        .map((item, index) => (
                          <PriceComparisonRow
                            key={index}
                            item={item}
                            index={index}
                            isSupplierAdded={item.isSupplierAdded || false}
                          />
                        ))}
                    </TableBody>
                  </UITable>
                </div>
              )}

              {priceComparisonItems.length > 0 && (
                <div className="mt-4 p-3.5 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                          <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <span className="text-muted-foreground">Cost Savings:</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(totalSavings)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                          <ArrowUpRight className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <span className="text-muted-foreground">Premiums:</span>
                        <span className="font-bold text-amber-600">{formatCurrency(totalPremiums)}</span>
                      </div>
                      {itemAnalysis.supplierAdded > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                          </div>
                          <span className="text-muted-foreground">Supplier Added:</span>
                          <span className="font-bold text-purple-600">{itemAnalysis.supplierAdded} items</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Net:</span>
                      <span className={cn(
                        "font-bold",
                        financialAnalysis.isSaving ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {financialAnalysis.isSaving ? '-' : '+'}{formatCurrency(Math.abs(financialAnalysis.difference))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* COST BREAKDOWN */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/60 to-gray-100/30 dark:from-gray-900/30 dark:to-gray-800/20">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
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
                <div className="p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 dark:from-emerald-950/30 dark:to-teal-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(po.total_amount || 0)}</p>
                </div>
              </div>

              <Separator className="my-4 bg-gray-200/50 dark:bg-gray-700/50" />

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>On budget</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Above estimate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Supplier Added</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Over budget</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-muted-foreground">Estimated:</span>
                  <span>{formatCurrency(financialAnalysis.estimatedTotal)}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span>Actual:</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatCurrency(financialAnalysis.actualTotal)}</span>
                </div>
              </div>
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
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/60 to-gray-100/30 dark:from-gray-900/30 dark:to-gray-800/20">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {po.delivery_terms && (
                    <div className="flex items-start gap-3 p-3.5 bg-muted/30 rounded-xl">
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
                    <div className="flex items-start gap-3 p-3.5 bg-muted/30 rounded-xl">
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
                    <div className="flex items-start gap-3 p-3.5 bg-muted/30 rounded-xl md:col-span-2">
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
        {/* BUDGET VERIFICATION SUMMARY */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className={cn(
            "border-0 shadow-lg rounded-2xl overflow-hidden border-l-[6px]",
            itemAnalysis.supplierAdded > 0 ? "border-l-purple-500" : "border-l-blue-500"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <div className={cn(
                  "p-3 rounded-2xl flex-shrink-0",
                  itemAnalysis.supplierAdded > 0
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : "bg-blue-100 dark:bg-blue-900/30"
                )}>
                  {itemAnalysis.supplierAdded > 0 ? (
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <BookCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                    {itemAnalysis.supplierAdded > 0 ? 'Budget Verification with Supplier-Added Items' : 'Budget Verification'}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    As the Accountant, you are confirming that the required funds of{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(po.total_amount)}</span>{' '}
                    are available and this purchase is compliant with the approved budget.
                    {itemAnalysis.supplierAdded > 0 && (
                      <> <span className="font-medium text-purple-600 dark:text-purple-400">{itemAnalysis.supplierAdded} supplier-added items</span> have been included and verified.</>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-5 mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        financialAnalysis.budgetStatus === 'under_budget' ? "bg-emerald-500" :
                          financialAnalysis.budgetStatus === 'on_budget' ? "bg-blue-500" :
                            "bg-amber-500"
                      )} />
                      <span className="text-gray-700 dark:text-gray-300">
                        Budget Status: <span className="font-medium">
                          {financialAnalysis.budgetStatus === 'under_budget' ? 'Under Budget' :
                            financialAnalysis.budgetStatus === 'on_budget' ? 'On Budget' :
                              'Over Budget'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Match Rate: <span className="font-medium">{itemAnalysis.matchRate}%</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Variance: <span className={cn(
                          "font-medium",
                          financialAnalysis.isSaving ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {financialAnalysis.isSaving ? '-' : '+'}{Math.abs(Math.round(financialAnalysis.percentVariance))}%
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Items: <span className="font-medium">{itemAnalysis.verified}/{itemAnalysis.total} verified</span>
                      </span>
                    </div>
                    {itemAnalysis.supplierAdded > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Supplier Added: <span className="font-medium text-purple-600 dark:text-purple-400">{itemAnalysis.supplierAdded}</span>
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
      {/* ENDORSE DIALOG */}
      {/* ============================================ */}
      <Dialog open={showEndorseDialog} onOpenChange={setShowEndorseDialog}>
        <DialogContent className="rounded-2xl dark:bg-gray-900 max-w-lg border-0 shadow-2xl p-0 overflow-hidden">
          <div className="p-6 pb-0">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                  <Stamp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-gray-900 dark:text-gray-100 text-xl font-bold">
                    Confirm Endorsement
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    You are about to endorse purchase order <span className="font-mono font-medium">{po?.po_number}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Amount</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{formatCurrency(po?.total_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Budget Status</p>
                <Badge className={cn(
                  "mt-1 border-0 rounded-full px-3 py-1",
                  financialAnalysis.budgetStatus === 'under_budget' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                    financialAnalysis.budgetStatus === 'on_budget' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                )}>
                  <div className="flex items-center gap-1.5">
                    {financialAnalysis.budgetStatus === 'under_budget' && <ArrowDownRight className="h-3 w-3" />}
                    {financialAnalysis.budgetStatus === 'on_budget' && <CheckCircle className="h-3 w-3" />}
                    {financialAnalysis.budgetStatus === 'over_budget' && <AlertCircle className="h-3 w-3" />}
                    <span>
                      {financialAnalysis.budgetStatus === 'under_budget' ? 'Under Budget' :
                        financialAnalysis.budgetStatus === 'on_budget' ? 'On Budget' :
                          'Over Budget'}
                    </span>
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

            {/* Items Summary */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Items Summary</p>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 rounded-full px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {itemAnalysis.verified} Verified
                </Badge>
                {itemAnalysis.supplierAdded > 0 && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 rounded-full px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {itemAnalysis.supplierAdded} Supplier Added
                  </Badge>
                )}
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0 rounded-full px-3 py-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {itemAnalysis.total - itemAnalysis.verified} Mismatches
                </Badge>
                <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0 rounded-full px-3 py-1">
                  <Package className="h-3 w-3 mr-1" />
                  {itemAnalysis.total} Total
                </Badge>
              </div>
            </div>

            {/* Cost Impact */}
            <div className="p-3.5 bg-muted/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Cost Impact:</span>
                <span className={cn(
                  "font-bold",
                  financialAnalysis.isSaving ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                )}>
                  {financialAnalysis.isSaving ? `Saving ${formatCurrency(financialAnalysis.savings)}` : `${formatCurrency(financialAnalysis.difference)} above estimate`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Estimated: {formatCurrency(financialAnalysis.estimatedTotal)}</span>
                <ArrowRight className="h-3 w-3" />
                <span>Actual: {formatCurrency(financialAnalysis.actualTotal)}</span>
              </div>
              {financialAnalysis.supplierAddedTotal > 0 && (
                <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Supplier-added total:
                  </span>
                  <span className="font-medium">{formatCurrency(financialAnalysis.supplierAddedTotal)}</span>
                </div>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">Endorsement Note <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Textarea
                placeholder="Add any financial verification notes or observations..."
                value={endorseComment}
                onChange={(e) => setEndorseComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2.5 p-3.5 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="leading-relaxed">
                By endorsing, you confirm that funds are available and this purchase is financially compliant with the approved budget.
                {itemAnalysis.supplierAdded > 0 && ' Supplier-added items have been reviewed and approved.'}
              </span>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20 gap-2">
            <Button variant="outline" onClick={() => setShowEndorseDialog(false)} className="rounded-xl px-6">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEndorse}
              disabled={endorseMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 text-white transition-all duration-300 px-6"
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
