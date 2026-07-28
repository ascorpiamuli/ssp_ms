// frontend/src/app/(dashboard)/approvals/[role]/page.tsx

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  User,
  Building2,
  Package,
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CreditCard,
  UserCog,
  Mail,
  MinusCircle,
  Zap,
  Flame,
  Leaf,
  Check,
  X,
  Info,
  ArrowLeft,
  RotateCcw,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  MessageSquare,
  Timer,
  Award,
  Crown,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  History,
  FileDiff,
  GitBranch,
  UserCheck,
  UserX,
  Repeat,
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import { useRoleApprovals } from '@/hooks/useApprovals';
import { useDepartments } from '@/hooks/useDepartments';
import { useRequisitionHistory } from '@/hooks/useRequisitionQueries';

// Types
import type { RequisitionFilters } from '@/types/requisition.types';

// ============================================
// CONSTANTS
// ============================================

// ✅ Display config for UI (display names, icons, colors)
const APPROVAL_LEVELS: Record<string, { key: string; label: string; icon: any; color: string; fullName: string; description: string }> = {
  'hod': {
    key: 'hod',
    label: 'HOD',
    icon: UserCog,
    color: 'blue',
    fullName: 'Head of Department',
    description: 'Approvals processed by Head of Department'
  },
  'accountant': {
    key: 'accountant',
    label: 'Accountant',
    icon: CreditCard,
    color: 'indigo',
    fullName: 'Accountant',
    description: 'Approvals processed by Accountant'
  },
  'head-of-institution': {
    key: 'head-of-institution',
    label: 'Head of Institution',
    icon: Crown,
    color: 'purple',
    fullName: 'Head of Institution',
    description: 'Approvals processed by the Head of Institution'
  },
  'principal': {
    key: 'principal',
    label: 'Principal',
    icon: Crown,
    color: 'purple',
    fullName: 'Principal',
    description: 'Approvals processed by Principal'
  },
  'final': {
    key: 'final',
    label: 'Final Approver',
    icon: Award,
    color: 'green',
    fullName: 'Final Approver',
    description: 'Approvals processed by Final Approver'
  }
};

// ✅ Mapping from URL parameter to display key
const URL_TO_DISPLAY_KEY: Record<string, string> = {
  'hod': 'hod',
  'accountant': 'accountant',
  'head-of-institution': 'head-of-institution',
  'head_of_institution': 'head-of-institution',
  'head%20of%20institution': 'head-of-institution',
  'head of institution': 'head-of-institution',
  'principal': 'principal',
  'final': 'final',
  'final-approver': 'final',
  'final_approver': 'final',
  'final approver': 'final',
};

// ✅ Mapping from display key to API level (what the backend expects for the role parameter)
const DISPLAY_TO_API_LEVEL: Record<string, string> = {
  'hod': 'hod',
  'accountant': 'accountant',
  'head-of-institution': 'principal',
  'principal': 'principal',
  'final': 'final',
};

// ✅ Mapping from display key to the role name for permission validation
const DISPLAY_TO_ROLE_NAME: Record<string, string> = {
  'hod': 'HOD',
  'accountant': 'ACCOUNTANT',
  'head-of-institution': 'HEAD OF INSTITUTION',
  'principal': 'HEAD OF INSTITUTION',
  'final': 'FINAL_APPROVER',
};

// ✅ Mapping from display key to the level value in the database
const DISPLAY_TO_DB_LEVEL: Record<string, string> = {
  'hod': 'hod',
  'accountant': 'accountant',
  'head-of-institution': 'principal',
  'principal': 'principal',
  'final': 'final',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    icon: Clock,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30'
  },
  approved: {
    label: 'Approved',
    color: 'text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-950/30'
  },
  declined: {
    label: 'Declined',
    color: 'text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-950/30'
  },
  returned: {
    label: 'Returned',
    color: 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: RotateCcw,
    bgColor: 'bg-amber-50 dark:bg-amber-950/30'
  },
  delegated: {
    label: 'Delegated',
    color: 'text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    icon: User,
    bgColor: 'bg-purple-50 dark:bg-purple-950/30'
  },
};

const PRIORITY_CONFIG: Record<string, { color: string; label: string; icon: any }> = {
  low: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', label: 'Low', icon: Leaf },
  medium: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', label: 'Medium', icon: MinusCircle },
  high: { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800', label: 'High', icon: Flame },
  emergency: { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Emergency', icon: Zap },
};

const ITEMS_PER_PAGE = 10;

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm:ss');
  } catch {
    return 'Invalid Date';
  }
};

const getFullName = (user: any): string => {
  if (!user) return 'Unknown';
  if (user.full_name) return user.full_name;
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ============================================
// RETURN COUNT BADGE COMPONENT
// ============================================

interface ReturnCountBadgeProps {
  count: number;
  className?: string;
}

const ReturnCountBadge = ({ count, className }: ReturnCountBadgeProps) => {
  if (count === 0) return null;

  const getColor = () => {
    if (count === 1) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    if (count === 2) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn(
            "flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium",
            getColor(),
            className
          )}>
            <Repeat className="h-2.5 w-2.5" />
            {count}x Returned
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This requisition has been returned {count} time{count > 1 ? 's' : ''} for revision</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// HISTORY ITEM COMPONENT
// ============================================

interface HistoryItemProps {
  history: any;
  index: number;
}

const HistoryItem = ({ history, index }: HistoryItemProps) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'submitted': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'declined': return <UserX className="h-4 w-4 text-red-500" />;
      case 'returned': return <RotateCcw className="h-4 w-4 text-amber-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'resubmitted': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default: return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'border-l-blue-500';
      case 'submitted': return 'border-l-yellow-500';
      case 'approved': return 'border-l-green-500';
      case 'declined': return 'border-l-red-500';
      case 'returned': return 'border-l-amber-500';
      case 'cancelled': return 'border-l-red-500';
      case 'resubmitted': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'created': 'Created',
      'submitted': 'Submitted for Approval',
      'approved': 'Approved',
      'declined': 'Declined',
      'returned': 'Returned for Revision',
      'cancelled': 'Cancelled',
      'resubmitted': 'Resubmitted After Revision',
    };
    return labels[action] || action.charAt(0).toUpperCase() + action.slice(1);
  };

  return (
    <div className={cn(
      "relative pl-6 pb-6 border-l-2",
      getActionColor(history.action),
      index === 0 && "border-l-blue-500"
    )}>
      {/* Timeline dot */}
      <div className="absolute left-[-7px] top-0 flex h-3 w-3 items-center justify-center rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600">
        <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getActionIcon(history.action)}
            <span className="text-sm font-medium dark:text-white">
              {getActionLabel(history.action)}
            </span>
            <Badge variant="outline" className="text-[10px] h-5">
              {history.action}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDateTime(history.created_at)}
          </span>
        </div>

        {/* User who performed the action */}
        {history.user && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{getFullName(history.user)}</span>
            {history.user.email && (
              <span className="text-xs text-muted-foreground/70">
                ({history.user.email})
              </span>
            )}
          </div>
        )}

        {/* Comments / Notes */}
        {history.comment && (
          <div className="mt-1 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
            <p className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <MessageSquare className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span>{history.comment}</span>
            </p>
          </div>
        )}

        {/* Changes made (for returned/resubmitted) */}
        {history.changes && Object.keys(history.changes).length > 0 && (
          <div className="mt-1 p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <FileDiff className="h-3 w-3" />
              Changes Made
            </p>
            <div className="mt-1 space-y-1">
              {Object.entries(history.changes).map(([key, value]: [string, any]) => (
                <div key={key} className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[100px]">
                    {key.replace(/_/g, ' ').toUpperCase()}:
                  </span>
                  <span className="text-blue-800 dark:text-blue-200">
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Old vs New values for approvals */}
        {history.old_values && history.new_values && (
          <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400 font-medium">Before</p>
              <pre className="mt-0.5 text-red-600 dark:text-red-300 whitespace-pre-wrap text-[10px]">
                {JSON.stringify(history.old_values, null, 2)}
              </pre>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
              <p className="text-green-700 dark:text-green-400 font-medium">After</p>
              <pre className="mt-0.5 text-green-600 dark:text-green-300 whitespace-pre-wrap text-[10px]">
                {JSON.stringify(history.new_values, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// REQUISITION HISTORY SECTION
// ============================================

interface RequisitionHistorySectionProps {
  requisitionId: number;
  returnCount: number;
}

const RequisitionHistorySection = ({ requisitionId, returnCount }: RequisitionHistorySectionProps) => {
  const [showAllHistory, setShowAllHistory] = useState(false);

  const { data: historyData, isLoading, error } = useRequisitionHistory(
    requisitionId,
    {
      per_page: showAllHistory ? 50 : 10,
      page: 1,
    },
    {
      enabled: !!requisitionId,
    }
  );

  const history = historyData?.data || [];

  // Check if the requisition was returned
  const wasReturned = history.some((h: any) => h.action === 'returned');
  const wasResubmitted = history.some((h: any) => h.action === 'resubmitted');

  // Get the return event
  const returnEvent = history.find((h: any) => h.action === 'returned');
  const resubmitEvent = history.find((h: any) => h.action === 'resubmitted');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="ml-2 text-sm text-muted-foreground">Loading history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="py-3">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-sm">Failed to load history</AlertTitle>
        <AlertDescription className="text-xs">
          {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Returned Warning Banner */}
      {wasReturned && (
        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300 text-sm font-semibold flex items-center gap-2">
            Requisition Was Returned for Revision
            <ReturnCountBadge count={returnCount} />
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
            {returnEvent?.comment || 'This requisition was returned for revision.'}
            {returnEvent?.user && (
              <span className="block text-xs mt-1">
                Returned by: {getFullName(returnEvent.user)} on {formatDateTime(returnEvent.created_at)}
              </span>
            )}
            {wasResubmitted && resubmitEvent && (
              <span className="block text-xs mt-1 text-green-600 dark:text-green-400">
                ✓ Resubmitted on {formatDateTime(resubmitEvent.created_at)}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* History Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2 dark:text-gray-200">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            Approval History Timeline
            <Badge variant="secondary" className="text-xs">
              {history.length} events
            </Badge>
          </h4>
          {history.length > 10 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="h-7 text-xs"
            >
              {showAllHistory ? 'Show Less' : 'View All'}
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-0">
            {history.map((item: any, index: number) => (
              <HistoryItem
                key={item.id || index}
                history={item}
                index={index}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status, showIcon = true }: { status: string; showIcon?: boolean }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <Badge className={cn("flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border", config.bgColor, config.color)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium", config.color)}>
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </Badge>
  );
};

// ============================================
// STATS CARDS
// ============================================

interface StatsCardsProps {
  stats: { pending: number; approved: number; declined: number; returned: number; total: number };
  isLoading: boolean;
}

const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  const statItems = useMemo(() => [
    {
      label: 'Total Actions',
      value: stats?.total || 0,
      icon: FileText,
      color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    {
      label: 'Pending',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    },
    {
      label: 'Approved',
      value: stats?.approved || 0,
      icon: ThumbsUp,
      color: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    },
    {
      label: 'Declined',
      value: stats?.declined || 0,
      icon: ThumbsDown,
      color: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    },
  ], [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="hover:shadow-md transition-shadow duration-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <div className={cn("p-2 rounded-lg", item.color)}>
                <item.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-1">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ============================================
// FILTERS
// ============================================

interface FiltersProps {
  filters: RequisitionFilters;
  onFilterChange: (key: keyof RequisitionFilters, value: any) => void;
  onReset: () => void;
  departments: any[];
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
}

const Filters = ({
  filters,
  onFilterChange,
  onReset,
  departments,
  statusFilter = 'all',
  onStatusFilterChange,
}: FiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-6 dark:border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filters</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {Object.keys(filters).filter(key => filters[key as keyof RequisitionFilters]).length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 gap-1 text-xs"
            >
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 gap-1 text-xs">
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search approvals..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Select
            value={filters.priority as string || 'all'}
            onValueChange={(value) => onFilterChange('priority', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.department_id?.toString() || 'all'}
            onValueChange={(value) => onFilterChange('department_id', value === 'all' ? undefined : parseInt(value))}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t dark:border-gray-800">
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => onStatusFilterChange && onStatusFilterChange(value)}
              >
                <SelectTrigger className="h-9 text-sm mt-1">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="delegated">Delegated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Date From</Label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => onFilterChange('date_from', e.target.value || undefined)}
                className="h-9 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Date To</Label>
              <Input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => onFilterChange('date_to', e.target.value || undefined)}
                className="h-9 text-sm mt-1"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// APPROVAL DETAILS DIALOG WITH HISTORY
// ============================================

interface ApprovalDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: any;
}

const ApprovalDetailsDialog = ({ open, onOpenChange, approval }: ApprovalDetailsDialogProps) => {
  const [showHistory, setShowHistory] = useState(false);

  if (!approval) return null;

  const requisition = approval?.requisition;
  const status = approval?.status || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const returnCount = requisition?.return_count || 0;
  const wasReturned = returnCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold dark:text-white">
                  Approval Details
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {requisition?.reference_number} - {requisition?.title}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 dark:text-gray-200">
          {/* Returned Warning */}
          {wasReturned && (
            <Alert className={cn(
              "border",
              returnCount === 1 && "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
              returnCount === 2 && "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
              returnCount >= 3 && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
            )}>
              <RotateCcw className={cn(
                "h-4 w-4",
                returnCount === 1 && "text-amber-600 dark:text-amber-400",
                returnCount === 2 && "text-orange-600 dark:text-orange-400",
                returnCount >= 3 && "text-red-600 dark:text-red-400"
              )} />
              <AlertTitle className={cn(
                "text-sm font-semibold",
                returnCount === 1 && "text-amber-800 dark:text-amber-300",
                returnCount === 2 && "text-orange-800 dark:text-orange-300",
                returnCount >= 3 && "text-red-800 dark:text-red-300"
              )}>
                Previously Returned for Revision ({returnCount} time{returnCount > 1 ? 's' : ''})
              </AlertTitle>
              <AlertDescription className={cn(
                "text-sm",
                returnCount === 1 && "text-amber-700 dark:text-amber-400",
                returnCount === 2 && "text-orange-700 dark:text-orange-400",
                returnCount >= 3 && "text-red-700 dark:text-red-400"
              )}>
                This requisition has been returned {returnCount} time{returnCount > 1 ? 's' : ''} for revision.
                Please review the changes made before approving.
                {returnCount >= 3 && (
                  <span className="block text-xs mt-1 font-semibold">
                    ⚠️ Multiple returns detected. Please carefully review all changes.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Status */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium border",
                  config.bgColor,
                  config.color
                )}>
                  <StatusIcon className="h-4 w-4" />
                  {config.label}
                </Badge>
                {wasReturned && <ReturnCountBadge count={returnCount} />}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Level</p>
              <p className="text-base font-semibold dark:text-white">{approval?.level_label || approval?.level?.toUpperCase()}</p>
            </div>
          </div>

          {/* Approver Info */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approver</p>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
              <Avatar className="h-12 w-12 border-2 border-blue-100 dark:border-blue-900">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-base">
                  {getInitials(getFullName(approval.approver))}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-base dark:text-white">{getFullName(approval.approver)}</p>
                {approval.approver.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {approval.approver.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Comment */}
          {approval?.comment && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Comment</p>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
                <p className="text-sm flex items-start gap-3 dark:text-gray-200">
                  <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span>{approval.comment}</span>
                </p>
              </div>
            </div>
          )}

          {/* Decline Reason */}
          {approval?.decline_reason && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">Decline Reason</p>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{approval.decline_reason}</span>
                </p>
              </div>
            </div>
          )}

          {/* Requisition Details */}
          <Separator className="dark:bg-gray-800" />
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Requisition Details</p>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(parseFloat(requisition?.total_amount) || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-medium dark:text-gray-200">{requisition?.department?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Priority</p>
                <PriorityBadge priority={requisition?.priority || 'medium'} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="font-medium dark:text-gray-200">{formatDateTime(requisition?.submitted_at)}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Received At</p>
              <p className="text-base font-medium dark:text-gray-200">{formatDateTime(approval?.received_at)}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</p>
              <p className="text-base font-medium dark:text-gray-200">{formatDateTime(approval?.created_at)}</p>
            </div>
          </div>

          {/* History Section */}
          <Separator className="dark:bg-gray-800" />
          <div id="history-section">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium dark:text-gray-200">Approval History</h4>
                {wasReturned && <ReturnCountBadge count={returnCount} />}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="h-7 gap-1 text-xs"
              >
                {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showHistory ? 'Hide' : 'Show'} History
              </Button>
            </div>

            {showHistory && requisition?.id && (
              <RequisitionHistorySection
                requisitionId={requisition.id}
                returnCount={returnCount}
              />
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 px-6 py-4 flex justify-end gap-3">
          {wasReturned && requisition?.id && (
            <Button
              variant="outline"
              onClick={() => {
                setShowHistory(true);
                // Scroll to history section
                const historyElement = document.getElementById('history-section');
                if (historyElement) {
                  historyElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              View Changes ({returnCount} return{returnCount > 1 ? 's' : ''})
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)} className="px-6">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// MAIN TABLE
// ============================================

interface ApprovalTableProps {
  approvals: any[];
  displayKey: string;
  onView: (id: number) => void;
}

const ApprovalTable = ({ approvals, displayKey, onView }: ApprovalTableProps) => {
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const levelInfo = APPROVAL_LEVELS[displayKey];
  const LevelIcon = levelInfo?.icon || Shield;

  const handleViewDetails = (approval: any) => {
    setSelectedApproval(approval);
    setShowDetailsDialog(true);
  };

  const getRowStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'border-l-4 border-l-green-400 bg-green-50/30 dark:bg-green-950/20';
      case 'declined': return 'border-l-4 border-l-red-400 bg-red-50/30 dark:bg-red-950/20';
      case 'returned': return 'border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-950/20';
      case 'pending': return 'border-l-4 border-l-yellow-400 bg-yellow-50/30 dark:bg-yellow-950/20';
      default: return '';
    }
  };

  return (
    <>
      <div className="border rounded-xl overflow-hidden shadow-sm dark:border-gray-800">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 dark:bg-gray-800/50 hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                <TableHead className="text-xs font-medium text-muted-foreground">#</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Requisition</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Department</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Priority</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Actioned At</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Action By</TableHead>
                <TableHead className="text-center text-xs font-medium text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((approval, index) => {
                const requisition = approval?.requisition;
                const status = approval?.status || 'pending';
                const returnCount = requisition?.return_count || 0;
                const isReturned = returnCount > 0;

                // Determine row styling based on return count
                const getReturnRowStyle = () => {
                  if (!isReturned) return '';
                  if (returnCount === 1) return 'border-l-4 border-l-amber-400 bg-amber-50/10 dark:bg-amber-950/10';
                  if (returnCount === 2) return 'border-l-4 border-l-orange-400 bg-orange-50/10 dark:bg-orange-950/10';
                  return 'border-l-4 border-l-red-400 bg-red-50/10 dark:bg-red-950/10';
                };

                return (
                  <motion.tr
                    key={approval.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group",
                      getRowStatusColor(status),
                      getReturnRowStyle()
                    )}
                    onClick={() => onView(requisition?.id)}
                  >
                    <TableCell className="text-sm font-mono text-muted-foreground dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        {index + 1}
                        {isReturned && <ReturnCountBadge count={returnCount} />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-gray-200">
                          {requisition?.title || 'Untitled'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono dark:text-gray-400">
                          {requisition?.reference_number || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground dark:text-gray-400" />
                        <span className="text-sm dark:text-gray-300">{requisition?.department?.name || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium dark:text-gray-200">
                      {formatCurrency(parseFloat(requisition?.total_amount) || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={status} showIcon={true} />
                        {isReturned && returnCount > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            ({returnCount}x)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={requisition?.priority || 'medium'} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm dark:text-gray-300">
                        {approval?.approved_at || approval?.declined_at || approval?.reviewed_at ? (
                          <span className="font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDateTime(approval.approved_at || approval.declined_at || approval.reviewed_at)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {approval?.approver ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-6 w-6 border dark:border-gray-700">
                            <AvatarFallback className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                              {getInitials(getFullName(approval.approver))}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-[80px] dark:text-gray-300">{getFullName(approval.approver)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onView(requisition?.id);
                                }}
                              >
                                <Eye className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Requisition</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(approval);
                                }}
                              >
                                <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Approval Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <ApprovalDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        approval={selectedApproval}
      />
    </>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function RoleApprovalsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const { useAllDepartments } = useDepartments();

  const { data: departmentsData, isLoading: departmentsLoading } = useAllDepartments();

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filters, setFilters] = useState<RequisitionFilters>({
    page: 1,
    per_page: ITEMS_PER_PAGE,
  });

  const departments = useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    if (departmentsData?.data && Array.isArray(departmentsData.data)) return departmentsData.data;
    return [];
  }, [departmentsData]);

  // ✅ STEP 1: Get the raw role from URL
  const rawRole = params.role as string;

  // ✅ STEP 2: Map URL parameter to display key
  const getDisplayKey = (role: string): string => {
    const decodedRole = decodeURIComponent(role);
    const lowerRole = decodedRole.toLowerCase().trim();

    // Direct match
    if (APPROVAL_LEVELS[lowerRole]) {
      return lowerRole;
    }

    // Try mapping from URL format to key
    if (URL_TO_DISPLAY_KEY[lowerRole]) {
      return URL_TO_DISPLAY_KEY[lowerRole];
    }

    // Try replacing hyphens with spaces
    const withSpaces = lowerRole.replace(/-/g, ' ');
    if (APPROVAL_LEVELS[withSpaces]) {
      return withSpaces;
    }

    // Try replacing underscores with spaces
    const withSpaces2 = lowerRole.replace(/_/g, ' ');
    if (APPROVAL_LEVELS[withSpaces2]) {
      return withSpaces2;
    }

    // Fallback: return as-is
    return lowerRole;
  };

  const displayKey = getDisplayKey(rawRole);
  const levelInfo = APPROVAL_LEVELS[displayKey];

  // ✅ STEP 3: Map display key to API level
  const getApiLevel = (displayKey: string): string => {
    return DISPLAY_TO_API_LEVEL[displayKey] || displayKey;
  };

  const apiLevel = getApiLevel(displayKey);

  // ✅ STEP 4: Get the role name for permission check
  const getRoleNameForBackend = (displayKey: string): string => {
    return DISPLAY_TO_ROLE_NAME[displayKey] || displayKey.toUpperCase();
  };

  const roleNameForBackend = getRoleNameForBackend(displayKey);

  // ✅ STEP 5: Get the DB level
  const getDbLevel = (displayKey: string): string => {
    return DISPLAY_TO_DB_LEVEL[displayKey] || displayKey;
  };

  const dbLevel = getDbLevel(displayKey);

  // ✅ STEP 6: Check if user has permission
  const hasPermission = useMemo(() => {
    if (!user) return false;

    const userRoles = user.roles?.map((r: any) => r.toLowerCase()) || [];
    if (user.role) userRoles.push(user.role.toLowerCase());

    const hasRole = userRoles.some((r: string) =>
      r === roleNameForBackend.toLowerCase() ||
      r === 'admin' ||
      r === 'super_admin'
    );

    console.log('🔍 Role Approval Permission Check:', {
      displayKey,
      apiLevel,
      dbLevel,
      roleNameForBackend,
      userRoles,
      hasRole,
    });

    return hasRole;
  }, [user, roleNameForBackend, displayKey, apiLevel, dbLevel]);

  // ✅ STEP 7: Fetch approvals using the API level
  const roleApprovalsQuery = useRoleApprovals(dbLevel, {
    status: statusFilter,
    page: currentPage,
    per_page: ITEMS_PER_PAGE,
    department_id: filters.department_id,
    date_from: filters.date_from,
    date_to: filters.date_to,
    search: filters.search,
  }, {
    enabled: hasPermission,
  });

  const responseData = roleApprovalsQuery.data as any;

  let approvals: any[] = [];
  let meta = { total: 0, per_page: ITEMS_PER_PAGE, current_page: 1, last_page: 1 };

  if (responseData) {
    if (responseData.data && Array.isArray(responseData.data)) {
      approvals = responseData.data;
      meta = {
        total: responseData.total || 0,
        per_page: responseData.per_page || ITEMS_PER_PAGE,
        current_page: responseData.current_page || 1,
        last_page: responseData.last_page || 1,
      };
    } else if (Array.isArray(responseData)) {
      approvals = responseData;
    }
  }

  const isLoading = roleApprovalsQuery.isLoading || departmentsLoading;

  const stats = useMemo(() => {
    const pending = approvals.filter((a: any) => a.status === 'pending').length;
    const approved = approvals.filter((a: any) => a.status === 'approved').length;
    const declined = approvals.filter((a: any) => a.status === 'declined').length;
    const returned = approvals.filter((a: any) => a.status === 'returned').length;

    return {
      pending,
      approved,
      declined,
      returned,
      total: approvals.length,
    };
  }, [approvals]);

  const handleFilterChange = useCallback((key: keyof RequisitionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ page: 1, per_page: ITEMS_PER_PAGE });
    setStatusFilter('all');
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handleView = useCallback((requisitionId: number) => {
    if (requisitionId) {
      router.push(`/requisitions/${requisitionId}`);
    }
  }, [router]);

  const totalItems = meta?.total || 0;
  const totalPages = meta?.last_page || 0;

  // ✅ Access Denied
  if (!hasPermission) {
    return (
      <PageTemplate
        title="Access Denied"
        description="You do not have permission to view this page"
        icon={<Shield className="h-5 w-5 text-red-600" />}
      >
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have the required permissions to view {displayKey.replace(/-/g, ' ')} approvals.
            Required role: {roleNameForBackend}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push('/dashboard')} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </PageTemplate>
    );
  }

  if (!levelInfo) {
    return (
      <PageTemplate
        title="Invalid Role"
        description="The specified approval role does not exist"
        icon={<Shield className="h-5 w-5 text-red-600" />}
      >
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Role</AlertTitle>
          <AlertDescription>
            The role "{rawRole}" is not a valid approval role.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push('/dashboard')} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`${levelInfo.label} Approval Log`}
      description={`Complete audit trail of all ${levelInfo.fullName} approvals - Non-repudiable approval records`}
      icon={<levelInfo.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => roleApprovalsQuery.refetch()}
            className="h-9 gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Badge variant="default" className="h-9 px-4 gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
            <Clock className="h-4 w-4" />
            {stats.pending} Pending
          </Badge>
        </div>
      }
    >
      <StatsCards stats={stats} isLoading={isLoading} />

      <div className="mt-6">
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          departments={departments}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : approvals.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <FileText className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-medium mb-2 dark:text-white">No Approval Records Found</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'all'
                ? `There are no approval records for ${levelInfo.label} role.`
                : `There are no ${STATUS_CONFIG[statusFilter]?.label || statusFilter} approval records.`}
            </p>
          </div>
        ) : (
          <>
            <ApprovalTable
              approvals={approvals}
              displayKey={displayKey}
              onView={handleView}
            />

            {totalItems > ITEMS_PER_PAGE && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-9"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-9"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageTemplate>
  );
}
