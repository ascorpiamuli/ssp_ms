// frontend/src/app/(dashboard)/procurement/approved-quotations/[id]/page.tsx

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Building2,
  DollarSign,
  Package,
  Briefcase,
  Tag,
  Hash,
  UserCheck,
  FileCheck,
  Receipt,
  ShoppingBag,
  Truck,
  Eye,
  Send,
  Plus,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Info,
  Shield,
  Layers,
  Grid3x3,
  Scale,
  History,
  Crown,
  Sparkles,
  Zap,
  Ban,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  ShoppingCart,
  AlertTriangle,
  X,
  BadgeCheck,
  TrendingDown,
  ArrowRight as ArrowRightIcon,
  Save,
  FileArchive,
  HardDrive,
  UserCircle,
  AtSign,
  Calendar as CalendarIcon,
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useToast } from '@/components/ui/toast-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Hooks
import { useSupplierQuotation } from '@/hooks/useSupplierQuotation';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useRequisition } from '@/hooks/useRequisitionQueries';
import { useCreatePurchaseOrder, usePurchaseOrder, usePurchaseOrders } from '@/hooks/usePurchaseOrder';
import { useQuotation } from '@/hooks/useQuotation';

// PDF Hooks
import { useDownloadSupplierQuotationPDF } from '@/hooks/useSupplierQuotation';

// Types
import type { SupplierQuotation } from '@/types/supplierQuotation.types';
import type { PurchaseOrder } from '@/types/purchaseOrder.types';

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const QUOTATION_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: XCircle },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: Clock },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: Send },
  evaluated: { label: 'Evaluated', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: TrendingUp },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700', icon: XCircle },
};

// PO Status config
const PO_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700', icon: FileText },
  issued: { label: 'Issued', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: Send },
  sent: { label: 'Sent', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800', icon: Mail },
  acknowledged: { label: 'Acknowledged', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: Truck },
  partial: { label: 'Partial Delivery', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: XCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700', icon: FileCheck },
};

// Status color map for tags
const statusColorMap: Record<string, 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'teal' | 'indigo' | 'gray' | 'slate'> = {
  accepted: 'emerald',
  rejected: 'red',
  pending: 'amber',
  submitted: 'blue',
  evaluated: 'purple',
  cancelled: 'gray',
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
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(numAmount);
};

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i > 0 ? 2 : 0)} ${units[i]}`;
};

const getSecureUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('https://')) return url;
  let secureUrl = url.replace(/^http:\/\//, 'https://');
  secureUrl = secureUrl.replace(/:\d+\//, '/');
  return secureUrl;
};

const getSecureFileUrl = (upload: any): string | null => {
  if (!upload) return null;
  let url = upload.file_url || upload.url || upload.file_path || null;
  if (!url) return null;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.sspms.internal';
    url = `${baseUrl}/storage/${url}`;
  }
  return getSecureUrl(url);
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getSupplierName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  return supplier.company_name || supplier.full_name || supplier.name || 'Unknown Supplier';
};

const getFullName = (user: any): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'string') return user;
  return user.full_name || user.first_name || user.name || 'Unknown';
};

// Helper to get user name from ID - returns the ID as string if no user object
const getUserName = (userId: number | null | undefined, userMap?: Map<number, any>): string => {
  if (!userId) return 'N/A';
  if (userMap && userMap.has(userId)) {
    const user = userMap.get(userId);
    return getFullName(user);
  }
  return `User #${userId}`;
};

// ============================================
// COMPONENTS
// ============================================

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const StatusBadge = ({ status, size = 'default', className }: StatusBadgeProps) => {
  const config = QUOTATION_STATUS_CONFIG[status] || QUOTATION_STATUS_CONFIG.pending;
  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    default: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4.5 py-2 gap-2.5',
  };

  return (
    <Badge className={cn("flex items-center font-medium rounded-full border", config.color, sizeClasses[size], className)}>
      <Icon className={cn(
        "flex-shrink-0",
        size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
      )} />
      {config.label}
    </Badge>
  );
};

// PO Status Badge Component
interface POStatusBadgeProps {
  status: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const POStatusBadge = ({ status, size = 'default', className }: POStatusBadgeProps) => {
  const config = PO_STATUS_CONFIG[status] || PO_STATUS_CONFIG.draft;
  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    default: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4.5 py-2 gap-2.5',
  };

  return (
    <Badge className={cn("flex items-center font-medium rounded-full border", config.color, sizeClasses[size], className)}>
      <Icon className={cn(
        "flex-shrink-0",
        size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
      )} />
      {config.label}
    </Badge>
  );
};

// ============================================
// UPLOADER INFO COMPONENT
// ============================================

interface UploaderInfoProps {
  upload: any;
}

const UploaderInfo = ({ upload }: UploaderInfoProps) => {
  if (!upload) return null;

  const uploadedByUser = upload.uploaded_by_user;
  const uploadedByName = upload.uploaded_by_name || 'Unknown User';
  const uploadedAt = upload.uploaded_at;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30">
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10 border-2 border-blue-200 dark:border-blue-800">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm font-semibold">
            {uploadedByUser?.full_name ? getInitials(uploadedByUser.full_name) : '?'}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {uploadedByUser?.full_name || uploadedByName}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {uploadedByUser?.email && (
            <span className="flex items-center gap-1">
              <AtSign className="h-3 w-3" />
              {uploadedByUser.email}
            </span>
          )}
          {uploadedByUser?.role_label && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 rounded-full border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              {uploadedByUser.role_label}
            </Badge>
          )}
          {uploadedAt && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {formatDateTime(uploadedAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// PURCHASE ORDER CARD COMPONENT
// ============================================

interface PurchaseOrderCardProps {
  purchaseOrder: PurchaseOrder | null;
  isLoading: boolean;
  onViewPO: (id: number) => void;
  onGeneratePO: () => void;
}

const PurchaseOrderCard = ({ purchaseOrder, isLoading, onViewPO, onGeneratePO }: PurchaseOrderCardProps) => {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
              <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Purchase Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!purchaseOrder) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 group">
        <WrappedCornerTag label="NO PO" color="gray" position="top-left" size="lg" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5 dark:from-gray-500/5 dark:to-slate-500/5 pointer-events-none" />
        <CardHeader className="pb-3 pt-8 relative z-10">
          <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white ml-8">
            <div className="p-2 rounded-xl bg-gradient-to-br from-gray-500/20 to-slate-500/20 dark:from-gray-500/10 dark:to-slate-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
              <ShoppingBag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            Purchase Order
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 text-center py-8">
          <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-4">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">No Purchase Order Generated</p>
          <p className="text-sm text-muted-foreground">A purchase order has not been created for this quotation yet.</p>
          <Button
            className="mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/20 text-white"
            onClick={onGeneratePO}
          >
            <Award className="h-4 w-4 mr-2" />
            Generate PO
          </Button>
        </CardContent>
      </Card>
    );
  }

  const poStatus = purchaseOrder.status || 'draft';
  const poType = purchaseOrder.type || 'lpo';
  const poTypeLabel = poType === 'lpo' ? 'LPO' : 'LSO';
  const totalAmount = purchaseOrder.total_amount || 0;
  const deliveryProgress = purchaseOrder.delivery_progress || 0;
  const isOverdue = purchaseOrder.is_overdue || false;

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 group">
      <WrappedCornerTag label="PO" color="indigo" position="top-left" size="lg" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/5 dark:to-purple-500/5 pointer-events-none" />

      <CardHeader className="pb-3 pt-8 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white ml-8">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
              <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Purchase Order
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewPO(purchaseOrder.id)}
            className="rounded-xl gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">View Full</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* PO Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">PO Number</p>
            <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{purchaseOrder.po_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</p>
            <Badge className={cn(
              "text-sm backdrop-blur-sm border-0 px-3 py-1",
              poType === 'lpo' ? "bg-blue-500/20 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                "bg-purple-500/20 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
            )}>
              {poTypeLabel}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
            <POStatusBadge status={poStatus} size="sm" />
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Amount</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Delivery Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Delivery Progress</span>
            <span className={cn(
              "font-semibold",
              deliveryProgress >= 100 ? "text-emerald-600 dark:text-emerald-400" :
                deliveryProgress >= 50 ? "text-amber-600 dark:text-amber-400" :
                  "text-blue-600 dark:text-blue-400"
            )}>
              {deliveryProgress}%
            </span>
          </div>
          <Progress value={deliveryProgress} className="h-2 bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* PO Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/10 dark:border-gray-700/30">
          {[
            { label: 'Issue Date', value: formatDate(purchaseOrder.issue_date) },
            { label: 'Expected Delivery', value: formatDate(purchaseOrder.expected_delivery_date) },
            {
              label: 'Status',
              value: isOverdue ? '⚠️ Overdue' : 'On Track',
              className: isOverdue ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
            },
            { label: 'Contract', value: purchaseOrder.contract_number || 'N/A' },
          ].map((item, idx) => (
            <div key={idx}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <p className={cn("text-sm font-semibold mt-0.5 text-gray-900 dark:text-white", item.className)}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {(purchaseOrder.issued_at || purchaseOrder.sent_at || purchaseOrder.acknowledged_at || purchaseOrder.completed_at) && (
          <div className="pt-2 border-t border-white/10 dark:border-gray-700/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Timeline</p>
            <div className="flex flex-wrap items-center gap-2">
              {purchaseOrder.issued_at && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="rounded-full text-xs border-blue-500/30 text-blue-600 dark:text-blue-400">
                        <Send className="h-3 w-3 mr-1" />
                        Issued {formatDate(purchaseOrder.issued_at)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Issued at {formatDateTime(purchaseOrder.issued_at)}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {purchaseOrder.sent_at && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="rounded-full text-xs border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                        <Mail className="h-3 w-3 mr-1" />
                        Sent {formatDate(purchaseOrder.sent_at)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Sent at {formatDateTime(purchaseOrder.sent_at)}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {purchaseOrder.acknowledged_at && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="rounded-full text-xs border-purple-500/30 text-purple-600 dark:text-purple-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Acknowledged {formatDate(purchaseOrder.acknowledged_at)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Acknowledged at {formatDateTime(purchaseOrder.acknowledged_at)}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {purchaseOrder.completed_at && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="rounded-full text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed {formatDate(purchaseOrder.completed_at)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Completed at {formatDateTime(purchaseOrder.completed_at)}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}

        {/* Approvals - Using user IDs since the type has number IDs */}
        {(purchaseOrder.generated_by || purchaseOrder.checked_by || purchaseOrder.endorsed_by || purchaseOrder.approved_by) && (
          <div className="pt-2 border-t border-white/10 dark:border-gray-700/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Approvals</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {purchaseOrder.generated_by && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/10 dark:bg-gray-800/30">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Generated</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {getUserName(purchaseOrder.generated_by)}
                    </p>
                  </div>
                </div>
              )}
              {purchaseOrder.checked_by && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/10 dark:bg-gray-800/30">
                  <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Checked</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {getUserName(purchaseOrder.checked_by)}
                    </p>
                  </div>
                </div>
              )}
              {purchaseOrder.endorsed_by && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/10 dark:bg-gray-800/30">
                  <Crown className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Endorsed</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {getUserName(purchaseOrder.endorsed_by)}
                    </p>
                  </div>
                </div>
              )}
              {purchaseOrder.approved_by && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/10 dark:bg-gray-800/30">
                  <Award className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Approved</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {getUserName(purchaseOrder.approved_by)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// LOADING SKELETON
// ============================================

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-96 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  </div>
);

// ============================================
// MAIN PAGE
// ============================================

export default function ApprovedQuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPO, setIsGeneratingPO] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelComment, setCancelComment] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);

  const id = parseInt(params.id as string);

  // Fetch quotation
  const { data: quotation, isLoading, refetch } = useSupplierQuotation(id, { enabled: !!id });
  const quote = quotation as any;

  // Fetch RFQ details
  const quotationRequestId = quote?.quotation_request_id;
  const { data: rfqData, isLoading: rfqLoading } = useQuotation(
    quotationRequestId || 0,
    { enabled: !!quotationRequestId }
  );

  // Fetch supplier data
  const { useSupplier } = useSuppliers();
  const { data: supplierData, isLoading: supplierLoading } = useSupplier(quote?.supplier_id);

  // Fetch requisition
  const requisitionId = rfqData?.requisition_id || quote?.quotation_request?.requisition_id;
  const { data: requisitionData, isLoading: requisitionLoading } = useRequisition(
    requisitionId || 0,
    { enabled: !!requisitionId }
  );

  // Fetch purchase orders for this quotation
  const {
    data: purchaseOrdersData,
    isLoading: isPOLoading,
    refetch: refetchPOs
  } = usePurchaseOrders({
    per_page: 1000,
  });

  // Create PO mutation
  const createPO = useCreatePurchaseOrder();

  // PDF Hooks
  const { mutate: downloadPDF, isPending: isDownloading } = useDownloadSupplierQuotationPDF();

  // ============================================
  // PROCESS DATA
  // ============================================

  const rfq = rfqData as any;
  const req = requisitionData as any;
  const supplier = supplierData || quote?.supplier;
  const upload = quote?.upload || null;
  const hasUpload = !!upload && upload.id;
  const downloadCount = quote?.download_count || 0;
  const secureFileUrl = getSecureFileUrl(upload);

  const supplierName = getSupplierName(supplier);
  const rfqNumber = rfq?.qtn_number || quote?.quotation_request?.qtn_number || 'N/A';
  const requisitionNumber = req?.reference_number || rfq?.requisition?.reference_number || 'N/A';
  const status = quote?.status || 'pending';
  const quotationItems = quote?.items || [];
  const evaluationScore = quote?.evaluation_score ?? quote?.evaluation?.score ?? 0;
  const isLowest = quote?.is_lowest || false;

  const totalAmount = parseFloat(String(quote?.total_amount ?? '0'));
  const netAmount = parseFloat(String(quote?.net_amount ?? '0'));
  const taxAmount = parseFloat(String(quote?.tax_amount ?? '0'));
  const discountAmount = parseFloat(String(quote?.discount_amount ?? '0'));

  const verificationStatus = quote?.verification_status || 'pending';
  const verificationStatusLabel = quote?.verification_status_label || 'Pending';
  const verifiedAt = quote?.verified_at || null;
  const evaluatedAt = quote?.evaluated_at || null;
  const submissionDate = quote?.submission_date || null;
  const validityDate = quote?.validity_date || null;

  // Find the purchase order linked to this quotation
  const purchaseOrder = useMemo(() => {
    const poData = Array.isArray(purchaseOrdersData)
      ? purchaseOrdersData
      : (purchaseOrdersData as any)?.data || [];

    if (Array.isArray(poData)) {
      // Find PO where supplier_quotation_id matches this quotation ID
      const found = poData.find((po: any) => po.supplier_quotation_id === id);
      if (found) return found as PurchaseOrder;

      // Also check if any PO has metadata linking to this quotation
      for (const po of poData) {
        if (po.metadata?.supplier_quotation_id === id) {
          return po as PurchaseOrder;
        }
        if (po.metadata?.quotation_id === id) {
          return po as PurchaseOrder;
        }
      }
    }
    return null;
  }, [purchaseOrdersData, id]);

  const hasPurchaseOrder = !!purchaseOrder;

  // ============================================
  // BUILD STATS FOR STATSCARDS COMPONENT
  // ============================================

  const statsItems: StatCardItem[] = useMemo(() => {
    const poStatus = purchaseOrder?.status || 'draft';

    return [
      {
        label: "Total Amount",
        value: totalAmount,
        icon: DollarSign,
        isCurrency: true,
        tagLabel: "TOTAL",
        tagColor: "emerald",
        subtitle: quote?.currency || 'KES',
      },
      {
        label: "Net Amount",
        value: netAmount,
        icon: Receipt,
        isCurrency: true,
        tagLabel: "NET",
        tagColor: "purple",
        subtitle: "After tax & discount",
      },
      {
        label: "Evaluation Score",
        value: evaluationScore,
        icon: TrendingUp,
        tagLabel: "SCORE",
        tagColor: evaluationScore >= 80 ? "emerald" : evaluationScore >= 50 ? "amber" : "red",
        subtitle: evaluationScore >= 80 ? 'Excellent' : evaluationScore >= 50 ? 'Average' : 'Poor',
        suffix: '%',
        compact: false,
      },
      {
        label: hasPurchaseOrder ? "Purchase Order" : "Downloads",
        value: hasPurchaseOrder ? purchaseOrder?.po_number || 'PO Generated' : downloadCount,
        icon: hasPurchaseOrder ? ShoppingBag : Download,
        tagLabel: hasPurchaseOrder ? "PO GENERATED" : "DOWNLOADS",
        tagColor: hasPurchaseOrder ? "indigo" : "orange",
        subtitle: hasPurchaseOrder
          ? `Status: ${PO_STATUS_CONFIG[poStatus]?.label || poStatus}`
          : downloadCount === 0 ? 'Not downloaded' : `${downloadCount} download${downloadCount > 1 ? 's' : ''}`,
        ...(hasPurchaseOrder ? {
          tagPosition: 'top-left' as const,
          tagOrientation: 'none' as const
        } : {}),
      },
    ];
  }, [totalAmount, netAmount, evaluationScore, downloadCount, quote?.currency, hasPurchaseOrder, purchaseOrder]);

  // ============================================
  // PDF HANDLERS
  // ============================================

  const handleDownloadPDF = useCallback(() => {
    if (!quotation) return;
    downloadPDF({ id: quotation.id });
  }, [quotation, downloadPDF]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleBack = () => router.push('/procurement/approved-quotations');
  const handlePrint = () => window.print();
  const handleRefresh = () => {
    refetch();
    refetchPOs();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGeneratePO = async () => {
    if (!quotation) return;
    setIsGeneratingPO(true);
    try {
      router.push(`/procurement/purchase-orders/create?quotation_id=${quotation.id}&supplier_id=${quotation.supplier_id}&requisition_id=${requisitionId || ''}`);
    } catch (err) {
      toastError('Failed to generate PO');
    } finally {
      setIsGeneratingPO(false);
    }
  };

  const handleViewPO = (poId: number) => {
    router.push(`/procurement/purchase-orders/${poId}`);
  };

  const handleViewRFQ = () => rfq?.id && router.push(`/procurement/request-for-quotations/${rfq.id}`);
  const handleViewRequisition = () => requisitionId && router.push(`/requisitions/${requisitionId}`);
  const handleViewSupplier = () => quotation?.supplier_id && router.push(`/procurement/suppliers/${quotation.supplier_id}`);

  const handleCancelAward = () => {
    if (hasPurchaseOrder) {
      toastError('Cannot cancel award - Purchase Order has already been generated');
      return;
    }
    setShowCancelDialog(true);
    setCancelComment('');
  };

  const handleConfirmCancel = () => {
    success(`Award cancelled for ${quotation?.quotation_number}`);
    setShowCancelDialog(false);
    refetch();
    refetchPOs();
  };

  // ============================================
  // RENDER
  // ============================================

  if (isLoading || rfqLoading || supplierLoading || requisitionLoading || isPOLoading) {
    return (
      <PageTemplate
        title="Approved Quotation"
        description="Loading quotation details..."
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Approved Quotations', href: '/procurement/approved-quotations' },
          { label: 'Quotation Details' },
        ]}
      >
        <LoadingSkeleton />
      </PageTemplate>
    );
  }

  if (!quotation) {
    return (
      <PageTemplate
        title="Not Found"
        description="The quotation you're looking for doesn't exist."
        icon={<AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Approved Quotations', href: '/procurement/approved-quotations' },
          { label: 'Not Found' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-gray-900 relative">
          <WrappedCornerTag label="ERROR" color="red" position="top-left" size="lg" />
          <CardContent className="py-16 pt-8 text-center">
            <div className="inline-flex p-6 bg-red-50 dark:bg-red-950/30 rounded-full mb-4">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Quotation Not Found</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              The quotation with ID #{id} could not be found or has been removed.
            </p>
            <Button onClick={handleBack} className="mt-6 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const statusLabel = QUOTATION_STATUS_CONFIG[status]?.label || status;
  const statusColor = statusColorMap[status] || 'gray';

  return (
    <PageTemplate
      title={quotation.quotation_number || 'Quotation Details'}
      description="Complete details of the approved supplier quotation"
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Approved Quotations', href: '/procurement/approved-quotations' },
        { label: quotation.quotation_number || 'Details' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleBack} className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm">
            <Printer className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-1.5 h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/20 text-white">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl p-1">
              <DropdownMenuLabel className="text-sm font-semibold px-3 py-2 text-gray-700 dark:text-gray-200">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
              {!hasPurchaseOrder && (
                <DropdownMenuItem onClick={handleGeneratePO} className="text-emerald-600 dark:text-emerald-400 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                  <Award className="h-4 w-4 mr-3" />Generate PO
                </DropdownMenuItem>
              )}
              {hasPurchaseOrder && (
                <DropdownMenuItem onClick={() => handleViewPO(purchaseOrder.id)} className="text-indigo-600 dark:text-indigo-400 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                  <ShoppingBag className="h-4 w-4 mr-3" />View PO
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleViewRFQ} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                <FileCheck className="h-4 w-4 mr-3" />View RFQ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewRequisition} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                <ShoppingCart className="h-4 w-4 mr-3" />View Requisition
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewSupplier} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                <Building2 className="h-4 w-4 mr-3" />View Supplier
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
              <DropdownMenuItem onClick={handleDownloadPDF} disabled={isDownloading} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                {isDownloading ? <Loader2 className="h-4 w-4 mr-3 animate-spin" /> : <Download className="h-4 w-4 mr-3" />}
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
              <DropdownMenuItem
                onClick={handleCancelAward}
                className={cn(
                  "rounded-xl py-2 px-3",
                  hasPurchaseOrder
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-red-600 dark:text-red-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                )}
                disabled={hasPurchaseOrder}
              >
                <XCircle className="h-4 w-4 mr-3" />Cancel Award
                {hasPurchaseOrder && <span className="text-[10px] ml-1 text-gray-400">(PO exists)</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Alert Banner - PO Generated */}
        {hasPurchaseOrder && (
          <Alert className="rounded-2xl backdrop-blur-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 shadow-xl relative">

            <div className="pt-4">
              <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <AlertTitle className="text-indigo-700 dark:text-indigo-300">
                Purchase Order Generated
              </AlertTitle>
              <AlertDescription className="text-indigo-600 dark:text-indigo-400">
                A purchase order <strong>{purchaseOrder?.po_number}</strong> has been generated for this quotation.
                Status: <strong>{PO_STATUS_CONFIG[purchaseOrder?.status || 'draft']?.label || purchaseOrder?.status}</strong>
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Alert Banner - Lowest Price */}
        {isLowest && (
          <Alert className="rounded-2xl backdrop-blur-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 shadow-xl relative">

            <div className="pt-4">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle className="text-emerald-700 dark:text-emerald-300">Lowest Price Quotation</AlertTitle>
              <AlertDescription className="text-emerald-600 dark:text-emerald-400">
                This quotation has the lowest price among all suppliers for this RFQ.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Stats Cards - Using the flexible component */}
        <StatsCards
          stats={statsItems}
          isLoading={isLoading}
          columns={4}
          variant="default"
          formatCompact={true}
          tagOrientation="none"
          tagPosition="top-left"
        />

        {/* Tabs - Premium Glassmorphic Design */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full backdrop-blur-xl bg-white/20 dark:bg-gray-900/30 border border-white/10 dark:border-gray-700/30 p-1.5 h-auto rounded-2xl shadow-2xl shadow-black/5 dark:shadow-black/20">
            <TabsTrigger
              value="overview"
              className="flex-1 gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-white/60 data-[state=active]:to-white/40 dark:data-[state=active]:from-gray-800/60 dark:data-[state=active]:to-gray-800/40 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/10 data-[state=active]:backdrop-blur-xl py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white hover:bg-white/10 dark:hover:bg-gray-800/20"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  activeTab === 'overview' ? "bg-blue-500/20 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                )}>
                  <Info className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline font-medium">Overview</span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="items"
              className="flex-1 gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-white/60 data-[state=active]:to-white/40 dark:data-[state=active]:from-gray-800/60 dark:data-[state=active]:to-gray-800/40 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/10 data-[state=active]:backdrop-blur-xl py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white hover:bg-white/10 dark:hover:bg-gray-800/20"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  activeTab === 'items' ? "bg-purple-500/20 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"
                )}>
                  <Package className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline font-medium">Items</span>
                <Badge className={cn(
                  "ml-1 text-[10px] px-2 py-0.5 rounded-full border-0 transition-all duration-300",
                  activeTab === 'items' ? "bg-purple-500/20 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" : "bg-gray-200/50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
                )}>
                  {quotationItems.length}
                </Badge>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="requisition"
              className="flex-1 gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-white/60 data-[state=active]:to-white/40 dark:data-[state=active]:from-gray-800/60 dark:data-[state=active]:to-gray-800/40 data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/10 data-[state=active]:backdrop-blur-xl py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white hover:bg-white/10 dark:hover:bg-gray-800/20"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  activeTab === 'requisition' ? "bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"
                )}>
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline font-medium">Requisition</span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="supplier"
              className="flex-1 gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-white/60 data-[state=active]:to-white/40 dark:data-[state=active]:from-gray-800/60 dark:data-[state=active]:to-gray-800/40 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/10 data-[state=active]:backdrop-blur-xl py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white hover:bg-white/10 dark:hover:bg-gray-800/20"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  activeTab === 'supplier' ? "bg-cyan-500/20 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" : "text-gray-400 dark:text-gray-500"
                )}>
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline font-medium">Supplier</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* ============================================
              OVERVIEW TAB
              ============================================ */}
          <TabsContent value="overview" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Quotation Details Card */}
                <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 group">
                  <WrappedCornerTag label="DETAILS" color="blue" position="top-left" size="lg" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/5 dark:to-purple-500/5 pointer-events-none" />
                  <CardHeader className="pb-3 pt-8 relative z-10">
                    <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white ml-8">
                      Quotation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Quotation Number', value: quotation.quotation_number, className: 'font-mono' },
                        { label: 'Status', value: <StatusBadge status={status} size="sm" /> },
                        { label: 'Currency', value: quote?.currency || 'KES' },
                        { label: 'Submission Date', value: formatDate(submissionDate) },
                        { label: 'Validity Date', value: formatDate(validityDate) },
                        { label: 'Submission Method', value: quote?.submission_method_label || 'System' },
                        { label: 'Total Amount', value: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAmount)}</span> },
                        { label: 'Net Amount', value: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(netAmount)}</span> },
                        { label: 'Total Downloads', value: <span className="font-bold text-orange-600 dark:text-orange-400">{downloadCount}</span> },
                        {
                          label: 'Verification',
                          value: (
                            <Badge className={cn(
                              "text-sm backdrop-blur-sm border-0 px-3 py-1",
                              verificationStatus === 'verified' ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                verificationStatus === 'rejected' ? "bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                                  "bg-amber-500/20 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                            )}>
                              {verificationStatusLabel}
                            </Badge>
                          )
                        },
                        // Add Purchase Order info if exists
                        ...(hasPurchaseOrder ? [
                          {
                            label: 'Purchase Order',
                            value: (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto text-indigo-600 dark:text-indigo-400 font-mono font-bold"
                                  onClick={() => handleViewPO(purchaseOrder.id)}
                                >
                                  {purchaseOrder.po_number}
                                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                                </Button>
                              </div>
                            ),
                            className: 'col-span-2'
                          },
                        ] : []),
                      ].map((item, idx) => (
                        <div key={idx} className={item.className}>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                          <div className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase Order Card */}
                <PurchaseOrderCard
                  purchaseOrder={purchaseOrder}
                  isLoading={isPOLoading}
                  onViewPO={handleViewPO}
                  onGeneratePO={handleGeneratePO}
                />

                {/* PDF Upload Information Card */}
                {hasUpload && (
                  <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 group">
                    <WrappedCornerTag label="Document" color="amber" position="top-left" size="lg" />
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/5 dark:to-orange-500/5 pointer-events-none" />
                    <CardHeader className="pb-3 pt-8 relative z-10">
                      <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white ml-8">
                        PDF Upload Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-4">
                      <UploaderInfo upload={upload} />
                      <Separator className="bg-white/10 dark:bg-gray-700/30" />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { label: 'File Name', value: upload.original_name || 'N/A', className: 'col-span-2 font-mono text-xs' },
                          { label: 'File Size', value: upload.formatted_size || formatFileSize(upload.file_size || 0) },
                          { label: 'File Type', value: upload.mime_type || 'N/A' },
                          { label: 'Extension', value: upload.extension || 'N/A' },
                          {
                            label: 'Status',
                            value: (
                              <Badge className={cn(
                                "text-xs backdrop-blur-sm border-0 px-2.5 py-0.5",
                                upload.status === 'completed' ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                  "bg-amber-500/20 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                              )}>
                                {upload.status || 'N/A'}
                              </Badge>
                            )
                          },
                          {
                            label: 'Download Count',
                            value: upload.meta_data?.download_count ?? downloadCount,
                            className: 'font-bold text-orange-600 dark:text-orange-400'
                          },
                        ].map((item, idx) => (
                          <div key={idx} className={item.className}>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                            <div className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{item.value}</div>
                          </div>
                        ))}
                      </div>
                      {secureFileUrl && (
                        <div className="mt-3 pt-3 border-t border-white/10 dark:border-gray-700/30">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <a href={secureFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium truncate flex items-center gap-1 group">
                                <span className="truncate">{upload.original_name || 'View PDF'}</span>
                                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              <p className="text-xs text-muted-foreground">Click to preview in new tab</p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl hover:bg-blue-500/10 gap-2" onClick={() => window.open(secureFileUrl, '_blank')}>
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">Preview</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-blue-500/10" onClick={() => handleCopy(secureFileUrl)}>
                              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Additional Information */}
                {(quote?.payment_terms || quote?.delivery_terms || quote?.warranty_terms || quote?.notes) && (
                  <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 group">

                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/5 dark:to-orange-500/5 pointer-events-none" />
                    <CardHeader className="pb-3 pt-8 relative z-10">
                      <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quote?.payment_terms && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Terms</p>
                              <p className="text-sm text-gray-900 dark:text-white mt-0.5">{quote.payment_terms}</p>
                            </div>
                          </div>
                        )}
                        {quote?.delivery_terms && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                            <Truck className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery Terms</p>
                              <p className="text-sm text-gray-900 dark:text-white mt-0.5">{quote.delivery_terms}</p>
                            </div>
                          </div>
                        )}
                        {quote?.warranty_terms && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                            <Shield className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Warranty Terms</p>
                              <p className="text-sm text-gray-900 dark:text-white mt-0.5">{quote.warranty_terms}</p>
                            </div>
                          </div>
                        )}
                        {quote?.notes && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30 md:col-span-2">
                            <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</p>
                              <p className="text-sm text-gray-900 dark:text-white mt-0.5">{quote.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 group">
                  <WrappedCornerTag label="SUMMARY" color="slate" position="top-left" size="lg" />
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5 dark:from-slate-500/5 dark:to-gray-500/5 pointer-events-none" />
                  <CardHeader className="pb-3 pt-8 relative z-10">
                    <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white ml-8">
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-2">
                    {[
                      { label: 'Total Amount', value: formatCurrency(totalAmount), highlight: true, color: 'text-emerald-600 dark:text-emerald-400' },
                      { label: 'Net Amount', value: formatCurrency(netAmount), highlight: true, color: 'text-emerald-600 dark:text-emerald-400' },
                      ...(taxAmount > 0 ? [{ label: 'Tax', value: formatCurrency(taxAmount) }] : []),
                      ...(discountAmount > 0 ? [{ label: 'Discount', value: `-${formatCurrency(discountAmount)}`, color: 'text-emerald-600 dark:text-emerald-400' }] : []),
                      { label: 'Items', value: quotationItems.length },
                      { label: 'Total Downloads', value: downloadCount, color: 'text-orange-600 dark:text-orange-400' },
                      {
                        label: 'Evaluation Score',
                        value: `${evaluationScore}%`,
                        color: evaluationScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                          evaluationScore >= 50 ? 'text-amber-600 dark:text-amber-400' :
                            'text-red-600 dark:text-red-400'
                      },
                      {
                        label: 'Verification',
                        value: (
                          <Badge className={cn(
                            "text-sm backdrop-blur-sm border-0 px-3 py-1",
                            verificationStatus === 'verified' ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                              verificationStatus === 'rejected' ? "bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                                "bg-amber-500/20 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          )}>
                            {verificationStatusLabel}
                          </Badge>
                        )
                      },
                      // Add PO status if exists
                      ...(hasPurchaseOrder ? [
                        {
                          label: 'PO Status',
                          value: <POStatusBadge status={purchaseOrder.status || 'draft'} size="sm" />,
                        },
                        {
                          label: 'PO Number',
                          value: (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-indigo-600 dark:text-indigo-400 font-mono font-bold"
                              onClick={() => handleViewPO(purchaseOrder.id)}
                            >
                              {purchaseOrder.po_number}
                              <ExternalLink className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          ),
                        },
                      ] : []),
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-white/10 dark:border-gray-700/30 last:border-0">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className={cn("text-sm font-semibold text-gray-900 dark:text-white", item.color)}>{item.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ============================================
              ITEMS TAB
              ============================================ */}
          <TabsContent value="items" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
            <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300">
              <WrappedCornerTag label="ITEMS" color="purple" position="top-left" size="lg" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/5 dark:to-pink-500/5 pointer-events-none" />
              <CardHeader className="pb-3 pt-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white ml-8">
                      Quotation Items
                    </CardTitle>
                    <CardDescription className="mt-1 text-muted-foreground">
                      {quotationItems.length} item{quotationItems.length > 1 ? 's' : ''} quoted
                    </CardDescription>
                  </div>
                  <Badge className="px-4 py-2 text-sm border-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 backdrop-blur-sm shadow-lg">
                    Total: {formatCurrency(netAmount)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                {quotationItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-4">
                      <Package className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">No items found</p>
                    <p className="text-sm text-muted-foreground">This quotation has no items listed.</p>
                  </div>
                ) : (
                  <div className="border border-white/10 dark:border-gray-700/30 rounded-2xl overflow-hidden">
                    <TableComponent>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/20 backdrop-blur-sm">
                          <TableHead className="py-3.5 w-12 text-center font-semibold text-muted-foreground">#</TableHead>
                          <TableHead className="py-3.5 font-semibold text-muted-foreground">Item Name</TableHead>
                          <TableHead className="py-3.5 text-right font-semibold text-muted-foreground">Quantity</TableHead>
                          <TableHead className="py-3.5 text-right font-semibold text-muted-foreground">Unit Price</TableHead>
                          <TableHead className="py-3.5 text-right font-semibold text-muted-foreground">Total</TableHead>
                          <TableHead className="py-3.5 text-center font-semibold text-muted-foreground">Delivery</TableHead>
                          <TableHead className="py-3.5 text-center font-semibold text-muted-foreground">Warranty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quotationItems.map((item: any, index: number) => (
                          <TableRow key={item.id} className="hover:bg-white/5 dark:hover:bg-gray-800/20 backdrop-blur-sm transition-colors group">
                            <TableCell className="py-3 text-center font-mono text-xs text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="py-3">
                              <p className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {item.item_name}
                              </p>
                              {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                              {item.brand && <p className="text-xs text-muted-foreground">Brand: {item.brand}</p>}
                            </TableCell>
                            <TableCell className="py-3 text-right font-medium">
                              {item.formatted_quantity || item.quantity}
                              {item.unit_of_measure && <span className="text-xs text-muted-foreground ml-1">{item.unit_of_measure}</span>}
                            </TableCell>
                            <TableCell className="py-3 text-right font-medium">{formatCurrency(item.unit_price)}</TableCell>
                            <TableCell className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(item.total_price)}
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              {item.delivery_days ? (
                                <Badge variant="outline" className="rounded-full text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                                  {item.delivery_days} days
                                </Badge>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              {item.warranty_months ? (
                                <Badge variant="outline" className="rounded-full text-xs border-blue-500/30 text-blue-600 dark:text-blue-400">
                                  {item.warranty_months} mo
                                </Badge>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableComponent>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================
              REQUISITION TAB
              ============================================ */}
          <TabsContent value="requisition" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
            {requisitionData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Requisition Details */}
                <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300">

                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/5 dark:to-teal-500/5 pointer-events-none" />
                  <CardHeader className="pb-3 pt-8 relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                          <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Requisition Details
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={handleViewRequisition} className="rounded-xl gap-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200">
                        <ExternalLink className="h-4 w-4" />
                        <span className="hidden sm:inline">View Full</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Requisition Number', value: requisitionNumber, className: 'font-mono' },
                        {
                          label: 'Status',
                          value: (
                            <Badge className={cn(
                              "text-sm backdrop-blur-sm border-0 px-3 py-1",
                              req?.status === 'final_approved' ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                "bg-blue-500/20 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            )}>
                              {req?.status_label || req?.status || 'N/A'}
                            </Badge>
                          )
                        },
                        { label: 'Title', value: req?.title || 'N/A' },
                        { label: 'Type', value: req?.type_label || req?.type || 'N/A' },
                        { label: 'Department', value: req?.department?.name || 'N/A' },
                        { label: 'Total Amount', value: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(req?.total_amount)}</span> },
                        { label: 'Priority', value: req?.priority_label || req?.priority || 'N/A' },
                        { label: 'Is Emergency', value: (req as any)?.is_emergency ? 'Yes' : 'No' },
                        { label: 'Created At', value: formatDateTime(req?.created_at), className: 'col-span-2' },
                      ].map((item, idx) => (
                        <div key={idx} className={item.className}>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                          <div className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Approval Timeline */}
                <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300">

                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/5 dark:to-orange-500/5 pointer-events-none" />
                  <CardHeader className="pb-3 pt-8 relative z-10">
                    <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      Approval Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-4">
                    {req?.submitted_at && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <Send className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">Submitted</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(req?.submitted_at)}</p>
                        </div>
                      </div>
                    )}
                    {req?.hod_approved_at && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">HOD Approved</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(req?.hod_approved_at)}</p>
                        </div>
                      </div>
                    )}
                    {req?.accountant_approved_at && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">Accountant Approved</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(req?.accountant_approved_at)}</p>
                        </div>
                      </div>
                    )}
                    {req?.principal_approved_at && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">Principal Approved</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(req?.principal_approved_at)}</p>
                        </div>
                      </div>
                    )}
                    {req?.final_approved_at && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/30 dark:border-emerald-800/30">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Award className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-emerald-600 dark:text-emerald-400">Final Approved</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(req?.final_approved_at)}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✅ Ready for procurement</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Requisition Items */}
                {req?.items && req.items.length > 0 && (
                  <Card className="lg:col-span-2 relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300">

                    <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5 dark:from-slate-500/5 dark:to-gray-500/5 pointer-events-none" />
                    <CardHeader className="pb-3 pt-8 relative z-10">
                      <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-slate-500/20 to-gray-500/20 dark:from-slate-500/10 dark:to-gray-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                          <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        Requisition Items ({req.items.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="border border-white/10 dark:border-gray-700/30 rounded-2xl overflow-hidden">
                        <TableComponent>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/20 backdrop-blur-sm">
                              <TableHead className="py-3 font-semibold text-muted-foreground">Item</TableHead>
                              <TableHead className="py-3 text-right font-semibold text-muted-foreground">Quantity</TableHead>
                              <TableHead className="py-3 text-right font-semibold text-muted-foreground">Unit</TableHead>
                              <TableHead className="py-3 text-right font-semibold text-muted-foreground">Est. Cost</TableHead>
                              <TableHead className="py-3 text-right font-semibold text-muted-foreground">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {req.items.map((item: any) => (
                              <TableRow key={item.id} className="hover:bg-white/5 dark:hover:bg-gray-800/20 backdrop-blur-sm transition-colors">
                                <TableCell className="py-3">
                                  <p className="font-medium text-gray-900 dark:text-white">{item.item_name}</p>
                                  {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                                </TableCell>
                                <TableCell className="py-3 text-right font-medium">{item.quantity}</TableCell>
                                <TableCell className="py-3 text-right text-muted-foreground">{item.unit_of_measure || '—'}</TableCell>
                                <TableCell className="py-3 text-right">{formatCurrency(item.estimated_cost)}</TableCell>
                                <TableCell className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(item.total_cost || item.estimated_cost * item.quantity)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </TableComponent>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 relative">
                <WrappedCornerTag label="NOT FOUND" color="red" position="top-left" size="lg" />
                <CardContent className="py-16 pt-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-4">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">Requisition Not Found</p>
                  <p className="text-sm text-muted-foreground">The requisition for this quotation could not be loaded.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ============================================
              SUPPLIER TAB
              ============================================ */}
          <TabsContent value="supplier" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
            {supplier ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Supplier Profile */}
                  <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300">

                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/5 dark:to-blue-500/5 pointer-events-none" />
                    <CardHeader className="pb-3 pt-8 relative z-10">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/10 dark:to-blue-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                            <Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          Supplier Profile
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex items-start gap-4 mb-6">
                        {(supplier as any)?.company_logo_url ? (
                          <Avatar className="h-16 w-16 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                            <AvatarImage src={(supplier as any).company_logo_url} alt={supplierName} />
                            <AvatarFallback className="text-lg font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                              {getInitials(supplierName)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-16 w-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg">
                            <AvatarFallback className="text-white text-lg font-medium">
                              {getInitials(supplierName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{supplierName}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {(supplier as any)?.category_label && (
                              <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-700 dark:from-cyan-500/20 dark:to-blue-500/20 dark:text-cyan-300 rounded-full border-0">
                                {(supplier as any).category_label}
                              </Badge>
                            )}
                            {(supplier as any)?.status_label && (
                              <Badge className={cn(
                                "rounded-full border-0",
                                (supplier as any).status === 'ACTIVE' ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                  "bg-gray-500/20 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400"
                              )}>
                                {(supplier as any).status_label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Company Name', value: (supplier as any)?.company_name || supplierName },
                          { label: 'Email', value: (supplier as any)?.company_email || (supplier as any)?.email || 'N/A' },
                          { label: 'Phone', value: (supplier as any)?.company_phone || (supplier as any)?.phone || 'N/A' },
                          { label: 'Website', value: (supplier as any)?.company_website || 'N/A' },
                          { label: 'Address', value: (supplier as any)?.company_address || 'N/A', className: 'col-span-2' },
                          { label: 'Registration Number', value: (supplier as any)?.company_registration || 'N/A' },
                          { label: 'Tax ID', value: (supplier as any)?.tax_id || 'N/A' },
                        ].map((item, idx) => (
                          <div key={idx} className={item.className}>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                            <div className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Banking Details */}
                  {((supplier as any)?.bank_name || (supplier as any)?.bank_account) && (
                    <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300">

                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/5 dark:to-teal-500/5 pointer-events-none" />
                      <CardHeader className="pb-3 pt-8 relative z-10">
                        <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                            <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          Banking Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Bank Name', value: (supplier as any)?.bank_name || 'N/A' },
                            { label: 'Branch', value: (supplier as any)?.bank_branch || 'N/A' },
                            { label: 'Account Number', value: (supplier as any)?.bank_account || 'N/A', className: 'font-mono' },
                            { label: 'Preferred Currency', value: (supplier as any)?.preferred_currency || 'KES' },
                          ].map((item, idx) => (
                            <div key={idx}>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                              <div className={cn("text-sm font-semibold mt-0.5 text-gray-900 dark:text-white", item.className)}>{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Contact Person */}
                  {(supplier as any)?.contact_person_name && (
                    <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300">

                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/5 dark:to-pink-500/5 pointer-events-none" />
                      <CardHeader className="pb-3 pt-8 relative z-10">
                        <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          Contact Person
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            { label: 'Name', value: (supplier as any)?.contact_person_name },
                            { label: 'Email', value: (supplier as any)?.contact_person_email || 'N/A' },
                            { label: 'Phone', value: (supplier as any)?.contact_person_phone || 'N/A' },
                          ].map((item, idx) => (
                            <div key={idx}>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                              <div className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 relative">
                <WrappedCornerTag label="NOT FOUND" color="red" position="top-left" size="lg" />
                <CardContent className="py-16 pt-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-4">
                    <Building2 className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">Supplier Not Found</p>
                  <p className="text-sm text-muted-foreground">The supplier for this quotation could not be loaded.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Share via Email Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl relative">
          <HorizontalCornerTag label="SHARE" color="blue" position="top-left" size="sm" variant="rounded" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Share Quotation via Email</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Enter the email address to share this quotation PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="share-email" className="text-base text-gray-700 dark:text-gray-300">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="share-email"
                type="email"
                placeholder="recipient@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="rounded-xl backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)} className="rounded-xl px-6 border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm">Cancel</Button>
            <Button onClick={() => setShowShareDialog(false)} className="rounded-xl px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white">
              <Send className="h-4 w-4 mr-2" />Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Award Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl relative">
          <HorizontalCornerTag label="CANCEL" color="red" position="top-left" size="sm" variant="rounded" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Cancel Award</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Are you sure you want to cancel the award for {quotation?.quotation_number}?
              This will revert the status and the supplier will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason" className="text-base text-gray-700 dark:text-gray-300">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Explain why you're cancelling this award..."
                value={cancelComment}
                onChange={(e) => setCancelComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="rounded-xl px-6 border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm">Go Back</Button>
            <Button onClick={handleConfirmCancel} disabled={!cancelComment.trim()} variant="destructive" className="rounded-xl px-6">
              Cancel Award
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
