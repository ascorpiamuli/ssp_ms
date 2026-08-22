// frontend/src/app/(dashboard)/procurement/request-for-quotations/[id]/page.tsx

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  X,
  FileText,
  Printer,
  MoreVertical,
  RefreshCw,
  ShoppingCart,
  CheckCircle,
  TrendingUp,
  FileCheck,
  Zap,
  AlertCircle,
  Users,
  Mail,
  Ban,
  Download,
  Eye,
  Calendar,
  Clock,
  User,
  Building2,
  DollarSign,
  Package,
  Truck,
  Receipt,
  MessageSquare,
  Info,
  Sparkles,
  Award,
  Crown,
  CreditCard,
  Activity,
  Shield,
  Layers,
  Loader2,
  AlertTriangle,
  History,
  XCircle,
  Check,
  Search,
  TrendingDown,
  Scale,
  ArrowUp,
  ArrowDown,
  Minus,
  Wallet,
  Coins,
  Table as TableIcon,
  Gauge,
  Target,
  Rocket,
  Timer,
  BarChart3,
  LineChart,
  PieChart,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  Circle,
  CircleCheck,
  CircleDashed,
  Grid3x3,
  LayoutGrid,
  List,
  Maximize2,
  Minimize2,
  Filter,
  SlidersHorizontal,
  Star,
  StarHalf,
  StarOff,
  Percent,
  ChartBar,
  Briefcase,
  Building,
  Globe,
  Phone,
  MailCheck,
  MapPin,
  Award as AwardIcon,
  BadgeCheck,
  Sparkle,
  Zap as ZapIcon,
  ChevronDown,
  ChevronUp,
  Gift,
  Heart,
  ThumbsUp,
  Flame,
  Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useQuotation,
  useSendQuotation,
  useCloseQuotation,
  useCancelQuotation,
  useSendQuotationReminder,
  useDownloadPDF,
  usePreviewPDF,
  usePrintPDF,
  useSharePDFViaEmail,
  useSelectSupplier,
} from '@/hooks/useQuotation';
import {
  useSupplierQuotationsByQtn,
  useVerifySupplierQuotation,
  useEvaluateSupplierQuotation,
} from '@/hooks/useSupplierQuotation';
import { useProcurementSummary } from '@/hooks/useProcurement';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { QuotationRequest } from '@/types/quotations.types';
import type { SupplierQuotation } from '@/types/supplierQuotation.types';
import type { ProcurementSummary } from '@/types/procurement.types';
import type { Supplier } from '@/services/supplier.service';

// Components
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

const PROCUREMENT_STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  initiated: 'Initiated',
  quotation_in_progress: 'Quotation in Progress',
  awaiting_quotations: 'Awaiting Quotations',
  evaluating_quotations: 'Evaluating Quotations',
  supplier_selected: 'Supplier Selected',
  goods_receipt_pending: 'Goods Receipt Pending',
  invoicing_pending: 'Invoicing Pending',
  payment_pending: 'Payment Pending',
  completed: 'Completed',
};

const HISTORY_ACTION_CONFIG: Record<string, { color: string; icon: any; label: string; description: string }> = {
  procurement_started: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: ShoppingCart,
    label: 'Procurement Started',
    description: 'Procurement process initiated'
  },
  procurement_completed: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle,
    label: 'Procurement Completed',
    description: 'Procurement process completed'
  },
  procurement_cancelled: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    icon: X,
    label: 'Procurement Cancelled',
    description: 'Procurement was cancelled'
  },
  qtn_generated: {
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    icon: FileCheck,
    label: 'QTN Generated',
    description: 'Quotation Request generated'
  },
  qtn_sent: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: Send,
    label: 'QTN Sent',
    description: 'Quotation Request sent to suppliers'
  },
  quotation_submitted: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle,
    label: 'Quotation Submitted',
    description: 'Supplier submitted quotation'
  },
  qtn_closed: {
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    icon: CheckCircle,
    label: 'QTN Closed',
    description: 'Quotation Request closed'
  },
  qtn_verified: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: FileCheck,
    label: 'QTN Verified',
    description: 'Quotation verified'
  },
  qtn_evaluated: {
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    icon: Award,
    label: 'QTN Evaluated',
    description: 'Quotation evaluated'
  },
  qtn_status_changed: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: RefreshCw,
    label: 'Status Changed',
    description: 'QTN status changed'
  },
  qtn_auto_closed: {
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800',
    icon: Clock,
    label: 'Auto Closed',
    description: 'QTN automatically closed'
  },
  quotation_verified: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: FileCheck,
    label: 'Quotation Verified',
    description: 'Quotation verified'
  },
  quotation_evaluated: {
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    icon: Award,
    label: 'Quotation Evaluated',
    description: 'Quotation evaluated with score'
  },
};

const VERIFICATION_ALLOWED_ROLES = ['ADMIN', 'ACCOUNTANT', 'FINANCE_ADMIN', 'PROCUREMENT'];

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | Date | number | null): string => {
  if (!date) return 'N/A';
  try {
    let dateObj: Date;
    if (typeof date === 'number') {
      const timestamp = date;
      if (timestamp.toString().length === 10) {
        dateObj = new Date(timestamp * 1000);
      } else {
        dateObj = new Date(timestamp);
      }
    } else if (typeof date === 'string') {
      const numDate = parseFloat(date);
      if (!isNaN(numDate) && date.match(/^\d+$/)) {
        if (numDate.toString().length === 10) {
          dateObj = new Date(numDate * 1000);
        } else {
          dateObj = new Date(numDate);
        }
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    if (dateObj.getFullYear() < 2000) {
      return 'Invalid Date';
    }
    return format(dateObj, 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date: string | Date | number | null): string => {
  if (!date) return 'N/A';
  try {
    let dateObj: Date;
    if (typeof date === 'number') {
      const timestamp = date;
      if (timestamp.toString().length === 10) {
        dateObj = new Date(timestamp * 1000);
      } else {
        dateObj = new Date(timestamp);
      }
    } else if (typeof date === 'string') {
      const numDate = parseFloat(date);
      if (!isNaN(numDate) && date.match(/^\d+$/)) {
        if (numDate.toString().length === 10) {
          dateObj = new Date(numDate * 1000);
        } else {
          dateObj = new Date(numDate);
        }
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 2000) {
      return 'Invalid Date';
    }
    return format(dateObj, 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(numAmount);
};

const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status] || status;
};

const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?';
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
};

const getFullName = (user: any): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'string') return user;
  if (user.full_name) return user.full_name;
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  if (user.first_name) return user.first_name;
  if (user.name) return user.name;
  if (user.company_name) return user.company_name;
  return 'Unknown';
};

const getUserEmail = (user: any): string => {
  if (!user) return 'No email';
  if (typeof user === 'string') return user;
  if (user.email) return user.email;
  if (user.company_email) return user.company_email;
  return 'No email';
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status, size = 'default' }: { status: string; size?: 'sm' | 'default' | 'lg' }) => {
  const Icon = STATUS_ICONS[status] || FileText;
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    default: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4.5 py-2 gap-2.5',
  };

  return (
    <span className={cn("inline-flex items-center font-medium rounded-full border", colorClass, sizeClasses[size])}>
      <Icon className={cn(
        "flex-shrink-0",
        size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
      )} />
      {getStatusLabel(status)}
    </span>
  );
};

// ============================================
// DIALOGS
// ============================================

interface VerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: SupplierQuotation | null;
  onConfirm: (data: { status: 'verified' | 'rejected'; notes: string }) => void;
  isSubmitting: boolean;
  supplierName: string;
}

const VerifyDialog = ({
  open,
  onOpenChange,
  quotation,
  onConfirm,
  isSubmitting,
  supplierName,
}: VerifyDialogProps) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) setNotes('');
  }, [open]);

  if (!quotation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Verify Quotation
          </DialogTitle>
          <DialogDescription className="text-base">
            Verify quotation from <span className="font-semibold text-foreground">{supplierName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="bg-muted/30 dark:bg-gray-800/30 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-semibold">{supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(quotation.net_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quotation Number</p>
                <p className="font-semibold">{quotation.quotation_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-semibold">{quotation.items?.length || 0} items</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Verification Notes (Optional)</Label>
            <Textarea
              placeholder="Add any verification notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold">Verification Checklist:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>All items are correctly quoted</li>
                  <li>Unit prices are reasonable</li>
                  <li>Delivery terms are acceptable</li>
                  <li>Supplier is in good standing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6">Cancel</Button>
          <Button variant="destructive" onClick={() => onConfirm({ status: 'rejected', notes })} disabled={isSubmitting} className="rounded-xl px-6">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-2" />Reject</>}
          </Button>
          <Button onClick={() => onConfirm({ status: 'verified', notes })} disabled={isSubmitting} className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 px-6">
            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</> : <><CheckCircle className="h-4 w-4 mr-2" />Verify</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: SupplierQuotation | null;
  onConfirm: (data: { score: number; notes: string }) => void;
  isSubmitting: boolean;
  supplierName: string;
}

const EvaluationDialog = ({
  open,
  onOpenChange,
  quotation,
  onConfirm,
  isSubmitting,
  supplierName,
}: EvaluationDialogProps) => {
  const [score, setScore] = useState(70);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) { setScore(70); setNotes(''); }
  }, [open]);

  if (!quotation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Evaluate Quotation
          </DialogTitle>
          <DialogDescription className="text-base">
            Evaluate quotation from <span className="font-semibold text-foreground">{supplierName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="bg-muted/30 dark:bg-gray-800/30 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-semibold">{supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(quotation.net_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quotation Number</p>
                <p className="font-semibold">{quotation.quotation_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-semibold">{quotation.items?.length || 0} items</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Evaluation Score</Label>
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{score}%</span>
            </div>
            <Input type="range" min={0} max={100} value={score} onChange={(e) => setScore(parseInt(e.target.value))} className="h-2 rounded-full accent-purple-600" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span className="text-purple-600 font-medium">Score: {score}%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Evaluation Notes</Label>
            <Textarea placeholder="Add your evaluation notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="rounded-xl resize-none" />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold">Evaluation Criteria:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Price competitiveness</li>
                  <li>Delivery terms</li>
                  <li>Warranty and support</li>
                  <li>Supplier track record</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6">Cancel</Button>
          <Button onClick={() => onConfirm({ score, notes })} disabled={isSubmitting} className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-600/20 px-6">
            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Evaluating...</> : <><Award className="h-4 w-4 mr-2" />Submit Evaluation</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface SelectSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierQuotation: SupplierQuotation | null;
  onConfirm: (data: { notes: string }) => void;
  isSubmitting: boolean;
  supplierName: string;
}

const SelectSupplierDialog = ({
  open,
  onOpenChange,
  supplierQuotation,
  onConfirm,
  isSubmitting,
  supplierName,
}: SelectSupplierDialogProps) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) setNotes('');
  }, [open]);

  if (!supplierQuotation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Crown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Select Supplier
          </DialogTitle>
          <DialogDescription className="text-base">
            Confirm selection of <span className="font-semibold text-foreground">{supplierName}</span> as the winning bidder
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-semibold">{supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(supplierQuotation.net_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quotation Number</p>
                <p className="font-semibold">{supplierQuotation.quotation_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-semibold">{supplierQuotation.items?.length || 0} items</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Selection Notes (Optional)</Label>
            <Textarea placeholder="Add notes about why this supplier was selected..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="rounded-xl resize-none" />
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-semibold">Please confirm:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>This supplier has the best evaluated bid</li>
                  <li>All compliance requirements are met</li>
                  <li>Budget is available for this selection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6">Cancel</Button>
          <Button onClick={() => onConfirm({ notes })} disabled={isSubmitting} className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 px-6">
            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Selecting...</> : <><Crown className="h-4 w-4 mr-2" />Select Supplier</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// ITEM COMPARISON TABLE
// ============================================

interface ItemComparisonProps {
  supplierQuotations: SupplierQuotation[];
  requisitionItems: any[];
  isLoading: boolean;
  supplierMap: Map<number, Supplier>;
}

const ItemComparison = ({
  supplierQuotations,
  requisitionItems,
  isLoading,
  supplierMap,
}: ItemComparisonProps) => {
  const [showAllItems, setShowAllItems] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!supplierQuotations || supplierQuotations.length === 0 || !requisitionItems || requisitionItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm mb-5">
          <Package className="h-10 w-10 text-gray-400 dark:text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Items to Compare</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {!requisitionItems || requisitionItems.length === 0
            ? 'No requisition items found for this RFQ.'
            : 'No supplier quotations available for comparison.'}
        </p>
      </div>
    );
  }

  const getSupplierName = (sq: any): string => {
    const supplier = supplierMap.get(sq.supplier_id);
    return supplier?.company_name || supplier?.contact_person_name || `Supplier ${sq.supplier_id}`;
  };

  const itemsWithBestPrices = requisitionItems.map((item: any) => {
    const supplierPrices = supplierQuotations.map((sq: any) => {
      const sqItem = sq.items?.find((i: any) => i.requisition_item_id === item.id);
      return {
        supplierId: sq.id,
        supplier: sq,
        price: sqItem ? parseFloat(sqItem.total_price) || 0 : null,
        unitPrice: sqItem ? parseFloat(sqItem.unit_price) || 0 : null,
        quantity: sqItem ? parseFloat(sqItem.quantity) || 0 : null,
      };
    });

    const validPrices = supplierPrices.filter((p: any) => p.price !== null && p.price > 0);
    const bestPrice = validPrices.length > 0
      ? validPrices.reduce((min: any, p: any) => (p.price! < min.price! ? p : min), validPrices[0])
      : null;

    const estimate = parseFloat(item.total_cost) || 0;

    return {
      ...item,
      supplierPrices,
      bestPrice,
      estimate,
      savings: bestPrice ? estimate - bestPrice.price! : null,
      savingsPercentage: bestPrice && estimate > 0 ? ((estimate - bestPrice.price!) / estimate * 100) : null,
    };
  });

  const displayItems = showAllItems ? itemsWithBestPrices : itemsWithBestPrices.slice(0, 5);

  return (
    <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/50 overflow-hidden">
      <CardHeader className="pb-3 border-b border-white/10 dark:border-gray-700/30 bg-white/10 dark:bg-gray-800/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Grid3x3 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              Item Price Comparison
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">Compare item prices across all suppliers against budget estimates</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1.5 text-sm border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 bg-white/20 dark:bg-gray-800/30">
              {requisitionItems.length} items
            </Badge>
            {requisitionItems.length > 5 && (
              <Button variant="ghost" size="sm" onClick={() => setShowAllItems(!showAllItems)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
                {showAllItems ? <Minimize2 className="h-4 w-4 mr-1.5" /> : <Maximize2 className="h-4 w-4 mr-1.5" />}
                {showAllItems ? 'Show Less' : 'Show All'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-800/30 border-b border-white/10 dark:border-gray-700/30">
                <TableHead className="min-w-[180px] py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Item</TableHead>
                <TableHead className="text-center min-w-[70px] py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Qty</TableHead>
                <TableHead className="text-right min-w-[120px] py-3.5 px-4 font-semibold text-amber-600 dark:text-amber-400">Budget Estimate</TableHead>
                {supplierQuotations.map((sq: any) => {
                  const name = getSupplierName(sq);
                  return (
                    <TableHead key={sq.id} className="text-right min-w-[130px] py-3.5 px-4">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-sm truncate max-w-[100px] text-gray-700 dark:text-gray-300">{name}</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">{sq.quotation_number}</span>
                      </div>
                    </TableHead>
                  );
                })}
                <TableHead className="text-center min-w-[100px] py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">Best Price</TableHead>
                <TableHead className="text-center min-w-[100px] py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Savings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayItems.map((item: any) => {
                const isBest = item.bestPrice !== null;
                const showSavings = isBest && item.savings !== null && item.savings > 0;
                const isOverBudget = isBest && item.savings !== null && item.savings < 0;

                return (
                  <TableRow key={item.id} className="hover:bg-white/5 dark:hover:bg-gray-800/20 transition-colors border-t border-white/5 dark:border-gray-700/30">
                    <TableCell className="py-3.5 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.item_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.unit_of_measure || 'Unit'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                      {parseFloat(item.quantity).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right py-3.5 px-4 font-medium text-amber-600 dark:text-amber-400">
                      {formatCurrency(item.estimate)}
                    </TableCell>
                    {item.supplierPrices.map((sp: any) => (
                      <TableCell key={sp.supplierId} className="text-right py-3.5 px-4">
                        {sp.price !== null && sp.price > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className={cn(
                              "font-medium text-gray-700 dark:text-gray-300",
                              sp.price === item.bestPrice?.price && "text-emerald-600 dark:text-emerald-400"
                            )}>
                              {formatCurrency(sp.price)}
                            </span>
                            {sp.unitPrice !== null && (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {formatCurrency(sp.unitPrice)}/unit
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">—</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center py-3.5 px-4">
                      {isBest ? (
                        <Badge className={cn(
                          "font-medium text-xs px-3 py-1 border-0",
                          showSavings ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                            isOverBudget ? "bg-rose-500/20 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" :
                              "bg-blue-500/20 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                        )}>
                          <Sparkles className="h-3 w-3 mr-1.5" />
                          {formatCurrency(item.bestPrice.price)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-3.5 px-4">
                      {showSavings && (
                        <Badge className="bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0 font-medium text-xs px-3 py-1 animate-pulse">
                          <TrendingDown className="h-3 w-3 mr-1.5" />
                          {formatCurrency(item.savings)}
                          <span className="ml-1 text-[10px]">
                            (-{item.savingsPercentage?.toFixed(0)}%)
                          </span>
                        </Badge>
                      )}
                      {isOverBudget && (
                        <Badge className="bg-rose-500/20 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-0 font-medium text-xs px-3 py-1">
                          <TrendingUp className="h-3 w-3 mr-1.5" />
                          {formatCurrency(Math.abs(item.savings))}
                          <span className="ml-1 text-[10px]">
                            (+{Math.abs(item.savingsPercentage!).toFixed(0)}%)
                          </span>
                        </Badge>
                      )}
                      {!showSavings && !isOverBudget && (
                        <span className="text-gray-400 dark:text-gray-600">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {!showAllItems && requisitionItems.length > 5 && (
          <div className="p-4 text-center border-t border-white/10 dark:border-gray-700/30">
            <Button variant="ghost" onClick={() => setShowAllItems(true)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <Maximize2 className="h-4 w-4 mr-2" />
              Show all {requisitionItems.length} items
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// BID COMPARISON TABLE
// ============================================

interface BidComparisonProps {
  supplierQuotations: SupplierQuotation[];
  isLoading: boolean;
  supplierMap: Map<number, Supplier>;
  onSelectSupplier: (supplierId: number) => void;
  onVerifySupplier: (supplierId: number) => void;
  onEvaluateSupplier: (supplierId: number) => void;
  canSelectSupplier: boolean;
  canVerify: boolean;
  canEvaluate: boolean;
  quotation: QuotationRequest | null;
  estimatedTotal: number;
}

const BidComparison = ({
  supplierQuotations,
  isLoading,
  supplierMap,
  onSelectSupplier,
  onVerifySupplier,
  onEvaluateSupplier,
  canSelectSupplier,
  canVerify,
  canEvaluate,
  quotation,
  estimatedTotal,
}: BidComparisonProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!supplierQuotations || supplierQuotations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm mb-5">
          <Users className="h-10 w-10 text-gray-400 dark:text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Supplier Bids</h3>
        <p className="text-gray-500 dark:text-gray-400">No suppliers have submitted quotations for this RFQ yet.</p>
      </div>
    );
  }

  const getSupplierName = (sq: any): string => {
    const supplier = supplierMap.get(sq.supplier_id);
    return supplier?.company_name || supplier?.contact_person_name || `Supplier ${sq.supplier_id}`;
  };

  const getSupplierInitials = (sq: any): string => {
    return getInitials(getSupplierName(sq));
  };

  const lowestBid = supplierQuotations.reduce((lowest: any, current: any) => {
    const currentAmount = parseFloat(current.net_amount?.toString() || '0');
    const lowestAmount = parseFloat(lowest.net_amount?.toString() || '0');
    return currentAmount < lowestAmount ? current : lowest;
  }, supplierQuotations[0]);

  const canSelect = (sq: any): boolean => {
    const isVerifiedAndEvaluated = sq.verification_status === 'verified' && sq.status === 'evaluated';
    const isRfqSelectable = quotation?.status === 'evaluating' || quotation?.status === 'closed';
    return canSelectSupplier && isVerifiedAndEvaluated && isRfqSelectable;
  };

  const canVerifyQuote = (sq: any): boolean => canVerify && sq.verification_status === 'pending';
  const canEvaluateQuote = (sq: any): boolean => canEvaluate && sq.verification_status === 'verified' && sq.status === 'submitted';

  return (
    <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/50 overflow-hidden">
      <CardHeader className="pb-3 border-b border-white/10 dark:border-gray-700/30 bg-white/10 dark:bg-gray-800/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Scale className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              Supplier Bid Comparison
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">Compare total bids from all suppliers</CardDescription>
          </div>
          <Badge variant="outline" className="px-3 py-1.5 text-sm border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 bg-white/20 dark:bg-gray-800/30">
            {supplierQuotations.length} suppliers
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-800/30 border-b border-white/10 dark:border-gray-700/30">
                <TableHead className="min-w-[200px] py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Supplier</TableHead>
                <TableHead className="text-right min-w-[140px] py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Total Bid</TableHead>
                <TableHead className="text-right min-w-[140px] py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">vs Estimate</TableHead>
                <TableHead className="text-center min-w-[80px] py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Items</TableHead>
                <TableHead className="text-center min-w-[120px] py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Status</TableHead>
                <TableHead className="text-center min-w-[120px] py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Verification</TableHead>
                <TableHead className="text-center min-w-[200px] py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierQuotations.map((sq: any) => {
                const amount = parseFloat(sq.net_amount?.toString() || '0');
                const isLowest = sq.id === lowestBid.id;
                const supplierName = getSupplierName(sq);
                const difference = amount - estimatedTotal;
                const isSelected = sq.status === 'accepted';
                const canSelectThis = canSelect(sq);
                const canVerifyThis = canVerifyQuote(sq);
                const canEvaluateThis = canEvaluateQuote(sq);

                return (
                  <TableRow
                    key={sq.id}
                    className={cn(
                      "hover:bg-white/5 dark:hover:bg-gray-800/20 transition-colors border-t border-white/5 dark:border-gray-700/30",
                      isLowest && "bg-emerald-500/10 dark:bg-emerald-500/10 border-l-4 border-l-emerald-500",
                      isSelected && "bg-purple-500/10 dark:bg-purple-500/10 border-l-4 border-l-purple-500"
                    )}
                  >
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-white/20 dark:border-gray-700/50">
                          <AvatarFallback className={cn("text-sm font-medium", isLowest ? "bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-white/20 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300")}>
                            {getSupplierInitials(sq)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{supplierName}</span>
                            {isLowest && (
                              <Badge className="bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0">
                                <Crown className="h-3 w-3 mr-1" />
                                Best
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge className="bg-purple-500/20 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-0">
                                <Crown className="h-3 w-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{sq.quotation_number}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3.5 px-4">
                      <span className={cn("font-bold text-lg", isLowest ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white")}>
                        {formatCurrency(amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-3.5 px-4">
                      {difference < 0 ? (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <TrendingDown className="h-4 w-4" />
                          {formatCurrency(Math.abs(difference))}
                          <span className="text-sm text-gray-500 dark:text-gray-400">below</span>
                        </span>
                      ) : difference > 0 ? (
                        <span className="font-medium text-rose-600 dark:text-rose-400 flex items-center justify-end gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {formatCurrency(Math.abs(difference))}
                          <span className="text-sm text-gray-500 dark:text-gray-400">above</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-3.5 px-4">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{sq.items?.length || 0}</span>
                    </TableCell>
                    <TableCell className="text-center py-3.5 px-4">
                      <Badge className={cn(
                        "font-medium",
                        sq.status === 'submitted' ? "bg-blue-500/20 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                          sq.status === 'evaluated' ? "bg-purple-500/20 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" :
                            sq.status === 'accepted' ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                              sq.status === 'rejected' ? "bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                                "bg-gray-500/20 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400"
                      )}>
                        {sq.status_label || sq.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-3.5 px-4">
                      <Badge className={cn(
                        "font-medium",
                        sq.verification_status === 'verified' ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                          sq.verification_status === 'rejected' ? "bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                            "bg-amber-500/20 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                      )}>
                        {sq.verification_status_label || sq.verification_status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {canVerifyThis && (
                          <Button size="sm" variant="outline" onClick={() => onVerifySupplier(sq.id)} className="text-blue-600 border-blue-500/30 hover:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30 dark:hover:bg-blue-500/10 rounded-xl">
                            <FileCheck className="h-3.5 w-3.5 mr-1.5" />
                            Verify
                          </Button>
                        )}
                        {canEvaluateThis && (
                          <Button size="sm" variant="outline" onClick={() => onEvaluateSupplier(sq.id)} className="text-purple-600 border-purple-500/30 hover:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30 dark:hover:bg-purple-500/10 rounded-xl">
                            <Award className="h-3.5 w-3.5 mr-1.5" />
                            Evaluate
                          </Button>
                        )}
                        {canSelectThis && (
                          <Button size="sm" onClick={() => onSelectSupplier(sq.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20">
                            <Crown className="h-3.5 w-3.5 mr-1.5" />
                            Select
                          </Button>
                        )}
                        {isSelected && (
                          <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">✓ Selected</span>
                        )}
                        {!canVerifyThis && !canEvaluateThis && !canSelectThis && !isSelected && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {sq.verification_status === 'rejected' ? 'Rejected' : '—'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// SUPPLIER SELECTION COMPONENT
// ============================================

interface SupplierSelectionProps {
  suppliers: Supplier[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
}

const SupplierSelection = ({
  suppliers,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  searchTerm,
  onSearchChange,
  isLoading = false,
}: SupplierSelectionProps) => {
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.company_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 dark:bg-gray-800/30 mb-4">
          <Users className="h-8 w-8 text-muted-foreground dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Suppliers Found</h3>
        <p className="text-muted-foreground dark:text-gray-400">Please add suppliers before sending this RFQ.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
          <Input placeholder="Search suppliers..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 rounded-xl dark:bg-gray-800 dark:border-gray-700" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll} className="rounded-xl dark:border-gray-700 dark:text-gray-300"><Check className="h-4 w-4 mr-1.5" />All</Button>
          <Button variant="outline" size="sm" onClick={onDeselectAll} className="rounded-xl dark:border-gray-700 dark:text-gray-300"><X className="h-4 w-4 mr-1.5" />None</Button>
        </div>
      </div>
      <ScrollArea className="max-h-[350px] pr-4">
        <div className="space-y-2">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:bg-muted/50 dark:hover:bg-gray-800/50",
                selectedIds.includes(supplier.id) ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-700" : "border-border dark:border-gray-700"
              )}
              onClick={() => onToggle(supplier.id)}
            >
              <Checkbox checked={selectedIds.includes(supplier.id)} onCheckedChange={() => onToggle(supplier.id)} className="rounded-md h-4 w-4 dark:border-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold dark:text-gray-200 truncate">{supplier.company_name || 'Unnamed Supplier'}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground dark:text-gray-400">
                  <span>{supplier.company_email || 'No email'}</span>
                  {supplier.contact_person_name && <span>• Contact: {supplier.contact_person_name}</span>}
                </div>
              </div>
              <span className={cn("text-sm px-3 py-1 rounded-full border", supplier.is_blacklisted ? "border-red-200 text-red-600 dark:border-red-800 dark:text-red-400" : "border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400")}>
                {supplier.is_blacklisted ? 'Blacklisted' : 'Active'}
              </span>
            </div>
          ))}
          {filteredSuppliers.length === 0 && <div className="text-center py-4 text-muted-foreground dark:text-gray-400">No suppliers match your search</div>}
        </div>
      </ScrollArea>
      <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
        <span className="text-sm text-muted-foreground dark:text-gray-400">{selectedIds.length} of {suppliers.length} suppliers selected</span>
        <span className="text-sm font-medium dark:text-gray-200">{selectedIds.length > 0 ? `${selectedIds.length} supplier${selectedIds.length > 1 ? 's' : ''} will receive this RFQ` : 'No suppliers selected'}</span>
      </div>
    </div>
  );
};

// ============================================
// TIMELINE ITEM
// ============================================

interface TimelineItemProps {
  item: { action: string; action_label: string; user: string; comment: string | null; created_at: string; };
  isLast: boolean;
  index: number;
}

const TimelineItem = ({ item, isLast, index }: TimelineItemProps) => {
  const config = HISTORY_ACTION_CONFIG[item.action] || {
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    icon: Clock,
    label: item.action_label || item.action,
    description: item.action_label || item.action,
  };
  const Icon = config.icon;

  const getCircleColor = () => {
    if (item.action === 'qtn_sent') return 'border-blue-500';
    if (item.action === 'quotation_submitted') return 'border-emerald-500';
    if (item.action === 'procurement_completed') return 'border-emerald-500';
    if (item.action === 'procurement_cancelled') return 'border-red-500';
    if (item.action === 'qtn_verified' || item.action === 'quotation_verified') return 'border-emerald-500';
    if (item.action === 'qtn_evaluated' || item.action === 'quotation_evaluated') return 'border-purple-500';
    return 'border-gray-300 dark:border-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative pl-8 pb-6 last:pb-0"
    >
      {!isLast && <div className="absolute left-2.5 top-4 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />}
      <div className={cn("absolute left-0 top-1 w-5 h-5 rounded-full border-2 bg-white dark:bg-gray-900", getCircleColor())}>
        <div className="absolute inset-0.5 rounded-full bg-current opacity-10" />
      </div>
      <div className="ml-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={cn("text-sm font-medium rounded-full inline-flex items-center px-3 py-1 border", config.color)}>
            <Icon className="h-4 w-4 mr-1.5" />
            {config.label}
          </span>
          <span className="text-sm text-muted-foreground dark:text-gray-400">{formatDateTime(item.created_at)}</span>
        </div>
        <p className="text-base font-semibold text-foreground dark:text-gray-200 mt-0.5">By {getFullName(item.user)}</p>
        {item.comment && (
          <div className="mt-2 p-3 bg-muted/30 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
            <p className="text-sm flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="dark:text-gray-300">{item.comment}</span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function RFQDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { user } = useAuthContext();

  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showEvaluateDialog, setShowEvaluateDialog] = useState(false);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierQuotation | null>(null);
  const [comment, setComment] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([]);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');

  const { data: quotation, isLoading, refetch } = useQuotation(id, { enabled: !!id });
  const { data: supplierQuotations, isLoading: isLoadingQuotes } = useSupplierQuotationsByQtn(id, { enabled: !!id });
  const { data: procurementSummary, isLoading: isLoadingProcurement } = useProcurementSummary(
    quotation?.requisition_id || 0,
    { enabled: !!quotation?.requisition_id }
  );

  const suppliersHook = useSuppliers();
  const { data: allSuppliers, isLoading: isLoadingSuppliers } = suppliersHook.useAllSuppliers();

  const verifyMutation = useVerifySupplierQuotation();
  const evaluateMutation = useEvaluateSupplierQuotation();
  const selectSupplierMutation = useSelectSupplier();
  const sendQuotation = useSendQuotation();
  const closeQuotation = useCloseQuotation();
  const cancelQuotation = useCancelQuotation();
  const sendReminder = useSendQuotationReminder();
  const { mutate: downloadPDF, isPending: isDownloading } = useDownloadPDF();
  const { previewPDF } = usePreviewPDF();
  const { printPDF } = usePrintPDF();
  const { sharePDFViaEmail } = useSharePDFViaEmail();

  const userRoles = useMemo(() => {
    const roles: string[] = [];
    if (user?.role) roles.push(user.role.toUpperCase());
    if (user?.roles) {
      user.roles.forEach((r: any) => {
        const roleName = typeof r === 'string' ? r.toUpperCase() : r.name?.toUpperCase();
        if (roleName) roles.push(roleName);
      });
    }
    return roles;
  }, [user]);

  const canVerify = useMemo(() => userRoles.some(role => VERIFICATION_ALLOWED_ROLES.includes(role)), [userRoles]);
  const canEvaluate = useMemo(() => userRoles.some(role => VERIFICATION_ALLOWED_ROLES.includes(role)), [userRoles]);
  const canSelect = useMemo(() => userRoles.some(role => VERIFICATION_ALLOWED_ROLES.includes(role)), [userRoles]);

  const supplierMap = useMemo(() => {
    const map = new Map<number, Supplier>();
    if (allSuppliers) allSuppliers.forEach(s => map.set(s.id, s));
    return map;
  }, [allSuppliers]);

  const handleBack = () => router.push('/procurement/request-for-quotations');
  const handleEdit = () => router.push(`/procurement/request-for-quotations/${id}/edit`);
  const handleRefresh = () => refetch();
  const handleDownload = () => downloadPDF({ id });
  const handlePreview = () => previewPDF(id);
  const handleShare = () => setShowShareDialog(true);

  const handleSendShareEmail = () => {
    if (!shareEmail.trim()) return;
    sharePDFViaEmail({ id, email: shareEmail, subject: `QTN Document: ${quotation?.qtn_number}`, body: `Please find the QTN document for your review.\n\nQTN Number: ${quotation?.qtn_number}\nTitle: ${quotation?.title}\n\nRegards,\nProcurement Department` });
    setShowShareDialog(false);
    setShareEmail('');
  };

  const handleSend = () => {
    setSelectedSupplierIds([]);
    setSupplierSearchTerm('');
    setShowSendDialog(true);
    setComment('');
  };

  const handleToggleSupplier = (supplierId: number) => {
    setSelectedSupplierIds(prev => prev.includes(supplierId) ? prev.filter(id => id !== supplierId) : [...prev, supplierId]);
  };

  const handleSelectAllSuppliers = () => {
    if (allSuppliers) setSelectedSupplierIds(allSuppliers.map(s => s.id));
  };

  const handleDeselectAllSuppliers = () => setSelectedSupplierIds([]);

  const handleConfirmSend = () => {
    if (!quotation || selectedSupplierIds.length === 0) return;
    sendQuotation.mutate({ id: quotation.id, data: { supplier_ids: selectedSupplierIds } }, {
      onSuccess: () => { setShowSendDialog(false); setSelectedSupplierIds([]); refetch(); },
    });
  };

  const handleClose = () => { setShowCloseDialog(true); setComment(''); };
  const handleConfirmClose = () => {
    if (quotation) closeQuotation.mutate(quotation.id, { onSuccess: () => { setShowCloseDialog(false); refetch(); } });
  };

  const handleCancel = () => { setShowCancelDialog(true); setComment(''); };
  const handleConfirmCancel = () => {
    if (quotation) cancelQuotation.mutate({ id: quotation.id, data: { reason: comment || 'Cancelled by user' } }, {
      onSuccess: () => { setShowCancelDialog(false); refetch(); },
    });
  };

  const handleReminder = () => { setShowReminderDialog(true); setComment(''); };
  const handleConfirmReminder = () => {
    if (quotation) sendReminder.mutate(quotation.id, { onSuccess: () => { setShowReminderDialog(false); refetch(); } });
  };

  const handleDelete = () => setShowDeleteDialog(true);
  const handleConfirmDelete = () => { setShowDeleteDialog(false); router.push('/procurement/request-for-quotations'); };

  const handleVerifySupplier = (supplierId: number) => {
    const supplier = supplierQuotations?.find(sq => sq.id === supplierId);
    if (supplier) { setSelectedSupplier(supplier); setShowVerifyDialog(true); }
  };

  const handleConfirmVerify = (data: { status: 'verified' | 'rejected'; notes: string }) => {
    if (!selectedSupplier) return;
    verifyMutation.mutate({ id: selectedSupplier.id, data }, {
      onSuccess: () => { setShowVerifyDialog(false); setSelectedSupplier(null); refetch(); },
    });
  };

  const handleEvaluateSupplier = (supplierId: number) => {
    const supplier = supplierQuotations?.find(sq => sq.id === supplierId);
    if (supplier) { setSelectedSupplier(supplier); setShowEvaluateDialog(true); }
  };

  const handleConfirmEvaluate = (data: { score: number; notes: string }) => {
    if (!selectedSupplier) return;
    evaluateMutation.mutate({ id: selectedSupplier.id, data }, {
      onSuccess: () => { setShowEvaluateDialog(false); setSelectedSupplier(null); refetch(); },
    });
  };

  const handleSelectSupplier = (supplierId: number) => {
    const supplier = supplierQuotations?.find(sq => sq.id === supplierId);
    if (supplier) { setSelectedSupplier(supplier); setShowSelectDialog(true); }
  };

  const handleConfirmSelectSupplier = (data: { notes: string }) => {
    if (!selectedSupplier || !quotation) return;
    selectSupplierMutation.mutate({
      quotation_id: quotation.id,
      supplier_id: selectedSupplier.supplier_id,
    } as any, {
      onSuccess: () => { setShowSelectDialog(false); setSelectedSupplier(null); refetch(); },
    });
  };

  const generatedByName = getFullName(quotation?.generated_by);
  const isExpired = quotation?.is_expired || false;
  const isClosingSoon = quotation?.is_closing_soon || false;
  const responseCount = quotation?.response_count || 0;
  const responseRate = quotation?.response_rate || 0;

  const procurementStatus = (procurementSummary as any)?.procurement?.status || 'not_started';

  const canSend = quotation?.status === 'draft';
  const canEdit = quotation?.status === 'draft';
  const canClose = ['sent', 'responded', 'evaluating'].includes(quotation?.status || '');
  const canCancel = ['draft', 'sent', 'responded'].includes(quotation?.status || '');
  const canRemind = ['sent', 'responded'].includes(quotation?.status || '');
  const canShare = quotation?.status !== 'draft' && quotation?.status !== 'cancelled';
  const canDelete = quotation?.status === 'draft' || quotation?.status === 'cancelled';

  const canSelectSupplier = useMemo(() => {
    if (!quotation) return false;
    if (!['evaluating', 'closed'].includes(quotation.status)) return false;
    if (!supplierQuotations || supplierQuotations.length === 0) return false;
    return supplierQuotations.some(sq => sq.verification_status === 'verified' && sq.status === 'evaluated');
  }, [quotation, supplierQuotations]);

  const filteredSuppliers = useMemo(() => {
    if (!allSuppliers) return [];
    return allSuppliers.filter(s => !s.is_blacklisted);
  }, [allSuppliers]);

  const estimatedTotal = useMemo(() => {
    if (!quotation?.requisition?.items) return 0;
    return quotation.requisition.items.reduce((sum, item) => {
      const cost = typeof item.total_cost === 'string' ? parseFloat(item.total_cost) : Number(item.total_cost) || 0;
      return sum + cost;
    }, 0);
  }, [quotation]);

  const bestBid = useMemo(() => {
    if (!supplierQuotations || supplierQuotations.length === 0) return 0;
    return supplierQuotations.reduce((min, sq) => {
      const amount = parseFloat(sq.net_amount?.toString() || '0');
      return amount < min ? amount : min;
    }, Infinity);
  }, [supplierQuotations]);

  const hasPendingVerification = useMemo(() => {
    if (!supplierQuotations) return false;
    return supplierQuotations.some(sq => sq.verification_status === 'pending');
  }, [supplierQuotations]);

  // In the main component, before statsItems useMemo
  const statusColorMap: Record<string, 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'teal' | 'indigo' | 'gray' | 'slate'> = {
    draft: 'gray',
    sent: 'blue',
    responded: 'indigo',
    evaluating: 'purple',
    closed: 'emerald',
    cancelled: 'red',
    expired: 'amber',
  };


  // Build stats for StatsCards component
  const statsItems: StatCardItem[] = useMemo(() => {
    const hasBids = bestBid > 0 && (supplierQuotations?.length || 0) > 0;
    const savings = estimatedTotal - bestBid;

    return [
      {
        label: "Status",
        value: getStatusLabel(quotation?.status || 'draft'),
        icon: FileCheck,
        tagLabel: "STATUS",
        tagColor: statusColorMap[quotation?.status || 'draft'] || 'gray',
        subtitle: PROCUREMENT_STATUS_LABELS[procurementStatus] || 'Not Started',
        compact: false,
      },
      {
        label: "Responses",
        value: responseCount,
        icon: Users,
        tagLabel: "RESPONSES",
        tagColor: "indigo",
        subtitle: `${responseRate}% response rate`,
      },
      {
        label: "Best Bid",
        value: bestBid > 0 ? bestBid : 0,
        icon: Crown,
        isCurrency: true,
        tagLabel: "BEST BID",
        tagColor: "amber",
        subtitle: `${supplierQuotations?.length || 0} supplier${(supplierQuotations?.length || 0) > 1 ? 's' : ''}`,
      },
      {
        label: hasBids ? (savings >= 0 ? 'Savings' : 'Over Budget') : 'Budget',
        value: hasBids ? (savings >= 0 ? savings : Math.abs(savings)) : estimatedTotal,
        icon: hasBids ? (savings >= 0 ? TrendingDown : TrendingUp) : Wallet,
        isCurrency: true,
        tagLabel: hasBids ? (savings >= 0 ? "SAVINGS" : "OVER") : "BUDGET",
        tagColor: hasBids ? (savings >= 0 ? "emerald" : "red") : "purple",
        subtitle: hasBids && savings >= 0 ? `${(savings / estimatedTotal * 100).toFixed(1)}% below estimate` :
          hasBids && savings < 0 ? `${(Math.abs(savings) / estimatedTotal * 100).toFixed(1)}% above estimate` :
            `${quotation?.requisition?.items?.length || 0} items`,
      }
    ];
  }, [quotation, responseCount, responseRate, bestBid, supplierQuotations, estimatedTotal, isClosingSoon, isExpired, procurementStatus]);



  if (isLoading) {
    return (
      <PageTemplate title="Request for Quotation" description="Loading RFQ details..." icon={<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />} background="gradient" variant="default">
        <div className="flex items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" /></div>
      </PageTemplate>
    );
  }

  if (!quotation) {
    return (
      <PageTemplate title="Request for Quotation" description="RFQ not found" icon={<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />} background="gradient" variant="default">
        <Alert variant="destructive" className="rounded-2xl bg-white/60 dark:bg-gray-900/80 border border-red-200/50 dark:border-red-800/50 shadow-xl">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-lg text-red-700 dark:text-red-300">RFQ Not Found</AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-400">The Request for Quotation you're looking for doesn't exist or has been removed.</AlertDescription>
        </Alert>
        <Button onClick={handleBack} className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20">
          <ArrowLeft className="h-4 w-4 mr-2" />Back to RFQs
        </Button>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={quotation.qtn_number}
      description={quotation.title}
      icon={<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Request for Quotations', href: '/procurement/request-for-quotations' },
        { label: quotation.qtn_number },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50"><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="sm" onClick={handleBack} className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50"><ArrowLeft className="h-3.5 w-3.5" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-1.5 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl p-1">
              <DropdownMenuLabel className="text-sm font-semibold px-3 py-2 text-gray-700 dark:text-gray-200">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
              {canEdit && <DropdownMenuItem onClick={handleEdit} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300"><Edit className="h-4 w-4 mr-3" />Edit RFQ</DropdownMenuItem>}
              {canSend && <DropdownMenuItem onClick={handleSend} className="text-blue-600 dark:text-blue-400 rounded-xl py-2 px-3"><Send className="h-4 w-4 mr-3" />Send to Suppliers</DropdownMenuItem>}
              {canRemind && <DropdownMenuItem onClick={handleReminder} className="text-amber-600 dark:text-amber-400 rounded-xl py-2 px-3"><Mail className="h-4 w-4 mr-3" />Send Reminder</DropdownMenuItem>}
              {canClose && <DropdownMenuItem onClick={handleClose} className="text-purple-600 dark:text-purple-400 rounded-xl py-2 px-3"><CheckCircle className="h-4 w-4 mr-3" />Close RFQ</DropdownMenuItem>}
              {canCancel && <DropdownMenuItem onClick={handleCancel} className="text-red-600 dark:text-red-400 rounded-xl py-2 px-3"><Ban className="h-4 w-4 mr-3" />Cancel RFQ</DropdownMenuItem>}
              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
              {canShare && (
                <>
                  <DropdownMenuItem onClick={handlePreview} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300"><Eye className="h-4 w-4 mr-3" />Preview PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload} disabled={isDownloading} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300">
                    {isDownloading ? <Loader2 className="h-4 w-4 mr-3 animate-spin" /> : <Download className="h-4 w-4 mr-3" />}
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300"><Mail className="h-4 w-4 mr-3" />Share via Email</DropdownMenuItem>
                </>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400 rounded-xl py-2 px-3"><Trash2 className="h-4 w-4 mr-3" />Delete RFQ</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {/* Stats Cards */}
      <StatsCards
        stats={statsItems}
        isLoading={isLoading}
        tagOrientation='none'
        columns={4}
        variant="default"
        formatCompact={true}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mt-6"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-white/30 dark:bg-gray-900/40 border border-white/20 dark:border-gray-700/50 p-1.5 h-auto rounded-2xl shadow-xl mb-6">
            <TabsTrigger value="overview" className="flex-1 gap-2 data-[state=active]:bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:data-[state=active]:from-blue-500/30 dark:data-[state=active]:to-indigo-500/30 data-[state=active]:shadow-md py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="bids" className="flex-1 gap-2 data-[state=active]:bg-gradient-to-r from-emerald-500/20 to-teal-500/20 dark:data-[state=active]:from-emerald-500/30 dark:data-[state=active]:to-teal-500/30 data-[state=active]:shadow-md py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Bid Comparison</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="flex-1 gap-2 data-[state=active]:bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:data-[state=active]:from-purple-500/30 dark:data-[state=active]:to-pink-500/30 data-[state=active]:shadow-md py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">Item Comparison</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex-1 gap-2 data-[state=active]:bg-gradient-to-r from-indigo-500/20 to-blue-500/20 dark:data-[state=active]:from-indigo-500/30 dark:data-[state=active]:to-blue-500/30 data-[state=active]:shadow-md py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Suppliers ({supplierQuotations?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-2 data-[state=active]:bg-gradient-to-r from-amber-500/20 to-orange-500/20 dark:data-[state=active]:from-amber-500/30 dark:data-[state=active]:to-orange-500/30 data-[state=active]:shadow-md py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Activity History</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {quotation.description && (
                  <Card className="border-0 shadow-xl rounded-2xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/50 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 border border-white/20 dark:border-gray-700/50">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Description</p>
                          <p className="text-base mt-1 text-gray-900 dark:text-white leading-relaxed">{quotation.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {quotation.requisition && (
                  <Card className="border-0 shadow-xl rounded-2xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/50 overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 dark:border-gray-700/30">
                          <p className="text-xs text-muted-foreground">Reference</p>
                          <p className="font-semibold font-mono text-gray-900 dark:text-white">{quotation.requisition.reference_number}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 dark:border-gray-700/30">
                          <p className="text-xs text-muted-foreground">Title</p>
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{quotation.requisition.title}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 dark:border-gray-700/30">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <StatusBadge status={quotation.requisition.status} size="sm" />
                        </div>
                        <div className="p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 dark:border-gray-700/30">
                          <p className="text-xs text-muted-foreground">Total Amount</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(quotation.requisition.total_amount)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 dark:border-gray-700/30">
                          <p className="text-xs text-muted-foreground">Department</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{quotation.requisition.department?.name || 'N/A'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 dark:border-gray-700/30">
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatDate(quotation.requisition.created_at)}</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => router.push(`/requisitions/${quotation.requisition?.id}`)} className="rounded-xl border-white/30 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/50" disabled={!quotation.requisition?.id}>
                        <Eye className="h-4 w-4 mr-2" />View Full Requisition
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {(quotation.delivery_terms || quotation.payment_terms || quotation.special_conditions) && (
                  <Card className="border-0 shadow-xl rounded-2xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/50 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quotation.delivery_terms && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 dark:border-gray-700/30">
                            <Truck className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Delivery Terms</p>
                              <p className="text-sm text-gray-900 dark:text-white">{quotation.delivery_terms}</p>
                            </div>
                          </div>
                        )}
                        {quotation.payment_terms && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 dark:border-gray-700/30">
                            <CreditCard className="h-5 w-5 text-emerald-500 dark:text-emerald-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Payment Terms</p>
                              <p className="text-sm text-gray-900 dark:text-white">{quotation.payment_terms}</p>
                            </div>
                          </div>
                        )}
                        {quotation.special_conditions && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/10 dark:border-gray-700/30 md:col-span-2">
                            <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Special Conditions</p>
                              <p className="text-sm text-gray-900 dark:text-white">{quotation.special_conditions}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-xl rounded-2xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/50 overflow-hidden">
                  <CardContent className="p-6 space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatDate(quotation.created_at)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                      <span className="text-sm text-muted-foreground">Issue Date</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatDate(quotation.issue_date)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                      <span className="text-sm text-muted-foreground">Closing Date</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatDate(quotation.closing_date)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                      <span className="text-sm text-muted-foreground">Reminder Days</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{quotation.reminder_days || 2}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                      <span className="text-sm text-muted-foreground">Automated</span>
                      <Badge className={cn("text-sm", quotation.is_automated ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 dark:text-blue-400 border-0" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-0")}>
                        {quotation.is_automated ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl rounded-2xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/50 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-primary text-base font-semibold">
                          {getInitials(generatedByName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-base text-gray-900 dark:text-white">{generatedByName}</p>
                        <p className="text-sm text-muted-foreground">{getUserEmail(quotation.generated_by)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(canSend || canEdit || canClose || canCancel || canRemind) && (
                  <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-amber-50/40 via-orange-50/30 to-yellow-50/30 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/10 border border-amber-200/30 dark:border-amber-800/30 overflow-hidden">
                    <CardContent className="p-6 space-y-2">
                      {canSend && (
                        <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-11 shadow-lg shadow-blue-600/20" onClick={handleSend}>
                          <Send className="h-4 w-4" />Send to Suppliers
                        </Button>
                      )}
                      {canEdit && (
                        <Button className="w-full gap-2 rounded-xl h-11 border-white/30 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/50" variant="outline" onClick={handleEdit}>
                          <Edit className="h-4 w-4" />Edit RFQ
                        </Button>
                      )}
                      {canRemind && (
                        <Button className="w-full gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl h-11 shadow-lg shadow-amber-600/20" onClick={handleReminder}>
                          <Mail className="h-4 w-4" />Send Reminder
                        </Button>
                      )}
                      {canClose && (
                        <Button className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl h-11 shadow-lg shadow-purple-600/20" onClick={handleClose}>
                          <CheckCircle className="h-4 w-4" />Close RFQ
                        </Button>
                      )}
                      {canCancel && (
                        <Button className="w-full gap-2 rounded-xl h-11 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-600/20" variant="destructive" onClick={handleCancel}>
                          <Ban className="h-4 w-4" />Cancel RFQ
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Bids Tab */}
          <TabsContent value="bids" className="mt-0">
            <BidComparison
              supplierQuotations={supplierQuotations || []}
              isLoading={isLoadingQuotes}
              supplierMap={supplierMap}
              onSelectSupplier={handleSelectSupplier}
              onVerifySupplier={handleVerifySupplier}
              onEvaluateSupplier={handleEvaluateSupplier}
              canSelectSupplier={canSelectSupplier}
              canVerify={canVerify}
              canEvaluate={canEvaluate}
              quotation={quotation}
              estimatedTotal={estimatedTotal}
            />
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="mt-0">
            <ItemComparison
              supplierQuotations={supplierQuotations || []}
              requisitionItems={quotation.requisition?.items || []}
              isLoading={isLoadingQuotes}
              supplierMap={supplierMap}
            />
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="mt-0">
            <Card className="border-0 shadow-xl rounded-2xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Supplier Quotations</p>
                    <p className="text-xs text-muted-foreground">All supplier responses to this RFQ</p>
                  </div>
                  <Badge variant="outline" className="px-3 py-1.5 text-sm border-white/30 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 bg-white/20 dark:bg-gray-800/30">
                    {supplierQuotations?.length || 0} responses
                  </Badge>
                </div>
                {isLoadingQuotes ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                ) : supplierQuotations && supplierQuotations.length > 0 ? (
                  <div className="space-y-3">
                    {supplierQuotations.map((sq: any) => {
                      const amount = parseFloat(sq.net_amount?.toString() || '0');
                      const isLowest = supplierQuotations.reduce((lowest: any, current: any) => {
                        return parseFloat(current.net_amount?.toString() || '0') < parseFloat(lowest.net_amount?.toString() || '0') ? current : lowest;
                      }, supplierQuotations[0])?.id === sq.id;
                      const supplier = supplierMap.get(sq.supplier_id);
                      const supplierName = supplier?.company_name || supplier?.contact_person_name || `Supplier ${sq.supplier_id}`;
                      const isSelected = sq.status === 'accepted';
                      const canVerifyThis = canVerify && sq.verification_status === 'pending';
                      const canEvaluateThis = canEvaluate && sq.verification_status === 'verified' && sq.status === 'submitted';
                      const isRfqSelectable = quotation.status === 'evaluating' || quotation.status === 'closed';
                      const canSelectThis = canSelectSupplier && sq.verification_status === 'verified' && sq.status === 'evaluated' && isRfqSelectable;

                      return (
                        <motion.div
                          key={sq.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 }}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-lg",
                            isLowest && "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/5",
                            isSelected && "border-purple-500/30 bg-purple-500/10 dark:bg-purple-500/5",
                            !isLowest && !isSelected && "border-white/20 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/20 hover:bg-white/20 dark:hover:bg-gray-800/30"
                          )}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <Avatar className="h-10 w-10 border border-white/20 dark:border-gray-700/50">
                              <AvatarFallback className={cn("text-sm font-medium", isLowest ? "bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-white/20 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300")}>
                                {getInitials(supplierName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-base text-gray-900 dark:text-white">{supplierName}</span>
                                {isLowest && (
                                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0">
                                    <Sparkles className="h-3.5 w-3.5 mr-1" />Best Price
                                  </Badge>
                                )}
                                {isSelected && (
                                  <Badge className="bg-purple-500/20 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-0">
                                    <Crown className="h-3.5 w-3.5 mr-1" />Selected
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-sm border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300">{sq.quotation_number}</Badge>
                                <Badge className={cn(
                                  "text-sm border-0",
                                  sq.verification_status === 'verified' ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                    sq.verification_status === 'rejected' ? "bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                                      "bg-amber-500/20 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                )}>
                                  {sq.verification_status_label || 'Pending'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(amount)}
                                </span>
                                <span className="text-sm text-muted-foreground dark:text-gray-400">
                                  {sq.items?.length || 0} items
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {canVerifyThis && (
                              <Button variant="outline" onClick={() => handleVerifySupplier(sq.id)} className="text-blue-600 border-blue-500/30 hover:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30 dark:hover:bg-blue-500/10 rounded-xl">
                                <FileCheck className="h-4 w-4 mr-1.5" />Verify
                              </Button>
                            )}
                            {canEvaluateThis && (
                              <Button variant="outline" onClick={() => handleEvaluateSupplier(sq.id)} className="text-purple-600 border-purple-500/30 hover:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30 dark:hover:bg-purple-500/10 rounded-xl">
                                <Award className="h-4 w-4 mr-1.5" />Evaluate
                              </Button>
                            )}
                            {canSelectThis && (
                              <Button onClick={() => handleSelectSupplier(sq.id)} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-600/20">
                                <Crown className="h-4 w-4 mr-1.5" />Select
                              </Button>
                            )}
                            {isSelected && (
                              <span className="text-base text-purple-600 dark:text-purple-400 font-semibold px-2">✓ Selected</span>
                            )}
                            {!canVerifyThis && !canEvaluateThis && !canSelectThis && !isSelected && (
                              <span className="text-sm text-muted-foreground dark:text-gray-400 px-2">
                                {sq.verification_status === 'rejected' ? 'Rejected' : '—'}
                              </span>
                            )}
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/30">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm mb-5">
                      <Users className="h-10 w-10 text-gray-400 dark:text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Supplier Quotations</h3>
                    <p className="text-gray-500 dark:text-gray-400">No suppliers have responded to this RFQ yet.</p>
                    {canRemind && (
                      <Button className="mt-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-600/20" onClick={handleReminder}>
                        <Mail className="h-4 w-4 mr-2" />Send Reminder
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0">
            <Card className="border-0 shadow-xl rounded-2xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Activity History</p>
                  <Badge variant="outline" className="text-sm border-white/30 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 bg-white/20 dark:bg-gray-800/30">
                    {procurementSummary?.timeline?.length || 0} events
                  </Badge>
                </div>
                {isLoadingProcurement ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                ) : procurementSummary?.timeline && procurementSummary.timeline.length > 0 ? (
                  <ScrollArea className="pr-4 max-h-[600px]">
                    <div className="space-y-0">
                      {procurementSummary.timeline.map((item: any, index: number) => (
                        <TimelineItem
                          key={index}
                          item={{
                            action: item.action,
                            action_label: item.action_label,
                            user: item.user,
                            comment: item.comment,
                            created_at: item.created_at,
                          }}
                          isLast={index === procurementSummary.timeline.length - 1}
                          index={index}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm mb-5">
                      <History className="h-10 w-10 text-gray-400 dark:text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No History Events</h3>
                    <p className="text-gray-500 dark:text-gray-400">No procurement activities have been recorded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Dialogs - NO TAGS */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-900 dark:text-white">Delete RFQ</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Are you sure you want to delete RFQ "{quotation.qtn_number}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl px-6 border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 rounded-xl px-6">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-2xl rounded-2xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Send RFQ to Suppliers</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Select suppliers to send "{quotation.qtn_number}" to.
              {selectedSupplierIds.length > 0 && (
                <span className="block mt-1 text-blue-600 dark:text-blue-400 font-medium">
                  {selectedSupplierIds.length} supplier{selectedSupplierIds.length > 1 ? 's' : ''} selected
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <Label className="text-base text-gray-700 dark:text-gray-300">Select Suppliers</Label>
              <SupplierSelection
                suppliers={filteredSuppliers}
                selectedIds={selectedSupplierIds}
                onToggle={handleToggleSupplier}
                onSelectAll={handleSelectAllSuppliers}
                onDeselectAll={handleDeselectAllSuppliers}
                searchTerm={supplierSearchTerm}
                onSearchChange={setSupplierSearchTerm}
                isLoading={isLoadingSuppliers}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-comment" className="text-base text-gray-700 dark:text-gray-300">Comment (Optional)</Label>
              <Textarea
                id="send-comment"
                placeholder="Add any additional instructions for suppliers..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none bg-white/20 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/50 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)} className="rounded-xl px-6 border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300">Cancel</Button>
            <Button
              onClick={handleConfirmSend}
              disabled={selectedSupplierIds.length === 0 || sendQuotation.isPending}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 px-6 text-white"
            >
              {sendQuotation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Send to {selectedSupplierIds.length} Supplier{selectedSupplierIds.length > 1 ? 's' : ''}</>
              )}
            </Button>
          </DialogFooter>
          {selectedSupplierIds.length === 0 && (
            <p className="text-sm text-amber-500 dark:text-amber-400 text-center -mt-2">
              Please select at least one supplier to send this RFQ.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="rounded-2xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Close RFQ</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">Close "{quotation.qtn_number}" for further responses.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="close-comment" className="text-base text-gray-700 dark:text-gray-300">Closing Notes (Optional)</Label>
              <Textarea
                id="close-comment"
                placeholder="Add any closing notes..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none bg-white/20 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/50 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)} className="rounded-xl px-6 border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300">Cancel</Button>
            <Button onClick={handleConfirmClose} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-6 shadow-lg shadow-purple-600/20 text-white">
              <CheckCircle className="h-4 w-4 mr-2" />Close RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-2xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Cancel RFQ</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">Cancel "{quotation.qtn_number}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason" className="text-base text-gray-700 dark:text-gray-300">Reason for Cancellation <span className="text-red-500">*</span></Label>
              <Textarea
                id="cancel-reason"
                placeholder="Explain why you're cancelling this RFQ..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none bg-white/20 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/50 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="rounded-xl px-6 border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300">Go Back</Button>
            <Button onClick={handleConfirmCancel} disabled={!comment.trim()} variant="destructive" className="rounded-xl px-6">
              Cancel RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="rounded-2xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Send Reminder</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">Send a reminder to suppliers for "{quotation.qtn_number}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-comment" className="text-base text-gray-700 dark:text-gray-300">Reminder Message (Optional)</Label>
              <Textarea
                id="reminder-comment"
                placeholder="Add any additional message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none bg-white/20 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/50 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)} className="rounded-xl px-6 border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300">Cancel</Button>
            <Button onClick={handleConfirmReminder} className="bg-amber-600 hover:bg-amber-700 rounded-xl px-6 shadow-lg shadow-amber-600/20 text-white">
              <Mail className="h-4 w-4 mr-2" />Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="rounded-2xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Share QTN via Email</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">Enter the email address to share this QTN document.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="bg-white/20 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/50 text-gray-900 dark:text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)} className="rounded-xl px-6 border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300">Cancel</Button>
            <Button onClick={handleSendShareEmail} className="rounded-xl px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white">
              <Mail className="h-4 w-4 mr-2" />Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VerifyDialog
        open={showVerifyDialog}
        onOpenChange={setShowVerifyDialog}
        quotation={selectedSupplier}
        onConfirm={handleConfirmVerify}
        isSubmitting={verifyMutation.isPending}
        supplierName={selectedSupplier ? getFullName(supplierMap.get(selectedSupplier.supplier_id)) : ''}
      />

      <EvaluationDialog
        open={showEvaluateDialog}
        onOpenChange={setShowEvaluateDialog}
        quotation={selectedSupplier}
        onConfirm={handleConfirmEvaluate}
        isSubmitting={evaluateMutation.isPending}
        supplierName={selectedSupplier ? getFullName(supplierMap.get(selectedSupplier.supplier_id)) : ''}
      />

      <SelectSupplierDialog
        open={showSelectDialog}
        onOpenChange={setShowSelectDialog}
        supplierQuotation={selectedSupplier}
        onConfirm={handleConfirmSelectSupplier}
        isSubmitting={selectSupplierMutation.isPending}
        supplierName={selectedSupplier ? getFullName(supplierMap.get(selectedSupplier.supplier_id)) : ''}
      />
    </PageTemplate>
  );
}
