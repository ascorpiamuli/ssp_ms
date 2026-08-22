// frontend/src/app/(dashboard)/procurement/request-for-quotations/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Loader2,
  Send,
  RotateCcw,
  X,
  UserCheck,
  UserX,
  CreditCard,
  Crown,
  Award,
  FileCheck,
  ShoppingCart,
  Truck,
  Receipt,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  Info,
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Flame,
  Leaf,
  MinusCircle,
  CircleDashed,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  MessageSquare,
  Box,
  DollarSign,
  Activity,
  Package,
  Shield,
  Briefcase,
  PieChart,
  BarChart3,
  LineChart,
  Gauge,
  Target,
  Rocket,
  Gem,
  Crown as CrownIcon,
  Award as AwardIcon,
  Timer,
  PlayCircle,
  StopCircle,
  Grid3x3,
  ListChecks,
  ClipboardCheck,
  FileCheck2,
  ClipboardList,
  Layers,
  BarChart2,
  PieChart as PieChartIcon,
  Mail,
  Ban,
  Download,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import {
  useQuotations,
  useActiveQuotations,
  useClosingSoonQuotations,
  useSendQuotation,
  useCloseQuotation,
  useCancelQuotation,
  useSendQuotationReminder,
} from '@/hooks/useQuotation';
import { useProcurementStatistics } from '@/hooks/useProcurement';

// Types
import type { QuotationRequest, QuotationStatus } from '@/types/quotations.types';

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 10;

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
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  responded: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  evaluating: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
};

const STATUS_ICONS: Record<string, any> = {
  draft: Edit,
  sent: Send,
  responded: Users,
  evaluating: Clock,
  closed: CheckCircle,
  cancelled: XCircle,
  expired: AlertCircle,
};

// Status color map for WrappedCornerTag
const statusColorMap: Record<string, 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'teal' | 'indigo' | 'gray' | 'slate'> = {
  draft: 'gray',
  sent: 'blue',
  responded: 'indigo',
  evaluating: 'purple',
  closed: 'emerald',
  cancelled: 'red',
  expired: 'amber',
};

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

const formatDateFull = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'EEEE, dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status] || status;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getUserName = (user: any): string => {
  if (!user) return 'Unknown';
  if (user.full_name) return user.full_name;
  if (user.first_name || user.last_name) {
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown';
  }
  return 'Unknown';
};

const formatDistanceToNow = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    const diff = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `${diff} days`;
  } catch {
    return 'N/A';
  }
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const Icon = STATUS_ICONS[status] || FileText;
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.draft;

  return (
    <Badge className={cn("flex items-center gap-1.5 px-3 py-1 font-medium rounded-full", colorClass)}>
      <Icon className="h-3 w-3" />
      {getStatusLabel(status)}
    </Badge>
  );
};

// ============================================
// FILTERS COMPONENT
// ============================================

interface FiltersProps {
  filters: {
    search?: string;
    status?: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

const Filters = ({ filters, onFilterChange, onReset }: FiltersProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'responded', label: 'Responded' },
    { value: 'evaluating', label: 'Evaluating' },
    { value: 'closed', label: 'Closed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
  ];

  return (
    <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">
      <CardContent className="p-4 pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search RFQ by number or title..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full"
            />
          </div>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[180px]">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1 rounded-xl shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// RFQ TABLE COMPONENT - Premium Design
// ============================================

interface RFQTableProps {
  data: QuotationRequest[];
  isLoading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSend: (id: number) => void;
  onClose: (id: number) => void;
  onCancel: (id: number) => void;
  onReminder: (id: number) => void;
  onRowClick: (id: number) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const RFQTable = ({
  data,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onSend,
  onClose,
  onCancel,
  onReminder,
  onRowClick,
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
}: RFQTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 relative mt-6">
        <WrappedCornerTag label="EMPTY" color="gray" position="top-left" size="lg" />
        <div className="pt-4 ml-15">

          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No RFQs Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            No request for quotations have been created yet. Create your first RFQ from an approved requisition.
          </p>
          <Button
            className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
            onClick={() => window.location.href = '/procurement/request-for-quotations/create'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First RFQ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm relative">
      <div className="pt-2">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
                <TableHead className="w-[80px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">#</TableHead>
                <TableHead className="min-w-[180px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    RFQ Number
                  </div>
                </TableHead>
                <TableHead className="min-w-[200px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Title</TableHead>
                <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Requisition
                  </div>
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Responses
                  </div>
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Closing
                  </div>
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Created By
                  </div>
                </TableHead>

              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((rfq, index) => {
                const isExpired = rfq.is_expired;
                const isClosingSoon = rfq.is_closing_soon && !isExpired && rfq.status !== 'closed' && rfq.status !== 'cancelled';
                const generatedByName = getUserName(rfq.generated_by);
                const hasResponses = (rfq.response_count || 0) > 0;
                const status = rfq.status || 'draft';
                const statusColor = statusColorMap[status] || 'gray';
                const statusLabel = getStatusLabel(status);

                return (
                  <TableRow
                    key={rfq.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group relative"
                    onClick={() => onRowClick(rfq.id)}
                  >
                    {/* # Column with Status Tag as overlay */}
                    <TableCell className="py-4 relative text-center">
                      <div className="relative inline-flex items-center justify-center">
                        {/* Status Tag */}
                        <div className="absolute -top-3 -left-3 z-20">
                          <HorizontalCornerTag
                            label={statusLabel}
                            color={statusColor}
                            position="top-left"
                            size="sm"
                            width="w-[70px]"
                            height="h-[14px]"
                            fontSize="text-[7px]"
                            tracking="tracking-[0.06em]"
                            offsetX="8px"
                            offsetY="18px"
                            animated={true}
                            variant="sharp"
                          />
                        </div>
                        {/* Number */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors text-gray-700 dark:text-gray-300">
                          {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {rfq.qtn_number}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(rfq.issue_date)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {rfq.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {rfq.description || 'No description'}
                        </p>
                        {isExpired && (
                          <Badge variant="destructive" className="text-[10px] rounded-full mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                        {isClosingSoon && (
                          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px] rounded-full mt-1 animate-pulse">
                            <Clock className="h-3 w-3 mr-1" />
                            Closing Soon
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {rfq.requisition?.reference_number || 'N/A'}
                          </span>
                        </div>
                        {rfq.requisition && (
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {rfq.requisition.title}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {rfq.response_count || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {rfq.sent_suppliers_count || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 w-full min-w-[60px]">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(rfq.response_rate || 0, 100)}%`,
                                backgroundColor: (rfq.response_rate || 0) >= 80 ? '#10b981' : (rfq.response_rate || 0) >= 50 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium min-w-[35px] text-right text-gray-700 dark:text-gray-300">
                            {rfq.response_rate || 0}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {rfq.closing_date ? formatDate(rfq.closing_date) : 'N/A'}
                        </p>
                        {rfq.closing_time && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(rfq.closing_time), 'HH:mm')}
                          </p>
                        )}
                        {isClosingSoon && (
                          <p className="text-xs text-amber-500 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(rfq.closing_date)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium">
                            {getInitials(generatedByName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[80px]">
                            {generatedByName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDate(rfq.created_at)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {totalItems > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
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

export default function RequestForQuotationsPage() {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
  }>({});
  const [selectedRFQ, setSelectedRFQ] = useState<QuotationRequest | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [comment, setComment] = useState('');

  const { data: quotationsData, isLoading, refetch } = useQuotations({
    status: filters.status as QuotationStatus,
    search: filters.search,
    page: currentPage,
    per_page: ITEMS_PER_PAGE,
  });

  const { data: activeQuotations } = useActiveQuotations();
  const { data: closingSoonQuotations } = useClosingSoonQuotations();
  const { data: procurementStats } = useProcurementStatistics();

  const sendQuotation = useSendQuotation();
  const closeQuotation = useCloseQuotation();
  const cancelQuotation = useCancelQuotation();
  const sendReminder = useSendQuotationReminder();

  const quotations = Array.isArray(quotationsData)
    ? quotationsData
    : quotationsData?.data || [];

  const pagination = quotationsData?.meta || {
    total: 0,
    current_page: 1,
    last_page: 1,
  };

  const totalQtns = procurementStats?.with_qtns || 0;
  const activeCount = activeQuotations?.length || 0;
  const closingSoonCount = closingSoonQuotations?.length || 0;

  const avgResponseRate = useMemo(() => {
    if (!quotations.length) return 0;
    const total = quotations.reduce((acc: number, q: QuotationRequest) => acc + (q.response_rate || 0), 0);
    return total / quotations.length;
  }, [quotations]);

  // ============================================
  // MAIN PAGE - Updated stats building
  // ============================================

  // Build stats for StatsCards component
  const statsItems: StatCardItem[] = useMemo(() => {
    // Safely access stats properties with fallbacks
    const stats = procurementStats as any || {};
    const total = stats.total || 0;
    const withQtns = stats.with_qtns || 0;
    const active = stats.active || 0;
    const closingSoon = stats.closing_soon || 0;
    const avgResponseRate = stats.avg_response_rate || 0;

    // Calculate derived values
    const draftCount = quotations.filter(q => q.status === 'draft').length;
    const respondedCount = quotations.filter(q => q.status === 'responded').length;
    const evaluatingCount = quotations.filter(q => q.status === 'evaluating').length;
    const closedCount = quotations.filter(q => q.status === 'closed').length;
    const cancelledCount = quotations.filter(q => q.status === 'cancelled').length;
    const expiredCount = quotations.filter(q => q.status === 'expired').length;

    // Count total responses across all RFQs
    const totalResponses = quotations.reduce((sum, q) => sum + (q.response_count || 0), 0);

    return [
      {
        label: "Total RFQs",
        value: withQtns || quotations.length,
        icon: FileText,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: "All RFQs",
      },
      {
        label: "Active",
        value: active || quotations.filter(q => q.status === 'sent' || q.status === 'responded').length,
        icon: Activity,
        tagLabel: "ACTIVE",
        tagColor: "emerald",
        subtitle: "Active RFQs",
      },
      {
        label: "Closing Soon",
        value: closingSoon || quotations.filter(q => q.is_closing_soon && !q.is_expired).length,
        icon: AlertCircle,
        tagLabel: "CLOSING",
        tagColor: "amber",
        subtitle: "Within 48 hours",
      },
      {
        label: "Avg Response",
        value: Math.round(avgResponseRate || (quotations.length > 0 ? quotations.reduce((acc, q) => acc + (q.response_rate || 0), 0) / quotations.length : 0)),
        icon: TrendingUp,
        tagLabel: "RATE",
        tagColor: "purple",
        subtitle: `${Math.round(avgResponseRate || 0)}% average`,
        suffix: '%',
        compact: false,
      },
      {
        label: "Total Responses",
        value: totalResponses,
        icon: Users,
        tagLabel: "RESPONSES",
        tagColor: "indigo",
        subtitle: "All submissions",
      },
      {
        label: "Draft",
        value: draftCount,
        icon: FileText,
        tagLabel: "DRAFT",
        tagColor: "gray",
        subtitle: "In draft",
      },
      {
        label: "Evaluating",
        value: evaluatingCount,
        icon: Clock,
        tagLabel: "EVALUATING",
        tagColor: "purple",
        subtitle: "In evaluation",
      },
      {
        label: "Closed",
        value: closedCount,
        icon: CheckCircle,
        tagLabel: "CLOSED",
        tagColor: "teal",
        subtitle: "Completed RFQs",
      },
    ];
  }, [procurementStats, quotations]);
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowClick = useCallback((id: number) => {
    router.push(`/procurement/request-for-quotations/${id}`);
  }, [router]);

  const handleView = useCallback((id: number) => {
    router.push(`/procurement/request-for-quotations/${id}`);
  }, [router]);

  const handleEdit = useCallback((id: number) => {
    router.push(`/procurement/request-for-quotations/${id}/edit`);
  }, [router]);

  const handleDelete = useCallback((id: number) => {
    const rfq = quotations.find(q => q.id === id);
    if (rfq) {
      setSelectedRFQ(rfq);
      setShowDeleteDialog(true);
    }
  }, [quotations]);

  const handleSend = useCallback((id: number) => {
    const rfq = quotations.find(q => q.id === id);
    if (rfq) {
      setSelectedRFQ(rfq);
      setShowSendDialog(true);
      setComment('');
    }
  }, [quotations]);

  const handleClose = useCallback((id: number) => {
    const rfq = quotations.find(q => q.id === id);
    if (rfq) {
      setSelectedRFQ(rfq);
      setShowCloseDialog(true);
      setComment('');
    }
  }, [quotations]);

  const handleCancel = useCallback((id: number) => {
    const rfq = quotations.find(q => q.id === id);
    if (rfq) {
      setSelectedRFQ(rfq);
      setShowCancelDialog(true);
      setComment('');
    }
  }, [quotations]);

  const handleReminder = useCallback((id: number) => {
    const rfq = quotations.find(q => q.id === id);
    if (rfq) {
      setSelectedRFQ(rfq);
      setShowReminderDialog(true);
      setComment('');
    }
  }, [quotations]);

  const handleConfirmDelete = useCallback(() => {
    setShowDeleteDialog(false);
    setSelectedRFQ(null);
    refetch();
  }, [refetch]);

  const handleConfirmSend = useCallback(() => {
    if (selectedRFQ) {
      sendQuotation.mutate({
        id: selectedRFQ.id,
        data: { supplier_ids: [] }
      }, {
        onSuccess: () => {
          setShowSendDialog(false);
          setSelectedRFQ(null);
          refetch();
        },
      });
    }
  }, [selectedRFQ, sendQuotation, refetch]);

  const handleConfirmClose = useCallback(() => {
    if (selectedRFQ) {
      closeQuotation.mutate(selectedRFQ.id, {
        onSuccess: () => {
          setShowCloseDialog(false);
          setSelectedRFQ(null);
          refetch();
        },
      });
    }
  }, [selectedRFQ, closeQuotation, refetch]);

  const handleConfirmCancel = useCallback(() => {
    if (selectedRFQ) {
      cancelQuotation.mutate({
        id: selectedRFQ.id,
        data: { reason: comment || 'Cancelled by user' },
      }, {
        onSuccess: () => {
          setShowCancelDialog(false);
          setSelectedRFQ(null);
          refetch();
        },
      });
    }
  }, [selectedRFQ, comment, cancelQuotation, refetch]);

  const handleConfirmReminder = useCallback(() => {
    if (selectedRFQ) {
      sendReminder.mutate(selectedRFQ.id, {
        onSuccess: () => {
          setShowReminderDialog(false);
          setSelectedRFQ(null);
          refetch();
        },
      });
    }
  }, [selectedRFQ, sendReminder, refetch]);

  const handleCreate = () => {
    router.push('/procurement/request-for-quotations/create');
  };

  const handleRefresh = () => {
    refetch();
  };

  // Info banner for closing soon RFQs
  const closingSoonList = quotations.filter(q =>
    q.is_closing_soon && !q.is_expired && q.status !== 'closed' && q.status !== 'cancelled'
  );

  return (
    <PageTemplate
      title="Request for Quotations"
      description="Create and manage Request for Quotations (RFQs) from approved requisitions with real-time tracking"
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Request for Quotations' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {totalQtns} Total RFQs
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleCreate}
            className="gap-2 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            New RFQ
          </Button>
        </div>
      }
    >
      {/* Stats Cards - Using the flexible component */}
      <StatsCards
        stats={statsItems}
        isLoading={isLoading || !procurementStats}
        columns={8}
        variant="default"
        formatCompact={true}
        tagOrientation="wrapped"
        tagPosition="top-left"
      />

      {/* Info Banner - Closing Soon */}
      {closingSoonList.length > 0 && (
        <Card className="mb-6 border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 rounded-xl mt-7 shadow-sm relative">
          <WrappedCornerTag label="CLOSING" color="amber" position="top-left" size="lg" />
          <CardContent className="p-4 pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-1 ml-15">
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  {closingSoonList.length} RFQ{closingSoonList.length > 1 ? 's' : ''} Closing Soon
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400/80">
                  These RFQs are closing within 48 hours. Consider sending reminders to suppliers.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl"
                    onClick={() => {
                      const rows = document.querySelectorAll('[data-status="sent"], [data-status="responded"]');
                      if (rows.length > 0) {
                        rows[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    View Active RFQs
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="mt-6 mb-6">
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Table */}
      <RFQTable
        data={quotations}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSend={handleSend}
        onClose={handleClose}
        onCancel={handleCancel}
        onReminder={handleReminder}
        onRowClick={handleRowClick}
        currentPage={currentPage}
        totalItems={pagination.total || 0}
        totalPages={pagination.last_page || 0}
        onPageChange={handlePageChange}
      />

      {/* Dialogs */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-xl dark:bg-gray-900 relative">
          <HorizontalCornerTag label="DELETE" color="red" position="top-left" size="sm" variant="rounded" />
          <AlertDialogHeader className="pt-6">
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Delete RFQ</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete RFQ "{selectedRFQ?.qtn_number}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="rounded-xl dark:bg-gray-900 relative">
          <HorizontalCornerTag label="SEND" color="blue" position="top-left" size="sm" variant="rounded" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-gray-900 dark:text-gray-100">Send RFQ to Suppliers</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Send "{selectedRFQ?.qtn_number}" to selected suppliers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="send-comment" className="text-gray-700 dark:text-gray-300">Comment (Optional)</Label>
              <Textarea
                id="send-comment"
                placeholder="Add any additional instructions for suppliers..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleConfirmSend} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Send className="h-4 w-4 mr-2" />
              Send RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="rounded-xl dark:bg-gray-900 relative">
          <HorizontalCornerTag label="CLOSE" color="purple" position="top-left" size="sm" variant="rounded" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-gray-900 dark:text-gray-100">Close RFQ</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Close "{selectedRFQ?.qtn_number}" for further responses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="close-comment" className="text-gray-700 dark:text-gray-300">Closing Notes (Optional)</Label>
              <Textarea
                id="close-comment"
                placeholder="Add any closing notes..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleConfirmClose} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
              <CheckCircle className="h-4 w-4 mr-2" />
              Close RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-xl dark:bg-gray-900 relative">
          <HorizontalCornerTag label="CANCEL" color="red" position="top-left" size="sm" variant="rounded" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-gray-900 dark:text-gray-100">Cancel RFQ</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Cancel "{selectedRFQ?.qtn_number}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason" className="text-gray-700 dark:text-gray-300">
                Reason for Cancellation <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Explain why you're cancelling this RFQ..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="rounded-xl">
              Go Back
            </Button>
            <Button onClick={handleConfirmCancel} disabled={!comment.trim()} variant="destructive" className="rounded-xl">
              Cancel RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="rounded-xl dark:bg-gray-900 relative">
          <HorizontalCornerTag label="REMIND" color="amber" position="top-left" size="sm" variant="rounded" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-gray-900 dark:text-gray-100">Send Reminder</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Send a reminder to suppliers for "{selectedRFQ?.qtn_number}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-comment" className="text-gray-700 dark:text-gray-300">Reminder Message (Optional)</Label>
              <Textarea
                id="reminder-comment"
                placeholder="Add any additional message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleConfirmReminder} className="bg-amber-600 hover:bg-amber-700 rounded-xl">
              <Mail className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
