// frontend/src/app/(dashboard)/requisitions/history/page.tsx

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  History,
  FileText,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
  RefreshCw,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  Crown,
  Award,
  CreditCard,
  UserCog,
  Zap,
  Flame,
  Leaf,
  MinusCircle,
  CircleDashed,
  Calendar,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  MessageSquare,
  Edit,
  Send,
  UserX,
  AlertCircle,
  Box,
  DollarSign,
  ArrowRight,
  X,
  Info,
  UserCheck,
  ShoppingCart,
  Truck,
  Receipt,
  FileCheck,
  TrendingUp,
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useRequisitions,
  useRequisitionHistory,
} from '@/hooks/useRequisitionQueries';
import { useDepartments } from '@/hooks/useDepartments';

// Types
import type { Requisition, RequisitionFilters, RequisitionHistory } from '@/types/requisition.types';

// ============================================
// CONSTANTS
// ============================================

const APPROVAL_LEVELS = [
  { key: 'hod', label: 'HOD', icon: UserCog, color: 'blue' },
  { key: 'accountant', label: 'Accountant', icon: CreditCard, color: 'indigo' },
  { key: 'principal', label: 'Principal', icon: Crown, color: 'purple' },
  { key: 'final', label: 'Final Approver', icon: Award, color: 'green' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  submitted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hod_approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  hod_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  accountant_approved: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  accountant_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  principal_approved: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  principal_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  final_approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  final_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  returned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  revised: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

const PRIORITY_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  low: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Leaf, label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: MinusCircle, label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Flame, label: 'High' },
  emergency: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Zap, label: 'Emergency' },
};

const HISTORY_ACTION_CONFIG: Record<string, { color: string; icon: any; label: string; description: string }> = {
  created: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: FileText, label: 'Created', description: 'Requisition was created' },
  updated: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700', icon: Edit, label: 'Updated', description: 'Requisition details were updated' },
  submitted: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', icon: Send, label: 'Submitted', description: 'Requisition was submitted for approval' },
  hod_approved: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: UserCheck, label: 'HOD Approved', description: 'Approved by Head of Department' },
  hod_declined: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: UserX, label: 'HOD Declined', description: 'Declined by Head of Department' },
  accountant_approved: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800', icon: CreditCard, label: 'Accountant Approved', description: 'Approved by Accountant' },
  accountant_declined: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: CreditCard, label: 'Accountant Declined', description: 'Declined by Accountant' },
  principal_approved: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: Crown, label: 'Principal Approved', description: 'Approved by Principal' },
  principal_declined: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: Crown, label: 'Principal Declined', description: 'Declined by Principal' },
  final_approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', icon: Award, label: 'Final Approved', description: 'Final approval granted' },
  final_declined: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: Award, label: 'Final Declined', description: 'Final approval declined' },
  returned: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: RotateCcw, label: 'Returned', description: 'Returned for revision' },
  cancelled: { color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700', icon: X, label: 'Cancelled', description: 'Requisition was cancelled' },
  commented: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: MessageSquare, label: 'Commented', description: 'Comment added to requisition' },
  revised: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: Edit, label: 'Revised', description: 'Requisition was revised' },
  escalated: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: AlertCircle, label: 'Escalated', description: 'Requisition was escalated' },
  delegated: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: User, label: 'Delegated', description: 'Approval was delegated' },
  item_added: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', icon: Box, label: 'Item Added', description: 'Item was added to requisition' },
  item_removed: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: Box, label: 'Item Removed', description: 'Item was removed from requisition' },
  item_updated: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', icon: Edit, label: 'Item Updated', description: 'Item details were updated' },
  attachment_added: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: FileText, label: 'Attachment Added', description: 'Attachment was added' },
  attachment_removed: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: FileText, label: 'Attachment Removed', description: 'Attachment was removed' },
};

const ITEMS_PER_PAGE = 10;

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
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

const formatDateTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm:ss');
  } catch {
    return 'Invalid Date';
  }
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    hod_approved: 'HOD Approved',
    hod_declined: 'HOD Declined',
    accountant_approved: 'Accountant Approved',
    accountant_declined: 'Accountant Declined',
    principal_approved: 'Principal Approved',
    principal_declined: 'Principal Declined',
    final_approved: 'Approved',
    final_declined: 'Declined',
    returned: 'Returned',
    revised: 'Revised',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getFullName = (user: any): string => {
  if (!user) return 'Unknown';
  if (user.full_name) return user.full_name;
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
};

const getDeviceIcon = (userAgent?: string | null) => {
  if (!userAgent) return <Monitor className="h-3.5 w-3.5" />;
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android')) return <Smartphone className="h-3.5 w-3.5" />;
  if (ua.includes('iphone')) return <Smartphone className="h-3.5 w-3.5" />;
  if (ua.includes('ipad')) return <Tablet className="h-3.5 w-3.5" />;
  if (ua.includes('tablet')) return <Tablet className="h-3.5 w-3.5" />;
  if (ua.includes('macbook') || ua.includes('macintosh')) return <Laptop className="h-3.5 w-3.5" />;
  if (ua.includes('windows')) return <Monitor className="h-3.5 w-3.5" />;
  if (ua.includes('linux')) return <Monitor className="h-3.5 w-3.5" />;
  return <Monitor className="h-3.5 w-3.5" />;
};

const getDeviceName = (userAgent?: string | null): string => {
  if (!userAgent) return 'Unknown Device';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android')) return 'Mobile';
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('tablet')) return 'Tablet';
  if (ua.includes('macbook') || ua.includes('macintosh')) return 'Mac';
  if (ua.includes('windows')) return 'Windows PC';
  if (ua.includes('linux')) return 'Linux';
  return 'Desktop';
};

// Filter function to exclude drafts from the table display
const filterSubmittedOnly = (requisitions: Requisition[]): Requisition[] => {
  return requisitions.filter(req => req.status !== 'draft');
};

// Check if requisition has been declined at any level
const hasBeenDeclined = (requisition: Requisition): boolean => {
  if (!requisition.approvals) return false;
  return requisition.approvals.some((a: any) =>
    a.status === 'declined' || a.status === 'cancelled'
  );
};

// Check if requisition status is a declined status
const isDeclinedStatus = (status: string): boolean => {
  const declinedStatuses = ['hod_declined', 'accountant_declined', 'principal_declined', 'final_declined'];
  return declinedStatuses.includes(status);
};

// Check if procurement has started (based on available fields)
const hasProcurementStarted = (requisition: Requisition): boolean => {
  return requisition.is_procurement_created === true || requisition.procurement_created_at !== null;
};

// Check if procurement is complete (payment processed)
const isProcurementComplete = (requisition: Requisition): boolean => {
  // Check if the requisition has a payment voucher or cheque recorded
  // Using available fields - we'll check if there's a payment record
  // This would come from the backend if we had payment tracking fields
  // For now, we'll use a combination of fields
  return requisition.is_procurement_created === true &&
    requisition.status === 'final_approved' &&
    // Check if there's any indication of payment in metadata or through history
    (requisition.metadata?.payment_completed === true ||
      requisition.metadata?.cheque_issued === true);
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const label = getStatusLabel(status);
  const isDeclined = isDeclinedStatus(status);

  return (
    <Badge className={cn("font-medium", colorClass, isDeclined && "line-through")}>
      {label}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1 text-xs", config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const ApprovalStatusBadge = ({ status, isDeclined }: { status: string; isDeclined?: boolean }) => {
  if (isDeclined) {
    return (
      <Badge variant="outline" className="flex items-center gap-1.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
        <XCircle className="h-3 w-3" />
        Declined
      </Badge>
    );
  }

  const statusConfig: Record<string, { color: string; icon: any; label: string; description: string }> = {
    approved: {
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
      icon: CheckCircle,
      label: 'Approved',
      description: 'This level has been approved'
    },
    pending: {
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      icon: Loader2,
      label: 'Pending',
      description: 'Awaiting approval from this level'
    },
    declined: {
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      icon: XCircle,
      label: 'Declined',
      description: 'This level has declined the requisition'
    },
    returned: {
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      icon: RotateCcw,
      label: 'Returned',
      description: 'This level has returned for revision'
    },
    'not-started': {
      color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      icon: CircleDashed,
      label: 'Not Started',
      description: 'Approval process not yet initiated at this level'
    },
  };

  const config = statusConfig[status] || statusConfig['not-started'];
  const Icon = config.icon;
  const isPending = status === 'pending';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn("flex items-center gap-1.5 text-xs font-medium", config.color)}>
            <Icon className={cn(
              "h-3 w-3",
              isPending && "animate-spin"
            )} />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-center">
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// PROCUREMENT PROGRESS INDICATOR
// ============================================

const ProcurementProgressIndicator = ({ requisition }: { requisition: Requisition }) => {
  const isFullyApproved = requisition.status === 'final_approved';

  if (!isFullyApproved) return null;

  const started = hasProcurementStarted(requisition);
  const complete = isProcurementComplete(requisition);

  if (!started) {
    return (
      <div className="mt-1.5 flex items-center gap-1.5">
        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
          <ShoppingCart className="h-3 w-3 mr-1" />
          Ready for Procurement
        </Badge>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="mt-1.5 flex items-center gap-1.5">
        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Procurement Complete
        </Badge>
      </div>
    );
  }

  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
        <TrendingUp className="h-3 w-3 mr-1" />
        Procurement In Progress
      </Badge>
    </div>
  );
};

// ============================================
// STATS CARDS - EXCLUDING DRAFTS
// ============================================

interface StatsCardsProps {
  requisitions: Requisition[];
  isLoading: boolean;
}

const StatsCards = ({ requisitions, isLoading }: StatsCardsProps) => {
  // ✅ Calculate stats from submitted requisitions only (exclude drafts)
  const stats = useMemo(() => {
    if (!requisitions || requisitions.length === 0) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        declined: 0,
        returned: 0,
        cancelled: 0,
        procurement_started: 0,
        procurement_complete: 0,
      };
    }

    // ✅ Filter out drafts - only count submitted requisitions
    const submitted = requisitions.filter(r => r.status !== 'draft' && r.status !== 'cancelled');
    const total = submitted.length;
    const pending = submitted.filter(r =>
      r.status === 'submitted' ||
      r.status === 'hod_approved' ||
      r.status === 'accountant_approved' ||
      r.status === 'principal_approved'
    ).length;
    const approved = submitted.filter(r => r.status === 'final_approved').length;
    const declined = submitted.filter(r =>
      r.status === 'hod_declined' ||
      r.status === 'accountant_declined' ||
      r.status === 'principal_declined' ||
      r.status === 'final_declined'
    ).length;
    const returned = submitted.filter(r => r.status === 'returned').length;
    const cancelled = requisitions.filter(r => r.status === 'cancelled').length;

    // Procurement stats - using available fields
    const procurementStarted = requisitions.filter(r =>
      r.status === 'final_approved' && hasProcurementStarted(r)
    ).length;

    const procurementComplete = requisitions.filter(r =>
      r.status === 'final_approved' && isProcurementComplete(r)
    ).length;

    return {
      total,
      pending,
      approved,
      declined,
      returned,
      cancelled,
      procurement_started: procurementStarted,
      procurement_complete: procurementComplete,
    };
  }, [requisitions]);

  // ✅ Log stats
  useEffect(() => {
    console.log('📊 StatsCards - Calculated from requisitions (excluding drafts):', stats);
  }, [stats]);

  const statItems = useMemo(() => [
    {
      label: 'Total Submitted',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
      description: 'All submitted requisitions'
    },
    {
      label: 'Pending Approval',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
      description: 'In approval process'
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
      description: 'Fully approved'
    },
    {
      label: 'Declined',
      value: stats.declined,
      icon: XCircle,
      color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
      description: 'Declined requisitions'
    },
    {
      label: 'Returned',
      value: stats.returned,
      icon: RotateCcw,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
      description: 'Returned for revision'
    },
  ], [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-2/3 mb-2" />
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <div className={cn("p-2 rounded-lg", item.color)}>
                <item.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{item.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ============================================
// HISTORY DETAILS CARD COMPONENT
// ============================================

interface HistoryDetailsCardProps {
  requisitionId: number;
  onClose: () => void;
}

const HistoryDetailsCard = ({ requisitionId, onClose }: HistoryDetailsCardProps) => {
  const { data: historyData, isLoading, refetch } = useRequisitionHistory(requisitionId, {
    per_page: 100,
  });

  const historyItems = useMemo(() => {
    if (!historyData) return [];
    if (historyData.data && Array.isArray(historyData.data)) return historyData.data;
    if (Array.isArray(historyData)) return historyData;
    return [];
  }, [historyData]);

  const formatChangeValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const renderChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return null;

    const changes: { key: string; old: string; new: string }[] = [];
    const allKeys = new Set([...Object.keys(oldValues || {}), ...Object.keys(newValues || {})]);

    allKeys.forEach(key => {
      const oldVal = oldValues?.[key];
      const newVal = newValues?.[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          key,
          old: formatChangeValue(oldVal),
          new: formatChangeValue(newVal),
        });
      }
    });

    if (changes.length === 0) return null;

    return (
      <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border dark:border-gray-700">
        <p className="text-xs font-medium text-muted-foreground mb-2">Changes:</p>
        <div className="space-y-1">
          {changes.map((change) => (
            <div key={change.key} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground min-w-[100px] capitalize font-medium">{change.key}:</span>
              <span className="text-red-500 line-through truncate max-w-[150px]">{change.old || 'N/A'}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-green-600 dark:text-green-400 truncate max-w-[150px]">{change.new || 'N/A'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="mt-4 dark:bg-gray-800/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="ml-3 text-muted-foreground">Loading history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 border-2 border-blue-100 dark:border-blue-900/50 shadow-lg dark:bg-gray-800/80">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base dark:text-gray-100">Activity Log</CardTitle>
              <p className="text-sm text-muted-foreground">
                {historyItems.length} activities recorded
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-8 px-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 max-h-[500px] overflow-y-auto dark:bg-gray-800/50">
        {historyItems.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No history found for this requisition</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyItems.map((history: RequisitionHistory, index: number) => {
              const config = HISTORY_ACTION_CONFIG[history.action] || {
                color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
                icon: Clock,
                label: history.action_label || history.action,
                description: history.action_label || history.action,
              };
              const Icon = config.icon;
              const isFirst = index === 0;
              const isDeclinedAction = history.action?.includes('declined') || false;

              return (
                <motion.div
                  key={history.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "border rounded-lg p-4 transition-all hover:shadow-md dark:border-gray-700",
                    isFirst && "border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20",
                    isDeclinedAction && "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                      config.color.split(' ')[0]
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn("text-xs font-medium", config.color)}>
                          {config.label}
                        </Badge>
                        {isFirst && (
                          <Badge variant="default" className="text-[10px] bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                            Latest
                          </Badge>
                        )}
                        {history.is_status_change && history.new_status && (
                          <Badge variant="outline" className="text-[10px] dark:border-gray-600">
                            Status: {history.new_status}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {config.description}
                      </p>

                      {history.comment && (
                        <div className="mt-2 bg-muted/30 dark:bg-gray-800/50 rounded-lg p-2 border dark:border-gray-700">
                          <p className="text-sm flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="dark:text-gray-300">{history.comment}</span>
                          </p>
                        </div>
                      )}

                      {renderChanges(history.old_values, history.new_values)}

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                        {history.user && (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5 border dark:border-gray-700">
                              <AvatarFallback className="text-[10px] bg-blue-50 dark:bg-blue-900/30">
                                {getInitials(getFullName(history.user))}
                              </AvatarFallback>
                            </Avatar>
                            <span>{getFullName(history.user)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDateTime(history.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                        {history.ip_address && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 cursor-help bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded border dark:border-gray-700">
                                  <Globe className="h-3 w-3" />
                                  <span className="font-mono">{history.ip_address}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>IP Address: {history.ip_address}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {history.user_agent && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 cursor-help bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded border dark:border-gray-700">
                                  {getDeviceIcon(history.user_agent)}
                                  <span>{getDeviceName(history.user_agent)}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs break-all">{history.user_agent}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
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
}

const Filters = ({ filters, onFilterChange, onReset, departments }: FiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-6 dark:bg-gray-800/50 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filters</span>
            <Badge variant="secondary" className="ml-2">
              {Object.keys(filters).filter(key => filters[key as keyof RequisitionFilters]).length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requisitions..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filters.status as string || 'all'}
            onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="hod_approved">HOD Approved</SelectItem>
              <SelectItem value="hod_declined">HOD Declined</SelectItem>
              <SelectItem value="accountant_approved">Accountant Approved</SelectItem>
              <SelectItem value="accountant_declined">Accountant Declined</SelectItem>
              <SelectItem value="principal_approved">Principal Approved</SelectItem>
              <SelectItem value="principal_declined">Principal Declined</SelectItem>
              <SelectItem value="final_approved">Approved</SelectItem>
              <SelectItem value="final_declined">Declined</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="revised">Revised</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority as string || 'all'}
            onValueChange={(value) => onFilterChange('priority', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
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
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t dark:border-gray-700">
            <Select
              value={filters.department_id?.toString() || 'all'}
              onValueChange={(value) => onFilterChange('department_id', value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger>
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

            <Input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => onFilterChange('date_from', e.target.value || undefined)}
              className="h-10"
            />

            <Input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => onFilterChange('date_to', e.target.value || undefined)}
              className="h-10"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN HISTORY TABLE
// ============================================

interface HistoryTableProps {
  data: Requisition[];
  isLoading: boolean;
  onView: (id: number) => void;
  onViewHistory: (id: number) => void;
  expandedHistoryId: number | null;
  userId?: number;
  userRoles?: string[];
}

const HistoryTable = ({
  data,
  isLoading,
  onView,
  onViewHistory,
  expandedHistoryId,
  userId,
  userRoles = [],
}: HistoryTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No submitted requisitions found</h3>
        <p className="text-muted-foreground">Requisitions appear here once they are submitted for approval.</p>
      </div>
    );
  }

  const getApprovalStatus = (requisition: Requisition, levelKey: string) => {
    const approval = requisition.approvals?.find((a: any) => a.level === levelKey);
    if (!approval) return 'not-started';
    return approval.status;
  };

  const isFullyApproved = (requisition: Requisition) => {
    return requisition.status === 'final_approved';
  };

  const isCancelled = (requisition: Requisition) => {
    return requisition.status === 'cancelled';
  };

  const isOwnRequisition = (requisition: Requisition) => {
    return requisition.user?.id === userId;
  };

  const isRequisitionDeclined = (requisition: Requisition) => {
    return hasBeenDeclined(requisition) || isDeclinedStatus(requisition.status);
  };

  // Check if user is Procurement Officer or Accountant
  const canViewProcurement = userRoles.some(role =>
    role === 'procurement' || role === 'accountant' || role === 'admin' || role === 'super_admin'
  );

  return (
    <div className="border rounded-lg overflow-hidden dark:border-gray-700">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-gray-800/50">
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead className="min-w-[200px]">Requisition</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-center min-w-[100px]">HOD</TableHead>
              <TableHead className="text-center min-w-[100px]">Accountant</TableHead>
              <TableHead className="text-center min-w-[100px]">Principal</TableHead>
              <TableHead className="text-center min-w-[100px]">Final Approver</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center min-w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((req, index) => {
              const isApproved = isFullyApproved(req);
              const isCancelledStatus = isCancelled(req);
              const isReturned = req.status === 'returned';
              const isDeclined = isRequisitionDeclined(req);
              const isOwn = isOwnRequisition(req);
              const isHistoryExpanded = expandedHistoryId === req.id;
              const procurementStarted = hasProcurementStarted(req);
              const procurementComplete = isProcurementComplete(req);

              return (
                <React.Fragment key={req.id}>
                  <TableRow
                    className={cn(
                      "hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer",
                      isApproved && "bg-green-50/30 dark:bg-green-950/20",
                      isCancelledStatus && "bg-gray-100/50 dark:bg-gray-800/30",
                      isDeclined && "bg-red-50/30 dark:bg-red-950/20",
                      isReturned && "bg-amber-50/30 dark:bg-amber-950/20",
                      isOwn && "border-l-4 border-l-blue-400 dark:border-l-blue-600"
                    )}
                    onClick={() => onView(req.id)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className={cn(
                          "font-medium truncate max-w-[180px]",
                          isCancelledStatus && "text-muted-foreground line-through",
                          isDeclined && "text-red-600 dark:text-red-400",
                          !isCancelledStatus && !isDeclined && "hover:text-blue-600 transition-colors"
                        )}>
                          {req.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{req.reference_number}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className={cn(
                            "text-xs",
                            isOwn ? "font-medium text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                          )}>
                            {req.user?.full_name || 'Unknown'}
                            {isOwn && " (You)"}
                          </span>
                        </div>
                        {isDeclined && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Declined
                            </Badge>
                          </div>
                        )}
                        {isCancelledStatus && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant="secondary" className="text-xs bg-gray-200 dark:bg-gray-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancelled
                            </Badge>
                          </div>
                        )}
                        {/* Procurement Progress */}
                        <ProcurementProgressIndicator requisition={req} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{req.department?.name || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={req.priority} />
                    </TableCell>
                    {APPROVAL_LEVELS.map((level) => {
                      const status = getApprovalStatus(req, level.key);
                      return (
                        <TableCell key={level.key} className="text-center">
                          {isCancelledStatus ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <ApprovalStatusBadge
                              status={status}
                              isDeclined={isDeclined}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-medium">
                      {formatCurrency(req.total_amount || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onView(req.id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-8 w-8 p-0",
                                  isHistoryExpanded ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50" : ""
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewHistory(req.id);
                                }}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isHistoryExpanded ? 'Hide History' : 'View History'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Show procurement action for approved requisitions */}
                        {isApproved && !isCancelledStatus && canViewProcurement && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "h-8 w-8 p-0",
                                    procurementComplete ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400" :
                                      procurementStarted ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400" :
                                        "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/requisitions/${req.id}/procurement`;
                                  }}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {procurementComplete ? 'Procurement Complete' :
                                  procurementStarted ? 'Continue Procurement' :
                                    'Start Procurement'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {isHistoryExpanded && (
                    <TableRow>
                      <TableCell colSpan={10} className="p-0">
                        <HistoryDetailsCard
                          requisitionId={req.id}
                          onClose={() => onViewHistory(req.id)}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function RequisitionHistoryPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { useAllDepartments } = useDepartments();

  const { data: departmentsData, isLoading: departmentsLoading } = useAllDepartments();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<RequisitionFilters>({
    page: 1,
    per_page: ITEMS_PER_PAGE,
    status: undefined,
  });
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  // Get user roles
  const userRoles = useMemo(() => {
    const roles: string[] = [];
    if (user?.role) roles.push(user.role.toLowerCase());
    if (user?.roles) {
      user.roles.forEach((r: any) => {
        const roleName = typeof r === 'string' ? r : r.name;
        if (roleName) roles.push(roleName.toLowerCase());
      });
    }
    return roles;
  }, [user]);

  const departments = useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    if (departmentsData?.data && Array.isArray(departmentsData.data)) return departmentsData.data;
    return [];
  }, [departmentsData]);

  // ✅ Fetch all requisitions
  const allRequisitionsQuery = useRequisitions(filters);

  const responseData = allRequisitionsQuery.data as any;

  let rawData: Requisition[] = [];
  let meta = { total: 0, per_page: ITEMS_PER_PAGE, current_page: 1, last_page: 1 };

  if (responseData) {
    if (responseData.data && Array.isArray(responseData.data)) {
      rawData = responseData.data;
      meta = responseData.meta || meta;
    } else if (responseData.items && Array.isArray(responseData.items)) {
      rawData = responseData.items;
      meta = {
        total: responseData.total || 0,
        per_page: responseData.per_page || ITEMS_PER_PAGE,
        current_page: responseData.current_page || 1,
        last_page: responseData.last_page || 1,
      };
    } else if (Array.isArray(responseData)) {
      rawData = responseData;
    }
  }

  // ✅ Filter out drafts for the table display only
  const data = filterSubmittedOnly(rawData);
  const isLoading = allRequisitionsQuery.isLoading || departmentsLoading;

  // ✅ Stats are calculated from raw data (excluding drafts)
  const stats = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        declined: 0,
        returned: 0,
        cancelled: 0,
      };
    }

    // ✅ Exclude drafts from stats
    const submitted = rawData.filter(r => r.status !== 'draft' && r.status !== 'cancelled');
    const total = submitted.length;
    const pending = submitted.filter(r =>
      r.status === 'submitted' ||
      r.status === 'hod_approved' ||
      r.status === 'accountant_approved' ||
      r.status === 'principal_approved'
    ).length;
    const approved = submitted.filter(r => r.status === 'final_approved').length;
    const declined = submitted.filter(r =>
      r.status === 'hod_declined' ||
      r.status === 'accountant_declined' ||
      r.status === 'principal_declined' ||
      r.status === 'final_declined'
    ).length;
    const returned = submitted.filter(r => r.status === 'returned').length;
    const cancelled = rawData.filter(r => r.status === 'cancelled').length;

    return {
      total,
      pending,
      approved,
      declined,
      returned,
      cancelled,
    };
  }, [rawData]);

  // ✅ Count procurement ready requisitions
  const procurementReady = useMemo(() => {
    return rawData.filter(r =>
      r.status === 'final_approved' &&
      !isProcurementComplete(r)
    ).length;
  }, [rawData]);

  // ✅ Log stats
  useEffect(() => {
    console.log('📊 Raw requisitions:', rawData);
    console.log('📊 Calculated stats (excluding drafts):', stats);
  }, [rawData, stats]);

  const handleFilterChange = useCallback((key: keyof RequisitionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      page: 1,
      per_page: ITEMS_PER_PAGE,
      status: undefined,
    });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      page,
    }));
  }, []);

  const handleView = useCallback((id: number) => {
    router.push(`/requisitions/${id}`);
  }, [router]);

  const handleViewHistory = useCallback((id: number) => {
    setExpandedHistoryId(prev => prev === id ? null : id);
  }, []);

  const totalItems = data.length;
  const totalPages = meta?.last_page || 1;

  // Check if user is Procurement Officer, Accountant, or Admin
  const canManageProcurement = userRoles.some(role =>
    role === 'procurement' || role === 'accountant' || role === 'admin' || role === 'super_admin'
  );

  return (
    <PageTemplate
      title="Requisition History"
      description="View complete audit trail of all requisitions with detailed activity logs"
      icon={<History className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {procurementReady > 0 && canManageProcurement && (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/procurement')}
              className="gap-2 h-9 bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="h-4 w-4" />
              Procurement ({procurementReady})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => allRequisitionsQuery.refetch()}
            className="gap-2 h-9"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push('/requisitions/create')}
            className="gap-2 h-9"
          >
            <FileText className="h-4 w-4" />
            New Requisition
          </Button>
        </div>
      }
    >
      {/* Info Banner - Procurement Ready */}
      {procurementReady > 0 && canManageProcurement && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  {procurementReady} Approved Requisition{procurementReady > 1 ? 's' : ''} Ready for Procurement
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  These requisitions have been fully approved and can now proceed to the procurement phase.
                  Generate QTN and send to suppliers.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push('/procurement')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Go to Procurement
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ StatsCards excludes drafts */}
      <StatsCards requisitions={rawData} isLoading={isLoading} />

      <div className="mt-6">
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          departments={departments}
        />

        <HistoryTable
          data={data}
          isLoading={isLoading}
          onView={handleView}
          onViewHistory={handleViewHistory}
          expandedHistoryId={expandedHistoryId}
          userId={user?.id}
          userRoles={userRoles}
        />

        {totalItems > ITEMS_PER_PAGE && (
          <div className="mt-6 flex justify-end items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
