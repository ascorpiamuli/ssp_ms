'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Eye,
  Check,
  X,
  AlertCircle,
  Info,
  Package,
  Calendar,
  Building2,
  FileText,
  Download,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Send,
  Star,
  ThumbsUp,
  Scale,
  SlidersHorizontal,
  DollarSign,
  ExternalLink,
  ChevronDown,
  MoreVertical,
  Zap,
  Award,
  Activity,
  Hash,
  User,
  Briefcase,
  BadgeCheck,
  XCircle,
  Lock,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useToast } from '@/components/ui/toast-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

// Hooks
import {
  useSans,
  usePendingSans,
  useSubmitSan,
  useRateService,
  useDownloadSanPdf,
  usePreviewSanPdf,
  useGetSanPdf,
  useTrackSanDownload,
} from '@/hooks/useGoodsReceived';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

// Types
import type {
  ServiceAcknowledgmentNote,
  GoodsReceivedFilters,
  GRNStatus,
  QualityRating,
} from '@/types/goodsReceived.types';

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 10;

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

const formatDateTime = (date: string | Date | null): string => {
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

const getUserName = (user: any): string => {
  if (!user) return 'System';
  if (typeof user === 'string') return user;
  if (typeof user === 'number') return `User ${user}`;
  if (typeof user === 'object') {
    if (user.full_name) return user.full_name;
    if (user.first_name || user.last_name) {
      return [user.first_name, user.last_name].filter(Boolean).join(' ');
    }
    if (user.name) return user.name;
    if (user.id) return `User ${user.id}`;
  }
  return 'System';
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string): string => {
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      hod_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      principal_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      completed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    return map[status] || map.draft;
  };

  const getStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
      draft: 'Draft',
      submitted: 'Submitted',
      hod_approved: 'HOD Approved',
      principal_approved: 'Approved',
      completed: 'Completed',
      rejected: 'Rejected',
    };
    return map[status] || status;
  };

  const getStatusIcon = (status: string): React.ReactNode => {
    const map: Record<string, React.ReactNode> = {
      draft: <FileText className="h-4 w-4" />,
      submitted: <Clock className="h-4 w-4" />,
      hod_approved: <CheckCircle className="h-4 w-4" />,
      principal_approved: <BadgeCheck className="h-4 w-4" />,
      completed: <Award className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />,
    };
    return map[status] || <FileText className="h-4 w-4" />;
  };

  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  const icon = getStatusIcon(status);

  return (
    <Badge className={cn("px-3 py-1.5 font-medium rounded-full text-sm border flex items-center gap-1.5", color)}>
      {icon}
      {label}
    </Badge>
  );
};

const RatingBadge = ({ rating }: { rating: string | null }) => {
  const getRatingColor = (rating: string | null): string => {
    const map: Record<string, string> = {
      excellent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      average: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      poor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    return rating ? map[rating] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  };

  const getRatingLabel = (rating: string | null): string => {
    const map: Record<string, string> = {
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      poor: 'Poor',
    };
    return rating ? map[rating] || 'Pending' : 'Pending';
  };

  const getRatingIcon = (rating: string | null): React.ReactNode => {
    const map: Record<string, React.ReactNode> = {
      excellent: <Star className="h-3 w-3" />,
      good: <ThumbsUp className="h-3 w-3" />,
      average: <Scale className="h-3 w-3" />,
      poor: <AlertCircle className="h-3 w-3" />,
    };
    return rating ? map[rating] || <Clock className="h-3 w-3" /> : <Clock className="h-3 w-3" />;
  };

  if (!rating) {
    return (
      <Badge variant="outline" className="rounded-full text-xs border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  }
  const color = getRatingColor(rating);
  const label = getRatingLabel(rating);
  const icon = getRatingIcon(rating);

  return (
    <Badge className={cn("px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1", color)}>
      {icon}
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
      defaultIcon: <AlertTriangle className="h-5 w-5" />,
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
      defaultIcon: <AlertCircle className="h-5 w-5" />,
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
// FILTERS COMPONENT
// ============================================

interface FiltersProps {
  filters: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    has_rating?: 'all' | 'yes' | 'no';
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

const Filters = ({ filters, onFilterChange, onReset }: FiltersProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'hod_approved', label: 'HOD Approved' },
    { value: 'principal_approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">
      <CardContent className="p-4 pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SAN number, service provider, reference..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="gap-1 rounded-xl shrink-0 h-11 px-4"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="gap-1 rounded-xl shrink-0 h-11 px-4"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced
                <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
              </Button>
            </div>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                  className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onFilterChange('dateTo', e.target.value)}
                  className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Has Quality Rating</Label>
                <Select
                  value={filters.has_rating || 'all'}
                  onValueChange={(value) => onFilterChange('has_rating', value)}
                >
                  <SelectTrigger className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Rated</SelectItem>
                    <SelectItem value="no">Not Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// SAN TABLE COMPONENT - NO APPROVAL ACTIONS
// ============================================

interface SanTableProps {
  data: ServiceAcknowledgmentNote[];
  isLoading: boolean;
  isHOD: boolean;
  onView: (san: ServiceAcknowledgmentNote) => void;
  onSubmit: (san: ServiceAcknowledgmentNote) => void;
  onRate: (san: ServiceAcknowledgmentNote) => void;
  onDownloadPdf: (san: ServiceAcknowledgmentNote) => void;
  onRowClick: (san: ServiceAcknowledgmentNote) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDownloadingPdf?: boolean;
}

const SanTable = ({
  data,
  isLoading,
  isHOD,
  onView,
  onSubmit,
  onRate,
  onDownloadPdf,
  onRowClick,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
  isDownloadingPdf = false,
}: SanTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 relative">
        <WrappedCornerTag label="Empty" color="gray" position="top-left" size="sm" />
        <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <FileCheck className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No Service Acknowledgments Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          No service acknowledgment notes match your current filters or permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900 relative">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 dark:bg-gray-800/50 hover:bg-transparent border-b dark:border-gray-700">
              <TableHead className="w-[50px] py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</TableHead>
              <TableHead className="min-w-[160px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  SAN Number
                </div>
              </TableHead>
              <TableHead className="min-w-[160px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5" />
                  Reference
                </div>
              </TableHead>
              <TableHead className="min-w-[180px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5" />
                  Service Provider
                </div>
              </TableHead>
              <TableHead className="min-w-[140px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Department
                </div>
              </TableHead>
              <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Acknowledged
                </div>
              </TableHead>
              <TableHead className="py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="h-3.5 w-3.5" />
                  Amount
                </div>
              </TableHead>
              <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-3.5 w-3.5" />
                  Rating
                </div>
              </TableHead>
              <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((san, index) => {
              const isDraft = san.status === 'draft';
              const isCompleted = san.status === 'completed';
              const isApproved = san.status === 'hod_approved' || san.status === 'principal_approved';
              const canDownloadPdf = isApproved || isCompleted;
              const isClickable = !(isHOD && isDraft);

              // Get department info from the API response - use type assertion
              const sanWithDept = san as any;
              const department = sanWithDept.department || sanWithDept.requisition?.department || null;
              const departmentName = department?.name || 'N/A';

              return (
                <TableRow
                  key={san.id}
                  className={cn(
                    "transition-colors border-b dark:border-gray-700/50 last:border-0",
                    isClickable
                      ? "hover:bg-gray-50/70 dark:hover:bg-gray-800/40 cursor-pointer group"
                      : "cursor-not-allowed opacity-60",
                    isDraft && "opacity-70"
                  )}
                  onClick={() => {
                    if (isClickable) {
                      onRowClick(san);
                    }
                  }}
                >
                  <TableCell className="py-3.5 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {san.san_number}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Created: {formatDate(san.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {san.reference_number || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:to-indigo-500/30 flex-shrink-0 border border-blue-200/30 dark:border-blue-800/30">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-medium">
                          {getInitials(san.service_provider || 'SP')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                          {san.service_provider || '—'}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                          {san.service_description ? san.service_description.substring(0, 40) + (san.service_description.length > 40 ? '...' : '') : 'No description'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                        {departmentName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(san.acknowledgment_date)}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                        by {getUserName(san.acknowledged_by)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(san.total_value)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Net: {formatCurrency(san.net_total)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <RatingBadge rating={san.quality_rating} />
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <StatusBadge status={san.status} />
                      {san.status === 'hod_approved' && !san.quality_rating && (
                        <Badge className="text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800 rounded-full">
                          <Star className="h-2.5 w-2.5 mr-1" />
                          Pending Rating
                        </Badge>
                      )}
                      {isDraft && isHOD && (
                        <Badge className="text-[9px] bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 rounded-full">
                          <Lock className="h-2.5 w-2.5 mr-1" />
                          Draft - Locked
                        </Badge>
                      )}
                      {isDraft && !isHOD && (
                        <Badge className="text-[9px] bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 rounded-full">
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          Not Submitted
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-0.5">
                      {/* View button - disabled for HODs viewing draft SANs */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (isHOD && isDraft) {
                                  return;
                                }
                                onView(san);
                              }}
                              className={cn(
                                "h-8 w-8 p-0 rounded-lg",
                                isHOD && isDraft
                                  ? "text-gray-300 cursor-not-allowed dark:text-gray-600"
                                  : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 hover:text-blue-600"
                              )}
                              disabled={isHOD && isDraft}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl">
                            {isHOD && isDraft ? 'Draft - Not Available' : 'View Details'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Submit button - only for draft SANs */}
                      {isDraft && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSubmit(san)}
                                className="h-8 w-8 p-0 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">Submit for Approval</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Rate button - only for completed SANs without rating */}
                      {isCompleted && !san.quality_rating && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRate(san)}
                                className="h-8 w-8 p-0 rounded-lg text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">Rate Service</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Download PDF - Only show when approved */}
                      {canDownloadPdf && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDownloadPdf(san)}
                                className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                disabled={isDownloadingPdf}
                              >
                                {isDownloadingPdf ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">
                              {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalItems > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function ServiceAcknowledgmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  // Auth context for role checking
  const {
    user,
    isHOD,
    isAdmin,
    isAccountant,
    isProcurement,
    isStaff
  } = useAuthContext();

  // Get query params
  const purchaseOrderId = searchParams.get('purchase_order_id');

  // State
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    has_rating?: 'all' | 'yes' | 'no';
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSan, setSelectedSan] = useState<ServiceAcknowledgmentNote | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingData, setRatingData] = useState<{
    quality_rating: QualityRating | '';
    quality_notes: string;
    performance_notes: string;
  }>({
    quality_rating: '',
    quality_notes: '',
    performance_notes: '',
  });

  // Hooks
  const filtersObj: GoodsReceivedFilters = {
    page: currentPage,
    status: filters.status as GRNStatus | GRNStatus[] | undefined,
    purchase_order_id: purchaseOrderId ? parseInt(purchaseOrderId) : undefined,
  };

  const {
    data: sansResponse,
    isLoading: isLoadingSans,
    refetch: refetchSans,
  } = useSans(filtersObj);

  const {
    data: pendingSansResponse,
    isLoading: isLoadingPending,
  } = usePendingSans();

  // Mutations
  const submitSan = useSubmitSan();
  const rateService = useRateService();

  // ✅ REAL PDF HOOKS - Using the actual hooks from useGoodsReceived
  const {
    download: downloadSanPdf,
    isDownloading: isDownloadingPdf,
    downloadProgress: pdfDownloadProgress,
    errorMessage: pdfErrorMessage,
  } = useDownloadSanPdf();


  const {
    download: getSanPdf,
    isDownloading: isLoadingSanPdf,
  } = useGetSanPdf();

  // Extract data from responses
  const sans = useMemo(() => {
    if (!sansResponse) return [];
    if (Array.isArray(sansResponse)) return sansResponse as ServiceAcknowledgmentNote[];
    if (sansResponse && typeof sansResponse === 'object' && 'data' in sansResponse && Array.isArray((sansResponse as any).data)) {
      return (sansResponse as any).data as ServiceAcknowledgmentNote[];
    }
    return [];
  }, [sansResponse]);

  const pendingSans = useMemo(() => {
    if (!pendingSansResponse) return [];
    if (Array.isArray(pendingSansResponse)) return pendingSansResponse;
    if (pendingSansResponse && typeof pendingSansResponse === 'object' && 'data' in pendingSansResponse && Array.isArray((pendingSansResponse as any).data)) {
      return (pendingSansResponse as any).data;
    }
    return [];
  }, [pendingSansResponse]);

  const pendingCount = pendingSans.length;

  // ============================================
  // ROLE-BASED FILTERING
  // ============================================
  const filteredSans = useMemo(() => {
    let result = sans;

    // Filter by quality rating
    if (filters.has_rating === 'yes') {
      result = result.filter((san: any) => san.quality_rating);
    } else if (filters.has_rating === 'no') {
      result = result.filter((san: any) => !san.quality_rating);
    }

    // ============================================
    // ROLE-BASED FILTERING
    // ============================================
    const isAdminUser = isAdmin();
    const isProcurementUser = isProcurement();
    const isAccountantUser = isAccountant();
    const isHODUser = isHOD();

    // Admin, Procurement, Accountant can see all SANs
    if (isAdminUser || isProcurementUser || isAccountantUser) {
      return result;
    }

    // HOD should only see SANs for their department
    if (isHODUser) {
      // Get the HOD's department ID from the user object or from SAN data
      let hodDepartmentId = user?.department_id;

      // If user has no department_id, find it from SAN data
      if (!hodDepartmentId) {
        const sanWithDept = result.find((san: any) => {
          const s = san as any;
          return s.department?.hod_id === user?.id || s.requisition?.department?.hod_id === user?.id;
        });
        if (sanWithDept) {
          const s = sanWithDept as any;
          hodDepartmentId = s.department?.id || s.requisition?.department?.id;
        }
      }

      if (!hodDepartmentId) {
        return [];
      }

      // Show ALL SANs for their department (draft, submitted, approved, etc.)
      result = result.filter((san: any) => {
        const s = san as any;
        const sanDepartmentId = s.department?.id || s.requisition?.department?.id || s.requisition?.department_id;
        return sanDepartmentId === hodDepartmentId;
      });

      return result;
    }

    // Staff and other roles - only show submitted and approved SANs (not drafts)
    result = result.filter((san: any) => san.status !== 'draft');

    return result;
  }, [sans, filters.has_rating, isAdmin, isProcurement, isAccountant, isHOD, user]);

  // ============================================
  // STATS CARDS - FIXED to use SAN data only
  // ============================================
  const statsItems: StatCardItem[] = useMemo(() => {
    const sanDraft = filteredSans.filter((s: any) => s.status === 'draft').length;
    const sanSubmitted = filteredSans.filter((s: any) => s.status === 'submitted').length;
    const sanHodApproved = filteredSans.filter((s: any) => s.status === 'hod_approved').length;
    const sanPrincipalApproved = filteredSans.filter((s: any) => s.status === 'principal_approved').length;
    const sanApproved = sanHodApproved + sanPrincipalApproved;
    const sanCompleted = filteredSans.filter((s: any) => s.status === 'completed').length;
    const sanRejected = filteredSans.filter((s: any) => s.status === 'rejected').length;
    const sanRated = filteredSans.filter((s: any) => s.quality_rating).length;

    // Calculate total value from SANs
    const totalValue = filteredSans.reduce((sum: number, s: any) => sum + (parseFloat(s.total_value) || 0), 0);
    const netTotal = filteredSans.reduce((sum: number, s: any) => sum + (parseFloat(s.net_total) || 0), 0);

    return [
      {
        label: "Total SANs",
        value: filteredSans.length,
        icon: FileCheck,
        tagLabel: "SANS",
        tagColor: "blue",
        subtitle: `${filteredSans.length} service acknowledgment${filteredSans.length !== 1 ? 's' : ''}`,
      },
      {
        label: "Total Value",
        value: totalValue,
        icon: DollarSign,
        tagLabel: "VALUE",
        tagColor: "emerald",
        subtitle: `Net: ${formatCurrency(netTotal)}`,
      },
      {
        label: "Pending Approval",
        value: sanSubmitted,
        icon: Clock,
        tagLabel: "PENDING",
        tagColor: "amber",
        subtitle: "Awaiting approval",
      },
      {
        label: "Approved",
        value: sanApproved,
        icon: CheckCircle,
        tagLabel: "APPROVED",
        tagColor: "emerald",
        subtitle: "Service acknowledged",
      },
      {
        label: "Completed",
        value: sanCompleted,
        icon: Award,
        tagLabel: "DONE",
        tagColor: "teal",
        subtitle: "Fully processed",
      },
      {
        label: "Quality Rated",
        value: sanRated,
        icon: Star,
        tagLabel: "RATED",
        tagColor: "purple",
        subtitle: "Service quality rated",
      },
      {
        label: "Draft",
        value: sanDraft,
        icon: FileText,
        tagLabel: "DRAFT",
        tagColor: "gray",
        subtitle: "Not submitted yet",
      },
      {
        label: "Rejected",
        value: sanRejected,
        icon: XCircle,
        tagLabel: "REJECTED",
        tagColor: "red",
        subtitle: "Service rejected",
      },
    ];
  }, [filteredSans]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchSans();
    success('SAN list refreshed');
  }, [refetchSans, success]);

  const handleCreateSan = () => {
    const poId = purchaseOrderId ? `?purchase_order_id=${purchaseOrderId}` : '';
    router.push(`/procurement/delivery-notes/service-acknowledgment/create${poId}`);
  };

  const handleViewSan = (san: ServiceAcknowledgmentNote) => {
    router.push(`/procurement/delivery-notes/service-acknowledgment/${san.id}`);
  };

  const handleSubmitSan = (san: ServiceAcknowledgmentNote) => {
    setSelectedSan(san);
    setShowSubmitDialog(true);
  };

  const handleRateSan = (san: ServiceAcknowledgmentNote) => {
    setSelectedSan(san);
    setRatingData({
      quality_rating: '',
      quality_notes: '',
      performance_notes: '',
    });
    setShowRateDialog(true);
  };

  // ✅ UPDATED: Using the real PDF download hook
  const handleDownloadPdf = useCallback((san: ServiceAcknowledgmentNote) => {
    downloadSanPdf(san.id);
  }, [downloadSanPdf]);

  const handleRowClick = (san: ServiceAcknowledgmentNote) => {
    // Check if click is allowed (not HOD viewing draft)
    if (isHOD() && san.status === 'draft') {
      return;
    }
    handleViewSan(san);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedSan) return;
    setIsSubmitting(true);
    try {
      await submitSan.mutateAsync(selectedSan.id);
      setShowSubmitDialog(false);
      refetchSans();
      success(`SAN submitted for approval successfully`);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to submit SAN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRate = async () => {
    if (!selectedSan || !ratingData.quality_rating) return;
    setIsSubmitting(true);
    try {
      await rateService.mutateAsync({
        id: selectedSan.id,
        data: {
          quality_rating: ratingData.quality_rating,
          quality_notes: ratingData.quality_notes || undefined,
          performance_notes: ratingData.performance_notes || undefined,
        },
      });
      setShowRateDialog(false);
      refetchSans();
      success(`Service quality rated successfully`);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to rate service quality');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingData = isLoadingSans || isLoadingPending;

  const totalSans = filteredSans.length || 0;
  const totalPages = Math.ceil(totalSans / ITEMS_PER_PAGE) || 1;

  // Determine if user can create SANs (Admin, Procurement, Accountant)
  const canCreateSan = isAdmin() || isProcurement() || isAccountant();

  return (
    <PageTemplate
      title="Service Acknowledgments"
      description="Manage service acknowledgment notes for purchase orders. Track service delivery and quality ratings."
      icon={<FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
        { label: 'Service Acknowledgments' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {pendingCount} Pending
            </Badge>
          )}
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <FileCheck className="h-3.5 w-3.5 mr-1.5" />
            {totalSans} SANs
          </Badge>
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 rounded-full px-4 py-1.5">
            <Star className="h-3.5 w-3.5 mr-1.5" />
            {filteredSans.filter((s: any) => s.quality_rating).length} Rated
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingData}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4", isLoadingData && "animate-spin")} />
            Refresh
          </Button>
          {canCreateSan && (
            <Button
              onClick={handleCreateSan}
              className="gap-2 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white"
            >
              <Plus className="h-4 w-4" />
              New SAN
            </Button>
          )}
        </div>
      }
    >
      {/* Stats Cards */}
      <StatsCards
        stats={statsItems}
        isLoading={isLoadingData}
        columns={8}
        variant="default"
        tagOrientation='none'
        formatCompact={true}
      />

      {/* ============================================ */}
      {/* FILTERS */}
      {/* ============================================ */}
      <div className="mt-6 mb-6">
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-gray-900 dark:text-gray-100">{filteredSans.length}</span> of{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">{sans.length}</span> service acknowledgments
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {filteredSans.filter((s: any) => s.status === 'submitted').length} Pending
            </span>
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {filteredSans.filter((s: any) => s.status === 'hod_approved' || s.status === 'principal_approved').length} Approved
            </span>
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {filteredSans.filter((s: any) => s.quality_rating).length} Rated
            </span>
          </span>
        </div>
      </div>

      {/* ============================================ */}
      {/* SAN TABLE */}
      {/* ============================================ */}
      <SanTable
        data={filteredSans}
        isLoading={isLoadingData}
        isHOD={isHOD()}
        onView={handleViewSan}
        onSubmit={handleSubmitSan}
        onRate={handleRateSan}
        onDownloadPdf={handleDownloadPdf}
        onRowClick={handleRowClick}
        currentPage={currentPage}
        totalItems={totalSans}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isDownloadingPdf={isDownloadingPdf || isLoadingSanPdf}
      />

      {/* ============================================ */}
      {/* SUBMIT SAN DIALOG */}
      {/* ============================================ */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Send className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Submit SAN for Approval
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {selectedSan?.san_number} will be sent for approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <p className="font-semibold">Ready for approval</p>
                  <p className="text-xs mt-0.5">This SAN will be reviewed by the Head of Department or Principal.</p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 rounded-xl text-white dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================ */}
      {/* RATE SERVICE DIALOG */}
      {/* ============================================ */}
      <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <DialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Rate Service Quality
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {selectedSan?.san_number} - Rate the quality of service provided.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Quality Rating <span className="text-red-500">*</span></Label>
              <Select
                value={ratingData.quality_rating}
                onValueChange={(value) => setRatingData({
                  ...ratingData,
                  quality_rating: value as QualityRating
                })}
              >
                <SelectTrigger className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="excellent" className="dark:text-gray-300 dark:focus:bg-gray-700">Excellent</SelectItem>
                  <SelectItem value="good" className="dark:text-gray-300 dark:focus:bg-gray-700">Good</SelectItem>
                  <SelectItem value="average" className="dark:text-gray-300 dark:focus:bg-gray-700">Average</SelectItem>
                  <SelectItem value="poor" className="dark:text-gray-300 dark:focus:bg-gray-700">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality-notes" className="text-gray-700 dark:text-gray-300">Quality Notes</Label>
              <Textarea
                id="quality-notes"
                placeholder="Describe the quality of service..."
                value={ratingData.quality_notes}
                onChange={(e) => setRatingData({
                  ...ratingData,
                  quality_notes: e.target.value
                })}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="performance-notes" className="text-gray-700 dark:text-gray-300">Performance Notes</Label>
              <Textarea
                id="performance-notes"
                placeholder="Notes on service provider performance..."
                value={ratingData.performance_notes}
                onChange={(e) => setRatingData({
                  ...ratingData,
                  performance_notes: e.target.value
                })}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowRateDialog(false)} className="rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRate}
              disabled={isSubmitting || !ratingData.quality_rating}
              className="bg-purple-600 hover:bg-purple-700 rounded-xl text-white shadow-lg shadow-purple-600/20 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Star className="h-4 w-4 mr-2" />}
              {isSubmitting ? 'Saving...' : 'Submit Rating'}
            </Button>
          </AlertDialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
