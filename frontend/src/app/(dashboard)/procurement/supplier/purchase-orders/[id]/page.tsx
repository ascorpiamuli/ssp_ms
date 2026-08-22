// frontend/src/app/(dashboard)/procurement/supplier/purchase-orders/[id]/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
  FileCheck,
  ShoppingCart,
  Package,
  Truck,
  Calendar,
  DollarSign,
  Tag,
  Hash,
  ThumbsUp,
  Handshake,
  Printer,
  Download,
  Info,
  Briefcase,
  Shield,
  User,
  Mail,
  Phone,
  Store,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Users,
  CreditCard,
  Receipt,
  ClipboardCheck,
  ListChecks,
  Globe,
  MapPin,
  Building,
  UserCheck,
  UserX,
  Zap,
  Star,
  Crown,
  Gem,
  Sparkles,
  Rocket,
  Send,
  Layers,
  Box,
  Coins,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Flag,
  Timer,
  CalendarDays,
  Hourglass,
  Clipboard,
  FileSpreadsheet,
  List,
  Grid,
  Bell,
  BellRing,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  CircleCheck,
  CircleAlert,
  CircleX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { usePurchaseOrder, useAcknowledgePurchaseOrder, useDownloadPurchaseOrderPdf } from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

// Types
import type { PurchaseOrder } from '@/types/purchaseOrder.types';

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try { return format(new Date(date), 'dd MMM yyyy'); } catch { return 'Invalid Date'; }
};

const formatDateTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try { return format(new Date(date), 'dd MMM yyyy HH:mm'); } catch { return 'Invalid Date'; }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount == null) return 'KES 0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'KES 0.00';
  return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getUserDisplayName = (user: any): string => {
  if (!user) return 'Pending';
  if (typeof user === 'string') return user;
  if (typeof user === 'object') {
    return user.full_name || user.first_name || user.name || 'Unknown';
  }
  return 'Unknown';
};

const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string; color: string; bg: string; icon: any; border: string }> = {
    draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-50', icon: FileText, border: 'border-gray-200' },
    issued: { label: 'Issued', color: 'text-blue-600', bg: 'bg-blue-50', icon: Send, border: 'border-blue-200' },
    sent: { label: 'Awaiting Acknowledgment', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock, border: 'border-amber-200' },
    acknowledged: { label: 'Acknowledged', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle, border: 'border-emerald-200' },
    delivered: { label: 'Delivered', color: 'text-blue-600', bg: 'bg-blue-50', icon: Truck, border: 'border-blue-200' },
    partial: { label: 'Partial', color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock, border: 'border-orange-200' },
    completed: { label: 'Completed', color: 'text-teal-600', bg: 'bg-teal-50', icon: FileCheck, border: 'border-teal-200' },
    cancelled: { label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-50', icon: XCircle, border: 'border-gray-200' },
    closed: { label: 'Closed', color: 'text-gray-600', bg: 'bg-gray-50', icon: FileCheck, border: 'border-gray-200' },
  };
  return config[status] || config.draft;
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status, size = 'default' }: { status: string; size?: 'sm' | 'default' | 'lg' }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    default: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-5 py-2 gap-2.5',
  };

  return (
    <Badge className={cn("flex items-center font-medium rounded-full border", config.bg, config.color, config.border, sizeClasses[size])}>
      <Icon className={cn("flex-shrink-0", size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} />
      {config.label}
    </Badge>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const config = {
    lpo: { label: 'LPO (Goods)', color: 'border-blue-200 text-blue-600 bg-blue-50' },
    lso: { label: 'LSO (Services)', color: 'border-purple-200 text-purple-600 bg-purple-50' },
  };
  const typeConfig = config[type as keyof typeof config] || config.lpo;
  return (
    <Badge variant="outline" className={cn("rounded-full", typeConfig.color)}>
      {typeConfig.label}
    </Badge>
  );
};

// ============================================
// ITEMS TABLE
// ============================================

const ItemsTable = ({ items, isLoading }: { items: any[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No items found</p>
      </div>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <ScrollArea className="w-full max-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 dark:bg-gray-800/50 sticky top-0 z-10">
              <TableHead className="w-[50px] text-xs font-semibold uppercase tracking-wider">#</TableHead>
              <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider">Item</TableHead>
              <TableHead className="text-center w-[80px] text-xs font-semibold uppercase tracking-wider">Qty</TableHead>
              <TableHead className="text-center w-[100px] text-xs font-semibold uppercase tracking-wider">UOM</TableHead>
              <TableHead className="text-right w-[140px] text-xs font-semibold uppercase tracking-wider">Unit Price</TableHead>
              <TableHead className="text-right w-[140px] text-xs font-semibold uppercase tracking-wider">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any, index: number) => (
              <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                <TableCell className="font-mono text-sm text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.item_name}
                    </p>
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    {item.specifications && <p className="text-xs text-muted-foreground">Spec: {item.specifications}</p>}
                    {item.warranty_months && (
                      <Badge variant="outline" className="text-xs mt-1 border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
                        {item.warranty_months}m warranty
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {item.unit_of_measure || 'Unit'}
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(item.unit_price)}</TableCell>
                <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 transition-colors">
                  {formatCurrency(item.total_price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-emerald-50/50 dark:bg-emerald-950/20">
              <TableCell colSpan={5} className="text-right font-bold text-lg">Total Amount</TableCell>
              <TableCell className="text-right font-bold text-lg text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalAmount)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </div>
  );
};

// ============================================
// ACKNOWLEDGE DIALOG
// ============================================

const AcknowledgeDialog = ({
  open,
  onOpenChange,
  po,
  onConfirm,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  po: PurchaseOrder | null;
  onConfirm: (comment?: string) => void;
  isSubmitting: boolean;
}) => {
  const [comment, setComment] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl border-0">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
              <Handshake className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Acknowledge Purchase Order</DialogTitle>
              <DialogDescription className="text-sm">
                You are about to acknowledge <strong className="text-foreground">{po?.po_number}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="acknowledge-comment" className="text-sm font-medium">Comment (Optional)</Label>
          <Textarea
            id="acknowledge-comment"
            placeholder="Add any comments or notes..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="rounded-xl resize-none mt-2 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={() => onConfirm(comment || undefined)} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-lg shadow-emerald-600/20">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
            Acknowledge PO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// ALERT COMPONENTS
// ============================================

const StatusAlert = ({
  icon: Icon,
  title,
  description,
  variant = 'info',
  action,
}: {
  icon: any;
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  action?: React.ReactNode;
}) => {
  const variants = {
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20',
    success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20',
    warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
    neutral: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30',
  };

  const iconVariants = {
    info: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40',
    error: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40',
    neutral: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/40',
  };

  return (
    <Alert className={cn("border-2 rounded-xl shadow-sm", variants[variant])}>
      <div className="flex items-start gap-4">
        <div className={cn("p-2 rounded-xl flex-shrink-0", iconVariants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <AlertTitle className="font-semibold text-base">{title}</AlertTitle>
          <AlertDescription className="text-sm mt-0.5">{description}</AlertDescription>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </Alert>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function SupplierPurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [showAcknowledgeDialog, setShowAcknowledgeDialog] = useState(false);

  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { useSupplierProfileExists } = useSuppliers();
  const { exists: hasSupplierProfile, supplier, isLoading: supplierLoading } = useSupplierProfileExists();

  const { data: po, isLoading: poLoading, refetch, isFetching } = usePurchaseOrder(id, { enabled: !!id });
  const acknowledgeMutation = useAcknowledgePurchaseOrder();
  const downloadMutation = useDownloadPurchaseOrderPdf();

  const supplierId = useMemo(() => {
    if (!supplier) return undefined;
    return (supplier as any)?.id as number | undefined;
  }, [supplier]);

  const isSupplierOrder = useMemo(() => {
    if (!po || !supplierId) return false;
    return po.supplier_id === supplierId;
  }, [po, supplierId]);

  const canAcknowledge = useMemo(() => {
    if (!po) return false;
    return po.status === 'sent' && isSupplierOrder;
  }, [po, isSupplierOrder]);

  const isLoading = authLoading || supplierLoading || poLoading;

  const handleBack = () => router.back();
  const handleRefresh = () => refetch();

  const handleAcknowledge = (comment?: string) => {
    if (!po || !supplierId) return;
    acknowledgeMutation.mutate({ id: po.id, supplierId });
  };

  const handleDownloadPDF = () => {
    if (!po) return;
    downloadMutation.download(po.id);
  };

  const handlePrint = () => window.print();

  const isOverdue = po?.is_overdue || false;
  const status = po?.status || 'draft';
  const daysRemaining = po?.expected_delivery_date
    ? differenceInDays(new Date(po.expected_delivery_date), new Date())
    : 0;

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate
        title="Purchase Order"
        description="Loading..."
        icon={<FileText className="h-5 w-5 text-emerald-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'Order History', href: '/procurement/supplier/order-history' },
          { label: 'Loading...' },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </PageTemplate>
    );
  }

  // Authentication checks
  if (!isAuthenticated) {
    return (
      <PageTemplate
        title="Purchase Order"
        description="Please login to continue"
        icon={<FileText className="h-5 w-5 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[{ label: 'Procurement', href: '/procurement' }, { label: 'Supplier', href: '/procurement/supplier' }, { label: 'Order History', href: '/procurement/supplier/order-history' }, { label: 'Details' }]}
      >
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Please Login</h3>
            <p className="text-muted-foreground">You need to be logged in to view purchase order details.</p>
            <Button onClick={() => router.push('/login')} className="mt-4 rounded-xl">Login</Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (!hasSupplierProfile) {
    return (
      <PageTemplate
        title="Purchase Order"
        description="Supplier profile required"
        icon={<FileText className="h-5 w-5 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[{ label: 'Procurement', href: '/procurement' }, { label: 'Supplier', href: '/procurement/supplier' }, { label: 'Order History', href: '/procurement/supplier/order-history' }, { label: 'Details' }]}
      >
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="text-center py-12">
            <Store className="h-16 w-16 mx-auto text-amber-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">Supplier Profile Required</h3>
            <p className="text-muted-foreground">Please complete your supplier profile to view purchase order details.</p>
            <Button variant="default" size="sm" className="mt-4 rounded-xl" onClick={() => router.push('/procurement/supplier/profile')}>
              <Building2 className="h-4 w-4 mr-2" /> Complete Profile
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (!po) {
    return (
      <PageTemplate
        title="Purchase Order"
        description="Not found"
        icon={<FileText className="h-5 w-5 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[{ label: 'Procurement', href: '/procurement' }, { label: 'Supplier', href: '/procurement/supplier' }, { label: 'Order History', href: '/procurement/supplier/order-history' }, { label: 'Not Found' }]}
      >
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Purchase Order Not Found</h3>
            <p className="text-muted-foreground">The purchase order you're looking for doesn't exist.</p>
            <Button onClick={handleBack} className="mt-4 rounded-xl"><ArrowLeft className="h-4 w-4 mr-2" /> Go Back</Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (!isSupplierOrder) {
    return (
      <PageTemplate
        title="Purchase Order"
        description="Access restricted"
        icon={<FileText className="h-5 w-5 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[{ label: 'Procurement', href: '/procurement' }, { label: 'Supplier', href: '/procurement/supplier' }, { label: 'Order History', href: '/procurement/supplier/order-history' }, { label: 'Restricted' }]}
      >
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">You don't have permission to view this purchase order.</p>
            <Button onClick={handleBack} className="mt-4 rounded-xl"><ArrowLeft className="h-4 w-4 mr-2" /> Go Back</Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={po.po_number}
      description={po.title || 'Purchase Order Details'}
      icon={<FileText className="h-5 w-5 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier', href: '/procurement/supplier' },
        { label: 'Order History', href: '/procurement/supplier/order-history' },
        { label: po.po_number || 'Details' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching} className="gap-1.5 h-9 rounded-xl">
                  <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {canAcknowledge && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" onClick={() => setShowAcknowledgeDialog(true)} className="gap-2 h-9 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/30">
                    <ThumbsUp className="h-4 w-4" /> Acknowledge
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Acknowledge this purchase order</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={downloadMutation.isDownloading} className="gap-1.5 h-9 rounded-xl">
                  {downloadMutation.isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 h-9 rounded-xl">
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 h-9 rounded-xl">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go Back</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Alerts Section */}
        <div className="space-y-3">
          {/* Overdue Alert */}
          {isOverdue && status === 'sent' && (
            <StatusAlert
              icon={AlertCircle}
              title="Overdue - Action Required"
              description="This purchase order is overdue. Please acknowledge it immediately to avoid further delays and potential penalties."
              variant="error"
              action={
                <Button size="sm" onClick={() => setShowAcknowledgeDialog(true)} className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-600/20">
                  <ThumbsUp className="h-4 w-4 mr-2" /> Acknowledge Now
                </Button>
              }
            />
          )}

          {/* Pending Acknowledgment Alert */}
          {status === 'sent' && !isOverdue && (
            <StatusAlert
              icon={BellRing}
              title="Awaiting Your Acknowledgment"
              description={`You have ${daysRemaining > 0 ? `${daysRemaining} days` : 'less than a day'} to acknowledge this purchase order. Please review and confirm acceptance.`}
              variant="warning"
              action={
                <Button size="sm" onClick={() => setShowAcknowledgeDialog(true)} className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg shadow-amber-600/20">
                  <ThumbsUp className="h-4 w-4 mr-2" /> Acknowledge Now
                </Button>
              }
            />
          )}

          {/* Acknowledged Alert */}
          {status === 'acknowledged' && (
            <StatusAlert
              icon={CheckCircle}
              title="Purchase Order Acknowledged"
              description="You have successfully acknowledged this purchase order. Please prepare for delivery as per the specifications and timeline."
              variant="success"
            />
          )}

          {/* Completed Alert */}
          {status === 'completed' && (
            <StatusAlert
              icon={FileCheck}
              title="Purchase Order Completed"
              description="This purchase order has been fully completed and closed. Thank you for your service and professionalism."
              variant="success"
            />
          )}

          {/* Cancelled Alert */}
          {status === 'cancelled' && (
            <StatusAlert
              icon={XCircle}
              title="Purchase Order Cancelled"
              description="This purchase order has been cancelled. No further action is required from your side."
              variant="neutral"
            />
          )}

          {/* Delivery Alert */}
          {status === 'delivered' && (
            <StatusAlert
              icon={Truck}
              title="Order Delivered"
              description="This purchase order has been marked as delivered. The procurement team will review and complete the order."
              variant="info"
            />
          )}

          {/* Partial Delivery Alert */}
          {status === 'partial' && (
            <StatusAlert
              icon={Clock}
              title="Partial Delivery"
              description="Only part of this order has been delivered. Please ensure the remaining items are delivered as soon as possible."
              variant="warning"
            />
          )}
        </div>

        {/* Header Card - Premium Design */}
        <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/90 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          <CardContent className="p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/25">
                  {po.type === 'lpo' ? (
                    <ShoppingCart className="h-8 w-8 text-white" />
                  ) : (
                    <Briefcase className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {po.po_number}
                    </h1>
                    <StatusBadge status={status} size="sm" />
                    <TypeBadge type={po.type || 'lpo'} />
                    {isOverdue && status === 'sent' && (
                      <Badge className="bg-red-100 text-red-700 border-red-200 rounded-full px-3 py-1 animate-pulse">
                        <AlertCircle className="h-3.5 w-3.5 mr-1.5" /> Overdue
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-medium text-muted-foreground mt-1">{po.title || 'N/A'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Hash className="h-4 w-4" /> {po.requisition?.reference_number || 'N/A'}
                    </span>
                    <span className="w-px h-4 bg-border" />
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" /> Issued: {formatDate(po.issue_date)}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Progress Bar */}
            <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Delivery Progress</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{po.delivery_progress || 0}%</span>
              </div>
              <div className="relative">
                <Progress value={po.delivery_progress || 0} className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500" />
                <div className="absolute -top-1 right-0 text-xs text-muted-foreground">
                  {po.delivery_progress === 100 ? '✅ Complete' : ''}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - Premium Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Amount', value: formatCurrency(po.total_amount), icon: DollarSign, color: 'emerald' },
            { label: 'Items', value: po.items?.length || 0, icon: Package, color: 'blue' },
            { label: 'Delivery Progress', value: `${po.delivery_progress || 0}%`, icon: Truck, color: 'purple' },
            { label: 'Status', value: <StatusBadge status={status} size="sm" />, icon: Shield, color: 'amber' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                stat.color === 'emerald' ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20" :
                  stat.color === 'blue' ? "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20" :
                    stat.color === 'purple' ? "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20" :
                      "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20"
              )}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                    </div>
                    <div className={cn(
                      "p-2.5 rounded-xl flex-shrink-0 ml-3",
                      stat.color === 'emerald' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                        stat.color === 'blue' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                          stat.color === 'purple' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                            "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    )}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  {[
                    ['PO Number', po.po_number],
                    ['Type', <TypeBadge key="type" type={po.type || 'lpo'} />],
                    ['Status', <StatusBadge key="status" status={status} size="sm" />],
                    ['Currency', po.currency || 'KES'],
                    ['Issue Date', formatDate(po.issue_date)],
                    ['Expected Delivery', formatDate(po.expected_delivery_date)],
                    ['Requisition', po.requisition?.reference_number || 'N/A'],
                    ['Validity Period', `${po.validity_period_days || 30} days`],
                  ].map(([label, value], idx) => (
                    <div key={idx} className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium text-right">{value}</span>
                    </div>
                  ))}
                  {po.acknowledged_at && (
                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800 col-span-2">
                      <span className="text-sm text-muted-foreground">Acknowledged At</span>
                      <span className="text-sm font-medium">{formatDateTime(po.acknowledged_at)}</span>
                    </div>
                  )}
                  {po.sent_at && (
                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800 col-span-2">
                      <span className="text-sm text-muted-foreground">Sent At</span>
                      <span className="text-sm font-medium">{formatDateTime(po.sent_at)}</span>
                    </div>
                  )}
                  {po.completed_at && (
                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800 col-span-2">
                      <span className="text-sm text-muted-foreground">Completed At</span>
                      <span className="text-sm font-medium">{formatDateTime(po.completed_at)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Items
                  </CardTitle>
                </div>
                <CardDescription>{po.items?.length || 0} items in this purchase order</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ItemsTable items={po.items || []} isLoading={poLoading} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <ListChecks className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-0">
                {[
                  ['Total Amount', <span key="total" className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(po.total_amount)}</span>],
                  ['Items', po.items?.length || 0],
                  ['Status', <StatusBadge key="status" status={status} size="sm" />],
                  ['Delivery Progress', `${po.delivery_progress || 0}%`],
                  ['Type', <TypeBadge key="type" type={po.type || 'lpo'} />],
                ].map(([label, value], idx) => (
                  <div key={idx} className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-right">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {canAcknowledge && (
                  <Button className="w-full justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/20" onClick={() => setShowAcknowledgeDialog(true)}>
                    <ThumbsUp className="h-4 w-4" /> Acknowledge PO
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-center gap-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors" onClick={handleDownloadPDF} disabled={downloadMutation.isDownloading}>
                  {downloadMutation.isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download PDF
                </Button>
                <Button variant="outline" className="w-full justify-center gap-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors" onClick={handlePrint}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button variant="outline" className="w-full justify-center gap-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors" onClick={handleRefresh} disabled={isFetching}>
                  <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} /> Refresh
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-900/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Generated: <span className="font-medium text-foreground">{formatDateTime(po.created_at)}</span></span>
                </div>
                <div className="hidden sm:block w-px h-5 bg-border" />
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated: <span className="font-medium text-foreground">{formatDateTime(po.updated_at)}</span></span>
                </div>
              </div>
              {po.download_count !== undefined && (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Downloads: <span className="font-medium text-foreground">{po.download_count}</span></span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Acknowledge Dialog */}
        <AcknowledgeDialog
          open={showAcknowledgeDialog}
          onOpenChange={setShowAcknowledgeDialog}
          po={po}
          onConfirm={handleAcknowledge}
          isSubmitting={acknowledgeMutation.isPending}
        />
      </div>
    </PageTemplate>
  );
}
