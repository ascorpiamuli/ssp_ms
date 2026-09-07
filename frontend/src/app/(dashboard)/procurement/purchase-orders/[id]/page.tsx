// frontend/src/app/(dashboard)/procurement/purchase-orders/[id]/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Building2,
  DollarSign,
  Package,
  Truck,
  Send,
  MoreVertical,
  RefreshCw,
  AlertTriangle,
  Info,
  Shield,
  Layers,
  UserCheck,
  FileCheck,
  Receipt,
  Signature,
  ShieldCheck,
  FileSignature,
  Circle,
  CheckCircle2,
  Star,
  Zap,
  Ban,
  Sparkles,
  Award,
  Gem,
  TrendingUp,
  Activity,
  Users,
  Building,
  Globe,
  MapPin,
  AtSign,
  Hash,
  Tag,
  Crown,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Bell,
  BellRing,
  CircleDot,
  CircleCheck,
  CircleX,
  LoaderCircle,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  Rocket,
  Flag,
  Target,
  BadgeCheck,
  UserCog,
  Briefcase,
  Wallet,
  Receipt as ReceiptIcon,
  File,
  FolderOpen,
  Grid,
  List,
  LayoutGrid,
  Table,
  PanelLeft,
  RotateCw,
  StopCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useToast } from '@/components/ui/toast-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import {
  usePurchaseOrder,
  usePurchaseOrderWorkflow,
  useIssuePurchaseOrder,
  useSendPurchaseOrderToSupplier,
  useCancelPurchaseOrder,
  useGetPurchaseOrderPdf,
  useCompletePurchaseOrder,
  useCheckPurchaseOrder,
  useEndorsePurchaseOrder,
  useApprovePurchaseOrder,
  useDownloadPurchaseOrderPdf,
} from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { PurchaseOrderStatus } from '@/types/purchaseOrder.types';
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { useUsers } from '../../../../../hooks/useUsers';

// ============================================
// CONSTANTS
// ============================================

const PO_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  draft: {
    label: 'Draft',
    color: 'text-gray-600 dark:text-gray-400',
    icon: FileText,
    bg: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  },
  pending_check: {
    label: 'Pending Check',
    color: 'text-amber-600 dark:text-amber-400',
    icon: UserCheck,
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
  },
  pending_endorsement: {
    label: 'Pending Endorsement',
    color: 'text-blue-600 dark:text-blue-400',
    icon: Signature,
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
  },
  pending_approval: {
    label: 'Pending Approval',
    color: 'text-purple-600 dark:text-purple-400',
    icon: ShieldCheck,
    bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
  },
  issued: {
    label: 'Issued',
    color: 'text-indigo-600 dark:text-indigo-400',
    icon: Send,
    bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
  },
  sent: {
    label: 'Sent to Supplier',
    color: 'text-indigo-600 dark:text-indigo-400',
    icon: Mail,
    bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'text-purple-600 dark:text-purple-400',
    icon: CheckCircle,
    bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
  },
  delivered: {
    label: 'Delivered',
    color: 'text-emerald-600 dark:text-emerald-400',
    icon: Truck,
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
  },
  partial: {
    label: 'Partial Delivery',
    color: 'text-amber-600 dark:text-amber-400',
    icon: Clock,
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
  },
  completed: {
    label: 'Completed',
    color: 'text-teal-600 dark:text-teal-400',
    icon: CheckCircle2,
    bg: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600 dark:text-red-400',
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-500 dark:text-gray-400',
    icon: FileCheck,
    bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
  },
};

const statusColorMap: Record<string, string> = {
  draft: 'gray',
  pending_check: 'amber',
  pending_endorsement: 'blue',
  pending_approval: 'purple',
  issued: 'indigo',
  sent: 'indigo',
  acknowledged: 'purple',
  delivered: 'emerald',
  partial: 'amber',
  completed: 'teal',
  cancelled: 'red',
  closed: 'slate',
};

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | Date | null): string => {
  if (!date) return '—';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '—';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'KES 0.00';
  return `KES ${Number(numAmount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

/**
 * Synchronous version - works with user objects that already have name properties
 * For IDs, it returns a placeholder that can be replaced by the hook version
 */
export const getUserName = (user: any): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'string') return user;
  if (typeof user === 'number') return `User ${user}`;
  if (typeof user === 'object') {
    if (user?.full_name) return user.full_name;
    if (user?.first_name || user?.last_name) {
      return [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown';
    }
    if (user?.name) return user.name;
    if (user?.id) return `User ${user.id}`;
  }
  return 'Unknown';
};

/**
 * React Hook version - fetches user by ID
 * Use this in React components when you have a user ID and need the full name
 */
export const useUserName = (user: any): { name: string; isLoading: boolean } => {
  const { useGetUser } = useUsers();

  // If user is null/undefined
  if (!user) return { name: 'Unknown', isLoading: false };

  // If user is already a string
  if (typeof user === 'string') return { name: user, isLoading: false };

  // If user is an object with name properties
  if (typeof user === 'object') {
    if (user?.full_name) return { name: user.full_name, isLoading: false };
    if (user?.first_name || user?.last_name) {
      return {
        name: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown',
        isLoading: false
      };
    }
    if (user?.name) return { name: user.name, isLoading: false };

    // If object has an id, fetch the user
    if (user?.id) {
      const { data, isLoading } = useGetUser(user.id);
      if (isLoading) return { name: 'Loading...', isLoading: true };
      if (data) {
        return { name: getUserName(data), isLoading: false };
      }
      return { name: `User ${user.id}`, isLoading: false };
    }
  }

  // If user is a number (ID)
  if (typeof user === 'number') {
    const { data, isLoading } = useGetUser(user);
    if (isLoading) return { name: 'Loading...', isLoading: true };
    if (data) {
      return { name: getUserName(data), isLoading: false };
    }
    return { name: `User ${user}`, isLoading: false };
  }

  return { name: 'Unknown', isLoading: false };
};

const getSupplierName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

// ============================================
// STATUS BADGE COMPONENT
// ============================================

interface StatusBadgeProps {
  status: PurchaseOrderStatus | string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
}

const StatusBadge = ({ status, size = 'default', className, showIcon = true }: StatusBadgeProps) => {
  const config = PO_STATUS_CONFIG[status] || PO_STATUS_CONFIG.draft;
  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    default: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4.5 py-2 gap-2.5',
  };

  return (
    <div className={cn(
      "inline-flex items-center font-medium rounded-full border",
      config.bg,
      config.color,
      sizeClasses[size],
      className
    )}>
      {showIcon && <Icon className={cn(
        "flex-shrink-0",
        size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
      )} />}
      {config.label}
    </div>
  );
};

// ============================================
// SIGNATURE CARD COMPONENT
// ============================================

interface SignatureCardProps {
  title: string;
  icon: React.ReactNode;
  user: string | null;
  date: string | null;
  isDone: boolean;
  isRequired: boolean;
  isCurrentAction: boolean;
  onAction?: () => void;
  actionLabel?: string;
  actionPending?: boolean;
  comment?: string;
  onCommentChange?: (value: string) => void;
}

const SignatureCard = ({
  title,
  icon,
  user,
  date,
  isDone,
  isRequired,
  isCurrentAction,
  onAction,
  actionLabel,
  actionPending,
  comment,
  onCommentChange,
}: SignatureCardProps) => {
  return (
    <Card className={cn(
      "border shadow-sm rounded-xl transition-all duration-300",
      isDone ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20" :
        isCurrentAction ? "border-amber-200 dark:border-amber-800 ring-2 ring-amber-200 dark:ring-amber-800 bg-amber-50/30 dark:bg-amber-950/20" :
          "border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-all duration-300",
            isDone ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" :
              isCurrentAction ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 animate-pulse" :
                "bg-gray-100 dark:bg-gray-800 text-gray-400"
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm text-gray-900 dark:text-white">{title}</p>
              {isDone ? (
                <UIBadge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[10px] border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Done
                </UIBadge>
              ) : isCurrentAction ? (
                <UIBadge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[10px] border-0 animate-pulse">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Awaiting Action
                </UIBadge>
              ) : isRequired ? (
                <UIBadge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full text-[10px] border-0">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </UIBadge>
              ) : (
                <UIBadge className="bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 rounded-full text-[10px] border-0">
                  Not Required
                </UIBadge>
              )}
            </div>
            {user && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                <span className="font-medium">By:</span> {user}
              </p>
            )}
            {date && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">At:</span> {formatDateTime(date)}
              </p>
            )}
            {!user && isRequired && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                <Clock className="h-3.5 w-3.5 inline mr-1" />
                Waiting for {title}
              </p>
            )}
            {isCurrentAction && onAction && (
              <div className="mt-3 space-y-2">
                {onCommentChange && (
                  <Textarea
                    placeholder={`Add comment for ${title.toLowerCase()}...`}
                    value={comment || ''}
                    onChange={(e) => onCommentChange(e.target.value)}
                    rows={2}
                    className="rounded-xl text-sm resize-none dark:bg-gray-800/50"
                  />
                )}
                <Button
                  onClick={onAction}
                  disabled={actionPending}
                  className={cn(
                    "rounded-xl text-white w-full transition-all duration-300 hover:scale-[1.02]",
                    title === 'Check' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" :
                      title === 'Endorse' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" :
                        title === 'Approve' ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20" :
                          "bg-gray-600 hover:bg-gray-700"
                  )}
                >
                  {actionPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {actionLabel || `Perform ${title}`}
                </Button>
              </div>
            )}
          </div>
          {isDone && (
            <div className="flex-shrink-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </motion.div>
            </div>
          )}
          {isCurrentAction && !isDone && (
            <div className="flex-shrink-0">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
              </motion.div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// WORKFLOW ALERT COMPONENT
// ============================================

interface WorkflowAlertProps {
  step: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
  action?: { label: string; onClick: () => void; pending?: boolean };
  details?: { label: string; value: string }[];
}

const WorkflowAlert = ({ step, label, color, icon, description, action, details }: WorkflowAlertProps) => {
  const colorClasses = {
    amber: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/50 text-amber-700 dark:text-amber-300',
    blue: 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/50 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/50 dark:border-purple-800/50 text-purple-700 dark:text-purple-300',
    emerald: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300',
    indigo: 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200/50 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300',
    teal: 'bg-teal-50/80 dark:bg-teal-950/30 border-teal-200/50 dark:border-teal-800/50 text-teal-700 dark:text-teal-300',
    gray: 'bg-gray-50/80 dark:bg-gray-800/30 border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300',
  };

  const iconColorClasses = {
    amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    teal: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400',
    gray: 'bg-gray-100 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400',
  };

  const pulseColors = {
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500',
    gray: 'bg-gray-500',
  };

  return (
    <Alert className={cn(
      "rounded-xl shadow-sm border transition-all duration-300",
      colorClasses[color as keyof typeof colorClasses] || colorClasses.gray
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg flex-shrink-0",
          iconColorClasses[color as keyof typeof iconColorClasses] || iconColorClasses.gray
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <AlertTitle className="flex items-center gap-2 flex-wrap">
            <span>{label}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-current/10 text-current text-[10px] font-medium">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", pulseColors[color as keyof typeof pulseColors] || 'bg-gray-500')} />
              {step === 'done' ? 'Complete' : 'In Progress'}
            </span>
          </AlertTitle>
          <AlertDescription className="mt-1">
            {description}
          </AlertDescription>
          {details && details.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {details.map((detail, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs bg-white/50 dark:bg-gray-800/50 px-2.5 py-1 rounded-full">
                  <span className="text-muted-foreground">{detail.label}:</span>
                  <span className="font-medium text-foreground">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
          {action && (
            <Button
              onClick={action.onClick}
              disabled={action.pending}
              className={cn(
                "mt-3 rounded-xl text-white shadow-lg transition-all duration-300 hover:scale-[1.02]",
                color === 'amber' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" :
                  color === 'blue' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" :
                    color === 'purple' ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20" :
                      color === 'emerald' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" :
                        color === 'indigo' ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20" :
                          color === 'teal' ? "bg-teal-600 hover:bg-teal-700 shadow-teal-600/20" :
                            "bg-gray-600 hover:bg-gray-700 shadow-gray-600/20"
              )}
            >
              {action.pending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

// ============================================
// PDF DOWNLOAD PROGRESS DIALOG
// ============================================

interface PdfDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDownloading: boolean;
  downloadProgress: number;
  retryAttempt: number;
  maxRetries: number;
  onCancel: () => void;
  onRetry: () => void;
  errorMessage?: string | null;
  poNumber?: string;
  statusMessage?: string;
}

const PdfDownloadDialog = ({
  open,
  onOpenChange,
  isDownloading,
  downloadProgress,
  retryAttempt,
  maxRetries,
  onCancel,
  onRetry,
  errorMessage,
  poNumber,
  statusMessage = 'Initializing...',
}: PdfDownloadDialogProps) => {
  const isError = !!errorMessage;
  const isComplete = downloadProgress >= 100 && !isDownloading && !isError;
  const clampedProgress = Math.min(Math.max(downloadProgress, 0), 100);

  const getStatusMessage = () => {
    if (statusMessage && statusMessage !== 'Initializing...') {
      return statusMessage;
    }
    if (clampedProgress < 10) return 'Starting PDF generation...';
    if (clampedProgress < 25) return 'Loading purchase order data...';
    if (clampedProgress < 40) return 'Rendering header and company info...';
    if (clampedProgress < 55) return 'Processing items and details...';
    if (clampedProgress < 70) return 'Generating tables and totals...';
    if (clampedProgress < 85) return 'Adding approvals and signatures...';
    if (clampedProgress < 100) return 'Finalizing PDF document...';
    return 'PDF ready!';
  };

  const getStatusIcon = () => {
    if (clampedProgress < 25) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (clampedProgress < 55) {
      return <FileText className="h-4 w-4 animate-pulse text-blue-500" />;
    }
    if (clampedProgress < 85) {
      return <Package className="h-4 w-4 animate-pulse text-purple-500" />;
    }
    if (clampedProgress < 100) {
      return <CheckCircle className="h-4 w-4 animate-pulse text-emerald-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            ) : isError ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Download className="h-5 w-5 text-emerald-600" />
            )}
            {isComplete ? 'PDF Downloaded!' : isError ? 'Download Failed' : 'Generating PDF'}
          </DialogTitle>
          <DialogDescription>
            {isComplete ? (
              `"${poNumber || 'Purchase Order'}" has been downloaded successfully.`
            ) : isError ? (
              errorMessage || 'There was an error generating the PDF. Please try again.'
            ) : (
              `Please wait while we generate your purchase order PDF.`
            )}
            {retryAttempt > 0 && !isComplete && !isError && (
              <span className="block mt-1 text-amber-600">
                Retry attempt {retryAttempt} of {maxRetries}...
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {!isComplete && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(clampedProgress)}%</span>
              </div>
              <div className="relative">
                <Progress
                  value={clampedProgress}
                  className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
                />
                <div
                  className="absolute inset-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${clampedProgress}%` }}
                />
              </div>
            </div>
          )}

          {!isComplete && !isError && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {getStatusIcon()}
                {getStatusMessage()}
              </p>
              <div className="flex items-center gap-1 pt-1">
                {[0, 25, 50, 75].map((step, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-1 h-0.5 rounded-full transition-all duration-700",
                      clampedProgress >= step + 5
                        ? "bg-emerald-500"
                        : clampedProgress >= step - 5
                          ? "bg-blue-400 animate-pulse"
                          : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {isComplete && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                PDF ready! Download started automatically.
              </p>
            </div>
          )}

          {isError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {errorMessage || 'Failed to generate PDF. Please try again.'}
              </p>
              {retryAttempt >= maxRetries && (
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum retry attempts ({maxRetries}) reached. Please check your network connection and try again.
                </p>
              )}
            </div>
          )}

          {isDownloading && clampedProgress > 0 && clampedProgress < 100 && (
            <div className="flex items-center justify-center gap-3">
              <div className="flex gap-1.5">
                {[20, 40, 60, 80].map((threshold, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-500",
                      clampedProgress > threshold ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground animate-pulse">
                {clampedProgress < 30 ? 'Connecting...' :
                  clampedProgress < 60 ? 'Generating...' :
                    clampedProgress < 90 ? 'Processing...' :
                      'Finalizing...'}
              </span>
            </div>
          )}

          {isDownloading && clampedProgress > 0 && clampedProgress < 100 && (
            <p className="text-xs text-muted-foreground text-center">
              {clampedProgress < 50
                ? '⏳ This may take a moment depending on the PDF size'
                : '⏳ Almost there! Finalizing your document...'}
            </p>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {isComplete ? (
            <Button
              variant="default"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Close
            </Button>
          ) : isError ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                Close
              </Button>
              <Button
                variant="default"
                onClick={onRetry}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                disabled={isDownloading}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Retry Download
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                className="rounded-xl"
                disabled={isComplete}
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="default"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                disabled
              >
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {clampedProgress < 30 ? 'Starting...' :
                  clampedProgress < 60 ? 'Generating...' :
                    clampedProgress < 90 ? 'Processing...' :
                      'Finalizing...'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// LOADING SKELETON
// ============================================

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-48 rounded-xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  </div>
);

// ============================================
// MAIN PAGE
// ============================================

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { success, error: toastError } = useToast();

  // State - All useState hooks first
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [checkComment, setCheckComment] = useState('');
  const [endorseComment, setEndorseComment] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // All hooks called unconditionally at the top level
  const { data: po, isLoading, refetch } = usePurchaseOrder(id);
  const { data: workflow, isLoading: workflowLoading, refetch: refetchWorkflow } = usePurchaseOrderWorkflow(id);
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData } = useAllSuppliers();

  // Workflow Mutations
  const checkMutation = useCheckPurchaseOrder();
  const endorseMutation = useEndorsePurchaseOrder();
  const approveMutation = useApprovePurchaseOrder();
  const issueMutation = useIssuePurchaseOrder();
  const sendMutation = useSendPurchaseOrderToSupplier();
  const cancelMutation = useCancelPurchaseOrder();
  const completeMutation = useCompletePurchaseOrder();

  // PDF Download Hook with Retry Logic
  const {
    download: downloadPdf,
    cancel: cancelPdfDownload,
    isDownloading,
    downloadProgress,
    retryAttempt,
    maxRetries,
    errorMessage: pdfErrorMessage,
  } = useDownloadPurchaseOrderPdf();

  // Supplier info - useMemo is fine here
  const supplier = useMemo(() => {
    if (!po?.supplier_id || !Array.isArray(suppliersData)) return null;
    return suppliersData.find((s: any) => s.id === po.supplier_id) || po.supplier;
  }, [po, suppliersData]);

  const supplierName = getSupplierName(supplier || po?.supplier);

  // Calculate totals - with proper null checks
  const totals = useMemo(() => {
    if (!po?.items || !Array.isArray(po.items) || po.items.length === 0) {
      return { subtotal: 0, tax: 0, total: 0, discount: 0 };
    }
    const subtotal = po.items.reduce((sum: number, item: any) => sum + (parseFloat(item.total_price) || 0), 0);
    const tax = po.items.reduce((sum: number, item: any) => sum + (parseFloat(item.tax_amount) || 0), 0);
    const discount = po.items.reduce((sum: number, item: any) => sum + (parseFloat(item.discount_amount) || 0), 0);
    const total = subtotal + tax - discount;
    return { subtotal, tax, total, discount };
  }, [po]);

  // ============================================
  // STATUS CHECKS
  // ============================================

  const hasAllSignatures =
    workflow?.checked_by_user &&
    workflow?.endorsed_by_user &&
    workflow?.approved_by_user;

  const canIssue = po?.status === 'draft' && hasAllSignatures;
  const canSend = po?.status === 'issued';
  const canComplete = po?.status === 'delivered';
  const canCancel =
    po?.status !== 'completed' &&
    po?.status !== 'cancelled' &&
    po?.status !== 'closed';
  const canDownload =
    po?.status !== 'draft' || hasAllSignatures;

  const signatureCount = (workflow?.checked_by_user ? 1 : 0) +
    (workflow?.endorsed_by_user ? 1 : 0) +
    (workflow?.approved_by_user ? 1 : 0);
  const workflowProgress = Math.round(signatureCount / 3 * 100);

  const missingSignatures = [];
  if (!workflow?.checked_by_user) missingSignatures.push('Check (HOD)');
  if (!workflow?.endorsed_by_user) missingSignatures.push('Endorse (Accountant)');
  if (!workflow?.approved_by_user) missingSignatures.push('Approve (Director)');

  const getWorkflowStep = () => {
    const status = po?.status || 'draft';
    if (status === 'draft' && !workflow?.checked_by_user) return { step: 'check', label: 'Awaiting HOD Check', color: 'amber', icon: <UserCheck className="h-5 w-5" /> };
    if (status === 'draft' && workflow?.checked_by_user && !workflow?.endorsed_by_user) return { step: 'endorse', label: 'Awaiting Accountant Endorsement', color: 'blue', icon: <Signature className="h-5 w-5" /> };
    if (status === 'draft' && workflow?.checked_by_user && workflow?.endorsed_by_user && !workflow?.approved_by_user) return { step: 'approve', label: 'Awaiting Director Approval', color: 'purple', icon: <ShieldCheck className="h-5 w-5" /> };
    if (status === 'draft' && hasAllSignatures) return { step: 'ready', label: 'Ready to Issue', color: 'emerald', icon: <Send className="h-5 w-5" /> };
    if (status === 'issued') return { step: 'send', label: 'Ready to Send to Supplier', color: 'indigo', icon: <Mail className="h-5 w-5" /> };
    if (status === 'sent' || status === 'acknowledged') return { step: 'deliver', label: 'Awaiting Delivery', color: 'emerald', icon: <Truck className="h-5 w-5" /> };
    if (status === 'delivered') return { step: 'complete', label: 'Ready to Complete', color: 'teal', icon: <CheckCircle2 className="h-5 w-5" /> };
    if (status === 'completed') return { step: 'done', label: 'Completed ✓', color: 'emerald', icon: <CheckCircle className="h-5 w-5" /> };
    if (status === 'cancelled') return { step: 'cancelled', label: 'Cancelled', color: 'red', icon: <XCircle className="h-5 w-5" /> };
    if (status === 'closed') return { step: 'closed', label: 'Closed', color: 'gray', icon: <FileCheck className="h-5 w-5" /> };
    return { step: 'unknown', label: 'Unknown', color: 'gray', icon: <Info className="h-5 w-5" /> };
  };

  const workflowStep = getWorkflowStep();
  const isOverdue = po?.is_overdue || false;
  const progress = po?.delivery_progress || 0;
  const statusColor = statusColorMap[po?.status || 'draft'] || 'gray';
  const statusLabel = PO_STATUS_CONFIG[po?.status || 'draft']?.label || po?.status || 'Unknown';

  const itemsCount = po?.items?.length || 0;

  const statsItems: StatCardItem[] = useMemo(() => {
    if (!po) return [];
    const items: StatCardItem[] = [
      {
        label: "Total Amount",
        value: totals.total,
        icon: DollarSign,
        isCurrency: true,
        tagLabel: "TOTAL",
        tagColor: "emerald" as const,
        subtitle: po.currency || 'KES',
      },
      {
        label: "Items",
        value: itemsCount,
        icon: Package,
        tagLabel: "ITEMS",
        tagColor: "purple" as const,
        subtitle: "Total items",
      },
      {
        label: "Delivery Progress",
        value: `${progress}%`,
        icon: Truck,
        tagLabel: "PROGRESS",
        tagColor: progress >= 100 ? "emerald" as const : progress >= 50 ? "amber" as const : "blue" as const,
        subtitle: progress >= 100 ? 'Fully delivered' : 'In progress',
      },
      {
        label: "Status",
        value: statusLabel,
        icon: FileCheck,
        tagLabel: "STATUS",
        tagColor: statusColor as any,
        subtitle: `Type: ${po.type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'}`,
      },
    ];

    if (po.status === 'draft') {
      items.push({
        label: "Workflow Progress",
        value: `${workflowProgress}%`,
        icon: UserCheck,
        tagLabel: "WORKFLOW",
        tagColor: workflowProgress === 100 ? "emerald" as const : "amber" as const,
        subtitle: `${signatureCount}/3 signatures`,
      });
    }

    return items;
  }, [po, totals, progress, statusLabel, statusColor, workflowProgress, signatureCount, itemsCount]);

  // Handlers
  const handleBack = () => router.push('/procurement/purchase-orders/manage-orders');
  const handleRefresh = () => {
    refetch();
    refetchWorkflow();
  };

  // Workflow Actions
  const handleCheck = () => {
    if (po) {
      checkMutation.mutate(
        { id: po.id, comment: checkComment || undefined },
        {
          onSuccess: () => {
            success(`Purchase Order ${po.po_number} checked successfully`);
            setCheckComment('');
            handleRefresh();
          }
        }
      );
    }
  };

  const handleEndorse = () => {
    if (po) {
      endorseMutation.mutate(
        { id: po.id, comment: endorseComment || undefined },
        {
          onSuccess: () => {
            success(`Purchase Order ${po.po_number} endorsed successfully`);
            setEndorseComment('');
            handleRefresh();
          }
        }
      );
    }
  };

  const handleApprove = () => {
    if (po) {
      approveMutation.mutate(
        { id: po.id, comment: approveComment || undefined },
        {
          onSuccess: () => {
            success(`Purchase Order ${po.po_number} approved successfully`);
            setApproveComment('');
            handleRefresh();
          }
        }
      );
    }
  };

  // Status Management Actions
  const handleIssue = () => setShowIssueDialog(true);
  const handleConfirmIssue = () => {
    if (po) {
      issueMutation.mutate(po.id, {
        onSuccess: () => {
          success(`Purchase Order ${po.po_number} issued successfully`);
          setShowIssueDialog(false);
          handleRefresh();
        }
      });
    }
  };

  const handleSend = () => setShowSendDialog(true);
  const handleConfirmSend = () => {
    if (po) {
      sendMutation.mutate(po.id, {
        onSuccess: () => {
          success(`Purchase Order ${po.po_number} sent to supplier`);
          setShowSendDialog(false);
          handleRefresh();
        }
      });
    }
  };

  const handleComplete = () => setShowCompleteDialog(true);
  const handleConfirmComplete = () => {
    if (po) {
      completeMutation.mutate(po.id, {
        onSuccess: () => {
          success(`Purchase Order ${po.po_number} completed`);
          setShowCompleteDialog(false);
          handleRefresh();
        }
      });
    }
  };

  const handleCancel = () => setShowCancelDialog(true);
  const handleConfirmCancel = () => {
    if (po && cancelReason.trim()) {
      cancelMutation.mutate({ id: po.id, reason: cancelReason }, {
        onSuccess: () => {
          success(`Purchase Order ${po.po_number} cancelled`);
          setShowCancelDialog(false);
          setCancelReason('');
          handleRefresh();
        }
      });
    }
  };

  // PDF Download Handler with Retry Logic
  const handleDownload = useCallback(async () => {
    if (!po) return;

    setPdfError(null);
    setShowPdfDialog(true);

    try {
      const success = await downloadPdf(po.id);
      if (!success && !isDownloading) {
        setPdfError(pdfErrorMessage || 'Failed to download PDF');
      }
    } catch (err: any) {
      setPdfError(err?.message || 'An unexpected error occurred');
    }
  }, [po, downloadPdf, pdfErrorMessage, isDownloading]);

  const handlePdfDialogClose = useCallback((open: boolean) => {
    if (!open && isDownloading) {
      cancelPdfDownload();
    }
    if (!open) {
      setPdfError(null);
    }
    setShowPdfDialog(open);
  }, [isDownloading, cancelPdfDownload]);

  const handleRetryDownload = useCallback(() => {
    if (!po) return;
    setPdfError(null);
    downloadPdf(po.id);
  }, [po, downloadPdf]);

  const handlePrint = () => window.print();

  // Get current action for buttons
  const getCurrentAction = () => {
    if (workflow?.can_check) return { type: 'check', label: 'Check Order', comment: checkComment, setComment: setCheckComment, action: handleCheck, pending: checkMutation.isPending };
    if (workflow?.can_endorse) return { type: 'endorse', label: 'Endorse Order', comment: endorseComment, setComment: setEndorseComment, action: handleEndorse, pending: endorseMutation.isPending };
    if (workflow?.can_approve) return { type: 'approve', label: 'Approve Order', comment: approveComment, setComment: setApproveComment, action: handleApprove, pending: approveMutation.isPending };
    return null;
  };

  const currentAction = getCurrentAction();

  // ✅ FIX: Use getUserName synchronously (not useUserName hook)
  // Get user names from the po and workflow data directly
  const generatedByName = getUserName(po?.generated_by);
  const checkedByUserName = workflow?.checked_by_user || getUserName(po?.checked_by);
  const endorsedByUserName = workflow?.endorsed_by_user || getUserName(po?.endorsed_by);
  const approvedByUserName = workflow?.approved_by_user || getUserName(po?.approved_by);

  // ✅ FIXED: timelineItems using getUserName (synchronous)
  const timelineItems = [
    {
      label: 'Generated',
      date: po?.created_at,
      status: 'completed' as const,
      icon: <FileText className="h-4 w-4" />,
      description: `by ${generatedByName}`,
      color: 'emerald' as const,
    },
    {
      label: 'Checked',
      date: workflow?.checked_at || po?.checked_at,
      status: (workflow?.checked_at || po?.checked_at) ? 'completed' as const :
        (workflow?.can_check || po?.status === 'draft') ? 'active' as const : 'pending' as const,
      icon: <UserCheck className="h-4 w-4" />,
      description: (workflow?.checked_at || po?.checked_at) ? `by ${checkedByUserName}` :
        (workflow?.can_check || po?.status === 'draft') ? 'Awaiting HOD check' : 'Not checked',
      color: (workflow?.checked_at || po?.checked_at) ? 'emerald' as const : 'amber' as const,
    },
    {
      label: 'Endorsed',
      date: workflow?.endorsed_at || po?.endorsed_at,
      status: (workflow?.endorsed_at || po?.endorsed_at) ? 'completed' as const :
        (workflow?.can_endorse || po?.status === 'draft') ? 'active' as const : 'pending' as const,
      icon: <Signature className="h-4 w-4" />,
      description: (workflow?.endorsed_at || po?.endorsed_at) ? `by ${endorsedByUserName}` :
        (workflow?.can_endorse || po?.status === 'draft') ? 'Awaiting Accountant endorsement' : 'Not endorsed',
      color: (workflow?.endorsed_at || po?.endorsed_at) ? 'emerald' as const : 'blue' as const,
    },
    {
      label: 'Approved',
      date: workflow?.approved_at || po?.approved_at,
      status: (workflow?.approved_at || po?.approved_at) ? 'completed' as const :
        (workflow?.can_approve || po?.status === 'draft') ? 'active' as const : 'pending' as const,
      icon: <ShieldCheck className="h-4 w-4" />,
      description: (workflow?.approved_at || po?.approved_at) ? `by ${approvedByUserName}` :
        (workflow?.can_approve || po?.status === 'draft') ? 'Awaiting Director approval' : 'Not approved',
      color: (workflow?.approved_at || po?.approved_at) ? 'emerald' as const : 'purple' as const,
    },
    {
      label: 'Issued',
      date: po?.issued_at,
      status: (po?.issued_at || po?.status === 'issued' || po?.status === 'sent' || po?.status === 'acknowledged' || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'completed' as const :
        (po?.status === 'draft' && hasAllSignatures) ? 'active' as const : 'pending' as const,
      icon: <Send className="h-4 w-4" />,
      description: po?.issued_at ? 'Order issued' :
        (po?.status === 'issued' || po?.status === 'sent' || po?.status === 'acknowledged' || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'Issued' :
          (po?.status === 'draft' && hasAllSignatures) ? 'Ready to issue' : 'Pending',
      color: (po?.issued_at || po?.status === 'issued' || po?.status === 'sent' || po?.status === 'acknowledged' || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'emerald' as const : 'indigo' as const,
    },
    {
      label: 'Sent to Supplier',
      date: po?.sent_at,
      status: (po?.sent_at || po?.status === 'sent' || po?.status === 'acknowledged' || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'completed' as const :
        (po?.status === 'issued') ? 'active' as const : 'pending' as const,
      icon: <Mail className="h-4 w-4" />,
      description: po?.sent_at ? `to ${supplierName}` :
        (po?.status === 'sent' || po?.status === 'acknowledged' || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'Sent to supplier' :
          (po?.status === 'issued') ? 'Awaiting send' : 'Pending',
      color: (po?.sent_at || po?.status === 'sent' || po?.status === 'acknowledged' || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'emerald' as const : 'indigo' as const,
    },
    {
      label: 'Acknowledged',
      date: po?.acknowledged_at,
      status: (po?.acknowledged_at || po?.status === 'acknowledged' || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'completed' as const :
        (po?.status === 'sent') ? 'active' as const : 'pending' as const,
      icon: <CheckCircle className="h-4 w-4" />,
      description: po?.acknowledged_at ? 'Supplier acknowledged' :
        (po?.status === 'acknowledged' || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'Acknowledged' :
          (po?.status === 'sent') ? 'Awaiting acknowledgment' : 'Pending',
      color: (po?.acknowledged_at || po?.status === 'acknowledged' || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'emerald' as const : 'purple' as const,
    },
    {
      label: 'Delivered',
      date: po?.actual_delivery_date,
      status: (po?.actual_delivery_date || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'completed' as const :
        (po?.status === 'acknowledged' || po?.status === 'sent') ? 'active' as const : 'pending' as const,
      icon: <Truck className="h-4 w-4" />,
      description: po?.actual_delivery_date ? 'Goods received' :
        (po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'Delivered' :
          (po?.status === 'acknowledged' || po?.status === 'sent') ? 'Awaiting delivery' : 'Pending',
      color: (po?.actual_delivery_date || po?.status === 'delivered' || po?.status === 'completed' || po?.status === 'closed') ? 'emerald' as const : 'amber' as const,
    },
    {
      label: 'Completed',
      date: po?.completed_at,
      status: (po?.completed_at || po?.status === 'completed' || po?.status === 'closed') ? 'completed' as const :
        (po?.status === 'delivered') ? 'active' as const : 'pending' as const,
      icon: <CheckCircle2 className="h-4 w-4" />,
      description: po?.completed_at ? 'Order fully completed' :
        (po?.status === 'completed' || po?.status === 'closed') ? 'Completed' :
          (po?.status === 'delivered') ? 'Awaiting completion' : 'Pending',
      color: (po?.completed_at || po?.status === 'completed' || po?.status === 'closed') ? 'emerald' as const : 'teal' as const,
    },
  ];

  const getWorkflowAlertDetails = () => {
    const step = workflowStep;
    const details = [];

    if (step.step === 'check') {
      details.push({ label: 'Step', value: '1 of 3' });
      details.push({ label: 'Next', value: 'Accountant Endorsement' });
    } else if (step.step === 'endorse') {
      details.push({ label: 'Step', value: '2 of 3' });
      details.push({ label: 'Previous', value: '✓ HOD Check' });
      details.push({ label: 'Next', value: 'Director Approval' });
    } else if (step.step === 'approve') {
      details.push({ label: 'Step', value: '3 of 3' });
      details.push({ label: 'Previous', value: '✓ HOD Check' });
      details.push({ label: 'Previous', value: '✓ Accountant Endorse' });
    } else if (step.step === 'ready') {
      details.push({ label: 'Status', value: 'All signatures complete' });
      details.push({ label: 'Action', value: 'Issue to supplier' });
    } else if (step.step === 'send') {
      details.push({ label: 'Status', value: 'Issued' });
      details.push({ label: 'Action', value: 'Send to supplier' });
    } else if (step.step === 'deliver') {
      details.push({ label: 'Status', value: 'Sent to supplier' });
      details.push({ label: 'Action', value: 'Awaiting delivery' });
    } else if (step.step === 'complete') {
      details.push({ label: 'Status', value: 'Delivered' });
      details.push({ label: 'Action', value: 'Complete order' });
    }

    return details;
  };

  const workflowAlertDetails = getWorkflowAlertDetails();

  const getWorkflowAlertAction = () => {
    if (workflow?.can_check) {
      return { label: 'Check Order', onClick: handleCheck, pending: checkMutation.isPending };
    }
    if (workflow?.can_endorse) {
      return { label: 'Endorse Order', onClick: handleEndorse, pending: endorseMutation.isPending };
    }
    if (workflow?.can_approve) {
      return { label: 'Approve Order', onClick: handleApprove, pending: approveMutation.isPending };
    }
    if (canIssue) {
      return { label: 'Issue PO', onClick: handleIssue, pending: issueMutation.isPending };
    }
    if (canSend) {
      return { label: 'Send to Supplier', onClick: handleSend, pending: sendMutation.isPending };
    }
    if (canComplete) {
      return { label: 'Complete Order', onClick: handleComplete, pending: completeMutation.isPending };
    }
    return null;
  };

  const workflowAlertAction = getWorkflowAlertAction();

  const supplierEmail = supplier?.company_email || supplier?.email || po?.supplier?.email || 'No email';
  const supplierPhone = supplier?.company_phone || supplier?.phone || po?.supplier?.phone || 'N/A';
  const supplierAddress = supplier?.company_address || 'N/A';

  // ============================================
  // RENDER
  // ============================================

  if (isLoading) {
    return (
      <PageTemplate
        title="Purchase Order Details"
        description="Loading..."
        icon={<FileText className="h-5 w-5 text-emerald-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Details' },
        ]}
      >
        <LoadingSkeleton />
      </PageTemplate>
    );
  }

  if (!po) {
    return (
      <PageTemplate
        title="Purchase Order Details"
        description="Not found"
        icon={<FileText className="h-5 w-5 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Details' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Purchase Order Not Found</h3>
            <p className="text-muted-foreground">The purchase order you're looking for doesn't exist.</p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={po.po_number}
      description={`${po.type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'} - ${po.title || 'No title'}`}
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
        { label: po.po_number },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {currentAction && (
            <Button
              onClick={currentAction.action}
              disabled={currentAction.pending}
              className={cn(
                "gap-1.5 h-9 rounded-xl text-white shadow-lg transition-all duration-300 hover:scale-[1.02]",
                currentAction.type === 'check' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" :
                  currentAction.type === 'endorse' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" :
                    "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
              )}
            >
              {currentAction.pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {currentAction.type === 'check' && <UserCheck className="h-3.5 w-3.5" />}
              {currentAction.type === 'endorse' && <Signature className="h-3.5 w-3.5" />}
              {currentAction.type === 'approve' && <ShieldCheck className="h-3.5 w-3.5" />}
              {currentAction.label}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
          {canDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 text-white"
              >
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl p-1">
              <DropdownMenuLabel className="text-sm font-semibold px-3 py-2 text-gray-700 dark:text-gray-200">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
              {canIssue && (
                <DropdownMenuItem onClick={handleIssue} className="text-blue-600 dark:text-blue-400 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                  <Send className="h-4 w-4 mr-3" />Issue PO
                </DropdownMenuItem>
              )}
              {canSend && (
                <DropdownMenuItem onClick={handleSend} className="text-indigo-600 dark:text-indigo-400 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                  <Mail className="h-4 w-4 mr-3" />Send to Supplier
                </DropdownMenuItem>
              )}
              {canComplete && (
                <DropdownMenuItem onClick={handleComplete} className="text-teal-600 dark:text-teal-400 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                  <CheckCircle className="h-4 w-4 mr-3" />Complete Order
                </DropdownMenuItem>
              )}
              {canCancel && (
                <>
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <DropdownMenuItem onClick={handleCancel} className="text-red-600 dark:text-red-400 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                    <XCircle className="h-4 w-4 mr-3" />Cancel Order
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {/* ============================================ */}
      {/* PDF DOWNLOAD PROGRESS DIALOG */}
      {/* ============================================ */}
      <PdfDownloadDialog
        open={showPdfDialog}
        onOpenChange={handlePdfDialogClose}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        retryAttempt={retryAttempt}
        maxRetries={maxRetries}
        onCancel={cancelPdfDownload}
        onRetry={handleRetryDownload}
        errorMessage={pdfErrorMessage || pdfError}
        poNumber={po?.po_number}
      />

      <div className="space-y-6 print:space-y-4">
        {/* Stats Cards */}
        <StatsCards
          stats={statsItems}
          isLoading={isLoading}
          columns={po.status === 'draft' ? 5 : 4}
          variant="default"
          formatCompact={true}
        />

        {/* Draft - No Signatures Yet */}
        {po?.status === 'draft' && !workflow?.checked_by_user && !workflow?.endorsed_by_user && !workflow?.approved_by_user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/95 via-blue-100/50 to-white/80 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-gray-950/80 shadow-xl shadow-blue-500/10 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 animate-gradient-x" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />

            <div className="relative p-5 flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <span>Workflow Started</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-200/60 dark:bg-blue-800/40 text-[10px] font-medium text-blue-700 dark:text-blue-300 border border-blue-300/30 dark:border-blue-700/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      Draft
                    </span>
                  </h4>
                </div>

                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  This purchase order must go through the approval workflow before it can be issued to the supplier.
                </p>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100/70 dark:bg-blue-900/40 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Step 1</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">HOD Check</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-blue-400/50" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-700/30">
                      <Circle className="h-2 w-2 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Step 2</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Accountant</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-gray-400/30" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-700/30">
                      <Circle className="h-2 w-2 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Step 3</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Director</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-gray-400/30" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-700/30">
                      <Circle className="h-2 w-2 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Issue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Awaiting Check */}
        {po?.status === 'draft' && !workflow?.checked_by_user && workflow?.can_check && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border-2 border-amber-300/50 dark:border-amber-700/50 bg-gradient-to-br from-amber-50/95 via-amber-100/50 to-white/80 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-gray-950/80 shadow-xl shadow-amber-500/20 backdrop-blur-sm"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full animate-shimmer" />
            </div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl animate-pulse-slow" />

            <div className="relative p-5 flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 flex items-center justify-center"
                  >
                    <UserCheck className="h-6 w-6 text-white" />
                  </motion.div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white dark:border-gray-900 animate-ping" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <span> Step 1: Awaiting HOD Check</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-800/40 text-[10px] font-medium text-amber-700 dark:text-amber-300 border border-amber-300/30 dark:border-amber-700/30 animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      In Progress
                    </span>
                  </h4>
                </div>

                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  The Head of Department needs to review and check this purchase order before it can proceed.
                </p>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Generated</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-amber-400/50" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/70 dark:bg-amber-900/40 border-2 border-amber-300/50 dark:border-amber-700/50">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Current</span>
                      <span className="text-xs text-amber-600 dark:text-amber-400">HOD Check</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-gray-400/30" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-700/30">
                      <Circle className="h-2 w-2 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Accountant</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-gray-400/30" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-700/30">
                      <Circle className="h-2 w-2 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Director</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  onClick={handleCheck}
                  disabled={checkMutation.isPending}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02] group"
                >
                  {checkMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  )}
                  Check Order
                  <Sparkles className="h-3.5 w-3.5 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Awaiting Endorsement */}
        {po?.status === 'draft' && workflow?.checked_by_user && !workflow?.endorsed_by_user && workflow?.can_endorse && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border-2 border-blue-300/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/95 via-blue-100/50 to-white/80 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-gray-950/80 shadow-xl shadow-blue-500/20 backdrop-blur-sm"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-shimmer" />
            </div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/15 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl animate-pulse-slow" />

            <div className="relative p-5 flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 flex items-center justify-center"
                  >
                    <Signature className="h-6 w-6 text-white" />
                  </motion.div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white dark:border-gray-900 animate-ping" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <span>Step 2: Awaiting Accountant Endorsement</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-200/60 dark:bg-blue-800/40 text-[10px] font-medium text-blue-700 dark:text-blue-300 border border-blue-300/30 dark:border-blue-700/30 animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      In Progress
                    </span>
                  </h4>
                </div>

                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  The Accountant needs to endorse this purchase order to confirm fund availability.
                </p>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">✓ HOD Checked</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-blue-400/50" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100/70 dark:bg-blue-900/40 border-2 border-blue-300/50 dark:border-blue-700/50">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Current</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">Accountant</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-gray-400/30" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-700/30">
                      <Circle className="h-2 w-2 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Director</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  onClick={handleEndorse}
                  disabled={endorseMutation.isPending}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] group"
                >
                  {endorseMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Signature className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  )}
                  Endorse Order
                  <Sparkles className="h-3.5 w-3.5 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Awaiting Approval */}
        {po?.status === 'draft' && workflow?.checked_by_user && workflow?.endorsed_by_user && !workflow?.approved_by_user && workflow?.can_approve && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border-2 border-purple-300/50 dark:border-purple-700/50 bg-gradient-to-br from-purple-50/95 via-purple-100/50 to-white/80 dark:from-purple-950/40 dark:via-purple-900/30 dark:to-gray-950/80 shadow-xl shadow-purple-500/20 backdrop-blur-sm"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full animate-shimmer" />
            </div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/15 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl animate-pulse-slow" />

            <div className="relative p-5 flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 shadow-lg shadow-purple-500/30 flex items-center justify-center"
                  >
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </motion.div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full border-2 border-white dark:border-gray-900 animate-ping" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                    <span> Step 3: Awaiting Director Approval</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-200/60 dark:bg-purple-800/40 text-[10px] font-medium text-purple-700 dark:text-purple-300 border border-purple-300/30 dark:border-purple-700/30 animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      In Progress
                    </span>
                  </h4>
                </div>

                <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
                  The Director or Finance Admin needs to provide final approval for this purchase order.
                </p>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">✓ HOD</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">✓ Accountant</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-purple-400/50" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100/70 dark:bg-purple-900/40 border-2 border-purple-300/50 dark:border-purple-700/50">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Current</span>
                      <span className="text-xs text-purple-600 dark:text-purple-400">Director</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] group"
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  )}
                  Approve Order
                  <Sparkles className="h-3.5 w-3.5 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Ready to Issue */}
        {po?.status === 'draft' && hasAllSignatures && canIssue && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border-2 border-emerald-300/50 dark:border-emerald-700/50 bg-gradient-to-br from-emerald-50/95 via-emerald-100/50 to-white/80 dark:from-emerald-950/40 dark:via-emerald-900/30 dark:to-gray-950/80 shadow-xl shadow-emerald-500/20 backdrop-blur-sm"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full animate-shimmer" />
            </div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl animate-pulse-slow" />

            <div className="relative p-5 flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center"
                  >
                    <CheckCircle className="h-6 w-6 text-white" />
                  </motion.div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <span> All Signatures Complete - Ready to Issue</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-800/40 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-300/30 dark:border-emerald-700/30">
                      <CheckCircle className="h-3 w-3" />
                      Ready
                    </span>
                  </h4>
                </div>

                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                  This purchase order has been fully approved by all parties. It is now ready to be issued to the supplier.
                </p>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">✓ HOD</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">✓ Accountant</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">✓ Director</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-emerald-400/50" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-200/70 dark:bg-emerald-800/40 border-2 border-emerald-300/50 dark:border-emerald-700/50">
                      <Send className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Next</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">Issue PO</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  onClick={handleIssue}
                  disabled={issueMutation.isPending}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] group"
                >
                  {issueMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  )}
                  Issue PO
                  <Sparkles className="h-3.5 w-3.5 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Missing Signatures Warning */}
        {po?.status === 'draft' && !hasAllSignatures && missingSignatures.length > 0 && !workflow?.can_check && !workflow?.can_endorse && !workflow?.can_approve && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border border-amber-200/50 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/95 via-amber-100/50 to-white/80 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-gray-950/80 shadow-xl shadow-amber-500/10 backdrop-blur-sm"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl" />

            <div className="relative p-5 flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Waiting for Approvals
                  </h4>
                </div>

                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  This purchase order is waiting for the following approvals before it can be issued:
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {missingSignatures.map((sig, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/70 dark:bg-amber-900/40 border border-amber-200/50 dark:border-amber-800/50"
                    >
                      <Circle className="h-2.5 w-2.5 text-amber-500" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">{sig}</span>
                    </motion.div>
                  ))}
                </div>

                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  The Issue button will become available once all approvals are complete.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Already Issued */}
        {po?.status === 'issued' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border-2 border-indigo-300/50 dark:border-indigo-700/50 bg-gradient-to-br from-indigo-50/95 via-indigo-100/50 to-white/80 dark:from-indigo-950/40 dark:via-indigo-900/30 dark:to-gray-950/80 shadow-xl shadow-indigo-500/20 backdrop-blur-sm"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full animate-shimmer" />
            </div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl animate-pulse-slow" />

            <div className="relative p-5 flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center"
                  >
                    <Send className="h-6 w-6 text-white" />
                  </motion.div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                    <span>Order Issued - Ready to Send</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-800/40 text-[10px] font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-300/30 dark:border-indigo-700/30">
                      <CheckCircle className="h-3 w-3" />
                      Issued
                    </span>
                  </h4>
                </div>

                <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
                  This purchase order has been issued and is now ready to be sent to the supplier.
                </p>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">✓ All approvals</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">✓ Issued</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-indigo-400/50" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-200/70 dark:bg-indigo-800/40 border-2 border-indigo-300/50 dark:border-indigo-700/50">
                      <Mail className="h-3 w-3 text-indigo-600" />
                      <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Next</span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">Send to Supplier</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  onClick={handleSend}
                  disabled={sendMutation.isPending}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] group"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  )}
                  Send to Supplier
                  <Sparkles className="h-3.5 w-3.5 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Overdue Alert */}
        {isOverdue && (
          <Alert className="rounded-xl bg-red-50/80 dark:bg-red-950/30 border-red-200/50 dark:border-red-800/50 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <AlertTitle className="text-red-700 dark:text-red-300">Order Overdue</AlertTitle>
                <AlertDescription className="text-red-600 dark:text-red-400">
                  This purchase order has passed its expected delivery date. Please follow up with the supplier.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Completed Alert */}
        {po?.status === 'completed' && (
          <Alert className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <AlertTitle className="text-emerald-700 dark:text-emerald-300">Order Completed</AlertTitle>
                <AlertDescription className="text-emerald-600 dark:text-emerald-400">
                  This purchase order has been fully completed on {formatDate(po?.completed_at)}.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-muted/50 dark:bg-gray-800/30 p-1 h-auto rounded-xl">
            <TabsTrigger value="overview" className="flex-1 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-medium transition-all">
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="items" className="flex-1 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-medium transition-all">
              <Package className="h-4 w-4" />
              Items
              <UIBadge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {po.items?.length || 0}
              </UIBadge>
            </TabsTrigger>
            <TabsTrigger value="supplier" className="flex-1 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-medium transition-all">
              <Building2 className="h-4 w-4" />
              Supplier
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-medium transition-all">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* OVERVIEW TAB */}
          {/* ============================================ */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Order Details Card */}
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-gradient-x" />
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow" />

                    <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 shadow-lg shadow-blue-500/10">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
                              Order Details
                            </span>
                          </CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-2">
                            <span>Complete information about this purchase order</span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-medium">
                              <Activity className="h-3 w-3" />
                              {po.status}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full animate-pulse",
                            po.status === 'completed' ? "bg-emerald-500" :
                              po.status === 'cancelled' ? "bg-red-500" :
                                po.status === 'draft' ? "bg-gray-400" :
                                  "bg-blue-500"
                          )} />
                          <span className="text-xs font-medium text-muted-foreground">
                            {po.status === 'completed' ? 'Active' :
                              po.status === 'cancelled' ? 'Inactive' :
                                po.status === 'draft' ? 'Draft' : 'In Progress'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="relative pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* PO Number */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05, type: 'spring', stiffness: 300 }}
                          className="group relative p-4 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5 transition-all duration-500" />
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                            <Hash className="h-3 w-3" />
                            PO Number
                          </p>
                          <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white font-mono group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {po.po_number}
                          </p>
                        </motion.div>

                        {/* Type */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                          className="group relative p-4 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:via-indigo-500/10 group-hover:to-indigo-500/5 transition-all duration-500" />
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                            <Tag className="h-3 w-3" />
                            Type
                          </p>
                          <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">
                            {po.type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'}
                          </p>
                        </motion.div>

                        {/* Status */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                          className="relative p-4 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                        >
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="h-3 w-3" />
                            Status
                          </p>
                          <div className="mt-1">
                            <StatusBadge status={po.status} size="sm" />
                          </div>
                        </motion.div>

                        {/* Issue Date */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                          className="group relative p-4 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-emerald-500/10 group-hover:to-emerald-500/5 transition-all duration-500" />
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                            <CalendarIcon className="h-3 w-3" />
                            Issue Date
                          </p>
                          <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">
                            {formatDate(po.issue_date)}
                          </p>
                        </motion.div>

                        {/* Expected Delivery */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
                          className="group relative p-4 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:via-amber-500/10 group-hover:to-amber-500/5 transition-all duration-500" />
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                            <Truck className="h-3 w-3" />
                            Expected Delivery
                          </p>
                          <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">
                            {formatDate(po.expected_delivery_date)}
                          </p>
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 rounded-full border border-red-200/50 dark:border-red-800/50 animate-pulse">
                              <AlertCircle className="h-3 w-3" />
                              Overdue
                            </span>
                          )}
                        </motion.div>

                        {/* Actual Delivery */}
                        {po.actual_delivery_date && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                            className="group relative p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 hover:shadow-xl transition-all duration-300 border border-emerald-200/50 dark:border-emerald-800/50 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:via-emerald-500/20 group-hover:to-emerald-500/10 transition-all duration-500" />
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                              Actual Delivery
                            </p>
                            <p className="text-sm font-semibold mt-1 text-emerald-600 dark:text-emerald-400">
                              {formatDate(po.actual_delivery_date)}
                            </p>
                          </motion.div>
                        )}

                        {/* Items */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                          className="group relative p-4 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-purple-500/10 group-hover:to-purple-500/5 transition-all duration-500" />
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                            <Package className="h-3 w-3" />
                            Items
                          </p>
                          <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">
                            {po.items?.length || 0}
                          </p>
                        </motion.div>

                        {/* Total Amount */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
                          className="group relative p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 hover:shadow-xl transition-all duration-300 border border-emerald-200/50 dark:border-emerald-800/50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:via-emerald-500/20 group-hover:to-emerald-500/10 transition-all duration-500" />
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                            <DollarSign className="h-3 w-3 text-emerald-500" />
                            Total Amount
                          </p>
                          <p className="text-sm font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(totals.total)}
                          </p>
                        </motion.div>

                        {/* Currency */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                          className="group relative p-4 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-cyan-500/10 group-hover:to-cyan-500/5 transition-all duration-500" />
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="h-3 w-3" />
                            Currency
                          </p>
                          <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-white">
                            {po.currency || 'KES'}
                          </p>
                        </motion.div>

                        {/* Contract */}
                        {po.contract_number && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
                            className="md:col-span-1 group relative p-4 rounded-xl bg-gradient-to-br from-purple-50/80 to-violet-50/80 dark:from-purple-950/30 dark:to-violet-950/30 hover:shadow-xl transition-all duration-300 border border-purple-200/50 dark:border-purple-800/50 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/20 group-hover:to-purple-500/10 transition-all duration-500" />
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                              <FileCheck className="h-3 w-3 text-purple-500" />
                              Contract
                            </p>
                            <p className="text-sm font-semibold mt-1 text-purple-600 dark:text-purple-400 font-mono">
                              {po.contract_number}
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Quick Stats Footer */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 grid grid-cols-3 gap-4"
                      >
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Created</p>
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{formatDateTime(po.created_at)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Updated</p>
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{formatDateTime(po.updated_at)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Downloads</p>
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{po.download_count || 0} times</p>
                        </div>
                      </motion.div>
                    </CardContent>
                  </div>
                </Card>

                {/* Approval Signatures Card */}
                <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 animate-gradient-x" />
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />

                    <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 shadow-lg shadow-emerald-500/10">
                              <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent font-bold">
                              Approval Signatures
                            </span>
                          </CardTitle>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Track the signature status for this purchase order</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-xs text-muted-foreground">Done</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-xs text-muted-foreground">Pending</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span className="text-xs text-muted-foreground">Not Started</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Signature Progress Ring */}
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                className="text-gray-200 dark:text-gray-700"
                                strokeWidth="5"
                                stroke="currentColor"
                                fill="transparent"
                                r="28"
                                cx="32"
                                cy="32"
                              />
                              <circle
                                className="text-emerald-500 transition-all duration-1000 ease-out"
                                strokeWidth="5"
                                strokeDasharray={2 * Math.PI * 28}
                                strokeDashoffset={2 * Math.PI * 28 * (1 - ((workflow?.checked_by_user ? 1 : 0) + (workflow?.endorsed_by_user ? 1 : 0) + (workflow?.approved_by_user ? 1 : 0)) / 3)}
                                stroke="currentColor"
                                fill="transparent"
                                r="28"
                                cx="32"
                                cy="32"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {Math.round(((workflow?.checked_by_user ? 1 : 0) + (workflow?.endorsed_by_user ? 1 : 0) + (workflow?.approved_by_user ? 1 : 0)) / 3 * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 relative">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                          <span className="font-medium">Check</span>
                          <span className="font-medium">Endorse</span>
                          <span className="font-medium">Approve</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                          <div className="flex h-full transition-all duration-700 ease-out">
                            <div
                              className={cn(
                                "h-full transition-all duration-700 ease-out",
                                workflow?.checked_by_user ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-amber-500"
                              )}
                              style={{
                                width: workflow?.checked_by_user ? '33.33%' : '0%',
                                opacity: workflow?.checked_by_user ? 1 : 0.5
                              }}
                            />
                            <div
                              className={cn(
                                "h-full transition-all duration-700 ease-out delay-100",
                                workflow?.endorsed_by_user ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                                  workflow?.can_endorse ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gray-300 dark:bg-gray-600"
                              )}
                              style={{
                                width: workflow?.endorsed_by_user ? '33.33%' :
                                  workflow?.can_endorse ? '16.66%' : '0%'
                              }}
                            />
                            <div
                              className={cn(
                                "h-full transition-all duration-700 ease-out delay-200",
                                workflow?.approved_by_user ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                                  workflow?.can_approve ? "bg-gradient-to-r from-purple-500 to-violet-500" : "bg-gray-300 dark:bg-gray-600"
                              )}
                              style={{
                                width: workflow?.approved_by_user ? '33.33%' :
                                  workflow?.can_approve ? '16.66%' : '0%'
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                          <span className={cn(
                            "font-medium",
                            workflow?.checked_by_user ? "text-emerald-600 dark:text-emerald-400" :
                              workflow?.can_check ? "text-amber-600 dark:text-amber-400" :
                                "text-muted-foreground"
                          )}>
                            {workflow?.checked_by_user ? '✓ Complete' :
                              workflow?.can_check ? '⏳ In Progress' : '○ Pending'}
                          </span>
                          <span className={cn(
                            "font-medium",
                            workflow?.endorsed_by_user ? "text-emerald-600 dark:text-emerald-400" :
                              workflow?.can_endorse ? "text-blue-600 dark:text-blue-400" :
                                "text-muted-foreground"
                          )}>
                            {workflow?.endorsed_by_user ? '✓ Complete' :
                              workflow?.can_endorse ? '⏳ In Progress' : '○ Pending'}
                          </span>
                          <span className={cn(
                            "font-medium",
                            workflow?.approved_by_user ? "text-emerald-600 dark:text-emerald-400" :
                              workflow?.can_approve ? "text-purple-600 dark:text-purple-400" :
                                "text-muted-foreground"
                          )}>
                            {workflow?.approved_by_user ? '✓ Complete' :
                              workflow?.can_approve ? '⏳ In Progress' : '○ Pending'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </div>

                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <SignatureCard
                        title="Check"
                        icon={<UserCheck className="h-5 w-5" />}
                        user={workflow?.checked_by_user || null}
                        date={workflow?.checked_at || null}
                        isDone={!!workflow?.checked_by_user}
                        isRequired={true}
                        isCurrentAction={!!workflow?.can_check}
                        onAction={handleCheck}
                        actionLabel="Check Order"
                        actionPending={checkMutation.isPending}
                        comment={checkComment}
                        onCommentChange={setCheckComment}
                      />
                      <SignatureCard
                        title="Endorse"
                        icon={<Signature className="h-5 w-5" />}
                        user={workflow?.endorsed_by_user || null}
                        date={workflow?.endorsed_at || null}
                        isDone={!!workflow?.endorsed_by_user}
                        isRequired={true}
                        isCurrentAction={!!workflow?.can_endorse}
                        onAction={handleEndorse}
                        actionLabel="Endorse Order"
                        actionPending={endorseMutation.isPending}
                        comment={endorseComment}
                        onCommentChange={setEndorseComment}
                      />
                      <SignatureCard
                        title="Approve"
                        icon={<ShieldCheck className="h-5 w-5" />}
                        user={workflow?.approved_by_user || null}
                        date={workflow?.approved_at || null}
                        isDone={!!workflow?.approved_by_user}
                        isRequired={true}
                        isCurrentAction={!!workflow?.can_approve}
                        onAction={handleApprove}
                        actionLabel="Approve Order"
                        actionPending={approveMutation.isPending}
                        comment={approveComment}
                        onCommentChange={setApproveComment}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Terms & Conditions */}
                {(po.special_conditions || po.delivery_terms || po.payment_terms) && (
                  <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 animate-gradient-x" />
                      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse-slow" />
                      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-bl from-yellow-500/20 to-amber-500/20 rounded-full blur-3xl animate-pulse-slow" />

                      <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                        <CardTitle className="text-xl flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 shadow-lg shadow-amber-500/10">
                            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent font-bold">
                            Terms & Conditions
                          </span>
                        </CardTitle>
                        <CardDescription>
                          Key terms governing this purchase order
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="relative pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {po.delivery_terms && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                              className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                            >
                              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform">
                                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Delivery Terms</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1 font-medium">{po.delivery_terms}</p>
                              </div>
                            </motion.div>
                          )}

                          {po.payment_terms && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                              className="flex items-start gap-4 p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                            >
                              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition-transform">
                                <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Payment Terms</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1 font-medium">{po.payment_terms}</p>
                              </div>
                            </motion.div>
                          )}

                          {po.special_conditions && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                              className="flex items-start gap-4 p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group md:col-span-2"
                            >
                              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-lg shadow-amber-500/10 group-hover:scale-110 transition-transform">
                                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Special Conditions</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1 font-medium">{po.special_conditions}</p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Cost Summary */}
                <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 animate-gradient-x" />
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse-slow" />

                    <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                      <CardTitle className="text-base flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg shadow-emerald-500/10">
                          <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-bold">
                          Cost Summary
                        </span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative pt-4 space-y-1">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05, type: 'spring', stiffness: 300 }}
                        className="flex justify-between py-3 px-4 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
                      >
                        <span className="text-sm text-muted-foreground group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Subtotal</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(totals.subtotal)}</span>
                      </motion.div>

                      {totals.discount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                          className="flex justify-between py-3 px-4 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
                        >
                          <span className="text-sm text-muted-foreground group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Discount</span>
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">-{formatCurrency(totals.discount)}</span>
                        </motion.div>
                      )}

                      {totals.tax > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                          className="flex justify-between py-3 px-4 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
                        >
                          <span className="text-sm text-muted-foreground group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Tax</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(totals.tax)}</span>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                        className="flex justify-between py-4 px-4 mt-2 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg shadow-emerald-500/10"
                      >
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Total</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.total)}</span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="mt-2 text-center"
                      >
                        <span className="text-[10px] text-muted-foreground">
                          {po.currency || 'KES'} • {po.type === 'lpo' ? 'Goods' : 'Services'} • {po.items?.length || 0} items
                        </span>
                      </motion.div>
                    </CardContent>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950/90">
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 animate-gradient-x" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-bl from-rose-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />

                    <CardHeader className="relative pb-3 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
                      <CardTitle className="text-base flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/10">
                          <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent font-bold">
                          Quick Actions
                        </span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative pt-4 space-y-2.5">
                      {currentAction && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05, type: 'spring', stiffness: 300 }}
                        >
                          <Button
                            onClick={currentAction.action}
                            disabled={currentAction.pending}
                            className={cn(
                              "w-full rounded-xl text-white shadow-lg transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden",
                              currentAction.type === 'check' ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30" :
                                currentAction.type === 'endorse' ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/30" :
                                  "bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-purple-500/30"
                            )}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            {currentAction.pending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            {currentAction.type === 'check' && <UserCheck className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />}
                            {currentAction.type === 'endorse' && <Signature className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />}
                            {currentAction.type === 'approve' && <ShieldCheck className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />}
                            {currentAction.label}
                            <Sparkles className="h-3.5 w-3.5 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        </motion.div>
                      )}

                      {canIssue && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                        >
                          <Button
                            onClick={handleIssue}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                            Issue PO
                          </Button>
                        </motion.div>
                      )}

                      {canSend && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                        >
                          <Button
                            onClick={handleSend}
                            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <Mail className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                            Send to Supplier
                          </Button>
                        </motion.div>
                      )}

                      {canComplete && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                        >
                          <Button
                            onClick={handleComplete}
                            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <CheckCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                            Complete Order
                          </Button>
                        </motion.div>
                      )}

                      {canCancel && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                        >
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 transition-all duration-300 group hover:scale-[1.02]"
                          >
                            <XCircle className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            Cancel Order
                          </Button>
                        </motion.div>
                      )}

                      {canDownload && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
                        >
                          <Button
                            onClick={handleDownload}
                            variant="outline"
                            className="w-full rounded-xl transition-all duration-300 group hover:scale-[1.02]"
                            disabled={isDownloading}
                          >
                            {isDownloading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                            )}
                            {isDownloading ? 'Downloading...' : 'Download PDF'}
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ============================================ */}
          {/* ITEMS TAB */}
          {/* ============================================ */}
          <TabsContent value="items" className="mt-6">
            <Card className="border shadow-sm rounded-xl">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Order Items
                  </CardTitle>
                  <UIBadge variant="outline" className="rounded-full">
                    {po.items?.length || 0} items
                  </UIBadge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {!po.items || po.items.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">No items found in this order</p>
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden">
                    <ScrollArea className="max-h-[500px]">
                      <TableComponent>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="w-12 text-center font-medium text-muted-foreground">#</TableHead>
                            <TableHead className="font-medium text-muted-foreground">Item</TableHead>
                            <TableHead className="text-right font-medium text-muted-foreground">Qty</TableHead>
                            <TableHead className="text-center font-medium text-muted-foreground">Unit</TableHead>
                            <TableHead className="text-right font-medium text-muted-foreground">Unit Price</TableHead>
                            <TableHead className="text-right font-medium text-muted-foreground">Total</TableHead>
                            <TableHead className="text-center font-medium text-muted-foreground">Received</TableHead>
                            <TableHead className="text-center font-medium text-muted-foreground">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {po.items.map((item: any, index: number) => {
                            const received = parseFloat(item.received_quantity) || 0;
                            const quantity = parseFloat(item.quantity) || 0;
                            const isFullyReceived = received >= quantity;
                            const isPartiallyReceived = received > 0 && received < quantity;

                            return (
                              <TableRow key={item.id} className="hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground text-xs font-mono">{index + 1}</TableCell>
                                <TableCell>
                                  <p className="font-medium text-gray-900 dark:text-white">{item.item_name}</p>
                                  {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                                  {item.brand && <p className="text-xs text-muted-foreground">Brand: {item.brand}</p>}
                                </TableCell>
                                <TableCell className="text-right font-medium">{item.formatted_quantity || quantity}</TableCell>
                                <TableCell className="text-center text-muted-foreground">{item.unit_of_measure || '—'}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(item.unit_price)}</TableCell>
                                <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.total_price)}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium">
                                      {item.formatted_received_quantity || received}
                                    </span>
                                    <div className="w-16 mt-1">
                                      <Progress value={quantity > 0 ? (received / quantity) * 100 : 0} className="h-1.5" />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <UIBadge className={cn(
                                    "rounded-full text-[10px]",
                                    isFullyReceived ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                      isPartiallyReceived ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                  )}>
                                    {isFullyReceived ? 'Received' : isPartiallyReceived ? 'Partial' : 'Pending'}
                                  </UIBadge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </TableComponent>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================ */}
          {/* SUPPLIER TAB */}
          {/* ============================================ */}
          <TabsContent value="supplier" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border shadow-sm rounded-xl">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      Supplier Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4 mb-6">
                      <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-lg">
                          {getInitials(supplierName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{supplierName}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {(supplier as any)?.category_label && (
                            <UIBadge className="bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400 rounded-full border-0">
                              {(supplier as any).category_label}
                            </UIBadge>
                          )}
                          {(supplier as any)?.status_label && (
                            <UIBadge className={cn(
                              "rounded-full border-0",
                              (supplier as any).status === 'ACTIVE'
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            )}>
                              {(supplier as any).status_label}
                            </UIBadge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Company Name</p>
                        <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplier?.company_name || supplierName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                        <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplierEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
                        <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplierPhone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Registration</p>
                        <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplier?.company_registration || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Address</p>
                        <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplierAddress}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(supplier as any)?.bank_name && (
                  <Card className="border shadow-sm rounded-xl">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        Banking Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bank</p>
                          <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplier?.bank_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Branch</p>
                          <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplier?.bank_branch || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Account</p>
                          <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white font-mono">{supplier?.bank_account || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Currency</p>
                          <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplier?.preferred_currency || 'KES'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(supplier as any)?.contact_person_name && (
                  <Card className="border shadow-sm rounded-xl">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Contact Person
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Name</p>
                          <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplier?.contact_person_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                          <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplier?.contact_person_email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
                          <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{supplier?.contact_person_phone || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card className="border shadow-sm rounded-xl">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      Supplier Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex justify-between py-2 border-b dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{(supplier as any)?.category_label || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <UIBadge className={cn(
                        "rounded-full border-0",
                        (supplier as any)?.status === 'ACTIVE'
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        {(supplier as any)?.status_label || 'Unknown'}
                      </UIBadge>
                    </div>
                    <div className="flex justify-between py-2 border-b dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Registration</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{supplier?.company_registration || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-muted-foreground">Tax ID</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{supplier?.tax_id || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ============================================ */}
          {/* TIMELINE TAB */}
          {/* ============================================ */}
          <TabsContent value="timeline" className="mt-6">
            <Card className="border shadow-sm rounded-xl">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Order Timeline
                </CardTitle>
                <CardDescription>
                  Track the lifecycle of this purchase order
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative">
                  {timelineItems.map((item, index) => {
                    const isLast = index === timelineItems.length - 1;
                    const isCompleted = item.status === 'completed';
                    const isActive = item.status === 'active';
                    const isPending = item.status === 'pending';

                    return (
                      <div key={index} className="relative">
                        {!isLast && (
                          <div className={cn(
                            "absolute left-5 top-10 bottom-0 w-0.5",
                            isCompleted || isActive ? `bg-${item.color}-200 dark:bg-${item.color}-800` : "bg-gray-200 dark:bg-gray-700"
                          )} />
                        )}
                        <div className="flex items-start gap-4 pb-6">
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 transition-all duration-300",
                            isCompleted || isActive ? `border-${item.color}-200 dark:border-${item.color}-800 bg-${item.color}-50 dark:bg-${item.color}-950/30` : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                          )}>
                            {isCompleted ? (
                              <div className={cn("text-foreground", `text-${item.color}-600 dark:text-${item.color}-400`)}>
                                {item.icon}
                              </div>
                            ) : isActive ? (
                              <div className={cn("h-3 w-3 rounded-full animate-pulse", `bg-${item.color}-500`)} />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                              <p className={cn(
                                "text-sm font-medium",
                                isCompleted || isActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
                              )}>
                                {item.label}
                              </p>
                              {item.date && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {formatDateTime(item.date)}
                                </p>
                              )}
                              {isActive && (
                                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full animate-pulse">
                                  In Progress
                                </span>
                              )}
                              {isPending && (
                                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/30 px-2 py-0.5 rounded-full">
                                  Pending
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ============================================ */}
      {/* DIALOGS */}
      {/* ============================================ */}

      {/* Issue Dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent className="rounded-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-blue-600" />
              Issue Purchase Order
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Issue "{po?.po_number}" to make it ready for sending to the supplier.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueDialog(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleConfirmIssue} disabled={issueMutation.isPending} className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-[1.02]">
              {issueMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Issuing...</> : <>Issue PO</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="rounded-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-indigo-600" />
              Send to Supplier
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Send "{po?.po_number}" to {supplierName}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleConfirmSend} disabled={sendMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02]">
              {sendMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <>Send</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="rounded-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-teal-600" />
              Complete Purchase Order
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Mark "{po?.po_number}" as fully completed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleConfirmComplete} disabled={completeMutation.isPending} className="bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-600/20 transition-all duration-300 hover:scale-[1.02]">
              {completeMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Completing...</> : <>Complete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="rounded-xl max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg text-red-600">
              <XCircle className="h-5 w-5" />
              Cancel Purchase Order
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to cancel "{po?.po_number}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground">PO Number</p>
                <p className="font-semibold">{po?.po_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Supplier</p>
                <p className="font-semibold">{supplierName}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Reason for Cancellation <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Please explain why you're cancelling this order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} disabled={!cancelReason.trim() || cancelMutation.isPending} className="bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all duration-300">
              {cancelMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cancelling...</> : <>Cancel Order</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}
