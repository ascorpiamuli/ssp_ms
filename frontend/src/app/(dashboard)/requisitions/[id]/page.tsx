// frontend/src/app/(dashboard)/requisitions/[id]/page.tsx

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  RotateCcw,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
  Package,
  Shield,
  MessageSquare,
  History,
  Printer,
  MoreVertical,
  Loader2,
  Info,
  UserCheck,
  UserX,
  Crown,
  Award,
  CreditCard,
  UserCog,
  Truck,
  Mail,
  Box,
  Hash,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  Layers,
  Zap,
  Flame,
  Leaf,
  ChevronDown,
  RefreshCw,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  ArrowRight,
  Repeat,
  AlertTriangle,
  ShoppingCart,
  FileCheck,
  Users,
  Receipt,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import { useRequisition, useRequisitionHistory } from '@/hooks/useRequisitionQueries';
import {
  useDeleteRequisition,
  useSubmitRequisition,
  useReturnRequisition,
  useCancelRequisition,
} from '@/hooks/useRequisitionMutations';

// Types
import type { Requisition, RequisitionHistory } from '@/types/requisition.types';

// ============================================
// CONSTANTS
// ============================================

const APPROVER_ROLES = ['hod', 'accountant', 'principal', 'final_approver', 'admin', 'super_admin'];
const APPROVABLE_STATUSES = ['submitted', 'hod_approved', 'accountant_approved', 'principal_approved'];
const FINAL_STATES = ['final_approved', 'final_declined', 'cancelled'];
const DECLINED_STATUSES = ['hod_declined', 'accountant_declined', 'principal_declined', 'final_declined'];
const RETURNED_STATUS = 'returned';

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string; gradient: string }> = {
  draft: {
    color: 'bg-muted/50 text-muted-foreground border-muted',
    icon: FileText,
    label: 'Draft',
    gradient: 'from-muted to-muted-foreground/50',
  },
  submitted: {
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800',
    icon: Clock,
    label: 'Submitted',
    gradient: 'from-yellow-500 to-amber-500',
  },
  hod_approved: {
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
    icon: UserCheck,
    label: 'HOD Approved',
    gradient: 'from-blue-500 to-indigo-500',
  },
  hod_declined: {
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: UserX,
    label: 'HOD Declined',
    gradient: 'from-red-500 to-rose-500',
  },
  accountant_approved: {
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800',
    icon: CreditCard,
    label: 'Accountant Approved',
    gradient: 'from-indigo-500 to-purple-500',
  },
  accountant_declined: {
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: CreditCard,
    label: 'Accountant Declined',
    gradient: 'from-red-500 to-rose-500',
  },
  principal_approved: {
    color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800',
    icon: Crown,
    label: 'HOI Approved',
    gradient: 'from-purple-500 to-violet-500',
  },
  principal_declined: {
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: Crown,
    label: 'HOI Declined',
    gradient: 'from-red-500 to-rose-500',
  },
  final_approved: {
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
    icon: Award,
    label: 'Approved',
    gradient: 'from-emerald-500 to-teal-500',
  },
  final_declined: {
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: Award,
    label: 'Declined',
    gradient: 'from-red-500 to-rose-500',
  },
  returned: {
    color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800',
    icon: RotateCcw,
    label: 'Returned',
    gradient: 'from-amber-500 to-orange-500',
  },
  revised: {
    color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800',
    icon: Edit,
    label: 'Revised',
    gradient: 'from-purple-500 to-violet-500',
  },
  cancelled: {
    color: 'bg-muted/30 text-muted-foreground border-muted',
    icon: X,
    label: 'Cancelled',
    gradient: 'from-muted to-muted-foreground/30',
  },
};

const HISTORY_ACTION_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  created: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText, label: 'Created' },
  updated: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Edit, label: 'Updated' },
  submitted: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Send, label: 'Submitted' },
  hod_approved: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: UserCheck, label: 'HOD Approved' },
  hod_declined: { color: 'bg-red-100 text-red-700 border-red-200', icon: UserX, label: 'HOD Declined' },
  accountant_approved: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: CreditCard, label: 'Accountant Approved' },
  accountant_declined: { color: 'bg-red-100 text-red-700 border-red-200', icon: CreditCard, label: 'Accountant Declined' },
  principal_approved: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Crown, label: 'HOI Approved' },
  principal_declined: { color: 'bg-red-100 text-red-700 border-red-200', icon: Crown, label: 'HOI Declined' },
  final_approved: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Award, label: 'Final Approved' },
  final_declined: { color: 'bg-red-100 text-red-700 border-red-200', icon: Award, label: 'Final Declined' },
  returned: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: RotateCcw, label: 'Returned' },
  cancelled: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: X, label: 'Cancelled' },
  commented: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: MessageSquare, label: 'Commented' },
  revised: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Edit, label: 'Revised' },
  escalated: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, label: 'Escalated' },
  delegated: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: User, label: 'Delegated' },
  procurement_started: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ShoppingCart, label: 'Procurement Started' },
  qtn_generated: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: FileCheck, label: 'QTN Generated' },
  qtn_sent: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Send, label: 'QTN Sent' },
  quote_received: { color: 'bg-green-100 text-green-700 border-green-200', icon: Users, label: 'Quote Received' },
  supplier_selected: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle, label: 'Supplier Selected' },
  lpo_generated: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ShoppingCart, label: 'LPO/LSO Generated' },
  grn_generated: { color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Truck, label: 'GRN/SAN Generated' },
  payment_voucher: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Receipt, label: 'Payment Voucher' },
  cheque_issued: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: DollarSign, label: 'Cheque Issued' },
};

const APPROVAL_LEVEL_MAP: Record<string, { level: number; name: string; icon: any; color: string; bgColor: string }> = {
  hod: {
    level: 1,
    name: 'Head of Department',
    icon: UserCog,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  accountant: {
    level: 2,
    name: 'Accountant',
    icon: CreditCard,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
  principal: {
    level: 3,
    name: 'Head of Institution',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  final: {
    level: 4,
    name: 'Final Approver',
    icon: Award,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
};

const PRIORITY_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  low: { color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800', icon: Leaf, label: 'Low' },
  medium: { color: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800', icon: MinusCircle, label: 'Medium' },
  high: { color: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800', icon: Flame, label: 'High' },
  emergency: { color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800', icon: Zap, label: 'Emergency' },
};

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
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
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

const getApprovalLevelInfo = (level: string) => {
  return APPROVAL_LEVEL_MAP[level] || {
    level: 0,
    name: level || 'Unknown',
    icon: Shield,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
  };
};

const getDeviceIcon = (userAgent?: string | null) => {
  if (!userAgent) return Monitor;
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return Smartphone;
  if (ua.includes('tablet') || ua.includes('ipad')) return Tablet;
  if (ua.includes('laptop') || ua.includes('macbook')) return Laptop;
  return Monitor;
};

const isRequisitionDeclined = (status: string): boolean => {
  return DECLINED_STATUSES.includes(status);
};

const isRequisitionReturned = (status: string): boolean => {
  return status === RETURNED_STATUS;
};

const hasDeclinedApproval = (approvals: any[]): boolean => {
  if (!approvals) return false;
  return approvals.some((a: any) => a.status === 'declined' || a.status === 'cancelled');
};

const hasReturnedApproval = (approvals: any[]): boolean => {
  if (!approvals) return false;
  return approvals.some((a: any) => a.status === 'returned');
};

const hasProcurementStarted = (requisition: Requisition): boolean => {
  return requisition.is_procurement_created === true || requisition.procurement_created_at !== null;
};

const isProcurementComplete = (requisition: Requisition): boolean => {
  return requisition.is_procurement_created === true &&
    requisition.status === 'final_approved' &&
    (requisition.metadata?.payment_completed === true ||
      requisition.metadata?.cheque_issued === true);
};

// Check if requisition is emergency type
const isEmergencyRequisition = (requisition: Requisition): boolean => {
  return requisition.type === 'emergency';
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status, size = 'default' }: { status: string; size?: 'sm' | 'default' | 'lg' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    default: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };
  const isDeclined = isRequisitionDeclined(status);
  const isReturned = isRequisitionReturned(status);

  return (
    <Badge variant="outline" className={cn(
      "flex items-center font-medium transition-all",
      config.color,
      sizeClasses[size],
      isDeclined && "line-through",
      isReturned && "animate-pulse"
    )}>
      <Icon className={cn(
        "flex-shrink-0",
        size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
      )} />
      {config.label}
    </Badge>
  );
};

const ReturnedIndicatorBadge = ({ className }: { className?: string }) => {
  return (
    <Badge className={cn(
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700",
      "flex items-center gap-1.5 font-medium shadow-sm",
      className
    )}>
      <RotateCcw className="h-3.5 w-3.5" />
      Returned
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1.5 text-xs font-medium", config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const ApprovalProgress = ({ approvals, status }: { approvals: any[]; status: string }) => {
  const totalLevels = 4;
  const declined = hasDeclinedApproval(approvals);
  const returned = isRequisitionReturned(status) || hasReturnedApproval(approvals);
  const isDeclined = isRequisitionDeclined(status) || declined;

  const completedLevels = approvals.filter(a => a.status === 'approved').length;
  const progress = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;

  const getLevelStatus = (levelKey: string) => {
    const approval = approvals.find((a: any) => a.level === levelKey);
    if (!approval) return 'pending';
    return approval.status;
  };

  if (status === 'draft') {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-3">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Not Submitted Yet</p>
        <p className="text-xs text-muted-foreground">This requisition is still in draft mode</p>
      </div>
    );
  }

  if (isDeclined) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm font-medium text-red-600 dark:text-red-400">Requisition Declined</p>
        <p className="text-xs text-muted-foreground">This requisition has been declined and cannot proceed further</p>
      </div>
    );
  }

  if (returned) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
          <RotateCcw className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Returned for Revision</p>
        <p className="text-xs text-muted-foreground">This requisition has been returned for revision and needs to be resubmitted</p>
      </div>
    );
  }

  const levelKeys = ['hod', 'accountant', 'principal', 'final'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        {levelKeys.map((key, index) => {
          const levelInfo = getApprovalLevelInfo(key);
          const levelStatus = getLevelStatus(key);
          const isCompleted = levelStatus === 'approved';
          const isCurrent = levelStatus === 'pending';
          const isLevelDeclined = levelStatus === 'declined' || levelStatus === 'returned';
          const Icon = levelInfo.icon;

          return (
            <div key={key} className="flex-1 flex flex-col items-center">
              <div className="relative">
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500",
                  isCompleted && "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30",
                  isCurrent && "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30 animate-pulse",
                  isLevelDeclined && "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30",
                  !isCompleted && !isCurrent && !isLevelDeclined && "bg-muted/50 border-muted-foreground/30 text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : isCurrent ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : isLevelDeclined ? (
                    <XCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                {index < levelKeys.length - 1 && (
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 left-full w-full h-1",
                    isCompleted ? "bg-emerald-500" : "bg-muted-foreground/20"
                  )} />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium mt-2 text-center",
                isCompleted && "text-emerald-600 dark:text-emerald-400",
                isCurrent && "text-amber-600 dark:text-amber-400",
                isLevelDeclined && "text-red-600 dark:text-red-400",
                !isCompleted && !isCurrent && !isLevelDeclined && "text-muted-foreground"
              )}>
                {levelInfo.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-muted-foreground text-center">
                {isCompleted ? 'Approved' :
                  isCurrent ? 'Pending' :
                    isLevelDeclined ? 'Declined' :
                      'Waiting'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Approval Progress</span>
          <span className="font-medium">{completedLevels} of {totalLevels} levels completed</span>
        </div>
        <Progress value={progress} className="h-2.5" />
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PROCUREMENT TAB CONTENT - BLUE TO GREEN PROGRESSION
// ============================================

const ProcurementTabContent = ({ requisition }: { requisition: Requisition }) => {
  const isFullyApproved = requisition.status === 'final_approved';
  const started = hasProcurementStarted(requisition);
  const complete = isProcurementComplete(requisition);

  if (!isFullyApproved) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">Procurement Not Available</h3>
        <p className="text-sm text-muted-foreground">
          This requisition must be fully approved before procurement can begin.
        </p>
        <Badge variant="outline" className="mt-4">
          Status: {requisition.status_label || requisition.status}
        </Badge>
      </div>
    );
  }

  const procurementStages = [
    { id: 'qtn', label: 'Quotation Request (QTN)', icon: FileCheck, completed: requisition.metadata?.qtn_generated || false, description: 'Generate and send QTN to suppliers' },
    { id: 'quotes', label: 'Supplier Quotations', icon: Users, completed: requisition.metadata?.quotes_received || false, description: 'Receive and review supplier quotations' },
    { id: 'selection', label: 'Supplier Selection', icon: CheckCircle, completed: requisition.metadata?.supplier_selected || false, description: 'Select the best supplier (system suggests lowest price)' },
    { id: 'lpo', label: 'LPO/LSO Generation', icon: ShoppingCart, completed: requisition.metadata?.lpo_generated || false, description: 'Generate purchase/service order' },
    { id: 'delivery', label: 'Delivery / Service', icon: Truck, completed: requisition.metadata?.delivery_completed || false, description: 'Receive goods or acknowledge service' },
    { id: 'payment', label: 'Payment Processing', icon: Receipt, completed: complete, description: 'Process payment and issue cheque' },
  ];

  const completedCount = procurementStages.filter(s => s.completed).length;
  const totalStages = procurementStages.length;

  // Determine color based on progress - Blue to Green progression
  const getProgressBg = () => {
    if (complete) return 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20';
    if (completedCount >= 4) return 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20';
    if (completedCount >= 2) return 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20';
    return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-950/20';
  };

  const getHeaderColor = () => {
    if (complete) return 'text-emerald-600 dark:text-emerald-400';
    if (completedCount >= 4) return 'text-indigo-600 dark:text-indigo-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getIconBg = () => {
    if (complete) return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (completedCount >= 4) return 'bg-indigo-100 dark:bg-indigo-900/30';
    return 'bg-blue-100 dark:bg-blue-900/30';
  };

  const getButtonColor = () => {
    if (complete) return 'bg-emerald-600 hover:bg-emerald-700';
    if (completedCount >= 4) return 'bg-indigo-600 hover:bg-indigo-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const getProgressColor = () => {
    if (complete) return 'bg-emerald-600 dark:bg-emerald-400';
    if (completedCount >= 4) return 'bg-indigo-600 dark:bg-indigo-400';
    return 'bg-blue-600 dark:bg-blue-400';
  };

  const getStageBorder = (stageCompleted: boolean, isCurrent: boolean) => {
    if (stageCompleted) return 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800';
    if (isCurrent) return 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-sm';
    return 'bg-muted/30 border-muted/50 opacity-60';
  };

  const getStageIconColor = (stageCompleted: boolean, isCurrent: boolean) => {
    if (stageCompleted) return 'bg-emerald-500 text-white';
    if (isCurrent) return 'bg-blue-500 text-white animate-pulse';
    return 'bg-muted/50 text-muted-foreground';
  };

  const getStageTextColor = (stageCompleted: boolean, isCurrent: boolean) => {
    if (stageCompleted) return 'text-emerald-700 dark:text-emerald-300';
    if (isCurrent) return 'text-blue-700 dark:text-blue-300';
    return 'text-muted-foreground';
  };

  const getStageBadge = (stageCompleted: boolean, isCurrent: boolean) => {
    if (stageCompleted) return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    if (isCurrent) return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    return 'bg-muted/50 text-muted-foreground border-muted';
  };

  const getStatusIcon = (stageCompleted: boolean, isCurrent: boolean) => {
    if (stageCompleted) return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    if (isCurrent) return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    return <Circle className="h-5 w-5 text-muted-foreground/30" />;
  };

  return (
    <div className="space-y-6">
      {/* Procurement Status Header */}
      <Card className={cn(
        "border-0 shadow-lg",
        getProgressBg()
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                getIconBg()
              )}>
                <ShoppingCart className={cn(
                  "h-8 w-8",
                  getHeaderColor()
                )} />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {complete ? 'Procurement Complete' :
                    started ? 'Procurement In Progress' :
                      'Ready for Procurement'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {complete ? 'All procurement stages have been completed successfully.' :
                    started ? `${completedCount} of ${totalStages} stages completed` :
                      'Start the procurement process for this approved requisition.'}
                </p>
              </div>
            </div>
            {!complete && (
              <Button
                className={cn(
                  "shadow-sm text-white",
                  getButtonColor()
                )}
                onClick={() => window.location.href = `/requisitions/${requisition.id}/procurement`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {started ? 'Continue Procurement' : 'Start Procurement'}
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {!complete && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{Math.round((completedCount / totalStages) * 100)}%</span>
              </div>
              <div className="relative h-2.5 w-full bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getProgressColor()
                  )}
                  style={{ width: `${(completedCount / totalStages) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Procurement Stages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            Procurement Stages
          </CardTitle>
          <CardDescription>
            Track the progress of each stage in the procurement workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {procurementStages.map((stage, index) => {
              const StageIcon = stage.icon;
              const isCompleted = stage.completed;
              const isCurrent = !isCompleted && (
                index === 0 ||
                (index > 0 && procurementStages[index - 1].completed)
              );

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border transition-all",
                    getStageBorder(isCompleted, isCurrent)
                  )}>
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                      getStageIconColor(isCompleted, isCurrent)
                    )}>
                      <StageIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          "font-medium",
                          getStageTextColor(isCompleted, isCurrent)
                        )}>
                          {stage.label}
                        </h4>
                        <Badge className={cn(
                          "text-xs",
                          getStageBadge(isCompleted, isCurrent)
                        )}>
                          {isCompleted ? 'Completed' :
                            isCurrent ? 'In Progress' :
                              'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{stage.description}</p>
                      {isCurrent && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
                          onClick={() => window.location.href = `/requisitions/${requisition.id}/procurement`}
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Continue to {stage.label}
                        </Button>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusIcon(isCompleted, isCurrent)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Procurement Details */}
      {started && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              Procurement Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {requisition.is_procurement_created && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Procurement Created</p>
                  <p className="text-sm font-medium">{formatDate(requisition.procurement_created_at)}</p>
                </div>
              )}
              {requisition.metadata?.qtn_number && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">QTN Number</p>
                  <p className="text-sm font-mono font-medium">{requisition.metadata.qtn_number}</p>
                </div>
              )}
              {requisition.metadata?.supplier_name && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Selected Supplier</p>
                  <p className="text-sm font-medium">{requisition.metadata.supplier_name}</p>
                </div>
              )}
              {requisition.metadata?.lpo_number && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">LPO/LSO Number</p>
                  <p className="text-sm font-mono font-medium">{requisition.metadata.lpo_number}</p>
                </div>
              )}
              {requisition.metadata?.contract_number && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Contract Number</p>
                  <p className="text-sm font-mono font-medium">{requisition.metadata.contract_number}</p>
                </div>
              )}
              {complete && requisition.metadata?.payment_date && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Payment Date</p>
                  <p className="text-sm font-medium">{formatDate(requisition.metadata.payment_date)}</p>
                </div>
              )}
              {complete && requisition.metadata?.cheque_number && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Cheque Number</p>
                  <p className="text-sm font-mono font-medium">{requisition.metadata.cheque_number}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ============================================
// HISTORY ITEM
// ============================================

const HistoryItem = ({ history, index }: { history: RequisitionHistory; index: number }) => {
  const config = HISTORY_ACTION_CONFIG[history.action] || {
    color: 'bg-muted/50 text-muted-foreground border-muted',
    icon: Clock,
    label: history.action_label || history.action,
  };
  const Icon = config.icon;
  const isFirst = index === 0;
  const isDeclinedAction = history.action?.includes('declined') || false;
  const isReturnedAction = history.action === 'returned';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
    >
      <div className={cn(
        "absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm",
        config.color.split(' ')[0]
      )}>
        <div className="absolute inset-0 rounded-full bg-current opacity-20" />
      </div>
      <div className={cn(
        "bg-card rounded-xl p-4 border hover:shadow-md transition-all duration-200",
        isDeclinedAction && "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20",
        isReturnedAction && "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-xs font-medium", config.color)}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              {isFirst && (
                <Badge variant="default" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                  Latest
                </Badge>
              )}
              {history.is_status_change && history.new_status && (
                <Badge variant="outline" className="text-[10px]">
                  Status: {history.new_status}
                </Badge>
              )}
            </div>

            <div className="mt-2 space-y-1">
              {history.comment && (
                <p className="text-sm text-card-foreground flex items-start gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <span>{history.comment}</span>
                </p>
              )}

              {history.old_values && history.new_values && (
                <div className="mt-2 text-xs bg-muted/30 rounded-lg p-3 border">
                  <p className="font-medium text-muted-foreground mb-2">Changes:</p>
                  <div className="space-y-1">
                    {Object.keys(history.old_values).map((key) => {
                      if (history.old_values?.[key] !== history.new_values?.[key]) {
                        return (
                          <div key={key} className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="text-red-500 line-through">{String(history.old_values?.[key] ?? 'N/A')}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-emerald-600 dark:text-emerald-400">{String(history.new_values?.[key] ?? 'N/A')}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <p className="text-xs font-medium text-muted-foreground">{formatDate(history.created_at)}</p>
            <div className="flex items-center justify-end gap-2 mt-1">
              {history.user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-6 w-6 border">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {getInitials(getFullName(history.user))}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{getFullName(history.user)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getFullName(history.user)}</p>
                      {history.user.email && <p className="text-xs">{history.user.email}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
              {history.ip_address && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-0.5 cursor-help bg-muted/30 px-1.5 py-0.5 rounded">
                        <Globe className="h-3 w-3" />
                        <span>{history.ip_address}</span>
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
                      <div className="flex items-center gap-0.5 cursor-help bg-muted/30 px-1.5 py-0.5 rounded">
                        {(() => {
                          const DeviceIcon = getDeviceIcon(history.user_agent);
                          return <DeviceIcon className="h-3 w-3" />;
                        })()}
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
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function RequisitionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { user } = useAuthContext();

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

  const { data: requisition, isLoading, error, refetch } = useRequisition(id);
  const { data: historyData, isLoading: historyLoading } = useRequisitionHistory(id, {
    per_page: 50,
  });

  const { mutate: deleteRequisition } = useDeleteRequisition();
  const { mutate: submitRequisition } = useSubmitRequisition();
  const { mutate: returnRequisition } = useReturnRequisition();
  const { mutate: cancelRequisition } = useCancelRequisition();

  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const isDeclined = useMemo(() => {
    if (!requisition) return false;
    return isRequisitionDeclined(requisition.status) || hasDeclinedApproval(requisition.approvals || []);
  }, [requisition]);

  const isReturned = useMemo(() => {
    if (!requisition) return false;
    return isRequisitionReturned(requisition.status) || hasReturnedApproval(requisition.approvals || []);
  }, [requisition]);

  const isFinalState = useMemo(() => {
    if (!requisition) return false;
    return FINAL_STATES.includes(requisition.status);
  }, [requisition]);

  const isEmergency = useMemo(() => {
    if (!requisition) return false;
    return isEmergencyRequisition(requisition);
  }, [requisition]);

  const hasUserApproved = useMemo(() => {
    if (!requisition || !user || isDeclined) return false;
    const userApprovalRole = userRoles.find(role =>
      ['hod', 'accountant', 'principal', 'final_approver'].includes(role)
    );
    if (!userApprovalRole) return false;
    const approval = requisition.approvals?.find((a: any) =>
      a.level === userApprovalRole && a.status === 'approved'
    );
    return !!approval;
  }, [requisition, user, userRoles, isDeclined]);

  const canEdit = requisition?.is_editable && !isDeclined && !isReturned || false;
  const canSubmit = (requisition?.status === 'draft' || requisition?.status === 'returned' || requisition?.status === 'revised') && !isDeclined;
  const canCancel = (requisition?.status === 'draft' || requisition?.status === 'submitted' || requisition?.status === 'returned' || requisition?.status === 'revised') && !isDeclined;

  const canReturn = useMemo(() => {
    if (!requisition || isDeclined || isReturned) return false;
    if (!APPROVABLE_STATUSES.includes(requisition.status)) return false;
    const hasApproverRole = userRoles.some(role => APPROVER_ROLES.includes(role));
    if (!hasApproverRole) return false;
    if (requisition.user?.id === user?.id) return false;
    if (hasUserApproved) return false;
    if (isFinalState) return false;
    return true;
  }, [requisition, userRoles, user, hasUserApproved, isFinalState, isDeclined, isReturned]);

  const canDelete = requisition?.status === 'draft' && !isDeclined;
  const canViewProcurement = userRoles.some(role =>
    role === 'procurement' || role === 'accountant' || role === 'admin' || role === 'super_admin'
  );

  const historyItems = useMemo(() => {
    if (!historyData) return [];
    if (historyData.data && Array.isArray(historyData.data)) return historyData.data;
    if (Array.isArray(historyData)) return historyData;
    return [];
  }, [historyData]);

  const handleBack = () => router.push('/requisitions/manage');
  const handleEdit = () => router.push(`/requisitions/${id}/edit`);
  const handleDelete = () => setShowDeleteDialog(true);
  const handleSubmit = () => { setShowSubmitDialog(true); setComment(''); };
  const handleReturn = () => { setShowReturnDialog(true); setComment(''); };
  const handleCancel = () => { setShowCancelDialog(true); setComment(''); };
  const handlePrint = () => window.print();

  const handleConfirmDelete = () => {
    if (requisition) {
      deleteRequisition(requisition.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          router.push('/requisitions/manage');
        },
      });
    }
  };

  const handleConfirmSubmit = () => {
    if (requisition) {
      submitRequisition({
        id: requisition.id,
        data: { comment: comment || undefined },
      }, {
        onSuccess: () => {
          setShowSubmitDialog(false);
          refetch();
        },
      });
    }
  };

  const handleConfirmReturn = () => {
    if (requisition) {
      returnRequisition({
        id: requisition.id,
        data: { reason: comment || 'Returned for revision' },
      }, {
        onSuccess: () => {
          setShowReturnDialog(false);
          refetch();
        },
      });
    }
  };

  const handleConfirmCancel = () => {
    if (requisition) {
      cancelRequisition({
        id: requisition.id,
        data: { reason: comment || 'Cancelled by user' },
      }, {
        onSuccess: () => {
          setShowCancelDialog(false);
          refetch();
        },
      });
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <PageTemplate
        title="Requisition Details"
        description="Loading requisition information..."
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
        actions={<div className="h-9 w-24" />}
      >
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }

  if (error || !requisition) {
    return (
      <PageTemplate
        title="Requisition Details"
        description="Error loading requisition"
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
        actions={
          <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      >
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Requisition</AlertTitle>
          <AlertDescription>
            We couldn't load the requisition details. Please try again or go back to the requisitions list.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageTemplate>
    );
  }

  const totalItems = requisition.items?.length || 0;
  const totalApprovals = requisition.approvals?.length || 0;
  const pendingApprovals = requisition.approvals?.filter((a: any) => a.status === 'pending') || [];
  const procurementStarted = hasProcurementStarted(requisition);
  const procurementComplete = isProcurementComplete(requisition);

  return (
    <PageTemplate
      title={`Requisition: ${requisition.reference_number}`}
      description={`${requisition.title} - ${requisition.department?.name || 'No Department'}`}
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {isReturned && <ReturnedIndicatorBadge className="h-8 px-3 text-sm" />}

          {requisition.status === 'final_approved' && !isDeclined && (
            <Badge className={cn(
              "h-8 px-3 text-sm font-medium",
              procurementComplete ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" :
                procurementStarted ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" :
                  "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
            )}>
              {procurementComplete ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Procurement Complete
                </>
              ) : procurementStarted ? (
                <>
                  <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                  In Progress
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                  Ready for Procurement
                </>
              )}
            </Badge>
          )}

          {isEmergency && (
            <Badge variant="destructive" className="h-8 px-3 text-sm font-medium animate-pulse">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Emergency
            </Badge>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 h-9">
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print this requisition</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 h-9" disabled={isLoading}>
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh requisition data</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <MoreVertical className="h-4 w-4" />
                <span className="hidden sm:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canEdit && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Requisition
                </DropdownMenuItem>
              )}
              {canSubmit && (
                <DropdownMenuItem onClick={handleSubmit} className="text-emerald-600">
                  <Send className="h-4 w-4 mr-2" />
                  {isReturned ? 'Resubmit for Approval' : 'Submit for Approval'}
                </DropdownMenuItem>
              )}
              {canReturn && (
                <DropdownMenuItem onClick={handleReturn} className="text-amber-600">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return for Revision
                </DropdownMenuItem>
              )}
              {canCancel && (
                <DropdownMenuItem onClick={handleCancel} className="text-red-600">
                  <X className="h-4 w-4 mr-2" />
                  Cancel Requisition
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Requisition
                  </DropdownMenuItem>
                </>
              )}
              {requisition.status === 'final_approved' && !isDeclined && canViewProcurement && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push(`/requisitions/${requisition.id}/procurement`)}
                    className={cn(
                      procurementComplete ? "text-emerald-600" :
                        procurementStarted ? "text-blue-600" :
                          "text-blue-600"
                    )}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {procurementComplete ? 'View Procurement' :
                      procurementStarted ? 'Continue Procurement' :
                        'Start Procurement'}
                  </DropdownMenuItem>
                </>
              )}
              {isDeclined && (
                <DropdownMenuItem disabled className="text-red-400 cursor-not-allowed">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Requisition Declined
                </DropdownMenuItem>
              )}
              {isReturned && !isDeclined && (
                <DropdownMenuItem disabled className="text-amber-400 cursor-not-allowed">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Returned - Needs Revision
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" size="sm" onClick={handleBack} className="gap-2 h-9">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
      }
    >
      {/* Alerts */}
      {isReturned && !isDeclined && (
        <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
            Returned for Revision
            <ReturnedIndicatorBadge />
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            This requisition has been returned for revision. Please review the comments, make necessary changes, and resubmit for approval.
            {requisition.return_reason && (
              <span className="block mt-2 p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-sm">
                <strong>Reason:</strong> {requisition.return_reason}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isDeclined && (
        <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950/30">
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-300">Requisition Declined</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            This requisition has been declined and cannot be processed further.
            {requisition.approvals?.find((a: any) => a.status === 'declined')?.decline_reason && (
              <span className="block mt-1 text-sm">
                Reason: {requisition.approvals.find((a: any) => a.status === 'declined')?.decline_reason}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {requisition.status === 'final_approved' && !isDeclined && (
        <Alert className="mb-6 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-800 dark:text-emerald-300">Approved</AlertTitle>
          <AlertDescription className="text-emerald-700 dark:text-emerald-400">
            This requisition has been fully approved and is ready for the procurement process.
          </AlertDescription>
        </Alert>
      )}

      {isEmergency && requisition.status !== 'final_approved' && (
        <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950/20">
          <Zap className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 dark:text-red-300">Emergency Requisition</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            This is an emergency requisition. It will follow the fast-track approval process.
          </AlertDescription>
        </Alert>
      )}

      {requisition.status === 'cancelled' && (
        <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950/20">
          <X className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 dark:text-red-300">Cancelled</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            This requisition has been cancelled.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Card */}
          <Card className={cn(
            "overflow-hidden border-0 shadow-lg",
            isDeclined ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20" :
              isReturned ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800" :
                isEmergency ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border-2 border-red-200 dark:border-red-800" :
                  requisition.status === 'final_approved' ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20" :
                    "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20"
          )}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                      isDeclined ? "bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/30" :
                        isReturned ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30" :
                          isEmergency ? "bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/30 animate-pulse" :
                            requisition.status === 'final_approved' ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30" :
                              "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-500/30"
                    )}>
                      {isDeclined ? (
                        <XCircle className="h-7 w-7 text-white" />
                      ) : isReturned ? (
                        <RotateCcw className="h-7 w-7 text-white" />
                      ) : isEmergency ? (
                        <Zap className="h-7 w-7 text-white" />
                      ) : requisition.status === 'final_approved' ? (
                        <CheckCircle className="h-7 w-7 text-white" />
                      ) : (
                        <FileText className="h-7 w-7 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h1 className={cn(
                      "text-2xl font-bold",
                      isDeclined && "text-red-600 dark:text-red-400 line-through",
                      isReturned && "text-amber-600 dark:text-amber-400",
                      isEmergency && "text-red-600 dark:text-red-400"
                    )}>
                      {isReturned && <RotateCcw className="h-5 w-5 inline mr-1.5 text-amber-500" />}
                      {isEmergency && <Zap className="h-5 w-5 inline mr-1.5 text-red-500" />}
                      {requisition.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="font-mono text-sm bg-background/50 px-2 py-0.5 rounded">
                        {requisition.reference_number}
                      </span>
                      <StatusBadge status={requisition.status} size="sm" />
                      <PriorityBadge priority={requisition.priority} />
                      {isReturned && <ReturnedIndicatorBadge className="text-xs" />}
                      {isEmergency && (
                        <Badge variant="destructive" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Emergency
                        </Badge>
                      )}
                      {requisition.status === 'final_approved' && !isDeclined && (
                        <Badge className={cn(
                          "text-xs",
                          procurementComplete ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" :
                            procurementStarted ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" :
                              "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                        )}>
                          {procurementComplete ? '✅ Complete' :
                            procurementStarted ? '🔄 In Progress' :
                              '🛒 Ready'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className={cn(
                    "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                    isDeclined ? "from-red-600 to-rose-600" :
                      isReturned ? "from-amber-600 to-orange-600" :
                        isEmergency ? "from-red-600 to-rose-600" :
                          requisition.status === 'final_approved' ? "from-emerald-600 to-teal-600" :
                            "from-blue-600 to-indigo-600"
                  )}>
                    {formatCurrency(requisition.total_amount || 0)}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Items</p>
                    <p className="font-semibold text-lg">{totalItems}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10">
                    <Shield className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Approvals</p>
                    <p className="font-semibold text-lg">{totalApprovals}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className={cn(
                      "font-semibold text-lg",
                      isDeclined ? "text-red-600" :
                        isReturned ? "text-amber-600" :
                          isEmergency ? "text-red-600" :
                            "text-amber-600"
                    )}>
                      {isDeclined ? 0 : pendingApprovals.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-semibold text-sm">{formatDate(requisition.created_at)}</p>
                  </div>
                </div>
              </div>

              {isReturned && requisition.return_count > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <Repeat className="h-4 w-4" />
                    <span className="font-medium">Returned {requisition.return_count} time{requisition.return_count > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-muted/50 p-1 h-auto">
              <TabsTrigger value="overview" className="flex-1 gap-2 data-[state=active]:bg-background py-2.5">
                <Info className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="items" className="flex-1 gap-2 data-[state=active]:bg-background py-2.5">
                <Package className="h-4 w-4" />
                Items ({totalItems})
              </TabsTrigger>
              <TabsTrigger value="approvals" className="flex-1 gap-2 data-[state=active]:bg-background py-2.5">
                <Shield className="h-4 w-4" />
                Approvals ({totalApprovals})
              </TabsTrigger>
              <TabsTrigger value="procurement" className="flex-1 gap-2 data-[state=active]:bg-background py-2.5">
                <ShoppingCart className="h-4 w-4" />
                Procurement
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 gap-2 data-[state=active]:bg-background py-2.5">
                <History className="h-4 w-4" />
                History ({historyItems.length})
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              {isReturned && (
                <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-800 dark:text-amber-300 text-sm font-semibold">
                    This Requisition Has Been Returned
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                    Please review the return reason and make the necessary changes before resubmitting.
                  </AlertDescription>
                </Alert>
              )}

              {isEmergency && (
                <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                  <Zap className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertTitle className="text-red-800 dark:text-red-300 text-sm font-semibold">
                    🚨 Emergency Requisition
                  </AlertTitle>
                  <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
                    This requisition is marked as emergency and will follow the fast-track approval process.
                  </AlertDescription>
                </Alert>
              )}

              {requisition.description && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={cn(
                      "text-sm leading-relaxed",
                      isDeclined && "text-muted-foreground"
                    )}>{requisition.description}</p>
                  </CardContent>
                </Card>
              )}

              {requisition.justification && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      Justification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={cn(
                      "text-sm leading-relaxed",
                      isDeclined && "text-muted-foreground"
                    )}>{requisition.justification}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm capitalize font-medium">{requisition.type || 'N/A'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Urgency</p>
                      <p className="text-sm capitalize font-medium">{requisition.urgency || 'N/A'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Risk Level</p>
                      <p className="text-sm capitalize font-medium">{requisition.risk_level || 'N/A'}</p>
                    </div>
                    {requisition.budget_code && (
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Budget Code</p>
                        <p className="text-sm font-mono font-medium">{requisition.budget_code}</p>
                      </div>
                    )}
                    {requisition.budget_source && (
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Budget Source</p>
                        <p className="text-sm font-medium">{requisition.budget_source}</p>
                      </div>
                    )}
                    {requisition.funding_source && (
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Funding Source</p>
                        <p className="text-sm font-medium">{requisition.funding_source}</p>
                      </div>
                    )}
                    {requisition.project_code && (
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Project Code</p>
                        <p className="text-sm font-mono font-medium">{requisition.project_code}</p>
                      </div>
                    )}
                    {requisition.procurement_method && (
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Procurement Method</p>
                        <p className="text-sm capitalize font-medium">{requisition.procurement_method?.replace('_', ' ')}</p>
                      </div>
                    )}
                    {isEmergency && (
                      <div className="space-y-0.5 col-span-2">
                        <Badge variant="destructive" className="text-xs">🚨 Emergency Procurement</Badge>
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="text-sm font-medium">{formatDate(requisition.submitted_at)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Approved</p>
                      <p className="text-sm font-medium">{formatDate(requisition.approved_at)}</p>
                    </div>
                    {isReturned && requisition.returned_at && (
                      <div className="space-y-0.5 col-span-2">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Returned At</p>
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatDate(requisition.returned_at)}</p>
                      </div>
                    )}
                    {isReturned && requisition.return_reason && (
                      <div className="space-y-0.5 col-span-2">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Return Reason</p>
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                          {requisition.return_reason}
                        </p>
                      </div>
                    )}
                    {requisition.return_count > 0 && (
                      <div className="space-y-0.5 col-span-2">
                        <p className="text-xs text-muted-foreground">Return Count</p>
                        <p className="text-sm font-medium">{requisition.return_count}x</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Approval Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ApprovalProgress approvals={requisition.approvals || []} status={requisition.status} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items" className="mt-4">
              <Card className="overflow-hidden">
                <CardHeader className={cn(
                  "pb-3",
                  isReturned ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20" :
                    isEmergency ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20" :
                      "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className={cn(
                          "h-5 w-5",
                          isReturned ? "text-amber-600" :
                            isEmergency ? "text-red-600" :
                              "text-blue-600"
                        )} />
                        Requisition Items
                      </CardTitle>
                      <CardDescription>
                        {totalItems} item{totalItems !== 1 ? 's' : ''} requested • Total: {formatCurrency(requisition.total_amount || 0)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {isReturned && <ReturnedIndicatorBadge className="text-xs" />}
                      {isEmergency && (
                        <Badge variant="destructive" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Emergency
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-sm font-medium">
                        {totalItems} items
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {requisition.items && requisition.items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[250px]">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                Item
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                Quantity
                              </div>
                            </TableHead>
                            <TableHead className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                Unit Cost
                              </div>
                            </TableHead>
                            <TableHead className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                Total
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                Status
                              </div>
                            </TableHead>
                            <TableHead className="w-[50px]">
                              <div className="flex items-center gap-2">
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {requisition.items.map((item: any, index: number) => {
                              const isExpanded = expandedRows.has(item.id);
                              return (
                                <React.Fragment key={item.id}>
                                  <motion.tr
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    className={cn(
                                      "group hover:bg-muted/50 transition-colors cursor-pointer",
                                      (isDeclined || isReturned) && "opacity-75"
                                    )}
                                    onClick={() => toggleRow(item.id)}
                                  >
                                    <TableCell className="font-medium">
                                      <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                          <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform",
                                            isDeclined ? "bg-red-50 dark:bg-red-900/20" :
                                              isReturned ? "bg-amber-50 dark:bg-amber-900/20" :
                                                isEmergency ? "bg-red-50 dark:bg-red-900/20" :
                                                  "bg-blue-50 dark:bg-blue-900/20"
                                          )}>
                                            <Package className={cn(
                                              "h-4 w-4",
                                              isDeclined ? "text-red-600" :
                                                isReturned ? "text-amber-600" :
                                                  isEmergency ? "text-red-600" :
                                                    "text-blue-600"
                                            )} />
                                          </div>
                                        </div>
                                        <div>
                                          <p className="font-medium">{item.item_name}</p>
                                          {item.specifications && (
                                            <p className="text-xs text-muted-foreground">{item.specifications}</p>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">{item.quantity}</span>
                                        <span className="text-xs text-muted-foreground">{item.unit_of_measure}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {formatCurrency(item.estimated_unit_cost || 0)}
                                    </TableCell>
                                    <TableCell className={cn(
                                      "text-right font-bold",
                                      isDeclined ? "text-red-600" :
                                        isReturned ? "text-amber-600" :
                                          isEmergency ? "text-red-600" :
                                            "text-blue-600"
                                    )}>
                                      {formatCurrency(item.total_cost || 0)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className={cn(
                                        "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                                        (isDeclined || isReturned) && "opacity-50"
                                      )}>
                                        <Clock className="h-3 w-3 mr-1" />
                                        {item.status || 'Pending'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleRow(item.id);
                                        }}
                                      >
                                        <ChevronDown className={cn(
                                          "h-4 w-4 transition-transform duration-200",
                                          isExpanded && "rotate-180"
                                        )} />
                                      </Button>
                                    </TableCell>
                                  </motion.tr>
                                  {isExpanded && (
                                    <motion.tr
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <TableCell colSpan={6} className="p-0">
                                        <div className={cn(
                                          "p-4 rounded-lg m-2",
                                          isDeclined ? "bg-red-50/30 dark:bg-red-950/10" :
                                            isReturned ? "bg-amber-50/30 dark:bg-amber-950/10" :
                                              isEmergency ? "bg-red-50/30 dark:bg-red-950/10" :
                                                "bg-muted/30"
                                        )}>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {item.description && (
                                              <div className="col-span-2">
                                                <p className="text-xs text-muted-foreground">Description</p>
                                                <p className={cn(
                                                  "text-sm",
                                                  (isDeclined || isReturned) && "text-muted-foreground"
                                                )}>{item.description}</p>
                                              </div>
                                            )}
                                            {item.manufacturer && (
                                              <div>
                                                <p className="text-xs text-muted-foreground">Manufacturer</p>
                                                <p className="text-sm">{item.manufacturer}</p>
                                              </div>
                                            )}
                                            {item.model_number && (
                                              <div>
                                                <p className="text-xs text-muted-foreground">Model</p>
                                                <p className="text-sm">{item.model_number}</p>
                                              </div>
                                            )}
                                            {item.catalog_number && (
                                              <div>
                                                <p className="text-xs text-muted-foreground">Catalog #</p>
                                                <p className="text-sm font-mono">{item.catalog_number}</p>
                                              </div>
                                            )}
                                            {(item.tax_rate > 0 || item.discount_percentage > 0) && (
                                              <div className="col-span-2 flex gap-4">
                                                {item.tax_rate > 0 && (
                                                  <div>
                                                    <p className="text-xs text-muted-foreground">Tax Rate</p>
                                                    <p className="text-sm">{item.tax_rate}%</p>
                                                  </div>
                                                )}
                                                {item.discount_percentage > 0 && (
                                                  <div>
                                                    <p className="text-xs text-muted-foreground">Discount</p>
                                                    <p className="text-sm">{item.discount_percentage}%</p>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                            {item.is_inventory_item && (
                                              <div>
                                                <p className="text-xs text-muted-foreground">Inventory</p>
                                                <p className="text-sm flex items-center gap-1">
                                                  <Box className="h-3 w-3" />
                                                  {item.inventory_code || 'Yes'}
                                                </p>
                                              </div>
                                            )}
                                            {item.supplier && (
                                              <div className="col-span-2">
                                                <p className="text-xs text-muted-foreground">Preferred Supplier</p>
                                                <p className="text-sm">{item.supplier.company_name || 'N/A'}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </TableCell>
                                    </motion.tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No Items Found</h3>
                      <p className="text-sm text-muted-foreground">This requisition has no items added yet.</p>
                    </div>
                  )}
                </CardContent>
                {requisition.items && requisition.items.length > 0 && (
                  <CardFooter className="border-t bg-muted/30 pt-4">
                    <div className="flex justify-between w-full">
                      <span className="text-sm text-muted-foreground">
                        Total Items: <span className="font-medium">{totalItems}</span>
                      </span>
                      <span className={cn(
                        "text-sm font-semibold",
                        isDeclined ? "text-red-600" :
                          isReturned ? "text-amber-600" :
                            isEmergency ? "text-red-600" :
                              requisition.status === 'final_approved' ? "text-emerald-600" :
                                "text-blue-600"
                      )}>
                        Grand Total: {formatCurrency(requisition.total_amount || 0)}
                      </span>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* Approvals Tab - Keep existing */}
            <TabsContent value="approvals" className="mt-4">
              <Card>
                <CardHeader className={cn(
                  "pb-3",
                  isReturned ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20" :
                    isEmergency ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20" :
                      "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className={cn(
                          "h-5 w-5",
                          isReturned ? "text-amber-600" :
                            isEmergency ? "text-red-600" :
                              "text-blue-600"
                        )} />
                        Approval Workflow
                      </CardTitle>
                      <CardDescription>
                        {totalApprovals} approval{totalApprovals !== 1 ? 's' : ''} • {isDeclined ? 'Declined' : isReturned ? 'Returned' : `${pendingApprovals.length} pending`}
                      </CardDescription>
                    </div>
                    {isReturned && <ReturnedIndicatorBadge className="text-xs" />}
                    {isEmergency && (
                      <Badge variant="destructive" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Emergency
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {requisition.approvals && requisition.approvals.length > 0 ? (
                    <div className="space-y-4">
                      {requisition.approvals.map((approval: any, index: number) => {
                        const levelInfo = getApprovalLevelInfo(approval.level);
                        const isPending = approval.status === 'pending';
                        const isApproved = approval.status === 'approved';
                        const isDeclinedApproval = approval.status === 'declined' || approval.status === 'returned';
                        const Icon = levelInfo.icon;
                        const isBlocked = (isDeclined || isReturned) && !isDeclinedApproval;

                        return (
                          <motion.div
                            key={approval.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div
                              className={cn(
                                "rounded-xl p-5 border transition-all duration-300 hover:shadow-md",
                                isPending && !isDeclined && !isReturned && "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-800",
                                isApproved && "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800",
                                (isDeclinedApproval || isBlocked) && "border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800",
                                isReturned && !isDeclinedApproval && !isBlocked && "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800",
                                isBlocked && "opacity-60"
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <div className={cn(
                                    "flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0",
                                    isPending && !isDeclined && !isReturned ? "bg-yellow-100 dark:bg-yellow-900/30" :
                                      isApproved ? "bg-emerald-100 dark:bg-emerald-900/30" :
                                        isReturned && !isDeclinedApproval ? "bg-amber-100 dark:bg-amber-900/30" :
                                          "bg-red-100 dark:bg-red-900/30"
                                  )}>
                                    {isPending && !isDeclined && !isReturned ? (
                                      <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
                                    ) : isApproved ? (
                                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                                    ) : isReturned && !isDeclinedApproval ? (
                                      <RotateCcw className="h-6 w-6 text-amber-500" />
                                    ) : (
                                      <XCircle className="h-6 w-6 text-red-500" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-medium text-base">
                                        Level {levelInfo.level}: {levelInfo.name}
                                      </h4>
                                      {isBlocked ? (
                                        <Badge variant="outline" className="text-xs text-muted-foreground">
                                          Blocked
                                        </Badge>
                                      ) : isReturned && !isDeclinedApproval ? (
                                        <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                          Returned
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant={isPending ? 'default' : isApproved ? 'success' : 'destructive'}
                                          className="capitalize"
                                        >
                                          {isDeclinedApproval ? 'Declined' : approval.status_label || approval.status}
                                        </Badge>
                                      )}
                                    </div>
                                    {approval.approver && (
                                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                        <User className="h-3.5 w-3.5" />
                                        {getFullName(approval.approver)}
                                        {approval.approver.email && (
                                          <span className="text-xs text-muted-foreground">({approval.approver.email})</span>
                                        )}
                                      </p>
                                    )}
                                    {approval.comment && (
                                      <div className="mt-2 bg-background/50 rounded-lg p-3 border">
                                        <p className="text-sm flex items-start gap-2">
                                          <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                          <span>{approval.comment}</span>
                                        </p>
                                      </div>
                                    )}
                                    {approval.reason && (
                                      <p className="text-sm text-red-600 flex items-start gap-2 mt-1">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <span>{approval.reason}</span>
                                      </p>
                                    )}
                                    {isBlocked && (
                                      <p className="text-sm text-muted-foreground flex items-start gap-2 mt-1">
                                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <span>This approval is blocked because the requisition has been returned or declined</span>
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                      {approval.reviewed_at && (
                                        <span>Reviewed: {formatDate(approval.reviewed_at)}</span>
                                      )}
                                      {approval.due_date && (
                                        <span>Due: {formatDate(approval.due_date)}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {isBlocked ? (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                      <XCircle className="h-4 w-4" />
                                      Blocked
                                    </span>
                                  ) : isReturned && !isDeclinedApproval ? (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                                      <RotateCcw className="h-4 w-4" />
                                      Returned
                                    </span>
                                  ) : isPending && !isDeclined ? (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                                      <Clock className="h-4 w-4" />
                                      Waiting
                                    </span>
                                  ) : isApproved ? (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                                      <CheckCircle className="h-4 w-4" />
                                      Approved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                                      <XCircle className="h-4 w-4" />
                                      {approval.status === 'returned' ? 'Returned' : 'Declined'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                        <Shield className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No Approvals Found</h3>
                      <p className="text-sm text-muted-foreground">
                        {requisition.status === 'draft'
                          ? 'Submit this requisition to start the approval process.'
                          : 'No approval records found for this requisition.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Procurement Tab */}
            <TabsContent value="procurement" className="mt-4">
              <ProcurementTabContent requisition={requisition} />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader className={cn(
                  "pb-3",
                  isReturned ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20" :
                    isEmergency ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20" :
                      "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History className={cn(
                          "h-5 w-5",
                          isReturned ? "text-amber-600" :
                            isEmergency ? "text-red-600" :
                              "text-blue-600"
                        )} />
                        History Log
                      </CardTitle>
                      <CardDescription>
                        {historyItems.length} activities and changes made to this requisition
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {isReturned && <ReturnedIndicatorBadge className="text-xs" />}
                      {isEmergency && (
                        <Badge variant="destructive" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Emergency
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {historyItems.length} entries
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : historyItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                        <History className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No History Found</h3>
                      <p className="text-sm text-muted-foreground">
                        No activities have been recorded for this requisition yet.
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-muted space-y-4">
                      {historyItems.map((history: RequisitionHistory, index: number) => (
                        <HistoryItem key={history.id} history={history} index={index} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requester Card */}
          <Card>
            <CardHeader className={cn(
              "pb-3",
              isReturned && "border-b border-amber-200 dark:border-amber-800",
              isEmergency && "border-b border-red-200 dark:border-red-800"
            )}>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Requester
                {isReturned && <ReturnedIndicatorBadge className="text-xs ml-auto" />}
                {isEmergency && (
                  <Badge variant="destructive" className="text-xs ml-auto">
                    <Zap className="h-3 w-3 mr-1" />
                    Emergency
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(requisition.user?.full_name || '')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{getFullName(requisition.user)}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {requisition.user?.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">{requisition.department?.name || 'No Department'}</p>
                  <p className="text-xs text-muted-foreground">{requisition.department?.code}</p>
                </div>
              </div>
              {requisition.supplier && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">{requisition.supplier.company_name}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions - Keep existing */}
          {(canSubmit || canEdit || canReturn || canCancel || canDelete) && !isDeclined && (
            <Card>
              <CardHeader className={cn(
                "pb-3",
                isReturned && "border-b border-amber-200 dark:border-amber-800",
                isEmergency && "border-b border-red-200 dark:border-red-800"
              )}>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Actions
                  {isReturned && <ReturnedIndicatorBadge className="text-xs ml-auto" />}
                  {isEmergency && (
                    <Badge variant="destructive" className="text-xs ml-auto">
                      <Zap className="h-3 w-3 mr-1" />
                      Emergency
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {canSubmit && (
                  <Button className={cn(
                    "w-full gap-2 shadow-sm",
                    isEmergency ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700" :
                      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  )} onClick={handleSubmit}>
                    <Send className="h-4 w-4" />
                    {isReturned ? 'Resubmit for Approval' : 'Submit for Approval'}
                  </Button>
                )}
                {canEdit && (
                  <Button className="w-full gap-2" variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                    Edit Requisition
                  </Button>
                )}
                {canReturn && (
                  <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-sm" onClick={handleReturn}>
                    <RotateCcw className="h-4 w-4" />
                    Return for Revision
                  </Button>
                )}
                {canCancel && (
                  <Button className="w-full gap-2" variant="destructive" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                    Cancel Requisition
                  </Button>
                )}
                {canDelete && (
                  <Button className="w-full gap-2" variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                    Delete Requisition
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Procurement Quick Action */}
          {requisition.status === 'final_approved' && !isDeclined && canViewProcurement && (
            <Card className={cn(
              "border",
              procurementComplete ? "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-800" :
                procurementStarted ? "border-blue-200 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-800" :
                  "border-blue-200 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-800"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShoppingCart className={cn(
                    "h-4 w-4",
                    procurementComplete ? "text-emerald-600" :
                      procurementStarted ? "text-blue-600" :
                        "text-blue-600"
                  )} />
                  Procurement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {procurementComplete ? 'This requisition has been fully procured.' :
                    procurementStarted ? 'Procurement is in progress. Continue where you left off.' :
                      'Start the procurement process for this approved requisition.'}
                </p>
                <Button
                  className={cn(
                    "w-full mt-3 shadow-sm text-white",
                    procurementComplete ? "bg-emerald-600 hover:bg-emerald-700" :
                      procurementStarted ? "bg-blue-600 hover:bg-blue-700" :
                        "bg-blue-600 hover:bg-blue-700"
                  )}
                  onClick={() => router.push(`/requisitions/${requisition.id}/procurement`)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {procurementComplete ? 'View Procurement' :
                    procurementStarted ? 'Continue Procurement' :
                      'Start Procurement'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Returned Message */}
          {isReturned && !isDeclined && (
            <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <RotateCcw className="h-4 w-4" />
                  Returned for Revision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This requisition has been returned for revision. Please make the necessary changes and resubmit.
                </p>
                {requisition.return_reason && (
                  <p className="text-sm text-amber-600 mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <strong>Reason:</strong> {requisition.return_reason}
                  </p>
                )}
                {requisition.returned_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Returned on: {formatDate(requisition.returned_at)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Emergency Message */}
          {isEmergency && !isDeclined && !isReturned && (
            <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/20 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Zap className="h-4 w-4" />
                  Emergency Requisition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is an emergency requisition and will follow the fast-track approval process.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="font-medium">Approval Flow:</span> Accountant → Principal → Final Approver (Bypasses HOD)
                </p>
              </CardContent>
            </Card>
          )}

          {/* Declined Message */}
          {isDeclined && (
            <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/20 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  Requisition Declined
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This requisition has been declined and cannot be processed further.
                </p>
                {requisition.approvals?.find((a: any) => a.status === 'declined')?.decline_reason && (
                  <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                    <strong>Reason:</strong> {requisition.approvals.find((a: any) => a.status === 'declined')?.decline_reason}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          <Card>
            <CardHeader className={cn(
              "pb-3",
              isReturned && "border-b border-amber-200 dark:border-amber-800",
              isEmergency && "border-b border-red-200 dark:border-red-800"
            )}>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Summary
                {isReturned && <ReturnedIndicatorBadge className="text-xs ml-auto" />}
                {isEmergency && (
                  <Badge variant="destructive" className="text-xs ml-auto">
                    <Zap className="h-3 w-3 mr-1" />
                    Emergency
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Items</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Approvals</span>
                <span className="font-medium">{totalApprovals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Approvals</span>
                <span className={cn(
                  "font-medium",
                  isDeclined ? "text-red-600" :
                    isReturned ? "text-amber-600" :
                      isEmergency ? "text-red-600" :
                        "text-amber-600"
                )}>
                  {isDeclined ? 0 : pendingApprovals.length}
                </span>
              </div>
              {isReturned && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">Return Count</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {requisition.return_count || 0}x
                    </span>
                  </div>
                </>
              )}
              {isEmergency && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">Emergency Type</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">Yes</span>
                  </div>
                </>
              )}
              {requisition.is_procurement_created && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Procurement</span>
                    <span className={cn(
                      "font-medium",
                      procurementComplete ? "text-emerald-600" :
                        procurementStarted ? "text-blue-600" :
                          "text-muted-foreground"
                    )}>
                      {procurementComplete ? 'Complete' :
                        procurementStarted ? 'In Progress' :
                          'Not Started'}
                    </span>
                  </div>
                  {requisition.procurement_created_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Procurement Started</span>
                      <span className="text-sm">{formatDate(requisition.procurement_created_at)}</span>
                    </div>
                  )}
                </>
              )}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className={cn(
                  "text-lg font-bold",
                  isDeclined ? "text-red-600" :
                    isReturned ? "text-amber-600" :
                      isEmergency ? "text-red-600" :
                        requisition.status === 'final_approved' ? "text-emerald-600" :
                          "text-blue-600"
                )}>
                  {formatCurrency(requisition.total_amount || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs - Keep existing */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requisition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete requisition "{requisition.reference_number}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isReturned ? 'Resubmit Requisition' : 'Submit Requisition'}</DialogTitle>
            <DialogDescription>
              {isReturned ? 'Resubmit' : 'Submit'} "{requisition.reference_number}" for approval.
              {isReturned && ' Please ensure all requested changes have been made.'}
              {isEmergency && ' This is an emergency requisition and will follow fast-track approval.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isReturned && requisition.return_reason && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Return Reason:</p>
                <p className="text-sm text-amber-600 dark:text-amber-300">{requisition.return_reason}</p>
              </div>
            )}
            {isEmergency && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">🚨 Emergency Requisition</p>
                <p className="text-sm text-red-600 dark:text-red-300">This will follow the fast-track approval process.</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder={isReturned ? "Add a comment about the changes made..." : "Add a comment for the approver..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} className={cn(
              isEmergency ? "bg-gradient-to-r from-red-600 to-rose-600" : "bg-gradient-to-r from-emerald-600 to-teal-600"
            )}>
              {isReturned ? 'Resubmit' : 'Submit'}
              {isEmergency && ' 🚨'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Requisition</DialogTitle>
            <DialogDescription>
              Return "{requisition.reference_number}" for revision.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="return-reason">Reason for Return <span className="text-red-500">*</span></Label>
              <Textarea
                id="return-reason"
                placeholder="Explain why this requisition needs revision..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReturn} disabled={!comment.trim()} className="bg-amber-600 hover:bg-amber-700">
              Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Requisition</DialogTitle>
            <DialogDescription>
              Cancel "{requisition.reference_number}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation <span className="text-red-500">*</span></Label>
              <Textarea
                id="cancel-reason"
                placeholder="Explain why you're cancelling this requisition..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Go Back
            </Button>
            <Button onClick={handleConfirmCancel} disabled={!comment.trim()} variant="destructive">
              Cancel Requisition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
