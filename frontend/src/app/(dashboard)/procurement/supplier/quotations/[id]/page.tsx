// frontend/src/app/(dashboard)/procurement/supplier/quotations/[id]/page.tsx

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  Send,
  Ban,
  FileCheck,
  Loader2,
  Calendar,
  DollarSign,
  Package,
  Shield,
  CheckCircle2,
  Scale,
  Crown,
  Zap,
  Tag,
  Timer,
  Printer,
  Download,
  Share2,
  MessageSquare,
  Info,
  ListChecks,
  Mail as MailIcon,
  Phone,
  Copy,
  TrendingUp,
  TrendingDown,
  Truck,
  Hash,
  ExternalLink,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast-context';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierQuotation } from '@/hooks/useSupplierQuotation';
import { useDownloadSupplierQuotationPDF } from '@/hooks/useSupplierQuotation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
import type { SupplierQuotation, SupplierQuotationItem } from '@/types/supplierQuotation.types';

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try { return format(new Date(date), 'dd MMM yyyy'); } catch { return 'Invalid Date'; }
};

const formatDateFull = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try { return format(new Date(date), 'EEEE, dd MMMM yyyy'); } catch { return 'Invalid Date'; }
};

const formatDateTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try { return format(new Date(date), 'dd MMM yyyy HH:mm'); } catch { return 'Invalid Date'; }
};

const formatTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try { return format(new Date(date), 'HH:mm'); } catch { return 'Invalid Date'; }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount == null) return '0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pending', submitted: 'Submitted', evaluated: 'Evaluated',
    accepted: 'Accepted', rejected: 'Rejected', cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

const getStatusIcon = (status: string): any => {
  const icons: Record<string, any> = {
    pending: Clock, submitted: Send, evaluated: FileCheck,
    accepted: CheckCircle, rejected: XCircle, cancelled: Ban,
  };
  return icons[status] || Clock;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    evaluated: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  };
  return colors[status] || colors.pending;
};

const getVerificationLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pending Verification', verified: 'Verified', rejected: 'Verification Failed',
  };
  return labels[status] || status;
};

const getVerificationColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || colors.pending;
};

const getVerificationIcon = (status: string): any => {
  const icons: Record<string, any> = {
    pending: Clock, verified: CheckCircle2, rejected: XCircle,
  };
  return icons[status] || Clock;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ============================================
// COMPONENTS - Badges
// ============================================

const StatusBadge = ({ status, size = 'default' }: { status: string; size?: 'sm' | 'default' | 'lg' }) => {
  const Icon = getStatusIcon(status);
  const colorClass = getStatusColor(status);
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    default: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-5 py-2 gap-2.5',
  };

  return (
    <Badge className={cn("flex items-center font-medium rounded-full border-0", colorClass, sizeClasses[size])}>
      <Icon className={cn("flex-shrink-0", size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} />
      {getStatusLabel(status)}
    </Badge>
  );
};

const VerificationBadge = ({ status, size = 'default' }: { status: string; size?: 'sm' | 'default' }) => {
  const Icon = getVerificationIcon(status);
  const colorClass = getVerificationColor(status);
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    default: 'text-sm px-3.5 py-1.5 gap-1.5',
  };

  return (
    <Badge variant="outline" className={cn("flex items-center rounded-full", colorClass, sizeClasses[size])}>
      <Icon className={cn("flex-shrink-0", size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {getVerificationLabel(status)}
    </Badge>
  );
};

// ============================================
// COMPONENTS - Info Chip
// ============================================

const InfoChip = ({ icon: Icon, label, value, subValue }: { icon: any; label: string; value: React.ReactNode; subValue?: string }) => (
  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:shadow-sm">
    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </p>
    <p className="text-sm font-medium mt-1">{value}</p>
    {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
  </div>
);

// ============================================
// COMPONENTS - Detail Row
// ============================================

const DetailRow = ({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) => (
  <div className={cn("flex justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0", className)}>
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-right">{value}</span>
  </div>
);

// ============================================
// COMPONENTS - Items Table (Scrollable)
// ============================================

const ItemsTable = ({ items, isRejected = false }: { items: SupplierQuotationItem[]; isRejected?: boolean }) => {
  if (!items?.length) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800/30 rounded-full mb-4">
          <Package className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground">No items in this quotation</p>
      </div>
    );
  }

  const totals = items.reduce(
    (acc, item) => ({
      total: acc.total + (parseFloat(item.total_price as any) || 0),
      tax: acc.tax + (parseFloat(item.tax_amount as any) || 0),
      discount: acc.discount + (parseFloat(item.discount_amount as any) || 0),
      net: acc.net + (parseFloat(item.net_price as any) || 0),
    }),
    { total: 0, tax: 0, discount: 0, net: 0 }
  );

  return (
    <div className={cn(
      "rounded-xl overflow-hidden border transition-all duration-300",
      isRejected ? "border-red-200/50 dark:border-red-800/50 opacity-70" : "border-gray-200 dark:border-gray-700",
      "hover:shadow-md"
    )}>
      <ScrollArea className="w-full max-h-[500px]">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
              <TableHead className="w-[50px] py-3.5 text-xs font-semibold uppercase tracking-wider">#</TableHead>
              <TableHead className="min-w-[200px] py-3.5 text-xs font-semibold uppercase tracking-wider">Item</TableHead>
              <TableHead className="text-right py-3.5 text-xs font-semibold uppercase tracking-wider">Qty</TableHead>
              <TableHead className="text-right py-3.5 text-xs font-semibold uppercase tracking-wider">Unit Price</TableHead>
              <TableHead className="text-right py-3.5 text-xs font-semibold uppercase tracking-wider">Tax</TableHead>
              <TableHead className="text-right py-3.5 text-xs font-semibold uppercase tracking-wider">Discount</TableHead>
              <TableHead className="text-right py-3.5 text-xs font-semibold uppercase tracking-wider">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200 group"
              >
                <TableCell className="font-mono text-sm text-muted-foreground py-3.5">
                  {idx + 1}
                </TableCell>
                <TableCell className="py-3.5">
                  <div className={cn(isRejected && "line-through")}>
                    <p className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.item_name}
                    </p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground truncate max-w-[300px] mt-0.5">
                        {item.description}
                      </p>
                    )}
                    {item.brand && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-medium">Brand:</span> {item.brand} {item.model && `• ${item.model}`}
                      </p>
                    )}
                    {item.is_alternative && (
                      <Badge variant="outline" className="text-xs mt-1 border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400">
                        Alternative
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className={cn("text-right py-3.5", isRejected && "line-through")}>
                  <div className="text-sm font-medium">
                    {item.quantity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.unit_of_measure || 'Units'}
                  </div>
                </TableCell>
                <TableCell className={cn("text-right py-3.5", isRejected && "line-through")}>
                  <div className="text-sm font-medium">
                    KES {formatCurrency(item.unit_price)}
                  </div>
                </TableCell>
                <TableCell className="text-right py-3.5">
                  <div className={cn("flex flex-col", isRejected && "line-through")}>
                    <span className="text-sm">
                      {item.tax_rate || 0}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      KES {formatCurrency(item.tax_amount)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-3.5">
                  <div className={cn("flex flex-col", isRejected && "line-through")}>
                    <span className="text-sm">
                      {item.discount_rate || 0}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      KES {formatCurrency(item.discount_amount)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={cn(
                  "text-right py-3.5 font-bold transition-colors duration-200",
                  isRejected ? "line-through text-muted-foreground" : "text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300"
                )}>
                  <div>
                    KES {formatCurrency(item.total_price)}
                  </div>
                  {item.delivery_days && (
                    <div className="text-xs text-muted-foreground font-normal flex items-center justify-end gap-1">
                      <Truck className="h-3 w-3" />
                      {item.delivery_days} days
                    </div>
                  )}
                  {item.warranty_months && (
                    <div className="text-xs text-muted-foreground font-normal">
                      {item.warranty_months} months warranty
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
              <TableCell colSpan={4} className="text-right font-medium py-3">
                Subtotal
              </TableCell>
              <TableCell colSpan={2} className="text-right font-medium py-3">
                KES {formatCurrency(totals.total)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
              <TableCell colSpan={4} className="text-right font-medium text-muted-foreground py-3">
                Tax
              </TableCell>
              <TableCell colSpan={2} className="text-right font-medium py-3">
                KES {formatCurrency(totals.tax)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
              <TableCell colSpan={4} className="text-right font-medium text-muted-foreground py-3">
                Discount
              </TableCell>
              <TableCell colSpan={2} className="text-right font-medium text-red-500 dark:text-red-400 py-3">
                -KES {formatCurrency(totals.discount)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <TableCell colSpan={4} className="text-right font-bold py-3.5 text-base">
                Total
              </TableCell>
              <TableCell colSpan={2} className={cn(
                "text-right font-bold py-3.5 text-base",
                isRejected ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"
              )}>
                KES {formatCurrency(totals.net)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </div>
  );
};

// ============================================
// COMPONENTS - Stat Card
// ============================================

const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  color = 'blue'
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'teal';
}) => {
  const colorMap = {
    emerald: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50',
    blue: 'from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50',
    purple: 'from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50',
    amber: 'from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200/50',
    rose: 'from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20 border-rose-200/50',
    teal: 'from-teal-50 to-teal-100/50 dark:from-teal-950/30 dark:to-teal-900/20 border-teal-200/50',
  };

  const iconColorMap = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
  };

  return (
    <Card className={cn(
      "border shadow-sm hover:shadow-md transition-all duration-200",
      "bg-gradient-to-br",
      colorMap[color]
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {value}
            </p>
            {subValue && (
              <p className="text-xs text-muted-foreground">
                {subValue}
              </p>
            )}
          </div>
          <div className={cn(
            "p-2.5 rounded-xl flex-shrink-0 ml-3",
            iconColorMap[color]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function SupplierQuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { success } = useToast();

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { useSupplierProfileExists } = useSuppliers();
  const { supplier } = useSupplierProfileExists();

  const { data: quotationData, isLoading, error, refetch } = useSupplierQuotation(parseInt(id), {
    enabled: !!id && !isNaN(parseInt(id)),
  });

  const quotation = quotationData as any;
  const { mutate: downloadPDF, isPending: isDownloading } = useDownloadSupplierQuotationPDF();

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => router.push('/procurement/supplier/quotations');
  const handleRefresh = () => { refetch(); setIsAnimating(true); setTimeout(() => setIsAnimating(false), 500); };
  const handleDownloadPDF = () => downloadPDF({ id: parseInt(id), filename: `${quotation?.quotation_number || 'quotation'}.pdf` });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/procurement/supplier/quotations/${id}`);
    success('Link copied to clipboard');
    setShowShareDialog(false);
  };

  const isRejected = quotation?.status === 'rejected' || quotation?.status === 'cancelled';
  const isAccepted = quotation?.status === 'accepted';
  const isPending = quotation?.status === 'pending' || quotation?.status === 'submitted';
  const totalItems = quotation?.items?.length || 0;
  const isValid = quotation?.is_valid;
  const isLowest = quotation?.is_lowest;
  const evalScore = quotation?.evaluation?.score || 0;
  const evalNotes = quotation?.evaluation?.notes;
  const evalDate = quotation?.evaluation?.evaluated_at;
  const evalBy = quotation?.evaluation?.evaluated_by;

  const validityStatus = useMemo(() => {
    if (!quotation?.validity_date) return { text: 'No expiry', color: 'text-muted-foreground' };
    const days = differenceInDays(new Date(quotation.validity_date), new Date());
    if (days < 0) return { text: 'Expired', color: 'text-red-500' };
    if (days < 7) return { text: `${days} days remaining`, color: 'text-amber-500' };
    return { text: `${days} days remaining`, color: 'text-emerald-500' };
  }, [quotation]);

  if (isLoading) {
    return (
      <PageTemplate
        title="Quotation Details"
        description="Loading quotation information..."
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        background="gradient"
        variant="full"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'My Quotations', href: '/procurement/supplier/quotations' },
          { label: 'Details' },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </PageTemplate>
    );
  }

  if (error || !quotation) {
    return (
      <PageTemplate
        title="Quotation Details"
        description="Error loading quotation"
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        background="gradient"
        variant="full"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'My Quotations', href: '/procurement/supplier/quotations' },
          { label: 'Details' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 rounded-lg">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        }
      >
        <Card className="border shadow-sm rounded-xl">
          <CardContent className="text-center py-16">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Failed to Load Quotation</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                The quotation could not be loaded. Please try again or go back to the quotations list.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleBack} className="gap-2 rounded-lg">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleRefresh} className="gap-2 rounded-lg">
                  <RefreshCw className="h-4 w-4" /> Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Quotation ${quotation.quotation_number}`}
      description={`Submitted on ${formatDateFull(quotation.submission_date)}`}
      icon={<FileText className="h-5 w-5 text-blue-600" />}
      background="gradient"
      variant="full"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier', href: '/procurement/supplier' },
        { label: 'My Quotations', href: '/procurement/supplier/quotations' },
        { label: quotation.quotation_number || 'Details' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleBack} className="gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go back to quotations</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200">
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download as PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)} className="gap-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share quotation</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                  <RefreshCw className={cn("h-4 w-4", isAnimating && "animate-spin")} /> Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print quotation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
    >
      <div className={cn(
        "space-y-6 transition-all duration-500",
        isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}>
        {/* Alerts */}
        {isRejected && (
          <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 rounded-xl animate-in slide-in-from-top-4 duration-300">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-300 font-semibold ml-3">Quotation Not Selected</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400 ml-3">
              This quotation was not selected by procurement.
              {evalScore > 0 && <span className="block mt-1 font-medium">Evaluation Score: {evalScore}%</span>}
              {evalNotes && <span className="block mt-1 text-sm">{evalNotes}</span>}
            </AlertDescription>
          </Alert>
        )}

        {isAccepted && (
          <Alert className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl animate-in slide-in-from-top-4 duration-300">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <AlertTitle className="text-emerald-800 dark:text-emerald-300 font-semibold ml-3">Quotation Accepted</AlertTitle>
            <AlertDescription className="text-emerald-700 dark:text-emerald-400 ml-3">
              Your quotation has been accepted by procurement.
              {isLowest && <span className="block mt-1 font-medium">You submitted the lowest bid.</span>}
              {evalScore > 0 && <span className="block mt-1 font-medium">Evaluation Score: {evalScore}%</span>}
            </AlertDescription>
          </Alert>
        )}

        {isPending && (
          <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 rounded-xl animate-in slide-in-from-top-4 duration-300">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold ml-3">Under Review</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400 ml-3">
              Your quotation is being reviewed by procurement. You will be notified once a decision is made.
            </AlertDescription>
          </Alert>
        )}

        {/* Header Card */}
        <Card className="border shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {quotation.quotation_number}
                    </h2>
                    <StatusBadge status={quotation.status} size="sm" />
                    <VerificationBadge status={quotation.verification_status} size="sm" />
                    {isLowest && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 rounded-full px-3 py-1 shadow-lg shadow-amber-500/25">
                        <Crown className="h-3.5 w-3.5 mr-1.5" /> Lowest Bid
                      </Badge>
                    )}
                    {isValid && !isRejected && (
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400 rounded-full px-3 py-1 bg-emerald-50/50 dark:bg-emerald-950/20">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Valid
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      RFQ: {quotation.quotation_request?.qtn_number || 'N/A'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="truncate max-w-[400px]">{quotation.quotation_request?.title || 'No title'}</span>
                  </div>
                  {quotation.supplier_reference_no && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      Supplier Ref: {quotation.supplier_reference_no}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-5" />

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <InfoChip
                icon={Calendar}
                label="Submitted"
                value={formatDate(quotation.submission_date)}
                subValue={formatTime(quotation.submission_date)}
              />
              <InfoChip
                icon={Timer}
                label="Validity"
                value={<span className={cn(validityStatus.color)}>{validityStatus.text}</span>}
                subValue={formatDate(quotation.validity_date)}
              />
              <InfoChip
                icon={Scale}
                label="Evaluation"
                value={evalScore > 0 ? `${evalScore}%` : 'Not evaluated'}
                subValue={evalScore > 0 ? (evalScore >= 80 ? 'Excellent' : evalScore >= 60 ? 'Good' : 'Needs Work') : 'Pending'}
              />
              <InfoChip
                icon={Package}
                label="Items"
                value={totalItems}
                subValue={`${totalItems} item${totalItems > 1 ? 's' : ''}`}
              />
              <InfoChip
                icon={Shield}
                label="Verification"
                value={getVerificationLabel(quotation.verification_status)}
                subValue={quotation.verification_status}
              />
              <InfoChip
                icon={Send}
                label="Submission"
                value={quotation.submission_method_label || 'System'}
                subValue="Method"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            label="Total Amount"
            value={`KES ${formatCurrency(quotation.total_amount)}`}
            subValue={`Net: KES ${formatCurrency(quotation.net_amount)}`}
            color="emerald"
          />
          <StatCard
            icon={Package}
            label="Items"
            value={totalItems}
            subValue={`${totalItems} item${totalItems > 1 ? 's' : ''}`}
            color="blue"
          />
          <StatCard
            icon={Scale}
            label="Evaluation Score"
            value={evalScore > 0 ? `${evalScore}%` : 'Pending'}
            subValue={evalScore > 0 ? (evalScore >= 80 ? 'Excellent' : evalScore >= 60 ? 'Good' : 'Needs Work') : 'Not evaluated'}
            color="purple"
          />
          <StatCard
            icon={Calendar}
            label="Validity"
            value={quotation.validity_date ? formatDate(quotation.validity_date) : 'N/A'}
            subValue={isValid ? 'Valid' : 'Expired'}
            color={isValid ? 'teal' : 'rose'}
          />
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quotation Details */}
            <Card className="border shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Quotation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-8">
                  <DetailRow label="Quotation Number" value={quotation.quotation_number} />
                  <DetailRow label="RFQ Number" value={quotation.quotation_request?.qtn_number || 'N/A'} />
                  <DetailRow label="RFQ Title" value={quotation.quotation_request?.title || 'N/A'} />
                  <DetailRow label="Status" value={<StatusBadge status={quotation.status} size="sm" />} />
                  <DetailRow label="Verification" value={<VerificationBadge status={quotation.verification_status} size="sm" />} />
                  <DetailRow label="Submission Date" value={formatDateTime(quotation.submission_date)} />
                  <DetailRow label="Validity Date" value={formatDate(quotation.validity_date)} />
                  <DetailRow label="Currency" value={quotation.currency || 'KES'} />
                  <DetailRow label="Lowest Bid" value={isLowest ? 'Yes' : 'No'} />
                  <DetailRow label="Submission Method" value={quotation.submission_method_label || 'System'} />
                  <DetailRow label="Supplier Reference" value={quotation.supplier_reference_no || 'N/A'} />
                  <DetailRow label="Valid" value={isValid ? 'Yes' : 'No'} />
                </div>
              </CardContent>
            </Card>

            {/* Evaluation Notes */}
            {evalNotes && (
              <Card className="border shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Evaluation Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 rounded-lg border border-purple-200/50 dark:border-purple-800/30">
                    <p className="text-sm leading-relaxed">{evalNotes}</p>
                    {evalDate && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Evaluated on {formatDateTime(evalDate)}
                        {evalBy && ` by ${evalBy}`}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items Table - Scrollable */}
            <Card className="border shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      Quotation Items
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-sm">
                      {totalItems} item{totalItems > 1 ? 's' : ''} in this quotation
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ItemsTable items={quotation.items || []} isRejected={isRejected} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="border shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <ListChecks className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <DetailRow label="Total Amount" value={<span className="font-bold text-emerald-600 dark:text-emerald-400">KES {formatCurrency(quotation.total_amount)}</span>} />
                <DetailRow label="Tax Amount" value={`KES ${formatCurrency(quotation.tax_amount)}`} />
                <DetailRow label="Discount Amount" value={<span className="text-red-500 dark:text-red-400">-KES {formatCurrency(quotation.discount_amount)}</span>} />
                <DetailRow label="Net Amount" value={<span className="font-bold">KES {formatCurrency(quotation.net_amount)}</span>} />
                <DetailRow label="Total Items" value={totalItems} />
                <DetailRow
                  label="Evaluation Score"
                  value={
                    <span className={cn(
                      "font-bold",
                      evalScore >= 80 ? "text-emerald-600" :
                        evalScore >= 60 ? "text-amber-600" :
                          "text-red-600"
                    )}>
                      {evalScore > 0 ? `${evalScore}%` : 'Pending'}
                    </span>
                  }
                />
                <DetailRow label="Status" value={<StatusBadge status={quotation.status} size="sm" />} />
                <DetailRow label="Verification" value={<VerificationBadge status={quotation.verification_status} size="sm" />} />
                <DetailRow label="Lowest Bid" value={isLowest ? 'Yes' : 'No'} />
                <DetailRow label="Valid" value={isValid ? 'Yes' : 'No'} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4 text-gray-500" />
                  Print Quotation
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200"
                  onClick={() => setShowShareDialog(true)}
                >
                  <Share2 className="h-4 w-4 text-purple-500" />
                  Share Quotation
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                >
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 text-blue-500" />}
                  Download PDF
                </Button>
                {quotation.upload?.file_url && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all duration-200"
                    onClick={() => window.open(quotation.upload.file_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 text-emerald-500" />
                    View Uploaded PDF
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-md rounded-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Share Quotation</DialogTitle>
              <DialogDescription>
                Share this quotation with others via link.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">Link</Label>
                <Input
                  id="link"
                  defaultValue={`${window.location.origin}/procurement/supplier/quotations/${id}`}
                  readOnly
                  className="rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleCopyLink}
                className="px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(false)}
                className="rounded-lg"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTemplate>
  );
}
