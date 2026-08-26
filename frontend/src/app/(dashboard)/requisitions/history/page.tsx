// frontend/src/app/(dashboard)/requisitions/history/page.tsx

'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
  Sparkles,
  ChevronRight,
  Activity,
  Package,
  Shield,
  Award as AwardIcon,
  Users,
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
import { Progress } from '@/components/ui/progress';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useRequisitions,
  useRequisitionHistory,
} from '@/hooks/useRequisitionQueries';
import { useDepartments } from '@/hooks/useDepartments';
import {
  useProcurementSummary,
} from '@/hooks/useProcurement';

// Types
import type { Requisition, RequisitionFilters, RequisitionHistory } from '@/types/requisition.types';

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const ROLE_LABELS: Record<string, string> = {
  'ADMIN': 'Administrator',
  'HOD': 'Head of Department',
  'ACCOUNTANT': 'Accountant/Finance',
  'HEAD OF INSTITUTION': 'Principal/Head of Institution',
  'FINAL_APPROVER': 'Director/Finance Administrator',
  'PROCUREMENT': 'Procurement Officer',
  'SUPPLIER': 'Supplier/Vendor',
  'AUDITOR': 'Auditorial Staff Officer',
  'SUPER_ADMIN': 'Super Administrator',
};

const getRoleLabel = (roleName: string): string => {
  if (!roleName) return 'Unknown Role';
  const upperRole = roleName.toUpperCase();
  return ROLE_LABELS[upperRole] || roleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const APPROVAL_LEVELS = [
  { key: 'hod', label: 'HOD', fullLabel: 'Head of Department', icon: UserCog, color: 'blue' },
  { key: 'accountant', label: 'Accountant', fullLabel: 'Accountant/Finance', icon: CreditCard, color: 'indigo' },
  { key: 'principal', label: 'Principal', fullLabel: 'Principal/Head of Institution', icon: Crown, color: 'purple' },
  { key: 'final', label: 'Final Approver', fullLabel: 'Director/Finance Administrator', icon: Award, color: 'green' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  submitted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  hod_approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  hod_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  accountant_approved: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  accountant_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  principal_approved: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  principal_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  final_approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  final_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  returned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  revised: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

const PRIORITY_CONFIG: Record<string, { color: string; icon: any; label: string; bg: string }> = {
  low: { color: 'text-blue-600 dark:text-blue-400', icon: Leaf, label: 'Low', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  medium: { color: 'text-yellow-600 dark:text-yellow-400', icon: MinusCircle, label: 'Medium', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  high: { color: 'text-orange-600 dark:text-orange-400', icon: Flame, label: 'High', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  emergency: { color: 'text-red-600 dark:text-red-400', icon: Zap, label: 'Emergency', bg: 'bg-red-50 dark:bg-red-950/30' },
};

const HISTORY_ACTION_CONFIG: Record<string, { color: string; icon: any; label: string; description: string }> = {
  created: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: FileText, label: 'Created', description: 'Requisition was created' },
  updated: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700', icon: Edit, label: 'Updated', description: 'Requisition details were updated' },
  submitted: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', icon: Send, label: 'Submitted', description: 'Requisition was submitted for approval' },
  hod_approved: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: UserCheck, label: 'HOD Approved', description: 'Approved by Head of Department' },
  hod_declined: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: UserX, label: 'HOD Declined', description: 'Declined by Head of Department' },
  accountant_approved: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800', icon: CreditCard, label: 'Accountant Approved', description: 'Approved by Accountant/Finance' },
  accountant_declined: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: CreditCard, label: 'Accountant Declined', description: 'Declined by Accountant/Finance' },
  principal_approved: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: Crown, label: 'Principal Approved', description: 'Approved by Principal/Head of Institution' },
  principal_declined: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: Crown, label: 'Principal Declined', description: 'Declined by Principal/Head of Institution' },
  final_approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', icon: Award, label: 'Final Approved', description: 'Final approval granted by Director/Finance Administrator' },
  final_declined: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: Award, label: 'Final Declined', description: 'Final approval declined by Director/Finance Administrator' },
  returned: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: RotateCcw, label: 'Returned', description: 'Returned for revision' },
  cancelled: { color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700', icon: X, label: 'Cancelled', description: 'Requisition was cancelled' },
  commented: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: MessageSquare, label: 'Commented', description: 'Comment added to requisition' },
  revised: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: Edit, label: 'Revised', description: 'Requisition was revised' },
  escalated: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: AlertCircle, label: 'Escalated', description: 'Requisition was escalated' },
  delegated: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: User, label: 'Delegated', description: 'Approval was delegated' },
  procurement_started: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: ShoppingCart, label: 'Procurement Started', description: 'Procurement process initiated' },
  procurement_completed: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', icon: CheckCircle, label: 'Procurement Completed', description: 'Procurement process completed' },
  procurement_cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: X, label: 'Procurement Cancelled', description: 'Procurement was cancelled' },
  qtn_generated: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800', icon: FileCheck, label: 'QTN Generated', description: 'Quotation Request generated' },
  qtn_sent: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: Send, label: 'QTN Sent', description: 'Quotation Request sent to suppliers' },
  quote_received: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', icon: Users, label: 'Quote Received', description: 'Supplier quotation received' },
  supplier_selected: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: CheckCircle, label: 'Supplier Selected', description: 'Supplier selected for procurement' },
  lpo_generated: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: ShoppingCart, label: 'LPO/LSO Generated', description: 'Purchase/Service order generated' },
  grn_generated: { color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800', icon: Truck, label: 'GRN/SAN Generated', description: 'Goods received note generated' },
  payment_voucher: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: Receipt, label: 'Payment Voucher', description: 'Payment voucher generated' },
  cheque_issued: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', icon: DollarSign, label: 'Cheque Issued', description: 'Cheque issued for payment' },
};

const ITEMS_PER_PAGE = 10;

// ============================================
// HELPERS
// ============================================

const safeGet = (obj: any, path: string, fallback: any = null): any => {
  if (!obj || typeof obj !== 'object') return fallback;
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return fallback;
    }
    result = result[key];
  }
  return (result === undefined || result === null) ? fallback : result;
};

const safeEquals = (obj: any, path: string, target: string): boolean => {
  const value = safeGet(obj, path, '');
  return String(value) === target;
};

// Stage weights for completion calculation (fallback only)
const STAGE_WEIGHTS: Record<string, number> = {
  'initiated': 10,
  'quotation_in_progress': 25,
  'awaiting_quotations': 30,
  'evaluating_quotations': 45,
  'supplier_selected': 60,
  'goods_receipt_pending': 75,
  'invoicing_pending': 85,
  'payment_pending': 95,
  'completed': 100,
};

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

const filterSubmittedOnly = (requisitions: Requisition[]): Requisition[] => {
  return requisitions.filter(req => req.status !== 'draft');
};

const hasBeenDeclined = (requisition: Requisition): boolean => {
  if (!requisition.approvals) return false;
  return requisition.approvals.some((a: any) =>
    a.status === 'declined' || a.status === 'cancelled'
  );
};

const isDeclinedStatus = (status: string): boolean => {
  const declinedStatuses = ['hod_declined', 'accountant_declined', 'principal_declined', 'final_declined'];
  return declinedStatuses.includes(status);
};

const hasProcurementStarted = (requisition: Requisition): boolean => {
  return requisition.is_procurement_created === true || requisition.procurement_created_at !== null;
};

const isProcurementComplete = (requisition: Requisition, summary?: any): boolean => {
  // Use backend data first
  if (summary) {
    const isCompleted = safeGet(summary, 'procurement.is_completed', false);
    if (isCompleted) return true;
  }
  // Fallback to local check
  return requisition.is_procurement_created === true &&
    requisition.status === 'final_approved' &&
    (requisition.metadata?.payment_completed === true ||
      requisition.metadata?.cheque_issued === true);
};

// Get procurement progress from backend
const getProcurementProgress = (summary: any): number => {
  if (!summary) return 0;

  // Use backend completion rate from metrics
  const completionRate = safeGet(summary, 'metrics.completion_rate', null);
  if (completionRate !== null && completionRate !== undefined) {
    return Math.min(Math.max(completionRate, 0), 100);
  }

  // Fallback to stage-based calculation
  const isCompleted = safeGet(summary, 'procurement.is_completed', false);
  if (isCompleted) return 100;

  const status = safeGet(summary, 'procurement.status', '');
  const steps = safeGet(summary, 'procurement.steps', {});

  if (status && STAGE_WEIGHTS[status]) {
    let progress = STAGE_WEIGHTS[status];

    const sqStatus = safeGet(steps, 'supplier_quotations.status', '');
    if (status === 'evaluating_quotations' && String(sqStatus) === 'completed') {
      progress += 5;
    }

    const pgStatus = safeGet(steps, 'po_generation.status', '');
    if (status === 'supplier_selected' && (String(pgStatus) === 'completed' || String(pgStatus) === 'in_progress')) {
      progress += 5;
    }

    return Math.min(progress, 99);
  }

  let progress = 0;

  const qtnStatus = safeGet(steps, 'quotation.status', '');
  if (String(qtnStatus) === 'closed' || String(qtnStatus) === 'completed') {
    progress += 20;
  } else if (String(qtnStatus) === 'sent' || String(qtnStatus) === 'responded') {
    progress += 15;
  }

  const sqStatus = safeGet(steps, 'supplier_quotations.status', '');
  const sqReceived = safeGet(steps, 'supplier_quotations.quotes_received', 0);
  if (String(sqStatus) === 'completed') {
    progress += 20;
  } else if (Number(sqReceived) > 0) {
    progress += 15;
  }

  const ssStatus = safeGet(steps, 'supplier_selection.status', '');
  if (String(ssStatus) === 'completed') {
    progress += 20;
  } else if (String(ssStatus) === 'in_progress') {
    progress += 10;
  }

  const pgStatus = safeGet(steps, 'po_generation.status', '');
  if (String(pgStatus) === 'completed') {
    progress += 15;
  } else if (String(pgStatus) === 'in_progress') {
    progress += 10;
  }

  const delStatus = safeGet(steps, 'delivery.status', '');
  if (String(delStatus) === 'completed') {
    progress += 15;
  } else if (String(delStatus) === 'in_progress') {
    progress += 10;
  }

  const payStatus = safeGet(steps, 'payment.status', '');
  if (String(payStatus) === 'completed') {
    progress += 10;
  } else if (String(payStatus) === 'in_progress') {
    progress += 5;
  }

  return Math.min(progress, 99);
};

const getProcurementStatusLabel = (summary: any): string => {
  if (!summary) return 'Not Started';

  const isCompleted = safeGet(summary, 'procurement.is_completed', false);
  if (isCompleted) return 'Complete';

  const status = safeGet(summary, 'procurement.status', '');
  const steps = safeGet(summary, 'procurement.steps', {});

  const statusMap: Record<string, string> = {
    'initiated': 'Initiated',
    'quotation_in_progress': 'Quotation in Progress',
    'awaiting_quotations': 'Awaiting Quotations',
    'evaluating_quotations': 'Evaluating Quotations',
    'supplier_selected': 'Supplier Selected',
    'goods_receipt_pending': 'Goods Receipt Pending',
    'invoicing_pending': 'Invoicing Pending',
    'payment_pending': 'Payment Pending',
    'completed': 'Completed',
  };

  if (statusMap[status]) return statusMap[status];

  const sqStatus = safeGet(steps, 'supplier_quotations.status', '');
  const ssStatus = safeGet(steps, 'supplier_selection.status', '');
  const pgStatus = safeGet(steps, 'po_generation.status', '');
  const delStatus = safeGet(steps, 'delivery.status', '');
  const payStatus = safeGet(steps, 'payment.status', '');

  if (String(payStatus) === 'completed') return 'Payment Processed';
  if (String(delStatus) === 'completed') return 'Goods Received';
  if (String(pgStatus) === 'completed') return 'LPO/LSO Issued';
  if (String(ssStatus) === 'completed') return 'Supplier Selected';
  if (String(sqStatus) === 'completed') return 'Quotes Evaluated';
  if (String(sqStatus) === 'in_progress') return 'Awaiting Quotes';

  return status?.replace(/_/g, ' ') || 'In Progress';
};

const getProcurementProgressColor = (progress: number): string => {
  if (progress >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (progress >= 60) return 'text-blue-600 dark:text-blue-400';
  if (progress >= 40) return 'text-indigo-600 dark:text-indigo-400';
  if (progress >= 20) return 'text-amber-600 dark:text-amber-400';
  return 'text-gray-600 dark:text-gray-400';
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const label = getStatusLabel(status);
  const isDeclined = isDeclinedStatus(status);

  return (
    <Badge className={cn("font-medium border rounded-full", colorClass, isDeclined && "line-through")}>
      {label}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1 text-xs rounded-full", config.bg, config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// ============================================
// APPROVAL FLOW BADGE
// ============================================

interface ApprovalFlowBadgeProps {
  approvals: any[];
  status: string;
}

const ApprovalFlowBadge = ({ approvals, status }: ApprovalFlowBadgeProps) => {
  if (!approvals || approvals.length === 0) {
    return (
      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 rounded-full">
        <CircleDashed className="h-3 w-3 mr-1" />
        Waiting
      </Badge>
    );
  }

  const levelOrder = ['hod', 'accountant', 'principal', 'final'];
  const sortedApprovals = [...approvals].sort((a, b) => {
    return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
  });

  const declinedApproval = sortedApprovals.find(a => a.status === 'declined' || a.status === 'cancelled');

  if (declinedApproval) {
    const declinedIndex = sortedApprovals.indexOf(declinedApproval);
    const approvalsToShow = sortedApprovals.slice(0, declinedIndex + 1);

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {approvalsToShow.map((approval, index) => {
          const levelInfo = APPROVAL_LEVELS.find(l => l.key === approval.level);
          const isDeclined = approval.status === 'declined' || approval.status === 'cancelled';
          const isApproved = approval.status === 'approved';

          return (
            <React.Fragment key={approval.id}>
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                isApproved && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
                isDeclined && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
                !isApproved && !isDeclined && "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
              )}>
                {isApproved && <CheckCircle className="h-2.5 w-2.5 mr-0.5" />}
                {isDeclined && <XCircle className="h-2.5 w-2.5 mr-0.5" />}
                {!isApproved && !isDeclined && <CircleDashed className="h-2.5 w-2.5 mr-0.5" />}
                {levelInfo?.label || approval.level}
              </div>
              {index < approvalsToShow.length - 1 && (
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              )}
            </React.Fragment>
          );
        })}
        {declinedApproval && (
          <Badge variant="destructive" className="text-[10px] ml-1 rounded-full">
            <XCircle className="h-2.5 w-2.5 mr-0.5" />
            Declined
          </Badge>
        )}
      </div>
    );
  }

  const allApproved = sortedApprovals.every(a => a.status === 'approved');
  const pendingApprovals = sortedApprovals.filter(a => a.status === 'pending');

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {sortedApprovals.map((approval, index) => {
        const levelInfo = APPROVAL_LEVELS.find(l => l.key === approval.level);
        const isApproved = approval.status === 'approved';
        const isPending = approval.status === 'pending';

        return (
          <React.Fragment key={approval.id}>
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              isApproved && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
              isPending && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
              !isApproved && !isPending && "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
            )}>
              {isApproved && <CheckCircle className="h-2.5 w-2.5 mr-0.5" />}
              {isPending && <Loader2 className="h-2.5 w-2.5 mr-0.5 animate-spin" />}
              {!isApproved && !isPending && <CircleDashed className="h-2.5 w-2.5 mr-0.5" />}
              {levelInfo?.label || approval.level}
            </div>
            {index < sortedApprovals.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            )}
          </React.Fragment>
        );
      })}
      {allApproved && (
        <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 ml-1 rounded-full">
          <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
          Fully Approved
        </Badge>
      )}
      {pendingApprovals.length > 0 && !allApproved && (
        <Badge className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 ml-1 rounded-full">
          <Clock className="h-2.5 w-2.5 mr-0.5" />
          {pendingApprovals.length} pending
        </Badge>
      )}
    </div>
  );
};

// ============================================
// PROCUREMENT PROGRESS INDICATOR
// ============================================

const ProcurementProgressIndicator = ({ requisition }: { requisition: Requisition }) => {
  const isFullyApproved = requisition.status === 'final_approved';

  if (!isFullyApproved) return null;

  const { data: summary, isLoading } = useProcurementSummary(requisition.id, {
    enabled: isFullyApproved,
  });

  if (isLoading) {
    return (
      <div className="mt-1.5 flex items-center gap-1.5">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const started = hasProcurementStarted(requisition);
  const complete = isProcurementComplete(requisition, summary);
  const progress = getProcurementProgress(summary);
  const statusLabel = getProcurementStatusLabel(summary);
  const progressColor = getProcurementProgressColor(progress);

  if (!started) {
    return (
      <div className="mt-1.5 flex items-center gap-1.5">
        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 rounded-full">
          <ShoppingCart className="h-3 w-3 mr-1" />
          Ready for Procurement
        </Badge>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="mt-1.5 flex items-center gap-1.5">
        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800 rounded-full">
          <CheckCircle className="h-3 w-3 mr-1" />
          Procurement Complete
        </Badge>
      </div>
    );
  }

  return (
    <div className="mt-1.5 space-y-0.5">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 rounded-full">
          <Activity className="h-3 w-3 mr-1" />
          {statusLabel}
        </Badge>
        <span className={cn("text-xs font-medium", progressColor)}>
          {progress}%
        </span>
      </div>
      <Progress value={progress} className="h-1 w-24 bg-gray-200 dark:bg-gray-700" />
    </div>
  );
};

// ============================================
// HISTORY DETAILS CARD
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
      <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border dark:border-gray-700">
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
      <Card className="mt-4 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
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
    <Card className="mt-4 border-2 border-blue-100 dark:border-blue-900/50 shadow-lg bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 rounded-xl relative">
      <WrappedCornerTag label="HISTORY" color="blue" position="top-left" size="lg" />
      <CardHeader className="pb-3 pt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50">
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
              className="h-8 px-2 rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 px-2 rounded-xl"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 max-h-[500px] overflow-y-auto">
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
              const isProcurementAction = history.action?.includes('procurement') ||
                history.action?.includes('qtn') ||
                history.action?.includes('lpo') ||
                history.action?.includes('grn') ||
                history.action?.includes('supplier');

              const userRoleLabel = history.user?.role_label || getRoleLabel(history.user?.role || '');

              return (
                <motion.div
                  key={history.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "border rounded-xl p-4 transition-all hover:shadow-md dark:border-gray-700",
                    isFirst && "border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20",
                    isDeclinedAction && "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20",
                    isProcurementAction && "border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20"
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
                        <Badge className={cn("text-xs font-medium rounded-full", config.color)}>
                          {config.label}
                        </Badge>
                        {isFirst && (
                          <Badge variant="default" className="text-[10px] bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full">
                            Latest
                          </Badge>
                        )}
                        {history.is_status_change && history.new_status && (
                          <Badge variant="outline" className="text-[10px] dark:border-gray-600 rounded-full">
                            Status: {history.new_status}
                          </Badge>
                        )}
                        {isProcurementAction && (
                          <Badge variant="outline" className="text-[10px] border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-full">
                            <ShoppingCart className="h-2.5 w-2.5 mr-0.5" />
                            Procurement
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {config.description}
                      </p>

                      {history.comment && (
                        <div className="mt-2 bg-muted/30 dark:bg-gray-800/50 rounded-xl p-2 border dark:border-gray-700">
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
                            {history.user.role && (
                              <span className="text-[10px] text-muted-foreground">({userRoleLabel})</span>
                            )}
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
                                <div className="flex items-center gap-1 cursor-help bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded-full border dark:border-gray-700">
                                  <Globe className="h-3 w-3" />
                                  <span className="font-mono">{history.ip_address}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-xl">
                                <p>IP Address: {history.ip_address}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {history.user_agent && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 cursor-help bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded-full border dark:border-gray-700">
                                  {getDeviceIcon(history.user_agent)}
                                  <span>{getDeviceName(history.user_agent)}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs rounded-xl">
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
    <Card className="mb-6 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl relative">
      <HorizontalCornerTag label="FILTERS" color="blue" position="top-left" size="sm" variant="rounded" />
      <CardContent className="p-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filters</span>
            <Badge variant="secondary" className="ml-2 rounded-full">
              {Object.keys(filters).filter(key => filters[key as keyof RequisitionFilters]).length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1 rounded-xl"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1 rounded-xl">
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
              className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
            />
          </div>

          <Select
            value={filters.status as string || 'all'}
            onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
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
            <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
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
              <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
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
              className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
            />

            <Input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => onFilterChange('date_to', e.target.value || undefined)}
              className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
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
  currentPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const HistoryTable = ({
  data,
  isLoading,
  onView,
  onViewHistory,
  expandedHistoryId,
  userId,
  userRoles = [],
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
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

  const canViewProcurement = userRoles.some(role =>
    role === 'procurement' || role === 'accountant' || role === 'admin' || role === 'super_admin'
  );

  return (
    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-gray-800/50">
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead className="min-w-[200px]">Requisition</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="min-w-[300px]">Approval Flow</TableHead>
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
              const statusColor = isApproved ? 'emerald' :
                isCancelledStatus ? 'gray' :
                  isDeclined ? 'red' :
                    isReturned ? 'amber' :
                      req.status === 'submitted' ? 'blue' :
                        req.status === 'hod_approved' ? 'indigo' :
                          req.status === 'accountant_approved' ? 'purple' :
                            req.status === 'principal_approved' ? 'teal' : 'gray';

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
                      {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
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
                            {req.user?.role && (
                              <span className="text-[10px] text-muted-foreground"> • {getRoleLabel(req.user.role)}</span>
                            )}
                          </span>
                        </div>
                        {isDeclined && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant="destructive" className="text-xs rounded-full">
                              <XCircle className="h-3 w-3 mr-1" />
                              Declined
                            </Badge>
                          </div>
                        )}
                        {isCancelledStatus && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant="secondary" className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancelled
                            </Badge>
                          </div>
                        )}
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
                    <TableCell>
                      <ApprovalFlowBadge
                        approvals={req.approvals || []}
                        status={req.status}
                      />
                    </TableCell>
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
                                className="h-8 w-8 p-0 rounded-xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onView(req.id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl">View Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-8 w-8 p-0 rounded-xl",
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
                            <TooltipContent className="rounded-xl">
                              {isHistoryExpanded ? 'Hide History' : 'View History'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {isApproved && !isCancelledStatus && canViewProcurement && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "h-8 w-8 p-0 rounded-xl",
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
                              <TooltipContent className="rounded-xl">
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
                      <TableCell colSpan={7} className="p-0">
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

      {/* Pagination */}
      {totalItems > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-muted/30">
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

  const data = filterSubmittedOnly(rawData);
  const isLoading = allRequisitionsQuery.isLoading || departmentsLoading;

  // Build stats for StatsCards component - using backend data
  const statsItems: StatCardItem[] = useMemo(() => {
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

    // Procurement stats - using backend data
    const readyForProcurement = rawData.filter(r =>
      r.status === 'final_approved' &&
      !hasProcurementStarted(r) &&
      !isProcurementComplete(r)
    ).length;

    const inProcurement = rawData.filter(r =>
      r.status === 'final_approved' &&
      hasProcurementStarted(r) &&
      !isProcurementComplete(r)
    ).length;

    const procurementComplete = rawData.filter(r =>
      r.status === 'final_approved' &&
      isProcurementComplete(r)
    ).length;

    return [
      {
        label: "Total Submitted",
        value: total,
        icon: FileText,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: "All submitted requisitions",
      },
      {
        label: "Pending Approval",
        value: pending,
        icon: Clock,
        tagLabel: "PENDING",
        tagColor: "amber",
        subtitle: "In approval process",
      },
      {
        label: "Approved",
        value: approved,
        icon: CheckCircle,
        tagLabel: "APPROVED",
        tagColor: "emerald",
        subtitle: "Fully approved",
      },
      {
        label: "Ready for Procurement",
        value: readyForProcurement,
        icon: ShoppingCart,
        tagLabel: "READY",
        tagColor: "blue",
        subtitle: "Approved, not started",
      },
      {
        label: "In Procurement",
        value: inProcurement,
        icon: Activity,
        tagLabel: "ACTIVE",
        tagColor: "amber",
        subtitle: "In progress",
      },
      {
        label: "Procurement Complete",
        value: procurementComplete,
        icon: CheckCircle,
        tagLabel: "DONE",
        tagColor: "emerald",
        subtitle: "Fully completed",
      },
    ];
  }, [rawData]);

  const procurementReady = useMemo(() => {
    return rawData.filter(r =>
      r.status === 'final_approved' &&
      !isProcurementComplete(r)
    ).length;
  }, [rawData]);

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

  const canManageProcurement = userRoles.some(role =>
    role === 'procurement' || role === 'accountant' || role === 'admin' || role === 'super_admin'
  );

  return (
    <PageTemplate
      title="Requisition History"
      description="View complete audit trail of all requisitions with detailed activity logs and procurement tracking"
      icon={<History className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Requisitions', href: '/requisitions' },
        { label: 'History' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {procurementReady > 0 && canManageProcurement && (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/procurement')}
              className="gap-2 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl"
            >
              <ShoppingCart className="h-4 w-4" />
              Procurement ({procurementReady})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => allRequisitionsQuery.refetch()}
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push('/requisitions/create')}
            className="gap-2 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl"
          >
            <FileText className="h-4 w-4" />
            New Requisition
          </Button>
        </div>
      }
    >
      {/* Info Banner - Procurement Ready */}
      {procurementReady > 0 && canManageProcurement && (
        <Card className="mb-6 border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl shadow-sm relative">
          <HorizontalCornerTag label="READY" color="blue" position="top-left" size="sm" variant="rounded" />
          <CardContent className="p-4 pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex-shrink-0">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  {procurementReady} Approved Requisition{procurementReady > 1 ? 's' : ''} Ready for Procurement
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400/80">
                  These requisitions have been fully approved and can now proceed to the procurement phase.
                  Generate QTN and send to suppliers.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20 dark:shadow-blue-600/10 rounded-xl"
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

      {/* Stats Cards - tagOrientation set to none */}
      <StatsCards
        stats={statsItems}
        isLoading={isLoading}
        columns={6}
        variant="default"
        formatCompact={true}
        tagOrientation="none"
      />

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
          currentPage={currentPage}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </PageTemplate>
  );
}
